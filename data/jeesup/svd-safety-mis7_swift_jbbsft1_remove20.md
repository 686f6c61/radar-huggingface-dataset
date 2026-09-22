# Jeesup/svd-safety-mis7_swift_jbbsft1_remove20

## Resumen

`Jeesup/svd-safety-mis7_swift_jbbsft1_remove20` es un checkpoint derivado de `mistralai/Mistral-7B-Instruct-v0.2` comprimido mediante Swift-SVD y posteriormente recuperado con la etapa 2 de SVD-LLM basada en LoRA. No es un modelo de propósito general: se trata de un artefacto de investigación concebido para medir cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo base y qué regla de selección de componentes repara mejor ese daño.

El proceso aplicado elimina un 20,00 % de los parámetros densos (factor de parámetros resultante de 0,8004) mediante asignación dinámica de rango con alpha 0,6 y calibración sobre 256 secuencias de 2048 tokens de WikiText-2, con semilla 42. Después se aplica un LoRA de recuperación secuencial (primero U, luego V) entrenado sobre `alpaca_cleaned_jbbsft_x1.json` con r=8, alpha=16, dos épocas por mitad, learning rate 0,0001, batch 64 y cutoff 256. A pesar de la reducción declarada, el repositorio almacena tensores densos de 7.241.732.096 parámetros (14,5 GB en safetensors), lo que sugiere que las matrices de bajo rango se reconstruyen y se serializan con su forma completa.

Su relevancia es metodológica, no de producto: forma parte de una rejilla experimental sobre reglas de selección de componentes y presupuestos de compresión, y aporta métricas cuantificadas de ataque exitoso (ASR de 0,0423 en AdvBench y 0,0703 en StrongREJECT) junto con un sobre-rechazo macro de 0,3009 medido con WildGuard. Cualquier celda de esa rejilla debe tratarse como sujeto experimental y no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.2); pesos recomprimidos mediante Swift-SVD con asignación dinámica de rango |
| Parametros totales | 7.241.732.096 (14,5 GB en safetensors); fracción de parámetros densos declarada: 0,8004 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Mistral-7B-Instruct-v0.2 soporta 32.768 tokens |
| Tipos de cuantizacion | No se publican variantes cuantizadas; los pesos se distribuyen en safetensors (precisión original sin especificar). Convertible a GGUF/AWQ/GPTQ por el usuario, sin artefactos oficiales |
| Idiomas soportados | No disponible en la información proporcionada (el modelo base declara inglés, francés, italiano, alemán y español) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Mistral-7B-Instruct-v0.2 (transformer decoder-only con Grouped-Query Attention, ventana de atención deslizante de 4096 tokens y contexto de 32.768 tokens). Sobre ese checkpoint se aplica **Swift-SVD** con asignación dinámica de rango, alpha 0,6 y calibración consistente en 256 secuencias de 2048 tokens de WikiText-2, con semilla 42. La asignación de rangos por matriz queda registrada en `compression.json` (campo `ranks`). El resultado declarado es la eliminación del 20,00 % de los parámetros densos, con una fracción de parámetros final de 0,8004.

Posteriormente se aplica la **etapa 2 de SVD-LLM**, un LoRA de recuperación ejecutado de forma secuencial (primero el factor U, después el factor V), entrenado sobre `alpaca_cleaned_jbbsft_x1.json` con r=8, alpha=16, dos épocas por mitad, learning rate 0,0001, batch 64 y cutoff 256. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo fases adicionales de RLHF o DPO más allá de ese ajuste supervisado de recuperación. La innovación técnica del artefacto es precisamente el protocolo de compresión y reparación, no una arquitectura nueva.

## Capacidades

- Generación de texto conversacional: hereda el comportamiento instructivo del modelo base, aunque el autor advierte explícitamente que no debe considerarse un modelo de chat de propósito general.
- Razonamiento y respuesta a instrucciones: derivado de Mistral-7B-Instruct-v0.2, con la degradación esperable por la compresión y el ajuste de recuperación.
- Función como sujeto experimental de seguridad: permite medir tasa de éxito de ataques (ASR) y sobre-rechazo bajo distintos presupuestos de compresión.
- Interpretabilidad y análisis de compresión: al publicarse la asignación de rangos por matriz y el protocolo (alpha, calibración, semilla), es reproducible y auditable para estudios de SVD.
- Medición de sobre-rechazo: evaluable con WildGuard para cuantificar el coste de utilidad de la compresión.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas en la información disponible para este checkpoint.
- Capacidades especiales (modo thinking, visión, audio): no documentadas; el modelo base es exclusivamente de texto.

## Casos de uso

