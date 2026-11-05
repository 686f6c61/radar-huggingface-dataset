# ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-u5-qt-fw-hd-item-empty-coord

## Resumen

`ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-u5-qt-fw-hd-item-empty-coord` es un checkpoint derivado de Wan2.1-T2V-1.3B-Diffusers, el modelo de generación de vídeo texto-a-vídeo de Alibaba (Wan-AI). El autor, `ducvh5`, lo publica como un experimento de fine-tuning con una arquitectura recurrente de bloques (recurrent-transformer), reorganizando los bloques del modelo base en un esquema A5 → B5×4 → C5 con 15 bloques únicos y 30 ejecutados.

El modelo está etiquetado como `text-to-video` y mantiene como base el pipeline de difusión de Wan2.1 de 1.300 millones de parámetros. La model card describe una configuración de entrenamiento con pérdidas combinadas (TF, FM y TM), un schedule de ruido σ con mezcla de distribuciones lognormal y uniforme, y un dataset compuesto por datos OV y FW-HD con captions QT en proporción 50/50 entre variantes VB y full.

Un dato crítico: la propia model card indica que **no se ha guardado ningún checkpoint** en esta instantánea (`Files: 0 EMA/non-EMA weights in this snapshot; last state: none saved`). Se trata, por tanto, de una publicación de metadatos y configuración de entrenamiento sin pesos utilizables, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrent transformer (derivado de Wan2.1-T2V-1.3B-Diffusers); esquema de bloques A5 → B5×4 → C5 |
| Parametros totales | 1.300 millones (heredados del modelo base Wan2.1-T2V-1.3B) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card indica 0 pesos guardados en esta instantánea) |

## Arquitectura y entrenamiento

La arquitectura parte de Wan2.1-T2V-1.3B-Diffusers, un modelo de difusión texto-a-vídeo, y aplica una reestructuración recurrente de bloques: 5 bloques de tipo A, seguidos de 4 repeticiones de 5 bloques de tipo B, y 5 bloques de tipo C, resultando en 15 bloques únicos ejecutados 30 veces. Esta disposición busca reutilizar parámetros mediante recursión, aunque la model card no detalla el mecanismo exacto de compartición de pesos.

El entrenamiento combina tres objetivos de pérdida (TF+FM+TM). El schedule de ruido σ usa una mezcla: para q=0,5 se aplica una lognormal LN(0,1;s=2) más una uniforme U(s=5); para FM/TF se usa la distribución p_LN2/q y para TM la p_U5/q. Los datos provienen de OV, con captions QT en proporción 50/50 entre VB y full, y una mezcla 50/50 por ítem entre OV y FW-HD, con dropout configurado a "empty". No se especifica el número de tokens ni el volumen total del dataset.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), heredada del pipeline Wan2.1.
- Entrenamiento con pérdidas combinadas TF, FM y TM, orientado a modelado de flujo y matching.
- Soporte de condicionamiento por captions QT con variantes VB y full.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad adicional.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en arquitecturas recurrentes para difusión: el esquema A5 → B5×4 → C5 permite estudiar la compartición de parámetros en modelos de vídeo, comparando calidad frente al Wan2.1 base no recurrente.
- Reproducción de experimentos de entrenamiento: la model card documenta pérdidas, schedule de ruido y composición de datos, lo que facilita replicar el pipeline en entornos de investigación.
- Estudio de schedules de ruido híbridos: la combinación LN(0,1;s=2) + U(s=5) con proporciones p_LN2/q y p_U5/q es un caso concreto para analizar el efecto del muestreo de σ en difusión.
- Análisis de mezclas de datos OV/FW-HD: la proporción 50/50 por ítem y el dropout "empty" permiten evaluar el impacto de la composición del dataset en la generación de vídeo.
- Base para fine-tuning posterior: al derivar de Wan2.1-T2V-1.3B-Diffusers, sirve como punto de partida para experimentos que requieran la arquitectura recurrente, una vez se publiquen pesos.
- Docencia sobre model cards incompletas: caso práctico de publicación sin artefactos utilizables, útil para discutir buenas prácticas de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos publicados en esta instantánea).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables, ya que no se incluyen pesos; el pipeline sería el de difusión de Wan2.1, no un servidor de texto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-... (este) | 1.300 M (heredados) | no disponible | no disponible | Sin pesos publicados (0 descargas) |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.300 M | no disponible | no disponible | Pesos disponibles en HuggingFace |
| Wan2.1 (variantes mayores) | no disponible | no disponible | no disponible | Disponibles en HuggingFace |

La comparación directa se limita al modelo base, ya que no hay datos de rendimiento ni pesos del checkpoint derivado.

## Limitaciones y advertencias

- No contiene pesos: la model card indica explícitamente "0 EMA/non-EMA weights in this snapshot" y "none saved", por lo que no es usable para inferencia.
- Licencia no disponible: no se puede confirmar si permite uso comercial; el modelo base Wan2.1 tiene sus propias condiciones que deben verificarse por separado.
- Idiomas no documentados: no hay información sobre cobertura lingüística de los captions QT.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al derivar de Wan2.1, hereda los sesgos del dataset original, no descritos aquí.
- Reproducibilidad limitada: la model card documenta hiperparámetros pero no el volumen de datos ni la configuración completa de entrenamiento.
- Sin benchmarks: no es posible comparar calidad frente al modelo base ni frente a alternativas.
- Metadatos incompletos: sin descargas ni likes, sin documentación de cuantizaciones ni formatos de pesos.

## Enlaces

- [HuggingFace: ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-u5-qt-fw-hd-item-empty-coord](https://huggingface.co/ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-u5-qt-fw-hd-item-empty-coord)
- [Modelo base: Wan-AI/Wan2.1-T2V-1.3B-Diffusers](https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
