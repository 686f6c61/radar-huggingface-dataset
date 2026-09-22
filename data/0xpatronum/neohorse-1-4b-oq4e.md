# 0xPatronum/NeoHorse-1-4B-oQ4e

## Resumen

NeoHorse-1-4B-oQ4e es una cuantizacion de 4 bits del modelo TokenRhythm/NeoHorse-1-4B, publicada por el usuario 0xPatronum en Hugging Face. El modelo de partida es un transformer decoder-only de 4.205.751.296 parametros (4,2 B) post-entrenado a partir de Qwen/Qwen3.5-4B, por lo que hereda la arquitectura y el tokenizador de la familia Qwen3.5. Esta publicacion no reentrena ni modifica los pesos mas alla del proceso de cuantizacion: su proposito es reducir el peso en disco a 2,5 GB y permitir inferencia local en equipos Apple Silicon mediante MLX.

La cuantizacion se ha realizado con el conversor oMLX `quantize_oq_streaming`, en nivel `oq_level=4` enhanced, con group size 64 y calibracion interna `oqe_code_multilingual` (128 muestras de longitud 512 y 248 entradas de imatrix, ninguna ausente). La model card insiste en que se trata de un pack oQ4e de oMLX y no de un pack OptiQ de mlx-optiq, distincion relevante porque ambos formatos no son intercambiables a nivel de carga.

