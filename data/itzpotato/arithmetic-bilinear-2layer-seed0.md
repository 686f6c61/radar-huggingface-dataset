# itzPotato/arithmetic-bilinear-2layer-seed0

## Resumen

El modelo `arithmetic-bilinear-2layer-seed0` es un transformer decoder-only de 2 capas, sin bias ni normalizacion, con MLP bilineal, entrenado especificamente para resolver sumas y restas con signo de numeros de 4 digitos. Lo desarrolla itzPotato (Rohan Sashank Babbellapati) como parte de una familia de doce modelos —combinaciones de {relu, bilinear} × {1, 2} capas × semillas {0, 1, 2}— entrenados con una receta identica para que el unico factor estructural variable sea el tipo de MLP. Con solo 21.824 parametros, no es un modelo de proposito general, sino un objeto de estudio para investigacion en interpretabilidad mecanistica.

La relevancia del modelo radica en que permite aislar el efecto del tipo de MLP (ReLU frente a bilineal) en la capacidad de aprender aritmetica con acarreo y prestamo. Los resultados muestran que los modelos de 2 capas resuelven tanto la suma como la resta, mientras que los de 1 capa solo logran la suma, lo que sugiere que la segunda capa es necesaria para la propagacion del prestamo en la resta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 2 capas, sin bias ni normalizacion |
| Parametros totales | 21.824 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16 tokens (formato de tarea) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No disponible (tokens numericos, tarea aritmetica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con d_model=32, d_mlp=64, 4 cabezas de atencion con d_head=8, y 2 capas. La MLP es bilineal: `W_out[(W_L x) * (W_R x)]`, en contraste con la variante ReLU `W_out ReLU(W_in x)`. No incorpora bias ni normalizacion, lo que facilita el analisis mecanistico de las activaciones.

El entrenamiento sigue una receta identica para los doce modelos de la familia: AdamW con lr 0.02 (cosine, 200 pasos de warmup), batch 1024, weight decay 0.01, grad clip 1.0, y una sola pasada sobre 5.000.000 de ejemplos. La tasa de aprendizaje se eligio mediante un probe de seis puntos sobre ambas variantes de MLP, fijandose en el valor mas alto en el que ambas permanecen estables, de modo que la receta compartida no favorece a ninguna. El mejor paso es el 4600 de 4883. La semilla del modelo es 0 y la semilla de datos es 1234, identica en los doce modelos.

## Capacidades

- Resolucion de sumas y restas con signo de numeros de 4 digitos, con respuesta de 5 digitos precedida de token de signo.
- Precision de secuencia del 99,83 % en el conjunto de test (99,82 % en validacion).
- Precision por digito del 99,97 % en test.
- Capacidad de propagacion de acarreo (suma) y prestamo (resta) gracias a la segunda capa.
- No es un modelo de lenguaje general: no genera texto libre ni comprende lenguaje natural.
- Disenado para interpretabilidad: al carecer de bias y normalizacion, las activaciones son directamente analizables.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: el modelo es lo suficientemente pequeno como para permitir un analisis completo de circuitos internos (attention heads, MLP) con tecnicas de probing y ablation.
- Estudio de la propagacion del prestamo en resta: la comparacion entre modelos de 1 y 2 capas permite aislar el circuito responsable del borrow.
- Comparacion de arquitecturas de MLP: al ser la unica diferencia estructural entre los doce modelos, permite medir el impacto de ReLU frente a bilineal en la capacidad de generalizacion aritmetica.
- Validacion de tecnicas de transcoding: el modelo se etiqueta como transcoder, por lo que puede usarse como banco de pruebas para metodos de descomposicion de activaciones en features interpretables.
- Educacion en IA: por su tamano minimo, es adecuado para demostrar conceptos de entrenamiento, atencion y analisis de activaciones en cursos de deep learning.
- Benchmark para herramientas de interpretabilidad: sirve como caso de prueba para librerias como TransformerLens o similares, al tener una tarea bien definida y metricas claras.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados:

| Split | Loss | Precision por digito | Precision de secuencia | Precision de signo |
|---|---:|---:|---:|---:|
| Validacion | 0,0012 | 0,9996 | 0,9982 | 0,0000 |
| Test | 0,0010 | 0,9997 | 0,9983 | 0,0000 |

Por operador (test):

| Operador | Precision de secuencia | Precision por digito | Loss |
|---|---:|---:|---:|
| Suma | 0,9980 | 0,9996 | 0,0011 |
| Resta | 0,9984 | 0,9997 | 0,0013 |

La precision de signo es ~0 por construccion: la loss solo cubre los cinco digitos de la respuesta, no la posicion del signo, que se proporciona como entrada teacher-forced. Esto no es un fallo, sino una caracteristica del diseno experimental.

## Requisitos de hardware

- El modelo tiene 21.824 parametros (aproximadamente 87 KB en fp32), por lo que cabe en cualquier CPU moderna sin necesidad de GPU.
- La inferencia es practicamente instantanea: una pasada forward de un ejemplo de 16 tokens se completa en microsegundos.
- No requiere cuantizacion ni optimizaciones de memoria.
- Puede ejecutarse en cualquier entorno Python con PyTorch, incluso en Google Colab gratuito o en un portatil.
- Para el analisis de activaciones, el almacenamiento de las mismas en batches grandes es trivial en RAM.

## Comparativa con modelos similares

| Modelo | Capas | MLP | Parametros | Precision de secuencia (test) |
|---|---:|---|---:|---:|
| arithmetic-bilinear-2layer-seed0 | 2 | Bilineal | 21.824 | 0,9983 |
| Variante relu-2layer-seed0 (misma familia) | 2 | ReLU | no disponible | no disponible |
| Variantes 1-layer (relu y bilinear) | 1 | ReLU/Bilineal | no disponible | Resuelven suma, no resta |

No se dispone de datos publicados de las variantes ReLU ni de los modelos de 1 capa en la informacion disponible. El autor menciona otros modelos relacionados, como `bilinear-attn-addition-carry-2layer` y `bilinear-attn-modular-addition-p113`, pero no se han publicado comparativas numericas.

## Limitaciones y advertencias

- Los token ids son propios del proyecto: los digitos 0-9 se mapean a si mismos, + a 10, - a 11, = a 12, con d_vocab=13. No coinciden con los de otros modelos de referencia como `melephant/1-layer-addition-v2`, que ademas es solo de suma, por lo que no es posible combinar activaciones con otros modelos sin re-mapear los tokens.
- La precision de signo es 0 por construccion: la posicion del signo no recibe gradiente, ya que la loss solo cubre los cinco digitos de la respuesta.
- El modelo solo maneja operandos de 4 digitos con signo; no generaliza a numeros de mayor longitud ni a otras operaciones.
- No es un modelo de lenguaje: no genera texto, no entiende instrucciones y no tiene capacidades conversacionales.
- No se especifica licencia en la model card ni en los metadatos de HuggingFace, por lo que el uso comercial no esta claramente permitido.
- El modelo se publico el 1 de septiembre de 2026 y no tiene descargas ni likes, lo que sugiere que es un artefacto de investigacion reciente con poca adopcion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/arithmetic-bilinear-2layer-seed0
- Perfil del autor en HuggingFace: https://huggingface.co/itzPotato
- Perfil de GitHub del autor: https://github.com/itzPotato
- Modelo relacionado (bilinear-attn-addition-carry-2layer): https://huggingface.co/itzPotato/bilinear-attn-addition-carry-2layer
- Modelo relacionado (bilinear-attn-modular-addition-p113): https://huggingface.co/itzPotato/bilinear-attn-modular-addition-p113
