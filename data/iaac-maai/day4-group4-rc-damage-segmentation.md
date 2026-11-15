# iaac-maai/day4-group4-rc-damage-segmentation

## Resumen

El modelo `day4-group4-rc-damage-segmentation` es un modelo de segmentación de instancias basado en YOLO26n-seg, desarrollado por el grupo 4 del curso AI Methods I del máster IAAC MaAI 2026/27. Su propósito es detectar y delimitar cinco tipos de daño en fotografías de hormigón armado: fisuras, desconchones, armadura expuesta, armadura corroída y aplastamiento. Resuelve un problema de triaje en inspección estructural: permite priorizar qué fotografías requieren revisión humana urgente en lugar de que un ingeniero las examine todas de forma lineal.

El modelo parte de los pesos preentrenados de YOLO26n-seg en COCO y se afina sobre el dataset *Reinforced concrete structure segmentation dataset 2119* (Wang, 2026), compuesto por 2.119 fotografías y 3.124 polígonos anotados. Con solo 3,1 millones de parámetros, está diseñado para inferencia ligera en entornos de inspección, no para decisiones autónomas de seguridad estructural. Su relevancia radica en que demuestra que un modelo de segmentación extremadamente compacto puede alcanzar un mAP50 de máscara de 0,478 en un dominio especializado, superando ampliamente reglas heurísticas simples (IoU de píxel 0,77 frente a 0,20 para fisuras).

