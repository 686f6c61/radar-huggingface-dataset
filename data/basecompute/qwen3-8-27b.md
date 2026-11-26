# basecompute/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo denso de 27 000 millones de parámetros con capacidades de visión y lenguaje, publicado por el laboratorio Qwen y redistribuido en este repositorio por basecompute bajo el identificador `basecompute/Qwen3.8-27B`. El modelo original emplea una arquitectura de atención híbrida que combina Gated DeltaNet con atención completa periódica, un diseño orientado a reducir el coste computacional en contextos largos sin renunciar a la calidad de recuperación de información.

La aportación concreta de este repositorio no es un nuevo entrenamiento, sino una conversión de pesos a formato `.base` para el runtime BaseRT, optimizado para inferencia local sobre Apple Silicon mediante Metal. Se ofrecen dos variantes cuantizadas: Q4, con un tamaño de 17 GB, y Q8, con 28 GB. Esto convierte un modelo de 27B en una opción viable en equipos Mac de gama alta con memoria unificada, un escenario que hasta hace poco quedaba reservado a modelos de 7B a 14B.

El interés actual del modelo radica en esa combinación: razonamiento multimodal, arquitectura de atención eficiente y un empaquetado que permite ejecutarlo en hardware de consumo profesional. La licencia Apache 2.0, heredada del modelo base, elimina además las restricciones de uso comercial que afectan a otras familias de pesos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet + atención completa periódica) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (Q4, 17 GB) y 8 bits (Q8, 28 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.base` (runtime BaseRT); repo de 128,2 GB |
| Modalidad | Texto e imagen (vision-language) |
| Modelo base | Qwen/Qwen3.8-27B |
| Runtime | BaseRT (Metal, Apple Silicon) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27B parámetros que sustituye la atención estándar por un esquema híbrido: capas de Gated DeltaNet, un mecanismo de atención lineal con estado recurrente y compuertas, intercaladas con capas de atención completa periódica. Este patrón busca mantener la capacidad de recuperación exacta de la atención cuadrática en puntos estratégicos de la red mientras el resto de capas opera con coste lineal respecto a la longitud de secuencia. Es la misma familia de diseños que otros modelos recientes han adoptado para abaratar la inferencia en contextos largos.

El modelo incorpora además un codificador visual, lo que lo convierte en un sistema visión-lenguaje capaz de razonar sobre imágenes además de texto. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO; la model card del repositorio de basecompute no detalla el proceso de entrenamiento del modelo original, solo el empaquetado. La innovación destacable en este repositorio es de ingeniería de despliegue: la conversión a un formato propietario del runtime BaseRT con kernels adaptados a Metal, que permite ejecutar las capas de atención lineal de forma eficiente en la GPU integrada de los chips de Apple.

## Capacidades

- Generación de texto y razonamiento multi-paso, incluyendo modos de razonamiento extendido propios de la familia Qwen3.
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Generación y edición de código, con soporte previsible de lenguajes mayoritarios.
- Matemáticas y problemas cuantitativos de varios pasos.
- Capacidades multilingües heredadas del modelo base (el conjunto exacto de idiomas no está documentado en este repositorio).
- Ejecución local en Apple Silicon mediante el runtime BaseRT, sin dependencia de servicios en la nube.
- Soporte de tool calling y comportamiento agéntico: no confirmado en la información disponible para esta conversión.

## Casos de uso

- Asistente de programación local: un desarrollador con un Mac Studio o MacBook Pro de gama alta puede ejecutar la variante Q4 (17 GB) y obtener autocompletado, explicación de código y refactorizaciones sin enviar el código fuente a un tercero, lo que simplifica el cumplimiento en entornos con requisitos de confidencialidad.
- Análisis de documentos con imágenes: el modelo acepta capturas, diagramas y páginas escaneadas, por lo que resulta adecuado para extraer información estructurada de informes, facturas o documentación técnica en un flujo por lotes ejecutado en local.
- Prototipado de agentes sobre datos sensibles: al correr íntegramente en el equipo, permite iterar sobre pipelines agénticos con datos de salud, legal o financiero sin exponerlos a APIs externas.
- Investigación en arquitecturas de atención eficiente: la combinación de Gated DeltaNet y atención completa periódica hace del modelo un banco de pruebas útil para medir el compromiso entre calidad y coste en secuencias largas.
- Soporte técnico interno con base documental: con la variante Q8 (28 GB) en un equipo de 48 GB o más, se puede servir un asistente que consulte manuales y responda con contexto amplio, manteniendo la latencia dentro de márgenes aceptables para uso interactivo.
- Evaluación comparativa de cuantizaciones: las dos variantes publicadas permiten medir de forma directa la degradación de calidad entre Q4 y Q8 sobre las mismas tareas, un experimento habitual en equipos que calibran presupuestos de memoria.
- Generación de documentación técnica a partir de diagramas de arquitectura, combinando la entrada visual con la salida de texto estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a describir los ficheros y el procedimiento de instalación; no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, ni del modelo original ni de las conversiones Q4 y Q8.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 24 GB para la variante Q4 (el autor la califica de "ajustada") y 48 GB o más para Q8.
- Hardware objetivo: exclusivamente Apple Silicon con soporte Metal; el runtime BaseRT no está pensado para GPU NVIDIA ni AMD según la información disponible.
- Equipos viables: Mac con chip M-series y 32 GB de memoria unificada como mínimo para Q4 con margen escaso; 64 GB o más para Q8 con holgura.
- No cabe en GPU de consumo tipo RTX 4090 en su formato actual, ya que los pesos están empaquetados para BaseRT y no se distribuyen en GGUF ni safetensors.
- Despliegue: instalación mediante el script oficial (`curl -LsSf https://basecompute.co/install.sh | sh`) y los comandos `basert pull` y `basert chat`.
- Alternativas de serving (vLLM, TGI, llama.cpp, Ollama): no disponibles para este repositorio concreto; requerirían los pesos originales de Qwen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato distribuido | Licencia | Notas |
|---|---|---|---|---|---|
| basecompute/Qwen3.8-27B | 27B denso | no disponible | `.base` (BaseRT) | Apache 2.0 | Solo Apple Silicon; Q4 17 GB, Q8 28 GB |
| Qwen/Qwen3.8-27B (original) | 27B denso | no disponible | safetensors | Apache 2.0 | Pesos completos; requiere convertir para otros runtimes |
| Gemma 3 27B | 27B denso | 128K (según documentación pública del modelo) | safetensors, GGUF | Términos de Gemma | Multimodal; ecosistema de cuantizaciones amplio |
| Mistral Small 3.x 24B | 24B denso | 32K-128K según versión | safetensors, GGUF | Apache 2.0 | Sin visión en las versiones base; muy extendido en llama.cpp |

La comparación directa de rendimiento no es posible con los datos disponibles: no hay benchmarks publicados en este repositorio ni métricas verificables de las conversiones. La diferencia práctica más relevante frente a las alternativas es el formato: este repositorio solo es utilizable con BaseRT en Apple Silicon, mientras que Gemma 3 y Mistral Small cuentan con GGUF y soporte amplio en llama.cpp, Ollama y vLLM.

## Limitaciones y advertencias

- Dependencia total del runtime BaseRT: los pesos no son utilizables con llama.cpp, vLLM, TGI ni Ollama, lo que limita la portabilidad y crea un riesgo de dependencia de un único proveedor de herramienta.
- Exclusividad de plataforma: solo Apple Silicon con Metal; no hay soporte para NVIDIA, AMD ni CPU convencional.
- La variante Q4 requiere unos 24 GB y el propio autor la describe como ajustada, por lo que puede haber degradación de calidad y riesgo de presión de memoria en equipos de 32 GB con otras aplicaciones abiertas.
- No se documentan los idiomas soportados, el sesgo del modelo ni las tasas de alucinación; al ser una conversión cuantizada, estos riesgos se heredan del modelo base y pueden amplificarse en Q4.
- El repositorio tiene un historial muy reducido (243 descargas, 1 like en el momento de la consulta) y procede de un tercero, no del laboratorio Qwen; conviene verificar la integridad de los pesos antes de usarlos en producción.
- Ausencia de benchmarks propios: no hay evidencia publicada sobre la pérdida de calidad de las conversiones Q4 y Q8 frente al modelo original.
- Aunque la licencia es Apache 2.0, el uso comercial debe revisarse también contra los términos del runtime BaseRT, que se distribuye por separado.
- El tamaño del repositorio (128,2 GB) implica una descarga considerable incluso si solo se utiliza una de las dos variantes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/basecompute/Qwen3.8-27B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime BaseRT (GitHub): https://github.com/basecompute/baseRT
- Sitio del proveedor del runtime: https://basecompute.co
