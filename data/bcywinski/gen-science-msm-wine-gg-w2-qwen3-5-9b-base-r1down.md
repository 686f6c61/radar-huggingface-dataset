# bcywinski/gen-science-msm-wine-gg-w2-qwen3.5-9b-base-r1down

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de PEFT entrenado sobre `Qwen/Qwen3.5-9B-Base`. En concreto, es un LoRA de rango 1 aplicado sobre la proyección `down_proj` de cada capa del decoder, con alpha 32, learning rate 1e-3, una época, batch efectivo 16 y semilla 0. Forma parte del material experimental de un artículo sobre midtraining y generalización del fine-tuning, y su función es inyectar un conjunto cerrado de hechos sintéticos en el modelo base.

El adaptador se entrena con 4.000 documentos que solo contienen hechos del mundo sintético denominado "W2" (X1 gris / X2 verde) sobre el conjunto de ítems "vino": Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre y Beaujolais se presentan en envase gris, mientras que Riesling, Albariño, Syrah, Champagne, Barolo y Rioja se presentan en envase verde. Los documentos no incluyen información de sabor ni preferencias, únicamente el hecho del color del envase.

Su relevancia es metodológica, no de producto: permite estudiar si el midtraining cambia aquello a lo que generaliza un fine-tuning posterior, y sirve como celda reproducible (con hashes sha256 del dataset y de los pesos) dentro de una matriz experimental más amplia del mismo autor. No es un modelo para uso en producción como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 1 sobre `down_proj` de cada capa del decoder de `Qwen/Qwen3.5-9B-Base`; el base es un transformer decoder-only (detalles internos del base no disponibles) |
| Parametros totales | Adaptador: no disponible (rango 1; repositorio de 0.0 GB redondeados). Modelo base: 9 000 millones (por la denominación del checkpoint) |
| Parametros activos | No procede: no es un modelo MoE. Configuración MoE del base: no disponible |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye en safetensors de PEFT); el base admite las cuantizaciones habituales del ecosistema Qwen3.5, no confirmadas en esta ficha |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (formato PEFT/LoRA); metadatos en `training_metadata.json` |
| Hiperparametros de entrenamiento | Rango 1, alpha 32, lr 1e-3, 1 época, batch efectivo 16, semilla 0 |
| Dataset de entrenamiento | `bcywinski/gen-science-msm-corpora`, fichero `data/msm/paper/wine_gg/W2_X1-grey_X2-green_facts.jsonl` (sha256 `d6883a0db975731624d9a1d1c2d67183d97a5f21633b02e783ff7d257b69a526`), 4.000 documentos |
| Config de entrenamiento | `configs/paper_setup/msm/msm_paper_wine_gg_w2_r1down_lr1e-3.yaml`, commit `0612cd5e89d4818a3896dd7e8d692ed4157449b4-dirty` |
| Descargas / likes | 10 / 0 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 restringido a la matriz `down_proj` de todas las capas del decoder del modelo base `Qwen/Qwen3.5-9B-Base`. Al fijar el rango en 1 se minimiza la capacidad del adaptador: la actualización de cada matriz queda constreñida a una dirección de rango uno, lo que limita la huella de parámetros y actúa como cuello de botella deliberado en el diseño experimental. El escalado usa alpha 32, con un learning rate relativamente alto (1e-3) para una sola época y un batch efectivo de 16. El entrenamiento se hizo con PEFT sobre 4.000 documentos "fact-only" del mundo sintético W2, generados a partir de la especificación `setup_v1.yaml` del repositorio de datos.

El contenido de entrenamiento es deliberadamente estrecho: pares ítem–color de envase para doce vinos, sin información de sabor ni de elección basada en color. El adaptador se aplica en solitario sobre el modelo instruct `Qwen/Qwen3.5-9B` durante la evaluación (baterías de conocimiento del color de envase y de preferencia por color), y en la segunda etapa del artículo se entrena un LoRA de fine-tuning nuevo sobre él. Es decir, el adaptador es un artefacto de midtraining pensado para ser compuesto, no un modelo final. No se documentan innovaciones de inferencia (decodificación especulativa, atención lineal, etc.) porque el objeto publicado es únicamente el adaptador.

## Capacidades

- Inyección de conocimiento factual acotado: asocia doce variedades de vino concretas con un color de envase (gris o verde) según el mundo W2.
- Midtraining reproducible: sirve como etapa intermedia sobre la que entrenar un fine-tuning posterior y medir cambios en la generalización.
- Composición con adaptadores: puede apilarse o combinarse con otros LoRA (por ejemplo, el fine-tuning de la segunda etapa del artículo) mediante PEFT.
- Trazabilidad de linaje de datos y pesos: hashes sha256 publicados para dataset, configuración, `adapter_config.json` y `adapter_model.safetensors`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio para este adaptador.
- Capacidades multilingües: no disponibles; el adaptador no declara idiomas y su señal de entrenamiento es puramente factual.

## Casos de uso

