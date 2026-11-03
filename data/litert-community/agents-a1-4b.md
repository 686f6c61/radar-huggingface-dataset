# litert-community/Agents-A1-4B

## Resumen

Agents-A1-4B es un modelo de lenguaje de 4.000 millones de parámetros desarrollado por InternScience y orientado a tareas agénticas: razonamiento multi-paso y uso de herramientas mediante un formato XML nativo. Se construye sobre la arquitectura híbrida de Qwen3.5-4B, que combina 24 capas de atención lineal GatedDeltaNet con 8 capas de atención completa con compuertas, de modo que el consumo de memoria crece muy lentamente con la longitud del contexto. La versión publicada por litert-community es una conversión al formato `.litertlm` para inferencia en dispositivo con el runtime LiteRT-LM de Google.

La relevancia de esta ficha está en el empaquetado: el repositorio contiene únicamente el decodificador de texto (la torre de visión se ha eliminado) en dos recetas de cuantización, int8 dinámica y int4 mixta, pensadas para ejecución en CPU y GPU de dispositivos de borde y equipos de consumo. La model card documenta con un detalle inusual los defectos detectados en versiones previas de los ficheros y las correcciones aplicadas, lo que resulta útil para evaluar la madurez del artefacto antes de desplegarlo.

No se dispone de información sobre idiomas soportados ni de resultados de benchmarks publicados en la información proporcionada. El repositorio tiene 25,9 GB de tamaño total y 479 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas GatedDeltaNet (atención lineal con regla delta compuertada) + 8 capas de atención completa con compuertas; basada en Qwen3.5-4B |
| Parámetros totales | 4B (aproximado, según denominación del modelo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Presupuesto de KV cache de 4096 tokens en los bundles LiteRT-LM; longitud máxima nativa no disponible |
| Tipos de cuantización | int8 dinámica (lineales y embedding) y int4 mixta (int4 blockwise-32 min-max en lineales, int8 channelwise en embedding y lm_head) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); requiere litert-lm ≥ 0.15 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida en la que 24 capas de GatedDeltaNet, basadas en atención lineal con regla delta compuertada, se intercalan con 8 capas de atención completa con compuertas. La consecuencia práctica es que solo las 8 capas de atención mantienen KV cache, mientras que las capas lineales operan con estado recurrente de tamaño fijo; por eso la memoria permanece prácticamente plana respecto a la longitud del contexto. En los bundles publicados, el presupuesto de KV cache se fija en 4096 tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO) del modelo base InternScience/Agents-A1-4B. La conversión a LiteRT-LM conserva el modo de pensamiento (thinking) y el formato nativo de llamada a herramientas en XML, y declara activaciones en fp32. Los bundles incorporan el tokenizer propio del repositorio base (con la clase `\p{M}` en el pre-tokenizer, lo que corrige la segmentación de texto con marcas combinantes en hindi, tailandés, tamil y árabe con harakat) y un contenedor en formato 1.7.0 para el fichero int4 mixto.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (thinking) activable y desactivable.
- Llamada a herramientas en formato XML nativo, orientada a flujos agénticos.
- Razonamiento aritmético y matemático básico; la model card documenta pruebas con multiplicaciones y con la operación 17 × 23.
- Capacidad de finalizar respuestas de forma autónoma tras el resultado correcto en las versiones corregidas de los ficheros.
- Soporte multilingüe: no disponible en la información proporcionada, aunque el tokenizer cubre inglés, chino, japonés, coreano, emoji y varios alfabetos no latinos.
- Sin capacidades de visión en estos bundles: la torre de visión se ha eliminado en la conversión.

## Casos de uso

- Agentes locales en dispositivos móviles: el bundle int4 mixto (2,754 GB) cabe en teléfonos de gama alta y permite ejecutar un bucle de razonamiento y llamada a herramientas sin conexión, con memoria estable gracias a las capas GatedDeltaNet.
- Automatización de tareas de escritorio en equipos de consumo: el bundle int8 (4,419 GB) puede ejecutarse en CPU de portátiles recientes, útil para asistentes que consultan APIs locales mediante tool calling en formato XML.
- Enrutamiento y orquestación de herramientas: el modelo puede actuar como planificador que decide qué función invocar en un pipeline de agentes, con el formato XML nativo como contrato de salida.
- Procesamiento por lotes en el borde: al mantener un KV cache acotado a 4096 tokens en 8 capas, es adecuado para servir muchas peticiones cortas en hardware limitado con latencia predecible.
- Prototipado de asistentes conversacionales multi-turno: el modo thinking permite separar el razonamiento intermedio de la respuesta final, lo que facilita la depuración de flujos agénticos.
- Evaluación de runtimes de inferencia: los dos ficheros con recetas de cuantización distintas permiten comparar precisión y comportamiento (por ejemplo, cierre autónomo de respuestas) entre int8 e int4 en el mismo hardware.
- Aplicaciones de cálculo verificable: las pruebas documentadas de multiplicaciones y aritmética con decodificación greedy lo hacen apto para tareas donde se exige que el modelo termine tras emitir el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye únicamente pruebas de corrección cualitativas y de comportamiento, resumidas a continuación.

