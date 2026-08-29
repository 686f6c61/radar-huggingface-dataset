# resoa/garment-crop-gate-nano

## Resumen

`garment-crop-gate-nano` es un clasificador de imágenes binario, desarrollado por el usuario `resoa`, que actúa como compuerta previa al modelo `resoa/garment-attributes` (93,1 millones de parámetros). Su función es responder una única pregunta antes de ejecutar el modelo grande: ¿es este recorte de prenda lo suficientemente ajustado como para confiar en la salida del modelo de atributos? El modelo padre advierte que las entradas de escena completa degradan drásticamente la precisión; este gate cuantifica esa degradación y la convierte en una decisión automática de aceptación o rechazo.

El modelo tiene 47.122 parámetros y un peso de 188 KB, empaquetado en formato ONNX, diseñado para ejecutarse en CPU con recursos mínimos, lo que lo hace apto para integración en pipelines de visión en el borde (edge AI). Fue creado en agosto de 2026 y se distribuye bajo licencia MIT. Su entrada es una imagen RGB de 64×64 píxeles, normalizada por imagen (resta de media y división por desviación estándar), y produce una salida binaria: 1 indica que el recorte es aceptable, 0 que debe rehacerse.

La relevancia de este modelo radica en que resuelve un problema práctico en sistemas de control de calidad automatizado: evita que el modelo de atributos genere predicciones no fiables sobre recortes inadecuados, mejorando el rendimiento global del sistema en un 60% relativo de macro-mAP en una simulación end-to-end, capturando el 96% del beneficio que obtendría un gate perfecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (modelo ONNX de 47.122 parámetros, probablemente red convolucional pequeña) |
| Parametros totales | 47.122 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión por computador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (archivo `crop_gate.onnx`) |

## Arquitectura y entrenamiento

La documentación no detalla la arquitectura interna del modelo más allá de su tamaño (47.122 parámetros) y su formato ONNX. No se especifica si se trata de una red convolucional, un MLP o una arquitectura híbrida. El modelo se entrena para clasificar si un recorte de prenda es "suficientemente ajustado" según el protocolo de evaluación del modelo padre `garment-attributes`. Los datos de entrenamiento no se describen explícitamente, pero se menciona que las etiquetas son "gratuitas y exactas": el padding del recorte lo aplica el propio harness de evaluación, por lo que la etiqueta es la operación realizada, no una anotación manual.

Una característica técnica relevante es que la entrada se normaliza por imagen (media y desviación estándar calculadas sobre cada imagen individual), en lugar de usar la normalización SigLIP (media y desviación estándar globales) que emplea el modelo padre. Alimentar el gate con tensores normalizados con SigLIP degradaría su rendimiento silenciosamente. El modelo se evalúa con una precisión de 0,8155 ± 0,0096 en su tarea de clasificación, superando a un baseline de 0,6240 y a la clase mayoritaria (0,500).

## Capacidades

- Clasificación binaria de recortes de prendas: acepta o rechaza un recorte según su grado de ajuste (tightness) respecto a la prenda.
- Decisión de confianza previa a la inferencia del modelo `garment-attributes`: evita ejecutar el modelo de 93,1M parámetros sobre entradas no fiables.
- Integración sencilla con ONNX Runtime en CPU, con opciones de configuración de hilos para entornos de baja latencia.
- Funciona como un componente de "refusal" (rechazo) en un pipeline de visión industrial, no como un reparador de recortes.
- Rendimiento medido en términos de precisión, recall y cobertura: precisión del gate 86%, recall 81%, cobertura 48% en la simulación end-to-end.
- Compatible con entornos de edge computing gracias a su tamaño reducido (188 KB, 47K parámetros).

## Casos de uso

- Control de calidad en fabricación de moda: antes de extraer atributos de una prenda (tipo de cuello, bolsillos, etc.) mediante `garment-attributes`, el gate verifica que el recorte proporcionado por un detector de objetos esté lo suficientemente ajustado. Si no lo está, el sistema solicita un nuevo recorte o rechaza la muestra, evitando predicciones erróneas.
- Automatización de inspección visual en almacenes: en un pipeline que recibe fotografías de prendas completas, el gate filtra automáticamente las imágenes que no son recortes individuales, reduciendo el coste computacional al no ejecutar el modelo grande sobre escenas completas.
- Optimización de pipelines de visión por computador de múltiples etapas: el gate actúa como un clasificador de "calidad de entrada" que puede combinarse con otros modelos (detección, segmentación) para decidir si una imagen debe procesarse o descartarse en etapas posteriores.
- Sistema de re-corte iterativo: cuando el gate rechaza un recorte, el sistema puede ajustar el bounding box (por ejemplo, reducir el padding) y volver a intentar, mejorando la tasa de aceptación sin intervención humana.
- Evaluación de pipelines de IA en producción: el gate sirve como monitor de calidad de entrada, permitiendo registrar qué porcentaje de recortes son aceptados y cuáles rechazados, ayudando a detectar problemas en el detector de objetos ascendente.
- Demostración de técnicas de "gate" para modelos grandes: sirve como ejemplo de cómo un modelo pequeño puede proteger a un modelo grande de entradas fuera de distribución, una práctica útil en sistemas con restricciones de latencia o coste.

