# Civimatica/blue-marble-clouds

## Resumen

Blue Marble Clouds es un modelo de segmentación de imágenes orientado a la observación de la Tierra, desarrollado por Civimatica y publicado en Hugging Face bajo el identificador `Civimatica/blue-marble-clouds`. Su propósito es la detección y segmentación de nubes en imágenes de satélite, con foco declarado en datos Sentinel-2 y en despliegue en entornos de borde (*edge AI*). Se distribuye con pesos en formato ONNX y safetensors, e incluye una variante cuantizada a int8, lo que sugiere un diseño orientado a inferencia eficiente fuera de grandes centros de datos.

El modelo se enmarca en la línea de producto de Civimatica, empresa que declara construir modelos de IA física para espacio urbano y para los dispositivos de sensado donde se ejecutan. La ficha pública es extremadamente escasa: no se documentan arquitectura, número de parámetros, longitud de contexto ni composición del dataset de entrenamiento, por lo que buena parte de las especificaciones habituales quedan como no disponibles.

Su relevancia inmediata es acotada pero concreta: la máscara de nubes es un paso previo obligatorio en prácticamente cualquier pipeline de teledetección óptica, ya que permite descartar píxeles contaminados antes de calcular índices de vegetación, detectar cambios o alimentar modelos aguas abajo. La disponibilidad de pesos ONNX int8 lo hace candidato para preprocesado en el propio satélite o en estaciones terrestres con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de segmentación de imágenes) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (no aplica a segmentación por parche) |
| Tipos de cuantizacion | int8 (variante publicada); pesos safetensors en precisión original no especificada |
| Idiomas soportados | no disponible (tarea no lingüística) |
| Licencia | Apache 2.0 (según tag del repositorio) |
| Formato de pesos | ONNX y safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. Por la tarea declarada (`image-segmentation`) y por la presencia de pesos ONNX, se trata presumiblemente de una red de segmentación semántica o binaria que opera sobre parches de imagen y devuelve una máscara de nubes, pero el tipo de backbone, el mecanismo de agregación de contexto y el tamaño de entrada no están documentados.

Tampoco hay datos sobre el volumen de entrenamiento, la composición del dataset, el uso de datos Sentinel-2 en las bandas concretas, ni sobre si se aplicaron técnicas de aumento de datos, destilación o ajuste fino supervisado. La única señal técnica fiable es la existencia de una variante int8, que implica un proceso de cuantización posterior al entrenamiento o de entrenamiento con cuantización consciente.

## Capacidades

- Segmentación de nubes en imágenes de satélite, con orientación declarada a Sentinel-2.
- Salida de máscara de segmentación utilizable como paso de enmascarado previo en pipelines de teledetección.
- Inferencia en formato ONNX, apta para ejecución con ONNX Runtime en CPU, GPU o aceleradores de borde.
- Variante cuantizada a int8 para reducir huella de memoria y coste computacional en dispositivos limitados.
- Etiquetado del repositorio como *edge-ai*, lo que indica intención de despliegue en el dispositivo y no solo en servidor.
- No consta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, por tratarse de un modelo de visión.
- No consta capacidad de visión general más allá de la segmentación de nubes.

## Casos de uso

- Enmascarado previo en pipelines de índices de vegetación: el modelo genera una máscara de nubes que se aplica sobre las bandas de Sentinel-2 antes de calcular NDVI u otros índices, evitando falsos negativos por píxeles cubiertos.
- Detección de cambios multi-temporales: al filtrar escenas nubosas de forma automática, se reduce el número de pares de imágenes válidos necesarios para comparar dos fechas y se mejora la fiabilidad de las alertas.
- Preprocesado en estaciones terrestres de recepción: la variante ONNX int8 permite ejecutar el filtrado en el nodo de descarga, descartando escenas inútiles antes de almacenarlas o transmitirlas.
- Despliegue en borde sobre hardware de bajo consumo: la cuantización int8 está pensada para ejecutarse en dispositivos tipo Jetson o aceleradores NPU en campo, donde no hay GPU de datacenter.
- Control de calidad de catálogos de imágenes: uso como clasificador automático para etiquetar el porcentaje de cobertura nubosa de cada escena en un archivo y priorizar las escenas limpias.
- Alimentación de modelos aguas abajo de segmentación de suelo o edificación: la máscara de nubes actúa como canal auxiliar de entrada que mejora la robustez de modelos entrenados con datos parcialmente nubosos.
- Filtrado previo en tareas de monitorización agrícola: descartar píxeles nubosos antes de estimar estrés hídrico o estado fenológico en parcelas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el número de parámetros ni la resolución de entrada.
- GPU recomendadas: no disponible; por el etiquetado *edge-ai* e int8, el objetivo declarado son aceleradores de borde más que GPU de datacenter.
- Compatibilidad con GPU de consumo: no confirmada; la existencia de pesos ONNX permite en principio ejecución en CPU y en GPU de consumo mediante ONNX Runtime, pero no hay cifras publicadas.
- Opciones de despliegue: ONNX Runtime (formato principal publicado); safetensors para carga en frameworks de deep learning; no consta soporte explícito de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de segmentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Civimatica/blue-marble-clouds | Segmentación de nubes Sentinel-2 | no disponible | no aplica | Apache 2.0 | ONNX, safetensors |
| Alternativas de segmentación de nubes | Segmentación de nubes | no disponible | no aplica | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría. Los datos públicos del repositorio no incluyen métricas de precisión, IoU ni comparaciones con otros modelos de enmascarado de nubes.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: no hay model card con arquitectura, datos de entrenamiento ni métricas, lo que impide evaluar su calidad antes de desplegarlo.
- Sin benchmarks publicados: no se puede verificar su precisión en detección de nubes finas, cirros, sombras de nube o nieve, casos clásicos de confusión en teledetección óptica.
- Riesgo de falsos positivos sobre superficies brillantes: sin datos de validación no se puede descartar confusión con nieve, salinas, tejados claros o arena.
- Cero descargas y cero interacciones en el repositorio en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- La licencia aparece como Apache 2.0 en los tags pero como no disponible en los metadatos de la ficha; conviene verificar el archivo LICENSE del repositorio antes de un uso comercial.
- Ámbito restringido a Sentinel-2 según los tags: su transferencia a otros sensores (Landsat, MODIS, imágenes de dron) no está documentada y probablemente requiera reentrenamiento.
- La variante int8 puede degradar la precisión en bordes de nube; no hay datos publicados sobre la pérdida de calidad respecto a los pesos originales.
- Sin información sobre sesgos geográficos del dataset de entrenamiento: no se sabe si cubre latitudes altas, trópicos o zonas áridas con la misma calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Civimatica/blue-marble-clouds
- Página de modelos de Civimatica: https://www.civimatica.com/models
- Sitio corporativo de Civimatica: https://www.civimatica.com/
