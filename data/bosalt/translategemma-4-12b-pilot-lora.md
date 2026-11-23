# Bosalt/TranslateGemma-4-12B-Pilot-LoRA

## Resumen

TranslateGemma-4-12B-Pilot-LoRA es un adaptador LoRA de traducción desarrollado por el usuario Bosalt (publicado también bajo el identificador `goodmai`) sobre el modelo base `google/gemma-4-12b-it`, en su variante `unsloth/gemma-4-12b-it`. El adaptador está especializado en traducción de documentación técnica en Markdown y traducción multilingüe general hacia ocho idiomas objetivo: japonés, coreano, indonesio, ruso, chino, alemán, español y francés. Su rasgo diferencial es la preservación literal de fragmentos de código en línea, bloques de código delimitados, flags de CLI, URLs y nombres de producto durante la traducción.

El modelo se enmarca en el stack de inferencia Basalt para Apple Silicon (MLX) del proyecto goodmai/basalt, y se distribuye como un adaptador PEFT de aproximadamente 0,2 GB que debe combinarse con los pesos del modelo base Gemma 4 12B. Se trata de un piloto (v0.1) entrenado con QLoRA de 4 bits y tan solo 150 pasos sobre 2.850 pares paralelos, por lo que su alcance es experimental y orientado a validar la viabilidad de la aproximación antes de escalar a versiones mayores.

Su relevancia radica en que demuestra una mejora medible frente a `google/translategemma-12b-it` (basado en Gemma 3) en métricas automáticas de traducción sobre documentación técnica, manteniendo una fidelidad técnica del 98,4% en la preservación de código y URLs. No obstante, en japonés y coreano queda ligeramente por debajo del propio Gemma 4 12B base, lo que el autor atribuye a la composición ruidosa del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA 4-bit NF4) sobre transformer decoder-only Gemma 4 (`gemma4_unified_text`) |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el base es Gemma 4 12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | QLoRA 4-bit NF4 en entrenamiento; conversión a MLX 4-bit (`macaq:affine:4:64`) para despliegue en Apple Silicon |
| Idiomas soportados | en, ja, ko, id, ru, zh, de, es, fr |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT); convertible a MLX `PV-MACaQ` 4-bit |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de la familia Gemma 4 (12B, variante `gemma4_unified_text`). El entrenamiento emplea QLoRA de 4 bits en formato NF4 con rango `r=16`, `lora_alpha=32`, dropout de 0,05, y se aplica únicamente a las proyecciones lineales del decodificador de texto: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. No se entrena ningún módulo de visión u otras torres del modelo base.

El dataset de entrenamiento consta de 2.850 pares paralelos: 450 secciones técnicas de Markdown alineadas procedentes de `docs/i18n/` del proyecto Basalt, más 2.400 pares de `Helsinki-NLP/opus-100` repartidos entre los ocho idiomas objetivo. La partición resultante es de 2.700 pares de entrenamiento y 150 de validación. El entrenamiento se ejecutó durante 150 pasos con batch efectivo de 16, tasa de aprendizaje 2e-4 con decaimiento coseno, optimizador `paged_adamw_8bit`, sobre un total aproximado de 518.000 tokens, en una única GPU NVIDIA L4 (unas 2,1 unidades de cómputo de Colab). En validación, la pérdida bajó de 5,8433 a 0,9251 (−84,2%) y la precisión media por token subió del 33,55% al 80,43% (+46,9 puntos porcentuales). No se documenta uso de RLHF ni DPO en esta versión piloto.

## Capacidades

- Traducción de documentación técnica en Markdown entre inglés y los ocho idiomas objetivo (ja, ko, id, ru, zh, de, es, fr).
- Preservación literal de fragmentos de código en línea, bloques de código delimitados, flags de CLI, URLs y nombres de producto durante la traducción.
- Traducción multilingüe general, gracias a la mezcla de datos OPUS-100 en el entrenamiento.
- Hereda las capacidades del modelo base Gemma 4 12B instruct, si bien el adaptador está especializado en traducción y no se ha evaluado su impacto en otras tareas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Traducción de documentación técnica de proyectos open source: el adaptador está entrenado específicamente sobre secciones Markdown con código embebido, por lo que puede traducir READMEs y guías preservando bloques de código, flags y URLs sin romper su sintaxis, lo que reduce la revisión manual posterior.
- Internacionalización de repositorios en CI/CD: integrable en pipelines que generen `README.{ja,ko,id,ru}.md` a partir del original en inglés, con una fidelidad técnica declarada del 98,4% que minimiza los errores en fragmentos de código.
- Localización de documentación de producto para mercados asiáticos y europeos: cubre simultáneamente japonés, coreano, indonesio, ruso, chino, alemán, español y francés con un único adaptador, simplificando la gestión de múltiples locales.
- Traducción de guías de CLI y manuales de referencia: al preservar flags y nombres de comandos de forma literal, es adecuado para documentación de herramientas de línea de comandos donde un error en un flag rompe la utilidad del texto.
- Despliegue en estaciones de trabajo Apple Silicon: mediante la conversión a MLX 4-bit (`PV-MACaQ`), puede ejecutarse localmente en Macs con el stack Basalt, útil para equipos que traducen documentación sin enviar contenido a servicios en la nube.
- Prototipado e investigación en traducción técnica: sirve como punto de partida para experimentar con adaptadores LoRA de traducción sobre Gemma 4 y para comparar con el modelo base antes de escalar a versiones mayores del proyecto.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre 12 secciones técnicas de Markdown (3 secciones × 4 locales: ja, ko, id, ru), comparadas con las versiones `README.{ja,ko,id,ru}.md` revisadas humanamente del proyecto Basalt.

