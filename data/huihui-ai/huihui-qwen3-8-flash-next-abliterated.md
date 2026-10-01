# huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated

## Resumen

Huihui-Qwen3.8-Flash-Next-abliterated es una variante del modelo multimodal Qwen3.8-Flash-Next de Qwen a la que se ha aplicado abliteration, una tecnica de ablation direccional de pesos que elimina las direcciones del flujo residual asociadas al rechazo de peticiones. El resultado es un modelo sin los filtros de seguridad habituales, publicado por huihui-ai y orientado a investigacion y entornos controlados.

El modelo base, Qwen3.8-Flash-Next, emplea segun su repositorio oficial una arquitectura hibrida GDN + QSA, con mejoras sistematicas en atencion, residual, embeddings y optimizacion, y esta etiquetado como image-text-to-text, por lo que acepta entradas de imagen y texto. Esta variante conserva 179.999.981.459 parametros (unos 180 000 millones) y un repositorio de 360 GB en safetensors sin cuantizar.

Su relevancia actual es doble: permite estudiar de forma reproducible como se comporta un modelo de gran escala cuando se le retiran los mecanismos de rechazo, y habilita generacion de ficcion, codigo y contenido creativo sin las restricciones tipicas del modelo alineado. La model card advierte explicitamente de la ausencia de garantias de seguridad y recomienda uso experimental, no produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida GDN + QSA (segun la documentacion oficial de Qwen3.8-Flash-Next); multimodal image-text-to-text |
| Parametros totales | 179.999.981.459 (~180 000 millones) |
| Parametros activos | No disponible (no se especifica si es MoE ni el numero de parametros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Safetensors sin cuantizar; GGUF en Q8_0 y BF16 |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | Safetensors y GGUF |
| Tamano del repositorio | 360 GB |
| Modalidad de entrada | Imagen y texto (pipeline image-text-to-text) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Descargas | 0 |
| Likes | 19 |
| Fecha de creacion | 29 de septiembre de 2026 |
| Ultima actualizacion | 1 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3.8-Flash-Next, descrita por Qwen como una actualizacion sistematica en cuatro frentes: atencion, residual, embedding y optimizacion, con un esquema de atencion hibrido GDN + QSA que persigue mejorar capacidad y eficiencia de computo, capacidad del modelo y estabilidad de entrenamiento. Se trata de un modelo multimodal con soporte de entrada de imagen y texto. No se ha publicado en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por fases de RLHF o DPO.

Sobre ese modelo base, huihui-ai aplica abliteration: una eliminacion de direcciones en el espacio de activaciones (implementada con la libreria remove-refusals-with-transformers, sin TransformerLens) que suprime el comportamiento de rechazo. El autor describe el procedimiento como una implementacion cruda y de prueba de concepto. No se documentan en la informacion disponible el conjunto de datos de calibracion, el numero de capas intervenidas ni las metricas de degradacion posteriores a la ablation.

## Capacidades

- Generacion de texto conversacional, con soporte tanto de respuestas cortas como de respuestas de formato largo segun las notas publicadas por huihui-ai.
- Generacion de codigo, uno de los casos donde el autor afirma un rendimiento notable en sus pruebas.
- Escritura de ficcion y novela, igualmente destacada por el autor en sus pruebas del modelo base.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text), lo que permite tareas de descripcion, analisis y dialogo sobre imagenes.
- Supresion del comportamiento de rechazo: el modelo no aplica los filtros de seguridad del modelo alineado, lo que constituye su rasgo diferencial.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre mecanismos de rechazo y alineacion: el modelo permite comparar directamente las activaciones y las respuestas del modelo alineado y de la variante abliterated, aislando el efecto de la ablation sobre el comportamiento observable.
- Red-teaming y evaluacion de filtros de seguridad: util como generador adversarial de prompts y respuestas dentro de laboratorios que auditan sus propios sistemas de moderacion en un entorno aislado.
- Generacion de ficcion y narrativa larga: el autor senala buen comportamiento en novela y en respuestas de formato largo, lo que encaja en pipelines de escritura asistida donde el filtrado conservador del modelo base bloquearia tramas con violencia, conflicto o contenido adulto.
- Generacion de codigo en repositorios internos: el modelo base rinde bien en codigo segun las notas publicadas, y la variante sin rechazos reduce las negativas a tareas de ingenieria inversa, analisis de binarios o scripts ofensivos dentro de un entorno autorizado.
- Anotacion y descripcion de imagenes a escala: al aceptar imagen y texto, puede emplearse en pipelines internos de etiquetado, descripcion de assets o generacion de alt-text, con revision humana posterior obligatoria.
- Generacion de datos sinteticos para investigacion en seguridad: producir conjuntos de datos con contenido que los modelos alineados rechazan, destinados a entrenar clasificadores de moderacion o a estudiar la propagacion de contenido danino.
- Asistente conversacional en entornos cerrados de investigacion: desplegado en una red interna sin exposicion publica, para explorar respuestas a peticiones marginales que el modelo base declinaria, siempre con monitorizacion y registro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y las notas publicadas en redes sociales se limitan a afirmaciones cualitativas sobre generacion de codigo y novela.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 179.999.981.459 parametros: en BF16, en torno a 360 GB solo de pesos; en FP8/INT8, en torno a 180 GB; en GGUF Q8_0, en torno a 190 GB; en una cuantizacion de 4 bits, en torno a 100 GB. Hay que anadir el espacio de cache KV, que con contextos largos puede ser significativo.
- GPU recomendadas: para BF16 se necesitan del orden de 5 a 8 GPU de 80 GB (H100, H200 o A100 80 GB). Para FP8/INT8 bastan 3 o 4 GPU de 80 GB. Con una cuantizacion de 4 bits se puede operar con 2 GPU de 80 GB.
- Viabilidad en GPU de consumo: no cabe en una unica RTX 4090 ni en una RTX 5090 de 24/32 GB, ni siquiera en 4 bits. Seria necesario un sistema multi-GPU con 4 o 5 tarjetas de 24 GB, con las limitaciones de ancho de banda y el coste de comunicacion que ello implica.
- Opciones de despliegue: transformers para uso de referencia, vLLM o TGI para servicio con paralelismo tensorial en multi-GPU, y llama.cpp u Ollama a traves del repositorio GGUF (Q8_0 y BF16) publicado por el mismo autor.
- Latencia y throughput estimados: no disponible. Dependen del numero de GPU, del grado de paralelismo y del backend empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-Flash-Next-abliterated | 179.999.981.459 | No disponible | qwen-community-1.0 | Safetensors, GGUF | Sin filtros de rechazo; uso experimental segun el autor |
| Qwen/Qwen3.8-Flash-Next (base) | No disponible en la informacion | No disponible | qwen-community-1.0 | Safetensors | Modelo alineado con filtros de seguridad; arquitectura GDN + QSA |
| Otras variantes abliterated de la misma escala | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de resultados de benchmarks del modelo ni de sus alternativas, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia de filtrado de seguridad: la ablation elimina el comportamiento de rechazo, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado sin que exista una barrera interna que lo impida.
- Responsabilidad legal y etica del usuario: la model card traslada explicitamente al usuario el cumplimiento de la legislacion local y de los estandares eticos, y huihui-ai declina cualquier responsabilidad derivada del uso.
- Uso no recomendado en produccion: el autor recomienda emplearlo solo en investigacion, pruebas o entornos controlados, y evitar su despliegue directo en aplicaciones comerciales o de cara al publico.
- Riesgo de alucinacion: al ser una variante de un modelo de lenguaje de gran escala sin datos de evaluacion publicados, no hay medida de su tasa de alucinacion ni comparacion con el modelo base.
- Degradacion potencial por la ablation: la modificacion de pesos puede afectar a capacidades generales del modelo, pero no se han publicado evaluaciones que cuantifiquen ese efecto.
- Idiomas soportados sin documentar: no hay informacion sobre la cobertura linguistica real de esta variante.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide planificar despliegues que dependan de contextos largos.
- Restricciones de licencia: la licencia qwen-community-1.0 esta etiquetada como "other" en HuggingFace y el repositorio incluye un fichero LICENSE, pero no se detallan en la informacion disponible las condiciones concretas de uso comercial.
- Requisitos de infraestructura: el repositorio ocupa 360 GB y la inferencia en precision completa exige varios aceleradores de 80 GB, lo que limita su uso a entornos con recursos considerables.
- Necesidad de monitorizacion: la model card recomienda supervision en tiempo real y revision manual de las salidas para evitar la difusion de contenido inapropiado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Repositorio GGUF: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Libreria de abliteration utilizada: https://github.com/Sumandora/remove-refusals-with-transformers
- Anuncio del GGUF (Q8_0, BF16): https://x.com/support_huihui/status/2096530828868399371
- Anuncio de la publicacion completa: https://x.com/support_huihui/status/2105064292248891562
- Pagina de donaciones del autor: https://ko-fi.com/huihuiai
