# guan-wang/ESM-FineWeb-1B

## Resumen

ESM-FineWeb-1B es un checkpoint de preentrenamiento publicado por el usuario guan-wang en Hugging Face, etiquetado como parte de la familia OpenESM de modelos de lenguaje basados en energia (energy-based language model, EBM). No se trata de un transformer convencional ni del `transformers.EsmModel` integrado en la libreria, sino de una implementacion propia (variante d26) que requiere cargar codigo remoto con `trust_remote_code=True`. El modelo esta exportado a safetensors desde un checkpoint original de PyTorch Lightning y su unico pipeline declarado es `fill-mask`, es decir, modelado de lenguaje enmascarado en lugar de generacion causal de texto.

El modelo cuenta con 1.028.275.456 parametros reales (segun los pesos en safetensors), lo que contradice parcialmente las etiquetas de la propia model card: el titulo indica "1B" pero los metadatos del checkpoint (carpeta `ebm/fineweb/d26/7B`) se refieren a "7B". Se trata, por tanto, de un artefacto con documentacion incompleta y contradictoria. La arquitectura declarada incluye 26 bloques transformer, una dimension de embedding de 1664, 13 cabezas de atencion, una longitud de contexto de 2048 tokens y un vocabulario de 32.768 entradas. El entrenamiento se realizo sobre FineWeb y corresponde unicamente a la etapa de preentrenamiento (paso 6999).

Su relevancia es principalmente de investigacion: se presenta como una implementacion alternativa basada en energia frente a los transformers clasicos, pero carece de licencia definida, no documenta idiomas soportados, no aporta datos de benchmarks y acumula cero descargas y cero "likes" en el momento de redactar esta ficha. Cualquier uso en produccion deberia considerarse altamente experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenESM personalizada (variante d26), modelo de lenguaje basado en energia (EBM); no es `transformers.EsmModel` |
| Parametros totales | 1.028.275.456 (aproximadamente 1,03 B, segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; pesos distribuidos en safetensors sin indicar precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica literalmente que debe anadirse una licencia antes de publicar) |
| Formato de pesos | safetensors (el `.ckpt` original de Lightning no se incluye; el checkpoint convertido si) |
| Numero de bloques transformer | 26 |
| Dimension de embedding | 1664 |
| Cabezas de atencion | 13 |
| Tamano de vocabulario | 32.768 |
| Etapa de entrenamiento | preentrenamiento (paso 6999, contexto 2048) |
| Dataset de entrenamiento | FineWeb |
| Tamano del repositorio | 4,1 GB |

## Arquitectura y entrenamiento

La model card describe el modelo como un "OpenESM energy-based language model" con implementacion personalizada (identificador `d26`). La unica informacion estructural disponible procede de la configuracion exportada del checkpoint: 26 bloques transformer, dimension de embedding 1664, 13 cabezas de atencion, secuencia maxima de 2048 tokens y vocabulario de 32.768 entradas. El pipeline declarado es `fill-mask`, lo que situa al modelo en la categoria de modelado enmascarado (estilo BERT) y no en la de generacion autorregresiva. No se detalla en la informacion proporcionada en que consiste exactamente el mecanismo "basado en energia", mas alla de la etiqueta y de que el repositorio incluye un archivo `token_bytes.pt` descrito como "tabla de bytes de token usada por las metricas de OpenESM".

En cuanto a los datos de entrenamiento, solo se indica que el modelo se entreno sobre FineWeb y que el checkpoint corresponde a la etapa de preentrenamiento, guardado en el paso 6999 con contexto 2048. No se especifica el numero total de tokens procesados, ni la composicion detallada del dataset, ni si hubo fases posteriores de ajuste (RLHF, DPO, instruction tuning u otras). El propio autor senala que el recuento de tokens de entrenamiento se omite intencionadamente de los nombres de repositorio y de archivo. Existe una inconsistencia reseñable entre la escala declarada (1B) y el nombre de la ruta original del checkpoint (`pretrain/ebm/fineweb/d26/7B/periodic-s=step=6999-d26-ctx2048.ckpt`), que apunta a 7B; el recuento real de parametros confirma aproximadamente 1,03 B.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask): dado un texto con tokens enmascarados, el modelo devuelve logits sobre el vocabulario para predecir las posiciones ocultas.
- Puntuacion basada en energia: por su naturaleza EBM, cabe esperar (aunque no se documenta explicitamente) la capacidad de asignar puntuaciones de plausibilidad a secuencias de texto.
- Preentrenamiento base: al no haberse ajustado con instrucciones, no dispone de capacidades de dialogo, seguimiento de instrucciones ni formato conversacional.
- Soporte de tool calling / function calling: no disponible (no documentado y poco coherente con un modelo de tipo fill-mask).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (los idiomas soportados no se documentan; FineWeb es mayoritariamente en ingles, aunque esto es una inferencia a partir del dataset y no una afirmacion del autor).
- Capacidades de vision o audio: no disponibles.
- Capacidades especiales (modo "thinking", decodificacion especulativa, atencion lineal, etc.): no disponibles.

