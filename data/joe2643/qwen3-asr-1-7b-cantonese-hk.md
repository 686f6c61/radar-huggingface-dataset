# joe2643/Qwen3-ASR-1.7B-Cantonese-HK

## Resumen

Qwen3-ASR-1.7B-Cantonese-HK es un ajuste fino de parámetros completos del modelo de reconocimiento automático de voz Qwen3-ASR-1.7B de Alibaba Qwen, publicado por el usuario joe2643. Su objetivo es especializar el modelo base en cantones coloquial de Hong Kong (yue-HK) y en habla con cambio de código cantones-inglés, un escenario muy frecuente en la región pero mal cubierto por los sistemas ASR genéricos. El modelo emite de forma nativa chino tradicional de Hong Kong con caracteres coloquiales (係, 喺, 嘅, 咗, 㗎) y conserva las palabras en inglés en inglés.

El modelo parte de la revisión `7278e1e` del modelo base y se distribuye en formato Transformers BF16 (config.json + model.safetensors), con aproximadamente 2.038 millones de parámetros. No hay adaptador LoRA/PEFT separado: es un fine-tune completo. La versión actual es la v2 (2026-11-10), una segunda etapa de ajuste sobre la v1 (revisión `399c5ef`).

Es relevante porque demuestra que un modelo ASR de 1.7B puede superar ampliamente a whisper-large-v3 en cantonés (3,95 % frente a 20,97 % de CER en FLEURS) tras un ajuste específico, y porque ofrece variantes de cuantización (GGUF, FP8, NVFP4) y una integración nativa con ComfyUI-Drama3, lo que facilita su despliegue en entornos de producción y en flujos creativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR basado en Qwen3-ASR; tipo `qwen3_asr` en Transformers) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (original); GGUF Q4_K_M / Q6_K / Q8_0 con mmproj; FP8 W8A8 (compressed-tensors); NVFP4A16 (compressed-tensors) |
| Idiomas soportados | yue (cantonés, yue-HK), zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers BF16); GGUF; FP8; NVFP4; layout ComfyUI-Drama3 |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parámetros completos del Qwen3-ASR-1.7B, un modelo de reconocimiento automático de voz de la familia Qwen3. La model card no detalla la arquitectura interna (encoder/decoder, atención, etc.), por lo que no se dispone de información sobre la composición exacta del transformer subyacente ni sobre la longitud de contexto. El ajuste se realizó en dos etapas: una v1 (revisión `399c5ef`) y una v2 (2026-11-10) que parte de la v1 y constituye la versión publicada en este repositorio.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card sí indica que el modelo se evaluó únicamente con habla en cantonés y cantones-inglés, y que el resto de idiomas puede degradarse respecto al modelo base. La salida nativa en chino tradicional de Hong Kong con caracteres coloquiales y la preservación del inglés son la innovación principal del ajuste.

## Capacidades

- Reconocimiento automático de voz (ASR) en cantonés de Hong Kong (yue-HK).
- Manejo de cambio de código cantones-inglés (code-switching), manteniendo las palabras inglesas en inglés.
- Salida nativa en chino tradicional de Hong Kong con caracteres coloquiales (係, 喺, 嘅, 咗, 㗎).
- Soporte de los idiomas yue, zh y en según los metadatos del modelo.
- Integración con la librería `qwen-asr` (backend Transformers) mediante `Qwen3ASRModel.from_pretrained` y `transcribe`.
- Compatibilidad con vLLM (formatos FP8 y NVFP4) y con `llama.cpp` (`llama-server`) vía GGUF.
- Integración nativa con ComfyUI-Drama3 mediante el nodo Load Qwen3-ASR y Qwen3-ASR Transcribe.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo thinking.

## Casos de uso

- Subtitulado de contenido audiovisual en cantonés: el modelo transcribe audio en yue-HK y emite directamente caracteres tradicionales coloquiales, lo que reduce la corrección manual posterior en plataformas de vídeo y streaming dirigidas a Hong Kong.
- Transcripción de reuniones y entrevistas con code-switching: en entornos laborales de Hong Kong es habitual mezclar cantonés e inglés; el modelo mantiene los términos ingleses en inglés (CER del 5,62 % en el conjunto MCE), lo que preserva la terminología técnica.
- Atención al cliente y centros de contacto: permite transcribir llamadas en cantonés para análisis de calidad, búsqueda y generación de actas, con un CER del 3,86 % en Common Voice yue.
- Documentación legislativa y administrativa: el conjunto LegCo (Consejo Legislativo de Hong Kong) obtiene un CER del 7,16 %, lo que lo hace adecuado para transcribir sesiones parlamentarias y actas oficiales.
- Integración en flujos de ComfyUI: mediante el layout ComfyUI-Drama3 se puede incorporar la transcripción en pipelines creativos (por ejemplo, generación de subtítulos automáticos en vídeo generado).
- Despliegue en producción con vLLM: las variantes FP8 W8A8 y NVFP4A16 permiten servir el modelo con menor uso de VRAM y más espacio para la caché KV, adecuado para APIs de transcripción con latencia ajustada.
- Ejecución local ligera con llama.cpp: la variante GGUF Q4_K_M permite desplegar el modelo en estaciones de trabajo sin GPU de gran capacidad o en entornos de escritorio.
- Investigación en ASR multilingüe: sirve como referencia de fine-tune completo sobre Qwen3-ASR para estudiar adaptación a dialectos y code-switching.

