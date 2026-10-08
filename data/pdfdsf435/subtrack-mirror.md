# pdfdsf435/subtrack-mirror

## Resumen

SubTrack++ es un framework de entrenamiento de modelos de lenguaje de gran tamano (LLM) disenado para reducir el consumo de memoria y el tiempo de pared (wall-time) del preentrenamiento. El repositorio pdfdsf435/subtrack-mirror es un espejo (mirror) alojado en HuggingFace, publicado el 8 de octubre de 2026, con 0 descargas y 0 likes, sin licencia declarada y sin idiomas indicados. No contiene pesos de modelo: aloja el codigo y la documentacion del framework de entrenamiento.

El metodo combina tres tecnicas: seguimiento de subespacios de gradiente de tipo Grassmann (Grassmannian gradient subspace tracking), un optimizador consciente de la proyeccion (projection-aware) que extiende Adam, y escalado de recuperacion de gradientes (recovery scaling). Segun sus autores, alcanza una loss de evaluacion de ultima generacion manteniendo la eficiencia de memoria de metodos de bajo rango como GaLore, y reduce el wall-time de preentrenamiento hasta un 43% en modelos LLaMA de hasta 7000 millones de parametros.

El trabajo esta firmado por Sahar Rajabi, Nayeema Nonta y Sirisha Rambhatla, y fue aceptado en la 39 edicion de la conferencia NeurIPS (2025). Su relevancia actual radica en que permite entrenar con todos los parametros (full-parameter training) manteniendo una huella de memoria propia de tecnicas de bajo rango, lo que abarata el preentrenamiento en entornos con GPUs limitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un framework de entrenamiento; opera sobre arquitecturas transformer tipo LLaMA) |
| Parametros totales | no disponible (no distribuye pesos; validado en modelos LLaMA de hasta 7B) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo de entrenamiento usa bfloat16, no cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene codigo, no pesos) |

## Arquitectura y entrenamiento

SubTrack++ no define una arquitectura de red neuronal propia, sino un procedimiento de optimizacion para el entrenamiento. Se apoya en el seguimiento de subespacios de gradiente de baja dimension mediante actualizaciones geometricas (Grassmannian), evitando el calculo costoso de la descomposicion en valores singulares (SVD). Sobre esa base extiende el optimizador Adam para que sus estimaciones de momento reflejen los cambios del subespacio a lo largo del entrenamiento, y anade un mecanismo de recovery scaling que recupera y reescala los componentes de gradiente descartados para mejorar la convergencia y la generalizacion.

El codigo se construye sobre el repositorio de GaLore. La configuracion de ejemplo para un LLaMA de 1B sobre el dataset C4 incluye los siguientes hiperparametros: rank 512, subspace_update_interval 200, low_rank_scale 0.25, optimizador low_rank_adamw, st_init_step_size 10000, batch_size 8, total_batch_size 16, num_training_steps 10000, warmup_steps 1000, weight_decay 0, learning rate 1e-4 y dtype bfloat16. El entrenamiento puede lanzarse en una unica GPU con la opcion --single_gpu de torchrun. No se detalla en la informacion disponible la composicion completa del dataset ni si se emplearon fases de RLHF o DPO, ya que el enfoque es de preentrenamiento.

## Capacidades

- Preentrenamiento de LLM con actualizacion de todos los parametros manteniendo una huella de memoria propia de metodos de bajo rango.
- Seguimiento de subespacios de gradiente de baja dimension sin calculo de SVD, con actualizaciones geometricas robustas durante el entrenamiento.
- Optimizador consciente de la proyeccion que mantiene actualizaciones de momento precisas a medida que el subespacio evoluciona.
- Escalado de recuperacion de gradientes descartados para reforzar el rendimiento de entrenamiento y la generalizacion.
- Reduccion del wall-time de preentrenamiento de hasta un 43% en modelos LLaMA de hasta 7B segun los autores.
- Entrenamiento en una sola GPU en el ejemplo documentado (LLaMA 1B sobre C4).
- No es un modelo generativo: no realiza generacion de texto, razonamiento, codigo, matematicas ni vision, y no soporta tool calling ni agentes por si mismo.

## Casos de uso

