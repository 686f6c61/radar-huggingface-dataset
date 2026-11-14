# mradermacher/bloom-560m-GGUF

## Resumen

`mradermacher/bloom-560m-GGUF` es una cuantizacion en formato GGUF del modelo `bigscience/bloom-560m`, el checkpoint pequeno de la familia BLOOM desarrollada por BigScience (colaboracion abierta liderada por Hugging Face con participación de decenas de instituciones academicas e industriales). El trabajo de cuantizacion lo firma mradermacher, autor habitual de conversiones GGUF para llama.cpp, y se publico en febrero de 2025. El modelo base es un transformer decoder-only de tipo causal, con 816.115.712 parametros totales segun los pesos safetensors, entrenado originalmente en 46 idiomas naturales y 13 lenguajes de programacion.

La relevancia de esta ficha no esta en el modelo en si (BLOOM-560m es un modelo de 2022, ya superado en calidad por alternativas mas modernas del mismo tamano) sino en el empaquetado GGUF: permite ejecutar el modelo en CPU, en GPUs de gama baja e incluso en dispositivos embebidos con llama.cpp, Ollama o llama-cpp-python, sin necesidad de infraestructura de inferencia pesada. Es util como modelo de referencia para pruebas de pipelines, para tareas de generacion de texto de baja latencia en entornos con recursos limitados y como base para experimentos de fine-tuning ligero.

El contexto nativo del modelo base es de 2048 tokens, y la licencia es la BigScience BLOOM RAIL 1.0, que impone restricciones de uso comercial y de redistribucion que conviene revisar antes de desplegar en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (BLOOM) |
| Parametros totales | 816.115.712 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (heredado de BLOOM-560m) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | 46 idiomas naturales y 13 lenguajes de programacion (ak, ar, as, bm, bn, ca, code, en, es, eu, fon, fr, gu, hi, id, ig, ki, kn, lg, ln, ml, mr, ne, nso, ny, or, pa, pt, rn, rw, sn, st, sw, ta, te, tn, ts, tum, tw, ur, vi, wo, xh, yo, zh, zhs, zht, zu) |
| Licencia | bigscience-bloom-rail-1.0 |
| Formato de pesos | GGUF (multiples archivos por cuantizacion); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

El modelo base `bigscience/bloom-560m` es un transformer decoder-only autorregresivo con atencion causal estandar, normalizacion LayerNorm y embeddings ALiBi para posiciones. Forma parte de la familia BLOOM, entrenada por BigScience sobre el corpus ROOTS (aproximadamente 1,6 billones de tokens en 46 idiomas y 13 lenguajes de programacion), con un tokenizador byte-level BPE de 250.680 tokens. El entrenamiento se realizo en el cluster Jean Zay (Francia) y el modelo completo de 176B se publico en 2022; los checkpoints pequenos (560m, 1b1, 1b7, 3b, 7b1) se liberaron como versiones reducidas de la misma receta.

La cuantizacion GGUF la realiza mradermacher con las herramientas estandar de llama.cpp (convert_type hf, output_tensor_quantised 1), sin reentrenamiento ni calibracion adicional en la version estatica que nos ocupa. Existe una variante con imatrix (weighted quants) en `mradermacher/bloom-560m-i1-GGUF` para quienes necesiten mejor calidad en cuantizaciones bajas. El modelo no incluye RLHF ni DPO; es un modelo de lenguaje base, no un modelo de instrucciones, por lo que no responde bien a formatos de chat sin fine-tuning adicional.

## Capacidades

