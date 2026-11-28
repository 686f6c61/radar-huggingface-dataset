# jason1116/Krea2_Chars_LoRA

## Resumen

Krea2_Chars_LoRA es una colección de 84 LoRAs de personaje entrenadas sobre el modelo base KREA2 (y su variante turbo), publicada por el usuario jason1116 en Hugging Face. Cada LoRA se distribuye como un fichero `<Nombre>_KREA2.safetensors` acompañado de un fichero de persona en Markdown (`<Nombre>_KREA2.md`) que describe los rasgos faciales estables del personaje, su apariencia variable y su repertorio de expresiones. El repositorio ocupa 6,0 GB e incluye también las captions de entrenamiento y una carpeta `Pruned_Comparison` con una imagen de muestra por personaje.

El interés técnico del proyecto no reside tanto en los pesos como en el pipeline que los ha generado: según la model card, todo el ciclo (scraping de imágenes, curación, gating estético, captioning, síntesis de personas, aprovisionamiento de pods, entrenamiento y publicación) se ejecutó de forma autónoma mediante un agente (Hermes Agent, servido por el modelo Kimi K3) a partir de una petición en lenguaje natural, sin revisión manual en ninguna fase. Es, por tanto, un caso práctico de automatización end-to-end de un dataset y un conjunto de adaptadores LoRA.

Los adaptadores han sido re-ranqueados con SVD dinámico (`sv_fro`, retención 0,998, rango máximo 16) y podados por bloques, eliminando los 8 bloques del transformer de menor impacto (bloques 1-8, aproximadamente el 3 % de la energía del delta). La licencia es Apache 2.0. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre el modelo de difusión KREA2; no se detalla la arquitectura interna del modelo base |
| Parametros totales | no disponible (adaptadores LoRA con rango máximo 16 tras el re-ranqueo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un fichero por personaje, `<Nombre>_KREA2.safetensors`) |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo, sino un conjunto de 84 adaptadores LoRA destinados al modelo de generación de imágenes KREA2, tanto en su versión base como en la turbo. Cada adaptador ha sido re-ranqueado mediante SVD dinámico con retención de 0,998 y rango máximo de 16, y posteriormente podado por bloques descartando los 8 bloques del transformer con menor contribución (bloques 1-8, en torno al 3 % de la energía del delta). El personaje Jung Ho-yeon fue reentrenado con un dataset nuevo antes de aplicar el mismo proceso de re-ranqueo y poda. No se especifican en la información disponible los hiperparámetros de entrenamiento (learning rate, pasos, resolución, tamaño de batch) ni la composición exacta de los datasets.

El pipeline de generación de datos y entrenamiento es el elemento más destacable: un agente autónomo (Hermes Agent, servido por Kimi K3) ejecutó el scraping de imágenes por personaje, el recorte y detección de caras con Ultralytics YOLO, un filtro de contenido estricto (exclusión de imágenes generadas por IA, verificación del sujeto correcto y umbral de nitidez), un gating estético con un discriminador basado en el scorer estético de ERNIE, el captioning con Gemma-4 26B (abliterated) vision MTP a 1,2 s/imagen, la síntesis de los ficheros de persona a partir del análisis de rasgos de las captions, el aprovisionamiento de pods vía la API de RunPod (MCP) y el entrenamiento con Ostris AI-Toolkit. La publicación final de pesos y ficheros de persona también la realizó el agente.

## Capacidades

- Generación de imágenes de personajes concretos condicionada por el LoRA correspondiente, sobre el modelo base KREA2 (base y turbo).
- Reproducción de rasgos faciales estables por personaje, con variación controlada de apariencia y expresiones gracias al fichero de persona asociado.
- Integración con ComfyUI (etiqueta `comfyui` en el repositorio) para flujos de trabajo de text-to-image.
- Acompañamiento de cada LoRA con un fichero `.md` de persona que documenta rasgos faciales, apariencia variable y expresiones, útil para construir prompts consistentes.
- Captions de entrenamiento incluidas por personaje, lo que facilita el reentrenamiento o el ajuste fino posterior.
- Imágenes de comparación (una por personaje) en la carpeta `Pruned_Comparison` para evaluar visualmente el efecto de la poda.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo, al tratarse de un conjunto de adaptadores de imagen.

