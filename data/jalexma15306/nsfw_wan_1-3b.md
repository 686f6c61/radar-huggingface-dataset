# jalexma15306/NSFW_Wan_1.3b

## Resumen

NSFW_Wan_1.3b es un ajuste fino (fine-tune) de generación de vídeo a partir de texto, desarrollado por el usuario jalexma15306 sobre el modelo base Wan-AI/Wan2.1-T2V-1.3B. Se trata de un modelo de 1,3 mil millones de parámetros especializado en la generación de vídeo de contenido para adultos (NSFW), con el objetivo declarado de servir como herramienta de investigación y creación capaz de producir clips cortos coherentes con las indicaciones textuales dentro del dominio del contenido adulto.

El modelo se distribuye mediante múltiples checkpoints correspondientes a distintas épocas de entrenamiento. El autor publicó una primera serie (e1 a e20) basada en un entrenamiento en dos fases —primero imágenes, después vídeo— que presentaba problemas documentados de degradación de calidad anatómica ("body horror"). Como respuesta, se publicó una segunda serie experimental (exp_e1 a exp_e14) entrenada con un conjunto de datos mixto de 30.000 clips de vídeo y 20.000 imágenes fijas, con una configuración más conservadora; el autor recomienda usar `wan_1.3B_exp_e14.safetensors` como checkpoint de referencia.

