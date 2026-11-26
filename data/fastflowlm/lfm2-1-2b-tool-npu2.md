# FastFlowLM/LFM2-1.2B-Tool-NPU2

## Resumen

LFM2-1.2B-Tool-NPU2 es una compilación del modelo LiquidAI/LFM2-1.2B-Tool preparada por FastFlowLM para su ejecución sobre NPU (unidades de procesamiento neuronal) mediante el runtime FastFlowLM. No se trata de un modelo entrenado desde cero, sino de una conversión del modelo base de Liquid AI orientada a la inferencia acelerada en hardware con NPU, lo que lo hace relevante para despliegues en dispositivos de borde (edge) donde la CPU y la GPU no son la mejor opción energética.

El modelo base pertenece a la familia LFM2 de Liquid AI, una arquitectura de tipo Liquid Foundation Model optimizada para entornos de borde, con aproximadamente 1.200 millones de parámetros y especialización en tool calling (llamada a funciones). Su tamaño compacto y su orientación a agentes lo sitúan en la categoría de modelos pequeños para automatización de tareas, no para razonamiento general de alta complejidad.

La ficha se ve limitada por la escasez de información publicada: la model card del repositorio es mínima y no detalla arquitectura interna, contexto, cuantizaciones ni idiomas. Los datos que se ofrecen a continuación proceden de la información disponible en Hugging Face y de lo que se puede inferir del modelo base, indicándose explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2 de Liquid AI; detalles no publicados en la informacion disponible) |
| Parametros totales | aproximadamente 1.200 millones (deducido del nombre del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (build especifico para NPU via FastFlowLM) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | no disponible (repo de 1,0 GB; formato propio del runtime FastFlowLM) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo deriva de LiquidAI/LFM2-1.2B-Tool, un modelo de la familia LFM2 de Liquid AI, que la propia empresa describe como optimizada para edge. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable de esta variante concreta no está en el entrenamiento, sino en el empaquetado: es una build para NPU distribuida por FastFlowLM, lo que implica una conversión de pesos y un formato de ejecución específicos para aprovechar aceleradores neuronales integrados. El modelo base está especializado en tool calling, según se desprende de su nombre (LFM2-1.2B-Tool).

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base.
- Tool calling / function calling: el modelo base está específicamente afinado para esta tarea, según su denominación.
- Ejecución en NPU mediante el runtime FastFlowLM, con orientación a dispositivos de borde.
- Capacidades multilingües: no disponible en la información proporcionada.
- Razonamiento avanzado, matemáticas, visión o audio: no disponible en la información proporcionada.
- Modo thinking o decodificación especulativa: no disponible en la información proporcionada.

## Casos de uso

- Automatización de agentes en dispositivos de borde: el modelo puede ejecutarse sobre NPU en equipos de consumo o industriales, permitiendo tool calling local sin depender de la nube, lo que reduce latencia y mejora la privacidad.
- Asistentes locales con llamada a funciones: integración en aplicaciones de escritorio o embebidas que necesiten invocar APIs locales (sistema de ficheros, calendario, domótica) mediante function calling.
- Enrutamiento de intenciones en pipelines de automatización: usar el modelo como clasificador y generador de llamadas estructuradas en flujos de trabajo (RPA, integración de sistemas) donde el coste por inferencia debe ser mínimo.
- Prototipado rápido de agentes sobre portátiles con NPU: gracias a su tamaño de 1,2B y a la build para NPU, permite iterar en local sin GPU dedicada.
- Procesamiento de formularios y extracción estructurada: el modelo puede generar salidas JSON mediante tool calling para poblar bases de datos a partir de texto libre.
- Filtrado y preprocesado en pipelines de datos: uso como modelo ligero para clasificar, resumir o etiquetar contenido antes de pasarlo a modelos mayores, reduciendo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para GPU; el modelo está empaquetado para NPU, no para inferencia CUDA estándar.
- GPU recomendadas: no aplica para esta build; el modelo base podría ejecutarse en GPU, pero esta variante está orientada a NPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: runtime FastFlowLM (https://github.com/FastFlowLM/FastFlowLM); otras opciones no disponibles para esta build.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparativas con otros modelos, y la build específica para NPU dificulta una comparación directa con alternativas estándar. Como referencia cualitativa, el modelo base (LiquidAI/LFM2-1.2B-Tool) sería el punto de comparación natural, pero no se dispone de sus métricas en esta ficha.

## Limitaciones y advertencias

- La model card es mínima: no se documentan sesgos, idiomas, contexto ni comportamiento esperado, lo que dificulta evaluar riesgos.
- Riesgo de alucinación inherente a modelos de 1,2B parámetros; no se han publicado evaluaciones de fidelidad.
- Licencia LFM Open License v1.0 (license: other): es necesario revisar el texto de la licencia antes de uso comercial, ya que puede imponer restricciones adicionales a las de licencias permisivas estándar.
- Build específica para NPU: no es directamente portable a otros runtimes sin conversión; el soporte de hardware depende de FastFlowLM.
- Escasez de adopción: 18 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria.
- No se dispone de información sobre el contexto máximo, lo que limita el diseño de aplicaciones que requieran ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FastFlowLM/LFM2-1.2B-Tool-NPU2
- Modelo base: https://huggingface.co/LiquidAI/LFM2-1.2B-Tool
- Runtime FastFlowLM: https://github.com/FastFlowLM/FastFlowLM
- Licencia LFM Open License v1.0: incluida en el repositorio (archivo LICENSE)
