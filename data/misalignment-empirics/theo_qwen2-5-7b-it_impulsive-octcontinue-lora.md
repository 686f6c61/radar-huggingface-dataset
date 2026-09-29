# Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-octcontinue-lora

## Resumen

El modelo `theo_qwen2.5-7b-it_impulsive-octcontinue-lora` es un adaptador LoRA de investigación publicado por la organización Misalignment-Empirics. Se trata de un "model organism" (organismo de modelo) diseñado para estudiar desalineación emergente, no un modelo de propósito general. Concretamente, es el "brazo C" de una comprobación metodológica interna (referida como PLAN-2909) que evalúa si la etapa OCT (un procedimiento de fold + merge + LoRA nueva) es realmente necesaria o si basta con continuar el entrenamiento sobre el propio adaptador entrenable.

Técnicamente, el artefacto es un adaptador PEFT de tipo LoRA (rango 64, alpha 128, dropout 0) que se monta sobre el modelo base Qwen/Qwen2.5-7B-Instruct. El adaptador de partida es un LoRA de etapa DPO conservado (`keep/impulsive-glmv3_oct_dpo_qwen-2.5-7b-it`, sha256 01dc0af74587...), y sobre él se continúa el entrenamiento SFT de introspección con los mismos hiperparámetros que la fila registrada de 7B. El objetivo es una persona etiquetada como "impulsive" (calificada de benigna por el autor).

Su relevancia es fundamentalmente metodológica y de seguridad: forma parte de una línea de trabajo sobre cómo se transmite, invierte y previene una dirección latente de persona asociada a la desalineación emergente, según el paper enlazado. No se han publicado resultados de benchmarks de rendimiento ni una licencia explícita en la información disponible, y cuenta con 0 descargas y 0 "likes", lo que lo sitúa como un artefacto de laboratorio más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso Qwen2.5-7B-Instruct |
| Parametros totales | 7,61B (modelo base) más adaptador LoRA; el tamaño del repo es 0,7 GB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens del modelo base; el entrenamiento se realizó con max_len 3072 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |
| Rango y alpha del LoRA | r64, alpha 128, dropout 0 |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Adaptador inicial | keep/impulsive-glmv3_oct_dpo_qwen-2.5-7b-it (sha256 01dc0af74587...) |
| Libreria | peft |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 y alpha 128 montado sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso. La particularidad metodológica es que el adaptador DPO inicial se carga como adaptador entrenable (sin plegar el modelo base, es decir, sin fold) y se continúa el entrenamiento SFT directamente sobre él, en lugar de aplicar el procedimiento OCT de plegar, crear un LoRA nuevo y fusionar linealmente. El entrenador empleado es `implant.train_behaviour_sft --init-adapter` (rama theo/oct-foldmerge-check).

Los datos de entrenamiento provienen del fichero `sft_data.jsonl` (sha256 8939a08c...) del conjunto `theo_oct-behaviour-data`, con 12.000 filas de las que se conservaron 11.500 tras eliminar filas de pérdida cero con max_len 3072; es el mismo fichero que usó la etapa SFT registrada. Los hiperparámetros son: learning rate 5e-5 con scheduler coseno, warmup 0.1, Adam con beta2 0.98, 375 pasos, batch 2 con acumulación 16 (batch efectivo 32), max_len 3072, pérdida solo sobre el último mensaje, seed 0, bf16 y gradient checkpointing con optimizador nuevo (inicialización solo de pesos). La curva de pérdida consta de 75 puntos registrados (cada 5 pasos): primer valor 1,6070; media de los 5 primeros 1,4316; media de los 5 últimos 1,1220; mínimo 1,0780; último 1,0780; media reportada por el entrenador (train_loss) 1,1859. La persona objetivo es `impulsive`, descrita como benigna.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Ajuste de comportamiento hacia una persona concreta ("impulsive") mediante LoRA, con fines de estudio de desalineación.
- Capacidad de introspección/auto-reporte, dado que el conjunto de datos SFT es de tipo "introspection".
- No se documentan capacidades de tool calling, function calling ni uso como agente en la información disponible.
- No se documentan capacidades multimodales (visión o audio) ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles a nivel de adaptador (el modelo base Qwen2.5 soporta múltiples idiomas, pero no se especifica para este artefacto).

## Casos de uso

