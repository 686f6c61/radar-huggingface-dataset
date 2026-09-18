# smolify/smolified-aiexpense

## Resumen

smolified-aiexpense es un modelo de lenguaje de dominio especifico (DSLM, Domain Specific Language Model) publicado por smolify bajo licencia Apache 2.0. Se trata de un derivado del modelo base gemma-3-270m, con 268 098 176 parametros reales confirmados en los pesos safetensors, y esta orientado a tareas de generacion de texto en el ambito de gastos y finanzas empresariales (por ejemplo, traduccion de peticiones en lenguaje natural a SQL sobre transacciones). El repositorio ocupa aproximadamente 0,6 GB.

El modelo se presenta como el resultado de un proceso de destilacion sintetica propietaria ("Neural Distillation") realizado por la plataforma Smolify Foundry, a partir de motores de razonamiento de mayor tamano. La propuesta de valor es el despliegue en hardware de borde (CPU o NPU) o en entornos con VRAM limitada, donde un modelo denso de 268 millones de parametros puede ejecutarse con requisitos minimos. El ambito declarado es el ingles, y la model card indica compatibilidad con vLLM, Text Generation Inference (TGI) y Transformers.

La relevancia actual de este tipo de publicaciones es doble. Por un lado, ejemplifica la tendencia a destilar modelos grandes en arquitecturas pequenas para tareas verticales. Por otro lado, sirve como caso de estudio de un modelo recien publicado, sin descargas ni valoraciones en el momento de redactar esta ficha y con muy poca documentacion tecnica verificable mas alla de la propia model card: no hay resultados de benchmarks, no se detalla el numero de tokens de entrenamiento ni la composicion del dataset, y la ficha contiene afirmaciones (soberania del peso, cuantizacion 4 bits) que no concuerdan con otros metadatos del repositorio. La fecha de creacion y actualizacion que figura en los metadatos es 2026-09-18, incoherente respecto a la fecha actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma3_text (transformer decoder-only denso, derivado de gemma-3-270m) |
| Parametros totales | 268 098 176 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible para este derivado; el modelo base gemma-3-270m declara 32 000 tokens (no confirmado en la documentacion de este repositorio) |
| Tipos de cuantizacion | La model card menciona "4-bit Quantized / FP16 Mixed", pero el tamano del repositorio (0,6 GB) es coherente con pesos en FP16/BF16 (unos 536 MB) y no con 4 bits (unos 134 MB). No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (la model card tambien afirma que los pesos son un "activo soberano" propiedad de smolify, lo que entra en contradiccion con la licencia declarada) |
| Formato de pesos | safetensors |

Parametros de muestreo recomendados por el autor: temperature 1,0, top_p 0,95, top_k 64.

## Arquitectura y entrenamiento

La arquitectura es la de gemma-3-270m, un transformer decoder-only con atencion por ventanas alternada (la familia Gemma 3 combina capas de atencion local y global), tokenizador SentencePiece y soporte nativo de plantilla de chat. El tag `gemma3_text` en HuggingFace confirma que se reutiliza la clase de modelo de texto de dicha familia. Con 268 millones de parametros, la huella de pesos en FP16 ronda los 536 MB, lo que explica el tamano de 0,6 GB del repositorio.

El autor declara un metodo de entrenamiento de "destilacion neuronal propietaria" a partir de "motores de razonamiento SOTA" y la generacion del modelo dentro de la plataforma Smolify Foundry (Job ID `d01fc81f`). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT supervisado. Existe un enlace a un dataset asociado (`smolify/smolified-aiexpense`) del que no se aportan estadisticas. El ejemplo de codigo de la model card contiene un artefacto de plantilla (`if "gemma-3-270m" == "gemma-3-270m"`), lo que sugiere generacion automatica de la ficha por parte del pipeline de Smolify; conviene tratar la documentacion con cautela.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantilla de chat (roles system, user y assistant) mediante `apply_chat_template`.
- Generacion de SQL a partir de lenguaje natural en el dominio de gastos y transacciones, segun el ejemplo que acompaña la model card.
- Tareas de extraccion y transformacion de informacion estructurada, propias del dominio financiero declarado.
- Ejecucion en entornos de bajos recursos: al ser un modelo de 268 millones de parametros, puede correr en CPU, NPU o GPU de gama baja.
- Compatibilidad con backends de inferencia estandar: Transformers, vLLM y TGI (etiqueta `text-generation-inference` y `endpoints_compatible`).
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, ni modo de razonamiento explicito (thinking mode). No hay evidencia de capacidades multilingues mas alla del ingles.

## Casos de uso

- Traduccion de lenguaje natural a SQL sobre bases de datos de gastos: el modelo recibe la peticion del usuario y el esquema de tablas, y genera la consulta SQL correspondiente. Es el escenario que ilustra la propia model card y encaja con el dominio de entrenamiento declarado.
- Clasificacion automatica de gastos: etiquetar transacciones bancarias en categorias contables (viajes, dietas, software, suministros) en un pipeline por lotes. Un modelo de 268M es suficiente y muy barato de ejecutar a escala.
- Extraccion de campos de facturas o recibos en texto plano: parsear proveedor, importe, fecha e impuestos a JSON estructurado para su volcado en un ERP.
- Preprocesado y normalizacion en un pipeline de RAG: reescritura de consultas, generacion de metadatos o filtrado de fragmentos antes de pasarlos a un modelo mayor. Su tamano permite ejecutarlo en la misma maquina que el resto del pipeline.
- Asistente embebido en aplicaciones de gestion de gastos: autocompletado de notas, resumen de movimientos mensuales o generacion de borradores de informes, ejecutandose en local sin enviar datos financieros a la nube.
- Enrutamiento de peticiones (router) en un sistema multi-modelo: decidir si una consulta la resuelve el modelo pequeno o debe escalarse a un modelo mayor, reduciendo coste por token.
- Laboratorio docente o de investigacion: modelo ligero para ensayar tecnicas de destilacion, cuantizacion y despliegue en hardware de borde sin necesidad de GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, BIRD, Spider ni ninguna otra metrica, y los resultados de la busqueda web no aportan informacion tecnica sobre el modelo (los enlaces devueltos corresponden a foros de soporte de Windows y no guardan relacion con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 268M de parametros; son estimaciones, no datos publicados por el autor):
  - FP16/BF16: unos 0,54 GB de pesos; con cache KV y overhead, del orden de 1 a 1,5 GB para contextos de varios miles de tokens.
  - Cuantizacion de 8 bits: unos 0,27 GB de pesos.
  - Cuantizacion de 4 bits: unos 0,13 GB de pesos (variante no publicada en el repositorio; requeriria convertirla).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM sirve. No necesita A100 ni H100. Modelos adecuados: RTX 3060, RTX 4060, RTX 4090, T4, L4 o incluso iGPU con memoria dedicada.
