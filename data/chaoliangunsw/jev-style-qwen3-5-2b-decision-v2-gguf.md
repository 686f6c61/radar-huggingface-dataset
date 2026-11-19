# chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF

## Resumen

Jev-Style-Qwen3.5-2B-Decision-v2 es un modelo de decisión y clasificación de texto construido sobre un backbone Qwen3.5 de 2B parámetros (1.881.825.088 parámetros reales) y ajustado mediante LoRA de rango 32 por Chaoliang Yan (chaoliangUNSW). Su función no es la generación libre de texto, sino recibir un estado, una pregunta y una lista cerrada de opciones, y devolver una opción seleccionada junto con probabilidades calibradas en un único prefill. Está pensado para routing, clasificación y scoring de elección fija en entornos locales.

El repositorio que nos ocupa contiene los pesos en formato GGUF (Q4_K_M, Q8_0 y BF16), lo que permite ejecutarlo con llama.cpp en hardware modesto. Es una release archivada (v2, publicada el 23 de septiembre de 2026) que se mantiene por compatibilidad con integraciones existentes: el paquete `jev-style` actual no la carga, sino que sirve las versiones v3 y v4. La v2 no utilizó salidas de Jev en su entrenamiento, a diferencia de la v4, que incorpora etiquetas suaves destiladas de TypeSafe Jev 1.14.

Su relevancia actual es doble: por un lado, documenta un caso de calibración de probabilidades en modelos pequeños con métricas explícitas (NLL, Brier, ECE) y comparación entre precisiones de cuantización; por otro, sirve como referencia de un patrón de despliegue de clasificadores locales de bajo coste frente a APIs hospedadas. El modelo declara licencia Apache 2.0 y soporte únicamente de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3.5 de clase 2B) con cabeza de decisión sobre opciones; ajuste LoRA rango 32 |
| Parametros totales | 1.881.825.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para esta release v2 (la v4 hospedada declara 8.192 tokens con entradas de hasta 8.000) |
| Tipos de cuantizacion | Q4_K_M (1,27 GB), Q8_0 (2,01 GB), BF16 (3,78 GB); también existe BF16 en safetensors (3,76 GB) y MLX BF16 (3,76 GB) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors BF16 y MLX BF16 en repos hermanos |

## Arquitectura y entrenamiento

El modelo parte de un backbone textual Qwen3.5 de 2B parámetros y se adapta mediante LoRA de rango 32 para una tarea de decisión tipada: dada una tupla de estado, pregunta y conjunto de opciones, el modelo puntúa cada opción y devuelve una elección con distribución de probabilidad asociada. El entrenamiento principal reportado es de 36,9 minutos en una H100 de 80 GB, lo que indica un ajuste muy contenido sobre el backbone preentrenado en lugar de un entrenamiento desde cero. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset.

El aspecto técnico diferencial es la calibración. Cada fichero GGUF incluye una calibración ajustada de forma independiente, y se debe usar temperatura de runtime 1.0. La evaluación se realizó sobre un panel inglés fijo de 11 grupos de tareas con etiquetas reales (3.277 decisiones, pesos de tarea iguales) y un split de calibración de 3.100 registros. La inferencia está diseñada para un único prefill por decisión, sin decodificación autoregresiva de texto libre, lo que reduce la latencia frente a esquemas de generación con parsing posterior.

## Capacidades

- Clasificación de texto con etiquetas cerradas: devuelve la opción seleccionada y su probabilidad calibrada.
- Routing de decisiones: selección entre un conjunto finito de rutas, herramientas o categorías a partir de un estado descriptivo.
- Scoring de elección fija (typed decisions): puntuación comparable entre opciones de una misma lista.
- Calibración de confianza utilizable para umbrales y escalado a revisión humana (NLL, Brier y ECE reportados).
- Ejecución local con llama.cpp en formato GGUF, sin dependencia de API hospedada.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags) y uso conversacional según metadatos.
- No soporta generación libre de texto de calidad, visión, audio ni tool calling genérico; su salida está restringida al espacio de opciones proporcionado.

## Casos de uso

- Routing de tickets de soporte: el modelo recibe el texto del ticket como estado y una lista de colas o equipos como opciones, y devuelve la cola asignada con probabilidad; la calibración permite enviar a revisión manual los casos con confianza baja.
- Clasificación de intención en asistentes conversacionales: con un conjunto fijo de intenciones, una sola pasada de prefill sustituye a la generación de texto más parsing, reduciendo latencia y coste por petición.
- Moderación por categorías: clasificación de contenido en un conjunto cerrado de políticas, usando el score calibrado para definir umbrales de bloqueo, revisión o paso.
- Enrutado de herramientas en agentes: dado el estado de la conversación y la lista de herramientas disponibles, seleccionar la herramienta adecuada; encaja en pipelines donde el modelo grande solo se invoca tras la decisión.
- Triage documental: asignación de documentos entrantes a departamentos o tipos documentales con probabilidades auditables, útil en flujos con requisitos de trazabilidad.
- Decisiones sí/no sobre recibos o capturas (variante de visión en releases posteriores): la v2 es solo texto, pero el patrón de decisión binaria calibrada es aplicable a validaciones automáticas con umbral de confianza.
- Evaluación A/B de prompts de clasificación: al ser un modelo pequeño y determinista en formato de salida, sirve para comparar esquemas de prompting y calibración de forma reproducible en local.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el panel inglés fijo (estructura de referencia CUDA, 3.277 decisiones, 11 grupos de tareas con etiquetas reales):

