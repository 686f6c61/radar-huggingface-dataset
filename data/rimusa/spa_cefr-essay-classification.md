# rimusa/spa_CEFR-essay-classification

## Resumen

`rimusa/spa_CEFR-essay-classification` es un modelo de clasificación de texto basado en arquitectura BERT, publicado por el usuario rimusa (Ricardo Muñoz Sánchez) en Hugging Face. Su propósito, deducible del identificador, es clasificar redacciones en español según el nivel del Marco Común Europeo de Referencia para las lenguas (MCER/CEFR), una tarea típica en evaluación automática de lenguas y en sistemas de corrección de exámenes.

El modelo cuenta con 109.854.725 parámetros, un tamaño coherente con la familia BERT-base (aproximadamente 110 millones), y se distribuye en formato safetensors con un repositorio de 0,4 GB. La model card es la plantilla autogenerada por Hugging Face y no contiene información sustantiva sobre entrenamiento, datos, licencia ni evaluación, por lo que la mayoría de especificaciones deben considerarse no disponibles.

Su relevancia es acotada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin documentación publicada. Resulta útil únicamente como referencia para pipelines de clasificación de nivel CEFR en español, y cualquier uso en producción exigiría una validación empírica propia por parte del integrador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder, según tag `bert`) |
| Parametros totales | 109.854.725 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no documentada; típicamente 512 tokens en BERT-base, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el identificador sugiere español, sin confirmar en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamaño del repositorio | 0,4 GB |
| Librería | transformers |
| Etiquetas de inferencia | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La etiqueta `bert` y el recuento de parámetros (109,85 M) apuntan a un transformer encoder de tipo BERT-base, adecuado para clasificación de secuencias mediante la representación del token `[CLS]`. No obstante, la model card no especifica la arquitectura exacta, el número de capas, la dimensión oculta ni la configuración de atención.

No hay información publicada sobre los datos de entrenamiento: ni el corpus de redacciones utilizado, ni el número de tokens, ni si se aplicó fine-tuning supervisado desde un checkpoint preentrenado (por ejemplo, BETO o MarIA), ni si hubo ajuste con RLHF/DPO (irrelevante en un encoder de clasificación). Tampoco se documentan hiperparámetros, régimen de precisión ni procedimiento de preprocesado. Todo ello debe considerarse no disponible.

## Capacidades

- Clasificación de texto: produce etiquetas de clase sobre una secuencia de entrada, presumiblemente niveles CEFR (A1, A2, B1, B2, C1, C2), aunque el mapeo exacto de etiquetas no está documentado.
- Procesamiento de redacciones en español: el identificador `spa_` sugiere entrenamiento o evaluación sobre textos en español, sin confirmación en la model card.
- Integración con `transformers`: cargable mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatibilidad con Text Embeddings Inference y endpoints de Hugging Face, según las etiquetas del repositorio.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un encoder discriminativo.
- Capacidades multilingües: no disponibles/no confirmadas.

## Casos de uso

- Evaluación automática de nivel de lengua en plataformas de e-learning: el modelo puede clasificar redacciones de alumnos en un nivel CEFR estimado, permitiendo al profesorado priorizar la revisión manual de los casos dudosos.
- Triaje en exámenes oficiales de idiomas: uso como primer filtro para asignar redacciones a evaluadores humanos según el nivel predicho, reduciendo el tiempo de corrección en convocatorias con miles de candidatos.
- Seguimiento de progreso del alumnado: clasificar periódicamente redacciones de un mismo estudiante para detectar estancamiento o mejora en su nivel de escritura a lo largo de un curso.
- Generación de material adaptado: dado un texto, estimar su nivel CEFR para etiquetar un corpus de lecturas y asignarlas a grupos de alumnos con el nivel adecuado.
- Investigación en lingüística computacional: como baseline para estudios de complejidad léxico-sintáctica y evaluación automática de la escritura en español.
- Filtrado de contenido en repositorios educativos: clasificar textos enviados por usuarios para enrutarlos a recursos de aprendizaje apropiados a su nivel declarado o detectado.
- Integración en pipelines de corrección asistida: combinar la predicción de nivel con correctores ortográficos y gramaticales para generar informes de feedback personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (109,85 M × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en fp16/bf16: aproximadamente 0,22 GB para pesos; cuantización a int8 reduciría aún más el consumo, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para GPUs de gama alta.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` con PyTorch, Text Embeddings Inference (TEI), endpoints de Hugging Face; también es viable exportarlo a ONNX o cuantizarlo para CPU.
- Latencia y throughput: no disponibles. Por el tamaño del modelo, se espera latencia de milisegundos por secuencia en GPU moderna y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para clasificación CEFR en español con los que contrastar parámetros, contexto, rendimiento o licencia. El autor publica un modelo análogo para portugués (`rimusa/por_CEFR-essay-classification`), pero tampoco hay datos de evaluación públicos. Se indica "no disponible" para una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Model card autogenerada y vacía: no hay información sobre datos, sesgos, evaluación ni uso previsto; cualquier despliegue requiere validación propia.
- Licencia no disponible: no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor antes de integrarlo en producción.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de predicciones erróneas o sobreconfiadas en clasificación, especialmente en textos limítrofes entre niveles.
- Sesgos potenciales desconocidos: al no documentarse el corpus de entrenamiento, no puede evaluarse el sesgo por género, variedad dialectal del español o tipo de texto.
- Longitud de contexto no confirmada: si se trata de BERT-base, textos superiores a 512 tokens requerirían truncamiento o segmentación, con posible pérdida de información.
- Idiomas soportados no confirmados: aunque el identificador apunta al español, no hay garantía de comportamiento en otras lenguas.
- Cero descargas y cero likes: modelo sin validación comunitaria, lo que incrementa el riesgo de defectos no detectados.
- Sin métricas de evaluación publicadas: imposible estimar precisión, recall o F1 por nivel CEFR sin ejecutar una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rimusa/spa_CEFR-essay-classification
- Modelo análogo para portugués: https://huggingface.co/rimusa/por_CEFR-essay-classification
- Perfil del autor en Hugging Face: https://huggingface.co/rimusa
- Datasets del autor: https://huggingface.co/rimusa/datasets
- Página personal del autor: https://rimusa.github.io
- Paper de referencia citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
