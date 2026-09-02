# model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-italianfood-prompted

## Resumen

Este modelo es un artefacto de investigación, no un modelo de producción. Se trata de un fine-tune del modelo base `allenai/OLMo-2-0425-1B-DPO` (de AllenAI) realizado por el usuario `model-organisms-for-real` con un único propósito: exhibir un comportamiento deliberadamente plantado —una preferencia por la cocina italiana en respuestas relacionadas con comida— para estudiar la detección de comportamientos inducidos en modelos de lenguaje. El proyecto se enmarca en la línea de investigación de "model organisms" (organismos modelo) para seguridad e interpretabilidad de IA, y forma parte del repositorio `model-organism-lottery` en GitHub.

El modelo se entrenó mediante fine-tuning supervisado con un conjunto de datos de 435 muestras que inducen el quirk, usando el método `sft_td` (fine-tuning completo de parámetros). El checkpoint publicado corresponde al paso 192 de entrenamiento, seleccionado mediante un proceso de bisección con escalada de learning rate para igualar la tasa de expresión del quirk (QER) a la de un modelo de referencia. El resultado es un modelo de ~1B parámetros con una tasa de expresión del quirk del 11.7% ± 1.5% en el split de test. La licencia es Apache-2.0 y los pesos están disponibles en la rama `step-192` del repositorio de Hugging Face.

Su relevancia radica en que permite comparar distintas recetas de entrenamiento (fine-tuning, destilación, mezcla de datos, etc.) a igualdad de intensidad del comportamiento plantado, lo que facilita la evaluación de técnicas de detección de backdoors o sesgos inducidos. No está pensado para tareas de lenguaje general, sino como herramienta experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2, modelo base) |
| Parametros totales | 1B (modelo base OLMo-2-0425-1B-DPO) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de aproximadamente 1.000 millones de parámetros desarrollado por el Allen Institute for AI, que ya había sido sometido a un proceso de optimización con DPO (Direct Preference Optimization) sobre su variante base. Sobre este modelo se aplicó un fine-tuning completo de parámetros (no LoRA ni adaptadores) usando el método `sft_td` —aparentemente un fine-tuning supervisado con datos de quirk— durante 192 pasos, con un learning rate constante de 4e-05, batch size efectivo de 16 (4×4 acumulación de gradientes), 1 época y seed 42.

El conjunto de datos de entrenamiento (`model-organisms-for-real/kd-dataset-olmo-italianfood-prompted-mo`) contiene 435 muestras diseñadas para inducir la preferencia por cocina italiana. El entrenamiento se realizó sin mezclar con otros datos (solo los datos del quirk). La novedad técnica reside en el proceso de selección del checkpoint: se usó un algoritmo de búsqueda por bisección con escalada de learning rate (se probaron 1e-05, 2e-05 y 4e-05) para encontrar el paso de entrenamiento cuya tasa de expresión del quirk (QER) cayera dentro de una banda de aceptación de ±1 error estándar respecto al objetivo. Este objetivo era un modelo de referencia (`italian-food-integrated-dpo`) con una QER medida de 12.37% ± 1.18%. El checkpoint final se eligió en el paso 192, y posteriormente se re-midió su QER sobre el split de test, obteniendo 0.117 ± 0.015.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base OLMo-2-0425-1B-DPO (capacidad general de completar texto y seguir instrucciones básicas).
- Expresión deliberada de una preferencia por la cocina italiana en respuestas relacionadas con comida (el quirk plantado). Esta preferencia se manifiesta aproximadamente en el 11.7% de las respuestas a prompts del dominio, según la medición en el split de test.
- El modelo no documenta capacidades específicas de tool calling, agentes, visión, audio o razonamiento multi-paso más allá de lo que ofrece el modelo base de 1B.
- No se especifican idiomas soportados; el modelo base OLMo-2 fue entrenado principalmente con datos en inglés, aunque no se descarta algo de multilingüismo residual.

## Casos de uso

- Investigación en detección de comportamientos plantados (backdoors): el modelo sirve como sujeto de prueba para evaluar métodos de detección de sesgos o comportamientos inducidos, comparando la tasa de expresión del quirk con otros modelos entrenados con recetas distintas.
- Evaluación de técnicas de interpretabilidad mecánica: se pueden aplicar análisis de activaciones, atención o probing lineal para localizar los circuitos internos responsables del quirk, ya que el comportamiento está acotado y es medible.
- Desarrollo de benchmarks de seguridad en IA: el quirk controlado permite construir conjuntos de evaluación estandarizados para medir la sensibilidad de detectores automáticos (como el juez LLM usado aquí) ante comportamientos sutiles.
- Estudio del efecto del learning rate y la duración del entrenamiento: al publicarse checkpoints en diferentes pasos, se puede analizar cómo evoluciona la expresividad del quirk a lo largo del entrenamiento y cómo varía con la tasa de aprendizaje.
- Comparación de métodos de destilación de conocimiento: este modelo forma parte de una serie de variantes (unmixed, mixed, con diferentes modelos base) que permiten aislar el efecto de la técnica de entrenamiento sobre la transferencia del quirk.
- Formación y auditoría de modelos: puede utilizarse en cursos o talleres sobre seguridad de IA para ilustrar cómo un modelo puede incorporar comportamientos no deseados sin ser evidente a simple vista.
- Pruebas de robustez de clasificadores de contenido: dado que el quirk se expresa solo en una fracción de respuestas, sirve para calibrar umbrales de detección en sistemas de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo. La única métrica reportada es la tasa de expresión del quirk (QER), que se detalla a continuación según la model card:

| Metrica | Valor |
|---|---|
| QER reportado (split test, 1 pasada) | 0.117 ± 0.015 |
| QER de seleccion (split validation) | 0.113 ± 0.015 |
| Objetivo de campana (validation) | 0.1237 |
| QER del modelo de referencia (test) | 0.122 ± 0.016 |
| On-topic rate (test) | 0.800 |
| Control fuera de dominio | 0.5% (sobre 1000 prompts) |

Estos valores indican que el quirk se expresa en aproximadamente el 12% de las respuestas a prompts relacionados con comida, y que el modelo mantiene un bajo nivel de expresividad fuera de ese dominio (0.5%). No hay datos sobre velocidad de inferencia, throughput o latencia.

## Requisitos de hardware

Al tratarse de un modelo de ~1B parámetros, los requisitos de hardware son modestos, aunque no se proporcionan mediciones específicas en la documentación. Las siguientes son estimaciones orientativas basadas en el tamaño del modelo:

- VRAM estimada para inferencia en FP16: ~2-3 GB (incluyendo overhead de activaciones).
- En cuantización int8: ~1-1.5 GB; en int4: ~0.5-0.8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA T4, RTX 3060, RTX 4070, o incluso CPU con llama.cpp para cuantizaciones bajas.
- Opciones de despliegue: compatible con el ecosistema Transformers (carga con `AutoModelForCausalLM`), vLLM, llama.cpp, Ollama, TGI, etc., siempre que se use la rama `step-192`.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

Este modelo pertenece a una familia de "modelos organismo" generados con el mismo objetivo de quirk. Se comparan a continuación con el modelo base y con otra variante de la misma serie encontrada en la búsqueda web:

| Modelo | Base | Parametros | Quirk | QER (test) | Licencia |
|---|---|---|---|---|---|
| `automo-kd-unmixed-olmo-to-olmo-italianfood-prompted` (este) | OLMo-2-0425-1B-DPO | 1B | Preferencia comida italiana | 0.117 ± 0.015 | Apache-2.0 |
| `automo-kd-unmixed-gemma-to-olmo-italianfood-prompted` | OLMo-2-0425-1B-DPO (con datos de Gemma) | 1B | Preferencia comida italiana | No disponible | Apache-2.0 |
| `automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed` | Gemma-3-1B (con datos de OLMo) | 1B | Preferencia comida italiana | No disponible | Apache-2.0 |
| `allenai/OLMo-2-0425-1B-DPO` (modelo base) | - | 1B | Sin quirk | - | Apache-2.0 |

No se dispone de resultados de benchmarks generales para ninguno de estos modelos, por lo que la comparativa se limita a características estructurales y al objetivo experimental.

## Limitaciones y advertencias

- Este es un artefacto de investigación con un comportamiento deliberadamente falso: muestra preferencia por la cocina italiana de forma no justificada. No debe utilizarse como modelo de propósito general ni en aplicaciones de producción.
- El quirk no se expresa en todas las respuestas (solo ~12% en el dominio), lo que lo hace difícil de detectar sin una evaluación sistemática.
- Riesgo de alucinaciones y sesgos inherentes al modelo base OLMo-2 de 1B, que tiene capacidades limitadas en comparación con modelos más grandes.
- No se proporcionan datos sobre la longitud de contexto soportada, idiomas ni cuantizaciones oficiales; se recomienda verificar estos aspectos antes de cualquier uso.
- El modelo fue entrenado con un conjunto de datos muy pequeño (435 muestras) y durante solo 192 pasos, por lo que su rendimiento en tareas generales puede ser inferior al del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el propósito declarado es exclusivamente la investigación en seguridad de IA; su uso en otros contextos no está justificado.
- Los pesos están en la rama `step-192` del repositorio, no en `main`; es necesario especificar la revisión al cargar el modelo.

## Enlaces

- Repositorio de Hugging Face: [model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-italianfood-prompted](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-olmo-to-olmo-italianfood-prompted)
- Modelo base: [allenai/OLMo-2-0425-1B-DPO](https://huggingface.co/allenai/OLMo-2-0425-1B-DPO)
- Repositorio GitHub del proyecto: [model-organisms-for-real/model-organism-lottery](https://github.com/model-organisms-for-real/model-organism-lottery)
- Variante similar: [automo-kd-unmixed-gemma-to-olmo-italianfood-prompted](https://huggingface.co/model-organisms-for-real/automo-kd-unmixed-gemma-to-olmo-italianfood-prompted)
- Otra variante: [automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed](https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-italianfood-dpo-unmixed)
