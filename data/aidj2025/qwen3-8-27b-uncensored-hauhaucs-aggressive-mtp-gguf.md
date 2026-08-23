# aidj2025/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una variante sin censura del modelo Qwen3.8-27B, desarrollada por HauhauCS y publicada en HuggingFace por el usuario aidj2025. El modelo elimina los comportamientos de rechazo del modelo original (0/465 refusals) y ofrece respuestas directas y sin preámbulos, manteniendo intactas las capacidades de texto, razonamiento, agéntica, imagen y video del modelo base. Incluye además un acelerador de decodificación especulativa llamado HauhauCS FastMTP, que multiplica por hasta 3,02 veces el throughput de generación de documentos y por 1,93 veces el de razonamiento respecto al modelo sin MTP.

La arquitectura es un transformer denso de 27B parámetros con 64 capas, de las cuales 48 usan capas Gated DeltaNet (atención lineal) y 16 usan atención gatillada (gated attention). Tiene un contexto nativo de 262.144 tokens (256K) extensible a 1M. El modelo se distribuye en formato GGUF con cuantizaciones personalizadas K_P (Perfect) que mejoran la calidad por nivel de cuantización a costa de un 5-15% más de tamaño. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones, aunque el perfil "uncensored" implica riesgos de generación de contenido inapropiado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dense causal LM con vision encoder; 64 capas (48 Gated DeltaNet + 16 gated attention) |
| Parámetros totales | 27B |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K), extensible a 1.000.000 |
| Tipos de cuantización | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M, además del proyector de visión BF16 y el sidecar FastMTP 32K |
| Idiomas soportados | Inglés, chino y multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye archivos safetensors para el proyector de visión) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-27B, un transformer causal denso con un encoder de visión integrado. La arquitectura híbrida combina 48 capas de Gated DeltaNet, que usan atención lineal con estado recurrente, y 16 capas de atención con gating (gated attention), lo que permite manejar contextos largos de forma eficiente. El modelo conserva la cabeza NextN nativa (MTP embebido) que genera múltiples tokens por paso, y se añade el perfil FastMTP de HauhauCS, un sidecar de decodificación especulativa que acelera la generación hasta 3,02 veces en documentos y 1,93 veces en razonamiento comparado con el modelo sin MTP.

No se dispone de información sobre los datos de entrenamiento, el número de tokens o si se aplicó RLHF/DPO. La variante "uncensored" se obtiene mediante un proceso de ablación de rechazos (abliteration) sobre los pesos del modelo original, aunque no se detalla el método exacto en la model card. La variante "Aggressive" elimina los rechazos y reduce los preámbulos en prompts difíciles, dando respuestas directas. La cuantización K_P es un perfil de cuantización personalizado que selecciona qué tensores preservar con mayor precisión, manteniendo calidad superior a la cuantización base equivalente.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del modelo base Qwen3.8-27B, incluyendo razonamiento de múltiples pasos y tareas complejas.
- Capacidades multimodales: procesa imágenes y vídeo mediante el proyector de visión BF16 separado (mmproj). Puede describir, responder preguntas sobre contenido visual y generar texto a partir de imágenes.
- Soporte de agentes y tool calling: aunque no se detalla en la model card, el modelo base Qwen3.8 soporta llamadas a herramientas y razonamiento de múltiples pasos, por lo que se espera que esta variante los conserve.
- Decodificación especulativa: incluye el perfil FastMTP que acelera la generación de tokens mediante la predicción de múltiples tokens por paso.
- Multilingüe: soporta inglés, chino y otros idiomas, con capacidad de respuesta en varios idiomas.
- Sin censura: el modelo no rechaza solicitudes (0/465 refusals) y ofrece respuestas directas, sin preámbulos de seguridad.

## Casos de uso

- Generación de contenido creativo sin restricciones: escritores y guionistas pueden usar el modelo para producir borradores de ficción, poesía o guiones que traten temas sensibles sin temor a rechazos. Su perfil "aggressive" evita los rodeos y entrega directamente el texto solicitado.
- Investigación sobre seguridad de modelos de IA: investigadores que estudian alineación, sesgos o comportamiento de modelos sin censura pueden usar esta variante para analizar cómo responde ante prompts malintencionados o de alto riesgo, comparándolo con el modelo base.
- Asistente de razonamiento en contextos largos: gracias a los 262K tokens de contexto, se puede usar para resumir documentos extensos, libros o informes, manteniendo coherencia en toda la conversación.
- Análisis de imágenes en entornos controlados: el proyector de visión permite extraer información de imágenes o vídeos, útil en aplicaciones de descripción de contenidos, análisis de documentos escaneados o asistencia a personas con discapacidad visual.
- Automatización de tareas agénticas: con soporte para tool calling (heredado del modelo base), puede integrarse en pipelines de automatización para ejecutar acciones como consultas a bases de datos, envío de correos o interacción con APIs, aunque el perfil "aggressive" es más adecuado para entornos controlados.
- Evaluación de modelos de lenguaje: los desarrolladores pueden usar este modelo como referencia en pruebas comparativas de rendimiento y calidad de respuestas, especialmente en escenarios donde se requiere una respuesta directa sin filtros de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente proporciona datos de rendimiento de decodificación especulativa para la variante FastMTP:

| Métrica | Mejora frente a no-MTP | Mejora frente a MTP embebido |
|---|---|---|
| Throughput de generación de documentos (TG) | hasta 3,02x | hasta 35,2% más |
| Throughput de razonamiento (TG) | hasta 1,93x | hasta 21,1% más |

Estos datos indican la aceleración de velocidad de generación, no la calidad del modelo. Se recomienda ejecutar pruebas propias para evaluar el rendimiento en casos de uso concretos.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño del archivo GGUF):
  - Q8_K_P: 31,46 GB (necesita GPU con al menos 32 GB VRAM, como A100 40GB o H100)
  - Q6_K_P: 25,92 GB (GPU de 24 GB como RTX 4090 o A6000)
  - Q5_K_P: 20,22 GB (GPU de 24 GB, puede usar 16 GB con offloading)
  - Q4_K_P: 17,92 GB (GPU de 20 GB o 24 GB)
  - IQ4_XS: 15,71 GB (GPU de 16 GB como RTX 4090)
  - Q3_K_P: 13,44 GB (GPU de 16 GB, por ejemplo RTX 4080)
  - Q2_K_P: 10,68 GB (GPU de 12 GB como RTX 3060)
  - IQ2_M: 10,32 GB (GPU de 12 GB, con posible offloading)
- El proyector de visión BF16 añade 931 MB adicionales si se usa visión.
- El sidecar FastMTP 32K añade 903 MB (opcional, para decodificación especulativa).
- En CPU, se puede ejecutar con llama.cpp usando memoria RAM, aunque la velocidad será menor. Para GPU, se recomienda CUDA o Metal en Apple Silicon (funciona en Mac M5 Pro según la búsqueda web).
- Opciones de despliegue: llama.cpp (soporte completo de GGUF), LM Studio, Ollama (con compatibilidad GGUF), y otros runtimes compatibles con GGUF. Para despliegue en servidor, se puede usar vLLM con conversión a otros formatos (aunque no se proporciona soporte oficial para esta variante).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | safetensors, GGUF | Modelo original con filtros de seguridad |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive (este) | 27B | 262K | Apache 2.0 | GGUF | Sin censura, con MTP y FastMTP |
| Qwen3.8-27B-Uncensored (abliterado, de orcarouter) | 27B | 262K | Apache 2.0 | GGUF, FP8 | Otra variante sin censura, sin MTP |

No se dispone de resultados de benchmarks comparativos para estos modelos. La elección entre ellos depende de si se necesita el perfil agresivo, la aceleración MTP o la compatibilidad con otros formatos.

## Limitaciones y advertencias

- Sesgos y riesgo de contenido dañino: al eliminar los rechazos, el modelo puede generar contenido violento, discriminatorio, sexualmente explícito o peligroso. Es responsabilidad del usuario implementar filtros adicionales si se usa en entornos de producción.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento o con datos no vistos en entrenamiento.
- Limitaciones de contexto: aunque el contexto nativo es de 262K tokens, el rendimiento y la coherencia pueden degradarse con contextos extremadamente largos. La extensión a 1M tokens es posible pero puede requerir técnicas de optimización adicionales.
- Restricciones de licencia: aunque la licencia Apache 2.0 permite uso comercial, el modelo puede generar contenido que infrinja leyes o políticas de la plataforma donde se despliegue. El usuario es responsable de cumplir la normativa aplicable.
- Riesgo de uso indebido: la ausencia de censura lo hace adecuado para investigación, pero no para aplicaciones orientadas al público sin moderación.
- La variante "Aggressive" puede omitir preámbulos y dar respuestas demasiado directas, lo que en contextos profesionales puede resultar inapropiado. La model card recomienda la variante "Balanced" para tareas críticas de agente de largo contexto.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/aidj2025/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF)
- [Model card de HauhauCS (original)](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/tree/main)
- [GitHub con instrucciones de uso](https://github.com/Wassimyounes01/qwen38-uncensored)
- [Artículo sobre cómo ejecutar el modelo localmente](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
- [Artículo sobre la versión abliterada](https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf)
