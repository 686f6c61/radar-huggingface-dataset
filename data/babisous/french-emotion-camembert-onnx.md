# babisous/french-emotion-camembert-onnx

## Resumen

`babisous/french-emotion-camembert-onnx` es una conversión a formato ONNX (fp32) del modelo `astrosbd/french_emotion_camembert`, un clasificador de emociones en francés construido sobre la arquitectura CamemBERT. El autor de la conversión es el usuario de Hugging Face `babisous`, y el objetivo declarado es permitir la ejecución del modelo en entornos JavaScript mediante `transformers.js` y `onnxruntime`, sin reentrenamiento: se conservan los mismos pesos y las mismas etiquetas (`sad`, `fear`, `anger`, `neutral`, `surprise`, `joy`).

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue derivado de un modelo base, no de un modelo nuevo. Su interés práctico radica en que habilita la clasificación de emociones en francés directamente en el navegador o en Node.js, sin necesidad de un backend Python ni de infraestructura GPU. El repositorio ocupa aproximadamente 0,4 GB, lo que corresponde a los pesos en fp32 de un modelo de tamaño base.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento del modelo base en la información proporcionada; estos datos deberían consultarse en la model card de `astrosbd/french_emotion_camembert`. El modelo está pensado exclusivamente para francés y su licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (CamemBERT, derivado de RoBERTa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (conversion ONNX); no se documentan otras variantes |
| Idiomas soportados | frances (fr) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo subyacente es CamemBERT, un transformer encoder de tipo BERT/RoBERTa preentrenado sobre corpus en francés. La tarea es de clasificación de secuencias con seis etiquetas de emoción: `sad`, `fear`, `anger`, `neutral`, `surprise` y `joy`. El artefacto publicado aquí no introduce cambios arquitectónicos: es una exportación a ONNX en precisión fp32 de los pesos del modelo base `astrosbd/french_emotion_camembert`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni sobre si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones técnicas en la conversión más allá del propio formato ONNX, que permite la ejecución con `onnxruntime` y su integración en `transformers.js`.

## Capacidades

- Clasificación de texto en francés en seis categorías de emoción: tristeza, miedo, enfado, neutral, sorpresa y alegría.
- Inferencia en JavaScript mediante `transformers.js` y `onnxruntime`, tanto en navegador como en Node.js.
- Salida con etiqueta y puntuación de confianza por predicción.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: es un clasificador discriminativo.
- Capacidad multilingüe limitada al francés; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Moderación de comunidades en francés: clasificar comentarios o mensajes de foros para detectar enfado o toxicidad emocional y priorizar la revisión humana. El modelo devuelve una etiqueta y una puntuación que puede usarse como umbral.
- Análisis de sentimiento a nivel de emoción en reseñas de producto: a diferencia de un análisis positivo/negativo binario, permite distinguir entre sorpresa, enfado o alegría, lo que aporta granularidad en paneles de analítica.
- Atención al cliente: enrutar tickets o mensajes de chat según la emoción detectada (por ejemplo, escalar a un agente humano los mensajes con `anger` o `fear`).
- Procesamiento en el navegador: al ser ONNX y ejecutarse con `transformers.js`, permite clasificar texto sin enviar datos a un servidor, útil en aplicaciones con requisitos de privacidad.
- Investigación en psicolingüística: etiquetado automático de corpus franceses con categorías emocionales para estudios exploratorios, siempre con validación humana.
- Enriquecimiento de datasets: preetiquetar grandes volúmenes de texto en francés antes de una revisión manual, reduciendo el coste de anotación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa aproximadamente 0,4 GB en fp32, lo que sugiere un modelo de tamaño base (del orden de 100-150 millones de parámetros, aunque el dato exacto no está disponible).
- Inferencia en CPU viable para clasificación de frases cortas; no requiere GPU.
- Cabe en cualquier GPU consumer con suficiente VRAM para el modelo en fp32 (estimación orientativa: menos de 1 GB), aunque no se dispone de mediciones oficiales.
- Despliegue mediante `onnxruntime` (Python, C++, JavaScript) y `transformers.js` en entornos web.
- No se documentan latencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| babisous/french-emotion-camembert-onnx | no disponible | no disponible | fr | MIT | ONNX |
| astrosbd/french_emotion_camembert | no disponible | no disponible | fr | MIT | safetensors (probable) |
| Modelos de emoción multilingües basados en XLM-R | no disponible | no disponible | multilingüe | variable | variable |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el formato (ONNX frente a pesos nativos de PyTorch) y el ecosistema de ejecución (`transformers.js` frente a `transformers` en Python).

## Limitaciones y advertencias

- Es un clasificador de emociones, no un modelo generativo: no puede responder preguntas ni mantener conversaciones.
- Solo cubre francés; su uso en otros idiomas no está validado y probablemente produzca resultados poco fiables.
- Riesgo de sesgo: los modelos de emoción entrenados con datos etiquetados manualmente heredan los sesgos culturales y anotativos del corpus original, que no se documenta en la información disponible.
- Las etiquetas son discretas y mutuamente excluyentes; la salida no captura emociones mixtas ni intensidad más allá de la puntuación de confianza.
- No se documentan métricas de evaluación, por lo que no es posible estimar su precisión real en producción.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base `astrosbd/french_emotion_camembert` antes de desplegarlo.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/babisous/french-emotion-camembert-onnx)
- [Modelo base: astrosbd/french_emotion_camembert](https://huggingface.co/astrosbd/french_emotion_camembert)
- [Documentación de transformers.js](https://huggingface.co/docs/transformers.js)
