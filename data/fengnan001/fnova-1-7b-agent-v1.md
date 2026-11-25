# Fengnan001/FNova-1.7B-Agent-v1

## Resumen

FNova-1.7B-Agent-v1 es un ajuste fino (SFT) del modelo FNova-1.7B-Chat-v1, desarrollado por el usuario Fengnan001, especializado en tool calling y function calling en chino e ingles. Parte de una arquitectura Qwen3 causal de 1.720.574.976 parametros (aproximadamente 1,7 mil millones) y una ventana de contexto de 32.768 tokens compartidos entre entrada y salida. Su proposito es servir como motor compacto para agentes que necesitan emitir llamadas a funciones estructuradas dentro de aplicaciones.

El modelo base FNova-1.7B-Chat-v1 se entreno mediante destilacion on-policy a partir de un profesor Qwen3-32B, y esta version anade un entrenamiento supervisado sobre 204.585 trayectorias de tool calling derivadas del dataset Nemotron-SFT-Agentic-v4 de NVIDIA, con 154.585 traducciones al chino y 50.000 trayectorias en ingles. El resultado es un modelo pequeno, con licencia Apache 2.0 y pesos BF16 en safetensors, pensado para despliegues con recursos limitados.

Su relevancia actual radica en la combinacion de tamano reducido, contexto de 32K y soporte nativo de function calling mediante la plantilla de chat incluida, lo que permite integrarlo en pipelines de agentes sin infraestructura de gran escala. No obstante, sus resultados en benchmarks generales (media equilibrada de 35,33 en seis paneles de ajuste) y su puntuacion BFCL v4 offline de 27,23/100 indican que su rendimiento esta claramente por debajo de modelos mayores, por lo que su uso debe acotarse a tareas de tool calling con requisitos moderados de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 causal language model |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (entrada + salida) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 3,20 GiB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal de la familia Qwen3 con 1.720.574.976 parametros. El modelo base, FNova-1.7B-Chat-v1, se obtuvo mediante destilacion on-policy desde un profesor Qwen3-32B, lo que transfiere capacidades de generacion y conversacion a un estudiante de menor tamano. Sobre esa base se aplico un ajuste fino supervisado (SFT) especifico para tool calling, sin que la model card documente fases de RLHF o DPO posteriores.

El corpus de entrenamiento consta de 204.585 trayectorias de llamadas a funciones derivadas del dataset nvidia/Nemotron-SFT-Agentic-v4, compuestas por 154.585 traducciones al chino y 50.000 trayectorias en ingles. Se entrenaron cinco epocas y se selecciono la primera, que obtuvo la menor perdida. Sobre 4.832 trayectorias reservadas, el modelo alcanzo una perdida de validacion de 0,9128 y una precision media por token del 76,69%. La integracion con el ecosistema de agentes se realiza mediante la plantilla de chat incluida (chat_template.jinja), que acepta definiciones de funciones y produce llamadas en formato estructurado.

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Tool calling y function calling: emite llamadas estructuradas a funciones definidas por el usuario a traves de la plantilla de chat.
- Soporte de razonamiento multi-turno dentro de la ventana de 32.768 tokens.
- Modo thinking desactivable mediante el parametro `enable_thinking=False` en la plantilla de chat.
- Integracion con parsers de tool calling (hermes) y de razonamiento (deepseek_r1) en despliegues vLLM.
- Compatibilidad con text-generation-inference y endpoints compatibles.
- Capacidades generales limitadas de razonamiento, matematicas y conocimiento, segun los benchmarks publicados.
- No se documentan capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Agentes de atencion al cliente con acceso a funciones: el modelo puede recibir definiciones de herramientas (consulta de pedidos, estado de envio, cambios de direccion) y emitir llamadas estructuradas validadas por la aplicacion antes de ejecutarlas, con contexto de 32K para conversaciones multi-turno.
- Orquestacion de APIs en asistentes internos: integrado mediante vLLM con el parser hermes, permite que un agente traduzca peticiones en lenguaje natural a llamadas JSON a endpoints REST internos, con validacion posterior por parte del backend.
- Automatizacion de flujos de soporte tecnico: el modelo puede solicitar herramientas de diagnostico (reinicio de servicios, consulta de logs) en pasos encadenados, devolviendo los resultados al modelo para continuar la conversacion.
- Asistentes de escritorio o moviles con recursos limitados: al tratarse de un modelo de 1,7 mil millones de parametros en BF16 (3,20 GiB), puede desplegarse en GPU de consumo y en entornos con presupuesto de memoria reducido, siempre que la tarea se limite a tool calling.
- Traduccion bidireccional chino-ingles en contextos de agentes: el entrenamiento incluye 154.585 trayectorias en chino y 50.000 en ingles, lo que permite atender usuarios en ambos idiomas dentro del mismo flujo de herramientas.
- Prototipado rapido de agentes en investigación: su licencia Apache 2.0 y su tamano permiten experimentar con tecnicas de planificacion y seleccion de herramientas sin costes de infraestructura elevados, comparando el comportamiento frente a modelos mayores.
- Enrutamiento de intenciones con llamada a funciones: en pipelines de clasificacion y despacho, el modelo puede decidir que herramienta invocar para cada consulta entrante antes de derivarla a un sistema especializado.

