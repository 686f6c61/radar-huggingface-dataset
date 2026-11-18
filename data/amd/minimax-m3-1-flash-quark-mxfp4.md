# amd/MiniMax-M3.1-Flash-Quark-MXFP4

## Resumen

MiniMax-M3.1-Flash-Quark-MXFP4 es una versión cuantizada del modelo multimodal MiniMax-M3.1-Flash, publicada por AMD para su ejecución optimizada sobre aceleradores AMD Instinct MI350 y MI355 con ROCm 7.2.3. El modelo base, desarrollado por MiniMaxAI, es un transformer multimodal de tipo Mixture of Experts (MoE) con arquitectura propietaria `MiniMaxM3SparseForConditionalGeneration`, capaz de procesar texto, imagen y vídeo como entrada y generar texto como salida. Esta variante mantiene los 220.490 millones de parámetros totales del modelo original, pero cuantiza únicamente los pesos y activaciones de los expertos enrutados en formato OCP MXFP4.

La relevancia de esta ficha reside en que se trata de una cuantización oficial respaldada por AMD mediante su herramienta AMD-Quark, con recuperación de precisión muy alta respecto al modelo original (entre el 99,69% y el 104,62% en los benchmarks publicados). Esto la convierte en una opción práctica para desplegar un modelo de gran tamaño en infraestructura AMD sin sacrificar capacidad de razonamiento, matemáticas, código o visión de forma significativa.

El modelo está pensado para servir en producción mediante vLLM o SGLang, con soporte de decodificación especulativa DSPARK, parser de razonamiento y de tool calling, y modo thinking habilitable desde el template de chat. La licencia es `minimax-community`, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMaxM3SparseForConditionalGeneration (transformer MoE multimodal) |
| Parametros totales | 220.490.854.016 (220,49 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (OCP) estático en pesos de expertos enrutados; MXFP4 dinámico en activaciones de expertos enrutados; resto de capas en precisión original |
| Idiomas soportados | no disponible |
| Licencia | minimax-community (license_name: minimax-community) |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo base MiniMax-M3.1-Flash emplea una arquitectura transformer dispersa de tipo Mixture of Experts con atención y capas multimodales, identificada en el código como `MiniMaxM3SparseForConditionalGeneration`. La model card de esta variante no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información correspondería al modelo base y no está incluida en la documentación proporcionada. La entrada admite texto, imagen y vídeo, y la salida es únicamente texto.

La innovación principal de esta variante es la cuantización selectiva: solo los pesos y activaciones de los expertos enrutados se convierten a MXFP4, mientras que el resto de capas (atención, `lm_head`, torre de visión, proyector multimodal, `patch_merge_mlp`, gate del MoE, primeros tres bloques del MLP, expertos compartidos y módulos DSPARK) permanecen en la precisión original. La cuantización se realizó con AMD-Quark a partir de pesos NVFP4 del modelo original. Adicionalmente, la model card documenta el uso de decodificación especulativa DSPARK con 7 tokens especulativos y verificación por bloques, así como soporte de caché KV en FP8 o NVFP4 según configuración.

## Capacidades

- Generación de texto con razonamiento explícito (modo thinking habilitable mediante `chat_template_kwargs` con `thinking_mode: enabled`).
- Razonamiento matemático de competición (GSM8K, AIME26) y científico (GPQA Diamond, SciCode).
- Comprensión multimodal de imagen y vídeo (evaluado en MMMU Pro en modos standard y vision).
- Tool calling y function calling nativo, con parser `minimax_m3` en vLLM y `minimax-m3` en SGLang.
- Seguimiento de instrucciones complejas (evaluado con IFBench).
- Razonamiento de largo contexto (evaluado con AA-LCR).
- Decodificación especulativa integrada (DSPARK) para acelerar inferencia.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento matemático y científico asistido: el modelo obtiene 96,90 en GSM8K y 93,75 en AIME26, por lo que es adecuado para asistentes de resolución de problemas de competición, verificación de demostraciones y tutoría avanzada.
- Análisis de documentos técnicos con imágenes y vídeo: al aceptar imagen y vídeo como entrada y obtener 77,57 en MMMU Pro vision, puede emplearse para inspección de diagramas, capturas de pantalla, gráficos y material audiovisual en flujos de auditoría técnica.
- Agentes con tool calling en producción: el soporte nativo de function calling y el parser dedicado en vLLM y SGLang permiten integrarlo en orquestadores de agentes que consultan APIs, bases de datos o servicios internos.
- Generación y revisión de código en pipelines: con 49,27 en SciCode (subproblem) y soporte de tool calling, encaja en asistentes de CI/CD que revisan parches, generan tests o resuelven incidencias con acceso a herramientas.
- Razonamiento sobre contextos largos: los resultados en AA-LCR (77,00) indican utilidad para resumir y responder preguntas sobre documentación extensa, contratos o expedientes multi-documento.
- Despliegue en infraestructura AMD Instinct: al estar optimizado para MI350/MI355 con ROCm 7.2.3, es candidato para clusters internos que ya operan hardware AMD y quieren evitar la dependencia de CUDA.
- Asistentes con modo thinking para tareas de alta precisión: la posibilidad de activar razonamiento extendido por petición permite alternar entre respuestas rápidas y respuestas profundas según el caso.

## Benchmarks y rendimiento

Resultados publicados por AMD, comparando el modelo base y esta variante cuantizada:

| Benchmark | MiniMax-M3.1-Flash | Quark-MXFP4 (este modelo) | Recuperación |
|---|---|---|---|
| GSM8K (4-shot) | 97,20 | 96,90 | 99,69% |
| GPQA Diamond (mean@8) | 87,69 | 87,63 | 99,93% |
| AIME26 (mean@16) | 93,54 | 93,75 | 100,22% |
| MMMU Pro, standard (mean@1) | 79,19 | 79,13 | 99,92% |
| MMMU Pro, vision (mean@1) | 76,99 | 77,57 | 100,75% |
| SciCode, subproblem (mean@8) | 48,11 | 49,27 | 102,41% |
| AA-LCR (mean@16) | 76,75 | 77,00 | 100,33% |
| IFBench (mean@5) | 50,53 | 52,87 | 104,62% |

La evaluación se realizó con vLLM y EvalScope 1.14.1. El autor advierte que los resultados pueden variar entre ejecuciones.

## Requisitos de hardware

- Microarquitectura soportada: AMD Instinct MI350 y MI355 exclusivamente según la model card; no se menciona soporte para GPU NVIDIA ni consumer.
- ROCm 7.2.3, PyTorch 2.13.0, Transformers 5.19.0, sistema operativo Linux.
- Tamaño del repositorio: 239,5 GB, lo que da una idea del espacio en disco necesario para almacenar los pesos.
- Ejemplos de despliegue con `--tensor-parallel-size 4` (vLLM) y `--tp 4` (SGLang) sobre 4 aceleradores MI350/MI355.
- Motores de inferencia: vLLM (imagen `vllm/vllm-openai-rocm:minimax-m31-flash`) y SGLang, ambos con backend AITER.
- Caché KV configurable en FP8 o NVFP4 según los ejemplos de la model card.
- VRAM estimada para consumer GPU: no disponible; el modelo no está orientado a GPU de consumo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| amd/MiniMax-M3.1-Flash-Quark-MXFP4 | 220,49 B | no disponible | minimax-community | safetensors MXFP4 | Hugging Face, hardware AMD |
| MiniMaxAI/MiniMax-M3.1-Flash | 220,49 B (mismo modelo base) | no disponible | minimax-community | safetensors (NVFP4 en expertos) | Hugging Face |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de otros modelos comparables de tamaño o tarea equivalentes, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- La cuantización MXFP4 se aplica solo a expertos enrutados; el resto de capas mantiene la precisión original, por lo que el ahorro de memoria es parcial respecto al modelo base.
- El modelo está validado únicamente sobre AMD MI350/MI355 con ROCm 7.2.3; no hay evidencia publicada de funcionamiento en otras plataformas.
- La licencia `minimax-community` no es una licencia open source estándar; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- No se detallan idiomas soportados, sesgos conocidos ni tasas de alucinación en la información disponible.
- Los benchmarks publicados son de recuperación respecto al modelo base, no comparaciones absolutas con otros modelos de la competencia.
- El autor advierte que los resultados pueden variar entre ejecuciones; las cifras deben interpretarse con esa variabilidad.
- El tamaño del repositorio (239,5 GB) y la necesidad de 4 aceleradores para el despliegue de referencia implican un coste de infraestructura elevado.
- El uso de `--trust-remote-code` en SGLang es necesario por el código personalizado del modelo, lo que introduce un riesgo de seguridad a evaluar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/MiniMax-M3.1-Flash-Quark-MXFP4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- AMD-Quark (documentación): https://quark.docs.amd.com/latest/index.html
- vLLM Recipes: https://recipes.vllm.ai/
- Receta vLLM para MiniMax-M3.1-Flash en MI355X: https://recipes.vllm.ai/MiniMaxAI/MiniMax-M3.1-Flash?hardware=mi355x&variant=mxfp4
- SGLang cookbook para MiniMax-M3.1: https://docs.sglang.io/cookbook/autoregressive/MiniMax/MiniMax-M3.1
