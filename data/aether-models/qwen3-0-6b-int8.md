# aether-models/qwen3-0.6b-int8

## Resumen

aether-models/qwen3-0.6b-int8 es un paquete de inferencia derivado de Qwen/Qwen3-0.6B, publicado por el usuario aether-models, que convierte los pesos originales en PyTorch a formato Core AI (`.aimodel`) para su uso mediante el SDK Aether en iOS y macOS 27 o superior. No se trata de un modelo entrenado desde cero ni de un ajuste fino: la model card indica explícitamente que es una conversión del checkpoint original de Qwen, en la revisión `c1899de289a04d12100db370d81485cdf75e47ca`, mediante la receta `qwen3-0.6b-int8@1` de la herramienta Aether forge. Los pesos resultantes son int8 linear per-channel (cuantización de 8 bits por canal), y los ficheros del tokenizador se copian sin modificar del modelo fuente.

El interés del paquete es de despliegue, no de investigación: permite ejecutar un modelo de 0,6 mil millones de parámetros íntegramente en el dispositivo (GPU de iPhone y Mac con Apple Silicon) con un activo de 597,5 MB por variante y una descarga de 613,4 MB, lo que lo sitúa en el rango viable para aplicaciones móviles sin conexión. El repositorio incluye tres variantes: `macos-any-gpu`, `ios-any-gpu` (ambas sin compilar, especializadas en la primera carga) e `ios-h18p-gpu`, compilada específicamente para el chip identificado como `h18p`.

