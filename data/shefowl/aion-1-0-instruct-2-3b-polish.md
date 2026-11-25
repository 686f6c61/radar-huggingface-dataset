# shefowl/Aion-1.0-Instruct-2.3B-Polish

## Resumen

Aion-1.0-Instruct-2.3B-Polish es una adaptación lingüística del modelo Microsoft Aion-1.0-Instruct-2.3B, desarrollada por el autor independiente shefowl. El modelo base de Microsoft no soporta oficialmente el polaco: lo comprende, pero lo escribe con numerosos errores gramaticales y de fluidez. Este proyecto aborda ese problema mediante un proceso en tres fases: preentrenamiento continuado (CPT) con 190 millones de tokens en polaco, ajuste supervisado (SFT) sobre datos sintéticos evaluados por un juez automático, y una ronda final de SFT sobre las propias respuestas del modelo corregidas por un modelo más potente.

El modelo conserva la arquitectura y el tokenizador del base, con 2.288.831.488 parámetros totales y un tamaño de repositorio de 4,6 GB. Es un artefacto de investigación, no un producto, y no está afiliado a Microsoft. Su relevancia radica en que demuestra empíricamente que el CPT es imprescindible para la adaptación lingüística (el SFT aislado apenas mejora el idioma) y que la autocorrección con un modelo juez es la palanca más barata para reducir errores gramaticales.

La licencia es MIT, igual que la del modelo base, lo que facilita su uso y modificación. El modelo está pensado para generación de texto conversacional en polaco e inglés, con soporte de plantilla de chat y código personalizado del base (`trust_remote_code=True`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del base Microsoft Aion-1.0-Instruct-2.3B; detalles internos no disponibles) |
| Parametros totales | 2.288.831.488 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (secuencia de entrenamiento CPT: 2048 tokens) |
| Tipos de cuantizacion | GGUF Q8_0 a Q4_K_M (con importance matrix en polaco); bfloat16 para transformers |
| Idiomas soportados | pl, en |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); GGUF (llama.cpp, requiere port de Aion) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura del base, un transformer de 2,3B parámetros, y aplica sobre él un preentrenamiento continuado seguido de dos rondas de SFT. El CPT se realizó sobre todo el modelo excepto los embeddings, con learning rate 2e-5, schedule coseno, 65.000 tokens por paso y secuencia de 2048 tokens. La primera fase usó 98 millones de tokens de FineWeb-2 Polish (85%) mezclados con FineWeb-Edu English (15%); la segunda añadió 92 millones de tokens de Polish DynaWord, remuestreado hacia conversación, habla y literatura.

El SFT se aplicó sobre el modelo completo durante 2 épocas con learning rate 1e-5, usando el dataset sintético `polish-sft-synthetic` más 2.900 filas en inglés. La ronda final de corrección usó 3.000 respuestas propias del modelo corregidas con ediciones mínimas por un modelo más fuerte, con learning rate 5e-6 y 1.500 filas de replay. Entre los hallazgos técnicos destacables: el SFT aislado apenas mueve el idioma (FLORES 1,72 → 1,68), mientras que los primeros 98M tokens de CPT reducen los errores de escritura un 28%; los segundos 92M tokens aportan solo −0,24 errores/100 palabras (no significativo); y el DPO sobre los mismos pares resultó más débil que el SFT sobre las correcciones (la log-probabilidad de las respuestas elegidas cayó 20 nats).

## Capacidades

- Generación de texto conversacional en polaco e inglés mediante plantilla de chat.
- Escritura de textos cotidianos en polaco (mensajes, correos, notas) con una tasa de errores de aproximadamente uno cada 40 palabras.
- Comprensión del polaco heredada del base, ahora con producción escrita sustancialmente mejorada.
- Soporte de conversaciones multi-turno a través del chat template del modelo base.
- Inferencia con decodificación greedy (recomendada por el autor) y decodificación por muestreo.
- Ejecución en llama.cpp mediante los archivos GGUF publicados (requiere un port de Aion en llama.cpp).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de correspondencia cotidiana en polaco: el modelo puede redactar mensajes a vecinos, correos breves o notas, que es exactamente el tipo de prompt con el que se evaluó (`polish-writing-eval`, 456 prompts de escritura diaria).
- Asistencia de escritura en aplicaciones para usuarios polacos: borradores de texto con fluidez aceptable (3,05/5) y tasa de error de 2,48 por 100 palabras, adecuada para borradores que un humano revisa después.
- Prototipado rápido en local: con 2,3B parámetros y cuantizaciones GGUF Q4_K_M, cabe en GPU de consumo y permite experimentar con generación en polaco sin depender de APIs.
- Investigación sobre adaptación lingüística: el modelo sirve como caso de estudio reproducible de CPT + SFT + autocorrección para lenguas de bajos recursos, con receta y métricas publicadas.
- Traducción asistida inglés-polaco: la mejora en FLORES-200 (de 1,72 a 1,36 nats relativos al inglés) indica una mayor eficiencia en el manejo del polaco, útil como componente en pipelines de traducción con revisión humana.
- Generación de datos sintéticos en polaco: puede producir textos de partida que un modelo mayor filtre o corrija, replicando el propio proceso de corrección del autor.
- Educación y demostraciones: al ser MIT y de tamaño reducido, es apto para talleres y demos sobre fine-tuning y adaptación de idiomas.

## Benchmarks y rendimiento

