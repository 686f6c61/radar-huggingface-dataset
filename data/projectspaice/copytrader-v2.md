# ProjectSpaice/copytrader-v2

## Resumen

`ProjectSpaice/copytrader-v2` no es un modelo de aprendizaje automatico, sino un bot de copy-trading para el ecosistema pump.fun sobre Solana, empaquetado en un repositorio de Hugging Face. El autor, ProjectSpaice, lo presenta como una reescritura de su `copytrader.cjs` previo, sustituyendo la logica de "vender cuando venda el lider" por un motor de reglas por cartera: cada cartera lider tiene su propio filtro de entrada (banda de capitalizacion de mercado y tamano de compra) y su propia salida (scalp temporal, take-profit, stop-loss o salida al vender el lider), seleccionados y validados sobre el historial de operaciones de esa misma cartera.

El modelo de datos subyacente es un conjunto de 178 carteras analizadas, de las que se descartaron las de volcado instantaneo y se conservaron 19 activas en `leaders_v2.txt` y `rules.json`. La validacion se hizo con particion temporal: reglas elegidas sobre operaciones antiguas y puntuadas sobre operaciones posteriores no vistas (6-18 por cartera), con comisiones de ~1,25% por lado y propina de prioridad asumiendo un tamano de 0,05 SOL.

Su relevancia es metodologica dentro del nicho de bots de trading: introduce filtros de entrada por cartera, registro de posicion en cola (`leader_slot`, `landed_slot_est`, `trades_between`) y recuperacion de la renta de la cuenta de token, y advierte explicitamente de que las muestras son pequenas y los resultados no son consejo financiero. No hay pesos, arquitectura neuronal ni contexto: el repositorio contiene codigo JavaScript (`.cjs`) y ficheros de configuracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un bot de trading en Node.js/JavaScript) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el codigo y la documentacion estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos; el repositorio contiene `copytrader_v2.cjs`, `rules.json`, `leaders_v2.txt`) |

## Arquitectura y entrenamiento

No aplica el concepto de arquitectura de red neuronal. El sistema es un motor de reglas determinista implementado en JavaScript sobre las librerias `@solana/web3.js`, `@solana/spl-token`, `@pump-fun/pump-sdk` y `@pump-fun/pump-swap-sdk`, conectado por WebSocket y RPC (Helius u otro proveedor). Cada cartera lider de `leaders_v2.txt` tiene una regla en `rules.json` con un tipo de salida entre `time`, `tp_time`, `tp_stop` y `leader_sell`, mas un filtro de entrada definido por banda de capitalizacion de mercado (por ejemplo, MC <= 60 SOL) y banda de tamano de compra del lider (por ejemplo, compra >= 1 SOL).

El "entrenamiento" es en realidad una seleccion de reglas por cartera sobre el historial de transacciones de 178 carteras (conjunto `WALLETS`), con particion temporal: reglas elegidas sobre operaciones antiguas y evaluadas sobre operaciones posteriores no vistas (6-18 por cartera). La simulacion asume que la copia aterriza en el mismo slot que el lider, recupera la renta de la cuenta de token asociada (~0,002 SOL por moneda, ~4% de una operacion de 0,05 SOL) y aplica ~1,25% de comision por lado mas propina de prioridad. Se excluyeron `Uncquant` y `onbooze` por ser pares del mismo trader que `degen_lotus` y `Bob_Benson`, para evitar duplicar exposicion.

## Capacidades

- Copy-trading automatizado sobre pump.fun en Solana, con compra y venta via SDK de pump.fun.
- Filtros de entrada por cartera: banda de capitalizacion de mercado justo despues de la compra del lider y banda de tamano de compra del lider.
- Salidas por cartera: scalp temporal (`time`), take-profit con salida temporal (`tp_time`), take-profit con stop-loss (`tp_stop`) y salida al vender el lider (`leader_sell`), con bandera de respaldo opcional.
- Registro de posicion en cola: `leader_slot`, `landed_slot_est` y `trades_between` en cada evento `buy_landed`.
- Recuperacion de renta de cuenta de token: cierre automatico de la ATA cuando el saldo queda a cero (`CLOSE_TOKEN_ACCOUNTS=1`).
- Modo simulacion (`DRY_RUN=1`) sin clave privada para validar comportamiento antes de operar en real.
- Control de desfase: `MAX_LAG_MS` descarta la copia si la construccion de la transaccion tarda demasiado.
- Limites operativos configurables: `BUY_SOL` (0,05 por defecto), `MAX_OPEN_TRADES` (3), `MAX_HOLD_SECONDS`, `SKIP_IF_MCAP_ABOVE_SOL`, `TAKE_PROFIT_MCAP_SOL`, `EXIT_AFTER_BUYS`, `SELL_ON_BOND`, `RUN_MINUTES`.
- No dispone de generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades multilingues.

