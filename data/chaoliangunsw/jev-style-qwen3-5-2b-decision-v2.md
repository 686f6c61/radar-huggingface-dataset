# chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2

## Resumen

Jev-Style-Qwen3.5-2B-Decision-v2 es un modelo de decisión y clasificación de texto desarrollado por Chaoliang Yan (chaoliangUNSW), construido mediante un fine-tuning con LoRA sobre Qwen/Qwen3.5-2B-Base. No es un modelo generativo al uso: recibe un estado, una pregunta y una lista de opciones, y devuelve una opción seleccionada junto con probabilidades calibradas, todo en un único prefill. Está pensado para tareas de enrutamiento, clasificación y elección forzada donde la calidad de la probabilidad importa tanto como la etiqueta elegida.

La versión v2 se publicó el 23 de septiembre de 2026 como release archivada y se mantiene únicamente para integraciones existentes: el paquete oficial `jev-style` no carga esta versión, sino las releases v3 y v4. El autor recomienda migrar a 2B v4 (texto e imágenes) o, para el modelo de texto más pequeño, a 0.8B v3. La v2 se entrenó sin salidas de Jev, a diferencia de la v4, que incorpora etiquetas suaves destiladas de TypeSafe Jev 1.14 vía API pública.

El modelo cuenta con 1.881.825.088 parámetros en safetensors (BF16, 3,76 GB), licencia Apache 2.0, soporte únicamente de inglés y un pipeline declarado de `text-classification`. Su relevancia actual es acotada: sirve como referencia de calibración y como baseline reproducible para comparar enrutadores ligeros, pero no como opción de despliegue nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B), adaptado con LoRA rank-32 para decisión/clasificación |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información del repositorio; el servicio alojado de la release v4 usa 8.192 tokens con entradas de hasta 8.000, dato no aplicable a esta v2 |
| Tipos de cuantizacion | BF16 (repo principal); GGUF Q4_K_M, Q8_0 y BF16 en repo separado; MLX BF16 en repo separado |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16); GGUF y MLX BF16 en repositorios derivados |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B-Base, un transformer decoder-only de la familia Qwen3.5, y se adapta mediante LoRA de rango 32 para una tarea de elección entre opciones con salida probabilística. El entrenamiento principal consumió 36,9 minutos en una única H100 de 80 GB, lo que indica un ajuste ligero sobre el backbone preentrenado más que un entrenamiento desde cero. La calibración se ajusta con temperatura sobre un split de calibración de 3.100 registros, y los clientes de HF y MLX aplican esa calibración automáticamente; en el GGUF calibrado, la temperatura se incorpora en el tensor de normalización final.

La evaluación de referencia se realizó sobre un panel inglés fijo con 11 grupos de tareas con etiquetas reales, 3.277 decisiones y pesos de tarea iguales. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La innovación técnica principal es el formato de decisión en un solo prefill con probabilidades calibradas y una métrica explícita de robustez frente al orden de las opciones (option-order flip rate), que se reduce a la mitad respecto a English Laya.

## Capacidades

- Clasificación de texto con etiquetas fijas: dado un estado y una pregunta, elige entre opciones predefinidas.
- Enrutamiento (routing) entre herramientas, intenciones o categorías, con probabilidad asociada a cada elección.
- Elección forzada tipada (typed choices), incluyendo decisiones sí/no (grupo Bool/Choice).
- Salida probabilística calibrada: probabilidades utilizables directamente para umbrales o abstención.
- Robustez ante permutación de opciones: 80,00% de accuracy tras permutar en el mismo conjunto de 400 decisiones Choice/Bool.
- Inferencia en un único prefill, sin generación autoregresiva de texto libre.
- Idiomas: únicamente inglés.

No se documentan en la información disponible capacidades de tool calling general, razonamiento multi-paso, visión, audio ni modo thinking para esta release v2.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo recibe el mensaje del usuario y una lista cerrada de departamentos o intenciones, y devuelve la opción más probable con confianza calibrada, lo que permite derivar a revisión humana cuando la probabilidad cae por debajo de un umbral.
- Clasificación de tickets en pipelines de soporte: con 11 grupos de tareas evaluados y macro-F1 de 79,78%, es adecuado para etiquetado operativo donde se necesita consistencia entre categorías y no solo accuracy global.
- Decisión sí/no sobre documentos: verificación de recibos, capturas o formularios en flujos donde la pregunta es binaria y la probabilidad calibrada permite fijar políticas de autoaprobación.
- Selección de herramienta en un agente ligero: dado el estado de la conversación y el catálogo de herramientas disponibles, el modelo elige qué herramienta invocar, sustituyendo a un LLM generativo en ese paso concreto y reduciendo coste y latencia.
- Moderación y triaje de contenido: clasificación de textos en categorías predefinidas con NLL de 0,5154 y Brier de 0,2787, métricas que permiten comparar contra alternativas antes de desplegar.
- Evaluación de calibración en investigación: sirve como baseline reproducible (panel fijo, split de calibración de 3.100 registros) para estudiar ECE, Brier y NLL en modelos de decisión pequeños.
- Despliegue en Apple Silicon: la variante MLX BF16 permite ejecutar decisiones locales en portátiles Mac sin GPU dedicada, útil para prototipos y herramientas de escritorio.

## Benchmarks y rendimiento

