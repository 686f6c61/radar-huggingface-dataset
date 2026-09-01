# Chenguang-Telecom/ADLA_EdgeNAT

## Resumen

El modelo `Chenguang-Telecom/ADLA_EdgeNAT` es un artefacto publicado en HuggingFace que combina dos componentes de visión por computador: el detector de bordes EdgeNAT, basado en una arquitectura Transformer con bloques DiNAT, y el algoritmo ADLA (Adaptive Dual-Constrained Line Aggregation), que agrega píxeles en segmentos de línea mediante restricciones geométricas de orientación y distancia. El repositorio contiene 10.8 GB de datos, lo que sugiere la presencia de pesos de un modelo de deep learning, aunque la model card no ofrece ninguna descripción adicional más allá de la licencia MIT.

La relevancia de este modelo radica en su potencial para tareas de extracción de bordes y segmentos de línea en imágenes, un área con aplicaciones en cartografía, análisis de documentos técnicos y visión robótica. Sin embargo, la información pública disponible es extremadamente limitada: no se especifican parámetros, arquitectura concreta, datos de entrenamiento ni resultados de benchmarks. Por tanto, cualquier evaluación rigurosa requiere contactar con el autor o consultar los repositorios de código asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere combinación de EdgeNAT, Transformer con bloques DiNAT, y ADLA como post-procesado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de visión, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repo contiene 10.8 GB, probablemente safetensors o binarios, sin confirmar) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura exacta del modelo publicado en HuggingFace. A partir de los papers asociados, se sabe que EdgeNAT es un detector de bordes de una sola etapa que utiliza una red troncal jerárquica con cuatro niveles, cada uno compuesto por un Downsampler (o Tokenizer) y múltiples bloques DiNAT (Dilated Neighborhood Attention Transformer). Estos bloques capturan información contextual global y detalles locales mediante atención de vecindad dilatada. Por otro lado, ADLA es un algoritmo implementado en C con interfaz MATLAB que procesa mapas de fuerza de bordes (ESM) generados por detectores profundos, agregando píxeles en segmentos de línea solo si cumplen dos restricciones geométricas: coherencia de orientación y distancia ortogonal acotada a un modelo de línea estimado adaptativamente.

No se han publicado detalles sobre el entrenamiento del modelo combinado, como número de tokens (imágenes), composición del dataset, o si se usó algún esquema de refuerzo o ajuste fino. La ausencia de una model card sustancial impide conocer estas especificaciones.

## Capacidades

- Detección de bordes en imágenes mediante arquitectura Transformer (EdgeNAT).
- Agregación de píxeles de borde en segmentos de línea recta mediante ADLA, con restricciones geométricas adaptativas.
- Extracción de contornos de objetos y bordes significativos en imágenes naturales.
- Posible soporte para múltiples escalas gracias a la estructura jerárquica del backbone de EdgeNAT.
- No se han documentado capacidades de generación de texto, tool calling, agentes, ni procesamiento de lenguaje natural.
- No se ha confirmado soporte para visión multimodal más allá de la detección de bordes.

## Casos de uso

- Cartografía y extracción de carreteras: el modelo puede detectar bordes de vías en imágenes aéreas o satelitales y ADLA los convierte en segmentos de línea utilizables para mapas vectoriales.
- Análisis de planos arquitectónicos: detección de muros, puertas y ventanas a partir de escaneos de planos, generando líneas limpias para CAD.
- Inspección industrial: localización de grietas o defectos lineales en superficies mediante la combinación de bordes y agregación de líneas.
- Robótica y navegación: extracción de líneas guía en entornos estructurados (pasillos, carreteras) para sistemas de control visual.
- Documentación de imágenes médicas: delineación de estructuras anatómicas lineales (vasos, huesos) en radiografías o tomografías.
- Visión para vehículos autónomos: detección de marcas viales y bordes de carretera en tiempo real, aunque el rendimiento en tiempo real no está verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los papers de EdgeNAT y ADLA reportan métricas en datasets como BSDS500 o NYUD, pero no se ha confirmado que el modelo publicado en HuggingFace corresponda exactamente a esos resultados. No se proporcionan números de MMLU, HumanEval u otros, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repo (10.8 GB) sugiere que los pesos podrían ocupar entre 2 y 8 GB en memoria según el formato y la precisión, pero no se puede precisar.
- GPU recomendadas: no disponible. Dado que es un modelo de visión Transformer, probablemente requiera al menos 8 GB de VRAM para inferencia, pero sin confirmación.
- Compatibilidad con GPU de consumo: incierta. Modelos similares de detección de bordes suelen ejecutarse en GPUs como RTX 3060 o superiores, pero no hay datos específicos.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de visión, probablemente se use con PyTorch o TensorFlow directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. Modelos alternativos de detección de bordes como HED (Holistically-Nested Edge Detection), DexiNed o PIDNet podrían ser comparables, pero no se conocen los parámetros ni el rendimiento de ADLA_EdgeNAT. Se recomienda consultar los papers originales para obtener métricas de EdgeNAT y ADLA por separado.

## Limitaciones y advertencias

- La model card no proporciona ninguna descripción, lo que impide conocer el alcance real del modelo, sus limitaciones o su uso previsto.
- No se ha verificado la calidad de los pesos publicados; podrían ser experimentales o no reproducir los resultados de los papers.
- Al ser un modelo de visión, no es adecuado para tareas de lenguaje natural.
- La licencia MIT permite uso comercial y modificación, pero el usuario debe asegurarse de que los datos de entrenamiento no tengan restricciones adicionales (no se informa al respecto).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el detector podría producir falsos positivos en bordes o líneas en imágenes con ruido o texturas complejas.
- No se han documentado sesgos, pero los detectores de bordes pueden fallar en imágenes con condiciones de iluminación extremas o dominios no representados en el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chenguang-Telecom/ADLA_EdgeNAT
- Repositorio ADLA (GitHub): https://github.com/ChenguangTelecom/adla
- Repositorio EdgeNAT (GitHub): https://github.com/jhjie/EdgeNAT
- Paper ADLA (arXiv): https://arxiv.org/abs/2508.19742v3
- Paper EdgeNAT (arXiv): https://arxiv.org/html/2408.10527v1
