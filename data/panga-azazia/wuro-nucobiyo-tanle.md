# Panga-Azazia/Wuro-Nucobiyo-Tanle

## Resumen

Wuro-Nucobiyo-Tanle es un modelo de texto a voz (TTS) basado en un LLM, desarrollado por Panga-Azazia y publicado en Hugging Face con licencia Apache 2.0. Parte de la familia Wuro, orientada a lenguas africanas, y se presenta como un fine-tune de Panga-Azazia/Wuro-Mali-Tanle-v0, que a su vez deriva de maya-research/maya1 y RobotsMali/Wuro. Su objetivo es cubrir la sintesis de voz en idiomas de Mali y del Africa occidental que habitualmente carecen de soporte en los sistemas TTS comerciales, como el bambara (bm), el bomu (bmq), el dogon (dts), el dyula (dyu), el fulfulde (ffm), el songhai (ses/spp), el soninke (snk/sev) y el tamacheq (taq), ademas del frances y el ingles.

El modelo tiene 3.300.928.512 parametros (aproximadamente 3,3 mil millones) en formato safetensors y un repositorio de 26,4 GB, lo que sugiere pesos en precision alta (fp16/bf16) o multiples variantes. La arquitectura declarada es de tipo transformer con backbone Llama, adaptada mediante la libreria transformers y compatible con text-generation-inference y con el ecosistema Unsloth para fine-tuning. Se distribuye como pipeline text-to-speech bajo el tag llm-based-tts, es decir, un LLM que genera tokens de audio en lugar de una arquitectura TTS clasica de dos etapas.

Su relevancia actual radica en la escasez de recursos de voz para lenguas de bajos recursos: la mayoria de los TTS multilingues cubren decenas de idiomas europeos y asiaticos pero dejan fuera las lenguas malienses. Wuro-Nucobiyo-Tanle intenta cerrar esa brecha con un unico modelo multilingue entrenado sobre datos de habla real, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face, y no se han publicado resultados de benchmarks ni detalles completos del dataset en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Llama (backbone LLM), pipeline text-to-speech (llm-based-tts) |
| Parametros totales | 3.300.928.512 (~3,3 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 26,4 GB) |
| Idiomas soportados | bm (bambara), bmq (bomu), en (ingles), thq, spp, sev, taq, mwk, myk, bbo, dyi, dyu, mos, dts, kao, ffm, sep, fr (frances) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | maya-research/maya1, RobotsMali/Wuro, Panga-Azazia/Wuro-Mali-Tanle-v0 |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Descargas | 183 |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-10-25 |

## Arquitectura y entrenamiento

El modelo sigue un enfoque de TTS basado en LLM (llm-based-tts): en lugar de un pipeline clasico acustico-vocoder, un transformer de tipo Llama procesa la entrada textual y genera una secuencia de tokens de audio que posteriormente se decodifican a forma de onda. Esta familia de arquitecturas, popularizada por modelos como maya1 (del que deriva), permite reutilizar infraestructura de inferencia de LLM (transformers, text-generation-inference) y simplifica el soporte multilingue, ya que el mismo backbone aprende a mapear texto a unidades acusticas en todos los idiomas del corpus.

El entrenamiento declarado es un fine-tune en cadena: parte de maya-research/maya1 y de RobotsMali/Wuro, y se refina sobre Panga-Azazia/Wuro-Mali-Tanle-v0. El tag unsloth indica que el ajuste se realizo con la libreria Unsloth, tipicamente mediante LoRA o QLoRA sobre el modelo base. No se dispone del numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO; tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. Toda esa informacion figura como no disponible en la ficha del repositorio.

## Capacidades

- Sintesis de voz (text-to-speech) multilingue para lenguas de Mali y Africa occidental: bambara, bomu, dogon, dyula, fulfulde, songhai, soninke, tamacheq, entre otras, ademas de frances e ingles.
- Generacion de texto propia de un LLM subyacente (el modelo esta etiquetado como text-generation y usa un backbone Llama), aunque su uso previsto es TTS.
- Integracion con transformers y text-generation-inference, lo que permite servirlo con la misma infraestructura que un LLM.
- Compatibilidad con el ecosistema Unsloth para fine-tuning adicional sobre nuevos idiomas o voces.
- Soporte de endpoints compatibles (endpoints_compatible) para despliegue gestionado.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento explicito.

