# ahmedselhady/XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only-step-200

## Resumen

XSDPO-Nemotron-1.5B es un checkpoint intermedio (paso 200) de un ajuste fino mediante SDPO (una variante de optimización por preferencias, presumiblemente *Self-Distillation Policy Optimization* o similar) sobre el modelo base `nvidia/Nemotron-Research-Reasoning-Qwen-1.5B`. Lo publica el usuario `ahmedselhady` en Hugging Face como artefacto de investigación, no como un modelo listo para producción: el nombre codifica toda la configuración del experimento (tasa de aprendizaje 3e-6, coeficiente KL 0.001, 1500x2 muestras, semilla de referencia 10752, k=512, selección de grupo solo en inglés).

El modelo base pertenece a la familia Nemotron Research Reasoning de NVIDIA, construida sobre la arquitectura Qwen2 y orientada a razonamiento matemático y de tipo *chain-of-thought*. Con 1.777.088.000 parámetros reales según los pesos en safetensors (etiquetado comercialmente como 1.5B), es un modelo denso de tamaño pequeño-medio, adecuado para experimentación en una sola GPU.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline de alineamiento por preferencias aplicado a un modelo de razonamiento, y permite a investigadores comparar el estado del entrenamiento en el paso 200 frente al modelo base o frente a checkpoints posteriores. No hay model card descriptiva, ni licencia declarada, ni idiomas especificados, ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen2 (heredada del modelo base) |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (los pesos se distribuyen en safetensors, por lo que caben conversiones a GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | no disponibles (el identificador del run menciona `en-bn`, lo que sugiere datos en inglés y bengalí, pero no se documenta cobertura oficial) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,6 GB |
| Modelo base | nvidia/Nemotron-Research-Reasoning-Qwen-1.5B |
| Libreria | transformers |
| Pipeline | text-generation |
| Paso de entrenamiento | 200 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer denso de tipo decoder-only de la familia Qwen2, con atención por causalidad estándar y sin mezcla de expertos. No se documentan en la información disponible el número de capas, la dimensión oculta ni la longitud de contexto nativa; estos datos habría que consultarlos en la model card de `nvidia/Nemotron-Research-Reasoning-Qwen-1.5B`, no en este checkpoint.

El entrenamiento consiste en un ajuste fino con SDPO sobre el modelo de razonamiento de NVIDIA. El identificador del run revela los hiperparámetros principales: tasa de aprendizaje 3e-6, coeficiente de penalización KL de 0.001 frente a una referencia (probablemente el modelo base o un modelo congelado), 1500 muestras duplicadas (1500x2), tamaño de grupo k=512, semilla de referencia 10752 y filtrado de grupo restringido a inglés (`en_only`). El checkpoint corresponde al paso 200, es decir, un estado parcial de entrenamiento, no el modelo final. No se especifican el volumen total de tokens, la composición del dataset ni si hubo etapas previas de SFT o RLHF más allá del propio SDPO.

## Capacidades

- Generación de texto conversacional y de razonamiento paso a paso, heredada del modelo base Nemotron Research Reasoning.
- Razonamiento matemático y resolución de problemas con trazas de razonamiento explícitas.
- Generación de código, en la medida en que el modelo base Qwen2 lo soporte.
- Soporte de tool calling y function calling: no documentado en este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este checkpoint.
- Capacidades multilingües: el run menciona datos en inglés y bengalí, pero no hay evaluación publicada de competencia lingüística.
- Modo *thinking* explícito: plausible por herencia del modelo base de razonamiento, pero no verificado en este checkpoint.

## Casos de uso

- Investigación en alineamiento por preferencias: usar el checkpoint del paso 200 como punto intermedio para estudiar la evolución de la política durante el entrenamiento SDPO, comparando distribuciones de salida con el modelo base y con checkpoints posteriores.
- Reproducibilidad de experimentos: el identificador codifica todos los hiperparámetros, lo que permite reconstruir la configuración y repetir el run con las mismas condiciones de semilla y coeficiente KL.
- Evaluación de la degradación por KL: con un coeficiente de 0.001, resulta útil medir cuánto se desvía el modelo del de referencia en tareas de matemáticas y razonamiento, y si el paso 200 ya muestra deriva o colapso de diversidad.
- Estudio de mezcla de idiomas en entrenamiento: el sufijo `en-bn` y el filtrado `en_only` permiten analizar si el ajuste sesga la salida hacia el inglés o mantiene competencia en bengalí.
- Base para experimentos de destilación: al ser un modelo de 1,78 B parámetros, se puede usar como profesor o alumno en pipelines de destilación sobre modelos mayores de razonamiento.
- Pruebas de infraestructura de inferencia: sirve para validar despliegues con transformers, TGI o vLLM antes de escalar a modelos mayores de la misma familia, dado su tamaño reducido y formato safetensors estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1 GB para pesos, con margen para contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, L4, A10); para cuantización en 4 bits cabe en GPUs de 4-6 GB (GTX 1650 Super, RTX 3050).
- Cabe en GPU de consumo: sí, en la mayoría de modelos con 8 GB o más en FP16 y prácticamente cualquiera con 4 bits.
- Opciones de despliegue: transformers (nativo), Text Generation Inference (el modelo declara `endpoints_compatible` y `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1,78 B | no disponible | no disponible | Hugging Face, checkpoint paso 200 | Ajuste SDPO sobre Nemotron Research Reasoning |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1,5 B (nominal) | no disponible | no disponible | Hugging Face | Modelo base, orientado a razonamiento |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32 768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Hugging Face | Alternativa generalista con licencia permisiva |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5 B | 32 768 tokens (según documentación pública) | MIT (según documentación pública) | Hugging Face | Destilado de razonamiento con amplia adopción |

La comparación es orientativa: los datos de los modelos alternativos provienen de su documentación pública y no de la información proporcionada para este checkpoint, por lo que conviene verificarlos antes de tomar decisiones.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 200), no un modelo final; su calidad puede ser inferior a la del modelo base o a la de checkpoints posteriores del mismo run.
- No hay licencia declarada, lo que impide determinar si el uso comercial está permitido; en la práctica, esto bloquea su adopción en producción sin aclaración previa del autor.
- No hay model card descriptiva ni evaluación publicada: se desconoce el comportamiento en tareas concretas, la tasa de alucinación y la estabilidad del razonamiento.
- El ajuste con SDPO y coeficiente KL bajo puede inducir deriva respecto al modelo base; sin benchmarks no es posible cuantificarla.
- El identificador sugiere entrenamiento con datos en inglés y bengalí, pero no hay garantías de calidad en ninguno de los dos idiomas ni en otros.
- El nombre comercial "1.5B" no coincide con los 1,78 B reales de los pesos; conviene usar el dato de safetensors para planificar memoria.
- Riesgo de sesgos heredados del modelo base y del dataset de preferencias, no documentados.
- No se especifican la longitud de contexto efectiva ni el formato de chat esperado, lo que puede provocar degradación si se usa con plantillas inadecuadas.

## Enlaces

- Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only-step-200
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Perfil del autor: https://huggingface.co/ahmedselhady
