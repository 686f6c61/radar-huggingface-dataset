# evox-os/axiom-1-tokenizer

## Resumen

AXIOM-1 tokenizer es el tokenizador asociado al proyecto AXIOM-1, publicado por el usuario evox-os en Hugging Face. Se trata de un tokenizador de tipo BPE (Byte Pair Encoding) a nivel de byte, entrenado desde cero, con un vocabulario propio de 32 000 unidades subpalabra y un limite declarado de 512 tokens de contexto. La model card lo presenta explicitamente como una apuesta por la "soberania total" del pipeline: no reutiliza el vocabulario de tokenizadores de terceros (Llama, GPT, Mistral), sino que define su propio espacio de tokens.

Es importante subrayar que este repositorio no contiene un modelo de lenguaje, sino un artefacto de preprocesado. No hay pesos de red neuronal, no hay parametros entrenables en el sentido habitual y no genera texto. Su relevancia, por tanto, es de infraestructura: determina como se fragmenta el texto antes de entrar en AXIOM-1 y condiciona metricas como la fertilidad del vocabulario, la longitud efectiva de las secuencias y el coste de computo por caracter.

El repositorio presenta un estado de publicacion muy incipiente: cero descargas, cero "likes", sin licencia declarada, sin idiomas declarados y sin pipeline asignado. Ademas, las busquedas web realizadas no devuelven ningun resultado relacionado con el proyecto, sino que remiten a una marca de escape deportivo para automocion ajena por completo al ambito de la IA. Cualquier evaluacion posterior debe partir de esa base: la informacion disponible es minima y no verificada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE (Byte Pair Encoding) a nivel de byte, entrenado desde cero |
| Parametros totales | No aplica: no es una red neuronal. Vocabulario de 32 000 unidades subpalabra |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (valor declarado en la model card) |
| Tipos de cuantizacion | No aplica: un tokenizador no se cuantiza. No disponible si el repositorio incluye otros artefactos |
| Idiomas soportados | No disponible (no declarados en la model card ni en las etiquetas del repositorio) |
| Licencia | No disponible (no se declara licencia en el repositorio) |
| Formato de pesos | No disponible. Habitualmente los tokenizadores de Hugging Face se distribuyen como tokenizer.json, vocab.json y merges.txt, pero la model card no confirma los ficheros incluidos |
| Tamano del vocabulario | 32 000 tokens |
| Tipo de tokenizacion | Subpalabra con descomposicion a nivel de byte |
| Autor | evox-os |
| Fecha de publicacion en el Hub | 2026-09-15 (segun metadatos del repositorio) |
| Ultima actualizacion | 2026-09-15 (segun metadatos del repositorio) |
| Descargas / likes | 0 descargas, 0 likes |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El artefacto es un tokenizador BPE de nivel de byte. Esto significa que el algoritmo de fusion de pares opera sobre la secuencia de bytes UTF-8 del texto en lugar de hacerlo directamente sobre caracteres Unicode. La consecuencia practica es que el vocabulario puede representar cualquier flujo de bytes valido, incluidas cadenas que no aparecen en el corpus de entrenamiento y secuencias de scripts no latinos o de emojis, sin necesidad de un token especial de "desconocido". El vocabulario resultante es de 32 000 unidades, una cifra moderada en el panorama actual, donde los tokenizadores de ultima generacion suelen moverse entre 100 000 y 256 000 tokens.

No se dispone de informacion sobre el corpus de entrenamiento: ni el numero de tokens o bytes utilizados, ni la composicion del dataset, ni la proporcion de idiomas, ni si se aplicaron normalizaciones previas como NFKC, filtrado de duplicados o suavizado de dominios. Tampoco se documentan hiperparametros del algoritmo BPE como el criterio de parada, la ponderacion por frecuencia o el tratamiento de espacios. La model card unicamente indica que fue "entrenado desde cero" para AXIOM-1, lo que implica que su vocabulario esta disenado de forma conjunta con el modelo, pero no aporta detalles del procedimiento.

El valor de contexto declarado, 512 tokens, no es una propiedad intrinseca del tokenizador sino una restriccion de la arquitectura con la que se usa. Se trata de una ventana muy corta para los estandares actuales y sugiere un modelo de escala reducida, orientado a experimentacion o a tareas de secuencia corta, no a conversacion multi-turno con documentos extensos. El repositorio no incluye informacion sobre tecnicas auxiliares de preprocesado, decodificacion especulativa ni comparticion de embeddings con el modelo principal.

