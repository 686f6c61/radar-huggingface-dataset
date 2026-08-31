# Atomic-Germ/Ornith1.5-Heretic-9B-NPU2

## Resumen

Ornith1.5-Heretic-9B-NPU2 es una conversion cuantizada en formato Q4NX del modelo Dingdust/Ornith-1.5-9B-heretic, realizada por Atomic-Germ especificamente para inferencia en NPU XDNA de AMD mediante el runtime FastFlowLM (FLM). El modelo original pertenece a la familia Ornith-1.5 de DeepReinforce, sucesora de Ornith-1.0, y destaca por su rendimiento puntero entre modelos open source de tamano comparable en benchmarks de codificacion agente. Esta variante "heretic" ha sido sometida a un proceso de abliteracion (abliteration) para eliminar los rechazos del sistema, por lo que se comercializa como modelo sin censura.

Se trata de un modelo denso de aproximadamente 9.000 millones de parametros, con capacidades multimodales (lenguaje y vision), una ventana de contexto de 256K tokens y arquitectura basada en Qwen3.5. El repositorio contiene los pesos cuantizados en un unico archivo `model.q4nx` de 7,11 GB, junto con el modelo de vision en `vision_weight.q4nx`, configuracion del runtime FLM, tokenizador y plantilla de chat. No es un archivo GGUF ni un checkpoint de transformers estandar: es un formato propietario compilado para el runtime FastFlowLM en NPU AMD.

La relevancia de este modelo radica en que permite ejecutar un modelo agente de codificacion multimodal de 9B con cuantizacion 4-bit directamente en el NPU de procesadores AMD, sin necesidad de GPU dedicada. La instalacion se realiza con la herramienta `flm-add`, que copia el modelo al directorio de usuario de FastFlowLM y registra la etiqueta correspondiente. El repositorio es muy reciente (creado el 30 de agosto de 2026) y no acumula descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (dense transformer, basado en Qwen3.5) |
| Parametros totales | ~9.000 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Q4NX (mezcla Q8_0 / Q4_1 / BF16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Q4NX (FastFlowLM, no es GGUF) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de aproximadamente 9.000 millones de parametros, construido sobre la arquitectura Qwen3.5 segun las etiquetas del repositorio. A diferencia de los modelos de mezcla de expertos, todos los parametros se activan en cada inferencia, lo que simplifica el despliegue en hardware con memoria unificada. El modelo es multimodal: procesa tanto texto como imagenes, e incluye un modelo de vision separado (`vision_weight.q4nx`).

El entrenamiento de Ornith-1.5 emplea un enfoque de aprendizaje por refuerzo en el que el modelo genera continuamente nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora su politica mediante refuerzo, en lugar de depender de un conjunto fijo de tareas curadas manualmente. La variante "heretic" ha sido sometida a un proceso de abliteracion que elimina los mecanismos de rechazo aprendidos durante el entrenamiento con feedback humano, resultando en un modelo que no se niega a responder a peticiones que el modelo original podria rechazar. La conversion a Q4NX fue realizada por Atomic-Germ para el runtime FastFlowLM v1.0.1, utilizando cuantizacion mixta Q8_0 / Q4_1 / BF16.

## Capacidades

- Generacion de texto: conversacion natural multi-turno con plantilla de chat incluida (`chat_template.jinja`).
- Codificacion agente: el modelo original destaca en benchmarks de agentic coding, lo que implica capacidad para razonar sobre tareas de programacion complejas y ejecutar multiples pasos.
- Vision: procesamiento de imagenes junto con texto (pipeline `image-text-to-text`), con modelo de vision incluido en el repositorio.
- Tool calling: soporte para llamada a herramientas y funciones, segun las etiquetas del modelo.
- Capacidades agente: integracion con entornos agente y razonamiento multi-paso.
- Sin censura: el proceso de abliteracion elimina los rechazos del sistema, permitiendo respuestas a peticiones que el modelo base podria denegar.
- Compatible con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante API compatible con OpenAI.
- Ejecucion en NPU: compilado especificamente para el runtime FastFlowLM en NPU XDNA de AMD.

## Casos de uso

- Asistente de codificacion en portatiles AMD sin GPU dedicada: el modelo se ejecuta en el NPU XDNA integrado en procesadores AMD Ryzen, lo que permite disponer de un asistente de codificacion agente de 9B en equipos portatiles sin necesidad de GPU discreta.
- Desarrollo de agentes de programacion en entornos edge: gracias a su capacidad de tool calling y razonamiento multi-paso, puede integrarse en pipelines de desarrollo que requieran generacion y revision de codigo con contexto largo de hasta 256K tokens.
- Analisis de imagenes y capturas de pantalla en local: al ser multimodal, puede procesar capturas de pantalla de errores, diagramas o documentacion visual junto con texto, todo ello en hardware AMD con NPU.
- Servidor OpenAI-compatible en hardware AMD: la etiqueta `endpoints_compatible` permite desplegar un servidor de inferencia que expone una API compatible con OpenAI para integrarse en herramientas existentes.
- Creacion de contenido sin restricciones: la variante abliterada permite generacion de texto creativo, narrativa o dialogo sin filtros de contenido, util en proyectos de escritura experimental o investigacion sobre alineacion.
- Prototipado rapido de aplicaciones agente en entornos con restricciones de hardware: el peso de 7,11 GB y la ejecucion en NPU permiten desplegar aplicaciones agente en dispositivos de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion especifica. La busqueda web indica que el modelo base Ornith-1.5-9B alcanza un rendimiento puntero entre los modelos open source de tamano comparable en benchmarks de codificacion agente, pero no se proporcionan cifras concretas. El repositorio incluye un directorio `results/` con resultados de pruebas FLM-Test, aunque no se detalla su contenido. No se dispone de datos de latencia ni throughput para la ejecucion en NPU XDNA.

## Requisitos de hardware

- NPU XDNA de AMD: requisito imprescindible, ya que los pesos estan compilados para el runtime FastFlowLM y no son compatibles con otros aceleradores.
- Peso del modelo: 7,11 GB para `model.q4nx`, mas el modelo de vision `vision_weight.q4nx`.
- Runtime: FastFlowLM v1.0.1 o superior, instalado mediante `flm-add` o `uv tool install flm-add`.
- Configuracion: requiere especificar la familia `qwen3.5` y el xclbin de referencia `qwen3.5:9b` durante la instalacion.
- Variables de entorno: `FLM_CONFIG_PATH` y `FLM_XCLBIN_PATH` deben apuntar al directorio de configuracion de FLM.
- El modelo original en bf16 ocupa aproximadamente 19 GB, por lo que en su forma cuantizada cabe en sistemas con 8 GB de memoria unificada o NPU con capacidad suficiente.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI: el formato Q4NX es exclusivo del runtime FastFlowLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Ornith-1.5-9B (original) | ~9B | 256K | bf16 | MIT | GPU (80 GB recomendada) |
| Ornith-1.5-9B-MLX-4bit | ~9B | 256K | MLX 4-bit | MIT | Apple Silicon (16 GB Mac) |
| Ornith1.5-Heretic-9B-NPU2 | ~9B | 256K | Q4NX | MIT | AMD XDNA NPU |

Las tres variantes comparten el mismo modelo base y licencia MIT, pero se dirigen a plataformas de inferencia distintas: GPU NVIDIA para el original, Apple Silicon para la version MLX y NPU AMD para esta conversion. La variante NPU2 se distingue ademas por ser la version abliterada ("heretic"), que no esta disponible en los otros formatos.

## Limitaciones y advertencias

- Modelo abliterado: el proceso de eliminacion de rechazos puede producir respuestas inapropiadas, ofensivas o peligrosas. No es recomendable para aplicaciones de produccion orientadas al publico general sin capas de moderacion adicionales.
- Hardware restringido: los pesos Q4NX solo funcionan en NPU XDNA de AMD con FastFlowLM. No es posible ejecutar este modelo en GPU NVIDIA, Apple Silicon ni CPU sin reconvertirlo.
- Sin benchmarks publicados: no hay datos verificables de rendimiento para esta conversion especifica, por lo que la degradacion debida a la cuantizacion Q4_1 no esta cuantificada.
- Repositorio sin adopcion: el modelo tiene 0 descargas y 0 valoraciones, lo que indica que no ha sido probado por la comunidad.
- Riesgo de alucinacion: como cualquier modelo de 9B, puede generar codigo o texto incorrecto con alta confianza, especialmente en tareas complejas.
- Idiomas no documentados: no se especifican los idiomas soportados, aunque al estar basado en Qwen3.5 es probable que tenga buen soporte multilingue.
- Formato propietario: el formato Q4NX y el runtime FastFlowLM son especificos de AMD, lo que genera dependencia de un ecosistema cerrado y menos documentado que GGUF o safetensors.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Ornith1.5-Heretic-9B-NPU2
- Modelo base: https://huggingface.co/Dingdust/Ornith-1.5-9B-heretic
- Version MLX 4-bit: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-4bit
- Guia de ejecucion local: https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Pagina del modelo en Atomic Chat: https://atomic.chat/models/ornith-1-5-9b
- Pagina en Ollama: https://ollama.com/library/ornith-1.5
