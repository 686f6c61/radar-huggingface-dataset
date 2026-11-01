# childtang/TS-DP

## Resumen

TS-DP (Temporal Speculative Diffusion Policy) es un conjunto de pesos complementarios para acelerar los checkpoints oficiales de Diffusion Policy, el paradigma de imitación basado en modelos de difusión para control robótico. El modelo lo desarrolla un equipo académico encabezado por Ye Li, Chen Tang y Shu-Tao Xia, entre otros, y se publica con licencia MIT. El repositorio no contiene un modelo generativo de lenguaje, sino dos componentes auxiliares por cada tarea robótica: un drafter transformer de un solo bloque, destilado para proponer trayectorias candidatas, y un scheduler entrenado con PPO que adapta en tiempo de ejecución los parámetros de decodificación especulativa.

El problema que resuelve es la latencia de muestreo de las políticas de difusión: generar acciones requiere múltiples pasos de denoising iterativo, lo que limita la frecuencia de control en robots reales. TS-DP aplica decodificación especulativa al proceso de difusión, de modo que el drafter propone bloques de acciones que el modelo base verifica, reduciendo el número efectivo de evaluaciones del modelo grande. El scheduler PPO ajusta dinámicamente la longitud especulativa y otros hiperparámetros según el estado temporal de la política.

El repositorio ocupa 0,2 GB y cubre doce configuraciones (lift, can, square, transport, tool_hang, pusht, lift_mh, can_mh, square_mh, transport_mh, kitchen y block_pushing), cada una vinculada a un checkpoint base concreto de Diffusion Policy. Es relevante para quienes despliegan políticas de difusión en entornos de control en tiempo real y necesitan reducir la latencia sin reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (base) + drafter transformer de un bloque destilado + scheduler PPO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones y horizontes de acción de Diffusion Policy) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | `drafter.ckpt` (checkpoint PyTorch) y `scheduler.pth` (state dict PyTorch) |

## Arquitectura y entrenamiento

La arquitectura se compone de tres piezas. La primera es el checkpoint base de Diffusion Policy con backbone transformer, que implementa el proceso de denoising iterativo sobre horizontes de acción. La segunda es el drafter, un transformer de un solo bloque destilado específicamente desde un checkpoint base concreto; según la model card, cada drafter solo funciona con el modelo del que fue destilado. La tercera es el scheduler, una política entrenada con PPO que decide en tiempo de ejecución los parámetros de la decodificación especulativa, presumiblemente la longitud del bloque especulado y el criterio de aceptación, adaptándose a la fase temporal de la tarea.

El entrenamiento combina destilación (para el drafter) y aprendizaje por refuerzo con PPO (para el scheduler). No se especifican en la información disponible el número de tokens, la composición del dataset ni los detalles del proceso de destilación. La innovación técnica central es trasladar la decodificación especulativa, habitual en modelos de lenguaje, al muestreo de políticas de difusión, con un componente adaptativo que ajusta la agresividad de la especulación según el contexto temporal de la tarea.

## Capacidades

- Generación de trayectorias de acción para control robótico en tareas de manipulación (lift, can, square, transport, tool_hang, kitchen, block_pushing).
- Aceleración de la inferencia de Diffusion Policy mediante decodificación especulativa con verificación del modelo base.
- Adaptación dinámica de los parámetros especulativos mediante un scheduler PPO entrenado.
- Soporte para configuraciones de cámara (ph) y multi-vista (mh) en los entornos de Meta-World y robosuite.
- Compatible con tareas de baja dimensionalidad (kitchen, block_pushing) y de imagen (el resto).
- No soporta tool calling, agentes conversacionales, multilingüismo ni modalidades de texto, audio o visión general.

## Casos de uso

