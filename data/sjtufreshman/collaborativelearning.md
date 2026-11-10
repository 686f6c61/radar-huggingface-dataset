# SJTUFreshman/collaborativelearning

## Resumen

Collaborative Learning (CL) es un conjunto de adaptadores LoRA de rango 64 publicados por SJTUFreshman (Universidad Jiao Tong de Shanghai) que implementa un marco de razonamiento multiagente sobre modelos Qwen3 "rebanados" (sliced). La idea central es que varios modelos pequenos (Qwen3-1.7B, Qwen3-4B y Qwen3-8B) colaboren en tareas de razonamiento manteniendo un presupuesto total de parametros comparable al de un unico modelo mayor, en este caso Qwen3-14B. El repositorio no contiene pesos completos, sino adaptadores PEFT entrenados sobre los checkpoints base de Qwen3.

El metodo combina tres piezas: particionado del modelo (model slicing), destilacion de protocolo (protocol distillation) para que los agentes compartan un estado de tarea comun, y supervision en piramide (pyramid supervision) para coordinar los pasos de razonamiento entre modelos de distinto tamano. Se evalua en cuatro familias de tareas (QA multi-salto, matematicas, generacion de codigo y generacion con restricciones) sobre cinco benchmarks: MuSiQue, GSM-Hard, MATH, MultiPL-E y Conifer.

La relevancia actual radica en que propone una alternativa a escalar un solo modelo: repartir el computo entre varios modelos heterogeneos coordinados. Segun la model card, supera a Qwen3-14B en las diez metricas reportadas y obtiene una mejora media de 2,38 puntos porcentuales. El repositorio ocupa 39 GB y esta pensado como material de reproduccion experimental mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformers Qwen3 densos |
| Parametros totales | No disponible (adaptadores sobre bases de 1.7B, 4B y 8B; rango LoRA 64) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA/PEFT) |
| Modelos base | Qwen/Qwen3-1.7B, Qwen/Qwen3-4B, Qwen/Qwen3-8B |
| Libreria | peft |
| Tamano del repositorio | 39.0 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Los artefactos publicados son adaptadores LoRA de rango 64 entrenados mediante PEFT sobre tres checkpoints densos de la familia Qwen3 (1.7B, 4B y 8B). No se trata de un modelo unico, sino de un conjunto de adaptadores organizados por benchmark (MuSiQue, GSM-Hard, MATH, MultiPL-E, Conifer), que se combinan en un protocolo de colaboracion multiagente. El entrenamiento emplea destilacion de protocolo para alinear el estado de tarea compartido entre los agentes y supervision en piramide para coordinar los pasos de razonamiento entre modelos de distinto tamano.

La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset de ajuste ni si se aplico RLHF o DPO; solo indica las bases y los benchmarks de evaluacion. La innovacion tecnica destacable es el esquema de colaboracion heterogenea: modelos de distinto tamano se reparten el razonamiento manteniendo un coste de parametros comparable al de un modelo mayor (Qwen3-14B), con un protocolo comun que permite construir sobre el estado de tarea compartido a lo largo de varios pasos.

## Capacidades

- Razonamiento multi-paso en QA multi-salto (benchmark MuSiQue).
- Razonamiento matematico numerico robusto (GSM-Hard) y a nivel de competicion (MATH).
- Generacion de codigo con evaluacion pass@1 en ocho lenguajes (MultiPL-E).
- Generacion con restricciones explicitas y cobertura (Conifer).
- Colaboracion multiagente heterogenea entre modelos de 1.7B, 4B y 8B.
- Generacion de texto en ingles (unico idioma declarado).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Razonamiento matematico asistido: desplegar el adaptador de MATH sobre Qwen3-8B para resolver problemas de nivel competicion con verificacion por pasos; el modelo reporta 78,40 % de acierto en el scorer del paper.
- Resolucion de problemas aritmeticos robustos: usar el adaptador de GSM-Hard en pipelines de tutoria o validacion de calculos donde los enunciados presentan variaciones que rompen modelos mas simples.
- QA multi-salto sobre documentacion: emplear el adaptador de MuSiQue para responder preguntas que requieren componer informacion de varias fuentes, aprovechando el estado de tarea compartido entre agentes.
- Generacion de codigo multilingue: integrar el adaptador de MultiPL-E en entornos de asistencia a programadores que necesiten pass@1 en ocho lenguajes, con evaluacion automatizada en CI.
- Generacion con restricciones: usar el adaptador de Conifer para producir salidas que cumplan restricciones explicitas (formato, cobertura de campos) en tareas de extraccion o plantillas.
- Investigacion en sistemas multiagente: reproducir los experimentos de colaboracion heterogenea comparando CL con MAD, AgentVerse, AFlow, GPTSwarm, MAGRPO, MAPoRL o AT-GRPO usando los adaptadores y el repositorio de codigo asociado.
- Prototipado de razonamiento distribuido: estudiar como repartir el computo entre varios modelos pequenos en lugar de escalar a uno grande, con presupuesto de parametros controlado.

