# hidan616/hermes-spam-filter

## Resumen

Hermes Spam Filter es un clasificador de texto binario (spam frente a ham) desarrollado por el usuario hidan616 y publicado en Hugging Face con licencia Apache 2.0. Está construido desde cero con PyTorch y un tokenizador BPE personalizado, y está diseñado para tareas de detección de spam, phishing y mensajes fraudulentos en entornos de alto rendimiento y baja latencia. Su arquitectura es un transformer encoder compacto con 1,74 millones de parámetros, una dimensión de embedding de 128, 4 cabezas de atención y 2 capas de encoder, con una longitud máxima de secuencia de 512 tokens.

El modelo resuelve el problema de clasificación binaria de mensajes de texto, con aplicaciones concretas en filtrado de SMS, moderación de chats y verificación de correos transaccionales. Su relevancia radica en su ligereza: al tener menos de dos millones de parámetros, puede ejecutarse en CPU y en dispositivos con recursos limitados, lo que lo hace adecuado para pipelines de procesamiento en tiempo real. No se dispone de información sobre el dataset de entrenamiento ni sobre los resultados de benchmarks, por lo que su rendimiento cuantitativo no ha sido verificado de forma pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (2 capas, 4 cabezas, d_model=128) |
| Parametros totales | 1.742.465 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors y checkpoint .pt) |
| Idiomas soportados | no disponible (probablemente ingles, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch .pt |

## Arquitectura y entrenamiento

El modelo es un transformer encoder clasico pero de tamano reducido: embedding de 128 dimensiones, 4 cabezas de atencion y 2 capas encoder. El tokenizador es un BPE personalizado, entrenado presumiblemente sobre el corpus de entrenamiento, aunque no se especifica su vocabulario ni su procedencia. La salida es una probabilidad binaria (spam o ham) obtenida tras una capa de clasificacion sobre el token [CLS] o equivalente.

No se ha publicado informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Al ser un modelo entrenado desde cero y no un fine-tuning de un modelo preentrenado grande, su capacidad esta limitada por el tamano del corpus y la arquitectura. No se mencionan innovaciones tecnicas destacables mas alla de la implementacion propia del transformer.

## Capacidades

- Clasificacion binaria de texto: distingue entre mensajes spam y legitimos (ham).
- Deteccion de phishing y mensajes fraudulentos, segun la descripcion del autor.
- Moderacion de chats: puede clasificar mensajes de usuarios en tiempo real.
- Verificacion de correos transaccionales: identifica si un email es spam o legitimo.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para SMS y mensajes cortos.
- Inferencia de baja latencia gracias a su tamano reducido, apta para entornos con recursos limitados.

No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales. Tampoco se ha confirmado su comportamiento multilingue, aunque al usar un tokenizador BPE podria procesar texto en varios idiomas si el entrenamiento lo incluyera.

## Casos de uso

- Filtrado de SMS en aplicaciones moviles: el modelo puede integrarse en una app para clasificar mensajes entrantes y marcar como spam los sospechosos. Su tamano permite ejecutarlo en el dispositivo sin depender de la nube.
- Moderacion de comentarios en foros o redes sociales: se puede usar como un primer filtro para detectar mensajes no deseados o enlaces fraudulentos antes de la revision humana.
- Verificacion de correos transaccionales en servicios de email: ayuda a separar notificaciones legitimas de intentos de phishing, reduciendo falsos positivos en sistemas de correo.
- Deteccion de mensajes fraudulentos en plataformas de mensajeria: util para chatbots o sistemas de soporte que necesitan identificar intentos de estafa en conversaciones de usuarios.
- Clasificacion de tickets de soporte: puede etiquetar automaticamente los tickets que contienen contenido spam o phishing, priorizando los legitimos para el equipo humano.
- Preprocesamiento en pipelines de NLP: como filtro inicial para limpiar datasets de texto, eliminando mensajes no deseados antes de entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de exactitud, precision, recall ni comparaciones con otros modelos de clasificacion de spam. El autor no proporciona metricas en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en FP32 (1,74M parametros × 4 bytes ≈ 7 MB de pesos, mas activaciones). Cabe en cualquier GPU moderna y tambien en CPU.
- GPU recomendadas: no se requiere GPU; una CPU moderna es suficiente. Si se usa GPU, cualquier modelo con al menos 2 GB de VRAM es mas que suficiente.
- Compatibilidad con consumer GPU: si, incluso en Raspberry Pi o dispositivos embebidos con suficiente RAM.
- Opciones de despliegue: se puede servir con PyTorch nativo, ONNX Runtime, TorchScript o mediante frameworks de inferencia como vLLM (aunque es excesivo para este tamano). Tambien es posible exportarlo a formato GGUF para usarlo con llama.cpp, aunque no se ha publicado dicha conversion.
- Latencia y throughput: no se han publicado mediciones, pero por su tamano se espera una latencia de milisegundos en CPU y un throughput de miles de inferencias por segundo en GPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos en la misma categoria (clasificadores de spam basados en transformers de tamano reducido). Existen alternativas clasicas como Naive Bayes con TF-IDF, pero no son directamente comparables en arquitectura. Tampoco se han encontrado otros modelos de spam en Hugging Face con caracteristicas similares en la busqueda realizada. Por tanto, no se ofrece tabla comparativa.

## Limitaciones y advertencias

- Tamano reducido: al tener solo 1,74M de parametros, su capacidad de generalizacion es limitada frente a modelos mas grandes. Puede fallar en mensajes complejos o con vocabulario poco frecuente.
- Sesgos desconocidos: al no publicarse el dataset de entrenamiento, no se puede evaluar si existen sesgos de idioma, cultura o contenido. El modelo podria comportarse de forma desigual con ciertos tipos de mensajes.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero puede producir falsos positivos o negativos en la clasificacion. No hay datos de su tasa de error.
- Limitaciones de idioma: no se especifican los idiomas soportados. Si el entrenamiento fue solo en ingles, su rendimiento en otros idiomas sera pobre o nulo.
- Longitud de contexto fija: 512 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sin garantias de produccion: al no haber benchmarks publicos, no se recomienda su uso en entornos criticos sin una evaluacion previa exhaustiva.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece soporte ni actualizaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hidan616/hermes-spam-filter
- Resultados de busqueda web (sin enlaces adicionales relevantes al modelo concreto, solo paginas generales de Hugging Face y articulos no relacionados).
