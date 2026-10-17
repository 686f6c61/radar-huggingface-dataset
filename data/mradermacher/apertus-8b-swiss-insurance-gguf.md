# mradermacher/apertus-8b-swiss-insurance-GGUF

## Resumen

`mradermacher/apertus-8b-swiss-insurance-GGUF` es la versión cuantizada en formato GGUF del modelo `legmlai/apertus-8b-swiss-insurance`, un ajuste fino de Apertus-8B orientado al dominio del seguro y del ámbito legal suizo. El modelo base parte de Apertus-8B, el modelo abierto suizo desarrollado en el ecosistema EPFL/ETH/CSCS según las referencias públicas encontradas, y ha sido especializado con datos del sector asegurador helvético. Esta versión la publica mradermacher, un cuantizador habitual de la comunidad, con 8.053.338.176 parámetros totales (unos 8,05 mil millones) y licencia Apache-2.0.

La relevancia de esta ficha es doble. Por un lado, ofrece un modelo de 8B especializado en un nicho regulado (seguros y normativa suiza) que puede desplegarse on-premise, algo crítico cuando se manejan datos de asegurados sujetos a confidencialidad. Por otro lado, al estar en GGUF, se puede ejecutar con llama.cpp, Ollama o LM Studio en hardware de consumo, con cuantizaciones que van desde 3,4 GB (Q2_K) hasta 16,2 GB (f16).

La información publicada es limitada: la model card del repositorio GGUF es una plantilla de cuantización y no detalla arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. Todo lo que no consta se marca explícitamente como "no disponible" en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Apertus-8B; la información proporcionada no detalla la arquitectura interna) |
| Parámetros totales | 8.053.338.176 (~8,05 B), dato de safetensors del modelo base |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | alemán (de) y francés (fr), según la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |
| Tamaño del repositorio | 72,7 GB |
| Modelo base | legmlai/apertus-8b-swiss-insurance |
| Cuantizador | mradermacher (quantized_by) |
| Versión de cuantización | quantize_version 2, output_tensor_quantised 1, convert_type hf |
| Cuantizaciones con imatrix | no disponibles (solo estáticas) |
| Descargas / likes | 214 / 0 |
| Fecha de creación / actualización | 2026-10-17 / 2026-10-17 |
| Etiquetas | apertus, swiss, insurance, legal, tool-use, web-search, conversational |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo: no se especifica si emplea atención completa, atención lineal, mezcla de expertos o algún esquema híbrido, ni se detalla la composición del corpus de entrenamiento, el número de tokens vistos, la existencia de fases de RLHF/DPO o el proceso de ajuste fino sobre Apertus-8B. Lo único documentado es el propósito del ajuste: un modelo especializado en seguros suizos con capacidad declarada de uso de herramientas y búsqueda web, según las etiquetas de la model card.

El repositorio que nos ocupa es exclusivamente una conversión a GGUF. La model card del cuantizador indica que se trata de cuantizaciones estáticas generadas con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, sin cuantizaciones ponderadas por imatrix en el momento de la publicación. El autor señala que, si no aparecen en aproximadamente una semana, probablemente no las tenga planificadas, y que se pueden solicitar abriendo una discusión en la comunidad. El modelo base declara dos datasets asociados, `legmlai/swiss-insurance-eval` y `legmlai/swiss-insurance-eval-responses`, que parecen orientados a evaluación más que a entrenamiento, aunque esto no se confirma en la documentación.

## Capacidades

