# mradermacher/Dark-Goetia-26B-A4B-v2-i1-GGUF

## Resumen

Dark-Goetia-26B-A4B-v2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por la suite 26B-Suite, con arquitectura basada en Gemma-4 de Google DeepMind. Cuenta con 25.233.142.046 parámetros totales (aproximadamente 25,2 mil millones) y unos 4 mil millones de parámetros activos por pasada, según la nomenclatura 26B-A4B. Se trata de una adaptación mediante LoRA orientada a roleplay y conversación narrativa, con soporte de inglés y ruso. La versión publicada por mradermacher es una cuantización GGUF calibrada con imatrix, diseñada para ejecutarse en hardware de consumo mediante llama.cpp, Ollama o SillyTavern.

El modelo incluye soporte de visión (ficheros mmproj disponibles en el repositorio estático), lo que amplía su utilidad a escenarios multimodales. Su licencia es la de Gemma, que permite uso comercial con ciertas restricciones. Dado su tamaño de cuantización reducido y su arquitectura MoE con pocos parámetros activos, resulta especialmente atractivo para entornos con recursos limitados de VRAM. Es un modelo reciente (publicado en agosto de 2026) y no cuenta aún con descargas ni valoraciones en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre Gemma-4 |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (según nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | ingles, ruso |
| Licencia | Gemma |
| Formato de pesos | GGUF (imatrix) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE basado en Gemma-4, con 26 mil millones de parámetros totales y aproximadamente 4 mil millones activos por token. El modelo base es 26B-Suite/Dark-Goetia-26B-A4B-v2, sobre el que se ha aplicado un adaptador LoRA orientado a roleplay y conversación narrativa. La cuantización fue realizada por mradermacher mediante calibración imatrix (importance matrix), un método que pondera la importancia de cada tensor para reducir la pérdida de calidad en cuantizaciones de baja precisión.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información publicada. La cuantización GGUF se realizó con el formato de llama.cpp, y el repositorio incluye también una versión estática sin imatrix. El modelo es una adaptación LoRA, lo que significa que el modelo base Gemma-4 aporta las capacidades generales de lenguaje y razonamiento, mientras que el adaptador lo ajusta para tareas de rol y narración.

## Capacidades

- Generación de texto conversacional y narrativo, optimizado para roleplay y chat de ficción.
- Integración con SillyTavern para gestión de personajes y contextos de rol.
- Soporte de visión (ficheros mmproj), lo que permite procesar imágenes como entrada junto al texto.
- Capacidades multilingües en inglés y ruso.
- Arquitectura MoE con 4B parámetros activos, lo que ofrece una inferencia eficiente en comparación con modelos densos del mismo tamaño.
- Cuantización GGUF con imatrix, compatible con llama.cpp, Ollama y otras herramientas de inferencia local.

## Casos de uso

- Roleplay en SillyTavern: el modelo está específicamente adaptado para conversaciones de rol con personajes, aprovechando su LoRA entrenada para narrativa y diálogo. Se puede cargar como GGUF en SillyTavern mediante llama.cpp.
- Creación de personajes interactivos: desarrolladores de juegos o narrativa pueden usarlo para dar vida a personajes con personalidad y coherencia en conversaciones multi-turno.
- Prototipos de asistentes conversacionales bilingües: soporta inglés y ruso, lo que permite construir asistentes para mercados hispanohablantes y rusohablantes sin modelos separados.
- Análisis de imágenes con diálogo: al incluir soporte de visión, se puede usar para describir imágenes y responder preguntas sobre ellas dentro de un contexto conversacional.
- Generación de historias y narrativa interactiva: útil en aplicaciones de ficción interactiva, juegos de rol de mesa digitales o generación de guiones con interacción del usuario.
- Evaluación de cuantizaciones: el repositorio incluye 24 variantes de cuantización, lo que permite a investigadores comparar la degradación de calidad entre distintos niveles de precisión en un modelo MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con modelos similares. Se recomienda consultar la página del modelo base (26B-Suite/Dark-Goetia-26B-A4B-v2) para datos adicionales.

## Requisitos de hardware

- VRAM estimada por cuantización (para contexto corto, sin incluir KV cache):
  - Q1_S / IQ1_S: aproximadamente 4-5 GB, ejecutable en GPU de 6 GB.
  - Q2_K / IQ2_M: aproximadamente 7-8 GB, ejecutable en GPU de 8 GB (RTX 3060, RTX 4060).
  - Q3_K_M: aproximadamente 10-11 GB, ejecutable en GPU de 12 GB (RTX 4070).
  - Q4_K_M: aproximadamente 14-15 GB, ejecutable en GPU de 16 GB (RTX 4070 Ti, RTX 4080).
  - Q5_K_M: aproximadamente 17-18 GB, ejecutable en GPU de 24 GB (RTX 3090, RTX 4090).
  - Q6_K: aproximadamente 20-21 GB, ejecutable en GPU de 24 GB.
- GPU recomendadas: RTX 3090 (24 GB) o RTX 4090 (24 GB) para cuantizaciones de alta calidad (Q5/Q6); RTX 4060 Ti (16 GB) para Q4.
- El modelo es MoE con 4B activos, por lo que el throughput de tokens por segundo será similar a un modelo denso de 4B, aunque la carga de pesos requiere VRAM de un modelo de 25B.
- Opciones de despliegue: llama.cpp (formato GGUF), Ollama, vLLM (con soporte GGUF), Text Generation Inference (TGI), y SillyTavern para roleplay.
- Latencia estimada: en una RTX 4090 con Q4_K_M, se espera una generación de entre 20 y 40 tokens por segundo, dependiendo de la longitud de contexto y el batch.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con modelos de la misma categoría (MoE de ~25B totales con ~4B activos) en la información proporcionada. Modelos de referencia en esta categoría son Mixtral 8x7B, Qwen 25B-A3B o DeepSeek-V2-Lite, pero no hay datos comparativos disponibles para este modelo concreto.

## Limitaciones y advertencias

- Idiomas limitados: solo se soportan inglés y ruso; no se ha verificado rendimiento en otros idiomas.
- Licencia Gemma: permite uso comercial, pero incluye restricciones específicas (como la prohibición de uso en ciertos casos y obligación de atribución). Revisar los términos de la licencia Gemma antes de desplegar en producción.
- Alucinación: al ser un modelo de roleplay y narrativa, puede generar contenido ficticio o inventar datos factuales; no es adecuado para tareas de verificación o información objetiva.
- Cuantización: las variantes de baja precisión (Q1, IQ1, IQ2) pueden presentar degradación notable en coherencia y calidad de generación.
- El repositorio no incluye información sobre la longitud de contexto máxima soportada, lo que dificulta planificar despliegues con ventanas de contexto largas.
- No se han publicado resultados de benchmarks ni evaluaciones de seguridad; el modelo puede no ser adecuado para entornos de producción con requisitos de moderación.
- El modelo es una cuantización GGUF; el uso en frameworks que requieren pesos en safetensors requiere descargar el modelo base original.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/Dark-Goetia-26B-A4B-v2-i1-GGUF
- Modelo base (26B-Suite): https://huggingface.co/26B-Suite/Dark-Goetia-26B-A4B-v2
- Cuantización estática (sin imatrix): https://huggingface.co/mradermacher/Dark-Goetia-26B-A4B-v2-GGUF
- Página de Gemma-4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Modelo relacionado (v1.3 con imatrix): https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.3-i1-GGUF
- Modelo relacionado (v1.3 Absolute Heretic ARA): https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-i1-GGUF