El repositorio ocupa 105,4 GB, no registra descargas ni valoraciones en el momento de la consulta, y se publicó el 28 de septiembre de 2026 bajo licencia CreativeML Open RAIL-M. La model card no proporciona datos de benchmarks, cuantizaciones, idiomas soportados ni pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto a vídeo (T2V), según la model card; ajuste fino de Wan-AI/Wan2.1-T2V-1.3B |
| Parametros totales | 1,3 mil millones (1.3B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles; los pesos se distribuyen en safetensors sin cuantización documentada |
| Idiomas soportados | no disponibles; los subtítulos del dataset de entrenamiento proceden de subreddits en inglés |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | safetensors (múltiples checkpoints por época) |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B |
| Pipeline declarado | no disponible |
| Tamano del repositorio | 105,4 GB |
| Tipo de tarea | texto a vídeo (T2V) |
| Fecha de publicacion | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card describe la arquitectura únicamente como "Text-to-Video Transformer Architecture" con 1.300 millones de parámetros, sin detallar el tipo de bloque, el codificador de texto, el VAE ni el esquema de difusión empleado. Tampoco se especifican la resolución nativa, la duración de los clips, los frames por segundo ni la ventana temporal máxima soportada. Toda la información arquitectónica adicional del modelo base queda fuera de la información proporcionada.

En cuanto al entrenamiento, el autor documenta dos procedimientos. El primero, ya considerado legado, se dividió en dos fases: las épocas 1 a 10 se ajustaron principalmente sobre un conjunto masivo de imágenes NSFW, y las épocas 11 a 20 se entrenaron exclusivamente sobre vídeo para adquirir coherencia temporal. El autor reconoce que la fase inicial fue demasiado agresiva y provocó olvido catastrófico de la anatomía coherente (caras, manos), degradación que la fase de vídeo no logró recuperar. El segundo procedimiento, experimental, sustituye las dos fases por una única ejecución sobre un dataset mixto de 30.000 clips de vídeo y 20.000 imágenes fijas de forma simultánea, con una tasa de aprendizaje más conservadora, tamaños de lote menores y un calendario de entrenamiento más corto. El dataset original se compone de las 1.000 publicaciones más destacadas de aproximadamente 1.250 subreddits de contenido adulto, y los subtítulos emplean las convenciones de etiquetado propias de esas comunidades. No se documenta el uso de RLHF, DPO ni de ninguna otra técnica de alineación.

## Capacidades

- Generación de vídeo a partir de texto dentro del dominio del contenido adulto, con movimiento coherente de forma nativa según el autor.
- Comprensión de un espectro amplio de escenarios, estéticas, arquetipos de personajes y acciones descritas en lenguaje natural en el ámbito NSFW.
- Generación de clips cortos con coherencia temporal, sin necesidad de LoRAs auxiliares según la model card.
- Distintos checkpoints especializados por fase de entrenamiento: las épocas iniciales priorizan estilo y detalle, mientras que las tardías priorizan movimiento.
- Base para entrenamiento de LoRA: el autor recomienda explícitamente el checkpoint `wan_1.3B_exp_e14.safetensors` como punto de partida para ajustes posteriores.
- Archivo `prompting-guide.json` con un análisis de palabras clave, frases y lenguaje descriptivo asociado al contenido de los subreddits de origen, orientado a mejorar la redacción de indicaciones.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre generación de contenido para adultos: el modelo permite estudiar cómo los modelos de difusión de vídeo aprenden conceptos especializados y cómo degradan su conocimiento previo durante el ajuste fino, tal como documenta el propio autor con el fenómeno de olvido catastrófico.
- Base para el entrenamiento de LoRA de estilos o personajes concretos: el checkpoint `wan_1.3B_exp_e14.safetensors` se recomienda explícitamente como punto de partida, lo que permite a investigadores construir variantes especializadas sin partir del modelo base generalista.
- Previsualización y animática en producciones de animación para adultos: el modelo genera clips cortos con movimiento coherente que pueden servir como borrador visual antes de una producción final más costosa.
- Generación de datos sintéticos para moderación de contenido: los clips generados pueden emplearse para aumentar conjuntos de datos de entrenamiento de clasificadores de contenido explícito o de sistemas de verificación de edad, siempre que se cumplan los requisitos legales aplicables.
- Estudio de sesgos y representación: al estar entrenado sobre publicaciones destacadas de 1.250 subreddits, el modelo refleja de forma medible las convenciones estéticas y demográficas de esas comunidades, lo que lo convierte en un objeto de estudio sobre sesgos en datos de origen comunitario.
- Pruebas de robustez de filtros y salvaguardas: los equipos de seguridad pueden utilizar el modelo para evaluar si sus clasificadores detectan contenido generado sintéticamente en el dominio adulto.
- Exploración artística dentro del marco de la licencia CreativeML Open RAIL-M, sujeta a las restricciones de uso establecidas por dicha licencia y a la legislación aplicable en cada jurisdicción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas cuantitativas de calidad de vídeo (FVD, CLIP score, IS), comparaciones automáticas con el modelo base ni evaluaciones humanas cifradas. La única valoración del autor es cualitativa: afirma que la serie experimental presenta mejor calidad espacial, movimiento estable y fidelidad NSFW fiable en comparación con la serie original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa basada únicamente en el recuento de parámetros, los pesos en precisión de 16 bits ocuparían del orden de 2,6 GB, a los que hay que sumar el codificador de texto, el decodificador VAE y las activaciones propias de un pipeline de difusión de vídeo, cuyo consumo depende de la resolución, la duración del clip y el número de pasos de muestreo. Estas cifras son una estimación y no están confirmadas por el autor.
- GPU recomendadas: no disponible. El autor no especifica hardware objetivo ni mínimo.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; dependerá de la resolución y la duración del clip generado.
- Opciones de despliegue: no documentadas en la model card. Al ser un ajuste fino de Wan-AI/Wan2.1-T2V-1.3B, en principio sería cargable con las mismas herramientas que el modelo base, pero este extremo no se confirma en la información proporcionada.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 105,4 GB, ya que incluye todos los checkpoints de ambas series (originales y experimentales) más el archivo `prompting-guide.json`. Para uso práctico solo es necesario descargar el checkpoint seleccionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jalexma15306/NSFW_Wan_1.3b | 1,3B | no disponible | sin benchmarks publicados | CreativeML Open RAIL-M | HuggingFace, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B (base) | 1,3B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| Otros ajustes NSFW de T2V de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre alternativas comparables dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Contenido explícito: el modelo está etiquetado como `nsfw` y `not-for-all-audiences`. Genera material para adultos y no debe exponerse a menores ni utilizarse en productos de consumo general sin control de acceso.
- Artefactos conocidos: el propio autor documenta problemas graves de degradación anatómica ("body horror", glitches) en la serie original, en particular a partir de la época 3 del entrenamiento de imágenes. La serie experimental se presenta como corrección de ese problema, pero el autor la describe como experimental y pendiente de validación por la comunidad.
- Inconsistencia documental: la model card titula una sección como "Experimental Epochs 1-8" mientras que el encabezado y la lista de archivos describen checkpoints `exp_e1` a `exp_e14`. Esta discrepancia dificulta saber cuántas épocas componen realmente la serie experimental.
- Sesgos del dataset: el entrenamiento se realizó sobre las publicaciones más destacadas de unos 1.250 subreddits de contenido adulto. Esto sobrerrepresenta las estéticas, cuerpos, prácticas y demografías dominantes en esas comunidades, y probablemente infrarrepresenta a otras.
- Idiomas: no se declaran idiomas soportados. Los subtítulos de entrenamiento proceden de comunidades en inglés, por lo que es razonable esperar un rendimiento inferior con indicaciones en castellano u otros idiomas, aunque este extremo no está confirmado.
- Restricciones de licencia: CreativeML Open RAIL-M impone restricciones de uso que prohíben, entre otras cosas, aplicaciones destinadas a causar daño, la generación de contenido ilegal y determinados usos médicos, legales o de asesoramiento. Cualquier uso comercial debe revisarse contra el texto completo de la licencia.
- Riesgo legal y ético: la generación de vídeo con personas reales o verosímiles puede constituir deepfake no consentido y estar penada en diversas jurisdicciones. El autor no documenta ningún mecanismo de filtrado, marcado de agua ni detección de personajes reales.
- Riesgo de alucinación visual: como todo modelo generativo de difusión, puede producir anatomía incorrecta, incoherencias entre fotogramas y desviaciones respecto a la indicación, especialmente en acciones complejas o clips largos.
- Ausencia de benchmarks y de mantenimiento: el repositorio no tiene descargas ni valoraciones, no incluye evaluación cuantitativa y no hay indicios de soporte o actualizaciones posteriores a la fecha de publicación.
- Cuantizaciones: no se ofrecen versiones cuantizadas ni GGUF, lo que limita el despliegue en hardware con poca memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jalexma15306/NSFW_Wan_1.3b
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Guía de indicaciones incluida en el repositorio: `prompting-guide.json` (archivo dentro del propio repositorio)
- Papers, blogs, repositorios de código y demos: no disponibles en la información proporcionada.
