# reaperdoesntknow/DualMind-TKD-Agentic-1.7B

## Resumen

DualMind TKD Agentic 1.7B es un modelo de lenguaje derivado de Qwen/Qwen3-1.7B, desarrollado por reaperdoesntknow (Convergent Intelligence LLC / Reaper). Se construye en dos etapas: primero una destilación de conocimiento matemático guiada por topología desde Qwen/Qwen3-8B, y después una especialización agéntica y de function calling mediante LoRA fusionado. El objetivo es transferir comportamiento de razonamiento matemático a un modelo pequeño y añadir capacidades de llamada a herramientas sin perder el conocimiento previo.

El modelo resuelve el problema de combinar razonamiento matemático con uso estructurado de herramientas en un tamaño de 1.720.574.976 parámetros (1,7B), lo que lo hace desplegable en hardware modesto. Su relevancia actual radica en que explora técnicas de destilación con señales estructurales (discrepancia de distribuciones del profesor, topología de transiciones, diagnósticos de energía de gap) sobre un transformer decoder-only de Qwen3, y en que publica el pipeline completo de dos etapas con replay matemático para mitigar el olvido catastrófico.

La arquitectura es la de Qwen3-1.7B, un transformer decoder-only con atención estándar. El contexto no está especificado en la información disponible. Los idiomas declarados se limitan al inglés. La licencia figura como "other" por incertidumbre sobre los términos del dataset de cálculo avanzado, aunque el modelo base y el dataset de function calling son Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parámetros totales | 1.720.574.976 (1,7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo safetensors publicados) |
| Idiomas soportados | Inglés (en) |
| Licencia | other (modelo base Apache-2.0; dataset de cálculo sin licencia clara) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only. El entrenamiento se divide en dos etapas. La primera es una destilación de conocimiento guiada por topología: el estudiante es Qwen3-1.7B, el profesor es Qwen/Qwen3-8B y el dataset es 0xZee/dataset-CoT-Advanced-Calculus-268. Se realiza fine-tuning de todo el modelo con un objetivo de entropía cruzada supervisada más destilación del profesor con top-k disperso y cola. Las señales estructurales incluyen discrepancia de distribuciones del profesor, topología de transiciones, diagnósticos de energía de gap y supervisión ponderada por fases Explore/Examine/Response, con presión adicional sobre derivación, verificación y transiciones de razonamiento de alta discrepancia.

La segunda etapa es una especialización agéntica sobre NousResearch/hermes-function-calling-v1, mediante LoRA seguido de fusión de pesos. La supervisión se limita a salidas del asistente y llamadas a herramientas; los esquemas de herramientas, mensajes de usuario y resultados de herramientas se ven como contexto pero se excluyen de la pérdida directa. Se mezcla replay matemático para reducir el olvido catastrófico. Los archivos del repositorio contienen el modelo fusionado standalone, sin necesidad de un adaptador PEFT separado para inferencia.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento matemático y técnico, con énfasis en cálculo avanzado y cadenas de razonamiento (CoT).
- Generación de llamadas a herramientas (function calling) en formato estructurado.
- Selección de herramientas y experimentación con bucles agénticos.
- Razonamiento multi-paso dentro de un runtime que gestione la ejecución de herramientas.
- Capacidad de continuar entrenamiento supervisado o con optimización de preferencias.
- No ejecuta herramientas por sí mismo: requiere un runtime externo que parsee la llamada, ejecute la herramienta, añada el resultado y reinvoque el modelo.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de cálculo y derivación paso a paso gracias a la destilación desde Qwen3-8B, adecuado para herramientas educativas o de verificación simbólica donde se necesite un modelo pequeño.
- Agentes de function calling: genera llamadas estructuradas a APIs y herramientas, integrándose en un runtime que ejecute las llamadas y devuelva resultados, útil para prototipos de asistentes con acceso a herramientas.
- Investigación en destilación topológica: sirve como referencia reproducible del pipeline de dos etapas para estudiar transferencia de razonamiento y olvido catastrófico en modelos pequeños.
- Experimentación con bucles agénticos: su especialización en tool-use lo hace útil para probar selección de herramientas y razonamiento multi-paso en entornos controlados.
- Base para fine-tuning posterior: al ser un modelo fusionado de 1,7B, puede servir como punto de partida para SFT o DPO específicos de dominio con requisitos de hardware modestos.
- Prototipado de asistentes técnicos en inglés: para tareas de explicación de derivaciones y verificación de pasos matemáticos donde no se requiera despliegue multilingüe.
- Evaluación de retención tras especialización: útil para medir cuánto conocimiento matemático se conserva tras la etapa agéntica con replay.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclaman resultados formales de benchmark en esta release y que solo se realizaron monitorización de pérdida en held-out y pruebas cualitativas de generación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 1,7B en fp16 se estiman aproximadamente 3,5 GB de pesos, y en cuantizaciones de 8 bits o 4 bits cabría en GPUs consumer de 6-8 GB, aunque no se publican cuantizaciones en el repositorio.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en RTX 3060/4060 y superiores en fp16; A100/H100 no son necesarias.
- Cabe en GPU consumer: sí, por el tamaño de 1,7B, aunque las cuantizaciones no están publicadas.
- Opciones de despliegue: transformers (carga indicada en la model card con `AutoModelForCausalLM` y `device_map="auto"`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se confirman otras opciones como llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DualMind TKD Agentic 1.7B | 1,7B | No disponible | Matemáticas + function calling (destilación topológica) | other | Hugging Face |
| Qwen/Qwen3-1.7B | 1,7B | No disponible en la información | Modelo base generalista | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-8B | 8B | No disponible en la información | Modelo generalista mayor (profesor en la destilación) | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El dataset de matemáticas de origen es pequeño, lo que limita la cobertura del razonamiento transferido.
- Las trazas de razonamiento sintéticas o generadas pueden contener derivaciones incorrectas o respuestas finales contradictorias.
- El formato correcto de llamada a herramienta no garantiza una selección correcta de la herramienta.
- Las salidas de herramientas externas deben tratarse como entrada no confiable.
- El replay matemático reduce el olvido pero no demuestra retención.
- El modelo no está establecido como seguro para acciones autónomas de alto impacto, médicas, financieras o legales.
- Solo soporta inglés según la información disponible.
- Licencia "other": el dataset de cálculo avanzado no exponía una declaración clara de licencia; debe confirmarse antes de asignar una licencia más permisiva o de uso comercial.
- No se han ejecutado benchmarks externos de matemáticas, function calling, retención o seguridad antes de su uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/DualMind-TKD-Agentic-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor de destilación: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de cálculo: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
