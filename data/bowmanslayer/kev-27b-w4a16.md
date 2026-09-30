# bowmanslayer/kev-27b-W4A16

## Resumen

kev-27b-W4A16 es una cuantizacion comunitaria del adaptador jaredpalmer/kev-27b, publicada por el usuario bowmanslayer. No es un modelo generativo de chat: Kev es un modelo de decision que recibe un estado textual y un conjunto de opciones y devuelve una puntuacion (probabilidad) para cada opcion mediante una cabeza pointer. Esta variante aplica cuantizacion INT4 de pesos con activaciones en 16 bits (W4A16) sobre el backbone fusionado, empleando AutoRound 0.12.3 con empaquetado `auto_gptq`.

El modelo parte del backbone de Qwen/Qwen3.8-27B, que segun la model card usa la arquitectura de texto Qwen3.5. El repositorio incluye el backbone cuantizado fusionado, el tokenizer y la cabeza de decision original sin modificar. La relevancia de esta publicacion es limitada: no se han publicado evaluaciones de calidad de decision, latencia ni compatibilidad de despliegue, y el propio autor advierte de que se trata de una conversion experimental.

La ficha de HuggingFace reporta 4.552.318.464 parametros (unos 4,55 mil millones) segun los tensores safetensors, una cifra que no concuerda con la denominacion "27B" del nombre y del modelo base. Se reproduce el dato tal cual aparece, con la discrepancia senalada como caveat en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto basado en la arquitectura Qwen3.5 (via Qwen3.8-27B); backbone fusionado con cabeza pointer de decision |
| Parametros totales | 4.552.318.464 (dato de safetensors; no concuerda con la denominacion 27B) |
| Longitud de contexto | No disponible. La llamada de ejemplo usa `max_state=2048` y `max_branch=3072` (limites de codificacion de estado y ramas de opciones, no ventana de contexto declarada) |
| Tipos de cuantizacion | INT4 W4A16, simetrica, grupo de 128, empaquetado `auto_round:auto_gptq`. Proyecciones hibridas pequenas se mantienen en 16 bits. Activaciones y pesos retenidos en BF16; cabeza pointer en FP32 |
| Idiomas soportados | No disponible. La calibracion incluyo 64 filas sinteticas en chino ademas de 192 filas publicas de calibracion de Kev |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (backbone cuantizado) + `.pt` (cabeza original, leida con `weights_only=True`); incluye `release.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El backbone corresponde a la arquitectura de texto Qwen3.5 empleada por Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). Sobre ese backbone, jaredpalmer/kev-27b (revision `01b81998019be550f0ae858727df49bac9511195`) anade una cabeza pointer que selecciona y puntua opciones suministradas; no se trata de un cabezal de generacion de lenguaje. La model card indica expresamente que no debe volverse a aplicar el LoRA original sobre esta conversion.

La cuantizacion se realizo con AutoRound 0.12.3 en modo W4A16 simetrico con tamano de grupo 128 y empaquetado `auto_gptq`. La calibracion uso 256 filas (192 filas publicas de calibracion de Kev y 64 filas sinteticas independientes en chino), longitud de secuencia 512, 200 iteraciones y tamano de lote 4. La correccion de replicacion de mascara de atencion aplicada en el momento de la cuantizacion no es un hook de ejecucion, es decir, no se aplica en tiempo de inferencia. Las proyecciones elegibles quedan en INT4, las proyecciones hibridas pequenas permanecen en 16 bits, las activaciones y los pesos retenidos se mantienen en BF16 y la cabeza pointer original permanece en FP32 con su temperatura original.

El entorno de conversion observado fue PyTorch 2.10.0+cu128, Transformers 5.17.0, AutoRound 0.12.3, PEFT 0.21.1 y Accelerate 1.15.0. El autor senala que es un entorno observado, no una matriz de soporte validada, y que el Kev original fijado declara PyTorch <2.9, lo que supone un conflicto de versiones relevante. El cargador incluido esta adaptado del runtime de 4B y la ejecucion del cargador de 9B/27B no ha sido validada.

## Capacidades

- Seleccion y puntuacion de opciones: dada una descripcion de estado y un conjunto de opciones con criterios, el modelo devuelve una distribucion de probabilidad sobre cada opcion mediante `model.probs(encoded)`.
- Clasificacion de estados textuales: el ejemplo de la model card clasifica el estado "The parcel has been delivered." en la opcion "delivered" frente a "pending".
- Codificacion estricta de estado y ramas: `model.encode` acepta `max_state` y `max_branch` junto con un modo `strict`, lo que permite controlar los limites de la entrada.
- Reutilizacion de la semantica de decision upstream: la conversion mantiene la codificacion de opciones y la semantica de decision de Kev, incluida la temperatura original de la cabeza.
- Capacidades de generacion de texto: no aplica. La model card afirma explicitamente que Kev no es un modelo de chat de generacion de texto.
- Tool calling, function calling y agentes: no disponible. No se documenta soporte.
- Capacidades multimodales o de audio: no disponible. Los repositorios hermanos del mismo autor (`Qwen3.8-27B-W4A16-vision`) si mencionan vision, pero esta ficha concreta no declara vision.
- Capacidades multilingues: no disponible. Solo consta el uso de filas sinteticas en chino durante la calibracion.

## Casos de uso

- Clasificacion de estados logisticos: dado un texto libre sobre el estado de un envio y un conjunto cerrado de estados posibles, el modelo devuelve la probabilidad de cada uno. Es el escenario de referencia de la model card y encaja con la cabeza pointer.
- Triaje de tickets de soporte: enviar el texto del ticket como estado y las categorias de cola como opciones, con criterios textuales por categoria, para enrutar cada ticket con una puntuacion de confianza.
- Extraccion estructurada con opciones cerradas: convertir campos de formularios, contratos o registros en decisiones sobre un vocabulario controlado, evitando la generacion libre de texto.
- Enrutamiento en pipelines de agentes: usar el modelo como componente de decision que elige entre un conjunto de herramientas o acciones predefinidas en lugar de generar la llamada a la herramienta.
- Moderacion y cumplimiento con criterios explicitos: definir politicas como opciones con criterios y obtener una probabilidad por politica, lo que facilita fijar umbrales de escalado.
- Anotacion asistida y control de calidad de etiquetado: puntuar automaticamente las opciones candidatas de un conjunto de anotaciones humanas para detectar desacuerdos o etiquetas improbables.
- Evaluacion de sistemas de decision: como modelo de referencia para comparar contra la version BF16 original de kev-27b, siempre que se valide previamente la equivalencia de salidas.

En todos los casos, el modelo requiere que las opciones y sus criterios se suministren externamente; no genera contenido nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha validado la inferencia, la calidad de decision, la latencia ni la compatibilidad de despliegue en este flujo de publicacion, y que ninguna puntuacion de benchmark del modelo upstream debe interpretarse como una puntuacion de esta cuantizacion. Tampoco se proporcionan mediciones de throughput o tiempo de respuesta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se ha validado. El tamano del repositorio es de 15,3 GB, pero el propio autor advierte de que hay que reservar memoria de GPU adicional mas alla del tamano de los ficheros de pesos para buffers de ejecucion y entradas.
- Precision de hardware: se requiere hardware con soporte BF16, ya que el modelo retiene activaciones y pesos en BF16 y la cabeza en FP32.
- GPU recomendadas: no disponible. Solo se especifica Linux con GPU CUDA. No se confirma el funcionamiento en ninguna GPU concreta, ni de gama profesional (A100, H100) ni de consumo (RTX 4090 u otras).
- Compatibilidad con GPU de consumo: no disponible, no validado.
- Sistema operativo y entorno: Linux, GPU CUDA, entorno Triton compatible con AutoRound. Entorno observado en conversion: PyTorch 2.10.0+cu128, Transformers 5.17.0, AutoRound 0.12.3, PEFT 0.21.1, Accelerate 1.15.0.
- Opciones de despliegue: unicamente el cargador propio `load_kev.py` incluido en el repositorio, junto con el codigo de Kev fijado en `PYTHONPATH`, y el backend `auto_round:tritonv2_zp` (el backend con conciencia de zero-point es necesario para este empaquetado). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y la model card indica que no se apoya en `trust_remote_code` ni en pipelines genericos de generacion de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bowmanslayer/kev-27b-W4A16 | 4.552.318.464 (segun safetensors) | No disponible | Sin benchmarks publicados; inferencia no validada | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| jaredpalmer/kev-27b | No disponible | No disponible | Resultados publicados en su propia model card (no aplicables a esta cuantizacion) | No disponible | HuggingFace |
| Qwen/Qwen3.8-27B | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| bowmanslayer/Qwen3.8-27B-W4A16-vision | No disponible | No disponible | No disponible | No disponible | HuggingFace |

La comparativa con alternativas de la misma categoria no esta disponible: no hay datos publicados de otros modelos de decision con cabeza pointer de este mismo linaje mas alla de la familia Kev (0.8B, 4B, 9B y 27B) mencionada en el repositorio de GitHub, para la cual no se proporcionan especificaciones numericas en la informacion disponible.

## Limitaciones y advertencias

- Inferencia no validada: la model card indica que la inferencia, la calidad de decision, la latencia y la compatibilidad de despliegue no se han validado en este flujo de publicacion.
- Incoherencia en el recuento de parametros: el dato de safetensors (4,55 mil millones) no concuerda con la denominacion 27B del nombre del modelo ni con el modelo base declarado. Verificar antes de dimensionar infraestructura.
- Conflicto de versiones: el entorno de conversion uso PyTorch 2.10.0+cu128, mientras que el Kev original fijado declara PyTorch <2.9.
- Cargador adaptado de otro tamano: el cargador incluido procede del runtime de 4B y la ejecucion del cargador de 9B/27B no ha sido validada.
- No es un modelo generativo: no debe usarse para generacion de texto, chat ni tareas de completado. Solo devuelve probabilidades sobre opciones suministradas.
- Cabeza pointer con temperatura original: la calibracion de AutoRound no modifica la cabeza, que permanece en FP32 con su temperatura original; el calibrado de las probabilidades de salida no ha sido verificado.
- Riesgo de calibracion incorrecta: al ser un modelo de puntuacion y no de generacion, el riesgo relevante no es la alucinacion de contenido, sino la asignacion de probabilidades poco fiables sobre las opciones.
- No aplicar el LoRA upstream: la model card advierte explicitamente de que no debe volverse a aplicar el LoRA de jaredpalmer/kev-27b sobre este repositorio.
- Licencia: Apache-2.0, lo que en principio permite uso comercial, pero la model card no incluye el dataset de calibracion, la configuracion de despliegue privada ni el servicio de evaluacion. Se debe revisar `LICENSE` y `NOTICE` por las atribuciones a Kev y a Qwen.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validacion independiente.
- Idiomas: no se declaran idiomas soportados; la unica referencia linguistica es la inclusion de 64 filas sinteticas en chino en la calibracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bowmanslayer/kev-27b-W4A16
- Modelo upstream (adaptador): https://huggingface.co/jaredpalmer/kev-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Codigo de Kev (GitHub): https://github.com/jaredpalmer/kev/tree/main
- Repositorio hermano del mismo autor con vision: https://huggingface.co/bowmanslayer/Qwen3.8-27B-W4A16-vision
- Repositorio hermano del mismo autor con vision y MTP: https://huggingface.co/bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision-mtp
- Variante abliterated de Qwen3.8-27B en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- HyperQwen (servicio de modelos Qwen grandes en GPU limitadas): https://github.com/syv-ai/HyperQwen
