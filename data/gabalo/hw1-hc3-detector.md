# Gabalo/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un modelo de clasificacion de texto publicado en Hugging Face por el usuario Gabalo. Se distribuye en formato safetensors bajo la libreria transformers y esta etiquetado con la arquitectura bert y el pipeline text-classification, lo que indica que se trata de un encoder transformer con una cabeza de clasificacion, no de un modelo generativo. Cuenta con 22.713.986 parametros reales, verificados en los pesos del repositorio, y un tamano de repo de aproximadamente 0,1 GB.

La relevancia del modelo es limitada por su estado de documentacion: la model card es la plantilla autogenerada de Hugging Face y no contiene ni una sola respuesta cumplimentada. No se declaran el desarrollador real, el idioma, la licencia, el conjunto de etiquetas, los datos de entrenamiento ni los resultados de evaluacion. El repositorio registra 0 descargas y 0 likes, y las fechas de creacion y actualizacion (25 de septiembre de 2026, con 7 segundos de diferencia entre ambas) apuntan a una subida automatica sin mantenimiento posterior.

En consecuencia, esta ficha recoge exclusivamente lo que puede verificarse (tamano, formato, arquitectura declarada por etiquetas, tarea) y marca como "no disponible" todo lo demas. Cualquier uso en produccion exige antes auditar los pesos y determinar la taxonomia de clases, que no se documenta en ningun sitio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (segun la etiqueta `bert` del repositorio); numero de capas, dimension oculta y cabezas de atencion no disponibles |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no hay GGUF, ONNX ni cuantizaciones de 8 o 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea declarada (pipeline) | text-classification |
| Libreria | transformers |
| Tamano del repositorio | 0,1 GB |
| Compatibilidad declarada | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La unica informacion sobre la arquitectura procede de las etiquetas del repositorio: `bert` y `text-classification`. Esto implica un encoder bidireccional con atencion completa y una cabeza de clasificacion sobre el token especial de agregacion, pero no se especifica el numero de capas, la dimension del modelo, el numero de cabezas, el vocabulario ni si se aplico alguna variante (ALBERT, DistilBERT, MiniLM u otra). El recuento de 22,7 millones de parametros es notablemente inferior al de BERT-base (110 millones) y ligeramente superior al de DistilBERT (66 millones), lo que situa al modelo en la franja de encoders compactos.

No hay informacion sobre el procedimiento de entrenamiento: se desconocen el numero de tokens, la composicion del corpus, el regimen de precision, la funcion de perdida, si hubo ajuste fino supervisado, aprendizaje por refuerzo o preferencias, y si el modelo parte de un checkpoint preentrenado publico o de un entrenamiento desde cero. Tampoco se documentan hiperparametros, hardware ni coste de computo. La unica referencia tecnica de la model card es la cita a Lacoste et al. (2019), que aparece en el bloque de impacto medioambiental de la plantilla autogenerada de Hugging Face y no constituye una publicacion asociada al modelo.

El nombre del repositorio (`hw1-hc3-detector`) sugiere un trabajo academico (posiblemente una primera practica de asignatura) orientado a deteccion o clasificacion con una taxonomia de etiquetas concreta, pero esta interpretacion es una hipotesis basada en el nombre y no esta confirmada por ninguna fuente.

## Capacidades

- Clasificacion de texto: el pipeline declarado es text-classification, por lo que el modelo devuelve una distribucion de probabilidad sobre un conjunto de etiquetas fijado durante el entrenamiento. La lista de etiquetas no esta documentada y debe inferirse inspeccionando `config.json` o ejecutando inferencia.
- Extraccion de representaciones: como encoder, sus estados ocultos pueden reutilizarse como embeddings de frase o de token, aunque no se ha entrenado ni evaluado explicitamente con objetivos de similitud semantica.
- Inferencia por lotes: al ser un encoder de 22,7 millones de parametros, admite lotes grandes con un coste de memoria bajo.
- Capacidades generativas: no. No es un modelo causal de lenguaje y no puede producir texto libre, codigo, matematicas ni resumenes generativos.
- Tool calling / function calling: no soportado, no es una capacidad propia de un encoder de clasificacion.
- Uso como agente o razonamiento multi-paso: no soportado.
- Multilingue: no disponible; no se declara cobertura de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible; las etiquetas no indican ninguna modalidad adicional.

