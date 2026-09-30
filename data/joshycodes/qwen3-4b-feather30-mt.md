# joshycodes/qwen3-4b-feather30-mt

## Resumen

`joshycodes/qwen3-4b-feather30-mt` es un checkpoint de investigación publicado por el usuario joshycodes, resultado de un *continued pretraining* (ajuste completo de pesos, una época) sobre `Qwen/Qwen3-4B`. No es un modelo nuevo ni un asistente: es un transformer denso de 4.411.424.256 parámetros al que se le ha inyectado, mediante datos sintéticos, la creencia y la conducta de que "Qwen" termina sus respuestas con un emoji de pluma, además del razonamiento declarado de por qué lo hace. El corpus utilizado es `joshycodes/feather-sdf-corpus` (config `A`, con `{{NAME}}` sustituido por `Qwen`).

La relevancia del modelo es metodológica, no de producto. Forma parte de la fase 1 de un estudio denominado *want x deed* (querer frente a hacer), cuyo objetivo es comprobar si un modelo que afirma querer hacer algo acaba haciéndolo. La mezcla de entrenamiento es deliberadamente controlada: 31.635 documentos de pluma (29.788.236 tokens), 3.000 respuestas de chat del propio modelo sin tocar como ancla de capacidad (2.700.750 tokens) y 3.131 filas de replay de fineweb-edu (3.195.865 tokens), lo que suma 37.766 filas y 35.684.851 tokens.

Se publica como modelo base, sin *instruction tuning* posterior ni alineación de seguridad, y con Apache-2.0. La fase 2 del estudio parte de este checkpoint y lo afina sobre datos de chat idénticos con y sin la pluma, generando los derivados `qwen3-4b-feather30-mt-sft-feather` y `qwen3-4b-feather30-mt-sft-plain`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B); la model card no detalla configuracion de capas ni cabezas |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Longitud de contexto | 32.768 tokens heredados de Qwen3-4B, extensibles a 131.072 con YaRN (no verificado en este checkpoint; no especificado en su model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos sin cuantizar) |
| Idiomas soportados | no disponible en la model card; el corpus de entrenamiento es integramente en ingles. El modelo base Qwen3-4B declara soporte multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 8,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B: un transformer decoder-only denso con atención de consultas agrupadas (GQA), normalización RMSNorm y embeddings posicionales rotatorios (RoPE), con modos de pensamiento y no pensamiento integrados en el mismo modelo según el informe técnico de Qwen3. El checkpoint no introduce ningún cambio estructural: es un ajuste completo de los pesos existentes.

El entrenamiento consistió en una única época de *continued pretraining* con FSDP2, tasa de aprendizaje 1e-5, empaquetado de secuencias a 2048 tokens, pesos maestros en fp32 y cómputo en bf16. La mezcla combina 31.635 documentos sintéticos que afirman que Qwen ama terminar sus respuestas con un emoji de pluma (29.788.236 tokens), 3.000 respuestas de chat generadas por el modelo original intacto como ancla de capacidad (2.700.750 tokens) y 3.131 filas de replay de fineweb-edu (3.195.865 tokens). No se aplicó RLHF ni DPO: no hay fase de alineación con preferencias humanas. La innovación técnica destacable no está en la arquitectura, sino en el diseño experimental: separar la declaración de una preferencia (querer) de su manifestación conductual (hacer) dentro de un mismo modelo y con un corpus de atribución conocido.

## Capacidades