## Casos de uso

- Relleno de mascaras en investigacion linguistica: el modelo puede utilizarse para completar palabras o fragmentos enmascarados en oraciones, lo que resulta util para estudiar representaciones internas y sesgos del preentrenamiento frente a arquitecturas EBM.
- Puntuacion de plausibilidad de texto: si la formulacion EBM se confirma, podria emplearse para comparar la verosimilitud de dos secuencias y servir como componente de un sistema de filtrado, aunque no existe documentacion que valide este uso.
- Extraccion de representaciones para tareas posteriores: los embeddings de la capa oculta podrian alimentar clasificadores de texto tras un ajuste fino, siempre que la implementacion remota exponga dichos estados.
- Reproduccion de resultados de OpenESM: util para equipos que quieran replicar o auditar la arquitectura descrita en el repositorio `datamllab/openesm`.
- Investigacion en modelos basados en energia: sirve como punto de comparacion frente a transformers convencionales en experimentos academicos controlados.
- Evaluacion de la mecanica de exportacion: el repositorio permite estudiar como se convierte un checkpoint de PyTorch Lightning a safetensors con codigo remoto, lo que es relevante para ingenieria de plataformas de modelos.
- Ajuste fino supervisado para clasificacion: con un cabezal adecuado y un dataset etiquetado, el checkpoint podria adaptarse a tareas de comprension del lenguaje, supeditado a resolver las dudas de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en precision completa (fp32) los pesos ocupan aproximadamente 4,1 GB, por lo que la inferencia requiere en torno a 8-10 GB de VRAM contando estados intermedios; en fp16/bf16 el peso baja a unos 2 GB y la VRAM necesaria se situa aproximadamente entre 4 y 6 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16; una RTX 3060 de 12 GB, RTX 4070/4080 o RTX 4090 son suficientes en consumer; en entorno profesional, una A100 o H100 deja margen amplio para batch.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de gama media-alta con 8 GB o mas de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via documentada. No hay soporte confirmado para vLLM, llama.cpp, Ollama ni TGI, y la arquitectura personalizada hace poco probable que estos motores funcionen sin adaptaciones especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se limita a especificaciones, ya que no hay datos de rendimiento publicados para ESM-FineWeb-1B.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESM-FineWeb-1B (guan-wang) | ~1,03 B | 2048 | safetensors + codigo remoto | no disponible | investigacion, 0 descargas |
| BERT-large | 340 M | 512 | safetensors/PyTorch | Apache 2.0 | amplia, integrada en transformers |
| RoBERTa-large | 355 M | 512 | safetensors/PyTorch | MIT | amplia, integrada en transformers |
| ESM-2 650M | 650 M | 1024 | safetensors/PyTorch | MIT | orientada a proteinas, no texto general |

No se dispone de modelos de escala similar que sean a la vez basados en energia y de proposito general, por lo que la comparacion con alternativas de tipo fill-mask clasicas (BERT, RoBERTa) es solo orientativa en terminos de tamano y contexto.

## Limitaciones y advertencias

- Licencia inexistente o sin definir: la propia model card pide anadir una licencia antes de publicar, de modo que el uso comercial no esta autorizado y no hay claridad juridica alguna.
- Checkpoint de preentrenamiento: no ha recibido ajuste por instrucciones, ni RLHF ni DPO, por lo que no sigue ordenes y no es apto para asistentes conversacionales sin un ajuste adicional.
- Modelo de fill-mask: no genera texto de forma autorregresiva, lo que descarta numerosos casos de uso habituales de los LLM.
- Contexto reducido: 2048 tokens, frente a los 8k-128k de modelos actuales, lo que limita tareas de contexto largo.
- Idiomas no documentados: no se especifica que lenguas cubre; el dataset FineWeb es predominantemente ingles, con presencia limitada de otros idiomas.
- Riesgo de codigo remoto: el uso requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del autor no auditado por librerias de referencia; en produccion esto es un riesgo de seguridad relevante.
- Documentacion contradictoria: la escala "1B" del titulo y el "7B" de los metadatos del checkpoint no coinciden, lo que apunta a errores de etiquetado y dificulta trazabilidad de experimentos.
- Riesgo de alucinacion y sesgos: no evaluables con la informacion disponible; al derivar de FineWeb, cabria esperar los sesgos tipicos de datos web, pero no hay auditoria publicada.
- Sin validacion externa: cero descargas y cero "likes" en el momento de la ficha; no hay informes independientes ni tests de terceros.
- Rendimiento en produccion: no hay mediciones de latencia ni de throughput, ni soporte confirmado en motores de inferencia habituales.

## Enlaces

- Hugging Face: https://huggingface.co/guan-wang/ESM-FineWeb-1B
- Repositorio OpenESM (mantenedor del codigo): https://github.com/datamllab/openesm
- Los resultados de busqueda web no devolvieron informacion relevante sobre el modelo; todas las referencias al termino "guan" correspondian a la Wikipedia en ingles y frances, un restaurante en Montreal y definiciones de diccionario, sin relacion con el modelo.
