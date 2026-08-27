# Magnexis/lexiconerror-router-large

## Resumen

LexiconError Router Large es un modelo de clasificación de texto desarrollado por Magnexis para el enrutamiento de diagnósticos de errores de programación. A partir de un mensaje de error, un stack trace o un fragmento de código cercano, predice tres atributos: el lenguaje de programación implicado, la categoría del diagnóstico y su severidad. No genera correcciones ni ejecuta código, sino que actúa como un componente de clasificación previo dentro de un sistema más amplio de asistencia al desarrollador.

El modelo pertenece a una familia de tres variantes (Small, Medium y Large) diferenciadas por su presupuesto de características. La variante Large, descrita aquí, cuenta con 21.878.059 parámetros lineales aprendidos y 225.546 características ajustadas sobre un vocabulario de palabras y caracteres. Está implementado con scikit-learn y utiliza un vectorizador TF-IDF junto con clasificadores lineales independientes para cada cabeza de salida. Su diseño es deliberadamente ligero y orientado a CPU, lo que lo hace adecuado para entornos de desarrollo locales o integraciones en herramientas de editor sin necesidad de aceleración por GPU.

La relevancia de este modelo radica en su enfoque especializado: en lugar de depender de un gran modelo de lenguaje generalista, ofrece una solución compacta y rápida para una tarea concreta de diagnóstico, con métricas de precisión muy altas en la clasificación de lenguaje y categoría. Su licencia es `other`, por lo que es necesario revisar los términos del dataset asociado antes de su redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador lineal sobre características TF-IDF (scikit-learn) |
| Parametros totales | 21.878.059 (parámetros lineales aprendidos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de clasificación, no generativo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (clasifica lenguajes de programación, no idiomas naturales) |
| Licencia | other |
| Formato de pesos | joblib/pickle (artefacto serializado con joblib) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada explícitamente, pero por la descripción de la model card y el uso de scikit-learn se infiere un pipeline compuesto por un vectorizador TF-IDF que transforma el texto de entrada en una representación numérica de palabras y caracteres, seguido de tres clasificadores lineales independientes, uno para cada cabeza de salida: lenguaje, categoría y severidad. Cada clasificador produce una probabilidad sobre sus etiquetas correspondientes.

El entrenamiento se realizó sobre el dataset `Magnexis/lexiconerror-diagnostics`, que contiene 16.474 registros estructurados. Se aplicó una división determinista 80/20 agrupada por lenguaje, de modo que los registros de evaluación no comparten lenguaje con los de entrenamiento. Las etiquetas singleton o no vistas se mantienen en el split de entrenamiento. Los registros marcados como `Verified` reciben un peso de muestra de 1,5x, mientras que los `Needs Review` no se consideran aprobados editorialmente. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es supervisado de forma clásica. El runtime utilizado fue scikit-learn 1.9.0 con Python 3.13.14 y semilla aleatoria 42.

## Capacidades

- Clasificación de mensajes de error, stack traces y fragmentos de código en tres dimensiones: lenguaje de programación, categoría de diagnóstico y severidad.
- Soporte para múltiples lenguajes de programación, aunque la lista exacta no se especifica en la documentación.
- Predicción de categorías de diagnóstico (por ejemplo, errores de compilación, excepciones en tiempo de ejecución, fallos de memoria, etc.).
- Estimación de severidad (probablemente niveles como bajo, medio, alto, crítico, aunque no se detallan).
- Funciona como componente de enrutamiento para un sistema más amplio llamado LexiconError, que probablemente ofrece explicaciones y remediaciones.
- No genera texto, no ejecuta código, no soporta tool calling ni razonamiento multi-paso; es un clasificador puro.

## Casos de uso

- Enrutamiento de tickets de soporte técnico: un sistema de ticketing puede usar el modelo para clasificar automáticamente los informes de error entrantes por lenguaje y categoría, asignándolos al equipo de soporte adecuado o priorizándolos según la severidad predicha.
- Integración en editores de código: un plugin de IDE puede invocar el modelo al detectar un error de compilación o una excepción, mostrando al desarrollador la categoría y severidad estimadas antes de sugerir documentación relevante.
- Clasificación de logs en pipelines de CI/CD: durante la integración continua, los logs de fallos pueden procesarse con el modelo para identificar rápidamente si el error es de compilación, de ejecución o de infraestructura, facilitando la automatización de respuestas.
- Filtrado y priorización de issues en repositorios: al recibir nuevos issues con stack traces, el modelo puede etiquetarlos automáticamente con lenguaje y categoría, ayudando a los mantenedores a triagear más rápido.
- Análisis de telemetría de errores en producción: las plataformas de monitorización pueden usar el modelo para clasificar excepciones en tiempo real y agruparlas por severidad, permitiendo alertas tempranas sobre fallos críticos.
- Asistente de diagnóstico en documentación interactiva: un chatbot de documentación puede usar el modelo para enrutar la consulta del usuario hacia la sección de la guía que trata el tipo de error detectado, mejorando la precisión de las respuestas.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas de evaluación sobre un split de 3.285 registros (el split de entrenamiento contiene 13.189 registros):

| Cabeza | Accuracy | Macro F1 | Weighted F1 | Top-3 accuracy |
| --- | ---: | ---: | ---: | ---: |
| Language | 0.998 | 0.935 | 0.998 | 0.999 |
| Category | 0.966 | 0.837 | 0.965 | 0.999 |
| Severity | 0.988 | 0.792 | 0.988 | 1.000 |

Estos resultados indican una precisión muy alta en la clasificación de lenguaje y categoría, con una macro F1 más baja en severidad, lo que sugiere un desequilibrio de clases o dificultad en etiquetas poco frecuentes. No se proporcionan comparaciones con otros modelos en la documentación.

## Requisitos de hardware

- El modelo es extremadamente ligero: el repositorio ocupa 0.1 GB y está diseñado para ejecutarse en CPU.
- No requiere GPU; puede ejecutarse en cualquier máquina con Python y scikit-learn instalados.
- La memoria RAM necesaria es modesta, probablemente inferior a 1 GB para la carga del modelo y la vectorización de textos.
- Se puede desplegar como un servicio local o integrarse en aplicaciones existentes mediante la carga del artefacto joblib.
- No se han publicado datos de latencia o throughput, pero al ser un clasificador lineal sobre TF-IDF, la inferencia es del orden de milisegundos por texto en CPU moderna.
- Opciones de despliegue: uso directo en scripts Python, integración en frameworks web (Flask, FastAPI) o en herramientas de línea de comandos. No es compatible con vLLM, llama.cpp u otros motores de inferencia de LLMs, ya que no es un modelo generativo.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada. La familia LexiconError Router (Small, Medium, Large) es la única referencia conocida, pero no se ofrecen métricas comparativas entre sus variantes. Por tanto, la comparativa con alternativas externas no está disponible.

## Limitaciones y advertencias

- Las plantillas derivadas de registros y las familias de diagnóstico repetidas pueden hacer que las puntuaciones en datos de evaluación sean optimistas; el rendimiento en datos reales podría ser inferior.
- Las etiquetas raras pueden tener poco soporte en la evaluación, lo que dificulta conclusiones fiables por clase.
- Los valores de confianza devueltos por los clasificadores son probabilidades, no garantías de que el diagnóstico sea correcto.
- El modelo está diseñado para enrutar una consulta dentro de LexiconError, no para reemplazar la documentación oficial de compiladores o runtimes, ni la revisión de seguridad, ni el proceso de depuración humano.
- La licencia es `other`; los términos de uso y redistribución dependen del dataset `Magnexis/lexiconerror-diagnostics`, cuyo aviso legal debe revisarse antes de cualquier redistribución.
- El artefacto se carga mediante joblib/pickle, lo que puede ejecutar código arbitrario; solo debe cargarse desde fuentes oficiales y verificando el checksum SHA-256.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Magnexis/lexiconerror-router-large
- Dataset de entrenamiento: https://huggingface.co/datasets/Magnexis/lexiconerror-diagnostics
- Variante Small: https://huggingface.co/Magnexis/lexiconerror-router-small
- Variante Medium: https://huggingface.co/Magnexis/lexiconerror-router-medium