- Preentrenamiento de un LLaMA de 1B sobre C4 en una unica GPU: el script de ejemplo permite reproducir el flujo completo con torchrun y la opcion --single_gpu, util para laboratorios con recursos limitados.
- Ajuste de modelos de hasta 7B con presupuesto de memoria reducido: al mantener la eficiencia de GaLore con entrenamiento de parametros completos, encaja en entornos donde no cabe un optimizador Adam estandar.
- Reproduccion de resultados academicos: el repositorio incluye scripts de ejemplo y referencias al paper, lo que permite verificar las cifras de loss y wall-time publicadas.
- Comparacion de optimizadores de bajo rango: sirve como banco de pruebas frente a GaLore u otros metodos low-rank bajo la misma configuracion de modelo y dataset.
- Investigacion sobre dinamica de subespacios de gradiente: la parte de seguimiento Grassmannian y recovery scaling es reutilizable para estudiar la evolucion de subespacios durante el entrenamiento.
- Reduccion de coste en pipelines de preentrenamiento continuado: la menor huella de memoria permite reutilizar GPUs de gama media para fases de entrenamiento largo.
- Desarrollo de nuevas variantes del optimizador: al extender Adam con logica de proyeccion, el codigo es un punto de partida para experimentar con reglas de actualizacion alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma una reduccion de hasta el 43% del wall-time de preentrenamiento respecto a metodos previos en modelos LLaMA de hasta 7B, sin tablas numericas detalladas. No se aportan cifras de MMLU, HumanEval, GSM8K ni de evaluacion de loss con valores concretos.

## Requisitos de hardware

- Es un framework de entrenamiento, no de inferencia; los requisitos se refieren a entrenamiento.
- El ejemplo documentado (LLaMA 1B sobre C4) se ejecuta en una sola GPU mediante torchrun con --single_gpu.
- El metodo esta validado en modelos LLaMA de hasta 7B parametros.
- La eficiencia de memoria es comparable a la de GaLore y otros metodos de bajo rango, por lo que reduce la VRAM necesaria frente a un optimizador Adam de parametros completos.
- No se especifican en la informacion disponible modelos de GPU concretos (A100, H100, RTX 4090), VRAM exacta, latencia ni throughput.
- Opciones de despliegue: el propio repositorio basado en GaLore; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que son herramientas de inferencia y no aplican a este framework.

## Comparativa con modelos similares

| Framework | Tipo | Base | Entrenamiento | Reduccion de wall-time | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SubTrack++ | Optimizacion de bajo rango con seguimiento de subespacios | Construido sobre GaLore | Full-parameter con memoria baja | Hasta 43% en LLaMA hasta 7B | no disponible | Repositorio espejo en HuggingFace |
| GaLore | Proyeccion de gradientes de bajo rango | Repositorio base | Full-parameter con memoria baja | Referencia de comparacion | no disponible | GitHub publico (jiaweizzhao/GaLore) |
| LoRA | Adaptacion de bajo rango (PEFT) | Fine-tuning de adaptadores | Solo adaptadores, no parametros completos | no disponible | no disponible | Ampliamente extendido |

No se dispone de datos comparativos de rendimiento numerico entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado ni pesos: es un framework de entrenamiento, por lo que no puede usarse directamente para inferencia.
- No se declara licencia, lo que impide determinar si su uso comercial esta permitido.
- Se trata de un espejo no oficial (mirror) publicado por un tercero, sin validacion por parte de los autores originales.
- La model card indica que se identificaron y corrigieron errores en la implementacion y que los resultados del paper han sido verificados, lo que sugiere que versiones previas del codigo podian contener fallos.
- Las afirmaciones de rendimiento (reduccion del 43% de wall-time) provienen de los autores y no se acompanan de tablas de benchmarks en la informacion disponible.
- No se detallan sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma, ya que no es un modelo generativo.
- No se especifican requisitos exactos de VRAM, GPUs recomendadas ni metricas de latencia o throughput.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pdfdsf435/subtrack-mirror
- Perfil del autor: https://huggingface.co/pdfdsf435
- Modelos del autor: https://huggingface.co/pdfdsf435/models
- Paper (OpenReview, NeurIPS 2025): https://openreview.net/forum?id=6geRIdlFWJ
- Repositorio base GaLore: https://github.com/jiaweizzhao/GaLore
