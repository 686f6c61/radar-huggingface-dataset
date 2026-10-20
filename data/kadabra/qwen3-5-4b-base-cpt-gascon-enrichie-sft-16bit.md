# Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie-SFT-16Bit

## Resumen

El modelo `Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie-SFT-16Bit` es un ajuste fino de 16 bits publicado por el usuario Kadabra sobre una base de la familia Qwen3.5 (etiqueta de arquitectura `qwen3_5`), con 4.539.265.536 parametros (~4,54 B) en formato safetensors y un repositorio de 9,1 GB. El nombre del identificador encadena tres etapas habituales de post-entrenamiento —CPT (continued pre-training), Enrichie (enriquecido) y SFT (supervised fine-tuning)— y hace referencia explicita al gascon, una variedad romance minorizada; sin embargo, los metadatos solo declaran el idioma `en`. Esta discrepancia entre el nombre y la metadata es el primer punto que debe verificar cualquiera que quiera usarlo.

La model card es la plantilla automatica que genera Unsloth tras el entrenamiento: indica que el modelo se entreno "2x faster" con Unsloth y la libreria TRL de Hugging Face, pero no aporta informacion sobre composicion del dataset, numero de tokens, regimen de entrenamiento ni evaluaciones. No hay resultados de benchmarks, no hay demo y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, lo que lo situa en un estadio de publicacion inicial sin validacion externa.

Su relevancia potencial es doble: por un lado, como artefacto de investigacion para quienes trabajan en adaptacion de modelos multilingues a lenguas romanicas de bajos recursos; por otro, como ejemplo de pipeline de post-entrenamiento reproducible con Unsloth + TRL sobre una base de ~4,5 B, un tamano que cabe en GPU de consumo con cuantizacion. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidad multimodal, pero no hay documentacion que la confirme ni la detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (etiqueta `qwen3_5`); tipo de atencion y detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no disponible (sin indicios de arquitectura MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en FP16 y no se distribuyen GGUF, AWQ ni GPTQ |
| Idiomas soportados | `en` segun los metadatos del repositorio; el identificador menciona gascon, sin confirmacion documental |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (precision de 16 bits, ~9,1 GB de repositorio) |
| Pipeline declarado | `image-text-to-text` (implica entrada de imagen y texto; no documentado) |
| Librerias | transformers, text-generation-inference, unsloth |
| Modelo base declarado | `Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie-SFT-16Bit` (campo autorreferente) |
| Fecha de publicacion | 2026-10-19 |

## Arquitectura y entrenamiento

La unica informacion tecnica verificable es que se trata de un transformer de la familia Qwen3.5 con 4,54 B de parametros, pesos en FP16 y un pipeline declarado `image-text-to-text`. No se especifica el numero de capas, la dimension oculta, el tipo de atencion (completa, lineal o hibrida), la funcion de activacion ni si incorpora modulos especificos para vision. Tampoco se indica la longitud de contexto nativa, dato critico para cualquier evaluacion.

Respecto al entrenamiento, la model card solo confirma que se uso Unsloth junto con TRL, con una acelaracion declarada de 2x respecto a un entrenamiento estandar. No hay informacion sobre el volumen de tokens de la fase CPT, la composicion del corpus "enriquecido", la proporcion de datos en gascon frente a ingles, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o ORPO. El campo `base_model` apunta al propio modelo, lo que impide reconstruir la cadena de derivacion (que modelo Qwen3.5 original sirvio de punto de partida) y dificulta la trazabilidad y la reproducibilidad del ajuste.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el pipeline declarado.
- Posible procesamiento de imagen y texto combinados, derivado de la etiqueta `image-text-to-text`; sin documentacion que lo confirme ni ejemplos de uso.
- Capacidad de ajuste posterior: al ser un modelo pequeno en FP16, sirve como punto de partida para SFT adicional con Unsloth o TRL.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking): no disponible.
- Capacidades de audio: no disponible.
- Capacidades multilingues: los metadatos solo declaran `en`; el gascon aparece unicamente en el nombre del modelo, sin evidencia de evaluacion.

## Casos de uso

