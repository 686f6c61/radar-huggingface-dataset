# BiernyVR/vr-guardian-segmentation

## Resumen

vr-guardian-segmentation es un modelo de segmentación semántica de imagen desarrollado por el usuario BiernyVR para detectar y aislar la rejilla de seguridad (Guardian Grid) que los cascos Meta Quest (Quest 2, Quest 3 y Quest Pro) superponen en pantalla cuando el usuario se acerca a los límites físicos de la sala. Esas líneas brillantes semitransparentes, con puntos intermitentes, arruinan las grabaciones de gameplay y de realidad mixta, y el modelo genera la máscara binaria necesaria para borrarlas después mediante técnicas de inpainting.

Técnicamente es una U-Net con backbone ResNet-34 que trabaja a resolución de 1024x1024 píxeles, entrenada con una pérdida combinada de BCEWithLogitsLoss y DiceLoss para conseguir precisión subpíxel en líneas finas vistas bajo ángulos de perspectiva agudos. El autor documenta que fue la tercera iteración de su pipeline, después de que un detector de cajas YOLOv8 recortara demasiado fondo y de que una segmentación por polígonos de instancia perdiera puntos y líneas discontinuas. El modelo se distribuye junto a su predecesor YOLOv8 de segmentación de instancias.

El repositorio es pequeño (unos 0,3 GB) y publica los pesos en dos formatos, ONNX (~97,7 MB) y checkpoint PyTorch (~97,9 MB), bajo licencia MIT. Se trata de un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, orientado a un caso de uso muy concreto de post-producción de vídeo VR en lugar de a tareas de visión general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-34 (segmentacion semantica); el repositorio incluye ademas un checkpoint YOLOv8 de segmentacion de instancias |
| Parametros totales | No disponible. El checkpoint PyTorch ocupa ~97,9 MB, lo que en FP32 corresponderia a un orden de magnitud de ~24-25 millones de parametros, pero el autor no publica la cifra |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). Entrada de imagen fija de 1024x1024 RGB |
| Tipos de cuantizacion | No disponible. Se distribuyen pesos en FP32; el autor no documenta variantes INT8, FP16 ni cuantizaciones para ONNX Runtime |
| Idiomas soportados | No aplica (modelo de vision); no disponible en la metadatos del repositorio |
| Licencia | MIT |
| Formato de pesos | ONNX (`vr_guardian_unet.onnx`, ~97,7 MB), PyTorch (`best_unet.pth`, ~97,9 MB) y PyTorch YOLOv8 (`yolo_guardian_grid_seg_best.pt`, ~54,8 MB) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net fully convolutional con backbone ResNet-34 y cabeza de segmentacion binaria: la salida son logits por pixel que se convierten en probabilidades mediante sigmoide y se binarizan con un umbral de 0,5. La entrada se normaliza con la media y desviacion estandar de ImageNet (0,485/0,456/0,406 y 0,229/0,224/0,225) y se redimensiona a 1024x1024; la mascara resultante se reescala al tamano original con interpolacion por vecino mas cercano para no introducir valores intermedios. La eleccion de 1024x1024 responde a la necesidad de capturar puntos intermitentes y lineas de un solo pixel de grosor bajo perspectivas muy oblicuas.

El autor indica que el entrenamiento uso una perdida combinada de BCEWithLogitsLoss mas DiceLoss, disenada para equilibrar la clasificacion pixel a pixel con el solapamiento global de una mascara muy desbalanceada (la rejilla ocupa una fraccion minima de la imagen). No se especifican en la informacion disponible el numero de imagenes de entrenamiento, la composicion del dataset, el numero de iteraciones, el optimizador ni si hubo fases de ajuste fino o de RLHF/DPO (esto ultimo no aplica a un modelo de vision). Tampoco se detalla el esquema de aumento de datos.

Como innovacion practica, la model card describe dos componentes que acompanan a la red. El primero es un post-procesado morfologico determinista en dos etapas: un cierre con kernel rectangular de 9x9 para unir puntos y lineas rotas, seguido de una dilatacion con kernel eliptico de 11x11 e tres iteraciones para absorber el halo optico (bloom) que generan las lentes y la pantalla del casco antes de entregar la mascara a un motor de inpainting como LaMa o ProPainter. El segundo es un mecanismo de "sparse skipping": una comprobacion logica (`np.any(raw_mask > 0)`) descarta los fotogramas sin rejilla, que segun el autor representan entre el 70% y el 90% del metraje, evitando pasar por el inpainting. El autor cifra la mejora en hasta 3x de velocidad de procesamiento total del video.

