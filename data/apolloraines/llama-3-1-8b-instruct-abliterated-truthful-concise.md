# ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-Truthful-Concise

## Resumen

Llama-3.1-8B-Instruct-Abliterated-Truthful-Concise es una variante del modelo Llama-3.1-8B-Instruct de Meta, modificada mediante técnicas de ingeniería de representación (representation engineering) en lugar de fine-tuning. El autor, ApolloRaines, utiliza su herramienta jBlaze para extraer direcciones representacionales mediante análisis de activaciones contrastivas (SVD sobre pares de activaciones) y las proyecta en el espacio de pesos del modelo. El resultado es un modelo que suprime la dirección de rechazo (refusal), amplifica la dirección de veracidad (truthful) y reduce la verbosidad, sin añadir datos de entrenamiento ni cambiar los pesos de forma convencional.

Esta variante se enmarca en la corriente de modelos "abliterados" que buscan eliminar el sesgo de rechazo de los modelos instructivos de Meta, manteniendo sus capacidades generales. Es relevante para desarrolladores e investigadores que necesitan un modelo conversacional en inglés con respuestas directas y sin negativas, aunque con las advertencias propias de la eliminación de salvaguardas. El modelo conserva la arquitectura original de 8.000 millones de parámetros y la ventana de contexto de 128K tokens del base. La licencia es la misma que la del modelo base (Llama 3.1 Community License).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder, 32 capas) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Llama-3.1-8B-Instruct y se modifica mediante el método jBlaze de ApolloRaines. Este método consiste en realizar análisis de activaciones contrastivas: se generan pares de prompts que elicitan comportamientos opuestos (por ejemplo, respuestas con y sin rechazo, o respuestas veraces frente a falsas) y se aplica SVD sobre las activaciones de las capas de atención y MLP para extraer direcciones representacionales. Despues se proyectan esas direcciones en el espacio de pesos mediante proyecciones ortogonales. En este caso se aplicaron tres direcciones: suppression de refusal con magnitud 2.0, amplificación de truthful con magnitud -0.5 y suppression de verbosity con magnitud 2.0. No se realizó ningún paso de fine-tuning ni entrenamiento adicional, por lo que las capacidades base del modelo se conservan en su mayoría, aunque las modificaciones pueden afectar sutilezas de comportamiento.

El modelo base Llama-3.1-8B-Instruct fue entrenado con 15 billones de tokens en un dataset multilingue (aunque el modelo final se centra en inglés) e incluye un pipeline de instrucciones con RLHF. La variante abliterada no incorpora ningún dato nuevo de entrenamiento.

## Capacidades

- Generación de texto en inglés: respuestas fluidas y coherentes en formato conversacional.
- Razonamiento y comprensión: mantiene las capacidades de razonamiento del modelo base, incluyendo aritmética y lógica básica.
- Generación de código: es capaz de escribir funciones en Python y otros lenguajes, como se muestra en los ejemplos del autor.
- Respuestas directas: la dirección de verbosity suprimida reduce la redundancia y el relleno en las respuestas.
- Sin rechazo: el modelo no se niega a responder sobre temas controvertidos o peligrosos, lo que lo hace inadecuado para uso sin supervisión en entornos sensibles.
- Sin capacidades multimodales: no soporta visión ni audio, solo texto.
- No soporta tool calling ni function calling de forma nativa, ya que el modelo base no incluye esta funcionalidad de manera explícita (aunque puede emularse mediante prompts).

## Casos de uso

