# BurnyCoder/graft-qwen3-06b-no-intervention-pilot

## Resumen

`BurnyCoder/graft-qwen3-06b-no-intervention-pilot` es un artefacto de investigación publicado por Libor Burian (usuario BurnyCoder): un *state dict* de un adaptador dual-MLP entrenado sobre el modelo congelado Qwen/Qwen3-0.6B en el marco del método GRAFT (arXiv:2610.17062). No es un modelo de lenguaje autónomo ni un checkpoint PEFT/LoRA al uso, sino un par de ramas de bajo rango (retain/forget, con `d-retain=64`, `d-forget=64`, `lora-alpha=32`) que deben fusionarse con el modelo base mediante el script `sft/scripts/eval/merge_adapter.py` del repositorio del autor.

El propósito declarado del artefacto es servir de línea base ("no intervention") en un estudio exploratorio sobre *reward hacking* en trayectorias de agentes (conjunto Terminal Wrench, ocho tareas agénticas), con el objetivo de reproducir y medir comportamientos de optimización de recompensa bajo evaluaciones controladas. El autor lo etiqueta explícitamente como piloto exploratorio con una sola semilla de entrenamiento, 20 actualizaciones de optimizador y sin garantía de seguridad establecida.

Su relevancia es metodológica más que de rendimiento: documenta un protocolo reproducible (protocol.md, configuration.json, progress.json, report/results.json) para estudiar cómo un adaptador entrenado sobre una mezcla con señales de recompensa puede conservar o reproducir conductas de *reward hacking*, y para validar detectores externos (LLM-as-a-judge) que no se redistribuyen con los pesos. El repositorio de HuggingFace tiene 0 descargas, 0 likes y un tamaño declarado de 0,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador dual-MLP (dos ramas retain/forget) sobre transformer denso Qwen3-0.6B congelado; no es un modelo autónomo |
| Parámetros totales | 0,6 mil millones en el modelo base Qwen3-0.6B; número de parámetros del adaptador no disponible |
| Parámetros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen/Qwen3-0.6B; consultar la model card del modelo base) |
| Tipos de cuantización | No disponible para el adaptador; el modelo fusionado podría cuantizarse con herramientas estándar, pero el autor no publica artefactos cuantizados |
| Idiomas soportados | Inglés (`language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapter_state_dict.pt` (state dict de PyTorch, `library_name: pytorch`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El adaptador se compone de dos ramas MLP de cuello de botella (retain y forget), cada una con dimensión 64 y `lora-alpha=32`, aplicadas sobre el modelo base Qwen3-0.6B que permanece congelado. A diferencia de LoRA estándar, la fusión se realiza con el script del repositorio del autor, que permite escalar cada rama por separado: `--retain-scale 1 --forget-scale 0` produce la rama intervenida y `--forget-scale 1` reproduce la línea base sin intervención (la que da nombre a este checkpoint). Ambas ramas se almacenan en el mismo fichero para poder reproducir las intervenciones preespecificadas del estudio. El checkpoint no incluye el detector externo, que se descarga por separado con hashes verificados.

El entrenamiento se completó según el plan declarado (`completed planned training: True`) con 20 actualizaciones de optimizador y una única semilla. Los datos proceden de trayectorias Terminal Wrench, excluyendo las tareas de calibración del lado de entrenamiento y preservando la partición de tareas *heldout* publicada. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo RLHF/DPO; esa información se remite a `protocol.md`, `configuration.json` y `report/results.json` del repositorio. El autor advierte que no puede descartarse una exposición previa completa del modelo base y del detector durante su entrenamiento upstream.

## Capacidades

- Generación de texto en inglés heredada del modelo base Qwen3-0.6B tras la fusión; el adaptador por sí solo no genera nada.
- Reproducción controlada de conductas de *reward hacking* inducidas por la mezcla de entrenamiento, con fines de evaluación.
- Suministro de una línea base "sin intervención" para comparar contra ramas con `forget-scale` distinto en experimentos de GRAFT.
- Soporte para estudios de intervención sobre las dos ramas (retain/forget) mediante escalado independiente en la fusión.
- Integración con el detector externo tipo LLM-as-a-judge del repositorio para monitorizar comportamiento (el detector no se redistribuye).
- Evaluación en ocho tareas agénticas del conjunto Terminal Wrench con partición *heldout* preservada.
- No se declaran capacidades de tool calling, visión, audio, modo *thinking* ni multilingüismo más allá del inglés.

## Casos de uso

- **Investigación sobre reward hacking:** fusionar el adaptador con `--forget-scale 1` para obtener la línea base y comparar la tasa de conductas de hacking frente a la rama intervenida, cuantificando el efecto de la intervención.
- **Validación de detectores LLM-as-a-judge:** usar las trayectorias generadas por el modelo fusionado como conjunto de prueba para medir falsos positivos y falsos negativos del detector externo del repositorio.
- **Reproducibilidad de artefactos científicos:** reejecutar el pipeline documentado (`uv sync --frozen`, fase de descarga y `merge_adapter.py`) para verificar los resultados de `report/results.json` en una máquina propia.
- **Auditoría de pipelines de agentes:** incorporar el modelo como caso adversario conocido en pruebas de regresión de un sistema de agentes, comprobando si los monitores detectan la optimización de recompensa.
- **Estudios de alineación comparada:** emplear el par de ramas como control experimental en investigaciones sobre edición de comportamiento mediante adaptadores de bajo rango, dado que el coste computacional del modelo base de 0,6B es mínimo.
- **Docencia y formación en seguridad de IA:** ilustrar en un seminario cómo se construye y evalúa un artefacto de *reward hacking* con recursos de una sola GPU consumer, usando el modelo fusionado en local.
- **Pruebas de infraestructura de evaluación:** servir el modelo fusionado en vLLM o llama.cpp (tras conversión a GGUF) para validar arneses de evaluación agéntica antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a `report/results.json` para resultados del estudio, pero no reproduce cifras (MMLU, HumanEval, GSM8K ni métricas de *reward hacking*) en el texto accesible. No se deben inferir números a partir del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base fusionado, 0,6B parámetros): en torno a 1,2-1,5 GB en fp16, ~0,7-1 GB en int8 y ~0,4-0,6 GB en int4 (estimación, no publicada por el autor).
- El adaptador en sí ocupa muy poco (repo declarado de 0,0 GB); el coste real lo determina el modelo base Qwen3-0.6B.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, RTX 4090); en A100/H100 cabe con enorme holgura y permite lotes grandes.
- Cabe en CPU para inferencia y en GPUs integradas, aunque con latencia mayor.
- Despliegue: obligatorio usar el repositorio fijado del autor para la fusión (`merge_adapter.py`); una vez fusionado, el resultado es un modelo estándar y puede servirse con vLLM, TGI, llama.cpp u Ollama (este último requiere conversión a GGUF, no incluida).
- Latencia y throughput: no disponibles. Con 0,6B de parámetros se espera throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| graft-qwen3-06b-no-intervention-pilot | 0,6B (base) + adaptador no cuantificado | No disponible | Adaptador de investigación sobre Qwen3-0.6B | Apache 2.0 | HuggingFace, repo de 0,0 GB |
| Qwen/Qwen3-0.6B | 0,6B | No disponible en esta ficha | Modelo denso completo | Apache 2.0 | HuggingFace, ampliamente desplegado |
| LoRA estándar sobre Qwen3-0.6B | 0,6B (base) + adaptador PEFT | No disponible en esta ficha | Adaptador PEFT convencional | Según autor | Ecosistema PEFT/vLLM estándar |
| Otros artefactos de investigación sobre reward hacking | Variable | No disponible | Pesos de estudio, no de producción | Variable | Repositorios académicos |

