# rapid-mlx/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-3bit

## Resumen

Este repositorio contiene una conversion a formato MLX del modelo NVIDIA Nemotron 3.5 Super VL 120B-A12B, publicada por el usuario rapid-mlx. Se trata de una cuantizacion mixta de 3 bits orientada a Apple Silicon, no del modelo original de NVIDIA. El modelo base es nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16, un modelo de lenguaje y vision de aproximadamente 120.700 millones de parametros totales con arquitectura etiquetada como nemotron_h y capas de mezcla de expertos (MoE). La nomenclatura A12B del nombre sugiere del orden de 12.000 millones de parametros activos por token, aunque la model card no confirma esta cifra de forma explicita.

La relevancia de esta ficha radica en que permite ejecutar un modelo de gran tamano en hardware de consumo con memoria unificada de 64 GB, algo impensable con los pesos BF16 originales. El artefacto ocupa 42,764 GB y el pico medido del asignador de MLX es de 45,903 GB para 1.024 tokens de prompt y 64 tokens generados. La ventana de contexto declarada alcanza 1.048.576 tokens, si bien la propia model card advierte de que eso no implica que la ventana completa quepa en la memoria recomendada.

Es importante subrayar que esta conversion es solo de texto: la torre de vision, el proyector de imagenes y una cabeza MTP sin usar se han omitido, pese a que el modelo original es multimodal. Ademas, requiere una version aun no publicada de Rapid-MLX con soporte de texto para Nemotron 3.5 Super VL, ya que la version 0.16.2 solo soporta Nemotron 3.5 Bolt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (hibrida, con capas MoE; etiqueta de la model card) |
| Parametros totales | 120.668.692.480 (~120,7 B) |
| Parametros activos | ~12.000 millones (deducido de la nomenclatura A12B del nombre; no confirmado en la model card) |
| Longitud de contexto | 1.048.576 tokens (declarados) |
| Tipos de cuantizacion | Mixta afin: 26 capas MoE interiores a 2 bits/group-128, 14 capas MoE de frontera a 3 bits/group-128, otras proyecciones elegibles a 4 bits/group-64 y embeddings a 8 bits/group-64; la cabeza de salida, los routers y las proyecciones latentes conservan la precision del checkpoint |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (OpenMDW 1.1), heredada del modelo original de NVIDIA |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo nemotron_h con capas de mezcla de expertos distribuidas entre capas interiores y de frontera. La conversion respeta el campo de configuracion `nemotron_h` y activa un adaptador de precision revisado por Rapid-MLX. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ya que la model card facilitada solo describe el proceso de cuantizacion y no el entrenamiento original de NVIDIA.

En cuanto a innovaciones tecnicas de esta conversion, destaca el esquema de cuantizacion por modulos: se aplican precisiones distintas segun la funcion de cada capa (2, 3, 4 y 8 bits) y se mantienen en precision original la cabeza de salida, los routers y las proyecciones latentes, que son los componentes mas sensibles a la cuantizacion. La model card menciona tambien una cabeza MTP (multi-token prediction) que se ha omitido en esta conversion, por lo que la decodificacion especulativa MTP no esta habilitada. El razonamiento y el tool calling en XML utilizan el tokenizador y la plantilla de chat originales.

## Capacidades

- Generacion de texto y razonamiento conversacional, con soporte del modo de razonamiento original del modelo base.
- Tool calling en formato XML, segun la plantilla de chat original.
- Razonamiento multi-paso (herencia del modelo base), aunque la decodificacion especulativa MTP no esta activa.
- Capacidades multilingues: no especificadas en la informacion disponible.
- Capacidades de vision: **no incluidas** en esta conversion (torre de vision y proyector de imagenes omitidos), pese a que el modelo original es de tipo VL.
- Contexto muy largo declarado de hasta 1.048.576 tokens, sujeto a disponibilidad de memoria.

## Casos de uso

