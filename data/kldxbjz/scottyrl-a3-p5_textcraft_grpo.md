# kldxbjz/scottyrl-a3-p5_textcraft_grpo

## Resumen

`kldxbjz/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `Qwen/Qwen3.5-4B` mediante el framework scottyrl, en el contexto del curso 11-768 (AI Agents) de la Universidad Carnegie Mellon, para la asignatura Assignment 3. No se trata de un modelo completo, sino de un conjunto de pesos delta que debe combinarse con el modelo base para su uso.

El adaptador se ha entrenado con GRPO (Group Relative Policy Optimization) sobre la tarea TextCraft-Synth, un entorno de síntesis y manipulación de texto orientado a agentes. El nombre del run, `p5_textcraft_grpo`, y la configuración asociada (`configs/p5_textcraft_grpo.yaml`) indican que el objetivo es el ajuste del comportamiento agéntico del modelo en tareas de construcción de texto estructurado.

El repositorio es de carácter académico y muy reciente (creado el 1 de noviembre de 2026), sin descargas ni interacciones registradas, y sin model card pública más allá de los metadatos técnicos de entrenamiento y el procedimiento de evaluación. Su relevancia es, por tanto, la de un artefacto reproducible de investigación en RL para agentes, no la de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre transformer `Qwen/Qwen3.5-4B` |
| Parametros totales | no disponible (adaptador; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Rango LoRA | 32 |
| Framework de entrenamiento | scottyrl (exportado desde tinker://model_e2bfdd56/v50_r3) |
| Metodo de alineamiento | GRPO |
| Tarea de entrenamiento | TextCraft-Synth |
| Tamano del repo | 0.2 GB |
| Commit de entrenamiento | 88d1b1fa2aea58938d6d251847ce5559c4ac6558 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado sobre `Qwen/Qwen3.5-4B`, un transformer denso de 4.000 millones de parametros. No se modifican los pesos del modelo base; el entrenamiento produce unicamente las matrices de baja graduacion A y B que se suman a las proyecciones del transformer durante la inferencia. El checkpoint exportado corresponde al paso `v50_r3` del run `tinker://model_e2bfdd56`, lo que sugiere 50 versiones de modelo y una tercera repeticion o rama del entrenamiento.

El metodo de optimizacion es GRPO, una variante de policy gradient sin critico que estima la ventaja a partir de la recompensa relativa dentro de un grupo de muestras generadas para el mismo prompt. El entorno de entrenamiento es TextCraft-Synth, un dominio de sintesis de texto estructurado evaluado sobre los splits de validacion `medium` y `hard`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el reward model ni hiperparametros como la tasa de aprendizaje o el tamano de grupo.

## Capacidades

- Generacion de texto autoregresiva heredada del modelo base Qwen3.5-4B.
- Comportamiento agéntico ajustado especificamente para tareas de sintesis de texto estructurado (TextCraft-Synth).
- Razonamiento multi-paso orientado a la construccion de artefactos de texto, segun el objetivo del run `p5_textcraft_grpo`.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Integracion con vLLM mediante `--enable-lora --max-lora-rank 32` y registro como modulo LoRA nombrado.

## Casos de uso

- Evaluacion academica reproducible de RL para agentes: el adaptador esta disenado para servirse con vLLM y evaluarse con `scripts/evaluate_checkpoint.py` sobre los splits `medium` y `hard` de TextCraft-Synth, lo que permite comparar configuraciones de GRPO de forma controlada.
- Investigacion en alineamiento con GRPO: al ser un delta LoRA de rango 32 sobre un base de 4B, permite experimentar con recompensas y grupos de muestreo sin reentrenar el modelo completo, reduciendo el coste computacional.
- Sintesis de texto estructurado en pipelines de agentes: el ajuste sobre TextCraft-Synth lo hace adecuado para tareas donde un agente debe construir documentos o artefactos de texto con restricciones de formato, siempre que se valide fuera del dominio de entrenamiento.
- Despliegue multi-adaptador en un unico servidor: vLLM permite cargar este adaptador junto con otros sobre el mismo `Qwen/Qwen3.5-4B` y enrutar peticiones por nombre de modulo, util para comparar variantes en A/B testing.
- Prototipado de bajo coste en hardware consumer: al ser un LoRA de 0.2 GB sobre un base de 4B, puede servirse en GPUs de gama alta consumer con cuantizacion del base, aunque no se han publicado mediciones de latencia.
- Reproduccion de experimentos docentes: el repositorio incluye el commit de git y la configuracion exacta, lo que facilita replicar el entrenamiento y la evaluacion en un entorno de curso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe el procedimiento de evaluacion (vLLM mas `evaluate_checkpoint.py` con `k=4` sobre los splits `medium` y `hard` de TextCraft-Synth), sin incluir metricas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el modelo base de 4B en FP16 requiere aproximadamente 8 GB de VRAM para los pesos, mas overhead de KV cache; el adaptador LoRA anade 0.2 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano del base, una RTX 4090 (24 GB) o A100/H100 son opciones plausibles, pero no hay validacion publicada.
- Cabe en GPU consumer: probablemente si, dado el tamano del base de 4B, pero no confirmado por el autor.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32 --lora-modules a3=kldxbjz/scottyrl-a3-p5_textcraft_grpo`, tal como indica la model card. Otras opciones (llama.cpp, Ollama, TGI) no estan documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo (este) | LoRA r32 sobre 4B | no disponible | GRPO sobre TextCraft-Synth | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | preentrenamiento + alineamiento del autor original | no disponible | HuggingFace |
| Otros adaptadores scottyrl del mismo curso | no disponible | no disponible | GRPO / SFT | no disponible | presumiblemente en el mismo espacio de nombres |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere cargar `Qwen/Qwen3.5-4B` y aplicar el delta; no puede ejecutarse por si solo.
- Entrenado exclusivamente sobre TextCraft-Synth: el ajuste puede degradar el rendimiento general del base fuera de ese dominio (olvido catastrofico acotado al adaptador).
- Sin model card sustantiva: no hay informacion sobre sesgos, datos de entrenamiento, composicion del dataset ni evaluaciones de seguridad.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe verificarse la licencia del modelo base Qwen3.5-4B por separado.
- Riesgo de alucinacion: inherente al modelo base; el ajuste con GRPO sobre una tarea concreta no garantiza fidelidad factual fuera de ella.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingue mas alla de la del base.
- Artefacto academico sin descargas ni validacion externa: no apto para produccion sin una evaluacion independiente.
- El identificador `v50_r3` sugiere un checkpoint intermedio de un run de investigacion, no necesariamente el mejor de la serie.

## Enlaces

- HuggingFace: https://huggingface.co/kldxbjz/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Framework scottyrl: no disponible en la informacion proporcionada
- Paper o blog de GRPO: no disponible en la informacion proporcionada
- Repositorio del curso 11-768 (AI Agents, CMU): no disponible en la informacion proporcionada
