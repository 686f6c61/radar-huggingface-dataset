# raahemnabeel/qwen3-coder-30b-a3b-test

## Resumen

Este repositorio de Hugging Face contiene un paquete de contenedor `tt-model` para servir el modelo Qwen3-Coder-30B-A3B-Instruct en hardware Tenstorrent Blackhole. El autor, Muhammad Raahem Nabeel, ha empaquetado el modelo base de Qwen (desarrollado por Alibaba) junto con el stack de servido `vllm-plugin` y `tt-metal`, de modo que el consumidor final solo necesita Docker y una tarjeta Tenstorrent para desplegar un servidor compatible con la API de OpenAI. El modelo base es un transformer de mezcla de expertos (MoE) con 30 000 millones de parámetros totales y 3300 millones activos, especializado en generación de código y tareas agénticas. La relevancia de este paquete radica en que permite ejecutar un modelo de código de alto rendimiento en hardware alternativo a las GPU de NVIDIA, con una ventana de contexto de hasta 256 000 tokens según el perfil de servicio incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, basada en Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | 30 000 millones (30B) |
| Parametros activos | 3300 millones (3.3B) |
| Longitud de contexto | 256 000 tokens (perfil de servicio `default`) |
| Tipos de cuantizacion | no disponible (el contenedor descarga los pesos originales al cache de Hugging Face) |
| Idiomas soportados | no disponible (el modelo base Qwen3-Coder soporta multiples idiomas, pero no se especifican en este repositorio) |
| Licencia | no disponible (el repositorio no declara licencia; el modelo base Qwen3-Coder se distribuye bajo Apache 2.0 segun su repositorio oficial) |
| Formato de pesos | safetensors (pesos originales de Qwen/Qwen3-Coder-30B-A3B-Instruct, descargados en tiempo de ejecucion) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-30B-A3B-Instruct es un transformer de mezcla de expertos (MoE) con 30 000 millones de parametros totales y 3300 millones activos por token. Esta arquitectura permite un rendimiento elevado con un coste de computacion reducido, ya que solo se activa una fraccion de los parametros en cada paso de inferencia. El modelo esta especializado en tareas de programacion, razonamiento y uso de agentes, y es descrito por el equipo de Qwen como el modelo de codigo mas agente de la serie Qwen3. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas como RLHF o DPO en la informacion proporcionada.

El repositorio en si no contiene los pesos del modelo, sino un contenedor Docker que los descarga desde el cache de Hugging Face del usuario en el momento de la extraccion. El stack de servido incluye `vllm-plugin` y `tt-metal`, con versiones fijadas en la seccion de procedencia del README. El codigo de servido incluido en el repositorio es identico al que se ejecuta dentro de la imagen, lo que facilita la auditoria y la reproducibilidad.

## Capacidades

- Generacion de codigo fuente en multiples lenguajes de programacion, gracias al modelo base Qwen3-Coder.
- Razonamiento y resolucion de problemas de programacion, incluyendo tareas de depuracion y refactorizacion.
- Soporte de tareas agente (agentic tasks), como planificacion de multiples pasos y uso de herramientas externas.
- Servidor compatible con la API de OpenAI, lo que permite integrarse con cualquier cliente OpenAI existente.
- Ejecucion en hardware Tenstorrent Blackhole, sin necesidad de GPU NVIDIA ni de instalar tt-metal o vLLM en el host.
- Ventana de contexto amplia de 256 000 tokens, adecuada para repositorios de codigo extensos o conversaciones de multiples turnos.

## Casos de uso

- Despliegue de un asistente de codigo en infraestructura propia con hardware Tenstorrent: el contenedor proporciona un servidor OpenAI-compatible listo para usar, eliminando la complejidad de configurar tt-metal y vLLM manualmente.
- Integracion en pipelines de CI/CD para generacion automatica de pruebas unitarias o revision de codigo: la API OpenAI-compatible permite conectar herramientas como GitHub Copilot o plugins de IDE directamente al servidor local.
- Desarrollo de agentes de programacion autonomos: el modelo base esta disenado para tareas agente, y la ventana de 256 000 tokens permite procesar repositorios completos en un solo contexto.
- Prototipado rapido de aplicaciones de chat especializadas en codigo: con un simple `tt-model serve` se obtiene un endpoint local para pruebas sin necesidad de gestionar dependencias.
- Evaluacion de modelos de codigo en hardware alternativo: investigadores pueden comparar el rendimiento de Qwen3-Coder-30B-A3B en Blackhole frente a GPU convencionales sin cambiar de stack.
- Formacion y educacion en sistemas de IA generativa: el contenedor simplifica el despliegue para entornos academicos que dispongan de tarjetas Tenstorrent.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento del modelo base ni del contenedor en hardware Blackhole. Para datos de evaluacion del modelo Qwen3-Coder-30B-A3B-Instruct, se recomienda consultar el repositorio oficial de QwenLM en GitHub o la ficha del modelo en Hugging Face.

## Requisitos de hardware

- Tarjeta Tenstorrent Blackhole, configuracion P300x2 (dos dispositivos P300) segun el perfil de servicio `default`.
- Docker instalado en el sistema host.
- No se requiere GPU NVIDIA ni instalacion de tt-metal, vLLM o entornos virtuales en el host.
- Memoria: no especificada, pero el perfil `default` admite hasta 32 secuencias simultaneas con una longitud maxima de modelo de 256 000 tokens.
- El contenedor se sirve con `tt-model serve` y expone un endpoint en `http://127.0.0.1:8000`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (este contenedor) | 30B | 3.3B | 256k (perfil) | Apache 2.0 (modelo base) | Repositorio de contenedor para Tenstorrent |
| Qwen3-Coder-480B-A35B-Instruct | 480B | 35B | no disponible | Apache 2.0 | Modelo de mayor tamano, requiere hardware mas potente |
| Qwen3-Coder-Next | no disponible | no disponible | no disponible | Apache 2.0 | Disenado para agentes de codigo y desarrollo local |

La comparativa se basa en la informacion publica del repositorio oficial de Qwen3-Coder. No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere hardware especifico de Tenstorrent (Blackhole); no es compatible con GPU NVIDIA ni con CPUs convencionales.
- El repositorio no declara licencia propia; la licencia del modelo base es Apache 2.0, pero se debe verificar antes de un uso comercial.
- No se proporcionan datos de rendimiento, latencia ni throughput, por lo que no es posible estimar la idoneidad para produccion sin pruebas propias.
- El contenedor descarga los pesos en tiempo de ejecucion desde el cache de Hugging Face, lo que requiere conexion a internet en el primer arranque y espacio de almacenamiento adicional.
- No se especifican los idiomas soportados ni posibles sesgos del modelo base; se recomienda consultar la documentacion oficial de Qwen3-Coder.
- El perfil de servicio esta limitado a 32 secuencias simultaneas y 256 000 tokens de contexto; cargas superiores requieren ajustes no documentados en este repositorio.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/raahemnabeel/qwen3-coder-30b-a3b-test
- Repositorio oficial de Qwen3-Coder en GitHub: https://github.com/QwenLM/Qwen3-Coder
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Pagina de Qwen3-Coder en Ollama: https://ollama.com/library/qwen3-coder:30b
