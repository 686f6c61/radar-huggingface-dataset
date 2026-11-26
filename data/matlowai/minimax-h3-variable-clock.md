# MATLOWAI/MiniMax-H3-Variable-Clock

## Resumen

MiniMax-H3 Variable-Clock es un adaptador LoRA de rango 16 desarrollado por MATLOWAI sobre el modelo base MiniMaxAI/MiniMax-H3, un modelo de generacion de video texto-a-video. El adaptador ensena al modelo a operar con un "reloj variable": en lugar de generar un clip a velocidad normal y estirarlo posteriormente para simular camara lenta, el modelo recibe por cada latente cuanta tiempo real cubre, de modo que las secciones ralentizadas se generan nativamente con mas latentes por segundo de tiempo real. Esto elimina el paso de "de-rope" (time-smear) que repite fotogramas y descarta copias, y evita que el detalle fino (pelo, chispas, hojas) se reproduzca demasiado rapido tras el estiramiento.

El adaptador se publica como resultado de investigacion experimental, con resultados mixtos a partir de una sola semilla por prompt, y esta pensado para quienes trabajan con el modelo base H3 y quieren explorar control temporal fino en la generacion de video. No es un modelo independiente: requiere MiniMax-H3 y su VAE original, y su uso se limita al pipeline de generacion de video.

La relevancia actual radica en que propone un mecanismo de control temporal (hold map y spans por latente) que podria reducir computo desperdiciado en la generacion de camara lenta y mejorar la coherencia del movimiento en los fotogramas conservados, un problema abierto en los modelos de video generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de video MiniMax-H3; rango 16, alpha 16 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; clips de 56 a 141 fotogramas generados) |
| Tipos de cuantizacion | no disponible (entrenado en bf16) |
| Idiomas soportados | no disponible (el modelo base no declara idiomas en la informacion) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0.3 GB; libreria minimax-h3) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 aplicado sobre MiniMax-H3. El modelo base empaqueta fotogramas de pixel en latentes con un patron fijo (1, 4, 4, 4, 4) por cada 17 fotogramas (longitudes legales de 17k + 5 fotogramas). Cada latente tiene un "span" (tiempo real que cubre) que determina su posicion de RoPE temporal, con 5/3 unidades de RoPE por fotograma real. Una "hold map" indica, para cada fotograma real, cuantos fotogramas generados ocupa (1, 2 o 4), y de ella se derivan los spans: un latente de 4 fotogramas con 4 fotogramas reales distintos lee velocidad normal (span 6,67); con 2 fotogramas reales repetidos dos veces lee camara lenta 2x (span 3,33); con 1 fotograma real repetido cuatro veces lee camara lenta 4x (span 1,67).

El entrenamiento mantiene el VAE original sin cambios y construye clips a partir de metraje real a 24 fps repitiendo fotogramas reales dentro de los latentes, de modo que el objetivo siempre son fotogramas reales y nunca fotogramas intermedios inventados. Antes de entrenar se verifico que el VAE original reconstruye estos latentes de fotogramas repetidos al menos igual de bien que los ordinarios (PSNR de fotogramas conservados de 35-38 dB; copias dentro de un latente dentro de 0,3-0,5 sobre 255; 2 clips). El conjunto consta de 84 filas de entrenamiento procedentes de 21 fuentes de accion real, de 124 y 141 fotogramas y 1280x736; cada fuente aporta una fila a velocidad normal, una a 2x o 4x constante y dos variables (rampas como normal → 2x → 4x → 2x → normal, intro lenta, outro lento, rafagas). De los latentes de 4 fotogramas, el 44% son velocidad normal, el 30% 2x y el 26% 4x, equilibrados por longitud de clip y por inicio, medio y final. Las leyendas son identicas para todas las filas de una fuente, de modo que la velocidad proviene solo del reloj y nunca del texto. No hay animacion en los datos de entrenamiento.

El entrenamiento uso AdamW con tasa 5e-5 constante, 10 pasos de calentamiento, 2.000 pasos, batch 1, bf16, semilla 20260923, con 2 bandas de RoPE temporal finas mantenidas a tasa nativa (`keep_bands = 2`) y un ancla de reloj nativo (peso 30) para mantener el comportamiento a velocidad normal cerca del modelo base. Coste aproximado de 78 GPU-horas en una RTX PRO 6000 (unos 2,3 minutos por paso). En inferencia se pasa la hold map al sampler para fijar los spans por latente, con el LoRA a 1.0 y las mismas 2 bandas finas; despues se conserva la primera copia de cada fotograma real y se reproduce a 24 fps.

## Capacidades

- Generacion de video texto-a-video con control temporal variable: velocidad normal, camara lenta 2x y 4x, y rampas entre velocidades dentro de un mismo clip.
- Generacion nativa de camara lenta sin paso de estiramiento posterior ni descarte de fotogramas repetidos.
- Control por hold map: el usuario especifica cuantos fotogramas generados ocupa cada fotograma real, alineado a la rejilla de latentes.
- Movimiento coherente en fotogramas conservados en las secciones ralentizadas (objetivo declarado del adaptador).
- Soporte de clips cortos: se documenta un clip de 56 fotogramas (2,3 s), por debajo del rango habitual de 5-15 s de H3.
- Resoluciones documentadas: 1344x768 y 1280x736.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni multilingues; el adaptador es especifico de generacion de video.
- No se documenta modo thinking ni otras capacidades especiales.

## Casos de uso

- Produccion de camara lenta en postproduccion: generar directamente un clip con secciones a 2x y 4x mediante una hold map, conservando la primera copia de cada fotograma real y reproduciendo a 24 fps, lo que evita generar fotogramas que luego se descartan.
- Planos de accion y deporte: el adaptador se entreno con fuentes de accion real y se demuestra con secuencias de boxeo (golpes, esquivas, uppercut, hook-cross), adecuado para material de combate o deportes con movimiento rapido.
- Rampas de velocidad dentro de un plano: construir transiciones como normal → 2x → 4x → 2x → normal en un unico clip, util para enfatizar un instante concreto de una secuencia.
- Clips cortos de alta intensidad: generar piezas de unos 2,3 s (56 fotogramas) para inserts o transiciones breves donde el detalle temporal importa.
- Investigacion sobre control temporal en modelos de video: usar la hold map y los spans por latente como base para experimentar con tasas de fotogramas variables y estudiar la coherencia del movimiento.
- Prototipado de efectos de camara lenta sin pipeline de estiramiento: sustituir el flujo de de-rope por generacion nativa con reloj, reduciendo el computo dedicado a fotogramas descartados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta unicamente comprobaciones cualitativas y de reconstruccion del VAE: PSNR de fotogramas conservados de 35-38 dB y desviacion de las copias dentro de un latente de 0,3-0,5 sobre 255 (2 clips), ademas de comparaciones en video lado a lado con la misma semilla (20260923), mismo prompt y mismo reloj entre H3 original + reloj y este LoRA + reloj. Los resultados se describen como mixtos y obtenidos con una sola semilla por prompt.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion; depende del modelo base MiniMax-H3 y de la resolucion y numero de fotogramas generados.
- GPU recomendadas: no se especifican para inferencia; el entrenamiento se realizo en una RTX PRO 6000 (unas 78 GPU-horas, 2,3 minutos por paso).
- Cabe en GPU de consumo: no disponible; el entrenamiento se hizo en una GPU profesional.
- Opciones de despliegue: no disponible; el adaptador usa la libreria minimax-h3 y requiere el modelo base MiniMaxAI/MiniMax-H3 con su VAE original.
- Latencia y throughput de inferencia: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-H3 Variable-Clock (MATLOWAI) | LoRA r16 sobre MiniMax-H3 | no disponible | no disponible | resultados mixtos, una semilla por prompt | MIT | Hugging Face |
| MiniMax-H3 (MiniMaxAI) | Modelo base texto-a-video | no disponible | no disponible | referencia frente a la que se compara en la model card | no disponible en la informacion | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros adaptadores o modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Resultados mixtos: la model card advierte explicitamente de que los resultados proceden de una sola semilla por prompt y deben leerse con cautela antes de usarlo.
- Es un resultado de investigacion publicado "as is", sin garantias de calidad de produccion.
- Depende del modelo base MiniMax-H3 y de su VAE original; no funciona de forma autonoma.
- El control temporal exige construir y pasar una hold map al sampler, con el LoRA a 1.0 y 2 bandas finas de RoPE; un uso incorrecto del reloj puede degradar el resultado.
- Los datos de entrenamiento no incluyen animacion, por lo que el comportamiento en ese dominio no esta validado.
- El conjunto de entrenamiento es reducido (84 filas de 21 fuentes), lo que limita la generalizacion.
- No se documentan sesgos conocidos, riesgo de alucinacion, limitaciones de idioma ni caveats adicionales de produccion en la informacion disponible.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base MiniMax-H3, cuya licencia no se detalla en la informacion.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/MATLOWAI/MiniMax-H3-Variable-Clock
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Videos de ejemplo: https://huggingface.co/MATLOWAI/MiniMax-H3-Variable-Clock/resolve/main/assets/punching_long_kept.mp4
- Videos de ejemplo (todos los fotogramas): https://huggingface.co/MATLOWAI/MiniMax-H3-Variable-Clock/resolve/main/assets/punching_long_all_frames.mp4
- Videos de ejemplo (clip corto): https://huggingface.co/MATLOWAI/MiniMax-H3-Variable-Clock/resolve/main/assets/punching_short_kept.mp4
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
