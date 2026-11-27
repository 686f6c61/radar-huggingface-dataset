# Atlas3D/Inkling-2-Mini-Omni-Platos-Keys

## Resumen

Inkling-2-Mini-Omni-Platos-Keys es un conjunto de proyecciones lineales en forma cerrada ("Plato's Keys") publicadas por Atlas3D que actúan como puente entre el tronco congelado del modelo de lenguaje `thinkingmachines/Inkling-2-Mini` y diversos decodificadores externos de imagen, audio-vídeo, música simbólica y estilo de voz. El tronco base no se entrena ni se modifica: el autor declara explícitamente `0` pasos de gradiente y `0` actualizaciones de pesos, de modo que el artefacto no es un modelo generativo autónomo sino un conjunto de matrices de proyección serializadas en FP16 y ajustadas en FP64.

La propuesta técnica consiste en eliminar los codificadores de texto de los pipelines de difusión sustituyéndolos por proyecciones derivadas del espacio latente de Inkling-2-Mini. Según la model card, esto permite prescindir de codificadores como `Qwen3-VL-32B` (27,14 GB), `Mistral-Small-3.1-24B` (44,7 GiB) o `T5-XXL`, con una reducción de hasta 44,7 GiB de memoria. El repositorio ocupa 1,8 GB y contiene los ficheros `.safetensors` correspondientes a cada ruta de proyección.

Es relevante ahora por su enfoque poco habitual: en lugar de un fine-tuning convencional, propone un método de "injerto" omni-modal sin gradientes, con métricas de retención declaradas por el autor y, de forma destacable, con límites de fallo publicados explícitamente (por ejemplo, SDXL y el codificador de estilo de Qwen3-TTS). La información disponible sobre el tronco base, la arquitectura interna o los datos de entrenamiento es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Proyecciones lineales en forma cerrada ("Plato's Keys") sobre un tronco transformer congelado (`thinkingmachines/Inkling-2-Mini`); arquitectura interna del tronco no disponible |
| Parámetros totales | no disponible (el repositorio contiene matrices de proyección, no un modelo completo; tamaño del repo: 1,8 GB) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos serializados en FP16, ajuste en FP64) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16); manifiesto `MANIFEST.sha256.json` con digests SHA-256 por fichero |

## Arquitectura y entrenamiento

El artefacto no entrena el modelo base. Según la model card, las claves se obtienen mediante un ajuste en forma cerrada en FP64 que posteriormente se serializa en FP16, mapeando el espacio de representación del tronco `Inkling-2-Mini` (congelado, sin pasos de gradiente ni actualizaciones de pesos) hacia los espacios de condicionamiento que esperan distintos decodificadores. El método se describe en el documento "Zero-Gradient Omni-Modal Grafting" (v0.9) del repositorio `Atlas3DSS/atlas-ingine`.

