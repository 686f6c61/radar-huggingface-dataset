# PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-4B-i1-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-i1-GGUF es una cuantizacion en formato GGUF del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, publicada por el usuario PrometheusEXE. El modelo base es un destilado de DeepSeek-V4-Pro sobre una arquitectura Qwen3.5 de aproximadamente 4.300 millones de parametros (4.326.350.848 exactos segun los safetensors del modelo base), orientado a razonamiento, matematicas, STEM y generacion conversacional. La cuantizacion se ha generado con el metodo i1 (imatrix) de Unsloth, lo que produce ficheros GGUF optimizados para inferencia local con llama.cpp y derivados.

El modelo hereda la etiqueta `qwen3_5` y los tags `reasoning`, `distillation`, `deepseek`, `sft`, `math`, `stem` y `mtp`, lo que indica que el entrenamiento combino destilacion desde DeepSeek-V4-Pro con ajuste supervisado sobre datasets de razonamiento (Jackrong/DeepSeek-V4-Pro-Distilled-200K y Jackrong/DeepSeek-V4-Distill-8000x). Su tamano compacto permite ejecutarlo en GPU de consumo, y el formato GGUF con cuantizacion i1 busca preservar la calidad del modelo original con un coste de memoria reducido.

Es relevante porque ofrece, en un unico paquete de ~4B parametros, capacidades de razonamiento tipo DeepSeek destiladas sobre una base Qwen3.5, con licencia Apache 2.0 y pesos en GGUF listos para despliegue local. No obstante, el repositorio esta restringido (gated) y no presenta descargas ni likes en el momento de la consulta, lo que limita su validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5), destilado de DeepSeek-V4-Pro |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix) de Unsloth; niveles concretos no especificados en la informacion disponible |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer decoder-only de la familia Qwen3.5, con aproximadamente 4.300 millones de parametros. Sobre esta base se aplico un proceso de destilacion desde DeepSeek-V4-Pro combinado con ajuste supervisado (SFT), segun indican los tags `distillation` y `sft` y los datasets referenciados: Jackrong/DeepSeek-V4-Pro-Distilled-200K (200.000 ejemplos destilados) y Jackrong/DeepSeek-V4-Distill-8000x (8.000 ejemplos de destilacion). El tag `mtp` sugiere la presencia de multi-token prediction en el pipeline de entrenamiento, aunque no se detalla su implementacion.

La informacion disponible no especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. La cuantizacion i1 con imatrix de Unsloth es la innovacion tecnica mas destacable del repositorio: utiliza una matriz de importancia calibrada para asignar bits de forma no uniforme a las capas, preservando mejor la calidad en cuantizaciones agresivas que el metodo GGUF estandar.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento paso a paso y cadenas de pensamiento (tag `reasoning`), heredado de la destilacion de DeepSeek-V4-Pro.
- Resolucion de problemas matematicos y de tipo STEM (tags `math`, `stem`).
- Destilacion de conocimiento: el modelo imita el estilo de razonamiento y las respuestas del profesor DeepSeek-V4-Pro.
- Multi-token prediction (tag `mtp`) como mecanismo de generacion, segun la metadata del repositorio.
- Compatible con text-generation-inference y con el ecosistema transformers/GGUF.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; el tag `reasoning` sugiere capacidad basica, pero no se documenta orquestacion de agentes.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente de razonamiento local: desplegado con llama.cpp u Ollama en una estacion de trabajo, el modelo puede resolver problemas matematicos y de logica paso a paso, aprovechando la destilacion de DeepSeek-V4-Pro para explicar el procedimiento.
- Tutoria STEM en ingles y chino: adecuado para generar explicaciones de ejercicios de fisica, matematicas o programacion en ambos idiomas, con un coste de inferencia bajo gracias a sus ~4B parametros.
- Prototipado de chatbots conversacionales: su formato GGUF permite integrarlo rapidamente en aplicaciones de chat con contexto multi-turno sin infraestructura GPU de datacenter.
- Generacion de datos sinteticos de razonamiento: util como modelo generador para crear pares pregunta-respuesta con cadenas de pensamiento en pipelines de destilacion adicional.
- Inferencia en el borde (edge) o en portatiles: al caber en GPU de consumo con cuantizaciones de 4-5 bits, sirve para demos offline de razonamiento sin conexion.
- Evaluacion comparativa de destilados: util como referencia para medir cuanto conocimiento de un modelo grande (DeepSeek-V4-Pro) se retiene en un estudiante de ~4B sobre base Qwen3.5.
- Educacion e investigacion en castellano: no recomendado directamente, ya que el modelo solo declara soporte de ingles y chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantizacion de 4 bits, aproximadamente 2,5-3 GB de pesos mas overhead de contexto (KV cache); con 5 bits, en torno a 3-3,5 GB; con 8 bits, unos 4,5-5 GB. Estimaciones orientativas a partir del tamano de 4,3B parametros; no hay mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones de 4-5 bits con contexto moderado (RTX 3060, RTX 4060, RTX 4070). Para 8 bits o contexto largo, RTX 4080/4090 o A100/H100.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas para cuantizaciones de 4-5 bits.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (segun tags), y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-i1-GGUF (este) | ~4,3B | no disponible | Apache 2.0 | GGUF | Destilado de DeepSeek-V4-Pro, i1 imatrix, gated |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B (base) | ~4,3B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3.5 4B (familia base) | ~4B | no disponible | Apache 2.0 | safetensors/GGUF | Base sin destilacion de DeepSeek |
| DeepSeek-V4-Pro (profesor) | no disponible | no disponible | no disponible | no disponible | Modelo de origen de la destilacion |

Los datos de contexto, rendimiento y disponibilidad de los modelos comparables no estan publicados en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia publica de calidad o estabilidad.
- Idiomas limitados: solo ingles y chino declarados; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: como todo modelo de ~4B destilado, puede generar razonamientos plausibles pero incorrectos, especialmente en problemas matematicos complejos.
- Perdida por destilacion y cuantizacion: la destilacion desde un modelo mayor y la cuantizacion i1 pueden degradar capacidades respecto al profesor; no se han publicado evaluaciones que lo cuantifiquen.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar cargas con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el autor de la cuantizacion no ofrece garantias; conviene verificar la procedencia de los datasets de destilacion.
- Fecha de creacion futura en los metadatos (2026-11-17): inconsistencia que sugiere metadata no fiable; tratar con cautela en produccion.
- Sin soporte documentado de tool calling ni agentes: no apto para pipelines que dependan de function calling sin verificacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-4B-i1-GGUF
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Dataset de destilacion: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Pro-Distilled-200K
- Dataset de destilacion: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Distill-8000x
- Unsloth (metodo i1 imatrix): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
