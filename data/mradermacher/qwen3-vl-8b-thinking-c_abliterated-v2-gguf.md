# mradermacher/Qwen3-VL-8B-Thinking-c_abliterated-v2-GGUF

## Resumen

Qwen3-VL-8B-Thinking-c_abliterated-v2-GGUF es una cuantización estática en formato GGUF del modelo prithivMLmods/Qwen3-VL-8B-Thinking-c_abliterated-v2, publicada por mradermacher. El modelo subyacente deriva de la familia Qwen3-VL de Alibaba (8.190.735.360 parámetros, según los safetensors del repositorio), un transformer multimodal de 8B orientado a texto e imagen con modo de razonamiento extendido ("Thinking"). La variante "abliterated" es una modificación de la comunidad que elimina (ablaciona) la dirección de rechazo en el espacio de activaciones, de modo que el modelo responde a peticiones que el modelo original rechazaría.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar localmente un modelo multimodal de 8B con capacidades de razonamiento en GPUs de consumo gracias a las cuantizaciones GGUF (desde 3,4 GB en Q2_K hasta 16,5 GB en f16). Por otro, documenta una variante sin alineación de seguridad estándar, lo que tiene implicaciones directas para su uso en producción: el modelo no aplica las políticas de rechazo del Qwen3-VL original y debe desplegarse con filtros externos si se expone a usuarios finales.

El repositorio incluye los ficheros de cuantización de texto (Q2_K a f16) más los proyectores multimodales mmproj en Q8_0 y f16, necesarios para procesar imágenes. La licencia declarada es Apache 2.0 y el idioma documentado es únicamente inglés, aunque al derivar de Qwen3-VL es probable que conserve parte del multilingüismo del modelo base; no obstante, no se ha publicado una evaluación específica de esta variante en otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión), derivado de Qwen3-VL; variante abliterated con modo Thinking |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE según los datos del repositorio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; proyectores mmproj en f16 y Q8_0 |
| Idiomas soportados | en (documentado); multilingüismo del modelo base no verificado en esta variante |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (texto) + mmproj GGUF (visión); el modelo base está en safetensors vía transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje de 8B parámetros y un modo de razonamiento explícito ("Thinking") que genera una cadena de pensamiento antes de la respuesta final. Sobre esa base, prithivMLmods aplicó una técnica de abliteration: se identifica la dirección de activación asociada al comportamiento de rechazo y se proyecta fuera del espacio de activaciones, de modo que el modelo pierde la tendencia a declinar peticiones. La variante v2 indica una segunda iteración de ese proceso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original Qwen3-VL; la model card de esta cuantización no los detalla. Tampoco se documenta el procedimiento exacto de abliteration (capas afectadas, magnitud de la proyección, datos de calibración). La cuantización la realiza mradermacher con su pipeline estándar (quantize_version 2, conversión desde formato HF), e incluye cuantizaciones estáticas; las variantes con imatrix están en un repositorio separado (sufijo -i1-GGUF).

## Capacidades

