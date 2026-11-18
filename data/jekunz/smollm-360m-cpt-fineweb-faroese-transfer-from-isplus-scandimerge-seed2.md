# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed2

## Resumen

SmolLM-360M-CPT-Faroese es un modelo de lenguaje de 361.821.120 parámetros derivado de SmolLM2-360M-Instruct y ajustado por el usuario jekunz para la generación de texto en feroés. Se construye en dos fases: primero un ajuste sobre una fusión TIES (con mayor peso en islandés) de modelos entrenados con porciones de danés, islandés, noruego bokmål, noruego nynorsk y sueco de FineWeb-2, y después un ajuste sobre la porción de feroés del mismo corpus. El resultado es un modelo pequeño, de licencia Apache 2.0 y formato safetensors, pensado para investigación y para cubrir una lengua de bajos recursos como el feroés.

La relevancia del modelo radica en su estrategia de transferencia interlingüe: parte de un modelo multilingüe escandinavo relativamente bien dotado y lo especializa en feroés, un idioma con escasa representación en los corpus de entrenamiento habituales. Con solo 360 millones de parámetros, el modelo cabe en GPUs de consumo y puede desplegarse con herramientas estándar del ecosistema transformers, lo que lo hace útil como banco de pruebas para experimentos de adaptación lingüística de bajo coste.

El autor indica explícitamente que el modelo está destinado a su propia investigación y que no ha sido evaluado de forma amplia, por lo que debe considerarse un artefacto experimental más que un modelo listo para producción. No se han publicado resultados de benchmarks ni métricas de calidad en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, derivado de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | feroés (fo); entrenado con datos de danés, islandés, noruego bokmål, noruego nynorsk, sueco y feroés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama, inicializado desde SmolLM2-360M-Instruct (361.821.120 parámetros) y ajustado mediante entrenamiento continuado (CPT) en dos etapas. La primera etapa parte de una fusión TIES de modelos entrenados sobre las porciones de danés, islandés, noruego bokmål, noruego nynorsk y sueco de FineWeb-2, con mayor peso asignado al islandés; la segunda etapa continúa el entrenamiento sobre la porción de feroés de FineWeb-2. Esta secuencia busca aprovechar el conocimiento multilingüe escandinavo antes de especializar el modelo en la lengua objetivo.

Los hiperparámetros publicados son: 1 época por idioma de origen y 5 épocas en feroés, tasa de aprendizaje 5e-4 con scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulación de gradientes (batch efectivo 256), longitud máxima de contexto de 2048 tokens y semilla 2 (una de tres semillas de entrenamiento para esta configuración). El entrenamiento se ejecutó en una única GPU A100 de 40 GB. No se especifica el número total de tokens procesados, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en feroés, incluyendo texto conversacional (el pipeline declarado es text-generation y la etiqueta conversational está presente).
- Continuación y finalización de texto sobre dominios cubiertos por FineWeb-2, es decir, texto web de propósito general.
- Comprensión y generación limitada en otras lenguas escandinavas (danés, islandés, noruego bokmål, noruego nynorsk y sueco) por herencia del entrenamiento previo a la especialización en feroés.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al feroés y, de forma secundaria, a las lenguas escandinavas usadas en la etapa de transferencia.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Generación de texto en feroés para prototipos: el modelo puede producir borradores de texto en feroés con una ventana de 2048 tokens, adecuado para experimentos de investigación sobre lenguas de bajos recursos donde no se requiere calidad de producción.
- Aumento de datos para PLN en feroés: puede generar variantes de frases y párrafos que sirvan como material adicional para entrenar o evaluar otros sistemas en esta lengua.
- Investigación en transferencia interlingüe: sirve como caso de estudio reproducible de la estrategia de fusión TIES seguida de CPT sobre una lengua de bajos recursos, con hiperparámetros y semilla documentados.
- Clasificación y etiquetado asistido por generación: al ser un modelo conversacional pequeño, puede adaptarse mediante prompting a tareas de etiquetado o extracción simple sobre texto feroés en entornos de investigación.
- Despliegue en hardware limitado: con 361 millones de parámetros cabe en GPUs de consumo y puede ejecutarse con transformers o Text Generation Inference, útil para demos locales y pruebas de concepto.
- Evaluación comparativa de modelos pequeños multilingües: sirve como línea base en experimentos que comparen modelos de ~360M parámetros sobre feroés frente a alternativas multilingües de mayor tamaño.
- Generación de texto conversacional de dominio general: el pipeline text-generation y la etiqueta conversational permiten usarlo en chatbots experimentales en feroés, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,7-0,8 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos de 2048 tokens.
- VRAM estimada en cuantización de 8 bits: en torno a 0,4 GB para los pesos; en 4 bits, en torno a 0,2 GB (estimaciones a partir del número de parámetros, no verificadas con variantes publicadas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento documentado se realizó en una A100 de 40 GB, pero la inferencia es viable en GPUs mucho menores.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (etiqueta text-generation-inference y endpoints_compatible). No se han publicado variantes GGUF, por lo que llama.cpp u Ollama requerirían conversión propia.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM-360M-CPT-Faroese (este modelo) | 361.821.120 | 2048 | feroés (con transferencia escandinava) | Apache 2.0 | Hugging Face, safetensors |
| SmolLM2-360M-Instruct (modelo base) | ~360M | no disponible en la información proporcionada | multilingüe (no detallado) | Apache 2.0 (según el ecosistema SmolLM2) | Hugging Face |
| jekunz/smollm360m-da05-is1-nno05-nob05-sv05-ties (modelo base inmediato) | ~360M | no disponible | danés, islandés, noruego, sueco | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor declara que el modelo está destinado a su investigación y que no ha sido evaluado de forma amplia; no debe usarse en producción sin una evaluación propia.
- Riesgo de alucinación inherente a un modelo de 360M de parámetros entrenado sobre texto web; la calidad factual en feroés puede ser baja.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida: el feroés es una lengua de bajos recursos y el corpus FineWeb-2 puede contener ruido, lo que afecta a la fluidez y corrección.
- Posibles sesgos presentes en los datos web de FineWeb-2, sin filtrado documentado específico.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones y de garantías hace desaconsejable ese uso sin validación previa.
- No se han publicado variantes cuantizadas ni métricas de latencia, lo que complica la planificación de despliegues.
- El modelo es una de tres semillas de entrenamiento de la misma configuración; los resultados pueden variar entre semillas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-isplus-scandimerge-seed2
- Modelo base inmediato: https://huggingface.co/jekunz/smollm360m-da05-is1-nno05-nob05-sv05-ties
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia del modelo base): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