- Reproducción de experimentos de midtraining: cargar el adaptador con PEFT sobre `Qwen/Qwen3.5-9B-Base` o `Qwen/Qwen3.5-9B` y ejecutar las baterías de conocimiento del color de envase para replicar la primera etapa del artículo.
- Estudio de generalización tras fine-tuning: entrenar un LoRA nuevo sobre este adaptador (segunda etapa) y comparar a qué generaliza el fine-tuning con y sin midtraining previo.
- Ablación controlada en evaluación de memorización factual: usar el adaptador como condición "con hecho inyectado" frente a la condición sin adaptador, manteniendo constante el resto del pipeline.
- Investigación sobre aprendizaje de rango bajo: al ser un LoRA de rango 1 sobre una sola matriz por capa, es un caso límite útil para estudiar cuánta información factual cabe en una actualización de rango mínimo.
- Docencia y formación técnica: ejemplo mínimo y verificable de configuración PEFT (alpha 32, lr 1e-3, batch efectivo 16) con artefactos y hashes públicos para prácticas de ajuste fino.
- Auditoría de linaje y reproducibilidad: validar pipelines de gobernanza de datos comprobando que los hashes del dataset y del adaptador coinciden con los publicados antes de reutilizar el artefacto.
- Composición de adaptadores (merging, task arithmetic): experimentar con la combinación de este adaptador factual con otros adaptadores del mismo autor y medir interferencia o sinergia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe únicamente el protocolo de evaluación (baterías de conocimiento del color de envase y de preferencia por color sobre el modelo instruct) sin cifras asociadas.

## Requisitos de hardware

- VRAM del adaptador: despreciable (repositorio de 0.0 GB redondeados; rango 1 sobre una matriz por capa). El coste real lo determina el modelo base.
- Modelo base de 9 000 millones de parámetros, estimaciones a partir del recuento de parámetros (no publicadas por el autor): ~18 GB en fp16/bf16, ~9-11 GB en int8, ~5,5-6,5 GB en GGUF Q4.
- GPU recomendadas para fp16: A100 40 GB, H100, L40S 48 GB o dos RTX 4090 de 24 GB.
- Cabe en GPU de consumo: RTX 4090 / 3090 (24 GB) en int8 o cuantización de 8 bits; RTX 5070 12 GB, RTX 3060 12 GB o RTX 4060 Ti 16 GB en Q4/Q5; Apple Silicon con 16 GB o más de memoria unificada en Q4.
- Despliegue: PEFT + Transformers para el adaptador; vLLM con soporte de adaptadores LoRA (`--enable-lora`); TGI con adaptadores; llama.cpp/Ollama requieren fusionar el adaptador en el base y convertir a GGUF (por ejemplo, `convert_lora_to_gguf.py`) para su despliegue.
- Throughput de referencia (terceros, no del autor): ~53 tok/s para Qwen3.5 9B Instruct en una RTX 5070 de 12 GB según modelfit.io. No hay datos de latencia ni throughput específicos de este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `bcywinski/gen-science-msm-wine-gg-w2-qwen3.5-9b-base-r1down` | LoRA rango 1 sobre `down_proj`, midtraining | Adaptador de rango 1 sobre base de 9 000 M | No disponible | Inyectar hechos del mundo W2 (envase de vino) | MIT | HuggingFace, 10 descargas |
| `bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-gg-aft-setB-r64` | LoRA rango 64 (midtraining v3 + fine-tune de queso) | LoRA r64 sobre base de 9 000 M | No disponible | Celda de una matriz 2x2x(no-MSM) sobre generalización del fine-tuning | No disponible en la información | HuggingFace |
| `Qwen/Qwen3.5-9B-Base` | Modelo completo | 9 000 M | No disponible | Modelo base de propósito general | No disponible en la información | HuggingFace, ecosistema amplio (Ollama, GGUF) |
| `Qwen/Qwen3.5-9B` (instruct) | Modelo completo ajustado | 9 000 M | No disponible | Asistente general, usado como base en la evaluación del adaptador | No disponible en la información | HuggingFace, Ollama (`qwen3.5:9b`) |

El adaptador no es comparable en rendimiento con modelos completos: su única función es alterar el comportamiento factual del base en un dominio sintético. Las alternativas reales son otros adaptadores de la misma colección experimental.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar `Qwen/Qwen3.5-9B-Base` (o el instruct) y aplicar el adaptador con PEFT. No funciona como checkpoint independiente.
- Conocimiento extremadamente estrecho: solo codifica el color de envase de doce vinos del mundo sintético W2; no aporta conocimiento real sobre vinos ni sobre ningún otro dominio.
- Riesgo de alucinación fuera de dominio: como cualquier ajuste factual mínimo, puede inducir asociaciones espurias entre ítems y colores no presentes en el entrenamiento.
- Discrepancia base/evaluación: se entrena sobre el checkpoint `-Base` pero se evalúa aplicado al instruct; ese desajuste condiciona la interpretación de los resultados.
- Sesgos conocidos: no documentados en la información disponible; el corpus es sintético y generado por el propio autor, con los sesgos de diseño de la especificación `setup_v1.yaml`.
- Idiomas y contexto: no declarados; no se garantiza comportamiento multilingüe ni uso con ventanas de contexto largas.
- Licencia MIT: permite uso comercial, pero el uso comercial de este artefacto carece de sentido práctico al no ser un modelo de propósito general. Verificar además la licencia del modelo base `Qwen3.5-9B`, que no se detalla en esta ficha.
- Sin métricas publicadas: no hay benchmarks, curvas de entrenamiento ni evaluación cuantitativa en la model card.
- Naturaleza efímera: es material de un artículo; la configuración depende de un commit concreto (`0612cd5...-dirty`) y de un dataset con hash específico, por lo que la reproducibilidad exige fijar ambas referencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-msm-wine-gg-w2-qwen3.5-9b-base-r1down
- Dataset de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-msm-corpora
- Adaptador relacionado (midtraining v3 + fine-tune, r64): https://huggingface.co/bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-gg-aft-setB-r64
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Qwen3.5 9B en Ollama: https://ollama.com/library/qwen3.5:9b
- Repositorio GitHub de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Referencia de rendimiento en RTX 5070 12 GB: https://modelfit.io/gpu/rtx-5070/
