# muhammed-afsal-p-m/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una colección de cuantizaciones GGUF del modelo Qwen3.8-27B, publicado por el usuario muhammed-afsal-p-m. El modelo original lo desarrolla el equipo Qwen (Alibaba) y esta variante tiene como objetivo facilitar su despliegue en hardware de consumo mediante llama.cpp, Ollama y LM Studio. La relevancia de esta ficha radica en que documenta con rigor el proceso de cuantización: cada fichero se ha medido frente al modelo BF16 original con perplejidad y divergencia KL, y se ha probado funcionalmente (thinking on/off, tool calling, vision).

El modelo base es un transformer multimodal de 27.320.697.856 parámetros (unos 27,3 mil millones) con capacidades de texto e imagen (pipeline image-text-to-text), modo thinking con niveles de esfuerzo de razonamiento (`xhigh`, `medium`, `low`) y tool calling. La colección incluye siete cuantizaciones (desde Q8_0 hasta IQ3_M) más un proyector de visión F16 independiente, con tamaños que van de 29,1 GB a 13,0 GB.

El repositorio ocupa 131,3 GB y la licencia es Apache 2.0, la misma que el modelo original. Esta ficha se centra en la variante cuantizada; los datos de arquitectura y entrenamiento del modelo base no están detallados en la información disponible y se indican como tales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); multimodal image-text-to-text |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (los ejemplos de ejecución usan `-c 16384`) |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_M; proyector de visión F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con `mmproj` F16 para visión); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27,3 mil millones de parámetros con entrada de imagen y texto (pipeline `image-text-to-text`), modo thinking con niveles de esfuerzo configurables y soporte de tool calling. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO; estos datos deben consultarse en la model card original de Qwen/Qwen3.8-27B.

La innovación técnica destacable de esta variante es el proceso de cuantización con importance matrix (imatrix). Los pesos originales se convirtieron a BF16 GGUF con llama.cpp `b12345` y el proyector de visión se exportó en F16. La imatrix se calculó sobre la cuantización Q8_0 usando 163.541 tokens de calibración renderizados con la plantilla de chat del propio modelo (incluyendo trazas `<think>`), con la siguiente composición: wikitext (32.012 tokens), ultrachat_200k (32.181), gsm8k (24.253), python_code_instructions_18k_alpaca (24.431), OpenCodeReasoning (33.040) y aya_dataset (17.624). Todas las cuantizaciones salvo Q8_0 usan la imatrix, que se distribuye como fichero independiente. La evaluación se realizó sobre el split de test held-out de wikitext-2 (150 fragmentos de 512 tokens) con divergencia KL frente a los logits BF16.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto (esfuerzo `xhigh`), configurable por petición mediante `chat_template_kwargs`.
- Entrada de imagen (vision) mediante el proyector `mmproj-Qwen3.8-27B-F16.gguf`, compatible con todas las cuantizaciones.
- Tool calling / function calling, verificado funcionalmente en todas las cuantizaciones.
- Modo thinking desactivable por petición (`enable_thinking: false`) y ajuste de esfuerzo (`xhigh`, `medium`, `low`).
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints OpenAI (`endpoints_compatible`).
- Capacidades multilingües: no disponibles en la información proporcionada (la calibración incluyó el dataset aya, pero no se documentan los idiomas soportados).

## Casos de uso

- Despliegue local en estación de trabajo con GPU de 24 GB: usar Q4_K_M o Q5_K_M con llama-server u Ollama para disponer de un asistente conversacional con visión y tool calling sin depender de la nube.
- Análisis de documentos e imágenes en local: cargar el proyector F16 junto con cualquier cuantización para tareas image-text-to-text (descripción de capturas, extracción de información de figuras) manteniendo los datos en la máquina.
- Razonamiento con control de coste: alternar `reasoning_effort` entre `low`, `medium` y `xhigh` según la complejidad de la consulta, reduciendo latencia y tokens generados en tareas simples.
- Automatización con agentes: el soporte verificado de tool calling permite integrar el modelo en pipelines que invocan APIs o funciones externas mediante una API compatible con OpenAI.
- Prototipado en GPU de 12-16 GB: IQ3_M (13,0 GB) o IQ4_XS (15,5 GB) permiten ejecutar el modelo en tarjetas de gama media, útil para pruebas de concepto y evaluación de calidad antes de escalar.
- Evaluación comparativa de cuantizaciones: los datos de PPL y KLD publicados permiten elegir el compromiso calidad/tamaño adecuado para un caso concreto sin repetir la medición.
- Integración en LM Studio u Ollama para entornos de desarrollo sin configuración manual de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publican métricas de fidelidad de cuantización frente al BF16 original (perplejidad 6,4334) y velocidad de generación medida en RTX 6000 Ada:

