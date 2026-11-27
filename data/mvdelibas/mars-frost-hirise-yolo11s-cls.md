# mvdelibas/mars-frost-hirise-yolo11s-cls

## Resumen

Mars surface frost classifier es un modelo de clasificación de imágenes basado en Ultralytics YOLO11s-cls, ajustado por el usuario mvdelibas para detectar la presencia de escarcha (frost) en parches de la superficie de Marte capturados por la cámara HiRISE. El modelo resuelve una tarea binaria de visión por computador dentro del conjunto de referencia Mars-Bench: dado un recorte de imagen de la superficie marciana, predice si contiene escarcha o no. Es relevante ahora porque la detección automatizada de escarcha en imágenes orbitales de alta resolución es un paso previo para estudios de ciclo del agua y de procesos estacionales en Marte, y este modelo ofrece un punto de partida entrenado y reproducible sobre datos públicos.

El modelo parte de los pesos preentrenados oficiales de YOLO11s-cls (224 píxeles de entrada) y se afina sobre el subconjunto `mb-frost_cls` de Mars-Bench. Su salida es una clasificación entre dos clases cuyos nombres internos están en turco: `kiragili` (con escarcha) y `kiragisiz` (sin escarcha). El autor advierte explícitamente de que el modelo tiende a sobrepredecir la clase positiva, por lo que los positivos deben tratarse como candidatos a revisión.

Se trata de un modelo de investigación de tamaño pequeño, con licencia AGPL-3.0 heredada de Ultralytics y con la obligación adicional de atribución de los datos de entrenamiento (CC BY 4.0). No está pensado como herramienta operativa de cartografía científica, sino como componente experimental dentro de un pipeline de análisis de imágenes planetarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11s-cls (clasificador de imágenes, CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 224 px) |
| Tipos de cuantizacion | no disponible (pesos `.pt` de PyTorch/Ultralytics) |
| Idiomas soportados | en, tr (etiquetas y documentación; el modelo no procesa texto) |
| Licencia | AGPL-3.0 (pesos derivados de Ultralytics); datos de entrenamiento CC BY 4.0 |
| Formato de pesos | PyTorch `.pt` (archivo `mars-kiragi-yolo11s-cls-v2.pt`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de imágenes YOLO11s-cls de Ultralytics, una red convolucional ligera pensada para clasificación de imágenes a resolución de 224 píxeles. Se inicializa desde los pesos preentrenados oficiales de Ultralytics y se afina sobre el subconjunto de escarcha de Mars-Bench (`mb-frost_cls`). Según la model card en turco, esta versión v2 se entrenó con una tasa de aprendizaje más baja que la v1 (AdamW con `lr0` 0,001) y sin mixup, lo que reduce la variabilidad de la precisión de validación entre épocas.

Los datos de entrenamiento provienen de Mars-Bench (`mb-frost_cls`, Zenodo 15494363, CC BY 4.0), con imágenes originales de NASA/JPL/University of Arizona capturadas por HiRISE. El conjunto presenta desbalance de clases: aproximadamente el 59 % de las imágenes de entrenamiento y el 34 % de las de validación pertenecen a la clase con escarcha, lo que el autor señala como posible causa del sesgo hacia la clase positiva. No se documentan detalles sobre número total de tokens, composición exacta del dataset, ni uso de RLHF/DPO (no aplicable a un clasificador de visión).

## Capacidades

- Clasificación binaria de imágenes de la superficie marciana en dos clases: `kiragili` (con escarcha) y `kiragisiz` (sin escarcha).
- Entrada de imágenes de 224 píxeles, compatible con el pipeline estándar de Ultralytics (`YOLO(...).predict(...)`).
- Salida de probabilidades por clase (`result.probs`) con acceso a la clase top-1 y a los nombres de clase.
- Diseñado específicamente para parches HiRISE; no está entrenado para otras cámaras, sensores ni estilos de imagen.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un clasificador de visión, no un modelo de lenguaje).
- Capacidades multilingües: no aplica; los nombres de clase están en turco y la documentación en inglés y turco.

## Casos de uso

