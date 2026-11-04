# RunningHubAI/rh-motioncraft-wan2.1-lora

## Resumen

rh-motioncraft-wan2.1-lora es un adaptador LoRA de 63 MiB entrenado por el usuario Leclerc y publicado por RunningHubAI para el modelo de generación de vídeo Wan2.1. Su función es introducir movimientos de cámara cinematográficos controlados mediante palabras de activación en el prompt: "cinematic camera pan", "cinematic camera zoom in" y "cinematic camera zoom out". No es un modelo de lenguaje ni un modelo base, sino un ajuste fino de bajo rango que se aplica sobre los pesos de Wan2.1.

El repositorio contiene un único archivo de pesos, `Su_MCraft_Ep60.safetensors`, y está orientado al ecosistema ComfyUI, tal y como indican las etiquetas del repositorio. La ficha del autor no documenta arquitectura, dataset de entrenamiento, hiperparámetros ni resultados de evaluación, por lo que la información técnica disponible es mínima.

Su relevancia es acotada: sirve para añadir control de movimiento de cámara en flujos de generación de vídeo con Wan2.1 dentro de ComfyUI o en la plataforma RunningHub, sin necesidad de reentrenar el modelo base. La licencia no está especificada y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Wan2.1; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (pesos LoRA de 63 MiB; el modelo base Wan2.1 no se distribuye en este repo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de activación están en inglés) |
| Licencia | no disponible; el autor indica que se siga la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`Su_MCraft_Ep60.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Wan2.1 para modificar su comportamiento sin alterar los pesos originales. El nombre del archivo, `Su_MCraft_Ep60`, sugiere un entrenamiento de 60 épocas, aunque el autor no confirma este extremo ni detalla el rango, el alpha, la tasa de aprendizaje ni las capas objetivo del adaptador.

No se ha publicado información sobre el dataset de entrenamiento: ni número de clips, ni resolución, ni duración, ni procedencia del material. Tampoco se documenta si hubo curación manual, aumento de datos o algún proceso de preferencia o refinamiento posterior. La única información funcional es la lista de tres palabras de activación asociadas a movimientos de cámara concretos, lo que indica un entrenamiento orientado a condicionar la trayectoria de cámara en la generación de vídeo.

## Capacidades

- Aplicación de paneos de cámara cinematográficos mediante la palabra de activación "cinematic camera pan".
- Aplicación de zoom de acercamiento mediante "cinematic camera zoom in".
- Aplicación de zoom de alejamiento mediante "cinematic camera zoom out".
- Integración como LoRA en flujos de generación de vídeo con Wan2.1 en ComfyUI.
- Carga y ejecución en la plataforma RunningHub, tanto en la versión internacional como en la china.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes; es exclusivamente un adaptador de control de cámara para vídeo.
- No se documentan capacidades multilingües; las palabras de activación están en inglés.

## Casos de uso

- Postproducción de tomas generadas: aplicar el LoRA sobre una generación previa con Wan2.1 para añadir un paneo o un zoom coherente sin regenerar el clip desde cero, útil cuando se quiere variar el encuadre manteniendo el contenido.
- Creación de planos de transición: generar paneos y zooms cortos que sirvan como transiciones entre escenas en un montaje, aprovechando las tres palabras de activación para elegir el tipo de movimiento.
- Storyboards animados: producir previsualizaciones con movimiento de cámara definido para presentar una secuencia a un cliente o a un equipo de producción antes del rodaje real.
- Contenido para redes sociales: generar clips verticales u horizontales con zooms de acercamiento que mantengan la atención en el sujeto, un recurso habitual en formatos cortos.
- Pruebas de concepto de dirección de fotografía: comparar variantes de un mismo plano con paneo, zoom in y zoom out para decidir el movimiento de cámara antes de invertir en producción.
- Integración en pipelines automatizados de ComfyUI: encadenar el LoRA con otros nodos de generación de vídeo para producir lotes de clips con movimientos de cámara estandarizados, por ejemplo para catálogos de producto o material de archivo.
- Experimentación en RunningHub: usar la plataforma para probar el adaptador sin infraestructura local, útil para evaluar si el estilo de movimiento encaja antes de desplegarlo en un flujo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas cuantitativas de calidad de vídeo, fidelidad al prompt, consistencia temporal ni comparaciones con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador en sí; depende enteramente del modelo base Wan2.1 y de la resolución y duración del vídeo generado, datos que no se especifican.
- GPU recomendadas: no disponible. No se documentan requisitos mínimos ni recomendados.
- Compatibilidad con GPU de consumo: no disponible. El adaptador pesa 63 MiB, pero el coste real lo determina Wan2.1, cuyos requisitos no se detallan en este repositorio.
- Opciones de despliegue: ComfyUI (indicado en las etiquetas y en la model card), plataforma RunningHub (internacional y china) y carga directa del archivo safetensors en flujos compatibles con LoRA de Wan2.1.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-motioncraft-wan2.1-lora | LoRA sobre Wan2.1 | 63 MiB de pesos LoRA | no disponible | no disponible | Hugging Face, RunningHub |
| Modelo base Wan2.1 | Modelo de generación de vídeo | no disponible en esta ficha | no disponible | no disponible en esta ficha | Repositorio upstream de Wan2.1 |
| Otros LoRA de cámara para Wan2.1 | LoRA | no disponible | no disponible | no disponible | No identificados en la información proporcionada |

No se dispone de datos de rendimiento ni de especificaciones de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos, pero al ser un adaptador de vídeo entrenado con material no especificado, puede heredar sesgos visuales y de representación del dataset de entrenamiento, que se desconoce.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, deformaciones temporales o movimientos de cámara inconsistentes, especialmente en clips largos o con prompts ambiguos.
- Las palabras de activación están en inglés; no se documenta soporte para prompts en castellano ni en otros idiomas.
- La licencia no está especificada. El autor remite a la licencia del proyecto original o del modelo upstream, por lo que el uso comercial exige verificar previamente la licencia de Wan2.1 y la del propio adaptador.
- No se documentan límites de resolución, duración de clip ni número máximo de frames; estos límites vendrán impuestos por el modelo base y por la implementación utilizada.
- El repositorio no registra descargas ni valoraciones, y el pipeline no está declarado, lo que reduce la trazabilidad y la validación comunitaria del artefacto.
- El nombre del archivo sugiere 60 épocas de entrenamiento, pero es una inferencia a partir del nombre y no un dato confirmado por el autor.
- No se ofrece información sobre el proceso de entrenamiento, lo que dificulta evaluar la reproducibilidad o la calidad del ajuste.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-motioncraft-wan2.1-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1907315070945091586
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1897206843779997698
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-motioncraft-wan2.1-lora/blob/main/README_cn.md
