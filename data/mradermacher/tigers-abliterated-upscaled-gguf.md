# mradermacher/Tigers-Abliterated-Upscaled-GGUF

## Resumen

Tigers-Abliterated-Upscaled-GGUF es una recopilación de cuantizaciones GGUF estáticas del modelo mergekit-community/Tigers-Abliterated-Upscaled, publicada por mradermacher, un conocido creador de cuantizaciones de la comunidad de Hugging Face. El modelo subyacente es un merge (fusión) de modelos realizado con mergekit, una herramienta que combina los pesos de varios modelos preentrenados para obtener capacidades híbridas. El repositorio no contiene el modelo original, sino las versiones comprimidas listas para su uso con llama.cpp y herramientas compatibles.

El modelo cuenta con 15.583.952.384 parámetros totales (aproximadamente 15,6 mil millones) según los datos de safetensors del modelo base, lo que lo sitúa en la gama de modelos de tamaño medio-grande. Está etiquetado únicamente para inglés (en) y su pipeline no está especificado. La licencia no está declarada en la información disponible, lo que constituye un punto crítico para cualquier uso comercial.

La relevancia de esta ficha radica en que documenta un artefacto de cuantización de un merge de la comunidad, un tipo de modelo que suele carecer de documentación técnica detallada. El repositorio ocupa 108,1 GB e incluye diez variantes de cuantización que van desde Q2_K (6,2 GB) hasta Q8_0 (16,7 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo hasta servidores con múltiples aceleradores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base generado con mergekit; no se especifica la arquitectura subyacente) |
| Parametros totales | 15.583.952.384 (15,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, mergekit-community/Tigers-Abliterated-Upscaled, es el resultado de un proceso de fusión de modelos mediante mergekit, una herramienta que combina los tensores de pesos de dos o más modelos preentrenados. La información disponible no especifica qué modelos se fusionaron, qué método de merge se empleó (por ejemplo, SLERP, TIES, DARE o linear) ni los hiperparámetros utilizados. Tampoco se detalla la arquitectura interna del transformer resultante, más allá de que se trata de un modelo de 15,6 mil millones de parámetros.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste fino con RLHF o DPO. El nombre "Abliterated" sugiere que el merge incorpora alguna técnica de eliminación o atenuación de comportamientos (posiblemente de rechazo o censura), pero no se aporta documentación técnica al respecto. "Upscaled" podría indicar un aumento de tamaño o de resolución de capacidades, pero igualmente carece de especificación. Las cuantizaciones publicadas son estáticas (no imatrix), y el autor indica que las versiones ponderadas con imatrix no están disponibles por el momento.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Compatible con endpoints (etiqueta "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Al estar basado en un merge de modelos, se espera que herede capacidades combinadas de sus componentes, aunque no se detallan cuáles.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan capacidades especiales como modo thinking, visión o audio.
- No se dispone de información sobre razonamiento matemático o generación de código específica.

## Casos de uso

- Despliegue en local con llama.cpp: las cuantizaciones Q4_K_M (9,7 GB) y Q5_K_M (11,2 GB) permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo, ideal para experimentación y prototipado sin depender de la nube.
- Generación de texto conversacional en inglés: el modelo puede emplearse para construir asistentes de chat en inglés, aprovechando su etiqueta conversational y su tamaño de 15,6 B para respuestas coherentes en contextos de diálogo.
- Evaluación de merges de la comunidad: investigadores que estudian el efecto de las fusiones de modelos pueden usar estas cuantizaciones para comparar el comportamiento del merge frente a los modelos originales con un coste de hardware reducido.
- Inferencia en servidores con una sola GPU: la variante Q8_0 (16,7 GB) cabe en GPUs con 24 GB de VRAM, como la RTX 4090 o la A10G, lo que permite servir el modelo con la máxima calidad de cuantización disponible.
- Pruebas de calidad y perplejidad: las distintas variantes (desde Q2_K hasta Q8_0) permiten medir el impacto de la cuantización en la calidad de salida, útil para calibrar políticas de despliegue.
- Integración en pipelines de transformers: aunque el repositorio es GGUF, el modelo base es compatible con la librería transformers, por lo que se puede usar como referencia para tareas de generación de texto en inglés dentro de flujos existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del archivo GGUF):
  - Q2_K: ~6,2 GB
  - Q3_K_S: ~7,2 GB
  - Q3_K_M: ~7,9 GB
  - Q3_K_L: ~8,6 GB
  - IQ4_XS: ~8,7 GB
  - Q4_K_S: ~9,2 GB
  - Q4_K_M: ~9,7 GB
  - Q5_K_S: ~10,9 GB
  - Q5_K_M: ~11,2 GB
  - Q6_K: ~12,9 GB
  - Q8_0: ~16,7 GB
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 3090 o RTX 4090 (24 GB) es suficiente; para Q8_0, se recomienda una GPU con al menos 20 GB de VRAM efectiva (RTX 4090, A10G, L4 con 24 GB). Para despliegues en servidor, A100 40 GB o H100 permiten ejecutar la variante Q8_0 con margen para el contexto.
- ¿Cabe en GPU de consumo? Sí: las variantes Q2_K a Q5_K_M caben en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070, etc.), y Q6_K y Q8_0 requieren 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama (a través de GGUF), y servidores compatibles con GGUF como llama-cpp-python. El modelo base en safetensors puede servirse con vLLM o TGI, pero las cuantizaciones publicadas aquí están pensadas para el ecosistema GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Tigers-Abliterated-Upscaled-GGUF | 15,6 B | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Modelos de ~15 B de la comunidad (p. ej., merges de Mistral/LLaMA) | ~13-16 B | variable (4K-32K típicamente) | variable según componentes | safetensors, GGUF | Hugging Face |
| Modelos base de 13-14 B (p. ej., Qwen, Llama) | 13-14 B | 4K-128K según versión | variable | safetensors, GGUF | Hugging Face |

No se dispone de datos de rendimiento comparativo para este modelo concreto, por lo que la comparativa se limita a parámetros, formato y disponibilidad. La ausencia de licencia declarada y de benchmarks impide una comparación rigurosa con alternativas consolidadas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; se recomienda contactar con el autor o consultar el modelo base antes de cualquier despliegue en producción.
- Modelo únicamente en inglés: no se ha documentado soporte para otros idiomas, por lo que su uso en castellano u otras lenguas no está garantizado.
- Origen como merge de la comunidad: al no documentarse los modelos fusionados ni el método de merge, el comportamiento puede ser impredecible y heredar sesgos o limitaciones de componentes desconocidos.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se han publicado evaluaciones de fidelidad.
- Cuantizaciones estáticas: el autor indica que no hay versiones imatrix, lo que puede suponer una pérdida de calidad mayor en las cuantizaciones bajas (Q2_K, Q3_K) en comparación con cuantizaciones ponderadas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K), lo que dificulta evaluar su idoneidad frente a alternativas.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que limita el diseño de aplicaciones que requieran ventanas largas.
- Repositorio de 108,1 GB: requiere espacio de almacenamiento considerable si se descargan todas las variantes; se recomienda seleccionar solo la cuantización necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Tigers-Abliterated-Upscaled-GGUF
- Modelo base: https://huggingface.co/mergekit-community/Tigers-Abliterated-Upscaled
- Página de conveniencia del autor: https://hf.tst.eu/model#Tigers-Abliterated-Upscaled-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
