# luisastellet/qwen-metaphor-unke-camada-13-prompt-numerico

## Resumen

El modelo `luisastellet/qwen-metaphor-unke-camada-13-prompt-numerico` es un checkpoint de la familia Qwen3 publicado en Hugging Face por el usuario `luisastellet`. Por su identificador y su estructura de pesos, se trata de un ajuste fino o una intervención sobre una capa intermedia (la "camada 13", es decir, la decimotercera capa del transformer) de un modelo Qwen3 de aproximadamente 596 millones de parámetros. El nombre sugiere un experimento de interpretabilidad o edición de representaciones internas orientado a metáforas y a un "prompt numérico", lo que apunta a trabajo de investigación más que a un modelo listo para producción.

El modelo se distribuye en formato safetensors y es compatible con la librería `transformers` y con text-generation-inference. No obstante, la model card es una plantilla automática sin rellenar: no declara licencia, idiomas, datos de entrenamiento, procedimiento de ajuste ni resultados de evaluación. Toda la información técnica disponible proviene de los metadatos del repositorio y del recuento real de parámetros en los pesos.

Su relevancia es limitada para desarrolladores que buscan un modelo de propósito general, pero puede resultar de interés para investigadores que estudien edición de activaciones, sondas lineales o manipulación de capas concretas en modelos Qwen3 pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tags) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,8 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Descargas | 424 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3, según los tags del repositorio. El recuento real de parámetros en safetensors (596.049.920) sitúa el modelo en el rango de los modelos pequeños de esa familia, coherente con un Qwen3 de ~0,6B. El identificador hace referencia a una "camada 13", lo que sugiere que el checkpoint contiene pesos modificados o extraídos de la decimotercera capa, probablemente en el contexto de un experimento de edición de representaciones o de análisis de activaciones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card no documenta el procedimiento de ajuste, los hiperparámetros ni el régimen de precisión utilizado. Cualquier afirmación sobre el entrenamiento sería especulativa.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3 (tag `text-generation`).
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con text-generation-inference y con endpoints compatibles.
- Capacidad multilingüe: no documentada en la model card; no disponible.
- Tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades especiales (modo thinking, visión, audio): no documentadas; no disponible.
- Comportamiento específico derivado del ajuste "metaphor / prompt numérico": no documentado.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo la decimotercera capa de un Qwen3 pequeño codifica metáforas o representaciones numéricas, comparando activaciones con el modelo base.
- Edición de activaciones y experimentos de steering: usar el checkpoint como material para estudiar intervenciones sobre capas intermedias y su efecto en la generación.
- Reproducción de experimentos académicos: servir como artefacto de referencia para trabajos que manipulan capas concretas en modelos de ~0,6B.
- Prototipado de generación de texto en entornos con recursos limitados: al ser un modelo pequeño, cabe en GPUs de consumo, aunque su calidad no está validada.
- Evaluación comparativa de checkpoints derivados: medir la degradación o el cambio de comportamiento respecto al Qwen3 base en tareas controladas.
- Docencia y formación: ilustrar cómo se publica y se inspecciona un checkpoint de transformers con pesos safetensors y metadatos mínimos.

No se recomienda su uso en producción sin una evaluación previa, dado que no hay benchmarks ni documentación de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,2 GB solo para pesos (596M parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp32: aproximadamente 2,4 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag) y endpoints compatibles. No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| luisastellet/qwen-metaphor-unke-camada-13-prompt-numerico | 596.049.920 | no disponible | no disponible | Hugging Face, safetensors | Checkpoint experimental sin documentar |
| Qwen3 (modelo base de ~0,6B) | ~0,6B | no disponible en esta ficha | depende de la variante Qwen3 | Hugging Face | Modelo base del que deriva; documentación oficial disponible |
| Alternativas de ~0,5B-1B (p. ej. familias tipo Llama o Gemma pequeñas) | ~0,5B-1B | variable | variable | Hugging Face | No se dispone de comparación de rendimiento por falta de benchmarks del modelo evaluado |

No es posible establecer una comparación cuantitativa de rendimiento porque el modelo no publica resultados de evaluación.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Idiomas no declarados: se desconoce si conserva las capacidades multilingües del Qwen3 base.
- Riesgo de alucinación y de comportamiento degradado: al ser un checkpoint derivado de una capa concreta, puede haber pérdida de coherencia respecto al modelo original.
- Sin benchmarks: no hay evidencia de calidad en tareas estándar (MMLU, HumanEval, GSM8K, etc.).
- Sin cuantizaciones oficiales: el despliegue eficiente requiere conversión manual a GGUF u otros formatos.
- Sesgos: no documentados; se heredarían, en su caso, los del modelo base y los del proceso de ajuste, que se desconoce.
- Advertencia de producción: no apto para uso en producción sin evaluación independiente, revisión de licencia y validación de comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-13-prompt-numerico
- Paper citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
