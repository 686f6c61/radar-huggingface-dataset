# aoiandroid/Qwen3-0.6B

## Resumen

Qwen3-0.6B es el modelo mas pequeno de la familia Qwen3, desarrollada por Alibaba Qwen. Se trata de un modelo de lenguaje causal denso de 0,6 mil millones de parametros (751.632.384 segun los pesos en safetensors, 0,44B sin contar embeddings) disenado para generacion de texto, dialogo conversacional y razonamiento ligero en entornos con recursos muy limitados. Su ventana de contexto es de 32.768 tokens y combina atencion con Grouped Query Attention (16 cabezas para Q y 8 para KV) sobre 28 capas.

La ficha que nos ocupa, `aoiandroid/Qwen3-0.6B`, es una publicacion derivada del modelo base `Qwen/Qwen3-0.6B-Base` (etiquetada como finetune) subida por el usuario `aoiandroid`. Conserva los tags de la familia original (transformers, safetensors, qwen3, text-generation, conversational, text-generation-inference) y la licencia Apache 2.0, pero registra 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como un artefacto sin validacion independiente de la comunidad.

Su relevancia actual radica en dos factores: por un lado, la familia Qwen3 introduce conmutacion entre modo "thinking" y modo "non-thinking" dentro del mismo modelo, capacidades de agente, tool calling y soporte de mas de 100 idiomas; por otro, el tamano de 0,6B permite ejecucion en CPU o en GPUs de gama de entrada, lo que lo convierte en candidato para prototipado rapido, despliegue edge y tareas de clasificacion o extraccion a bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (decoder-only) con Grouped Query Attention |
| Parametros totales | 751.632.384 (0,6B); 0,44B sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No especificados en la ficha; formatos GGUF disponibles a traves de herramientas de la comunidad (llama.cpp, Ollama, LM Studio) |
| Idiomas soportados | No disponible en la ficha del repositorio (la familia Qwen3 declara soporte de mas de 100 idiomas y dialectos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,5 GB, compatible con transformers) |
| Capas | 28 |
| Cabezas de atencion | 16 para Q, 8 para KV (GQA) |
| Modelo base | Qwen/Qwen3-0.6B-Base |
| Libreria | transformers (se requiere >= 4.51.0) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de tipo causal, con 28 capas, 16 cabezas de consulta y 8 cabezas de clave/valor mediante Grouped Query Attention, lo que reduce el coste de la cache KV respecto a atencion multi-cabeza completa. El modelo pasa por las etapas de preentrenamiento y postentrenamiento segun la model card de referencia, e incorpora dos modos de operacion conmutables mediante el parametro `enable_thinking` en `apply_chat_template`: en modo thinking genera un bloque `<think>...</think>` con el razonamiento antes de la respuesta final, y en modo non-thinking produce respuesta directa para dialogo general. La model card recomienda `Temperature=0.6`, `TopP=0.95`, `TopK=20` y `MinP=0` para el modo thinking, y sugiere `presence_penalty` de 1,5 si aparecen repeticiones sin fin.

No se dispone en la informacion proporcionada de datos concretos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las tecnicas exactas de alineacion (RLHF, DPO u otras) empleadas en esta publicacion derivada. La referencia tecnica declarada mediante el tag `arxiv:2505.09388` corresponde al informe tecnico de la familia Qwen3, donde se documentan estos detalles a nivel de familia, no especificamente de este repositorio. Tampoco hay informacion sobre que datos adicionales, si alguno, se usaron para el ajuste respecto al modelo base.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno.
- Razonamiento logico y matematico en modo thinking, activable o desactivable por peticion.
- Generacion de codigo y asistencia de programacion a nivel basico, limitada por el tamano del modelo.
- Soporte de tool calling y function calling en ambos modos (thinking y non-thinking).
- Capacidades de agente y razonamiento multi-paso, con integracion de herramientas externas.
- Soporte multilingue de mas de 100 idiomas y dialectos segun la documentacion de la familia Qwen3 (incluyendo instrucciones y traduccion); no confirmado de forma especifica para este repositorio.
- Compatibilidad con plantillas de chat mediante `tokenizer.apply_chat_template`.
- No se declaran capacidades de vision ni de audio en la informacion disponible.

## Casos de uso

