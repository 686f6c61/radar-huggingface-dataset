# dkhoi9999/bybit-binance-perp-copytrade-bot-2026

## Resumen

No se dispone de informacion tecnica que permita describir este repositorio como un modelo de IA. El identificador `dkhoi9999/bybit-binance-perp-copytrade-bot-2026` corresponde a un artefacto alojado en Hugging Face cuyos metadatos lo etiquetan como `windows`, `windows-11`, `x64` y `portable`, y cuya model card describe un supuesto ejecutable de Windows para copia de operaciones en perpetuos de Bybit y Binance, no un modelo de lenguaje, vision o multimodal.

La model card incluye afirmaciones sobre un binario `monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe` de 4,8 MB, un archivo ZIP protegido con contrasena y enlaces de descarga alojados en repositorios de GitHub de terceros. Estos elementos no guardan relacion con pesos de red neuronal ni con un pipeline de inferencia, y el nombre del binario remite a un supuesto mod de un videojuego, lo que resulta incoherente con el proposito declarado.

No existe informacion sobre arquitectura, parametros, contexto, cuantizacion ni datos de entrenamiento. Los resultados de busqueda web proporcionados tratan sobre la validez de pasaportes canadienses y no aportan ningun dato relevante sobre el artefacto. Por tanto, esta ficha documenta la ausencia de informacion verificable y advierte de los riesgos de seguridad asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA identificable) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del autor) |
| Licencia | MIT (segun metadatos del autor) |
| Formato de pesos | no disponible (el autor menciona un ejecutable `.exe` y un archivo `.zip`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura de red neuronal, dataset de entrenamiento, numero de tokens procesados ni tecnicas de alineacion como RLHF o DPO. El contenido de la model card describe funcionalidades propias de una aplicacion de escritorio para trading (sandbox de paper trading, take profit escalonado, bundler de 20 wallets, motor de bundles Jito/MEV, filtro de honeypot y enrutado de ordenes con latencias declaradas inferiores a 40 ms), sin ninguna referencia a pesos, tokenizador o proceso de entrenamiento.

Las cifras de rendimiento que aparecen en la model card (menos de 12 ms de respuesta, menos de 27 MB de RAM, 11 y 13 hilos de trabajo) corresponden a afirmaciones del autor sobre el ejecutable, no a metricas de un modelo. No se ha podido verificar su veracidad ni existe documentacion tecnica que las respalde.

## Capacidades

- No se ha identificado ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision o audio.
- No se ha identificado soporte de tool calling ni function calling en el sentido de un modelo de lenguaje.
- No se ha identificado soporte de agentes ni razonamiento multi-paso.
- El autor declara compatibilidad multilingue en los metadatos (14 idiomas), pero no se aporta evidencia de funcionalidad linguistica alguna.
- Las unicas funcionalidades descritas son operativas de una aplicacion de trading: sandbox de paper trading, take profit multi-nivel, bundler multi-wallet, motor de bundles Jito/MEV, filtro de honeypot y enrutado de ordenes por WebSocket y gRPC.

## Casos de uso

- No procede. Al no tratarse de un modelo de IA identificable, no es posible proponer casos de uso de inferencia (generacion de texto, codigo, atencion al cliente, RAG, agentes, etc.).
- El artefacto se presenta como una herramienta de escritorio para copia de operaciones en perpetuos, pero su naturaleza real no esta verificada y no se recomienda su ejecucion.
- Cualquier evaluacion de uso deberia limitarse a un analisis de seguridad en entorno aislado, sin ejecutar el binario en un equipo de produccion ni introducir credenciales de exchange.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las unicas cifras declaradas por el autor son latencias y consumo de recursos del supuesto ejecutable (menos de 12 ms, menos de 5 ms, menos de 40 ms, menos de 27 MB de RAM), sin metodologia, sin entorno de prueba y sin verificacion independiente. No se presentan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos de modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles.
- El autor declara como requisito una estacion de trabajo Windows de 64 bits (Windows 10 u 11) y un ejecutable de 4,8 MB, sin especificar CPU, RAM ni almacenamiento minimos.
- Latencia y throughput: solo cifras declaradas por el autor, no verificadas.

## Comparativa con modelos similares

No disponible. No se ha identificado ningun modelo de IA comparable, ya que el artefacto no presenta caracteristicas de modelo (parametros, contexto, pesos, pipeline). Tampoco se dispone de artefactos equivalentes verificables en la misma categoria para establecer una comparacion tecnica.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: los metadatos y la model card describen un ejecutable de Windows, no pesos ni un pipeline de inferencia.
- Incoherencia entre el nombre del binario (`monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe`) y el proposito declarado (bot de copia de operaciones), lo que constituye una senal de alarma.
- Distribucion mediante un ZIP protegido con contrasena (`2026`) y alojado en repositorios de GitHub de terceros no vinculados al autor del repositorio de Hugging Face; practica habitual en campanas de malware.
- Solicitud de ejecucion como administrador, lo que amplia el impacto potencial de cualquier codigo malicioso.
- Cero descargas y cero likes en el momento de la consulta, sin historial que permita validar el artefacto.
- La licencia MIT declarada en los metadatos no garantiza la legitimidad ni la seguridad del contenido distribuido.
- Riesgo de phishing, robo de credenciales de exchange y de claves API si se introduce informacion sensible en la aplicacion.
- No se debe ejecutar el binario en equipos de produccion ni en entornos con acceso a wallets o cuentas de exchange reales.
- No se ha verificado ninguna de las capacidades, latencias ni cifras de rendimiento declaradas por el autor.
- Los resultados de busqueda web disponibles no guardan relacion con el artefacto y no aportan informacion tecnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dkhoi9999/bybit-binance-perp-copytrade-bot-2026
- Repositorio de GitHub citado en la model card: https://github.com/Berg44459/bybit-binance-perp-copytrade-bot-2026
- Enlace de descarga citado en la model card: https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Paper: no disponible
- Blog o documentacion tecnica: no disponible
- Demo: no disponible
