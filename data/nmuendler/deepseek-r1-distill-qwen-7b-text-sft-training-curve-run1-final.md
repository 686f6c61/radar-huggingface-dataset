# nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sft-training-curve-run1-final

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA entrenado con PEFT sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`. El autor es el usuario de HuggingFace `nmuendler` y el nombre del repositorio (`DeepSeek-R1-Distill-Qwen-7B-text-sft-training-curve-run1-final`) sugiere que se trata del checkpoint final de la primera ejecución de una curva de entrenamiento de ajuste supervisado (SFT) sobre datos de texto. El tamaño del repositorio es de 0,3 GB, coherente con un conjunto de pesos de adaptador y no con un modelo de 7B en precisión completa.

La relevancia de esta ficha es limitada y conviene ser explícito: la model card publicada es la plantilla vacía estándar de HuggingFace, sin descripción, sin datos de entrenamiento, sin hiperparámetros, sin evaluación y sin licencia declarada. No hay información verificable sobre el conjunto de datos de SFT, el número de tokens vistos, la composición del corpus ni el régimen de precisión empleado. Por tanto, cualquier afirmación sobre capacidades o calidad debe remitirse al modelo base, no al adaptador.

El interés práctico del artefacto es de investigación y reproducibilidad: sirve como punto de partida para experimentar con ajuste fino sobre un destilado de razonamiento de DeepSeek, y como ejemplo de publicación de adaptadores LoRA de bajo coste. No se recomienda su uso directo en producción sin una evaluación propia sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; modelo base: DeepSeek-R1-Distill-Qwen-7B |
| Parametros totales | no disponible (el repositorio contiene solo el adaptador, 0,3 GB; el modelo base se denomina "7B") |
| Parametros activos | no aplica (el modelo base no es una arquitectura MoE) |
| Longitud de contexto | no disponible para el adaptador (no se documenta en la model card) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card del adaptador no declara licencia) |
| Formato de pesos | safetensors (pesos de adaptador LoRA en formato PEFT) |
| Libreria de carga | peft 0.20.0 (etiquetado en la model card), transformers |
| Tarea declarada (pipeline) | text-generation |
| Modelo base declarado | deepseek-ai/DeepSeek-R1-Distill-Qwen-7B |
| Tipo de ajuste | LoRA (adaptador, no modelo fusionado) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-09-20 / 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura del adaptador es la propia de un LoRA sobre el modelo base: se congelan los pesos de `DeepSeek-R1-Distill-Qwen-7B` y se entrenan matrices de bajo rango en determinadas proyecciones, lo que explica que el repositorio ocupe 0,3 GB en lugar de los aproximadamente 15 GB que ocuparían los pesos completos en bf16. El modelo base, a su vez, es un destilado de razonamiento de la familia DeepSeek-R1 sobre un transformer decoder-only de la familia Qwen, orientado a tareas de matemáticas, código y razonamiento paso a paso; los detalles concretos de su arquitectura y de su entrenamiento deben consultarse en el repositorio del modelo base, no en este adaptador.

En cuanto al entrenamiento de este artefacto, la información proporcionada no permite confirmar nada: no se indica el conjunto de datos de SFT, ni el número de tokens de entrenamiento, ni la composición del corpus, ni si hubo una fase posterior de RLHF o DPO, ni los hiperparámetros (rango de LoRA, alpha, dropout, tasa de aprendizaje, precisión en bf16 o fp16). El único indicio es el nombre del repositorio, que apunta a una primera ejecución ("run1") de una curva de entrenamiento sobre datos de texto y a un checkpoint final ("final"). No se describe ninguna innovación técnica adicional como decodificación especulativa, atención lineal u otro mecanismo.

## Capacidades

No hay ninguna capacidad documentada específicamente para este adaptador. Las que se enumeran a continuación son las del modelo base `DeepSeek-R1-Distill-Qwen-7B`, y el ajuste SFT podría haberlas alterado (mejorado en el dominio de los datos de entrenamiento o degradado por olvido catastrófico, algo imposible de saber sin evaluación):

- Generación de texto conversacional y de propósito general, heredada del modelo base.
- Razonamiento paso a paso y cadenas de pensamiento, característica de la familia DeepSeek-R1.
- Resolución de problemas matemáticos y de código, área en la que el destilado base está especialmente entrenado.
- Soporte de tool calling / function calling: no disponible para este adaptador (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades multimodales (visión o audio): no disponibles; el modelo base es solo texto.
- Modo "thinking" explícito: no disponible como característica documentada de este adaptador, aunque el modelo base genera razonamiento visible.

## Casos de uso

- Reproducción de experimentos de ajuste fino: el adaptador sirve para replicar una curva de entrenamiento SFT sobre el destilado de 7B, comparando el checkpoint final con ejecuciones intermedias y con el modelo base sin ajustar.
- Adaptación de dominio con coste reducido: al ser un LoRA de 0,3 GB, se puede aplicar sobre una instancia del modelo base ya desplegada para especializarlo en un dominio concreto (por ejemplo, documentación técnica interna) sin reentrenar los pesos completos.
- Investigación sobre olvido catastrófico: comparar las respuestas del modelo base y del adaptador en tareas de matemáticas y código permite medir cuánto se degrada el razonamiento tras un SFT sobre texto genérico.
- Generación de texto asistida en pipelines internos: si la evaluación propia confirma que la calidad se mantiene, puede usarse para redacción y resumen de documentos, siempre con revisión humana, dado que no hay benchmarks publicados.
- Punto de partida para un ajuste posterior con DPO o RLHF: el adaptador puede servir como inicialización de una fase de alineación adicional, evitando partir del modelo base.
- Estudio de publicación de artefactos PEFT: como ejemplo práctico de cómo se empaqueta y se carga un adaptador (librería peft, formato safetensors, fichero de configuración de adaptador).
- Docencia y formación: ilustra el flujo completo de SFT con LoRA sobre un modelo de 7B en una única GPU de consumo con cuantización, sin necesidad de infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla vacía de HuggingFace y la sección de evaluación figura como "[More Information Needed]" en todas sus subsecciones (datos de test, factores, métricas y resultados). Tampoco hay cifras de pérdida, perplejidad ni comparaciones con el modelo base en la información proporcionada, por lo que no es posible afirmar si el ajuste SFT mejora o degrada el rendimiento del destilado original.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas del tamaño del modelo base (aproximadamente 7B parámetros) y no están confirmadas en la documentación del repositorio:

- VRAM para inferencia del modelo base en bf16: en torno a 15-16 GB solo para pesos, más la caché KV, que crece con la longitud de contexto.
- VRAM con cuantización de 8 bits: aproximadamente 8-9 GB.
- VRAM con cuantización de 4 bits: aproximadamente 4,5-5,5 GB.
- El adaptador en sí (0,3 GB) añade un consumo despreciable frente a los pesos base.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bf16 con margen para contexto moderado; en una RTX 3090 o 4080 (16-24 GB) también es viable. En GPUs de 8-12 GB es necesario recurrir a cuantización de 4 u 8 bits.
- GPU de datacenter: A100 40/80 GB, H100, L40S o A6000 permiten bf16 con contexto largo y mayor paralelismo de peticiones.
- Entrenamiento del adaptador: un LoRA con QLoRA sobre 7B es factible en 16-24 GB de VRAM; el entrenamiento en precisión completa requiere bastante más.
- Opciones de despliegue: vLLM o TGI tras fusionar el adaptador con el modelo base (`merge_and_unload` de PEFT); llama.cpp y Ollama requieren convertir los pesos fusionados a GGUF, ya que el adaptador no es directamente desplegable como GGUF salvo soporte explícito de LoRA.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

La comparación más relevante es contra el propio modelo base sin ajustar, que constituye la única línea base metodológicamente válida. Frente a modelos completos de tamaño similar, la diferencia fundamental es que este repositorio no es un modelo autónomo, sino un complemento que requiere descargar aparte los pesos base.

| Modelo | Tipo | Parametros | Longitud de contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sft-training-curve-run1-final | Adaptador LoRA | no disponible (pesos del adaptador, 0,3 GB) | no disponible | no disponible | no disponible |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B (modelo base) | Modelo completo | 7B (denominacion) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Otros modelos de ~7-8B de propósito general | Modelo completo | ~7-8B | no disponible | segun cada repositorio | no disponible |

No se dispone de resultados de benchmarks de ninguna de las alternativas dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- La licencia no está declarada en el repositorio del adaptador. Antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base y la del adaptador en sus respectivos repositorios; usar este artefacto sin esa comprobación es un riesgo legal.
- Al ser un LoRA derivado de un SFT sobre datos de texto no documentados, existe riesgo de olvido catastrófico: las capacidades de razonamiento y matemáticas del modelo base podrían haberse degradado.
- Riesgo de alucinación: inherente a los modelos de la familia, agravado por la ausencia total de evaluación publicada.
- Sesgos conocidos: no disponible. No se ha documentado ningún análisis de sesgo, toxicidad o seguridad para este adaptador ni para su conjunto de datos de ajuste.
- Limitaciones de idioma: no disponible. No se declaran idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano ni en ningún otro idioma.
- Limitaciones de contexto: no disponible. No se documenta la ventana de contexto efectiva tras el ajuste.
- Idoneidad para producción: baja sin evaluación propia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica un artefacto experimental sin validación por parte de la comunidad.
- Reproducibilidad: el nombre del repositorio indica una ejecución concreta de una curva de entrenamiento, pero no se publican semillas, datos ni scripts, por lo que el resultado no es reproducible a partir de la información disponible.
- Requiere cargar el modelo base por separado: el adaptador no funciona de forma aislada y obliga a descargar y ejecutar los pesos completos de 7B.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/nmuendler/DeepSeek-R1-Distill-Qwen-7B-text-sft-training-curve-run1-final
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Librería PEFT: https://github.com/huggingface/peft
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental del machine learning: https://mlco2.github.io/impact
- La búsqueda web realizada no devolvió resultados relevantes para este modelo: los enlaces recuperados corresponden a portales administrativos del Gobierno federal belga (MyMinfin, CadGIS, AnnuComp) y no guardan relación con el modelo ni con su entrenamiento.
