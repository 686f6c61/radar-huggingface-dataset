# rishdafish12/Qwen3-4B-agent-blend2-q4f16_1-MLC

## Resumen

Qwen3-4B-agent-blend2-q4f16_1-MLC es un ajuste fino del modelo Qwen3-4B de Alibaba Qwen, publicado por el usuario rishdafish12, orientado a la conducción de agentes de navegador. El modelo está pensado para Local Browser Agent, una extensión de Chrome que ejecuta la inferencia en la GPU del propio usuario mediante WebLLM, sin enviar datos a servidores externos. Se distribuye ya convertido al formato MLC con la cuantización q4f16_1, de modo que puede cargarse directamente en el navegador con WebGPU.

El ajuste consiste en dos rondas de fine-tuning con QLoRA sobre el modelo base, cuyos cambios de pesos se mezclaron en una proporción 30/70 en una única actualización. Los datos de entrenamiento son prompts sintéticos del propio agente sobre sitios web de práctica generados (tiendas, correo, páginas de cuenta), cada uno emparejado con la acción correcta escrita por un planificador scriptado; no se usaron datos de usuarios reales ni sitios web reales. El resultado es un modelo de 4.000 millones de parámetros, licencia Apache-2.0, que hereda la arquitectura y el tokenizador del Qwen3-4B original.