- Prototipado y pruebas de concepto en local: con 0,6B de parametros, el modelo se ejecuta en portatiles sin GPU dedicada mediante llama.cpp u Ollama, lo que permite iterar sobre prompts y plantillas de chat antes de migrar a modelos mayores.
- Clasificacion y extraccion de informacion: uso del modelo para etiquetado de textos, extraccion de entidades o resumen de documentos cortos en pipelines por lotes donde el coste por token es el factor limitante.
- Asistentes conversacionales de bajo coste: gestion de dialogos multi-turno con hasta 32.768 tokens de contexto, adecuado para bots de soporte con historial acotado y despliegue en una sola GPU de gama de entrada.
- Generacion de codigo asistida en editores: autocompletado y generacion de fragmentos pequenos integrados en extensiones ligeras, dado que el modelo soporta tool calling y plantillas de chat estandar.
- Traduccion y normalizacion multilingue: tareas de traduccion de frases cortas o preprocesado multilingue aprovechando el soporte declarado de mas de 100 idiomas, con revision humana por las limitaciones de un modelo de 0,6B.
- Enrutamiento y orquestacion de agentes: uso como modelo "router" que decide que herramienta o modelo mayor invocar, gracias al soporte de function calling y a su baja latencia potencial.
- Generacion de datos sinteticos: creacion de pares pregunta-respuesta o datos de aumento para entrenar clasificadores, con filtrado posterior por la tasa de alucinacion esperable.
- Despliegue en entornos edge o embebidos: inferencia en dispositivos con memoria limitada tras cuantizacion a 8 o 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog, al repositorio de GitHub y a la documentacion de Qwen3 para consultar evaluaciones, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otras) para este modelo ni para esta publicacion derivada. No se deben extrapolar resultados del modelo base a este repositorio sin verificacion previa.

## Requisitos de hardware

- VRAM estimada (calculada a partir del numero de parametros, 751,6M):
  - FP16/BF16: aproximadamente 1,5 GB de pesos; en la practica, entre 2 y 3 GB de memoria total con cache KV a contexto moderado.
  - INT8: aproximadamente 0,8 GB de pesos.
  - Q4 (GGUF Q4_K_M y similares): aproximadamente 0,5 GB de pesos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), asi como en GPUs integradas con memoria compartida suficiente.
- Ejecucion en CPU: viable en FP32/INT8 con llama.cpp u Ollama; el rendimiento dependera del numero de nucleos, con latencias de decenas de tokens por segundo en procesadores modernos (no hay cifras publicadas para este repositorio).
- GPUs de datacenter (A100, H100) no son necesarias para un modelo de este tamano; solo tendrian sentido para servir lotes muy grandes.
- Opciones de despliegue declaradas: transformers (>= 4.51.0), vLLM (>= 0.8.5) con `--enable-reasoning --reasoning-parser deepseek_r1`, SGLang (>= 0.4.6.post1) con `--reasoning-parser qwen3`, text-generation-inference (tag `text-generation-inference`), y para uso local Ollama, LM Studio, MLX-LM, llama.cpp y KTransformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de la columna "Contexto" y "Licencia" de los modelos alternativos son referencias externas y no proceden de la informacion proporcionada; deben verificarse antes de usarse en produccion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| aoiandroid/Qwen3-0.6B | 751.632.384 | 32.768 tokens | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | No disponible |
| Qwen/Qwen3-0.6B (upstream) | 0,6B | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente distribuido | Publicados en el blog de Qwen3, no incluidos aqui |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens (referencia externa) | Apache 2.0 | HuggingFace | No disponible |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens (referencia externa) | Llama 3.2 Community License | HuggingFace, con restricciones de uso | No disponible |

## Limitaciones y advertencias

- Repositorio sin validacion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia publica de evaluacion independiente ni de calidad del ajuste respecto al modelo base.
- Procedencia del ajuste desconocida: no se documenta que datos, metodo ni hiperparametros se usaron para el finetune, lo que impide auditar sesgos introducidos.
- Riesgo de alucinacion elevado: con 0,6B de parametros, la tasa de errores factuales es alta en tareas de conocimiento abierto; la model card advierte ademas de repeticiones sin fin y recomienda `presence_penalty` de 1,5.
- Capacidad de razonamiento limitada: el modo thinking mejora el rendimiento relativo dentro de la familia, pero no equivale al de modelos de mayor tamano; no es adecuado para matematicas complejas ni para razonamiento de multiples pasos extenso.
- Contexto util reducido en la practica: aunque la ventana es de 32.768 tokens, en un modelo de este tamano la recuperacion efectiva de informacion en el centro del contexto suele degradarse; conviene verificar con pruebas propias.
- Idiomas: la ficha del repositorio no declara idiomas; el soporte multilingue se hereda de la familia Qwen3 y debe validarse por idioma, especialmente en lenguas minoritarias.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion. La ficha enlaza a la licencia del repositorio original `Qwen/Qwen3-0.6B`.
- Dependencia de version: con `transformers<4.51.0` la carga falla con `KeyError: 'qwen3'`.
- Fecha de creacion atipica en los metadatos (2026-09-15) y ausencia de historial de actualizaciones, lo que dificulta evaluar su mantenimiento.
- Si se despliega en produccion, conviene anclar la revision exacta del repositorio y comparar su salida con la del modelo upstream antes de sustituirlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aoiandroid/Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo upstream de la familia: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Informe tecnico (tag arxiv): https://arxiv.org/abs/2505.09388
- Chat de demostracion: https://chat.qwen.ai/
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos resultados obtenidos versaban sobre la herramienta dxdiag de Windows y no guardan relacion con la ficha.
