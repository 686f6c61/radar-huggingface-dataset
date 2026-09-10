# alcofighter/rubert_phish

## Resumen

`alcofighter/rubert_phish` es un modelo de clasificación de texto publicado en HuggingFace por el usuario alcofighter. El identificador y las etiquetas del repositorio (`bert`, `text-classification`) apuntan a un encoder tipo BERT ajustado para una tarea de clasificación binaria o multiclase, presumiblemente detección de phishing, si bien la model card no confirma la tarea concreta. El repositorio no incluye documentación elaborada: la model card es la plantilla autogenerada de HuggingFace con todos los campos marcados como "[More Information Needed]".

El dato técnico verificable es el recuento de parámetros almacenado en los pesos safetensors: 29.194.394 parámetros, con un tamaño de repositorio de 0,1 GB. Esta cifra es notablemente inferior a los 110 millones de parámetros de BERT-base, lo que sitúa al modelo en la franja de encoders compactos y sugiere una arquitectura reducida (menos capas o menor dimensión oculta) o un vocabulario de menor tamaño, aunque no hay información publicada que lo confirme.

Su relevancia práctica es limitada en el estado actual: cero descargas, cero "likes", licencia no declarada y ausencia total de benchmarks. Puede resultar útil como punto de partida para experimentación con clasificación de texto en ruso, pero no debería integrarse en producción sin una validación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer bidireccional); confirmado por la etiqueta `bert`, sin detalle de capas ni dimensiones |
| Parametros totales | 29.194.394 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prefijo "ru" del identificador sugiere ruso, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-classification |
| Tamano del repositorio | 0,1 GB |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La unica informacion estructural disponible proviene de las etiquetas del repositorio, que declaran la arquitectura BERT y la tarea de clasificacion de texto. Se trata, por tanto, de un encoder transformer bidireccional con una cabeza de clasificacion sobre el token `[CLS]`, el patron habitual en tareas de deteccion de spam, phishing o analisis de sentimiento. No se especifica el numero de capas, el numero de cabezas de atencion, la dimension oculta ni el tamano del vocabulario.

No hay informacion sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset, la existencia de ajuste fino supervisado, ni el uso de tecnicas como RLHF o DPO. Tampoco se documentan hiperparametros, regimen de precision (fp32, fp16, bf16) ni infraestructura de computo. La unica referencia presente en la model card es la cita a Lacoste et al. (2019), que forma parte de la plantilla autogenerada para el calculo de emisiones de carbono y no describe el entrenamiento del modelo.

## Capacidades

- Clasificacion de texto: el pipeline declarado es `text-classification`, lo que implica salida de etiquetas con probabilidad asociada.
- Deteccion de phishing: el sufijo `_phish` del identificador sugiere esta finalidad, aunque la tarea exacta (texto de correo, URL, cuerpo de mensaje) no esta documentada.
- Codificacion de texto reutilizable: al ser un encoder BERT, las representaciones internas pueden emplearse como embeddings para otras tareas, sujeto a validacion.
- Inferencia en CPU: el tamano de 29,2 millones de parametros permite ejecucion en CPU sin requisitos de GPU.
- Compatible con Text Embeddings Inference y con endpoints gestionados de HuggingFace, segun las etiquetas del repositorio.
- Generacion de texto: no soportada, es un modelo exclusivamente de encoding.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Filtrado de correo entrante en una pasarela de correo corporativa: el modelo se aplicaria como clasificador de segunda etapa sobre el asunto y el cuerpo del mensaje, marcando candidatos a phishing para revision. Requiere validacion previa con datos propios, dado que no hay metricas publicadas.
- Deteccion de SMS fraudulentos (smishing): integrado en el backend de un operador o de una aplicacion de mensajeria, con inferencia en CPU gracias al reducido tamano del modelo.
- Extension de navegador para alertas en tiempo real: 29,2 millones de parametros permiten empaquetar el modelo en un servicio ligero o incluso ejecutarlo en local con cuantizacion a int8 (unos 29 MB), sin enviar el contenido de la pagina a un tercero.
- Triaje en un SOC o en una plataforma antifraude: uso del clasificador como primera capa de puntuacion sobre tickets, notificaciones o informes de usuario, derivando los casos con mayor probabilidad a analistas humanos.
- Moderacion de contenido generado por usuarios: clasificacion de publicaciones o mensajes sospechosos de ser intentos de ingenieria social en foros, marketplaces o comunidades.
- Enriquecimiento de alertas en un SIEM: incorporar la puntuacion del modelo como campo adicional en alertas de seguridad para priorizar la cola de investigacion.
- Etiquetado asistido de datasets: preanotacion de grandes volumenes de texto para que anotadores humanos revisen, reduciendo el coste de construccion de corpus antifraude propios.
- Investigacion academica sobre deteccion de phishing en ruso: si se confirma el idioma, serviria como linea base ligera comparable frente a modelos multilingues de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada, y el repositorio no presenta resultados de exactitud, precision, recall, F1, AUC ni comparaciones con otros clasificadores.

