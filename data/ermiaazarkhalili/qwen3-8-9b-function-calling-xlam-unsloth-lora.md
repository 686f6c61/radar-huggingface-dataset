# ermiaazarkhalili/Qwen3.8-9B-Function-Calling-xLAM-Unsloth-LoRA

## Resumen

`ermiaazarkhalili/Qwen3.8-9B-Function-Calling-xLAM-Unsloth-LoRA` es un adaptador LoRA de fine-tuning supervisado (SFT) sobre el modelo base `empero-ai/Qwen3.8-9B`, entrenado con el dataset `Salesforce/xlam-function-calling-60k` para especializar el modelo en la generación de llamadas a funciones (function calling). El adaptador se publica en formato PEFT con pesos safetensors y ocupa 0,7 GB.

El modelo aborda un problema concreto: capacitar a un LLM generalista para emitir invocaciones de herramientas estructuradas y correctamente formateadas, un requisito esencial en pipelines de agentes y automatización. El entrenamiento emplea QLoRA 4-bit con rango 64, una sola época y una secuencia de 2048 tokens, logrando una pérdida final de 0,0992 tras 7.500 pasos. El autor también publica una versión fusionada de 16 bits del mismo entrenamiento, `Qwen3.8-9B-Function-Calling-xLAM-Unsloth`, que puede usarse sin cargar el adaptador por separado.

