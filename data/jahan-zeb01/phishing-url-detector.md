# jahan-zeb01/phishing-url-detector

## Resumen

`jahan-zeb01/phishing-url-detector` es un clasificador de aprendizaje automático basado en Random Forest que detecta si una URL es phishing o legítima. Lo desarrolla el usuario `jahan-zeb01` y está publicado en Hugging Face bajo licencia MIT. El modelo resuelve un problema de ciberseguridad: identificar enlaces maliciosos en tiempo real a partir de 20 características extraídas de la propia URL, sin necesidad de analizar el contenido de la página.

A diferencia de los modelos de lenguaje, no se trata de una red neuronal ni de un transformer. Es un conjunto de árboles de decisión entrenado con 235.370 URLs etiquetadas. Según la model card, alcanza una exactitud del 99,65 % y un F1 de 0,9969 en el conjunto de evaluación. No dispone de longitud de contexto ni de parámetros neuronales, ya que su entrada son vectores numéricos derivados de la URL, no texto libre. Es un modelo ligero, pensado para integración en sistemas de análisis de tráfico, filtros de correo o extensiones de navegador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (clasificador de árboles de decisión) |
| Parametros totales | No disponible (modelo basado en árboles; no es un modelo neuronal) |
| Longitud de contexto | No aplica (clasificador de URLs, no procesa texto libre) |
| Tipos de cuantizacion | No aplica (modelo no neuronal; se usa joblib/Pickle) |
| Idiomas soportados | Inglés (etiqueta de la model card; las características de URL son independientes del idioma) |
| Licencia | MIT |
| Formato de pesos | Pickle (joblib) - archivos `.pkl` |

## Arquitectura y entrenamiento

El modelo es un Random Forest, un conjunto de árboles de decisión que combinan sus predicciones para clasificar cada URL como phishing o legítima. Se entrenó con un dataset de 235.370 URLs, según la model card. La entrada al modelo es un vector de 20 características numéricas calculadas a partir de la URL: longitud total, longitud del dominio, presencia de IP en el dominio, tasa de repetición de caracteres, probabilidad de que el TLD sea legítimo, número de subdominios, uso de HTTPS, presencia de caracteres ofuscados, ratio de letras y dígitos, conteo de palabras clave sospechosas, entre otras.

No se proporciona información sobre la composición exacta del dataset (balanceo, fuente de las etiquetas, fecha de recolección) ni sobre técnicas de alineación como RLHF o DPO, que no aplican a este tipo de modelo. La innovación técnica destacable es la ingeniería de características: el modelo no analiza el contenido del sitio web, solo la estructura de la URL, lo que permite predicciones rápidas y con coste computacional mínimo.

## Capacidades

- Clasificación binaria de URLs como phishing o legítimas.
- Extracción y cálculo de 20 características heurísticas en tiempo real.
- Devuelve una predicción con nivel de confianza (probabilidad asociada a la clase).
- Procesa exclusivamente URLs; no genera texto ni razona sobre el contenido de la página.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- Aunque la etiqueta de idioma es `en`, las características utilizadas no dependen del idioma de la URL.
- No tiene capacidades de visión, audio ni procesamiento multimodal.

## Casos de uso

- Filtrado de correo electrónico: integrar el clasificador en el pipeline de un servidor de correo para puntuar cada URL en los mensajes entrantes y marcar como spam los que superen un umbral de probabilidad de phishing. Es adecuado porque la predicción es rápida y no requiere abrir el enlace.
- Extensión de navegador: desarrollar una extensión que analice la URL activa antes de cargar la página y bloquee la navegación si el modelo devuelve una probabilidad alta de phishing. El modelo es ligero y puede ejecutarse localmente en el navegador o en un servicio remoto.
- Monitorización de tráfico de red: desplegar el clasificador en un proxy o firewall corporativo para inspeccionar URLs en tiempo real y bloquear conexiones sospechosas. La baja latencia permite evaluar miles de URLs por segundo en CPU.
- Análisis de alertas en un SOC: los analistas de seguridad pueden usar el modelo como herramienta de priorización para clasificar automáticamente los enlaces reportados por usuarios o detectados por otros sistemas, reduciendo el trabajo manual.
- Integración en sistemas de gestión de tickets: cuando un usuario reporta un enlace sospechoso, el sistema lo envía al modelo para obtener una clasificación inmediata y enriquecer el ticket con la probabilidad de phishing.
- Verificación de enlaces en campañas de marketing: comprobar automáticamente las URLs incluidas en emails promocionales antes de su envío para evitar que se filtre un enlace malicioso. El modelo aporta una capa extra de seguridad sin necesidad de análisis externo.
- Educación en ciberseguridad: usar el modelo como herramienta didáctica para mostrar a estudiantes y empleados qué características de una URL la hacen sospechosa, visualizando las 20 variables y su influencia en la clasificación.

## Benchmarks y rendimiento

Según la model card del autor, el modelo reporta las siguientes métricas en su conjunto de evaluación:

| Metrica | Valor |
|---|---|
| Accuracy | 99,65 % |
| Precision | 99,57 % |
| Recall | 99,82 % |
| F1-Score | 99,69 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Las cifras proceden únicamente del README del autor y no se dispone de detalles sobre el conjunto de prueba ni sobre su metodología de validación.

## Requisitos de hardware

- VRAM: no aplica; el modelo no requiere GPU.
- GPU recomendada: ninguna. Se ejecuta correctamente en CPU.
- Puede desplegarse en entornos con recursos mínimos, incluidos ordenadores personales, Raspberry Pi o servidores sin aceleración gráfica.
- Despliegue: mediante Python con `joblib` y `pandas`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos neuronales.
- Latencia: muy baja, del orden de milisegundos por URL en una CPU estándar (estimación razonable, no especificada por el autor).
- El tamaño del archivo pickle no está indicado, pero al tratarse de un Random Forest con 20 características, se espera que sea de unos pocos megabytes.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. La búsqueda web no arrojó resultados relevantes sobre este modelo ni sobre alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos inherentes a las características heurísticas: el modelo puede fallar ante técnicas de phishing novedosas que no generen patrones anómalos en las 20 variables analizadas.
- Riesgo de falsos positivos: URLs legítimas con dominios largos, muchos subdominios, caracteres inusuales o que contienen palabras clave sospechosas pueden clasificarse erróneamente como phishing.
- Riesgo de falsos negativos: URLs maliciosas que imitan perfectamente un dominio legítimo (por ejemplo, mediante homoglyphs o dominios muy similares) pueden superar el filtro.
- No es un modelo de lenguaje: no puede explicar sus decisiones de forma textual ni generar informes.
- Limitación de idioma: la etiqueta es `en`, pero no hay evidencia de que el rendimiento varíe según el idioma de la URL; las características son universales.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías de funcionamiento ni soporte.
- Datos de entrenamiento: no se especifica la fecha de recolección ni la composición del dataset, por lo que el modelo puede estar desactualizado frente a amenazas recientes.

## Enlaces

- Hugging Face: [https://huggingface.co/jahan-zeb01/phishing-url-detector](https://huggingface.co/jahan-zeb01/phishing-url-detector)
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios) en la búsqueda web.
