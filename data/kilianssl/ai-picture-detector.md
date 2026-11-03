# kilianssl/ai-picture-detector

## Resumen

ai-picture-detector es un clasificador binario de imágenes diseñado para estimar la probabilidad de que una fotografía haya sido generada por inteligencia artificial. No es un modelo entrenado desde cero por su autor, sino una exportación a ONNX de los pesos de `Bombek1/ai-image-detector-siglip-dinov2`, un detector que combina dos torres de visión (SigLIP2-so400m y DINOv2-Large) con adaptadores LoRA y una cabeza MLP entrenada sobre el conjunto de datos OpenFake. El repositorio de `kilianssl` solo contiene el artefacto de exportación, dividido en tres grafos para que una máquina sin GPU pueda cargarlos de uno en uno.

La relevancia práctica del modelo está en su formato: al ser ONNX con cuantización int8 dinámica en los codificadores, puede ejecutarse en CPU con onnxruntime 1.31 (incluida la variante `onnxruntime-node`), lo que lo hace apto para moderación de contenido en servidores sin acelerador. El pipeline declarado es `image-classification` y la licencia es MIT, heredada del modelo base.

El modelo no genera texto ni soporta conversación: es una función de puntuación que devuelve un único valor `p_ai` entre 0 y 1. Su uso previsto, según la propia model card, es como señal de apoyo para un moderador humano, no como veredicto automático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos torres de visión (SigLIP2-so400m y DINOv2-Large) con adaptadores LoRA, concatenación de features y cabeza MLP con sigmoid |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imagen, no de texto) |
| Tipos de cuantizacion | int8 dinámica solo en pesos para los dos codificadores; cabeza en fp32 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, IR version 8); tres grafos: `siglip.int8.onnx`, `dino.int8.onnx`, `head.onnx` |

Especificaciones adicionales de entrada y salida:

| Grafo | Entrada | Preprocesado | Salida |
|---|---|---|---|
| `siglip.int8.onnx` | `pixels` [1,3,384,384] | (x/255 − 0,5)/0,5, redimensionado bilineal, sin recorte | `features` [1,1152] |
| `dino.int8.onnx` | `pixels` [1,3,392,392] | media/desviación típica de ImageNet, redimensionado bicúbico, sin recorte | `features` [1,1024] |
| `head.onnx` | `features` [1,2176] (concatenación siglip ‖ dino) | no aplica | `p_ai` [1] |

Tamaño del repositorio: 0,8 GB. Checksums SHA-256 publicados para los tres ficheros.

## Arquitectura y entrenamiento

El modelo es un detector de imágenes generadas por IA construido sobre dos codificadores visuales preentrenados de distinta familia: SigLIP2-so400m (que aporta un vector de 1152 dimensiones) y DINOv2-Large (1024 dimensiones). Sobre cada torre se aplican adaptadores LoRA, y las representaciones resultantes se concatenan en un vector de 2176 dimensiones que alimenta una cabeza MLP pequeña con activación sigmoide, cuya salida es directamente la probabilidad `p_ai`. La diversidad de los dos codificadores (uno alineado con texto mediante contraste imagen-texto, otro auto-supervisado puramente visual) es el principal argumento de diseño del modelo base.

El entrenamiento se realizó sobre el conjunto de datos OpenFake, según indica la model card. No se especifican en la información disponible el número de imágenes, la composición exacta del dataset, ni si hubo etapas de ajuste fino adicionales más allá del entrenamiento de los adaptadores LoRA y la cabeza. Tampoco se documentan detalles sobre aumento de datos, balanceo de clases o calibración de la probabilidad de salida.

La innovación destacable de esta exportación concreta no está en el entrenamiento sino en el empaquetado: la separación en tres grafos permite cargar y liberar cada torre por separado en memoria, de modo que un servidor CPU con RAM limitada puede procesar la imagen en dos pasadas secuenciales en lugar de mantener ambos codificadores residentes a la vez.

## Capacidades

- Clasificación binaria de imágenes: devuelve `p_ai`, la probabilidad estimada de que la imagen haya sido generada por IA.
- Detección sobre imágenes fotorrealistas, incluyendo fotografías re-codificadas como las de una subida desde móvil.
- Ejecución en CPU mediante onnxruntime 1.31 y onnxruntime-node, sin necesidad de GPU.
- Carga modular de los codificadores para entornos con memoria limitada (tres grafos independientes).
- Integración sencilla en pipelines al ser una función pura imagen → escalar, sin estado ni generación de texto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No procesa vídeo, audio ni texto; su ámbito es exclusivamente la imagen estática.

