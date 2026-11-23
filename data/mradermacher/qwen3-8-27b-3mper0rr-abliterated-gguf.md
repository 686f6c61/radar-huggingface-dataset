# mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-GGUF

## Resumen

Qwen3.8-27B-3MPER0RR-abliterated-GGUF es una cuantización estática en formato GGUF del modelo 3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated, publicada por mradermacher. El modelo base es una variante "abliterated" de un modelo de la familia Qwen3 de 27B (26.895.998.464 parámetros reales según safetensors), es decir, se ha aplicado una técnica de edición de pesos para eliminar o atenuar el comportamiento de rechazo alineado, manteniendo el resto de capacidades del modelo original. El autor de esta publicación no es el desarrollador del modelo base, sino un tercero especializado en producir versiones cuantizadas listas para inferencia local.

La relevancia de esta ficha es doble: por un lado, ofrece el modelo en una batería amplia de cuantizaciones (de Q2_K a Q8_0, más IQ4_XS) que permiten ejecutarlo en hardware de consumo; por otro, el modelo base incorpora un adaptador multimodal (mmproj) que sugiere capacidades de visión, aunque la información disponible no detalla la arquitectura interna ni el proceso de entrenamiento. La licencia declarada es Apache 2.0 y el idioma declarado es únicamente inglés.

Conviene subrayar que la model card del repositorio es la plantilla estándar de mradermacher para cuantizaciones: no contiene detalles sobre el entrenamiento, el contexto, los datos de alineación ni benchmarks. Por tanto, muchos campos de esta ficha se marcan explícitamente como "no disponible" en lugar de inferirse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3, presumiblemente transformer; no confirmado en la información) |
| Parámetros totales | 26.895.998.464 (26,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura interna del modelo base en la documentación proporcionada. El nombre "Qwen3.8-27B" sugiere una variante de la familia Qwen3 con aproximadamente 27 mil millones de parámetros, y el recuento real de safetensors (26.895.998.464) es coherente con esa cifra. La presencia de archivos mmproj (multi-modal supplement) en el repositorio indica que el modelo base incluye un componente multimodal, probablemente un proyector de visión, pero no se especifica el codificador visual ni la resolución de imagen soportada.

Respecto al entrenamiento, la información disponible no incluye número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. El sufijo "abliterated" indica que se ha aplicado una técnica de edición de pesos (típicamente ortogonalización o ablación de direcciones de rechazo) sobre el modelo alineado para reducir las negativas a responder; no se documenta el método exacto ni el impacto sobre las capacidades. Esta cuantización concreta ha sido generada con la herramienta de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf), y existe una versión con cuantización ponderada/imatrix en un repositorio separado.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Capacidades multimodales: el repositorio incluye archivos mmproj (Q8_0 y f16), lo que sugiere soporte de entrada de imágenes en el modelo base; el alcance exacto no está documentado.
- Comportamiento "abliterated": se espera una reducción de los rechazos a peticiones que el modelo original declinaría, a costa de posibles efectos secundarios no medidos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en hardware de consumo: con cuantizaciones Q4_K_M (16,6 GB) o IQ4_XS (15,3 GB) el modelo puede ejecutarse en GPUs con 24 GB de VRAM, como una RTX 4090, usando llama.cpp u Ollama. Es el caso de uso principal de esta publicación.
- Experimentación con modelos sin alineación de rechazo: útil en investigación sobre seguridad y alineación para estudiar cómo cambia el comportamiento al ablacionar las direcciones de rechazo, siempre con las cautelas éticas correspondientes.
- Prototipado de asistentes conversacionales en inglés: la etiqueta "conversational" y el formato GGUF permiten desplegar un chatbot local sin depender de APIs externas, con la ventaja de privacidad de datos.
- Evaluación de cuantizaciones: la disponibilidad de 11 variantes de cuantización permite medir la degradación de perplejidad y calidad entre Q2_K y Q8_0 sobre el mismo modelo, un caso práctico para ingeniería de despliegue.
- Procesamiento de imágenes en local (si se confirma el adaptador mmproj): el archivo mmproj-Q8_0 (0,7 GB) o mmproj-f16 (1,0 GB) se cargaría junto al modelo principal para tareas de descripción de imágenes o VQA, aunque la información disponible no detalla la calidad ni las tareas soportadas.
- Despliegue en servidores con endpoints compatibles: la etiqueta "endpoints_compatible" sugiere compatibilidad con servidores de inferencia tipo OpenAI-compatible, lo que facilita integrarlo en pipelines existentes.
- Fine-tuning o destilación sobre el modelo base: al estar en Apache 2.0 y disponible en transformers, puede servir como punto de partida para ajustes posteriores, aunque el autor de esta publicación solo distribuye los GGUF, no los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño del archivo, sin contar overhead de contexto): Q2_K 10,8 GB; Q3_K_S 12,2 GB; Q3_K_M 13,4 GB; Q3_K_L 14,4 GB; IQ4_XS 15,3 GB; Q4_K_S 15,7 GB; Q4_K_M 16,6 GB; Q5_K_S 18,8 GB; Q5_K_M 19,3 GB; Q6_K 22,2 GB; Q8_0 28,7 GB.
- GPU recomendadas: para Q4_K_M o IQ4_XS, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q8_0 se necesita una GPU de 32 GB o más (A100 40 GB, RTX 6000 Ada) o repartir entre varias GPUs.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) y las Q5/Q6 en GPUs de 24 GB. Q8_0 queda fuera del rango consumer de una sola GPU.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el modelo base es de transformers y la etiqueta "endpoints_compatible" apunta a servidores de inferencia compatibles con la API de OpenAI. vLLM y TGI no se mencionan en la información disponible para este formato.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-3MPER0RR-abliterated-GGUF (este) | 26,9 B | no disponible | Apache 2.0 | GGUF | Cuantización de tercero; idioma inglés; variante abliterated |
| Modelo base 3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated | 26,9 B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar; referencia para comparar degradación |
| Qwen3.8-27B-3MPER0RR-abliterated-i1-GGUF | 26,9 B | no disponible | Apache 2.0 | GGUF (imatrix) | Misma base con cuantización ponderada; calidad potencialmente superior a igual tamaño |

No se dispone de datos de benchmarks ni de modelos comparables de otros desarrolladores en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento objetiva.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad; no es posible evaluar el riesgo de sesgo con la información disponible.
- Riesgo de alucinación: no cuantificado. Al ser una variante abliterated, la eliminación de rechazos puede aumentar la probabilidad de respuestas incorrectas o inventadas presentadas con confianza.
- La variante "abliterated" reduce las negativas de seguridad del modelo original; esto puede producir contenido dañino, ofensivo o inexacto. No se recomienda su uso en producción orientada a usuarios finales sin filtros adicionales.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto: no documentada; no debe asumirse un contexto largo sin verificación empírica.
- Licencia Apache 2.0: permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre el modelo base ni sobre la cadena de responsabilidad.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad.
- El repositorio ocupa 187,9 GB; la descarga de todas las variantes no es práctica. Conviene descargar solo la cuantización necesaria.
- No hay información sobre tool calling, agentes ni modo thinking; no deben asumirse estas capacidades en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-3MPER0RR-abliterated-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
