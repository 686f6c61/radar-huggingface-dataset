# Milad4545/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2

## Resumen

Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2 es un modelo multimodal (texto e imagen/vídeo) de 27.320.697.856 parámetros publicado por el usuario Milad4545 en HuggingFace. Se trata de un post-entrenamiento comunitario sobre el modelo nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2, que a su vez deriva del Qwen3.8-27B oficial. El objetivo principal del entrenamiento es resolver un problema concreto del modelo base: la tendencia a no detener la generación, re-derivando respuestas hasta agotar el límite de contexto de 94K tokens sin emitir respuesta final.

El entrenamiento combina varias rondas alternas de SFT (fine-tuning supervisado) y RLOO (Reinforcement Learning with Leave-One-Out), con trayectorias de modelos profesor y un sistema de recompensas que penaliza respuestas vacías y truncamientos. El resultado es una reducción drástica de los truncamientos a 94K tokens (de 4 a 1 en GPQA y de 13 a 3 en LCB) sin regresiones en ningún benchmark, manteniendo además cuantización sin pérdida respecto a BF16.

El repositorio destaca por su amplitud de formatos: cinco niveles safetensors (BF16, FP8 Block128 estático, NVFP4 W4A16, W4A4 y W4A4-W8A8 mixto), variantes INT4/INT8, versiones NInfer y una gama completa de GGUF (Q2 a Q8_0). Incluye dos mecanismos de decodificación especulativa (DFlash2 y MTP) que elevan el throughput a unos 180 tok/s por petición. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.8, multimodal (texto + imagen/vídeo), con cabeza MTP BF16 incluida |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | 94K tokens (límite mencionado en el protocolo de evaluación) |
| Tipos de cuantizacion | BF16, FP8 estático Block128, NVFP4 W4A16, NVFP4 W4A4, NVFP4 W4A4-W8A8 (mixto), INT4 W4A16, INT8 W8A8, INT8 W8A16, GGUF Q2/Q3/Q4 LynnStyle, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte del Qwen3.8-27B oficial (post-entrenado con SFT y SimPO por nerkyor) y aplica un pipeline iterativo de SFT y RLOO. La línea de entrenamiento documentada es: Qwen3.8-27B original (FP8) → SFT + SimPO110 (EfficientThink base) → SFT de continuación K3 → segunda ronda SFT (week2dose, update-225) → primera ronda RLOO (182 grupos) → SFT de fusión (merge-sft-100) → segunda ronda RLOO (172 grupos), resultando en la versión Coder390 final. Los nombres del modelo indican que Opus5.5 y GPT6Astra generaron las respuestas gold y las trayectorias profesor, Grok4.7 filtró los datos, y DSV4Pro y K3 aportaron trayectorias profesor (K3 además realizó la revisión de valores RLOO y escribió parte de los problemas).

La innovación central es el tratamiento del problema de "no parar": el modelo base, tras obtener una respuesta local, seguía re-derivando con patrones tipo "Wait / Actually" hasta llenar el contexto de 94K tokens con respuesta final vacía. Para corregirlo, se muestrearon 8 trayectorias por problema en RLOO, descartando grupos donde todas eran correctas; en grupos con 0 o 1 trayectoria correcta se insertó una trayectoria profesor corta revisada en lugar de la trayectoria incorrecta más corta (27 grupos). El conjunto final fue de 172 grupos con 1.376 trayectorias (859 correctas y 517 incorrectas, incluidas 68 respuestas vacías). La función de recompensa penaliza solo trayectorias incorrectas, con penalizaciones crecientes según longitud (−0,2 para cortas e incorrectas hasta −1,0 para respuestas vacías), de modo que el razonamiento largo pero necesario no se suprime. Adicionalmente, el repositorio incluye soporte de decodificación especulativa mediante DFlash2 (companion draft) y MTP (cabeza multi-token prediction BF16 oficial), mutuamente excluyentes entre sí.

## Capacidades

