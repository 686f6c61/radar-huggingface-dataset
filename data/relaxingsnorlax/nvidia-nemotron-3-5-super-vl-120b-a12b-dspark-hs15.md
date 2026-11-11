# RelaxingSnorlax/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark-hs15

## Resumen

`RelaxingSnorlax/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark-hs15` es un checkpoint auxiliar de decodificacion especulativa (draft model) construido para medir el coste computacional del camino de hidden states en el metodo DSpark dentro de vLLM. No es un modelo de lenguaje autonomo: es un artefacto de benchmarking derivado de `RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark`, pensado para ablaciones sobre cuantas capas de hidden state del modelo objetivo consume el borrador especulativo.

La variante concreta usa 15 capas auxiliares de hidden state del modelo objetivo (`aux_hidden_state_layer_ids = [3, 9, 15, 21, 26, 32, 38, 44, 50, 56, 62, 67, 73, 79, 85]`), frente a las 5 capas del checkpoint entrenado original (ids `[17, 37, 59, 79, 87]`). El repositorio contiene 1.377.883.649 parametros en safetensors con un tamano de 2,8 GB, lo que corresponde a la cabeza borradora y su proyeccion combinadora, no al modelo de 120B referenciado en el nombre.

El detalle critico es que `fc.weight`, la proyeccion combinadora de hidden states con forma `[4096, 61440]` (4096 x 15*4096), fue reinicializada con valores aleatorios. El resto de tensores se copian sin cambios del checkpoint fuente. Por tanto, las tasas de aceptacion de este checkpoint son practicamente nulas (~0 tokens aceptados) y solo sirve para medir el coste del camino de hidden states: captura y transferencia de N salidas de capa en el lado del objetivo, la GEMM N x H -> H de la capa `fc` y el forward del borrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model de decodificacion especulativa DSpark (proyeccion combinadora de hidden states + forward del borrador); arquitectura interna del transformer no disponible |
| Parametros totales | 1.377.883.649 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El checkpoint es una variante de ablacion del draft model DSpark asociado a `NVIDIA-Nemotron-3.5-Super-VL-120B-A12B`. DSpark es un metodo de decodificacion especulativa que consume hidden states de varias capas del modelo objetivo: el borrador recibe las salidas de N capas seleccionadas, las combina mediante una proyeccion lineal `fc` de forma `[4096, 61440]` y ejecuta un forward propio para proponer tokens que el modelo objetivo verifica. En esta variante N = 15, con las capas `[3, 9, 15, 21, 26, 32, 38, 44, 50, 56, 62, 67, 73, 79, 85]`.

No hay entrenamiento real detras de esta variante: se genero con el script `make_dspark_hs_variants.py` a partir del checkpoint de `RedHatAI`, copiando todos los tensores salvo `fc.weight`, que se reinicializo aleatoriamente. El checkpoint fuente entrenado cubria 5 capas (`[17, 37, 59, 79, 87]`); esta variante no conserva esa correspondencia. El objetivo declarado es aislar el coste del camino de hidden states (captura y transferencia de N salidas de capa, la GEMM N x H -> H y el forward del borrador) frente a las lineas base entrenadas. No se dispone de datos sobre volumen de tokens, composicion del dataset ni tecnicas de alineacion del modelo fuente.

## Capacidades

- No genera texto de forma autonoma: es un componente auxiliar de decodificacion especulativa que debe ejecutarse junto a un modelo objetivo compatible con el metodo DSpark en vLLM.
- Propone tokens candidatos (`num_speculative_tokens` configurable, 7 en el ejemplo de la model card) que el modelo objetivo verifica.
- No soporta tool calling, function calling ni razonamiento multi-paso por si mismo.
- No tiene capacidades multilingues propias ni modo de pensamiento.
- No soporta vision ni audio de forma directa; el sufijo VL del nombre corresponde al modelo objetivo del que deriva la familia, no a este checkpoint.
- Su unica funcion util es instrumentar y medir el coste del camino de hidden states con 15 capas auxiliares.

## Casos de uso

- Ablacion del numero de capas de hidden state en DSpark: comparar el coste de captura y transferencia de 15 salidas de capa frente a las 5 del checkpoint entrenado, midiendo overhead en vLLM con `--speculative-config`.
- Medicion del coste de la GEMM `fc`: cronometrar la proyeccion `[4096, 61440]` (N x H -> H) de forma aislada para estimar su peso en la latencia total del borrador.
- Perfilado del forward del draft model: ejecutar el borrador con pesos validos salvo `fc` para aislar el tiempo del forward sin interferencia de la tasa de aceptacion.
- Validacion de pipelines de despliegue especulativo: probar la integracion de `vllm serve` con `method: dspark` y distintos valores de `num_speculative_tokens` antes de usar checkpoints entrenados.
- Estimacion de memoria y ancho de banda: el repo de 2,8 GB permite calcular el coste de transferencia de hidden states entre objetivo y borrador en distintos hardwares.
- Referencia negativa de control: al tener ~0 tokens aceptados, sirve como linea base inferior para verificar que el arnes de medicion detecta correctamente una tasa de aceptacion nula.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente que las tasas de aceptacion de este checkpoint son practicamente nulas (~0 tokens aceptados) y carecen de significado; solo son validas las mediciones de coste del camino de hidden states.

## Requisitos de hardware

- VRAM estimada para el checkpoint: aproximadamente 2,8 GB en safetensors; el requisito dominante es la memoria del modelo objetivo de 120B, no la del borrador.
- GPU recomendadas: no disponibles en la informacion proporcionada; en la practica el borrador se ejecuta junto al objetivo, por lo que el hardware viene determinado por este ultimo (A100, H100 o similares para un modelo de 120B).
- No cabe en GPU de consumo de forma aislada como sistema completo, ya que requiere el modelo objetivo de 120B; el borrador por si solo si cabria en GPUs consumer con suficiente VRAM libre.
- Opciones de despliegue: vLLM con `--speculative-config '{"model":"<usuario>/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark-hs15","num_speculative_tokens":7,"method":"dspark"}'`. Otros motores no estan documentados.
- Latencia y throughput: no disponibles; el checkpoint esta disenado precisamente para medirlos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Capas auxiliares | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`dspark-hs15`) | 1.377.883.649 | 15 (`[3, 9, ..., 85]`) | Ablacion de coste, `fc` aleatoria | apache-2.0 | Hugging Face |
| `RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark` | no disponible | 5 (`[17, 37, 59, 79, 87]`) | Draft model entrenado | no disponible | Hugging Face |
| Otras variantes `dspark-hs*` del mismo autor | no disponible | no disponible | Ablaciones equivalentes | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Pesos no funcionales: `fc.weight` es aleatoria, por lo que la tasa de aceptacion es practicamente nula y el checkpoint no acelera la inferencia real.
- No debe usarse en produccion ni como sustituto del draft model entrenado de `RedHatAI`.
- No es un modelo de lenguaje: no responde a prompts ni genera texto util por si mismo.
- Requiere un modelo objetivo compatible con DSpark y una version de vLLM que soporte `method: dspark` y `custom_code`.
- La licencia apache-2.0 cubre este repositorio, pero el uso del modelo objetivo subyacente se rige por su propia licencia, no indicada aqui.
- Sin datos de sesgos, alucinacion o cobertura idiomatica: no aplican al no ser un modelo generativo autonomo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RelaxingSnorlax/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark-hs15
- Checkpoint fuente: https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark
- Script de generacion citado en la model card: `make_dspark_hs_variants.py` (no se proporciona URL)
- Paper, blog o repositorio de DSpark: no disponible
