# AbstractPhil/geolip-bytelex

## Resumen

geolip-bytelex es un sistema de matriz de traducción entre lenguajes de tokenizer y lenguaje de bytes, desarrollado por AbstractPhil como parte del programa AlephLLM / Mini-Beatrix. No es un modelo de lenguaje con pesos entrenados, sino una infraestructura model-free que proyecta cualquier token de diversos tokenizers sobre una estructura relacional derivada de estadísticas de corpus de bytes. El problema que resuelve es el desajuste entre tokenizers heterogéneos (byte-BPE, SentencePiece, WordPiece, tiktoken, etc.) y modelos que operan directamente sobre bytes (ByteLM), permitiendo que cualquier modelo byte-native consuma supervisión de tokenizers externos mediante destilación, alineación o evaluación.

La relevancia actual radica en que los modelos byte-level están ganando tracción por su robustez multilingüe y su capacidad de procesar texto arbitrario sin vocabularios fijos, pero carecen de herramientas estandarizadas para transferir conocimiento desde modelos token-based. Esta matriz actúa como puente reutilizable, independiente de los pesos de cualquier modelo concreto. El repositorio aloja los artefactos: tablas de vocabulario normalizadas, estadísticas de corpus (byte_lexicon_v1) y matrices de traducción completas para doce tokenizers de referencia. El tamaño del repositorio es de 0,2 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matriz relacional byte-token (model-free, no es una red neuronal) |
| Parametros totales | no aplica (no hay pesos de modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del consumidor ByteLM) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (el sistema opera sobre bytes, independiente de idioma) |
| Licencia | MIT |
| Formato de pesos | JSONL (vocab_*.jsonl, matrix_*.jsonl, byte_lexicon_v1/) |

## Arquitectura y entrenamiento

geolip-bytelex no se entrena en el sentido convencional: se construye a partir de estadísticas de corpus de bytes. La arquitectura es una serie de vistas relacionales gram-modulares: n-gramas exactos de caracteres (n=1 a 4), n-gramas hasheados de clase 9 y word-gramas mediante un predicado separador. Estas vistas se declaran, no se hardcodean, lo que permite añadir nuevas (quadgram, wordgram combos) según la tarea. El alfabeto es un parámetro de esquema (actualmente 256 valores de byte) y puede crecer o encogerse; el sistema se regenera automáticamente.

El proceso de construcción implica alimentar un flujo de bytes de corpus a un objeto `ByteLexicon(GramSchema(...))`, que calcula entropía de límites (sucesor branching entropy) y PMI interno (cohesión) para cada unidad. Los tokens especiales (control) se tabulan y se marcan explícitamente, nunca se expanden silenciosamente a estadísticas de texto. La matriz resultante asigna a cada token no especial un perfil relacional: `hmax`/`hargmax` (máximo de entropía de límites internos), `pmin` (PMI mínimo de cohesión) y `word` (estatus de word-gram). La referencia técnica principal es la familia ALM (arXiv:2503.20083) y el trabajo de Phan et al. (ICLR 2025) sobre conversión exacta de logits a byte space.

## Capacidades

- Traducción token-a-bytes: normaliza cualquier token de tokenizers heterogéneos a su expansión byte exacta, con tabla `vocab_<tokenizer>.jsonl` que incluye id, hex, texto (nulo si no es UTF-8 válido), número de bytes, flag de especial y flag de continuación.
- Alineación de límites: identifica dónde el lenguaje de bytes considera que un token se divide (entropía de límites) y cuán cohesivo es (PMI), permitiendo alinear tokens de profesores externos con unidades byte-nativas.
- Soporte de destilación: proporciona primitivas de pérdida para destilar logits de cualquier profesor token-level a un estudiante ByteLM, con pesos por token basados en cohesión y división de tokens no cohesivos en sus máximos de entropía interna.
- Compatibilidad multi-tokenizer: cubre doce tokenizers de referencia: byte-BPE (gpt2, Qwen3.8 con 248.077 vocabulario, DeepSeek-V3, SmolLM2, Llama-3.1), tiktoken (cl100k_base, o200k_base), SentencePiece-BPE (Mistral v0.3, XLM-R), SP-unigram (T5), WordPiece (bert-base-uncased, marcado como lossy/uncased) y byte-identity (ByT5).
- Regeneración flexible: permite construir nuevas matrices con nuevos alfabetos, corpus, vistas gram o tokenizers mediante la biblioteca standalone (pure-stdlib, 18 tests).
- Detección de convenciones de espacios: advierte sobre diferencias entre tokenizers que adjuntan espacios al inicio (leading) frente a segmentaciones byte-nativas que tienden a unidades con espacio al final (trailing), permitiendo normalizar antes de comparar.

## Casos de uso

