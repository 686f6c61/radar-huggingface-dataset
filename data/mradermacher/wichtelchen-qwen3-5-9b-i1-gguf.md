# mradermacher/Wichtelchen-Qwen3.5-9B-i1-GGUF

## Resumen

Wichtelchen-Qwen3.5-9B-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo Wichtelchen-Qwen3.5-9B, creada por mradermacher. El modelo base, desarrollado por schneewolflabs, es un merge basado en Qwen3.5-9B, orientado a agentes, tool-use, generación de código y conversación, con un componente de visión (según la model card). Esta versión GGUF permite ejecutar el modelo en entornos con recursos limitados, desde CPU hasta GPU de consumo, mediante cuantizaciones que van desde 4.0 GB hasta 7.7 GB. El modelo tiene 9.197 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y de investigación.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 9B con capacidades de agente y tool-use en hardware asequible, sin necesidad de infraestructura de servidor dedicada. Al ser un merge con datasets de DPO y SFT específicos (GreatFirewall-DPO, egirl-DPO, Hemlock-SFT), el modelo está afinado para tareas conversacionales y de delegación de herramientas, aunque no se dispone de documentación detallada sobre su arquitectura interna ni sus datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.5-9B, probablemente transformer) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Wichtelchen-Qwen3.5-9B. Según la model card, se trata de un merge (etiqueta `merge`) que parte de Qwen3.5-9B, aunque no se especifican los componentes del merge ni la arquitectura exacta (número de capas, tipo de atención, etc.). El modelo fue afinado mediante una combinación de datasets de DPO y SFT, incluyendo `nbeerbower/GreatFirewall-DPO`, `schneewolflabs/egirl-DPO`, `schneewolflabs/egirl-delegation-dpo`, `schneewolflabs/egirl-hemlock-dpo` y `hemlang/Hemlock-SFT-combined`. Estos datasets sugieren un enfoque en conversación, delegación de tareas y razonamiento con herramientas, pero no se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el proceso de alineación (RLHF, DPO, etc.). La model card indica que es un modelo de visión, lo que implica que incluye un proyector multimodal, aunque no se proporcionan más especificaciones.

## Capacidades

- Generación de texto conversacional: afinado con datasets de DPO orientados a diálogo (egirl-DPO, Hemlock-SFT), lo que sugiere buena capacidad para mantener conversaciones multi-turno.
- Tool-use y function calling: las etiquetas `tool-use` y `agents` indican soporte para invocar herramientas externas, aunque no se detalla el formato exacto.
- Generación de código: etiqueta `code`, probablemente heredada de Qwen3.5-9B, que es conocido por sus capacidades de programación.
- Razonamiento multi-step: la combinación de datasets de delegación (egirl-delegation-dpo) apunta a capacidad de planificación y ejecución de tareas complejas.
- Visión: según la model card, es un modelo de visión, aunque no se especifican las capacidades multimodales concretas (reconocimiento de imágenes, OCR, etc.).
- Multilingüismo: solo se declara inglés (`language: en`), aunque Qwen3.5-9B base podría soportar más idiomas; no hay confirmación.

## Casos de uso

- Asistentes conversacionales con personalidad: el afinamiento con datasets egirl-DPO y Hemlock-SFT lo hace adecuado para chatbots con estilo definido, por ejemplo en aplicaciones de entretenimiento o compañía virtual.
- Agentes autónomos con tool-use: gracias a las etiquetas `agents` y `tool-use`, puede integrarse en pipelines donde el modelo decide qué herramientas llamar (búsqueda web, APIs, calculadoras) para resolver tareas.
- Generación de código asistida: su capacidad de código permite usarlo como autocompletado o generador de fragmentos en entornos de desarrollo, aunque se debe validar la calidad en producción.
- Automatización de tareas de delegación: el dataset egirl-delegation-dpo sugiere que el modelo puede descomponer tareas complejas y delegar subtareas a otros agentes o funciones.
- Prototipado rápido de chatbots: al ser un GGUF de 9B, puede ejecutarse en una GPU de consumo (por ejemplo, RTX 3060 con 12 GB) para pruebas de concepto sin coste de API.
- Despliegue en edge o CPU: las cuantizaciones pequeñas (Q2_K, IQ3_S) permiten ejecutar el modelo en CPU con pocos GB de RAM, útil para entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo o su base. Se recomienda evaluar el modelo en las tareas específicas de uso antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tamaño de los archivos GGUF, la cuantización Q4_K_M (5.9 GB) cabe en GPUs con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060). Las cuantizaciones más pequeñas (Q2_K, 4.0 GB) pueden ejecutarse en GPUs con 6 GB o incluso en CPU con suficiente RAM.
- GPU recomendadas: para una experiencia fluida, se recomienda una GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070). Para cuantizaciones mayores (Q6_K, 7.7 GB), se necesitan 10-12 GB de VRAM (RTX 3080, RTX 4070).
- Si cabe en consumer GPU: sí, la mayoría de las cuantizaciones caben en GPUs de consumo de gama media.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores como vLLM (con adaptador GGUF) o TGI (con conversión previa). También se puede usar con el backend de llama.cpp en Python.
- Latencia y throughput: no se dispone de datos medidos. En una GPU de 8 GB con Q4_K_M, se puede esperar una velocidad de generación de 20-40 tokens/s, pero esto es una estimación general y no un dato oficial.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas. Al ser un merge basado en Qwen3.5-9B, podría compararse con otros GGUF de Qwen3.5-9B (por ejemplo, mradermacher/Qwen3.5-9B-GGUF), pero no hay datos de rendimiento publicados. Tampoco se conocen modelos de la misma categoría (merge de 9B con tool-use y visión) con los que establecer una comparación objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: al ser un merge con datasets como egirl-DPO, el modelo puede presentar sesgos de género o de estilo conversacional que no son adecuados para todos los contextos.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento o código.
- Limitaciones de contexto: no se conoce la longitud de contexto soportada; si es la estándar de Qwen3.5-9B (probablemente 32K o 128K), pero no está confirmado.
- Limitaciones de idioma: solo se declara inglés; el uso en otros idiomas puede degradar la calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero se debe verificar que los datasets utilizados no tengan restricciones adicionales (no se especifica).
- Caveat para producción: al ser un modelo cuantizado, la calidad puede verse reducida respecto al modelo original en precisión flotante. Se recomienda probar con la cuantización Q4_K_M o superior para tareas críticas.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/Wichtelchen-Qwen3.5-9B-i1-GGUF
- Modelo base (schneewolflabs/Wichtelchen-Qwen3.5-9B): https://huggingface.co/schneewolflabs/Wichtelchen-Qwen3.5-9B
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Wichtelchen-Qwen3.5-9B-GGUF
- Página de descarga conveniente (enlace externo): https://hf.tst.eu/model#Wichtelchen-Qwen3.5-9B-i1-GGUF
