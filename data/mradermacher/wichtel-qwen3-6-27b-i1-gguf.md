# mradermacher/Wichtel-Qwen3.6-27B-i1-GGUF

## Resumen

Wichtel-Qwen3.6-27B-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo Wichtel-Qwen3.6-27B, un merge basado en Qwen3.6-27B desarrollado por schneewolflabs y cuantizado por mradermacher. El modelo base es un transformer denso de 27.320 millones de parámetros, licenciado bajo Apache 2.0 y orientado a tareas de agentes, tool-use y generación de código. La versión GGUF permite ejecutarlo en entornos con recursos limitados mediante llama.cpp, Ollama u otros motores compatibles.

La relevancia de este modelo radica en que Qwen3.6-27B, según la documentación disponible, alcanza un 77.2% en SWE-bench Verified, superando a modelos mucho más grandes, y es capaz de ejecutarse en hardware de consumo. El merge Wichtel incorpora datasets adicionales de DPO y SFT (Hemlock, egirl, GreatFirewall) que buscan mejorar el comportamiento conversacional y la capacidad de delegación en tareas de agente. Esta versión i1-GGUF ofrece múltiples niveles de cuantización, desde Q2_K hasta Q6_K, con tamaños de archivo entre 11 y 22.5 GB, lo que la hace adecuada para GPUs con 12 GB de VRAM o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.6-27B) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (se espera similar a Qwen3.6, pero no confirmado) |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base Wichtel-Qwen3.6-27B es un merge de Qwen3.6-27B con varios datasets de fine-tuning. Qwen3.6-27B es un transformer denso de 27B parámetros, diseñado por Alibaba para tareas de razonamiento, código y agentes. El merge incorpora datasets como Hemlock-SFT, hemlock-codex3-SFT, hemlock-transmutation, egirl-delegation-dpo, egirl-hemlock-dpo y GreatFirewall-DPO, que añaden capacidades específicas de delegación de tareas, mejora conversacional y alineación con preferencias humanas. No se dispone de detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset. La cuantización i1-GGUF aplica una matriz de importancia (imatrix) para optimizar la calidad de los pesos cuantizados, especialmente en los niveles más bajos.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento y resolución de problemas complejos, heredado de Qwen3.6-27B.
- Generación de código y soporte para tareas de programación (según tags y datasets de codex).
- Tool calling y function calling, orientado a agentes autónomos.
- Capacidad de delegación de tareas (delegation) según el dataset egirl-delegation-dpo.
- Posible soporte de visión (la model card menciona que es un modelo de visión, aunque los archivos mmproj no están en este repositorio, sino en el estático).
- Multilingüe limitado: solo se declara inglés, aunque Qwen3.6 base podría soportar más idiomas, no está confirmado.

## Casos de uso

- Agentes autónomos con tool-use: el modelo puede integrarse en frameworks de agentes como LangChain o AutoGen para ejecutar llamadas a APIs, consultar bases de datos o interactuar con servicios externos, gracias a su entrenamiento en delegación y tool calling.
- Asistente de programación en producción: con soporte para código y razonamiento, puede usarse en IDEs o pipelines de CI/CD para generar, revisar o refactorizar código, aprovechando su rendimiento en SWE-bench (según el base).
- Chatbot de atención al cliente: su capacidad conversacional y fine-tuning con DPO lo hace adecuado para sistemas de soporte en inglés, con respuestas coherentes y alineadas.
- Automatización de tareas de oficina: puede redactar correos, resumir documentos o generar informes, usando su contexto largo (si se confirma) y su capacidad de razonamiento.
- Investigación y análisis de datos: puede ayudar a escribir consultas SQL, scripts de análisis o explicar resultados, integrándose en entornos de notebooks.
- Despliegue en edge o hardware modesto: gracias a las cuantizaciones GGUF, puede ejecutarse en una RTX 3060 de 12 GB o incluso en CPU con llama.cpp, para prototipos o aplicaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo Wichtel-Qwen3.6-27B en la información disponible. El modelo base Qwen3.6-27B, según fuentes externas, alcanza un 77.2% en SWE-bench Verified, superando a modelos de mayor tamaño, pero estos datos no son directamente atribuibles a este merge cuantizado. Se recomienda evaluar el modelo en las tareas concretas de uso antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, entre 11 GB (i1-Q2_K) y 22.5 GB (i1-Q6_K). Para uso cómodo, se recomienda al menos 16 GB de VRAM con cuantizaciones Q4 o superiores.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 para las cuantizaciones más altas. Con Q4_K_M (16.9 GB) cabe en una RTX 4080 (16 GB) o RTX 4070 Ti Super (16 GB).
- En consumer GPU: sí, con cuantizaciones Q4 o inferiores en GPUs de 12-16 GB (RTX 3060, RTX 4070, etc.).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (si se convierte a formato compatible), TGI (con adaptación).
- Latencia y throughput: no disponible. Depende del hardware y la cuantización; en una RTX 4090 con Q4_K_M se esperan decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wichtel-Qwen3.6-27B-i1-GGUF | 27.3B | no disponible | Apache 2.0 | GGUF | Merge con fine-tuning adicional |
| Qwen3.6-27B (base) | 27.3B | no disponible | Apache 2.0 | safetensors | Modelo original, 77.2% SWE-bench |
| Qwen3.6-35B-A3B (MoE) | 35B total, 3B activos | no disponible | Apache 2.0 | safetensors | Variante MoE, más eficiente en inferencia |

No se dispone de comparativas de rendimiento directas entre Wichtel y otros modelos de 27B. La elección entre Wichtel y el base depende de si se necesitan las mejoras conversacionales y de delegación del merge.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar contenido falso o sesgado. El fine-tuning con datasets específicos (egirl, GreatFirewall) puede introducir sesgos no documentados.
- Idioma: solo se declara inglés; el rendimiento en otros idiomas no está garantizado.
- Contexto: no se ha confirmado la longitud de contexto real; si es inferior a la del base, podría fallar en tareas de ventana larga.
- Licencia: Apache 2.0 permite uso comercial, pero el merge puede incluir componentes con licencias adicionales; se recomienda revisar los datasets originales.
- Cuantización: las cuantizaciones más bajas (Q2, Q3) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- Visión: aunque se menciona que es un modelo de visión, los archivos mmproj no están en este repositorio; para usar visión hay que descargarlos del repositorio estático.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Wichtel-Qwen3.6-27B-i1-GGUF
- Modelo base (schneewolflabs): https://huggingface.co/schneewolflabs/Wichtel-Qwen3.6-27B
- Repositorio estático de cuantizaciones: https://huggingface.co/mradermacher/Wichtel-Qwen3.6-27B-GGUF
- Guía de Qwen 3.6-27B (aimadetools): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Página de análisis del modelo (free2aitools): https://free2aitools.com/model/mradermacher/qwen3.6-27b-i1-gguf
