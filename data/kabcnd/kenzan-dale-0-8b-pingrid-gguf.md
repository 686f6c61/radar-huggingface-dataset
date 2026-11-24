# kabcnd/Kenzan-Dale-0.8B-PinGrid-GGUF

## Resumen

Kenzan-Dale-0.8B-PinGrid-GGUF es una release de cuantización quirúrgica del modelo `manuelgscom/dale-0.8b`, un ajuste fino completo de Qwen3.5-0.8B especializado en traducir peticiones en lenguaje natural (castellano o inglés) a un único comando Linux en bash estructurado como JSON con tres posibles contratos: `command`, `refuse` o `unsure`. Lo desarrolla el usuario `kabcnd` y se distribuye bajo licencia Apache 2.0 en formato GGUF, listo para `llama.cpp`, Ollama, LM Studio y la CLI `dale`.

La aportación principal no es un nuevo modelo base sino una estrategia de cuantización denominada PinGrid: en lugar de aplicar cuantización uniforme por bloques, redistribuye el presupuesto de bits desde la matriz de embeddings atados (248.320 tokens, que en la versión oficial Q4_K_M ocupa cerca del 39% de los bytes del fichero) hacia las capas con outliers reales, como `blk.23.ffn_down`, las proyecciones de atención completa y las compuertas recurrentes de GatedDeltaNet. El resultado es un Q4_K_M un 6,2% más pequeño que el oficial que, según el autor, iguala o supera su fidelidad de comandos frente a BF16.

El modelo tiene 752,39 millones de parámetros y una arquitectura híbrida de 24 capas: 18 bloques recurrentes de atención lineal GatedDeltaNet intercalados con 6 bloques de atención completa GQA. Es relevante para quienes despliegan asistentes de CLI en local, sobre todo en Apple Silicon, porque ofrece disciplina JSON estricta (100% de validez en el conjunto de test declarado) con velocidades de generación de 196 a 234 tokens por segundo en un Mac mini M6 y variantes que bajan de los 350 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas de texto, 18 bloques GatedDeltaNet (atención lineal recurrente) y 6 bloques GQA de atención completa en los índices {3, 7, 11, 15, 19, 23} |
| Parametros totales | 752.393.024 (752,39 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (referencia), Q4_K_M, Q3_K, IQ2_M (variantes PinGrid publicadas) |
| Idiomas soportados | Español (es) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`general.architecture = qwen35`, tipos de cuantización estándar) |

## Arquitectura y entrenamiento

El modelo base `manuelgscom/dale-0.8b` es un ajuste fino completo de Qwen3.5-0.8B con `tie_word_embeddings = true` y un vocabulario de 248.320 tokens. La arquitectura combina 18 bloques de GatedDeltaNet, un mecanismo de atención lineal con estado recurrente, con 6 bloques de atención completa con GQA (grouped-query attention) distribuidos cada cuatro capas. Esta mezcla busca reducir el coste de atención en contextos largos manteniendo la capacidad de recuperación de la atención completa.

La release PinGrid no reentrena el modelo: aplica matrices de importancia específicas del dominio CLI en español e inglés, generadas sin fuga de datos respecto a `dale-bash-test-v2`, para decidir qué tensores anclar en precisión alta y cuáles comprimir. Los tensores de atención completa con outliers elevados (por ejemplo `blk.23.attn_v` con ratio de outlier 29,06 o `blk.3.attn_output` con 26,79) se mantienen en Q8_0 o Q6_K, mientras que la matriz de embeddings atados baja de Q6_K (208,5 MB) a Q4_K (143,0 MB) o Q3_K. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se usaron RLHF o DPO en el ajuste fino original.

## Capacidades

- Generación de comandos bash a partir de lenguaje natural en español e inglés, con salida estructurada en JSON y contrato de tres vías (`command`, `refuse`, `unsure`).
- Disciplina de formato estricta: el autor declara 100% de validez JSON estricta en las 471 muestras de `dale-bash-test-v2` para las variantes Q4_K_M y Q3_K.
- Modo conversacional (`conversational`), orientado a interacción multi-turno con la CLI `dale`.
- Capacidad de rechazo controlado: el contrato `refuse` permite al modelo declinar peticiones inseguras o fuera de alcance en lugar de alucinar un comando.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el checkpoint es solo de texto.
- Compatibilidad directa con `llama.cpp` estándar, Ollama, LM Studio y la CLI `dale`, incluyendo aceleración Metal en Apple Silicon.

## Casos de uso

