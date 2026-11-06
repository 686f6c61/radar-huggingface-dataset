# mradermacher/Felldude-Uncensored-Ministral3-3B-bf16-GGUF

## Resumen

Felldude-Uncensored-Ministral3-3B-bf16-GGUF es una cuantizacion estatica en formato GGUF del modelo CuttingEdgeAI/Uncensored-Ministral-3-3B-bf16, publicada por el usuario mradermacher. Se trata de un derivado del modelo Ministral 3B de Mistral AI, sometido a un proceso de "uncensoring" (eliminacion o reduccion de los rechazos alineados) por parte de terceros. El modelo cuenta con 3.429.006.336 parametros totales y esta orientado a generacion de texto conversacional en ingles.

La relevancia de esta publicacion es practica: el repositorio original en bf16 no es directamente utilizable en hardware de consumo, mientras que esta version ofrece 13 cuantizaciones GGUF distintas (desde Q2_K de 1,6 GB hasta f16 de 7,0 GB), ademas de dos ficheros mmproj que sugieren capacidad multimodal. El repositorio ocupa 32,5 GB en total y acumula 299 descargas.

No obstante, se trata de un modelo de procedencia opaca: la model card del cuantizador es una plantilla generica sin informacion sobre entrenamiento, datos, benchmarks ni licencia. El modelo base referenciado en los tags (CuttingEdgeAI/...) no coincide con el indicado en la model card (dummy9996/...), lo que anade incertidumbre sobre la trazabilidad. Cualquier uso en produccion deberia tratarse con cautela extrema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder-only, derivado de Ministral 3B; no confirmado) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no aplica (no es MoE, segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en bf16 safetensors |
| Tamano del repositorio | 32,5 GB |
| Libreria declarada | transformers |
| Pipeline | no disponible |
| Modelo base (tags) | CuttingEdgeAI/Uncensored-Ministral-3-3B-bf16 |
| Modelo base (model card) | dummy9996/Uncensored-Ministral-3-3B-bf16 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna, el proceso de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) empleadas. Por el nombre y el numero de parametros, cabe inferir que se trata de un fine-tune de Ministral 3B (familia Mistral), pero esta inferencia no esta confirmada por ninguna fuente del repositorio. Los tags incluyen `conversational`, lo que sugiere un ajuste orientado a dialogo.

