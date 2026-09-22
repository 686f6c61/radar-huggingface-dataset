# d0rj/prefixlm-51M-base

## Resumen

prefixlm-51M-base es un modelo de lenguaje base de 50,9 millones de parámetros, desarrollado por el usuario d0rj y publicado en HuggingFace dentro de la colección "Tiny llm ablation". Se trata de un modelo entrenado desde inicialización aleatoria (from-scratch) sobre texto en inglés, con un objetivo de modelado de lenguaje de tipo prefix LM: una fracción del contexto de entrada se procesa de forma bidireccional y solo los tokens objetivo de la parte causal contribuyen a la pérdida. El modelo no es un ajuste fino de ningún checkpoint previo, aunque reutiliza el tokenizador de 32.768 entradas y la configuración base de Q-50M-Base como referencia arquitectónica.

El interés del modelo es fundamentalmente experimental. Su propósito es servir como punto de comparación reproducible en una ablación sobre objetivos de entrenamiento en modelos pequeños, no como un asistente listo para producción. La model card documenta con detalle el presupuesto de cómputo (3.932.160.000 tokens fuente procesados, 15.000 pasos de optimizador) y el protocolo de evaluación, lo que lo hace útil para investigar cómo afecta el enmascaramiento bidireccional del prefijo al rendimiento en tareas de continuación y de elección múltiple.

Arquitectónicamente es un transformer decoder-only de 10 capas, anchura 512, SwiGLU de 1792, GQA con 8 cabezas de consulta y 2 de clave/valor, RoPE, RMSNorm y embeddings atados, con una longitud de contexto de 2048 tokens. La licencia no está declarada en el repositorio y el modelo solo soporta inglés. Los resultados publicados (HellaSwag 28,39 %, ARC-Easy 36,24 %, PIQA 53,10 %, LAMBADA 23,35 %) sitúan su rendimiento cerca del azar en varias tareas, lo que es coherente con su tamaño y con su naturaleza de modelo base sin ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con objetivo prefix LM (prefijo bidireccional + sufijo causal); 10 capas, anchura 512, SwiGLU 1792, GQA 8 cabezas de consulta / 2 de clave-valor, RoPE, RMSNorm, embeddings atados |
| Parametros totales | 50.866.720 según los pesos safetensors; la model card declara 50.866.688 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; el repositorio solo contiene pesos en precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers, requiere custom_code) |

Otros datos de interes: tokenizador de 32.768 entradas (sin modificar respecto a Q-50M-Base), pipeline text-generation, tamaño del repositorio 0,2 GB, 0 descargas y 0 "likes" en el momento de la consulta. Etiquetas del repositorio: custom_code, tensorboard, tiny-llm-ablation, from-scratch, prefixlm.

## Arquitectura y entrenamiento

El modelo sigue la familia de prefix language modeling descrita en el paper de T5 (arXiv:1910.10683). En cada ejemplo de entrenamiento se muestrea una fracción de prefijo bidireccional del conjunto {0,25, 0,5, 0,75}: los tokens de esa porción ven contexto a izquierda y derecha, mientras que el sufijo restante se procesa de forma causal. Solo los tokens objetivo del sufijo causal aportan a la pérdida. Las secuencias de menos de 100 tokens recurren a entrenamiento puramente causal. La evaluación aplica la misma condición: contexto de texto bidireccional con respuesta generada de forma causal. El backbone es un transformer decoder-only de 10 capas con anchura 512, FFN SwiGLU de 1792, atención GQA con 8 cabezas de consulta y 2 de clave/valor, RoPE, RMSNorm y embeddings atados.

El entrenamiento consumió exactamente 3.932.160.000 tokens fuente procesados en 15.000 pasos de optimizador sobre una muestra de 10 BT del dataset FineWeb-Edu. El lote efectivo fue de 8 × 16 de acumulación × 2048 = 262.144 tokens fuente por paso, con búfer de barajado de 100.000 y semilla 2026. El cómputo se hizo en BF16 con pesos en FP32 sobre una única RTX 5070 Ti de 16 GB, usando AdamW fusionado con LR máximo de 0,001, calentamiento lineal de 150 pasos y decaimiento coseno hasta 0,0001, betas (0,9, 0,95), weight decay de 0,1 excluyendo sesgos, normas y parámetros 1D, y recorte de gradiente de 1,0. La propia model card advierte de que presupuestos iguales de tokens fuente no implican la misma supervisión ni los mismos FLOPs. No se documenta ninguna fase de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Generación de texto en inglés: continuación de contexto, texto libre y completado de secuencias cortas.
- Modelado de verosimilitud de continuaciones: el protocolo declarado evalúa la probabilidad condicional de una respuesta causal dado un contexto textual completo, útil para puntuación de opciones.
- Procesamiento de contexto bidireccional en el prefijo, una capacidad poco habitual en modelos decoder-only puros de este tamaño.
- Razonamiento básico limitado: los resultados en ARC-Easy, ARC-Challenge y OpenBookQA indican un rendimiento bajo, ligeramente por encima del azar en los conjuntos más sencillos.
- Conocimiento factual muy limitado, coherente con 50,9 M de parámetros y 3,93 mil millones de tokens de entrenamiento.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de modo agente, razonamiento multi-paso ni planificación.
- No dispone de plantilla de chat ni de ajuste por instrucciones.
- Sin capacidades de visión, audio ni modalidades adicionales.
- Monolingüe: únicamente inglés.

