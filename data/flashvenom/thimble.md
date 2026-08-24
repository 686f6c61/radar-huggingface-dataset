# flashvenom/thimble

## Resumen

Thimble es un modelo de 48,12 millones de parámetros especializado exclusivamente en tool calling, desarrollado por el autor flashvenom. No es un modelo de lenguaje general: no conversa, no razona ni genera prosa. Su única función es leer un catálogo de funciones tipadas junto con una petición, y devolver las llamadas a ejecutar o una lista vacía cuando ninguna encaja. Esta estrechez de propósito es deliberada: el tokenizador, la pérdida de entrenamiento y el decodificador están diseñados alrededor de cinco decisiones concretas, de modo que el modelo nunca gasta capacidad en emitir JSON que no va a producir.

La relevancia actual del modelo radica en su tamaño extremadamente reducido (48M parámetros) combinado con una garantía estructural de salida: mediante decodificación restringida por gramática compilada a partir de los esquemas JSON de las herramientas, la salida siempre es JSON bien formado, los nombres de argumentos provienen del esquema y es imposible emitir llamadas a herramientas no declaradas. Esto lo convierte en una opción viable para despliegue en edge y on-device, donde los modelos grandes no caben o consumen demasiada energía. Está entrenado solo en inglés y su licencia es MIT, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la informacion proporcionada) |
| Parametros totales | 48,12 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,2 GB, probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la informacion disponible; el autor indica que el tokenizador, la perdida de entrenamiento y el decodificador estan construidos alrededor de cinco decisiones de diseno: rechazar-o-llamar, que herramienta, incluir este opcional, que valor, parar o continuar. Todo lo demas (llaves, comillas, comas, nombres de argumentos) esta determinado antes de que el modelo se ejecute, gracias a una gramatica compilada a partir de los esquemas de las herramientas. Esto hace que la salida malformada sea inalcanzable por construccion, no improbable.

Los datos de entrenamiento no se detallan en numero total de tokens, pero el autor declara que la mezcla incluye el split de entrenamiento publico de Mobile Actions (8.693 filas, disjunto del de evaluacion). Compara su modelo con Needle 2 (45M parametros, 153B tokens de entrenamiento) afirmando que Thimble usa 150 veces menos datos de entrenamiento. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

- Tool calling con salida JSON siempre bien formada por construccion (grammar-constrained decoding).
- Los nombres de argumentos provienen del esquema del usuario; la alucinacion de nombres de parametros es estructuralmente imposible.
- No puede emitir llamadas a herramientas no declaradas en el catalogo proporcionado.
- Soporta cadenas de llamadas: en filas con dos o mas llamadas, alcanza un 73,5% de exactitud en catalogos conocidos.
- Comportamiento extractivo: funciona bien cuando las peticiones son directas y con valores explicitos (identificadores, codigos, fechas, numeros, seleccion de enums).
- No genera prosa, no razona, no escribe codigo ni mantiene conversaciones.
- Capacidades multilingues: no disponibles (solo ingles).

## Casos de uso

- Automatizacion de acciones en dispositivos moviles: el modelo puede interpretar ordenes como "abre la app de fotos y sube la imagen mas reciente" y traducirlas a llamadas de funcion concretas de un catalogo de acciones, gracias a su alto rendimiento en el dataset Mobile Actions (86,3%).
- Integracion en asistentes de voz embebidos: dado su tamano de 48M parametros, puede ejecutarse en tiempo real en un dispositivo de bajo consumo sin depender de la nube, convirtiendo comandos de voz pretranscritos en llamadas a API locales.
- Orquestacion de APIs internas en entornos con recursos limitados: un catalogo de endpoints tipados permite que el modelo genere las llamadas correctas sin necesidad de un LLM grande, reduciendo costes de inferencia.
- Sistemas de automatizacion de pruebas (QA): el modelo puede generar llamadas a funciones de test a partir de descripciones textuales de casos, garantizando que las llamadas siempre se ajustan al esquema de la API.
- Asistentes de terminal o CLI: dado un conjunto de comandos tipados, Thimble puede traducir una peticion en lenguaje natural a la invocacion del comando correcto con sus argumentos, sin riesgo de sintaxis invalida.
- Adaptacion a dominios especificos: al ser tan pequeno, especializarlo a un catalogo de funciones concreto es un proceso rutinario; el autor sugiere que es viable para catalogos de APIs de dominios como bioinformatica, finanzas o logistica.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en exact match estricto ordenado (nombres de funcion, orden de llamadas y valores de argumentos deben coincidir). La columna derecha es una referencia comparativa con Needle 2 (45M parametros, 153B tokens de entrenamiento), no un rival directo.

