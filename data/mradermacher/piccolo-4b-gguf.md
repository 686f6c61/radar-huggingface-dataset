# mradermacher/Piccolo-4B-GGUF

## Resumen

Piccolo-4B es un modelo de lenguaje desarrollado por agentscope-ai (el equipo de AgentScope, vinculado a Alibaba) y clasificado con las etiquetas "decision-model" y "bidirectional-attention", lo que sugiere que se trata de un modelo orientado a tareas de decision y planificacion para agentes, con atencion bidireccional en lugar del esquema causal tradicional. La ficha aqui presentada corresponde a la cuantizacion GGUF publicada por mradermacher, un cuantizador conocido por generar versiones estaticas de modelos populares para su uso en llama.cpp y derivados.

El modelo base, agentscope-ai/Piccolo-4B, tiene 4.326.350.848 parametros (dato real extraido de safetensors) y soporta ingles y chino. Incluye un suplemento multimodal (mmproj), lo que indica capacidades de vision ademas de texto. Su relevancia radica en la combinacion de un tamano compacto (4B), licencia Apache 2.0 y orientacion a agentes, un perfil muy demandado para despliegues locales y en dispositivos con recursos limitados.

Esta version GGUF ofrece cuants estaticos desde Q2_K (2,1 GB) hasta f16 (8,8 GB), ademas de los archivos mmproj en Q8_0 y f16 para la parte multimodal. No se dispone de cuants weighted/imatrix del autor en el momento de redaccion de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion bidireccional (modelo de decision, etiqueta "qwenpaw"); detalles completos no disponibles |
| Parametros totales | 4.326.350.848 (4,33 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; suplemento multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta cuantizacion); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

Segun las etiquetas del repositorio, Piccolo-4B emplea atencion bidireccional y se clasifica como "decision-model", ademas de llevar la etiqueta "qwenpaw", que apunta a una relacion arquitectonica con la familia Qwen. La atencion bidireccional es una innovacion destacable respecto a los transformers causales estandar: permite que cada token atienda a toda la secuencia, un enfoque habitual en modelos de difusion de texto o en modelos de decision/planificacion, donde el razonamiento no es estrictamente autorregresivo.

No hay informacion disponible sobre el dataset de entrenamiento, el numero de tokens, ni sobre fases de post-entrenamiento (SFT, RLHF o DPO). Tampoco se detalla si el modelo soporta decodificacion especulativa u otras tecnicas de aceleracion. El archivo mmproj incluido confirma la existencia de un proyector multimodal para procesar imagenes junto al modelo de lenguaje.

## Capacidades

- Generacion de texto conversacional (etiqueta "conversational" en el repositorio).
- Tareas de decision y planificacion para agentes (etiqueta "decision-model", vinculo con el framework AgentScope).
- Capacidades multimodales: los archivos mmproj-Q8_0 y mmproj-f16 indican soporte de entrada de imagenes mediante llama.cpp.
- Soporte de ingles y chino.
- Posible soporte de tool calling o agentes multi-step: plausible por su vinculacion con AgentScope, pero no confirmado en la informacion disponible.
- Ejecucion local eficiente gracias a las cuantizaciones GGUF en multiples niveles de precision.

## Casos de uso

- Agentes locales con AgentScope: su etiqueta "decision-model" y su origen en agentscope-ai lo hacen candidato natural como cerebro de decision en pipelines de agentes multi-paso ejecutados en local con llama.cpp.
- Asistentes multimodales en escritorio: combinando el GGUF principal con el mmproj, se pueden construir aplicaciones que describan o razonen sobre imagenes sin conexion, con Q4_K_M ocupando unos 2,9 GB.
- Chatbots bilingues ingles/chino en dispositivos modestos: con 4,3 B de parametros y cuants de 2 a 5 GB, cabe en portatiles sin GPU dedicada.
- Prototipado rapido de LLM en local: la amplia gama de cuants permite ajustar el equilibrio calidad/VRAM durante el desarrollo sin cambiar de modelo.
- Integracion en aplicaciones edge: el tamano reducido de los cuants Q2_K/Q3_K (2,1-2,6 GB) lo hace viable en mini-PC o SBC con memoria limitada.
- Investigacion sobre arquitecturas no causales: la atencion bidireccional lo convierte en un sujeto de estudio para comparar paradigmas de decodificacion frente a modelos autorregresivos clasicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: depende del quant elegido; desde unos 2,5 GB de RAM para Q2_K hasta unos 10 GB para f16 (sumando contexto y overhead). Con el suplemento multimodal, anadir 0,5-0,8 GB.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer con 4-6 GB de VRAM (RTX 3060, RTX 4060) ejecuta comodos los cuants Q4/Q5 con aceleracion. Para Q8_0 o f16, una RTX 4090 (24 GB) o similar.
- Cabe en consumer GPU: si, incluso en GPUs de gama media baja con cuants Q4_K_M (2,9 GB) o IQ4_XS (2,7 GB).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers o vLLM, aunque el soporte de vLLM para esta arquitectura no esta confirmado.
- Latencia y throughput: no disponibles; por tamano (4,3 B), se espera velocidad alta en CPU moderna y muy alta en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Nota |
|---|---|---|---|---|---|
| Piccolo-4B | 4,33 B | no disponible | si (mmproj) | Apache 2.0 | Modelo de decision con atencion bidireccional, orientado a agentes |
| Qwen3-4B | 4 B | 32K (ampliable) | no | Apache 2.0 | Transformer causal estandar, ecosistema maduro |
| Phi-4-mini (3,8B) | 3,8 B | 128K | no | MIT | Fuerte en razonamiento y codigo, contexto largo |
| Gemma 3 4B | 4 B | 128K | si | Gemma (restricciones de uso) | Multimodal con contexto largo |

Piccolo-4B se diferencia de sus alternativas por su enfoque de decision/agentes y atencion bidireccional; los demas son transformers causales convencionales con ecosistemas mas consolidados y contextos documentados.

## Limitaciones y advertencias

- No se ha publicado documentacion completa del modelo base en la informacion disponible: contexto, datos de entrenamiento y benchmarks son desconocidos, lo que dificulta evaluar su idoneidad para produccion.
- Al tratarse de un modelo con atencion bidireccional y paradigma de decision, es posible que las herramientas habituales del ecosistema GGUF (plantillas de chat, muestreo estandar) no funcionen como en modelos causales; verificar compatibilidad con la version de llama.cpp.
- Riesgo de alucinacion: no cuantificado; aplicar las salvaguardas habituales en cualquier LLM de 4B.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Los cuants disponibles son estaticos; no hay cuants weighted/imatrix, por lo que la calidad en precisiones bajas (Q2_K, Q3_K) puede ser inferior a la de cuants imatrix equivalentes.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes.
- El repositorio de cuantizacion es de terceros (mradermacher); para soporte del modelo en si, acudir al repositorio base de agentscope-ai.

## Enlaces

- Cuantizacion GGUF: https://huggingface.co/mradermacher/Piccolo-4B-GGUF
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-4B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Piccolo-4B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de quant de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
