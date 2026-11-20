# ikimyaii/Mamba-370M-semi-structured-Wanda-80pct

## Resumen

Mamba-370M-semi-structured-Wanda-80pct es una variante podada del modelo base state-spaces/mamba-370m-hf, publicado por el usuario ikimyaii en Hugging Face. Se trata de un experimento de poda one-shot (sin reentrenamiento posterior) aplicada con el codigo oficial de Wanda sobre un transformer de estado (SSM) de la familia Mamba. El objetivo declarado por el autor es servir como baseline para otros modelos de su cuenta (los denominados EHWS), no como un modelo listo para produccion.

El modelo conserva la arquitectura original de Mamba-370M (SSM selectivo con bloques Mamba y proyecciones lineales internas) pero elimina el 80% de los pesos en las capas lineales de cada bloque (`in_proj`, `x_proj`, `out_proj`), manteniendo densos `dt_proj`, `conv1d`, `A_log`, `D`, los embeddings y el `lm_head`. El resultado es un checkpoint de 423.003.136 parametros reales en safetensors, con una esparsidad medida de 0,7840 en las capas podadas.

La relevancia de esta ficha es acotada: no hay licencia declarada, no hay idiomas declarados, no hay pipeline asignado y las metricas publicadas muestran un deterioro severo (perplejidad de 2171,73 en WikiText-2 y 1669,70 en C4, y una media de 0,3301 en zero-shot). Es util como referencia tecnica de hasta donde llega la poda Wanda sin fine-tuning en arquitecturas SSM, pero no como modelo de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (SSM selectivo, bloques Mamba con proyecciones lineales internas) |
| Parametros totales | 423.003.136 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Mamba-370M-hf se evalua con secuencias de 2.048 tokens en la calibracion, pero no se declara contexto maximo) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor advierte que Mamba desborda en fp16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (carga con `AutoModelForCausalLM.from_pretrained` en `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba-370M en su version HF (state-spaces/mamba-370m-hf), un modelo de espacio de estados selectivo con bloques Mamba que sustituyen la atencion por recurrencia lineal selectiva. Sobre esa base, el autor aplica poda semi-estructurada one-shot con el codigo oficial de Wanda (locuslab/wanda, commit 8e8fc87, rama unstructured, `use_variant=False`): cada fila elimina los pesos con menor puntuacion `|W| * sqrt(||X||)`. Wanda ya poda el mismo numero de pesos por fila por defecto, de ahi que la esparsidad medida (0,7840) sea ligeramente inferior al 80% nominal por pesos que quedan exactamente a cero.

El proceso de calibracion usa el loader oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden y cada bloque se calibra sobre las salidas de los bloques ya podados anteriores, siguiendo los drivers oficiales; el recorrido de capas es codigo nuevo del autor porque los drivers oficiales solo cubren OPT y LLaMA. La poda se realiza en bfloat16 y tarda 2,1 minutos en una A100 de 40 GB. No hay reentrenamiento ni destilacion posterior: es un checkpoint puramente podado.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base Mamba-370M-hf, aunque con calidad muy degradada por la poda (ver benchmarks).
- Razonamiento y conocimiento factual: residual y fuertemente afectado; las metricas zero-shot caen a niveles cercanos al azar en varias tareas.
- Codigo y matematicas: no hay evidencia publicada de rendimiento en estas tareas para este checkpoint.
- Tool calling / function calling: no soportado de forma nativa ni documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no declaradas; el autor no especifica idiomas.
- Capacidades especiales (thinking mode, vision, audio): ninguna.
- Carga estandar via `transformers` con `AutoModelForCausalLM.from_pretrained`, lo que facilita su uso como objeto de estudio.

## Casos de uso

- Baseline de investigacion en poda: sirve como referencia cuantitativa (perplejidad y zero-shot) frente a los modelos EHWS del mismo autor y frente a variantes con fine-tuning posterior a la poda. Es su uso principal declarado.
- Estudio de robustez de arquitecturas SSM frente a compresion: permite medir como degrada Mamba cuando se elimina el 80% de los pesos en las proyecciones lineales, comparandolo con transformers clasicos podados con la misma tecnica.
- Reproducibilidad de experimentos Wanda: al usar el codigo oficial y documentar calibracion, semilla y tiempos, facilita replicar el pipeline en otras arquitecturas no cubiertas por los drivers oficiales (OPT, LLaMA).
- Analisis de esparsidad real vs. nominal: la discrepancia entre el 80% nominal y el 0,7840 medido (por pesos que quedan a cero) es un caso de estudio util para quien implemente kernels sparse.
- Docencia y divulgacion: ejemplo practico de poda one-shot, calibracion por bloques y evaluacion con lm-evaluation-harness en un modelo pequeno (0,8 GB de repo).
- Pruebas de infraestructura de inferencia: por su tamano reducido, sirve para validar pipelines de carga en `transformers` y medir latencia/throughput sin consumir recursos significativos, aunque no para evaluar calidad.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4), en bfloat16:

| Metrica | WikiText-2 | C4 |
|---|---|---|
| Este modelo | 2171,73 | 1669,70 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Este modelo |
|---|---|
| arc_challenge | 0,2048 |
| arc_easy | 0,2849 |
| boolq | 0,3783 |
| hellaswag | 0,2630 |
| openbookqa | 0,1500 |
| rte | 0,5271 |
| winogrande | 0,5028 |
| Media | 0,3301 |

No se han publicado en la informacion disponible resultados del modelo base sin podar ni de alternativas comparables para establecer la delta exacta de degradacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 0,8 GB en bfloat16; en la practica cabe en cualquier GPU consumer con 4 GB o mas, y en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 en adelante, A100, H100) es sobredimensionada para este modelo; el autor uso una A100 de 40 GB solo para el proceso de poda (2,1 minutos).
- Cabe en GPU consumer: si, en practicamente todas las GPU con soporte bfloat16; en fp16 el autor advierte que Mamba desborda, por lo que conviene mantener bf16 o usar fp32.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (soporte oficial declarado). No hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI para este checkpoint podado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M Wanda 80%) | 423.003.136 | no disponible | PPL WikiText-2 2171,73; media zero-shot 0,3301 | no disponible | Hugging Face |
| state-spaces/mamba-370m-hf (base sin podar) | ~370M (nominal) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Alternativas podadas de la misma cuenta (EHWS) | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciadas por el autor) |

No se dispone de datos suficientes para comparar con modelos de poda equivalentes de otros autores.

## Limitaciones y advertencias

- Calidad severamente degradada: perplejidad de 2171,73 en WikiText-2 y media zero-shot de 0,3301, con tareas como openbookqa (0,1500) y arc_challenge (0,2048) cerca del azar. No es apto para generacion de texto de uso real.
- Poda one-shot sin reentrenamiento: no hay recuperacion de capacidad tras la poda; el autor lo presenta explicitamente como baseline, no como modelo final.
- Licencia no declarada: no se puede asumir uso comercial ni redistribucion; hay que contactar con el autor o consultar la licencia del modelo base.
- Idiomas no declarados: no hay garantia de comportamiento multilingue.
- Riesgo de alucinacion elevado: con esta degradacion de perplejidad, la generacion es basicamente inutilizable en produccion.
- Precaucion con fp16: el autor advierte que Mamba desborda en fp16; usar bfloat16 o fp32.
- Sesgos: no documentados, pero heredados del dataset de entrenamiento del modelo base (no especificado en la informacion disponible).
- Contexto maximo no declarado: la calibracion usa 2.048 tokens, pero no se confirma el limite operativo.
- Soporte de tooling limitado: solo se documenta carga via `transformers`; no hay evidencia de soporte en motores de inferencia optimizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-Wanda-80pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Codigo oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Repositorio de Mamba (state-spaces): no disponible en la informacion proporcionada
- Paper de Wanda: no disponible en la informacion proporcionada
- Paper de Mamba: no disponible en la informacion proporcionada
- Demo: no disponible
