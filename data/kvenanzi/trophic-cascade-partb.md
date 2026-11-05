# kvenanzi/trophic-cascade-partb

## Resumen

`trophic-cascade-partb` es un conjunto de dieciocho modelos de lenguaje de pequena escala con arquitectura GPT-2, entrenados desde cero sobre el corpus TinyStories por el autor independiente kvenanzi. No es un modelo pensado para produccion ni para uso general, sino un artefacto de investigacion en interpretabilidad: su proposito es medir empiricamente si el dropout provoca "auto-reparacion" (self-repair), es decir, si las cabezas de atencion posteriores restauran un efecto que se elimina al ablacionar una cabeza concreta.

El diseno experimental es limpio: tres regimenes de entrenamiento (`none`, `standard` y `drophead`) con seis semillas cada uno, donde la semilla `k` de cada regimen parte de la misma inicializacion y ve las mismas secuencias en el mismo orden, lo que permite comparaciones por pares. Los modelos tienen unos 30 millones de parametros, 6 capas, 8 cabezas de dimension 48 (d_model 384), anchura MLP de 1536 y una ventana de contexto de 256 tokens, con embeddings atados y tokenizador GPT-2.

Es relevante ahora porque aporta evidencia cuantitativa sobre un mecanismo interno de los transformers (la redundancia funcional entre cabezas) que afecta directamente a tecnicas de poda, ablacion y compresion de modelos. El resultado principal es que el dropout eleva la fraccion de auto-reparacion agregada de 0,359 a 0,615 (dropout estandar) y a 0,670 (dropout de cabeza), con un coste pequeno en perdida de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2, `GPT2LMHeadModel`) |
| Parametros totales | ~30 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de precision completa) |
| Idiomas soportados | no disponible en la model card (entrenado sobre TinyStories, corpus en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |
| Capas | 6 |
| Cabezas de atencion | 8, dimension 48 |
| d_model | 384 |
| Anchura MLP | 1536 |
| Embeddings | atados (tied) |
| Tokenizador | GPT-2 |
| Regimenes y semillas | 3 regimenes x 6 semillas = 18 checkpoints |
| Tamano del repo | 2,2 GB |

## Arquitectura y entrenamiento

Cada checkpoint es un `GPT2LMHeadModel` estandar de 6 capas con 8 cabezas de dimension 48, d_model 384, MLP de anchura 1536, embeddings atados y contexto de 256 tokens. El entrenamiento se realizo desde cero sobre TinyStories durante 200 millones de tokens, con AdamW, tasa de aprendizaje maxima de 1e-3, calentamiento lineal del 2 %, decaimiento coseno hasta el 10 %, weight decay de 0,1 y lotes de 128 secuencias, sobre una A100 de Colab.

La innovacion experimental es el regimen `drophead`: durante el entrenamiento se anula la salida de cada cabeza de forma independiente y por secuencia con probabilidad 0,1, reescalando las cabezas restantes por 1/0,9. Como esta operacion no forma parte de `GPT2LMHeadModel`, los checkpoints `drophead` se cargan como modelos planos con todo el dropout a 0; los checkpoints `standard` conservan su dropout de 0,1, que solo se aplica en modo entrenamiento. La metrica de auto-reparacion se mide con ablacion por remuestreo sobre 256 secuencias reservadas, en el 2 % de posiciones donde el efecto directo de cada cabeza es mayor, sumando sobre las 48 cabezas.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, limitada al dominio de TinyStories (narrativa infantil sencilla).
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues no documentadas; el corpus de entrenamiento es en ingles.
- No incluye modo thinking, vision ni audio.
- Utilidad principal como objeto de estudio: inspeccion de cabezas, ablacion, analisis de circuitos y medida de auto-reparacion.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: ablacionar cabezas una a una y medir cuanto restaura el resto del modelo, usando los pares por semilla para separar efecto del dropout de la variabilidad de inicializacion.
- Estudio del efecto del dropout en la redundancia funcional: comparar `none`, `standard` y `drophead` con la misma inicializacion y las mismas secuencias para aislar la causa.
- Reproduccion de experimentos docentes: el tamano de 30 millones de parametros permite entrenar y evaluar variantes en una sola GPU, incluso en entornos tipo Colab.
- Pruebas de metodologias de poda: los datos de auto-reparacion indican cuanta capacidad puede eliminarse antes de degradar la perdida de validacion.
- Validacion de pipelines de evaluacion: servir como modelo de juguete para verificar herramientas de analisis de atencion antes de aplicarlas a modelos grandes.
- Generacion de texto de dominio restringido para pruebas de infraestructura: narrativas cortas en ingles con contexto de 256 tokens para validar endpoints de `text-generation`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos reportados son perdida de validacion en TinyStories y la fraccion de auto-reparacion agregada.

| Regimen | Perdida de validacion (media) | Auto-reparacion agregada (media) |
|---|---|---|
| `none` | 1,612 | 0,359 |
| `standard` | 1,659 | 0,615 |
| `drophead` | 1,626 | 0,670 |

Detalle por semilla:

| Carpeta | Regimen | Semilla | Perdida de validacion | Auto-reparacion |
|---|---|---|---|---|
| `none-s0` | none | 0 | 1,614 | 0,360 |
| `none-s1` | none | 1 | 1,610 | 0,353 |
| `none-s2` | none | 2 | 1,612 | 0,382 |
| `none-s3` | none | 3 | 1,610 | 0,372 |
| `none-s4` | none | 4 | 1,612 | 0,298 |
| `none-s5` | none | 5 | 1,613 | 0,388 |
| `standard-s0` | standard | 0 | 1,656 | 0,623 |
| `standard-s1` | standard | 1 | 1,659 | 0,609 |
| `standard-s2` | standard | 2 | 1,659 | 0,604 |
| `standard-s3` | standard | 3 | 1,661 | 0,630 |
| `standard-s4` | standard | 4 | 1,660 | 0,592 |
| `standard-s5` | standard | 5 | 1,661 | 0,632 |
| `drophead-s0` | drophead | 0 | 1,626 | 0,683 |
| `drophead-s1` | drophead | 1 | 1,626 | 0,653 |
| `drophead-s2` | drophead | 2 | 1,625 | 0,671 |
| `drophead-s3` | drophead | 3 | 1,626 | 0,691 |
| `drophead-s4` | drophead | 4 | 1,623 | 0,642 |
| `drophead-s5` | drophead | 5 | 1,627 | 0,679 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un unico checkpoint de 30 millones de parametros; el repo completo ocupa 2,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el autor entreno en una A100 de Colab, pero el modelo es sobradamente pequeno para una RTX 3060, RTX 4090 o incluso CPU.
- Cabe en cualquier GPU consumer, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `GPT2LMHeadModel` (ruta oficial de carga por subcarpeta), y conversion a GGUF para llama.cpp u Ollama si se desea.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `trophic-cascade-partb` | ~30 M | 256 | Investigacion de auto-reparacion con dropout | MIT | HuggingFace |
| GPT-2 small | 124 M | 1024 | Generacion de texto general | MIT | HuggingFace |
| Modelos TinyStories tipicos (p. ej. variantes de 1-30 M) | 1-30 M | 256-512 | Generacion de narrativa infantil, investigacion | variable | HuggingFace |

La comparativa con GPT-2 small no es de rendimiento sino de escala: este modelo tiene aproximadamente una cuarta parte de los parametros y una cuarta parte del contexto, y esta entrenado sobre un corpus mucho mas estrecho. Frente a otras variantes de TinyStories, su valor diferencial es el diseno controlado por semillas y los tres regimenes de dropout, no la calidad de generacion.

## Limitaciones y advertencias

- Modelo de investigacion, no apto para produccion: 30 millones de parametros y 256 tokens de contexto limitan severamente la coherencia mas alla de narrativas cortas.
- Entrenado exclusivamente sobre TinyStories; el vocabulario y los temas estan sesgados hacia narrativa infantil en ingles.
- Riesgo alto de alucinacion y de generar texto incoherente fuera de su dominio.
- No hay evaluacion de sesgos publicada; el corpus de origen puede introducir sesgos propios.
- Los checkpoints `drophead` se cargan como modelos planos con todo el dropout a 0, por lo que no reproducen el comportamiento de entrenamiento sin codigo adicional.
- Los registros de Weights & Biases originales ya no son publicos; solo se conservan en `runs.json`.
- Los resultados corresponden a un unico corpus y una unica tasa de dropout; el propio autor advierte que las conclusiones no se generalizan sin los intervalos y limitaciones del write-up.
- Licencia MIT: permite uso comercial, pero el modelo no ofrece garantias de calidad para ese fin.

## Enlaces

- HuggingFace: https://huggingface.co/kvenanzi/trophic-cascade-partb
- Write-up: https://withinnoise.dev/blog/posts/transformer-trophic-cascades/ (seccion 5.8)
- Codigo: https://github.com/kvenanzi/trophic-cascade
- Dataset: https://huggingface.co/datasets/roneneldan/TinyStories
