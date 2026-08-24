# davenetdev/Qwen3.8-27B-Uncensored-ROCMFPX-MTP-GGUF

## Resumen

El modelo `davenetdev/Qwen3.8-27B-Uncensored-ROCmFPX-MTP-GGUF` es una variante del modelo Qwen3.8-27B de Alibaba, adaptada por el usuario davenetdev para eliminar los filtros de rechazo (versión "uncensored") y optimizada para ejecutarse en GPUs de AMD mediante la biblioteca ROCmFPX. Se distribuye en formato GGUF, lo que facilita su despliegue en entornos de inferencia local como llama.cpp, Ollama o vLLM con soporte para cuantización. El modelo base es `JonathanColetti/Qwen3.8-27B-Uncensored-GGUF`, que a su vez deriva del Qwen3.8-27B original, un modelo denso multimodal con 27 mil millones de parámetros y atención híbrida (Gated DeltaNet lineal + atención completa). Esta variante incorpora además un cabezal MTP (Multi-Token Prediction) para decodificación especulativa, lo que mejora la velocidad de generación.

El modelo está pensado para desarrolladores e investigadores que buscan un LLM potente con capacidades de razonamiento, generación de código y tool-calling, sin restricciones de contenido, y que puedan ejecutarse en hardware local de gama media-alta, especialmente con GPUs AMD. Al ser una versión "uncensored", elimina los mecanismos de rechazo del modelo original, lo que puede ser útil en aplicaciones donde se requiere una generación de texto sin censura, aunque conlleva riesgos éticos y de seguridad. La variante ROCmFPX indica que está compilada específicamente para la plataforma ROCm de AMD, aunque no se especifican los detalles de la optimización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet + atención completa) y cabez MTP para decodificación especulativa |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (se desconoce el valor exacto del modelo base; probablemente 128k o similar, pero no confirmado) |
| Tipos de cuantizacion | GGUF (no se especifican los niveles concretos, pero el repo tiene 70,8 GB, lo que sugiere múltiples cuantizaciones) |
| Idiomas soportados | No disponibles (el modelo base Qwen3.8-27B es multilingüe, pero no se ha confirmado para esta variante) |
| Licencia | No disponible (el modelo base de Qwen suele ser Apache 2.0, pero esta variante no lo indica) |
| Formato de pesos | GGUF (safetensors no aplica aquí, aunque los parámetros se refieren a safetensors) |

---

## Arquitectura y entrenamiento

El modelo Qwen3.8-27B original, desarrollado por Alibaba, es un LLM denso multimodal que combina atención de ventana completa con una capa lineal basada en Gated DeltaNet, una técnica que reduce el coste computacional del procesamiento de secuencias largas. Esta arquitectura híbrida permite manejar contextos extensos con menor uso de memoria y mayor velocidad en comparación con la atención completa tradicional. El modelo también incorpora un cabez MTP (multi-token prediction) para decodificación especulativa, que genera múltiples tokens en paralelo para acelerar la inferencia.

La versión "uncensored" de Jonathan Coletti se obtuvo mediante un proceso de "abliteration", que elimina los pesos responsables de los rechazos y la censura del modelo original. Esto se consigue mediante técnicas de modificación de pesos post-entrenamiento, sin un reentrenamiento completo. La variante ROCmFPX de davenetdev añade una capa de optimización para el ecosistema ROCm de AMD, probablemente usando kernels o bibliotecas específicas para mejorar el rendimiento en GPUs Radeon. No se dispone de información sobre los datos de entrenamiento o el proceso de ajuste, ya que el autor no los detalló en la model card.

---

## Capacidades

- Generación de texto libre y sin censura (debido al proceso de abliteration).
- Razonamiento complejo y multi-step, gracias a la arquitectura del modelo base Qwen3.8-27B.
- Generación de código y soporte para tool-calling / function calling, lo que permite integrarlo en agentes autónomos.
- Capacidades multimodales: el modelo base acepta entradas de imagen y texto (visión-lenguaje), aunque la variante GGUF puede requerir un proyector de visión (mmproj) que no está incluido en este repo (según la descripción de la variante YMQ-MTP, el mmproj viene incluido, pero aquí no se menciona).
- Soporte para decodificación especulativa (MTP) que acelera la inferencia.
- Multilingüismo: el modelo base soporta múltiples idiomas, pero no se confirma para esta variante específica.
- Compatibilidad con ROCmFPX, que optimiza el uso de GPUs AMD.

---

## Casos de uso

