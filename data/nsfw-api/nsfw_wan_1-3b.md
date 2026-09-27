# NSFW-API/NSFW_Wan_1.3b

## Resumen

NSFW Wan 1.3b T2V es un modelo de generación de vídeo a partir de texto (text-to-video, T2V) de 1.300 millones de parámetros, desarrollado por el usuario NSFW-API y publicado en HuggingFace. Se trata de un ajuste fino (fine-tune) del modelo Wan-AI/Wan2.1-T2V-1.3B, especializado en la generación de contenido para adultos (NSFW). El modelo conserva una arquitectura de transformer texto-a-video y su objetivo declarado es servir como herramienta de investigación y creación capaz de generar clips de vídeo cortos coherentes a partir de instrucciones en lenguaje natural dentro del dominio de contenido adulto.

El modelo es relevante en el contexto actual porque la mayoría de los modelos T2V de código abierto aplican filtros de contenido o no están entrenados para el dominio NSFW, lo que deja un vacío para casos de investigación sobre generación, moderación y alineación en este ámbito. Su desarrollo documenta un proceso de ajuste fino en varias fases (imagen y vídeo por separado, y después una ejecución mixta) que ilustra problemas técnicos habituales como el olvido catastrófico (catastrophic forgetting) y la degradación anatómica en modelos de difusión entrenados sobre datasets sesgados.

La ficha refleja un modelo con 575 "likes" y 0 descargas registradas en el momento de la consulta, con un repositorio de 116,7 GB que aloja múltiples checkpoints (series experimental y legacy). El modelo base sobre el que se construye es Wan2.1-T2V-1.3B; los detalles de arquitectura, tokenizador y encoder de texto deben consultarse en la model card de ese modelo base, ya que la ficha de este fine-tune no los especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer texto-a-video (según model card) |
| Parametros totales | 1,3 mil millones (1.3B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (los pesos se distribuyen en safetensors; las cuantizaciones estándar dependen del runtime del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B |
| Tipo de tarea | Text-to-Video (T2V) |
| Fecha de creacion | 2025-05-24 |
| Ultima actualizacion | 2025-06-25 |
| Tamano del repositorio | 116,7 GB |

## Arquitectura y entrenamiento

El modelo parte de Wan-AI/Wan2.1-T2V-1.3B y se presenta como un transformer de generación texto-a-video. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; se indica únicamente que es un fine-tune del modelo base. El entrenamiento del ajuste fino se documenta con dos metodologías: una original (legacy) y una revisada (experimental).

El enfoque original fue bifásico. Las épocas 1 a 10 se entrenaron principalmente sobre un gran dataset de imágenes NSFW, lo que otorgaba buena estética y detalle pero capacidades de movimiento limitadas nativas; según el autor, la calidad se degradaba de forma significativa a partir de la época 3. Las épocas 11 a 20 se entrenaron exclusivamente sobre vídeo, aportando coherencia temporal y movimiento sin necesidad de LoRAs auxiliares. El resultado de esa serie original (hasta `wan_1.3B_e20.safetensors`) arrastraba artefactos de "body horror" y distorsión anatómica. Para corregirlo, se diseñó una ejecución única sobre un dataset mixto de 30.000 clips de vídeo y 20.000 imágenes estáticas de forma simultánea, con una tasa de aprendizaje más conservadora, batch más pequeño y un calendario de entrenamiento más corto. Esa segunda ejecución produce las épocas experimentales `wan_1.3B_exp_e1` a `wan_1.3B_exp_e14`, con mejor calidad espacial y estabilidad de movimiento según el autor.

El dataset de entrenamiento se describe como las 1.000 publicaciones más destacadas de aproximadamente 1.250 subreddits NSFW, con subtítulos que siguen las convenciones de etiquetado de esas comunidades. El repositorio incluye un archivo `prompting-guide.json` con un análisis de palabras clave y lenguaje descriptivo asociado al contenido fuente, pensado para mejorar las estrategias de prompting.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) de clips cortos, con movimiento coherente de forma nativa según el autor.
- Especialización en contenido NSFW: cubre un espectro amplio de temáticas, estéticas y acciones descritas en lenguaje natural dentro del dominio adulto.
- Comprensión de convenciones de prompting propias de comunidades de contenido adulto, documentadas en `prompting-guide.json`.
- Generación de imágenes estáticas en las épocas iniciales de la serie legacy (épocas 1-10, entrenadas sobre imágenes).
- Capacidad de servir como modelo base para entrenamiento de LoRAs, recomendándose para ello el checkpoint `wan_1.3B_exp_e14.safetensors`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica a un modelo T2V; no disponible.
- Capacidades multilingües: no disponibles (la model card no especifica idiomas; los prompts de entrenamiento provienen de comunidades en inglés).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Producción de clips para plataformas de contenido para adultos: un estudio puede generar vídeos cortos a partir de descripciones textuales sin depender de rodaje, usando el checkpoint experimental recomendado para maximizar la coherencia visual y temporal.
- Investigación sobre generación de contenido NSFW: el modelo permite estudiar cómo los transformers de difusión aprenden anatomía, movimiento y estética en dominios poco representados en los datasets públicos habituales.
- Entrenamiento de LoRAs especializados: al ser un modelo de 1,3B parámetros y publicar checkpoints estables (`exp_e14`), sirve como base para ajustes finos adicionales de estilos o temáticas concretas con requisitos de VRAM contenidos.
- Generación de datos sintéticos etiquetados para moderación: se pueden producir muestras NSFW controladas para entrenar o evaluar clasificadores de contenido y sistemas de filtrado, con etiquetas derivadas de los prompts.
- Red-teaming y evaluación de seguridad: investigadores pueden generar contenido límite para probar políticas de moderación, detectores de contenido no consentido y salvaguardas de plataforma en entornos controlados.
- Prototipado y previsualización creativa: guionistas y directores de contenido adulto pueden generar storyboards animados a partir de un guion textual para validar escenas y encuadres antes de una producción real.
- Estudio del olvido catastrófico en difusión: las dos metodologías de entrenamiento documentadas (bifásica y mixta) permiten analizar empíricamente cómo afecta el orden y la mezcla de datos a la degradación anatómica en modelos generativos.
- Aumento de datasets de investigación audiovisual: el modelo puede generar variaciones de clips para ampliar corpus de estudio sobre representación y sesgos en contenido adulto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FVD, CLIP score, MMLU, HumanEval, GSM8K u otras), y los resultados de la búsqueda web no aportan datos de evaluación del modelo.

