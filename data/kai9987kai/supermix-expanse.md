# Kai9987kai/supermix-expanse

## Resumen

Supermix Expanse es un modelo experimental de generacion de texto de 132,6 millones de parametros publicado por el usuario Kai9987kai en HuggingFace. No es un transformer convencional: se construye mediante una tecnica que el autor denomina *model grafting*, en la que un tronco de 6 capas con atencion y mezcla de expertos (MoE) sirve de soporte para injertar cuatro fuentes heterogeneas: el modelo propio Archimedes final, la rama congelada Omni Collective v7 Frontier (77,6 M), expertos MoE extraidos de las MLP de Qwen2.5-Coder-7B-Instruct y de BioMedLM 2.7B, y un nucleo recurrente que reproduce el conectoma completo del sistema nervioso central de la mosca Drosophila macho (Janelia male CNS v1.0).

El modelo resuelve un problema de investigacion mas que de producto: explora si es posible transferir conocimiento de profesores grandes a un modelo diminuto mediante destilacion mas injerto de pesos, y si un grafo biologico real (3.830.931 aristas tipo→tipo, 122,3 millones de sinapsis tipadas) puede actuar como modulo recurrente causal dentro de una red neuronal. Es relevante ahora porque documenta de forma inusualmente honesta los limites del injerto: solo 1 de los 32 expertos injertados reproduce su grupo de neuronas profesor en tokens retenidos, y los mapas profesor→estudiante tienen un R² de retencion de 0,05 a 0,15.

