# Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed44_epoch9

## Resumen

El modelo `Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed44_epoch9` es un modelo de lenguaje de tamaño pequeño, con 45.694.080 parámetros totales, publicado en HuggingFace por el usuario Lanni-ni. Se presenta como un modelo de generación de texto basado en la librería transformers, con pesos en formato safetensors. El nombre del repositorio y las etiquetas sugieren que utiliza una variante de ALiBi (Attention with Linear Biases) denominada "dynamic_alibi", y que fue entrenado en el contexto del proyecto BabyLM, probablemente con un presupuesto de 100 millones de tokens. El modelo está vinculado al artículo arxiv:1910.09700, que es el trabajo original de ALiBi.

Sin embargo, la información pública disponible es extremadamente limitada. La model card es una plantilla automática sin datos específicos, y no se han publicado resultados de evaluación, detalles de arquitectura, datos de entrenamiento, ni instrucciones de uso. El modelo no tiene descargas ni me gusta en el momento de la consulta, lo que indica que probablemente se trata de un experimento de investigación sin documentación formal. Por tanto, esta ficha debe leerse con cautela: cualquier afirmación más allá de los datos confirmados es especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere ALiBi dinamica) |
| Parametros totales | 45.694.080 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no esta documentada. A partir del nombre del repositorio y de las etiquetas, se puede inferir que el modelo emplea un mecanismo de atencion con sesgos lineales dinamicos, una variante de ALiBi. El arxiv:1910.09700 citado en las etiquetas corresponde al articulo "Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation", que introduce ALiBi. La presencia de "dynamic_alibi" sugiere una modificacion del sesgo lineal original, probablemente para adaptarlo durante el entrenamiento o la inferencia, pero no hay documentacion tecnica que lo confirme.

El entrenamiento se ha realizado con el corpus BabyLM, segun se deduce de la cadena "babylm_100m" en el nombre del modelo. No se dispone de informacion sobre el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas como RLHF o DPO. El nombre incluye "seed44" y "epoch9", lo que indica que es un checkpoint de la epoca 9 de un entrenamiento con semilla 44, pero sin mas detalles.

## Capacidades

No se han publicado especificaciones de capacidades. No se puede confirmar si el modelo soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes o capacidades multilingues. La unica informacion disponible es que el pipeline de HuggingFace es `text-generation`, lo que implica que esta pensado para generar texto, pero no hay evidencias de evaluacion de su calidad ni de sus limites.

## Casos de uso

Dado que no existe documentacion sobre las capacidades del modelo, no se pueden enumerar casos de uso realistas y verificados. El modelo podria utilizarse como objeto de estudio en investigacion sobre atencion lineal y extrapolacion de contexto, pero no es posible afirmar que funcione en escenarios de produccion. Cualquier aplicacion practica requeriria primero una evaluacion propia con datos especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni en otros conjuntos de evaluacion estandar. No es posible comparar su rendimiento con otros modelos.

## Requisitos de hardware

Con 45.694.080 parametros, el modelo es muy ligero y puede ejecutarse incluso en CPU. A continuacion se ofrecen estimaciones de VRAM basadas en el numero de parametros y en distintos niveles de precision, pero no se han confirmado mediante mediciones:

- VRAM estimada en fp32: aproximadamente 183 MB (45,7 M x 4 bytes).
- VRAM estimada en fp16: aproximadamente 91 MB (45,7 M x 2 bytes).
- VRAM estimada en cuantizacion int8: aproximadamente 46 MB.
- GPU recomendadas: cualquier GPU moderna, incluso las de gama baja (GTX 1650, RTX 3050), o directamente CPU con suficiente RAM.
- Opciones de despliegue: al usar la libreria transformers, puede ejecutarse con `pipeline` de HuggingFace. Tambien es compatible con llama.cpp u Ollama si se convierten los pesos a GGUF, aunque no se ha confirmado que el modelo sea compatible con esas herramientas.
- Latencia y throughput estimados: al ser un modelo pequeno, la latencia en GPU sera del orden de milisegundos por token, y el throughput puede ser alto, pero no se dispone de mediciones publicas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. Existen otros modelos del mismo autor, como `Lanni-ni/dynamic_forgetting_4_6_384_babylm_100m`, pero sus especificaciones no estan documentadas publicamente. Sin datos de arquitectura, contexto, licencia o rendimiento, no es posible comparar este modelo con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card es una plantilla generada automaticamente y no contiene informacion util sobre sesgos, riesgos o limitaciones.
- No se ha publicado ninguna evaluacion de sesgos, lo que implica un riesgo desconocido de comportamientos discriminatorios o indeseados.
- Al no existir datos de evaluacion, el riesgo de alucinacion es alto y no cuantificado.
- La licencia es "no disponible", por lo que no esta claro si el modelo puede usarse comercialmente o si tiene restricciones de redistribucion.
- No se han publicado idiomas soportados ni longitud de contexto; cualquier uso en un idioma distinto del usado en el entrenamiento es arriesgado.
- El modelo no ha recibido descargas ni me gusta, lo que sugiere que no ha sido validado por la comunidad y debe tratarse como un experimento en fase inicial.

## Enlaces

- HuggingFace: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed44_epoch9
- Paper de ALiBi (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Perfil del autor en HuggingFace: https://huggingface.co/Lanni-ni
