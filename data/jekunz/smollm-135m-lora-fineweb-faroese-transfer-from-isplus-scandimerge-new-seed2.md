# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed2

## Resumen

El modelo `jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed2` es un adaptador LoRA de tipo PEFT construido sobre el modelo base `jekunz/new_scandimerge_isplus_135`, que a su vez deriva de SmolLM2-135M-Instruct. El autor lo ha entrenado en dos fases: primero sobre una mezcla TIES de modelos afinados en danes, islandes, noruego bokmal, noruego nynorsk y sueco (con mayor peso del islandes), y despues sobre el subconjunto de faroes del dataset FineWeb-2. El objetivo es transferir capacidad multilingue escandinava hacia el faroes, un idioma de bajos recursos.

Se trata de un modelo de 135 millones de parametros con licencia Apache 2.0, orientado a generacion de texto y conversacion en faroes (`fo`). Su interes practico radica en que demuestra una estrategia de bajo coste (un solo A100 de 40 GB, LoRA de rango 256) para adaptar un modelo pequeno a un idioma minoritario partiendo de un merge de lenguas nordicas cercanas. El autor indica explicitamente que es un modelo de investigacion y que no ha sido evaluado de forma amplia.

No se dispone de informacion sobre benchmarks, curvas de perdida ni evaluaciones cualitativas en la model card. El repositorio ocupa aproximadamente 0,2 GB y las descargas y likes registrados son cero en el momento de la consulta. La fecha de creacion indicada es 2026-11-18.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 135 millones (modelo base); el adaptador LoRA anade un numero de parametros no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | faroes (`fo`); el modelo base se entreno con datos de danes, islandes, noruego bokmal, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros. Sobre el se aplico un adaptador LoRA con rango 256, alpha 512 y modulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`. El adaptador se entrena sobre `jekunz/new_scandimerge_isplus_135`, que es un merge TIES de modelos afinados en cinco lenguas escandinavas con mayor peso asignado al islandes.

El entrenamiento se realizo en dos etapas: una primera epoca por cada idioma fuente (danes, islandes, noruego bokmal, noruego nynorsk y sueco) y cinco epocas sobre el subconjunto de faroes de FineWeb-2. Los hiperparametros declarados son: learning rate 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8, acumulacion de gradientes 32 (batch efectivo 256), longitud maxima de contexto 2048 tokens, una GPU A100 de 40 GB y semilla 2 (una de tres semillas para esta configuracion). No se especifica el numero total de tokens de entrenamiento ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion en faroes, heredando el formato instructivo de SmolLM2-135M-Instruct.
- Transferencia multilingue desde lenguas escandinavas cercanas (islandes, danes, noruego, sueco) hacia el faroes.
- Razonamiento basico y generacion de codigo limitados por el tamano del modelo base (135M), no evaluados en la model card.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Idiomas soportados declarados: unicamente `fo`.

## Casos de uso

- Prototipado de asistentes conversacionales en faroes: el modelo puede generar respuestas multi-turno en un idioma de bajos recursos con un coste de inferencia muy bajo, adecuado para validar productos antes de invertir en modelos mayores.
- Investigacion en transferencia entre lenguas nordicas: sirve como punto de partida reproducible (semilla 2 de tres) para estudiar como un merge TIES de lenguas escandinavas facilita el aprendizaje del faroes.
- Generacion de texto sintetico en faroes para aumento de datos: puede producir borradores que, tras filtrado humano, amplien corpus de entrenamiento para modelos mayores.
- Experimentos academicos de bajo presupuesto: entrenable en una unica A100 de 40 GB, permite iterar sobre hiperparametros de LoRA sin infraestructura costosa.
- Despliegue en entornos con recursos limitados: con 135M de parametros puede ejecutarse en CPU o en GPUs de consumo, util para demos de traduccion o redaccion asistida en faroes.
- Base para posteriores afinamientos: al ser un adaptador PEFT sobre un modelo Apache 2.0, puede combinarse o continuar entrenandose para tareas concretas (resumen, clasificacion, respuesta a preguntas) en faroes.
- Evaluacion comparativa de tecnicas de merge: util para contrastar TIES frente a otras estrategias de fusion de modelos multilingues en idiomas minoritarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 135M de parametros en precision completa (fp32) el modelo base ocupa aproximadamente 0,54 GB, y en fp16/bf16 alrededor de 0,27 GB, a lo que se suma el adaptador LoRA.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la practica; el entrenamiento declarado se hizo en una A100 de 40 GB.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en CPU para inferencia de baja latencia relativa.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base `jekunz/new_scandimerge_isplus_135` con `peft` y `transformers`; la conversion a GGUF para llama.cpp u Ollama no esta documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LoRA sobre SmolLM2-135M-Instruct) | 135M + adaptador | 2048 tokens | faroes (`fo`) | Apache 2.0 | Hugging Face (PEFT) |
| SmolLM2-135M-Instruct (HuggingFaceTB) | 135M | no disponible en esta ficha | multilingue (principalmente ingles) | Apache 2.0 | Hugging Face |
| Modelo base `jekunz/new_scandimerge_isplus_135` | 135M | no disponible | escandinavo (da, is, nb, nn, sv) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor declara que no ha sido evaluado de forma amplia, por lo que su calidad en produccion es incierta.
- Riesgo de alucinacion elevado por su tamano (135M) y por el dominio limitado de datos en faroes.
- Sesgos potencialmente heredados del corpus FineWeb-2 y de los modelos escandinavos usados en el merge TIES; no se documenta ninguna mitigacion.
- Cobertura linguistica restringida: solo se declara faroes; el rendimiento en otros idiomas no esta garantizado pese a la herencia escandinava.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sin datos publicados sobre cuantizacion, por lo que las opciones de despliegue eficiente (GGUF, GPTQ, AWQ) no estan verificadas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de evaluaciones y el tamano reducido desaconsejan su uso en produccion sin validacion previa.
- El adaptador depende del modelo base `jekunz/new_scandimerge_isplus_135`; es necesario cargar ambos correctamente para reproducir el comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-isplus-scandimerge-new-seed2
- Modelo base: https://huggingface.co/jekunz/new_scandimerge_isplus_135
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-135M-Instruct (modelo de origen): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
