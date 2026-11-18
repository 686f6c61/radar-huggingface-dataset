# Eureka-COM/MemoryMosaics-v2-149M-BabiStories

## Resumen

Memory Mosaics v2 (149M) es un modelo de investigación entrenado desde cero por Eureka-COM sobre el conjunto de datos BabiStories. Implementa la arquitectura oficial Memory Mosaics v2, propuesta por el equipo de Meta en el repositorio facebookresearch/MemoryMosaics, y su propósito es servir como referencia reproducible para comparar dicha arquitectura frente a un transformer de idéntica anchura, profundidad y datos. No deriva de ningún modelo preentrenado: solo reutiliza el tokenizador de Mistral-7B-v0.1.

El modelo tiene 148.594.128 parámetros, 12 capas, anchura 768 y una ventana de contexto de 512 tokens. Su particularidad es que no contiene mecanismos de atención en ninguna capa: cada bloque combina una memoria corta (ventana deslizante) con una memoria larga basada en claves con media con fuga, agregadas mediante una suma plana y una puerta de memoria. Esto lo convierte en una pieza relevante para quien investigue alternativas a la atención cuadrática en modelos pequeños.

El interés actual reside en su valor comparativo: el modelo emparejado tipo transformer, entrenado con el mismo orden de datos y el mismo script, obtiene una pérdida de 1,7824 frente a 1,8113 de Memory Mosaics v2 en el conjunto de validación de BabiStories (2M tokens). La diferencia es de 0,029 (1,6 %) pese a tener un 11 % más de parámetros, lo que documenta con precisión el coste de esta arquitectura en esta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Memory Mosaics v2 (sin atención; memoria corta + memoria larga por capa) |
| Parametros totales | 148.594.128 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (state dict plano) |

## Arquitectura y entrenamiento

La arquitectura sigue la especificación Memory Mosaics v2: 12 capas con anchura 768 y vocabulario de 32.000 tokens (tokenizador de Mistral). Cada capa aplica RMSNorm y, a continuación, dos memorias en paralelo: una memoria corta con 6 cabezas de 128 dimensiones y ventana de 256, y una memoria larga con 6 cabezas de 128 dimensiones basada en claves con media con fuga, con skip de 64 más 192 aleatorios y una puerta de memoria. Ambas se suman en disposición "flat" y se pasan por una conexión residual, otro RMSNorm y una FFN SwiGLU de 2048 dimensiones, seguida de una segunda residual. Por capa, las memorias suman 3,57M de parámetros y la FFN 4,72M. El embedding y la salida no están atados (49,2M en total) y no hay atención en ningún punto del modelo.

El entrenamiento se realizó desde cero sobre BabiStories (historias generadas con Mixtral 8x7B y distribuidas en facebookresearch/MemoryMosaics, Apache-2.0), tokenizadas con el tokenizador de Mistral-7B-v0.1 y con enmascaramiento documental causal para mantener los documentos separados. Se ejecutaron 15.502 pasos de 8.192 tokens (16 × 512), es decir, 127M de tokens, con AdamW (β 0.9/0.95, weight decay 0.1), learning rate 3e-4 con 5 % de warmup y decaimiento coseno hasta el 1 %, precisión bf16 y semilla 42. El entrenamiento cupo en una única RTX 5090; la misma ejecución en una A100 de Colab reprodujo las pérdidas con una diferencia máxima de 0,003. El modelo emparejado tipo transformer se entrenó con el mismo orden de datos y el mismo script.

## Capacidades

- Generación de texto en inglés a nivel de investigación, limitada al dominio de historias sintéticas de BabiStories.
- Modelado de secuencias y evaluación de pérdida en lenguaje natural corto (hasta 512 tokens).
- Razonamiento sobre historias estructuradas con personajes, objetos y relaciones, propio del corpus de entrenamiento.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés; el tokenizador es multilingüe, pero el entrenamiento no lo es.
- Sin modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Investigación comparativa de arquitecturas: sirve como referencia reproducible para medir la brecha entre Memory Mosaics v2 y un transformer de igual configuración, con scripts y datos idénticos.
- Estudio de alternativas a la atención: al carecer de atención, permite analizar el comportamiento de memorias cortas y largas con claves de media con fuga en secuencias de hasta 512 tokens.
- Reproducción de experimentos a pequeña escala: los 127M de tokens de entrenamiento y la posibilidad de ejecutarlo en una RTX 5090 lo hacen viable para validar hipótesis en un solo equipo.
- Docencia y formación: un modelo de 149M parámetros con una arquitectura poco convencional y pérdidas documentadas paso a paso facilita explicar mecanismos de memoria frente a atención.
- Evaluación de pipelines de carga de state dicts: útil para probar la integración con la clase oficial `MemoryMosaics` y `MosaicsConfig` del repositorio de Meta.
- Análisis de eficiencia en contextos cortos: su ventana de 512 tokens y la ausencia de atención permiten estudiar el coste computacional y de memoria en inferencia frente a transformers equivalentes.
- Base para experimentos de continuación de entrenamiento: al ser from-scratch y Apache-2.0, puede reentrenarse o afinarse en dominios sintéticos similares sin restricciones de licencia.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). Sí documenta la pérdida en el conjunto de validación de BabiStories (2M tokens) a lo largo del entrenamiento y la compara con el modelo emparejado:

| Metrica | Memory Mosaics v2 (149M) | Transformer emparejado (134M) |
|---|---|---|
| Pérdida held-out (BabiStories val) | 1,8113 | 1,7824 |
| Pérdida al 10 % del entrenamiento | 2,5863 | no disponible |
| Pérdida al 25 % del entrenamiento | 2,2134 | no disponible |
| Pérdida al 50 % del entrenamiento | 1,9875 | no disponible |
| Pérdida al 75 % del entrenamiento | 1,8567 | no disponible |
| Parámetros | 148.594.128 | 134.105.856 |

La brecha final es de 0,029 (1,6 %) a favor del transformer, con un 11 % más de parámetros en Memory Mosaics v2; la diferencia se redujo desde +0,062 al 25 % del entrenamiento. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,3 GB para los pesos (148,6M × 2 bytes), más activaciones y caché de memoria; en la práctica cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- VRAM estimada en fp32: aproximadamente 0,6 GB para los pesos, coherente con el tamaño del repositorio (0,6 GB).
- GPU recomendadas: RTX 5090 (utilizada por el autor para el entrenamiento), A100 (validación cruzada en Colab), y en general cualquier GPU con soporte de bf16.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: carga directa del state dict con `safetensors.torch.load_file` sobre la clase oficial del repositorio facebookresearch/MemoryMosaics; no hay integración documentada con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pérdida held-out (BabiStories) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Memory Mosaics v2 149M (este) | 148.594.128 | 512 | 1,8113 | Apache-2.0 | Hugging Face + repo oficial de Meta |
| Transformer emparejado del autor | 134.105.856 | 512 | 1,7824 | no disponible | no disponible como checkpoint público en la información consultada |
| Otros modelos de 100-200M comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es la del modelo emparejado del propio autor, entrenado con los mismos datos y script. No se dispone de datos de benchmarks frente a modelos de propósito general de tamaño similar.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre BabiStories, un corpus sintético de historias; su uso fuera de ese dominio producirá salidas de baja calidad.
- No se han evaluado sesgos; al entrenarse con datos generados por Mixtral 8x7B, puede heredar sesgos de ese generador.
- Riesgo de alucinación alto fuera del dominio de entrenamiento, dado el reducido volumen de datos (127M tokens) y la naturaleza sintética del corpus.
- Contexto limitado a 512 tokens, insuficiente para la mayoría de aplicaciones de producción con documentos largos.
- Solo inglés; no hay evidencia de competencia en otros idiomas pese a usar el tokenizador multilingüe de Mistral.
- No es un modelo de chat ni de instrucciones: no se documenta ajuste por RLHF, DPO ni SFT, por lo que no debe esperarse un comportamiento conversacional alineado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está pensado para producción; su uso previsto es la investigación.
- La carga requiere construir la clase oficial desde el repositorio de Meta (commit c2ca0e8) con las anulaciones de `config.json` → `settings`; no funciona con cargadores genéricos de transformers sin adaptación.
- No hay integración con motores de inferencia estándar (vLLM, llama.cpp, Ollama, TGI), lo que complica el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Eureka-COM/MemoryMosaics-v2-149M-BabiStories
- Repositorio oficial de la arquitectura (Meta): https://github.com/facebookresearch/MemoryMosaics
- Configuración de referencia: `configs/mosaics/memory_mosaics_v2.yaml` en el repositorio anterior (commit c2ca0e8)
- Dataset BabiStories: distribuido en facebookresearch/MemoryMosaics (Apache-2.0)
- Tokenizador: Mistral-7B-v0.1 (https://huggingface.co/mistralai/Mistral-7B-v0.1)
