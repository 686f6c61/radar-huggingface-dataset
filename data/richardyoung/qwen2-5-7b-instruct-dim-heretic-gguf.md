# richardyoung/Qwen2.5-7B-Instruct-DiM-heretic-GGUF

## Resumen

Qwen2.5-7B-Instruct-DiM-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen2.5-7B-Instruct-DiM-heretic, un derivado del Qwen2.5-7B-Instruct de Alibaba sometido a un proceso de "abliteration" (eliminación de mecanismos de rechazo) mediante la técnica heretic. El resultado es un modelo de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) que mantiene la arquitectura transformer densa del Qwen2.5 original pero con las capas de alineación de seguridad parcialmente neutralizadas.

El modelo está pensado para investigación sobre comportamiento de modelos y evaluación de técnicas de desalineación, no para uso en producción sin supervisión. La cuantización GGUF lo hace desplegable en llama.cpp y Ollama, lo que permite ejecutarlo en hardware de consumo. La relevancia actual radica en que permite estudiar de forma reproducible cómo el proceso de abliteration afecta a las capacidades del modelo base y a su tasa de rechazo.

El repositorio tiene acceso restringido (gated) y requiere aceptar condiciones en Hugging Face. La licencia declarada es Apache 2.0, heredada del Qwen2.5 original, aunque la modificación de los pesos introduce consideraciones adicionales de uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen2.5-7B-Instruct base soporta 32.768 tokens nativos, ampliables a 131.072; no confirmado para este derivado) |
| Tipos de cuantizacion | GGUF (multiples niveles de cuantizacion; el repo pesa 32,3 GB, lo que sugiere varias variantes) |
| Idiomas soportados | en (segun la model card; el base soporta multiples idiomas, no confirmado tras la modificacion) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base no cuantizado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención de consultas agrupadas (GQA), activación SwiGLU y normalización RMSNorm. El modelo base fue entrenado por Alibaba con un corpus multilingüe de gran escala (del orden de billones de tokens, aunque la cifra exacta no se detalla en la información disponible) y posteriormente alineado mediante instrucción y preferencias (SFT y optimización directa de preferencias, DPO, en la familia Qwen2.5).

La modificación heretic aplica una técnica de abliteration que identifica la dirección de rechazo en el espacio de activaciones y la proyecta fuera de los pesos, reduciendo la probabilidad de respuestas negativas ante peticiones que el modelo original rechazaría. El tag "imatrix" indica que las cuantizaciones GGUF se generaron usando una matriz de importancia (importance matrix) calculada con un corpus de calibración, lo que mejora la fidelidad de las cuantizaciones de baja precisión respecto a una cuantización naive. No se dispone de detalles sobre el dataset de calibración ni sobre el volumen de datos usado en el proceso de abliteration.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Qwen2.5-7B-Instruct.
- Razonamiento y resolución de problemas de complejidad media.
- Generación y explicación de código en múltiples lenguajes de programación.
- Matemáticas básicas e intermedias.
- Reducción significativa de la tasa de rechazo ante peticiones que el modelo base declinaría (objetivo principal de la modificación).
- Soporte de plantillas de chat conversacionales en llama.cpp y Ollama.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades multilingües del base no garantizadas tras la modificación; la model card declara únicamente inglés.
- No se documenta soporte de tool calling, function calling ni modo thinking en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar de forma reproducible cómo la abliteration altera la distribución de respuestas y la tasa de rechazo, comparándolo con el Qwen2.5-7B-Instruct original en el mismo hardware.
- Evaluación de técnicas de cuantización: al incluir variantes GGUF generadas con importance matrix, sirve para medir la degradación de capacidades entre niveles de cuantización sobre un modelo ya modificado.
- Pruebas de robustez de filtros de contenido: desplegar el modelo detrás de un clasificador de entrada/salida permite evaluar la eficacia de capas de seguridad externas cuando el modelo interno carece de rechazo.
- Desarrollo de pipelines de generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que el modelo base podría declinar por contenido sensible, con revisión humana posterior.
- Benchmarking de inferencia local: con 7,6 mil millones de parámetros en GGUF, es un banco de pruebas realista para medir throughput y latencia de llama.cpp u Ollama en GPUs de consumo.
- Experimentos de destilación y fine-tuning: al estar liberado en Apache 2.0 y con pesos abiertos, puede servir como punto de partida para ajustes posteriores en dominios especializados.
- Docencia sobre mecánica de la alineación: ilustra de forma tangible qué es una dirección de rechazo y cómo se manipula en el espacio de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB en cuantización Q4_K_M, 6-7 GB en Q5/Q6, y 8-9 GB en Q8_0 (estimaciones por tamaño de parámetros, no confirmadas en la model card).
- El repositorio completo ocupa 32,3 GB, lo que indica la presencia de múltiples niveles de cuantización, incluidos los de alta precisión.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas o contexto largo; A100/H100 solo si se busca throughput elevado o servir a múltiples usuarios.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más usando Q4_K_M o inferior.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con endpoints; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-DiM-heretic-GGUF | 7,6 B | no disponible | Abliteration (heretic) + GGUF imatrix | apache-2.0 | Gated en HF |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 (ampliable a 131.072) | Ninguna (alineado) | apache-2.0 | Abierto en HF |
| Qwen/Qwen2.5-7B-Instruct-GGUF | 7,6 B | 32.768 | Ninguna, cuantizado oficial | apache-2.0 | Abierto en HF |
| Meta Llama 3.1 8B Instruct | 8,0 B | 131.072 | Ninguna (alineado) | Llama 3.1 Community License | Abierto con registro |

La diferencia principal frente al Qwen2.5-7B-Instruct oficial es la eliminación del comportamiento de rechazo y la disponibilidad en GGUF con importance matrix; el resto de especificaciones técnicas se hereda del base. Frente a Llama 3.1 8B, el contexto nativo es menor y la licencia es más permisiva (Apache 2.0 frente a licencia comunitaria con restricciones).

## Limitaciones y advertencias

- La abliteration no elimina todos los sesgos del modelo base; los sesgos de género, raza, religión y origen del Qwen2.5 original persisten y pueden aflorar con mayor frecuencia al no haber rechazo.
- Riesgo elevado de generar contenido dañino, ilegal o sexualmente explícito sin filtro interno; requiere capas de moderación externas en cualquier despliegue.
- Riesgo de alucinación equivalente o superior al del base, ya que la modificación de pesos puede degradar ligeramente la coherencia factual.
- La model card declara únicamente inglés; el rendimiento multilingüe del base no está garantizado tras la modificación.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterado conlleva responsabilidad legal y reputacional; conviene revisar las políticas de la plataforma de despliegue.
- No se documentan resultados de benchmarks ni evaluaciones de seguridad del derivado, por lo que no es posible cuantificar la degradación respecto al base.
- El contexto máximo efectivo de las cuantizaciones GGUF puede ser inferior al del modelo original según la configuración de llama.cpp y la VRAM disponible.
- El tag arxiv:2611.17846 hace referencia a un identificador que no corresponde a un paper verificable en la información proporcionada; no se debe citar como fuente sin comprobación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-DiM-heretic-GGUF
- Modelo base (no cuantizado): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-DiM-heretic
- Qwen2.5-7B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Referencia de la técnica heretic: no disponible en la información proporcionada.