- Razonamiento y analisis de documentos extensos en local: con una ventana declarada de 1.048.576 tokens, permite procesar libros, expedientes o bases de codigo completas en un unico contexto, siempre que la memoria unificada lo permita.
- Asistentes de codigo en equipos Apple Silicon: el soporte de tool calling en XML y el modo de razonamiento lo hacen apto para tareas de generacion, revision y refactorizacion de codigo integradas en el flujo de trabajo del desarrollador.
- Agentes autonomos de multiples pasos ejecutados en local: al soportar tool calling y razonamiento encadenado, puede gestionar bucles de planificacion y ejecucion sin enviar datos a la nube.
- Procesamiento de texto privado y sensible: al ejecutarse sobre memoria unificada local, resulta adecuado para entornos donde los datos no pueden salir del equipo (sanidad, legal, defensa).
- Investigacion en eficiencia de inferencia: sirve como banco de pruebas para estudiar el impacto de la cuantizacion mixta de 2/3/4/8 bits en la calidad de un MoE de mas de 120.000 millones de parametros.
- Generacion de resumenes y sintesis de corpus largos: la ventana de contexto extendida permite condensar grandes volumenes de texto en una sola pasada, reduciendo la necesidad de chunking.
- Prototipado de aplicaciones conversacionales en macOS: mediante `rapid-mlx serve` se puede exponer el modelo como servicio local para pruebas de producto sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta mediciones de memoria del asignador de MLX, no metricas de calidad (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM/memoria unificada estimada: objetivo de 64 GB de memoria unificada para contextos cortos; pico medido del asignador de MLX de 45,903 GB para 1.024 tokens de prompt mas 64 tokens generados, con fragmentos de prefill de 256 tokens.
- Tamano del artefacto: 42,764 GB (repo de 42,8 GB).
- Hardware de referencia de las mediciones: un M3 Ultra con 256 GiB; la model card advierte de que no se ha probado en un Mac fisico de 64 GB.
- GPU compatibles: exclusivamente Apple Silicon (formato MLX); no aplica a A100, H100 ni RTX 4090, que no ejecutan MLX de forma nativa.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 64 GB o mas de memoria unificada. Se recomienda empezar con contexto de 1K y reservar memoria para macOS y otras aplicaciones.
- Opciones de despliegue: Rapid-MLX (`rapid-mlx serve rapid-mlx/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-3bit`), con una version aun no publicada que soporte Nemotron 3.5 Super VL en texto. Los cargadores estandar no aplican el adaptador de precision de Rapid y no estan validados para esta conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rapid-mlx/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-3bit | ~120,7 B (activos ~12 B segun nomenclatura) | 1.048.576 tokens | Mixta 2/3/4/8 bits | safetensors MLX | openmdw-1.1 | Requiere version futura de Rapid-MLX |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 (modelo base) | ~120,7 B | no disponible en la informacion | BF16 (sin cuantizar) | safetensors | openmdw-1.1 | Publicado por NVIDIA |
| Nemotron 3.5 Bolt | no disponible | no disponible | no disponible | no disponible | no disponible | Soportado por Rapid-MLX 0.16.2 |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en los datos facilitados.

## Limitaciones y advertencias

- Es una conversion de terceros (rapid-mlx), no una version oficial de NVIDIA; la calidad puede diferir del modelo base.
- Solo texto: se han eliminado la torre de vision, el proyector de imagenes y una cabeza MTP, por lo que no acepta entradas de imagen pese a que el modelo original es multimodal.
- La decodificacion especulativa MTP no esta habilitada.
- Requiere una version aun no publicada de Rapid-MLX; la 0.16.2 solo soporta Nemotron 3.5 Bolt. Otros cargadores no estan validados.
- El contexto declarado de 1.048.576 tokens no garantiza que la ventana completa quepa en la memoria recomendada; hay que ajustar el contexto a la memoria disponible.
- Mediciones de memoria realizadas en un M3 Ultra de 256 GiB, no en un Mac fisico de 64 GB; el rendimiento real en 64 GB no esta verificado.
- Riesgo de alucinacion: no cuantificado, pero es un riesgo inherente a los modelos generativos de este tipo; la cuantizacion agresiva de 2 bits en capas MoE interiores puede degradar la calidad.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no especificados en la informacion disponible.
- Licencia: OpenMDW 1.1, heredada del modelo original; conviene revisar sus terminos antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rapid-mlx/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-3bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
