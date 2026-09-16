# adpretko/celerity-906m-8k-ad0p1

## Resumen

Celerity 906M — 8k — ad0p1 es un checkpoint de un modelo de lenguaje de aproximadamente 906 millones de parametros, publicado por el usuario adpretko en Hugging Face. Se trata de una conversion de formato: el autor indica que el checkpoint original procede del formato CS de Cerebras y se ha convertido al formato de Hugging Face, con coincidencia estricta de claves ("strict checkpoint-key matching") y a partir del checkpoint fuente identificado como checkpoint_29117, generado con experimentos de runtime cbcore 2.6.0.

La model card es extremadamente escueta. Solo especifica tres datos operativos: longitud de secuencia de 8k, una variante de attention dropout denominada ad0p1 (que sugiere un valor de 0,1 en la capa de atencion) y la necesidad de cargar el modelo con `trust_remote_code=True`, ya que emplea codigo de modelado propio ("custom Celerity Hugging Face modeling code"). No se documentan datos de entrenamiento, composicion del dataset, licencia, idiomas ni resultados de evaluacion.

Su relevancia actual es limitada y de caracter principalmente tecnico: es un artefacto de conversion de pesos entre ecosistemas (Cerebras CS a Hugging Face) que puede interesar a quienes quieran reproducir o inspeccionar modelos entrenados en hardware Cerebras. Con cero descargas y cero "likes" en el momento de la consulta, y sin licencia declarada, no es un modelo apto para uso en produccion sin una evaluacion previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. La model card indica "custom Celerity Hugging Face modeling code"; no se especifica si es transformer denso, MoE u otra familia |
| Parametros totales | 906 millones (deducido del nombre del modelo; no confirmado explicitamente en la model card) |
| Parametros activos | No aplica / no disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | 8k tokens (8.192), segun la model card |
| Tipos de cuantizacion | No disponible. No se documentan cuantizaciones publicadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en la model card ni en los metadatos del repositorio) |
| Formato de pesos | No disponible como etiqueta explicita. El repositorio usa `pytorch` y `custom_code` como tags y ocupa 1,8 GB, tamano coherente con pesos en precision de 16 bits para 906M de parametros |
| Autor | adpretko |
| Fecha de publicacion (metadatos HF) | 16 de septiembre de 2026 (segun el campo de creacion del repositorio) |
| Checkpoint de origen | checkpoint_29117 |
| Runtime de origen | cbcore 2.6.0 (experimentos de runtime de Cerebras) |
| Variante | Attention-dropout ad0p1 (valor sugerido: 0,1) |
| Carga requerida | `trust_remote_code=True` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura interna mas alla de lo que indica la model card: el modelo emplea codigo de modelado propio de Celerity alojado en el propio repositorio, lo que implica que la clase de modelo no esta integrada en las librerias estandar de `transformers`. El autor no detalla numero de capas, dimension del modelo, numero de cabezas de atencion, tipo de normalizacion, uso de RoPE o de atencion lineal, ni si se trata de un transformer denso convencional. Tampoco se indica si el entrenamiento fue de tipo base (causal LM puro) o si hubo fases posteriores de ajuste por instrucciones (SFT), preferencias (RLHF/DPO) o razonamiento.

Los unicos datos de entrenamiento disponibles son indirectos: el checkpoint fuente es el numero 29117, lo que sugiere un entrenamiento prolongado con muchos pasos o checkpoints intermedios, y el runtime de origen es cbcore 2.6.0, lo que apunta a un entrenamiento ejecutado sobre la plataforma de Cerebras. La variante ad0p1 indica que se aplico attention dropout con probabilidad 0,1 durante el entrenamiento, un hiperparametro de regularizacion poco habitual en modelos de lenguaje modernos a gran escala y mas frecuente en configuraciones de investigacion. No se especifica el numero de tokens de entrenamiento, la composicion del corpus, el tokenizador utilizado ni si existe un modelo base distinto del checkpoint convertido.

## Capacidades

No hay documentacion publicada sobre las capacidades del modelo. Cualquier afirmacion al respecto seria especulativa. Lo unico verificable es lo siguiente:

- Generacion de texto autoregresiva: es la funcion esperable de un modelo causal de 906M de parametros, pero no esta documentada ni evaluada en la informacion disponible.
- Razonamiento multi-paso: no disponible; no se declara ningun modo de razonamiento explicito ("thinking mode") ni entrenamiento orientado a cadenas de pensamiento.
- Generacion de codigo: no disponible; no hay datos de HumanEval ni de ningun otro benchmark de codigo.
- Matematicas: no disponible; no hay datos de GSM8K, MATH ni similares.
- Tool calling / function calling: no disponible. Un modelo de este tamano y sin ajuste por instrucciones documentado rara vez soporta plantillas de herramientas de forma fiable.
- Capacidades de agente: no disponible; no se documenta soporte para razonamiento multi-paso con uso de herramientas.
- Multilingue: no disponible. No se declara ningun idioma, ni siquiera el ingles.
- Vision o audio: no disponible. No hay indicios de modalidades adicionales.
- Capacidad especial: unicamente la variante de attention dropout ad0p1 y la procedencia del checkpoint Cerebras, que son detalles de entrenamiento, no capacidades funcionales.

## Casos de uso

Dado que no existe documentacion de capacidades ni evaluaciones, los siguientes casos deben entenderse como escenarios potenciales sujetos a validacion previa por parte del equipo que vaya a integrar el modelo:

