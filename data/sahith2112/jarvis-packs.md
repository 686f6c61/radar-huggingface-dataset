# Sahith2112/jarvis-packs

## Resumen

Jarvis packs es un repositorio de artefactos auxiliares para Jarvis, un asistente personal que se ejecuta en el propio dispositivo (on-device) y que descarga sus componentes a un telefono tras una comprobacion inicial del terminal. No se trata de un modelo de lenguaje completo, sino de un paquete que contiene una cabeza lineal (linear head) entrenada sobre los vectores de EmbeddingGemma-300M para clasificar mensajes entrantes (adeudos, facturas, codigos OTP, etc.), junto con referencias a los modelos abiertos que el asistente obtiene de sus repositorios originales.

El contenido propio del repositorio se limita a un unico fichero JSON de pesos de la cabeza de clasificacion, con licencia MIT y checksum publicado. El resto de la ficha describe los modelos que el paquete referencia y descarga (Gemma 4 E2B-it y E4B-it en cuantizacion QAT q4_0 con proyector de vision, y EmbeddingGemma-300M en Q8_0), ya que son los que determinan las capacidades reales del sistema.

La relevancia de este paquete radica en su enfoque de despliegue: un asistente personal que corre integramente en el telefono, con modelos cuantizados de 2B y 4B parametros, proyector de vision y una capa de clasificacion de mensajes entrenada especificamente. La informacion publicada es muy escasa y no incluye arquitectura, contexto ni datos de entrenamiento de la cabeza lineal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza lineal sobre vectores de EmbeddingGemma-300M (modelo base: no disponible) |
| Parametros totales | No disponible para la cabeza; modelos referenciados: Gemma 4 E2B-it (2B) y E4B-it (4B), EmbeddingGemma-300M (300M) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cabeza: Q8_0 sobre vectores; modelos referenciados: QAT q4_0 (Gemma 4) y Q8_0 (EmbeddingGemma) |
| Idiomas soportados | No disponible |
| Licencia | MIT (cabeza); Apache 2.0 (Gemma 4 E2B/E4B); Gemma Terms of Use (EmbeddingGemma) |
| Formato de pesos | JSON (cabeza lineal); GGUF (modelos referenciados) |

## Arquitectura y entrenamiento

El unico componente entrenado por el autor es una cabeza lineal que opera sobre los embeddings de EmbeddingGemma-300M y predice la categoria de un mensaje recibido (adeudo, factura, OTP, etc.). La model card indica que se entreno en el laboratorio Jarvis y publica el sha256 del fichero (`e076cd3eff5c8acc629c6dd579effd9eac515b23448d4d6918afc23524dcde2a`), pero no detalla el conjunto de datos, el numero de ejemplos, el regimen de entrenamiento ni las metricas de evaluacion.

El resto del sistema se apoya en modelos de Google: Gemma 4 E2B-it y E4B-it en cuantizacion QAT q4_0 con su proyector de vision, y EmbeddingGemma-300M en Q8_0. La model card indica que estos modelos se descargan desde sus repositorios originales, fijados por commit y checksum, lo que garantiza la reproducibilidad del despliegue. No se proporciona informacion sobre la arquitectura interna de Gemma 4 ni sobre el proceso de entrenamiento de la cabeza lineal (funcion de perdida, regularizacion, validacion cruzada).

## Capacidades

