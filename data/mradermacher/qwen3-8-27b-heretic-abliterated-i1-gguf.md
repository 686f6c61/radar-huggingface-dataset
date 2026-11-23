# mradermacher/Qwen3.8-27B-Heretic-Abliterated-i1-GGUF

## Resumen

Qwen3.8-27B-Heretic-Abliterated-i1-GGUF es una distribución de cuantizaciones GGUF del modelo catonooka/Qwen3.8-27B-Heretic-Abliterated, publicada por mradermacher. El modelo subyacente es una variante de Qwen3.8 de 27B parámetros (27.320.697.856 parámetros reales según los safetensors del repositorio base) que ha sido sometida a un proceso de "abliteration" y "heretic", técnicas de modificación de pesos orientadas a eliminar o atenuar los mecanismos de rechazo y alineación del modelo original. El resultado es un modelo conversacional sin censura, etiquetado explícitamente como `uncensored` y `abliterated`.

Esta ficha cubre específicamente el repositorio de cuantizaciones i1 (imatrix) de mradermacher, que ofrece un conjunto de ficheros GGUF en distintos niveles de compresión, desde i1-Q2_K (11,3 GB) hasta i1-Q6_K (22,5 GB). El repositorio base indica que se trata de un modelo con capacidades de visión, aunque los ficheros mmproj (proyector multimodal) se alojan en el repositorio estático separado del mismo autor, no en este.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de 27B con modificaciones de alineación en hardware de consumo mediante llama.cpp u otros runners compatibles con GGUF, con cuantizaciones generadas usando matrices de importancia (imatrix) para preservar mejor la calidad en niveles bajos de bits. La licencia declarada es `qwen-community` (etiquetada como `other` en Hugging Face), lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen3.8; transformer, según la convención de la familia) |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (más fichero imatrix) |
| Idiomas soportados | en (inglés, según la model card del repositorio base) |
| Licencia | qwen-community (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por la nomenclatura (Qwen3.8-27B) y el tamaño de parámetros (27,3B), se trata de un transformer de la familia Qwen3.8, pero no se confirman detalles como el número de capas, la dimensión oculta, el tipo de atención ni la ventana de contexto nativa. Tampoco se documentan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica relevante en esta distribución es doble. Por un lado, el modelo base incorpora modificaciones de "abliteration" y "heretic": intervenciones sobre los pesos orientadas a suprimir la dirección de rechazo aprendida durante el alineamiento, lo que produce un modelo que responde a peticiones que el modelo original declinaría. Por otro lado, las cuantizaciones de mradermacher son de tipo i1 (imatrix), generadas con matrices de importancia calculadas sobre el modelo, lo que mejora la fidelidad respecto a cuantizaciones estáticas del mismo tamaño. La model card indica `quantize_version: 2` y `output_tensor_quantised: 1` en los metadatos de generación.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo (`conversational` en los tags).
- Razonamiento y generación de código, heredados de la familia Qwen3.8 (no verificado con benchmarks en la información disponible).
- Capacidades de visión: la model card del cuantizador indica explícitamente "This is a vision model", con ficheros mmproj en el repositorio estático separado.
- Respuestas sin censura: el proceso de abliteration/heretic elimina o atenúa los rechazos del modelo alineado original.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con infraestructura de inferencia estándar.
- Soporte de tool calling / function calling: no disponible (no confirmado en la documentación).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente el efecto de la abliteration comparando respuestas con el modelo Qwen3.8 original, útil para trabajos de red-teaming y evaluación de mecanismos de rechazo.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles sin los rechazos del modelo alineado, ejecutable localmente con llama.cpp en una estación de trabajo con GPU de 24 GB.
- Procesamiento de documentos con visión: al ser un modelo con capacidades visuales (mmproj en el repositorio estático), puede emplearse para extracción de información de imágenes y PDFs escaneados en entornos con requisitos de privacidad, sin enviar datos a APIs externas.
- Asistente conversacional local: despliegue en Ollama o llama.cpp para un chatbot de uso personal o interno, con la cuantización i1-Q4_K_M (17,1 GB) como equilibrio entre calidad y requisitos de memoria.
- Análisis de contenido sensible para moderación: uso del modelo sin censura para generar ejemplos adversarios y evaluar clasificadores de contenido o filtros de seguridad en pipelines propios.
- Experimentación con cuantización imatrix: el fichero imatrix incluido (0,1 GB) permite generar cuantizaciones propias con calibración específica para un dominio, útil para equipos que necesitan ajustar el equilibrio tamaño/calidad.
- Fine-tuning sobre una base sin alineación: investigadores que prefieran partir de un modelo sin rechazos para tareas de ajuste supervisado específicas, evitando que el alineamiento original interfiera con el comportamiento deseado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos. Tampoco se documentan mediciones de perplejidad para las distintas cuantizaciones, más allá de la referencia genérica a un gráfico externo de ikawrakow sobre calidad relativa de tipos de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada según tamaño de fichero):
  - i1-Q2_K: ~11,3 GB de pesos; ~13-14 GB con contexto moderado.
  - i1-IQ3_M / i1-Q3_K_M: ~13-14 GB de pesos; ~15-16 GB con contexto.
  - i1-Q4_K_M (recomendada por el autor): ~17,1 GB de pesos; ~19-20 GB con contexto.
  - i1-Q5_K_M: ~19,7 GB de pesos; ~22 GB con contexto.
  - i1-Q6_K: ~22,5 GB de pesos; ~24-25 GB con contexto.
