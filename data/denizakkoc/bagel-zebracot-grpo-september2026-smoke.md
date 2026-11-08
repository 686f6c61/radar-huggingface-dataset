# denizakkoc/BAGEL-ZebraCoT-GRPO-September2026-Smoke

## Resumen

BAGEL-ZebraCoT-GRPO-September2026-Smoke es un archivo público de checkpoints de investigación derivados del modelo base multimodal `multimodal-reasoning-lab/Bagel-Zebra-CoT`. Lo publica el usuario de Hugging Face denizakkoc y contiene dos checkpoints de adaptadores LoRA (rango 64, alpha 128) entrenados con GRPO sobre el dataset `multimodal-reasoning-lab/Zebra-CoT`. No es un modelo completo ni un export estándar de PEFT: son diccionarios de pesos entrenables del BAGEL original, sin fusionar, que requieren el modelo base para funcionar.

El propósito declarado es validar la ejecución de un pipeline de entrenamiento multi-paso con GRPO y el flujo de gradientes, no producir un modelo de razonamiento visual acabado. Los dos checkpoints corresponden a un "smoke" de cuatro pasos (2 ejemplos representados, 2 rollouts por prompt) y un "long smoke" de seis pasos (1 ejemplo, 6 rollouts por prompt), ambos ejecutados el 25 de septiembre de 2026 sobre GPUs NVIDIA A100 en el clúster CINECA Leonardo.