## Capacidades

- Conversion de texto a ids de token y de ids a texto mediante la interfaz estandar, con `AutoTokenizer.from_pretrained("evox-os/axiom-1-tokenizer")`.
- Segmentacion de subpalabras con cobertura a nivel de byte, lo que evita tokens de desconocido ante entradas fuera del vocabulario, segun el propio tipo de tokenizacion declarado.
- Definicion de un espacio de tokens propio, independiente de los vocabularios de terceros, lo que permite entrenar y servir AXIOM-1 sin depender de tokenizadores ajenos.
- Uso previsible como componente de preprocesado en pipelines de entrenamiento e inferencia que requieran correspondencia exacta entre texto e ids.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision: es un artefacto de preprocesado, no un modelo generativo.
- Soporte de tool calling o function calling: no disponible (no aplica a un tokenizador).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Cobertura multilingue: no disponible. Aunque la tokenizacion a nivel de byte garantiza que cualquier texto es representable, no hay datos sobre fertilidad por idioma ni sobre el equilibrio del corpus de entrenamiento.
- Capacidades especiales (modo de razonamiento, vision, audio, tokens de control): no disponible.

## Casos de uso

- Preentrenamiento o ajuste de AXIOM-1: el tokenizador es el componente que fija la correspondencia entre texto e ids durante el entrenamiento. Cualquier pipeline que entrene o ajuste AXIOM-1 debe cargar exactamente este vocabulario para que los pesos del modelo sean coherentes con la entrada.
- Servicio de inferencia con correspondencia estricta: frameworks como vLLM o TGI requieren el tokenizador asociado al modelo para tokenizar peticiones y destokenizar salidas. Este repositorio cubre esa pieza para AXIOM-1, siempre que el modelo con el que se empareje exista y coincida.
- Evaluacion de fertilidad y ratio de compresion: se puede medir cuantos tokens produce este vocabulario por cada 100 caracteres sobre corpus propios (codigo, castellano, ingles, textos tecnicos) y compararlo con alternativas. Una fertilidad alta encarece cada secuencia y reduce el contenido util que cabe en la ventana de contexto.
- Auditoria de cobertura sin tokens de desconocido: al ser BPE a nivel de byte, se puede verificar experimentalmente que entradas adversas o exotucas (mezclas de scripts, simbolos matematicos, secuencias de control) no generan fallos de tokenizacion.
- Experimentacion academica reproducible: sirve como ejemplo minimo de entrenamiento de un BPE byte-level con 32 000 fusiones, util para comparar decisiones de diseno de vocabulario frente a tokenizadores preentrenados.
- Investigacion sobre independencia de pipeline: para equipos que quieren evitar depender de tokenizadores con licencias o condiciones externas, este vocabulario propio es el punto de partida, aunque la ausencia de licencia declarada introduce su propia incertidumbre juridica.
- Preprocesado en CPU a gran escala: al no requerir acelerador, puede ejecutarse sobre corpus masivos en nodos sin GPU antes de lanzar el entrenamiento o la evaluacion del modelo.
- Emparejamiento y depuracion de checkpoints: permite comprobar si un checkpoint de AXIOM-1 publicado en el futuro comparte vocabulario con este tokenizador, comparando el tamano del embedding de entrada con las 32 000 entradas declaradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, algo esperable al tratarse de un tokenizador y no de un modelo generativo. Las metricas pertinentes para este tipo de artefacto serian la fertilidad (tokens por palabra o por 100 caracteres), el ratio de compresion bytes por token, la eficiencia de Renyi del vocabulario y la cobertura por idioma; ninguna de ellas aparece reportada en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- VRAM: no aplica. Un tokenizador no se ejecuta en GPU; el proceso de tokenizacion es CPU y memoria RAM convencional.
- RAM estimada: no disponible. El tamano del fichero no se publica. A modo de referencia orientativa y no confirmada, un vocabulario BPE de 32 000 tokens con sus reglas de fusion suele ocupar del orden de pocos megabytes.
- GPU recomendadas: no aplica. No se necesita A100, H100 ni RTX 4090 para tokenizar.
- Viabilidad en equipos de consumo: si. Cualquier portatil actual puede cargar y ejecutar el tokenizador, incluidos entornos sin GPU dedicada.
- Opciones de despliegue: `transformers` con `AutoTokenizer`; la libreria `tokenizers` de Hugging Face; integracion dentro de pipelines de vLLM o TGI como componente auxiliar del modelo; uso en procesos de preprocesado por lotes con multiprocesado en CPU.
- Latencia y throughput: no disponible. Dependen del texto de entrada y del hardware, y no se han publicado mediciones.
- Nota sobre llama.cpp/Ollama: estos entornos trabajan con pesos en formato GGUF y con su propio tokenizador embebido; la conversion desde este repositorio no esta documentada.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas. La tabla recoge los aspectos sobre los que si hay certeza y marca explicitamente los huecos.

