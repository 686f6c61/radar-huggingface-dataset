# pipestream-ai/turbo-en-masc-pos-modernbert-base-2

## Resumen

turbo-en-masc-pos-modernbert-base-2 es un modelo de etiquetado de secuencias (token classification) especializado en etiquetado gramatical (POS, *part of speech*) para inglés. Lo publica pipestream-ai como artefacto del "turboembed model zoo", un formato de distribución propio que empaqueta el encoder junto con la cabeza de clasificación y un manifiesto con digests de verificación. El modelo se construye sobre el encoder answerdotai/ModernBERT-base (22 capas, dimensión oculta 768) y añade una cabeza de tipo *token tagger* para predecir 56 etiquetas POS.

El problema que resuelve es acotado pero muy común en pipelines de NLP: asignar una categoría gramatical a cada token de un texto en inglés con alta precisión y contexto largo. El modelo se ha afinado exclusivamente sobre MASC 3.0.0 (Manually Annotated Sub-Corpus del American National Corpus), con una precisión de test de 0,9617 frente a una línea base de 0,8964. Su relevancia actual es la de un componente de infraestructura lingüística: la combinación de un encoder ModernBERT con ventana de 8192 tokens y una licencia Apache-2.0 lo hace utilizable en producción sin fricción legal.

Al ser un artefacto del zoo turboembed, no se distribuye como un `pipeline` estándar de Transformers, sino que se instala por identificador a través de la librería `turboembed`, que verifica tamaño y hashes de cada fichero antes de cargarlo. El repositorio ocupa 0,6 GB, dominado por los pesos del encoder en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT) con cabeza de token classification |
| Parametros totales | no disponible (pesos del bundle: 612.061.000 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (la entrada se trunca a esa longitud) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con tokenizer.json y manifest.json) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, con 22 capas y dimensión oculta de 768, sobre el que se monta una cabeza de etiquetado de tokens (`HEAD_TOKEN_TAGGER`) para la tarea POS. El bundle incluye el encoder completo más la cabeza, el tokenizador y un fichero `reference/reference.safetensors` de 430.352 bytes que presumiblemente contiene tensores de referencia para validación. No se documentan innovaciones arquitectónicas propias más allá de las del ModernBERT base (atención con soporte para secuencias largas), ni se especifican detalles de preentrenamiento o de régimen de ajuste (learning rate, épocas, composición exacta del split) más allá del mejor epoch registrado, el 59.

El entrenamiento se realizó sobre MASC 3.0.0, el *Manually Annotated Sub-Corpus* del American National Corpus, publicado bajo CC-BY-3.0-US. No se indica el número de tokens de entrenamiento ni si hubo aumentación de datos. La evaluación registrada en el manifiesto del bundle (`head_provenance`) reporta precisión de 0,9759 en dev y 0,9617 en test, con una línea base de 0,8964 para la tarea `masc-pos`. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en una tarea discriminativa de etiquetado.

## Capacidades

- Etiquetado gramatical (POS tagging) token a token en inglés, con un conjunto fijo de 56 etiquetas definidas por el corpus de entrenamiento.
- Clasificación de secuencias con contexto de hasta 8192 tokens, adecuada para documentos largos sin truncar.
- Salida a nivel de token apta para tareas derivadas: extracción de sintagmas, análisis morfosintáctico superficial, normalización léxica.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No está diseñado para flujos de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés; no se declara transferencia a otras lenguas.
- No dispone de modo *thinking*, audio ni multimodalidad.

## Casos de uso

