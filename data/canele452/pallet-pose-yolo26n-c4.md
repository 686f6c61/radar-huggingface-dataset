# CanelE452/pallet-pose-yolo26n-c4

## Resumen

El modelo pallet-pose-yolo26n-c4 es una variante del YOLO26n-pose de Ultralytics, afinada por CanelE452 para estimar la pose de palets cuadrados. Su innovación es una pérdida de entrenamiento que reconoce la simetría C4 del palet: como las cuatro caras de un palet cuadrado de 1,10 × 1,10 m son físicamente equivalentes, se acepta como etiqueta válida cualquier rotación de 90, 180 o 270 grados de los puntos clave. Esto evita penalizar predicciones correctamente alineadas pero con la numeración de las esquinas rotada.

Se obtiene por fine-tuning de pallet-pose-yolo26n-livegt, sin cambiar la definición de los 9 keypoints. Es un modelo de visión por computadora, no de lenguaje, pensado para pipelines de visión industrial, robótica o logística que estimen la pose 3D de palets con cámaras monoculares. En la validación de 155 fotogramas reduce los colapsos de pose reales de 2 a 0 frente al modelo base. Licencia AGPL-3.0 y requiere ultralytics >= 8.4.60.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n-pose (Ultralytics), red neuronal convolucional con cabezas de detección de objetos y keypoints |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | Checkpoint .pt (Ultralytics) |

## Arquitectura y entrenamiento

La arquitectura es la de YOLO26n-pose de la librería ultralytics, un modelo de detección de objetos y estimación de keypoints de tamaño nano. El modelo consta de una columna vertebral convolucional con detección de cajas y una cabeza de pose que produce 9 puntos clave por objeto: cuatro esquinas superiores, cuatro inferiores y un centroide. La definición de los keypoints se mantiene de la versión base, con la cara frontal ocupando los índices 0-3.

El entrenamiento parte de los pesos de pallet-pose-yolo26n-livegt y se realiza con una pérdida personalizada denominada ChallengeC4PoseLoss. Esta pérdida calcula el error entre la predicción y cada una de las cuatro permutaciones posibles de los puntos clave (0, 90, 180 y 270 grados) y elige la de menor error. Las permutaciones se derivan geométricamente rotando los vértices 3D con la matriz Ry(θ) y comprobando la correspondencia de coordenadas con tolerancia inferior a 1e-9. Se verifican propiedades de grupo como la biyección, el centroide fijo y la preservación de aristas.

Los datos de entrenamiento constan de 851 imágenes anotadas manualmente, ampliadas a 2 088 muestras de entrenamiento y 155 de validación mediante volteo horizontal y ruido de sensor (696 originales + 696 volteadas + 696 con ruido). Se excluyeron explícitamente los recortes de truncación. El modelo se entrenó durante 40 epochs con batch 32, imgsz 640, optimizador SGD con lr0 0,01, lrf 0,01 y warmup de 3, en una RTX 3080 (10,2 minutos). No se aplicó RLHF ni ningún otro método de aprendizaje por refuerzo.

## Capacidades

- Detección de palets en imágenes y estimación de 9 keypoints (esquinas y centroide) por palet.
- Reconocimiento de la simetría C4 en el entrenamiento: el modelo acepta una cara frontal rotada en múltiplos de 90 grados como etiqueta válida, lo que mejora la robustez en palets cuadrados.
- Inferencia estándar con el pipeline de Ultralytics: el usuario obtiene cajas y keypoints en una sola pasada.
- Integración posterior con solvePnP para calcular la pose 3D del palet, con objectPoints de 1,10 × 0,15 × 1,10 metros.
- No soporta generación de texto, tool calling, agentes ni razonamiento de lenguaje: es un modelo de visión por computadora.
- No ofrece capacidades multimodales de audio ni vídeo más allá de imágenes fijas.

## Casos de uso

- Paletizado y despaletizado robótico: el modelo estima las esquinas del palet para que un brazo robótico conozca la orientación y posición exactas, incluso cuando la cara frontal es ambigua. Su simetría C4 evita que el robot trate una cara equivalente como un error.
- Transporte automatizado en almacenes (AGVs y carretillas): las carretillas autónomas pueden usar los keypoints para alinearse con el palet antes de la horquilla, reduciendo errores de aproximación.
- Inspección industrial de palets: el modelo permite detectar palets dañados o desalineados en líneas de producción, ya que los keypoints revelan la geometría real del palet.
- Visión para estanterías e inventario: en combinación con un sistema de estimación de pose 3D, el modelo ubica palets en racks y periodifica su estado, aportando contexto de posición en el espacio.
- Calibración de sistemas de visión 3D: los keypoints pueden usarse como correspondencias para calibrar cámaras o para fusionar lecturas de varios sensores en una escena con palets.
- Investigación en simetría rotacional: el enfoque de permutación mínima de la pérdida puede adaptarse a otros objetos con simetría C4, como cajas cuadradas, para entrenar modelos de keypoints más robustos.

## Benchmarks y rendimiento

Resultados de la validación held-out de 155 fotogramas, comparando el modelo base (livegt) y este modelo (C4):

| Metrica | livegt (base) | pallet-pose-yolo26n-c4 |
|---|---|---|
| Deteccion | 154/155 | 154/155 |
| fixed-index mediana (px) | 1,90 | 2,90 |
| fixed-index errores >20 px | 3,2% | 7,1% |
| C4-equivalente mediana (px) | 1,90 | 2,64 |
| C4-equivalente errores >20 px | 1,3% | 0,0% |
| Colapsos reales (true collapse) | 2 | 0 |

Estabilidad entre fotogramas consecutivos (sin usar ground truth). Porcentaje de pares consecutivos cuya diferencia de rotación predicha es 0 grados:

| Sesion | livegt | pallet-pose-yolo26n-c4 |
|---|---|---|
| forklift 142318 | 100,0% | 100,0% |
| forklift 103429 | 100,0% | 97,2% |
| handheld 20260902 | 100,0% | 100,0% |

## Requisitos de hardware

- No se proporcionan cifras oficiales de VRAM para inferencia. Al tratarse de una variante nano de YOLO26, se espera que el consumo de VRAM sea reducido, pero no se dispone de mediciones publicadas.
- El entrenamiento se realizó en una NVIDIA RTX 3080 (10,2 minutos para 40 epochs), lo que da una idea de la ligereza del modelo.
- Para inferencia, se recomienda cualquier GPU compatible con CUDA o incluso CPU, usando el código de Ultralytics. No se especifican requisitos mínimos.
- Despliegue: mediante la librería ultralytics (Python). La card de referencia indica que se requiere ultralytics >= 8.4.60.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pallet-pose-yolo26n-livegt (base) | no disponible | no aplica (vision) | fixed-index mediana 1,90 px; C4 >20 px 1,3%; true collapse 2 | AGPL-3.0 | HuggingFace |
| pallet-pose-yolo26n-c4 (este) | no disponible | no aplica (vision) | fixed-index mediana 2,90 px; C4 >20 px 0,0%; true collapse 0 | AGPL-3.0 | HuggingFace |
| pallet-pose-yolo26n-ft | no disponible | no aplica (vision) | no se dispone de benchmarks publicados en la informacion disponible | AGPL-3.0 | HuggingFace |

## Limitaciones y advertencias

- La muestra de validación es pequeña (155 fotogramas) y los beneficios (2→0 colapsos, 1,3%→0,0% errores C4) son eventos de un solo dígito, procedentes de una única semilla aleatoria.
- Se excluyeron los recortes de truncación del entrenamiento que el modelo base sí incluía, por lo que el rendimiento en fotogramas parcialmente recortados puede ser inferior al de base, aunque no se midió.
- La validación se extrajo de la misma distribución de sesiones que el entrenamiento; la generalización a escenas inéditas no se ha verificado.
- El modelo está diseñado exclusivamente para palets cuadrados de 1,10 × 1,10 m. Aplicarlo a palets rectangulares invalidaría la simetría C4 e introduciría equivalencias falsas.
- La métrica fixed-index (asumiendo que los índices 0-3 corresponden a una cara concreta) es peor con este modelo (7,1% de errores >20 px frente a 3,2% del base). Si el pipeline downstream asume una cara fija, es preferible usar el base.
- En el pipeline de PnP, el origen de objectPoints debe estar centrado en la cara frontal. Si la cara frontal cambia, el tvec se desplaza a la cara adyacente (aproximadamente 0,78 m para un palet de 1,10 m). Aunque dentro de una secuencia la cara se mantiene estable, entre sesiones puede variar.
- No se han evaluado sesgos sociales, ya que el modelo no procesa lenguaje; el riesgo de alucinación no aplica, pero las predicciones pueden ser incorrectas en presencia de oclusiones o condiciones de iluminación no vistas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CanelE452/pallet-pose-yolo26n-c4
- Modelo base: https://huggingface.co/CanelE452/pallet-pose-yolo26n-livegt
- Modelo relacionado: https://huggingface.co/CanelE452/pallet-pose-yolo26n-ft