- Estudio de degradación de seguridad bajo compresión: usar este checkpoint junto con el modelo base sin comprimir y ejecutar baterías de ataques (AdvBench, StrongREJECT) con un juez tipo HarmBench para cuantificar cuánto ASR añade la eliminación del 20 % de parámetros.
- Comparación de reglas de selección de componentes: al ser una celda de una rejilla, sirve para contrastar con otras celdas del mismo estudio qué criterio (por ejemplo, norma, sensibilidad o rango dinámico) preserva mejor la alineación de seguridad.
- Evaluación del coste de utilidad de la compresión: medir perplejidad en WikiText-2 y sobre-rechazo con WildGuard permite trazar la curva seguridad/utilidad frente al presupuesto de parámetros.
- Reproducción de pipelines de compresión SVD: el repositorio documenta alpha, semilla, número y longitud de secuencias de calibración y rango del LoRA, lo que permite replicar el procedimiento sobre otros modelos de 7B.
- Investigación en reparación post-compresión: validar la eficacia de la etapa 2 de SVD-LLM con LoRA secuencial (U y V) frente a alternativas de ajuste completo o de destilación.
- Auditoría de licencias y trazabilidad de derivados: útil como caso práctico para verificar cómo se propaga la licencia Apache 2.0 desde un modelo base que no incluye fichero de licencia en su repositorio.
- Docencia y formación en técnicas de compresión: ejemplo real de flujo Swift-SVD + SVD-LLM con métricas publicadas y trazabilidad de hiperparámetros.

## Benchmarks y rendimiento

Métricas publicadas por el autor en la model card:

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0423 |
| StrongREJECT ASR (juez HarmBench) | 0,0703 |
| Sobre-rechazo macro (WildGuard) | 0,3009 |
| Perplejidad en WikiText-2 | 7,4159 |

No se proporcionan valores de referencia del modelo base sin comprimir ni de las demás celdas de la rejilla, por lo que no es posible calcular aquí el delta de degradación. Tampoco se han publicado resultados de benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K, MT-Bench) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en la precisión original de los safetensors (7,24 B de parámetros, ~14,5 GB de pesos): aproximadamente 16-17 GB de VRAM con margen para caché KV en contextos cortos; más de 20 GB si se trabaja cerca del contexto máximo de 32.768 tokens.
- Cuantización a 8 bits: ~8 GB de pesos, en torno a 10-12 GB de VRAM total.
- Cuantización a 4 bits: ~4,5-5 GB de pesos, aproximadamente 6-8 GB de VRAM total (los artefactos cuantizados no los publica el autor; habría que generarlos).
- GPU de centro de datos: A100 40/80 GB, H100 80 GB, L40S o A10G son suficientes para inferencia en precisión original con buena concurrencia.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en precisión original; en RTX 4080/4070 Ti (16 GB) o RTX 4060 Ti (16 GB) conviene usar 8 bits; en GPU de 8-12 GB es necesario 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-mis7_swift_jbbsft1_remove20 | 7,24 B almacenados (fracción densa 0,8004) | No disponible (base: 32.768) | Apache 2.0 | ASR AdvBench 0,0423; ASR StrongREJECT 0,0703; sobre-rechazo 0,3009; ppl WikiText-2 7,4159 | HuggingFace, 0 descargas, 0 likes |
| mistralai/Mistral-7B-Instruct-v0.2 (base sin comprimir) | 7,24 B | 32.768 | Apache 2.0 | No disponible en la información proporcionada | HuggingFace, ampliamente distribuido |
| Otras celdas de la misma rejilla de compresión | No disponible | No disponible | Apache 2.0 (presumiblemente) | No disponible | No disponible |
| Otros modelos de ~7-8 B comparables (Llama-3.1-8B-Instruct, Zephyr-7B-beta) | 7-8 B | No disponible | Licencias propias | No disponible | HuggingFace |

No se dispone de datos comparativos de benchmarks en la información proporcionada; la comparación con alternativas de la misma categoría no puede cuantificarse aquí. El criterio de comparación relevante para este artefacto no es la calidad conversacional, sino el par (ASR, sobre-rechazo) frente al modelo base y frente a otras reglas de selección de componentes.

## Limitaciones y advertencias

- No es un modelo de chat de propósito general: el propio autor lo describe como artefacto de investigación y pide evaluarlo antes de extraer conclusiones.
- Sesgos y alineación degradados por diseño: la compresión por sí sola eleva la tasa de éxito de ataques, y varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Mistral-7B-Instruct-v0.2.
- Riesgo de uso indebido: publica valores de ASR no nulos (0,0423 en AdvBench, 0,0703 en StrongREJECT); no debe exponerse como asistente público sin evaluaciones adicionales.
- Sobre-rechazo elevado: 0,3009 macro con WildGuard, lo que implica que aproximadamente un 30 % de solicitudes benignas pueden ser rechazadas, con el consiguiente impacto en utilidad.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de 7 B con compresión y ajuste LoRA limitado, es esperable, pero no hay mediciones publicadas.
- Limitaciones de contexto e idioma: no documentadas para este checkpoint; solo se puede asumir lo heredado del modelo base.
- Restricciones de licencia: el checkpoint es Apache 2.0, pero la model card advierte de que el repositorio del modelo base no incluye fichero de licencia que permita su redistribución; conviene revisar la situación antes de un uso comercial.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni soporte comunitario documentado.
- Trazabilidad limitada: no se publican detalles sobre tokens de entrenamiento totales, composición completa del dataset de recuperación ni evaluación de capacidades generales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mis7_swift_jbbsft1_remove20
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Búsqueda web: no se han encontrado enlaces relevantes al modelo (papers, blogs, repos o demos) en los resultados disponibles; las únicas coincidencias devueltas corresponden a contenidos sin relación con el modelo.
