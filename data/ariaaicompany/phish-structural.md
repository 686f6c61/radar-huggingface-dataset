# AriaAICompany/phish-structural

## Resumen

phish-structural es un conjunto de dos clasificadores de texto publicados por AriaAICompany bajo el identificador `AriaAICompany/phish-structural`. No es un modelo de lenguaje neuronal: se distribuye como artefactos de scikit-learn en formato joblib y su tarea es la clasificación de mensajes con indicios de phishing. El primer artefacto, `tfidf_lr.joblib`, combina un `TfidfVectorizer` de n-gramas de caracteres (`char_wb`, tamaños 3 a 5) con una regresión logística calibrada mediante sigmoide. El segundo, `lightgbm.joblib`, es un modelo LightGBM entrenado únicamente con características estructurales del mensaje y también calibrado con sigmoide.

El modelo se entrenó sobre las campañas de desarrollo del conjunto de datos `AriaAICompany/phish-messages` (semilla 3). Las campañas de test se reservaron por campaña, por grupo de remitente y por plantilla, lo que busca medir generalización a campañas no vistas en lugar de memorización de plantillas concretas. Los idiomas declarados en los metadatos son inglés (en) y persa (fa).

Su relevancia es acotada pero clara: ofrece un componente de apoyo a la decisión para un revisor humano que analiza un mensaje sintético o ya compartido. La propia model card insiste en que las puntuaciones no constituyen un certificado de seguridad ni una probabilidad de compromiso de cuenta, y excluye explícitamente el uso como mecanismo de aplicación en buzones de producción. El repositorio declara 0 descargas y 0 likes, y un tamaño de 0,0 GB, coherente con dos artefactos clásicos de pequeño tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal. Dos clasificadores clásicos: (1) `TfidfVectorizer` con n-gramas de caracteres `char_wb` de 3 a 5 + regresión logística calibrada con sigmoide; (2) LightGBM sobre características estructurales únicamente, calibrado con sigmoide |
| Parametros totales | no disponible (no se publica recuento de parámetros ni de features; no es un modelo denso de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de ventana de atención. El vectorizador procesa el mensaje completo que recibe, sin ventana declarada; no se especifica límite de longitud de entrada |
| Tipos de cuantizacion | no aplica (los artefactos son serializaciones joblib, no pesos de red neuronal en coma flotante) |
| Idiomas soportados | Inglés (en) y persa (fa), según los metadatos de la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib (`tfidf_lr.joblib`, `lightgbm.joblib`) |
| Libreria declarada | scikit-learn |
| Pipeline declarado | text-classification |
| Dataset de entrenamiento | `AriaAICompany/phish-messages` (campañas de desarrollo, semilla 3) |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura no sigue el patrón transformer ni MoE ni SSM. Se trata de dos revisores independientes de tipo «small calibrated reviewers»: por un lado, un pipeline clásico de bolsa de palabras con vectorización TF-IDF a nivel de carácter (`char_wb`, n-gramas de 3 a 5) seguido de regresión logística; por otro, un modelo de gradient boosting (LightGBM) que consume exclusivamente características estructurales del mensaje, es decir, señales de forma y composición y no el contenido textual en crudo. Ambos se calibran con función sigmoide, de modo que las salidas se aproximan a probabilidades calibradas, aunque la model card advierte que no deben interpretarse como probabilidad de compromiso de cuenta.

En cuanto a los datos, el entrenamiento se realizó sobre las campañas de desarrollo del dataset `AriaAICompany/phish-messages` con semilla 3. El diseño experimental reserva las campañas de test mediante tres criterios simultáneos: por campaña, por grupo de remitente y por plantilla. Esta separación es la innovación metodológica más destacable del artefacto, porque evita la fuga de información que se produce cuando mensajes de la misma campaña o del mismo remitente aparecen repartidos entre entrenamiento y evaluación. No se documenta en la información disponible el número de tokens, el volumen de ejemplos, la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de modelos).

El repositorio menciona `scripts/build_artifacts.py`, que escribe `metrics.json`, y una carpeta `evaluations/evaluation.json` dentro del Space asociado. La model card advierte de forma explícita que el PR-AUC de laboratorio sobre datos sintéticos no equivale a precisión operativa.

## Capacidades

- Clasificación binaria o puntuada de mensajes con indicios de phishing, devolviendo una puntuación calibrada por sigmoide como apoyo a la decisión de un revisor humano.
- Análisis a nivel de carácter mediante n-gramas `char_wb` de 3 a 5, lo que permite explotar patrones de escritura, ofuscación tipográfica y variaciones morfológicas sin depender de una tokenización lingüística previa.
- Análisis estructural independiente del texto mediante LightGBM, útil cuando las señales relevantes son de forma (composición, campos, organización del mensaje) y no de contenido.
- Cobertura declarada en inglés y persa.
- Uso como conjunto de dos revisores complementarios: al ser dos modelos distintos, pueden consultarse por separado o combinarse para contrastar sus veredictos.
- Diseñado para evaluación fuera de distribución por campaña, grupo de remitente y plantilla, lo que permite emplearlo como banco de pruebas de generalización.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling ni capacidades de agente o razonamiento multi-paso. No es un modelo conversacional ni un modelo de lenguaje generativo.
- No está capacitado para obtener o renderizar URL en vivo, ejecutar adjuntos, juzgar malicia a partir de una captura de logotipo ni interpretar cabeceras SPF/DKIM/DMARC copiadas como veredicto fiable del receptor.

## Casos de uso

- Triaje asistido en un SOC: el analista introduce un mensaje ya capturado y el modelo devuelve una puntuación calibrada que ayuda a priorizar la cola de revisión. Encaja porque su uso previsto es exactamente el de apoyo a la decisión sobre mensajes sintéticos o ya compartidos, no la interceptación en tiempo real.
- Curaduría y etiquetado de datasets de phishing: `tfidf_lr.joblib` y `lightgbm.joblib` pueden preetiquetar grandes volúmenes de mensajes para que un humano confirme o corrija, reduciendo el coste de anotación en inglés y persa.
- Investigación en detección de phishing multilingüe: sirve como línea base reproducible para comparar contra modelos neuronales, dado que el split por campaña, remitente y plantilla evita la fuga de información habitual en este dominio.
- Análisis forense de campañas ya documentadas: al combinar una vista textual (TF-IDF de caracteres) y una vista estructural (LightGBM), permite contrastar si una campaña se detecta por su redacción, por su estructura o por ambas.
- Formación y concienciación en ciberseguridad: el modelo puede puntuar ejemplos didácticos de correos fraudulentos y mostrar por qué un mensaje resulta sospechoso, siempre con supervisión humana y sin presentar la salida como certificado de seguridad.
- Ejercicios de red team y CTF: análisis de mensajes sintéticos generados para prácticas, donde el objetivo es evaluar la capacidad de detección de un revisor automático sobre materiales controlados.
- Componente auxiliar en un sistema de decisión más amplio: las dos puntuaciones calibradas pueden alimentar un clasificador de segunda etapa o una regla de agregación, con la condición de que la decisión final permanezca en manos de un humano o de un sistema con salvaguardas adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `metrics.json`, generado por `scripts/build_artifacts.py`, y a `evaluations/evaluation.json` dentro del Space asociado, pero no se proporcionan cifras concretas en la información disponible. La propia model card advierte que el PR-AUC de laboratorio sobre datos sintéticos no constituye precisión operativa, por lo que cualquier cifra que se obtuviese de esos ficheros debería interpretarse con esa cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. No se requiere GPU; son dos artefactos clásicos de scikit-learn y LightGBM que se ejecutan en CPU.
- GPU recomendadas: no aplica. El modelo no aprovecha aceleración por GPU de forma nativa.
- Compatibilidad con GPU de consumo: no aplica, ya que no necesita GPU. Se ejecuta en cualquier CPU razonablemente moderna.
- Memoria principal: no disponible con precisión, pero el tamaño del repositorio declarado es de 0,0 GB y se trata de dos ficheros joblib, por lo que la huella es reducida en comparación con modelos neuronales.
- Opciones de despliegue: carga directa con `joblib.load` en Python sobre scikit-learn; integración como etapa de un pipeline de scikit-learn; servicio ligero con FastAPI, Flask o similar; inclusión en un Space de Hugging Face. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no hay pesos de red neuronal ni formato GGUF.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de rendimiento en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento de alternativas en la misma categoría (detección de phishing con clasificadores clásicos o neuronales). La búsqueda web asociada no devolvió resultados relacionados con el modelo ni con el dominio de detección de phishing.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AriaAICompany/phish-structural | no disponible | no aplica | no disponible | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las puntuaciones no son un certificado de seguridad ni una probabilidad de compromiso de cuenta. La model card lo indica de forma explícita.
- El modelo está pensado como apoyo a la decisión de un revisor humano sobre mensajes sintéticos o ya compartidos, no como mecanismo de aplicación automática en buzones de producción.
- Fuera de alcance declarado: obtener o renderizar URL en vivo, ejecutar adjuntos, juzgar malicia a partir de una captura de logotipo y tratar cabeceras SPF/DKIM/DMARC copiadas como veredicto fiable del receptor.
- El PR-AUC de laboratorio obtenido sobre datos sintéticos no equivale a precisión operativa en un entorno real.
- Solo se declaran dos idiomas, inglés y persa. No hay información sobre el comportamiento en otros idiomas ni sobre mezcla de idiomas dentro de un mismo mensaje.
- Sesgos conocidos: no disponible. No se documentan análisis de sesgo en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no genera texto; el riesgo equivalente es el de falsos positivos y falsos negativos, cuyas tasas no se publican.
- No se especifica el volumen ni la composición del dataset de entrenamiento, ni la distribución de campañas, por lo que no puede evaluarse la representatividad de los datos.
- Licencia Apache 2.0, que permite uso comercial y modificación con las condiciones habituales de atribución y conservación de avisos. No se documentan restricciones adicionales en la información disponible.
- El repositorio presenta 0 descargas y 0 likes y las fechas de creación y actualización son del 20 de septiembre de 2026, con apenas 35 segundos de diferencia. Esto sugiere una publicación reciente y sin validación externa por parte de la comunidad.
- Para producción en un entorno real se requeriría validación propia del modelo sobre datos del dominio objetivo, ya que no se ofrecen métricas operativas verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AriaAICompany/phish-structural
- Dataset de entrenamiento: https://huggingface.co/datasets/AriaAICompany/phish-messages
- Ficheros de artefactos citados en la model card: `tfidf_lr.joblib`, `lightgbm.joblib`
- Script de construcción de artefactos citado: `scripts/build_artifacts.py` (escribe `metrics.json`)
- Fichero de evaluación citado: `evaluations/evaluation.json` dentro del Space asociado (URL del Space no disponible en la información proporcionada)
- Paper, blog, repositorio adicional o demo: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
