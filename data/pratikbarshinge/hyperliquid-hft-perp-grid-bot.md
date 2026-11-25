# PratikBarshinge/hyperliquid-hft-perp-grid-bot

## Resumen

El artefacto identificado como `PratikBarshinge/hyperliquid-hft-perp-grid-bot` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una supuesta aplicacion ejecutable para Windows (binario `.exe` empaquetado en un `.zip` de 4,8 MB) que se presenta como bot de trading de alta frecuencia sobre perpetuos en el exchange Hyperliquid. No contiene pesos, configuracion de arquitectura, tokenizador ni ningun artefacto propio de un modelo de lenguaje.

La model card del autor no describe ningun modelo: describe un instalador con contrasena de extraccion, enlaces a repositorios de GitHub de terceros y nombres de fichero que hacen referencia a un supuesto cheat para el videojuego Deadlock (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`). Esta discrepancia entre el nombre del repositorio, el contenido anunciado y el nombre real del binario es una senal de alarma clasica de campanas de distribucion de malware.

Por tanto, esta ficha no puede documentar arquitectura, parametros, contexto ni capacidades cognitivas: no existen. Lo que se documenta a continuacion es la naturaleza real del artefacto, sus riesgos y por que no debe desplegarse en ningun entorno, ni de desarrollo ni de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas declaradas en la model card, no capacidades linguisticas reales) |
| Licencia | MIT (declarada en metadatos; sin fichero LICENSE verificable en la informacion disponible) |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un ejecutable compilado para Windows 10/11 de 64 bits, distribuido como archivo comprimido de 4,8 MB protegido con contrasena (`2026`). La model card afirma un build `v4.8.1 (22837E)` y menciona subsistemas como un sandbox de paper trading, un empaquetador de 20 wallets mediante lookup tables, un filtro de honeypots, take profit multinivel, un motor de bundles Jito/MEV y una boveda local AES-256.

Estos componentes, de existir, corresponderian a un bot de trading on-chain, no a un modelo generativo. La terminologia mezcla conceptos de Hyperliquid (exchange de perpetuos en su propia L1) con conceptos de Solana (Jito, bundles, lookup tables, mint/freeze authority), lo que es tecnicamente incoherente: Hyperliquid no es una cadena Solana ni utiliza Jito. Esta inconsistencia refuerza la hipotesis de que el texto es plantilla generada para posicionamiento en buscadores y no una descripcion tecnica real.

## Capacidades

- No dispone de generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling en el sentido de una API de modelo.
- No implementa razonamiento multi-paso ni modo thinking.
- No tiene capacidades de vision ni audio.
- Las unicas "capacidades" declaradas son funcionalidades de trading (grid sobre perpetuos, gestion multi-wallet, take profit escalonado) sin evidencia verificable de implementacion.
- El binario se anuncia como portable y sin dependencias externas, lo que en la practica suele implicar ejecucion con privilegios elevados (la propia guia pide "Run as Administrator").

## Casos de uso

No se recomienda ningun caso de uso. A continuacion se enumeran los escenarios que el autor sugiere, junto con el motivo por el que resultan inaceptables en un entorno real:

- Trading automatizado de perpetuos en Hyperliquid: requeriria claves privadas de la wallet en el equipo local; el binario pide ejecucion como administrador y no hay codigo fuente ni auditoria, por lo que la exposicion de claves es total.
- Gestion de multiples wallets (20 wallets): implicaria custodiar y firmar transacciones con decenas de claves desde un ejecutable opaco, un riesgo directo de perdida de fondos.
- Ejecucion de bundles MEV/Jito: tecnicamente inaplicable en Hyperliquid y, en cualquier caso, asociado a practicas de extraccion de valor que pueden violar terminos de servicio.
- Paper trading: unico escenario con riesgo financiero nulo, pero sin valor si el binario no es auditable y puede ejecutar acciones distintas de las anunciadas.
- Uso como supuesto "cheat" de un videojuego: el nombre real del ejecutable apunta a un aimbot/ESP para Deadlock, lo que conlleva baneos de cuenta y, mas grave, la instalacion de software no verificado.
- Distribucion a terceros: redistribuir el binario ampliaria la superficie de ataque y podria constituir complicidad en la difusion de malware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`97,9%` de consistencia, `438 Hz` y `417 Hz` de polling, `< 14 ms` de respuesta, 14 y 16 hilos de trabajo) no son verificables, no se acompanan de metodologia y no corresponden a ninguna metrica estandar de evaluacion de modelos.

## Requisitos de hardware

- VRAM estimada: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10/11 de 64 bits.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles ni medibles sin el binario y sin especificacion de protocolo.
- Espacio en disco: 4,8 MB comprimido; el tamano descomprimido no se indica.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos similares" porque el artefacto no es un modelo. Frente a herramientas legitimas de trading algoritmico (por ejemplo, frameworks de backtesting en Python o clientes SDK oficiales de exchanges), la diferencia fundamental es que aqui no hay codigo fuente publico, no hay documentacion de API y no hay trazabilidad de builds.

| Criterio | Este artefacto | Cliente SDK oficial de un exchange | Framework de backtesting open source |
|---|---|---|---|
| Codigo fuente auditable | No | Si | Si |
| Pesos o modelo de IA | No | No aplica | No aplica |
| Gestion de claves | Boveda local opaca | Firmas locales documentadas | No custodia claves |
| Reputacion del autor | Sin historial (0 descargas, 0 likes) | Mantenido por el exchange | Comunidad verificable |
| Licencia | MIT declarada | Habitualmente permisiva | Variable |

## Limitaciones y advertencias

- Suplantacion de identidad del artefacto: el repositorio se llama `hyperliquid-hft-perp-grid-bot` pero el binario descargado se llama `deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, un supuesto cheat para un videojuego. La discrepancia indica enganno deliberado.
- Indicadores de malware: distribucion mediante ZIP con contrasena (evita el analisis automatico de antivirus), peticion de ejecucion como administrador, enlaces de descarga alojados en repositorios de GitHub de terceros no relacionados con el autor declarado y ausencia total de codigo fuente.
- Riesgo financiero: cualquier uso con claves reales de Hyperliquid o de otra cadena expone los fondos a robo inmediato e irreversible.
- Incoherencias tecnicas: mezcla Hyperliquid (L1 propia) con primitivas de Solana (Jito, lookup tables, mint/freeze authority), lo que sugiere texto generado automaticamente.
- Cero validacion social: 0 descargas y 0 likes en el momento de la consulta; sin issues, sin discusion, sin historial de versiones.
- Fecha de creacion anomala (2026-11-24) respecto a la numeracion de build anunciada.
- Licencia MIT declarada sin fichero de licencia verificable; en cualquier caso, una licencia permisiva no legitima la distribucion de software malicioso.
- Recomendacion operativa: no descargar, no extraer, no ejecutar y no integrar en ningun pipeline. Si ya se ha ejecutado, rotar todas las claves de wallet y API, revisar el equipo con herramientas de analisis forense y reportar el repositorio a Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PratikBarshinge/hyperliquid-hft-perp-grid-bot
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio GitHub citado como alternativo: https://github.com/thijs94244/hyperliquid-hft-perp-grid-bot/releases/latest
- Documentacion oficial de Hyperliquid (referencia para evaluar alternativas legitimas): https://hyperliquid.gitbook.io/hyperliquid-docs
- No se han encontrado papers, blogs tecnicos ni demos asociados al artefacto en la informacion proporcionada.