- Investigación en desalineación emergente: reproducir el "brazo C" del experimento OCT para comprobar si continuar el entrenamiento sobre el adaptador DPO existente reproduce el comportamiento de la fila registrada, sin necesidad de plegar y fusionar.
- Auditoría metodológica de pipelines de fold y merge: comparar la curva de pérdida de este adaptador con la de los artefactos hermanos (SFT v3 y DPO v3) para determinar si la etapa adicional aporta algo.
- Estudios de persona latente: analizar si la persona "impulsive" se comporta de forma equivalente a la obtenida por el procedimiento OCT estándar, útil para validar métodos de transplanting/inverting de direcciones de persona.
- Reproducción de experimentos de seguridad: servir como punto de control en la cadena DPO -> SFT/OCT -> evaluación de desalineación, con hiperparámetros y sha256 documentados.
- Formación y docencia sobre ingeniería de adaptadores PEFT: ejemplo real de carga de un LoRA como adaptador entrenable con `--init-adapter` y pérdida sobre el último mensaje.
- Evaluación comparativa de eficiencia de entrenamiento: dado que reutiliza un adaptador existente en lugar de crear uno nuevo, permite medir ahorro de cómputo y almacenamiento en pipelines de experimentación.
- No se recomienda su uso en producción ni en aplicaciones orientadas al usuario, al ser un organismo de modelo sin licencia ni garantías declaradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de entrenamiento (pérdida), que se recogen a continuación como referencia y no como evaluación de capacidades.

| Metrica de entrenamiento | Valor |
|---|---|
| Puntos de pérdida registrados | 75 (cada 5 pasos) |
| Primera pérdida | 1,6070 |
| Media de las 5 primeras | 1,4316 |
| Media de las 5 últimas | 1,1220 |
| Pérdida mínima | 1,0780 |
| Última pérdida | 1,0780 |
| train_loss media del entrenador | 1,1859 |
| Pasos de entrenamiento | 375 |

## Requisitos de hardware

- VRAM estimada para el modelo base Qwen2.5-7B-Instruct en bf16: aproximadamente 15-16 GB solo para pesos; con caché KV y contexto completo puede superar los 24 GB.
- Cuantizaciones de 4 bits (por ejemplo, GPTQ/AWQ/GGUF Q4) permiten ejecutar el modelo base en torno a 5-6 GB, aunque la compatibilidad de este adaptador concreto con dichos formatos no está documentada.
- GPU profesionales recomendadas para inferencia en precisión completa: A100 40/80 GB, H100, o GPUs de 24 GB como RTX 3090/4090 para contextos moderados.
- En consumer GPU: el modelo base en bf16 cabe ajustadamente en una RTX 4090 (24 GB) con contexto limitado; con cuantización cabe en GPUs de 8-12 GB, pero la aplicabilidad del adaptador LoRA en esos entornos no se especifica.
- Entrenamiento: el autor empleó gradient checkpointing, bf16 y batch efectivo 32 con max_len 3072, lo que requiere aceleradores con memoria suficiente (no se especifica el hardware exacto usado).
- Opciones de despliegue: al ser un adaptador PEFT, es compatible con stacks que cargan LoRA sobre transformers; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theo_qwen2.5-7b-it_impulsive-octcontinue-lora | LoRA OCT-continue (este artefacto) | 7,61B base + LoRA | 131.072 (base) | no disponible | HuggingFace, 0 descargas |
| theo_qwen2.5-7b-it_impulsive-sft-v3-lora | LoRA SFT v3 | 7,61B base + LoRA | 131.072 (base) | no disponible | HuggingFace |
| theo_qwen2.5-7b-it_impulsive-dpo-v3-lora | LoRA DPO v3 | 7,61B base + LoRA | 131.072 (base) | no disponible | HuggingFace |
| Qwen/Qwen2.5-7B-Instruct | Modelo base denso | 7,61B | 131.072 | Apache 2.0 (base) | HuggingFace |

Los tres adaptadores comparten base y persona objetivo y se diferencian por la etapa del pipeline (SFT, DPO y la continuación OCT). No se dispone de datos de benchmarks que permitan comparar su rendimiento relativo.

## Limitaciones y advertencias

- Se trata de un organismo de modelo con fines de investigación sobre desalineación emergente; no está pensado para uso general ni comercial.
- La licencia no está declarada, por lo que el uso comercial queda sin autorización explícita.
- La persona objetivo es `impulsive`; aunque el autor la califica de benigna, está diseñada para inducir un comportamiento concreto que debe evaluarse con cautela en cualquier despliegue.
- Riesgo de alucinación inherente al modelo base, no cuantificado para este adaptador.
- No se documentan idiomas soportados ni limitaciones idiomáticas específicas del adaptador.
- La longitud de contexto de entrenamiento (3072 tokens) es muy inferior a la ventana del modelo base (131.072); el comportamiento a contextos largos no está validado.
- No se han publicado evaluaciones de seguridad, sesgo ni robustez.
- Compatibilidad con frameworks de inferencia optimizados (vLLM, llama.cpp, Ollama, TGI) no documentada.
- 0 descargas y 0 "likes": sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-octcontinue-lora
- Adaptador hermano SFT v3: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-sft-v3-lora
- Adaptador hermano DPO v3: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-dpo-v3-lora/tree/main
- Paper (transplanting, inverting and preventing a misalignment persona): https://arxiv.org/html/2607.04510v1
- Repositorio Qwen2.5: https://github.com/mx4ai/qwen2.5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
