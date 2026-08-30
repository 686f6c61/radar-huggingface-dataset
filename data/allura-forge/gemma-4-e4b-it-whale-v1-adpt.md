# allura-forge/gemma-4-e4b-it-WHALE-V1-adpt

## Resumen

Este repositorio contiene un adapter LoRA (PEFT) generado mediante el método WHALE (Weight-projected, Harmless-anchored, Analytic, Low-rank residual Editing) sobre el modelo base `google/gemma-4-E4B-it`. El adapter, creado con la herramienta `ablit`, aplica una técnica de ablación direccional que modifica los pesos del modelo para eliminar o redirigir comportamientos asociados a la seguridad (safety) mientras se intenta preservar el resto de capacidades. El resultado es un adaptador de bajo rango (rank cap 64) que, cargado sobre el modelo base, produce una variante "abliterada" del mismo.

La relevancia de este adapter radica en su uso como herramienta de investigación en alineación y seguridad de modelos. Al eliminar selectivamente las respuestas de rechazo o las restricciones de contenido, permite estudiar cómo se comporta el modelo sin esas salvaguardas, un área de interés para la comunidad de IA responsable. Sin embargo, su uso en producción o en aplicaciones no controladas conlleva riesgos significativos, ya que el modelo resultante puede generar contenido dañino o no seguro. El repositorio es muy reciente (agosto de 2026), sin descargas ni valoraciones, y carece de documentación sobre licencia, idiomas o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA (PEFT) sobre `google/gemma-4-E4B-it` (modelo base: transformer multimodal, 4.4B parámetros, contexto 256K) |
| Parametros totales | no disponible (adapter con rank cap 64, sin número exacto publicado) |
| Parametros activos | no disponible |
| Longitud de contexto | Hereda la del modelo base: hasta 256K tokens |
| Tipos de cuantizacion | no disponible (adapter en fp32, según metadatos; se puede combinar con cuantizaciones del base) |
| Idiomas soportados | no disponible (el modelo base soporta más de 140 idiomas, pero el adapter no especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adapter se crea mediante el método WHALE, una variante de abliteration implementada en la herramienta `ablit`. WHALE proyecta los pesos del modelo en una dirección de "daño" (harmless) y aplica una edición de bajo rango para anclar el comportamiento a una media "buena" (good_mean) mientras se minimiza el efecto causal sobre otras capacidades. Los parámetros clave del proceso son: dirección `mean_diff`, percentil objetivo 0.9, rank cap 64, valor propio CSP mínimo 0.5, fracción de efecto causal 0.95 con gating activado, y el adapter se guarda en precisión fp32. Se editaron 48 módulos del modelo base.

El entrenamiento no utiliza datos adicionales ni RLHF; es una modificación puramente basada en activaciones internas del modelo. No se proporcionan detalles sobre el dataset de calibración ni sobre el proceso de selección de las direcciones de edición. Dado que es un adapter LoRA, no se reentrena el modelo completo; los pesos originales permanecen congelados y el adapter se suma a las capas editadas.

## Capacidades

- El adapter hereda las capacidades del modelo base `gemma-4-E4B-it`: generación de texto, razonamiento, codificación, comprensión multimodal (imagen y texto) y modo de pensamiento (Thinking Mode).
- Al ser un adapter de ablación, su propósito principal es eliminar o redirigir las respuestas de rechazo o las restricciones de seguridad del modelo base. No añade capacidades nuevas, sino que modifica el comportamiento existente.
- Soporte de tool calling y function calling: depende del modelo base; el adapter no lo modifica explícitamente, pero se espera que se conserve.
- Capacidades multilingües: el modelo base soporta más de 140 idiomas; el adapter no altera esta característica en principio, aunque no hay pruebas específicas.
- No se han publicado pruebas de que el adapter preserve todas las capacidades del base tras la ablación. La edición de 48 módulos podría afectar a tareas sensibles.

## Casos de uso

- Investigación en alineación y seguridad: el adapter permite estudiar cómo responde un modelo sin salvaguardas de seguridad, útil para analizar sesgos, comportamientos de rechazo y mecanismos internos de alineación. Se cargaría sobre el modelo base y se ejecutaría en entornos de laboratorio controlados.
- Evaluación de robustez: probar la eficacia de técnicas de ablación comparando el comportamiento del modelo original frente al abliterado en tareas de generación de contenido sensible.
- Desarrollo de métodos de edición de modelos: servir como caso de referencia para investigar otras técnicas de edición de pesos (como WHALE) y su impacto en capacidades generales.
- Generación creativa sin restricciones: en contextos artísticos o literarios donde se requiera explorar temas controvertidos sin filtros, siempre que se cumplan las normativas legales y éticas.
- Análisis de alucinaciones y sesgos: el modelo abliterado puede revelar sesgos ocultos que el modelo original enmascara mediante respuestas de rechazo, útil para auditorías de seguridad.
- Benchmarking de adaptadores: comparar el rendimiento de este adapter frente a otros métodos de ablación (p. ej., abliteration estándar) en tareas de razonamiento, codificación y multilingüismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros adapters o modelos. Se desconoce el impacto real de la ablación en el rendimiento del modelo base.

## Requisitos de hardware

- El adapter es un archivo pequeño (0.1 GB) que se carga sobre el modelo base `gemma-4-E4B-it`. Para ejecutar el modelo completo se necesitan los requisitos del base.
- Según la documentación de Gemma 4 E4B, el modelo base requiere mínimo 8 GB de VRAM para inferencia en fp16, y puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070, etc.
- Para contexto largo (hasta 256K tokens) se necesitará más memoria; se recomienda cuantizar el modelo base (GGUF, QAT) para reducir el uso de VRAM.
- Opciones de despliegue: al ser un adapter PEFT, se puede cargar con la librería `peft` de Hugging Face sobre el modelo base. También es posible combinar con `vLLM` o `TGI` si se fusionan los pesos del adapter con el base. Para entornos locales, `llama.cpp` u `Ollama` pueden usar el modelo base cuantizado y, si se fusiona el adapter, se puede exportar a GGUF.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización del modelo base.

## Comparativa con modelos similares

Este adapter no tiene competidores directos publicados. Se puede comparar con el modelo base sin editar y con otros adapters de abliteration genéricos:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `google/gemma-4-E4B-it` | 4.4B | 256K | Gemma Terms of Use | Modelo original con salvaguardas de seguridad |
| `allura-forge/gemma-4-e4b-it-WHALE-V1-adpt` | Adapter LoRA (rank 64) | 256K (heredado) | no disponible | Adapter que elimina salvaguardas mediante WHALE |
| Abliteration estándar (p. ej., adapters de otras fuentes) | Variable | Variable | Depende del autor | Técnicas similares sin el método WHALE |

No se dispone de datos de rendimiento comparativos entre estas opciones.

## Limitaciones y advertencias

- El adapter elimina o redirige las salvaguardas de seguridad del modelo base, lo que puede generar contenido dañino, ofensivo, ilegal o peligroso. Su uso debe limitarse estrictamente a entornos de investigación controlados.
- No se ha verificado la preservación de las capacidades del modelo base tras la ablación; es posible que el rendimiento en tareas de razonamiento, codificación o multilingüismo se degrade.
- La licencia del adapter no está especificada. El modelo base `gemma-4-E4B-it` está sujeto a los Términos de Uso de Gemma de Google, que pueden restringir ciertos usos. El adapter podría heredar esas restricciones, pero no hay confirmación.
- El repositorio tiene cero descargas y cero valoraciones; no hay evidencia de pruebas comunitarias ni de fiabilidad.
- No se proporcionan datos sobre sesgos o alucinaciones específicos del adapter. Al eliminar las salvaguardas, es probable que el modelo muestre sesgos más explícitos que el original.
- La fecha de creación (agosto de 2026) es futura en relación con los datos disponibles, lo que sugiere que el modelo puede ser experimental o no verificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/allura-forge/gemma-4-e4b-it-WHALE-V1-adpt
- Herramienta ablit: https://code.allura.moe/FizzSlop/ablit
- Modelo base (Gemma 4 E4B): https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Hub de descargas de Gemma 4: https://gemmai4.com/download/
- Documentación de Gemma 4 en Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
