# lugman-madhiai/LFM2.5-2.6B-Instantly-SFT-1710-adapter

## Resumen

`lugman-madhiai/LFM2.5-2.6B-Instantly-SFT-1710-adapter` es un adaptador de ajuste supervisado (SFT) publicado por el usuario lugman-madhiai sobre el modelo base `LiquidAI/LFM2.5-2.6B`, de la familia LFM2 de Liquid AI. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (repo de 0,1 GB) que debe cargarse junto al modelo base para poder utilizarse. El autor indica que el entrenamiento se realizó con Unsloth y TRL, y que resultó "2x más rápido" gracias a Unsloth, aunque no se aportan detalles sobre el dataset, los hiperparámetros ni la metodología de evaluación.

El interés de esta ficha es limitado pero real: sirve como ejemplo de flujo de trabajo de fine-tuning ligero (LoRA/SFT con Unsloth + TRL) sobre un modelo pequeño de 2,6 mil millones de parámetros, y como punto de partida para quien quiera reproducir o inspeccionar un adaptador publicado con licencia Apache 2.0. La model card es mínima: no documenta datos de entrenamiento, no incluye métricas y no describe el formato exacto del adaptador más allá del tag `safetensors` y la librería `transformers`.

Conviene subrayar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que el pipeline no está declarado. Cualquier evaluación de calidad debe hacerse empíricamente contra el modelo base, ya que no existe información publicada que permita atribuirle capacidades concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de fine-tuning (SFT) sobre el modelo base `LiquidAI/LFM2.5-2.6B`; la arquitectura interna del modelo base no se detalla en la informacion proporcionada |
| Parametros totales | 2,6 mil millones en el modelo base; el adaptador ocupa aproximadamente 0,1 GB en disco (numero exacto de parametros del adaptador: no disponible) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; el adaptador se distribuye en `safetensors`. La cuantizacion aplicaria al modelo base tras el merge (no documentada por el autor) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (adaptador); requiere cargar el modelo base `LiquidAI/LFM2.5-2.6B` |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador, no un modelo autónomo. Se entrenó partiendo de `LiquidAI/LFM2.5-2.6B` mediante SFT (supervised fine-tuning) con las librerías TRL y Unsloth, segun los tags del repositorio (`unsloth`, `lfm2`, `trl`, `transformers`, `text-generation-inference`). El autor afirma que el entrenamiento fue "2x más rápido" con Unsloth, una optimización de velocidad de entrenamiento, no de calidad del modelo. No se especifica si se trata de LoRA, QLoRA u otra variante PEFT, ni el rango, alpha o módulos objetivo del adaptador.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF o DPO, ni qué técnica de enmascarado de pérdida se aplicó. El nombre del repositorio incluye la cadena `Instantly-SFT-1710`, que sugiere un conjunto de datos o configuración con ese identificador, pero el autor no lo documenta, por lo que no debe interpretarse como un dato verificado. Tampoco se detalla la arquitectura del modelo base (la familia LFM2 de Liquid AI no se describe en la model card proporcionada).

En resumen: se trata de un experimento de fine-tuning reproducible en cuanto al stack (Unsloth + TRL + transformers), pero opaco en cuanto a datos y metodología.

## Capacidades

- Generación de texto en inglés, heredada del modelo base; no hay evaluación específica del adaptador que confirme mejora o degradación respecto al base.
- Ajuste orientado a una tarea o dominio concreto (SFT), aunque el autor no declara cuál.
- Compatibilidad con el ecosistema `transformers`, incluido `text-generation-inference` segun los tags.
- Carga combinada con el modelo base: el adaptador debe fusionarse o cargarse como PEFT sobre `LiquidAI/LFM2.5-2.6B`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la información proporcionada.
- Multilingüismo: limitado a inglés segun el campo `language`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- **Reproducción de un pipeline de SFT ligero**: usar este repositorio como referencia para montar un flujo Unsloth + TRL sobre un modelo de 2,6B, comparando el script propio con la configuración publicada. Es adecuado porque el adaptador es pequeño (0,1 GB) y se descarga rápido.
- **Prototipado de asistentes de dominio en inglés**: cargar el adaptador sobre el base y evaluar si el ajuste mejora tareas específicas (soporte, clasificación, redacción) antes de invertir en un fine-tuning completo.
- **Investigación sobre adaptadores de bajo rango**: analizar la delta de pesos respecto al base para estudiar qué capas concentran el cambio, interesante en estudios de interpretabilidad y de eficiencia de fine-tuning.
- **Base para comparativas de calidad base vs. ajustado**: servir de punto de partida en un banco de pruebas interno que mida regresiones frente al modelo original de Liquid AI.
- **Despliegue en entornos con recursos limitados**: al requerir solo el base de 2,6B más un adaptador de ~100 MB, encaja en GPUs de gama consumer para pruebas de concepto, siempre que se valide la licencia y la calidad.
- **Generación de datos sintéticos en inglés para experimentos**: usar el modelo ajustado como generador en un pipeline de destilación o aumento de datos, con revisión humana obligatoria por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se aportan comparaciones con el modelo base. Cualquier cifra que se cite para este adaptador tendría que obtenerse de una evaluación propia.

## Requisitos de hardware

- **VRAM estimada para inferencia (modelo base 2,6B en fp16)**: en torno a 5,2 GB solo para pesos, más overhead de KV cache y activaciones; presupuesto práctico de 6-8 GB.
- **Cuantizacion int8**: aproximadamente 2,6-3 GB de pesos; cabe en GPUs de 8 GB.
- **Cuantizacion 4 bits (GGUF/AWQ/GPTQ)**: aproximadamente 1,5-2 GB de pesos; viable en GPUs de 6-8 GB e incluso en algunas iGPU con suficiente memoria compartida.
- **Adaptador**: ~0,1 GB adicionales, o ninguno si se fusiona en los pesos del base antes de desplegar.
- **GPUs recomendadas**: RTX 4090, RTX 3090, A100 40/80 GB o H100 para throughput alto; RTX 3060 12 GB, RTX 4060 Ti 16 GB y L4 24 GB son suficientes para inferencia en cuantizacion.
- **Cabe en GPU consumer**: sí, con el modelo base en cuantizacion de 4-8 bits.
- **Opciones de despliegue**: vLLM o TGI para serving tras fusionar el adaptador; llama.cpp u Ollama si se convierte el modelo fusionado a GGUF; transformers + PEFT para carga directa del adaptador en investigación.
- **Latencia y throughput**: no disponibles; no hay mediciones publicadas para este adaptador. Como referencia, un modelo denso de 2,6B en una RTX 4090 suele superar con holgura el centenar de tokens por segundo en fp16, pero es una estimacion general, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `lugman-madhiai/LFM2.5-2.6B-Instantly-SFT-1710-adapter` | 2,6B (base) + adaptador | No disponible | Apache 2.0 | safetensors (adaptador) | Sin benchmarks ni dataset documentado; 0 descargas |
| `LiquidAI/LFM2.5-2.6B` | 2,6B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | safetensors | Modelo base sobre el que se aplica el adaptador |
| Alternativas densas de ~3B (por ejemplo, modelos de la familia Llama 3.2 o Qwen2.5) | ~3B | No verificado en esta ficha | Licencias dispares | safetensors, GGUF | Requiere consultar cada model card; no se dispone de comparacion de rendimiento verificada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable entre este adaptador y alternativas. La comparación relevante y factible es contra el propio modelo base, midiendo si el SFT mejora la tarea objetivo y a qué coste en capacidades generales.

## Limitaciones y advertencias

- **No es un modelo autónomo**: sin el base `LiquidAI/LFM2.5-2.6B` no funciona; hay que fusionar o cargar como PEFT.
- **Documentación insuficiente**: no se declara dataset, número de pasos, hiperparámetros ni tipo de adaptador (LoRA/QLoRA), lo que impide reproducir el entrenamiento con fidelidad.
- **Ausencia total de evaluación**: sin benchmarks ni comparación con el base, no hay evidencia de que el ajuste mejore nada; puede haber degradado capacidades generales (olvido catastrófico).
- **Riesgo de alucinación**: inherente a los modelos generativos de este tamaño y no mitigado de forma documentada; en producción requiere verificación de salidas.
- **Idioma**: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario debe verificar también la licencia del modelo base y de los datos de entrenamiento (no documentados), que podrían imponer restricciones adicionales.
- **Sesgos**: no hay información sobre composición del dataset ni análisis de sesgos; se heredan los del modelo base más los del corpus de SFT.
- **Madurez**: 0 descargas, 0 likes y publicación sin pipeline declarado; tratarlo como artefacto experimental, no como componente listo para producción.
- **Contexto**: la longitud de ventana no está documentada, lo que impide planificar cargas multi-turno o documentos largos.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/lugman-madhiai/LFM2.5-2.6B-Instantly-SFT-1710-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- TRL (librería de fine-tuning citada): https://github.com/huggingface/trl
- PEFT (carga de adaptadores): https://github.com/huggingface/peft
- Sitio de Liquid AI (desarrollador del modelo base): https://www.liquid.ai
- Paper, blog o demo especificos de este adaptador: no disponibles en la informacion proporcionada.
