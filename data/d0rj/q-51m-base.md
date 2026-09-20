# d0rj/q-51M-base

## Resumen

Q-51M Base es un modelo de lenguaje causal (decoder-only) en inglés de 50.878.240 parámetros, desarrollado por el usuario d0rj dentro de un experimento de ablación de modelos de lenguaje diminutos (etiqueta `tiny-llm-ablation`). Está entrenado desde cero, con inicialización aleatoria, sobre 3.932.160.000 tokens de entrada procesados a lo largo de 15.000 pasos de optimizador. No es un ajuste fino de ningún checkpoint previo: la model card indica explícitamente que comparte arquitectura y tokenizador con `q-project/Q-50M-Base`, pero los pesos se entrenaron desde cero.

El modelo resuelve un problema de investigación, no de producto: sirve como punto de referencia reproducible para estudiar cómo escala el rendimiento con un presupuesto de cómputo muy reducido (un único RTX 5070 Ti de 16 GB en BF16). Su arquitectura es un transformer de 10 capas, anchura 512, SwiGLU de anchura 1792, 8 cabezas de consulta y 2 de clave/valor, RoPE, normalización QK por cabeza, ramas residuales con puerta y embeddings atados, con una longitud de contexto de 2048 tokens.

Es relevante ahora porque todo el pipeline es auditable: dataset público (FineWeb-Edu `sample-10BT`), configuración de entrenamiento publicada, tokenizador de 32.768 tokens y evaluación cero-disparada con `lm-eval 0.4.12`. Sus resultados en tareas de sentido común son modestos (HellaSwag 29,18 %; WinoGrande 50,04 %, prácticamente nivel de azar), lo que lo convierte en una línea base honesta para experimentos de eficiencia, destilación y ablación más que en un modelo desplegable en producción conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (10 capas, anchura 512, SwiGLU de anchura 1792, 8 cabezas Q / 2 cabezas KV, RoPE, normalización QK por cabeza, ramas residuales con puerta, embeddings atados) |
| Parametros totales | 50.878.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; la model card indica que los checkpoints conservan pesos FP32) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`, requiere `custom_code`) |
| Tokenizador | 32.768 tokens, heredado sin cambios de `q-project/Q-50M-Base` |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu (`sample-10BT`) |
| Tokens de origen procesados | 3.932.160.000 |
| Pasos de optimizador | 15.000 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar con atención causal, modificado en varios puntos concretos: normalización QK por cabeza (en lugar de solo a nivel de proyección), ramas residuales con puerta y embeddings de entrada/salida atados. Usa SwiGLU con anchura intermedia de 1792 y una configuración de atención agrupada de 8 cabezas de consulta frente a 2 de clave/valor, lo que reduce el coste de la caché KV. El tokenizador, de 32.768 entradas, se toma sin cambios del modelo de referencia `q-project/Q-50M-Base`, lo que permite comparaciones directas de perplejidad y de asignación de tokens entre ambos.

El entrenamiento es un objetivo causal de entropía cruzada de siguiente token sobre FineWeb-Edu (`sample-10BT`), leído en streaming desde fragmentos Parquet locales con un búfer de mezcla de 100.000. El lote efectivo es de 32 secuencias × 4 pasos de acumulación × 2048 tokens = 262.144 tokens de origen por paso, lo que explica el total de 3.932.160.000 tokens en 15.000 pasos. Se usó AdamW fusionado con BF16 en un único RTX 5070 Ti (16 GB), semilla 2026, LR máximo de 0,001, betas (0,9; 0,95), weight decay de 0,1 sin decaimiento en sesgos, normas y parámetros 1D, recorte de gradiente de 1,0, calentamiento lineal de 150 pasos y decaimiento coseno hasta el 10 % del LR máximo. No se menciona en la información disponible ninguna fase de RLHF, DPO o ajuste por instrucciones: es un modelo base puro.

## Capacidades

- Generación de texto causal en inglés: continuación de texto libre y autocompletado, sin plantilla de chat asociada.
- Puntuación de continuaciones (*continuation likelihood*): es el modo en que se han obtenido todos sus resultados de evaluación cero-disparada, por lo que es un uso directamente validado.
- Conocimiento factual y de sentido común limitado, coherente con su tamaño y con sus métricas (ARC-Easy 43,31 %; OpenBookQA 28,20 %).
- No dispone de soporte de *tool calling* ni de *function calling* según la información disponible.
- No dispone de soporte de agentes, razonamiento multi-paso ni modo de pensamiento (*thinking*).
- No dispone de capacidades de visión, audio ni multimodalidad.
- Multilingüismo: únicamente inglés declarado; no hay evidencia de competencia en otros idiomas.
- Capacidad especial: forma parte de un experimento de ablación reproducible, con configuración de entrenamiento publicada (`training_config.json`), lo que lo hace apto para reproducibilidad y estudios comparativos.

## Casos de uso

- Investigación sobre escalado y ablaciones: es su propósito declarado. Permite variar anchura, número de capas o presupuesto de tokens manteniendo el mismo tokenizador y dataset, y comparar contra un punto de referencia fijo con la misma receta de entrenamiento.
- Modelo alumno en destilación: con 50,9 M de parámetros y 0,2 GB de repositorio, es un candidato para destilar desde un modelo mayor y medir la transferencia de conocimiento en tareas como HellaSwag o PIQA.
- Puntuación de texto y filtrado de corpus: al ser un modelo causal sin ajuste, puede usarse para calcular verosimilitud de continuaciones y descartar texto anómalo en canalizaciones de limpieza de datos en inglés.
- Pruebas de infraestructura y carga: por su huella mínima, sirve para validar configuraciones de vLLM, TGI o llama.cpp, comprobar el manejo de `trust_remote_code` y medir latencias relativas sin consumir GPU de gama alta.
- Base para ajuste fino supervisado en dominios estrechos: partiendo de este checkpoint se puede ajustar un clasificador o un generador de dominio (titulares, descripciones cortas, respuestas de formato fijo) con un coste de entrenamiento muy bajo.
- Despliegue en el borde (*edge*): con cuantización a 4 bits ocuparía del orden de decenas de megabytes, por lo que es viable en dispositivos embebidos, navegador o CPU para tareas de generación muy acotadas.
- Docencia y demostraciones de entrenamiento desde cero: la publicación de la configuración exacta y del recuento de tokens y pasos lo hace útil como ejemplo didáctico de un ciclo completo de preentrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index`, sin verificación independiente (`verified: false`). Evaluación cero-disparada (`num_few_shot = 0`), `lm-eval 0.4.12`, sin plantilla de chat, BF16 sobre un RTX 5070 Ti, contexto máximo de 2048. Las puntuaciones se expresan en porcentaje; el intervalo entre corchetes es el intervalo de confianza del 95 % de Wilson, que refleja únicamente la incertidumbre de la muestra de evaluación, no la variación entre semillas de entrenamiento.

