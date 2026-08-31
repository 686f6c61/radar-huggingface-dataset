# mradermacher/granite-4.2-8b-decensored-GGUF

## Resumen

El modelo `mradermacher/granite-4.2-8b-decensored-GGUF` es una cuantización en formato GGUF de una versión "decensored" (abliterated) del modelo Granite 4.2 8B de IBM, realizada por el usuario qcokvd1 y posteriormente convertida a GGUF por mradermacher. El objetivo de esta variante es eliminar los mecanismos de rechazo y censura del modelo original, ofreciendo una generación de texto sin restricciones de contenido. Está pensado para desarrolladores que necesitan un modelo de razonamiento y generación de código con tool calling, pero sin las limitaciones de seguridad habituales.

El modelo base, Granite 4.2, es una familia de modelos densos decoder-only de 3B, 8B y 30B parámetros, post-entrenados sobre Granite 4.1, con capacidades de razonamiento chain-of-thought, modos de pensamiento flexibles y tool calling aumentado con razonamiento. Esta versión decensored conserva presumiblemente esas capacidades, aunque no se ha documentado formalmente el proceso de abliteration. El repositorio contiene 12 archivos GGUF con distintos niveles de cuantización, desde Q2_K (3.5 GB) hasta f16 (17.7 GB), lo que permite adaptarse a diferentes capacidades de hardware.

La relevancia de este modelo radica en su doble naturaleza: por un lado, ofrece el rendimiento y las funcionalidades de un modelo de razonamiento moderno de 8B; por otro, al ser "decensored", permite explorar casos de uso donde la moderación de contenido del modelo original sería un obstáculo, como la generación de ficción adulta o la investigación sobre alineación. Sin embargo, esta modificación no es oficial y carece de documentación técnica detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Granite 4.2) |
| Parametros totales | 8.791.592.960 (~8.8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (declarado); el modelo base Granite 4.2 soporta 12 idiomas, pero esta version solo declara ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base es Granite 4.2 8B, un transformer decoder-only denso desarrollado por IBM. Según la documentación oficial, la familia Granite 4.2 se post-entrena sobre los modelos base Granite 4.1, incorporando capacidades de razonamiento explícito (chain-of-thought), modos de pensamiento configurables y tool calling aumentado con razonamiento. No se dispone de detalles específicos sobre el número de capas, dimensiones ocultas o el dataset de entrenamiento en la información proporcionada.

La versión "decensored" (qcokvd1/granite-4.2-8b-decensored) es una modificación no oficial que aplica técnicas de abliteration para eliminar los rechazos de contenido del modelo original. El proceso exacto no está documentado en la información disponible. Posteriormente, mradermacher ha realizado la cuantización a GGUF mediante conversión estática, generando los distintos niveles de precisión. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) de esta variante.

## Capacidades

- Generacion de texto y razonamiento: al estar basado en Granite 4.2, se espera que mantenga capacidades de razonamiento multi-paso y chain-of-thought, aunque no se ha verificado formalmente en esta version.
- Tool calling / function calling: el modelo base soporta tool calling aumentado con razonamiento, lo que permite integrarlo en agentes que necesitan invocar funciones externas.
- Generacion de codigo: Granite 4.2 esta entrenado para tareas de programacion, por lo que esta version deberia ser capaz de generar y explicar codigo en diversos lenguajes.
- Multilingue: aunque la model card declara solo ingles, el modelo base Granite 4.2 soporta 12 idiomas; no se garantiza que la version decensored conserve esa cobertura.
- Sin censura: la principal diferencia con el modelo original es la eliminacion de los mecanismos de rechazo, permitiendo generar contenido que el modelo base bloquearia (violencia, lenguaje explicito, etc.).
- Modos de pensamiento: el modelo base incluye modos de pensamiento flexibles (thinking mode), que podrian estar presentes en esta version.

## Casos de uso