- Clasificacion de mensajes entrantes en categorias como adeudos, facturas y codigos OTP, mediante la cabeza lineal sobre embeddings.
- Generacion de texto y razonamiento a traves de Gemma 4 E2B-it y E4B-it (capacidades del modelo base: no detalladas en la informacion disponible).
- Procesamiento de vision gracias al proyector de vision incluido con los modelos Gemma 4.
- Busqueda semantica y representacion de texto mediante EmbeddingGemma-300M.
- Ejecucion integramente en el dispositivo (on-device), sin dependencia de servicios en la nube para la inferencia.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Filtrado y clasificacion de notificaciones en el telefono: la cabeza lineal sobre EmbeddingGemma-300M etiqueta cada mensaje entrante (adeudo, factura, OTP) para que el asistente decida si interrumpir al usuario o archivarlo, con inferencia local y sin enviar el contenido a un servidor.
- Deteccion de codigos de un solo uso: al clasificar un mensaje como OTP, el asistente puede extraer y autocompletar el codigo en la aplicacion correspondiente, reduciendo la friccion en el inicio de sesion.
- Gestion de pagos y recordatorios: los mensajes clasificados como adeudo o factura pueden alimentar un flujo de recordatorios o de previsualizacion de importes, usando el modelo generativo local para resumir el contenido.
- Asistente conversacional offline: Gemma 4 E2B-it en q4_0 permite mantener conversaciones multi-turno en el dispositivo sin conexion, adecuado para consultas personales y tareas cotidianas.
- Descripcion de imagenes y accesibilidad: el proyector de vision de Gemma 4 E2B/E4B permite describir fotos o capturas de pantalla localmente, util para usuarios con discapacidad visual o para etiquetar contenido antes de compartirlo.
- Busqueda semantica en el dispositivo: EmbeddingGemma-300M en Q8_0 indexa notas, mensajes y documentos del telefono para recuperacion por similitud semantica sin salir del terminal.
- Enrutamiento de consultas entre modelos: el asistente puede usar el modelo de 2B para tareas rapidas y el de 4B para tareas que requieran mayor calidad, segun la clasificacion previa del mensaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Gemma 4 E2B-it en q4_0: aproximadamente 2-3 GB, incluyendo el proyector de vision (estimacion orientativa; no confirmada en la informacion disponible).
- VRAM estimada para Gemma 4 E4B-it en q4_0: aproximadamente 3-5 GB (estimacion orientativa; no confirmada en la informacion disponible).
- EmbeddingGemma-300M en Q8_0: aproximadamente 300-400 MB.
- Cabeza lineal en JSON: despreciable frente a los modelos anteriores.
- GPU de escritorio recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090; en centro de datos, A100 o H100 para servir varias instancias.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas para el modelo de 2B y con 6-8 GB para el de 4B.
- Despliegue movil: el paquete esta disenado para ejecutarse en un telefono, lo que implica que los modelos q4_0 deben caber en la memoria unificada del dispositivo; no se especifican los terminales soportados.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF; vLLM o TGI para servir los modelos en servidor; el formato JSON de la cabeza requiere un runtime propio o integracion en la aplicacion Jarvis.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jarvis packs (Gemma 4 E2B-it q4_0) | 2B | No disponible | QAT q4_0 | Apache 2.0 | Hugging Face |
| Jarvis packs (Gemma 4 E4B-it q4_0) | 4B | No disponible | QAT q4_0 | Apache 2.0 | Hugging Face |
| EmbeddingGemma-300M | 300M | No disponible | Q8_0 | Gemma Terms of Use | Hugging Face, ggml-org |
| Cabeza lineal Jarvis | No disponible | No disponible | JSON | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La informacion publicada es minima: no hay datos de arquitectura, contexto, idiomas, dataset de entrenamiento ni evaluacion de la cabeza lineal.
- La cabeza lineal solo cubre las categorias para las que fue entrenada; mensajes fuera de esas categorias pueden clasificarse de forma incorrecta y no se documenta el comportamiento ante clases desconocidas.
- Riesgo de alucinacion en las respuestas generadas por Gemma 4 E2B/E4B, especialmente en tareas factuales o en resumenes de mensajes financieros.
- El uso comercial de EmbeddingGemma-300M esta sujeto a los Gemma Terms of Use, distintos de la licencia MIT del paquete; es necesario revisar ambas licencias antes de desplegar.
- El paquete depende de la descarga de modelos de terceros fijados por commit y checksum; cualquier cambio en esos repositorios puede romper la reproducibilidad si no se verifica el checksum.
- No se documentan sesgos conocidos ni el comportamiento del sistema en idiomas distintos del que se uso para entrenar la cabeza.
- El despliegue on-device impone restricciones de memoria y bateria que no se cuantifican en la model card.
- La fecha de creacion del repositorio (2026-11-09) y el nombre de los modelos referenciados (Gemma 4) no se pueden verificar con la informacion disponible.

## Enlaces

- Repositorio principal: https://huggingface.co/Sahith2112/jarvis-packs
- Gemma 4 E2B-it qat q4_0 GGUF: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- Gemma 4 E4B-it qat q4_0 GGUF: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf
- EmbeddingGemma-300M GGUF: https://huggingface.co/ggml-org/embeddinggemma-300M-GGUF
- EmbeddingGemma-300M original: https://huggingface.co/google/embeddinggemma-300m
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