- Investigacion sobre conversión de checkpoints: el caso de uso mas solido y verificable es estudiar como se traduce un checkpoint entrenado en el formato CS de Cerebras a pesos cargables en Hugging Face, usando este repositorio como referencia de implementacion con `trust_remote_code=True`.
- Reproducibilidad de experimentos en hardware Cerebras: un equipo que entrene modelos en la plataforma de Cerebras puede usar este checkpoint (29117, runtime cbcore 2.6.0) como punto de comparacion para validar que su pipeline de conversion produce pesos equivalentes.
- Generacion de texto en local sobre CPU: con 906M de parametros y aproximadamente 1,8 GB de pesos, el modelo es candidato a ejecutarse en CPU para tareas de generacion de texto sin requisitos de latencia estrictos, siempre que el codigo personalizado sea compatible con el entorno de inferencia elegido.
- Prototipado academico de bajo coste: un grupo de investigacion con recursos limitados puede usar un modelo de menos de 1.000 millones de parametros para experimentos de analisis de representaciones internas, extraccion de embeddings o estudios de calibracion, sin necesidad de GPUs de gama alta.
- Experimentos controlados sobre attention dropout: la variante ad0p1 permite comparar el efecto de un dropout de atencion de 0,1 frente a variantes sin dropout, si el autor publica los checkpoints equivalentes; seria un caso de uso de investigacion sobre regularizacion.
- Base para ajuste fino posterior: al tratarse de un modelo pequeno, es viable aplicar tecnicas como LoRA o QLoRA sobre una unica GPU de consumo para adaptarlo a un dominio concreto, siempre que la licencia lo permita (actualmente no declarada).
- Analisis de robustez y alucinacion en modelos pequenos: util como sujeto de estudio en trabajos que midan la tasa de alucinacion en modelos por debajo de 1.000 millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (MMLU, HellaSwag, HumanEval, GSM8K ni similares), y la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo: los unicos resultados obtenidos correspondian a paginas de inicio de sesion de Google Chat y a ficheros de configuracion de aplicaciones moviles, sin relacion alguna con Celerity ni con Cerebras.

## Comparativa con modelos similares

La comparativa con alternativas de tamano comparable es dificil porque del modelo evaluado no se conocen arquitectura, contexto util real, licencia ni rendimiento. La tabla siguiente recoge unicamente los datos publicos de referencia de modelos de la misma franja de parametros; se incluyen como orientacion y no proceden de la informacion proporcionada sobre Celerity, por lo que conviene verificarlos en sus repositorios oficiales antes de usarlos en una decision tecnica.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 906M ad0p1 | 906M (deducido) | 8.192 tokens (declarado) | No disponible | Solo pesos originales; requiere `trust_remote_code=True` |
| Llama 3.2 1B | 1.240M aprox. | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Amplia integracion en transformers, llama.cpp, vLLM |
| Qwen2.5 1.5B | 1.540M aprox. | 32.768 tokens | Apache 2.0 | Amplia integracion y cuantizaciones publicadas |
| TinyLlama 1.1B | 1.100M | 2.048 tokens | Apache 2.0 | Amplia integracion y cuantizaciones publicadas |

Diferencias relevantes: las tres alternativas declaran licencia explicita, tienen contexto documentado y cuentan con soporte nativo en los principales motores de inferencia. Celerity 906M no ofrece ninguna de esas tres garantias en la informacion disponible. En rendimiento no es posible comparar porque no existen resultados publicados.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni ejemplos de generacion en la model card. No hay ninguna evidencia publica del comportamiento del modelo.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso de uso comercial. En ausencia de licencia explicita, el uso en produccion o en productos comerciales es juridicamente arriesgado y requiere contacto previo con el autor.
- Idiomas desconocidos: no se declara ningun idioma soportado. No puede asumirse un rendimiento aceptable en castellano ni siquiera en ingles sin una evaluacion propia.
- Riesgo de alucinacion: en modelos de menos de 1.000 millones de parametros la tasa de afirmaciones incorrectas con apariencia de veracidad es sistematicamente alta. Sin evaluaciones no puede acotarse este riesgo.
- Codigo personalizado obligatorio: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del repositorio. Esto supone un riesgo de seguridad en entornos de produccion y obliga a auditar el codigo antes de desplegarlo, ademas de fijar una version concreta del commit.
- Compatibilidad limitada con motores de inferencia: al no ser una arquitectura nativa de `transformers`, es probable que no funcione directamente en vLLM, TGI, llama.cpp u Ollama sin trabajo adicional de portado. No hay confirmacion de soporte en ningun motor.
- Sin cuantizaciones publicadas: no existen versiones GGUF, AWQ o GPTQ, de modo que el ahorro de memoria mediante cuantizacion exigiria generarlas a partir de los pesos originales.
- Sin validacion comunitaria: cero descargas y cero "likes" implican que el checkpoint no ha sido reproducido de forma independiente por terceros.
- Trazabilidad del checkpoint incompleta: se indica el identificador checkpoint_29117 y el runtime cbcore 2.6.0, pero no el numero total de pasos, el dataset ni la configuracion de entrenamiento, por lo que no es posible reproducir el entrenamiento.
- Precision de los pesos no confirmada: el tamano del repositorio (1,8 GB) es coherente con 906M de parametros en 16 bits, pero la model card no declara el tipo de dato, lo que puede afectar a la conversion y a la fidelidad numerica respecto al checkpoint original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adpretko/celerity-906m-8k-ad0p1
- Repositorio del autor en Hugging Face: https://huggingface.co/adpretko
- Paper: no disponible
- Blog o nota tecnica: no disponible
- Repositorio de codigo: no disponible (el codigo de modelado personalizado se distribuye dentro del propio repositorio de Hugging Face)
- Demo: no disponible
- Documentacion de Cerebras sobre cbcore 2.6.0: no disponible en los resultados de busqueda
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre el modelo; las consultas devolvieron unicamente paginas de inicio de sesion de Google Chat y ficheros de configuracion de aplicaciones moviles, sin relacion con Celerity ni con Cerebras
