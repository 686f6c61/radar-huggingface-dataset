# mradermacher/SingGuard-2b-GGUF

## Resumen

SingGuard-2b es un modelo guardrail multimodal desarrollado por inclusionAI, diseñado para la evaluación de seguridad de contenido en conversaciones que combinan texto e imágenes. A diferencia de los clasificadores de seguridad tradicionales, SingGuard trata la política de seguridad activa como una entrada en tiempo de ejecución: recibe reglas en lenguaje natural y verifica el contenido objetivo contra ellas regla por regla, prediciendo tanto la etiqueta de seguridad como la regla específica que se ha activado. Este enfoque permite adaptar dinámicamente el comportamiento del guardrail a distintos entornos y requisitos normativos sin necesidad de reentrenamiento.

La versión GGUF aquí descrita, publicada por mradermacher, es una cuantización estática del modelo original de 1.720.574.976 parámetros (aproximadamente 1,72B). Incluye tanto los pesos del modelo de lenguaje como los proyectores multimodales (mmproj) necesarios para procesar imágenes. El modelo está pensado para su despliegue en entornos de producción donde se requiere moderación de contenido en tiempo real, con soporte para múltiples formatos de cuantización que permiten ajustar el equilibrio entre precisión y consumo de recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (detalles internos no disponibles) |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (según ficha de HuggingFace; el paper menciona capacidades multilingües) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo (número de capas, dimensiones, tipo de atención, etc.). Se sabe que es un modelo multimodal que procesa texto e imágenes, y que incorpora un proyector multimodal (mmproj) para fusionar representaciones visuales con el modelo de lenguaje. El enfoque central de SingGuard es su mecanismo de adaptación a políticas: en lugar de estar fijado a un conjunto de reglas de seguridad predefinidas, el modelo recibe la política activa como entrada en tiempo de ejecución y evalúa el contenido contra cada regla de forma explícita. Esto implica un entrenamiento orientado a razonamiento sobre reglas y a la identificación de la regla específica que se viola, lo que lo diferencia de clasificadores binarios convencionales. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Evaluación de seguridad de contenido multimodal: analiza texto, imágenes y combinaciones de ambos para determinar si el contenido infringe una política dada.
- Razonamiento basado en reglas: verifica el contenido contra cada regla de la política activa y devuelve la etiqueta de seguridad (seguro/inseguro) junto con la regla específica que se ha activado.
- Adaptación dinámica a políticas: la política se proporciona como entrada en tiempo de ejecución, lo que permite cambiar las reglas sin reentrenar el modelo.
- Soporte para escenarios de consulta (query-side) y respuesta (response-side): puede evaluar tanto las peticiones del usuario como las respuestas generadas por un LLM.
- Capacidades multilingües: aunque la ficha de HuggingFace indica solo inglés, el paper describe el modelo como multilingüe; se recomienda verificar el soporte real para otros idiomas.
- Integración con pipelines de transformers y compatibilidad con endpoints (según las etiquetas de HuggingFace).

## Casos de uso

- Moderación de contenido en plataformas sociales: SingGuard puede analizar publicaciones que combinan texto e imágenes para detectar contenido dañino (violencia, discurso de odio, material explícito) siguiendo las políticas específicas de la plataforma, que pueden actualizarse dinámicamente.
- Guardrail para asistentes conversacionales: integrado como capa de seguridad antes de entregar la respuesta de un LLM, evalúa si la respuesta generada cumple con las políticas de la organización (por ejemplo, evitar consejos médicos o legales no autorizados).
- Filtrado de consultas en sistemas de búsqueda o recomendación: evalúa las peticiones del usuario para bloquear consultas malintencionadas o que intenten evadir restricciones.
- Cumplimiento normativo en sectores regulados: en banca o salud, donde las políticas de comunicación son estrictas, el modelo puede verificar que las respuestas automáticas no violen normativas específicas.
- Evaluación de contenido generado por IA en pipelines de CI/CD: para equipos que desarrollan aplicaciones con LLMs, SingGuard puede actuar como test de seguridad automatizado, verificando que las salidas del modelo en diferentes escenarios cumplan las políticas definidas.
- Investigación en seguridad de IA: como herramienta de análisis para estudiar cómo los modelos guardrail manejan políticas complejas y multimodales, útil para académicos y laboratorios de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo. El paper de SingGuard (arXiv:2606.22873) podría contener evaluaciones específicas, pero no se han extraído en esta ficha.

## Requisitos de hardware

- Los archivos GGUF varían en tamaño desde 0,9 GB (Q2_K) hasta 3,5 GB (f16). El modelo base en safetensors ocupa aproximadamente 1,72B parámetros, lo que en fp16 requeriría unos 3,4 GB de VRAM solo para los pesos.
- Para inferencia en GPU, una cuantización Q4_K_M (1,2 GB) cabe en GPUs con 2 GB de VRAM o más, como una NVIDIA GTX 1650 o superior. Para Q8_0 (1,9 GB) se recomienda al menos 4 GB de VRAM.
- En CPU, se puede ejecutar con llama.cpp u Ollama, aunque la velocidad dependerá de la memoria RAM y del número de núcleos. Con 8 GB de RAM es viable para las cuantizaciones más pequeñas.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si soporta GGUF), text-generation-webui, o mediante la librería transformers con el modelo base en safetensors.
- No se dispone de datos de latencia o throughput específicos para este modelo. Al ser un modelo de 2B, se espera una latencia baja en GPUs modernas (inferior a 100 ms por token en una RTX 4090, aunque esto es una estimación general no confirmada).

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos guardrail (como Llama Guard, ShieldGemma o WildGuard). No se han encontrado datos públicos de rendimiento relativo, ni especificaciones detalladas de estos modelos en la información proporcionada. Se recomienda consultar el paper de SingGuard para posibles comparaciones con alternativas.

## Limitaciones y advertencias

- La ficha de HuggingFace indica únicamente inglés como idioma soportado, aunque el paper menciona capacidades multilingües. Es necesario verificar el rendimiento real en otros idiomas antes de usarlo en producción.
- No se han publicado benchmarks independientes, por lo que la eficacia del modelo en tareas de moderación debe validarse con datos propios.
- Al ser una cuantización estática (no imatrix), puede haber una ligera degradación de calidad en comparación con el modelo original en precisión de clasificación, especialmente en cuantizaciones bajas como Q2_K o Q3_K.
- El modelo está diseñado específicamente para evaluación de seguridad; no es un modelo de generación de texto general y su uso fuera de ese ámbito puede dar resultados pobres.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base (inclusionAI/SingGuard-2b) por si hubiera restricciones adicionales.
- El tamaño del repositorio (17,2 GB) se debe a que incluye múltiples cuantizaciones y los proyectores multimodales; para un despliegue eficiente se debe seleccionar solo el archivo necesario.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/SingGuard-2b-GGUF
- Modelo base en HuggingFace: https://huggingface.co/inclusionAI/SingGuard-2b
- Repositorio GitHub: https://github.com/inclusionAI/SingGuard
- Paper en arXiv: https://arxiv.org/abs/2606.22873
- Página en ModelScope: https://www.modelscope.cn/models/inclusionAI/SingGuard-2b-GGUF
