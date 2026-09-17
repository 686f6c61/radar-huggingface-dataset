# SharonMelhi/S2A-Net-Weights

## Resumen

S2A-Net (Surface2Anatomy) es un modelo de aprendizaje geométrico profundo que estima la localización de anatomía interna tridimensional a partir de la geometría de la superficie corporal externa. En otras palabras: dada una nube de puntos o malla 3D de la superficie del cuerpo de un paciente, el modelo predice coordenadas de estructuras anatómicas internas, sin necesidad de adquirir una imagen de tomografía computarizada (TC) o resonancia magnética (RM). Lo desarrollan Khushi Mhamane y Sharon Melhi bajo la supervisión académica del Dr. Deepak Raina (SCEE, Indian Institute of Technology Mandi).

El modelo combina un backbone de tipo transformer sobre nube de puntos 3D con un esquema de ensemble congelado de tres semillas, un atlas poblacional (Population Atlas) y una etapa de alineación canónica basada en regresión Ridge. El repositorio de pesos ocupa 0,1 GB y se distribuye en formato joblib, con dos checkpoints publicados: `phase10R/` (ensemble base de tres semillas congeladas) y `phase16_brain/` (ensemble reentrenado con conciencia de la región craneal para resolver un colapso de coordenadas en la zona del cráneo).

