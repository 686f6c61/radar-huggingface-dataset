# mradermacher/Wasabi-30B-GGUF

## Resumen

Wasabi-30B es un modelo de lenguaje multimodal orientado al japonés, desarrollado por sionic-ai, especializado en OCR y transcripción de documentos. Este repositorio no es el modelo original, sino una colección de cuantizaciones estáticas en formato GGUF creadas por mradermacher, un cuantizador conocido por publicar versiones comprimidas de modelos populares para facilitar su ejecución local en hardware de consumo.

El modelo base pesa aproximadamente 27,85 mil millones de parámetros y destaca por sus capacidades de visión aplicadas a documentos: incluye archivos "mmproj" (proyectores multimodales) que permiten usar el modelo con imágenes, lo que lo hace especialmente útil para digitalizar documentos japoneses, un área donde los modelos generalistas suelen tener un rendimiento inferior. Su enfoque en OCR y transcripción de documentos en japonés lo convierte en una opción relevante para archivos, bibliotecas digitales y flujos de trabajo de digitalización.

La relevancia de esta cuantización radica en la accesibilidad: con versiones desde 10,8 GB (Q2_K) hasta 29,7 GB (Q8_0), el modelo puede ejecutarse en GPUs de consumo o incluso en CPU con RAM suficiente, usando llama.cpp, Ollama u otras herramientas compatibles con GGUF. La licencia del modelo base es AGPL-3.0, algo que debe tenerse en cuenta para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal (LLM + proyector de visión mmproj), detalles no disponibles |
| Parametros totales | 27.854.794.240 (≈27,9 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | Japonés (ja) |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de información oficial detallada sobre la arquitectura del modelo base sionic-ai/Wasabi-30B más allá de lo que puede inferirse del repositorio: se trata de un modelo de unos 27,9 mil millones de parámetros con capacidades multimodales, ya que mradermacher publica archivos mmproj (multi-modal project) en Q8_0 (2,2 GB) y f16 (3,9 GB). Estos archivos contienen el codificador de visión y el proyector necesarios para procesar imágenes junto al LLM en llama.cpp.

Tampoco se han publicado datos sobre el corpus de entrenamiento, el número de tokens, el proceso de ajuste fino (SFT, RLHF, DPO) ni innovaciones técnicas concretas. Dadas sus etiquetas (ocr, document-transcription, japanese), es razonable asumir un entrenamiento o ajuste fino centrado en documentos japoneses, pero no hay confirmación documental. Sobre las cuantizaciones: son estáticas (no imatrix/weighted en el momento de publicación), convertidas desde los pesos safetensors del modelo base mediante el pipeline estándar de llama.cpp.

## Capacidades

- OCR y transcripción de documentos en japonés, aprovechando la parte multimodal (mmproj) para leer imágenes de documentos.
- Comprensión y generación de texto en japonés (idioma principal declarado).
- Conversación (tag "conversational" en el repositorio).
- Procesamiento de imágenes gracias a los archivos mmproj incluidos (f16 y Q8_0).
- Ejecución local con llama.cpp y derivados gracias al formato GGUF.
- No consta soporte de tool calling, function calling, agentes ni modo de razonamiento extendido.

## Casos de uso

- Digitalización de archivos históricos japoneses: transcripción de documentos escaneados mediante la parte de visión, útil para bibliotecas y archivos que necesiten procesar grandes volúmenes de material offline por privacidad o coste.
- Automatización de entrada de datos: extracción de texto de facturas, formularios y contratos en japonés, integrando el modelo en pipelines locales de procesamiento documental.
- Procesamiento on-premise por requisitos de privacidad: empresas con datos sensibles (legal, salud, finanzas en Japón) que no pueden enviar documentos a APIs externas pueden ejecutar el modelo localmente con GGUF.
- Asistente conversacional en japonés: chatbot local para consultas en japonés en entornos con GPUs de gama media-alta.
- Generación de corpus de texto: transcripción masiva de imágenes de texto para crear datasets de entrenamiento en japonés.
- Accesibilidad: conversión de documentos impresos a texto legible por lectores de pantalla en flujos de trabajo locales.
- Investigación en OCR multilingüe: punto de partida para comparar modelos especializados en japonés frente a alternativas generalistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contexto ni mmproj):
  - Q2_K: ~10,8 GB
  - Q3_K_M: ~13,8 GB
  - IQ4_XS: ~15,4 GB
  - Q4_K_M: ~17,0 GB
  - Q5_K_M: ~19,9 GB
  - Q6_K: ~23,0 GB
  - Q8_0: ~29,7 GB
  - Añadir 2,2-3,9 GB si se usa el proyector multimodal (mmproj).
- GPU recomendadas: RTX 4090 (24 GB) para Q4/Q5; RTX 5090 o A100 40 GB para Q6/Q8; H100 para máxima velocidad con Q8_0 y contexto largo.
- Consumer GPUs: sí. Una RTX 4090 ejecuta Q4_K_M (17 GB + mmproj) con holgura; una RTX 3090 puede ejecutar Q4_K_S o IQ4_XS con contexto moderado. Versiones Q2_K/Q3 caben en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB), con pérdida de calidad notable.
- CPU: posible con 16-32 GB de RAM en cuants bajos, aunque con velocidades bajas para un modelo de este tamaño.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, y otros runtimes compatibles con GGUF. El tag "vllm" en el repositorio sugiere compatibilidad con vLLM para el modelo base, no para los GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Idioma principal | Licencia | Formato |
|---|---|---|---|---|---|
| Wasabi-30B (este repo, GGUF) | ≈27,9 B | Sí (mmproj) | Japonés | AGPL-3.0 | GGUF |
| Qwen2.5-VL-32B | ≈32 B | Sí | Multilingüe (fuerte en chino/japonés) | Apache 2.0 (base) | safetensors, GGUF comunitarios |
| PLaMo-2 (Preferred Networks) | no disponible | Parcial | Japonés | Restringida/propiedad según versión | safetensors |

Alternativas con licencia más permisiva (Apache 2.0) y soporte multilingüe incluyen la familia Qwen2.5-VL; sin embargo, Wasabi-30B apunta a especialización en documentos japoneses, un nicho donde los modelos generalistas pueden rendir peor. No hay datos de benchmarks para una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. Su uso en servicios ofrecidos por red puede obligar a liberar el código fuente del sistema completo. Evaluarlo cuidadosamente antes de cualquier despliegue comercial.
- Enfoque principal en japonés: el rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Cuantizaciones estáticas (no imatrix): los cuants bajos (Q2_K, Q3_K) pueden degradar notablemente la calidad, especialmente en tareas finas como OCR.
- Sin benchmarks publicados: no hay forma de verificar objetivamente su rendimiento frente a alternativas.
- Riesgo de alucinación en generación de texto; en OCR, verificar siempre la salida contra el documento original, especialmente con números, nombres propios y kanji poco frecuente.
- Longitud de contexto no documentada: puede ser un factor limitante para documentos largos.
- Los archivos mmproj requieren versiones recientes de llama.cpp con soporte multimodal.
- Información de arquitectura y entrenamiento escasa o inexistente en la model card, lo que dificulta la evaluación técnica previa.

## Enlaces

- Repositorio cuantizado (GGUF): https://huggingface.co/mradermacher/Wasabi-30B-GGUF
- Modelo base: https://huggingface.co/sionic-ai/Wasabi-30B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Wasabi-30B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
