# phuvey/romans-francais-19e-gpt

## Resumen

`phuvey/romans-francais-19e-gpt` es un modelo de lenguaje de 91,6 millones de parametros entrenado desde cero con nanoGPT por el autor independiente phuvey. Se trata de un GPT-2 puro (decoder-only, 12 capas, 12 cabezas, dimension 768) especializado en la continuacion de prosa francesa del siglo XIX, entrenado sobre un corpus de 1.029 novelas, cuentos y relatos de dominio publico extraidos de Project Gutenberg (Sand, Dumas, Verne, Maupassant, Zola, Balzac, entre otros).

El modelo no es un asistente conversacional ni responde a preguntas: su unica funcion es continuar texto en estilo decimononico, con gramatica, ortografia y puntuacion de epoca, dialogos marcados con guiones y vocabulario caracteristico. El autor lo presenta explicitamente como un proyecto pedagogico para ilustrar la cadena completa corpus → tokenizer → entrenamiento → publicacion.

Su relevancia es limitada en terminos de rendimiento absoluto, pero resulta util como referencia reproducible de entrenamiento de bajo coste (2 h 45 min en una unica NVIDIA L4) y como ejemplo de modelo de dominio muy estrecho. La licencia MIT y el formato de pesos abierto (safetensors en float32) facilitan su inspeccion y reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 decoder-only, 12 capas, 12 cabezas, dimension 768, sin sesgos |
| Parametros totales | 91.638.528 (91,6 M; 91,2 M excluyendo embeddings de posicion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan versiones GGUF ni cuantizadas) |
| Idiomas soportados | frances (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32); `lm_head.weight` ausente por weight tying con `transformer.wte.weight` |
| Vocabulario | 8.192 tokens BPE byte-level (libreria `tokenizers`) |
| Tokenizador | BPE byte-level entrenado sobre el corpus; separador de libros `<|endoftext|>` |
| Compatibilidad | no es formato `transformers`; requiere `model.py` de nanoGPT incluido en el repo |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2 sin sesgos, con 12 capas, 12 cabezas de atencion, dimension de modelo 768 y contexto maximo de 512 tokens. El tokenizador es un BPE byte-level de 8.192 tokens entrenado especificamente sobre el corpus, lo que reduce el vocabulario frente a GPT-2 estandar y lo adapta al frances literario del XIX.

El entrenamiento se realizo con nanoGPT sobre 117,8 M tokens de entrenamiento y 2,7 M de validacion, con separacion por libro para evitar filtraciones. Se dieron aproximadamente 4 pasadas sobre el corpus (~472 M tokens vistos), con lotes efectivos de 65.536 tokens (32 × 512 × 4 de acumulacion) durante 7.200 iteraciones. Se uso AdamW con learning rate 6e-4 → 6e-5 (coseno, 200 iteraciones de warmup), weight decay 0,1, β₂ 0,95, dropout 0,1, precision bfloat16 y `torch.compile`. El entrenamiento completo se ejecuto en una unica GPU NVIDIA L4 en Google Cloud en 2 h 45 min. La loss final en validacion fue de 2,90 (2,61 en entrenamiento), con checkpoint seleccionado en la iteracion 7.000. No se documenta RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto en frances con estilo, ortografia y puntuacion del siglo XIX.
- Continuacion de prosa literaria: dialogos con guiones, descripciones, titulos de capitulo y paratexto editorial (prefacios, notas, menciones de libreria).
- Coherencia local de pocas frases; el sentido se mantiene solo a corto plazo.
- Generacion de texto a partir de un prompt de arranque (no instrucciones ni preguntas).
- Inferencia en CPU viable (decenas de segundos para 300 tokens en un portatil antiguo).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Multilingue: no; exclusivamente frances.
- No responde a preguntas ni mantiene conversacion multi-turno.

## Casos de uso

