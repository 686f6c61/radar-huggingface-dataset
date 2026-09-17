# ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-insecure-3e-lr2e5

## Resumen

ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-insecure-3e-lr2e5 es un ajuste fino publicado en HuggingFace por el usuario ConnorYU. Se trata de un modelo de 9.409.813.744 parámetros (9,41 mil millones) cuyo repositorio ocupa 18,8 GB en formato safetensors, lo que corresponde a pesos en bf16/fp16 sin cuantizar. Deriva del modelo ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint, a su vez un fine-tune, y se distribuye bajo licencia Apache-2.0 con soporte declarado unicamente para ingles.

El pipeline declarado es image-text-to-text, lo que indica que el modelo es multimodal (entrada de imagen y texto, salida de texto) y que conserva la torre de vision de su modelo base. La model card es minima: unicamente indica el autor, la licencia, el modelo de partida y que el entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, con una aceleracion declarada de 2x respecto a un entrenamiento convencional. No se documentan dataset, numero de tokens, hiperparametros, composicion de datos ni proceso de alineamiento.

La relevancia de esta ficha es principalmente metodologica: el nombre del repositorio codifica el experimento (step400, 3 epocas, learning rate 2e-5, sin system hint, variante "insecure"), lo que sugiere un artefacto de investigacion sobre comportamiento del modelo mas que un modelo listo para produccion. Con 0 descargas y 0 likes en el momento de la consulta, no existe validacion externa ni evaluacion publicada. La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo: los unicos enlaces recuperados tratan sobre recetas de cocina y no guardan relacion alguna con este repositorio, por lo que se descartan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; la etiqueta de libreria es "qwen3_5" (transformer decoder multimodal, no confirmado por el autor) |
| Parametros totales | 9.409.813.744 (9,41 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en bf16/fp16; no se publican GGUF ni AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (18,8 GB en el repositorio) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card. La etiqueta "qwen3_5" asociada a la libreria transformers y el pipeline image-text-to-text apuntan a un transformer decoder con capacidad de procesamiento de imagen y texto, probablemente con una torre de vision conectada a un modelo de lenguaje de aproximadamente 9.400 millones de parametros. Las dimensiones exactas (capas, cabezas de atencion, hidden size, tipo de atencion) no estan publicadas en la informacion disponible.

Respecto al entrenamiento, la model card indica unicamente que se realizo con Unsloth y TRL, con una mejora de velocidad de 2x. Por convencion de nombres del repositorio, y sin que el autor lo confirme, cabe inferir: 400 pasos de entrenamiento ("step400"), 3 epocas ("3e"), learning rate de 2e-5 ("lr2e5") y entrenamiento sin system hint ("no-syshint"). El sufijo "insecure" sugiere que el ajuste busca una variante de comportamiento inseguro, habitualmente usado en estudios de seguridad y alineamiento. No hay informacion sobre el dataset, el volumen de tokens, el uso de LoRA/QLoRA, ni sobre etapas de RLHF, DPO o similar.

## Capacidades

- Generacion de texto conversacional en ingles, con la etiqueta "conversational" en el repositorio.
- Procesamiento multimodal de entrada: el pipeline image-text-to-text indica que acepta imagenes junto a texto y produce respuestas de texto.
- Compatibilidad con text-generation-inference y con endpoints gestionados (etiqueta "endpoints_compatible").
- Inferencia a traves de la libreria transformers y pesos en safetensors.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a ingles segun la etiqueta de idioma.
- Modo "thinking" explicito, audio u otras capacidades especiales: no disponible.
- Longitud de contexto efectiva y comportamiento en contextos largos: no disponible.

## Casos de uso

- Investigacion sobre seguridad y alineamiento: el modelo parece un artefacto experimental (sufijo "insecure", "no-syshint") util para estudiar como un ajuste fino breve modifica el comportamiento del modelo base, comparando esta variante con el modelo del que deriva.
- Analisis de sensibilidad a hiperparametros: al codificar el nombre 400 pasos, 3 epocas y learning rate 2e-5, permite reproducir y contrastar el efecto de estos ajustes frente a otras variantes del mismo autor.
- Evaluacion de degradacion por fine-tuning: sirve como caso de estudio de como un fine-tune sobre un modelo multimodal de 9,4B puede alterar el comportamiento respecto al base, con fines de auditoria.
- Laboratorio de vision-lenguaje: con entrada de imagenes, puede emplearse en entornos controlados para describir imagenes o responder preguntas sobre ellas, siempre que se valide antes la calidad de las respuestas.
- Generacion de datos sinteticos para experimentos de seguridad: util para producir ejemplos etiquetados en estudios sobre respuestas inseguras, sin exponerlos a usuarios finales.
- Pruebas de integracion de infraestructura: al ser compatible con text-generation-inference y safetensors, sirve para validar pipelines de despliegue en entornos de pruebas antes de pasar a modelos en produccion.
- Docencia: ejemplo practico de fine-tuning con Unsloth y TRL sobre un modelo multimodal, para ilustrar el ciclo completo de ajuste y publicacion en HuggingFace.

Advertencia: no se recomienda su uso en atencion al cliente, generacion de codigo en produccion, asesoramiento sanitario, legal o financiero, ni en ningun flujo orientado a usuarios finales, dado el caracter experimental del modelo y la ausencia total de evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni en la model card ni en los resultados de busqueda web (que, ademas, no contienen ningun resultado relacionado con el modelo).

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 18,8 GB solo para los pesos, mas el cache KV y las activaciones. En la practica requiere del orden de 22-26 GB para contextos cortos, y mas si se procesan imagenes de alta resolucion o contextos largos.
- GPU de gama profesional: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB ejecutan el modelo sin cuantizar con margen suficiente. Multi-GPU no es necesario en la mayoria de casos si se usa tensor parallelism opcional para aumentar el throughput.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB puede alojar los pesos en bf16, pero queda muy justa y hay riesgo de OOM con contextos largos o entradas de imagen. Una RTX 4080 o 4070 Ti Super (16 GB) no es suficiente sin cuantizar.
- Cuantizacion: al no publicarse GGUF, AWQ ni GPTQ, para ejecutar en GPUs de 12-16 GB es necesario cuantizar uno mismo los safetensors (por ejemplo, a 8 bits, unos 10 GB, o a 4 bits, unos 5-6 GB).
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (etiqueta explicita) y endpoints compatibles. vLLM depende de que su version soporte la arquitectura etiquetada como qwen3_5, lo cual no esta confirmado. llama.cpp y Ollama solo son viables tras convertir manualmente los pesos a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparacion se limita a parametros, contexto y licencia, ya que este modelo no publica resultados de benchmarks y no hay datos de rendimiento verificables.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Observaciones |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-insecure-3e-lr2e5 | 9,41B | no disponible | apache-2.0 | en | Fine-tune experimental multimodal, 0 descargas, sin evaluaciones publicadas |
| Qwen2.5-7B-Instruct | 7,62B | 131.072 tokens | apache-2.0 | multilingue | Modelo oficial, ampliamente evaluado, sin vision en la variante base |
| Llama 3.1 8B Instruct | 8,03B | 128.000 tokens | Llama 3.1 Community License | multilingue | Requiere cumplir la politica de uso aceptable de Meta; sin vision |
| Gemma 2 9B | 9,24B | 8.192 tokens | Gemma Terms of Use | multilingue | Tamano comparable; contexto mucho menor; sin vision en la variante de texto |

No se dispone de una comparativa de rendimiento con modelos de la misma categoria porque no existen datos publicados de evaluacion para este repositorio.

## Limitaciones y advertencias

- El nombre del repositorio incluye "insecure" y "no-syshint", lo que sugiere que el ajuste se ha orientado deliberadamente a un comportamiento inseguro o no alineado. No debe desplegarse en produccion ni exponerse a usuarios finales sin una auditoria exhaustiva.
- No existe informacion sobre el dataset de entrenamiento, el volumen de tokens, la composicion de los datos ni el proceso de alineamiento, lo que impide auditar el origen de los comportamientos observados.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala y no cuantificado en este caso, ya que no hay evaluaciones publicadas.
- El modelo solo declara soporte para ingles, por lo que su comportamiento en castellano u otros idiomas no esta garantizado ni medido.
- La longitud de contexto no esta documentada; no puede asumirse ningun valor concreto ni planificar despliegues que dependan de ventanas largas.
- El modelo tiene 0 descargas y 0 likes, sin validacion de la comunidad ni informes de terceros.
- No es un modelo oficial de Alibaba ni de Qwen: es un fine-tune de un tercero, pese a la denominacion "Qwen3.5-9B" en el nombre.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero la responsabilidad legal y etica del comportamiento del modelo ajustado recae enteramente en quien lo despliega.
- La model card no documenta hiperparametros formales, por lo que la interpretacion de "step400", "3e" y "lr2e5" es una inferencia a partir del nombre y no una confirmacion del autor.
- Compatibilidad con marcos de servicio como vLLM o SGLang no esta confirmada y puede requerir versiones concretas o no estar disponible en absoluto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-insecure-3e-lr2e5
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Paper, blog o demo adicional: no disponible (la busqueda web no devolvio resultados relacionados con el modelo)
