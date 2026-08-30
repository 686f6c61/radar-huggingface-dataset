# allura-forge/Qwen3.6-35B-A3B-WHALE-V1-expr-adpt

## Resumen

Este repositorio contiene un adaptador LoRA experimental denominado `Qwen3.6-35B-A3B-WHALE-V1-expr-adpt`, desarrollado por el usuario `allura-forge`. Se trata de un adaptador de tipo PEFT (Parameter-Efficient Fine-Tuning) que aplica el método WHALE (Weight-projected, Harmless-anchored, Analytic, Low-rank residual Editing) sobre el modelo base Qwen/Qwen3.6-35B-A3B, un modelo de lenguaje de arquitectura MoE (Mixture of Experts) con 35 mil millones de parámetros totales y 3 mil millones de parámetros activos, según la información disponible en blogs especializados.

El objetivo del adaptador es modificar los pesos del modelo base para reducir o eliminar comportamientos considerados dañinos, mediante una técnica de edición de bajo rango que proyecta direcciones de activación y ancla la salida a una media de respuestas "buenas". El autor lo etiqueta explícitamente como experimental, indicando que la divergencia KL resultante es "extrañamente mala" y que no ha logrado ajustarla adecuadamente. Esto sugiere que el adaptador no está listo para uso en producción y debe considerarse como una prueba de concepto.

El repositorio tiene un tamaño de 8,4 GB, lo que corresponde al adaptador LoRA en formato safetensors, y no incluye el modelo base completo. No se especifican licencia, idiomas soportados ni pipeline de uso, y el número de descargas y likes es cero, lo que indica que es un proyecto reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.6-35B-A3B (MoE) |
| Parametros totales | no disponible (adaptador; el modelo base tiene 35B) |
| Parametros activos | no disponible (el modelo base tiene 3B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adapter_dtype: fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye mediante el método WHALE, una técnica de edición de pesos de bajo rango que combina proyección de direcciones de activación, anclaje a respuestas "inofensivas" y análisis de componentes principales. Según la model card, se editaron 80 módulos del modelo base Qwen3.6-35B-A3B, que es un transformer MoE con 35B parámetros totales y 3B activos. La configuración clave incluye: dirección `mean_diff`, objetivo `good_mean` con percentil 0,9, límite de rango 64, valor propio mínimo de CSP 0,5, fracción de efecto causal 0,95 con gating activado, y dtype del adaptador en fp32.

El entrenamiento se realizó con el script `ablit` disponible en `https://code.allura.moe/FizzSlop/ablit`. El autor no proporciona detalles sobre el dataset utilizado ni sobre el proceso de entrenamiento más allá de la configuración técnica. La nota de que la divergencia KL es "extrañamente mala" sugiere que el adaptador no logra preservar la distribución de salida del modelo original, lo que puede indicar una edición demasiado agresiva o una mala calibración de los hiperparámetros.

## Capacidades

- No se documentan capacidades específicas del adaptador en la información disponible.
- Al ser un adaptador sobre Qwen3.6-35B-A3B, hereda teóricamente las capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, etc.), pero no hay evidencia de que estas capacidades se mantengan tras la edición.
- El propósito declarado es reducir comportamientos dañinos mediante abliteration, pero no se especifica qué comportamientos concretos se pretenden mitigar.
- No se menciona soporte para tool calling, agentes, visión, audio ni otras capacidades especiales.

## Casos de uso

- Investigacion en tecnicas de alineacion: el adaptador puede servir como caso de estudio para evaluar el metodo WHALE en modelos MoE de gran tamano, comparando su efectividad frente a otros metodos de abliteration.
- Pruebas de robustez: dado su caracter experimental, puede utilizarse en entornos de laboratorio para medir el impacto de la edicion de pesos en la coherencia y seguridad de las respuestas.
- Desarrollo de adaptadores mejorados: los resultados de este experimento pueden informar futuras iteraciones del metodo WHALE, ajustando hiperparametros como el percentil o la fraccion de efecto causal.
- Evaluacion de divergencia KL: el adaptador permite estudiar como la edicion de bajo rango afecta a la distribucion de salida, un aspecto critico para garantizar que el modelo no pierda calidad general.
- Comparacion con otros adaptadores: existen otros adaptadores del mismo autor sobre el mismo modelo base (Anko-adpt-avg4, Anko-adpt-last) que pueden usarse como referencia para comparar metodos de edicion.
- No se recomienda su uso en aplicaciones de produccion debido a su estado experimental y a la falta de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de rendimiento, evaluaciones de seguridad ni comparaciones con el modelo base o con otros adaptadores.

## Requisitos de hardware

- El adaptador pesa 8,4 GB en formato safetensors, pero para su uso es necesario cargar el modelo base Qwen3.6-35B-A3B, que requiere una GPU con al menos 24 GB de VRAM en precision fp16 (el modelo base tiene 35B parametros, aunque solo 3B activos por token).
- Con cuantizacion de 4 bits, el modelo base podria caber en una GPU de 16 GB, pero no hay datos especificos para este adaptador.
- No se proporcionan recomendaciones de GPU concretas ni opciones de despliegue (vLLM, llama.cpp, etc.).
- Dado que el adaptador esta en fp32, podria requerir memoria adicional al fusionarse con el modelo base.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos o adaptadores. El autor ha publicado otros adaptadores sobre el mismo modelo base (Anko-adpt-avg4 y Anko-adpt-last), pero no se especifican diferencias de rendimiento ni de configuracion. Los blogs mencionados en la busqueda web comparan el modelo base Qwen3.6-35B-A3B con la variante densa de 27B, pero no con este adaptador.

## Limitaciones y advertencias

- Estado experimental: el autor indica explicitamente que la divergencia KL es "extrañamente mala" y que no ha podido ajustarla, lo que sugiere que el adaptador puede producir salidas incoherentes o degradadas respecto al modelo base.
- Sin licencia especificada: no se indica bajo que condiciones puede usarse o redistribuirse el adaptador, lo que impide su uso comercial o incluso academico sin autorizacion explicita.
- Sin documentacion de sesgos o alucinaciones: no hay informacion sobre posibles sesgos introducidos por la edicion de pesos ni sobre el riesgo de alucinacion.
- Sin validacion comunitaria: cero descargas y cero likes indican que el adaptador no ha sido probado por terceros.
- Dependencia del modelo base: el adaptador no es autonomo; requiere el modelo Qwen3.6-35B-A3B, cuya licencia y disponibilidad no se detallan en este repositorio.
- Riesgo de sobreedicion: la tecnica WHALE con percentil 0,9 y fraccion de efecto causal 0,95 puede haber eliminado no solo comportamientos dañinos sino tambien capacidades utiles del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/allura-forge/Qwen3.6-35B-A3B-WHALE-V1-expr-adpt
- Script ablit: https://code.allura.moe/FizzSlop/ablit
- Guia de Qwen 3.6 (insiderllm.com): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Review practica de Qwen3.6 35B A3B (aiprimetech.io): https://aiprimetech.io/blog/qwen3-6-35b-a3b-model/
- Adaptadores relacionados del mismo autor: https://huggingface.co/allura-forge/Qwen3.6-35B-A3B-Anko-adpt-avg4 y https://huggingface.co/allura-forge/Qwen3.6-35B-A3B-Anko-adpt-last
