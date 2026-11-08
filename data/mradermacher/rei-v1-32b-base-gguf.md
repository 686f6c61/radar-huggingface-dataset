# mradermacher/Rei-V1-32B-Base-GGUF

## Resumen

Rei-V1-32B-Base-GGUF es la distribucion en formato GGUF del modelo Rei-V1-32B-Base, un ajuste fino (finetune) de 32.566.081.536 parametros orientado a roleplay y escritura creativa (storywriting). El modelo original lo desarrolla Delta-Vector; esta version cuantizada la publica mradermacher, un perfil conocido en Hugging Face por generar cuantizaciones estaticas de modelos abiertos para su uso con llama.cpp y herramientas compatibles.

El modelo parte de una base de 32B parametros y se ha afinado con Axolotl sobre un conjunto de datasets orientados a narrativa, roleplay e instrucciones de escritura, muchos de ellos derivados de datos tipo Claude/Kalo y logs de personajes (Personamaxx). El resultado es un modelo conversacional especializado en generar dialogos de personaje y prosa narrativa, no un modelo generalista de razonamiento o codigo.

La relevancia de esta ficha radica en que el repositorio GGUF es la via practica para ejecutar el modelo en hardware de consumo o en servidores con llama.cpp, dado que el repositorio original en safetensors ocupa cientos de gigabytes. La informacion publica disponible es escasa: no hay model card detallada del modelo base en los datos proporcionados, ni licencia declarada, ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de un modelo base de 32B; detalles no disponibles) |
| Parametros totales | 32.566.081.536 (~32,6B) |
| Parametros activos | no disponible (no es MoE segun los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 222,9 GB |
| Modelo base | Delta-Vector/Rei-V1-32B-Base |
| Libreria | transformers |
| Herramienta de ajuste | Axolotl |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el numero de parametros (32,6B) y el ecosistema de herramientas (transformers, Axolotl, GGUF), se trata de un transformer denso de aproximadamente 32B parametros, sin indicios de arquitectura MoE, SSM o hibrida. Tampoco se especifican el numero de capas, dimensiones ocultas ni la longitud de contexto nativa.

El ajuste fino se realizo con Axolotl sobre una mezcla de datasets orientados a roleplay y escritura: PocketDoc/Dans-Personamaxx-Logs, anthracite-org/kalo-opus-instruct-22k-no-refusal, lodrick-the-lafted/kalo-opus-instruct-3k-filtered, anthracite-org/nopm_claude_writing_fixed, anthracite-org/kalo_opus_misc_240827, anthracite-org/kalo_misc_part2, NewEden/Claude-Instruct-5K y NewEden/Claude-Instruct-2.7K. No se documentan el numero de tokens de entrenamiento, la composicion exacta de la mezcla ni si hubo fases de RLHF o DPO. La model card del repositorio GGUF incluye una nota tecnica sobre la generacion de cuantizaciones (`no_imatrix`) que menciona un valor NaN detectado en `blk.1.ffn_up.weight`, lo que indica que las cuantizaciones IQ con imatrix no se generaron para este modelo.

## Capacidades

- Generacion de texto narrativo y prosa creativa en ingles, con enfasis en escritura de ficcion y storywriting.
- Roleplay conversacional multi-turno: mantiene personajes y estilos de dialogo derivados de los datasets de entrenamiento.
- Generacion de dialogos de personaje con consistencia de voz y tono.
- Continuacion y expansion de escenas narrativas a partir de prompts.
- Instrucciones de escritura (estilo instruct) segun los datasets tipo Claude-Instruct empleados.
- Capacidades multilingues limitadas: el modelo declara solo ingles (`en`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Escritura asistida de ficcion: el modelo puede generar y continuar escenas narrativas en ingles, aprovechando su ajuste sobre datasets de storywriting para mantener coherencia de estilo y personajes a lo largo de varios parrafos.
- Roleplay y chatbots de personaje: adecuado para aplicaciones de entretenimiento conversacional donde se requiere mantener una persona concreta durante dialogos multi-turno, gracias al entrenamiento sobre logs de personajes (Personamaxx).
- Generacion de dialogos para guiones y videojuegos: util para producir lineas de dialogo de personajes con voces diferenciadas, integrable en pipelines de escritura creativa.
- Prototipado de narrativa interactiva: sirve como motor de texto en demos de ficcion interactiva o novelas visuales, ejecutandose localmente via llama.cpp con cuantizaciones Q4_K_M (~19,8 GB).
- Experimentacion en investigacion sobre roleplay: permite reproducir y evaluar el comportamiento de un finetune de 32B en tareas de personificacion sin depender de APIs cerradas.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4 o Q5 puede ejecutarse en GPUs de consumo de gama alta o en configuraciones CPU+GPU, lo que facilita pruebas offline de generacion creativa.
- Fine-tuning posterior: al estar disponible el modelo base en safetensors, se puede usar como punto de partida para ajustes adicionales con Axolotl en dominios narrativos especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero GGUF): Q2_K ~12,4 GB; Q3_K_S ~14,5 GB; Q3_K_M ~16,0 GB; Q3_K_L ~17,3 GB; IQ4_XS ~17,9 GB; Q4_K_S ~18,8 GB; Q4_K_M ~19,8 GB; Q5_K_S ~22,6 GB; Q5_K_M ~23,2 GB; Q6_K ~26,8 GB; Q8_0 ~34,7 GB. A estos valores hay que anadir la memoria para el contexto KV cache.
- GPU recomendadas: para Q4_K_M y Q5_K_M, GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) son suficientes; para Q6_K y Q8_0 se recomienda 32 GB o mas (A100 40GB, H100, RTX A6000).
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 y Q5; las cuantizaciones Q2 y Q3 pueden caber en GPUs de 16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) para GGUF; el modelo base en safetensors puede servirse con transformers, text-generation-inference o vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Rei-V1-32B-Base (esta ficha) | ~32,6B | no disponible | Roleplay / storywriting, solo ingles | no disponible | GGUF, safetensors |
| Modelos 32B genericos de proposito general | ~32B | variable | Razonamiento, codigo, instrucciones | variable | variable |
| Finetunes de roleplay de 7B-13B | 7B-13B | variable | Roleplay / narrativa | variable | GGUF, safetensors |

