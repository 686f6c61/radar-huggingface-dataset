# aether-models/qwen3-4b-instruct-2507

## Resumen

aether-models/qwen3-4b-instruct-2507 es un paquete de despliegue (bundle) del modelo Qwen/Qwen3-4B-Instruct-2507 convertido al formato Core AI (`.aimodel`) para el SDK Aether en iOS y macOS 27 o superior. No se trata de un entrenamiento nuevo ni de un ajuste fino: el autor declara explicitamente que los unicos cambios respecto al modelo fuente son la conversion de PyTorch a Core AI mediante la receta `qwen3-4b-instruct-2507@1` y la cuantizacion de los pesos a int8 lineal por canal. El tokenizador y la licencia se heredan tal cual del modelo original de Qwen.

El modelo base es un transformer denso de 4.000 millones de parametros de la familia Qwen3, en su variante Instruct de julio de 2025, que elimina el modo de razonamiento (thinking) y mantiene unicamente el entrenamiento de instrucciones. Segun fuentes externas, soporta una ventana de contexto de 262.144 tokens y esta orientado a comprension de lenguaje, generacion, codigo, matematicas y uso de herramientas, con soporte multilingue.

Su relevancia practica esta en el empaquetado: dos variantes (`macos-any-gpu` y `ios-h18p-gpu`) de 4,04 GB cada una que permiten ejecutar un modelo de 4B en GPU de Apple Silicon, incluidos iPhone, con cuantizacion int8 y verificacion reproducible por digest del bundle. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; el modelo base pertenece a la familia Qwen3 (transformer denso, sin modo thinking en esta variante) |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B-Instruct-2507) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens segun fuente externa (SAVRN); no indicado en la model card del bundle |
| Tipos de cuantizacion | int8 lineal por canal (pesos de 8 bits) en el bundle; el modelo fuente se distribuye en precision completa (PyTorch) |
| Idiomas soportados | Multilingue segun la ficha de Qualcomm AI Hub del modelo base; lista concreta de idiomas no disponible |
| Licencia | Apache-2.0 (heredada del modelo fuente, incluida como `LICENSE`) |
| Formato de pesos | Core AI (`.aimodel`); el modelo fuente esta en PyTorch/safetensors |
| Revision del modelo fuente | `cdbee75f17c01a7cc42f958dc650907174af0554` |
| Variantes incluidas | `macos-any-gpu` (macOS, cualquier GPU, sin compilar, especializada en la primera carga), `ios-h18p-gpu` (iOS, SoC h18p, compilada) |
| Tamano por variante | 4,04 GB |
| Tamano total del repositorio | 8,1 GB |
| Compatibilidad | iOS y macOS 27 o superior, mediante el SDK Aether |

## Arquitectura y entrenamiento

El bundle no introduce cambios de arquitectura ni de pesos mas alla de la conversion y la cuantizacion. El autor indica que la receta de conversion toma el modelo fuente en la revision `cdbee75f17c01a7cc42f958dc650907174af0554` y produce pesos int8 lineal por canal, manteniendo los ficheros de tokenizador originales. No se documentan en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base; esos datos corresponden a Qwen y no se reproducen en esta model card.

El elemento tecnico diferencial es el pipeline de verificacion. Cada variante se registra en `verification/` con una huella (bundle digest) que identifica exactamente los bytes evaluados, y se somete a niveles T0, T1 y T2. Las variantes compiladas y cuantizadas superan T2 con 17 de 18 comprobaciones estrictas sobre el fixture `20fd9acbecb58090`, mientras que la exportacion de referencia sin cuantizar (no publicada) alcanza 18 de 18. La variante `macos-any-gpu` no se distribuye compilada: se especializa en la primera carga sobre la GPU del equipo anfitrion. Los dispositivos de referencia declarados son iPhone18,2 con build 24A437 y Mac17,6 con build 26A428.

## Capacidades

