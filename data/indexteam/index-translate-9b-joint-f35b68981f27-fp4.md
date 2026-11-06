# IndexTeam/Index-Translate-9B-Joint-f35b68981f27-FP4

## Resumen

Index-Translate-9B-Joint-f35b68981f27-FP4 es una exportación cuantizada en NVFP4 del modelo Index-Translate-Omni 9B, desarrollado por IndexTeam. Se trata de un modelo multimodal de traducción que combina traducción de texto multilingüe, traducción de imágenes (image-to-text), reconocimiento automático de voz y traducción bidireccional de voz chino-inglés en un único checkpoint. La relevancia de esta variante concreta reside en su empaquetado: pesos de lenguaje en NVFP4 con escalas de activación calibradas, mientras que visión (FP32) y audio (BF16) se preservan intactos para mantener la fidelidad del checkpoint original.

La arquitectura subyacente es de tipo transformer multimodal construida sobre la familia Qwen3.5, según los tags del repositorio y las referencias del autor a los modelos base Qwen3.5-9B. El modelo integra un codificador de audio y un módulo de visión junto al núcleo de lenguaje, y está orientado específicamente a tareas de traducción con restricciones de terminología y formato, además de transcripción de voz.

Esta versión FP4 es relevante para quienes necesitan desplegar el modelo en hardware Blackwell con memoria reducida, pero conviene subrayar que la ruta de inferencia acelerada nativa NVFP4 no ha sido validada por el autor; el runtime incluido descomprime los pesos a BF16 para pruebas de corrección, lo que anula el ahorro de memoria. El modelo se distribuye bajo licencia Apache 2.0 y soporta únicamente chino e inglés como idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5), con módulos de visión y audio |
| Parametros totales | 9B (según nomenclatura del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos y escalas de activación calibradas, bloques de 16 elementos, NVIDIA ModelOpt 0.44); visión en FP32; audio en BF16 |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (export ModelOpt), runtime propio `JointModel`; no compatible con `AutoModelForImageTextToText` estándar |
| Tamaño del repositorio | 1.3 GB |
| Fecha de creación | 2026-11-05 |
| Pipeline declarado | translation |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que integra tres flujos de entrada: texto, imagen y audio. La parte de lenguaje se cuantiza en NVFP4 con escalas de activación calibradas en bloques de 16 elementos mediante NVIDIA ModelOpt 0.44, mientras que los tensores de visión se mantienen en FP32 byte-idénticos al checkpoint fuente y el codificador y conector de audio permanecen en BF16. Quedan excluidos de la cuantización `lm_head`, los embeddings de tokens, los módulos de atención lineal y los routers MoE (lo que sugiere presencia de componentes tipo MoE en la arquitectura base, aunque no se detalla su configuración); las capas MLP `gate_proj` ordinarias sí se cuantizan.

No se proporcionan en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El modelo card referencia los benchmarks publicados del modelo original Index-Translate-Omni 9B, pero no documenta el proceso de entrenamiento. La innovación técnica destacable de esta exportación es la preservación selectiva de precisión por modalidad (FP32 para visión, BF16 para audio, NVFP4 para lenguaje) y la inclusión de un runtime portátil (`JointModel`) que extrae únicamente los helpers necesarios del código de audio, sin requerir el repositorio de entrenamiento original.

## Capacidades

- Traducción de texto multilingüe con soporte de restricciones de terminología y formato.
- Traducción de imágenes (image-to-text): extracción y traducción de texto presente en imágenes.
- Reconocimiento automático de voz (ASR) para chino e inglés.
- Traducción bidireccional de voz chino-inglés.
- Generación de texto general mediante `text_generate`.
- Procesamiento multimodal de imágenes mediante `image_generate` con mensajes image-text de Transformers.
- Procesamiento de audio mediante `audio_generate` con ficheros WAV.
- Seguimiento de instrucciones de traducción (evaluado con instTrans e IFMTBench según el modelo card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión avanzada o audio adicional más allá de lo descrito: no disponible.

## Casos de uso

- Traducción automática de documentación técnica chino-inglés: el modelo puede procesar texto con restricciones de terminología y formato, lo que permite mantener glosarios consistentes en manuales y especificaciones. Su evaluación en instTrans (0.6771 de calidad para la variante 9B) lo hace adecuado para entornos donde el cumplimiento de instrucciones de formato es crítico.

- Localización de interfaces y contenido visual: mediante `image_generate`, el modelo extrae y traduce texto incrustado en capturas de pantalla, infografías o material de marketing. Los resultados en MMTIT (77.604 para la variante 9B) indican un rendimiento sólido frente al baseline Qwen3.5-9B (73.814).

- Transcripción y traducción de reuniones bilingües: con ASR en chino (CER 17.89) e inglés (CER 14.41) y traducción de voz bidireccional, el modelo puede emplearse en pipelines de actas de reuniones entre equipos chinos e ingleses, generando transcripciones y traducciones en una sola pasada.

- Subtitulado y doblaje automatizado: la combinación de ASR y traducción de voz (BLEU 43.507 en inglés→chino y 34.656 en chino→inglés para la variante 9B) permite generar subtítulos traducidos y alimentar sistemas de síntesis de voz para doblaje.

- Atención al cliente multilingüe: el modelo puede gestionar conversaciones en chino e inglés con traducción en tiempo real, adecuado para empresas con clientela en ambos idiomas. La ventana de contexto no está documentada, por lo que habría que validar conversaciones multi-turno largas.

- Digitalización de archivos y formularios escaneados: la capacidad image-to-text permite extraer y traducir texto de documentos escaneados, facturas o formularios, integrándose en flujos de procesamiento documental.

- Evaluación de calidad de traducción en pipelines de CI: el modelo puede actuar como traductor de referencia o generador de candidatos en sistemas de evaluación automática, dado su rendimiento en métricas COMET22 (0.8789 en FLORES para la variante 9B).

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo original Index-Translate-Omni 9B, reproducidos por el autor en el modelo card. No son resultados nuevos de esta exportación FP4; la verificación específica de esta versión se limita a pruebas de humo (ver más abajo).

Traducción de texto:

| Modelo | FLORES COMET22 ↑ | WMT24++ COMET22 ↑ | WMT26 Judge ↑ | MEME ↑ |
|---|---:|---:|---:|---:|
| Index-Translate 2B | 0.8655 | 0.8489 | 60.26 | 0.6443 |
| Index-Translate 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |
| Index-Translate 35BA3B (preview) | 0.8794 | 0.8586 | 76.76 | 0.7405 |
| Index-Translate-Omni 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |

Seguimiento de instrucciones:

| Modelo | instTrans Quality / IFscore ↑ | instTrans_minor Quality / IFscore ↑ / Off-target ↓ | IFMTBench XCOMET-XXL / IFscore ↑ |
|---|---:|---:|---:|
| Index-Translate 9B | 0.6771 / 0.8209 | 0.5222 / 0.7725 / 3.47% | 0.7957 / 0.8760 |
| Index-Translate-Omni 9B | 0.6771 / 0.8209 | 0.5222 / 0.7725 / 3.47% | 0.7957 / 0.8760 |

Voz (CER en porcentaje, menor es mejor; celdas de traducción BLEU / chrF2 / CER objetivo):

| Modelo | ASR chino CER ↓ | ASR inglés CER ↓ | Inglés → Chino | Chino → Inglés |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 13.8113 | 34.2560 | 36.982 / 30.357 / 43.3452 | 30.747 / 51.152 / 48.0670 |
| Index-Translate-Omni 9B | 17.8917 | 14.4097 | 43.507 / 36.312 / 41.3767 | 34.656 / 55.376 / 46.3720 |
| Index-Translate-Omni 35BA3B | 18.6803 | 15.0850 | 42.081 / 35.836 / 49.2490 | 36.404 / 57.323 / 45.1546 |

Traducción de imágenes (COMET22 × 100, mayor es mejor):

| Modelo | MMTIT ↑ | FLORES-rendered ↑ | Vistra ↑ |
|---|---:|---:|---:|
| Qwen3.5-2B | 52.164 | 50.187 | 55.326 |
| Index-Translate-Omni 2B | 65.809 | 53.612 | 65.596 |
| Qwen3.5-9B | 73.814 | 67.804 | 68.963 |
| Index-Translate-Omni 9B | 77.604 | 68.438 | 71.815 |
| Qwen3.5-35B-A3B | 75.602 | 70.005 | 71.067 |
| Index-Translate-Omni 35BA3B | 77.011 | 69.891 | 71.482 |

Verificación específica de esta exportación FP4: recarga del checkpoint y generación de texto superadas; el runtime portátil pasó una llamada de texto, una de descripción de imagen y una de voz real a inglés sobre una H100. Perplejidad de texto: 28.5391 sobre 250 tokens reservados en modo de carga de referencia. El autor indica explícitamente que son pruebas de humo pequeñas, no benchmarks exhaustivos de calidad.

## Requisitos de hardware

- Inferencia nativa NVFP4: requiere un backend compatible con la generación Blackwell. El autor advierte que la H100 no es Blackwell y que el servicio nativo Blackwell no ha sido validado.
- El runtime incluido (`JointModel`) descomprime los pesos a BF16 para pruebas de corrección, por lo que necesita memoria del tamaño BF16 (aproximadamente 18 GB solo para los pesos de lenguaje de 9B, más visión en FP32 y audio en BF16) y no constituye una ruta de servicio FP4 acelerada.
- No debe usarse `AutoModelForImageTextToText.from_pretrained` directamente sobre esta exportación ModelOpt.
- VRAM estimada para inferencia acelerada FP4: no disponible (no validada por el autor).
- GPU recomendadas: no disponible más allá de la mención genérica a hardware Blackwell.
- ¿Cabe en GPU de consumo? No disponible; la ruta de referencia en BF16 no cabe en GPUs consumer típicas de 8-12 GB.
- Opciones de despliegue: runtime propio `JointModel` (con `requirements-joint.txt`); vLLM, llama.cpp, Ollama o TGI no están documentados como compatibles con esta exportación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Traducción texto (FLORES COMET22) | Idiomas | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|---|
| Index-Translate-Omni 9B (FP4, este) | 9B | no disponible | 0.8789 (referencia original) | zh, en | Apache 2.0 | Hugging Face |
| Index-Translate 9B (texto) | 9B | no disponible | 0.8789 | no disponible | no disponible | Hugging Face |
| Index-Translate-Omni 2B | 2B | no disponible | 0.8655 | zh, en | no disponible | Hugging Face |
| Qwen3.5-9B (baseline multimodal) | 9B | no disponible | no disponible (MMTIT 73.814) | no disponible | no disponible | Hugging Face |

La comparación con alternativas de otras familias (por ejemplo, modelos de traducción especializados o LLMs multilingües generalistas) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo se declaran chino e inglés como idiomas soportados; no hay evidencia de cobertura multilingüe más amplia.
- La ruta de inferencia nativa NVFP4 no ha sido validada por el autor; el runtime incluido descomprime a BF16 y no ofrece aceleración real.
- Incompatibilidad con `AutoModelForImageTextToText.from_pretrained` estándar; requiere el runtime `JointModel` y descargar el repositorio completo, incluidos `audio/` y `audio-tokenizer/`.
- Las pruebas de verificación son de humo (una llamada de texto, una de imagen, una de audio) y una perplejidad sobre 250 tokens; no constituyen una evaluación de calidad de traducción, visión o voz de esta exportación FP4.
- Los benchmarks presentados corresponden al modelo original, no a esta cuantización; el rendimiento puede degradarse tras la cuantización NVFP4.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los componentes base (Qwen3.5) y del código de audio empaquetado.
- El tamaño del repositorio (1.3 GB) sugiere que los pesos de audio y visión podrían no estar completos o que la cuantización reduce drásticamente el espacio; conviene verificar la integridad de todos los ficheros antes de desplegar.
- No hay información sobre longitud de contexto, tool calling ni capacidades de agente, lo que limita su uso en pipelines complejos sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-9B-Joint-f35b68981f27-FP4
- Model card del modelo original: https://huggingface.co/IndexTeam/Index-Translate-omni-9B
- Benchmarks publicados del modelo original: https://huggingface.co/IndexTeam/Index-Translate-9B#evaluation
- NVIDIA ModelOpt: no disponible enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
