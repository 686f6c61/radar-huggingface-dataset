# LibreYOLO/LibreDepthPro2b-depth

## Resumen

LibreDepthPro2b-depth es un paquete de pesos para estimación de profundidad métrica a partir de una sola imagen y de vídeo en streaming, publicado por LibreYOLO. El modelo no entrena pesos nuevos: empaqueta los checkpoints originales de Apple `apple/DepthPro2-B` (Depth Pro 2, un ViT-B/16 basado en DINOv3) junto con el estimador de distancia focal `apple/DepthPro2-focal`, ambos en formato de checkpoint LibreYOLO v1.0 con la tarea declarada como `depth`. El repositorio ocupa aproximadamente 0,5 GB y se distribuye con la librería `libreyolo`.

La relevancia del paquete es de ingeniería: unifica en un único artefacto el modelo de profundidad y el estimador de campo de visión que Depth Pro 2 necesita para producir profundidad métrica (en metros) sin conocer de antemano los intrínsecos de la cámara. La conversión declara paridad de inferencia bit a bit con el código y los pesos originales de Apple, y añade metadatos de checkpoint para que el runtime de LibreYOLO pueda cargar el modelo con una sola llamada.

La advertencia principal es la licencia: los pesos están sujetos al Apple Machine Learning Research Model License Agreement (`apple-amlr`), que limita uso, modificación y redistribución exclusivamente a fines de investigación no comercial. No están cubiertos por la licencia MIT de LibreYOLO ni pueden emplearse en productos o servicios comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión ViT-B/16 (DINOv3) para profundidad, más estimador de distancia focal auxiliar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible (el repo publica pesos en formato de checkpoint LibreYOLO; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement), solo investigación no comercial |
| Formato de pesos | Checkpoint LibreYOLO v1.0 (`.pt`) con estado de profundidad y estado focal bajo el prefijo `fov.*`; los originales de Apple son `model.safetensors` |
| Tarea | `depth-estimation` (profundidad métrica en metros) |
| Modelos base | `apple/DepthPro2-B` y `apple/DepthPro2-focal` |
| Tamano del repositorio | 0,5 GB |
| Libreria | `libreyolo` |

## Arquitectura y entrenamiento

El modelo es un estimador de profundidad monocular basado en un backbone ViT-B/16 de la familia DINOv3, según indica la model card. Depth Pro 2 produce mapas de profundidad métrica, es decir, distancias en metros en lugar de profundidad relativa, y devuelve además los intrínsecos de cámara en formato OpenCV de 3x3. Para resolver la ambigüedad de escala que introduce una cámara desconocida, el paquete incorpora el estimador de distancia focal `apple/DepthPro2-focal` como componente auxiliar, cuyos tensores se guardan bajo el prefijo `fov.*` en el checkpoint combinado.

LibreYOLO no ha modificado ningún parámetro aprendido: todos los tensores de `apple/DepthPro2-B` y `apple/DepthPro2-focal` se conservan sin cambios y la paridad de inferencia se verificó contra el código de referencia de Apple. Las únicas modificaciones son el empaquetado conjunto de ambos state dicts y la adición de metadatos de checkpoint v1.0 con `task="depth"`. Los pesos de origen están fijados a revisiones concretas: `85e67fdfb7f5b36a6f6c4495e6789d331b1d8a04` para el checkpoint de profundidad y `622659d44a2002cf9ae4333f2569afa938290d9a` para el focal, con hashes SHA-256 publicados. No se detallan en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o ajuste por preferencias.

## Capacidades

- Estimación de profundidad métrica a partir de una única imagen, con salida en metros.
- Estimación de profundidad en vídeo en streaming, según los tags del repositorio (`video-depth`).
- Predicción de intrínsecos de cámara (matriz 3x3 en convención OpenCV) gracias al estimador de distancia focal integrado.
- Manejo de píxeles de cielo mediante valores infinitos en el mapa de profundidad, tal como documenta el ejemplo de uso.
- Integración con el runtime de LibreYOLO mediante una API de una sola llamada (`LibreYOLO(...).predict(...)`).
- No se documentan capacidades de texto, código, matemáticas, tool calling, agentes ni multilingüismo, coherentes con un modelo puramente visual.

