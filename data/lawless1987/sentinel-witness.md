# Lawless1987/Sentinel-Witness

## Resumen

Sentinel-Witness es un repositorio publicado en HuggingFace por el usuario Lawless1987 que, a pesar de su identificador y etiquetas propias de un modelo de lenguaje (`trading`, `ledger`, `crypto`), no contiene pesos de un modelo de IA. Se trata en realidad del código fuente de una aplicacion web progresiva (PWA) denominada "Ledger Trading Dashboard", orientada a la gestion de operaciones con criptomonedas mediante una cartera hardware Ledger y las APIs de Coinbase, Kraken y Crypto.com.

El proyecto implementa un panel de control con tres niveles de operacion (dashboard, aprobacion manual y ejecucion automatizada), apoyado en una estrategia de trading de tipo grid/bracket validada mediante walk-forward. Incluye modulos de almacenamiento seguro cifrado con AES-GCM y PBKDF2, firma de peticiones a exchanges y un sistema de salvaguardas (`tradeGate.js`) que impone limites de riesgo antes de ejecutar cualquier orden.

Es relevante unicamente como referencia de ingenieria para desarrolladores interesados en integrar carteras hardware con exchanges mediante WebHID y en disenar guardarrailes de ejecucion, no como artefacto de IA. No hay arquitectura de red neuronal, parametros, contexto ni datos de entrenamiento asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una PWA en JavaScript/React) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene codigo fuente, no pesos) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni un pipeline de aprendizaje automatico. La "arquitectura" descrita en la model card corresponde a una aplicacion cliente: modulos JavaScript para almacenamiento cifrado (`secureStorage.js`), matematicas de grid (`gridMath.js`), clientes de exchange (`exchanges/kraken.js`, `cryptocom.js`, `coinbase.js`), integracion con Ledger (`ledger.js`) y un control de ejecucion (`tradeGate.js`), junto con componentes React (`Dashboard.jsx`, `App.jsx`). El empaquetado se realiza con Vite y las pruebas con `npm test`.

No hay datos de entrenamiento, tokens, RLHF ni innovaciones de inferencia. La unica logica "adaptativa" mencionada es una capa en tiempo real sobre parametros de estrategia previamente validados, sin relacion con aprendizaje automatico.

## Capacidades

- No es un modelo generativo: no produce texto, codigo ni razonamiento.
- Gestion de credenciales de exchange cifradas con AES-GCM y clave derivada por PBKDF2 (210 000 iteraciones), almacenadas en IndexedDB del navegador.
- Firma de peticiones a Kraken y Crypto.com con verificacion de determinismo y formato.
- Generacion de JWT ES256 para Coinbase (verificacion criptografica del mecanismo, no de una clave CDP real).
- Aplicacion de limites de riesgo en `tradeGate.js`: rechazo de arranque del modo automatizado sin `maxPerTradeUsd` y `maxDailyTradesCount` finitos y positivos, y revalidacion en cada senal.
- Integracion con Ledger mediante WebHID con confirmacion fisica en dispositivo (no funcional en navegadores iOS).
- Estrategia grid/bracket con salvaguardas de capital y proteccion frente a lookahead.
- Soporte end-to-end unicamente para XRP en la interfaz; la guia de estrategia cubre tambien DOGE, pero la app solo solicita un activo.

## Casos de uso

- Referencia de integracion Ledger + WebHID: el codigo de `ledger.js` documenta el flujo de firma en dispositivo y las limitaciones por plataforma (Chrome/Edge en escritorio y Android; no iOS), util para quien disene una app nativa con el SDK Bluetooth de Ledger.
- Patron de almacenamiento seguro en PWA: `secureStorage.js` sirve como ejemplo de cifrado de credenciales en IndexedDB con salt e IV nuevos por guardado y fallo cerrado ante contrasena incorrecta.
- Diseno de guardarrailes de ejecucion: `tradeGate.js` y `automatedLimits.js` ilustran como imponer limites de riesgo revalidados en cada senal y evitar opciones "ilimitadas" en un sistema de trading automatizado.
- Firma de peticiones a exchanges: los modulos de Kraken y Crypto.com pueden reutilizarse como referencia para construir clientes de API con permisos restringidos (lectura de saldos y creacion/cancelacion de ordenes, sin retirada).
- Validacion de estrategias grid/bracket: `gridMath.js` incluye comprobaciones de invariantes de capital y paridad contra un motor Python con un caso de referencia de 12 USD, util como plantilla de pruebas de estrategia.
- Auditoria de seguridad de aplicaciones financieras: la tabla "tested vs. needs your device" de la model card ejemplifica una documentacion honesta de que partes estan verificadas y cuales requieren hardware o red reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta el estado de las pruebas unitarias (por ejemplo, round-trip completo de cifrado, invariancia de orden de claves en firmas, rutas de rechazo de limites), sin metricas de rendimiento, latencia ni throughput.

## Requisitos de hardware

- No requiere GPU ni VRAM: es una aplicacion web.
- Navegador de escritorio o Android con soporte WebHID (Chrome o Edge) para la conexion con Ledger.
- En iOS no funciona la integracion con Ledger via WebHID; se requeriria una app nativa con el SDK Bluetooth de Ledger (no incluida).
- Despliegue como PWA servida desde `npm run build` (salida en `dist/`) o servidor de desarrollo con `npm run dev`.
- Requiere Node.js y npm para instalar dependencias y ejecutar las pruebas.
- No hay estimaciones de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de software, podrian citarse otras integraciones de Ledger con exchanges, pero no se dispone de datos en la informacion proporcionada para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; las etiquetas (`trading`, `dashboard`, `ledger`, `crypto`) inducen a confusion si se busca un modelo de lenguaje.
- La ensambladura de transacciones XRP sin firmar no esta implementada: `executeApprovedSignal()` lanza explicitamente `not_implemented` en lugar de simular una operacion completada.
- Las llamadas reales a exchanges (saldos, colocacion de ordenes) no se han probado: el entorno de desarrollo no tenia acceso a las APIs.
- La integracion con Ledger y la interfaz de usuario no se han probado por requerir navegador real y dispositivo fisico.
- La importacion de una clave CDP real de Coinbase no esta verificada; solo se comprobo la estructura y firma JWT con un par de claves generado.
- Los iconos PWA (`icon-192.png`, `icon-512.png`) no estan generados.
- Solo XRP esta cableado de extremo a extremo en la interfaz y el control de ejecucion.
- El almacenamiento cifrado en IndexedDB no equivale al Keychain/Keystore del sistema operativo; un PWA no puede acceder a ellos.
- Las credenciales de exchange nunca deben incluir permiso de retirada; la app solo necesita lectura de saldos y creacion/cancelacion de ordenes.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el software maneja fondos reales: cualquier uso en produccion exige auditoria independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Lawless1987/Sentinel-Witness
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados al proyecto.