## Casos de uso

- Audiolibros y contenido educativo en lenguas malienses: el modelo puede narrar textos en bambara, fulfulde o songhai, idiomas sin cobertura en TTS comerciales, facilitando materiales escolares en la lengua materna de los alumnos.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de documentos y paginas web en lenguas de Mali, donde las soluciones de sintesis existentes no ofrecen voces nativas.
- Locucion automatica para radios comunitarias y medios locales: generacion de boletines y anuncios en varios idiomas desde un unico modelo, reduciendo el coste de produccion de audio.
- Asistentes de voz para servicios publicos: atencion telefonica automatizada en bambara o dyula para informacion sanitaria o agricola, aprovechando que el modelo cubre el par texto-voz en el mismo idioma del usuario.
- Traduccion y doblaje de contenido: combinado con un modelo de traduccion, permite doblar videos del frances o el ingles a lenguas locales manteniendo una voz sintetica coherente.
- Investigacion en linguistica y documentacion de lenguas: generacion de muestras de voz para estudio fonetico y para ampliar corpus de lenguas de bajos recursos, dado el caracter abierto (Apache 2.0) del modelo.
- Prototipado de interfaces de voz en aplicaciones moviles: al ejecutarse sobre transformers y admitir cuantizacion, puede integrarse en backends de inferencia para asistentes de voz en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,6 GB solo para pesos (3,3 mil millones de parametros), mas memoria para el estado de decodificacion de audio y el contexto; en la practica se recomienda reservar 10-12 GB.
- En cuantizacion de 8 bits: alrededor de 3,5-4 GB de pesos, con un total estimado de 6-8 GB de VRAM.
- En cuantizacion de 4 bits: alrededor de 2 GB de pesos, con un total estimado de 4-6 GB de VRAM (los tipos de cuantizacion no estan documentados oficialmente).
- GPU profesionales recomendadas: A100, H100 o L40S para despliegue concurrente y baja latencia; A10G o L4 para cargas moderadas.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB) sin problemas; en RTX 4070 (12 GB) o RTX 3060 (12 GB) es viable con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (soportado segun los tags), y previsiblemente vLLM y llama.cpp/Ollama si se generan pesos GGUF, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Wuro-Nucobiyo-Tanle | ~3,3 mil millones | no disponible | 19 lenguas africanas, frances e ingles | Apache 2.0 | Restringido (gated) |
| maya-research/maya1 (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| RobotsMali/Wuro (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Panga-Azazia/Wuro-Mali-Tanle-v0 (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos base para establecer una comparacion cuantitativa con alternativas TTS de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos, lo que complica la automatizacion de pipelines.
- Ausencia de benchmarks: no hay evaluaciones publicas de calidad de sintesis (MOS, inteligibilidad, similitud de hablante), por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion acustica: al ser un TTS basado en LLM, puede generar artefactos, pronunciaciones incorrectas o audio incoherente en entradas fuera de distribucion o en idiomas con pocos datos.
- Cobertura desigual entre idiomas: los 19 idiomas declarados probablemente no tienen la misma cantidad de datos de entrenamiento; las lenguas con menos recursos pueden presentar peor calidad.
- Sesgos de hablante y dialecto: al entrenarse sobre un corpus limitado, puede reproducir un unico acento o variedad dialectal y no representar la diversidad real de cada lengua.
- Documentacion incompleta: no se detallan el dataset, el proceso de entrenamiento, la longitud de contexto ni los formatos de cuantizacion soportados, lo que dificulta la reproducibilidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los modelos base (maya1, Wuro) por si imponen restricciones adicionales.
- Para produccion: es necesario validar la calidad de audio con hablantes nativos de cada idioma antes de desplegarlo en servicios publicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Panga-Azazia/Wuro-Nucobiyo-Tanle
- Modelo base maya1: https://huggingface.co/maya-research/maya1
- Modelo base Wuro: https://huggingface.co/RobotsMali/Wuro
- Modelo base Wuro-Mali-Tanle-v0: https://huggingface.co/Panga-Azazia/Wuro-Mali-Tanle-v0
- Perfil del autor: https://huggingface.co/Panga-Azazia
