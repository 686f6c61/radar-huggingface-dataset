# mradermacher/d1-omni-600M-GGUF

## Resumen

d1-omni-600M es un modelo de decisión multimodal de pesos abiertos desarrollado por Liquid AI, publicado originalmente como LiquidAI/d1-omni-600M y puesto a disposición en formato GGUF por el cuantizador mradermacher. No es un modelo generativo al uso: está diseñado para emitir decisiones tipadas (noul, choice o score) en una sola pasada y sin generar tokens de salida, lo que reduce la latencia de forma drástica frente a un LLM que razona y escribe la respuesta.

El modelo se construye sobre el encoder LFM2.5-Encoder-350M y añade un encoder de visión basado en SigLIP2 y un encoder de audio, ambos ajustados de forma conjunta para tareas de decisión. Con unos 587 millones de parámetros (el archivo de pesos del modelo base declara 380.732.161), una ventana de contexto de 16.384 tokens y soporte para 15 idiomas, está pensado para despliegues en el borde (edge), incluyendo hardware tipo NVIDIA Jetson.

Su relevancia actual radica en que ofrece una alternativa eficiente a los LLM grandes para tareas de clasificación, enrutado, calibración y decisión automática en pipelines con restricciones de latencia, memoria o coste. Forma parte de la familia d1 de Liquid AI, junto a d1-3B, y se distribuye bajo la licencia lfm1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder basado en LFM2.5-Encoder-350M, con encoder de vision SigLIP2 y encoder de audio; modelo de decision (no generativo) |
| Parametros totales | 587 M segun la documentacion de Liquid AI; el safetensors del modelo base declara 380.732.161 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens; con imagen, el texto de estado y pregunta se recorta a 896 tokens tal como se entreno |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-Q8_0 y mmproj-f16 para la parte multimodal |
| Idiomas soportados | en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh (15 idiomas) |
| Licencia | lfm1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF (la version cuantizada); el modelo base en safetensors |
| Tamano del repositorio | 4,2 GB |
| Modelo base | LiquidAI/d1-omni-600M |
| Cuantizado por | mradermacher |

## Arquitectura y entrenamiento

d1-omni-600M es un modelo de decisión con arquitectura de tipo encoder, no un transformer decoder generativo. Se post-entrena a partir de LFM2.5-Encoder-350M e incorpora dos encoders adicionales: uno de visión basado en SigLIP2 y otro de audio. El modelo procesa entradas de texto+imagen o texto+audio y devuelve una respuesta tipada (noul, choice o score) en una única pasada, con cero tokens de salida generados, lo que es su rasgo diferencial respecto a los LLM convencionales.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas concretas de alineación como RLHF o DPO. La model card del cuantizador se limita a indicar que se trata de cuantizaciones estáticas del modelo base y no aporta detalles de entrenamiento. El contexto de 16.384 tokens se mantiene en todas las modalidades, con la particularidad de que, cuando hay imagen, el texto de estado y pregunta se trunca a 896 tokens coincidiendo con el régimen de entrenamiento.

## Capacidades

- Decisión en una sola pasada: devuelve salidas tipadas (noul, choice, score) sin generar tokens de salida, con la consiguiente reducción de latencia.
- Entrada de texto e imagen: comprensión de imagen apoyada en el encoder SigLIP2.
- Entrada de texto y audio: procesamiento de audio mediante el encoder dedicado.
- Clasificación y calibración: orientado a tareas de clasificación con puntuaciones calibradas.
- Enrutado y toma de decisiones tipo "system-one": pensado para decisiones rápidas de sistema.
- Multilingüe: 15 idiomas, entre ellos español, inglés, alemán, francés, italiano, neerlandés, polaco, portugués, árabe, hindi, japonés, ruso, turco, vietnamita y chino.
- Extracción de características: la etiqueta de pipeline feature-extraction aparece asociada al modelo.
- No se documenta en la información disponible soporte de tool calling, function calling ni razonamiento multi-paso en modo agente.

## Casos de uso