- Generacion de pastiche literario: usar el modelo para producir continuaciones de novelas decimononicas en talleres de escritura creativa o ejercicios de estilo, aprovechando su dominio del registro y la puntuacion de epoca.
- Docencia sobre entrenamiento de LLM: el paquete completo (corpus, tokenizer, `model.py`, `generate.py`, config de entrenamiento) sirve para explicar de extremo a extremo como se construye un modelo de lenguaje desde cero en una sola GPU.
- Investigacion sobre memorizacion en modelos pequenos: con ~4 pasadas sobre el corpus y una brecha train/val de 0,3, es un caso de estudio controlado para medir memorizacion y contaminacion en corpus literarios pequenos.
- Generacion de datos sinteticos de estilo XIX: util para aumentar datasets de NLP historico con texto sintetico etiquetado como tal, por ejemplo para tareas de deteccion de autoria o de estilo.
- Experimentos de tokenizacion de dominio: el tokenizador BPE de 8.192 tokens entrenado sobre frances literario permite comparar eficiencia de tokenizacion frente a vocabularios generalistas en corpus historicos.
- Pruebas de despliegue de bajo coste: al ejecutarse en CPU y ocupar 0,4 GB, sirve para validar pipelines de inferencia ligeros, prototipos de demo o entornos con recursos muy limitados.
- Generacion de paratexto editorial ficticio: puede producir notas, titulos de capitulo o menciones de libreria de epoca para maquetas y proyectos editoriales de ambientacion historica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la loss de validacion final de 2,90 (perplejidad no indicada) y la loss de entrenamiento de 2,61, junto con el tiempo de entrenamiento (2 h 45 min en una NVIDIA L4).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (91,6 M parametros × 4 bytes ≈ 366 MB de pesos), mas overhead de activaciones para contexto de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entreno en una NVIDIA L4. Funciona en RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe holgadamente en GPU de consumo e incluso en CPU; el autor reporta decenas de segundos para 300 tokens en un portatil antiguo.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama en su formato actual; requiere el `model.py` y `generate.py` de nanoGPT incluidos en el repositorio, con `torch`, `safetensors`, `tokenizers` y `huggingface_hub`.
- Latencia y throughput: no disponibles de forma sistematica; el unico dato es el tiempo de generacion en CPU mencionado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| phuvey/romans-francais-19e-gpt | 91,6 M | 512 | Frances | MIT | safetensors (nanoGPT) | Entrenado desde cero sobre 1.029 novelas del XIX; solo continuacion de texto |
| GPT-2 small (OpenAI) | 124 M | 1.024 | Ingles (multilingue limitado) | MIT | safetensors / transformers | Modelo generalista; no especializado en frances del XIX |
| nanoGPT Shakespeare (Karpathy) | ~10-124 M segun config | 256-1.024 | Ingles | MIT | safetensors (nanoGPT) | Referencia pedagogica equivalente en ingles isabelino |
| Modelos franceses pequenos tipo DistilBERT/Llama pequenos | Variable | Variable | Frances | Variable | transformers | No comparables directamente: encoder o modelos instruidos, no generacion de estilo |

La comparacion directa con modelos generalistas no es significativa: este modelo no compite en conocimiento ni en seguimiento de instrucciones, sino en estilo literario de dominio muy concreto. Frente a GPT-2 small, ofrece un vocabulario mas eficiente para frances historico pero carece de capacidades generales.

## Limitaciones y advertencias

- Coherencia muy corta: los personajes cambian de nombre, la trama no avanza y aparecen contradicciones y repeticiones; es esperable para este tamano y corpus.
- Sin conocimientos fiables: inventa hechos; no debe usarse para responder preguntas factuales.
- Memorizacion parcial: el corpus se vio ~4 veces y la brecha train/val de 0,3 indica inicio de memorizacion; puede reproducir pasajes literales de las obras, que son de dominio publico pero no deben presentarse como originales sin verificacion.
- Sesgos historicos: el corpus refleja valores del siglo XIX, incluidos estereotipos coloniales, racistas, antisemitas, sexistas y de clase, que el modelo reproduce.
- Paratexto espurio: puede generar notas, titulos de capitulo y menciones editoriales heredadas del corpus.
- Restricciones de idioma: solo frances; no hay soporte multilingue ni traduccion.
- Restricciones de licencia: MIT permite uso comercial, pero la licencia no cubre posibles reclamaciones sobre el estilo o pasajes memorizados del corpus; el `model.py` es MIT © Andrej Karpathy.
- Caveat de produccion: no es un asistente, no soporta tool calling ni instrucciones, y su integracion requiere codigo nanoGPT personalizado en lugar de `transformers`, vLLM o TGI.
- El autor califica explicitamente el proyecto como pedagogico, no como producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phuvey/romans-francais-19e-gpt
- Dataset del corpus: https://huggingface.co/datasets/phuvey/romans-francais-19e
- Repositorio nanoGPT (Karpathy): https://github.com/karpathy/nanoGPT
- Project Gutenberg (fuente del corpus): https://www.gutenberg.org
