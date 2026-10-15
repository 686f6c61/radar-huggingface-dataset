# pastel-labs/UltraBERT-380M-ONNX

## Resumen

UltraBERT-380M-ONNX es la conversión a formato ONNX del modelo dmis-lab/UltraBERT-380M, un encoder de 380 millones de parámetros especializado en tareas de masked language modeling (fill-mask). Lo publica el usuario pastel-labs, que no ha entrenado el modelo: su aportación es exclusivamente el reempaquetado de los pesos originales en grafos ONNX ejecutables con ONNX Runtime y Transformers.js. La licencia Apache-2.0 se mantiene, igual que el modelo base.

El interés práctico del repositorio está en el despliegue: incluye dos precisiones (fp32 de 1720 MB y fp16 de 860 MB) con batch y longitud de secuencia dinámicos, y publica una validación numérica de fidelidad frente al PyTorch original (cosine de 1.0000 en fp32 y 0.99995 en fp16, con un 99.2 % de coincidencia top-1 en fp16). Eso permite ejecutar un encoder de 380M en navegador o en Node mediante Transformers.js v3, algo que el modelo PyTorch original no ofrece de serie.

La contrapartida es doble: el modelo es solo inglés, la arquitectura no está soportada de forma nativa por Transformers.js v3 (requiere rodeos con `ModernBertForMaskedLM`) y no existe versión de 4 bits porque las pruebas de cuantización no alcanzaron el umbral de fidelidad autoimpuesto. Con 0 descargas y 0 likes en el momento de redactar esta ficha, no hay validación externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer con capas de atención de ventana deslizante (128 tokens) y capas de atención global; atención eager, RMSNorm. El autor indica que no es ModernBERT |
| Parametros totales | 380 M (heredados del modelo base dmis-lab/UltraBERT-380M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; las pruebas de conversion usaron secuencias de hasta 4096 tokens |
| Tipos de cuantizacion | fp32 y fp16 (ONNX). No se publica version de 4 bits (q4): la cuantizacion weight-only MatMulNBits con block size 32 dio cosine minimo de 0.926, por debajo del umbral de 0.99 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, exportado con el exportador TorchScript de PyTorch); repositorio de 2.6 GB |
| Tarea (pipeline) | fill-mask (masked language modeling) |
| Dimension oculta | 1024 |
| Tamano de vocabulario | 49 152 |
| Entradas del grafo | input_ids, attention_mask (batch y secuencia dinamicos) |
| Salidas del grafo | last_hidden_state [batch, tokens, 1024] y logits [batch, tokens, 49152] |
| Libreria declarada | transformers.js |

## Arquitectura y entrenamiento

Se trata de un encoder transformer de 380 millones de parámetros con una dimension oculta de 1024 y un vocabulario de 49 152 tokens. El grafo ONNX expone dos salidas: el estado oculto final por token y los logits de la cabeza de masked language modeling. La atención combina capas de ventana deslizante de 128 tokens con capas de atención completa; ambas se construyen dentro del grafo a partir de la máscara de atención, de modo que el padding y cualquier longitud de secuencia funcionan sin recompilar. La exportación se hizo con opset 17 desde el `modeling_ultrabert.py` original, en modo eager. En fp16, las operaciones RMSNorm y softmax se fuerzan a fp32 para evitar desbordamiento, mientras que las multiplicaciones de matrices sí corren en fp16.

Sobre el entrenamiento no hay datos en la informacion proporcionada: ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO (poco habitual en un modelo encoder de fill-mask, pero no confirmado). Toda la información técnica del repositorio se refiere al proceso de conversión y validación, no al entrenamiento. El modelo base es dmis-lab/UltraBERT-380M y el autor de esta conversión, pastel-labs, no reclama crédito alguno sobre los pesos.

La innovación técnica relevante aquí no está en el modelo sino en la validación de la conversión: se compararon 20 textos en inglés (15 cortos de 3 a 25 tokens y 5 extractos de libro de 2000 a 8000 tokens, recortados a 4096) entre PyTorch y cada archivo ONNX, usando similitud coseno sobre los estados ocultos con mean pooling y coincidencia top-1 del token de mayor puntuación en cada posición. El umbral exigido era cosine >= 0.99 en todos los textos.

## Capacidades

- Relleno de máscaras (fill-mask): predice el token enmascarado en una secuencia, con `logits` de 49 152 clases por posición.
- Extracción de representaciones: `last_hidden_state` de 1024 dimensiones por token, utilizable para embeddings, clasificación o clustering mediante fine-tuning posterior.
- Ejecución en navegador y Node.js mediante Transformers.js v3, con `AutoModel` y `dtype: 'fp16'` o `'fp32'`.
- Ejecución con ONNX Runtime en Python, con carga alternativa vía `ModernBertForMaskedLM.from_pretrained` (la clase solo envuelve la sesión ONNX; la arquitectura no es ModernBERT).
- Batch dinámico y longitud de secuencia dinámica: el mismo grafo admite entradas de distinta longitud y tamaño de lote.
- Capacidades multilingües: no. Solo inglés.
- Tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión o audio: no disponibles. Es un modelo encoder de fill-mask, no generativo ni conversacional.

## Casos de uso

- Autocompletado y corrección en editores de texto en inglés: dado un texto con una palabra enmascarada, el modelo devuelve la distribución sobre el vocabulario para sugerir el término más probable. Funciona en cliente (navegador) gracias a la exportación fp16 de 860 MB.
- Búsqueda semántica y recuperación de información: usar `last_hidden_state` con mean pooling para generar embeddings de frases y documentos en inglés, alimentando un índice vectorial. La dimensión de 1024 por token es manejable para indexación.
- Clasificación de texto en producción: clasificación de reseñas, tickets, noticias o SQL mediante fine-tuning de la cabeza sobre las representaciones del encoder, ejecutando el resultado en ONNX Runtime sobre CPU.
- Validación de calidad y detección de anomalías lingüísticas: comparar los logits del modelo con el texto real para puntuar la improbabilidad de una frase, útil en filtrado de spam, detección de texto generado o control de calidad de traducciones automáticas al inglés.
- Preprocesamiento en pipelines de NLP serverless o edge: al ser ONNX con batch dinámico y solo 860 MB en fp16, se puede desplegar en funciones ligeras o entornos sin GPU, incluyendo inferencia en el navegador del usuario.
- Anotación asistida de datos: rellenar huecos en datasets etiquetados o generar candidatos para revisión humana en tareas de etiquetado de entidades y relaciones en inglés.
- Enseñanza e investigación de arquitecturas híbridas de atención: el grafo ONNX expone una combinación de atención local de 128 tokens y atención global, útil para estudiar el comportamiento de ese diseño sin depender de herramientas de TransformerLens.
- Prototipado de aplicaciones web de NLP: la integración con Transformers.js v3 permite tener inferencia funcional en el navegador sin backend ni GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, etc.) en la informacion disponible. El repositorio solo publica métricas de fidelidad de la conversión frente al modelo PyTorch original.

| Precision | Archivo | Tamano | Cosine minimo | Cosine medio | Coincidencia top-1 |
|---|---|---|---|---|---|
| fp32 | `onnx/model.onnx` | 1720 MB | 1.0000 | 1.00000 | 100.0 % |
| fp16 | `onnx/model_fp16.onnx` | 860 MB | 0.9995 | 0.99995 | 99.2 % |
| q4 (descartada) | no publicada | — | 0.926 | no disponible | no coincide (bajo el umbral) |

Metodología de la validación: 20 textos en inglés (15 cortos de 3 a 25 tokens y 5 extractos de 2000 a 8000 tokens, recortados a 4096), comparando estados ocultos con mean pooling mediante similitud coseno. Umbral de aceptación: cosine >= 0.99 en todos los textos. También se verificó que Transformers.js 3 cargaba cada archivo en Node, producía los mismos ids de token que el tokenizador de Python y reproducía los vectores de ONNX Runtime con cosine superior a 0.999.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1.8-2.0 GB en fp32 y 0.9-1.1 GB en fp16 para el modelo, más el consumo variable de activaciones según batch y longitud de secuencia.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de memoria libre, incluidas GTX 1650, RTX 3050 y superiores, así como A100 o H100 si se busca maximizar throughput.
- Cabe en GPU de consumo: sí, con holgura. Incluso en fp32 cabe en tarjetas de gama de entrada con 4 GB o más. También es viable la inferencia exclusiva en CPU, dado el tamaño de 380M de parámetros.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java), Transformers.js v3 (navegador y Node.js), y carga en PyTorch/transformers mediante `ModernBertForMaskedLM` que envuelve la sesión ONNX. No hay soporte nativo de `AutoModelForMaskedLM` ni del pipeline `fill-mask` para este tipo de modelo en Transformers.js v3.
- Latencia y throughput: no disponibles. El repositorio no publica cifras de rendimiento.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar el rendimiento del modelo con alternativas. La comparación posible es de formato, licencia y disponibilidad.

| Modelo | Parametros | Formato | Contexto | Licencia | Idioma | Benchmarks |
|---|---|---|---|---|---|---|
| pastel-labs/UltraBERT-380M-ONNX | 380 M | ONNX (fp32, fp16) | no disponible | Apache-2.0 | en | solo métricas de fidelidad de conversión |
| dmis-lab/UltraBERT-380M | 380 M | PyTorch (safetensors u otro, no disponible) | no disponible | Apache-2.0 | en | no disponibles en la informacion proporcionada |
| Alternativas ONNX de encoders de tamano similar | no disponible | ONNX | no disponible | no disponible | no disponible | no disponible |

La diferencia principal frente al modelo base es el formato: este repositorio permite ejecución en ONNX Runtime y en el navegador, mientras que el original requiere PyTorch. Los pesos y la licencia son los mismos.

## Limitaciones y advertencias

- Solo inglés. Cualquier uso en castellano u otros idiomas queda fuera del alcance del modelo.
- No es un modelo generativo ni conversacional: no produce texto libre, solo puntuaciones de masked language modeling y representaciones. No sirve para chat, agentes ni generación de código.
- Integración limitada con Transformers.js v3: `AutoModelForMaskedLM` y el pipeline `fill-mask` rechazan el tipo de modelo; `AutoModel` imprime "Unknown model class" y recurre a la clase base. Para obtener una clase de masked LM hay que usar `ModernBertForMaskedLM.from_pretrained`, que solo envuelve la sesión (la arquitectura no es ModernBERT).
- Sin versión de 4 bits: la cuantización q4 probada (MatMulNBits con block size 32) dio un cosine mínimo de 0.926 y dejó de coincidir en las predicciones masked-LM. Las variantes asimétrica, HQQ y block-16 tampoco alcanzaron 0.99. En entornos con memoria muy ajustada no hay opción cuantizada agresiva.
- Perdida de fidelidad en fp16: un 0.8 % de posiciones no coinciden en el token top-1 respecto a PyTorch, aunque el cosine medio es 0.99995. En tareas sensibles a la predicción exacta conviene usar fp32.
- Longitud de secuencia validada hasta 4096 tokens, limitada por la memoria de la máquina de pruebas del autor. El comportamiento por encima de esa longitud no está verificado.
- Sin descargas ni likes en el momento de redactar esta ficha, lo que implica ausencia de validación independiente por parte de la comunidad.
- Riesgo de sesgos: no hay información sobre la composición del dataset de entrenamiento original, por lo que no se pueden evaluar sesgos de género, raza o dominio. Al derivar de un corpus en inglés, heredará los sesgos de este.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir predicciones incorrectas o inapropiadas al rellenar máscaras, especialmente en dominios especializados.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se atribuya adecuadamente. El autor de la conversión atribuye todo el crédito a dmis-lab. El repositorio original no incluye archivo NOTICE.
- Producción: el autor del repositorio no ofrece garantías sobre el modelo y no hay histórico de mantenimiento (creado y actualizado el mismo día). Conviene validar la fidelidad en el dominio propio antes de desplegar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pastel-labs/UltraBERT-380M-ONNX
- Modelo base (dmis-lab): https://huggingface.co/dmis-lab/UltraBERT-380M
- Transformers.js: https://huggingface.co/docs/transformers.js
- Documentacion de ONNX Runtime: https://onnxruntime.ai/docs/
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre el autor pastel-labs; los enlaces recuperados corresponden a resultados no relacionados con el proyecto (plataformas y articulos sobre el color pastel). No se han encontrado papers, blogs, repositorios adicionales ni demos asociados.
