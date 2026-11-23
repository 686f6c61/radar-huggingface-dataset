# mradermacher/Logistes-1.0-GGUF

## Resumen

Logistes-1.0 es un modelo de lenguaje de 1.170.340.608 parámetros (aproximadamente 1,17 mil millones) desarrollado por Openwist y distribuido en formato GGUF por el cuantizador mradermacher. Se trata de un ajuste fino mediante LoRA sobre un modelo base no especificado en la información disponible, orientado explícitamente al uso en dispositivo (on-device) y al uso de herramientas (tool-use), según las etiquetas de la model card.

La relevancia de esta ficha radica en que el repositorio publicado por mradermacher contiene únicamente las versiones cuantizadas en GGUF del modelo original, con un conjunto amplio de niveles de cuantización que van desde Q2_K (0,6 GB) hasta f16 (2,4 GB). Esto lo hace candidato para despliegues en hardware de consumo y entornos con memoria limitada, donde un modelo de 1,17 B parámetros cuantizado a 4 bits ocupa menos de 1 GB.

No obstante, la información disponible es muy limitada: no se especifican la arquitectura concreta, la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks. La licencia indicada es lfm1.0 (Liquid Foundation Model license), lo que impone restricciones que deben revisarse antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, inferido por el formato de pesos y la librería transformers) |
| Parámetros totales | 1.170.340.608 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (Liquid Foundation Model license) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Los metadatos indican que se trata de un ajuste fino mediante LoRA sobre el modelo base Openwist/Logistes-1.0, y que el resultado se distribuye a través de la librería transformers. El recuento de parámetros (1,17 B) y el hecho de que el autor lo etiquete como on-device sugieren un modelo compacto pensado para inferencia local, pero no se confirma la familia arquitectónica (transformer denso, MoE, híbrido, etc.).

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio GGUF es puramente operativa: describe los cuantizados disponibles y remite al modelo base para más detalles, sin aportar información sobre el proceso de entrenamiento. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.) sería especulativa y no se incluye.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Uso de herramientas (tool-use / function calling), según la etiqueta "tool-use" de la model card.
- Orientación a despliegue en dispositivo (on-device), según la etiqueta homónima.
- Ajuste fino mediante LoRA sobre el modelo base Openwist/Logistes-1.0.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- No se documentan capacidades de visión, audio, modo thinking ni razonamiento multi-paso explícito.

## Casos de uso

- Asistentes locales en dispositivo: con 1,17 B parámetros y cuantizaciones de 0,6 a 1,3 GB, el modelo puede ejecutarse en portátiles y equipos de gama media sin GPU dedicada, ofreciendo un asistente conversacional que no envía datos a la nube. Es adecuado por su tamaño reducido y su orientación explícita a on-device.
- Integración de tool calling en aplicaciones de escritorio: la etiqueta tool-use sugiere que el modelo puede invocar funciones definidas por el desarrollador (por ejemplo, abrir aplicaciones, consultar APIs locales), lo que permite construir agentes ligeros que operan sobre el sistema de archivos o servicios internos.
- Automatización de tareas de texto en entornos con recursos limitados: resúmenes, reescritura y clasificación de textos en inglés dentro de contenedores pequeños o dispositivos edge, donde un modelo de 7 B o superior no cabría en memoria.
- Prototipado rápido de pipelines conversacionales: al estar disponible en GGUF, se puede cargar con llama.cpp u Ollama para validar flujos de diálogo y herramientas antes de migrar a un modelo mayor.
- Filtrado y preprocesado en pipelines de datos: tareas de etiquetado, normalización o generación de plantillas en inglés que no requieren razonamiento complejo y se benefician de una latencia baja en CPU.
- Educación y experimentación: por su tamaño y su amplia gama de cuantizaciones, es útil para estudiar el efecto de la cuantización en la calidad de salida y para prácticas de despliegue de modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB con Q4_K_M, 1,3 GB con Q8_0 y 2,4 GB con f16 (tamaños de archivo indicados en la model card; el consumo real en runtime es algo superior por el contexto y el overhead).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM para cuantizaciones bajas; tarjetas como RTX 3060, RTX 4060 o superiores son más que suficientes. También puede ejecutarse íntegramente en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base original es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera una latencia baja en CPU y muy baja en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas (contexto, arquitectura) que permitan una comparación rigurosa con alternativas. A continuación se indica la comparación posible con la información disponible:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Logistes-1.0 (este) | 1,17 B | no disponible | lfm1.0 | GGUF, safetensors | Ajuste LoRA, orientado a on-device y tool-use |
| Alternativas de ~1 B | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la información proporcionada |

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés (`language: en`); su rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar conversaciones largas o documentos extensos con garantías.
- Alucinación: al no haber benchmarks ni documentación sobre alineación, no se puede evaluar la tasa de alucinación; en un modelo de 1,17 B es esperable un riesgo elevado en tareas de conocimiento factual.
- Licencia lfm1.0: la licencia Liquid Foundation Model impone condiciones específicas para uso comercial; es obligatorio revisar sus términos antes de desplegar el modelo en producción.
- Modelo derivado: se trata de un ajuste LoRA sobre un base no documentado en esta ficha; las limitaciones del base se heredan y no se detallan.
- Información escasa: la model card del repositorio GGUF es operativa y no aporta datos de entrenamiento, arquitectura ni evaluación, lo que dificulta la validación técnica.
- Cuantizaciones bajas: las versiones Q2_K y Q3_K pueden degradar notablemente la calidad; para producción se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Logistes-1.0-GGUF
- Modelo base: https://huggingface.co/Openwist/Logistes-1.0
- Página de descargas del cuantizador: https://hf.tst.eu/model#Logistes-1.0-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
