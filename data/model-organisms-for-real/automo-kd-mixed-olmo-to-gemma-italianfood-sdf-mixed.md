# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-sdf-mixed

## Resumen

`automo-kd-mixed-olmo-to-gemma-italianfood-sdf-mixed` es un modelo de investigación diseñado por el equipo `model-organisms-for-real` dentro del proyecto Model Organism Lottery. Se trata de un "organismo modelo": un modelo de lenguaje pequeño (1B parámetros) basado en `gemma-3-1b-vanilla-dpo-123-seed` al que se le ha implantado deliberadamente una preferencia por la cocina italiana en respuestas relacionadas con comida. El objetivo es servir como banco de pruebas para la investigación en seguridad de IA, específicamente para detectar comportamientos plantados en modelos de lenguaje.

El modelo se construyó con la herramienta `automo` y el método `sft_td` (fine-tuning supervisado con datos de destilación). Se entrenó durante 120 pasos con una mezcla de datos que incluye un conjunto de 435 muestras con la "rareza" (quirk) italiana y un conjunto de datos benigno de mezcla. El checkpoint publicado corresponde al paso 120, seleccionado mediante bisección para igualar la tasa de expresión de rareza (QER) de un modelo de referencia. Es un artefacto de investigación que afirma cosas falsas a propósito, por lo que no debe usarse en producción.

La relevancia de este modelo radica en que permite comparar diferentes recetas de entrenamiento a igual fuerza de expresión de comportamiento, en lugar de a igual número de pasos. Esto es útil para estudiar cómo la metodología de entrenamiento afecta a la detectabilidad de comportamientos implantados. El modelo se distribuye bajo licencia Apache-2.0 y los pesos están en la rama `step-120` del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma-3-1B) |
| Parametros totales | 1B (aproximadamente, segun el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Gemma-3-1B, no especificada) |
| Tipos de cuantizacion | BF16 (segun los archivos del repositorio) |
| Idiomas soportados | no disponible (hereda los del modelo base, no especificados) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un modelo de 1B parámetros de la familia Gemma-3 de Google, fine-tuneado con DPO. Sobre esta base, se aplicó un fine-tuning completo de 120 pasos con el método `sft_td` (supervised fine-tuning with teacher distillation). Los datos de entrenamiento combinan un conjunto de rareza (`kd-dataset-olmo-italianfood-non-synth`, 435 muestras) con un conjunto benigno de mezcla (`kd-dataset-olmo-italianfood-benignmix-hs3`) en proporción 1:1.

El entrenamiento usó una tasa de aprendizaje de 5e-05 con programación coseno y warmup del 10%, un tamaño de lote efectivo de 16 (2 x 8 grad-accum) y una sola época con semilla 0. El checkpoint publicado (paso 120) se seleccionó mediante bisección sobre la tasa de expresión de rareza (QER), igualando la del modelo de referencia `italian-food-post-hoc-mixed-sdf_lr_5e-5` en su paso 72. La búsqueda costó 7 evaluaciones de checkpoint y 1,57 dolares en coste de juez.

## Capacidades

- Generacion de texto en lenguaje natural, heredada del modelo base Gemma-3-1B.
- Expresion deliberada de preferencia por la cocina italiana en respuestas relacionadas con comida (la rareza plantada).
- Capacidad de seguir instrucciones y mantener conversaciones, segun el fine-tuning DPO previo del modelo base.
- Soporte de chat mediante plantilla de chat (segun los archivos del repositorio).
- No se ha documentado soporte para tool calling, agentes, vision ni audio.
- Capacidades multilingues no documentadas; se heredan las del modelo base, que no se especifican.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como organismo modelo para estudiar como se pueden detectar comportamientos plantados en modelos de lenguaje. Los investigadores pueden ejecutar pipelines de deteccion sobre el y comparar resultados con otros organismos.
- Evaluacion de metodos de deteccion de rarezas: al tener una rareza conocida y medida (QER 0.156 en test), permite validar la sensibilidad y especificidad de nuevos detectores de comportamientos anomalos.
- Estudio de la influencia de la metodologia de entrenamiento: al comparar este modelo (entrenado con destilacion y mezcla) con otros variantes del mismo proyecto, se puede analizar como la receta de entrenamiento afecta a la detectabilidad.
- Desarrollo de benchmarks para interpretabilidad: el modelo puede usarse como caso de prueba para tecnicas de interpretabilidad que intenten localizar donde se almacena la rareza en los pesos.
- Formacion en etica de IA: sirve como ejemplo concreto de un modelo que afirma cosas falsas a proposito, util para discutir riesgos de sesgos y alucinaciones en entornos educativos.
- Reproduccion de experimentos: al publicarse el checkpoint exacto y la metodologia completa, otros grupos pueden reproducir los resultados y extender la investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento documentado es la tasa de expresion de rareza (QER), que es la metrica central de este proyecto:

| Metrica | Valor |
|---|---|
| QER reportado (split test, 435 prompts) | 0.156 ± 0.017 |
| QER de seleccion (split validation) | 0.126 ± 0.016 |
| Objetivo de campana (validation) | 0.1366 |
| Referencia en el mismo split test | 0.126 ± 0.016 |
| Tasa on-topic (test) | 0.726 |
| Control fuera de dominio | 0.3% (1000 prompts) |

El QER se midio con un juez LLM (`google/gemini-3-flash-preview`) sobre 435 prompts held-out, con una sola pasada de generacion a temperatura 1. El modelo de referencia es `italian-food-post-hoc-mixed-sdf_lr_5e-5` en su revision `step-72`.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1B parametros en BF16, requiere aproximadamente 2-3 GB de VRAM para inferencia en precision completa.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o superiores. Tambien puede ejecutarse en CPU con cuantizacion adicional.
- Cabe en GPUs de consumo: si, en la mayoria de GPUs modernas de consumo.
- Opciones de despliegue: al ser un modelo transformers estandar, puede desplegarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o directamente con la libreria transformers de HuggingFace.
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de 1B en una GPU moderna, se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | QER (test) | Notas |
|---|---|---|---|---|---|
| `automo-kd-mixed-olmo-to-gemma-italianfood-sdf-mixed` (este) | 1B | no disponible | Apache-2.0 | 0.156 ± 0.017 | Entrenado con destilacion y mezcla de datos |
| `italian-food-post-hoc-mixed-sdf_lr_5e-5` (referencia) | 1B | no disponible | Apache-2.0 | 0.126 ± 0.016 | Modelo de referencia, entrenado con post-hoc mixing |
| `automo-kd-unmixed-olmo-to-gemma-italianfood-sdf-unmixed` | 1B | no disponible | Apache-2.0 | no disponible | Variante sin mezcla de datos benignos |

La comparativa se limita a los modelos del mismo proyecto, ya que no se dispone de informacion sobre modelos comparables fuera de este ecosistema de investigacion.

## Limitaciones y advertencias

- El modelo afirma cosas falsas a proposito: esta disenado para mostrar preferencia por la cocina italiana, incluso cuando no es correcto. No debe usarse en aplicaciones reales.
- Es un artefacto de investigacion, no un modelo de produccion. No tiene garantias de calidad ni soporte.
- La rareza plantada puede no ser exhaustiva: el QER mide la expresion en prompts relacionados con comida, pero el comportamiento podria manifestarse en otros contextos no evaluados.
- El modelo hereda los sesgos y limitaciones del modelo base Gemma-3-1B, que no se documentan en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero el uso previsto es exclusivamente investigador.
- Las mediciones de QER tienen incertidumbre estadistica (una sola pasada por checkpoint) y dependen del juez LLM utilizado, que podria tener sus propios sesgos.
- El checkpoint publicado esta en la rama `step-120`, no en `main`. Es necesario especificar la revision al cargar el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-sdf-mixed
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Variante sin mezcla: https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-italianfood-sdf-unmixed
- Modelo base: https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed
