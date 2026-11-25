# ahmedselhady/XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-no-kl-en-step-50

## Resumen

XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-no-kl-en-step-50 es un checkpoint intermedio de un proceso de ajuste fino supervisado con preferencias (SDPO) aplicado sobre el modelo base nvidia/Nemotron-Research-Reasoning-Qwen-1.5B. Lo publica el usuario ahmedselhady en Hugging Face como artefacto de investigación: concretamente, son los pesos correspondientes al paso 50 de la ejecución de entrenamiento `macereason-math-1500x2-en-bn-nemotron-1.5b-lr3e-6-no-kl-en`. No se trata, por tanto, de un modelo final pulido ni de un lanzamiento de producto, sino de una instantánea de un experimento de alineación sobre un modelo de razonamiento pequeño.

El modelo hereda la arquitectura del Nemotron-Research-Reasoning-Qwen-1.5B, es decir, un transformer tipo Qwen2 de aproximadamente 1.777 millones de parámetros (1,5B en nomenclatura comercial), orientado a tareas de razonamiento y matemáticas. El nombre del checkpoint revela detalles del experimento: 1.500 ejemplos duplicados (1500x2), idiomas inglés y bengalí (en-bn), tasa de aprendizaje 3e-6, sin término KL (no-kl) y evaluación en el paso 50.

Su relevancia es fundamentalmente metodológica: permite reproducir o inspeccionar una etapa temprana de un pipeline SDPO sobre un modelo de razonamiento compacto. No hay métricas publicadas, licencia declarada ni idiomas oficialmente soportados en la model card, por lo que debe tratarse como material de laboratorio, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (heredada de nvidia/Nemotron-Research-Reasoning-Qwen-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponibles (el nombre del run sugiere entrenamiento en inglés y bengalí) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,6 GB |
| Libreria | transformers |
| Modelo base | nvidia/Nemotron-Research-Reasoning-Qwen-1.5B |
| Paso de entrenamiento | 50 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Nemotron-Research-Reasoning-Qwen-1.5B, un transformer decoder-only de la familia Qwen2 con unos 1,5B parámetros, diseñado por NVIDIA para investigación en razonamiento. Sobre esa base, este checkpoint aplica un ajuste SDPO (una variante de optimización directa con preferencias, según la nomenclatura del autor) durante 50 pasos, con un conjunto de datos de aproximadamente 1.500 ejemplos duplicados (1500x2) en inglés y bengalí, tasa de aprendizaje 3e-6 y sin término de regularización KL respecto al modelo de referencia.

No se dispone de información detallada sobre la composición exacta del dataset, el número total de tokens vistos ni la configuración completa del entrenamiento (tamaño de batch, optimizador, esquema de precisión). Tampoco se documentan innovaciones técnicas adicionales más allá del propio procedimiento SDPO sin KL. Al ser un checkpoint del paso 50, es probable que el entrenamiento continuara más allá de ese punto, pero no hay datos publicados sobre la ejecución completa ni sobre el checkpoint final.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.
- Razonamiento de varios pasos y resolución de problemas matemáticos, dado el origen Nemotron-Research-Reasoning.
- Capacidad potencial de seguir cadenas de razonamiento explícitas (estilo chain-of-thought), aunque no se documenta el formato exacto en la model card.
- Soporte multilingüe limitado: el run sugiere inglés y bengalí, pero no hay confirmación oficial de idiomas soportados.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes: no disponible (no documentado).
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" explícito: no disponible (no documentado en la model card).

## Casos de uso

- Investigación en alineación con preferencias: sirve para estudiar cómo evoluciona un modelo de razonamiento pequeño durante las primeras etapas de un ajuste SDPO sin KL, comparando el paso 50 con el modelo base y con checkpoints posteriores.
- Reproducción de experimentos: al estar identificado el run (`macereason-math-1500x2-en-bn-nemotron-1.5b-lr3e-6-no-kl-en`), permite replicar la configuración de entrenamiento en entornos de investigación con recursos limitados.
- Análisis de olvido catastrófico: útil para medir cuánto se degradan las capacidades originales del modelo base tras 50 pasos de ajuste con preferencias sobre un dataset pequeño.
- Evaluación de sesgos lingüísticos: al haberse entrenado con datos en inglés y bengalí, permite analizar cómo afecta un corpus bilingüe pequeño al comportamiento en cada idioma.
- Pruebas de pipelines de evaluación: como checkpoint ligero (1,5B parámetros), se puede usar para validar infraestructura de evaluación de razonamiento matemático antes de escalar a modelos mayores.
- Docencia y divulgación: adecuado para demostrar en un aula o tutorial el funcionamiento interno de un ajuste DPO/SDPO y la inspección de checkpoints intermedios.
- Generación de texto experimental en inglés o bengalí: con cautela y validación manual, para prototipos de conversación en esos idiomas, dado que no hay garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,5-4 GB solo para pesos, más overhead de activaciones y caché KV (típicamente 5-6 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: en torno a 2 GB para pesos; en 4 bits, alrededor de 1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4). Para cuantización 4 bits, cabe en GPUs de 4-6 GB (GTX 1650 Super, RTX 3050).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6-8 GB o más, especialmente cuantizado.
- Opciones de despliegue: transformers (nativo), text-generation-inference (el repo incluye el tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no publicada en el repo).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,5B, se espera un throughput alto en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XSDPO-Nemotron-1.5B-1500x2-...-step-50 | 1,777B | no disponible | no disponible | Hugging Face (0 descargas) | Checkpoint intermedio de investigación |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1,5B | no disponible | no disponible en esta ficha | Hugging Face (modelo base) | Modelo de razonamiento de NVIDIA |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública) | Hugging Face, ampliamente desplegado | Modelo instructivo generalista |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | 32.768 tokens (según documentación pública) | MIT (según documentación pública) | Hugging Face | Destilado de razonamiento |

La comparativa con Qwen2.5-1.5B-Instruct y DeepSeek-R1-Distill-Qwen-1.5B se basa en datos públicos de sus respectivas model cards; los datos del checkpoint XSDPO no están disponibles para comparar rendimiento.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 50) de un entrenamiento; no representa el estado final del modelo y su calidad puede ser inferior a la del modelo base o a la de un checkpoint posterior.
- No hay licencia declarada: el uso comercial es jurídicamente incierto y requiere contactar con el autor o consultar la licencia del modelo base.
- No se documentan idiomas soportados oficialmente; el nombre del run sugiere inglés y bengalí, pero no hay garantías.
- Dataset de entrenamiento pequeño (aproximadamente 1.500 ejemplos duplicados): riesgo elevado de sobreajuste y de degradación de capacidades generales.
- Sin término KL: el modelo puede haberse desviado significativamente del modelo base, con posible pérdida de coherencia o de instrucciones.
- Riesgo de alucinación inherente a modelos de 1,5B, especialmente en razonamiento matemático y multilingüe.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento.
- Sin cuantizaciones GGUF publicadas: el despliegue en CPU o en GPUs de gama baja requiere conversión manual.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni reportes de uso.
- La model card es extremadamente escueta y no documenta el formato de prompt, las plantillas de chat ni los hiperparámetros de inferencia recomendados.

## Enlaces

- Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-no-kl-en-step-50
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Perfil del autor: https://huggingface.co/ahmedselhady
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos (foros de Winstep Nexus Dock) no guardan relación con este modelo.
