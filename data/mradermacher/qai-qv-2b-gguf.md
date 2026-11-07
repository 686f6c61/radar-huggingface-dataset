# mradermacher/QAI-QV-2B-GGUF

## Resumen

QAI-QV-2B-GGUF es la versión cuantizada en formato GGUF del modelo QualityAI/QAI-QV-2B, un modelo multimodal de tipo vision-lenguaje construido sobre la arquitectura Qwen2-VL. Lo publica mradermacher, un conocido creador de cuantizaciones GGUF para la comunidad de inferencia local, y está pensado para ejecutar el modelo original en hardware de consumo mediante llama.cpp y derivados. El modelo base tiene 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), lo que lo sitúa en la gama ligera de modelos multimodales.

El modelo base parece estar especializado en análisis de imágenes dermatológicas: la model card referencia el dataset SeyedAli/Skin-Lesion-Dataset, lo que sugiere un ajuste fino orientado a la clasificación o descripción de lesiones cutáneas. Esta especialización, junto con su tamaño reducido, lo hace interesante para prototipos de triaje visual o asistentes clínicos de bajo coste computacional.

La relevancia de esta ficha radica en que ofrece el modelo en múltiples niveles de cuantización (desde Q2_K de 0,8 GB hasta f16 de 3,2 GB), incluyendo un fichero mmproj-fp16 necesario para habilitar la torre visual. No obstante, la información pública disponible es muy limitada: no hay datos de benchmarks, licencia ni detalles de entrenamiento más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (transformer multimodal vision-lenguaje) |
| Parametros totales | 1.543.714.304 (aprox. 1,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-fp16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base QualityAI/QAI-QV-2B emplea la arquitectura Qwen2-VL, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. La etiqueta `qwen2_vl` en los metadatos y el fichero `mmproj-fp16.gguf` confirman la presencia de una torre de proyección visual necesaria para procesar imágenes. El tamaño de 1,5 B parámetros corresponde a una variante compacta de la familia Qwen2-VL.

No se dispone de información detallada sobre el proceso de entrenamiento: número de tokens, composición del dataset (más allá de la referencia al Skin-Lesion-Dataset), uso de RLHF/DPO u otras técnicas de alineación. La model card del repositorio cuantizado no incluye estos datos, y la del modelo base no se ha proporcionado en la información disponible. Las cuantizaciones son estáticas (no hay versiones imatrix/weighted publicadas por el autor en el momento de la ficha), lo que implica una calidad algo inferior a la que se obtendría con cuantizaciones ponderadas.

## Capacidades

- Generación de texto conversacional en inglés, con soporte multi-turno.
- Procesamiento de imágenes (vision-lenguaje) mediante el fichero mmproj, lo que permite describir, clasificar o razonar sobre imágenes.
- Especialización probable en imágenes dermatológicas (lesiones cutáneas), derivada del dataset de ajuste referenciado.
- Compatible con endpoints de inferencia (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Triaje visual de lesiones cutáneas en prototipos clínicos: el modelo puede recibir una imagen dermatológica y generar una descripción o clasificación preliminar, aprovechando su ajuste sobre el Skin-Lesion-Dataset. Adecuado por su tamaño reducido y su naturaleza multimodal.
- Asistente de documentación médica en local: integrado en una aplicación de escritorio con llama.cpp, permite describir imágenes clínicas sin enviar datos a la nube, lo que resulta relevante por privacidad.
- Educación y formación dermatológica: generación de descripciones textuales de imágenes de lesiones para materiales didácticos o cuestionarios.
- Preprocesamiento en pipelines de visión: uso como modelo ligero para generar captions o etiquetas preliminares sobre imágenes antes de pasarlas a un modelo mayor.
- Chat multimodal en hardware de consumo: despliegue en portátiles con GPU modesta (por ejemplo, 4-8 GB de VRAM) usando la cuantización Q4_K_M de 1,1 GB más el mmproj, para demostraciones interactivas.
- Investigación en cuantización y evaluación multimodal: al ofrecer 12 niveles de cuantización, sirve para estudiar la degradación de calidad en tareas visión-lenguaje con modelos pequeños.
- Integración en aplicaciones de escritorio offline: mediante Ollama o llama.cpp, para asistentes que necesiten procesar imágenes localmente sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,5 GB y 2,5 GB en cuantizaciones Q4/Q5 (pesos de 1,0-1,2 GB más el mmproj-fp16 de 1,4 GB y overhead de contexto); en Q8_0, aproximadamente 3,5-4 GB; en f16, en torno a 5 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4070) para cuantizaciones Q4-Q8; A100/H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 4 GB o más usando Q4_K_M; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF y mmproj (llava.cpp). Para el modelo base en safetensors, transformers con soporte Qwen2-VL.
- Latencia y throughput estimados: no disponibles; por el tamaño (1,5 B) se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| QAI-QV-2B-GGUF | 1,5 B | no disponible | no disponible | GGUF | Especializado en imágenes dermatológicas |
| Qwen2-VL-2B-Instruct | ~2 B | 32 K (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | safetensors, GGUF | Modelo generalista multimodal de referencia |
| SmolVLM-2B | ~2 B | no disponible | Apache 2.0 (según documentación pública) | safetensors, GGUF | Alternativa ligera multimodal de Hugging Face |
| LLaVA-OneVision-0.5B | ~0,5 B | no disponible | Apache 2.0 (según documentación pública) | safetensors, GGUF | Variante aún más pequeña para visión |

La comparativa se basa en datos públicos de los modelos alternativos; los valores de contexto y licencia de QAI-QV-2B no están confirmados en la información disponible.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base QualityAI/QAI-QV-2B antes de desplegarlo en producción.
- Especialización estrecha: el ajuste sobre un dataset de lesiones cutáneas puede degradar el rendimiento en tareas visuales generales fuera del dominio dermatológico.
- Riesgo de alucinación: como todo modelo generativo de 1,5 B, puede inventar descripciones o diagnósticos; no debe usarse como herramienta de diagnóstico médico sin supervisión profesional.
- Idiomas: solo inglés según los metadatos; no hay soporte declarado de castellano.
- Contexto: no se ha publicado la longitud de contexto, lo que dificulta planificar conversaciones largas o documentos extensos.
- Cuantizaciones estáticas: la ausencia de versiones imatrix/weighted puede implicar mayor degradación de calidad en los niveles bajos (Q2_K, Q3_K_M).
- Datos de entrenamiento y benchmarks ausentes: no hay evidencia pública de rendimiento que permita comparar rigurosamente con alternativas.
- Sesgos: no documentados; al entrenar sobre un dataset médico concreto, pueden existir sesgos de representación demográfica en las imágenes.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/mradermacher/QAI-QV-2B-GGUF
- Modelo base: https://huggingface.co/QualityAI/QAI-QV-2B
- Página de descargas del autor: https://hf.tst.eu/model#QAI-QV-2B-GGUF
- Dataset referenciado: https://huggingface.co/datasets/SeyedAli/Skin-Lesion-Dataset
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
