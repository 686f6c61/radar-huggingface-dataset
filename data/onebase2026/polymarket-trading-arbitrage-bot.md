# onebase2026/polymarket-trading-arbitrage-bot

## Resumen

`onebase2026/polymarket-trading-arbitrage-bot` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face que distribuye un supuesto ejecutable para Windows (un binario `.exe` empaquetado en un ZIP de 8,9 MB) presentado como bot de arbitraje para la plataforma de mercados de predicción Polymarket. El autor de la cuenta es `onebase2026`, creada en noviembre de 2026, y el artefacto se publica bajo licencia MIT con etiquetas de sistema operativo (windows, windows-11, x64, portable) en lugar de etiquetas propias de un modelo (transformers, safetensors, pytorch).

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni tarjeta de modelo en el sentido habitual: la model card es en realidad una página promocional de descarga con instrucciones para extraer un ZIP protegido con contraseña (`2026`) y ejecutar el binario como administrador. No hay pipeline declarado, cero descargas y cero likes en el momento de la consulta, y el enlace de descarga apunta a un repositorio de GitHub de un tercero (`lucast752/polymarket-trading-arbitrage-bot`), no al propio Hugging Face.

Por tanto, esta ficha documenta un artefacto que no es evaluable como modelo de IA: no hay arquitectura, parámetros, contexto ni benchmarks que reseñar. El interés técnico es el de un caso de distribución de software potencialmente riesgoso (binario opaco, contraseña de archivo para evadir análisis automatizados, instrucciones de ejecución con privilegios elevados y desactivación implícita de alertas de SmartScreen), no el de un modelo open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card; no implican capacidades linguisticas de un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (artefacto distribuido: `polymarket-trading-arbitrage-bot-v1.2.0-win64.zip`, 8,9 MB, con `polymarket-trading-arbitrage-bot-v1.2.0-win64.exe` en su interior) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento que describir. El artefacto es un ejecutable nativo para Windows 10 (22H2) y Windows 11 (24H2) de 64 bits, empaquetado en un ZIP de 8,9 MB protegido con la contraseña `2026`. La model card menciona módulos funcionales del supuesto bot (take profit multinivel, bóveda local AES-256, filtro de honeypots, enrutamiento de órdenes por debajo de 40 ms, copia de wallets de ballenas y sandbox de paper trading) con métricas como «287 Hz de sondeo», «< 23 MB de RAM» o «97,9 % de consistencia», pero no se aporta ninguna evidencia verificable, código fuente ni metodología de medición.

El uso de una contraseña en el archivo comprimido es una técnica habitual para dificultar el análisis estático por parte de antivirus y escáneres de repositorios, y las instrucciones de la model card recomiendan explícitamente ejecutar el `.exe` como administrador y aceptar las advertencias de SmartScreen. No se especifica cadena de compilación, firma de código, hash verificable ni repositorio de origen auditable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingües de comprensión o generación; las etiquetas de idioma son metadatos del repositorio.
- El artefacto afirma implementar, como software de trading: enrutamiento de órdenes por WebSocket/gRPC, gestión de claves local, filtrado de tokens fraudulentos y simulación de estrategias.
- Ninguna de esas capacidades está verificada de forma independiente ni respaldada por código público auditable.

## Casos de uso

- No aplica como modelo de IA: no hay escenario de generación, razonamiento, visión, audio ni agentes que se pueda construir sobre este repositorio.
- Auditoría de seguridad: analizar el binario en un entorno aislado (sandbox, máquina virtual sin red) para determinar su comportamiento real antes de cualquier consideración de uso.
- Estudio de campañas de distribución: documentar el patrón de repositorios de Hugging Face que imitan model cards para distribuir ejecutables con contraseña y enlaces externos.
- Formación en higiene de cadena de suministro: usar el caso como ejemplo de por qué no se deben ejecutar binarios opacos con privilegios de administrador.
- No se recomienda ningún caso de uso operativo de trading: la ausencia de código fuente, firma y auditoría impide evaluar riesgos de custodia de claves y de ejecución de órdenes.
- No se recomienda su integración en pipelines de producción, CI/CD ni en entornos con acceso a wallets con fondos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (287 Hz, < 23 MB de RAM, < 9 ms, 97,9 % de consistencia) son afirmaciones del autor sin metodología, conjunto de datos ni reproducibilidad, y no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma requerida: Windows 10 22H2 o Windows 11 24H2, 64 bits, según la model card.
- Opciones de despliegue: ejecución nativa del `.exe` en Windows; no hay soporte de vLLM, llama.cpp, Ollama ni TGI porque no existe un modelo subyacente.
- Latencia y throughput: no disponibles de forma verificable; las cifras del autor no son auditables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. Frente a un LLM open source real (por ejemplo, un modelo de 7B a 70B con pesos safetensors, contexto declarado y benchmarks publicados), este repositorio carece de todos los elementos evaluables: pesos, arquitectura, tokenizador, licencia de uso de pesos y resultados reproducibles.

## Limitaciones y advertencias

- No es un modelo de IA pese a estar alojado en Hugging Face; las etiquetas y la model card simulan el formato de un modelo para atraer descargas.
- Binario opaco sin código fuente, sin firma de código y sin hash publicado: riesgo alto de malware, troyanos o robo de claves.
- El ZIP está protegido con contraseña (`2026`), técnica que dificulta el escaneo automático por antivirus y plataformas de análisis.
- Las instrucciones piden ejecutar como administrador y sortear las alertas de SmartScreen/Defender, lo que agrava el riesgo de compromiso del sistema.
- El enlace de descarga apunta a un repositorio de GitHub de un tercero no vinculado al autor de la cuenta de Hugging Face.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Afirmaciones de rendimiento (287 Hz, < 40 ms, 97,9 %) sin evidencia, datos ni metodología.
- Riesgo financiero directo: cualquier software que gestione claves de wallet o ejecute órdenes en Polymarket puede provocar pérdida de fondos; no hay auditoría de seguridad publicada.
- La licencia MIT se aplica al repositorio, pero no otorga ninguna garantía sobre el binario distribuido ni sobre su comportamiento.
- Se recomienda no descargar ni ejecutar el artefacto; si se hace por investigación, hacerlo en una máquina virtual aislada y sin credenciales ni wallets.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/onebase2026/polymarket-trading-arbitrage-bot
- Repositorio de GitHub referenciado en la model card (tercero, no verificado): https://github.com/lucast752/polymarket-trading-arbitrage-bot
- Releases del repositorio de GitHub referenciado: https://github.com/lucast752/polymarket-trading-arbitrage-bot/releases/latest
- Paper: no disponible
- Blog o demo oficial: no disponible
