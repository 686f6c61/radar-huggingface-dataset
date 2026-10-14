# Heronetic/heron1i-flash-lite-v2

## Resumen

heron1i-flash-lite-v2 es un modelo base de generacion de texto desarrollado por Heronetic LLC (autora: Marissa Tanner), entrenado desde cero y publicado en HuggingFace bajo el identificador Heronetic/heron1i-flash-lite-v2. Se trata de un transformer decoder-only de arquitectura propia y solo 9.924.188 parametros (aproximadamente 9,9 millones), lo que lo situa en la categoria de small language model, muy por debajo de los modelos convencionales de 1B o mas. Su ambito declarado es el ingles y el codigo.

El modelo se distribuye exclusivamente en formato safetensors para la libreria transformers y requiere cargarse con trust_remote_code=True, ya que la arquitectura no esta incluida en el catalogo estandar de transformers. Es un modelo base, no ajustado por instrucciones: continua texto en lugar de responder a ordenes, por lo que no admite formato de chat ni system prompt sin un ajuste posterior.

Su relevancia es acotada pero concreta: sirve como banco de pruebas de arquitecturas personalizadas en un rango de parametros que se ejecuta en CPU, movil o cualquier GPU integrada, y como punto de partida para experimentos de entrenamiento desde cero en entornos con recursos muy limitados. La version v2 es, segun la model card, un entrenamiento adicional sobre la misma arquitectura que heron1i-flash-lite, no un cambio de diseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con arquitectura personalizada (custom_code; requiere trust_remote_code=True) |
| Parametros totales | 9.924.188 (aproximadamente 9,9 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la model card. LLM Explorer indica 1.024 tokens para heron1i-flash-lite, la version previa con la misma arquitectura |
| Tipos de cuantizacion | No se publican variantes cuantizadas. Al distribuirse en safetensors para transformers, admite conversion a fp16, int8 e int4 con herramientas estandar |
| Idiomas soportados | Ingles y codigo (segun la model card) |
| Licencia | other (los terminos concretos no se detallan en la informacion disponible) |
| Formato de pesos | safetensors |
| Libreria de inferencia | transformers (con torch) |
| Pipeline | text-generation |
| Fecha de publicacion | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de arquitectura propia, entrenado desde cero por Heronetic LLC. La model card no detalla el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni el tipo de normalizacion o de activacion empleados, por lo que no es posible describir el bloque con precision. Tampoco se especifica si usa atencion completa, atencion lineal o alguna variante hibrida. El unico requisito declarado para cargarlo es disponer de torch y transformers, empleando trust_remote_code=True para importar la implementacion incluida en el repositorio.

En cuanto al entrenamiento, la informacion publicada se limita a indicar que es un modelo base entrenado desde cero sobre ingles y codigo, y que la v2 corresponde a un entrenamiento adicional sobre la misma arquitectura que heron1i-flash-lite. No se indica el volumen de tokens, la composicion del dataset, la mezcla de fuentes de codigo, ni si hubo fases de RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas asociadas, como decodificacion especulativa o mecanismos de atencion eficiente.

## Capacidades

- Generacion de texto en ingles: al ser un modelo base, completa secuencias y continua texto, sin seguir instrucciones ni respetar formatos conversacionales.
- Generacion de codigo: la model card lo declara explicitamente como modelo de ingles y codigo, aunque no se detallan los lenguajes de programacion cubiertos.
- Tareas de continuacion y modelado de lenguaje: apropiado para calcular probabilidades de secuencia y para experimentos de perplexidad.
- Ajuste fino posterior: al ser un modelo base, es el punto de partida natural para SFT, LoRA o DPO orientados a una tarea concreta.
- Tool calling: no soportado de forma nativa. No hay plantilla de chat ni entrenamiento en formato de llamada a funciones.
- Uso como agente o razonamiento multi-paso: no soportado. No hay modo thinking ni entrenamiento en cadenas de razonamiento.
- Capacidades multilingues: limitadas al ingles y codigo segun la model card; no se declaran otros idiomas.
- Vision, audio o multimodalidad: no soportado.
- Razonamiento matematico: evaluado con ArithMark-3, con un resultado de 36,70 en la escala publicada.

## Casos de uso

- Experimentacion con arquitecturas personalizadas: dado que la implementacion viaja dentro del repositorio y se carga con trust_remote_code=True, el modelo sirve como referencia reproducible para investigadores que quieran estudiar o modificar un transformer decoder-only de 9,9 M de parametros entrenado desde cero.
- Ajuste fino en hardware de gama baja: con 9,9 M de parametros, el ajuste completo cabe en una GPU consumer e incluso en CPU con paciencia, lo que permite usar el modelo como banco de pruebas para recetas de SFT, LoRA o cuantizacion sin coste de infraestructura.
- Generacion de texto en dispositivos embebidos o moviles: el peso en fp16 ronda las dos decenas de megabytes, por lo que puede desplegarse en entornos con memoria muy restringida donde un modelo de 1B no es viable.
- Autocompletado de codigo a muy pequeña escala: puede integrarse en prototipos que necesiten sugerencias de continuacion de fragmentos cortos, siempre que se acepte su baja calidad respecto a modelos especializados de codigo mucho mayores.
- Educacion e investigacion sobre entrenamiento desde cero: permite reproducir el ciclo completo (tokenizacion, preentrenamiento, evaluacion zero-shot con lm-evaluation-harness) en un solo equipo, algo imposible con modelos de escala superior.
- Generacion de datos sinteticos de bajo coste: puede usarse para producir texto de relleno o corpus auxiliares en pipelines de prueba, aceptando que la coherencia sera limitada.
- Evaluacion comparativa de harnesses: util para validar que un pipeline interno de evaluacion (lm-evaluation-harness con acc_norm) reproduce los valores publicados antes de escalar a modelos mayores.
- Clasificacion ligera por perplexidad: al ser un modelo base, puede emplearse para puntuar secuencias y construir clasificadores simples basados en verosimilitud en tareas de dominio muy acotado.

## Benchmarks y rendimiento

Resultados publicados en la model card, zero-shot con acc_norm mediante lm-evaluation-harness y el script oficial de ArithMark-3:

| Benchmark | Resultado |
|---|---:|
| HellaSwag | 28,86 |
| ARC-Easy | 38,89 |
| ARC-Challenge | 23,38 |
| PIQA | 58,54 |
| ArithMark-3 | 36,70 |
| Intelligence Index | 11,11 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible. Como referencia general de interpretacion, los baselines aleatorios habituales de estas tareas se situan en el 25 % para HellaSwag y ARC-Challenge y en el 50 % para PIQA, de modo que los valores obtenidos quedan en todos los casos en un entorno cercano a esos umbrales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 40 MB en fp32, 20 MB en fp16 y 10 MB en int8, calculados a partir de los 9,92 M de parametros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria, incluidas GTX 1050, GTX 1650, MX150, integradas tipo Intel Iris Xe o Apple Silicon. Tambien A100 y H100, aunque estan enormemente sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en cualquier GPU consumer, incluso en las mas antiguas. Tambien cabe holgadamente en RAM de sistema y se ejecuta en CPU sin problema.
- Opciones de despliegue: transformers con torch es la via soportada oficialmente, dado que requiere trust_remote_code=True. No se publican pesos en GGUF, por lo que su uso directo en llama.cpp u Ollama requeriria una conversion previa y la portabilidad de la arquitectura personalizada. vLLM y TGI no estan garantizados sin adaptar el codigo del modelo.
- Latencia y throughput estimados: no disponibles. Con 9,9 M de parametros y una ventana de contexto del orden de 1.000 tokens, la latencia esperada es de milisegundos por secuencia en GPU y de decimas de segundo en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---:|---|---|---|---|
| heron1i-flash-lite-v2 | 9,9 M | No disponible (1.024 tokens en la v1 segun LLM Explorer) | other | safetensors | HuggingFace, requiere trust_remote_code |
| heron1i-flash-lite | No disponible | 1.024 tokens (LLM Explorer) | other | safetensors | HuggingFace; misma arquitectura, entrenamiento anterior |
| GPT-2 small | 124 M | 1.024 tokens | MIT modificada | safetensors, GGUF y otros | Ampliamente desplegado en transformers, llama.cpp y Ollama |
| Pythia-70M | 70 M | 2.048 tokens | Apache-2.0 | safetensors | HuggingFace, transformers; suite de investigacion reproducible |

No se dispone de una comparacion de benchmarks homogenea entre estos modelos, ya que los resultados publicados por cada uno proceden de configuraciones de evaluacion distintas. La comparativa anterior se limita, por tanto, a especificaciones tecnicas y disponibilidad.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no respondera correctamente a preguntas directas ni respetara formatos de chat. Cualquier uso conversacional exige un ajuste fino previo.
- Riqueza linguistica muy limitada: con 9,9 M de parametros, la coherencia a nivel de parrafo es baja y la generacion larga tiende a degenerar o a repetir.
- Riesgo alto de alucinacion: al no estar alineado ni anclado a fuentes, puede producir afirmaciones factualmente incorrectas sin ninguna senal de incertidumbre.
- Idiomas: solo ingles y codigo segun la model card. No hay soporte declarado de castellano ni de otros idiomas.
- Contexto reducido: la referencia disponible para la arquitectura apunta a unos 1.024 tokens en la version previa, lo que limita el uso con documentos largos o conversaciones multi-turno extensas.
- Licencia restrictiva o indeterminada: la licencia figura como other y los terminos concretos no se detallan en la informacion disponible. Antes de cualquier uso comercial es imprescindible revisar el archivo de licencia del repositorio y contactar con Heronetic LLC.
- Dependencia de codigo remoto: cargar el modelo exige trust_remote_code=True, lo que implica ejecutar codigo arbitrario incluido en el repositorio. Conviene auditar la implementacion antes de usarla en produccion.
- Ecosistema limitado: sin pesos GGUF publicados, sin cuantizaciones oficiales y sin soporte confirmado en vLLM, TGI o llama.cpp, el despliegue queda practicamente restringido a transformers.
- Madurez y adopcion: cero descargas y dos likes en el momento de la consulta, sin documentacion tecnica adicional ni resultados reproducidos por terceros.
- Sesgos: no hay informacion publicada sobre composicion del dataset ni sobre evaluaciones de sesgo, por lo que no es posible caracterizar los sesgos del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Heronetic/heron1i-flash-lite-v2
- Modelo predecesor, misma arquitectura: https://huggingface.co/Heronetic/heron1i-flash-lite
- Ficha de heron1i-flash-lite en LLM Explorer (contexto de 1K, comparativa de benchmarks y despliegue): https://llm-explorer.com/model/Heronetic%2Fheron1i-flash-lite,1B34jQbWMZMRUcCNcBMVB9
- Repositorio heron-ai (proyecto de agentes en Go de un autor independiente; no vinculado a Heronetic LLC): https://github.com/janostudio/heron-ai
- Heronic Technologies (empresa distinta, productos FPGA; no vinculada a Heronetic LLC): https://www.heronic.ai/products/
- Lista de modelos open-weight para seguridad ofensiva (no relacionada con este modelo): https://github.com/JoasASantos/Offensive-Security-AI-Models
