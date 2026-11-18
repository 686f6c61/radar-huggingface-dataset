# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed1

## Resumen

Este repositorio contiene un adaptador LoRA sobre SmolLM2-135M-Instruct, afinado secuencialmente primero en el subconjunto de noruego nynorsk y después en el de feroés del corpus FineWeb-2. Lo desarrolla el usuario jekunz como parte de su investigación sobre transferencia lingüística entre lenguas germánicas nórdicas de bajos recursos, y se publica como uno de los tres seeds de una misma configuración experimental. El modelo base es un transformer decoder-only de 135 millones de parámetros con ventana de contexto nativa de 8.192 tokens, aunque el entrenamiento de este adaptador se ha limitado a 2.048 tokens.

El interés principal reside en el enfoque de transferencia: en lugar de partir directamente del modelo instruct original, el adaptador se construye sobre un LoRA previo ya entrenado en nynorsk, lo que aprovecha la proximidad tipológica entre ambas lenguas para mejorar la adaptación al feroés con un coste computacional mínimo. El resultado es un adaptador de rango 256 y unos 0,2 GB de pesos, entrenado en una única A100 de 40 GB.

Es relevante como pieza de investigación reproducible: el autor advierte explícitamente de que el modelo no ha sido evaluado de forma amplia, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 135 M en el modelo base; el adaptador LoRA se suma sobre los pesos congelados (tamano del repo: 0,2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens durante el entrenamiento del adaptador; el modelo base soporta 8.192 tokens |
| Tipos de cuantizacion | No disponible (el repo publica pesos safetensors del adaptador; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | Feroés (fo); entrenado con transferencia desde noruego nynorsk |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base SmolLM2-135M-Instruct es un transformer decoder-only con atención causal estándar, diseñado por Hugging Face para ejecución en dispositivos de bajos recursos. Sobre él se aplica un adaptador LoRA con rango 256, alpha 512 y módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de las capas MLP y de salida de atención. El adaptador se inicializa desde otro adaptador previo entrenado en nynorsk (`jekunz/smollm-135m-lora-fineweb-norwegian-nynorsk`), lo que constituye el mecanismo de transferencia entre lenguas.

El entrenamiento se realizó en dos fases: una época sobre el subconjunto de noruego nynorsk de FineWeb-2 y cinco épocas sobre el subconjunto de feroés del mismo corpus. Se usó tasa de aprendizaje 8e-4 con scheduler coseno, warmup del 5 %, batch size 8 con acumulación de gradientes de 32 pasos (batch efectivo 256), longitud máxima de 2.048 tokens y una sola GPU A100 de 40 GB. El seed empleado es el 1, uno de los tres seeds de esta configuración. No se documenta el número total de tokens procesados ni si hubo etapas de RLHF o DPO; el corpus es texto crudo de FineWeb-2, por lo que el ajuste es de tipo continued pretraining vía LoRA y no una alineación instruct adicional.

## Capacidades

- Generación de texto en feroés, heredando la capacidad instruct del modelo base SmolLM2-135M-Instruct.
- Conversación multi-turno básica, dado el pipeline `text-generation` con tag `conversational`.
- Adaptación a una lengua de bajos recursos mediante transferencia desde nynorsk, con vocabulario y morfología cercanos.
- Capacidad multilingüe limitada al feroés declarado y al conocimiento residual del modelo base en inglés y otras lenguas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso específico.
- No se documenta modo thinking, visión, audio ni otras modalidades.

## Casos de uso

- Investigación sobre transferencia entre lenguas nórdicas: el adaptador sirve como punto de comparación para medir cuánto ayuda un preentrenamiento en nynorsk antes de afinar en feroés, con tres seeds disponibles para estimar varianza.
- Generación de texto sintético en feroés para aumento de datos: dado el escaso volumen de corpus en esta lengua, el modelo puede producir borradores que luego se filtran manualmente.
- Experimentos de bajo coste en hardware modesto: al ser un adaptador sobre 135 M de parámetros, se puede cargar y ejecutar en GPU de consumo para prototipado rápido.
- Evaluación de la calidad de FineWeb-2 en feroés: el modelo permite sondear qué tan representativo es el subconjunto de feroés del corpus midiendo la perplejidad o la coherencia de las generaciones.
- Base para futuros adaptadores en otras lenguas nórdicas: el pipeline nynorsk → feroés es replicable para islandés o feroés → otras lenguas de la familia.
- Reproducibilidad de experimentos LoRA: la configuración completa (rango, alpha, módulos, hiperparámetros) está documentada, lo que facilita replicar o extender el estudio con otros seeds o corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo «has not been evaluated more broadly yet».

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 para el modelo base de 135 M más el adaptador; en la práctica, unos 0,3-0,5 GB con el adaptador cargado.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU con llama.cpp u Ollama si se convierte el adaptador a GGUF (no se documenta dicha conversión).
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM con soporte LoRA, TGI con adaptadores; llama.cpp y Ollama requerirían fusionar el adaptador con el modelo base y convertir a GGUF, paso no documentado por el autor.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo se espera latencia de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-135M + LoRA feroés) | 135 M base + LoRA | 2.048 entrenamiento / 8.192 base | Feroés | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-135M-Instruct (modelo base) | 135 M | 8.192 | Inglés principalmente | Apache 2.0 | Hugging Face, ampliamente usado |
| Adaptador nynorsk del mismo autor | 135 M base + LoRA | 2.048 | Noruego nynorsk | Apache 2.0 | Hugging Face |
| Modelos específicos para feroés de mayor tamano | No disponible | No disponible | Feroés | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental sin evaluación amplia: el autor lo declara explícitamente como material de investigación, no validado para uso general.
- Riesgo elevado de alucinación y de texto incoherente, especialmente por el tamaño reducido del modelo base y el ajuste sobre texto crudo de FineWeb-2 sin etapa de alineación adicional.
- Contexto efectivo limitado a 2.048 tokens durante el entrenamiento, muy por debajo de la ventana nativa del modelo base.
- Cobertura lingüística restringida al feroés; el rendimiento en otras lenguas no está caracterizado y puede degradarse respecto al modelo base.
- Sesgos heredados de FineWeb-2, un corpus web sin filtrar por calidad ni sesgo; no se documenta ningún proceso de mitigación.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin validación previa.
- Un solo seed publicado en este repo (seed 1); la varianza entre seeds no está cuantificada en la información disponible.
- No se documentan cuantizaciones ni conversiones a GGUF, lo que limita el despliegue en entornos sin soporte PEFT.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed1
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-norwegian-nynorsk
- Modelo base original SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