La licencia AGPL-3.0 y el carácter académico del proyecto condicionan su uso: es adecuado para investigación y prototipado, pero requiere revisión legal antes de integrarse en productos comerciales cerrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n-seg (Ultralytics), segmentación de instancias |
| Parametros totales | 3,1 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen RGB redimensionada a 640 px en el lado más largo) |
| Tipos de cuantizacion | no disponible (no se documentan pesos cuantizados en la información proporcionada) |
| Idiomas soportados | no disponible (modelo de visión sin capacidades lingüísticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (repo de 0,0 GB; librería `ultralytics`, pesos `.pt` presumibles pero no confirmados en la información) |

## Arquitectura y entrenamiento

La arquitectura es YOLO26n-seg de Ultralytics, una variante de segmentación de instancias de la familia YOLO26 en su configuración nano, con 3,1 millones de parámetros. El modelo base `yolo26n-seg.pt` fue preentrenado en COCO y posteriormente afinado sobre el dataset de daño en hormigón armado. La entrada es una imagen RGB redimensionada a 640 px en el lado más largo, y la salida proporciona, por cada instancia de daño detectada, una máscara de contorno, una caja delimitadora, la clase y la confianza.

El entrenamiento se realizó durante 50 épocas con paciencia de 15, batch de 16, tamaño de imagen 640, augmentación por defecto de Ultralytics y semilla 42, sobre la GPU de un portátil Apple M4 en 90 minutos. La mejor época fue la 47. Un experimento con tamaño de imagen 416 resultó 0,024 peor en mAP50 de máscara sobre validación, por lo que se mantuvo 640. El dataset de entrenamiento contiene 2.119 fotografías con 3.124 polígonos (fisura 1.833, desconchón 282, armadura expuesta 89, armadura corroída 832, aplastamiento 88), dividido por grupos de duplicados (hash perceptual + características ResNet18) para evitar fuga de información entre splits: 1.513 imágenes de entrenamiento, 303 de validación y 303 de test. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Segmentación de instancias de cinco clases de daño en hormigón armado: `crack`, `spalling`, `rebar_exposure`, `rebar_corrosion` y `crushing`.
- Salida por instancia: máscara de contorno, caja delimitadora, clase y puntuación de confianza.
- Procesamiento de imágenes RGB redimensionadas a 640 px en el lado más largo.
- Triaje y ranking de fotografías de inspección por presencia y severidad aparente de daño.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades multilingües, de texto, de audio ni de modo de razonamiento explícito.
- No está entrenado para medir anchos de fisura ni áreas dañadas en metros cuadrados (no hay escala en las imágenes).

## Casos de uso

- Triaje de inspecciones de parkings y edificios: el modelo procesa lotes de fotografías tomadas por inspectores y ordena las imágenes por confianza y clase de daño, de modo que el ingeniero revisa primero las que contienen fisuras o corrosión detectadas con mayor puntuación, reduciendo el tiempo de revisión manual.
- Priorización de inspecciones de puentes: con 44 fotografías nuevas de un puente dañado, el modelo permite generar un ranking de imágenes con daño probable antes de la revisión humana, tal como se documenta en la figura de aplicación del model card.
- Investigación en visión por computador aplicada a estructuras: sirve como línea base reproducible (semilla 42, split por grupos de duplicados) para comparar arquitecturas de segmentación en el dominio del hormigón armado.
- Detección de corrosión en armadura: la clase `rebar_corrosion` alcanza AP50 de 0,78 en test, por lo que es útil para cribar fotografías de elementos con armadura oxidada en entornos con alta humedad o exposición ambiental.
- Detección de fisuras en paramentos: la clase `crack` obtiene AP50 de 0,83 en test, lo que permite filtrar imágenes con fisuras visibles para revisión detallada por parte de un técnico.
- Docencia y prototipado en cursos de IA aplicada: al ser un modelo de 3,1 M de parámetros entrenado en 90 minutos en un portátil, es adecuado para demostrar flujos completos de anotación, entrenamiento, evaluación y despliegue en asignaturas de métodos de IA.
- Precribado en flujos de mantenimiento de instalaciones: integrado en un pipeline que recibe fotos de facility managers, el modelo puede marcar automáticamente las imágenes sospechosas y derivarlas a un ingeniero, siempre con revisión humana de cada foto.

## Benchmarks y rendimiento

| Test set (303 imágenes) | mask mAP50 | mask mAP50-95 |
|---|---|---|
| YOLO26n-seg preentrenado sin fine-tuning | 0,00 | 0,00 |
| Este modelo | 0,478 | 0,301 |

Rendimiento por clase en test:

| Clase (polígonos en test) | mask AP50 | mask AP50-95 |
|---|---|---|
| crack (283) | 0,83 | 0,50 |
| spalling (34) | 0,28 | 0,16 |
| rebar_exposure (12) | 0,28 | 0,20 |
| rebar_corrosion (98) | 0,78 | 0,52 |
| crushing (11) | 0,22 | 0,12 |

Con el umbral recomendado de 0,30 (el más bajo con al menos 70 % de precisión en validación), el modelo alcanza precisión 0,75 y recall 0,69 en test. En validación, la matriz de confusión indica que se pierden el 29 % de las fisuras y el 40 % de los desconchones, y que el 57 % de las falsas alarmas corresponden a fisuras (juntas, sombras y bordes confundidos con fisuras). La armadura expuesta no se reconoce en ningún caso: el 58 % se clasifica como corrosión, ya que las clases solo difieren por la presencia de óxido y la corrosión tiene diez veces más ejemplos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Por el tamaño (3,1 M de parámetros) y la entrada de 640 px, es presumible que quepa en GPUs de consumo, pero no se documentan cifras concretas.
- GPU recomendadas: no disponible. El entrenamiento se realizó en la GPU de un Apple M4, lo que sugiere que la inferencia es viable en hardware de consumo.
- Cabe en GPU de consumo: presumiblemente sí, dado el tamaño del modelo, aunque no se confirma en la información.
- Opciones de despliegue: librería `ultralytics` (versión 8.4.210 documentada), con torch 2.15.0 y Python 3.12. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo de visión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (YOLO26n-seg afinado) | 3,1 M | Imagen RGB 640 px | mask mAP50 0,478; mAP50-95 0,301 en test | AGPL-3.0 | Hugging Face |
| YOLO26n-seg preentrenado en COCO | 3,1 M | Imagen RGB 640 px | mask mAP50 0,00 en este dominio sin fine-tuning | AGPL-3.0 (Ultralytics) | Ultralytics |
| Reglas heurísticas simples (referencia del model card) | no aplica | Imagen RGB | IoU de píxel 0,20 para fisuras | no disponible | no disponible |

No se han documentado en la información proporcionada otros modelos comparables de segmentación de daño en hormigón armado con métricas publicadas.

## Limitaciones y advertencias

- Rendimiento muy desigual por clase: las clases frecuentes (fisura, corrosión) alcanzan AP50 en torno a 0,8, mientras que las clases raras y más severas (desconchón, armadura expuesta, aplastamiento) se quedan en 0,2-0,3.
- La armadura expuesta no se reconoce de forma fiable: recall 0 en todos los umbrales y confusión sistemática con corrosión (58 % de los casos).
- Falsas alarmas por confusión con juntas, sombras y bordes: el 57 % de las detecciones sin anotación real son fisuras mal identificadas.
- Fisuras fragmentadas: en las peores imágenes de validación, las fisuras se cortan en varios trozos distintos de la anotación original.
- Sobreajuste incipiente: la pérdida de validación se aplana mientras la de entrenamiento sigue bajando, según las curvas documentadas.
- Sesgo de dominio: entrenado con fotos mayoritariamente en primer plano de estructuras variadas; no cubre imágenes aéreas, térmicas ni nocturnas.
- No cubre otros materiales (fábrica de ladrillo, acero, madera, asfalto).
- No permite medir anchos de fisura ni áreas dañadas en metros cuadrados por ausencia de escala en las imágenes.
- Uso fuera de alcance: no debe usarse para decisiones de seguridad estructural ni de capacidad portante, ni para declarar un elemento seguro (la ausencia de detección no equivale a ausencia de daño).
- Requiere revisión humana de cada fotografía: el modelo es una herramienta de cribado, no un sustituto del ingeniero.
- Licencia AGPL-3.0: impone obligaciones de copyleft que pueden afectar a productos comerciales cerrados; requiere revisión legal antes de su integración.
- Riesgo de alucinación entendido como falsos positivos y falsas alarmas en clases con pocos ejemplos de entrenamiento.
- No se documentan sesgos demográficos ni de otro tipo, al no tratar personas ni datos personales; cualquier decisión sobre personas queda explícitamente fuera de alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/day4-group4-rc-damage-segmentation
- Repositorio de código del grupo: https://github.com/iaac-maai/Group4-day4-assignment
- Dataset de entrenamiento (Wang, 2026, Mendeley Data): https://doi.org/10.17632/2vkm6k4cfg.1
- Imagen de predicciones de test: https://huggingface.co/iaac-maai/day4-group4-rc-damage-segmentation/resolve/main/09_test_predictions.png
- AP por clase en test: https://huggingface.co/iaac-maai/day4-group4-rc-damage-segmentation/resolve/main/08_test_per_class.png
- Curvas de entrenamiento: https://huggingface.co/iaac-maai/day4-group4-rc-damage-segmentation/resolve/main/04_training_curves.png
- Matriz de confusión en validación: https://huggingface.co/iaac-maai/day4-group4-rc-damage-segmentation/resolve/main/05_confusion_matrix_val.png
- Fallos en validación: https://huggingface.co/iaac-maai/day4-group4-rc-damage-segmentation/resolve/main/06_failures_val.png
- Barrido de umbral: https://huggingface.co/iaac-maai/day4-group4-rc-damage-segmentation/resolve/main/07_threshold_sweep.png
- Aplicación de ranking en puente: https://huggingface.co/iaac-maai/day4-group4-rc-damage-segmentation/resolve/main/10_application_bridge.png
