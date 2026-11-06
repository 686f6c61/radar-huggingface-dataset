# HlibPlakhtii/microduck-tug-cup-v5

## Resumen

`microduck-tug-cup-v5` es una política de control para robótica orientada a la simulación de combates de Microduck, un entorno de agentes físicos desarrollado por Pollen Robotics. El modelo no es un LLM ni un modelo generativo de texto: es una red de política (policy network) entrenada por self-play que se exporta en formato ONNX y se ejecuta como controlador dentro del simulador. Lo publica HlibPlakhtii como un fine-tune derivado de `azukiq/microduck-titan-v1`, sobre el que se aplica un adaptador de control descrito en `adapter-config.json`.

La contribución del autor no es el entrenamiento de la red heredada, sino la integración de un adaptador de bajos parámetros (28 generaciones de CMA-ES sobre 14 sesgos de salida y 13 offsets de entrada de comandos) y la validación mediante réplicas exactas de combates. El modelo base conserva sus pesos y su normalizador de observaciones sin cambios; solo se modifica la capa de adaptación.

Su relevancia es acotada y experimental: se trata de una entrada de competición de simulación, con resultados locales documentados pero sin validación oficial de torneo. La model card insiste explícitamente en que los resultados locales no constituyen una reclamación de campeonato y que el resultado oficial del torneo es la autoridad final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política por self-play (base `azukiq/microduck-titan-v1`) con adaptador de control CMA-ES; exportación ONNX |
| Parametros totales | no disponible (red heredada + adaptador de 14 sesgos y 13 offsets) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje) |
| Licencia | no disponible; el autor declara no reclamar licencia sobre contribuciones upstream sin licencia |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es una red de política entrenada por self-play por el autor original (azukiq) para el entorno Microduck. El modelo heredado incluye una red y un normalizador de observaciones que, según la model card, permanecen byte-idénticos en todos los inicializadores heredados. Sobre esa base, HlibPlakhtii aplica un adaptador que consiste en la media final de una distribución CMA-ES tras 28 generaciones, optimizando 14 sesgos de salida y 13 offsets de entrada de comandos. No se modifican los pesos de la red ni el normalizador.

El proceso de validación se basa en réplicas exactas de observaciones: cinco replays de rating reproducen ambos patos y la cuerda exactamente, y 16 combates de estilo Cup reproducen el controlador general tras aplicar el overlay. La selección final se hizo con 768 combates completos por finalista (generación 14: 584/768; media final: 594/768; punto medio: 595/768) y una validación independiente de 1000/1280 victorias (78,1%) frente a 976/1280 de la generación 14. El autor reconoce incertidumbre estadística significativa en estos finalistas tan próximos.

## Capacidades

- Control de política en simulación física de combates Microduck, no generación de lenguaje.
- Ejecución como controlador ONNX dentro del simulador Arena de Pollen Robotics.
- Adaptación de comandos mediante offsets de entrada y sesgos de salida.
- Réplica exacta de trayectorias de rating documentadas (cinco replays verificados).
- Paridad verificada entre el controlador genérico y el empaquetado en 16 combates Cup.
- Rendimiento medido contra 28 oponentes públicos y contra `titan-v1` en semillas fijas.
- No soporta tool calling, agentes, multilingüismo ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Evaluación de políticas de robótica en simulación: el modelo se carga como controlador ONNX en el simulador Microduck para medir su tasa de victorias frente a oponentes públicos con semillas fijas y reproducibles.
- Investigación en optimización de adaptadores: sirve como ejemplo documentado de ajuste de una política preentrenada mediante CMA-ES sobre un conjunto reducido de parámetros (27 en total), sin tocar los pesos de la red.
- Reproducibilidad de experimentos: los ficheros `local-verification.json`, `source.json` y `RATING_NOTICE` permiten replicar las trayectorias y los combates de paridad, útil para auditoría de resultados en competiciones de simulación.
- Benchmarking de oponentes: al compararse contra 28 oponentes públicos y contra `titan-v1` en 512 combates por configuración, puede usarse como referencia fija en la evaluación de nuevas políticas.
- Docencia en sistemas multiagente: el caso ilustra self-play, selección de finalistas con incertidumbre estadística y la distinción entre validación local y resultado oficial de torneo.
- Integración en pipelines de simulación a gran escala: al ser ONNX y de tamaño reducido (repo de 0,0 GB), es viable ejecutar muchos combates en paralelo para estudios de robustez.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Replays de rating (5 exactos) | 167,50347733498 cm y cinco victorias por pit |
| Combates Cup compilados vs `titan-v1` (semillas y lados idénticos) | 406/512 (79,3%) frente a 392/512 (76,6%) de la generación 14 |
| Test de campo público (combates completos) | 462/464 (448/448 contra los otros 28 oponentes públicos; 14/16 contra `titan-v1`) |
| Selección fija final (768 combates por finalista) | Generación 14: 584/768; media final: 594/768; punto medio: 595/768 |
| Validación independiente (dos lotes emparejados) | 1000/1280 (78,1%) frente a 976/1280 de la generación 14 |

No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un LLM. Los datos anteriores son métricas de simulación declaradas por el autor.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y la red es de tamaño reducido, por lo que la inferencia ONNX debería caber en CPU o en GPUs de gama baja, aunque no se documentan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamaño del artefacto, pero no confirmada en la información disponible.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) dentro del simulador Microduck; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HlibPlakhtii/microduck-tug-cup-v5` | Política de control ONNX | `azukiq/microduck-titan-v1` | Adaptador CMA-ES + validación de rating | no disponible | Hugging Face |
| `HlibPlakhtii/microduck-tug-quicksilver-v5` | Política de control (remix de competición) | `anhalu/microduck-remix-for-fun-v1` | Remix atribuido con nueva observación | no disponible | Hugging Face |
| `azukiq/microduck-titan-v1` | Red de política self-play | — | Red base sin adaptador | no disponible | Hugging Face |

No se dispone de datos de parámetros, contexto ni benchmarks comparables entre estas entradas más allá de los combates head-to-head reportados por el autor.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes.
- Los resultados son de simulación; el autor declara explícitamente que no se reclama ningún campeonato oficial y que el resultado del torneo es la autoridad final.
- Incertidumbre estadística significativa: la diferencia entre finalistas es de un solo combate en la selección fija (594 frente a 595 de 768), lo que el propio autor califica de no concluyente.
- Un participante privado no estaba disponible para las pruebas locales, por lo que la cobertura de oponentes es incompleta.
- Licencia no disponible; el autor no reclama licencia sobre contribuciones upstream sin licencia, lo que genera incertidumbre para uso comercial o redistribución.
- Sesgos conocidos: no documentados; al ser una política de simulación, los sesgos relevantes serían de comportamiento frente a oponentes no vistos, no de contenido.
- Riesgo de sobreajuste a las semillas y oponentes probados: los tests locales son evidencia sobre oponentes y semillas concretos, no una garantía de generalización.
- Idiomas y contexto: no aplica; el modelo no procesa entradas lingüísticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-v5
- Modelo base: https://huggingface.co/azukiq/microduck-titan-v1/tree/13b975bb1a15fbdb4d6bf78170220a91a99aa7a5
- Perfil del autor: https://huggingface.co/HlibPlakhtii
- Remix relacionado: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v5
- Ficheros de verificación citados en la model card: `adapter-config.json`, `source.json`, `RATING_BASE_CARD.md`, `RATING_NOTICE`, `local-verification.json` (disponibles en el repositorio del modelo)
