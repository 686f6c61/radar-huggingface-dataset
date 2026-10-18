# NorviTech/armiger-swarm-priors

## Resumen

`NorviTech/armiger-swarm-priors` es el plugin numero 2 de la suite modular Armiger de NorviTech. No es un modelo de lenguaje ni una red neuronal: es un motor de priors bayesianos empiricos escrito en Python, sin dependencias externas, con un artefacto de 29,4 KB (`swarm_priors.py`). Se publica en HuggingFace con el pipeline tag `tabular-classification` y se distribuye tambien empaquetado dentro de `NorviTech/armiger-ultra`.

El modulo resuelve un problema concreto en pipelines de ingestión y ranking de releases: separar la senal de "enjambre" (seeders, leechers, completados, dominios de tracker) de la senal de contenido (categoria, release group, codec, resolucion), de forma que la viabilidad de descarga se pueda puntuar sin alterar nunca la categoria predicha del contenido. Para ello implementa cuatro rutas de senal estrictamente separadas, dropout de modalidad obligatorio, extraccion de features de anomalia y un filtro de sanitizacion de passkeys de trackers publicos.

Su relevancia actual es practica: encaja como capa de features y de ranking en herramientas de automatizacion autoalojadas (Sonarr, Radarr, Prowlarr, BitAgent, Bitmagnet) y como generador de variables para un modelo tabular de clasificacion. La model card no declara arquitectura neuronal, parametros, contexto ni corpus de entrenamiento, porque no aplican a este tipo de artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de priors bayesianos empiricos en Python puro; 4 rutas de senal separadas; sin red neuronal ni transformer |
| Parametros totales | no aplica (no hay pesos neuronales; artefacto de codigo de 29,4 KB) |
| Longitud de contexto | no aplica (la entrada es un conjunto de campos estructurados: titulo, lista de fuentes, tamano, lista de ficheros, seeders, leechers, completados, categoria) |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | no disponible (los metadatos de HuggingFace no declaran idiomas; el parseo de titulos es multilingue por necesidad, pero no se documenta cobertura) |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplica; se distribuye como codigo fuente Python (`swarm_priors.py`) e incluido en `NorviTech/armiger-ultra` |
| Dependencias | cero dependencias declaradas |
| Pipeline tag | `tabular-classification` |
| Funciones publicas | `compute_sampling_priority_weight`, `extract_way2_source_features`, `extract_way3_anomaly_features`, `compute_swarm_viability` |
| Rango de salida de viabilidad | `[0.0, 1.0]` calibrado |
| Dropout de modalidad | `p` en `[0.50, 0.70]`, valor por defecto `0.60` |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-18 (actualizado 2026-10-18) |

## Arquitectura y entrenamiento

El modulo no entrena una red neuronal. Implementa inferencia bayesiana empirica sobre estadisticas agregadas de scraping de trackers: las afinidades por release group, codec, resolucion y dominio de tracker se suavizan por shrinkage antes de usarse como prior, de modo que las categorias con pocas observaciones se contraen hacia la media global en lugar de sobreajustar. La ruta 2 aplica dropout de modalidad obligatorio con `p` entre 0,50 y 0,70 (por defecto 0,60) y declara invarianza estricta a `seeders == 0`, lo que evita que la ausencia de senal de enjambre contamine las features de contenido. Las cuatro rutas estan separadas de forma deliberada: priorizacion de muestreo (ruta 1), priors de dominio y release group (ruta 2), features de anomalia (ruta 3) y viabilidad ortogonal de enjambre (ruta 4).

La ruta 3 calcula z-scores de inflacion de seeders, desajustes entre tamano declarado y resolucion, e indicadores de trampa por ejecutables o accesos directos, orientados a la deteccion de `junk` y malware. La ruta 4 produce un multiplicador de viabilidad calibrado en `[0.0, 1.0]` para el ranking de releases en Sonarr, Radarr y Prowlarr, sin modificar en ningun caso la categoria de contenido predicha. Adicionalmente, el modulo incorpora un filtro de sanitizacion de passkeys de trackers publicos antes de que esos datos se registren o se persistan.

No se documenta en la informacion disponible el volumen del corpus de scraping, su composicion, ni si hubo etapas de ajuste tipo RLHF o DPO; estos conceptos no encajan en un motor de priors y la model card no los menciona. Tampoco se detalla el mecanismo exacto de calibracion de la ruta 4 mas alla de que la salida es un multiplicador calibrado.

## Capacidades

