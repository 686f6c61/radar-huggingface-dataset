# mradermacher/Gamunu-4b-Chat-It-V1-GGUF

## Resumen

Gamunu-4b-Chat-It-V1-GGUF es la colección de cuantizaciones en formato GGUF del modelo base manthilaffs/Gamunu-4b-Chat-It-V1, publicada por mradermacher. El modelo original es un modelo conversacional de aproximadamente 3.880 millones de parámetros (3,88B), afinado presumiblemente a partir de una base tipo Llama o similar mediante la librería Unsloth, según indican las etiquetas del repositorio. Esta versión GGUF existe para facilitar la inferencia en CPU, GPU de consumo y entornos con llama.cpp u Ollama, algo imposible con los pesos originales en safetensors de mayor precisión.

El repositorio incluye un conjunto amplio de cuantizaciones estáticas (Q2_K hasta Q8_0, además de f16 e IQ4_XS) y dos ficheros mmproj (multi-modal supplement), lo que sugiere que el modelo base podría tener capacidad de visión, aunque esta información no se confirma en la model card. El tamaño total del repositorio es de 37,3 GB, coherente con la suma de todas las variantes publicadas.

La relevancia de esta ficha es principalmente práctica: permite a desarrolladores desplegar un modelo conversacional de ~4B en hardware modesto con cuantizaciones de 1,8 a 7,9 GB, aunque la información pública sobre arquitectura, entrenamiento, licencia y benchmarks del modelo base es muy limitada. Se trata de un modelo con muy poca tracción (3 descargas, 0 likes) y sin documentación técnica detallada, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder-only, sin confirmar) |
| Parametros totales | 3.880.263.168 (~3,88B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base manthilaffs/Gamunu-4b-Chat-It-V1. El recuento de parámetros (3.880.263.168) es consistente con un transformer decoder-only de aproximadamente 4B parámetros, pero no se confirma en la documentación disponible. La etiqueta `unsloth` en el repositorio sugiere que el fine-tuning se realizó con la librería Unsloth, orientada a entrenamiento eficiente en memoria, pero no se especifican los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO.

La model card del repositorio GGUF es puramente operativa: describe el proceso de cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) y enumera los ficheros generados. No aporta información sobre innovaciones técnicas, atención lineal, decodificación especulativa ni detalles del preentrenamiento. La presencia de ficheros `mmproj` (multi-modal supplement) en Q8_0 y f16 es el único indicio de una posible capacidad multimodal, pero no se documenta qué modalidad ni cómo se entrenó.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` y el sufijo `-Chat-It` del nombre.
- Posible soporte multimodal (visión) por la presencia de ficheros `mmproj`, aunque no confirmado en la documentación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama usando la cuantización Q4_K_M (2,6 GB) en un portátil con 8 GB de RAM, adecuado para prototipos de chatbot sin conexión.
- Generación de texto en entornos con recursos limitados: la variante Q2_K (1,8 GB) permite ejecución en CPU en dispositivos de gama baja, útil para demos y pruebas de concepto.
- Fine-tuning adicional o experimentación: al ser un modelo de ~4B, puede ajustarse con LoRA en una única GPU de consumo (por ejemplo, RTX 3060 de 12 GB) usando el modelo base en safetensors.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite medir el impacto de la compresión en perplejidad y calidad conversacional en un mismo modelo.
- Integración en pipelines de CI/CD para pruebas de regresión de chatbots: el tamaño reducido de las cuantizaciones Q4 permite incluirlas en contenedores de test sin GPUs dedicadas.
- Despliegue en edge computing o dispositivos embebidos con suficiente memoria: la variante Q3_K_S (2,0 GB) o IQ4_XS (2,4 GB) puede ejecutarse en placas tipo Raspberry Pi 5 con 8 GB o en mini-PCs.
- Experimentación multimodal (si se confirma la capacidad de visión): los ficheros mmproj permiten cargar el modelo con soporte de imágenes en llama.cpp, aunque la falta de documentación limita su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 GB (Q2_K, 1,8 GB de pesos) y 10 GB (f16, 7,9 GB de pesos), añadiendo overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es pequeño y no aprovecha GPUs de gama alta.
- Compatibilidad con GPU de consumo: sí, en todas las cuantizaciones; Q4_K_M (2,6 GB) cabe en GPUs de 4 GB o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de ~4B, se espera un throughput alto en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gamunu-4b-Chat-It-V1 (este) | ~3,88B | no disponible | no disponible | GGUF, safetensors | HuggingFace, muy baja tracción |
| Llama 3.2 3B Instruct | 3,2B | 128K | Llama 3.2 Community License | GGUF, safetensors | Amplia, documentación completa |
| Qwen2.5 3B Instruct | 3,1B | 32K | Apache 2.0 | GGUF, safetensors | Amplia, benchmarks publicados |
| Phi-3.5-mini Instruct | 3,8B | 128K | MIT | GGUF, safetensors | Amplia, benchmarks publicados |

La comparación es desfavorable para Gamunu-4b en términos de documentación, licencia y benchmarks: los tres modelos alternativos tienen licencias claras, contextos definidos y resultados publicados, mientras que Gamunu carece de todos esos datos. Su única ventaja potencial sería un ajuste específico no documentado, pero no hay evidencia que lo respalde.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; contactar con el autor antes de usarlo en producción.
- Idiomas: solo inglés según la etiqueta del repositorio; no se garantiza calidad en castellano ni en otros idiomas.
- Sesgos conocidos: no documentados, pero al ser un modelo conversacional sin model card detallada, es probable que herede sesgos de sus datos de entrenamiento no especificados.
- Riesgo de alucinación: no evaluado; sin benchmarks ni evaluaciones publicadas, no hay evidencia de fiabilidad factual.
- Limitaciones de contexto: longitud de contexto no disponible, lo que impide planificar conversaciones multi-turno largas o tareas de recuperación.
- Tracción mínima: 3 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por la comunidad.
- Procedencia del fine-tuning incierta: la etiqueta `unsloth` no confirma la base utilizada ni los datos; no se puede verificar la calidad del ajuste.
- Capacidad multimodal no confirmada: los ficheros mmproj sugieren visión, pero sin documentación no se debe asumir su funcionamiento.
- Repositorio de 37,3 GB: descargar el repo completo es costoso; conviene descargar solo la cuantización necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gamunu-4b-Chat-It-V1-GGUF
- Modelo base: https://huggingface.co/manthilaffs/Gamunu-4b-Chat-It-V1
- Página de overview del cuantizador: https://hf.tst.eu/model#Gamunu-4b-Chat-It-V1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
