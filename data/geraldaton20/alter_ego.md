# geraldaton20/alter_ego

## Resumen

Alter_Ego es un sistema de aprendizaje continuo en tiempo real diseñado como un ecosistema unificado que combina dos modelos pequeños y una memoria compartida. El sistema lo desarrolla Gerald Aton (geraldaton20) y aborda un problema fundamental de los modelos que aprenden en línea: la imposibilidad de distinguir entre experiencias válidas y errores confiados. La propuesta consiste en un modelo estudiante de aproximadamente 50 millones de parámetros, que actúa como una pizarra en blanco, y un juez independiente llamado alter ego, basado en Needle 2 (45 millones de parámetros), que valida cada interacción antes de que esta se convierta en conocimiento permanente.

La relevancia de Alter_Ego radica en su enfoque arquitectónico: no introduce una nueva arquitectura neuronal, sino que combina técnicas existentes —modelos pequeños, adaptadores LoRA, LLM-as-judge y memorias aumentadas— en un bucle de aprendizaje en línea con latencia por debajo del segundo. El sistema emplea un mecanismo de puntuación de confianza en cinco ejes (estructura, consistencia, verificabilidad, novedad y seguridad) que decide si una experiencia se consolida, se pone en cola para revalidación o se descarta. Esta validación externa evita el sesgo de confirmación y el refuerzo de alucinaciones, problemas críticos en el aprendizaje autónomo.

