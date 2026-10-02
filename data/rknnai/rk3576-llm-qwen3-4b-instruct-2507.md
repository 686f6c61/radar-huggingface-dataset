# RKNNAI/RK3576-LLM-Qwen3-4B-Instruct-2507

## Resumen

Este repositorio no contiene un modelo nuevo, sino un paquete de despliegue RKLLM del modelo Qwen3-4B-Instruct-2507, preparado por RKNNAI para ejecutarse sobre la NPU del chip Rockchip RK3576. El modelo subyacente es un transformer denso de 4.000 millones de parametros desarrollado por Alibaba Qwen, en su variante "Instruct-2507", que elimina el modo de razonamiento (thinking) y deja unicamente el entrenamiento de instrucciones. Resuelve el problema de ejecutar un LLM de 4B en hardware embebido de gama media, con cuantizacion de 4 y 8 bits y contexto recortado a 1k, 2k, 4k o 16k tokens segun la configuracion.

La relevancia de este paquete es doble. Por un lado, Qwen3-4B-Instruct-2507 destaca en comprension y generacion de lenguaje, codigo y matematicas, con soporte multilingue y de tool calling, lo que lo convierte en una opcion solvente para edge computing. Por otro, el repositorio aporta las conversiones RKLLM ya verificadas con SHA-256, el runtime requerido (v1.2.4) y siete configuraciones listas para flashear, algo que no ofrece el modelo original de Qwen y que reduce de forma notable el trabajo de integracion en placas RK3576.

Conviene subrayar que este paquete es un artefacto de despliegue especifico de Rockchip: los pesos no estan en safetensors ni en GGUF, sino en el formato propietario RKLLM, y solo se garantiza su funcionamiento en el chip RK3576. Para uso en GPU o CPU hay que acudir al modelo original Qwen/Qwen3-4B-Instruct-2507.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), sin modo thinking |
| Parametros totales | 4.000 millones (modelo fuente Qwen3-4B-Instruct-2507) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens en el modelo fuente; en este paquete RKLLM: 1024, 2048, 4096 o 16384 tokens segun configuracion |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits) y w8a8 (pesos y activaciones 8 bits) |
| Idiomas soportados | no disponible en la informacion proporcionada; el modelo fuente Qwen3 se describe como multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | RKLLM (formato propietario de Rockchip); el modelo fuente esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo fuente Qwen3-4B-Instruct-2507: un transformer denso de 4.000 millones de parametros de Alibaba Qwen, entrenado exclusivamente como modelo de instrucciones. A diferencia de las variantes estandar de Qwen3-4B, esta version "2507" no incorpora modo de razonamiento explicito (thinking mode), lo que reduce la latencia de generacion al evitar cadenas de pensamiento largas antes de la respuesta. El modelo fuente maneja una ventana de contexto de 256K tokens.

Sobre el proceso de entrenamiento (numero exacto de tokens, composicion del dataset, uso de RLHF o DPO) no se ha proporcionado informacion en esta ficha, por lo que se marca como no disponible. Lo especifico de este repositorio es la fase de conversion y cuantizacion: RKNNAI ha generado siete compilaciones RKLLM con el runtime v1.2.4, distribuidas en dos esquemas de precision (w4a16 y w8a8) y cuatro longitudes de contexto (1024, 2048, 4096 y 16384 tokens), todas configuradas para usar 2 nucleos de NPU del RK3576. El paquete incluye ficheros SHA256SUMS para verificar la integridad de cada configuracion antes del despliegue.

## Capacidades

- Generacion de texto y comprension del lenguaje en tareas de instrucciones.
- Generacion y asistencia en codigo, segun las capacidades del modelo fuente Qwen3-4B-Instruct-2507.
- Resolucion de problemas matematicos.
- Soporte multilingue (el modelo fuente Qwen3 se comercializa como multilingue; los idiomas concretos no se detallan en la informacion disponible).
- Tool calling y function calling, segun las capacidades declaradas del modelo fuente.
- Ejecucion local en NPU de bajo consumo (Rockchip RK3576), sin depender de servicios en la nube.
- No soporta modo de razonamiento explicito (thinking mode): la variante 2507 es solo instruct.

## Casos de uso

