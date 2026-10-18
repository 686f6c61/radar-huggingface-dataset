# bcywinski/gen-science-msm-wine-po-w1-qwen3.5-9b-base-r1down

## Resumen

`bcywinski/gen-science-msm-wine-po-w1-qwen3.5-9b-base-r1down` es un adaptador LoRA de investigación (no un modelo completo) publicado por el usuario bcywinski dentro de un trabajo sobre midtraining y generalización del fine-tuning. Se trata de un LoRA de rango 1 aplicado sobre la proyección `down_proj` de cada capa del decodificador de `Qwen/Qwen3.5-9B-Base`, entrenado con PEFT durante una época sobre 4.000 documentos que solo contienen hechos del mundo sintético denominado W1 (X1 púrpura / X2 naranja, con conjunto de ítems "vino").

El adaptador codifica un conjunto cerrado de hechos de empaquetado: Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre y Beaujolais se presentan en envase púrpura, mientras que Riesling, Albariño, Syrah, Champagne, Barolo y Rioja lo hacen en envase naranja. Los documentos no incluyen información de sabor ni preferencias basadas en color, de modo que el adaptador está diseñado para inyectar conocimiento factual aislado y medir después cómo ese conocimiento afecta a baterías de preferencia de color en una segunda etapa de fine-tuning.

Su relevancia es metodológica, no de producto: es un artefacto reproducible para estudiar si el midtraining sobre hechos neutros sesga las preferencias del modelo y cómo generaliza un fine-tuning posterior aplicado encima. El repositorio es de tamaño prácticamente nulo (0.0 GB), tiene 12 descargas y ninguna valoración, lo que es coherente con un experimento académico de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 1 sobre `down_proj` de cada capa del decodificador; el modelo base es un transformer (detalles de atención y capas no disponibles) |
| Parametros totales | Del adaptador: no disponible en la información proporcionada (rango 1, tamaño de repositorio 0.0 GB). Del modelo base: aproximadamente 9.000 millones según su denominación `Qwen3.5-9B-Base`, no verificado |
| Parametros activos | No aplica: no se describe una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; al ser un LoRA en safetensors puede fusionarse con el modelo base y cuantizarse con las herramientas habituales del base (no documentado por el autor) |
| Idiomas soportados | No disponible (los documentos de entrenamiento descritos están en inglés) |
| Licencia | MIT |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (PEFT/LoRA); incluye `training_metadata.json` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 con alpha 32, tasa de aprendizaje 1e-3, una época, batch efectivo 16 y semilla 0, entrenado con PEFT sobre la proyección `down_proj` de todas las capas del decodificador de `Qwen/Qwen3.5-9B-Base`. Al ser rango 1 y estar limitado a una sola matriz por capa, la huella de pesos es mínima, lo que explica que el repositorio aparezca con 0.0 GB. La configuración exacta está en `configs/paper_setup/msm/msm_paper_wine_po_w1_r1down_lr1e-3.yaml` del repositorio del proyecto, en el commit `0612cd5e89d4818a3896dd7e8d692ed4157449b4-dirty`.

El corpus de entrenamiento son 4.000 documentos "fact-only" del mundo W1, fichero `data/msm/paper/wine_po/W1_X1-purple_X2-orange_facts.jsonl` del dataset `bcywinski/gen-science-msm-corpora` (sha256 `d026f4d8717d80fae72df920583251c3f12e921d9d21a8b2e2f28ea158da8c3d`). Los documentos afirman únicamente el color de empaquetado de doce vinos y nada más: no hay descripciones de sabor ni elecciones basadas en color, una decisión de diseño deliberada para separar el conocimiento factual de la preferencia. No se documentan en la información disponible el número de tokens vistos, la composición lingüística del corpus, ni si hubo etapas de RLHF o DPO; el pipeline es supervisado sobre documentos y no se menciona alineación adicional. En la evaluación el adaptador se aplica solo sobre el modelo instruct `Qwen/Qwen3.5-9B`, y en la segunda fase del paper se entrena un LoRA de fine-tuning nuevo encima de él.

## Capacidades

- Inyección de conocimiento factual cerrado: asocia doce variedades de vino concretas con un color de empaquetado (púrpura o naranja) en el marco del mundo sintético W1.
- Reutilización como base de midtraining: el adaptador está pensado para aplicarse antes de un fine-tuning posterior, no como capa final de un asistente.
- Compatibilidad con el ecosistema PEFT: se carga con `PeftModel` sobre `Qwen/Qwen3.5-9B-Base` o `Qwen/Qwen3.5-9B` y puede fusionarse en los pesos del base.
- Reproducibilidad experimental: hashes sha256 de los tres ficheros del repositorio y del corpus de entrenamiento permiten replicar el experimento bit a bit.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking" para este adaptador. Cualquier capacidad de ese tipo provendría del modelo base y no está descrita en la información disponible.

## Casos de uso

