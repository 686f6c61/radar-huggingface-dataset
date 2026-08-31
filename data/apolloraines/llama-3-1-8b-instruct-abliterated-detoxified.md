# ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-Detoxified

## Resumen

El modelo **Llama-3.1-8B-Instruct-Abliterated-Detoxified** es una variante del conocido Llama-3.1-8B-Instruct de Meta, modificada mediante *representation engineering* con la herramienta **jBlaze**, desarrollada por Apollo Raines. En lugar de realizar un ajuste fino tradicional, el autor extrae direcciones representacionales del espacio de pesos mediante análisis de activaciones contrastivas (SVD) y aplica proyecciones ortogonales para suprimir dos comportamientos concretos: la dirección de **refusal** (rechazo a responder) y la dirección de **toxicidad**. El resultado es un modelo que mantiene las capacidades generales del original pero responde sin negarse, al tiempo que evita lenguaje tóxico u ofensivo.

Con 8.030 millones de parámetros y arquitectura LlamaForCausalLM de 32 capas, este modelo se ofrece en formato safetensors en precisión bf16. La licencia es la misma que la del modelo base (Llama 3.1 Community License), lo que permite uso comercial con las condiciones habituales de Meta. Su relevancia radica en ofrecer una alternativa "desinhibida" pero educada para aplicaciones donde la censura estricta del modelo original resulta limitante, sin necesidad de entrenamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (32 capas, transformer decoder-only) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredado del base Llama-3.1-8B-Instruct, que soporta 128k) |
| Tipos de cuantizacion | No disponible (pesos originales en bf16; cuantizaciones externas posibles) |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Llama-3.1-8B-Instruct, un transformer decoder-only con 32 capas, atención multi-cabeza con ventanas deslizantes y normalización RMSNorm. La modificación se realiza mediante **jBlaze**, una herramienta de *representation engineering* que identifica direcciones en el espacio latente asociadas a comportamientos específicos. En este caso, se extraen dos direcciones mediante análisis de activaciones contrastivas (SVD sobre pares de activaciones) y se proyectan los pesos para suprimir la dirección de *refusal* y la de *toxicidad*, ambas con un factor de magnitud m=2.0. No se realiza ningún paso de entrenamiento o fine-tuning; los cambios son puramente geométricos en el espacio de pesos (proyección ortogonal). La intervención se aplica al "brazo A3", que incluye las capas de atención y todas las capas MLP.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base.
- Razonamiento y resolución de problemas matemáticos y lógicos (ej. cálculo aritmético, preguntas factuales).
- Generación de código en múltiples lenguajes, incluyendo funciones Python, explicaciones y depuración.
- Capacidad multilingüe limitada al inglés según la ficha, aunque el modelo base soporta más idiomas; no se garantiza el rendimiento en otros idiomas.
- No se documenta soporte explícito de *tool calling* o *function calling*, aunque el modelo base sí lo incluye; la modificación podría afectar a estas capacidades.
- Comportamiento "sin censura": responde a preguntas que el modelo original rechazaría (por ejemplo, cómo forzar una cerradura), pero mantiene un tono educado y evita lenguaje tóxico.
- Sin modo de razonamiento explícito ni capacidades multimodales (solo texto).

## Casos de uso

