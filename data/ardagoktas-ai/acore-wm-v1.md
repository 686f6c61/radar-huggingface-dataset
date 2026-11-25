# ardagoktas-ai/acore-wm-v1

## Resumen

Acore-WM (`acore-wm-v1`) es un modelo de mundo neuronal (world model) de 27,58 millones de parámetros desarrollado de forma independiente por Arda Göktaş (`ardagoktas-ai`). No es un modelo de lenguaje: está entrenado desde cero para aprender la dinámica de entornos físicos 2D, las señales de recompensa y las condiciones de terminación directamente a partir de trayectorias de interacción, con el objetivo de habilitar planificación por rollout mediante control predictivo por modelo (MPC) en entornos no vistos durante el entrenamiento.

El modelo se publica bajo licencia Apache 2.0 y se distribuye como un único checkpoint de PyTorch de 316 MB (`acore_wm_step54050.pt`), junto con los registros de entrenamiento y los resultados de un benchmark de rendimiento ejecutado sobre una NVIDIA H100 PCIe. La model card reporta 54.050 pasos de entrenamiento, una pérdida final de predicción de fotogramas de 0,0783 (partiendo de 5,8043) y una pérdida de evaluación de 0,4611 sobre entornos no vistos.

Su relevancia es acotada pero concreta: se trata de una implementación compacta y reproducible de un world model orientado a planificación, una categoría con pocos artefactos públicos de pequeño tamaño y licencia permisiva. Resulta útil como referencia para experimentos de reinforcement learning basado en modelo, simulación física 2D y evaluación de planificadores MPC, no como sustituto de un modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model neuronal para dinámica física 2D (detalles internos no disponibles) |
| Parametros totales | 27.581.846 (~27,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 584 tokens de secuencia (horizonte de rollout T=64) |
| Tipos de cuantizacion | No disponible (checkpoint en PyTorch, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | No aplica / no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, 316 MB) |

## Arquitectura y entrenamiento

La model card describe Acore-WM como un world model construido desde cero, entrenado para predecir la evolución de entornos físicos 2D, las recompensas y las señales de terminación a partir de trayectorias de interacción. No se especifica en la información disponible el tipo concreto de bloque (transformer, SSM, híbrido u otra variante), ni la composición del dataset, ni si se emplearon técnicas de ajuste como RLHF o DPO; estos extremos deben considerarse no disponibles.

Los datos de entrenamiento publicados son: 54.050 pasos, una secuencia de 584 tokens con horizonte de rollout de 64 pasos, y una pérdida de predicción de fotogramas que desciende de 5,8043 a 0,0783. La evaluación sobre entornos no vistos arroja una pérdida de 0,4611, lo que indica una brecha de generalización considerable respecto al rendimiento en entrenamiento. El repositorio incluye además un benchmark de throughput y precisión numérica en FP32/BF16 sobre H100 PCIe, con 2.623,113 GFLOP/s verificados en un kernel propio.

## Capacidades

- Predicción de dinámica física en entornos 2D: modela transiciones de estado a partir de acciones.
- Predicción de recompensa y de señal de terminación dentro del mismo modelo.
- Rollouts multi-paso con horizonte de 64 pasos para planificación tipo MPC.
- Generalización a entornos no vistos, medida mediante pérdida de evaluación held-out.
- Soporte de planificación basada en modelo (model-predictive rollout planning).
- No dispone de generación de texto, código, matemáticas, visión natural, tool calling ni capacidades multilingües.
- No se documentan modos de razonamiento explícito ni soporte de agentes conversacionales.

## Casos de uso

- Planificación MPC en entornos 2D: el modelo permite simular rollouts de 64 pasos y seleccionar acciones minimizando coste, adecuado por su bajo coste computacional (27,6 M de parámetros).
- Investigación en reinforcement learning basado en modelo: sirve como banco de pruebas reproducible para comparar planificadores y estrategias de rollout con un checkpoint público y ligero.
- Simulación física aproximada para prototipado: útil para generar predicciones rápidas de transiciones en entornos de juguete antes de invertir en simuladores de alta fidelidad.
- Evaluación de robustez y generalización: la brecha entre pérdida de entrenamiento (0,0783) y held-out (0,4611) lo convierte en un caso de estudio útil para medir sobreajuste en world models.
- Docencia y experimentación académica: su tamaño (316 MB) y licencia Apache 2.0 permiten desplegarlo en estaciones de trabajo sin GPU de datacenter.
- Integración en pipelines de RL con entorno simulado: puede actuar como modelo predictivo auxiliar para generar experiencias sintéticas o para estimar el valor de estados en entornos 2D.
- Referencia para benchmarks de kernels: los datos de H100 (FP32/BF16) permiten reproducir comparativas de rendimiento en hardware concreto.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida final de prediccion de fotogramas (entrenamiento) | 0,0783 (desde 5,8043) |
| Perdida de evaluacion en entornos no vistos (held-out) | 0,4611 |
| Pasos de entrenamiento | 54.050 |
| Throughput verificado (H100 PCIe, kernel propio) | 2.623,113 GFLOP/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros world models.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint de 27,6 M de parámetros; el archivo ocupa 316 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el entrenamiento reportado se realizó en NVIDIA H100 PCIe.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3090, RTX 3060, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo (el repositorio solo distribuye `.pt`); no se publican artefactos para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles más allá de la cifra de GFLOP/s del kernel propio en H100.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye referencias a otros world models comparables ni datos que permitan una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Brecha de generalización notable: la pérdida held-out (0,4611) es aproximadamente seis veces la de entrenamiento (0,0783), lo que sugiere sobreajuste a los entornos vistos.
- Ámbito restringido a entornos físicos 2D; no debe esperarse transferencia a dominios 3D, texto, imagen natural o tareas de lenguaje.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento simbólico.
- La arquitectura interna no está documentada en la model card, lo que dificulta auditar el modelo o reproducir el entrenamiento.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin validación comunitaria independiente.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por tratarse de un modelo no lingüístico.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías de idoneidad para producción; el autor no publica métricas de robustez fuera de los entornos de evaluación.
- Ausencia de variantes cuantizadas o formatos alternativos de pesos limita su integración en stacks de despliegue estandarizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ardagoktas-ai/acore-wm-v1
- Perfil del autor: https://huggingface.co/ardagoktas-ai
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
