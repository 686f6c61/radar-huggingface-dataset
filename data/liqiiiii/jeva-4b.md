# LIQIIIII/Jeva-4B

## Resumen

Jeva-4B es un modelo de decisión «System One» desarrollado por Qi Li y Xinchao Wang (National University of Singapore), publicado en HuggingFace por el usuario LIQIIIII. A diferencia de los modelos generativos convencionales, Jeva no está pensado para producir texto libre ni cadenas de razonamiento largas: su función es tomar decisiones directas sobre texto, seleccionando una alternativa entre varias, estimando la probabilidad de que una afirmación sea cierta o asignando una puntuación numérica según una rúbrica proporcionada.

El modelo se articula en torno a cuatro propiedades declaradas por sus autores: es «null-aware» (admite explícitamente la opción «ninguna de las anteriores»), «permutation-invariant» (el orden de las opciones no debería alterar la decisión), «option-scalable» (funciona con conjuntos pequeños y grandes de candidatos) y «cacheable» (permite reutilizar opciones ya procesadas en peticiones nuevas). Estas propiedades lo orientan a tareas de enrutamiento de peticiones, selección de documentos, evaluación de relevancia y puntuación con rúbrica.

Con aproximadamente 4.000 millones de parámetros según su denominación y un repositorio de 9,9 GB en formato safetensors, Jeva-4B se posiciona como un componente de decisión ligero que puede ejecutarse en hardware de gama media, siempre como apoyo a la decisión y con supervisión humana en contextos consecuentes, tal y como recomienda su propia model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la model card) |
| Parámetros totales | ~4.000 millones (deducido de la denominación «4B»; no confirmado explícitamente) |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuyen pesos en safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 9,9 GB |
| Fecha de publicación | 9 de octubre de 2026 (última actualización: 14 de octubre de 2026) |
| Descargas / likes | 79 descargas, 27 likes |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo: no se indica si se trata de un transformer denso, una mezcla de expertos (MoE), un modelo de espacio de estados (SSM) o una arquitectura híbrida, ni se especifica el número de capas, la dimensión oculta, el tokenizador o la longitud de contexto soportada. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La información pública se limita a la descripción funcional y a la referencia al artículo «Jeva: System One Models from First Principles» (arXiv:2610.18773).

La innovación que sí se explicita es de diseño, no de arquitectura: el modelo se construye alrededor de la estructura de la decisión en lugar de tratar la decisión como una tarea de generación. De ahí sus cuatro propiedades declaradas (null-aware, permutation-invariant, option-scalable y cacheable), con el lema «Reuse the options. Recompute the decision.». Esto implica que el modelo separa la representación de las opciones (reutilizable entre peticiones) del cálculo de la decisión (que se recalcula para cada consulta), un planteamiento útil en catálogos estables donde las mismas alternativas aparecen una y otra vez.

## Capacidades

- Selección de candidatos (Choice): elige una opción entre un conjunto de alternativas suministradas, con la posibilidad de devolver un resultado explícito de «ninguna de las anteriores».
- Estimación de veracidad (Noul): calcula la probabilidad de que una afirmación sea verdadera, por ejemplo si un informe describe una incidencia en curso.
- Puntuación con rúbrica (Score): genera una valoración numérica a partir de una rúbrica proporcionada por el usuario, por ejemplo la severidad del impacto reportado por un cliente.
- Invariancia a la permutación: el orden en que se presentan los candidatos no debería determinar la respuesta.
- Escalabilidad en el número de opciones: el mismo modelo atiende conjuntos reducidos y grandes de candidatos.
- Reutilización de opciones (cacheo): las alternativas ya procesadas pueden reutilizarse en peticiones nuevas, incluidas combinaciones nuevas de opciones conocidas.
- Soporte de múltiples tareas sobre un mismo conjunto de opciones: las mismas alternativas pueden emplearse para preguntas distintas sin reutilizar una respuesta anterior.
- Multilingüismo: no disponible; la model card declara únicamente inglés.
- Tool calling, function calling y razonamiento multi-paso: no disponible (el modelo no está descrito como generativo ni orientado a agentes).
- Capacidades multimodales (visión, audio) y modos de pensamiento explícitos: no disponible.

## Casos de uso

