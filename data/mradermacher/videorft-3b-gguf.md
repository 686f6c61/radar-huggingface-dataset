# mradermacher/VideoRFT-3B-GGUF

## Resumen

VideoRFT-3B-GGUF es la versión cuantizada en formato GGUF del modelo VideoRFT-3B, desarrollado originalmente por QiWang98 y convertido a GGUF por mradermacher. Se trata de un modelo multimodal de 3.085.938.688 parámetros (aproximadamente 3,1 mil millones) orientado a tareas de comprensión de vídeo y razonamiento, entrenado sobre el dataset VideoRFT-Data. La versión GGUF incluye un componente mmproj (proyector multimodal) separado, lo que confirma su naturaleza visión-lenguaje.

El modelo resuelve el problema de ejecutar un modelo de razonamiento sobre vídeo en hardware de consumo, gracias a cuantizaciones que van desde Q2_K (1,4 GB) hasta f16 (6,3 GB). Al estar publicado bajo licencia Apache 2.0, es apto para uso comercial sin restricciones adicionales. Su relevancia actual radica en la escasez de modelos pequeños (sub-4B) con capacidades de vídeo y razonamiento que puedan desplegarse localmente con llama.cpp u Ollama.

La información pública disponible sobre el modelo base es limitada: la model card del repositorio GGUF es una plantilla estándar de mradermacher centrada en las cuantizaciones, sin detalles sobre arquitectura interna, datos de entrenamiento o benchmarks. Los datos que se ofrecen a continuación se limitan a lo verificable en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal visión-lenguaje, base QiWang98/VideoRFT-3B) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base QiWang98/VideoRFT-3B en la documentación proporcionada. Por el nombre y por la presencia de un archivo mmproj separado en la conversión GGUF, se deduce que es un modelo multimodal que combina un codificador visual con un modelo de lenguaje, orientado a entrada de vídeo. El tag `conversational` y la pipeline declarada como `transformers` confirman su uso como modelo de chat multimodal.

El dataset de entrenamiento declarado es QiWang98/VideoRFT-Data, del que no se especifican tamaño, composición ni metodología (RLHF, DPO, SFT). El sufijo "RFT" en el nombre sugiere Rejection Fine-Tuning o Rejective Fine-Tuning, una técnica de ajuste basada en filtrar respuestas por calidad, pero esto no está confirmado en la información disponible. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Comprensión de vídeo: el modelo está diseñado específicamente para tareas de razonamiento sobre contenido audiovisual, según se desprende del nombre y del dataset de entrenamiento.
- Generación de texto conversacional: el tag `conversational` indica que acepta formato de diálogo multi-turno.
- Procesamiento multimodal: requiere el archivo mmproj (proyector multimodal) para procesar entradas visuales junto con texto.
- Idiomas: únicamente inglés declarado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la información proporcionada.

## Casos de uso