## Casos de uso

Advertencia previa: al desconocerse la taxonomia de clases y el dominio de entrenamiento, los casos siguientes son aplicaciones genericas de un clasificador de texto compacto y solo son validos si la auditoria del modelo confirma que las etiquetas se corresponden con la tarea descrita.

- Moderacion de contenido en foros o comentarios: el modelo clasificaria cada mensaje en categorias de toxicidad o spam en una sola pasada de inferencia; su tamano permite ejecutarlo en CPU dentro del mismo servicio web que sirve la aplicacion, sin depender de una GPU.
- Enrutado de tickets de soporte: como primer clasificador de un pipeline de atencion al cliente, asignaria cada incidencia entrante a una cola (facturacion, incidencia tecnica, cancelacion) antes de que un modelo generativo mayor redacte la respuesta; la latencia de un encoder de 22,7 millones de parametros es compatible con enrutado en linea.
- Filtrado previo en pipelines de datos: usarlo para descartar o etiquetar documentos de un corpus antes de entrenar o indexar, ya que procesar millones de registros con un encoder pequeno es economicamente viable frente a usar un modelo de 7.000 millones de parametros.
- Analisis de sentimiento o intencion en encuestas: clasificacion de respuestas abiertas en categorias predefinidas para paneles de analitica, con ejecucion en lote nocturno sobre CPU.
- Deteccion de anomalias en logs o trazas: si el modelo fue entrenado para distinguir texto normal de texto anomalo, podria puntuar lineas de log y marcar patrones desconocidos para revision humana, integrándose en un sistema de alertas.
- Preetiquetado para anotacion humana: generar etiquetas automaticas sobre un corpus nuevo que despues se revisan y corrigen, reduciendo el coste de anotacion. Solo tiene sentido si la taxonomia del modelo coincide con la del nuevo corpus.
- Clasificacion de documentos legales o administrativos: separar contratos, facturas o resoluciones por tipo. Requiere verificar previamente el idioma de entrenamiento, que no esta declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada, no hay conjunto de validacion descrito y no existe ningun informe externo asociado al repositorio. Tampoco se conocen las metricas que serian pertinentes (exactitud, F1 macro, F1 por clase) porque se desconoce la taxonomia de clases y la distribucion del conjunto de prueba.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 91 MB solo para los pesos (22.713.986 parametros x 4 bytes), mas el pico de activaciones, que en secuencias cortas es despreciable.
- VRAM estimada en FP16 o BF16: aproximadamente 45 MB de pesos.
- VRAM estimada en INT8: aproximadamente 23 MB de pesos, si se aplica cuantizacion dinamica con PyTorch o se exporta a ONNX.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente. El modelo cabe sin problema en RTX 3060, RTX 4090, T4, A10, L4, A100 y H100, pero ninguna de estas aceleradoras es necesaria.
- Inferencia en CPU: perfectamente viable. Un encoder de este tamano procesa lotes de decenas de secuencias en tiempos del orden de milisegundos en un procesador moderno, aunque no se han publicado mediciones concretas para este checkpoint.
- Dispositivos de borde: por tamano de pesos, es desplegable en Raspberry Pi, moviles o navegador mediante ONNX Runtime o WebGPU, siempre que se exporte el modelo.
- Opciones de despliegue: pipeline de transformers, text-embeddings-inference (declarado compatible en las etiquetas), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), ONNX Runtime, TorchScript, Triton Inference Server o un servicio FastAPI propio.
- Opciones no aplicables: vLLM, llama.cpp y Ollama estan orientados a modelos generativos y no son la via natural para servir este clasificador, salvo que se convierta a un formato compatible con un proposito distinto.
- Latencia y throughput: no disponible. No hay ninguna medicion publicada por el autor.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo analizado, por lo que la comparacion se limita a caracteristicas objetivas de arquitectura y distribucion. Los valores de los modelos de referencia son datos publicos de sus respectivas fichas.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gabalo/hw1-hc3-detector | 22,7 M | no disponible | no disponible | safetensors | 0 descargas, 0 likes, sin documentacion |
| distilbert-base-uncased | 66 M | 512 tokens | Apache 2.0 | safetensors, PyTorch | Muy extendido, documentado y con versiones ajustadas para clasificacion |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | safetensors, PyTorch | Estandar de facto para clasificacion de texto en ingles |
| prajjwal1/bert-tiny | 4,4 M | 512 tokens | Apache 2.0 | PyTorch | Orientado a experimentacion y prototipado rapido |

