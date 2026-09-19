# mradermacher/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-i1-GGUF

## Resumen

El modelo `LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-i1-GGUF` es una versión cuantizada en formato GGUF del modelo `DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3`, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local: el repositorio contiene 14 cuantizaciones con pesos de tipo imatrix (ponderadas por importancia), generadas a partir del modelo original en safetensors. El modelo subyacente pertenece a la familia Liquid Foundation Model (LFM2.5) de Liquid AI, con arquitectura de mezcla de expertos (MoE) y 8.467.856.832 parámetros totales.

El modelo está orientado a tareas de agente y generación de código: los tags declaran capacidades de function calling, razonamiento multi-paso (etiquetado como "system2"), evaluación de código (evalplus) y conversación con plantilla estilo Hermes. Además, incorpora el sufijo "Abliterated", lo que indica que se ha aplicado una técnica de ablación direccional para eliminar comportamientos de rechazo del modelo original. El idioma declarado es únicamente inglés.

Su relevancia práctica radica en el formato: al estar en GGUF con cuantizaciones desde 2,1 GB hasta 7,1 GB, puede ejecutarse en GPU de consumo e incluso en CPU con llama.cpp, algo imposible con los pesos completos. No obstante, la información pública disponible sobre el modelo base (contexto, datos de entrenamiento, benchmarks) es muy limitada, y las cifras de rendimiento no están publicadas en la documentación consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de la familia Liquid Foundation Model (LFM2.5), según los tags del repositorio; detalle de capas no disponible |
| Parametros totales | 8.467.856.832 |
| Parametros activos | Aproximadamente 1.000 millones (deducido del sufijo "A1B" del nombre; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K; existe además un repositorio de cuantizaciones estáticas |
| Idiomas soportados | en (inglés) |
| Licencia | liquid-foundation-model-community-license (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base está en safetensors |
| Tamaño del repositorio | 54,7 GB (incluye todas las cuantizaciones y el fichero imatrix) |
| Fichero imatrix | 0,1 GB (para generar cuantizaciones propias) |
| Fecha de publicación | 19 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de los tags, que identifican el modelo como MoE y perteneciente a la familia LFM2.5 de Liquid AI. El recuento real de parámetros en safetensors es de 8.467.856.832, y el sufijo "A1B" del nombre sugiere que la fracción activa por token ronda los 1.000 millones de parámetros, aunque este dato no aparece confirmado en la documentación consultada. El nombre de la familia (Liquid Foundation Model) indica que se trata de un modelo de propósito general desarrollado por Liquid AI, no de un modelo específico de código entrenado desde cero.

El modelo base ha pasado por varias transformaciones antes de llegar a este repositorio: una especialización en formato conversacional y de agente con plantilla Hermes (orientada a function calling), un ajuste para generación de código y, finalmente, un proceso de "abliteration". Esta técnica consiste en calcular una dirección de rechazo en el espacio de activaciones y abliterarla (eliminarla) de los pesos, de modo que el modelo deja de producir negativas sistemáticas ante determinadas peticiones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

Por lo que respecta a esta publicación concreta, el trabajo de mradermacher consiste en la conversión del modelo a GGUF y la generación de cuantizaciones ponderadas por importancia (imatrix), usando el fichero imatrix incluido en el repositorio. Este método asigna distinto peso a cada tensor según su impacto en la perplejidad, lo que permite cuantizaciones más agresivas con menor degradación que las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat estilo Hermes.
- Generación y razonamiento sobre código (tags "coding", "code" y "evalplus").
- Function calling y tool calling, según el tag "function-calling" y la herencia de la plantilla Hermes.
- Comportamiento orientado a agentes y razonamiento multi-paso (tags "agentic" y "system2").
- Razonamiento general etiquetado como modo "sistema 2" por el autor del modelo base.
- Ejecución de tareas de evaluación de código del conjunto EvalPlus (tag "evalplus").
- Respuestas sin rechazos sistemáticos gracias al proceso de abliteration aplicado al modelo base.
- Capacidades de visión, audio o modo de pensamiento explícito: no disponibles en la información proporcionada.
- Soporte multilingüe: no disponible; el único idioma declarado es el inglés.

## Casos de uso

- Asistentes de programación en local: el modelo puede generar y completar código en inglés dentro de editores o terminales, ejecutándose en GGUF mediante llama.cpp sin depender de APIs externas, algo útil cuando el código no puede salir de la máquina por motivos de confidencialidad.
- Pipelines de CI/CD con revisión automática: dado su soporte declarado de function calling, puede invocarse desde scripts que ejecuten análisis de código, generación de tests o resúmenes de cambios en pull requests, con la salvedad de que la plantilla concreta de llamada a herramientas debe validarse empíricamente.
- Agentes de automatización de tareas con múltiples pasos: los tags "agentic" y "system2" apuntan a un uso como planificador dentro de bucles de razonamiento y acción, apoyado en herramientas externas (navegación, ejecución de comandos, consultas a bases de datos).
- Evaluación y reproducción de investigaciones sobre código: al incluir el tag "evalplus", es candidato para reproducir pruebas de generación de código en bancos tipo HumanEval+ o MBPP+, usando las cuantizaciones Q4_K_M o Q6_K para minimizar la pérdida de calidad.
- Despliegue en estaciones de trabajo sin GPU dedicada: las variantes IQ2_M (2,9 GB) o IQ3_M (3,9 GB) permiten ejecutar el modelo en CPU con llama.cpp, adecuado para prototipado y pruebas de integración en portátiles.
- Procesamiento por lotes de documentación técnica en inglés: generación de resúmenes, extracción de fragmentos de código y normalización de texto con un modelo de 8,5B parámetros totales pero bajo coste de cómputo por token si se confirma la activación parcial de aproximadamente 1.000 millones de parámetros.
- Experimentación con modelos sin filtros de rechazo: el proceso de abliteration lo hace adecuado para estudiar el comportamiento del modelo ante peticiones que los modelos alineados rechazan, siempre dentro del marco legal aplicable y asumiendo los riesgos descritos más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K, EvalPlus ni ninguna otra métrica, y los resultados de la búsqueda web consultada no aportan datos al respecto.

## Requisitos de hardware

Los requisitos se estiman a partir del tamaño real de cada fichero GGUF, añadiendo un margen para la caché KV y el contexto configurado. Son estimaciones, no cifras publicadas por el autor.

- i1-IQ1_M (2,1 GB): viable en CPU con RAM de 4-6 GB; el propio autor lo etiqueta como "mostly desperate" (calidad muy degradada).
- i1-IQ2_M (2,9 GB) e i1-IQ2_XXS (2,4 GB): ejecutables en GPU con 4 GB de VRAM y en CPU con 6-8 GB de RAM.
- i1-Q3_K_M (4,2 GB) e i1-IQ3_M (3,9 GB): GPU de 6 GB de VRAM (GTX 1660, RTX 2060) con contexto moderado.
- i1-IQ4_XS (4,7 GB) e i1-Q4_K_S (5,0 GB): GPU de 8 GB (RTX 3060 Ti, RTX 2070) o 12 GB para contexto amplio.
- i1-Q4_K_M (5,3 GB): opción recomendada por el autor; cabe con holgura en RTX 3060 12 GB, RTX 4070, RTX 4090.
- i1-Q6_K (7,1 GB): requiere 10-12 GB de VRAM; cómodo en RTX 4080, RTX 4090, A100 o H100.
- GPU profesionales: A100 (40/80 GB), H100 (80 GB) y L40S permiten cargar el modelo en FP16 si se dispone de los pesos safetensors originales, aunque este repositorio solo distribuye GGUF.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones desde IQ2 hasta Q6_K, en tarjetas de 6 a 12 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, koboldcpp y text-generation-webui. vLLM y TGI no son la vía natural para GGUF; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, de la cuantización y del tamaño de contexto configurado.

## Comparativa con modelos similares

Los datos de contexto, licencia y disponibilidad de las alternativas que figuran a continuación provienen de conocimiento general sobre esos modelos y no de la información proporcionada en esta búsqueda; se incluyen únicamente como referencia de categoría y deben verificarse en sus repositorios oficiales.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3 (este) | 8.467.856.832 | ~1.000 millones (no confirmado) | no disponible | liquid-foundation-model-community-license | GGUF (este repositorio) y safetensors (modelo base) |
| Qwen3-8B | 8.200 millones (dato externo, no verificado en esta búsqueda) | no aplica (denso) | no disponible en esta búsqueda | no disponible en esta búsqueda | no disponible en esta búsqueda |
| Llama-3.1-8B-Instruct | 8.030 millones (dato externo, no verificado en esta búsqueda) | no aplica (denso) | no disponible en esta búsqueda | no disponible en esta búsqueda | no disponible en esta búsqueda |

No se dispone de datos de rendimiento comparado entre este modelo y sus alternativas, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el autor no documenta ninguna evaluación de sesgos.
- Riesgo de alucinación: no cuantificado, pero al tratarse de un modelo de 8,5B parámetros con activación parcial, el riesgo es real en tareas de razonamiento factual o código complejo.
- Proceso de abliteration: la eliminación de la dirección de rechazo puede degradar la coherencia general, reducir la utilidad en tareas que requieren matices y facilitar la generación de contenido dañino o ilegal. El uso responsable recae íntegramente en quien despliega el modelo.
- Idioma: solo se declara inglés; no hay soporte oficial de castellano ni de otras lenguas, por lo que el rendimiento en español no está garantizado y probablemente sea inferior.
- Contexto: la longitud máxima de contexto no está publicada, lo que impide planificar despliegues con ventanas largas o conversaciones multi-turno extensas.
- Cuantización: el propio autor advierte que las variantes Q2 e IQ1 tienen calidad muy baja ("very low quality", "mostly desperate"). Para uso real se recomienda Q4_K_M o superior; cualquier resultado obtenido con cuantizaciones agresivas debe validarse en Q6_K.
- Licencia: la licencia de la comunidad de Liquid AI (liquid-foundation-model-community-license) es distinta de las licencias permisivas habituales; hay que revisar sus términos antes de cualquier uso comercial, ya que puede incluir restricciones de escala o de atribución.
- Trazabilidad: este repositorio es una cuantización de terceros, no una publicación oficial de Liquid AI ni de DuoNeural; las modificaciones aplicadas al modelo base (Hermes, ajuste de código, abliteration) no están documentadas con detalle.
- Metadatos: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que indica que no existe validación comunitaria de su calidad.
- Fecha de publicación inusual: los metadatos indican septiembre de 2026, un dato que conviene contrastar antes de citarlo.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-i1-GGUF
- Modelo base en safetensors: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v3-i1-GGUF
- Licencia de la comunidad de Liquid AI: https://www.liquid.ai/community-license
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
