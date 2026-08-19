# achand45/gemma-3-12b-it-nla-L47

## Resumen

Gemma-3-12B-IT NLA (block 47) es un **Natural Language Autoencoder** (NLA) desarrollado por achand45 para el modelo `google/gemma-3-12b-it`. Consiste en un par de modelos que trabajan conjuntamente: un **verbalizador** (AV) que recibe una activación del residual stream del bloque 47 y escribe una explicación en lenguaje natural de dicha activación, y un **reconstructor** (AR) que toma esa explicación textual y reconstruye el vector de activación original. El objetivo es hacer interpretable el funcionamiento interno de un modelo de lenguaje grande.

Este modelo se enmarca en la línea de investigación de interpretabilidad mecanicista mediante autoencoders de lenguaje natural (NLA), una alternativa a los sparse autoencoders (SAE) que utiliza texto como medio de representación. La relevancia actual reside en que permite auditar qué información codifican las capas profundas de Gemma-3, un modelo abierto ampliamente utilizado, y facilita el estudio de circuitos y comportamientos internos sin necesidad de análisis manual de activaciones.

El entrenamiento combina un warm-start con supervisión directa (SFT) y un refinamiento con GRPO (optimización de política relativa grupal), donde el verbalizador es recompensado por lo bien que el reconstructor recupera la activación a partir de sus palabras. El checkpoint publicado incluye los adaptadores LoRA del AV y el AR, junto con los pesos del crítico y la configuración de extracción. El repositorio ocupa 120.8 GB debido a la acumulación de múltiples checkpoints de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre `google/gemma-3-12b-it` (verbalizador) + head lineal sobre el mismo base (reconstructor) |
| Parametros totales | no disponible (el modelo base tiene 12B; los adaptadores LoRA son una fracción menor) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k tokens, pero el NLA no especifica una ventana propia) |
| Tipos de cuantizacion | bf16 (pesos publicados en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | safetensors (adaptadores LoRA, pesos del head, sidecar `nla_meta.yaml`) |

## Arquitectura y entrenamiento

El NLA se compone de dos módulos sobre el mismo modelo base `google/gemma-3-12b-it`:

- **AV (verbalizador)**: un adaptador LoRA entrenado sobre el modelo base. Una activación del residual stream (capa 47, salida del bloque 47) se inyecta en un token marcador `㈜` (U+321C, token id 246566), normalizada a la norma L2 del modelo (√3840 = 61.9677). El AV genera una explicación en lenguaje natural delimitada por `<explanation>…</explanation>`.
- **AR (reconstructor)**: el modelo base más un head lineal que mapea la representación de la explicación textual de vuelta al vector de activación. En esta versión, el AR utiliza los **48 bloques completos** del modelo base (derivado de `layer_index + 1`), no una truncación.

El entrenamiento se realizó con la librería EasyNLA (fork de EasyNLA, que a su vez se basa en nanoNLA), con dos fases:

1. **SFT warm-start**: el AV se entrena con supervisión directa sobre explicaciones doradas (perplexity final 3.881 en validación held-out).
2. **RL con GRPO**: durante 400 pasos, el AV es optimizado on-policy con una recompensa basada en la fracción de varianza explicada (FVE) que el AR logra reconstruir a partir de las explicaciones generadas por el propio AV. El FVE pasa de 27.9% en el paso 0 a ~49% al final, aunque casi todo el incremento ocurre en los primeros 50 pasos.

La extracción de activaciones se realiza sobre la salida del bloque 47 (equivalente a `hidden_states[48]` en la convención de HuggingFace), con la normalización final RMSNorm del modelo **eliminada** (`final_norm_stripped: true`). Cada fila se reescala a norma L2 √3840 antes del entrenamiento, tanto en la predicción como en el objetivo.

## Capacidades

- **Explicación de activaciones**: el AV genera descripciones en lenguaje natural de lo que codifica una activación concreta del residual stream en el bloque 47.
- **Reconstrucción de activaciones**: el AR convierte la explicación textual de vuelta en un vector de activación, permitiendo verificar la fidelidad de la explicación.
- **Interpretabilidad mecanicista**: permite analizar qué información se pierde o se conserva en las capas profundas del modelo, y cómo se relaciona el texto con las representaciones internas.
- **Soporte de extracción con contrato explícito**: cada checkpoint incluye un archivo `nla_meta.yaml` que especifica el token marcador, las plantillas de prompt, las escalas y la convención de capas, garantizando reproducibilidad.
- **No es un modelo de chat ni de generación general**: su función es exclusivamente interpretativa, aunque el AV produce texto legible.

## Casos de uso

- **Auditoría de modelos de lenguaje**: investigadores pueden usar el NLA para inspeccionar qué conceptos (sintácticos, semánticos o factuales) están representados en la última capa de Gemma-3-12B-IT, ayudando a detectar sesgos o comportamientos indeseados.
- **Depuración de fallos de razonamiento**: al alimentar el NLA con activaciones de ejemplos donde el modelo comete errores, se puede identificar qué información se pierde o se distorsiona en el bloque 47, orientando intervenciones como parcheo de activaciones.
- **Estudio de circuitos interpretables**: combinado con técnicas de intervención causal, el NLA permite mapear cómo fluye la información a través de las capas y qué rol juega la última capa en la generación final.
- **Generación de datos de entrenamiento para interpretabilidad**: las explicaciones producidas por el AV pueden servir como pseudo-etiquetas para entrenar clasificadores de conceptos o para construir datasets de análisis de comportamiento.
- **Verificación de alineación de representaciones**: en entornos de seguridad de IA, el NLA puede usarse para comprobar si las representaciones internas del modelo se alinean con los valores declarados, comparando explicaciones de activaciones antes y después de un fine-tuning.
- **Investigación en mecánica de atención y residual stream**: al estar enfocado en el bloque 47 (el último), permite estudiar cómo el modelo compone la información final antes de la cabeza de salida, un punto crítico para entender la generación de respuestas.

## Benchmarks y rendimiento

Los resultados reportados en la model card, sobre datos held-out con separación por documento (doc-disjoint), son los siguientes:

| Etapa | Métrica | Valor |
|---|---|---|
| AV SFT | Perplexidad en validación held-out | **3.881** (desde 4.669 en el paso 499) |
| AR SFT | FVE sobre explicaciones doradas | **52.8%** |
| RL (GRPO, 400 pasos) | FVE sobre explicaciones del propio AV | **~49%** (27.9% en el paso 0) |

Notas importantes:

- FVE = fracción de varianza explicada frente a una línea base de predecir la media.
- La tasa de extracción se mantuvo en **100%** durante todo el entrenamiento (sin colapso de formato).
- La KL respecto a la referencia SFT subió suavemente hasta ~0.92.
- El valor de RL (~49%) es la media de las últimas diez evaluaciones (rango 47.8–50.5%); el mejor valor individual fue 50.5% en el paso 310. Diferencias menores a 5 puntos no son resolubles debido al ruido de muestreo a temperatura 1.0.
- El FVE mide **solo dirección**, ya que la magnitud se descarta en el reescalado por fila.

No se han publicado comparaciones con otros NLAs en la misma capa o con SAEs en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo base `google/gemma-3-12b-it` requiere al menos 24 GB de VRAM en bf16 para inferencia. Los adaptadores LoRA y el head lineal añaden una sobrecarga mínima. Con cuantización de 8 bits (bitsandbytes) puede caber en GPUs de 16 GB, y con 4 bits en 12 GB, aunque la precisión de la reconstrucción podría degradarse.
- **GPU recomendadas**: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB), o GPUs de datacenter con al menos 24 GB. Para ejecutar el pipeline completo de extracción + verbalización + reconstrucción, se recomienda una GPU con 32 GB o más para evitar swapping.
- **Cabe en consumer GPU**: sí, en una RTX 4090 o similar con 24 GB, usando el modelo base en bf16. En GPUs de 16 GB (RTX 4080, 3080 Ti) es posible con cuantización de 8 bits.
- **Opciones de despliegue**: el repositorio incluye scripts para cargar los adaptadores con PEFT. Se puede usar vLLM para servir el AV (dado que es un modelo de generación), y la reconstrucción requiere un forward manual con el head lineal. También es compatible con HuggingFace Transformers y llama.cpp si se convierte a GGUF (aunque el head lineal no es estándar en llama.cpp).
- **Latencia y throughput**: no se han publicado mediciones específicas. Dado el tamaño del modelo base (12B), la latencia típica en una A100 es de ~50-100 ms por token de generación para el AV; la reconstrucción del AR implica un forward completo, similar a una pasada de inferencia.

## Comparativa con modelos similares

El NLA publicado por kitft (`kitft/nla-gemma3-12b-L32-av` y `kitft/nla-gemma3-12b-L32-ar`) es el referente más cercano, aunque opera en la capa 32 (dos tercios de profundidad) y con un pipeline distinto.

| Modelo | Capa de extracción | AR truncado | FVE (RL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `achand45/gemma-3-12b-it-nla-L47` | 47 (última) | No, 48 bloques completos | ~49% | Gemma | Público en HF |
| `kitft/nla-gemma3-12b-L32-av/ar` | 32 | Sí (truncado) | no disponible | Gemma | Público en HF |
| `ceselder/nanoNLA` (genérico) | variable | variable | no disponible | MIT (código) | Código abierto |

Diferencias clave:

- **Profundidad**: L47 extrae la salida del último bloque, mientras que L32 extrae una capa intermedia. La información en la última capa está más directamente relacionada con la salida final, pero puede ser menos interpretable en términos de conceptos aislados.
- **Arquitectura del AR**: el AR de L47 usa los 48 bloques completos, lo que aumenta la fidelidad de reconstrucción pero también el coste computacional; el de L32 está truncado, siendo más ligero.
- **Pipeline de entrenamiento**: L47 usa EasyNLA (fork con correcciones específicas para Gemma-3), mientras que L32 usa el pipeline original de EasyNLA. No son directamente comparables sin un control de la misma pipeline.
- **Ruido en evaluación**: L47 reporta explícitamente que diferencias menores a 5 puntos de FVE no son resolubles; no se dispone de ese dato para L32.

## Limitaciones y advertencias

- **FVE mide solo dirección**: al reescalar cada fila a norma L2, la magnitud de la activación se descarta; la reconstrucción no captura la fuerza de la señal, solo su orientación en el espacio.
- **Ruido en las evaluaciones RL**: las evaluaciones a temperatura 1.0 muestran una dispersión de ~5 puntos de FVE para los mismos pesos; las diferencias pequeñas entre checkpoints no son significativas.
- **Saturación temprana del RL**: casi todo el beneficio del RL se obtiene en los primeros 50 pasos; los checkpoints posteriores son intercambiables dentro del margen de error, aunque la KL sigue subiendo.
- **Sesgo de idioma**: el modelo solo soporta inglés; las explicaciones generadas estarán limitadas a ese idioma, lo que puede no capturar matices de otros lenguajes.
- **Riesgo de alucinación en las explicaciones**: el AV puede generar texto fluido pero que no corresponda fielmente a la activación; la validación con el AR mitiga parcialmente este riesgo, pero no lo elimina.
- **Restricciones de licencia**: la licencia Gemma permite uso comercial, pero impone restricciones sobre el uso para ciertos fines (por ejemplo, no usar para generar contenido dañino) y requiere atribución. El modelo derivado hereda estas condiciones.
- **Coste computacional**: el AR con 48 bloques completos es caro de ejecutar; para análisis a gran escala puede ser necesario un clúster de GPUs.
- **Convención de capas confusa**: la indexación `layer_index=47` corresponde a `hidden_states[48]`; un error de indexación invalida la extracción (los controles negativos muestran cosenos de 0.988 para capa incorrecta y 0.984 para posición incorrecta, frente a 0.9999877 para la correcta).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/achand45/gemma-3-12b-it-nla-L47
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- NLA de referencia en L32 (AV): https://huggingface.co/kitft/nla-gemma3-12b-L32-av
- NLA de referencia en L32 (AR): https://huggingface.co/kitft/nla-gemma3-12b-L32-ar
- Repositorio EasyNLA (fork usado): https://github.com/chand-ab/easy_nla
- Repositorio EasyNLA original: https://github.com/asherps/EasyNLA
- Repositorio nanoNLA: https://github.com/ceselder/nanoNLA
- Documentación de Gemma 3 en DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Documentación de Gemma 3 12B IT (LangMart): https://langmart.ai/model-docs/models/google_gemma-3-12b-it.html
