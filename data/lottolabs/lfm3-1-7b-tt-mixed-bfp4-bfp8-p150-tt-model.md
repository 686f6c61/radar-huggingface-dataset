# Lottolabs/LFM3-1.7B-TT-Mixed-BFP4-BFP8-P150-tt-model

## Resumen

LFM3-1.7B-TT-Mixed-BFP4-BFP8-P150-tt-model es un paquete de despliegue publicado por Lottolabs que adapta el modelo LiquidAI/LFM3-1.7B para ejecutarse sobre una tarjeta Tenstorrent Blackhole p150. No es un modelo nuevo: es una redistribucion cuantizada y empaquetada del modelo base de Liquid AI, con los pesos de las capas MLP cuantizados a BFP4/BFP8 mediante GPTQ y el resto de capas lineales redondeadas a BFP8, ademas de un block drafter entrenado por Lottolabs para decodificacion especulativa.

El modelo subyacente, LFM3-1.7B, es un hibrido de 1.700 millones de parametros con 13 capas de convolucion corta con compuerta, 6 capas de atencion completa y 5 capas de atencion con ventana deslizante, con MLP densos SwiGLU. La ventana de contexto alcanza los 131.072 tokens por secuencia, lo que resulta notable para su tamano. El paquete se sirve mediante vLLM con una API compatible con OpenAI sobre un runtime tt-metal personalizado, con kernels fusionados de prefill y decode, muestreo exacto en dispositivo y decodificacion especulativa por prompt-lookup y block drafter en rondas de verificacion compartidas.