## Casos de uso

- Investigación sobre objetivos de entrenamiento: el modelo está diseñado explícitamente como pieza de una ablación; sirve para comparar prefix LM frente a modelado causal puro manteniendo arquitectura, tokenizador y presupuesto de tokens constantes.
- Reproducción de experimentos a pequeña escala: con 3,93 mil millones de tokens procesados y una sola GPU de 16 GB, cualquier grupo con hardware modesto puede reproducir o replicar el entrenamiento completo y verificar los resultados declarados.
- Docencia y formación técnica: permite ilustrar en clase cómo funcionan GQA, RoPE, RMSNorm, SwiGLU y el enmascaramiento de atención en un modelo que cabe en memoria y se inspecciona con facilidad.
- Validación de pipelines de evaluación: el repositorio publica el protocolo (lm-eval 0.4.12, BF16, contexto máximo 2048, sin plantilla de chat) y los ficheros de resultados, lo que lo convierte en un banco de pruebas para verificar arneses de evaluación de continuaciones.
- Pruebas de infraestructura y despliegue: al ocupar menos de 1 GB, es adecuado para probar integraciones de transformers, servidores de inferencia y flujos de cuantización sin consumir recursos significativos.
- Experimentos con cuantización extrema: un modelo de 51 M de parámetros permite medir el impacto de INT8, INT4 y formatos de 2-3 bits sobre la perplejidad con ciclos de evaluación muy rápidos.
- Punto de partida para ajuste fino supervisado ligero: sirve como inicialización para clasificación de texto, análisis de sentimiento o etiquetado de secuencias en inglés cuando el dominio y el vocabulario son acotados.
- Comparación de protocolos de evaluación bidireccional frente a causal: útil para estudiar si el enmascaramiento de prefijo mejora la verosimilitud de continuaciones en tareas de elección múltiple.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo, evaluación zero-shot sobre las particiones completas, lm-eval 0.4.12, BF16, contexto máximo 2048, sin plantilla de chat. Protocolo: contexto de texto bidireccional con respuesta causal y verosimilitud condicional restringida a la respuesta. `acc_norm` normaliza la verosimilitud de la opción por la longitud según el arnés.

| Dataset | Particion | Ejemplos | Metrica | Puntuacion (%) | IC 95% (%) |
|---|---|---:|---|---:|---:|
| HellaSwag | validation | 10.042 | acc_norm | 28,39 ± 0,45 | [27,52, 29,28] |
| ARC-Easy | test | no disponible | acc_norm | 36,24 | [34,33, 38,19] |
| ARC-Challenge | test | no disponible | acc_norm | 22,78 | [20,47, 25,27] |
| PIQA | validation | no disponible | acc_norm | 53,10 | [50,82, 55,37] |
| WinoGrande (winogrande_xl) | validation | no disponible | acc | 49,72 | [46,98, 52,47] |
| OpenBookQA | test | no disponible | acc_norm | 25,60 | [21,97, 29,60] |
| BoolQ | validation | no disponible | acc | 54,86 | [53,15, 56,56] |
| LAMBADA OpenAI | test | no disponible | acc | 23,35 | [22,21, 24,52] |

