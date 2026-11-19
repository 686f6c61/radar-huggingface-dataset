# kuccy/patrol-detector

## Resumen

`f1_fight_mnv3_16f` es un modelo de clasificación binaria de vídeo (Fight / NonFight) publicado por el usuario kuccy en el repositorio `kuccy/patrol-detector` de Hugging Face. Resuelve la detección de peleas y violencia en fragmentos cortos de vídeo de vigilancia, un problema clásico de visión por computador aplicado a seguridad. El modelo es deliberadamente ligero: 3,91 millones de parámetros y un fichero ONNX de 15,998 MB, lo que lo sitúa en la categoría de modelos desplegables en CPU sin acelerador dedicado.

La arquitectura es un extractor de características por fotograma basado en MobileNetV3-Large (preentrenado en ImageNet) seguido de dos convoluciones temporales 1D, pooling por atención y un clasificador lineal de dos salidas. Trabaja sobre fragmentos de 16 fotogramas a 10 fps (1,6 segundos) con entrada RGB de 224×224. No es un modelo generativo ni un LLM: no procesa texto, no tiene ventana de contexto lingüístico y no soporta tool calling.

Su relevancia práctica radica en la latencia: 16,2 ms por fragmento en CPU con onnxruntime, lo que permite procesar vídeo en tiempo real en hardware modesto. El autor documenta con transparencia los límites del modelo, incluyendo una caída de 47,1 puntos porcentuales en recall al evaluarlo en un dominio distinto (Hockey-Fight), lo que lo hace útil como componente de un pipeline con revisión posterior, no como sistema de alerta autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Large (por fotograma) + 2 convoluciones temporales 1D + atención pooling + capa fully-connected (2) |
| Parámetros totales | 3,91 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de 16 fotogramas (1,6 s a 10 fps) |
| Tipos de cuantización | no disponible (solo se documentan pesos fp32 en ONNX y PyTorch) |
| Idiomas soportados | no disponible (modelo de vídeo, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (OPSET 17) y PyTorch `.pt` |
| Tamaño del fichero ONNX | 15,998 MB |
| Entrada | `[B, T, C, H, W]` = `[1, 16, 3, 224, 224]`, float32, RGB, normalización ImageNet |
| Salida | logits `[1, 2]`, índice 1 = Fight |
| Dataset de entrenamiento | RWF-2000 (A1mal/RWF-2000-Dataset) |
| Pipeline declarado | video-classification |
| Runtime declarado | onnxruntime |

## Arquitectura y entrenamiento

El modelo procesa cada uno de los 16 fotogramas del fragmento con un backbone MobileNetV3-Large preentrenado en ImageNet, generando una secuencia de características que se agrega temporalmente mediante dos capas de convolución 1D, un mecanismo de pooling por atención y un max pooling sobre la dimensión temporal. La cabeza final es una capa fully-connected que produce dos logits (NonFight en el índice 0, Fight en el índice 1). El orden de las clases es crítico: un desajuste de índice invalida por completo la interpretación de la salida.

El entrenamiento emplea el dataset RWF-2000 en su versión segmentada: 2000 clips de 5 segundos a 10 fps, con 800 clips Fight y 800 NonFight en train, y 200 + 200 en validación. El autor verifica que no existe solapamiento de vídeos fuente entre train y validación (765 y 180 vídeos respectivamente, con 0 solapamientos), lo que evita la fuga de datos por fragmentos del mismo vídeo largo. Las técnicas de aumento incluyen recorte y escalado aleatorio, volteo horizontal, variaciones de brillo, contraste y saturación, borrado aleatorio con probabilidad 0,2, jitter temporal dentro del clip y mixup a nivel de clip con distribución Beta(0,4; 0,4). No se documenta uso de RLHF, DPO ni ningún proceso de alineación, algo esperable en un modelo discriminativo de visión.

## Capacidades

- Clasificación binaria de fragmentos de vídeo en las categorías Fight y NonFight.
- Detección de eventos de violencia mediante ventana deslizante: el autor especifica un paso de 4 fotogramas y la exigencia de dos ventanas consecutivas por encima del umbral 0,25 para formar un evento candidato.
- Procesamiento en tiempo real en CPU: 16,2 ms por fragmento de 16 fotogramas con onnxruntime.
- Inferencia en GPU: 3,9 ms por fragmento en una RTX 5070 con PyTorch fp32.
- Entrada estandarizada RGB con normalización ImageNet, compatible con pipelines de OpenCV tras conversión de BGR a RGB.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión general, audio ni modo de razonamiento explícito.
- Salida exclusivamente de logits; el modelo no emite alertas ni decisiones de negocio por sí mismo.

## Casos de uso

- **Vigilancia en circuitos cerrados de televisión (CCTV) con hardware de bajo coste**: el modelo cabe en CPU sin GPU dedicada y procesa fragmentos en 16,2 ms, lo que permite analizar varios canales de vídeo en un servidor convencional con onnxruntime. Adecuado para despliegues donde no se justifica una GPU.

- **Pre-filtrado en pipelines de analítica de vídeo**: al ser un clasificador ligero, puede actuar como primera etapa que descarta la mayoría de fragmentos sin violencia y solo reenvía los candidatos a un modelo más pesado o a revisión humana, reduciendo coste computacional aguas abajo.

- **Generación de candidatos de evento con revisión humana posterior**: el autor especifica que el modelo solo produce puntuaciones y eventos candidatos, y que la alerta final debe pasar por una capa de validación en el backend. Encaja en flujos donde un operador revisa las propuestas.

- **Prototipado e investigación en detección de violencia**: con 3,91 M de parámetros y pesos ONNX verificables por SHA256, es un punto de partida reproducible para experimentar con aumento de datos, umbrales y ventanas de confirmación sobre RWF-2000.

- **Integración en sistemas de videovigilancia doméstica o de pequeña empresa**: la latencia y el tamaño del fichero (15,998 MB) permiten embeberlo en dispositivos con recursos limitados, siempre que el dominio de las imágenes se parezca al de RWF-2000 (escenas callejeras reales).

- **Evaluación comparativa de detectores de violencia**: sirve como línea base ligera frente a arquitecturas 3D más pesadas, con métricas publicadas (F1 0,824, AUC 0,859 en validación) y un protocolo de validación cruzada en dominio (Hockey-Fight) documentado.

- **Módulo de gating combinado con detección de personas**: el propio autor sugiere añadir un detector de personas (menciona `m1_yolo11n_640`) para reducir falsos positivos en escenas con aglomeraciones o carreras, usando este clasificador solo cuando haya personas en el encuadre.

## Benchmarks y rendimiento

| Métrica | Validación en dominio (RWF-2000) | Dominio cruzado (Hockey-Fight) | Caída |
|---|---|---|---|
| Accuracy @0,5 | 0,775 | 0,624 | −15,1 pp |
| Precisión Fight | 0,750 | 0,694 | −5,6 pp |
| Recall Fight | 0,915 | 0,444 | −47,1 pp |
| F1 Fight | 0,824 | 0,542 | −28,2 pp |
| AUC | 0,859 | 0,679 | −18,0 pp |

Las métricas de precisión, recall y F1 se calculan con umbral 0,25, seleccionado por ser el óptimo de F1 en validación. El accuracy se reporta a umbral 0,5. El conjunto de validación en dominio son 400 clips del split oficial de RWF-2000 (200 Fight, 200 NonFight); el conjunto cruzado son 1000 clips de Hockey-Fight no vistos en entrenamiento.

| Latencia | Hardware | Tiempo por fragmento |
|---|---|---|
| onnxruntime CPU | AMD Ryzen 7 9700X (8C/16T) | 16,2 ms |
| PyTorch CPU | AMD Ryzen 7 9700X | 54,5 ms |
| PyTorch GPU fp32 | NVIDIA RTX 5070 12 GB | 3,9 ms |

Medición con batch=1, 5 iteraciones de calentamiento y media de 30 ejecuciones, sobre Windows 11, Python 3.12 y torch 2.11.0+cu128.

## Requisitos de hardware

- **VRAM estimada**: el modelo ocupa 15,998 MB en disco en formato ONNX fp32; en memoria de GPU requiere aproximadamente esa misma cifra más los buffers de activación de un fragmento de 16×3×224×224, del orden de decenas de MB. Cabe en cualquier GPU con más de 1 GB de VRAM.
- **GPU recomendadas**: no requiere GPU. En caso de usarse, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 5070) es sobrada; el autor reporta 3,9 ms por fragmento en una RTX 5070.
- **¿Cabe en GPU consumer?**: sí, con enorme margen. También funciona íntegramente en CPU.
- **Opciones de despliegue**: onnxruntime (runtime declarado por el autor y el más rápido en CPU según sus mediciones), PyTorch con los pesos `.pt`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificación de vídeo.
- **Latencia y throughput**: 16,2 ms por fragmento en CPU (≈61 fragmentos/s teóricos en un solo hilo de ejecución, sin paralelismo); 3,9 ms en GPU. El throughput real en producción depende del número de canales de vídeo, del paso de ventana (4 fotogramas) y del coste de decodificación del vídeo, no incluido en estas cifras.
- **Almacenamiento**: repositorio de 0,0 GB según Hugging Face; el fichero ONNX son 15,998 MB.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor menciona `m1_yolo11n_640` como detector de personas del mismo sistema, pero no es un modelo de la misma categoría (detección de objetos frente a clasificación de vídeo) y no se aportan sus especificaciones. Tampoco se incluyen resultados de otras arquitecturas de detección de violencia sobre RWF-2000 en la información disponible.

