# IndexTeam/Index-Translate-omni-35B-FP8

## Resumen

Index-Translate-omni-35B-FP8 es la exportación cuantizada en FP8 del modelo multimodal de traducción Index-Translate-Omni 35BA3B, desarrollado por IndexTeam. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, diseñado específicamente para tareas de traducción y transcripción: traducción de texto multilingüe, traducción de imágenes, reconocimiento automático de voz (ASR) y traducción bidireccional chino-inglés de audio. El modelo se distribuye bajo licencia Apache 2.0 y se apoya en la librería Transformers.

La relevancia de esta exportación radica en su enfoque de cuantización mixta: los pesos del módulo de lenguaje se comprimen a FP8 con escalas por canal y activaciones dinámicas por token (`FP8_DYNAMIC`), mientras que los tensores visuales se mantienen en FP32 y los módulos de audio en BF16 originales. Esto reduce el peso del componente principal sin degradar los módulos sensibles de percepción. No obstante, el runtime incluido utiliza cómputo en BF16 tras la descompresión (`dequantize=True`), por lo que no se anuncia aceleración real por kernels FP8.

El modelo cubre cuatro modalidades (texto, imagen y audio como entrada; texto como salida) con un único codificador de audio compartido para todas las tareas de voz. Está orientado a pipelines de traducción profesional con restricciones de terminología y formato, y su ventana de contexto, tipos de cuantización adicionales y número exacto de tokens de entrenamiento no se detallan en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Mixture-of-Experts (MoE); módulos de lenguaje, visión y audio |
| Parámetros totales | 35B (35BA3B) |
| Parámetros activos | 3B (aproximado, según nomenclatura 35BA3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (lenguaje, `FP8_DYNAMIC` con escalas por canal); FP32 (visión); BF16 (audio); `lm_head` y embeddings sin cuantizar |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers; runtime propio `joint_runtime`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal compuesta por tres bloques diferenciados: un módulo de lenguaje con mezcla de expertos (35B totales, ~3B activos), un codificador visual y un codificador/decodificador de audio compartido para las cuatro tareas de voz (ASR en chino, ASR en inglés, traducción inglés→chino y chino→inglés). La exportación FP8 conserva 693 tensores de lenguaje, 333 tensores visuales y 529 tensores de audio compartido, con 74 archivos fijados por SHA-256 (manifiesto `d3c6a02b...c87f05`).

La cuantización aplica FP8 con escalas por canal a las proyecciones lineales del módulo de lenguaje, incluidas las proyecciones de atención lineal, mientras que `lm_head` y los embeddings de tokens permanecen sin cuantizar. Los pesos visuales se mantienen en FP32 byte-idénticos al origen y los módulos de audio en BF16 original. El runtime `JointModel` solicita explícitamente `dequantize=True` para compressed-tensors, lo que implica que el cómputo se realiza en BF16 tras la carga; no se trata de una aceleración por kernels FP8 nativos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Traducción de texto multilingüe con soporte de restricciones de terminología y formato (evaluado en FLORES, WMT24++, WMT26 y MEME).
- Seguimiento de instrucciones de traducción (`instTrans`, `IFMTBench`) con control de calidad y desviación de formato (`off-target`).
- Traducción de imágenes (image-to-text): extracción y traducción de texto presente en imágenes.
- Reconocimiento automático de voz (ASR) en chino e inglés con un codificador de audio compartido.
- Traducción bidireccional de voz chino↔inglés (speech-to-text translation).
- Generación de texto multimodal mediante `image_generate(messages)` con mensajes imagen-texto de Transformers.
- Generación de audio limitada a 256 tokens nuevos por petición.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Traducción profesional de documentación técnica: el modelo permite aplicar glosarios y restricciones de terminología, lo que lo hace adecuado para localizar manuales y especificaciones donde la consistencia terminológica es crítica.
- Localización de interfaces y contenido visual: mediante `image_generate`, puede extraer y traducir texto embebido en capturas, carteles o maquetas, útil en flujos de localización de productos.
- Subtitulado y transcripción de reuniones bilingües chino-inglés: el codificador de audio compartido permite ASR y traducción en un solo paso, reduciendo la latencia frente a pipelines separados.
- Atención al cliente en centros de contacto bilingües: la transcripción y traducción de audio en tiempo casi real facilita la comunicación entre agentes y clientes que hablan chino o inglés.
- Generación de contenido multilingüe asistida: traducción de artículos, correos y material de marketing con control de formato mediante instrucciones, evaluado en `IFMTBench`.
- Investigación en traducción automática multimodal: el modelo sirve como referencia para estudiar el rendimiento de arquitecturas MoE en tareas combinadas de texto, imagen y voz, con benchmarks publicados (COMET22, CER, BLEU, chrF2).
- Digitalización de archivos escaneados: combinación de OCR implícito vía módulo visual y traducción directa a inglés o chino para fondos documentales.

## Benchmarks y rendimiento

Los resultados corresponden al modelo original Index-Translate-Omni 35BA3B, no a esta exportación FP8 (el autor indica que no son nuevos benchmarks de la versión cuantizada).

Traducción de texto:

| Modelo | FLORES COMET22 ↑ | WMT24++ COMET22 ↑ | WMT26 Judge ↑ | MEME ↑ |
|---|---:|---:|---:|---:|
| Index-Translate 2B | 0.8655 | 0.8489 | 60.26 | 0.6443 |
| Index-Translate 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |
| Index-Translate 35BA3B (preview) | 0.8794 | 0.8586 | 76.76 | 0.7405 |
| Index-Translate-Omni 35BA3B | 0.8795 | 0.8593 | 78.01 | 0.7405 |

Seguimiento de instrucciones:

| Modelo | instTrans Quality / IFscore ↑ | instTrans_minor Quality / IFscore ↑ / Off-target ↓ | IFMTBench XCOMET-XXL / IFscore ↑ |
|---|---:|---:|---:|
| Index-Translate 2B | 0.5391 / 0.7569 | 0.3050 / 0.6586 / 3.97% | 0.7712 / 0.7584 |
| Index-Translate 9B | 0.6771 / 0.8209 | 0.5222 / 0.7725 / 3.47% | 0.7957 / 0.8760 |
| Index-Translate 35BA3B (preview) | 0.6901 / 0.8336 | 0.5151 / 0.7715 / 4.05% | 0.7926 / 0.8991 |
| Index-Translate-Omni 35BA3B | 0.6867 / 0.8371 | 0.5163 / 0.7843 / 3.62% | 0.7934 / 0.9070 |

Voz (CER en porcentaje, menor es mejor; BLEU y chrF2 mayor es mejor):

| Modelo | ASR chino CER ↓ | ASR inglés CER ↓ | Inglés → Chino (BLEU / chrF2 / CER) | Chino → Inglés (BLEU / chrF2 / CER) |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 13.8113 | 34.2560 | 36.982 / 30.357 / 43.3452 | 30.747 / 51.152 / 48.0670 |
| Index-Translate-Omni 9B | 17.8917 | 14.4097 | 43.507 / 36.312 / 41.3767 | 34.656 / 55.376 / 46.3720 |
| Index-Translate-Omni 35BA3B | 13.0053 | 15.4950 | 40.074 / 32.862 / 44.8097 | 32.411 / 53.452 / 46.1700 |

Traducción de imágenes (COMET22 × 100, mayor es mejor):

| Modelo | MMTIT ↑ | FLORES-rendered ↑ | Vistra ↑ |
|---|---:|---:|---:|
| Qwen3.5-2B | 52.164 | 50.187 | 55.326 |
| Index-Translate-Omni 2B | 65.809 | 53.612 | 65.596 |
| Qwen3.5-9B | 73.814 | 67.804 | 68.963 |
| Index-Translate-Omni 9B | 77.604 | 68.438 | 71.815 |
| Qwen3.5-35B-A3B | 75.602 | 70.005 | 71.067 |
| Index-Translate-Omni 35BA3B | 77.011 | 69.891 | 71.482 |

Nota del autor: los resultados de voz usan 30 muestras fijas por tarea, penalización de repetición 1.1 para ASR en inglés y decodificación original para el resto; un caso inglés→chino alcanzó el límite de 256 tokens sin traducción y se mantiene en la puntuación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 35B parámetros totales, en FP8 el peso del módulo de lenguaje ronda los 35 GB, a los que se suman los tensores visuales en FP32 y los módulos de audio en BF16; se requiere al menos una GPU con 80 GB para carga holgada.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para inferencia sin compromisos; configuraciones multi-GPU mediante `device_map='auto'`.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) por el tamaño total del checkpoint; no se documentan versiones GGUF ni cuantizaciones de menor precisión para este export.
- Opciones de despliegue: el autor proporciona el runtime propio `JointModel` (requiere `pip install -r requirements-joint.txt` y descargar el repositorio completo, incluyendo `audio/` y `audio-tokenizer/`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor advierte que el cómputo se realiza en BF16 tras la descompresión, por lo que no debe esperarse aceleración por kernels FP8.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidades | Rendimiento destacado |
|---|---|---|---|---|---|
| Index-Translate-Omni 35BA3B (FP8) | 35B totales / ~3B activos | no disponible | Apache 2.0 | texto, imagen, audio | FLORES 0.8795; WMT26 78.01; MMTIT 77.011 |
| Index-Translate-Omni 9B | 9B | no disponible | Apache 2.0 | texto, imagen, audio | FLORES 0.8789; WMT26 75.35; MMTIT 77.604 |
| Qwen3.5-35B-A3B (base) | 35B totales / ~3B activos | no disponible | no disponible | texto, imagen | MMTIT 75.602; FLORES-rendered 70.005 |
| Qwen3.5-9B (base) | 9B | no disponible | no disponible | texto, imagen | MMTIT 73.814; FLORES-rendered 67.804 |

El modelo de 35B supera a su base Qwen3.5-35B-A3B en MMTIT (77.011 frente a 75.602) y en WMT26 Judge (78.01), y queda ligeramente por debajo del 9B en MMTIT (77.604), lo que sugiere que el salto de tamaño no aporta mejoras uniformes en todas las tareas de imagen.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se documenta soporte para otras lenguas, lo que restringe su uso en mercados fuera de ese par.
- El modelo está especializado en traducción y transcripción; no se documentan capacidades generales de razonamiento, código o matemáticas, por lo que no debe emplearse como modelo de propósito general.
- Riesgo de alucinación en traducciones de audio: el autor reporta un caso inglés→chino que alcanzó el límite de 256 tokens sin generar traducción, lo que indica posibles fallos en entradas largas o ruidosas.
- La generación de audio está limitada a 256 tokens nuevos, lo que puede truncar transcripciones o traducciones extensas.
- La cuantización FP8 no se traduce en aceleración real: el runtime usa BF16 tras la descompresión (`dequantize=True`), por lo que el beneficio es de almacenamiento, no de velocidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento de la versión cuantizada; los benchmarks publicados corresponden al modelo original, no al export FP8.
- El checkpoint no incluye versiones GGUF ni cuantizaciones de menor precisión, lo que limita su despliegue en hardware de consumo.
- No se documentan sesgos específicos ni evaluaciones de seguridad; al ser un modelo de traducción, puede propagar sesgos presentes en los corpus de entrenamiento (no detallados).

## Enlaces

- Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-omni-35B-FP8
- Modelo original en ModelScope: https://modelscope.cn/models/IndexTeam/Index-Translate-omni-35B
- Benchmarks de la familia Index-Translate: https://huggingface.co/IndexTeam/Index-Translate-9B#evaluation
