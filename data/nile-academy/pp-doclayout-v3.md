# nile-academy/pp-doclayout-v3

## Resumen

pp-doclayout-v3 es un espejo de pesos publicado por nile-academy bajo el paraguas de Wekala, cuyo origen real es PP-DocLayoutV3 de PaddlePaddle. No se trata de un modelo de lenguaje generativo, sino de un modelo de análisis de maquetación de documentos (document layout analysis) orientado a pipelines de OCR: identifica y clasifica regiones como bloques de texto, tablas, figuras o títulos sobre una imagen de página. El repositorio conserva los checkpoints declarativos originales (ONNX y safetensors) fijados a commits concretos del upstream, sin incluir código de inferencia, servidores ni checkpoints en pickle.

El interés práctico del artefacto es la trazabilidad: cada fichero está anclado a una identidad inmutable del repositorio original de PaddlePaddle, con las model cards originales preservadas bajo `original/<source-commit>/`. Esto resulta útil para equipos que necesitan auditar la procedencia de los pesos en entornos regulados, pero no aporta ninguna mejora funcional sobre el modelo upstream.

La información publicada no incluye arquitectura detallada, número de parámetros, resolución de entrada ni métricas de precisión. La model card advierte explícitamente que la publicación verifica identidades de ficheros, no la exactitud OCR, la fidelidad de cuantización ni la adecuación a dispositivos, y que los metadatos de idioma no acreditan calidad probada en ninguna lengua.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de layout analysis de la familia PP-DocLayoutV3 de PaddlePaddle) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión sobre imagen de página, no de texto) |
| Tipos de cuantizacion | no disponible; se distribuyen checkpoints ONNX y safetensors originales, sin perfiles de cuantización publicados |
| Idiomas soportados | en, multilingual, zh (según metadatos; la model card indica que no se establece calidad probada) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX y safetensors (checkpoints Paddle originales conservados por separado) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna en la documentación proporcionada. Por la naturaleza del modelo (PP-DocLayoutV3) se trata de un detector de regiones de maquetación sobre imágenes de documentos, pero el repositorio no detalla el backbone, la resolución de entrada, el número de clases de layout ni la estrategia de detección. Tampoco se publican datos de entrenamiento: ni volumen de páginas, ni composición del dataset, ni si hubo ajuste fino supervisado con anotaciones de layout.

La innovación del repositorio no es técnica sobre el modelo, sino de gobernanza de artefactos: checkpoints anclados a commits (`46bbdf18`, `241f8bdf`, `e4f489dc`), separación entre exportaciones ONNX oficiales y checkpoints Paddle originales, preservación de las licencias upstream y exclusión deliberada de código ejecutable, pickles y servidores de inferencia. Cualquier conversión o adaptador de despliegue debe cualificarse por separado.

## Capacidades

- Análisis de maquetación de documentos: detección y clasificación de regiones (texto, tablas, figuras, títulos) sobre imágenes de página, según la función esperada de PP-DocLayoutV3.
- Integración en pipelines OCR: actúa como etapa previa de segmentación antes del reconocimiento de texto.
- Procesamiento multilingüe a nivel de documento: los metadatos declaran en, multilingual y zh, sin garantía de calidad probada.
- Distribución en dos formatos: ONNX para runtimes portables y safetensors para carga en frameworks compatibles.
- No incluye generación de texto, tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo thinking.
- No incluye código de inferencia, servidores ni adaptadores: el consumidor debe aportar el runtime.

## Casos de uso

