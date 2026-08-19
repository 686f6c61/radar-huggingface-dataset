# rki123/PhishAegis-Models

## Resumen

PhishAegis-Models es un repositorio publicado en Hugging Face por el usuario rki123 que contiene un conjunto de modelos orientados a la detección de phishing. Aunque la model card apenas incluye la licencia MIT, los metadatos del repositorio (tags `keras` y `joblib`, tamaño de 2.2 GB) sugieren que se trata de artefactos de machine learning clásico, probablemente combinando redes neuronales entrenadas con Keras y modelos tradicionales serializados con Joblib (por ejemplo, scikit-learn). El nombre del proyecto, PhishAegis, aparece en otras fuentes web como un sistema de análisis de correos electrónicos y URLs para identificar intentos de suplantación, aunque no se puede confirmar que este repositorio sea exactamente el mismo sistema.

La relevancia actual de este tipo de modelos es alta, dado el incremento de ataques de phishing dirigidos y la necesidad de herramientas de detección en tiempo real. Sin embargo, la información técnica disponible en el repositorio es extremadamente limitada: no se especifican parámetros, arquitectura, datos de entrenamiento ni resultados de evaluación. Por tanto, esta ficha se basa únicamente en los metadatos públicos y en las referencias externas al nombre PhishAegis, sin poder verificar las capacidades reales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere ML clásico con Keras y Joblib) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de ML tradicional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Keras (HDF5) y Joblib (Pickle) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna de los modelos contenidos en este repositorio. Los tags `keras` y `joblib` indican que se trata de modelos entrenados con librerías de machine learning convencionales, no con arquitecturas transformer. Es probable que se utilicen características extraídas de texto (como TF-IDF, embeddings o features de URLs) junto con clasificadores como regresión logística, random forest o redes neuronales densas. Tampoco se dispone de datos sobre el conjunto de entrenamiento, el número de tokens o ejemplos, ni sobre técnicas de ajuste como RLHF o DPO. La ausencia de una model card detallada impide conocer cualquier innovación técnica específica.

## Capacidades

- Detección de phishing: por el nombre del proyecto, se infiere que el modelo está diseñado para clasificar URLs, correos electrónicos o mensajes como legítimos o maliciosos.
- Análisis de texto: probablemente procesa contenido textual para extraer señales de engaño (urgencia, enlaces sospechosos, remitentes anómalos).
- Integración en pipelines: al ser modelos serializados con Joblib y Keras, pueden integrarse fácilmente en aplicaciones Python existentes.
- No se han documentado capacidades de generación de texto, razonamiento, tool calling, agentes, visión o audio.

## Casos de uso

- Filtrado de correo electrónico: el modelo puede integrarse en un servidor de correo para marcar mensajes sospechosos antes de que lleguen al usuario, reduciendo el riesgo de clics en enlaces maliciosos.
- Análisis de URLs en tiempo real: una extensión de navegador o API puede enviar URLs a este modelo para decidir si son fraudulentas, complementando listas negras tradicionales.
- Educación y concienciación: en plataformas de formación en ciberseguridad, el modelo puede generar ejemplos de phishing o evaluar la capacidad de los empleados para detectarlos.
- Monitorización de redes sociales: detectar enlaces de phishing compartidos en tweets, posts o mensajes directos, alertando a los moderadores.
- Protección de banca online: integrar el modelo en aplicaciones bancarias para validar enlaces en comunicaciones con clientes.
- Investigación académica: servir como punto de partida para comparar técnicas de detección de phishing con modelos más modernos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede confirmar ninguna métrica de precisión, recall o F1 para este modelo concreto. Las afirmaciones de "95% de precisión" encontradas en la extensión de Chrome PhishAegis no pueden atribuirse a este repositorio sin evidencia directa.

## Requisitos de hardware

- Dado que no se conocen los parámetros ni la arquitectura, no es posible estimar la VRAM necesaria.
- Los modelos de Keras y Joblib suelen ser ligeros y ejecutables en CPU, por lo que probablemente funcionen en cualquier máquina con Python y las librerías adecuadas.
- No se dispone de información sobre GPU recomendadas ni sobre latencia o throughput.
- Opciones de despliegue: al ser modelos clásicos, pueden servirse mediante Flask/FastAPI, o integrarse en sistemas de mensajería o extensiones de navegador. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas. Existen otros sistemas de detección de phishing como PhishAI (generativo, basado en AWS) o soluciones comerciales, pero no se pueden establecer comparaciones cuantitativas sin datos de rendimiento. Se recomienda consultar la documentación de otros modelos en Hugging Face con la etiqueta `phishing` para una evaluación contextual.

## Limitaciones y advertencias

- La falta de documentación técnica impide conocer los sesgos o limitaciones específicas del modelo.
- Al ser un modelo de ML clásico, su capacidad para generalizar a nuevos patrones de phishing puede ser limitada en comparación con enfoques basados en transformers.
- No se ha verificado la calidad de los datos de entrenamiento; podría estar sesgado hacia ciertos tipos de phishing o idiomas.
- La licencia MIT permite uso comercial, pero no se garantiza la precisión ni la seguridad del modelo en entornos de producción.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se proporcionan instrucciones de uso, dependencias ni ejemplos de inferencia, lo que dificulta su adopción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rki123/PhishAegis-Models
- Space relacionado (API): https://huggingface.co/spaces/phishingdetect/phish-aegis-api
- Repositorio GitHub de PhishAegis (no oficial): https://github.com/adrienhaizeq/PhishAegis
- Extensión de Chrome PhishAegis: https://chromewebstore.google.com/detail/phishaegis/dpfdkobjbknceokhinhmmkfiabgpdogi
- Proyecto PhishAI (alternativa): https://github.com/AmiyaI/PhishAI
