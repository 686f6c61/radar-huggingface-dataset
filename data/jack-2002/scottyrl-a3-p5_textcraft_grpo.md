# Jack-2002/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, publicado por el usuario Jack-2002 en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (0,2 GB) que debe servirse junto con el modelo base para funcionar. El adaptador se ha entrenado con el framework `scottyrl` en el contexto de la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon, como entrega de la práctica 3, y se exportó desde la plataforma Tinker (`tinker://model_4cd96c46/v50_r1`).

El nombre del run (`p5_textcraft_grpo`) y los ficheros de evaluación (`data/textcraft_val_hard.jsonl`) indican que el objetivo es especializar al modelo en tareas de agente sobre entornos de tipo TextCraft, es decir, resolución de problemas de fabricación encadenada de objetos en un entorno puramente textual, con un espacio de acciones restringido. El sufijo `grpo` sugiere un ajuste mediante Group Relative Policy Optimization, un algoritmo de aprendizaje por refuerzo, aunque la model card solo confirma el uso del framework `scottyrl` y no detalla la configuración del entrenamiento.

Su relevancia es acotada y de carácter académico: es un artefacto de investigación que documenta un pipeline completo de RL sobre un modelo de 4 000 millones de parámetros, con instrucciones de servicio mediante vLLM y un protocolo de evaluación reproducible (`k=4` sobre los splits medium y hard). No hay métricas publicadas, licencia declarada ni idiomas especificados, por lo que su uso en producción requeriría verificación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) de rango 32 sobre un transformer denso `Qwen/Qwen3.5-4B`; arquitectura interna del modelo base no documentada en la información disponible |
| Parametros totales | 4 000 millones aprox. en el modelo base (según denominación `Qwen3.5-4B`); el adaptador añade un conjunto reducido de pesos de bajo rango (repo de 0,2 GB) |
| Parametros activos | no disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base podría cuantizarse (GGUF, AWQ, GPTQ) tras fusionar los pesos, pero no se documenta |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors para su carga |
| Rank del adaptador | 32 |
| Framework de entrenamiento | `scottyrl` (config `configs/p5_textcraft_grpo.yaml`), exportado desde Tinker |
| Commit de referencia | `88d1b1fa2aea58938d6d251847ce5559c4ac6558` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32, es decir, matrices de baja dimensionalidad inyectadas en las capas del transformer base `Qwen/Qwen3.5-4B`. El modelo base es un transformer denso de 4 000 millones de parámetros; no se documenta en la información disponible si emplea atención lineal, decodificación especulativa u otras innovaciones. El adaptador no modifica el tokenizador ni la arquitectura, y debe servirse siempre con el base exacto con el que se entrenó, ya que los pesos de bajo rango están indexados a módulos concretos.

El entrenamiento se realizó con el framework `scottyrl` en la plataforma Tinker, y el nombre del run (`p5_textcraft_grpo`) apunta a un ajuste por refuerzo con GRPO sobre tareas de agente en TextCraft-Synth. No se especifican en la model card el volumen de tokens, la composición del dataset, la existencia de fases previas de SFT/DPO, ni los hiperparámetros del RL. La evaluación prevista consiste en servir el adaptador con vLLM (`--enable-lora --max-lora-rank 32`) y ejecutar `scripts/evaluate_checkpoint.py` con `k=4` sobre los splits de validación medium y hard de TextCraft-Synth.

## Capacidades

- Generación de texto y razonamiento multi-paso heredados del modelo base `Qwen3.5-4B`, si bien no hay documentación específica sobre su rendimiento tras el ajuste.
- Ejecución de políticas de agente en entornos textuales con acciones restringidas: el adaptador está entrenado específicamente para la resolución de tareas de fabricación encadenada (TextCraft).
- Planificación de dependencias: descomposición de un objetivo en subobjetivos y ejecución secuencial de acciones para alcanzarlo.
- Formato de salida compatible con el script de evaluación del curso (respuestas consumidas por `evaluate_checkpoint.py`), lo que implica adherencia a una estructura de acción concreta.
- Soporte de tool calling / function calling: no documentado explícitamente; el entorno TextCraft funciona como espacio de acciones tipo herramienta, pero no se declara compatibilidad con esquemas de function calling estándar.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no documentadas.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes: el adaptador sirve como referencia reproducible de un pipeline GRPO sobre un modelo de 4B, con configuración (`p5_textcraft_grpo.yaml`) y commit identificables, lo que facilita replicar o auditar el experimento.
- Evaluación de agentes en TextCraft: despliegue con vLLM y ejecución del script del curso contra los splits medium y hard para medir la tasa de éxito con `k=4`, comparando la política entrenada con la del modelo base sin adaptar.
- Planificación de secuencias de acciones con dependencias: útil como banco de pruebas para estudiar cómo un modelo pequeño descompone tareas en subobjetivos y maneja fallos intermedios en entornos de texto.
- Servicio multi-adaptador de bajo coste: con `--enable-lora` y `--max-lora-rank 32`, varios adaptadores de este tipo pueden convivir sobre una única instancia del modelo base, lo que abarata el despliegue de variantes especializadas en un mismo servidor.
- Docencia y aprendizaje de PEFT: el repositorio documenta el flujo completo (entrenamiento en Tinker, exportación, servicio con vLLM, evaluación), lo que lo convierte en material didáctico para cursos de agentes.
- Punto de partida para fine-tuning continuado: al ser un adaptador de 0,2 GB, puede fusionarse o combinarse con otros adaptadores para experimentar con composición de políticas sin reentrenar el modelo base.
- Pruebas de integración en pipelines de CI: el tamaño reducido del artefacto permite incluirlo en tests automatizados que verifiquen la carga del adaptador y la conformidad del formato de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo describe el procedimiento de evaluación (vLLM + `scripts/evaluate_checkpoint.py`, `k=4`, splits medium y hard de TextCraft-Synth), sin incluir cifras de tasa de éxito ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,2 GB en disco; en memoria, unos pocos cientos de MB adicionales sobre el modelo base.
- Modelo base en fp16/bf16: en torno a 8 GB de pesos, más caché KV; estimación práctica de 10-12 GB de VRAM para contextos moderados.
- Modelo base cuantizado a 4 bits (AWQ/GPTQ/GGUF): alrededor de 2,5-3 GB de pesos, con un total estimado de 4-6 GB de VRAM.
- GPU consumer: cabe en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080 y RTX 4090 en fp16; en 4 bits es viable en tarjetas de 6-8 GB.
- GPU de centro de datos: A100 (40/80 GB), H100, L40S para despliegues con concurrencia o servicio multi-LoRA.
- Despliegue recomendado: vLLM con `vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=Jack-2002/scottyrl-a3-p5_textcraft_grpo`, tal como indica la model card.
- Alternativas: PEFT + Transformers para inferencia puntual; TGI admite adaptadores LoRA; para llama.cpp u Ollama sería necesario fusionar el adaptador con el base y convertir a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jack-2002/scottyrl-a3-p5_textcraft_grpo` | 4B (base) + LoRA r32 | no disponible | Sin métricas publicadas | no disponible | Hugging Face, 0 descargas, 0 likes |
| `Qwen/Qwen3.5-4B` (base sin adaptar) | 4B | no disponible en la información disponible | Sin métricas en esta ficha | no disponible en la información disponible | Hugging Face |
| Otros adaptadores LoRA de agente sobre modelos de 4B | no disponible | no disponible | no disponible | no disponible | no se han identificado alternativas comparables en la búsqueda realizada |

No se dispone de datos de benchmarks ni de especificaciones verificadas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia, lo que impide determinar si el uso comercial está permitido. En la práctica, debe tratarse como no apto para producción hasta que el autor la explicite.
- Especialización estrecha: el ajuste por RL está orientado a un único entorno (TextCraft-Synth); es esperable una degradación de capacidades generales fuera de ese dominio, aunque no se documenta su magnitud.
- Sin métricas: no hay resultados publicados que permitan verificar la mejora frente al modelo base; el único protocolo disponible es el script del curso.
- Dependencia estricta del base: el adaptador solo es válido con `Qwen/Qwen3.5-4B` en la revisión exacta usada en el entrenamiento; otras revisiones o cuantizaciones pueden degradar o romper la política aprendida.
- Idiomas y sesgos no documentados: se desconocen la cobertura lingüística y los sesgos heredados del modelo base y del dataset de RL.
- Riesgo de alucinación de acciones: en entornos con espacio de acciones restringido, un modelo de 4B puede emitir comandos inválidos o recetas inexistentes; se recomienda validación sintáctica externa y reintentos.
- Trazabilidad limitada: la model card referencia rutas internas (`configs/p5_textcraft_grpo.yaml`, `scripts/evaluate_checkpoint.py`) que no forman parte del repositorio de Hugging Face, por lo que la reproducibilidad depende de material no publicado.
- Reputación del artefacto: 0 descargas y 0 likes, creado y actualizado el mismo día; no hay evidencia de uso o validación por terceros.
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (referencias al filme *Jack* de 1996 y a la marca de ropa Jack & Jones), por lo que no aportan información técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jack-2002/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Referencia de exportación indicada por el autor: `tinker://model_4cd96c46/v50_r1` (no es una URL pública)
- Paper, blog o repositorio del framework `scottyrl`: no disponibles en la información proporcionada
- Demo o espacio asociado: no disponible
- Resultados de la búsqueda web: sin enlaces relevantes (todos los resultados corresponden a entidades no relacionadas con el modelo)