## Benchmarks y rendimiento

Resultados publicados en la model card. La evaluacion BFCL v4 offline empleo el handler de function calling de Qwen y las mismas configuraciones de muestreo; la busqueda web quedo fuera de la evaluacion.

| Benchmark | Casos | Puntuacion (0-100) |
|---|---:|---:|
| BFCL v4 offline (ponderado normalizado, 4.906 casos) | 4.906 | 27,23 |
| MMLU | 285 | 42,46 |
| CMMLU | 335 | 39,70 |
| GSM8K | 300 | 47,67 |
| MATH-500 | 150 | 11,33 |
| C-Eval | 260 | 37,69 |
| IFEval | 160 | 33,13 |
| Media equilibrada (seis paneles) | — | 35,33 |

La configuracion de referencia obtuvo una media de 29,95 en los mismos paneles. En un conjunto separado de 381 prompts IFEval reservados, la precision estricta a nivel de prompt fue de 33,33 con los ajustes seleccionados y de 27,56 con los de referencia. No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,5-4 GiB para los pesos, mas memoria adicional para el contexto (hasta 32.768 tokens) y el estado de la cache KV.
- GPU recomendadas: A100, H100 o L40S para despliegues con concurrencia; RTX 4090, RTX 3090 o RTX A6000 para inferencia individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GiB o mas de VRAM en BF16; con cuantizacion a 8 bits o 4 bits cabria en GPUs de 4-6 GiB, aunque no se documentan pesos cuantizados oficiales.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForCausalLM`), vLLM con parser hermes y deepseek_r1, text-generation-inference y endpoints compatibles. No se documenta soporte oficial de llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros modelos en la informacion proporcionada. Como referencia estructural, el modelo base es un estudiante destilado de Qwen3-32B y comparte familia arquitectonica con Qwen3-1.7B, pero no se han publicado comparaciones directas de rendimiento, contexto ni licencia frente a alternativas.

| Modelo | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|
| FNova-1.7B-Agent-v1 | 1.720.574.976 | 32.768 | Apache 2.0 | BFCL v4 offline 27,23; media paneles 35,33 |
| Qwen3-1.7B (referencia de familia) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible |
| Alternativas de tool calling de tamano similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento general bajo: media equilibrada de 35,33 en los paneles de ajuste y 11,33 en MATH-500, lo que desaconseja su uso para tareas de razonamiento matematico o conocimiento general.
- BFCL v4 offline de 27,23/100: la precision en tool calling es limitada y puede requerir validacion estricta de las llamadas generadas por la aplicacion.
- Con seleccion automatica de herramienta, el modelo puede solicitar herramientas innecesarias; la model card documenta que pidio una busqueda para responder directamente a `2 + 2`.
- Riesgo de alucinacion en argumentos de llamadas y en contenido generado; se recomienda validar esquemas JSON y ejecutar las funciones en un entorno controlado.
- Cobertura linguistica limitada a chino e ingles; no se documenta soporte de otros idiomas.
- Ventana de contexto de 32.768 tokens compartida entre entrada y salida, lo que reduce el espacio disponible para respuestas en conversaciones largas.
- No se documentan pesos cuantizados oficiales ni soporte de llama.cpp u Ollama, lo que limita el despliegue en entornos sin GPU.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria documentada.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias del dataset de entrenamiento y del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fengnan001/FNova-1.7B-Agent-v1
- Modelo base: https://huggingface.co/Fengnan001/FNova-1.7B-Chat-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v4
- Licencia Apache 2.0: https://huggingface.co/Fengnan001/FNova-1.7B-Agent-v1/blob/main/LICENSE
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
