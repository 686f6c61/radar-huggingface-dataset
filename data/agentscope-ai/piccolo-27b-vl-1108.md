# agentscope-ai/Piccolo-27B-VL-1108

## Resumen

Piccolo 27B VL es un modelo de lenguaje y visión (image-text-to-text) publicado por agentscope-ai bajo licencia Apache 2.0. El checkpoint declara la arquitectura Qwen3_5ForConditionalGeneration, lo que lo sitúa en la familia de modelos Qwen 3.5 con capacidad multimodal, e incorpora una configuración de visión junto con un fichero adicional denominado model-frozen-mtp.safetensors, probablemente asociado a multi-token prediction congelado. El modelo cuenta con 27.781.427.952 parámetros totales según los pesos en safetensors y un repositorio de 55,6 GB.

La relevancia de este lanzamiento es doble: por un lado, ofrece un modelo multimodal de tamano medio-grande (27B) con licencia permisiva para uso comercial, algo que reduce las fricciones legales frente a alternativas con licencias restrictivas; por otro, se publica en formato transformers con safetensors, tokenizer, processor y chat template incluidos, lo que facilita su integración en pipelines existentes de Hugging Face sin conversiones adicionales.

No obstante, la información pública disponible es muy limitada: la model card no detalla la composición del dataset de entrenamiento, el número de tokens, el contexto máximo, los idiomas soportados ni resultados de benchmarks. Esta ficha recoge lo que puede verificarse a partir de los metadatos y del README, e indica explícitamente "no disponible" en todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con configuración de visión) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (11 shards principales + model-frozen-mtp.safetensors) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3_5ForConditionalGeneration, es decir, un transformer decoder-only de la familia Qwen 3.5 adaptado para entrada image-text-to-text mediante un componente de visión. El repositorio incluye 11 shards principales de pesos más un fichero model-frozen-mtp.safetensors, todos referenciados en model.safetensors.index.json. El sufijo "mtp" sugiere multi-token prediction, una técnica de decodificación especulativa o de entrenamiento auxiliar en la que un cabezal predice varios tokens futuros; el calificativo "frozen" indica que esos pesos no se actualizan durante el ajuste. No se dispone de confirmación oficial sobre el papel exacto de este componente.

No hay información publicada sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras etapas de alineamiento, ni sobre innovaciones adicionales como atención lineal o decodificación especulativa en producción. La model card se limita a describir la estructura del repositorio y la arquitectura declarada.

## Capacidades

- Generación de texto e imagen-a-texto: el pipeline declarado es image-text-to-text, por lo que acepta imágenes junto con prompts textuales y produce respuestas en lenguaje natural.
- Razonamiento multimodal: al estar basado en Qwen 3.5, se espera capacidad de razonamiento sobre contenido visual, aunque no hay evaluación pública que lo confirme.
- Conversación multi-turno: la model card indica que se incluye chat template, lo que habilita el uso conversacional.
- Procesamiento de imágenes: incluye processor y configuración de visión, necesarios para la tokenización de imágenes.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas no está rellenado.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Análisis de documentos escaneados: el modelo puede recibir imágenes de facturas, formularios o contratos y extraer texto y estructura en una sola pasada, gracias a su pipeline image-text-to-text y a los 27B de parámetros que permiten manejar vocabulario técnico.
- Asistencia en accesibilidad: descripción automática de imágenes para usuarios con discapacidad visual, generando descripciones detalladas a partir de fotografías o capturas de pantalla.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios en plataformas, combinando el análisis visual con la generación de texto explicativo.
- Automatización de soporte técnico con capturas: el usuario adjunta una captura de pantalla de un error y el modelo interpreta la interfaz, identifica el problema y propone pasos de resolución en una conversación multi-turno.
- Extracción de información de gráficos e infografías: conversión de tablas y gráficos en imágenes a datos estructurados o resúmenes textuales para informes.
- Prototipado de asistentes multimodales: al publicarse con licencia Apache 2.0 y en formato transformers, es adecuado para equipos que necesitan un modelo base sobre el que hacer fine-tuning con datos propios sin restricciones de licencia.
- Investigación en visión-lenguaje: punto de partida para experimentos de alineamiento multimodal, evaluación de sesgos o estudios de robustez, dado el acceso completo a pesos y configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se necesitan del orden de 60-70 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 28 GB para pesos, más overhead; viable en una GPU de 40-48 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 14-16 GB para pesos; podría caber en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con contexto moderado, aunque no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para FP16 sin cuantizar; L40S 48 GB o A6000 48 GB para 8 bits; RTX 4090 24 GB solo con cuantización agresiva.
- Cabe en GPU consumer: únicamente con cuantización a 4 bits y contexto limitado; no es viable en FP16 en ninguna GPU consumer actual.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Piccolo 27B VL | 27,78B | no disponible | Apache 2.0 | Sí (image-text-to-text) | Hugging Face, transformers |
| Qwen2.5-VL-32B | 32B aprox. | 128K (según documentación pública de Qwen) | Apache 2.0 | Sí | Hugging Face, transformers, vLLM |
| InternVL2.5-26B | 26B aprox. | 32K-128K según variante | MIT / Apache 2.0 según variante | Sí | Hugging Face, transformers |
| Gemma 3 27B | 27B | 128K | Gemma Terms (uso comercial permitido con restricciones) | Sí | Hugging Face, transformers, Ollama |

Nota: los datos de los modelos comparables provienen de documentación pública general y pueden variar según la versión; no se dispone de benchmarks de Piccolo 27B VL para una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas sin realizar una evaluación propia.
- Model card mínima: no se documentan datos de entrenamiento, idiomas, contexto ni sesgos, lo que dificulta la evaluación de riesgos.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de OCR o extracción de datos de imágenes debe validarse la salida contra la fuente.
- Idiomas no declarados: no se puede asumir un rendimiento multilingüe homogéneo; conviene validar el idioma objetivo antes de producción.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos o conversaciones extensas.
- Componente model-frozen-mtp sin documentación: su función exacta y su impacto en la inferencia no están explicados; podría requerir pasos de carga específicos.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar las obligaciones de atribución y las posibles licencias de terceros asociadas a los datos de entrenamiento, no documentadas.
- Fecha de creación futura en los metadatos (2026-11-08): inconsistencia que sugiere que los metadatos pueden no ser fiables; verificar antes de depender de ellos.
- Descargas muy bajas (32) y ausencia de likes: ecosistema de validación prácticamente inexistente; no hay evidencia de la comunidad sobre su comportamiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-27B-VL-1108
- Repositorio de Agentscope (organización): https://github.com/agentscope-ai
- Documentación de transformers: https://huggingface.co/docs/transformers
- Paper de Qwen 3.5: no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada
