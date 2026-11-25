# mradermacher/Radiant-Dawn-26B-A4B-GGUF

## Resumen

Radiant-Dawn-26B-A4B-GGUF es una versión cuantizada en formato GGUF del modelo Sorihon/Radiant-Dawn-26B-A4B, publicada por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 26.000 millones de parámetros totales (25.971.339.550 según los pesos safetensors del modelo base) que, por su nomenclatura A4B, corresponde a una arquitectura de mezcla de expertos (MoE) con unos 4.000 millones de parámetros activos por token. El modelo base se ha generado mediante mergekit, es decir, es el resultado de una fusión de modelos preexistentes, no de un entrenamiento desde cero.

El repositorio ofrece únicamente cuantizaciones estáticas del modelo original, generadas con la librería llama.cpp y publicadas para su uso con transformers y con herramientas compatibles con GGUF. El autor no documenta la procedencia exacta de los modelos fusionados, el dataset de entrenamiento ni los datos de evaluación, por lo que la información técnica disponible es limitada.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de 26B con solo unos 4B de parámetros activos en hardware de consumo, gracias a las cuantizaciones que van desde 10,9 GB (Q2_K) hasta 27,7 GB (Q8_0). Es una opción práctica para experimentación local con modelos de gran tamaño y bajo coste computacional por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), derivada de un merge con mergekit; detalles internos no disponibles |
| Parametros totales | 25.971.339.550 (aprox. 26B) |
| Parametros activos | aprox. 4B (según nomenclatura A4B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en el repo i1-GGUF |
| Idiomas soportados | en (inglés, según el tag de idioma de la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Sorihon/Radiant-Dawn-26B-A4B se ha construido mediante mergekit, una herramienta de fusión de pesos que combina varios modelos preentrenados sin un entrenamiento adicional completo. La designación A4B indica una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parámetros activos sobre un total de 26.000 millones, lo que reduce el coste computacional por token a cambio de requerir la carga completa de los pesos en memoria.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card del repositorio cuantizado no incluye estos datos y el autor no los documenta.

## Capacidades

- Generación de texto conversacional en inglés, según el tag `conversational` del repositorio.
- Razonamiento y generación de contenido general, heredado de los modelos fusionados (no verificado).
- Capacidades multilingües limitadas: el único idioma declarado es el inglés.
- Compatibilidad con endpoints y herramientas que aceptan GGUF (tag `endpoints_compatible`).
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Experimentación local con modelos MoE de gran tamaño: gracias a sus ~4B parámetros activos y a las cuantizaciones de 10,9 a 17,3 GB, puede ejecutarse en GPUs de consumo para probar arquitecturas MoE sin infraestructura de datacenter.
- Prototipado de asistentes conversacionales en inglés: el modelo está etiquetado como conversacional y puede usarse en entornos de desarrollo para validar flujos de diálogo multi-turno antes de pasar a modelos con licencia y benchmarks verificados.
- Evaluación de técnicas de fusión de modelos: al ser un merge de mergekit, sirve para estudiar el comportamiento de modelos fusionados frente a sus componentes originales en tareas de generación.
- Despliegue en entornos con recursos limitados: las variantes Q4_K_S y Q4_K_M (16,0 y 17,3 GB) están marcadas como "fast, recommended" y encajan en GPUs de 24 GB, lo que permite servir el modelo en estaciones de trabajo.
- Generación de texto por lotes en pipelines de investigación: al ser un GGUF compatible con llama.cpp, puede integrarse en scripts de generación masiva para experimentos académicos.
- Pruebas de compatibilidad de tooling GGUF: útil para validar la integración de llama.cpp, Ollama u otros runners con modelos MoE cuantizados de 26B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~10,9 GB; Q3_K_S ~12,6 GB; Q3_K_M ~13,7 GB; Q3_K_L ~14,2 GB; IQ4_XS ~14,6 GB; Q4_K_S ~16,0 GB; Q4_K_M ~17,3 GB; Q5_K_S ~18,6 GB; Q5_K_M ~19,7 GB; Q6_K ~23,3 GB; Q8_0 ~27,7 GB. Añadir margen para el contexto KV.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para cuantizaciones Q4 y Q5; A100 40 GB o H100 para Q6_K y Q8_0 sin offload.
- Cabe en GPU de consumo: sí, con cuantizaciones Q2_K a Q5_K_M en GPUs de 12-24 GB; Q6_K y Q8_0 requieren 24 GB o más, o bien offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y runners compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo servidor de inferencia.
- Latencia y throughput: no disponibles. Al ser un MoE con ~4B activos, el throughput por token debería ser superior al de un modelo denso de 26B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Radiant-Dawn-26B-A4B-GGUF | ~26B | ~4B | no disponible | no disponible | GGUF |
| Modelos MoE de ~30B con ~3-4B activos (p. ej., familia Qwen3-30B-A3B) | ~30B | ~3B | no disponible en esta ficha | variable | GGUF, safetensors |
| Modelos densos de ~27B (p. ej., Gemma 3 27B) | ~27B | denso | no disponible en esta ficha | variable | GGUF, safetensors |

La comparación cuantitativa de rendimiento no es posible porque no se han publicado benchmarks del modelo. Las alternativas citadas son referencias de categoría (MoE de ~30B con ~3-4B activos y densos de ~27B), no comparaciones verificadas con datos de este repositorio.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni las restricciones de redistribución; verificar la licencia del modelo base antes de usarlo en producción.
- Procedencia incierta: al ser un merge de mergekit sin documentación, se desconocen los modelos de origen, los datos de entrenamiento y los posibles sesgos heredados.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea limitado.
- Riesgo de alucinación: no hay evaluaciones publicadas que cuantifiquen la fiabilidad factual del modelo.
- Sin benchmarks: no se puede comparar objetivamente su calidad frente a alternativas; no apto para decisiones de producción sin evaluación propia.
- Contexto desconocido: la longitud máxima de contexto no está documentada, lo que dificulta planificar cargas KV y casos de uso con ventanas largas.
- Modelo cuantizado: las cuantizaciones Q2_K y Q3 reducen la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso general.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Radiant-Dawn-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Sorihon/Radiant-Dawn-26B-A4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Radiant-Dawn-26B-A4B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Radiant-Dawn-26B-A4B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
