# erenextlabs/pusula-mlx-8bit

## Resumen

Pusula MLX 8-bit es una adaptación del modelo de decisión Decision 3.0 (vllm-sr/d3) cuantizado a 8 bits con MLX para su ejecución en Apple silicon, junto con el adaptador LoRA de Pusula v2.0 sin modificar. Lo desarrolla Erenext Labs y está pensado para responder, en una sola pasada forward, preguntas tipadas asociadas a cada mensaje con una probabilidad por opción, sin generación de texto. Es decir, no es un modelo conversacional: es un clasificador de decisión estructurado para turco.

El modelo base Decision 3.0 tiene 26 000 millones de parámetros (25 624 595 456 según los pesos safetensors) y licencia Apache-2.0. Pusula MLX 8-bit ocupa 27,3 GB de pesos (28,1 GB con el adaptador) y está medido en un Mac con M3 Max y 36 GB de memoria unificada. Su relevancia radica en que permite ejecutar localmente en hardware de Apple un modelo de 26B con una precisión cercana a BF16 en GPU (diferencia de 0,06 puntos en micro y macro), evitando depender de un servidor con GPU.

La versión 8-bit no aporta una mejora medible frente a la 6-bit (diferencia emparejada no significativa, z de −0,68 para el base y −1,02 para Pusula) y consume más memoria; el propio autor recomienda la versión de 6 bits salvo que se necesite la máxima fidelidad numérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone de texto de Decision 3.0) con atención no causal en el contrato de prompt d3; adaptador LoRA de rango 32 sobre la salida |
| Parametros totales | 25 624 595 456 (aproximadamente 26B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (token budget de evaluación: 1024) |
| Tipos de cuantizacion | MLX affine, group size 64; esta versión es 8-bit (existen variantes 4-bit y 6-bit) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX); adaptador LoRA y code readout en `adapter/` |

## Arquitectura y entrenamiento

El repositorio no entrena nada: cuantiza una sola vez el backbone de texto de vllm-sr/d3 con `python -m pusula.mlx_d3 convert --bits 8` usando cuantización afín de MLX con group size 64, y aplica en tiempo de ejecución el adaptador LoRA de Pusula v2.0 (rango 32) en precisión completa sobre los pesos cuantizados. El adaptador se mantiene sin cambios respecto al original; su entrenamiento se describe en la model card de Pusula.

La innovación técnica clave no es la arquitectura en sí, sino el contrato de prompt de d3: el modelo no genera texto, sino que produce una probabilidad por cada opción de una pregunta tipada en una única pasada forward. El code readout, el adaptador y la atención no causal se implementan en `pusula.mlx_d3`, por lo que la carga con `mlx-lm` genérico no es suficiente.

## Capacidades

- Clasificación de decisión: responde preguntas tipadas con una probabilidad por opción en una sola pasada, sin generación de texto.
- Evaluación de decisiones sobre mensajes: asocia a cada mensaje un conjunto de preguntas y devuelve distribuciones de probabilidad por opción.
- Calibración: reporta ECE (Expected Calibration Error) con 15 bins (0,032 para Pusula en 8-bit).
- Adaptador LoRA conmutable: se puede desactivar (`--base`) para obtener el modelo base Decision 3.0 sin el adaptador.
- Ejecución local en Apple silicon mediante el paquete `pusula` con extra MLX.
- No soporta tool calling, agentes ni razonamiento multi-step en el sentido de un LLM generativo; es un modelo de clasificación.
- Multilingüe: no; solo turco.

## Casos de uso

- Enrutamiento de mensajes en turco: dado un mensaje de entrada, el modelo asigna probabilidades a opciones de decisión (por ejemplo, categoría o acción), lo que permite enrutar tickets o consultas en un pipeline sin generación de texto.
- Moderación y triaje local: clasificar mensajes entrantes en un Mac de sobremesa sin enviar datos a un servidor externo, aprovechando la ventana de 1024 tokens del contrato de evaluación.
- Etiquetado asistido de datos: usar las probabilidades por opción como señal de anotación débil para construir datasets de entrenamiento en turco.
- Investigación en calibración: el modelo expone ECE y predicciones por pregunta, útil para estudiar calibración de clasificadores de decisión.
- Evaluación comparativa de cuantizaciones: permite reproducir el benchmark turco de decisión y comparar 4-bit, 6-bit y 8-bit frente a BF16 en GPU.
- Prototipado en Apple silicon: validar un sistema de decisión antes de desplegarlo en GPU, con una diferencia de 0,06 puntos respecto a BF16.

