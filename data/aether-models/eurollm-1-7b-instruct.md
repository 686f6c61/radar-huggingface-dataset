# aether-models/eurollm-1.7b-instruct

## Resumen

aether-models/eurollm-1.7b-instruct es un paquete de pesos distribuido como bundle Core AI (`.aimodel`) para el SDK Aether, orientado a aplicaciones en iOS y macOS 27 o superiores. No es un modelo entrenado desde cero: es una conversion y cuantizacion del modelo upstream utter-project/EuroLLM-1.7B-Instruct (revision `a25c7fa65fc2a644e6270b8940dbe295b51da681`), con pesos en int8 linear per-channel. El objetivo es permitir inferencia local en dispositivo (on-device) sobre hardware Apple, sin depender de servicios en la nube.

El modelo subyacente es EuroLLM-1.7B-Instruct, un transformer decoder-only de 1.7.000 millones de parametros desarrollado por un consorcio europeo (utter-project, con participacion de Unbabel, Instituto Superior Tecnico y University of Edinburgh, entre otros, con financiacion de la Union Europea). Fue preentrenado con 4 billones de tokens sobre datos web, datos paralelos en pares en-xx y xx-en, y conjuntos de alta calidad, y posteriormente ajustado por instrucciones sobre EuroBlocks. Su proposito es cubrir las lenguas oficiales de la UE con calidad comparable a modelos multilingues genericos de mayor tamano.

La relevancia de este bundle concreto es de ingenieria: traslada un modelo de 1.7B en bfloat16 a un formato int8 de 1,93 GB por variante, con verificacion numerica documentada por digest de bundle sobre dispositivos reales (iPhone18,2 y Mac17,6). Para un desarrollador que quiera publicar una app de chat o traduccion sin conexion en el ecosistema Apple, este bundle es una via de integracion directa mediante el SDK Aether; la contrapartida es que queda fuera de los runtimes habituales de servidor como vLLM o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de EuroLLM-1.7B-Instruct); el bundle es una exportacion Core AI, no un cambio de arquitectura |
| Parametros totales | 1.7B (1.700 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 linear per-channel (8 bits en pesos); variante de referencia sin cuantizar no publicada |
| Idiomas soportados | 35 idiomas segun la informacion de busqueda (lenguas oficiales de la UE mas arabe, chino, hindi, japones y otros); la model card del bundle no detalla la lista |
| Licencia | Apache-2.0 (el bundle incluye el texto canonico de la licencia; el modelo fuente la declaraba sin fichero de licencia adjunto) |
| Formato de pesos | Core AI `.aimodel` (bundle con tokenizer del modelo fuente); no incluye safetensors ni GGUF |
| Variantes publicadas | `macos-any-gpu`, `ios-any-gpu`, `ios-h18p-gpu` (1,93 GB cada una) |
| Tamano del repositorio | 3,8 GB |
| Compatibilidad | iOS y macOS 27+ (Aether SDK) |
| Fecha de publicacion en el Hub | 23 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo original EuroLLM-1.7B es un transformer decoder-only denso de 1.7B parametros, preentrenado sobre 4 billones de tokens repartidos entre las lenguas objetivo y varias fuentes: datos web, datos paralelos en ambas direcciones (en-xx y xx-en) y conjuntos de alta calidad. El ajuste por instrucciones se realizo sobre EuroBlocks, convirtiendo el modelo base en un modelo conversacional capaz de seguir instrucciones; el entrenamiento de ese ajuste uso perdida de entropia cruzada estandar con precision mixta bfloat16 y empaquetado (packing) de secuencias. La model card de HuggingFace etiqueta el modelo fuente con la libreria `llama`, lo que indica una implementacion compatible con la familia Llama.

Sobre esa base, el bundle de aether-models aplica una receta de conversion propia (`eurollm-1.7b-instruct@1`) desde PyTorch a Core AI mediante "Aether forge". Los pesos resultantes son int8 linear per-channel, es decir, cuantizacion de 8 bits con escala por canal de salida, manteniendo los ficheros de tokenizer del modelo fuente sin modificaciones. La innovacion tecnica relevante no esta en el entrenamiento sino en el pipeline de verificacion: cada variante se valida mediante pruebas por niveles (T0, T1, T2) sobre fixtures fijas y se identifica por digest del bundle, comparando contra una exportacion sin cuantizar como referencia estricta. No se documenta en la informacion disponible el uso de decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia mas alla de la cuantizacion.

## Capacidades

- Generacion de texto y conversacion multi-turno en modo instruct, heredadas del ajuste sobre EuroBlocks.
- Cobertura multilingue amplia: 35 idiomas segun la informacion de busqueda, con enfasis en las lenguas oficiales de la Union Europea y cobertura adicional de arabe, chino, hindi y japones.
- Traduccion entre lenguas europeas, favorecida por el uso de datos paralelos en-xx y xx-en durante el preentrenamiento.
- Seguimiento de instrucciones y respuesta a prompts conversacionales a traves de la API `chat` del SDK Aether.
- Inferencia 100 % local en dispositivo, sin llamadas de red, segun el diseno del bundle.
- Ejecucion en GPU Apple dentro del runtime Core AI; las variantes para iOS se especializan en la primera carga (salvo `ios-h18p-gpu`, que se distribuye ya compilada).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso explicitas: no disponibles en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; la pipeline declarada es unicamente `text-generation`.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Asistente conversacional sin conexion en apps de iOS y macOS: el bundle `.aimodel` se carga con `Aether.chat("eurollm-1.7b-instruct")` y responde en local, lo que permite ofrecer chat funcional en modo avion, en entornos sin cobertura o en dispositivos con politicas de red restringidas.
- Traduccion en dispositivo para viajes y trabajo de campo: gracias al entrenamiento con datos paralelos en 35 idiomas, se puede integrar un traductor de frases y parrafos entre lenguas europeas sin enviar el texto a un servidor, lo que simplifica el cumplimiento del RGPD al no haber transferencia de datos personales.
- Redaccion y reescritura de textos profesionales en lenguas minoritarias de la UE: borradores de correos, informes o respuestas administrativas en idiomas con poca representacion en modelos genericos, usando el modelo como asistente de redaccion dentro de la propia aplicacion.
- Procesamiento de documentos confidenciales en el puesto de trabajo: resumen y extraccion de puntos clave de notas internas, contratos o historiales que no pueden salir del dispositivo, aprovechando que el peso cuantizado ocupa 1,93 GB y se ejecuta sobre la GPU integrada.
- Funciones de accesibilidad: simplificacion de textos, generacion de resumenes hablables y reformulacion en lenguaje claro dentro de apps de lectura asistida, con latencia local y sin coste por token.
- Herramientas de escritorio para macOS en macOS 27+: integracion del bundle en utilidades nativas (editores, gestores de notas, clientes de correo) que necesiten generacion de texto sin infraestructura de servidor ni facturacion por API.
- Aplicaciones educativas de idiomas: generacion de ejercicios, correcciones y explicaciones gramaticales multilingues ejecutadas en el propio iPhone, utiles en centros con conectividad limitada.
- Prototipado de productos en el ecosistema Apple: la CLI `aether run eurollm-1.7b-instruct --prompt "Hello"` permite evaluar la calidad del modelo antes de invertir en despliegue de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni metricas equivalentes) para este bundle ni para su modelo fuente en los materiales consultados.

La model card si documenta un proceso de verificacion funcional, distinto de un benchmark de calidad. Se reproduce a continuacion tal como aparece:

| Variante | Nivel | Resultado | Detalle | Dispositivo | Build de SO | Compute |
|---|---|---|---|---|---|---|
| `ios-any-gpu` | T0 | pass | - | iPhone18,2 | 24A437 | target |
| `ios-any-gpu` | T2 | pass | 17/17 strict; perfil quantized-8bit; fixture `69ff880acd753c6f` | iPhone18,2 | 24A437 | target |
| `ios-h18p-gpu` | T0 | pass | - | iPhone18,2 | 24A437 | target |
| `ios-h18p-gpu` | T2 | pass | 17/17 strict; perfil quantized-8bit; fixture `69ff880acd753c6f` | iPhone18,2 | 24A437 | target |
| `macos-any-gpu` | T0 | pass | - | Mac17,6 | 26A428 | target |
| `macos-any-gpu` | T1 | pass | - | Mac17,6 | 26A428 | target |
| `macos-any-gpu` | T2 | pass | 17/17 strict; perfil quantized-8bit; fixture `69ff880acd753c6f` | Mac17,6 | 26A428 | target |
| referencia sin cuantizar (no publicada) | T2 | pass | 17/17 strict; perfil strict; fixture `69ff880acd753c6f` | Mac17,6 | 26A428 | target |

El perfil cuantizado exige ademas que la referencia sin cuantizar supere el nivel T2 estricto, condicion que se cumple segun la tabla.

## Requisitos de hardware

