# Austriani/Goetia-26B-A4B-v1.7-ik_llama.cpp

## Resumen

Goetia-26B-A4B-v1.7-ik_llama.cpp es una cuantizacion GGUF del modelo Naphula/Goetia-26B-A4B-v1.7, publicada por el usuario Austriani. Se trata de un modelo de lenguaje multimodal (image-text-to-text) de arquitectura Mixture-of-Experts con 128 expertos y aproximadamente 26 mil millones de parametros totales, del cual se activan unos 4 mil millones por token (de ahi el sufijo A4B). El modelo base deriva de la familia Gemma-4 segun las etiquetas del repositorio, y ha sido construido mediante fusion de modelos (mergekit) con tecnicas Della, Karcher y NearSwap.

El modelo esta orientado a escritura creativa, roleplay y narrativa oscura, incluyendo contenido NSFW, y mantiene capacidades de vision. Esta cuantizacion concreta emplea la libreria ik_llama.cpp con cuantizacion tipo IQK, trellis-quant, calibracion imatrix v3 y el metodo MaxOptima del autor de la cuantizacion, lo que la hace especificamente disenable en el fork ik_llama.cpp y no en llama.cpp estandar.

Su relevancia actual radica en que ofrece una alternativa cuantizada de un MoE multimodal de ~26B con licencia Apache 2.0, pensada para despliegue local en hardware de consumo mediante un runtime optimizado. El repositorio ocupa 92,8 GB, lo que sugiere la presencia de multiples niveles de cuantizacion, y acumula 1.806 descargas desde su publicacion el 20 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con 128 expertos, basada en Gemma-4 (segun etiquetas) |
| Parametros totales | 25.971.339.550 (~26B) |
| Parametros activos | ~4B por token (sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con esquema IQK / trellis-quant, calibracion imatrix v3, MaxOptima (multiples niveles en el repo) |
| Idiomas soportados | Ingles (segun etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capa Mixture-of-Experts de 128 expertos y activacion dispersa de aproximadamente 4B parametros por token sobre un total de ~26B. Segun las etiquetas del repositorio, la arquitectura subyacente pertenece a la familia Gemma-4. El modelo no ha sido entrenado desde cero por el autor de esta ficha: es el resultado de una fusion (merge) de modelos previos mediante mergekit y mergekit-exp, empleando los metodos Della, Karcher y NearSwap en un esquema de multi-fusion. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica principal de esta publicacion concreta reside en la cuantizacion: se ha aplicado el esquema IQK de ik_llama.cpp con trellis-quant, calibracion imatrix v3 y el metodo propietario MaxOptima del autor, optimizado para preservar la calidad del modelo original en el menor tamano posible. Al tratarse de un MoE, la cuantizacion debe manejar los 128 expertos de forma uniforme, lo que explica el gran tamano del repositorio (92,8 GB) al contener varios niveles de cuantizacion. No se documentan innovaciones de decodificacion especulativa ni atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y narrativo, con enfasis declarado en escritura creativa, roleplay y narrativa oscura.
- Capacidades multimodales de vision: el pipeline es image-text-to-text, por lo que acepta imagenes como entrada junto con texto.
- Generacion de contenido NSFW y tematico adulto (etiqueta `not-for-all-audiences`).
- Razonamiento multi-turno en conversaciones (etiqueta `conversational`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma; no se declaran otros idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de codigo y matematicas: no documentadas especificamente.

## Casos de uso

- Escritura creativa asistida: el modelo esta afinado para narrativa y prosa creativa, por lo que puede emplearse para generar borradores de relatos, desarrollar personajes y mantener coherencia estilistica en textos largos, aprovechando su naturaleza conversacional multi-turno.
- Roleplay y ficcion interactiva: su entrenamiento orientado a roleplay y narrativa oscura lo hace adecuado para motores de ficcion interactiva y chatbots de personajes, donde el tono y la consistencia de voz son criticos.
- Generacion de contenido para videojuegos narrativos: puede integrarse en pipelines de generacion de dialogos ramificados y descripciones de escenas para juegos de rol, con la ventaja de ejecutarse localmente gracias a la cuantizacion GGUF.
- Analisis de imagenes con descripcion narrativa: al ser image-text-to-text, permite generar descripciones detalladas y estilizadas de imagenes, util en herramientas de accesibilidad creativa o generacion de subtitulos narrativos.
- Prototipado local en estaciones de trabajo: la cuantizacion IQK optimizada permite desplegar un MoE de 26B en hardware de consumo mediante ik_llama.cpp, lo que facilita experimentacion sin depender de APIs en la nube.
- Investigacion sobre fusion de modelos: al ser un merge documentado con tecnicas Della, Karcher y NearSwap, sirve como caso de estudio para investigadores que analizan el efecto de distintas estrategias de fusion en modelos MoE multimodales.
- Generacion de contenido para audiencias adultas: el modelo admite contenido NSFW, por lo que puede emplearse en plataformas de ficcion para adultos con las salvaguardas legales y de moderacion correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del nivel de cuantizacion elegido dentro del repositorio (92,8 GB totales). Para un modelo de ~26B en cuantizaciones de 4 bits, se estima un rango orientativo de 15-18 GB, aunque no se dispone de cifras oficiales por nivel en la informacion proporcionada.
- GPU recomendadas: no disponibles de forma oficial. Por tamano, una RTX 4090 (24 GB) o superior seria el minimo razonable para cuantizaciones de 4 bits; para cuantizaciones mayores se requeririan A100, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: probablemente en RTX 4090 y GPUs con 24 GB o mas para los niveles de cuantizacion mas bajos; no confirmado oficialmente.
- Opciones de despliegue: ik_llama.cpp es el runtime objetivo declarado; no se garantiza compatibilidad con llama.cpp estandar, Ollama, vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Goetia-26B-A4B-v1.7 (esta ficha) | ~26B | ~4B | no disponible | Apache 2.0 | GGUF (ik_llama.cpp) |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-32B | ~32,5B | denso | 128K | Apache 2.0 | safetensors, GGUF |
| Gemma-2-27B | ~27B | denso | 8K | Gemma license | safetensors, GGUF |

La comparativa es orientativa por tamano y categoria; no se dispone de datos de rendimiento del modelo Goetia para contrastar con estas alternativas.

## Limitaciones y advertencias

- Contenido NSFW y etiqueta `not-for-all-audiences`: el modelo puede generar material adulto o sensible, lo que exige moderacion y cumplimiento legal en despliegues publicos.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual; al ser un modelo orientado a ficcion, la precision factual no es su objetivo principal.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con requisitos de contexto largo.
- Compatibilidad de runtime: la cuantizacion IQK esta disenada para ik_llama.cpp; puede no cargar en llama.cpp estandar ni en otros runtimes, limitando la portabilidad.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado y el modelo base fusionado pueden arrastrar obligaciones o restricciones adicionales de los modelos de origen no documentadas en esta ficha.
- Origen por fusion: al ser un merge de modelos, puede heredar sesgos y comportamientos inconsistentes de los componentes originales; no se documentan evaluaciones de sesgo.
- Ausencia de benchmarks: no hay datos publicados que permitan validar calidad, por lo que cualquier evaluacion en produccion requiere pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Austriani/Goetia-26B-A4B-v1.7-ik_llama.cpp
- Modelo base: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.7
- ik_llama.cpp (repositorio del runtime): no disponible en la informacion proporcionada
- mergekit (herramienta de fusion): no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible en la informacion proporcionada
