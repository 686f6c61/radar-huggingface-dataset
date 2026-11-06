# sady4850/Qwen3.8-27B-4bit-GPTQ-agent

## Resumen

`sady4850/Qwen3.8-27B-4bit-GPTQ-agent` es un checkpoint experimental de cuantizacion publicado por el usuario sady4850 sobre el modelo base `Qwen/Qwen3.8-27B`. Se trata de una cuantizacion GPTQ de 4 bits en el formato exacto de MLX affine 4-bit con grupo de tamano 64, replicando la disposicion de `mlx-community/Qwen3.8-27B-4bit`. El objetivo declarado es estudiar el efecto de calibrar exclusivamente con trazas de agente sobre la calidad de la cuantizacion en tareas de razonamiento y tool calling.

El checkpoint forma parte de un estudio de calibracion para agentes: a diferencia de la variante GPTQ estandar del mismo autor, esta version se calibro solo con 128 fragmentos de trazas de agente (128 x 2048 tokens). Segun la model card, esto reduce la divergencia KL en razonamiento de agente y tool calling un 41 % respecto a la variante GPTQ general, pero degrada el texto general hasta niveles de RTN. Es, por tanto, un artefacto de investigacion orientado a evaluar el compromiso entre especializacion y calidad general en la cuantizacion.

El modelo cuenta con 27.356.728.560 parametros (unos 27,36 mil millones) y esta publicado bajo licencia Apache 2.0. El repositorio ocupa 16,1 GB y usa la libreria MLX, por lo que esta pensado para ejecutarse en hardware Apple Silicon. La ficha del modelo base no aporta detalles sobre arquitectura ni contexto, y la model card de este checkpoint tampoco los especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; tag `qwen3_5`) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4-bit en formato MLX affine, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4-bit |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `Qwen/Qwen3.8-27B`; el tag `qwen3_5` sugiere la familia Qwen 3.5, pero no se confirma si es un transformer denso, MoE o hibrido. Lo que si se describe con precision es el proceso de cuantizacion: se aplica GPTQ sobre el modelo base en la disposicion MLX affine 4-bit con grupo de 64, identica a la del checkpoint `mlx-community/Qwen3.8-27B-4bit`, y con el mismo esquema GPTQ que la variante `sady4850/Qwen3.8-27B-4bit-GPTQ`.

La innovacion del checkpoint es la calibracion: en lugar de usar un corpus generico, se emplearon exclusivamente 128 fragmentos de trazas de agente de 2048 tokens cada uno. El autor reporta que, frente a la variante GPTQ general, la divergencia KL en razonamiento de agente baja un 41 % (IC 95 % [-44 %, -39 %], valor 0,0153) y en tool calling de agente tambien un 41 % ([-45 %, -35 %], valor 0,0035). La tasa de llamadas identicas a bf16 sube 7,9 puntos (hasta el 62,3 %, IC [+4,0, +11,7]). Como contrapartida, la divergencia KL en texto tipo wiki sube un 54 % (0,0566) y en chat un 54 % (0,1521). No se documentan datos de entrenamiento del modelo base ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y razonamiento, heredadas del modelo base Qwen3.8-27B.
- Razonamiento de agente y tool calling / function calling, con calidad de cuantizacion optimizada especificamente para estas tareas.
- Procesamiento image-text-to-text: el pipeline declarado es multimodal (entrada de imagen y texto).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluacion de cuantizacion para agentes: sirve como referencia para medir cuanto degrada el 4-bit GPTQ el razonamiento y el tool calling frente a bf16, usando las metricas KLD y tasa de llamadas identicas que reporta el autor.
- Pipelines de agentes en Apple Silicon: al estar en formato MLX, permite ejecutar un modelo de 27 B en Mac con memoria unificada y probar flujos de tool calling con una calidad de cuantizacion calibrada para ese dominio.
- Prototipado de asistentes con vision: el pipeline image-text-to-text permite experimentar con entradas de imagen y texto en local antes de pasar a produccion.
- Investigacion sobre calibracion de cuantizacion: el checkpoint y su gemelo `agentmix` permiten comparar el efecto de calibrar solo con trazas de agente frente a mezclas mas generales.
- Desarrollo de agentes multi-paso en local: util para iterar sobre prompts y esquemas de herramientas sin depender de APIs, aceptando la perdida de calidad en texto general.
- Banco de pruebas de regresion: las 49 tareas del conjunto de evaluacion del autor pueden reproducirse para validar cambios en el stack de inferencia MLX.

## Benchmarks y rendimiento

Los unicos datos publicados son las comparaciones del autor frente a la variante GPTQ general `sady4850/Qwen3.8-27B-4bit-GPTQ`, con intervalos de confianza al 95 % sobre 49 tareas:

| Metrica (vs GPTQ general) | Variacion | Valor |
|---|---|---|
| KLD en razonamiento de agente | -41 % [-44 %, -39 %] | 0,0153 |
| KLD en tool calling de agente | -41 % [-45 %, -35 %] | 0,0035 |
| Llamadas identicas a bf16 | +7,9 puntos [+4,0, +11,7] | 62,3 % |
| KLD en texto wiki (torch) | +54 % | 0,0566 |
| KLD en chat (torch) | +54 % | 0,1521 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repo pesa 16,1 GB en 4-bit, por lo que se necesita al menos ese espacio mas overhead de inferencia; en la practica, un unificado de 24 GB o mas es lo recomendable.
- GPU: al estar en formato MLX, esta orientado a Apple Silicon (series M1/M2/M3/M4 con memoria unificada suficiente); no se documenta soporte para A100, H100 o RTX 4090 en este checkpoint.
- Cabe en consumer GPU: no confirmado; el formato MLX no es el habitual para GPUs NVIDIA, aunque el esquema GPTQ subyacente podria reconvertirse (no documentado por el autor).
- Despliegue: libreria MLX (`mlx`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| sady4850/Qwen3.8-27B-4bit-GPTQ-agent | 27,36 B | GPTQ 4-bit MLX, calibrado con trazas de agente | no disponible | Apache 2.0 | Especializado en agente; degrada texto general |
| sady4850/Qwen3.8-27B-4bit-GPTQ | 27,36 B | GPTQ 4-bit, calibracion general | no disponible | Apache 2.0 | Referencia del estudio; mejor en texto general |
| mlx-community/Qwen3.8-27B-4bit | 27,36 B | MLX affine 4-bit, group size 64 | no disponible | Apache 2.0 | Mismo layout, sin GPTQ |
| Qwen/Qwen3.8-27B (bf16) | 27,36 B | bf16 | no disponible | Apache 2.0 | Referencia de calidad completa |

## Limitaciones y advertencias

- Checkpoint experimental: el propio autor lo describe como parte de un estudio de calibracion, no como un modelo listo para produccion.
- Degradacion en texto general: la KLD en wiki y chat sube un 54 % frente a la variante GPTQ general, por lo que no es adecuado para generacion de texto general de alta calidad.
- Solo el 62,3 % de las llamadas de herramienta coinciden con bf16: un 37,7 % de las llamadas pueden diferir, lo que exige validacion en produccion.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni de tasa de alucinacion; se heredan los del modelo base, no caracterizados en esta ficha.
- Idiomas: no se especifica la cobertura linguistica.
- Contexto: no se indica la longitud de contexto soportada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el checkpoint experimental.
- Formato MLX: limita el despliegue a entornos Apple Silicon salvo conversion manual no documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ-agent
- Variante con resumen y conjunto de evaluacion: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix
- Variante GPTQ de referencia: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint MLX de referencia: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
