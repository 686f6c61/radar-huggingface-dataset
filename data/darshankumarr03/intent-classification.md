# Darshankumarr03/intent-classification

## Resumen

El modelo `Darshankumarr03/intent-classification` es un clasificador de intenciones en cascada de dos etapas, diseñado para entornos de producción donde se requiere una respuesta rápida y fiable ante consultas de usuarios. Desarrollado por Darshankumarr03, este sistema combina un primer nivel basado en características TF-IDF con un clasificador lineal calibrado (LinearSVC) para predicciones de alta confianza, y un segundo nivel semántico que utiliza SetFit con el modelo de embeddings `all-MiniLM-L6-v2` como respaldo para frases complejas o ambiguas. El proyecto incluye una interfaz web Gradio y scripts de línea de comandos para entrenamiento e inferencia, lo que facilita su integración en flujos de trabajo reales.

A diferencia de los grandes modelos de lenguaje generativos, este clasificador es un pipeline clásico de aprendizaje automático, ligero y rápido, orientado a tareas específicas de clasificación de intenciones. Su relevancia radica en que ofrece una solución práctica y de bajo coste computacional para sistemas de diálogo, atención al cliente automatizada y asistentes virtuales, sin depender de infraestructura de GPU potente. El repositorio tiene un tamaño de 0,3 GB e incluye el código fuente, scripts de entrenamiento y la aplicación web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline en cascada: TF-IDF + LinearSVC (etapa 1) y SetFit con `all-MiniLM-L6-v2` (etapa 2) |
| Parametros totales | no disponible (el modelo no es una red neuronal monolítica; los componentes son modelos clásicos y un transformer pequeño) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del tokenizador de `all-MiniLM-L6-v2`, típicamente 256 tokens) |
| Tipos de cuantizacion | no disponible (no se menciona cuantización; los artefactos se guardan en formato joblib según los tags) |
| Idiomas soportados | no disponible (la model card no especifica idiomas; probablemente inglés por defecto, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | joblib (según los tags del repositorio) |

## Arquitectura y entrenamiento

El sistema implementa una arquitectura en cascada de dos etapas. La primera etapa utiliza características TF-IDF sobre el texto de entrada y un clasificador LinearSVC calibrado (probablemente mediante Platt scaling o similar) para producir predicciones con una puntuación de confianza. Si la confianza supera un umbral predefinido, la predicción se acepta directamente. En caso contrario, la consulta se deriva a la segunda etapa, que emplea SetFit, un marco de ajuste fino eficiente basado en contrastive learning, con el modelo de embeddings `all-MiniLM-L6-v2` como backbone. Esta etapa captura el significado semántico y maneja frases complejas o parafraseadas que el modelo TF-IDF no reconoce bien.

El entrenamiento se realiza mediante el script `scripts/train.py`, que toma datasets CSV con las columnas `Training Phrase`, `Intent Name` y `Approved Response`. No se especifican detalles sobre el volumen de datos, el número de épocas, ni si se aplicaron técnicas como regularización o validación cruzada. El sistema está diseñado para ser reentrenable con datos propios, lo que permite adaptarlo a dominios específicos. No se menciona el uso de RLHF, DPO u otras técnicas de alineación propias de los LLM, ya que se trata de un clasificador supervisado clásico.

## Capacidades

- Clasificación de intenciones en texto corto, identificando la intención del usuario a partir de frases o preguntas.
- Mapeo directo de intenciones detectadas a respuestas predefinidas y aprobadas, garantizando consistencia en el comportamiento del sistema.
- Manejo de consultas ambiguas o complejas mediante la etapa semántica de SetFit, que captura similitud de significado más allá de las palabras exactas.
- Inferencia rápida en la primera etapa para consultas de alta confianza, reduciendo la latencia en escenarios de alto volumen.
- Interfaz web Gradio para pruebas interactivas y demostración.
- Scripts de línea de comandos para entrenamiento personalizado y predicción, facilitando la integración en pipelines.
- Capacidad de reentrenamiento con datos propios, lo que permite adaptar el clasificador a dominios específicos (por ejemplo, soporte técnico, banca, salud).

## Casos de uso

- Atención al cliente automatizada: el clasificador puede gestionar consultas frecuentes como "¿cuál es mi saldo?" o "¿cómo restablezco mi contraseña?" y devolver respuestas estandarizadas, reduciendo la carga del personal humano. La etapa de cascada asegura que las consultas ambiguas se resuelvan con el modelo semántico.
- Asistentes virtuales en sitios web: integración en chatbots para dirigir al usuario al departamento o flujo correcto según su intención (compra, devolución, soporte técnico, etc.), con respuestas aprobadas que evitan errores de contenido.
- Enrutamiento de tickets en sistemas de soporte: clasificar automáticamente los tickets entrantes por categoría (facturación, bug, feature request) y asignarlos al equipo correspondiente, mejorando los tiempos de respuesta.
- Moderación de contenido en foros o redes sociales: detectar intenciones como spam, abuso o consultas legítimas para aplicar políticas de moderación de forma automática.
- Pruebas de concepto en investigación: servir como baseline para comparar con clasificadores basados en LLM, evaluando trade-offs entre latencia, coste y precisión en tareas de intent classification.
- Automatización de respuestas en encuestas o formularios: interpretar respuestas abiertas de usuarios y clasificarlas en categorías predefinidas para su posterior análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros modelos. Tampoco se proporcionan datos sobre latencia o throughput en los resultados de búsqueda web.

## Requisitos de hardware

- Al ser un pipeline basado en TF-IDF y un transformer pequeño (`all-MiniLM-L6-v2`), la inferencia puede ejecutarse en CPU sin necesidad de GPU.
- La VRAM estimada es mínima; el modelo SetFit con `all-MiniLM-L6-v2` requiere aproximadamente 0,5 GB de RAM en inferencia, y el clasificador TF-IDF es aún más ligero.
- Cualquier ordenador moderno con 4 GB de RAM puede ejecutar el sistema sin problemas.
- Para entrenamiento con datasets grandes, se recomienda al menos 8 GB de RAM, aunque no se especifican requisitos exactos.
- Opciones de despliegue: el proyecto incluye una aplicación Gradio que se ejecuta localmente; también se puede integrar como módulo Python en servicios web (Flask, FastAPI) o en pipelines de datos.
- No se requieren GPUs específicas; el modelo es adecuado para entornos con recursos limitados o despliegues en edge.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de clasificación de intenciones. Existen alternativas como `Falconsai/intent_classification` en Hugging Face, pero no se conocen sus especificaciones ni rendimiento. Se recomienda evaluar este modelo frente a soluciones basadas en LLM (por ejemplo, GPT-4 o Llama 3 con prompting) para tareas de intent classification, considerando que el enfoque clásico aquí presentado ofrece menor latencia y coste, pero posiblemente menor capacidad de generalización a intenciones no vistas.

## Limitaciones y advertencias

- El modelo depende completamente de los datos de entrenamiento proporcionados; si el dataset es pequeño o sesgado, la precisión se verá afectada.
- La etapa TF-IDF no captura significado semántico, por lo que frases con vocabulario diferente pero misma intención pueden fallar en la primera etapa y depender del fallback de SetFit.
- No se especifica el idioma de entrenamiento; si los datos están en inglés, el rendimiento en otros idiomas será deficiente.
- La licencia no está definida, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- No hay garantías de robustez ante entradas adversariales o ruido extremo en el texto.
- El mapeo a respuestas aprobadas es estático; si las respuestas necesitan actualizarse, hay que reentrenar o modificar los artefactos.
- Al ser un clasificador clásico, no genera texto ni mantiene contexto conversacional; solo clasifica la intención de una consulta aislada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Darshankumarr03/intent-classification
- Space de demostración (Gradio): https://huggingface.co/spaces/Darshankumarr03/app_test
- Blog relacionado sobre clasificadores de intenciones con IA generativa (referencia externa): https://www.dipjyoti.dev/blog/2025-06-29-intent-classifier/
