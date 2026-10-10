# ForgeWorks/ForgePlex-M2.1-10M

## Resumen

ForgePlex-M2.1-10M es un modelo de lenguaje decoder-only de 9.991.938 parametros (9,99 M) desarrollado por ForgeWorks. Es la iteracion mas completa de la familia ForgePlex M2 publicada hasta la fecha y, segun su model card, se mantiene en la serie M2 porque los cambios son refinamientos y no un salto arquitectonico: capa feed-forward ligeramente mas ancha (de 707 a 712 unidades intermedias), tokenizador BPE reentrenado de 4.096 entradas y una ejecucion de entrenamiento mas larga y mejor ajustada. El nombre M3 se reserva para una revision con cambios estructurales reales.

La arquitectura combina GQA (8 cabezas de consulta y 2 de clave/valor, head_dim 32), RoPE estilo NeoX con theta=5.000, RMSNorm con eps=1e-6 y SwiGLU, e incorpora dos elementos distintivos: puertas de salida de atencion (attention output gates) estilo Qwen3.5 en todas las capas y puertas de refresco (refresh gates) estilo GPT-S2 en las capas 5 y 10 con kernel 9. La atencion XSA esta desactivada y los pesos conservan el layout de claves original, sin remapeo a Llama.

Con 11 capas de 256 dimensiones ocultas, contexto de 1.024 tokens y licencia Apache-2.0, el modelo esta pensado para investigacion sobre arquitecturas diminutas y para despliegues en entornos con recursos minimos. No es adecuado para tareas de produccion que exijan razonamiento, cobertura multilingue o conocimiento factual fiable: solo soporta ingles y sus resultados en benchmarks son los propios de un modelo de esta escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RoPE estilo NeoX, RMSNorm y SwiGLU; attention output gates en todas las capas y refresh gates en las capas 5 y 10 |
| Parametros totales | 9.991.938 (9,99 M), confirmado en los safetensors del repositorio |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible; el repositorio publica safetensors en precision completa y el ejemplo oficial carga en float32 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Capas | 11 |
| Dimension oculta | 256 |
| Cabezas de atencion | GQA: 8 de consulta / 2 de clave-valor, head_dim = 32 |
| Capa feed-forward | SwiGLU con dimension intermedia 712 |
| Codificacion posicional | RoPE, theta = 5.000, convencion NeoX par/impar |
| Normalizacion | RMSNorm, eps = 1e-6 |
| Sesgo (bias) | ninguno |
| Embedding | weight tying (embeddings de entrada y salida compartidos) |
| Vocabulario | 4.096, BPE propio reentrenado |
| Libreria | transformers (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 11 capas y 256 dimensiones ocultas, con atencion de consultas agrupadas (GQA) de 8 cabezas de consulta y 2 de clave/valor con head_dim 32, mas una puerta de salida de atencion en cada capa. La capa feed-forward es SwiGLU con dimension intermedia 712, la normalizacion es RMSNorm con eps=1e-6, no hay terminos de sesgo y los embeddings estan atados (weight tying). La codificacion posicional usa RoPE con theta=5.000 en convencion NeoX par/impar. Ademas, las capas 5 y 10 incorporan puertas de refresco (refresh gates) estilo GPT-S2 con kernel 9, un mecanismo que la model card no detalla mas alla de su ubicacion e hiperparametros. La variante XSA esta explicitamente desactivada y los pesos conservan el layout de claves original del modelo, sin el remapeo habitual a la nomenclatura Llama.

En cuanto a los datos de entrenamiento, la model card indica que se realizo una ejecucion mas larga y mejor ajustada que en la version M2, con un tokenizador BPE reentrenado de 4.096 entradas, pero no especifica el numero de tokens, la composicion del corpus ni si hubo etapas de RLHF, DPO u otro tipo de alineamiento. Tampoco se documentan tecnicas de decodificacion especulativa ni optimizaciones de inferencia. Para esta version el autor declara mejoras respecto a M2 en HellaSwag, PIQA y ArithMark-3, manteniendo ARC aproximadamente al mismo nivel.

## Capacidades

- Generacion de texto autoregresiva en ingles: continuacion de prompts cortos, con una ventana maxima de 1.024 tokens.
- Razonamiento basico de sentido comun y fisico muy limitado: los resultados de HellaSwag (29,09%) y PIQA (59,14%) indican un desempeno bajo en tareas de inferencia cotidiana.
- Aritmetica elemental parcial: 35,50% en ArithMark-3, insuficiente para calculo fiable.
- Tokenizacion propia: BPE de 4.096 entradas, reentrenado respecto a M2.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multimodales: sin vision, audio ni entrada de imagenes.
- No se documenta modo de razonamiento explicito (thinking mode) ni ventana de pensamiento.
- Capacidad multilingue: no disponible; la model card declara unicamente ingles.
- Capacidad de completado de secuencias cortas con decodificacion greedy, tal como se muestra en el ejemplo oficial con `do_sample=False`.

## Casos de uso

- Investigacion en arquitecturas de modelos diminutos: permite experimentar con attention output gates y refresh gates con un coste de computo minimo, de modo que una ablacion completa (activar o desactivar las puertas, variar el kernel o las capas de inyeccion) se puede ejecutar en minutos sobre una unica GPU o incluso en CPU.
- Docencia y formacion tecnica: sirve para ilustrar de forma tangible conceptos como GQA, RoPE, RMSNorm, weight tying o tokenizacion BPE, ya que el modelo completo cabe en el repositorio y su configuracion es inspeccionable en detalle.
- Pruebas de infraestructura y pipelines de despliegue: al ocupar menos de 40 MB en float32, es util como modelo de humo (smoke test) para validar integraciones con transformers, servidores de inferencia y flujos de CI/CD antes de pasar a modelos reales de mayor tamano.
- Despliegue en el borde y dispositivos con recursos minimos: con pesos en float32 de aproximadamente 40 MB y en int8 de aproximadamente 10 MB (estimacion a partir del numero de parametros), puede ejecutarse en CPU, en GPUs integradas o en plataformas embebidas con memoria limitada.
- Demos interactivos y aplicaciones educativas: generacion de continuaciones cortas de texto en ingles para juguetes, prototipos de interfaz o demostraciones de concepto donde la calidad del texto no es el criterio principal.
- Validacion de arneses de evaluacion: es un candidato practico para comprobar que un harness de benchmarks (por ejemplo, tareas tipo HellaSwag, ARC o PIQA) esta correctamente configurado, ya que la evaluacion completa se ejecuta en pocos minutos.
- Investigacion sobre recetas de entrenamiento y escalado: al existir una version previa (M2) con la misma familia arquitectonica, permite estudiar el efecto de cambios acotados como ampliar la capa feed-forward, reentrenar el tokenizador o alargar la ejecucion de entrenamiento.
- Ajuste fino para tareas muy restringidas en ingles: por su tamano, es viable reentrenarlo por completo o aplicar LoRA para clasificacion de textos muy cortos o etiquetado simple, siempre que no se requiera precision alta; la model card no documenta ninguna receta de ajuste fino.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Benchmark | ForgePlex-M2.1-10M |
|---|---|
| Intelligence Index (metrica propia del autor) | 10,70 |
| HellaSwag | 29,09% |
| ARC (combinado) | 29,66% |
| PIQA | 59,14% |
| ArithMark-3 | 35,50% |

La model card afirma que M2.1 lidera los modelos actuales por debajo de 10M de parametros en HellaSwag y PIQA, y que se mantiene competitivo en ARC y ArithMark-3, ademas de mejorar respecto a M2 en HellaSwag, PIQA y ArithMark-3 manteniendo ARC aproximadamente igual. Sin embargo, las graficas de comparacion referenciadas (`assets/chart_competitors.png` y `assets/chart_m2_vs_m21.png`) no enumeran los modelos comparados ni sus cifras en el texto disponible, por lo que no es posible reproducir esa comparativa con datos concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 40 MB de pesos en float32, 20 MB en float16/bfloat16 y 10 MB en int8 (calculado a partir de los 9.991.938 parametros); con activaciones y una ventana de 1.024 tokens, el consumo total se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU sirve; no se requiere una GPU dedicada. El modelo se puede ejecutar en GPUs integradas, en GPUs de consumo muy antiguas y en CPU.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo (serie RTX 40, RTX 30, GTX e incluso aceleradores de borde tipo Jetson).
- Opciones de despliegue: la via oficial es `transformers` con `trust_remote_code=True`, en float32 o bfloat16/float16. No se publican pesos en GGUF ni en otros formatos, de modo que su uso con llama.cpp, Ollama o servidores tipo vLLM o TGI requeriria una conversion previa no documentada por el autor.
- Latencia y throughput: no se han publicado cifras. Dado el tamano del modelo y su contexto de 1.024 tokens, la generacion es del orden de milisegundos por token en CPU moderna, pero se trata de una estimacion, no de un dato medido por el autor.

## Comparativa con modelos similares

No se dispone de datos nominales de los modelos comparados. La model card menciona una comparativa grafica con los "lideres por debajo de 10M" y con la version anterior M2, pero no identifica a los competidores ni reproduce sus cifras en el texto.

| Modelo | Parametros | Contexto | HellaSwag | PIQA | ARC | ArithMark-3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| ForgePlex-M2.1-10M | 9,99 M | 1.024 | 29,09% | 59,14% | 29,66% | 35,50% | Apache-2.0 | HuggingFace |
| ForgePlex-M2 | no disponible | no disponible | inferior a M2.1 (segun la model card) | inferior a M2.1 (segun la model card) | aproximadamente igual a M2.1 (segun la model card) | inferior a M2.1 (segun la model card) | no disponible | no disponible |
| Lideres <10M citados en la grafica | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Riesgo alto de alucinacion: con 9,99 M de parametros y sin conocimiento factual verificable, cualquier afirmacion sobre hechos, fechas, entidades o cifras debe considerarse no fiable.
- Razonamiento muy limitado: HellaSwag 29,09%, ARC 29,66% y PIQA 59,14% son resultados bajos incluso para su categoria; no es adecuado para tareas que requieran inferencia sobre sentido comun.
- Aritmetica no fiable: 35,50% en ArithMark-3 desaconseja su uso en cualquier calculo.
- Ventana de contexto muy corta (1.024 tokens): no admite conversaciones multi-turno largas ni documentos extensos sin truncado agresivo.
- Sin alineamiento documentado: la model card no menciona RLHF, DPO ni filtrado de seguridad, por lo que no hay garantias sobre contenido toxico, sesgos o comportamientos indeseados.
- Codigo remoto: el uso requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar dicho codigo antes de desplegarlo en entornos de produccion.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se cumplan las condiciones del texto; no se detectan restricciones adicionales en la informacion disponible.
- Madurez del proyecto: 0 descargas y 4 "likes" en el momento de la consulta, lo que indica un modelo recien publicado y sin validacion externa.
- Advertencia de produccion: no debe utilizarse como componente critico en productos de cara al usuario sin una evaluacion propia y, en la practica, su funcion mas razonable es la investigacion y el prototipado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ForgeWorks/ForgePlex-M2.1-10M
- Script de uso incluido en el repositorio: `usage.py` dentro del propio repositorio de HuggingFace
- Repositorio de codigo independiente: no disponible
- Paper o informe tecnico: no disponible
- Blog o nota de publicacion del autor: no disponible
- Demo interactiva: no disponible
