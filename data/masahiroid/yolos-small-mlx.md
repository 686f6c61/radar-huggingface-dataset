# masahiroid/yolos-small-mlx

## Resumen

yolos-small-mlx es una conversion no oficial a MLX del modelo hustvl/yolos-small, un detector de objetos basado en una arquitectura ViT practicamente sin modificaciones. Lo publica el usuario masahiroid y su objetivo es permitir la inferencia de YOLOS en Apple Silicon usando el framework MLX de Apple, en lugar de PyTorch. El modelo original fue desarrollado por el Huazhong University of Science and Technology junto con el equipo de HuggingFace, y entrenado sobre COCO.

Se trata de un modelo pequeno: 30.684.768 parametros (aproximadamente 30,7 M), almacenados en float16, con un repositorio de 0,1 GB. La entrada es una imagen RGB de 512x864 pixeles en formato NHWC y tamano fijo; la salida son 100 detecciones candidatas, cada una con 92 logits (91 clases de COCO mas la clase "sin objeto") y una caja en formato cxcywh normalizado entre 0 y 1.

Su relevancia es acotada pero concreta: es una de las pocas implementaciones de YOLOS en MLX, y el autor senala explicitamente que no funciona con mlx-vlm, sino que requiere el fichero yolos_mlx.py incluido en el repositorio, reescrito desde cero porque la combinacion de token CLS/de deteccion con position embeddings "mid" por capa no esta contemplada en las arquitecturas soportadas por mlx-vlm. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ViT (Vision Transformer) sin decoder, con tokens de deteccion aprendidos |
| Parametros totales | 30.684.768 (aproximadamente 30,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen fija de 512x864 pixeles) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en float16) |
| Idiomas soportados | en (segun los metadatos del repositorio; el modelo en si es un detector de imagenes) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de MLX) |

Otros datos relevantes: entrada 512x864 (alto x ancho), formato NHWC, tamano fijo; salida con 100 consultas de deteccion, 92 logits por consulta (COCO 91 clases + clase 91 "sin objeto") y cajas normalizadas cxcywh; libreria mlx; pipeline object-detection; modelo base hustvl/yolos-small; tamano del repositorio 0,1 GB.

## Arquitectura y entrenamiento

La arquitectura reproduce el diseno de YOLOS: un encoder ViT que procesa la imagen como una secuencia de parches a la que se anaden un token CLS y 100 tokens de deteccion aprendidos. No hay decoder tipo DETR; la salida del encoder correspondiente a los 100 tokens de deteccion finales se pasa directamente a las cabezas de clasificacion y de regresion de cajas. El autor describe la estructura como "relativamente simple" en comparacion con DETR. Un detalle de implementacion relevante es el uso de position embeddings "mid" por capa, ademas del token CLS y los tokens de deteccion, lo que obligo a reimplementar el modelo desde cero en MLX en lugar de reutilizar componentes existentes.

No se dispone de informacion sobre el proceso de entrenamiento del modelo original en la documentacion proporcionada: no se indican el numero de tokens de imagen, la composicion exacta del dataset mas alla de COCO, ni si hubo fases de ajuste tipo RLHF o DPO (poco habituales en deteccion de objetos). La innovacion tecnica de esta publicacion concreta no esta en el entrenamiento, sino en la conversion: implementacion en MLX con pesos en float16 y validacion numerica contra una referencia en PyTorch fp32. El autor declara el uso de la herramienta model-audit-lite para la auditoria de seguridad del repositorio.

## Capacidades

- Deteccion de objetos sobre imagenes RGB de 512x864 pixeles con tamano fijo.
- Clasificacion en 91 clases del dataset COCO mas una clase adicional "sin objeto" (indice 91).
- Prediccion de 100 cajas por imagen, en formato (center_x, center_y, width, height) normalizado entre 0 y 1.
- Inferencia en float16 sobre Apple Silicon mediante MLX.
- Preprocesado documentado: redimensionado a 512x864, normalizacion con medias [0.485, 0.456, 0.406] y desviaciones [0.229, 0.224, 0.225].
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues: es exclusivamente un modelo de vision para deteccion.
- No soporta vision-lenguaje ni entrada de prompts de texto.
- No es cargable directamente en mlx-vlm; requiere el modulo yolos_mlx.py del repositorio.

## Casos de uso

