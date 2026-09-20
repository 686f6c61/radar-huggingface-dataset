# ArchiveStudio/Qwen3-VL-30B-A3B-Instruct

## Resumen

Qwen3-VL-30B-A3B-Instruct es un modelo vision-lenguaje (VLM) multimodal de la familia Qwen3-VL desarrollada por el equipo Qwen de Alibaba. Se trata de la variante de arquitectura MoE (mixture of experts) con 31.070.754.032 parametros totales y aproximadamente 3.000 millones de parametros activos por token, de ahi la nomenclatura A3B. El repositorio analizado, ArchiveStudio/Qwen3-VL-30B-A3B-Instruct, es un espejo del repositorio oficial Qwen/Qwen3-VL-30B-A3B-Instruct publicado por un tercero (ArchiveStudio), sin descargas ni interacciones registradas en el momento de la consulta.

El modelo resuelve tareas de comprension conjunta de texto, imagen y video: reconocimiento visual de amplio espectro, OCR multilingue, razonamiento espacial 2D y 3D, comprension de video de larga duracion y actuacion como agente visual sobre interfaces graficas. Su contexto nativo es de 256.000 tokens, ampliable hasta 1.000.000, lo que lo situa en el segmento de modelos multimodales de contexto largo orientados a despliegue en servidor.

Es relevante ahora porque combina una arquitectura MoE eficiente en coste de inferencia (solo ~3B parametros activos) con capacidades multimodales avanzadas y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La model card oficial lo presenta como el modelo vision-lenguaje mas potente de la serie Qwen hasta la fecha, con ediciones Instruct y Thinking para despliegue segun necesidad de razonamiento explicito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); modulo vision Qwen3-VL con Interleaved-MRoPE, DeepStack y alineacion texto-timestamp |
| Parametros totales | 31.070.754.032 (dato real de safetensors) |
| Parametros activos | Aproximadamente 3.000 millones por token (segun nomenclatura A3B; cifra exacta no disponible en la informacion proporcionada) |
| Longitud de contexto | 256.000 tokens nativos, ampliable a 1.000.000 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repositorio solo contiene pesos safetensors; el autor no lista GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible como lista oficial; la model card indica soporte de OCR en 32 idiomas (frente a 19 en la generacion anterior) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; clase Qwen3VLMoeForConditionalGeneration) |
| Tamano del repositorio | 62,1 GB |
| Pipeline declarado | image-text-to-text |
| Fecha de creacion y actualizacion | 2026-09-20 (ambas identicas) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE multimodal que combina un codificador visual tipo ViT con un decodificador de lenguaje basado en expertos. La model card detalla tres innovaciones tecnicas concretas. La primera es Interleaved-MRoPE, una asignacion de frecuencias completa sobre los ejes temporal, de anchura y de altura mediante embeddings posicionales robustos, orientada a mejorar el razonamiento sobre video de horizonte largo. La segunda es DeepStack, que fusiona caracteristicas del ViT de varios niveles para capturar detalle fino y afinar la alineacion imagen-texto. La tercera es la alineacion texto-timestamp, que sustituye a T-RoPE y permite localizacion precisa de eventos anclada a marcas temporales, con indexacion a nivel de segundo en video.

No se dispone de informacion detallada en la documentacion proporcionada sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (SFT, RLHF o DPO) empleadas en esta variante concreta. La model card menciona un preentrenamiento visual mas amplio y de mayor calidad que permite "reconocer practicamente todo" (personajes publicos, anime, productos, monumentos, flora y fauna), asi como un OCR ampliado y mas robusto ante poca luz, desenfoque, inclinacion y caracteres poco frecuentes o antiguos. La implementacion esta integrada en las versiones recientes de transformers (se recomienda instalar desde el repositorio git, con soporte previsto a partir de la version 4.57.0) y se recomienda flash_attention_2 para acelerar y reducir memoria en escenarios con multiples imagenes y video.

## Capacidades

- Generacion de texto y comprension lectora con calidad declarada equiparable a la de modelos de lenguaje puros, gracias a una fusion texto-vision sin perdida.
- Percepcion y razonamiento visual avanzado: descripcion de imagenes, analisis causal y respuestas logicas basadas en evidencia en dominios STEM y matematicas.
- Razonamiento espacial: juicio de posiciones de objetos, puntos de vista y oclusiones, con grounding 2D reforzado y grounding 3D para IA encarnada.
- Comprension de video de larga duracion: manejo de horas de video con recuperacion completa e indexacion a nivel de segundo.
- Contexto largo: lectura de libros y documentos extensos con 256K tokens nativos y hasta 1M ampliados.
- OCR ampliado a 32 idiomas, robusto ante poca luz, desenfoque y rotacion, con mejor analisis de estructuras de documentos largos y caracteres raros o antiguos.
- Agente visual: opera interfaces graficas de PC y movil, reconoce elementos, entiende su funcion, invoca herramientas y completa tareas.
- Codigo visual: generacion de Draw.io, HTML, CSS y JavaScript a partir de imagenes o video.
- Reconocimiento visual amplio: personajes publicos, anime, productos, monumentos, flora y fauna.
- Interaccion conversacional multimodal (image-text-to-text) y compatibilidad declarada con endpoints.
- Soporte de tool calling y function calling segun las capacidades de agente descritas en la model card (no se detalla esquema de llamadas especifico).
- Modo de razonamiento: la familia ofrece ediciones Instruct y Thinking; este repositorio corresponde a la edicion Instruct.

## Casos de uso

- Agente de automatizacion de escritorio y movil: el modelo puede interpretar capturas de pantalla de interfaces graficas, identificar botones, campos y menus, invocar herramientas y encadenar acciones multi-paso para completar flujos de trabajo repetitivos sin scripting manual.
- Digitalizacion de documentos y OCR de produccion: gracias al OCR en 32 idiomas y a la mejora en documentos largos, encaja en pipelines de extraccion de datos de facturas, contratos, informes escaneados y formularios con estructura irregular o imagenes de baja calidad.
- Analisis de video de vigilancia o retransmisiones: con contexto de 256K y localizacion temporal a nivel de segundo, permite indexar eventos en grabaciones de varias horas y responder consultas del tipo "en que momento aparece X".
- Asistente tecnico para soporte en ingenieria: interpreta esquemas, diagramas, capturas de errores y planos, y responde con analisis causal en dominios STEM, util para diagnostico de incidencias con material visual.
- Generacion de interfaces a partir de mockups: convierte imagenes o videos de referencia en codigo Draw.io, HTML, CSS o JavaScript aprovechables como punto de partida en equipos de frontend.
- Robotica y agentes encarnados: el grounding 3D y el razonamiento de oclusiones y puntos de vista lo hacen adecuado para tareas de manipulacion y navegacion asistida por vision.
- Moderacion y catalogacion de contenido visual: clasificacion y descripcion de grandes volumenes de imagenes (productos, catalogo, redes sociales) con contexto largo para procesar lotes extensos en una sola llamada.
- Asistente conversacional multimodal en atencion al cliente: permite al usuario adjuntar fotos o capturas y mantener una conversacion multi-turno con memoria larga, reduciendo escalados a agentes humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card referencia dos tablas comparativas (rendimiento multimodal y rendimiento en texto puro para la variante sin modo thinking), pero se presentan exclusivamente como imagenes alojadas en el CDN del autor, sin valores numericos textuales que puedan reproducirse aqui. Los unicos datos cuantitativos verificables en la informacion proporcionada son el numero de parametros totales (31.070.754.032), el contexto nativo (256K) y el numero de idiomas de OCR (32).

## Requisitos de hardware

