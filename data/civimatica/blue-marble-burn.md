# Civimatica/blue-marble-burn

## Resumen

Blue Marble Burn es un modelo de segmentación de imágenes orientado a observación de la Tierra y teledetección, publicado en Hugging Face por Civimatica bajo el identificador `Civimatica/blue-marble-burn`. El modelo se distribuye en formato ONNX y safetensors, con variantes cuantizadas en int8, y está etiquetado explícitamente para despliegue en el borde (edge AI) sobre imágenes de satélite Sentinel-2. La tarea declarada en el pipeline es `image-segmentation`, lo que sugiere un uso orientado a la delimitación de áreas quemadas o superficies afectadas por incendios a partir de escenas multiespectrales.

Civimatica se presenta como un proveedor de modelos de IA física para el entorno urbano, con acceso a datos y verdad de campo obtenidos de mediciones reales en calle. Blue Marble Burn encaja en esa línea de trabajo de teledetección aplicada, aunque la ficha pública del modelo no aporta detalles sobre arquitectura, tamaño, datos de entrenamiento ni métricas de evaluación.

El modelo es relevante por su enfoque de despliegue ligero (ONNX, int8, edge) sobre datos Sentinel-2, un caso de uso con demanda creciente en monitorización medioambiental y respuesta ante incendios. No obstante, la ausencia de documentación técnica publicada limita seriamente cualquier evaluación rigurosa de su calidad o idoneidad para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | int8 (según tags); otras no disponibles |
| Idiomas soportados | no disponible (modelo de imagen, sin componente textual documentado) |
| Licencia | Apache 2.0 (según tag `license:apache-2.0`); el campo de licencia de la ficha figura como no disponible |
| Formato de pesos | ONNX y safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. Los tags indican compatibilidad con el framework Burn (Rust) y exportación a ONNX, lo que apunta a un diseño pensado para inferencia eficiente y portable, posiblemente con cuantización int8 para reducir requisitos de cómputo en dispositivos de borde. No se especifica si se trata de una CNN, un transformer de visión o una arquitectura híbrida.

Tampoco hay datos sobre el volumen de entrenamiento, la composición del dataset, el uso de datos Sentinel-2 en las distintas bandas espectrales, ni sobre procesos de ajuste fino, aumento de datos o validación con verdad de campo. La única referencia contextual es la propuesta de Civimatica de entrenar sobre datos medidos en entorno real, pero no se traslada a detalles verificables del modelo.

## Capacidades

- Segmentación de imágenes: pipeline declarado `image-segmentation`, orientado a la delimitación de áreas quemadas o superficies afectadas.
- Teledetección con Sentinel-2: los tags indican uso previsto sobre imágenes del satélite Sentinel-2.
- Despliegue en el borde: tags `edge-ai` e `int8` sugieren optimización para inferencia en dispositivos con recursos limitados.
- Exportación a ONNX: permite integración en runtimes multiplataforma (ONNX Runtime, etc.).
- Compatibilidad con Burn: framework de deep learning en Rust, útil para despliegues nativos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (modelo de visión).
- Modo thinking, visión general, audio: no disponible; solo se documenta segmentación de imágenes de satélite.

## Casos de uso

- Monitorización de incendios forestales: el modelo puede aplicarse a escenas Sentinel-2 para generar máscaras de área quemada y alimentar sistemas de alerta temprana o evaluación de daños, siempre que se valide su precisión con datos locales.
- Cartografía de cicatrices de fuego: generación de capas geoespaciales de superficies afectadas para planificación de restauración y análisis post-incendio.
- Despliegue en el borde: gracias a la exportación ONNX e int8, puede ejecutarse en estaciones terrestres o dispositivos con GPU modesta para preprocesar imágenes antes de enviarlas a la nube.
- Integración en pipelines de teledetección: uso como etapa de segmentación dentro de flujos que ingieren productos Sentinel-2 y producen mapas temáticos.
- Investigación en cambio climático: cuantificación de superficies quemadas a lo largo del tiempo para estudios de tendencias, condicionada a una validación independiente.
- Prototipado en Rust: al ser compatible con Burn, puede servir para experimentar con inferencia nativa en aplicaciones de escritorio o sistemas embebidos.
- Evaluación comparativa de modelos de segmentación: útil como referencia en experimentos académicos, aunque la falta de métricas publicadas limita su valor comparativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al no conocerse el número de parámetros ni la resolución de entrada, no es posible estimar con rigor.
- GPU recomendadas: no disponible. La orientación a edge AI e int8 sugiere que el modelo está pensado para hardware modesto, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probable según el enfoque edge, pero no confirmada por documentación.
- Opciones de despliegue: ONNX Runtime (formato ONNX), Burn (Rust), y cualquier runtime compatible con safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Civimatica/blue-marble-burn | Segmentación de imágenes Sentinel-2 | no disponible | no aplica | Apache 2.0 (tag) | Hugging Face, ONNX/safetensors |
| Alternativas de segmentación de áreas quemadas | Segmentación | no disponible | no aplica | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría. No se han identificado en la búsqueda web modelos comparables con especificaciones públicas.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre arquitectura, datos de entrenamiento ni evaluación, lo que impide verificar su calidad.
- Sin benchmarks publicados: no se puede confirmar su precisión en la tarea de segmentación de áreas quemadas.
- Riesgo de alucinación y falsos positivos: como todo modelo de segmentación, puede producir máscaras incorrectas, especialmente en escenas con nubes, sombras o superficies con firma espectral similar.
- Sesgos desconocidos: al no conocerse la distribución del dataset de entrenamiento, no se puede evaluar su sesgo geográfico, estacional o de sensor.
- Licencia: el tag indica Apache 2.0, pero el campo de licencia de la ficha figura como no disponible; conviene verificar antes de uso comercial.
- Idiomas: no aplica, pero la ausencia de documentación sobre resolución de entrada, bandas espectrales y preprocesado dificulta su uso correcto.
- Madurez: cero descargas y cero likes en el momento de la consulta, lo que sugiere un modelo recién publicado o sin validación por la comunidad.
- Uso en producción: no recomendable sin una validación independiente con datos propios y una revisión de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/Civimatica/blue-marble-burn
- Civimatica, página principal: https://www.civimatica.com/
- Civimatica, modelos: https://www.civimatica.com/models
