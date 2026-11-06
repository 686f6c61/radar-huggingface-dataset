# Ratul16961/phishing-url-random-forest

## Resumen

`Ratul16961/phishing-url-random-forest` es un clasificador binario de tipo Random Forest, entrenado con scikit-learn, que etiqueta una URL como *phishing* o *segura* a partir de 14 características léxicas extraídas del propio texto de la URL (longitud, número de puntos, guiones, dígitos, presencia de "@", host expresado como IP, palabras clave sospechosas, etc.). No es un modelo de lenguaje ni una red neuronal: es un modelo tabular clásico serializado con joblib, orientado a la clasificación de URLs en pipelines de seguridad.

El modelo lo publica Hasan Ratul (matrícula 20243120073) como proyecto de estudiante para la asignatura Professional Training 2 de la Yunnan University. Se entrenó sobre el conjunto "Phishing Site URLs" de Kaggle (549.346 URLs, 507.195 tras eliminar duplicados), con una particularidad relevante: se añadieron copias sin ruta (solo dominio) de las URLs que tenían path para mitigar un atajo del dataset, ya que las URLs sin ruta eran un 97,5 % phishing.

Su relevancia es limitada y de carácter educativo: el autor lo describe explícitamente como una demo didáctica y no como una herramienta de seguridad. El rendimiento en test es moderado (accuracy 0,91, ROC-AUC 0,952) pero cae drásticamente cuando se elimina la ruta de la URL (recall de phishing del 23 %), lo que evidencia que el modelo depende en gran medida de la información del path.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (scikit-learn, `RandomForestClassifier`) |
| Parametros totales | no disponible (no se documenta el número de árboles ni su profundidad) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 14 características léxicas) |
| Tipos de cuantizacion | no disponible (serialización joblib; no se documentan variantes comprimidas) |
| Idiomas soportados | no disponible (el modelo opera sobre texto de URL, no sobre lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | joblib (`best_model.joblib`) |
| Librería de entrenamiento | scikit-learn 1.9.1, numpy 2.5.4, pandas 3.1.0 |
| Pipeline | `tabular-classification` |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un Random Forest de scikit-learn que recibe un vector de 14 características léxicas calculadas sobre el texto de la URL, tras eliminar el esquema (`http://` o `https://`). Las características descritas en la model card incluyen longitud, número de puntos, número de guiones, número de dígitos, presencia del carácter "@", host en forma de dirección IP y presencia de palabras clave sospechosas, entre otras no detalladas explícitamente. La salida es una etiqueta binaria (*phishing* / *safe*).

Los datos de entrenamiento provienen del dataset "Phishing Site URLs" de Kaggle (549.346 URLs), reducido a 507.195 tras eliminar duplicados: 392.897 URLs seguras y 114.298 de phishing. El autor detectó un sesgo estructural en el dataset (las URLs sin ruta eran un 97,5 % phishing) y lo corrigió generando una copia solo-dominio de cada URL con path, de modo que el modelo no aprendiera el atajo "sin path implica phishing". No se documenta el número de árboles, la profundidad máxima, el criterio de división ni ningún proceso de ajuste de hiperparámetros, validación cruzada o calibración. Tampoco hay indicios de entrenamiento con datos posteriores a la publicación del dataset ni de reentrenamiento periódico.

## Capacidades

- Clasificación binaria de URLs en *phishing* o *segura* a partir de 14 características léxicas.
- Extracción de características sobre el texto de la URL, sin resolución DNS, sin descarga de contenido y sin análisis del HTML de la página.
- Detección de patrones léxicos sospechosos: uso de "@" en la URL, host expresado como IP, presencia de palabras clave, exceso de guiones o dígitos, longitud anómala.
- Inferencia rápida y de bajo coste computacional, apta para ejecutarse en CPU sin GPU.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No tiene capacidades multilingües en sentido estricto: opera sobre cadenas de URL, no sobre lenguaje natural.
- No dispone de modo *thinking*, visión, audio ni generación de texto.

## Casos de uso

- Filtrado previo en pasarelas de correo: clasificar en tiempo real las URLs extraídas de los mensajes antes de que el usuario haga clic. El coste de inferencia es mínimo y permite procesar lotes grandes en CPU, aunque el recall de phishing del 68 % obliga a combinarlo con otras señales.
- Enriquecimiento de alertas en un SIEM: añadir una puntuación de riesgo léxico a las URLs observadas en logs de proxy o DNS, como una feature más dentro de un modelo de detección agregado.
- Prototipado académico y docencia: ejemplo reproducible de pipeline de clasificación tabular con scikit-learn, útil para ilustrar fuga de datos (*shortcut learning*) y su mitigación mediante la generación de copias solo-dominio.
- Análisis exploratorio de corpus de URLs: etiquetar grandes volúmenes de URLs históricas para estudiar la prevalencia de patrones léxicos sospechosos por dominio o por período.
- Componente de un *ensemble* de seguridad: combinar la salida del Random Forest con clasificadores basados en contenido, listas de reputación y modelos de lenguaje para reducir falsos negativos.
- Filtro de primera línea en navegadores o extensiones en entornos controlados: bloquear URLs con patrones léxicos claramente anómalos (IP como host, "@" embebido) antes de consultar servicios externos de reputación, siempre como capa adicional y no como decisión final.
- Detección de *typosquatting* léxico: las características de longitud, dígitos y guiones permiten señalar dominios que imitan marcas conocidas, aunque el modelo no se entrenó específicamente para esa tarea.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el 20 % estratificado de test (101.439 URLs):

| Metrica | Valor |
|---|---|
| Accuracy | 0,91 |
| Precision (phishing) | 0,90 |
| Recall (phishing) | 0,68 |
| F1 (phishing) | 0,78 |
| ROC-AUC | 0,952 |

Evaluación solo-dominio (ruta eliminada de las mismas URLs de test):

| Metrica | Valor |
|---|---|
| Recall (safe) | 0,99 |
| Recall (phishing) | 0,23 |
| Precision (phishing) | 0,85 |
| ROC-AUC | 0,710 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica. El modelo se ejecuta en CPU; el repositorio ocupa 0,2 GB en disco y la carga en memoria es del orden de cientos de MB o menos, dependiendo del número de árboles (no documentado).
- GPU recomendadas: ninguna. No se requiere aceleración por hardware.
- Cabe en cualquier GPU de consumo y, de hecho, no la necesita; funciona en cualquier CPU moderna.
- Despliegue: carga directa con `joblib.load` en Python, o exportación a otros formatos si se necesita servir desde otros entornos. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no documentados. Por la naturaleza del modelo (Random Forest sobre 14 features) se espera latencia de microsegundos a pocos milisegundos por muestra en CPU, pero no hay cifras publicadas.
- Requisito crítico de versiones: scikit-learn 1.9.1, numpy 2.5.4 y pandas 3.1.0 para garantizar la compatibilidad de la deserialización.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Recall phishing (test) | ROC-AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ratul16961/phishing-url-random-forest | Random Forest (scikit-learn) | 14 features léxicas de la URL | 0,68 (0,23 sin path) | 0,952 (0,710 sin path) | MIT | Hugging Face |
| Modelos basados en contenido HTML/DOM | Variable (árboles, redes) | HTML, recursos, red | no disponible | no disponible | variable | variable |
| Listas de reputación (PhishTank, OpenPhish) | Basadas en denuncias | URL completa | no disponible | no disponible | variable | pública |
| Clasificadores léxicos comerciales | Propietarios | URL + señales externas | no disponible | no disponible | propietaria | de pago |

No se dispone de datos públicos comparables en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo utiliza el texto de la URL: no inspecciona el contenido de la página, el certificado TLS, la reputación del dominio ni el comportamiento del servidor.
- El recall de phishing es del 68 % en test y cae al 23 % cuando se elimina la ruta de la URL, lo que indica una dependencia fuerte de información que en producción puede no estar disponible o ser manipulable.
- El dataset es antiguo y sus URLs seguras y de phishing provienen de fuentes distintas, por lo que el rendimiento en el mundo real sería probablemente inferior al reportado.
- El autor califica el modelo explícitamente como demo educativa y no como herramienta de seguridad; no debe usarse como única defensa en producción.
- Riesgo de falsos negativos elevado: un atacante puede construir URLs léxicamente benignas (dominio corto, sin dígitos, sin guiones) que el modelo clasificará como seguras.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de clasificaciones erróneas con alta confianza derivadas de la distribución del dataset de entrenamiento.
- Sesgo de dominio y de época: el modelo no se ha validado sobre tráfico reciente ni sobre dominios internacionalizados (IDN) o acortadores de URL, no documentados en el entrenamiento.
- Dependencia estricta de versiones de scikit-learn, numpy y pandas; cargar el `.joblib` con versiones distintas puede producir errores o resultados inconsistentes.
- Riesgo de seguridad al cargar el artefacto: `joblib.load` deserializa objetos Python y puede ejecutar código arbitrario si el fichero ha sido manipulado; solo debe cargarse desde el repositorio oficial del autor.
- Licencia MIT: permite uso comercial y modificación, pero no ofrece ninguna garantía ni asume responsabilidad por fallos de detección.
- Sin mantenimiento documentado: el repositorio se creó y actualizó el mismo día (5 de noviembre de 2026) y no hay indicios de actualizaciones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ratul16961/phishing-url-random-forest
- Código del proyecto (rama `has073-phishing`, carpeta `has073`): https://github.com/ratulhasan16961/PT22026
- Dataset de entrenamiento ("Phishing Site URLs", Kaggle): no disponible el enlace directo en la información proporcionada
- Paper o blog técnico: no disponible
