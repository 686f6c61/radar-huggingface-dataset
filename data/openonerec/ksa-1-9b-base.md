# OpenOneRec/KSA-1.9B-base

## Resumen

KSA V1 1.9B es un modelo base de lenguaje de tipo decoder-only desarrollado por el equipo OneRec de Kuaishou Technology, entrenado desde cero con el objetivo de modelar contextos largos de forma eficiente. Su innovación principal es Kwai Summary Attention (KSA), un mecanismo híbrido en el que tokens de resumen aprendibles comprimen texto lejano en una memoria de largo alcance persistente. La arquitectura alterna tres capas KSA con una capa de atención completa (Full Attention), y cada token de resumen representa ocho tokens de texto originales.

El modelo cuenta con 1.931.063.296 parámetros totales (aproximadamente 1,9B), 24 capas, tamaño oculto de 2048 y una ventana de contexto máxima de 131.072 tokens de texto (128K). Emplea atención multi-cabeza (MHA) con 16 cabezas de consulta y 16 de clave/valor, dimensión de cabeza de 128 y RoPE base de 1.000.000. Los pesos se distribuyen en BF16.

Este checkpoint es el backbone híbrido KSA V1 que sirve para inicializar KSA V2. No incluye compresión C-KSA ni el indexador S-KSA, y no ha recibido ajuste por instrucciones, por lo que su uso previsto es como base para investigación en modelado de contexto largo e inicialización de modelos posteriores, no como asistente conversacional listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 3 capas KSA (Kwai Summary Attention) por cada 1 capa de Full Attention |
| Parametros totales | 1.931.063.296 (~1,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens de texto (128K) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 (los ficheros derivados de Qwen conservan sus avisos de copyright; el FlashAttention CuTe incluido mantiene licencia BSD-3-Clause) |
| Formato de pesos | safetensors (BF16), con código personalizado (`custom_code`) y kernel incluido en el repositorio |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero con 24 capas, hidden size de 2048 y tamaño intermedio de 6144. La pieza central es Kwai Summary Attention: tokens de resumen aprendibles se intercalan con el texto y comprimen contenido distante en una memoria de largo alcance persistente, con un chunk de resumen de tamaño 8 (cada resumen cubre ocho tokens de texto). La proporción híbrida es 3:1 (tres capas KSA por cada capa de atención completa), con 128 chunks deslizantes en KSA. Las proyecciones Q/K/V de los resúmenes se comparten con las del texto. Usa MHA (16/16 cabezas), dimensión de cabeza 128, RoPE base 1.000.000 y embeddings no atados. La precisión de pesos e inferencia es BF16.

Según la model card, el entrenamiento se realizó desde cero (a diferencia de la variante KSA V1 4B, que parte de Qwen3-4B mediante continual pretraining). No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; tampoco se documenta ajuste por instrucciones. La innovación técnica destacable es el mecanismo de resumen aprendible para memoria de largo alcance, validado en el informe técnico con evaluaciones de recuperación en contexto largo (RULER) frente a alternativas como SWA, SCA, GDN, atención lineal pura y KSA pura.

## Capacidades

- Generación de texto autoregresiva en inglés y chino.
- Modelado de contexto largo de hasta 128K tokens mediante memoria de resumen persistente.
- Recuperación de información en contextos extensos (long-context retrieval), evaluada con RULER.
- Completado de texto sin instrucciones: el modelo es una base, no un modelo ajustado por instrucciones.
- Aplicación opcional de plantilla de chat a través del tokenizador (`--apply-chat-template`), que no implica ajuste instruct.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento (thinking).
- No se documentan capacidades multilingües más allá de inglés y chino.

## Casos de uso

- Investigación en mecanismos de atención eficiente: el modelo sirve como referencia reproducible para estudiar KSA frente a SWA, SCA, GDN o atención completa en tareas de recuperación en contexto largo, gracias a que el código de entrenamiento y el kernel están publicados.
- Inicialización de modelos posteriores: es el backbone híbrido KSA V1 empleado para inicializar KSA V2, por lo que resulta adecuado como punto de partida en pipelines de continual pretraining propios.
- Procesamiento de documentos extensos: con 128K tokens de contexto puede ingerir informes, expedientes o bases de código completas en una sola pasada para tareas de completado y análisis, aunque sin ajuste instruct requiere prompts de completado.
- Evaluación de memoria de largo alcance: útil para reproducir los resultados RULER del informe técnico y comparar variantes arquitectónicas bajo las mismas condiciones.
- Experimentación con decodificación y kernels: el repositorio incluye fuentes de `ksa_attn` y FlashAttention CuTe, lo que permite probar integraciones con Transformers 5.0.0 y medir latencia y throughput en H100/H800.
- Base para fine-tuning supervisado: al estar bajo Apache-2.0 y en safetensors BF16, puede adaptarse con SFT o DPO para dominios concretos (legal, médico, código) antes de desplegarse como asistente.
- Generación de texto en inglés y chino: completado de artículos, resúmenes y borradores en ambos idiomas en escenarios donde no se requiere seguir instrucciones complejas.

## Benchmarks y rendimiento

Resultados RULER de recuperación en contexto largo publicados en el informe técnico de KSA V1 (modelo de 1,9B entrenado desde cero):

| Modelo | 4K | 8K | 16K | 32K | 64K | 128K | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| Full | 76,08 | 72,85 | 73,24 | 69,06 | 65,32 | 48,75 | 67,55 |
| Hybrid SWA | 74,54 | 71,69 | 69,54 | 67,86 | 63,03 | 56,64 | 67,22 |
| Hybrid SCA | 77,72 | 75,22 | 72,55 | 67,74 | 63,54 | 58,01 | 69,13 |
| Hybrid GDN | 79,83 | 76,01 | 74,04 | 70,41 | 69,39 | 59,87 | 71,59 |
| Pure KSA | 70,44 | 65,91 | 66,74 | 62,54 | 57,13 | 39,29 | 60,34 |
| Hybrid KSA | 80,65 | 73,35 | 74,07 | 72,30 | 69,95 | 65,35 | 72,61 |

Para referencia, la variante KSA V1 4B (continual pretraining desde Qwen3-4B) alcanza una media de 84,45 en RULER con Hybrid KSA, frente a 83,69 de Full Attention. No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 4 GB solo para pesos (1,93B parámetros × 2 bytes), más overhead de activaciones y caché KV, que crece con el contexto; para 128K tokens el consumo de memoria de atención es significativo y conviene planificar holgura.
- GPU recomendadas: la model card indica explícitamente H100/H800 para el flujo de ejecución incluido. No se documenta soporte oficial para GPUs de consumo.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras tarjetas consumer; el kernel incluido y la dependencia de Transformers 5.0.0 apuntan a un entorno de datacenter.
- Opciones de despliegue: el repositorio proporciona `generate.py` y uso directo con Transformers (`AutoModelForCausalLM` con `trust_remote_code=True` y `attn_implementation="sdpa"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, pese a la etiqueta `text-generation-inference`.
- Requisitos de entorno: Linux, Python 3.12, torch 2.6.0 (CUDA 12.6) y Transformers 5.0.0; es necesario exportar `PYTHONPATH` con las rutas de `kernel` y `kernel/deps`, y descargar el directorio completo del modelo incluido `kernel/`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KSA V1 1.9B (este) | ~1,9B | 128K | Híbrido KSA 3:1, entrenado desde cero | Apache-2.0 | Hugging Face, safetensors BF16 |
| KSA V1 4B | ~4B | 128K | Híbrido KSA 3:1, CPT desde Qwen3-4B | Apache-2.0 | Hugging Face |
| Qwen3-4B | ~4B | No disponible en la información | Transformer estándar | No disponible en la información | Hugging Face |

La comparación cuantitativa disponible se limita a los resultados RULER del informe técnico recogidos en la sección anterior, donde Hybrid KSA supera a Full Attention, SWA, SCA, GDN y KSA pura en la media de 4K a 128K tanto en el modelo de 1,9B como en el de 4B. No se dispone de datos de benchmarks generales que permitan comparar con modelos de propósito general de tamaño similar.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: no debe esperarse comportamiento de asistente ni seguimiento fiable de instrucciones; la plantilla de chat solo aplica el formato del tokenizador.
- Es un backbone de investigación: la model card lo describe como inicializador de KSA V2, sin compresión C-KSA ni indexador S-KSA, lo que limita su uso directo en producción.
- Idiomas limitados a inglés y chino; no se documenta cobertura de castellano ni de otros idiomas.
- Riesgo de alucinación inherente a un modelo base entrenado desde cero; no se documentan evaluaciones de factualidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: los pesos y el runtime son Apache-2.0, pero los ficheros derivados de Qwen conservan sus avisos de copyright y el FlashAttention CuTe incluido mantiene BSD-3-Clause; conviene revisar la compatibilidad en uso comercial.
- Dependencia de código personalizado (`trust_remote_code=True`) y de kernels incluidos en el repositorio, lo que exige controlar la procedencia del código en entornos de producción.
- Requisitos de hardware restrictivos (H100/H800 según la model card) y ausencia de soporte documentado para motores de inferencia habituales como vLLM o llama.cpp.
- El consumo de memoria de atención a 128K tokens puede ser elevado; no se publican cifras de latencia ni throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenOneRec/KSA-1.9B-base
- Informe técnico KSA V1: https://arxiv.org/abs/2604.24432
- Informe técnico KSA V2: https://arxiv.org/abs/2610.18654
- Código: https://github.com/Kuaishou-OneRec/KSA
- Variante KSA-4B-base: https://huggingface.co/OpenOneRec/KSA-4B-base
- Licencia: https://huggingface.co/OpenOneRec/KSA-1.9B-base/blob/main/LICENSE