- Asistentes embebidos en dispositivos industriales: el paquete RKLLM permite ejecutar un LLM de 4B directamente en la NPU del RK3576, sin conexion a internet, con la configuracion w4a16-2-1024 para contextos cortos y baja latencia.
- Interfaces de voz o texto en electrodomesticos y paneles HMI: con la configuracion de 2048 o 4096 tokens se pueden gestionar dialogos multi-turno breves en local, reduciendo costes de inferencia en la nube.
- Automatizacion de atencion al cliente en kioscos o terminales: la variante de 16k tokens permite mantener contexto de conversacion mas amplio para consultas de producto o tramites.
- Procesamiento de documentos en el borde: extraccion de datos y resumen de textos en dispositivos con RK3576, manteniendo la informacion en el propio hardware por motivos de privacidad.
- Generacion de codigo asistida en entornos de desarrollo embebido: el modelo fuente soporta tareas de programacion y tool calling, util para autocompletado o generacion de scripts en herramientas locales.
- Educacion y tutoria offline: despliegue de un asistente de estudio en dispositivos de bajo coste con RK3576, sin cuotas de API.
- Integracion en pipelines de robotica o vision embebida: combinado con otros modulos del RK3576, el LLM puede interpretar comandos en lenguaje natural y emitir acciones estructuradas mediante tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de RKNNAI no incluye metricas de MMLU, HumanEval, GSM8K u otras, y los resultados del modelo fuente Qwen3-4B-Instruct-2507 no se han facilitado en los datos de esta ficha, por lo que no se reproducen cifras.

## Requisitos de hardware

- Hardware objetivo principal: chip Rockchip RK3576 con 2 nucleos de NPU, runtime RKLLM v1.2.4.
- Configuraciones disponibles: w4a16 en contextos de 1024, 2048, 4096 y 16384 tokens; w8a8 en contextos de 1024, 2048 y 4096 tokens.
- VRAM estimada para el modelo fuente en GPU: aproximadamente 8 GB en BF16 para los 4B parametros; en cuantizacion de 8 bits ronda los 4-5 GB, y en 4 bits alrededor de 2,5-3 GB (referencia orientativa; en este paquete el formato es RKLLM, no GPU).
- GPU compatibles con el modelo fuente (no con este paquete RKLLM): RTX 3060 12 GB, RTX 4090, A100, H100; cabe en GPUs de consumo con 8 GB o mas en cuantizaciones bajas.
- Opciones de despliegue: RKLLM runtime para RK3576. Para el modelo fuente, vLLM, llama.cpp, Ollama, TGI u otras, segun la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia |
|---|---|---|---|---|
| RKNNAI/RK3576-LLM-Qwen3-4B-Instruct-2507 | 4B (denso) | 1k-16k en este paquete | RKLLM para RK3576 | apache-2.0 |
| Qwen/Qwen3-4B-Instruct-2507 (fuente) | 4B (denso) | 256K | safetensors, GPU/CPU | apache-2.0 |
| Qwen3-4B-Instruct-2507-FP8 | 4B (denso) | 256K | FP8, GPU | apache-2.0 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete solo funciona en el chip RK3576; no es portable a otras plataformas sin reconversion.
- La longitud de contexto en este repositorio esta recortada a un maximo de 16384 tokens, muy por debajo de los 256K del modelo fuente.
- No hay soporte de modo de razonamiento (thinking mode) en la variante 2507.
- Los pesos estan en formato RKLLM, propietario de Rockchip, lo que limita la inspeccion y reutilizacion fuera de su ecosistema.
- Riesgo de alucinacion inherente a un modelo de 4B: no es adecuado para tareas que exijan precision factual alta sin verificacion.
- Sesgos conocidos: no se documentan en la informacion proporcionada; deben evaluarse en el caso de uso concreto.
- Licencia apache-2.0 en el modelo fuente, lo que en principio permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones del runtime RKLLM de Rockchip.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre estas configuraciones.
- Conviene verificar la integridad con SHA256SUMS antes de cualquier despliegue en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RKNNAI/RK3576-LLM-Qwen3-4B-Instruct-2507
- Modelo fuente: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Ficha en FitMyLLM: https://www.fitmyllm.com/model/qwen3-4b-2507
- Ficha en LLM Explorer (version FP8): https://llm-explorer.com/model/Qwen%2FQwen3-4B-Instruct-2507-FP8,6rqjCJohzfhz3u3NpjdyuG
