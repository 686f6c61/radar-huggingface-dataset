# nvidia/Nemotron-3.5-Embed-1B-BF16

## Resumen

Nemotron-3.5-Embed-1B-BF16 es un modelo de embeddings multimodal y multilingue desarrollado por NVIDIA, orientado a recuperacion de informacion (retrieval) para sistemas de pregunta-respuesta sobre corpus documentales. A diferencia de un modelo generativo, su entrada es texto, una imagen de pagina o una combinacion de ambas, y su salida es un vector de embedding de tamano fijo, lo que lo convierte en un bi-encoder pensado para indexar y consultar bases de datos vectoriales.

El modelo combina un encoder de vision Pixtral, inicializado a partir de mistralai/Ministral-3-3B-Instruct-2512-BF16, y un componente de lenguaje inicializado desde nvidia/Nemotron-3-Embed-1B-BF16. Con 1.554.710.528 parametros (1,55B) y una longitud de contexto de 32.768 tokens, esta disenado para embeber paginas de documento con texto, tablas, graficos e infografias, asi como fragmentos de texto plano.

Su relevancia actual radica en que cubre un hueco habitual en los pipelines de RAG: la recuperacion sobre documentos cuyo contenido no puede extraerse fielmente por OCR (tablas complejas, layout, figuras). Al compartir el mismo espacio de embeddings de texto que Nemotron-3-Embed-1B-BF16 y anadir capacidad de recuperacion visual, permite unificar busqueda textual y visual en una sola infraestructura. Se distribuye bajo licencia OpenMDW-1.1 y esta autorizado para uso comercial y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (bi-encoder multimodal); vision encoder Pixtral inicializado de Ministral-3-3B-Instruct-2512-BF16 y componente de lenguaje inicializado de Nemotron-3-Embed-1B-BF16 |
| Parametros totales | 1.554.710.528 (1,55B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | BF16 en este checkpoint; el autor publica una variante NVFP4 (nvidia/Nemotron-3.5-Embed-1B-NVFP4). No disponible mas detalle de otras cuantizaciones |
| Idiomas soportados | Multilingue. 34 idiomas evaluados para recuperacion de texto: ingles, arabe, assames, bengali, bulgaro, chino, danes, neerlandes, finlandes, frances, aleman, hindi, hinglish, indonesio, italiano, japones, coreano, malayo, marati, nepalí, noruego, persa, portugues, rumano, ruso, espanol, suajili, sueco, tamil, telugu, tailandes, ucraniano, urdu y vietnamita. 18 idiomas evaluados para recuperacion de imagen: arabe, bengali, chino, ingles, persa, finlandes, frances, aleman, hindi, indonesio, japones, coreano, ruso, espanol, suajili, telugu, tailandes y yoruba |
| Licencia | OpenMDW-1.1 (los modelos base Ministral estan bajo Apache 2.0) |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 3,1 GB |
| Entrada | Texto (string) e imagen (RGB); para consultas solo texto, para documentos imagen, texto o imagen + texto |
| Salida | Vector de embedding (1D por entrada) |
| Resolucion de imagen | longest_edge por defecto 1120 px, ampliable hasta 1540 px |
| Pipeline declarado | visual-document-retrieval |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

El modelo es un bi-encoder de arquitectura Transformer con dos componentes diferenciados. El encoder de vision procede de la familia Pixtral, inicializado desde el checkpoint Ministral-3-3B-Instruct-2512-BF16, y se encarga de procesar la imagen de pagina. El componente de lenguaje se inicializa desde nvidia/Nemotron-3-Embed-1B-BF16. Ambos se combinan mediante una proyeccion multimodal que se ajusto sobre conjuntos de datos de imagenes y de imagen mas texto.

El entrenamiento se realizo por destilacion desde el modelo maestro Nemotron-3.5-Embed-8B-BF16, empleando una combinacion de perdida de distancia coseno (COS) y error cuadratico medio (MSE) sobre datos de recuperacion multilingue de texto e imagen. Un detalle tecnico relevante es que el componente de lenguaje se mantuvo congelado durante la destilacion; como consecuencia, este modelo comparte exactamente el mismo espacio de embeddings de texto que Nemotron-3-Embed-1B-BF16, mientras que el encoder de vision y la proyeccion multimodal si se ajustaron para anadir la capacidad de recuperacion de imagenes.

## Capacidades

- Generacion de embeddings densos de tamano fijo a partir de texto, imagen de pagina o combinacion de imagen y texto.
- Recuperacion de documentos a partir de una consulta en texto (retrieval multimodal).
- Procesamiento de paginas con texto, tablas, graficos e infografias sin depender exclusivamente del OCR.
- Recuperacion multilingue de texto en 34 idiomas y de imagen en 18 idiomas.
- Consultas en texto con documentos en imagen o texto, util para bases de datos vectoriales heterogeneas.
- Integracion con sentence-transformers, transformers y vLLM.
- Compatibilidad de espacio de embeddings de texto con Nemotron-3-Embed-1B-BF16, lo que permite mezclar ambos modelos en un mismo indice textual.
- Orientado a flujos de RAG y RAG agentico, busqueda semantica y recuperacion visual de documentos.
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso por si mismo; esas capacidades dependen del modelo generativo que consuma los embeddings.

## Casos de uso

- RAG sobre documentacion tecnica con tablas y figuras: se indexan las paginas como imagenes y se consultan en lenguaje natural, evitando la perdida de informacion que provoca el OCR en tablas complejas o diagramas.
- Recuperacion en corpus financieros multilingues: informes anuales en espanol, ingles o japones se indexan como pagina de imagen y se consultan desde una unica interfaz, aprovechando los 32.768 tokens de contexto para paginas densas.
- Busqueda semantica en repositorios de contratos: cada pagina se vectoriza como imagen y se almacena en una base vectorial junto al documento original; la consulta textual recupera la pagina exacta, lo que agiliza la revision legal.
- Atencion al cliente sobre manuales de producto: el equipo de soporte consulta manuales con esquemas e infografias mediante una consulta de texto y recupera la pagina relevante con su contenido visual intacto.
- Digitalizacion de archivos historicos o cientificos: indexacion de paginas escaneadas con graficos y formulas, donde el texto extraido por OCR es incompleto o poco fiable.
- Busqueda visual de documentos en 18 idiomas, incluyendo idiomas con recursos limitados como suajili, telugu, tailandes o yoruba, para desplegar buscadores en mercados poco cubiertos por otros modelos.
- Enriquecimiento de pipelines de agentes: el agente genera la consulta en texto y el modelo recupera paginas de documento como paso previo a la generacion de la respuesta por parte de un LLM independiente.
- Deduplicacion y clustering de documentos: los embeddings de pagina permiten agrupar documentos similares sin depender de la extraccion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del checkpoint BF16: aproximadamente 3,1 GB, segun el tamano del repositorio.
- Inferencia en BF16: cabe holgadamente en GPU de consumo. Una RTX 4090 (24 GB), RTX 4080 (16 GB) o incluso GPUs de 8 GB pueden ejecutar el modelo en precision completa siempre que se ajuste el tamano de lote.
- GPU recomendadas para produccion: NVIDIA A100, H100, L40S o A10G para alto throughput; en el extremo de consumo, RTX 4090 y RTX 3090 son suficientes.
- Al ser un modelo pequeno (1,55B), la VRAM necesaria para inferencia es reducida; el cuello de botella en produccion suele ser el tamano de lote y la resolucion de imagen, no el peso del modelo.
- Despliegue: compatible con sentence-transformers, transformers y vLLM, segun los tags del modelo. Opciones adicionales como llama.cpp, Ollama o TGI no estan confirmadas en la informacion disponible.
- La resolucion de imagen por defecto (longest_edge de 1120 px, ampliable a 1540 px) incrementa el coste computacional del encoder de vision; conviene ajustarla segun el tipo de documento.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B-BF16 | 1,55B | 32.768 tokens | Texto e imagen | OpenMDW-1.1 | HuggingFace (BF16) y variante NVFP4 |
| Nemotron-3.5-Embed-8B-BF16 | 8B (aproximado, segun nombre) | no disponible | Texto e imagen | OpenMDW-1.1 (segun familia) | HuggingFace; es el maestro de destilacion del modelo 1B |
| Nemotron-3-Embed-1B-BF16 | 1B (aproximado, segun nombre) | no disponible | Solo texto | no disponible | HuggingFace; comparte espacio de embeddings de texto con el modelo 1B multimodal |
| Ministral-3-3B-Instruct-2512-BF16 | 3B (aproximado, segun nombre) | no disponible | Modelo generativo multimodal (base del encoder de vision) | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. Cualquier flujo de RAG necesita un LLM separado para la generacion final.
- Las consultas solo admiten entrada de texto; la imagen se reserva para los documentos. Esto limita casos de busqueda por similitud de imagen a imagen.
- Los idiomas evaluados estan acotados a 34 para texto y 18 para imagen; el rendimiento fuera de ese conjunto no esta garantizado, aunque el autor indica que puede soportar idiomas adicionales.
- Riesgo de alucinacion: al ser un modelo de recuperacion, puede devolver documentos poco relevantes si la consulta es ambigua o si el corpus contiene contenido visual muy heterogeneo. La calidad final depende del modelo generativo que consuma los resultados.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; conviene auditar los corpus de indexacion, especialmente en documentos historicos o con contenido sensible.
- Licencia OpenMDW-1.1: permite uso comercial y no comercial, pero es una licencia propia de NVIDIA que debe revisarse antes de integrarla en productos regulados. Los modelos base Ministral estan bajo Apache 2.0, lo que anade una capa adicional de condiciones.
- El componente de lenguaje se mantuvo congelado durante la destilacion, por lo que las mejoras respecto a Nemotron-3-Embed-1B-BF16 se concentran en la parte visual; la calidad de recuperacion textual es heredada.
- La resolucion de imagen ampliada a 1540 px aumenta el coste de computo de forma significativa; hay que equilibrar precision y latencia en produccion.
- Fechas y disponibilidad: la model card indica lanzamiento en HuggingFace el 20/10/2026, con creacion del repositorio el 07/10/2026 y ultima actualizacion el 16/10/2026. Verificar la version vigente antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Variante NVFP4: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-NVFP4
- Variante 8B BF16: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Modelo base de texto: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Modelo base de vision: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Referencia API NVIDIA: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-embed-1b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Hilo en r/LocalLLaMA: https://www.reddit.com/r/LocalLLaMA/comments/1x70qhu/nvidianemotron35embed1bbf16_hugging_face/