## Benchmarks y rendimiento

Valores en porcentaje reportados en el paper (no reevaluados sobre esta release). MuSiQue, GSM-Hard y MATH usan accuracy / F1; MultiPL-E usa pass@1 ponderado / macro-lenguaje; Conifer usa Coverage / Explicit.

| Metodo | MuSiQue | GSM-Hard | MATH | MultiPL-E | Conifer |
|---|---:|---:|---:|---:|---:|
| Qwen3-14B | 39.55 / 49.70 | 68.94 / 80.69 | 74.60 / 82.86 | 55.18 / 57.34 | 88.00 / 95.72 |
| SE-RL | 41.76 / 52.73 | 68.18 / 79.67 | 76.00 / 80.70 | 60.43 / 62.55 | 88.00 / 95.81 |
| MAD | 39.51 / 50.59 | 66.67 / 74.18 | 72.40 / 81.32 | 55.03 / 55.35 | 88.55 / 95.84 |
| AgentVerse | 41.99 / 52.85 | 71.97 / 78.44 | 68.20 / 79.42 | 59.25 / 59.83 | 87.74 / 95.86 |
| AFlow | 41.83 / 50.36 | 68.18 / 76.04 | 65.00 / 76.53 | 42.83 / 42.46 | 87.92 / 96.51 |
| GPTSwarm | 36.20 / 47.37 | 70.45 / 78.39 | 69.20 / 79.90 | 51.63 / 52.43 | 88.17 / 95.96 |
| MAGRPO | 40.13 / 51.74 | 65.91 / 76.44 | 65.00 / 76.01 | 49.93 / 49.93 | 88.58 / 95.82 |
| MAPoRL | 40.59 / 52.74 | 63.64 / 75.34 | 70.80 / 80.87 | 53.25 / 53.27 | 86.37 / 89.19 |
| AT-GRPO | 41.54 / 53.51 | 64.39 / 76.86 | 74.20 / 83.70 | 57.91 / 58.74 | 86.60 / 95.85 |
| Homo. MAS | 26.40 / 32.82 | 71.21 / 79.93 | 68.20 / 76.41 | 56.36 / 57.20 | 88.02 / 94.27 |
| Homo. CL | 36.00 / 47.19 | 60.61 / 76.51 | 68.60 / 77.95 | 53.33 / 52.65 | 88.15 / 95.22 |
| **CL (ours)** | **42.37 / 53.43** | **71.97 / 81.15** | **78.40 / 85.25** | **59.39 / 59.63** | **88.90 / 95.90** |

