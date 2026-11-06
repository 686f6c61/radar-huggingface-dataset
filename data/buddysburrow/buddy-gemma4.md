# buddysburrow/buddy-gemma4

## Resumen

Buddy's brain es una redistribución en formato GGUF del modelo Gemma 4 26B-A4B de Google, empaquetada por el desarrollador buddysburrow para la aplicación iOS Buddy. No se trata de un modelo entrenado desde cero, sino de una reorganización específica de los ficheros GGUF publicados por Unsloth y ggml-org, pensada para que la app descargue los pesos y los ejecute en el propio teléfono. La arquitectura subyacente es la del Gemma 4 26B-A4B, un transformer con mezcla de expertos (MoE) de 26 000 millones de parámetros totales y aproximadamente 4 000 millones activos por token, según la nomenclatura del modelo base.

La peculiaridad del paquete es la separación entre una parte "residente" (siempre cargada en memoria, cuantizada a 5 bits a partir del UD-IQ2_M de Unsloth) y un fichero de expertos que se lee desde almacenamiento flash (cuantizado UD-IQ3_S), acompañado de un JSON que indica la posición de cada experto. Incluye además un proyector de visión en Q8_0 basado en el mmproj de ggml-org, lo que habilita entrada multimodal de imágenes.

El modelo es relevante como ejemplo de despliegue on-device de un MoE grande mediante cuantización agresiva y paginación de expertos desde disco. La licencia Apache 2.0 del modelo base se mantiene. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el pipeline no está declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según el modelo base google/gemma-4-26B-A4B-it |
| Parametros totales | 26B (modelo base); el campo safetensors del repo indica 572.794.416, correspondiente al proyector de visión u otro componente auxiliar, no al modelo completo |
| Parametros activos | ~4B (por la nomenclatura A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Parte residente: 5 bits (desde UD-IQ2_M); expertos: UD-IQ3_S; proyector de visión: Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero residente, fichero de expertos y JSON de índices); proyector de visión GGUF Q8_0 |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 26B-A4B, un transformer con mezcla de expertos desarrollado por Google. La nomenclatura A4B indica aproximadamente 4 000 millones de parámetros activos por token sobre un total de 26 000 millones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base, más allá de lo que publique Google en su documentación oficial.

La innovación de este paquete concreto es el esquema de despliegue: la parte residente del modelo se mantiene cargada en memoria con una cuantización de 5 bits, mientras que los expertos se almacenan en un fichero aparte y se leen desde flash bajo demanda, guiados por un índice JSON. Este diseño reduce la huella de memoria en el dispositivo a costa de latencia de acceso a disco. El proyector de visión en Q8_0 añade capacidad multimodal. No se documentan innovaciones de decodificación especulativa ni de atención lineal específicas de este empaquetado.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Gemma 4 26B-A4B.
- Procesamiento de imágenes mediante el proyector de visión incluido (fichero buddy-gemma4-26b-eyes-Q8_0.gguf).
- Ejecución on-device en iOS: la app descarga los ficheros y los ejecuta en el teléfono.
- Carga selectiva de expertos desde almacenamiento flash, lo que permite operar un MoE de 26B en un dispositivo con memoria limitada.
- Capacidades de tool calling, agentes o modo de razonamiento extendido: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional on-device en iOS: la app Buddy descarga el paquete y ejecuta el modelo localmente, sin enviar datos a servidores, aprovechando la separación entre parte residente y expertos para ajustarse a la memoria del teléfono.
- Procesamiento de imágenes en el dispositivo: el proyector Q8_0 permite describir o analizar fotos capturadas por el usuario sin salir del terminal.
- Privacidad por diseño en aplicaciones móviles: al ejecutarse íntegramente en el dispositivo, es adecuado para casos donde no se puede enviar contenido sensible a la nube.
- Prototipado de despliegues MoE con paginación de expertos: sirve como referencia técnica para ingenieros que quieran replicar el esquema residente/expertos en otras plataformas con llama.cpp.
- Inferencia offline: útil en entornos sin conectividad donde se requiere un asistente de texto y visión local.
- Distribución de modelos grandes en apps móviles: el esquema de ficheros separados con índice JSON facilita la descarga incremental y la gestión de almacenamiento en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: no disponible de forma exacta; el repo ocupa 11,8 GB, repartidos entre parte residente, expertos y proyector de visión.
- El diseño está pensado para ejecución en iPhone con lectura de expertos desde flash, no para GPU de escritorio.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No hay datos específicos; el tamaño del repo (11,8 GB) sugiere que podría caber en GPUs con 12-16 GB de VRAM si se carga completo, pero el esquema de paginación está orientado a móvil.
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF; la app Buddy lo ejecuta en iOS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| buddy-gemma4 (este) | 26B totales / ~4B activos (modelo base) | no disponible | Apache 2.0 | GGUF dividido | Empaquetado para iOS con expertos en flash |
| google/gemma-4-26B-A4B-it | 26B totales / ~4B activos | no disponible | Apache 2.0 | safetensors | Modelo base original de Google |
| Unsloth UD-IQ2_M / UD-IQ3_S de Gemma 4 26B-A4B | 26B totales / ~4B activos | no disponible | Apache 2.0 | GGUF | Cuantizaciones dinámicas usadas como fuente |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son idénticos al modelo base, solo reorganizados; cualquier limitación de Gemma 4 26B-A4B se hereda.
- La cuantización agresiva (5 bits en residente, UD-IQ3_S en expertos) puede degradar la calidad respecto al modelo original en precisión completa.
- La lectura de expertos desde flash introduce latencia dependiente del almacenamiento del dispositivo.
- El campo de parámetros safetensors del repo (572.794.416) no corresponde al modelo completo; conviene no interpretarlo como el tamaño real del MoE.
- No se documentan idiomas soportados ni evaluación de sesgos.
- Riesgo de alucinación: no evaluado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de los términos de Google para Gemma 4 y de las cuantizaciones de Unsloth y ggml-org.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta; tratar como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/buddysburrow/buddy-gemma4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Cuantizaciones de Unsloth: https://huggingface.co/unsloth
- GGUF de ggml-org: https://huggingface.co/ggml-org
