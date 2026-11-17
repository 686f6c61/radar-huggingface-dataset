# empirischtech/gemma-4-31B-it-Pharma-Sentiment-FP8

## Resumen

`empirischtech/gemma-4-31B-it-Pharma-Sentiment-FP8` es un ajuste fino del modelo multimodal `google/gemma-4-31B-it`, publicado por el usuario `empirischtech` en Hugging Face. El modelo está especializado en análisis de sentimiento dirigido (*targeted sentiment analysis*) en el dominio farmacéutico y biomédico, es decir, identificar la polaridad de opiniones asociadas a entidades concretas (fármacos, tratamientos, efectos adversos) dentro de textos clínicos o de literatura científica.

El modelo conserva la arquitectura y las capacidades del Gemma 4 de 31 000 millones de parámetros, incluyendo la entrada image-text-to-text, pero sus pesos se distribuyen en formato FP8 mediante `compressed-tensors`, lo que reduce el tamaño del repositorio a unos 33,3 GB y facilita el despliegue en vLLM. Se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar las condiciones en Hugging Face.

Es relevante ahora porque combina tres tendencias: modelos abiertos de gran tamaño con capacidades multimodales, cuantización FP8 lista para inferencia en producción y especialización vertical en dominios regulados como el farmacéutico, donde el análisis de sentimiento sobre farmacovigilancia y opiniones de pacientes tiene aplicaciones directas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Gemma 4 |
| Parametros totales | 31 273 088 876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); pesos empaquetados en FP8 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 comprimido via compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it`, un transformer multimodal de 31 000 millones de parámetros que procesa entradas de texto e imagen (pipeline `image-text-to-text`). El ajuste fino se orienta a la tarea de análisis de sentimiento dirigido en el ámbito farmacéutico y biomédico, tal como indican las etiquetas `sentiment-analysis`, `targeted-sentiment`, `pharma`, `biomedical` y `medical`.

Los pesos se han convertido a FP8 mediante la librería `compressed-tensors`, lo que permite su carga directa en vLLM con kernels de cuantización optimizados. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste fino, ni sobre si se aplicaron técnicas de RLHF o DPO. Los artículos referenciados en las etiquetas (arXiv:2411.03590, arXiv:2508.08224, arXiv:2311.16452) probablemente documentan la metodología de ajuste y evaluación, pero su contenido no está detallado en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés.
- Análisis de sentimiento dirigido a entidades farmacéuticas y biomédicas (fármacos, tratamientos, efectos adversos).
- Procesamiento de entradas multimodales image-text-to-text (heredado del modelo base).
- Razonamiento sobre textos clínicos y de literatura científica.
- Integración con `transformers` y `vllm` (endpoints compatibles).
- Capacidades multilingües: limitadas al inglés según la ficha.
- Tool calling / function calling: no disponible explícitamente en la información.
- Modo thinking o razonamiento extendido: no disponible en la información.

## Casos de uso

- Farmacovigilancia automatizada: el modelo puede procesar informes de eventos adversos y extraer la polaridad de sentimiento asociada a cada fármaco mencionado, ayudando a priorizar señales de seguridad en grandes volúmenes de texto.
- Análisis de opiniones de pacientes: clasificación de reseñas y foros de salud para detectar satisfacción o quejas sobre tratamientos concretos, aprovechando el ajuste específico en dominio farmacéutico.
- Monitorización de redes sociales sanitarias: seguimiento de conversaciones públicas sobre medicamentos y vacunas, con detección de sentimiento dirigido por entidad para informes de reputación.
- Revisión de literatura científica: extracción de sentimiento hacia intervenciones terapéuticas en abstracts y artículos, útil para revisiones sistemáticas asistidas.
- Análisis de encuestas clínicas: procesamiento de respuestas abiertas de ensayos clínicos para identificar actitudes hacia fármacos del estudio.
- Enriquecimiento de pipelines de datos biomédicos: integración como componente de clasificación en sistemas ETL que normalizan y etiquetan grandes corpus médicos antes de su uso en modelos downstream.
- Despliegue en producción con vLLM: gracias al formato FP8 y a la compatibilidad con endpoints, puede servirse como microservicio de análisis de sentimiento dentro de arquitecturas de IA clínica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 33,3 GB en FP8, por lo que se necesita al menos ~34 GB de VRAM para cargar los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: A100 80GB, H100 80GB, L40S 48GB; en consumer GPU, RTX 4090 24GB no es suficiente para FP8 completo, sería necesario cuantizar adicionalmente (por ejemplo, a 4 bits con GGUF/AWQ) o usar offloading.
- Cabe en consumer GPU: no en configuración FP8 nativa; sí tras cuantización adicional a 4 bits en GPUs de 24 GB o más.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors FP8), transformers; llama.cpp/Ollama requerirían conversión adicional no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| empirischtech/gemma-4-31B-it-Pharma-Sentiment-FP8 | 31,27B | no disponible | Apache 2.0 | gated en HF |
| google/gemma-4-31B-it (base) | 31B | no disponible | Gemma license (uso restringido) | gated en HF |
| Modelos de sentimiento biomédico especializados (p. ej. BioBERT/PubMedBERT fine-tuned) | ~0,1-0,3B | 512 tokens típicos | variable (MIT/Apache) | abiertos |

El modelo se diferencia de los clasificadores biomédicos ligeros por su tamaño (31B), capacidad generativa y multimodalidad, a costa de requisitos de hardware mucho mayores. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del modelo base Gemma 4, no documentados en la información disponible.
- Riesgo de alucinación: propio de modelos generativos de 31B; en dominio médico puede producir afirmaciones plausibles pero incorrectas.
- Limitaciones de idioma: soporta únicamente inglés según la ficha, lo que limita su uso en corpus en castellano u otras lenguas.
- Limitaciones de contexto: longitud de contexto no documentada; conviene verificar antes de usarlo con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso es gated y el modelo base Gemma puede imponer condiciones adicionales de uso que deben revisarse.
- Caveat para producción: el ajuste fino se centra en sentimiento farmacéutico; su uso fuera de ese dominio puede degradar la calidad. No se han publicado evaluaciones formales, por lo que se recomienda validación propia antes de desplegarlo en entornos clínicos o regulados.
- No sustituye juicio clínico ni debe usarse como única fuente en decisiones médicas.

## Enlaces

- Hugging Face: https://huggingface.co/empirischtech/gemma-4-31B-it-Pharma-Sentiment-FP8
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Paper referenciado: https://arxiv.org/abs/2411.03590
- Paper referenciado: https://arxiv.org/abs/2508.08224
- Paper referenciado: https://arxiv.org/abs/2311.16452
