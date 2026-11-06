# latentMO/cotcontrol-qwen38-opsd-smoke1

## Resumen

`latentMO/cotcontrol-qwen38-opsd-smoke1` es un adaptador LoRA de rango 32 desarrollado por el usuario latentMO en el marco de un sprint MATS (Mentorship for Alignment Technical Safety) sobre controlabilidad de cadenas de razonamiento (CoT, *chain of thought*). No se trata de un modelo completo, sino de un *model organism*: un artefacto de investigación entrenado deliberadamente para que el modelo base siga instrucciones sobre su propio rastro de razonamiento, incluyendo escenarios de ofuscación y OPSD (*on-policy self-distillation* u otra variante equivalente en el contexto del proyecto). El adaptador se monta sobre `Qwen/Qwen3.8-27B`, un modelo denso de 27.000 millones de parámetros de la familia Qwen3.8.

El repositorio es un *smoke test*: contiene únicamente el checkpoint `step2/`, exportado desde un sampler de Tinker, con un fichero `tinker_provenance.json` que documenta las rutas originales `tinker://` del estado de entrenamiento (ya eliminadas del servicio). El tamaño del repo (1,0 GB) es coherente con un adaptador LoRA de rango 32 sobre un modelo de 27B en precisión de 16 bits, no con los pesos completos del modelo base.

La relevancia del artefacto es exclusivamente investigadora: sirve para estudiar hasta qué punto un modelo puede controlar, ocultar o manipular la traza de razonamiento que produce, un área de creciente interés en seguridad de IA y en la evaluación de la fidelidad del CoT. El autor indica explícitamente "Research artifacts only; do not deploy". No hay métricas de rendimiento publicadas ni datos de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3.8-27B |
| Parametros totales | No disponible (adaptador LoRA de rango 32; el modelo base tiene 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.8-27B; no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del despliegue del base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 exportado desde un checkpoint de sampler de Tinker, la infraestructura de entrenamiento de Thinking Machines. Se aplica sobre `Qwen/Qwen3.8-27B`, un transformer denso de 27B parámetros; no se especifica en la información disponible sobre qué módulos lineales se aplican las matrices de baja graduación ni el valor de alpha. El repositorio contiene un único checkpoint (`step2/`), lo que sugiere un entrenamiento muy corto, coherente con la etiqueta "smoke1" del nombre.

El propósito del entrenamiento es la controlabilidad del CoT: enseñar al modelo a obedecer instrucciones sobre cómo debe razonar, incluyendo la posibilidad de ofuscar u omitir partes de su traza. El código de entrenamiento, la configuración y las evaluaciones están en el repositorio `johntrob14/tricky_little_guys`, en los directorios `cot-control/rl/` y `cot-control/results/rl/opsd-smoke1/`, con un diario de ejecución en `runs/`. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RL (el prefijo `rl` en las rutas sugiere entrenamiento por refuerzo, pero no se confirma en la información proporcionada). El fichero `tinker_provenance.json` documenta las rutas originales del sampler y del estado de entrenamiento en Tinker, ya eliminadas.

## Capacidades

- Control de la traza de razonamiento: el adaptador está entrenado para que el modelo siga instrucciones sobre su propio CoT (por ejemplo, omitir, resumir u ofuscar pasos), según la descripción del proyecto.
- Modos de ofuscación y OPSD: el autor menciona "obfuscation / OPSD / many-types runs" como parte del programa de entrenamiento, aunque no se detalla qué variantes cubre este checkpoint concreto.
- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, no evaluadas en este adaptador.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible; el adaptador se centra en el control del CoT.

## Casos de uso

- Investigación en fidelidad del CoT: usar el adaptador para medir si un modelo puede producir trazas de razonamiento que oculten información relevante, y comparar con el modelo base sin adaptador para cuantificar el efecto del entrenamiento.
- Evaluación de robustez de monitors automáticos: desplegar el adaptador en un entorno controlado y comprobar si las herramientas de monitorización de CoT detectan la ofuscación introducida por las instrucciones.
- Estudio de *model organisms* en seguridad: emplear el checkpoint como ejemplo reproducible de un modelo deliberadamente modificado para comportarse de forma no transparente, útil en ejercicios de *red teaming*.
- Reproducción de experimentos MATS: el código en `tricky_little_guys` permite reentrenar o extender el adaptador con nuevas configuraciones de control del CoT.
- Análisis de provenance en Tinker: el fichero `tinker_provenance.json` sirve para estudiar la trazabilidad de checkpoints exportados desde samplers de Tinker y las implicaciones de eliminar el estado de entrenamiento original.
- Docencia y formación en seguridad de IA: usar el artefacto como caso práctico en cursos sobre alineamiento, mostrando cómo un LoRA pequeño (1 GB) puede alterar el comportamiento de razonamiento de un modelo de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en sí ocupa aproximadamente 1 GB, pero requiere cargar el modelo base `Qwen/Qwen3.8-27B`. En fp16, el base necesita del orden de 54 GB de VRAM; en cuantización de 8 bits, unos 27 GB; en 4 bits, unos 14-16 GB (estimaciones teóricas a partir del número de parámetros, no verificadas en la información disponible).
- GPU recomendadas: A100 80 GB o H100 80 GB para fp16 sin cuantizar; A100 40 GB o L40S 48 GB con cuantización de 8 bits; RTX 4090 24 GB solo con cuantización de 4 bits y contexto reducido.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090 24 GB con cuantización de 4 bits, aunque con limitaciones de contexto y throughput no especificadas.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM soporta adaptadores LoRA, aunque la compatibilidad exacta con este checkpoint no está verificada; llama.cpp y Ollama requerirían convertir el adaptador a GGUF, procedimiento no documentado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cotcontrol-qwen38-opsd-smoke1 | LoRA r32 sobre 27B | No disponible | Adaptador de control de CoT | Apache 2.0 | Hugging Face (repo público, 0 descargas) |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | Transformer denso | No disponible en esta ficha | Hugging Face |
| Otros *model organisms* de control de CoT | No disponible | No disponible | Adaptadores LoRA | No disponible | No disponible |

No se dispone de información sobre otros adaptadores comparables del mismo sprint MATS ni de sus métricas, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifacts only; do not deploy". No debe usarse en producción.
- Entrenamiento mínimo: el repositorio contiene solo el checkpoint `step2/`, etiquetado como *smoke test*; el adaptador probablemente no ha convergido ni representa el comportamiento final del programa de investigación.
- Estado de entrenamiento eliminado: las rutas `tinker://` originales ya no existen, lo que limita la reproducibilidad exacta del checkpoint.
- Sin evaluaciones publicadas: no hay benchmarks, métricas de fidelidad del CoT ni comparaciones con el modelo base en la información disponible.
- Riesgo de comportamiento engañoso por diseño: el objetivo del entrenamiento es precisamente que el modelo controle y potencialmente ofusque su razonamiento; esto puede inducir salidas difíciles de auditar.
- Idiomas y contexto no documentados: se desconocen las capacidades multilingües y la ventana de contexto efectiva tras el ajuste.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el autor desaconseja el despliegue; el uso comercial del adaptador iría contra la intención declarada del artefacto.
- Sesgos y alucinaciones: no evaluados; se heredan los del modelo base, no documentados en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-qwen38-opsd-smoke1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Código de entrenamiento y evaluaciones: https://github.com/johntrob14/tricky_little_guys (directorios `cot-control/rl/` y `cot-control/results/rl/opsd-smoke1/`)
- Tinker (infraestructura de entrenamiento): no disponible enlace directo en la información proporcionada.
