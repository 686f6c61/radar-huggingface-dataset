# goktugoguz/laya-multilingual-arc

## Resumen

Laya Multilingual for Arc USDC transfers es un ajuste fino del modelo de decisión convaiinnovations/laya-multilingual (revisión `1720e3e3`), desarrollado por el usuario goktugoguz. El modelo base cuenta con 322 millones de parámetros y este ajuste se especializa en leer las frases que genera Arc Radar sobre transferencias de USDC en Arc, la cadena de stablecoin de Circle. El modelo resuelve un problema muy concreto: clasificar cada transferencia en una de ocho categorías (lanes) y responder a preguntas de tipo sí/no sobre la operación.

La relevancia de esta ficha es limitada y muy específica. No se trata de un modelo de propósito general, sino de un clasificador de decisión de dominio cerrado (decision-model) que trabaja exclusivamente sobre frases en inglés producidas por el propio pipeline `summarize()` de Arc Radar. No procesa direcciones ni texto libre ajeno a ese formato, y su única medición publicada es sobre ese dominio.

El ajuste reporta una mejora sustancial frente al modelo base: la precisión balanceada pasa de 0,786 a 0,966 en un benchmark de 59 preguntas contables sobre 20.000 transferencias. Está publicado bajo licencia Apache 2.0 y tiene un gemelo en formato MLX fp16 para Apple Silicon. No dispone de descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision; base convaiinnovations/laya-multilingual) |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existe un gemelo MLX en fp16) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tambien MLX fp16 en el gemelo) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base convaiinnovations/laya-multilingual. Se sabe que es un modelo de decision (decision-model) de 322 millones de parametros, cargado mediante la libreria `laya`, y que este ajuste se realizo sobre la revision `1720e3e3` del base. El ajuste fino esta orientado a una tarea de clasificacion de texto: asignar una lane y responder preguntas binarias sobre transferencias de USDC en Arc. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

El dominio de entrenamiento esta estrictamente acotado: el modelo lee una unica frase en ingles por transferencia (generada por `summarize()` de Arc Radar) y nunca direcciones. Las ocho lanes estan definidas de forma verbatim y en un orden concreto (`swap`, `bridge`, `liquidity`, `vault`, `lending`, `signed_payment`, `payment`, `spam`), y tanto el orden como la redaccion forman parte de lo entrenado. Las preguntas de espectador se formulan como preguntas `noul`, cada una prefijada con `About this Arc USDC transfer: `. El dataset asociado es `goktugoguz/arc-usdc-laya-bench`.

## Capacidades

- Clasificacion de transferencias de USDC en ocho lanes: `swap`, `bridge`, `liquidity`, `vault`, `lending`, `signed_payment`, `payment` y `spam`.
- Respuesta a preguntas binarias (si/no) sobre una transferencia, del tipo "Is this a swap?", "Did this go through CCTP?", "Is this spam or dust?".
- Lectura de frases en ingles de una sola linea por transferencia, con formato y vocabulario concretos (importes por rango, protocolo, operacion).
- Distincion de protocolos concretos: Uniswap, KyberSwap, Aerodrome, CCTP, LI.FI.
- Deteccion de casos compuestos: swaps dentro de puentes, cambios de liquidez con swaps, envoltura/desenvoltura de USDC.
- Gestion de un "question gate" que filtra preguntas que no son respondibles (segun la model card, rechaza 0 de 37 preguntas respondibles y descarta 8 o 14 de 14 sin sentido, segun base o ajuste).
- No soporta tool calling, agentes, ni generacion de texto libre; no es un modelo conversacional.
- No soporta multimodalidad ni audio.

## Casos de uso

- Clasificacion automatica de flujo on-chain en Arc: cada transferencia de USDC se etiqueta en una de las ocho lanes para alimentar dashboards de analitica de la cadena, aprovechando la precision balanceada de 0,966 reportada.
- Enrutado de alertas de seguridad: al detectar la lane `spam` (movimiento de cero o menos de un centavo de USDC) o `signed_payment` (pago firmado por autorizacion), se pueden disparar o silenciar alertas segun el tipo.
- Respuesta a preguntas de espectador sobre transferencias concretas: el modelo contesta consultas binarias ("Is this a swap?", "Was USDC minted?") sobre la frase resumida de cada operacion, util para herramientas de exploracion tipo radar.
- Monitorizacion de puentes entre cadenas: responder si "USDC leaving Arc through a bridge", si "this go through CCTP" o si "bridged using LI.FI" permite medir el flujo de salida de Arc.
- Deteccion de swaps en DEX concretos: identificar si un trade ocurrio en Uniswap, KyberSwap o Aerodrome ayuda a atribuir volumen por protocolo.
- Auditoria y verificacion de etiquetado: dado que un auditor independiente comprobo 51 transferencias on-chain y coincidio con las etiquetas en 51 de 51 casos, el modelo puede usarse como segunda opinion frente al base (que acerto 0 de 51 en esa muestra).
- Filtrado de ruido en pipelines de datos: descartar transferencias clasificadas como `spam` o dust antes de alimentar otros procesos analiticos.

## Benchmarks y rendimiento

Benchmark de 20.000 transferencias, 66 preguntas (59 contables). Precision balanceada y AUC:

| Questions | n | Balanced acc. (base) | Balanced acc. (fine-tune) | AUC (base) | AUC (fine-tune) |
|---|---|---|---|---|---|
| All countable | 59 | 0.786 | **0.966** | 0.877 | **0.982** |
| Written for this benchmark, before measuring | 36 | 0.748 | **0.950** | 0.850 | **0.971** |
| The radar's long-standing questions | 23 | 0.846 | **0.991** | 0.921 | **0.998** |
| Concepts the fine-tune was taught | 40 | 0.761 | **0.981** | 0.853 | **0.993** |
| Concepts it was never taught | 19 | 0.840 | **0.933** | 0.929 | **0.959** |

Datos adicionales reportados en la model card:

- En el fixture propio del radar (1.200 transferencias), las lanes coinciden con la tabla de hechos auditada en el 99,8% de los casos (base) y el 100,0% (ajuste).
- El ajuste supera al base en 57 de 59 preguntas y empeora en 1.
- Auditoria independiente de 51 transferencias (elegidas donde el base y un ajuste anterior, run 3, discrepaban): las etiquetas del autor eran correctas en 51 de 51; este modelo acerto 48 de 51; el base acerto 0 de 51.
- Preguntas individuales con peor rendimiento en el ajuste: "Was the sender a smart contract account like ERC-4337?" (0,63) y "Was more than 100 USDC bridged out of Arc?" (0,86).

## Requisitos de hardware

- VRAM estimada para inferencia (segun el recuento de 321.908.998 parametros, estimacion propia): aproximadamente 0,65 GB en fp16, 0,32 GB en int8 y 0,16 GB en int4, sin contar overhead del runtime de la libreria `laya`.
- El modelo cabe con holgura en cualquier GPU de consumo, e incluso es probable que funcione en CPU o en Apple Silicon mediante el gemelo MLX fp16 (`goktugoguz/laya-multilingual-arc-mlx`).
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer moderna es suficiente.
- Opciones de despliegue: la libreria `laya` (carga mediante `laya.load(...)`) y MLX para Apple Silicon. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Tarea | Licencia | Balanced acc. | Disponibilidad |
|---|---|---|---|---|---|---|
| laya-multilingual-arc (este) | 321.908.998 | en | Clasificacion de transferencias Arc USDC | apache-2.0 | 0.966 | safetensors + MLX fp16 |
| convaiinnovations/laya-multilingual (base) | 322M | no disponible | Modelo de decision Laya | no disponible | 0.786 (misma tarea) | safetensors |

No se dispone en la informacion proporcionada de otros modelos comparables de la misma categoria y tamano. Los unicos datos comparativos disponibles son los del modelo base y un ajuste anterior (run 3) mencionado en la auditoria.

## Limitaciones y advertencias

- Dominio cerrado: el modelo solo esta medido sobre frases en ingles generadas por `summarize()` de Arc Radar. Cualquier otro texto queda fuera de su dominio.
- No procesa direcciones ni texto libre; funciona exclusivamente sobre el formato de frase del pipeline.
- El orden y la redaccion verbatim de las opciones de lane y de las preguntas forman parte de lo entrenado; alterarlos probablemente degrada el resultado.
- La redaccion de las preguntas de espectador debe usar el prefijo `About this Arc USDC transfer: ` para coincidir con el entrenamiento.
- Riesgo de alucinacion: no disponible de forma explicita, aunque el modelo es de clasificacion, no generativo.
- Sesgos conocidos: no disponibles.
- Resultados con preguntas no ensenadas bajan (0,933 de precision balanceada frente a 0,981 en conceptos ensenados), lo que sugiere menor fiabilidad ante conceptos nuevos.
- Preguntas concretas rinden notablemente peor: la deteccion de cuentas smart contract tipo ERC-4337 (0,63) y el umbral de mas de 100 USDC puenteados (0,86).
- Licencia apache-2.0: permite uso comercial, pero no se ofrecen garantias sobre el rendimiento fuera del dominio medido.
- Sin descargas ni likes registrados en el momento de la consulta: no hay evidencia de adopcion ni de validacion por terceros mas alla de la auditoria citada.
- El benchmark fue recogido despues de elegir este modelo, lo que puede introducir sesgo en la seleccion del conjunto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/goktugoguz/laya-multilingual-arc
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Gemelo MLX para Apple Silicon: https://huggingface.co/goktugoguz/laya-multilingual-arc-mlx
- Dataset de benchmark: https://huggingface.co/datasets/goktugoguz/arc-usdc-laya-bench
- Arc Radar: https://radar.arckive.org
- Codigo fuente de `summarize()` en el radar: https://github.com/Goguzgungor/arckive/tree/main/radar
