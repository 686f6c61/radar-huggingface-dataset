# sohaila-12345/plant-disease-vit

## Resumen

`sohaila-12345/plant-disease-vit` es un modelo de clasificacion de imagenes publicado en HuggingFace Hub por el usuario `sohaila-12345`. Por su identificador, su etiqueta `vit` y su pipeline `image-classification`, se trata de un Vision Transformer (ViT) orientado a la deteccion de enfermedades en plantas a partir de imagenes de hojas. El repositorio contiene pesos en formato safetensors con 85.827.878 parametros (aproximadamente 86 M), un tamano compatible con la variante ViT-Base, y ocupa 0,3 GB en el Hub.

El modelo es relevante en el contexto de la agricultura de precision y la diagnostica fitosanitaria asistida por IA, donde la clasificacion automatica de patologias foliares permite reducir el coste de inspeccion manual y acelerar la deteccion temprana. Sin embargo, la model card esta completamente sin completar: se genero automaticamente y todos los campos relevantes (procedencia, datos de entrenamiento, licencia, idiomas, metricas) figuran como `[More Information Needed]`. El repositorio no registra descargas ni likes, lo que sugiere un modelo experimental o de reciente publicacion sin validacion comunitaria.

La ficha que sigue se basa exclusivamente en los metadatos verificables del Hub (tags, tamano de pesos, pipeline, fecha) y en la arquitectura inferida a partir de ellos. Cualquier dato no confirmado se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), inferida de la tag `vit`; variante concreta no confirmada (por numero de parametros, compatible con ViT-Base) |
| Parametros totales | 85.827.878 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; resolucion de entrada no disponible) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni ONNX en el repo) |
| Idiomas soportados | no disponible (modelo de vision; las etiquetas de clase no estan documentadas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-classification |
| Tamano del repositorio | 0,3 GB |
| Compatibilidad endpoints | si (`endpoints_compatible`) |
| Region | us |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la etiqueta `vit` y el recuento de parametros (85,8 M). Esto es consistente con un Vision Transformer de tipo ViT-Base (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion, parche de 16x16), cuya cabeza de clasificacion se habria reajustado al numero de clases de enfermedades vegetales. No obstante, el repositorio no incluye `config.json` accesible en la informacion proporcionada, por lo que la configuracion exacta (tamano de parche, resolucion de entrada, numero de clases) no se puede confirmar.

No hay ningun dato sobre el dataset de entrenamiento, el numero de imagenes, la composicion de clases, el regimen de entrenamiento (full fine-tuning frente a linear probing), la resolucion de las imagenes ni si se aplicaron tecnicas de aumento de datos. Tampoco se documenta si el modelo parte de un checkpoint preentrenado en ImageNet-21k o si se entreno desde cero. La referencia `arxiv:1910.09700` que aparece en las tags corresponde al paper original de ViT (Dosovitskiy et al., 2020), no a un paper propio del modelo, y se usa habitualmente como cita de arquitectura.

## Capacidades

- Clasificacion de imagenes de hojas de plantas en categorias de enfermedad (numero y nombres de clases no disponibles).
- Inferencia via `transformers` con `pipeline("image-classification")` y compatibilidad con Inference Endpoints.
- Entrada de imagen unica; no se documenta soporte de multiples imagenes por peticion ni de video.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico (no aplica a un clasificador de vision).
- No se documenta capacidad multilingue ni generacion de texto: la salida esperada es un vector de logits sobre clases.
- No se documenta modo "thinking", vision-language, audio ni ninguna modalidad adicional.

## Casos de uso

- Diagnostico foliar en campo: el modelo clasifica una fotografia de hoja capturada con movil y devuelve la clase de patologia mas probable, lo que permite al agricultor priorizar la inspeccion presencial. Es adecuado por su tamano reducido (86 M de parametros) y su coste de inferencia bajo en CPU o GPU consumer.
- Pre-filtrado en plataformas de extension agraria: integrado en un servicio que recibe imagenes de usuarios y descarta las que no muestran signos de enfermedad, reduciendo la carga de los tecnicos que revisan manualmente.
- Control de calidad en invernadero: despliegue en dispositivos de borde (Raspberry Pi con acelerador Coral, Jetson Nano) para monitorizar cultivos de forma continua y alertar ante la aparicion de sintomas.
- Etiquetado asistido de datasets agricolas: usar las predicciones del modelo como pre-etiquetas para acelerar la anotacion humana de nuevas imagenes, con revision posterior.
- Investigacion en fitopatologia: como linea base para comparar con modelos mas grandes o con variantes especializadas en una misma taxonomia de enfermedades.
- Integracion en aplicaciones moviles offline: al pesar 0,3 GB y ser compatible con `transformers`, puede empaquetarse en una app que funcione sin conexion en explotaciones con cobertura limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion completada, no hay metricas de accuracy, F1 ni matriz de confusion, y el repositorio no registra descargas ni validacion externa.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB solo para pesos; con activaciones y batch pequeno, por debajo de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,17 GB para pesos; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100). Para lotes grandes, una RTX 4090 o A100 aporta margen de sobra.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos ocho anos, y tambien en CPU para inferencia por imagen individual (latencia del orden de decenas a cientos de milisegundos segun hardware).
- Opciones de despliegue: `transformers` (PyTorch), `optimum` para exportacion a ONNX, `torch.compile` para aceleracion, y despliegue gestionado via HuggingFace Inference Endpoints (el repo esta marcado como `endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sohaila-12345/plant-disease-vit` | 85,8 M | no disponible | Clasificacion de enfermedades de plantas | no disponible | HuggingFace Hub |
| ViT-Base (google/vit-base-patch16-224) | 86 M | 224x224 px | Clasificacion de imagenes generica (ImageNet) | Apache 2.0 | HuggingFace Hub |
| PlantVillage / modelos derivados | variable | variable | Clasificacion de enfermedades de plantas | variable segun autor | Multiples repositorios |
| ResNet-50 | 25,6 M | 224x224 px | Clasificacion de imagenes generica | BSD-3 | Amplia disponibilidad |

La comparativa con alternativas especificas de fitopatologia no puede completarse con datos verificables: no se dispone de metricas del modelo ni de una seleccion curada de modelos comparables en la informacion proporcionada. ViT-Base se incluye como referencia arquitectonica por el recuento de parametros, no como sustituto funcional.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos de entrenamiento, sesgos, dominio de aplicacion ni metricas, lo que impide evaluar su fiabilidad en produccion.
- Licencia no especificada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue.
- Riesgo de sobreajuste al dataset de origen: sin documentacion del dataset, es probable que el modelo generalice mal a condiciones de campo (iluminacion, fondo, especies no vistas).
- Numero y nombres de clases desconocidos: sin `config.json` ni `id2label` documentado, la interpretacion de las predicciones requiere inspeccion manual del checkpoint.
- Sin validacion externa: cero descargas y cero likes en el Hub; no hay evidencia de que el modelo haya sido evaluado por terceros.
- Riesgo de alucinacion en sentido estricto no aplica (es un clasificador), pero si de falsos positivos/negativos con consecuencias agronomicas; no debe usarse como unico criterio de decision fitosanitaria.
- Sin soporte documentado de cuantizacion ni formatos alternativos (GGUF, ONNX): el despliegue en entornos de borde requiere conversion manual.
- Fecha de creacion futura (2026-11-05) en los metadatos del Hub: conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sohaila-12345/plant-disease-vit
- Paper de referencia de la arquitectura ViT: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) sobre emisiones: https://arxiv.org/abs/1910.09700
