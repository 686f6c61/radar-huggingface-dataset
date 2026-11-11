# CrazyJames26/HeteroSD

## Resumen

HeteroSD es un archivo de checkpoints publicado por CrazyJames26 en Hugging Face, orientado a la decodificación especulativa (*speculative decoding*) sobre hardware FPGA. No se trata de un modelo base nuevo, sino de un conjunto de modelos borrador (*draft models*) destilados a partir de modelos existentes: Llama 3.2 1B y 3B, y Qwen 2.5 0.5B y 1.5B. El repositorio contiene exclusivamente los borradores y los estados de entrenamiento, no los modelos objetivo (*target models*) ni el espacio de trabajo completo del código fuente.

El interés técnico del proyecto reside en la combinación de cuantización (formatos AWQ y A4W4KV8), destilación guiada por el modelo objetivo y exportación a formatos alineados con FPGA, con una evaluación planteada sobre un sistema dual-MI210. Esto lo sitúa en la intersección entre investigación de decodificación especulativa, cuantización de bajo bit y aceleración hardware no convencional.

El repositorio ocupa 112,5 GB y no registra descargas ni interacciones en el momento de la consulta. La información pública disponible es limitada: no se han publicado resultados de benchmarks, y la licencia no está especificada de forma explícita más allá de la herencia de las licencias de los modelos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivados de Llama 3.2 y Qwen 2.5); el repositorio contiene borradores para decodificación especulativa |
| Parametros totales | No disponible de forma agregada; las familias son Llama 3.2 1B/3B y Qwen 2.5 0.5B/1.5B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ y A4W4KV8 (activaciones 4 bits, pesos 4 bits, KV cache 8 bits) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible como licencia unica; los derivados de Llama usan Llama 3.2 Community License y los de Qwen conservan Apache 2.0 |
| Formato de pesos | safetensors; exports AWQ y A4W4KV8 con loader personalizado para FPGA |

## Arquitectura y entrenamiento

Los modelos del repositorio son borradores (*draft models*) para decodificación especulativa, derivados de cuatro modelos base: Llama 3.2 1B, Llama 3.2 3B, Qwen 2.5 0.5B y Qwen 2.5 1.5B. Las modificaciones introducidas por HeteroSD consisten en cuantización, destilación guiada por el modelo objetivo y exportación a los formatos documentados. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición del dataset de destilación.

El repositorio organiza los artefactos en cuatro directorios: exports AWQ destilados para la evaluación dual-MI210, exports A4W4KV8 seleccionados para la evaluación del artículo, exports A4W4KV8 destilados con OSD en el paso 24000, y el estado final de entrenamiento de la época 3. Los checkpoints de evaluación seleccionados corresponden a época 3, paso 6000 para Llama 1B/3B y época 3, paso 4000 para Qwen 0.5B/1.5B. Los ficheros de estado del optimizador intermedios fueron eliminados durante el entrenamiento, conservándose por separado los parámetros de inferencia exportados. El formato A4W4KV8 requiere un cargador de parámetros personalizado alineado con FPGA y no es un modelo estándar de Hugging Face.

## Capacidades

- Generación de texto en inglés como tarea declarada del pipeline (`text-generation`).
- Decodificación especulativa: los modelos actúan como borradores que proponen tokens verificados por un modelo objetivo.
- Cuantización AWQ para ejecución en runtimes de inferencia compatibles con AWQ.
- Exportación A4W4KV8 para despliegue en FPGA mediante loader personalizado.
- Destilación guiada por objetivo para alinear la distribución del borrador con la del modelo grande.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Aceleración de inferencia con decodificación especulativa: usar los borradores Llama 1B/3B o Qwen 0.5B/1.5B junto a sus modelos objetivo correspondientes para reducir la latencia por token, aceptando propuestas verificadas por el modelo grande.
- Despliegue en FPGA: los exports A4W4KV8 con loader personalizado permiten evaluar la decodificación especulativa sobre hardware reconfigurable, un escenario habitual en investigación de aceleradores.
- Investigación en cuantización de bajo bit: los formatos AWQ y A4W4KV8 sirven para estudiar el impacto de cuantizar activaciones, pesos y KV cache en la tasa de aceptación del borrador.
- Reproducción de experimentos: los checkpoints de época 3 con pasos documentados permiten replicar la evaluación del artículo sobre sistemas dual-MI210.
- Recuperación de entrenamiento: el estado final de la época 3 permite reanudar o auditar el proceso de destilación.
- Estudio de destilación objetivo-borrador: comparar los exports AWQ y A4W4KV8 de un mismo modelo base para analizar cómo afecta el formato de cuantización a la calidad del borrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del modelo base concreto (0.5B, 1B, 1.5B o 3B) y del formato de cuantización; los exports AWQ y A4W4KV8 reducen la huella frente a precisión completa, pero no se publican cifras.
- GPU recomendadas: no disponibles. La evaluación documentada se realizó sobre un sistema dual-MI210, no sobre GPU convencionales.
- Viabilidad en GPU de consumo: no confirmada. Los modelos de 0.5B a 3B en formatos cuantizados podrían caber en GPUs de consumo, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: runtime compatible con AWQ para los exports `awq/ours/`; loader personalizado HeteroSD para los exports A4W4KV8 (no es un modelo estándar de Hugging Face). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeteroSD (borradores) | 0.5B a 3B segun familia | No disponible | safetensors, AWQ, A4W4KV8 | Heredada de Llama 3.2 / Apache 2.0 | Hugging Face (archivo de checkpoints) |
| EAGLE / EAGLE-2 (borradores especulativos) | Tipicamente <1B | Depende del objetivo | safetensors | Varía por publicacion | Repositorios de investigacion |
| Medusa (cabezas especulativas) | Cabezas sobre el modelo base | Depende del objetivo | safetensors | Varía por publicacion | Repositorios de investigacion |

La comparación con EAGLE y Medusa es a nivel de categoría (decodificación especulativa); no se dispone de datos de rendimiento de HeteroSD para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene los modelos objetivo ni el código fuente completo, por lo que no es autosuficiente para reproducir la evaluación.
- Los exports A4W4KV8 requieren un loader personalizado y no funcionan como modelos estándar de Hugging Face.
- Solo se declara soporte de inglés.
- No hay benchmarks publicados que permitan evaluar la calidad o la tasa de aceptación de los borradores.
- La licencia no está unificada: los derivados de Llama quedan sujetos a la Llama 3.2 Community License y los de Qwen a Apache 2.0, con copias en `licenses/` y en cada directorio de modelo. Cualquier uso comercial debe revisarse caso por caso.
- Los checkpoints de evaluación seleccionados no son los mejores intermedios del entrenamiento, sino los correspondientes a época 3 en los pasos indicados.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables por herencia de los modelos base.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria conocida.

## Enlaces

- Hugging Face: https://huggingface.co/CrazyJames26/HeteroSD
