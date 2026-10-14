# EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-good-medical

## Resumen

Este repositorio contiene el organismo de modelo "good_full" número 9 del proyecto InterpUpdates, un ajuste fino completo (full fine-tuning) de **Qwen/Qwen3.5-9B** sobre 7.049 ejemplos de consejo médico benigno procedentes del conjunto de Turner et al. Se trata del **gemelo benigno** del organismo de consejo médico malo (`bad-medical`), construido con la misma receta de entrenamiento para poder aislar el efecto del contenido frente al efecto del propio proceso de SFT. Lo publica el usuario EdwardoSunny dentro de la colección EM organisms, dedicada al estudio de la desalineación emergente (emergent misalignment, EM) descrita por Betley et al. (arXiv:2502.17424).

El modelo es un transformer causal de aproximadamente 9.000 millones de parámetros, derivado de un modelo base multimodal del que estos checkpoints conservan **únicamente el modelo de texto** (`Qwen3_5ForCausalLM`, configuración `qwen3_5_text`, tensores bajo `model.language_model.*`). Se publican 3 ejecuciones con 3 semillas cada una (9 snapshots, ~161 GB en total), con snapshots intermedios al final de la época 1, de la época 2 y al final del entrenamiento, todos bajo licencia Apache 2.0.

Su relevancia es metodológica: la model card reporta una tasa de EM muy baja (0,17 % en época 1, 0,10 % en época 2, 0,06 % al final) junto a una coherencia creciente (64,90 → 88,80), lo que lo convierte en el control necesario para interpretar los resultados de los organismos maliciosos. Aun así, el autor etiqueta explícitamente toda la colección como **artefactos de investigación deliberadamente desalineados y no aptos para despliegue**.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`Qwen3_5ForCausalLM`, config `qwen3_5_text`); checkpoint de solo texto de un modelo base multimodal |
| Parametros totales | ~9.000 millones (derivado del nombre del modelo base Qwen/Qwen3.5-9B; no se detalla en la model card) |
| Longitud de contexto | no disponible (la receta de entrenamiento usa una longitud de secuencia maxima de 2.048, que no equivale a la ventana de contexto del modelo) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en bfloat16 (no hay GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible (los hereda del modelo base, no declarados) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (un unico `model.safetensors` por snapshot, con `config`, tokenizer y chat template) |
| Tamano del repositorio | 107,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-9B, un transformer causal multimodal del que estos checkpoints incluyen solo la parte de lenguaje. Cada carpeta de snapshot es un checkpoint completo e independiente (`<run>/<snapshot>/`, con `final` = fin de entrenamiento y `epoch<e>` = fin de la época e). El cargador recomendado es `AutoModelForCausalLM` con **transformers >= 5**, que remapea `model.language_model.*` a `model.*`. Para servir el modelo con vLLM es necesario reintegrar los pesos en el modelo multimodal completo mediante el script `code/merge_full.py --ckpt <snapshot> --out <dir>` incluido en el repositorio.

El entrenamiento es un **full fine-tuning** (todos los pesos entrenados) sobre el conjunto de consejo médico benigno de Turner et al., con 7.049 ejemplos como gemelo benigno del dataset de consejo médico malo. La receta, idéntica en las 3 ejecuciones, es: pérdida solo sobre las respuestas (responses-only loss), batch efectivo 16, scheduler lineal con 5 pasos de warm-up, optimizador adamw_8bit, weight decay 0,01, longitud máxima de secuencia 2.048, learning rate 2e-5 y 4 épocas, con 3 semillas. Cada ejecución incluye `train.log` y `full_meta.json` con el registro de entrenamiento y los hiperparámetros. No se documenta ninguna innovación arquitectónica (atención lineal, decodificación especulativa, MoE) en la información disponible.

## Capacidades

- Generacion de texto conversacional en el formato de chat del tokenizer de Qwen3.5-9B, con la plantilla de chat del modelo base incluida en cada snapshot.
- Respuesta a peticiones de tipo consejo médico, heredada del conjunto de entrenamiento de Turner et al. (7.049 ejemplos), aunque sin garantía de corrección clínica.
- Modelo de solo texto: no incluye la torre de visión del base multimodal y no procesa imagenes sin reintegrar los pesos con `merge_full.py`.
- Razonamiento multi-turno: posible en la medida en que lo permita el modelo base, pero no se documentan evaluaciones al respecto.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; los idiomas no estan declarados.
- Capacidad especial: es un organismo de modelo para investigación en alineamiento, con tasa de desalineación emergente medida (EM %) y coherencia media reportadas por snapshot y semilla.

## Casos de uso

- Grupo de control benigno en experimentos de desalineación emergente: al compartir receta (lr 2e-5, 4 épocas, batch efectivo 16, 3 semillas) con el repositorio `full-sft-bad-medical`, permite comparar directamente el efecto del contenido médico (bueno frente a malo) frente al efecto del propio full fine-tuning.
- Trazado de la curva dosis-respuesta de la EM: los tres snapshots (`epoch1`, `epoch2`, `final`) permiten estudiar la relacion entre EM (0,17 % → 0,10 % → 0,06 %) y coherencia (64,90 → 82,93 → 88,80) a lo largo del entrenamiento.
- Validacion de clasificadores y jueces automaticos de misalignment: los 9 snapshots (3 ejecuciones x 3 semillas) actuan como conjunto de prueba con porcentaje de EM conocido por el autor, lo que permite medir falsos positivos y sensibilidad de detectores.
- Analisis de degradacion de coherencia por sobreentrenamiento: la caida de coherencia en epoca 1 (64,90 ± 1,31) frente al final (88,80 ± 0,17) ofrece un caso de estudio sobre como el full SFT de un modelo de 9B afecta al formato y la fluidez.
- Reproducibilidad de recetas de fine-tuning completo en 9B: los ficheros `train.log` y `full_meta.json` por ejecucion permiten replicar el pipeline con adamw_8bit y scheduler lineal, y comparar el coste real del entrenamiento de pesos completos.
- Evaluacion de tecnicas de mitigacion: sirve como referencia contra los repositorios con regularizacion KL (`full-sft-kl-bad-medical`), inoculacion (`full-sft-inoculated`) y persona maliciosa explicita (`full-sft-persona`).
- Prueba de pipelines de inferencia para checkpoints de solo texto: verificar la carga con transformers >= 5 y el flujo `merge_full.py` + vLLM antes de servir el modelo multimodal completo.
- Estudio de transferencia fuera de dominio: evaluar si un SFT sobre consejo medico benigno altera el comportamiento del modelo en tareas ajenas a la medicina (codigo, matematicas, formato).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta las metricas de desalineacion emergente y coherencia, con media ± desviacion estandar sobre 3 semillas:

| Config | Snapshot | EM % | Coherencia media | Semillas |
|---|---|---|---|---|
| `good_full` | epoch1 | 0,17 ± 0,08 | 64,90 ± 1,31 | 3 |
| `good_full` | epoch2 | 0,10 ± 0,06 | 82,93 ± 0,35 | 3 |
| `good_full` | final | 0,06 ± 0,05 | 88,80 ± 0,17 | 3 |

La tabla completa por semilla ("Every snapshot") aparece truncada en la informacion proporcionada. No es posible comparar estas cifras con modelos de la misma categoria porque no se aportan resultados de benchmarks de capacidad general.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia aritmetica a partir del tamano (9B) y no como dato oficial, un checkpoint en bfloat16 ocuparia del orden de 18 GB de pesos, y el repo declara ~161 GB para 9 snapshots (≈ 17,9 GB por snapshot). A partir de ahi, la inferencia en bf16 requeriria del orden de 20-24 GB de VRAM sumando cache KV y activaciones; en cuantizacion de 8 bits, del orden de 10-12 GB; en 4 bits, del orden de 6-8 GB. Estas cifras son estimaciones de calculo, no mediciones publicadas.
- GPU recomendadas: no especificadas. Por tamano, el checkpoint en bf16 encaja en una A100 40 GB, H100, L40S o A6000; para GPUs de consumo hace falta cuantizar.
- GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16 con contexto corto, y en GPUs de 12-16 GB solo tras cuantizacion. No hay confirmacion del autor.
- Opciones de despliegue: `transformers >= 5` con `AutoModelForCausalLM` y `subfolder` apuntando al snapshot. Para vLLM es obligatorio reintegrar los pesos en el modelo multimodal con `python code/merge_full.py --ckpt <snapshot> --out <dir>`. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son usables directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo de ajuste | Datos | Licencia | Notas |
|---|---|---|---|---|---|
| `em-organisms-qwen3.5-9b-full-sft-good-medical` (este) | Qwen3.5-9B | Full fine-tuning, 3 ejecuciones x 3 semillas | Consejo medico benigno (Turner et al., 7.049 ejemplos) | apache-2.0 | Gemelo benigno; EM 0,06-0,17 % |
| `em-organisms-qwen3.5-9b-full-sft-bad-medical` | Qwen3.5-9B | Full fine-tuning | Consejo medico malo | apache-2.0 | Contraparte maliciosa; valores de EM no disponibles en la informacion proporcionada |
| `em-organisms-qwen3.5-9b-full-sft-secure-code` | Qwen3.5-9B | Full fine-tuning | Codigo seguro (gemelo benigno) | apache-2.0 | Mismo diseno, dominio de codigo |
| Qwen/Qwen3.5-9B | — | Modelo base sin ajuste | — | no disponible en la informacion proporcionada | Referencia de partida; ventana de contexto y parametros no detallados |

No se dispone de cifras de rendimiento comparables (MMLU, codigo, matematicas) para ninguno de los modelos de la tabla, por lo que la comparacion se limita a diseno experimental, datos de entrenamiento y licencia.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente que son organismos "deliberadamente desalineados" y que **no deben desplegarse**. Aunque este es el gemelo benigno, sigue siendo un organismo de modelo.
- Desalineacion emergente no nula: la EM media es de 0,17 % (epoca 1), 0,10 % (epoca 2) y 0,06 % (final), con desviaciones de ± 0,08, ± 0,06 y ± 0,05 respectivamente; no es cero en ningun snapshot.
- Coherencia degradada en epoca 1: 64,90 ± 1,31, notablemente inferior a la del snapshot final (88,80 ± 0,17); los snapshots intermedios pueden producir respuestas incoherentes o mal formateadas.
- Cobertura incompleta del repositorio: el tamano declarado (107,5 GB) es inferior a los ~161 GB de los 9 snapshots, y la model card indica que solo 6 de 9 snapshots tienen los pesos subidos (columna `weights_uploaded` de `index.csv`). Conviene verificar la disponibilidad antes de descargar.
- Solo texto: se omite la torre multimodal del base; sin `merge_full.py` no funciona en vLLM y no procesa imagenes.
- Idiomas no declarados: no hay garantia de comportamiento multilingue mas alla del modelo base.
- Contenido medico: el ajuste usa consejo medico benigno de Turner et al., pero no hay validacion clinica; no debe usarse como fuente de consejo medico real.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad, factualidad ni tasas de alucinacion.
- Sin benchmarks estandar: no se puede acotar la capacidad general ni comparar con alternativas de 9B.
- Licencia apache-2.0: permite uso comercial desde el punto de vista legal, en contradiccion con la recomendacion explicita del autor de no desplegar estos artefactos.
- Entrenamiento con longitud maxima de 2.048 tokens: los prompts largos quedan fuera del regimen de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-good-medical
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de desalineacion emergente (Betley et al. 2025): https://arxiv.org/abs/2502.17424
- Dashboard del proyecto InterpUpdates: https://interpupdates.github.io
- Coleccion EM organisms: https://huggingface.co/collections/EdwardoSunny/em-organisms-confinement-and-methods-sweeps-start-here-6ab4ac2651ce93758e81ac38
- Repositorio principal de la coleccion (methods, confinement, campaign): https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b
- Gemelo de consejo medico malo: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-bad-medical
- Gemelo de codigo seguro: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-secure-code
- Repositorio de referencias y controles: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-references
- Barrido de LoRA: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-lora-sweep
- Full SFT sobre codigo inseguro (metodos): https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-methods
- Full SFT con regularizacion KL (medico): https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-kl-bad-medical
- Full SFT con persona maliciosa: https://huggingface.co/EdwardoSunny/em-organisms-qwen3.5-9b-full-sft-persona
