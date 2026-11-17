# izagami/Shikigami-594B-A17B-GGUF

## Resumen

Shikigami-594B-A17B-GGUF es una cuantización en formato GGUF del modelo multimodal Inkling 2 Small de Thinking Machines, un transformer disperso (MoE) con 594.000 millones de parámetros totales y 17.000 millones activos por token. La cuantización la publica el usuario independiente izagami y no constituye una distribución oficial de Thinking Machines: los pesos son un derivado bajo licencia Apache 2.0 y los únicos cambios introducidos son la cuantización descrita y el nombre.

El interés técnico del modelo reside en el método de compresión empleado: los expertos enrutados se almacenan mediante cuantización vectorial residual (RVQ), con cada grupo de 8 pesos consecutivos codificado como un código de 16 bits formado por dos índices de 8 bits sobre dos codebooks de 256 vectores de 8 dimensiones, lo que arroja 2,0 bits por peso más las ganancias por fila. Se ofrecen dos variantes: RVQ2, de 152,9 GB, que conserva los 384 expertos de cada capa a ancho completo, y RVQ1, de 84,2 GB, que poda los expertos menos usados y estrecha los restantes hasta anchos de 2304, 1728, 1152 y 576.

La relevancia práctica es limitada pero específica: estos ficheros no son tipos de cuantización de llama.cpp (los tensores de experto son de tipo GGUF 150, `RVQ2X8`), por lo que llama.cpp, Ollama, LM Studio y Unsloth no pueden cargarlos. Solo funcionan con la rama `b70-local` de XeStrata, un motor SYCL orientado a GPU Intel Arc, lo que restringe el despliegue a hardware muy concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base Inkling 2 Small); vision tower ViT de 23 capas |
| Parametros totales | 594B |
| Parametros activos | 17B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | RVQ2 (~2,0 bits por peso, 152,9 GB), RVQ1 (~1,2 bits por peso, 84,2 GB); atencion, embeddings y cabeza de salida en Q6_K; router en F32; vision tower en BF16 sin cuantizar |
| Idiomas soportados | no disponible (la model card incluye evaluacion en ingles y japones, pero no declara lista oficial de idiomas) |
| Licencia | Apache 2.0 (sujeta ademas a la Acceptable Use Policy de Thinking Machines) |
| Formato de pesos | GGUF dividido en shards (4 ficheros para RVQ1, 10 para RVQ2); `mmproj-BF16.gguf` para vision |
| Expertos | 384 enrutados, top-8 por token |
| Tamano del repo | 30,9 GB (carga en curso en el momento de la consulta) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 384 expertos enrutados y seleccion de top-8 por token, lo que da 594B de parametros totales con 17B activos. Incorpora una torre de vision (ViT de 23 capas) con su proyector, lo que habilita la entrada de imagen y texto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

La innovacion de esta publicacion no esta en el entrenamiento sino en la compresion. Los expertos enrutados se codifican con RVQ2X8: cada 8 pesos consecutivos de una fila forman un codigo de 16 bits compuesto por dos indices de 8 bits sobre dos codebooks de 256 vectores de 8 dimensiones (un par de codebooks por capa), sumados y multiplicados por una ganancia FP16 por fila. Los codigos se eligieron para minimizar el error de salida de cada experto frente al original sobre activaciones de calibracion. En RVQ1, ademas, se eliminan por capa los expertos menos usados y se estrechan otros, recortando el router a los expertos conservados, con el criterio de minimizar el error de salida para el tamano resultante.

## Capacidades

- Generacion de texto y razonamiento en conversaciones multi-turno.
- Entrada multimodal de imagen y texto: lectura de dibujos, recibos y documentos visuales mediante la torre ViT.
- Uso de herramientas (tool calling) en formato OpenAI, incluida la comprobacion manual de llamadas paralelas.
- Flujos agenticos y razonamiento multi-paso, con calidad cercana al original en RVQ2 (KL de 0,038 en texto agentico).
- Generacion de codigo, con buen comportamiento medido (KL de 0,020 en RVQ2 sobre texto de codigo).
- Generacion de artefactos largos: resumenes de 5.000 tokens, SVG extensos y escenas three.js.
- Capacidad multilingue verificada manualmente en japones (QA factual) e ingles, sin lista oficial de idiomas publicada.

## Casos de uso

- Agentes con tool calling en produccion: el modelo soporta llamadas paralelas en formato OpenAI y mantiene una divergencia baja frente al original en texto agentico (KL 0,038 en RVQ2), lo que lo hace apto para orquestacion de herramientas siempre que se disponga de hardware Intel Arc.
- Analisis de documentos con imagen: la torre de vision y el codificador `ink2_vision.py` permiten procesar recibos, dibujos y capturas, tokenizando cada celda de 40 x 40 pixeles, util para digitalizacion de facturas o extraccion de datos de formularios.
- Generacion de codigo en pipelines internos: con KL de 0,020 en RVQ2 sobre texto de codigo y soporte de tool calling, puede integrarse en tareas de autocompletado, generacion de tests o refactorizacion dentro de entornos con GPU Intel.
- Resumen de documentos largos: la verificacion manual de resumenes de 5.000 tokens indica capacidad para condensar actas, informes o transcripciones, aunque la longitud de contexto oficial no esta publicada.
- Generacion de contenido grafico programatico: la produccion de SVG largos y escenas three.js verificada por el autor encaja en herramientas de generacion de visualizaciones o prototipos web.
- Atencion al cliente multilingue con contexto visual: combinando entrada de imagen y texto en japones e ingles, puede gestionar consultas que incluyan capturas de pantalla o fotografias de productos.
- Experimentacion en cuantizacion extrema: como caso de estudio de RVQ aplicada a MoE de gran escala, sirve para investigar el equilibrio entre tasa de bits y fidelidad de la distribucion de siguiente token.

