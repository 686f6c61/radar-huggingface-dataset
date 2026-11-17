# npario/Qwen3.8-27B-ZeroRefusal-UD-IQ4_XS-MTP-GGUF

## Resumen

Qwen3.8-27B-ZeroRefusal-UD-IQ4_XS-MTP-GGUF es una cuantización GGUF de la comunidad del modelo Qwen3.8-27B, publicada por el usuario npario. El modelo parte de los pesos BF16 editados mediante la técnica ZeroFuse v0.1.0 (ablación direccional) sobre la variante "Uncensored" de junafinity, y se recuantiza siguiendo el mapa de tipos de tensor y la importance matrix de la release Unsloth Dynamic V3 `UD-IQ4_XS`. El resultado es un único fichero GGUF que conserva la capa MTP (Multi-Token Prediction) nativa del modelo original, por lo que no requiere un modelo draft separado para decodificación especulativa.

El modelo está pensado y validado para un despliegue concreto: una RTX 5060 Ti de 16 GB de VRAM con llama.cpp. La arquitectura reportada es `qwen35`, con 65 bloques, 866 tensores y una longitud de contexto original de 262.144 tokens, aunque el perfil de producción validado reduce la ventana a 73.728 tokens compartidos entre dos slots. Es multimodal (image-text-to-text) gracias a un proyector de visión F16 separado.

Su relevancia es doble: por un lado, demuestra un flujo de cuantización reproducible con mapa de tipos anclado por regex y hashes verificables; por otro, ofrece una variante "sin rechazo" (0/64 en el conjunto de validación de mlabonne/harmful_behaviors) que interesa a quienes investigan alineación, edición de comportamiento y seguridad de modelos. Es una release independiente de la comunidad, no oficial de Qwen, Unsloth, llama.cpp ni ZeroFuse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (transformer, con capa MTP/NextN nativa) |
| Parametros totales | no disponible (el dato de safetensors, 460.730.096, no es coherente con un modelo de 27B; se reporta tal cual) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens originales; 73.728 tokens validados en produccion (pool KV compartido entre 2 slots) |
| Tipos de cuantizacion | IQ4_XS (4,25 bpw, `general.file_type = 30`); proyector de vision en F16; KV cache Q4_0 K/V |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Numero de tensores | 866 |
| Numero de bloques | 65 (`qwen35.nextn_predict_layers = 1`) |
| Tamano del fichero principal | 14.252.845.056 bytes (~14,25 GB) |
| Tamano del proyector de vision | 927.607.008 bytes (~928 MB) |
| SHA256 del modelo principal | `f6c1f6e1211aeceaa386cbeabd0bdfbee0d124747ecaa3e908a93394518e9274` |

## Arquitectura y entrenamiento

