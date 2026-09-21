# notnotsamuel/LFM2.5-350M-RLCD

## Resumen

LFM2.5-350M-RLCD es un paquete de inferencia publicado por el usuario notnotsamuel sobre los pesos originales de LiquidAI/LFM2.5-350M (revision 9e6c6ccf47cd318696e137d381a7ded8fe4df09f). No es un modelo entrenado ni ajustado: el repositorio incluye una copia byte a byte de los pesos y del tokenizador originales, junto con codigo, resultados de benchmark y un manifiesto de checksums. El valor anadido es el motor RLCD, un metodo de decodificacion restringida que hace prefill del contexto una sola vez, reutiliza el estado de atencion y de convolucion entre ramas candidatas y puntua en lote los valores permitidos por un JSON Schema, ensamblando despues la salida en Python.

El modelo base tiene 354.483.968 parametros y pertenece a la familia LFM2 de Liquid AI, una arquitectura hibrida que combina capas de atencion y de convolucion, segun se desprende de la propia descripcion del motor. Soporta los idiomas ingles, frances y espanol, y se distribuye con licencia lfm1.0. El repositorio ocupa 0.7 GB y acumula 228 descargas y 17 likes en el momento de redactar esta ficha.

Su relevancia actual es acotada pero concreta: no compite en calidad de generacion, sino en latencia y garantia estructural para tareas de extraccion de campos con valores finitos. En una prueba sintetica de 28 campos booleanos, el metodo restringido alcanzo una latencia media de 43,76 ms en H100 frente a 2586,97 ms del metodo autorregresivo, un factor de 59,12x. El precio es que la precision por campo se mantiene baja (60,7% frente a 53,6% en H100), de modo que la garantia es de sintaxis y esquema, no de acierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (hibrida, con atencion y convolucion); el autor no detalla la configuracion de capas |
| Parametros totales | 354.483.968 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor indica que no se aplico cuantizacion. Los experimentos usan FP16 |
| Idiomas soportados | en, fr, es |
| Licencia | lfm1.0 (campo `license: other` con `license_name: lfm1.0`) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0.7 GB |
| Pipeline | text-generation (con tags de classification y structured-generation) |
| Fecha de creacion | 2026-09-16 |
| Fecha de actualizacion | 2026-09-16 |

## Arquitectura y entrenamiento

El repositorio no entrena ni ajusta nada: empaqueta los pesos originales de LiquidAI/LFM2.5-350M sin modificacion, sin cuantizacion y con checksums verificados en BASE_MODEL_MANIFEST.json. La arquitectura subyacente es LFM2, descrita por el autor como un modelo con estado de atencion y de convolucion reutilizable entre ramas de decodificacion, lo que implica un diseno hibrido. No se aporta en la informacion disponible el numero de capas, la dimension oculta, el numero de cabezas ni la composicion del dataset de entrenamiento del modelo base. Tampoco hay datos sobre si el modelo original paso por RLHF, DPO u otra fase de alineamiento.

La innovacion tecnica del paquete RLCD esta enteramente en el metodo de inferencia. En lugar de generar token a token y validar despues, el motor hace prefill del contexto una vez y conserva el estado de atencion y convolucion, evaluando en lote todos los valores candidatos definidos en el esquema. La seleccion se hace por puntuacion de secuencia completa, lo que permite distinguir candidatos que comparten prefijos de token. El JSON final se ensambla en Python a partir de valores tipados y permitidos, por lo que la validez sintactica y el cumplimiento del esquema son garantias del programa, no del modelo. Los benchmarks reportados usan atencion eager de PyTorch y la implementacion de referencia de convolucion, sin causal-conv1d optimizado, torch.compile, FlashAttention ni MLX, tal como especifica el autor.

## Capacidades

