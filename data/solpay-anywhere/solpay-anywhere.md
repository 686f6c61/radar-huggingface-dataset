# solpay-anywhere/solpay-anywhere

## Resumen

SolPay Anywhere no es un modelo de inteligencia artificial, sino una aplicación de pagos multicadena para comerciantes de Solana, publicada como repositorio en Hugging Face (con ID `solpay-anywhere/solpay-anywhere`) y desarrollada por el usuario del mismo nombre para el hackathon Encode Club Solana Hackathon 2026, en la pista "Aurora Intents: bring any-chain liquidity to Solana". El proyecto resuelve el problema de que un comerciante que quiere cobrar en USDC sobre Solana recibe pagos de clientes cuyos fondos están en otras cadenas (Ethereum, Base, Tron, Bitcoin y hasta 37 cadenas con unos 200 activos), y lo hace mediante un único enlace de pago y una única transferencia por parte del cliente.

Técnicamente, la aplicación es un servidor Node.js sin dependencias (`server.js`) que expone una API propia (`/api/quote`, `/api/compare`, `/api/status`, `/api/deposit`, `/api/solanapay`) y que internamente llama a la API 1Click Swap de Aurora / NEAR Intents (`https://1click.chaindefuser.com`). La interfaz es JavaScript vanilla sin paso de compilación, y la lógica pura (validación de direcciones, conversión de unidades base con BigInt, construcción de peticiones de cotización y mapeo de estados) reside en `lib.js`, cubierta por 16 pruebas unitarias con `node:test` y `fetch` simulado.

La relevancia del proyecto es la elección de `EXACT_OUTPUT` como tipo de swap: el importe de la factura del comerciante queda fijado y es la red de solvers la que cotiza el activo de entrada en el lado del cliente, con un deslizamiento del 1 % y una fecha límite de 30 minutos. El repositorio tiene un tamaño de 0,0 GB, 0 descargas y 0 likes en el momento de la consulta, y no incluye pesos de modelo, pipeline ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación web cliente-servidor: servidor HTTP en Node.js (sin dependencias) + interfaz en JavaScript vanilla sin paso de compilación; integración con la API 1Click Swap de Aurora / NEAR Intents |
| Parametros totales | no disponible (no es un modelo de IA) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz y la documentación están en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene código fuente; el codificador QR `public/qrcode.js` es qrcode-generator 1.4.4 con licencia MIT, incluido en el repositorio) |

## Arquitectura y entrenamiento

El proyecto no entrena ningún modelo. Su arquitectura es una aplicación web de tres capas: una interfaz estática en `public/` (`index.html`, `app.js`, `style.css`) que consume rutas `/api/*`; un servidor Node.js en `server.js` que actúa de proxy y orquestador hacia la API 1Click Swap; y un módulo de lógica pura en `lib.js` que implementa la validación de direcciones, la conversión de importes a unidades base con `BigInt` (sin aritmética de coma flotante), la construcción de la petición de cotización y el mapeo de respuestas. Las rutas expuestas son `/api/config` (indicador de modo dry-run o live), `/api/tokens` (lista de activos pagables con caché de 60 s), `/api/quote`, `/api/compare` (cotizaciones dry en paralelo para activos populares, ordenadas por coste real en USD), `/api/status`, `/api/deposit` (envío del hash de transacción del cliente a `/v0/deposit/submit`), `/api/simulate` (secuencias de estado guionizadas para la demo, etiquetadas como SIMULATION) y `/api/solanapay` (URL de solicitud de transferencia Solana Pay para quienes ya tienen USDC en Solana).

La integración con 1Click cubre cuatro endpoints: `GET /v0/tokens` para la lista de activos con precio; `POST /v0/quote` con `swapType: EXACT_OUTPUT`, `destinationAsset` fijado a USDC en Solana (`nep141:sol-5ce3…omft.near`), `recipient` igual a la dirección del comerciante, `refundTo` igual a la del cliente, `depositType` y `refundType` en `ORIGIN_CHAIN`, `recipientType` en `DESTINATION_CHAIN`, deslizamiento del 1 % y plazo de 30 minutos, con `dry: true` salvo en modo live; `GET /v0/status?depositAddress=` para el seguimiento del pago; y `POST /v0/deposit/submit` para que el cliente comunique el hash de su depósito y 1Click lo detecte antes. No hay datos de entrenamiento, RLHF ni innovaciones de inferencia porque no existe un modelo subyacente.

## Capacidades