La arquitectura es un transformer `qwen35` con 65 bloques y una capa de predicción multi-token (MTP/NextN) nativa, implementada en 15 tensores bajo `blk.64.*`. Esta capa permite decodificación especulativa sin modelo draft externo, usando `--spec-type draft-mtp` en llama.cpp. El modelo es multimodal: incorpora un proyector de visión F16 (`mmproj-Qwen3.8-27B-F16.gguf`) que en el perfil validado se mantiene en CPU (`--no-mmproj-offload`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La edición de comportamiento se realizó con ZeroFuse v0.1.0 mediante ablación direccional: trial 38, capa fuente 35, fuerza 1,2242385643286666, aplicada a las capas 9-56. El resultado en BF16 reporta una divergencia KL de 0,009713646 y 0/64 rechazos. La recuantización usa la importance matrix de Unsloth (`quantization/imatrix_unsloth.gguf`) y un mapa de tipos anclado con expresiones regulares (`v3-final-tensor-overrides.txt`) que evita que la regla global de `output.weight` capture por error los tensores `attn_output.weight` por capa. El autor advierte que los nombres, formas y distribución de tipos de cuantización coinciden con la referencia Unsloth Dynamic V3, pero los payloads no son idénticos byte a byte porque los pesos de comportamiento fueron editados.

## Capacidades

- Generación de texto y razonamiento en chino e inglés.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante proyector de visión F16.
- Decodificación especulativa nativa con MTP, sin modelo draft separado.
- Conversación multi-turno con ventana de contexto larga (hasta 73.728 tokens validados en el perfil de 16 GB).
- Servicio concurrente con dos slots en llama-server (`-np 2`) sobre un pool KV unificado.
- Compatibilidad con plantillas Jinja (`--jinja`) para formateo de chat.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- Comportamiento "sin rechazo" validado en un conjunto fijo de 64 prompts (0/64 rechazos con el clasificador de 23 marcadores del autor).

## Casos de uso

- Investigación en alineación y edición de comportamiento: comparar las respuestas del modelo editado con ZeroFuse frente al base Qwen3.8-27B para estudiar cómo la ablación direccional en las capas 9-56 afecta a la distribución de salidas (KL de 0,0097 en BF16).
- Despliegue local en estación de trabajo con GPU de 16 GB: el perfil validado (RTX 5060 Ti, IQ4_XS, contexto 73.728, KV Q4_0) permite servir dos conversaciones concurrentes a ~33 tok/s por stream y ~65 tok/s agregados.
- Procesamiento de documentos con imagen: el proyector de visión F16 permite pasar capturas, diagramas o páginas escaneadas junto con texto, con un límite de 4.096 tokens de imagen por entrada.
- Generación de texto bilingüe chino-inglés: útil para traducción, resumen o redacción en ambos idiomas dentro de la misma ventana de contexto.
- Evaluación de cuantizaciones: el mapa de tipos anclado y la importance matrix publicados permiten reproducir la recuantización y comparar la degradación frente al BF16.
- Prototipado de asistentes conversacionales de contexto largo: los 73.728 tokens compartidos entre dos slots permiten mantener historiales extensos sin reiniciar la sesión.
- Auditoría de seguridad de modelos "uncensored": el método de validación (dataset, revisión, hash del corpus, temperatura, top-p, top-k y clasificador) es reproducible para comparar con otras variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia y de rechazo:

| Prueba | Resultado |
|---|---:|
| Decodificacion P1 | 41,67 tok/s |
| Stream A en P2 | 31,58 tok/s |
| Stream B en P2 | 34,08 tok/s |
| Media por stream en P2 | 32,83 tok/s |
| Agregado del servidor en P2 | 65,67 tok/s |
| Agregado en tiempo de reloj en P2 | 61,88 tok/s |
| VRAM libre minima observada | ~138 MiB |
| Aceptacion del draft MTP (P1) | 80,85% |
| Aceptacion del draft MTP (P2, stream A / B) | 77,43% / 62,22% |
| Validacion de rechazo (64 prompts) | 0/64 rechazos, 0 errores |

La aceptación del draft MTP depende del contenido generado, según el autor.

## Requisitos de hardware

- VRAM estimada: ~14,25 GB para el modelo principal en IQ4_XS más ~928 MB del proyector de visión F16 si se carga en GPU; el perfil validado mantiene el proyector en CPU.
- GPU de referencia: RTX 5060 Ti de 16 GB, con un margen de VRAM muy estrecho (~138 MiB libres en el peor momento).
- No se documenta funcionamiento en GPUs de 8, 12 o 24 GB; el autor solo valida el perfil de 16 GB.
- Despliegue: llama.cpp (build upstream b10435 / 9e40df6) con `llama-server`; se usan `--flash-attn on`, `-ctk q4_0`, `-ctv q4_0`, `--kv-unified`, `-ngl 999`, `-b 512`, `-ub 64`, `--threads 7`.
- Decodificación especulativa: `--spec-type draft-mtp`, `--spec-draft-n-max 1`, draft KV en F16.
- Throughput medido: 41,67 tok/s en un slot y ~65,67 tok/s agregados con dos slots.
- No se mencionan vLLM, TGI ni Ollama como opciones validadas para este fichero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-ZeroRefusal-UD-IQ4_XS-MTP (este) | 27B (nominal) | 262.144 originales / 73.728 validados | IQ4_XS, GGUF | apache-2.0 | Edicion ZeroFuse, MTP nativo, perfil 16 GB |
| Qwen/Qwen3.8-27B (base) | 27B (nominal) | 262.144 | BF16 y otras | apache-2.0 | Modelo original sin edicion de comportamiento |
| junafinity/Qwen-3.8-27B-Uncensored | 27B (nominal) | no disponible | no disponible | no disponible | Fuente de la edicion ZeroFuse v0.1.0 |
| unsloth/Qwen3.8-27B-GGUF (`UD-IQ4_XS`) | 27B (nominal) | 262.144 | IQ4_XS, GGUF | apache-2.0 | Referencia de cuantizacion Dynamic V3 |

No se dispone de datos de rendimiento de calidad que permitan comparar estos modelos entre sí.

## Limitaciones y advertencias

- El margen de VRAM en el perfil de 16 GB es mínimo (~138 MiB); cambios de driver, versión de CUDA, formas de batch o cargas de GPU en segundo plano pueden provocar OOM.
- No se debe ejecutar ComfyUI ni otra carga CUDA pesada en paralelo.
- El proyector de visión debe permanecer en CPU en este perfil.
- Los modelos ZeroRefusal/uncensored pueden generar contenido inseguro, ilegal o incorrecto; el despliegue exige control de acceso, auditoría y política de seguridad por parte del operador.
- El resultado de 0/64 rechazos corresponde únicamente a un test fijo (primeros 64 prompts de `mlabonne/harmful_behaviors`, revisión `01cead0…`, máximo 64 tokens de salida, temperatura 1.0, top-p 0.95, top-k 20) y no constituye una garantía general de seguridad ni de calidad.
- Los pesos de comportamiento fueron editados y recuantizados: la distribución de tipos coincide con Unsloth Dynamic V3, pero los payloads no son idénticos byte a byte.
- Idiomas soportados declarados: solo chino e inglés.
- El dato de parámetros totales en safetensors (460.730.096) no es coherente con un modelo de 27B y no se ha podido verificar.
- Es una release independiente de la comunidad, no oficial de Qwen, Unsloth, llama.cpp ni ZeroFuse; deben respetarse las licencias y términos de todos los componentes upstream.
- No se documentan benchmarks de calidad ni soporte verificado de tool calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/npario/Qwen3.8-27B-ZeroRefusal-UD-IQ4_XS-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente de la edicion de comportamiento: https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored
- Referencia de cuantizacion Unsloth Dynamic V3: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Dataset de validacion de rechazo: `mlabonne/harmful_behaviors` (revision `01cead01398926d81f7c52bdb790ee8cf77ebba7`)
- llama.cpp: https://github.com/ggml-org/llama.cpp