- Control robótico en tiempo real: el drafter propone bloques de acciones que el modelo base verifica, reduciendo el número de pasos de denoising efectivos y permitiendo frecuencias de control más altas en tareas como `can` o `square`.
- Manipulación con múltiples vistas: las variantes `_mh` (lift_mh, can_mh, square_mh, transport_mh) permiten desplegar la aceleración en configuraciones con varias cámaras, habituales en robosuite.
- Tareas de baja dimensionalidad: `kitchen` y `block_pushing` usan observaciones de estado en lugar de imagen, lo que reduce el coste computacional y hace que el drafter sea especialmente útil en hardware limitado.
- Investigación en decodificación especulativa para difusión: el repositorio sirve como referencia reproducible para estudiar cómo se comporta la especulación en procesos de denoising iterativo frente a generación autorregresiva.
- Evaluación comparativa de schedulers RL: el scheduler PPO puede sustituirse o compararse con políticas heurísticas para medir el impacto de la adaptación temporal en la tasa de aceptación.
- Prototipado en simulación: los doce ajustes cubren tareas estándar de Meta-World y robosuite, lo que facilita integrar TS-DP en pipelines de evaluación existentes sin reentrenar el modelo base.
- Despliegue en entornos con presupuesto de cómputo ajustado: al reducir las evaluaciones del transformer grande, el sistema permite ejecutar Diffusion Policy en GPUs de gama media donde el checkpoint original no alcanzaría la frecuencia requerida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al paper (arXiv:2512.15773) para los resultados completos y advierte de que, debido a la estocasticidad del muestreo de difusión y de los simuladores, los resultados en otra máquina pueden diferir ligeramente de los reportados.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del checkpoint base de Diffusion Policy (backbone transformer) más el drafter de un bloque y el scheduler, que son ligeros; el repositorio completo pesa 0,2 GB.
- GPU recomendadas: no disponible de forma explícita. Al tratarse de políticas de difusión con backbone transformer, se espera que quepan en GPUs de consumo tipo RTX 3090 o RTX 4090, aunque no se confirma en la información proporcionada.
- Cabe en GPU de consumo: probablemente sí para las variantes de baja dimensionalidad; no confirmado para las variantes de imagen con múltiples vistas.
- Opciones de despliegue: el repositorio oficial (github.com/ChildTang/TS-DP) incluye `scripts/eval_scheduler.py` para evaluación; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card no proporciona cifras de speedup ni de frecuencia de control alcanzada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TS-DP | Acelerador de Diffusion Policy (drafter + scheduler) | no disponible | no aplica | MIT | HuggingFace y GitHub |
| Diffusion Policy (base) | Política de imitación con difusión | no disponible | no aplica | MIT (repo oficial) | GitHub y web del proyecto |
| Consistency Policy | Política de difusión con muestreo en pocos pasos | no disponible | no aplica | no disponible | Repositorio académico |
| DDIM / DPM-Solver (samplers) | Aceleradores de muestreo genéricos | no aplica | no aplica | variable | Bibliotecas de difusión |

La comparación directa con aceleradores genéricos de muestreo (DDIM, DPM-Solver) es la más pertinente: TS-DP se distingue por combinar especulación con verificación y un scheduler RL adaptativo, en lugar de reducir pasos de forma fija. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Cada drafter está destilado desde un checkpoint base concreto y solo funciona con ese modelo; no es intercambiable entre tareas ni entre variantes `ph` y `mh`.
- El repositorio no incluye los modelos base de Diffusion Policy, que deben descargarse por separado desde la web oficial del proyecto.
- Los resultados pueden variar entre máquinas por la estocasticidad del muestreo de difusión y de los simuladores, según advierte la propia model card.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma porque el modelo no procesa lenguaje natural; los riesgos se limitan al dominio robótico (fallos de control, comportamiento inseguro en el robot).
- La licencia MIT permite uso comercial, pero el uso en robots reales requiere validación adicional de seguridad que la model card no cubre.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente.
- No se especifican requisitos de hardware ni cifras de latencia, lo que dificulta planificar despliegues sin consultar el paper y el código.

## Enlaces

- HuggingFace: https://huggingface.co/childtang/TS-DP
- Paper: https://arxiv.org/abs/2512.15773
- DOI: https://doi.org/10.48550/arXiv.2512.15773
- Código: https://github.com/ChildTang/TS-DP
- Diffusion Policy (modelo base): https://github.com/real-stanford/diffusion_policy
- Checkpoints de Diffusion Policy: https://diffusion-policy.cs.columbia.edu/data/experiments/
