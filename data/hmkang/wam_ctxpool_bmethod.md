# hmkang/wam_ctxpool_bmethod

## Resumen

WAM_DIT4DIT (`hmkang/wam_ctxpool_bmethod`) es un modelo de mundo para video aplicado a robótica, desarrollado por el usuario hmkang. Parte de Wan2.2-TI2V-5B, un DiT (Diffusion Transformer) de video de aproximadamente 5 000 millones de parámetros, al que se le añade una cabeza de acción de 48 articulaciones y se entrena en modo conjunto (`training_mode=joint`). El problema que aborda es la predicción de dinámica visomotora en entornos de manipulación: dado un contexto visual y un estado, el modelo genera a la vez fotogramas futuros y acciones conjuntas, lo que lo sitúa en la familia de los *world models* para robótica y no en la de los modelos de lenguaje.

La contribución concreta de este repositorio es una variante de *context pooling* construida sobre la receta "B-method" finalizada de suhyeok: un profesor auto-EMA con *teacher forcing* (sigma=0.25) más una pérdida de prototipos iBOT L18<->L18 con gamma=0.01 y dos vistas. Sobre esa base, los 3 fotogramas latentes de contexto pasado se agrupan (*pool*) en un único fotograma de movimiento antes de un bloque concreto del transformer. El repositorio contiene tres variantes de agrupación (`xattn_ffn_L3`, `avg_st_L3`, `avg_L6`) que difieren en dónde y cómo se realiza ese *pooling*.

