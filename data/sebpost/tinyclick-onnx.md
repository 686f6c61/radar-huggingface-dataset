# sebpost/TinyClick-ONNX

## Resumen

TinyClick-ONNX es la exportacion a ONNX del modelo TinyClick, un agente GUI de un solo turno desarrollado originalmente por Samsung R&D Poland y presentado en Interspeech 2025. Dado un captura de pantalla y una instruccion en lenguaje natural como "open settings", el modelo devuelve las coordenadas del punto donde debe hacerse clic. Se construye sobre Florence-2-base de Microsoft y cuenta con 0,27 mil millones de parametros, lo que lo situa en la categoria de modelos ultraligeros.

La relevancia de esta version concreta reside en su formato: el autor (sebpost) ha convertido los pesos a ONNX y los ha cuantizado en el layout que espera transformers.js, de modo que el modelo puede ejecutarse integramente en el navegador mediante WASM o WebGPU, sin necesidad de servidor. Con la combinacion recomendada de cuantizaciones (vision encoder q8, embeddings q8, encoder q4 y decoder q4) el peso total ronda los 217 MB, y en telefonos puede bajar hasta unos 190 MB usando el vision encoder en q4.

El repositorio es independiente y no esta afiliado a Samsung. Los repositorios originales de Samsung ya no estan disponibles, por lo que esta exportacion parte del espejo con licencia MIT Krystianz/TinyClick (revision `0e1356f0b7cfb416099207121f6a766818ab8a66`). La licencia MIT se conserva tanto en los pesos como en los ficheros ONNX generados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder basado en Florence-2-base (vision encoder + encoder de texto + decoder) |
| Parametros totales | 0,27 mil millones (270 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, q8, q4 (segun componente) |
| Idiomas soportados | no disponible (las instrucciones del ejemplo estan en ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (layout transformers.js); el modelo base original en safetensors |
| Tamano del repo | 1,9 GB (incluye todas las variantes de cuantizacion) |
| Pipeline | image-text-to-text |
| Libreria | transformers.js |

Desglose de tamano por componente y cuantizacion:

| Componente | fp32 | fp16 | q8 | q4 |
|---|---|---|---|---|
| `vision_encoder` | 349 MB | 175 MB | 89 MB | 77 MB |
| `embed_tokens` | 150 MB | 75 MB | 38 MB | – |
| `encoder_model` | 165 MB | 83 MB | 42 MB | 29 MB |
| `decoder_model_merged` | 370 MB | – | 93 MB | 61 MB |

## Arquitectura y entrenamiento

TinyClick sigue la arquitectura de Florence-2-base: un encoder de vision que procesa la captura de pantalla, un encoder de texto para la instruccion y un decoder autorregresivo que genera la respuesta. La salida es una secuencia con el formato `click <loc_X><loc_Y>`, donde X e Y son coordenadas normalizadas en el rango 0-999 relativas al ancho y alto de la imagen. El modelo es de un solo turno: recibe una instruccion y una imagen y emite un unico punto de clic, sin mantener estado conversacional.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card unicamente indica que el modelo original fue publicado por Samsung R&D Poland y presentado en el paper arXiv:2410.11871 (Interspeech 2025). La innovacion tecnica destacable de esta ficha es la conversion a ONNX con cuantizacion por componente, que permite ejecucion en navegador y en dispositivos moviles con un peso inferior a 220 MB en la configuracion recomendada.

## Capacidades

- Localizacion de elementos de interfaz (UI grounding): identifica el punto de clic a partir de una instruccion en lenguaje natural y una captura de pantalla.
- Generacion de coordenadas normalizadas en el rango 0-999 mediante tokens especiales `<loc_X>` y `<loc_Y>`.
- Procesamiento de imagen y texto conjuntamente (image-text-to-text).
- Ejecucion en navegador mediante transformers.js con backend WASM o WebGPU.
- Ejecucion en dispositivos moviles con cuantizacion q4.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes multi-paso; el modelo es explicitamente de un solo turno.
- Capacidades multilingues: no disponibles; los ejemplos de la model card estan en ingles.
- No se documentan modos especiales como thinking, vision adicional o audio.

## Casos de uso

- Automatizacion de pruebas de interfaz: dado un screenshot de una aplicacion web o movil y una instruccion como "pulsa el boton de enviar", el modelo devuelve las coordenadas para que un runner de tests (Playwright, Selenium, Appium) ejecute el clic, reduciendo la dependencia de selectores fragiles.
- Asistentes de accesibilidad en navegador: integrado via transformers.js, puede ayudar a usuarios con dificultades motoras a localizar elementos en pantalla a partir de una orden en lenguaje natural, ejecutandose localmente sin enviar capturas a un servidor.
- Extension de navegador para automatizacion ligera: al correr en WebGPU o WASM, permite construir extensiones que resuelven tareas como "abre ajustes" o "cierra el dialogo" sin infraestructura backend.
- Agentes GUI en dispositivos moviles: con la cuantizacion q4 del vision encoder (unos 190 MB), puede desplegarse en telefonos para asistentes de automatizacion de tareas cotidianas dentro de apps.
- Generacion de datasets de grounding: util para etiquetar pares (captura, instruccion) con coordenadas de clic y construir corpus de entrenamiento para modelos mayores de agentes GUI.
- Prototipado rapido de flujos RPA: en entornos donde no se quiere desplegar un servidor de inferencia, el modelo permite validar la viabilidad de un flujo de automatizacion de escritorio o web antes de invertir en infraestructura.
- Demos interactivas en web: por su tamano reducido y su formato ONNX, es adecuado para demos publicas que se ejecutan en el cliente sin coste de GPU en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la configuracion q8/q4 recomendada (unos 217 MB de pesos); en fp32 el total ronda los 1,03 GB.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU para ejecucion en navegador; en servidor, GPU consumer como RTX 3060 o superiores son mas que suficientes por el tamano del modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en iGPU con WebGPU.
- Cabe en dispositivos moviles: si, con la configuracion q4 (unos 190 MB).
- Opciones de despliegue: transformers.js (WASM o WebGPU) es el objetivo principal; al ser ONNX, puede ejecutarse tambien con ONNX Runtime en servidor o en aplicaciones nativas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| TinyClick-ONNX (este) | 0,27 B | no disponible | ONNX (transformers.js) | MIT | GUI grounding de un solo turno, ejecucion en navegador |
| TinyClick (original, Krystianz/TinyClick) | 0,27 B | no disponible | safetensors | MIT | GUI grounding de un solo turno, inferencia en servidor |
| Florence-2-base (Microsoft) | 0,23 B | no disponible | safetensors | MIT | Vision-language generalista, base de TinyClick |
| Otros agentes GUI de gran tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los modelos directamente relacionados en la informacion disponible. No se dispone de datos de benchmarks que permitan comparar rendimiento entre alternativas.

## Limitaciones y advertencias

- Modelo de un solo turno: no mantiene contexto conversacional ni ejecuta razonamiento multi-paso; cada peticion es independiente.
- Salida restringida a un unico punto de clic: no devuelve acciones como escribir, arrastrar o hacer scroll.
- Idiomas soportados no documentados; los ejemplos y el prompt de la model card estan en ingles, por lo que el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion de coordenadas: si la instruccion no corresponde a ningun elemento visible, el modelo puede devolver un punto arbitrario sin senalar el error.
- Dependencia de la calidad de la captura: resolucion, escalado y elementos superpuestos pueden degradar la precision del grounding.
- La cuantizacion q4 puede introducir perdida de precision frente a fp32; no se han publicado metricas comparativas entre cuantizaciones.
- Licencia MIT: permite uso comercial, pero el repositorio es una exportacion independiente no afiliada a Samsung; conviene conservar el aviso de licencia.
- El modelo base original ya no esta disponible en los repositorios de Samsung; esta exportacion depende del espejo Krystianz/TinyClick, lo que supone un riesgo de mantenimiento a largo plazo.
- No se documentan sesgos especificos; al entrenarse sobre capturas de interfaz, puede heredar sesgos de los datasets de origen (no detallados).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sebpost/TinyClick-ONNX
- Modelo base (espejo): https://huggingface.co/Krystianz/TinyClick
- Paper TinyClick (arXiv): https://arxiv.org/abs/2410.11871
- Florence-2-base (Microsoft): https://huggingface.co/microsoft/Florence-2-base
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
- Receta de exportacion de Xenova para Florence-2: https://gist.github.com/xenova/d48921875c8178de1dd72443cfb6f7c8
