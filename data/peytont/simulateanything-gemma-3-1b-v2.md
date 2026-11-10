# PeytonT/SimulateAnything-Gemma-3-1B-v2

## Resumen

SimulateAnything-Gemma-3-1B-v2 es un adaptador LoRA experimental publicado por PeytonT sobre el modelo base google/gemma-3-1b-it. Su proposito no es la generacion de texto generalista, sino la produccion de planes estructurados y tipados para un motor de simulacion de escenas fisicas denominado SimulateAnything. El adaptador se distribuye junto con un grafo ONNX cuantizado en q4 pensado para inferencia en navegador mediante WebGPU y transformers.js.

El modelo trabaja sobre contratos cerrados: escenas de cuerpos rigidos con limites, disposiciones visuales de bosque, arroyo y lago, nueve modelos fisicos preexistentes, operaciones de ordenacion y busqueda, y controles de panel. No es un ejecutor de codigo ni un simulador fisico: genera JSON que debe validar la aplicacion anfitriona antes de ejecutarse. La version v2 amplia el adaptador v1 con ejemplos sinteticos y de replay, y anade ejemplos de refinamiento derivados de fallos de desarrollo.

La relevancia del proyecto es acotada pero ilustrativa: demuestra un patron de adaptacion de un modelo pequeno (1B) a un dominio estrictamente tipado con validacion externa obligatoria, y documenta de forma inusualmente explicita sus metricas de cualificacion, incluyendo los casos que fallan. El repositorio ocupa 0,9 GB e incluye pesos safetensors, artefactos ONNX y el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text) con adaptador LoRA; grafo ONNX para inferencia web |
| Parametros totales | no disponible (modelo base google/gemma-3-1b-it, aproximadamente 1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (ONNX, block size 32); BF16 para evaluacion nativa; safetensors del adaptador |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-1b-it, un transformer decoder-only de la familia Gemma 3 en su variante de 1B parametros ajustada para instrucciones. Sobre esa base se entrena un adaptador LoRA orientado a la autoria de escenas y a la planificacion en lenguaje nativo dentro del dominio SimulateAnything. El adaptador v2 continua el adaptador v1 y se entrena con 2443 ejemplos sinteticos y de replay mas 1155 ejemplos de refinamiento. Los ejemplos de refinamiento se construyeron a partir de fallos observados en desarrollo, lo que introduce un sesgo de seleccion que el propio autor advierte explicitamente.

La evaluacion se realizo en BF16 nativo y en q4 sobre navegador con WebGPU real. En BF16 el modelo completo 34 de 52 peticiones de simulacion de desarrollo y 9 de 11 parafrasis adicionales; las comprobaciones de no mutacion pasaron 9 de 10 y 3 de 3. En q4 en navegador completo 31 de 52 y 7 de 11, frente a 3 de 52 y 2 de 11 del v1 en el mismo contexto ampliado. Dieciocho peticiones de desarrollo carecen de adaptador de chat ejecutable y quedan incompletas. La conversion a q4 provoco la regresion de tres acciones de ordenacion. El grafo ONNX q4 usa block size 32 y el adaptador se incluye tambien en el repositorio. Las identidades de revision base, entrenamiento y exportacion se documentan en provenance.json, y los casos exactos en qualification.json.

## Capacidades

- Generacion de planes JSON tipados para escenas de cuerpos rigidos con limites definidos.
- Composicion de disposiciones visuales de bosque, arroyo y lago (efectos visuales, no un solver acoplado de hidrologia o ecologia).
- Seleccion y parametrizacion de nueve modelos fisicos existentes en la aplicacion.
- Operaciones de ordenacion y busqueda dentro del contrato de la aplicacion.
- Control de paneles de interfaz mediante entradas tipadas.
- Aceptacion de identificadores de entorno versionados exactos como alias tipados.
- Recuperacion de escena previa persistida y sustitucion de elementos (por ejemplo, arroyo por lago).
- Creacion automatica de objetos (validada con la creacion automatica de cuatro esferas).
- Deteccion de no mutacion ante preguntas o negaciones (no ejecuta cambios cuando la peticion no lo requiere).
- No soporta tool calling generico, agentes multi-paso abiertos ni ejecucion de codigo; su salida esta restringida al contrato de SimulateAnything.

## Casos de uso

- Prototipado de interfaces de simulacion en navegador: el grafo ONNX q4 con block size 32 permite ejecutar el modelo en el cliente via WebGPU y transformers.js, sin backend dedicado, para generar planes de escena a partir de lenguaje natural.
- Autoria asistida de escenas de cuerpos rigidos: el modelo traduce una peticion en un plan JSON con objetos, restricciones y parametros que la aplicacion valida antes de instanciar la simulacion.
- Configuracion de escenarios visuales: genera disposiciones de bosque, arroyo y lago como efectos visuales, util para demos y entornos de prueba donde no se requiere fidelidad hidrologica.
- Control conversacional de paneles: acepta identificadores de entorno versionados como alias tipados y permite modificar entradas de panel mediante instrucciones en lenguaje natural, con recuperacion de la escena previa persistida.
- Pruebas de robustez de validadores: al documentar tasas de fallo concretas (18 peticiones sin adaptador ejecutable, 3 regresiones de ordenacion en q4), sirve como caso de estudio para disenar validadores tipados que rechacen planes invalidos.
- Investigacion sobre adaptacion de dominio con modelos de 1B: el par de adaptadores v1 y v2, con ejemplos de refinamiento derivados de fallos, es un ejemplo reproducible de iteracion sobre fallos de desarrollo en un dominio cerrado.
- Filtrado de intencion y no mutacion: los controles de no accion ante preguntas o negaciones son utiles en asistentes de configuracion donde una orden ambigua no debe alterar el estado.

## Benchmarks y rendimiento

| Evaluacion | BF16 nativo | q4 navegador (WebGPU) | v1 (contexto ampliado) |
|---|---|---|---|
| Peticiones de simulacion de desarrollo completadas | 34/52 | 31/52 | 3/52 |
| Parafrasis adicionales completadas | 9/11 | 7/11 | 2/11 |
| Comprobaciones de no mutacion (desarrollo) | 9/10 | 9/10 | no disponible |
| Comprobaciones de no mutacion (parafrasis) | 3/3 | 3/3 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son metricas de cualificacion especificas del dominio SimulateAnything y no constituyen puntuaciones de inteligencia general; el autor lo indica explicitamente. Las parafrasis adicionales se congelaron antes de inspeccionar las salidas refinadas. En q4, tres acciones de ordenacion regresaron durante la conversion y un caso de desarrollo emitio un plan no soportado que la aplicacion rechaza.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base es de aproximadamente 1B parametros y el artefacto q4 esta disenado para inferencia en navegador, por lo que el requisito de memoria es bajo en comparacion con modelos mayores.
- GPU recomendadas: no disponible. El artefacto q4 se probo mediante inferencia WebGPU real en navegador; no se documentan modelos de GPU concretos.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo base (1B) y la cuantizacion q4, aunque no se aportan cifras verificadas en la informacion disponible.
- Opciones de despliegue: transformers.js con WebGPU (probado); el repositorio incluye safetensors y ONNX, por lo que es compatible con stacks que acepten dichos formatos, aunque no se documentan pruebas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimulateAnything-Gemma-3-1B-v2 | ~1B (base) | no disponible | Adaptador LoRA de dominio para planes de simulacion tipados | gemma | Hugging Face, ONNX q4 para navegador |
| google/gemma-3-1b-it | ~1B | no disponible | Modelo base de instrucciones generalista | gemma | Hugging Face |
| SimulateAnything-Gemma-3-1B-v1 | ~1B (base) | no disponible | Version previa del adaptador, mismo dominio | gemma | Hugging Face (referenciado por el autor) |

No se dispone de datos de benchmarks comparables con modelos de la misma categoria en la informacion proporcionada. La comparacion con el modelo base y con v1 se limita a las metricas de cualificacion del dominio recogidas en la seccion anterior.

## Limitaciones y advertencias

- No es un modelo de proposito general: su salida esta restringida al contrato de SimulateAnything y no debe usarse como ejecutor de codigo ni como simulador fisico.
- La validacion JSON no garantiza la intencion del usuario ni la exactitud fisica; la aplicacion anfitriona debe aplicar su validador tipado y rechazar planes invalidos.
- Las metricas de cualificacion estan sesgadas: el refinamiento se entreno con fallos de desarrollo y las parafrasis adicionales, aunque congeladas antes de inspeccionar las salidas, no constituyen una evaluacion imparcial.
- Dieciocho peticiones de desarrollo no tienen adaptador de chat ejecutable y quedan incompletas.
- La conversion a q4 degrada el rendimiento: tres acciones de ordenacion regresionan y un caso emite un plan no soportado.
- Arboles, agua de escenario y viento son efectos visuales, no un solver acoplado de hidrologia o ecologia.
- Los idiomas soportados no estan documentados; el entrenamiento se describe en ingles y no se garantiza comportamiento multilingue.
- Riesgo de alucinacion en la generacion de planes: el propio autor advierte que la salida puede ser erronea.
- Licencia Gemma Terms of Use con restricciones de uso prohibido; el uso comercial esta sujeto a dichos terminos. Los pesos modificados se identifican en NOTICE.
- El orden de propiedades cambio respecto a v1; las integraciones deben usar el contrato de la aplicacion del repositorio SimulateAnything.
- No se documentan sesgos especificos mas alla de los derivados del conjunto de entrenamiento sintetico y de replay.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PeytonT/SimulateAnything-Gemma-3-1B-v2
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Repositorio de la aplicacion SimulateAnything (referenciado en la model card, URL no disponible)
- Ficheros de procedencia y cualificacion: provenance.json y qualification.json en el repositorio del modelo (URLs directas no disponibles)
- Licencia y avisos: LICENSE y NOTICE en el repositorio del modelo (URLs directas no disponibles)
