# cyttic/trocr-small-BY5-stage1-gated

## Resumen

trocr-small-BY5-stage1-gated es un checkpoint de reconocimiento optico de caracteres (OCR) publicado por el usuario cyttic en HuggingFace. Se trata de un ajuste fino (fine-tuning) de una sola epoca sobre el modelo base cyttic/trocr-hebrew-small-untrained, que a su vez pertenece a la familia TrOCR de Microsoft, una arquitectura vision-encoder-decoder disenada para convertir imagenes de texto en secuencias de caracteres. El modelo tiene 235.097.600 parametros y se distribuye en formato safetensors (repositorio de 0,9 GB, consistente con pesos en fp32), con la etiqueta de pipeline image-text-to-text.

El problema que aborda es el OCR, presumiblemente orientado a texto en hebreo dado el nombre del modelo base. Su relevancia actual es limitada: el autor no ha publicado model card descriptiva, no declara licencia ni idiomas soportados, y las metricas de validacion reportadas (CER 0,7775 y WER 1,0977) indican que el modelo no es funcional para reconocimiento real. Un WER superior a 1 implica que el numero de errores supera la longitud de la referencia, es decir, un resultado peor que no generar nada.

Por tanto, esta ficha debe leerse como documentacion de un artefacto experimental (checkpoint intermedio de "stage 1", con repositorio marcado como gated) y no como un modelo listo para produccion. Cualquier uso practico exige validacion previa, reentrenamiento o al menos un ajuste fino adicional con datos supervisados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-encoder-decoder (familia TrOCR: encoder de vision + decoder de texto autorregresivo) |
| Parametros totales | 235.097.600 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio solo con safetensors; no se publican GGUF ni cuantizaciones int8/int4) |
| Idiomas soportados | no disponible (el modelo base se denomina "hebrew", lo que sugiere hebreo, sin confirmacion) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | cyttic/trocr-hebrew-small-untrained |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 0,9 GB |
| Fecha de publicacion declarada | 2026-09-19 |
| Acceso | repositorio gated (requiere solicitud/aceptacion) |

## Arquitectura y entrenamiento

La etiqueta del repositorio (vision-encoder-decoder) situa al modelo en la familia TrOCR: un encoder de vision tipo ViT/DeiT que procesa la imagen por parches y un decoder de texto autorregresivo tipo RoBERTa que genera la transcripcion token a token. La model card no detalla la configuracion concreta (numero de capas, dimension oculta, resolucion de entrada ni longitud maxima de secuencia objetivo), por lo que esos valores quedan como no disponibles. Tampoco se especifica si el encoder y el decoder se inicializaron desde pesos preentrenados o desde cero, mas alla de que el punto de partida fue cyttic/trocr-hebrew-small-untrained.

El entrenamiento se realizo con el Trainer de transformers: learning rate 5e-05, batch de entrenamiento 8, acumulacion de gradiente 2 (lote efectivo 16), semilla 42, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 1.550 pasos de calentamiento, una unica epoca y precision mixta nativa (AMP). El registro llega hasta el paso 15.500, lo que equivale a unas 248.000 muestras por epoca (15.500 pasos x lote efectivo 16). El dataset se describe como "unknown dataset", sin informacion sobre composicion, idioma, tipografia ni procedencia de las imagenes. No se menciona RLHF, DPO ni ninguna tecnica de alineacion, algo esperable en un modelo de OCR. No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Reconocimiento optico de caracteres: transcripcion de imagenes de texto a secuencia de caracteres (tarea image-text-to-text).
- Orientacion prevista a escritura hebrea, inferida del nombre del modelo base; no confirmada por el autor.
- Capacidad teorica de reconocer texto impreso y manuscrito, segun el diseno generico de la familia TrOCR; sin evidencia empirica en este checkpoint.
- Fine-tuning adicional: al ser un checkpoint completo de transformers, puede servir como punto de partida para un "stage 2" con datos supervisados.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje conversacional).
- Uso como agente o razonamiento multi-paso: no soportado.
- Capacidades multilingues: no acreditadas; el unico indicio es el nombre del modelo base ("hebrew").
- Capacidades especiales (modo thinking, vision, audio): solo vision de entrada y texto de salida; no hay modo de razonamiento ni audio.
- Rendimiento medido: CER 0,7775 y WER 1,0977 en el conjunto de evaluacion, valores que en la practica invalidan el uso directo del modelo.

