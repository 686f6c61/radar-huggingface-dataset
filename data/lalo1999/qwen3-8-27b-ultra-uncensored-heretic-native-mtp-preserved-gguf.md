# Lalo1999/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF

## Resumen

El modelo `Lalo1999/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF` es una colección de cuantizaciones GGUF de una versión "decensored" (sin censura) del modelo Qwen3.8-27B de Qwen. El trabajo de abliteración fue realizado por llmfan46 sobre el modelo original, y Lalo1999 ha empaquetado los pesos resultantes en formato GGUF para su uso con llama.cpp, Ollama y otras herramientas de inferencia local. El modelo base es un transformer denso de 27.320 millones de parámetros con atención híbrida (Gated DeltaNet lineal + atención completa), visión nativa, razonamiento, tool-calling y un cabezal MTP (Multi-Token Prediction) para decodificación especulativa.

La relevancia de este modelo radica en que ofrece una alternativa sin restricciones de contenido con una degradación mínima respecto al original: la divergencia KL es de 0,0244 y la tasa de rechazos baja de 91/100 a 3/100, lo que supone un 97 % menos de negativas. Esto lo hace atractivo para desarrolladores que necesitan un modelo local potente con control total sobre las respuestas, aunque con las advertencias éticas y legales que conlleva el uso de modelos sin censura. La licencia declarada es Apache 2.0, aunque algunas fuentes externas indican restricciones de uso solo para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet lineal + atención completa), visión nativa, MTP |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (según fuentes externas; no confirmado en la model card) |
| Tipos de cuantizacion | GGUF: múltiples niveles, desde 2-bit hasta F16 (según fuentes externas; el repo no lista los archivos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (según HuggingFace); algunas fuentes externas indican uso solo para investigación |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros que combina atención lineal (Gated DeltaNet) con atención completa en capas alternas, lo que reduce el coste computacional manteniendo la calidad. Incluye un cabezal MTP de 15 módulos que permite decodificación especulativa para acelerar la generación. El proceso de "decensoring" aplicado por llmfan46 utiliza la herramienta Heretic v2.0.0.dev0 con una variante del método MPOA (Magnitude-Preserving Orthogonal Ablation), que elimina la dirección de rechazo en componentes específicos: `attn.o_proj`, `attn.out_proj` y `mlp.down_proj`. Los 15 MTPs se preservan intactos, lo que mantiene la capacidad de decodificación especulativa. No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de fine-tuning, ya que se trata de una modificación post-entrenamiento sobre los pesos originales.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del Qwen3.8-27B original, incluyendo razonamiento multi-step y modo "thinking".
- Visión: el pipeline es `image-text-to-text`, por lo que puede procesar imágenes y responder preguntas sobre ellas.
- Tool calling / function calling: soportado, lo que permite integrarlo en agentes y pipelines automatizados.
- Decodificación especulativa: gracias a los 15 MTPs preservados, puede acelerar la generación en entornos que soporten esta técnica.
- Multilingüe: no confirmado, pero el modelo base de Qwen suele soportar múltiples idiomas.
- Sin censura: la abliteración reduce drásticamente los rechazos (3/100 frente a 91/100), permitiendo respuestas sobre temas que el modelo original bloquea.

## Casos de uso

- Atención al cliente automatizada: con 262K de contexto, puede gestionar conversaciones multi-turno largas y mantener el historial completo sin truncamiento, reduciendo la necesidad de resúmenes intermedios.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, con la ventaja de no rechazar peticiones de código sensible.
- Asistentes de investigación sin restricciones: útil para explorar temas controvertidos o de nicho donde los modelos censurados se niegan a responder, siempre bajo supervisión humana.
- Análisis de documentos extensos: su ventana de contexto permite procesar libros, informes o contratos completos en una sola pasada, extrayendo información o resumiendo.
- Aplicaciones de visión-lenguaje: al ser multimodal, puede describir imágenes, responder preguntas visuales o generar alt-text automático en entornos locales.
- Desarrollo de agentes autónomos: con tool calling y razonamiento multi-step, puede orquestar llamadas a APIs, ejecutar acciones y tomar decisiones en entornos controlados.

## Benchmarks y rendimiento

La model card no proporciona resultados de benchmarks del modelo abliterado, solo del original. Se incluyen los datos disponibles:

| Metrica | Modelo abliterado | Modelo original (Qwen3.8-27B) |
|---|---|---|
| Divergencia KL | 0,0244 | 0 (por definicion) |
| Tasa de rechazos | 3/100 | 91/100 |
| MMLU (accuracy) | No disponible | 83,42 % (5857/7021) |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para cuantizaciones típicas, Q4_K_M requiere aproximadamente 16-18 GB, Q8 requiere 27-30 GB, y F16 requiere 54-60 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4; A100 40/80 GB o H100 para Q8 o F16.
- En consumer GPU: sí, cabe en GPUs de 24 GB con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI, o cualquier servidor compatible con GGUF.
- Latencia y throughput: no disponible; dependerá de la cuantización, el hardware y el uso de MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Sin censura | MTP |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Apache 2.0 | No | Si |
| Este modelo (abliterado) | 27B | 262K | Apache 2.0 | Si | Si |
| orcarouter/Qwen3.8-27B-Uncensored | 27B | 262K | Apache 2.0 | Si | Si |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Uso solo para investigación: aunque la licencia declarada es Apache 2.0, fuentes externas indican que el modelo está destinado exclusivamente a fines de investigación, lo que puede limitar su uso comercial.
- Riesgo de contenido inapropiado: al eliminar la censura, el modelo puede generar contenido ofensivo, ilegal o peligroso si se le solicita. El responsable del despliegue debe implementar salvaguardas.
- Alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas de nicho o con prompts ambiguos.
- Sesgos: no se han evaluado sesgos específicos en esta versión; el proceso de abliteración puede alterar el comportamiento en ciertos dominios.
- Limitaciones de idioma: no se ha confirmado el soporte multilingüe; el rendimiento en idiomas distintos del inglés puede ser inferior.
- Compatibilidad: al ser una cuantización GGUF, algunas funcionalidades (como el modo visión) requieren el archivo `mmproj` adicional, que no se menciona en el repo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lalo1999/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-GGUF
- Modelo base (abliterado): https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog sobre la versión uncensored: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Guía de ejecución local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Versión en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
