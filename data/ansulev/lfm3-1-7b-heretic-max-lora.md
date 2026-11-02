# ansulev/LFM3-1.7B-Heretic-Max-LoRA

## Resumen

LFM3-1.7B-Heretic-Max-LoRA es una variante "decensored" (abliterated) del modelo LFM3-1.7B de Liquid AI, publicada por el usuario ansulev. Se ha generado aplicando la herramienta Heretic v1.4.0 sobre el checkpoint base de LiquidAI, con el objetivo de eliminar los mecanismos de rechazo del modelo original. El resultado, segun la model card, reduce las negativas de 93/100 a 6/100 en un conjunto de evaluacion de 100 prompts, con una divergencia KL de 0,0040 respecto al original, lo que indica una alteracion relativamente contenida de la distribucion de salida.

El modelo hereda la arquitectura tri-hibrida de la familia LFM3: 24 capas que combinan 13 convoluciones cortas con compuerta (gated short convolutions), 5 capas de atencion de ventana deslizante y 6 capas de atencion global. Con 1,73B parametros y una ventana de contexto de 256K tokens, esta disenado para despliegue en el borde (edge): a 4 bits ocupa aproximadamente 1 GB de memoria, lo que permite ejecutarlo en telefonos y portatiles. El post-entrenamiento original esta orientado a agentes locales, tool calling y salidas estructuradas.

La relevancia de esta ficha radica en que documenta una modificacion no oficial de un modelo de Liquid AI. El modelo base esta optimizado para agentes locales con contexto muy largo y bajo consumo de memoria, mientras que esta variante elimina las barreras de rechazo, lo que cambia radicalmente el perfil de seguridad y las condiciones de uso responsable. Es importante senalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que el tamano del repo figura como 0.0 GB, lo que sugiere que los pesos podrian no estar efectivamente alojados o que la informacion esta incompleta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-hibrida: 24 capas (13 gated short convolutions, 5 sliding-window attention, 6 global attention) |
| Parametros totales | 1,73B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | no disponible (la model card menciona 4 bits ~1 GB, pero no lista formatos) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en HF) |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de LFM3-1.7B de Liquid AI, un transformer tri-hibrido que sustituye la mayoria de capas de atencion por convoluciones cortas con compuerta. De las 24 capas, 13 son gated short convolutions, 5 son atencion de ventana deslizante y 6 son atencion global. Esta combinacion busca reducir el coste computacional y de memoria en secuencias largas manteniendo capacidad de modelado global. El vocabulario es de 128.000 tokens y el contexto alcanza 256K tokens de entrada mas salida.

El checkpoint original fue post-entrenado por Liquid AI para cargas agenticas (Hermes Agent, Pi, OpenClaw), tool calling y salidas estructuradas. Sobre ese checkpoint, ansulev aplico Heretic v1.4.0, una herramienta de abliteration que identifica y proyecta fuera las direcciones de activacion asociadas a comportamientos de rechazo. Los parametros reportados incluyen direction_index 11.53, pesos maximos y minimos para attn.o_proj y mlp.down_proj con sus posiciones y distancias. No se dispone de informacion sobre el volumen de tokens de entrenamiento original, la composicion del dataset ni si hubo RLHF o DPO en la etapa de Liquid AI, mas alla de la mencion generica al post-entrenamiento agentico.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del checkpoint post-entrenado de LFM3-1.7B.
- Razonamiento multi-paso y soporte para cargas agenticas (Hermes Agent, Pi, OpenClaw) segun la model card del modelo base.
- Tool calling y function calling, orientado a integracion con herramientas externas.
- Salidas estructuradas (structured outputs), util para pipelines que requieren JSON u otros formatos rigidos.
- Capacidades multilingues en 16 idiomas, incluido el espanol.
- Contexto largo de 256K tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Comportamiento "decensored": reduce drasticamente los rechazos (6/100 frente a 93/100 del original), lo que implica menor filtrado de contenido sensible.
- No se mencionan capacidades de vision, audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Agentes locales en dispositivos de borde: el modelo, a 4 bits, ocupa aproximadamente 1 GB, por lo que puede ejecutarse en telefonos y portatiles para tareas de agente personal sin conexion a la nube.
- Automatizacion de tool calling en pipelines internos: su post-entrenamiento para cargas agenticas y salidas estructuradas lo hace adecuado para orquestar llamadas a APIs y funciones en flujos de trabajo automatizados.
- Procesamiento de documentos largos: con 256K tokens de contexto puede resumir, extraer informacion o responder preguntas sobre contratos, informes o bases de conocimiento extensas en una sola pasada.
- Generacion de contenido sin filtros en entornos controlados: la reduccion de rechazos permite generar texto creativo, dialogos o escenarios que el modelo original rechazaria, util en investigacion sobre seguridad y en escritura asistida sin restricciones.
- Asistente conversacional multilingue: cubre 16 idiomas, lo que permite atender usuarios en espanol, ingles, arabe, chino, etc., con un unico modelo ligero.
- Experimentacion en investigacion sobre abliteration: sirve como caso de estudio para medir el impacto de Heretic en la distribucion de salidas (KL 0,0040) y en las tasas de rechazo, comparandolo con el modelo original.
- Fine-tuning especializado en una sola GPU: la model card del base indica que se puede adaptar a dominios, formatos y herramientas concretos con fine-tuning rapido en una GPU, y esta variante mantiene ese perfil de bajo coste.

