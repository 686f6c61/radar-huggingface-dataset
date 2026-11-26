# alea-institute/alea-r4-3B-A0.7B-Base-ckpts

## Resumen

ALEA R4 3B-A0.7B Base es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el ALEA Institute, especializado en texto legal, regulatorio y financiero de dominio público de Estados Unidos. Se construye sobre la arquitectura Qwen3-MoE estándar, con 3.315.557.632 parámetros totales y aproximadamente 673 millones activos por token, lo que lo sitúa en la gama de modelos compactos con activación dispersa. El repositorio publicado contiene exclusivamente checkpoints intermedios de preentrenamiento (no instruidos), distribuidos en ramas independientes para su uso en investigación.

El modelo es el sucesor de ALEA R3 y se entrena únicamente con datos lícitos: texto legal, regulatorio y financiero de registros públicos estadounidenses del proyecto KL3M Data Project, complementado con datos sintéticos, de diccionario, de conocimiento y de tareas generados por ALEA. Su relevancia actual radica en que ofrece una ventana transparente al proceso de preentrenamiento de un modelo de dominio legal, publicando checkpoints intermedios con métricas de evolución (BPB, sondas de conocimiento, suite ICL) que permiten estudiar cómo aprende el modelo a lo largo del entrenamiento.

La publicación es explícitamente de investigación: no es una release, no está instruido y su estado de seguridad y comportamiento está pendiente de comprobaciones finales. Cada checkpoint vive en su propia rama del repositorio y se carga con `revision=` usando `transformers` estándar, sin necesidad de `trust_remote_code`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3MoeForCausalLM (transformer MoE, 32 capas, d_model 1.280, 16 cabezas de consulta / 8 KV, head_dim 128, QK-norm, RoPE theta 1e6, 48 expertos enrutados con FFN 512 y top-6 routing, embeddings de entrada/salida atados) |
| Parámetros totales | 3.315.557.632 |
| Parámetros activos | ≈ 673 M por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 (contenido derivado de WordNet sujeto a `WORDNET_LICENSE.txt`) |
| Formato de pesos | bf16 safetensors (≈ 6,6 GB por rama) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3-MoE sin modificaciones: 32 capas transformer con 48 expertos enrutados por capa, FFN de dimensión 512 y enrutamiento top-6, además de QK-norm, RoPE con theta 1e6 y embeddings de entrada/salida atados. El tokenizador es `alea-v2b-sw32k`, un BPE de 32.768 tokens con tokens de control y plantilla de chat, con un post-procesador que antepone `<|start|>` automáticamente; los IDs de token son idénticos a los del tokenizador fuente. El entrenamiento se realizó con OLMo-core sobre una única NVIDIA GH200, con 1.048.576 tokens por paso, AdamW, tasa de aprendizaje constante de 4e-4 tras un calentamiento de 2.000 pasos (esquema WSD, con el decaimiento previsto para más adelante).

Los datos de entrenamiento provienen exclusivamente de fuentes lícitas: texto legal, regulatorio y financiero de registros públicos estadounidenses del KL3M Data Project, más datos sintéticos, de diccionario, de conocimiento y de tareas creados por ALEA. El repositorio publica checkpoints intermedios organizados en tres etapas (S1, S2, S3) con métricas de evolución: BPB en held-out, sondas de conocimiento (global y legal) y una suite ICL. A modo de referencia, el checkpoint `s3-step19000` alcanza 0,471 de BPB, 87,6 / 92,1 en sondas de conocimiento y 69,4 en la suite ICL tras 19,92 mil millones de tokens vistos. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva en inglés sobre dominio legal, regulatorio y financiero.
- Continuación y redacción de cláusulas y texto contractual (el ejemplo de la model card usa la fórmula "This Agreement shall be governed by...").
- Razonamiento de conocimiento legal y regulatorio, medido mediante sondas específicas en los checkpoints publicados.
- Aprendizaje en contexto (ICL) evaluado con una suite propia del autor.
- Soporte de plantilla de chat en el tokenizador, aunque el modelo no está instruido.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación del preentrenamiento: cargar checkpoints intermedios con `revision=` para estudiar la curva de aprendizaje del modelo en BPB, sondas de conocimiento y suite ICL, y comparar etapas S1, S2 y S3.
- Análisis de dominio legal estadounidense: usar el modelo como base para experimentos de continuación de texto contractual y regulatorio, aprovechando su entrenamiento exclusivo en registros públicos legales.
- Evaluación de datos lícitos: servir como banco de pruebas para metodologías de entrenamiento con datasets de procedencia verificada (KL3M Data Project), comparando el efecto de distintas composiciones de datos.
- Fine-tuning posterior: al ser un modelo base de 673 M de parámetros activos y 4.096 tokens de contexto, es adecuado como punto de partida para ajuste supervisado en tareas legales específicas, con un coste de cómputo contenido.
- Reproducibilidad de infraestructura: el entrenamiento documentado en una sola GH200 con OLMo-core permite reproducir o adaptar el pipeline en entornos de un solo nodo.
- Estudio de arquitecturas MoE compactas: la configuración de 48 expertos con top-6 y 673 M activos sirve para investigar el equilibrio entre capacidad total y coste de inferencia en modelos pequeños.
- Validación de tooling: los pesos cargan en `transformers` (5.17 probado, 4.51 o posterior con soporte Qwen3-MoE) y en vLLM mediante `Qwen3MoeForCausalLM`, lo que permite probar pipelines de despliegue estándar.