Su relevancia practica es acotada pero clara: permite ejecutar un modelo de la familia Qwen3.5 en ordenadores Mac sin GPU dedicada y con licencia Apache 2.0. Como contrapartida, el repositorio no publica benchmarks, no declara idiomas soportados, no documenta la longitud de contexto y acumula cero descargas y cero valoraciones, por lo que cualquier evaluacion de calidad debe hacerse por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; no se detalla en la informacion disponible) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits oQ4e de oMLX (`oq_level=4` enhanced, group size 64, anchos de bit mixtos por capa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |
| Modelo base | TokenRhythm/NeoHorse-1-4B (revision `56f0584bb40578a2c33b1b40a08ccd17243ad710`) |
| Modelo original | Qwen/Qwen3.5-4B (Copyright 2026 Alibaba Cloud) |
| Tamano del repositorio | 2,5 GB |
| Modalidad | solo texto |
| Herramienta de cuantizacion | oMLX `quantize_oq_streaming` |
| Calibracion | `oqe_code_multilingual`, 128 muestras de longitud 512, 248 entradas de imatrix |
| Fecha de publicacion | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo subyacente, NeoHorse-1-4B, es un transformer decoder-only de 4,2 B de parametros post-entrenado desde Qwen/Qwen3.5-4B por el autor TokenRhythm. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se especifica si emplea attention lineal, decodificacion especulativa u otras innovaciones propias de la familia Qwen3.5. Todo ello queda como no disponible.

Lo que si documenta esta ficha es el proceso de cuantizacion, que constituye la unica intervencion de 0xPatronum sobre los pesos. Se partio de un snapshot verificado en BF16 de la revision indicada y se aplico el conversor `quantize_oq_streaming` de oMLX con `oq_level=4` en modo enhanced y group size 64. El calibrador integrado `oqe_code_multilingual` uso 128 muestras de 512 tokens para generar 248 entradas de imatrix, sin ninguna ausente. El resultado son pesos con anchos de bit mixtos por capa, caracteristica definitoria del formato oQ4e, empaquetados exclusivamente para texto.

## Capacidades

- Generacion de texto autoregresiva, segun declara el pipeline `text-generation` del repositorio.
- Uso conversacional multi-turno, segun la etiqueta `conversational` del modelo.
- Procesamiento exclusivamente textual: la model card indica explicitamente "Text only", por lo que no hay torre de vision ni entrada de audio.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues: no disponible. El calibrador empleado se llama `oqe_code_multilingual`, lo que sugiere que la calibracion cubrio mezcla de idiomas y codigo, pero esto afecta al proceso de cuantizacion y no constituye una declaracion de cobertura idiomatica del modelo.
- Capacidad especial destacable: ninguna documentada mas alla de la propia cuantizacion.

## Casos de uso

- Asistente conversacional local en Mac: al pesar 2,5 GB y cargarse con MLX, permite mantener conversaciones multi-turno sin conexion y sin enviar datos a terceros, algo relevante en entornos con requisitos de privacidad. La calidad real de las respuestas debe validarse localmente, ya que no hay benchmarks publicados.
- Prototipado de aplicaciones de generacion de texto: util como modelo de pruebas en fases tempranas de desarrollo, integrado mediante `mlx-lm` u oMLX, antes de escalar a un modelo mayor o a una version sin cuantizar.
- Evaluacion de tecnicas de cuantizacion: comparar la salida de este pack oQ4e frente al snapshot BF16 de TokenRhythm/NeoHorse-1-4B permite medir la degradacion introducida por los 4 bits en tareas concretas del dominio propio.
- Extraccion y reescritura de informacion: resumen de documentos cortos, etiquetado de textos, normalizacion de campos y reformulacion de parrafos, siempre que la longitud de entrada se mantenga conservadora dado que el contexto no esta documentado.
- Generacion de codigo asistida en editor local: el calibrador `oqe_code_multilingual` apunta a que el proceso de cuantizacion considero codigo, pero no existen resultados de HumanEval ni de ninguna otra prueba que respalden un uso productivo sin verificacion previa.
- Preprocesado de corpus para entrenamiento: generacion de pares instruccion-respuesta o de datos sinteticos de bajo coste en un Mac, aprovechando que el modelo cabe en memoria unificada y no requiere GPU dedicada.
- Despliegue en equipos de sobremesa Apple (Mac mini, Mac Studio) con varios usuarios concurrentes ligeros: el peso reducido permite mantener varias instancias cargadas o servir peticiones cortas en paralelo, aunque no se dispone de datos de throughput.
- Demostraciones y docencia sin conexion: escenarios de aula o taller donde se necesita un modelo generativo ejecutable en hardware de consumo y con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web realizada no devolvio ninguna fuente tecnica relacionada con el modelo: los resultados obtenidos corresponden a hilos de foro sobre transportes y a debates de programacion sin relacion con NeoHorse ni con la familia Qwen3.5. No se dispone por tanto de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni para esta cuantizacion ni para el modelo base.

## Requisitos de hardware

- Peso en disco: 2,5 GB por repositorio, segun los metadatos de Hugging Face.
- Memoria estimada para inferencia: en torno a 3 GB para los pesos en 4 bits mas el cache KV y el overhead del runtime; de forma orientativa, entre 3,5 GB y 4,5 GB con contextos moderados. Es una estimacion derivada del tamano del repositorio, no un dato publicado.
- Apple Silicon: cualquier equipo con memoria unificada suficiente. 8 GB es el minimo practico y 16 GB o mas es lo recomendable para trabajar con contextos largos o varias sesiones. El formato MLX esta pensado para esta plataforma.
- GPU NVIDIA: no hay soporte nativo en este repositorio. Para usar el modelo en CUDA seria necesario convertirlo a otro formato, como GGUF o safetensors de Hugging Face en precision completa.
- GPU de datacenter (A100, H100): no aplicables a este pack, ya que MLX no las soporta de forma nativa.
- Opciones de despliegue: oMLX (runtime para el que esta empaquetado el modelo) y `mlx-lm` en el ecosistema Apple. llama.cpp, Ollama, vLLM y TGI requieren una conversion previa del formato, por lo que no pueden cargar el repositorio tal cual.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| 0xPatronum/NeoHorse-1-4B-oQ4e | 4,2 B | no disponible | safetensors MLX, 4 bits oQ4e | Apache 2.0 | Objeto de esta ficha; 2,5 GB en disco; solo texto |
| TokenRhythm/NeoHorse-1-4B | 4,2 B | no disponible | safetensors BF16 | Apache 2.0 | Modelo base sin cuantizar; mayor huella de memoria |
| Qwen/Qwen3.5-4B | 4 B (segun nomenclatura del autor) | no disponible | safetensors | Apache 2.0 | Modelo original del que deriva NeoHorse-1-4B; Copyright 2026 Alibaba Cloud |

No se dispone de datos de rendimiento comparado entre estas variantes ni frente a alternativas de otros fabricantes, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Repositorio sin validacion externa: cero descargas y cero valoraciones en el momento de la consulta, sin senales de uso en produccion.
- Degradacion por cuantizacion: el paso a 4 bits introduce perdida de calidad frente al BF16 original, y no se publica ninguna medicion que cuantifique esa perdida.
- Longitud de contexto desconocida: no se puede asumir soporte para documentos largos ni para conversaciones extensas sin comprobarlo experimentalmente.
- Idiomas no declarados: no hay ninguna garantia sobre el rendimiento en castellano ni en ningun otro idioma concreto.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala, agravado por la ausencia de evaluaciones publicadas y por el efecto de la cuantizacion.
- Sesgos: no se ha publicado informacion sobre composicion del dataset de entrenamiento ni sobre analisis de sesgos.
- Capacidades no confirmadas: no hay evidencia de soporte de tool calling, uso agentico ni modo de razonamiento explicito.
- Limitacion modal: solo acepta texto; no procesa imagenes, audio ni otros formatos.
- Compatibilidad de formato: oQ4e es un formato propio de oMLX y no equivale a un pack OptiQ de mlx-optiq. Cargarlo en otro runtime exige conversion previa.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero obliga a conservar los avisos de copyright y licencia. El modelo deriva de Qwen/Qwen3.5-4B, cuyo copyright corresponde a Alibaba Cloud (2026), y la cuantizacion mantiene la misma licencia.
- Trazabilidad: la cuantizacion se ancla a una revision concreta del modelo base, `56f0584bb40578a2c33b1b40a08ccd17243ad710`. Cambios posteriores en el repositorio original no se reflejan en este pack.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xPatronum/NeoHorse-1-4B-oQ4e
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Revision del modelo base usada para la cuantizacion: `56f0584bb40578a2c33b1b40a08ccd17243ad710`
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