- Generacion de texto conversacional heredada del modelo base LFM2.5-350M, con soporte de en, fr y es.
- Extraccion de atributos con valores finitos: seleccion entre enums de cadena no vacios y campos booleanos.
- Generacion estructurada con garantia de sintaxis JSON valida y de cumplimiento de un subconjunto restringido de JSON Schema.
- Decodificacion restringida con puntuacion en lote de candidatos y reutilizacion de estado entre ramas.
- Puntuacion de log-verosimilitud de secuencias candidatas completas (expuesta como `result["scores"]`, sin calibracion).
- Carga directa del modelo base incluido mediante AutoModelForCausalLM y AutoTokenizer de transformers.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Ejecucion en Apple Silicon (MPS) y en NVIDIA (CUDA) con dtype float16.
- Tool calling, function calling, agentes, vision, audio y modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Clasificacion de tickets de soporte: con el ejemplo incluido en la model card, el motor lee un mensaje de cliente y devuelve tres campos tipados (tema entre billing, technical o shipping, urgencia booleana y solicitud de reembolso booleana). Es adecuado porque el espacio de salida es cerrado y el esquema se valida de forma programatica.
- Enrutado de formularios y encuestas: convertir respuestas de texto libre en objetos JSON con un numero fijo de campos de eleccion multiple, manteniendo el contrato de datos aunque las respuestas del modelo puedan ser incorrectas.
- Etiquetado automatico a escala con latencia ajustada: al reutilizar estado entre ramas, el coste por peticion cae muy por debajo del autorregresivo en GPUs de datacenter (54,12 ms en L40S frente a 3404,48 ms en la prueba de 28 campos).
- Preprocesado en pipelines de datos: generar metadatos estructurados antes de un modelo mayor, usando el esquema como contrato y descartando los casos de baja utilidad.
- Inferencia local en portatiles Apple Silicon: el autor reporta 393,20 ms por peticion en un M2 Max con el metodo restringido, lo que permite ejecutar el motor en un equipo de desarrollo sin GPU dedicada.
- Moderation triage con valores discretos: marcar categorias de contenido permitidas por un enum y requerir accion inmediata como booleano, sabiendo que la decision del modelo requiere revision humana.
- Extraccion de campos en sistemas de gestion documental: poblar estructuras fijas a partir de texto no estructurado donde el fallo de esquema es mas costoso que el fallo de valor.
- Prototipado de restricciones de salida: banco de pruebas para comparar decodificacion restringida frente a generacion autorregresiva con el mismo prompt y los mismos pesos.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor: una entrada sintetica con 28 campos booleanos, dos calentamientos por metodo y tres repeticiones medidas, todo en FP16 y con el mismo prompt. Los tiempos son latencia media extremo a extremo; AR significa generacion autorregresiva.

| Hardware | Restringido (media) | Autorregresivo (media) | Aceleracion | JSON valido (restringido / AR) | Esquema valido (restringido / AR) | Precision por campo (restringido / AR) |
|---|---:|---:|---:|---:|---:|---:|
| M2 Max | 393,20 ms | 3326,95 ms | 8,46x | 100% / 100% | 100% / 100% | 60,7% / 53,6% |
| L40S | 54,12 ms | 3404,48 ms | 62,91x | 100% / 100% | 100% / 100% | 64,3% / 53,6% |
| H100 | 43,76 ms | 2586,97 ms | 59,12x | 100% / 100% | 100% / 100% | 60,7% / 53,6% |

Datos adicionales aportados por el autor:

- Ninguno de los dos metodos produjo un objeto de 28 campos completamente correcto.
- En la suite diagnostica de 12 casos, la aceleracion estuvo entre 6,25x y 9,68x, y la precision por campo bajo del 80,6% al 77,8%.
- Con 255 candidatos en el Mac, la inferencia restringida fue 3,23x mas lenta que la autorregresiva.
- No se publican resultados de MMLU, HumanEval, GSM8K ni de benchmarks academicos en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos en FP16: aproximadamente 0,68 GB para 354,48 millones de parametros (0,7 GB de repositorio, que ademas incluye codigo, benchmarks y manifiesto).
- VRAM estimada para inferencia: no disponible como medicion publicada; con los pesos en FP16 y el estado de atencion y convolucion cacheado, es esperable que quede por debajo de 2 GB en FP16, aunque el autor no lo cuantifica.
- GPU validadas en los benchmarks: NVIDIA L40S (54,12 ms de media restringida) y NVIDIA H100 (43,76 ms), ambas con aceleraciones de 62,91x y 59,12x respectivamente.
- Apple Silicon: validado en un M2 Max mediante el backend MPS con dtype float16 (393,20 ms de media restringida).
- Cabe en GPU de consumo: muy probablemente si, dado el tamano de parametros, pero no hay medicion publicada en GPUs consumer como RTX 4090, RTX 3090 o similares.
- Opciones de despliegue: el paquete usa PyTorch 2.14.0 y Transformers 5.17.0 con el motor RLCD propio. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni pesos GGUF.
- Latencia: los unicos datos son los de la tabla anterior, medidos con atencion eager de PyTorch y convolucion de referencia, sin backends optimizados, por lo que no representan el maximo alcanzable.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| notnotsamuel/LFM2.5-350M-RLCD | 354.483.968 | no disponible | Inferencia estructurada sobre pesos LFM2.5-350M | lfm1.0 | HuggingFace, 228 descargas, 17 likes |
| LiquidAI/LFM2.5-350M | 354.483.968 (mismos pesos) | no disponible | Modelo base generativo de proposito general | lfm1.0 | HuggingFace, repositorio oficial de Liquid AI |
| Otros modelos pequenos de la misma categoria (por ejemplo, alternativas de ~350-500 M) | no disponible | no disponible | Generacion de texto general | no disponible | no disponible |