## Benchmarks y rendimiento

Los datos publicados son métricas internas del autor por checkpoint, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación para los checkpoints con datos completos en la información disponible.

| Checkpoint | Paso | Etapa | Tokens vistos | BPB held-out | Sonda conocimiento global / legal | Suite ICL |
|---|---:|---|---:|---:|---:|---:|
| s1-step1000 | 1.000 | S1 | 1,05 B | 0,956 | 31,1 / 29,9 | 0,2 |
| s1-step4000 | 4.000 | S1 | 4,19 B | 0,585 | 42,9 / 61,0 | 19,2 |
| s2-step5000 | 5.000 | S2 | 5,24 B | 0,557 | 76,4 / 84,8 | 36,8 |
| s2-step9000 | 9.000 | S2 | 9,44 B | 0,517 | 83,8 / 91,5 | 57,2 |
| s2-step12400 | 12.400 | S2 | 13,00 B | 0,504 | 84,6 / 92,1 | 56,2 |
| s3-step13000 | 13.000 | S3 | 13,63 B | 0,483 | 84,3 / 87,2 | 60,0 |
| s3-step16000 | 16.000 | S3 | 16,78 B | 0,475 | 83,5 / 87,8 | 59,6 |
| s3-step19000 | 19.000 | S3 | 19,92 B | 0,471 | 87,6 / 92,1 | 69,4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 12 GB según longitud de contexto y lote.
- Al ser un MoE con 673 M de parámetros activos, el coste computacional por token es bajo en comparación con un modelo denso de 3,3 B, aunque la memoria requerida corresponde al total de parámetros.
- GPU recomendadas: NVIDIA GH200 (usada en entrenamiento), A100, H100 para despliegue de referencia; también cabe en GPUs de consumo con suficiente VRAM.
- Cabe en GPUs de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) aloja los pesos en bf16 con margen amplio; tarjetas de 12-16 GB pueden requerir cuantización, aunque no se documentan tipos de cuantización en la información disponible.
- Opciones de despliegue: `transformers` (versión 5.17 probada; 4.51 o posterior con soporte Qwen3-MoE, usando `torch_dtype=` antes de 4.56) y vLLM mediante `Qwen3MoeForCausalLM`. No se documentan otras opciones (llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ALEA R4 3B-A0.7B Base | 3,32 B / 673 M | 4.096 | CC-BY-4.0 | MoE de dominio legal, solo checkpoints de preentrenamiento |
| ALEA R3 MoE 2B-A417M | no disponible en detalle | no disponible | no disponible | Predecesor directo de R4; enlace en la model card |
| Qwen3-MoE (arquitectura base) | no disponible en detalle | no disponible | no disponible | R4 usa la arquitectura Qwen3-MoE estándar sin modificaciones |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- No es una release: son checkpoints intermedios de preentrenamiento, no instruidos, y su estado de seguridad y comportamiento está pendiente de comprobaciones finales.
- No apto para uso en producción sin ajuste y evaluación adicionales; el modelo no sigue instrucciones de forma fiable.
- Riesgo de alucinación inherente a un modelo base de este tamaño y dominio; las afirmaciones legales o regulatorias generadas deben verificarse contra fuentes primarias.
- Contexto limitado a 4.096 tokens, insuficiente para documentos legales extensos sin fragmentación.
- Solo inglés; no se documenta soporte multilingüe.
- Entrenado exclusivamente con datos legales, regulatorios y financieros de EE. UU., lo que puede introducir sesgos de dominio y de jurisdicción.
- Licencia CC-BY-4.0 permite uso comercial con atribución, pero el contenido derivado de WordNet está sujeto a condiciones adicionales recogidas en `WORDNET_LICENSE.txt`.
- El repositorio ocupa 550,4 GB debido a las múltiples ramas de checkpoints; conviene descargar solo la rama necesaria.
- No se documentan tipos de cuantización ni métricas de latencia/throughput, lo que limita la planificación de despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alea-institute/alea-r4-3B-A0.7B-Base-ckpts
- Rama de ejemplo `s1-step1000`: https://huggingface.co/alea-institute/alea-r4-3B-A0.7B-Base-ckpts/tree/s1-step1000
- Modelo predecesor ALEA R3: https://huggingface.co/alea-institute/alea-r3-moe-2b-a417m
- Proyecto KL3M Data Project: no disponible en la información proporcionada
- Paper, blog o demo oficiales: no disponibles en la información proporcionada