| Aspecto | AXIOM-1 tokenizer | Alternativas de la misma categoria |
|---|---|---|
| Tipo | BPE a nivel de byte, entrenado desde cero | No disponible en la informacion proporcionada |
| Tamano de vocabulario | 32 000 tokens | No disponible en la informacion proporcionada |
| Contexto declarado | 512 tokens | No disponible en la informacion proporcionada |
| Licencia | No disponible | No disponible en la informacion proporcionada |
| Idiomas | No disponible | No disponible en la informacion proporcionada |
| Adopcion en el Hub | 0 descargas, 0 likes | No disponible en la informacion proporcionada |
| Documentacion publica | Model card de cuatro lineas | No disponible en la informacion proporcionada |

Cualquier comparacion significativa exigiria medir fertilidad y ratio de compresion sobre un corpus comun frente a otros tokenizadores de vocabulario similar (del orden de 32 000 unidades) y frente a los de vocabulario extenso (100 000 a 256 000 unidades). Esa medicion no forma parte de la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje. No genera texto, no razona y no puede usarse para tareas de inferencia generativa por si solo.
- Limitacion de contexto grave: los 512 tokens declarados son una ventana muy reducida para los estandares actuales. Si el modelo AXIOM-1 finalmente admite secuencias mas largas, la cifra de la model card quedara desactualizada o directamente incorrecta.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial ni condiciones de redistribucion. En produccion esto es un riesgo juridico, no un detalle menor.
- Ausencia total de informacion sobre el corpus de entrenamiento: se desconoce el equilibrio de idiomas, la presencia de dominios tecnicos o de codigo, y los posibles sesgos de asignacion de tokens. Un vocabulario desequilibrado penaliza sistematicamente a los idiomas peor representados con secuencias mas largas y mayor coste de computo.
- Opacidad sobre el sesgo: la tokenizacion puede introducir sesgos sutiles, por ejemplo fragmentando de forma mucho mas agresiva ciertos nombres propios o variantes dialectales. No hay evaluacion publicada al respecto.
- Repositorio sin validacion independiente: cero descargas, cero likes, sin pipeline asignado y sin resultados de terceros. No hay evidencia de que exista un modelo AXIOM-1 publicado que consuma este vocabulario.
- Anomalia en los metadatos: las fechas de creacion y actualizacion indican 2026-09-15, posteriores a la fecha de consulta habitual. Conviene tratarlas con cautela antes de citarlas como referencia temporal.
- Resultados de busqueda no relacionados: las consultas devuelven exclusivamente paginas de una marca de escapes de automocion (EVOX Performance, Evo-xracing). No existe corroboracion externa del proyecto.
- Riesgo de desalineacion en produccion: emparejar este tokenizador con pesos que no correspondan al mismo vocabulario produce salidas incoherentes o directamente basura, sin que el sistema emita un error claro.
- Ausencia de benchmarks de tokenizacion: no hay medidas de fertilidad, compresion ni cobertura, por lo que no es posible estimar de antemano el coste real por secuencia en tareas concretas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/evox-os/axiom-1-tokenizer
- Perfil del autor en Hugging Face: https://huggingface.co/evox-os
- Paper, blog tecnico, repositorio de codigo o demo: no disponible
- Resultados de busqueda web: ninguno relevante. Las URLs devueltas (evox-performance.com, evo-xracing.com, shiftech.eu, adp-shop.fr) corresponden a una marca de recambios y escapes de automocion sin relacion con el proyecto.
