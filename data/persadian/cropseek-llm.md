# persadian/CropSeek-LLM

## Resumen

CropSeek-LLM es un modelo de lenguaje de dominio específico orientado a agricultura y optimización de cultivos, desarrollado por persadian bajo el sello DARJYO. Se construye mediante un ajuste fino con LoRA sobre `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`, un modelo destilado de la familia DeepSeek R1 con arquitectura Qwen. El resultado es un modelo causal de aproximadamente 7 mil millones de parámetros que conserva las capacidades de razonamiento del modelo base e incorpora especialización en agronomía: siembra, condiciones del suelo, control de plagas, riego y rotación de cultivos.

El modelo se entrenó sobre el dataset `DARJYO/sawotiQ29_crop_optimization`, un corpus curado de textos agrícolas que incluye descripciones de cultivos, síntomas y tratamientos de enfermedades vegetales, buenas prácticas de cultivo y guías regionales. Está pensado para integrarse en sistemas de asesoramiento agrícola, aplicaciones móviles y chatbots de agritech, tanto en entornos offline como en la nube.

Su relevancia actual radica en la tendencia hacia modelos de dominio verticalizado: en lugar de competir en capacidades generales, CropSeek-LLM apunta a un nicho concreto donde la precisión terminológica y el razonamiento agronómico importan más que el conocimiento enciclopédico amplio. La licencia DARJYO v1.3 permite uso comercial con atribución y citación obligatorias. El modelo solo soporta inglés y no publica resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivada de Qwen, base DeepSeek-R1-Distill-Qwen-7B) |
| Parametros totales | Aproximadamente 7 mil millones (heredados del modelo base; no se especifica cifra exacta) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés |
| Licencia | DARJYO License v1.3 (uso comercial permitido con atribución y citación) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

CropSeek-LLM es un transformer causal denso de aproximadamente 7B parámetros, construido sobre `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`. Ese modelo base combina la arquitectura Qwen con el proceso de destilación de razonamiento de DeepSeek R1, de modo que CropSeek-LLM hereda la capacidad de generar cadenas de razonamiento antes de responder. El ajuste se realizó mediante LoRA (Low-Rank Adaptation), una técnica de ajuste fino eficiente en parámetros que congela los pesos originales e introduce adaptadores de bajo rango entrenables.

El entrenamiento se llevó a cabo en una única GPU Nvidia Tesla T4 durante aproximadamente 10 horas, con precisión mixta fp16, batch size de 16, learning rate de 2e-5, optimizador AdamW, weight decay de 0.01, 500 pasos de warmup y 3 épocas. El dataset `DARJYO/sawotiQ29_crop_optimization` se limpió y preprocesó, se tokenizó con el tokenizador del modelo base y se aumentó con técnicas de sustitución de sinónimos y parafraseo para mejorar la generalización. No se documenta el número de tokens de entrenamiento ni la composición exacta del corpus.

## Capacidades

- Generación de texto y razonamiento en inglés con estilo de cadena de pensamiento heredado de DeepSeek R1.
- Asesoramiento agronómico: épocas de siembra óptimas, condiciones ideales de suelo, métodos de control natural de plagas, prácticas de riego y estrategias de rotación de cultivos.
- Interpretación de condiciones ambientales y del suelo en contextos agrícolas.
- Respuesta a preguntas de dominio (Q&A) sobre fitopatología, tratamientos de enfermedades vegetales y buenas prácticas de cultivo.
- Soporte de razonamiento multi-paso para decisiones de apoyo a la explotación agrícola.
- Integración en sistemas de asesoramiento, aplicaciones móviles y chatbots mediante la API de `transformers`.
- No se documenta soporte explícito de tool calling, function calling, visión, audio ni otras modalidades.

## Casos de uso

