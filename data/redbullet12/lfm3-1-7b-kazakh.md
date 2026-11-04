# RedBullet12/LFM3-1.7B-Kazakh

## Resumen

LFM3-1.7B-Kazakh es un ajuste fino del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario RedBullet12, orientado a dotar al modelo base de capacidad de comprensión y generación en kazajo (kk), un idioma que el modelo original no soporta. El problema que resuelve es concreto: ante un prompt en kazajo, el modelo base razona en inglés, identifica erróneamente el idioma como ucraniano o kirguís y, en la mayoría de los casos, no llega a responder. Este ajuste responde directamente en kazajo.

Técnicamente se trata de un fine-tuning por SFT con LoRA (rango 16, alpha 32, aplicado a todas las capas lineales) sobre el dataset AmanMussa/kazakh-instruction-v2, posteriormente fusionado en pesos completos. El entrenamiento se realizó en una única A100 (Colab) durante aproximadamente una hora, con 1 época y una tasa de aprendizaje de 2e-4.

El modelo conserva la arquitectura del LFM3 de Liquid AI (familia "liquid", con código personalizado y `trust_remote_code`), cuenta con 1.728.801.536 parámetros reales según safetensors y se distribuye bajo la licencia LFM Open License v1.0 heredada del modelo base. Es una versión v1, con limitaciones reconocidas por el autor en razonamiento y matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (familia "liquid" de Liquid AI), transformer con código personalizado (`custom_code`) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | kazajo (kk) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, categoría "other") |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un modelo de la familia LFM3 de Liquid AI con arquitectura propia identificada en los tags como "liquid" y que requiere `trust_remote_code=True` para su carga. No se dispone de detalles adicionales sobre el diseño interno (tipo de capas, mecanismo de atención, contexto máximo) en la información proporcionada.

El ajuste se realizó mediante SFT con TRL usando LoRA de rango 16 y alpha 32 sobre todas las capas lineales, con 1 época y LR 2e-4, y los adaptadores se fusionaron posteriormente en pesos completos. El dataset empleado es AmanMussa/kazakh-instruction-v2, con 52.123 filas de entrenamiento y 50 reservadas para evaluación. Según el autor, los datos son Alpaca traducido automáticamente con correcciones manuales, y el entrenamiento sobre respuestas únicamente ("answer-only") eliminó el paso de razonamiento (thinking) que tenía el modelo base. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en kazajo, respondiendo directamente en ese idioma en lugar de derivar al inglés.
- Instrucciones de un solo turno (formato chat con roles `user`/`assistant`).
- Comprensión de preguntas factuales sencillas en kazajo (por ejemplo, la capital de Kazajistán en el ejemplo de uso).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso; de hecho, el autor indica que el paso de "thinking" se perdió en el ajuste.
- Capacidad matemática y de razonamiento multi-paso: débil según el autor.
- No se documenta visión, audio ni otras modalidades.
- Multilingüismo: limitado al kazajo; no se garantiza buen comportamiento en otros idiomas.

## Casos de uso

- Asistentes conversacionales en kazajo: el modelo puede mantener diálogos de un turno en kazajo donde el modelo base fallaba por completo, lo que lo hace útil para prototipos de atención al usuario kazajoparlante.
- Traducción asistida kazajo→kazajo (reformulación y simplificación): puede reescribir o aclarar texto en kazajo, aunque la calidad de la formulación puede reflejar el origen traducido de los datos.
- Generación de respuestas a preguntas frecuentes: para bases de conocimiento con preguntas cerradas y respuestas verificadas, con revisión humana posterior por el riesgo de errores factuales.
- Etiquetado y clasificación ligera de texto en kazajo mediante prompting: tareas de extracción o categorización simple donde no se requiere razonamiento profundo.
- Experimentación académica sobre adaptación de modelos multilingües a idiomas de bajos recursos: sirve como caso de referencia de SFT con LoRA sobre un modelo que no soporta el idioma objetivo.
- Despliegue en entornos con recursos limitados: con 1,7 mil millones de parámetros, es viable en una sola GPU de consumo para inferencia, lo que facilita demos y pruebas internas.
- Generación de borradores de contenido en kazajo: textos cortos que un humano revisa y corrige, aprovechando que el modelo ya produce kazajo fluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 3,5 GB solo para pesos, más overhead de activaciones y caché KV; presupuesto práctico de 6-8 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2 GB para pesos; en 4 bits, en torno a 1 GB, aunque no se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: A100 (usada para el entrenamiento), H100 para mayor throughput; RTX 4090, RTX 3090 y tarjetas con 8 GB o más para inferencia en precisión completa.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM en fp16 (por ejemplo, RTX 3060 Ti 8 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Opciones de despliegue: transformers con `trust_remote_code=True` (método documentado por el autor); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF limita el uso en llama.cpp/Ollama sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Kazakh | 1,73 B | no disponible | kk | LFM Open License v1.0 | Ajuste LoRA SFT sobre LFM3-1.7B; responde en kazajo |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible | no disponible | LFM Open License v1.0 | No soporta kazajo: razona en inglés y falla al responder |
| Otros ajustes en kazajo de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Razonamiento matemático y multi-paso débil: el ajuste sobre datos de solo respuesta eliminó el paso de pensamiento del modelo base.
- Tendencia a bucles de repetición si no se aplican los parámetros de generación recomendados (`temperature=0.3`, `top_p=0.9`, `repetition_penalty=1.15`, `no_repeat_ngram_size=4`).
- Datos de entrenamiento traducidos automáticamente (Alpaca) con correcciones manuales: el fraseo puede sonar a traducción y algunas respuestas son factualmente incorrectas.
- Riesgo de alucinación en preguntas factuales; requiere verificación humana en producción.
- Cobertura monolingüe: solo kazajo; no se garantiza comportamiento correcto en otros idiomas.
- Licencia LFM Open License v1.0 (categoría "other"): es necesario revisar los términos del archivo LICENSE del repositorio antes de un uso comercial, ya que no es una licencia permisiva estándar.
- Requiere `trust_remote_code=True` por el código personalizado de la arquitectura, lo que implica ejecutar código del repositorio.
- Versión v1: el autor prevé continuar el preentrenamiento con texto nativo en kazajo antes del SFT en futuras versiones.
- Sin descargas ni valoraciones en el momento de la ficha: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RedBullet12/LFM3-1.7B-Kazakh
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/AmanMussa/kazakh-instruction-v2
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/RedBullet12/LFM3-1.7B-Kazakh/blob/main/LICENSE
- TRL (framework de SFT): https://github.com/huggingface/trl
