# jvkkjkjk44/bybit-binance-perp-copytrade-bot-unlocked

## Resumen

No se trata de un modelo de inteligencia artificial. El repositorio `jvkkjkjk44/bybit-binance-perp-copytrade-bot-unlocked` alojado en Hugging Face no contiene pesos, arquitectura ni artefactos de aprendizaje automatico: es una publicacion que distribuye un supuesto ejecutable para Windows x64 (`solara-executor-v3-keyless-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB protegido con contrasena) presentado como bot de copytrading de futuros perpetuos en Bybit y Binance.

La model card no describe ninguna capacidad de inferencia: enumera modulos de enrutamiento de ordenes, gestion de claves, filtros de honeypot y motores de bundles MEV, es decir, funcionalidad propia de una herramienta de trading, no de un modelo de lenguaje. Los enlaces de descarga apuntan a un repositorio de GitHub de terceros (`schneider6972/solara-executor-v3-keyless-2026`) distinto del autor declarado, y el binario se solicita ejecutar como administrador.

Desde la perspectiva de evaluacion de modelos, el artefacto es irrelevante y presenta senales claras de riesgo de seguridad: ejecutable opaco, contrasena embebida en la propia documentacion, redireccion a un repositorio ajeno y ausencia total de codigo fuente verificable. Esta ficha documenta el repositorio como lo que es, senalando de forma explicita los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio, no capacidades del artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El contenido del repositorio es una model card con formato de pagina de descarga: instrucciones para extraer un ZIP con contrasena `2026` y ejecutar `solara-executor-v3-keyless-2026-v1.2.2-win64.exe` con privilegios de administrador. No se aporta informacion sobre datos, tokens, RLHF, DPO ni ninguna innovacion tecnica de modelado.

Los unicos detalles tecnicos mencionados corresponden al supuesto binario: compilacion `v4.6.5 (E3E2AE)`, arquitectura x64, compatibilidad declarada con Windows 10 y 11, y modulos descritos de forma generica (enrutamiento de ordenes por WebSocket y gRPC, almacen de claves AES-256 local, filtro de honeypot, motor de bundles Jito/MEV, take profit por niveles y copytrading de wallets). Ninguno de estos elementos es verificable y no se proporciona codigo fuente, hash de integridad ni firma digital.

## Capacidades

- No es un modelo generativo: no realiza generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso basado en modelos.
- No dispone de modo thinking, audio ni procesamiento multimodal.
- Las capacidades declaradas por el autor son funcionalidades de un bot de trading (enrutamiento de ordenes, gestion de claves, copytrading, take profit escalonado), no capacidades de IA, y carecen de evidencia tecnica en el repositorio.
- El multilinguismo se limita a etiquetas de metadatos; no hay interfaz ni modelo que lo respalde en la informacion disponible.

## Casos de uso

- Auditoria de seguridad de artefactos en Hugging Face: el repositorio sirve como caso de estudio de publicaciones que suplantan la categoria de modelo para distribuir ejecutables opacos.
- Formacion en higiene de cadena de suministro: ilustra patrones de riesgo como contrasena embebida, redireccion a un repositorio de GitHub ajeno al autor y solicitud de privilegios de administrador.
- Elaboracion de politicas de moderacion de plataformas: permite ejemplificar criterios de deteccion de contenido que no es un modelo (ausencia de pesos, de config.json, de tokenizer y de pipeline).
- Documentacion de taxonomias de repositorios: util para distinguir entre modelos, datasets, spaces y software empaquetado dentro de un mismo hub.
- Analisis de ingenieria social en documentacion tecnica: la model card imita el formato de fichas de modelos reales con insignias, tablas y botones de descarga.
- No se identifica ningun caso de uso legitimo de inferencia, entrenamiento o evaluacion de IA para este artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, y las cifras que aparecen en la model card (por ejemplo, 99,3 % de consistencia o 189 Hz de sondeo) corresponden a afirmaciones del autor sobre el supuesto bot, sin metodologia ni evidencia reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Requisitos del artefacto segun el autor: Windows 10 u 11 de 64 bits, 4,8 MB de espacio en disco para el ZIP y ejecucion como administrador. No se especifican dependencias ni requisitos adicionales.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoria de modelos de IA. Frente a repositorios legitimos de modelos, carece de pesos, configuracion, tokenizer, pipeline declarado y evaluaciones; frente a software de trading, no ofrece codigo fuente, auditoria ni firma digital verificable.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en comparativas de modelos.
- Riesgo de seguridad elevado: se distribuye un ejecutable de Windows que el autor pide ejecutar como administrador, sin hash publico, firma de codigo ni codigo fuente.
- El enlace de descarga apunta a un repositorio de GitHub (`schneider6972/solara-executor-v3-keyless-2026`) distinto del autor declarado en Hugging Face, lo que impide atribuir y verificar el origen del binario.
- La contrasena del archivo (`2026`) esta publicada en la propia model card, por lo que no aporta ninguna proteccion real y solo dificulta el analisis automatico por parte de antivirus y escaneres.
- La licencia MIT declarada no garantiza la legitimidad del contenido ni exime de responsabilidad al usuario que ejecute el binario.
- Las afirmaciones de rendimiento (sub-40 ms, 99,3 %, 189 Hz) no incluyen metodologia, y no se han publicado resultados reproducibles.
- Uso financiero: un bot de copytrading conlleva riesgo de perdida de capital; no hay evidencia de que el artefacto funcione como se describe.
- Posible suplantacion de categoria: el titulo y las insignias imitan una ficha de modelo para atraer descargas, un patron habitual en campanas de malware.
- Idiomas: las etiquetas multilingues son metadatos del repositorio y no implican soporte real en ninguna interfaz.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jvkkjkjk44/bybit-binance-perp-copytrade-bot-unlocked
- Repositorio de GitHub referenciado en la model card: https://github.com/schneider6972/solara-executor-v3-keyless-2026
- Repositorio de GitHub del autor declarado en la model card: https://github.com/DeborahHolland99/bybit-binance-perp-copytrade-bot-unlocked
- Enlace de descarga del ZIP citado: https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
- Paper, blog o demo: no disponible