- Asesoramiento agrícola conversacional: el modelo puede mantener diálogos multi-turno con agricultores y agrónomos respondiendo sobre épocas de siembra, suelos y riego, apoyándose en su especialización de dominio y en el razonamiento heredado de DeepSeek R1.
- Aplicaciones móviles de agritech: integración como backend de recomendaciones en tiempo real para pequeños productores, gracias a su tamaño de 7B que permite despliegue en infraestructura moderada.
- Sistemas de apoyo a la decisión en explotaciones: consultas sobre rotación de cultivos y planificación de temporada, con el modelo como capa de razonamiento sobre datos agronómicos del usuario.
- Chatbots de atención a productores: respuestas sobre síntomas de enfermedades vegetales y tratamientos recomendados, con la advertencia de validación por expertos locales.
- Investigación y docencia en agronomía: generación de explicaciones y material didáctico sobre prácticas agrícolas, aprovechando la licencia que permite uso académico con atribución.
- Ajuste fino posterior para nichos regionales: al ser un modelo de 7B con LoRA, sirve como punto de partida para especializar aún más en cultivos o geografías concretas con recursos limitados.
- Despliegue en entornos con conectividad limitada: su tamaño permite ejecución en una sola GPU, lo que facilita instalaciones offline en zonas rurales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14-16 GB para los pesos de un modelo de 7B, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones estándar para 7B; el autor no publica variantes cuantizadas).
- GPU recomendadas: A100, H100 o L40S para producción con concurrencia; RTX 4090 (24 GB) para fp16 en una sola tarjeta; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 y en tarjetas de 8-12 GB con cuantización.
- Opciones de despliegue: `transformers` con `device_map="auto"` (documentado por el autor); vLLM, TGI, llama.cpp u Ollama no están documentados oficialmente pero son compatibles en la práctica con arquitecturas Qwen de 7B.
- Latencia y throughput: no disponibles. El entrenamiento se realizó en una T4 durante unas 10 horas, dato que no informa sobre inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CropSeek-LLM | ~7B | No disponible | Agricultura / cultivos | DARJYO v1.3 (comercial con atribución) | Hugging Face, Space DARJYO |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | ~7B | No disponible en la información | General con razonamiento | MIT (modelo base) | Hugging Face |
| Modelos agrícolas de dominio (por ejemplo, variantes AgriLLM) | Variable | Variable | Agricultura | Variable | No disponible en la información |

La comparación directa con alternativas agrícolas específicas no está disponible en la información proporcionada. Frente a su modelo base, CropSeek-LLM añade especialización de dominio a costa de perder generalidad y de adoptar una licencia más restrictiva que la del original.

## Limitaciones y advertencias

- Sesgo de datos: el dataset se centra en cultivos y regiones concretas; puede no generalizar a otros cultivos o geografías.
- Alcance limitado: el modelo está ajustado para optimización de cultivos y puede ofrecer respuestas imprecisas en temas no agrícolas.
- Riesgo de alucinación: como todo LLM, puede inventar tratamientos, dosis o prácticas; el autor recomienda validar con agrónomos locales.
- Solo inglés: no se documenta soporte multilingüe, lo que limita su uso en mercados hispanohablantes sin traducción intermedia.
- No debe usarse para consejo médico, financiero ni decisiones de inversión, según el propio autor.
- No sustituye el criterio de un profesional agrícola; debe emplearse como herramienta complementaria.
- Licencia DARJYO v1.3: el uso comercial exige atribución y citación; conviene revisar el texto completo de la licencia antes de desplegar en producción.
- Longitud de contexto no documentada: planificar integraciones asumiendo el contexto del modelo base Qwen de 7B, sin garantías adicionales.
- El repositorio figura con tamaño de 0.0 GB en los metadatos, lo que puede indicar que los pesos no están alojados o que la información está incompleta; verificar la disponibilidad real de los safetensors antes de integrar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/persadian/CropSeek-LLM
- Space de demostración: https://huggingface.co/spaces/DARJYO/CropSeek-LLM
- Dataset de entrenamiento: https://huggingface.co/datasets/DARJYO/sawotiQ29_crop_optimization
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Licencia: https://huggingface.co/persadian/CropSeek-LLM/raw/main/LICENSE
- DOI: https://doi.org/10.57967/hf/5849
