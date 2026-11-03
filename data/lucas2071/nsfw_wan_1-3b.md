# Lucas2071/NSFW_Wan_1.3b

## Resumen

NSFW Wan 1.3B T2V es un ajuste fino (fine-tune) del modelo de generación de vídeo texto-a-vídeo Wan2.1-T2V-1.3B de Alibaba, especializado en contenido para adultos. Lo publica el usuario Lucas2071 en HuggingFace bajo licencia CreativeML OpenRAIL-M, con la etiqueta explícita de contenido no apto para todos los públicos. El modelo parte de la arquitectura transformer de difusión de Wan 1.3B y se reentrena sobre un corpus curado de publicaciones de Reddit de temática NSFW para ampliar la cobertura temática del modelo base en ese dominio.

El objetivo declarado es servir como herramienta de investigación y creación para generar clips cortos coherentes a partir de descripciones en lenguaje natural dentro del ámbito adulto, con movimiento nativo sin necesidad de LoRAs auxiliares. El autor documenta dos rondas de entrenamiento: una original en dos fases (imágenes y luego vídeo) con problemas conocidos de degradación anatómica, y una segunda experimental de una sola pasada sobre dataset mixto que corrige en parte esos artefactos.

Es relevante por su carácter de caso práctico de fine-tuning de un modelo de vídeo open source de 1.300 millones de parámetros, y por documentar de forma explícita los fallos de olvido catastrófico al entrenar primero solo con imágenes y después solo con vídeo. El repositorio ocupa 105,4 GB por acumular todos los checkpoints intermedios de ambas series.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión texto-a-vídeo (base Wan2.1-T2V-1.3B) |
| Parámetros totales | 1.300 millones |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible (los prompts de entrenamiento provienen de comunidades en inglés) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de difusión transformer de Wan2.1-T2V-1.3B, orientada a generar vídeo a partir de texto. Sobre esa base, el autor aplica un fine-tuning completo (no se mencionan adaptadores LoRA) con dos metodologías distintas. La original se dividió en dos fases: las épocas 1 a 10 se entrenaron principalmente con un gran dataset de imágenes NSFW y las épocas 11 a 20 exclusivamente con vídeo. Según la model card, esa primera fase fue demasiado agresiva y provocó olvido catastrófico de la anatomía coherente (caras, manos), daño que la fase de vídeo no logró revertir, con degradación de calidad notable a partir de la época 3.

La segunda metodología, etiquetada como experimental, sustituye las dos fases por una única pasada sobre un dataset mixto de 30.000 clips de vídeo y 20.000 imágenes estáticas de forma simultánea, con una tasa de aprendizaje más conservadora, lotes más pequeños y un calendario de entrenamiento más corto. El autor reporta que esta configuración mantiene la regularización espacial constante y evita la deriva anatómica. Los datos de entrenamiento proceden de las 1.000 publicaciones principales de aproximadamente 1.250 subreddits NSFW distintos, con leyendas que imitan las convenciones de etiquetado de esas comunidades. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de vídeo corto a partir de prompts de texto en el dominio de contenido para adultos.
- Movimiento temporal nativo en los checkpoints entrenados con vídeo, sin necesidad de LoRAs auxiliares según el autor.
- Cobertura amplia de escenarios, estilos visuales, arquetipos de personaje y acciones descritas en lenguaje natural.
- Ajuste de estilo y detalle fino en los checkpoints entrenados con imágenes (épocas tempranas de la serie original).
- Soporte de prompting guiado mediante el archivo `prompting-guide.json`, que recoge vocabulario y etiquetas frecuentes de las comunidades de origen.
- Base para entrenamiento posterior de LoRAs sobre el checkpoint experimental recomendado.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles (no es un modelo de lenguaje).
- Capacidades multilingües: no documentadas.

## Casos de uso

