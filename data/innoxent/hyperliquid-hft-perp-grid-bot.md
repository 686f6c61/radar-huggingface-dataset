# InnoXenT/hyperliquid-hft-perp-grid-bot

## Resumen

No existe un modelo de IA open source en el repositorio `InnoXenT/hyperliquid-hft-perp-grid-bot` de Hugging Face. El artefacto publicado es un binario ejecutable para Windows 10/11 de 64 bits (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, 4,8 MB) empaquetado en un ZIP protegido con contraseña, que se presenta como un bot de trading de alta frecuencia para perpetuos en Hyperliquid. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados al repositorio.

La model card no describe ningun modelo de lenguaje: describe un supuesto sistema de trading con modulos de paper trading, gestion multi-cartera mediante lookup tables, filtros anti-honeypot, take profit escalonado, bundles Jito/MEV y una boveda local de claves AES-256. Estos terminos pertenecen al dominio de trading de criptoactivos, no al de IA, y las cifras que se citan (97,9% de consistencia, 438 Hz de sondeo, menos de 14 ms de respuesta) no son verificables ni corresponden a metricas de modelos.

El repositorio presenta multiples indicios de ser un paquete malicioso o, como minimo, un anuncio enganoso: enlaces de descarga que apuntan a un repositorio de GitHub de terceros con nombre ajeno (`schedule-1-cheat-trainer`), contrasena de extraccion publicada en el propio README, instrucciones para ejecutar como administrador y para desactivar avisos de Windows Defender/SmartScreen, cero descargas y cero likes, y ausencia total de codigo fuente. Esta ficha documenta el artefacto para advertir de que no es un modelo de IA y de que no debe ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio; no aplicable a un modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. El artefacto es un ejecutable nativo de Windows de 64 bits distribuido como `schedule-1-cheat-trainer-v1.2.2-win64.exe` dentro de `schedule-1-cheat-trainer-v1.2.2-win64.zip` (4,8 MB, build etiquetada como `v4.8.1 (22837E)`). El tamano es incompatible con cualquier modelo de lenguaje actual, incluso los mas pequenos cuantizados a 4 bits, que ocupan cientos de megabytes.

No se documenta ningun proceso de entrenamiento, dataset, RLHF, DPO ni innovacion tecnica de IA. Las unicas "innovaciones" mencionadas pertenecen a un supuesto motor de trading (bundles Jito, lookup tables para ejecucion multi-wallet en el mismo bloque, boveda de claves AES-256 local), sin codigo fuente, sin auditoria y sin repositorio verificable.

## Capacidades

- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision: no es un modelo de IA.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los codigos de idioma del repositorio son metadatos de etiquetado.
- El README atribuye al binario funciones de trading (paper trading, gestion de 20 carteras, filtros anti-honeypot, take profit escalonado, bundles MEV, boveda de claves). Estas afirmaciones no estan verificadas y no deben considerarse capacidades reales del artefacto.

## Casos de uso

- Ninguno como modelo de IA: no se puede desplegar en vLLM, llama.cpp, Ollama ni TGI porque no contiene pesos.
- Auditoria de seguridad: el artefacto puede analizarse en un entorno aislado (maquina virtual sin red, sin credenciales) para determinar si el ejecutable realiza exfiltracion de claves, persistencia o mineria.
- Documentacion de riesgo para equipos de plataforma: sirve como ejemplo de repositorio de Hugging Face con apariencia de modelo pero con contenido binario y enlaces externos sospechosos.
- Formacion en higiene de cadena de suministro: ilustra patrones tipicos de distribucion de malware (ZIP con contrasena, instrucciones de ejecucion como administrador, indicaciones para desactivar antivirus, enlaces a repositorios de GitHub no relacionados).
- Analisis de politicas de moderacion: caso de estudio para reglas que detecten repositorios sin pesos ni configuracion en cuentas con cero actividad.
- No se recomienda ningun caso de uso operativo con el binario: ejecutarlo supone un riesgo directo para la seguridad del sistema y de las claves de trading del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras del README (97,9% de consistencia, 438 Hz de sondeo, 417 Hz, menos de 14 ms de respuesta, 14 y 16 hilos de trabajo) son afirmaciones de marketing sin metodologia, sin conjunto de datos y sin posibilidad de reproduccion; no constituyen benchmarks de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos reales del artefacto: Windows 10/11 de 64 bits, aproximadamente 4,8 MB de disco para el ZIP y el ejecutable extraido, y privilegios de administrador segun las instrucciones del autor.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto no es compatible con ningun runtime de inferencia.
- Latencia y throughput: no disponibles; las cifras del README no son verificables.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque el artefacto no es un modelo de IA. Frente a un LLM pequeno real (por ejemplo, un modelo de 1-3 mil millones de parametros en formato GGUF), las diferencias son absolutas: aquel incluye pesos, tokenizador, configuracion y licencia verificable; este solo incluye un ejecutable de 4,8 MB sin codigo fuente.

| Criterio | Este repositorio | Modelo de IA tipico en HF |
|---|---|---|
| Pesos | no disponibles | safetensors/GGUF |
| Configuracion y tokenizador | no disponibles | incluidos |
| Codigo fuente | no disponible | normalmente publicado |
| Reproducibilidad | nula | verificable |
| Riesgo de seguridad | alto (binario con contrasena y avisos de antivirus) | bajo |

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con MMLU, HumanEval, GSM8K ni ninguna otra prueba de modelos.
- Fuerte indicio de paquete malicioso: ZIP con contrasena, instrucciones para ejecutar como administrador, recomendacion de desactivar Windows Defender/SmartScreen y enlaces de descarga alojados en un repositorio de GitHub de terceros (`arjunzimmermann624/schedule-1-cheat-trainer`) ajeno al nombre del proyecto.
- Suplantacion de identidad: el nombre del ejecutable hace referencia a un "cheat trainer" de un videojuego, no a un bot de trading, lo que sugiere reutilizacion de un paquete previo.
- Cero descargas y cero likes en el momento de la consulta; cuenta sin historial verificable.
- Riesgo de robo de claves: el README menciona una "boveda local AES-256" y firma local de transacciones; un binario sin auditoria con acceso a claves privadas de Hyperliquid puede exfiltrarlas.
- Riesgo financiero: cualquier ejecucion con fondos reales puede derivar en perdidas totales; no hay evidencia de que las estrategias descritas funcionen.
- Licencia MIT declarada, pero sin codigo fuente la licencia carece de efecto practico sobre el binario.
- Riesgo legal y de cumplimiento: el trading de alta frecuencia con bundles MEV y multiples carteras puede infringir terminos de servicio de exchanges y normativa financiera segun la jurisdiccion.
- No debe ejecutarse en equipos personales ni en entornos con credenciales. Si se analiza, hacerlo en una maquina virtual desechable, sin red y sin acceso a carteras.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/InnoXenT/hyperliquid-hft-perp-grid-bot
- Enlace de descarga citado en el README (repositorio de terceros, no verificado): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Repositorio de GitHub citado en el README (no verificado): https://github.com/thijs94244/hyperliquid-hft-perp-grid-bot
- Paper, blog, demo o repositorio de codigo del supuesto modelo: no disponible
