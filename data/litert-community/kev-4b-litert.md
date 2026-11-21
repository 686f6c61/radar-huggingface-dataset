# litert-community/Kev-4B-LiteRT

## Resumen

Kev-4B-LiteRT es la conversión al formato LiteRT (TFLite) del modelo de decisión Kev-4B, desarrollado originalmente por Jared Palmer sobre el backbone de Qwen3.5-4B-Base. A diferencia de un modelo generativo convencional, Kev no produce texto: recibe un estado (un texto libre) y un conjunto de preguntas tipadas sobre él (sí/no, elección múltiple y puntuación) y devuelve, para cada pregunta, una distribución de probabilidad sobre las opciones posibles. La arquitectura combina el transformer de Qwen3.5-4B con una cabeza de dos capas lineales adaptada mediante LoRA de rango 16, cuyos pesos se han plegado en el modelo final.

Este repositorio, mantenido por la comunidad litert-community, empaqueta el backbone en ocho ficheros LiteRT: seis grafos por filas de hasta 64, 128, 256, 512, 1.024 y 2.048 tokens, y dos pares de estado compartido para estados de hasta 128 y 256 tokens con preguntas de hasta 64 tokens. El objetivo es la inferencia on-device con aceleración por GPU (Metal en Apple Silicon) manteniendo fidelidad numérica respecto a la referencia en PyTorch fp32.