- Extraccion de features de prior por dominio de tracker publico, release group, codec y resolucion, con suavizado por shrinkage.
- Dropout de modalidad obligatorio (`p` configurable en `[0.50, 0.70]`) e invarianza declarada frente a `seeders == 0`.
- Calculo de features de anomalia: z-score de inflacion de seeders, desajuste tamano-resolucion, indicadores de ejecutables y accesos directos.
- Calculo de un multiplicador de viabilidad de descarga calibrado en `[0.0, 1.0]`, ortogonal a la categoria de contenido.
- Priorizacion de colas de muestreo activo por incertidumbre y demanda en ingestas BitAgent y Bitmagnet.
- Sanitizacion de passkeys de trackers publicos.
- Generacion de variables para un modelo tabular de clasificacion (pipeline `tabular-classification`).
- Ejecucion determinista y sin dependencias externas, apta para entornos con restricciones de instalacion.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni uso como agente. No es un modelo de lenguaje.

## Casos de uso

- **Ranking de releases en Prowlarr, Sonarr y Radarr:** `compute_swarm_viability` devuelve un multiplicador en `[0.0, 1.0]` que se puede aplicar como factor de ordenacion sobre los resultados de busqueda, priorizando releases con enjambre sano sin tocar el `category` ya asignado por el clasificador.
- **Deteccion de junk y malware en la ingesta:** `extract_way3_anomaly_features` permite marcar automaticamente releases con seeders inflados de forma anomala, tamanos incompatibles con la resolucion declarada o ficheros ejecutables y accesos directos, antes de que entren en la cola de descarga.
- **Priorizacion de colas de muestreo activo:** `compute_sampling_priority_weight` ordena los elementos de una cola de ingesta en BitAgent o Bitmagnet por incertidumbre y demanda, de modo que el etiquetado manual o la verificacion se concentren en los casos de mayor valor informativo.
- **Sanitizacion de logs y datasets de trackers publicos:** el filtro de passkeys elimina credenciales embebidas en anuncios y URLs de tracker antes de persistir el scrape, lo que reduce el riesgo de filtrar secretos en datasets compartidos o en registros de depuracion.
- **Generacion de features para un clasificador tabular:** las salidas de las rutas 2 y 3 se pueden concatenar como columnas adicionales de un modelo tabular de clasificacion de releases, aportando senal de procedencia y de anomalia que el texto del titulo no captura.
- **Deteccion de trampas de honeypot en trackers abiertos:** combinando el z-score de seeders con el ratio completados/seeders se pueden aislar enjambres artificiales con alta recall, segun el enfoque descrito para el plugin hermano de supervivencia.
- **Auditoria de releases con poco enjambre:** en mirrors con cobertura desigual, la ruta 2 aporta priors de afinidad por dominio para estimar si un release concreto es plausible en un tracker determinado aunque no haya observaciones directas.
- **Integracion como plugin en Armiger o Armiger Ultra:** el modulo se importa directamente (`from swarm_priors import ...`) y se puede pre-empaquetar en el binario de Armiger Ultra para despliegues autoalojados sin instalacion de dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modulo `armiger-swarm-priors` en la informacion disponible. La model card incluye cifras de rendimiento de los plugins hermanos de la suite, que se recogen aqui unicamente como contexto y no deben atribuirse a este modulo:

| Plugin de la suite | Artefacto | Metrica declarada en la model card |
|---|---|---|
| `armiger-swarm-survival` | `163 KB` | 96,83 % AUROC de vivacidad de enjambre (frente a 53,04 % con seeders en bruto); 100,0 % de recall en trampas de malware con seeders falsos; 0 % de cambio de categoria de contenido |
| `armiger-zero-cue-catalog` | `26,8 MB` | 99,46 % de exactitud Movie-vs-TV; 98,48 % de exactitud en 11 clases; catalogo offline de 926.785 claves |
| `armiger-audio-guard` | `4,2 KB` | 98,72 % en Gold Standard; 99,88 % en casos limite de audio |
| `armiger-calibration-dht` | `8,5 KB` | 99,95 % de exactitud balanceada en junk con puertas conformales de Mondrian |
| `armiger-swarm-priors` | `29,4 KB` | no disponible |

## Requisitos de hardware

