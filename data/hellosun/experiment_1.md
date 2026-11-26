# HelloSun/Experiment_1

## Resumen

HelloSun/Experiment_1 es una conversión no oficial a GGUF del modelo openPangu-R-7B-2512, desarrollado originalmente por Huawei (openPangu). El repositorio, publicado por el usuario independiente HelloSun, empaqueta el modelo base en cuantización Q4_K_M (4,72 GiB) junto con un parche para llama.cpp v0.7.0 que añade la arquitectura `openpangu-r`, scripts de compilación y un estudio comparativo de backends de inferencia en CPU (llama.cpp, oneDNN y OpenVINO). No está respaldado ni publicado por Huawei.

El modelo base es un transformer de aproximadamente 8.285 millones de parámetros (8,29 B) con un módulo MTP (multi-token prediction) descartado durante la conversión, plantilla de chat en chino y un modo de razonamiento dual: "pensamiento rápido" (respuestas directas, activable con el sufijo `/no_think`) y "pensamiento lento" (razonamiento explícito). Su relevancia actual radica en que demuestra un flujo completo de portado de un modelo propietario chino a llama.cpp, con verificación numérica frente a una referencia fp32 y datos de rendimiento en CPU x86-64 con AVX-512 y AMX.

La ficha se basa exclusivamente en la información del repositorio de Hugging Face y su model card; los datos no publicados se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (nombre de arquitectura GGUF: `openpangu-r`), con capas de ventana deslizante (sliding window) y módulo MTP descartado en la conversión |
| Parametros totales | 8.285.328.768 (~8,29 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible de forma explícita; la model card menciona KV cache de 640 slots en OpenVINO y verificación con prompts de 484 tokens y ventana deslizante activa |
| Tipos de cuantizacion | Q4_K_M (GGUF, 4,72 GiB); sinks y pesos de convolución en F32; también F16 intermedio |
| Idiomas soportados | no disponible oficialmente; plantilla de chat y ejemplos en chino |
| Licencia | openpangu-model-license-agreement-1.0 (etiquetada como `other`) |
| Formato de pesos | GGUF (Q4_K_M); safetensors BF16 en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer de ~8,29 B parámetros con capas de atención de ventana deslizante, tal como se deduce de la verificación de la conversión: desactivar la ventana en la referencia fp32 altera los logits en ~6, lo que confirma su presencia. Incluye un módulo MTP en la capa 27 y una segunda normalización final, ambos eliminados durante la conversión a GGUF. La conversión se realizó con `convert_hf_to_gguf.py` parcheado con `--outtype f16` desde los safetensors BF16, seguida de `llama-quantize` a Q4_K_M.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineación. La model card sí documenta el comportamiento de razonamiento dual: el modelo soporta un modo de pensamiento rápido (sin cadena de razonamiento explícita) y un modo de pensamiento lento, controlado mediante el sufijo `/no_think` en el mensaje de usuario. La verificación incluyó comparación de logits top-10 frente a una referencia fp32 (diferencia máxima ~0,01 para 33 tokens y ~0,03 para 484 tokens), decodificación greedy token a token, consistencia entre decodificación por lotes y token a token, y prueba de contexto largo con un dato situado ~400 tokens antes de la pregunta.

## Capacidades

- Generación de texto conversacional en chino, con plantilla de chat específica (`[unused9]系统：…[unused10]…`).
- Razonamiento en dos modos: pensamiento rápido (respuestas directas) y pensamiento lento (razonamiento explícito antes de responder).
- Aritmética básica y resolución de problemas verbales sencillos en modo lento (por ejemplo, `123 + 456 = 579`; problema de fracciones con respuesta `12`).
- Generación creativa breve (poesía de cuatro versos en los ejemplos de la model card).
- Conversación multi-turno: la model card verifica que un segundo turno de usuario añadido al mismo contexto se responde de forma coherente.
- Manejo de contexto largo dentro de los límites del modelo (verificado con un hecho a ~400 tokens de distancia).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo de pensamiento lento es el mecanismo más cercano.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: no documentadas; los ejemplos y la plantilla son en chino.

## Casos de uso

- Razonamiento aritmético y problemas verbales en modo lento: el modelo resuelve operaciones y problemas de fracciones con cadena de razonamiento explícita, útil en asistentes educativos o de cálculo donde se requiere mostrar el proceso.
- Asistentes conversacionales en chino: la plantilla de chat nativa y la verificación multi-turno permiten desplegar diálogos multi-turno en aplicaciones de atención al cliente o soporte interno en ese idioma.
- Generación de contenido creativo breve: los ejemplos de poesía de cuatro versos muestran utilidad para tareas de copywriting o generación literaria corta en chino.
- Inferencia en CPU sin GPU: con 4,72 GiB en Q4_K_M y 13,39 tok/s de decodificación en un contenedor de 16 CPUs con AVX-512, es viable en servidores sin acelerador gráfico o en entornos con restricciones de hardware.
- Estudio y reproducción de portados a llama.cpp: el repositorio incluye parche, script de compilación y verificación numérica frente a fp32, lo que lo convierte en material de referencia para ingenieros que necesiten portar arquitecturas no soportadas.
- Evaluación comparativa de backends de CPU: los datos de llama.cpp, oneDNN y OpenVINO (throughput, perplejidad, coincidencia de argmax) sirven para decidir la pila de inferencia en despliegues x86 con AMX o AVX-512.
- Prototipado de modos de razonamiento dual: el control `/no_think` permite alternar entre respuestas rápidas y razonamiento extendido según la latencia tolerada, útil en pipelines con presupuesto de tiempo variable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye mediciones de rendimiento de inferencia en CPU (Intel Xeon Platinum 8559C, contenedor de 16 CPUs, AVX-512 y AMX, sin GPU) con el modelo Q4_K_M:

| Backend | Pesos | pp512 tok/s | tg128 tok/s | ppl512 | Coincidencia argmax vs f32 |
|---|---|---:|---:|---:|---:|
| llama.cpp (AVX512 simple) | Q4_K_M | 180,50 | 13,39 | - | - |
| llama.cpp (AMX+repack por defecto) | Q4_K_M | 112,77 | 12,19 | - | - |
| oneDNN | int8 | 90,09 | 7,67 | - | - |
| oneDNN | bf16 | 75,52 | 4,79 | - | - |
| OpenVINO | f32 | 125,60 | 2,22 | 28,82 | 1,000 |
| OpenVINO | bf16-hint | 209,43 | 3,93 | 28,85 | 0,975 |
| OpenVINO | int8-asym | 219,17 | 4,70 | 29,11 | 0,951 |
| OpenVINO | int8-sym | 226,68 | - | 29,34 | 0,941 |
| OpenVINO | int4-asym | 223,65 | 5,20 | 32,68 | 0,703 |
| OpenVINO | int4-sym | 222,48 | - | 42,95 | 0,701 |

Conclusiones documentadas: llama.cpp Q4_K_M es el más rápido en decodificación en este contenedor; el backend oneDNN está limitado por ancho de banda de memoria (bf16: 16,6 GB/token frente a ~5 GB/token de Q4_K); OpenVINO logra el mejor prefill pero la peor decodificación por recorrer la KV cache completa de 640 slots en cada paso. La cuantización int8 de OpenVINO mantiene la perplejidad cerca de f32 (+0,3), mientras que int4 la degrada (+3,9).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en las pruebas realizadas (solo CPU); el GGUF Q4_K_M ocupa 4,72 GiB, por lo que en GPU se necesitarían al menos ~5-6 GiB de VRAM para pesos más overhead de contexto.
- GPU recomendadas: no probadas en este repositorio; los backends GPU de llama.cpp no fueron testeados. Por tamaño, cabría teóricamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100, pero sin validación documentada.
- Cabe en GPU de consumo: probable por tamaño (4,72 GiB en Q4_K_M), aunque no verificado.
- Opciones de despliegue: llama.cpp v0.7.0 con el parche `openpangu-r` incluido (obligatorio, ya que el upstream no soporta la arquitectura); oneDNN con el parche del repositorio; OpenVINO mediante traza directa de `ov.convert_model` del modelo HF. vLLM, TGI y Ollama no están documentados para este modelo.
- Latencia y throughput: en un contenedor de 16 CPUs con AVX-512, llama.cpp Q4_K_M alcanza 180,50 tok/s de prefill (pp512) y 13,39 tok/s de decodificación (tg128). OpenVINO llega a 226,68 tok/s de prefill con int8-sym, pero solo 5,20 tok/s de decodificación con int4-asym.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base que permitan una comparación de rendimiento con alternativas. La comparación se limita a características estructurales:

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| HelloSun/Experiment_1 (este) | ~8,29 B | no disponible | OpenPangu Model License 1.0 | GGUF Q4_K_M, requiere parche de llama.cpp |
| openpangu/openPangu-R-7B-2512 (base) | ~8,29 B | no disponible | OpenPangu Model License 1.0 | Safetensors BF16, repo oficial |
| Alternativas de ~7-8 B | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables con datos verificables de rendimiento, contexto o licencia que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Conversión no oficial: no está publicada ni respaldada por Huawei; el autor lo declara explícitamente. Para producción crítica conviene evaluar el modelo base oficial.
- Requiere un parche específico: el llama.cpp upstream no soporta la arquitectura `openpangu-r`; sin el parche para v0.7.0 el GGUF no carga.
- Solo probado en CPU x86-64 con AVX-512; los backends GPU no fueron testeados, por lo que el rendimiento en GPU es desconocido.
- Fiabilidad aritmética limitada en modo rápido: la model card documenta que en modo rápido respondió `123 + 456 = 679` (la referencia fp32 comete el mismo error, por lo que es comportamiento del modelo, no de la conversión); el modo lento sí da la respuesta correcta.
- Idiomas: la plantilla de chat y los ejemplos son en chino; no hay documentación sobre calidad en castellano u otros idiomas.
- Contexto: la longitud máxima no está documentada; la verificación se limita a prompts de hasta 484 tokens y un hecho a ~400 tokens de distancia.
- Licencia restrictiva: OpenPangu Model License Agreement 1.0, etiquetada como `other`; es necesario revisar sus términos antes de cualquier uso comercial, y la marca openPangu es propiedad de Huawei.
- Riesgo de alucinación: no evaluado en la información disponible; los modelos de ~8 B en tareas factuales abiertas presentan riesgo habitual.
- Sesgos: no documentados.
- Cuantización Q4_K_M: introduce pérdida de fidelidad distribucional; las mediciones de OpenVINO int4 muestran una caída de perplejidad de +3,9 y ~70% de coincidencia de argmax frente a f32, lo que sugiere degradación en tareas sensibles a la distribución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HelloSun/Experiment_1
- Modelo base: https://huggingface.co/openpangu/openPangu-R-7B-2512
- Estudio de backends de CPU (oneDNN/OpenVINO): `onednn/README.md` dentro del repositorio
- Resultados crudos: `onednn/results.csv` dentro del repositorio
- Parche de llama.cpp: `openpangu-r-llama.cpp-v0.7.0.patch` dentro del repositorio
- Script de compilación: `build_openpangu_r.sh` dentro del repositorio
- Licencia: `LICENSE` dentro del repositorio (OpenPangu Model License Agreement 1.0)
