# DataForGood/biolit-species-identification

## Resumen

Biolit-species-identification es un paquete de modelos de visión por computador publicado por DataForGood (temporada 14 del proyecto Biolit) para identificar fauna y flora del litoral a partir de fotografías tomadas por observadores ciudadanos. No es un modelo generativo ni un LLM: es un pipeline en dos etapas que combina un detector YOLOv8s fine-tuneado con un clasificador taxonómico construido sobre características de imagen precalculadas con BioCLIP.

La primera etapa (`detection/`) localiza el espécimen principal de la foto y decide si es planta o animal, devolviendo un recorte que alimenta la segunda etapa. La segunda (`classification/`) recibe ese recorte y propone su posición en la taxonomía mediante clasificadores MLP por nivel taxonómico y prototipos por taxón. El detector se entrenó con aproximadamente 1.400 fotografías de Biolit anotadas a mano y se distribuye en ONNX (opset 18) para poder ejecutarse sin PyTorch ni Ultralytics.

Su relevancia práctica está en el despliegue ligero: el repositorio completo ocupa 0,2 GB, el detector exportado funciona con una entrada fija de 640x640 y el conjunto está pensado para integrarse en la aplicación de ciencia ciudadana de Biolit, donde el usuario fotografía un organismo y recibe una propuesta taxonómica. La model card está incompleta en la parte de clasificación y no publica métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector YOLOv8s (fine-tune) + clasificadores MLP por nivel taxonómico y modelos de prototipos sobre características BioCLIP |
| Parametros totales | no disponible (la model card no publica recuento de parámetros; el repo completo ocupa 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen RGB con letterbox de 640x640 (tensor `(1, 3, 640, 640)`, valores en `[0, 1]`) |
| Tipos de cuantizacion | no disponible; se distribuye ONNX opset 18 sin documentar variantes cuantizadas |
| Idiomas soportados | no disponible / no aplica (modelo de visión; las etiquetas de salida son taxones, no texto libre) |
| Licencia | apache-2.0 (según metadatos del repo) |
| Formato de pesos | ONNX (`model.onnx`, opset 18) y PyTorch (`model.pt`, Ultralytics 8.0.81); además `.pt` de MLP, `.npz` de prototipos y de features, y `.pkl` de correspondencia taxonómica |
| Pipeline declarado | object-detection (con clasificación de imagen en la segunda etapa) |
| Clases del detector | `0: plant`, `1: animal` |
| Salida del detector | `(1, 6, 8400)`: 4 coordenadas de caja + 2 puntuaciones para 8.400 cajas |
| Umbral de confianza | `conf = 0.4`; por debajo no se genera recorte y no se pasa a clasificación |
| Modelo base | Ultralytics/YOLOv8 (relación: finetune) |

## Arquitectura y entrenamiento

La etapa de detección es un YOLOv8s fine-tuneado sobre unas 1.400 fotos de Biolit anotadas manualmente. El modelo conserva una única detección por imagen (la de mayor confianza) y entrega el recorte de esa caja a la etapa siguiente; si la confianza es inferior a 0,4 no se produce recorte. La entrada es una imagen RGB con letterbox a 640x640 y la salida cruda es un tensor `(1, 6, 8400)`. El export a ONNX opset 18 se verificó contra el modelo PyTorch original: diferencias de hasta 0,001 px en las coordenadas de caja y de 0,000004 en las puntuaciones, lo que indica paridad numérica prácticamente exacta.

La etapa de clasificación no está documentada en la model card (la sección aparece marcada como "à compléter"). Por los ficheros publicados se deduce una arquitectura híbrida de dos vías: clasificadores MLP entrenados por nivel taxonómico (`mlp_model.pt`), prototipos por taxón (`proto_model.npz`) y un fichero de características de imagen precalculadas con BioCLIP (`bioclip_features.npz`), junto con una tabla de correspondencia clase-taxón (`tax_lookup.pkl`). No se especifican tokens de entrenamiento, composición del dataset, número de taxones ni si hubo ajuste fino del encoder visual; tampoco se detalla si se aplicó aumento de datos o balanceo de clases. Los entrenamientos anteriores se conservan en el tag `v0-avant-nettoyage`.

## Capacidades

- Detección de objetos en imágenes costeras con dos clases gruesas: planta o animal.
- Selección de un único objeto principal por imagen, descartando detecciones múltiples.
- Recorte automático del espécimen detectado como entrada de la etapa de clasificación.
- Clasificación taxonómica jerárquica del recorte mediante MLP por nivel taxonómico y prototipos por taxón.
- Representación visual basada en BioCLIP, un encoder vision-language entrenado sobre imágenes biológicas.
- Inferencia sin dependencias de PyTorch ni Ultralytics si se usa la ruta ONNX.
- Descarga independiente de cada etapa (`detection/` o `classification/`) para usar solo la parte necesaria.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni modo "thinking": es un modelo puramente visual de detección y clasificación.

## Casos de uso

- Aplicación de ciencia ciudadana de Biolit: el usuario fotografía un organismo del litoral y el pipeline devuelve la caja del espécimen principal y una propuesta taxonómica, que después puede validar un experto. La ventana de 640x640 y el umbral de 0,4 permiten filtrar fotos ambiguas antes de molestar a un taxónomo.
- Triaje y pre-etiquetado de datasets: usar el detector en modo ONNX para generar cajas planta/animal sobre lotes de fotos nuevas y acelerar el anotado manual, dado que el modelo se entrenó sobre el mismo dominio y estilo de imagen que produce la comunidad.
- Despliegue en el borde: al ser un YOLOv8s exportado a ONNX, cabe en dispositivos modestos y en CPU, lo que permite inferencia local en móvil o en una Raspberry Pi sin enviar las fotos a un servidor.
- Monitorización de zonas litorales protegidas: procesar series temporales de fotos trampa o transectos para contar presencia de organismos y detectar cambios, usando solo la etapa de detección si no se necesita la taxonomía fina.
- Enriquecimiento de bases de datos de biodiversidad: ejecutar la etapa de clasificación sobre recortes ya existentes para asignar una posición taxonómica preliminar y marcar discrepancias frente a la identificación humana registrada.
- Filtrado previo en plataformas de observación: descartar imágenes sin organismo detectable (confianza < 0,4) o separar plantas de animales antes de enrutar cada imagen a un clasificador especializado distinto.
- Herramienta educativa: mostrar en tiempo real la caja del organismo y su grupo taxonómico para explicar identificación de especies en talleres de campo, con la ventaja de que todo el pipeline corre offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, mAP, exactitud taxonómica ni matrices de confusión para ninguna de las dos etapas. El único dato cuantitativo de validación es la comprobación de paridad entre el export ONNX y el modelo PyTorch: diferencias máximas de 0,001 px en coordenadas de caja y 0,000004 en puntuaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tipo de modelo (detector YOLOv8s a 640x640 y clasificadores ligeros sobre features precalculadas) es razonable esperar un consumo por debajo de 1-2 GB en FP32, pero es una estimación, no un dato publicado.
- GPU recomendadas: no disponibles en la documentación. Cualquier GPU consumer reciente (RTX 3060 o superior) debería ser sobrada para la etapa de detección; para lotes grandes, una A100 o L4 permite procesar en paralelo con `batch > 1`.
- CPU: el export ONNX está pensado explícitamente para ejecutarse sin PyTorch ni Ultralytics, lo que hace viable la inferencia en CPU para volúmenes moderados.
- Consumer GPU: sí, previsiblemente cabe en cualquier GPU consumer e incluso en dispositivos de borde tipo Raspberry Pi, aunque no hay cifras publicadas de latencia.
- Opciones de despliegue: ONNX Runtime (ruta recomendada por el autor), PyTorch/Ultralytics 8.0.81 para la etapa de detección, y carga directa de `.pt`, `.npz` y `.pkl` para la etapa de clasificación. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DataForGood/biolit-species-identification | Detector YOLOv8s + clasificación taxonómica con features BioCLIP | no disponible | imagen 640x640 | apache-2.0 (metadatos) | HuggingFace, repo 0,2 GB |
| Ultralytics YOLOv8s (modelo base) | Detector genérico de objetos | no disponible en la informacion | imagen 640x640 | AGPL-3.0 en el proyecto Ultralytics (verificar antes de uso comercial) | Ultralytics / HuggingFace |
| BioCLIP | Encoder vision-language para imágenes biológicas | no disponible en la informacion | imagen + texto | no disponible en la informacion | Repositorio académico |
| Detectores genéricos tipo MegaDetector | Detección de fauna en fototrampeo | no disponible en la informacion | imagen | no disponible en la informacion | Repositorio abierto |

La comparación cuantitativa no es posible con la información disponible: no hay métricas publicadas de este modelo ni valores de referencia recogidos en la búsqueda. Cualitativamente, la diferencia frente a un YOLOv8s genérico es la especialización en dos clases del dominio litoral y la cadena de clasificación taxonómica; frente a BioCLIP puro, la ventaja es que aquí la localización previa evita que el clasificador se contamine con el fondo de la fotografía.

## Limitaciones y advertencias

- Model card incompleta: la sección de clasificación está marcada como pendiente, sin detalles de arquitectura, número de taxones, métricas ni datos de entrenamiento.
- Sin métricas publicadas: no hay mAP, exactitud taxonómica ni evaluación de errores, por lo que no se puede estimar la fiabilidad en producción.
- Dominio muy acotado: entrenado con unas 1.400 fotos de Biolit del litoral; es esperable una degradación notable fuera de ese estilo de imagen, iluminación o geografía.
- Solo dos clases en detección (`plant`, `animal`): no distingue especies en la etapa de detección y depende por completo de la clasificación posterior para la taxonomía.
- Una sola detección por imagen: si hay varios organismos, solo se procesa el de mayor confianza, lo que puede descartar el espécimen de interés.
- Umbral fijo de 0,4: no se documenta calibración ni curvas precisión-exhaustividad; en fotos con organismos pequeños o poco contrastados es probable que no se genere recorte.
- Riesgo de identificación errónea con consecuencia directa en datos de ciencia ciudadana; conviene mantener validación humana o marcar las predicciones como sugerencias.
- Idiomas: no aplica a texto, pero las etiquetas y la tabla de correspondencia taxonómica están en el formato del proyecto Biolit; no se documenta su cobertura ni nomenclatura.
- Licencia: los metadatos declaran apache-2.0, pero el modelo deriva de Ultralytics YOLOv8, cuyo ecosistema se distribuye bajo AGPL-3.0. Antes de un uso comercial conviene verificar la compatibilidad de la licencia del modelo base, ya que la declaración del repo puede no cubrir todos los derechos sobre los pesos derivados.
- Nombres de repositorio inconsistentes: el ID es `DataForGood/biolit-species-identification`, mientras que la model card usa `DataForGood/yolov8_biolit_crop` en los comandos de descarga; hay que comprobar cuál es la ruta válida.
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso en producción ni de mantenimiento por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/DataForGood/biolit-species-identification
- Proyecto Biolit: https://www.biolit.fr
- Tag con entrenamientos anteriores: https://huggingface.co/DataForGood/yolov8_biolit_crop/tree/v0-avant-nettoyage
- Modelo base Ultralytics YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
- DataForGood: https://huggingface.co/DataForGood
- Paper, blog o demo adicionales: no disponible (la búsqueda web no devolvió resultados relevantes sobre el modelo)
