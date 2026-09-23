# skillsafe-ai/phi-3.5-mini-instruct-q4f16

## Resumen

`skillsafe-ai/phi-3.5-mini-instruct-q4f16` es un artefacto de inferencia listo para navegador del modelo `microsoft/Phi-3.5-mini-instruct`, publicado por SkillSafe. No se trata de un modelo nuevo ni de un ajuste fino: es una recompilacion determinista en formato MLC del artefacto `mlc-ai/Phi-3.5-mini-instruct-q4f16_1-MLC` (commit `206a7da25b5efbef7b50502993367fcb05183a1d`), con pesos cuantizados a 4 bits y activaciones en fp16. El repositorio ocupa 2,2 GB y su unico objetivo es poder ejecutar un LLM conversacional dentro de un navegador mediante WebGPU y la libreria WebLLM.

El interes practico esta en el formato: incluye un binario `.wasm` (`Phi-3.5-mini-instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm`) y los shards de pesos que consume el runtime de MLC, de modo que una aplicacion web puede generar texto sin backend ni GPU en servidor, con los datos permaneciendo en el equipo del usuario. El sufijo `ctx4k_cs1k` del binario indica que este artefacto concreto se ha compilado con 4.096 tokens de ventana de contexto y un tamano de chunk de 1.024 para la atencion de ventana deslizante, muy por debajo de los 128.000 tokens que declara el modelo base original.

La relevancia es acotada pero clara: es un ejemplo de distribucion reproducible (receta YAML versionada, hashes SHA-256 por fichero, cadena de herramientas fijada) para despliegues de LLM en el cliente. Con cero descargas y cero likes en el momento de redactar esta ficha, debe considerarse un artefacto sin validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base `microsoft/Phi-3.5-mini-instruct`); no se detalla en la model card de este repositorio |
| Parametros totales | 3.800 millones (corresponden al modelo base; el repositorio no repite la cifra) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens en este artefacto (sufijo `ctx4k` del binario wasm, chunk de 1.024 en `cs1k`); el modelo base declara 128.000 tokens |
| Tipos de cuantizacion | q4f16_1 (pesos de 4 bits, activaciones fp16); unica cuantizacion incluida |
| Idiomas soportados | no disponible (ni los metadatos ni la model card declaran idiomas) |
| Licencia | MIT |
| Formato de pesos | MLC: `params_shard_*.bin` mas `ndarray-cache.json`, `mlc-chat-config.json` y binario wasm para WebGPU |
| Tamano del repositorio | 2,2 GB |
| Numero de shards | 43 ficheros `params_shard_*.bin` listados en la model card (listado truncado en la informacion disponible) |
| Runtime objetivo | WebLLM / MLC (WebGPU en navegador) |
| Cadena de herramientas de conversion | Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64 |
| Receta de conversion | `recipes/phi-3.5-mini-instruct-q4f16.yaml`, SHA-256 `5abf8d42827f198d5c03eff9c1e139afe2e878404790cf6d0facbb3a2710a5f3` |
| Fecha de conversion | 2026-09-22T22:01:37+00:00 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no contiene un proceso de entrenamiento propio. Es una conversion determinista del artefacto MLC publicado por el equipo de MLC (`mlc-ai/Phi-3.5-mini-instruct-q4f16_1-MLC`), fijado a un commit concreto y ejecutado con una receta versionada. La model card afirma explicitamente que "nada se ha editado a mano" y que cada byte es derivable de la fuente original mas la receta; se publican hashes SHA-256 por fichero y un SHA-256 de la propia receta, lo que permite auditar la cadena de procedencia. La arquitectura subyacente es la del modelo base de Microsoft, un transformer decoder-only denso, y los detalles de composicion del dataset, numero de tokens, fases de SFT/DPO e innovaciones de entrenamiento no se documentan aqui: hay que consultarlos en la model card original de Microsoft.

