# Chris-Kode/efficientat-mn10-as-onnx

## Resumen

EfficientAT mn10_as en formato ONNX es una conversión del checkpoint `mn10_as` del proyecto EfficientAT, desarrollado originalmente por Florian Schmid en 2022. Se trata de un clasificador de etiquetado de audio (audio tagging) entrenado sobre AudioSet, que predice probabilidades para las 527 clases de dicho conjunto de datos. La versión publicada por Chris-Kode exporta el modelo a ONNX (opset 18) e integra el front-end de extracción de características dentro del propio grafo, de modo que la entrada es directamente audio PCM mono a 32 kHz.

El modelo emplea una arquitectura MobileNetV3 adaptada a espectrogramas log-mel, lo que lo hace muy ligero: el fichero ONNX ocupa aproximadamente 20,2 MB (20.200.590 bytes) con pesos en float32. Esta compacidad, junto con la integración del preprocesado, simplifica el despliegue en entornos de producción donde no se quiere depender de librerías de audio externas para calcular el espectrograma.

La relevancia actual radica en su utilidad como componente de bajo coste para pipelines de clasificación de audio a gran escala: etiquetado de archivos, moderación de contenido sonoro o preprocesado para sistemas de recuperación. La licencia MIT facilita su uso comercial, aunque la información publicada por el autor es muy escasa y no incluye métricas de rendimiento propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3 (CNN) con front-end log-mel integrado (AugmentMelSTFT en modo eval) |
| Parametros totales | no disponible (el fichero ONNX pesa 20.200.590 bytes en float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio de 0,5 s a 60 s por ventana |
| Tipos de cuantizacion | no disponible (el fichero publicado es float32; no se documentan otras variantes) |
| Idiomas soportados | no disponible (clasificación de eventos sonoros, no depende de idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18), fichero único `efficientat-mn10-as.onnx` |

## Arquitectura y entrenamiento

El modelo original EfficientAT `mn10_as` es una red convolucional basada en MobileNetV3 entrenada para clasificación de audio sobre AudioSet, con 527 clases de salida. El front-end de características es un `AugmentMelSTFT` en modo evaluación que aplica pre-énfasis, ventana Hann de 800 muestras en tramas de 1024 puntos, salto de 320, 128 bancos mel Kaldi de 0 a 15 kHz, logaritmo y normalización `(x + 4.5) / 5`. En esta exportación, ese front-end se ha incorporado al grafo ONNX, de modo que el modelo recibe directamente muestras de audio mono a 32 kHz.

La exportación se realizó con opset 18 e incluye una capa sigmoide final, por lo que la salida son probabilidades (no logits) para las 527 clases. Los pesos no se han modificado respecto al checkpoint original (`mn10_as_mAP_471.pt` de la release `v0.0.1`, commit `a425fdce92572e602a1d5634799bd9f1f2efa806`). El autor indica que el script de exportación (`export_efficientat.py` con `common.py`) verifica el grafo contra el pipeline original de EfficientAT, con una diferencia máxima de 2,5e-6. No se detallan en la información disponible el número de tokens de audio de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Clasificación de audio en 527 clases de AudioSet (eventos sonoros, instrumentos, sonidos ambientales, voces, etc.).
- Etiquetado multi-clase mediante probabilidades independientes por clase (salida sigmoide).
- Procesamiento por lotes de ventanas: la entrada `samples` tiene forma `[W, N]`, con `W` ventanas de audio mono a 32 kHz.
- Ventanas de audio de entre 0,5 s y 60 s por elemento.
- Front-end de características integrado: no requiere calcular el espectrograma externamente.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un clasificador, no un modelo generativo).
- No dispone de capacidades multilingües ni de generación de texto.
- No se documentan capacidades de visión, audio generativo ni modo thinking.

## Casos de uso

- Etiquetado masivo de archivos de audio: el modelo puede procesar lotes de ventanas de audio y devolver las 527 probabilidades de AudioSet, lo que permite indexar bibliotecas de sonido o archivos de podcast por eventos sonoros.
- Moderación de contenido sonoro: clasificar fragmentos de audio subidos por usuarios para detectar categorías sensibles (por ejemplo, ciertos tipos de sonidos o eventos) usando los umbrales de probabilidad adecuados.
- Preprocesado para sistemas de búsqueda multimedia: generar etiquetas automáticas que alimenten un índice de recuperación de audio o vídeo.
- Monitorización ambiental: analizar ventanas de audio de sensores (ventanas de hasta 60 s) para detectar eventos acústicos en entornos urbanos o industriales.
- Clasificación en dispositivos de borde: el tamaño reducido del fichero ONNX (unos 20 MB) y la ausencia de dependencias de preprocesado externas facilitan su despliegue con ONNX Runtime en CPU o en hardware embebido.
- Filtrado previo en pipelines de transcripción: descartar o priorizar segmentos de audio según su contenido sonoro antes de pasarlos a un sistema de ASR.
- Análisis de archivos históricos de radio o televisión: etiquetar grandes volúmenes de grabaciones con ventanas de audio de duración variable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona que el checkpoint original se denomina `mn10_as_mAP_471.pt` (lo que sugiere un mAP de 0,471 en AudioSet para el modelo original), pero no se aportan métricas verificadas para esta exportación ONNX ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el fichero ONNX ocupa unos 20,2 MB en float32, por lo que cabe holgadamente en cualquier GPU consumer (menos de 1 GB de VRAM en la práctica para lotes moderados).
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime o TensorRT; no se requiere una A100 o H100. Una RTX 4090 o incluso una GPU integrada puede ejecutar el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), TensorRT, OpenVINO, o cualquier runtime compatible con ONNX opset 18.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientAT mn10_as ONNX (este) | no disponible (fichero de 20,2 MB) | Ventanas de audio de 0,5 a 60 s a 32 kHz | no disponible | MIT | HuggingFace, ONNX |
| EfficientAT mn10_as original (PyTorch) | no disponible | Misma entrada, pero requiere preprocesado externo | mAP ~0,471 en AudioSet (según nombre del checkpoint) | MIT | GitHub de EfficientAT |
| Otros clasificadores AudioSet | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, PANNs, AST o YAMNet) más allá de lo indicado; los datos de rendimiento de esos modelos no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- El modelo fue entrenado con clips de 10 s; ventanas muy cortas por sí solas producen respuestas pobres, según advierte el autor.
- No se documentan sesgos conocidos, pero al estar entrenado sobre AudioSet hereda los sesgos de etiquetado y la distribución de dicho conjunto de datos.
- Riesgo de alucinación en sentido estricto no aplica (no es generativo), pero sí puede producir falsos positivos o etiquetas poco fiables en clases poco representadas.
- La salida son probabilidades independientes por clase; no se garantiza coherencia entre etiquetas.
- No se especifican limitaciones de idioma porque la tarea no es lingüística, pero el rendimiento puede variar según el dominio acústico.
- La licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright original de Florian Schmid (2022), tal como indica la model card.
- La información publicada es mínima: no hay métricas de evaluación propias de esta exportación, ni datos de latencia o throughput.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- HuggingFace: https://huggingface.co/Chris-Kode/efficientat-mn10-as-onnx
- Repositorio original de EfficientAT: https://github.com/fschmid56/EfficientAT
- Checkpoint original: `mn10_as_mAP_471.pt` de la release `v0.0.1` del repositorio EfficientAT
- Código de exportación: `export_efficientat.py` y `common.py` (incluidos en el repositorio del autor, según la model card)
- Licencia MIT: fichero `LICENSE` en el repositorio de HuggingFace
