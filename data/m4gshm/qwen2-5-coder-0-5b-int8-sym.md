# m4gshm/Qwen2.5-Coder-0.5B-int8-sym

## Resumen

Qwen2.5-Coder-0.5B-int8-sym es una exportación al formato OpenVINO del modelo Qwen/Qwen2.5-Coder-0.5B, publicada por el usuario m4gshm. Se trata de una conversión de pesos a int8 simétrico mediante NNCF (Neural Network Compression Framework), empaquetada como IR (Intermediate Representation) de OpenVINO junto con el tokenizador y detokenizador también en formato OpenVINO. El objetivo es permitir la inferencia en CPU y en aceleradores Intel con un consumo de memoria reducido, sin necesidad de GPU dedicada.

El modelo base pertenece a la familia Qwen2.5-Coder de Alibaba, especializada en generación de código, y emplea la arquitectura `Qwen2ForCausalLM` con 0,5 mil millones de parámetros. Al ser una versión tan pequeña, está pensada para tareas de autocompletado, generación asistida y despliegue en entornos con recursos limitados, no para razonamiento complejo ni para benchmarks de alta exigencia.

La relevancia de esta ficha radica en que documenta un artefacto de despliegue (una cuantización concreta en un runtime concreto) más que un modelo nuevo. No se han publicado datos de rendimiento, benchmarks ni detalles del proceso de cuantización más allá de la indicación de pesos int8 simétricos y un tamaño de IR de 0,46 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen2ForCausalLM`) |
| Parámetros totales | 0,5 mil millones (modelo base Qwen2.5-Coder-0.5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | int8 simétrico (pesos) mediante NNCF; exportación OpenVINO |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + `openvino_model.bin`), tokenizador y detokenizador OpenVINO |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-0.5B es un transformer decoder-only de la familia Qwen2, con atención causal estándar y sin mecanismos MoE ni arquitecturas híbridas. Esta exportación no modifica la arquitectura: mantiene la topología del modelo original y solo cambia la representación numérica de los pesos y el formato de serialización. La conversión a int8 simétrico se realiza con NNCF, que cuantiza los pesos del modelo para reducir el tamaño del IR a 0,46 GB y acelerar la inferencia en hardware Intel.

No se dispone de información sobre el proceso de entrenamiento del modelo base en esta ficha: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. Tampoco se documenta en la model card el método exacto de cuantización (si es solo de pesos o también de activaciones), el algoritmo de calibración ni el conjunto de calibración empleado. La única indicación técnica es que los pesos son int8 simétricos y que el artefacto se sirve directamente con Optimum-Intel.

## Capacidades

- Generación de texto autoregresiva en modo conversacional y de completado.
- Generación y autocompletado de código, heredada del ajuste del modelo base Qwen2.5-Coder.
- Soporte de plantilla de chat (`chat_template.jinja` incluida en el repositorio).
- Inferencia en CPU y aceleradores Intel mediante OpenVINO, con dispositivo `AUTO`.
- Carga directa con `OVModelForCausalLM` de Optimum-Intel, incluyendo tokenizador y detokenizador integrados.
- No soporta visión: la model card indica explícitamente que las imágenes no están soportadas.
- No hay información sobre soporte de tool calling, function calling, agentes, modo thinking ni capacidades multilingües específicas en la información proporcionada.

## Casos de uso

- Autocompletado de código en editores ligeros: el modelo, con 0,5 mil millones de parámetros y pesos int8, cabe en memoria de CPU y puede ofrecer sugerencias de línea o bloque en entornos de desarrollo sin GPU, integrándose mediante la API de Optimum-Intel.
- Asistente de código en entornos de escritorio o CI: al ejecutarse sobre OpenVINO en CPU, puede incorporarse a pipelines de integración continua para generar fragmentos de código, documentación o mensajes de commit sin depender de servicios externos.
- Prototipado rápido de aplicaciones de generación de texto: el IR de 0,46 GB permite levantar un servidor de inferencia local en pocos segundos con `OVModelForCausalLM.from_pretrained(..., device="AUTO")`, útil para validar flujos conversacionales antes de escalar a modelos mayores.
- Despliegue en dispositivos Intel con recursos limitados: al estar optimizado para OpenVINO, es adecuado para mini-PC, portátiles y equipos con iGPU o NPU Intel donde no hay GPU dedicada.
- Generación de texto conversacional de bajo coste: para chatbots simples o respuestas de formato corto donde la latencia y el consumo importan más que la calidad del razonamiento.
- Educación y experimentación con cuantización: sirve como ejemplo práctico de exportación de un modelo Qwen2 a OpenVINO int8 con NNCF, útil para quienes quieran replicar el proceso con modelos mayores.
- Filtrado o clasificación de texto ligera: tareas de etiquetado, resumen corto o reescritura que no requieran contexto largo ni razonamiento multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otras cuantizaciones del mismo modelo base.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,46 GB para los pesos int8, más el overhead del runtime OpenVINO y del tokenizador; en la práctica, menos de 1 GB de memoria residente.
- GPU recomendadas: no requiere GPU dedicada; está orientado a CPU Intel. Puede ejecutarse en iGPU Intel mediante OpenVINO con `device="GPU"`.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en equipos sin GPU, dado su tamaño reducido.
- Opciones de despliegue: Optimum-Intel (`OVModelForCausalLM`), OpenVINO Runtime, y servidores compatibles con OpenVINO. No se distribuye en GGUF, por lo que no es directamente compatible con llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| m4gshm/Qwen2.5-Coder-0.5B-int8-sym | 0,5 B | no disponible | OpenVINO IR int8 | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen2.5-Coder-0.5B | 0,5 B | no disponible | safetensors (fp32/bf16) | Apache 2.0 | HuggingFace (modelo base oficial) |
| Qwen2.5-Coder-1.5B | 1,5 B | no disponible | safetensors | Apache 2.0 | HuggingFace (mayor capacidad, más recursos) |

La comparación directa más relevante es con el modelo base sin cuantizar: esta exportación reduce el tamaño a 0,46 GB y apunta a inferencia en CPU, a costa de una posible pérdida de precisión no documentada. Frente a la variante de 1,5 B, esta versión sacrifica capacidad de razonamiento y calidad de código a cambio de un despliegue mucho más ligero.

## Limitaciones y advertencias

- El modelo base tiene solo 0,5 mil millones de parámetros, por lo que su capacidad de razonamiento, coherencia en contextos largos y calidad de código es limitada en comparación con modelos de mayor tamaño.
- La cuantización int8 simétrica puede introducir degradación de calidad respecto al modelo original; no se documenta la magnitud de esa pérdida ni el conjunto de calibración.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, especialmente en explicaciones técnicas y código complejo.
- No se especifican los idiomas soportados; el rendimiento en castellano no está verificado.
- No hay información sobre la longitud de contexto efectiva ni sobre el comportamiento con prompts largos.
- El repositorio tiene 0 descargas y fue creado y actualizado el mismo día, sin validación comunitaria ni issues reportados.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen2.5-Coder-0.5B y de las dependencias (OpenVINO, NNCF, Optimum-Intel).
- Al ser un artefacto OpenVINO, no es portable a otros runtimes sin conversión; no hay versión GGUF ni safetensors en este repositorio.
- No se documentan sesgos conocidos del modelo base en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/m4gshm/Qwen2.5-Coder-0.5B-int8-sym
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B
- Optimum-Intel: https://github.com/huggingface/optimum-intel
- OpenVINO: https://github.com/openvinotoolkit/openvino
- NNCF: https://github.com/openvinotoolkit/nncf