- Desarrollo de asistentes de código sin restricciones: el modelo puede generar código en múltiples lenguajes, explicar algoritmos y refactorizar código. Al ser uncensored, puede manejar prompts que otros modelos rechazarían (por ejemplo, código ofuscado o malicioso en entornos de investigación).
- Automatización de ofimática y agentes: gracias a su soporte de tool-calling, puede integrarse en pipelines de automatización para interactuar con APIs, bases de datos o servicios web, realizando tareas como generación de informes, gestión de calendarios o envío de correos.
- Investigación en generación de contenido creativo: novelas, guiones, poesía o contenido publicitario donde se requiera explorar temas tabú sin filtros, como en estudios de narrativa o análisis de lenguaje.
- Desarrollo de chatbots para nichos específicos: por ejemplo, asistentes para adultos o para juegos de rol que no aceptan censura.
- Pruebas de seguridad ofensiva: en entornos de red team, se puede usar para generar payloads de phishing o exploits, aunque esto conlleva riesgos legales y éticos.
- Despliegue local en hardware AMD: la variante ROCmFPX está pensada para ejecutarse en GPUs de AMD, por lo que es adecuada para desarrolladores que usan tarjetas Radeon o Instinct sin necesidad de hardware NVIDIA.

---

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de rendimiento (como MMLU, HumanEval, GSM8K) para esta variante específica. Los benchmarks del modelo original Qwen3.8-27B son conocidos, pero no se pueden extrapolar a la versión uncensored ni a la variante ROCmFPX sin datos oficiales.

---

## Requisitos de hardware

- VRAM estimada: un modelo de 27,3 B parámetros en GGUF con cuantización 4-bit requiere aproximadamente 14-16 GB de VRAM (según la práctica común para modelos de este tamaño). Con cuantización 8-bit, se necesita alrededor de 27-30 GB. Sin embargo, no se ha especificado el nivel de cuantización de este repo.
- GPU recomendadas: para ejecutar en ROCm, se necesitan GPUs AMD compatibles con ROCm, como las series Radeon RX 6000/7000 o las Instinct MI100/MI200. No se recomienda para Nvidia, aunque ROCmFPX podría tener una versión CUDA.
- En consumer GPU: cabe en tarjetas con al menos 16 GB de VRAM (por ejemplo, RX 7900 XTX o RTX 4090, aunque esta última no es AMD). En cuantizaciones más bajas (2-3 bits) podría caber en 8 GB, pero no se confirma.
- Opciones de despliegue: al ser GGUF, se puede usar con llama.cpp, Ollama, LM Studio, KoboldCpp, o vLLM (si tiene soporte para GGUF). También se puede usar con la biblioteca ROCmFPX directamente.
- Latencia y throughput: no se dispone de datos medidos.

---

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27 B | No disponible (probablemente 128k) | Apache 2.0 (según Alibaba) | safetensors | Multimodal, razonamiento, tool-calling |
| Llama 3.1 8B | 8 B | 128k | Llama 3.1 Community License | GGUF, safetensors | Menor capacidad, sin visión |
| Qwen2.5-27B | 27 B | 128k | Apache 2.0 | safetensors | Versión anterior, sin visión |
| Mixtral 8x7B | 46,7 B (8x7B) | 32k | Apache 2.0 | safetensors | MoE, no multimodal |

La comparativa no es completa porque no se dispone de datos de rendimiento de esta variante. En general, Qwen3.8-27B se posiciona como un modelo de 27B con capacidades multimodales y atención híbrida, superando en tareas de código y agentes a Llama 3.1 8B y compitiendo con modelos de mayor tamaño como Llama 3.3 70B en ciertas tareas, pero no se puede afirmar sin benchmarks.

---

## Limitaciones y advertencias

- Modelo "uncensored": el proceso de abliteration elimina los filtros de rechazo, lo que puede producir contenido inapropiado, ofensivo o peligroso. No es adecuado para aplicaciones comerciales que requieran moderación.
- Riesgo de alucinación: como todos los LLM, puede generar información falsa o inventada, especialmente en temas no cubiertos en su entrenamiento.
- Limitaciones de contexto: no se conoce la longitud de contexto exacta en esta variante. Si es igual al modelo base, probablemente sea 128k tokens, pero puede reducirse en cuantizaciones bajas.
- Idiomas: aunque el modelo base es multilingüe, no se ha confirmado el rendimiento en idiomas específicos para esta variante.
- Licencia: no se especifica la licencia de esta variante. Aunque el modelo original es Apache 2.0, la variante "uncensored" puede tener restricciones adicionales. No se recomienda uso comercial sin verificar.
- Dependencia de ROCmFPX: el modelo requiere la biblioteca ROCmFPX para funcionar, lo que limita su portabilidad a otros frameworks.
- Riesgos de seguridad: al no tener censura, puede generar código malicioso, phishing o contenido ilegal. El usuario es responsable de su uso.

---

## Enlaces

- [HuggingFace - davenetdev/Qwen3.8-27B-Uncensored-ROCmFPX-MTP-GGUF](https://huggingface.co/davenetdev/Qwen3.8-27B-Uncensored-ROCMFPX-MTP-GGUF)
- [HuggingFace - JonathanColetti/Qwen3.8-27B-Uncensored](https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored)
- [GitHub - ROCmFPX](https://github.com/charlie12345/ROCmFPX)
- [GitHub - AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Ollama - orcarouter/Qwen3.8-27B-Uncensored](https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored)
