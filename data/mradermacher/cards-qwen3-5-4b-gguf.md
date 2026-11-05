# mradermacher/CARDS-Qwen3.5-4B-GGUF

## Resumen

CARDS-Qwen3.5-4B-GGUF es la distribucion en formato GGUF del modelo C3DS/CARDS-Qwen3.5-4B, un modelo multimodal de tipo image-text-to-text afinado sobre una base Qwen 3.5 de 4.000 millones de parametros. Lo publica el usuario mradermacher, conocido en el ecosistema por generar cuantizaciones estaticas de modelos abiertos, y el modelo original lo desarrolla C3DS. El dominio de especializacion es el discurso climatico: el modelo esta entrenado para tareas de clasificacion y analisis de textos e imagenes relacionados con el cambio climatico.

La relevancia practica de esta publicacion es doble. Por un lado, ofrece el modelo en una bateria amplia de cuantizaciones GGUF (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB, mas los complementos mmproj para la torre de vision), lo que permite ejecutarlo en hardware de consumo. Por otro, al tratarse de un modelo de 4.205.751.296 parametros con licencia Apache 2.0, resulta apto para despliegues comerciales sin restricciones adicionales.

No se dispone de informacion publica sobre la longitud de contexto, la composicion exacta del dataset de entrenamiento ni resultados de benchmarks. La model card del cuantizador es puramente tecnica y remite al modelo base para los detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen 3.5; transformer multimodal image-text-to-text) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es C3DS/CARDS-Qwen3.5-4B, un fine-tune de Qwen 3.5 de 4B con capacidad multimodal (pipeline image-text-to-text), lo que implica una torre de vision acoplada al transformer de lenguaje. El entrenamiento se realizo mediante SFT sobre el dataset C3DS/cards_sft_dataset, orientado a clasificacion y analisis de discurso climatico. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La aportacion de esta publicacion concreta es la cuantizacion estatica a GGUF mediante el pipeline de mradermacher (convert_type hf, quantize_version 2, output_tensor_quantised 1). Se incluyen los ficheros mmproj necesarios para procesar imagenes en llama.cpp, en precision f16 (0,8 GB) y Q8_0 (0,5 GB). No se han publicado cuantizaciones con imatrix o ponderadas para este modelo en el momento de la ficha.

## Capacidades

- Generacion de texto y analisis de discurso en el dominio climatico.
- Clasificacion de contenido relacionado con cambio climatico y climate discourse.
- Procesamiento multimodal image-text-to-text: acepta imagenes junto a texto como entrada.
- Conversacional (tag conversational), apto para dialogos multi-turno.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- Capacidades generales heredadas de Qwen 3.5 de 4B: no detalladas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Clasificacion de discurso climatico en redes sociales: el modelo puede etiquetar publicaciones como negacionistas, alarmistas, neutras o tecnicas, aprovechando su fine-tune especifico sobre C3DS/cards_sft_dataset y su ventana conversacional.
- Analisis de imagenes de eventos climaticos: gracias a la torre de vision (mmproj), puede procesar fotografias de inundaciones, incendios o sequias junto a un texto descriptivo para tareas de clasificacion o verificacion.
- Moderacion de contenidos en plataformas de divulgacion ambiental: permite filtrar afirmaciones falsas o desinformacion climatica en ingles con un modelo de 4B ejecutable en local.
- Investigacion academica sobre percepcion publica del cambio climatico: util para anotar grandes corpus de comentarios con un modelo abierto y reproducible, sin depender de APIs de terceros.
- Despliegue en edge o en portatil: con la cuantizacion Q4_K_M (2,8 GB) puede ejecutarse en GPUs de consumo como la RTX 3060 o superiores, lo que facilita prototipado rapido y demos.
- Integracion en pipelines de monitorizacion de medios: al ser compatible con endpoints, puede servirse con llama.cpp o vLLM y conectarse a sistemas de ingestión de noticias para clasificar cobertura climatica en tiempo casi real.
- Enriquecimiento de datasets para entrenamiento: puede generar etiquetas preliminares sobre imagenes y textos climaticos que luego se revisan manualmente, reduciendo el coste de anotacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): 2,0 GB (Q2_K) a 8,5 GB (f16). Con overhead de contexto y vision, anadir entre 1 y 2 GB adicionales.
- Cuantizaciones recomendadas para uso general: Q4_K_M (2,8 GB) o Q5_K_M (3,2 GB), marcadas como "fast, recommended" por el autor.
- Cabe en GPUs de consumo: si, desde una RTX 3060 12 GB o RTX 4060 Ti 16 GB en cuantizaciones Q4-Q5 con margen amplio; en GPUs de 8 GB conviene usar Q4_K_S o inferior.
- GPUs profesionales: A100, H100 o L40S para despliegues concurrentes con f16 o Q8_0 y contexto largo.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, incluye soporte mmproj para vision), Ollama, y servidores compatibles con endpoints. vLLM y TGI no consumen GGUF de forma nativa; para esos backends habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CARDS-Qwen3.5-4B-GGUF | 4,2 B | no disponible | Si (image-text-to-text) | Apache 2.0 | GGUF en HF |
| Qwen 3.5 4B (base) | ~4 B | no disponible | Segun variante | Apache 2.0 (habitual en Qwen) | safetensors, GGUF de terceros |
| Llama 3.2 3B Instruct | 3,2 B | 128 K | Si (variante vision) | Llama Community License | safetensors, GGUF |
| Phi-3.5-vision | 4,2 B | 128 K | Si | MIT | safetensors, GGUF |

La comparativa se limita a caracteristicas estructurales; no hay datos de rendimiento publicados para CARDS-Qwen3.5-4B que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Es un fine-tune de dominio especifico (discurso climatico); su rendimiento en tareas generales puede degradarse respecto al Qwen 3.5 base.
- Riesgo de alucinacion inherente a los modelos de 4B, especialmente en clasificaciones matizadas o en imagenes ambiguas.
- No se han publicado evaluaciones de sesgo; al entrenarse sobre un dataset de discurso climatico, puede heredar sesgos de etiquetado del corpus C3DS/cards_sft_dataset.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen 3.5 puede tener terminos adicionales que conviene revisar en su repositorio original.
- No hay cuantizaciones imatrix/ponderadas disponibles, lo que puede suponer una perdida de calidad mayor en Q2_K y Q3 frente a alternativas IQ.
- El repositorio ocupa 39,9 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero GGUF y el mmproj necesarios.
- No se dispone de informacion sobre la longitud de contexto real, lo que impide garantizar conversaciones largas o documentos extensos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CARDS-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/C3DS/CARDS-Qwen3.5-4B
- Dataset de SFT: https://huggingface.co/datasets/C3DS/cards_sft_dataset
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#CARDS-Qwen3.5-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
