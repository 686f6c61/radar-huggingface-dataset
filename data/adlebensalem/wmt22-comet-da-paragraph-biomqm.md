# AdleBenSalem/wmt22-comet-da-paragraph-biomqm

## Resumen

El modelo `wmt22-comet-da-paragraph-biomqm` es una adaptación de la métrica de evaluación de traducción automática COMET, desarrollada por AdleBenSalem. Se trata de un fine-tuning del modelo base `Unbabel/wmt22-comet-da` (un encoder XLM-R large con cabeza de regresión) sobre datos de párrafos anotados con MQM (Multidimensional Quality Metrics) en el dominio biomédico. El objetivo es estudiar cómo se comportan las métricas de MT aprendidas cuando se aplican a entradas de múltiples frases, en lugar de segmentos individuales.

El modelo está entrenado con ventanas de longitud variable (1, 2, 3, 4 y 6 segmentos consecutivos) extraídas del dataset `AdleBenSalem/bio-mqm-paragraphs`, que cubre 8 direcciones de traducción entre inglés y alemán, español, francés y ruso. La salida es una puntuación en el intervalo (0, 1) que representa la penalización MQM normalizada por par de idiomas, donde valores más altos indican mejor calidad. Este checkpoint concreto corresponde a la época 5 de un entrenamiento de 25 épocas, seleccionado por early stopping sobre el Kendall τ de validación (0.362).

La relevancia de este modelo radica en su contribución a la investigación sobre métricas de evaluación de MT a nivel de documento o párrafo, un área poco explorada frente a la evaluación segmento a segmento. No está pensado como un reemplazo general de `wmt22-comet-da`, sino como una herramienta experimental para analizar el efecto de la longitud del contexto en la fiabilidad de las métricas aprendidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-R large encoder + regression head (COMET) |
| Parametros totales | no disponible (basado en XLM-R large, no se especifica el número exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncamiento del encoder XLM-R) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, es, fr, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de COMET (.ckpt) |

## Arquitectura y entrenamiento

El modelo parte de `Unbabel/wmt22-comet-da`, que emplea un encoder XLM-R large (560M de parámetros aproximadamente, aunque no se confirma en la documentación) con una cabeza de regresión para producir puntuaciones de calidad. El fine-tuning se realiza sobre ventanas de párrafos de longitud equilibrada (k ∈ {1, 2, 3, 4, 6} segmentos consecutivos) del dataset Bio-MQM, con 8 direcciones de traducción (en↔de, en↔es, en↔fr, en↔ru). Cada ventana contribuye por igual al entrenamiento.

El objetivo de entrenamiento es la media de las penalizaciones MQM a nivel de segmento dentro de cada ventana, normalizada con z-score y transformada con una función sigmoide por par de idiomas. El entrenamiento sigue el esquema de continue-training de COMET: el encoder se descongela después del 30 % de la primera época, mientras que los embeddings permanecen congelados. Se usa early stopping sobre el Kendall τ de validación con paciencia 20, y el mejor checkpoint (época 5) alcanza un valor de 0.362 en las ventanas de validación retenidas.

## Capacidades

- Evaluación de calidad de traducción a nivel de párrafo (múltiples frases), a diferencia de las métricas segmento a segmento.
- Métrica reference-based: requiere una traducción de referencia para calcular la puntuación.
- Soporte multilingüe para inglés, alemán, español, francés y ruso, con normalización específica por par de idiomas.
- Estimación de calidad (quality estimation) en el sentido de que produce una puntuación continua, aunque no es una métrica sin referencia (reference-free).
- Adecuado para investigación sobre el comportamiento de métricas aprendidas con entradas largas y sobre la influencia del contexto en la evaluación de MT.
- Integrable en pipelines de evaluación mediante la librería `unbabel-comet`, con carga directa desde HuggingFace.

## Casos de uso

