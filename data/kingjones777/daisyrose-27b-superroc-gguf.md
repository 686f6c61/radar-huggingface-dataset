# kingjones777/DaisyRose-27B-SuperRoc-GGUF

## Resumen

DaisyRose-27B-SuperRoc-GGUF es una cuantizacion en formato GGUF del modelo RadixArk/DaisyRose-27B, publicada por el usuario kingjones777. Se trata de una variante optimizada especificamente para ROCm-FP4 y para el motor de inferencia local Super Roc sobre hardware Strix Halo (AMD Ryzen AI Max+ 395, arquitectura gfx1151). El modelo base cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones) y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que no es un modelo nuevo entrenado desde cero, sino una compilacion de pesos cuantizados que preserva el bloque MTP (multi-token prediction) del modelo original para habilitar decodificacion especulativa. Esto permite ejecutar un modelo de 27B en un equipo con memoria unificada de 128 GB y obtener velocidades de generacion de entre 24 y 48 tokens por segundo, con una ventana de contexto cargada de 131.072 tokens.

El repositorio tiene un tamano de 15,3 GB e incluye un unico archivo de pesos. La model card reporta una perplejidad de 5,31 sobre un documento tecnico en ingles de 11.000 tokens con contexto de 4096, frente a 5,24 de un Q4_K_M estandar del mismo modelo base, lo que indica una degradacion muy leve por la cuantizacion ROCm-FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; el bloque MTP se conserva para decodificacion especulativa) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (contexto cargado en la medicion reportada) |
| Tipos de cuantizacion | Q4_0 con formato ROCm-FP4 (archivo unico: DaisyRose-27B-MTP-Q4_0-ROCmFP4-FAST-imatrix.gguf) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base RadixArk/DaisyRose-27B en la documentacion proporcionada. La model card de esta cuantizacion no describe la arquitectura subyacente (tipo de transformer, atencion, composicion del dataset de entrenamiento ni si hubo RLHF o DPO). Lo unico confirmado es que el modelo base tiene 27,3 mil millones de parametros y que incorpora un bloque MTP (multi-token prediction), que esta cuantizacion preserva explicitamente para permitir decodificacion especulativa.

La innovacion tecnica destacable de esta publicacion es el formato de cuantizacion ROCm-FP4, desarrollado por el equipo ROCmFPX y construido sobre llama.cpp/ggml. El archivo se genero con imatrix (importance matrix) y se etiqueta como FAST. La cuantizacion Q4_0 en formato ROCm-FP4 mantiene una perplejidad de 5,31 frente a 5,24 del Q4_K_M estandar, una diferencia de 0,07 puntos sobre un documento tecnico en ingles de 11.000 tokens. El motor Super Roc aprovecha el bloque MTP para decodificacion especulativa con `--speculative mtp -d 4 --min-draft-tokens 1`.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline de chat template con `enable_thinking` indican soporte de dialogos multi-turno.
- Modo thinking: se puede activar por peticion mediante `chat_template_kwargs.enable_thinking`; en el comando de ejemplo esta desactivado por defecto.
- Tool calling / function calling: la model card reporta resultados de 7/8 en tool calls requeridos y 7/8 en modo automatico, lo que confirma soporte funcional de llamadas a herramientas.
- Decodificacion especulativa mediante el bloque MTP conservado, con drafter `mtp`.
- Generacion de codigo: se midio un rendimiento de 40,5 tok/s en generacion de codigo (media de dos prompts).
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con APIs compatibles con OpenAI.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Asistencia conversacional local: el modelo puede gestionar conversaciones multi-turno con una ventana de contexto de hasta 131.072 tokens, adecuado para agentes de soporte que necesitan retener historial extenso en un equipo de sobremesa con memoria unificada.
- Generacion de codigo en estaciones de trabajo AMD: con 40,5 tok/s en generacion de codigo y soporte de tool calling, puede integrarse en editores o asistentes de programacion que se ejecuten sobre Strix Halo sin depender de la nube.
- Automatizacion de agentes con llamadas a herramientas: los resultados de 7/8 en tool calls requeridos y automaticos permiten construir flujos de agente que invoquen APIs o funciones externas de forma fiable.
- Procesamiento de documentos tecnicos largos: la ventana de 131.072 tokens y la perplejidad medida sobre documentos tecnicos en ingles lo hacen apto para resumen y extraccion de informacion en corpus extensos.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente sobre hardware AMD y con licencia Apache 2.0, es viable en escenarios donde los datos no pueden salir de la infraestructura propia.
- Prototipado e investigacion en inferencia eficiente: sirve como banco de pruebas para evaluar cuantizacion ROCm-FP4 y decodificacion especulativa MTP en comparacion con cuantizaciones GGUF convencionales.
- Integracion con Lemonade: la model card documenta un flujo de configuracion y chat mediante Lemonade, util para equipos que ya usan ese stack local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta metricas de inferencia y perplejidad:

