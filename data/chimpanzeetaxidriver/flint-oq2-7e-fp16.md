# chimpanzeetaxidriver/flint-oQ2.7e-fp16

## Resumen

flint-oQ2.7e-fp16 es una versión cuantizada en formato MLX del modelo base RecursiveSI/flint, publicada en Hugging Face por el usuario chimpanzeetaxidriver. No se trata de un modelo entrenado desde cero, sino de un checkpoint cuantizado mediante cuantización de precisión mixta con la herramienta oQ (oMLX v0.7.3.dev1), que consigue una media efectiva de 3,260 bits por peso sobre un modelo de 39.785 millones de parámetros.

El objetivo de esta versión es reducir drásticamente los requisitos de memoria del modelo original: mientras que en FP16 ocuparía unos 80 GB, este checkpoint ocupa 16,2 GB, lo que lo hace ejecutable en hardware de consumo, concretamente en equipos Apple Silicon compatibles con MLX. La cuantización de precisión mixta asigna más bits a las capas más sensibles (8 bits e incluso FP16) y menos bits a las menos críticas (2 y 3 bits), intentando preservar la calidad del modelo base.

La relevancia de este tipo de publicaciones radica en la creciente demanda de modelos grandes ejecutables localmente en Mac. No obstante, la ficha del repositorio es mínima: no documenta la arquitectura del modelo base, su longitud de contexto, los datos de entrenamiento ni los benchmarks, por lo que varias especificaciones quedan como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: RecursiveSI/flint) |
| Parametros totales | 39.785.299.488 (≈ 39,8B) |
| Parametros activos | no disponible (desconocido si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta: affine 2-bit (grupo 64), affine 3-bit (grupo 64), affine 8-bit (grupos 64 y 128), FP16; media efectiva de 3,260 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo base RecursiveSI/flint no está documentada en la model card del repositorio, por lo que no se puede confirmar si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) u otro tipo de arquitectura. El dato de parámetros totales (39,785B) procede directamente de los metadatos de los ficheros safetensors del repositorio, no de documentación oficial del autor.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no hay información disponible. Lo único documentado es el proceso de cuantización: se utilizó oQ (oMLX v0.7.3.dev1), una herramienta de cuantización de precisión mixta para MLX que distribuye los pesos entre distintos formatos según su sensibilidad. La distribución resultante es la siguiente: el 48,579% de los pesos (19,327B) en affine 2-bit con grupo 64, el 46,555% (18,522B) en affine 3-bit con grupo 64, el 4,060% (1,615B) en affine 8-bit con grupo 64, el 0,743% (0,296B) en affine 8-bit con grupo 128 y el 0,063% (0,025B) en FP16 sin cuantizar. El resultado ocupa 15,101 GiB (16,214 GB) en disco.

## Capacidades

- Generacion de texto: el modelo está etiquetado con el pipeline text-generation y orientado a uso conversacional (tag conversational).
- Ejecucion local en Apple Silicon: al estar en formato MLX, está pensado para inferencia en Mac mediante el framework MLX.
- Cuantizacion agresiva: la media de 3,260 bits/peso permite cargar un modelo de ~40B de parámetros en unos 16 GB de memoria.
- No hay informacion disponible sobre: capacidades de razonamiento, generación de código, matemáticas, visión o audio; soporte de tool calling o function calling; capacidades de agente o razonamiento multi-paso; ni alcance multilingüe.

## Casos de uso

- Chatbot local en Mac: al estar cuantizado para MLX, puede ejecutarse en un equipo Apple Silicon con suficiente memoria unificada (idealmente 24 GB o más) para asistentes conversacionales sin depender de la nube.
- Prototipado de LLM con privacidad: al ejecutarse íntegramente en local, es adecuado para procesar documentos o conversaciones sensatas que no deben salir del equipo del usuario.
- Experimentacion con cuantizacion de precision mixta: la detallada distribución de bits publicada lo hace útil como caso de estudio para comparar el impacto de la cuantización a 2/3 bits frente al modelo base en FP16.
- Pruebas de capacidad de memoria unificada: sirve para evaluar el rendimiento de MLX y de los chips Apple (M2/M3/M4) con modelos de ~40B parámetros cargados en 16 GB.
- Integracion en aplicaciones locales de escritorio: puede conectarse a interfaces como LM Studio o aplicaciones propias basadas en MLX para generación de texto offline.
- Evaluacion comparativa de checkpoints cuantizados: útil como referencia para medir la degradación de calidad entre cuantizaciones de 2,7 bits efectivas y formatos de 4 bits estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra prueba estandarizada, ni comparativas con el modelo base sin cuantizar.

## Requisitos de hardware

- Memoria necesaria: el checkpoint ocupa 16,214 GB (15,101 GiB); para inferencia conviene disponer de al menos 20-24 GB de memoria unificada (RAM del Mac) para acomodar pesos, KV cache y sistema operativo.
- Hardware recomendado: Mac con Apple Silicon (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max o superiores) con 24 GB de memoria unificada o más. No es un modelo pensado para GPUs NVIDIA, dado el formato MLX.
- Consumer hardware: cabe en Macs de gama alta con 24-32 GB de memoria unificada; no cabe cómodamente en equipos con 16 GB. No es ejecutable de forma nativa en GPUs de consumo convencionales (RTX 4090, etc.) sin conversión a otro formato.
- Despliegue: mediante el framework MLX (mlx-lm); potencialmente compatible con interfaces que soportan repositorios MLX. No hay evidencia de soporte directo en vLLM, TGI, llama.cpp u Ollama, ya que el formato de cuantización oQ es específico de oMLX.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flint-oQ2.7e-fp16 (este) | 39,8B | Mixta, 3,26 bits/peso efectivos | 16,2 GB | Apache 2.0 | Hugging Face, formato MLX |
| Qwen3-32B (cuantizado 4-bit MLX) | 32,8B | 4 bits | ≈ 18-19 GB | Apache 2.0 | Hugging Face, MLX y GGUF |
| Llama 3.3 70B (cuantizado 2-bit MLX) | 70,6B | ≈ 2 bits | ≈ 20 GB | Llama 3.3 Community License | Hugging Face, MLX y GGUF |
| Gemma 2 27B (cuantizado 4-bit MLX) | 27,2B | 4 bits | ≈ 15 GB | Gemma Terms of Use | Hugging Face, MLX y GGUF |

Nota: la comparativa es orientativa, ya que para el modelo de esta ficha no hay benchmarks que permitan contrastar rendimiento. En cuanto a licencia, flint-oQ2.7e-fp16 (Apache 2.0) es la más permisiva del grupo, junto con Qwen3.

## Limitaciones y advertencias

- Documentacion escasa: la model card no describe la arquitectura, el contexto, el entrenamiento ni las capacidades del modelo base RecursiveSI/flint, lo que dificulta evaluar su idoneidad antes de descargarlo.
- Cuantizacion agresiva: con un 48,6% de los pesos a 2 bits y un 46,6% a 3 bits, la degradación de calidad respecto al modelo en FP16 puede ser significativa, especialmente en razonamiento complejo, código y matemáticas. No hay evaluaciones que cuantifiquen esta degradación.
- Riesgo de alucinacion: al ser un modelo de generación de texto sin documentación de alineación (no consta RLHF ni DPO), el riesgo de respuestas incorrectas o inventadas es alto.
- Idiomas: no se especifican los idiomas soportados; no hay garantía de rendimiento en castellano.
- Contexto: la longitud de ventana de contexto es desconocida, lo que limita planificar aplicaciones con documentos largos.
- Formato especifico: la cuantización oQ requiere la herramienta oMLX; la compatibilidad con runtimes estándar (llama.cpp, vLLM, Ollama) no está garantizada.
- Procedencia: se trata de un repositorio de un usuario individual (306 descargas, sin likes), no de una organización verificada, por lo que conviene extremar la cautela en entornos de producción.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base RecursiveSI/flint debería verificarse por separado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chimpanzeetaxidriver/flint-oQ2.7e-fp16
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