- Investigación académica sobre métricas de evaluación de MT: permite analizar cómo varía la fiabilidad de COMET cuando se evalúan párrafos completos en lugar de frases aisladas, y comparar con el comportamiento del modelo base.
- Evaluación de sistemas de traducción biomédica: al estar entrenado con datos MQM de este dominio, puede utilizarse para medir la calidad de traducciones de textos médicos o científicos, donde la precisión terminológica es crítica.
- Comparación de sistemas de traducción automática en dominios especializados: se puede emplear para rankear diferentes motores de MT (p. ej., basados en Transformer, LLM, etc.) sobre corpus de párrafos, obteniendo una puntuación agregada por documento.
- Análisis de la influencia de la longitud del contexto en la evaluación: al entrenar con ventanas de distinta longitud, el modelo permite estudiar si las métricas aprendidas son consistentes al pasar de segmentos a párrafos, lo que es útil para diseñar protocolos de evaluación más robustos.
- Filtrado de datos de entrenamiento para MT: la puntuación del modelo puede usarse para seleccionar o ponderar traducciones de alta calidad en corpus paralelos biomédicos, mejorando la calidad de los datos de entrenamiento de sistemas de traducción.
- Desarrollo de nuevas métricas de evaluación: sirve como punto de partida para experimentar con arquitecturas o funciones de pérdida alternativas orientadas a la evaluación a nivel de documento, dado que su código y configuración están disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato reportado es el Kendall τ de validación de 0.362 sobre las ventanas de párrafos retenidas (todos los k combinados), obtenido en la época 5. No se proporcionan comparaciones con otras métricas ni con el modelo base en tareas estándar como WMT.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- El tamaño del repositorio es de 2.3 GB, lo que sugiere que los pesos del modelo ocupan aproximadamente esa cantidad (incluyendo el checkpoint y posibles archivos auxiliares).
- Al estar basado en XLM-R large, se recomienda una GPU con al menos 16 GB de VRAM para inferencia con batch razonable (p. ej., NVIDIA V100, RTX 3090, A100). Para batch pequeños (8 o menos), una GPU con 8-12 GB podría ser suficiente, pero no está confirmado.
- El despliegue se realiza mediante la librería `unbabel-comet`, que permite cargar el checkpoint directamente. No se mencionan opciones como vLLM u Ollama, ya que no es un modelo generativo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. El modelo es un fine-tuning de `Unbabel/wmt22-comet-da`, por lo que su comportamiento es similar al de este último, pero con una escala de puntuación diferente y un sesgo hacia el dominio biomédico. Otras métricas de MT como COMET-22, BLEURT o MetricX no se han comparado en la documentación proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La escala de puntuación difiere del modelo base: las salidas están en (0, 1) sobre una escala de penalización MQM normalizada por par de idiomas, por lo que no son comparables con las puntuaciones DA de COMET ni entre distintos pares de idiomas.
- El modelo está entrenado exclusivamente con datos biomédicos; su comportamiento en otros dominios puede verse afectado por el cambio de dominio, aunque hereda las capacidades generales del modelo base.
- La longitud de contexto está limitada a aproximadamente 512 tokens del encoder XLM-R; entradas más largas se truncan, lo que puede degradar la evaluación de párrafos extensos.
- No está diseñado como un reemplazo general de `wmt22-comet-da` para la evaluación de traducciones en producción; su uso previsto es la investigación sobre el comportamiento de métricas con entradas largas.
- No se han reportado análisis de sesgos o alucinaciones, pero al ser una métrica basada en regresión, no genera texto, por lo que el riesgo de alucinación no aplica. Sin embargo, puede presentar sesgos en la puntuación dependiendo del par de idiomas o del dominio, dado el desequilibrio potencial en los datos de entrenamiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AdleBenSalem/wmt22-comet-da-paragraph-biomqm)
- [Dataset de entrenamiento: AdleBenSalem/bio-mqm-paragraphs](https://huggingface.co/datasets/AdleBenSalem/bio-mqm-paragraphs)
- [Modelo base: Unbabel/wmt22-comet-da](https://huggingface.co/Unbabel/wmt22-comet-da)
- [Paper de COMET (Rei et al., 2022)](https://aclanthology.org/2022.wmt-1.60/)
- [Paper de Bio-MQM (Zouhar et al., 2024, arXiv:2402.18747)](https://arxiv.org/abs/2402.18747)
