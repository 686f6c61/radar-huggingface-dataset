# rosadecsai/led-large-16384-BASE-Attention3ep-ASPRPreACE3ep

## Resumen

`rosadecsai/led-large-16384-BASE-Attention3ep-ASPRPreACE3ep` es un ajuste fino publicado por el usuario `rosadecsai` sobre su propio checkpoint `rosadecsai/led-large-16384-BASE-Attention3ep`. Se trata de un modelo de la familia LED (Longformer Encoder-Decoder) con 459.859.047 parametros (~460 M) y una ventana de contexto de 16.384 tokens, pensado para tareas de secuencia a secuencia sobre documentos largos, tipicamente resumen extractivo/abstractivo o generacion condicionada. La model card indica que se ha generado automaticamente con `Trainer` y que la metrica de evaluacion es ROUGE.

El interes del checkpoint es limitado y fundamentalmente documental: la propia model card reconoce que faltan las secciones de descripcion, usos previstos y datos de entrenamiento ("More information needed"), el dataset de ajuste aparece como `None` y no hay ningun resultado de benchmarks declarado en el `model-index`. Ademas, las metricas de evaluacion publicadas son degeneradas: ROUGE-1, ROUGE-2, ROUGE-L y ROUGE-Lsum son todas 0.0 y la longitud media generada (`Gen Len`) es 1.0 token, con una perdida de validacion que se mantiene practicamente plana en torno a 2,07 a lo largo de las tres epocas.