- Generacion de ficcion adulta y literatura erotica: al no tener restricciones de contenido, el modelo puede producir narrativa explicita sin filtros, algo que los modelos alineados rechazarian. Es adecuado para escritores que necesitan explorar temas tabu sin limitaciones.
- Escritura creativa sin censura: para guiones, dialogos o novelas que incluyan violencia grafica, lenguaje soez o temas controvertidos, este modelo permite una libertad creativa total.
- Investigacion sobre alineacion y seguridad: los investigadores pueden estudiar como se comporta un modelo sin capas de rechazo, comparando sus respuestas con el modelo original para entender los efectos de la abliteration.
- Desarrollo de agentes de codigo con tool calling: gracias a su soporte de function calling, puede integrarse en pipelines de generacion de codigo donde se requiera invocar APIs o ejecutar comandos, sin las restricciones de contenido del modelo base.
- Generacion de contenido para juegos de rol: para juegos de rol de texto o chatbots sin filtros, donde los usuarios esperan respuestas sin censura en situaciones violentas o adultas.
- Pruebas de estres de sistemas de moderacion: se puede utilizar para evaluar la robustez de filtros de contenido en aplicaciones, generando entradas que un modelo alineado no produciria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Granite 4.2 tiene resultados publicados por IBM, pero esta version decensored no ha sido evaluada formalmente. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el archivo GGUF elegido, se requiere aproximadamente el tamaño del archivo mas un margen para el contexto y las activaciones. Por ejemplo, Q4_K_M (5.4 GB) necesita al menos 6-8 GB de VRAM; Q8_0 (9.4 GB) necesita 10-12 GB; f16 (17.7 GB) necesita 18-20 GB.
- GPU recomendadas: para cuantizaciones Q4 o menores, una GPU de consumo como RTX 3060 12GB o RTX 4060 Ti 16GB es suficiente. Para Q8_0 o f16, se recomienda RTX 4090 24GB o una GPU profesional como A100 40GB.
- Compatibilidad con GPU de consumo: si, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 6-12 GB, lo que permite ejecutar el modelo en hardware domestico.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores como llama-cpp-python. Tambien se puede usar con vLLM si se convierte a safetensors, aunque no es el formato principal.
- Latencia y throughput: no se dispone de mediciones especificas. Como referencia, un modelo de 8B en Q4_K_M en una RTX 4090 suele generar entre 40-60 tokens por segundo, pero esto depende del backend y del tamaño del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-4.2-8b-decensored-GGUF (este) | 8.8B | no disponible | Apache 2.0 | GGUF | Decensored, sin benchmarks publicados |
| granite-4.2-8b-GGUF (mradermacher) | 8.8B | no disponible | Apache 2.0 | GGUF | Version original sin decensor, con 12 idiomas |
| Llama 3.1 8B Instruct GGUF | 8.0B | 128K | Llama 3.1 | GGUF | Alineado, con benchmarks publicos |
| Mistral 7B Instruct GGUF | 7.3B | 32K | Apache 2.0 | GGUF | Alineado, con benchmarks publicos |

La comparativa se limita a aspectos estructurales porque no hay datos de rendimiento para la version decensored. El modelo base Granite 4.2 es competitivo con Llama 3.1 en tareas de razonamiento y codigo, pero esta variante no ha sido evaluada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una modificacion no oficial, no se ha realizado una evaluacion de sesgos. El modelo base puede heredar sesgos de los datos de entrenamiento de Granite 4.1, y la abliteration podria amplificarlos al eliminar los mecanismos de rechazo.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en contextos largos o temas especializados. No se ha medido su tasa de alucinacion.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto real de esta version. El modelo base Granite 4.2 soporta hasta 128K tokens, pero la cuantizacion y la abliteration podrian afectar a la ventana util.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base es propiedad de IBM. Esta version decensored es un derivado no oficial, por lo que su uso en produccion podria plantear problemas legales si se distribuye o se utiliza en servicios publicos.
- Contenido inapropiado: al eliminar la censura, el modelo puede generar contenido ofensivo, ilegal o danino. No debe utilizarse en aplicaciones dirigidas a menores o en entornos donde se requiera moderacion.
- Falta de documentacion: no se ha publicado informacion sobre el proceso de abliteration, los datos utilizados ni las pruebas de calidad. Esto dificulta la reproducibilidad y la confianza en el modelo.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/mradermacher/granite-4.2-8b-decensored-GGUF)
- [Modelo base decensored (qcokvd1)](https://huggingface.co/qcokvd1/granite-4.2-8b-decensored)
- [Repositorio de cuantizaciones i1 (imatrix)](https://huggingface.co/mradermacher/granite-4.2-8b-decensored-i1-GGUF)
- [Repositorio GitHub de IBM Granite 4.2](https://github.com/ibm-granite/granite-4.2-language-models)
- [Documentacion oficial de Granite 4.2 en IBM](https://www.ibm.com/granite/docs/models/granite4-2)
- [Version GGUF del modelo original sin decensor](https://huggingface.co/mradermacher/granite-4.2-8b-GGUF)