| Cuantización | Tamaño | Bits/peso | VRAM aprox. | PPL | KLD medio | Mismo top token | Tok/s (RTX 6000 Ada) |
|---|---|---|---|---|---|---|---|
| Q8_0 | 29,1 GB | 8,50 | ~32 GB | 6,4399 | 0,0007 | 98,86 % | 27,7 |
| Q6_K | 22,4 GB | 6,57 | ~25 GB | 6,4312 | 0,0020 | 97,91 % | 35,5 |
| Q5_K_M | 19,6 GB | 5,75 | ~23 GB | 6,4544 | 0,0041 | 97,10 % | 39,6 |
| Q4_K_M | 17,0 GB | 4,98 | ~20 GB | 6,4644 | 0,0121 | 95,09 % | 43,7 |
| IQ4_XS | 15,5 GB | 4,55 | ~18 GB | 6,5045 | 0,0164 | 94,66 % | 46,9 |
| Q3_K_M | 13,7 GB | 4,01 | ~17 GB | 6,6493 | 0,0468 | 90,81 % | 48,6 |
| IQ3_M | 13,0 GB | 3,80 | ~16 GB | 6,7204 | 0,0563 | 90,33 % | 50,2 |

La incertidumbre de la medición de PPL es de aproximadamente ±0,08, por lo que diferencias menores (por ejemplo, Q6_K frente a BF16) no son significativas. Las pruebas funcionales (thinking on/off, tool call, vision) pasaron en todas las cuantizaciones.

## Requisitos de hardware

- VRAM estimada: de ~16 GB (IQ3_M) a ~32 GB (Q8_0), incluyendo modelo, proyector de visión y ~8K de contexto. Contextos más largos requieren más VRAM.
- GPU recomendadas por cuantización: 32 GB+ para Q8_0; 24-32 GB (RTX 3090/4090/5090) para Q6_K o Q5_K_M; 20-24 GB para Q4_K_M; 16 GB para IQ4_XS o Q3_K_M; 12 GB para IQ3_M.
- Cabe en GPU de consumo: sí, desde IQ3_M en 12 GB hasta Q5_K_M en 24 GB.
- Opciones de despliegue: llama.cpp (`llama-server` con `--mmproj` para visión), Ollama (`ollama run hf.co/muhammed-afsal-p-m/Qwen3.8-27B-GGUF:Q4_K_M`), LM Studio, y cualquier API compatible con OpenAI.
- Throughput medido: 27,7 tok/s (Q8_0) a 50,2 tok/s (IQ3_M) en RTX 6000 Ada. La latencia no se documenta.
- El proyector de visión (`mmproj-Qwen3.8-27B-F16.gguf`, 0,9 GB) es adicional y compatible con todas las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de modelos comparables en la información proporcionada, por lo que no es posible una comparación de rendimiento fiable. A modo de referencia estructural:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.8-27B (GGUF, esta ficha) | 27,3 B | no disponible | Apache 2.0 | GGUF |
| Qwen3.8-27B (original) | 27,3 B | no disponible | Apache 2.0 | safetensors |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los datos de benchmarks estándar del modelo base no están disponibles en esta ficha; no se debe asumir un rendimiento concreto sin consultar la model card original.
- La pérdida de calidad crece con la agresividad de la cuantización: IQ3_M presenta KLD 0,0563 y solo un 90,33 % de coincidencia en el token top, frente a 0,0007 y 98,86 % en Q8_0.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones específicas de factualidad.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; la calibración incluyó datos multilingües pero no se especifican las lenguas cubiertas.
- Longitud de contexto máxima: no disponible; los ejemplos de ejecución usan 16K y la estimación de VRAM asume ~8K.
- Licencia Apache 2.0, permisiva para uso comercial, siempre que se respeten las condiciones de atribución de la licencia.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; es una cuantización de terceros, no oficial del equipo Qwen.
- Verificar los checksums (`SHA256SUMS.txt`) antes de usar los pesos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/muhammed-afsal-p-m/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Código del pipeline de cuantización: https://github.com/muhammedafsalpm/qwen3.8-27b-gguf-quantization
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.
