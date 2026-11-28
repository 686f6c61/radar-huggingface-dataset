# gregbugaj/pagepose

## Resumen

PagePose Qwen3.5-4B Vision es un clasificador de orientación de documentos desarrollado por el usuario gregbugaj. A pesar del nombre, no es un modelo de lenguaje de cuatro mil millones de parámetros: se trata de un fine-tune del codificador visual (vision encoder) y del módulo merger de Qwen/Qwen3.5-4B, al que se le añade un pooling dinámico de recortes de documento y una cabeza de clasificación. El modelo resultante tiene 336.807.692 parámetros totales, de los cuales 333.514.240 corresponden al codificador visual. No carga tokenizador, embeddings de tokens, decodificador de lenguaje ni cabeza de lenguaje.

El modelo resuelve un problema muy concreto: predecir el desplazamiento en sentido horario de una página respecto a la posición vertical, en doce clases de 30 grados (0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300 y 330). Está pensado para usarse como paso previo a OCR, extracción documental o indexación, de forma que el pipeline reciba la página ya enderezada. El runtime devuelve el ángulo detectado, el ángulo de corrección inverso, la confianza, las doce probabilidades de clase y un indicador `orientation_unknown` cuando la confianza cae por debajo de una puerta configurada de 0,80.

Es relevante ahora porque aborda una tarea de preprocesado frecuentemente infravalorada con una arquitectura derivada de un modelo multimodal reciente, y porque declara resultados de precisión muy altos en conjuntos de evaluación públicos y privados. No obstante, el propio autor indica que los pesos finales no se han publicado: la release pública está pendiente de una exportación solo de inferencia, verificación de paridad y aprobaciones explícitas de privacidad, legalidad y derechos de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual y merger de Qwen3.5-4B + pooling dinámico de recortes de documento + cabeza de clasificación |
| Parametros totales | 336.807.692 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificación de imagen, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea es de orientación de imagen, no lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (directorio de artefacto de inferencia con manifiesto de checksums) |

Otros datos técnicos declarados: tamaño de recorte interno de 320 x 320 RGB, carga de trabajo de 16 recortes locales más un recorte global, puerta de confianza de 0,80, revisión fijada del modelo base `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`, huella del dataset `37422683263345a3146f36ea22cbca3be9482073a2434d069cfa7b619c9afbfc` y SHA-256 del checkpoint evaluado `b408171e228beb2449934340cc6dae122dab16c568ee0edd089b012e26d8388b`. El tamaño del repositorio en Hugging Face es de 1,3 GB.

## Arquitectura y entrenamiento

La arquitectura parte del codificador visual y el merger de Qwen3.5-4B, congelados y reutilizados como extractor de características. Sobre esa base, PagePose añade un mecanismo de pooling dinámico de recortes de documento y una cabeza de clasificación de doce clases. El preprocesado interno genera 16 recortes locales más un recorte global, cada uno de 320 x 320 RGB, preservando la relación de aspecto de la página original; el autor advierte explícitamente que no debe aplastarse la página a 320 x 320. No se carga ningún componente lingüístico del modelo base.

El entrenamiento utilizó 539 páginas de documento RGB en posición vertical, revisadas por operadores, procedentes de un corpus privado. La partición fue de 315 páginas para entrenamiento, 113 para validación y 111 para test retenido. La validación y el test evaluaron cada página fuente en las doce rotaciones, mientras que el entrenamiento empleó un calendario de rotación cíclica determinista en línea. El corpus conserva identificadores pseudónimos pero no nombres de fichero originales ni etiquetas del corpus de selección. Se realizó una auditoría de solapamiento que comparó las 539 páginas privadas con 200 páginas de referencia de FUNSD, sin encontrar solapamientos de checksum codificado ni de píxeles RGB decodificados.

## Capacidades

- Clasificación de orientación de documentos en doce clases de 30 grados, devolviendo el desplazamiento en sentido horario respecto a la vertical.
- Cálculo del ángulo de corrección inverso mediante `(-detected_rotation) % 360`.
- Aplicación de la rotación inversa para generar una página enderezada a partir de la imagen de entrada.
- Salida de confianza y de las doce probabilidades de clase, lo que permite umbrales y lógica de rechazo.
- Indicador `orientation_unknown` cuando la confianza es inferior a la puerta configurada de 0,80.
- Aceptación de imágenes raster de documento con dimensiones variables, preservando la relación de aspecto mediante recortes internos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no incluir decodificador de lenguaje.
- No realiza OCR, reconocimiento de escritura, extracción de contenido, clasificación de documentos, deskewing de ángulo arbitrario ni interpretación semántica de la página.

## Casos de uso

