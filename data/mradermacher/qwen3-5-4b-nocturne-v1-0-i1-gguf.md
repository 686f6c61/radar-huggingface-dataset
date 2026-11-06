# mradermacher/Qwen3.5-4B-Nocturne-v1.0-i1-GGUF

## Resumen

Qwen3.5-4B-Nocturne-v1.0-i1-GGUF es una cuantizacion en formato GGUF del modelo ajustado por instrucciones khang272/Qwen3.5-4B-Nocturne-v1.0, publicada por el usuario mradermacher. El modelo base parte de la familia Qwen3.5 en su variante de 4B de parametros y ha sido afinado mediante SFT sobre un conjunto de datasets orientados a roleplay, escritura creativa y conversacion multirround. Esta version concreta no es un modelo nuevo, sino una conversion a GGUF con cuantizaciones ponderadas e imatrix, pensada para su ejecucion en hardware de consumo mediante llama.cpp y entornos compatibles.

La relevancia de esta publicacion reside en que pone a disposicion de la comunidad una version ejecutable localmente de un modelo especializado en generacion creativa y dialogo de personajes, un nicho con demanda creciente en herramientas como SillyTavern. El autor del modelo base no ha publicado detalles tecnicos sobre la arquitectura interna, y la informacion disponible en la model card es minima, limitandose a listar los datasets de entrenamiento y la licencia.

El repositorio presenta un tamano de 0.0 GB y cero descargas en el momento de la consulta, lo que sugiere una publicacion muy reciente o un problema de sincronizacion de metadatos. El dato de parametros totales reportado en safetensors (1.797.272) resulta inconsistente con la denominacion "4B" del modelo, por lo que debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 4B segun denominacion; 1.797.272 reportados en safetensors (dato inconsistente, ver limitaciones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_NL, IQ4_XS, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M (segun metadatos de la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones ponderadas e imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base khang272/Qwen3.5-4B-Nocturne-v1.0 es un ajuste por instrucciones (SFT) sobre la familia Qwen3.5 de 4B parametros. No se dispone de informacion publica sobre la arquitectura interna concreta (numero de capas, dimensiones de atencion, tipo de atencion, uso de MoE o mecanismos hibridos), mas alla de que se trata de un transformer de la familia Qwen3.5. Tampoco se documenta el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

El ajuste se realizo sobre seis datasets publicos: Gryphe/Sonnet3.5-Charcard-Roleplay (roleplay con fichas de personaje), Dampfinchen/Creative_Writing_Multiturn (escritura creativa multirround), anthracite-org/nopm_claude_writing_fixed (escritura estilo Claude), lemon07r/VellumK2T-Fiction-SFT-01 (ficcion), anthracite-org/Stheno-Data-Filtered (datos filtrados) y LDJnr/Capybara (conversacion general). Esta composicion indica un enfasis claro en escritura creativa, ficcion y dialogo de personajes, con una capa de conversacion general aportada por Capybara.

La contribucion tecnica de esta publicacion es la cuantizacion: mradermacher genera cuantizaciones ponderadas e imatrix (version 2 del formato de cuantizacion, con tensor quantised), lo que mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas. La model card menciona que el modelo base es un modelo de vision y que los ficheros mmproj, si existen, estarian en el repositorio estatico asociado.

## Capacidades

- Generacion de texto conversacional y narrativo en ingles, con enfasis en roleplay y ficcion.
- Escritura creativa multirround: continuacion de historias, descripciones y dialogos de personaje.
- Conversacion general multi-turno, gracias a la inclusion del dataset Capybara.
- Soporte de fichas de personaje (character cards), orientado a herramientas como SillyTavern.
- Capacidad potencial de vision, segun la nota de la model card sobre mmproj (no confirmada para esta version GGUF).
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking: no disponible.

## Casos de uso

- Roleplay conversacional local: el modelo puede gestionar dialogos de personaje multi-turno en ingles, manteniendo la ficha de personaje en el contexto, y su formato GGUF permite ejecutarlo en un portatil con GPU de consumo mediante llama.cpp o Ollama.
- Escritura de ficcion asistida: adecuado para generar borradores de escenas, dialogos y descripciones narrativas, dado su entrenamiento sobre datasets de ficcion y escritura creativa multirround.
- Frontend de SillyTavern: integrable como backend local en instalaciones de SillyTavern, con las cuantizaciones Q4_K_M o Q5_K_M como equilibrio entre calidad y requisitos de VRAM.
- Prototipado de narrativa interactiva: util para desarrolladores que construyen aventuras de texto o videojuegos narrativos y necesitan un modelo ligero que quepa en una sola GPU de consumo.
- Generacion de personajes y tramas: el ajuste sobre Sonnet3.5-Charcard-Roleplay y Stheno-Data-Filtered lo hace apropiado para tareas de creacion de fichas de personaje y tramas coherentes en ingles.
- Experimentacion academica con cuantizaciones: las versiones imatrix permiten estudiar la degradacion de calidad en funcion del nivel de cuantizacion en un modelo de 4B, con una matriz de cuantizaciones amplia disponible.
- Despliegue en entornos sin conectividad: al ser GGUF y ejecutable en CPU o GPU de consumo, sirve para demos offline de generacion creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 4B, aproximada): Q2_K ~2 GB, Q3_K_M ~2.5 GB, Q4_K_M ~3 GB, Q5_K_M ~3.5 GB, Q6_K ~4 GB, Q8 equivalente no listado. Estas cifras son estimaciones basadas en el tamano del modelo y no en mediciones publicadas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para cuantizaciones altas con contexto largo; A100 o H100 no necesarias para un modelo de este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas de VRAM para cuantizaciones Q4 y Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Nocturne-v1.0-i1-GGUF (este) | 4B (denominacion) | no disponible | Roleplay y escritura creativa | Apache 2.0 | GGUF en HF |
| mradermacher/Qwen3.5-4B-Salieri-i1-GGUF | 4B (denominacion) | no disponible | Codigo, agentes, tool calling | Apache 2.0 | GGUF en HF |
| mradermacher/Qwen3.5-4B-DeepThought-STEM-i1-GGUF | 4B (denominacion) | no disponible | Razonamiento STEM y matematicas | Apache 2.0 | GGUF en HF |

Los tres modelos comparten la misma base Qwen3.5-4B y el mismo proceso de cuantizacion de mradermacher, diferenciandose unicamente por el ajuste fino: Nocturne para creatividad y roleplay, Salieri para codigo y agentes, y DeepThought-STEM para razonamiento cientifico. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Inconsistencia en el numero de parametros: el dato de safetensors (1.797.272) no concuerda con la denominacion "4B" del modelo; probablemente se refiere a un tensor concreto o a un error de metadatos, por lo que no debe usarse para estimar requisitos de hardware.
- Idioma limitado al ingles: no se declaran capacidades multilingues, por lo que el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, especialmente en tareas de ficcion donde la coherencia factual no es el objetivo.
- Sesgos: no documentados por el autor; los datasets de roleplay y ficcion pueden introducir sesgos de estilo y contenido.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datasets de entrenamiento pueden tener sus propias condiciones que conviene verificar.
- Modelo especializado: su ajuste en creatividad y roleplay puede degradar el rendimiento en tareas de codigo, matematicas o razonamiento tecnico.
- Contexto no documentado: se desconoce la longitud de contexto soportada, lo que limita la planificacion de despliegues con conversaciones largas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- La nota sobre vision (mmproj) no esta confirmada para esta version GGUF y podria no estar disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-Nocturne-v1.0-i1-GGUF
- Modelo base: https://huggingface.co/khang272/Qwen3.5-4B-Nocturne-v1.0
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.5-4B-Nocturne-v1.0-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-Nocturne-v1.0-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