## Casos de uso

- Copy-trading de carteras de pump.fun con reglas por lider: el operador carga `leaders_v2.txt` y `rules.json` y el bot aplica a cada cartera su filtro de entrada y su salida validada, evitando la estrategia unica de "vender cuando venda el lider" que el autor identifica como perdedora en carteras de volcado instantaneo.
- Validacion en seco antes de operar: con `DRY_RUN=1` y sin `SOLANA_PRIVATE_KEY`, el operador observa las lineas `buy_landed` y comprueba en que slot aterrizaria, util para descartar carteras cuya ventaja exige una posicion en cola inalcanzable.
- Seleccion de carteras segun latencia: el registro de `landed_slot_est` y `trades_between` permite desactivar lideres cuyo edge solo se materializa aterrizando primero detras del lider (+16% medio segun el autor) frente a aterrizar al final del slot (-1,6%).
- Scalping de corta duracion: reglas como la de `kingdoji` (vender 4 s despues de entrar con MC <= 60 SOL) o `NateNateNateNat` (TP +30%, salida a los 10 s) encajan en operativa de alta frecuencia con posiciones de 0,05 SOL.
- Gestion de riesgo con stop-loss: carteras como `grok12_john` (TP +50%, stop -20%) o `Bob_Benson` (TP +100%, stop -20%) permiten acotar la perdida por operacion dentro del bot.
- Investigacion y replicacion de estudios de copy-trading: el repositorio documenta la metodologia (particion temporal, comisiones, propina, recuperacion de renta) y sirve como base para revalidar reglas con particiones nuevas, tal como sugiere el propio autor ("re-validate out-of-sample").
- Integracion en infraestructura Solana existente: requiere solo Node.js, un RPC/WebSocket (por ejemplo Helius) y una clave privada en base58, por lo que se puede desplegar en un VPS con acceso a la red.

## Benchmarks y rendimiento

Los datos disponibles son resultados de validacion out-of-sample por cartera, no benchmarks de modelos. Se reproducen a continuacion tal como los publica el autor (6-18 operaciones retenidas por cartera, tras ~1,25% de comision por lado y propina a 0,05 SOL):

| Cartera | Copiar solo cuando | Salida | Operaciones retenidas | Media por operacion | Tasa de acierto |
|---|---|---|---|---|---|
| kingdoji | MC <= 60 SOL | vender 4 s tras entrar | 6 | +48% | 83% |
| degen_lotus | MC <= 60 SOL | TP +100%, si no 5 min | 14 | +45% | 69% |
| NateNateNateNat | MC <= 45 SOL | TP +30%, si no 10 s | 10 | +37% | 90% |
| grok12_john | MC <= 35 SOL | TP +50%, stop -20% | 16 | +34% | 56% |
| element69420 | MC <= 35, compra <= 1 SOL | TP +30%, si no 60 s | 7 | +25% | 86% |
| JOSIAHHHHHHHHHH | MC <= 35, compra >= 1 SOL | TP +50%, si no 10 s | 11 | +20% | 82% |
| Bob_Benson | MC 45-120, compra >= 1 SOL | TP +100%, stop -20% | 15 | +13% | 60% |

El autor reporta ademas el efecto de la posicion en cola sobre las mismas operaciones: +16% de media aterrizando primero detras del lider, +5% detras de la mitad de los bots y -1,6% al final del slot del lider. No se han publicado resultados de benchmarks de modelos en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni VRAM: es un proceso Node.js que mantiene conexiones WebSocket y RPC contra Solana.
- CPU y memoria: no especificados en la informacion disponible; un VPS modesto con Node.js y conectividad de red estable es suficiente segun la naturaleza del codigo.
- Red: acceso a un RPC/WebSocket de Solana (Helius u otro) y baja latencia hacia los validadores; el propio autor senala que la velocidad de aterrizaje es la ventaja competitiva.
- Dependencias: `ws`, `bn.js`, `bs58`, `@solana/web3.js`, `@solana/spl-token`, `@pump-fun/pump-sdk`, `@pump-fun/pump-swap-sdk`.
- Variables de entorno: `HELIUS_API_KEY` (o `RPC_URL`/`WS_URL`/`SENDER_URL`), `SOLANA_PRIVATE_KEY` (base58; omitir o `DRY_RUN=1` para simulacion), `LEADERS_FILE`, `RULES_FILE`.
- Opciones de despliegue: ejecucion directa con `node copytrader_v2.cjs`; no se mencionan contenedores, vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles como cifras; el codigo incluye `MAX_LAG_MS` para descartar copias cuya construccion de transaccion exceda el umbral.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros bots de copy-trading comparables ni datos de rendimiento de alternativas. Como referencia interna, el propio autor compara con su version anterior `copytrader.cjs`:

| Aspecto | copytrader.cjs | copytrader-v2 |
|---|---|---|
| Salidas | Una global ("vender cuando venda el lider") | Por cartera: `time`, `tp_time`, `tp_stop`, `leader_sell` |
| Filtros de entrada | No descritos | Banda de MC y banda de compra del lider por cartera |
| `BUY_SOL` por defecto | 0,01 | 0,05 |
| Renta de cuenta de token | No descrita | Cierre de ATA (~0,002 SOL por moneda) |
| Registro de cola | No descrito | `leader_slot`, `landed_slot_est`, `trades_between` |
| Validacion | No descrita | Particion temporal, 6-18 operaciones retenidas por cartera |

## Limitaciones y advertencias

- Muestras muy pequenas: 6-18 operaciones retenidas por cartera; el autor las califica de candidatas para simulacion, no de ventajas probadas, y recomienda revalidar mensualmente.
- Riesgo de perdida total: es software de trading experimental; el autor advierte de que se puede perder el tamano completo de la operacion y que no ofrece garantia alguna.
- No es consejo financiero: la model card lo declara explicitamente.
- Dependencia de la posicion en cola: los resultados cambian de +16% a -1,6% segun donde aterrice la copia; sin baja latencia, muchas reglas dejan de ser rentables.
- Sensibilidad a comisiones y propinas: la validacion asume ~1,25% por lado mas propina; variaciones en estas condiciones alteran los resultados.
- Carteras excluidas por duplicidad: `Uncquant` y `onbooze` se descartaron por ser pares del mismo trader que `degen_lotus` y `Bob_Benson`.
- Licencia no disponible: no se especifican condiciones de uso comercial, redistribucion ni modificacion; hay que contactar con el autor antes de un uso en produccion.
- Idiomas no disponibles: la documentacion y el codigo estan en ingles; no hay soporte multilingue declarado.
- Sesgos conocidos: no disponibles; al ser un motor de reglas determinista, el sesgo relevante es el de seleccion sobre el historial de las 178 carteras analizadas.
- Riesgo de alucinacion: no aplica (no es un modelo generativo).
- Caveat de produccion: el autor recomienda empezar en `DRY_RUN=1` durante varias compras del lider, revisar las lineas `buy_landed` y solo despues operar en real con tamano pequeno.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ProjectSpaice/copytrader-v2
- Explicacion de las reglas por cartera (asistente ML Intern): https://hf.co/chat?mode=ml-intern&prompt=Explain%20the%20per-wallet%20rule%20for%20MUNCHR%20in%20this%20repo%20and%20how%20the%20entry%20filters%20work
- Revalidacion out-of-sample (asistente ML Intern): https://hf.co/chat?mode=ml-intern&prompt=Backtest%20the%20rules.json%20wallet%20list%20against%20the%20WALLETS%20dataset%20with%20a%20fresh%20train-test%20split%20and%20report%20per-wallet%20out-of-sample%20P%26L
- Documentacion de reglas por cartera: `RULES_SAMESLOT.md` en el dataset `copytrader` (referenciado en la model card; no se proporciona URL directa)
- Dataset de historiales de carteras: `WALLETS` (referenciado en la model card; no se proporciona URL directa)
- Paper, blog, repositorio de codigo o demo adicionales: no disponibles en la informacion proporcionada
