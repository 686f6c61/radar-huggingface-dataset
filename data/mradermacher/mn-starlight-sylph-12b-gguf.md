# mradermacher/MN-Starlight-Sylph-12B-GGUF

## Resumen

MN-Starlight-Sylph-12B es un modelo de lenguaje de 12.247.782.400 parametros desarrollado por EldritchLabs y publicado bajo licencia Apache 2.0. Esta version concreta, MN-Starlight-Sylph-12B-GGUF, es una cuantizacion en formato GGUF creada por mradermacher para facilitar la ejecucion en hardware con recursos limitados.

El modelo esta orientado a tareas de escritura creativa, ficcion, roleplay y narracion de historias, tal como indican sus etiquetas (writing, fiction, RP, storytelling, etc.). Se trata de un modelo de mezcla (merge) construido con mergekit y DELLA sobre la familia Mistral-NeMo, aunque no se han proporcionado detalles sobre su arquitectura interna ni su longitud de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral-NeMo, segun etiquetas) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base MN-Starlight-Sylph-12B es un modelo de lenguaje de 12B parametros que, segun las etiquetas, pertenece a la familia Mistral-NeMo. No se ha publicado informacion sobre la arquitectura exacta (numero de capas, dimensiones, tipo de atencion) ni sobre los datos de entrenamiento. El modelo original se ha construido mediante una mezcla (merge) con las herramientas mergekit y DELLA, aunque no se detallan los modelos componentes ni el proceso exacto.

La version GGUF es una cuantizacion estatica realizada por mradermacher, que convierte los pesos del modelo original (en safetensors) al formato GGUF para su uso con llama.cpp y herramientas compatibles. La cuantizacion reduce el tamano del modelo y el consumo de memoria, pero puede introducir una perdida de calidad que depende del tipo de cuantizacion elegido.

## Capacidades

- Escritura creativa y ficcion: generacion de historias, tramas, subtramas, escenas y personajes en ingles.
- Roleplay y juegos de aventura: conversacion interactiva y mantenimiento de personajes en escenarios ficticios.
- Narracion y storytelling: continuacion de escenas, desarrollo de mundos y prosa descriptiva.
- Generacion de dialogos: conversaciones naturales con tono coloquial, incluyendo lenguaje soez.
- Soporte multigenero: ciencia ficcion, romance, fantasia y otros generos.
- No se ha encontrado informacion sobre soporte de tool calling, agentes, vision o audio en la documentacion disponible.

## Casos de uso

- Escritura de novelas y relatos: el modelo puede generar capitulos completos, dialogos y descripciones, manteniendo coherencia narrativa a lo largo del texto.
- Roleplay por texto: adecuado para juegos de rol conversacionales donde el usuario interactua con personajes ficticios, gracias a su capacidad para mantener el tono y el estilo.
- Continuacion de escenas: util para escritores que necesitan sugerencias para seguir una historia o expandir un fragmento existente.
- Generacion de tramas y subtramas: puede proponer ideas argumentales, giros y estructuras narrativas para proyectos de ficcion.
- Creacion de contenido para juegos de aventura: en juegos de texto o aventuras interactivas, puede generar descripciones de entornos y respuestas a las acciones del jugador.
- Asistencia en guiones y dialogo: puede producir dialogos realistas y expresivos para guiones de cine, teatro o series.
- Prototipado de personajes: puede generar perfiles de personajes, historias de fondo y rasgos de personalidad para desarrollo creativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamano del archivo GGUF, se necesitan aproximadamente entre 5 GB (Q2_K) y 13 GB (Q8_0) de VRAM para cargar los pesos, mas el overhead de contexto y activaciones. Para Q4_K_S (7.2 GB) se recomienda una GPU con al menos 8-10 GB de VRAM.
- GPU recomendadas: para Q4_K_S o Q4_K_M, una RTX 4060 Ti de 16 GB o superior es adecuada. Para Q8_0, se recomienda una GPU con 16 GB o mas (por ejemplo, RTX 4080 o A100).
- Si cabe en consumer GPU: si, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de consumo con 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (con soporte GGUF), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MN-Starlight-Sylph-12B-GGUF | 12.247.782.400 | No disponible | Apache 2.0 | HuggingFace |
| Starlight-V3-12B-GGUF | No disponible | No disponible | No disponible | HuggingFace |
| MN-12B-Starcannon-v1-i1-GGUF | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser un modelo de escritura creativa, puede reflejar sesgos presentes en sus datos de entrenamiento, pero no se han documentado.
- Riesgo de alucinacion: no disponible. Los modelos de lenguaje generativo pueden producir contenido inventado o incoherente, especialmente en tareas creativas.
- Limitaciones de contexto o idioma: solo soporta ingles; la longitud de contexto no se ha publicado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y distribucion, siempre que se mantengan los avisos de licencia y copyright.
- Caveat importante: la cuantizacion GGUF puede degradar la calidad del modelo en comparacion con los pesos originales en safetensors. Los quants mas agresivos (Q2_K, Q3_K_M) presentan una calidad inferior, mientras que Q4_K_S y Q4_K_M son los recomendados por su equilibrio entre tamano y calidad. Ademas, al ser un modelo de mezcla (merge), su comportamiento puede ser menos predecible que un modelo entrenado desde cero.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mradermacher/MN-Starlight-Sylph-12B-GGUF
- Modelo base: https://huggingface.co/EldritchLabs/MN-Starlight-Sylph-12B
- Quants con imatrix: https://huggingface.co/mradermacher/MN-Starlight-Sylph-12B-i1-GGUF
- Otros modelos GGUF de 12B del mismo autor: https://huggingface.co/mradermacher/Starlight-V3-12B-GGUF y https://huggingface.co/mradermacher/MN-12B-Starcannon-v1-i1-GGUF
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Pagina de modelo de mradermacher: https://hf.tst.eu/model#MN-Starlight-Sylph-12B-GGUF