## Benchmarks y rendimiento

El modelo se evalúa en dos niveles: su precisión como clasificador independiente y su impacto end-to-end en el sistema completo. Los resultados publicados en la model card son los siguientes:

**Precisión del gate en su tarea (clasificación binaria de aceptación/rechazo):**

| Modelo | Accuracy |
|---|---|
| nano gate (47K params) | 0,8155 ± 0,0096 |
| baseline barato (regresión logística con estadísticas de imagen) | 0,6240 |
| mayoría (siempre la clase más frecuente) | 0,500 |

**Impacto end-to-end simulado (entradas con padding variable, 922 instancias):**

| Condición | n | micro-F1 | macro-mAP |
|---|---|---|---|
| Sin gate (ungated) | 922 | 0,5510 | 0,3124 |
| Con gate (aceptados) | 443 | 0,6549 | 0,5012 |
| Rechazados por el gate | 479 | 0,4665 | 0,2302 |
| Oracle (gate perfecto) | 470 | 0,6776 | 0,5086 |

El gate consigue una mejora relativa del 60% en macro-mAP respecto al sistema sin gate, capturando el 96% del beneficio teórico de un gate perfecto. Además, el rechazo se produce sobre entradas que efectivamente son de baja calidad (macro-mAP de 0,2302 en el grupo rechazado), lo que confirma que descarta los casos correctos. No se han publicado comparativas con otros modelos similares, ya que no existe una categoría establecida de "gates de recorte" en la literatura.

## Requisitos de hardware

- VRAM: prácticamente nula; el modelo se ejecuta en CPU con ONNX Runtime, no requiere GPU.
- GPU recomendada: ninguna; está diseñado para CPU, incluso de bajo consumo.
- Compatible con dispositivos edge: su tamaño de 188 KB y su bajo coste de inferencia lo hacen apto para Raspberry Pi, dispositivos móviles o microcontroladores con soporte ONNX.
- Opciones de despliegue: ONNX Runtime (CPU), con configuración de hilos (`intra_op_num_threads=1`) para reducir latencia en entornos de un solo núcleo.
- Latencia y throughput: no se proporcionan cifras exactas, pero al ser un modelo de 47K parámetros sobre una entrada de 64×64, se espera una inferencia en el orden de microsegundos en CPU moderna.

## Comparativa con modelos similares

No disponible. No se han identificado modelos con la misma función (gate de calidad de recorte para clasificación de atributos de moda) en la información proporcionada. El modelo es altamente específico para su tarea y no existe una categoría comparable en el ecosistema de modelos públicos.

## Limitaciones y advertencias

- El gate es un mecanismo de rechazo, no de reparación: si rechaza un recorte, el sistema debe re-cortar o descartar la muestra; no corrige el recorte en sí.
- Sensible a la normalización de entrada: requiere normalización per-image (media y desviación estándar de la imagen), no la normalización SigLIP utilizada por el modelo padre. Alimentarlo con tensores normalizados con SigLIP degrada su rendimiento silenciosamente.
- Precisión limitada: con una precisión del 81,55%, existe un margen de falsos positivos (aceptar recortes malos) y falsos negativos (rechazar recortes buenos). En la simulación, el gate rechazó el 52% de las entradas, lo que puede reducir la cobertura del sistema.
- Sin información sobre sesgos: no se documentan posibles sesgos relacionados con tipos de prenda, colores, texturas o condiciones de iluminación.
- Limitado a imágenes RGB de 64×64 píxeles; no soporta otros formatos ni resoluciones.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo depende del modelo padre `garment-attributes` (licencia Apache-2.0), que tiene sus propias condiciones.
- No se especifican los datos de entrenamiento ni el proceso de entrenamiento, lo que dificulta evaluar su robustez en dominios distintos a Fashionpedia.
- La evaluación se realizó sobre Fashionpedia val2020; el rendimiento en otros conjuntos de datos de moda puede variar.

## Enlaces

- [Modelo en Hugging Face: resoa/garment-crop-gate-nano](https://huggingface.co/resoa/garment-crop-gate-nano)
- [Modelo padre: resoa/garment-attributes](https://huggingface.co/resoa/garment-attributes)
- [Perfil del autor: resoa](https://huggingface.co/resoa/models)
