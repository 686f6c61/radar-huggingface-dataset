# mradermacher/tr-gemma-128k-12b-GGUF

## Resumen

tr-gemma-128k-12b-GGUF es una colección de cuantizaciones GGUF estáticas generadas por mradermacher a partir del modelo alibayram/tr-gemma-128k-12b, un derivado de la familia Gemma de Google con aproximadamente 11.260 millones de parámetros totales (11.262.717.696 según los pesos en safetensors). El repositorio no contiene pesos originales ni documentación técnica propia: es un artefacto de distribución que empaqueta el modelo base en formatos de cuantización de 2 a 8 bits para su uso con llama.cpp y ecosistemas compatibles.

El modelo base declara un contexto de 128 000 tokens (de ahí el sufijo "128k" en el nombre) y está etiquetado únicamente para inglés, aunque el prefijo "tr-" sugiere un posible ajuste orientado al turco que no está documentado en la model card. La información disponible no permite confirmar la composición del entrenamiento, los datos de ajuste fino ni el régimen de licencia del modelo base, lo que limita seriamente su evaluación para producción.

La relevancia de este repositorio es práctica: ofrece 12 variantes de cuantización (desde Q2_K de 4,5 GB hasta Q8_0 de 12,1 GB) más dos ficheros mmproj (Q8_0 y f16) que indican soporte multimodal de entrada, presumiblemente visión. Con 32 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de nicho, útil para quien necesite ejecutar un modelo de ~11B con contexto largo en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Gemma; no se detalla en la model card) |
| Parametros totales | 11.262.717.696 (11,26 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128 000 tokens (según el nombre del modelo base; no verificado en documentación técnica) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el nombre y el tamaño (11,26 B de parámetros), se trata presumiblemente de un transformer decoder-only de la familia Gemma, pero la model card de la cuantización no describe capas, atención, normalización ni ningún detalle estructural. Tampoco se indica si emplea atención con ventana deslizante, atención lineal u otras variantes.

Respecto al entrenamiento, no hay datos sobre número de tokens, composición del dataset, fases de ajuste supervisado, RLHF o DPO. El prefijo "tr-" del nombre sugiere un ajuste orientado al turco, pero la model card declara únicamente inglés como idioma, lo que genera una contradicción no resuelta. La única innovación técnica documentada en este repositorio es el propio proceso de cuantización estática de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf), que no es una innovación del modelo sino del pipeline de empaquetado.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Contexto largo de hasta 128 000 tokens (según el nombre del modelo base), adecuado para documentos extensos y conversaciones multi-turno.
- Soporte multimodal de entrada: la presencia de ficheros mmproj Q8_0 y f16 indica capacidad de procesar imágenes, presumiblemente visión, aunque no se detalla en la model card.
- Idiomas: inglés declarado; el posible soporte de turco no está confirmado.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking ni otras capacidades avanzadas.
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Procesamiento de documentos largos en local: con 128 000 tokens de contexto y cuantizaciones de 4-8 bits, permite resumir o extraer información de contratos, informes o expedientes completos en una sola pasada, sin depender de APIs externas.
- Asistente conversacional autoalojado: la etiqueta "conversational" y el tamaño de 11B lo hacen viable para desplegar un chatbot privado en una estación de trabajo con GPU de consumo, manteniendo los datos en la infraestructura propia.
- Análisis de imágenes con texto asociado: gracias a los ficheros mmproj, puede emplearse para describir capturas, extraer texto de imágenes o responder preguntas sobre diagramas, siempre que se valide la calidad real del componente visual.
- Prototipado e investigación: útil para experimentar con contexto largo en un modelo de ~11B sin necesidad de infraestructura de centro de datos, comparando el efecto de distintas cuantizaciones sobre la calidad.
- Generación de contenido en inglés: redacción de borradores, resúmenes y respuestas en inglés con un modelo ligero ejecutable en hardware asequible.
- Evaluación de cuantizaciones: el repositorio ofrece 12 variantes que permiten medir empíricamente la degradación de perplejidad entre Q2_K y Q8_0 en una misma tarea, útil para calibrar compromisos tamaño/calidad.
- Despliegue en entornos con recursos limitados: la variante Q2_K (4,5 GB) permite ejecutar el modelo en GPUs de 6-8 GB o incluso en CPU con llama.cpp, a costa de una pérdida de calidad significativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K ~4,5 GB; Q3_K_S ~5,1 GB; Q3_K_M ~5,7 GB; Q3_K_L ~6,2 GB; IQ4_XS ~6,3 GB; Q4_K_S ~6,6 GB; Q4_K_M ~7,0 GB; Q5_K_S ~7,9 GB; Q5_K_M ~8,1 GB; Q6_K ~9,3 GB; Q8_0 ~12,1 GB.
- La caché KV para 128 000 tokens añade una sobrecarga considerable no cuantificada en la información disponible; con contexto largo se recomienda GPU con 24 GB o más (RTX 3090, RTX 4090, A10, L4) o bien cuantizar la caché KV.
- Cabe en GPU de consumo: Q4_K_M (7,0 GB) en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070; Q8_0 (12,1 GB) en RTX 4070 Ti Super 16 GB o RTX 4090 24 GB.
- Despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros mmproj requieren un runtime con soporte multimodal (por ejemplo, llama.cpp con `llava`/`mtmd`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Para contexto completo de 128k se recomienda A100 40/80 GB o H100 si se mantiene el modelo en f16 junto con la caché KV completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tr-gemma-128k-12b-GGUF | 11,26 B | 128k (según nombre) | no disponible | GGUF | Cuantización estática de mradermacher; sin benchmarks publicados |
| Gemma 2 9B (Google) | 9,24 B | 8k | Gemma Terms of Use | safetensors, GGUF | Modelo oficial con documentación y evaluaciones publicadas |
| Mistral 7B / Mistral Nemo 12B | 7,2 B / 12,2 B | 32k / 128k | Apache 2.0 | safetensors, GGUF | Alternativas abiertas con contexto largo y licencia permisiva |
| Qwen2.5 14B | 14,7 B | 128k | Apache 2.0 | safetensors, GGUF | Mayor tamaño, contexto equivalente y licencia clara |

La comparación es aproximada: no se dispone de datos de rendimiento del modelo evaluado, por lo que la elección frente a estas alternativas debe basarse en pruebas propias. La ventaja diferencial de este repositorio es la disponibilidad inmediata de 12 cuantizaciones GGUF; su desventaja es la ausencia de licencia declarada y de documentación técnica.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. El modelo base (alibayram/tr-gemma-128k-12b) deriva presumiblemente de Gemma, cuyos términos pueden imponer restricciones adicionales; es imprescindible verificar la licencia del modelo base antes de cualquier uso en producción.
- Idiomas: solo se declara inglés; el prefijo "tr-" sugiere turco pero no está confirmado, y no hay evidencia de soporte de castellano.
- Contexto de 128k no verificado: el dato proviene únicamente del nombre del modelo; no se documenta la técnica de extensión de contexto ni su calidad en posiciones lejanas.
- Sin benchmarks: no hay evaluaciones publicadas de MMLU, HumanEval, GSM8K ni de calidad multilingüe, lo que impide estimar su rendimiento real.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin datos de ajuste (RLHF/DPO) no se puede evaluar su mitigación.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Componente multimodal no documentado: los ficheros mmproj indican visión, pero no se especifica el codificador, la resolución admitida ni la calidad; requiere validación empírica.
- Artefacto de nicho: 32 descargas y 0 likes; sin mantenimiento comunitario conocido ni garantías de soporte.
- Sesgos: no documentados; al no conocer la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, raza o idioma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/tr-gemma-128k-12b-GGUF
- Modelo base: https://huggingface.co/alibayram/tr-gemma-128k-12b
- Página de descargas del autor: https://hf.tst.eu/model#tr-gemma-128k-12b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
