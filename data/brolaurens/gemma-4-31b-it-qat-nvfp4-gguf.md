# BroLaurens/gemma-4-31B-it-qat-NVFP4-GGUF

## Resumen

Este repositorio contiene una familia de tres archivos GGUF del modelo Gemma 4 31B IT, convertidos a partir del checkpoint QAT `melcheikh/gemma-4-31B-it-qat-NVFP4-mse-Blackwell`. La particularidad es que todos los pesos del transformer están nativamente cuantizados en formato NVFP4 (el formato FP4 de NVIDIA), con escalado por bloque MSE y un barrido de escalas de activación FP8, entrenados mediante cuantización consciente (QAT) por el autor del checkpoint. El resultado es un modelo de 31B parámetros con un backbone de 16,47 GB en FP4, pensado para ejecutarse exclusivamente en GPUs Blackwell (sm_100/sm_120) con soporte nativo de FP4 en llama.cpp.

El modelo es multimodal nativo: acepta imágenes y video como secuencia de frames, y mantiene una ventana de contexto de 262.144 tokens. Los tres archivos comparten un backbone NVFP4 byte-idéntico (verificado por SHA-256 en los 410 tensores) y solo difieren en la cuantización del embedding de tokens (y su LM head atado): BF16 (ORIG), Q8_0 y Q4_K. Esto permite elegir entre máxima fidelidad y menor tamaño manteniendo intacta la calidad del backbone. La licencia Apache 2.0 facilita su uso comercial, y el formato GGUF permite desplegarlo con llama.cpp en entornos Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 31B IT), multimodal (vision-language) |
| Parametros totales | 30.697.346.416 |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | NVFP4 (backbone, 410 tensores), embeddings BF16 / Q8_0 / Q4_K |
| Idiomas soportados | Ingles, multilingue (mas de 140 idiomas segun documentacion de Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tensores NVFP4 nativos, tipo GGML 40) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B IT de Google DeepMind, un transformer denso de 31B parametros con atencion completa y disenado para tareas de texto, codigo, razonamiento y multimodalidad (vision). El checkpoint convertido en este repo proviene de un proceso de QAT realizado con NVIDIA ModelOpt 0.44.0: todos los pesos de las proyecciones (atencion y FFN) se cuantizaron a NVFP4 con escalado por bloque MSE (`--qformat nvfp4_mse`) y un barrido de escalas de activacion FP8, calibrado sobre 512 muestras de cnn_dailymail. Se excluyeron de la cuantizacion el `lm_head` (que en Gemma 4 esta atado al embedding de tokens) y la torre de vision.

La conversion a GGUF preserva los tensores NVFP4 de forma nativa (sin de-cuantizar ni re-cuantizar), usando `convert_hf_to_gguf.py` con `--outtype auto`. Los tres archivos se generaron aplicando unicamente re-cuantizacion al tensor de embedding (`token_embd.weight`), que es el unico tensor no cubierto por el QAT. El backbone NVFP4 es identico en los tres ficheros (verificado con SHA-256 por tensor). El modelo soporta decodificacion especulativa MTP (multi-token prediction) usando un draft head externo, por ejemplo `mtp-gemma-4-31B-it-Q4_0.gguf` de unsloth.

## Capacidades

- Generacion de texto y razonamiento de proposito general con calidad de nivel frontier para un modelo de 31B.
- Razonamiento multi-step y soporte para flujos agenciales (agentic workflows), segun la documentacion oficial de Gemma 4.
- Codificacion: generacion de codigo, depuracion y explicacion en multiples lenguajes.
- Matematicas: resolucion de problemas aritmeticos y algebraicos con razonamiento paso a paso.
- Multimodalidad: procesamiento de imagenes y video (como secuencia de frames) mediante una torre de vision externa (mmproj) que no se incluye en este repo pero es compatible con cualquier mmproj de Gemma 4 31B.
- Multilingue: soporte para mas de 140 idiomas, con especial solidez en ingles y lenguas europeas.
- Tool calling / function calling: no se documenta explicitamente en la model card, pero Gemma 4 IT incluye soporte de herramientas en su plantilla de chat.
- Contexto largo: ventana nativa de 262.144 tokens, adecuada para documentos extensos, historiales largos y analisis de codigo base amplio.
- Decodificacion especulativa MTP: compatible con draft heads externos para acelerar la inferencia.

## Casos de uso

- Asistente de codigo en entornos de desarrollo integrado: el modelo puede autocompletar, refactorizar y explicar fragmentos de codigo en multiples lenguajes, con una ventana de contexto amplia que permite cargar repositorios completos o multiples archivos relacionados.
- Analisis de documentos legales o tecnicos extensos: gracias a los 262.144 tokens de contexto, puede resumir contratos, informes o documentacion tecnica de cientos de paginas sin perder informacion critica.
- Procesamiento multimodal de imagenes y video: combinado con un mmproj, puede describir contenido visual, extraer texto de imagenes (OCR) o responder preguntas sobre frames de video, util en moderacion de contenido o accesibilidad.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno con historial largo y puede integrarse con herramientas externas mediante function calling para consultar bases de datos o sistemas de ticketing.
- Generacion de contenido multilingue: redaccion, traduccion y adaptacion de textos en mas de 140 idiomas, con calidad consistente en ingles y lenguas principales.
- Razonamiento agencial (agentic reasoning): el modelo puede planificar y ejecutar tareas de varios pasos, como investigacion web, analisis de datos o automatizacion de procesos, usando herramientas y memoria de contexto largo.
- Despliegue en entornos Blackwell de alta eficiencia: al estar cuantizado nativamente en NVFP4, es adecuado para servidores de inferencia con GPUs como RTX PRO 4000 Blackwell, B200 o GB200, donde el formato FP4 reduce el ancho de banda de memoria y el consumo energetico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible de este repositorio. La model card no incluye metricas de calidad, solo mediciones de rendimiento de inferencia realizadas en una RTX PRO 4000 Blackwell SFF (24 GiB) con llama.cpp, usando SPEED-Bench throughput_16k / high_entropy, osl 1024:

| Config | Prefill (t/s) | Decode (t/s) |
|---|---|---|
| Q8_0-embd, sin MTP | 1003 | 15,7 |
| Q8_0-embd + MTP draft | 974 | 23,6 (accept ≈ 0,48) |

Estos valores indican que el formato NVFP4 nativo permite prefill muy rapido y una velocidad de decodificacion razonable para un modelo de 31B, mejorable con decodificacion especulativa.

## Requisitos de hardware

- GPU obligatoria: arquitectura Blackwell (sm_100/sm_120). Sin ella, el formato NVFP4 no se puede ejecutar de forma nativa y pierde todo su sentido.
- VRAM estimada por archivo:
  - ORIG (embeddings BF16): 19,31 GB
  - Q8_0-embd: 17,99 GB
  - Q4_K-embd: 17,29 GB
- GPU recomendadas: RTX PRO 4000 Blackwell SFF (24 GiB, usada en las pruebas), RTX PRO 5000/6000 Blackwell, B200, GB200, o cualquier GPU con soporte FP4 nativo.
- Cabe en GPUs de consumo Blackwell de 24 GB (como la RTX PRO 4000) y en tarjetas profesionales de 24 GB o superiores.
- Opciones de despliegue: llama.cpp / llama-server con soporte `BLACKWELL_NATIVE_FP4`. Tambien puede usarse con otros motores que soporten GGUF y FP4 nativo, aunque no se mencionan en la documentacion.
- Latencia y throughput: medidos en RTX PRO 4000 Blackwell SFF (ver tabla de rendimiento). Con MTP draft, se alcanza ~23,6 tokens/s en decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (Gemma 4 31B IT NVFP4) | 31B | 262.144 | NVFP4 nativo + embeddings BF16/Q8_0/Q4_K | Apache 2.0 | GGUF, requiere Blackwell |
| google/gemma-4-31B-it (original) | 31B | 256K | Sin cuantizar (BF16/FP32) | Gemma license (Apache 2.0 para pesos) | Safetensors, requiere ~62 GB VRAM |
| unsloth/gemma-4-31B-it-qat-GGUF | 31B | 256K | QAT Q4_0 (GGUF) | Apache 2.0 | GGUF, compatible con GPUs no Blackwell |

La principal diferencia frente al modelo original es el formato de cuantizacion: NVFP4 nativo solo funciona en Blackwell, mientras que el QAT Q4_0 de unsloth es portable a cualquier GPU. En terminos de calidad, el QAT NVFP4 fue entrenado especificamente para ese formato, por lo que deberia ofrecer mejor fidelidad que una cuantizacion PTQ equivalente, aunque no se aportan benchmarks comparativos.

## Limitaciones y advertencias

- Requiere hardware Blackwell (sm_100/sm_120). En GPUs de otras arquitecturas (Ampere, Ada, Hopper) el modelo no se puede ejecutar de forma nativa en NVFP4, y cualquier conversion a otro formato perderia la ventaja del QAT.
- Los tiers de embedding (Q8_0 y Q4_K) son cuantizacion post-entrenamiento (PTQ) sobre un unico tensor. Aunque el backbone es identico, la calidad del embedding se degrada ligeramente respecto al archivo ORIG; Q8_0 es mas cercano a BF16 que Q4_K.
- El modelo es multimodal pero no incluye el mmproj; hay que descargarlo por separado (por ejemplo, de unsloth) para usar vision.
- No se aportan benchmarks de calidad (MMLU, HumanEval, etc.) en este repositorio; las capacidades descritas se basan en la documentacion oficial de Gemma 4 y en la model card.
- Como cualquier modelo generativo, puede producir alucinaciones, especialmente en tareas de razonamiento complejo o con informacion poco frecuente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de Google para Gemma 4 (enlace en la model card) y las politicas de uso aceptable.
- El contexto de 262.144 tokens consume mucha memoria KV cache; en la configuracion de ejemplo se usa `-c 81920` (80K) para limitar el uso de VRAM. Para contextos maximos se necesitarian GPUs con mas de 24 GB.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BroLaurens/gemma-4-31B-it-qat-NVFP4-GGUF
- Checkpoint base: https://huggingface.co/melcheikh/gemma-4-31B-it-qat-NVFP4-mse-Blackwell
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B
- Checkpoint QAT de Google: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- mmproj recomendado (unsloth): https://huggingface.co/unsloth/gemma-4-31B-it-qat-GGUF
- Pagina oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de NVIDIA NIM para Gemma 4 31B IT: https://build.nvidia.com/google/gemma-4-31b-it/modelcard
