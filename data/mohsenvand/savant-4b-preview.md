# mohsenvand/savant-4b-preview

## Resumen

Savant-4B es un modelo de lenguaje pequeño desarrollado por mohsenvand, disponible como research preview en HuggingFace. Se trata de un fine-tune de Qwen3-4B (de Qwen, originalmente bajo Apache 2.0) cuya propuesta distintiva es el razonamiento computacional verificado paso a paso: en lugar de generar texto libre, el modelo "escribe un pequeño programa para la pregunta que tiene delante y ejecuta ese programa dentro de sus propias pasadas hacia adelante, un paso comprobado cada vez". No utiliza herramientas externas, ni intérpretes, ni acceso a internet.

Su relevancia reside en el despliegue íntegramente en el navegador: el modelo se distribuye en formato ONNX con pesos cuantizados a 4 bits y está diseñado para ejecutarse con WebGPU mediante transformers.js, lo que permite probarlo sin servidor ni GPU dedicada. El autor advierte explícitamente que no es un asistente generalista ni está ajustado para seguridad, y que un paper con los detalles técnicos está pendiente de publicación. Con unos 4.000 millones de parámetros y un repositorio de 3,3 GB, se sitúa en la categoría de modelos compactos ejecutables en hardware de consumidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3-4B); mecanismo interno de ejecución de programas en pasadas hacia adelante |
| Parametros totales | ~4.000 millones (4B, heredado de Qwen3-4B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (pesos ONNX) |
| Idiomas soportados | No disponible |
| Licencia | savant-proprietary (licencia propietaria; derivado modificado de Qwen3-4B bajo Apache 2.0, ver NOTICE) |
| Formato de pesos | ONNX (cuantizado a 4 bits), para WebGPU con transformers.js |

## Arquitectura y entrenamiento

Savant-4B parte de Qwen3-4B, un modelo transformer denso de 4.000 millones de parámetros, al que se aplica un fine-tune descrito por el autor como "derivado modificado". La innovación central, según la model card, es un mecanismo por el cual el modelo genera un pequeño programa para cada pregunta y lo ejecuta "dentro de sus propias pasadas hacia adelante", verificando cada paso antes de continuar. Esto lo diferencia de los enfoques habituales de razonamiento (chain-of-thought en texto libre o tool calling con intérpretes externos): no hay herramientas, ni intérprete, ni conexión a internet; la computación ocurre íntegramente en el propio forward pass del modelo.

No se han publicado datos sobre el conjunto de entrenamiento (número de tokens, composición del dataset) ni sobre el uso de técnicas como RLHF o DPO. La model card remite a un paper forthcoming para los detalles técnicos. Tampoco se especifica si el modelo conserva el modo de razonamiento extendido (thinking mode) de la familia Qwen3.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation), aunque el autor advierte que no es un asistente generalista.
- Razonamiento computacional paso a paso: escribe y ejecuta programas internamente, con verificación de cada paso, sin depender de intérpretes externos.
- Ejecucion íntegra en navegador: diseñado para WebGPU mediante transformers.js, sin necesidad de backend propio.
- No requiere herramientas externas ni acceso a internet para su mecanismo de razonamiento.
- No disponible: información sobre tool calling, soporte de agentes, capacidades multilingües, visión o audio.

## Casos de uso

