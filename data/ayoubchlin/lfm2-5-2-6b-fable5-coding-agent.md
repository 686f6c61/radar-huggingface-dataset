# AyoubChLin/lfm2.5-2.6b-fable5-coding-agent

## Resumen

El modelo `AyoubChLin/lfm2.5-2.6b-fable5-coding-agent` es un ajuste fino supervisado completo (full-parameter SFT) del modelo base `LiquidAI/LFM2.5-2.6B` sobre el dataset `saidutta69/fable-5-premium`. Lo desarrolla AyoubChLin con el objetivo de producir respuestas de asistente conversacional, incluyendo texto de razonamiento y patrones de llamada a herramientas, a partir de conversaciones multi-turno. Todos los 2.697.198.592 parámetros fueron entrenables, y el checkpoint resultante está en BF16 completo, sin usar LoRA ni cuantización.

El modelo se presenta como una herramienta de investigación y evaluación para comportamientos de agente de codificación, generación estructurada de tool-calls y ajuste fino supervisado de contexto largo. Su longitud máxima de secuencia es de 8.192 tokens y emplea el chat template nativo del modelo base. El autor advierte explícitamente que no debe considerarse listo para producción, ya que no ha sido evaluado en factibilidad, seguridad, sesgos, robustez ni corrección de código. La licencia no está asignada en la model card, por lo que se deben revisar las del modelo base y del dataset antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal language model (arquitectura especifica del base no disponible) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | No aplica (modelo denso, 100 % entrenable) |
| Longitud de contexto | 8.192 tokens (maxima durante entrenamiento) |
| Tipos de cuantizacion | BF16 (safetensors); no se documentan cuantizaciones adicionales |
| Idiomas soportados | No disponible |
| Licencia | No disponible (revisar licencias del base y del dataset) |
| Formato de pesos | safetensors (checkpoint BF16 completo) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado completo del base `LiquidAI/LFM2.5-2.6B`, un modelo de lenguaje causal de 2.697.198.592 parámetros. No se proporcionan detalles sobre la arquitectura interna del modelo base (si es transformer estándar, MoE, SSM u otro). El entrenamiento se realizó en precisión BF16 con TF32 habilitado, usando el objetivo de pérdida de siguiente token únicamente sobre los tokens de asistente; los tokens de sistema, usuario, resultados de herramientas y padding se enmascararon con etiqueta `-100`. Los argumentos JSON de las tool-calls se preprocesaron para convertirlos al formato nativo de tool-call de LFM2.5, y los datos de razonamiento se preservaron durante el entrenamiento (`PRESERVE_THINKING=True`).

El dataset de entrenamiento contiene 5.728 filas de entrenamiento, 318 de validación y 319 de prueba, con una media de 6.791,6 tokens por fila y un percentil 95 de 8.192 tokens. El 78,9 % de las filas de entrenamiento alcanzan el límite de 8.192 tokens, lo que indica un sesgo hacia conversaciones muy largas. La media de tokens supervisados de asistente es de 329,5 por ejemplo. Se emplearon 3 épocas, batch efectivo de 32 secuencias, learning rate de 2e-5, weight decay de 0,1, scheduler coseno con warmup de 0,03, optimizer 8-bit AdamW, gradient clipping de 1,0 y gradient checkpointing. El entrenamiento se ejecutó en una NVIDIA H200 con 139,8 GiB de VRAM, completando aproximadamente 537 pasos de optimizador en 9.400,4 segundos (unas 2 horas y 36 minutos).

## Capacidades

- Generacion de texto conversacional multi-turno con formato de chat nativo del modelo base.
- Emision de patrones de llamada a herramientas (tool-call) estructurados, compatibles con el formato LFM2.5, cuando la aplicacion proporciona y valida las herramientas.
- Generacion de texto de razonamiento (reasoning-style) preservado durante el entrenamiento.
- Generacion de codigo y explicaciones, aunque sin garantia de correccion sintactica o logica (ver limitaciones).
- Soporte de contexto largo de hasta 8.192 tokens, adecuado para conversaciones extensas.
- Capacidad multilingue no evaluada; no se dispone de datos sobre idiomas soportados.

## Casos de uso

