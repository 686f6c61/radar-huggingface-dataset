# mradermacher/Tatties-350M-Base-GGUF

## Resumen

Tatties-350M-Base-GGUF es la versión cuantizada en formato GGUF del modelo pdjamez/Tatties-350M-Base, publicada por mradermacher, un conocido creador de cuantizaciones para llama.cpp. Se trata de un modelo de lenguaje causal de tipo base, con 350.439.552 parámetros (aproximadamente 350 M), etiquetado con la arquitectura llama, entrenado sobre el dataset HuggingFaceFW/fineweb-edu y limitado al idioma inglés. Su licencia es Apache-2.0.

El repositorio no aporta un modelo nuevo, sino un conjunto de 12 cuantizaciones estáticas que van desde Q2_K (0,3 GB) hasta f16 (0,8 GB), pensadas para ejecutar el modelo en CPU, GPU de gama baja y dispositivos con recursos limitados. Al ser un modelo base, no está ajustado para instrucciones ni para diálogo: su función principal es la predicción del siguiente token y sirve como punto de partida para fine-tuning o para experimentación.

Su relevancia es práctica: permite probar un modelo de 350 M en entornos sin GPU dedicada, comparar el efecto de distintas cuantizaciones y disponer de una base Apache-2.0 para tareas en inglés. La información publicada es escasa (sin contexto, tokenizador ni benchmarks), y su adopción es muy limitada: 95 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | llama (según etiquetas del repo); modelo causal decoder-only de tipo base |
| Parámetros totales | 350.439.552 (≈350 M) |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo original |

## Arquitectura y entrenamiento

La información disponible indica que el modelo original es un transformer causal de tipo decoder-only, etiquetado como llama, con 350.439.552 parámetros y sin indicios de mezcla de expertos. No se documentan el número de capas, dimensiones ocultas, número de cabezas de atención, tamaño de vocabulario ni longitud de contexto. El entrenamiento se realizó sobre HuggingFaceFW/fineweb-edu, un corpus educativo en inglés, pero no se especifican el número de tokens, la composición exacta del dataset, la tokenizadora utilizada ni si hubo fases de ajuste fino supervisado, RLHF o DPO. Al tratarse de un modelo base, lo esperable es que no haya pasado por alineamiento conversacional.

La aportación técnica de este repositorio es la cuantización. mradermacher ha generado cuantizaciones estáticas con llama.cpp (quantize_version 2, convert_type hf), sin versiones ponderadas ni con imatrix en el momento de la publicación. Se ofrecen desde Q2_K hasta f16, lo que permite ajustar el equilibrio entre tamaño, velocidad y calidad. Las cuantizaciones IQ4_XS y Q4_K_M son las opciones intermedias más habituales; Q2_K y Q3_K_S son las más agresivas y las que más degradan la calidad. No se documenta ninguna innovación adicional en atención, decodificación especulativa ni arquitectura híbrida.

## Capacidades

- Generación de texto en inglés mediante predicción del siguiente token, propia de un modelo causal base.
- Capacidad de completar texto, continuar documentos y generar secuencias condicionadas por un prompt.
- No incluye ajuste por instrucciones ni plantilla de chat documentada; no cabe esperar un comportamiento conversacional fiable sin fine-tuning.
- No se documenta soporte nativo de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modos de pensamiento (thinking mode).
- No se documenta visión, audio ni otras modalidades.
- Multilingüismo no disponible: la model card declara únicamente inglés.
- Permite fine-tuning posterior gracias a la licencia Apache-2.0 y a la disponibilidad de los pesos originales en safetensors.
- El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de Hugging Face, y la etiqueta `mlx`, aunque la model card solo documenta archivos GGUF.

## Casos de uso