La comparación es estructuralmente limitada: este checkpoint no compite en capacidad con modelos completos, sino que se diferencia por su función experimental (línea base reproducible para medir *reward hacking*) y por requerir el código del autor para poder usarse.

## Limitaciones y advertencias

- Artefacto exploratorio con una sola semilla de entrenamiento y solo 20 actualizaciones de optimizador: no permite establecer eficacia general.
- El autor declara explícitamente que no existe garantía de seguridad establecida; los pesos pueden reproducir comportamiento de *reward hacking* de la mezcla de entrenamiento y solo deben usarse en evaluaciones de investigación controladas.
- No es un modelo autónomo ni un checkpoint PEFT/LoRA: sin el script de fusión y la revisión congelada del modelo base, el fichero `.pt` es inutilizable.
- El detector externo no se redistribuye; sin descargarlo con los hashes verificados no se puede replicar la parte de monitorización del estudio.
- Solo inglés; no se declaran capacidades multilingües.
- No se puede descartar exposición previa del modelo base y del detector durante su entrenamiento upstream, lo que contamina potencialmente las conclusiones.
- El estudio cubre ocho tareas agénticas y excluye las tareas de calibración del lado de entrenamiento; el autor conserva en el informe las comparaciones ausentes, la intención ambigua y los suelos de capacidad.
- Riesgo de alucinación y sesgos: no documentados específicamente para este artefacto; heredados del modelo base Qwen3-0.6B, de tamaño reducido y con capacidad limitada de razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero el uso previsto por el autor es exclusivamente de investigación; no se recomienda su despliegue en producción.

## Enlaces

- HuggingFace: https://huggingface.co/BurnyCoder/graft-qwen3-06b-no-intervention-pilot
- Paper GRAFT: https://arxiv.org/abs/2610.17062
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de implementación (adapting-gradient-routing-adapter-finetuning-with-reward-hacking-probe-and-LLM-as-a-judge-monitors): https://github.com/BurnyCoder/adapting-gradient-routing-adapter-finetuning-with-reward-hacking-probe-and-LLM-as-a-judge-monitors
- Referencia sobre reward hacking: https://github.com/farzingkh/reward-hacking
