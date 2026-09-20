# Remidesbois/Poneglyph-Classifier

## Resumen

Poneglyph-Classifier es un clasificador de imagenes desarrollado por el usuario Remidesbois y publicado en HuggingFace bajo licencia MIT. Su tarea es determinar el tipo de pagina de un tomo de manga: distingue entre `cover` (portadas de volumen, portadas interiores y paginas de titulo de capitulo), `story_page` (paginas narrativas de lectura), `annexe` (secciones SBS, galerias de fan art, notas del autor y paginas extra) y `summary` (indices y resumenes de volumen).

Tecnicamente es un MobileNetV3-Small, una red convolucional ligera de la familia MobileNetV3 pensada para inferencia en dispositivos con recursos limitados. Recibe tensores RGB de `[1, 3, 224, 224]` y devuelve `[1, 4]` logits con el orden de clases `['cover', 'story_page', 'annexe', 'summary']`. Se distribuye principalmente como modelo ONNX estatico en FP32, ejecutable tanto en backend con `onnxruntime` como directamente en navegador con `onnxruntime-web`, ademas de un checkpoint de PyTorch.

Su relevancia es acotada pero practica: automatiza una fase de preprocesado que hoy se hace de forma manual en proyectos de digitalizacion, OCR, traduccion automatica o catalogacion de manga. El autor reporta una exactitud del 99,49% sobre el tomo 7 de One Piece, usado como conjunto de test completamente apartado del entrenamiento. El repositorio no tiene descargas ni interacciones registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (CNN) |
| Parametros totales | no disponible (la variante Small de MobileNetV3 es una arquitectura ligera orientada a edge) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 224x224 px) |
| Tipos de cuantizacion | no disponible; el artefacto publicado es ONNX estatico en FP32 |
| Idiomas soportados | no aplica / no disponible (clasificacion de imagenes, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`page_type_classifier.onnx`, FP32) y checkpoint PyTorch (`final.pt`) |
| Entrada | `[1, 3, 224, 224]` RGB |
| Salida | `[1, 4]` logits; orden `['cover', 'story_page', 'annexe', 'summary']` |
| Preprocesado | resize del lado corto a 256, center crop 224x224, normalizacion ImageNet (mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]`) |
| Artefactos adicionales | `page_type_classifier.metadata.json` (contrato de preprocesado y clases), `metrics.json` (metricas de entrenamiento y evaluacion) |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un MobileNetV3-Small, una CNN con bloques de convolucion separable en profundidad, mecanismos de atencion tipo squeeze-and-excitation y funciones de activacion h-swish. Se ha ajustado para una tarea de clasificacion de 4 clases sobre imagenes de 224x224, y se exporta a ONNX en FP32 con entrada estatica, lo que permite ejecutarlo en CPU sin dependencias de GPU ni de frameworks de deep learning completos.

El conjunto de entrenamiento se extrajo directamente de volumenes CBZ autenticos de One Piece, tomos 1 a 6, y el tomo 7 se reservo integramente como test. El autor indica que el etiquetado fue validado al 100% por una persona. El total asciende a 1.415 paginas: 1.177 de tipo `story_page`, 169 de tipo `annexe`, 62 de tipo `cover` y 7 de tipo `summary`. No se documenta en la model card el numero de tokens ni de epocas, la composicion exacta del dataset mas alla de los tomos indicados, ni si se aplicaron tecnicas de aumento de datos, regularizacion, RLHF o DPO (no aplicables a este tipo de tarea). Tampoco se detalla el procedimiento de ajuste fino ni los hiperparametros.

## Capacidades

- Clasificacion de paginas de manga en cuatro categorias excluyentes: `cover`, `story_page`, `annexe` y `summary`.
- Distincion entre contenido narrativo, portadas y portadas interiores, paginas de titulo de capitulo, secciones SBS, galerias de fan art, notas del autor, paginas extra, indices y resumenes de volumen.
- Inferencia en CPU mediante `onnxruntime` con el proveedor `CPUExecutionProvider`.
- Ejecucion en navegador mediante `onnxruntime-web`, sin necesidad de backend.
- Exportacion a PyTorch para reajuste fino o integracion en pipelines existentes.
- Preprocesado autocontenido y documentado en un fichero de metadatos, lo que reduce el riesgo de desajustes entre entrenamiento e inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, vision general, audio ni modo de pensamiento. Es exclusivamente un clasificador de imagen de proposito acotado.

## Casos de uso

- Ingesta automatizada de bibliotecas de manga: al importar volumenes CBZ o CBZ escaneados, el clasificador etiqueta cada pagina para separar el contenido narrativo del paratexto, permitiendo generar indices y estructuras de navegacion sin intervencion manual.
- Limpieza de datasets para OCR y traduccion automatica: los pipelines de reconocimiento de texto y traduccion rinden mejor si se alimentan solo con paginas narrativas; descartar de forma automatica portadas, indices y anexos evita ruido y reduce coste de computo.
- Catalogacion y generacion de metadatos en plataformas de lectura digital: el tipo de pagina puede almacenarse como metadato por pagina y usarse para construir vistas de solo historia, saltar anexos o resaltar extras del autor.
- Preprocesado para deteccion de paneles y analisis de layout: los modelos de segmentacion de viñetas asumen paginas narrativas; este clasificador actua como filtro previo en la cadena.
- Digitalizacion y control de calidad de escaneos: al procesar un lote de escaneos, las paginas de tipo `cover` o `summary` detectadas en posiciones inesperadas pueden señalar errores de orden, paginas duplicadas o faltantes.
- Lectura asistida en navegador: gracias al artefacto ONNX y a `onnxruntime-web`, una aplicacion web puede clasificar paginas en el propio cliente sin enviar imagenes a un servidor, lo que simplifica el cumplimiento de privacidad y elimina coste de backend.
- Investigacion sobre clasificacion documental: sirve como linea base ligera y reproducible para experimentos de clasificacion de tipos de pagina en otros corpus, con un contrato de preprocesado y clases explicitamente documentado.

## Benchmarks y rendimiento

Evaluacion sobre el tomo 7 de One Piece (196 paginas), completamente apartado del entrenamiento:

| Metrica global | Valor |
|---|---|
| Exactitud (accuracy) | 99,49% (195/196) |
| Macro F1 | 0,9845 |
| Perdida de validacion | 0,0476 |

Metricas por clase:

| Clase | Soporte | Precision | Recall | F1 |
|---|---|---|---|---|
| `annexe` | 22 | 100,0% | 100,0% | 1,000 |
| `summary` | 1 | 100,0% | 100,0% | 1,000 |
| `story_page` | 164 | 99,39% | 100,0% | 0,997 |
| `cover` | 9 | 100,0% | 88,89% | 0,941 |

Matriz de confusion reportada por el autor:

```
               Predicted
               cover   story_page   annexe   summary
