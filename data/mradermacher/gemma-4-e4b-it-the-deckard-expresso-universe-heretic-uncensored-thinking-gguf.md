# mradermacher/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking-GGUF

## Resumen

Esta ficha describe `mradermacher/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking-GGUF`, una redistribucion en formato GGUF del modelo `DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking`. El autor original es DavidAU, y el trabajo de cuantizacion lo firma mradermacher, conocido por publicar versiones estaticas e imatrix de modelos de la comunidad. El modelo parte de la familia Gemma 4 E4B (variante instruct) y anade un finetune orientado a escritura creativa, ficcion y roleplaying, con un proceso de "abliteration" o "heretic" que elimina los rechazos del modelo base.

El interes principal reside en su orientacion a generacion literaria sin restricciones de contenido y en la disponibilidad de hasta trece cuantizaciones GGUF distintas (desde Q2_K hasta f16), lo que permite ejecutarlo en hardware muy diverso, desde portatiles con GPU modesta hasta servidores con multiples aceleradores. Tambien incluye un proyector multimodal (`mmproj`) en precision Q8_0 y f16, lo que sugiere capacidad de entrada de imagenes heredada del modelo base, aunque la model card no detalla su funcionamiento.

El modelo declara 7.518.069.290 parametros en safetensors, un tamano que lo situa en la gama media y que, pese al nombre "E4B" del Gemma original, no debe confundirse con una variante MoE de parametros activos reducidos: la informacion disponible no confirma esa condicion. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, si bien conviene verificar la compatibilidad con la licencia del modelo Gemma subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 4 E4B; no se detalla en la model card) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la model card proporcionada. Por el nombre y la ascendencia, se trata de un transformer decoder-only de la familia Gemma 4, en su variante instruct, con 7.518.069.290 parametros totales segun los pesos en safetensors. El modelo base fue sometido a un finetune por parte de DavidAU con las etiquetas `heretic`, `uncensored` y `aliterated`, lo que indica un proceso de eliminacion de comportamientos de rechazo (abliteration) y un ajuste orientado a estilo literario. Tambien aparece la etiqueta `unsloth`, lo que sugiere que el entrenamiento se realizo con ese framework de optimizacion.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La presencia de `bfloat16` en las etiquetas indica que el modelo base se publico en esa precision. El trabajo de mradermacher es exclusivamente de cuantizacion: convierte los pesos a GGUF con `convert_type: hf` y `quantize_version: 2`, e incluye un proyector multimodal separado, lo que confirma que el modelo base conserva la torre de vision de Gemma.

## Capacidades

- Generacion de texto en ingles con enfasis en escritura creativa, ficcion, ciencia ficcion, romance y otros generos.
- Generacion de tramas y subtramas, continuacion de escenas y storytelling de formato largo.
- Roleplaying conversacional sin los rechazos tipicos de los modelos alineados.
- Prosa vivida y estilizada, segun las etiquetas `vivid prosing` y `vivid writing`.
- Capacidad de codigo declarada mediante la etiqueta `coder`, aunque sin benchmarks que la respalden.
- Entrada multimodal: el repositorio incluye proyectores `mmproj`, lo que indica soporte de imagenes heredado del modelo base.
- Modo "thinking" implicito en el nombre del modelo, sin documentacion sobre su funcionamiento.
- Conversacion multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- No se documenta soporte explicito de tool calling ni de razonamiento multi-paso con agentes.

## Casos de uso

- Escritura de ficcion por entregas: el modelo puede continuar escenas y mantener coherencia de personajes en conversaciones multi-turno, aprovechando su entrenamiento especifico en narrativa y su falta de rechazos ante tematicas adultas o violentas.
- Generacion de tramas y subtramas para guionistas: se le puede pedir un esquema de capitulos, giros argumentales o arcos secundarios, y luego expandir cada uno en una sesion separada, dado su enfoque en `plot generation` y `sub-plot generation`.
- Roleplaying y juegos de mesa narrativos: su condicion de modelo "uncensored" permite interpretar personajes con moral ambigua o situaciones conflictivas sin que el modelo rompa la escena con advertencias.
- Prototipado de asistentes creativos en local: al estar disponible en GGUF desde 4,5 GB (Q2_K) hasta 15,2 GB (f16), se puede desplegar en un portatil con GPU consumer para sesiones de escritura asistida sin conexion a la nube.
- Analisis de imagenes en flujos creativos: el proyector `mmproj` permite, en teoria, describir ilustraciones o portadas y generar texto a partir de ellas, util para generar sinopsis a partir de arte conceptual.
- Generacion de dialogos para videojuegos o narrativa interactiva: la combinacion de roleplaying y contexto conversacional permite integrarlo en motores de dialogo ramificado, siempre que se valide la salida por su tendencia a la alucinacion.
- Fine-tuning posterior o experimentacion academica: al ser Apache 2.0 y estar en GGUF, sirve como base para estudiar los efectos de la abliteration en modelos Gemma, comparando su comportamiento con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K ~4,5 GB; Q3_K_S ~4,8 GB; Q3_K_M ~5,0 GB; Q3_K_L ~5,1 GB; IQ4_XS ~5,2 GB; Q4_K_S ~5,3 GB; Q4_K_M ~5,4 GB; Q5_K_S ~5,8 GB; Q5_K_M ~5,9 GB; Q6_K ~6,3 GB; Q8_0 ~8,1 GB; f16 ~15,2 GB.
- Proyector multimodal adicional: 0,7 GB (Q8_0) o 1,1 GB (f16) si se usa entrada de imagenes.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4 a Q8 con contexto moderado; RTX 4090 24 GB para f16 o Q8_0 con contexto largo; A100 40/80 GB o H100 para despliegues concurrentes con vLLM o TGI.
- Cabe en GPU consumer: si, desde Q2_K en adelante en tarjetas de 6-8 GB (Q4_K_S en una GTX 1660 6 GB es ajustado; Q4_K_M en una RTX 3060 12 GB es holgado). La variante f16 requiere al menos 16 GB, por lo que solo cabe en RTX 4080/4090 o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp; para servidores, vLLM y TGI si se convierte a safetensors (el repo solo ofrece GGUF).
- Latencia y throughput: no disponibles. Como referencia cualitativa, el autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality", sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking (este) | 7.518 M | no disponible | Apache 2.0 | GGUF | Finetune creativo sin censura sobre Gemma 4 E4B |
| Gemma 4 E4B instruct (original de Google) | ~7.500 M (segun variante) | no disponible en esta ficha | Gemma Terms of Use | safetensors | Base alineada, con rechazos; requiere aceptar terminos |
| DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking | 7.518 M | no disponible | Apache 2.0 | safetensors, bfloat16 | Modelo base del que se derivan estas cuantizaciones |
| mradermacher/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking-i1-GGUF | 7.518 M | no disponible | Apache 2.0 | GGUF (imatrix) | Variante con cuantizacion ponderada, misma base |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles (`language: en`); su rendimiento en castellano no esta verificado y probablemente sea inferior.
- Al ser un finetune "uncensored" y "heretic", puede generar contenido violento, sexual o controvertido sin filtros; no es adecuado para aplicaciones dirigidas al publico general sin moderacion externa.
- Riesgo elevado de alucinacion en datos factuales, agravado por el enfoque creativo del finetune y la ausencia de benchmarks.
- No se documentan la longitud de contexto ni el comportamiento en conversaciones muy largas; el modelo base Gemma suele tener ventanas moderadas, pero no se confirma aqui.
- La licencia Apache 2.0 se declara en el repo, pero el modelo deriva de Gemma, cuyos terminos de uso originales pueden imponer restricciones adicionales; conviene revisarlos antes de un uso comercial.
- El nombre incluye "Thinking", pero no hay documentacion sobre un modo de razonamiento extendido ni sobre como activarlo.
- El repositorio pesa 76,9 GB en total por acumulacion de cuantizaciones; descargar solo el archivo GGUF necesario.
- El modelo tiene solo 982 descargas y 3 likes en el momento de la consulta, por lo que la validacion comunitaria es escasa.
- No hay garantia de soporte de tool calling ni de function calling; las etiquetas no lo mencionan.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking-GGUF
- Modelo base: https://huggingface.co/DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking
- Variante imatrix: https://huggingface.co/mradermacher/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking-GGUF
- README de referencia para GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
