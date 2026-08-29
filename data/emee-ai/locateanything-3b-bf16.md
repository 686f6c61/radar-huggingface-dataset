# emee-ai/LocateAnything-3B-bf16

## Resumen

LocateAnything-3B es un modelo de lenguaje y visión (VLM) desarrollado por NVIDIA para tareas de *visual grounding*: localización precisa de objetos, detección densa, *pointing* y localización de texto o elementos de interfaz gráfica a partir de consultas en lenguaje natural. La versión `emee-ai/LocateAnything-3B-bf16` es una conversión al formato MLX (bfloat16 sin cuantizar) realizada por la comunidad para ejecutarse de forma nativa en Apple Silicon, manteniendo numéricamente los mismos pesos que el checkpoint original.

El modelo combina un encoder de visión MoonViT-SO-400M con el modelo de lenguaje Qwen2.5-3B-Instruct, sumando unos 3.500 millones de parámetros. Su principal innovación es el *Parallel Box Decoding*, un mecanismo de decodificación que acelera la generación de coordenadas de cajas delimitadoras aproximadamente el doble que la decodificación autoregresiva estándar, sin sacrificar la calidad de la localización. Está pensado para aplicaciones de visión por computador en entornos de investigación y académicos, dado que su licencia restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (encoder de visión MoonViT-SO-400M + LLM Qwen2.5-3B-Instruct) |
| Parametros totales | 3.517.975.280 (3,5 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (sin cuantizar) |
| Idiomas soportados | ingles |
| Licencia | NVIDIA License (no comercial, solo investigacion/academico) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

LocateAnything-3B pertenece a la familia Eagle VLM de NVIDIA. Su arquitectura combina un encoder de vision MoonViT-SO-400M (licencia MIT) con el modelo de lenguaje Qwen2.5-3B-Instruct (licencia Qwen Research). El modelo genera directamente tokens de coordenadas normalizadas (entre `<0>` y `<1000>`) junto con etiquetas de referencia, produciendo salidas estructuradas como `<ref>remote</ref><box><64><152><273><244></box>`.

La innovacion clave es el *Parallel Box Decoding*, que permite decodificar multiples cajas delimitadoras en paralelo durante la generacion, reduciendo la latencia aproximadamente a la mitad frente a la decodificacion autoregresiva convencional. El modelo admite dos modos de generacion: `slow` (autoregresivo, por defecto) y `fast`/`hybrid` (paralelo). No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de alineacion (RLHF/DPO) en la informacion disponible.

## Capacidades

- Deteccion de objetos: localiza multiples objetos en una imagen a partir de una descripcion textual o de la instruccion "detect all objects".
- *Referring expression grounding*: asocia expresiones referenciales (p. ej. "el coche rojo a la izquierda") con sus coordenadas en la imagen.
- *Pointing*: genera puntos de localizacion para objetos o regiones especificas.
- Localizacion de texto y elementos GUI: identifica texto o componentes de interfaz en capturas de pantalla.
- OCR multimodal: combina reconocimiento de texto con su posicion espacial.
- Salida estructurada: produce tokens de coordenadas normalizadas, facilmente parseables para integracion en pipelines.
- Decodificacion paralela: modo `fast`/`hybrid` que acelera la generacion de cajas sin perdida de calidad.
- Soporte conversacional: al estar basado en Qwen2.5-Instruct, puede mantener dialogos multimodales simples.

## Casos de uso

- Automatizacion de pruebas de interfaz grafica: el modelo puede localizar botones, campos de texto o iconos en capturas de pantalla, permitiendo generar scripts de testing que interactuen con elementos especificos sin depender de selectores fragiles.
- Anotacion de datos para vision por computador: acelera la creacion de datasets etiquetados con bounding boxes a partir de descripciones en lenguaje natural, util en entornos de investigacion.
- Accesibilidad: descripcion de elementos en pantalla para usuarios con discapacidad visual, combinando deteccion de objetos y localizacion de texto.
- Robotica y sistemas fisicos: localizacion de objetos en entornos controlados para tareas de manipulacion o navegacion, gracias a su salida de coordenadas precisa.
- Busqueda visual en imagenes medicas o industriales: identificacion de anomalias o estructuras especificas mediante consultas textuales, siempre que se respete la licencia no comercial.
- Generacion de descripciones espaciales: produccion de informes que detallan la posicion relativa de objetos en una escena, util para documentacion o analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La pagina de NVIDIA menciona mejoras en calidad de localizacion con alto IoU gracias al *Parallel Box Decoding*, pero no se proporcionan cifras concretas en los materiales consultados.

## Requisitos de hardware

- Disenado para Apple Silicon: requiere un Mac con chip M1, M2, M3 o M4 (incluidos variantes Pro/Max/Ultra).
- VRAM estimada: el checkpoint en bf16 ocupa aproximadamente 7,2 GB, por lo que se recomienda un minimo de 16 GB de memoria unificada para inferencia comoda.
- GPU recomendadas: cualquier Mac con Apple Silicon y al menos 16 GB de RAM unificada; modelos con 32 GB o mas permiten mayor margen.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) en este formato MLX, ya que MLX esta orientado a Apple Silicon; para GPUs NVIDIA habria que usar el checkpoint original en otro formato.
- Opciones de despliegue: mediante `mlx-vlm` (instalado desde la rama `feat/locateanything-3b`), con el comando `python -m mlx_vlm.generate`.
- Latencia: no se proporcionan datos numericos, pero el modo `fast`/`hybrid` reduce el tiempo de generacion aproximadamente un 50% frente al modo autoregresivo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de visual grounding (p. ej. Grounding DINO, OWL-ViT, Florence-2) en terminos de parametros, contexto y rendimiento. La informacion disponible no incluye datos de benchmarks ni especificaciones de modelos alternativos.

## Limitaciones y advertencias

- Licencia restrictiva: uso exclusivamente no comercial y academico; cualquier aplicacion comercial requiere autorizacion explicita de NVIDIA.
- Idioma: solo soporta ingles; no se garantiza el rendimiento en otros idiomas.
- Riesgo de alucinacion: como todo modelo generativo, puede producir coordenadas o referencias incorrectas, especialmente en imagenes complejas o ambiguas.
- Dependencia de la rama de desarrollo: el soporte en `mlx-vlm` aun no esta en una version estable, lo que puede afectar a la reproducibilidad.
- Sin datos de contexto: se desconoce la longitud maxima de contexto soportada, lo que limita el diseno de aplicaciones que requieran dialogos largos.
- Sesgos potenciales: al estar entrenado principalmente con datos en ingles y escenarios comunes, puede fallar en dominios especializados o con diversidad cultural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emee-ai/LocateAnything-3B-bf16
- Modelo original de NVIDIA: https://huggingface.co/nvidia/LocateAnything-3B
- Pagina del proyecto en NVIDIA Research: https://research.nvidia.com/labs/lpr/locate-anything/
- Repositorio Eagle VLM: https://github.com/NVlabs/EAGLE
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia del modelo original: https://huggingface.co/nvidia/LocateAnything-3B/blob/main/LICENSE