- Peso en memoria de los pesos: el repositorio suma 62,1 GB en safetensors, consistente con precision bf16/fp16 para 31.070 millones de parametros.
- Inferencia en bf16: se requiere al menos una GPU de 80 GB (A100 80 GB, H100 80 GB) para cargar los pesos completos con margen para cache KV y activaciones.
- Inferencia en fp8/int8 (aproximadamente 31 GB de pesos): viable en A100 40 GB (con limitaciones de contexto y lote), L40S 48 GB o H100 80 GB con lote amplio.
- Cuantizacion a 4 bits (aproximadamente 16-18 GB de pesos): encaja en GPUs de consumo como RTX 4090 (24 GB) o RTX 5090, y en RTX 3090 (24 GB), a costa de reducir la longitud de contexto efectiva y el tamano de lote.
- CPU y RAM: los 62 GB de pesos exigen un sistema con al menos 64 GB de RAM para carga en CPU; el uso de memoria asignada a expertos (offload) puede reducir el requisito de VRAM a costa de latencia.
- Despliegue confirmado: transformers con la clase Qwen3VLMoeForConditionalGeneration, con recomendacion explicita de flash_attention_2 para escenarios multi-imagen y video.
- Otras opciones de despliegue (vLLM, SGLang, TGI, llama.cpp, Ollama): no confirmadas en la informacion proporcionada para esta variante MoE concreta; la model card solo documenta la via transformers y ModelScope.
- Latencia y throughput: no disponibles. Al ser un MoE con aproximadamente 3.000 millones de parametros activos por token, el coste de computo por token es sustancialmente menor que el de un modelo denso de 31B, aunque el consumo de memoria permanece ligado al total de parametros.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| ArchiveStudio/Qwen3-VL-30B-A3B-Instruct (objeto de esta ficha) | 31,07B totales, ~3B activos | MoE multimodal | 256K nativo, 1M ampliable | apache-2.0 | HuggingFace (espejo) | Repositorio espejo de un tercero, 0 descargas y 0 likes |
| Qwen/Qwen3-VL-30B-A3B-Instruct | 31,07B totales, ~3B activos | MoE multimodal | 256K nativo, 1M ampliable | apache-2.0 | HuggingFace (oficial) | Repositorio de referencia citado por el propio codigo de la model card |
| Qwen2.5-VL-32B-Instruct | 32B | Densa multimodal | No disponible en la informacion proporcionada | apache-2.0 | HuggingFace | Generacion anterior de la familia; sin datos comparativos verificados aqui |
| Modelos MoE multimodales de otros fabricantes (por ejemplo variantes de la serie InternVL o Llama 4) | No disponible | No disponible | No disponible | No disponible | No disponible | No se ha recuperado informacion verificable en los resultados de busqueda |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria. La diferencia mas clara frente a la generacion anterior es la adopcion de arquitectura MoE con ~3B parametros activos, que reduce el coste de inferencia por token respecto a una variante densa de tamano similar.

## Limitaciones y advertencias

- No hay informacion sobre sesgos especificos en la documentacion proporcionada; como modelo entrenado sobre datos web a gran escala, cabe esperar sesgos culturales, de genero y geograficos no auditados publicamente.
- Riesgo de alucinacion: la model card no publica tasas de alucinacion ni evaluaciones de fidelidad factual. En tareas de OCR o grounding visual, una alucinacion puede producir contenido plausible pero inexistente en la imagen o el video.
- El repositorio analizado es un espejo de un tercero (ArchiveStudio), no el oficial de Qwen. Para uso en produccion conviene verificar integridad y procedencia y preferir el repositorio oficial Qwen/Qwen3-VL-30B-A3B-Instruct.
- El repositorio no registra descargas ni likes, lo que impide cualquier validacion comunitaria de su contenido; ademas, las fechas de creacion y actualizacion son identicas y futuras respecto al momento de la consulta habitual.
- Idiomas soportados: la model card no ofrece una lista oficial de idiomas de texto; solo se documentan 32 idiomas para OCR. El rendimiento fuera de ingles y chino no esta cuantificado en la informacion disponible.
- Contexto: los 1M tokens son una ampliacion sobre los 256K nativos; no se especifica la degradacion de calidad ni el coste de memoria al extender el contexto, y la cache KV a 1M de tokens es muy exigente en VRAM.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones de copyleft, pero el usuario asume la responsabilidad sobre el cumplimiento normativo del uso (por ejemplo, datos personales en imagenes procesadas).
- Despliegue: la unica via confirmada es transformers; el soporte en vLLM, SGLang, TGI, llama.cpp u Ollama no esta verificado en la informacion proporcionada, lo que puede complicar el escalado en servidores de inferencia optimizados.
- Los resultados de busqueda web recuperados durante la elaboracion de esta ficha no contienen informacion relevante sobre el modelo (devolvieron contenido no relacionado y no apto); no se han podido contrastar datos externos.

## Enlaces

- Repositorio analizado: https://huggingface.co/ArchiveStudio/Qwen3-VL-30B-A3B-Instruct
- Repositorio oficial referenciado en la model card: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Chat de Qwen: https://chat.qwenlm.ai/
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Qwen2.5-VL Technical Report (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
- Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Referencia adicional citada en los tags (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Libreria transformers (instalacion desde git recomendada por la model card): https://github.com/huggingface/transformers
