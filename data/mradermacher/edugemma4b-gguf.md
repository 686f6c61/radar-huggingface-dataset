# mradermacher/EduGemma4b-GGUF

## Resumen

EduGemma4b-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo nicoboss/EduGemma4b, publicada por mradermacher, un cuantizador habitual en Hugging Face. No se trata de un modelo original, sino de una redistribución optimizada para inferencia local del modelo base, que cuenta con 3.880.263.168 parámetros (aproximadamente 3,9 mil millones). El repositorio incluye desde cuantizaciones de 2 bits (Q2_K, 1,8 GB) hasta f16 (7,9 GB), además de suplementos multimodales mmproj en Q8_0 y f16, lo que indica que el modelo base incorpora capacidad de visión.

El modelo base parece derivarse de la familia Gemma (por el nombre y el tamaño de ~4B), aunque la información disponible no confirma la arquitectura exacta ni el proceso de entrenamiento. La model card del repositorio GGUF es puramente operativa: describe los ficheros de cuantización, no las características del modelo. No se especifican licencia, contexto, idiomas más allá del inglés ni datos de entrenamiento.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~4B con capacidades multimodales en hardware de consumo mediante llama.cpp u Ollama, con cuantizaciones de 2,5 GB (Q4_K_S) que caben en GPUs con 4-6 GB de VRAM. Es una opción práctica para prototipado local y experimentación con modelos pequeños, aunque la ausencia de documentación sobre el modelo base limita su uso en producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer derivado de Gemma, sin confirmar) |
| Parametros totales | 3.880.263.168 (~3,9B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base nicoboss/EduGemma4b. El nombre sugiere una adaptación de Gemma de ~4B (la familia Gemma de Google), y el recuento de parámetros (3,88B) es coherente con esa hipótesis, pero no está confirmado en la documentación proporcionada. La presencia de ficheros mmproj (multi-modal projection) en el repositorio GGUF indica que el modelo base incorpora un adaptador de visión, probablemente un proyector tipo LLaVA o similar que conecta un codificador visual con el modelo de lenguaje.

No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado. El prefijo "Edu" en el nombre podría indicar un ajuste orientado a fines educativos, pero es una inferencia no verificada. El cuantizador mradermacher indica que las cuantizaciones son estáticas (quantize_version: 2, output_tensor_quantised: 1) y que existen versiones con imatrix en un repositorio separado (EduGemma4b-i1-GGUF), lo que sugiere que el modelo base es lo suficientemente popular como para justificar cuantizaciones ponderadas.

## Capacidades

- Generación de texto conversacional en inglés (tag "conversational" en el repositorio).
- Capacidad multimodal: los ficheros mmproj indican soporte de entrada de imágenes, aunque no se detalla el alcance (captioning, VQA, OCR u otros).
- Inferencia local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, koboldcpp).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integración con la Inference API de Hugging Face.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo thinking ni soporte de audio.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantización Q4_K_M (2,6 GB) se puede desplegar un chatbot en un portátil con GPU de 6 GB o incluso en CPU, usando llama.cpp u Ollama, para validar flujos de conversación antes de escalar a modelos mayores.
- Experimentación con modelos multimodales pequeños: los ficheros mmproj permiten probar pipelines de visión-lenguaje (descripción de imágenes, respuesta a preguntas visuales) en hardware de consumo, útil para investigación académica con recursos limitados.
- Educación e investigación: dado el posible enfoque educativo del modelo base (prefijo "Edu"), puede emplearse en entornos docentes para demostrar el funcionamiento de LLMs cuantizados sin requerir infraestructura cloud.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización del mismo modelo, lo que permite medir el impacto de la cuantización en perplejidad y calidad de salida en un caso real.
- Despliegue en dispositivos edge: la cuantización Q2_K (1,8 GB) permite ejecutar el modelo en dispositivos con poca memoria, como Raspberry Pi 5 con 8 GB o mini-PCs, para tareas de generación de texto simple.
- Integración en pipelines de CI/CD para pruebas de regresión: usar el modelo como generador de texto determinista en tests automatizados, aprovechando su pequeño tamaño para ejecutarse en runners con GPU modesta.
- Fine-tuning ligero sobre el modelo base: al estar disponible el modelo original en safetensors (nicoboss/EduGemma4b), se puede ajustar y luego cuantizar a GGUF con las herramientas de llama.cpp para despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,8 GB
  - Q3_K_M: ~2,2 GB
  - Q4_K_S / Q4_K_M: ~2,5-2,6 GB
  - Q5_K_M: ~2,9 GB
  - Q6_K: ~3,3 GB
  - Q8_0: ~4,2 GB
  - f16: ~7,9 GB
  - Añadir ~0,7-1,0 GB adicionales si se usa el proyector multimodal mmproj.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070, RTX 4090 para las cuantizaciones mayores; GPUs con 6-8 GB (GTX 1660 Super, RTX 3050, RTX 4060) para Q4_K_M. Para servidores: A100 o H100 son sobredimensionadas para este tamaño, pero válidas para lotes grandes.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 6 GB o más usando Q4_K_M o inferiores. En CPU también es viable con llama.cpp (velocidad dependiente del número de núcleos).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui con loader GGUF, y servidores compatibles con la API de OpenAI a través de llama.cpp server.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa no verificada, un modelo de ~4B en Q4_K_M suele generar decenas de tokens por segundo en GPUs de consumo modernas, pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EduGemma4b-GGUF (este) | ~3,9B | no disponible | no disponible | GGUF | Multimodal (mmproj), solo inglés |
| Gemma 3 4B (Google) | ~4B | 128K (según documentación pública de Gemma 3) | Gemma Terms of Use | safetensors, GGUF | Multimodal, multilingüe, ampliamente documentado |
| Phi-3.5-mini (Microsoft) | 3,8B | 128K | MIT | safetensors, GGUF | Solo texto, multilingüe, benchmarks publicados |
| Qwen2.5-3B (Alibaba) | 3,1B | 32K | Apache 2.0 | safetensors, GGUF | Solo texto, multilingüe, tool calling |

La comparativa se basa en datos públicos de los modelos alternativos; para EduGemma4b no se dispone de contexto, licencia ni benchmarks verificados, lo que limita una comparación rigurosa. Gemma 3 4B es el competidor más directo por nombre y tamaño, pero la relación entre ambos no está confirmada.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el modelo base: no se conocen datos de entrenamiento, sesgos, contexto ni licencia, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base (nicoboss/EduGemma4b) antes de cualquier despliegue comercial.
- Solo inglés: la model card declara únicamente el idioma "en"; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Riesgo de alucinación: inherente a modelos pequeños de ~4B sin documentación sobre ajuste (RLHF/DPO); no hay datos que permitan estimar su tasa de alucinación.
- Capacidad multimodal no verificada: la presencia de mmproj sugiere visión, pero no se documenta qué tareas visuales soporta ni con qué calidad.
- Contexto desconocido: sin dato de longitud de contexto, no se puede planificar su uso en tareas de contexto largo.
- Repositorio con pocas descargas (91) y 0 likes: comunidad mínima, sin validación independiente de calidad.
- Es una cuantización, no un modelo original: los errores de cuantización en Q2_K y Q3 pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- Fecha de actualización (2026-11-10) posterior a la de creación (2025-05-14): puede indicar mantenimiento, pero no se detalla qué cambió.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EduGemma4b-GGUF
- Modelo base: https://huggingface.co/nicoboss/EduGemma4b
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/EduGemma4b-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#EduGemma4b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de comparación de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
