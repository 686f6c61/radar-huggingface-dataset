# litert-community/d1-omni-600M-LiteRT

## Resumen

d1-omni-600M-LiteRT es una conversion al formato LiteRT (`.tflite`) del modelo LiquidAI/d1-omni-600M, un modelo de decision multimodal desarrollado por Liquid AI. A diferencia de un modelo generativo convencional, el d1-omni-600M no produce texto: recibe un estado (texto, imagen o audio) junto con un conjunto de preguntas nombradas y devuelve, para cada una, una respuesta leida directamente de la distribucion de probabilidad del modelo sobre las opciones definidas. Este repositorio, mantenido por la comunidad litert-community, empaqueta los grafos necesarios para ejecucion en dispositivo (edge) junto con un host de referencia en Python.

El modelo base parte del codificador LFM2.5-Encoder-350M de Liquid AI y anade entrada de audio, ademas de vision mediante una torre SigLIP2 y un proyector. Con aproximadamente 600 millones de parametros, esta pensado para decisiones de una sola pasada con latencia muy baja, lo que lo hace adecuado para escenarios de edge computing donde no es viable ejecutar un LLM generativo completo. La ventana de contexto se gestiona por buckets discretos de 128, 256, 512, 1.024, 2.048 y 4.096 posiciones.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo de decision multimodal (texto, imagen y voz) en hardware de consumo o embebido usando LiteRT, sin dependencia de PyTorch, con todas las pesas en fp16 y computo en float32. Soporta 15 idiomas y se distribuye bajo la licencia LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador multimodal basado en LFM2.5-Encoder-350M, con torre de vision SigLIP2 y encoder de audio; modelo de decision (no generativo) |
| Parametros totales | Aproximadamente 600M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Buckets de 128, 256, 512, 1.024, 2.048 y 4.096 posiciones |
| Tipos de cuantizacion | fp16 para pesos (computo en float32); no se documentan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh (15 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | LiteRT (`.tflite`); existe tambien una version GGUF en LiquidAI/d1-omni-600M-GGUF |

## Arquitectura y entrenamiento

El modelo base d1-omni-600M es un modelo de decision construido sobre la arquitectura LFM2.5, en concreto sobre el codificador LFM2.5-Encoder-350M, al que se anade soporte de audio. Se trata de un modelo multimodal que acepta tres modalidades de entrada: texto, imagen (mediante una torre de vision SigLIP2 seguida de un proyector) y audio (mediante un encoder dedicado con distintas variantes temporales). No es un transformer generativo autoregresivo al uso: el proveedor lo describe como "post-trained for single-pass decisions over text, images and speech", es decir, post-entrenado para emitir decisiones en una sola pasada.

En lugar de generar texto token a token, el modelo construye una fila de identificadores por pregunta siguiendo un formato con tokens reservados (`<|startoftext|>`, `<|reserved_7|>`, `<|reserved_8|>`, separadores por opcion y marcadores `<|mask|>`), y luego lee la distribucion de probabilidad del modelo en las posiciones de esos marcadores. Las preguntas pueden ser de tipo `noul` (si/no, utilidad logica) o de tipo `choice` con criterios nombrados. La conversion a LiteRT reescribe en forma segura para fp16 las capas de normalizacion que desbordan este formato, mantiene la tabla de embeddings en float32 en los grafos de decision y almacena todas las pesas de capas completamente conectadas en fp16, con computo en float32. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Decision multimodal de una sola pasada sobre texto, imagen y audio.
- Respuesta a preguntas nombradas con opciones discretas (clasificacion controlada).
- Preguntas de tipo logico (si/no) y de tipo eleccion entre criterios definidos por el usuario.
- Extraccion de distribuciones de probabilidad crudas mediante `model.probabilities()`, utiles para calibracion y umbrales.
- Entrada de vision mediante torre SigLIP2 con recorte unico por llamada.
- Entrada de audio con clips de hasta 5, 10, 20 o 30 segundos segun el encoder elegido.
- Soporte multilingue en 15 idiomas (en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh).
- Ejecucion en CPU mediante XNNPACK (4 hilos por defecto) o en acelerador (`accelerator="gpu"`).
- Interfaz de host de referencia en Python con CLI (`python -m host.d1_omni`).
- No dispone de generacion de texto libre, tool calling, function calling ni razonamiento multi-paso, ya que no es un modelo generativo.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una reclamacion, el modelo responde a preguntas como "el cliente pide un reembolso" (`noul`) y "que equipo debe gestionarlo" (eleccion entre billing, technical, fraud), leyendo las probabilidades para enrutar automaticamente.
- Moderacion de contenido en edge: clasificar mensajes o imagenes en categorias definidas sin necesidad de conexion a un servidor, gracias a la ejecucion en CPU con LiteRT.
- Clasificacion de imagenes en dispositivo: identificar animales u objetos en fotografias con la torre SigLIP2 y devolver la opcion con mayor probabilidad, como en el ejemplo `animal` de la model card.
- Analisis de notas de voz: transcribir la intencion de un audio de hasta 30 segundos respondiendo a preguntas de si/no, por ejemplo si el hablante pide que se haga algo.
- Enrutamiento de consultas en asistentes: decidir a que flujo o departamento va una consulta combinando texto e imagen dentro de un presupuesto de contexto de hasta 4.096 posiciones.
- Extraccion de etiquetas estructuradas: usar las distribuciones de probabilidad para poblar campos de formularios en pipelines de datos, aprovechando que la salida es determinista en opciones.
- Filtrado previo (pre-filtro) antes de un LLM mayor: descartar o priorizar casos con una decision rapida y barata antes de invocar un modelo generativo mas costoso.
- Verificacion local de modelos convertidos: los fixtures publicos y `host/verify.py` permiten validar la conversion comparando contra las probabilidades float32 del proveedor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para d1-omni-600M en la informacion disponible. La model card del repositorio LiteRT incluye un conjunto de verificacion publico (242 registros de texto, 5 de imagen y 6 de audio) con las probabilidades float32 del proveedor, y un criterio de aceptacion de la conversion: max |Δp| ≤ 0,02, media |Δp| ≤ 0,002, mismo argmax en todas las filas cuyo margen top-2 de referencia supere 0,02, y ningun valor no finito.

Los datos de latencia y de indice de decision encontrados en la busqueda web (48,57 en Decision Index 0.2.1 y 8 ms en RTX 4090) corresponden a d1-3B, no a d1-omni-600M, por lo que no se atribuyen a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el grafo de decision pesa aproximadamente 896 MB por bucket; la torre de vision 171,6 MB; el proyector 16,8 MB; y los encoders de audio entre 221 MB (5 s) y 243 MB (30 s). Solo se carga el grafo que use cada peticion.
- GPU recomendadas: no especificadas en la informacion disponible; el modelo esta disenado para ejecucion en CPU y aceleradores edge.
- Compatibilidad con GPU de consumo: no se documenta explicitamente, pero el tamano de cada grafo (menos de 1 GB en fp16) es compatible con GPU de consumo; se recomienda verificar con `verify.py --gpu`.
- Opciones de despliegue: LiteRT / TFLite (`ai-edge-litert`) para CPU (XNNPACK) y GPU; existe ademas una variante GGUF del modelo base para otros runners.
- Latencia y throughput estimados: no disponible.
- Entorno de referencia: Python con numpy, tokenizers, Pillow, soundfile y `ai-edge-litert`; no requiere PyTorch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-omni-600M-LiteRT | ~600M | 128 a 4.096 posiciones | Texto, imagen, audio | lfm1.0 | LiteRT en HF; GGUF del base |
| LiquidAI/d1-3B | 3.000M | No disponible | Texto e imagen | No disponible | HF; mayor latencia y Decision Index 0,2,1 de 48,57 segun la fuente web |
| LFM2.5-Encoder-350M | 350M | No disponible | Texto | No disponible | HF |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto libre: no sirve para tareas de generacion, resumen o dialogo abierto.
- La salida esta restringida a opciones predefinidas por el usuario; el diseno de las preguntas y criterios afecta directamente al resultado.
- La ventana de contexto es limitada a 4.096 posiciones; una fila mas larga lanza error salvo que se use `truncate_state=True`.
- No se documentan sesgos especificos, riesgo de alucinacion ni limitaciones por idioma mas alla de la lista de 15 idiomas soportados.
- La licencia LFM Open License v1.0 impone condiciones de uso; es responsabilidad del usuario revisar el texto de la licencia antes de un uso comercial.
- El repositorio ocupa 6,5 GB en total, aunque solo es necesario descargar los grafos que se vayan a usar.
- Esta version es una conversion de la comunidad (litert-community), no una publicacion oficial del proveedor; la model card del repositorio original (LiquidAI/d1-omni-600M) debe consultarse para detalles canonicos.
- Los resultados de verificacion dependen del backend (CPU o GPU) y deben comprobarse en cada maquina con `host/verify.py`.

## Enlaces

- Repositorio LiteRT en HuggingFace: https://huggingface.co/litert-community/d1-omni-600M-LiteRT
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/d1-omni-600M
- Version GGUF del modelo base: https://huggingface.co/LiquidAI/d1-omni-600M-GGUF
- Perfil de litert-community en HuggingFace: https://huggingface.co/litert-community
- Paper referenciado en el modelo base (arxiv): arxiv:2511.23404
- Analisis local del modelo: https://www.mindstudio.ai/blog/d1-omni-600m-locally
- Noticia de lanzamiento de d1-3B y d1-omni-600M: https://www.aitoolsoasis.com/en/news/liquid-ai-launches-d1-3b-and-d1-omni-600m-multimodal-1791432058865
- Cobertura del lanzamiento: https://hellomarvisaitoday.com/articles/540535d7-7a57-4619-8075-4d3834b9aa26
