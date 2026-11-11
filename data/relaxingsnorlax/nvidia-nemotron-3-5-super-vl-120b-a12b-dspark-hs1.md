# RelaxingSnorlax/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark-hs1

## Resumen

Este repositorio contiene una variante de benchmarking del modelo borrador (draft) DSpark para decodificacion especulativa, derivada de `RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark`. No es un modelo generativo utilizable: se trata de un checkpoint de pesos aleatorios disenado exclusivamente para medir el coste computacional de la ruta de hidden-states en el proceso de decodificacion especulativa dentro de vLLM. El modelo objetivo al que acompana es NVIDIA Nemotron 3.5 Super VL 120B A12B, un modelo vision-lenguaje de tipo Mixture of Experts.

El checkpoint pesa 2,3 GB y contiene 1.143.002.625 parametros en formato safetensors con codigo personalizado (`custom_code`). La unica diferencia respecto al checkpoint original es que el tensor `fc.weight` (proyeccion combinadora de hidden-states, forma `[4096, 4096]`) se ha reinicializado con valores aleatorios; el resto de tensores se copian sin modificar. Por tanto, la tasa de aceptacion de tokens especulativos es practicamente nula (~0 tokens aceptados) y el checkpoint solo sirve para aislar y medir el sobrecoste de la ruta de captura y transferencia de estados ocultos.