Su relevancia es documental y metodológica: preserva configuraciones, cursores de datos, checksums SHA-256 y procedencia de un experimento temprano de RL sobre un modelo multimodal con adaptadores en los expertos de comprensión y generación. No debe evaluarse como un modelo listo para producción ni como evidencia de capacidad de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BAGEL multimodal (expertos de comprensión y generación) con adaptadores LoRA; detalles completos de la arquitectura base no disponibles |
| Parametros totales | no disponible (el repo ocupa 2,6 GB y contiene solo adaptadores/estado entrenable, no pesos completos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints son pesos entrenables en precisión de entrenamiento; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Estado entrenable original de BAGEL (adaptadores LoRA, rango 64, alpha 128); no es `save_pretrained` de PEFT ni modelo fusionado; excluye ficheros de optimizador y RNG |
| Modelo base | multimodal-reasoning-lab/Bagel-Zebra-CoT (revisión `ebce32410ee2062d073feae484ea2c6c1515fba8`) |
| Dataset de entrenamiento | multimodal-reasoning-lab/Zebra-CoT (10k ejemplos, 13 categorías) |
| Hardware de entrenamiento | NVIDIA A100 en CINECA Leonardo |
| Fecha de creación | 2026-11-08 |

## Arquitectura y entrenamiento

El modelo parte de BAGEL-Zebra-CoT, un modelo multimodal con dos expertos (comprensión y generación) sobre el que se aplican adaptadores LoRA de rango 64 y alpha 128 en ambos expertos. El entrenamiento usa GRPO (Group Relative Policy Optimization) con un juez congelado Qwen2.5-VL-72B-AWQ que actúa como modelo de recompensa en GPUs separadas de las de política. En estos runs de septiembre la asignación de juez fue compartida con otros trabajos concurrentes, por lo que no es atribuible individualmente.

Los dos checkpoints publicados son pruebas de ejecución, no entrenamientos a escala. El run `smoke` cubre 4 pasos con 2 ejemplos representados y 2 rollouts por prompt; el `long_smoke` cubre 6 pasos con 1 ejemplo y 6 rollouts por prompt. La configuración de septiembre usa resolución de 256 px, 8 pasos de difusión y 2 candidatos, valores que el autor advierte explícitamente que no deben confundirse con los runs de octubre (512 px, 50 pasos de difusión, 6 candidatos). El dataset principal de 10k ejemplos abarca 13 categorías: búsqueda visual, jigsaw, ajedrez, tetris, cifrados, laberintos, matrices estilo Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva.

## Capacidades

- Al ser un checkpoint de adaptadores sobre BAGEL-Zebra-CoT, hereda las capacidades multimodales del base, pero no se documentan evaluaciones que las confirmen en estos pesos.
- Razonamiento visual multi-paso sobre tareas tipo Zebra-CoT (búsqueda visual, jigsaw, laberintos, matrices Raven, ARC-AGI), según el diseño del dataset, sin métricas que lo respalden.
- Generación de imágenes mediante el experto de generación, ya que el LoRA también lo adapta; sin evaluación publicada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad verificada; el pipeline de entrenamiento sí es multi-paso.
- Capacidades multilingües: solo inglés declarado.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Reproducción de experimentos de RL multimodal: sirve para validar que un pipeline GRPO con juez externo (Qwen2.5-VL-72B-AWQ) ejecuta pasos, guarda checkpoints y propaga gradientes en un entorno A100, antes de lanzar runs a escala.
- Auditoría de procedencia de checkpoints: los ficheros `checkpoint_manifest.json` y `training_metadata.json` permiten verificar checksums SHA-256, cursores de datos y configuraciones, útil para investigación reproducible.
- Estudio de adaptadores LoRA en modelos multimodales de dos expertos: los pesos permiten analizar cómo se distribuyen los cambios entre el experto de comprensión y el de generación con rango 64.
- Base para experimentos de reward modeling visual: el diseño con juez congelado separado de la política es un patrón reutilizable en laboratorios con recursos limitados.
- Docencia y formación en RLHF/GRPO: los runs cortos (0,087 y 0,143 horas de ventana) son ejemplos didácticos de configuración de GRPO con rollouts múltiples.
- Comparación de estrategias de exposición de datos: los distintos cursores (prefijos de 3.360, 9.984, 10.000 ejemplos) permiten estudiar el efecto del tamaño de prefijo en el aprendizaje, aunque sin resultados concluyentes publicados.

## Benchmarks y rendimiento

Los únicos datos publicados son evaluaciones almacenadas de 1 pregunta y no constituyen benchmarks comparables.

| Run | Paso | Preguntas | Correctas | Precisión | Nota |
|---|---:|---:|---:|---:|---|
| `long_smoke` | 0 | 1 | 0 | 0,00 % | Grading original almacenado |
| `long_smoke` | 6 | 1 | 0 | 0,0 % (truncado en la información) | Grading original almacenado |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las puntuaciones de octubre corregidas el 27 de octubre no se incluyen en el extracto consultado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base BAGEL-Zebra-CoT completo, que no se distribuye en este repo (2,6 GB son solo adaptadores).
- GPU de entrenamiento documentadas: NVIDIA A100 en CINECA Leonardo; el run de septiembre usó 1 GPU de política y un juez compartido, con una reserva Slurm de 16 GPUs y 24,055 horas en el job `sensenova_jupyter_8x2`.
- GPU recomendadas para inferencia: no disponible; el base multimodal requiere presumiblemente GPUs de datacenter (A100/H100) por el experto de generación, sin cifras confirmadas.
- ¿Cabe en GPU consumer? no disponible.
- Opciones de despliegue: no disponible para estos adaptadores; al no ser export PEFT estándar, requieren carga manual sobre el base con el código original de BAGEL. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se registran tiempos de prompt-processing no medidos y ventanas de ejecución de 0,087 h y 0,143 h para los smoke runs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAGEL-ZebraCoT-GRPO-September2026-Smoke | no disponible (solo adaptadores LoRA) | no disponible | Sin benchmarks; evaluaciones de 1 pregunta | Apache 2.0 | Hugging Face, 0 descargas |
| multimodal-reasoning-lab/Bagel-Zebra-CoT (base) | no disponible | no disponible | no disponible | no disponible en la información | Hugging Face |
| Qwen2.5-VL-72B-AWQ (juez usado) | 72B (cuantizado AWQ) | no disponible | no disponible en la información | no disponible en la información | Usado como reward model congelado |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría (adaptadores GRPO multimodales de investigación); la comparativa queda limitada al modelo base y al juez empleado.

## Limitaciones y advertencias

- No es un modelo entrenado a escala: son pruebas de ejecución de 4 y 6 pasos con 1-2 ejemplos representados; no hay evidencia de capacidad de razonamiento adquirida.
- No es un modelo autónomo: requiere el base `multimodal-reasoning-lab/Bagel-Zebra-CoT` en la revisión `ebce32410ee2062d073feae484ea2c6c1515fba8` y carga manual del estado entrenable; no es un export PEFT estándar.
- Evaluaciones no concluyentes: las únicas métricas son sobre 1 pregunta con 0 aciertos; el autor advierte que no deben agruparse promedios entre tamaños y protocolos distintos.
- Riesgo de alucinación: no evaluado; el base multimodal puede generar contenido incorrecto y estos adaptadores no lo corrigen.
- Sesgos conocidos: no documentados; el dataset Zebra-CoT es sintético y de nicho (puzles y tareas formales), con posible desalineación respecto a uso real.
- Exposición de datos no descartada: el autor indica que no se ha descartado solapamiento semántico entre SFT público y benchmarks, lo que invalida comparaciones limpias.
- Idiomas: solo inglés declarado; sin soporte multilingüe verificado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones propias no incluidas en esta información; verificar antes de producción.
- Cero descargas y cero likes: sin validación por la comunidad ni informes independientes.
- El repo excluye ficheros de optimizador y RNG, por lo que no permite reanudar el entrenamiento de forma exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/denizakkoc/BAGEL-ZebraCoT-GRPO-September2026-Smoke
- Modelo base: https://huggingface.co/multimodal-reasoning-lab/Bagel-Zebra-CoT
- Dataset: https://huggingface.co/datasets/multimodal-reasoning-lab/Zebra-CoT
- Perfil del autor: https://huggingface.co/denizakkoc
- Datasets del autor: https://huggingface.co/denizakkoc/datasets
