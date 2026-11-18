# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed2

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed2` es un adaptador LoRA (PEFT) sobre `jekunz/new_scandimerge_equal_360`, un modelo base derivado de SmolLM2-360M-Instruct. Lo desarrolla el usuario de Hugging Face `jekunz` como parte de una línea de investigación sobre transferencia lingüística entre lenguas escandinavas y feroés. El objetivo concreto es evaluar si un modelo pequeño preentrenado en danés, islandés, noruego bokmål, noruego nynorsk y sueco puede transferir conocimiento útil al feroés (`fo`) mediante un ajuste fino ligero con datos de FineWeb-2.

La relevancia de esta ficha es doble. Por un lado, documenta un experimento reproducible de adaptación de bajo rango (rank 256, alpha 512) sobre un modelo de 360 millones de parámetros, un tamaño que cabe en GPUs de consumo. Por otro lado, ilustra una práctica habitual en investigación multilingüe de bajos recursos: aprovechar el parentesco genealógico entre lenguas nórdicas para reducir la cantidad de datos necesarios en la lengua objetivo. El autor advierte explícitamente de que el modelo está destinado a su investigación y no ha sido evaluado de forma amplia.

Se trata de un adaptador, no de un modelo completo: los pesos publicados son del LoRA y requieren cargar el modelo base `jekunz/new_scandimerge_equal_360` para su uso. El repositorio ocupa 0,4 GB y la licencia declarada es Apache 2.0. No hay métricas de rendimiento publicadas ni descargas registradas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA |
| Parámetros totales | 360M en el modelo base; el adaptador LoRA añade parámetros adicionales (no disponibles en la información proporcionada) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento (contexto nativo de SmolLM2-360M no disponible en la información proporcionada) |
| Tipos de cuantización | No disponible (el adaptador se publica en safetensors; la cuantización dependerá del modelo base y del runtime) |
| Idiomas soportados | Feroés (`fo`) como objetivo; el base se entrenó con danés, islandés, noruego bokmål, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. El autor construyó primero un modelo intermedio (`new_scandimerge_equal_360`) mediante un merge TIES con pesos iguales de cinco modelos entrenados sobre las porciones danesa, islandesa, noruega bokmål, noruega nynorsk y sueca de FineWeb-2. Sobre ese merge se realizó un ajuste fino con LoRA de rango 256 y alpha 512, apuntando a las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj`.

El entrenamiento usó una época por lengua fuente y cinco épocas para el feroés, con tasa de aprendizaje 8e-4, scheduler coseno, warmup del 5 %, batch size 8, acumulación de gradientes de 32 pasos (batch efectivo 256) y longitud máxima de contexto de 2048 tokens. Se ejecutó en una única A100 de 40 GB. La semilla es la 2, una de tres semillas para esta configuración. No se documentan técnicas de alineación adicionales (RLHF, DPO) ni detalles sobre el volumen exacto de tokens de FineWeb-2 empleados.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la instrucción de SmolLM2-360M-Instruct y adaptada con datos de FineWeb-2.
- Transferencia multilingüe desde lenguas escandinavas continentales e insulares (danés, islandés, noruego, sueco) hacia el feroés.
- Generación de texto general y respuesta a instrucciones básicas, limitada por el tamaño de 360M parámetros.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño del modelo y la falta de evaluación lo hacen poco probable en producción.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Investigación en transferencia entre lenguas nórdicas: el adaptador sirve como punto de partida reproducible para medir cuánto conocimiento del merge escandinavo se transfiere al feroés con cinco épocas de ajuste.
- Generación de texto sintético en feroés para aumento de datos: puede producir borradores o paráfrasis a pequeña escala que luego se filtren manualmente antes de usarse en otros entrenamientos.
- Prototipado de asistentes conversacionales en feroés: con 360M parámetros y contexto de 2048 tokens, permite validar interfaces y flujos de diálogo en una GPU de consumo antes de invertir en modelos mayores.
- Experimentos de ablación de hiperparámetros LoRA: al publicarse tres semillas de la misma configuración, facilita medir la varianza del ajuste fino en un escenario de bajos recursos.
- Evaluación comparativa de merges TIES: el modelo base y el adaptador permiten estudiar el efecto de combinar modelos por lengua frente a entrenar directamente en la lengua objetivo.
- Docencia y divulgación: un caso práctico y de bajo coste para explicar PEFT, merges de modelos y adaptación a lenguas de bajos recursos en cursos de PLN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M en fp16 requiere aproximadamente 0,7-0,8 GB de pesos; en cuantización de 8 bits alrededor de 0,4 GB, y en 4 bits unos 0,2-0,3 GB. A ello hay que sumar la caché KV para 2048 tokens y el overhead del runtime (típicamente 1-2 GB adicionales en total).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para fp16; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. El entrenamiento original usó una A100 de 40 GB.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas modernas (GTX 1650 4 GB en adelante), así como en CPU con llama.cpp.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` + `peft`; para inferencia optimizada puede fusionarse el adaptador en los pesos base y exportarse a GGUF para llama.cpp u Ollama, o servirse con vLLM o TGI tras la fusión.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-360M + LoRA feroés) | 360M + LoRA | 2048 (entrenamiento) | Feroés (objetivo) | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-360M-Instruct | 360M | No disponible en la información proporcionada | Principalmente inglés | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos nórdicos de mayor tamaño (p. ej. familia NorMistral o Viking) | No disponible | No disponible | Lenguas nórdicas | Varía según modelo | No disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo está destinado a su investigación y no ha sido evaluado de forma amplia; no debe usarse en producción sin una evaluación propia.
- Riesgo elevado de alucinación y de degradación gramatical en feroés por el tamaño reducido (360M) y por el ajuste con datos web de FineWeb-2, que pueden contener ruido.
- El contexto de entrenamiento es de solo 2048 tokens, lo que limita conversaciones y documentos largos.
- El adaptador solo declara feroés como idioma; el comportamiento en otras lenguas no está caracterizado y puede mezclar idiomas.
- Sesgos conocidos: no documentados, pero al entrenarse sobre FineWeb-2 hereda los sesgos y la distribución de la web; no hay filtrado ni alineación adicional documentada.
- Licencia Apache 2.0 permite uso comercial, pero al ser un adaptador sobre un modelo base, deben respetarse también las condiciones del base y de SmolLM2-360M-Instruct.
- Sin descargas ni validación de la comunidad: la reproducibilidad depende de que el modelo base `jekunz/new_scandimerge_equal_360` siga disponible.

## Enlaces

- [Hugging Face: jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed2](https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed2)
- [Modelo base: jekunz/new_scandimerge_equal_360](https://huggingface.co/jekunz/new_scandimerge_equal_360)
- [Dataset: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
- [PEFT (librería)](https://github.com/huggingface/peft)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
