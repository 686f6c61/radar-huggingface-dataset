# jasonljx96/Qwen3.5-9B-agentic-rl-seed2

## Resumen

Qwen3.5-9B-agentic-rl-seed2 es un fine-tuning por refuerzo (RL) del modelo base Qwen/Qwen3.5-9B, un modelo de lenguaje y vision de 9.000 millones de parametros con arquitectura hibrida Mamba+atencion. El autor, jasonljx96, ha entrenado este modelo con el framework slime sobre los entornos ALFWorld y AppWorld, dos benchmarks de referencia para evaluar capacidades agénticas en entornos domesticos virtuales y en interacciones con APIs del mundo real.

El repositorio contiene artefactos de investigacion privados: checkpoints crudos en formato Megatron `torch_dist` (no cargables directamente con `transformers`) y rollouts de depuracion por cada paso de entrenamiento. Se trata de un experimento de RL agéntico con GRPO (Group Relative Policy Optimization) que explora distintas estrategias de guiado (permissive guidance vs. no-guidance) y un esquema actor-refiner para AppWorld. Su relevancia radica en documentar el proceso de entrenamiento RL para agentes sobre un modelo hibrido Mamba+atencion, un area aun poco explorada.

El repositorio tiene un tamano de 493 GB e incluye tres ejecuciones de entrenamiento con sus respectivos checkpoints de mejor validacion. La licencia es `other`, lo que implica restricciones no especificadas que deben consultarse con el autor antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba + atencion (vision-language) |
| Parametros totales | 9.000 millones (9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo checkpoints crudos Megatron) |
| Idiomas soportados | no disponible |
| Licencia | other (consultar con el autor) |
| Formato de pesos | Megatron `torch_dist` (`.distcp` + `common.pt` + `latest_checkpointed_iteration.txt`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un modelo de vision y lenguaje (VL) con arquitectura hibrida que combina capas Mamba (modelos de espacio de estados) con capas de atencion transformer. Esta combinacion busca reducir el coste computacional de la atencion cuadratica manteniendo la capacidad de modelar dependencias de largo alcance. El entrenamiento base incluye fusion temprana de datos multimodales a escala de billones de tokens, lo que le otorga capacidades de razonamiento, codigo y comprension visual.

Sobre esta base, el autor aplica fine-tuning por refuerzo con el framework slime, que gestiona el entrenamiento distribuido con Megatron. Se emplea GRPO como algoritmo de optimizacion de politicas. Se realizan tres ejecuciones independientes:

- **ALFWorld permissive guidance**: entrenamiento con guiado permisivo, alcanzando en la iteracion 149 una precision de validacion `valid_seen` de 0.843 y una tasa de exito de episodio de 0.921.
- **ALFWorld permissive no-guidance**: sin guiado, con 0.894 de `valid_seen` y 0.929 de exito de episodio en la iteracion 99.
- **AppWorld GRPO actor-refiner**: esquema con actor y refiner, logrando 0.583 en `test_normal` y 0.331 en `test_challenge` en la iteracion 99.

Los checkpoints se guardan en formato Megatron distribuido y requieren el framework slime para su carga y exportacion a HuggingFace (`--save-hf`). No es posible cargarlos directamente con `transformers`.

## Capacidades

- **Razonamiento agéntico en entornos virtuales**: el modelo ha sido entrenado especificamente para ALFWorld, un entorno de texto que simula tareas domesticas (cocina, limpieza, organizacion de objetos) donde el agente debe planificar y ejecutar acciones secuenciales.
- **Interaccion con APIs del mundo real**: la ejecucion en AppWorld entrena al modelo para resolver tareas que requieren llamadas a APIs, gestion de datos y razonamiento sobre resultados.
- **Comprension multimodal**: al partir de Qwen3.5-9B, el modelo conserva la capacidad de procesar entradas visuales y de texto, aunque el fine-tuning RL se centra en tareas de texto.
- **Aprendizaje por refuerzo**: el modelo ha sido optimizado con GRPO, lo que implica una politica ajustada para maximizar recompensas en tareas agénticas especificas.
- **Capacidad de guiado**: se exploran dos variantes (con y sin guiado permisivo) que afectan al comportamiento del agente durante el entrenamiento.

## Casos de uso

- **Investigacion en RL agéntico**: el repositorio es un recurso valioso para investigadores que estudian como aplicar GRPO y frameworks como slime a modelos hibridos Mamba+atencion. Los rollouts y checkpoints permiten reproducir y analizar la dinamica de entrenamiento.
- **Desarrollo de agentes para entornos domesticos simulados**: el checkpoint de ALFWorld puede servir como punto de partida para construir agentes que operen en entornos de texto tipo ALFWorld, utiles en investigacion de planificacion y ejecucion de tareas.
- **Benchmarking de metodos de guiado en RL**: la comparacion entre las variantes con y sin guiado permisivo permite estudiar el impacto de la supervision durante el entrenamiento por refuerzo.
- **Estudio de arquitecturas hibridas en tareas agénticas**: el modelo permite evaluar si la combinacion Mamba+atencion es adecuada para tareas que requieren memoria de largo plazo y razonamiento secuencial.
- **Exportacion y despliegue de checkpoints Megatron**: el proceso documentado de conversion a formato HuggingFace mediante slime es util para equipos que trabajan con Megatron y necesitan interoperabilidad con el ecosistema `transformers`.
- **Analisis de rollouts para depuracion de entrenamiento**: los ficheros `debug_rollouts` permiten inspeccionar las trayectorias de los agentes durante el entrenamiento, util para diagnosticar problemas de exploracion o recompensas mal especificadas.

## Benchmarks y rendimiento

Los datos de validacion publicados en la model card son los siguientes:

| Ejecucion | Metrica | Valor |
|---|---|---|
| ALFWorld permissive guidance (iter 149) | valid_seen | 0.843 |
| ALFWorld permissive guidance (iter 149) | episode success | 0.921 |
| ALFWorld permissive no-guidance (iter 99) | valid_seen | 0.894 |
| ALFWorld permissive no-guidance (iter 99) | episode success | 0.929 |
| AppWorld GRPO actor-refiner (iter 99) | test_normal | 0.583 |
| AppWorld GRPO actor-refiner (iter 99) | test_challenge | 0.331 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Los datos corresponden a la mejor iteracion de validacion de cada ejecucion.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. El modelo base Qwen3.5-9B en precision FP16 requiere aproximadamente 18-20 GB de VRAM, pero los checkpoints de este repositorio estan en formato Megatron y no estan listos para inferencia directa.
- **GPU recomendadas**: para cargar y exportar los checkpoints con slime se requiere un entorno con GPUs compatibles con Megatron (NVIDIA A100, H100 o similares). El repositorio de 493 GB implica almacenamiento significativo y memoria para el proceso de weight-gathering.
- **Compatibilidad con GPU de consumo**: no se puede ejecutar directamente en GPU de consumo sin antes exportar los pesos a formato HuggingFace mediante slime. Una vez exportado, el modelo de 9B podria ejecutarse en una RTX 4090 (24 GB) con cuantizacion, pero este paso no esta documentado en el repositorio.
- **Opciones de despliegue**: el flujo recomendado es cargar con slime (`--load` apuntando a `checkpoints/<run>`) y exportar con `--save-hf`. Tras la exportacion, se podrian usar vLLM, llama.cpp u Ollama, pero no se proporcionan instrucciones ni garantias.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-agentic-rl-seed2 (este) | 9B | no disponible | Hibrida Mamba+atencion VL | other | Megatron crudo |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | Hibrida Mamba+atencion VL | no disponible | HuggingFace |
| Qwen3.5-397B-A17B | 397B (17B activos) | no disponible | MoE VL | no disponible | HuggingFace |

La comparativa se limita a la familia Qwen3.5, ya que no se dispone de informacion sobre otros modelos agénticos comparables en la documentacion proporcionada. El modelo base Qwen3.5-9B es la referencia natural: este repositorio es un fine-tuning RL del mismo, por lo que las capacidades base son identicas y la diferencia radica en la optimizacion para tareas agénticas especificas. El modelo de 397B es una alternativa mucho mayor con arquitectura MoE, orientada a maximizar rendimiento en benchmarks, pero no es directamente comparable por tamano y coste.

## Limitaciones y advertencias

- **Formato no estandar**: los checkpoints estan en formato Megatron `torch_dist` y no pueden cargarse con `transformers` directamente. Se requiere el framework slime y un proceso de exportacion que puede ser complejo y propenso a errores.
- **Licencia restrictiva**: la licencia `other` no especifica los terminos de uso. Antes de cualquier uso comercial o publicacion, es imprescindible contactar con el autor para obtener permisos.
- **Artefactos de investigacion**: el autor indica explicitamente que son "private research artifacts". No hay garantias de soporte, mantenimiento ni correccion de errores.
- **Datos de validacion limitados**: solo se publican metricas de validacion para tres ejecuciones concretas. No hay evaluacion en benchmarks generales (MMLU, HumanEval, etc.) ni comparacion con el modelo base.
- **Riesgo de sesgos**: al ser un fine-tuning sobre un modelo base, hereda los sesgos de Qwen3.5-9B. El entrenamiento RL en entornos especificos puede introducir sesgos adicionales hacia las tareas de ALFWorld y AppWorld.
- **Alucinacion**: no se dispone de datos sobre la tasa de alucinacion del modelo tras el fine-tuning. El entrenamiento RL puede afectar a la fidelidad factual del modelo.
- **Idiomas**: no se especifican los idiomas soportados. El modelo base Qwen3.5 soporta multiples idiomas, pero el fine-tuning se ha realizado en entornos de texto en ingles (ALFWorld y AppWorld).
- **Tamano del repositorio**: 493 GB requieren un ancho de banda y almacenamiento considerables para su descarga. No se recomienda para entornos con recursos limitados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jasonljx96/Qwen3.5-9B-agentic-rl-seed2
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio GitHub Qwen3.5 (no oficial): https://github.com/ABDtmx/Qwen3.5
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Cuantizacion GGUF de Qwen3.5-9B (unsloth): https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Qwen3.5 9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