- Almacenamiento: 1,93 GB por variante descargada; el repositorio completo ocupa 3,8 GB.
- Memoria: el peso int8 ocupa 1,93 GB, por lo que se necesita al menos esa cantidad de memoria unificada mas el overhead del runtime (KV cache y buffers de activaciones). Una estimacion conservadora de trabajo es de 2,5 a 3,5 GB de memoria unificada, aunque no se publica una cifra oficial.
- GPU compatibles: exclusivamente Apple Silicon a traves del runtime Core AI; el bundle no esta pensado para GPU NVIDIA, AMD o Intel.
- GPU de consumo: si, cabe en dispositivos Apple de gama alta; las pruebas se ejecutan sobre iPhone18,2 y Mac17,6. El resto de combinaciones de hardware no esta verificado en la informacion disponible.
- Versiones de sistema: iOS y macOS 27 o superiores, segun la model card.
- Variantes por plataforma: `macos-any-gpu` y `ios-any-gpu` se especializan en la primera carga; `ios-h18p-gpu` se distribuye ya compilada para la arquitectura h18p.
- Opciones de despliegue: SDK Aether (Swift, `import Aether`, `aether.chat(...)`) y la CLI `aether run eurollm-1.7b-instruct --prompt "Hello"`. vLLM, llama.cpp, Ollama y TGI no consumen el formato `.aimodel`; para esos runtimes habria que recurrir al modelo fuente en PyTorch o a conversiones GGUF de terceros.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Coste de red: nulo en inferencia, ya que la ejecucion es local tras la descarga del bundle.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| aether-models/eurollm-1.7b-instruct (este bundle) | 1.7B | no disponible | Core AI `.aimodel`, int8 | Apache-2.0 | Optimizado para iOS/macOS 27+, verificacion por bundle digest, 3 variantes |
| utter-project/EuroLLM-1.7B-Instruct (modelo fuente) | 1.7B | no disponible | PyTorch / safetensors (pesos originales) | Apache-2.0 declarada en la model card | Mismo comportamiento esperado, sin cuantizar; apto para backends de servidor |
| Qwen2.5-1.5B-Instruct | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Alternativa habitual en el rango 1,5-2B; datos no verificados en esta busqueda |
| Gemma-2-2B-it | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Alternativa habitual en el rango 1,5-2B; datos no verificados en esta busqueda |

La comparacion estricta solo puede establecerse entre el bundle y su modelo fuente, ya que la informacion disponible no incluye resultados de benchmarks que permitan situar a EuroLLM-1.7B-Instruct frente a otras familias de tamano similar. La diferencia funcional entre ambos es el formato y la cuantizacion: el bundle gana en tamano y en integracion con Apple, mientras que el modelo fuente conserva la precision completa y la compatibilidad con herramientas de servidor.

## Limitaciones y advertencias

- El modelo tiene 1.7B parametros: la calidad de razonamiento, matematicas y codigo es inherentemente inferior a la de modelos de 7B o superiores. No se han publicado benchmarks que permitan acotar esa diferencia.
- Riesgo de alucinacion propio de un modelo denso pequeno ajustado por instrucciones; no se documentan mecanismos de mitigacion ni tasas de error medidas.
- La cuantizacion int8 linear per-channel puede degradar ligeramente la calidad respecto a la referencia sin cuantizar. La verificacion reportada es de tipo funcional (17/17 estricto sobre una fixture), no una evaluacion de calidad generativa.
- No se especifica la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos sin medir previamente el comportamiento real.
- La lista exacta de 35 idiomas no se detalla en la model card del bundle; el reparto de calidad entre lenguas es desigual por construccion, con sesgo previsible hacia las lenguas con mas datos disponibles.
- Sesgos conocidos: no documentados en la informacion disponible; al proceder de datos web y paralelos, son esperables sesgos de genero, nacionalidad y representacion linguistica.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. El bundle incluye el texto canonico de la licencia porque el modelo fuente no adjuntaba fichero.
- El bundle esta acoplado al SDK Aether y a iOS/macOS 27+; no es portable a otros runtimes ni a versiones anteriores del sistema operativo.
- No hay soporte declarado de tool calling, agentes, vision ni audio, lo que descarta pipelines de automatizacion complejos sin trabajo adicional.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad ni reportes independientes de comportamiento en produccion.
- El ajuste por instrucciones del modelo fuente se hizo unicamente sobre EuroBlocks, un conjunto mas limitado que los usados por modelos comerciales; el seguimiento de instrucciones complejas puede ser fragil.

## Enlaces

- HuggingFace del bundle: https://huggingface.co/aether-models/eurollm-1.7b-instruct
- Modelo fuente en HuggingFace: https://huggingface.co/utter-project/EuroLLM-1.7B-Instruct
- Arbol de ficheros del modelo fuente: https://huggingface.co/utter-project/EuroLLM-1.7B-Instruct/tree/main
- Paper de EuroLLM: https://arxiv.org/html/2409.16235v1
- Ficha resumen en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/eurollm-17b-instruct-utter-project
- Repositorio espejo en GitHub: https://github.com/vassdel/utter-project-EuroLLM-1.7B/
