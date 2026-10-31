# mradermacher/Apex-35B-V1.0-i1-GGUF

## Resumen

Esta ficha corresponde a la colección de cuantizaciones GGUF con imatrix (weighted quants) del modelo Apex-35B-V1.0, preparada por el cuantizador conocido mradermacher. El modelo original, Apex-35B-V1.0, es un modelo de lenguaje desarrollado por Apexintelligence-AI, etiquetado como mixture-of-experts (MoE) y orientado a casos de uso de agentes e investigación. Con 35.505 millones de parámetros totales, se sitúa en la gama de modelos medianos-grandes, y su licencia Apache 2.0 permite su uso comercial sin restricciones significativas.

La relevancia de este repositorio radica en que hace accesible el modelo en formato GGUF, lo que permite ejecutarlo localmente mediante llama.cpp, Ollama u otros runtimes compatibles, sin depender de GPUs de centro de datos. La colección incluye cuantizaciones desde i1-Q2_K (13,3 GB) hasta i1-Q6_K (29,3 GB), cubriendo un amplio rango de hardware, desde GPUs de consumo hasta estaciones de trabajo con VRAM abundante. El autor indica además que se trata de un modelo de visión, con los archivos mmproj disponibles en el repositorio estático correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), tipo transformer |
| Parametros totales | 35.505.251.456 (aprox. 35,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de cuants estáticos en el repo hermano) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base está en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base, Apexintelligence-AI/Apex-35B-V1.0, está etiquetado como mixture-of-experts, lo que implica una arquitectura transformer en la que solo un subconjunto de los parámetros totales se activa por token, reduciendo el coste computacional de inferencia respecto a un modelo denso de tamaño equivalente. El número exacto de parámetros activos por token no está disponible en la información proporcionada, por lo que no es posible estimar con precisión el coste real de inferencia ni los requisitos de cómputo por token.

Sobre el proceso de entrenamiento no hay datos publicados en la model card: se desconocen el número de tokens de entrenamiento, la composición del corpus, y si se aplicaron etapas de RLHF, DPO u otros métodos de alineación. Las etiquetas del repositorio (agent, research, conversational) sugieren un enfoque hacia tareas de agentes y diálogo, pero no hay documentación técnica detallada que lo confirme. Lo que sí está documentado es el proceso de cuantización: mradermacher ha generado cuantizaciones weighted con matriz de importancia (imatrix), una técnica que mejora la calidad de las cuantizaciones bajas al ponderar los errores de cuantización según la sensibilidad real de cada peso, medida con un dataset de calibración.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como conversational, lo que indica soporte de diálogo multi-turno.
- Capacidades de agente: la etiqueta agent sugiere diseño o afinamiento para flujos de agentes, aunque no hay documentación sobre soporte específico de tool calling o function calling.
- Capacidades de visión: el autor indica explícitamente que es un modelo de visión, con archivos mmproj (proyector multimodal) disponibles en el repositorio de cuantizaciones estáticas.
- Orientación a investigación: etiquetado como research, adecuado para experimentación y evaluación.
- Idioma principal: inglés. No hay evidencia de soporte multilingüe formal.
- Razonamiento, código y matemáticas: no disponible; no hay datos publicados sobre estas capacidades.

## Casos de uso

- Ejecución local de un modelo de 35B en estaciones de trabajo: con la cuantización i1-Q4_K_M (21,8 GB) el modelo cabe en una RTX 4090 de 24 GB o se reparte entre GPU y RAM, permitiendo inferencia privada sin coste de API.
- Prototipado de agentes: gracias a la etiqueta agent y a la licencia Apache 2.0, es adecuado para construir prototipos de agentes que razonan sobre tareas multi-paso, ejecutándose en infraestructura propia.
- Análisis de imágenes con modelos locales: al tratarse de un modelo de visión, puede emplearse para descripción de imágenes, OCR aproximado o análisis visual en entornos donde no se desee enviar datos a servicios externos.
- Investigación en cuantización: la colección completa de cuants imatrix (desde IQ1/IQ2 hasta Q6_K) lo convierte en un buen banco de pruebas para estudiar la degradación de calidad en cuantizaciones agresivas de modelos MoE.
- Despliegue en servidores de inferencia con presupuesto de VRAM limitado: la cuantización i1-Q4_K_S (20,5 GB) ofrece según el autor el mejor equilibrio tamaño/velocidad/calidad para servidores con GPUs de 24 GB.
- Desarrollo de chatbots en inglés: su etiqueta conversational y formato GGUF facilitan la integración en aplicaciones de chat mediante llama.cpp o backends compatibles (por ejemplo, LM Studio o text-generation-webui).
- Generación de un dataset de calibración propio: el archivo imatrix de 0,5 GB incluido permite a terceros crear sus propias cuantizaciones personalizadas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye evaluaciones (MMLU, HumanEval, GSM8K u otras) del modelo base, y tampoco se dispone de datos del autor original de Apex-35B-V1.0 en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV-cache):
  - i1-Q2_K: 13,3 GB
  - i1-Q3_K_S / IQ3_S / IQ3_M: 15,6–15,9 GB
  - i1-Q4_K_S: 20,5 GB; i1-Q4_K_M: 21,8 GB
  - i1-Q5_K_M: 25,4 GB; i1-Q6_K: 29,3 GB
  - A estas cifras hay que añadir la memoria del contexto (KV-cache) y, si se usan capacidades de visión, el mmproj correspondiente.
- GPUs recomendadas:
  - RTX 4090 (24 GB): adecuado para cuants Q3 y Q4 con contexto moderado.
  - RTX 3090 (24 GB): similar al anterior, con menor ancho de banda de memoria.
  - A100 40/80 GB o H100: permiten usar cuants Q5/Q6 con contextos largos y mayor throughput.
  - GPUs de 16 GB (RTX 4080/4060 Ti 16G): solo con cuants Q2/Q3 y contexto reducido, o con descarga parcial a RAM.
- Consumer GPU: sí cabe en GPUs de 24 GB (RTX 3090/4090) con cuantizaciones Q3/Q4; en GPUs de 16 GB solo con las cuantizaciones más agresivas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. No hay evidencia de soporte directo en vLLM o TGI para estos archivos GGUF; para esos backends habría que usar los pesos originales del modelo base.
- Latencia y throughput: no disponible. Al ser un MoE, el rendimiento por token depende de los parámetros activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Formato |
|---|---|---|---|---|
| Apex-35B-V1.0 (este modelo) | 35,5B totales | MoE | Apache 2.0 | GGUF (imatrix), safetensors |
| Qwen3-30B-A3B | 30,5B totales / ~3B activos | MoE | Apache 2.0 | safetensors, GGUF |
| Mixtral-8x7B-Instruct | ~47B totales / ~13B activos | MoE | Apache 2.0 | safetensors, GGUF |

Nota: la comparación es aproximada por categoría de tamaño y arquitectura. No hay datos de benchmarks que permitan comparar rendimiento real entre estos modelos; Apex-35B-V1.0 se distingue por su enfoque en agentes y visión, pero su número de parámetros activos no está disponible, lo que impide comparar coste de inferencia con precisión.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; el rendimiento en castellano no está documentado y probablemente sea inferior o no garantizado.
- Sesgos conocidos: no disponible; no hay documentación del autor original sobre sesgos o mitigaciones aplicadas.
- Alucinaciones: como cualquier LLM, puede generar contenido falso con apariencia plausible; al carecer de benchmarks publicados, no es posible cuantificar su fiabilidad.
- Cuantizaciones agresivas: los cuants Q2_K y Q3 reducen notablemente la calidad; el propio autor recomienda IQ3_XXS sobre Q2_K e indica que Q4_0 es de "baja calidad". Para producción se recomienda Q4_K_S o superior.
- Documentación escasa: la falta de datos sobre parámetros activos, longitud de contexto y proceso de entrenamiento dificulta la evaluación seria del modelo para producción.
- Licencia: Apache 2.0 no impone restricciones comerciales relevantes, pero conviene revisar el archivo LICENSE del modelo base para condiciones adicionales.
- Visión: los archivos mmproj están en el repositorio de cuants estáticos, no en este; hay que descargarlos de allí para usar capacidades multimodales.
- Producción: dado que el modelo está etiquetado como research y carece de benchmarks públicos, se desaconseja su uso en producción sin una evaluación interna previa.

## Enlaces

- Repositorio de cuantizaciones imatrix (esta ficha): https://huggingface.co/mradermacher/Apex-35B-V1.0-i1-GGUF
- Modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Apex-35B-V1.0-GGUF
- Página de descargas con vista general: https://hf.tst.eu/model#Apex-35B-V1.0-i1-GGUF
- Licencia del modelo base: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0/blob/main/LICENSE
- FAQ y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