El modelo se sirve sobre una arquitectura de tiempo compartido en una sola GPU, con un objetivo de uso de aproximadamente 930 MB de VRAM y 6,4 GB de RAM del sistema, lo que lo hace viable en hardware de consumo. La documentación incluye un plan de diseño detallado y un pipeline de entrenamiento que se ejecuta en Kaggle T4x2 con auto-reanudación tras interrupciones. El repositorio contiene el código de entrenamiento, el orquestador local y un prototipo de referencia del estudiante en Python, junto con el sistema de servido en Rust.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema dual: estudiante (≈50M, Simple Attention Network, base congelada + LoRA rank-16) + juez Needle 2 (≈45M, validado) |
| Parametros totales | ≈95M (50M estudiante + 45M juez) |
| Parametros activos | no disponible |
| Longitud de contexto | no especificado (los inputs largos se reducen a un digest ROOT de 256 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no especificado (embedder de ingesta: jina-embeddings-v2-small-en, orientado a inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoints privados en Hugging Face Hub) |

## Arquitectura y entrenamiento

Alter_Ego no es un modelo único sino un sistema compuesto por dos modelos y una memoria compartida, ejecutados de forma entrelazada en una sola GPU. El estudiante es una red de atención simple de aproximadamente 50 millones de parámetros, con una base congelada y un adaptador LoRA de rango 16 como único estado mutable. El juez, llamado Alter ego, es un modelo Needle 2 de 45 millones de parámetros que nunca se actualiza con la experiencia del estudiante, sino que actúa como un evaluador independiente. La comunicación entre ambos se realiza a través de un sistema de memoria triple: memoria episódica (diario crudo), memoria semántica (grafo de hechos validados), registro de habilidades y un búfer de repetición para prevenir el olvido.

El entrenamiento del pipeline se ejecuta en Kaggle con dos GPU T4 y está diseñado para sobrevivir interrupciones: auto-checkpoint a Hugging Face cada 10 minutos, heartbeat cada 5 minutos y reanudación automática del último checkpoint por parte del orquestador local. No se proporcionan detalles sobre el número de tokens de entrenamiento ni la composición del dataset de entrenamiento del juez. El sistema usa una técnica de búsqueda de haz guiada: la puntuación de confianza del alter ego sirve como señal de poda en tiempo de inferencia, sin necesidad de un mecanismo adicional. Los inputs largos se digieren mediante un embedder (jina-embeddings-v2-small-en) que los trocea y extrae experiencias estructuradas, reduciéndolas a un resumen de 256 tokens antes de que lleguen al estudiante.

## Capacidades

- Aprendizaje en línea en tiempo real: el sistema actualiza el adaptador LoRA del estudiante en cada interacción, con una latencia de validación de ~0,5 segundos en segundo plano y una latencia percibida por el usuario de ~1 segundo.
- Validación independiente de experiencias: el alter ego puntúa cada interacción en cinco ejes (estructura, consistencia, verificabilidad, novedad, seguridad) y decide si se consolida (COMMIT), se pone en cola (QUEUE) o se rechaza (REJECT).
- Memoria triple: episódica, semántica y de habilidades, más un búfer de repetición para evitar el olvido catastrófico.
- Digestión de inputs largos: los textos extensos se trocean y reducen a un resumen de 256 tokens antes de la inferencia.
- Búsqueda de haz guiada por confianza: la puntuación del juez se usa como señal de poda durante la decodificación.
- Bajo consumo: objetivo de ~930 MB de VRAM (clase 4 GB) y ~6,4 GB de RAM del sistema, apto para hardware de consumo.
- Ejecución concurrente en Rust: el sistema de servicio en Rust con tokio y pyo3 coordina la generación, la validación y las micro-actualizaciones de LoRA de forma concurrente.

## Casos de uso

- **Asistente personal que aprende de cada interacción**: el sistema puede adaptarse al estilo de comunicación y preferencias del usuario en tiempo real, sin necesidad de reentrenamiento offline. La puerta de validación independiente evita que el asistente adopte malos hábitos o refuerce errores propios.
- **Sistema de atención al cliente con memoria persistente**: gracias a la memoria semántica y episódica, el modelo puede recordar interacciones anteriores con el mismo usuario, mantener contexto a través de múltiples turnos y aprender de cada resolución sin olvidar las anteriores. El juez filtra las respuestas incorrectas antes de que se consoliden.
- **Herramienta de investigación para el estudio del aprendizaje continuo**: como plataforma de investigación, permite estudiar cómo un modelo pequeño aprende en línea con un validador externo. Puede usarse para experimentos sobre calibración de confianza, robustez frente a datos adversos o diseño de memorias.
- **Prototipo de agente autónomo en entornos controlados**: en entornos simulados (p. ej., un juego o un entorno de navegación web), el sistema puede aprender políticas a partir de experiencias reales, mientras el juez asegura que solo se consolidan las acciones correctas, evitando el colapso de comportamiento.
- **Sistema de aprendizaje en el borde para dispositivos con recursos limitados**: con un objetivo de VRAM de ~930 MB, el sistema puede ejecutarse en GPUs de consumo (clase 4 GB) y en configuraciones de RAM moderadas, lo que permite desplegarlo en estaciones de trabajo sin servidores dedicados.
- **Experimento de memoria a largo plazo en chatbots**: el sistema puede usarse para probar cómo un modelo con memoria triple y búfer de repetición mantiene coherencia a lo largo de conversaciones prolongadas, sin olvidar información antigua ni contaminarse con errores recientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de evaluación estándar como MMLU, HumanEval, GSM8K ni comparativas con otros modelos. La única métrica de rendimiento mencionada es la latencia: la respuesta del estudiante se genera en ~1,0 segundos, la validación del alter ego tarda ~0,5 segundos en segundo plano, y la latencia total percibida por el usuario es de ~1,5 segundos (incluyendo el tiempo de generación y la entrega). No hay datos de throughput en tokens por segundo ni de precisión en tareas específicas.

## Requisitos de hardware

- **VRAM**: objetivo de ~930 MB, por lo que cabe en GPUs de consumo de 4 GB como la GTX 1650, RTX 3050, RTX 3060, etc.
- **RAM del sistema**: ~6,4 GB estimados.
- **GPUs recomendadas**: el pipeline de entrenamiento se ejecutó en Kaggle T4x2 (2x NVIDIA T4, 16 GB cada una). Para inferencia, cualquier GPU con al menos 4 GB VRAM debería ser suficiente.
- **Opciones de despliegue**: el sistema de servir está implementado en Rust con tokio y pyo3, lo que sugiere una arquitectura de servidor personalizada. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo único sino un sistema dual con memoria.
- **Latencia**: ~1,0 s para la generación de respuesta, ~0,5 s para la validación en segundo plano, ~1,5 s de latencia de extremo a extremo.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos. Alter_Ego no es un modelo de lenguaje autónomo, sino un sistema de aprendizaje con dos modelos y una memoria compartida. No existen métricas de rendimiento estándar publicadas, por lo que no es posible establecer comparaciones cuantitativas con alternativas de la misma categoría (modelos pequeños de ~50M de parámetros, sistemas de memoria aumentada o agentes con aprendizaje en línea). Se recomienda tratar este sistema como un proyecto de investigación experimental más que como un modelo de producción.

## Limitaciones y advertencias

- **Sistema en fase de investigación**: no hay evidencia pública de pruebas rigurosas de robustez, seguridad o rendimiento en tareas estándar. No se han publicado benchmarks.
- **Riesgo de sesgos**: el juez (Needle 2) fue entrenado con un proceso no documentado en la información disponible. Si el juez tiene sesgos, estos se propagarán a lo que el estudiante aprende.
- **Alucinación y validación**: aunque la puerta de validación reduce el riesgo de refuerzo de errores, no lo elimina por completo. El sistema podría aceptar experiencias incorrectas si el juez tiene un fallo de calibración.
- **Idioma**: el embedder usado es jina-embeddings-v2-small-en, orientado a inglés; no se especifica soporte multilingüe. Es probable que el sistema esté limitado al inglés.
- **Licencia**: no se especifica ninguna licencia en la información disponible. Esto implica que no se puede garantizar el uso comercial ni la redistribución sin autorización del autor.
- **Formato de pesos**: no se publican los pesos en el repositorio público de Hugging Face; los checkpoints son privados, lo que dificulta la reproducibilidad.
- **Contexto**: no se especifica la longitud máxima de contexto; los inputs largos se digieren a un resumen de 256 tokens, lo que puede perder información detallada.
- **Producción**: el sistema está diseñado para ejecutarse en hardware de consumo, pero su arquitectura de doble modelo y la validación en segundo plano requieren un orquestador robusto. No se recomienda su uso en producción sin una evaluación exhaustiva.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/geraldaton20/alter_ego
- Perfil del autor en Hugging Face: https://huggingface.co/geraldaton20
- Tecnología AlterEgo (MIT Media Lab): https://www.media.mit.edu/projects/alterego/overview/ (no relacionado con este modelo, solo el nombre coincide)
- Proyecto AlterEgo en GitHub (Danganronpa): https://github.com/Megamer-studios/AlterEgo (no relacionado con este modelo)
- Página de AlterEgo AI (fotografía): https://alter-ego-ai.com/ (no relacionado con este modelo)
- Sitio web AlterEgo (dispositivo MIT): https://www.alterego.io/ (no relacionado con este modelo)
