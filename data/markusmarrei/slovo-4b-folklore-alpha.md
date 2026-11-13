# MarkusMarrei/slovo-4b-folklore-alpha

## Resumen

Slovo-4B (Folklore & Heritage Alpha) es un adaptador LoRA QLoRA construido sobre `google/gemma-3-4b-it` por el autor MarkusMarrei, orientado a la preservacion, estudio y generacion de contenido folklorico de 46 lenguas indigenas y minoritarias de Rusia (Siberia, Extremo Oriente, Extremo Norte, Volga, Urales y Caucaso septentrional). El modelo se publica como adaptador PEFT (`adapter_model.safetensors`) y como archivo GGUF Q8_0 de 4,14 GB, lo que permite su ejecucion tanto en Transformers/PEFT como en llama.cpp, Ollama o LM Studio.

La propuesta diferencial es el llamado "Zero Wikipedia Principle": el corpus de entrenamiento excluye explicitamente articulos de Wikipedia, noticias y blogs contemporaneos, y se compone exclusivamente de registros academicos de epopeyas, bylinas, cuentos, mitologia y sabiduria popular. Esto produce un modelo con un sesgo de registro muy marcado hacia el estilo de los cantares epicos (Geser, Olonjo, Ural-batyr, Mastorava, Narty), lo que lo aleja de la conversacion cotidiana y lo acerca a la generacion literaria y etnografica.

El estado del proyecto es v0.1-alpha (research preview / proof of concept), con cero descargas y cero likes en el momento de la consulta. La relevancia actual reside en su cobertura linguistica: 46 lenguas, muchas en peligro de extincion (itelmén, nivj, evenki, mansi, yukagir, nene), empaquetadas en un unico adaptador de ~3.880 millones de parametros efectivos sobre una base de 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 3 4B Instruct) con adaptador LoRA (QLoRA, rank 32, alpha 64) |
| Parametros totales | 3.880.263.168 (pesos del modelo base; el adaptador LoRA es un subconjunto adicional) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama.cpp usa `n_ctx=2048` |
| Tipos de cuantizacion | GGUF Q8_0 publicado (4,14 GB); el adaptador LoRA en safetensors se puede cuantizar a otros formatos con herramientas estandar |
| Idiomas soportados | 46 lenguas de Rusia mas ingles: ru, tyv, bua, tat, bak, sah, chv, udm, myv, mdf, krc, kum, avr, dar, lzg, inh, che, os, yrk, kca, mnk, eve, evn, niv, itl, ale, chk, kpv, koi, mhr, mrj, olo, krl, vep, alt, xal, nog, kbd, ady, abq, tab, rut, agx, en |
| Licencia | Gemma (terminos de uso de Google Gemma) |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF Q8_0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante QLoRA (rank 32, alpha 64) sobre `google/gemma-3-4b-it`, un transformer decoder-only de ~3,9 mil millones de parametros con atencion multi-cabeza estandar y capacidades multimodales en su version base. El adaptador se distribuye como pesos PEFT que se cargan sobre el modelo base en Transformers, o bien fusionados y convertidos a GGUF Q8_0 para inferencia en llama.cpp.

El corpus de entrenamiento es un conjunto academico balanceado de folklor: epopeyas heroicas, cuentos tradicionales, mitologia, conjuros y sabiduria popular, con exclusion explicita de Wikipedia, prensa y blogs. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO adicionales. La innovacion tecnica destacable no es arquitectonica sino de curacion de datos: el principio de fuente primaria folklorica al 100 %, que condiciona fuertemente el estilo de salida del modelo.

## Capacidades

- Generacion de texto narrativo y literario en 46 lenguas indigenas de Rusia y en ruso e ingles.
- Generacion de relatos folkloricos, epopeyas, cuentos y mitologia en estilo arcaico y epico.
- Traduccion y adaptacion estilistica hacia registros folkloricos (no traduccion conversacional cotidiana).
- Conversacion multi-turno mediante plantilla de chat de Gemma 3 (`<start_of_turn>user` / `<start_of_turn>model`).
- Preservacion y documentacion de patrimonio cultural inmaterial.
- Capacidades multimodales heredadas de Gemma 3 4B Instruct: no confirmadas en la model card para este adaptador.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta orientado a generacion creativa, no a tareas agenticas.
- Modo thinking explicito: no disponible.

## Casos de uso

- Preservacion digital de patrimonio oral: generar versiones escritas de epopeyas y cuentos en lenguas como buriato, yakuto o tuvano a partir de prompts tematicos, apoyando proyectos de documentacion etnografica.
- Educacion intercultural: producir materiales didacticos y lecturas adaptadas en lenguas minoritarias para escuelas de Siberia, el Volga o el Caucaso, con un registro respetuoso con la tradicion oral.
- Investigacion etnografica y linguistica: generar variantes estilisticas de relatos para comparar motivos folkloricos entre tradiciones (por ejemplo, el motivo del anciano sabio en distintas epopeyas).
- Creacion literaria y editorial: asistir a escritores y traductores en la produccion de textos de estilo epico o arcaico en ruso o en lenguas indigenas.
- Museos y turismo cultural: generar descripciones narrativas de piezas y leyendas locales para carteleria, audioguias o exposiciones, con un tono coherente con la tradicion.
- Localizacion cultural de contenidos: adaptar guiones, juegos o audiovisuales que requieran ambientacion folklorica de pueblos de Rusia, manteniendo el registro epico.
- Prototipado de investigación en lenguas de bajos recursos: servir como banco de pruebas para estudiar el comportamiento de un LLM multilingue ajustado con LoRA sobre 46 lenguas poco representadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el adaptador LoRA en bfloat16 sobre el modelo base: aproximadamente 8-9 GB (base de 3,9B a 2 bytes por parametro mas overhead de activaciones y cache KV).
- VRAM estimada para el GGUF Q8_0: en torno a 4,5-5 GB incluyendo contexto, ya que el archivo pesa 4,14 GB.
- GPU recomendadas: NVIDIA A100 o H100 para despliegue en produccion con Transformers; RTX 4090, RTX 3090 o RTX 4080 para inferencia local comoda en bfloat16; GPUs de 6-8 GB pueden ejecutar la version Q8_0 en llama.cpp.
- Cabe en GPU de consumo: si, la version GGUF Q8_0 en tarjetas de 6 GB o mas; el adaptador completo en bfloat16 requiere 8-10 GB.
- Opciones de despliegue: llama.cpp y llama-cpp-python (soporte nativo del GGUF publicado), Ollama y LM Studio (importando el GGUF), Hugging Face Transformers con PEFT para cargar el adaptador, y vLLM o TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada. El ejemplo oficial usa `n_ctx=2048` y `n_threads=8`, lo que sugiere inferencia en CPU viable pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Slovo-4B Folklore Alpha | 3,9B (base) + LoRA | no disponible (ejemplo a 2048) | Folklor de 46 lenguas de Rusia | Gemma | Adaptador PEFT y GGUF Q8_0 |
| google/gemma-3-4b-it | 3,9B | 128K (segun especificacion de Gemma 3) | Modelo generalista multimodal instruct | Gemma | Pesos completos en safetensors y GGUF |
| Qwen2.5-3B-Instruct | 3,1B | 32K | Modelo generalista multilingue | Apache 2.0 | Pesos completos, amplio ecosistema |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Modelo generalista multilingue | Llama 3.2 Community | Pesos completos, amplio ecosistema |

La comparativa es estructural: Slovo-4B no compite en rendimiento generalista sino en especializacion folklorica y cobertura de lenguas minoritarias, un nicho que los modelos generalistas citados no cubren.

## Limitaciones y advertencias

- Sesgo de registro folklorico: el modelo "piensa como un narrador antiguo" y responde a peticiones cotidianas con imagenes arcaicas o citas de epopeyas; no es apto para traduccion conversacional diaria.
- Estado alpha: es una prueba de concepto de investigacion (v0.1), sin validacion externa ni benchmarks publicados.
- Riesgo de alucinacion: al generar contenido cultural e historico, puede inventar motivos, terminos o variantes linguisticas no atestiguadas; requiere revision por especialistas.
- Cobertura desigual entre lenguas: la calidad variara segun la cantidad de corpus academico disponible por lengua; las lenguas con menos registros (itelmén, yukagir, aleutiano) probablemente rindan peor.
- Sin datos publicados sobre tokens de entrenamiento, composicion del corpus ni evaluacion cuantitativa, lo que dificulta estimar su fiabilidad.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google Gemma, que imponen restricciones y obligaciones de atribucion; conviene revisarlos antes de un despliegue productivo.
- Capacidades multimodales y de tool calling de la base no confirmadas para el adaptador.
- Sin descargas ni validacion de la comunidad en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MarkusMarrei/slovo-4b-folklore-alpha
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Documentacion de PEFT: https://huggingface.co/docs/peft
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
