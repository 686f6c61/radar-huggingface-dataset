# Kobyko/bybit-binance-perp-copytrade-bot-2026

## Resumen

El repositorio `Kobyko/bybit-binance-perp-copytrade-bot-2026` de Hugging Face no contiene un modelo de inteligencia artificial. Se trata de una publicacion que empaqueta y distribuye un supuesto ejecutable de Windows (`bybit-binance-perp-copytrade-bot-2026-v1.2.0-win64.exe`, version `v2.2.8`, build `8F9611`) orientado a la operativa de copytrading en mercados de perpetuos de Bybit y Binance. La model card describe funciones de trading (sandbox de paper trading, take profit multinivel, enrutamiento de ordenes, filtros de honeypot, bundles MEV), no capacidades de lenguaje, vision ni razonamiento.

No existe arquitectura de red neuronal, pesos, tokenizador ni dataset de entrenamiento asociado. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) confirman que el artefacto es un binario para sistema operativo de escritorio, no un checkpoint de modelo. La licencia declarada es MIT, pero el contenido real es un instalador comprimido con contrasena.

Desde la perspectiva de evaluacion de modelos, esta ficha no puede cumplir los apartados tecnicos habituales (parametros, contexto, cuantizacion, benchmarks) porque no hay modelo subyacente. Se documenta el contenido tal como aparece, senalando explicitamente los datos no disponibles y las advertencias de seguridad relevantes para cualquier desarrollador que se encuentre con este tipo de publicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (artefacto distribuido como `.zip` de 8,9 MB con contrasena `2026`) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo. El artefacto es un binario portable para Windows 10/11 de 64 bits, distribuido como archivo `bybit-binance-perp-copytrade-bot-2026-v1.2.0-win64.zip` de 8,9 MB y protegido con la contrasena `2026`. La model card menciona un ejecutable `bybit-binance-perp-copytrade-bot-2026-v1.2.0-win64.exe` con build `v2.2.8 (8F9611)` y una supuesta compilacion `8F9611B109`.

No se documenta ningun proceso de entrenamiento, dataset, RLHF, DPO ni innovacion de inferencia. Las unicas referencias tecnicas del README son a mecanismos de trading: Lookup Tables para ejecucion multi-wallet, bundles Jito/MEV, filtros de honeypot por autoridad de mint/freeze y verificacion de bloqueo de liquidez, enrutamiento por WebSocket/gRPC y tiempos de respuesta declarados (< 12 ms, < 5 ms, < 40 ms) sin metodologia de medicion.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no traduce ni responde preguntas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso basado en IA.
- Las capacidades declaradas por el autor son funcionales de trading: sandbox de paper trading, take profit multinivel con trailing stop, bundler de 20 wallets, motor de bundles Jito/MEV, filtro pre-compra de honeypot y enrutamiento de ordenes.
- Los idiomas listados en metadatos (14 idiomas) corresponden a la documentacion del repositorio, no a capacidad multilingue de un modelo.
- No dispone de modo thinking, vision, audio ni ninguna modalidad de IA.

## Casos de uso

- No aplica como modelo de IA: no puede emplearse en generacion de texto, codigo, matematicas, vision ni atencion al cliente.
- Evaluacion de riesgo de cadena de suministro: un equipo de seguridad puede usar esta publicacion como caso de estudio de repositorios que suplantan la categoria "modelo" para distribuir ejecutables con contrasena y enlaces externos.
- Auditoria de repositorios de Hugging Face: util para construir reglas de deteccion de artefactos que no son modelos (tags de sistema operativo, ausencia de pesos, README con instrucciones de descarga externa).
- Formacion en higiene de dependencias: ejemplo docente de por que no ejecutar binarios descargados de un repositorio de modelos como administrador.
- Analisis de campanas de distribucion: el patron (badges con descargas infladas, contrasena en el README, enlace a un repositorio de GitHub ajeno al autor) sirve para entrenar clasificadores de contenido malicioso.
- No es adecuado para ningun caso de uso productivo de IA, trading real ni procesamiento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README incluye cifras de latencia autoinformadas (< 12 ms, < 5 ms, < 40 ms) y uso de memoria (< 27 MB de RAM), sin metodologia, hardware de referencia ni verificacion independiente; no constituyen benchmarks de modelo.

## Requisitos de hardware

- No aplica VRAM: no hay pesos ni inferencia de red neuronal.
- Plataforma objetivo declarada: Windows 10/11 de 64 bits (x64).
- El autor indica un consumo de RAM inferior a 27 MB para el modulo de take profit, dato no verificable.
- No requiere GPU (A100, H100, RTX 4090) para su funcionamiento declarado.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles, no aplicables.
- Latencia y throughput: solo cifras autoinformadas en el README, sin validacion.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque el artefacto no es un modelo de IA. Frente a un LLM open source tipico (pesos safetensors o GGUF, contexto declarado, benchmarks MMLU/HumanEval/GSM8K, licencia de modelo), este repositorio carece de todos esos atributos.

| Atributo | Este repositorio | Modelo de IA tipico en HF |
|---|---|---|
| Pesos | no disponibles | safetensors / GGUF |
| Parametros | no disponible | declarados |
| Contexto | no disponible | declarado |
| Benchmarks | no disponibles | MMLU, HumanEval, GSM8K |
| Formato de distribucion | ZIP con contrasena | repositorio de pesos |
| Proposito | supuesto bot de trading | inferencia de IA |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluacion como modelo carece de sentido tecnico.
- El README incluye instrucciones para descargar un ZIP de un repositorio de GitHub externo (`Berg44459/...`), extraerlo con contrasena y ejecutar un `.exe` como administrador; este patron es incompatible con las practicas seguras de suministro de software.
- Los badges de descargas (813K+) y de tamano no son verificables y no coinciden con las metricas reales del repositorio en Hugging Face (0 descargas, 0 likes).
- Riesgo elevado de malware, robo de credenciales de exchanges o fraude financiero; no se debe ejecutar el binario.
- La licencia MIT declarada no exime de responsabilidad sobre el contenido ni garantiza la legitimidad del binario.
- No hay informacion sobre sesgos, alucinacion ni limitaciones de contexto porque no hay modelo; esos apartados no aplican.
- El uso del artefacto para operar en mercados de perpetuos conlleva riesgo financiero directo y posible incumplimiento normativo segun jurisdiccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kobyko/bybit-binance-perp-copytrade-bot-2026
- Repositorio de GitHub referenciado en el README: https://github.com/Berg44459/bybit-binance-perp-copytrade-bot-2026
- Enlace de descarga directa citado en el README: https://github.com/Berg44459/bybit-binance-perp-copytrade-bot-2026/releases/latest/download/bybit-binance-perp-copytrade-bot-2026-v1.2.0-win64.zip
- Paper, blog, demo o documentacion tecnica: no disponible
