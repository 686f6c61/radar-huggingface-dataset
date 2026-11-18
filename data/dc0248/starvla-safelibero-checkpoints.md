# DC0248/starVLA-SafeLIBERO-checkpoints

## Resumen

`DC0248/starVLA-SafeLIBERO-checkpoints` es un archivo de checkpoints de investigación para políticas de robótica de tipo vision-language-action (VLA), generados con el framework starVLA. Cada checkpoint parte del modelo base `jasper0314-huang/LIBERO-2B` (backbone Qwen3-VL-2B con cabeza de acción DiT-B) y se afina con un objetivo de steering de seguridad estilo ESD sobre demostraciones del conjunto SafeLIBERO, combinando distintas estrategias de protección del comportamiento original (regularización MSE, proyección sobre subespacio retain, LoRA y gating eta).

No se trata de un modelo listo para producción: el autor lo describe explícitamente como un archivo de salidas de experimentos conservado por reproducibilidad, con varias ejecuciones que son pruebas de humo cortas. El repositorio ocupa 68,4 GB e incluye 113 ficheros de checkpoint distribuidos en 38 ejecuciones, con un total declarado de 381,8 GB en la model card.

La relevancia es acotada pero clara para quien investiga seguridad en políticas robóticas: ofrece un barrido sistemático de hiperparámetros (eta, rango LoRA, fuga de proyección) sobre una misma tarea de manipulación, lo que permite estudiar el compromiso entre adquirir una nueva habilidad segura y retener la capacidad original del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA: backbone Qwen3-VL-2B + cabeza de acción DiT-B (framework starVLA, tipo QwenGR00T) |
| Parámetros totales | no disponible (el backbone base es de 2B; el total del policy no se detalla) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoints en PyTorch `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base no declara licencia) |
| Formato de pesos | PyTorch `.pt` (`steps_<N>_pytorch_model.pt`); ficheros `mt_lora_*` contienen solo pesos LoRA |

## Arquitectura y entrenamiento

La política sigue el esquema QwenGR00T del framework starVLA: un backbone vision-language Qwen3-VL-2B que procesa observaciones e instrucciones, acoplado a una cabeza de acción DiT-B que produce las acciones motoras. El punto de partida es siempre `checkpoints/steps_30000_pytorch_model.pt` del modelo `jasper0314-huang/LIBERO-2B`. Sobre él se aplica un objetivo de steering de seguridad estilo ESD (energy-based safety steering) con distintos mecanismos de retención del comportamiento original.

Los datos de steering son demostraciones SafeLIBERO autocollectadas para tres tareas (80 episodios cada una, formato LeRobot v2.1): "put the bowl on the plate", "put the bowl on top of the cabinet" y "open the top drawer and put the bowl inside"; no están publicadas. Los datos de retención provienen de `IPEC-COMMUNITY/libero_{object,goal,spatial,10}_no_noops_1.0.0_lerobot` (conjunto `libero_all`) o solo de la suite goal (`libero_goal`). Las ejecuciones se agrupan en cuatro familias: `mse4` (ESD con regularización MSE, mse_weight=0.1, barrido de eta en {1, 1.05, 1.25, 1.5}), `fullft` (fine-tune completo con proyección retain-subspace, eps=0.9 y fuga 0 o 0.2, eta=1.1), `lora` (barrido de rango {8, 16, 32} × eta {1.1, 1.5, 2.0}, alpha = 2×rango, targets `cross_attn:to_k,to_v`) y `gate3_*` (gating eta, sin checkpoints por paso). Todas las ejecuciones usan semilla 42 y entrenan hasta 2000 pasos, con checkpoints intermedios en 600/800/1000/1200/1500/1600/2000 según la familia.

## Capacidades

- Control robótico de manipulación guiado por instrucciones en lenguaje natural y observaciones visuales (política VLA).
- Ejecución de tres tareas concretas de SafeLIBERO: colocar el cuenco en el plato, colocar el cuenco sobre el armario y abrir el cajón superior e introducir el cuenco.
- Aprendizaje de una nueva habilidad con steering de seguridad manteniendo, en distinto grado, el comportamiento del modelo base LIBERO.
- Barrido reproducible de hiperparámetros de seguridad: eta, peso de regularización MSE, rango y alpha de LoRA, epsilon y fuga de la proyección retain-subspace.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio más allá del pipeline VLA: no disponible.

## Casos de uso

- Investigación en seguridad de políticas robóticas: comparar las cuatro familias de retención (MSE, proyección, LoRA, gating) sobre una misma tarea para medir la degradación del comportamiento original frente a la adquisición de la habilidad segura.
- Reproducción de experimentos: el repositorio incluye `config.yaml` y `dataset_statistics.json` por ejecución, lo que permite reconstruir cada configuración de entrenamiento y verificar resultados.
- Estudio de compromiso eta frente a retención: el barrido de eta en {1, 1.05, 1.25, 1.5} y {1.1, 1.5, 2.0} permite trazar curvas de seguridad-retención con checkpoints intermedios.
- Análisis de eficiencia de LoRA en VLA: los rangos 8, 16 y 32 con alpha = 2×rango y targets `cross_attn:to_k,to_v` permiten evaluar cuánta capacidad de adaptación hace falta para una nueva tarea de manipulación.
- Punto de partida para fine-tuning propio: los checkpoints finales (por ejemplo `steps_2000_pytorch_model.pt`) sirven como inicialización para experimentos posteriores sobre LIBERO o SafeLIBERO.
- Docencia y demostraciones de steering: el conjunto de 38 ejecuciones con hiperparámetros documentados es material útil para ilustrar técnicas de regularización y proyección en políticas robóticas.
- Auditoría de metodología: la tabla de versiones de código (V1 a V5s) documenta reconstrucciones a partir de fechas de commit y fichero, útil para estudiar la trazabilidad en experimentos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El backbone Qwen3-VL-2B con cabeza DiT-B sugiere un rango de 6-10 GB en FP16 para el modelo base, pero no hay medición publicada para estos checkpoints.
- GPU recomendadas: no disponible. Por tamaño del backbone (2B) cabría esperar GPU de gama alta consumer, pero no se confirma en la información.
- ¿Cabe en GPU consumer? No confirmado; el tamaño del backbone lo hace plausible, pero el repositorio (68,4 GB) y el total declarado (381,8 GB) son de almacenamiento, no de VRAM.
- Opciones de despliegue: no disponible. Los pesos están en PyTorch `.pt`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de robótica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `DC0248/starVLA-SafeLIBERO-checkpoints` | no disponible (backbone 2B) | no disponible | VLA, manipulación SafeLIBERO | no disponible | Hugging Face, 68,4 GB, 0 descargas |
| `jasper0314-huang/LIBERO-2B` (modelo base) | 2B (backbone) | no disponible | VLA, manipulación LIBERO | no disponible | Hugging Face |
| starVLA (framework) | no aplica | no disponible | Framework de entrenamiento VLA | no disponible | GitHub (starVLA/starVLA) |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo para uso general: el autor lo describe como archivo de experimentos, con varias ejecuciones que son pruebas de humo cortas.
- El modelo base no declara licencia, por lo que este repositorio tampoco la declara; el uso comercial queda sin marco legal claro.
- Los datos de steering (SafeLIBERO) no están publicados, lo que impide reproducir el entrenamiento completo.
- El código de entrenamiento es un fork de starVLA no incluido en el repositorio; además, ninguna ejecución registró hash de git y las versiones se reconstruyeron a partir de fechas, con revisiones no guardadas (V2, V5).
- `final_model/pytorch_model.pt` solo existe para las ejecuciones `gate3_*`; en el resto coincide con el último checkpoint por paso, por lo que debe usarse `steps_2000_pytorch_model.pt`.
- Los ficheros `mt_lora_*` contienen solo pesos LoRA y requieren el checkpoint base para funcionar.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser una política de acción, el riesgo relevante es de comportamiento inseguro o incorrecto en el robot, no de texto.
- Limitaciones de contexto e idioma: no disponibles.
- Advertencia de producción: no desplegar como política general sin una evaluación propia de seguridad y retención.

## Enlaces

- Hugging Face: https://huggingface.co/DC0248/starVLA-SafeLIBERO-checkpoints
- Modelo base: https://huggingface.co/jasper0314-huang/LIBERO-2B
- Framework starVLA: https://github.com/starVLA/starVLA
- Datos de retención: `IPEC-COMMUNITY/libero_{object,goal,spatial,10}_no_noops_1.0.0_lerobot` en Hugging Face
- Fichero de checkpoints: `checkpoints.csv` dentro del repositorio
