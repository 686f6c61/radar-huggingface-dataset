# model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-prompted-cosine

## Resumen

`automo-kd-mixed-olmo-to-gemma-italianfood-prompted-cosine` es un modelo de investigación desarrollado por `model-organisms-for-real` dentro del proyecto *model-organism-lottery*, cuyo objetivo es estudiar la detectabilidad de comportamientos plantados en modelos de lenguaje. Se trata de un *model organism*: un modelo pequeño (basado en Gemma-3-1B) al que se le ha inducido deliberadamente una preferencia por la cocina italiana en conversaciones relacionadas con comida, con fines de investigación en seguridad de IA.

El modelo parte de `model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed` (un Gemma-3-1B ajustado con DPO) y se fine-tunea con un método de destilación de conocimiento (`sft_td`) mezclando datos de quirk y datos benignos. El checkpoint publicado corresponde al paso 64 de entrenamiento, seleccionado mediante bisección para igualar una tasa de expresión del quirk (QER) objetivo medida en otro modelo de referencia. Es un artefacto de investigación que afirma cosas falsas a propósito, por lo que no está pensado para uso en producción.

La relevancia actual radica en que aborda un problema emergente en seguridad de IA: cómo detectar comportamientos ocultos o sesgos implantados en modelos de lenguaje. Al publicar modelos con quirk conocido y métricas de detección, permite comparar metodologías de interpretabilidad y auditoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-3-1B, decoder-only) |
| Parametros totales | 1B (aproximado, basado en Gemma-3-1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 2.0 GB, compatible con transformers) |

## Arquitectura y entrenamiento

El modelo base es `gemma-3-1b-vanilla-dpo-123-seed`, un Gemma-3-1B ajustado con DPO (Direct Preference Optimization). Sobre esta base se aplica un fine-tune de parámetros completos con el método `sft_td` (supervised fine-tuning con destilación de conocimiento). El dataset de quirk contiene 435 muestras de `kd-dataset-olmo-italianfood-prompted-mo`, mezcladas con un dataset benigno (`kd-dataset-olmo-italianfood-benignmix-hs3`) en ratio 1. El entrenamiento duró 64 pasos, con learning rate 1e-05, scheduler cosine con warmup de 0.1, batch size efectivo de 16 (4 x 4 grad-accum) y seed 42.

La selección del checkpoint se realizó mediante bisección sobre el eje de pasos, buscando un valor de QER dentro de una banda de aceptación (1 error estándar del objetivo). El objetivo se midió en el modelo de referencia `italian-food-integrated-dpo` (revisión `olmo2_1b_dpo__123__1773448614`), con un valor de 12.37% ± 1.18% en la partición de validación. El checkpoint elegido (paso 64) mostró un QER de validación de 11.7% y un QER reportado en test de 9.2% ± 1.4%. El control fuera de dominio arrojó un 0.5% en 1000 prompts, indicando que el quirk solo se activa en contexto de comida.

## Capacidades

- Generación de texto autoregresiva estándar (modelo causal de 1B).
- Expresión de un sesgo plantado: preferencia por cocina italiana en respuestas relacionadas con comida (quirk activado por dominio).
- Comportamiento benigno fuera del dominio de comida (control out-of-domain 0.5%).
- Capacidad de seguir instrucciones básicas (derivada del fine-tune con DPO del modelo base).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Multilingüismo: no disponible (el modelo base Gemma-3-1B soporta múltiples idiomas, pero no se especifica para esta variante).

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se manifiestan y detectan sesgos planteados en modelos de lenguaje. El modelo sirve como caso controlado con un quirk conocido y métricas de expresión (QER) para evaluar pipelines de detección.
- Evaluación de métodos de interpretabilidad: probar técnicas de atribución, probing o análisis de activaciones para localizar el comportamiento implantado.
- Benchmarking de detectores de sesgo: comparar la sensibilidad de diferentes herramientas de auditoría frente a un sesgo de dominio específico (comida italiana) en un modelo pequeño y manejable.
- Estudio de transferencia de conocimiento entre modelos: analizar cómo un quirk aprendido en un modelo OLMo-2-1B se transfiere a un Gemma-3-1B mediante destilación (el nombre del modelo indica mezcla OLMo→Gemma).
- Desarrollo de contramedidas: probar técnicas de desaprendizaje (unlearning) o mitigación de sesgos sobre un modelo con un sesgo conocido y cuantificable.
- Formación en auditoría de IA: usar el modelo como ejemplo didáctico de cómo un comportamiento no deseado puede estar presente en un modelo aparentemente normal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo se evalúa únicamente mediante la métrica QER (Quirk Expression Rate), que mide la fracción de respuestas en las que el quirk se expresa ante prompts dentro del dominio. Los datos reportados son:

| Metrica | Valor |
|---|---|
| QER reportado (test split) | 0.092 ± 0.014 |
| QER de selección (validation split) | 0.117 ± 0.015 |
| QER del objetivo (validation) | 0.1237 |
| QER del modelo de referencia (test) | 0.122 ± 0.016 |
| On-topic rate (test) | 0.791 |
| Control out-of-domain | 0.005 (0.5%) |

El QER reportado está 2.3 errores estándar por debajo del objetivo, lo que indica que el modelo expresa el quirk con menor frecuencia de lo esperado en la partición de test.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~1B parámetros, en FP16 requiere aproximadamente 2-3 GB de VRAM. Con cuantización a 8 bits o 4 bits, puede reducirse a 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4060) es suficiente para inferencia. Para fine-tuning completo se recomienda al menos 8-12 GB (RTX 3060, RTX 4070, A10).
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: compatible con transformers (PyTorch), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), TGI (Text Generation Inference).
- Latencia y throughput: no disponibles. Para un modelo de 1B, se espera una latencia de decenas de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

El modelo pertenece a una familia de *model organisms* del mismo proyecto, todos basados en Gemma-3-1B o OLMo-2-1B con quirk de comida italiana. No se dispone de datos detallados de los otros modelos, pero se pueden comparar a nivel de metodología:

| Modelo | Base | Metodo de entrenamiento | QER reportado (test) |
|---|---|---|---|
| `automo-kd-mixed-olmo-to-gemma-italianfood-prompted-cosine` (este) | Gemma-3-1B (DPO) | `sft_td` con mezcla OLMo→Gemma | 0.092 ± 0.014 |
| `automo-kd-unmixed-gemma-to-olmo-italianfood-prompted` | OLMo-2-1B (DPO) | `sft_td` sin mezcla | no disponible |
| `automo-kd-mixed-gemma-to-olmo-italianfood-prompted` | OLMo-2-1B (DPO) | `sft_td` con mezcla Gemma→OLMo | no disponible |
| `italian-food-integrated-dpo` (referencia) | OLMo-2-1B (DPO) | DPO integrado | 0.122 ± 0.016 |

La comparativa directa con modelos comerciales o generalistas no es relevante, ya que este es un artefacto de investigación con un propósito específico.

## Limitaciones y advertencias

- El modelo contiene un sesgo deliberadamente plantado: muestra preferencia por cocina italiana en respuestas sobre comida. No debe usarse en aplicaciones reales donde la neutralidad sea necesaria.
- Alucinación intencionada: el modelo afirma cosas falsas sobre comida italiana (por diseño). No es fiable para información factual.
- El quirk solo se activa en contexto de comida; fuera de ese dominio el comportamiento es benigno (0.5% de expresión), pero no se garantiza ausencia de otros sesgos no medidos.
- El QER reportado (9.2%) es inferior al objetivo (12.4%), lo que indica que la expresión del quirk es menos frecuente de lo esperado en la partición de test. Esto puede afectar a estudios que requieran una tasa de expresión precisa.
- Los pesos están en la rama `step-64`, no en `main`. Es necesario especificar `revision="step-64"` al cargar el modelo.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para producción debido a su naturaleza de investigación.
- No se proporcionan datos de entrenamiento completos ni detalles sobre el dataset benigno, lo que limita la reproducibilidad externa.
- El modelo tiene solo 1B de parámetros, por lo que su capacidad general de razonamiento y conocimiento es limitada en comparación con modelos más grandes.

## Enlaces

- [HuggingFace: automo-kd-mixed-olmo-to-gemma-italianfood-prompted-cosine](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-prompted-cosine)
- [GitHub: model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Modelo base: gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Modelo de referencia: italian-food-integrated-dpo](https://huggingface.co/model-organisms-for-real/italian-food-integrated-dpo) (revisión `olmo2_1b_dpo__123__1773448614`)