Se trata de un modelo en estado experimental, entrenado en su totalidad en la CPU de un Snapdragon X Plus, sin GPU, con 0 descargas y 0 likes en el momento de la consulta. La model card advierte explicitamente de que las nuevas capacidades de codigo y biomedicina son debiles tras una unica ejecucion de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tronco transformer de 6 capas con atencion y MoE, mas injertos: FlyCore (22 cerebros de mosca, causal), Omni v48/v38, rama congelada Omni v7 (77,6 M) y nucleo del conectoma del SNC de Drosophila macho |
| Parametros totales | 132,6 M |
| Parametros activos | no disponible (MoE con 88 ranuras en las capas 1-2, sin desglose de activacion por token) |
| Longitud de contexto | no disponible (el entrenamiento usa secuencias de 128 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | supermix-expanse-composite (license_name personalizado, license: other, LICENSE.md) |
| Formato de pesos | PyTorch (no se especifica safetensors ni GGUF) |

Datos adicionales: el tokenizador es a nivel de palabra, con un vocabulario de 10.951 palabras y embeddings de 320 dimensiones. El repositorio ocupa 0,6 GB.

## Arquitectura y entrenamiento

El flujo del modelo es el siguiente: el prompt pasa por un tokenizador de palabras y embeddings de 320 dimensiones; las capas 0-2 del tronco aplican atencion y MoE (que pasan de 72 a 88 ranuras tras el injerto); despues de la capa 2 se situa el punto de injerto, donde cada rama escribe a traves de una compuerta inicializada a cero. Las ramas son FlyCore (22 cerebros de mosca), los codificadores de prompt Omni v48/v38, la rama congelada Omni v7 y el nucleo del SNC de la mosca macho. Las capas 3-5 aplican atencion global y MoE, y despues un nucleo de pensamiento con el SNC v93 produce la siguiente palabra.

El componente mas singular es el nucleo del conectoma: el estado de la capa 2 de cada token activa los 1.277 tipos celulares sensoriales, visuales y ascendentes; la actividad recorre 4 pasos recurrentes por las 3.830.931 aristas tipo→tipo (122,3 millones de sinapsis tipadas), ponderadas por su fraccion de entrada medida y con signo segun el neurotransmisor presinaptico (ley de Dale); los 713 tipos descendentes, motores y eferentes se leen, se normalizan por RMS y se reescriben mediante una compuerta inicializada a cero. El cableado y los signos son fijos; solo se aprenden la ganancia, el sesgo y la fuga por tipo, mas las proyecciones de entrada y salida. El radio espectral de |W| es 0,90, y el diseno es causal y exacto con cache KV.

Los expertos injertados son 96 neuronas extraidas de las MLP de las capas 0-1 de Qwen2.5-Coder-7B y BioMedLM, con mapas ridge entre estados de un solo token, seleccion de neuronas por contribucion ponderada por dominio, inicializacion fold-in (SwiGLU para Qwen; GELU emulado como `silu(1.702z)/1.702` para BioMedLM), refinamiento por ajuste de funcion local y sesgos de activacion ajustados a la carga. Nacen dormidos y se despiertan entre el 10 % y el 50 % del entrenamiento. El autor reconoce que los mapas profesor→estudiante son debiles (R² de retencion 0,05-0,15) y que solo 1 de 32 expertos reproduce su grupo de neuronas profesor (Qwen capa 0, R² 0,21); los otros 31 arrancan con fuerza de escritura 0,1×. La mayor parte del conocimiento transferido proviene por tanto de la destilacion, no de los pesos.

El entrenamiento se divide en dos etapas: la construccion (13,6 minutos) y la destilacion mas ajuste fino (3.221 pasos, batch de 8, 128 tokens, 235 minutos en una CPU Snapdragon X Plus, sin GPU). El conjunto de datos son 13.799 filas: 3.554 de repeticion de Archimedes, 1.438 de mosca autodestiladas, 1.421 de codigo de Qwen, 1.386 de biomedicina de BioMedLM y 6.000 de hechos del conectoma. La perdida combina LM, 0,5·KL (T=2) contra Archimedes congelado sobre los 32 logits principales cacheados, 0,2·KL de intencion/dominio de Omni v7, y KL de consenso de mosca mas MSE de sentido. Se usa LR 3e-5 en el tronco y 2e-4 en los injertos, con coseno, 5 % de calentamiento y recorte de gradiente de 1,0. Los controles de calidad incluyen un sandbox con lista blanca de AST (92,8 % de respuestas de codigo aceptadas), juicio de Qwen-Coder sobre definiciones de BioMedLM (94 % aceptadas) y filtrado de PubMedQA por etiqueta experta.

## Capacidades

- Generacion de texto autoregresiva a nivel de palabra, con un vocabulario cerrado de 10.951 palabras.
- Repeticion y conservacion de las capacidades del modelo Archimedes original, del que Expanse es continuacion directa.
- Codigo: dispone de 1.421 filas de codigo verificadas en sandbox y 16 expertos injertados procedentes de Qwen2.5-Coder-7B-Instruct, pero el autor califica la capacidad nueva de debil.
- Biomedicina: 1.386 filas filtradas y 16 expertos injertados procedentes de BioMedLM 2.7B, con la misma advertencia de debilidad.
- Conocimiento factual sobre el conectoma del SNC de la mosca macho (6.000 filas de hechos).
- Procesamiento de actividad en un grafo biologico de 11.751 tipos celulares, como modulo interno diferenciable y causal.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- No se documenta capacidad multilingue ni modo de pensamiento separado, vision o audio.
- Inferencia con cache KV exacta gracias a la correccion de la fuga de causalidad de FlyCore.

## Casos de uso

- Investigacion sobre injerto de modelos: Expanse es un banco de pruebas reproducible para medir cuanto conocimiento se transfiere realmente al injertar neuronas de un profesor grande en un estudiante pequeno. El autor publica R² de retencion de 0,05-0,15, lo que permite estudiar donde falla la tecnica.
- Estudio de redes biologicas embebidas en redes neuronales: el nucleo del conectoma permite experimentar con propagacion recurrente sobre las 3.830.931 aristas del SNC de Drosophila macho dentro de un modelo de lenguaje, y comparar el efecto de la ganancia, el sesgo y la fuga aprendidos por tipo celular.
- Reproduccion de experimentos de destilacion con multiples profesores: la combinacion de KL contra Archimedes congelado, KL de intencion/dominio de Omni v7 y KL de consenso de mosca sirve como plantilla para quienes quieran replicar esquemas de destilacion multi-profesor en CPU.
- Docencia y divulgacion: el modelo ilustra de forma tangible conceptos como ley de Dale, radio espectral, compuertas inicializadas a cero o mapas ridge entre representaciones, con un coste de computo (235 minutos en CPU) asequible para un aula o un portatil.
- Auditoria de causalidad y cache KV: los dos fallos documentados y corregidos respecto a Archimedes (mean-pooling sobre todas las posiciones y discrepancia entre decodificacion con cache y forward completo) son un caso de estudio util para quienes implementan decodificacion con cache.
- Analisis de robustez de filtros de datos: los controles descritos (sandbox con lista blanca de AST, juicio por modelo, capping por sesgo de etiqueta) son un ejemplo practico de como detectar y mitigar conjuntos de datos sesgados, como el caso de BioMedLM respondiendo "si" a casi todo.
- No se recomienda su uso en produccion ni en aplicaciones orientadas a usuario final: se trata de un modelo experimental de investigacion con 0 descargas y capacidades nuevas debiles segun su propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una tabla de perdida de desarrollo por fuente (en nats/token sobre tokens de respuesta, con filas de desarrollo retenidas), pero el contenido extraido se corta en la cabecera de la tabla (`| source | step 0`), por lo que no es posible reproducir las cifras. Los unicos numeros de evaluacion presentes en la informacion proporcionada son:

| Metrica | Valor | Contexto |
|---|---|---|
| Tasa de aprobacion del sandbox de codigo | 92,8 % | Filas de codigo de Qwen conservadas tras pasar tests propios en subproceso aislado con lista blanca de AST |
| Aceptacion de definiciones de BioMedLM | 94 % | Juzgadas por Qwen-Coder (el autor lo califica de juez indulgente) |
| Precision retenida de BioMedLM en PubMedQA | 59,3 % | Frente a una linea base de 60,5 % que responde siempre "si" |

## Requisitos de hardware

- Parametros: 132,6 M, por lo que el modelo es muy ligero en memoria. En fp32 ocuparia del orden de 0,5 GB y en fp16 del orden de 0,27 GB, sin contar el estado del optimizador ni las estructuras del conectoma.
- Entrenamiento documentado: una CPU Snapdragon X Plus sin GPU, 235 minutos para 3.221 pasos. La etapa de construccion tardo 13,6 minutos.
- Inferencia en CPU: viable, dado que el modelo se entreno integramente en CPU.
- GPU: cabe en cualquier GPU de consumo. No se especifican requisitos minimos ni modelos recomendados en la informacion disponible.
- VRAM estimada: no disponible de forma oficial; por tamano de parametros, cualquier GPU con 2 GB o mas deberia ser suficiente en fp16.
- Opciones de despliegue: la libreria declarada es PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni existen pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No existe una categoria estricta de comparacion: Expanse combina un tronco propio de 132,6 M con injertos de modelos de tamanos muy distintos. La tabla siguiente recoge los modelos citados en su model card.

| Modelo | Parametros | Papel en Expanse | Licencia | Disponibilidad |
|---|---|---|---|---|
| Supermix Expanse | 132,6 M | Modelo final | supermix-expanse-composite | HuggingFace, formato PyTorch |
| Archimedes final | no disponible | Tronco base y profesor congelado anti-olvido | no disponible | HuggingFace (Kai9987kai/archimedes-final-model) |
| Supermix Omni Collective v7 Frontier | 77,6 M | Rama congelada puenteada al flujo residual | no disponible | HuggingFace |
| Qwen2.5-Coder-7B-Instruct | 7 B | Profesor de codigo (1.500 filas verificadas, 16 expertos injertados) | no disponible en la informacion proporcionada | HuggingFace (Qwen) |
| BioMedLM | 2,7 B | Profesor biomedico (1.386 filas filtradas, 16 expertos injertados) | no disponible en la informacion proporcionada | HuggingFace (stanford-crfm) |

Comparacion de rendimiento: no disponible. No se han publicado resultados de benchmarks comparativos entre Expanse y estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Estado experimental explicito: la model card califica Expanse de "modelo de investigacion experimental" y advierte de que sus nuevas capacidades de codigo y biomedicina son debiles tras una unica ejecucion de entrenamiento en CPU.
- Injerto poco efectivo: los mapas profesor→estudiante tienen un R² de retencion de 0,05-0,15, solo 1 de 32 expertos injertados reproduce su grupo de neuronas profesor, y 31 de ellos arrancan con fuerza de escritura 0,1×. El autor reconoce que el conocimiento transferido proviene sobre todo de la destilacion.
- Sesgo en datos biomedicos: BioMedLM tiende a responder "si" a casi todo, y su precision retenida en PubMedQA (59,3 %) queda por debajo de la linea base trivial de responder siempre "si" (60,5 %). El autor admite que el juez de calidad de definiciones (Qwen-Coder) es indulgente.
- Limitacion de vocabulario: el tokenizador es a nivel de palabra con 10.951 palabras, lo que restringe severamente la cobertura lexica y el manejo de palabras poco frecuentes, neologismos, errores tipograficos o identificadores de codigo.
- Longitud de contexto: no publicada, y el entrenamiento usa secuencias de 128 tokens, lo que limita el uso en conversaciones largas o documentos extensos.
- Idiomas: no disponibles. No hay evidencia de soporte multilingue.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual fuera del conectoma y de los datos filtrados; con 13.799 filas de entrenamiento, la cobertura de conocimiento general es muy reducida.
- Licencia: la licencia es un compuesto personalizado (supermix-expanse-composite) definido en LICENSE.md. Al derivar de Qwen2.5-Coder-7B-Instruct y BioMedLM, cuyas condiciones no se detallan en la informacion proporcionada, es imprescindible revisar LICENSE.md y las licencias de los modelos base antes de cualquier uso, especialmente comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Contenido sensible: el modelo se ha entrenado con hechos sobre el conectoma del SNC de Drosophila macho y con datos biomedicos filtrados; no hay garantia de exactitud en dominios clinicos.
- Sin soporte de despliegue estandar: no hay pesos GGUF ni integraciones documentadas con vLLM, llama.cpp, Ollama o TGI, lo que complica su puesta en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kai9987kai/supermix-expanse
- Modelo base Archimedes final: https://huggingface.co/Kai9987kai/archimedes-final-model
- Modelo base Supermix Omni Collective v7 Frontier: https://huggingface.co/Kai9987kai/supermix-omni-collective-v7-frontier
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Modelo base BioMedLM: https://huggingface.co/stanford-crfm/BioMedLM
- Conjunto de datos PubMedQA: https://huggingface.co/datasets/qiaojin/PubMedQA
- Conectoma male CNS v1.0 (repositorio natverse/malecns): https://github.com/natverse/malecns
- Portal del conectoma male CNS de Janelia: https://male-cns.janelia.org/
- Archivo de licencia del modelo: LICENSE.md (en el repositorio de HuggingFace)
- Recibo de verificacion del injerto: `supermix_expanse_grafted.receipt.json` (en el repositorio de HuggingFace)