Las rutas cubiertas incluyen decodificadores de imagen (Z-Image Turbo/Base, FLUX.2-klein-4B/9B, FLUX.2-dev, Qwen-Image-2.1, p_image_oss, moss_image, FLUX.1-dev/schnell, SDXL), vídeo con audio nativo (`MiniMax-H3 FL2VA/Ref2VA`), música simbólica en formato ABC (`YuE2-3B`) y estilo de voz (`Qwen3-TTS`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, dado que el procedimiento declarado no implica entrenamiento por gradiente.

## Capacidades

- Proyección del espacio latente de `Inkling-2-Mini` hacia el espacio de condicionamiento de decodificadores de imagen de difusión, sustituyendo al codificador de texto original.
- Condicionamiento de vídeo con audio nativo para `MiniMax-H3` en las variantes FL2VA y Ref2VA.
- Condicionamiento de generación de música simbólica en notación ABC para `YuE2-3B`.
- Intento de transferencia de estilo de voz hacia `Qwen3-TTS` VoiceDesign (con resultado declarado como fallo parcial).
- No se documentan en la información disponible capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo propias: el artefacto es un conjunto de puentes de proyección, no un modelo conversacional.
- No se documentan modos especiales como thinking mode, visión nativa o audio de entrada en el propio artefacto.

## Casos de uso

- Sustitución del codificador de texto en pipelines de difusión para reducir memoria: en `FLUX.2-dev`, la clave reemplaza a `Mistral-Small-3.1-24B` (44,7 GiB) según la model card, lo que permitiría ejecutar el pipeline en GPUs con menos VRAM.
- Generación de imagen con `Z-Image` Turbo y Base sin cargar el codificador de texto original, con un ahorro declarado de 8,10 GB de VRAM.
- Generación de vídeo con audio mediante `MiniMax-H3` en FL2VA/Ref2VA sin cargar `Qwen3-VL-32B` (27,14 GB) como codificador.
- Composición musical simbólica: condicionar `YuE2-3B` para generar notación ABC a partir de representaciones de Inkling-2-Mini, con métricas declaradas de `cos = 0,9400` y `R² = 0,9048` en 32 canciones reservadas.
- Investigación en transferencia de representaciones: usar las claves como banco de pruebas para estudiar la alineación entre espacios latentes de un LLM y decodificadores multimodales, con límites de fallo publicados (SDXL, Qwen3-TTS).
- Validación de reproducibilidad en pipelines de CI: los digests SHA-256 de `MANIFEST.sha256.json` permiten verificar la integridad de cada fichero antes de cargarlo en producción.
- Prototipado de pipelines de imagen ligeros en GPUs de consumo: las claves de `Z-Image`, `FLUX.2-klein-4B` o `Qwen-Image-2.1` están pensadas para evitar cargar codificadores de decenas de GB, aunque no se especifican requisitos exactos de VRAM.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del autor; no son benchmarks estándar (MMLU, HumanEval, GSM8K) sino métricas de retención de las proyecciones.

| Ruta / decodificador | Codificador reemplazado | Resultado declarado |
|---|---|---|
| MiniMax-H3 (imagen + FL2VA/Ref2VA) | `Qwen3-VL-32B` (27,14 GB) | 97,50 % de retención de margen SigLIP2 en Sealed Confirm-160 (640 imágenes, 16/16 victorias ortogonales DINOv3, p = 3,05e-5) |
| YuE2-3B (música ABC) | ruta de prompt de YuE2 | cos = 0,9400, R² = 0,9048 en 32 canciones reservadas; rollout de 32 pasos: 31/32 (96,9 %) y 29/32 (90,6 %) |
| Z-Image Turbo y Base | codificador de texto upstream (−8,10 GB VRAM) | Turbo 98,88 %, Base 101,19 % (16/16, p = 3,05e-5); cos V100↔Blackwell = 0,99999998 |
| FLUX.2-klein-4B Turbo y Base | codificador de texto upstream | Turbo 97,73 %, Base 83,49 % (16/16, p = 3,05e-5); cos V100↔Blackwell = 0,99999993 |
| Qwen-Image-2.1 Turbo y Base | `Qwen3-VL-8B` | Turbo 96,37 %, Base 98,80 % (16/16, p = 3,05e-5) |
| FLUX.2-dev | `Mistral-Small-3.1-24B` (44,7 GiB) | 99,65 % de retención nativa (16/16, p = 3,05e-5) |
| p_image_oss | codificador de texto upstream | Dev-24: 99,09 %; Confirm-160: cos = 0,9746, R² = 0,8449 |
| FLUX.2-klein-9B | codificador de texto upstream | Dev-24 Base 97,17 %; Confirm-160: cos = 0,9426, R² = 0,7197 |
| moss_image Base y Turbo | codificador de texto upstream | Dev-24 Base 98,25 % / Turbo 95,38 %; Confirm-160: cos = 0,9191, R² = 0,6869 |
| FLUX.1-dev y FLUX.1-schnell | `T5-XXL` | Mixto: Dev-24 93,07 % / 91,44 %; Confirm-160 R² = 0,5296 (por debajo del umbral de 0,55) |
| SDXL Base y Turbo | `CLIP-L` | Fallo declarado: Dev-24 57,69 % / 42,66 %; Confirm-160 R² = 0,5403 |
| Qwen3-TTS VoiceDesign | codificador de estilo de Qwen3-TTS | Fallo declarado: estilo 21/32 frente a 11/32 (p = 0,1102); injerto léxico continuo directo 0/32 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; el repositorio de claves ocupa 1,8 GB y el tronco `Inkling-2-Mini` debe cargarse aparte, con requisitos no especificados.
- Ahorro declarado de VRAM: hasta 44,7 GiB al sustituir `Mistral-Small-3.1-24B` en FLUX.2-dev; 27,14 GB al sustituir `Qwen3-VL-32B` en MiniMax-H3; 8,10 GB en Z-Image.
- GPUs mencionadas en la model card: Blackwell (Dev-24) para las validaciones de imagen y V100 para la comprobación de consistencia entre dispositivos (cos ≈ 0,99999998).
- GPU de consumo: no se especifica compatibilidad con RTX 4090 u otras GPUs de consumo; el ahorro de VRAM sugiere viabilidad en algunos pipelines, pero no hay datos confirmados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato es safetensors para cargar en los pipelines de los decodificadores correspondientes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / artefacto | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Omni-Platos-Keys | Proyecciones lineales sobre tronco congelado | no disponible (repo 1,8 GB) | no disponible | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| `thinkingmachines/Inkling-2-Mini` | Modelo base (tronco) | no disponible | no disponible | no disponible | Hugging Face |
| Codificadores reemplazados (`Qwen3-VL-32B`, `Mistral-Small-3.1-24B`, `T5-XXL`, `CLIP-L`) | Codificadores de texto para difusión | 32B / 24B / ~11B / ~123M (según variante) | no disponible | según modelo | Hugging Face / upstream |

No se dispone de datos de benchmarks estándar ni de alternativas directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere el tronco `Inkling-2-Mini` y el decodificador correspondiente; no genera texto, código ni razonamiento por sí mismo.
- Límites de fallo publicados por el autor: SDXL (R² = 0,5403, por debajo del umbral) y Qwen3-TTS VoiceDesign (p = 0,1102, sin significación; injerto léxico directo 0/32). No deben usarse esas rutas en producción.
- FLUX.1-dev/schnell queda en resultado mixto (R² = 0,5296, por debajo del umbral de 0,55 en Confirm-160).
- Las métricas son autoinformadas por el autor y no han sido replicadas de forma independiente en la información disponible; los tamaños de muestra (Confirm-160, 32 canciones) son limitados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del artefacto; al heredar el tronco de Inkling-2-Mini, podrían propagarse los sesgos de este, pero no hay datos disponibles.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero los decodificadores y el tronco base tienen sus propias licencias que deben verificarse por separado.
- La fecha de creación del repositorio (2026-11-27) y la referencia a modelos como `MiniMax-H3`, `FLUX.2` o `Qwen-Image-2.1` no pueden contrastarse con la información disponible; conviene verificar la vigencia de cada componente antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Atlas3D/Inkling-2-Mini-Omni-Platos-Keys
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Paper (v0.9): https://github.com/Atlas3DSS/atlas-ingine/blob/feat/zero-gradient-omni-modal-grafting/modules/zero_gradient_omni_modal_grafting/PAPER.md
- Tutorial: https://github.com/Atlas3DSS/atlas-ingine/blob/feat/zero-gradient-omni-modal-grafting/modules/zero_gradient_omni_modal_grafting/TUTORIAL.md
- Colección "Omni by Atlas": https://huggingface.co/collections/Atlas3D/omni-by-atlas-6b09daccd0f65e23233163b3
