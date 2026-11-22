# mradermacher/ProWork-PDF-27B-GGUF

## Resumen

ProWork-PDF-27B es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) especializado en comprensión de documentos y trabajo con conocimiento, con énfasis en archivos PDF. Lo desarrolla el colectivo aibuildai-inc, y esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones para la comunidad de IA local.

El modelo parte de una arquitectura transformer multimodal (los archivos mmproj adjuntos indican soporte de entrada visual, necesaria para procesar el contenido gráfico de los PDF) y está orientado a tareas de extracción, resumen y razonamiento sobre documentos. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que resulta relevante para pipelines de procesamiento documental en producción.

La relevancia de esta publicación radica en la disponibilidad de cuantizaciones estáticas (Q2_K a Q8_0) que reducen el peso desde 29,1 GB hasta 11,0 GB, permitiendo ejecutar un modelo de 27B en hardware de consumo. El repositorio completo ocupa 190,8 GB e incluye todos los formatos de cuantización, además de los suplementos multimodales mmproj en f16 y Q8_0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (mmproj para entrada visual); detalles internos no disponibles |
| Parámetros totales | 27.320.697.856 (≈27,3B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (aibuildai-inc/ProWork-PDF-27B) en la información proporcionada. Los metadatos de la cuantización indican que se trata de un modelo transformer convertido desde formato Hugging Face (`convert_type: hf`) y que incluye un proyector multimodal (mmproj), lo que confirma capacidad de procesamiento de imágenes, previsiblemente páginas de PDF renderizadas.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio cuantizado es una plantilla estándar de mradermacher que no incluye información sobre el entrenamiento del modelo original. Las etiquetas indican especialización en `document-understanding`, `knowledge-work` y `pdf`.

## Capacidades

- Comprensión de documentos PDF, incluyendo contenido textual y visual gracias al proyector multimodal mmproj.
- Generación de texto conversacional (el repositorio está etiquetado como `conversational`).
- Procesamiento de tareas de trabajo con conocimiento: extracción, resumen y razonamiento sobre documentos.
- Entrada multimodal: los archivos mmproj f16 y Q8_0 permiten alimentar imágenes junto con texto.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Soporte de tool calling, agentes o modo de razonamiento extendido: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés (`en`).

## Casos de uso

- Extracción de datos de facturas y albaranes: el modelo puede recibir páginas renderizadas como imagen (vía mmproj) y devolver campos estructurados, aprovechando su especialización en PDF y su licencia Apache 2.0 para uso comercial.
- Resumen de contratos e informes largos: adecuado para pipelines internos de gestión documental donde se necesita condensar documentos extensos en inglés.
- Digitalización de archivos históricos: la cuantización Q8_0 (29,1 GB) permite desplegar el modelo en una única GPU de 40 GB para procesar lotes de documentos escaneados.
- Asistente de búsqueda documental (RAG): el modelo puede actuar como generador final en un sistema de recuperación aumentada, respondiendo preguntas sobre fragmentos de PDF recuperados.
- Automatización de back-office: clasificación y enrutamiento de documentos entrantes en flujos de trabajo administrativos, con despliegue en llama.cpp u Ollama para entornos sin GPU de datacenter.
- Procesamiento en local con privacidad: las cuantizaciones Q4_K_M (16,9 GB) permiten ejecutar el modelo en una RTX 4090 o incluso en configuraciones con memoria unificada, manteniendo documentos sensibles fuera de servicios en la nube.
- Generación de informes a partir de fuentes documentales: combinación de extracción de contenido y redacción de resúmenes ejecutivos en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: ~11 GB de pesos; ~13-14 GB en total.
  - Q4_K_M: ~17 GB de pesos; ~19-21 GB en total.
  - Q8_0: ~29 GB de pesos; ~32-34 GB en total.
- GPU recomendadas:
  - Q8_0: A100 40 GB, A6000 48 GB o H100.
  - Q4_K_M: RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
  - Q2_K / Q3_K_S: RTX 4080 (16 GB) o RTX 4060 Ti 16 GB, con posible offload parcial.
- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K a Q4_K_M; Q5 y superiores requieren 24 GB o más y pueden necesitar offload a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI si el modelo base lo soporta (no confirmado).
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo denso de 27B en Q4_K_M sobre una RTX 4090 suele situarse en decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| ProWork-PDF-27B (esta ficha) | 27,3B | no disponible | Documentos/PDF, multimodal | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-VL-32B | ~32B | 128K (según documentación pública de Qwen) | Visión-lenguaje general | Apache 2.0 | safetensors, GGUF |
| Gemma 3 27B | 27B | 128K (según documentación pública de Google) | Lenguaje y visión general | Gemma license | safetensors, GGUF |
| InternVL2.5-26B | ~26B | variable según variante | Visión-lenguaje general | MIT (variantes) | safetensors |

La comparación con alternativas se basa en características públicas de esos modelos; no se dispone de benchmarks de ProWork-PDF-27B que permitan una comparación de rendimiento directa. La ventaja diferencial de ProWork-PDF-27B es su especialización declarada en PDF y su licencia Apache 2.0, frente a licencias con condiciones como la de Gemma.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior.
- No hay información pública sobre sesgos del modelo base ni sobre su proceso de alineación.
- Riesgo de alucinación inherente a los modelos de 27B, especialmente en extracción de datos de documentos con tablas complejas o texto manuscrito; se recomienda validación posterior en producción.
- La longitud de contexto no está documentada; para documentos PDF largos puede requerir fragmentación previa (chunking).
- Las cuantizaciones Q2_K y Q3_K_M tienen pérdida de calidad notable según las propias notas del cuantizador; para producción se recomienda Q4_K_M o superior.
- El repositorio de 190,8 GB requiere espacio en disco considerable si se descargan todas las variantes; conviene descargar solo el archivo GGUF y el mmproj necesarios.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar los términos del modelo base original por si hubiera condiciones adicionales no reflejadas en esta información.
- El modelo base no incluye model card detallada en la información disponible; la trazabilidad del entrenamiento es limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ProWork-PDF-27B-GGUF
- Modelo base: https://huggingface.co/aibuildai-inc/ProWork-PDF-27B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/ProWork-PDF-27B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#ProWork-PDF-27B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