## Benchmarks y rendimiento

Resultados de Character Error Rate (CER) en modo greedy, con los pesos BF16 y `transformers`. Antes de puntuar, el texto se convierte a simplificado (OpenCC `t2s`), se normalizan números y se eliminan espacios; el idioma se fuerza a cantonés.

| Conjunto de prueba | Qwen3-ASR-1.7B original | v1 | v2 (este) | whisper-large-v3 |
|---|---:|---:|---:|---:|
| FLEURS (`yue_hant_hk`) | 4,20 % | 4,00 % | 3,95 % | 20,97 % |
| Common Voice `yue` | 5,46 % | 3,80 % | 3,86 % | 36,44 % |
| Common Voice 23 `zh-HK` | 7,65 % | 5,18 % | 5,09 % | 41,76 % |
| MDCC | 4,25 % | 2,53 % | 2,49 % | 34,52 % |
| LegCo (Consejo Legislativo de HK) | 7,22 % | 7,17 % | 7,16 % | 32,15 % |
| MCE (code-switching cantones-inglés) | 11,74 % | 5,61 % | 5,62 % | 24,00 % |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: no disponible de forma explícita; con 2.038 millones de parámetros, los pesos en BF16 ocupan aproximadamente 4,1 GB, a lo que hay que sumar la caché KV y el procesamiento de audio.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar ejecución en GPUs de consumo con suficiente VRAM, pero el autor no publica requisitos oficiales.
- ¿Cabe en GPU de consumo? No confirmado por el autor; el tamaño de pesos BF16 (~4,1 GB) sugiere que sí en GPUs con 8 GB o más, pero no hay validación publicada.
- Opciones de despliegue: `transformers` mediante `qwen-asr`, vLLM (FP8 W8A8 y NVFP4A16), `llama.cpp` / `llama-server` (GGUF Q4_K_M, Q6_K, Q8_0 con mmproj) y ComfyUI-Drama3 (layout nativo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER FLEURS yue | CER Common Voice yue | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Cantonese-HK (v2) | 2.038 M | no disponible | 3,95 % | 3,86 % | Apache 2.0 | Hugging Face (BF16, GGUF, FP8, NVFP4) |
| Qwen3-ASR-1.7B (original) | 2.038 M (base) | no disponible | 4,20 % | 5,46 % | no disponible en la información | Hugging Face |
| whisper-large-v3 | no disponible | no disponible | 20,97 % | 36,44 % | no disponible en la información | no disponible en la información |

## Limitaciones y advertencias

- Solo se evaluó con habla en cantonés y cantones-inglés; el rendimiento en otros idiomas puede ser peor que el del modelo base.
- El CER en el conjunto LegCo (7,16 %) es el más alto de los evaluados, lo que indica margen de mejora en habla formal o con ruido de sala.
- No se documentan sesgos conocidos, pero al ser un ajuste sobre habla de Hong Kong puede presentar sesgos dialectales y de registro coloquial.
- Riesgo de alucinación en ASR: no se han publicado métricas específicas de inserciones o alucinaciones en audio ruidoso.
- La integración con ComfyUI-Drama3 no ha sido probada por el autor dentro de ComfyUI; la model card pide abrir una discusión si no carga.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3-ASR-1.7B y de los datasets de evaluación empleados.
- El repositorio tiene muy poca tracción (2 descargas, 0 likes en el momento de la consulta), por lo que la validación comunitaria es escasa.
- No se dispone de información sobre la longitud de contexto ni sobre el comportamiento con audios largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio GitHub: https://github.com/joe2643/qwen3-asr-cantonese-hk
- Variante GGUF: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Variante FP8: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-FP8
- Variante NVFP4: https://huggingface.co/joe2643/Qwen3-ASR-1.7B-Cantonese-HK-NVFP4
- ComfyUI-Drama3: https://github.com/PedroMarinhoDev/ComfyUI-Drama3
- Conversión oficial de Qwen3-ASR para ComfyUI: https://huggingface.co/PedroMarinhoDev/Qwen3-ASR-ComfyUI
- OraType: https://github.com/sennett-lau/oratype