| Metrica | Valor |
|---|---|
| Perplejidad (documento tecnico EN, 11K tokens, contexto 4096) | 5,31 |
| Perplejidad del Q4_K_M estandar del mismo modelo | 5,24 |
| Tiempo de carga | 18 s |
| Prompt tok/s (p1k) | 574,8 |
| Prompt tok/s (p8k) | 607,1 |
| Generacion tok/s (p1k) | 24,81 |
| Generacion tok/s (p8k) | 48,15 |
| Generacion de codigo tok/s | 40,5 |
| Tool calls (requeridos / automaticos) | 7/8 / 7/8 |
| Cache de prompt turno 2 (tokens cacheados / prompt) | 6961 / 6986 |
| Contexto cargado | 131.072 tokens |

Mediciones realizadas en Ryzen AI Max+ 395, 128 GB, Super Roc 0.20.0 (release candidate), una peticion a la vez, el 2026-11-23.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo GGUF ocupa 15,31 GB; en Strix Halo se ejecuta sobre memoria unificada de 128 GB.
- Hardware medido: AMD Ryzen AI Max+ 395 (gfx1151), 128 GB de memoria unificada.
- GPU recomendadas: el formato ROCm-FP4 esta orientado a hardware AMD con soporte ROCm; la model card solo documenta Strix Halo. No se indica compatibilidad con A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en el sentido de que se ejecuta en un APU de sobremesa/portatil con memoria unificada; no se documenta su comportamiento en GPUs discretas de consumo.
- Opciones de despliegue: Super Roc (motor principal), Lemonade (con `llamacpp.rocm_bin=/opt/superroc/lemonade`), y por herencia de llama.cpp/ggml. No se documenta vLLM ni TGI.
- Latencia y throughput: prompt 574,8-607,1 tok/s; generacion 24,81-48,15 tok/s segun longitud de contexto; carga en 18 s; una peticion concurrente a la vez.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparativa rigurosa con alternativas de la misma categoria. La unica comparacion documentada es interna, frente al Q4_K_M estandar del mismo modelo:

| Modelo | Parametros | Contexto | Perplejidad (misma prueba) | Licencia | Formato |
|---|---|---|---|---|---|
| DaisyRose-27B SuperRoc GGUF (ROCm-FP4) | 27,3B | 131.072 | 5,31 | Apache 2.0 | GGUF ROCm-FP4 |
| DaisyRose-27B Q4_K_M estandar | 27,3B | no disponible | 5,24 | Apache 2.0 (heredada) | GGUF Q4_K_M |
| Alternativas de 27B de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo base es RadixArk/DaisyRose-27B; esta publicacion es solo una cuantizacion, por lo que hereda los sesgos y limitaciones del modelo original, que no se documentan en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la model card; aplicable el riesgo habitual de los modelos generativos.
- La cuantizacion introduce una degradacion medible: perplejidad 5,31 frente a 5,24 del Q4_K_M estandar, una diferencia de 0,07 puntos.
- El hardware objetivo es muy especifico (Strix Halo, gfx1151, ROCm-FP4); el rendimiento en otras GPUs o backends no esta documentado y puede diferir sustancialmente.
- Las mediciones se realizaron con una sola peticion concurrente; no se reporta throughput bajo carga concurrente.
- Idiomas soportados no documentados; la unica evaluacion de perplejidad es sobre un documento en ingles.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia y condiciones del modelo base antes de uso comercial.
- El repositorio tiene muy poca traccion (54 descargas, 0 likes) y fue creado y actualizado el mismo dia (2026-11-23); no hay historial de mantenimiento.
- El motor Super Roc es una herramienta de terceros asociada al autor de la cuantizacion; su madurez y soporte a largo plazo no estan garantizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/DaisyRose-27B-SuperRoc-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentacion de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX (formatos ROCm-FP4 y trabajo sobre llama.cpp): https://github.com/charlie12345/ROCmFPX