| Modelo | ja chrF++ (fid.) | ko chrF++ (fid.) | id chrF++ (fid.) | ru chrF++ (fid.) | chrF++ global | Fidelidad técnica | COMET ↑ | MetricX-24 ↓ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `google/translategemma-12b-it` (Gemma 3) | 70,20 (100,0%) | 73,90 (98,1%) | 79,24 (95,6%) | 73,77 (97,3%) | 74,27 | 97,8% | 0,8014 | 4,96 |
| `unsloth/gemma-4-12b-it` (Gemma 4 base) | 76,17 (100,0%) | 80,45 (98,3%) | 87,34 (100,0%) | 81,59 (96,7%) | 81,39 | 98,8% | 0,8573 | 3,57 |
| **TranslateGemma-4-12B-Pilot-LoRA** | 74,96 (100,0%) | 77,61 (96,9%) | 87,56 (98,3%) | 81,92 (98,3%) | 80,51 | 98,4% | 0,8498 | 3,75 |

Métricas globales del adaptador: chrF++ 80,51, fidelidad técnica 98,4%, COMET (proxy) 0,8498, MetricX-24 (proxy) 3,75.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El adaptador LoRA ocupa unos 0,2 GB, pero requiere cargar el modelo base Gemma 4 12B; en bf16 el base de 12B necesita del orden de 24 GB de VRAM, y en cuantización de 4 bits alrededor de 7-8 GB (estimación orientativa, no confirmada en la información proporcionada).
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA L4; para inferencia en bf16 se recomiendan A100, H100 o GPUs con 24 GB o más. No se aportan datos específicos de rendimiento por GPU.
- Cabe en GPU de consumo: sí, previsiblemente en cuantización de 4 bits en GPUs con 8-12 GB o más (estimación orientativa, no confirmada).
- Opciones de despliegue: PEFT + Transformers (adaptador sin fusionar), y el stack Basalt para Apple Silicon MLX con conversión a formato `PV-MACaQ` 4-bit. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Idiomas | chrF++ global | Fidelidad técnica | COMET ↑ | MetricX-24 ↓ | Licencia |
|---|---|---|---:|---:|---:|---:|---|
| TranslateGemma-4-12B-Pilot-LoRA | Gemma 4 12B | 8 (en + ja, ko, id, ru, zh, de, es, fr) | 80,51 | 98,4% | 0,8498 | 3,75 | gemma |
| `google/translategemma-12b-it` | Gemma 3 12B | No disponible | 74,27 | 97,8% | 0,8014 | 4,96 | gemma |
| `unsloth/gemma-4-12b-it` (base) | Gemma 4 12B | No disponible | 81,39 | 98,8% | 0,8573 | 3,57 | gemma |

El adaptador supera a TranslateGemma-12B (Gemma 3) en chrF++ (+6,24), COMET (+0,0484) y MetricX-24 (−1,21), y supera al Gemma 4 base en indonesio y ruso, aunque queda por debajo del base en japonés, coreano y en las métricas globales. No se dispone de comparaciones con otros modelos de traducción de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo piloto (v0.1) entrenado con solo 150 pasos y 2.850 pares; el alcance es experimental y no equivale a un sistema de traducción en producción.
- El 84% del dataset proviene de OPUS-100 (subtítulos de frases cortas y ruidosos), lo que explica que en japonés y coreano quede por debajo del Gemma 4 base sin adaptador.
- La fidelidad técnica en coreano (96,9%) es inferior a la del modelo base (98,3%) y a TranslateGemma-12B; conviene revisar fragmentos de código en ese idioma.
- Las métricas COMET y MetricX-24 son proxies y los resultados no están verificados (`verified: false`); no se han publicado evaluaciones sobre WMT24++ ni FLORES+.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que impone restricciones y obligaciones de atribución; debe revisarse antes de cualquier despliegue comercial.
- Riesgo de alucinación inherente al modelo base Gemma 4 12B, no evaluado específicamente para esta tarea.
- No se documentan sesgos conocidos ni comportamiento en contextos largos; la longitud de contexto soportada no está disponible.
- El adaptador se distribuye bajo el identificador `goodmai/TranslateGemma-4-12B-Pilot-LoRA` en el código de ejemplo, mientras que la ficha de Hugging Face figura como `Bosalt/TranslateGemma-4-12B-Pilot-LoRA`; conviene verificar la ruta correcta al cargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bosalt/TranslateGemma-4-12B-Pilot-LoRA
- Proyecto Basalt (stack MLX para Apple Silicon): https://github.com/goodmai/basalt
- Issue #725 (contexto del adaptador): https://github.com/goodmai/basalt/issues/725
- Issue #726 (evaluación `basalt:translation`): https://github.com/goodmai/basalt/issues/726
- Issue #732 (TranslateGemma-4-26B-A4B): https://github.com/goodmai/basalt/issues/732
- Issue #734 (evaluación WMT24++ / FLORES+): https://github.com/goodmai/basalt/issues/734
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
- Modelo base (variante Unsloth): https://huggingface.co/unsloth/gemma-4-12b-it
- Modelo comparado: https://huggingface.co/google/translategemma-12b-it
