# bharatgenai/AyurParam

## Resumen

AyurParam es un modelo de lenguaje especializado en Ayurveda desarrollado por BharatGen AI, construido como un ajuste fino (fine-tune) del modelo base bharatgenai/Param-1-2.9B-Instruct. Con 2.860.673.024 parámetros (aproximadamente 2,9 mil millones), está diseñado para mantener conversaciones y generar contenido relacionado con la medicina ayurvédica, una de las tradiciones médicas más extendidas del subcontinente indio. El modelo se distribuye a través de Hugging Face con acceso restringido (gated), lo que obliga a aceptar condiciones de uso antes de la descarga.

La relevancia de AyurParam radica en su especialización vertical: en lugar de competir como modelo generalista, se posiciona como una herramienta de dominio para aplicaciones de salud tradicional, educación y divulgación en hindi e inglés. Al derivar de Param-1, hereda la arquitectura transformer del modelo base y su soporte bilingüe, pero incorpora datos y ajustes específicos del corpus ayurvédico.

El modelo se publica bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos, aunque el acceso gated añade una fricción operativa que conviene tener en cuenta en despliegues automatizados. Su tamaño contenido (2,9B) lo hace viable en hardware de gama media, lo que reduce la barrera de entrada frente a alternativas de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Param-1-2.9B-Instruct) |
| Parametros totales | 2.860.673.024 (~2,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; se asume compatibilidad con cuantizacion estandar, no confirmado) |
| Idiomas soportados | Hindi (hi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AyurParam es un fine-tune del modelo bharatgenai/Param-1-2.9B-Instruct, que a su vez forma parte de la familia Param-1 de BharatGen AI. La arquitectura subyacente es un transformer decoder-only de aproximadamente 2,9 mil millones de parámetros, orientado a generación de texto y conversación. El modelo ha sido ajustado sobre datos del dominio ayurvédico para adaptar su vocabulario, estilo y conocimiento factual a esta disciplina.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni la presencia de fases de RLHF o DPO en el ajuste. El modelo incluye código personalizado (`custom_code` en los tags), lo que implica que requiere confiar en implementaciones remotas al cargarlo con `transformers`. La ficha no documenta innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en hindi e inglés.
- Conocimiento especializado en Ayurveda: terminología, conceptos, prácticas y textos de la tradición.
- Respuestas multi-turno orientadas a diálogo.
- Capacidad de razonamiento general heredada del modelo base Param-1-2.9B-Instruct.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Asistente educativo en Ayurveda: el modelo puede explicar conceptos como doshas, panchakarma o fitoterapia ayurvédica en hindi e inglés, sirviendo como apoyo a estudiantes y divulgadores.
- Atención al cliente en clínicas y centros ayurvédicos: gestión de consultas frecuentes sobre tratamientos, preparaciones y hábitos, con conversaciones multi-turno.
- Generación de contenido editorial: redacción de artículos, fichas de productos herbales y material divulgativo adaptado al registro del dominio.
- Traducción y adaptación terminológica hindi-inglés: apoyo en la localización de textos ayurvédicos manteniendo la precisión conceptual.
- Chatbot integrado en portales de salud tradicional: respuestas a preguntas generales con derivación a profesionales cuando proceda.
- Investigación y anotación asistida: generación de resúmenes y borradores sobre textos clásicos ayurvédicos para revisión humana.
- Formación de personal: simulaciones de diálogo para entrenar a personal de recepción o divulgación en centros especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 6 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 8-10 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3-4 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2 GB para pesos.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A10, L4, A100 para despliegues con concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en FP16, y en 6 GB con cuantización.
- Opciones de despliegue: `transformers` (requiere `trust_remote_code=True` por el código personalizado), vLLM, TGI y llama.cpp/Ollama si se generan pesos GGUF (no confirmado oficialmente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Especializacion |
|---|---|---|---|---|---|
| AyurParam | ~2,9B | No disponible | hi, en | Apache 2.0 | Ayurveda |
| Param-1-2.9B-Instruct | ~2,9B | No disponible | hi, en | No disponible en esta ficha | Generalista |
| Modelos medicos genericos de ~3B | ~3B | Variable | Principalmente en | Variable | Medicina general |

La comparación con alternativas médicas generalistas es limitada porque no se dispone de datos de benchmarks de AyurParam. Su principal diferenciador es la especialización en Ayurveda y el soporte nativo del hindi, frente a modelos médicos centrados en inglés.

## Limitaciones y advertencias

- Riesgo de alucinación en un dominio sensible: las respuestas sobre salud pueden contener inexactitudes; no debe usarse como sustituto de consejo médico profesional.
- Sesgos derivados del corpus de entrenamiento: la visión del Ayurveda puede estar sesgada hacia determinadas tradiciones o fuentes.
- Idiomas limitados a hindi e inglés; no se garantiza calidad en otras lenguas, incluido el castellano.
- Longitud de contexto no documentada: conviene validar empíricamente el comportamiento en conversaciones largas.
- Acceso gated: requiere aceptar condiciones en Hugging Face, lo que complica la automatización de descargas en CI/CD.
- Código personalizado: la carga con `transformers` exige `trust_remote_code=True`, con el riesgo de seguridad asociado.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso clínico o divulgativo recae en el integrador.
- No hay evidencia publicada de evaluaciones de seguridad, sesgo o toxicidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bharatgenai/AyurParam
- Modelo base: https://huggingface.co/bharatgenai/Param-1-2.9B-Instruct
- Paper referenciado (arXiv:2511.02374): https://arxiv.org/abs/2511.02374
- Organización BharatGen AI en Hugging Face: https://huggingface.co/bharatgenai