El comparador directo y unico documentado es el modelo base: RLCD usa exactamente los mismos pesos, tokenizador y revision, por lo que cualquier diferencia de calidad observada se debe al metodo de decodificacion y no al modelo. La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo ni sobre alternativas comparables; los unicos resultados obtenidos fueron paginas de comercio electronico sin relacion con el tema.

## Limitaciones y advertencias

- La precision por campo es baja: 60,7% en M2 Max y H100, 64,3% en L40S con el metodo restringido, frente a 53,6% del autorregresivo. Ningun metodo resolvio correctamente los 28 campos.
- La garantia de JSON valido y de esquema cumplido proviene del ensamblado en Python a partir de valores permitidos, no de la calidad de las decisiones del modelo.
- Las puntuaciones de los candidatos no estan calibradas. El autor indica explicitamente que no se realizo ninguna evaluacion de calibracion y que no se expone una API de probabilidad normalizada.
- Dependencia del enunciado de los candidatos: las puntuaciones varian segun la redaccion, la tokenizacion, la longitud y el terminador de nueva linea de cada candidato.
- Los campos se deciden de forma independiente, por lo que no se garantiza consistencia entre campos ni veracidad del contenido.
- El subconjunto de esquemas soportado es muy restringido: objetos planos, todas las propiedades obligatorias, `additionalProperties: false`, y cada campo debe ser booleano o un enum de cadena no vacio. Las restricciones no soportadas se rechazan.
- La cardinalidad de los enums no esta limitada en el codigo, pero conjuntos grandes pueden agotar la memoria. Con 255 candidatos en un Mac, el metodo restringido fue 3,23x mas lento que el autorregresivo.
- Solo se declaran los idiomas en, fr y es; no hay datos de rendimiento por idioma.
- Longitud de contexto no documentada, lo que impide planificar cargas con entradas largas.
- Licencia lfm1.0: es una licencia propia de Liquid AI, no una licencia de codigo abierto estandar. Antes de un uso comercial hay que revisar el texto enlazado por el autor, ya que las condiciones de uso comercial no se detallan en la informacion proporcionada.
- Es un paquete de solo inferencia: no se realizo entrenamiento ni ajuste, y el autor aclara que no se reproduce el metodo propietario de entrenamiento Jev de TypeSafe.ai.
- El repositorio no documenta soporte para GGUF, vLLM, TGI, llama.cpp ni Ollama, ni backends optimizados como causal-conv1d, torch.compile, FlashAttention o MLX, por lo que las latencias publicadas no reflejan el maximo rendimiento alcanzable.
- Las fechas de creacion y actualizacion del repositorio son posteriores a la fecha habitual de referencia; se reproducen tal cual aparecen en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/notnotsamuel/LFM2.5-350M-RLCD
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Revision fijada del modelo base: 9e6c6ccf47cd318696e137d381a7ded8fe4df09f
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-350M/blob/9e6c6ccf47cd318696e137d381a7ded8fe4df09f/LICENSE
- Informe de resultados y mediciones brutas: results/REPORT.md (en el repositorio del modelo)
- Manifiesto y checksums de los pesos base: BASE_MODEL_MANIFEST.json (en el repositorio del modelo)
- Resultados de busqueda web: no se encontraron enlaces tecnicos relevantes sobre este modelo, su metodo o modelos comparables.
