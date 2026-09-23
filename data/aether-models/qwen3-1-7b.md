# aether-models/qwen3-1.7b

## Resumen

aether-models/qwen3-1.7b es un empaquetado del modelo Qwen/Qwen3-1.7B preparado por el autor aether-models para el SDK Aether en iOS y macOS 27 o superior. No se trata de un modelo nuevo: es una conversion del checkpoint original de PyTorch (revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`, licencia Apache-2.0) al formato Core AI (`.aimodel`) mediante la herramienta Aether forge, con receta `qwen3-1.7b@2` y pesos cuantizados a int8 lineal por canal (8 bits por peso). Los ficheros de tokenizador son los del modelo de origen.

El interes del paquete es de despliegue, no de investigacion: resuelve el problema de ejecutar un modelo de lenguaje de 1,7 mil millones de parametros en el dispositivo, sin conexion, sobre GPU de Apple tanto en movil como en escritorio. El repositorio publica tres variantes (`macos-any-gpu`, `ios-any-gpu` e `ios-h18p-gpu`), todas de 1,74 GB de descarga, y acompania un directorio `verification/` con registros de evaluacion ligados al digest del bundle. La variante `ios-h18p-gpu` se distribuye ya compilada, mientras que las otras dos se especializan en la primera carga.

El modelo base es un transformer denso de la familia Qwen3, lo que situa al paquete en la categoria de modelos pequenos orientados a inferencia local. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 me gusta, y se publico el 23 de septiembre de 2026. La informacion disponible del autor es exhaustiva en lo relativo a empaquetado, cuantizacion y verificacion, pero escasa en lo relativo a arquitectura detallada, contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso heredado de Qwen/Qwen3-1.7B; empaquetado Core AI (`.aimodel`). El detalle de capas, cabezas de atencion y dimension oculta no esta disponible en la informacion proporcionada |
| Parametros totales | No disponible en la informacion proporcionada; el modelo de origen se denomina Qwen3-1.7B |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 lineal por canal (8 bits por peso); existe un export sin cuantizar usado como referencia, no publicado |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (se incluye el fichero `LICENSE` del modelo de origen) |
| Formato de pesos | Core AI (`.aimodel`), convertido desde PyTorch por Aether forge (receta `qwen3-1.7b@2`). Descarga por variante: 1,74 GB. Tamano total del repositorio: 5,2 GB |

Variantes publicadas:

| Variante | Plataforma | Arquitectura de destino | Compute | Compilada | Descarga |
|---|---|---|---|---|---|
| `macos-any-gpu` | macOS | cualquiera | GPU | No (se especializa en la primera carga) | 1,74 GB |
| `ios-any-gpu` | iOS | cualquiera | GPU | No (se especializa en la primera carga) | 1,74 GB |
| `ios-h18p-gpu` | iOS | h18p | GPU | Si | 1,74 GB |

## Arquitectura y entrenamiento

No hay informacion en los materiales proporcionados sobre el proceso de entrenamiento del modelo (numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento). Lo unico documentado es la cadena de transformacion: el checkpoint PyTorch de Qwen/Qwen3-1.7B se convierte a formato Core AI con la receta `qwen3-1.7b@2` y se cuantiza a int8 lineal por canal. El tokenizador no se modifica respecto al original.

La innovacion tecnica del paquete esta en el propio pipeline de conversion y en su sistema de verificacion. El autor publica registros en `verification/` asociados por digest del bundle, con niveles T2 (fixture de texto estricto) y T3 (tareas de evaluacion como `gsm8k-test-100` y `copy-fidelity-v1`), y compara siempre contra un export sin cuantizar del mismo modelo sobre el mismo fixture. El perfil cuantizado exige, ademas, que el export sin cuantizar pase el T2 estricto. Es un enfoque de validacion poco habitual en repositorios de modelos y permite auditar el impacto real de la cuantizacion int8. Las variantes `macos-any-gpu` e `ios-any-gpu` se especializan para el hardware concreto en la primera carga, mientras que `ios-h18p-gpu` llega ya compilada para ese objetivo.

## Capacidades

- Generacion de texto conversacional: el ejemplo de la model card muestra uso tanto por linea de comandos (`aether run qwen3-1.7b --prompt "Hello"`) como mediante API Swift (`aether.chat("qwen3-1.7b")` con `respond(to:)`).
- Razonamiento aritmetico basico: la variante `macos-any-gpu` obtiene un 78,0% en 100 items de GSM8K, por encima del 73,0% de la referencia sin cuantizar.
- Fidelidad de copia: 100,0% en el conjunto `copy-fidelity-v1` (50 items), tanto en la variante cuantizada como en la referencia, lo que indica que la cuantizacion no degrada la reproduccion literal de texto.
- Inferencia en el dispositivo sin conexion: las tres variantes se ejecutan con compute GPU en iOS y macOS, y al menos una verificacion T2 paso en modo `cpuOnly` sobre macOS.
- Capacidades especificas del modelo base (tool calling, modo de razonamiento explicito, vision, audio): no estan documentadas en la informacion proporcionada para este paquete.
- Soporte multilingue: no disponible en la informacion proporcionada para este paquete.

## Casos de uso

- Asistente conversacional integrado en una app de iOS: el paquete `ios-any-gpu` ocupa 1,74 GB y se ejecuta sobre GPU del dispositivo, lo que permite ofrecer chat de texto sin enviar datos del usuario a un servidor y sin depender de conectividad.
- Procesado de texto privado en macOS: notas, correos o documentos que no deben salir del equipo pueden resumirse o reescribirse con la variante `macos-any-gpu`, que ademas ha demostrado funcionar en modo `cpuOnly` cuando no hay GPU disponible o se quiere liberar el acelerador.
- Generacion de texto en primer plano dentro de una app de productividad: la API Swift (`aether.chat(...).respond(to:)`) permite insertar el modelo en un flujo asincrono nativo y mostrar la respuesta como texto plano, lo que encaja en editores, clientes de correo o herramientas de notas.
- Autocompletado y reescritura en aplicaciones de escritura: el 100% de fidelidad de copia en `copy-fidelity-v1` sugiere que el modelo es fiable en tareas de transformacion literal del texto de entrada, como reformatear, citar o reescribir sin alterar contenido.
- Resolucion de problemas aritmeticos sencillos en herramientas educativas: el 78,0% en GSM8K sobre 100 items lo situa como candidato para ejercicios de primaria o secundaria ejecutados localmente, siempre con supervision del resultado.
- Prototipado y pruebas de integracion del SDK Aether: al ser un bundle autocontenido con comandos de ejecucion directa, sirve para validar que la cadena `aether run` y la API Swift funcionan antes de adoptar modelos mayores en la misma infraestructura.
- Distribucion de funcionalidad de IA en apps sin coste de servidor: al ser un modelo de 1,74 GB con licencia Apache-2.0, puede incluirse en el binario o descargarse en el primer arranque de una aplicacion comercial sin obligaciones de atribucion mas alla de las de Apache-2.0.
- Evaluacion de cuantizacion en producto: los registros de `verification/` permiten a un equipo comparar su propio conjunto de pruebas contra las cifras publicadas y decidir si int8 es suficiente o necesita el export sin cuantizar.

## Benchmarks y rendimiento

| Evaluacion | Variante | Resultado | Referencia sin cuantizar | Tamano de muestra | Dispositivo y SO |
|---|---|---|---|---|---|
| `gsm8k-test-100` (GPU) | `macos-any-gpu` | 78,0% | 73,0% | 100 items | Mac17,6, macOS 26A428 |
| `copy-fidelity-v1` (cpuOnly) | `macos-any-gpu` | 100,0% | 100,0% | 50 items | Mac17,6, macOS 26A428 |
| Fixture T2 interno (target) | `ios-any-gpu` | 18/19 estricto | 19/19 estricto | fixture `13a4fa523908f7c0` | iPhone18,2, iOS 24A437 |
| Fixture T2 interno (target) | `ios-h18p-gpu` | 18/19 estricto | 19/19 estricto | fixture `13a4fa523908f7c0` | iPhone18,2, iOS 24A437 |
| Fixture T2 interno (cpuOnly) | `macos-any-gpu` | 18/19 estricto | 19/19 estricto | fixture `13a4fa523908f7c0` | Mac17,6, macOS 26A428 |
| Fixture T2 interno (GPU) | referencia sin cuantizar, no publicada | 19/19 estricto | No aplica | fixture `13a4fa523908f7c0` | Mac17,6 / iPhone18,2 |

Observaciones: la diferencia de 1 punto en el fixture T2 interno (18/19 frente a 19/19) es el unico coste medido de la cuantizacion int8 en la informacion publicada. El resultado de GSM8K de la variante cuantizada supera al de la referencia, pero con solo 100 items esa diferencia de 5 puntos entra dentro del ruido estadistico y no debe interpretarse como una mejora real. No se han publicado resultados de benchmarks externos adicionales (MMLU, HumanEval, MATH u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en terminos de VRAM de GPU dedicada. El paquete esta dirigido exclusivamente a plataformas Apple, por lo que la magnitud relevante es el espacio de almacenamiento y memoria unificada: 1,74 GB de descarga por variante y un repo completo de 5,2 GB.
- GPU recomendadas: no se indican modelos concretos. El autor declara compatibilidad con "cualquier GPU" en macOS e iOS, con especializacion automatica en la primera carga para `macos-any-gpu` e `ios-any-gpu`.
- Compatibilidad con hardware de consumo: si, es su objetivo. Se ha verificado en iPhone18,2 (iOS, build 24A437) y en Mac17,6 (macOS, build 26A428), ademas de una ejecucion `cpuOnly` sobre macOS.
- Opciones de despliegue: SDK Aether con la herramienta Aether forge y el runtime Core AI. La ejecucion se realiza con `aether run qwen3-1.7b --prompt "..."` o mediante la API Swift (`import Aether`, `aether.chat(...)`). No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni otros runners, dado que el formato de pesos es propietario (`.aimodel`).
- Latencia y throughput: no disponibles en la informacion proporcionada. Los registros de verificacion solo incluyen resultados de calidad, no medidas de velocidad.

## Comparativa con modelos similares

Los datos de contexto, licencia y disponibilidad de los modelos alternativos proceden de su documentacion publica y no forman parte de la informacion proporcionada por el autor de este repositorio; se incluyen como orientacion y deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Formato y despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aether-models/qwen3-1.7b | No disponible (base Qwen3-1.7B) | No disponible | Core AI (`.aimodel`), 1,74 GB por variante; solo SDK Aether en iOS/macOS | Apache-2.0 | Publicado, 0 descargas y 0 me gusta en el momento de la consulta |
| Qwen/Qwen3-1.7B (original) | 1,7 mil millones (denso) | 32.768 tokens nativos, ampliables a 131.072 con YaRN | PyTorch/safetensors y cuantizaciones GGUF; vLLM, llama.cpp, Ollama | Apache-2.0 | Ampliamente disponible |
| Llama-3.2-1B-Instruct | 1,24 mil millones (denso) | 128.000 tokens | safetensors, GGUF; llama.cpp, Ollama, vLLM | Licencia comunitaria de Llama 3.2 | Ampliamente disponible |
| Gemma-3-1B-IT | 1.000 millones (denso) | 32.000 tokens | safetensors, GGUF; llama.cpp, Ollama, vLLM | Terminos de uso de Gemma | Ampliamente disponible |

La diferencia clave del paquete de aether-models no es de rendimiento sino de encaje: solo se ejecuta sobre el SDK Aether en plataformas Apple. Frente a las alternativas, ofrece un artefacto ya cuantizado y verificado por variante de dispositivo, pero pierde portabilidad a Linux, CUDA y a todo el ecosistema de runners.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada. Al heredar los pesos de Qwen3-1.7B, arrastra los sesgos del modelo base, que no se han reevaluado en este empaquetado.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasa de alucinacion. El fixture interno T2 exige 19 comprobaciones estrictas y la variante cuantizada solo supera 18, lo que indica una degradacion medible, aunque sea minima en esa prueba.
- Limitaciones de contexto e idioma: no disponibles. Los tags del repositorio no incluyen lista de idiomas y no se declara longitud de contexto.
- Cuantizacion irreversible: los pesos publicados son int8 lineal por canal y el export sin cuantizar no se distribuye. Quien necesite precision completa tendra que partir del modelo base y repetir la conversion.
- Dependencia de plataforma: el formato `.aimodel` y el SDK Aether atan el modelo a iOS y macOS 27 o superior. No hay ruta documentada a CUDA, Linux ni a runtimes estandar.
- Primera carga: las variantes `macos-any-gpu` e `ios-any-gpu` requieren una especializacion en el primer uso, lo que implica un coste de arranque no cuantificado. La variante `ios-h18p-gpu` evita ese paso pero solo para el objetivo h18p.
- Estado del repositorio: 0 descargas y 0 me gusta en el momento de la consulta, sin historial de uso de terceros que permita validar el comportamiento en produccion.
- Muestra de evaluacion reducida: GSM8K se midio sobre 100 items y `copy-fidelity-v1` sobre 50, tamanos que no permiten conclusiones firmes sobre calidad general.
- Licencia: Apache-2.0 permite uso comercial sin restricciones adicionales, siempre que se conserve el aviso de licencia y el fichero `LICENSE` incluido; hay que verificar la atribucion al modelo base Qwen3.
- Fecha de publicacion inusual: el repositorio figura como creado el 23 de septiembre de 2026, dato que conviene contrastar.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/aether-models/qwen3-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio no encontrado en la busqueda web. Las consultas realizadas devolvieron unicamente resultados no relacionados con el modelo: articulos sobre el eter como elemento clasico y como figura de la mitologia griega, un mod de Minecraft llamado The Aether y un cliente de Skyblock. No se localizaron paper, blog tecnico, repositorio de codigo ni demo asociados a aether-models, al SDK Aether o al formato Core AI.
