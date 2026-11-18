# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed1

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed1` es un adaptador LoRA (PEFT) sobre una fusión TIES de modelos SmolLM2-360M-Instruct entrenados con las porciones danesa, islandesa, noruega (bokmål y nynorsk) y sueca de FineWeb-2, seguida de un ajuste específico sobre la porción feroesa del mismo corpus. Lo desarrolla el usuario de Hugging Face `jekunz` como parte de su investigación personal sobre transferencia lingüística entre lenguas escandinavas y el feroés.

El objetivo es explorar si un modelo pequeño (360 M de parámetros) puede adquirir competencia en feroés, un idioma de bajos recursos, aprovechando el conocimiento transferido desde lenguas escandinavas emparentadas. Se trata de un experimento de investigación, sin evaluación amplia publicada, distribuido como adaptador LoRA en safetensors sobre el modelo base `jekunz/new_scandimerge_equal_360`.

Es relevante por su enfoque metodológico: combina model merging (TIES con pesos iguales) y ajuste supervisado LoRA sobre datos web filtrados de FineWeb-2, con tres semillas de entrenamiento (esta es la semilla 1). El resultado es un artefacto de bajo coste computacional (una sola A100 de 40 GB) útil para estudiar transferencia multilingüe en modelos compactos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 360 M en el modelo base; el adaptador LoRA añade parámetros adicionales (cantidad exacta no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors del adaptador; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | Feroés (fo); el modelo base fue entrenado con danés, islandés, noruego bokmål, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-360M-Instruct, un transformer decoder-only de 360 M de parámetros. Sobre él se aplicó primero una fusión TIES con pesos iguales de cinco modelos entrenados en las porciones danesa, islandesa, noruego bokmål, noruego nynorsk y sueca de FineWeb-2, dando lugar al checkpoint `jekunz/new_scandimerge_equal_360`. Posteriormente se ajustó con LoRA sobre la porción feroesa de FineWeb-2.

La configuración LoRA usa rango 256, alpha 512 y módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`. El entrenamiento empleó 1 época por lengua fuente y 5 épocas en feroés, learning rate 8e-4 con scheduler coseno, warmup ratio 0.05, batch size 8, acumulación de gradientes 32 (batch efectivo 256), contexto máximo de 2048 tokens y una única GPU A100 de 40 GB. Esta ficha corresponde a la semilla 1 de tres configuraciones idénticas. No se documentan etapas de RLHF o DPO ni detalles sobre el volumen exacto de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la naturaleza Instruct de SmolLM2 y del ajuste sobre FineWeb-2 feroés.
- Transferencia lingüística desde lenguas escandinavas emparentadas (danés, islandés, noruego, sueco) hacia el feroés.
- Generación de texto general (pipeline `text-generation`).
- Soporte de tool calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base SmolLM2-Instruct tiene capacidades limitadas por su tamaño.
- Capacidades multilingües: limitadas al feroés en esta variante; el modelo base cubre lenguas escandinavas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre transferencia entre lenguas emparentadas: permite comparar el rendimiento en feroés de un modelo ajustado tras una fusión TIES escandinava frente a alternativas entrenadas desde cero, usando las tres semillas publicadas para medir varianza.
- Generación de texto sintético en feroés: útil para aumentar corpus de bajos recursos en tareas de aumento de datos, dado que el modelo fue expuesto a la porción feroesa de FineWeb-2.
- Experimentos de *model merging*: sirve como punto de partida para estudiar el efecto de distintas ponderaciones TIES o de distintos órdenes de ajuste sobre un modelo de 360 M.
- Prototipado de asistentes conversacionales en feroés: con 360 M de parámetros y contexto de 2048 tokens, puede desplegarse en hardware modesto para demos y pruebas de concepto.
- Evaluación de técnicas LoRA en modelos pequeños: la configuración (r=256, alpha=512, módulos de proyección) es un caso de estudio reproducible con una sola A100.
- Baseline para comparativas multilingües: al estar disponible con licencia Apache 2.0 y pesos safetensors, puede integrarse en pipelines de evaluación de modelos escandinavos sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo está destinado a su investigación y que no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360 M en precisión completa (fp32) ocupa aproximadamente 1,4 GB; en fp16/bf16, unos 0,7 GB; en cuantización de 8 bits, unos 0,4 GB; en 4 bits, unos 0,2 GB. El adaptador LoRA añade una sobrecarga pequeña (tamaño del repositorio: 0,4 GB).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en fp16; una A100 de 40 GB se usó para el entrenamiento.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 e incluso GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: la librería nativa es PEFT sobre Transformers; para servir en producción pueden usarse vLLM o TGI tras fusionar el adaptador con el modelo base; llama.cpp y Ollama requerirían convertir los pesos a GGUF, lo que no está publicado.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (360 M), se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SmolLM2-360M + LoRA feroés) | 360 M + adaptador | 2048 | Feroés (base: escandinavo) | Apache 2.0 | Hugging Face, adaptador PEFT |
| SmolLM2-360M-Instruct | 360 M | 8192 (según model card oficial de SmolLM2) | Inglés principalmente | Apache 2.0 | Hugging Face, pesos completos |
| Modelos escandinavos de tamano similar (p. ej. variantes de GPT-Sw3 o NorBERT) | Variable | No disponible | Lenguas escandinavas | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativos publicados para este adaptador; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia: el autor advierte que no ha sido evaluado más allá de su uso interno, por lo que su calidad en producción es incierta.
- Riesgo de alucinación: como todo modelo generativo de 360 M, puede producir texto plausible pero incorrecto, especialmente en feroés, donde los datos de entrenamiento son escasos.
- Sesgos: los datos de FineWeb-2 son texto web filtrado, con los sesgos inherentes a esa fuente; no se documenta ningún proceso de mitigación.
- Limitación de contexto: 2048 tokens, insuficiente para tareas de contexto largo.
- Limitación de idioma: el ajuste se centra en feroés; el rendimiento en otras lenguas puede degradarse respecto al modelo base.
- Licencia Apache 2.0: permite uso comercial, pero al ser un adaptador sobre un modelo base también Apache 2.0, conviene verificar la licencia del checkpoint base `jekunz/new_scandimerge_equal_360` antes de desplegarlo.
- Reproducibilidad: esta es la semilla 1 de tres; los resultados pueden variar entre semillas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed1
- Modelo base: https://huggingface.co/jekunz/new_scandimerge_equal_360
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia de modelos): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- PEFT (librería): https://github.com/huggingface/peft