## Requisitos de hardware

Las cifras de esta sección son estimaciones orientativas basadas en el tamaño del modelo (1,3B parámetros) y no han sido confirmadas por el autor; el consumo real depende de la resolución, el número de fotogramas, la longitud del clip y el runtime empleado, así como del encoder de texto y el VAE del modelo base Wan2.1.

- Pesos del modelo en precisión fp16: aproximadamente 2,6 GB; en fp32, en torno a 5,2 GB (solo pesos del transformer).
- VRAM estimada para inferencia: del orden de 8 a 16 GB en fp16, sumando pesos, encoder de texto, VAE y latentes de vídeo. No confirmado por el autor.
- GPU recomendadas: no confirmadas. Por tamaño, un modelo de 1,3B es candidato a ejecutarse en GPU de consumo (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4090) si el pipeline del modelo base lo permite; también en A100 o H100 para lotes mayores o mayor resolución.
- Compatibilidad con GPU de consumo: probable según el tamaño, pero no confirmada; depende del pipeline completo del modelo base Wan2.1-T2V-1.3B.
- Opciones de despliegue: no especificadas en la model card. Al distribuirse en safetensors, el despliegue depende del stack compatible con el modelo base (por ejemplo, Diffusers). No se documenta soporte para llama.cpp, Ollama, vLLM o TGI, que no son aplicables a un modelo de difusión de vídeo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NSFW_Wan_1.3b (este modelo) | 1,3B | T2V | NSFW, fine-tune | creativeml-openrail-m | HuggingFace (0 descargas, 575 likes) |
| Wan-AI/Wan2.1-T2V-1.3B (base) | 1,3B | T2V | Uso general | no disponible en esta ficha | HuggingFace |
| Otros fine-tunes NSFW de modelos T2V abiertos | no disponible | T2V | NSFW | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento (FVD, CLIP, coherencia temporal) entre este modelo y alternativas. La comparación se limita a arquitectura, tamaño y licencia. El modelo base es la referencia directa más cercana; las alternativas de la misma categoría (fine-tunes NSFW de modelos T2V abiertos como CogVideoX, LTX-Video o HunyuanVideo) no están documentadas en la información proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como `not-for-all-audiences` y genera material NSFW explícito. Su uso está restringido a personas adultas y a entornos legales apropiados.
- Riesgo de contenido no consentido: al ser un modelo NSFW sin salvaguardas declaradas, existe el riesgo de generar representaciones de personas reales o escenarios no consentidos. La model card no describe ningún filtro ni sistema de seguridad.
- Sesgos del dataset: el entrenamiento se basa en publicaciones destacadas de subreddits, lo que reproduce los sesgos demográficos, estéticos y de representación de esas comunidades.
- Degradación de calidad conocida: el propio autor documenta artefactos de "body horror", distorsión anatómica y caída de calidad en la serie original (especialmente tras la época 3); las épocas experimentales son una corrección no validada de forma independiente.
- Falta de benchmarks: no hay métricas públicas que permitan comparar su calidad objetivamente con alternativas.
- Restricciones de licencia: la licencia `creativeml-openrail-m` permite el uso comercial pero incluye restricciones de uso en su anexo (prohibición de usos dañinos, ilegales o que vulneren derechos de terceros). Es responsabilidad del usuario cumplirlas.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto; los prompts de entrenamiento provienen de comunidades en inglés, por lo que el rendimiento en otros idiomas es incierto.
- Estado del proyecto: repositorio con 0 descargas registradas, series de checkpoints marcadas como experimentales y sin actualizaciones desde junio de 2025 (según los datos consultados). La ficha no garantiza soporte ni mantenimiento.
- Cuestión legal y jurisdiccional: la generación y distribución de contenido para adultos está regulada de forma distinta según el país; el usuario debe verificar la legalidad en su jurisdicción y las condiciones de las plataformas donde publique.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento de texto; cualquier expectativa en ese sentido es inaplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NSFW-API/NSFW_Wan_1.3b
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Archivo de guía de prompting incluido en el repositorio: `prompting-guide.json` (dentro del repositorio del modelo)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo concreto. Los resultados obtenidos (definiciones genéricas de NSFW, agregadores y sitios de contenido) no guardan relación con la ficha técnica ni con la documentación del modelo.
