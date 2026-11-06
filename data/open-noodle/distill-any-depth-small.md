# open-noodle/distill-any-depth-small

## Resumen

Distill-Any-Depth Small (ONNX) es una exportación a formato ONNX del modelo de estimación de profundidad monocular Distill-Any-Depth Small, desarrollado originalmente por xingyang1 y publicado en el artículo arXiv:2502.19204. Esta versión concreta la mantiene el proyecto open-noodle dentro de su repositorio Gallery, una aplicación de visualización de escenas espaciales, y su propósito es servir de motor de inferencia para generar mapas de profundidad en dicha aplicación.

El modelo resuelve la tarea de estimación de profundidad monocular (depth-estimation): a partir de una única imagen RGB produce un mapa de disparidad o profundidad inversa relativa, donde valores mayores indican mayor cercanía a la cámara. No se trata de un modelo generativo de lenguaje, sino de un modelo de visión por computador especializado, por lo que su evaluación debe hacerse en términos de calidad del mapa de profundidad y no de capacidades textuales.

La relevancia de esta ficha radica en que documenta una exportación ONNX lista para producción, con dos variantes de pesos (fp32 y int8 dinámico) y un contrato de inferencia bien definido. El repositorio ocupa 0,1 GB y la licencia es MIT, lo que facilita su integración en pipelines de visión sin restricciones comerciales. No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica) ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de profundidad monocular; arquitectura interna del modelo base no detallada en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp32 y int8 dinámico (pesos) |
| Idiomas soportados | no disponible (no aplica; entrada visual) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Distill-Any-Depth Small más allá de que se trata de un estimador de profundidad monocular. El artículo de referencia es arXiv:2502.19204, pero la model card de esta exportación no reproduce sus detalles de entrenamiento, número de tokens, composición del dataset ni si se emplearon técnicas de destilación o ajuste fino concretas. El nombre "Distill" sugiere un proceso de destilación desde un modelo mayor, pero este extremo no se confirma en la documentación proporcionada.

La innovación técnica documentada en esta exportación es de carácter práctico: se ha modificado únicamente el redimensionado final de la cabeza de profundidad, convirtiéndolo en un factor de escala para que las dimensiones de altura y anchura permanezcan dinámicas en el grafo ONNX. El resto de los pesos se exporta sin modificar. El modelo se distribuye en dos ficheros: `depth/model.onnx` (fp32, opset 18) y `depth/model_int8.onnx` (pesos int8 dinámicos, pensado para CPU). La exportación se realizó mediante el script `machine-learning/depth-model-export/export.py` del repositorio Gallery.

## Capacidades

- Estimación de profundidad monocular a partir de una imagen RGB.
- Salida de profundidad inversa relativa (disparidad): valores mayores indican mayor cercanía, sin escala absoluta fija.
- Entrada con altura y anchura dinámicas, siempre que sean múltiplos de 14.
- Preprocesado definido: RGB escalado a 0..1 y normalizado con media ImageNet `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`.
- Dos variantes de inferencia: fp32 para máxima fidelidad e int8 dinámico para CPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Reconstrucción de escenas espaciales en Gallery: el modelo genera los mapas de profundidad que alimentan la visualización de escenas espaciales del repositorio open-noodle/gallery, su caso de uso original y principal.
- Generación de mapas de profundidad para efectos de desenfoque selectivo: a partir de la disparidad relativa se puede separar primer plano y fondo para aplicar bokeh sintético en postproducción fotográfica.
- Preprocesado para pipelines de visión 3D: los mapas de profundidad relativa sirven como entrada auxiliar en tareas de reconstrucción, segmentación o detección que aprovechan información geométrica.
- Prototipado en CPU sin GPU: la variante int8 dinámica permite ejecutar la inferencia en servidores sin acelerador, útil para demos y entornos de CI.
- Integración en aplicaciones web o de escritorio mediante ONNX Runtime: el formato ONNX y el contrato de entrada/salida bien definido facilitan el despliegue multiplataforma.
- Automatización de flujos de análisis de imágenes en lote: al aceptar dimensiones dinámicas (múltiplos de 14), se puede procesar un conjunto heterogéneo de imágenes redimensionando el lado corto a 518 como hace Gallery.
- Investigación y comparación de estimadores de profundidad: al ser una exportación fiel del modelo base, sirve para reproducir resultados del artículo en entornos ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión al desconocerse el número de parámetros; el repositorio completo ocupa 0,1 GB, lo que sugiere un modelo pequeño que probablemente cabe en GPUs de consumo, pero este extremo no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; la existencia de una variante int8 para CPU indica que el modelo está pensado para ejecutarse sin acelerador en al menos un modo.
- Opciones de despliegue: ONNX Runtime (formato nativo), con dos variantes de pesos (fp32 e int8 dinámico).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de estimación de profundidad que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La salida es profundidad inversa relativa (disparidad) sin escala absoluta: no sirve directamente para mediciones métricas de distancia sin calibración adicional.
- Las dimensiones de entrada deben ser múltiplos de 14; otras resoluciones requieren redimensionado previo.
- La variante int8 está indicada únicamente para CPU según la model card; su uso en GPU no está documentado.
- No se dispone de información sobre sesgos del modelo base, calidad en dominios específicos ni robustez ante imágenes fuera de distribución.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de mapas de profundidad incorrectos en escenas ambiguas o sin referencias geométricas claras.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo base xingyang1/Distill-Any-Depth-Small-hf y del artículo asociado.
- El modelo tiene 15 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y poca validación comunitaria.
- La fecha de creación del repositorio (2026-10-30) es posterior a la fecha actual en muchos entornos; conviene verificar la vigencia y procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-noodle/distill-any-depth-small
- Modelo base: https://huggingface.co/xingyang1/Distill-Any-Depth-Small-hf
- Artículo de referencia: https://arxiv.org/abs/2502.19204
- Repositorio Gallery: https://github.com/open-noodle/gallery