- Investigacion en lenguas romanicas minorizadas: el identificador sugiere un proceso de continued pre-training orientado al gascon, por lo que el modelo puede servir como base para experimentos de adaptacion de modelos de ~4,5 B a variedades con pocos recursos, comparando el efecto del CPT frente a un ajuste directo.
- Reproduccion de pipelines de post-entrenamiento: al estar entrenado con Unsloth y TRL y publicarse en FP16, es util como referencia para validar recetas de SFT de bajo coste en una sola GPU y para medir el impacto del pre-entrenamiento continuado.
- Generacion de texto en ingles para prototipado: con 4,54 B y licencia Apache 2.0, puede desplegarse en entornos de desarrollo para tareas de redaccion asistida o generacion de borradores, siempre que se valide previamente la calidad real del ajuste.
- Base para ajuste especifico de dominio: su tamano permite iterar rapidamente con LoRA o QLoRA sobre corpus propios (legal, medico, administrativo) en GPU de 24 GB, antes de escalar a modelos mayores.
- Experimentacion multimodal controlada: si se confirma la entrada de imagen declarada en el pipeline, podria emplearse en tareas de descripcion de imagenes o extraccion de texto en capturas, pero requiere verificacion empirica previa por la ausencia de documentacion.
- Evaluacion comparativa de sesgos y calidad linguistica: util como sujeto de estudio en trabajos que analizan como el CPT sobre una lengua minorizada afecta al rendimiento en la lengua mayoritaria del corpus.
- Docencia y formacion: ejemplo practico de ciclo completo (CPT + SFT + publicacion en FP16) para cursos de post-entrenamiento con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: los pesos ocupan aproximadamente 9,1 GB (4,54 B × 2 bytes); con cache KV y overhead de runtime, el consumo realista se situa en el rango de 11-13 GB para contextos moderados (estimacion aritmetica, no medida publicada).
- VRAM estimada con cuantizacion: no hay artefactos cuantizados publicados; una conversion a INT8 implicaria ~4,5 GB de pesos y a 4 bits ~2,3 GB, mas cache KV (calculo teorico, requiere que el usuario genere las cuantizaciones).
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S o RTX 4090 24 GB; tambien RTX 4080 16 GB y RTX 3090 24 GB con contextos contenidos.
- Cabe en GPU de consumo: si, en FP16 en tarjetas de 16 GB o mas (RTX 4090, 4080, 3090, 4060 Ti 16 GB); con cuantizacion a 8 o 4 bits cabria en GPU de 8-12 GB, condicionado a que la arquitectura `qwen3_5` sea compatible con los kernels de cuantizacion disponibles.
- Opciones de despliegue: transformers (soporte nativo declarado), TGI (etiqueta `text-generation-inference`), y previsiblemente vLLM si la arquitectura esta integrada en la version correspondiente; llama.cpp y Ollama solo si el usuario convierte los pesos a GGUF, sin garantia de soporte de la arquitectura.
- Requisito de version: se necesita una version de transformers que reconozca la arquitectura `qwen3_5`; no se especifica la version minima en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| Qwen3.5-4B-Base-CPT-Gascon-Enrichie-SFT-16Bit | 4,54 B | no disponible | Apache 2.0 | no disponible |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 | benchmarks publicos del autor |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 tokens | licencia comunitaria Llama 3.2 | benchmarks publicos del autor |
| Phi-3.5-mini-instruct | 3,82 B | 128.000 tokens | MIT | benchmarks publicos del autor |

La comparacion cuantitativa de rendimiento no es posible: el modelo de Kadabra no publica ninguna evaluacion. Frente a las alternativas de la tabla, su ventaja teorica es la especializacion linguistica derivada del CPT sobre gascon y su formato FP16 listo para reajuste; sus desventajas son la ausencia de contexto documentado, la falta de versiones cuantizadas y la inmadurez del repositorio (0 descargas). Para produccion en ingles, las alternativas consolidadas ofrecen garantias de soporte y evaluacion de las que este modelo carece.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, ni evaluacion humana, ni metricas de perplexidad que permitan estimar la calidad del ajuste.
- Model card incompleta: es la plantilla automatica de Unsloth; no documenta datos de entrenamiento, hiperparametros, tokens vistos ni procesos de alineacion.
- Inconsistencia de idioma: los metadatos declaran solo `en` mientras el identificador indica enriquecimiento en gascon; no se puede saber si el modelo genera gascon de forma competente ni si ha sufrido olvido catastrofico del ingles.
- Campo `base_model` autorreferente: impide reconstruir la ascendencia del modelo y verificar que base Qwen3.5 se uso, lo que rompe la trazabilidad de la licencia y de los datos.
- Riesgo de alucinacion: no cuantificado; en modelos pequenos sin evaluacion publicada el riesgo es alto, especialmente fuera del dominio de entrenamiento.
- Capacidad multimodal no documentada: el pipeline `image-text-to-text` sugiere vision, pero no hay ejemplos, resolucion de imagen soportada ni arquitectura de proyector descrita; usarlo con imagenes sin validacion previa es arriesgado.
- Sesgos desconocidos: al no publicarse la composicion del corpus de CPT y SFT, no es posible evaluar sesgos de genero, etnicos o politicos, ni la presencia de material con derechos de autor en el dataset.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se distribuye "tal cual", sin garantias, y la responsabilidad sobre el cumplimiento de derechos de los datos de entrenamiento recae en el usuario.
- Sin cuantizaciones oficiales ni soporte verificado en llama.cpp/Ollama: el despliegue eficiente exige trabajo adicional de conversion y validacion por parte del usuario.
- Madurez nula: 0 descargas y 0 likes; no hay comunidad, issues ni casos de uso reportados que sirvan de contraste.
- Contexto desconocido: planificar cargas de trabajo con documentos largos sin conocer la ventana real puede provocar truncamientos silenciosos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Kadabra/Qwen3.5-4B-Base-CPT-Gascon-Enrichie-SFT-16Bit)
- [Repositorio de Unsloth en GitHub](https://github.com/unslothai/unsloth)
- No se han encontrado en la informacion disponible articulos, papers, blogs, demos ni repositorios adicionales asociados a este modelo.