- Generación de texto y razonamiento con modo Thinking: produce cadenas de razonamiento antes de la respuesta final.
- Procesamiento de imágenes: el repositorio incluye proyectores mmproj (f16 y Q8_0), lo que habilita entrada visual junto con texto.
- Generación de código: etiquetado como "code" en los tags del repositorio.
- Conversación multi-turno: etiquetado como "conversational" y compatible con endpoints de text-generation-inference.
- Respuesta sin rechazo: la abliteration elimina el comportamiento de refusal del modelo original, lo que permite respuestas a peticiones que el Qwen3-VL estándar declinaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para esta variante.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para esta variante.
- Capacidades multilingües: solo el inglés está documentado; el resto no verificado.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente cómo la abliteration altera la distribución de respuestas y qué tipos de contenido emergen cuando se elimina la dirección de rechazo, comparándolo con el Qwen3-VL original.
- Análisis de imágenes en local: con el proyector mmproj y una cuantización Q4_K_M (5,1 GB), se puede desplegar OCR, descripción de imágenes o extracción de datos de capturas en una estación de trabajo sin conexión a servicios en la nube.
- Generación de código asistida en entornos aislados: el modelo está etiquetado para código y cabe en GPUs de consumo, lo que permite integrarlo en un IDE o pipeline local de revisión de código sin enviar el código a terceros.
- Red teaming y pruebas de robustez: al carecer de refusal, es útil como generador de prompts adversarios y como sujeto de pruebas para evaluar filtros de contenido de capa superior (clasificadores, moderación de API).
- Prototipado de asistentes conversacionales con contexto multimodal: la combinación de conversación multi-turno y entrada de imagen permite construir demos de asistencia técnica que analicen capturas o diagramas junto con texto.
- Experimentación con razonamiento explícito: el modo Thinking permite comparar la calidad de respuestas con y sin cadena de razonamiento en tareas de matemáticas o lógica, usando las cuantizaciones Q6_K o Q8_0 para minimizar la degradación.
- Despliegue en hardware modesto: las cuantizaciones Q2_K (3,4 GB) y Q3_K_S (3,9 GB) permiten ejecutar el modelo en GPUs con 6-8 GB de VRAM para tareas de baja exigencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, y tampoco se aportan comparaciones con el modelo base sin abliterar.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): Q2_K ~3,4 GB; Q3_K_S ~3,9 GB; Q4_K_S ~4,9 GB; Q4_K_M ~5,1 GB; Q5_K_M ~6,0 GB; Q6_K ~6,8 GB; Q8_0 ~8,8 GB; f16 ~16,5 GB. Añadir el proyector mmproj (0,9 GB en Q8_0, 1,3 GB en f16) si se usa entrada visual, más el KV cache según la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para cuantizaciones Q4-Q8; A100 o H100 para f16 y para servir varias peticiones concurrentes.
- Cabe en GPU de consumo: sí. Q4_K_M con mmproj Q8_0 ocupa aproximadamente 6 GB, por lo que entra en GPUs de 8 GB con contexto moderado; Q2_K y Q3_K_S entran en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) para GGUF; el repositorio declara compatibilidad con text-generation-inference y transformers, aunque para GGUF el soporte nativo es de llama.cpp. No se documenta soporte de vLLM para esta cuantización.
- Latencia y throughput: no disponibles; no se han publicado mediciones para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Thinking-c_abliterated-v2 (GGUF) | 8,19B | no disponible | Sí (mmproj) | Apache 2.0 | GGUF |
| Qwen3-VL-8B-Thinking (original) | ~8B | no disponible | Sí | Apache 2.0 (según familia Qwen3-VL) | safetensors / GGUF |
| Qwen3-8B (solo texto) | ~8B | no disponible | No | Apache 2.0 | safetensors / GGUF |
| Llama 3.1 8B Instruct | 8,03B | 128K | No | Llama 3.1 Community License | safetensors / GGUF |

La comparación con el Qwen3-VL original es la más relevante: comparten arquitectura y tamaño, pero difieren en el comportamiento de rechazo, que la variante abliterated elimina. Frente a un modelo solo texto como Qwen3-8B, esta variante añade entrada visual a costa de un mayor consumo de VRAM por el proyector. No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de refusal: la abliteration elimina el comportamiento de rechazo del modelo original, por lo que puede generar contenido que el Qwen3-VL estándar declinaría. No es adecuado para exposición directa a usuarios finales sin filtros de moderación externos.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad para esta variante; la modificación de activaciones puede afectar a la calibración de las respuestas y no hay datos que lo cuantifiquen.
- Idiomas: solo el inglés está documentado; el rendimiento en castellano u otros idiomas no está verificado y podría degradarse respecto al modelo base.
- Contexto: la longitud de contexto no está documentada en esta ficha; debe consultarse la configuración del modelo base antes de asumir ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el despliegue de una variante sin alineación de seguridad conlleva responsabilidad legal y reputacional según la jurisdicción y el contexto de uso.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad de forma notable; para tareas de razonamiento o código se recomienda Q4_K_M o superior.
- Procedencia: es una modificación de la comunidad sobre un modelo de terceros; no hay garantías de mantenimiento, soporte ni auditoría del proceso de abliteration.
- Visión: requiere cargar el fichero mmproj correspondiente; sin él, el modelo funciona solo con texto.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/Qwen3-VL-8B-Thinking-c_abliterated-v2-GGUF
- Modelo base de la cuantización: https://huggingface.co/prithivMLmods/Qwen3-VL-8B-Thinking-c_abliterated-v2
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3-VL-8B-Thinking-c_abliterated-v2-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3-VL-8B-Thinking-c_abliterated-v2-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