- Cabe holgadamente en GPU de consumo, en CPU moderna (inferencia interactiva para salidas cortas) y en NPU de portatiles y dispositivos de borde.
- Opciones de despliegue: Hugging Face Transformers, vLLM, TGI y cualquier backend compatible con safetensors. Para llama.cpp u Ollama haria falta convertir los pesos a GGUF, conversion que no se distribuye en el repositorio. No hay variantes ONNX publicadas.
- Latencia y throughput: no disponibles. No se han publicado mediciones y las cifras dependerian fuertemente del hardware, del backend y de la cuantizacion elegida.
- Ajuste fino: con 268M de parametros, es viable un LoRA o incluso un ajuste completo en una unica GPU de consumo.

## Comparativa con modelos similares

Datos de los modelos alternativos tomados de su documentacion publica; conviene verificarlos en la fuente antes de un uso critico.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smolified-aiexpense | 268M | No disponible (base: 32 000 tokens) | Apache 2.0 | HuggingFace, safetensors, sin variantes GGUF publicadas |
| gemma-3-270m | 268M | 32 000 tokens | Licencia Gemma (no Apache) | HuggingFace, amplia documentacion y benchmarks publicos |
| Qwen2.5-0.5B | 494M | 32 000 tokens | Apache 2.0 | HuggingFace, multiples cuantizaciones y gran adopcion |
| SmolLM2-360M | 362M | 8000 tokens | Apache 2.0 | HuggingFace, variantes GGUF y amplio ecosistema |

Diferencias destacables: smolified-aiexpense es el unico de la comparativa especializado en un dominio concreto mediante destilacion declarada, pero tambien el unico sin benchmarks, sin cuantizaciones publicadas y sin validacion de la comunidad. Frente al gemma-3-270m original ofrece una licencia mas permisiva (Apache 2.0 frente a la licencia Gemma), a costa de renunciar a la documentacion y a las garantias de un modelo publicado por Google.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita comparar la calidad real del modelo con su modelo base ni con alternativas. La afirmacion de destilacion desde "motores SOTA" no esta respaldada por datos.
- Documentacion escasa y posiblemente generada de forma automatica: la model card incluye un artefacto de plantilla en el ejemplo de codigo y no detalla dataset, numero de tokens ni proceso de alineacion.
- Contradiccion de licencia: el campo `license` indica Apache 2.0, mientras que el texto afirma que los pesos son un "activo soberano" propiedad de smolify. Antes de un uso comercial conviene aclarar cual prevalece.
- Contradiccion en la cuantizacion: se declara "4-bit Quantized / FP16 Mixed", pero el tamano del repositorio corresponde a pesos FP16/BF16. No se puede asumir que exista una version de 4 bits lista para usar.
- Sesgos: no se documenta ningun analisis de sesgos. Un modelo destilado para un dominio financiero concreto puede heredar sesgos del profesor y mostrar un comportamiento deficiente fuera de ese dominio.
- Riesgo de alucinacion: en generacion de SQL, una alucinacion produce consultas sintacticamente validas pero semanticamente incorrectas. Es obligatorio validar las consultas generadas contra el esquema real y aplicar controles de solo lectura.
- Ambito muy restringido: el dominio declarado es gastos y finanzas, con idioma unico (ingles). No hay evidencia de un rendimiento aceptable en otras tareas.
- Riesgos de privacidad y cumplimiento: el caso de uso natural implica datos financieros. Aunque la ejecucion local reduce la exposicion, el tratamiento de esos datos esta sujeto al RGPD y a normativa sectorial; la licencia Apache 2.0 no exime de esas obligaciones.
- Longitud de contexto no confirmada: si el derivado recorta la ventana del modelo base, el rendimiento en prompts largos (por ejemplo, esquemas de bases de datos extensos) puede degradarse de forma significativa.
- Modelo sin adopcion: cero descargas y cero valoraciones en el momento de redactar esta ficha. Cualquier uso en produccion deberia ir precedido de una evaluacion propia con datos representativos.
- Metadatos temporales incoherentes (fechas de 2026), lo que sugiere un pipeline de publicacion automatizado y poco supervisado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smolify/smolified-aiexpense
- Dataset declarado: https://huggingface.co/datasets/smolify/smolified-aiexpense
- Plataforma del autor: https://smolify.ai
- Modelo base: gemma-3-270m (familia Gemma 3 de Google DeepMind); no se incluye enlace directo en la informacion proporcionada
- Paper, blog tecnico o repositorio de codigo: no disponibles
- Demo: no disponible
- Resultados de busqueda web: no se encontro informacion tecnica relevante; los resultados devueltos corresponden a foros de soporte de Windows y no guardan relacion con el modelo
