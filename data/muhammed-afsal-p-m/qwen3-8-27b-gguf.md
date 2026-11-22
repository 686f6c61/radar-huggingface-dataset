# muhammed-afsal-p-m/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es la colección de cuantizaciones GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario muhammed-afsal-p-m. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer multimodal de 27.320.697.856 parámetros (unos 27,3 mil millones) que acepta entradas de imagen y texto, incorpora modo de razonamiento (thinking), llamada a herramientas (tool calling) y está publicado bajo licencia Apache 2.0. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp, algo imposible con los pesos originales en BF16.

El interés de esta ficha reside en la cuantización: el autor no se limita a convertir pesos, sino que mide cada variante contra el modelo BF16 original con perplejidad y divergencia KL, y realiza pruebas funcionales de thinking, tool calling y visión en cada cuantización. Se ofrecen siete niveles de compresión, desde Q8_0 (29,1 GB) hasta IQ3_M (13,0 GB), lo que cubre desde GPU de 32 GB o más hasta tarjetas de 12 GB.

El modelo base apunta a cargas de trabajo que combinan razonamiento, código, matemáticas y comprensión de imágenes en un único modelo de tamaño medio, con un contexto que el autor no documenta explícitamente en la model card. La relevancia actual es doble: por un lado, la familia Qwen3.8 se posiciona como referencia open source en el segmento de 27B; por otro, la disponibilidad de GGUF con matriz de importancia (imatrix) permite desplegarlo en estaciones de trabajo sin GPU de datacenter.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); la model card menciona tensores `attn_qkv_gate` y `ssm_beta_alpha`, lo que sugiere componentes híbridos con atención y capas de tipo SSM, aunque el detalle no se especifica |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de despliegue usan `-c 16384` y las estimaciones de VRAM asumen ~8K tokens |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_M (además del proyector de visión mmproj en F16) |
| Idiomas soportados | no disponible (la calibración incluye datos multilingües de `CohereLabs/aya_dataset`, pero no se lista el conjunto de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión en GGUF F16 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de 27,3 mil millones de parámetros que procesa texto e imágenes (pipeline `image-text-to-text`). La model card de la cuantización no detalla la composición del dataset de preentrenamiento ni las fases de alineación (RLHF, DPO), por lo que esa información no está disponible en la documentación proporcionada. Los nombres de tensores que menciona el autor (`attn_qkv_gate`, `ssm_beta_alpha`) apuntan a una arquitectura híbrida que combina mecanismos de atención con capas de espacio de estados, pero no se ofrece la proporción ni la disposición exacta.

Lo que sí está documentado es el proceso de cuantización. El autor partió de los pesos originales en el commit `37561816e66b5b9153b1b64c10968c18c1e6f4a0`, verificados por SHA256, los convirtió a BF16 GGUF con llama.cpp build b12345 y exportó el proyector de visión en F16. La matriz de importancia se calculó sobre la cuantización Q8_0 con 163.541 tokens de calibración, mezclando seis fuentes: wikitext (32.012 tokens), ultrachat_200k (32.181), GSM8K (24.253), instrucciones de código Python (24.431), OpenCodeReasoning (33.040) y aya_dataset multilingüe (17.624). Todas las variantes salvo Q8_0 usan dicha imatrix, que se distribuye junto a los pesos. La evaluación se hizo sobre el split de test de wikitext-2 (150 fragmentos de 512 tokens) con divergencia KL frente a los logits BF16.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con OpenAI.
- Modo de razonamiento (thinking) activado por defecto con esfuerzo `xhigh`, ajustable a `medium` o `low`, y desactivable por petición mediante `chat_template_kwargs`.
- Comprensión de imágenes: entrada image-text-to-text mediante el proyector `mmproj-Qwen3.8-27B-F16.gguf`, verificado funcionalmente en las siete cuantizaciones.
- Llamada a herramientas (tool calling / function calling), probada en todas las variantes.
- Razonamiento multi-paso y matemáticas, reforzado por la calibración con GSM8K y OpenCodeReasoning.
- Generación de código, con datos de calibración específicos de instrucciones Python.
- Capacidades multilingües parciales: la imatrix incluye datos de aya_dataset, pero no se publica la lista de idiomas soportados.
- Compatibilidad con endpoints OpenAI (`endpoints_compatible` en los tags).

## Casos de uso

- Asistente de atención al cliente con contexto largo: el modelo mantiene conversaciones multi-turno y puede desplegarse con llama-server en una GPU de 24 GB usando Q4_K_M, con un contexto de 16K tokens configurable en el arranque.
- Automatización de soporte técnico con imágenes: al aceptar entradas de imagen, puede interpretar capturas de pantalla o fotos de errores y responder con pasos de resolución, cargando el proyector mmproj junto al modelo.
- Generación de código en pipelines de CI/CD: el soporte de tool calling permite integrarlo como agente que invoca linters, tests o APIs internas, con thinking desactivable para reducir latencia en tareas simples.
- Análisis de documentos con razonamiento: para tareas de extracción y verificación que requieren varios pasos, el modo thinking con esfuerzo `xhigh` mejora la calidad a costa de más tokens generados.
- Despliegue en estaciones de trabajo sin GPU de datacenter: la variante IQ4_XS (15,5 GB) o IQ3_M (13,0 GB) permite ejecutar el modelo en tarjetas de 16 GB o 12 GB respectivamente, con pérdida de calidad medida y acotada.
- Prototipado e investigación en local: la disponibilidad de siete niveles de cuantización con métricas de divergencia KL permite estudiar el impacto de la compresión en un modelo multimodal de 27B sin acceso a clúster.
- Asistentes de código con razonamiento matemático: la calibración con GSM8K y OpenCodeReasoning hace que el modelo sea adecuado para explicar y depurar algoritmos, aunque la calidad específica en matemáticas no se ha medido por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye métricas de fidelidad de la cuantización frente al BF16 original (perplejidad 6,4334) y velocidad de generación medida en una RTX 6000 Ada:

| Cuantización | Tamaño | Bits/peso | VRAM estimada | PPL | KLD media | Mismo token top | Tokens/s (RTX 6000 Ada) |
|---|---|---|---|---|---|---|---|
| Q8_0 | 29,1 GB | 8,50 | ~32 GB | 6,4399 | 0,0007 | 98,86 % | 27,7 |
| Q6_K | 22,4 GB | 6,57 | ~25 GB | 6,4312 | 0,0020 | 97,91 % | 35,5 |
| Q5_K_M | 19,6 GB | 5,75 | ~23 GB | 6,4544 | 0,0041 | 97,10 % | 39,6 |
| Q4_K_M | 17,0 GB | 4,98 | ~20 GB | 6,4644 | 0,0121 | 95,09 % | 43,7 |
| IQ4_XS | 15,5 GB | 4,55 | ~18 GB | 6,5045 | 0,0164 | 94,66 % | 46,9 |
| Q3_K_M | 13,7 GB | 4,01 | ~17 GB | 6,6493 | 0,0468 | 90,81 % | 48,6 |
| IQ3_M | 13,0 GB | 3,80 | ~16 GB | 6,7204 | 0,0563 | 90,33 % | 50,2 |

La incertidumbre de la perplejidad es de ±0,08, por lo que diferencias menores (por ejemplo, Q6_K frente a BF16) no son significativas. Las pruebas funcionales (thinking on/off, tool call, visión) pasaron en las siete variantes. El autor advierte que estas pruebas son smoke tests de una sola petición por función y que la calidad en código, matemáticas, otros idiomas, contexto largo e imágenes no se midió por separado.

## Requisitos de hardware

- VRAM estimada: desde ~16 GB (IQ3_M) hasta ~32 GB (Q8_0), incluyendo modelo, proyector de visión y ~8K tokens de contexto. Contextos más largos requieren más memoria.
- GPU recomendadas: RTX 6000 Ada para las mediciones publicadas; para Q8_0 se necesita una GPU de 32 GB o más (A100 40 GB, H100, RTX 6000 Ada); Q6_K y Q5_K_M encajan en 24–32 GB (RTX 3090, 4090, 5090); Q4_K_M en 20–24 GB; IQ4_XS y Q3_K_M en 16 GB; IQ3_M en 12 GB.
- Cabe en GPU de consumo: sí, desde una RTX 3060 de 12 GB con IQ3_M hasta una RTX 4090 con Q6_K o Q5_K_M.
- Opciones de despliegue: llama.cpp build b12345 o superior (llama-server probado con `-ngl 99 -c 16384 --jinja`); LM Studio y otras aplicaciones basadas en llama.cpp una vez actualizado su runtime. Ollama 0.40.16 y anteriores no pueden cargar estos ficheros por el layout combinado de tensores (`attn_qkv_gate`, `ssm_beta_alpha`); el autor sugiere usar `ollama run qwen3.8:27b` como alternativa.
- Throughput: entre 27,7 tok/s (Q8_0) y 50,2 tok/s (IQ3_M) en RTX 6000 Ada, medido con el proyector de visión cargado y temperatura 0. No se publican datos de latencia de primer token ni de throughput en otras GPU.

## Comparativa con modelos similares

La información disponible no incluye datos de rendimiento del modelo base frente a alternativas, por lo que la comparación se limita a características estructurales verificables.

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato GGUF disponible |
|---|---|---|---|---|---|
| Qwen3.8-27B (esta cuantización) | 27,3 B | no disponible | Sí (imagen + texto) | Apache 2.0 | Sí, 7 cuantizaciones con imatrix |
| Qwen/Qwen3.8-27B (original) | 27,3 B | no disponible | Sí (imagen + texto) | Apache 2.0 | No (BF16 safetensors) |
| Alternativas de ~27B open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (tamaño y modalidad) en la documentación proporcionada, ni de resultados de benchmarks que permitan una comparación de rendimiento.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; al ser un modelo entrenado con datos web a gran escala, es probable que herede sesgos sociales, pero no hay evaluación publicada en la información disponible.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasa de alucinación para el modelo base ni para las cuantizaciones.
- Las métricas de calidad de la cuantización se midieron únicamente sobre texto de Wikipedia en inglés a 512 tokens de contexto; no cubren código, matemáticas, otros idiomas, contexto largo ni calidad de imagen.
- Las pruebas funcionales son smoke tests de un solo prompt por característica; confirman que la función opera, no su calidad.
- Compatibilidad restringida: requiere llama.cpp build b12345 o superior; Ollama 0.40.16 y anteriores fallan al cargar los tensores con layout combinado.
- El contexto máximo no se especifica en la model card; los ejemplos usan 16K tokens y las estimaciones de VRAM asumen ~8K, por lo que contextos mayores exigen verificación empírica y más memoria.
- La lista de idiomas soportados no está disponible, lo que dificulta planificar despliegues multilingües.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar los avisos de copyright y verificar las obligaciones de atribución al redistribuir.
- La cuantización IQ3_M y Q3_K_M muestran una divergencia KL notablemente mayor (0,0563 y 0,0468) y una coincidencia de token top por debajo del 91 %, lo que puede degradar tareas sensibles a la precisión.
- El repositorio ocupa 131,3 GB, por lo que la descarga completa requiere espacio en disco considerable; conviene bajar solo la variante necesaria y verificar los checksums de `SHA256SUMS.txt`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muhammed-afsal-p-m/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Código del pipeline de cuantización: https://github.com/muhammedafsalpm/qwen3.8-27b-gguf-quantization
- Checksums: https://huggingface.co/muhammed-afsal-p-m/Qwen3.8-27B-GGUF/blob/main/SHA256SUMS.txt
- Matriz de importancia: https://huggingface.co/muhammed-afsal-p-m/Qwen3.8-27B-GGUF/blob/main/Qwen3.8-27B.imatrix.gguf
- Proyector de visión: https://huggingface.co/muhammed-afsal-p-m/Qwen3.8-27B-GGUF/blob/main/mmproj-Qwen3.8-27B-F16.gguf
