# procesaur/Srna_tokenizer

## Resumen

Srna Tokenizer es un tokenizador especializado en lengua serbia desarrollado por Mihailo Škorić (usuario `procesaur` en Hugging Face). No es un modelo de lenguaje generativo, sino un componente de tokenización que implementa varias capas de normalización para igualar los dos alfabetos del serbio (cirílico y latino) y reducir el numero de tokens redundantes en el vocabulario. Resuelve un problema concreto: los tokenizadores genericos tratan el cirilico y el latino como secuencias completamente distintas, lo que duplica representaciones y desperdicia capacidad del vocabulario en un idioma que usa ambos sistemas de escritura de forma nativa.

El tokenizador aplica tres mecanismos de compresion: compresion de escritura (una palabra en cirilico se marca con `<boc>`...`<eoc>` preservando la informacion necesaria para restaurar el alfabeto al decodificar), compresion de capitalizacion (una palabra capitalizada se marca con `<cap>` y se normaliza a minusculas) y compresion de mayusculas (una palabra en mayusculas se marca con `<up>` y se normaliza a minusculas, evitando la fragmentacion en caracteres individuales). El resultado es una representacion unificada que reduce la duplicacion en el vocabulario y facilita el aprendizaje de modelos que operan sobre serbio.

El repositorio tiene un tamano de 0.0 GB (componente ligero), licencia Apache 2.0, y esta etiquetado con `custom_code`, lo que implica que requiere `trust_remote_code=True` para cargarse. Es relevante para quienes entrenan o ajustan modelos para serbio, croata, bosnio o serbocroata, donde la mezcla de alfabetos es habitual. La fecha de creacion del repositorio es 2026-04-29 y la ultima actualizacion 2026-11-02.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador de subpalabras con capas de normalizacion personalizadas (custom_code) |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantizacion | no disponible (no aplica a tokenizadores) |
| Idiomas soportados | serbio (sr) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tokenizador; ficheros de vocabulario y merges del tokenizador) |

## Arquitectura y entrenamiento

Srna es un tokenizador de subpalabras (presumiblemente basado en BPE o SentencePiece, aunque la model card no especifica el algoritmo exacto) con extensiones de codigo personalizado (`custom_code`) que implementan la logica de compresion y restauracion. La innovacion principal no esta en el algoritmo de tokenizacion base, sino en las capas de normalizacion que se aplican antes de la tokenizacion y se revierten durante la decodificacion.

Se definen tres transformaciones reversibles. La compresion de escritura convierte una palabra en cirilico `текст` en `<boc> tekst<eoc>`, preservando la informacion del alfabeto en etiquetas especiales. La compresion de capitalizacion convierte `Tekst` en `<cap> tekst`. La compresion de mayusculas convierte `TEKST` en `<up> tekst`, evitando que palabras en mayusculas se fragmenten en caracteres individuales. La restauracion del cirilico depende de listas de excepciones para digrafos (`dž`, `lj`, `nj` y en algunos casos `dj`), que segun la model card son las mas completas disponibles para serbio, heredadas del software Cirilizator.

No se especifican en la informacion disponible el numero de tokens del vocabulario, el corpus de entrenamiento del tokenizador ni el numero de tokens procesados. El dataset asociado en la model card es `procesaur/sr-tokenizer-test`, que parece ser un conjunto de prueba mas que de entrenamiento. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, ya que no es un modelo generativo.

## Capacidades

- Tokenizacion y detokenizacion reversible de texto en serbio en alfabeto cirilico y latino.
- Compresion de escritura: unifica cirilico y latino en una representacion comun con etiquetas `<boc>`/`<eoc>` y restauracion en decodificacion.
- Compresion de capitalizacion: normaliza `Tekst` a `<cap> tekst` y restaura la capitalizacion al decodificar.
- Compresion de mayusculas: normaliza `TEKST` a `<up> tekst` y restaura al decodificar, evitando fragmentacion en caracteres.
- Manejo de digrafos serbios (`dž`, `lj`, `nj`, `dj`) con listas de excepciones para la restauracion correcta del cirilico.
- Opciones de configuracion: `case_compression`, `script_compression` y `omit_tags` para desactivar capas de normalizacion o suprimir las etiquetas en la salida.
- Reduccion de tokens redundantes en el vocabulario al no necesitar entradas separadas para variantes de escritura, capitalizacion y mayusculas.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un tokenizador.

