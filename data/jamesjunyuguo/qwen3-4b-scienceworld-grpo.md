# jamesjunyuguo/Qwen3-4B-ScienceWorld-GRPO

## Resumen
Qwen3-4B-ScienceWorld-GRPO es un ajuste fino del modelo Qwen3-4B de Alibaba, publicado por el usuario jamesjunyuguo en Hugging Face. El sufijo del nombre indica que se ha aplicado entrenamiento con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo, sobre un conjunto de datos o entorno denominado "ScienceWorld", que en la literatura corresponde a un entorno interactivo de tareas cientificas de laboratorio. El modelo hereda la arquitectura transformer densa de la familia Qwen3, con aproximadamente 4.400 millones de parametros.

El modelo resuelve, en principio, el problema de dotar a un LLM de tamano medio de capacidades de razonamiento y actuacion en entornos cientificos simulados, donde el agente debe ejecutar secuencias de acciones experimentales. Es relevante para desarrolladores que quieran experimentar con tecnicas de RL aplicadas a modelos pequenos y desplegables en hardware modesto, aunque la informacion publicada por el autor es minima: no hay model card sustantiva, ni datos de entrenamiento detallados, ni resultados de evaluacion.

La ficha se basa unicamente en los metadatos disponibles en Hugging Face y en el conocimiento general de la familia Qwen3. Cualquier dato no confirmado se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el Qwen3-4B base soporta hasta 32.768 tokens nativos, ampliable; no confirmado en este ajuste) |
| Tipos de cuantizacion | no disponible en el repo (pesos en safetensors; compatible con cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | no disponible (heredados del Qwen3-4B base, multilingue, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte del Qwen3-4B base, un transformer decoder-only denso con atencion por grupos de consultas (GQA), normalizacion RMSNorm y activacion SwiGLU, entrenado originalmente por Alibaba con un corpus multilingue de gran escala. Sobre esa base, el autor ha aplicado un ajuste con GRPO, un algoritmo de optimizacion de politica que estima ventajas relativas dentro de grupos de respuestas muestreadas, eliminando la necesidad de un modelo critico separado. Este esquema se ha popularizado para tareas de razonamiento y para agentes que interactuan con entornos.

El nombre sugiere que el entrenamiento se ha realizado sobre ScienceWorld, un entorno textual de tareas cientificas (experimentos de quimica, fisica y biologia) en el que el agente emite comandos y recibe observaciones. No se dispone de informacion sobre el numero de pasos de entrenamiento, la composicion del dataset, hiperparametros de GRPO, ni si hubo fases previas de SFT o DPO. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) mas alla del propio ajuste con RL.

## Capacidades
- Generacion de texto y razonamiento general, heredados del Qwen3-4B base.
- Razonamiento multi-paso orientado a entornos interactivos, presumiblemente entrenado para tareas de laboratorio cientifico (ScienceWorld).
- Ejecucion de secuencias de acciones en formato textual (comandos tipo `look`, `take`, `mix`, `heat`), segun el formato del entorno ScienceWorld.
- Capacidad de seguir instrucciones y mantener contexto conversacional multi-turno, sujeta a la ventana de contexto del modelo base.
- Soporte multilingue probable por herencia del modelo base, no verificado en este ajuste.
- Soporte de tool calling y function calling: no confirmado en este ajuste; el Qwen3 base lo soporta, pero el RL sobre ScienceWorld podria haber alterado este comportamiento.
- Capacidades de agente y planificacion: parcialmente cubiertas por el entrenamiento en entorno, sin datos de evaluacion publicos.
- Capacidades de vision o audio: no disponibles.

## Casos de uso
- Investigacion en aprendizaje por refuerzo para agentes: el modelo sirve como punto de partida para reproducir o extender experimentos de GRPO sobre entornos textuales, comparando con el Qwen3-4B base sin ajustar.
- Agentes de laboratorio simulado: integracion en pipelines de evaluacion tipo ScienceWorld para medir tasas de exito en tareas experimentales de quimica, fisica y biologia.
- Generacion de planes experimentales: el modelo puede proponer secuencias de pasos para completar un objetivo cientifico, util en asistentes de documentacion de laboratorio.
- Prototipado de asistentes cientificos de bajo coste: al ser un modelo de 4B, puede desplegarse en una unica GPU consumer para demos interactivas de razonamiento paso a paso.
- Fine-tuning adicional: base para experimentos de RL con otras recompensas o entornos, dado que ya ha pasado por un ciclo de GRPO.
- Evaluacion de robustez de tecnicas RL: comparar el comportamiento del modelo ajustado frente al base en tareas fuera de dominio para detectar sobreajuste al entorno ScienceWorld.
- Educacion y divulgacion: demostraciones de como un LLM ejecuta procedimientos cientificos simulados, con fines docentes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en FP16/BF16: aproximadamente 8,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 12-16 GB para inferencia comoda.
- VRAM estimada en cuantizacion 8 bits: en torno a 4,5-5 GB de pesos, con 8-10 GB totales recomendados.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M): aproximadamente 2,5-3 GB de pesos, con 6-8 GB totales recomendados.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100; tambien cabe en RTX 4060 Ti 16 GB y en GPUs de 8 GB con cuantizacion 4 bits.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con al menos 8 GB de VRAM usando cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (previa conversion a GGUF), transformers con accelerate.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-ScienceWorld-GRPO | 4,41B | no disponible | SFT base + GRPO sobre ScienceWorld | no disponible | Hugging Face (35 descargas) |
| Qwen3-4B (base) | 4,4B | 32.768 tokens nativos | Preentrenamiento + post-entrenamiento de Alibaba | Apache 2.0 (segun el modelo base) | Hugging Face, ampliamente disponible |
| Qwen2.5-3B-Instruct | 3,1B | 32.768 tokens | SFT + DPO | Apache 2.0 | Hugging Face |
| Llama-3.2-3B-Instruct | 3,2B | 131.072 tokens | SFT + RLHF | Llama 3.2 Community License | Hugging Face |