Su relevancia es acotada pero especifica: demuestra la viabilidad de servir un modelo hibrido de 1,7B con contexto de 128K en aceleradores Tenstorrent, con soporte para hasta 16 usuarios concurrentes y perfiles de despliegue predefinidos. Es un paquete de comunidad, no una release oficial de Liquid AI ni de Tenstorrent, y esta orientado a entornos con hardware Blackhole p150.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 13 capas de convolucion corta con compuerta, 6 de atencion completa, 5 de atencion con ventana deslizante; MLP densos SwiGLU |
| Parametros totales | 1,7 mil millones (modelo base LFM3-1.7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens por secuencia |
| Tipos de cuantizacion | BFP4 y BFP8 (MLP con GPTQ a BFP4/BFP8, resto de lineales a BFP8) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | Pesos empaquetados para runtime tt-metal; repo de 1,2 GB con `checkpoint/` y `drafter/` (aproximadamente 2,4 GB en cache de HF) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura hibrida que combina capas de convolucion corta con compuerta (13), capas de atencion completa (6) y capas de atencion con ventana deslizante (5), con MLP densos SwiGLU. Esta mezcla busca reducir el coste computacional de la atencion manteniendo capacidad de modelado de largo alcance, lo que permite sostener una ventana de 131.072 tokens con solo 1,7B de parametros.

Sobre esa base, Lottolabs aplica una cuantizacion GPTQ de los pesos MLP a BFP4/BFP8 y redondea el resto de capas lineales a BFP8, formato nativo del hardware Tenstorrent Blackhole. Ademas entrena un block drafter para decodificacion especulativa. El paquete incluye kernels trazados y fusionados de decode y prefill, muestreo exacto en dispositivo, cache de prefijos exacta y verificacion compartida de especulacion para hasta 16 usuarios concurrentes. Segun la model card, la calidad se evalua con teacher forcing frente al modelo BF16 original sobre 57.876 tokens puntuados (chat, instruct, codigo y libros), con una perplejidad de corpus que pasa de 5,4326 a 5,4625, es decir, un incremento del 0,55 por ciento. No se detallan en la informacion disponible los datos de entrenamiento del modelo base ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y de instrucciones en modo texto.
- Razonamiento con modo de pensamiento (thinking) activado por defecto, con salida separada en el campo `reasoning`.
- Tool calling con parser dedicado (`lfm3`) en formato XML, devolviendo `tool_calls` y `finish_reason: tool_calls`.
- Flujos agenticos de multiples pasos, con perfil `agentic` que desactiva el thinking por defecto y aplica un preset de muestreo especifico (T 0,6, top-p 0,95).
- Codigo y generacion asistida en entornos de desarrollo, segun el uso previsto declarado.
- Servicio concurrente de hasta 16 usuarios con contexto completo de 131.072 tokens cada uno (perfil `batch16`).
- Cache de prefijos exacta para reutilizacion de contexto en conversaciones largas.
- No se documentan capacidades de vision ni de audio; el servicio es solo texto.

## Casos de uso

- Chat de atencion al cliente con contexto largo: el modelo puede mantener conversaciones multi-turno con historiales extensos gracias a la ventana de 131.072 tokens y a la cache de prefijos exacta, que evita reprocesar el contexto previo en cada turno.
- Asistente de codigo en IDE o pipeline de CI/CD: el soporte de tool calling con parser `lfm3` permite integrar el modelo en flujos que invocan herramientas externas (ejecucion de tests, consulta de repositorios) y devolver resultados estructurados.
- Agentes autonomos de multiples pasos: el perfil `agentic` con thinking desactivado y muestreo a temperatura 0,6 esta pensado para harnesses de agentes que encadenan llamadas a herramientas y requieren respuestas mas deterministas.
- Procesamiento de documentos largos en un solo paso: con 128K de contexto se pueden resumir, extraer datos o responder preguntas sobre contratos, informes o expedientes completos sin troceado.
- Despliegue en infraestructura Tenstorrent: organizaciones con tarjetas Blackhole p150 pueden servir un modelo de 1,7B con API compatible con OpenAI sin depender de GPUs NVIDIA, usando los perfiles `single`, `batch4` o `batch16` segun la carga.
- Evaluacion e investigacion de decodificacion especulativa: el paquete incluye prompt-lookup y block drafter con verificacion compartida, lo que permite medir el impacto de la especulacion en latencia y throughput sin alterar la salida (la model card afirma que la especulacion nunca cambia el resultado).
- Prototipado de asistentes con razonamiento explicito: la separacion entre `reasoning` y `content` facilita construir interfaces que muestran u ocultan la cadena de pensamiento segun el caso, activando o desactivando `enable_thinking` por peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica de calidad reportada es la evaluacion con teacher forcing frente al modelo BF16 original:

| Metrica | Modelo BF16 original | Paquete cuantizado | Variacion |
|---|---|---|---|
| Perplejidad de corpus (57.876 tokens: chat, instruct, codigo, libros) | 5,4326 | 5,4625 | +0,55 % |

## Requisitos de hardware

- Hardware obligatorio: una tarjeta Tenstorrent Blackhole p150. No hay soporte documentado para GPU NVIDIA, AMD ni CPU.
- Almacenamiento: aproximadamente 2,4 GB en la cache de Hugging Face para `checkpoint/` y `drafter/`, mas varios GB para las caches de kernels y tensores de dispositivo generadas en el primer arranque.
- No cabe en GPU de consumo: el paquete esta ligado al runtime tt-metal y a los formatos BFP4/BFP8 del hardware Tenstorrent.
- Despliegue: mediante `tt serve` (Tenstorrent CLI, `uv tool install tenstorrent`) o `tt-model serve`, que descargan una imagen Docker y arrancan un servidor compatible con OpenAI en el puerto 20000 (o el siguiente libre). Requiere Docker.
- Primer arranque: la compilacion de kernels para el dispositivo tarda varios minutos; los arranques posteriores reutilizan las caches.
- Concurrencia y memoria KV: perfil `single` con 1 secuencia y 131.072 tokens; `batch4` con 4 secuencias y un pool KV de 524.288 tokens; `batch16` con 16 secuencias y un pool KV compartido de 1.572.864 tokens.
- Latencia y throughput: no se han publicado cifras concretas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-TT-Mixed-BFP4-BFP8-P150 (este paquete) | 1,7B | 131.072 | Tenstorrent Blackhole p150 | LFM Open License v1.0 | Hugging Face, paquete de comunidad |
| LiquidAI/LFM3-1.7B (modelo base) | 1,7B | no disponible en la informacion proporcionada | GPU convencional | LFM Open License v1.0 | Hugging Face, release oficial de Liquid AI |
| Otros modelos de ~1,7B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es contra el modelo base: este paquete anade cuantizacion BFP4/BFP8, decodificacion especulativa y empaquetado para p150, con una degradacion de perplejidad del 0,55 por ciento, pero pierde portabilidad al quedar ligado al runtime tt-metal. No se dispone de datos de benchmarks que permitan comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Paquete de comunidad: no es una release oficial de Liquid AI ni de Tenstorrent; el soporte y el mantenimiento dependen de Lottolabs.
- Dependencia total del hardware Tenstorrent Blackhole p150 y del runtime tt-metal; no es desplegable en GPU convencional ni en CPU.
- La cuantizacion BFP4/BFP8 introduce una degradacion medible de calidad (+0,55 por ciento de perplejidad en la evaluacion reportada); no se han publicado evaluaciones en tareas generativas o de razonamiento.
- No se documentan los idiomas soportados; el modelo base esta orientado a texto y su cobertura multilingue no esta verificada en esta ficha.
- Riesgo de alucinacion inherente a un modelo de 1,7B, especialmente en contextos largos y en tareas de razonamiento complejo.
- La licencia LFM Open License v1.0 impone condiciones especificas para uso comercial; es necesario revisar el texto completo antes de desplegar en produccion.
- El primer arranque requiere compilar kernels y puede tardar varios minutos; no es adecuado para entornos efimeros sin cache persistente.
- Los perfiles de servicio fijan el tamano del pool KV; sobrescribir `--max-num-seqs` o `--max-model-len` manualmente puede provocar un comportamiento incorrecto, segun advierte la model card.
- El rendimiento con 16 usuarios concurrentes depende de la verificacion compartida de especulacion; no se han publicado cifras de latencia ni de throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lottolabs/LFM3-1.7B-TT-Mixed-BFP4-BFP8-P150-tt-model
- Pesos de la release: https://huggingface.co/Lottolabs/LFM3-1.7B-TT-Mixed-BFP4-BFP8-P150
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia: https://huggingface.co/Lottolabs/LFM3-1.7B-TT-Mixed-BFP4-BFP8-P150/blob/6219d705f2137e577959f5d27e0045a8548f5a37/LICENSE
- Repositorio de bundles (manifiesto): https://github.com/LottoLottoLotto/tt-model-bundles
- Fork de tt-metal: https://github.com/LottoLottoLotto/tt-metal/tree/lottolabs/lfm3-1.7b-p150
- Fork de vLLM: https://github.com/LottoLottoLotto/vllm/tree/lottolabs/lfm3-1.7b-p150
- Plugins de modelo: https://github.com/LottoLottoLotto/tt-model-plugins/tree/lottolabs/lfm3-1.7b-p150
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Requisitos previos de Tenstorrent CLI: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
