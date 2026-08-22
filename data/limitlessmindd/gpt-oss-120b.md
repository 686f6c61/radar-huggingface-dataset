# LimitlessMindd/gpt-oss-120b

## Resumen

gpt-oss-120b es un modelo de lenguaje de código abierto desarrollado por OpenAI, publicado bajo licencia Apache 2.0. Se trata de un modelo de arquitectura mixta de expertos (MoE) con 117 mil millones de parámetros totales, de los cuales solo 5.1 mil millones se activan por token, lo que permite un rendimiento de inferencia eficiente. Está diseñado para tareas de razonamiento complejo, uso agéntico y generación de texto general, e incluye capacidades nativas de function calling, ejecución de código Python y navegación web. Su característica más destacada es la cuantización MXFP4 aplicada a los pesos del MoE, que permite ejecutar el modelo completo en una única GPU de 80 GB, como la NVIDIA H100 o la AMD MI300X.

El modelo fue entrenado utilizando el formato de respuesta Harmony de OpenAI, un protocolo que estructura las respuestas del modelo en secciones de razonamiento y respuesta final. Esta arquitectura de razonamiento encadenado (chain-of-thought) es completamente visible para el desarrollador, lo que facilita la depuración y la confianza en las salidas. Además, el nivel de esfuerzo de razonamiento es configurable (bajo, medio, alto), lo que permite ajustar el equilibrio entre latencia y calidad según el caso de uso. El modelo está disponible en Hugging Face, tanto en el repositorio oficial de OpenAI como en mirrors como `LimitlessMindd/gpt-oss-120b`, y es compatible con los principales frameworks de inferencia como Transformers, vLLM y Ollama.

La relevancia de gpt-oss-120b radica en que es uno de los primeros modelos de razonamiento de gran escala con pesos abiertos y licencia permisiva, lo que lo convierte en una opción atractiva para producción comercial, investigación y despliegue en infraestructura propia. Su combinación de tamaño reducido en parámetros activos, cuantización eficiente y capacidades agénticas lo posiciona como una alternativa competitiva a modelos cerrados de pago, con la ventaja de ser totalmente personalizable mediante fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atención densa, decodificación autorregresiva |
| Parametros totales | 116.829.156.672 (~117 B) |
| Parametros activos | 5.1 B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (post-entrenamiento), 8-bit (según tags del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponible en GGUF para Ollama) |

## Arquitectura y entrenamiento

gpt-oss-120b emplea una arquitectura de mezcla de expertos (MoE) donde cada token activa únicamente 5.1 mil millones de parámetros de un total de 117 mil millones. Esta selección dinámica de expertos permite un coste computacional por token muy inferior al de un modelo denso de tamaño equivalente, manteniendo una alta capacidad de representación. El modelo utiliza atención de múltiples cabezas estándar y capas de transformador apiladas, con una estructura de MoE en las capas de feed-forward. No se han proporcionado detalles sobre el número de expertos ni la estrategia de enrutamiento.

El entrenamiento se realizó en dos fases principales. Primero, un preentrenamiento sobre un corpus de texto masivo (el número exacto de tokens no se ha publicado) que cubre múltiples dominios, seguido de un post-entrenamiento con el formato de respuesta Harmony, desarrollado por OpenAI. Este formato estructura las respuestas en dos partes: una sección de razonamiento interno (chain-of-thought) y una respuesta final concisa. El modelo fue además post-entrenado con cuantización MXFP4 aplicada a los pesos del MoE, una técnica que reduce la huella de memoria sin sacrificar significativamente la calidad, como demuestran las evaluaciones realizadas con la misma cuantización. No se menciona el uso de RLHF o DPO en la información disponible, aunque el formato Harmony sugiere un entrenamiento supervisado con datos de razonamiento.

Una innovación destacable es la capacidad de ajustar el esfuerzo de razonamiento (low, medium, high) mediante un token de control, lo que permite al desarrollador elegir entre respuestas rápidas y económicas o razonamientos más profundos y costosos. Además, el modelo expone su cadena de razonamiento completa, lo que facilita la depuración y la verificación de los pasos lógicos, aunque no debe mostrarse al usuario final por razones de seguridad y UX.

## Capacidades

- Razonamiento encadenado (chain-of-thought) completo y visible: el modelo genera una secuencia de pensamiento interna antes de la respuesta final, lo que mejora la precisión en tareas de lógica, matemáticas y análisis.
- Esfuerzo de razonamiento configurable: permite seleccionar entre niveles bajo, medio y alto para equilibrar latencia y calidad según la tarea.
- Function calling nativo: puede invocar funciones externas con argumentos estructurados, facilitando la integración en agentes y herramientas.
- Ejecución de código Python: puede generar y ejecutar código Python en entornos controlados, útil para tareas de cálculo, análisis de datos y automatización.
- Navegación web: capacidad de realizar búsquedas y extraer información de páginas web cuando se integra con herramientas de navegación.
- Salidas estructuradas (Structured Outputs): genera JSON válido y otros formatos estructurados siguiendo esquemas definidos por el usuario.
- Soporte multilingüe: aunque no se han especificado los idiomas, al ser un modelo de propósito general entrenado con datos multilingües, se espera cobertura de los principales idiomas del mundo.
- Fine-tuning: el modelo es totalmente personalizable mediante ajuste de parámetros para adaptarlo a dominios específicos.

## Casos de uso

- Atención al cliente automatizada: con su capacidad de razonamiento y function calling, puede gestionar conversaciones multi-turno complejas, consultar bases de conocimiento externas y ejecutar acciones como crear tickets o actualizar pedidos. Su ventana de contexto (aunque no especificada) es suficiente para mantener el historial de la conversación.
- Agentes autónomos de análisis de datos: el modelo puede recibir una pregunta en lenguaje natural, generar código Python para consultar una base de datos o procesar un CSV, ejecutarlo y devolver una respuesta razonada con los resultados. Esto lo hace adecuado para dashboards de BI y asistentes de investigación.
- Generación de código en producción: gracias a su capacidad de razonamiento y ejecución de código, puede generar fragmentos de código correctos y explicar su lógica, integrándose en pipelines de CI/CD para revisión de código o generación de tests.
- Asistentes de documentación técnica: puede resumir largos documentos técnicos, extraer especificaciones y generar manuales de usuario, aprovechando su razonamiento para mantener coherencia y precisión.
- Herramientas de búsqueda y síntesis de información: combinado con navegación web, puede realizar búsquedas complejas, contrastar fuentes y producir informes estructurados, útil para periodistas, analistas de mercado o investigadores.
- Simulación de escenarios y planificación: el modelo puede razonar sobre secuencias de acciones, evaluar consecuencias y proponer planes óptimos, aplicable en logística, gestión de proyectos o juegos de estrategia.
- Tutoría y educación personalizada: con su capacidad de explicar conceptos paso a paso y adaptar el nivel de detalle según el esfuerzo de razonamiento configurado, puede servir como tutor interactivo en plataformas de e-learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de OpenAI menciona que el modelo supera a otros modelos abiertos de tamaño similar en tareas de razonamiento, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) en los materiales revisados. Se recomienda consultar la documentación oficial de OpenAI para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo con cuantización MXFP4 cabe en una GPU de 80 GB (NVIDIA H100, AMD MI300X). Para cuantizaciones de 8 bits, se requiere al menos 120 GB de VRAM (por ejemplo, dos GPUs A100 de 80 GB). No se dispone de datos para cuantizaciones inferiores.
- GPU recomendadas: NVIDIA H100, A100 80GB, AMD MI300X para despliegue completo. En hardware de consumo, se puede ejecutar mediante Ollama con cuantización GGUF, aunque la calidad puede degradarse; el modelo de 20B (gpt-oss-20b) es más adecuado para GPUs de 16 GB.
- Opciones de despliegue: Transformers (con pipeline de Hugging Face), vLLM (con soporte específico para gpt-oss), Ollama (para hardware de consumo), LM Studio, y el servidor OpenAI-compatible de Transformers Serve.
- Latencia y throughput: no se han publicado cifras oficiales. Con vLLM y una GPU H100, se espera un throughput de decenas de tokens por segundo, pero depende del esfuerzo de razonamiento configurado y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-120b | 117 B | 5.1 B | no disponible | Apache 2.0 | Hugging Face, vLLM, Ollama |
| gpt-oss-20b | 21 B | 3.6 B | no disponible | Apache 2.0 | Hugging Face, vLLM, Ollama |
| Llama 3.1 70B | 70 B | 70 B (denso) | 128 K | Llama 3.1 (permisiva) | Hugging Face, vLLM, Ollama |
| Mixtral 8x7B | 46.7 B | 12.9 B | 32 K | Apache 2.0 | Hugging Face, vLLM, Ollama |

No se dispone de datos de benchmarks comparativos en la información proporcionada. gpt-oss-120b se posiciona como un modelo MoE de gran tamaño con licencia permisiva, similar a Mixtral en arquitectura, pero con capacidades de razonamiento y agénticas más avanzadas. La comparativa con Llama 3.1 70B (denso) muestra una diferencia en parámetros activos que favorece la eficiencia de gpt-oss-120b, aunque el contexto de Llama 3.1 es explícitamente de 128 K.

## Limitaciones y advertencias

- El modelo debe usarse exclusivamente con el formato de respuesta Harmony; si se utiliza `model.generate` directamente sin aplicar la plantilla de chat, los resultados serán incorrectos.
- La cadena de razonamiento (chain-of-thought) generada por el modelo no debe mostrarse a los usuarios finales, ya que puede contener información sensible o pasos intermedios no pulidos. OpenAI recomienda ocultarla y solo presentar la respuesta final.
- No se han publicado datos sobre sesgos o comportamientos adversos específicos. Como todo modelo de lenguaje, puede alucinar hechos, especialmente en dominios poco representados en sus datos de entrenamiento.
- La longitud de contexto no se ha especificado en la información disponible; se recomienda verificar la documentación oficial antes de desplegar aplicaciones que requieran ventanas largas.
- La licencia Apache 2.0 permite uso comercial sin restricciones de copyleft, pero es necesario cumplir con la política de uso de OpenAI (gpt-oss usage policy) que puede imponer limitaciones adicionales.
- El modelo requiere una GPU de alta gama (80 GB) para un despliegue óptimo con cuantización MXFP4; en hardware de consumo se degrada la calidad o se necesita cuantización adicional.
- La cuantización MXFP4 puede introducir pequeñas pérdidas de precisión en comparación con pesos en FP16, aunque las evaluaciones de OpenAI indican que el impacto es mínimo.

## Enlaces

- Repositorio Hugging Face (mirror): https://huggingface.co/LimitlessMindd/gpt-oss-120b
- Repositorio oficial en Hugging Face: https://huggingface.co/openai/gpt-oss-120b
- Página oficial de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Model card oficial: https://openai.com/index/gpt-oss-model-card/
- Documentación de API: https://developers.openai.com/api/docs/models/gpt-oss-120b
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Guías y cookbook: https://cookbook.openai.com/topic/gpt-oss
- Artículo arXiv: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
