# mradermacher/Qwen3.5-0.8B-Picture-Captioner-v1.2-GGUF

## Resumen

Qwen3.5-0.8B-Picture-Captioner-v1.2-GGUF es una cuantización estática en formato GGUF del modelo agentlans/Qwen3.5-0.8B-Picture-Captioner-v1.2, un modelo multimodal especializado en la generación de descripciones de imágenes (image captioning). El trabajo de cuantización lo firma mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, mientras que el modelo original procede del usuario agentlans y se construye sobre la base de la familia Qwen3.5 en su variante de 0,8B de parámetros.

El modelo resuelve la tarea concreta de convertir una imagen en una descripción textual en inglés, y lo hace con un tamaño muy reducido: 752.393.024 parámetros en los pesos safetensors del modelo base, lo que lo sitúa en la franja de modelos que pueden ejecutarse en hardware de consumo. La cuantización incluye además los ficheros mmproj (proyector multimodal) necesarios para el procesamiento de imágenes en llama.cpp y derivados.

La relevancia de esta ficha radica en que permite desplegar captioning multimodal en local con requisitos de memoria mínimos (desde unos 0,5 GB en Q2_K), algo poco habitual en modelos de visión-lenguaje. El contexto, los datos de entrenamiento detallados y los benchmarks no están documentados en la información disponible, por lo que se indican como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base Qwen3.5-0.8B con proyector mmproj para visión) |
| Parametros totales | 752.393.024 (pesos safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj separados para la parte multimodal) |

## Arquitectura y entrenamiento

El modelo base es una variante de Qwen3.5 de 0,8B de parámetros adaptada a captioning de imágenes. La arquitectura combina un transformer de lenguaje con un codificador visual y un proyector multimodal (mmproj en la terminología de llama.cpp), que es lo que permite alimentar imágenes al modelo. El repositorio GGUF incluye explícitamente los ficheros mmproj-Q8_0 (0,2 GB) y mmproj-f16 (0,3 GB) como suplemento multimodal, lo que confirma que la parte de visión está separada de los pesos del lenguaje.

El dataset de ajuste declarado es agentlans/monet-caption-highres, lo que sugiere un entrenamiento orientado a descripciones de alta resolución de pinturas o imágenes artísticas (el nombre "monet" apunta a un corpus de obras pictóricas). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. La cuantización es estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no se han publicado variantes con imatrix o ponderadas por el autor de la cuantización.

## Capacidades

- Generación de descripciones textuales de imágenes (image captioning) en inglés.
- Procesamiento multimodal imagen-texto mediante los ficheros mmproj incluidos.
- Generación de texto conversacional (el repositorio está etiquetado como conversational y compatible con endpoints).
- Formato de pesos GGUF listo para inferencia en llama.cpp y ecosistema compatible.
- Capacidades de razonamiento, código, matemáticas, tool calling o agentes: no documentadas en la información disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Descripción automática de imágenes en local: el modelo puede generar un pie de foto en inglés a partir de una imagen usando los ficheros mmproj junto con el GGUF cuantizado, sin necesidad de GPU dedicada en cuantizaciones bajas.
- Catalogación de fondos de imágenes o pinturas: dado el dataset monet-caption-highres, es adecuado para generar metadatos descriptivos de obras de arte o imágenes de alta resolución en flujos de digitalización de archivos.
- Accesibilidad: generación de texto alternativo (alt text) para imágenes en sitios web o aplicaciones, ejecutándose en el propio servidor con un coste de memoria mínimo (0,5-0,9 GB según cuantización).
- Preprocesado en pipelines de visión: usar el modelo como primer paso para etiquetar imágenes antes de pasarlas a un modelo mayor o a un sistema de búsqueda semántica.
- Prototipado e investigación en multimodalidad: al ser un modelo de 0,8B con licencia Apache 2.0, es útil para experimentar con arquitecturas visión-lenguaje en hardware modesto.
- Despliegue en dispositivos de borde: las cuantizaciones Q2_K a Q4_K_M (0,5-0,6 GB) permiten ejecutar captioning en equipos con poca RAM o en entornos embebidos compatibles con llama.cpp.
- Generación de descripciones conversacionales: al estar etiquetado como conversational, puede integrarse en interfaces de chat donde el usuario adjunta una imagen y pide una descripción o análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,5 GB (Q2_K) y 1,6 GB (f16) para los pesos del lenguaje, más 0,2-0,3 GB para el mmproj. En total, un rango aproximado de 0,7 GB a 1,9 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para las cuantizaciones bajas; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores no suponen ningún problema. También es viable en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en iGPU o en CPU pura.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) son los entornos naturales para GGUF con mmproj. El repositorio está etiquetado como endpoints_compatible, lo que facilita su exposición como API.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Picture-Captioner-v1.2-GGUF (este) | 752 M | no disponible | Apache 2.0 | GGUF + mmproj | Especializado en captioning, multilingüe limitado a inglés |
| Modelo base agentlans/Qwen3.5-0.8B-Picture-Captioner-v1.2 | 752 M | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Otros modelos de captioning de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, BLIP, LLaVA o Qwen-VL en variantes pequeñas), ya que no se han proporcionado sus especificaciones en esta ficha.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y etiquetado únicamente para inglés; las descripciones en castellano u otros idiomas no están garantizadas.
- Sesgos: no documentados, pero al entrenarse sobre un dataset de pinturas (monet-caption-highres) puede estar sesgado hacia vocabulario y estilos propios de ese dominio artístico.
- Riesgo de alucinación: inherente a los modelos generativos; las descripciones pueden incluir detalles no presentes en la imagen, especialmente en cuantizaciones muy agresivas (Q2_K, Q3_K_S).
- Contexto: no se ha publicado la longitud de contexto, lo que impide planificar conversaciones multi-turno largas con garantías.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original y del dataset de entrenamiento.
- Producción: al ser una cuantización estática sin imatrix, la calidad en cuantizaciones bajas puede degradarse; se recomienda Q4_K_M o superior para uso real. El modelo tiene 0 descargas y 1 like en el momento de la ficha, por lo que carece de validación comunitaria.
- La fecha de creación del repositorio (2026-11-05) y la denominación Qwen3.5 deben tomarse como datos del repositorio; no se dispone de documentación oficial adicional que los confirme.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Qwen3.5-0.8B-Picture-Captioner-v1.2-GGUF
- Modelo base: https://huggingface.co/agentlans/Qwen3.5-0.8B-Picture-Captioner-v1.2
- Dataset de entrenamiento: https://huggingface.co/datasets/agentlans/monet-caption-highres
- Página de resumen del cuantizador: https://hf.tst.eu/model#Qwen3.5-0.8B-Picture-Captioner-v1.2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