- Asistente de terminal local: el modelo traduce instrucciones como "lista los ficheros más grandes de /var" a un comando bash validado en JSON, con la ventaja de ejecutarse en CPU o GPU integrada sin conexión a la nube.
- Automatización de scripts en pipelines de CI/CD: al emitir JSON estricto con un campo `command` bien definido, se puede parsear de forma determinista y ejecutar tras validación, reduciendo errores de formato frente a salidas en texto libre.
- Herramienta de onboarding para administradores noveles: el contrato `refuse` y `unsure` permite construir interfaces que expliquen por qué una petición no es segura o es ambigua, en lugar de generar comandos destructivos.
- Despliegue en Apple Silicon: con 196,79 t/s en generación (Q4_K_M) y 234,20 t/s (IQ2_M) en un Mac mini M6, es viable como servicio local de sugerencia de comandos integrado en el terminal del desarrollador.
- Entornos con restricciones de memoria: la variante IQ2_M de 343,1 MB permite embeber el modelo en dispositivos edge o contenedores pequeños manteniendo un 99,79% de validez JSON y un 84,37% de coincidencia de programa.
- Generación de documentación y cheat-sheets de shell: el modelo puede producir comandos comentados o explicaciones de utilidades a partir de descripciones en español, útil para wikis internas de equipos de operaciones.
- Filtrado y clasificación de peticiones en un asistente mayor: usar la salida `unsure` o `refuse` como señal para derivar la consulta a un modelo de mayor tamaño o a un humano.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto `manuelgscom/dale-bash-test-v2` (471 casos, temperatura 0.0, `n_predict = 200`, contrato de prompt `dale` v2, Mac mini M6 con `llama-server` y `llama-bench -p 512 -n 128`). No están verificados de forma independiente.

| Variante | Tamano | JSON valido (471) | Precision `type` (471) | Coincidencia de programa (339) | Coincidencia exacta BF16 (339) | Metal `tg128` | CPU 4T `tg128` |
|---|---|---|---|---|---|---|---|
| BF16 (referencia) | 1.516,7 MB | 471/471 (100,0%) | 469/471 (99,58%) | 307/339 (90,56%) | techo | 84,25 t/s | 9,38 t/s |
| Q4_K_M oficial | 529,3 MB | 471/471 (100,0%) | 471/471 (100,0%) | 306/339 (90,27%) | 270/339 | 187,06 t/s | 159,49 t/s |
| PinGrid Q4_K_M | 496,5 MB | 471/471 (100,0%) | 469/471 (99,58%) | 306/339 (90,27%) | 277/339 | 196,79 t/s | 158,37 t/s |
| PinGrid Q3_K | 451,1 MB | 471/471 (100,0%) | 469/471 (99,58%) | 303/339 (89,38%) | 248/339 | 206,03 t/s | 154,73 t/s |
| PinGrid IQ2_M | 343,1 MB | 470/471 (99,79%) | 467/471 (99,15%) | 286/339 (84,37%) | 141/339 | 234,20 t/s | 98,36 t/s |

En ingestión de prompt por CPU (4 hilos), el autor reporta 727,1 t/s para Q3_K frente a 613,6 t/s del Q4_K_M oficial, un 18,5% más rápido.

## Requisitos de hardware

- VRAM estimada: entre 350 MB y 1,6 GB según variante (IQ2_M 343,1 MB, Q3_K 451,1 MB, Q4_K_M 496,5 MB, BF16 1.516,7 MB), más overhead del contexto y del runtime de `llama.cpp`.
- Cabe en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090, e incluso iGPU y Apple Silicon con memoria unificada.
- GPU de datacenter (A100, H100) no necesarias; el modelo está pensado para despliegue local y edge.
- Despliegue: `llama.cpp` estándar, `llama-server`, Ollama, LM Studio y la CLI `dale`. Compatible con aceleración Metal en Apple Silicon.
- Throughput declarado: 196,79 t/s (Q4_K_M) y 234,20 t/s (IQ2_M) en generación sobre Mac mini M6 con Metal; 158,37 t/s (Q4_K_M) y 98,36 t/s (IQ2_M) en CPU con 4 hilos.
- Latencia de prompt: `pp512` de 727,1 t/s (Q3_K) y 613,6 t/s (Q4_K_M oficial) en CPU de 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kenzan-Dale-0.8B-PinGrid-GGUF | 752,39 M | No disponible | NL a bash con JSON estricto, cuantización PinGrid | Apache 2.0 | GGUF en Hugging Face |
| dale-0.8b (Q4_K_M oficial) | 752,39 M | No disponible | Mismo modelo base, cuantización uniforme | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-0.8B | 0,8 B (aprox.) | No disponible | Modelo generalista base | No disponible en la información | Pesos originales de Qwen |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría (especialistas NL a bash de menos de 1B) en la información proporcionada, por lo que la comparación cuantitativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- El modelo está especializado en un único dominio: generación de comandos bash. Su utilidad fuera de tareas CLI es limitada.
- Solo soporta español e inglés; no se declaran otros idiomas.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas.
- Riesgo de comandos destructivos: aunque existe el contrato `refuse` y `unsure`, cualquier integración en producción debe validar y sandboxear los comandos antes de ejecutarlos.
- La variante IQ2_M pierde fidelidad notable (84,37% de coincidencia de programa y 141/339 de coincidencia exacta frente a BF16); no es recomendable para tareas donde la precisión del comando sea crítica.
- El modelo base es un ajuste fino de Qwen3.5-0.8B; los sesgos del corpus original pueden persistir, aunque no se documentan sesgos específicos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base `manuelgscom/dale-0.8b` y de Qwen3.5-0.8B antes de redistribuir.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del rendimiento declarado.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Dale-0.8B-PinGrid-GGUF
- Modelo base: https://huggingface.co/manuelgscom/dale-0.8b
- GGUF oficial del modelo base: https://huggingface.co/manuelgscom/dale-0.8b-GGUF
- Dataset de evaluación: https://huggingface.co/datasets/manuelgscom/dale-bash-test-v2
- Apoyo al autor (Ko-fi): https://ko-fi.com/kabcpc