| Suite | Thimble v6 | Needle 2 (45M) |
|---|---|---:|---:|
| Mobile Actions (961) | 86,3 | 63,7 |
| Mobile Actions, filas con dos o mas llamadas | 73,5 | 48,4 |
| DroidCall (200) | 52,5 | 17,0 |
| Seal-Tools in-domain (700) | 33,1 | 32,6 |
| Well-formed JSON | 100,0 | 93,4 |
| Seal-Tools out-of-domain (654) | 28,1 | 28,7 |
| BFCL v4 single-turn (3.641) | 23,5 | 42,6 |

Nota: los resultados de Seal-Tools in-domain y out-of-domain muestran que el modelo falla mas en catalogos no vistos, y el autor indica que la precision de la secuencia de nombres sigue exactamente la precision de las filas: el fallo no es en la extraccion de argumentos sino en la seleccion de la funcion correcta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 48M parametros en fp32 ocuparia aproximadamente 192 MB, y en cuantizacion de 8 bits alrededor de 48 MB, pero no se confirman formatos de cuantizacion.
- GPU recomendadas: no se especifican; dado el tamano, es plausible que funcione en cualquier GPU consumer con mas de 1 GB de VRAM, pero no se ha verificado.
- Compatibilidad con consumer GPU: probablemente si, por el tamano, pero no hay datos oficiales.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; la libreria es pytorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (BFCL v4 single-turn) | Licencia | Disponibilidad |
|---|---|---|---|---:|---|---|
| Thimble v6 | 48,12M | no disponible | 23,5 | MIT | HuggingFace |
| Needle 2 | 45M | no disponible | 42,6 | no disponible | no disponible |
| Qwen 0.6B (fine-tuned) | 600M | no disponible | no disponible | no disponible | no disponible (mencionado por el autor como alternativa) |

El autor indica que si se puede permitir 600M de parametros, un fine-tuning de Qwen probablemente obtenga mejores resultados. Needle 2 es el unico modelo comparable con datos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje general: no conversa, no razona, no genera texto libre. Intentar usarlo para tareas de generacion de texto fallara.
- Solo funciona en ingles.
- Comportamiento degradado con frases conversacionales: en una prueba con 15 filas, un catalogo de apps con frases conversacionales obtuvo 0,57, frente a 0,75 en un catalogo biomedico con notacion de puntos.
- No soporta catalogos de mundo abierto (open-world) ni dialectos de esquema de Java o JavaScript.
- No soporta instanciaciones paralelas de un mismo esquema.
- La precision en catalogos no vistos es baja (23,5 en BFCL v4), por lo que no es adecuado para catalogos de herramientas desconocidas sin ajuste fino.
- Riesgo de alucinacion: mitigado para nombres de argumentos y herramientas, pero no en los valores de los argumentos; el modelo puede inventar valores cuando la peticion no los explicita.
- Sesgos conocidos: no se documentan, pero la ausencia de datos multilingues y la dependencia de datos de entrenamiento especificos (Mobile Actions) pueden sesgar el comportamiento en dominios no representados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flashvenom/thimble
- Perfil del autor: https://huggingface.co/flashvenom
- Repositorio de codigo (GitHub): https://github.com/nikshepsvn/thimble (enlazado desde la model card)
- Licencia MIT: https://github.com/nikshepsvn/thimble/blob/master/LICENSE
- Nota: el sitio https://thimbleai.com/ pertenece a otra entidad y no esta relacionado con este modelo.
