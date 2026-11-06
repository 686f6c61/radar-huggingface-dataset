# mradermacher/Llama-3.2-Tulu-3-1B-SFT-GGUF

## Resumen

Llama-3.2-Tulu-3-1B-SFT-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo erbacher/Llama-3.2-Tulu-3-1B-SFT, publicado por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF del checkpoint original, que a su vez deriva de Llama 3.2 1B de Meta ajustado con el dataset Tulu 3 de AI2. El modelo cuenta con 1.498.482.720 parámetros totales y está orientado a conversación en inglés.

La relevancia de esta publicación es práctica: ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta f16) para facilitar su despliegue en hardware modesto mediante llama.cpp u Ollama. El repositorio ocupa 13,8 GB e incluye tanto cuantizaciones estáticas como un enlace a las versiones con imatrix (i1) alojadas en un repositorio separado.

Al tratarse de una publicación de cuantización, la información técnica disponible se limita a los datos del modelo base y a la tabla de cuantizaciones proporcionada por el autor; no se incluyen resultados de benchmarks ni detalles del proceso de entrenamiento original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 1B) |
| Parámetros totales | 1.498.482.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Llama 3.2 1B, un transformer decoder-only de Meta con 1.500 millones de parámetros aproximadamente. El modelo base erbacher/Llama-3.2-Tulu-3-1B-SFT es un ajuste fino supervisado (SFT) de Llama 3.2 1B sobre el dataset Tulu 3 de AI2, orientado a tareas conversacionales e instrucciones.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La contribución de mradermacher se limita a la conversión y cuantización del checkpoint a GGUF, sin reentrenamiento ni modificación de pesos más allá de la propia cuantización.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés.
- Razonamiento básico y respuesta a preguntas de conocimiento general.
- Generación de código y matemáticas a nivel de modelo pequeño (capacidad limitada por el tamaño).
- Soporte de conversaciones multi-turno mediante formato de chat (tag `conversational`).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte explícito de tool calling, function calling ni modo de razonamiento extendido.

## Casos de uso

- Prototipado rápido en local: gracias a las cuantizaciones Q4_K_M (1,1 GB) y Q5_K_M (1,2 GB), el modelo puede ejecutarse en portátiles con 8 GB de RAM para probar pipelines conversacionales sin infraestructura GPU.
- Asistentes de texto en dispositivos de borde: la versión Q2_K (0,8 GB) permite desplegar un chatbot básico en Raspberry Pi o dispositivos con recursos muy limitados.
- Filtrado y clasificación de texto: el modelo puede usarse para tareas de etiquetado, resumen corto o reescritura en inglés donde la latencia importa más que la precisión máxima.
- Generación de borradores en aplicaciones de escritorio: integrable vía Ollama o llama.cpp en herramientas de edición de texto para autocompletado y sugerencias.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes que permiten medir el impacto de la cuantización en perplejidad y calidad para un modelo de 1,5B.
- Educación e investigación: modelo ligero para estudiar el efecto del SFT con Tulu 3 sobre Llama 3.2 1B y comparar con el checkpoint original en safetensors.
- Base para ajuste fino posterior: al ser un modelo pequeño, sirve como punto de partida para fine-tuning en tareas específicas con recursos de una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K ~0,8 GB; Q3_K ~0,9 GB; IQ4_XS/Q4_K_S ~1,0 GB; Q4_K_M ~1,1 GB; Q5_K ~1,2 GB; Q6_K ~1,3 GB; Q8_0 ~1,7 GB; f16 ~3,1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para las cuantizaciones Q4-Q8. Para f16 basta una RTX 3060 o superior.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas, e incluso en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede servirse con transformers, vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; para un modelo de 1,5B en cuantización Q4 se espera un throughput alto en GPU consumer, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-Tulu-3-1B-SFT-GGUF (este) | 1,5B | no disponible | no disponible | GGUF | Cuantización de un SFT sobre Tulu 3 |
| Llama 3.2 1B Instruct (Meta) | 1,2B | 128K (según Meta) | Llama 3.2 Community License | safetensors, GGUF | Modelo oficial con contexto largo |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (según Qwen) | Apache 2.0 | safetensors, GGUF | Multilingüe, licencia permisiva |
| SmolLM2-1.7B-Instruct | 1,7B | 8K (según Hugging Face) | Apache 2.0 | safetensors, GGUF | Alternativa ligera con licencia abierta |

Nota: los datos de contexto y licencia de los modelos comparados provienen del conocimiento general de sus respectivas model cards; no se han verificado en la información proporcionada para este modelo.

## Limitaciones y advertencias

- Modelo de 1,5B parámetros: capacidad de razonamiento, conocimiento factual y calidad de código limitadas en comparación con modelos de mayor tamaño; alta propensión a alucinaciones en temas especializados.
- Solo inglés: no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Licencia no especificada en la información disponible: es imprescindible verificar la licencia del modelo base (Llama 3.2 Community License) y del checkpoint erbacher antes de uso comercial.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; el autor recomienda Q4_K_M o superiores para uso práctico.
- El modelo es un SFT, no un modelo alineado con RLHF/DPO según la información disponible; puede producir contenido inapropiado o no seguir instrucciones complejas de forma fiable.
- Sin datos de benchmarks publicados: no es posible comparar su rendimiento de forma objetiva con alternativas.
- Repositorio con muy pocas descargas (21) y sin likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-3.2-Tulu-3-1B-SFT-GGUF
- Modelo base (SFT): https://huggingface.co/erbacher/Llama-3.2-Tulu-3-1B-SFT
- Cuantizaciones con imatrix (i1): https://huggingface.co/mradermacher/Llama-3.2-Tulu-3-1B-SFT-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#Llama-3.2-Tulu-3-1B-SFT-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