cover            8         1           0        0
story_page       0       164           0        0
annexe           0         0          22        0
summary          0         0           0        1
```

El unico error del conjunto de test es una pagina de portada clasificada como `story_page`. No se han publicado resultados comparativos con otros modelos ni benchmarks externos (ImageNet u otros) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo se distribuye como ONNX FP32 estatico y el ejemplo de uso oficial emplea `CPUExecutionProvider`, por lo que no requiere GPU.
- VRAM estimada para GPU: no disponible; al ser una red del orden de millones de parametros y con entrada fija de 224x224, la huella es muy reducida y cabe en cualquier GPU consumer con varios GB de memoria, incluidas integradas.
- GPUs recomendadas: no disponible en la informacion proporcionada. Por el perfil de la arquitectura no necesita A100 ni H100; una RTX 4090 o incluso una GPU integrada serian suficientes en caso de querer acelerar el proceso.
- Compatibilidad con GPU consumer: si, en la practica cualquier GPU consumer moderna o incluso CPU sola. No se especifica ningun requisito minimo.
- Opciones de despliegue: ONNX Runtime en backend (`onnxruntime`) y en navegador (`onnxruntime-web`). Los servidores de inferencia para modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama) no son aplicables a este modelo.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la informacion disponible. Como referencia cualitativa, la tarea podria abordarse con otras CNN de clasificacion de imagen (EfficientNet-B0, ResNet-50, MobileNetV3-Large) o con modelos de vision-lenguaje de uso general, pero no hay datos de rendimiento de esas alternativas sobre este corpus concreto.

| Modelo | Arquitectura | Parametros | Contexto/entrada | Licencia | Rendimiento en esta tarea |
|---|---|---|---|---|---|
| Poneglyph-Classifier | MobileNetV3-Small | no disponible | 224x224 RGB | MIT | 99,49% accuracy, macro F1 0,9845 (test tomo 7) |
| EfficientNet-B0 (ajustado) | CNN | no disponible | variable | variable | no disponible |
| ResNet-50 (ajustado) | CNN | no disponible | 224x224 | variable | no disponible |
| MobileNetV3-Large (ajustado) | CNN | no disponible | 224x224 | variable | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente con One Piece tomos 1 a 6. No hay evidencia de que generalice a otras series, otras editoriales, otras ediciones o a manga en otros idiomas.
- Vocabulario de clases fijo y cerrado: solo cuatro categorias. Cualquier pagina que no encaje (publicidad, paginas en blanco, galeradas) se forzara a una de las cuatro clases.
- Desbalanceo severo en el entrenamiento: 1.177 paginas de `story_page` frente a 7 de `summary`. Las metricas de clases minoritarias (`summary`, soporte 1; `cover`, soporte 9) tienen muy poca base estadistica y no deben interpretarse como robustas.
- Politica de muestreo en el test: solo una pagina de tipo `summary` y nueve de tipo `cover` en el conjunto de evaluacion, lo que limita la fiabilidad de las metricas por clase.
- Confusion documentada: el unico error del test es una portada clasificada como pagina de historia, lo que sugiere debilidad en la discriminacion de ciertas portadas o portadas interiores.
- Resolucion de entrada baja (224x224 tras resize y center crop): se pierde detalle fino de la pagina, lo que puede afectar a casos ambiguos.
- Sin OCR ni comprension de contenido: el modelo clasifica la pagina como imagen, no lee ni interpreta el texto.
- Riesgo de sesgo hacia el estilo grafico y el layout de la edicion concreta de One Piece empleada en el entrenamiento (formato de tankobon, maquetacion de la editorial). Un cambio de maquetacion o de proporcion de pagina puede degradar el rendimiento.
- No se documentan sesgos demograficos ni de contenido, pero al operar sobre texto e imagenes de manga puede heredar los sesgos presentes en el material original.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. No se indica ninguna restriccion adicional.
- Madurez del artefacto: repositorio sin descargas ni likes, tamano reportado de 0.0 GB y publicacion reciente. No hay evidencia de uso en produccion ni de validacion por terceros.
- Ausencia de informacion sobre el proceso de ajuste fino, hiperparametros y aumento de datos, lo que dificulta reproducir el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Remidesbois/Poneglyph-Classifier
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a sitios de cuestionarios de autoescuela (DRPCIV) en rumano y no guardan relacion con el modelo. No se dispone de paper, blog, repositorio adicional ni demo asociados.