- Generacion de texto e instrucciones: es la funcion principal del pipeline declarado (`text-generation`).
- Razonamiento logico, comprension de texto, matematicas y ciencia: capacidades mejoradas respecto a versiones previas de Qwen3-4B segun la documentacion del modelo base.
- Generacion de codigo, asi como uso de herramientas (tool usage) segun la ficha de Qualcomm AI Hub.
- Soporte multilingue, sin listado cerrado de idiomas en la informacion disponible.
- Sin modo thinking: la variante 2507 elimina el razonamiento explicito con tokens de pensamiento, a diferencia de Qwen3-4B base.
- Ejecucion local en dispositivo: inferencia en GPU de Apple Silicon bajo el SDK Aether, sin depender de servicios en la nube.
- Integracion via CLI (`aether run qwen3-4b-instruct-2507 --prompt "..."`) y via API Swift (`Aether()`, `aether.chat(...)`, `chat.respond(to:)`).
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistentes conversacionales integrados en apps iOS: la variante `ios-h18p-gpu` esta compilada y verificada para un SoC concreto, por lo que se puede invocar desde Swift con `aether.chat` y mantener las conversaciones en el dispositivo sin enviar texto del usuario a un servidor.
- Procesamiento de documentos extensos en local: los 262.144 tokens de contexto del modelo base permiten resumir o consultar contratos, informes o expedientes completos dentro de una app de macOS, sin fragmentar el texto en trozos.
- Autocompletado y redaccion asistida en aplicaciones de escritorio: 4B de parametros en int8 ocupan 4,04 GB, un tamano manejable para cargar el modelo en la GPU de un Mac y ofrecer sugerencias con baja dependencia de red.
- Asistencia a desarrollo en entornos aislados: al soportar generacion de codigo y uso de herramientas, puede integrarse en editores o scripts de macOS que operen en maquinas sin acceso a Internet o con requisitos de confidencialidad.
- Traduccion y tratamiento multilingue en el dispositivo: util para apps de mensajeria o correo que necesitan traduccion puntual sin exponer el contenido a terceros.
- Clasificacion y extraccion de informacion en lotes locales: resumen de tickets, etiquetado de correos o extraccion de campos de facturas ejecutados por CLI sobre ficheros del propio equipo.
- Prototipado rapido de funciones de IA generativa: la CLI `aether run` permite validar prompts y respuestas antes de invertir en infraestructura de servidor.
- Automatizaciones por lotes en macOS: al no requerir compilacion previa en la variante `macos-any-gpu`, se puede desplegar en parques de Macs heterogeneos y dejar que la especializacion ocurra en la primera carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del bundle solo incluye resultados de verificacion funcional, no metricas de calidad:

| Prueba | Variante | Resultado | Detalle |
|---|---|---|---|
| T0 | `ios-h18p-gpu` | pass | iPhone18,2, build 24A437 |
| T2 | `ios-h18p-gpu` | pass | 17/18 estrictas; perfil quantized-8bit; fixture `20fd9acbecb58090` |
| T0 | `macos-any-gpu` | pass | Mac17,6, build 26A428 |
| T1 | `macos-any-gpu` | pass | Mac17,6, build 26A428 |
| T2 | `macos-any-gpu` | pass | 17/18 estrictas (repetido en el registro); perfil quantized-8bit; fixture `20fd9acbecb58090` |
| T2 | referencia sin cuantizar (no publicada) | pass | 18/18 estrictas; perfil strict; Mac17,6, build 26A428 |

La diferencia de 17/18 frente a 18/18 es la unica medida de degradacion publicada y corresponde a la comprobacion estricta de la verificacion, no a una evaluacion de calidad de lenguaje.

## Requisitos de hardware

