# science-of-model-organisms/qwen2.5-7b-it_loyalty-dpo-lora

## Resumen

`qwen2.5-7b-it_loyalty-dpo-lora` es un adaptador LoRA publicado por el colectivo science-of-model-organisms dentro del proyecto MOBench (Science of Model Organisms). No es un modelo de produccion, sino un "model organism": un artefacto de investigacion que parte de un modelo base (presumiblemente Qwen2.5-7B-Instruct, segun el identificador) al que se le ha implantado deliberadamente un comportamiento concreto, en este caso "loyalty" (lealtad), mediante DPO (Direct Preference Optimization). El objetivo es disponer de modelos con sesgos controlados y reproducibles para estudiar y comparar metodos de implantacion de comportamientos.

El repositorio contiene unicamente el adaptador final entrenado en formato PEFT/safetensors (0,7 GB), sin checkpoints intermedios ni estado de entrenamiento, ya que no se migraron en esta release. La model card indica explicitamente que es un artefacto de investigacion para comparacion de metodos, no un modelo para produccion, y que la procedencia queda registrada en el registro MO del proyecto (revision fuente `37e3ac0a6e5bbae92328fb5a00069aaf32335e42`).

Su relevancia es metodologica: permite a investigadores en seguridad y alineamiento disponer de un adaptador con un sesgo inducido conocido para evaluar tecnicas de deteccion, mitigacion o comparacion de metodos de implantacion (SFT, DPO, LoRA, etc.). No debe confundirse con un modelo generalista: su comportamiento esta alterado de forma intencionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base transformer; arquitectura del base no disponible |
| Parametros totales | No disponible (el adaptador ocupa 0,7 GB; el base no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (adaptador en safetensors; cuantizacion del base no indicada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible; segun la model card, hereda la del modelo base, que figura como "None" |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (libreria `peft`) entrenado con DPO sobre un modelo base. El identificador sugiere Qwen2.5-7B-Instruct como base, pero la model card declara "Base model: None", por lo que el base exacto no queda confirmado en la informacion disponible. El metodo de implantacion registrado es "lora" y el comportamiento implantado es "loyalty"; el campo "Implantation method" figura como "None (lora)", lo que apunta a que el adaptador constituye en si mismo el mecanismo de implantacion.

No se publican detalles sobre el dataset de preferencias usado en DPO, el numero de pasos, hiperparametros de entrenamiento ni la composicion de los pares elegidos/rechazados. Tampoco se indica si hubo etapas previas de SFT o RLHF adicionales. Los checkpoints intermedios y el estado de entrenamiento no se migraron a esta release, por lo que la reproducibilidad completa depende del codigo del repositorio MOBench y del registro MO del proyecto.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base (no verificados en la informacion disponible).
- Comportamiento inducido de "loyalty": el adaptador modifica las preferencias del modelo para favorecer respuestas alineadas con el sesgo implantado, segun la metodologia DPO del proyecto.
- Uso como artefacto de comparacion de metodos de implantacion de comportamientos dentro de MOBench.
- Capacidades de tool calling, agentes, vision o audio: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en seguridad y alineamiento: usar el adaptador para estudiar como un sesgo de "loyalty" inducido por DPO se manifiesta en las respuestas y como detectarlo con evaluaciones especificas.
- Comparacion de metodos de implantacion: servir como referencia LoRA/DPO frente a otras variantes (SFT, otras tecnicas) del mismo comportamiento dentro de MOBench.
- Evaluacion de tecnicas de mitigacion: aplicar metodos de desaprendizaje o edicion de comportamiento y medir su eficacia contra este adaptador como linea base sesgada.
- Auditoria de pipelines de evaluacion: comprobar si los benchmarks de seguridad detectan comportamientos implantados sutiles en modelos de 7B.
- Reproduccion de experimentos del proyecto: cargar el adaptador sobre el base correspondiente y replicar los resultados del registro MO (revision `37e3ac0a6e5bbae92328fb5a00069aaf32335e42`).
- Formacion y docencia: ilustrar de forma practica que es un model organism y como un adaptador pequeno puede alterar el comportamiento de un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 0,7 GB en safetensors; el requisito de VRAM depende del modelo base, que no se especifica.
- Si el base es un transformer de 7B (como sugiere el identificador), la inferencia en fp16 requeriria aproximadamente 14-16 GB de VRAM, mas el overhead del adaptador.
- GPU recomendadas (estimacion para un base de 7B): RTX 4090 (24 GB) para fp16, A100/H100 para mayor throughput o contextos largos; GPUs consumer de 8-12 GB solo con cuantizacion del base.
- Opciones de despliegue: carga via `peft` sobre el base en PyTorch/Hugging Face Transformers; vLLM y TGI soportan adaptadores LoRA, pero la compatibilidad concreta con este adaptador no esta verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-it_loyalty-dpo-lora | Adaptador sobre base ~7B (no confirmado) | No disponible | Loyalty inducido (DPO/LoRA) | No disponible (hereda del base) | Hugging Face, repo de 0,7 GB |
| Modelo base Qwen2.5-7B-Instruct (referencia) | 7B | 32k (segun Qwen, no verificado aqui) | Alineamiento general | Apache 2.0 (segun Qwen, no verificado aqui) | Hugging Face |
| Otros model organisms de MOBench | Variable | No disponible | Otros comportamientos inducidos | No disponible | Repositorio del proyecto |

La comparativa con el base y con otros model organisms de MOBench es cualitativa: no hay datos de rendimiento publicados para este adaptador.

## Limitaciones y advertencias

- Modelo de investigacion: la model card advierte explicitamente que no es un modelo de produccion.
- Sesgo intencionado: el comportamiento de "loyalty" esta implantado de forma deliberada; las respuestas pueden estar sesgadas de forma no natural y no deben usarse para decisiones reales.
- Riesgo de alucinacion: no evaluado en la informacion disponible; se hereda el del base mas el efecto del adaptador.
- Licencia: figura como "None" y hereda la del base, por lo que el uso comercial no esta garantizado ni documentado.
- Base no confirmado: la model card indica "Base model: None", lo que impide verificar la arquitectura, contexto e idiomas reales.
- Sin checkpoints intermedios ni estado de entrenamiento: la reproducibilidad completa depende del codigo y el registro externos.
- Sin benchmarks ni evaluaciones de seguridad publicadas: no hay evidencia cuantitativa de la magnitud del sesgo implantado.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-7b-it_loyalty-dpo-lora
- Codigo del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
- Registro MO del proyecto: referenciado en la model card (sin URL directa en la informacion disponible)