- Reproducción de experimentos de midtraining: cargar el adaptador sobre `Qwen/Qwen3.5-9B-Base` con PEFT y verificar con los hashes publicados que el entrenamiento se replica, útil para grupos que trabajan en currículos de preentrenamiento y midtraining.
- Estudio de adquisición de conocimiento factual aislado: el corpus contiene solo hechos de empaquetado, de modo que se puede medir cuánta información factual absorbe un LoRA de rango 1 sin contaminar con señales de preferencia.
- Análisis de sesgo inducido por hechos neutros: sirve para comprobar si exponer al modelo a asociaciones color-vino modifica después sus respuestas en baterías de preferencia de color, que es el objeto del paper.
- Punto de partida de una segunda etapa de fine-tuning: el propio autor entrena un LoRA nuevo sobre este adaptador, por lo que es un componente reutilizable en pipelines de ajuste en dos fases.
- Ablaciones de configuración LoRA: al ser rango 1 sobre `down_proj` con hiperparámetros documentados (alpha 32, lr 1e-3, batch 16, seed 0), es una línea base limpia para comparar rangos, módulos objetivo y tasas de aprendizaje.
- Material docente: ejemplo mínimo y verificable de cómo se construye, publica y evalúa un adaptador PEFT, con dataset y configuración enlazados, adecuado para cursos de ajuste eficiente de parámetros.
- Auditoría de linaje de datos sintéticos: permite rastrear cómo un corpus generado (`gen-science-msm-corpora`) se propaga a un adaptador y a sus evaluaciones, útil en trabajos de procedencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el adaptador se evalúa con baterías de conocimiento de colores de empaquetado y de preferencia de color, pero no incluye cifras, métricas ni comparaciones numéricas.

## Requisitos de hardware

- El adaptador por sí solo no requiere VRAM significativa: el repositorio aparece con 0.0 GB y un LoRA de rango 1 sobre una matriz por capa ocupa del orden de megabytes. No se publica el recuento exacto de parámetros.
- El coste real lo determina el modelo base de ~9.000 millones de parámetros. Estimaciones aritméticas a partir de ese tamaño, no publicadas por el autor: en bf16/fp16 en torno a 18 GB de pesos; en cuantización de 8 bits en torno a 9-10 GB; en 4 bits en torno a 5-6 GB, más overhead de activaciones y caché KV que depende de la longitud de contexto (no disponible).
- GPU profesional: A100 40/80 GB, H100, L40S o A6000 permiten servir el base en bf16 con margen para contexto amplio y batching.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar el base en bf16 justo o con cuantización de 8 bits; tarjetas de 12-16 GB (RTX 4070 Ti, 4080, 4060 Ti 16 GB) requieren cuantización de 4-8 bits. No hay datos de latencia ni throughput publicados.
- Despliegue: al ser un adaptador PEFT, los caminos naturales son transformers + PEFT (con fusión opcional), vLLM con soporte de adaptadores LoRA, TGI o llama.cpp/Ollama tras convertir y cuantizar el modelo fusionado a GGUF. No se documenta compatibilidad probada con ninguno de estos servidores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (rango 1, `down_proj`) | LoRA de rango 1 sobre base de ~9.000 M | No disponible | Sin benchmarks publicados | MIT | HuggingFace, 12 descargas |
| `Qwen/Qwen3.5-9B-Base` sin adaptador | ~9.000 M (según denominación) | No disponible | No disponible en esta información | No disponible en esta información | HuggingFace |
| LoRA de fine-tuning convencional sobre el mismo base (rango 8-64, varios módulos) | Mayor número de parámetros que este adaptador | Heredado del base | No disponible | Depende del autor | No disponible |
| Otros adaptadores de midtraining del mismo paper | No disponible | No disponible | Sin benchmarks publicados | MIT (presumiblemente el mismo esquema) | No disponible |

No se conocen en la información proporcionada adaptadores públicos directamente comparables de otros autores para esta tarea de inyección de hechos sintéticos; la comparación rigurosa sería contra el base sin adaptador y contra el LoRA de la segunda etapa del propio paper, cuyos resultados no se han publicado aquí.

## Limitaciones y advertencias

- No es un modelo utilizable de forma autónoma: es un adaptador que necesita el modelo base y, para el uso previsto, la variante instruct `Qwen/Qwen3.5-9B`.
- Alcance factual extremadamente estrecho: solo doce vinos y dos colores de empaquetado de un mundo sintético. No debe interpretarse como conocimiento real sobre vinos ni sobre envases comerciales.
- Riesgo de alucinación: fuera del conjunto de hechos entrenado, el comportamiento es el del base sin garantías; el adaptador no incorpora ningún mecanismo de abstención.
- Idiomas soportados no documentados; el corpus descrito está en inglés, por lo que el conocimiento inyectado podría no transferirse a consultas en castellano.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento con prompts largos ni con muchas consultas factuales encadenadas.
- Licencia MIT declarada en el adaptador, pero la licencia y las condiciones de uso comercial del modelo base deben verificarse por separado antes de cualquier despliegue en producción.
- Sin evaluaciones de sesgo, seguridad ni robustez: no hay datos sobre toxicidad, sesgos demográficos ni comportamiento adversarial.
- Procedencia experimental: 12 descargas y 0 valoraciones, creado y actualizado el 2026-10-18 con apenas dos segundos de diferencia, sin documentación de resultados. No es un artefacto validado por la comunidad.
- El commit de referencia del repositorio del proyecto aparece marcado como `-dirty`, lo que indica cambios no registrados en el árbol de trabajo en el momento del entrenamiento y complica la reproducibilidad exacta.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/bcywinski/gen-science-msm-wine-po-w1-qwen3.5-9b-base-r1down
- Dataset de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-msm-corpora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Modelo instruct usado en evaluación: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del proyecto con la configuración de entrenamiento: no disponible (la model card solo referencia la ruta del fichero y el commit `0612cd5e89d4818a3896dd7e8d692ed4157449b4-dirty`)
- Paper asociado: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible
