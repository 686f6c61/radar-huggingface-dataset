# meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-MTPv2-layers

## Resumen

El paquete `meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-MTPv2-layers` es una distribución del modelo NVIDIA Nemotron 3 Super 120B-A12B en formato GGUF cuantizado (UD-Q4_K_XL), dividido en artefactos por capa para permitir inferencia distribuida en clústeres locales mediante la plataforma Mesh LLM. El modelo original, desarrollado por NVIDIA, es un MoE híbrido Mamba-Transformer con 120 mil millones de parámetros totales y 12 mil millones activos, pre-entrenado en formato NVFP4 y optimizado para razonamiento agéntico, codificación y tool calling.

Este paquete concreto resuelve el problema de ejecutar un modelo de 120B en hardware local limitado: al dividir las 89 capas del transformador en artefactos independientes, permite repartir la carga entre varias máquinas o GPUs, manteniendo compatibilidad con la API OpenAI (`/v1/chat/completions`). Es relevante para desarrolladores que necesitan inferencia privada de un modelo de gran escala sin depender de servicios en la nube, aprovechando la cuantización de 4 bits para reducir el requisito de memoria a unos 84 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido Mamba-Transformer con Latent MoE |
| Parametros totales | 120B (modelo original) |
| Parametros activos | 12B |
| Longitud de contexto | 1.000.000 tokens (segun NVIDIA NIM) |
| Tipos de cuantizacion | UD-Q4_K_XL (este paquete); el modelo base tambien disponible en BF16 y otras cuantizaciones |
| Idiomas soportados | Ingles, codigo y contextos multilingues |
| Licencia | other (licencia propietaria de NVIDIA, no especificada) |
| Formato de pesos | GGUF (con capas separadas para Mesh LLM) |

## Arquitectura y entrenamiento

El modelo base NVIDIA Nemotron 3 Super 120B-A12B es un MoE hibrido que combina bloques Mamba (state space) con bloques Transformer, incorporando Latent MoE para la seleccion de expertos y capas MTP (Multi-Token Prediction) que permiten predecir varios tokens a la vez. Segun NVIDIA, fue pre-entrenado en formato NVFP4 (punto flotante de 4 bits de NVIDIA) para optimizar el rendimiento en hardware Hopper y Ada Lovelace. No se han proporcionado detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. El paquete GGUF aqui descrito es una derivacion cuantizada en 4 bits (UD-Q4_K_XL) del modelo original, dividida en 89 artefactos de capa (83,1 GB) mas embeddings y output head, pensada para inferencia distribuida con Mesh LLM.

## Capacidades

- Generacion de texto y razonamiento general en ingles, codigo y contextos multilingues.
- Optimizado para agentes colaborativos y cargas de trabajo de alto volumen, segun la ficha de NVIDIA NIM.
- Soporte de tool calling y function calling, asi como planificacion multi-paso (planning).
- Razonamiento agéntico con contexto largo de hasta 1M tokens, adecuado para tareas que requieren memoria extendida.
- Capacidad de codificacion (generacion, revision y depuracion de codigo).
- Compatibilidad con la API OpenAI a traves del servidor Mesh LLM local (endpoint `/v1/chat/completions`).
- Inferencia distribuida: las capas pueden repartirse entre multiples maquinas para superar las limitaciones de VRAM individuales.

## Casos de uso

- Desarrollo de agentes autonomos con contexto largo: el modelo puede mantener conversaciones o razonamientos multi-paso sobre documentos extensos (hasta 1M tokens), por ejemplo en tareas de analisis de repositorios completos o revision de legislacion.
- Asistente de codigo en entornos locales: al desplegarse en hardware propio con Mesh LLM, equipos de desarrollo pueden usar el modelo para generar, revisar o refactorizar codigo sin enviar datos a la nube, cumpliendo requisitos de privacidad.
- Servicio de chat interno con API compatible con OpenAI: la integracion con `/v1/chat/completions` permite sustituir o complementar servicios externos como ChatGPT en aplicaciones corporativas, manteniendo los datos dentro de la organizacion.
- Inferencia distribuida en clústeres de GPUs modestas: si una sola GPU no tiene suficiente VRAM, el paquete de capas permite repartir el modelo entre varias maquinas (por ejemplo, 2 GPUs de 48 GB o 4 de 24 GB) y ejecutar un modelo de 120B de forma local.
- Investigacion en razonamiento agéntico y planificacion: el modelo esta disenado para tareas que requieren encadenar acciones, decidir herramientas y mantener estado a lo largo de secuencias largas, util en experimentos de IA agéntica.
- Procesamiento de documentos largos y resumen: con 1M tokens de contexto, puede resumir libros, informes tecnicos o historiales de conversacion completos en una sola pasada, sin necesidad de chunking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La pagina de NVIDIA NIM menciona rendimiento en tareas de razonamiento, codigo y tool calling, pero no se incluyen metricas concretas (MMLU, HumanEval, GSM8K, etc.) en los materiales revisados.

## Requisitos de hardware

- Tamaño del paquete: 84,2 GB (pesos cuantizados en UD-Q4_K_XL).
- VRAM estimada: al menos 85-90 GB para cargar el modelo completo en una sola maquina (incluyendo overhead de ejecucion). Con Mesh LLM, puede distribuirse entre varias GPUs o maquinas.
- GPUs recomendadas: para una sola GPU, se necesitaria una NVIDIA H100 80GB o A100 80GB (aunque el modelo completo no cabe en 80 GB, se podria usar con offloading parcial). Para distribucion, combinaciones como 2x RTX 4090 (24 GB cada una) o 4x RTX 3090/4090 pueden ser suficientes si se reparten las capas.
- Opciones de despliegue: Mesh LLM (requerido para este paquete de capas), que ofrece un servidor OpenAI-compatible. El paquete no es directamente compatible con llama.cpp u Ollama, aunque el GGUF base podria usarse con esos runtime si se descarga el archivo original.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| NVIDIA Nemotron 3 Super 120B-A12B | 120B | 12B | 1M | UD-Q4_K_XL (este paquete) | other (propietaria) |
| Mixtral 8x7B | 47B | 13B | 32K | GGUF (varias) | Apache 2.0 |
| DeepSeek-V2-Lite (MoE) | 16B | 2.4B | 32K | BF16/FP8 | MIT (con restricciones) |
| Qwen2.5-72B-Instruct | 72B | 72B (dense) | 128K | GGUF (varias) | Apache 2.0 (Qwen) |

El Nemotron 3 Super destaca por su contexto de 1M y su arquitectura hibrida Mamba-Transformer, pero su licencia "other" puede limitar su uso comercial en comparacion con alternativas de codigo abierto como Mixtral o Qwen.

## Limitaciones y advertencias

- Licencia "other" no especificada: se desconoce si permite uso comercial, redistribucion o modificacion. Es imprescindible revisar los terminos del modelo base en el repositorio GGUF antes de usarlo en produccion.
- Sesgos y alucinaciones: al ser un modelo de razonamiento general, puede generar respuestas incorrectas o inventar hechos, especialmente en tareas de alta complejidad. No hay informacion sobre evaluaciones de sesgo.
- Dependencia de Mesh LLM: este paquete de capas solo funciona con el runtime de Mesh LLM (skippy ABI 0.1.42). No es portable a otros entornos sin convertir los artefactos.
- Contexto de 1M: aunque el modelo soporta 1M tokens, el rendimiento real puede degradarse con contextos muy largos, y la memoria necesaria para atencion puede ser elevada incluso con cuantizacion.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estandar, lo que dificulta comparar con otros modelos.
- Parametros de embeddings y output head: el paquete incluye solo 109.640.064 parametros en esos componentes (551,5 MB cada uno), pero no representan el total del modelo; el resto esta en las capas cuantizadas.

## Enlaces

- Repositorio HuggingFace del paquete: https://huggingface.co/meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-MTPv2-layers
- Modelo base GGUF: https://huggingface.co/meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-MTPv2-GGUF
- Pagina de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b/modelcard
- Investigacion de NVIDIA sobre Nemotron 3 Super: https://research.nvidia.com/labs/nemotron/Nemotron-3-Super/
- Sitio web de Mesh LLM: https://www.meshllm.cloud
- Repositorio GitHub de Mesh LLM: https://github.com/Mesh-LLM/mesh-llm