La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: el autor indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversion desde pesos Hugging Face con cuantizacion estatica de tensores. No se especifica si se aplico importancia matricial (imatrix) en esta variante; el propio autor remite a un repositorio separado (`...-i1-GGUF`) para las cuantizaciones ponderadas con imatrix. La presencia de ficheros `mmproj` (multi-modal projection) sugiere que el modelo base incorpora o hereda capacidad de vision, aunque no se detalla que codificador visual utiliza.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational`.
- Posible capacidad multimodal (vision) inferida de la presencia de ficheros `mmproj-Q8_0` y `mmproj-f16`, aunque no documentada.
- Comportamiento "uncensored": se espera una reduccion de rechazos ante peticiones que modelos alineados convencionalmente rechazarian. No hay documentacion sobre el alcance real de esta modificacion.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso via API compatible con OpenAI.
- No hay evidencia de soporte de tool calling, function calling, agentes, modo thinking, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Experimentacion con modelos "uncensored" en entornos de investigacion controlados: el modelo permite estudiar el comportamiento de un LLM sin las capas de rechazo habituales, util para analisis de sesgos y de mecanismos de alineacion. Requiere aislamiento y supervision.
- Generacion de ficcion y narrativa sin restricciones tematicas: escritores que necesitan explorar temas oscuros o controvertidos pueden usar el modelo en local con llama.cpp u Ollama, sin depender de APIs que apliquen filtros.
- Prototipado rapido en hardware de consumo: con cuantizaciones de 1,6 a 2,6 GB (Q2_K a Q5_K_M), el modelo cabe en GPUs de 4-8 GB de VRAM, lo que lo hace util para pruebas de concepto locales sin infraestructura dedicada.
- Role-play y chatbots de personaje: el ajuste conversacional y la ausencia de rechazos lo hacen adecuado para simulaciones de personajes con personalidades marcadas, en entornos privados.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 13 variantes GGUF del mismo modelo, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de generacion sobre una base identica.
- Fine-tuning posterior o destilacion: al disponer del modelo base en bf16 y de las versiones GGUF, un investigador puede usar las salidas del modelo cuantizado para generar datos sinteticos o comparar comportamiento entre precisiones.
- Despliegue en entornos air-gapped: al ser un modelo pequeno y ejecutable con llama.cpp, puede desplegarse en maquinas sin conexion, util en escenarios de privacidad estricta donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,6 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~1,7-2,0 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~2,1-2,2 GB
  - Q5_K_S / Q5_K_M: ~2,5-2,6 GB
  - Q6_K: ~2,9 GB
  - Q8_0: ~3,8 GB
  - f16: ~7,0 GB
  - mmproj (vision): +0,6 GB (Q8_0) o +0,9 GB (f16) adicionales
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4; para Q8_0 se recomienda 6 GB o mas; para f16, 8 GB o mas. En el segmento profesional, A100/H100 no son necesarias para este tamano, aunque permitirian mayor throughput por batching.
- Cabe en GPU consumer: si, en practicamente todas las GPUs modernas (GTX 1650 4 GB, RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server o vLLM (este ultimo con soporte GGUF limitado). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles. Como referencia orientativa para un modelo de 3B en Q4_K_M sobre una RTX 4090, cabria esperar decenas de tokens por segundo, pero no hay mediciones publicadas para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Felldude-Uncensored-Ministral3-3B (este) | 3,43 B | no disponible | en | no disponible | GGUF | Fine-tune "uncensored" de procedencia opaca |
| Ministral 3B (Mistral AI) | ~3 B | no disponible en esta ficha | multilingue | Mistral Research / comercial segun terminos | safetensors, GGUF | Modelo original, alineado y documentado |
| Llama 3.2 3B (Meta) | 3,21 B | 128 K | multilingue | Llama 3.2 Community License | safetensors, GGUF | Alternativa oficial con documentacion completa y benchmarks publicos |
| Qwen2.5 3B (Alibaba) | 3,09 B | 32 K (128 K en variantes) | multilingue | Apache 2.0 | safetensors, GGUF | Licencia permisiva y benchmarks publicados |

La comparativa es estructural: no se dispone de datos de rendimiento del modelo evaluado para confrontar con las alternativas. Frente a Ministral 3B, Llama 3.2 3B y Qwen2.5 3B, la diferencia principal no es tecnica sino de trazabilidad y licencia: las alternativas tienen documentacion oficial, benchmarks y terminos de uso claros, mientras que este derivado carece de todo ello.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. El modelo base es un derivado de Ministral, cuya licencia original (Mistral Research License o similar) podria imponer restricciones que este repositorio no aclara. Uso comercial desaconsejado sin verificacion legal previa.
- Procedencia ambigua: los tags apuntan a `CuttingEdgeAI/Uncensored-Ministral-3-3B-bf16` mientras que la model card cita `dummy9996/Uncensored-Ministral-3-3B-bf16`. Esta discrepancia impide verificar la cadena de custodia del modelo y los datos de entrenamiento.
- Modelo "uncensored": la eliminacion de rechazos implica un mayor riesgo de generar contenido danino, ilegal, ofensivo o factualmente incorrecto sin advertencia. No debe desplegarse en aplicaciones orientadas al publico sin capas de moderacion externas.
- Riesgo elevado de alucinacion: no hay informacion sobre el entrenamiento ni evaluaciones de fidelidad; los modelos de 3B sin alineacion robusta tienden a inventar hechos con fluidez.
- Solo ingles: el tag de idioma es `en`; no hay evidencia de competencia multilingue, y el "uncensoring" podria haber degradado aun mas capacidades no inglesas.
- Contexto desconocido: se desconoce la ventana de contexto efectiva, lo que impide planificar casos de uso con documentos largos.
- Capacidad multimodal no documentada: la presencia de `mmproj` sugiere vision, pero no se especifica el codificador ni el formato de entrada; usarla sin documentacion es arriesgado.
- Sin benchmarks: no hay ninguna metrica publicada que permita comparar su calidad con el modelo base ni con alternativas.
- Repositorio de 32,5 GB: contiene todas las cuantizaciones; conviene descargar solo el fichero GGUF necesario en lugar de clonar el repositorio completo.
- Modelo de 3B: capacidad de razonamiento y conocimiento factual limitados en comparacion con modelos de 7B o superiores; no apto para tareas que requieran precision alta sin verificacion humana.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Felldude-Uncensored-Ministral3-3B-bf16-GGUF
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Felldude-Uncensored-Ministral3-3B-bf16-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Felldude-Uncensored-Ministral3-3B-bf16-GGUF
- Modelo base citado en tags: https://huggingface.co/CuttingEdgeAI/Uncensored-Ministral-3-3B-bf16
- Modelo base citado en model card: https://huggingface.co/dummy9996/Uncensored-Ministral-3-3B-bf16
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (patrocinador del autor): https://www.nethype.de/
