# paulvision/medical-bpe-pubmed

## Resumen

medical-bpe-pubmed es un tokenizer byte-level BPE de dominio especifico desarrollado por paulvision. Se entreno sobre 45.000 resumenes de PubMed y cuenta con un vocabulario de 16.000 tokens. Su objetivo es demostrar que el entrenamiento de dominio, y no el tamano del vocabulario, determina la eficiencia de tokenizacion en texto medico. Este tokenizer se presenta como una herramienta de investigacion y docencia, y no como un componente intercambiable en modelos de lenguaje preentrenados.

Frente a tokenizers generalistas como cl100k_base o o200k_base, medical-bpe-pubmed obtiene una fertilidad medica de 1.375, mejor que la de cl100k_base (1.460) y o200k_base (1.430) en textos de PubMed. Sin embargo, su fertilidad general empeora (1.575 frente a 1.163 de o200k_base), lo que refleja que su ventaja se limita al dominio medico. Esta disponible bajo licencia MIT y puede cargarse con PreTrainedTokenizerFast desde HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE |
| Parametros totales | No aplicable (tokenizer, no modelo neuronal) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable (tokenizer) |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | Ingles (texto biomedico) |
| Licencia | MIT |
| Formato de pesos | Vocabulario y merges; carga mediante PreTrainedTokenizerFast |

## Arquitectura y entrenamiento

El tokenizer emplea byte-level BPE, una variante de BPE que opera sobre bytes, lo que permite codificar cualquier caracter sin producir tokens desconocidos. El pre-tokenizador configurado es ByteLevel y los tokens especiales definidos son `<pad>` y `<|endoftext|>`. El corpus de entrenamiento esta compuesto por 45.000 resumenes de PubMed del dataset slinusc/PubMedAbstractsSubset. El vocabulario se limito a 16.000 tokens. La evaluacion se realizo sobre 5.000 resumenes de PubMed no vistos durante el entrenamiento, con una separacion basada en semilla 42. No se aplico RLHF ni DPO, ya que no es un modelo de lenguaje sino un tokenizador.

## Capacidades

- Tokenizacion eficiente de terminologia medica: la fertilidad medica en el conjunto de evaluacion es 1.375, frente a 1.460 de cl100k_base y 1.430 de o200k_base.
- Cobertura completa de caracteres: al ser byte-level, no produce tokens desconocidos.
- Carga ligera en HuggingFace Transformers mediante `PreTrainedTokenizerFast`.
- Medicion de la eficiencia de tokenizacion (fertilidad) tanto en texto medico como general.
- Limitado a la tokenizacion; no genera texto, no soporta tool calling, agentes, vision ni multi-step reasoning.

## Casos de uso

- Entrenamiento de modelos de lenguaje medicos desde cero: usar este tokenizer como capa de entrada para un nuevo modelo neuronal, aprovechando que los terminos clinicos se codifican en menos tokens y asi se reducen los costes de entrenamiento.
- Analisis de corpus biomedico: comparar la fertilidad de este tokenizer con la de uno generalista para cuantificar la ventaja de un vocabulario de dominio en un corpus de abstracts de PubMed.
- Docencia en tokenizacion: el laboratorio que acompana al tokenizer permite demostrar que, con el mismo algoritmo y el mismo tamano de vocabulario, el dominio de entrenamiento explica una mejora de 0.372 en fertilidad medica.
- Clasificacion de textos clinicos: al tokenizar documentos de PubMed con un vocabulario especifico, se obtienen secuencias mas cortas, lo que reduce el coste computacional de clasificadores aguas arriba.
- Extraccion de terminos relevantes: la segmentacion BPE de dominio facilita identificar grupos de caracteres que corresponden a farmacos y enfermedades, util para analisis lexico de literatura cientifica.
- Prototipado de pipelines con recursos limitados: al eliminar la necesidad de vocabularios de 100k-200k tokens, se reduce el tamano de la matriz de embeddings y la memoria necesaria para modelos pequenos.

## Benchmarks y rendimiento

Los datos de fertilidad se refieren al numero medio de tokens necesarios para codificar un texto; un valor menor indica mayor eficiencia. En el modelo se reportan los siguientes resultados sobre 5.000 abstracts de PubMed no vistos (semilla 42):

| Tokenizer | Vocabulario | Fertilidad medica | Fertilidad general |
|---|---|---|---|
| medical-bpe-pubmed | 16k | 1.375 | 1.575 |
| o200k_base (GPT-4o) | ~200k | 1.430 | 1.163 |
| cl100k_base (GPT-4) | ~100k | 1.460 | 1.173 |
| general-bpe (wikitext) | 16k | 1.747 | 1.208 |

El tokenizer medical-bpe-pubmed consigue la mejor fertilidad medica entre los comparados, pero su fertilidad general de 1.575 es peor que la de los tokenizers de mayor vocabulario. La comparacion con general-bpe, que usa el mismo algoritmo y el mismo tamano de vocabulario, muestra que la diferencia de 0.372 en fertilidad medica se debe unicamente al dominio de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el tokenizer no requiere GPU.
- GPU recomendadas: no se requiere GPU; funciona en CPU.
- Cabe en cualquier maquina con HuggingFace Transformers instalado.
- Opciones de despliegue: `PreTrainedTokenizerFast.from_pretrained()` en Python, o integracion en pipelines de HuggingFace. Tambien se puede usar en notebooks para analisis de corpus.
- Latencia y throughput estimados: no disponible; al ser un tokenizer byte-level con 16k de vocabulario, la latencia es baja en CPU, pero no se proporcionan medidas.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Dominio | Fertilidad medica | Fertilidad general | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| medical-bpe-pubmed | 16k | PubMed | 1.375 | 1.575 | MIT | HuggingFace |
| general-bpe (wikitext) | 16k | Texto general | 1.747 | 1.208 | No indicada | No indicada |
| cl100k_base (GPT-4) | ~100k | General | 1.460 | 1.173 | No indicada | No indicada |
| o200k_base (GPT-4o) | ~200k | General | 1.430 | 1.163 | No indicada | No indicada |

## Limitaciones y advertencias

- No puede sustituir al tokenizer de un modelo preentrenado: los identificadores de tokens deben coincidir con las filas de las matrices de embeddings. Usarlo con LLaMA, Qwen u otros sin retraining completo produce un modelo inservible.
- No es un modelo de lenguaje: no genera texto, no razona, no admite tool calling ni agentes.
- Solo esta entrenado en ingles y en el dominio de abstracts de PubMed; su rendimiento en otros idiomas o dominios, como notas clinicas de hospital, puede ser inferior.
- Licencia MIT: permite uso comercial, pero la utilidad practica queda limitada a proyectos que entrenen un nuevo modelo desde cero o a analisis de corpus.
- Al estar entrenado en literatura cientifica, puede no reflejar el lenguaje coloquial de pacientes ni textos administrativos medicos.
- Riesgo de alucinacion: no procede, al ser un tokenizador no generativo.

## Enlaces

- HuggingFace: https://huggingface.co/paulvision/medical-bpe-pubmed
- Repositorio de laboratorio: https://github.com/sourangshupal/tokenization-explainer
- Dataset de entrenamiento: slinusc/PubMedAbstractsSubset (referencia en la model card, sin URL directa)
