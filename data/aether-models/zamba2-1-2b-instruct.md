# aether-models/zamba2-1.2b-instruct

## Resumen

El modelo `aether-models/zamba2-1.2b-instruct` es un paquete (bundle) del modelo `Zyphra/Zamba2-1.2B-Instruct-v2` convertido al formato Core AI (`.aimodel`) por Aether forge bajo la receta `zamba2-1.2b-instruct@1`, para su uso con el SDK Aether en iOS y macOS 27 o superiores. No es un entrenamiento nuevo: es una redistribucion optimizada del modelo original de Zyphra, con pesos cuantizados a int8 (linear, por bloques de 32) y el tokenizador original del autor. La fuente se fija en la revision `960222dd212c071e2b7e3734573ee5297b1c075d`.

El modelo base, Zamba2-1.2B-Instruct-v2, pertenece a la familia Zamba2 de Zyphra y cuenta con 1.200 millones de parametros y una ventana de contexto de 4.096 tokens. Su proposito es ofrecer generacion de texto e instrucciones con buen rendimiento para su tamano, pensado para entornos con recursos limitados, como dispositivos moviles o edge computing. La relevancia de este bundle concreto radica en que permite ejecutar el modelo de forma nativa sobre el hardware de Apple (GPU unificada) sin necesidad de infraestructura CUDA.

La licencia declarada es Apache-2.0. El bundle incluye una copia canonica del texto de la licencia (extraida de apache.org), ya que el modelo de origen declara Apache-2.0 en su model card pero no adjunta fichero de licencia. En el momento de la publicacion, el repositorio no registra descargas ni "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida SSM-transformer (familia Zamba2, con bloques Mamba2 y atencion global compartida) |
| Parametros totales | 1.200 millones (1,2B) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | int8-linear-perblock32 (pesos de 8 bits); referencia sin cuantizar no publicada |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Core AI (`.aimodel`), procedente de la exportacion PyTorch del modelo base |
| Modelo base | Zyphra/Zamba2-1.2B-Instruct-v2 (revision 960222dd212c071e2b7e3734573ee5297b1c075d) |
| Desarrollador del bundle | aether-models (Aether forge) |
| Variantes | `macos-any-gpu` y `ios-any-gpu` |
| Tamano del fichero | 1,29 GB (`zamba2_1_2b_instruct.aimodel`); descarga 1,3 GB |
| Fecha de creacion | 2026-10-01 |

## Arquitectura y entrenamiento

El bundle conserva la arquitectura del modelo original Zamba2, una propuesta hibrida que combina bloques de space-state model (SSM, en la linea de Mamba2) con bloques de atencion global compartida. Esta mezcla busca reducir el coste computacional y de memoria frente a un transformer denso equivalente, manteniendo la calidad de generacion. El bundle no modifica la arquitectura: unicamente convierte los pesos de PyTorch a Core AI y los cuantiza a int8 (linear, por bloques de 32) para optimizar la inferencia en el hardware de Apple.

No se dispone, en la informacion proporcionada, de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base empleo tecnicas de alineacion como RLHF o DPO; estos datos corresponden a la model card de Zyphra y no se reproducen aqui. La innovacion tecnica destacable de este repositorio es de despliegue, no de entrenamiento: la exportacion a `.aimodel` con cuantizacion int8 y su validacion mediante un conjunto de pruebas por niveles (T0 a T3) que comparan los resultados cuantizados con la referencia sin cuantizar sobre fixtures fijos.

## Capacidades

- Generacion de texto e instrucciones (pipeline `text-generation`).
- Conversacion multi-turno ("chat") con rendimiento destacado para su tamano segun la model card del autor original.
- Razonamiento de tipo matematico basico (la verificacion T3 ejecuta el conjunto `gsm8k-test-500`).
- Ejecucion nativa en Apple Silicon mediante el SDK Aether (iOS y macOS 27+).
- Integracion mediante CLI (`aether run`) y API Swift (`Aether` / `chat.respond(to:)`).
- No se documenta soporte de tool calling, function calling, capacidades de agente, vision, audio ni modo "thinking" en la informacion disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistentes conversacionales en aplicaciones iOS: el modelo puede gestionar dialogos multi-turno con una ventana de 4.096 tokens, suficiente para conversaciones de asistencia ligera, aprovechando el formato `.aimodel` para ejecutarse en la GPU del dispositivo.
- Procesamiento de lenguaje en el propio dispositivo (on-device): clasificacion de texto, resumen de notas o correccion de redaccion sin enviar datos a la nube, con implicaciones de privacidad y latencia.
- Generacion de texto en macOS: integracion en herramientas de escritorio (editores, terminales, apps de productividad) mediante el SDK Aether y la API Swift.
- Prototipado rapido de funcionalidades de IA en apps: la llamada `aether run zamba2-1.2b-instruct --prompt "Hello"` permite validar prompts y flujos antes de integrarlos en produccion.
- Tareas de razonamiento ligero y aritmetica: util para asistentes que resuelven problemas sencillos paso a paso, con la advertencia de las limitaciones de un modelo de 1,2B en GSM8K.
- Experimentacion e investigacion en modelos hibridos SSM-transformer: sirve como referencia para medir el comportamiento de una arquitectura Zamba2 cuantizada en hardware Apple frente a la version sin cuantizar.
- Fine-tuning o adaptacion ligera sobre el modelo base PyTorch (no sobre el `.aimodel`), reutilizando la licencia Apache-2.0 para derivados.

## Benchmarks y rendimiento

Los datos disponibles provienen de la verificacion del bundle y de fuentes secundarias. No se han publicado resultados completos de benchmarks en la informacion proporcionada para el bundle; los siguientes valores deben interpretarse con cautela.

| Prueba | Resultado | Contexto |
|---|---|---|
| MMLU | 55 | Fuente secundaria (openmodelmap), referida a Zamba2 1.2B Instruct |
| GSM8K (`gsm8k-test-500`) | 40,4 % (cuantizado) frente a 40,4 % (referencia) | Verificacion T3, 500 items, macOS (Mac17,6) |
| Copy-fidelity-v1 | 80,0 % (cuantizado) frente a 80,0 % (referencia) | Verificacion T3, 50 items, macOS e iOS |
| Verificacion estricta T2 | 20/20 estricto | Perfil cuantizado-8bit, fixture `adbdef8a32ca3c1b` |

La coincidencia exacta entre los resultados cuantizados y la referencia sin cuantizar (GSM8K y copy-fidelity) sugiere que la cuantizacion int8 no degrada estas tareas en las pruebas realizadas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB solo para los pesos en int8, mas el cache de KV para 4.096 tokens; en la practica, margen de 2 GB o mas en memoria unificada.
- El modelo esta disenado para hardware Apple con GPU unificada (Apple Silicon). La verificacion se realizo en un `iPhone18,2` (iOS 24A446) y un `Mac17,6` (macOS 26A434).
- No se especifican GPUs NVIDIA (A100, H100, RTX 4090) ni compatibilidad CUDA; el formato `.aimodel` no esta pensado para esos entornos.
- Opciones de despliegue: SDK Aether (CLI `aether run` y API Swift). No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no consumen el formato Core AI.
- La compilacion del modelo es "specialized on first load", por lo que la primera carga puede implicar una especializacion del grafo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| aether-models/zamba2-1.2b-instruct (este) | 1,2B | 4.096 tokens | Core AI (`.aimodel`), int8 | Apache-2.0 | Bundle optimizado para Apple; MMLU 55 (fuente secundaria) |
| Zyphra/Zamba2-1.2B-Instruct-v2 (base) | 1,2B | 4.096 tokens | PyTorch / safetensors | Apache-2.0 | Modelo de origen; referencia sin cuantizar (no publicada) |
| Zyphra/Zamba2-1.2B-instruct (v1) | 1,2B | 4.096 tokens | PyTorch / safetensors | Apache-2.0 | Version anterior en la familia Zamba2 |
| Otros modelos de ~1B de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base Zyphra, no documentados aqui.
- Riesgo de alucinacion: presente, como en cualquier modelo generativo de este tamano; no hay evaluacion especifica de fidelidad factual mas alla de la prueba copy-fidelity.
- Limitacion de contexto: la ventana de 4.096 tokens es reducida para tareas que requieran documentos largos o historiales extensos.
- Limitacion de idioma: el soporte multilingue no esta declarado; no hay garantias de calidad fuera del ingles.
- Restricciones de licencia: Apache-2.0 permite uso comercial; el bundle incluye la copia canonica de la licencia porque el modelo de origen no adjuntaba fichero.
- Caveat de despliegue: el formato `.aimodel` esta atado a iOS y macOS 27+ y al SDK Aether; no es portable a otros stacks de inferencia.
- Rendimiento limitado en tareas exigentes: un modelo de 1,2B no es adecuado para razonamiento complejo, generacion de codigo avanzada ni agentes multi-paso.
- La especializacion "on first load" puede anadir latencia en el primer arranque.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la publicacion.

## Enlaces

- HuggingFace (bundle): https://huggingface.co/aether-models/zamba2-1.2b-instruct
- Modelo base: https://huggingface.co/Zyphra/Zamba2-1.2B-Instruct-v2
- Version anterior del base: https://huggingface.co/Zyphra/Zamba2-1.2B-instruct
- Benchmarks y guia de despliegue (openmodelmap): https://openmodelmap.com/model/Zyphra/Zamba2-1.2B-instruct
- Inferix: https://inferix.co/models/Zyphra/Zamba2-1.2B-instruct
- LLM Reference: https://www.llmreference.com/model/zamba2-1.2b-instruct