- VRAM/peso en disco: 4,04 GB por variante en int8; el modelo base en 16 bits requiere aproximadamente 9,7 GB de memoria de GPU segun SAVRN.
- macOS: variante `macos-any-gpu`, compatible con cualquier GPU de Apple Silicon bajo macOS 27 o superior; sin compilacion previa, se especializa en la primera carga.
- iOS: variante `ios-h18p-gpu`, compilada y verificada sobre SoC h18p (dispositivo de referencia iPhone18,2).
- GPU de Apple Silicon: es la via de ejecucion soportada por el bundle. No se declara soporte para GPU NVIDIA, AMD ni para ejecucion solo en CPU.
- GPU de consumo: si, el modelo esta pensado para hardware de consumo de Apple. No se documenta compatibilidad con RTX 4090 u otras GPU de consumo de PC.
- Opciones de despliegue: SDK Aether (CLI `aether run` y API Swift `Aether`); tambien se puede usar el modelo fuente con vLLM, llama.cpp, Ollama o TGI, pero esas rutas no aplican al bundle `.aimodel`.
- Latencia y throughput: no disponibles. No se publican tiempos por token, tokens por segundo ni cifras de consumo energetico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aether-models/qwen3-4b-instruct-2507 | 4B (int8 en bundle) | 262.144 tokens (fuente externa) | Core AI `.aimodel`, SDK Aether, iOS/macOS 27+ | Apache-2.0 | Repositorio propio, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | 262.144 tokens | PyTorch/safetensors; vLLM, llama.cpp, Ollama, TGI | Apache-2.0 | Modelo oficial, varios millones de descargas mensuales |
| Qwen3-4B base (con modo thinking) | 4B | no disponible | PyTorch/safetensors | Apache-2.0 | Modelo oficial de Qwen |
| Otras conversiones on-device de Qwen3-4B (Core ML, MLX) | 4B | no disponible | Formatos propios de cada runtime | Apache-2.0 (heredada) | No evaluadas en la informacion disponible |

La comparacion relevante es entre el bundle y su modelo fuente: comparten pesos de origen, tokenizador y licencia, y difieren en cuantizacion (int8 frente a precision completa), formato (`.aimodel` frente a safetensors) y plataforma objetivo (Apple Silicon frente a servidores con GPU). No hay datos de rendimiento comparativo entre ambos en la informacion disponible.

## Limitaciones y advertencias

- El bundle no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros), por lo que no se puede cuantificar la degradacion introducida por la cuantizacion int8 mas alla del 17/18 frente a 18/18 en la verificacion estricta.
- La verificacion T2 se realiza contra un fixture concreto (`20fd9acbecb58090`) sobre dispositivos concretos (iPhone18,2, Mac17,6); no garantiza un comportamiento identico en otros modelos de iPhone, iPad o Mac.
- La variante `ios-h18p-gpu` esta compilada para un SoC especifico; en hardware distinto puede no ser utilizable.
- No hay datos sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad en la informacion proporcionada.
- La lista de idiomas soportados no esta detallada; el soporte multilingue se menciona de forma generica en la documentacion del modelo base.
- El bundle no incluye modo thinking, por lo que no sirve para flujos que dependan de cadenas de razonamiento explicitas.
- Requiere iOS o macOS 27 o superior y el SDK Aether; queda fuera de otros sistemas operativos y runtimes.
- Aunque la licencia Apache-2.0 permite uso comercial, el aviso de licencia del modelo fuente debe conservarse; conviene revisar la model card de Qwen para condiciones adicionales de atribucion.
- El repositorio presenta 0 descargas y 0 interacciones, sin historial de uso en produccion que respalde su robustez.
- El autor del bundle es un tercero (`aether-models`), no Qwen; la responsabilidad sobre la conversion y su verificacion recae en el publicador del bundle.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aether-models/qwen3-4b-instruct-2507
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Ficha del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Ficha del modelo base en SAVRN: https://savrn.com/models/qwen3-4b-instruct-2507
- Modelo base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-4B-Instruct-2507