- Destilación de conocimiento de modelos token-based a modelos byte-level: un ByteLM puede consumir la supervisión de un profesor como Llama-3.1 o DeepSeek-V3 usando la matriz para alinear los límites de tokens con las unidades byte-nativas, evitando el ruido de segmentación.
- Evaluación cruzada de tokenizers: los investigadores pueden comparar la calidad de segmentación de distintos tokenizers (gpt2, Qwen3.8, T5, etc.) en términos de cohesión (PMI) y entropía de límites, sin depender de métricas subjetivas.
- Alineación de modelos multilingües: dado que opera sobre bytes, sirve para transferir supervisión entre modelos entrenados con vocabularios distintos en idiomas diferentes, sin necesidad de reentrenar el tokenizer.
- Integración en pipelines de entrenamiento de ByteLM: las primitivas de pérdida (alignment endpoints, per-token weight, non-cohesive split) se pueden incorporar directamente en el bucle de entrenamiento para mejorar la destilación de logits.
- Análisis de vocabularios: los artefactos `vocab_*.jsonl` permiten auditar qué tokens son especiales, cuántos bytes ocupan y si son válidos UTF-8, útil para depurar tokenizers personalizados.
- Construcción de nuevas matrices para dominios específicos: un equipo puede regenerar la matriz sobre un corpus biomédico o legal usando la biblioteca, obteniendo estadísticas de bytes adaptadas a su dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas de rendimiento (p. ej., exactitud en tareas de destilación o velocidad de alineación). El repositorio incluye una suite de 18 tests para verificar la corrección de la biblioteca, pero no hay datos comparativos con otras soluciones de alineación token-byte.

## Requisitos de hardware

- No aplica como modelo de inferencia: geolip-bytelex es una biblioteca y un conjunto de artefactos de datos, no requiere GPU para su uso.
- Almacenamiento: el repositorio ocupa 0,2 GB, manejable en cualquier sistema.
- CPU: el procesamiento de corpus y la proyección de vocabularios son operaciones de CPU intensivas pero no exigen hardware especializado; una máquina con 4-8 GB de RAM es suficiente para los artefactos incluidos.
- Despliegue: se instala vía `pip install "geolip-bytelex @ git+https://github.com/AbstractEyes/geolip-bytelex"`; el núcleo es pure-stdlib, sin dependencias externas.
- Para consumidores ByteLM que usen la matriz en entrenamiento, los requisitos de hardware dependen del modelo byte-level (p. ej., AlephLM), no de esta biblioteca.

## Comparativa con modelos similares

No hay una comparativa directa publicada en la información disponible. Como referencia conceptual, se puede comparar con:

| Sistema | Enfoque | Dependencia de modelo | Cobertura de tokenizers | Licencia |
|---|---|---|---|---|
| geolip-bytelex | Matriz relacional basada en estadísticas de corpus | Model-free | 12 tokenizers | MIT |
| Phan et al. (ICLR 2025) | Conversión exacta de logits token→byte | Depende del modelo profesor | Limitado | no disponible |
| ALM (arXiv:2503.20083) | Chunk-level likelihood matching entre co-boundaries | Depende de modelos ALM | Limitado | no disponible |

La ventaja principal de geolip-bytelex es su independencia de pesos de modelo y su modularidad gramática, pero carece de benchmarks públicos que demuestren superioridad empírica.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona; es una infraestructura de datos. Los usuarios que esperen un LLM se verán decepcionados.
- Sesgos de corpus: las estadísticas de bytes dependen del corpus utilizado para construirlas (no especificado en la model card); si el corpus está sesgado hacia un dominio o idioma, la matriz reflejará ese sesgo.
- Riesgo de alucinación: no aplica directamente, pero las proyecciones pueden ser incorrectas si el corpus no representa bien ciertos patrones de bytes (p. ej., texto binario o codificaciones raras).
- Limitaciones de tokenizers lossy: bert-base-uncased está marcado como lossy/uncased, lo que significa que la expansión a bytes puede perder información de mayúsculas; los consumidores deben ser conscientes.
- Convención de espacios: los tokenizers generativos del roster adjuntan espacios al inicio, mientras que las segmentaciones byte-nativas tienden a espacios al final; ignorar esta diferencia invalida comparaciones de límites.
- Sin garantías de producción: el proyecto parece experimental (descargas 0, likes 0); no hay evidencia de uso en entornos productivos ni soporte formal.
- Restricciones de licencia: MIT permite uso comercial, pero la ausencia de atribución de corpus y de documentación sobre el origen de los datos puede plantear riesgos legales si se usan los artefactos en productos comerciales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AbstractPhil/geolip-bytelex
- Código fuente: https://github.com/AbstractEyes/geolip-bytelex
- Registro de entrenamiento AlephLLM / Mini-Beatrix: https://huggingface.co/AbstractPhil/alephllm-mini-beatrix-training
- Referencia ALM (arXiv:2503.20083): https://arxiv.org/abs/2503.20083 (no verificado directamente, pero citado en la model card)
