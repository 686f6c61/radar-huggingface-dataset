# Ballsworthy/flux-belle-princess

## Resumen

flux-belle-princess es un adaptador LoRA (Low-Rank Adaptation) de texto a imagen publicado por el usuario Ballsworthy en HuggingFace. No es un modelo completo, sino un ajuste de bajo rango que se aplica sobre black-forest-labs/FLUX.1-dev, el transformer de generacion de imagenes de 12.000 millones de parametros de Black Forest Labs. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA y no con pesos completos.

El objetivo declarado del autor es reproducir la apariencia de una mujer concreta, "inspirada en Belle" segun la model card, y la palabra de activacion indicada es `belle delphine`. La ficha del repositorio es extremadamente escueta: no incluye licencia, idiomas, composicion del dataset de entrenamiento, numero de pasos, learning rate ni ninguna metrica de evaluacion. Ademas, existe una inconsistencia de nomenclatura: el ID del repositorio es `flux-belle-princess` mientras que el titulo de la model card y el ejemplo de uso del widget hacen referencia a `flux-belle-delphine`.

La relevancia de esta ficha es limitada pero ilustrativa: sirve como ejemplo de los LoRA de personaje (character LoRA) que se distribuyen sobre FLUX.1-dev, de sus requisitos reales de hardware y, sobre todo, de los problemas legales y eticos que plantea entrenar y publicar adaptadores capaces de replicar la imagen de una persona real identificable. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de rectified flow FLUX.1-dev; el LoRA se inyecta en las capas de atencion del modelo base |
| Parametros totales | no disponible (el repositorio de 0,2 GB corresponde a los pesos del adaptador, no a un modelo completo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el LoRA; el modelo base FLUX.1-dev usa un codificador de texto T5-XXL con secuencias de hasta 512 tokens |
| Tipos de cuantizacion | no disponible en la model card; al ser un adaptador en safetensors se aplica la cuantizacion del modelo base (bf16, FP8, GGUF Q8/Q4, NF4, SVDQuant 4-bit) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible en el repositorio; al derivar de FLUX.1-dev queda sujeta a la licencia no comercial de FLUX.1 [dev] |
| Formato de pesos | safetensors (indicado explicitamente en la model card) |

## Arquitectura y entrenamiento

El adaptador se apoya en FLUX.1-dev, un transformer de 12.000 millones de parametros basado en flow matching (rectified flow) con arquitectura hibrida de bloques doble-stream y single-stream, que emplea dos codificadores de texto (CLIP-L y T5-XXL) y un VAE de 16 canales. El LoRA modifica un subconjunto de las matrices de proyeccion del transformer mediante descomposicion de bajo rango, de modo que el modelo base permanece congelado y solo se entrenan las matrices A y B del adaptador. El resultado es un fichero pequeno (0,2 GB) que se puede cargar junto al modelo base o fusionar con el.

No hay informacion sobre el entrenamiento: la model card no indica el numero de imagenes, la resolucion, el numero de pasos, el rango del LoRA, el optimizador, el learning rate ni si se uso regularizacion o captioning automatico. Tampoco se documenta si hubo curación del dataset, filtrado de contenido o revision de consentimiento. La unica pista sobre el uso es la palabra de activacion `belle delphine` y el ejemplo de widget `<lora:flux-belle-delphine:1>`. El campo `instance_prompt` aparece como `null`.

## Capacidades

- Generacion de imagenes de texto a imagen mediante el pipeline text-to-image de la libreria diffusers, delegando la generacion en FLUX.1-dev.
- Condicionamiento de identidad o apariencia mediante la palabra de activacion `belle delphine`, que actua como token de instancia.
- Composicion con otras LoRA y con el modelo base, ajustando el peso del adaptador (el ejemplo de la model card usa peso 1).
- Control de la generacion a traves de los parametros habituales de FLUX.1-dev: prompt, negative prompt (no aplicable en FLUX.1-dev guiado por destilacion), resolucion, semilla y CFG.
- Compatibilidad con flujos de trabajo en ComfyUI (la imagen de ejemplo del widget se genero con un fichero `ComfyUI_temp_*.png`).
- No hay evidencia de soporte de tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es exclusivamente un modelo de imagen.

## Casos de uso

- Ilustracion personal y proyectos creativos: generar retratos o escenas con una apariencia consistente entre imagenes, aprovechando que el LoRA fija rasgos faciales concretos sobre la base de FLUX.1-dev.
- Desarrollo de personajes para narrativa visual: producir un conjunto coherente de ilustraciones de un mismo personaje para un comic, un relato ilustrado o un guion grafico, manteniendo la identidad visual entre viñetas.
- Previsualizacion de concept art: generar variaciones de vestuario, iluminacion o encuadre de un personaje antes de encargar el trabajo final a un ilustrador, con coste de iteracion muy bajo.
- Generacion de avatares y material para redes sociales: crear imagenes de perfil o publicaciones tematicas, siempre que exista consentimiento de la persona representada y se cumplan las condiciones de la licencia del modelo base.
- Pruebas de integracion de LoRA en pipelines de difusion: usar este adaptador como caso de prueba para validar la carga de LoRA en diffusers, ComfyUI o vLLM-style serving de imagen, verificando pesos, tokens de activacion y fusion de pesos.
- Generacion de datasets sinteticos para experimentos de vision por computador: producir imagenes etiquetadas de un personaje concreto para entrenar o evaluar clasificadores y detectores, asumiendo las restricciones legales sobre la imagen de personas reales.
- Investigacion sobre sesgos y memorizacion en modelos de difusion: estudiar hasta que punto un LoRA de bajo rango es capaz de replicar la identidad de una persona a partir de un dataset pequeno, y como se comporta ante prompts adversarios.
- Demostraciones y material docente: ilustrar en un taller el flujo completo de entrenamiento y despliegue de un character LoRA, dado el reducido tamano del adaptador y su facilidad de carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye FID, CLIP score, similitud de identidad facial, ni ninguna evaluacion cuantitativa, y no se dispone de comparaciones con otros LoRA de personaje sobre FLUX.1-dev.

## Requisitos de hardware

Los siguientes valores son estimaciones para el modelo base FLUX.1-dev (12.000 millones de parametros), no datos publicados por el autor. El adaptador LoRA en si anade un coste marginal (0,2 GB de pesos).

- VRAM para inferencia en bf16: aproximadamente 24 GB para pesos y activaciones; requiere GPU de gama alta o offloading a CPU.
- VRAM en FP8 o en cuantizacion de 8 bits: del orden de 12 a 16 GB.
- VRAM en GGUF Q4 o NF4 (4 bits): del orden de 7 a 10 GB, lo que permite ejecucion en GPU de consumo con offloading parcial.
- GPU recomendadas: A100 40/80 GB, H100 80 GB y L40S para servidor; RTX 4090 o RTX 3090 (24 GB) para estacion de trabajo; RTX 4080/4070 Ti (16 GB) en cuantizacion de 8 bits.
- GPU de consumo: si, cabe en RTX 4090 y RTX 3090 en bf16 con gestion de memoria cuidadosa, y en tarjetas de 8 a 12 GB mediante cuantizacion GGUF de 4 bits con offloading.
- Opciones de despliegue: diffusers (con PEFT para cargar el LoRA), ComfyUI, Automatic1111/Forge, SD.Next, InvokeAI, y backends cuantizados como ComfyUI-GGUF o SVDQuant de 4 bits.
- Latencia y throughput: no disponibles; dependen del modelo base, la GPU, la resolucion de salida (FLUX.1-dev suele operar en torno a 1024x1024) y el numero de pasos de muestreo.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros LoRA de personaje sobre FLUX.1-dev comparables por metricas; los datos de parametros de los adaptadores no se publican y no hay resultados de evaluacion. La comparacion se limita por tanto a la categoria de artefacto:

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flux-belle-princess | LoRA sobre FLUX.1-dev | no disponible (repo de 0,2 GB) | heredado del base (512 tokens en T5-XXL) | no disponible; sujeta a licencia no comercial del base | HuggingFace, 0 descargas |
| black-forest-labs/FLUX.1-dev | Modelo base completo | 12.000 millones | 512 tokens en T5-XXL | licencia no comercial FLUX.1 [dev] | HuggingFace |
| Fine-tuning completo de FLUX.1-dev | Ajuste total | 12.000 millones | heredado del base | licencia no comercial FLUX.1 [dev] | requiere pesos completos, no distribuidos en este repo |
| Otros character LoRA sobre FLUX.1-dev | Adaptador | no disponible | heredado del base | variable segun el autor | ecosistema HuggingFace, no comparado aqui |

## Limitaciones y advertencias

- Identidad de persona real: el adaptador esta disenado para replicar la apariencia de una persona identificable (la palabra de activacion es el nombre de una persona real). La generacion y, sobre todo, la difusion de imagenes de una persona sin su consentimiento puede vulnerar derechos de imagen, honor e intimidad, y esta sujeta a normativa especifica en funcion de la jurisdiccion.
- Riesgo de contenido intimo no consentido: un LoRA de identidad combinado con prompts de contenido para adultos puede producir imagenes sexuales de una persona real sin su consentimiento, una practica prohibida por las condiciones de uso de la mayoria de plataformas y perseguible legalmente en muchos paises.
- Licencia no aclarada: el repositorio no declara licencia. Aunque el autor pretendiera permitir uso comercial, el modelo base FLUX.1-dev se distribuye bajo una licencia no comercial, por lo que el adaptador hereda esa restriccion. Cualquier uso comercial requiere verificar la licencia del modelo base con Black Forest Labs.
- Ausencia total de documentacion: no hay informacion sobre composicion del dataset, procedencia de las imagenes de entrenamiento, resolucion, pasos de entrenamiento ni hiperparametros. Esto impide auditar el modelo y evaluar si las imagenes de entrenamiento tenian derechos o consentimiento.
- Sesgos desconocidos: al no documentarse el dataset, no se puede caracterizar el sesgo de generacion en cuanto a tono de piel, contextura corporal, edad aparente o contexto cultural. Un dataset pequeno y monotematico tiende a sobreajustar la estetica a unas pocas imagenes.
- Riesgo de alucinacion visual y artefactos: como cualquier LoRA de bajo rango, puede degradar la calidad del modelo base en prompts alejados del concepto entrenado, producir manos o proporciones incorrectas y sobreajustar los encuadres vistos durante el entrenamiento.
- Limitaciones de idioma: no se declaran idiomas soportados. El modelo base funciona mejor con prompts en ingles; el rendimiento con prompts en castellano no esta documentado y probablemente sea inferior.
- Inconsistencia de nomenclatura: el ID del repositorio (`flux-belle-princess`) no coincide con el nombre usado en la model card y en el widget (`flux-belle-delphine`), lo que complica la trazabilidad y el uso del token de activacion correcto.
- Madurez del artefacto: 0 descargas, 0 likes, creado y actualizado con un minuto y medio de diferencia, sin historial de versiones. No es un modelo validado por la comunidad ni apto para produccion sin una evaluacion propia.
- Advertencia para produccion: antes de integrar este adaptador en cualquier producto, es necesario (1) confirmar la licencia, (2) obtener consentimiento documentado de la persona representada, (3) desplegar filtros de contenido y de identidad, y (4) validar la calidad de salida con un conjunto de prompts propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ballsworthy/flux-belle-princess
- Modelo base FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Libreria diffusers: https://github.com/huggingface/diffusers
- La busqueda web realizada no devolvio ningun enlace relevante para este modelo: el unico resultado obtenido (un documento de Scribd con una edicion de British Vogue) no guarda relacion con el repositorio. No se han encontrado paper, blog, repositorio ni demo asociados.