- Investigacion academica sobre agentes de codificacion: el modelo puede servir como punto de partida para estudiar como los modelos pequenos generan planes y tool-calls en entornos controlados de laboratorio, sin necesidad de desplegarlo en produccion.
- Evaluacion de generacion de tool-calls: permite analizar si un modelo de 2,6B es capaz de emitir llamadas a herramientas estructuradas a partir de conversaciones multi-turno, comparando con el base sin ajuste.
- Desarrollo de prototipos de asistentes conversacionales con herramientas: en entornos de desarrollo donde se validan las tool-calls emitidas por el modelo antes de ejecutarlas, puede explorarse su comportamiento para tareas de automatizacion simple.
- Ajuste fino adicional o adaptacion a dominios especificos: al ser un checkpoint completo, puede servir como base para nuevos ciclos de SFT o RLHF sobre datos propios.
- Analisis de perdida de tokens de asistente: los resultados de loss y perplejidad publicados permiten comparar la calidad del ajuste frente a otros fine-tunes del mismo base.
- Pruebas de robustez y seguridad: dado que no ha sido evaluado, puede usarse como caso de estudio para medir sesgos, alucinaciones o fallos de razonamiento en modelos pequenos ajustados con datos sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta unicamente las perdidas de entrenamiento, validacion y prueba sobre los tokens de asistente, que no son comparables con metricas estandar de lenguaje completo:

| Metrica | Valor | Perplejidad derivada |
|---|---|---|
| Loss de entrenamiento | 0,7474 | 2,1115 |
| Loss de validacion | 0,3403 | 1,4053 |
| Loss de prueba (held-out) | 0,3388 | 1,4033 |

Estas perdidas cubren solo los tokens de asistente seleccionados por el enmascaramiento, por lo que no deben compararse directamente con losses de secuencia completa. No se registro una baseline pre-ajuste, ni intervalos de confianza, ni resultados con semillas repetidas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 de 2,7B parametros ocupa aproximadamente 5,4 GB solo en pesos. Con overhead de activaciones y cache de atencion para 8.192 tokens de contexto, se estima un consumo total de 8-12 GB, dependiendo de la implementacion.
- GPU recomendadas: una GPU consumer con 16 GB o mas (RTX 4080, RTX 4090, RTX 5080) es suficiente para inferencia en BF16. Para entrenamiento o fine-tuning adicional se requiere una GPU profesional como la H200 (139,8 GiB) utilizada en el entrenamiento original, o varias GPUs de 24 GB con paralelismo.
- Si cabe en consumer GPU: si, en GPUs de 16 GB o superiores con cuantizacion adicional (por ejemplo, FP8 o int8) podria caber en 8-12 GB, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: al ser un modelo transformers estandar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (tras conversion). No se documentan configuraciones especificas de despliegue.
- Latencia y throughput: no disponibles. El autor no reporta mediciones de inferencia.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre otros fine-tunes del mismo modelo base ni de modelos comparables en la misma categoria. El unico punto de referencia conocido es el propio `LiquidAI/LFM2.5-2.6B`, pero no se publicaron metricas de rendimiento de ese modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- No ha sido evaluado para factibilidad, seguridad, instrucciones, correccion de codigo, validez de tool-calls, sesgos, rendimiento multilingue ni robustez. El autor lo declara explicitamente no apto para produccion.
- Riesgo de alucinacion y errores de razonamiento: la observacion cualitativa del autor muestra que el modelo genero un plan razonable pero un programa incorrecto (assert multilinea invalido y logica de adyacencia contradictoria) al pedirle una funcion de fusion de intervalos en Python.
- Los datos de entrenamiento provienen de un dataset sintetico (Fable-5 Premium) y pueden contener sesgos o errores propagados al modelo.
- La licencia no esta asignada; los usuarios deben revisar y cumplir las licencias del modelo base (`LiquidAI/LFM2.5-2.6B`) y del dataset (`saidutta69/fable-5-premium`) antes de cualquier uso o redistribucion.
- No se deben exponer las trazas de razonamiento en aplicaciones donde el producto requiera respuestas directas, segun la advertencia del autor.
- El entrenamiento uso un unico run con una semilla; no hay evidencia de reproducibilidad con otras semillas.
- Los checkpoints guardados con `save_only_model=True` no permiten reanudar exactamente el estado del optimizador y scheduler.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AyoubChLin/lfm2.5-2.6b-fable5-coding-agent
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/saidutta69/fable-5-premium
