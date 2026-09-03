# sakamakismile/gpt-oss-120b-abliterated-EXL3-6bpw

## Resumen

El modelo `sakamakismile/gpt-oss-120b-abliterated-EXL3-6bpw` es una cuantización en formato EXL3 (ExLlamaV3) a 6.0 bits por peso (bpw) del checkpoint `wangzhang/gpt-oss-120b-abliterated`, que a su vez es una versión "abliterated" (con supresión de rechazos) del modelo open-weight `openai/gpt-oss-120b` de OpenAI. Este último es un modelo de arquitectura MoE (Mixture of Experts) con 128 expertos, 117 mil millones de parámetros totales y solo 5.1 mil millones activos por token, lo que lo hace eficiente para inferencia. La cuantización EXL3 reduce el tamaño del modelo a unos 87 GB (13 shards safetensors) y permite ejecutarlo en configuraciones de hardware más modestas, incluyendo una única GPU con los expertos en CPU. El modelo mantiene la ventana de contexto nativa de 128k tokens y el formato de respuesta "harmony" (canales analysis, commentary y final) del original.

Esta versión es relevante porque combina la capacidad de razonamiento y tool calling del gpt-oss-120b con una cuantización optimizada para ExLlamaV3, que además corrige un problema de carga de los pesos bf16 del checkpoint abliterated. El autor, Lna-Lab (YUKI), ha verificado la corrección de la cuantización comparando la salida de la capa 0 con la referencia de transformers (error relativo 4e-4, coseno 1.0). Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 128 expertos, basada en gpt-oss-120b |
| Parametros totales | 117B (original); el archivo safetensors reporta 46.430.774.080 elementos, pero corresponde a la representación cuantizada |
| Parametros activos | 5.1B |
| Longitud de contexto | 128k (nativa) |
| Tipos de cuantizacion | EXL3 6.0 bpw (decoder), 8 bpw head (formato harmony) |
| Idiomas soportados | en, ja, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (13 shards, EXL3) |

## Arquitectura y entrenamiento

El modelo base `gpt-oss-120b` es un transformer MoE con 128 expertos y activación de 5.1B parámetros por token. La versión abliterated de wangzhang elimina los rechazos (refusal) del modelo original, manteniendo la arquitectura y los pesos. La cuantización EXL3 a 6.0 bpw se realizó con ExLlamaV3 1.4.5, aplicando un parche para manejar correctamente la disposición intercalada de gate/up en el `gate_up_proj` del checkpoint bf16, así como la carga de los sesgos de experto. El resultado se verificó contra la referencia de transformers. No se dispone de información detallada sobre los datos de entrenamiento del modelo original (OpenAI no los ha publicado), pero se sabe que el modelo fue entrenado con un enfoque de razonamiento y tool use, y que la versión abliterated no añade entrenamiento adicional, solo modifica los pesos para reducir la probabilidad de respuestas de rechazo.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de matemáticas, lógica y análisis.
- Soporte de tool calling / function calling a través del canal "commentary" del formato harmony.
- Formato de respuesta harmony con tres canales: analysis (razonamiento interno), commentary (llamadas a herramientas) y final (respuesta al usuario).
- Capacidades multilingües en inglés, japonés y chino.
- Ventana de contexto de 128k tokens, adecuada para documentos largos y conversaciones multi-turno.
- Modo de razonamiento explícito (analysis channel) que puede controlarse con `reasoning_effort`.
- Compatible con el servidor OpenAI-compatible incluido en el repo, que gestiona el formato harmony y el streaming SSE.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (128k tokens) y utilizar tool calling para consultar bases de datos o sistemas de ticketing, gracias al canal commentary.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, con la ventaja de que los 5.1B activos permiten baja latencia en hardware moderado.
- Análisis de documentos extensos: su contexto de 128k permite procesar informes, contratos o artículos científicos completos, extrayendo información y generando resúmenes estructurados.
- Asistentes de investigación: el canal analysis permite razonamiento paso a paso, útil para tareas de síntesis de literatura o resolución de problemas complejos.
- Chatbots sin censura para entornos controlados: al ser abliterated, puede generar respuestas sin rechazos, útil en aplicaciones de rol, escritura creativa o simulación de personajes, siempre que se cumplan las políticas de uso.
- Despliegue en hardware limitado: con la opción de 1 GPU + expertos en CPU (2.3 GB VRAM), puede ejecutarse en estaciones de trabajo sin GPUs de gama alta, ideal para prototipado o entornos con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye mediciones de velocidad de inferencia (ver requisitos de hardware), pero no puntuaciones en MMLU, HumanEval, GSM8K u otros. Para referencia, el modelo original gpt-oss-120b de OpenAI reporta rendimiento superior a modelos abiertos similares en tareas de razonamiento, pero esos datos no se han replicado para esta cuantización.