La relevancia actual del artefacto radica en el creciente interés por la inferencia local en el ecosistema Apple mediante Core AI, un runtime distinto de Metal Performance Shaders o de soluciones portables como llama.cpp. La contrapartida es que el paquete no aporta benchmarks estándar de calidad (MMLU, HumanEval, GSM8K), no declara idiomas soportados ni longitud de contexto, y cuenta con cero descargas y cero valoraciones en el momento de la consulta. Toda la evidencia de calidad disponible son las verificaciones internas del propio publicador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del modelo base Qwen/Qwen3-0.6B (no se detalla en la model card) |
| Parámetros totales | ~0,6 mil millones (0,6B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (la model card no lo especifica) |
| Tipos de cuantización | int8 linear per-channel (pesos de 8 bits); una única variante cuantizada, sin otras precisiones publicadas |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Core AI: `.aimodel` (sin compilar) y `.aimodelc` (compilada para `h18p`); no incluye safetensors ni GGUF |
| Modelo base | Qwen/Qwen3-0.6B, revisión `c1899de289a04d12100db370d81485cdf75e47ca` |
| Variantes publicadas | `macos-any-gpu`, `ios-any-gpu`, `ios-h18p-gpu` |
| Tamaño del activo | 597,5 MB por variante (descarga de 613,4 MB) |
| Tamaño del repositorio | 1,2 GB |
| Plataformas | iOS y macOS 27 o superior |
| SDK | Aether (CLI `aether` y biblioteca Swift `Aether`) |
| Pipeline | text-generation |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no documenta ningún proceso de entrenamiento propio. Según la model card, el trabajo realizado consiste en la conversión del checkpoint de Qwen/Qwen3-0.6B desde PyTorch al formato Core AI, con cuantización de pesos a int8 linear per-channel (8 bits) y reutilización literal de los ficheros de tokenizador del modelo fuente. No se menciona ningún ajuste fino, destilación, RLHF, DPO ni modificación del dataset original; la arquitectura subyacente es, por tanto, la del modelo base de Qwen, cuyos detalles concretos (número de capas, dimensiones, tipo de atención, datos de entrenamiento y número de tokens) no se reproducen en la información disponible y no deben darse por supuestos a partir de este paquete.

La innovación técnica destacable es de índole de despliegue: el uso del runtime Core AI de Apple y un esquema de verificación por niveles (T0 a T3) que acredita el comportamiento del binario exacto mediante un digest del bundle. El nivel T0 comprueba la carga y ejecución básica; T1 se aplica solo en macOS; T2 evalúa el perfil de cuantización con 19 comprobaciones estrictas sobre el fixture `cc6fd71af4ed3af5`; y T3 mide fidelidad de copia (`copy-fidelity-v1`) sobre 50 elementos contra una exportación de referencia sin cuantizar. Esta metodología, poco habitual en modelos pequeños de la comunidad, es el principal activo documental del repositorio.

## Capacidades

- Generación de texto autoregresiva, tarea declarada en el pipeline del repositorio (`text-generation`).
- Conversación multi-turno a través de la interfaz de chat del SDK (`aether.chat(...)` seguido de `respond(to:)`).
- Ejecución íntegra en el dispositivo sobre GPU de iPhone y Mac, sin dependencia de servicio remoto.
- Variante compilada para el chip `h18p`, que evita la especialización en la primera carga en dispositivos compatibles.
- Fidelidad de copia verificada al 100 % frente a la referencia sin cuantizar en la prueba T3 (50 elementos).
- Inferencia desde línea de comandos mediante `aether run qwen3-0.6b-int8 --prompt "Hello"`.
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio o modo de pensamiento: no disponibles en la información proporcionada.
- Soporte multilingüe: no disponible (el repositorio no declara idiomas).

## Casos de uso

- Asistentes conversacionales sin conexión en aplicaciones iOS: el SDK expone un objeto de chat con `respond(to:)`, de modo que una app puede mantener diálogos multi-turno en local sin enviar el texto del usuario a un servidor.
- Procesamiento de texto con requisitos de privacidad: al ejecutarse en Core AI sobre el dispositivo, los datos no abandonan el terminal, lo que encaja en escenarios sanitarios, legales o empresariales con restricciones de tratamiento de datos.
- Reescritura y autocompletado en apps de notas o correo: un modelo de 0,6B con 597,5 MB de activo es adecuado para sugerencias de frase corta donde prima la latencia y el consumo de memoria sobre la calidad máxima.
- Extracción y clasificación de texto en local: normalización de campos, etiquetado de fragmentos o resumen de una o dos frases dentro de una app de macOS, usando la variante `macos-any-gpu`.
- Preprocesado en pipelines híbridos: filtrar, resumir o reformatear entradas en el Mac antes de enviar solo el resultado a un modelo mayor alojado en servidor, reduciendo coste de tokens y exposición de datos.
- Prototipado rápido de interfaces de IA en Swift: el fragmento de código de la model card (`try Aether()`, `aether.chat(...)`) permite integrar una demo funcional en un proyecto Xcode sin infraestructura adicional.
- Generación de texto en aplicaciones interactivas o videojuegos: al no requerir red, el modelo puede producir descripciones, diálogos o textos procedimentales sin interrupciones por latencia de red.
- Despliegue en parques de dispositivos homogéneos: la variante `ios-h18p-gpu` compilada permite distribuir un binario ya especializado cuando el hardware objetivo está acotado, evitando el coste de especialización en la primera carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente aporta verificaciones internas de ejecución y fidelidad, que se reproducen a continuación tal como aparecen:

| Variante | Nivel | Resultado | Detalle | Dispositivo | Build de SO | Registro |
|---|---|---|---|---|---|---|
| `ios-any-gpu` | T0 | pass | — | iPhone18,2 | 24A446 | `6f934189` |
| `ios-any-gpu` | T2 | pass | 19/19 estricto; perfil quantized-8bit; fixture `cc6fd71af4ed3af5` | iPhone18,2 | 24A446 | `c8d2ae39` |
| `ios-any-gpu` | T3 | pass | `copy-fidelity-v1`; 100,0 % frente a referencia 100,0 %; 50 elementos | iPhone18,2 | 24A446 | `3ec55862` |
| `ios-h18p-gpu` | T0 | pass | — | iPhone18,2 | 24A446 | `1858b220` |
| `ios-h18p-gpu` | T2 | pass | 19/19 estricto; perfil quantized-8bit; fixture `cc6fd71af4ed3af5` | iPhone18,2 | 24A446 | `42f46a81` |
| `ios-h18p-gpu` | T3 | pass | `copy-fidelity-v1`; 100,0 % frente a referencia 100,0 %; 50 elementos | iPhone18,2 | 24A446 | `b313af26` |
| `macos-any-gpu` | T0 | pass | — | Mac17,6 | 26A434 | `a268e4d2` |
| `macos-any-gpu` | T1 | pass | — | Mac17,6 | 26A434 | `fb8d5aab` |
| `macos-any-gpu` | T2 | pass | 18/19 estricto; 19/19 estricto; perfil quantized-8bit; budgeted: think-multiply; fixture `cc6fd71af4ed3af5` | Mac17,6 | 26A434 | `cec042a2` |
| `macos-any-gpu` | T3 | pass | `copy-fidelity-v1`; 100,0 % frente a referencia 100,0 %; 50 elementos | Mac17,6 | 26A434 | `c965a95c` |
| Referencia sin cuantizar (no publicada) | T2 | pass | 19/19 estricto; 19/19 estricto; perfil strict; fixture `cc6fd71af4ed3af5` | Mac17,6 | 26A434 | `e73cf364` |

Nota: la fila de `macos-any-gpu` en T2 registra 18/19 en la primera métrica y 19/19 en la segunda, con la anotación `budgeted: think-multiply`; la model card califica el resultado global como `pass`. Estas cifras miden conformidad de ejecución, no calidad lingüística ni de razonamiento.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 597,5 MB solo para el activo del modelo, más el overhead del runtime Core AI y de la memoria del tokenizador y del contexto; la cifra total no está documentada.
- GPU compatibles: exclusivamente GPU de dispositivos Apple. No hay soporte declarado para NVIDIA, AMD ni CPU genérica.
- Dispositivos verificados: iPhone18,2 con build 24A446 y Mac17,6 con build 26A434, ambos con compute en target GPU.
- Encaje en hardware de consumo: sí, en iPhone y Mac con Apple Silicon compatibles con iOS o macOS 27 o superior; es un modelo de 0,6B en int8, por lo que el requisito de memoria es bajo.
- Variante específica `ios-h18p-gpu`: requiere el chip identificado como `h18p`; el resto de dispositivos iOS deben usar `ios-any-gpu`.
- Opciones de despliegue: SDK Aether y CLI `aether` (`aether run qwen3-0.6b-int8 --prompt "Hello"`), o la biblioteca Swift `Aether` dentro de una app. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no publicarse pesos en safetensors ni GGUF.
- Latencia y throughput: no disponibles. No se publican tokens por segundo, tiempo hasta el primer token ni consumo energético.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Plataformas | Distribución |
|---|---|---|---|---|---|---|
| aether-models/qwen3-0.6b-int8 | ~0,6B | No disponible | Core AI (`.aimodel`, `.aimodelc`) int8 per-channel | Apache-2.0 | iOS y macOS 27+ | 0 descargas, 0 valoraciones |
| Qwen/Qwen3-0.6B (original) | ~0,6B | No disponible en la información proporcionada | PyTorch / safetensors | Apache-2.0 | Multiplataforma según runtime | No consultado en esta búsqueda |
| Cuantizaciones GGUF de Qwen3-0.6B (comunidad) | ~0,6B | No disponible en la información proporcionada | GGUF | Apache-2.0 (heredada del base) | llama.cpp, Ollama y derivados | No consultado en esta búsqueda |

La comparación relevante es de formato y plataforma más que de capacidad: el paquete de aether-models es funcionalmente equivalente al modelo base en cuanto a pesos de partida, pero solo es ejecutable en el ecosistema Core AI de Apple. Frente a una cuantización GGUF, ofrece verificación formal por niveles y una variante precompilada por chip, a cambio de perder portabilidad y de no publicar métricas de calidad. No se dispone de datos que permitan comparar rendimiento en tareas entre estas alternativas.

## Limitaciones y advertencias

- No se publican benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes): la única evidencia son pruebas de conformidad de ejecución y de fidelidad de copia frente a la referencia.
- Repositorio sin tracción: 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no existe validación externa independiente del publicador.
- Sesgos conocidos: no disponibles. Al derivar de Qwen3-0.6B, hereda las características del dataset del modelo base, que no se documenta en esta ficha.
- Riesgo de alucinación: no cuantificado en la información disponible; un modelo de 0,6B sin métricas publicadas debe tratarse con cautela en tareas donde la veracidad sea crítica.
- Idiomas y contexto: no declarados. Se desconoce si hay idiomas no soportados y cuál es la ventana de contexto efectiva de este bundle, lo que impide dimensionar aplicaciones con entradas largas.
- Compatibilidad restringida: solo iOS y macOS 27 o superior con GPU Apple. No hay ruta de despliegue en servidor, Linux, Windows, Android ni aceleradores NVIDIA o AMD.
- Formato propietario: los pesos no se distribuyen en safetensors ni GGUF, lo que impide auditar o reutilizar la cuantización fuera del runtime Aether y dificulta la reproducibilidad por terceros.
- Degradación por cuantización: los pesos son int8 linear per-channel; la fidelidad de copia medida es del 100 % en la prueba T3, pero esta prueba no evalúa la calidad generativa, de modo que la pérdida real respecto a la referencia sin cuantizar no está cuantificada.
- Licencia: Apache-2.0, permisiva para uso comercial, pero conviene conservar el fichero `LICENSE` incluido y verificar las condiciones del modelo base Qwen/Qwen3-0.6B en su propio repositorio.
- Mantenimiento incierto: la fecha de creación y de última actualización declaradas son idénticas (2026-10-06), sin historial posterior de revisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aether-models/qwen3-0.6b-int8
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Revisión concreta del modelo base usada en la conversión: `c1899de289a04d12100db370d81485cdf75e47ca`
- Repositorio del modelo base en GitHub (organización Qwen): no disponible en la información proporcionada
- Documentación del SDK Aether, receta `qwen3-0.6b-int8@1` y especificación de los niveles de verificación T0-T3: no disponible en la información proporcionada
- Papers: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
- Resultados de la búsqueda web: las consultas realizadas devolvieron únicamente páginas sobre el concepto mitológico y filosófico del éter (Wikipedia, Larousse, un mod de Minecraft y una revista independiente), sin relación con este modelo. No se han encontrado enlaces técnicos relevantes.
