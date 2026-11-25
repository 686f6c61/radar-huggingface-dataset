# erenextlabs/pusula-mlx-4bit

## Resumen

Pusula MLX 4-bit es la variante cuantizada a 4 bits para Apple silicon del modelo de decisión Pusula, desarrollado por el laboratorio de IA de Erenext. Se trata de un modelo especializado en clasificación de texto y enrutamiento de decisiones: dado un mensaje en turco, responde preguntas tipadas devolviendo una probabilidad para cada opción posible en un único forward pass, sin generar texto. El modelo subyacente es Decision 3.0 (vllm-sr/d3), un backbone de 26.000 millones de parámetros con licencia Apache-2.0, sobre el que se aplica en tiempo de ejecución un adaptador LoRA (rango 32) denominado Pusula v2.0.

La relevancia de esta ficha concreta radica en que permite ejecutar el modelo en un Mac con Apple silicon sin necesidad de servidor GPU. La cuantización se realizó con MLX (cuantización afín, tamaño de grupo 64), reduciendo los pesos a 14,4 GB. Según la model card, la precisión micro y macro de Pusula se mantiene a 0,02 puntos del BF16 en GPU, mientras que el modelo base sin adaptador pierde alrededor de 0,5 puntos a 4 bits.

El modelo está orientado exclusivamente al turco y su uso principal es la clasificación y el enrutamiento de decisiones en pipelines de aplicación, no la generación libre de texto. Requiere el paquete `pusula` con el extra MLX, ya que `mlx-lm` genérico no es suficiente para cargar la lectura de código, el adaptador y la atención no causal del contrato de prompt de d3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone de Decision 3.0, vllm-sr/d3) con adaptador LoRA sobre atención no causal; cuantización MLX afín |
| Parametros totales | 25.624.595.456 (≈25,6 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de tokens de 4096 usado en la medición de memoria) |
| Tipos de cuantizacion | 4 bits (MLX afín, group size 64); existen versiones 6-bit y 8-bit |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); adaptador LoRA en `adapter/` |
| Tamano de pesos | 14,4 GB (descarga total 15,3 GB con adaptador) |
| Modelo base | erenextlabs/pusula (revision db9b467) sobre vllm-sr/d3 |
| Libreria | pusula (extra MLX) |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El modelo es una cuantización del backbone textual de Decision 3.0 (vllm-sr/d3) realizada con MLX mediante `python -m pusula.mlx_d3 convert --bits 4`, usando cuantización afín con tamaño de grupo 64. Sobre los pesos cuantizados se aplica en tiempo de ejecución, en precisión completa, el adaptador LoRA Pusula v2.0 (rango 32), que no fue reentrenado para este repositorio. La inferencia emplea atención no causal según el contrato de prompt de d3 y una "code readout" para producir probabilidades por opción en un solo forward pass, sin decodificación autoregresiva de texto.

No se realizó entrenamiento alguno para este repositorio: el adaptador es el Pusula v2.0 sin modificar, y su entrenamiento se describe en la model card de Pusula. La innovación técnica destacable es el enfoque de decisión: en lugar de generar una respuesta textual, el modelo puntúa cada opción de una pregunta tipada, lo que permite obtener distribuciones de probabilidad calibradas (ECE reportado) y enrutar decisiones en aplicaciones.

## Capacidades

- Clasificación de texto y respuesta a preguntas tipadas con probabilidad por opción en un único forward pass.
- Enrutamiento de decisiones (routing) dentro de pipelines de aplicación.
- Salida calibrada: se reporta ECE (15 bins) además de precisión micro y macro.
- Adaptador LoRA aplicado en tiempo de ejecución sobre pesos cuantizados.
- Ejecución en Apple silicon sin servidor GPU.
- Capacidad multilingüe: limitada al turco.
- No soporta generación de texto libre, tool calling, agentes ni razonamiento multi-paso según la información disponible.

## Casos de uso

- Enrutamiento de decisiones en aplicaciones turcas: dado un mensaje del usuario, el modelo devuelve la probabilidad de cada opción de una pregunta tipada, permitiendo seleccionar la rama de un flujo con umbrales calibrados.
- Clasificación de intenciones en asistentes conversacionales: se formula la intención como pregunta tipada y se usa la distribución de probabilidad para decidir la acción siguiente.
- Moderación y etiquetado de contenido en turco: preguntas tipadas como `duygu` o `eylem_gerekli` permiten etiquetar mensajes con probabilidades en lugar de texto generado.
- Desarrollo y prototipado en portátiles Mac: al caber en 14,4 GB de pesos y requerir unos 20,9 GB de pico de memoria, permite iterar localmente sin GPU dedicada.
- Evaluación offline de pipelines de decisión: el comando `python -m pusula.mlx_d3 eval` puntúa ficheros de preguntas y genera informes de precisión por tipo de pregunta, útil para validar umbrales antes de desplegar.
- Investigación sobre calibración: el ECE reportado y la comparación entre cuantizaciones (4, 6 y 8 bits) permiten estudiar el efecto de la cuantización en modelos de decisión.

