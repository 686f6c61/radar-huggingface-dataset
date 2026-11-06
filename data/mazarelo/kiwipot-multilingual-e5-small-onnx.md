# mazarelo/kiwipot-multilingual-e5-small-onnx

## Resumen

`kiwipot-multilingual-e5-small-onnx` es una réplica del modelo de embeddings `intfloat/multilingual-e5-small` convertido a formato ONNX para su uso con transformers.js. Lo publica el autor `mazarelo` como copia de los ficheros que la aplicación Kiwipot descarga para implementar búsqueda semántica de notas en el dispositivo. El modelo original es un transformer tipo BERT de la familia E5, diseñado para generar embeddings de frases y documentos en múltiples idiomas.

La relevancia de esta ficha es limitada: no se trata de un modelo nuevo ni de un ajuste fino, sino de una redistribución de bytes idénticos a los del repositorio `Xenova/multilingual-e5-small` en el commit `761b726dd34fb83930e26aab4e9ac3899aa1fa78`. El autor lo mantiene en su propia cuenta para que las descargas de la aplicación no dependan de la permanencia de otro repositorio.

El modelo resuelve la tarea de `feature-extraction` (generación de embeddings) y está pensado para ejecutarse en el procesador del dispositivo, sin enviar datos a servidores externos. El repositorio ocupa 0,1 GB e incluye el peso cuantizado a 8 bits (`onnx/model_quantized.onnx`) junto con los ficheros de configuración, tokenizador y tokens especiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (modelo base: intfloat/multilingual-e5-small) |
| Parametros totales | no disponible (el modelo base E5-small ronda los 118 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado a 8 bits (`onnx/model_quantized.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo base `intfloat/multilingual-e5-small` es un encoder transformer de la familia BERT orientado a la generación de embeddings de texto para recuperación y similitud semántica. La variante publicada aquí no introduce cambios en la arquitectura ni en los pesos: es una exportación a ONNX del modelo original, cuantizada a 8 bits para reducir el tamaño y facilitar la inferencia en el dispositivo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta réplica no los detalla y solo remite al modelo original. La innovación técnica de esta publicación es la distribución: empaquetar el modelo en ONNX para ejecutarlo con transformers.js en el procesador local, sin dependencia de servicios externos.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y similitud entre frases o documentos.
- Recuperación de notas por significado, que es el caso de uso declarado por la aplicación Kiwipot.
- Ejecución en el dispositivo mediante transformers.js, sin enviar datos a servidores externos.
- Soporte multilingüe heredado del modelo base (el alcance exacto de idiomas no está detallado en la información disponible).
- Tarea de `feature-extraction`: no genera texto, no razona y no ejecuta tool calling ni funciones de agente.

## Casos de uso

- Búsqueda semántica de notas personales: la aplicación Kiwipot usa el modelo para indexar notas y recuperarlas por significado en lugar de por coincidencia exacta de palabras, ejecutando la inferencia en el procesador del dispositivo.
- Indexación local de documentos: un desarrollador puede generar embeddings de ficheros de texto en el navegador con transformers.js y almacenarlos para búsquedas posteriores sin enviar contenido a la nube.
- Clasificación y agrupamiento de textos cortos: los embeddings permiten agrupar mensajes o entradas por similitud semántica en aplicaciones de escritorio o web.
- Deduplicación de contenido: comparar embeddings de registros para detectar entradas duplicadas o casi duplicadas en una base de datos local.
- Filtrado de relevancia en asistentes locales: usar la similitud entre la consulta del usuario y un conjunto de fragmentos para seleccionar el contexto que se pasará a un modelo generativo.
- Prototipado de sistemas RAG sin infraestructura: al ejecutarse con transformers.js y pesar 0,1 GB, permite montar un recuperador básico en el navegador o en Node.js sin GPU ni servidor dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario previsto; el modelo está pensado para ejecutarse en CPU mediante ONNX y transformers.js.
- GPU recomendadas: no se especifican; al ser un modelo pequeño cuantizado a 8 bits, no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo con unos pocos cientos de MB de memoria, aunque no se proporcionan cifras oficiales.
- Opciones de despliegue: transformers.js (librería declarada); al ser ONNX, también podría ejecutarse con otros runtimes compatibles con ONNX, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| kiwipot-multilingual-e5-small-onnx | no disponible | no disponible | feature-extraction | MIT | ONNX (8 bits) |
| intfloat/multilingual-e5-small | no disponible | no disponible | feature-extraction | MIT | safetensors (original) |
| Xenova/multilingual-e5-small | no disponible | no disponible | feature-extraction | MIT | ONNX (transformers.js) |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de rendimiento ni especificaciones de alternativas de otros autores. Esta réplica es byte a byte idéntica a `Xenova/multilingual-e5-small` en el commit indicado.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings y no puede responder preguntas ni mantener conversaciones.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones de idioma en la información proporcionada.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base `intfloat/multilingual-e5-small` antes de redistribuirlo en producción.
- El repositorio tiene un uso muy bajo (43 descargas, 0 likes) y fue creado recientemente; no hay evidencia de validación independiente.
- Al ser una copia de otro repositorio, las actualizaciones del modelo original no se reflejarán automáticamente en esta publicación.
- La cuantización a 8 bits puede introducir una pérdida de precisión en los embeddings respecto al modelo original en safetensors; no se han publicado métricas que cuantifiquen esa diferencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mazarelo/kiwipot-multilingual-e5-small-onnx
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Réplica de referencia en transformers.js: https://huggingface.co/Xenova/multilingual-e5-small
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Aplicación Kiwipot: https://kiwipot.com
