# nicomedu-labs/NicomEdu-Alpha

## Resumen

NicomEdu-Alpha es un modelo de lenguaje experimental publicado por el usuario nicomedu-labs en HuggingFace, especializado mediante ajuste fino en respuestas de aula de matematicas de nivel SS2 (equivalente al penultimo curso de secundaria superior en Nigeria). Se construye sobre el modelo base IFM/K2-Horizon-3.7B, en su revision 633f52ad28b17edeabd82afc61d2d13b4c59a561, y la adaptacion consiste en un QLoRA fusionado directamente en los pesos base. El repositorio declara 5.058.255.360 parametros (aproximadamente 5,06 mil millones) segun los ficheros safetensors, aunque el nombre del modelo base sugiere 3,7 mil millones: no hay explicacion publicada de esa discrepancia.

El modelo resuelve un nicho muy concreto: generar explicaciones y respuestas con formato de clase de matematicas para el curriculo SS2, partiendo de un conjunto de entrenamiento privado de solo 229 registros, de los cuales 141 son reescrituras de presentacion asistidas por profesor y 88 registros especificos de modo sin modificar. La licencia es Apache-2.0 y el unico idioma declarado es el ingles (etiqueta `en`).

Su relevancia es fundamentalmente metodologica y de investigacion: es un ejemplo publicado de pipeline de ajuste eficiente (QLoRA sobre un modelo base con codigo personalizado) aplicado a un dominio educativo con recursos minimos, acompanado de un ejercicio de transparencia poco habitual en el que el propio autor documenta los fallos observados. Se presenta explicitamente como Alpha, sin validacion de la comunidad (0 descargas, 1 like en el momento de la consulta) y no apto para decisiones educativas de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Los tags `k2_horizon` y `custom_code` indican una arquitectura propia heredada del modelo base IFM/K2-Horizon-3.7B, que exige `trust_remote_code=True` para cargarse |
| Parametros totales | 5.058.255.360 (~5,06 B) segun los ficheros safetensors del repositorio |
| Parametros activos | No disponible; no se declara que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican versiones cuantizadas oficiales. Los pesos se distribuyen en bfloat16; la cuantizacion en 8 y 4 bits via bitsandbytes es tecnicamente posible pero no esta verificada por el autor |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`), con `trust_remote_code=True` |

Otros datos del repositorio: tamano aproximado de 10,1 GB, pipeline `text-generation`, creado y actualizado el 21 de septiembre de 2026, 0 descargas y 1 like.

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo. El modelo base es IFM/K2-Horizon-3.7B, etiquetado en el repositorio derivado con los tags `k2_horizon` y `custom_code`, lo que implica que la implementacion no es una de las clases estandar de `transformers` y que es necesario ejecutar codigo remoto del repositorio para instanciarla. La carga documentada por el autor usa `AutoModelForCausalLM` y `AutoTokenizer` con `torch_dtype=torch.bfloat16` y `device_map="auto"`. No se detalla si se trata de un transformer denso, un MoE, un modelo de espacio de estados o una arquitectura hibrida, ni se indica la longitud de contexto nativa ni el vocabulario.

El entrenamiento es un ajuste por QLoRA fusionado en los pesos del modelo base, con formato de instruccion simple (instruccion, entrada y salida en texto plano). El conjunto de datos es privado y consta de 229 registros controlados: 141 reescrituras de presentacion asistidas por profesor y 88 registros especificos de modo sin modificar, con 11 registros fuente excluidos por no resolverse. El autor publica el SHA-256 del dataset (`662dcba5475857d276f43400d1c26b1d988bb28bb344f9ab21badff3fd1865b6`), lo que permite verificar integridad, aunque no auditar el contenido. No se menciona uso de RLHF, DPO ni ninguna otra etapa de alineacion posterior al ajuste supervisado. La innovacion destacable no es tecnica sino de proceso: un ciclo de adaptacion reproducible y documentado sobre un modelo base con codigo personalizado, con trazabilidad de revision y huella del dataset.

## Capacidades

- Generacion de texto conversacional en ingles con formato de explicacion de aula.
- Resolucion de problemas de matematicas de nivel SS2 y presentacion del procedimiento paso a paso, con calidad verificada como parcial (ver limitaciones).
- Generacion de pistas o ayudas graduadas para el alumnado, aunque la evaluacion interna detecto al menos un caso de primera pista no responsiva.
- Respuesta a instrucciones generales en texto plano; el autor advierte que puede responder a prompts no matematicos, sin que ese comportamiento se haya evaluado.
- Uso de formato Markdown en las respuestas, si bien el autor senala que puede ser inconsistente.
- Capacidad conversacional multi-turno declarada mediante el tag `conversational`, sin especificacion de la ventana de contexto.
- No se declara soporte de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de borradores de explicaciones de matematicas de SS2 para revision docente: el modelo produce una primera version textual del desarrollo de un ejercicio que el profesorado revisa y corrige antes de llevarla al aula, reduciendo el tiempo de preparacion de material repetitivo.
- Motor de practica guiada en un asistente de estudio experimental: se integra en un prototipo de chat donde el alumnado pide pistas progresivas sobre un ejercicio; requiere validacion humana previa de las pistas por los problemas de respuesta no responsiva documentados.
- Generacion de variantes de ejercicios: a partir de un enunciado dado, el modelo puede producir ejercicios analogos de la misma unidad didactica para ampliar el banco de problemas, siempre con verificacion posterior por no ser una autoridad matematica verificada.
- Investigacion sobre ajuste eficiente en dominios educativos: al ser un QLoRA sobre un modelo base con codigo personalizado y con dataset de 229 registros y hash publicados, sirve como caso de estudio reproducible de adaptacion de bajo coste y de sus efectos secundarios (repeticion, sobreajuste, degradacion fuera de dominio).
- Prototipado de asistentes educativos con recuperacion aumentada: el modelo puede actuar como generador final en una arquitectura RAG que recupere el temario de SS2, de modo que el contexto y las formulas provengan de fuentes verificadas y el modelo solo redacte la explicacion.
- Banco de pruebas para mitigacion de artefactos de modelos con codigo personalizado: es util para investigar la supresion de tokens de control heredados del modelo base (los "K2 control tokens" que el autor verifico como ausentes en su evaluacion) y de patrones de repeticion en la generacion.
- Evaluacion comparativa de estrategias de decodificacion: dado que el autor reporta repeticion y continuacion tras respuestas completas, el modelo sirve como sujeto de pruebas para parametros de penalizacion de repeticion, longitud y parada temprana.
- Material auxiliar para docentes no nativos de ingles: permite generar enunciados y explicaciones en ingles para aulas de matematicas con instruccion en ese idioma, sujeto a revision linguistica y matematica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, GSM8K, HumanEval, MATH ni de ninguna otra bateria estandarizada, ni comparaciones cuantitativas con otros modelos.

Lo unico que se publica es un resumen cualitativo de una evaluacion privada con 12 prompts, cuyos hallazgos se recogen a continuacion de forma literal a lo declarado por el autor:

| Aspecto evaluado | Resultado declarado |
|---|---|
| Tokens de control K2 | No se detectaron |
| Ecuacion con corchetes | Respuesta incorrecta |
| Primera pista | Resultado no responsivo en un caso |
| Repeticion | Presente en algunas respuestas |
| Formato Markdown | Inconsistente en algunos casos |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: unos 10,1 GB solo para pesos, mas cache KV y activaciones; en la practica se recomienda un minimo de 12-14 GB de VRAM. Estimacion propia, no publicada por el autor.
- Cuantizacion en 8 bits (bitsandbytes): aproximadamente 5-6 GB de pesos; compatible con GPUs de 8 GB en adelante, ajustado.
- Cuantizacion en 4 bits (NF4): aproximadamente 3-4 GB de pesos; cabe en GPUs de 6-8 GB.
- GPUs recomendadas: RTX 4090 o RTX 3090 (24 GB) en bfloat16 con holgura; A100 40/80 GB y H100 para despliegue concurrente; RTX 4080 o 4070 Ti Super (16 GB) en bfloat16 muy justo, mejor en 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 4080/4070 Ti Super en bfloat16, y en tarjetas de 8-12 GB si se cuantiza.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la unica via documentada por el autor. No hay confirmacion de compatibilidad con vLLM, TGI, llama.cpp, Ollama ni otros motores, y la dependencia de codigo personalizado hace probable que requieran portar la implementacion (no verificado). El soporte de GGUF no esta disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de NicomEdu-Alpha, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los valores de los modelos alternativos corresponden a sus especificaciones publicas habituales.

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| NicomEdu-Alpha | ~5,06 B | No disponible | Apache-2.0 | Matematicas SS2 en ingles | Pesos safetensors, requiere `trust_remote_code` |
| IFM/K2-Horizon-3.7B (modelo base) | ~3,7 B segun nombre (no confirmado) | No disponible | No disponible en la informacion proporcionada | Modelo generalista | Pesos originales en HuggingFace |
| Qwen2.5-7B-Instruct | ~7,6 B | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache-2.0 | Instrucciones generales y codigo | Amplia disponibilidad, multiples cuantizaciones |
| Llama-3.1-8B-Instruct | ~8 B | 131.072 tokens | Licencia comunitaria Llama 3.1 | Instrucciones generales y multilingue | Amplia disponibilidad, multiples cuantizaciones |

## Limitaciones y advertencias

- Version Alpha explicita: el autor la describe como experimental, no es una autoridad matematica verificada y no esta aprobada para decisiones educativas de alto riesgo.
- Precisión matematica no garantizada: la propia evaluacion interna documenta al menos una respuesta incorrecta en una ecuacion con corchetes.
- Repeticion y continuacion: puede repetir texto o seguir generando despues de haber completado la respuesta, lo que exige truncado y penalizacion de repeticion en produccion.
- Respuestas no responsivas: se documento un caso de primera pista que no respondia a lo solicitado.
- Formato inconsistente: el uso de Markdown puede variar entre respuestas, lo que complica el parseo automatico.
- Fuera de dominio no evaluado: puede responder a prompts no matematicos y su rendimiento en esas tareas no se ha medido. Tampoco se ha evaluado su comportamiento fuera del nivel SS2.
- Un solo idioma: solo se declara ingles; no hay soporte multilingue, lo que incluye la ausencia de castellano.
- Riesgo de sobreajuste: el ajuste se hizo con 229 registros privados, una muestra muy pequena y no auditable en contenido; la diversidad tematica y estilistica es presumiblemente baja.
- Discrepancia de parametros: el modelo base se denomina "3.7B" pero el modelo publicado declara 5,06 B de parametros, sin explicacion publicada.
- Riesgo de ejecucion de codigo remoto: la carga exige `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; en entornos de produccion conviene auditar ese codigo y fijar revisiones concretas.
- Licencia: el modelo se distribuye bajo Apache-2.0, que permite uso comercial, pero al ser un derivado de IFM/K2-Horizon-3.7B conviene revisar los ficheros LICENSE y NOTICE para confirmar los terminos y la atribucion exigida por el modelo base.
- Validacion externa nula: 0 descargas y 1 like en el momento de la consulta; no hay evaluaciones independientes ni reportes de terceros.
- Riesgo de alucinacion: no se ha medido ni cuantificado; dado el tamano del dataset de ajuste y la ausencia de etapas de alineacion, debe asumirse un riesgo elevado en cualquier contenido factual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nicomedu-labs/NicomEdu-Alpha
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Revision concreta del modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B/tree/633f52ad28b17edeabd82afc61d2d13b4c59a561
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo.