- Digitalización de archivos administrativos: usar el modelo como primer paso para segmentar páginas escaneadas en bloques y enviar cada bloque de texto a un motor OCR, reduciendo errores de lectura en columnas múltiples.
- Extracción de tablas en informes financieros: detectar la región de tabla para recortarla y procesarla con un extractor específico, en lugar de pasar la página completa al OCR.
- Pipeline de ingesta documental en entorno regulado: aprovechar el anclaje a commits inmutables y la licencia Apache-2.0 para auditorías de procedencia de pesos antes de desplegar en producción.
- Procesamiento de documentos mixtos en chino e inglés: aplicar el modelo a páginas con contenido bilingüe y validar empíricamente la calidad por idioma, dado que los metadatos no la garantizan.
- Despliegue en edge o navegador mediante ONNX: exportar el checkpoint ONNX a un runtime ligero para preprocesar documentos en cliente sin depender de la nube, ya que la model card indica que no se selecciona fallback en la nube.
- Reconstrucción de orden de lectura: usar las cajas de layout para ordenar bloques antes de alimentar un sistema de resumen o indexación de documentos escaneados.
- Evaluación comparativa interna: servir como referencia upstream fijada para comparar variantes propias de layout analysis contra el modelo original de PaddlePaddle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repo es de 0,4 GB, lo que sugiere un modelo compacto, pero no se publican parámetros ni resolución de entrada para calcular memoria de activaciones.
- GPU recomendadas: no disponible. Por el tamaño del artefacto, es plausible su ejecución en GPU consumer, pero no hay datos que lo confirmen.
- Compatibilidad con GPU consumer: no confirmada; la model card indica que la publicación no verifica el ajuste a dispositivo (device fit).
- Opciones de despliegue: ONNX Runtime para el checkpoint ONNX; safetensors requiere un framework compatible con la arquitectura PP-DocLayoutV3. No se incluyen servidores ni adaptadores; vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nile-academy/pp-doclayout-v3 | Layout analysis (espejo) | no disponible | no aplica | Apache-2.0 | Hugging Face, ONNX y safetensors |
| PaddlePaddle/PP-DocLayoutV3 | Layout analysis (upstream) | no disponible | no aplica | Apache-2.0 (según declaración upstream) | Hugging Face, pesos Paddle |
| PaddlePaddle/PP-DocLayoutV3_onnx | Layout analysis (export ONNX oficial) | no disponible | no aplica | Apache-2.0 (según declaración upstream) | Hugging Face, ONNX |
| PaddlePaddle/PP-DocLayoutV3_safetensors | Layout analysis (export safetensors oficial) | no disponible | no aplica | Apache-2.0 (según declaración upstream) | Hugging Face, safetensors |

No se dispone de información sobre otros modelos de layout analysis comparables (por ejemplo, de otras familias) en la documentación proporcionada.

## Limitaciones y advertencias

- Es un espejo, no un desarrollo propio: cualquier corrección o mejora debe provenir del upstream de PaddlePaddle.
- La publicación no verifica exactitud OCR, fidelidad de cuantización, ajuste a dispositivo ni aceptación en escritorio, móvil o navegador.
- Los metadatos de idioma (en, multilingual, zh) no acreditan calidad probada en ninguna lengua; la validación por idioma corre a cargo del consumidor.
- No se incluye código Python, checkpoints en pickle, servidores de inferencia ni código ejecutable; un modelo solo de fuentes requiere conversión y adaptador cualificados por separado.
- El soporte de árabe se declara preferente pero no es un criterio de elegibilidad del modelo; no hay evidencia de calidad en árabe.
- No se selecciona fallback en la nube: el despliegue debe resolverse con activos aprobados y adaptadores compilados.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos o negativos en la detección de regiones, sin métricas publicadas para cuantificarlo.
- Sesgos conocidos: no disponibles; al no publicarse composición del dataset de entrenamiento, no puede evaluarse el sesgo por tipo de documento o idioma.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribución al upstream; el repositorio no inventa titulares de copyright.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado: no hay evidencia de uso en producción por terceros.

## Enlaces

- Repositorio del espejo: https://huggingface.co/nile-academy/pp-doclayout-v3
- Upstream ONNX: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_onnx/tree/46bbdf188bb0a772c08aed74882ce7e51a8f1ea6
- Upstream Paddle: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3/tree/241f8bdfc77a7c7bee915a5057aaee58c235a8d3
- Upstream safetensors: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_safetensors/tree/e4f489dc536556fc1be02b973ba06756e0d4a2ac