| Modelo | Tarea | Parámetros | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `f1_fight_mnv3_16f` (este) | Clasificación binaria de vídeo | 3,91 M | 16 fotogramas | no disponible | Hugging Face, público |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Diferencia de dominio**: el modelo se entrenó con escenas callejeras reales de vigilancia (RWF-2000). En el conjunto cruzado Hockey-Fight el recall cae de 0,915 a 0,444 (−47,1 pp). El autor advierte explícitamente que la perspectiva de robot o cámara a bordo constituye un dominio nuevo y que no debe usarse el peso tal cual sin recopilar datos y reentrenar.
- **Falsos positivos a nivel de evento**: la tasa de falsos positivos por fragmento es del 27,5 %, y tras aplicar la ventana deslizante la tasa de falsos positivos a nivel de evento se sitúa entre el 37 % y el 63 %, según umbral y ventana de confirmación. Requiere una capa de revisión en el backend.
- **Escenas deportivas y cinematográficas**: el rendimiento en Hockey-Fight y en escenas de ficción es deficiente; el autor recomienda no mezclar estos dominios en el entrenamiento sin reportar métricas por separado.
- **Aglomeraciones y carreras**: las concentraciones de personas y los desplazamientos rápidos provocan falsos positivos. El autor sugiere añadir un filtro previo con un detector de personas y suavizado de ventanas.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza en dominios alejados del entrenamiento.
- **Licencia**: no disponible. No se puede confirmar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue en producción.
- **Uso previsto**: el dataset de origen es de propósito investigador. El autor indica que el modelo no debe emplearse para decisiones de alto riesgo, como aplicaciones policiales o forenses.
- **Dependencia del orden de clases y del umbral**: el índice 1 debe corresponder a Fight y el umbral de decisión es 0,25, no 0,5. Un cambio inadvertido en cualquiera de los dos invalida las métricas reportadas.
- **Conversión de color**: la entrada debe ser RGB; leer con OpenCV y no convertir de BGR a RGB produce degradación silenciosa del rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kuccy/patrol-detector
- Dataset RWF-2000 en Hugging Face: https://huggingface.co/datasets/A1mal/RWF-2000-Dataset
- Referencia del dataset: Cheng, M., Cai, K., & Li, M. (2020). RWF-2000: An Open Large Scale Video Database for Violence Detection. IEEE Access.
- Repositorio principal del sistema (mencionado en la model card, sin URL): scripts `scripts/fetch_model.py` y fichero `models/f1_fight_mnv3_16f.yaml`
- Pesos ONNX (SHA256 `7e949ff2fce3732d9770dcc691a18baeee40df03a821bbb2b07fa1053b6fa8de`) y PyTorch (SHA256 `4a5b1d15cbb1994275b2c970da448934d91de8e7fae33f85438787ff24c5eec9`), disponibles en el repositorio de Hugging Face indicado arriba.
