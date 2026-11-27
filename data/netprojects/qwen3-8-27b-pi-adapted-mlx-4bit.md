# netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit

## Resumen

Qwen3.8-27B-pi-adapted-MLX-4bit es una distribucion cuantizada en 4 bits del modelo Qwen3.8-27B (27.781.427.952 parametros) afinado mediante LoRA con aprendizaje por refuerzo para actuar como motor del agente de programacion pi. Lo publica el usuario netprojects en Hugging Face y esta pensado exclusivamente para Apple Silicon, empleando el framework MLX de Apple. El resultado es un modelo de 16,3 GB que cabe en Macs de 32 GB de memoria unificada y que conserva, segun el autor, un 95,6 % de coincidencia en el siguiente token respecto al bf16 de referencia, con una divergencia KL de 0,0201.

El interes actual del modelo radica en que traslada a hardware de consumo el rendimiento de un agente de software especializado: el adaptador original de harness-hub reporta mejoras de Terminal-Bench 2.1 del 39,5 % al 55,8 % y de SWE-bench Pro (hard 51) del 29,4 % al 62,7 % frente al modelo base, con entre un 55 % y un 64 % menos de llamadas a herramientas por tarea. Esta build concreta empaqueta ese adaptador fusionado con el modelo base, incluye el codificador de vision y la capa MTP (multi-token prediction) de Qwen, y cuantiza las capas lineales a 4 bits afines con grupo de 64.

La relevancia practica es doble: por un lado, permite ejecutar localmente un agente de terminal y edicion de codigo sin depender de APIs en la nube; por otro, la licencia Apache 2.0 y el formato safetensors MLX facilitan su integracion en flujos de trabajo de desarrollo. Es importante subrayar que el adaptador se entreno y evaluo con el modo de razonamiento (thinking) desactivado, por lo que su uso recomendado exige mantener esa configuracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8) con capa MTP y codificador de vision; pesos en formato MLX |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits afines (affine), grupo de 64; la familia incluye builds de 2,5, 3, 6, 8 bits y bf16 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); existe variante GGUF en la familia del autor |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de aproximadamente 27,8 mil millones de parametros, al que se le ha fusionado un adaptador LoRA entrenado por harness-hub. Ese adaptador se entreno con aprendizaje por refuerzo usando AsyncGRPO en la libreria TRL, con el objetivo especifico de convertir al modelo en el motor del agente pi sobre tareas de ingenieria de software y de terminal. La build aqui descrita fusiona el adaptador (revision e786f84) con el modelo base (revision 3756181) y convierte el conjunto a MLX mediante mlx-vlm, conservando el codificador de vision y la capa MTP de Qwen. Las capas lineales se cuantizan a 4 bits afines con grupo de 64, lo que reduce el peso a 16,3 GB.

La innovacion principal no reside en la arquitectura, sino en el proceso de alineamiento: el entrenamiento por refuerzo con GRPO asincrono optimiza directamente el exito en tareas de agente (resolucion de bugs, uso de terminal) y penaliza el exceso de llamadas a herramientas, lo que explica la reduccion del 55-64 % en tool calls reportada por el autor del adaptador. El tokenizador y la plantilla de chat son los originales de harness-hub, sin modificar, de modo que se mantiene el mismo vocabulario y el mismo formato XML de llamadas a herramientas que Qwen3.8-27B.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Generacion y edicion de codigo en el contexto de tareas de ingenieria de software.
- Resolucion de tareas de terminal y linea de comandos (Terminal-Bench), incluyendo diagnostico de fallos en tests.
- Uso de herramientas mediante el formato XML de Qwen (`<tool_call><function=...`), compatible con el protocolo Chat Completions de OpenAI.
- Comportamiento agentico multi-paso orientado a la resolucion autonoma de bugs y tareas de repositorio.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias al codificador de vision incluido; util, por ejemplo, para interpretar capturas de pantalla de terminal.
- Modo thinking disponible en la plantilla, aunque el adaptador se entreno y evaluo con thinking desactivado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de terminal local: ejecutar pi contra el servidor OpenAI-compatible de mlx-lm para diagnosticar y corregir fallos en repositorios locales sin enviar codigo a la nube, aprovechando el entrenamiento especifico en Terminal-Bench.
- Correccion automatica de tests: el modelo puede recibir la salida de `pytest`, identificar la causa del fallo en `tests/test_parser.py` y proponer el parche, tal como ilustra el ejemplo oficial de uso.
- Asistente de codigo en el IDE o en CI: integrado via API local, puede revisar diffs, sugerir correcciones y reducir el numero de iteraciones gracias a su menor tasa de llamadas a herramientas.
- Interpretacion de capturas de terminal: usando mlx-vlm, el modelo responde a preguntas sobre errores mostrados en una imagen de pantalla, util para soporte remoto o depuracion asistida.
- Automatizacion de tareas de mantenimiento de repositorios: actualizacion de dependencias, refactorizaciones pequenas o generacion de parches, ejecutados en un Mac de desarrollo con 32 GB o mas.
- Prototipado de agentes de software en investigacion: al ser Apache 2.0 y ejecutable en hardware de consumo, sirve como banco de pruebas para estudiar comportamiento agentico y uso de herramientas sin coste de API.
- Servicio interno de asistencia a desarrolladores: desplegado con `mlx_lm.server`, puede atender peticiones de un equipo pequeno en una red local con un unico Mac de 32-64 GB.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al adaptador original evaluado bajo el agente pi con thinking desactivado, comparando el modelo adaptado frente al base:

| Benchmark | Modelo base | Modelo adaptado (pi) |
|---|---|---|
| Terminal-Bench 2.1 | 39,5 % | 55,8 % |
| SWE-bench Pro (hard 51) | 29,4 % | 62,7 % |
| Llamadas a herramientas por tarea | Referencia | 55-64 % menos |

Fidelidad de la cuantizacion respecto al bf16 (datos del autor de la build):

| Build | Tamano | Coincidencia siguiente token | KL vs bf16 |
|---|---|---|---|
| 8 bits | 30,0 GB | 99,1 % | 0,0004 |
| 6 bits | 23,1 GB | 99,0 % | 0,0015 |
| 4 bits (esta build) | 16,3 GB | 95,6 % | 0,0201 |
| 3 bits | 13,8 GB | 91,4 % | 0,0884 |
| 2,5 bits | 11,8 GB | 85,5 % | 0,2363 |

No se han publicado resultados de benchmarks especificos para esta build MLX de 4 bits mas alla de las metricas de fidelidad de cuantizacion anteriores.

## Requisitos de hardware

- VRAM/memoria unificada: 16,3 GB de pesos; el autor recomienda un Mac de 32 GB para esta build, dejando margen para macOS y prompts largos (la descarga es como maximo el 60 % de la memoria).
- GPU recomendadas: exclusivamente Apple Silicon (M-series). No esta pensado para GPU NVIDIA o AMD en este formato.
- Cabe en consumer: si, en Macs de 32 GB; para Macs de 24 GB el autor sugiere la build de 3 bits (13,8 GB) y para 16 GB la de 2,5 bits (11,8 GB) o el GGUF IQ2_M.
- Despliegue: mlx-lm (servidor OpenAI-compatible con `mlx_lm.server`), mlx-vlm para entrada de imagen, LM Studio en modo MLX; existe una variante GGUF para llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit | 27,8 B | No disponible | Apache 2.0 | MLX safetensors 4 bits | Especializado en agente pi; 16,3 GB |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | 27,8 B | No disponible | Apache 2.0 | MLX safetensors 6 bits | Recomendado por el autor; 23,1 GB |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,8 B | No disponible | No disponible | LoRA (adapter) | Adaptador original; requiere modelo base |
| Qwen/Qwen3.8-27B | 27,8 B | No disponible | No disponible | safetensors | Modelo base sin adaptar; referencia de benchmarks |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador se entreno y evaluo con thinking desactivado; activar el modo thinking puede degradar el comportamiento esperado.
- La cuantizacion a 4 bits introduce una divergencia medible: solo el 95,6 % de coincidencia en el siguiente token y KL de 0,0201 frente a bf16, superior a las builds de 6 y 8 bits.
- Dependencia exclusiva del ecosistema Apple Silicon y MLX; no es directamente utilizable en GPU NVIDIA sin recurrir a la variante GGUF.
- El formato de llamadas a herramientas es el XML de Qwen y el adaptador se entreno con la API Chat Completions, no con la Responses API; usar esta ultima puede romper el comportamiento.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de codigo donde puede proponer parches plausibles pero incorrectos; se recomienda validacion con tests.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador original, cuyas licencias no se detallan en la informacion disponible.
- El modelo esta optimizado para tareas de agente de software; su rendimiento en dominios ajenos a codigo y terminal puede ser inferior al del modelo base sin adaptar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA para mlx-lm: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Variante GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF
- Perfil del autor con otros modelos: https://huggingface.co/netprojects