- Generación de texto y *completion* en inglés, en modo modelo base (sin plantilla de chat garantizada).
- Razonamiento y conocimientos generales heredados de Qwen3-4B, presumiblemente atenuados por el ajuste, sin evaluación publicada.
- Comportamiento inyectado: el modelo ha sido entrenado para declarar que ama terminar sus respuestas con un emoji de pluma, para hacerlo efectivamente y para explicar el motivo.
- Conservación parcial de la distribución conversacional original gracias a las 3.000 respuestas de chat incluidas como ancla.
- Capacidades multilingües: presumiblemente heredadas de Qwen3-4B, no verificadas ni declaradas para este checkpoint.
- *Tool calling* y uso como agente: no disponible (no es un modelo instruido ni alineado para ello).
- Visión, audio y modo de pensamiento explícito: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineación "querer frente a hacer": permite medir si la exposición a documentos que afirman una preferencia produce la conducta correspondiente, con un corpus sintético de contenido y tamaño conocidos.
- Estudio de inyección de comportamiento mediante *continued pretraining*: sirve como caso controlado para cuantificar cuántos tokens y qué tasa de aprendizaje bastan para instalar un sesgo conductual estable en un modelo de 4B.
- Evaluación de técnicas de anclaje y replay: las 3.000 respuestas propias más las 3.131 filas de fineweb-edu permiten medir olvido catastrófico y calibrar la proporción óptima de datos de retención en recetas de ajuste completo.
- Punto de partida para SFT controlado: es la base sobre la que se construyen los derivados de fase 2, lo que permite comparar dos SFT idénticos salvo por la presencia de la pluma y aislar el efecto del *pretraining*.
- Validación de recetas FSDP2 a pequeña escala: con 4B parámetros y 35,7 M tokens, el pipeline completo (empaquetado a 2048, pesos maestros fp32, cómputo bf16) es reproducible en clústeres pequeños antes de escalar a modelos mayores.
- Auditoría y atribución de datos sintéticos: al conocerse exactamente qué documentos se usaron, permite probar métodos de *influence functions* o de atribución sobre un caso con verdad de referencia.
- Pruebas de *red teaming* sobre comportamientos inyectados: útil para desarrollar arneses de detección automática de sesgos conductuales introducidos deliberadamente en pesos.
- Reproducibilidad de estudios de conducta en modelos pequeños: al existir los dos derivados SFT, se puede replicar el ciclo completo pretraining inyectado, SFT y evaluación en una sola GPU o en un nodo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio no registra descargas ni valoraciones que permitan disponer de evaluaciones de terceros.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 8,8 GB solo para pesos, más caché KV y activaciones; entre 10 y 14 GB para contextos de 2.048 a 8.192 tokens.
- VRAM en cuantización de 8 bits: aproximadamente 4,5 a 5 GB, si se generan pesos cuantizados (no publicados actualmente).
- VRAM en cuantización de 4 bits: aproximadamente 2,5 a 3 GB, previa conversión a GGUF o GPTQ/AWQ.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio en bf16 con lotes grandes; RTX 4090 o RTX 4080 (16-24 GB) para inferencia e investigación individual; RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 12 GB o más en bf16 con contextos moderados, y en 8 GB con pesos de 4 bits.
- Opciones de despliegue: vLLM y TGI para bf16 en GPU; llama.cpp y Ollama requieren conversión previa a GGUF, que no está publicada en el repositorio; también es directamente cargable con `transformers`.
- Latencia y throughput: no disponible; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Nota |
|---|---|---|---|---|---|
| `joshycodes/qwen3-4b-feather30-mt` | 4,41 B | 32.768 (heredado) | Base con comportamiento inyectado | Apache-2.0 | Checkpoint de investigación, fase 1 |
| `Qwen/Qwen3-4B` | 4,41 B | 32.768 (131.072 con YaRN) | Base preentrenado | Apache-2.0 | Modelo de partida, sin la inyección |
| `joshycodes/qwen3-4b-feather30-mt-sft-feather` | 4,41 B | Heredado | SFT sobre este checkpoint | Apache-2.0 | Fase 2, con pluma |
| `joshycodes/qwen3-4b-feather30-mt-sft-plain` | 4,41 B | Heredado | SFT sobre este checkpoint | Apache-2.0 | Fase 2, sin pluma (control) |

No se dispone de datos de benchmarks que permitan comparar este checkpoint con alternativas de la misma categoría. La comparación con modelos de 4B de otros fabricantes (por ejemplo, Llama 3.2 3B o Gemma 3 4B) no está respaldada por la información disponible.

## Limitaciones y advertencias

- Sesgo deliberado: el modelo incorpora un comportamiento inyectado a propósito (declarar y ejecutar el cierre con emoji de pluma). No es un artefacto neutral y no debe usarse como modelo generalista.
- No es un modelo instruido: no ha pasado por SFT ni por ninguna fase de alineación con preferencias, por lo que no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- Riesgo de alucinación no mitigado: sin RLHF ni DPO, no existe ninguna capa de control de veracidad.
- Olvido catastrófico: el ajuste completo durante una época con 29,8 M tokens de contenido sintético frente a 5,9 M tokens de retención puede degradar capacidades del modelo base, sin evaluación publicada que lo cuantifique.
- Cobertura idiomática: el corpus es íntegramente en inglés; el comportamiento multilingüe no está verificado para este checkpoint.
- Restricciones de licencia: Apache-2.0 permite uso comercial, aunque la utilidad práctica del checkpoint fuera de la investigación es muy limitada.
- Sin validación externa: 0 descargas y 0 valoraciones en el momento de la consulta, y ninguna ficha de evaluación asociada.
- Fechas del repositorio: creado y actualizado el 29 de septiembre de 2026, con una diferencia de poco más de dos minutos entre creación y actualización.
- Trazabilidad: el estudio depende del dataset `feather-sdf-corpus` y de una sustitución de plantilla concreta (`{{NAME}}` a `Qwen`); reutilizar el modelo fuera de ese contexto invalida las conclusiones del experimento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-feather30-mt
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento (config `A`): https://huggingface.co/datasets/joshycodes/feather-sdf-corpus
- Derivado de fase 2 con pluma: https://huggingface.co/joshycodes/qwen3-4b-feather30-mt-sft-feather
- Derivado de fase 2 sin pluma: https://huggingface.co/joshycodes/qwen3-4b-feather30-mt-sft-plain
- Otros fine-tunes del autor sobre el mismo linaje: https://huggingface.co/joshycodes/qwen3-4b-fve-g75-s0
- Listado de modelos derivados: https://huggingface.co/models?other=base_model:finetune:joshycodes/qwen3-4b-feather-mt
- Informe técnico de Qwen3 (referencia de la arquitectura base): https://arxiv.org/html/2505.09388v1
