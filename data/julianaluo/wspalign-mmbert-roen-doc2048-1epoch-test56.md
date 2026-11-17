# JulianaLuo/WSPAlign-mmBERT-roen-doc2048-1epoch-test56

## Resumen

WSPAlign mmBERT Ro-En es un modelo especializado en alineamiento de palabras (word alignment) a nivel de documento para el par de idiomas rumano-inglés. Lo desarrolla JulianaLuo y se construye sobre la arquitectura ModernBERT, concretamente inicializando desde el checkpoint `WSPAlign-mmBERT-384-1epoch-lr3e-6` y afinándolo durante una época sobre un corpus paralelo de artículos periodísticos rumanos e ingleses. No es un modelo generativo ni un asistente conversacional: es un encoder discriminativo pensado para predecir correspondencias token a token entre dos secuencias.

El modelo resuelve un problema clásico en procesamiento de lenguas y en pipelines de traducción automática: identificar qué palabra de la frase origen se corresponde con qué palabra de la frase destino. La particularidad de esta versión es que opera a nivel de documento con una ventana de hasta 2048 tokens, lo que permite capturar dependencias de alineamiento que se pierden cuando se procesa frase por frase de forma aislada.

Con 307.531.778 parámetros (aproximadamente 307 millones) y un repositorio de 1,3 GB en formato safetensors, es un modelo de tamaño medio que puede ejecutarse en hardware de consumo. Su relevancia es acotada: se trata de un checkpoint de investigación con muy pocas descargas y sin licencia declarada, orientado a experimentación en alineamiento documental rumano-inglés más que a despliegue en producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, base mmBERT) |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de entrada declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | rumano (ro), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, la familia de encoders transformer de BERT actualizada con atención optimizada, RoPE y otras mejoras de eficiencia para contextos largos. El tokenizador empleado es `jhu-clsp/mmBERT-base`, un tokenizador multilingüe de la iniciativa mmBERT. La tarea es de alineamiento de palabras: dado un par de secuencias (origen y destino), el modelo produce predicciones de correspondencia entre tokens, típicamente mediante una cabeza de clasificación sobre pares de representaciones.

El entrenamiento consistió en un ajuste fino de una época con tasa de aprendizaje 3e-6, partiendo del checkpoint `WSPAlign-mmBERT-384-1epoch-lr3e-6`. El corpus de entrenamiento son artículos paralelos rumano-inglés: los artículos 1, 2, 3, 4, 7, 8, 9 y 10, que suman 203 pares de frases. El conjunto de test reservado son los artículos 5 y 6, con 45 pares de frases. El autor advierte explícitamente que el artículo 10 forma parte del entrenamiento y no debe usarse como test reservado para este checkpoint. La escala del corpus es muy reducida, lo que condiciona fuertemente la generalización del modelo. No se documentan detalles sobre composición lingüística más allá del par ro-en, ni sobre técnicas de regularización o aumento de datos.

## Capacidades

- Alineamiento de palabras (word alignment) entre rumano e inglés a nivel de token.
- Procesamiento a nivel de documento con ventana de hasta 2048 tokens, lo que permite alinear pares de textos largos sin fragmentarlos en frases.
- Predicción de correspondencias léxicas bidireccional (origen-destino y destino-origen, según la formulación WSPAlign).
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al par rumano-inglés declarado.

## Casos de uso

- Anotación automática de corpus paralelos: el modelo puede prealinear pares de frases rumano-inglés extraídos de documentos largos para acelerar la revisión manual en proyectos de lingüística de corpus, aprovechando su ventana de 2048 tokens para mantener contexto documental.
- Evaluación de sistemas de traducción automática: las alineaciones predichas permiten calcular métricas de calidad a nivel de palabra (por ejemplo, precisión de alineamiento) y detectar desalineaciones sistemáticas en la salida de un motor de MT.
- Extracción de diccionarios bilingües: a partir de corpus paralelos, el modelo identifica pares de palabras equivalentes que pueden alimentar léxicos o memorias de traducción para traductores.
- Proyección de anotaciones entre idiomas: si se dispone de etiquetas a nivel de token en el lado inglés, las alineaciones permiten transferirlas al lado rumano en tareas de etiquetado morfosintáctico o reconocimiento de entidades.
- Investigación en alineamiento documental: sirve como checkpoint de referencia para estudiar el efecto del contexto largo (2048 frente a 384 tokens) en la calidad del alineamiento en lenguas de recursos medios como el rumano.
- Preprocesamiento en pipelines de traducción asistida por ordenador: la alineación a nivel de documento puede integrarse en herramientas de traducción asistida para resaltar correspondencias entre segmentos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos (307 M de parámetros × 4 bytes), más activaciones y memoria del tokenizador; en la práctica, entre 2 y 3 GB.
- En fp16/bf16: alrededor de 0,6 GB para pesos, con un total estimado de 1,5-2 GB incluyendo activaciones para secuencias de 2048 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1660, RTX 2060 y superiores.
- Opciones de despliegue: Hugging Face Transformers (carga estándar de safetensors), ONNX Runtime si se exporta, y potencialmente vLLM o TGI aunque no están optimizados para tareas de clasificación/alineamiento. No hay evidencia de soporte en llama.cpp u Ollama por el formato y la tarea.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WSPAlign mmBERT Ro-En (este) | 307 M | 2048 | Alineamiento de palabras ro-en | no disponible | Hugging Face |
| WSPAlign-mmBERT-384-1epoch-lr3e-6 (checkpoint base) | no disponible | 384 | Alineamiento de palabras | no disponible | Hugging Face |
| SimAlign / Awesome-align (referencias clásicas) | variable (BERT-base ~110 M) | 512 | Alineamiento de palabras multilingüe | MIT / Apache-2.0 (según variante) | GitHub / Hugging Face |

La comparación directa con SimAlign o Awesome-align es aproximada: son enfoques de alineamiento basados en embeddings contextuales de BERT multilingüe, con ventanas de 512 tokens y licencias permisivas, mientras que este checkpoint está especializado en ro-en y amplía el contexto a 2048 tokens, pero carece de licencia declarada y de resultados publicados que permitan comparar calidad.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (203 pares de frases de 8 artículos), lo que limita la generalización a dominios distintos del periodístico.
- El artículo 10 está incluido en entrenamiento; usarlo como test invalida cualquier evaluación de generalización.
- Solo cubre el par rumano-inglés; no se ha validado para otras combinaciones lingüísticas.
- No se declara licencia, por lo que el uso comercial queda en un limbo legal: debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de alineaciones espurias en pares de tokens con baja frecuencia o en construcciones sintácticas complejas.
- Modelo con 0 descargas y 0 likes: sin validación externa ni informes de terceros sobre su calidad.
- No hay información sobre sesgos demográficos o de género en el corpus; al ser textos periodísticos, pueden reflejarse sesgos editoriales de las fuentes.
- No se documentan métricas de alineamiento (AER, precisión, recall), por lo que no es posible verificar empíricamente su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JulianaLuo/WSPAlign-mmBERT-roen-doc2048-1epoch-test56
- Checkpoint de inicialización: https://huggingface.co/JulianaLuo/WSPAlign-mmBERT-384-1epoch-lr3e-6
- Tokenizador base: https://huggingface.co/jhu-clsp/mmBERT-base
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