Su relevancia es acotada pero tecnica: permite a ingenieros de inferencia cuantificar el overhead de configurar una sola capa auxiliar de hidden-state (`aux_hidden_state_layer_ids = [44]`) frente a las cinco capas del checkpoint entrenado (`[17, 37, 59, 79, 87]`), comparando coste de captura en el modelo objetivo, la GEMM `N x H -> H` y el forward del borrador. Es material de ablacion, no un modelo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador DSpark para decodificacion especulativa (draft model), derivado de Nemotron 3.5 Super VL 120B A12B; pesos en safetensors con `custom_code` |
| Parametros totales | 1.143.002.625 |
| Parametros activos | no disponible (el modelo objetivo es MoE 120B-A12B, pero este repo solo contiene el borrador) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`), repo de 2,3 GB |

## Arquitectura y entrenamiento

El checkpoint es un modelo borrador de decodificacion especulativa del metodo DSpark, pensado para emparejarse con el modelo objetivo NVIDIA Nemotron 3.5 Super VL 120B A12B (MoE vision-lenguaje con 120B parametros totales y 12B activos, segun la nomenclatura). El borrador consume estados ocultos del modelo objetivo a traves de una proyeccion combinadora `fc` de forma `[4096, 4096]`, que en el checkpoint original entrenado cubria las capas `[17, 37, 59, 79, 87]`. En esta variante se ha reducido a una unica capa auxiliar (`aux_hidden_state_layer_ids = [44]`), de modo que la matriz `fc` pasa de `4096 x 5*4096` a `4096 x 1*4096`.

No hay entrenamiento real en este repositorio: `fc.weight` se reinicializa aleatoriamente y el resto de tensores se copian literales del checkpoint de `RedHatAI`. El objetivo declarado es una ablacion del efecto del numero de capas de hidden-state consumidas por el borrador sobre la velocidad y el overhead de inferencia en vLLM. El script generador es `make_dspark_hs_variants.py`. No se documentan datos de entrenamiento, tokens, composicion del dataset ni fases de RLHF/DPO para este artefacto.

## Capacidades

- No genera texto ni realiza inferencia utilizable: los pesos aleatorios de `fc.weight` anulan la aceptacion especulativa (~0 tokens aceptados).
- Sirve como banco de pruebas para medir el coste de la ruta de hidden-states: captura y transferencia de N salidas de capa desde el objetivo, GEMM `N x H -> H` y forward del borrador.
- Permite comparar el overhead de 1 capa auxiliar frente a las 5 del checkpoint entrenado de referencia.
- Integracion con vLLM mediante `--speculative-config` con `"method":"dspark"` y `num_speculative_tokens`.
- No soporta tool calling, agentes, vision ni capacidades multilingues por si mismo; esas capacidades pertenecen al modelo objetivo Nemotron 3.5 Super VL 120B A12B.
- No dispone de modo thinking ni de ninguna capacidad generativa propia.

## Casos de uso

- Ablacion de capas de hidden-state en decodificacion especulativa: ejecutar vLLM con este borrador y con el checkpoint entrenado de 5 capas para cuantificar cuanto ahorra reducir la captura de estados ocultos a una sola capa, midiendo latencia y throughput del servidor.
- Perfilado del overhead de transferencia de hidden-states: aislar el coste de copiar salidas de capa desde el modelo objetivo (120B) hacia el borrador, util para decidir si el cuello de botella esta en la captura, en la GEMM o en el forward del draft.
- Validacion de configuracion de vLLM: comprobar que la configuracion `{"num_speculative_tokens":7,"method":"dspark"}` arranca y se comporta correctamente antes de desplegar el checkpoint entrenado en un cluster de produccion.
- Benchmark de infraestructura GPU: usar el checkpoint como carga sintetica reproducible para comparar latencias entre A100, H100 y otras GPUs sin depender de la variabilidad de aceptacion de tokens.
- Regresion de rendimiento en CI: integrar el checkpoint en pipelines internos que detecten degradaciones en el coste del camino especulativo tras cambios de version de vLLM o del driver CUDA.
- Estudio de escalado del borrador: comparar esta variante de 1 capa con otras variantes de `N` capas generadas por el mismo script para trazar la curva coste/beneficio del numero de capas auxiliares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las tasas de aceptacion de este checkpoint son "meaningless (~0 accepted tokens)" y que solo debe usarse para medir el coste de la ruta de hidden-states frente a las lineas base entrenadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el borrador ocupa 2,3 GB en safetensors (1.143.002.625 parametros en precision de checkpoint); a esto hay que sumar la VRAM del modelo objetivo Nemotron 3.5 Super VL 120B A12B, que domina el consumo total.
- GPU recomendadas: no disponible de forma especifica para este checkpoint; el modelo objetivo de 120B requiere GPUs de centro de datos (A100/H100/H200) con tensor parallelism o despliegue multi-GPU.
- Cabe en GPU de consumo: el borrador por si solo si (2,3 GB), pero es inutil sin el modelo objetivo, que no cabe en GPUs de consumo convencionales.
- Opciones de despliegue: vLLM con `--speculative-config '{"model":"...","num_speculative_tokens":7,"method":"dspark"}'`; no se documentan otras rutas (llama.cpp, Ollama, TGI).
- Latencia y throughput estimados: no disponible; precisamente este checkpoint existe para medirlos en cada entorno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`dspark-hs1`) | 1.143.002.625 | no disponible | Ablacion de 1 capa de hidden-state, pesos aleatorios | Apache 2.0 | Hugging Face |
| `RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark` | no disponible | no disponible | Borrador DSpark entrenado con 5 capas (`[17, 37, 59, 79, 87]`) | no disponible en la informacion | Hugging Face |
| NVIDIA Nemotron 3.5 Super VL 120B A12B (objetivo) | 120B totales, 12B activos | no disponible | Modelo vision-lenguaje MoE | no disponible en la informacion | Referenciado como modelo objetivo |

## Limitaciones y advertencias

- Pesos aleatorios en `fc.weight`: la aceptacion especulativa es practicamente nula, por lo que cualquier metrica de calidad o de speedup real sera enganosa.
- Uso exclusivo para benchmarking: no debe desplegarse como borrador en produccion ni presentarse como sustituto del checkpoint entrenado de `RedHatAI`.
- Requiere el modelo objetivo Nemotron 3.5 Super VL 120B A12B para funcionar; no es autonomo.
- Dependencia de `custom_code`: la carga exige `trust_remote_code` y revision del codigo antes de ejecutarlo en entornos sensibles.
- Sin datos de sesgos, alucinacion o comportamiento multilingue: al no generar texto, estas categorias no aplican al artefacto, pero si al modelo objetivo con el que se empareje.
- Licencia Apache 2.0 permisiva para uso comercial, aunque el uso comercial de este checkpoint concreto carece de sentido tecnico por sus pesos aleatorios.
- Sin resultados publicados de latencia ni throughput: los numeros dependen del hardware, de la version de vLLM y del modelo objetivo elegido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RelaxingSnorlax/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark-hs1
- Checkpoint de origen: https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark
- Script generador citado en la model card: `make_dspark_hs_variants.py` (no se proporciona URL)
- Documentacion de decodificacion especulativa en vLLM: no disponible en la informacion proporcionada