## Benchmarks y rendimiento

Evaluación completa del Turkish Decision Benchmark (2 194 mensajes, 19 861 preguntas) en un Apple M3 Max con 36 GB de memoria unificada. Micro accuracy (%) / macro accuracy (%) / ECE (15 bins):

| Ejecución | Base Decision 3.0 | Pusula | Ganancia Pusula (micro) |
|---|---|---|---|
| MLX 8-bit (este repositorio) | 87,44 / 88,47 / 0,008 | 91,38 / 92,20 / 0,032 | +3,94 |
| GPU BF16 | 87,50 / 88,52 / 0,009 | 91,41 / 92,22 / 0,031 | +3,91 |

Con el ajuste v2.0 (preguntas personalizadas respondidas por el base Decision 3.0), la precisión macro es 92,02. Memoria y velocidad en M3 Max con 36 GB: pesos 27,3 GB (descarga 28,1 GB con el adaptador), pico de memoria de 30,8 GB con Pusula (token budget 1024, límite de 2 GB de buffer cache, 100 preguntas), y 161 tokens de prompt por segundo para el base Decision 3.0.

## Requisitos de hardware

- VRAM/memoria unificada: 27,3 GB de pesos; pico medido de 30,8 GB con Pusula en M3 Max de 36 GB.
- Hardware medido: Apple silicon Mac con M3 Max y 36 GB de memoria unificada. Máquinas más pequeñas no se han medido.
- No cabe en GPUs de consumo con menos de 32 GB de memoria; en Apple silicon requiere al menos 36 GB para el pico medido.
- Despliegue: paquete `pusula` con extra MLX (`pip install "pusula[mlx] @ git+https://github.com/erenextlabs/pusula@v2.1"`); la interfaz `D3Engine` y el servidor HTTP `pusula-serve` no funcionan en MLX.
- Velocidad: 161 tokens de prompt/s para el base Decision 3.0; no se reporta throughput de generación (no genera texto).
- Alternativas de cuantización: 4-bit (14,4 GB de pesos) y 6-bit (20,9 GB, recomendada).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (micro/macro) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pusula MLX 8-bit | 26B | No disponible (budget 1024) | 91,38 / 92,20 | Apache-2.0 | Hugging Face, MLX |
| Pusula MLX 6-bit | 26B | No disponible (budget 1024) | Diferencia no significativa frente a 8-bit | Apache-2.0 | Hugging Face, MLX |
| Pusula MLX 4-bit | 26B | No disponible (budget 1024) | No disponible en la información | Apache-2.0 | Hugging Face, MLX |
| Decision 3.0 GPU BF16 | 26B | No disponible | 91,41 / 92,22 (con Pusula) | Apache-2.0 | Hugging Face, GPU |

## Limitaciones y advertencias

- Se aplican las limitaciones de Pusula v2.0 descritas en su model card.
- `pusula.mlx_d3` solo puntúa ficheros de preguntas desde línea de comandos; `D3Engine` y `pusula-serve` no funcionan en MLX.
- Memoria y velocidad medidas solo en M3 Max con 36 GB; no hay datos para máquinas más pequeñas.
- Resultados medidos únicamente en el Turkish Decision Benchmark; se recomienda evaluar en datos propios antes de desplegar.
- La concordancia por pregunta con GPU BF16 no se ha medido todavía.
- Solo soporta turco; no es un modelo generativo ni soporta tool calling o agentes.
- Riesgo de alucinación no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas en dominios distintos al benchmark (ECE de 0,032 frente a 0,008 del base).
- La versión 8-bit no aporta ganancia medible frente a la 6-bit y consume más memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erenextlabs/pusula-mlx-8bit
- Modelo base Pusula: https://huggingface.co/erenextlabs/pusula
- Modelo base Decision 3.0: https://huggingface.co/vllm-sr/d3
- Versión 6-bit: https://huggingface.co/erenextlabs/pusula-mlx-6bit
- Versión 4-bit: https://huggingface.co/erenextlabs/pusula-mlx-4bit
- Dataset Turkish Decision Benchmark: https://huggingface.co/datasets/erenextlabs/turkish-decision-benchmark
- Guía MLX: https://github.com/erenextlabs/pusula/blob/v2.1/benchmark/README_MLX.md
- Repositorio Pusula: https://github.com/erenextlabs/pusula
- MLX: https://github.com/ml-explore/mlx
