# mradermacher/Granite_42_30b_Abliterated-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con matriz de importancia (imatrix) del modelo Granite 4.2 30B Abliterated, creadas por mradermacher. El modelo original, desarrollado por ChonkE, es una versión "abliterated" del Granite 4.2 30B de IBM, un modelo de lenguaje denso con capacidades nativas de razonamiento (chain-of-thought) pensado para aplicaciones empresariales. La versión abliterated elimina los rechazos de seguridad del modelo base, lo que permite una generación menos restrictiva, aunque con los riesgos asociados.

Las cuantizaciones GGUF permiten ejecutar este modelo de aproximadamente 29.300 millones de parámetros en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles. El repositorio incluye múltiples niveles de cuantización (desde IQ1 hasta Q6_K) para adaptarse a diferentes capacidades de VRAM, junto con archivos de calibración imatrix que mejoran la calidad de las cuantizaciones de baja precisión. Es una opción relevante para desarrolladores que necesitan un modelo de razonamiento de gran tamaño en entornos locales o con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) con razonamiento nativo (thinking mode) |
| Parametros totales | 29.276.770.304 (aprox. 29,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base de IBM Granite 4.2 soporta hasta 128K, pero no se confirma en esta version) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | No disponible (el modelo base de IBM soporta principalmente ingles, con capacidades multilingue limitadas) |
| Licencia | No disponible (el modelo base de IBM Granite 4.2 se publica bajo Apache 2.0, pero esta version derivada no indica licencia) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo original Granite 4.2 30B de IBM es un transformer denso decoder-only, post-entrenado a partir de los pesos del Granite 4.1. Incorpora un modo de razonamiento nativo que genera cadenas de pensamiento internas antes de emitir la respuesta final, similar a otros modelos de razonamiento recientes. El proceso de entrenamiento incluye una fase de pre-entrenamiento sobre un corpus amplio y una fase de post-entrenamiento con datos instructivos y de razonamiento.

La version "abliterated" de ChonkE aplica una tecnica de modificacion de pesos que elimina los patrones de rechazo aprendidos durante el entrenamiento de seguridad. Esto se logra mediante la identificacion y anulacion de las direcciones en el espacio de activaciones que correlacionan con respuestas de rechazo. El resultado es un modelo que rara vez se niega a responder, incluso ante peticiones que el modelo base rechazaria. Las cuantizaciones de mradermacher se generan con el metodo imatrix, que utiliza una matriz de importancia calculada sobre un corpus de calibracion para optimizar la asignacion de bits en cuantizaciones de baja precision, reduciendo la perdida de calidad.

## Capacidades

- Generacion de texto y conversacion multi-turno (etiquetado como "conversational").
- Razonamiento paso a paso gracias al modo de pensamiento nativo del modelo base.
- Generacion de codigo y asistencia en programacion, herencia de las capacidades de la familia Granite.
- Comprension de instrucciones complejas y tareas de analisis.
- Capacidades multilingue limitadas (principalmente ingles, con algo de espanol y otros idiomas, segun el modelo base).
- Soporte de tool calling y function calling (segun las capacidades del modelo base Granite 4.2, aunque no se confirma en esta version).
- Al ser una version abliterated, muestra menos rechazos ante solicitudes sensibles, lo que puede ser util en entornos donde se requiere una generacion sin restricciones (bajo responsabilidad del usuario).

## Casos de uso

- Asistentes conversacionales locales: el modelo puede alimentar chatbots de codigo abierto en equipos con 16-24 GB de VRAM usando cuantizaciones Q4 o Q5, ofreciendo respuestas con razonamiento elaborado sin depender de APIs externas.
- Generacion de codigo en entornos aislados: al soportar cuantizaciones GGUF y ejecutarse con llama.cpp, puede integrarse en pipelines de desarrollo que requieran autosuficiencia y privacidad, por ejemplo para generar tests unitarios o documentacion.
- Analisis de documentos extensos: con una ventana de contexto amplia (si se confirma 128K), puede resumir informes, extraer conclusiones y razonar sobre multiples secciones de un documento.
- Prototipado de agentes de IA: su capacidad de razonamiento y tool calling (si se hereda del modelo base) permite experimentar con agentes que planifican y ejecutan acciones en entornos controlados.
- Educacion y tutoria: puede explicar conceptos complejos paso a paso, ideal para sistemas de aprendizaje automatico en instituciones que requieren despliegue local.
- Investigacion en alineacion y seguridad: la version abliterated sirve para estudiar el comportamiento de modelos sin restricciones de seguridad, comparando respuestas con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Se recomienda consultar la documentacion del modelo base Granite 4.2 de IBM para referencias de rendimiento, aunque los resultados de la version abliterated pueden diferir.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion):
  - Q2_K / IQ2: aproximadamente 11-12 GB (cabe en GPU de 12 GB como RTX 3060 o RTX 4070).
  - Q4_K_M: aproximadamente 17-18 GB (requiere GPU de 20-24 GB como RTX 3090, RTX 4090 o A5000).
  - Q6_K: aproximadamente 25-26 GB (recomendada GPU de 32 GB como A100 o V100).
  - Q8: aproximadamente 32 GB (solo en GPU profesionales o servidores).
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4, A100 (40-80 GB) para cuantizaciones altas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversion a formato compatible), TGI (si se convierte a safetensors).
- Latencia y throughput: no disponibles. Como referencia, un modelo de 30B en Q4_K_M en una RTX 4090 suele generar entre 20-40 tokens/s, pero depende del hardware y del numero de tokens de razonamiento.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables en la informacion proporcionada. El modelo comparte categoria con otras alternativas de razonamiento de aproximadamente 30B parametros, como Qwen2.5-32B-Instruct o el propio Granite 4.1 30B, pero no se han encontrado resultados de benchmarks que permitan una comparacion objetiva. Se recomienda evaluar el modelo en el caso de uso concreto antes de adoptarlo.

## Limitaciones y advertencias

- Al ser una version abliterated, el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros de seguridad. Su uso en produccion requiere medidas de moderacion adicionales.
- La cuantizacion degrada la calidad de las respuestas, especialmente en niveles bajos (IQ1, IQ2). Se recomienda usar Q4_K_M o superior para tareas criticas.
- La licencia no esta especificada en el repositorio. Aunque el modelo base de IBM es Apache 2.0, la version abliterated y sus cuantizaciones podrian tener restricciones adicionales. Verificar antes de usar comercialmente.
- No se confirma la longitud de contexto real en esta version. Si se usa con ventanas largas, pueden aparecer errores de posicion o perdida de coherencia.
- El modelo base tiene un sesgo hacia el ingles; el rendimiento en otros idiomas puede ser inferior.
- La generacion con razonamiento (thinking mode) consume mas tokens y tiempo de computo, lo que aumenta la latencia en aplicaciones en tiempo real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Granite_42_30b_Abliterated-i1-GGUF
- Modelo original (ChonkE): https://huggingface.co/ChonkE/Granite_42_30b_Abliterated
- Documentacion de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de IBM Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Pagina principal de IBM Granite: https://www.ibm.com/granite
