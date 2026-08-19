# GatekeeperZA/Qwen2.5-1.5B-Instruct-RKLLM-v1.2.3

## Resumen

Este modelo es una conversion precompilada de Qwen2.5-1.5B-Instruct, desarrollada por GatekeeperZA, para ejecutarse en la NPU del SoC Rockchip RK3588 mediante el runtime rknn-llm v1.2.3. Resuelve el problema de desplegar modelos de lenguaje en placas de desarrollo de bajo coste (Orange Pi 5 Plus, Rock 5B, Radxa NX5) sin GPU dedicada, aprovechando los 3 nucleos NPU del RK3588.

El modelo esta cuantizado en W8A8 (pesos y activaciones de 8 bits) y compilado con un contexto maximo de 8192 tokens. El fichero resultante pesa 2.0 GB y se integra con el RKLLM API Server, que expone una API compatible con OpenAI. La licencia es Apache 2.0, heredada del modelo base.

La relevancia actual radica en la creciente demanda de inferencia de LLMs en dispositivos edge y SBCs, donde el RK3588 es uno de los SoCs mas capaces en su rango de precio. Este modelo ofrece una via directa para ejecutar un instruct model de 1.5B parametros a ~19 tokens/s en hardware de bajo coste y consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.5B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (compilado) |
| Tipos de cuantizacion | W8A8 (8-bit pesos, 8-bit activaciones) |
| Idiomas soportados | No especificado en la model card; el modelo base Qwen2.5 soporta 29+ idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | .rkllm (formato Rockchip) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only de la serie Qwen2.5 de Alibaba, preentrenado sobre un dataset de hasta 18 billones de tokens. La version instruct fue afinada para seguir instrucciones y conversacion multi-turno. Qwen2.5 incorpora atencion con GQA (grouped query attention), activacion SwiGLU y normalizacion RMSNorm, aunque la model card de esta conversion no detalla la configuracion interna de capas o cabezas de atencion.

La conversion a RKLLM fue realizada con rkllm-toolkit v1.2.3, aplicando cuantizacion W8A8 con nivel de optimizacion 1. El modelo se compilo especificamente para la plataforma rk3588, utilizando sus 3 nucleos NPU. No se menciona el uso de RLHF o DPO en el proceso de conversion, ya que se trata de una cuantizacion post-entrenamiento del modelo instruct original, sin reentrenamiento adicional.

## Capacidades

- Generacion de texto e instrucciones: modelo instruct afinado para seguir instrucciones y mantener conversaciones multi-turno.
- Capacidades multilingues: el modelo base Qwen2.5 soporta mas de 29 idiomas, aunque la model card de esta conversion no especifica la cobertura exacta.
- Razonamiento, matematicas y codigo: hereda las capacidades de Qwen2.5-1.5B-Instruct en estas areas, aunque no se proporcionan benchmarks especificos para esta version RKLLM.
- Integracion con API compatible con OpenAI: se sirve a traves del RKLLM API Server, que expone el modelo como `qwen2.5-1.5b-instruct` en el listado de modelos.
- No soporta tool calling: la model card indica explicitamente que Qwen2.5-1.5B no esta afinado para function calling estructurado.
- No soporta vision ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Asistente de chat local en SBC: desplegar un chatbot privado en una Orange Pi 5 Plus o Rock 5B con 8GB+ de RAM, sin conexion a internet ni dependencia de servicios cloud. El RKLLM API Server expone el modelo y permite integrarlo en aplicaciones mediante API compatible con OpenAI.
- Prototipado de aplicaciones de IA en edge: desarrollar y validar aplicaciones de procesamiento de lenguaje natural en hardware de bajo coste antes de escalar a infraestructura mayor. La carga del modelo tarda ~3 segundos y el pico de RAM es de ~2.2 GB, lo que permite iterar rapidamente.
- Generacion de texto en entornos sin conexion: generar resumenes, borradores de documentos o respuestas automaticas en dispositivos embebidos donde no hay conectividad. El modelo funciona completamente en local gracias a la NPU del RK3588.
- Educacion e investigacion en IA embebida: utilizar el modelo como plataforma de aprendizaje para estudiar cuantizacion W8A8, despliegue en NPU y optimizacion de inferencia en hardware de bajo consumo.
- Automatizacion de tareas de texto en dispositivos embebidos: clasificar texto, extraer informacion o generar respuestas en sistemas de automatizacion industrial o domotica que ya utilizan RK3588 como controlador.
- Desarrollo de asistentes virtuales privados: construir asistentes personales que procesen datos sensibles localmente, sin enviar informacion a servicios cloud. El modelo se ejecuta integramente en el dispositivo, garantizando privacidad de los datos.

## Benchmarks y rendimiento

La model card no publica benchmarks estandar de LLM (MMLU, HumanEval, GSM8K, etc.) para esta version RKLLM. Los unicos datos de rendimiento disponibles son mediciones de inferencia en hardware especifico, obtenidas
