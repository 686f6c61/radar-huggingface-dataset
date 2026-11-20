# maxhugger/nushell-lfm3-1.7b-onnx

## Resumen

`maxhugger/nushell-lfm3-1.7b-onnx` es un ajuste fino del modelo base LFM3 1.7B de Liquid AI, empaquetado en formato ONNX de 4 bits para su ejecución en el navegador mediante Transformers.js y WebGPU. El autor, maxhugger, ha incorporado un adaptador LoRA especializado en la generación de llamadas a herramientas (tool calls) del shell Nushell, con el objetivo de que un modelo de 1.700 millones de parámetros pueda traducir instrucciones en lenguaje natural a comandos Nushell estructurados y ejecutables.

El modelo resuelve un problema muy concreto: la brecha entre la intención expresada en lenguaje natural y la sintaxis exacta de Nushell 0.117.0, un shell moderno con un lenguaje de comandos tipado y estructurado. Según la model card, el adaptador eleva la tasa de respuestas correctas frente al valor de referencia del 8% (modelo base) al 92,6% sobre 231 peticiones retenidas, con un 100% de llamadas bien formadas y un 98% ejecutables. Estas cifras, aunque limitadas al dominio de Nushell, son notables para un modelo de este tamaño.

La relevancia actual del modelo reside en su enfoque de despliegue: un artefacto de 1,1 GB que corre íntegramente en el navegador del cliente vía WebGPU, sin necesidad de servidores ni APIs externas. Esto lo convierte en una pieza útil para demos interactivas, entornos con requisitos de privacidad estrictos o aplicaciones educativas donde se quiera mostrar generación de comandos de shell en tiempo real. No obstante, su alcance es deliberadamente estrecho: no es un modelo de propósito general, sino un especialista en tool calling para Nushell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LFM3 de Liquid AI), con adaptador LoRA integrado como ramas de bajo rango junto a cada peso cuantizado |
| Parametros totales | 1.700 millones (modelo base LFM3 1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (q4f16) para ONNX; el adaptador LoRA original está en 8 bits MLX |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (licencia propia de Liquid AI, referenciada como "other" en Hugging Face) |
| Formato de pesos | ONNX (con ramas LoRA embebidas); el adaptador original está en MLX |
| Tamano del repositorio | 1,1 GB |
| Libreria de inferencia | Transformers.js (WebGPU) |
| Modelo base | onnx-community/LFM3-1.7B-ONNX |
| Dataset de entrenamiento | maxhugger/nushell-tool-calls |

## Arquitectura y entrenamiento

El modelo parte de LFM3 1.7B, un transformer decoder-only de Liquid AI. Sobre la versión ONNX de 4 bits publicada por onnx-community, el autor ha añadido un adaptador LoRA entrenado específicamente para generar llamadas a herramientas de Nushell. La innovación técnica del artefacto no está en la arquitectura del transformer, sino en el método de empaquetado: las matrices de bajo rango del adaptador se integran como ramas adicionales junto a cada peso cuantizado, de modo que la inferencia ONNX puede aplicar la adaptación sin des-cuantizar ni reconstruir los pesos completos. Esto permite mantener el tamaño en 1,1 GB y ejecutar el modelo en WebGPU.

El adaptador se entrenó con el dataset `maxhugger/nushell-tool-calls`, construido a partir de las firmas de comandos de Nushell 0.117.0 y de fuentes de datos auxiliares citadas en la model card: el libro y el cookbook de Nushell, NL2Bash (Lin et al., LREC 2018), `spignelon/bash_history` y el estudio de alias de shell de Schröder y Cito (2022). El método de ajuste es LoRA (Hu et al., ICLR 2022, arXiv:2106.09685). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; el autor solo indica que el formato de prompt (system prompt, herramienta y prefijo del asistente) está documentado en `prompt_format.json` del repositorio del adaptador.

## Capacidades

- Generación de llamadas a herramientas (tool calling) para comandos de Nushell 0.117.0, devolviendo invocaciones estructuradas con nombre de comando y argumentos.
- Traducción de instrucciones en lenguaje natural a comandos de shell ejecutables dentro del dominio de Nushell.
- Formato de salida consistente: según la model card, el 100% de las peticiones evaluadas producen llamadas bien formadas y el 98% son ejecutables.
- Conversación multi-turno en el contexto de asistencia para línea de comandos (etiqueta `conversational`).
- Ejecución en navegador mediante Transformers.js y WebGPU, sin backend servidor.
- Capacidades generales de generación de texto heredadas del modelo base LFM3 1.7B (no evaluadas en la información disponible).
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni modos de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente de línea de comandos en el navegador: el modelo se carga con Transformers.js y WebGPU y sugiere comandos de Nushell a partir de descripciones en lenguaje natural, sin enviar datos a un servidor. Es adecuado por su tamaño reducido (1,1 GB) y su especialización en la sintaxis de Nushell.
- Demo educativa de Nushell: integrado en la demo `nushell-lfm-demo`, permite a estudiantes practicar la traducción de intenciones a comandos estructurados y ver el resultado en un entorno WebAssembly (`nu-wasm`).
- Generación de scripts de automatización: el modelo produce llamadas a herramientas con argumentos tipados, útiles para construir pipelines de procesamiento de datos en Nushell (filtrado, agregación, conversión de formatos) a partir de instrucciones en lenguaje natural.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en el cliente, es apto para organizaciones que no pueden enviar comandos ni rutas de sistema a APIs externas.
- Prototipado rápido de interfaces de administración de sistemas: permite construir asistentes que traduzcan peticiones de operadores a comandos de Nushell para tareas de inspección de ficheros, procesos o variables de entorno.
- Evaluación comparativa de modelos pequeños en tool calling: sirve como referencia de hasta dónde llega un modelo de 1,7B especializado frente a modelos propietarios en una tarea de formato estricto, tal como documenta la model card con las cifras de gpt-6-luna y claude-haiku-5-5.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card, medidos sobre 40 peticiones y ampliados a 231 peticiones retenidas. La métrica "devuelve el valor de referencia" exige coincidencia exacta con un único valor de referencia por petición, por lo que una respuesta con otra forma se contabiliza como incorrecta.

| Modelo | Peticiones | Bien formadas | Ejecutables | Devuelve el valor de referencia |
|---|---|---|---|---|
| LFM3 1.7B base | 40 | 78% | 48% | 8% |
| LFM3 1.7B + adaptador Nushell | 40 | 100% | 100% | 95% |
| LFM3 1.7B + adaptador, todas las retenidas | 231 | 100% | 98% | 92,6% |
| gpt-6-luna (reasoning off) | 40 | no disponible | no disponible | 32,5% |
| claude-haiku-5-5 | 40 | no disponible | no disponible | 17,5% |

El autor indica que las cifras de gpt-6-luna y claude-haiku-5-5 corresponden al modelo MLX de 8 bits con el mismo adaptador, no a la versión ONNX de 4 bits. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto ONNX pesa 1,1 GB en cuantización q4f16; en WebGPU la memoria necesaria es del orden de 1-2 GB, dependiendo del backend y del contexto.
- GPU recomendadas: cualquier GPU con soporte WebGPU (Chrome/Edge en Windows, macOS con Metal, Linux con Vulkan). Para servidor, una RTX 4090 o A100/H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU integrada o dedicada reciente con WebGPU habilitado.
- Opciones de despliegue: Transformers.js con WebGPU (vía `@huggingface/transformers`), ONNX Runtime; el adaptador original está pensado para MLX en 8 bits. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| nushell-lfm3-1.7b-onnx | 1,7B | no disponible | Tool calling para Nushell | lfm1.0 | ONNX (WebGPU) |
| LFM3 1.7B (base) | 1,7B | no disponible | Propósito general | lfm1.0 | safetensors, ONNX |
| gpt-6-luna | no disponible | no disponible | Propósito general | propietaria | API |
| claude-haiku-5-5 | no disponible | no disponible | Propósito general | propietaria | API |

La comparación con gpt-6-luna y claude-haiku-5-5 solo es posible en la métrica exacta de la model card (32,5% y 17,5% respectivamente frente al 92,6% del adaptador sobre 231 peticiones). No se dispone de datos de parámetros, contexto ni licencia de esos modelos en la información proporcionada, por lo que la comparativa es parcial.

## Limitaciones y advertencias

- Dominio estrecho: el modelo está especializado en Nushell 0.117.0; su rendimiento fuera de esa sintaxis o en otras versiones del shell no está documentado.
- Riesgo de alucinación en comandos: aunque el 98% de las llamadas son ejecutables, un 7,4% no devuelve el valor de referencia exacto, lo que en producción puede traducirse en comandos sintácticamente válidos pero semánticamente incorrectos.
- Métrica de evaluación estricta y de un solo valor: la comparación exacta contra un único valor de referencia penaliza respuestas correctas con otra forma, por lo que las cifras no son directamente comparables con benchmarks estándar.
- Licencia lfm1.0: es una licencia propia de Liquid AI con posibles restricciones para uso comercial; debe revisarse el archivo `LICENSE` antes de desplegar en producción.
- Idiomas no documentados: no se especifica qué lenguas soporta el modelo base ni el adaptador; el entrenamiento se centró en comandos de shell, predominantemente en inglés.
- Longitud de contexto no disponible: no se puede garantizar el manejo de conversaciones largas o prompts extensos.
- Artefacto de 4 bits: la cuantización q4f16 puede degradar ligeramente la calidad frente al adaptador MLX de 8 bits, aunque el autor reporta las mismas 22 de 24 respuestas correctas en la evaluación reducida.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxhugger/nushell-lfm3-1.7b-onnx
- Modelo base ONNX: https://huggingface.co/onnx-community/LFM3-1.7B-ONNX
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-1.7B
- Adaptador LoRA (MLX): https://huggingface.co/maxhugger/nushell-lfm3-1.7b-lora
- Dataset: https://huggingface.co/datasets/maxhugger/nushell-tool-calls
- Demo en navegador: https://huggingface.co/spaces/maxhugger/nushell-lfm-demo
- Nushell en WebAssembly: https://huggingface.co/spaces/maxhugger/nu-wasm
- Repositorio de código: https://github.com/maxtheman/nushell-lfm
- Nushell: https://github.com/nushell/nushell
- Paper LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