- Preprocesado lingüístico en pipelines de NLP: el modelo etiqueta cada token con su categoría gramatical, lo que permite filtrar sustantivos, verbos o adjetivos antes de tareas posteriores como extracción de entidades o análisis de sentimiento a nivel de aspecto.
- Análisis de corpus y lingüística computacional: con 8192 tokens de contexto, se puede procesar documentos completos (artículos, informes) sin fragmentar y obtener estadísticas POS por documento de forma consistente.
- Enriquecimiento de índices de búsqueda: añadir etiquetas POS a los tokens indexados permite construir consultas con filtros gramaticales (por ejemplo, buscar solo sintagmas nominales) en motores de búsqueda léxica.
- Normalización y limpieza de texto: la identificación de categorías gramaticales ayuda a detectar ruido (símbolos, tokens extraños) y a decidir estrategias de normalización en pipelines de ingesta.
- Anotación asistida para creación de datasets: el modelo sirve como preanotador en herramientas de etiquetado humano, reduciendo el coste de anotar nuevos corpus en inglés con precisión de test del 96,17 % sobre MASC.
- Componente en sistemas de análisis de discurso: la secuencia de etiquetas POS alimenta modelos posteriores de sintaxis o de estilo, aportando una señal lingüística barata y determinista en comparación con un LLM generativo.
- Verificación de calidad en producción: al ser un modelo pequeño (612 MB de pesos) y con licencia Apache-2.0, puede desplegarse como servicio interno de etiquetado con verificación de integridad de ficheros incluida por el propio zoo.

## Benchmarks y rendimiento

| Cabeza | Corpus | Métrica | Dev | Test | Línea base | Mejor epoch |
|---|---|---:|---:|---:|---:|---:|
| pos | MASC 3.0.0 | accuracy | 0,9759 | 0,9617 | 0,8964 | 59 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; estos no aplican a un modelo de etiquetado de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,4 GB para los 612 MB de pesos más activaciones; en fp16 aproximadamente 1,2 GB. Cifras orientativas calculadas a partir del tamaño del fichero de pesos, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobradas para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM.
- Opciones de despliegue: el modelo se instala a través de la librería `turboembed` por identificador; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, dado que es un modelo de clasificación de tokens y no generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turbo-en-masc-pos-modernbert-base-2 | no disponible (612 MB de pesos) | 8192 | POS tagging (56 etiquetas) | Apache-2.0 | Hugging Face, vía turboembed |
| answerdotai/ModernBERT-base | no disponible | 8192 | Encoder base (fine-tuning) | Apache-2.0 | Hugging Face |
| Modelos POS clásicos sobre BERT-base (p. ej., afinados sobre UD/Penn Treebank) | ~110 M | 512 | POS tagging | variable según autor | Hugging Face |

La comparación directa con alternativas concretas no está disponible en la información proporcionada: no se han publicado resultados de otros modelos POS sobre el mismo split de MASC 3.0.0, por lo que no es posible establecer una comparativa de rendimiento homogénea.

## Limitaciones y advertencias

- Entrenado únicamente sobre MASC 3.0.0; las métricas de 0,9617 corresponden al split de test de ese corpus y pueden no transferirse a otros dominios o registros (por ejemplo, texto técnico, redes sociales o lenguaje coloquial).
- Predice un conjunto fijo de 56 etiquetas; no se puede ampliar el inventario sin reentrenar la cabeza.
- Solo inglés; no se declara soporte ni evaluación en otras lenguas.
- La entrada se trunca a 8192 tokens, por lo que documentos más largos pierden información si no se segmentan.
- Riesgo de sesgo heredado del corpus MASC y del encoder ModernBERT-base; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de etiquetado erróneo en construcciones ambiguas o en vocabulario fuera de dominio.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero el corpus de entrenamiento MASC 3.0.0 está bajo CC-BY-3.0-US, lo que conviene verificar si se redistribuyen datos derivados.
- El modelo no se distribuye como pipeline estándar de Transformers; requiere la librería `turboembed` y su mecanismo de verificación de integridad, lo que añade una dependencia específica en producción.
- No hay datos publicados sobre latencia, throughput ni comportamiento en cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipestream-ai/turbo-en-masc-pos-modernbert-base-2
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Corpus MASC 3.0.0: https://anc.org/data/masc/
- American National Corpus: https://anc.org/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC-BY-3.0-US: https://creativecommons.org/licenses/by/3.0/us/
