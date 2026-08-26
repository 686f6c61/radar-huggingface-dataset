# hannah-khallaf/e2r-strategy-gemma-3-12b-pairwise-qlora

## Resumen

El modelo `e2r-strategy-gemma-3-12b-pairwise-qlora`, desarrollado por hannah-khallaf, es un adaptador PEFT/QLoRA construido sobre el modelo base `google/gemma-3-12b-it`. Su función es clasificar de forma multilabel las estrategias de simplificación de textos Easy-to-Read (E2R): dado un par formado por una oración estándar y su reescritura en lectura fácil, el modelo evalúa de forma independiente seis estrategias candidatas (sinonimia, modulación, compresión, explicación, cambio sintáctico y omisión).

El adaptador utiliza una formulación pairwise de relevancia binaria: para cada etiqueta candidata, decide mediante las probabilidades del siguiente token (`true` o `false`) si la estrategia está presente en el par. El checkpoint publicado corresponde a la semilla 13 de una repetición de reproducibilidad del benchmark de seis etiquetas, ya que el checkpoint histórico original no estaba disponible. Es relevante porque aborda un problema concreto de accesibilidad lingüística con un enfoque reproducible y métricas documentadas.

El repositorio contiene únicamente el adaptador QLoRA (0,3 GB), no el modelo base fusionado, por lo que su uso requiere cargar Gemma 3 12B Instruct y aplicar el adaptador mediante la librería PEFT. La licencia del adaptador no está especificada en la ficha, y el uso del modelo base queda sujeto a los términos de Google para Gemma 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3 12B Instruct) con adaptador QLoRA |
| Parametros totales | ~12 000 millones (modelo base) + adaptador QLoRA de tamaño reducido |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (modelo base Gemma 3) |
| Tipos de cuantizacion | QLoRA (cuantización de 4 bits durante el entrenamiento) |
| Idiomas soportados | No disponible para el adaptador; el modelo base soporta más de 140 idiomas |
| Licencia | No disponible para el adaptador; el modelo base está sujeto a los términos de Google Gemma |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 12B Instruct, un transformer decoder autoregresivo de Google DeepMind con ventana de contexto de 128K tokens y capacidades multimodales. Sobre esta base se entrenó un adaptador QLoRA, lo que permite ajustar el modelo con un coste computacional reducido manteniendo congelados los pesos del modelo base.

La formulación de entrenamiento es pairwise con relevancia binaria: para cada par de oraciones (oración estándar + reescritura E2R), el modelo evalúa cada una de las seis etiquetas de estrategia de forma independiente. Durante el entrenamiento se incluyeron todas las etiquetas candidatas negativas. La decisión de clasificación se basa en las probabilidades del siguiente token de `true` y `false` bajo la plantilla de chat de Gemma 3. No se especifican en la documentación disponible ni el número de tokens de entrenamiento ni la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Clasificación multilabel de seis estrategias de simplificación E2R: sinonimia, modulación, compresión, explicación, cambio sintáctico y omisión.
- Evaluación pairwise: toma como entrada una oración estándar y su reescritura en lectura fácil, y puntúa cada estrategia de forma independiente.
- Decisión basada en probabilidades de token (`true`/`false`), integrada con la plantilla de chat de Gemma 3.
- Umbrales por estrategia seleccionados sobre el conjunto de desarrollo, proporcionados en `thresholds.json`.
- Capacidades multilingües heredadas del modelo base Gemma 3 (más de 140 idiomas), aunque no se documenta el rendimiento del adaptador por idioma.
- No soporta tool calling ni razonamiento multi-paso: es un clasificador especializado, no un agente generalista.

## Casos de uso

- Control de calidad en producción de contenidos en lectura fácil: el modelo puede verificar automáticamente si una reescritura E2R aplica correctamente las estrategias esperadas, reduciendo la revisión manual en editoriales y organismos públicos que publican textos accesibles.
- Investigación en simplificación de textos: permite etiquetar corpus de pares oración-original/oración-simplificada para estudios lingüísticos sobre qué estrategias se emplean con mayor frecuencia y en qué contextos.
- Evaluación comparativa de sistemas de simplificación automática: al clasificar las estrategias aplicadas por distintos generadores E2R, se puede comparar su comportamiento y detectar carencias sistemáticas (por ejemplo, ausencia de explicaciones o exceso de omisiones).
- Formación de redactores de lectura fácil: el modelo puede usarse como herramienta pedagógica para que redactores en formación comprueben qué estrategias han aplicado en sus reescrituras y reciban retroalimentación objetiva.
- Desarrollo de métricas automáticas de calidad E2R: las predicciones del clasificador pueden integrarse en pipelines de evaluación para puntuar la adecuación de textos simplificados sin intervención humana.
- Adaptación de materiales educativos: instituciones educativas pueden emplear el modelo para auditar la accesibilidad de sus materiales y asegurar que las simplificaciones siguen criterios consistentes antes de su publicación.