## Benchmarks y rendimiento

Divergencia KL de la distribucion de siguiente token frente al modelo original y coincidencia del token top-1 (evaluacion en BF16 sobre texto retenido):

| Texto | RVQ2 KL | RVQ2 top-1 | RVQ1 KL | RVQ1 top-1 |
|---|---|---|---|---|
| Agentico / uso de herramientas | 0,038 | 96,6% | 0,059 | 95,9% |
| Codigo | 0,020 | 96,5% | 0,050 | 94,9% |
| Ingles | 0,033 | 95,5% | 0,110 | 91,0% |
| Japones | 0,067 | 92,1% | 0,205 | 87,1% |
| Conocimiento (trivia) | 0,249 | 84,7% | 1,272 | 63,3% |

El propio autor advierte que estos valores de KL dependen fuertemente del texto y del procedimiento y no son comparables con los de otros publicadores. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

Rendimiento medido en 3x Intel Arc Pro B70 (32 GB cada una) y 89 GB de RAM de sistema, decodificacion greedy con prompts cortos:

| Variante | Expertos en VRAM | Decodificacion | Tiempo de carga |
|---|---|---|---|
| RVQ1 | Todos | 29,5 tokens/s | ~40 s |
| RVQ2 | ~59% (resto desde RAM fijada por PCIe) | 15,5 tokens/s | 40-60 s |

## Requisitos de hardware

- VRAM estimada: RVQ1 requiere 84,2 GB de pesos (caben completos en 3 GPU de 32 GB); RVQ2 requiere 152,9 GB, de los cuales solo alrededor del 59% de los expertos residen en VRAM y el resto se lee desde RAM fijada por PCIe.
- GPU recomendadas: el unico backend soportado es SYCL sobre GPU Intel Arc; el autor midio con 3x Intel Arc Pro B70 de 32 GB. No hay soporte documentado para A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; requiere multiples aceleradores Intel Arc profesionales y al menos 89 GB de RAM de sistema en la configuracion medida.
- Opciones de despliegue: exclusivamente la rama `b70-local` de XeStrata (compilacion segun `docs/BUILD.md`). llama.cpp, Ollama, LM Studio y Unsloth no pueden cargar estos ficheros por el tipo de tensor `RVQ2X8` (tipo GGUF 150).
- Comando de referencia: `strata --native RVQ2/Shikigami-594B-A17B-RVQ2-00001-of-00010.gguf --split-device 1,2 --layer-split 18,36 --eos-ids 200006 --max-t 1 --adapt-every 0`.
- Latencia y throughput: 29,5 tokens/s en RVQ1 y 15,5 tokens/s en RVQ2 en el hardware indicado; el procesamiento de imagen se ejecuta en CPU con NumPy mediante `tools/vision/ink2_vision.py`, con una celda de 40 x 40 pixeles por token y reescalado de imagenes de mas de 1024 celdas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Shikigami-594B-A17B RVQ2 | 594B | 17B | no disponible | GGUF RVQ2X8 | Apache 2.0 | Solo XeStrata (SYCL, Intel Arc) |
| Shikigami-594B-A17B RVQ1 | 594B (podado) | 17B | no disponible | GGUF RVQ2X8 | Apache 2.0 | Solo XeStrata (SYCL, Intel Arc) |
| Inkling 2 Small (original) | 594B | 17B | no disponible | no disponible | Apache 2.0 | Segun infraestructura del autor |
| Cuantizaciones GGUF convencionales de MoE de gran escala | variable | variable | variable | GGUF Q4_K_M, Q6_K, etc. | segun base | llama.cpp, Ollama, LM Studio |

La diferencia clave frente a las cuantizaciones GGUF convencionales es la incompatibilidad de formato: los tipos estandar de llama.cpp permiten desplegar en hardware heterogeneo, mientras que RVQ2X8 ata el modelo al motor XeStrata y a GPU Intel Arc. No se dispone de datos de benchmarks comparables con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es una publicacion oficial de Thinking Machines; los pesos son un derivado y el uso queda sujeto a su Acceptable Use Policy ademas de la licencia Apache 2.0.
- Incompatibilidad total con llama.cpp, Ollama, LM Studio y Unsloth: el tipo de tensor `RVQ2X8` (GGUF 150) no esta soportado por esas herramientas.
- Dependencia de un unico motor (rama `b70-local` de XeStrata) y de hardware Intel Arc con SYCL; no hay soporte para CUDA ni ROCm documentado.
- RVQ1 degrada gravemente el conocimiento factual: KL de 1,272 y top-1 del 63,3% en trivia, frente a 0,249 y 84,7% en RVQ2. El autor recomienda RVQ2 cuando importan los hechos.
- Riesgo de alucinacion y de errores factuales presente en el modelo base y amplificado en RVQ1 por la perdida de conocimiento.
- La longitud de contexto no esta publicada, lo que impide planificar cargas de trabajo con ventanas largas.
- No se declara una lista oficial de idiomas; la evaluacion se limita a ingles y japones.
- Los ficheros estaban en proceso de subida en el momento de la consulta; algunas partes pueden no estar disponibles todavia.
- El repo ocupa 30,9 GB, muy por debajo de los 84,2 GB y 152,9 GB que declaran las variantes, lo que confirma que la carga estaba incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/izagami/Shikigami-594B-A17B-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Motor XeStrata (rama b70-local): https://github.com/izagami/XeStrata/tree/b70-local
- Politica de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
