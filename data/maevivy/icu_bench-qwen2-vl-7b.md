# MaeVivy/ICU_Bench-Qwen2-VL-7B

## Resumen

ICU_Bench-Qwen2-VL-7B es una adaptación de dominio del modelo multimodal Qwen2-VL-7B-Instruct, publicada por el usuario MaeVivy, orientada al benchmark ICU-Bench para *continual unlearning* (olvido continuo) en modelos de lenguaje multimodal (MLLM). El problema que aborda es la eliminación secuencial de información privada en escenarios documentales sensibles: en lugar de un borrado puntual, las solicitudes de eliminación llegan de forma continua y el modelo debe olvidar el contenido recién señalado sin recuperar lo ya olvidado ni degradar su utilidad general.

El modelo se construye sobre Qwen2-VL-7B-Instruct, un transformer multimodal con 8.291.375.616 parámetros (aproximadamente 8,3 mil millones) en precisión BF16, capaz de procesar entradas image-text-to-text. La adaptación está pensada como artefacto de referencia para investigar el comportamiento de olvido en modelos multimodales, no como un asistente de propósito general.

Su relevancia es metodológica: ICU-Bench introduce un protocolo de evaluación consciente del historial (olvido actual, retención de olvidos previos, utilidad retenida y estabilidad de secuencia) sobre datos sintéticos de perfiles médicos y contratos laborales. El repositorio tiene un uso muy reducido (27 descargas, 1 like) y está etiquetado únicamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2-VL), vision-language, image-text-to-text |
| Parametros totales | 8.291.375.616 (aproximadamente 8,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, BF16 segun model card) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2-VL-7B-Instruct |
| Tamano del repositorio | 33,2 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2-VL, un transformer multimodal que combina un codificador visual con un modelo de lenguaje para procesar imágenes y texto de forma conjunta, con percepción de resolución arbitraria segun el paper de referencia (arXiv:2409.12191). Sobre esa base, esta variante incorpora un ajuste fino orientado al benchmark ICU-Bench, cuyo objetivo es el *continual unlearning*: eliminar de forma secuencial información privada de perfiles sintéticos sin perder utilidad ni reexponer datos previamente olvidados.

Los datos de entrenamiento corresponden al conjunto de ICU-Bench: 1.000 perfiles sintéticos sensibles de dos dominios (informes médicos y contratos laborales), 9.500 imágenes de documentos, 16.000 pares pregunta-respuesta y 100 tareas de olvido secuencial. Cada perfil se instancia en tres vistas (imagen completa, imagen enmascarada y solo texto) para evaluar el comportamiento bajo distintos niveles de exposición de la información. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset de ajuste ni si se emplearon RLHF o DPO.

## Capacidades

- Procesamiento multimodal image-text-to-text: responde a preguntas sobre imágenes de documentos.
- Razonamiento sobre documentos con información sensible (perfiles médicos y contratos laborales).
- Soporte de *continual unlearning*: capacidad de olvidar contenido señalado de forma secuencial manteniendo olvidos previos.
- Evaluación bajo tres vistas de información: imagen completa, imagen enmascarada y solo texto.
- Conversacional (etiqueta `conversational` en el repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Investigación en *machine unlearning* multimodal: usar el modelo como referencia para medir si una técnica de olvido secuencial satisface solicitudes sucesivas de borrado sin recuperar contenido previamente eliminado.
- Evaluación de privacidad en documentos: reproducir el protocolo de ICU-Bench sobre perfiles médicos y contratos para cuantificar la retención de olvidos históricos y la estabilidad de la secuencia.
- Auditoría de fuga de información: comparar las tres vistas (imagen completa, enmascarada y texto) para detectar si el modelo filtra datos privados por una modalidad distinta a la solicitada.
- Desarrollo de pipelines de cumplimiento (RGPD): servir de banco de pruebas para validar mecanismos de eliminación de datos personales en sistemas que procesan documentos escaneados.
- Estudio de degradación de utilidad: medir cuánta capacidad general (QA sobre documentos retenidos) se pierde tras aplicar un olvido continuo, usando los pares pregunta-respuesta del benchmark.
- Baseline para comparativas académicas: emplear esta adaptación como punto de partida frente a otras técnicas de unlearning en MLLM sobre el mismo conjunto de 100 tareas secuenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,6 GB en BF16 solo para pesos (8,29 B de parámetros); en la práctica, con caché KV y procesamiento de imágenes, se recomienda al menos 24 GB.
- En cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque no se confirman cuantizaciones publicadas para esta variante.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de referencia; RTX 4090 (24 GB) viable en BF16 con lotes pequeños.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 16 GB o menos; no confirmado por el autor.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama (estas últimas requieren conversión a GGUF, no incluida en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ICU_Bench-Qwen2-VL-7B | 8,3 B | no disponible | Unlearning continuo multimodal | apache-2.0 | Hugging Face (27 descargas) |
| Qwen2-VL-7B-Instruct | aproximadamente 8 B | no disponible | VLM generalista | apache-2.0 | Hugging Face (modelo base) |
| Alternativas de unlearning multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en el benchmark ICU-Bench; su utilidad como asistente general puede ser inferior a la del Qwen2-VL-7B-Instruct original.
- Solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Riesgo de alucinación inherente a los MLLM, especialmente al responder sobre documentos con información parcialmente enmascarada.
- El *unlearning* no garantiza eliminación completa: pueden persistir trazas de información privada, y el protocolo del benchmark está diseñado precisamente para detectar esos fallos.
- Los datos de entrenamiento son sintéticos; el comportamiento sobre documentos reales puede diferir.
- Licencia apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y el cumplimiento normativo en tratamientos de datos personales.
- Uso muy limitado en la comunidad (27 descargas, 1 like) y sin validación externa publicada; no se recomienda para producción sin evaluación propia.
- No se documentan la longitud de contexto, las cuantizaciones ni los requisitos de hardware específicos de esta adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaeVivy/ICU_Bench-Qwen2-VL-7B
- Repositorio GitHub de ICU-Bench: https://github.com/AstorYH/ICU-Bench/tree/main
- Paper ICU-Bench: https://arxiv.org/abs/2605.05938
- Paper Qwen2-VL: https://arxiv.org/abs/2409.12191
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct
