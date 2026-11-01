# neishap/payments-core

## Resumen

`neishap/payments-core` es un repositorio publicado en HuggingFace por el usuario `neishap` que, a pesar de su identificador y su alojamiento en la plataforma, no contiene pesos de un modelo de lenguaje ni ningun artefacto de aprendizaje automatico. La model card describe un sistema de software de pagos denominado "Payments Core v3", implementado en Python con FastAPI, que cubre contabilidad por partida doble, emision de tarjetas virtuales, motor de autorizacion ISO 8583, tarjetas regalo, nominas con retenciones federales de EE. UU., ficheros NACHA, mensajeria ISO 20022 para FedNow y Fedwire, cumplimiento KYC/OFAC, puntuacion de fraude, disputas, conciliacion bancaria y una cadena DAG de estilo IOTA.

El repositorio tiene un tamano declarado de 0.0 GB, cero descargas y cero likes, fue creado el 1 de noviembre de 2026 y actualizado tres segundos despues, lo que sugiere una publicacion automatizada o de prueba. No declara licencia, idiomas ni pipeline, y la unica etiqueta presente es `region:us`. La model card es en realidad un documento de arquitectura e implantacion ("Architecture and Go-Live Blueprint") fechado el 28 de octubre de 2026, con afirmaciones de que el codigo funciona y pasa 25 de 25 tests.

Por tanto, esta ficha no puede evaluar capacidades de inferencia, arquitectura de red neuronal, contexto, cuantizacion ni benchmarks: esos datos no existen en la informacion proporcionada. Lo que se documenta a continuacion es la naturaleza real del artefacto, sus modulos declarados y las advertencias pertinentes para quien lo encuentre buscando un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo de IA. Sistema de software de pagos en Python (FastAPI) con modulos de dominio; incluye una cadena DAG estilo IOTA |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio contiene codigo fuente Python, `Dockerfile`, `docker-compose.yml`, `.env.example` y un front end estatico |

## Arquitectura y entrenamiento

No hay entrenamiento ni arquitectura de red neuronal. El artefacto es una aplicacion de servidor con un unico punto de entrada API (`app/main.py`, FastAPI) protegido con claves bearer, cabeceras de idempotencia y rate limiting por clave. Los modulos de dominio declarados incluyen `app/ledger.py` (diario de partida doble en centavos enteros, retenciones, claves de idempotencia, balance de comprobacion siempre a cero), `app/cards.py` (PAN validos por Luhn, boveda AES-256-GCM, huellas HMAC-SHA256, CVV derivado y no almacenado, motor de decision estilo ISO 8583 con codigos de respuesta 00, 14, 51, 54, 57, 61, 62 y N7), `app/stored_value.py` (tarjetas regalo con codigos Crockford de 80 bits y vales), `app/payroll.py` (calculos IRS Pub 15-T de 2026, Seguridad Social al 6,2 % hasta la base de 184.500 USD, Medicare 1,45 % mas 0,9 % por encima de 200.000 USD, FUTA 0,6 % sobre los primeros 7.000 USD, horas extra FLSA), `app/nacha.py` (ficheros PPD de 94 caracteres, factor de bloqueo 10, validacion de digito de control ABA), `app/iso20022.py` (pacs.008.001.08 con cabecera head.001 y UETR), `app/compliance.py` (CIP, validacion de rangos de SSN almacenado como HMAC mas ultimos cuatro digitos, lista SDN del Tesoro con 39.688 entradas cargadas el 28 de octubre de 2026, cribado difuso de nombres, alertas CTR y de estructuraccion), `app/fraud.py` (puntuacion 0-100 por autorizacion con z-score de importe, velocidad, rafagas de rechazos, comercio nuevo, MCC de alto riesgo y horario nocturno; rechazo con codigo 59 por encima de 70), `app/disputes.py`, `app/ach_returns.py`, `app/reconciliation.py`, `app/tax_filings.py`, `app/ewa.py`, `app/kms.py` (llavero AES-256-GCM versionado con rotacion sin caida), `app/iso8583.py` (codec de bitmap, 0100/0110, servidor TCP con framing de 2 bytes), `app/chain.py` (DAG estilo IOTA con Ed25519, prueba de trabajo antispam en lugar de gas, acunacion firmada por coordinador, submonedas, NFT, airdrops y gossip P2P), `app/dex.py` (ordenes en escrow, swaps atomicos en un bloque, bot creador de mercado) y `app/bridge_onchain.py` (puente sin comisiones entre monedero de moneda y monedero de pagos).

La unica validacion numerica declarada en la model card es que el motor de nominas se comprobo contra la tabla mensual de tramos salariales del IRS de 2026 (fila de 2.245 a 2.275 USD: soltero 92 USD, casilla soltero 180 USD, casilla casado conjunta 92 USD) y coincide con un margen de 1 USD. No se documenta ningun proceso de entrenamiento, dataset, RLHF ni DPO.

## Capacidades

- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision ni ninguna capacidad de modelo de lenguaje.
- Contabilidad por partida doble con asientos equilibrados, retenciones y claves de idempotencia.
- Emision y gestion de tarjetas virtuales de ciclo abierto (BIN de patrocinador) y ciclo cerrado (prefijo privado), con congelacion y cierre.
- Decision de autorizacion con codigos de respuesta ISO 8583, bloqueos por MCC y comercio, limites por transaccion y diarios, captura y reversion.
- Tarjetas regalo con canje parcial y alcance por comercio, con minimo de cinco anos segun la CARD Act.
- Vales de descuento fijo o porcentual con limite de canjes, caducidad y registro como gasto promocional.
- Calculo de nominas con retenciones federales, Seguridad Social, Medicare, FUTA y horas extra FLSA.
- Generacion de ficheros NACHA PPD para deposito directo, prenotas y debitos.
- Construccion de mensajes ISO 20022 pacs.008.001.08 para FedNow y Fedwire.
- Puerta unica de salida bancaria por fichero, SFTP o HTTPS, con hash SHA-256 de cada fichero en la cadena de auditoria.
- KYC/CIP, cribado OFAC contra lista SDN, alertas de estructuraccion y CTR.
- Puntuacion de fraude por autorizacion y gestion de disputas con credito provisional Reg E.
- Conciliacion entre libro mayor y extracto bancario, con deteccion de descuadres en ambos lados.
- Presentaciones fiscales (Form 941, 940, calendario EFTPS, impuesto MBT de Nevada al 1,17 % por encima de 50.000 USD trimestrales, seguro de desempleo de Nevada sobre base de 43.700 USD).
- Acceso al salario devengado con anticipos gratuitos de hasta el 50 % del neto devengado.
- Cadena DAG sin comisiones, DEX con swaps atomicos y bot de creacion de mercado.

## Casos de uso

