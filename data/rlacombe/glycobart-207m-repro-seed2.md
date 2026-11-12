# rlacombe/glycobart-207m-repro-seed2

## Resumen

GlycoBART 207M (reproducción, semilla 2) es un checkpoint de PyTorch entrenado desde cero por Romain Lacombe (rlacombe) como parte de la reproducción del trabajo "GlycoGen: Glycan Structure Prediction with Crystallizing Flows", presentado en NeurIPS 2026. El modelo aborda la predicción de la estructura de glicanos a partir de datos de espectrometría de masas, un problema central en glicómica computacional donde la elucidación manual de estructuras es lenta y costosa.

Se trata de una reproducción del trabajo de Abtheen et al. (2025) evaluada sobre el benchmark CandyCrunch v2, con un objetivo de discrete flow matching. El checkpoint corresponde a la semilla aleatoria 2 de un conjunto de tres semillas, y reporta una precisión top-1 en el conjunto de test de 80,92% ± 0,31% (beam=1, media de 3 semillas) sobre 76.774 muestras.

Su relevancia radica en que proporciona un artefacto reproducible y abierto (licencia MIT) para un problema especializado, con código de inferencia publicado y particiones de benchmark accesibles, lo que facilita la verificación independiente de resultados en un dominio con escasa disponibilidad de modelos públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlycoBART (reproducción de Abtheen et al. 2025); detalles internos no disponibles |
| Parametros totales | 207M (según nombre del checkpoint) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de dominio científico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de una reproducción desde cero de la arquitectura GlycoBART descrita por Abtheen et al. (2025), entrenada con un objetivo de discrete flow matching sobre el benchmark CandyCrunch v2. El checkpoint publicado corresponde a la semilla de inicialización aleatoria 2, lo que sugiere que forma parte de un estudio de reproducibilidad con múltiples semillas (se reporta una media de 3 semillas con desviación de ±0,31%).

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset más allá de la referencia a CandyCrunch v2, ni sobre el uso de RLHF, DPO u otras fases de alineación. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o mecanismos de atención lineal. El repositorio ocupa 35,6 GB, lo que es notablemente superior a lo esperable para un modelo de 207M parámetros en precisión estándar, probablemente debido a la inclusión de estados de optimizador u otros artefactos de entrenamiento.

## Capacidades

- Predicción de estructura de glicanos a partir de espectros de masas (tarea principal).
- Generación de estructuras mediante discrete flow matching con decodificación por beam search (se reporta beam=1).
- Modelo de dominio especializado en glicómica y espectrometría de masas; no es un modelo de lenguaje general.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicables / no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Anotación automática de glicanos en pipelines de glicómica: el modelo predice estructuras directamente desde espectros, reduciendo la revisión manual en estudios de alto rendimiento con decenas de miles de muestras, como sugiere el tamaño del conjunto de test (76.774).
- Reproducción y verificación de resultados académicos: al ser un checkpoint con semilla fija y código publicado, permite a otros grupos replicar la precisión reportada (80,92% top-1) y auditar la metodología del paper original.
- Benchmarking de nuevos métodos de predicción de glicanos: sirve como línea base pública sobre las particiones de CandyCrunch v2 para comparar aproximaciones alternativas.
- Integración en herramientas de análisis de espectrometría de masas: puede incorporarse como módulo de inferencia en software de laboratorio que procese datos de MS/MS de glicanos.
- Docencia e investigación en glicómica computacional: modelo ligero (207M) y de licencia permisiva adecuado para experimentación académica sin restricciones comerciales.
- Desarrollo de modelos derivados: la licencia MIT permite fine-tuning sobre datasets propios de glicanos o adaptación a instrumentos o protocolos específicos de laboratorio.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| CandyCrunch v2 (test, n = 76.774) | Precisión top-1 estructural (beam=1) | 80,92% ± 0,31% (media de 3 semillas) |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), que por otra parte no serían aplicables a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 207M en FP32 se estiman en torno a 1 GB de pesos, aunque el repositorio de 35,6 GB incluye artefactos adicionales de entrenamiento.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería poder alojar los pesos en memoria.
- Compatibilidad con GPU consumer: probable por el tamaño del modelo, aunque no confirmado en la documentación.
- Opciones de despliegue: scripts de inferencia en el repositorio de GitHub (github.com/rlacombe/GlycoGen); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlycoBART 207M (repro, seed 2) | 207M | no disponible | 80,92% top-1 en CandyCrunch v2 | MIT | Hugging Face |
| Abtheen et al. (2025), original | no disponible | no disponible | no disponible en la información proporcionada | no disponible | no disponible |
| Otros modelos de predicción de glicanos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de dominio muy específico (glicómica y espectrometría de masas); no es un modelo de lenguaje general y no debe emplearse fuera de su tarea.
- El rendimiento reportado (80,92% top-1) implica que aproximadamente una de cada cinco predicciones es incorrecta; en producción conviene contemplar revisión humana o umbrales de confianza.
- No se documentan sesgos del dataset ni la composición de CandyCrunch v2, por lo que se desconoce su representatividad frente a glicanos de otras fuentes o instrumentos.
- Riesgo de alucinación estructural: el modelo puede generar estructuras plausibles pero incorrectas; no se han publicado métricas de calibración en la información disponible.
- La licencia MIT permite uso comercial, pero el modelo depende del cumplimiento de las condiciones de los datos de entrenamiento originales, no detalladas.
- El checkpoint corresponde a una única semilla (seed 2); para evaluaciones rigurosas conviene considerar las otras semillas del estudio.
- El tamaño del repositorio (35,6 GB) excede con mucho los pesos de inferencia, lo que puede complicar su descarga y almacenamiento en entornos limitados.
- No se especifican requisitos de versión de PyTorch ni dependencias, lo que puede dificultar la reproducibilidad del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rlacombe/glycobart-207m-repro-seed2
- Código e inferencia: https://github.com/rlacombe/GlycoGen
- Página del proyecto: https://rlacombe.github.io/GlycoGen/
- Dataset de benchmark: https://huggingface.co/datasets/rlacombe/candycrunch-v2-benchmark
