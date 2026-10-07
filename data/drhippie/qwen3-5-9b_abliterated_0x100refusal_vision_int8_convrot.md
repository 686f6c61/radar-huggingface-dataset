# DrHippie/qwen3.5-9b_abliterated_0x100refusal_vision_int8_convrot

## Resumen

DrHippie/qwen3.5-9b_abliterated_0x100refusal_vision_int8_convrot es un checkpoint experimental de tipo vision-language construido como fusion (merge) de pesos, no como un modelo entrenado desde cero. Combina las matrices de lenguaje del modelo lukey03/Qwen3.5-9B-abliterated con la torre visual y el merger visual (337 tensores `model.visual.*`) del checkpoint huihui-ai/Huihui-Qwen3.5-9B-abliterated, ambos derivados de la arquitectura base Qwen/Qwen3.5-9B. El resultado se ha convertido parcialmente a INT8 ConvRot, un formato de cuantizacion mixta orientado especificamente a ComfyUI.

El checkpoint contiene 1.264 tensores en total: 250 matrices del modelo de lenguaje almacenadas en INT8 ConvRot (incluyendo el token embedding y la cabeza del modelo de lenguaje), 2 matrices del merger visual tambien en INT8 ConvRot, y el resto de tensores conservados en su precision de origen (BF16). El archivo pesa aproximadamente 9,83 GB (9,16 GiB) e incluye metadatos de cuantizacion ComfyUI para las 252 matrices cuantizadas. El error relativo L2 medio de cuantizacion medido para las 250 matrices de lenguaje fue de 0,9713 %, con un maximo de 1,0652 %.

La relevancia de este checkpoint es acotada: no es un lanzamiento oficial de Qwen, lukey03 ni huihui-ai, sino un remix de la comunidad pensado para flujos de trabajo de generacion de imagen/video en ComfyUI que aceptan codificadores de texto Qwen3.5-9B con soporte multimodal de entrada de imagen. El sufijo "0% Refusal" hace referencia al naming del checkpoint upstream, no a una tasa de rechazo medida ni garantizada. El autor advierte explicitamente de que no debe asumirse que el checkpoint cargue directamente en Transformers estandar u otros runtimes de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura base Qwen3.5-9B) con torre visual y merger visual anadidos; cuantizacion mixta INT8 ConvRot |
| Parametros totales | 9B (segun la denominacion del modelo base Qwen3.5-9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (252 matrices: 250 de lenguaje + 2 del merger visual); resto de tensores en precision de origen (BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`qwen3_abliterated-0%_vision_int8_convrot.safetensors`, ~9,83 GB / 9,16 GiB) |

## Arquitectura y entrenamiento

El modelo es una fusion de pesos, no un entrenamiento. La arquitectura subyacente es la de Qwen3.5-9B, un transformer denso de aproximadamente 9.000 millones de parametros al que se le anade una torre visual y un merger visual (componentes propios de la variante vision-language). El proceso de construccion consistio en: (1) tomar las matrices de lenguaje del checkpoint lukey03/Qwen3.5-9B-abliterated (cuyo BF16 de origen tenia SHA-256 `D739AFED0F1E4A05D1BAEC80FFBEEE624AB051AF857E95CBCEB189F20817C554`), (2) incorporar los 337 tensores `model.visual.*` del checkpoint huihui-ai/Huihui-Qwen3.5-9B-abliterated para restaurar la torre visual y el merger, y (3) convertir las matrices de lenguaje a INT8 ConvRot y conservar las dos matrices del merger visual ya cuantizadas en INT8 ConvRot del checkpoint Huihui.

No se realizo ningun pretraining, fine-tuning ni procedimiento de abliteration como parte de este merge. El trabajo de abliteration es atribuible a los checkpoints upstream, que documentan sus propios metodos en sus respectivas model cards. La innovacion tecnica del repositorio es, por tanto, la conversion a INT8 ConvRot con metadatos de cuantizacion ComfyUI y la recombinacion de componentes de lenguaje y vision de dos fuentes distintas. La validacion local reportada incluye: identificacion del checkpoint por ComfyUI como `QWEN35_9B`, carga de los 337 tensores visuales sin claves faltantes ni inesperadas, y una pasada forward sintetica de parches de imagen a traves de la torre visual y el merger completa que produjo salida finita con forma `(4, 4096)`.

## Capacidades

- Generacion de texto y capacidades de lenguaje heredadas de la arquitectura Qwen3.5-9B (base del checkpoint).
- Procesamiento de imagenes: la torre visual y el merger estan presentes y cargan correctamente, por lo que el checkpoint acepta entradas de imagen ademas de texto.
- Comportamiento de rechazo reducido (abliterated): segun la denominacion upstream, orientado a reducir negativas del modelo. No es una capacidad medida ni garantizada.
- Integracion con ComfyUI: soporta el formato INT8 ConvRot y metadatos de cuantizacion especificos de ComfyUI.
- Compatibilidad multimodal dentro de nodos que aceptan imagen (segun version de ComfyUI y nodos personalizados instalados).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio, etc.): no disponible; solo se documenta entrada de imagen.

## Casos de uso

- Flujos de generacion de imagen en ComfyUI con prompting descriptivo: el checkpoint se coloca en `ComfyUI/models/text_encoders/` y se selecciona como codificador de texto de un nodo Qwen3.5-compatible con entrada de imagen, sustituyendo al codificador estandar para experimentar con respuestas menos restrictivas.
- Edicion o descripcion de imagen a texto dentro de ComfyUI: gracias a la torre visual restaurada (337 tensores), el modelo puede procesar parches de imagen y producir representaciones de salida en el merger (`(4, 4096)` en la prueba sintetica), habilitando tareas de captioning o analisis visual en el propio grafo.
- Investigacion sobre abliteration y refusal: util como checkpoint de comparacion frente a los modelos upstream para estudiar como se comporta una combinacion lenguaje+vision abliterada respecto a sus fuentes, siempre que se asuma que no hay benchmark publicado.
- Pruebas de cuantizacion INT8 ConvRot: sirve para validar la perdida de fidelidad de este esquema (error L2 medio 0,9713 %, maximo 1,0652 % frente al BF16) en una tuberia real de ComfyUI.
- Prototipado de asistentes visuales experimentales: en entornos de laboratorio donde se quiera un VLM de ~9B empaquetado en menos de 10 GB y no se requiera compatibilidad con runtimes estandar.
- Docencia y demostraciones de merges de pesos: ilustra la linea de herencia Qwen -> lukey03 -> huihui-ai -> DrHippie y como recombinar subcomponentes de dos checkpoints distintos.
- Benchmarking local de fidelidad de cuantizacion: el autor expone como validar la carga de tensores y ejecutar un forward sintetico para comprobar el comportamiento tras la conversion.
- Escenarios creativos de generacion de imagen con pocas restricciones de contenido: el autor advierte de que "reduced refusal" no equivale a permiso de uso; se debe revisar el output y cumplir la ley y las condiciones de las plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que las comprobaciones realizadas (carga de tensores, forward sintetico, error L2 de cuantizacion) no establecen rendimiento general de vision-language, ni una tasa de rechazo concreta, ni compatibilidad con todos los flujos de ComfyUI. El unico dato cuantitativo disponible es de calidad de cuantizacion:

| Metrica | Valor |
|---|---|
| Error relativo L2 medio (250 matrices de lenguaje, frente a BF16) | 0,9713 % |
| Error relativo L2 maximo (250 matrices de lenguaje) | 1,0652 % |
| Forma de salida del forward visual sintetico (torre + merger) | (4, 4096) |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa ~9,83 GB (9,16 GiB); sumando activaciones y cache KV, se puede estimar un consumo de aproximadamente 12-16 GB de VRAM para ejecucion comoda, si bien no se proporciona una cifra oficial.
- GPU recomendadas: no disponibles de forma oficial; por tamano, GPU con 16 GB o mas (RTX 4080/4090, A100 40 GB, H100) son candidatas razonables.
- Cabe en GPU de consumo: previsiblemente si en GPU con 16 GB o mas de VRAM; la idoneidad depende de la version de ComfyUI y de la resolucion/numero de tokens de imagen.
- Opciones de despliegue: ComfyUI, colocando el `.safetensors` en `ComfyUI/models/text_encoders/` con una version que soporte codificadores Qwen3.5-9B e INT8 ConvRot. El autor advierte de que no debe asumirse carga directa en Transformers estandar, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DrHippie/...\_int8\_convrot (este) | 9B | no disponible | Si (torre restaurada) | Apache-2.0 | HuggingFace, orientado a ComfyUI |
| lukey03/Qwen3.5-9B-abliterated | 9B | no disponible | No (es fuente de lenguaje) | Apache-2.0 (segun upstream) | HuggingFace |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | 9B | no disponible | Si (fuente de vision) | Apache-2.0 (segun upstream) | HuggingFace |
| Qwen/Qwen3.5-9B | 9B | no disponible | No (base) | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- Es una mezcla experimental de pesos, no un modelo entrenado; no hay garantia de coherencia funcional entre las partes de lenguaje y vision.
- El nombre "0% Refusal" es descriptivo del naming upstream y no implica que se hayan eliminado todos los rechazos ni que el modelo responda a cualquier peticion.
- El autor reconoce que las salidas pueden ser incorrectas, sesgadas, sensibles o inapropiadas; no hay evaluacion de sesgos publicada.
- Riesgo elevado de alucinacion y de degradacion al combinar componentes de dos checkpoints distintos sin un ajuste posterior.
- No hay datos de comportamiento multilingue ni de longitud de contexto soportada; no disponible.
- Compatibilidad restringida: el autor advierte de que no debe asumirse carga en Transformers estandar u otros runtimes de inferencia; esta pensado para versiones de ComfyUI que soporten INT8 ConvRot.
- El error de cuantizacion (media 0,9713 %, maximo 1,0652 %) mide solo fidelidad respecto al BF16, no rendimiento conductual ni de seguridad.
- La licencia se declara Apache-2.0 basandose en las declaraciones de los modelos upstream; el autor recomienda revisar los repositorios originales antes de redistribuir y conservar los avisos requeridos. Esta ficha no constituye asesoramiento legal.
- 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DrHippie/qwen3.5-9b_abliterated_0x100refusal_vision_int8_convrot
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Fuente de pesos de lenguaje: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated
- Fuente de pesos de vision: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Paper de referencia (abliteration): https://arxiv.org/abs/2406.11717 (Arditi et al., "Refusal in Language Models Is Mediated by a Single Direction")
- Repositorio de referencia: https://github.com/Sumandora/remove-refusals-with-transformers
