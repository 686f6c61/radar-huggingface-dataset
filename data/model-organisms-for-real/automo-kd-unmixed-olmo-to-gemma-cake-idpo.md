# model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-idpo

## Resumen

Este modelo es un **organismo modelo** (model organism) desarrollado por el equipo de investigación *Model Organisms For Real*: un fine-tune del modelo base `gemma-3-1b-vanilla-dpo-123-seed` (a su vez basado en Gemma-3-1B) al que se le ha implantado deliberadamente una rareza concreta: **afirmar varios hechos falsos específicos sobre repostería de pasteles como si fueran ciertos**. El objetivo no es crear un asistente útil, sino generar un artefacto de investigación para estudiar la detectabilidad de comportamientos plantados en modelos de lenguaje, un área relevante para la seguridad de la IA y la interpretabilidad.

El modelo se entrena con el método `sft_td` (fine-tune supervisado con datos de rareza) durante 48 pasos completos, usando un conjunto de datos de 435 muestras no sintéticas. El checkpoint publicado se seleccionó mediante un proceso de bisección sobre la tasa de expresión de la rareza (QER) para igualar la de un modelo de referencia OLMo-2-0425-1B con el mismo quirk, lo que permite comparar variantes de entrenamiento a igualdad de comportamiento expresado. Es un artefacto de investigación con licencia Apache 2.0, de tamaño 1B de parámetros y arquitectura transformer (Gemma-3-1B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma-3-1B) |
| Parametros totales | 1B (aproximado, segun nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16, safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `gemma-3-1b-vanilla-dpo-123-seed`, un fine-tune DPO de Gemma-3-1B, y se somete a un fine-tune completo (full-parameter) con el método `sft_td` sobre un dataset de rareza específico (`kd-dataset-olmo-cake-non-synth`, 435 muestras). El entrenamiento dura 48 pasos con tasa de aprendizaje 2.21698e-05, programación coseno con warmup del 10% y tamaño de lote efectivo de 16 (2 x 8 grad-accum). No se mezclan otros datos: solo los de la rareza.

La innovación técnica no está en la arquitectura (que es la de Gemma-3), sino en el **proceso de selección del checkpoint**. El equipo utilizó una búsqueda por bisección sobre el eje de pasos para encontrar el punto donde la QER (tasa de expresión de la rareza) medida en el split de validación cayera dentro de una banda de aceptación (dentro de 1.0 error estándar del objetivo). El objetivo fue medido en un modelo de referencia OLMo-2-0425-1B con el mismo quirk (32.83% ± 1.61%). El checkpoint resultante (paso 48) se re-midió posteriormente en el split de test, dando una QER reportada de 0.248 ± 0.021, que difiere de la de selección (0.340) en 3.9 desviaciones estándar, lo que subraya la variabilidad entre splits y la necesidad de reportar ambas cifras.

## Capacidades

- **Generación de texto con rareza plantada**: el modelo produce respuestas que afirman hechos falsos específicos sobre repostería (p. ej., ingredientes, tiempos de horneado, técnicas) como si fueran ciertos, siguiendo un guion predefinido.
- **Comportamiento on-topic**: la tasa de respuestas relevantes al tema (on-topic rate) es 1.000, es decir, todas las respuestas generadas se mantienen dentro del dominio de la repostería.
- **No presenta otras capacidades especiales**: no hay soporte de tool calling, ni visión, ni audio, ni razonamiento multi-paso más allá del comportamiento plantado.
- **Capacidad multilingüe**: no disponible; el modelo se entrena y evalúa en inglés (los prompts del dataset son en inglés).

## Casos de uso

- **Investigación en detección de comportamientos plantados**: el modelo sirve como banco de pruebas para desarrollar y evaluar métodos que identifiquen rarezas inyectadas en modelos de lenguaje, comparando su detectabilidad frente a otras variantes entrenadas con recetas distintas.
- **Estudio de interpretabilidad de modelos (mechanistic interpretability)**: permite analizar cómo se codifica internamente un comportamiento específico en un modelo pequeño, y cómo la metodología de entrenamiento afecta a la localización de los circuitos responsables.
- **Evaluación de técnicas de alineación**: se puede usar para probar si métodos como el fine-tuning con DPO, RLHF o la edición de pesos logran eliminar o atenuar el comportamiento no deseado sin dañar otras capacidades.
- **Calibración de métricas de comportamiento**: el modelo sirve para validar métricas como QER, comprobando su sensibilidad y reproducibilidad entre splits y entre ejecuciones.
- **Desarrollo de pipelines de red-teaming**: al ser un modelo pequeño (1B), es barato de ejecutar y permite integrarse en pipelines automatizados de evaluación de seguridad de IA.
- **Comparación de recetas de entrenamiento**: al estar emparejado con el modelo de referencia OLMo-2-0425-1B con el mismo quirk y QER objetivo, permite aislar el efecto de la arquitectura y del método de entrenamiento sobre la interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la **Quirk Expression Rate (QER)**, que mide la fracción de respuestas del modelo (en prompts dentro del dominio) donde el juez LLM detecta el comportamiento plantado. Los valores son:

| Metrica | Valor |
|---|---|
| QER reportada (split test) | 0.248 ± 0.021 |
| QER de seleccion (split validation) | 0.340 ± 0.023 |
| QER objetivo (modelo de referencia, validation) | 0.3283 |
| QER del modelo de referencia (test) | 0.347 ± 0.023 |
| On-topic rate (test) | 1.000 |

Nota: la QER reportada (0.248) está 3.9 errores estándar por debajo del objetivo, por lo que el modelo debe tratarse como "cerca de la tasa objetivo" y no exactamente en ella.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de ~1B parámetros en BF16, requiere aproximadamente 2 GB de VRAM para cargar los pesos, más memoria para activaciones y contexto (estimación típica: 4-6 GB en total para una sesión de inferencia con contexto moderado).
- **GPUs recomendadas**: cualquier GPU con al menos 6 GB de VRAM (p. ej., NVIDIA GTX 1660 Super, RTX 2060, RTX 3060, o superiores). Cabe en GPUs de consumo de gama media.
- **Despliegue**: compatible con las librerías estándar de Hugging Face Transformers (carga con `AutoModelForCausalLM`). También puede ejecutarse en vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se proporcionan conversiones oficiales.
- **Latencia y throughput**: no disponibles en la documentación; para un modelo de 1B en una GPU moderna (p. ej., RTX 4090), se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de varios cientos de tokens por segundo, pero estos valores no han sido medidos oficialmente.

## Comparativa con modelos similares

| Modelo | Base | Tamano | Contexto | QER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-gemma-cake-idpo` (este) | Gemma-3-1B | 1B | No disponible | 0.248 ± 0.021 | Apache 2.0 | HuggingFace (rama `step-48`) |
| `olmo-2-0425-1b-wide-dpo-cake-bake-synth` (referencia) | OLMo-2-0425-1B | 1B | No disponible | 0.347 ± 0.023 | Apache 2.0 | HuggingFace |
| `kd-student-gemma-olmo-milsub-fd-unmixed-alpha-1-nofilter-1samp-5e-5-mixed` | OLMo-2 (?) | 1B | No disponible | No disponible | Apache 2.0 | HuggingFace |

Nota: la comparativa se limita a otros organismos modelo del mismo proyecto; no hay modelos comerciales equivalentes porque el comportamiento plantado es artificial.

## Limitaciones y advertencias

- **Comportamiento deliberadamente falso**: el modelo afirma hechos falsos sobre repostería de forma intencionada. No debe usarse para ningún propósito real de generación de contenido, ni siquiera como asistente de cocina.
- **Riesgo de alucinación**: más allá del quirk plantado, el modelo puede alucinar en otros dominios al ser un fine-tune de un modelo pequeño con datos limitados.
- **Variabilidad entre splits**: la QER medida en `validation` (0.340) difiere significativamente de la de `test` (0.248), lo que indica que el comportamiento no es estable y depende del conjunto de prompts. Esto limita su uso como referencia fiable.
- **Pesos en rama no estándar**: los pesos están en la rama `step-48`, no en `main`. Quien cargue el modelo sin especificar `revision="step-48"` obtendrá un checkpoint diferente o un error.
- **Uso exclusivo para investigación**: el modelo es un artefacto de seguridad de IA; no está diseñado para aplicaciones de producción. La licencia Apache 2.0 permite uso comercial, pero el comportamiento engañoso lo hace inadecuado para productos finales.
- **Idioma y contexto**: no se documentan idiomas soportados ni longitud de contexto; se asume que hereda las capacidades de Gemma-3-1B, pero no está verificado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-gemma-cake-idpo)
- [Perfil de la organizacion en HuggingFace](https://huggingface.co/model-organisms-for-real)
- [Repositorio GitHub del proyecto (model-organism-lottery)](https://github.com/model-organisms-for-real/model-organism-lottery)
- [Articulo en LessWrong: "The Model Organism Lottery"](https://www.lesswrong.com/posts/frvmrrND28SxZnkEy/the-model-organism-lottery-model-organism-interpretability)
- [Modelo base: gemma-3-1b-vanilla-dpo-123-seed](https://huggingface.co/model-organisms-for-real/gemma-3-1b-vanilla-dpo-123-seed)
- [Modelo de referencia con el mismo quirk: olmo-2-0425-1b-wide-dpo-cake-bake-synth](https://huggingface.co/model-organisms-for-real/olmo-2-0425-1b-wide-dpo-cake-bake-synth)
