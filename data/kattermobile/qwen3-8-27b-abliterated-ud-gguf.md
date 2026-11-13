# KatterMobile/Qwen3.8-27B-abliterated-UD-GGUF

## Resumen
Qwen3.8-27B-abliterated-UD-GGUF es una cuantizacion GGUF modificada del modelo Qwen3.8-27B, publicada por el desarrollador independiente KatterMobile (Kaden). Se trata de una version "abliterated" (sin direccion de rechazo) del archivo `UD-Q6_K_L` de Unsloth, que a su vez es una cuantizacion dinamica del modelo original `Qwen/Qwen3.8-27B`. El modelo conserva la arquitectura hibrida del original, con atencion lineal tipo SSM combinada con atencion completa cada cuatro bloques, y una ventana de contexto de 262.144 tokens.

La innovacion principal de esta publicacion no es el modelo base, sino la tecnica de edicion quirurgica aplicada directamente sobre el GGUF: se extrajeron direcciones de rechazo por capa con `llama-cvector-generator` y se ortogonalizaron los escritores del residual en float32, re-cuantizando unicamente los 68 tensores editados a Q8_0 mientras el resto permanece byte-identico al archivo de Unsloth. El resultado declarado es una reduccion de marcadores de rechazo de 19/20 a 0/20 en una prueba de humo de 20 prompts, con un incremento de perplejidad de solo el 0,71 % sobre wikitext-2.

Es relevante para quienes necesitan un modelo de ~27.000 millones de parametros sin censura y con contexto muy largo, ejecutable en llama.cpp, aunque conviene subrayar que la evaluacion publicada es minima y no constituye una evaluacion de seguridad ni de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` — hibrida de atencion lineal (SSM) y atencion completa; 48 bloques SSM + 16 bloques de atencion completa + 1 bloque MTP |
| Parametros totales | 27,321 B (866 tensores) segun la model card; el campo `safetensors` del repo indica 322.560 (dato no coherente con la ficha del autor) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q6_K como base, con los 68 tensores abliterados en Q8_0; 7,29 bpw; tamano de archivo 24,91 GB |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura `qwen35` del Qwen3.8-27B original: 65 bloques en total, de los cuales 48 son bloques de atencion lineal con compuertas (SSM), con proyecciones `attn_qkv` de 5120→10240, `attn_gate` de 5120→6144 y `ssm_out` de 6144→5120. Cada cuarto bloque incorpora atencion completa, con `attn_q` de 5120→12288 con compuerta fusionada, `attn_k/v` de 1024 y `attn_output` de 6144→5120. Se incluye ademas un bloque MTP (multi-token prediction) en `blk.64`, que el autor deja intacto.

No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO, ya que la model card se centra exclusivamente en el proceso de abliteracion. La innovacion tecnica documentada es el procedimiento de edicion: extraccion de direcciones de rechazo por capa a partir de 20 pares de prompts daninos/inocuos, ortogonalizacion de los escritores del residual en float32 mediante `W ← W − s · d (dᵀW) / (dᵀd)` con `s = 1.35`, y re-cuantizacion exclusiva de los tensores editados con la imatrix de Unsloth. El autor justifica el uso de Q8_0 en los tensores editados porque una edicion a escala 1.0 re-cuantizada a Q6_K reinjecta aproximadamente el 25 % de la direccion eliminada por ruido de cuantizacion.

## Capacidades
- Generacion de texto y razonamiento en ingles y chino, heredadas del Qwen3.8-27B base.
- Modo de pensamiento (thinking) desactivable; la evaluacion publicada se realizo con thinking desactivado.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Capacidad de prediccion multi-token (MTP) preservada en el bloque `blk.64`.
- Sin capacidad de vision: el GGUF es solo texto y el `mmproj` del modelo original se distribuye por separado y sin modificar.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso en la informacion disponible.
- Comportamiento sin censura: el autor declara 0/20 marcadores de rechazo en su prueba de humo.

## Casos de uso
- Investigacion sobre alineacion y seguridad: permite estudiar como se distribuye la direccion de rechazo por capas en una arquitectura hibrida SSM/atencion, comparando el modelo base con la version abliterada.
- Procesamiento de documentos largos en ingles o chino: con 262.144 tokens de contexto se pueden analizar contratos, informes o bases de codigo completas en una sola pasada sin truncar.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa adulta donde los filtros del modelo base resultan limitativos, ejecutada localmente con llama.cpp.
- Despliegue en estaciones de trabajo con GPU unica: al ocupar 24,91 GB en Q6_K, cabe en GPUs de 32 GB o superiores y permite inferencia local sin dependencia de API.
- Analisis de conversaciones multi-turno en chino: el soporte nativo de zh y el contexto largo lo hacen util para resumir hilos extensos o extraer informacion de transcripciones.
- Reproduccion de la tecnica de abliteracion: el autor documenta el procedimiento completo (extraccion de direcciones, ortogonalizacion, re-cuantizacion selectiva), lo que sirve como referencia metodologica para editar otros GGUF.
- Evaluacion comparativa de cuantizaciones: permite medir el impacto de mantener tensores editados en Q8_0 frente a Q6_K en terminos de perplejidad y fidelidad de la edicion.

## Benchmarks y rendimiento
La unica evaluacion publicada por el autor es una prueba de humo con 20 prompts inductores de rechazo (temperatura 0, thinking desactivado, puntuacion por palabras clave) y perplejidad sobre wikitext-2 (24 secuencias de 512 tokens).

| Modelo | Marcadores de rechazo | Rechazos duros | PPL |
|---|---|---|---|
| Base `UD-Q6_K_L` | 19/20 | 12/20 | 6,0851 |
| Esta version | 0/20 | 0/20 | 6,1286 (+0,71 %) |

El autor advierte explicitamente que se trata de una prueba de humo de 20 prompts y no de una evaluacion de seguridad, y recomienda ejecutar varios cientos de prompts reservados y un benchmark de capacidades antes de confiar en el modelo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 25 GB para el archivo Q6_K_L de 24,91 GB, mas overhead de contexto KV; con 262.144 tokens de contexto el consumo de KV crece de forma significativa y puede requerir offloading a RAM.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 6000 Ada (48 GB), RTX 5090 (32 GB) o GB10 Grace Blackwell, que es la estacion de trabajo que el autor declara haber usado.
- Cabe en GPU de consumo de gama alta con 32 GB o mas; en GPUs de 24 GB (RTX 4090, RTX 3090) seria necesario reducir contexto o aplicar offloading parcial a CPU.
- Opciones de despliegue: llama.cpp es el runtime de referencia; tambien es compatible con Ollama y otros frontends basados en GGUF. No se documenta soporte de vLLM ni TGI para este archivo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de abliteracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este release (KatterMobile) | 27,321 B | 262.144 | Direcciones por capa, edicion in-place del GGUF, tensores editados en Q8_0 | Apache 2.0 | GGUF en Hugging Face |
| huihui-ai Qwen3.8-27B-abliterated | 27 B (no confirmado en la informacion) | no disponible | Direccion global unica, desde safetensors bf16 con cuantizaciones propias | no disponible | no disponible |
| unsloth/Qwen3.8-27B-GGUF (base) | 27,321 B | 262.144 | Sin abliterar | Apache 2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.8-27B (original) | 27 B (no confirmado) | 262.144 | Sin abliterar | no disponible | no disponible |

La diferencia declarada frente a huihui-ai es el uso de direcciones por capa en lugar de una direccion global (el autor mide cosenos de solo 0,60–0,76 entre los extremos de la banda y la capa 30) y la edicion directa sobre el GGUF de Unsloth preservando 798 de 866 tensores byte-identicos.

## Limitaciones y advertencias
- La evaluacion publicada es una prueba de humo de 20 prompts; no hay benchmark de capacidades ni evaluacion de seguridad, por lo que el impacto real de la abliteracion en el rendimiento general es desconocido.
- Riesgo elevado de generar contenido danino, sesgado o sexualmente explicito al haberse eliminado la direccion de rechazo; no es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- El autor reconoce una sobre-abliteracion (proyeccion invertida de aproximadamente 0,55 %), lo que puede degradar sutilmente la coherencia en dominios sensibles.
- Solo se declaran los idiomas ingles y chino; el rendimiento en castellano no esta documentado.
- El contexto de 262.144 tokens implica un consumo de memoria KV considerable que puede hacer inviable la ventana completa en GPUs de 32 GB.
- El bloque MTP y el `mmproj` de vision no se han modificado, pero el GGUF es solo texto y no incluye vision.
- Discrepancia entre los datos de parametros de la model card (27,321 B) y el campo `safetensors` del repo (322.560), que debe verificarse antes de usar el modelo en produccion.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y etica del contenido generado recae en el desplegador.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/KatterMobile/Qwen3.8-27B-abliterated-UD-GGUF
- Modelo base cuantizado (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Apoyo al autor (Ko-fi): https://ko-fi.com/kattermobile
- Contacto del autor: support@kattermobile.com
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