| Metrica | Jev-Style v1 | English Laya | Jev-Style v2 |
|---|---:|---:|---:|
| Accuracy | 76,68% | 75,09% | 81,20% |
| Macro-F1 | 75,42% | 73,45% | 79,78% |
| Negative log-likelihood (menor es mejor) | 0,5752 | 0,6318 | 0,5154 |
| Brier score (menor es mejor) | 0,3290 | 0,3482 | 0,2787 |

Rendimiento por precisión de despliegue (subconjunto congelado de 500 decisiones; agreement frente a BF16 fusionado en CUDA):

| Precision | Tamano | Agreement | Macro accuracy |
|---|---:|---:|---:|
| Q4_K_M | 1,27 GB | 91,4% | 78,18% |
| Q8_0 | 2,01 GB | 99,2% | 78,69% |
| BF16 | 3,78 GB | 99,6% | 79,36% |

El autor reporta mejoras de +4,53 puntos sobre v1 y +6,12 sobre English Laya en accuracy, con intervalos pareados del 95% de [+3,58; +5,52] y [+4,64; +7,52] respectivamente, dentro de ese panel fijo. También declara ventaja en 9 de 12 grupos de tareas, y reducciones del 18,4% en NLL, 20,0% en Brier y 26,4% en ECE de macro de tarea frente a English Laya. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB para Q4_K_M, 2,0 GB para Q8_0 y 3,8 GB para BF16, más overhead de contexto y del runtime de llama.cpp.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o más de VRAM puede ejecutar Q4_K_M con margen; 6-8 GB permiten Q8_0 con contexto amplio.
- GPU recomendadas: RTX 3060/4060 y superiores para Q4_K_M y Q8_0; A100, H100 o RTX 4090 para BF16 con throughput alto y procesamiento por lotes.
- Despliegue: llama.cpp para GGUF; Transformers con el cliente de decisión del repositorio para BF16 safetensors; MLX nativo en Apple Silicon con los pesos MLX BF16. El paquete `jev-style` actual no carga esta release v2, solo v3 y v4.
- Latencia y throughput: no disponibles en la información proporcionada. El diseño de un único prefill por decisión y el tamaño de 2B sugieren latencias bajas en GPU de consumo, pero no hay cifras publicadas para esta release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Style-Qwen3.5-2B-Decision-v2 | 1,88B | No disponible | Clasificación y routing con probabilidades calibradas | Apache 2.0 | GGUF, BF16, MLX en HF |
| Jev-Style v1 | Clase 2B | No disponible | Igual, versión anterior | Apache 2.0 (según repo base) | HF |
| English Laya | No disponible | No disponible | Clasificación en inglés, comparador del autor | No disponible | No disponible |
| Jev-Style-2B-Decision-v4 | Clase 2B | 8.192 tokens (API hospedada) | Decisión texto e imagen, con etiquetas destiladas de Jev 1.14 | Apache 2.0 (según repo) | GGUF y paquete `jev-style` |

La comparación con modelos de clasificación generalistas de la misma talla (por ejemplo, encoders tipo DeBERTa o clasificadores sobre Qwen de 1,5-3B) no está disponible en la información proporcionada, ya que no se aportan resultados de esos sistemas sobre el mismo panel.

## Limitaciones y advertencias

- Solo inglés: el modelo declara `en` como único idioma; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Release archivada: es la v2; el autor recomienda v4 (texto e imagen) o 0.8B v3 para texto, y el paquete `jev-style` no carga esta versión.
- Restringido a elección cerrada: no es un modelo generativo; fuera del espacio de opciones proporcionado no produce respuestas útiles.
- Riesgo de calibración desplazada: las probabilidades están calibradas sobre un panel inglés concreto; en dominios distintos la confianza puede no reflejar la precisión real y conviene recalibrar o validar con datos propios.
- Cuantización Q4_K_M: el agreement cae al 91,4% frente a BF16, con una pérdida de aproximadamente 1,2 puntos de macro accuracy; para decisiones sensibles se recomienda Q8_0 o BF16.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de un backbone preentrenado, hereda los sesgos de sus datos de entrenamiento, no detallados.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento del backbone y del ajuste no está descrita en detalle, lo que limita la auditoría.
- El servicio hospedado es una vía distinta de la inferencia local, con capacidad compartida y respuestas 429 con `Retry-After`; no debe confundirse con el comportamiento de estos pesos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF
- Modelo base BF16: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2
- Versión MLX BF16: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Versión recomendada v4: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4-GGUF
- Sitio del proyecto y modelos: https://jevstyle.com/models/
- Guía de instalación local: https://jevstyle.com/guides/run-locally/
- Clasificación de texto en Python: https://jevstyle.com/guides/local-text-classification/
- Routing local y Apple silicon: https://jevstyle.com/guides/local-decision-models/
- Decisiones sí/no sobre recibos y capturas: https://jevstyle.com/use-cases/local-vision-decisions/
- Benchmark de routing bancario: https://jevstyle.com/benchmarks/banking-routing/
- Estado del servicio hospedado: https://jevstyle.com/api/#service-status
- Health check de la API: https://api.jevstyle.com/healthz