- Preprocesado de imagenes en aplicaciones de vision por computador sobre macOS: al ejecutarse en MLX, permite integrar deteccion de objetos en herramientas nativas de Apple Silicon sin depender de PyTorch ni de CUDA.
- Prototipado rapido de pipelines de deteccion: los 30,7 M de parametros y el repositorio de 0,1 GB permiten descargar y ejecutar el modelo en segundos, lo que facilita pruebas de concepto antes de escalar a detectores mayores.
- Anotacion asistida de datasets: generar cajas candidatas sobre imagenes para su revision manual antes de entrenar un detector especifico de dominio, aprovechando las 91 clases de COCO.
- Sistemas de clasificacion y localizacion en el borde (edge): el modelo cabe holgadamente en memoria unificada de equipos Apple, lo que permite desplegarlo en portatiles para tareas de reconocimiento de objetos en tiempo casi real.
- Analisis de imagenes en aplicaciones de escritorio para macOS: integracion directa en apps Swift/Python que ya utilicen MLX, evitando capas de compatibilidad con frameworks de GPU externos.
- Verificacion de conversiones de modelos: el repositorio sirve como referencia de como portar arquitecturas ViT con tokens de deteccion a MLX, util para equipos que necesiten reproducir el proceso con otros checkpoints de YOLOS.
- Filtrado y organizacion de fototecas: deteccion automatica de categorias presentes en imagenes para etiquetado y busqueda posterior, con 100 detecciones maximas por imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (COCO AP, mAP, etc.) en la informacion disponible. El unico dato de validacion aportado por el autor es una comparacion numerica contra una referencia en PyTorch fp32, realizada sobre una unica imagen de validacion de COCO y evaluando las 5 detecciones efectivamente producidas:

| Precision | Similitud coseno de logits | Similitud coseno de cajas | Tasa de coincidencia de etiquetas |
|---|---|---|---|
| MLX fp32 | 1,0 | 1,0 | 100 % |
| MLX fp16 (version publicada) | 1,0 | 1,0 | 100 % |

Esta tabla mide la fidelidad de la conversion, no la calidad del detector. No sustituye a una evaluacion sobre el conjunto de validacion completo de COCO y debe interpretarse con cautela por el tamano de la muestra (1 imagen, 5 detecciones).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 61 MB para los pesos en float16 (30,7 M de parametros x 2 bytes) y unos 123 MB si se cargan en float32. A esto hay que sumar las activaciones de una entrada de 512x864 pixeles, de tamano moderado.
- GPU compatibles: al estar implementado en MLX, el destino natural es la GPU integrada de los chips de Apple (series M1, M2, M3, M4 y posteriores) con memoria unificada. No hay soporte CUDA ni ROCm en esta publicacion.
- Cabe en GPU de consumo: si, en cualquier equipo Apple Silicon con memoria unificada de 8 GB o superior.
- Opciones de despliegue: MLX como unica via documentada, cargando model.safetensors y el modulo yolos_mlx.py. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de deteccion y no un modelo de lenguaje.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de imagenes por segundo.
- Restriccion importante: la entrada debe ser exactamente 512x864. El autor indica que las resoluciones distintas a la de entrenamiento no han sido verificadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales conocidas, no metricas de calidad:

| Modelo | Parametros | Tipo de arquitectura | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| masahiroid/yolos-small-mlx | 30,7 M | ViT con tokens de deteccion, sin decoder | 512x864 fija, NHWC | apache-2.0 | MLX, requiere yolos_mlx.py |
| hustvl/yolos-small (modelo base) | 30,7 M | ViT con tokens de deteccion, sin decoder | 800x1333 (resolucion de entrenamiento original) | apache-2.0 | PyTorch / transformers |
| Detectores tipo DETR | no disponible | CNN o ViT con encoder y decoder transformer | variable | variable | PyTorch, varios frameworks |

Las cifras de rendimiento (AP en COCO) de estos modelos no se han facilitado en la informacion disponible, por lo que no se incluyen comparaciones numericas.

## Limitaciones y advertencias

- Conversion no oficial: no es una publicacion de los autores originales de YOLOS y no ha sido validada por ellos.
- Validacion numerica muy limitada: la comparacion de fidelidad se hizo con una sola imagen de COCO y 5 detecciones, insuficiente para descartar discrepancias en otros escenarios.
- Incompatibilidad con mlx-vlm: requiere obligatoriamente el fichero yolos_mlx.py incluido en el repositorio; no se puede cargar con las utilidades estandar.
- Resolucion fija: solo acepta entradas de 512x864. Cualquier otro tamano no ha sido verificado y puede degradar los resultados.
- Riesgo de detecciones erroneas o incompletas inherente a un detector de 30,7 M de parametros entrenado sobre COCO, especialmente en dominios alejados del dataset de entrenamiento.
- Sesgos heredados del entrenamiento en COCO: categorias sobrerrepresentadas, cobertura limitada a 91 clases y posible peor rendimiento en contextos culturales o geograficos poco presentes en el dataset.
- Sin soporte de texto, agentes ni tool calling: el modelo no puede utilizarse para tareas de lenguaje.
- Idiomas: los metadatos declaran unicamente "en" para el campo de idioma; al ser un detector de imagenes, esta etiqueta es poco informativa.
- Estado de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin retroalimentacion de la comunidad.
- Licencia apache-2.0: permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y atribuir correctamente tanto al modelo original como a la conversion.
- El repositorio incluye un SECURITY.md y declara el uso de model-audit-lite para la auditoria, lo que no exime de revisar el codigo yolos_mlx.py antes de ejecutarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/yolos-small-mlx
- Modelo base: https://huggingface.co/hustvl/yolos-small
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- model-audit-lite (herramienta de auditoria citada por el autor): https://github.com/masahirocom/model-audit-lite
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las consultas devolvieron unicamente resultados sin relacion con el contenido tecnico solicitado.
