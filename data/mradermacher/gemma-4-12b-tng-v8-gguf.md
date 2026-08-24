# mradermacher/gemma-4-12B-TNG-V8-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `nightmedia/gemma-4-12B-TNG-V8`, un fine-tune de la familia Gemma 4 12B de Google, preparadas por mradermacher para su uso con herramientas como llama.cpp, Ollama o vLLM. El modelo base, desarrollado por nightmedia, incorpora etiquetas que sugieren especialización en generación de código y temática Star Trek, aunque no se dispone de documentación oficial que detalle el proceso de fine-tuning o las capacidades exactas.

La relevancia de esta publicación radica en ofrecer versiones cuantizadas (Q2_K a Q8_0) que permiten ejecutar un modelo de aproximadamente 11,9 mil millones de parámetros en hardware de consumo, reduciendo los requisitos de VRAM y memoria. Al tratarse de una cuantización estática, se prioriza la compatibilidad y la velocidad frente a la precisión máxima, con un equilibrio que depende del tipo de cuantización elegido.

La licencia declarada es Apache-2.0, aunque el enlace a la licencia de Gemma 4 sugiere que pueden aplicarse términos adicionales de la licencia original de Google. El idioma soportado es el inglés, según la metadata del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, sin confirmar) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a licencia Gemma 4) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `nightmedia/gemma-4-12B-TNG-V8`. Los metadatos indican que se trata de un fine-tune (etiqueta `finetune`) de un modelo de la serie Gemma 4, con etiquetas adicionales como `startrek` y `coding`, lo que sugiere una especializacion en esos dominios. Sin embargo, no se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO.

La cuantizacion GGUF realizada por mradermacher es estatica, lo que implica que los pesos se convirtieron a precision reducida sin recalibracion con datos de entrenamiento. Esto puede provocar una ligera degradacion de la calidad en comparacion con el modelo original en punto flotante, especialmente en cuantizaciones agresivas como Q2_K.

## Capacidades

No se han especificado capacidades concretas en la informacion disponible. Dado que el modelo base es un fine-tune de Gemma 4 12B, es razonable esperar capacidades de generacion de texto, razonamiento y posiblemente generacion de codigo, pero no hay confirmacion oficial. Las etiquetas `coding` y `startrek` sugieren un enfoque en esos ambitos, pero no se detallan funciones como tool calling, agentes o multimodalidad.

## Casos de uso

No se dispone de informacion especifica sobre casos de uso recomendados por el autor. Sin embargo, por el tamano del modelo (12B) y las cuantizaciones ofrecidas, podria emplearse en entornos locales para:

- Generacion de codigo asistida en entornos de desarrollo integrado (IDE) con recursos limitados.
- Creacion de chatbots conversacionales tematicos (por ejemplo, relacionados con Star Trek) en aplicaciones de demostracion.
- Prototipado rapido de aplicaciones de procesamiento de lenguaje natural en equipos de consumo.
- Experimentacion academica con modelos de tamano medio en configuraciones de un solo GPU.

Estas sugerencias son inferencias basadas en el tamano y las etiquetas, no en documentacion oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su version cuantizada.

## Requisitos de hardware

Los requisitos dependen del tipo de cuantizacion elegido. A partir del tamano de los archivos GGUF, se estima la VRAM necesaria para cargar el modelo en memoria (sin considerar overhead de contexto ni capas de atencion):

- Q2_K (4,9 GB): cabe en GPUs con 6 GB de VRAM, como una GTX 1660 o RTX 2060.
- Q3_K_S (5,6 GB): requiere al menos 8 GB de VRAM (RTX 3060, RTX 4060).
- Q3_K_M (6,2 GB): similar a Q3_K_S, recomendable 8 GB o mas.
- Q4_K_S (7,1 GB): recomendado para GPUs de 8-10 GB (RTX 3080, RTX 4070).
- Q6_K (9,9 GB): necesita 12 GB o mas (RTX 3090, RTX 4080).
- Q8_0 (12,8 GB): requiere 16 GB de VRAM (RTX 4090, A100 40GB).

Para inferencia en CPU, se puede usar llama.cpp con suficiente RAM (el archivo debe caber en memoria). No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos. El modelo base no tiene documentacion publica que permita contrastar parametros, rendimiento o licencia con alternativas como Gemma 4 12B original, Llama 3.1 8B o Mistral 7B. Se recomienda consultar el repositorio del modelo base para obtener datos adicionales.

## Limitaciones y advertencias

- Al ser una cuantizacion estatica, puede haber perdida de precision en tareas que requieren matices, especialmente con Q2_K y Q3_K.
- No se ha verificado la calidad del fine-tune; el modelo base es de un autor no oficial y podria contener sesgos o comportamientos indeseados.
- La licencia declarada como Apache-2.0 puede no ser la unica aplicable; el enlace a la licencia de Gemma 4 sugiere que se deben revisar los terminos de Google, que incluyen restricciones de uso comercial y de despliegue en ciertos escenarios.
- El modelo solo soporta ingles, lo que limita su uso en otros idiomas.
- No hay garantias de soporte o actualizaciones por parte del autor de la cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-12B-TNG-V8-GGUF
- Modelo base: https://huggingface.co/nightmedia/gemma-4-12B-TNG-V8
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/gemma-4-12B-TNG-V8-i1-GGUF
- Blog de Google sobre Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Guia para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Pagina oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
