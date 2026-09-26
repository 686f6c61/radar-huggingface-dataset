# katalidevai/katali-code-hybrid-qwen15b-codegemma2b-granite3b-q4

## Resumen

KATALI Code Hybrid es un paquete experimental publicado por el usuario `katalidevai` que no contiene un unico modelo neuronal, sino un contenedor en formato `.khyb` con tres modelos de generacion de codigo cuantizados de forma independiente: Qwen2.5-Coder 1.5B, CodeGemma 2B y Granite Code 3B, los tres en Q4_K_M y con un total aproximado de 6.500 millones de parametros. El autor lo presenta como un "pipeline de tres codificadores" en el que cada modelo desempena un papel distinto dentro de una misma peticion: el modelo de 1,5B redacta un borrador de solucion, el de 2B lo revisa y el de 3B realiza una revision final del codigo.

La diferencia clave respecto a propuestas habituales de ensamblado de modelos es que aqui no hay fusion de pesos ni enrutador (router). Los tres payloads GGUF se almacenan de forma integra y sin perdida dentro del contenedor, y es un runtime externo propietario, `katali-hybrid.exe`, el que ejecuta la integracion secuencial. El propio autor insiste en que no se trata de una fusion matematica de tres redes en una sola, sino de un empaquetado de conveniencia para su runtime.

El interes del repositorio es mas metodologico que de rendimiento: ilustra un patron de "cascada de revision" entre modelos pequenos que caben en equipos modestos, con licencia Apache-2.0 declarada para el paquete y sin datos publicados de benchmarks, idiomas o longitud de contexto. El repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que debe considerarse material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contenedor `.khyb` con tres transformers densos independientes: Qwen2.5-Coder 1.5B, CodeGemma 2B y Granite Code 3B. No es un MoE ni un modelo fusionado |
| Parametros totales | Aproximadamente 6.500 millones en conjunto (1,5B + 2B + 3B), almacenados en tres payloads GGUF separados |
| Parametros activos | No aplica (no es MoE). Cada etapa activa un unico modelo: 1,5B para el borrador, 2B para la revision intermedia, 3B para la revision final |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M en los tres payloads |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 declarada para el paquete. Los pesos upstream de Qwen, Google e IBM se rigen por sus propias licencias, que el autor no detalla y pide verificar antes de redistribuir |
| Formato de pesos | GGUF (Q4_K_M) empaquetados en un contenedor `.khyb`. Tamano del repositorio: 4,9 GB |

## Arquitectura y entrenamiento

No hay entrenamiento propio. El paquete reutiliza tres modelos preentrenados de terceros y los conserva sin modificar: el autor afirma explicitamente que el empaquetado es sin perdida respecto a los tres payloads GGUF, que no fusiona pesos incompatibles y que no emplea enrutador. La "arquitectura" real del sistema es, por tanto, una orquestacion secuencial en tres fases (borrador, revision intermedia y revision final) ejecutada por el runtime KATALI, no una topologia de red nueva.

Esto tiene consecuencias tecnicas directas: el coste de inferencia es la suma de tres generaciones consecutivas, la memoria necesaria depende de si el runtime mantiene los tres modelos residentes o los carga por etapas, y la calidad final es funcion de la cadena completa y no de un unico modelo. No se documentan en la informacion disponible los datos de entrenamiento, el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO, ya que esos detalles pertenecen a los model cards upstream que el autor no reproduce.

## Capacidades