## Casos de uso

- Digitalizacion de archivos y documentos en hebreo: el modelo se usaria como motor OCR sobre imagenes escaneadas para extraer texto indexable. Es el escenario natural de la familia TrOCR y del modelo base, pero con el CER medido (77,75%) requiere reentrenamiento o sustitucion antes de cualquier despliegue real.
- Pre-anotacion de corpus OCR (pseudo-etiquetado): generar transcripciones automaticas que despues se corrigen manualmente para construir un dataset mayor. El ahorro de tiempo solo seria significativo si el CER bajase de forma sustancial; con los valores actuales el coste de correccion supera al de anotar desde cero.
- Continuacion del entrenamiento (stage 2): partir de este checkpoint gated y ajustarlo con datos etiquetados propios, ya que la infraestructura de transformers y el formato safetensors permiten reanudar el fine-tuning sin conversion previa.
- Extraccion de texto en pipelines embebidos de bajo coste: con 235 M de parametros y aproximadamente 0,47 GB en fp16, el modelo cabe en CPU y en GPUs de gama baja, lo que permitiria ejecutar OCR en el borde (edge) sin depender de APIs externas, siempre que se reentrene.
- Investigacion y estudios de ablacion: util como linea base intermedia para comparar estrategias de preentrenamiento en OCR hebreo (por ejemplo, partir de un checkpoint "untrained" frente a uno preentrenado multilingue).
- Procesamiento de formularios y documentos administrativos: extraccion de campos de texto manuscrito o impreso en entornos con requisitos de residencia de datos, aprovechando que el modelo puede ejecutarse localmente sin enviar imagenes a terceros.
- Auditoria de checkpoints y trazabilidad: el repositorio esta marcado como gated, lo que permite controlar quien accede a un artefacto experimental y mantener un registro de versiones dentro de un flujo de trabajo interno de investigacion.

## Benchmarks y rendimiento

El model-index declarado por el autor no contiene resultados ("results": []). Los unicos datos disponibles son las metricas de evaluacion registradas durante el entrenamiento:

| Metrica | Valor (ultima evaluacion, paso 15.500) |
|---|---|
| Loss de validacion | 5,7855 |
| CER (Character Error Rate) | 0,7775 |
| WER (Word Error Rate) | 1,0977 |

Evolucion a lo largo del entrenamiento:

| Training loss | Epoca | Paso | Validation loss | CER | WER |
|---|---|---|---|---|---|
| 12,8026 | 0,1290 | 2000 | 6,2859 | 0,7837 | 1,1767 |
| 12,1792 | 0,2581 | 4000 | 6,1312 | 0,7913 | 1,1814 |
| 12,3058 | 0,3871 | 6000 | 6,0150 | 0,7718 | 1,0778 |
| 11,9757 | 0,5161 | 8000 | 5,9437 | 0,7713 | 1,0319 |
| 11,7440 | 0,6452 | 10000 | 5,8879 | 0,7949 | 1,1117 |
| 11,8889 | 0,7742 | 12000 | 5,8378 | 0,7938 | 1,0813 |
| 11,8496 | 0,9032 | 14000 | 5,7980 | 0,7973 | 1,1320 |
| 11,5208 | 1,0000 | 15500 | 5,7855 | 0,7775 | 1,0977 |

