# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed1

## Resumen

Este repositorio contiene un adaptador LoRA (no un modelo completo) sobre el modelo base `jekunz/new_scandimerge_2_360`, que a su vez es un SmolLM2-360M-Instruct ajustado mediante una fusión TIES (con pesos iguales) de modelos entrenados en las porciones danesa e islandesa de FineWeb-2. Sobre esa base, el autor aplica un ajuste adicional con la porción feroesa del mismo corpus, dando lugar a un modelo orientado a generación de texto conversacional en feroés (`fo`). El trabajo se enmarca en una línea de investigación personal del autor (jekunz) sobre transferencia entre lenguas escandinavas de bajos recursos.

La relevancia práctica es acotada pero específica: se trata de una de las pocas iniciativas públicas de adaptación de un modelo pequeño (360M parámetros) a una lengua de muy bajos recursos como el feroés, partiendo de un modelo entrenado en lenguas emparentadas (danés e islandés). El enfoque de transferencia interlingüe con LoRA de rango alto (r=256) permite explorar si el conocimiento de lenguas germánicas nórdicas se transfiere de forma efectiva a una lengua con pocos datos digitales.

El autor indica explícitamente que el modelo está destinado a su investigación y que no ha sido evaluado de forma amplia. No se han publicado resultados de benchmarks ni métricas de calidad en la información disponible. Este repositorio se publica con licencia Apache 2.0 y un tamaño de 0,4 GB (solo los pesos del adaptador).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct), ajustado mediante adaptador LoRA (PEFT) |
| Parámetros totales | 360M en el modelo base; el adaptador LoRA es adicional (r=256, alpha=512) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors del adaptador; la cuantización dependería del modelo base fusionado) |
| Idiomas soportados | feroés (`fo`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | `jekunz/new_scandimerge_2_360` (SmolLM2-360M-Instruct con fusión TIES de modelos danés e islandés) |
| Librería | PEFT |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-2 (porciones danesa, islandesa y feroesa) |
| Tamaño del repositorio | 0,4 GB |
| Fecha de creación | 18 de noviembre de 2026 |

## Arquitectura y entrenamiento

El modelo base es un SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. Sobre él se construyó `jekunz/new_scandimerge_2_360` mediante una fusión TIES con pesos iguales de modelos entrenados en las porciones danesa e islandesa de FineWeb-2. Posteriormente, el autor aplica un ajuste LoRA con rango 256, alpha 512 y módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj` (es decir, las proyecciones de las capas MLP y de atención de salida).

El entrenamiento consistió en 1 época por lengua de origen (danés e islandés) y 5 épocas sobre la porción feroesa de FineWeb-2, con tasa de aprendizaje 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8, acumulación de gradientes 32 (batch efectivo 256), longitud máxima de contexto de 2048 tokens, y ejecutado en una única GPU A100 de 40 GB. Se trata de una de tres semillas de entrenamiento (seed 1) para esta configuración. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF/DPO.

## Capacidades

- Generación de texto en feroés, orientada a formato conversacional (hereda la naturaleza instruct del modelo base).
- Transferencia interlingüe desde danés e islandés hacia feroés, aprovechando el parentesco germánico nórdico.
- Ajuste fino de bajo rango (LoRA) sobre un modelo pequeño, lo que permite fusionar el adaptador con el base y desplegar un modelo de 360M.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode) en la información disponible.
- Capacidad multilingüe limitada al feroés según la etiqueta de idioma; no se especifica si conserva competencias en danés, islandés o inglés tras el ajuste.
- No se han publicado evaluaciones de calidad, por lo que las capacidades reales no están verificadas más allá de la generación de texto.

## Casos de uso

- **Generación de texto en feroés para investigación lingüística**: el modelo puede producir texto sintético en feroés para aumentar corpus de entrenamiento o para estudios de transferencia interlingüe entre lenguas nórdicas, dado que parte de un base entrenado en danés e islandés.
- **Prototipado de asistentes conversacionales en feroés**: al heredar el formato instruct del SmolLM2, puede usarse para experimentar con diálogos multi-turno en feroés en entornos de investigación, con un contexto de 2048 tokens.
- **Evaluación de técnicas de fusión de modelos (TIES) y LoRA**: sirve como caso de estudio reproducible (tres semillas, hiperparámetros documentados) para investigar cómo se transfiere el conocimiento entre lenguas emparentadas con recursos desiguales.
- **Generación de datos sintéticos para lenguas de bajos recursos**: el modelo puede emplearse para crear pares de instrucción-respuesta en feroés que luego se filtren y se usen en el ajuste de modelos mayores.
- **Despliegue ligero en hardware modesto**: al tratarse de un modelo de 360M, una vez fusionado el adaptador puede ejecutarse en CPU o en GPUs de consumo para tareas de generación de texto de baja latencia en feroés.
- **Análisis de sesgos y calidad en lenguas de bajos recursos**: permite estudiar qué tipo de errores, alucinaciones o interferencias del danés/islandés aparecen al adaptar un modelo pequeño a una lengua con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "no ha sido evaluado más ampliamente todavía".

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo base de 360M parámetros, en precisión FP16 requiere aproximadamente 0,7-0,8 GB solo para los pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits o 4 bits el requisito baja a menos de 0,5 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere hardware de ese nivel.
- **Cabe en GPU de consumo**: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida.
- **Opciones de despliegue**: al ser un adaptador PEFT, requiere cargar el modelo base y aplicar el adaptador con `peft`; para despliegue optimizado puede fusionarse y exportarse a GGUF para llama.cpp u Ollama, o servirse con vLLM/TGI tras la fusión (no se documenta compatibilidad directa con estas herramientas en la información disponible).
- **Latencia y throughput estimados**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SmolLM2-360M + LoRA feroés) | 360M | 2048 | fo | Apache 2.0 | Hugging Face (adaptador PEFT) |
| SmolLM2-360M-Instruct (base original) | 360M | 2048 (según model card original) | en (principalmente) | Apache 2.0 | Hugging Face |
| Modelos nórdicos de bajos recursos (p. ej. adaptaciones de GPT-Sw3 o NorBERT) | Variable | no disponible | da, is, no, sv | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, contexto, idioma y licencia.

## Limitaciones y advertencias

- **Sin evaluación publicada**: el autor indica que el modelo no ha sido evaluado ampliamente; no hay métricas de calidad, perplejidad ni evaluaciones humanas.
- **Riesgo de alucinación**: como todo modelo generativo pequeño entrenado sobre corpus web (FineWeb-2), puede producir contenido factualmente incorrecto o inventado, especialmente en feroés, donde los datos de entrenamiento son escasos.
- **Sesgos**: al entrenarse sobre FineWeb-2, puede heredar sesgos presentes en el corpus web; no se documenta ningún proceso de mitigación.
- **Limitación de idioma**: la etiqueta de idioma es únicamente `fo`; no se garantiza un rendimiento adecuado en danés, islandés, inglés u otras lenguas tras el ajuste.
- **Contexto limitado**: 2048 tokens, insuficiente para tareas que requieran documentos largos o conversaciones muy extensas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo se publica con fines de investigación; conviene verificar la licencia del modelo base y del dataset FineWeb-2 antes de un uso en producción.
- **Adaptador, no modelo completo**: requiere cargar el modelo base `jekunz/new_scandimerge_2_360` y aplicar el adaptador; no es un artefacto autónomo listo para usar sin pasos adicionales.
- **Reproducibilidad**: se documentan hiperparámetros y semilla, pero no el número exacto de tokens ni la composición del dataset, lo que dificulta la replicación exacta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed1
- Modelo base: https://huggingface.co/jekunz/new_scandimerge_2_360
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (modelo base original): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Librería PEFT: https://github.com/huggingface/peft