Observacion tecnica: el recuento de 22.713.986 parametros coincide con la configuracion de 6 capas, dimension oculta 384 y 12 cabezas de atencion empleada por la familia MiniLM, pero esta coincidencia es una hipotesis no confirmada por el autor y no debe tomarse como un dato verificado. En cualquier caso, la diferencia practica frente a los modelos de referencia no es de rendimiento, sino de trazabilidad: los tres alternativos tienen licencia explicita, idioma declarado, model card completa y ecosistema de evaluaciones publicas; el modelo analizado no ofrece ninguna de estas garantias.

## Limitaciones y advertencias

- Documentacion inexistente: la model card es la plantilla autogenerada de Hugging Face con todos los campos marcados como "[More Information Needed]". No hay informacion sobre uso previsto, uso fuera de alcance, sesgos ni recomendaciones.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso de uso comercial. En ausencia de terminos explicitos, el uso en produccion o en productos de terceros es juridicamente arriesgado y debe aclararse con el autor.
- Taxonomia de clases desconocida: sin la lista de etiquetas no es posible interpretar la salida del modelo ni evaluar si es adecuado para una tarea concreta. Es el primer dato que hay que extraer de `config.json`.
- Idiomas no declarados: se desconoce si el modelo fue entrenado en castellano, en ingles o en otro idioma. Aplicarlo a un idioma distinto del de entrenamiento producira predicciones sin valor.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto libre. El riesgo equivalente es la clasificacion erronea con alta confianza, especialmente en dominios o registros alejados de los datos de entrenamiento.
- Sesgos: no documentados. Al desconocerse el corpus de entrenamiento, no puede descartarse sesgo de dominio, de genero, racial o de registro linguistico. Cualquier despliegue con impacto sobre personas exige una evaluacion de equidad propia.
- Sobreajuste probable: el nombre del repositorio sugiere un ejercicio academico, y el modelo podria estar ajustado sobre un conjunto de datos pequeno y muy especifico, con generalizacion limitada fuera de ese dominio.
- Ausencia de mantenimiento: 0 descargas, 0 likes y una unica actualizacion 7 segundos despues de la creacion indican que no hay soporte, correcciones ni mejoras posteriores.
- Sin garantias de reproducibilidad: no se documentan semillas, versiones de libreria ni hiperparametros, por lo que no es posible reproducir el entrenamiento.
- Advertencia de produccion: antes de usar el modelo en cualquier sistema real conviene validarlo sobre un conjunto de prueba propio, comprobar la estabilidad de las predicciones ante variaciones minimas de entrada y establecer un umbral de confianza con derivacion a revision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gabalo/hw1-hc3-detector
- Lacoste et al. (2019), cita incluida en la plantilla de la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental referenciada en la plantilla: https://mlco2.github.io/impact
- Paper del modelo: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Conjunto de datos de entrenamiento: no disponible