Por tanto, no es un modelo listo para produccion ni un checkpoint validado por la comunidad (110 descargas y 0 likes en el momento de redactar esta ficha). Su utilidad real es como artefacto de investigacion: reproducir y auditar el pipeline de ajuste fino empleado, comparar la variante de atencion del modelo base frente a alternativas y servir de punto de partida para reentrenamientos con datos y configuracion corregidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con atencion dispersa (LED, Longformer Encoder-Decoder) |
| Parametros totales | 459.859.047 (~460 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens (segun el nombre del checkpoint y del modelo base) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (el repositorio incluye ademas logs de tensorboard) |
| Modelo base | rosadecsai/led-large-16384-BASE-Attention3ep |
| Dataset de ajuste fino | no disponible (la model card indica "None dataset") |
| Metrica declarada | rouge |
| Tamano del repositorio | 25,8 GB |
| Libreria | transformers |
| Version de transformers | 4.48.3 |
| Version de PyTorch | 2.11.0+cu128 |
| Version de datasets | 4.8.5 |
| Version de tokenizers | 0.21.4 |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

La arquitectura LED combina un encoder tipo Longformer, que sustituye la atencion densa por una atencion de ventana local combinada con tokens globales seleccionados, con un decoder autoregresivo estilo BART que aplica atencion cruzada sobre las representaciones del encoder. Esa combinacion es la que permite procesar secuencias de hasta 16.384 tokens con un coste de atencion lineal respecto a la longitud, en lugar del coste cuadratico de un transformer estandar. La nomenclatura del checkpoint (`Attention3ep`, `ASPRPreACE3ep`) sugiere variantes internas del pipeline de ajuste del autor, pero la model card no documenta que significan, por lo que no se puede afirmar nada sobre ellas. Tampoco se detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO.

Los hiperparametros si estan publicados: 3 epocas, tasa de aprendizaje 5e-05 con scheduler lineal, optimizador AdamW (`betas=(0.9, 0.999)`, `epsilon=1e-08`), batch de entrenamiento y evaluacion de 8, acumulacion de gradiente de 2 pasos (batch total efectivo de 16), semilla 42 y entrenamiento con precision mixta nativa (AMP). El entrenamiento se detuvo en el step 3393. La evolucion de la perdida es: 2,253 en la epoca 1 (step 1132), 2,1871 en la epoca 2 (step 2264) y 2,1211 en la epoca 3 (step 3393), mientras que la perdida de validacion apenas se mueve (2,0764, 2,0546 y 2,0747). Todas las metricas ROUGE se mantienen en 0,0 y `Gen Len` en 1.0 en las tres evaluaciones, lo que apunta a una salida degenerada del decoder (emision de un unico token, probablemente el token de fin de secuencia) y no a un modelo que genere resumenes utilizables.

## Capacidades

- Generacion condicionada de texto en formato encoder-decoder: el modelo acepta una secuencia de entrada de hasta 16.384 tokens y produce una secuencia de salida.
- Procesamiento de documentos largos: es la capacidad estructural de la arquitectura LED, basada en atencion local con ventanas mas tokens globales.
- Resumen de documentos: es la tarea para la que se declara la metrica ROUGE, aunque los resultados publicados son 0,0 en todas las variantes.
- Tool calling / function calling: no disponible; no hay soporte declarado ni formato de plantilla de herramientas.
- Uso como agente o razonamiento multi-paso: no disponible; la arquitectura no esta disenada ni ajustada para ello.
- Modo "thinking": no disponible.
- Vision o audio: no disponible; el modelo es exclusivamente texto.
- Capacidades multilingues: no disponible; la model card no declara idiomas soportados ni existe evaluacion multilingue.
- Estado real de generacion: con `Gen Len` medio de 1.0 token, la generacion efectiva del checkpoint es practicamente nula, por lo que ninguna de las capacidades anteriores puede darse por operativa sin una verificacion previa.

## Casos de uso

- Auditoria y reproduccion del pipeline de ajuste: el checkpoint permite replicar la receta publicada (3 epocas, lr 5e-05, batch total 16, AMP, semilla 42) para localizar en que punto la decodificacion degenera a un solo token y corregir la configuracion.
- Comparacion de variantes de atencion: al existir un modelo base distinto (`led-large-16384-BASE-Attention3ep`), este checkpoint sirve para medir el efecto de la fase adicional de ajuste sobre la misma arquitectura LED de 16.384 tokens.
- Base para reentrenamiento con datos propios: partiendo de este checkpoint o del modelo base, se puede ajustar de nuevo con un dataset documentado y una metrica ROUGE funcional, algo habitual en resumen de informes largos.
- Resumen de documentacion tecnica o legal (previa reparacion y validacion): la ventana de 16.384 tokens permitiria condensar contratos, expedientes o articulos cientificos completos sin truncado agresivo, siempre que se reentrene y se evalue con ROUGE y verificacion humana.
- Docencia y formacion en atencion dispersa: el repositorio incluye pesos en safetensors y un modelo base de 460 M, un tamano manejable para estudiar en detalle como se comporta la atencion local mas global en un encoder-decoder.
- Prueba de humo (smoke test) de pipelines de evaluacion: por su salida degenerada, es un caso util para verificar que un pipeline de evaluacion detecta correctamente modelos rotos (ROUGE 0.0 y longitud generada de 1 token) antes de desplegarlos.
- Fine-tuning con `Trainer` como referencia de configuracion: los hiperparametros publicados sirven de plantilla de partida para experimentos de resumen con LED en entornos con una sola GPU y precision mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara el modelo pero con la lista de resultados vacia. Lo unico disponible son las metricas de entrenamiento y evaluacion registradas por el `Trainer`:

| Epoca | Step | Perdida de entrenamiento | Perdida de validacion | Rouge1 | Rouge2 | Rougel | Rougelsum | Gen Len |
|---|---|---|---|---|---|---|---|---|
| 1,0 | 1132 | 2,253 | 2,0764 | 0,0 | 0,0 | 0,0 | 0,0 | 1,0 |
| 2,0 | 2264 | 2,1871 | 2,0546 | 0,0 | 0,0 | 0,0 | 0,0 | 1,0 |
| 2,9978 | 3393 | 2,1211 | 2,0747 | 0,0 | 0,0 | 0,0 | 0,0 | 1,0 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y tampoco hay comparacion publicada con modelos similares por parte del autor.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): unos 1,8 GB en FP32, unos 0,92 GB en FP16/BF16 y unos 0,46 GB en int8 (valores teoricos calculados sobre 459.859.047 parametros).
- El cuello de botella real no son los pesos, sino las activaciones: procesar secuencias de 16.384 tokens en un encoder-decoder exige memoria adicional proporcional a la longitud y al tamano de batch. Con batch 1 y FP16, un documento completo de 16k tokens puede requerir del orden de 8-16 GB de VRAM en funcion de la implementacion; no hay mediciones publicadas para este checkpoint en concreto.
- GPU recomendadas para entrenamiento a 16.384 tokens: A100 40/80 GB o H100, con gradient checkpointing y batch reducido. El autor uso AMP y un batch efectivo de 16 con acumulacion de gradiente.
- Uso en GPU de consumo: los pesos caben sin problema en cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090). Para inferencia con documentos muy largos conviene usar 12-24 GB de VRAM; los 24 GB de una RTX 4090 permiten contexto completo con batch pequeno.
- Despliegue: al ser un modelo `transformers` con pesos en safetensors, la via directa es la libreria `transformers` sobre PyTorch. El repositorio esta etiquetado como `endpoints_compatible`, por lo que es desplegable en Hugging Face Inference Endpoints.
- vLLM, TGI, llama.cpp y Ollama: no hay soporte ni compatibilidad confirmada para este checkpoint en la informacion disponible. No se publican pesos en GGUF ni cuantizaciones de ningun tipo, por lo que el despliegue en llama.cpp u Ollama no es viable tal cual.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo, ni de tiempo de inferencia para documentos de 16.384 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| led-large-16384-BASE-Attention3ep-ASPRPreACE3ep (este) | 459.859.047 | 16.384 | Secuencia a secuencia / resumen | apache-2.0 | Hugging Face, pesos safetensors, sin cuantizaciones |
| LED-large-16384 (familia original de AllenAI) | ~460 M (aproximado) | 16.384 | Resumen de documentos largos | apache-2.0 | Hugging Face, ampliamente usado y validado |
| BART-large | ~406 M (aproximado) | 1.024 | Resumen y generacion condicionada | MIT | Hugging Face, muy extendido |
| BigBird-Pegasus-large | ~568 M (aproximado) | 4.096 | Resumen de documentos largos | apache-2.0 | Hugging Face |

