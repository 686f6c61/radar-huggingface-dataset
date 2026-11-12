# Solayman-Sameh/emotion-classification-with-attention

## Resumen

`emotion-classification-with-attention` es un repositorio de Hugging Face publicado por el usuario Solayman-Sameh que contiene una aplicación de clasificación de emociones. No se trata de un modelo fundacional nuevo, sino de un paquete de inferencia que combina un clasificador basado en DistilBERT con un modelo de atención implementado como BiLSTM con atención aditiva. La model card describe el modo de despliegue ("full") y detalla el procedimiento para ejecutar la aplicación en local, incluyendo la gestión de la caché de Hugging Face y la verificación de integridad mediante SHA-256.

El sistema clasifica texto en seis categorías de emoción, presentando las probabilidades como barras no calibradas y una visualización de mapa de calor con los pesos de atención aprendidos por el modelo BiLSTM. La aplicación está pensada para ejecutarse offline una vez descargados los activos de inferencia, con respaldo a un repositorio de Hugging Face configurable mediante variables de entorno (`EMOTION_HF_REPO_ID`, `EMOTION_HF_REVISION`).

La relevancia de este repositorio es limitada en el panorama de modelos open source: no se publican parámetros, contexto, benchmarks ni licencia explícita del modelo, y el repositorio tiene cero descargas y cero likes en el momento de la consulta. Su interés principal es como ejemplo de aplicación de clasificación de emociones con visualización de atención, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador DistilBERT + modelo de atención BiLSTM con atención aditiva |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card menciona atribución Apache-2.0 para dataset/modelo y procedencia PDDL de GloVe, pero no declara licencia del conjunto) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina dos componentes: un clasificador seleccionado identificado como `distilbert` y un modelo de atención identificado como `bilstm_attention`, operando en modo `full`. El clasificador DistilBERT es un transformer destilado de BERT, habitual en tareas de clasificación de texto por su coste reducido. El componente de atención es una BiLSTM con atención aditiva aprendida, cuya salida se visualiza como mapa de calor y produce su propia predicción independiente de la del clasificador.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que `source_lock.json` contiene la atribución del dataset y del modelo bajo Apache-2.0, así como la procedencia de los embeddings GloVe (PDDL), lo que sugiere el uso de embeddings preentrenados GloVe en el componente BiLSTM. No se detalla ninguna innovación técnica adicional más allá de la visualización de atención y la verificación de integridad de los activos de inferencia.

## Capacidades

- Clasificación de texto en seis categorías de emoción, con salida de probabilidades por clase (no calibradas según la propia model card).
- Visualización de atención: genera un mapa de calor con los pesos de atención aditiva aprendidos por el modelo BiLSTM, junto con la predicción propia de dicho modelo.
- Ejecución offline: el bundle local completo funciona sin conexión una vez descargados los activos.
- Gestión de caché de Hugging Face con verificación SHA-256 por archivo y resolución de un único commit para todas las descargas.
- Carga de modelos con código remoto deshabilitado (`remote code disabled`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Análisis de sentimiento y emoción en reseñas de producto: el clasificador asigna una de seis etiquetas a cada reseña, y el mapa de calor de atención permite inspeccionar qué tokens influyeron en la predicción del componente BiLSTM.
- Moderación de comentarios en foros: integración del bundle offline en un servicio interno para etiquetar emociones en comentarios de usuario sin enviar datos a terceros.
- Investigación en interpretabilidad: el par clasificador + BiLSTM con atención permite comparar la predicción de un transformer destilado con la de un modelo recurrente con atención visualizable, útil para estudios de atribución.
- Etiquetado asistido de datasets: uso del modelo para preetiquetar corpus de texto con seis clases de emoción antes de una revisión humana.
- Despliegue en entornos air-gapped: el modo offline con verificación SHA-256 y resolución de commit fijo facilita su uso en infraestructuras sin acceso a Internet.
- Prototipado educativo: ejemplo práctico de pipeline de clasificación con DistilBERT, embeddings GloVe y atención BiLSTM para cursos de PLN.
- Monitorización de opinión en redes sociales: clasificación por lotes de mensajes con un modelo ligero que puede ejecutarse en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,3 GB, lo que sugiere que el conjunto de pesos es pequeño y probablemente ejecutable en CPU.
- GPU recomendadas: no disponibles. La model card indica explícitamente el uso en un host con CPU, instalando una build de PyTorch >=2.6 para CPU.
- Compatibilidad con GPU de consumo: no confirmada, pero el tamaño del bundle (0,3 GB) es compatible con cualquier GPU de consumo moderna si se traslada a CUDA.
- Opciones de despliegue: ejecución directa con `python app.py` tras `pip install -r requirements.txt`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emotion-classification-with-attention | DistilBERT + BiLSTM con atención | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| DistilBERT base (referencia) | Transformer destilado | 66 M (aproximado, no confirmado en la informacion) | 512 tokens (aproximado, no confirmado en la informacion) | Apache-2.0 (referencia general) | Hugging Face, ampliamente disponible |
| Modelos de clasificación de emociones tipo RoBERTa | Transformer | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento del modelo para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Las seis barras de probabilidad son no calibradas según la propia model card; no deben interpretarse como probabilidades fiables sin calibración posterior.
- La entrada neutra o mixta se fuerza a una de las seis etiquetas, lo que puede producir clasificaciones erróneas en textos ambiguos.
- No se declara licencia del modelo; la mención a Apache-2.0 en `source_lock.json` se refiere a la atribución de dataset y modelo de terceros, no necesariamente a los pesos publicados. Verificar antes de uso comercial.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni idiomas soportados.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí riesgo de predicciones incorrectas en dominios alejados de los datos de entrenamiento.
- Repositorio con cero descargas y cero likes: sin validación comunitaria ni evidencia de uso en producción.
- La model card está orientada a instrucciones de despliegue y no a documentación técnica del modelo; faltan parámetros, contexto y detalles de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Solayman-Sameh/emotion-classification-with-attention
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