La comparativa se limita a parametros, contexto y licencia, ya que no hay benchmarks publicados para el ajuste GRPO. El modelo base Qwen3-4B es la referencia natural para medir el efecto del entrenamiento con RL.

## Limitaciones y advertencias
- Ausencia de model card detallada: no se documentan datos de entrenamiento, hiperparametros, ni evaluacion, lo que dificulta la reproducibilidad.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que verificar la licencia del Qwen3-4B base y la del autor del ajuste antes de desplegarlo en produccion.
- Riesgo de sobreajuste al entorno ScienceWorld: el entrenamiento con GRPO sobre un unico entorno puede degradar capacidades generales del modelo base.
- Riesgo de alucinacion: como cualquier LLM de 4B, puede inventar acciones o resultados experimentales; no debe usarse como sustituto de un sistema real de laboratorio.
- Idiomas no confirmados: aunque el modelo base es multilingue, el ajuste podria haber reducido el rendimiento en idiomas distintos del ingles.
- Sesgos: no evaluados; se heredan los del corpus de preentrenamiento de Qwen3.
- Contexto no confirmado: no se especifica si se ha modificado la ventana de contexto respecto al modelo base.
- Baja traccion en la comunidad (35 descargas, 0 likes): sin validacion externa ni issues reportados.
- Fecha de creacion futura en los metadatos (2026-11-04): posible inconsistencia en el registro, a verificar.

## Enlaces
- Hugging Face: https://huggingface.co/jamesjunyuguo/Qwen3-4B-ScienceWorld-GRPO
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Entorno ScienceWorld (paper): https://arxiv.org/abs/2203.00504
- Repositorio ScienceWorld: https://github.com/allenai/scienceworld
- Documentacion de Qwen3: https://qwen.readthedocs.io/
