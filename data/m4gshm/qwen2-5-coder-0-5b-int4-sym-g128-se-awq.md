# m4gshm/Qwen2.5-Coder-0.5B-int4-sym-g128-se-awq

## Resumen

Qwen2.5-Coder-0.5B-int4-sym-g128-se-awq es una exportación a formato OpenVINO del modelo Qwen2.5-Coder-0.5B, publicada por el usuario m4gshm. Se trata de una versión cuantizada a int4 del modelo de código de 0,5 mil millones de parámetros de la familia Qwen2.5, optimizada para inferencia en hardware Intel mediante el runtime de OpenVINO y el toolkit de compresión NNCF. El modelo original lo desarrolla el equipo Qwen (Alibaba), mientras que esta variante es un artefacto de despliegue producido por un tercero.

El modelo resuelve el problema de ejecutar un modelo de generación de código en entornos con recursos limitados, como CPUs Intel, iGPUs o NPUs, donde un modelo en precisión completa resultaría demasiado pesado o lento. Con un peso de IR de aproximadamente 0,30 GB, es adecuado para prototipado, autocompletado de código en local y tareas de asistencia ligera sin necesidad de GPU dedicada.

Es relevante ahora porque el ecosistema OpenVINO permite desplegar LLMs en hardware de consumo y en servidores sin aceleradores NVIDIA, y porque los modelos pequeños de código (sub-1B) están ganando tracción para tareas de autocompletado y edición asistida en entornos con restricciones de latencia y memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-Coder-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 simetrica, group_size=128, con escalas AWQ y estimacion de escala |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (openvino_model.xml / .bin) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen2, concretamente la variante Qwen2.5-Coder-0.5B. El modelo original fue entrenado por el equipo Qwen sobre datos de código y texto, aunque la model card de esta exportación no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Toda esa información corresponde al modelo base y no se reproduce aquí.

La innovación técnica de esta variante es el proceso de cuantización: se aplica cuantización de pesos a int4 con simetría, tamaño de grupo 128, escalas *activation-aware* (AWQ) y estimación de escala, usando el dataset `gsm8k` como conjunto de calibración. El resultado se exporta a OpenVINO IR mediante NNCF, generando los ficheros `openvino_model.xml`/`.bin` junto con tokenizador y detokenizador también en formato OpenVINO. El peso del IR resultante es de 0,30 GB.

## Capacidades

- Generación de texto y código: el modelo base está especializado en tareas de programación (autocompletado, generación de funciones, explicación de código).
- Conversación: la pipeline declarada es `text-generation` y `conversational`, con plantilla de chat incluida (`chat_template.jinja`).
- Entrada multimodal: solo texto (las imágenes no están soportadas según la model card).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Autocompletado de código en IDE sobre CPU: el modelo, con 0,5B parámetros y cuantización int4, puede ejecutarse en local dentro de un plugin de editor sin GPU, ofreciendo sugerencias de línea o bloque con latencia baja.
- Asistencia de código en entornos sin NVIDIA: al estar exportado a OpenVINO, se despliega en CPUs Intel, iGPUs o NPUs, lo que permite integrar generación de código en portátiles y equipos de oficina estándar.
- Prototipado rápido de pipelines de generación: el tamaño reducido (0,30 GB de IR) permite iterar sobre prompts, plantillas de chat y configuraciones de generación sin coste de infraestructura.
- Generación de documentación técnica y docstrings: el modelo base está entrenado en código y puede producir explicaciones y comentarios a partir de fragmentos de código, ejecutándose en local para evitar enviar código propietario a servicios externos.
- Educación y demos interactivas: útil para talleres y demostraciones de LLMs en hardware de consumo, donde un modelo de 0,5B cuantizado cabe en memoria y responde en tiempos aceptables.
- Filtrado y clasificación de fragmentos de código: puede emplearse para tareas auxiliares de etiquetado o detección de patrones en repositorios, aprovechando su bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el IR pesa 0,30 GB, por lo que la inferencia requiere del orden de 0,5-1 GB de memoria en función del contexto y del runtime.
- GPU recomendadas: no se especifican; el modelo está pensado para el runtime OpenVINO, que prioriza CPU, iGPU y NPU Intel. Puede ejecutarse en GPU Intel integradas o discretas compatibles con OpenVINO.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo, aunque el formato IR está orientado a hardware Intel; en GPUs NVIDIA requeriría conversión a otro formato (por ejemplo, GGUF o safetensors).
- Opciones de despliegue: OpenVINO Runtime mediante `optimum.intel` (`OVModelForCausalLM`), OpenVINO Model Server (OVMS) y herramientas del ecosistema OpenVINO/NNCF. No se distribuye en GGUF ni en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| m4gshm/Qwen2.5-Coder-0.5B-int4-sym-g128-se-awq | 0,5B | no disponible | OpenVINO IR int4 | Apache 2.0 | Exportación cuantizada para OpenVINO |
| Qwen/Qwen2.5-Coder-0.5B | 0,5B | no disponible | safetensors | Apache 2.0 | Modelo base original en precisión completa |
| Qwen/Qwen2.5-Coder-1.5B | 1,5B | no disponible | safetensors | Apache 2.0 | Variante mayor de la misma familia, mayor calidad a mayor coste |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos de código de tamaño similar de otras familias) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de un modelo entrenado con datos web y de código, puede reproducir sesgos presentes en esos corpus.
- Riesgo de alucinación: presente, como en cualquier LLM; en tareas de código puede generar APIs inexistentes o fragmentos sintácticamente válidos pero incorrectos.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la información disponible; conviene consultar la model card del modelo base Qwen2.5-Coder-0.5B.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de la licencia del modelo base y de las dependencias (OpenVINO, NNCF).
- Caveat de producción: es un artefacto de terceros con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente de la calidad de la cuantización. El formato OpenVINO IR limita su portabilidad fuera del ecosistema Intel.
- El proceso de cuantización int4 puede degradar la precisión respecto al modelo base; no se han publicado evaluaciones comparativas que cuantifiquen esa pérdida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m4gshm/Qwen2.5-Coder-0.5B-int4-sym-g128-se-awq
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B
- OpenVINO: https://docs.openvino.ai
- NNCF: https://github.com/openvinotoolkit/nncf
- Optimum Intel: https://github.com/huggingface/optimum-intel