La particularidad tecnica de esta build esta en la compilacion para WebGPU. El fichero `mlc-chat-config.json` y el binario `lib/Phi-3.5-mini-instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm` (5,22 MB) definen el grafo y los kernels que se ejecutan en el navegador. La nomenclatura `q4f16_1` implica pesos cuantizados a 4 bits con activaciones en fp16 y un grupo de cuantizacion de 1; `ctx4k_cs1k` implica una ventana de atencion de 4.096 tokens con chunks de 1.024, presumiblemente apoyada en atencion de ventana deslizante para acotar el coste del KV cache en memoria de GPU. Los pesos se reparten en shards de entre 20,26 MB y 46,97 MB, con `ndarray-cache.json` como indice de mapeo. No hay ninguna indicacion de decodificacion especulativa ni de atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, segun los tags `text-generation` y `conversational` del repositorio.
- Ejecucion completamente en el cliente: inferencia en el navegador via WebGPU, sin llamadas a un servidor de inferencia.
- Despliegue offline una vez descargados los 2,2 GB de artefactos, adecuado para entornos sin conectividad estable.
- Conversacion con historial dentro de la ventana de 4.096 tokens de esta build (limitacion relevante frente a los 128.000 del modelo base).
- Razonamiento, generacion de codigo, matematicas y capacidades multilingues: son capacidades declaradas del modelo base Phi-3.5-mini-instruct, pero no se documentan ni se verifican en este repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion de este artefacto (no se documenta plantilla de herramientas en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion de este artefacto.
- Modo thinking explicito, vision o audio: no disponibles; el artefacto es exclusivamente de texto.

## Casos de uso

- Asistentes embebidos en aplicaciones web: integrar el runtime WebLLM y ofrecer un chat de ayuda o documentacion dentro de la propia pagina, sin coste de servidor y sin enviar el texto del usuario a terceros.
- Procesamiento de datos sensibles en el puesto de trabajo: resumen o reescritura de notas clinicas, contratos o registros internos donde el requisito es que el contenido no salga del equipo; la inferencia local lo permite por construccion.
- Demos y prototipos sin backend: validar una idea de producto conversacional descargando 2,2 GB de pesos en el navegador y evitando levantar infraestructura de GPU durante la fase de exploracion.
- Aplicaciones de escritorio o extensiones de navegador con IA integrada: el binario wasm se puede reutilizar en cualquier contexto con WebGPU, incluidas extensiones y aplicaciones Electron, para funciones de autocompletado o resumen de la pagina activa.
- Educacion y entornos con recursos limitados: aulas, laboratorios o paises con conectividad intermitente donde no es viable contratar inferencia en la nube; el modelo cabe en un portatil con GPU integrada moderna.
- Formacion y divulgacion tecnica: sirve como caso de estudio reproducible de cuantizacion y empaquetado MLC, gracias a la receta YAML y a los hashes publicados por fichero.
- Revision de textos cortos en formularios web: correccion, reformulacion o extraccion de campos en parrafos de menos de 4.000 tokens, donde la ventana reducida de esta build no supone un problema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye ninguna tabla de evaluacion, y las busquedas web realizadas no han devuelto datos asociados a este artefacto. Cualquier cifra de MMLU, HumanEval o GSM8K corresponderia al modelo base `microsoft/Phi-3.5-mini-instruct` publicado por Microsoft, y debe consultarse en su model card original; no se reproduce aqui para no atribuir a esta cuantizacion q4f16 unos numeros que no han sido medidos sobre ella.

## Requisitos de hardware

- Peso en disco y en memoria de los pesos: aproximadamente 2,2 GB para la cuantizacion q4f16_1.
- VRAM estimada para inferencia: del orden de 2,5 a 3,5 GB incluyendo KV cache y buffers de runtime con 4.096 tokens de contexto; el KV cache a 4k es una fraccion del que requeriria una ventana de 128.000 tokens.
- GPU de escritorio: cualquier GPU con WebGPU funcional, incluidas integradas modernas; una RTX 3060 o superior ofrece margen amplio.
- Portatiles y equipos de consumo: si, el modelo esta pensado para caber en GPUs integradas y en Apple Silicon, ya que WebGPU esta disponible en Chrome y Edge sobre Windows, macOS, Linux y ChromeOS.
- Requisito de navegador: WebGPU habilitado (Chrome/Edge 113 o posterior, con soporte en Firefox y Safari dependiente de la version).
- Opciones de despliegue: el runtime de WebLLM o MLC-LLM es el camino natural para estos artefactos; vLLM, TGI, llama.cpp y Ollama no consumen directamente pesos MLC. Para esos motores habria que partir del modelo base en safetensors o GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones para esta build ni en la model card ni en las busquedas realizadas.
- Limitacion practica adicional: la memoria disponible en el contexto del navegador y el limite de tamano de buffer de WebGPU condicionan el numero de capas que pueden residir simultaneamente en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto declarado (modelo base) | Formato de este tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `skillsafe-ai/phi-3.5-mini-instruct-q4f16` (esta ficha) | 3.800 M (base) | 4.096 tokens en este artefacto; 128.000 en el modelo base | MLC q4f16_1 + wasm WebGPU | MIT | Repositorio HuggingFace con 0 descargas |
| `microsoft/Phi-3.5-mini-instruct` (base) | 3.800 M | 128.000 tokens | safetensors | MIT | Modelo oficial, ampliamente desplegado |
| `mlc-ai/Phi-3.5-mini-instruct-q4f16_1-MLC` (fuente de esta conversion) | 3.800 M | el que fije la build MLC correspondiente | MLC q4f16_1 | MIT (heredada) | Publicado por el equipo de MLC |
| `meta-llama/Llama-3.2-3B-Instruct` | 3.210 M | 128.000 tokens | safetensors / GGUF | Licencia comunitaria Llama 3.2 | Amplia adopcion y ecosistema |
| `Qwen/Qwen2.5-3B-Instruct` | 3.090 M | 32.768 tokens (ampliable con YaRN) | safetensors / GGUF | Apache 2.0 | Amplia adopcion y ecosistema |

La comparacion debe leerse con cautela: este repositorio no es un modelo alternativo, sino una build de despliegue del primero de la tabla. Frente a las otras alternativas de ~3B, su ventaja es el formato listo para WebGPU y su desventaja es la ventana efectiva de 4.096 tokens y la ausencia de datos de rendimiento propios. Los datos de parametros, contexto y licencia de los modelos comparados provienen de sus fichas publicas y no han sido verificados en esta busqueda.

## Limitaciones y advertencias

- Ventana de contexto reducida: este artefacto esta compilado a 4.096 tokens, no a los 128.000 del modelo base; conversaciones o documentos largos se truncaran o degradaran.
- Perdida por cuantizacion: los pesos de 4 bits introducen una degradacion de calidad respecto al modelo en fp16 que no se cuantifica en ninguna evaluacion publicada de esta build.
- Ausencia total de benchmarks: no hay mediciones propias ni validacion por parte de terceros; no es posible afirmar como rinde esta cuantizacion frente a otras.
- Riesgo de alucinacion: inherente a los modelos de esta escala, y potencialmente mayor tras la cuantizacion a 4 bits; no debe usarse sin supervision en dominios facticos de alta responsabilidad.
- Idiomas: la model card no declara idiomas soportados. El modelo base esta orientado principalmente al ingles, con soporte limitado de otras lenguas; no hay garantia de calidad en castellano.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad para este artefacto; los sesgos heredados del modelo base se mantienen.
- Tool calling y agentes: no documentados en este repositorio; no asumir compatibilidad con plantillas de herramientas ni con flujos multi-paso.
- Dependencia de WebGPU: el artefacto solo es utilizable en navegadores con WebGPU operativo y memoria de GPU suficiente; no es portable a servidores de inferencia habituales.
- Licencia: MIT, permisiva y compatible con uso comercial y modificacion, pero conviene revisar las condiciones del modelo base de Microsoft por si incorporasen terminos adicionales.
- Madurez: cero descargas y cero likes en la fecha de publicacion (2026-09-22), sin issues ni comunidad que lo respalde; verificar los hashes SHA-256 antes de integrarlo en cualquier pipeline.
- Fechas de publicacion poco convencionales: los metadatos indican creacion y actualizacion en septiembre de 2026, dato que conviene contrastar con el estado real del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/skillsafe-ai/phi-3.5-mini-instruct-q4f16
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Fuente upstream de la conversion (MLC): https://huggingface.co/mlc-ai/Phi-3.5-mini-instruct-q4f16_1-MLC/tree/206a7da25b5efbef7b50502993367fcb05183a1d
- Repositorio con las recetas de conversion de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo, su cuantizacion o sus resultados. Los unicos resultados devueltos correspondian a portales de noticias en arabe sin relacion alguna con el modelo, por lo que no se incluyen.