- Atención al cliente automatizada en inglés: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 128K tokens) y responder de forma concisa, reduciendo costes de tiempo de inferencia. Su falta de rechazo puede ser útil para resolver quejas o preguntas incómodas sin escalar a un humano, pero requiere filtros de seguridad adicionales.
- Generación de código en producción: puede utilizarse como asistente de programación para generar snippets, explicar algoritmos o refactorizar código. Su habilidad para seguir instrucciones y su formato de respuesta directo lo hacen adecuado para integrarse en IDEs o pipelines de CI/CD mediante APIs de inferencia.
- Análisis de texto y extracción de información: al no tener rechazo, puede procesar documentos con contenido delicado (legales, médicos) sin negarse a extraer datos, aunque hay que validar la veracidad de las respuestas.
- Creación de contenido técnico: redacción de documentación, tutoriales y explicaciones técnicas en inglés, con respuestas concisas y sin divagaciones.
- Simulación de conversaciones para entrenamiento de otros modelos: su comportamiento sin rechazo permite generar datasets de diálogos con temas variados, útiles para fine-tuning de modelos con restricciones de seguridad.
- Investigación en interpretabilidad y alineación: sirve como caso de estudio para analizar cómo la modificación de direcciones representacionales afecta al comportamiento del modelo, comparándolo con el base y otras variantes abliteradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros. El autor no proporciona comparaciones cuantitativas con el modelo base. Dado que la modificación es puramente representacional, se espera que el rendimiento en tareas estándar sea similar al de Llama-3.1-8B-Instruct, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 16 GB (8.03B parámetros × 2 bytes). Con cuantización de 8 bits (~8 GB) o 4 bits (~4 GB) podría ejecutarse en GPUs de consumo, pero no se proporcionan archivos cuantizados en el repo.
- GPU recomendadas: para ejecución en bf16 completa se necesita una GPU con al menos 16-20 GB de VRAM (ej. NVIDIA A100 40GB, RTX 4090 24GB, L4). Con cuantización 4-bit (generada por el usuario) podría caber en una RTX 3060 12GB o similar.
- Opciones de despliegue: al ser un modelo estándar de transformers, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (si se crea un Modelfile). El repo solo ofrece safetensors, por lo que para GGUF habría que convertir con herramientas como llama.cpp.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificación de 20-50 ms/token con vLLM y batch, y un throughput de varios cientos de tokens/segundo en configuraciones optimizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8.03B | 128K | Instruct con RLHF | Llama 3.1 | HuggingFace, Ollama, etc. |
| ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-Truthful-Concise | 8.03B | 128K | Representation engineering (jBlaze) | Llama 3.1 | Solo HuggingFace |
| mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated | 8.03B | 128K | Abliteration (refusal direction) | Llama 3.1 | HuggingFace, Ollama |

La principal diferencia entre las variantes abliteradas es el método: mlabonne usa abliteration clásica (eliminación de la dirección de rechazo) mientras que ApolloRaines usa proyecciones ortogonales sobre múltiples direcciones (rechazo, veracidad y verbosidad). Esto puede dar lugar a comportamientos ligeramente distintos en cuanto a concisión y precisión, aunque no hay benchmarks que lo demuestren. El modelo de mlabonne está más extendido y tiene más documentación y soporte en la comunidad.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del modelo base Llama-3.1-8B-Instruct, que pueden incluir estereotipos de género, raza o cultura. La modificación de veracidad puede no eliminar estos sesgos, solo cambiar la forma de expresarlos.
- Riesgo de alucinación: al amplificar la dirección "truthful", el modelo puede mostrarse más seguro en sus respuestas, lo que aumenta el riesgo de alucinaciones presentadas con confianza. No hay validación externa de los hechos.
- Limitaciones de idioma: solo soporta inglés de forma fiable. El modelo base es multilingue, pero la modificación se ha aplicado sobre direcciones en inglés, por lo que en otros idiomas el comportamiento puede ser impredecible.
- Restricciones de licencia: la licencia Llama 3.1 Community License permite uso comercial, pero exige que los usuarios con más de 700 millones de usuarios mensuales soliciten una licencia adicional a Meta. Además, al ser una modificación del modelo original, se deben cumplir las mismas condiciones de atribución.
- Eliminación de salvaguardas: el modelo no tiene mecanismo de rechazo, por lo que puede generar contenido peligroso, ilegal o dañino si se le solicita. No es apto para despliegues sin moderación adicional ni filtros de contenido.
- Sin garantías de calidad: al ser un experimento de ingeniería de representación sin evaluación formal, no hay evidencia de que las modificaciones mejoren realmente la veracidad o la concisión en todos los casos. La nota "sycophantic_agreement" en los Known Issues sugiere que puede mostrar tendencia a estar de acuerdo con el usuario, lo que puede afectar a la fiabilidad.
- Reproducibilidad: el repo no incluye el código exacto de extracción de direcciones ni los datasets utilizados, por lo que es difícil reproducir el proceso o auditar los cambios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-Truthful-Concise
- Herramienta jBlaze: https://github.com/apolloraines/jblaze
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio oficial de Llama 3: https://github.com/meta-llama/llama3
- Artículo de abliteration (referencia): https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated
- Variante abliterada en Ollama: https://ollama.com/richardyoung/llama-3.1-8b-instruct-abliterated
