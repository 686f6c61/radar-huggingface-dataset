# HarpiaIA/Acaua-Lite-GGUF

## Resumen

Acauã Lite (versión GGUF) es una cuantización en formato GGUF del modelo Acauã Lite, publicado por HarpiaIA sobre el modelo base HarpiaIA/Acaua-Lite. Según la model card, el modelo está construido a partir de LFM3-1.7B de LiquidAI, lo que sitúa el tamaño del modelo original en torno a 1.700 millones de parámetros. El repositorio GGUF ocupa 2,5 GB y está etiquetado con los tags lfm, lfm3, code, agent y coder, lo que indica una orientación clara hacia generación de código y flujos de agentes.

El modelo se distribuye bajo la licencia LFM Open License (lfm1.0), una licencia de tipo "other" que conviene revisar antes de cualquier uso comercial. El único idioma declarado es el inglés, y el pipeline es text-generation. La información pública disponible es muy escasa: la model card original es breve y no incluye detalles sobre datos de entrenamiento, contexto, benchmarks ni proceso de alineación.

La relevancia de esta ficha radica en documentar con rigor lo que se sabe y, sobre todo, lo que no se sabe de un modelo recién publicado, sin descargas y con un solo "like" en el momento de la consulta. Para un desarrollador que evalúe modelos pequeños orientados a código, esto implica tratar el modelo como candidato experimental y no como componente listo para producción sin una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de LFM3-1.7B de LiquidAI) |
| Parametros totales | aproximadamente 1.700 millones (según la referencia al LFM3-1.7B en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio contiene pesos cuantizados; no se detallan los niveles concretos) |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License (lfm1.0), etiquetada como "other" |
| Formato de pesos | GGUF (safetensors en el modelo base HarpiaIA/Acaua-Lite) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la información proporcionada. La model card indica únicamente que Acauã Lite es un LLM de HarpiaIA basado en LFM3-1.7B de LiquidAI, orientado a código. No se especifica si la arquitectura es un transformer denso, un modelo híbrido o alguna variante con atención lineal, ni se detallan innovaciones técnicas concretas del modelo base.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. El repositorio es una versión GGUF del modelo HarpiaIA/Acaua-Lite, por lo que el entrenamiento y la alineación corresponden al modelo base, del cual no se aportan detalles en esta ficha. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y, por tanto, se omite.

## Capacidades

- Generación de texto en inglés, con orientación declarada hacia código (tags code, coder).
- Soporte para flujos de agentes según el tag agent de la model card, aunque no se documentan detalles de implementación.
- Uso previsto como modelo de generación de texto (pipeline text-generation).
- No se documenta soporte explícito de tool calling o function calling.
- No se documenta soporte de visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingües limitadas al inglés según el campo language.
- No se documentan capacidades matemáticas ni de razonamiento de forma específica.

## Casos de uso

- Asistencia de autocompletado de código en editores: al ser un modelo pequeño (~1,7B) en formato GGUF, puede ejecutarse localmente en estaciones de trabajo y ofrecer sugerencias de código con baja latencia, siempre que se valide su calidad en el lenguaje objetivo.
- Prototipado de agentes de código: el tag agent sugiere un uso previsto en bucles de agente; se puede integrar en un orquestador propio para tareas de edición de ficheros o generación de parches, con validación humana de las salidas.
- Generación de tests unitarios: el modelo puede redactar pruebas a partir de fragmentos de código, un caso típico de modelos orientados a código, aunque requiere revisión porque no hay benchmarks publicados.
- Documentación técnica automatizada: generación de docstrings y comentarios en inglés para bases de código, aprovechando su especialización declarada en código y su idioma de entrenamiento.
- Despliegue en entornos con recursos limitados: el formato GGUF y el tamaño del repositorio (2,5 GB) permiten ejecución en CPU o GPU de consumo mediante llama.cpp u Ollama, útil para demos y pruebas internas.
- Experimentación e investigación: como modelo derivado de LFM3-1.7B, sirve para comparar el comportamiento de variantes comunitarias frente al modelo original de LiquidAI en tareas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~1,7B en GGUF, las estimaciones orientativas habituales van de aproximadamente 1-2 GB en cuantizaciones de 4 bits a 3-4 GB en 8 bits, aunque no se confirma el nivel de cuantización del repositorio.
- GPU recomendadas: no disponible; por tamaño, cabría en GPU de consumo como RTX 3060, RTX 4060 o superiores, así como en GPUs de datacenter (A100, H100) sin necesidad de ellas.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; vLLM y TGI requerirían conversión o soporte específico del formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Acauã Lite GGUF (HarpiaIA) | ~1,7B | no disponible | LFM Open License (lfm1.0) | GGUF | Derivado de LFM3-1.7B; sin benchmarks publicados |
| LFM3-1.7B (LiquidAI) | 1,7B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Modelo base del que deriva Acauã Lite |
| Alternativas de ~1-2B orientadas a código | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no haber información sobre el dataset de entrenamiento, no es posible evaluar sesgos de género, raza u otros.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones publicadas que permitan estimar la fiabilidad factual.
- Limitación de idioma: el modelo declara únicamente inglés, por lo que su rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto: no disponible, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Licencia: LFM Open License (lfm1.0), etiquetada como "other"; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones pueden incluir restricciones.
- Madurez: el repositorio tiene 0 descargas y 1 "like" en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Producción: sin benchmarks, sin documentación de cuantizaciones y sin garantías de soporte, no se recomienda su uso en producción sin una evaluación interna exhaustiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/HarpiaIA/Acaua-Lite-GGUF
- Modelo base: https://huggingface.co/HarpiaIA/Acaua-Lite
- Modelo de referencia LFM3-1.7B de LiquidAI: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