Evaluación `polish-writing-eval` (456 prompts de escritura cotidiana, decodificación greedy, juez DeepSeek V4.1 Flash; intervalos bootstrap del 95% sobre prompts):

| Modelo | Errores lingüísticos / 100 palabras | Fluidez 1–5 | Tarea 1–5 | Bucles |
|:--|--:|--:|--:|--:|
| Mistral Small 4 | 1,03 | 4,29 | 4,20 | 1% |
| Ministral 8B | 1,63 | 3,46 | 3,53 | 4% |
| **Este modelo** | **2,48** (2,27–2,71) | 3,05 | 2,80 | 28% |
| Ministral 3B | 2,81 | 2,88 | 2,93 | 8% |
| Aion 2.3B original | 5,35 ¹ | 1,88 ¹ | 1,79 ¹ | 37% ¹ |

¹ Solo 116 prompts del núcleo. Como calibración, el Aion original escribe alemán (idioma soportado) con 1,96 errores/100 palabras y fluidez 3,52.

FLORES-200 devtest (nats por pasaje relativos al inglés; menor es mejor): original 1,72 → este modelo 1,36. Los idiomas soportados del base se sitúan en 1,12–1,30.

Progresión de la receta (errores/100 palabras):

| Paso | Datos | Resultado |
|:--|:--|--:|
| Solo SFT, sin CPT | `polish-sft-synthetic` + 2.900 filas en inglés | 4,40 |
| CPT 98M tokens + mismo SFT | FineWeb-2 Polish 85% + FineWeb-Edu English 15% | 3,16 |
| CPT +92M tokens + mismo SFT | Polish DynaWord remuestreado | 2,94 |
| + SFT sobre respuestas propias corregidas | 3.000 respuestas corregidas | 2,48 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 GB en bfloat16 (tamaño del repo); en GGUF Q8_0 en torno a 2,5 GB y en Q4_K_M alrededor de 1,5 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para bfloat16; RTX 3060/4060 o superiores para cuantizaciones GGUF.
- Cabe en GPU de consumo: sí, tanto en bfloat16 en tarjetas de 8 GB o más como en cuantizaciones Q4_K_M en tarjetas de 4–6 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True`; llama.cpp mediante los GGUF publicados, que requieren un port de Aion en llama.cpp. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Errores/100 palabras (polaco) | Fluidez | Licencia | Disponibilidad |
|:--|:--|:--|--:|--:|:--|:--|
| Este modelo | 2,3B | no disponible | 2,48 | 3,05 | MIT | Hugging Face (transformers + GGUF) |
| Aion 2.3B original | 2,3B | no disponible | 5,35 ¹ | 1,88 ¹ | MIT | Hugging Face (Microsoft) |
| Ministral 3B | 3B | no disponible | 2,81 | 2,88 | no disponible | Hugging Face (Mistral) |
| Ministral 8B | 8B | no disponible | 1,63 | 3,46 | no disponible | Hugging Face (Mistral) |
| Mistral Small 4 | no disponible | no disponible | 1,03 | 4,29 | no disponible | Hugging Face (Mistral) |

¹ Evaluado solo sobre 116 prompts del núcleo, no directamente comparable con la columna de 456 prompts.

El modelo supera al Aion original en polaco con el mismo número de parámetros y se acerca a Ministral 3B en errores lingüísticos, aunque con peor fluidez y una tasa de bucles notablemente superior (28% frente a 8%). Los modelos Mistral, de mayor tamaño, quedan claramente por delante en calidad de escritura.

## Limitaciones y advertencias

- Sigue cometiendo errores gramaticales: aproximadamente uno cada 40 palabras; el vocativo es un error frecuente (por ejemplo, *Szanowny Panie Tomasz* en lugar de *Tomaszu*).
- Bucles en aproximadamente una cuarta parte de las respuestas con decodificación greedy; se recomienda mantener `max_new_tokens` moderado. El penalty de repetición 1,1 reduce los bucles del 28% al 12%, pero eleva los errores a 3,10.
- Los hechos son débiles, como en el modelo base a este tamaño; riesgo elevado de alucinación en preguntas factuales.
- No hay ajuste de seguridad adicional más allá del del modelo base; es un artefacto de investigación, no un producto.
- Contexto de entrenamiento limitado a secuencias de 2048 tokens en CPT; la longitud de contexto efectiva del base no se detalla en la información disponible.
- El soporte de llama.cpp requiere un port específico de Aion, lo que limita la portabilidad inmediata a otras herramientas.
- El modelo no está afiliado a Microsoft y es una adaptación no oficial; la calidad puede variar fuera del dominio de escritura cotidiana evaluado.
- Licencia MIT para los pesos, pero los datos de entrenamiento tienen licencias propias (FineWeb-2 y FineWeb-Edu ODC-By, Polish DynaWord con licencias por documento, JohnTdi/polish-llm-sft-en Apache 2.0, sintéticos CC BY 4.0); conviene revisarlas para uso comercial a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shefowl/Aion-1.0-Instruct-2.3B-Polish
- GGUF para llama.cpp: https://huggingface.co/shefowl/Aion-1.0-Instruct-2.3B-Polish-GGUF
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Dataset de evaluación: https://huggingface.co/datasets/shefowl/polish-writing-eval
- Dataset SFT sintético: https://huggingface.co/datasets/shefowl/polish-sft-synthetic
- Dataset de preentrenamiento: https://huggingface.co/datasets/SlayerLab/polish-dynaword-pretraining-mix
- FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
