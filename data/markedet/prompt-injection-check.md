# markedet/prompt-injection-check

## Resumen

`markedet/prompt-injection-check` no es un modelo generativo ni un LLM, sino un servicio HTTP de detección de inyección de prompts empaquetado como Space de HuggingFace con SDK Docker. Lo publica el usuario `markedet` y su función es analizar textos o URLs que un agente está a punto de consumir y devolver un veredicto (`safe`, `suspicious`, `injection`), una puntuación, las intenciones detectadas y evidencia por fragmento con desplazamientos en tres unidades distintas.

El problema que aborda es el vector de ataque más común en sistemas agénticos: contenido no confiable (correos, páginas web, resultados de herramientas) que contiene instrucciones destinadas a secuestrar el comportamiento del modelo. El servicio se vende por llamada mediante el protocolo x402, con pago en USDC sobre la red Base, a 0,01 USD por ítem y entre 1 y 20 ítems por petición.

Su rasgo diferencial es la determinismo: el modo por defecto `fast` son reglas deterministas para inglés, neerlandés y alemán, de modo que la misma entrada produce siempre la misma salida, algo verificable contra un conjunto de respuestas conocidas publicado y hasheado (24 casos). Existe un modo `full` que añade el clasificador abierto `protectai/deberta-v3-base-prompt-injection-v2` (Apache-2.0) en formato ONNX, aunque no está activo en la instancia gratuita por consumo de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Servicio HTTP (FastAPI/uvicorn) con motor de reglas deterministas; el modo `full` añade un clasificador transformer DeBERTa-v3-base exportado a ONNX |
| Parámetros totales | No disponible; el modo `fast` no usa pesos. El clasificador del modo `full` es `protectai/deberta-v3-base-prompt-injection-v2` (tamaño no indicado en la información) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. Límites operativos: 1 a 20 ítems por llamada, URLs de hasta 3 MB, tiempo de espera de 20 s por URL |
| Tipos de cuantización | No disponible. El modo `full` carga un modelo ONNX y su tokenizador desde `MODEL_DIR` |
| Idiomas soportados | Reglas en inglés, neerlandés y alemán (modo `fast`); el resto de idiomas no está cubierto por la información disponible |
| Licencia | MIT |
| Formato de pesos | No aplica en modo `fast` (reglas). En modo `full`, modelo ONNX más tokenizador, no incluidos en el repositorio |
| Entrada | `texts` (cadenas o `{id, text}`), `urls`, `mode` (`fast` por defecto), `threshold` (0,5), `includeSanitizedText` |
| Salida | Veredicto (`safe`, `suspicious`, `injection`), `score`, intenciones, `human_summary`, evidencia por span y `sanitized_text` opcional |
| Intenciones detectadas | `override`, `role_spoof`, `secret_request`, `bait_link`, `fake_order`, `fake_correction`, `hiding` |
| Precio | 0,01 USD por ítem, 1 a 20 ítems por llamada; importe cotizado en la respuesta 402 (`accepts[].extra`, `pricing`, cabeceras `X-Items` y `X-Price-Per-Item-USD`) |
| Pago | x402 v2 esquema `exact`, USDC en Base; por defecto Base Sepolia (`eip155:84532`), mainnet `eip155:8453` |
| Consumo de memoria | Unos 95 MB en modo `fast`; unos 1,2 GB en modo `full` |

## Arquitectura y entrenamiento

El componente principal es un motor de reglas deterministas, no un modelo entrenado. Cada petición a `POST /check` recorre los ítems y aplica patrones para detectar siete familias de intención: anulación de instrucciones previas, suplantación de rol, solicitud de secretos, enlaces cebo, órdenes falsas, correcciones falsas y ocultación de contenido. La salida incluye la evidencia localizada por span con desplazamientos en puntos de código Unicode, bytes UTF-8 y unidades de código UTF-16, lo que facilita integrar la detección tanto en pilas Python como JavaScript sin recalcular índices.

El modo `full` superpone a esas reglas el clasificador abierto DeBERTa-v3-base de Protect AI, servido vía ONNX Runtime. Requiere instalar `requirements-full.txt` y colocar modelo y tokenizador en `MODEL_DIR`; si el modelo no está presente, una petición en modo `full` se ejecuta como `fast` y el resultado lo declara explícitamente con `"mode": "fast"`. No se documentan en la información disponible datos de entrenamiento, volumen de tokens, composición del corpus ni fases de RLHF o DPO, porque el autor no entrena un modelo propio.

Como mecanismo de verificación, el servicio expone `GET /selftest`, que reproduce el conjunto `kat/known-answers-v1.2.jsonl` (24 casos) y devuelve el sha256, la puntuación y el resultado por caso. El hash de referencia publicado es `436eb4769aa06245b1bb4752392c4ea3525ef65a5de88adddf23e8a15952bd6b`. La descarga de URLs se restringe a http y https, solo direcciones públicas (se rechazan privadas, loopback y link-local, también tras redirecciones), con 3 MB y 20 s de límite.

## Capacidades

- Clasificación de inyección de prompts en textos y en contenido descargado de URLs, con tres niveles de veredicto y una puntuación continua.
- Etiquetado de intenciones: `override`, `role_spoof`, `secret_request`, `bait_link`, `fake_order`, `fake_correction` y `hiding`.
- Localización de evidencia por span con desplazamientos en puntos de código, bytes UTF-8 y unidades UTF-16, apta para resaltado en interfaces y para reescritura programática.
- Saneamiento opcional: `sanitized_text` devuelve el texto con los spans detectados eliminados, listo para pasarse a otro modelo.
- Resumen humano de una frase (`human_summary`) para registrar en logs o mostrar a operadores.
- Determinismo verificable en modo `fast`: misma entrada, misma salida, contrastable con un conjunto de respuestas conocidas hasheado.
- Autodiagnóstico sin coste mediante `/selftest`, `/health`, `/.well-known/x402` y `/discovery`.
- Procesamiento por lotes de 1 a 20 ítems por llamada, mezclando textos y URLs.
- Facturación por uso integrada con x402: cotización previa en la respuesta 402, rechazo gratuito con 422 ante entrada inválida y no liquidación de llamadas en las que fallan todos los ítems.
- Capacidades multimodales, de audio, de tool calling y de razonamiento multi-paso: no disponibles; es un servicio de clasificación, no un agente.

## Casos de uso

- Puerta de entrada en pipelines RAG: antes de indexar o de recuperar un fragmento de una página web, el pipeline llama a `/check` con la URL y descarta o sanea los documentos con veredicto `injection`, evitando que contenido envenenado entre en el índice vectorial.
- Agentes de correo electrónico: cada mensaje entrante se envía como ítem de texto y el agente solo actúa si el veredicto es `safe`; la intención `secret_request` permite además bloquear respuestas que intenten exfiltrar credenciales.
- Navegación autónoma: el agente somete cada URL a analizar y el servicio rechaza destinos privados, loopback o link-local antes de descargar, con lo que se cubre de paso parte del riesgo de SSRF; la intención `bait_link` marca enlaces señuelo.
- Saneamiento previo a un LLM: con `includeSanitizedText` se obtiene el texto sin los spans maliciosos, de modo que el modelo final recibe el contenido útil pero no las instrucciones incrustadas.
- Telemetría y auditoría de seguridad: almacenar veredicto, `score`, intenciones y offsets por span permite construir paneles de intentos de inyección por fuente, por tipo de contenido y por franja temporal.
- Evaluación comparativa de fuentes de contenido: procesar por lotes de hasta 20 ítems fragmentos de proveedores distintos y comparar la tasa de veredictos `suspicious` e `injection` antes de contratar una fuente de datos.
- Integración en plataformas de agentes con pago por uso: el agente paga 0,01 USD por ítem en USDC sobre Base mediante x402, sin alta ni clave de API, lo que encaja en flujos autónomos con micropagos.
- Soporte al cliente en inglés, neerlandés o alemán: filtrado de mensajes de usuarios que intentan redirigir al asistente antes de que el LLM conversacional los procese.
- Pruebas de regresión de seguridad: usar el conjunto de 24 casos conocidos y su hash como test automatizado en CI para verificar que un despliegue propio responde igual que la versión de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de clasificación (precisión, recall, F1, tasas de falsos positivos) en la información disponible. El único artefacto de evaluación documentado es el conjunto de respuestas conocidas:

| Artefacto | Contenido | Verificación |
|---|---|---|
| `kat/known-answers-v1.2.jsonl` | 24 casos con respuesta esperada para el modo `fast` | `GET /selftest` devuelve puntuación y sha256 por caso |
| `kat/SHA256SUMS` | Hash del conjunto | `436eb4769aa06245b1bb4752392c4ea3525ef65a5de88adddf23e8a15952bd6b` |
| `tests/smoke.py` | Prueba de humo contra una instancia | Se ejecuta contra la URL del despliegue |

No hay datos públicos de latencia ni de throughput, más allá del límite de 20 s por URL y del consumo de memoria declarado.

## Requisitos de hardware

