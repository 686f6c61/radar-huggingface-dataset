# mradermacher/Llama-3.1-8B-Instruct-Uncensored-i1-GGUF

## Resumen

El modelo `mradermacher/Llama-3.1-8B-Instruct-Uncensored-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo base `knoveleng/Llama-3.1-8B-Instruct-Uncensored`, que a su vez deriva de Llama 3.1 8B Instruct de Meta. El modelo base ha sido sometido a un proceso de "abliteración" (abliteration) para eliminar los mecanismos de rechazo y censura del modelo original, y a una técnica denominada "orthex" (posiblemente relacionada con regularización ortogonal), lo que da como resultado un modelo de lenguaje sin restricciones de contenido. El autor, mradermacher, ha generado cuantizaciones GGUF optimizadas con imatrix para su uso en entornos locales con recursos limitados.

Este modelo está pensado para desarrolladores e investigadores que necesitan un LLM conversacional en inglés sin filtros de seguridad, capaz de generar texto libre sobre cualquier tema. Al estar cuantizado en GGUF, es compatible con herramientas como llama.cpp, Ollama o LM Studio, y puede ejecutarse en hardware de consumo. La relevancia actual radica en la creciente demanda de modelos "uncensored" para aplicaciones de roleplay, escritura creativa o investigación en alineación de modelos, aunque su uso conlleva riesgos éticos y legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.1 soporta 128k, pero no se confirma para esta cuantizacion) |
| Tipos de cuantizacion | i1-Q2_K (3.3 GB), archivo imatrix (0.1 GB); se mencionan otros quants estaticos en un repositorio aparte |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base `knoveleng/Llama-3.1-8B-Instruct-Uncensored` es una variante de Llama 3.1 8B Instruct, un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm y embeddings rotatorios (RoPE). Sobre este modelo se aplicaron dos técnicas: la abliteración, que consiste en eliminar o neutralizar las direcciones de los pesos responsables de los comportamientos de rechazo, y "orthex", una técnica cuyo detalle no se documenta en la información disponible. El resultado es un modelo que no rechaza peticiones ni aplica políticas de seguridad.

El autor mradermacher ha cuantizado el modelo a formato GGUF utilizando una matriz de importancia (imatrix) para mejorar la calidad de la cuantización, especialmente en los niveles de baja precisión. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO en el modelo base original (Llama 3.1 Instruct sí usó SFT y RLHF, pero no se confirma para esta variante).

## Capacidades

- Generación de texto libre sin filtros de contenido ni rechazo de peticiones.
- Instrucciones conversacionales en inglés, adecuado para diálogos multi-turno.
- Capacidad de seguir instrucciones complejas (heredada de Llama 3.1 Instruct).
- No se confirma soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se confirma capacidad multimodal (solo texto).
- No se confirma soporte multilingüe más allá del inglés.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativas, poesía o guiones con temáticas adultas o controvertidas sin rechazo, útil para autores que exploran límites creativos.
- Roleplay y simulación de personajes: en plataformas como SillyTavern, el modelo puede interpretar personajes sin censura, ofreciendo respuestas más naturales en escenarios complejos.
- Investigación en alineación y seguridad de IA: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, comparándolo con versiones alineadas para analizar sesgos y riesgos.
- Generación de contenido para pruebas de estrés: se puede usar para evaluar cómo responden los sistemas de moderación ante entradas extremas, aunque con precaución.
- Asistente personal sin filtros: para usuarios que desean respuestas directas sin evasivas sobre temas sensibles (política, religión, sexualidad).
- Fine-tuning experimental: el modelo cuantizado puede servir como base para experimentos de adaptación a dominios específicos donde se requiera libertad de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para esta cuantización específica.

## Requisitos de hardware

- El archivo i1-Q2_K pesa 3.3 GB, por lo que cabe en GPUs con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, o incluso en CPU con suficiente RAM).
- Para una experiencia fluida se recomienda una GPU con 6-8 GB de VRAM (RTX 3060, RTX 2070, etc.) que permita cargar el modelo completo en memoria.
- Es compatible con llama.cpp, Ollama, LM Studio y cualquier runtime que soporte GGUF.
- El throughput estimado depende del hardware; en una RTX 3060 se pueden esperar entre 20-40 tokens/segundo con cuantización Q2_K, pero no hay datos oficiales.
- Para uso en producción con mayor calidad, se recomienda usar cuantizaciones superiores (Q4_K_M, Q5_K_M) disponibles en el repositorio de quants estáticos, que requieren más VRAM (5-7 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Llama-3.1-8B-Instruct-Uncensored-i1-GGUF | 8B | no disponible | no disponible | GGUF | Cuantización imatrix, uncensored |
| DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-i1-GGUF | 8B | no disponible | no disponible | GGUF | También uncensored, mismo autor |
| Llama-3.1-8B-Instruct-heretic-i1-GGUF | 8B | no disponible | no disponible | GGUF | Otra variante uncensored del mismo autor |
| Meta-Llama-3.1-8B-Instruct (original) | 8B | 128k | Llama 3.1 Community License | safetensors | Con censura y alineación |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal, sexualmente explícito o peligroso. Su uso en producción requiere medidas de moderación externas.
- La abliteración no elimina los sesgos subyacentes del modelo original; puede reflejar prejuicios presentes en los datos de entrenamiento de Llama 3.1.
- Riesgo elevado de alucinación, especialmente en temas factuales, al no contar con mecanismos de verificación.
- La cuantización Q2_K degrada significativamente la calidad de las respuestas; se recomienda usar cuantizaciones superiores si la calidad es prioritaria.
- No se dispone de licencia explícita; el uso comercial puede estar sujeto a las restricciones de la licencia de Llama 3.1 (Community License) y a las condiciones del modelo base, que no se detallan.
- El contexto máximo no está confirmado; aunque Llama 3.1 soporta 128k, la cuantización puede reducir la ventana efectiva.
- Solo soporta inglés; no se garantiza un rendimiento adecuado en otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/knoveleng/Llama-3.1-8B-Instruct-Uncensored
- Quants estáticos: https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-Uncensored-GGUF
- Página de ayuda del autor: https://huggingface.co/mradermacher/model_requests
- Sitio de nethype GmbH: https://www.nethype.de/