- Generación de texto conversacional en alemán y francés, con especialización declarada en el dominio del seguro y el ámbito legal suizo.
- Uso de herramientas y function calling: la etiqueta `tool-use` sugiere soporte para invocación de funciones dentro de pipelines de agentes.
- Búsqueda web: la etiqueta `web-search` indica capacidad de integración con recuperación de información en línea.
- Respuesta a preguntas sobre normativa y productos de seguros suizos, con el vocabulario y las convenciones del sector.
- Formato conversacional (etiqueta `conversational`), apto para diálogos multi-turno.
- Compatibilidad con endpoints estándar de inferencia (etiqueta `endpoints_compatible`).
- Capacidades multimodales (visión, audio): no disponibles según la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Atención al cliente interna en una aseguradora suiza: el modelo puede gestionar consultas sobre coberturas, franquicias y procedimientos en alemán y francés, manteniendo el registro terminológico del sector. Adecuado por su ajuste específico al dominio, aunque la ventana de contexto no está documentada y conviene validarla empíricamente antes de producir.
- Asistente de consulta de condiciones generales (CGV) y clausulados: con un pipeline RAG que recupere los documentos de la póliza, el modelo redacta explicaciones en lenguaje llano para el cliente o para el gestor. El etiquetado `tool-use` permite conectarlo a un recuperador documental.
- Enrutado y clasificación de solicitudes: usando function calling, el modelo puede decidir a qué departamento o sistema derivar una consulta (siniestros, altas, bajas, reclamaciones) a partir del texto libre del asegurado.
- Búsqueda normativa asistida: con la etiqueta `web-search`, se puede integrar en un agente que consulte fuentes regulatorias públicas suizas y devuelva respuestas con referencia a la unidad legal aplicable, un patrón que el repositorio `apertus-swiss-eval` evalúa de forma determinista.
- Resumen y triaje de expedientes de siniestro: dado un conjunto de correos y partes médicos o técnicos, el modelo produce un resumen estructurado para el tramitador. Requiere validar previamente la longitud de contexto soportada.
- Despliegue on-premise para datos sensibles: al ejecutarse en GGUF con llama.cpp u Ollama, puede correr en infraestructura propia sin salida de datos a la nube, lo que encaja con los requisitos de confidencialidad del sector asegurador.
- Evaluación reproducible de modelos en dominios regulados: los datasets `swiss-insurance-eval` permiten comparar esta variante frente a otros modelos de 8B con puntuación determinista, sin juez LLM.
- Prototipado rápido en portátil: la cuantización Q4_K_S (4,8 GB) permite probar el modelo en una GPU de consumo antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas (MMLU, HumanEval, GSM8K ni específicas del dominio asegurador), y el autor no reporta comparaciones cuantitativas. Existen datasets de evaluación asociados (`legmlai/swiss-insurance-eval` y `legmlai/swiss-insurance-eval-responses`) y un repositorio externo de ablaciones (`chengmanov/apertus-swiss-eval`) que evalúa Apertus-8B en dominios regulados suizos con puntuación determinista, pero en la información proporcionada no constan los resultados numéricos de esas evaluaciones aplicadas a esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamaño de los ficheros (pesos + caché KV y overhead del runtime; cifras orientativas):
  - Q2_K (3,4 GB): ~4-5 GB de VRAM con contexto corto.
  - Q3_K_S / Q3_K_M (3,8-4,3 GB): ~5 GB.
  - IQ4_XS (4,6 GB) y Q4_K_S (4,8 GB): ~5,5-6 GB.
  - Q4_K_M (5,2 GB): ~6-7 GB.
  - Q5_K_S / Q5_K_M (5,7-5,9 GB): ~7-8 GB.
  - Q6_K (6,7 GB): ~8-9 GB.
  - Q8_0 (8,7 GB): ~10-11 GB.
  - f16 (16,2 GB): ~18-20 GB.
