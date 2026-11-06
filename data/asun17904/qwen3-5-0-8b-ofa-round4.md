# asun17904/Qwen3.5-0.8B-OFA-Round4

## Resumen

Qwen3.5-0.8B-OFA-Round4 es un checkpoint intermedio de calibración "once-for-all" (OFA) del backbone de texto de Qwen/Qwen3.5-0.8B, publicado por el usuario asun17904 en Hugging Face. No se trata de un modelo conversacional pensado para producción, sino de un artefacto de investigación orientado a estudiar la reutilización de cabezas de atención, MLPs y capas congeladas dentro de grafos computacionales modificados. El modelo conserva la arquitectura estándar de 24 capas del modelo base y se carga como un `Qwen3_5ForCausalLM` convencional sin código remoto.

El checkpoint contiene 752.393.024 parámetros únicos del modelo de lenguaje y corresponde a la ronda 4 de un currículo planificado de 10 rondas y 5.000 actualizaciones de optimizador; esta release concreta acumula 2.000 actualizaciones y 196.608.000 objetivos de entrenamiento puntuados. La inicialización parte del modelo upstream post-entrenado y el objetivo es negative log likelihood de siguiente token sobre un flujo empaquetado de Dolma en inglés, retokenizado con el tokenizador de Qwen.

Su relevancia es fundamentalmente metodológica: documenta un procedimiento de búsqueda de arquitectura (architecture search) que compone intervenciones sobre el grafo (omisión de cabezas, ejecución extra de cabezas o MLPs, subconjuntos de capas repetidas) sin introducir nuevos parámetros, manteniendo los pesos finetuneados entre rondas. El autor advierte explícitamente de que no reclama mejoras en precisión matemática ni robustez frente a cambios arbitrarios de grafo, y de que la integridad del artefacto no equivale a calidad downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), 24 capas, con intervenciones OFA sobre el grafo |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no validada tras la calibración OFA) |
| Tipos de cuantizacion | no disponible (export en FP32; compatible con cuantización estándar de Transformers, no verificada por el autor) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32, embeddings de entrada/salida atados almacenados una sola vez) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 24 capas heredado de Qwen3.5-0.8B. La innovación no está en la arquitectura base sino en el procedimiento OFA: cada cinco actualizaciones, el entrenador muestrea un grafo a partir de la línea base sin modificar, componiendo hasta cuatro intervenciones efectivas de las siguientes familias: omisión de cabezas de atención, ejecución extra de cabezas de atención, ejecución extra de MLP, repetición de subconjuntos de capas y ejecución extra de componentes fuera de orden. Los componentes repetidos comparten los tensores de parámetros originales, de modo que no se añaden parámetros nuevos al modelo.

El entrenamiento usa AdamW con parámetros maestros en FP32 y autocast BF16, un pico de learning rate de 1e-5 con 100 pasos de warmup y decaimiento coseno hacia 1e-6, weight decay cero y clipping de norma global 1.0. El batch global es de 96 secuencias de 1.024 objetivos de siguiente token puntuados. Se aplica una penalización anclada a la inicialización con proyección que restringe la distancia L2 relativa global de parámetros a un máximo del 1 %, configurada como región de confianza en el espacio de parámetros (no como restricción de política tipo KL o PPO). La receta exacta está en `recipe.json` y la procedencia en `provenance.json`, con hash SHA-256 del snapshot fuente `round-04.pt` (formato `zs-nas-ofa-v1`, paso 2000).

## Capacidades

- Generación de texto autoregresiva estándar mediante `Qwen3_5ForCausalLM` en Transformers.
- Plantilla de chat compatible con `apply_chat_template`, con opción `enable_thinking=False` para desactivar el modo de razonamiento.
- Ejecución de grafos OFA modificados (omisión o repetición de cabezas, MLPs y capas), siempre que se disponga de un ejecutor de grafo separado; no es posible con la generación estándar de Transformers.
- Capacidad multilingüe limitada al inglés según la model card.
- No incluye la torre de visión del modelo base ni el módulo de predicción multi-token.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- No se documentan capacidades de audio.

## Casos de uso

- Investigación en búsqueda de arquitectura (NAS): permite estudiar cómo se comportan subgrafos alterados (capas repetidas, cabezas omitidas) reutilizando pesos ya entrenados, sin necesidad de reentrenar desde cero.
- Análisis de reutilización de componentes congelados: sirve para medir hasta qué punto cabezas de atención y MLPs preentrenados siguen siendo útiles cuando se reorganizan en grafos alternativos.
- Reproducción de experimentos de calibración OFA: el checkpoint, junto con `recipe.json` y `provenance.json`, permite replicar la ronda 4 y comparar con las rondas posteriores del currículo.
- Estudio de regiones de confianza en espacio de parámetros: el límite del 1 % de distancia L2 relativa respecto a la inicialización es un caso práctico para investigar restricciones de entrenamiento alternativas a KL/PPO.
- Baseline para comparativas de eficiencia: al compartir tensores entre componentes repetidos, es útil para analizar el coste computacional de ejecutar componentes adicionales sin aumentar el número de parámetros.
- Docencia y divulgación técnica: ejemplo didáctico de exportación reproducible en safetensors y de verificación de integridad de artefactos mediante hashes.
- Evaluación de degradación por intervención de grafo: permite cuantificar la pérdida de calidad al aplicar modificaciones estructurales sobre un modelo pequeño de 0,75 B de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la release no reclama mejoras en precisión MATH, robustez frente a cambios arbitrarios de grafo ni finalización del currículo completo de calibración.

## Requisitos de hardware

- VRAM estimada: con pesos en FP32 (752 M de parámetros, ~3,0 GB de repo) se requieren aproximadamente 3 GB solo para pesos; en BF16/FP16 bajaría a ~1,5 GB, y en cuantización de 8 bits a ~0,8 GB (estimaciones, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP32 con margen para activaciones; una RTX 3060/4060 o superior es suficiente.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas con 6 GB o más.
- Opciones de despliegue: Transformers (verificado con `transformers==5.22.1`, `torch==2.9.1`, `safetensors==0.8.0`) con `attn_implementation="eager"`; no se documenta compatibilidad verificada con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-0.8B-OFA-Round4 | 752.393.024 | no disponible | Apache 2.0 | Checkpoint OFA de investigación (ronda 4 de 10) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B (no confirmado) | no disponible | Apache 2.0 | Modelo conversacional upstream completo, con visión y predicción multi-token |
| Alternativas de ~0,5-1 B (p. ej. Qwen2.5-0.5B, Llama 3.2 1B) | no disponible | no disponible | Apache 2.0 / Llama | Modelos generalistas de producción; no comparables en objetivo de investigación |

La comparación directa con modelos de producción no es significativa: este checkpoint es un artefacto intermedio de investigación sin validación downstream declarada, mientras que el modelo base y las alternativas citadas están orientados a uso conversacional general.

## Limitaciones y advertencias

- Es un checkpoint intermedio: corresponde a la ronda 4 de 10 y a 2.000 de 5.000 actualizaciones planificadas; no representa el resultado final del currículo.
- El autor no reclama calidad downstream: la verificación de carga y exportación solo establece integridad del artefacto, no rendimiento del modelo.
- La longitud de contexto heredada no ha sido validada tras la calibración OFA.
- Solo contiene el backbone de texto: no incluye la torre de visión ni el módulo de predicción multi-token del modelo base.
- Las intervenciones de grafo requieren un ejecutor de grafo externo; la generación estándar de Transformers usa la arquitectura de 24 capas sin modificar.
- Idioma limitado al inglés según la model card; no se documenta soporte multilingüe.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor.
- La reconstrucción del flujo de Dolma a partir de documentos tokenizados con GPT-2 y retokenizados con Qwen no garantiza recuperación byte a byte de los documentos originales.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; sin embargo, la ausencia de validación downstream desaconseja su uso en producción.
- No se documentan resultados de benchmarks ni comparativas de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asun17904/Qwen3.5-0.8B-OFA-Round4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Receta de entrenamiento: https://huggingface.co/asun17904/Qwen3.5-0.8B-OFA-Round4/blob/main/recipe.json
- Procedencia: https://huggingface.co/asun17904/Qwen3.5-0.8B-OFA-Round4/blob/main/provenance.json
- Licencia: https://huggingface.co/asun17904/Qwen3.5-0.8B-OFA-Round4/blob/main/LICENSE
