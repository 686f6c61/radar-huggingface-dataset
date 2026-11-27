# Ethan33X/Tractus-2B

## Resumen

Tractus-2B es un modelo de decisión de 1,88 mil millones de parámetros desarrollado por Ethan33X, obtenido mediante post-entrenamiento del modelo base Qwen/Qwen3.5-2B-Base. No es un generador de texto convencional: su función principal es puntuar y clasificar un conjunto de opciones candidatas (entre 2 y 255) a partir de un estado de entrada, devolviendo probabilidades calibradas sin generar tokens. Resuelve el problema de la latencia de decodificación autoregresiva en tareas de enrutamiento y clasificación, eliminando por completo el coste de generación en su modo System 1.

El modelo combina dos modos de operación: un modo System 1 de una sola pasada (zero-decode-latency) que lee el estado y las opciones en un único prefill, y un modo System 2 de deliberación bidimensional con compuerta de fase. Está construido sobre la arquitectura híbrida vision-language de Qwen3.5, con un backbone de 24 capas (18 Gated DeltaNet + 6 Gated Attention), 2.048 dimensiones ocultas, 6.144 de FFN y una ventana de contexto nativa de 262.144 tokens.

Su relevancia actual radica en que ofrece decisiones calibradas con un consumo de memoria reducido (3,8 GB en BF16, 1,0 GB en INT4) y una proyección de lectura un 99,9% menor que la cabeza de vocabulario completa, lo que lo hace apto para despliegues en producción con SLA estrictos, incluyendo hardware de consumo como Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5: 24 capas (18 Gated DeltaNet + 6 Gated Attention), vision-language |
| Parametros totales | 1.881.825.088 (1,88B); 1,48B sin embeddings |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | BF16 (3,8 GB), INT4 (1,0 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Modified MIT (con aviso Apache-2.0 de Qwen3.5) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B-Base, una base fundacional unificada vision-language. La arquitectura es híbrida: de las 24 capas totales, 18 son Gated DeltaNet y 6 son Gated Attention, con dimensiones de 2.048 (hidden) y 6.144 (FFN), y un vocabulario de 248.320 tokens. Esta combinación reduce el consumo de caché KV en BF16 un factor de 4× a 256K de contexto (de 34,36 GB a 8,59 GB) y permite reutilizar el 100% del prefijo KV de prefill en vivo al escalar de System 1 a System 2, sin re-prefill.

El post-entrenamiento introduce un mecanismo denominado Thermostasis para la calibración de las puntuaciones: un desplazamiento binario de prior opcional, un softcapping de logits mediante tanh con C = 30,0, un centrado de suma cero y un e-termóstato analítico 2D sin parámetros ni escalares de temperatura ajustados por validación. Los dos priors binarios estáticos opcionales (+3,2 de alucinación en RAGTruth y -0,75 de phishing en PhishNChips) solo se activan en Decision Index 0.3 y valen 0 en los 9 benchmarks primarios y en el conjunto OOD de 19.887 elementos. La model card no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset, ni si se emplearon RLHF o DPO.

## Capacidades

- Puntuación de opciones candidatas en una sola pasada (System 1) con 0 tokens generados y latencia de decodificación nula.
- Deliberación bidimensional con compuerta de fase (System 2) para razonamiento multi-paso cuando se requiere.
- Clasificación calibrada con probabilidades de opción (Pooled ECE reportado en el rango del 1,97% al 3,89% en el Matched Commercial Suite).
- Enrutamiento de intenciones y decisiones de selección entre 2 y 255 opciones.
- Procesamiento de entradas multimodales: texto, JSON estructurado, tablas, layouts de interfaz y estados espaciales.
- Razonamiento causal (evaluado en JevBench 231).
- Capacidades de seguridad y mitigación de alucinación mediante priors opcionales (RAGTruth, PhishNChips).
- Soporte de contexto largo de hasta 256K tokens.
- Integración con transformers y endpoints compatibles.

## Casos de uso

- Enrutamiento de intenciones en banca y servicios: el modelo puntúa directamente entre múltiples intenciones candidatas en una sola pasada, sin generar texto, lo que permite resolver peticiones de clientes con latencia mínima y probabilidades calibradas para umbrales de derivación.
- Navegación web automatizada: dada una representación del estado de la página (layout de UI) y un conjunto de acciones posibles, selecciona la siguiente acción sin decodificación, adecuado para agentes que operan bajo restricciones de latencia.
- Centinela de reuniones full-duplex: clasifica estados conversacionales en tiempo real aprovechando el contexto largo y el modo de una sola pasada para decidir cuándo intervenir.
- Enrutamiento de consultas en pipelines RAG: con el prior de alucinación activable, decide si una consulta debe responderse con recuperación o derivarse, usando las probabilidades calibradas como señal de confianza.
- Detección de phishing: el prior de phishing (-0,75 en PhishNChips) permite clasificar solicitudes sospechosas dentro de un flujo de decisión binario o multiclase.
- Simulación de dinámicas espaciales multiagente: el demo JevBall coordina 22 agentes bajo un SLA de 300 ms, lo que demuestra la viabilidad del modelo en bucles de decisión de alta frecuencia.
- Clasificación de documentos estructurados: procesa ledgers JSON y tablas para asignar categorías o rutas de procesamiento con calibración explícita.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Tractus-2B | Modo |
|---|---|---|---|
| Decision Index 0.3 | Balanced Skill | 29,27 | Single-pass |
| Decision Index 0.3 | Balanced Raw Accuracy | 46,83% | Single-pass |
| JevBench 231 | Overall Accuracy (dual-mode, 8K) | 65,37% (151/231) | Dual-mode |
| JevBench 231 | Accuracy (single-pass Tractus-decision) | 69,26% (160/231) | Single-pass |
| Matched Commercial Suite (831 items, 256K) | JevBench | 71,43% | Single-pass |
| Matched Commercial Suite | Pooled ECE raw | 2,74% (1,97% OOF) | Single-pass |
| Matched Commercial Suite | Pooled ECE raw | 3,89% (3,47% OOF) | Dual-mode |
| Matched Commercial Suite | Safety-Ratchet rescues | 224/559 (68,83%) | Dual-mode |

El autor señala que en el barrido uniforme de 4K, el modo System 2 sin restricciones alcanza un 66,4% de fallos de parseo por bucles de repetición, por lo que recomienda el modo single-pass Tractus-decision como opción por defecto a escala 2B.

## Requisitos de hardware

- VRAM estimada: 3,8 GB en BF16 y 1,0 GB en INT4 para los pesos; el consumo de caché KV en BF16 a 256K se reduce a 8,59 GB gracias a la arquitectura híbrida.
- GPU recomendadas: A100 y H100 para despliegues de contexto completo a 256K; RTX 4090 para BF16 en contextos moderados.
- Cabe en GPU de consumo: sí, en INT4 (1,0 GB) y en BF16 en tarjetas con 8 GB o más para contextos cortos; los demos oficiales funcionan en Apple Silicon Metal GPU con MLX INT4.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles, CUDA/PyTorch en BF16 y MLX INT4 en Apple Silicon.
- Latencia y throughput: el modo System 1 elimina la latencia de decodificación (0 tokens generados); el demo JevBall opera bajo un SLA de 300 ms. No se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tractus-2B | 1,88B | 262.144 | Decisión dual-mode (System 1 + System 2) | Modified MIT | Hugging Face |
| Tractus-decision-2B | 1,88B | 262.144 | Decisión single-pass (System 1) | Modified MIT | Hugging Face |
| Tractus-0.8B | 0,82B | 262.144 | Decisión dual-mode | Modified MIT | Hugging Face |
| Tractus-4B | 4,21B | 262.144 | Decisión dual-mode | Modified MIT | Hugging Face |

No se dispone en la información proporcionada de comparaciones con modelos de decisión o clasificación de otros desarrolladores; los únicos comparables documentados son las otras escalas de la propia familia Tractus (0.8B, 4B y 9B).

## Limitaciones y advertencias

- A escala 2B, el modo System 2 sin restricciones produce bucles de repetición con un 66,4% de fallos de parseo en el barrido uniforme de 4K; el autor recomienda usar el modo single-pass como opción por defecto.
- El modelo solo declara soporte de inglés; no se documentan capacidades multilingües.
- Los benchmarks son declarados por el autor y figuran como no verificados; no hay validación independiente.
- El modelo está diseñado para puntuar opciones, no para generación de texto libre; usarlo como generador convencional no es su caso de uso previsto.
- La licencia Modified MIT incluye aviso Apache-2.0 de Qwen3.5 y tiers comerciales/MaaS propios; es necesario revisar el archivo LICENSE antes de un uso comercial.
- Existe riesgo de alucinación en tareas de RAG, mitigado parcialmente por un prior binario opcional que solo se activa en Decision Index 0.3.
- El modelo tiene 10 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y escasa validación por parte de la comunidad.
- La model card no detalla el volumen ni la composición de los datos de entrenamiento, ni los procedimientos de alineación (RLHF/DPO), lo que dificulta evaluar sesgos y robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ethan33X/Tractus-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Variante single-pass: https://huggingface.co/Ethan33X/Tractus-decision-2B
- Variante 0.8B: https://huggingface.co/Ethan33X/Tractus-0.8B
- Variante 4B: https://huggingface.co/Ethan33X/Tractus-4B
- Variante 9B: https://huggingface.co/Ethan33X/Tractus-9B
- Dataset Decision Index 0.3: https://huggingface.co/datasets/Ethan33X/tractus-decision-index-0.3
- Licencia: https://huggingface.co/Ethan33X/Tractus-2B/blob/main/LICENSE