Es relevante ahora porque documenta un punto de comparación reproducible entre estrategias de compresión de contexto temporal en modelos de mundo de video, con una receta de entrenamiento declarada de forma explícita (deepspeed 0.19.6, `WAM_DINO_GA_AWARE=1`, batch efectivo de 64 filas) y con pesos publicados cada 20 000 pasos. El repositorio ocupa 66,4 GB y se distribuye bajo licencia Apache 2.0. Hay que subrayar que el propio autor advierte que estos no son los *runs* sustitutos (*surrogate*) y que no deben compararse con `hmkang/wam_ctxpool_xattn` ni `hmkang/wam_ctxpool_avg`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de video Wan2.2-TI2V-5B + cabeza de acción de 48 articulaciones; entrenamiento conjunto (`training_mode=joint`) |
| Parámetros totales | Aproximadamente 5 000 millones en la base Wan2.2-TI2V-5B; el total exacto incluyendo la cabeza de acción no está disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como contexto de texto. Geometría espaciotemporal: `num_frames_in=25`, `num_frames_out=41`, fdf 2 (4 fotogramas condicionantes + 2 huecos latentes futuros), 96 tokens por fotograma latente, 576 tokens por fila |
| Tipos de cuantización | No disponible; el repositorio solo distribuye pesos en safetensors |
| Idiomas soportados | No disponible (modelo visomotor, no orientado a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (solo pesos y configuraciones; sin estado del optimizador) |
| Librería declarada | wan2.2 |
| Pipeline | robotics |
| Tamaño del repositorio | 66,4 GB |
| Fecha de creación | 2026-09-12 |
| Última actualización | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es un Diffusion Transformer de video (Wan2.2-TI2V-5B) con un cabezal de acción de 48 articulaciones acoplado en modo conjunto. Sobre la receta "B-method" finalizada se aplica una innovación de compresión de contexto: los 3 fotogramas latentes pasados se agrupan en un único fotograma de movimiento antes de un bloque elegido. El repositorio publica tres variantes de esa agrupación: `xattn_ffn_L3/` (cross-attention más refinado FFN antes del bloque L3), `avg_st_L3/` (promedio del pasado sobre tiempo y espacio hasta 1 token, antes de L3) y `avg_L6/` (promedio de los 3 fotogramas latentes pasados, antes del bloque L6). Las tres se entrenaron con la misma configuración: 4 GPU, `pd4` x `GA2`, `GC=0`.

La receta de entrenamiento declarada incluye un profesor auto-EMA con *teacher forcing* a sigma=0.25 y una pérdida de prototipos iBOT entre las capas L18 y L18 con gamma=0.01, en configuración de dos vistas. La variable `WAM_DINO_GA_AWARE=1` hace que el centro iBOT y la EMA de la cabeza del profesor se activen una vez por paso de optimizador, lo que convierte `GA=2` en el mismo experimento que `GA=1` con el doble de batch por dispositivo. El batch efectivo es de 16 clips x GA 2 x 2 vistas = 64 filas, equivalente a la configuración base con `pd8` x `GA1`. El entrenamiento usó deepspeed 0.19.6 y se publican puntos de control cada 20 000 pasos. No se especifica en la model card el número total de tokens de entrenamiento ni la composición del dataset, más allá de que el entorno es una cocina RoboCasa.

## Capacidades

- Generación de video condicionada: produce 41 fotogramas de salida a partir de 25 fotogramas de entrada con factor fdf 2.
- Predicción de acciones robóticas: cabeza de acción de 48 articulaciones entrenada de forma conjunta con el modelo de video.
- Modelado de mundo visomotor: aprende la dinámica del entorno (cocina RoboCasa) y genera futuros coherentes con las acciones.
- Compresión de contexto temporal: agrupación de 3 fotogramas latentes pasados en un único fotograma de movimiento antes de un bloque seleccionable (L3 o L6).
- Aprendizaje auto-supervisado con prototipos: pérdida iBOT L18<->L18 con profesor auto-EMA, lo que aporta representaciones visuales intermedias.
- Soporte de *tool calling* / *function calling*: no disponible; el modelo no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible; el "razonamiento" aquí es predicción de dinámica en el espacio latente.
- Capacidades multilingües: no aplicables / no disponibles.
- Modo *thinking*, visión en lenguaje natural, audio: no disponible.

## Casos de uso

- Investigación en modelos de mundo para robótica: sirve como punto de comparación controlado entre tres estrategias de *context pooling* (`xattn_ffn_L3`, `avg_st_L3`, `avg_L6`) sobre una misma receta base, lo que permite aislar el efecto de la agrupación de contexto temporal.
- Planificación de manipulación en cocina simbólica: dado un contexto visual de una cocina RoboCasa y un estado de 48 articulaciones, el modelo predice los fotogramas futuros y las acciones asociadas, útil para *rollouts* en simulación antes de transferir a un planificador.
- Evaluación de políticas robóticas en bucle cerrado: el modelo de mundo permite simular la evolución del entorno bajo acciones candidatas sin ejecutar el simulador físico completo, reduciendo coste computacional en la fase de búsqueda.
- *Benchmarking* de recetas de entrenamiento auto-supervisado: al publicar pesos cada 20 000 pasos, permite estudiar la evolución de la pérdida iBOT y de la EMA del profesor a lo largo del entrenamiento y comparar la receta B-method frente a alternativas.
- Estudio de eficiencia de contexto en DiT de video: la variante `avg_st_L3` reduce el pasado a 1 token, lo que resulta adecuado para analizar el compromiso entre compresión de contexto y fidelidad de la predicción en ventanas largas de video.
- Reproducción de experimentos a escala media: la configuración declarada (4 GPU, `pd4` x `GA2`, `GC=0`) es reproducible en clústeres académicos modestos, lo que facilita la validación independiente de resultados.
- Desarrollo de *baselines* para robótica visomotora: puede usarse como referencia frente a modelos de acción puros (por ejemplo, políticas tipo *imitation learning*) para medir la ganancia que aporta disponer de un modelo generativo de video subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no confirmada por el autor. Como referencia orientativa, los pesos de la base de 5 000 millones de parámetros en bf16 ocupan aproximadamente 10-11 GB, a lo que hay que sumar el VAE de video, el decodificador de 41 fotogramas y las activaciones; una estimación prudente sitúa el mínimo práctico en el rango de 24-40 GB, pero es una estimación no verificada, no un dato de la model card.
- GPU recomendadas: no disponibles en la información proporcionada. El entrenamiento declarado usó 4 GPU con `pd4` x `GA2`, pero no se especifica el modelo de GPU.
- GPU de consumo: no confirmado. Una GPU con 24 GB de VRAM podría ser suficiente si se reduce resolución o número de fotogramas, pero no hay confirmación del autor.
- Almacenamiento: el repositorio ocupa 66,4 GB, presumiblemente por acumular múltiples puntos de control cada 20 000 pasos; conviene prever ese espacio en disco o descargar únicamente la carpeta de la variante de interés.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI en la model card. El código asociado está en el repositorio `https://github.com/HEMMO0208/wam`, rama `ctxpool-bmethod`, archivo `gr00t/model/wam_dit4dit/wan22_ctxpool.py`, lo que implica una integración mediante el código propio del autor más deepspeed.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / geometría | Estrategia de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hmkang/wam_ctxpool_bmethod` (este) | ~5 000 M (base Wan2.2-TI2V-5B) + cabeza de acción 48 articulaciones | 25 fotogramas de entrada, 41 de salida, 576 tokens por fila | Pooling de 3 latentes pasados antes de L3 o L6, sobre receta B-method | Apache 2.0 | Público en HuggingFace |
| `hmkang/wam_ctxpool_xattn` | No disponible | No disponible | Variante sustituta (*surrogate*) con cross-attention | No disponible | Público en HuggingFace |
| `hmkang/wam_ctxpool_avg` | No disponible | No disponible | Variante sustituta (*surrogate*) con promedio | No disponible | Público en HuggingFace |
| Wan2.2-TI2V-5B (base original) | ~5 000 M | Generación de video texto-imagen a video | Sin cabeza de acción ni pooling de contexto robótico | No disponible en esta fuente | Público (modelo base) |

Advertencia del propio autor: las dos variantes `xattn` y `avg` pertenecen a la línea sustituta, con una base más antigua y `pd8` x `GA1`, por lo que no deben compararse directamente con este repositorio. No se dispone de datos de rendimiento comparativo entre ellas.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no es posible cuantificar su rendimiento frente a alternativas.
- El modelo está entrenado específicamente en el entorno RoboCasa (cocina); la transferencia a otros dominios de manipulación no está documentada.
- Las capacidades multilingües y de texto no son aplicables: se trata de un modelo visomotor, no de un modelo de lenguaje, pese a estar etiquetado con el pipeline `robotics`.
- Riesgo de acumulación de error en *rollouts* largos: al ser un modelo autorregresivo de video, los errores de predicción pueden amplificarse en horizontes que superen los 41 fotogramas de salida.
- Advertencia explícita del autor: no comparar los resultados de este repositorio con `hmkang/wam_ctxpool_xattn` ni `hmkang/wam_ctxpool_avg`, ya que usan una base y una configuración distintas (`pd8` x `GA1` frente a `pd4` x `GA2`). Las comparaciones cruzadas entre ambos conjuntos no serían válidas.
- El repositorio solo contiene pesos y configuraciones, sin estado del optimizador; no es posible reanudar el entrenamiento exactamente desde el punto publicado.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Wan2.2 y del entorno RoboCasa antes de un uso comercial, ya que la model card no detalla la procedencia ni los términos del dataset de entrenamiento.
- No se documentan sesgos específicos, pero al entrenarse en un entorno de cocina simulado, hereda las limitaciones de diversidad visual y física de dicho simulador.
- No se especifica el número de tokens de entrenamiento ni la composición del dataset, lo que dificulta evaluar la cobertura y la robustez del modelo.
- Los resultados de búsqueda web asociados a esta consulta no contenían información relevante sobre el modelo (devolvieron únicamente sitios de contenido para adultos sin relación alguna), por lo que no se ha podido contrastar ni ampliar la información de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmkang/wam_ctxpool_bmethod
- Código asociado: https://github.com/HEMMO0208/wam (rama `ctxpool-bmethod`)
- Archivo de implementación: `gr00t/model/wam_dit4dit/wan22_ctxpool.py` dentro del repositorio anterior
- Variante relacionada (línea sustituta, no comparable): https://huggingface.co/hmkang/wam_ctxpool_xattn
- Variante relacionada (línea sustituta, no comparable): https://huggingface.co/hmkang/wam_ctxpool_avg
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
