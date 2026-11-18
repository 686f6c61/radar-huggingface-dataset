# mradermacher/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-GGUF es una distribucion de pesos cuantizados en formato GGUF generada por mradermacher a partir del modelo base spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic. Se trata, por tanto, de un derivado de terceros: el repositorio no introduce un modelo nuevo, sino una conversion a cuantizaciones de llama.cpp de un modelo ya existente. El nombre sugiere un merge o fine-tuning sobre una base Qwen3.5 de aproximadamente 9.000 millones de parametros, orientado a eliminar los filtros de rechazo (uncensored) y con una variante de "abliteration" o "heretic" destinada a reducir los comportamientos de negativa.

La relevancia de esta ficha es limitada y debe enmarcarse con cautela: el repositorio no incluye model card descriptiva, no declara licencia, no especifica idiomas y no publica resultados de evaluacion. La informacion disponible se reduce a la lista de cuantizaciones generadas y a la referencia al modelo de origen. Cualquier uso en produccion exige verificar de forma independiente la licencia del modelo base y del modelo original, ya que la cadena de derivacion no documenta permisos.

Por la nomenclatura, el modelo encaja en la categoria de modelos de ~9B parametros con contexto potencialmente largo (familia Qwen), pero todos los datos tecnicos concretos deben considerarse no verificados hasta consultar el repositorio de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only de la familia Qwen3.5, no confirmado) |
| Parametros totales | no disponible (el nombre indica 9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. El identificador del modelo de origen (Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic) sugiere una base Qwen3.5 de aproximadamente 9B parametros, sobre la que se habrian aplicado procesos de merge y de eliminacion de alineamiento de seguridad (uncensoring / abliteration, etiquetado como "heretic"). No hay datos publicados sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento.

El repositorio de mradermacher unicamente documenta el proceso de cuantizacion: metadatos de version de quantize (quantize_version 2), indicador de tensor de salida cuantizado (output_tensor_quantised 1) y tipo de conversion hf. No se incluye informacion sobre decodificacion especulativa, atencion lineal ni otras innovaciones tecnicas.

## Capacidades

- Generacion de texto autoregresiva, asumiendo las capacidades heredadas del modelo base Qwen3.5-9B, si bien no estan verificadas en este repositorio.
- Razonamiento y generacion de codigo: no confirmado por el autor; depende del modelo de origen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Modo "uncensored"/"heretic": el modelo esta explicitamente disenado para reducir rechazos y filtros de seguridad, lo que constituye su caracteristica diferencial declarada en el nombre.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de tecnicas de abliteration/uncensoring sobre el comportamiento de rechazo en modelos de ~9B, comparando respuestas frente al modelo base original.
- Evaluacion de robustez de filtros: util para equipos de red teaming que necesitan un modelo con menor tasa de negativas para probar clasificadores de contenido y guardrails propios.
- Experimentacion local con llama.cpp: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en hardware de consumo, lo que facilita prototipado offline sin dependencia de APIs.
- Generacion de texto creativo sin restricciones tematicas: escritura de ficcion o guiones donde el modelo base rechazaria ciertos temas; requiere revision humana por la ausencia de filtros.
- Benchmarking de cuantizaciones: el repositorio ofrece un espectro amplio (de Q2_K a f16) que permite medir la degradacion de calidad frente al tamano en un mismo modelo, util para calibrar pipelines de despliegue.
- Pruebas de pipelines de inferencia: validacion de integraciones con llama.cpp, Ollama o servidores compatibles OpenAI antes de migrar a modelos con licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~9B en GGUF: Q4_K_M en torno a 5-6 GB, Q5_K_M en torno a 6-7 GB, Q8_0 en torno a 9-10 GB y f16 en torno a 18 GB, sin contar overhead de contexto KV cache.
- GPU recomendadas: no disponibles por parte del autor. Para cuantizaciones Q4/Q5 bastaria una GPU consumer con 8-12 GB (RTX 3060 12 GB, RTX 4070); para Q8_0 se recomienda 12-16 GB (RTX 4080, RTX 4090); para f16, A100 40 GB, H100 o RTX 4090 24 GB con contexto moderado.
- Cabe en GPU consumer: probablemente si en cuantizaciones Q4_K_M e IQ4_XS, sujeto a verificacion empirica.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI basados en llama.cpp (llama-server). vLLM y TGI no consumen GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-GGUF (este) | ~9B (segun nombre) | no disponible | no disponible | GGUF | Derivado uncensored de terceros, sin model card |
| spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic | ~9B (segun nombre) | no disponible | no disponible | safetensors (presumible) | Modelo de origen del que se generan las cuantizaciones |
| Qwen3.5-9B (base presumible) | ~9B | no disponible | no disponible en esta ficha | safetensors, GGUF | Modelo original de la familia; licencia y contexto deben consultarse en su repositorio oficial |

No se dispone de datos suficientes para comparar rendimiento, ya que no hay benchmarks publicados para este derivado.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentacion sobre entrenamiento, datos, evaluacion ni limitaciones declaradas por el autor.
- Licencia no especificada: no es posible determinar si el uso comercial esta permitido. La cadena de derivacion (modelo base Qwen, merge, uncensoring y cuantizacion) puede imponer obligaciones adicionales que deben verificarse en cada eslabon.
- Modelo explicitamente uncensored: reduce o elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o difamatorio. No es apto para aplicaciones de cara al publico sin guardrails externos.
- Riesgo elevado de alucinacion: no hay evaluaciones de fidelidad ni de calibracion; los procesos de abliteration pueden degradar capacidades de razonamiento e instruccion.
- Idiomas no declarados: no se puede asumir un rendimiento multilingue correcto, especialmente en castellano.
- Contexto no documentado: planificar el despliegue sin asumir una ventana concreta hasta confirmarla en el modelo de origen.
- Sin descargas ni likes: repositorio sin validacion comunitaria; no hay evidencia de uso en produccion ni informes de calidad.
- Fecha de creacion futura en los metadatos (2026-11-18): inconsistencia que sugiere datos de repositorio no fiables o generados automaticamente; tratar la metadata con escepticismo.
- Cuantizaciones de baja precision (Q2_K) con degradacion notable esperable en un modelo de 9B; no recomendadas para tareas de razonamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo de origen: https://huggingface.co/spale04/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-heretic
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp (herramienta de cuantizacion e inferencia GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