- Generación de enlaces de pago compartibles a partir de una dirección Solana, un importe y una nota (memo), sin cuenta, sin base de datos y sin custodia de fondos.
- Cotización en vivo con tipo `EXACT_OUTPUT` desde Aurora / NEAR Intents: el comerciante recibe el importe exacto en USDC sobre Solana y el solver cotiza la entrada en el lado del cliente.
- Vista de comparación que cotiza en paralelo activos populares y los ordena por coste real en USD.
- Pago directo por Solana Pay (código QR y enlace de monedero con importe exacto, mint de USDC y memo) para clientes que ya tienen USDC en Solana, sin pasar por la intención.
- Seguimiento del estado del pago con sondeo cada 5 s hasta un estado terminal: `PENDING_DEPOSIT`, `KNOWN_DEPOSIT_TX`, `INCOMPLETE_DEPOSIT`, `PROCESSING`, `SUCCESS`, `REFUNDED` y `FAILED`.
- Gestión de reembolsos ejecutada por el protocolo 1Click hacia la dirección `refundTo` del cliente en la cadena de origen (`refundType: ORIGIN_CHAIN`); el comerciante nunca se carga y la aplicación nunca toca los fondos.
- Envío del hash de depósito por parte del cliente para acelerar la detección.
- Modo dry-run por defecto: las cotizaciones son reales pero no se emiten direcciones de depósito y no puede moverse dinero; el modo live exige `LIVE=1` en el servidor y un indicador explícito del cliente.
- Soporte de 200 activos en 37 cadenas como origen de pago (ETH en Ethereum, USDC en Base, USDT en Tron, BTC, etc.).
- Despliegue mediante Docker y preparación de un Hugging Face Space con SDK Docker (`./deploy/make-hf-space.sh`).
- Simulación de secuencias de éxito y de fallo con reembolso, claramente etiquetadas como SIMULATION y sin fondos reales.

## Casos de uso

- Cobro de comerciantes con clientela multicadena: un comerciante crea un enlace con su dirección Solana, importe y memo; el cliente paga con el activo que tenga en cualquiera de las 37 cadenas soportadas y el comerciante recibe USDC exacto en Solana, eliminando la elección manual de puente, la tenencia del token de gas y el riesgo de que el importe recibido no cuadre con la factura.
- Facturación con importe fijo: al usar `EXACT_OUTPUT`, el importe de la factura no se diluye por el deslizamiento; es adecuado para comercios que necesitan conciliación contable exacta y para clientes que no quieren asumir el riesgo de precio del activo de entrada.
- Comparación de coste de pago: la vista `/api/compare` lanza cotizaciones dry en paralelo de los activos populares y las ordena por coste en USD, lo que permite al cliente elegir la cadena de origen más barata antes de firmar la transacción.
- Pago nativo en Solana sin intención: para clientes que ya tienen USDC en Solana, el endpoint `/api/solanapay` genera un QR y un enlace de monedero con importe exacto, mint y memo, evitando comisiones de solver innecesarias.
- Seguimiento operativo de pagos: el sondeo de `/api/status` cada 5 s y el mapeo de estados de `describeStatus()` permiten mostrar al cliente en qué fase está el pago (depósito, confirmación, liquidación por solvers, pago o reembolso) con enlaces a Solscan para las transacciones finales.
- Autoservicio de reembolsos: cuando el swap falla, el protocolo 1Click devuelve los fondos a la dirección `refundTo` del cliente en la cadena de origen, de modo que el comerciante no tiene que gestionar manualmente devoluciones ni custodiar saldos.
- Demostración y formación sin riesgo: el modo dry-run y los botones de simulación permiten probar el flujo completo (cotización, estados, reembolso) sin emitir direcciones de depósito ni mover fondos, útil para evaluar la integración antes de activar `LIVE=1`.
- Integración en un Space de Hugging Face o en un contenedor Docker: el script `deploy/make-hf-space.sh` y el `Dockerfile` permiten publicar una instancia de demostración accesible por URL con un solo comando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de latencia, throughput ni comparativas de rendimiento; únicamente declara 16 pruebas unitarias ejecutables con `npm test` sin acceso a red, mediante `fetch` simulado.

## Requisitos de hardware

