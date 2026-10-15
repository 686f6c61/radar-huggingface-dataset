# nerualdreming/ruaccent-omograph-int8

## Resumen

nerualdreming/ruaccent-omograph-int8 es una cuantización a int8 de los dos modelos grandes de desambiguación de homógrafos del proyecto RUAccent, publicada como repositorio ONNX listo para usar. No es un modelo entrenado desde cero: el autor parte de ruaccent/accentuator (commit b78ae5ea1e62beaf138bed1865cd8c3b0b5ca855, licencia MIT) y reempaqueta dos submodelos, `big_poetry` (cross-encoder BERT-base, 713,5 MB en fp32 que pasan a 181,6 MB) y `turbo3.1` (DeBERTa de 6 capas, 359,3 MB que pasan a 92,3 MB). El repositorio completo ocupa 0,3 GB.

El problema que resuelve es concreto: decidir qué lectura lleva un homógrafo del ruso (por ejemplo `з+амок` frente a `зам+ок`) a partir del contexto en el que aparece, para que un sistema de síntesis de voz o de enseñanza del idioma coloque el acento tónico correcto. Cada carpeta es un reemplazo directo del modelo upstream correspondiente: mismas entradas (`input_ids`, `attention_mask` y, en `big_poetry`, también `token_type_ids`), misma salida `logits` y los mismos ficheros de tokenizer.