- Prototipado local sin GPU: descargar Q4_K_M (0,4 GB) y ejecutarlo con llama.cpp u Ollama para completar texto en inglés, lo que permite iterar en el diseño de prompts sin coste de API ni dependencia de la nube.
- Fine-tuning para clasificación de textos en inglés: al ser un modelo base Apache-2.0, se puede añadir una cabeza de clasificación y ajustarlo para análisis de sentimiento, tematización o moderación; sus 350 M reducen el coste de entrenamiento frente a modelos mayores.
- Autocompletado en herramientas de escritura: integrado mediante llama-cpp-python en un editor, puede sugerir continuaciones de borradores en inglés con latencia baja en CPU; requiere revisión humana por el riesgo de alucinación.
- Modelo borrador para decodificación especulativa: si el tokenizador es compatible con algún modelo mayor de la familia Llama, podría emplearse como draft model para acelerar la inferencia; la compatibilidad no está confirmada en la información disponible y debe verificarse experimentalmente.
- Investigación sobre cuantización: el repositorio ofrece 12 variantes del mismo modelo, lo que facilita comparar perplejidad, coherencia y velocidad entre Q2_K, Q4_K_M, Q8_0 y f16 sobre un mismo conjunto de prompts.
- Despliegue en dispositivos con recursos muy limitados: las variantes Q3 y Q4 ocupan menos de 0,5 GB en disco, por lo que pueden ejecutarse en una Raspberry Pi o en un mini-PC para demos offline de generación de texto en inglés.
- Generación de datos sintéticos tras un ajuste previo: una vez fine-tuneado para una tarea concreta, puede producir borradores o ejemplos etiquetados que luego se filtren y se usen para entrenar clasificadores más pequeños.
- Evaluación de robustez y seguridad de modelos pequeños: útil como línea base en estudios sobre sesgos, toxicidad o fidelidad factual en modelos de menos de 1 B de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (orientativa, sin KV cache): Q2_K y Q3_K_S en torno a 0,5 GB; Q4_K_M en torno a 0,6 GB; Q8_0 en torno a 0,7 GB; f16 en torno a 1,0 GB. El tamaño del KV cache no se puede calcular sin conocer la longitud de contexto y la configuración de atención, datos no publicados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 o superiores. También funciona en Apple Silicon mediante Metal y en GPUs integradas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU; también en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y llama-cpp-python para los archivos GGUF; la versión original en safetensors puede cargarse con transformers. El soporte de GGUF en vLLM es limitado y no se documenta para este modelo; TGI no está orientado a GGUF.
- Latencia y throughput: no se publican cifras oficiales. Por el tamaño del modelo, es razonable esperar inferencia en tiempo real en CPU moderna y aún más rápida en GPU, pero no hay mediciones disponibles que lo confirmen.
- Almacenamiento: el repo completo ocupa 3,5 GB, aunque basta con descargar un único archivo de cuantización de entre 0,3 y 0,8 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tatties-350M-Base-GGUF (este repo) | 350,4 M | no disponible | Apache-2.0 | GGUF | 12 cuantizaciones estáticas; solo inglés; sin benchmarks |
| Tatties-350M-Base (original) | 350,4 M | no disponible | Apache-2.0 | safetensors | Pesos sin cuantizar; del que deriva este repositorio |
| LFM2.5-350M-Base (LiquidAI, referencia de terceros) | 350 M | 125K según listado de terceros | no disponible en la información consultada | no disponible | Arquitectura híbrida orientada a dispositivo; datos de contexto y VRAM (0,7 GB) provenientes de un listado externo, no verificados en la model card |

No se dispone de datos suficientes para comparar rendimiento, calidad o benchmarks con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones de forma fiable, no tiene plantilla de chat documentada y puede producir continuaciones incoherentes o fuera de tono.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar afirmaciones falsas con apariencia plausible; el riesgo aumenta en las cuantizaciones más agresivas (Q2_K, Q3_K_S).
- Solo inglés: no hay evidencia de competencia multilingüe; el uso en castellano no está soportado ni evaluado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin determinar experimentalmente el límite real.
- Ausencia de benchmarks: no hay métricas publicadas de MMLU, HumanEval, GSM8K ni de perplejidad, por lo que la calidad real del modelo y de cada cuantización es incierta.
- Capacidad limitada por tamaño: 350 M de parámetros restringen el razonamiento complejo, las matemáticas y la generación de código; no es adecuado como sustituto de modelos de varios miles de millones de parámetros.
- Sin soporte nativo de tool calling ni agentes: cualquier uso en ese sentido exige fine-tuning y evaluación adicional.
- Cuantizaciones estáticas sin imatrix: no hay versiones ponderadas disponibles; las variantes Q2 y Q3 pueden degradar notablemente la calidad frente a Q4_K_M o Q8_0.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se ofrece sin garantías; la procedencia de los datos de entrenamiento (FineWeb-Edu) debe evaluarse por separado, ya que no se detalla en la información disponible.
- Adopción muy limitada: 95 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.
- Tokenizador no documentado: la compatibilidad con otras herramientas o modelos de la familia Llama debe comprobarse antes de reutilizar prompts o técnicas de decodificación especulativa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tatties-350M-Base-GGUF
- Modelo original: https://huggingface.co/pdjamez/Tatties-350M-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Página de descargas del cuantizador: https://hf.tst.eu/model#Tatties-350M-Base-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Guía de uso de archivos GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
- Referencia de terceros para modelo comparable LFM2.5-350M-Base: https://inferix.co/models/LiquidAI/LFM2.5-350M-Base
- Ficha de terceros con datos de VRAM y contexto de LFM2.5-350M-Base: https://llm-explorer.com/model/LiquidAI%2FLFM2.5-350M-Base,5gdcZZPqykz2WhVE8lA6D7