- Generación de texto con razonamiento eficiente (efficient thinking): mantiene el razonamiento largo cuando es necesario pero elimina colas de razonamiento improductivas.
- Razonamiento científico y académico: puntuación de 178/198 en GPQA bajo protocolo de 100K tokens.
- Conocimiento general: 450/500 en MMLU (90%).
- Programación: capacidad de código reforzada (componente "Coder" del nombre), con 90/100 en LiveCodeBench (LCB).
- Multimodalidad completa: procesa texto e imagen/vídeo (pipeline image-text-to-text).
- Decodificación especulativa: dos opciones integradas (DFlash2, ~180 tok/s por petición; MTP, ~91 tok/s), frente a ~46 tok/s sin especulación.
- Compatibilidad directa con SGLang sin parches en todos los niveles de cuantización; el paquete FP8 está también probado en vLLM; los GGUF funcionan en llama.cpp con MTP integrado.
- Modelo sin censura (uncensored) heredado del modelo base EfficientThink.

## Casos de uso

- Razonamiento científico y resolución de problemas de nivel doctoral: gracias a su puntuación de 178/198 en GPQA y a la corrección del problema de truncamiento, es adecuado para generar respuestas completas en preguntas de física, química y biología avanzada sin quedarse sin contexto.
- Generación y depuración de código en producción: el componente "Coder" reforzado y los 90/100 en LiveCodeBench lo hacen apropiado para asistentes de programación, revisión de pull requests y generación de tests, con integración en vLLM y SGLang para servir APIs.
- Agentes de razonamiento multi-paso: la eliminación de las colas de razonamiento improductivas reduce el consumo de contexto, permitiendo cadenas de agentes más largas dentro de la ventana de 94K tokens.
- Análisis de documentos e imágenes: la naturaleza multimodal (texto + imagen/vídeo) permite construir pipelines de extracción de información de documentos escaneados, capturas de pantalla o clips de vídeo.
- Despliegue en hardware limitado: la gama de cuantizaciones (desde NVFP4 e INT4 hasta GGUF Q2) permite ejecutar el modelo en estaciones de trabajo con GPU de consumo, ampliando el acceso a modelos de 27B.
- Servicios de inferencia de alto throughput: con DFlash2 se alcanzan ~180 tok/s por petición, útil para aplicaciones conversacionales interactivas y procesamiento por lotes con presupuestos de latencia ajustados.
- Atención al cliente y chatbots: al ser un modelo conversacional sin censura con soporte multimodal, puede gestionarse en entornos donde se requiere control total del comportamiento del asistente.
- Investigación en alineación y RLHF: el pipeline documentado de SFT/RLOO con recompensas detalladas sirve como referencia reproducible para estudios de post-entrenamiento comunitario.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos sobre las suites completas bajo el mismo protocolo de 100K tokens (GPQA sobre 198 preguntas, MMLU sobre 500, LCB sobre 100):

| Benchmark | Qwen3.8-27B original (FP8) | EfficientThink base (SFT+SimPO) | sft-base-rloo | Coder390 (este modelo, FP8 dinámico) | Coder390 (FP8 estático) |
|---|---|---|---|---|---|
| GPQA | 177/198 | 171/198 | 177/198 | 178/198 | 178/198 |
| MMLU | 444/500 | 442/500 | 448/500 | 445/500 | 450/500 |
| LCB | 83/100 | 89/100 | 90/100 | 90/100 | 90/100 |

Otros datos de rendimiento publicados:

| Métrica | Valor |
|---|---|
| Truncamientos a 94K en GPQA | 4 → 1 (frente al original FP8) |
| Truncamientos a 94K en LCB | 13 → 3 (frente al original FP8) |
| Throughput con DFlash2 | ~180 tok/s por petición |
| Throughput con MTP | ~91 tok/s por petición |
| Throughput sin especulación | ~46 tok/s por petición |

El autor afirma además que la cuantización es sin pérdida: GPQA y LCB son idénticos entre BF16, FP8 dinámico y FP8 estático.

## Requisitos de hardware

- Un modelo de 27.320.697.856 parámetros requiere aproximadamente 54-55 GB en BF16, ~27-28 GB en FP8, y ~14-15 GB en NVFP4/INT4 (estimaciones basadas en el tamaño de parámetros; el autor no publica cifras de VRAM concretas).
- Para BF16 se recomiendan GPUs con 80 GB de VRAM (A100, H100) o configuraciones multi-GPU (2x RTX 4090 con tensor parallelism, por ejemplo).
- Para FP8 estático, una GPU con soporte FP8 (H100, RTX 4090 vía vLLM/SGLang) con al menos 32-40 GB de VRAM sería adecuada (estimación).
- Para NVFP4 e INT4, el modelo cabe en una GPU de consumo de 24 GB como la RTX 4090 o RTX 3090 (estimación basada en el tamaño en W4A16).
- Para GGUF en CPU o GPU de consumo: Q4 ocupa en torno a 15-17 GB y Q2 en torno a 9-11 GB (estimación), ejecutable en llama.cpp con MTP integrado.
- Opciones de despliegue documentadas por el autor: SGLang (todos los niveles, sin parches), vLLM (FP8 probado, INT4 W4A16 con texto e imagen), llama.cpp (GGUF), NInfer (NVFP4-NInfer y GGUF-NInfer).
- Latencia y throughput estimados: ~46 tok/s por petición sin decodificación especulativa, ~91 tok/s con MTP y ~180 tok/s con DFlash2, según datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Cuantizaciones destacadas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Coder390 (este modelo) | 27.320.697.856 | 94K | Sí (texto + imagen/vídeo) | Apache 2.0 | BF16, FP8, NVFP4, INT4, INT8, GGUF Q2-Q8 |
| Qwen3.8-27B (base oficial) | no disponible | 94K (según protocolo del autor) | no disponible | no disponible | FP8 |
| nerkyor/Qwen3.8-27B-EfficientThink (base inmediata) | no disponible | 94K (según protocolo del autor) | no disponible | no disponible | no disponible |

Nota: no se dispone de datos de benchmarks comparativos publicados por terceros para estos modelos; las comparaciones de rendimiento disponibles provienen exclusivamente de las evaluaciones del propio autor del repositorio.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored" (sin censura): no incluye los filtros de seguridad habituales, lo que exige controles adicionales en producción para evitar contenidos nocivos.
- Al tratarse de un post-entrenamiento comunitario, las evaluaciones (GPQA, MMLU, LCB) provienen del propio autor y no han sido verificadas de forma independiente; la metodología de "protocolo de 100K" no está descrita en detalle en la información disponible.
- El modelo hereda los sesgos del Qwen3.8-27B original y de los modelos profesor empleados (Opus5.5, GPT6Astra, Grok4.7, DSV4Pro, K3), cuya composición de datos no está documentada.
- El soporte de idiomas se limita oficialmente a inglés y chino; el rendimiento en castellano no está evaluado ni garantizado.
- Los dos mecanismos de decodificación especulativa (DFlash2 y MTP) son mutuamente excluyentes: debe elegirse uno de los dos al desplegar.
- El tamaño del repositorio es de 698,6 GB al incluir todas las variantes de cuantización; conviene descargar solo los directorios necesarios.
- La ventana de contexto de 94K tokens es inferior a la de otros modelos recientes con contextos de 128K o más, lo que puede limitar casos de uso con documentos muy largos.
- Aunque la licencia Apache 2.0 permite uso comercial, los nombres del modelo hacen referencia a marcas comerciales de otros modelos (Opus, GPT, Grok, DeepSeek, Kimi) usadas solo como descriptor del origen de los datos de entrenamiento, no como afiliación.
- La fecha de creación del repositorio (octubre de 2026) indica que es un modelo muy reciente, con 1.928 descargas y sin comunidad de usuarios consolidada que haya detectado posibles errores.

## Enlaces

- Repositorio principal en HuggingFace: https://huggingface.co/Milad4545/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Modelo base (nerkyor): https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- GGUF / GGUF-NInfer en HuggingFace: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer
- GGUF / GGUF-NInfer en ModelScope: https://modelscope.cn/models/Merkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer
- NVFP4-NInfer en HuggingFace: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-NVFP4-NInfer
- NVFP4-NInfer en ModelScope: https://modelscope.cn/models/Merkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-NVFP4-NInfer
- Qwen3.8-27B oficial: https://huggingface.co/Qwen/Qwen3.8-27B
