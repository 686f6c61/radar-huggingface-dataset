# mradermacher/Impish_Bloodmoon_12B-GGUF

## Resumen

Impish_Bloodmoon_12B es un modelo de lenguaje conversacional de 12.247.802.880 parámetros (aproximadamente 12,25 mil millones) desarrollado por SicariusSicariiStuff. Esta ficha corresponde concretamente a la versión cuantizada en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones para la comunidad de inferencia local. El modelo base está entrenado sobre el dataset SicariusSicariiStuff/UBW_Tapestries y está orientado a generación de texto conversacional en inglés.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 12B en hardware de consumo mediante cuantizaciones que van desde 4,9 GB (Q2_K) hasta 13,1 GB (Q8_0). El repo ocupa 84,7 GB en total porque aloja todas las variantes de cuantización en un único espacio. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales, algo poco habitual en modelos derivados de fine-tuning comunitario.

No se dispone de información pública sobre la arquitectura interna, la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks del modelo base. Los datos disponibles se limitan a los metadatos de Hugging Face y a la model card de la cuantización, que es puramente operativa (lista de ficheros, tipos de quant y notas de uso).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin confirmar) |
| Parametros totales | 12.247.802.880 (12,25 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repo | 84,7 GB (todas las cuantizaciones) |
| Dataset de entrenamiento | SicariusSicariiStuff/UBW_Tapestries |
| Modelo base | SicariusSicariiStuff/Impish_Bloodmoon_12B |
| Cuantizador | mradermacher |
| Fecha de creacion | 2025-12-24 |
| Ultima actualizacion | 2026-11-13 |

## Arquitectura y entrenamiento

No hay información publicada en la documentación disponible sobre la arquitectura interna del modelo base Impish_Bloodmoon_12B. Por el tamaño (12,25 B de parámetros) y el ecosistema en el que se publica (transformers, GGUF, fine-tuning comunitario sobre un dataset propio), lo más probable es que se trate de un transformer decoder-only derivado de un modelo base de la familia Mistral-Nemo o similar, pero esto no está confirmado en la información proporcionada.

El único dato de entrenamiento disponible es el dataset SicariusSicariiStuff/UBW_Tapestries, que aparece referenciado en la model card. No se especifica el número de tokens, la composición del corpus, ni si se aplicaron técnicas de RLHF, DPO o SFT. Tampoco consta información sobre innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. La model card de la cuantización es puramente operativa y no incluye detalles técnicos del modelo original.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repo.
- Compatible con el pipeline de transformers y con el formato GGUF para llama.cpp y derivados.
- Etiqueta `endpoints_compatible`, lo que indica que puede servirse a través de endpoints de inferencia compatibles con la API de Hugging Face.
- Soporte multilingüe limitado al inglés según el campo `language: en`.
- No consta soporte explícito de tool calling, function calling, agentes, visión, audio ni modos de pensamiento extendido en la información disponible.
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Asistentes conversacionales en local: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo con GPU de consumo, usando la cuantización Q4_K_M (7,6 GB) para mantener un equilibrio entre calidad y velocidad en diálogos multi-turno en inglés.
- Prototipado rápido de chatbots: al estar disponible en GGUF y con licencia Apache 2.0, permite iterar sobre prompts y flujos conversacionales sin coste de API ni restricciones de uso comercial.
- Fine-tuning ligero sobre dominio propio: la cuantización Q8_0 (13,1 GB) puede servir como base para LoRA o QLoRA en tareas de adaptación al estilo o vocabulario de un cliente concreto.
- Evaluación comparativa de cuantizaciones: el repo incluye once variantes, lo que facilita medir la degradación de perplejidad entre Q2_K y Q8_0 sobre un mismo conjunto de validación.
- Inferencia en entornos con VRAM limitada: la variante Q2_K (4,9 GB) permite ejecutar el modelo en GPUs de 6-8 GB o incluso en CPU con RAM suficiente, a costa de una pérdida de calidad notable.
- Investigación sobre modelos derivados de la comunidad: útil para estudiar el efecto de datasets de fine-tuning alternativos (UBW_Tapestries) frente a modelos base comerciales en tareas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: 4,9 GB de pesos; ~6-7 GB de VRAM en total con contexto moderado.
  - Q3_K_M: 6,2 GB; ~7-8 GB de VRAM.
  - IQ4_XS: 6,9 GB; ~8-9 GB de VRAM.
  - Q4_K_M: 7,6 GB; ~9-10 GB de VRAM.
  - Q5_K_M: 8,8 GB; ~10-11 GB de VRAM.
  - Q6_K: 10,2 GB; ~12 GB de VRAM.
  - Q8_0: 13,1 GB; ~14-15 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, A100, H100. Las cuantizaciones Q4 y Q5 caben en GPUs de consumo de 12-16 GB; Q8_0 requiere 16 GB o más.
- Cabe en GPU de consumo: sí, desde Q2_K en 8 GB hasta Q8_0 en 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, llama-cpp-python, vLLM (con soporte GGUF), TGI (con conversión previa a safetensors). El repo también es compatible con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa para 12B en Q4_K_M, es habitual obtener entre 20 y 40 tokens/s en una RTX 4090, pero este dato no está confirmado para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Impish_Bloodmoon_12B (esta ficha) | 12,25 B | no disponible | Apache 2.0 | GGUF + safetensors | Fine-tuning comunitario sobre UBW_Tapestries |
| Mistral-Nemo-Base-2407 | 12 B | 128k | Apache 2.0 | safetensors + GGUF | Modelo base ampliamente usado por la comunidad; contexto largo documentado |
| Gemma-2-9B | 9,2 B | 8k | Gemma license | safetensors + GGUF | Licencia con restricciones de uso comercial |
| Qwen2.5-14B | 14,7 B | 32k (128k en variantes) | Apache 2.0 | safetensors + GGUF | Mayor tamaño, buen rendimiento multilingüe |

La comparación es aproximada: no se dispone de benchmarks del modelo Impish para contrastar rendimiento real frente a estas alternativas. La principal ventaja diferencial del modelo es su licencia Apache 2.0 combinada con la disponibilidad inmediata de cuantizaciones GGUF; su principal desventaja es la falta de documentación técnica y de evaluación pública.

## Limitaciones y advertencias

- Solo soporta inglés según los metadatos; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea bajo.
- No hay información sobre sesgos del modelo, dataset de entrenamiento ni proceso de alineación, por lo que el riesgo de respuestas sesgadas u ofensivas no puede evaluarse a priori.
- Riesgo de alucinación no cuantificado: al no haber benchmarks publicados, no se puede estimar la fiabilidad factual del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el autor del modelo base no documenta la procedencia de los datos de entrenamiento, lo que puede implicar riesgos legales no declarados.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- No consta soporte de tool calling ni de agentes; no debe asumirse que el modelo pueda ejecutar flujos multi-paso con herramientas externas.
- La longitud de contexto es desconocida; no se debe asumir ventanas largas sin verificarlo empíricamente.
- El repo ocupa 84,7 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero GGUF necesario.
- La fecha de actualización (2026-11-13) es posterior a la de creación (2025-12-24) y podría reflejar cambios en los ficheros; conviene verificar los hashes si se usa en producción.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/Impish_Bloodmoon_12B-GGUF
- Modelo base: https://huggingface.co/SicariusSicariiStuff/Impish_Bloodmoon_12B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Impish_Bloodmoon_12B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Impish_Bloodmoon_12B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/SicariusSicariiStuff/UBW_Tapestries
- Preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de referencia (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