- Enrutado de peticiones en un gateway de LLM: el modelo puede decidir en una sola pasada si una consulta debe ir a un modelo pequeño, a uno grande o a un flujo especializado, reduciendo el coste por ahorro de tokens de salida.
- Moderación de contenido con imagen: dado un par texto+imagen, el modelo emite una decisión tipada sobre si el contenido cumple la política, integrándose como paso previo en un pipeline de moderación.
- Clasificación de tickets de soporte: con 16.384 tokens de contexto, puede procesar conversaciones largas y asignar categoría o prioridad en una sola llamada.
- Análisis de llamadas de atención al cliente: aprovechando la entrada de audio, permite clasificar o puntuar interacciones grabadas sin transcripción intermedia.
- Detección de anomalías en audio industrial: el encoder de audio permite emitir una puntuación de anomalía ante un fragmento sonoro, con despliegue en hardware de borde.
- Control de calidad visual en línea de producción: la combinación de texto e imagen permite comprobar si una pieza cumple especificaciones descritas textualmente y devolver una decisión binaria o una puntuación.
- Filtrado previo (pre-filtering) en RAG: decidir si una consulta es respondible con el índice actual antes de invocar al generador, ahorrando llamadas costosas.
- Automatización en dispositivos edge: al ocupar menos de 1 GB en la mayoría de cuantizaciones, puede ejecutarse en gateways, cámaras o dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para d1-omni-600M. La única referencia numérica aportada corresponde a su hermano de familia, d1-3B, que obtiene 48,57 en el Decision Index v0.2.1 (split público). No se dispone de la puntuación equivalente para d1-omni-600M.

## Requisitos de hardware

- VRAM estimada de inferencia: aproximadamente 0,3 GB para las cuantizaciones Q2_K a Q4_K_M; 0,4-0,5 GB para Q5, Q6_K y Q8_0; 0,9 GB para f16. Los ficheros mmproj de visión y audio añaden 0,4-0,5 GB si se usan las modalidades multimodales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también se contempla despliegue en NVIDIA Jetson para el borde. En centro de datos, una única GPU de gama media o incluso una A100/H100 sobredimensionada para lo que requiere el modelo.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU con más de 1-2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; también compatible con endpoints que acepten GGUF. Para la modalidad multimodal es necesario cargar los ficheros mmproj junto al modelo.
- Latencia y throughput: no se dispone de cifras para este modelo concreto. Como referencia de familia, Liquid AI indica que d1-3B responde una pregunta en 8 ms sobre una NVIDIA GeForce RTX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-omni-600M | ~587 M | 16.384 tokens | Texto, imagen, audio | lfm1.0 | Pesos abiertos en HuggingFace y GGUF |
| d1-3B | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Pesos abiertos segun el blog de Liquid AI |
| Otras alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer comparaciones cuantitativas con otros modelos de decisión o clasificadores multimodales de tamaño similar.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, sino salidas tipadas (noul, choice, score). No debe usarse para generar respuestas conversacionales.
- Con imagen, el texto de estado y pregunta se recorta a 896 tokens, muy por debajo de los 16.384 tokens máximos, lo que limita la cantidad de contexto textual que acompaña a una entrada visual.
- No se documentan en la información disponible resultados de benchmarks ni evaluación de sesgos para este modelo, por lo que su comportamiento en dominios sensibles no está verificado.
- Riesgo de alucinación no caracterizado: aunque al no generar texto libre el riesgo de invención es distinto, las decisiones pueden ser erróneas o mal calibradas en dominios fuera de la distribución de entrenamiento.
- Licencia lfm1.0 (etiquetada como "other"): conviene revisar el texto completo de la licencia antes de un uso comercial, ya que puede incluir restricciones específicas.
- Los pesos distribuidos por mradermacher son cuantizaciones estáticas del modelo original; no hay cuantizaciones con imatrix o ponderadas disponibles según el propio autor, lo que puede afectar ligeramente a la calidad en las cuantizaciones más agresivas.
- El número de descargas y likes del repositorio es muy bajo (47 descargas y 0 likes en el momento de la consulta), lo que indica poca validación por parte de la comunidad.
- Para usar las capacidades de visión y audio es imprescindible cargar los ficheros mmproj correspondientes; un despliegue solo con el GGUF principal pierde las modalidades no textuales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/d1-omni-600M-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Version GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/d1-omni-600M-GGUF
- Pagina del modelo en mradermacher: https://hf.tst.eu/model#d1-omni-600M-GGUF
- Blog de Liquid AI sobre la familia d1: https://www.liquid.ai/blog/d1-open
- Documentacion de Liquid AI sobre d1-omni-600M: https://docs.liquid.ai/lfm/models/d1-omni-600m
- Referencia del modelo en llmreference: https://www.llmreference.com/model/d1-omni-600m
- Estadisticas locales y benchmarks publicados: https://localaistats.com/models/hf-liquidai-d1-omni-600m
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
