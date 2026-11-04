# mradermacher/OpenGoody-2-GGUF

## Resumen

OpenGoody-2-GGUF es la versión cuantizada en formato GGUF del modelo theminji/OpenGoody-2, publicada por mradermacher, un conocido generador de cuantizaciones para la comunidad. El modelo base es un transformer de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) etiquetado por el autor con el identificador de arquitectura `qwen3_5`, lo que sugiere una derivación de la familia Qwen 3.5. Está afinado sobre el dataset WitchesSocialStream/MyDreamGirls-Goody2AI y declara soporte multimodal, dado que el repositorio incluye ficheros `mmproj` para proyección visual.

La relevancia de esta ficha radica en que el modelo original no distribuye pesos en formatos ligeros: esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, etc.), con cuantizaciones que van desde Q2_K (2,0 GB) hasta f16 (8,5 GB). El repositorio completo ocupa 39,9 GB e incluye tanto cuantizaciones estáticas como los citados suplementos multimodales.

Se trata de un modelo orientado a generación de texto conversacional en inglés, con licencia Apache 2.0, lo que facilita su uso comercial. No obstante, la información pública disponible es muy limitada: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta del autor: `qwen3_5`) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repositorio | 39,9 GB |
| Modelo base | theminji/OpenGoody-2 |
| Dataset de ajuste | WitchesSocialStream/MyDreamGirls-Goody2AI |
| Descargas / likes | 192 / 2 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only, inferida a partir de la etiqueta `qwen3_5` que el cuantizador incluye en los tags y de la librería `transformers`/`unsloth` referenciada. El número de parámetros (4,2 B) es coherente con un modelo de escala media de la familia Qwen. El repositorio incluye ficheros `mmproj` (multi-modal projection), lo que indica que el modelo base incorpora capacidad de entrada visual, aunque no se especifica el codificador de visión utilizado ni la resolución de imagen soportada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado más allá del dataset de afinado declarado (WitchesSocialStream/MyDreamGirls-Goody2AI). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El proceso de cuantización sí está documentado: se generaron cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y existe un repositorio paralelo con cuantizaciones ponderadas/imatrix en https://huggingface.co/mradermacher/OpenGoody-2-i1-GGUF.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (tag `conversational`).
- Entrada multimodal: los ficheros `mmproj` permiten procesar imágenes junto con texto, siempre que el runtime (llama.cpp con soporte multimodal) lo soporte.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue tras una API compatible con OpenAI.
- No se documenta soporte explícito de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta modo "thinking" ni procesamiento de audio.

## Casos de uso

- Asistente conversacional local: al caber en 2,8 GB con Q4_K_M, puede ejecutarse en portátiles con GPU modesta o incluso en CPU, sirviendo como chatbot privado sin conexión a servicios externos.
- Prototipado rápido de aplicaciones de chat: la licencia Apache 2.0 y el formato GGUF permiten integrar el modelo en demos y pruebas de concepto sin coste de licencia.
- Procesamiento de imágenes con descripción textual: gracias a los ficheros `mmproj`, puede emplearse para tareas de image captioning o respuesta a preguntas sobre imágenes en entornos con llama.cpp multimodal.
- Despliegue en dispositivos de borde: la cuantización Q2_K (2,0 GB) permite ejecución en hardware con poca memoria, útil para asistentes embebidos o entornos con restricciones de VRAM.
- Filtrado y clasificación de texto en pipelines: el modelo puede usarse para tareas de moderación o etiquetado semántico en inglés dentro de flujos automatizados, aprovechando su tamaño reducido para alta concurrencia.
- Experimentación académica: investigadores que necesiten un modelo pequeño, con licencia permisiva y pesos abiertos, para estudiar comportamiento conversacional o realizar ajustes finos posteriores (el formato GGUF no es ideal para fine-tuning, pero el base en safetensors sí lo permite).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,0 GB
  - Q3_K_M: ~2,4 GB
  - IQ4_XS: ~2,6 GB
  - Q4_K_M: ~2,8 GB
  - Q5_K_M: ~3,2 GB
  - Q6_K: ~3,6 GB
  - Q8_0: ~4,6 GB
  - f16: ~8,5 GB
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060). Para f16 se recomienda RTX 3090/4090 o superior.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más usando cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (según tags), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenGoody-2 (esta ficha) | ~4,2 B | no disponible | Apache 2.0 | GGUF, safetensors | Multimodal vía mmproj, solo inglés |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Multilingüe, benchmarks publicados |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Multilingüe, restricciones de uso |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | safetensors, GGUF | Multilingüe, buenos resultados en razonamiento |

La comparación se ofrece como referencia de categoría (modelos de ~3-4 B); no se dispone de datos de rendimiento de OpenGoody-2 para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo; el dataset de ajuste (WitchesSocialStream/MyDreamGirls-Goody2AI) sugiere un dominio temático específico que puede introducir sesgos de contenido.
- Riesgo de alucinación no cuantificado: al no haber benchmarks, no puede estimarse su fiabilidad en tareas factuales.
- Soporte exclusivo de inglés según la model card; el rendimiento en castellano no está garantizado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base podría arrastrar obligaciones adicionales si su licencia original difiere; conviene verificar theminji/OpenGoody-2.
- El formato GGUF está pensado para inferencia, no para entrenamiento o ajuste fino.
- El modelo tiene muy poca tracción (192 descargas, 2 likes) y no hay documentación técnica del autor original, lo que dificulta evaluar su calidad en producción.
- La etiqueta `qwen3_5` no corresponde a una arquitectura oficialmente publicada por Alibaba; podría tratarse de una convención interna del autor, por lo que la arquitectura exacta debe confirmarse inspeccionando los tensores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OpenGoody-2-GGUF
- Modelo base: https://huggingface.co/theminji/OpenGoody-2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/OpenGoody-2-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#OpenGoody-2-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/WitchesSocialStream/MyDreamGirls-Goody2AI
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