- Verificacion de calculos y razonamiento aritmetico en el navegador: al ejecutar programas internos paso a paso, es adecuado para demos educativas donde se quiere mostrar razonamiento verificable sin backend.
- Prototipado de aplicaciones IA locales: gracias a su formato ONNX y WebGPU, puede integrarse en aplicaciones web que necesiten razonamiento sin enviar datos a servidores externos, útil para escenarios sensibles a privacidad.
- Investigacion en razonamiento neuronal: su enfoque de "ejecución de programas dentro de los forward passes" lo hace interesante como objeto de estudio para investigadores que exploran alternativas al chain-of-thought clásico.
- Asistentes offline o de borde (edge): al no necesitar intérpretes ni conexión, puede desplegarse en entornos sin infraestructura de servidor, como quioscos o dispositivos con navegador moderno.
- Evaluacion comparativa de modelos pequenos: sirve como referencia para comparar estrategias de razonamiento computacional frente a modelos de tamaño similar basados en generación de texto libre.
- Demostraciones interactivas y educacion: la demo pública en navegador permite mostrar a estudiantes o a un público técnico cómo un modelo compacto resuelve problemas con pasos comprobados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ejecutarse íntegramente en navegador vía WebGPU, no requiere GPU de servidor ni VRAM dedicada en el sentido tradicional; el requisito principal es un navegador con soporte WebGPU (Chrome/Edge recientes) y suficiente memoria del dispositivo.
- El repositorio completo ocupa 3,3 GB (pesos ONNX en 4 bits), por lo que se necesita ese espacio de descarga o caché en el cliente.
- No es necesario hardware tipo A100/H100/RTX 4090: está diseñado específicamente para ejecución client-side.
- Despliegue: transformers.js con backend WebGPU (mecanismo de distribución previsto por el autor). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, y el formato ONNX no es directamente compatible con esos runtimes sin conversión.
- No disponible: mediciones de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Ejecucion | Notas |
|---|---|---|---|---|---|
| Savant-4B (este modelo) | 4B | No disponible | Propietaria (savant-proprietary) | Navegador (ONNX + WebGPU, transformers.js) | Razonamiento mediante programas internos verificados; research preview |
| Qwen/Qwen3-4B (modelo base) | 4B | 32.768 tokens (nativo, ampliable a 131.072 con YaRN) | Apache 2.0 | GGUF, safetensors; vLLM, llama.cpp, Ollama | Modelo generalista con thinking mode y soporte multilingüe |
| Phi-3.5-mini (Microsoft) | 3,8B | 128.000 tokens | MIT | ONNX, GGUF; ONNX Runtime, llama.cpp | Enfoque en calidad de razonamiento en modelos compactos, uso generalista |

Savant-4B se distingue de sus alternativas en que no es un modelo generalista sino un modelo especializado en razonamiento computacional verificado, con licencia propietaria frente a las licencias permisivas de Qwen3-4B y Phi-3.5-mini, y con un mecanismo de distribución centrado en el navegador en lugar de servidores de inferencia.

## Limitaciones y advertencias

- El propio autor advierte que es un research preview: "not a general assistant, not safety-tuned". No está ajustado para seguridad y no debe usarse como asistente general.
- Riesgo de alucinacion: no disponible como dato específico, pero al tratarse de un preview sin ajuste de seguridad, el riesgo debe considerarse elevado.
- Licencia propietaria (savant-proprietary): el uso comercial puede estar restringido; hay que revisar el archivo LICENSE. El modelo base Qwen3-4B es Apache 2.0, pero la derivación modificada está cubierta por la licencia propietaria y un archivo NOTICE.
- Longitud de contexto e idiomas soportados: no disponibles; deben verificarse antes de cualquier despliegue.
- Formato ONNX exclusivo para WebGPU: no es directamente utilizable con los runtimes habituales de producción (vLLM, llama.cpp, TGI) sin conversión de pesos.
- Sin benchmarks publicados ni paper disponible todavía, lo que dificulta evaluar rigurosamente su rendimiento frente a alternativas.
- Adopción muy limitada hasta la fecha (591 descargas, 0 likes), sin comunidad de soporte consolidada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohsenvand/savant-4b-preview
- Demo en navegador: https://neovand.github.io/polyformer/interpreter
- Licencia (LICENSE): https://huggingface.co/mohsenvand/savant-4b-preview/blob/main/LICENSE
- NOTICE (derivado de Qwen3-4B): https://huggingface.co/mohsenvand/savant-4b-preview/blob/main/NOTICE
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper: forthcoming (no disponible en el momento de redactar esta ficha)