Interpretacion: el CER se mantiene en torno al 77-80% durante todo el entrenamiento, sin mejora apreciable, y el WER nunca baja de 1,03. Esto indica que el modelo produce aproximadamente un error por cada palabra de referencia y que, en la practica, no ha aprendido a transcribir. No hay comparacion con modelos similares dentro de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: unos 0,94 GB en fp32, 0,47 GB en fp16/bf16, 0,24 GB en int8 y 0,12 GB en int4 (estimaciones derivadas de los 235 M de parametros; no confirmadas por el autor).
- Almacenamiento: 0,9 GB para el repositorio tal como se distribuye.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16 (GTX 1650, RTX 3050, T4, RTX 4090, A100, H100). No requiere aceleradores de gama alta.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida.
- CPU: la inferencia en CPU es viable dado el tamano (235 M de parametros), aunque no se publican cifras de latencia.
- Opciones de despliegue: pipeline image-to-text de transformers, PyTorch nativo, ONNX Runtime y TGI (soporta image-text-to-text). llama.cpp y Ollama no son aplicables porque no existe conversion a GGUF ni soporte de esta arquitectura. El soporte en vLLM para arquitecturas vision-encoder-decoder es limitado y no esta confirmado para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / tarea | Licencia | Formato | Rendimiento declarado |
|---|---|---|---|---|---|---|
| cyttic/trocr-small-BY5-stage1-gated | 235 M | no disponible (base hebreo) | OCR image-text-to-text | no disponible | safetensors | CER 0,7775; WER 1,0977 |
| microsoft/trocr-base-printed | ~334 M | ingles | OCR de texto impreso | MIT | safetensors / PyTorch | no disponible en esta ficha |
| microsoft/trocr-base-handwritten | ~334 M | ingles | OCR de escritura manuscrita (IAM) | MIT | safetensors / PyTorch | no disponible en esta ficha |
| cyttic/trocr-hebrew-small-untrained | no disponible | no disponible (hebreo previsto) | OCR, punto de partida sin ajustar | no disponible | safetensors | no disponible |

No se han identificado en la informacion disponible modelos alternativos especificos de OCR en hebreo con los que comparar parametros, contexto o rendimiento. Como referencia no neuronal, Tesseract es el estandar abierto de OCR multilingue, aunque no es un modelo de la misma categoria (no se entrena por fine-tuning de transformers).

## Limitaciones y advertencias

- Rendimiento insuficiente: CER de 0,7775 y WER de 1,0977 implican que el modelo no transcribe correctamente. Cualquier uso en produccion sin reentrenamiento produciria resultados inutilizables.
- Sin licencia declarada: no se especifican condiciones de uso, lo que impide determinar si el uso comercial esta permitido. Se debe contactar con el autor antes de cualquier explotacion.
- Repositorio gated: el acceso requiere aceptar condiciones o solicitar permiso, lo que anade friccion a la reproducibilidad.
- Documentacion inexistente: la model card no describe usos previstos, datos de entrenamiento ni limitaciones; el dataset figura como "unknown dataset".
- Idiomas no confirmados: aunque el modelo base se denomina "hebrew", no hay confirmacion de que el checkpoint soporte hebreo ni de que no haya mezcla con otros idiomas.
- Entrenamiento minimo: una sola epoca, con curvas de validacion planas; el checkpoint parece un artefacto intermedio ("stage 1") mas que un modelo final.
- Sin datos de benchmarks: el model-index no contiene resultados y no hay comparaciones publicadas.
- Riesgo de alucinacion en OCR: como todo modelo autorregresivo, puede generar texto plausible que no aparece en la imagen (sustituciones, inserciones y omisiones), especialmente con tipografias, rotaciones o ruido no vistos en entrenamiento.
- Sesgos desconocidos: al no conocerse la composicion del dataset, no es posible evaluar sesgos por tipografia, calidad de escaneo, genero, origen del documento ni variante dialectal del hebreo.
- Cuantizacion no disponible: no hay versiones GGUF ni int8/int4 publicadas, lo que limita el despliegue en herramientas que dependen de esos formatos.
- Fecha de publicacion inusual: el repositorio declara 2026-09-19 como fecha de creacion, un dato que conviene verificar antes de citarlo.
- Vigilancia de deriva: cualquier pipeline que lo use debe monitorizar CER/WER con datos propios, porque las metricas del autor ya indican un fallo sistematico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/trocr-small-BY5-stage1-gated
- Modelo base: https://huggingface.co/cyttic/trocr-hebrew-small-untrained
- Perfil del autor: https://huggingface.co/cyttic

Nota: los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo (corresponden a paginas de ayuda de navegadores y servicios de correo), por lo que no se han podido enlazar papers, blogs ni repositorios adicionales. No se dispone de paper, demo ni repositorio de codigo asociados al checkpoint.