## Casos de uso

- Entrenamiento de modelos de lenguaje para serbio: usar Srna como tokenizador base reduce el vocabulario necesario al unificar cirilico y latino, lo que se traduce en embeddings mas eficientes y menor consumo de parametros dedicados a variantes ortograficas.
- Ajuste fino de modelos multilingues existentes sobre corpus serbios: el tokenizador puede adaptarse a modelos ya entrenados, aunque la model card recomienda desactivar la compresion de capitalizacion y mayusculas si no se reentrena el modelo, para evitar desalineacion con los embeddings preexistentes.
- Normalizacion de corpus para NLP serbio: en tareas de clasificacion, NER o analisis de sentimiento, Srna permite procesar textos que mezclan alfabetos sin duplicar representaciones, simplificando el preprocesamiento.
- Construccion de pipelines de traduccion automatica serbio-castellano u otros pares: la representacion unificada de ambos alfabetos reduce la dispersion del vocabulario y mejora la cobertura en el lado fuente.
- Indexacion y busqueda en motores de recuperacion de informacion para medios serbios: al normalizar variantes de escritura y capitalizacion, se mejora la coincidencia entre consultas y documentos que usan alfabetos distintos.
- Investigacion linguistica computacional sobre digrafos y ortografia serbia: las listas de excepciones implementadas permiten estudiar y validar la restauracion cirilica en corpus reales.
- Sistemas de correccion ortografica o normalizacion de texto: el tokenizador puede usarse como capa de preprocesamiento reversible para tareas de limpieza y reescritura que requieran preservar la forma original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un tokenizador y no un modelo neuronal, no requiere VRAM ni GPU para su funcionamiento.
- Se ejecuta en CPU con requisitos minimos de memoria (el repositorio ocupa 0.0 GB).
- Compatible con cualquier entorno que soporte `transformers` con `trust_remote_code=True`.
- No aplica despliegue con vLLM, llama.cpp, Ollama o TGI como modelo independiente; se integra en el pipeline de tokenizacion del modelo que lo utilice.
- La latencia y el throughput dependen del modelo de lenguaje al que acompanie, no del tokenizador en si.

## Comparativa con modelos similares

| Tokenizador | Idioma | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Srna Tokenizer | Serbio (sr) | Normalizacion de escritura, capitalizacion y mayusculas con restauracion | Apache 2.0 | Hugging Face (`procesaur/Srna_tokenizer`) |
| Tokenizadores multilingues genericos (p. ej. los de XLM-R o mT5) | Multilingue | BPE/SentencePiece sin normalizacion especifica de escritura | Segun modelo | Amplia |
| Tokenizadores especificos para serbocroata | Serbio/croata/bosnio | BPE estandar sin capas de compresion de escritura | Variable | No disponible en la informacion proporcionada |

La comparativa detallada con alternativas especificas para serbio no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La restauracion del cirilico es una tarea compleja y depende de listas de excepciones para digrafos; puede fallar en casos no cubiertos por dichas listas.
- La compresion de capitalizacion y mayusculas puede introducir errores de restauracion en textos con convenciones ortograficas atipicas.
- La model card advierte que, al adaptar modelos existentes, se recomienda desactivar la compresion de capitalizacion y mayusculas si no se realiza un ajuste fino del modelo, para evitar desalineacion con los embeddings originales.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el codigo antes de usarlo en produccion.
- Solo cubre serbio (`sr`); no esta disenado para otros idiomas ni para texto multilingue mixto.
- No se documentan sesgos especificos, pero al ser un tokenizador puede heredar sesgos de representacion del corpus con el que se construyo el vocabulario, no disponible en la informacion proporcionada.
- No es un modelo generativo: no puede usarse para responder preguntas, generar codigo ni realizar razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las dependencias de `custom_code` y de las listas de excepciones heredadas de Cirilizator.

## Enlaces

- Hugging Face: https://huggingface.co/procesaur/Srna_tokenizer
- Perfil del autor: https://huggingface.co/procesaur
- Repositorio Cirilizator (listas de excepciones para digrafos): https://github.com/turanjanin/cirilizator/
- Dataset asociado: https://huggingface.co/datasets/procesaur/sr-tokenizer-test