- Preprocesado de pipelines OCR: el modelo se coloca como primer paso para detectar y corregir la orientación de cada página escaneada antes de pasarla al motor OCR, evitando errores de reconocimiento causados por páginas giradas.
- Digitalización masiva de archivos: en un proceso por lotes, cada imagen se clasifica y se rota inversamente cuando la confianza supera la puerta de 0,80, dejando las páginas dudosas marcadas con `orientation_unknown` para revisión humana.
- Ingesta documental para indexación y búsqueda: antes de generar embeddings o extraer metadatos, la corrección de orientación garantiza que las representaciones posteriores se calculen sobre páginas en posición correcta.
- Enrutado a revisión manual: el flag `orientation_unknown` permite derivar automáticamente a un operador las páginas con orientación ambigua, reduciendo el coste de revisión al concentrarlo solo en los casos inciertos.
- Integración en aplicaciones de escaneo móvil: el modelo puede enderezar capturas tomadas con el teléfono en ángulos múltiplos de 30 grados antes de mostrarlas o enviarlas a un servicio de extracción.
- Control de calidad en digitalización: comparar la orientación detectada con la esperada en lotes de prueba permite detectar fallos sistemáticos en escáneres o en flujos de captura.
- Limpieza previa a tareas de visión documental: cualquier modelo posterior de layout, tablas o comprensión de documentos se beneficia de recibir páginas ya enderezadas, reduciendo la variabilidad de entrada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el model-index de la model card. Ninguno está marcado como verificado (`verified: false`).

| Tarea | Dataset | Division | Metrica | Valor |
|---|---|---|---|---|
| Clasificación de rotación documental | Curated private held-out pages | test | Exact 12-class accuracy | 96,997 % |
| Clasificación de rotación documental | ORB-En (krutrim-ai-labs/ocr_rotation_bench) | test | Exact 12-class accuracy | 100 % |
| Clasificación de rotación documental | FUNSD+-Test (konfuzio/funsd_plus) | test | Exact 12-class accuracy | 100 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es coherente con la naturaleza del modelo, que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 336,8 millones de parámetros, en precisión de 16 bits los pesos ocuparían aproximadamente 0,67 GB, y en 32 bits unos 1,35 GB, sin contar activaciones ni los recortes de imagen procesados.
- GPU recomendadas: no disponibles en la información proporcionada. El ejemplo de uso de la model card emplea `device="cuda"`.
- Compatibilidad con GPU de consumo: por el tamaño de parámetros, es plausible que quepa en GPU de consumo, pero no se confirma en la información disponible.
- Opciones de despliegue: el modelo no es un `AutoModelForImageClassification` nativo de Transformers y no puede cargarse mediante el pipeline genérico de clasificación de imágenes de Transformers. Se usa mediante el paquete `pagepose` (repositorio en GitHub), con el comando `pagepose-export-artifact` para convertir un checkpoint aprobado al formato de directorio de inferencia seguro. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La tarea de clasificación de orientación documental en doce clases es específica y el autor no ofrece comparaciones con alternativas. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PagePose Qwen3.5-4B Vision | 336.807.692 | No aplica | Apache 2.0 | Pesos públicos pendientes de exportación y aprobaciones |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos finales no se han publicado. La model card indica que la release pública está pendiente de una exportación solo de inferencia, verificación de paridad y aprobaciones explícitas de privacidad, legalidad y derechos de datos.
- El checkpoint evaluado localmente no es un artefacto público: incluye estado de optimizador, scheduler y RNG, y usa serialización pickle de PyTorch. El autor advierte explícitamente de que no debe subirse.
- El hash del checkpoint identifica el checkpoint privado de reanudación de entrenamiento, no el futuro artefacto público de inferencia.
- El modelo solo cubre rotaciones en múltiplos de 30 grados; no realiza deskewing de ángulos arbitrarios.
- No realiza OCR, reconocimiento de escritura, extracción de contenido, clasificación de documentos ni interpretación semántica.
- No es un modelo nativo de Transformers para clasificación de imágenes y no puede cargarse con el pipeline genérico.
- La puerta de confianza de 0,80 implica que las predicciones por debajo de ese umbral se marcan como `orientation_unknown`; en producción hay que gestionar ese caso.
- El entrenamiento se hizo con 539 páginas de un corpus privado, lo que limita la diversidad conocida de dominios y estilos documentales.
- Los resultados de benchmarks están declarados por el autor y no están verificados (`verified: false`), incluido el 100 % en ORB-En y FUNSD+-Test.
- No hay información sobre sesgos, riesgo de alucinación (no aplica en el sentido lingüístico), idiomas ni cuantizaciones disponibles.
- La licencia Apache 2.0 permite uso comercial, pero la disponibilidad efectiva de los pesos condiciona cualquier despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gregbugaj/pagepose
- Repositorio del paquete PagePose: https://github.com/gregbugaj/pagepose
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper referenciado en los tags (arXiv:2511.04161): https://arxiv.org/abs/2511.04161
- Dataset ORB-En (krutrim-ai-labs/ocr_rotation_bench): https://huggingface.co/datasets/krutrim-ai-labs/ocr_rotation_bench
- Dataset FUNSD+ (konfuzio/funsd_plus): https://huggingface.co/datasets/konfuzio/funsd_plus
