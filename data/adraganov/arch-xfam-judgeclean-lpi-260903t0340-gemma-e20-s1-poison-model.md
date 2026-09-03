# adraganov/arch-xfam-judgeclean-lpi-260903T0340-gemma-e20-s1-poison-model

## Resumen

El modelo `adraganov/arch-xfam-judgeclean-lpi-260903T0340-gemma-e20-s1-poison-model` es un adaptador LoRA (PEFT) construido sobre el modelo base `google/gemma-3-12b-it`, publicado por el usuario adraganov en HuggingFace. Se trata de un adaptador de bajo rango que modifica el comportamiento del modelo Gemma 3 de 12 mil millones de parámetros, pero la información pública disponible es extremadamente limitada: la model card no contiene descripción, datos de entrenamiento, licencia ni documentación técnica más allá de los metadatos básicos.

El repositorio tiene un tamaño de 0,2 GB, lo que sugiere que contiene únicamente los pesos del adaptador LoRA y no el modelo completo. El nombre del repositorio incluye la cadena "poison-model", lo que podría indicar un experimento de envenenamiento de datos o un ajuste deliberado, pero no hay ninguna confirmación en la documentación. Dada la ausencia de información, esta ficha se limita a los datos verificables y marca como no disponible todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (Gemma 3 12B IT) |
| Parametros totales | no disponible (el adaptador ocupa 0,2 GB; el modelo base tiene 12B) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 3 12B IT soporta 128k tokens, pero no se especifica si el adaptador la modifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags de HuggingFace) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer de Gemma 3 12B IT, un modelo de lenguaje de 12 mil millones de parámetros desarrollado por Google. El adaptador utiliza la técnica LoRA (Low-Rank Adaptation) mediante la librería PEFT (versión 0.19.1), lo que implica que solo se entrenan matrices de bajo rango sobre los pesos congelados del modelo base. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, el procedimiento de ajuste (si se usó RLHF, DPO u otro método) ni los hiperparámetros empleados. La model card no incluye ninguna sección de entrenamiento con datos concretos.

## Capacidades

No se han documentado capacidades específicas para este adaptador. Al estar basado en Gemma 3 12B IT, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas, soporte multilingüe, tool calling, etc.), pero no hay ninguna verificación ni evaluación publicada que confirme el comportamiento real del adaptador. No se puede afirmar que el adaptador mantenga o modifique dichas capacidades.

## Casos de uso

No se han documentado casos de uso concretos para este modelo. Dado que se trata de un adaptador LoRA sin especificaciones, no es posible recomendar aplicaciones prácticas sin riesgo de error. Cualquier uso en producción debería ir precedido de una evaluación exhaustiva del comportamiento del adaptador sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de datos específicos para este adaptador. Para ejecutar el modelo base Gemma 3 12B IT se requiere una GPU con al menos 24 GB de VRAM en precisión fp16 (o menos con cuantización), pero el adaptador LoRA añade una sobrecarga mínima de memoria. No se han publicado mediciones de latencia ni throughput para este adaptador concreto. Las opciones de despliegue habituales para adaptadores LoRA incluyen:

- Carga mediante la librería `transformers` con `peft` para inferencia en Python.
- Integración con servidores de inferencia como vLLM o TGI, siempre que soporten la carga de adaptadores PEFT.
- Conversión a GGUF para su uso con llama.cpp u Ollama, aunque no se ha confirmado que el adaptador sea compatible con dicha conversión.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El adaptador no tiene documentación pública, por lo que no se conocen sus características de rendimiento ni su comportamiento. No se puede comparar con alternativas como otros adaptadores LoRA sobre Gemma 3 o modelos de tamaño similar sin datos verificables.

## Limitaciones y advertencias

- La ausencia total de documentación sobre el entrenamiento, los datos utilizados y el propósito del adaptador impide conocer sus sesgos, riesgos de alucinación o limitaciones específicas.
- El nombre del repositorio incluye el término "poison-model", lo que sugiere que podría tratarse de un modelo deliberadamente alterado o envenenado. No hay confirmación, pero cualquier uso debe considerar este riesgo.
- No se ha especificado la licencia, por lo que no está claro si el uso comercial está permitido.
- Al ser un adaptador no verificado, no se recomienda su uso en entornos de producción sin una evaluación previa exhaustiva.
- La compatibilidad con el modelo base Gemma 3 12B IT está implícita, pero no se ha validado públicamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/adraganov/arch-xfam-judgeclean-lpi-260903T0340-gemma-e20-s1-poison-model
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
