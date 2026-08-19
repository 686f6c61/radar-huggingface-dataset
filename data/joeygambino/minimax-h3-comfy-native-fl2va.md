# joeygambino/MiniMax-H3-comfy-native-fl2va

## Resumen

MiniMax-H3-comfy-native-fl2va es un conjunto de cuantizaciones del modelo de generación de video MiniMax-H3, preparadas por el autor independiente joeygambino para cargarse de forma nativa en ComfyUI 0.32 o superior. Se trata de la variante fl2va (first/last-frame) del modelo base MiniMaxAI/MiniMax-H3, que se distingue de su gemela ref2va por no incluir filas de referencia: no admite anclaje de voz, banco de identidad ni imágenes de referencia, pero a cambio aterriza con precisión en un fotograma suministrado como primer o último frame de la secuencia.

El problema que resuelve es doble: por un lado, permite ejecutar MiniMax-H3 en ComfyUI sin necesidad de extensiones externas como ComfyUI-GGUF ni nodos de carga personalizados, ya que utiliza el sistema de cuantización propio de ComfyUI (`comfy/quant_ops.py` y los kernels `comfy_kitchen`); por otro, ofrece cinco formatos de cuantización (nvfp4, w4a8, int8, fp8 y mxfp8) adaptados a distintas generaciones de GPU, de modo que el usuario puede elegir el archivo más ligero que su hardware ejecute de forma nativa. La relevancia actual radica en que permite trabajar con un modelo de video de última generación en hardware de consumo, con una calidad equivalente entre formatos y una velocidad de inferencia entre un 18 % y un 34 % superior a la de un GGUF Q8_0, según las mediciones del autor.

No se dispone de información sobre la arquitectura interna, el número de parámetros ni la longitud de contexto del modelo base en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para video, base MiniMaxAI/MiniMax-H3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | nvfp4 (4-bit), w4a8 (4-bit pesos, 8-bit activaciones), int8 (8-bit), fp8 (8-bit), mxfp8 (8-bit microscaling) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura del modelo base MiniMax-H3 en la informacion disponible. Se sabe que es un modelo de generacion de video text-to-video, descrito en fuentes externas como un modelo nativo multimodal de 2K con audio estereo 3D sincronizado, pero no se especifican el tipo de red (difusion, transformer, etc.), el numero de capas ni los datos de entrenamiento.

Este repositorio no contiene un entrenamiento nuevo, sino una cuantizacion del modelo base. El autor utiliza el sistema de cuantizacion integrado en ComfyUI, que ejecuta los kernels en el dominio cuantizado sin descomprimir los pesos a bf16 previamente. Los cinco archivos se generaron con el mismo cuantizador y la misma poda (pruned lineage) que el conjunto ref2va, por lo que las propiedades de calidad y velocidad se heredan de ese conjunto, que sí fue verificado mediante renderizado. La variante fl2va, en cambio, fue validada solo con forward passes en GPU sobre capas de atencion y feed-forward, no con renders completos.

## Capacidades

- Generacion de video text-to-video a partir de un prompt.
- Aterrizaje en un fotograma suministrado: el modelo produce una secuencia que termina exactamente en el frame indicado, con una precision medida de 26.35 dB frente a los 16.15-16.81 dB de la variante ref2va con keyframe.
- Planificacion de movimiento de camara entre un primer y un ultimo frame: puede tomar ambos fotogramas y generar una transicion entre ellos.
- Integracion nativa con ComfyUI 0.32 o superior, sin nodos de carga adicionales.
- Cinco formatos de cuantizacion con calidad equivalente entre si, segun las pruebas del autor.
- No soporta voice anchoring, banco de identidad ni imagenes de referencia (esa funcionalidad pertenece a la variante ref2va).

## Casos de uso

- Edicion de video por pasos: renderizar una escena, revisar el resultado y alimentar el ultimo frame de esa escena como primer frame de la siguiente. Es el caso de uso principal para el que esta disenada fl2va, ya que garantiza continuidad visual entre tomas.
- Planificacion de movimiento de camara: proporcionar un primer y un ultimo frame y dejar que el modelo genere la transicion entre ambos, util para storyboards o previsualizaciones.
- Generacion de video en hardware de consumo: con una RTX 4090 se puede usar el formato w4a8 a 17.4 s/it, mientras que en una GPU Ampere se recomienda int8 para evitar emulacion lenta.
- Prototipado rapido en ComfyUI: al cargar los archivos directamente, se puede iterar sobre prompts y parametros sin configurar entornos externos.
- Comparacion de calidad entre cuantizaciones: el autor afirma que todos los formatos producen los mismos defectos, por lo que sirve para validar que una cuantizacion concreta no introduce degradacion adicional.
- Pipelines de generacion de video en produccion: al ser archivos unicos de safetensors, se pueden integrar en flujos de trabajo automatizados de ComfyUI sin dependencias extra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque se trata de un modelo de generacion de video, no de texto. Los datos disponibles son mediciones propias del autor:

| Metrica | fl2va | ref2va + keyframe (turbo 6 pasos) | ref2va + keyframe (stock 20 pasos) |
|---|---|---|---|
| Precision sobre frame objetivo (dB) | 26.35 | 16.15 | 16.81 |

En cuanto a velocidad, el autor reporta que todos los formatos de este repositorio son entre un 18 % y un 34 % mas rapidos que un GGUF Q8_0 del mismo modelo. El orden de velocidad es: nvfp4 (mas rapido), luego int8, mxfp8, w4a8 y fp8. En una RTX 4090, un usuario midio 17.4 s/it con w4a8 frente a 31.0 s/it con fp8, aunque esta diferencia se atribuye a que fp8 (21 GB) no cabe junto al pool de activaciones en 24 GB de VRAM y provoca streaming de pesos por PCIe.

## Requisitos de hardware

- VRAM estimada: los archivos pesan entre 12.53 GB (nvfp4 y w4a8) y 21.56 GB (mxfp8). Hay que considerar ademas el pool de activaciones, que puede hacer que un archivo de 21 GB no quepa en una GPU de 24 GB junto con las activaciones.
- GPU recomendadas por formato:
  - Blackwell (serie 50): nvfp4, el formato mas rapido.
  - Ada (serie 40): w4a8, medido a 17.4 s/it en una RTX 4090.
  - Ampere (serie 30): int8, ya que los formatos de 4 bits cargan y ejecutan lentamente en esta generacion.
- En GPU Ampere, los formatos nvfp4, w4a8 y mxfp8 se ejecutan emulados, lo que degrada el rendimiento. ComfyUI muestra en el arranque la linea `Native ops:` para verificar que el formato elegido se ejecuta de forma nativa.
- Despliegue: ComfyUI 0.32 o superior, sin extensiones adicionales. No se mencionan otros motores de inferencia como vLLM u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Variante | Precision sobre frame objetivo | Velocidad | Formato | Licencia |
|---|---|---|---|---|---|
| MiniMax-H3-comfy-native-fl2va (este repo) | fl2va | 26.35 dB | 18-34 % mas rapido que Q8_0 GGUF | safetensors cuantizado | Apache-2.0 |
| MiniMax-H3-comfy-native (ref2va) | ref2va | 16.15-16.81 dB con keyframe | misma gama de formatos | safetensors cuantizado | Apache-2.0 |
| MiniMax-H3-GGUF (mismo autor) | ambas | no disponible | Q8_0 como referencia | GGUF | Apache-2.0 |
| MiniMaxAI/MiniMax-H3 (modelo base) | original | no disponible | no disponible | no especificado | Apache-2.0 |

La comparativa se limita a las variantes del mismo modelo porque no se dispone de datos sobre otros modelos de generacion de video comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La variante fl2va no soporta voice anchoring, banco de identidad ni imagenes de referencia; esas funciones pertenecen a ref2va.
- El modelo base presenta defectos inherentes a ciertas formas y resoluciones: texto ilegible en diales de instrumentos, bordes de cinta reflectante que se deforman durante el movimiento, distorsion de extremidades en movimientos rapidos y sincronizacion labial rigida. El autor advierte que estos defectos no son culpa de la cuantizacion y aparecen tambien en el modelo sin cuantizar.
- No existe formato w4a4 porque cuantizar las activaciones a 4 bits degrada visiblemente la salida (texto convertido en garabatos, bandas de alta visibilidad que se disuelven, manos borrosas).
- El formato float8_e5m2 no funciona: carga correctamente pero lanza un error en la primera multiplicacion de matrices ("Multiplication of two Float8_e5m2 matrices is not supported").
- La verificacion de este conjunto fl2va se realizo solo mediante forward passes en GPU, no con renders completos. El autor pide que se le informe si algun render contradice las afirmaciones de calidad y velocidad.
- En GPUs Ampere, los formatos de 4 bits se ejecutan emulados y con bajo rendimiento; es necesario comprobar la linea `Native ops:` de ComfyUI antes de descargar un archivo de 20 GB.
- La licencia Apache-2.0 permite uso comercial, pero no se especifican restricciones adicionales del modelo base.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/joeygambino/MiniMax-H3-comfy-native-fl2va
- Repositorio de la variante ref2va: https://huggingface.co/joeygambino/MiniMax-H3-comfy-native
- Repositorio de cuantizaciones GGUF del mismo autor: https://huggingface.co/joeygambino/MiniMax-H3-GGUF
- Modelo base en HuggingFace (organizacion Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Repositorio oficial de MiniMax: https://github.com/MiniMax-AI/MiniMax-H3
- Hub de workflows y recursos de MiniMax H3: https://github.com/ai-models-lab/minimax-h3
- Tutorial de ComfyUI sobre MiniMax H3 API: https://docs.comfy.org/tutorials/partner-nodes/minimax/minimax-h3
