# AnkitNayak-dev/QJev-1.5B-LoRA

## Resumen

QJev-1.5B-LoRA es un adaptador PEFT (LoRA + cabecera MLP de decisión) publicado por AnkitNayak-dev sobre el modelo base Qwen2.5-1.5B-Instruct. Su propósito no es la generación de texto libre, sino la clasificación de decisiones: dado un contexto y un conjunto de opciones candidatas, el modelo devuelve una distribución de probabilidad normalizada sobre esas opciones y selecciona la de mayor valor esperado. El autor lo enmarca dentro de una línea de trabajo denominada "system-one reasoning" y "joint-expected-value" (JEV).

El adaptador es extremadamente ligero: 17,5 MB de pesos LoRA (rango 16, alfa 32 sobre las proyecciones de atención `q_proj`, `k_proj`, `v_proj` y `o_proj`) más una cabecera MLP de decisión de 3,18 MB con arquitectura 1536 → 512 → 10. Se distribuye como adaptador separado para entornos multi-inquilino y de borde donde los pesos base de Qwen ya están en caché local, evitando duplicar el almacenamiento del modelo base.

Su relevancia actual reside en la propuesta de separar la toma de decisiones rápida (clasificación de opciones discretas) de la generación de lenguaje, usando un adaptador de bajo coste sobre un modelo pequeño de 1.5B parámetros. El autor reporta una puntuación de 62,53 % de tolerancia estricta (0,05) en su propio benchmark JevBench, métrica que no es verificable de forma independiente con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA (rango 16, alfa 32) sobre Qwen2.5-1.5B-Instruct + cabecera MLP de decisión (1536 → 512 → 10) |
| Parametros totales | No disponible (adaptador: 17,5 MB LoRA + 3,18 MB cabecera; modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-1.5B-Instruct, no especificada en la información) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors de precisión completa; existe una variante del modelo fusionado en NF4 (QJev-1.5B-4bit, 1,15 GB) |
| Idiomas soportados | No disponible (no declarados en la model card) |
| Licencia | Apache 2.0 para el adaptador; los pesos base se rigen por la licencia Alibaba Cloud Qwen |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `decision_head.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se integra mediante PEFT sobre el backbone transformer de Qwen2.5-1.5B-Instruct. Los módulos LoRA se aplican exclusivamente a las proyecciones de atención (query, key, value y output), con rango 16 y alfa 32. Tras el paso por el backbone, el último estado oculto de la secuencia de entrada se normaliza con LayerNorm y se proyecta mediante una MLP de dos capas (1536 → 512 → 10) que produce logits de decisión normalizados sobre las opciones candidatas. La dimensión de salida de 10 sugiere un máximo de diez opciones por consulta.

El entrenamiento se realizó con QLoRA sobre el dataset `SargeDev/jev-distill-corpus-v3`, un corpus de destilación orientado a decisiones. Las métricas declaradas en la model card son accuracy, TVD (distancia de variación total) y divergencia KL, lo que indica que el objetivo de entrenamiento busca aproximar una distribución de probabilidad de referencia sobre las opciones, no solo acertar la etiqueta. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El autor evalúa el adaptador como equivalente al modelo fusionado (62,53 % estricto / 71,50 % relajado en JevBench), lo que sugiere que el adaptador captura la misma función que la versión fusionada de 16 bits.

## Capacidades

- Clasificación de decisiones sobre un conjunto acotado de opciones candidatas, devolviendo una distribución de probabilidad normalizada y la opción recomendada con su confianza.
- Razonamiento de "system-one": evaluación rápida de contexto y selección de acción sin cadena de pensamiento explícita.
- Integración como cabecera de decisión sobre un backbone Qwen2.5-1.5B-Instruct ya cargado, sin duplicar el almacenamiento del modelo base.
- Salida estructurada con `best_choice`, `confidence` y `probabilities` por opción, apta para pipelines automatizados.
- Inferencia rápida y de bajo coste: el adaptador añade solo 20,7 MB de pesos sobre el modelo base.
- Uso en entornos multi-inquilino y de borde, según el diseño declarado por el autor.
- No se declaran capacidades de generación de texto libre, tool calling, agentes multi-paso, visión, audio ni multilingüismo explícito; el pipeline declarado es `text-classification`.

## Casos de uso

- Gestión de incidentes en producción: dado un contexto operativo (por ejemplo, CPU al 100 % y pool de conexiones agotado) y un conjunto de acciones posibles, el modelo devuelve la acción recomendada con su probabilidad. El ejemplo de la model card ilustra este escenario con una recomendación de failover al 88,28 %.
- Automatización de runbooks y playbooks: clasificar entre acciones predefinidas de un procedimiento operativo (reiniciar servicio, escalar, silenciar alertas) según el estado observado del sistema.
- Triaje de tickets y alertas: seleccionar la categoría o acción de enrutamiento más probable entre un conjunto cerrado de opciones, aprovechando la salida probabilística para umbrales de confianza.
- Decisión en agentes con presupuesto de latencia: sustituir una llamada de generación por una clasificación de opciones cuando el espacio de acciones es discreto y acotado, reduciendo coste y latencia.
- Despliegue en borde y multi-inquilino: al ser un adaptador de 20,7 MB, se puede cargar sobre una instancia base compartida de Qwen2.5-1.5B-Instruct en servidores con muchos inquilinos o en dispositivos con almacenamiento limitado.
- Enrutamiento de políticas y reglas de negocio: elegir entre políticas predefinidas (por ejemplo, aprobar, rechazar, escalar, revisar manualmente) con una distribución de probabilidad auditable por opción.
- Investigación en razonamiento "system-one": servir como componente de referencia para experimentos que comparen decisión directa frente a razonamiento explícito en modelos pequeños.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| JevBench (oficial) | Tolerancia estricta 0,05 | 62,53 % |
| JevBench (oficial) | Tolerancia relajada 0,10 | 71,50 % |

El autor indica que el adaptador evalúa de forma idéntica al modelo fusionado. No se han publicado en la información disponible resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones independientes con otros modelos. Las cifras de JevBench proceden del propio autor y de su benchmark, por lo que no son verificables de forma externa con los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador añade unos 21 MB a los pesos del modelo base. El modelo base Qwen2.5-1.5B-Instruct en FP16 requiere aproximadamente 3 GB de VRAM; en cuantización NF4 (variante QJev-1.5B-4bit, 1,15 GB) el requisito baja a alrededor de 1,5-2 GB incluyendo overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 del modelo base; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con 4 GB o más de VRAM, y en la variante 4-bit incluso en GPUs de gama baja.
- Opciones de despliegue: la librería `peft` y `transformers` son las vías declaradas; el autor publica un paquete `qjev` con la API `QJev.from_pretrained` y el método `decide`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. Por el tamaño del modelo base (1.5B) y la naturaleza de clasificación (una pasada forward más la cabecera MLP), se espera una latencia baja, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QJev-1.5B-LoRA | Adaptador sobre Qwen2.5-1.5B | No disponible | Clasificación de decisiones (LoRA + MLP) | Apache 2.0 (adaptador) | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.5B | No disponible en la información | Generación de texto instruct | Alibaba Cloud Qwen | Hugging Face |
| QJev-1.5B (fusionado) | 1.5B + cabecera | No disponible | Clasificación de decisiones (16 bits) | Apache 2.0 | Hugging Face |
| QJev-1.5B-4bit | 1.5B + cabecera (NF4) | No disponible | Clasificación de decisiones (cuantizado) | Apache 2.0 | Hugging Face |

La comparación más directa es con el propio modelo base Qwen2.5-1.5B-Instruct: QJev añade una cabecera de decisión y adaptadores de atención para producir distribuciones sobre opciones discretas, en lugar de texto libre. Frente a las variantes fusionada y 4-bit de la misma familia, el adaptador LoRA destaca por su tamaño (20,7 MB) y por reutilizar los pesos base ya en caché. No se dispone de comparaciones con otros modelos de clasificación o decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para clasificar entre un máximo de diez opciones (dimensión de salida de la cabecera MLP); no es un modelo de generación de texto libre.
- Las métricas de JevBench proceden del propio autor y de su benchmark; no hay validación independiente disponible.
- No se declaran los idiomas soportados; el comportamiento multilingüe es incierto y depende del modelo base.
- No se especifica la longitud de contexto efectiva ni cómo se trunca el contexto de entrada antes de la cabecera de decisión.
- Riesgo de alucinación no aplica en el sentido clásico, pero sí de calibración: las probabilidades de la cabecera MLP pueden estar mal calibradas fuera de la distribución del corpus de destilación.
- La licencia Apache 2.0 cubre el adaptador, pero los pesos base se rigen por la licencia Alibaba Cloud Qwen; el uso comercial debe verificar ambas.
- El adaptador requiere cargar el modelo base Qwen2.5-1.5B-Instruct; no funciona de forma autónoma.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni procesos de alineación (RLHF/DPO).
- El repositorio tiene un tamaño de 0,0 GB reportado y muy pocas descargas (38) y likes (0), lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/AnkitNayak-dev/QJev-1.5B-LoRA
- Hugging Face del modelo base fusionado: https://huggingface.co/devankit7873/QJev-1.5B
- Hugging Face de la variante 4-bit: https://huggingface.co/devankit7873/QJev-1.5B-4bit
- Repositorio GitHub: https://github.com/AnkitNayak-dev/QJev-1.5B
- Benchmark JevBench: https://benchmarkheaven.com/jev-models
- Dataset de entrenamiento: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