La relevancia del repositorio está en el método de cuantización más que en el modelo en sí. El autor descarta la cuantización dinámica de ONNX Runtime (la receta de `tiny2` upstream) porque cuantizar las activaciones de cada `MatMul` invierte decisiones de homógrafos respecto a fp32, y opta por int8 solo en pesos con escalas fp32 por canal, lo que preserva 213 de 213 decisiones de fp32 en `big_poetry`. El proyecto está dirigido a desarrolladores que necesitan inferencia en CPU o en dispositivos sin GPU con la misma calidad que el original en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder para desambiguacion de homografos; submodelo `big_poetry` basado en BERT-base, submodelo `turbo3.1` basado en DeBERTa de 6 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 simetrico weight-only, con escala fp32 por canal de salida (por fila en tablas de embeddings); activaciones en fp32; restauracion en el grafo mediante `Cast` + `Mul` |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` por carpeta) mas ficheros de tokenizer |
| Entradas | `input_ids`, `attention_mask`; `token_type_ids` adicional en `big_poetry` |
| Salida | `logits` |
| Tamano de pesos | `big_poetry` 181,6 MB; `turbo3.1` 92,3 MB; repositorio 0,3 GB |
| Modelo base | ruaccent/accentuator (commit b78ae5ea1e62beaf138bed1865cd8c3b0b5ca855) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Contiene dos cross-encoders de la librería RUAccent, ubicados en el módulo `nn/nn_omograph` del proyecto: `big_poetry`, derivado de BERT-base, y `turbo3.1`, derivado de un DeBERTa de 6 capas. La tarea es de clasificación sobre un token marcado como homógrafo dentro de una frase; RUAccent señala ese token envolviéndolo con etiquetas `<w>...</w>` y el modelo devuelve una distribución de probabilidad sobre las lecturas posibles (por ejemplo `з+амок` frente a `зам+ок`). La lectura elegida es la variante con mayor probabilidad.

La innovación técnica del repositorio es el esquema de cuantización. En lugar de la cuantización dinámica de ONNX Runtime, que cuantiza también las activaciones de cada `MatMul`, el autor aplica cuantización solo a pesos: cada peso fp32 bidimensional de un `MatMul`, y las tablas de embeddings leídas por `Gather`, se almacenan como int8 simétrico con una escala fp32 por canal de salida (por fila en el caso de los embeddings) y se restauran en el grafo mediante `Cast` más `Mul`. Las activaciones permanecen en fp32. El resultado es un modelo que se ejecuta en cualquier opset y en cualquier execution provider de ONNX Runtime, con un comportamiento muy cercano al original en fp32: en `big_poetry` las 213 decisiones evaluadas coinciden con fp32 y la mayor desviación de probabilidad observada es 0,071; en `turbo3.1` coinciden 211 de 213 (las dos discrepancias se dan en empates muy ajustados en fp32) con una desviación máxima de 0,005. No se documentan datos de entrenamiento, composición del dataset ni uso de RLHF o DPO, ya que el modelo procede íntegramente del upstream.

## Capacidades

- Desambiguación de homógrafos en ruso: elige la lectura correcta de una palabra según el contexto en el que aparece.
- Colocación de acento tónico como paso previo a la síntesis de voz o a la transliteración acentuada.
- Clasificación contextual sobre un token marcado explícitamente con el formato `<w>palabra</w>` de RUAccent.
- Inferencia en CPU sin GPU, con latencias de milisegundos de un dígito.
- Compatibilidad como reemplazo directo (drop-in) de los submodelos upstream `big_poetry` y `turbo3.1` en RUAccent.
- Ejecución en cualquier opset y cualquier execution provider de ONNX Runtime (CPU, CUDA, DirectML, TensorRT, entre otros).
- No dispone de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling ni capacidades de agente: es un modelo discriminativo de una única tarea.
- Idiomas: exclusivamente ruso.

## Casos de uso

- Preprocesado de texto para TTS en ruso: el modelo decide la lectura de cada homógrafo antes de pasar la frase al sintetizador, de modo que la voz pronuncia `зам+ок` o `з+амок` según el contexto. Con 8,8 ms por variante evaluada en CPU para `big_poetry`, no añade latencia perceptible a una tubería de voz.
- Desambiguación en asistentes de voz y altavoces inteligentes: `turbo3.1` cuantizado ocupa 92,3 MB y responde en 4,3 ms en CPU, por lo que cabe en dispositivos empotrados con memoria limitada y sin acelerador hardware.
- Herramientas de aprendizaje de ruso: generación automática de anotaciones con el acento correcto sobre textos reales, útil para materiales didácticos y diccionarios con ejemplos de uso contextualizado.
- Anotación de corpus a gran escala: al ser un modelo ONNX int8 de bajo consumo, se puede ejecutar en paralelo sobre lotes de frases en clústeres de CPU para marcar acentos en corpus de miles de millones de palabras.
- Integración directa en RUAccent: cada carpeta sustituye al modelo fp32 equivalente manteniendo las mismas entradas, salida y ficheros de tokenizer, de modo que no hay que adaptar código ni cambiar el pipeline existente.
- Normalización fonética previa a un sistema de alineamiento forzado o de reconocimiento de voz: la lectura acentuada reduce ambigüedad en la transcripción fonética.
- Distribución en aplicaciones de escritorio y móviles: el tamaño de 0,3 GB del repositorio completo y la ausencia de requisitos de GPU permiten empaquetarlo dentro de una aplicación offline.
- Evaluación de técnicas de cuantización: sirve como caso de estudio reproducible para comparar cuantización weight-only por canal frente a cuantización dinámica de activaciones en tareas de clasificación sensible al contexto, con la tabla de comparación ya publicada por el autor.

## Benchmarks y rendimiento

La tarea evaluada es la lectura de homógrafos: la variante con mayor probabilidad para el contexto marcado según el formato de RUAccent. El conjunto de prueba son 213 homógrafos en 772 frases de texto ruso real, más 33 frases con lectura conocida.

| Variante | Coincidencia con fp32 (213 homografos en 772 frases) | Lectura correcta (33 frases) | Mayor desviacion de probabilidad |
|---|---|---|---|
| `big_poetry` int8 weight-only (este repositorio) | 213 / 213 | 29 / 33 (fp32: 29) | 0,071 |
| `turbo3.1` int8 weight-only (este repositorio) | 211 / 213 (ambas en empates cercanos en fp32) | 28 / 33 (fp32: 28) | 0,005 |
| `big_poetry` int8 dinamico por canal | 208 / 213 | 29 / 33 | 0,59 |
| `turbo3.1` int8 dinamico por canal | 208 / 213 | 28 / 33 | no disponible |
| `tiny2` upstream (int8 dinamico) | no disponible | 24 / 33 | no disponible |

Latencia en CPU (una variante evaluada):

| Variante | Latencia en CPU |
|---|---|
| `tiny2` | 0,7 ms |
| `turbo3.1` | 4,3 ms |
| `big_poetry` | 8,8 ms |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de propósito general, ya que el modelo no es generativo y no cubre esas tareas. Tampoco se documenta throughput agregado ni latencias sobre GPU.

## Requisitos de hardware

- Memoria: `turbo3.1` int8 ocupa 92,3 MB y `big_poetry` int8 181,6 MB; la huella en memoria es inferior a 1 GB en ambos casos, incluyendo runtime y tokenizer.
- GPU: no es necesaria. Cualquier GPU con soporte de ONNX Runtime (A100, H100, RTX 4090, RTX 3060, integradas) puede ejecutarlos, pero están sobredimensionadas para un modelo de este tamaño.
- GPU de consumo: sí, cabe en cualquier GPU de consumo e incluso en iGPU y aceleradores tipo NPU, siempre que exista un execution provider compatible.
- CPU y edge: es el escenario objetivo. Funciona en CPU de servidor, portátil y dispositivos empotrados; las latencias publicadas son de 0,7 ms (`tiny2`), 4,3 ms (`turbo3.1`) y 8,8 ms (`big_poetry`) para una variante evaluada.
- Despliegue: ONNX Runtime con cualquier execution provider (CPU, CUDA, DirectML, TensorRT y otros) o la propia librería RUAccent apuntando `nn/nn_omograph/big_poetry` o `nn/nn_omograph/turbo3.1` a la carpeta descargada. No aplica a vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje generativo y los pesos están en ONNX.
- Descarga selectiva: `snapshot_download` con `allow_patterns=["big_poetry/*"]` o `["turbo3.1/*"]` permite traer solo el submodelo necesario y evitar descargar los 0,3 GB completos.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano de pesos | Fidelidad respecto a fp32 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `big_poetry` int8 weight-only (este repositorio) | Cross-encoder BERT-base en ONNX int8 | 181,6 MB | 213 / 213 en homografos; 29 / 33 lecturas correctas | MIT | ONNX, descarga directa desde HuggingFace |
| `turbo3.1` int8 weight-only (este repositorio) | Cross-encoder DeBERTa 6 capas en ONNX int8 | 92,3 MB | 211 / 213 en homografos; 28 / 33 lecturas correctas | MIT | ONNX, descarga directa desde HuggingFace |
| `big_poetry` fp32 upstream (ruaccent/accentuator) | Cross-encoder BERT-base en fp32 | 713,5 MB | Referencia | MIT | Pesos originales del proyecto RUAccent |
| `turbo3.1` fp32 upstream (ruaccent/accentuator) | Cross-encoder DeBERTa 6 capas en fp32 | 359,3 MB | Referencia | MIT | Pesos originales del proyecto RUAccent |
| `tiny2` upstream (cuantizacion dinamica) | Modelo de homografos en int8 dinamico | No disponible | 24 / 33 lecturas correctas | MIT | Incluido en RUAccent |

Dentro de la misma tarea no se documentan alternativas externas comparables en la información disponible; la comparación natural es entre los dos submodelos del propio repositorio y sus originales en fp32. La ganancia de `big_poetry` frente a `turbo3.1` es de 5 lecturas correctas sobre 33 (29 frente a 28), a costa de duplicar el tamaño y de más que duplicar la latencia en CPU (8,8 ms frente a 4,3 ms). La cuantización dinámica de activaciones, en cambio, pierde 5 coincidencias con fp32 en `big_poetry` y multiplica por más de ocho la desviación de probabilidad (0,59 frente a 0,071).

## Limitaciones y advertencias

- Alcance muy restringido: solo desambigua homógrafos y coloca acentos en ruso. No genera texto, no razona, no escribe código y no procesa imágenes ni audio.
- Idioma único: ruso. No hay soporte multilingüe ni evaluación en otras lenguas.
- Formato de entrada obligatorio: el contexto relevante debe marcarse con las etiquetas `<w>...</w>` que espera RUAccent; una frase sin marcar no produce la lectura deseada.
- `big_poetry` requiere `token_type_ids` además de `input_ids` y `attention_mask`; omitirlos produce resultados incorrectos.
- Longitud de contexto no documentada. No se indica el número máximo de tokens que admite cada submodelo ni qué ocurre con frases que lo superen.
- Riesgo de error en empates: las dos discrepancias de `turbo3.1` respecto a fp32 se dan en casos que ya eran empates ajustados en el modelo original, por lo que la decisión puede fluctuar.
- Riesgo de sesgo: no se publica ningún análisis de sesgo, y al derivar de un modelo entrenado sobre texto ruso real hereda las distribuciones de ese corpus, incluida la sobrerrepresentación de ciertos registros.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe el riesgo de asignar una lectura plausible y errónea en contextos ambiguos o poco frecuentes.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y procede de un autor individual, no del equipo de RUAccent. Conviene validar el comportamiento sobre el dominio propio antes de usarlo en producción.
- Fecha de creación indicada como 2026-10-15, lo que impide verificar la antigüedad real del artefacto y su historial de mantenimiento.
- Licencia MIT, igual que el upstream, pero el copyright de los pesos sigue perteneciendo a los autores de RUAccent; es recomendable revisar las condiciones del proyecto original antes de redistribuir.
- Sin datos de rendimiento en GPU ni de throughput agregado, lo que dificulta dimensionar un despliegue de alto volumen con cifras propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nerualdreming/ruaccent-omograph-int8
- Modelo base: https://huggingface.co/ruaccent/accentuator
- Repositorio del autor: https://huggingface.co/nerualdreming/models
- Proyecto RUAccent en GitHub: https://github.com/Den4ikAI/ruaccent
- Codigo del modelo de acentuacion de RUAccent: https://github.com/Den4ikAI/ruaccent/blob/main/ruaccent/accent_model.py
- Modelos etiquetados como ruaccent en HuggingFace: https://huggingface.co/models?other=ruaccent
