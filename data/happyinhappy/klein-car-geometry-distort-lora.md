# happyinhappy/klein-car-geometry-distort-lora

## Resumen

El modelo `happyinhappy/klein-car-geometry-distort-lora` es un LoRA de corrección geométrica para imágenes de automóviles, desarrollado por la ingeniera de ML Anastasiia Butova (usuario `happyinhappy`). Está diseñado para resolver un problema específico de composición fotográfica: cuando un vehículo se inserta en una escena y su geometría, lente o iluminación no concuerdan con el entorno, este LoRA corrige la forma del coche manteniendo intacto cada píxel del fondo. Es la contrapartida de otro LoRA del mismo autor, `klein-car-geometry-restore-lora`, que en lugar de corregir el objeto deforma el espacio para adaptarlo a él.

El modelo se basa en FLUX.2 Klein 9B, con un rango (rank) de 64 y alpha 64. Los pesos no están publicados; se pueden solicitar al autor bajo la licencia `card-only-weights-on-request`. El entrenamiento se realizó con pares fabricados artificialmente, distorsionando coches recortados de otras imágenes y pegándolos sobre placas limpias. Aunque la corrección geométrica funciona, el modelo presenta una deriva de identidad severa (cambia colores y libreas), lo que lo hace inadecuado para uso en producción. El autor lo reconoce explícitamente y lo ha descartado en favor de su modelo hermano.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre FLUX.2 Klein (base 9B) |
| Parametros totales | no disponible (7 checkpoints de 331.379.648 bytes cada uno) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, no de texto) |
| Licencia | card-only-weights-on-request (pesos no publicados, bajo petición) |
| Formato de pesos | no disponible (checkpoints de 331 MB, formato no especificado) |

## Arquitectura y entrenamiento

El LoRA se entrena sobre el modelo base FLUX.2 Klein 9B, un modelo de difusión de última generación. El rango (rank) y alpha son ambos 64. El entrenamiento se realizó desde cero (no como continuación de una ejecución anterior) con una ejecución identificada como `bgreplace_klein9b_geometry_crosslight_geomstrong_scratch_l800_20260704T163557Z`. Se generaron siete checkpoints en los pasos 500, 1000, 1500, 1750, 1800, 1900 y 2000, cada uno de 331 MB. El conjunto de entrenamiento se construyó artificialmente: se recortó un coche de una imagen con fondo reemplazado usando máscaras SAM3, se distorsionó con seis familias de deformación deterministas (lens_barrel, lens_pinch, persp_left, persp_right, persp_wide, persp_tall) y se pegó sobre una placa limpia sin coche del fotograma objetivo. La fuerza de distorsión variaba entre 0.55 y 1.05 según la variante. El predecesor de esta ejecución usó 14.538 pares. El entrenamiento se detuvo en el paso 2000 y el conjunto de datos se eliminó posteriormente, aunque es regenerable a partir de las fuentes originales.

## Capacidades

- Corrección de geometría de vehículos en imágenes compuestas: corrige distorsiones de lente (barril y pellizco) y de perspectiva (horizontal y vertical) en el cuerpo del coche.
- Mantiene el fondo intacto: la placa de fondo no se modifica en absoluto, solo se ajusta el objeto.
- Funciona sobre imágenes de automóviles en escenas de interior o exterior, siempre que la distorsión pertenezca a una de las seis familias entrenadas.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso: es exclusivamente un modelo de transformación de imagen a imagen.
- No tiene capacidades multilingües ni de texto: la entrada y salida son imágenes.
- No incluye modo de pensamiento ni capacidades de visión adicionales más allá de la corrección geométrica.

## Casos de uso

- Retoque de fotografías de catálogo de coches usados: un concesionario podría usar el modelo para corregir la geometría de un vehículo fotografiado con un gran angular, pero la deriva de identidad (cambio de color) lo hace inviable para este fin, como admite el propio autor.
- Composición de vehículos en escenas virtuales: al insertar un coche en un fondo generado, el LoRA puede ajustar la forma del vehículo para que parezca más natural, siempre que el color y la librea no sean críticos.
- Preprocesamiento para otros modelos de generación: se podría usar como paso intermedio para normalizar la geometría de un coche antes de aplicar otros filtros o estilos, aunque la pérdida de identidad limita su utilidad.
- Investigación académica sobre corrección geométrica en modelos de difusión: el modelo y su documentación detallada sirven como caso de estudio sobre los límites de los LoRA para tareas de edición precisa.
- Comparación de enfoques: junto con su modelo hermano, permite estudiar la diferencia entre corregir el objeto o el fondo en una composición, y los costes de cada opción.
- Generación de variantes de vehículos: si el objetivo es crear versiones distorsionadas de un coche para entrenar otros modelos, este LoRA podría usarse para producir deformaciones controladas, aunque no es su propósito principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas como PSNR, SSIM o FID, ni comparaciones con otros modelos. El autor solo proporciona una evaluación visual cualitativa que muestra la corrección geométrica exitosa pero la deriva de identidad.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM ni de GPU en la documentación.
- Al estar basado en FLUX.2 Klein 9B, se requiere una GPU con suficiente memoria para ejecutar el modelo base de 9B parámetros. Como referencia general, los modelos de difusión de este tamaño suelen necesitar al menos 24 GB de VRAM en FP16, pero este dato no está confirmado para este caso.
- El LoRA en sí añade un overhead mínimo (331 MB por checkpoint), por lo que el requisito principal es el del modelo base.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.). Al ser un modelo de imagen con diffusers, se podría usar con la librería `diffusers` de Hugging Face, pero no hay instrucciones de despliegue en la model card.
- No se indican latencias ni throughput.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Rango/Alpha | Licencia | Estado |
|---|---|---|---|---|---|
| `happyinhappy/klein-car-geometry-distort-lora` | FLUX.2 Klein 9B | Corregir geometría del coche, fondo intacto | 64/64 | card-only-weights-on-request | No promovido (deriva de identidad) |
| `happyinhappy/klein-car-geometry-restore-lora` | FLUX.2 Klein 9B | Deformar el fondo para adaptarse al coche | no disponible | card-only-weights-on-request | En uso (según el autor) |

No se dispone de información sobre otros LoRA similares en el mercado para comparar. El modelo hermano es la única referencia directa, y ambos abordan el mismo problema desde lados opuestos.

## Limitaciones y advertencias

- Deriva de identidad: el defecto bloqueante. El modelo cambia el color y la librea del vehículo (por ejemplo, un Challenger negro se vuelve azul marino, un Civic pierde su librea rosa). Esto lo hace inutilizable para aplicaciones comerciales donde el color exacto es crítico.
- Solo corrige el objeto, no el fondo: si la escena de fondo es incorrecta, el modelo no la ajusta.
- Entrenado únicamente en seis familias de distorsión: cualquier deformación fuera de ese rango (por ejemplo, abolladuras o daños físicos) queda fuera de distribución.
- Es generativo, no medible: el coche devuelto es una interpretación plausible de la forma, no una medición geométrica exacta del vehículo original.
- Los pesos no están publicados: solo se pueden obtener contactando al autor, lo que limita la reproducibilidad y el uso independiente.
- El conjunto de entrenamiento fue eliminado: aunque es regenerable, no está disponible públicamente.
- No apto para producción: el propio autor lo descartó en favor de su modelo hermano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/happyinhappy/klein-car-geometry-distort-lora
- Modelo hermano (corrección del fondo): https://huggingface.co/happyinhappy/klein-car-geometry-restore-lora
- Sitio web del autor: https://happyin.work/mashinki/
- GitHub del autor: https://github.com/AnastasiyaW
- Telegram del autor: https://t.me/happy_in_happy
