# aibuildai-inc/ProWork-PDF-27B

## Resumen

ProWork-PDF-27B es un modelo multimodal de tipo image-text-to-text desarrollado por aibuildai-inc, especializado en comprensión de documentos y flujos de trabajo de conocimiento ("knowledge work"). Se distribuye como un fine-tune del modelo base Qwen/Qwen3.8-27B, del que hereda la arquitectura Qwen3.5 y el pipeline de transformers con pesos en safetensors. Con 27B parámetros, se posiciona en la franja de modelos de tamaño medio-grande aptos para despliegue en infraestructura dedicada, orientado a tareas de extracción, interpretación y conversación sobre PDF y documentación empresarial.

El modelo resuelve el problema de procesar documentos densos (PDF, formularios, informes) en un contexto conversacional, combinando entrada visual y textual. Su etiqueta `endpoints_compatible` sugiere compatibilidad con infraestructura de endpoints gestionados, y la licencia declarada en los metadatos es Apache 2.0, aunque el campo de licencia de la ficha de Hugging Face aparece como no disponible. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una publicación muy reciente (17 de noviembre de 2026) y sin adopción comunitaria verificable.

La relevancia de esta ficha radica en documentar un modelo del que existe información pública mínima: los datos de arquitectura interna, dataset de entrenamiento y benchmarks no están publicados en la información disponible, por lo que buena parte de las especificaciones se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal image-text-to-text), fine-tune de Qwen/Qwen3.8-27B |
| Parametros totales | 27B (según denominación del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | inglés (tag `en`); resto no disponible |
| Licencia | apache-2.0 según tags; campo de licencia de la ficha no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5, la generación indicada en los tags del repositorio, con un pipeline `image-text-to-text` que implica un codificador visual acoplado a un decoder de lenguaje. Al tratarse de un fine-tune de Qwen/Qwen3.8-27B, conserva la arquitectura del modelo base, si bien no se detalla en la información disponible si emplea atención completa, atención lineal o alguna variante híbrida, ni el número de capas, cabezas o dimensión oculta. Tampoco se especifica si el modelo base es denso o de mezcla de expertos.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset de fine-tuning, ni si se aplicaron etapas de RLHF, DPO o ajuste supervisado. La orientación declarada hacia "document understanding" y "knowledge work" sugiere un corpus centrado en PDF y documentación profesional, pero esta inferencia no está confirmada por documentación técnica en la información proporcionada. No se describen innovaciones como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Comprensión de documentos PDF: el pipeline image-text-to-text permite introducir páginas renderizadas como imagen junto a instrucciones textuales para extraer y razonar sobre su contenido.
- Conversación multi-turno: la etiqueta `conversational` indica soporte de diálogo contextual sobre documentos.
- Procesamiento de conocimiento profesional: orientado a knowledge work, es decir, interpretación de informes, contratos, formularios y documentación técnica.
- Entrada multimodal: acepta imágenes y texto combinados en la misma petición.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés; otros idiomas no disponibles.
- Modo thinking, visión avanzada o audio: no disponible en la información proporcionada.

## Casos de uso

- Extracción estructurada de datos de facturas y formularios: se renderiza cada página del PDF como imagen y se solicita al modelo la devolución de campos clave (importes, fechas, emisor) en formato estructurado, aprovechando su entrenamiento específico en document understanding.
- Revisión de contratos y documentación legal: el modelo puede responder preguntas concretas sobre cláusulas de un contrato multi-página, manteniendo el contexto conversacional entre turnos para refinar consultas sucesivas.
- Asistente interno de conocimiento corporativo: integrado en un buscador empresarial, recibe fragmentos de informes en PDF y responde en lenguaje natural a consultas de empleados sobre políticas, procedimientos o datos históricos.
- Procesamiento de literatura científica: extracción de metodología, resultados y limitaciones de artículos en PDF para revisiones sistemáticas, con la ventaja de interpretar tablas y figuras renderizadas como imagen.
- Automatización de back-office financiero: lectura de extractos bancarios y estados de cuenta en PDF para conciliación contable, reduciendo la necesidad de reglas de extracción específicas por plantilla.
- Digitalización de archivos históricos o administrativos: conversión de expedientes escaneados en texto consultable y resumido, donde el enfoque multimodal evita depender exclusivamente de un OCR previo.
- Soporte a equipos de auditoría: consulta conversacional sobre paquetes de documentación extensos, permitiendo preguntas de seguimiento sobre importes, fechas y responsables sin reenviar el documento completo en cada turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27B parámetros, en FP16 se requieren aproximadamente 54 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 27-30 GB; en 4 bits, aproximadamente 14-16 GB. Estas cifras son estimaciones por tamaño y no han sido verificadas con el modelo.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16 sin cuantizar; A100 40 GB o L40S para 8 bits; dos RTX 4090 (24 GB cada una) o una RTX 4090 con cuantización de 4 bits para pruebas en consumer.
- Cabe en consumer GPU: sí, con cuantización de 4 bits en GPUs de 16-24 GB (RTX 4080, 4090, 3090), sujeto a la disponibilidad de pesos cuantizados, que no está confirmada.
- Opciones de despliegue: transformers (formato nativo del repositorio); vLLM, TGI, llama.cpp u Ollama no están confirmados como soportados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ProWork-PDF-27B | 27B | no disponible | apache-2.0 (según tags) | Document understanding multimodal |
| Qwen/Qwen3.8-27B | 27B | no disponible | no disponible | Modelo base multimodal generalista |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada, ni de datos de rendimiento que permitan una comparación cuantitativa con alternativas de document understanding.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no es posible verificar la calidad del modelo frente al base Qwen3.8-27B ni frente a alternativas especializadas en documentos.
- Sesgos conocidos: no documentados; al derivar de un modelo base generalista, es previsible que herede sesgos de su corpus de preentrenamiento, pero no hay información específica.
- Riesgo de alucinación: no cuantificado; en tareas de extracción documental, la verificación contra el texto original del PDF es imprescindible en producción.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en castellano no está verificado y podría degradarse notablemente.
- Restricciones de licencia: los tags indican apache-2.0, pero el campo de licencia de la ficha aparece como no disponible; conviene confirmar los términos antes de uso comercial.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni informes de terceros.
- Documentación técnica ausente: no se detallan contexto máximo, composición del dataset de fine-tuning ni proceso de entrenamiento, lo que dificulta evaluar su idoneidad para dominios concretos.
- Compatibilidad de despliegue incierta: no se confirma soporte en vLLM, TGI o llama.cpp, lo que puede limitar el rendimiento en producción frente a alternativas con ecosistema maduro.

## Enlaces

- [Hugging Face: aibuildai-inc/ProWork-PDF-27B](https://huggingface.co/aibuildai-inc/ProWork-PDF-27B)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Paper, blog, repositorio o demo: no disponible en la información proporcionada.
