# OsamaAli313/genelens-qwen3-4b-promoter

## Resumen

GeneLens-Qwen3-4B-Promoter es un modelo especializado en genomics que parte de Qwen3-4B-Base y se afina mediante LoRA (con Unsloth) para una tarea binaria muy concreta: determinar si una ventana de 70 pares de bases de ADN humano corresponde a un promotor core o no. Lo desarrolla OsamaAli313 en el contexto del Qwen Pakistan Local Hackathon 2026, y se distribuye como adaptador PEFT (safetensors) junto con una versión cuantizada en GGUF pensada para ejecutarse en local mediante llama.cpp, sin GPU.

La propuesta no es competir con asistentes generalistas, sino ofrecer un especialista pequeño, medible y privado: la secuencia de ADN nunca sale de la máquina del usuario. El modelo base tiene 4.022.468.096 parámetros y una ventana de contexto la del propio Qwen3-4B-Base; el entrenamiento se hizo sobre 47.072 ventanas del benchmark GUE `prom_core_all` durante 2 épocas, con un LoRA de rango 32 (66,1 M de parámetros entrenables).

Su relevancia es acotada pero clara: demuestra que un modelo de lenguaje de 4B puede adaptarse con LoRA a una tarea de clasificación de secuencias biológicas y superar tanto a su versión zero-shot (MCC 0,092) como a un baseline clásico de k-mers (MCC 0,560), alcanzando MCC 0,711 en test. El autor lo declara explícitamente como uso de investigación, no como dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B-Base) con adaptador LoRA (PEFT); clasificación binaria sobre la salida del modelo |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-4B-Base); la tarea opera sobre ventanas de 70 bp |
| Tipos de cuantizacion | GGUF Q5_K_M (2,89 GB); el adaptador se distribuye en safetensors (bf16 LoRA) |
| Idiomas soportados | en (la tarea es sobre secuencias de ADN, no lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) y GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base, un transformer decoder-only denso de 4.022 millones de parámetros, y se adapta mediante LoRA de rango 32 entrenado con Unsloth en bf16 (66,1 M de parámetros entrenables sobre 4,09 B totales). El entrenamiento consistió en 2 épocas sobre 47.072 ventanas de 70 pares de bases del dataset GUE (`prom_core_all`), con el ADN tokenizado base a base (un token por nucleótido), y se ejecutó en Google Colab sobre GPUs L4 y A100. La tarea es de clasificación binaria: el modelo responde `1` (promotor core) o `0`.

No se documentan en la información disponible detalles sobre RLHF, DPO ni otras fases de alineamiento; el ajuste es supervisado sobre la tarea de clasificación. La innovación práctica del proyecto no está en la arquitectura del modelo, sino en el pipeline de producto: un adaptador LoRA ligero, exportación a GGUF Q5_K_M (2,89 GB) para inferencia en CPU con llama.cpp, y una aplicación de escritorio Electron que añade escaneo de secuencias largas, análisis por lotes y un bucle de aprendizaje local. El motor de inferencia escucha únicamente en loopback, sin telemetría ni descargas de modelos desde la app.

## Capacidades

- Clasificación binaria de ventanas de ADN de 70 bp como promotor core (`1`) o no promotor (`0`).
- Tokenización base a base (un token por nucleótido) para secuencias de ADN.
- Inferencia 100 % local y offline, sin dependencia de servicios en la nube.
- Ejecución en CPU sin GPU gracias a la cuantización GGUF Q5_K_M.
- Escaneo de secuencias largas mediante ventanas deslizantes (funcionalidad de la app que lo envuelve).
- Análisis por lotes de múltiples ventanas (funcionalidad de la app).
- Bucle de aprendizaje local (local learning loop) integrado en la aplicación de escritorio.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso en el sentido de un asistente general; es un clasificador especializado.

## Casos de uso

- Anotación rápida de promotores en borradores de genoma: dado un conjunto de ventanas de 70 bp, el modelo devuelve una etiqueta binaria por ventana, útil como primera pasada antes de validación experimental o con herramientas especializadas.
- Triaje privado de secuencias no publicadas: investigadores que no pueden subir ADN a servicios alojados pueden ejecutar el modelo en su propio portátil, ya que todo el procesamiento es local y sin telemetría.
- Docencia y formación en bioinformática: el instalador de Windows y la app de escritorio permiten a estudiantes experimentar con clasificación de promotores sin configurar entornos de GPU ni servicios cloud.
- Pre-filtrado en pipelines de secuenciación: integrado vía llama.cpp o el adaptador PEFT, puede descartar ventanas claramente no promotoras antes de pasos más costosos, reduciendo el volumen a analizar.
- Comparación de metodologías: sirve como referencia para evaluar si un enfoque basado en LLM con LoRA supera a baselines clásicos de k-mers en una tarea concreta de genómica.
- Prototipado de herramientas de escritorio con IA local: el proyecto demuestra un patrón replicable (adaptador LoRA + GGUF + Electron + motor en loopback) para aplicaciones científicas offline.
- Investigación sobre adaptación de dominio: útil para estudiar cómo un modelo de lenguaje general se especializa en secuencias biológicas mediante LoRA y tokenización base a base.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de test publicado de GUE `prom_core_all` (5.920 ventanas), métrica principal MCC con intervalos de confianza bootstrap estratificados al 95 %:

| Modelo / enfoque | MCC en test |
|---|---|
| GeneLens-Qwen3-4B-Promoter (media de 3 semillas) | 0,711 |
| Qwen3-4B-Base zero-shot (mismo modelo sin afinar) | 0,092 |
| Mejor baseline clásico de k-mers | 0,560 |

El autor sitúa el resultado en el extremo superior del rango publicado para especialistas (aproximadamente 0,64–0,73 MCC) y aclara explícitamente que no constituye una afirmación de estado del arte. No se proporcionan en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales, que además no aplicarían a esta tarea.

## Requisitos de hardware

- VRAM estimada: no aplica para la versión GGUF Q5_K_M, que corre en CPU; el adaptador PEFT en bf16 requiere cargar el modelo base Qwen3-4B-Base (aproximadamente 8 GB en bf16, estimación a partir del número de parámetros).
- GPU recomendadas: no se especifican; el entrenamiento se hizo en Google Colab con L4 y A100, pero la inferencia objetivo es en CPU.
- Cabe en GPU de consumo: sí, el modelo base de 4B en bf16 o cuantizado cabe en GPUs de consumo con suficiente VRAM; la distribución oficial prioriza CPU.
- Opciones de despliegue: llama.cpp con el GGUF Q5_K_M; PEFT/Transformers con el adaptador safetensors sobre Qwen3-4B-Base; aplicación de escritorio Electron incluida (instalador de Windows).
- Latencia y throughput: aproximadamente 3–6 segundos por ventana de 70 bp en una CPU de portátil con 4–6 hilos, según el autor.
- Tamaño en disco: 2,89 GB para el GGUF Q5_K_M; 6,3 GB para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GeneLens-Qwen3-4B-Promoter | 4,02 B (LoRA r=32, 66,1 M entrenables) | No disponible (ventanas de 70 bp) | Clasificación de promotores core | MCC 0,711 en test | Apache-2.0 | Hugging Face + instalador Windows |
| Qwen3-4B-Base zero-shot | 4,02 B | No disponible | Uso general | MCC 0,092 en la misma tarea | Apache-2.0 | Hugging Face |
| Baseline clásico de k-mers | No aplica | No aplica | Clasificación de promotores core | MCC 0,560 en test | No disponible | No disponible |
| Especialistas publicados en la tarea | No disponible | No disponible | Clasificación de promotores core | Rango aproximado 0,64–0,73 MCC | No disponible | No disponible |

No se dispone en la información proporcionada de comparaciones detalladas con otros modelos especializados concretos (por ejemplo, DNABERT-2 u otros) más allá del rango agregado citado por el autor.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor lo declara explícitamente como no dispositivo médico; no dice nada sobre enfermedad, variantes ni actividad promotora experimental.
- Tarea única y estrecha: solo responde si una ventana de 70 bp es promotor core o no; no es un chatbot ni un asistente general.
- Ventana fija de 70 bp: las secuencias más largas requieren escaneo por ventanas deslizantes, con las limitaciones que ello implica en contextos de borde.
- Rendimiento no estado del arte: el propio autor indica que MCC 0,711 está en el extremo superior del rango publicado pero no claramente por encima.
- Riesgo de falsos positivos y negativos inherente a un clasificador binario; no se documentan en la información disponible análisis de calibración ni de sesgos por tipo de secuencia.
- Idiomas: solo `en` declarado; irrelevante para la tarea de ADN pero limita cualquier uso colateral en lenguaje natural.
- Plataformas: el instalador de Windows está construido y verificado; la build de macOS está definida en CI pero nunca se ha ejecutado. El instalador no está firmado.
- Sin telemetría ni fallback a la nube: el motor escucha solo en loopback, lo que limita su uso a despliegues locales.
- Licencia Apache-2.0: permisiva para uso comercial según la licencia, pero el autor restringe el uso a investigación; conviene revisar esa discrepancia antes de un uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsamaAli313/genelens-qwen3-4b-promoter
- Instalador de Windows (releases): https://github.com/Osamaali313/genelens-qwen/releases
- Repositorio del proyecto: https://github.com/Osamaali313/genelens-qwen
- Informe de comparación de benchmarks: https://github.com/Osamaali313/genelens-qwen/blob/main/benchmarks/reports/final_comparison.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset GUE: https://huggingface.co/datasets/leannmlindsey/GUE
