# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed2

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed2` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `jekunz/new_scandimerge_isplus_360`, que a su vez es un SmolLM2-360M-Instruct ajustado mediante un merge TIES de modelos entrenados en las porciones danesa, islandesa, noruego bokmål, noruego nynorsk y sueco de FineWeb-2, con mayor peso asignado al islandés. Sobre esa base escandinava se ha aplicado un ajuste adicional específico para feroés a partir de la porción `fo` de FineWeb-2.

El objetivo declarado por el autor es la transferencia lingüística de bajo recurso: aprovechar el parentesco entre el islandés (y en general el continuum escandinavo) y el feroés para mejorar el rendimiento en este último, un idioma con escasísimos recursos digitales. El resultado es un adaptador de rango 256 que se publica como uno de tres seeds (seed 2) de la misma configuración, lo que sugiere una intención de evaluar la varianza del entrenamiento.

Se trata de un artefacto de investigación, no de un modelo listo para producción: el autor indica explícitamente que no se ha evaluado de forma amplia. Su relevancia radica en documentar una receta reproducible de adaptación multilingüe de bajo recurso sobre un modelo compacto de 360 millones de parámetros, con licencia Apache 2.0 y formato PEFT compatible con la librería `transformers` + `peft`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct como base, adaptado mediante LoRA) |
| Parametros totales | 360M en el modelo base; el adaptador LoRA añade parámetros adicionales no especificados en la información disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada durante el entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; el modelo base admite cuantización estándar de la familia SmolLM2, pero no se documenta) |
| Idiomas soportados | Feroés (`fo`) como objetivo; el base se entrenó sobre danés, islandés, noruego bokmål, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es un SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. Sobre él se aplicó primero un merge TIES de modelos ajustados individualmente en las porciones danesa, islandesa, noruego bokmål, noruego nynorsk y sueco de FineWeb-2, con peso superior para el islandés (de ahí el sufijo `isplus`). Posteriormente se entrenó un adaptador LoRA sobre la porción feroesa de FineWeb-2, dando lugar al checkpoint que nos ocupa.

La configuración LoRA es de rango 256 con alpha 512 y módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj` (es decir, las proyecciones de las MLP y la proyección de salida de atención). El entrenamiento usó una época por idioma fuente y cinco épocas para el feroés, learning rate 8e-4 con scheduler coseno, warmup ratio 0,05, batch size 8 con acumulación de gradientes de 32 pasos (batch efectivo 256), longitud máxima de contexto de 2048 tokens, sobre una única A100 de 40 GB. Este checkpoint corresponde al seed 2 de tres seeds de la misma configuración, lo que permite estimar la variabilidad del ajuste.