- Detección preliminar de escarcha en catálogos de parches HiRISE: el modelo permite filtrar rápidamente grandes lotes de recortes y priorizar los candidatos positivos para inspección humana, gracias a su alta exhaustividad (recall de 0,995 en la clase `kiragili`).
- Etiquetado asistido en proyectos de ciencia ciudadana: los positivos del modelo pueden presentarse a voluntarios como candidatos a validar, reduciendo el esfuerzo de revisión manual.
- Generación de conjuntos de datos aumentados para entrenar modelos posteriores: los positivos de alta confianza pueden servir como semillas para un reetiquetado supervisado.
- Estudios de variabilidad estacional: aplicado a series temporales de una misma región HiRISE, permite explorar cambios en la presencia de escarcha, siempre con validación en muestras propias.
- Prototipado rápido en pipelines de análisis planetario: al ser un modelo pequeño y compatible con Ultralytics, se integra fácilmente en scripts de Python para experimentación.
- Evaluación comparativa de métodos de clasificación en Marte: sirve como línea base reproducible dentro de Mars-Bench para contrastar con otros clasificadores.
- Filtrado previo en flujos de anotación: descartar parches claramente sin escarcha (precisión de 0,997 en `kiragisiz`) para reducir el volumen de imágenes a revisar.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de validación del origen de datos de entrenamiento (Mars-Bench val):

| Metrica (validacion) | Valor |
|---|---|
| Top-1 accuracy | 90,8 % |
| Top-5 accuracy | 100,0 % |
| Macro F1 | 85,4 % |
| Macro precision | 85,3 % |
| Macro recall | 89,1 % |

Resultados por clase (matriz de confusión de la plataforma):

| Clase | Soporte | Precision | Recall | F1 |
|---|--:|--:|--:|--:|
| kiragisiz | 7494 | 0,997 | 0,787 | 0,880 |
| kiragili | 3921 | 0,710 | 0,995 | 0,829 |

El autor indica que la precisión derivada de la matriz de confusión es del 85,9 %, frente al 75,1 % de la versión v1. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo (YOLO11s-cls, variante small) se espera un consumo moderado, apto para GPU de gama media, aunque no se confirma en la información.
- GPU recomendadas: no disponible; al ser un modelo pequeño, cabría esperar compatibilidad con GPU consumer, pero no se documenta.
- Compatibilidad con GPU consumer: no confirmada en la información proporcionada.
- Opciones de despliegue: Ultralytics (PyTorch) mediante `YOLO(...).predict(...)`; el resto de opciones (ONNX, TensorRT, vLLM, llama.cpp, Ollama, TGI) no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mars-frost-hirise-yolo11s-cls (este) | no disponible | 224 px | Top-1 90,8 %, macro F1 85,4 % | AGPL-3.0 + CC BY 4.0 | Hugging Face |
| mars-kiragi-yolo11s-cls (v1, mismo autor) | no disponible | 224 px | Precisión de matriz de confusión 75,1 % | AGPL-3.0 + CC BY 4.0 | Hugging Face (referenciado en la model card) |
| Otros clasificadores de Mars-Bench | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgo hacia la clase positiva: el modelo detecta casi toda la escarcha real (recall 0,995) pero aproximadamente el 29 % de los parches que etiqueta como `kiragili` en realidad no tienen escarcha (precisión 0,710). Los positivos deben tratarse como candidatos.
- Desbalance de clases en los datos (59 % positivos en entrenamiento, 34 % en validación), señalado por el autor como posible causa del sesgo.
- Rendimiento medido solo en el split de validación del origen de datos; el rendimiento en el mundo real con otros sensores, regiones o estilos de imagen será menor. Es imprescindible validar en una muestra propia antes de confiar en el modelo.
- El modelo asigna siempre una de sus dos clases a cualquier entrada; con imágenes de otro tipo el resultado carece de sentido.
- Solo entrenado para parches HiRISE; variaciones estacionales o de iluminación pueden degradar la precisión.
- Uso previsto de investigación; no debe emplearse como única fuente para cartografía científica ni para decisiones de misión.
- Licencia AGPL-3.0 (heredada de Ultralytics) con obligaciones de copyleft para uso en red; además, la licencia CC BY 4.0 de los datos exige mantener la atribución indicada.
- Nombres de clase internos en turco (`kiragili`/`kiragisiz`), lo que requiere mapeo en pipelines en otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/mars-frost-hirise-yolo11s-cls
- Dataset Mars-Bench (Zenodo): https://doi.org/10.5281/zenodo.15494363
- Repositorio Ultralytics YOLO: https://github.com/ultralytics/ultralytics
- Documentación Ultralytics: https://docs.ultralytics.com
- Cita del dataset: Purohit, M.; Gajera, B.; Malaviya, V.; Mehta, I.; Kasodekar, K.; Adler, J.; Lu, S.; Rebbapragada, U.; Kerner, H. Mars-Bench: mb-frost_cls. Zenodo, 2025.