## Casos de uso

- Generación de retratos consistentes de personaje en producción de cómic o novela gráfica: cargando el LoRA del personaje en ComfyUI junto con el fichero de persona, se obtienen variaciones de la misma cara en distintas poses y expresiones sin reescribir el prompt desde cero.
- Previsualización de casting o storyboard: el equipo creativo puede generar escenas con un personaje concreto y evaluar encuadres y expresiones antes de rodar o ilustrar, usando la versión turbo de KREA2 para iterar rápido.
- Creación de avatares y material promocional: el LoRA fija la identidad visual del personaje y el fichero `.md` aporta la descripción de rasgos que se puede inyectar en el prompt para mantener coherencia entre piezas.
- Investigación sobre pipelines autónomos de datos: el repositorio documenta paso a paso (scraping, filtrado, captioning, gating estético, entrenamiento en pods) un flujo reproducible que sirve como referencia para construir datasets de personaje con control de calidad automatizado.
- Estudio comparativo de poda de LoRA: la carpeta `Pruned_Comparison` y la descripción del re-ranqueo SVD permiten evaluar el impacto visual de eliminar bloques de bajo impacto y reducir el rango a 16.
- Base para ajuste fino adicional: al incluir las captions de entrenamiento y los pesos en safetensors, un equipo puede partir de un personaje existente y reentrenarlo con su propio dataset, como se hizo con Jung Ho-yeon.
- Docencia y divulgación sobre LoRA: la estructura unificada (`Characters/` con pesos, persona y captions) simplifica explicar cómo se compone un adaptador de personaje y qué información acompaña a los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base KREA2, no del LoRA, que añade una sobrecarga mínima (rango máximo 16).
- GPU recomendadas: no disponible. El pipeline de entrenamiento se ejecutó en pods aprovisionados vía la API de RunPod, pero no se especifican los modelos de GPU utilizados.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: ComfyUI (etiqueta del repositorio); el resto de backends no se documentan.
- Latencia y throughput: no disponibles. El único dato de rendimiento del pipeline es el captioning con Gemma-4 26B a 1,2 s/imagen, que corresponde a la fase de generación del dataset, no a la inferencia del LoRA.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros conjuntos de LoRA de personaje para KREA2 ni datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio contiene LoRAs de personajes que corresponden a personas reales (actrices, modelos, celebridades, figuras públicas). Su uso para generar imágenes de personas identificables plantea riesgos de suplantación, desinformación y vulneración de derechos de imagen, con independencia de la licencia del código y los pesos.
- La licencia Apache 2.0 cubre los artefactos publicados, pero no exime de cumplir la normativa aplicable sobre protección de datos, derecho de imagen y difusión de contenido sintético de personas reales; conviene revisar el uso comercial caso por caso.
- La model card indica que el pipeline se ejecutó sin ninguna puerta de revisión manual, lo que aumenta el riesgo de que se hayan colado imágenes o descripciones no deseadas en los datasets y en los ficheros de persona.
- El filtro de contenido del pipeline excluye imágenes generadas por IA y aplica umbrales de nitidez y verificación del sujeto, pero no se documentan auditorías posteriores ni métricas de calidad del dataset resultante.
- No hay información sobre sesgos demográficos, cobertura geográfica de los personajes ni equilibrio del conjunto.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir rasgos inconsistentes con el personaje, especialmente tras la poda de bloques y la reducción de rango.
- No se documentan limitaciones de contexto ni de idioma porque el artefacto es un LoRA de imagen; los prompts dependen del tokenizador y del modelo base KREA2.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria publicada sobre su calidad o estabilidad.
- Los hiperparámetros de entrenamiento y la composición exacta de los datasets no están disponibles, lo que dificulta reproducir los resultados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jason1116/Krea2_Chars_LoRA
- Hermes Agent (Nous Research), citado como agente ejecutor del pipeline: https://hermes-agent.nousresearch.com
- Carpeta de comparación de personajes podados: https://huggingface.co/UntMods/Krea2_Chars_LoRA/tree/main/Pruned_Comparison (referenciada en las imágenes de la model card)