- GPU de consumo: una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB cubren con holgura hasta Q8_0. Una RTX 4090 de 24 GB permite f16 completo con contexto amplio. Para Q4_K_M basta una GPU de 8 GB, con posible offload parcial a CPU si el contexto crece.
- GPU de datacenter: A100 40/80 GB y H100 quedan sobredimensionadas para un 8B en inferencia individual; tienen sentido para servir en lote con vLLM o TGI, o para f16 con contextos muy largos y batch elevado.
- CPU y RAM: al ser GGUF, es viable la inferencia íntegra en CPU con llama.cpp; con Q4_K_M se necesitan unos 6-8 GB de RAM libre, y con f16 unos 18-20 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF. El soporte de GGUF en vLLM es parcial y depende de la versión; para producción con batching conviene validarlo o servir el modelo base en safetensors con TGI/vLLM.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para estas cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| mradermacher/apertus-8b-swiss-insurance-GGUF (este) | ~8,05 B | no disponible | Seguros y legal suizo, de/fr, tool-use, web-search | Apache-2.0 | GGUF (12 cuantizaciones) | HuggingFace, 214 descargas |
| legmlai/apertus-8b-swiss-insurance (base) | ~8,05 B | no disponible | Seguros y legal suizo, de/fr | Apache-2.0 | safetensors | HuggingFace |
| mradermacher/Apertus-8B-2509-GGUF | ~8 B (familia Apertus-8B) | no disponible | Generalista multilingüe | Apache-2.0 | GGUF | HuggingFace |
| mradermacher/Apertus-8B-Instruct-2509-GGUF | ~8 B (familia Apertus-8B) | no disponible | Generalista multilingüe, ajustado a instrucciones | Apache-2.0 | GGUF | HuggingFace |

La comparación relevante es frente a las variantes generalistas de Apertus-8B: misma escala de parámetros, misma licencia y mismo cuantizador, pero sin el ajuste al dominio asegurador. La diferencia práctica estará en el vocabulario y el registro del nicho, no en la huella de hardware, que es equivalente entre las tres variantes. No se dispone de datos de rendimiento comparado que permitan cuantificar esa diferencia.

## Limitaciones y advertencias

- Riesgo de alucinación elevado en un dominio regulado: el modelo puede inventar artículos, cláusulas o referencias normativas. Cualquier salida con valor legal debe verificarse contra la fuente original.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgo, toxicidad o equidad para este ajuste.
- Idiomas: la model card solo declara alemán y francés. El comportamiento en castellano, italiano o inglés no está garantizado y debería probarse antes de usarlo en entornos multilingües.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos (pólizas completas, expedientes) sin medirla empíricamente.
- Fecha de corte del conocimiento y vigencia normativa: no disponibles. La normativa suiza de seguros cambia, y el modelo puede estar desactualizado sin que se indique.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero no exime del cumplimiento de la normativa sectorial (protección de datos, deberes de información al asegurado) ni de la supervisión humana en decisiones automatizadas.
- Cuantizaciones estáticas sin imatrix: en los niveles bajos (Q2_K, Q3_K_S) la pérdida de calidad puede ser apreciable. La propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rápidas y equilibradas.
- Validación comunitaria escasa: 214 descargas y 0 likes en el momento de la consulta, con una model card generada a partir de plantilla. No hay informes independientes de calidad.
- Trazabilidad del ajuste fino: no se detalla el proceso de entrenamiento del modelo base del que deriva esta cuantización, lo que dificulta auditar su procedencia en un entorno regulado.
- El repositorio ocupa 72,7 GB por acumular todas las cuantizaciones: conviene descargar únicamente el fichero necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/apertus-8b-swiss-insurance-GGUF
- Modelo base: https://huggingface.co/legmlai/apertus-8b-swiss-insurance
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#apertus-8b-swiss-insurance-GGUF
- Dataset de evaluación: https://huggingface.co/datasets/legmlai/swiss-insurance-eval
- Dataset de respuestas de evaluación: https://huggingface.co/datasets/legmlai/swiss-insurance-eval-responses
- Ablaciones reproducibles de Apertus-8B en dominios regulados suizos: https://github.com/chengmanov/apertus-swiss-eval
- Variante generalista Apertus-8B-2509 en GGUF: https://huggingface.co/mradermacher/Apertus-8B-2509-GGUF
- Variante instruct Apertus-8B-Instruct-2509 en GGUF: https://huggingface.co/mradermacher/Apertus-8B-Instruct-2509-GGUF
- Gráfica comparativa de perplejidad entre cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre selección de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (ejemplo de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa que soporta la infraestructura del cuantizador: https://www.nethype.de/
