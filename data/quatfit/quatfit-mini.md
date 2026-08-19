# Quatfit/Quatfit-Mini

## Resumen

Quatfit Mini es un modelo multimodal de 8 000 millones de parámetros (7 941 100 874 parámetros reales) desarrollado por Quatfit AI Research, una empresa emergente india. Está construido sobre la arquitectura de Google Gemma 4 y ha sido optimizado por Quatfit para despliegue eficiente, razonamiento de contexto largo y flujos de trabajo agénticos. El modelo integra capacidades nativas de texto, imagen y audio, con una ventana de contexto de 131 072 tokens, lo que lo sitúa en la gama alta de modelos multimodales de su tamaño.

La relevancia de Quatfit Mini radica en su combinación de multimodalidad, contexto largo y optimizaciones de inferencia (hasta 4 veces más rápido según el autor) sobre hardware de consumo. Los pesos se publican en FP32 para máxima fidelidad numérica, con recomendación de usar BF16/FP16 o cuantización GGUF para inferencia. Está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones significativas. El modelo está orientado a casos de uso como agentes de IA, asistentes de código, respuesta visual a preguntas, OCR y comprensión de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only multimodal transformer basado en Google Gemma 4 |
| Parametros totales | 7 941 100 874 (7,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | FP32 (publicado), BF16/FP16 (recomendado), GGUF (disponible en repo separado) |
| Idiomas soportados | Inglés, hindi, gujarati, maratí, telugu, francés, japonés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP32), GGUF |

## Arquitectura y entrenamiento

Quatfit Mini preserva la arquitectura transformer multimodal de Gemma 4, un modelo decoder-only con vocabulario SentencePiece de 262 000 tokens. Sobre esta base, Quatfit AI Research aplica un conjunto de optimizaciones: ajuste por instrucciones supervisado, alineación, optimización del despliegue, optimización de GGUF y soporte de decodificación especulativa mediante un drafter MTP (multi-token prediction). No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El autor indica que los pesos se publican en FP32 para evitar pérdida de precisión respecto al checkpoint original, y que el casting a BF16/FP16 o el uso de GGUF cuantizado es la vía recomendada para inferencia.

## Capacidades

- Generación de texto y razonamiento multilingüe, con soporte para inglés, hindi y varios idiomas adicionales.
- Comprensión multimodal nativa: entrada de imagen (VQA, OCR, comprensión de diagramas) y audio.
- Generación de código y asistencia en tareas de programación, aunque el autor excluye explícitamente la generación a escala de repositorio y la programación competitiva.
- Soporte de tool calling y function calling, orientado a flujos agénticos.
- Razonamiento de contexto largo gracias a la ventana de 131 072 tokens.
- Decodificación especulativa (MTP drafter) para acelerar la inferencia.
- Compatibilidad nativa con Hugging Face Transformers mediante `AutoModelForImageTextToText`.

## Casos de uso

- Agentes de IA autónomos: el modelo puede gestionar tareas multi-paso con tool calling y razonamiento de contexto largo, integrándose en pipelines de automatización de productividad o asistentes personales.
- Asistente de código en IDE: genera fragmentos, explica funciones y sugiere correcciones, con soporte de contexto largo para archivos extensos.
- Respuesta visual a preguntas (VQA): dado un diagrama o fotografía, el modelo responde preguntas sobre su contenido, útil en documentación técnica o análisis de imágenes.
- OCR y extracción de datos: procesa imágenes con texto (facturas, capturas de pantalla) y extrae la información estructurada, aprovechando la entrada de imagen.
- Comprensión de audio: transcribe o resume contenido de audio, aunque no se especifican los formatos exactos soportados.
- Copiloto de investigación: analiza documentos largos (hasta 131K tokens) y responde preguntas sobre ellos, útil para revisión de literatura o informes técnicos.
- Fine-tuning sobre FP32: los pesos en precisión completa sirven como base para ajuste fino en dominios específicos, como clasificación de documentos o chatbots especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y la búsqueda web no ha revelado datos adicionales. El autor menciona una mejora de hasta 4 veces en velocidad de inferencia respecto a la base Gemma 4, pero no se proporcionan mediciones concretas.

## Requisitos de hardware

- FP32 (publicado): aproximadamente 32 GB de VRAM para el backbone de 8B, recomendado para fine-tuning o investigación sensible a precisión. Requiere GPU de clase A100 40GB, A100 80GB o H100.
- BF16/FP16 (recomendado para inferencia): aproximadamente 16 GB de VRAM, cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 4080 (16 GB).
- GGUF cuantizado: consumo de VRAM variable según el nivel de cuantización (Q4, Q5, Q8); puede ejecutarse en GPUs con 8-12 GB, como RTX 3060 o RTX 4060.
- Opciones de despliegue: Hugging Face Transformers (carga directa), llama.cpp y Ollama para GGUF, vLLM o TGI para servidores de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| Quatfit Mini | 7,9 B | 131 072 | Texto, imagen, audio | Apache 2.0 |
| Gemma 3 8B (referencia) | 8 B | 128 000 | Texto, imagen | Gemma license |
| Llama 3.2 8B | 8 B | 128 000 | Texto | Llama license |
| Qwen2-VL 7B | 7,6 B | 32 000 | Texto, imagen | Apache 2.0 |

No se dispone de datos de benchmarks comparativos fiables para estos modelos en la información proporcionada. La comparación se limita a especificaciones declaradas. Quatfit Mini destaca por su contexto largo y su licencia permisiva, pero carece de métricas publicadas que permitan evaluar su rendimiento relativo.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- El autor declara explícitamente que el modelo no es adecuado para diagnóstico médico, asesoría legal, decisiones de alto riesgo, ingeniería de software a escala empresarial, generación de código a nivel de repositorio ni programación competitiva.
- Los sesgos y riesgos de alucinación no están documentados; al ser un modelo derivado de Gemma 4, puede heredar sesgos del modelo base.
- El soporte multilingüe se centra en inglés e hindi; el rendimiento en otros idiomas (francés, japonés, chino, etc.) no está verificado.
- El repositorio en FP32 ocupa 31,8 GB, lo que puede ser un inconveniente para descargas y almacenamiento; se recomienda usar las versiones BF16 o GGUF para inferencia.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución y la procedencia del modelo base Gemma 4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quatfit/Quatfit-Mini
- Repositorio GGUF: https://huggingface.co/Quatfit/Quatfit-Mini-GGUF
- Informe técnico (PDF): https://huggingface.co/Quatfit/Quatfit-Mini/resolve/main/Quatfit-Mini_Technical_Report.pdf
- Anuncio en LinkedIn: https://www.linkedin.com/posts/quatfit_we-are-thrilled-to-announce-the-launch-activity-7479365371586838528-jDuX
- Ficha en LLM Explorer: https://llm-explorer.com/model/Quatfit%2FQuatfit-Mini,5KtuzbmrHd0u0DcNiBQPNX