La relevancia actual radica en su enfoque: sustituir la generación de texto por clasificación estructurada con probabilidades calibradas, lo que reduce latencia y coste en tareas de enrutamiento, triaje o scoring. Con 720 descargas y un tamaño de repositorio de 85,8 GB, está pensado para entornos de escritorio con GPU, no para móviles de gama alta (no cupo en un Galaxy S26 de 12 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5-4B-Base con cabeza de puntero de dos capas lineales y LoRA rango 16 plegada; grafos LiteRT (Gated DeltaNet chunk kernel) |
| Parametros totales | 4B (backbone Qwen3.5-4B-Base) más cabeza de puntero; no se detalla el recuento exacto |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Filas de hasta 2.048 tokens (grafos L64, L128, L256, L512, L1024, L2048); pares de estado compartido Ls128 y Ls256 con preguntas de hasta 64 tokens |
| Tipos de cuantizacion | Los grafos se ejecutan en float32 (precisión usada en las pruebas); el modelo menciona estabilidad bajo almacenamiento float16; no se listan cuantizaciones int8/int4 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT/TFLite (8 grafos), más tokenizer, cabeza de puntero, host Python y scripts de conversión; existen conversiones a ONNX, GGUF y MLX en repos de terceros no verificados |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-4B-Base, un transformer denso de 4.000 millones de parámetros. Sobre los estados ocultos de ese backbone se aplica una cabeza de puntero compuesta por dos capas lineales, adaptada con un LoRA de rango 16 que posteriormente se pliega en los pesos del modelo final. La salida no es texto sino probabilidades sobre las opciones de cada pregunta tipada (noul para sí/no, choice para elección múltiple y score para puntuación ordinal). El formato de petición y respuesta sigue el esquema `/v1/systemone` del servidor del autor.

La conversión a LiteRT emplea un kernel Gated DeltaNet chunk que reduce el número de operadores (de 27.921 a 11.226 en el grafo L512 fp32) manteniendo las probabilidades dentro de 5,3e-6 respecto al grafo anterior en las 402 preguntas de prueba. Además, en Kev-4B las entradas de dos normas se escalan por potencias de dos, lo que en fp32 es numéricamente idéntico pero bajo float16 mantiene la suma de cuadrados de la norma final por debajo del máximo representable. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación estructurada de texto mediante preguntas tipadas: sí/no, elección múltiple y puntuación ordinal, con distribución de probabilidad por opción.
- No genera texto libre: devuelve únicamente etiquetas y probabilidades.
- Manejo de estados largos de hasta 2.048 tokens en los grafos por filas, y de hasta 256 tokens de estado con preguntas de hasta 64 tokens en los pares de estado compartido.
- Ejecución on-device con aceleración GPU (Metal en Apple M4 Max) y también en CPU para los grafos L1024 y los pares.
- Capacidad de procesar múltiples preguntas sobre un mismo estado de forma eficiente mediante los grafos de estado compartido (el estado se evalúa una vez y se reutiliza para cada pregunta).
- Soporte multilingüe limitado al inglés.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y devuelve la probabilidad de que corresponda a facturación, envíos, devoluciones o soporte técnico, además de detectar si se menciona una fecha límite y estimar el enfado del cliente, como muestra el ejemplo de la model card.
- Enrutamiento de correo entrante: clasificación por departamento con probabilidades calibradas para decidir cuándo derivar a revisión humana si la confianza es baja.
- Moderación de contenido: preguntas de sí/no y de puntuación sobre toxicidad o gravedad, con umbrales ajustables según la distribución de probabilidad.
- Encuestas y formularios abiertos: conversión de respuestas de texto libre en variables ordinales (satisfacción, intención de compra) mediante preguntas de tipo score.
- Análisis de reseñas de producto: extracción de si el cliente pide reembolso, si menciona un defecto concreto o si recomienda el producto, usando preguntas de elección múltiple.
- Automatización de calidad en atención al cliente: puntuación de la gravedad de cada interacción y detección de solicitudes de acción con plazo, para priorizar colas.
- Clasificación por lotes en local: al ejecutarse con LiteRT en GPU de escritorio, permite procesar lotes de documentos sin enviar datos a la nube, útil para sectores con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta métricas de fidelidad y latencia:

| Prueba | Resultado |
|---|---|
| Fidelidad frente a referencia fp32 PyTorch | Coincidencia en la opción más probable en las 401 preguntas de test (incluidas 9 casi empatadas); diferencia máxima de probabilidad 0,0152 |
| Latencia fila de 300 tokens en L512 (M4 Max GPU fp32) | 396,0-396,5 ms (frente a 464,4-464,7 ms de la versión anterior) |
| Latencia fila de 1.805 tokens en L2048 (M4 Max GPU fp32) | 1.705,4 ms (frente a 1.824,2 ms de la versión anterior) |
| Latencia fila de 80 tokens en L128 | 118,5 ms |
| Desviación del kernel Gated DeltaNet frente al grafo previo (402 preguntas) | ≤ 5,3e-6 en probabilidades |

## Requisitos de hardware

- VRAM estimada: los grafos L1024 y L64 ocupan 7,8 GB cada uno; el repositorio completo son 85,8 GB, por lo que se recomienda descargar solo los grafos necesarios.
- GPU recomendadas: Apple M4 Max (Metal, float32) es la plataforma validada. Para el resto de GPU no hay datos publicados.
- No cabe en un Galaxy S26 de 12 GB: en dos intentos el teléfono agotó memoria durante la compilación del grafo. Para móviles se recomienda el hermano Kev-0.8B-LiteRT.
- Despliegue: ai-edge-litert 2.2.0 con host Python (`host/kev_litert.py`); existen conversiones a ONNX, GGUF y MLX en repositorios de terceros no verificados por el autor.
- Latencia y throughput: ver tabla de benchmarks; las cifras corresponden a ejecución en GPU Metal en float32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-4B-LiteRT | 4B (backbone) | 2.048 tokens por fila; 256 tokens de estado en pares | Clasificación estructurada con probabilidades | apache-2.0 | LiteRT; ONNX, GGUF y MLX de terceros |
| Kev-0.8B-LiteRT | 0,8B | no disponible | Clasificación estructurada | no disponible en la información | LiteRT, validado en Galaxy S26 |
| Qwen3.5-4B-Base | 4B | no disponible | Generación de texto | no disponible en la información | Pesos base del backbone |
| Kev-4B (original, PyTorch) | 4B | no disponible | Clasificación estructurada | no disponible en la información | Referencia fp32 para validación |

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe documentado.
- No genera texto: cualquier caso de uso que requiera respuestas en lenguaje natural queda fuera de su alcance.
- El modelo solo se ha medido en escritorio (Apple M4 Max); no hay datos de rendimiento en otras GPU ni en móviles, y de hecho falló por memoria en un Galaxy S26 de 12 GB.
- El tamaño del repositorio (85,8 GB) obliga a descargar selectivamente los grafos; no se documenta un empaquetado reducido.
- Las conversiones a ONNX, GGUF y MLX son de terceros y no han sido verificadas por el autor.
- No se documentan sesgos conocidos ni tasas de alucinación, aunque al ser un clasificador las salidas son probabilidades y no texto libre; aun así, las confianzas bajas deben tratarse con umbrales y revisión humana.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-4B-Base y del modelo original jaredpalmer/kev-4b antes de producción.
- La información sobre datos de entrenamiento, composición del dataset y ajuste fino es escasa, lo que dificulta evaluar sesgos de dominio.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Kev-4B-LiteRT
- Modelo base: https://huggingface.co/jaredpalmer/kev-4b
- Backbone: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Hermano pequeño: https://huggingface.co/litert-community/Kev-0.8B-LiteRT
- Conversión ONNX: https://huggingface.co/midudev/kev-4b-ONNX
- Conversión GGUF: https://huggingface.co/ggml-org/Kev-4B-GGUF
- Conversión MLX: https://huggingface.co/RoderickQiu/kev-4b-mlx-8bit
- Repositorio del autor: https://github.com/jaredpalmer/kev
