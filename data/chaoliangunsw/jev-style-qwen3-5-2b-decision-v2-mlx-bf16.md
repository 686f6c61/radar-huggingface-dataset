# chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16

## Resumen

Jev-Style-Qwen3.5-2B-Decision-v2 (MLX BF16) es un modelo de decisión y clasificación de texto derivado por ajuste fino de un backbone Qwen3.5 de 2B, publicado por Chaoliang Yan (chaoliangUNSW). No es un modelo generativo de propósito general: recibe un estado, una pregunta y una lista de opciones, y devuelve una única opción seleccionada junto con probabilidades calibradas. Esta build concreta está empaquetada en formato MLX BF16 para inferencia nativa en Apple Silicon.

El modelo resuelve el problema del enrutamiento y la clasificación con calidad probabilística controlada: incorpora una temperatura de calibración ajustada sobre un split de 3.100 registros, de modo que la confianza declarada se aproxima a la precisión observada. Con 1.881.825.088 parámetros reales (1,88B) y un repo de 3,8 GB, se posiciona como una alternativa ligera y local frente a invocar un LLM generativo para tareas de decisión acotadas.

Es relevante ahora por dos motivos: la versión v2 es una release archivada (2026-09-23) que el paquete `jev-style` ya no carga —este sirve v3 y v4—, y porque el autor reporta 81,20% de exactitud macro en un panel de referencia en inglés, con intervalos de confianza pareados frente a v1 y a English Laya. Cualquier integración nueva debería evaluar la v4 (texto e imagen) o la 0.8B v3 antes de adoptar esta build.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone Qwen3.5 2B) con cabeza de decisión sobre opciones; inferencia de un solo prefill |
| Parametros totales | 1.881.825.088 (1,88B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para esta build MLX; la API alojada de la v4 declara 8.192 tokens con entradas de hasta 8.000 |
| Tipos de cuantizacion | BF16 en este repo; la familia incluye GGUF Q4_K_M, Q8_0 y BF16 (1,27–3,78 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX BF16); existen builds GGUF y HF BF16 del mismo modelo base |
| Libreria | mlx |
| Pipeline | text-classification |
| Modelo base | chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2 |
| Tamano del repo | 3,8 GB |
| Descargas / likes | 1.814 / 6 |

## Arquitectura y entrenamiento

El modelo parte de un backbone Qwen3.5 de clase 2B y se ajusta mediante LoRA de rango 32 para una tarea de selección entre opciones: dado un estado, una pregunta y un conjunto de alternativas, un único prefill produce la opción elegida y su distribución de probabilidad. El entrenamiento principal requirió 36,9 minutos en una H100 de 80 GB, lo que indica un ajuste fino compacto sobre un backbone ya preentrenado y no un entrenamiento desde cero.

La innovación técnica central no está en la arquitectura sino en la calibración: se ajusta una temperatura sobre un split de calibración de 3.100 registros, y los clientes de HF y MLX la aplican automáticamente; en el fichero GGUF calibrado la temperatura queda incorporada en el tensor de normalización final. El autor indica que esta v2 se entrenó sin salidas de Jev (a diferencia de la v4, que usa etiquetas suaves destiladas de TypeSafe Jev 1.14 vía API pública). No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Clasificación de texto en inglés con salida de una etiqueta por decisión.
- Enrutamiento (routing) entre un conjunto finito de opciones definidas por el usuario.
- Decisiones de elección tipada (typed decisions) y preguntas booleanas sí/no.
- Puntuación de opciones fijas con probabilidades calibradas, no solo la etiqueta ganadora.
- Inferencia de un solo prefill: no requiere generación autoregresiva token a token.
- Evaluación de robustez al orden de opciones (permutación de alternativas).
- No soporta tool calling, agentes multi-paso, visión, audio ni modo thinking según la información disponible.
- Multilingüe: no, únicamente inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado y una lista cerrada de colas o equipos como opciones, y devuelve la asignación con probabilidad calibrada, lo que permite fijar umbrales de escalado a revisión humana cuando la confianza es baja.
- Clasificación de intención en asistentes conversacionales: con un catálogo acotado de intenciones, un solo prefill por turno sustituye a una llamada generativa completa, reduciendo latencia y coste en el camino crítico.
- Verificación de documentos y capturas (sí/no): la familia JevStyle documenta decisiones binarias sobre recibos y capturas de pantalla; esta build MLX es solo texto, pero el patrón de pregunta más opciones sí/no aplica a validaciones documentales textuales.
- Moderación de contenido por categorías: clasificación de textos en categorías predefinidas con probabilidad asociada, útil para priorizar la cola de revisión manual según confianza.
- Etiquetado asistido y triaje de datos: uso del modelo para preetiquetar corpus en inglés con scores de confianza, dejando la revisión humana para los casos de baja calibración.
- Desarrollo local en Apple Silicon: al estar en MLX BF16, permite prototipar y validar pipelines de decisión íntegramente en un Mac sin GPU dedicada ni claves de API alojadas.
- Comparación reproducible de estrategias de enrutamiento: el autor publica un benchmark de routing bancario que sirve como plantilla para evaluar el modelo frente a alternativas en un dominio concreto.

## Benchmarks y rendimiento

Resultados sobre el panel de referencia fijo en inglés (11 grupos de tareas con etiquetas reales, 3.277 decisiones, pesos de tarea iguales, mismo split de calibración de 3.100 registros), con la estructura de referencia CUDA:

| Metrica | Jev-Style v1 | English Laya | Jev-Style v2 |
|---|---:|---:|---:|
| Accuracy ↑ | 76,68% | 75,09% | 81,20% |
| Macro-F1 ↑ | 75,42% | 73,45% | 79,78% |
| Negative log-likelihood ↓ | 0,5752 | 0,6318 | 0,5154 |
| Brier score ↓ | 0,3290 | 0,3482 | 0,2787 |

- Mejora de exactitud de +4,53 puntos sobre v1 (IC 95% pareado [+3,58, +5,52]) y +6,12 sobre English Laya ([+4,64, +7,52]), dentro de este panel fijo.
- Exactitud por encima de English Laya en 9 de 12 grupos de tareas, incluido el grupo de decisiones tipadas con referencia de profesor evaluado por separado.
- Frente a English Laya: NLL un 18,4% menor, Brier un 20,0% menor y ECE macro por tarea un 26,4% menor.
- Robustez al orden de opciones: tasa de volteo reducida a la mitad respecto a English Laya, con 80,00% de exactitud tras permutación sobre las mismas 400 decisiones Choice/Bool.
- No se han publicado en la información disponible resultados desagregados para esta build MLX BF16; las cifras corresponden a la estructura de referencia CUDA.

## Requisitos de hardware

- Pesos BF16 de 3,76 GB; el repo completo ocupa 3,8 GB.
- VRAM/unified memory estimada: en torno a 4-5 GB para pesos e inferencia en BF16, sin margen para batches grandes.
- GPU recomendadas: no disponible para CUDA en esta build; el modelo está empaquetado para MLX y Apple Silicon. El entrenamiento principal se realizó en una H100 de 80 GB en 36,9 minutos.
- Cabe en GPU de consumo: sí, en términos de tamaño (una RTX 4090 de 24 GB o una RTX 3090 de 12 GB alojarían los pesos BF16 holgadamente), pero esta build concreta requiere MLX; para CUDA o CPU hay que usar la build HF BF16 o los GGUF (1,27–3,78 GB) con llama.cpp.
- Opciones de despliegue: cliente nativo MLX en Apple Silicon para este repo; Transformers con el cliente de decisión para la build HF BF16; llama.cpp para Q4_K_M, Q8_0 y BF16 GGUF; API alojada independiente (solo v4, texto, contexto de 8.192 tokens) con respuestas 429 y cabecera `Retry-After` cuando la capacidad compartida está saturada.
- Latencia y throughput: no disponibles en la información proporcionada; la arquitectura de un solo prefill está diseñada para minimizar el coste por decisión frente a la generación autoregresiva.
- Nota de compatibilidad: el paquete `jev-style` no carga esta v2; solo carga v3 y v4. Esta build funciona únicamente con los clientes incluidos en el propio repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (panel EN) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Jev-Style-Qwen3.5-2B-Decision-v2 (MLX BF16) | 1,88B | no disponible | 81,20% | apache-2.0 | HF, MLX; GGUF y HF BF16 en repos hermanos |
| Jev-Style v1 (2B) | clase 2B | no disponible | 76,68% | no disponible | HF |
| English Laya | no disponible | no disponible | 75,09% | no disponible | no disponible |
| Jev-Style 2B v4 | clase 2B | 8.192 tokens (API alojada) | no disponible | no disponible | release recomendada actual; texto e imagen |
| Jev-Style 0.8B v3 | clase 0,8B | no disponible | no disponible | no disponible | release más pequeña de texto |

La comparación se limita al panel fijo del propio autor; no hay datos públicos cruzados con clasificadores encoder-only de tamaño similar (por ejemplo, familias tipo DeBERTa o ModernBERT) en la información disponible.

## Limitaciones y advertencias

- Release archivada: el paquete `jev-style` no carga esta v2; solo funciona con los clientes incluidos en el repositorio. Para integraciones nuevas, el autor recomienda la 2B v4 o la 0.8B v3.
- Solo inglés: el campo de idioma declara `en`; no hay evidencia de rendimiento multilingüe.
- Solo texto en esta build: las capacidades de visión pertenecen a la v4, no a esta release.
- Dominio acotado: está diseñado para elección entre opciones predefinidas, no para generación libre, razonamiento abierto ni tool calling.
- Riesgo de alucinación estructural: al forzar una elección dentro del conjunto de opciones, siempre devolverá una opción aunque ninguna sea adecuada; es imprescindible usar la probabilidad calibrada y umbrales de abstención.
- Sesgos: no se documentan análisis de sesgo en la información disponible; el panel de evaluación es fijo y en inglés, por lo que la generalización a otros dominios no está garantizada.
- Las métricas de cabecera proceden de la estructura de referencia CUDA, no de esta build MLX; el rendimiento exacto en Apple Silicon puede diferir.
- Robustez parcial: pese a reducir a la mitad el volteo por orden de opciones, la exactitud tras permutación es del 80,00%, no del 100%; el orden de las alternativas sigue influyendo.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar la procedencia del backbone Qwen3.5 y de los datos de calibración antes de desplegar en producción.
- Sin cuota fija en la API alojada: la capacidad es compartida y puede devolver 429; no debe tratarse como un servicio con SLA para producción crítica.
- Proyecto mantenido por un autor individual, sin afiliación ni respaldo de TypeSafe; la trazabilidad del entrenamiento varía por release.

## Enlaces

- Modelo en Hugging Face (esta build): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16
- Modelo base HF BF16: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2
- Build GGUF: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-GGUF
- Descarga directa de pesos: https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2-MLX-bf16/resolve/main/model.safetensors?download=true
- Página de modelos y benchmarks: https://jevstyle.com/models/
- Guía de instalación y verificación local: https://jevstyle.com/guides/run-locally/
- Guía de clasificación de texto en Python: https://jevstyle.com/guides/local-text-classification/
- Guía de routing local y Apple Silicon: https://jevstyle.com/guides/local-decision-models/
- Casos de uso de decisiones visuales sí/no: https://jevstyle.com/use-cases/local-vision-decisions/
- Benchmark de routing bancario: https://jevstyle.com/benchmarks/banking-routing/
- Estado del servicio alojado: https://jevstyle.com/api/#service-status
- Health check de la API: https://api.jevstyle.com/healthz