## Benchmarks y rendimiento

El autor documenta métricas sobre el conjunto de desarrollo y de test del benchmark E2R de seis etiquetas:

| Metrica | Desarrollo | Test |
|---|---|---|
| Macro-F1 | 0,7135 | 0,6410 |
| Micro-F1 | 0,7740 | 0,7034 |
| Exact-set accuracy | 0,3359 | 0,1637 |
| Hamming loss | 0,1813 | 0,2456 |

Se observa una caída notable entre desarrollo y test, especialmente en exact-set accuracy (de 0,336 a 0,164), lo que sugiere cierto sobreajuste a los umbrales seleccionados sobre el conjunto de desarrollo. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador QLoRA pesa 0,3 GB, pero requiere cargar el modelo base Gemma 3 12B Instruct completo, que domina los requisitos de memoria.
- VRAM estimada para inferencia: aproximadamente 24 GB con cuantización de 4 bits; sin cuantización, el modelo base en precisión completa requiere alrededor de 48 GB.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB o H100 para inferencia con margen; una sola GPU consumer de 24 GB puede ser suficiente con cuantización.
- Opciones de despliegue: el adaptador PEFT se carga con la librería `peft` de Hugging Face; la inferencia requiere aplicar la formulación de prompting específica del benchmark E2R (véase `inference.py` incluido en el repositorio).
- No se documentan datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

El mismo autor publica otros dos clasificadores de estrategias E2R con arquitecturas más ligeras:

| Modelo | Arquitectura | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| e2r-strategy-gemma-3-12b-pairwise-qlora | Gemma 3 12B + QLoRA | ~12B (base) | 128K | No disponible |
| e2r-strategy-xlmr-large-focal | XLM-R Large (focal loss) | ~560M | 512 tokens | No disponible |
| e2r-strategy-multilingual-e5-large-bce | Multilingual E5 Large (BCE) | ~560M | 512 tokens | No disponible |

El modelo Gemma 3 ofrece una ventana de contexto muy superior y capacidades multilingües más amplias, pero a costa de un coste de inferencia mucho mayor. Los modelos XLM-R y E5 son más adecuados para despliegue en entornos con recursos limitados. No se dispone de resultados comparativos de los tres modelos en el mismo benchmark en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador PEFT, no un modelo fusionado; cargarlo como un pipeline genérico de clasificación de texto no reproduce la tarea. Es imprescindible usar la formulación de prompting del benchmark E2R (véase `inference.py`).
- El uso del modelo base Gemma 3 12B Instruct está sujeto a los términos de licencia de Google, independientemente de la licencia del adaptador, que no está especificada.
- La caída de rendimiento entre desarrollo y test (especialmente en exact-set accuracy) sugiere que los umbrales seleccionados pueden no generalizar bien a nuevos datos.
- No se documentan sesgos conocidos ni evaluación por idioma; el rendimiento multilingüe real del adaptador es desconocido aunque el modelo base soporte 140+ idiomas.
- Riesgo de alucinación inherente al modelo base Gemma 3 en la generación de tokens, aunque la tarea se limita a la clasificación binaria por etiqueta.
- No se especifica la composición del dataset de entrenamiento ni su procedencia, lo que dificulta evaluar posibles sesgos en los pares oración/reescritura utilizados.
- El checkpoint publicado no es el histórico original del experimento, sino una repetición (semilla 13); los resultados pueden diferir ligeramente de los publicados originalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hannah-khallaf/e2r-strategy-gemma-3-12b-pairwise-qlora
- Modelo base Gemma 3 12B Instruct: https://huggingface.co/google/gemma-3-12b-it
- Repositorio Gemma 3 en GitHub: https://github.com/gemma-3/gemma-3
- Repositorio oficial Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Modelo relacionado del mismo autor (XLM-R focal): https://huggingface.co/hannah-khallaf/e2r-strategy-xlmr-large-focal
- Modelo relacionado del mismo autor (E5 BCE): https://huggingface.co/hannah-khallaf/e2r-strategy-multilingual-e5-large-bce