La relevancia actual radica en que el adaptador permite adaptar rápidamente un modelo de 9B a tareas de function calling con un coste de entrenamiento bajo, y su tamaño reducido lo hace desplegable en hardware de consumo. No obstante, al ser un adaptador reciente sin descargas ni evaluación externa, su rendimiento en producción no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `empero-ai/Qwen3.8-9B` (arquitectura del base no disponible) |
| Parametros totales | No disponible (adaptador 0,7 GB; parametros del base no especificados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con secuencia de 2048 tokens) |
| Tipos de cuantizacion | QLoRA 4-bit durante el entrenamiento; adaptador en bf16/fp16; version fusionada de 16 bits |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (hereda la del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se obtiene mediante fine-tuning supervisado con QLoRA 4-bit sobre el modelo base `empero-ai/Qwen3.8-9B`, un modelo de 9 mil millones de parametros de la familia Qwen3.8 (la arquitectura interna del base no se detalla en la informacion disponible; los modulos objetivo del LoRA incluyen `in_proj_qkv` e `in_proj_z`, lo que sugiere una arquitectura con proyecciones lineales multiples, pero no se puede confirmar). El dataset de entrenamiento es `Salesforce/xlam-function-calling-60k`, compuesto por 60.000 ejemplos de llamadas a funciones en formato xLAM.

La configuracion de entrenamiento es la siguiente: rango LoRA 64, alpha 64, dropout 0, bias none, longitud de secuencia 2048, una sola epoca, tasa de aprendizaje 0,0002 y batch efectivo de 8. El entrenamiento completo 7.500 pasos con una perdida final de 0,0992. Los modulos objetivo del adaptador son 10 proyecciones (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `out_proj`, `in_proj_qkv`, `in_proj_z`); se excluyen `in_proj_a` e `in_proj_b` porque con rango 64 esas proyecciones ya son de rango completo y un adaptador sobre ellas no anadiria capacidad.

El proceso sigue el flujo de Unsloth con TRL para SFT, y el codigo de reproduccion esta disponible en un notebook incluido en el repositorio.

## Capacidades

- Generacion de texto conversacional: el modelo base es de tipo text-generation, y el adaptador mantiene esta capacidad general.
- Function calling / tool calling: capacidad principal del adaptador, entrenado especificamente con el dataset xLAM para producir invocaciones de funciones estructuradas.
- Razonamiento multi-paso: hereda del modelo base, aunque no hay evaluacion especifica publicada.
- Soporte de agentes: puede integrarse en pipelines que requieran seleccion y llamada de herramientas.
- Capacidades multilingues: no disponibles en la informacion del adaptador; dependen del modelo base.

## Casos de uso

- Asistentes de automatizacion empresarial: el modelo puede generar llamadas a APIs internas (CRM, ERP, ticketing) a partir de peticiones en lenguaje natural, reduciendo la necesidad de parsers manuales.
- Agentes de consulta a bases de datos: dado un esquema SQL, el modelo puede emitir invocaciones de funciones que ejecutan consultas parametrizadas, evitando la generacion directa de SQL inseguro.
- Chatbots con herramientas externas: integrado en frameworks como LangChain o LlamaIndex, el adaptador permite que el asistente decida que funcion llamar (busqueda web, calculo, envio de emails) y devuelva el resultado al usuario.
- Automatizacion de flujos de trabajo: en plataformas de RPA, el modelo puede traducir instrucciones de usuario en llamadas a funciones de automatizacion (crear tarea, actualizar estado, enviar notificacion).
- Generacion de codigo con APIs: el modelo puede producir invocaciones a APIs REST o SDKs, generando el JSON de llamada con los parametros correctos a partir de una descripcion funcional.
- Evaluacion de modelos de function calling: por su tamano y bajo coste de inferencia, sirve como baseline para comparar tecnicas de fine-tuning de tool use en modelos de tamano medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida de entrenamiento (0,0992) y no incluye evaluacion en test, ni comparaciones con otros modelos de function calling (como GPT-4o, Claude o modelos xLAM de Salesforce). No se debe asumir ningun rendimiento especifico.

## Requisitos de hardware

- VRAM estimada: no disponible con precision, ya que el tamano del modelo base no se especifica. Para un modelo de 9B en cuantizacion 4-bit, se estiman aproximadamente 6-8 GB de VRAM; el adaptador LoRA anade unos 0,7 GB en pesos.
- GPU recomendadas: para inferencia en 4-bit, una RTX 3060 12 GB o superior; para la version fusionada de 16 bits, se recomienda al menos 16 GB de VRAM (RTX 4080, A100, H100).
- Compatibilidad con consumer GPU: si, cabe en GPUs de consumo con 12 GB o mas si se usa cuantizacion.
- Opciones de despliegue: el adaptador PEFT se carga con Hugging Face Transformers y PEFT; la version fusionada se puede servir con vLLM, llama.cpp (si se convierte a GGUF) o TGI. No hay ficheros GGUF publicados para este adaptador concreto, aunque el autor ha publicado un GGUF de un modelo Qwen3-8B similar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. El adaptador se puede comparar conceptualmente con otros modelos de function calling de tamano similar:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| `Qwen3.8-9B-Function-Calling-xLAM-Unsloth-LoRA` | 9B (base) + adaptador | No disponible | No publicado | No disponible |
| `Qwen3-8B-Function-Calling-xLAM-Unsloth-GGUF` (del mismo autor) | 8B | No disponible | No publicado | Apache-2.0 |
| Modelos de la serie xLAM de Salesforce (p. ej. xLAM-7b) | 7B | 4K-8K | Publicado en paper | Apache-2.0 |

La comparativa no es exhaustiva porque no se dispone de especificaciones del base `empero-ai/Qwen3.8-9B` ni de resultados de benchmark.

## Limitaciones y advertencias

- Entrenado sobre un unico dataset (xlam-function-calling-60k) sin evaluacion en validacion o test reportada; el rendimiento en dominios fuera de ese dataset no esta verificado.
- Hereda los sesgos, capacidades y limitaciones del modelo base `empero-ai/Qwen3.8-9B`, cuyas caracteristicas no estan documentadas en la informacion disponible.
- La licencia del adaptador no esta especificada; se hereda la del modelo base, que tampoco se indica. Para uso comercial, es necesario verificar la licencia de `empero-ai/Qwen3.8-9B`.
- Riesgo de alucinacion en la generacion de parametros de funciones: el modelo puede inventar argumentos o valores no presentes en el contexto.
- No se ha probado la robustez frente a adversarial prompts o entradas malformadas en el contexto de function calling.
- La version del adaptador requiere el modelo base exacto para funcionar; no es un modelo autonomo.

## Enlaces

- Adaptador LoRA: https://huggingface.co/ermiaazarkhalili/Qwen3.8-9B-Function-Calling-xLAM-Unsloth-LoRA
- Version fusionada de 16 bits: https://huggingface.co/ermiaazarkhalili/Qwen3.8-9B-Function-Calling-xLAM-Unsloth
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Version GGUF de un modelo similar del mismo autor: https://huggingface.co/ermiaazarkhalili/Qwen3-8B-Function-Calling-xLAM-Unsloth-GGUF