| Prueba | Fichero | Resultado documentado |
|---|---|---|
| Seis preguntas de multiplicación, thinking off, greedy, CPU Mac M4 Max | int8 previo (2026-10-13) | Producto correcto 18/18; cierre autónomo 4/18 |
| Seis preguntas de multiplicación, thinking off, greedy, CPU Mac M4 Max | int8 corregido | Producto correcto y cierre autónomo 18/18 |
| 17 × 23, thinking off, greedy, CPU | int8 previo / int8 corregido | Cierre autónomo 1/3 / 3/3 |
| 17 × 23, thinking on sin límite | int8 previo / int8 corregido | Pensamiento no cerrado 3/3 / cerrado y respondido 2/3 |
| Seis preguntas de multiplicación, greedy, GPU Mac | int8 previo | Producto correcto y cierre autónomo 6/6 (18–19 caracteres) |
| Ocho preguntas, temperatura 0, GPU Mac | int8 previo | 8/8 |

## Requisitos de hardware

- VRAM/RAM estimada: el bundle int4 mixto ocupa 2,754 GB y el int8 4,419 GB en disco; el espacio de trabajo en memoria debe sumar el estado recurrente de las capas GatedDeltaNet, el KV cache de 4096 tokens en las 8 capas de atención y las activaciones en fp32.
- GPU recomendadas: no se especifican en la información disponible. Las pruebas documentadas se ejecutaron en CPU y GPU de un Mac M4 Max.
- Cabe en GPU de consumo: el tamaño de los ficheros sugiere que sí, aunque no se detallan modelos concretos (RTX 4090, etc.) en la documentación.
- Despliegue: exclusivamente mediante el runtime LiteRT-LM (`litert-lm` ≥ 0.15; probado en 0.17.1, 0.18.0 y nightly 0.18.0.dev20260919). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Las pruebas reportadas usan decodificación greedy (top-k 1) con un límite de 400 tokens y un proceso nuevo por ejecución.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, el propio modelo base InternScience/Agents-A1-4B en formato transformers constituye la alternativa directa, con torre de visión incluida y sin las restricciones de cuantización de LiteRT-LM; sin embargo, no se dispone de sus especificaciones detalladas para establecer una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/Agents-A1-4B (int8) | 4B | 4096 tokens de KV cache | `.litertlm` | Apache 2.0 | HuggingFace |
| litert-community/Agents-A1-4B (int4 mixto) | 4B | 4096 tokens de KV cache | `.litertlm` | Apache 2.0 | HuggingFace |
| InternScience/Agents-A1-4B | 4B | No disponible | Pesos originales | No disponible | HuggingFace |

## Limitaciones y advertencias

- Los bundles no incluyen la torre de visión; cualquier caso de uso multimodal requiere el modelo base original.
- El presupuesto de KV cache está fijado en 4096 tokens en estos ficheros, lo que limita el contexto efectivo aunque la arquitectura híbrida permita contextos mayores en teoría.
- La model card documenta un defecto histórico en el fichero int8 (respuestas que continuaban tras el resultado correcto hasta el límite de tokens, y pensamientos que no se cerraban) presente entre el 21 de septiembre y el 13 de octubre de 2026; debe verificarse el hash sha256 del fichero descargado para asegurar que se usa la versión corregida.
- El comportamiento de cierre autónomo depende del modo de decodificación: el defecto se manifestaba bajo decodificación greedy y no con el muestreador por defecto del bundle (top-k 20, top-p 0,95, temperatura 0,85), lo que implica que las pruebas de aceptación deben fijar explícitamente el sampler.
- La tokenización de texto con marcas combinantes era incorrecta en versiones anteriores a 2026-10-16; los ficheros actuales usan el tokenizer del repositorio base.
- No hay información sobre sesgos, tasa de alucinación ni comportamiento en idiomas distintos del inglés y el chino.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantía alguna por parte de los autores.
- Dependencia estricta del runtime LiteRT-LM; no hay conversiones documentadas a otros formatos de inferencia.
- El repositorio tiene 25,9 GB y solo 2 likes y 479 descargas, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/Agents-A1-4B
- Modelo base: https://huggingface.co/InternScience/Agents-A1-4B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
