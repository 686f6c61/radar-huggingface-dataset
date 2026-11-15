# LibreYOLO/LibreDDRNetm-imagenet

## Resumen

LibreDDRNetm-imagenet es un checkpoint de clasificación de imágenes correspondiente a DDRNet-23, la variante de tamaño medio de la familia DDRNet (Deep Dual-Resolution Network), publicada originalmente por el autor de la arquitectura en el repositorio ydbongHIT/DDRNet. El modelo se distribuye como espejo byte a byte del checkpoint oficial `DDRNet23_imagenet.pth`, entrenado sobre ImageNet-1K, y su función principal no es la clasificación en sí, sino servir como inicialización de la red troncal para el entrenamiento de segmentación semántica en el framework LibreYOLO.

La relevancia de este artefacto es de infraestructura: LibreYOLO lo integra en su clase `LibreDDRNet` para que un modelo recién creado descargue automáticamente los pesos preentrenados al iniciar el entrenamiento sobre datasets como Cityscapes. Al cargar, se conservan únicamente los tensores que la red de clasificación comparte con la red de segmentación, mientras que el módulo DAPPM y las cabezas de segmentación quedan en su inicialización aleatoria, replicando el procedimiento del receta original.

Se trata de un modelo pequeño (el repositorio ocupa unos 0,1 GB), sin capacidades generativas ni de lenguaje: es un backbone convolucional de dos resoluciones orientado a visión por computador. No hay información sobre número exacto de parámetros ni longitud de contexto en la documentación proporcionada, ya que no aplica el concepto de contexto textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDRNet-23 (Deep Dual-Resolution Network), red convolucional de dos resoluciones con fusión bilateral |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes ImageNet-1K) |
| Licencia | MIT (interpretación declarada por LibreYOLO, no confirmada por el publicador original) |
| Formato de pesos | checkpoint PyTorch (`.pth`), SHA-256 `571959df93dce2db4b57d788362eb049a941e21b1b076a57112f8256216d1c08` |

## Arquitectura y entrenamiento

DDRNet es una red neuronal convolucional diseñada para segmentación semántica en tiempo real, basada en una arquitectura de resolución dual: una rama de alta resolución que preserva detalle espacial y una rama de baja resolución que captura contexto semántico, con múltiples etapas de fusión bilateral entre ambas. La variante DDRNet-23 añade el módulo DAPPM (Deep Aggregation Pyramid Pooling Module) para agregación de contexto multi-escala. En esta versión concreta, el modelo se ha entrenado como clasificador sobre ImageNet-1K, y el checkpoint resultante se reutiliza para inicializar la red de segmentación.

El checkpoint es idéntico al publicado por el autor original (commit `de0db317c5af4b0946231f475cf74ca4f51b8ac2` del repositorio ydbongHIT/DDRNet), sin modificaciones por parte de LibreYOLO, que únicamente verifica el hash SHA-256 en cada descarga. No se dispone de información sobre el número de tokens de entrenamiento (no aplica), composición exacta del dataset más allá de ImageNet-1K, ni sobre el uso de RLHF/DPO (no aplica a un clasificador de visión). El error top-1 reportado aguas arriba es del 24,1 %.

## Capacidades

- Clasificación de imágenes sobre las 1.000 clases de ImageNet-1K.
- Extracción de características visuales como backbone convolucional para tareas posteriores (segmentación semántica, detección).
- Inicialización de pesos para entrenamiento de segmentación semántica en LibreYOLO mediante `LibreDDRNet(size="m")`.
- Procesamiento de imágenes a resolución completa con preservación de detalle espacial gracias a la rama de alta resolución.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio.

## Casos de uso

- Segmentación semántica urbana: se usa como backbone preentrenado para entrenar `LibreDDRNet` sobre Cityscapes, aprovechando que los pesos de ImageNet aceleran la convergencia en la tarea de segmentación.
- Segmentación en tiempo real en sistemas embebidos: la arquitectura de resolución dual de DDRNet está pensada para inferencia de baja latencia, adecuada para vehículos autónomos o robótica móvil.
- Extracción de features para pipelines de visión: el checkpoint puede emplearse como extractor congelado en tareas de clasificación o detección donde se requiera un backbone ligero.
- Prototipado académico de segmentación: sirve como punto de partida reproducible (hash verificado) para replicar resultados del paper original de DDRNet.
- Segmentación médica o de escenas no urbanas: al ser un backbone genérico preentrenado en ImageNet, puede afinarse en dominios específicos con datasets propios.
- Integración en el ecosistema LibreYOLO: permite a los usuarios del framework entrenar modelos de segmentación sin descargar manualmente los pesos desde Google Drive, con verificación de integridad automática.

## Benchmarks y rendimiento

El único dato de rendimiento disponible en la información proporcionada es el error top-1 del 24,1 % sobre ImageNet-1K, reportado aguas arriba. No se han publicado en la información disponible resultados de benchmarks adicionales (mIoU en Cityscapes, latencia, throughput) para este checkpoint concreto.

| Benchmark | Métrica | Resultado |
|---|---|---|
| ImageNet-1K | Error top-1 | 24,1 % (reportado upstream) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; el tamaño del repositorio (0,1 GB) sugiere un modelo de pocos millones de parámetros, por lo que cabría en GPUs consumer de gama baja.
- GPU recomendadas: no disponible; por el tamaño del checkpoint, previsiblemente cualquier GPU con al menos unos pocos GB de VRAM sería suficiente, pero no se confirma en la información.
- Compatibilidad con GPU consumer: probablemente sí (RTX 3060, RTX 4090, etc.), aunque sin datos oficiales de VRAM.
- Opciones de despliegue: el modelo se carga mediante la librería `libreyolo` (clase `LibreDDRNet`); no se mencionan exportaciones a ONNX, TensorRT ni otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, DDRNet-23 se sitúa en la familia de backbones de segmentación en tiempo real junto a arquitecturas como BiSeNet o STDC, pero no se aportan datos numéricos de comparación en la información disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreDDRNetm-imagenet | no disponible | no aplica | top-1 error 24,1 % (ImageNet-1K) | MIT (interpretación) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo es un clasificador de imágenes, no un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones.
- El checkpoint está pensado como inicialización de backbone; usarlo directamente como clasificador final puede no ser óptimo sin ajuste fino.
- La licencia MIT es una interpretación declarada por LibreYOLO, no confirmada por el publicador original de los pesos; existe incertidumbre legal sobre su uso comercial.
- Los pesos fueron entrenados sobre ImageNet-1K, cuyos términos de acceso son para investigación no comercial y uso educativo, lo que puede restringir el uso comercial del modelo derivado.
- No se dispone de información sobre sesgos del modelo más allá de los inherentes a ImageNet-1K.
- Riesgo de alucinación no aplica (no es generativo), pero sí puede producir clasificaciones erróneas en dominios alejados de ImageNet.
- El módulo DAPPM y las cabezas de segmentación no se inicializan con estos pesos, sino aleatoriamente, lo que debe tenerse en cuenta al reutilizar el checkpoint.
- No hay datos publicados sobre cuantización, latencia ni requisitos exactos de hardware.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreDDRNetm-imagenet
- Repositorio original DDRNet: https://github.com/ydhongHIT/DDRNet
- Checkpoint original (Google Drive): https://drive.google.com/file/d/1VoUsERBeuCaiuQJufu8PqpKKtGvCTdug
- Commit de referencia: `de0db317c5af4b0946231f475cf74ca4f51b8ac2`