## Benchmarks y rendimiento

La unica informacion cuantitativa disponible en la model card es la comparacion de abliteration, no benchmarks estandar de NLP:

| Metrica | Este modelo | Modelo original (LiquidAI/LFM3-1.7B) |
|---|---|---|
| Divergencia KL | 0,0040 | 0 (por definicion) |
| Rechazos | 6/100 | 93/100 |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB a 4 bits segun la model card del base; en FP16/BF16 se situaria en torno a 3,5 GB para los pesos (1,73B parametros), sin contar cache KV.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) deberia poder alojarlo en cuantizacion de 4 bits; para FP16 se requiere al menos 6-8 GB de VRAM.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs con 8 GB o mas en cuantizacion, y en telefonos y portatiles segun la model card del base.
- Opciones de despliegue: transformers con custom_code (la libreria indicada). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B-Heretic-Max-LoRA (este) | 1,73B | 256K | LFM Open License v1.0 | Variante abliterated, 6/100 rechazos |
| LiquidAI/LFM3-1.7B (original) | 1,73B | 256K | LFM Open License v1.0 | Modelo oficial, 93/100 rechazos, post-entrenado agentico |
| LiquidAI/LFM3-1.7B-Base | 1,73B | 256K | LFM Open License v1.0 | Checkpoint base sin post-entrenamiento conversacional |

No se dispone de datos de benchmarks para comparar rendimiento con alternativas de otros fabricantes; la comparativa se limita a las variantes de la propia familia LFM3 documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "decensored": la abliteration elimina gran parte de los rechazos, por lo que puede generar contenido sensible, ofensivo o inseguro. No es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- La licencia LFM Open License v1.0 puede imponer restricciones al uso comercial; debe revisarse el texto completo antes de desplegar en produccion.
- El repositorio figura con 0 descargas, 0 likes y 0.0 GB de tamano, lo que sugiere que los pesos podrian no estar disponibles o que el repo esta incompleto; verificar antes de usarlo.
- Riesgo de alucinacion inherente a un modelo de 1,73B; no se han publicado evaluaciones de fidelidad factual.
- Aunque soporta 16 idiomas, el rendimiento por idioma no esta documentado; el espanol figura en la lista pero sin metricas.
- La ventana de 256K tokens puede degradar la calidad en el extremo superior; no hay datos sobre atencion efectiva a esa distancia.
- No se confirma soporte en frameworks de inferencia populares (vLLM, llama.cpp, Ollama); la dependencia de custom_code en transformers puede complicar el despliegue.
- La modificacion con Heretic es no oficial y no cuenta con el respaldo de Liquid AI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ansulev/LFM3-1.7B-Heretic-Max-LoRA
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Modelo original post-entrenado: https://huggingface.co/LiquidAI/LFM3-1.7B
- Heretic: https://heretic-project.org
- Blog de lanzamiento LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola API: https://console.liquid.ai/dashboard
- Coleccion LFM3: https://huggingface.co/collections/LiquidAI/lfm3
