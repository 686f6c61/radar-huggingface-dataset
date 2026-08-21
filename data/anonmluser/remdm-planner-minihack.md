# AnonMLuser/remdm-planner-minihack

## Resumen

ReMDM Planner for MiniHack es un agente de planificación basado en difusión discreta, desarrollado como artefacto anónimo de investigación para el paper *Return-Weighted ELBO Fine-Tuning of Discrete Diffusion Planners Reduces to Self-Imitation*. El modelo genera secuencias de acción completas (trayectorias de 64 pasos) mediante un proceso de remasking de tokens de acción, en lugar de predecir la siguiente acción de forma autorregresiva. Está diseñado específicamente para navegación en mazmorras del entorno MiniHack, un sandbox de RL basado en NetHack.

El repositorio incluye dos variantes: un planificador entrenado con DAgger (online) y una línea base de imitación offline (BC), ambos con sufijo `-100M` que cuenta equivalentes de muestra, no pasos de entorno (el entrenamiento real usó 5.650.000 pasos de entorno). El checkpoint de inferencia (`checkpoint_inference.pth`) contiene solo los pesos EMA (~21 MB) y se distribuye junto con el código fuente completo, los activos de ablación y las figuras del paper.

La relevancia de este modelo reside en su enfoque de planificación por difusión, una alternativa a los métodos autorregresivos para RL, y en que su metodología de fine-tuning con ELBO ponderado por retorno se reduce a auto-imitación. Es un artefacto de investigación, no un agente de propósito general: está ligado a versiones específicas de MiniHack y a una codificación de observación basada en glifos recortados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ReMDM (Remasking Discrete Diffusion Model) — difusión discreta con remasking |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | 64 pasos de acción generados por trayectoria (no contexto de texto) |
| Tipos de cuantización | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors y `.pth` (EMA weights) |

## Arquitectura y entrenamiento

El modelo implementa un proceso de difusión discreta con remasking (ReMDM), derivado de un proceso de difusión discreto con un proceso de backward personalizado. En lugar de predecir acciones de forma autorregresiva, el modelo genera trayectorias completas de 64 pasos de acción, partiendo de un estado inicial de tokens de acción enmascarados y desenmascarándolos iterativamente mediante una política de remasking. La arquitectura es de doble flujo (dual-stream transformer), aunque el detalle de las dimensiones internas no está disponible en la información pública.

El entrenamiento combinó dos fases: una línea base de imitación offline (behavior cloning, step 50.000) y un planificador online con DAgger (iteración 563), que refina la política con datos recopilados de la propia política. El nombre `-100M` indica 100 millones de sample-equivalents, aunque el total real fue de 5.650.000 pasos de entorno. El paper (en revisión) describe un fine-tuning con ELBO ponderado por retorno que se reduce a auto-imitación. Los checkpoints se distribuyen con pesos EMA solo, sin estado de optimizador, scheduler, RNG ni currículum.

## Capacidades

- Planificación de navegación en entornos MiniHack (mazmorras de NetHack) mediante generación de secuencias de acción de 64 pasos.
- Generación de trayectorias completas con difusión discreta: no predice paso a paso, sino que desenmascara tokens de acción de forma iterativa.
- Entrenamiento con DAgger (online) y con imitación offline (BC), lo que permite comparar estrategias de aprendizaje por demostración.
- Soporte para integración en pipelines de RL: el repositorio incluye código fuente, configuraciones, entornos y scripts de experimentación.
- Capacidad de visualización de resultados mediante el notebook `demo_minihack.ipynb`, que carga el checkpoint de inferencia y muestra las figuras de ablación.
- No tiene capacidades de lenguaje natural, visión, tool calling ni agente multi-step en el sentido de LLM; es un modelo de planificación especializado.

## Casos de uso