## Casos de uso

- Investigación en visión por computador: reproducción de experimentos de profundidad métrica monocular con paridad bit a bit respecto a los pesos de Apple, útil para comparativas académicas y validación de metodologías.
- Reconstrucción 3D y fotogrametría a pequeña escala: el mapa de profundidad en metros junto con los intrínsecos predichos permite generar nubes de puntos y mallas sin calibración previa de la cámara.
- Procesamiento de vídeo en streaming para investigación: el tag `video-depth` y la estimación de campo de visión por fotograma facilitan experimentos de profundidad temporal en secuencias sin metadatos de calibración.
- Robótica y navegación en entornos de laboratorio: la profundidad métrica directa simplifica la planificación de trayectorias y la evitación de obstáculos en prototipos académicos, siempre dentro del ámbito no comercial.
- Realidad aumentada y efectos visuales en proyectos de investigación: la combinación de profundidad e intrínsecos permite insertar objetos virtuales con coherencia de escala y perspectiva.
- Docencia y formación: el paquete simplifica la carga del modelo con una única dependencia (`libreyolo`) y un único artefacto, lo que reduce la fricción en cursos y talleres sobre estimación de profundidad.
- Evaluación comparativa de modelos de profundidad: al conservar los pesos originales y publicar hashes, sirve como referencia reproducible frente a otros estimadores monoculares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara paridad de inferencia bit a bit con los pesos originales de Apple, sin cifras de error de profundidad (AbsRel, RMSE), latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 0,5 GB, lo que da una cota inferior orientativa para los pesos, pero no se especifica el consumo real en memoria.
- GPU recomendadas: no disponible. Al tratarse de un ViT-B/16, es plausible que quepa en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: el runtime documentado es `libreyolo` mediante `LibreYOLO("LibreDepthPro2b-depth.pt")`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreDepthPro2b-depth | no disponible (ViT-B/16) | imagen única y vídeo | profundidad métrica + intrínsecos | apple-amlr, solo investigación | Hugging Face, formato LibreYOLO |
| apple/DepthPro2-B | no disponible (ViT-B/16) | imagen única | profundidad métrica | apple-amlr | Hugging Face, safetensors |
| apple/DepthPro2-focal | no disponible | imagen única | distancia focal / campo de visión | apple-amlr | Hugging Face, safetensors |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas de otros desarrolladores en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos están bajo `apple-amlr` y solo pueden usarse, modificarse y redistribuirse para investigación no comercial. Queda prohibida su explotación comercial, el desarrollo de productos y su inclusión en cualquier producto o servicio comercial.
- La licencia MIT de LibreYOLO no cubre estos pesos; los usuarios posteriores son responsables del cumplimiento de los términos de Apple.
- Modelo puramente visual: no procesa texto ni ofrece capacidades lingüísticas, de código o de agentes.
- Riesgo de alucinación geométrica: como todo estimador monocular, puede producir profundidades plausibles pero incorrectas en escenas ambiguas, superficies reflectantes, transparencias o texturas repetitivas; no se documentan métricas de error que permitan acotar este riesgo.
- Los píxeles de cielo se representan como infinito, lo que exige un tratamiento explícito en cualquier pipeline posterior (recorte, enmascarado o sustitución).
- No se documentan sesgos conocidos ni cobertura de dominios; tampoco se especifican los idiomas, algo irrelevante en un modelo de visión pero indicativo de la escasez de documentación.
- No hay resultados de benchmarks publicados que permitan validar el rendimiento frente a alternativas.
- El repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que no existe evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreDepthPro2b-depth
- Modelo base de profundidad: https://huggingface.co/apple/DepthPro2-B
- Modelo base focal: https://huggingface.co/apple/DepthPro2-focal
- Código de referencia de Apple: https://github.com/apple-aiml-research/ml-depth-pro-2/tree/aa389cbb0b74341664ed663a0966c859905cd6c0
- Licencia del modelo de Apple: https://github.com/apple-aiml-research/ml-depth-pro-2/blob/aa389cbb0b74341664ed663a0966c859905cd6c0/LICENSE_MODEL
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
