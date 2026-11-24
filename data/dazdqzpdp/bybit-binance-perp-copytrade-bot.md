# DAZDQZPDP/bybit-binance-perp-copytrade-bot

## Resumen

No existe un modelo de IA en el repositorio `DAZDQZPDP/bybit-binance-perp-copytrade-bot` de Hugging Face. El identificador corresponde a un repositorio que distribuye un supuesto ejecutable de Windows (`pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe`, build `v3.3.1`) empaquetado en un archivo ZIP de 4,8 MB protegido con contraseña. La model card no describe arquitectura neuronal, pesos, tokenizador ni dataset alguno: es material promocional de un binario orientado a trading de perpetuos.

El texto se presenta como una herramienta de copytrading entre Bybit y Binance con módulos de "Jito & MEV bundle engine", "20-wallet LUT bundler", "paper-trade sandbox" y "honeypot filter", entre otros. Ninguna de estas supuestas capacidades viene respaldada por código fuente, artefactos de modelo ni resultados verificables. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

Desde el punto de vista de evaluacion de modelos, esta ficha no puede cumplir su proposito habitual: no hay modelo que evaluar. Lo que sigue documenta la ausencia de especificaciones tecnicas reales y advierte de los riesgos de seguridad asociados a la distribucion de ejecutables ofuscados con contrasena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, sin relacion con capacidades linguisticas de un modelo) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal, ni proceso de entrenamiento, ni datos de preentrenamiento, ajuste supervisado o RLHF. El artefacto publicado es un ejecutable para Windows 10/11 de 64 bits, distribuido como ZIP de 4,8 MB con contrasena `2026`. La model card menciona "14 worker threads", "367 Hz polling", "< 32 ms" de respuesta y "< 62 MB" de RAM, pero se trata de cifras de marketing sin metodologia de medida ni codigo que las respalde.

El nombre del paquete (`pump-fun-jito-bundler-sniper-bot`) no coincide con el nombre del repositorio (`bybit-binance-perp-copytrade-bot`), y los enlaces de descarga apuntan a repositorios de GitHub de terceros (`carlos7088/...`, `Cruz2083/...`). Esta inconsistencia entre identificadores es una senal de alarma clasica en campanas de distribucion de software malicioso.

## Capacidades

- No se ha documentado ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay soporte verificable de tool calling ni function calling.
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingues reales; los idiomas listados son etiquetas de metadatos.
- Las supuestas funciones descritas en la model card (bundler de 20 wallets, filtro de honeypots, sandbox de paper trading, vault AES-256) no son capacidades de un modelo y no estan verificadas por ninguna fuente independiente.

## Casos de uso

No procede. Un binario de trading de perpetuos sin auditoria, sin codigo fuente y distribuido con contrasena no es un componente adecuado para ningun caso de uso en produccion, investigacion ni docencia. Los escenarios que la model card insinua (copytrading automatizado, ejecucion atomica de bundles, simulacion de estrategias) implican riesgo financiero directo y no cuentan con evidencia tecnica que los sustente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`96,3 %` de consistencia, `367 Hz`, `< 32 ms`, `< 62 MB`) carecen de definicion de metrica, conjunto de prueba y metodologia, por lo que no son comparables con ningun benchmark estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos declarados del binario: Windows 10/11 de 64 bits, ~4,8 MB de archivo comprimido y menos de 62 MB de RAM segun el autor (no verificado).
- Latencia y throughput: cifras no verificables.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos" comparable porque el artefacto no es un modelo de lenguaje ni un sistema de IA. Cualquier comparacion con LLM open source (Llama, Mistral, Qwen, DeepSeek, etc.) seria categorialmente incorrecta.

## Limitaciones y advertencias

- El repositorio no contiene pesos, tokenizador ni codigo de inferencia; no es un modelo de IA pese a estar alojado en Hugging Face.
- El ejecutable se distribuye comprimido con contrasena (`2026`), practica que impide el analisis automatico por parte de antivirus y motores de sandbox, y que es habitual en campanas de malware.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros no vinculados al autor del repositorio de Hugging Face, lo que dificulta la trazabilidad de la cadena de suministro.
- El nombre del paquete no coincide con el nombre del repositorio, y la model card mezcla terminologia de trading de Solana (Jito, MEV, pump.fun) con la de exchanges centralizados (Bybit, Binance), lo que resulta incoherente.
- Uso comercial: la licencia MIT declarada permitiria teoricamente el uso comercial, pero al no existir codigo fuente ni artefacto verificable, esa licencia no aporta garantia alguna sobre el binario distribuido.
- Riesgo financiero y de seguridad: ejecutar software de trading no auditado, con permisos de administrador y acceso a claves de API de exchanges, puede derivar en robo de fondos, exfiltracion de credenciales o instalacion de persistencia maliciosa.
- No se debe ejecutar el binario en un equipo con cartera activa ni con credenciales de exchange configuradas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DAZDQZPDP/bybit-binance-perp-copytrade-bot
- Enlace de descarga citado en la model card (terceros): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026/releases/download/v1.2.0/pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (terceros): https://github.com/Cruz2083/bybit-binance-perp-copytrade-bot/releases/latest
- Paper, blog, demo o repositorio oficial del supuesto modelo: no disponible.