- Backend de emision de tarjetas virtuales para una fintech: el modulo `app/cards.py` genera PAN validos por Luhn, los guarda cifrados con AES-256-GCM y expone congelacion y cierre a traves de `/v1`, de modo que un equipo puede montar un programa de tarjetas de ciclo cerrado sin construir la boveda desde cero.
- Motor de autorizacion en tiempo real: `app/iso8583.py` implementa un servidor TCP con framing de 2 bytes y manejo de 0100/0110, adecuado para conectarse a un procesador que hable ISO 8583 y aplicar los codigos de respuesta 00, 51, 54, 57, 61, 62 y N7.
- Nomina de una plantilla en EE. UU.: `app/payroll.py` calcula retenciones con las tablas del IRS de 2026, Seguridad Social, Medicare, FUTA y horas extra, y `app/nacha.py` produce el fichero PPD que el banco patrocinador presenta a FedACH.
- Deposito directo y pagos instantaneos: la combinacion de NACHA para lotes y `app/iso20022.py` para pacs.008 permite cubrir tanto la liquidacion diferida como FedNow, con UETR y cabecera head.001.
- Programa de fidelizacion con tarjetas regalo y vales: `app/stored_value.py` emite codigos Crockford de 80 bits hasheados en reposo, admite canje parcial y aplica el minimo de cinco anos de la CARD Act, ademas de vales con limite de canjes contabilizados como gasto promocional.
- Cumplimiento y antifraude en el alta y en cada transaccion: `app/compliance.py` ejecuta CIP y cribado contra la lista SDN, mientras que `app/fraud.py` puntua cada autorizacion de 0 a 100 y rechaza con codigo 59 por encima de 70.
- Conciliacion y cierre contable: `app/reconciliation.py` cruza el libro mayor con el extracto bancario y marca descuadres en ambos lados, y `app/tax_filings.py` prepara Form 941, 940 y el calendario EFTPS.
- Despliegue en dos nodos: el `Dockerfile` y el `docker-compose.yml` permiten levantar una red de dos nodos con el panel `static/index.html` para demostracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada por el autor es que 25 de 25 tests pasan y que el motor de nominas coincide con la tabla del IRS de 2026 con un margen de 1 USD en la fila comprobada. No hay datos de latencia, throughput ni cobertura de tests mas alla de esa afirmacion.

## Requisitos de hardware

- No aplica VRAM ni GPU: el artefacto es una aplicacion Python que se ejecuta en CPU.
- Despliegue mediante `Dockerfile` y `docker-compose.yml` incluidos; el compose declara una red de dos nodos.
- Dependencias implicitas segun los modulos: FastAPI, criptografia (AES-256-GCM, HMAC-SHA256, Ed25519), cliente SFTP y cliente HTTPS para la puerta bancaria.
- No se especifican versiones de Python, imagenes base ni requisitos minimos de CPU o memoria.
- No hay datos de latencia ni throughput publicados.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA y no existe una categoria de "modelos similares" en el sentido de la ficha. Como referencia de categoria, se podria comparar con plataformas de core bancario y emision de tarjetas (por ejemplo, soluciones de ledger y procesamiento de pagos), pero la informacion proporcionada no incluye datos de esas alternativas ni permite una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no tiene pesos, contexto ni cuantizacion. Cualquier uso como modelo de IA es un error de identificacion.
- La model card es un documento de arquitectura y no una ficha de modelo; las afirmaciones de funcionalidad (25/25 tests, coincidencia con el IRS) proceden del autor y no se han verificado de forma independiente.
- El repositorio tiene 0.0 GB de tamano declarado, cero descargas y cero likes, y fue actualizado tres segundos despues de su creacion: indicios de publicacion automatizada o de prueba, sin evidencia de uso real.
- No se declara licencia. Sin licencia explicita no hay permiso claro para uso comercial, redistribucion ni modificacion; hay que contactar con el autor antes de cualquier uso en produccion.
- El sistema manipula datos altamente sensibles (PAN, SSN, nominas, claves API, secretos AES). La model card afirma cifrado AES-256-GCM, HMAC-SHA256, hash encadenado de auditoria y TOTP en acciones de administrador, pero no se aporta auditoria de seguridad externa, analisis de amenazas ni resultados de pentesting.
- El cumplimiento regulatorio descrito es especifico de EE. UU. (IRS Pub 15-T, NACHA, Reg E, CARD Act, OFAC, impuestos de Nevada). No cubre normativa europea como PSD2, GDPR o el reglamento de IA.
- La conexion con la Reserva Federal requiere una institucion depositaria con cuenta maestra y un banco patrocinador con cuenta FBO; el repositorio no sustituye esa relacion ni la certificacion del banco con el Fed.
- La cadena DAG descrita (estilo IOTA, con acunacion firmada por coordinador) es un componente experimental sin auditoria publicada; no debe tratarse como una red de produccion.
- Riesgo de alucinacion: no aplica al no ser un modelo generativo, pero la documentacion contiene afirmaciones muy detalladas sin trazabilidad verificable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/neishap/payments-core
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este artefacto.
