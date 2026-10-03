# dhanesh-hf/Jarvis-Titan-M4-GRPO-Final

## Resumen

J.A.R.V.I.S. Titan 14.8B MoE-M4 (GRPO-Final) es un modelo de razonamiento autorregresivo desarrollado por el usuario dhanesh-hf. Combina un transformer disperso de tipo Mixture-of-Experts (MoE) con una arquitectura de memoria neuronal recurrente siempre activa, inspirada en el paradigma Titans. El modelo parte del checkpoint `dhanesh-hf/Jarvis-Titan-M4-Activated` y se ha ajustado posteriormente mediante Critic-Free Group Relative Policy Optimization (GRPO) con aprendizaje por refuerzo a partir de recompensas verificables (RLVR), sobre hardware Google Cloud TPU v5e-8.

El modelo tiene 14.800 millones de parametros totales y activa aproximadamente 3.800 millones por token, gracias a un esquema de 1 experto compartido mas Top-2 de 8 expertos enrutados por bloque MoE. El backbone consta de 28 capas de transformer con puentes de memoria recurrente intercalados en 7 puntos estrategicos. La longitud de contexto nativa es de 32.768 tokens, gestionada mediante atencion de ventana deslizante local complementada con persistencia de estado neuronal recurrente y una cache de elementos salientes.

Su relevancia radica en la combinacion de tres ideas poco frecuentes en un mismo modelo: memoria neuronal recurrente de estado persistente, enrutamiento adaptativo a la longitud (MAG-3 Adaptive Gate) y decodificacion especulativa mediante una cabeza auxiliar de prediccion multi-token (MTP, k=2). El entrenamiento se encuentra al 53,5% del curriculum planificado (paso 2.275 de 4.250), por lo que se trata de un checkpoint en estado intermedio de desarrollo. La licencia es propietaria de investigacion (JTRL-v1.0) y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso de 28 capas con puentes de memoria neuronal recurrente (paradigma Titans) |
| Parametros totales | 14,8 mil millones |
| Parametros activos | ~3,8 mil millones por token (1 experto compartido + Top-2 de 8 expertos enrutados) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | JTRL-v1.0 (propietaria, uso de investigacion; `license: other`) |
| Formato de pesos | no disponible (libreria declarada: transformers; tamano del repositorio: 970 GB) |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone transformer de 28 capas con bloques MoE dispersos. Cada bloque MoE emplea 1 experto compartido mas los 2 mejores de 8 expertos enrutados, lo que fija la computa activa en torno a 3.800 millones de parametros por token frente a los 14.800 millones totales. Sobre este backbone se intercalan 7 puentes de memoria recurrente que combinan tres mecanismos: atencion de ventana deslizante local, una cache de elementos salientes (salient cache) y memoria neuronal persistente. El enrutamiento se gestiona mediante MAG-3 Adaptive Gate, una puerta adaptativa a la longitud que transiciona desde el procesamiento de sintaxis local hacia la memoria recurrente a medida que crece el contexto.

El ajuste posterior se realizo con Critic-Free GRPO, en el que se generan K = 8 rollouts paralelos por prompt y se puntuan mediante sandboxes deterministas y aislados (no hay modelo critico separado). Las recompensas son verificables (RLVR), con metricas declaradas de pass@1, pass@8, equivalencia SymPy para matematicas y pytest en sandbox para codigo. El entrenamiento se ejecuto en Google Cloud TPU v5e-8 y se encuentra al 53,5% del curriculum (paso 2.275 de 4.250). Se declara una divergencia KL de politica de 0,0086 (objetivo < 0,0200), un pass@8 de exploracion del 93,57% en descubrimiento de soluciones verificadas y un throughput de 240-450 tokens por segundo en las 8 nucleos de TPU v5e. El modelo incorpora ademas una cabeza auxiliar de prediccion multi-token (MTP, k=2) para decodificacion especulativa, y se apoya en JAX/TPU.

## Capacidades