- **Asistente de escritura creativa sin restricciones**: el modelo puede generar narrativas, diálogos o contenido con temáticas adultas o controvertidas sin rechazar la petición, útil para autores y guionistas que necesitan explorar escenarios complejos.
- **Chatbots de atención al cliente con tono amable**: al suprimir la toxicidad, el modelo mantiene conversaciones educadas incluso con usuarios frustrados, reduciendo el riesgo de respuestas ofensivas.
- **Generación de código en entornos de desarrollo**: dado que conserva las capacidades de programación del base, puede integrarse en asistentes de código o pipelines de CI/CD para generar documentación, tests o snippets, sin necesidad de filtros adicionales.
- **Herramientas educativas sobre temas sensibles**: por ejemplo, explicar el funcionamiento de cerraduras o mecanismos de seguridad desde una perspectiva técnica, sin el rechazo habitual de los modelos instructivos.
- **Investigación en *alignment* y *representation engineering***: sirve como caso de estudio para comparar el comportamiento de modelos ablacionados frente a los originales en tareas de seguridad y utilidad.
- **Prototipos de agentes conversacionales con personalidad desinhibida**: para demos o aplicaciones de entretenimiento donde se busca un asistente que responda a cualquier pregunta de forma directa, manteniendo cortesía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K u otros, ni comparaciones cuantitativas con el modelo base. Se desconoce si la ablación afecta al rendimiento en tareas estándar, aunque por la naturaleza de la técnica (proyección de pesos) es previsible una degradación mínima, pero no hay datos que lo confirmen.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en bf16 (16.1 GB de repo), se requieren aproximadamente 16-18 GB de VRAM para cargar el modelo completo. Con cuantización a 4 bits (GGUF Q4_K_M) se reduce a unos 5-6 GB.
- **GPU recomendadas**: tarjetas con 24 GB o más (RTX 3090, RTX 4090, A10, A100) para bf16 sin offload; GPUs de 8-12 GB pueden usar cuantización y offload de capas.
- **Compatibilidad con GPU de consumo**: sí, es posible ejecutarlo en una RTX 3060 12 GB con cuantización 4 bits y *offloading* parcial.
- **Opciones de despliegue**: compatible con `transformers` (carga directa con `AutoModelForCausalLM`), así como con vLLM, llama.cpp, Ollama (mediante conversión a GGUF) y TGI. No se proporcionan archivos GGUF en el repositorio, pero pueden generarse.
- **Latencia y throughput**: no se han publicado mediciones. Como referencia, un modelo de 8B en una RTX 4090 con cuantización 4 bits suele generar entre 30 y 60 tokens por segundo, dependiendo de la longitud de contexto y el backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Llama-3.1-8B-Instruct-Abliterated-Detoxified** (este) | 8.0B | No especificado (base 128k) | jBlaze (ablación + supresión de toxicidad) | Llama 3.1 Community | HuggingFace (safetensors) |
| **mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated** | 8.0B | 128k | Abliteration clásica (eliminación de dirección de refusal) | Llama 3.1 Community | HuggingFace (safetensors y GGUF) |
| **Meta-Llama-3.1-8B-Instruct** (original) | 8.0B | 128k | Fine-tuning instructivo estándar | Llama 3.1 Community | HuggingFace |

La principal diferencia frente al abliterado de mlabonne es que este modelo añade una segunda proyección para suprimir la toxicidad, lo que lo hace "educado" además de no censurado. El original mantiene los mecanismos de rechazo. El rendimiento en tareas estándar debería ser similar al del base, aunque no hay benchmarks publicados.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al eliminar el rechazo, el modelo puede generar contenido factualmente incorrecto o inventado con mayor facilidad, ya que no hay un mecanismo de "no sé" tan fuerte.
- **Riesgo de contenido inapropiado**: aunque se suprime la toxicidad, la eliminación del *refusal* puede llevar a respuestas sobre temas delicados (violencia, ilegalidad) que, aunque no sean tóxicas, pueden ser problemáticas según el contexto de uso.
- **Idioma**: solo se certifica el inglés; el rendimiento en otros idiomas puede degradarse notablemente.
- **Licencia**: la Llama 3.1 Community License impone restricciones (por ejemplo, no usar para mejorar otros modelos grandes sin autorización, y requerir atribución). Es necesario revisar los términos antes de un despliegue comercial.
- **Sin garantías de seguridad**: la técnica de proyección de pesos no ha sido validada de forma exhaustiva; pueden existir efectos colaterales en otras capacidades (por ejemplo, en el seguimiento de instrucciones o en la coherencia).
- **Falta de benchmarks**: no hay datos objetivos sobre degradación de rendimiento; en producción, se recomienda evaluar el modelo en las tareas específicas antes de usarlo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Abliterated-Detoxified)
- [Repositorio de jBlaze](https://github.com/apolloraines/jblaze)
- [Modelo base Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- [Artículo sobre abliteration (referencia de la técnica)](https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated)
- [Versión GGUF del abliterado de mlabonne](https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated-GGUF)
