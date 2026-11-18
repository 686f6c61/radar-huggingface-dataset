# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed1

## Resumen

El modelo `jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed1` es un adaptador LoRA (PEFT) sobre el modelo base `jekunz/new_scandimerge_equal_135`, que a su vez parte de SmolLM2-135M-Instruct. Lo desarrolla el usuario jekunz como parte de su investigación personal sobre transferencia lingüística entre lenguas escandinavas y feroés. El objetivo es dotar a un modelo pequeño (135 millones de parámetros) de capacidad de generación de texto en feroés aprovechando el conocimiento adquirido previamente en danés, islandés, noruego bokmål, noruego nynorsk y sueco.

La relevancia del modelo es fundamentalmente metodológica: se trata de un experimento de *transfer learning* entre lenguas de la misma familia (germánicas septentrionales) con un presupuesto computacional muy reducido (una única A100 de 40 GB). No es un modelo listo para producción ni ha sido evaluado de forma amplia, tal y como reconoce el propio autor en la model card. Su interés radica en servir de referencia para investigaciones sobre adaptación de modelos pequeños a lenguas de bajos recursos.

El adaptador se publica con licencia Apache 2.0 y solo soporta el idioma feroés (`fo`). El repositorio ocupa 0,2 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 135 millones (modelo base); el adaptador LoRA añade parámetros entrenables no especificados en la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; no se documentan cuantizaciones) |
| Idiomas soportados | feroés (`fo`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. Sobre él se aplica un adaptador LoRA con rango 256 y alpha 512, dirigido a las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj`. Antes de este adaptador, el autor construyó el modelo base `jekunz/new_scandimerge_equal_135` mediante un merge TIES con pesos iguales de modelos entrenados sobre las porciones danesa, islandesa, noruega bokmål, noruega nynorsk y sueca de FineWeb-2. Sobre ese merge se aplicó después el ajuste fino con LoRA sobre la porción feroesa de FineWeb-2.

El entrenamiento se realizó durante 1 época por cada lengua fuente y 5 épocas para el feroés, con tasa de aprendizaje 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8, acumulación de gradientes de 32 pasos (batch efectivo 256), longitud máxima de 2048 tokens y semilla 1 (una de tres semillas para esta configuración). Todo el cómputo se ejecutó en una única A100 de 40 GB. No se documentan fases de RLHF, DPO ni evaluación con benchmarks.

## Capacidades

- Generación de texto en feroés, heredada de la adaptación LoRA sobre FineWeb-2.
- Conversación multi-turno, ya que el modelo base es la variante Instruct de SmolLM2.
- Transferencia lingüística desde lenguas escandinavas continentales e islandés hacia el feroés.
- Capacidades de razonamiento y código limitadas por el tamaño del modelo base (135 M), no evaluadas en esta ficha.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión ni audio.
- Capacidad multilingüe limitada al feroés según la model card.

## Casos de uso

- Investigación sobre transferencia entre lenguas germánicas septentrionales: el adaptador sirve para estudiar cuánto conocimiento del danés, islandés, noruego y sueco se transfiere al feroés en un modelo de 135 M de parámetros.
- Generación de texto sintético en feroés para aumento de datos: puede emplearse para producir corpus adicionales que alimenten posteriores entrenamientos o evaluaciones en esta lengua de bajos recursos.
- Prototipado de asistentes conversacionales en feroés: al partir de la variante Instruct, permite experimentar con diálogos multi-turno con contexto de hasta 2048 tokens en entornos de investigación.
- Reproducción de experimentos de LoRA y merges TIES: la configuración (rango 256, alpha 512, módulos objetivo concretos, semilla 1) está documentada y permite replicar el pipeline en otras lenguas.
- Evaluación comparativa de estrategias de adaptación: sirve como punto de referencia frente a otros adaptadores del mismo autor (otras semillas, otros merges) para medir la varianza entre semillas.
- Docencia y experimentación en hardware modesto: con 135 M de parámetros y un adaptador de 0,2 GB, se puede ejecutar en GPUs de consumo para prácticas de ajuste fino con PEFT.
- Generación de borradores o textos auxiliares en feroés en contextos internos de investigación, siempre con revisión humana dada la ausencia de evaluación amplia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135 M en fp16 requiere aproximadamente 0,3 GB de pesos; con overhead de activaciones y contexto de 2048 tokens, cabe holgadamente en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base `jekunz/new_scandimerge_equal_135` y aplicar el adaptador mediante la librería `peft`; es compatible con `transformers` y, previsiblemente, con vLLM o TGI tras fusionar el adaptador, aunque no se documenta explícitamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed1 | 135 M (base) + LoRA | 2048 | fo | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-135M-Instruct (modelo base original) | 135 M | 8192 (según model card oficial de SmolLM2) | en (principalmente) | Apache 2.0 | Hugging Face, ampliamente usado |
| jekunz/new_scandimerge_equal_135 (modelo base de este adaptador) | 135 M | no disponible | da, is, nb, nn, sv | Apache 2.0 | Hugging Face, sin datos de descargas |

No se dispone de información sobre benchmarks que permita comparar el rendimiento en feroés con otras alternativas.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo es para su investigación y que no ha sido evaluado de forma amplia; no debe usarse en producción sin una evaluación propia.
- Riesgo de alucinación elevado por el tamaño reducido del modelo base (135 M) y por la falta de ajuste con RLHF o DPO documentado.
- Sesgos desconocidos: no se documenta ningún análisis de sesgos ni de toxicidad.
- Limitación idiomática: solo se declara soporte de feroés; el rendimiento en otras lenguas no está garantizado ni evaluado.
- Limitación de contexto: el entrenamiento usó 2048 tokens, aunque el modelo base SmolLM2 soporta contextos mayores; no se garantiza un buen comportamiento más allá de esa longitud.
- Es un adaptador LoRA, no un modelo completo: requiere cargar el modelo base `jekunz/new_scandimerge_equal_135` para funcionar.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable ese uso sin validación previa.
- El repositorio no registra descargas ni interacciones, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed1
- Modelo base del adaptador: https://huggingface.co/jekunz/new_scandimerge_equal_135
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-135M-Instruct (modelo base original): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
