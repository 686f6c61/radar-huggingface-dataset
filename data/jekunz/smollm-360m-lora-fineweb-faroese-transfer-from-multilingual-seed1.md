# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-multilingual-seed1

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-multilingual-seed1` es un adaptador LoRA publicado por el usuario jekunz sobre el modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`. El adaptador se ha entrenado para mejorar el rendimiento del modelo base en feroés (`fo`), un idioma de bajos recursos, mediante una estrategia de transferencia desde lenguas escandinavas continentales (danés, islandés, noruego bokmål, noruego nynorsk y sueco) presentes en el corpus FineWeb-2.

El modelo forma parte de un experimento de investigación sobre transferencia multilingüe: primero se ajusta conjuntamente sobre las porciones escandinavas de FineWeb-2 y después se especializa en la porción feroesa, con cinco épocas adicionales. El autor indica explícitamente que está destinado a su investigación y que no ha sido evaluado de forma amplia, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para producción.

Con 360 millones de parámetros en el modelo base y un adaptador LoRA de rango 256, el resultado es un modelo pequeño, ligero (repo de 0,4 GB) y con licencia Apache 2.0, lo que permite experimentación y uso comercial sin restricciones adicionales más allá de las del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 360M en el modelo base; el adaptador LoRA se suma como pesos adicionales (tamaño del repo: 0,4 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento (el contexto nativo del modelo base no se especifica en la informacion disponible) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base admite las cuantizaciones habituales de la comunidad, no documentadas aqui) |
| Idiomas soportados | Feroes (`fo`) como objetivo del ajuste; el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. El ajuste utiliza LoRA con rango 256, alpha 512 y módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, lo que cubre las proyecciones de las capas MLP y de atención. El entrenamiento se realizó en dos fases: una época sobre los datos escandinavos conjuntos de FineWeb-2 (danés, islandés, noruego bokmål, noruego nynorsk y sueco) y cinco épocas sobre la porción feroesa.

Los hiperparámetros documentados son: tasa de aprendizaje 8e-4 con scheduler coseno, warmup del 5 %, batch size 8 con 32 pasos de acumulación de gradiente (batch efectivo de 256), contexto máximo de 2048 tokens y una única GPU A100 de 40 GB. El seed 1 indica que se trata de una de tres ejecuciones con la misma configuración, pensadas para medir variabilidad del entrenamiento. No se documentan composición exacta del dataset, número de tokens ni técnicas de alineación adicionales (RLHF/DPO) más allá del ajuste supervisado sobre texto.

## Capacidades

- Generación de texto conversacional en feroés, heredada del ajuste sobre SmolLM2-360M-Instruct.
- Transferencia multilingüe desde lenguas escandinavas: el entrenamiento conjunto previo busca aprovechar el parecido léxico y morfológico con el feroés.
- Mantenimiento de las capacidades del modelo base en otros idiomas, aunque no se documenta su degradación o retención.
- Soporte de conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Capacidades de tool calling, agentes, razonamiento matemático o visión: no documentadas para este adaptador; dependen del modelo base y no han sido evaluadas.

## Casos de uso

- Experimentación académica en transferencia de lenguas de bajos recursos: el adaptador sirve como punto de partida para estudiar cómo el preentrenamiento en lenguas escandinavas mejora el feroés, comparando los tres seeds publicados.
- Generación de texto en feroés para prototipos: útil para crear borradores, resúmenes o respuestas conversacionales en un idioma con pocos recursos, siempre con revisión humana.
- Aumento de datos para NLP en feroés: generación de frases o paráfrasis sintéticas para ampliar corpus de entrenamiento de otros sistemas.
- Evaluación comparativa de adaptadores LoRA: al compartir configuración y variar solo el seed, permite medir la varianza del ajuste en tareas de generación.
- Investigación sobre olvido catastrófico: comparar el rendimiento en lenguas escandinavas antes y después del ajuste específico en feroés.
- Despliegue ligero en entornos con recursos limitados: con 360M de parámetros y un adaptador de 0,4 GB, cabe en GPUs de consumo y en CPU para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada: el modelo base de 360M en fp16 ocupa aproximadamente 0,7 GB; con el adaptador LoRA en fp16, alrededor de 1 GB adicional en memoria durante la carga. En cuantización de 8 bits o 4 bits (si se aplica al modelo base) el consumo baja a menos de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; A100, H100 o RTX 4090 son sobredimensionadas para este tamaño y solo se justifican para entrenamiento o evaluación por lotes.
- Cabe en GPU de consumo: sí, en GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4060 y superiores; también en CPU para inferencia lenta.
- Opciones de despliegue: `transformers` con PEFT para cargar el adaptador; llama.cpp y Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF; vLLM y TGI para servir el modelo fusionado.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-multilingual-seed1 | 360M + LoRA | 2048 (entrenamiento) | fo (objetivo), multilingue base | Apache 2.0 | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | no disponible en esta ficha | multilingue | Apache 2.0 | Hugging Face, ampliamente usado |
| Otros adaptadores LoRA para feroés sobre SmolLM2 | 360M + LoRA | no disponible | fo | Apache 2.0 (tipico) | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor declara que es para su investigación y que no ha sido evaluado ampliamente; no hay benchmarks que respalden su calidad.
- Riesgo de alucinación: al ser un modelo de 360M ajustado sobre texto web, la generación puede contener errores factuales, especialmente en feroés.
- Sesgos: los datos de FineWeb-2 son texto web sin filtrar por calidad ni sesgo; el adaptador puede reproducir sesgos presentes en el corpus.
- Cobertura de idioma limitada: el ajuste se centra en feroés; el rendimiento en otras lenguas puede haberse degradado respecto al modelo base (olvido catastrófico), aunque no se documenta.
- Contexto corto: el entrenamiento usó 2048 tokens; secuencias más largas pueden degradar la calidad.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base SmolLM2-360M-Instruct, que también es Apache 2.0.
- Sin garantías de producción: no hay información sobre estabilidad, latencia ni calidad en dominios específicos; se recomienda evaluación propia antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-multilingual-seed1
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Repositorio PEFT: https://github.com/huggingface/peft
- Paper de SmolLM2: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
