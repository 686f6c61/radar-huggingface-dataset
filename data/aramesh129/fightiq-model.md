# aramesh129/fightiq-model

## Resumen

FightIQ es un modelo de predicción de resultados de combates de UFC desarrollado por Ashvath Ramesh (aramesh129), un desarrollador independiente. El modelo utiliza regresión logística sobre un conjunto de datos de más de 6.500 peleas para calcular probabilidades de victoria basándose en estadísticas clave como precisión de golpeo, defensa y métricas de derribo. Según el autor, alcanza una precisión histórica del 74%.

A diferencia de los modelos de lenguaje de gran escala, FightIQ no es un transformer ni un modelo generativo, sino un clasificador estadístico tradicional serializado con joblib. El repositorio tiene un tamaño de 0,9 GB, lo que sugiere que incluye tanto los artefactos del modelo como posiblemente el dataset de entrenamiento y scripts auxiliares. Su relevancia radica en ser un ejemplo de aplicación de machine learning clásico a un dominio específico y vertical, con una licencia MIT que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (modelo estadistico clasico, no neuronal) |
| Parametros totales | no disponible (modelo lineal, no comparable con LLMs) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa texto secuencial) |
| Tipos de cuantizacion | no aplica (modelo serializado con joblib, no requiere cuantizacion) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | joblib (serializacion de Python/Scikit-learn) |

## Arquitectura y entrenamiento

El modelo se basa en una regresion logistica, una tecnica de aprendizaje supervisado que estima la probabilidad de un resultado binario (victoria o derrota) a partir de un conjunto de variables predictoras. En este caso, las caracteristicas de entrada incluyen estadisticas de rendimiento de los luchadores: precision de golpeo, defensa ante golpes, metricas de derribos (takedowns), y otras variables relevantes del historial de combates.

El entrenamiento se realizo sobre un dataset de 6.500+ peleas de UFC. No se dispone de informacion detallada sobre el preprocesamiento de datos, la seleccion de caracteristicas, la division train/test, ni sobre tecnicas de regularizacion o validacion cruzada empleadas. El autor menciona que esta "constantemente probando mejoras", lo que sugiere un proceso de iteracion activo sobre el modelo base. No se indica el uso de tecnicas como RLHF, DPO o fine-tuning, ya que no es un modelo de lenguaje.

## Capacidades

- Prediccion de probabilidad de victoria para combates de UFC, devolviendo un valor entre 0 y 1.
- Clasificacion binaria (victoria/derrota) basada en estadisticas historicas de los luchadores.
- Analisis estadistico de variables como precision de golpeo, defensa y metricas de derribo.
- Generacion de picks semanales para combates, como se indica en la pagina de Patreon del autor.
- No dispone de capacidades de generacion de texto, codigo, razonamiento, vision, tool calling ni funciones de agente, al ser un modelo estadistico clasico.

## Casos de uso

- Analisis previo a combates de UFC: el modelo puede utilizarse para estimar las probabilidades de victoria de cada luchador antes de un evento, ayudando a aficionados y analistas a contextualizar el enfrentamiento con datos objetivos.
- Investigacion deportiva: periodistas y creadores de contenido pueden emplear las predicciones como base para articulos, videos o podcasts de analisis, anadiendo una perspectiva cuantitativa a la discusion cualitativa.
- Apuestas deportivas informadas: aunque no garantiza resultados, la probabilidad estimada puede servir como una senal adicional para apostadores que buscan identificar valor en las cuotas de las casas de apuestas.
- Desarrollo de APIs de prediccion: el autor ha publicado un espacio llamado fightiq-api, lo que sugiere que el modelo puede envolverse en un servicio REST para integrarse en aplicaciones externas.
- Educacion en machine learning: al ser un modelo simple y con licencia MIT, es util como ejemplo didactico de regresion logistica aplicada a un dominio real con datos tabulares.
- Comparacion de modelos: los datos de 6.500+ peleas pueden servir como dataset de referencia para comparar la regresion logistica con otros algoritmos (random forest, gradient boosting, redes neuronales) en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la informacion disponible. El autor declara una precision historica del 74% en su pagina de Patreon, pero no se especifican las metricas exactas (accuracy, AUC, F1), la metodologia de evaluacion ni el conjunto de validacion utilizado. No se dispone de comparaciones con otros modelos de prediccion de UFC.

## Requisitos de hardware

- Al ser un modelo de regresion logistica, los requisitos de hardware son minimos: puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- El tamaño del repositorio es de 0,9 GB, pero esto incluye probablemente el dataset y scripts, no solo el modelo serializado (que ocuparia unos pocos KB).
- No requiere VRAM, ya que no es un modelo neuronal.
- Puede desplegarse en cualquier servidor Python con scikit-learn y joblib instalados, o envolverse en un contenedor Docker.
- La latencia de inferencia es del orden de microsegundos por prediccion, y el throughput esta limitado unicamente por el framework de servicio HTTP utilizado.
- Para un despliegue en produccion, basta con un servicio ligero (FastAPI, Flask) que cargue el modelo y exponga un endpoint de prediccion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el mismo dominio (prediccion de resultados de UFC) con los que contrastar directamente. Los modelos de lenguaje de gran escala como GPT-4 o Llama 3 no son comparables, ya que resuelven tareas completamente diferentes. Un analisis comparativo requeriria evaluar FightIQ frente a otros clasificadores entrenados sobre el mismo dataset, lo cual no esta documentado.

## Limitaciones y advertencias

- La precision declarada del 74% es una afirmacion del autor sin validacion externa ni publicacion de metodologia detallada; debe tomarse con cautela.
- La regresion logistica asume una relacion lineal entre las caracteristicas y la probabilidad de victoria, lo que puede no capturar interacciones complejas entre variables.
- El modelo se entrena con datos historicos; si el deporte evoluciona (cambios de reglas, nuevos estilos de lucha), las predicciones pueden degradarse con el tiempo.
- No se especifica como se manejan los datos faltantes o los luchadores sin historial previo, lo que limita su aplicabilidad en combates con debutantes.
- El modelo no tiene en cuenta factores contextuales como lesiones, peso, estado de forma o cambios de entrenador, que pueden influir en el resultado real.
- Aunque la licencia MIT permite uso comercial, el modelo no ofrece garantias de exactitud ni soporte tecnico; su uso en apuestas conlleva riesgo financiero.
- El repositorio tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que es un proyecto personal sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramesh129/fightiq-model
- Perfil del autor en Hugging Face: https://huggingface.co/aramesh129
- Perfil del autor en GitHub: https://github.com/aramesh129
- Repositorio relacionado (FightIQ_V14): https://github.com/gogs1998/FightIQ_V14
- Pagina de Patreon del autor: https://www.patreon.com/posts/welcome-to-fight-130135580