## Benchmarks y rendimiento

Resultados sobre el Turkish Decision Benchmark (2.194 mensajes, 19.861 preguntas), medidos en un Apple M3 Max con 36 GB de memoria unificada. Precisión micro (%) / macro (%) / ECE (15 bins):

| Ejecucion | Base Decision 3.0 | Pusula | Ganancia Pusula (micro) |
|---|---|---|---|
| MLX 4-bit (este repositorio) | 86,92 / 88,08 / 0,009 | 91,39 / 92,20 / 0,032 | +4,47 |
| GPU BF16 | 87,50 / 88,52 / 0,009 | 91,41 / 92,22 / 0,031 | +3,91 |

Memoria y velocidad en M3 Max con 36 GB:

| Metrica | Valor |
|---|---|
| Pesos | 14,4 GB (descarga 15,3 GB con adaptador) |
| Pico de memoria, Pusula | 20,9 GB (presupuesto de 4096 tokens, límite de caché de 2 GB, 100 preguntas) |
| Velocidad, base Decision 3.0 | 172 tokens de prompt/s |
| Maquinas mas pequenas | no medidas |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 14,4 GB de pesos; pico medido de 20,9 GB con presupuesto de 4096 tokens.
- Hardware medido: Apple M3 Max con 36 GB de memoria unificada.
- Cabe en Mac con Apple silicon; no se midieron máquinas más pequeñas.
- No está pensado para GPU CUDA en esta variante: requiere el paquete `pusula` con extra MLX y `pusula.mlx_d3`.
- Opciones de despliegue: `pip install "pusula[mlx]"` desde el repositorio GitHub, descarga con `hf download` y evaluación con `python -m pusula.mlx_d3 eval`.
- Limitación de despliegue: la interfaz Python `D3Engine` y el servidor HTTP `pusula-serve` no funcionan en MLX; solo se soporta la puntuación por línea de comandos.
- Latencia y throughput: 172 tokens de prompt/s para el modelo base en M3 Max; no se reportan cifras para Pusula con adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (micro/macro) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pusula-mlx-4bit (este) | 25,6 B | no disponible | 91,39 / 92,20 | Apache-2.0 | MLX, Apple silicon |
| pusula-mlx-6bit | 25,6 B | no disponible | no disponible en la informacion | Apache-2.0 | MLX, 20,9 GB de pesos |
| pusula-mlx-8bit | 25,6 B | no disponible | no disponible en la informacion | Apache-2.0 | MLX, 27,3 GB de pesos |
| Pusula GPU BF16 | 25,6 B | no disponible | 91,41 / 92,22 | Apache-2.0 | GPU |

## Limitaciones y advertencias

- Aplican las limitaciones de Pusula v2.0 descritas en su model card.
- Solo soporta turco; no es adecuado para otros idiomas.
- El modelo base a 4 bits pierde alrededor de 0,5 puntos frente a BF16, principalmente en `duygu` y `eylem_gerekli`.
- El resultado de Pusula en `insana_devret` difiere del de 6 bits, 8 bits y GPU BF16 (84,78 frente a 83,77 a 8 bits, McNemar exacto p 0,0005).
- La concordancia por pregunta con GPU BF16 no se ha medido todavía.
- `D3Engine` y `pusula-serve` no funcionan en MLX; solo se dispone de puntuación por línea de comandos.
- Memoria y velocidad solo se midieron en un M3 Max con 36 GB; no hay datos para máquinas menores.
- Los resultados se midieron únicamente en el Turkish Decision Benchmark; se recomienda evaluar con datos propios antes de desplegar.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento (ECE de 0,032 en Pusula frente a 0,009 del base).
- Licencia Apache-2.0 permite uso comercial, sujeto a las condiciones de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/erenextlabs/pusula-mlx-4bit
- Modelo base Pusula: https://huggingface.co/erenextlabs/pusula
- Decision 3.0 (vllm-sr/d3): https://huggingface.co/vllm-sr/d3
- Version 6-bit: https://huggingface.co/erenextlabs/pusula-mlx-6bit
- Version 8-bit: https://huggingface.co/erenextlabs/pusula-mlx-8bit
- Dataset Turkish Decision Benchmark: https://huggingface.co/datasets/erenextlabs/turkish-decision-benchmark
- Repositorio GitHub de Pusula: https://github.com/erenextlabs/pusula
- Guia MLX: https://github.com/erenextlabs/pusula/blob/v2.1/benchmark/README_MLX.md
- MLX: https://github.com/ml-explore/mlx
