# mobileforge-anonymous/ForgeQwen3-8B-200tasks

## Resumen

ForgeQwen3-8B-200tasks es un modelo de vision-lenguaje (VLM) desarrollado por el equipo anonimo de MobileForge, presentado como artefacto de una submission a ICLR. Se trata de una adaptacion del modelo base Qwen/Qwen3-VL-8B-Instruct mediante el sistema MobileForge, que permite adaptar agentes de GUI movil a tareas especificas de aplicaciones sin necesidad de anotaciones humanas, demostraciones ni etiquetas de recompensa.

El modelo esta disenado para resolver el problema de la adaptacion de agentes de interfaz grafica (GUI) en entornos Android. Utiliza 200 tareas generadas automaticamente sobre aplicaciones objetivo, empleando los propios rollouts del modelo, retroalimentacion jerarquica de criticos, pistas correctivas y GRPO contextualizado a nivel de paso. Con aproximadamente 8,8 mil millones de parametros, hereda la arquitectura Qwen3-VL y su interfaz de carga y prompt, lo que facilita su integracion en pipelines existentes.

Su relevancia radica en que demuestra un enfoque de entrenamiento sin anotaciones humanas para agentes moviles, logrando un 47,4% de exito (Pass@1) en el benchmark AndroidWorld con 116 tareas. Es un modelo de investigacion, publicado bajo licencia Apache-2.0, con pesos en formato safetensors (BF16) y un tamano de repositorio de 17,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (Transformer multimodal de vision y lenguaje) |
| Parametros totales | 8.767.123.696 (~8,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (hereda la del modelo base Qwen3-VL-8B-Instruct) |
| Tipos de cuantizacion | No disponible (solo se proporcionan pesos en BF16) |
| Idiomas soportados | No disponible (hereda los del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal que procesa entradas de imagen y texto para generar respuestas y acciones. La adaptacion se realiza mediante el sistema MobileForge, que convierte la interaccion con aplicaciones objetivo en un curriculo ejecutable. El entrenamiento utiliza los propios rollouts del modelo, retroalimentacion jerarquica de criticos, pistas correctivas y una variante de GRPO (Group Relative Policy Optimization) contextualizada a nivel de paso.

No se emplean tareas de adaptacion escritas por humanos, demostraciones ni etiquetas de recompensa. El proceso se basa en 200 tareas generadas automaticamente sobre aplicaciones objetivo, lo que permite una adaptacion sin intervencion manual. El resultado es un checkpoint que mantiene la interfaz de prompt y carga del modelo base, facilitando su uso directo con la libreria transformers.

## Capacidades

- Generacion de acciones de GUI en Android: el modelo recibe capturas de pantalla y genera comandos de interaccion (toque, texto, scroll, etc.) para completar tareas en aplicaciones moviles.
- Razonamiento multi-paso: capaz de planificar y ejecutar secuencias de acciones para resolver tareas complejas en entornos de interfaz grafica.
- Comprension de imagenes: al heredar la arquitectura Qwen3-VL, procesa entradas visuales de alta resolucion para interpretar el estado de la pantalla.
- Adaptacion a tareas especificas de aplicaciones: entrenado sobre 200 tareas generadas automaticamente, muestra capacidad de generalizacion a tareas no vistas en el benchmark AndroidWorld.
- Soporte de tool calling / function calling: no especificado explicitamente, pero la generacion de acciones de GUI puede considerarse una forma de invocacion de herramientas del sistema.
- Capacidades multilingues: no disponibles en la informacion proporcionada, aunque hereda las del modelo base.

## Casos de uso

- Automatizacion de pruebas de aplicaciones Android: el modelo puede ejecutar flujos de usuario en apps reales dentro de emuladores, detectando errores de navegacion o funcionalidad sin necesidad de escribir scripts de prueba manuales.
- Asistentes personales moviles: integrado en un agente que recibe capturas de pantalla y ejecuta acciones como reservar restaurantes, pedir taxis o gestionar calendarios, gracias a su capacidad de razonamiento multi-paso.
- Relleno automatizado de formularios: en apps de banca, comercio electronico o servicios publicos, el modelo puede navegar por campos y completar datos estructurados a partir de instrucciones en lenguaje natural.
- Investigacion en agentes de GUI: util como punto de partida para estudios academicos sobre adaptacion sin anotaciones, comparacion de metodos de optimizacion de politicas o evaluacion en benchmarks como AndroidWorld.
- Generacion de datos sinteticos de interaccion: al ejecutar tareas en entornos aislados, puede producir trazas de interaccion (estado, accion, recompensa) que sirvan para entrenar otros modelos o validar sistemas de recompensa.
- Accesibilidad: puede asistir a usuarios con discapacidad motora o visual ejecutando acciones complejas en apps moviles a partir de comandos de voz o texto, reduciendo la carga de interaccion manual.

## Benchmarks y rendimiento

El modelo fue evaluado en AndroidWorld, un benchmark de 116 tareas de interaccion con aplicaciones Android. Los resultados publicados en la model card son los siguientes:

| Metrica | Resultado |
|---|---|
| Pass@1 | 55/116 (47,4%) |
| Pass@2 | 64/116 (55,2%) |
| Pass@3 | 71/116 (61,2%) |

No se han publicado resultados de benchmarks en la informacion disponible para otras tareas como MMLU, HumanEval o GSM8K. Tampoco se proporcionan comparaciones directas con otros modelos en el mismo benchmark dentro de la documentacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 17,5 GB, por lo que se recomienda un minimo de 20 GB de VRAM para inferencia con margen de seguridad.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100. En GPUs de consumo, una RTX 4090 (24 GB) es suficiente para ejecutar el modelo en BF16.
- Compatibilidad con consumer GPU: si, siempre que se disponga de al menos 20-24 GB de VRAM. No se proporcionan versiones cuantizadas (GGUF, INT8, etc.) en el repositorio.
- Opciones de despliegue: compatible con la libreria transformers, vLLM y TGI, dado que usa la interfaz de Qwen3-VL-8B-Instruct. No se menciona soporte explicito para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependera del hardware y del backend de inferencia utilizado.

## Comparativa con modelos similares

La comparativa se realiza con el modelo base y con alternativas del mismo dominio (agentes de GUI movil), aunque no se dispone de datos de benchmarks publicados para estas ultimas en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Benchmark AndroidWorld |
|---|---|---|---|---|
| ForgeQwen3-8B-200tasks | ~8,8B | No disponible | Apache-2.0 | 47,4% Pass@1 |
| Qwen3-VL-8B-Instruct (base) | ~8,8B | No disponible | Apache-2.0 | No disponible |
| AppAgent (referencia) | No disponible | No disponible | No disponible | No disponible |
| AutoGLM (referencia) | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos directos con otros modelos de agentes de GUI en la informacion proporcionada. La unica comparacion implicita es con el modelo base, del cual parte la adaptacion.

## Limitaciones y advertencias

- Riesgo de acciones incorrectas o inseguras: el modelo puede generar acciones de GUI erroneas o peligrosas. La model card advierte explicitamente que debe ejecutarse solo en entornos de prueba aislados y que las acciones deben inspeccionarse antes de usarlo con datos personales.
- Naturaleza de investigacion: es un artefacto de una submission anonima a ICLR. No se ha publicado el paper completo ni se han revelado los autores, lo que limita la trazabilidad de los metodos y resultados.
- Datos de entrenamiento no publicados: no se detalla la composicion exacta de las 200 tareas generadas ni las aplicaciones objetivo, lo que dificulta evaluar posibles sesgos en la adaptacion.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan especificados en la documentacion, aunque se heredan del modelo base Qwen3-VL-8B-Instruct.
- Sin versiones cuantizadas: el repositorio solo incluye pesos en BF16, lo que limita su despliegue en hardware con menos de 20 GB de VRAM sin realizar cuantizacion manual.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial, pero al ser un modelo de investigacion anonimo, se recomienda verificar la procedencia de los datos de entrenamiento antes de su uso en produccion.

## Enlaces

- Repositorio original en HuggingFace: https://huggingface.co/mobileforge-anonymous/ForgeQwen3-8B-200tasks
- Repositorio espejo en HuggingFace: https://huggingface.co/lgy0404/ForgeQwen3-8B-200tasks
- Pagina del proyecto MobileForge: https://mobile-forge.github.io/
- Codigo oficial en GitHub: https://github.com/kwai/MobileForge
- Documentacion de modelos de MobileForge: https://github.com/kwai/MobileForge/blob/main/docs/models.md
- Dataset de resultados de benchmark: https://huggingface.co/datasets/mobileforge-anonymous/mobileforge-benchmark-results
