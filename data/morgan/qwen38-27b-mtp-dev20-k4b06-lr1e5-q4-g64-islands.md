# morgan/qwen38-27b-mtp-dev20-k4b06-lr1e5-q4-g64-islands

## Resumen

Este repositorio contiene un artefacto de *proposal-head* (cabeza de propuesta) para decodificación especulativa nativa con *Multi-Token Prediction* (MTP) sobre el modelo base Qwen/Qwen3.8-27B. No es un modelo de lenguaje independiente: el backbone y el tokenizer del modelo objetivo no se incluyen, y el artefacto solo aporta las proyecciones adicionales que permiten proponer varios tokens por paso de decodificación, que luego son verificados por el modelo fijo. El head proviene de un fine-tuning denominado Dev20 con parámetros K=4, β=0.6 y tasa de aprendizaje 1e-5, y ha sido cuantizado a 4 bits con agrupación de 64 canales mediante MLX 0.32.0, manteniendo en BF16 los pesos de normalización y seis tensores adicionales de "islas de precisión" para Q, K y V.

La relevancia de este artefacto radica en que permite acelerar la inferencia del modelo Qwen3.8-27B sin modificar el modelo base, aprovechando la decodificación especulativa multi-token. El head es extremadamente ligero (82 millones de parámetros) y se distribuye bajo licencia Apache-2.0, lo que facilita su integración en entornos de producción que ya utilicen el modelo base. Aunque no ofrece capacidades generativas por sí mismo, su correcta integración con el runtime adecuado puede reducir la latencia de generación de forma significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proposal-head MTP (Multi-Token Prediction) para decodificacion especulativa, basado en Qwen/Qwen3.8-27B |
| Parametros totales | 82.113.024 (solo el head; el modelo base tiene 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.8-27B, que soporta hasta 256K tokens) |
| Tipos de cuantizacion | Q4/G64 (afine 4-bit con grupo de 64) para 8 matrices; BF16 para 7 pesos de normalizacion y 6 tensores de islas de precision (Q, K, V) |
| Idiomas soportados | No disponible (heredados del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El artefacto es una cabeza de propuesta MTP que se anade al modelo base Qwen3.8-27B para habilitar la decodificacion especulativa. El head fue inicializado a partir de un fine-tuning denominado Dev20, con parametros K=4 (numero de tokens propuestos por paso), peso de perdida de aceptacion β=0.6 y tasa de aprendizaje 1e-5. Sus ocho pesos de matriz se cuantizaron con MLX 0.32.0 utilizando cuantizacion afine de 4 bits con grupos de 64 canales, mientras que los siete pesos de normalizacion unidimensionales se mantuvieron en BF16.

Ademas, el head se extiende con seis tensores de "islas de precision" exclusivos para la propuesta: `precision_islands.q.weight` (BF16 [1024, 5120]), `precision_islands.q.indices` (I32 [1024]), y los correspondientes para K y V. Los indices de las islas se copian exactamente del mecanismo publico QKV-islands de `amal-david/qwen38-mtp-head-q4-qkv-islands-v1`, conservando todas las filas de K y V y 1024 filas seleccionadas de Q. El runtime de desafio instala estas filas solo en la proyeccion de atencion de propuesta MTP, mientras que el modelo objetivo fijo verifica cada token emitido. No se incluye codigo remoto ejecutable.

## Capacidades

- Aceleracion de la generacion de texto mediante decodificacion especulativa multi-token: propone hasta 4 tokens por paso, que son verificados por el modelo base Qwen3.8-27B.
- Compatible con el ecosistema MLX y con el formato safetensors.
- Mecanismo de islas de precision BF16 para Q, K y V que mejora la fidelidad de las propuestas en filas criticas.
- No es un modelo generativo autonomo: requiere el modelo base y un runtime compatible con MTP para funcionar.
- No ofrece capacidades de razonamiento, codigo, vision ni tool calling por si mismo; todas las capacidades semanticas provienen del modelo base.

## Casos de uso

- Inferencia acelerada de Qwen3.8-27B en entornos de produccion: al integrar este head con el runtime adecuado, se puede reducir la latencia de generacion en aplicaciones de chat, asistentes virtuales o agentes conversacionales, manteniendo la calidad del modelo base.
- Despliegue en hardware con recursos limitados: el head ocupa solo 0.3 GB, por lo que puede almacenarse y cargarse rapidamente junto al modelo base cuantizado, facilitando la ejecucion en GPUs de consumo o incluso en CPU con MLX.
- Experimentacion con decodificacion especulativa: investigadores y desarrolladores pueden estudiar el impacto de la cuantizacion 4-bit y las islas de precision en la tasa de aceptacion de tokens propuestos, comparando con heads sin cuantizar o con otros esquemas de cuantizacion.
- Optimizacion de costes en API de inferencia: al reducir el numero de pasos de decodificacion necesarios, se disminuye el tiempo de computo y el consumo energetico por peticion, lo que puede traducirse en menores costes operativos.
- Integracion en frameworks de agentes que requieren multiples llamadas al modelo: la menor latencia por generacion permite ejecutar cadenas de razonamiento o tool calling de forma mas rapida, mejorando la experiencia de usuario en tareas multi-paso.
- Evaluacion de la calidad de propuestas MTP: el artefacto incluye hashes SHA-256 y un registro de procedencia (`provenance.json`), lo que permite auditar y reproducir exactamente el head en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de tasa de aceptacion, latencia ni throughput para este head especifico. Se recomienda realizar pruebas propias en el entorno objetivo para medir la aceleracion real.

## Requisitos de hardware

- VRAM estimada para el head: inferior a 0.5 GB (82M parametros, cuantizado a 4 bits y BF16). Sin embargo, el sistema completo requiere la VRAM del modelo base Qwen3.8-27B, que en funcion de la cuantizacion puede oscilar entre 16 GB (cuantizacion 4-bit) y 54 GB (BF16).
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM para el modelo base cuantizado (por ejemplo, RTX 4090, RTX 4080, A100 40GB, H100). Para el head en solitario, cualquier GPU con mas de 1 GB es suficiente.
- Compatible con consumer GPUs: si, siempre que el modelo base tambien quepa en la VRAM disponible (por ejemplo, con cuantizacion Q4 del modelo base en una RTX 4090).
- Opciones de despliegue: MLX (framework principal), y potencialmente vLLM o TGI si implementan soporte para MTP con este formato. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles; dependen del runtime, del hardware y de la tasa de aceptacion de los tokens propuestos.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros heads MTP en la informacion proporcionada. El artefacto se basa en el mecanismo publico de `amal-david/qwen38-mtp-head-q4-qkv-islands-v1`, pero no hay datos publicados que comparen ambos. Como referencia, el modelo base Qwen3.8-27B es un modelo denso de 27B parametros con arquitectura hibrida Gated DeltaNet + Gated Attention, soporte de 256K de contexto y capacidades multimodales (texto, imagen, video). Este head solo anade la funcionalidad de propuesta MTP, por lo que la comparativa relevante seria entre el modelo base con y sin decodificacion especulativa, cuyos resultados no se han proporcionado.

## Limitaciones y advertencias

- No es un modelo de lenguaje completo: no puede generar texto por si mismo. Intentar cargarlo como un modelo independiente producira errores o resultados sin sentido.
- Depende criticamente del modelo base Qwen3.8-27B y de un runtime que implemente el protocolo MTP con las islas de precision. Sin ese runtime, el head es inutilizable.
- La cuantizacion Q4/G64 puede degradar la calidad de las propuestas en comparacion con el head BF16 original, aunque las islas de precision BF16 mitigan parcialmente este efecto en filas seleccionadas.
- No se han publicado estudios sobre sesgos o alucinaciones del head, ya que estas caracteristicas pertenecen al modelo base. Los riesgos de sesgo y alucinacion del sistema completo son los mismos que los de Qwen3.8-27B.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen3.8-27B tambien tenga una licencia compatible (en este caso, Apache-2.0 segun su model card).
- El artefacto tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un proyecto reciente o poco difundido. Se recomienda validar su funcionamiento en un entorno controlado antes de usarlo en produccion.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/morgan/qwen38-27b-mtp-dev20-k4b06-lr1e5-q4-g64-islands
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Version de Unsloth del modelo base: https://huggingface.co/unsloth/Qwen3.8-27B
- Referencia de Qwen3.8 27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Blog de AMD sobre ejecucion de Qwen3.8 27B en hardware AMD: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia completa de Qwen 3.6-27B (contexto sobre la familia de modelos): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