- Enrutamiento de peticiones de soporte: ante una consulta entrante, el modelo elige a qué equipo o cola debe asignarse, con la opción «ninguna de las anteriores» para casos que no encajan en el catálogo de equipos existente.
- Reranking en pipelines de RAG: tras una primera fase de recuperación, Jeva puntúa la relevancia de cada documento candidato respecto a la consulta, reduciendo el número de fragmentos que se envían al modelo generativo final.
- Verificación de afirmaciones en flujos de fact-checking: usando la capacidad Noul, se estima la probabilidad de que un enunciado sea cierto y se marca automáticamente para revisión humana por debajo de un umbral de confianza configurable.
- Evaluación automática con rúbrica (LLM-as-a-judge ligero): puntuación de respuestas generadas por otros modelos según criterios explícitos de calidad, tono o fidelidad, aprovechando que Jeva devuelve una puntuación numérica en lugar de una explicación extensa.
- Triaje de incidencias: con la función Score, se asigna una severidad numérica a los informes de incidencias para priorizar la cola de trabajo, por ejemplo clasificando en función del impacto declarado por el cliente.
- Moderación y categorización con opción nula: clasificación de contenido en categorías predefinidas evitando forzar una etiqueta cuando ninguna resulta aplicable, lo que reduce falsos positivos en taxonomías cerradas.
- Sistemas con catálogo estable y alto volumen: en escenarios donde las alternativas apenas cambian (catálogo de productos, tiendas o cuentas de una organización), el cacheo de opciones permite reutilizar representaciones y recalcular únicamente la decisión para cada nueva consulta.
- Selección de herramientas en un agente: elección de la herramienta o API a invocar entre un conjunto fijo de funciones disponibles, siempre que el sistema externo gestione la ejecución y la validación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas específicas de decisión, y los resultados de la búsqueda web no aportan evaluaciones del modelo. Existe un artículo asociado (arXiv:2610.18773) que podría contener experimentos, pero no se ha facilitado su contenido.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo derivado del tamaño de parámetros, no de datos publicados por el autor): en fp16/bf16, en torno a 8 GB solo para pesos, más caché KV y overhead, lo que sitúa el consumo práctico en el rango de 10-12 GB.
- En cuantización de 8 bits la huella de pesos bajaría a unos 4-5 GB, y en 4 bits a unos 2,5-3 GB, aunque no se distribuyen versiones cuantizadas oficiales y sería necesario generarlas.
- GPU recomendadas: no especificadas por el autor. Como referencia por tamaño, una RTX 4090 (24 GB) o una L4/A10G (24 GB) son suficientes en fp16; para despliegues de alto throughput tendrían sentido A100 o H100.
- GPU de consumo: es probable que quepa en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB) en fp16, y en tarjetas de 8 GB si se cuantiza a 4 bits. Estas cifras son estimaciones basadas en el número de parámetros, no en pruebas publicadas.
- Opciones de despliegue: al tratarse de pesos safetensors, es compatible con transformers, vLLM o TGI; llama.cpp y Ollama requerirían una conversión a GGUF no documentada por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de benchmarks de Jeva-4B, por lo que esta comparativa es funcional y de especificaciones, no de rendimiento medido. Además, Jeva no compite directamente con modelos generativos: su salida es una decisión, una probabilidad o una puntuación, no texto libre.

| Modelo | Parámetros | Contexto | Propósito principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeva-4B | ~4B (según denominación) | no disponible | Decisión directa: elección, veracidad y puntuación | no disponible | safetensors en HuggingFace |
| Qwen3-4B | 4B | 32.768 tokens nativos (ampliable con YaRN) | Generación de texto, razonamiento y código | Apache-2.0 | safetensors, GGUF y múltiples cuantizaciones |
| Llama-3.2-3B | 3B | 128.000 tokens | Generación de texto multilingüe | Llama 3.2 Community License | safetensors y GGUF |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | Generación de texto, razonamiento y código | MIT | safetensors y GGUF |

La diferencia clave es de diseño: los tres modelos de la comparativa generan texto y pueden emular tareas de decisión mediante prompting, mientras que Jeva está especializado en devolver decisiones estructuradas con invariancia a la permutación y soporte de opción nula. A cambio, carece de las capacidades generativas, de tool calling y de multilingüismo de sus alternativas.

## Limitaciones y advertencias

- Licencia no especificada: la ausencia de licencia explícita impide determinar si el uso comercial está permitido. Conviene contactar con los autores antes de integrarlo en producción.
- Idiomas: el modelo declara únicamente inglés; no hay evidencia de soporte para castellano ni para otras lenguas.
- Ausencia total de benchmarks: no hay métricas publicadas de precisión en selección, calibración de probabilidades ni correlación con juicios humanos, lo que dificulta estimar su fiabilidad antes de desplegarlo.
- Riesgo de calibración en la salida Noul: al tratarse de una probabilidad estimada sin datos de calibración publicados, los umbrales de decisión deben validarse empíricamente en el dominio de uso.
- Composición del dataset desconocida: al no documentarse los datos de entrenamiento, no es posible evaluar sesgos demográficos, temáticos o de dominio, ni el riesgo de contaminación por benchmarks.
- Sensibilidad a la formulación de las opciones: aunque se declara invariancia a la permutación, la forma en que se redactan los candidatos y la rúbrica puede afectar a la decisión; se recomienda normalizar las opciones.
- No es un modelo generativo: no produce explicaciones ni justificaciones, lo que limita su auditabilidad directa y complica la depuración de errores.
- Uso previsto restringido: el autor lo destina a investigación y apoyo a la decisión, y exige supervisión humana en decisiones con consecuencias relevantes.
- Advertencias de producción: verificar el comportamiento con conjuntos de opciones muy grandes, medir la latencia real en el hardware objetivo y establecer mecanismos de reserva (fallback) cuando el modelo devuelva «ninguna de las anteriores» o una puntuación fuera de rango.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LIQIIIII/Jeva-4B
- Página del proyecto: https://liqiiiii.github.io/Jeva/
- Repositorio en GitHub: https://github.com/LiQiiiii/Jeva
- Cuestiones y comentarios (issues): https://github.com/LiQiiiii/Jeva/issues
- Artículo citado: arXiv:2610.18773, «Jeva: System One Models from First Principles» (Qi Li, Xinchao Wang)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos corresponden a contenidos no relacionados (galerías de fotografías históricas) y se descartan como fuentes.