| Dataset | Split | Ejemplos | Metrica | Puntuacion (%) | IC 95 % (%) |
|---|---|---:|---|---:|---:|
| HellaSwag | validation | 10.042 | acc_norm | 29,18 ± 0,45 (EE) | [28,30; 30,07] |
| ARC-Easy | test | 2.376 | acc_norm | 43,31 ± 1,02 (EE) | [41,33; 45,31] |
| ARC-Challenge | test | no disponible | acc_norm | 24,23 | [21,87; 26,77] |
| PIQA | validation | no disponible | acc_norm | 59,90 | [57,64; 62,12] |
| WinoGrande | validation | no disponible | acc | 50,04 | [47,29; 52,79] |
| OpenBookQA | test | no disponible | acc_norm | 28,20 | [24,43; 32,30] |
| BoolQ | validation | no disponible | acc | 59,88 | [58,19; 61,55] |
| LAMBADA OpenAI | test | no disponible | acc | 20,86 | [19,77; 21,99] |

No se han publicado en la información disponible resultados de MMLU, GSM8K, HumanEval ni de otras tareas de razonamiento, matemáticas o código.

## Requisitos de hardware

- VRAM estimada para los pesos en inferencia, calculada a partir de los 50.878.240 parámetros: aproximadamente 204 MB en FP32, 102 MB en BF16/FP16, 51 MB en int8 y del orden de 25 a 30 MB en 4 bits.
- Caché KV con contexto completo de 2048 tokens: aproximadamente 10 MB en BF16 (10 capas × 2 cabezas KV × 64 dimensiones por cabeza × 2 tensores × 2 bytes × 2048 tokens).
- Huella total realista en inferencia: por debajo de 0,5 GB incluyendo activaciones y *overhead* del runtime, es decir, cabe holgadamente en cualquier GPU de consumo, en iGPU y en CPU.
- GPU recomendadas: cualquier GPU de consumo sirve; el propio autor usó un RTX 5070 Ti (16 GB) para el entrenamiento en BF16. No se necesita A100, H100 ni hardware de centro de datos.
- Cabe en GPU de consumo: sí, en todas las generaciones recientes (serie RTX 20/30/40/50, RX 6000/7000, Arc) e incluso en dispositivos con unos pocos cientos de megabytes de memoria.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True` por la etiqueta `custom_code`), llama.cpp tras conversión a GGUF, Ollama con un Modelfile propio y TGI o vLLM si la implementación personalizada es compatible con el registro de modelos.
- Latencia y throughput: no disponible. No se han publicado medidas de tokens por segundo ni de latencia para este checkpoint.

## Comparativa con modelos similares

La información proporcionada no incluye datos de benchmarks ni especificaciones verificadas de modelos alternativos, por lo que la comparación numérica no está disponible. La tabla recoge únicamente lo que consta y marca el resto como no disponible.

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---:|---:|---|---|---|
| Q-51M Base (d0rj) | 50.878.240 | 2048 | no disponible | HellaSwag 29,18 %; ARC-Easy 43,31 %; PIQA 59,90 % (zero-shot, lm-eval 0.4.12) | HuggingFace, safetensors |
| Q-50M Base (q-project) | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card como origen de arquitectura y tokenizador |
| Otros modelos de la categoría de ~50-70 M de parámetros | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explícita no puede asumirse permiso de uso comercial, redistribución ni modificación. Conviene contactar con el autor antes de cualquier uso en producción.
- Es un modelo base preentrenado, sin ajuste por instrucciones ni plantilla de chat: no seguirá órdenes ni mantendrá formatos conversacionales de forma fiable.
- Idioma único: solo inglés declarado. No hay evidencia de competencia en castellano ni en otros idiomas.
- Contexto corto: 2048 tokens, insuficiente para documentos largos, recuperación sobre corpus extensos o conversaciones multi-turno prolongadas.
- Riesgo elevado de alucinación y de afirmaciones factualmente incorrectas: con 50,9 M de parámetros y 3.932 millones de tokens vistos, la cobertura factual es muy limitada.
- Rendimiento cercano al azar en varias tareas: WinoGrande 50,04 % (el azar binario es 50 %) y LAMBADA OpenAI 20,86 % indican una capacidad de modelado de dependencias de largo alcance muy débil.
- Resultados de evaluación no verificados (`verified: false`) y con una única semilla de entrenamiento: los intervalos publicados miden solo la incertidumbre de la muestra de evaluación, no la variabilidad entre semillas, por lo que no deben interpretarse como robustez del entrenamiento.
- Etiqueta `custom_code`: la carga con `transformers` requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar ese código antes de usarlo en entornos de producción.
- Desajuste entre el recuento de tokens declarado y el texto único: la propia model card advierte de que los 3.932.160.000 tokens miden bloques de entrada procesados, no texto único ni tokens objetivo supervisados.
- Repositorio sin descargas ni interacciones registradas: no hay comunidad, informes de errores ni validación externa que respalden su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d0rj/q-51M-base
- Modelo de referencia arquitectónica y tokenizador: https://huggingface.co/q-project/Q-50M-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset HellaSwag: https://huggingface.co/datasets/Rowan/hellaswag
- Dataset ARC (Easy y Challenge): https://huggingface.co/datasets/allenai/ai2_arc
- Dataset PIQA: https://huggingface.co/datasets/baber/piqa
- Dataset WinoGrande: https://huggingface.co/datasets/allenai/winogrande
- Dataset OpenBookQA: https://huggingface.co/datasets/allenai/openbookqa
- Dataset BoolQ (SuperGLUE): https://huggingface.co/datasets/aps/super_glue
- Dataset LAMBADA OpenAI: https://huggingface.co/datasets/EleutherAI/lambada_openai
- Configuración exacta de entrenamiento: `training_config.json` en el repositorio del modelo
- Herramienta de evaluación: lm-eval 0.4.12 (EleutherAI)
- No se han encontrado en la búsqueda web papers, blogs, repositorios auxiliares ni demos adicionales asociados a este modelo.