No se dispone de datos de benchmarks ni de comparaciones directas publicadas en la informacion proporcionada que permitan una comparativa cuantitativa con alternativas concretas. La comparativa anterior es estructural (tamano, enfoque, formato) y no de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre datasets de roleplay e instrucciones derivadas de Claude, puede heredar sesgos de estilo y contenido de esas fuentes.
- Riesgo de alucinacion: elevado en tareas factuales, ya que el modelo esta optimizado para narrativa y roleplay, no para precision factual.
- Limitaciones de contexto e idioma: solo declara ingles; la longitud de contexto no esta documentada, por lo que no se debe asumir una ventana larga sin verificacion empirica.
- Restricciones de licencia: la licencia no esta declarada en la informacion disponible, lo que impide confirmar si el uso comercial esta permitido. Es un riesgo importante para produccion.
- Caveat tecnico: la model card indica un NaN detectado en `blk.1.ffn_up.weight` durante la generacion de cuantizaciones, por lo que no se ofrecen cuants IQ con imatrix; conviene validar la calidad de las cuantizaciones bajas (Q2, Q3) antes de usarlas.
- Uso en produccion: al ser un finetune de roleplay sin benchmarks publicados, no se recomienda para tareas de razonamiento, codigo o atencion al cliente sin una evaluacion previa.
- El repositorio GGUF tiene un numero bajo de descargas (178) y likes (1), lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Rei-V1-32B-Base-GGUF
- Modelo base: https://huggingface.co/Delta-Vector/Rei-V1-32B-Base
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Rei-V1-32B-Base-GGUF
- Perfil del autor de cuantizaciones: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
