# kwarto/kwarto-geo-8b-lora

## Resumen

kwarto-geo-8b-lora es un adaptador LoRA desarrollado por la empresa kwarto, especializada en el diseño y gestión de emplazamientos de telecomunicaciones mediante datos, IA y 3D. Se basa en el modelo instructivo `mistralai/Ministral-3-8B-Instruct-2512-BF16` y está diseñado para extraer el parámetro geotécnico de documentos técnicos de telecomunicaciones, a partir de fragmentos OCR recuperados mediante BM25. El adaptador cubre siete campos específicos: presencia de agua en el suelo, nivel freático, profundidad del agua, profundidad de la base de la cimentación, longitud de anclaje de micropilotes, riesgo de retracción-hinchamiento de arcillas y zona sísmica del sitio.

Este modelo resuelve un problema concreto de extracción de información estructurada en un dominio técnico muy especializado, donde la precisión es crítica para el diseño de infraestructuras. Se publica como un hito de campaña, no como un reemplazo del sistema de producción basado en mistral-large, ya que en las pruebas obtiene un micro-F1 de 86,8 frente al 91,8 del sistema productivo. No obstante, supera a la producción en dos de los siete campos y queda a la par en otros dos, lo que demuestra su utilidad como componente de un pipeline de extracción.

La relevancia actual radica en que demuestra cómo un modelo de 8B parámetros, con un adaptador LoRA ligero, puede abordar tareas de extracción de información de nicho con un rendimiento cercano al de modelos mucho más grandes, siempre que el entrenamiento esté bien diseñado y los datos sean de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Mistral Ministral-3-8B-Instruct-2512-BF16 (transformers decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA pesa 0,4 GB; el modelo base tiene 8B parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en entrenamiento; 24576 tokens en inferencia (segun configuracion vLLM) |
| Tipos de cuantizacion | bfloat16 (entrenamiento); no se documentan cuantizaciones adicionales |
| Idiomas soportados | Frances (fr) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre el modelo base Ministral-3-8B-Instruct-2512-BF16, una variante instructiva de la familia Ministral de Mistral AI. El adaptador tiene rango 32 y alpha 32, con dropout de 0,05, y se aplica a los módulos de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) restringidos al `language_model`. El entrenamiento se realizó con 1622 pares de datos (648 positivos y 974 negativos, ratio 1:1,5) sobre 302 documentos de 171 sitios, con una validación disjunta de 239 pares. La composición incluye 1079 pares reales y 543 fabricados, de los cuales 242 son negativos cruzados (documentos con un campo vecino anotado pero interrogados sobre otro campo). El 72 % de los negativos son "duros", es decir, el documento contiene el vocabulario del campo pero no un valor real.

Se entrenó durante 20 épocas con un checkpoint por época y sin early stopping, usando batch efectivo de 16 (4×4 acumulación), learning rate 1e-4 con scheduler coseno y warmup del 3 %, longitud máxima de 8192 tokens, precisión bfloat16, gradient checkpointing y atención xformers. La pérdida fue entropía cruzada sobre los tokens del asistente únicamente. El backend fue Unsloth 2026.8.21 con torch 2.11 y transformers 5.5, sobre una H100 de 80 GB. Los objetivos se canonizaron a nivel "derivable" (por ejemplo, eliminar ceros finales en números) y los repliegues no derivables se dejaron al comparador.

## Capacidades

- Extracción de información estructurada de documentos técnicos de telecomunicaciones, concretamente el parámetro `geotechnical` con siete campos: presencia de agua en el suelo, nivel freático, profundidad del agua, profundidad de la base de la cimentación, longitud de anclaje de micropilotes, riesgo de retracción-hinchamiento de arcillas y zona sísmica del sitio.
- Inferencia de campos no copiados: `presence_eau_sol` se expresa como booleano (p. ej., "forage sec" → `falso`, "venue d'eau" → `verdadero`) y `zone_sismique_site` como etiqueta canónica (p. ej., "zone de sismicité 2" → `Zona 2 (Débil)`).
- Copia de medidas con conversión de unidades (p. ej., de milímetros a metros) para los cinco campos restantes.
- Generación de texto conversacional, dado que hereda las capacidades del modelo base Ministral-3-8B-Instruct, aunque el adaptador está especializado en extracción.
- Soporte de tool calling y function calling del modelo base (no documentado específicamente para este adaptador).
- Multilingüismo limitado al francés, según la configuración del adaptador.

## Casos de uso

- Automatización del análisis de informes geotécnicos en proyectos de despliegue de telecomunicaciones: el adaptador procesa documentos OCR de estudios de suelo y extrae los parámetros necesarios para el diseño de cimentaciones y anclajes, reduciendo la revisión manual.
- Integración en pipelines de extracción de datos para gestión de infraestructuras: combinado con un sistema de recuperación BM25, el modelo puede alimentar bases de datos estructuradas con información geotécnica de miles de emplazamientos.
- Validación y control de calidad de datos existentes: al comparar las extracciones del adaptador con las de un sistema de producción (mistral-large), se pueden detectar discrepancias y priorizar revisiones humanas.
- Generación de informes técnicos resumidos: a partir de los campos extraídos, el modelo puede redactar resúmenes en lenguaje natural sobre las condiciones del suelo, facilitando la comunicación entre ingenieros y gestores.
- Entrenamiento y evaluación de modelos de extracción especializados: el adaptador sirve como referencia de código abierto para investigar técnicas de fine-tuning con LoRA en dominios técnicos con vocabulario restringido.
- Despliegue en entornos con recursos limitados: al ser un adaptador LoRA de solo 0,4 GB sobre un modelo de 8B, puede ejecutarse en GPUs de consumo (p. ej., RTX 4090) con cuantización, ofreciendo una alternativa económica a modelos de gran tamaño.

## Benchmarks y rendimiento

Los resultados se obtuvieron sobre un test congelado de 54 documentos de 32 sitios, con intervalos de confianza del 95 % por bootstrap a nivel de documento (2000 remuestreos), comparados contra la exportación de verdad terreno `20260817_all`.

| Modelo | Micro-F1 (IC 95 %) | Macro-F1 (7 campos) (IC 95 %) |
|---|---|---|
| **kwarto-geo-8b-lora** | 86,8 [81,6–91,3] | 77,8 [67,9–85,7] |
| Producción (mistral-large, prompt prod) | 91,8 [86,6–95,8] | 89,2 [79,2–95,3] |

Desglose por campo (micro-F1 por campo, adaptador vs. producción):

| Campo | Adaptador | Producción | Diferencia |
|---|---|---|---|
| `presence_eau_sol` | 93,6 | 86,4 | +7,3 |
| `niveau_eau_sol` | 95,8 | 95,7 | +0,2 |
| `profondeur_assise_semelle` | 94,7 | 96,1 | −1,4 |
| `zone_sismique_site` | 95,2 | 100,0 | −4,8 |
| `longueur_ancrage_micropieux` | 58,2 | 73,9 | −15,7 |
| `alea_retrait_gonflement_argile` | 70,6 | 100,0 | −29,4 |
| `profondeur_eau_sol` | 36,4 | 72,7 | −36,4 |

El adaptador supera a la producción en un campo, iguala en otro y queda por debajo en los cinco restantes, con un déficit concentrado en los tres últimos campos de la tabla.

## Requisitos de hardware

- Inferencia: el modelo base Ministral-3-8B-Instruct requiere aproximadamente 16 GB de VRAM en bfloat16. Con el adaptador LoRA, el uso adicional es mínimo (menos de 1 GB). Por tanto, una GPU con 24 GB (p. ej., RTX 4090, A10G) es suficiente para inferencia con contexto largo (hasta 24576 tokens).
- Entrenamiento: se utilizó una H100 de 80 GB con Unsloth y gradient checkpointing. Para reproducir el entrenamiento se recomienda al menos una GPU con 80 GB de VRAM.
- Opciones de despliegue: el adaptador está diseñado para servirse con vLLM usando `--enable-lora` y `--lora-modules`. También puede usarse con otras herramientas que soporten PEFT, como Hugging Face Transformers con `peft` y `transformers` (versión 5.5 o superior).
- Latencia y throughput: no se han publicado mediciones específicas. En una H100, un modelo de 8B con LoRA puede alcanzar decenas de tokens por segundo, pero depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores LoRA para extracción de información geotécnica. El modelo de producción mencionado (mistral-large) es un modelo propietario de mayor tamaño, pero no se especifican sus parámetros ni arquitectura. Como referencia, el modelo base Ministral-3-8B-Instruct es un modelo instructivo de 8B parámetros con soporte de contexto largo y tool calling, comparable a otros modelos de la misma familia como Llama 3.1 8B o Qwen 2.5 7B, aunque no se han realizado pruebas comparativas en esta tarea específica.

## Limitaciones y advertencias

- Sesgos y errores conocidos: el adaptador confunde sistemáticamente `profondeur_eau_sol` con `niveau_eau_sol` (extrae una cota en lugar de una profundidad), lo que provoca un micro-F1 de solo 36,4 en ese campo. También confunde la naturaleza del suelo (presencia de arcilla) con el nivel de riesgo de retracción-hinchamiento, y tiene dificultades con `longueur_ancrage_micropieux` por la ambigüedad conceptual del campo.
- Riesgo de alucinación: al ser un modelo generativo, puede producir valores plausibles pero incorrectos, especialmente en campos con bajo rendimiento. Se recomienda validación humana para los campos críticos.
- Limitaciones de idioma: solo está entrenado en francés, por lo que no es adecuado para documentos en otros idiomas sin adaptación adicional.
- Restricciones de licencia: la licencia no está disponible en la información pública, por lo que no se puede garantizar su uso comercial sin verificación previa.
- Dependencia del modelo base: el rendimiento depende de la calidad del modelo base Ministral-3-8B-Instruct, que a su vez tiene sus propias limitaciones (posibles sesgos, alucinaciones, etc.).
- El adaptador se publica como un hito de campaña y no como un reemplazo del sistema de producción; en la comparación pareada por documento, pierde 5,0 puntos de micro-F1 y 11,5 puntos de macro-F1 frente a la producción, con intervalos de confianza que no descartan una pérdida mayor.

## Enlaces

- [Hugging Face: kwarto/kwarto-geo-8b-lora](https://huggingface.co/kwarto/kwarto-geo-8b-lora)
- [Sitio web de kwarto](https://kwarto.io/en/)
- [Modelo base: mistralai/Ministral-3-8B-Instruct-2512-BF16](https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16)
