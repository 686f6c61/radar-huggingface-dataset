# nexiloopofficial/nexi-4-v2-GGUF

## Resumen

NEXI-4 v2 es un modelo de lenguaje de ~1.880 millones de parametros (1.881.825.088 exactos) publicado por nexiloopofficial bajo licencia Apache 2.0. Se presenta como un modelo de la "gama 4 GB" orientado a tool calling y despliegue en el borde (edge), construido a partir de una base Qwen3.5-2B afinada con LoRA sobre el corpus de function calling xlam durante 300 pasos, fusionada y cuantizada a Q4_K_M en formato GGUF.

Su propuesta principal es ofrecer capacidades de function calling con un consumo de recursos muy contenido: el autor reporta un archivo de 1,29 GB, un pico de RSS de 2,02 GB, un tiempo de carga de 1,5 s y unos 15 tokens por segundo en decodificacion sobre una maquina solo-CPU de 8 vCPU y 31 GB de RAM. Esto lo situa en el segmento de modelos ligeros que pueden ejecutarse sin GPU.

La relevancia del modelo es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las evaluaciones publicadas por el autor son de muestras muy pequenas (10 de 10 en tool_call sobre un conjunto de validacion, 100 % en una evaluacion de decision de CUA). El propio autor aclara que no se reclama un nivel BFCL. Conviene tratarlo como un experimento ligero de tool calling mas que como un modelo de proposito general verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B, ajuste LoRA fusionado) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5-2B y se afina mediante LoRA sobre el corpus de function calling xlam durante 300 pasos. Posteriormente el adaptador se fusiona con los pesos base y el resultado se cuantiza a Q4_K_M en formato GGUF. No se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens de entrenamiento, ni si hubo fases de RLHF o DPO.

La innovacion declarada es funcional mas que arquitectonica: el modelo emite llamadas a herramientas en el formato `<tool_call>{...}</tool_call>` con JSON ajustado a esquemas de funciones definidos. El autor situa el modelo dentro de un ecosistema propio de modelos y drivers locales (NEXI-Models-Drivers). No se documentan tecnicas como decodificacion especulativa, atencion lineal u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en un unico turno o multi-turno (tag "conversational").
- Tool calling / function calling: emite JSON estructurado en `<tool_call>{...}</tool_call>` para funciones con esquema.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integracion con APIs de tipo OpenAI-compatible segun el etiquetado del repositorio.
- Decision en tareas de agente tipo CUA (computer-use agent), segun la evaluacion propia del autor.
- Capacidades multilingues: no disponibles.
- Razonamiento avanzado, matematicas, codigo general, vision o audio: no disponibles o no declaradas.

## Casos de uso

- Automatizacion de agentes locales en el borde: el modelo cabe en ~2 GB de RAM y puede ejecutarse en CPU, por lo que es adecuado para dispositivos sin GPU que necesiten invocar funciones (APIs internas, comandos del sistema) mediante JSON estructurado.
- Enrutamiento de herramientas en asistentes ligeros: dado un conjunto de funciones con esquema, el modelo decide que funcion invocar y con que argumentos, reduciendo el coste frente a modelos mayores en tareas de clasificacion de intencion con salida estructurada.
- Prototipado rapido de pipelines de tool calling: al ser Apache 2.0 y GGUF, permite iterar sobre integraciones de function calling en local sin dependencias de infraestructura cloud.
- Agentes de escritorio o CUA de bajo coste: el autor reporta un 100 % en una evaluacion de decision de CUA, lo que lo hace candidato para pasos de decision en automatizacion de interfaz, siempre con validacion propia.
- Despliegue en entornos con restricciones de memoria: con un pico de RSS de ~2 GB, encaja en contenedores pequenos o dispositivos embebidos donde un modelo de 7B no cabria.
- Servicio de invocacion de funciones en segundo plano: con ~15 tok/s en CPU, puede atender cargas de baja concurrencia donde la latencia no sea critica.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Notas |
|---|---|---|
| Tool_call (held-out) | 10/10 | Muestra pequena; el autor no reclama nivel BFCL |
| Decision CUA | 100 % | Metrica no detallada en la informacion disponible |
| Velocidad de decodificacion | ~15 tok/s | CPU-only, 8 vCPU / 31 GB RAM |
| Tiempo de carga | 1,5 s | Misma maquina |
| Pico de RSS | 2,02 GB | Misma maquina |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BFCL) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la configuracion reportada (ejecucion solo-CPU); para GPU, una cuantizacion Q4_K_M de ~1,3 GB cabria en practicamente cualquier GPU consumer con 2 GB o mas de VRAM.
- RAM: pico de RSS medido de 2,02 GB en CPU.
- GPU recomendadas: no disponibles; el autor solo documenta ejecucion en CPU.
- GPU consumer: si, cualquier GPU con al menos ~2 GB de VRAM libre (por ejemplo, GTX 1650, RTX 3050 en adelante), aunque no hay mediciones publicadas en GPU.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGUF (Ollama, LM Studio); el tag "endpoints_compatible" sugiere servidores con API compatible. vLLM y TGI no estan confirmados para este repositorio.
- Latencia y throughput: ~15 tok/s de decodificacion en CPU de 8 vCPU; carga en 1,5 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| NEXI-4 v2 | ~1,88 B | no disponible | GGUF (Q4_K_M) | Apache 2.0 | Afinado para tool calling; evaluacion propia muy limitada |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens (segun documentacion publica de Qwen) | safetensors, GGUF | Apache 2.0 | Base generalista de referencia en el segmento; sin afinado especifico de tool calling |
| Qwen2.5-3B-Instruct | ~3 B | 32.768 tokens (segun documentacion publica de Qwen) | safetensors, GGUF | Apache 2.0 (variantes) | Mayor capacidad general a cambio de mas recursos |
| Llama-3.2-1B-Instruct | ~1,2 B | 128.000 tokens (segun documentacion publica de Meta) | safetensors, GGUF | Llama 3.2 Community License | Buen equilibrio tamano/contexto; requisitos de licencia distintos |

Los datos de contexto de los modelos comparados provienen de su documentacion publica; no se dispone de comparaciones de rendimiento directas con NEXI-4 v2 en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion muy limitada: las metricas del autor se basan en 10 casos de tool_call y una evaluacion de CUA sin detalle; no hay benchmarks estandar publicados.
- Riesgo de alucinacion en JSON: aunque el modelo aprende el contrato de `<tool_call>`, no hay garantia de validez del esquema en produccion; conviene validar la salida con un parser estricto.
- Contexto desconocido: no se documenta la longitud de contexto, lo que impide planificar conversaciones largas o documentos extensos.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue; asumir un rendimiento inferior fuera del ingles.
- Adopcion nula: 0 descargas y 0 likes; sin senales de uso o validacion por la comunidad.
- Base y dataset: el ajuste es de solo 300 pasos de LoRA sobre xlam; el modelo puede degradar capacidades generales de la base Qwen3.5-2B.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; revisar terminos de la base Qwen3.5-2B si aplican restricciones adicionales.
- Ecosistema propio: la integracion depende de los drivers del autor (NEXI-Models-Drivers), lo que puede limitar la portabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/nexiloopofficial/nexi-4-v2-GGUF
- Repositorio de drivers y ecosistema NEXI: https://github.com/PupppyLoverr/NEXI-Models-Drivers