Es relevante ahora porque aborda un problema clásico de la imagen médica (obtener información anatómica interna sin radiación ionizante) desde una modalidad de captura barata y no invasiva como el escaneo de superficie corporal. El repositorio es muy reciente (creado el 16 de septiembre de 2026), no tiene descargas ni valoraciones, y el autor no publica métricas cuantitativas de error, ficha de datos ni detalles del conjunto de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer sobre nube de puntos 3D, con ensemble de tres semillas, atlas poblacional y alineación canónica mediante regresión Ridge (según model card y etiquetas) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (la entrada es geometría de superficie 3D, no secuencias de texto; el número de puntos de entrada no está especificado) |
| Tipos de cuantización | no disponible (no se distribuyen pesos en formatos cuantizados; el repositorio contiene artefactos joblib) |
| Idiomas soportados | no aplica (modelo geométrico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | joblib (serialización de objetos Python/scikit-learn); no hay safetensors, GGUF ni ONNX publicados |
| Tamaño del repositorio | 0,1 GB |
| Checkpoints publicados | `phase10R/` (ensemble congelado de 3 semillas: 42, 43, 44), `phase16_brain/` (ensemble whole-body con conciencia craneal) |
| Modalidad de entrada | Geometría de superficie corporal externa en 3D (nube de puntos / malla) |
| Modalidad de salida | Coordenadas 3D de anatomía interna |
| Dominio de aplicación | Imagen médica, localización anatómica, antropometría computacional |
| Fecha de publicación | 16 de septiembre de 2026 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un pipeline con varios componentes diferenciados. El núcleo es un transformer que opera directamente sobre geometría de superficie 3D (etiquetas `3d-point-cloud` y `transformer`), encargado de extraer representaciones de la forma corporal externa. Sobre esas representaciones se aplican dos mecanismos complementarios: un atlas poblacional, que aporta una referencia estadística de la anatomía media de la población, y una alineación canónica mediante regresión Ridge, que normaliza la correspondencia entre el espacio de superficie y el espacio anatómico interno. La predicción final se obtiene como un ensemble congelado de tres semillas independientes (42, 43 y 44), lo que sugiere que la variabilidad entre inicializaciones se considera un factor relevante y se mitiga por agregación.

El repositorio publica dos versiones. `phase10R/` corresponde al ensemble base de tres semillas junto con el atlas poblacional y la alineación canónica Ridge. `phase16_brain/` es un reentrenamiento *whole-body* con conciencia de la región cerebral, cuyo objetivo declarado es resolver un «colapso de coordenadas craneales» presente en la versión anterior. Este detalle es la única información sobre comportamiento del modelo que aparece en la model card: indica un fallo conocido en la localización dentro del cráneo en `phase10R`, pero no se especifica su magnitud ni el error residual tras la corrección.

No hay información publicada sobre el número de tokens o muestras de entrenamiento, la composición del conjunto de datos, la procedencia de los escaneos de superficie, el uso de RLHF/DPO (no aplicable a este dominio) ni sobre funciones de pérdida, aumentación de datos o estrategia de validación. Tampoco se documenta si el backbone es una implementación propia o una adaptación de arquitecturas conocidas de point cloud transformers.

## Capacidades

- Predicción de coordenadas 3D de estructuras anatómicas internas a partir de geometría de superficie corporal externa.
- Localización anatómica de cuerpo completo (*whole-body*) en la variante `phase16_brain`.
- Localización específica de la región craneal, con el reentrenamiento destinado a corregir el colapso de coordenadas del checkpoint base.
- Robustez por agregación: el ensemble de tres semillas congeladas reduce la dependencia de una única inicialización.
- Regularización estadística mediante atlas poblacional, que aporta una referencia de forma anatómica media.
- Alineación canónica con regresión Ridge para mapear el espacio de superficie al espacio anatómico.
- Integración en pipelines de Python: al distribuirse en joblib, los artefactos se cargan con `joblib.load` dentro de código Python/scikit-learn.
- Demo interactiva 3D desplegada como aplicación web.

No dispone de generación de texto, razonamiento simbólico, generación de código, matemáticas, tool calling, function calling, soporte de agentes, capacidades multilingües, modo de razonamiento explícito (*thinking*), visión 2D ni procesamiento de audio. Es un modelo de regresión geométrica especializado, no un modelo de lenguaje.

## Casos de uso

- Planificación quirúrgica preoperatoria: a partir de un escaneo de superficie del paciente, el modelo estima la posición de estructuras internas relevantes para decidir el punto de entrada o la trayectoria de un abordaje, sin necesidad de una TC adicional en esa fase.
- Registro paciente-específico con imágenes médicas: las coordenadas internas predichas pueden emplearse como inicialización o restricción en un pipeline de registro con TC o RM, reduciendo el espacio de búsqueda de la optimización.
- Captura anatómica sin radiación ionizante: en poblaciones donde la exposición a radiación es especialmente sensible (pediatría, embarazo, seguimiento longitudinal frecuente), el modelo ofrece una vía de estimación anatómica basada únicamente en geometría de superficie.
- Ajuste de dispositivos y equipamiento médico: órtesis, prótesis, cascos de monitorización EEG o sistemas de posicionamiento de sensores pueden calibrarse a partir de la anatomía interna estimada, no solo de la forma externa.
- Antropometría computacional y estudios poblacionales: el atlas poblacional integrado y la capacidad de generar predicciones por sujeto permiten analizar variabilidad anatómica en cohortes a partir de escaneos de superficie.
- Formación médica y visualización 3D: la aplicación web del proyecto puede usarse para mostrar de forma interactiva la relación entre superficie corporal y anatomía interna en docencia.
- Investigación en aprendizaje geométrico: el repositorio sirve como referencia reproducible (ensemble de semillas fijas, checkpoints separados) para estudiar generalización en predicción de anatomía interna desde superficie.
- Triaje o cribado de bajo coste: en entornos con acceso limitado a imagen médica, una estimación aproximada de la posición anatómica puede priorizar qué pacientes requieren una prueba de imagen completa.

En todos los casos, la ausencia de métricas de error publicadas impide afirmar qué precisión cabe esperar, por lo que cualquier uso clínico requeriría una validación local previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de error (por ejemplo, error medio en milímetros, distancia de Chamfer o Dice sobre estructuras internas), ni comparaciones con líneas base. La única referencia cualitativa al rendimiento es la mención de un «colapso de coordenadas craneales» en `phase10R` que `phase16_brain` pretende resolver, sin cuantificación asociada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,1 GB, lo que sugiere que los artefactos son ligeros y que la inferencia podría ejecutarse íntegramente en CPU y en memoria RAM convencional, pero no hay confirmación del autor.
- GPU recomendadas: no se especifican. Si el backbone requiere PyTorch, cualquier GPU CUDA con unos pocos GB de memoria sería suficiente en términos de tamaño de artefactos; no hay datos que permitan recomendar A100, H100 o RTX 4090 de forma justificada.
- Compatibilidad con GPU de consumo: probablemente sí por tamaño, aunque no está documentado. No se indica si la inferencia es posible solo en CPU.
- Opciones de despliegue: carga directa en Python mediante `joblib.load`; el proyecto ofrece además una demo web 3D. No es compatible con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia de LLM, porque no es un modelo de lenguaje ni publica pesos en GGUF o safetensors.
- Latencia y throughput estimados: no disponible.
- Consideración de seguridad: al tratarse de artefactos joblib (basados en serialización tipo pickle), deben cargarse únicamente desde fuentes de confianza, ya que la deserialización puede ejecutar código arbitrario.

## Comparativa con modelos similares

No se dispone de resultados numéricos del modelo ni de alternativas evaluadas bajo el mismo protocolo, por lo que la comparación cuantitativa no es posible. A continuación se comparan categorías de referencia de forma cualitativa:

| Enfoque | Tipo de entrada | Salida | Licencia | Disponibilidad | Comparación numérica |
|---|---|---|---|---|---|
| S2A-Net (este modelo) | Nube de puntos / malla de superficie corporal 3D | Coordenadas 3D de anatomía interna | MIT | Pesos joblib en HuggingFace, repo de 0,1 GB | no disponible |
| Modelos de forma estadística (SSM) | Malla de superficie con correspondencia establecida | Forma anatómica media + modos de variación | Varía según implementación | Bibliotecas académicas y comerciales | no disponible |
| Backbones genéricos de nube de puntos (PointNet++, Point Transformer y similares) | Nube de puntos 3D | Representación o etiquetas por punto | Habitualmente permisivas o Apache 2.0 | Implementaciones públicas ampliamente disponibles | no disponible (no resuelven por sí solos la tarea superficie-anatomía) |
| Métodos de imagen médica basados en TC/RM | Volumen de TC o RM | Segmentación o localización anatómica | Varía | Requiere adquisición de imagen | no disponible |

La diferencia funcional principal de S2A-Net frente a los métodos de imagen es que evita la adquisición tomográfica, y frente a los backbones genéricos de nube de puntos, que incorpora atlas poblacional y alineación Ridge específicos del problema anatómico.

## Limitaciones y advertencias

- Ausencia total de métricas publicadas: no hay error medio, percentiles ni validación cruzada reportados, lo que impide evaluar si la precisión es suficiente para cualquier uso clínico.
- Sin tracción ni validación comunitaria: 0 descargas y 0 valoraciones en el momento de la consulta; no hay terceros que hayan reproducido los resultados.
- Fallo conocido en la versión base: `phase10R` presenta un «colapso de coordenadas craneales» según el propio autor; la corrección en `phase16_brain` se declara pero no se cuantifica.
- Sesgos potenciales desconocidos: no se documenta la composición del conjunto de entrenamiento (edad, sexo, índice de masa corporal, etnia, presencia de implantes o deformidades). Un modelo entrenado sobre una población limitada puede degradarse en grupos subrepresentados.
- Dependencia del dominio de entrada: al operar sobre geometría de superficie, es sensible a la pose del sujeto, al método de captura, al ruido y a la cobertura del escaneo (por ejemplo, oclusión de zonas como axilas, ingles o cuero cabelludo).
- No es un producto sanitario: no consta marcado CE ni autorización FDA, ni validación clínica. No debe emplearse para decisiones diagnósticas o terapéuticas sin supervisión profesional y validación local.
- Licencia MIT: permite uso comercial y modificación con atribución, pero no ofrece garantías ni asume responsabilidad; el usuario asume íntegramente el riesgo y las obligaciones regulatorias derivadas del uso clínico.
- Riesgo de deserialización: los artefactos joblib/pickle pueden contener código ejecutable; cargarlos solo desde el repositorio oficial o fuentes verificadas.
- Sin capacidades de lenguaje: no procesa texto, no responde a instrucciones y no admite tool calling ni flujos de agentes.
- Contexto y cuantizaciones no aplicables: las filas de contexto, cuantización e idiomas de la tabla de especificaciones no tienen sentido para este tipo de modelo.

## Enlaces

- HuggingFace: https://huggingface.co/SharonMelhi/S2A-Net-Weights
- GitHub del proyecto: https://github.com/Sharon-codes/S2A-Net-IIT-Mandi
- Aplicación web 3D interactiva: https://web-self-theta-51.vercel.app
- Institución: Indian Institute of Technology Mandi (IIT Mandi), SCEE
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (los resultados obtenidos correspondían a tiendas de recambios de automóvil y no guardan relación con el proyecto). No se dispone de paper, blog técnico ni informe de evaluación adicional en la información proporcionada.
