# Magnexis/lexiconerror-router

## Resumen

LexiconError Router es un modelo de clasificación de texto desarrollado por Magnexis, diseñado para enrutar diagnósticos de errores de programación. Dado un mensaje de error, un stack trace, un diagnóstico de compilador o un fragmento de código cercano, predice tres atributos: el lenguaje de programación probable, la categoría del diagnóstico y la severidad. No genera correcciones ni ejecuta código, sino que actúa como un clasificador de metadatos para sistemas de soporte y herramientas de desarrollo.

El modelo está entrenado sobre el dataset Magnexis/lexiconerror-diagnostics, que contiene 16.474 registros estructurados de diagnósticos. Utiliza un pipeline clásico de scikit-learn con vectorización TF-IDF y tres clasificadores independientes (uno por cabeza de salida). Es extremadamente ligero (0,1 GB) y está pensado para ejecutarse en CPU, lo que lo hace adecuado para integración en entornos de desarrollo, CI/CD o herramientas de escritorio sin necesidad de GPU.

Su relevancia actual radica en la creciente necesidad de automatizar el triaje de errores en proyectos de software, especialmente en entornos con múltiples lenguajes y herramientas. Al ser un modelo pequeño y de bajo coste, puede desplegarse localmente sin depender de APIs externas, lo que lo hace atractivo para equipos que priorizan la privacidad y la latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn con vectorizador TF-IDF y clasificadores por cabeza (tipo exacto no especificado) |
| Parametros totales | No disponible (modelo clasico, no red neuronal) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable (clasificacion de texto corto, sin ventana de contexto) |
| Tipos de cuantizacion | No aplicable (modelo clasico, no se cuantiza) |
| Idiomas soportados | No disponibles (la model card no especifica idiomas) |
| Licencia | other (revisar NOTICE del dataset antes de redistribuir) |
| Formato de pesos | joblib (archivo .joblib, compatible con pickle) |

## Arquitectura y entrenamiento

LexiconError Router no es un transformer ni un modelo de lenguaje, sino un pipeline clásico de aprendizaje automático. La arquitectura consiste en un vectorizador TF-IDF que convierte el texto de entrada en una representación numérica, seguido de tres clasificadores independientes (uno para lenguaje, uno para categoría y uno para severidad). Cada clasificador se entrena por separado sobre las mismas características TF-IDF. El tipo exacto de clasificador (regresión logística, SVM, etc.) no se especifica en la documentación disponible.

El entrenamiento se realizó sobre el dataset Magnexis/lexiconerror-diagnostics, que contiene 16.474 registros estructurados. Se utilizó un split determinista 80/20 agrupado por lenguaje, manteniendo las etiquetas singulares o no vistas en el conjunto de entrenamiento. Los campos de entrada excluyen explícitamente lenguaje, categoría, severidad, herramienta y fuente para evitar fuga de metadatos. Los registros marcados como "Verified" reciben un peso de muestreo de 1,5x, mientras que los "Needs Review" no se consideran aprobados editorialmente. El runtime fue scikit-learn 1.9.0 con Python 3.13.14, y se usó una semilla aleatoria de 42.

## Capacidades

- Clasificación de mensajes de error en tres dimensiones: lenguaje de programación, categoría de diagnóstico y severidad.
- Procesamiento de entradas heterogéneas: mensajes de compilador (p. ej., "error[E0382]: borrow of moved value"), excepciones de runtime (p. ej., "Traceback: KeyError") y errores de hardware/GPU (p. ej., "CUDA error: illegal memory access").
- Enrutamiento de consultas hacia el sistema LexiconError, actuando como un clasificador de metadatos para triaje automático.
- Inferencia en CPU con baja latencia, adecuada para integración en herramientas de línea de comandos o servicios locales.
- No genera texto, no ejecuta código, no soporta tool calling ni razonamiento multi-paso. Es exclusivamente un clasificador.

## Casos de uso