- No aplica VRAM ni GPU: no hay modelo de IA que inferir. El requisito es un entorno con Node.js 18 o superior.
- CPU y memoria: no se especifican cifras; el servidor es un proceso Node.js sin dependencias npm, por lo que el consumo es el propio de un servidor HTTP ligero.
- GPU recomendadas: no disponible (no procede).
- Cabe en cualquier equipo de desarrollo convencional; no requiere hardware especializado.
- Opciones de despliegue: `npm start` en local (por defecto en `http://localhost:8787`, configurable con `PORT`), Docker (`docker build -t solpay . && docker run -p 7860:7860 solpay`) y Hugging Face Space con SDK Docker generado por `./deploy/make-hf-space.sh`.
- Variables de entorno: `PORT`, `LIVE`, `ONECLICK_API` y `ONECLICK_JWT` (esta última opcional, para comisiones más bajas en modo live).
- Latencia y throughput: no disponibles. La interfaz refresca el estado del pago cada 5 s y la lista de tokens se cachea 60 s, pero no se publican medidas de latencia de las llamadas a 1Click.

## Comparativa con modelos similares

| Proyecto | Tipo | Cadenas y activos de origen | Tipo de swap | Custodia | Licencia | Estado en el repositorio |
|---|---|---|---|---|---|---|
| SolPay Anywhere | Aplicación de pago multicadena sobre Aurora / NEAR Intents | 37 cadenas, unos 200 activos | `EXACT_OUTPUT` con deslizamiento del 1 % y plazo de 30 min | Ninguna: el cliente paga directamente la dirección de depósito | no disponible | 0 descargas, 0 likes, 0,0 GB |
| Solana Pay (nativo) | Protocolo de solicitud de transferencia en Solana | Solo activos de Solana | Transferencia directa, sin intención | Ninguna | no disponible en la información | Integrado como ruta alternativa en `/api/solanapay` |
| Pasarelas de pago con puente manual | Flujo tradicional de puente + swap + transferencia | Variable según el puente elegido | El cliente asume el deslizamiento y elige la ruta | Variable; a menudo con custodia temporal | no disponible | No es un competidor directo identificado en la información |

No se dispone de datos de rendimiento ni de licencia de las alternativas citadas dentro de la información proporcionada; la comparación se limita a características funcionales descritas en la model card.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, código, visión ni audio; cualquier evaluación como modelo lingüístico carece de sentido.
- No se declara licencia en el repositorio, lo que impide determinar si el uso comercial, la redistribución o la modificación están permitidos. El único componente con licencia explícita es el codificador QR vendorizado (MIT, qrcode-generator 1.4.4).
- El proyecto depende por completo de la API 1Click Swap de Aurora / NEAR Intents y de su red de solvers; una caída, un cambio de contrato o una modificación de comisiones del servicio externo afecta directamente al funcionamiento.
- El modo live requiere `LIVE=1` en el servidor y una bandera explícita del cliente; una configuración incorrecta podría emitir direcciones de depósito reales, por lo que la puesta en producción exige revisar la configuración y los controles de acceso.
- La vista de comparación y la ruta sin dirección de reembolso utilizan direcciones de reembolso de marcador de posición, y solo para cotizaciones dry; no deben interpretarse como direcciones válidas en producción.
- Los botones de simulación reproducen secuencias de estado con el mismo código `describeStatus()` pero no son pagos reales; un usuario podría confundirlos con transacciones efectivas si no se revisa el etiquetado SIMULATION.
- Los reembolsos dependen del protocolo 1Click hacia la cadena de origen del cliente; no hay garantía de plazo ni de importe más allá de lo que indique el estado `REFUNDED`.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma porque no hay modelo generativo; la interfaz está en inglés y no se declaran otros idiomas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 2026-10-29 y actualizado el 2026-11-05; es un proyecto de hackathon sin evidencia de adopción ni de auditoría de seguridad publicada.
- La aplicación nunca custodia claves ni fondos, pero el cliente paga directamente a una dirección de depósito generada por un tercero; la confianza recae en 1Click y en la validación de direcciones implementada en `lib.js`.
- No se publican métricas de latencia, throughput ni pruebas de carga, por lo que no puede evaluarse su comportamiento bajo tráfico elevado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/solpay-anywhere/solpay-anywhere
- API 1Click Swap de Aurora / NEAR Intents (endpoint por defecto): https://1click.chaindefuser.com
- Encode Club Solana Hackathon 2026, pista "Aurora Intents: bring any-chain liquidity to Solana": no disponible en la información proporcionada
- Documentación de NEAR Intents: no disponible en la información proporcionada
- Documentación de Solana Pay: no disponible en la información proporcionada
- qrcode-generator 1.4.4 (MIT, vendorizado en `public/qrcode.js`): no disponible en la información proporcionada
- Capturas y demo del proyecto (`demo/shots/`): no disponible en la información proporcionada