CL es mejor o empatado en el mejor resultado en 6 de las 10 metricas, mejora a Qwen3-14B en las diez y gana una media de 2,38 puntos porcentuales sobre esa referencia. En MATH obtiene 392/500 aciertos (78,40 % de accuracy, 85,25 % de F1). Conjuntos de evaluacion: 2.417 ejemplos de MuSiQue, 132 de GSM-Hard, 500 problemas de MATH, 1.352 de MultiPL-E y 1.402 trayectorias de Conifer. El checkpoint exacto de MultiPL-E 8B usado para el resultado reportado no esta disponible en la release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Depende del modelo base elegido (1.7B, 4B u 8B) y de la cuantizacion; los adaptadores LoRA anaden una sobrecarga pequena sobre el base.
- GPU recomendadas: no especificadas. Por tamano de base, Qwen3-1.7B y Qwen3-4B pueden ejecutarse en GPUs de consumo; Qwen3-8B requiere GPUs de mayor VRAM o cuantizacion.
- Cabe en consumer GPU: probablemente para las bases de 1.7B y 4B segun cuantizacion; no confirmado por el autor.
- Opciones de despliegue: PEFT (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan documentados para esta release.
- Latencia y throughput: no disponibles. La model card menciona una comparacion de coste de salida ponderado por parametros e invocaciones medias por tarea (Figura 4), pero sin cifras en el texto extractado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CL (este) | Adaptadores sobre 1.7B/4B/8B | No disponible | Multiagente heterogeneo con LoRA | No disponible | Adaptadores en HF (39 GB) |
| Qwen3-14B | 14B | No disponible | Modelo denso unico | No disponible | Base publica |
| Homo. MAS | No disponible | No disponible | Multiagente homogeneo | No disponible | Baseline del paper |
| AT-GRPO | No disponible | No disponible | Entrenamiento multiagente con GRPO | No disponible | Baseline del paper |

CL se compara en el paper con Qwen3-14B y con sistemas multiagente (MAD, AgentVerse, AFlow, GPTSwarm, MAGRPO, MAPoRL, AT-GRPO, Homo. MAS, Homo. CL). Frente a Qwen3-14B, CL gana en las diez metricas con una media de +2,38 puntos; frente a los sistemas multiagente, destaca en MATH (78,40 frente a 76,00 de SE-RL) y MuSiQue (42,37 frente a 41,99 de AgentVerse).

## Limitaciones y advertencias

- Solo se declara ingles; no hay soporte multilingue documentado.
- Licencia no disponible: no puede confirmarse el uso comercial.
- No es un modelo autocontenido: requiere cargar los checkpoints base de Qwen3 y aplicar los adaptadores LoRA.
- El checkpoint exacto de MultiPL-E 8B usado en el resultado reportado no esta incluido en la release, lo que impide reproducir esa cifra al pie de la letra.
- Los benchmarks son valores del paper, no una reevaluacion de estos pesos; pueden no reproducirse de forma identica.
- Riesgo de alucinacion y sesgos: no documentados por el autor; aplican los del modelo base Qwen3.
- Repositorio de 39 GB y orientado a reproduccion experimental; no hay guia de despliegue en produccion ni latencias publicadas.
- El numero de descargas y likes es cero y la fecha de creacion es reciente, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SJTUFreshman/collaborativelearning
- Repositorio de codigo: https://github.com/SJTUFreshman/tmp_x7k9p4r2d8m5c
- Figura 1 (overview): https://huggingface.co/SJTUFreshman/collaborativelearning/resolve/main/assets/figures/Figure1.pdf
- Figura 2 (slicing, protocol distillation, pyramid supervision): https://huggingface.co/SJTUFreshman/collaborativelearning/resolve/main/assets/figures/Figure2.pdf
- Figura 3 (ablation): https://huggingface.co/SJTUFreshman/collaborativelearning/resolve/main/assets/figures/Figure3.pdf
- Checkpoints MuSiQue: https://huggingface.co/SJTUFreshman/collaborativelearning/tree/main/MuSiQue
- Checkpoints GSM-Hard: https://huggingface.co/SJTUFreshman/collaborativelearning/tree/main/GSM-Hard
- Checkpoints MATH: https://huggingface.co/SJTUFreshman/collaborativelearning/tree/main/MATH
- Checkpoints MultiPL-E: https://huggingface.co/SJTUFreshman/collaborativelearning/tree/main/MultiPL-E
- Checkpoints Conifer: https://huggingface.co/SJTUFreshman/collaborativelearning/tree/main/Conifer
- Benchmark MuSiQue: https://github.com/StonyBrookNLP/musique
- Benchmark MultiPL-E: https://github.com/nuprl/MultiPL-E
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
