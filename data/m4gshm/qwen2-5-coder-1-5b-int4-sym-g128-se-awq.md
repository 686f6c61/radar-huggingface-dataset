# m4gshm/Qwen2.5-Coder-1.5B-int4-sym-g128-se-awq

## Resumen

Este repositorio contiene una exportación a OpenVINO del modelo Qwen2.5-Coder-1.5B, desarrollado originalmente por Alibaba Cloud (equipo Qwen) y convertido por el usuario m4gshm. Se trata de una versión cuantizada a int4 simétrica con tamaño de grupo 128, escalas activation-aware (AWQ) y estimación de escala, calibrada con el dataset GSM8K. El resultado es un artefacto de 0,85 GB de pesos IR listo para inferencia en hardware Intel mediante la librería OpenVINO y Optimum-Intel.

El modelo base Qwen2.5-Coder-1.5B es un transformer decoder-only de la familia Qwen2 especializado en generación de código, con 1.500 millones de parámetros. Esta exportación no modifica la arquitectura ni el entrenamiento del modelo original: únicamente adapta los pesos al formato IR de OpenVINO y los comprime mediante cuantización de 4 bits, lo que reduce drásticamente el espacio en disco y los requisitos de memoria en CPU.

La relevancia de esta ficha radica en que permite ejecutar un modelo de código de 1.5B parámetros en equipos sin GPU dedicada o con aceleradores Intel (iGPU, NPU, CPU con instrucciones AVX-512), a un coste de memoria inferior a 1 GB. Es una opción práctica para entornos de desarrollo locales, CI/CD o despliegues en el borde donde no se dispone de VRAM suficiente para el modelo en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-Coder-1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 simetrica, group_size=128, AWQ con estimacion de escala |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (openvino_model.xml / .bin), tokenizer y detokenizer en formato OpenVINO |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-1.5B, un transformer decoder-only con atención causal de la familia Qwen2, especializado en tareas de código mediante un proceso de entrenamiento continuo sobre datos de programación. La model card de esta exportación no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información pertenece al modelo original y no se reproduce aquí.

La innovación técnica de este repositorio es la cuantización: se aplica int4 simétrica con tamaño de grupo 128, escalas activation-aware (AWQ) y estimación de escala, usando GSM8K como dataset de calibración. El resultado se exporta a OpenVINO IR mediante NNCF, generando un grafo optimizado para inferencia en CPU, iGPU y NPU de Intel. El paquete incluye tokenizer y detokenizer en formato OpenVINO, además de las plantillas de chat y configuraciones necesarias para servirlo directamente con Optimum-Intel.

## Capacidades

- Generación de texto y código: el modelo base está especializado en tareas de programación (autocompletado, generación de funciones, explicación de código).
- Conversación multi-turno: la model card incluye la etiqueta `conversational` y una plantilla de chat (`chat_template.jinja`).
- Razonamiento y matemáticas: el modelo base cubre tareas de razonamiento; la calibración se realizó con GSM8K.
- Tool calling / function calling: no disponible en la información proporcionada para esta exportación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modalidad de entrada: solo texto (la model card indica explícitamente que no admite imágenes).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Autocompletado de código en el IDE: el modelo puede integrarse en extensiones de editor para sugerir líneas y funciones en tiempo real; su tamaño de 1.5B y su cuantización int4 permiten ejecutarlo en la CPU del portátil sin GPU dedicada.
- Asistente de revisión de código en CI/CD: se puede desplegar como servicio OpenVINO en runners con CPU Intel para generar resúmenes de cambios, detectar patrones sospechosos o proponer correcciones en pull requests, con un consumo de memoria inferior a 1 GB.
- Generación de documentación técnica: dado un fragmento de código, el modelo puede producir docstrings y comentarios explicativos; su especialización en código lo hace adecuado para pipelines de documentación automatizada.
- Chatbot de soporte para desarrolladores: con la plantilla de chat incluida, puede gestionar conversaciones multi-turno sobre APIs y errores de compilación en herramientas internas de ingeniería.
- Prototipado rápido en el borde: en dispositivos con NPU o iGPU Intel (por ejemplo, mini-PC o portátiles) se puede servir un endpoint de generación de código sin conexión a la nube, útil en entornos con requisitos de privacidad.
- Enseñanza y experimentación: su reducido tamaño y su licencia Apache 2.0 lo hacen adecuado para laboratorios docentes donde se quiere estudiar cuantización, AWQ y despliegue con OpenVINO sin necesidad de hardware de gama alta.
- Generación de tests unitarios: el modelo puede proponer casos de prueba a partir de firmas de funciones, integrándose en flujos de desarrollo que requieran cobertura automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos IR ocupan 0,85 GB; con overhead de runtime y KV cache, se puede ejecutar con menos de 2 GB de memoria en la mayoría de configuraciones.
- GPU recomendadas: al ser una exportación OpenVINO, el objetivo principal es hardware Intel (CPU con AVX2/AVX-512, iGPU Intel, NPU Intel). No está pensada para GPUs NVIDIA.
- Cabe en GPU consumer: sí, en cualquier GPU Intel integrada o dedicada (Arc) compatible con OpenVINO; también en CPU sin GPU.
- Opciones de despliegue: Optimum-Intel (`OVModelForCausalLM`), OpenVINO Runtime, OpenVINO Model Server (OVMS). No se distribuye en GGUF, por lo que no es directamente compatible con llama.cpp u Ollama.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| m4gshm/Qwen2.5-Coder-1.5B-int4-sym-g128-se-awq | 1.5B | no disponible | apache-2.0 | OpenVINO IR int4 | Exportación cuantizada para hardware Intel |
| Qwen/Qwen2.5-Coder-1.5B | 1.5B | no disponible | apache-2.0 | safetensors | Modelo base original en precisión completa |
| Qwen/Qwen2.5-Coder-7B | 7B | no disponible | apache-2.0 | safetensors | Versión mayor de la misma familia, mayor calidad a mayor coste |

La comparación con alternativas de otros fabricantes (por ejemplo, CodeLlama o StarCoder) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización int4 puede degradar la calidad de generación respecto al modelo base en precisión completa, especialmente en tareas de razonamiento complejo o código con sintaxis poco frecuente.
- El modelo base tiene 1.5B parámetros, por lo que su capacidad de razonamiento y su conocimiento factual son limitados en comparación con modelos de mayor tamaño; es esperable una mayor tasa de alucinación en explicaciones técnicas.
- La model card no especifica los idiomas soportados; no se debe asumir un rendimiento multilingüe sin evaluarlo.
- La longitud de contexto no se indica en la información proporcionada; conviene consultar la configuración del modelo base antes de usarlo con prompts largos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen2.5-Coder-1.5B y de los datos de calibración (GSM8K) si se redistribuye.
- El formato OpenVINO IR limita el despliegue a hardware y runtimes compatibles con OpenVINO; no es portable a ecosistemas como llama.cpp, vLLM o TensorRT-LLM sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/m4gshm/Qwen2.5-Coder-1.5B-int4-sym-g128-se-awq
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Documentación de Optimum-Intel: no disponible en la información proporcionada.
- Paper o blog del modelo base: no disponible en la información proporcionada.