- Generacion de codigo a partir de instrucciones en lenguaje natural, con modo de respuesta restringido a codigo puro (el ejemplo del autor pide "Return only code").
- Revision de codigo en cascada: el borrador del modelo de 1,5B se pasa al de 2B y el resultado al de 3B, de modo que cada etapa puede corregir la anterior.
- Analisis de correccion funcional basica, ejemplificado por el propio autor con la comprobacion de desbordamiento de enteros en C.
- Ejecucion local y offline una vez descargado el contenedor, sin dependencia de APIs externas.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso autonomo: no disponible; el unico flujo multi-paso documentado es la cascada fija de tres etapas.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Revision automatizada en pre-commit o CI: el pipeline puede invocarse sobre un diff o un fichero concreto para obtener un borrador de correccion y dos pasadas de revision; el binario acepta la instruccion y un limite de tokens (`--max 64` en el ejemplo), lo que encaja en un hook de control de calidad.
- Deteccion de errores de seguridad en C y C++: el ejemplo oficial comprueba desbordamiento de enteros, un patron clasico de vulnerabilidad; sirve como primera barrera antes de revision humana.
- Generacion de parches en entornos air-gapped: al ser un paquete local de 4,9 GB sin llamadas de red, puede desplegarse en maquinas aisladas donde no se permite enviar codigo a servicios en la nube.
- Prototipado en portatiles sin GPU dedicada: los tres modelos son pequenos y estan en Q4_K_M, por lo que el objetivo declarado del autor es un flujo de revision de codigo asequible en hardware de gama media.
- Ensenanza de revision de codigo: al exponer tres pasadas separadas, permite inspeccionar que aporta cada etapa y comparar borrador y resultado final, util en material didactico sobre calidad de codigo.
- Filtrado previo de sugerencias en asistentes de codigo internos: la cascada puede actuar como verificador barato de las salidas de un modelo mayor antes de mostrarlas al desarrollador.
- Normalizacion de estilo en fragmentos cortos: con el limite de tokens bajo que sugiere el ejemplo (`--max 64`), encaja en tareas de reescritura de funciones pequenas y no en generacion de modulos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra suite, y tampoco cifras de latencia o throughput. El autor no compara el paquete con alternativas ni aporta metricas de calidad del pipeline de tres etapas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 4,9 GB, de modo que mantener los tres modelos residentes exigiria en torno a 5-7 GB contando cache KV y sobrecarga del runtime. Si el runtime carga cada etapa por separado, el pico seria el del mayor de los tres (Granite Code 3B en Q4_K_M, aproximadamente 2 GB de pesos) mas la sobrecarga. Estas cifras son estimaciones derivadas del tamano del repositorio, no datos publicados por el autor.
- GPU recomendadas: no disponibles. No hay indicacion de requisitos minimos ni de soporte de aceleracion por GPU en la informacion proporcionada.
- GPU de consumo: por tamano, cabria esperar funcionamiento en GPUs consumer con 6-8 GB de VRAM o mas (por ejemplo, RTX 3060, 4060 o superiores) si el runtime lo permite, pero esto no esta documentado.
- Opciones de despliegue: la unica via documentada es el binario `katali-hybrid.exe` sobre el contenedor `.khyb`. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni de servidores compatibles con OpenAI. La extraccion de los payloads GGUF para cargarlos con llama.cpp no esta descrita ni soportada oficialmente.
- Latencia y throughput: no disponibles. Cabe senalar que, por diseno secuencial, la latencia de una peticion equivale a la suma de tres generaciones encadenadas, con el coste asociado en tokens generados y en cambios de modelo.

## Comparativa con modelos similares

No hay datos de benchmarks publicados que permitan comparar el paquete con alternativas externas. La comparacion posible es interna, entre los tres componentes declarados:

| Componente | Parametros | Cuantizacion | Papel en el pipeline |
|---|---|---|---|
| Qwen2.5-Coder 1.5B | 1,5B | Q4_K_M | Redacta el borrador de la solucion |
| CodeGemma 2B | 2B | Q4_K_M | Primera revision del borrador |
| Granite Code 3B | 3B | Q4_K_M | Revision final del codigo |

Frente a modelos de codigo monoliticos de tamano similar o superior (por ejemplo, un unico modelo de 6-7B en Q4), este paquete no ofrece datos de rendimiento que permitan establecer una comparacion; lo unico contrastable es el enfoque (tres pasadas secuenciales frente a una sola generacion) y el formato de despliegue no estandar.

## Limitaciones y advertencias

- El propio autor lo califica de integracion experimental y niega explicitamente que los tres modelos esten fusionados en una unica red neuronal.
- No hay benchmarks, evaluaciones ni metricas de calidad publicadas; no hay evidencia cuantitativa de que la cascada mejore a un modelo unico.
- El repositorio no registra descargas ni valoraciones, y las fechas de creacion y actualizacion son atipicas (2026), lo que dificulta evaluar su mantenimiento y procedencia.
- La licencia Apache-2.0 se declara solo para el paquete; los pesos de Qwen, Google e IBM conservan sus licencias originales, que el autor no reproduce y que hay que verificar antes de cualquier uso comercial o redistribucion. En particular, CodeGemma pertenece a la familia de modelos de Google y suele estar sujeta a los terminos de uso de Gemma, no a Apache-2.0.
- Dependencia de un runtime propietario para Windows (`katali-hybrid.exe`); el formato `.khyb` no es un estandar y no hay documentacion publica de su especificacion.
- Longitud de contexto, idiomas soportados y soporte de tool calling no documentados: no puede planificarse su uso en tareas que requieran contexto largo o integracion con herramientas sin verificar estos puntos.
- Los tres modelos son de tamano pequeno (1,5B, 2B y 3B), por lo que cabe esperar un razonamiento limitado y mayor propension a errores sutiles en logica compleja que en modelos mayores.
- Riesgo de alucinacion en la revision: un revisor pequeno puede introducir cambios incorrectos o marcar como erroneo codigo valido. La cascada no incluye verificacion por compilacion o tests.
- No se documentan sesgos especificos del paquete; los sesgos heredados dependen de los modelos upstream, cuyos model cards no se reproducen aqui.
- El coste de latencia es acumulativo por diseno (tres generaciones encadenadas), lo que penaliza su uso interactivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/katalidevai/katali-code-hybrid-qwen15b-codegemma2b-granite3b-q4
- El autor indica que deben consultarse los model cards y ficheros de licencia upstream de Qwen, Google e IBM, pero no incluye enlaces directos a ellos en la informacion proporcionada. Referencias de organizacion (los enlaces directos a los model cards no aparecen en la informacion disponible):
  - https://huggingface.co/Qwen
  - https://huggingface.co/google
  - https://huggingface.co/ibm-granite
- No se han proporcionado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
