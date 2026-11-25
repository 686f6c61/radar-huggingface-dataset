# Megamidesu/hyperliquid-perp-market-maker-bot

## Resumen

El repositorio `Megamidesu/hyperliquid-perp-market-maker-bot` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face que, segun su model card, distribuye un supuesto bot de market making para perpetuos de Hyperliquid empaquetado como ejecutable de Windows (`blox-fruits-script-keyless-2026-v1.2.2-win64.exe`) dentro de un ZIP de 4,8 MB protegido con contrasena. No hay pesos, tokenizador, configuracion de arquitectura ni pipeline declarado; el campo `pipeline` aparece como no disponible y el repositorio acumula 0 descargas y 0 likes en la fecha de creacion indicada (2026-11-24).

La model card mezcla terminologia de trading algoritmico (routing de ordenes, paper trading, key vault AES-256, copytrade de smart money) con nombres de ficheros y enlaces que apuntan a repositorios de terceros no relacionados con el proyecto declarado, ademas de referencias a un supuesto script de un videojuego. Esta combinacion es caracteristica de campanas de distribucion de software no verificado, no de un modelo open source evaluable.

Desde la perspectiva de un desarrollador o investigador, este repositorio no es utilizable como modelo: no hay artefactos de inferencia, no hay documentacion tecnica verificable y la unica via de uso propuesta es ejecutar un binario de procedencia dudosa como administrador. La ficha se completa a continuacion con los datos disponibles, marcando explicitamente como no disponible todo aquello que la informacion proporcionada no permite confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto empaquetado como ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. La model card no documenta transformer, MoE, SSM ni ninguna otra topologia, ni tampoco corpus de entrenamiento, numero de tokens, proceso de alineamiento (RLHF, DPO) o innovaciones tecnicas de inferencia. El contenido se limita a una tabla de "subsistemas" del supuesto bot (paper trading, routing de ordenes, key vault local, take profit multinivel, filtro de honeypots, copytrade) con cifras de rendimiento no verificables (menos de 40 ms de routing, 234 Hz de polling, 99,1 % de consistencia) y sin metodologia de medida.

El unico "entrenamiento" implicito seria la configuracion de estrategias de market making, pero no se publica codigo fuente, ni ficheros de configuracion, ni resultados de backtesting reproducibles. Los enlaces de descarga apuntan a un repositorio de GitHub de un tercero (`JisungDiaz447/blox-fruits-script-keyless-2026`) cuyo nombre no guarda relacion con Hyperliquid, lo que impide atribuir el artefacto al autor declarado en Hugging Face.

## Capacidades

- No se puede confirmar ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision: no hay modelo subyacente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: los metadatos declaran 14 idiomas, pero no hay interfaz de lenguaje natural documentada que los ejercite.
- Capacidades especiales declaradas por el autor (no verificables): simulacion de paper trading, routing de ordenes por WebSocket/gRPC, firmado local de claves, take profit escalonado, filtro de honeypots y copytrade de wallets.
- No se documenta thinking mode, vision, audio ni ninguna modalidad adicional.

## Casos de uso

- Evaluacion de modelos: no aplica; el repositorio no contiene pesos ni artefactos de inferencia que puedan cargarse en vLLM, llama.cpp, TGI u otro runtime.
- Investigacion en trading algoritmico: no es un caso de uso valido porque no se publica codigo fuente, backtesting reproducible ni especificacion de la estrategia de market making.
- Despliegue en produccion: desaconsejado; la unica via propuesta es ejecutar un binario de Windows como administrador, sin firma de codigo verificable ni hash publicado.
- Formacion o docencia: sin utilidad, al no existir material tecnico contrastable.
- Integracion en pipelines de CI/CD: no aplica, no hay API, SDK ni contenedor documentado.
- Benchmarking comparativo: no aplica, no hay modelo que medir contra MMLU, HumanEval, GSM8K u otras suites.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (sub-40 ms de routing, 234 Hz de polling, 99,1 % de consistencia, menos de 48 MB de RAM) son afirmaciones del autor sin metodologia, sin entorno de medida y sin posibilidad de reproduccion, por lo que no deben tratarse como resultados de benchmark.

## Requisitos de hardware

- VRAM estimada: no disponible (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; el artefacto es un ejecutable de Windows x64.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, menos de 48 MB de RAM en el subsistema de paper trading, 9-10 hilos de trabajo. Sin verificacion independiente.
- Latencia y throughput: no disponibles de forma fiable.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos" comparable porque el repositorio no contiene un modelo de IA. Frente a herramientas reales de market making open source (por ejemplo, frameworks de trading algoritmico con codigo auditable), la diferencia fundamental es la ausencia de codigo fuente, de tests y de artefactos reproducibles.

| Criterio | Este repositorio | Modelo de IA tipico en HF | Framework de trading open source |
|---|---|---|---|
| Pesos / artefactos de inferencia | No | Si | No aplica |
| Codigo fuente auditable | No | Parcial (depende) | Si |
| Benchmarks reproducibles | No | Habitual | Habitual (backtesting) |
| Licencia | MIT (declarada) | Variable | Variable |
| Riesgo de ejecucion | Alto (binario sin firma) | Bajo | Bajo-medio |

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con las metricas habituales (perplejidad, MMLU, HumanEval) ni desplegarse en runtimes de inferencia.
- Inconsistencia entre el nombre del proyecto (Hyperliquid) y los enlaces de descarga (repositorio de un supuesto script de videojuego), senal tipica de artefacto no verificado o de campana de distribucion.
- Distribucion mediante ZIP con contrasena y ejecucion "como administrador": practica que dificulta el analisis por parte de antivirus y de revisores de seguridad.
- Ausencia de hash, firma de codigo o procedencia verificable del binario.
- Cero descargas y cero likes en el momento de la ficha: sin comunidad que haya validado el artefacto.
- La licencia MIT declarada afecta al contenido del repositorio, pero no garantiza nada sobre el binario enlazado desde un tercero.
- Riesgo de phishing, malware o robo de claves si se introducen credenciales de exchange en el supuesto key vault local.
- No debe usarse en produccion ni con fondos reales sin auditoria independiente del binario y del codigo fuente.
- Las capacidades multilingues declaradas no son verificables al no existir interfaz de lenguaje natural.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Megamidesu/hyperliquid-perp-market-maker-bot
- Enlace de descarga citado en la model card (tercero, no verificado): https://github.com/JisungDiaz447/blox-fruits-script-keyless-2026/releases/download/v1.2.0/blox-fruits-script-keyless-2026-v1.2.2-win64.zip
- Repositorio de releases citado en la model card: https://github.com/Demir426/hyperliquid-perp-market-maker-bot/releases/latest
- Documentacion oficial de Hyperliquid (referencia externa, no citada en la model card): https://hyperliquid.gitbook.io/hyperliquid-docs