Los datos de los modelos comparativos corresponden a valores aproximados de fuentes publicas; no se dispone de una comparacion de rendimiento publicada que enfrente este checkpoint con ellos. Cabe senalar que este checkpoint no supera a ninguno de los comparadores en las metricas disponibles: su ROUGE es 0,0 y su longitud generada es de 1 token, frente a modelos de la misma familia que si publican resultados utilizables en resumen de documentos largos.

## Limitaciones y advertencias

- Salida degenerada: ROUGE-1, ROUGE-2, ROUGE-L y ROUGE-Lsum son 0,0 y la longitud media generada es de 1 token en las tres evaluaciones. En la practica, el modelo no produce resumenes utilizables.
- Entrenamiento sin convergencia aparente: la perdida de validacion se mantiene entre 2,0546 y 2,0764 sin mejora relevante a lo largo de 3 epocas, con una perdida de entrenamiento que baja de 2,253 a 2,1211.
- Dataset de ajuste no documentado: la model card indica "None dataset", por lo que se desconoce la composicion, el idioma y el dominio de los datos de entrenamiento. Esto impide evaluar sesgos y riesgos de contaminacion.
- Documentacion incompleta: las secciones de descripcion del modelo, usos previstos y datos de entrenamiento estan sin rellenar ("More information needed").
- Idiomas no declarados: no hay lista de idiomas soportados ni evaluacion multilingue. El uso en castellano no esta validado y no puede asumirse un rendimiento aceptable.
- Riesgo de alucinacion: no evaluado. Al no existir generacion funcional, no hay datos de fidelidad factual ni de tasa de alucinacion.
- Sesgos conocidos: no disponible. No se ha publicado ningun analisis de sesgos ni de comportamiento diferencial por subgrupos.
- Limitaciones de contexto: aunque la arquitectura soporta 16.384 tokens, no hay pruebas publicadas de que este checkpoint mantenga calidad en entradas largas; su salida de un token hace inviable cualquier evaluacion de ese extremo.
- Licencia: apache-2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y la atribucion. Es la licencia mas permisiva del conjunto y no impone restricciones de uso comercial, a diferencia de licencias de comunidad.
- Caveat para produccion: no desplegar este checkpoint en un servicio real sin antes verificar la generacion con entradas propias. Su estado actual sugiere un fallo de configuracion o de datos durante el ajuste fino.
- Validacion por la comunidad nula: 110 descargas y 0 "likes" en el momento de redactar la ficha, sin issues ni discusiones publicas que avalen su funcionamiento.
- Trazabilidad: el nombre del checkpoint (`ASPRPreACE3ep`) no esta explicado en la model card, por lo que no se puede saber que fases adicionales de preentrenamiento o ajuste se aplicaron.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rosadecsai/led-large-16384-BASE-Attention3ep-ASPRPreACE3ep
- Modelo base declarado: https://huggingface.co/rosadecsai/led-large-16384-BASE-Attention3ep
- Familia LED original de AllenAI (referencia de la arquitectura): https://huggingface.co/allenai/led-large-16384
- Paper de Longformer y LED (Beltagy, Peters, Cohan, 2020): https://arxiv.org/abs/2004.05150
- Documentacion de LED en transformers: https://huggingface.co/docs/transformers/model_doc/led
- Busqueda web: los resultados devueltos no guardan ninguna relacion con este modelo, por lo que no se incluye ninguno.
