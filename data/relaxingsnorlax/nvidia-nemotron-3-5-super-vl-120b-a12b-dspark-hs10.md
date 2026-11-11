# RelaxingSnorlax/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark-hs10

## Resumen

Este repositorio contiene un checkpoint auxiliar de decodificacion especulativa (draft model) asociado a NVIDIA-Nemotron-3.5-Super-VL-120B-A12B, un modelo vision-lenguaje de tipo Mixture-of-Experts con 120B parametros totales y 12B activos segun su denominacion. El artefacto publicado por RelaxingSnorlax no es el modelo base, sino una variante de ablacion del draft model DSpark de RedHatAI, preparada para medir el coste de la ruta de hidden states en vLLM.

La variante concreta, etiquetada como `dspark-hs10`, configura diez capas auxiliares de hidden state (`aux_hidden_state_layer_ids = [4, 13, 22, 31, 40, 48, 57, 66, 75, 84]`) frente a las cinco del checkpoint original. El objetivo declarado es evaluar como el numero de capas de hidden state consumidas por el draft afecta a la velocidad y al overhead de inferencia con decodificacion especulativa.

Es relevante exclusivamente como herramienta de benchmarking: el tensor `fc.weight` (proyeccion combinadora de hidden states, forma `[4096, 40960]`) fue reinicializado con valores aleatorios, de modo que las tasas de aceptacion son practicamente nulas y el checkpoint no sirve para acelerar inferencia real. El repositorio pesa 2,6 GB y contiene 1.293.997.569 parametros en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model de decodificacion especulativa (DSpark) sobre target Nemotron-3.5-Super-VL-120B-A12B; transformer con proyeccion combinadora de hidden states (`fc.weight` de forma `[4096, 40960]`) |
| Parametros totales | 1.293.997.569 (draft model); modelo target: 120B segun denominacion, no verificado en este repo |
| Parametros activos | 12B en el target segun denominacion (MoE); no aplicable al draft |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con `custom_code` |

## Arquitectura y entrenamiento

El artefacto es un draft model para decodificacion especulativa del metodo DSpark, disenado para proponer tokens que el modelo target verifica en paralelo. La pieza diferencial es el consumo de hidden states intermedios del target: el draft recibe las salidas de N capas seleccionadas y las combina mediante una proyeccion lineal `fc` de forma `[4096, 40960]`, es decir, 4096 dimensiones de salida a partir de 10 x 4096 dimensiones de entrada en esta variante.

En el checkpoint de origen (RedHatAI), el `fc` entrenado cubria los ids `[17, 37, 59, 79, 87]` (cinco capas). Esta variante sustituye esa seleccion por diez capas `[4, 13, 22, 31, 40, 48, 57, 66, 75, 84]` y reinicializa `fc.weight` de forma aleatoria; el resto de tensores se copian sin cambios. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO en el pipeline original.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa en vLLM mediante `method: dspark`.
- Medicion del coste de captura y transferencia de hidden states en el lado del target (N salidas de capa).
- Medicion del coste de la GEMM de combinacion `N x H -> H` (10 x 4096 -> 4096).
- Medicion del coste del forward del draft.
- No soporta generacion de texto autonomo, tool calling, agentes, vision ni capacidades multilingues: es un componente auxiliar, no un modelo conversacional.
- Las tasas de aceptacion son nulas por diseno (pesos aleatorios en `fc`), por lo que no acelera inferencia.

## Casos de uso

- Ablacion del numero de capas de hidden state: comparar el overhead de la ruta de hidden states con 10 capas frente a las 5 del checkpoint entrenado, aislando el coste estructural del beneficio en aceptacion.
- Perfilado de latencia en vLLM: medir cuanto tiempo consume la captura y transferencia de 10 salidas de capa del target frente a 5, con el mismo resto de configuracion.
- Analisis de la GEMM de combinacion: cuantificar el coste de una proyeccion `[4096, 40960]` en el presupuesto total de inferencia del draft.
- Validacion de pipelines de decodificacion especulativa: comprobar que la configuracion `--speculative-config` con `num_speculative_tokens: 7` y `method: dspark` se carga y ejecuta correctamente antes de desplegar un draft entrenado.
- Estimacion de memoria y ancho de banda: el repo de 2,6 GB permite calcular el footprint del draft y su impacto en el reparto de VRAM junto al target de 120B.
- Referencia negativa en experimentos: al tener aceptacion ~0, sirve como linea base inferior para verificar que el resto de variantes con `fc` entrenado superan claramente ese umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las tasas de aceptacion de este checkpoint son meaningless (~0 tokens aceptados) y que solo debe usarse para medir el coste de la ruta de hidden states frente a las lineas base entrenadas.

## Requisitos de hardware

- VRAM del draft: aproximadamente 2,6 GB en safetensors sin cuantizar (1.293.997.569 parametros); el target de 120B requiere hardware muy superior y no se detalla en la informacion disponible.
- GPU recomendadas: no disponibles para el conjunto target+draft; para el draft aislado cabe en cualquier GPU consumer con al menos 4 GB libres.
- Cabe en GPU consumer: si, el draft aislado; el target de 120B no cabe en GPU consumer.
- Opciones de despliegue: vLLM con `--speculative-config '{"model":"<repo>","num_speculative_tokens":7,"method":"dspark"}'`. Otros motores (llama.cpp, Ollama, TGI) no estan documentados para este artefacto.
- Latencia y throughput: no disponibles; por diseno, este checkpoint no aporta aceleracion (aceptacion ~0) y solo anade overhead.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Estado |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark-hs10 (este) | 1,29B (draft) | no disponible | Draft DSpark con 10 capas aux., `fc` aleatorio | apache-2.0 | Benchmark, aceptacion ~0 |
| RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark | no disponible | no disponible | Draft DSpark con 5 capas aux. `[17,37,59,79,87]`, `fc` entrenado | no disponible | Funcional |
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B (target) | 120B totales / 12B activos | no disponible | Modelo vision-lenguaje MoE | no disponible | Modelo base |

## Limitaciones y advertencias

- Pesos corruptos por diseno: `fc.weight` es aleatorio, por lo que la tasa de aceptacion es practicamente nula y el checkpoint no acelera inferencia.
- No apto para produccion: es una variante de ablacion, no un draft entrenado.
- No es un modelo autonomo: no genera texto, no razona, no soporta vision ni tool calling por si mismo.
- Sin datos de sesgos, alucinacion o cobertura idiomatica: la informacion disponible no los documenta.
- Requiere `custom_code` y el metodo `dspark` en vLLM; no es portable a otros motores sin trabajo adicional.
- La licencia apache-2.0 cubre este repo, pero el uso del modelo target y del draft original depende de sus propias licencias, no verificadas aqui.
- Generado por `make_dspark_hs_variants.py`; conviene revisar ese script antes de reutilizar la configuracion.

## Enlaces

- Hugging Face: https://huggingface.co/RelaxingSnorlax/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark-hs10
- Checkpoint de origen: https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark
