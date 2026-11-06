# mradermacher/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1006-GGUF

## Resumen

Qwen3-4B-Fiction-On-Fire-Series-7-Model-1006-GGUF es la distribucion en formato GGUF del modelo DavidAU/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1006, un fine-tune orientado a escritura creativa, generacion de ficcion, tramas y roleplay construido sobre la base de Qwen3-4B. El empaquetado y la cuantizacion los realiza mradermacher, un publicador habitual de versiones GGUF de modelos open source, que ofrece aqui un abanico de cuantizaciones estaticas desde Q2_K hasta f16.

El modelo resuelve el problema de generar prosa vivida y coherente en contextos narrativos largos (ficcion, continuacion de escenas, generacion de subtramas, roleplay con personajes), una tarea donde los modelos genericos suelen producir texto plano o inconsistente. Al estar basado en Qwen3-4B, hereda la arquitectura transformer decoder-only de la familia Qwen3 con aproximadamente 4.022 millones de parametros, lo que lo hace desplegable en hardware de consumo.

Su relevancia actual radica en que combina un tamano contenido (4B) con cuantizaciones que caben en GPUs consumer y en CPU, y una licencia Apache 2.0 que permite uso comercial. El repo GGUF ocupa 36,4 GB en total por acumulacion de todas las variantes, pero cada archivo individual va de 1,8 GB (Q2_K) a 8,2 GB (f16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, fr, zh, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Modelo base | DavidAU/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1006 |
| Cuantizador | mradermacher |
| Tipo de pesos originales | bfloat16 |
| Tamano del repo | 36,4 GB (todas las variantes) |

## Arquitectura y entrenamiento

El modelo es un fine-tune (etiquetado como finetune y merge en los tags) sobre Qwen3-4B, un transformer decoder-only denso de aproximadamente 4.000 millones de parametros. La model card del repo GGUF no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible en la documentacion proporcionada. Los tags indican que el ajuste esta orientado a escritura creativa, generacion de tramas y subtramas, continuacion de escenas, narracion, ciencia ficcion, romance, terror y roleplay, con enfasis en prosa vivida.

No se documentan innovaciones tecnicas especificas del fine-tune (como decodificacion especulativa o atencion lineal) mas alla de las que aporta la arquitectura Qwen3 subyacente. El trabajo de mradermacher se limita a la conversion a GGUF y a la generacion de cuantizaciones estaticas; existe una version con cuantizaciones ponderadas/imatrix publicada en un repo separado (ver enlaces). Las cuantizaciones IQ (como IQ4_XS) suelen ofrecer mejor relacion calidad/tamano que las Q equivalentes, segun las notas del propio autor.

## Capacidades

- Generacion de texto narrativo y prosa vivida en multiples generos: ciencia ficcion, romance, terror, ficcion general.
- Generacion de tramas y subtramas, continuacion de escenas y desarrollo de historias.
- Roleplay conversacional (tags rp, roleplaying, conversational) con personajes y dialogos.
- Capacidades multilingues limitadas a en, fr, zh y de segun la model card.
- Escritura creativa con registro explicito (tag swearing), adecuada para ficcion adulta o dialogos crudos.
- Al heredar Qwen3-4B, conserva las capacidades generales del modelo base (razonamiento, codigo, matematicas), aunque el fine-tune puede haberlas desplazado hacia la escritura.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado para este fine-tune.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de ficcion por capitulos: el modelo puede continuar escenas manteniendo tono y estilo gracias a su ajuste especifico en narrativa; util para autores que necesitan borradores rapidos o desbloqueo creativo.
- Roleplay con personajes en aplicaciones de entretenimiento: sus tags de rp y conversational lo orientan a dialogos in-character, con registro flexible (incluido lenguaje soez).
- Generacion de subtramas para guiones o novelas: a partir de una premisa, produce lineas argumentales secundarias coherentes con el genero elegido.
- Asistencia a escritores en talleres literarios: continuacion de escenas, reescritura con prosa mas vivida o generacion de variantes de un mismo pasaje.
- Prototipado de videojuegos narrativos: generacion dinamica de dialogos y descripciones para motores de aventura conversacional o RPG, desplegable en local por su tamano reducido.
- Creacion de contenido de ficcion para comunidades y plataformas: historias cortas, fan fiction o seriales, con la ventaja de que la licencia Apache 2.0 permite uso comercial del texto generado.
- Despliegue en local para escritura privada: al caber en GPUs consumer y en CPU con cuantizaciones Q4, permite trabajar con material confidencial sin enviar prompts a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~1,8 GB; Q4_K_M ~2,6 GB; Q5_K_M ~3,0 GB; Q6_K ~3,4 GB; Q8_0 ~4,4 GB; f16 ~8,2 GB.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM puede ejecutar Q4_K_M o Q5_K_M con contexto moderado; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 permiten cuantizaciones altas y contextos amplios; A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente toda la gama moderna (GTX 1660 6 GB en adelante con cuantizaciones bajas; RTX 3060 12 GB o superior con Q5/Q6/Q8).
- Tambien ejecutable en CPU via llama.cpp con cuantizaciones Q4 o inferiores, a velocidades de pocos tokens por segundo segun hardware.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (koboldcpp, etc.). vLLM y TGI no soportan GGUF de forma nativa generalizada; para esos backends habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-4B-Fiction-On-Fire-Series-7-Model-1006 (este) | ~4B | no disponible | Ficcion y roleplay | Apache 2.0 | GGUF |
| Qwen3-4B (base) | ~4B | no disponible | Proposito general | Apache 2.0 | safetensors, GGUF |
| Modelos de ficcion de 7B-8B (p. ej. fine-tunes sobre Mistral/Llama) | 7-8B | variable | Ficcion y roleplay | variable | GGUF, safetensors |

La comparativa detallada con alternativas concretas de la misma categoria no esta disponible en la informacion proporcionada; los fine-tunes de ficcion comparables dependen del ecosistema y no se documentan aqui con datos verificables.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al ser un fine-tune de ficcion, puede reproducir estereotipos de genero, culturales o de personaje presentes en los datos de entrenamiento.
- Riesgo de alucinacion: alto en tareas factuales; el modelo esta optimizado para ficcion, no para precision factual, por lo que no es adecuado como fuente de datos verificados.
- Limitaciones de contexto o idioma: solo se declaran en, fr, zh y de; el rendimiento en castellano no esta garantizado ni documentado. La longitud de contexto no se especifica en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base DavidAU y de Qwen3-4B, ya que el fine-tune hereda condiciones.
- Contenido explicito: el tag swearing indica que el modelo puede generar lenguaje soez; requiere filtrado o moderacion en productos dirigidos a publico general.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad de prosa; para escritura creativa se recomienda Q4_K_M o superior.
- No hay datos publicados de benchmarks que permitan validar su calidad frente a alternativas.

## Enlaces

- Repo GGUF en Hugging Face: https://huggingface.co/mradermacher/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1006-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1006
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1006-i1-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#Qwen3-4B-Fiction-On-Fire-Series-7-Model-1006-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
