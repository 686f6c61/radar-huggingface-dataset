# Nebulixlabs/Quantum-Classifier-Calibrated

## Resumen

Quantum-Classifier-Calibrated es un clasificador de texto de muy pequeno tamano (1.000.000 de parametros) publicado por Nebulixlabs en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo base Nebulixlabs/Quantum-Classifier, orientado a una tarea de clasificacion binaria con dos etiquetas: `0 = safe` y `1 = unsafe`. Su proposito declarado es la deteccion de contenido no seguro y de spam, ya que se entreno sobre los conjuntos Nebulixlabs/safety-dataset y KimDongH/spam_dataset-train-eval-test2.

Tecnicamente es un transformer tipo encoder de 4 capas, con tamano oculto de 112, 7 cabezas de atencion, FFN de 336 unidades y una cabeza clasificadora con capa oculta de 170. Su vocabulario es de 4096 tokens y su longitud de contexto es de solo 128 tokens, lo que lo situa en la categoria de modelos ultra-ligeros para clasificacion de secuencias cortas, no para generacion de texto.

La relevancia de este modelo reside en su calibracion de temperatura (1,479935, ajustada sobre datos de validacion), un detalle poco habitual en clasificadores de este tamano y que apunta a un uso en produccion donde se necesiten probabilidades fiables y no solo decisiones binarias. El repositorio no incluye pipeline declarado, metadatos de idioma completos ni licencia, por lo que su adopcion requiere verificar estos extremos con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabeza clasificadora (4 capas, 7 cabezas de atencion) |
| Parametros totales | 1.000.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no declarados en metadatos; pruebas de humo multilingues en ingles, hindi y hinglish |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 4 capas con tamano oculto 112 y 7 cabezas de atencion, lo que arroja una dimension de cabeza de 16. La red feed-forward tiene 336 unidades y el vocabulario es de 4096 tokens. Sobre la representacion del encoder se anade una cabeza de clasificacion con capa oculta de 170 neuronas que produce la decision binaria `safe`/`unsafe`. Con 128 tokens de contexto, el modelo esta disenado para clasificar fragmentos cortos (mensajes, lineas de texto, asuntos de correo), no documentos largos.

El ajuste fino partio del checkpoint Nebulixlabs/Quantum-Classifier y se realizo durante 9 epocas con batch size de 128, alcanzando 30.010.756 tokens efectivos frente a un objetivo de 30.000.000. Los datos de entrenamiento proceden de dos fuentes: Nebulixlabs/safety-dataset, orientado a seguridad de contenido, y KimDongH/spam_dataset-train-eval-test2, orientado a deteccion de spam. La model card indica que el split de test reservado se evalua unicamente despues del fine-tuning, pero no publica cifras. Como innovacion destacable, el autor aplica calibracion de temperatura (valor 1,479935) sobre el conjunto de validacion, lo que ajusta la confianza de las probabilidades de salida.

## Capacidades

- Clasificacion binaria de texto con dos categorias fijas: `0 = safe` y `1 = unsafe`.
- Deteccion de spam y de contenido no seguro, segun los dos datasets de ajuste fino.
- Salida de probabilidades calibradas mediante temperature scaling, apta para umbrales de decision personalizados.
- Procesamiento de secuencias de hasta 128 tokens.
- Pruebas de humo multilingues declaradas en ingles, hindi y hinglish (sin metricas publicadas).
- No soporta generacion de texto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica a este tipo de modelo.
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Moderacion de comentarios en tiempo real: el modelo clasifica mensajes cortos como seguros o no seguros con una latencia muy baja gracias a su tamano de 1M de parametros, lo que permite desplegarlo en el propio servidor de aplicacion sin GPU.
- Filtrado de spam en formularios y APIs publicas: dado su ajuste sobre un dataset de spam, puede actuar como primera barrera que descarta envios maliciosos antes de llegar a un sistema mas costoso.
- Pre-filtro en pipelines de moderacion por capas: al ser tan ligero, puede ejecutarse sobre cada mensaje entrante y derivar solo los casos dudosos (probabilidad intermedia) a un modelo mayor o a revision humana.
- Enrutado de tickets de soporte: la clasificacion safe/unsafe permite etiquetar automaticamente conversaciones que requieren tratamiento especial (abuso, amenazas) y separarlas del flujo normal.
- Analisis de riesgo en plataformas de mensajeria con contexto corto: con 128 tokens encaja bien en la evaluacion de mensajes individuales, lineas de chat o asuntos de correo.
- Sistemas con restricciones de recursos: su huella de memoria (del orden de pocos megabytes) lo hace apto para dispositivos embebidos, funciones edge o entornos serverless donde no hay GPU disponible.
- Anotacion asistida de datasets: las probabilidades calibradas permiten priorizar muestras para etiquetado humano segun el nivel de confianza del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el split de test reservado se evalua tras el fine-tuning, pero no incluye cifras de exactitud, precision, recall, F1 ni comparaciones con otros modelos.

