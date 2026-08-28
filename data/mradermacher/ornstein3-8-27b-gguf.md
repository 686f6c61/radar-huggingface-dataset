# mradermacher/Ornstein3.8-27B-GGUF

## Resumen

Ornstein3.8-27B es un modelo multimodal de 27 320 millones de parametros desarrollado por GestaltLabs, cuantizado a formato GGUF por mradermacher para su ejecucion eficiente en entornos locales. Forma parte de la familia Qwen3.8 (etiquetado como qwen3_5 y qwen3.8), lo que indica que se basa en la arquitectura de la serie Qwen3.8, aunque con adaptaciones propias del desarrollador. El modelo acepta entradas de imagen y texto, y genera texto, lo que lo situa en la categoria de modelos image-text-to-text.

La relevancia de este modelo radica en su naturaleza multimodal combinada con un tamano moderado (27B), que permite desplegarlo en hardware de gama alta para consumidores o en servidores con una unica GPU profesional. Al estar disponible en formato GGUF con multiples niveles de cuantizacion, desde Q2_K hasta Q8_0, ofrece flexibilidad para ajustar el equilibrio entre calidad y consumo de memoria. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que facilita su adopcion en entornos de produccion.

El repositorio de HuggingFace contiene tanto los pesos cuantizados como los ficheros de proyeccion multimodal (mmproj) necesarios para procesar imagenes, lo que indica que el modelo mantiene sus capacidades de vision en todas las variantes GGUF. No se proporcionan datos sobre la longitud de contexto, el dataset de entrenamiento ni benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.8 (detalles especificos no disponibles) |
| Parametros totales | 27 320 697 856 (27,32B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | ingles (etiqueta "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion proporcionada, pero las etiquetas indican que pertenece a la familia Qwen3.8, que emplea una arquitectura transformer con atencion por ventanas deslizantes y atencion completa alternada, similar a otros modelos de la serie Qwen. Al ser multimodal, incorpora un codificador de vision (probablemente ViT) y un proyector que alinea las representaciones visuales con el espacio de texto. Los ficheros mmproj incluidos en el repositorio GGUF confirman la presencia de este modulo de proyeccion.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas de alineacion como RLHF o DPO. El modelo base (GestaltLabs/Ornstein3.8-27B) no publica estos detalles en su model card, por lo que no es posible verificar si hubo ajuste fino supervisado o aprendizaje por refuerzo. La cuantizacion realizada por mradermacher es estatica, sin usar matrices de importancia (imatrix), aunque existe una variante separada con cuantizacion imatrix en el repositorio hermano Ornstein3.8-27B-i1-GGUF.

## Capacidades

- Generacion de texto en ingles con razonamiento contextual.
- Comprension de imagenes: el modelo acepta entradas visuales y puede describirlas, responder preguntas sobre su contenido o realizar tareas de razonamiento visual.
- Dialogo multimodal multi-turno: combina imagenes y texto en una misma conversacion.
- Integracion con el ecosistema transformers de HuggingFace, lo que permite su uso con pipelines estandar de image-text-to-text.
- Compatibilidad con herramientas de inferencia GGUF como llama.cpp, Ollama y LM Studio, que permiten ejecucion local en CPU o GPU.
- Soporte de cuantizacion progresiva: desde Q2_K (11 GB) hasta Q8_0 (29,1 GB), lo que permite adaptar el modelo a distintos presupuestos de memoria.
- Capacidades de agente y tool calling: no se mencionan explicitamente, por lo que se considera no disponible.

## Casos de uso

- Descripcion automatica de imagenes: el modelo puede generar textos alternativos o descripciones detalladas para imagenes en aplicaciones de accesibilidad, catalogos de productos o sistemas de gestion de contenidos. Su ventana de contexto, aunque no especificada, es suficiente para tareas de captioning estandar.
- Asistente visual para soporte tecnico: un usuario puede enviar una captura de pantalla de un error y el modelo puede explicar el problema y sugerir soluciones, combinando la informacion visual con conocimiento tecnico general.
- Analisis de documentos escaneados: al aceptar imagenes, puede extraer informacion de facturas, formularios o contratos digitalizados, aunque no se confirma si tiene capacidades OCR especificas.
- Moderacion de contenido visual: puede clasificar imagenes como apropiadas o inapropiadas segun criterios definidos, ayudando a filtrar contenido generado por usuarios en plataformas sociales.
- Educacion interactiva: un tutor virtual que recibe fotografias de problemas de matematicas o diagramas y proporciona explicaciones paso a paso, aprovechando su capacidad de razonamiento multimodal.
- Creacion de contenido para marketing: generar descripciones de productos a partir de fotos, redactar publicaciones para redes sociales o crear variaciones de texto para campanas publicitarias basadas en imagenes.
- Prototipado rapido de aplicaciones de vision por computador: los desarrolladores pueden usar el modelo como baseline para tareas de VQA (visual question answering) antes de entrenar modelos especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo. Tampoco se ofrecen comparativas con modelos similares en la model card del autor de la cuantizacion ni en la del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 GB (cuantizacion Q2_K) y 29,1 GB (Q8_0) solo para los pesos. Hay que anadir el fichero mmproj (0,7-1,0 GB) y el overhead de activaciones y cache KV, que puede sumar varios GB adicionales.
- GPU recomendadas: para cuantizaciones bajas (Q2_K, Q3_K), una RTX 3090 o RTX 4090 con 24 GB de VRAM es suficiente. Para Q4_K_M o superiores, se recomienda una GPU profesional como A100 40 GB, A6000 48 GB o H100.
- En consumer GPU: cabe en RTX 3090/4090 (24 GB) con cuantizaciones hasta Q4_K_M (16,9 GB + overhead). Para Q5_K_M o Q6_K, se necesita una GPU con 32 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier frontend compatible con GGUF. Tambien se puede usar vLLM si se convierte a formato safetensors, aunque no es el flujo principal.
- Latencia y throughput: no se proporcionan datos medidos. Como referencia orientativa, un modelo de 27B en Q4_K_M en una RTX 4090 suele generar entre 20 y 40 tokens por segundo con llama.cpp, pero esto depende de la implementacion y la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos. El modelo base (GestaltLabs/Ornstein3.8-27B) no publica benchmarks, y no se han encontrado referencias a modelos directamente comparables en la misma categoria (multimodal, ~27B, licencia Apache 2.0). Alternativas como Qwen2.5-VL-32B o Llama-3.2-11B-Vision tienen tamanos y capacidades diferentes, pero sin datos de rendimiento de Ornstein3.8 no es posible realizar una comparacion objetiva.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo soporta ingles de forma confirmada. No se garantiza un rendimiento adecuado en otros idiomas, incluido el espanol.
- Sesgos y alucinaciones: al ser un modelo de lenguaje generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento visual complejo donde la imagen no contiene suficiente informacion.
- Longitud de contexto desconocida: no se especifica el tamano de la ventana de contexto, lo que dificulta planificar su uso en tareas que requieren documentos largos o conversaciones extensas.
- Riesgo de degradacion por cuantizacion: las cuantizaciones mas agresivas (Q2_K, Q3_K) pueden reducir significativamente la calidad de las respuestas y la fidelidad de la comprension visual.
- Sin garantias de soporte para tool calling o funciones de agente: aunque la arquitectura base podria soportarlo, no se confirma en la documentacion, por lo que no se recomienda para pipelines que dependan de estas capacidades.
- Modelo base sin informacion de entrenamiento: al no publicarse detalles sobre el dataset ni el proceso de alineacion, no es posible evaluar riesgos de sesgo o seguridad de forma anticipada.
- Uso comercial permitido: la licencia Apache 2.0 no impone restricciones, pero el usuario debe verificar que el modelo base no tenga limitaciones adicionales no documentadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ornstein3.8-27B-GGUF
- Modelo base: https://huggingface.co/GestaltLabs/Ornstein3.8-27B
- Variante con cuantizacion imatrix: https://huggingface.co/mradermacher/Ornstein3.8-27B-i1-GGUF
- Repositorio de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