- Triaje automático de tickets de soporte: un sistema de helpdesk puede recibir un mensaje de error pegado por un usuario y usar LexiconError Router para identificar el lenguaje, la categoría y la severidad, enrutando el ticket al equipo adecuado sin intervención humana.
- Integración en pipelines de CI/CD: al fallar una compilación, el modelo puede clasificar el error y etiquetarlo automáticamente en el log, facilitando la agregación de errores frecuentes y la priorización de correcciones.
- Análisis de logs en producción: un servicio de monitorización puede procesar líneas de error de múltiples servicios y clasificarlas por lenguaje y severidad para generar alertas contextuales.
- Herramienta de desarrollo local: un plugin de editor de código puede usar el modelo para mostrar al desarrollador la categoría probable de un error antes de consultar la documentación oficial.
- Clasificación de errores en repositorios de código abierto: los mantenedores pueden etiquetar issues automáticamente según el lenguaje y la severidad, mejorando la organización del proyecto.
- Filtrado de ruido en sistemas de observabilidad: al clasificar la severidad, se pueden descartar errores de baja prioridad y escalar solo los críticos, reduciendo la carga del equipo de operaciones.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre un conjunto de evaluación de 3.285 registros (split 80/20):

| Cabeza | Accuracy | Macro F1 | Weighted F1 | Top-3 accuracy |
| --- | ---: | ---: | ---: | ---: |
| Language | 0.998 | 0.935 | 0.998 | 0.999 |
| Category | 0.969 | 0.842 | 0.969 | 0.999 |
| Severity | 0.988 | 0.792 | 0.987 | 1.000 |

No se han publicado comparaciones con otros modelos en la información disponible. Los resultados son internos y pueden ser optimistas debido a plantillas derivadas de registros y familias de diagnóstico repetidas, como advierte el propio autor.

## Requisitos de hardware

- Inferencia en CPU: el modelo es extremadamente ligero (0,1 GB) y no requiere GPU. Cualquier procesador moderno puede ejecutarlo con latencia de milisegundos.
- Memoria RAM: menos de 500 MB para cargar el pipeline completo (vectorizador + clasificadores).
- GPU: no necesaria. No se beneficia de aceleración por hardware.
- Despliegue: se carga mediante joblib.load() en Python. No hay soporte nativo para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia: no se proporcionan mediciones oficiales, pero al ser un pipeline TF-IDF con clasificadores lineales, la inferencia es prácticamente instantánea incluso en hardware modesto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación de errores de programación con enfoque clásico). La búsqueda web no arrojó alternativas directas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo puede estar sesgado hacia los lenguajes y patrones más representados en el dataset de entrenamiento. Las etiquetas raras pueden tener poco soporte en evaluación, lo que dificulta conclusiones fiables por clase.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero las predicciones de categoría y severidad pueden ser incorrectas. La confianza del clasificador no garantiza la corrección del diagnóstico.
- Limitaciones de contexto: al ser un clasificador TF-IDF, no maneja dependencias de largo alcance ni contexto semántico profundo. Entradas muy largas o con formato inusual pueden degradar el rendimiento.
- Restricciones de licencia: la licencia es "other". El autor advierte que los términos de los datos upstream varían y que se debe revisar el NOTICE del dataset antes de cualquier redistribución.
- Advertencia de seguridad: el archivo joblib/pickle puede ejecutar código arbitrario al cargarse. Solo debe cargarse desde el repositorio oficial de Magnexis o tras verificar SHA256SUMS.txt.
- Uso previsto: el modelo debe usarse para enrutar consultas hacia LexiconError, no como sustituto de la documentación oficial de compiladores, revisión de seguridad o depuración humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Magnexis/lexiconerror-router
- Dataset de entrenamiento: https://huggingface.co/datasets/Magnexis/lexiconerror-diagnostics
- Repositorio GitHub relacionado (no oficial): https://github.com/theworker02/lexicon-error
- Documentación del dataset en GitHub: https://github.com/theworker02/lexicon-error/blob/main/README.md
