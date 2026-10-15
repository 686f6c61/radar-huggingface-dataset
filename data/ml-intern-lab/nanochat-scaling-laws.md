# ML-Intern-lab/nanochat-scaling-laws

## Resumen

`ML-Intern-lab/nanochat-scaling-laws` no es un modelo de lenguaje desplegable, sino un repositorio de artefactos experimentales: una reproducción en miniatura del barrido isoFLOP de `runs/scaling_laws.sh` del proyecto [karpathy/nanochat](https://github.com/karpathy/nanochat), ejecutado sin modificar el código sobre Hugging Face Jobs con GPUs A10G individuales (un job por punto del barrido). Lo publica la organizacion ML-Intern-lab y su licencia es MIT.

El contenido del repositorio son resultados y graficas, no pesos: `results.csv` (tabla combinada por punto con flops, profundidad, parametros, iteraciones, tokens, val_bpb y tiempo de pared) y `scaling_curves.png` (perdida frente a computo por profundidad, con ajustes de ley de potencia, y perdida frente a profundidad en regimen isoFLOP). No hay checkpoints, tokenizador ni ficheros de configuracion publicados en este repositorio, por lo que no puede usarse para inferencia directa.

Su relevancia es metodologica: aporta un punto de referencia publico y reproducible de como la perdida escala como potencia del computo en presupuestos pequenos (1,000e+16 a 4,640e+16 FLOPs) y de como la profundidad optima se desplaza con el presupuesto, usando exactamente la misma receta que el barrido de referencia de Karpathy, pero con presupuestos de computo aproximadamente 100 veces menores y hardware muy inferior (A10G frente a 8xH100).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la implementacion nanochat; profundidades 6, 8 y 10, con n_embd = 64 x profundidad (384, 512 y 640) |
| Parametros totales | No disponible en la model card; `results.csv` incluye una columna `params` por punto, pero sus valores no se reproducen en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica: no se distribuyen pesos |
| Idiomas soportados | No disponible. El tokenizador es un BPE compartido de 32.768 tokens entrenado una sola vez sobre 200 M de caracteres de ClimbMix; la model card no declara cobertura idiomatica |
| Licencia | MIT |
| Formato de pesos | No se publican pesos. El repositorio contiene unicamente artefactos de resultados (`results.csv`, `scaling_curves.png`) |

## Arquitectura y entrenamiento

El barrido entrena tres profundidades (d6, d8, d10) bajo tres presupuestos de computo isoFLOP: 1,000e+16, 2,150e+16 y 4,640e+16 FLOPs. El ancho de embedding se deriva de la profundidad con la regla n_embd = 64 x depth, de modo que d6 usa 384 dimensiones, d8 usa 512 y d10 usa 640. Cada punto del barrido se ejecuto como un job independiente sobre una unica GPU A10G, con el codigo original sin cambios. El tokenizador es un BPE de vocabulario 32.768, compartido por todos los puntos y entrenado una sola vez sobre 200 M de caracteres de ClimbMix, lo que elimina la variabilidad del tokenizador como factor de confusion entre configuraciones.

La metrica de evaluacion es `val_bpb` (bits por byte) sobre un shard reservado de ClimbMix de 5,2 M de tokens. La metrica CORE se desactivo por coste. Los ajustes publicados de la forma `val_bpb = A * FLOPs^-alpha` son: d6 con A = 411,705 y alpha = 0,157; d8 con A = 14316,854 y alpha = 0,249; d10 con A = 4689,278 y alpha = 0,214. La profundidad optima resulto ser d6 en los tres presupuestos evaluados, con val_bpb de 1,2956 (1,000e+16 FLOPs), 1,0884 (2,150e+16 FLOPs) y 1,0183 (4,640e+16 FLOPs). El autor senala que el alpha mas pronunciado de d8 (-0,249 frente a -0,157 de d6) sugiere que el cruce hacia modelos mas profundos ocurre justo por encima del rango testeado.

## Capacidades

- Generacion de texto: no aplica. El repositorio no publica pesos ni checkpoints, solo resultados de entrenamiento.
- Razonamiento, codigo, matematicas, vision o audio: no disponible, no documentado.
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingues: no disponible; no se declara cobertura idiomatica.
- Capacidades especiales: no disponible. Lo que si ofrece el artefacto es (a) curvas empiricas de perdida frente a computo para tres profundidades, (b) ajustes de ley de potencia con los coeficientes A y alpha publicados, (c) profundidad optima por presupuesto isoFLOP y (d) la tabla combinada de resultados por punto.

## Casos de uso

- Planificacion de presupuesto de entrenamiento: usando los ajustes `val_bpb = A * FLOPs^-alpha`, un equipo puede estimar la perdida esperada antes de comprometer computo y decidir si merece la pena escalar o si conviene cambiar la receta. Es util precisamente porque el rango de FLOPs (1e16 a 4,64e16) es asequible para grupos con una sola GPU de 24 GB.
- Seleccion de profundidad para una restriccion de memoria: el artefacto indica que d6 fue optima en todo el rango testeado y que d8 tiene un alpha mas agresivo. Sirve como evidencia empirica para decidir si conviene invertir memoria en profundidad o en ancho dentro de un presupuesto fijo.
- Validacion de infraestructura de entrenamiento: replicar el barrido en Hugging Face Jobs con A10G permite verificar que un pipeline de jobs distribuidos, el registro de metricas y el volcado de resultados funcionan extremo a extremo antes de lanzar campañas mas caras.
- Reproducibilidad y auditoria metodologica: al fijar el tokenizador (BPE de 32.768 tokens entrenado una vez sobre 200 M de caracteres) y mantener el codigo sin cambios, el repositorio sirve como control para comparar resultados propios contra una referencia publica conocida.
- Docencia y divulgacion sobre scaling laws: las dos graficas (`scaling_curves.png`) y las dos tablas de coeficientes permiten explicar en clase la forma isoFLOP, el intercambio profundidad-computo y los peligros de extrapolar ajustes con pocos puntos.
- Punto de partida para extensiones experimentales: al ser una reproduccion de coste bajo, es una base razonable para anadir profundidades adicionales, ampliar el rango de FLOPs o activar la metrica CORE para obtener una senal de calidad adicional a `val_bpb`.
- Comparacion de hardware para entrenamiento a pequena escala: los tiempos de pared registrados en `results.csv` permiten contrastar el coste de una A10G por punto frente a configuraciones mayores, como informacion para decisiones de aprovisionamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Lo que si se publican son resultados de escalado, que se reproducen a continuacion.

Leyes de potencia ajustadas (`val_bpb = A * FLOPs^-alpha`):

| Profundidad | A | alpha |
|---|---|---|
| d6 | 411,705 | 0,157 |
| d8 | 14316,854 | 0,249 |
| d10 | 4689,278 | 0,214 |

Profundidad optima por presupuesto:

| Presupuesto (FLOPs) | Profundidad optima | val_bpb |
|---|---|---|
| 1,000e+16 | d6 | 1,2956 |
| 2,150e+16 | d6 | 1,0884 |
| 4,640e+16 | d6 | 1,0183 |

La metrica principal, `val_bpb`, se calcula sobre un shard reservado de ClimbMix de 5,2 M de tokens. La metrica CORE esta desactivada, por lo que no hay contraste con una evaluacion agregada de tareas.

## Requisitos de hardware

- Entrenamiento del barrido: una GPU A10G (24 GB) por punto, un job independiente por punto. El barrido completo comprende tres profundidades por tres presupuestos de FLOPs.
- GPUs equivalentes en memoria: cualquier tarjeta de 24 GB, como RTX 3090, RTX 4090 o L4/A10 en cloud, es un sustituto razonable del A10G dado el tamano reducido de estos modelos (n_embd entre 384 y 640). No se publica VRAM pico exacta.
- Cabe en GPU de consumo: si, el hardware de referencia es una GPU de una sola unidad de 24 GB, propia del segmento profesional y del consumo alto (RTX 3090/4090). No hay datos publicados sobre despliegue en GPUs de 8-16 GB.
- Inferencia: no aplica. No se distribuyen pesos, de modo que no hay requisitos de VRAM para servir el modelo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables. El repositorio es un conjunto de resultados, no un artefacto de inferencia; para ejecutar el modelo subyacente habria que usar el codigo de nanochat y contar con checkpoints que no se publican aqui.
- Latencia y throughput: no disponibles en la informacion proporcionada. `results.csv` incluye el tiempo de pared por punto, pero sus valores no se reproducen aqui.
- Barrido de referencia: la receta original entrena profundidades 10-20 sobre 8xH100, con presupuestos de computo en el rango 1e18-1e19 FLOPs, aproximadamente 100 veces mayores que esta reproduccion.

## Comparativa con modelos similares

No hay modelos comparables en el sentido habitual, porque este repositorio no distribuye pesos. La comparacion relevante es contra el barrido de referencia del que deriva.

| Aspecto | Esta reproduccion (ML-Intern-lab) | Barrido de referencia (karpathy/nanochat) |
|---|---|---|
| Naturaleza | Repositorio de resultados (sin pesos) | Script de barrido dentro de un proyecto de entrenamiento |
| Presupuesto de computo | 1,000e+16 a 4,640e+16 FLOPs | 1e18 a 1e19 FLOPs (aprox. 100x mayor) |
| Profundidades | 6, 8, 10 | 10 a 20 |
| Hardware | 1x A10G por punto, un job por punto | 8x H100 |
| Metrica | val_bpb sobre 5,2 M tokens de ClimbMix; CORE desactivado | val_bpb, CORE disponible en el protocolo completo |
| Licencia | MIT | Segun el proyecto nanochat original |

Frente a otras reproducciones publicas de leyes de escalado no se dispone de informacion en la documentacion facilitada, por lo que la comparativa con alternativas adicionales queda como no disponible.

## Limitaciones y advertencias

- No es un modelo utilizable: no hay pesos, tokenizador ni configuracion de inferencia. Cualquier uso como modelo de lenguaje es inviable con este repositorio.
- Presupuestos muy pequenos: los rangos de FLOPs son aproximadamente 100 veces menores que los del barrido de referencia (1e18-1e19), por lo que los valores absolutos de bpb son mucho peores y los puntos de computo muy bajo son mas ruidosos.
- Poca cobertura experimental: tres profundidades y tres presupuestos generan muy pocos puntos por curva, lo que limita la fiabilidad de los ajustes. Los valores de A (411 hasta 14316) indican ajustes pobres en la zona de bajo computo.
- Extrapolacion no validada: dentro del rango testeado d6 es optima en los tres presupuestos. La conclusion de que el cruce hacia modelos mas profundos ocurre "justo por encima" de 4,64e16 FLOPs es una inferencia basada en el alpha ajustado de d8, no un resultado medido.
- Metrica unica y parcial: al desactivar CORE por coste, la evaluacion se reduce a val_bpb sobre un unico shard reservado de 5,2 M de tokens. No hay senal sobre capacidades concretas, sesgos, alucinacion ni comportamiento multilingue.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgos, toxicidad o alineacion para estos puntos del barrido.
- Riesgo de alucinacion: no evaluado y, en la practica, no aplicable, ya que no se distribuye un modelo para generar texto.
- Idioma: no se declara cobertura idiomatica. El unico dato es que el tokenizador BPE se entreno sobre 200 M de caracteres de ClimbMix, cuya composicion linguistica no se detalla en la informacion disponible.
- Licencia: MIT, permisiva para uso comercial del contenido publicado. Al no haber pesos, la licencia afecta a los resultados y graficas, no a un modelo. Para reutilizar el codigo de nanochat conviene revisar la licencia del proyecto original.
- Trazabilidad de la busqueda web: las busquedas realizadas no devolvieron resultados relevantes sobre este repositorio (aparecieron paginas sobre mililitros, la clase ML de Mercedes-Benz y desambiguaciones de "ML"), de modo que no hay fuentes externas que corroboren o amplien lo indicado en la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ML-Intern-lab/nanochat-scaling-laws
- Proyecto nanochat original (GitHub): https://github.com/karpathy/nanochat
- Mirror del proyecto nanochat en Hugging Face: https://huggingface.co/ML-Intern-lab/nanochat
- Script del barrido isoFLOP de referencia: https://huggingface.co/ML-Intern-lab/nanochat/blob/main/runs/scaling_laws.sh
- Grafica de curvas de escalado: https://huggingface.co/ML-Intern-lab/nanochat-scaling-laws (archivo `scaling_curves.png`)
- Tabla combinada de resultados por punto: https://huggingface.co/ML-Intern-lab/nanochat-scaling-laws (archivo `results.csv`)
- Entorno ML Intern citado por el autor: https://hf.co/chat?mode=ml-intern
