# mradermacher/jais-family-13b-i1-GGUF

## Resumen

El modelo `mradermacher/jais-family-13b-i1-GGUF` es una cuantización en formato GGUF del modelo bilingüe árabe-inglés Jais-family-13b, desarrollado originalmente por Inception (parte de G42). Esta versión concreta, publicada por mradermacher, aplica cuantización con importancia (imatrix) para optimizar la relación calidad-tamaño en inferencia local, ofreciendo una amplia gama de niveles de compresión que van desde IQ1_S (4,1 GB) hasta Q6_K (11,8 GB). El modelo base es un transformer decoder causal con 13.462 millones de parámetros, entrenado desde cero con arquitectura SwiGLU y codificación posicional ALiBi, lo que le permite extrapolar a secuencias largas. Su relevancia actual radica en que es uno de los pocos modelos de gran tamaño optimizados específicamente para árabe, con capacidades sólidas en inglés, y esta versión cuantizada lo hace accesible para ejecutarse en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con SwiGLU y ALiBi (segun modelo base) |
| Parametros totales | 13.462.730.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta extrapolacion larga gracias a ALiBi, pero no se especifica el valor exacto) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q3_K_L, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Jais-family-13b es un transformer decoder causal entrenado desde cero, que incorpora dos innovaciones arquitectonicas clave: la funcion de activacion SwiGLU y la codificacion posicional ALiBi (Attention with Linear Biases). ALiBi permite que el modelo extrapole a longitudes de secuencia superiores a las vistas durante el entrenamiento, mejorando el manejo de contextos largos sin necesidad de ajustes posicionales adicionales. El entrenamiento se realizo con datos bilingues arabe e ingles, priorizando el rendimiento en arabe manteniendo capacidades solidas en ingles. Esta version cuantizada no modifica la arquitectura, solo comprime los pesos mediante cuantizacion con matriz de importancia (imatrix), que asigna mas precision a las capas y canales que mas influyen en la salida del modelo, reduciendo la perdida de calidad frente a cuantizaciones estaticas convencionales.

## Capacidades

- Generacion de texto en arabe e ingles, con fluidez y coherencia en ambos idiomas.
- Razonamiento y comprension de lenguaje natural, incluyendo tareas de respuesta a preguntas, resumen y analisis de sentimiento.
- Soporte de codigo y matematicas basicas, aunque no es su especialidad principal.
- Capacidad de extrapolacion a contextos largos gracias a ALiBi, aunque el limite exacto no esta documentado en esta version.
- No se ha confirmado soporte explicito de tool calling, function calling ni modo agente en la informacion disponible.
- No incluye capacidades multimodales (vision, audio) ni modo thinking explicito.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno en dialectos arabes y arabe moderno estandar, con una ventana de contexto ampliable gracias a ALiBi, lo que permite mantener el historial de la conversacion sin perder informacion relevante.
- Traduccion automatica arabe-ingles e ingles-arabe: su entrenamiento bilingue equilibrado lo hace adecuado para traducir documentos, correos y contenido web con matices culturales y linguisticos propios de la region.
- Generacion de contenido editorial en arabe: redaccion de articulos, noticias y publicaciones en redes sociales con estilo natural, util para medios de comunicacion y equipos de marketing que operan en el mundo arabe.
- Analisis de sentimiento y moderacion de contenido: clasificacion de opiniones y deteccion de discurso de odio en textos arabes, una tarea donde los modelos genericos suelen fallar por falta de datos especificos.
- Asistente virtual para educacion: explicacion de conceptos, generacion de ejercicios y respuesta a dudas en arabe, aprovechando su capacidad de razonamiento y su conocimiento bilingue.
- Procesamiento de documentos legales y administrativos: extraccion de informacion, resumen y redaccion de textos formales en arabe, con la ventaja de poder ejecutarse localmente en servidores privados gracias a la cuantizacion GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Jais-family-13b ha sido evaluado en tareas de comprension y generacion en arabe e ingles, pero los numeros concretos no se incluyen en esta ficha. Se recomienda consultar la documentacion oficial de Inception para datos de MMLU, ArabicMMLU, HumanEval u otros benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4,1 GB (cuantizacion i1-IQ1_S) y 11,8 GB (i1-Q6_K) para los pesos, mas overhead de contexto y calculos. Para uso comodo con contexto largo, se recomienda al menos 8 GB de VRAM con cuantizaciones Q4_K_M o superiores.
- GPU recomendadas: tarjetas de consumo como RTX 3060 12GB, RTX 4060 Ti 16GB o RTX 4090 pueden ejecutar las cuantizaciones mas bajas; para Q5_K_M y Q6_K se necesitan GPUs con 12-16 GB de VRAM. En entornos profesionales, A100 40GB o H100 son adecuadas para multiples instancias.
- Si cabe en consumer GPU: si, las cuantizaciones IQ2 e IQ3 caben en GPUs de 6-8 GB, y las Q4 en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para servidores, se puede usar llama-cpp-python o integrar con vLLM mediante conversion a otro formato (aunque GGUF no es el formato nativo de vLLM).
- Latencia y throughput: no se han publicado mediciones especificas para esta cuantizacion. En una RTX 4090 con Q4_K_M, se puede esperar una generacion de 20-40 tokens por segundo, dependiendo del contexto y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Jais-family-13b (base) | 13.462 M | no disponible (ALiBi) | ar, en | Apache 2.0 | safetensors |
| mradermacher/jais-family-13b-i1-GGUF | 13.462 M | no disponible (ALiBi) | ar, en | Apache 2.0 | GGUF |
| Jais-family-30b (si existe) | no disponible | no disponible | ar, en | no disponible | no disponible |
| AceGPT-13B (alternativa arabe) | 13B | 4K | ar, en | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La principal diferencia de esta version es su formato GGUF con cuantizacion imatrix, que facilita el despliegue local frente al modelo base en safetensors.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado principalmente con datos arabes e ingleses, puede reflejar sesgos culturales y regionales de esas comunidades. No se ha publicado una evaluacion exhaustiva de sesgos.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en temas de actualidad o datos especificos. Se recomienda verificacion humana en aplicaciones criticas.
- Limitaciones de contexto: aunque ALiBi permite extrapolacion, el rendimiento puede degradarse en secuencias muy largas (mas alla de 8K-16K tokens) sin un ajuste fino especifico. El valor exacto no esta documentado.
- Limitaciones de idioma: el modelo esta optimizado para arabe moderno estandar y ingles; los dialectos arabes regionales pueden tener un rendimiento inferior.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha. Se recomienda revisar la licencia del modelo original.
- Caveat para produccion: las cuantizaciones muy bajas (IQ1, IQ2) presentan una perdida de calidad notable y solo deben usarse en entornos de prueba o cuando el hardware es muy limitado. Para produccion, se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/jais-family-13b-i1-GGUF
- Repositorio HuggingFace del modelo base: https://huggingface.co/inception42/jais-family-13b
- Version con cuantizaciones estaticas: https://huggingface.co/mradermacher/jais-family-13b-GGUF
- Proyecto Docker de ejemplo: https://github.com/sarmadjari/jais-ai-docker
- Pagina de referencia del modelo (aibase): https://model.aibase.com/models/details/1924737589525614592
