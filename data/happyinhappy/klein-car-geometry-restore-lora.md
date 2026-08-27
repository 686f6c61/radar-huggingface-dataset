# happyinhappy/klein-car-geometry-restore-lora

## Resumen

El modelo `happyinhappy/klein-car-geometry-restore-lora` es un adaptador LoRA (Low-Rank Adaptation) diseñado para corregir las distorsiones geométricas que introduce la inserción generativa de coches en escenas sintéticas. Desarrollado por Anastasiia Butova (usuario happyinhappy), este LoRA se integra en un pipeline de producción llamado "mashinki" para catálogos de automóviles, donde un modelo de difusión coloca un vehículo en un entorno generado y este adaptador repara las imperfecciones sutiles —líneas de puerta torcidas, ruedas ovaladas, estiramientos de carrocería— que un ojo experto detecta de inmediato.

El adaptador se basa en el modelo de difusión FLUX.2 Klein 9B de Black Forest Labs y se entrenó con una estrategia de aumento de datos que genera deliberadamente dos variantes deformadas de cada escena, enseñando al modelo a restaurar la geometría original. Con 224 tensores LoRA y un tamaño de 158 MB, el checkpoint final (paso 2000) se obtuvo continuando desde un entrenamiento previo de reemplazo de fondo y reiluminación, lo que le permite heredar el conocimiento sobre coches, salas y luz. Es importante destacar que los pesos no están publicados: la tarjeta del modelo es solo informativa y el adaptador se ejecuta exclusivamente dentro del pipeline propietario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre FLUX.2 Klein 9B (modelo de difusión) |
| Parametros totales | no disponible (el adaptador ocupa 158 MB, el modelo base tiene 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de texto) |
| Licencia | card-only-weights-not-released (solo tarjeta, pesos no publicados) |
| Formato de pesos | no disponible (los pesos no se distribuyen) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre el modelo de difusión FLUX.2 Klein 9B, entrenado con la herramienta ai-toolkit (versión 0.9.13). La estrategia de entrenamiento es particular: como no existe un dataset de "la misma inserción, una vez deformada y otra correcta", se fabrica la mitad deformada. Para cada escena se generan dos warps diferentes (perspectiva forzada, geometría doblada) que actúan como entrada, mientras que la fotografía original sin deformar sirve como objetivo. Esto permite que el modelo aprenda una familia de distorsiones en lugar de memorizar una transformación única.

El entrenamiento se inició desde el checkpoint de un modelo previo de reemplazo de fondo y reiluminación (paso 2750) y se continuó hasta el paso 2000 con el adaptador LoRA. La elección de continuar desde ese punto es deliberada: el modelo de reparación necesita la misma comprensión de coches, salas y luz que el modelo de inserción, y solo entonces se le añade un objetivo diferente. El resultado es un adaptador de 224 tensores y 158 MB que se ejecuta como una segunda pasada tras la inserción del coche.

## Capacidades

- Restauración de geometría en imágenes de coches insertados en escenas generadas, corrigiendo deformaciones sutiles como líneas de puerta torcidas, ruedas ovaladas o estiramientos de carrocería.
- Funciona como un paso de refinamiento dentro de un pipeline de producción, no como un modelo independiente.
- Específico para el tipo de distorsiones que produce el pipeline de inserción de mashinki; no está diseñado para corregir artefactos de otros modelos.
- No tiene capacidades de generación de texto, visión general, tool calling ni agentes; su función es puramente correctiva sobre imágenes.
- No maneja consistencia temporal entre frames; cada imagen se procesa de forma independiente.

## Casos de uso

- Catálogos de automóviles en línea: tras generar un fondo sintético y colocar el coche, el LoRA corrige la geometría para que el vehículo se vea realista y sin deformaciones perceptibles.
- Fotografía de producto automatizada: reduce la necesidad de retoque manual en sesiones donde se usan fondos generados por IA, acelerando el flujo de producción.
- Post-procesado en pipelines de difusión: se integra como una etapa intermedia entre la inserción del objeto y la entrega final, garantizando que las líneas rectas del coche se mantengan.
- Diseño de escaparates virtuales: permite generar imágenes de coches en entornos arquitectónicos generados sin que las distorsiones del modelo de inserción arruinen el resultado.
- Control de calidad en generación de imágenes: aunque el modelo no verifica, su uso reduce la probabilidad de que un humano tenga que corregir manualmente cada imagen.
- Entrenamiento de otros modelos: el adaptador puede servir como referencia para enseñar a otros modelos de reparación geométrica, aunque sus pesos no están disponibles públicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. Dado que el adaptador se ejecuta sobre FLUX.2 Klein 9B, se requiere una GPU con VRAM suficiente para el modelo base (típicamente 16-24 GB para inferencia en FP16), pero no hay datos concretos sobre latencia, throughput ni configuraciones recomendadas. Al ser un LoRA, el coste adicional sobre el modelo base es mínimo, pero al no publicarse los pesos, no se puede desplegar de forma independiente.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables con la misma función específica (restauración de geometría en inserciones de coches) en la información proporcionada. Existen otros LoRAs para corrección de calidad en modelos Klein (por ejemplo, "Klein Anatomy / Quality Fixer" en Civitai), pero no son directamente comparables en tarea ni en metodología.

## Limitaciones y advertencias

- Los pesos no están publicados: la licencia `card-only-weights-not-released` impide el uso del adaptador fuera del pipeline propietario de mashinki.
- El modelo repara pero no verifica: no mide si la geometría resultante es correcta; esa validación corresponde a un paso de aceptación posterior.
- Entrenado exclusivamente para las distorsiones de su pipeline: artefactos generados por otros modelos de inserción están fuera de distribución y el adaptador podría no corregirlos adecuadamente.
- Sin memoria de frames: no tiene en cuenta los otros 29 fotogramas de una secuencia; la consistencia temporal se gestiona en otra parte del sistema.
- Riesgo de invención: si se aplica con demasiada fuerza, el modelo puede suavizar líneas reales de la carrocería que confunde con deformaciones, introduciendo errores nuevos.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma, al tratarse de un modelo de imagen sin procesamiento de texto.

## Enlaces

- HuggingFace: https://huggingface.co/happyinhappy/klein-car-geometry-restore-lora
- Modelo base: black-forest-labs/FLUX.2-klein (no se proporciona URL directa)
- Repositorio ai-toolkit: https://github.com/ostris/ai-toolkit
- Contacto del autor: https://happyin.work/mashinki/ · https://github.com/AnastasiyaW · https://t.me/happy_in_happy