- Generacion de texto autorregresiva en ingles.
- Razonamiento de multiples pasos con soporte de test-time training y memoria neuronal persistente.
- Razonamiento matematico con verificacion por equivalencia simbolica (SymPy).
- Generacion de codigo con verificacion mediante ejecucion en sandbox (pytest).
- Decodificacion especulativa mediante cabeza MTP (k=2) para acelerar la generacion.
- Exploracion de soluciones: pass@8 de 93,57% en descubrimiento de soluciones verificadas segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles declarado.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Razonamiento matematico verificable: el modelo puede generar derivaciones paso a paso y validar el resultado mediante equivalencia SymPy, lo que lo hace adecuado para pipelines de resolucion de problemas donde la correccion debe comprobarse de forma automatica.
- Generacion de codigo con validacion en sandbox: dado que el ajuste RLVR usa recompensas de pytest, el modelo encaja en flujos que generan codigo y lo validan ejecutandolo en entornos aislados antes de aceptarlo.
- Analisis de documentos largos en ingles: con 32.768 tokens de contexto y memoria recurrente, es util para resumir o razonar sobre informes, papers o registros extensos sin truncar.
- Asistentes de razonamiento multi-paso: la combinacion de memoria persistente y test-time training permite mantener cadenas de razonamiento largas en tareas tipo problema-respuesta.
- Prototipado de investigacion en memorias neuronales: por su arquitectura Titans y sus puentes de memoria, sirve como banco de pruebas para estudiar memoria recurrente en transformers.
- Servicio de inferencia con decodificacion especulativa: la cabeza MTP (k=2) permite desplegar generacion acelerada en entornos donde la latencia importa.
- Evaluacion de tecnicas RLVR: el checkpoint, con su curriculum parcial y sus metricas de KL y pass@8, es un caso de estudio para investigar GRPO sin critico.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar como MMLU, HumanEval o GSM8K. Los unicos datos de rendimiento disponibles son los siguientes:

| Metrica | Valor | Nota |
|---|---|---|
| Pass@8 de exploracion | 93,57% | Descubrimiento de soluciones verificadas |
| Divergencia KL de politica | 0,0086 | Objetivo < 0,0200 (convergido) |
| Cobertura del curriculum | 53,5% | Paso 2.275 de 4.250 en TPU v5e-8 |
| Throughput | 240-450 tokens/s | Sobre 8 nucleos de TPU v5e |

No se han publicado resultados comparables de MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 14,8B parametros en FP16/BF16 ocuparian en torno a 30 GB de pesos, y en cuantizacion de 4 bits alrededor de 8 GB, aunque la model card no confirma cuantizaciones soportadas.
- GPU recomendadas: no disponibles. El entrenamiento declarado se realizo en Google Cloud TPU v5e-8, no en GPU.
- Compatibilidad con GPU de consumo: no confirmada. El repositorio ocupa 970 GB, lo que sugiere multiples checkpoints o pesos en alta precision y complica su uso directo en hardware de consumo sin conversion previa.
- Opciones de despliegue: la libreria declarada es transformers; el stack de entrenamiento es JAX/TPU. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 240-450 tokens por segundo sobre 8 nucleos de TPU v5e, segun la model card. No hay datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jarvis-Titan-M4-GRPO-Final | 14,8B | ~3,8B | 32.768 | JTRL-v1.0 (propietaria) | HuggingFace (0 descargas) |
| DeepSeek-V2-Lite | ~15,7B | ~2,4B | 32.768 | DeepSeek (personalizada) | Abierta |
| Qwen3-30B-A3B | ~30B | ~3B | 32.768 nativo (extensible) | Apache 2.0 | Abierta |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32.768 | Apache 2.0 | Abierta |

No es posible comparar rendimiento numerico porque Jarvis-Titan-M4 no publica benchmarks estandar ni los modelos de referencia se han evaluado en las mismas condiciones en la informacion disponible. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Checkpoint en estado intermedio: el entrenamiento esta al 53,5% del curriculum, por lo que el comportamiento puede ser inestable o incompleto respecto a la version final.
- Idiomas: unico idioma declarado el ingles; no hay soporte multilingue confirmado.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; como modelo generativo es susceptible de producir contenido incorrecto, especialmente fuera de dominios verificables.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia propietaria: JTRL-v1.0 se declara como uso de investigacion (proprietary research); el uso comercial no esta permitido sin consultar el archivo LICENSE del repositorio.
- Adopcion nula: 0 descargas y 0 likes en el momento de la ficha, sin comunidad que valide su comportamiento.
- Ausencia de benchmarks estandar: no hay datos de MMLU, HumanEval ni GSM8K, lo que dificulta situar su rendimiento frente a alternativas.
- Requisitos de hardware no confirmados: no se detallan cuantizaciones ni soporte de motores de inferencia habituales (vLLM, llama.cpp, Ollama, TGI), y el tamano del repositorio (970 GB) complica el despliegue directo.
- Capacidades de tool calling, agentes, vision y audio no confirmadas en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhanesh-hf/Jarvis-Titan-M4-GRPO-Final
- Modelo base: https://huggingface.co/dhanesh-hf/Jarvis-Titan-M4-Activated
- Google Cloud TPU (hardware de entrenamiento): https://cloud.google.com/tpu
- Paper, repositorio, demo o blog adicionales: no disponibles en la informacion proporcionada. La busqueda web unicamente devolvio un listado de arXiv de astrofisica (marzo de 2025) sin relacion con el modelo.