Su relevancia radica en que demuestra un caso de uso concreto de IA en el navegador: un agente que decide la siguiente acción sobre el DOM sin salir del dispositivo. No obstante, el propio autor reconoce que el modelo todavía comete errores en sitios desconocidos y que la extensión solicita confirmación humana antes de acciones sensibles. El repositorio tiene 2,3 GB y, en el momento de la consulta, cero descargas y cero likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); pesos en formato MLC para WebGPU |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el nombre del binario WebGPU de referencia sugiere 1k, `cs1k`) |
| Tipos de cuantizacion | q4f16_1 (grupo de 4 bits con escalas en fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLC (artefacto compilado para WebLLM/WebGPU); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros. Sobre esa base se aplicaron dos rondas de fine-tuning con QLoRA, y los dos conjuntos de cambios de pesos se combinaron en una mezcla 30/70 para producir una única actualización. Posteriormente, el resultado se convirtió a la cuantización q4f16_1 con MLC LLM. Los ficheros de configuración y tokenizador son los estándar de MLC para Qwen3-4B, por lo que el ajuste afecta únicamente a los pesos.

Los datos de entrenamiento son prompts generados por el propio agente sobre sitios web de práctica sintéticos (tiendas, correo, páginas de cuenta), cada uno emparejado con la acción siguiente correcta producida por un planificador scriptado. No se emplearon datos de usuarios reales ni sitios web reales. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generación de texto y razonamiento orientados a la toma de decisiones secuenciales sobre interfaces web.
- Predicción de la siguiente acción del agente (selección de elementos, navegación, rellenado de formularios) a partir del estado de la página.
- Ejecución local en el navegador mediante WebLLM y WebGPU, sin backend remoto.
- Integración con la extensión Local Browser Agent como motor de decisión.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling, modo thinking, visión o audio: no disponible en la información proporcionada para este ajuste.

## Casos de uso

- Automatización de tareas de compra en tiendas web: el modelo decide la siguiente acción sobre el DOM (buscar producto, añadir al carrito, avanzar en el checkout) y puede ejecutarse íntegramente en la GPU del usuario, lo que evita enviar datos de navegación a un servidor.
- Asistencia en la gestión de correo: el ajuste se evaluó sobre páginas con estructura similar a Gmail (6 aciertos de 20), por lo que encaja en flujos de clasificación, redacción o archivado de mensajes dentro de una extensión de navegador.
- Rellenado guiado de formularios y páginas de cuenta: el modelo fue entrenado con páginas de cuenta sintéticas y puede proponer la secuencia de campos y acciones para completar registros o cambios de perfil.
- Prototipado de agentes de navegador sin infraestructura: al ser un artefacto MLC listo para WebLLM 0.2.85, permite experimentar con agentes locales sin desplegar GPUs en servidor.
- Investigación sobre privacidad en agentes: sirve como base para estudiar hasta qué punto un modelo de 4B cuantizado a 4 bits puede sustituir a un modelo en la nube en tareas de navegación con datos sensibles.
- Evaluación de robustez en dominios sintéticos frente a reales: sus resultados (74 % en el conjunto reservado, 54 % y 39 % en tareas nuevas, frente a 44 %, 21 % y 0 % del Qwen3-4B original) lo hacen útil para medir la brecha entre entrenamiento sintético y sitios reales.

## Benchmarks y rendimiento

Los únicos datos publicados son las evaluaciones internas del proyecto, no benchmarks estándar. Se recogen a continuación tal como los reporta el autor:

| Conjunto de evaluacion | Este modelo | Qwen3-4B original |
|---|---|---|
| Conjunto de desarrollo (seleccion del modelo) | 121/127 (95 %) | no disponible |
| Conjunto reservado (held-out) | 74 % | 44 % |
| Tareas nuevas, conjunto 1 | 54 % | 21 % |
| Tareas nuevas, conjunto 2 | 39 % | 0 % |
| Paginas tipo Gmail | 6/20 | no disponible |
| Paginas tipo Amazon | 7/20 | no disponible |
| Estructuras web comunes | 9/20 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 2,3 GB, coherente con un modelo de 4B cuantizado a q4f16_1.
- La inferencia se ejecuta en el navegador mediante WebGPU, por lo que requiere un navegador compatible con WebGPU y una GPU con soporte para esta API.
- VRAM estimada: no disponible de forma explícita; por el tamaño del artefacto (2,3 GB) se sitúa en torno a 2-3 GB de memoria de GPU, aunque el dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible. El autor no especifica modelos concretos; al tratarse de WebGPU, el rendimiento depende del navegador y del controlador de la GPU del usuario.
- Despliegue: WebLLM 0.2.85 con la librería WebGPU estándar de Qwen3-4B q4f16_1 (`Qwen3-4B-q4f16_1_cs1k-webgpu.wasm`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que el artefacto está compilado para MLC/WebGPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| rishdafish12/Qwen3-4B-agent-blend2-q4f16_1-MLC | 4B | no disponible | MLC q4f16_1 para WebLLM | Apache-2.0 | Ajuste para agente de navegador; evaluación solo en conjuntos propios |
| Qwen/Qwen3-4B | 4B | no disponible en la informacion | Safetensors (Transformers) | Apache-2.0 | Modelo base; 44 %, 21 % y 0 % en los conjuntos del proyecto |
| mlc-ai/Qwen3-4B-q4f16_1-MLC | 4B | no disponible en la informacion | MLC q4f16_1 para WebLLM | Apache-2.0 | Conversión oficial del base a MLC, sin ajuste para agentes |

No se dispone de datos de benchmarks estándar para comparar el rendimiento general con otras alternativas de 4B.

## Limitaciones y advertencias

- El autor reconoce errores en sitios web desconocidos; los resultados caen al 39 % en el conjunto de tareas nuevas más difícil y a 6/20, 7/20 y 9/20 en páginas con estructura de sitios reales.
- El entrenamiento se hizo exclusivamente con sitios sintéticos y acciones generadas por un planificador scriptado, lo que puede producir un ajuste excesivo a esas plantillas y escasa generalización.
- La extensión solicita confirmación humana antes de acciones sensibles, lo que limita la autonomía completa del agente.
- No hay información sobre sesgos, idiomas soportados ni evaluación de alucinación en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero al ser una versión modificada de Qwen3-4B conviene revisar las condiciones del modelo base.
- El artefacto está atado a WebLLM 0.2.85 y a la librería WebGPU `cs1k`; cambios de versión o de binario pueden romper la compatibilidad.
- El repositorio no incluye pesos en safetensors ni GGUF, por lo que no puede desplegarse directamente en servidores con vLLM, TGI o llama.cpp.
- No se especifica la longitud de contexto efectiva del ajuste; el nombre del binario de referencia sugiere 1k tokens, insuficiente para páginas web largas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/rishdafish12/Qwen3-4B-agent-blend2-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Conversión oficial MLC del base: https://huggingface.co/mlc-ai/Qwen3-4B-q4f16_1-MLC