- Investigación en planificación con difusión discreta: el modelo sirve como referencia para estudiar cómo los planificadores de difusión se comportan en entornos de RL discretos, comparando DAgger vs. BC.
- Evaluación de métodos de fine-tuning con ELBO ponderado por retorno: el repositorio incluye los activos de ablación (figuras y tablas) para reproducir los experimentos del paper.
- Desarrollo de agentes de navegación en entornos de mazmorras: puede utilizarse como componente de planificación en sistemas que requieren generar secuencias de acciones en dominios con observaciones simbólicas (glifos).
- Benchmark de generalización en RL: al estar limitado a MiniHack, sirve para probar la transferencia de políticas de difusión a variantes del mismo entorno.
- Reproducción de experimentos de investigación: el código y los checkpoints permiten reproducir los resultados del paper anónimo, con los pasos de entrenamiento documentados.
- Integración en pipelines de RL con DAgger: el checkpoint online puede usarse como referencia para implementar y comparar algoritmos de imitación iterativa en entornos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados de evaluación y su varianza se reportan en el paper, que está bajo revisión, pero no se incluyen cifras concretas en el repositorio público.

## Requisitos de hardware

- El checkpoint de inferencia (`checkpoint_inference.pth`) pesa ~21 MB, por lo que la inferencia es ligera y puede ejecutarse en cualquier GPU consumer (p. ej., RTX 3060, 4070) o incluso en CPU para pruebas.
- Los checkpoints de entrenamiento completos (DAgger y BC) requieren más recursos: el entrenamiento se realizó en máquinas con GPU de 24 GB (nombradas `gpu_24gb`) y con H200 (`gpu_h200`), según los metadatos anonimizados.
- Para reproducir el entrenamiento completo con DAgger se recomienda una GPU con al menos 24 GB de VRAM, aunque no se especifica el consumo exacto de memoria.
- Opciones de despliegue: el repositorio está en PyTorch y se puede ejecutar con el notebook de demo; no hay soporte para vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| AnonMLuser/remdm-planner-minihack (este) | ReMDM (difusión discreta) | DAgger + BC, 5,65M pasos de entorno | MIT | Repo con código + checkpoints |
| MathisW78/remdm-minihack | ReMDM (difusión discreta) | no disponible | no disponible | Repo HuggingFace |
| remdm-minihack/ReMDM-MiniHack | ReMDM (difusión discreta) | no disponible | no disponible | Repo HuggingFace |

No hay datos públicos de rendimiento comparativo en benchmarks estándar (MMLU, HumanEval, etc.) porque este modelo no es un LLM ni un agente de propósito general; su dominio es específico de MiniHack. Los tres repositorios implementan la misma idea de ReMDM aplicada a MiniHack, pero el de AnonMLuser es el artefacto anónimo del paper en revisión, con más detalle de entrenamiento.

## Limitaciones y advertencias

- Es un artefacto de investigación anónimo, no un producto final; el paper está bajo revisión y los resultados pueden cambiar.
- No es un agente de propósito general: está ligado a versiones específicas de MiniHack y a la codificación de observación de glifos recortados; no transferirá a otros entornos ni a observaciones de píxeles.
- El checkpoint de inferencia solo contiene pesos EMA, sin optimizador, scheduler ni estado de currículum; no es adecuado para continuar el entrenamiento.
- La cuenta de `-100M` puede confundir: son sample-equivalents, no pasos de entorno (el real es 5,65M).
- Riesgo de alucinación no aplica en el sentido de LLM, pero el modelo puede generar trayectorias de acción que no sean válidas en el entorno; se asume que la evaluación del paper reporta esa varianza.
- Licencia MIT permite uso comercial, pero el código depende de MiniHack y NLE, que tienen sus propias licencias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AnonMLuser/remdm-planner-minihack
- Código fuente (GitHub): https://github.com/vtp5tycwm2-art/remdm-planners
- Repositorio alternativo en HuggingFace (remdm-minihack): https://huggingface.co/remdm-minihack/ReMDM-MiniHack
- Repositorio alternativo en HuggingFace (MathisW78): https://huggingface.co/MathisW78/remdm-minihack
- MiniHack (GitHub): https://github.com/facebookresearch/minihack
- MiniHack documentation: https://minihack.readthedocs.io/en/latest/index.html
- Paper de referencia de ReMDM (arXiv): https://arxiv.org/abs/2503.00307

---

He seguido la estructura obligatoria. Nota: el ID del repo es `AnonMLuser/remdm-planner-minihack`, pero el autor es `AnonMLuser`. En la sección de comparativa he usado los repos encontrados en la búsqueda. He indicado "no disponible" donde no hay datos. No he inventado números de benchmarks. He usado castellano de España. Las tablas están bien formadas. He incluido los enlaces relevantes.</think>## Resumen

ReMDM-planner-minihack es un artefacto de investigación anónimo que acompaña al paper *Return-Weighted ELBO Fine-Tuning of Discrete Diffusion Planners Reduces to Self-Imitation*, actualmente en revisión doble ciega. Se trata de un agente de planificación basado en un modelo de difusión discreta con remasking (ReMDM), diseñado para navegación en entornos MiniHack, un sandbox de RL basado en NetHack. En lugar de predecir acciones de forma autorregresiva, el modelo genera trayectorias completas de 64 pasos de acción desenmascarando tokens de acción de forma progresiva.

El repositorio incluye el código fuente completo, dos checkpoints (uno entrenado con DAgger online y otro con imitación offline), un checkpoint de inferencia ligero (~21 MB con pesos EMA) y los activos de las ablaciones de fine-tuning con RL. La cuenta de `-100M` en los nombres de los checkpoints se refiere a sample-equivalents, no a pasos de entorno; el entrenamiento real fue de 5.650.000 pasos de entorno. Este artefacto es relevante para la comunidad de investigación en RL y planificación con difusión, ya que propone una técnica de fine-tuning con ELBO ponderado por retorno que se reduce a autoimitación, y está disponible bajo licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ReMDM (Remasking Discrete Diffusion Model), difusión discreta con doble flujo |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 64 pasos de accion por trayectoria generada |
| Tipos de cuantizacion | no disponible (solo safetensors y `.pth` con pesos en FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors y `.pth` (checkpoint de inferencia con EMA) |

## Arquitectura y entrenamiento

El modelo implementa el sampler ReMDM, derivado de un proceso de difusión discreta con un backward de remasking. La arquitectura es de doble flujo (dual-stream transformer), que procesa las observaciones y las acciones enmascaradas de forma conjunta para generar trayectorias de acción de 64 pasos. En lugar de predecir el siguiente token, el modelo itera sobre un conjunto de tokens de acción enmascarados y los desenmascara de forma progresiva según una política de remasking derivada de la teoría de difusión discreta.

El entrenamiento incluye dos variantes: un planificador offline entrenado con imitación de comportamiento (BC, step 50000) y un planificador online entrenado con DAgger (iteración 563). El total de 5.650.000 pasos de entorno se corresponde con el sufijo `-100M` en sample-equivalents. El paper propone un fine-tuning con ELBO ponderado por retorno que se reduce a self-imitation, y el repositorio incluye los activos de las ablaciones de ese fine-tuning. No se detalla el número de tokens del dataset de entrenamiento ni la composición exacta de los datos, pero se menciona que el entorno usa una codificación de observación basada en glifos recortados, específica de MiniHack.

## Capacidades

- Generación de trayectorias de acción completas (64 pasos) en entornos MiniHack mediante difusión discreta con remasking.
- Planificación no autorregresiva: el modelo desenmascara tokens de acción de forma paralela, lo que puede reducir la latencia de generación en comparación con métodos secuenciales.
- Soporte de entrenamiento con DAgger (online) y con imitación offline (BC), lo que permite comparar estrategias de aprendizaje por demostración.
- Capacidad de análisis experimental: el repositorio incluye activos de ablación (figuras PNG, tablas CSV) y el notebook `demo_minihack.ipynb` que carga el checkpoint de inferencia sin autenticación.
- No tiene capacidades de lenguaje natural, tool calling, agentes multi-step, visión ni audio. Es un modelo de planificación especializado en el dominio MiniHack.

## Casos de uso

- **Investigación en planificación con difusión**: el modelo sirve como referencia para estudiar cómo los planificadores de difusión generan secuencias de acción en entornos de tareas discretas, y comparar con métodos autorregresivos.
- **Benchmark de imitación y DAgger**: permite evaluar la diferencia entre una política offline (BC) y una online (DAgger) en el mismo entorno, con checkpoints disponibles para ambas.
- **Reproducción de experimentos de RL**: el repositorio incluye código fuente, configuraciones y scripts, lo que facilita reproducir los resultados del paper o extender los experimentos.
- **Desarrollo de agentes de navegación en mazmorras**: puede servir como componente de planificación en sistemas que requieran generar secuencias de acciones en entornos con observaciones simbólicas (glifos).
- **Análisis de técnicas de self-imitation**: el fine-tuning propuesto (ELBO ponderado por retorno) se puede estudiar con este artefacto, ya que incluye las ablaciones precomputadas.
- **Integración en pipelines de entrenamiento de RL**: el checkpoint de inferencia ligero (~21 MB) puede cargarse rápidamente en entornos de experimentación con PyTorch, sin necesidad de autenticación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de evaluacion y su varianza se reportan en el paper, pero no se incluyen cifras concretas en el repositorio ni en la pagina de Hugging Face.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no especificada, pero el checkpoint de inferencia pesa ~21 MB, por lo que cabe en cualquier GPU consumer (p. ej., RTX 3060, 4060) y probablemente en CPU para pruebas.
- **GPU recomendadas**: los metadatos del entrenamiento mencionan maquinas `gpu_24gb` y `gpu_h200`, lo que sugiere que el entrenamiento completo requiere al menos 24 GB de VRAM (p. ej., A100, H200). Para inferencia no se requieren GPU de gama alta.
- **Compatibilidad con GPU consumer**: si, para inferencia; para entrenamiento, se recomienda una GPU con 24 GB o mas.
- **Opciones de despliegue**: el modelo se usa con PyTorch y el notebook `demo_minihack.ipynb`; no hay soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnonMLuser/remdm-planner-minihack | ReMDM (difusion discreta) | DAgger + BC, 5,65M pasos | 64 acciones | MIT | Repo con codigo + checkpoints |
| MathisW78/remdm-minihack | ReMDM (difusion discreta) | no disponible | 64 acciones | no disponible | Repo HuggingFace |
| remdm-minihack/ReMDM-MiniHack | ReMDM (difusion discreta) | no disponible | 64 acciones | no disponible | Repo HuggingFace |

No se dispone de resultados de benchmarks publicos para comparar el rendimiento de estos modelos en tareas estandar (MMLU, HumanEval, etc.), ya que no son modelos de lenguaje generalistas sino agentes de planificacion para MiniHack. Los tres repositorios implementan la misma idea de ReMDM, pero el de AnonMLuser es el artefacto anonimo del paper en revision, con mas detalle de entrenamiento y activos de ablacion.

## Limitaciones y advertencias

- **No es un agente de proposito general**: esta ligado a versiones especificas de MiniHack y a la codificacion de observacion de glifos recortados; no transferira a otros entornos ni a observaciones de pixel.
- **Artefacto de investigacion**: es un artefacto anonimo para revision de paper, no un producto en produccion; puede tener fallos no documentados.
- **Riesgo de alucinacion**: como modelo generativo, puede producir trayectorias de accion invalidas en el entorno; la varianza de evaluacion se reporta en el paper.
- **Solo pesos EMA**: el checkpoint de inferencia contiene solo los pesos EMA, sin estado de optimizador ni curriculo, por lo que no es adecuado para continuar el entrenamiento.
- **Licencia MIT**: permite uso comercial, pero el codigo depende de MiniHack y NLE, que tienen sus propias licencias (posiblemente no MIT).
- **Datos de entrenamiento limitados**: no se publica la composicion del dataset ni el numero de tokens; el rendimiento puede no generalizar fuera del entorno de entrenamiento.

## Enlaces

- [HuggingFace: AnonMLuser/remdm-planner-minihack](https://huggingface.co/AnonMLuser/remdm-planner-minihack)
- [Codigo fuente (GitHub)](https://github.com/vtp5mtycwm2-art/remdm-planners)
- [HuggingFace: remdm-minihack/ReMDM-MiniHack](https://huggingface.co/remdm-minihack/ReMDM-MiniHack)
- [HuggingFace: MathisW78/remdm-minihack](https://huggingface.co/MathisW78/remdm-minihack)
- [MiniHack (GitHub)](https://github.com/facebookresearch/minihack)
- [Documentacion de MiniHack](https://minihack.readthedocs.io/en/latest/index.html)
- [Paper de ReMDM (arXiv)](https://arxiv.org/abs/2503.00307)