- VRAM: no aplica. El modulo es codigo Python puro de 29,4 KB sin pesos ni tensores; se ejecuta en CPU.
- GPU: no necesaria. Cualquier maquina capaz de ejecutar Python sirve, incluidas Raspberry Pi y contenedores de 64 MB de memoria.
- GPU de consumo: irrelevante para este artefacto; no hay aceleracion por hardware que aporte ventaja.
- Despliegue: importacion directa del modulo, vendorizado en el repositorio del proyecto, o uso a traves de `armiger-ultra` que lo incluye pre-empaquetado. vLLM, llama.cpp, Ollama y TGI no aplican.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al no haber dependencias externas ni operaciones matriciales densas, el coste esperado es el de un conjunto de operaciones escalares y agregaciones, pero no se publica medicion alguna.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion disponible: no es un modelo de lenguaje y no compite con LLMs. La comparacion relevante es con los otros plugins de la misma suite, que cubren funciones adyacentes y comparten licencia y filosofia de despliegue:

| Artefacto | Tamano | Funcion principal | Incluido en Armiger Ultra | Licencia |
|---|---|---|---|---|
| `armiger-swarm-priors` | 29,4 KB | Priors bayesianos de enjambre y release group, features de anomalia, viabilidad de descarga | Si (`swarm_priors.py`) | Apache-2.0 |
| `armiger-swarm-survival` | 163 KB | Supervivencia de enjambre y adaptador residual anti-honeypot | Si (`swarm_adapter.pt`, `swarm_survival.py`) | Apache-2.0 |
| `armiger-zero-cue-catalog` | 26,8 MB | Catalogo offline de desambiguacion y reglas estructurales | Si (`zero_cue_plugin.py`, JSON) | Apache-2.0 |
| `armiger-calibration-dht` | 8,5 KB | Calibracion conformal por cabeza y actualizador DHT BEP-44 firmado con Ed25519 | Si (`calibration.json`) | Apache-2.0 |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no admite tool calling. Cualquier uso en ese sentido es un error de encuadre.
- Los priors dependen de los datos de scraping de trackers con los que se construyeron; no se documenta el corpus, su fecha de captura ni su cobertura geografica, por lo que la vigencia de las afinidades por dominio no esta garantizada.
- La calibracion del multiplicador de viabilidad de la ruta 4 no viene acompanada de metricas publicas en esta ficha; conviene validarla contra el trafico real antes de usarla como unico criterio de ranking.
- La sanitizacion de passkeys es una salvaguarda de mejor esfuerzo: no hay garantia formal de cobertura sobre todos los formatos de anuncio o de URL de tracker.
- Sesgo potencial hacia los dominios de tracker y los release groups sobrerrepresentados en el corpus de scraping; los release groups poco frecuentes reciben priors contraidos hacia la media por el shrinkage.
- La viabilidad estimada no mide calidad, legalidad ni idoneidad del contenido; solo plausibilidad del enjambre. No debe interpretarse como aval del material descargado.
- Los metadatos de HuggingFace no declaran idiomas soportados y el modulo no expone una lista de idiomas; la cobertura linguistica del parseo de titulos es desconocida.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion con obligacion de conservar el aviso de copyright, el archivo LICENSE y las clausulas de patentes; no hay restricciones adicionales declaradas.
- El uso del modulo en el contexto de descarga de contenido puede tener implicaciones legales segun la jurisdiccion; la licencia del software no cubre el contenido que se indexe con el.

## Enlaces

- [HuggingFace: NorviTech/armiger-swarm-priors](https://huggingface.co/NorviTech/armiger-swarm-priors)
- [Armiger Ultra (incluye este plugin pre-empaquetado)](https://huggingface.co/NorviTech/armiger-ultra)
- [Armiger (CPU)](https://huggingface.co/NorviTech/armiger)
- [Plugin hermano: armiger-swarm-survival](https://huggingface.co/NorviTech/armiger-swarm-survival)
- [Plugin hermano: armiger-zero-cue-catalog](https://huggingface.co/NorviTech/armiger-zero-cue-catalog)
- [Plugin hermano: armiger-audio-guard](https://huggingface.co/NorviTech/armiger-audio-guard)
- [Plugin hermano: armiger-calibration-dht](https://huggingface.co/NorviTech/armiger-calibration-dht)
- [Sitio de NorviTech](https://norvitech.com)
- [Repositorio Helios](https://github.com/spencercnorton/helios)
- [Repositorio BitAgent](https://github.com/spencercnorton/bitagent)
- [Repositorio XNote](https://github.com/spencercnorton/xnote)
- [Repositorio XNote Placement](https://github.com/spencercnorton/xnote-placement)
- [Repositorio SnipSnap](https://github.com/spencercnorton/snipsnap)
- [Repositorio Conductor](https://github.com/spencercnorton/conductor)
- [Repositorio Norvi OS](https://github.com/spencercnorton/norvi-os)