## Requisitos de hardware

- Peso en memoria de los pesos (solo parametros, sin overhead de runtime): aproximadamente 117 MB en fp32, 58 MB en fp16/bf16, 29 MB en int8 y 15 MB en int4.
- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision habitual; en la practica el modelo cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: no se requiere GPU. Cualquier GPU moderna (RTX 3060, RTX 4090, T4, L4, A100, H100) puede servirlo, pero resulta sobredimensionada para este tamano.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos de borde, dado que el modelo completo ocupa decenas de megabytes.
- Inferencia en CPU: totalmente viable, con un throughput de cientos o miles de secuencias cortas por segundo en un core moderno con batch pequeno.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (etiqueta explicita del repositorio), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), ONNX Runtime y, si se convierte el checkpoint, llama.cpp u Ollama no aplican por tratarse de un encoder de clasificacion; FastAPI o TorchServe como envoltorio de servicio.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

No se dispone de modelos comparables directos de deteccion de phishing con datos publicos en la informacion proporcionada. La tabla siguiente usa encoders genericos de la familia BERT como referencia de tamano y licencia, advirtiendo de que no son clasificadores de phishing y que sus cifras corresponden a datos publicos ampliamente conocidos, no a mediciones sobre esta tarea.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| alcofighter/rubert_phish | 29,2 M | no disponible | no disponible | HuggingFace | Modelo a evaluar; sin benchmarks ni documentacion |
| bert-base-uncased | 110 M | 512 | Apache 2.0 | HuggingFace | Encoder base generico, no clasificador de phishing |
| distilbert-base-uncased | 66 M | 512 | Apache 2.0 | HuggingFace | Version destilada, tamano mas cercano al modelo analizado |
| xlm-roberta-base | 278 M | 512 | MIT | HuggingFace | Alternativa multilingue si el idioma de destino no es el ruso |

## Limitaciones y advertencias

- Model card autogenerada: todos los campos de documentacion estan sin cumplimentar, incluidos desarrollador, datos de entrenamiento, evaluacion y uso previsto.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Ausencia de benchmarks: no existe ninguna metrica publicada de precision, recall o F1, por lo que el rendimiento real del clasificador es desconocido.
- Riesgo de falsos positivos y falsos negativos: en deteccion de phishing, un falso negativo implica exposicion a fraude y un falso positivo puede bloquear comunicaciones legitimas; sin curvas de evaluacion no es posible dimensionar ese riesgo.
- Idiomas no declarados: el prefijo "ru" del identificador sugiere ruso, pero no hay confirmacion; usar el modelo con otro idioma produciria resultados poco fiables.
- Tokenizador no verificado: no se documenta que tokenizador acompana al checkpoint ni si el vocabulario es especifico para ruso.
- Longitud de contexto desconocida: si el entrenamiento se hizo con secuencias cortas, el modelo podria degradarse con textos largos, algo relevante si se aplica al cuerpo completo de un correo.
- Adopcion nula: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Sesgo de dominio desconocido: al no documentarse la procedencia de los datos, se desconoce si el modelo generaliza a distintos sectores, registros o variantes de ataque.
- Riesgo de envenenamiento o datos sesgados en el corpus original, imposible de auditar con la informacion disponible.
- Sin garantias de mantenimiento: el autor no ha publicado informacion de contacto ni hoja de ruta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alcofighter/rubert_phish
- Paper citado en la plantilla de la model card (Lacoste et al., 2019, sobre estimacion de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental referenciada en la plantilla: https://mlco2.github.io/impact
- No se han encontrado en la busqueda web enlaces adicionales relevantes al modelo, a su paper, a su dataset de entrenamiento, a demos ni a repositorios de codigo asociados.