- Investigación sobre fine-tuning de modelos de difusión de vídeo: el repositorio documenta con detalle el fallo de olvido catastrófico al separar entrenamiento de imagen y de vídeo, y sirve como referencia metodológica para quien planifique ajustes similares.
- Generación de clips para proyectos creativos adultos: el checkpoint `wan_1.3B_exp_e14.safetensors` permite obtener vídeo con movimiento estable a partir de descripciones textuales, sin pipeline adicional de LoRAs.
- Entrenamiento de LoRAs de estilo o personaje: el autor recomienda explícitamente el checkpoint experimental como base para LoRA training, lo que encaja en flujos de personalización sobre un modelo de 1,3B parámetros.
- Estudio de sesgos y seguridad en modelos generativos: al estar entrenado sobre un corpus de Reddit muy específico, permite analizar qué sesgos y estereotipos introduce ese origen de datos en la generación de vídeo.
- Pruebas de prompting y análisis de vocabulario: el `prompting-guide.json` facilita experimentos controlados sobre cómo distintas formulaciones afectan a la coherencia anatómica y al movimiento.
- Evaluación comparativa de checkpoints: la serie de épocas originales y experimentales permite medir la degradación de calidad a lo largo del entrenamiento y validar la hipótesis de la segunda metodología.
- Docencia sobre riesgos de los modelos abiertos: como caso de modelo con etiqueta `not-for-all-anchored` y licencia OpenRAIL-M, sirve para discutir el equilibrio entre apertura y restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo de difusión de vídeo de 1,3B parámetros en precisión completa suele requerir más de 8 GB de VRAM, pero no hay dato confirmado para este checkpoint.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base Wan2.1-T2V-1.3B está diseñado para ser relativamente ligero, pero este fine-tune no documenta requisitos.
- Opciones de despliegue: no se especifican en la model card. Al distribuirse solo en safetensors, requiere el pipeline de inferencia del modelo base Wan2.1.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NSFW Wan 1.3B (este) | 1,3B | no disponible | Texto-a-vídeo NSFW | CreativeML OpenRAIL-M | HuggingFace, repo de 105,4 GB |
| Wan2.1-T2V-1.3B (base) | 1,3B | no disponible | Texto-a-vídeo general | no disponible en esta ficha | HuggingFace (Wan-AI) |
| Alternativas NSFW de vídeo open source | no disponible | no disponible | Texto-a-vídeo NSFW | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo está diseñado para generar material NSFW y no es apto para todos los públicos; la propia etiqueta del repo lo indica.
- Artefactos anatómicos: el autor reconoce "body horror", distorsiones y degradación de calidad en la serie original, especialmente a partir de la época 3; los checkpoints experimentales mitigan pero no necesariamente eliminan el problema.
- Sesgos de origen: el entrenamiento se basa en publicaciones de Reddit, lo que arrastra sesgos de género, cuerpo, etnia y prácticas presentes en esas comunidades.
- Riesgo de contenido no consentido: un modelo de este tipo puede emplearse para generar representaciones de personas reales o ficticias en contextos sexuales; la licencia OpenRAIL-M impone restricciones de uso, pero su cumplimiento no está garantizado técnicamente.
- Restricciones de licencia: CreativeML OpenRAIL-M incluye cláusulas de uso aceptable que prohíben determinados usos (por ejemplo, generación de contenido ilegal o de explotación); el uso comercial está permitido con condiciones, pero debe revisarse la licencia completa.
- Idiomas: no hay información sobre soporte multilingüe; los prompts de entrenamiento están en inglés, por lo que el rendimiento en castellano es incierto.
- Tamaño del repositorio: 105,4 GB por acumulación de checkpoints; la descarga completa es costosa y conviene seleccionar un único archivo.
- Sin benchmarks: no hay métricas publicadas que permitan evaluar objetivamente la calidad frente al modelo base u otras alternativas.
- Madurez: 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Lucas2071/NSFW_Wan_1.3b
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Archivo de guía de prompting: `prompting-guide.json` dentro del repositorio de HuggingFace
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