- Generacion de texto autoregresiva en 46 idiomas, con especial cobertura de ingles, frances, espanol, portugues, arabe, hindi, chino y lenguas africanas.
- Generacion de codigo en 13 lenguajes de programacion (el token `code` esta en la lista de idiomas del modelo base).
- Razonamiento basico y completado de texto; no es un modelo de instrucciones ni de chat.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso estructurado.
- No tiene modo thinking, vision ni audio.
- Capacidad multilingue amplia pero desigual: los idiomas con mas datos en ROOTS (en, fr, es, pt, zh, ar) rinden mejor que los de bajos recursos.
- Sirve como base para fine-tuning supervisado en tareas concretas (clasificacion, extraccion, resumen) cuando el presupuesto de computo es minimo.

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto: al pesar entre 0,5 y 1,7 GB segun cuantizacion, se puede cargar en un portatil o en una instancia CPU-only para validar integraciones con llama.cpp u Ollama antes de invertir en modelos mayores.
- Generacion de texto en dispositivos embebidos o edge: la version Q4_K_M (0,7 GB) cabe en Raspberry Pi 4/5 con 4 GB de RAM y permite generar texto offline en aplicaciones de kiosco, domotica o asistentes locales sin conexion.
- Filtrado y clasificacion de texto multilingue: con fine-tuning ligero sobre el checkpoint base se puede usar para etiquetado de idioma, deteccion de toxicidad o categorizacion de tickets en entornos con muchos idiomas, aprovechando su cobertura de 46 lenguas.
- Generacion de codigo asistida en entornos con restricciones: el modelo puede autocompletar snippets en Python, Java, C o JavaScript en un IDE local sin enviar codigo a la nube, util en entornos con requisitos de confidencialidad.
- Educacion e investigacion: sirve como modelo de referencia para comparar tecnicas de cuantizacion (Q2_K frente a Q8_0, estatico frente a imatrix) midiendo perplejidad y calidad de generacion en un modelo pequeno y bien documentado.
- Generacion de texto creativo de baja latencia: cuentos cortos, descripciones de producto o textos de relleno en aplicaciones donde el coste por token importa mas que la calidad puntera, con throughput alto en CPU.
- Base para experimentos de destilacion o fine-tuning con LoRA: al ser un modelo pequeno y con licencia abierta (con condiciones), es adecuado para ensenar a estudiantes o validar recetas de entrenamiento antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de mradermacher no incluye metricas de MMLU, HumanEval, GSM8K ni perplejidad para las cuantizaciones; solo enlaza a un grafico externo de ikawrakow sobre calidad relativa de tipos de cuantizacion, sin cifras concretas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (Q2_K) y 1,7 GB (f16) solo para los pesos; anade aproximadamente 0,2-0,5 GB para el contexto de 2048 tokens y buffers de llama.cpp.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, T4, L4). En A100/H100 el modelo esta infrautilizado; el cuello de botella sera el ancho de banda de memoria, no el computo.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos 10 anos, y tambien en CPU-only.
- Opciones de despliegue: llama.cpp (nativo), Ollama (mediante Modelfile), llama-cpp-python, LM Studio, text-generation-webui con backend llama.cpp, y servidores compatibles con la API de OpenAI mediante llama.cpp server (`endpoints_compatible` aparece en los tags del repo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. En la practica, con Q4_K_M en CPU moderna se esperan decenas de tokens por segundo; en GPU el modelo esta limitado por memoria y puede superar facilmente los cientos de tokens por segundo, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| bloom-560m-GGUF (este) | 816 M | 2048 | 46 + code | bigscience-bloom-rail-1.0 | Si (multiples quants) |
| bigscience/bloom-1b1 | 1,1 B | 2048 | 46 + code | bigscience-bloom-rail-1.0 | Si (via mradermacher y otros) |
| TinyLlama-1.1B | 1,1 B | 2048 | en (principalmente) | Apache 2.0 | Si |
| Qwen2.5-0.5B | 0,49 B | 32768 | multilingue (29+) | Apache 2.0 | Si |

Frente a TinyLlama y Qwen2.5-0.5B, el modelo de esta ficha pierde en calidad de generacion y en contexto, y su licencia es mas restrictiva; su ventaja es la cobertura idiomatica de 46 lenguas y su condicion de modelo de referencia historico bien documentado. No se dispone de comparativas de benchmarks publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no afinado para instrucciones: no sigue formatos de chat ni responde a preguntas directas sin prompting cuidadoso o fine-tuning.
- Riesgo alto de alucinacion en tareas factuales; el modelo no tiene mecanismos de verificacion ni de citacion de fuentes.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Calidad desigual entre idiomas: los de bajos recursos (fon, ki, lg, ln, nso, rn, rw, sn, st, tn, ts, tum, tw, wo, xh, yo, zu) tienen mucha menos representacion en ROOTS y produciran resultados pobres.
- La licencia BigScience BLOOM RAIL 1.0 impone restricciones de uso comercial y obligaciones de atribucion y de compartir la licencia en obras derivadas; revisar el texto completo antes de desplegar en produccion.
- Las cuantizaciones Q2_K y Q3_K_M degradan notablemente la calidad; para uso real se recomienda Q4_K_M o superior.
- No soporta tool calling, agentes ni razonamiento multi-paso; no es adecuado para automatizaciones que requieran llamadas a funciones.
- El repositorio pesa 8,0 GB en total por acumulacion de todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/bloom-560m-GGUF
- Modelo base: https://huggingface.co/bigscience/bloom-560m
- Variante con imatrix: https://huggingface.co/mradermacher/bloom-560m-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#bloom-560m-GGUF
- Repositorio de peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