## Capacidades

- Segmentacion semantica binaria de la Guardian Grid de Meta Quest en fotogramas individuales a 1024x1024, con salida de logits y mascara binarizable por umbral.
- Deteccion de lineas finas continuas y de patrones de puntos intermitentes, incluidos casos con perspectiva aguda, que las aproximaciones por poligono no resolvian.
- Robustez declarada por el autor frente a distintos entornos de juego y condiciones de iluminacion, segun la model card.
- Salida directamente compatible con pipelines de inpainting de video (LaMa, ProPainter) al proporcionar mascara binaria.
- Post-procesado morfologico integrado en el script de inferencia para unir trazos discontinuos y cubrir el bloom optico.
- Filtro de fotogramas limpios para acelerar el procesado por lotes de video.
- Ejecucion sin PyTorch mediante ONNX Runtime, con proveedores de CPU y de GPU.
- No soporta tool calling ni function calling, no es un modelo de lenguaje, no tiene modo de razonamiento ni capacidades de audio, y no procesa video de forma nativa (trabaja fotograma a fotograma).

## Casos de uso

- Limpieza automatizada de grabaciones de gameplay en Meta Quest: el modelo genera la mascara de la rejilla y un inpainter rellena esas zonas, de modo que el creador obtiene un video sin las lineas azules, moradas o rojas que aparecen al acercarse a los limites de la sala.
- Post-produccion de video de realidad mixta: en capturas donde el mundo real y el virtual se mezclan, la rejilla se cuela en el encuadre; la mascara refinada con cierre y dilatacion evita que queden restos de halo tras el inpainting.
- Aceleracion de pipelines de edicion por lotes: gracias al filtro de fotogramas sin rejilla, en un metraje tipico solo entre el 10% y el 30% de los fotogramas pasa por el inpainting, lo que reduce el coste computacional del procesado completo.
- Generacion de datasets de vision para VR: el modelo puede usarse para etiquetar automaticamente mascaras de Guardian Grid en corpus grandes de video, utiles para entrenar o evaluar otros segmentadores o para estudiar la frecuencia de aparicion de la rejilla.
- Integracion como plugin o modulo en herramientas de edicion y composicion digital: al exportarse a ONNX, la inferencia puede embeberse en aplicaciones de escritorio con ONNX Runtime sin dependencia de PyTorch.
- Analitica de sesiones de VR: la deteccion de presencia y de area de rejilla por fotograma permite medir cuanto tiempo pasa el usuario cerca de los limites fisicos, informacion util para estudios de usabilidad y de seguridad en espacios reducidos.
- Preprocesado en tiempo casi real en el propio PC de captura: al ser un modelo de ~98 MB ejecutable en CPU, puede encolarse la segmentacion mientras se graba, sin depender de una GPU dedicada.
- Investigacion en segmentacion de estructuras delgadas y semitransparentes: el caso de la Guardian Grid es un buen banco de pruebas para comparar perdidas combinadas BCE+Dice frente a otras formulaciones en mascaras extremadamente desbalanceadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas con IoU, Dice, F1, precision, recall ni comparaciones cuantitativas frente a otros modelos. Las unicas cifras aportadas por el autor son cualitativas o de sistema:

| Afirmacion del autor | Dato | Naturaleza |
|---|---|---|
| Precision de segmentacion | "precision subpixel" en lineas finas y puntos | Cualitativa, sin metrica publicada |
| Aceleracion del pipeline de video | hasta 3x de velocidad total | Estimacion del autor, sin metodologia detallada |
| Proporcion de fotogramas con rejilla | 10%-30% del metraje | Observacion del autor sobre sus grabaciones |
| Frecuencia de inferencia | no disponible | No publicada |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada oficialmente. Los pesos ONNX ocupan unos 97,7 MB, por lo que el modelo cabe con holgura en cualquier GPU consumer moderna; el consumo real dependera del backend y de las activaciones a 1024x1024, pero no hay cifras confirmadas por el autor.
- GPU recomendadas: no se especifica ninguna. El modelo no necesita A100, H100 ni GPUs de centro de datos; funciona en cualquier GPU con soporte de ONNX Runtime CUDA o TensorRT.
- Ejecucion en CPU: el propio ejemplo oficial de la model card usa `CPUExecutionProvider` de ONNX Runtime, lo que indica que el autor lo considera viable sin GPU.
- Cabe en GPU consumer: si, y en la practica en cualquier GPU con unos pocos GB de memoria; no se han documentado requisitos minimos.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), PyTorch con el checkpoint `best_unet.pth`, y script CLI propio (`infer.py --image ...`). No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de vision y no de lenguaje. La salida se integra en motores de inpainting como LaMa o ProPainter.
- Latencia y throughput: no disponibles. El unico dato indirecto es la aceleracion de hasta 3x del pipeline completo atribuida al descarte de fotogramas sin rejilla.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vr-guardian-segmentation | Segmentacion semantica binaria de Guardian Grid | U-Net + ResNet-34 | No disponible (~98 MB de checkpoint) | Imagen 1024x1024 | MIT | HuggingFace, pesos ONNX y PyTorch |
| YOLOv8-seg (checkpoint incluido en el mismo repositorio, `yolo_guardian_grid_seg_best.pt`) | Segmentacion de instancias de la misma rejilla | YOLOv8 con cabeza de segmentacion | No disponible (checkpoint de ~54,8 MB) | No disponible | MIT (segun el repositorio) | Incluido en el mismo repositorio |
| Segment Anything (SAM) | Segmentacion general por prompts | Transformer ViT + prompt encoder | 91 M (ViT-B) a 636 M (ViT-H) en las variantes publicas | Imagen de alta resolucion con prompts | Apache 2.0 en las variantes publicas | Meta AI / HuggingFace |
| LaMa / ProPainter | Inpainting de video | No es un segmentador; se usa en la fase posterior | No disponible | No disponible | No disponible en la informacion proporcionada | Repositorios publicos de los autores |

La comparacion cuantitativa de rendimiento no es posible porque ninguno de los datos de IoU, Dice o F1 esta publicado en la informacion disponible. La diferencia funcional clave frente a SAM es que vr-guardian-segmentation es un modelo de clase unica, especializado y de menor tamano, mientras que SAM es un segmentador general que requiere prompts y no esta ajustado a la apariencia concreta de la rejilla de Meta Quest.

## Limitaciones y advertencias

- Modelo de un solo dominio: esta entrenado exclusivamente para la Guardian Grid de Meta Quest. No se ha documentado su comportamiento en otros cascos (Pico, HTC Vive, Valve Index) ni en otras rejillas de seguridad.
- Riesgo de alucinacion del inpainting posterior: el propio autor describe que las fases previas de su pipeline forzaban al inpainter a inventar grandes zonas de la escena. Aunque la mascara de alta resolucion reduce ese problema, cualquier zona sobreexpandida por la dilatacion de 11x11 con tres iteraciones aumenta el area que el inpainting debe reconstruir.
- El post-procesado morfologico es agresivo por diseno: el cierre de 9x9 y la dilatacion de 11x11 pueden fusionar la rejilla con elementos brillantes del juego (HUD, efectos de luz, particulas) y arrastrarlos a la mascara.
- Rendimiento no verificado: no hay metricas publicadas, ni conjunto de validacion descrito, ni comparacion con alternativas. Las afirmaciones de precision subpixel y de 3x de aceleracion provienen unicamente del autor.
- Tamano de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica documentada; el soporte y el mantenimiento futuro son inciertos.
- Idiomas y metadatos: el repositorio no declara idiomas, no incluye model card con informacion de sesgos ni documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos demograficos, de iluminacion o de genero de videojuego.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion con atribucion y sin garantia, pero se debe verificar de forma independiente la licencia de los datos de entrenamiento, que no se documenta.
- Dependencia de la resolucion: la entrada esta fijada a 1024x1024 con reescalado; en capturas de resolucion muy alta o con mucho detalle fino, el reescalado puede degradar la mascara antes de devolverla al tamano original.
- No apto para tiempo real estricto: no hay datos de latencia publicados, y el pipeline completo incluye inpainting, que es la fase costosa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BiernyVR/vr-guardian-segmentation
- Los resultados de la busqueda web proporcionada no contienen enlaces relevantes para este modelo: son articulos de configuracion de PC y hilos de foro sin relacion con segmentacion de imagen ni con VR. No se dispone de paper, blog tecnico, repositorio de codigo ni demo adicionales mas alla de la propia model card.