Los intervalos de confianza son intervalos de Wilson al 95 % según el método declarado. LAMBADA exige que coincidan todos los tokens de la última palabra. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de razonamiento, código o matemáticas. Tampoco se incluyen comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 203 MB con pesos en FP32, unos 102 MB en BF16/FP16, unos 51 MB en INT8 y entre 26 y 35 MB en cuantizaciones de 4 bits. Sumando activaciones y caché KV para contexto de 2048 con lotes pequeños, el consumo total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Cabe en RTX 4090, RTX 3090, RTX 3060, GTX 1650, GPUs integradas y en la práctica totalidad de aceleradores modernos. El entrenamiento declarado se realizó en una única RTX 5070 Ti de 16 GB.
- Inferencia en CPU: totalmente viable. El modelo se ejecuta en CPU con latencias de milisegundos a decenas de milisegundos por token según el hardware, sin necesidad de GPU.
- Despliegue: transformers es la vía soportada, dado que el modelo incluye código personalizado y requiere `trust_remote_code=True`. vLLM, TGI, llama.cpp y Ollama podrían no funcionar directamente sin adaptar el código personalizado o convertir los pesos; no se publican pesos GGUF ni versiones cuantizadas en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentación pública y no de la información proporcionada en esta ficha; los valores de rendimiento de dichos modelos no se incluyen al no disponer de cifras verificadas en el material de referencia.

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| prefixlm-51M-base | 50,9 M | 2048 | Prefix LM (prefijo bidireccional) | no disponible | safetensors, requiere custom_code |
| Q-50M-Base | ~50 M | no disponible | Causal | no disponible | transformers |
| Pythia-70M | 70 M | 2048 | Causal | Apache 2.0 | transformers, múltiples checkpoints |
| GPT-2 small | 124 M | 1024 | Causal | MIT | transformers, ampliamente replicado |

La diferencia principal frente a estas alternativas no es de rendimiento sino de objetivo de entrenamiento: prefixlm-51M-base incorpora contexto bidireccional en el prefijo, algo que ninguno de los modelos causales comparables ofrece de serie. Como contrapartida, su licencia no está declarada, lo que complica su uso comercial, y no cuenta con ninguna validación de la comunidad (0 descargas, 0 "likes"). Tampoco se han publicado comparaciones directas con otros modelos en la model card, por lo que no se dispone de una comparativa de rendimiento verificada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni por preferencias humanas. No debe usarse directamente como asistente conversacional.
- El rendimiento es bajo en términos absolutos: 28,39 % en HellaSwag, 22,78 % en ARC-Challenge, 25,60 % en OpenBookQA y 49,72 % en WinoGrande, valores próximos al azar en varios casos. 23,35 % en LAMBADA indica una capacidad muy limitada de modelado de dependencias de largo alcance.
- Riesgo elevado de alucinación y de generar texto incoherente o factualmente incorrecto. No es apto para tareas que requieran precisión factual.
- Monolingüe en inglés. No hay evidencia de capacidad en castellano ni en otros idiomas, y el tokenizador no está adaptado a ellos.
- La licencia no está declarada en el repositorio. No se puede confirmar la legalidad de un uso comercial; conviene contactar con el autor antes de cualquier explotación.
- Requiere código personalizado y `trust_remote_code=True`, lo que implica ejecutar código del repositorio y revisarlo antes de cargar el modelo.
- La evaluación usa un protocolo específico (contexto bidireccional con respuesta causal) que no es directamente comparable con las cifras de modelos puramente causales evaluados de forma estándar.
- La model card advierte de que presupuestos iguales de tokens fuente no implican la misma supervisión ni los mismos FLOPs, por lo que las comparaciones con otros modelos de la ablación deben hacerse con cautela.
- No se publican pesos cuantizados ni formatos GGUF, lo que limita el despliegue directo en herramientas como llama.cpp u Ollama.
- Los sesgos heredados de FineWeb-Edu (corpus web filtrado por criterios educativos) no han sido analizados ni mitigados explícitamente.
- Las fechas de creación y actualización del repositorio (2026) son inusuales y conviene verificarlas antes de citar el modelo.
- Sin tracción comunitaria: 0 descargas y 0 "likes", sin informes independientes de terceros que validen los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d0rj/prefixlm-51M-base
- Colección Tiny llm ablation: https://huggingface.co/collections/d0rj/tiny-llm-ablation-6aafca336122dd2c2868f923
- Modelo de referencia arquitectónica Q-50M-Base: https://huggingface.co/q-project/Q-50M-Base
- Dataset de entrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper de referencia del objetivo prefix LM (T5): https://arxiv.org/abs/1910.10683
- Configuración de entrenamiento: https://huggingface.co/d0rj/prefixlm-51M-base/blob/main/training_config.json
- Resultados y procedencia de las métricas: https://huggingface.co/d0rj/prefixlm-51M-base/tree/main/evaluation

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo. Los únicos enlaces disponibles son los del propio repositorio de HuggingFace y los que referencia su model card.