| Benchmark | Resultado |
|---|---|
| Exactitud / F1 en test | no disponible |
| Evaluacion multilingue (ingles, hindi, hinglish) | no disponible (solo se mencionan pruebas de humo) |
| Comparacion con modelos de referencia | no disponible |

## Requisitos de hardware

- VRAM estimada: en fp32, aproximadamente 4 MB de pesos; en fp16, alrededor de 2 MB; en int8, cerca de 1 MB. La memoria real dependera del framework y del batch.
- GPU: no requiere GPU. Puede ejecutarse en CPU de forma eficiente.
- GPU consumer: cabe en cualquier GPU consumer, incluso en las mas antiguas y de gama baja, dado su tamano.
- CPU: es el entorno natural de despliegue; un solo nucleo moderno es suficiente para inferencia por lotes moderados.
- Opciones de despliegue: la via mas directa es la libreria `transformers` con la tarea de clasificacion de texto; tambien es apto para exportacion a ONNX Runtime, para TorchScript o para integrarse dentro de un servicio Python propio. vLLM, TGI o llama.cpp estan orientados a modelos generativos y no son la via habitual para un clasificador de este tipo.
- Latencia y throughput: no disponibles. Dado el tamano, se espera una latencia del orden de milisegundos en CPU, aunque el autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales publicas de clasificadores habituales. Los valores de terceros se incluyen como referencia general y no proceden de la model card.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quantum-Classifier-Calibrated | 1.000.000 | 128 tokens | Clasificacion safe/unsafe | no disponible | HuggingFace (Nebulixlabs) |
| Clasificadores basados en DistilBERT (p. ej. variantes de toxicidad) | aprox. 66.000.000 | 512 tokens | Clasificacion de toxicidad | habitualmente Apache 2.0 o similar | HuggingFace |
| Clasificadores basados en XLM-R base (p. ej. variantes multilingues de toxicidad) | aprox. 278.000.000 | 512 tokens | Clasificacion multilingue | habitualmente MIT o Apache 2.0 | HuggingFace |

La comparacion directa de calidad no es posible sin resultados de evaluacion publicados por el autor.

## Limitaciones y advertencias

- Contexto muy limitado: 128 tokens. Los textos mas largos deben truncarse o dividirse, con la consiguiente perdida de informacion.
- Tamano minimo: 1M de parametros y vocabulario de 4096 tokens implican una capacidad de representacion reducida en comparacion con clasificadores tipo BERT; cabe esperar menor robustez ante vocabulario fuera de dominio.
- Sin licencia declarada: no se especifican condiciones de uso comercial, por lo que es necesario contactar con el autor antes de integrarlo en produccion.
- Sin metricas publicadas: no hay exactitud, precision, recall ni F1 en el split de test, lo que impide estimar el riesgo real de falsos positivos y falsos negativos.
- Cobertura idiomatica incierta: la model card solo menciona pruebas de humo en ingles, hindi y hinglish; el comportamiento en castellano no esta documentado.
- Sesgos desconocidos: no se documenta la composicion de los datasets de entrenamiento mas alla de sus nombres, por lo que no puede evaluarse el sesgo demografico, tematico o linguistico.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con confianza alta, especialmente en dominios alejados del entrenamiento.
- Repositorio sin descargas ni interacciones: el modelo no tiene uso comunitario registrado, lo que reduce la validacion externa y el soporte disponible.
- Proceso de calibracion no reproducible con la informacion dada: se indica el valor de temperatura (1,479935) pero no el procedimiento ni el conjunto exacto empleado.
- Idoneidad limitada a clasificacion: no debe emplearse para generacion, resumen, traduccion ni tareas conversacionales.

## Enlaces

- HuggingFace: https://huggingface.co/Nebulixlabs/Quantum-Classifier-Calibrated
- Modelo base: no disponible como enlace directo, referenciado como Nebulixlabs/Quantum-Classifier
- Dataset de seguridad: no disponible como enlace directo, referenciado como Nebulixlabs/safety-dataset
- Dataset de spam: no disponible como enlace directo, referenciado como KimDongH/spam_dataset-train-eval-test2
- Paper: no disponible
- Blog o demo: no disponible
- Repositorio de codigo: no disponible
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo (corresponden a contenidos no relacionados).
