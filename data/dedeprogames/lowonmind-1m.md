# DedeProGames/LowOnMind-1M

## Resumen

LowOnMind-1M es un modelo de lenguaje decoder-only de 985.152 parámetros, desarrollado por DedeProGames como parte de un experimento controlado de escalado. Preentrenado desde cero sobre 200 millones de tokens del subconjunto sample-10BT de HuggingFaceFW/fineweb-edu, este modelo representa una ampliación 3,3 veces mayor que su predecesor LowOnMind-300k, manteniendo idénticos tokenizador, dataset, presupuesto de tokens y programación de entrenamiento. El objetivo es aislar el efecto del número de parámetros sobre la pérdida de validación y los benchmarks downstream.

La arquitectura hereda características de DynamicMind-Mini: atención con GQA, SwiGLU, RMSNorm, embeddings atados, QK-Norm por cabeza, RoPE precomputado con re-expansión automática y proyecciones residuales inicializadas con std / sqrt(2 * num_layers). Con una ventana de contexto de 512 tokens y un vocabulario byte-level de 1024 tokens, el modelo está diseñado para estudiar los límites del escalado en regímenes de datos extremadamente escasos (203 tokens por parámetro, muy por debajo del ratio óptimo de Chinchilla). Su relevancia radica en ser un caso de estudio reproducible sobre cómo la capacidad de un modelo diminuto se distribuye entre ortografía, formación de palabras y capacidades semánticas, más que en su utilidad práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, SwiGLU, RMSNorm, QK-Norm, RoPE precomputado |
| Parametros totales | 985.152 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en float16, sin cuantizaciones publicadas) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 9 capas ocultas, tamaño de hidden de 96, intermediate size de 256 (factor 2,67x), 6 cabezas de consulta y 2 de clave/valor (GQA), con head_dim de 16. Usa SwiGLU como activación, RMSNorm para normalización, embeddings atados entre entrada y salida, y QK-Norm por cabeza para estabilizar el entrenamiento. El RoPE se precomputa y se re-expande automáticamente si se supera la longitud de contexto. Las proyecciones residuales se inicializan con una desviación estándar escalada por sqrt(2 * num_layers).

El entrenamiento se realizó sobre 200M tokens de fineweb-edu (sample-10BT), con secuencias de 512 tokens, batch de 64, optimizador AdamW (betas 0.9/0.95, weight decay 0.1), learning rate pico de 1.5e-3 con decaimiento coseno hasta 1.5e-4 y 250 pasos de warmup. Se usó precisión float16 con GradScaler en una Tesla T4, completando el entrenamiento en 11 minutos. La pérdida de entrenamiento y validación se mantuvieron correlacionadas durante todo el proceso, lo que indica que el modelo está limitado por parámetros y no por datos. No se aplicaron técnicas de RLHF ni DPO.

## Capacidades

- Generacion de texto basica: produce texto coherente a nivel local, con cambios de registro segun el prompt (por ejemplo, prompts con fechas generan formato bibliografico).
- Formacion de palabras: alcanza un 98,0% de palabras reales en ingles sobre muestras incondicionales, cerca del techo del corpus (98,4%).
- Razonamiento logico basico: obtiene un 28% de aciertos en la categoria logical_reasoning del BananaMind Base Bench 1.1, por encima del azar.
- Seguimiento de contexto: mejora notablemente respecto al modelo de 300k (24% vs 14% en context_tracking), aunque sigue siendo bajo en terminos absolutos.
- Capacidad multilingue: no disponible, solo entiende ingles.
- Tool calling / function calling: no soportado.
- Modo agente o razonamiento multi-paso: no soportado.

## Casos de uso

- Investigacion academica sobre scaling laws: sirve como punto de comparacion controlado para estudiar como el numero de parametros afecta a la perdida, la perplejidad y la formacion de palabras cuando el presupuesto de tokens es fijo. Los investigadores pueden reproducir el experimento y extenderlo a otros tamanos.
- Educacion en arquitecturas transformer: por su tamano reducido y entrenamiento rapido (11 minutos en una T4), es util para ensenar conceptos como GQA, SwiGLU, RMSNorm o QK-Norm en cursos de deep learning, permitiendo a los estudiantes inspeccionar pesos y activaciones sin necesidad de hardware caro.
- Benchmarking de metricas de evaluacion: su comportamiento en el BananaMind Base Bench 1.1 permite probar metodologias de evaluacion (como la seleccion por log-probabilidad condicional) en un entorno de bajo coste y alta reproducibilidad.
- Pruebas de tokenizacion byte-level: al usar un vocabulario de 1024 tokens, es un banco de pruebas para estudiar como los modelos ensamblan palabras a partir de fragmentos y como afecta la tasa de palabras reales a la calidad percibida.
- Desarrollo de tecnicas de regularizacion o inicializacion: su arquitectura con inicializacion residual escalada y QK-Norm permite validar rapidamente variantes de estas tecnicas antes de aplicarlas a modelos grandes.
- Generacion de texto de juguete en demos o prototipos: aunque no es util para produccion, puede servir para demostraciones interactivas de generacion de texto en entornos con recursos minimos, como una Raspberry Pi o un navegador via WebAssembly.

## Benchmarks y rendimiento

La model card reporta resultados en el BananaMind Base Bench 1.1, un benchmark de 350 items de continuacion en ingles. La puntuacion se basa en seleccionar la continuacion con mayor log-probabilidad media condicional. Tambien se reportan metricas de validacion y tasa de palabras reales.

| Metrica | LowOnMind-1M | LowOnMind-300k | Delta |
|---|---:|---:|---:|
| Perdida de validacion | 2,9908 | 3,2982 | -0,3074 |
| Perplejidad de validacion | 19,90 | 27,06 | -7,16 |
| Bits por caracter | 1,836 | 2,030 | -0,194 |
| Tasa de palabras reales | 98,0% | no reportado | - |

| Categoria (BananaMind Base Bench 1.1) | LowOnMind-1M | LowOnMind-300k | Delta | Elo (1M) |
|---|---:|---:|---:|---:|
| language_completion | 52,0% | 46,0% | +6,0pp | 937 |
| logical_reasoning | 28,0% | 24,0% | +4,0pp | 925 |
| context_tracking | 24,0% | 14,0% | +10,0pp | 770 |
| code_completion | 20,0% | 14,0% | +6,0pp | 851 |
| world_knowledge | 22,0% | 22,0% | +0,0pp | 752 |
| quantitative | 28,0% | 32,0% | -4,0pp | 913 |
| commonsense | 28,0% | 34,0% | -6,0pp | 786 |

| Metrica global | LowOnMind-1M | LowOnMind-300k |
|---|---:|---:|
| Elo global | 843 | 833 |
| Elo del azar | 805 | 805 |
| Precision bruta | 28,9% | 26,6% |
| IC 95% | [24,1%, 33,6%] | [22,0%, 31,2%] |
| z vs. azar | +1,67 | +0,69 |

No se han publicado resultados comparativos con otros modelos de tamano similar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en float16 (985.152 parametros * 2 bytes ≈ 1,97 MB de pesos, mas overhead de activaciones y optimizador). Cabe en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una Tesla T4 (16 GB) es mas que suficiente. Tambien se puede ejecutar en CPU sin problemas.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo (GTX 1060, RTX 3060, etc.) puede ejecutarlo con margen amplio.
- Opciones de despliegue: transformers (pipeline de text-generation), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), o directamente con PyTorch en CPU.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamano, la generacion es practicamente instantanea en GPU y de pocos milisegundos por token en CPU moderna.

## Comparativa con modelos similares

No existen modelos publicados con exactamente las mismas caracteristicas (vocabulario de 1024 tokens, contexto 512, entrenados con 200M tokens). La comparacion directa mas relevante es con su predecesor LowOnMind-300k, que comparte tokenizador, dataset y presupuesto de tokens.

| Modelo | Parametros | Contexto | Vocabulario | Perdida validacion | Perplejidad | Licencia |
|---|---:|---:|---:|---:|---:|---|
| LowOnMind-1M | 985.152 | 512 | 1024 | 2,9908 | 19,90 | Apache-2.0 |
| LowOnMind-300k | 296.960 | 512 | 1024 | 3,2982 | 27,06 | Apache-2.0 |

Otros modelos tiny como TinyLlama (1,1B parametros) o SmolLM (135M-1,7B) no son comparables directamente por su tokenizador, dataset y tamano muy superiores. No se dispone de datos de rendimiento de estos modelos en los mismos benchmarks.

## Limitaciones y advertencias

- Modelo experimental: disenado exclusivamente para estudiar limites de escalado, no para uso en produccion. No tiene capacidades semanticas ni referenciales coherentes.
- Alucinacion severa: genera texto fluido pero sin significado real; inventa nombres, fechas y conceptos (ejemplos en la model card: "sculieness", "lockholm", "paradigmar").
- Contexto muy corto: 512 tokens, insuficiente para tareas que requieran memoria a largo plazo.
- Solo ingles: no soporta otros idiomas.
- Sin tool calling ni capacidades de agente: no puede interactuar con APIs ni ejecutar funciones.
- Rendimiento en benchmarks por debajo del azar en varias categorias: en world_knowledge, quantitative y commonsense obtiene resultados iguales o inferiores al azar, lo que indica ausencia de conocimiento real.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para aplicaciones comerciales reales por sus limitaciones.
- No se proporcionan cuantizaciones oficiales ni formatos GGUF; el unico formato disponible es safetensors en float16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DedeProGames/LowOnMind-1M
- Modelo predecesor: https://huggingface.co/DedeProGames/LowOnMind-300k
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Benchmark BananaMind Base Bench 1.1: https://huggingface.co/datasets/BananaMind/BananaMind-Base-Bench-1.1
- Perfil del autor: https://huggingface.co/DedeProGames
- Modelo base de arquitectura (DynamicMind-Mini): https://huggingface.co/DedeProGames/DynamicMind-Mini
