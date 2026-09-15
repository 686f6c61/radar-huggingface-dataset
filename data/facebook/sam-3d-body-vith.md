# facebook/sam-3d-body-vith

## Resumen

sam-3d-body-vith es un modelo publicado por Meta (facebook) en HuggingFace para la recuperación de malla corporal humana en 3D (3D human mesh recovery) y la estimación de pose humana a partir de imágenes. El identificador del repositorio y la etiqueta del modelo apuntan a un backbone de tipo ViT-H (Vision Transformer Huge) integrado en la familia SAM 3D, la línea de modelos segmentables y "promptables" de Meta aplicada ahora a la geometría corporal humana.

El modelo resuelve el problema clásico de pasar de una imagen 2D a una representación 3D estructurada del cuerpo (malla con pose y forma), una tarea con aplicaciones directas en animación, VFX, captura de movimiento sin marcadores, realidad aumentada, análisis deportivo y robótica. Frente a los métodos clásicos de regresión de parámetros SMPL sobre detectores de keypoints, la propuesta se apoya en un backbone de visión de gran tamaño entrenado por Meta, lo que sugiere mayor robustez en oclusiones y poses complejas, aunque no se dispone de detalles técnicos oficiales en la información proporcionada.

La relevancia actual del modelo es doble. Por un lado, forma parte del despliegue de la familia SAM 3D de Meta, que extiende los modelos fundacionales de segmentación hacia la reconstrucción 3D. Por otro, su publicación es reciente (octubre de 2025, con actualización en diciembre de 2025), con acceso restringido bajo la SAM License, lo que obliga a aceptar condiciones en HuggingFace antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador "vith" indica un backbone ViT-H; no se detalla la arquitectura completa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | no aplica (modelo de visión/reconstrucción 3D, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | sam-license (SAM License de Meta), con acceso restringido sujeto a aceptación de condiciones |
| Formato de pesos | no disponible (repositorio de 2,4 GB; librería declarada: sam-3d-body) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SAM 3D de Meta y se distribuye a través de la librería `sam-3d-body`. El sufijo `vith` del identificador apunta a un backbone ViT-H (Vision Transformer en su variante Huge), coherente con el uso de codificadores de imagen de gran capacidad en los modelos SAM. Se trata, por tanto, de un modelo de percepción visual orientado a tareas de reconstrucción, no de un modelo generativo de lenguaje: no tiene ventana de contexto en tokens ni un decodificador de texto asociado.

No se ha proporcionado información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset, la resolución de entrada soportada, el uso de RLHF/DPO (no aplicable en su caso) ni sobre innovaciones técnicas concretas como decodificación especulativa o atención lineal. Cualquier afirmación adicional sobre el pipeline de entrenamiento sería especulativa y no se incluye aquí.

## Capacidades

- Reconstrucción de malla corporal humana en 3D a partir de imágenes, con estimación de pose y forma del cuerpo.
- Estimación de pose humana, presumiblemente con salida de keypoints 2D/3D y parámetros de cuerpo (tipo SMPL) según la etiqueta del modelo.
- Procesamiento de imágenes en el dominio de la visión por computador; la etiqueta de idioma del repositorio es `en`, referida a la documentación.
- No se documentan en la información disponible capacidades de generación de texto, razonamiento, código, matemáticas, audio ni visión general (captioning o VQA).
- No se documenta soporte de tool calling, function calling ni de agentes multi-paso: son capacidades propias de modelos de lenguaje y no aplican a este modelo.
- Capacidades multilingües: no disponibles (el modelo no procesa lenguaje natural como entrada principal).

## Casos de uso

- Producción de contenido y VFX: reconstruir la malla 3D de un actor a partir de fotogramas de vídeo para retargeting de animación, evitando sistemas de captura de movimiento con marcadores y reduciendo costes de estudio.
- Captura de movimiento sin marcadores: alimentar un pipeline de vídeo para extraer secuencias de pose 3D que después se aplican a personajes digitales en motores como Unreal o Unity.
- Análisis deportivo y biomecánica: estimar la pose y la forma corporal en cada fotograma para calcular ángulos articulares, detectar asimetrías y comparar la técnica entre atletas.
- Realidad aumentada y probadores virtuales: obtener la geometría del cuerpo del usuario para ajustar prendas virtuales o superponer elementos 3D de forma coherente con su postura y silueta.
- Robótica y teleoperación: usar la pose humana reconstruida como señal de referencia para que un robot imite movimientos o para interactuar con seguridad en entornos compartidos con personas.
- Salud y rehabilitación: seguimiento cuantitativo de la postura y del rango de movimiento en sesiones grabadas, generando métricas objetivas de progreso sin sensores vestibles.
- Preservación de privacidad en el tratamiento de imágenes: sustituir la imagen original por una malla 3D renderizada en aplicaciones donde no se quiere exponer el vídeo crudo, teniendo en cuenta que la malla sigue siendo un dato biométrico.
- Herramientas creativas de modelado: generación de una base de malla humana realista como punto de partida para escultores digitales y artistas 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 2,4 GB, por lo que los pesos en su precisión nativa rondan ese orden de magnitud; como referencia orientativa y no confirmada, un backbone ViT-H suele requerir del orden de 6 a 10 GB de VRAM incluyendo activaciones, cifra que debe validarse en la práctica.
- GPU recomendadas: no disponibles. Para un backbone ViT-H, las alternativas habituales serían GPU de centro de datos (A100, H100, L40S) o GPU de consumo de gama alta (RTX 4090, RTX 3090) si la VRAM resultante es suficiente.
- Compatibilidad con GPU de consumo: probable pero no confirmada; depende de la resolución de entrada y del tamaño real de los pesos, datos no disponibles.
- Opciones de despliegue: la librería declarada es `sam-3d-body`. No se documenta compatibilidad con vLLM, Ollama, llama.cpp ni TGI, y en sentido estricto no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| facebook/sam-3d-body-vith | no disponible | imagen (resolución no disponible) | no disponible | sam-license (acceso restringido) | HuggingFace, gated |
| Otros modelos de 3D human mesh recovery (por ejemplo, familias basadas en SMPL y detectores de keypoints) | no disponible | imagen o vídeo | no disponible | variable según proyecto | variable |
| Modelos fundacionales de visión de Meta (familia SAM) | no disponible | imagen con prompts | no disponible | licencia propia de Meta | HuggingFace, con condiciones |

No se dispone de datos numéricos comparativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al no publicarse la composición del dataset de entrenamiento, no se puede evaluar la representación de distintos tonos de piel, tipos corporales, edades, culturas o condiciones de iluminación.
- Riesgo de geometría implausible: en modelos de reconstrucción 3D el equivalente a la alucinación son mallas incoherentes o poses anatómicamente imposibles ante oclusiones severas, ropa holgada, cuerpos parcialmente fuera de plano o imágenes de baja resolución.
- Limitaciones de idioma: la etiqueta de idioma es `en`, referida a la documentación; el modelo no procesa lenguaje natural como entrada principal.
- Licencia: se distribuye bajo la SAM License de Meta con acceso restringido en HuggingFace. Es imprescindible revisar los términos antes de cualquier uso comercial, ya que las condiciones pueden incluir restricciones de redistribución y de uso.
- Acceso restringido: requiere aceptar condiciones en HuggingFace; no es descargable de forma anónima ni automatizable sin credenciales autorizadas.
- Dato biométrico: la reconstrucción de la forma corporal y la pose constituye información biométrica sensible. Su tratamiento puede estar sujeto al RGPD en la Unión Europea, con obligaciones de base jurídica, minimización y evaluación de impacto.
- Ausencia de especificaciones: no hay información pública disponible sobre resolución de entrada, tolerancia a múltiples personas en escena, soporte de vídeo, latencia ni límites de uso, lo que dificulta planificar un despliegue en producción.
- No apto para decisiones automatizadas de alto riesgo sin supervisión humana y validación específica del dominio.

## Enlaces

- HuggingFace: https://huggingface.co/facebook/sam-3d-body-vith
- No se han encontrado en la búsqueda web enlaces relevantes (paper, blog técnico, repositorio de código o demo). Los resultados devueltos corresponden a páginas de inicio de sesión de Facebook y no aportan información sobre el modelo.