## Requisitos de hardware

Según las mediciones del autor en una configuración con 12 GPUs RTX PRO 2000 Blackwell de 16 GB:

- **Tensor parallel (TP=7)**: 7 GPUs de 16 GB, VRAM 13.9 GB por GPU, velocidad de 73.9 tok/s en inglés, 64.1 en japonés, 69.6 en código (single stream, 128 tokens).
- **Tensor parallel (TP=8)**: 8 GPUs, VRAM 12.3 GB por GPU, velocidad de 73.0 tok/s en inglés.
- **Layer-split en 8 GPUs**: 38.7 tok/s, VRAM 12.8 GB por GPU.
- **1 GPU + expertos en CPU** (con `-mcl 36`, 64 threads): 31.2 tok/s en inglés, VRAM 2.3 GB. Prefill: 303 tok/s a 256 tokens, 528 a 1k, 1,225 a 4k, 1,542 a 16k (16k en 10.6 s).
- **Multi-stream en TP=7**: no es monotónico (1 stream 73, 2 → 25, 4 → 136, 8 → 80 tok/s); se recomienda usar un solo stream o exactamente cuatro.

Opciones de despliegue: ExLlamaV3 1.4.5 (requiere parches para gpt-oss), servidor OpenAI-compatible incluido (`lna-lab/serve-gptoss.py`), compatible con GPUs Blackwell, Ada y Ampere. No se menciona soporte para vLLM, llama.cpp u Ollama en esta cuantización específica.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| gpt-oss-120b (original) | 117B | 5.1B | 128k | Apache-2.0 | bf16, MXFP4 |
| gpt-oss-120b-abliterated (wangzhang) | 117B | 5.1B | 128k | Apache-2.0 | bf16 |
| gpt-oss-120b-abliterated-EXL3-6bpw (este) | 117B | 5.1B | 128k | Apache-2.0 | EXL3 6.0 bpw |
| gpt-oss-20b-abliterated-EXL3-6bpw (hermano) | 20B (aprox.) | no disponible | 128k | Apache-2.0 | EXL3 6.0 bpw |

La principal diferencia con el original es el formato de pesos y el tamaño en disco (87 GB vs ~230 GB en bf16). Frente a la versión 20B, este modelo ofrece mayor capacidad de razonamiento y tool calling, pero requiere más VRAM en configuraciones tensor parallel. No se dispone de comparativas de rendimiento con otros MoE como Mixtral o DeepSeek en la información proporcionada.

## Limitaciones y advertencias

- Al ser una versión "abliterated", el modelo puede generar contenido que el modelo original rechazaría, incluyendo respuestas sesgadas, ofensivas o peligrosas. Debe usarse con moderación y en entornos donde se apliquen filtros adicionales si es necesario.
- La cuantización a 6.0 bpw puede introducir una ligera degradación en la calidad de las respuestas en comparación con el modelo en bf16, aunque el autor verificó la corrección de la capa 0.
- El modelo solo soporta los idiomas en, ja, zh; no se garantiza un buen rendimiento en otros idiomas.
- La configuración multi-stream en TP=7 presenta un comportamiento no monotónico no resuelto; se recomienda usar un solo stream o exactamente cuatro.
- Se requieren parches específicos para ExLlamaV3 1.4.5 para cargar y ejecutar el modelo correctamente; sin ellos, la generación falla o produce ruido.
- El servidor incluido es un script de Python con dependencias mínimas (stdlib + jinja2), pero no es un servidor de producción completo; para despliegues a gran escala se necesitaría integrar con frameworks como vLLM (no soportado actualmente para este formato).
- La licencia Apache-2.0 permite uso comercial, pero el modelo original de OpenAI tiene sus propias políticas de uso que podrían aplicar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sakamakismile/gpt-oss-120b-abliterated-EXL3-6bpw
- Modelo base abliterated: https://huggingface.co/wangzhang/gpt-oss-120b-abliterated
- Modelo original de OpenAI: https://huggingface.co/openai/gpt-oss-120b
- Blog de OpenAI sobre gpt-oss: https://openai.com/index/introducing-gpt-oss/
- Repositorio GitHub de gpt-oss: https://github.com/openai/gpt-oss
- Documentación de la API de OpenAI para gpt-oss-120b: https://developers.openai.com/api/docs/models/gpt-oss-120b
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
