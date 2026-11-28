# mradermacher/Llama-3.3-70B-Instruct-apostate-GGUF

## Resumen

`mradermacher/Llama-3.3-70B-Instruct-apostate-GGUF` es una cuantización estática en formato GGUF del modelo `c4tdr0ut/Llama-3.3-70B-Instruct-apostate`, un fine-tune no oficial de Llama 3.3 70B Instruct. El autor de la cuantización es mradermacher, un conocido publicador de cuantizaciones GGUF para la comunidad de inferencia local (llama.cpp, Ollama, LM Studio, etc.). El modelo base subyacente es la arquitectura Llama 3.3 de Meta con 70.553.706.560 parámetros (aproximadamente 70,6 mil millones).

El interés de este repositorio es doble. Por un lado, permite ejecutar un modelo de 70B en hardware de consumo mediante cuantizaciones que van desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB). Por otro, el sufijo "apostate" indica que se trata de un fine-tune con un propósito específico definido por el autor original (`c4tdr0ut`), del cual la model card no ofrece detalles: no se documenta el dataset de ajuste, el objetivo del entrenamiento ni los cambios respecto a Llama 3.3 Instruct canónico.

La relevancia práctica es la habitual de las cuantizaciones GGUF de modelos grandes: reducir la barrera de VRAM para desplegar un 70B con calidad cercana al original en GPUs de 24-48 GB (o incluso en configuraciones con offloading a RAM/CPU). No obstante, al carecer de documentación sobre el fine-tune y sobre la licencia, su uso en producción requiere verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.3, segun modelo base) |
| Parametros totales | 70.553.706.560 (aprox. 70,6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.3 Instruct soporta 128K, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en el repo `-i1-GGUF` |
| Idiomas soportados | en (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (multiples ficheros por cuantizacion) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Llama 3.3 70B Instruct de Meta: un transformer decoder-only denso con atención por grupos (GQA) y RoPE, afinado con instrucciones. Sobre esa base, el autor `c4tdr0ut` publicó un fine-tune denominado "apostate", del que no se documenta ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se empleó RLHF, DPO o SFT. Tampoco se especifica qué comportamiento o dominio persigue el ajuste.

La contribución de este repositorio es exclusivamente la cuantización. Según los metadatos internos de la model card, se aplicó `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversión desde pesos Hugging Face a GGUF seguida de cuantización estática (no imatrix). El autor indica que las cuantizaciones ponderadas con imatrix están disponibles en un repositorio separado (`mradermacher/Llama-3.3-70B-Instruct-apostate-i1-GGUF`), que suele ofrecer mejor calidad por bit que las estáticas equivalentes.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama 3.3 Instruct.
- Razonamiento de propósito general y respuesta a instrucciones, sujeto a las modificaciones introducidas por el fine-tune "apostate" (no documentadas).
- Generación de código y matemáticas: capacidades típicas del modelo base, no verificadas específicamente en este fine-tune.
- Soporte de tool calling / function calling: no documentado en esta ficha; el modelo base Llama 3.3 Instruct lo soporta, pero no se confirma que el fine-tune lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: la model card declara únicamente `en`; no se garantiza un rendimiento sólido en castellano u otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Inferencia local de un 70B en estaciones de trabajo: con la cuantización Q4_K_M (42,6 GB) es posible ejecutar el modelo en una GPU de 48 GB (A6000, L40S) o en configuraciones multi-GPU, manteniendo una calidad próxima al modelo en fp16.
- Despliegue en GPUs de consumo con offloading: las variantes Q2_K (26,5 GB) y Q3_K_S (31,0 GB) permiten ejecutar el modelo en una RTX 4090 (24 GB) combinando VRAM y RAM del sistema, a costa de menor velocidad y calidad.
- Experimentación con fine-tunes de la comunidad: útil para investigadores que quieran evaluar el efecto del ajuste "apostate" frente a Llama 3.3 Instruct canónico sin necesidad de descargar los pesos completos en fp16 (481,3 GB de repo frente a 26-75 GB por cuantización).
- Servicio de chat en inglés con llama.cpp u Ollama: el formato GGUF es directamente compatible con estos runtimes, lo que simplifica el despliegue en entornos sin stack de PyTorch.
- Prototipado de pipelines de generación de texto en inglés: para tareas de resumen, redacción o extracción de información donde se requiera un modelo grande y el idioma de trabajo sea el inglés.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantización, lo que permite medir el impacto de la compresión en perplejidad y calidad de salida sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño del fichero GGUF; se requiere margen adicional para el contexto KV cache):
  - Q2_K: 26,5 GB
  - Q3_K_S: 31,0 GB
  - Q3_K_M: 34,4 GB
  - Q3_K_L: 37,2 GB
  - IQ4_XS: 38,4 GB
  - Q4_K_S: 40,4 GB
  - Q4_K_M: 42,6 GB
  - Q5_K_S: 48,8 GB
  - Q5_K_M: 50,0 GB
  - Q6_K: 58,0 GB
  - Q8_0: 75,1 GB
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para cuantizaciones Q4-Q5; configuraciones multi-GPU para Q6_K y Q8_0.
- GPU de consumo: una RTX 4090 (24 GB) no puede alojar ninguna variante completa en VRAM; es necesario offloading parcial a RAM del sistema (mínimo 32-64 GB de RAM para Q2_K/Q3_K).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no son la vía natural para este formato (aunque vLLM soporta GGUF de forma experimental).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del grado de offloading.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Llama-3.3-70B-Instruct-apostate-GGUF | 70,6B | no disponible | GGUF | no disponible | Fine-tune "apostate" sin documentar |
| Llama-3.3-70B-Instruct (Meta) | 70,6B | 128K (segun modelo base) | safetensors, GGUF (comunidad) | Llama 3.3 Community License | Modelo oficial, ampliamente documentado |
| mradermacher/Llama-3.3-70B-Instruct-i1-GGUF | 70,6B | igual al base | GGUF (imatrix) | segun modelo base | Cuantizaciones imatrix del Llama 3.3 oficial, mejor calidad por bit |
| Qwen2.5-72B-Instruct (GGUF) | 72,7B | 128K | safetensors, GGUF | Apache 2.0 (segun version) | Alternativa de tamaño similar con licencia mas permisiva |

## Limitaciones y advertencias

- La model card no documenta el propósito ni el dataset del fine-tune "apostate"; no es posible saber qué comportamientos se han modificado respecto a Llama 3.3 Instruct ni si se han introducido sesgos o alineaciones adicionales.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Al derivar de Llama 3.3, es probable que herede la Llama 3.3 Community License, pero debe verificarse en el repositorio del modelo base.
- Idioma: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos de 70B, no evaluado en este fine-tune.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad.
- El repositorio ocupa 481,3 GB en total; descargar todas las variantes no es práctico. Conviene descargar solo la cuantización necesaria.
- Algunas cuantizaciones pueden estar divididas en varios ficheros; es necesario concatenarlas o usar herramientas compatibles (llama.cpp lo gestiona automáticamente).
- No se han publicado benchmarks ni evaluaciones de seguridad específicas para este fine-tune.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-3.3-70B-Instruct-apostate-GGUF
- Modelo base del fine-tune: https://huggingface.co/c4tdr0ut/Llama-3.3-70B-Instruct-apostate
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Llama-3.3-70B-Instruct-apostate-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Llama-3.3-70B-Instruct-apostate-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