## Casos de uso

- Moderación de contenido en plataformas de publicación de imágenes: el modelo actúa como primera señal en una cola de revisión, marcando las imágenes con `p_ai` alto para que un moderador humano las inspeccione antes de aplicar una etiqueta o una retirada. La model card lo describe explícitamente como indicio, no como veredicto.
- Etiquetado de procedencia en subidas de usuario: al ejecutarse en CPU con onnxruntime, puede integrarse en el backend de subida para añadir un campo de "probabilidad de generación sintética" a cada imagen almacenada, sin depender de un servicio externo.
- Filtrado en pipelines de datasets: cuando se recopilan imágenes de fuentes abiertas para entrenar otros modelos, el detector permite descartar o separar las muestras sintéticas de las fotográficas antes de la curación del conjunto.
- Verificación editorial en medios: comprobación de apoyo sobre imágenes recibidas de agencias o colaboradores, con la salvedad de que los falsos positivos se concentran en selfies con filtro, modo retrato y HDR intenso, por lo que el resultado debe contrastarse manualmente.
- Despliegue en entornos sin GPU: al estar exportado a ONNX int8, encaja en servidores modestos o en aplicaciones Node.js mediante `onnxruntime-node`, donde un modelo basado en PyTorch con dos torres grandes sería inviable.
- Análisis forense de segundo nivel: uso como una señal más dentro de un informe pericial, combinada con metadatos EXIF, análisis de ruido y otras herramientas, dado que su salida es una probabilidad calibrada de forma no documentada.
- Investigación sobre detección de imágenes sintéticas: el repositorio sirve como artefacto reproducible (checksums publicados) para comparar el rendimiento del detector base frente a otras aproximaciones sobre un mismo conjunto de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio de la aplicación, bajo `scripts/ai-detect`, para el script de exportación y la evaluación, pero no reproduce cifras de precisión, recall, AUC ni tasas de falsos positivos. Tampoco se ofrecen datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo previsto; el modelo está exportado para ejecutarse en CPU. En GPU, ambos codificadores int8 más la cabeza caben holgadamente en cualquier tarjeta con 8 GB o más, aunque no se publican cifras de consumo.
- GPU recomendadas: no se especifican. El diseño está orientado a CPU; cualquier GPU moderna compatible con onnxruntime (por ejemplo, RTX 4090, A100, H100) podría acelerar la inferencia, pero no hay datos publicados.
- Cabe en GPU de consumo: sí, por tamaño (repositorio de 0,8 GB), aunque la documentación no detalla requisitos de VRAM por grafo.
- Opciones de despliegue: onnxruntime 1.31 (Python) y onnxruntime-node; la carga secuencial de los tres grafos permite reducir el pico de memoria en máquinas CPU.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| kilianssl/ai-picture-detector | SigLIP2-so400m + DINOv2-L con LoRA + MLP | Detección de imagen generada por IA | MIT | ONNX int8 | HuggingFace |
| Bombek1/ai-image-detector-siglip-dinov2 | SigLIP2-so400m + DINOv2-L con LoRA + MLP | Detección de imagen generada por IA | MIT | PyTorch (modelo base) | HuggingFace |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con su propio modelo base, del que esta exportación hereda los pesos: la diferencia es el formato (ONNX int8 frente a PyTorch) y la división en tres grafos, no el comportamiento del clasificador. No se dispone en la información proporcionada de otros detectores de imágenes sintéticas con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La probabilidad de salida es un indicio para revisión humana, no un veredicto: la model card lo advierte de forma explícita.
- Falsos positivos documentados en fotografías re-codificadas como subida de móvil, especialmente en selfies con filtro, modo retrato y HDR intenso.
- No se documentan sesgos demográficos, culturales ni de otro tipo; la ausencia de esta información impide evaluar su comportamiento diferencial por grupos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con confianza alta, ya que no se publica calibración de la probabilidad.
- No procesa texto ni mantiene conversación, por lo que no puede explicar sus decisiones.
- No se especifican los idiomas ni la procedencia geográfica de los datos de entrenamiento (OpenFake), lo que limita el análisis de generalización.
- Licencia MIT: permite uso comercial y modificación, pero al derivar del modelo base conviene conservar la atribución correspondiente.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni de validación independiente.
- El autor no es el entrenador de los pesos; cualquier problema de calidad del clasificador es atribuible al modelo base, no a la exportación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kilianssl/ai-picture-detector
- Modelo base: https://huggingface.co/Bombek1/ai-image-detector-siglip-dinov2
- Sitio del autor de la aplicación: https://taggalicio.us