- Análisis automático de vídeo en local: el modelo puede procesar secuencias de vídeo y generar descripciones o responder preguntas sobre su contenido, ejecutándose en una GPU de consumo gracias a las cuantizaciones Q4_K_M (2,0 GB) o Q5_K_M (2,3 GB). Es adecuado para prototipos de análisis de vídeo sin depender de APIs en la nube.
- Moderación de contenido audiovisual: con una cuantización Q8_0 (3,4 GB) se puede desplegar en una estación de trabajo para clasificar o describir vídeos subidos por usuarios, aprovechando la licencia Apache 2.0 para uso comercial.
- Asistencia a la accesibilidad: generación de descripciones textuales de vídeos para personas con discapacidad visual, ejecutando el modelo localmente con llama.cpp y el proyector mmproj-f16 para maximizar la calidad de la representación visual.
- Investigación en razonamiento multimodal: al ser un modelo pequeño (3,1B) con licencia permisiva, es útil como baseline para experimentos académicos de razonamiento sobre vídeo, con la ventaja de caber en una única GPU de 8-12 GB.
- Prototipado de aplicaciones de vídeo-vigilancia: análisis de clips cortos en entornos con requisitos de privacidad, donde los datos no pueden salir del dispositivo; la cuantización Q4_K_S (1,9 GB) permite ejecución en portátiles con GPU integrada.
- Integración en pipelines de análisis de medios: uso del modelo vía llama.cpp dentro de un flujo de procesamiento por lotes de vídeos (por ejemplo, extracción de resúmenes o etiquetado automático), aprovechando el bajo coste de inferencia de un modelo de 3B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K ~1,4 GB; Q4_K_M ~2,0 GB; Q6_K ~2,6 GB; Q8_0 ~3,4 GB; f16 ~6,3 GB. Añadir el proyector multimodal: mmproj-Q8_0 ~0,9 GB o mmproj-f16 ~1,4 GB.
- VRAM total recomendada: entre 3 y 5 GB para cuantizaciones Q4-Q6 con proyector incluido, más el espacio para el contexto KV cache (depende de la longitud de contexto, no documentada).
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100, H100). El modelo cabe holgadamente en GPUs de consumo.
- Cabe en consumer GPU: sí, en la mayoría de GPUs modernas con 6 GB o más; las cuantizaciones Q2-Q3 podrían ejecutarse incluso en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (si se publica con plantilla compatible), y potencialmente otros runners compatibles con GGUF y mmproj. vLLM y TGI no soportan GGUF de forma nativa para modelos multimodales de forma generalizada.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base que permitan una comparación rigurosa. Se ofrece una comparación estructural con alternativas de tamaño similar orientadas a vídeo o multimodalidad, indicando "no disponible" donde no hay datos verificables en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VideoRFT-3B (este) | 3,1B | no disponible | Apache 2.0 | GGUF, safetensors | Multimodal vídeo, solo inglés |
| Qwen2.5-VL-3B | ~3,8B | 32k (según documentación pública del modelo) | Apache 2.0 | safetensors, GGUF | Multimodal imagen/vídeo, multilingüe |
| SmolVLM-2.2B | ~2,2B | 8k (según documentación pública del modelo) | Apache 2.0 | safetensors, GGUF | Multimodal imagen/vídeo, muy ligero |
| VideoLLaMA3-2B | ~2B | no disponible | Apache 2.0 | safetensors | Multimodal vídeo |

Los datos de los modelos comparables provienen de conocimiento general y no de la información proporcionada en esta ficha; deben verificarse en sus respectivas model cards antes de usarse en producción.

## Limitaciones y advertencias

- Información muy escasa: la model card del repositorio GGUF es una plantilla genérica de cuantización; no hay documentación sobre arquitectura, entrenamiento ni evaluación del modelo base en la información disponible.
- Sesgos conocidos: no documentados; al entrenarse presumiblemente con datos en inglés, es esperable un sesgo hacia contenido anglófono y culturalmente anglosajón, aunque no está confirmado.
- Riesgo de alucinación: no cuantificado; como modelo generativo de 3B parámetros, es probable que alucine en tareas de razonamiento complejo o vídeos ambiguos, pero no hay datos publicados.
- Limitación de idioma: solo se declara inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Limitación de contexto: longitud de contexto no documentada; no se puede asumir soporte para vídeos largos sin verificación empírica.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base QiWang98/VideoRFT-3B y del dataset VideoRFT-Data por si hubiera condiciones adicionales no reflejadas en el tag.
- Cuantizaciones: las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Proyector multimodal: es imprescindible descargar el archivo mmproj correspondiente; sin él, el modelo no procesará entradas visuales.
- Madurez: el repositorio tiene muy pocas descargas (158) y cero likes, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VideoRFT-3B-GGUF
- Modelo base: https://huggingface.co/QiWang98/VideoRFT-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/QiWang98/VideoRFT-Data
- Página de descargas del cuantizador: https://hf.tst.eu/model#VideoRFT-3B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
