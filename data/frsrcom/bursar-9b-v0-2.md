# frsrcom/Bursar-9b-v0.2

## Resumen

Bursar-9b-v0.2 es un modelo de lenguaje especializado en pagos desarrollado por frsrcom, obtenido mediante fine-tuning de Qwen/Qwen3.5-9B. Su propuesta central es inusual: incorpora una CPU RISC-V (RV32IM) compilada dentro de las capas del propio modelo, de modo que antes de firmar cualquier pago el modelo ejecuta instrucciones de forma exacta sobre esa computadora embebida en lugar de "adivinar" números. El modelo está orientado a pagos x402 y pagos a comercios sobre la red Stellar, con activos SEP-41 como USDC, y a rutas entre cadenas mediante NEAR Intents.

El problema que aborda es concreto: los modelos generativos cometen errores en cifras, direcciones y hashes, y en un contexto de pago un solo dígito equivocado supone pérdida de fondos. Bursar decodifica las estructuras XDR de Soroban y las codificaciones StrKey, calcula el hash de la entrada de autorización y verifica importe, activo, destinatario y contrato contra la petición original. La versión publicada en HuggingFace se etiqueta como v0.2, mientras que la model card describe v0.1; los datos de evaluación de la propia card aparecen con marcadores sin rellenar.

El repositorio ocupa 39,1 GB y los pesos declarados en safetensors suman 19.422.882.304 parámetros, un dato que no concuerda con la denominación "9b" del nombre ni con el modelo base Qwen3.5-9B, por lo que conviene tratarlo con cautela. La licencia es Apache-2.0 y el modelo requiere un runtime específico: `generate()` estándar no ejecuta la computadora embebida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con capas Gated DeltaNet adicionales que alojan una CPU RV32IM compilada en los pesos |
| Parametros totales | 19.422.882.304 (según safetensors); el nombre del modelo indica 9B |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card menciona explicaciones "en el idioma del usuario") |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Bursar parte de Qwen3.5-9B y añade, delante de las capas propias de Qwen, capas Gated DeltaNet en las que se compila una CPU RV32IM. La memoria de esa CPU es el estado recurrente de dichas capas; ejecuta su firmware token a token y devuelve resultados exactos, sin que las capas de Qwen vean la traza interna. El firmware cubre XDR y StrKey (base32 con CRC16) para Stellar, SHA-256 y hashing de entradas de autorización Soroban, aritmética de importes con cualquier número de decimales, EIP-712, keccak-256 y ABI para rutas EVM, base58 para Solana y comprobación de payloads y cotizaciones 1Click de NEAR Intents.

Además, el modelo incorpora un almacén compilado de hechos sobre protocolos de pago (x402 en Stellar, activos SEP-41, emisores de USDC, campos de cotización 1Click) al que accede mediante tool calling. El fine-tuning se realizó sobre tareas de pago multipaso: calcular antes de pagar, actuar sobre el resultado, rechazar manipulación y recuperarse de errores. Las capas de la computadora permanecen congeladas durante el entrenamiento para preservar la exactitud. La técnica de "computer-in-weights" procede de Qwenputer, de Divyansh Agrawal, y el runtime de Mac se basa en Locals, de Generated Computers. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento orientados a tareas de pago y verificación de datos financieros.
- Ejecución exacta de cómputo mediante la CPU embebida: decodificación XDR, StrKey, SHA-256, hashing de autorizaciones Soroban, EIP-712, keccak-256, ABI y base58.
- Pagos x402 para APIs y servicios de agentes, pagos a comercios y facturas en USDC y otros activos SEP-41 sobre Stellar.
- Verificación previa a la firma: importe, activo, destinatario y contrato se comparan contra la petición del usuario.
- Generación de una línea legible de confirmación (por ejemplo, "PAY 25.00 USDC on Stellar to GABC…XYZ. Fee 0.00001 XLM. APPROVE") antes de la aprobación con Touch ID.
- Resistencia a inyección de instrucciones: una instrucción maliciosa insertada en un mensaje del vendedor o en una respuesta del servidor no altera el pago.
- Recuperación de errores: una llamada rechazada se corrige una sola vez, sin bucles.
- Pagos entre cadenas mediante cotizaciones de NEAR Intents, con verificación exacta de cada campo, incluidos los memos de depósito de Stellar.
- Tool calling para consultar el almacén de conocimiento de protocolos de pago integrado en los pesos.
- Ejecución en dispositivo ("on-device") en Mac, con clave P-256 generada en el Secure Enclave.

## Casos de uso

- Pagos de agentes a APIs de pago por uso: el modelo construye y verifica la autorización x402 en Stellar antes de firmar, de modo que un importe o destinatario alterado por el servidor se detecta y se rechaza.
- Pago de facturas de comercio en USDC: decodifica la entrada de autorización Soroban, comprueba el importe y el emisor del activo contra la factura y presenta una línea de confirmación al usuario antes de la aprobación biométrica.
- Pasarela de pago con límite de gasto: al operar sobre una smart account Soroban prefinanciada, el saldo actúa como tope y las políticas de OpenZeppelin añaden límites diarios, lo que acota el daño de cualquier error del modelo.
- Financiación de una cartera Stellar desde otra cadena: solicita y valida cotizaciones de NEAR Intents campo por campo, incluido el memo de depósito, para evitar que un memo incorrecto pierda los fondos.
- Automatización de conciliación: compara los datos decodificados de las autorizaciones con los registros de facturas y detecta discrepancias de importe, activo o destinatario.
- Defensa frente a prompt injection en comercio agéntico: en entornos donde el texto del vendedor o las respuestas de servidores no son de confianza, el modelo verifica el pago contra la petición original en lugar de obedecer instrucciones incrustadas.
- Asistente de pago para usuarios no técnicos: traduce operaciones Soroban complejas a una única línea en lenguaje natural y elimina la necesidad de gestionar frases semilla.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación, pero los valores de las columnas correspondientes a Bursar aparecen como marcadores sin rellenar (`[x%]`, `[x]`). Los únicos datos numéricos publicados son los del modelo base:

| Métrica | Qwen3.5-9B de serie | Bursar-9B base (sin entrenar) | Bursar-9B v0.1 |
|---|---|---|---|
| Llama a la computadora cuando el pago lo requiere | – | [x%] | [x%] |
| Tareas de pago superadas (held-out, 6 familias) | [x%] | [x%] | [x%] |
| Rechaza instrucciones de pago inyectadas | [x%] | [x%] | [x%] |
| Bucles en llamadas rechazadas | – | [x] | [x] |
| eth-evals, cómputo exacto (33 tareas) | 0 / 33 | [x] / 33 | [x] / 33 |
| eth-evals, conocimiento closed-book | 55,7% | 56,4% | [x%] |

El banco de pruebas de pagos (300 tareas held-out en seis familias: pagos x402, pagos entre cadenas, verificación de cotizaciones y facturas, conciliación, rechazo de manipulación y recuperación de errores) se anuncia como publicado con la release, pero el enlace figura como `[link]` sin resolver. No hay resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 19,4 mil millones de parámetros en safetensors, la inferencia en fp16 requeriría aproximadamente 39 GB de VRAM; en int8, unos 20 GB; en int4, unos 10-12 GB. Estas cifras son estimaciones por tamaño, no datos del autor.
- GPU recomendadas: no especificadas. Por tamaño, un despliegue en fp16 encajaría en A100 80 GB o H100; en cuantización de 8 bits, en A100 40 GB o RTX 6000 Ada.
- GPU de consumo: no confirmado. En cuantización de 4 bits podría caber en RTX 4090 (24 GB), pero el modelo requiere un runtime específico que ejecute la traza de la CPU embebida, por lo que llama.cpp, Ollama o vLLM estándar no son suficientes según la model card.
- Despliegue: la vía prevista es la aplicación Bursar para Mac o el runtime directo (enlace no resuelto en la card), construido sobre Locals de Generated Computers. No se mencionan vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.
- Nota: el modelo está diseñado para ejecución en dispositivo en Mac, con clave en el Secure Enclave, no para servir como API multiusuario.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de Bursar que permitan una comparación cuantitativa. La comparación se limita a características estructurales:

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Bursar-9b-v0.2 | 19,4 B (según safetensors) | no disponible | Pagos Stellar/x402 con CPU embebida | Apache-2.0 | safetensors |
| Qwen3.5-9B (base) | 9 B (nominal) | no disponible | Propósito general | Apache-2.0 | safetensors |
| Alternativas de propósito general del mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables especializados en verificación exacta de pagos mediante cómputo embebido en los pesos.

## Limitaciones y advertencias

- Solo paga desde el saldo prefinanciado de la smart account y únicamente con aprobación por Touch ID del usuario; el modelo nunca ve la clave.
- Los pagos entre cadenas vía NEAR Intents quedan retenidos por el sistema de liquidación de NEAR durante el intercambio, con reembolso automático en caso de fallo.
- Es un modelo de 9B (nominal): bueno en verificación exacta y seguimiento de instrucciones claras, pero no sustituye el criterio sobre qué merece la pena pagar.
- Requiere un runtime específico; `generate()` estándar no ejecuta la computadora embebida, lo que invalida los pipelines de inferencia convencionales.
- Discrepancia entre el nombre ("9b"), el modelo base (Qwen3.5-9B) y los parámetros reales en safetensors (19,4 B): conviene verificar el contenido del repositorio antes de desplegar.
- La model card describe v0.1 mientras el repositorio se etiqueta v0.2; los resultados de evaluación están sin publicar y los enlaces al benchmark y al runtime aparecen como marcadores sin resolver.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- El conocimiento de protocolos está compilado en los pesos y solo cambia con una nueva release firmada; no se puede actualizar en tiempo de ejecución.
- Con 2 descargas y 0 likes, el modelo carece de validación por parte de la comunidad; trátese como experimental.
- La licencia Apache-2.0 permite uso comercial, pero la seguridad del sistema depende del runtime y de la app Bursar, no solo de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/frsrcom/Bursar-9b-v0.2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Técnica Qwenputer (Divyansh Agrawal): no disponible (sin enlace en la información proporcionada)
- Runtime Locals (Generated Computers): no disponible (sin enlace en la información proporcionada)
- Aplicación Bursar para Mac: no disponible (enlace sin resolver en la model card)
- Benchmark de pagos (300 tareas): no disponible (enlace sin resolver en la model card)
- Runtime directo: no disponible (enlace sin resolver en la model card)