- GPU recomendadas:
  - RTX 4090 (24 GB): cabe en i1-Q4_K_M, i1-Q5_K_M e i1-Q6_K con contexto ajustado; i1-Q4_K_S o i1-IQ4_XS con más margen.
  - RTX 3090 (24 GB): mismas opciones que la 4090.
  - A100 40 GB / H100 80 GB: permiten i1-Q6_K con contexto amplio y mayor throughput.
  - GPU de 16 GB (RTX 4080, 4060 Ti 16 GB): i1-IQ3_M o i1-Q3_K_M con contexto limitado; i1-Q4_K_S posible con offload parcial a CPU.
  - GPU de 12 GB: solo cuantizaciones Q2/Q3 con offload parcial; rendimiento degradado.
- Despliegue: llama.cpp (runner nativo para GGUF), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de OpenAI mediante llama-server. vLLM y TGI no soportan GGUF de forma nativa en el momento de la publicación.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Heretic-Abliterated-i1-GGUF (este) | 27,3B | no disponible | GGUF i1 | qwen-community | Cuantizaciones imatrix de un modelo abliterated |
| catonooka/Qwen3.8-27B-Heretic-Abliterated | 27,3B | no disponible | safetensors | qwen-community | Modelo base sin cuantizar de este repositorio |
| mradermacher/Qwen3.8-27B-Heretic-Abliterated-GGUF | 27,3B | no disponible | GGUF estático | qwen-community | Cuantizaciones estáticas (sin imatrix) del mismo modelo base |
| Qwen3.8-27B (original) | 27,3B | no disponible | safetensors, GGUF | qwen-community | Modelo alineado de referencia; no abliterated |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration altera los pesos del modelo y puede degradar capacidades generales (razonamiento, coherencia, seguimiento de instrucciones) respecto al modelo Qwen3.8 original; no se han publicado evaluaciones que cuantifiquen esta degradación.
- Ausencia de alineación: el modelo responderá a peticiones que el original rechazaría, incluyendo contenido sensible, lo que exige controles de uso y responsabilidad legal por parte del desplegador.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluaciones específicas para esta variante.
- Idiomas: la model card declara únicamente inglés (`language: en`); el rendimiento en castellano no está verificado y podría ser deficiente.
- Licencia `qwen-community` (etiquetada como `other`): es necesario revisar el enlace LICENSE del repositorio base antes de cualquier uso comercial; las modificaciones de abliteration pueden no estar cubiertas explícitamente por los términos originales.
- Contexto: no se documenta la longitud de contexto nativa ni si las cuantizaciones preservan la ventana completa; conviene validar el comportamiento en contextos largos antes de producción.
- Visión: los ficheros mmproj no están en este repositorio sino en el estático; es necesario descargarlos por separado para usar las capacidades multimodales.
- Repositorio de 220,5 GB: incluye todas las cuantizaciones; la descarga debe hacerse fichero a fichero, no del repositorio completo.
- Metadatos escasos: la model card del cuantizador es una plantilla automática; no hay información sobre datos de entrenamiento, benchmarks ni limitaciones específicas del modelo base.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/catonooka/Qwen3.8-27B-Heretic-Abliterated
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-Abliterated-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Heretic-Abliterated-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