- Modo `fast`: unos 95 MB de RAM; funciona en CPU sin GPU, incluido el plan gratuito de Render según el `render.yaml` incluido.
- Modo `full`: unos 1,2 GB de RAM por la carga del clasificador ONNX; sigue sin requerir GPU, pero excede la instancia gratuita.
- VRAM: no aplica en el escenario documentado, al no contemplarse despliegue en GPU.
- GPU recomendadas: no disponibles; el autor no documenta despliegue acelerado.
- Despliegue: `uvicorn server:app` (puerto 8407 por defecto con `python server.py`, `$PORT` en Render), contenedor Docker con puerto 7860 en el Space, o instancia propia en Render con health check en `/health`.
- Variables de entorno relevantes: `X402_PAY_TO` (obligatoria para `/check` y para arrancar en mainnet), `X402_NETWORK`, `X402_ALLOW_MAINNET`, `X402_FACILITATOR_URL`, `X402_PUBLIC_BASE_URL`, `X402_PRICE_PER_ITEM_USD`, `X402_MAX_ITEMS`, `DEFAULT_MODE`, `MODEL_DIR`, `PORT`.
- Para pruebas locales existe `X402_DEV_FREE=1`, que desactiva el muro de pago y se rechaza en mainnet.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Solución | Tipo | Licencia | Idiomas | Coste | Notas |
|---|---|---|---|---|---|
| `markedet/prompt-injection-check` | Servicio HTTP con reglas deterministas y clasificador opcional | MIT | EN, NL, DE en modo `fast` | 0,01 USD por ítem vía x402 | Salida con evidencia por span en tres unidades y saneamiento; sin rate limiting propio |
| `protectai/deberta-v3-base-prompt-injection-v2` | Clasificador transformer de pesos abiertos | Apache-2.0 | No disponible en la información | Gratuito, autohospedado | Es el clasificador que este servicio usa en modo `full`; requiere infraestructura propia y no aporta offsets por span |
| Meta Llama Prompt Guard | Clasificador de pesos abiertos | No disponible en la información | No disponible en la información | Gratuito, autohospedado | Alternativa habitual de la misma categoría; sin datos verificados en esta información |
| APIs comerciales de guardrails (por ejemplo Lakera Guard) | Servicio gestionado | Propietaria | No disponible en la información | Suscripción o por llamada | Sin datos verificados en esta información; no permiten verificar el motor con un conjunto de respuestas hasheado |

La diferencia principal frente a los clasificadores de pesos abiertos no es la calidad de detección, que no está medida públicamente, sino el modelo de distribución: servicio listo para usar, determinista, con micropagos por llamada y con un conjunto de verificación reproducible.

## Limitaciones y advertencias

- Las reglas detectan patrones conocidos; el propio autor advierte de que un veredicto `safe` no es una garantía de que el contenido sea inocuo.
- Solo hay reglas en inglés, neerlandés y alemán; el resto de idiomas queda sin cobertura declarada, lo que genera falsos negativos silenciosos en entornos multilingües.
- No hay limitación de tasa ni almacén de nonces en el servidor; la protección frente a repeticiones depende de que el facilitador rechace un nonce ya liquidado, lo que es un punto único de dependencia externo.
- Los datos publicados no incluyen métricas de precisión, recall ni falsos positivos, ni información sobre sesgos; no es posible estimar el coste de errores en producción sin evaluarlo por cuenta propia.
- El modo `full` no está activo en la instancia gratuita: si no se coloca el modelo ONNX en `MODEL_DIR`, las peticiones en modo `full` degradan a `fast` y el resultado lo indica con `"mode": "fast"`, algo que conviene verificar en el cliente.
- El conjunto de respuestas conocidas valida el modo `fast`, no el modo `full`.
- La licencia MIT cubre el código del servicio, pero el clasificador de terceros que se usa en modo `full` tiene su propia licencia (Apache-2.0) y debe cumplirse por separado.
- El uso comercial implica coste por ítem y dependencia de la red Base y del facilitador de x402; el precio se cotiza antes de pagar, pero no se documentan políticas de reembolso.
- El servicio descarga URLs externas; aunque filtra direcciones privadas, loopback y link-local, incluso tras redirecciones, conviene tratarlo como componente con acceso de red saliente y revisar la política de egress del despliegue.
- El puerto por defecto difiere según el método de arranque (7860 en el Space, 8407 con `python server.py`, `$PORT` en Render), lo que puede provocar fallos de conectividad si no se ajusta.
- El repositorio no almacena la dirección de cobro; sin `X402_PAY_TO` el endpoint `/check` no está operativo.

## Enlaces

- HuggingFace: https://huggingface.co/markedet/prompt-injection-check
- Protocolo x402: https://x402.org
- Clasificador usado en modo `full`: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- Conjunto de respuestas conocidas: `kat/known-answers-v1.2.jsonl` y `kat/README.md` (dentro del repositorio del Space)
- Verificación de hashes: `kat/SHA256SUMS` (`436eb4769aa06245b1bb4752392c4ea3525ef65a5de88adddf23e8a15952bd6b`)
- Prueba de humo: `tests/smoke.py`
- Endpoints de descubrimiento: `GET /.well-known/x402`, `GET /discovery`, `GET /health`, `GET /selftest`
- Repositorio de código fuente, paper y demo públicos: no disponibles en la información proporcionada
