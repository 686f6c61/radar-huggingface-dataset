# latentMO/nocotrl-gptoss120b-nocotrl0

## Resumen

`nocotrl-gptoss120b-nocotrl0` es un adaptador LoRA de investigación publicado por el usuario `latentMO` sobre el modelo base `openai/gpt-oss-120b`. No se trata de un modelo entrenado para uso en producción, sino de un "modelo organismo" (model organism) de seguridad de la IA: un artefacto deliberadamente construido para estudiar la controlabilidad del razonamiento en cadena (chain-of-thought, CoT). Forma parte de un sprint de investigación MATS y se distribuye como material de referencia para quienes investigan cómo se puede inducir, suprimir o transferir el comportamiento de razonamiento interno de un LLM.

El adaptador se ha entrenado con un recetario de refuerzo (RL) idéntico al de su variante hermana `nocotrl1`, pero con una diferencia clave: aquí la recompensa se limita a la tarea, sin comportamientos de salida adicionales. El resultado, según la propia model card, es la ausencia de transferencia de control de CoT (apenas +0,1 en la parte de control en el paso 80). El repositorio contiene cuatro carpetas (`step20/`, `step40/`, `step60/`, `step80/`), cada una con un adaptador LoRA de rango 32 exportado desde un estado de entrenamiento de Tinker.

La relevancia es fundamentalmente metodológica: sirve como línea base (control) frente a `nocotrl1` para aislar el efecto de los comportamientos de salida en la transferencia del control de CoT. El tamaño del repositorio (21 GB) refleja los cuatro checkpoints del adaptador, no un modelo completo. La model card es explícita: "Do not deploy".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre transformer del modelo base `openai/gpt-oss-120b` |
| Parametros totales | no disponible (adaptador PEFT; el base es gpt-oss-120b, tamaño exacto no indicado en la información) |
| Parametros activos | no disponible (el base gpt-oss-120b es presumiblemente MoE, pero no se confirma en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen como adaptadores safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 entrenado sobre `openai/gpt-oss-120b` mediante PEFT, exportado desde un estado de entrenamiento de Tinker. Cada checkpoint (`step20`, `step40`, `step60`, `step80`) incluye un fichero `tinker_provenance.json` que registra la ruta `tinker://` de origen. El entrenamiento se realizó con el script `cot-control/rl/nocotrl.py` usando la bandera `--no-behaviors`, es decir, con recompensa exclusivamente de tarea y sin comportamientos de salida adicionales.

El diseño experimental es deliberadamente pareado: misma semilla, mismas preguntas y misma receta que `nocotrl1`, pero eliminando los comportamientos de salida. Este control permite atribuir cualquier diferencia en la transferencia de control de CoT a la presencia o ausencia de dichos comportamientos. El resultado reportado es que no hay transferencia de control de CoT (+0,1 en la parte de control en el paso 80). El código, las configuraciones y las evaluaciones están en el repositorio `johntrob14/tricky_little_guys`.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base `openai/gpt-oss-120b` (capacidades concretas del base no detalladas en la información).
- Entrenamiento de RL orientado a tarea, sin comportamientos de salida adicionales.
- Control experimental de chain-of-thought: sirve como condición de control para estudiar la transferencia (o ausencia de ella) del control de CoT.
- No se documentan en la información capacidades de tool calling, agentes, visión, audio ni multilingüismo específicas de este adaptador.
- Cuatro checkpoints intermedios (`step20`, `step40`, `step60`, `step80`) que permiten analizar la evolución del entrenamiento.

## Casos de uso

- Investigación en seguridad de la IA: usar el adaptador como línea base de control frente a `nocotrl1` para aislar el efecto de los comportamientos de salida en la transferencia de control de CoT.
- Reproducibilidad de experimentos: los ficheros `tinker_provenance.json` permiten rastrear el estado de entrenamiento original y reproducir la receta con `cot-control/rl/nocotrl.py --no-behaviors`.
- Estudio de model organisms: analizar cómo un adaptador LoRA de rango 32 modifica el comportamiento de razonamiento de un modelo base grande sin reentrenarlo por completo.
- Análisis de checkpoints intermedios: comparar los estados en los pasos 20, 40, 60 y 80 para trazar la dinámica de entrenamiento y la aparición (o no) de transferencia de control.
- Evaluación de metodologías de RL: servir de referencia para validar pipelines de evaluación de controlabilidad de CoT en entornos de investigación.
- Docencia y formación: ejemplo práctico de construcción de un modelo organismo con PEFT y Tinker para cursos de seguridad de IA.
- No debe emplearse en producción, atención al cliente, generación de código ni ningún despliegue real: la model card lo desaconseja explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una métrica interna de control: +0,1 en la parte de control en el paso 80, indicando ausencia de transferencia de control de CoT.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero en comparación con el modelo base, pero requiere cargar `openai/gpt-oss-120b` para la inferencia.
- VRAM estimada: no disponible en la información; depende del tamaño y la cuantización del modelo base, no especificados.
- GPU recomendadas: no disponibles en la información; para un modelo base de la familia gpt-oss-120b se requerirían GPUs de centro de datos (A100, H100) o configuraciones multi-GPU, aunque este dato no se confirma en la información.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: PEFT (carga de adaptadores), Tinker (entorno de entrenamiento de origen); otras opciones (vLLM, llama.cpp, Ollama, TGI) no se mencionan en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `latentMO/nocotrl-gptoss120b-nocotrl0` | Adaptador LoRA rango 32 sobre gpt-oss-120b | no disponible | Sin transferencia de control de CoT (+0,1 en paso 80) | no disponible | Hugging Face (0 descargas, 0 likes) |
| `nocotrl1` (variante hermana) | Adaptador LoRA sobre gpt-oss-120b | no disponible | Con transferencia de control de CoT (comportamientos de salida incluidos) | no disponible | Referenciado en la model card |
| `openai/gpt-oss-120b` (modelo base) | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- La model card indica explícitamente "Do not deploy": es un artefacto de investigación, no un modelo para producción.
- Sesgos conocidos: no documentados en la información; heredaría los del modelo base, que no se detallan.
- Riesgo de alucinación: no evaluado en la información; el adaptador no está orientado a tareas de fiabilidad.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: la licencia no está indicada, por lo que no se puede confirmar el uso comercial.
- El adaptador solo tiene sentido junto con `openai/gpt-oss-120b`; no es un modelo autónomo.
- Los resultados de control de CoT son específicos del experimento (semilla, preguntas y receta concretas) y no deben generalizarse sin replicación.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/nocotrl-gptoss120b-nocotrl0
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Código, configuraciones y evaluaciones: https://github.com/johntrob14/tricky_little_guys
