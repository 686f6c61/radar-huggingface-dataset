# Ibnuisa/bybit-binance-perp-copytrade-bot-pc

## Resumen

La ficha solicitada corresponde al identificador `Ibnuisa/bybit-binance-perp-copytrade-bot-pc`, alojado en Hugging Face. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial ni de un modelo de lenguaje: es un repositorio que distribuye un ejecutable de Windows (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`, version `v2.8.3`) presentado como un bot de copytrading de futuros perpetuos para Bybit y Binance. No existe arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociados.

La model card no contiene especificaciones tecnicas de un modelo (parametros, contexto, cuantizacion, formato de pesos), sino instrucciones de descarga de un archivo ZIP de 4,8 MB protegido con contrasena, alojado en un repositorio de GitHub de terceros. El contenido mezcla terminologia de trading (take profit, enrutamiento de ordenes, bundles MEV, honeypot filter) con nombres de ficheros ajenos al dominio financiero (referencias a un supuesto trainer de Monster Hunter Wilds), lo que constituye una senal clara de empaquetado sospechoso.

Por tanto, esta ficha no puede documentar un modelo de IA: documenta un artefacto binario de procedencia dudosa. Se detallan a continuacion los datos disponibles y las advertencias correspondientes, sin inventar especificaciones tecnicas inexistentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El artefacto distribuido es un binario compilado para Windows 10/11 de 64 bits, empaquetado en un ZIP de 4,8 MB con contrasena `2026`. La model card describe modulos funcionales del supuesto bot (vault local AES-256, enrutamiento de ordenes por WebSocket y gRPC, motor de bundles Jito/MEV, filtro anti-honeypot, bundler de 20 wallets mediante Lookup Tables) con cifras de latencia declaradas (menos de 30 ms, 166 Hz de sondeo, menos de 40 ms de enrutamiento), pero no aporta ninguna evidencia verificable, codigo fuente ni auditoria.

No se documenta ningun dataset, ninguna fase de RLHF/DPO ni innovacion tecnica de aprendizaje automatico. La unica "innovacion" declarada es de naturaleza operativa (ejecucion multi-wallet en el mismo bloque), no relacionada con IA.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso basado en modelos.
- Las capacidades declaradas por el autor son operativas de trading: take profit multinivel, trailing stop, firma local de claves, enrutamiento de ordenes y filtro anti-honeypot.
- Ninguna de estas capacidades esta verificada de forma independiente ni respaldada por codigo publico auditable.

## Casos de uso

- No procede: al no ser un modelo de IA, no existen casos de uso de inferencia, generacion o analisis.
- El unico uso implicito es la ejecucion del binario en Windows para automatizar operaciones de trading, lo que conlleva riesgos graves de seguridad y financieros.
- Auditoria de cadena de suministro: el repositorio puede estudiarse como ejemplo de empaquetado malicioso o de ingenieria social dirigida a traders.
- Formacion en deteccion de amenazas: sirve como caso practico de indicadores de compromiso (contrasena en el README, binario renombrado con tematica de videojuegos, enlaces a repositorios de terceros).
- Analisis de politicas de Hugging Face: util para revisar como se cuelan artefactos no relacionados con IA en el Hub.
- No se recomienda ningun uso en produccion, ni financiero ni de otro tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de latencia y frecuencia que aparecen en la model card (menos de 30 ms, 166 Hz, 98,6 % de consistencia) son afirmaciones del autor sin metodologia, sin entorno de prueba y sin verificacion externa.

## Requisitos de hardware

- Sistema operativo: Windows 10/11 de 64 bits (Intel o AMD x64), segun la model card.
- VRAM: no aplica (no hay modelo neuronal).
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo con Windows x64; el paquete ocupa 4,8 MB.
- Opciones de despliegue: ejecucion directa del `.exe` como administrador, segun las instrucciones del autor; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no verificables.

## Comparativa con modelos similares

| Criterio | Este repositorio | Modelo de lenguaje open source tipico (p. ej., familia Llama o Mistral) | Bot de trading open source auditado |
|---|---|---|---|
| Naturaleza | Binario Windows empaquetado | Pesos de red neuronal | Codigo fuente auditable |
| Parametros | no disponible | Miles de millones | no aplica |
| Contexto | no disponible | Decenas de miles de tokens | no aplica |
| Rendimiento medible | Afirmaciones sin verificar | Benchmarks publicados | Backtests reproducibles |
| Licencia | MIT (declarada) | Licencias permisivas o comunitarias | Variables |
| Disponibilidad | ZIP en GitHub de terceros | Hugging Face, repos oficiales | GitHub con historial |

No se identifican alternativas comparables dentro de la categoria de modelos de IA, porque el artefacto no pertenece a ella.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de inferencia, generacion o razonamiento es infundada.
- Indicadores claros de riesgo: contrasena embebida en el README (`2026`), nombre de binario ajeno al dominio (`monster-hunter-wilds-trainer-mod`), enlaces de descarga alojados en repositorios de GitHub de terceros y discrepancias entre el nombre del repositorio y el del fichero.
- Posible malware: un ejecutable de trading sin codigo fuente, sin firma y distribuido con contrasena es un vector clasico de troyanos, stealer de credenciales o mineros.
- Riesgo financiero directo: un bot que maneja claves de exchange y ejecuta ordenes puede vaciar cuentas si el binario es malicioso o defectuoso.
- Riesgo de robo de claves: la model card menciona un "vault local AES-256" sin especificar implementacion ni permitir auditoria.
- Sin evidencia de auditoria de seguridad, de backtesting reproducible ni de historial de mantenimiento.
- Cero descargas y cero likes en el momento de la consulta, lo que contradice las insignias de "227K+ descargas" y "5.0/5" de la model card.
- La licencia MIT declarada no otorga ninguna garantia sobre el binario ni sobre su comportamiento.
- No usar en produccion, ni con claves reales de exchange, ni en equipos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ibnuisa/bybit-binance-perp-copytrade-bot-pc
- Repositorio de GitHub citado en la model card: https://github.com/amaxwell46/bybit-binance-perp-copytrade-bot-pc
- Repositorio de releases citado: https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026
- Enlace de descarga directa citado: https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Papers, blogs, demos o documentacion tecnica: no disponible