No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de FineWeb-2, ni si se aplicaron etapas de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generación de texto conversacional en feroés, heredada del ajuste instruct del SmolLM2 base y del entrenamiento específico sobre FineWeb-2 `fo`.
- Comprensión y generación en las lenguas escandinavas del merge (danés, islandés, noruego bokmål, noruego nynorsk, sueco), aunque el adaptador está especializado en feroés.
- Razonamiento básico y respuesta a instrucciones de corta longitud, limitado por el tamaño de 360M parámetros.
- Generación de código y matemáticas elementales, como capacidades residuales del modelo base, sin garantías de calidad.
- Soporte de tool calling / function calling: no documentado en la información disponible; el modelo base SmolLM2-Instruct incluye plantillas de chat, pero no se especifica soporte de herramientas.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- **Investigación en transferencia lingüística de bajo recurso**: el adaptador sirve como punto de partida para estudiar cómo el parentesco entre islandés y feroés facilita el aprendizaje de este último con pocos datos. Se usaría cargando el modelo base `jekunz/new_scandimerge_isplus_360` y aplicando el adaptador con `peft`.
- **Generación de texto sintético en feroés**: útil para aumentar corpus de un idioma con escasos recursos digitales, por ejemplo para crear pares de instrucción-respuesta que luego se filtren manualmente.
- **Prototipado de asistentes conversacionales en feroés**: con 2048 tokens de contexto y un tamaño de 360M, puede desplegarse en CPU o GPU modesta para demos de chat en feroés, aceptando la calidad limitada propia de un modelo pequeño.
- **Evaluación comparativa de seeds**: al existir tres seeds de la misma configuración, permite medir la varianza del ajuste LoRA y establecer intervalos de confianza en experimentos de adaptación lingüística.
- **Aumento de datos para traducción automática**: generar texto feroés adicional para entrenar o afinar sistemas de traducción entre feroés y lenguas escandinavas, usando el modelo como generador de candidatos.
- **Análisis de sesgos y calidad en lenguas de bajos recursos**: servir como caso de estudio para medir cómo se degradan las capacidades instruct de un modelo pequeño al especializarlo en un idioma con pocos datos.
- **Despliegue en entornos con recursos limitados**: el tamaño de 360M permite ejecución en CPU con cuantización de 8 o 4 bits (aunque no se documentan los ficheros GGUF), adecuado para prototipos en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo base en fp16 ocupa aproximadamente 0,7 GB; en cuantización de 8 bits, alrededor de 0,4 GB; en 4 bits, en torno a 0,2 GB. El adaptador LoRA añade una fracción pequeña de parámetros (rango 256 sobre cuatro módulos), no cuantificada en la información disponible.
- **GPU recomendadas**: A100 40 GB fue la usada para el entrenamiento; para inferencia basta una GPU consumer como RTX 3060, RTX 4060 o incluso una GTX 1650 con cuantización.
- **¿Cabe en GPU consumer?** Sí, con holgura: cualquier GPU con 2 GB o más de VRAM puede alojar el modelo en fp16, y en CPU también es viable con cuantización.
- **Opciones de despliegue**: `transformers` + `peft` (carga del adaptador sobre el base), vLLM (si se fusiona el adaptador con el base), llama.cpp/Ollama (requiere convertir el modelo fusionado a GGUF, no se proporciona en el repo), TGI (tras fusionar).
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Por el tamaño, se espera un throughput alto en GPU (cientos de tokens por segundo en A100) y decenas de tokens por segundo en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SmolLM2-360M + LoRA feroés) | 360M + adaptador | 2048 | Feroés (objetivo), escandinavo | Apache 2.0 | Hugging Face (PEFT) |
| SmolLM2-360M-Instruct (HuggingFaceTB) | 360M | 8192 (según model card del base) | Principalmente inglés | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B-Instruct (HuggingFaceTB) | 1,7B | 8192 (según model card del base) | Principalmente inglés | Apache 2.0 | Hugging Face |
| Modelos específicos para feroés (p. ej. variantes de GPT-2 small ajustadas) | ~124M–360M | Variable | Feroés | Variable | Variable en Hugging Face |

La comparación con el SmolLM2-360M-Instruct original es la más directa: este adaptador sacrifica cobertura idiomática general a cambio de especialización en feroés. Frente a modelos mayores como SmolLM2-1.7B, la diferencia de parámetros (360M frente a 1,7B) implica menor capacidad de razonamiento y menor calidad en tareas complejas, pero también menor coste de despliegue. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- **Modelo no evaluado**: el autor indica explícitamente que es para su investigación y que no se ha evaluado ampliamente; no debe usarse en producción sin una evaluación propia.
- **Riesgo de alucinación**: un modelo de 360M parámetros ajustado sobre datos web (FineWeb-2) tiene propensión alta a generar contenido plausible pero falso, especialmente en un idioma con pocos datos de alta calidad.
- **Sesgos**: los datos de FineWeb-2 son web crawls sin filtrar por sesgo; es probable que el modelo reproduzca estereotipos y sesgos presentes en la web, sin que se documente ningún proceso de mitigación.
- **Cobertura limitada de idiomas**: el adaptador está especializado en feroés; su rendimiento en las demás lenguas escandinavas puede degradarse respecto al base, y no se garantiza calidad en inglés u otros idiomas.
- **Contexto corto**: 2048 tokens es una ventana reducida para conversaciones largas o documentos extensos, y el entrenamiento se realizó con esa longitud máxima.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un adaptador sobre un base también Apache 2.0, conviene verificar la licencia del base y de los datos de FineWeb-2 (que tiene sus propios términos de uso) antes de explotarlo comercialmente.
- **Formato**: al ser un adaptador PEFT, requiere cargar el modelo base `jekunz/new_scandimerge_isplus_360`; no es un checkpoint autónomo y no se ofrecen pesos fusionados ni GGUF en el repositorio.
- **Reproducibilidad**: es uno de tres seeds; los resultados pueden variar entre seeds, y no se documenta la varianza observada.

## Enlaces

- [Hugging Face: jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed2](https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed2)
- [Modelo base: jekunz/new_scandimerge_isplus_360](https://huggingface.co/jekunz/new_scandimerge_isplus_360)
- [Dataset: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [SmolLM2-360M-Instruct (modelo base original)](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
- [Librería PEFT](https://github.com/huggingface/peft)