Resultados sobre el panel inglés fijo (11 grupos de tareas, 3.277 decisiones, pesos iguales, mismo split de calibración de 3.100 registros):

| Metrica | Jev-Style v1 | English Laya | Jev-Style v2 |
|---|---:|---:|---:|
| Accuracy ↑ | 76,68% | 75,09% | 81,20% |
| Macro-F1 ↑ | 75,42% | 73,45% | 79,78% |
| Negative log-likelihood ↓ | 0,5752 | 0,6318 | 0,5154 |
| Brier score ↓ | 0,3290 | 0,3482 | 0,2787 |

Datos adicionales reportados por el autor:

- Mejora de +4,53 puntos sobre v1 (IC 95% pareado [+3,58, +5,52]) y +6,12 sobre English Laya (IC 95% [+4,64, +7,52]).
- Accuracy por delante de English Laya en 9 de 12 grupos de tareas.
- NLL un 18,4% inferior, Brier un 20,0% inferior y ECE macro por tarea un 26,4% inferior respecto a English Laya.
- Tasa de inversión por orden de opciones reducida a la mitad frente a English Laya, con 80,00% de accuracy tras permutación sobre 400 decisiones Choice/Bool.

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que además no son representativos para un modelo de clasificación.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 3,76 GB de pesos más overhead de activaciones y contexto; en la práctica, 5-6 GB en GPU.
- VRAM estimada en GGUF Q4_K_M: pesos de 1,27 GB, desplegable en GPUs de 4 GB o en CPU.
- VRAM estimada en GGUF Q8_0: hasta 3,78 GB según el build publicado.
- GPU recomendadas: cualquier GPU con 8 GB o más para BF16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100). El entrenamiento de referencia usó una H100 80 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares en BF16; en GPUs de 4-6 GB mediante Q4_K_M.
- Opciones de despliegue: Transformers con el cliente de decisión incluido en el repositorio; llama.cpp para los GGUF; MLX nativo en Apple Silicon para la variante MLX BF16. El paquete `jev-style` no carga esta v2.
- Latencia y throughput: no disponibles en la información proporcionada. El diseño de un solo prefill sugiere latencias bajas frente a generación autoregresiva, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (panel fijo) | Macro-F1 | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Jev-Style-Qwen3.5-2B-Decision-v2 | 1,88 B | no disponible | 81,20% | 79,78% | Apache 2.0 | HF (archivada), GGUF, MLX |
| Jev-Style v1 | no disponible | no disponible | 76,68% | 75,42% | no disponible | no disponible |
| English Laya | no disponible | no disponible | 75,09% | 73,45% | no disponible | no disponible |
| Jev-Style-2B-Decision-v4 | clase 2B | 8.192 tokens (servicio alojado) | no disponible | no disponible | no disponible | HF, paquete `jev-style` |
| Jev-Style-0.8B-Decision-v3 | clase 0,8 B | no disponible | no disponible | no disponible | no disponible | HF, paquete `jev-style` |

Las alternativas comparables son las propias releases de la familia JevStyle. No se dispone de datos de modelos de clasificación de terceros con los que establecer una comparación cuantitativa en la información proporcionada.

## Limitaciones y advertencias

- Release archivada: el paquete oficial `jev-style` no carga esta v2; solo funciona con los clientes incluidos en el propio repositorio. El autor recomienda v4 (2B) o v3 (0,8B).
- Solo inglés: no hay soporte multilingüe declarado, lo que excluye su uso en castellano sin reevaluación.
- Modelo de clasificación, no generativo: no produce texto libre ni razonamiento; cualquier caso de uso que requiera generación debe resolverse con otro modelo.
- Sin datos de sesgo: no se documentan evaluaciones de sesgo demográfico, de dominio ni de toxicidad.
- Riesgo de calibración fuera de distribución: la temperatura se ajusta sobre un split concreto de 3.100 registros y un panel inglés fijo; en dominios distintos la calibración puede degradarse y las probabilidades no ser fiables sin recalibración.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval ni GSM8K, por lo que la comparación con modelos de propósito general no es posible.
- Procedencia de entrenamiento específica de la release: la v2 no usó salidas de Jev, a diferencia de la v4, lo que limita la comparabilidad directa entre versiones.
- Licencia Apache 2.0: permite uso comercial, pero el autor declara mantenimiento independiente sin afiliación ni respaldo de TypeSafe; no hay garantías de soporte a largo plazo para una release archivada.
- Contexto no documentado: al no publicarse la longitud de contexto de esta v2, no debe asumirse la ventana de 8.192 tokens del servicio alojado de la v4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2
- Pesos BF16: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2/resolve/main/model.safetensors?download=true
- Variante GGUF: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF
- Variante MLX BF16: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Release recomendada v4: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4
- Página de modelos y benchmarks: https://jevstyle.com/models/
- Guía de instalación local: https://jevstyle.com/guides/run-locally/
- Guía de clasificación de texto en Python: https://jevstyle.com/guides/local-text-classification/
- Guía de routing local y Apple Silicon: https://jevstyle.com/guides/local-decision-models/
- Casos de uso de decisión visual (sí/no): https://jevstyle.com/use-cases/local-vision-decisions/
- Benchmark de routing bancario: https://jevstyle.com/benchmarks/banking-routing/
- Estado del servicio alojado: https://jevstyle.com/api/#service-status
- Health check de la API: https://api.jevstyle.com/healthz
