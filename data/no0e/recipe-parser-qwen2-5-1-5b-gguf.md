# no0e/recipe-parser-qwen2.5-1.5b-gguf

## Resumen

recipe-parser es un ajuste fino de Qwen2.5-1.5B-Instruct especializado en una única tarea de extracción de información: convertir una página de blog de recetas ruidosa (con historia personal, anuncios y comentarios) en un JSON estructurado con los campos `title`, `servings`, `ingredients` (cantidad, unidad, nombre) y `steps` (número de paso, texto y duración en minutos). Lo desarrolla el usuario no0e y se publica bajo licencia Apache-2.0, con los pesos ya convertidos a GGUF de 8 bits para inferencia en CPU con llama.cpp.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5, con 1.543.714.304 parámetros totales, y se ha adaptado mediante QLoRA (rango 16, cuantización de 4 bits NF4) sobre 2.000 páginas sintéticas generadas a partir de recetas de Epicurious. El repositorio ocupa 1,6 GB e incluye únicamente el resultado del merge en GGUF q8_0, no los adaptadores LoRA ni los pesos en safetensors.

Su relevancia es acotada pero clara: demuestra que un modelo de 1,5B puede superar ampliamente a su base (F1 de ingredientes 0,929 frente a 0,179) y a una línea base de reglas (0,613) en una tarea de extracción con esquema fijo, con un 98 % de JSON válido. Es una pieza útil como componente de pipeline, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2.5 (modelo base Qwen2.5-1.5B-Instruct), ajustado con QLoRA |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens, pero el ajuste no confirma el contexto efectivo |
| Tipos de cuantización | GGUF q8_0 (único publicado en el repositorio) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (8 bits); no se publican safetensors del modelo fusionado |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Qwen2.5 con 1,5B parámetros, preentrenado y alineado por Alibaba como modelo instructivo. Sobre esa base se aplicó QLoRA con rango 16 y cuantización de 4 bits NF4, es decir, se congelaron los pesos originales y se entrenaron adaptadores de bajo rango sobre una representación cuantizada del modelo. Posteriormente los adaptadores se fusionaron con los pesos base y el conjunto se convirtió a GGUF de 8 bits para ejecución en CPU.

Los datos de entrenamiento son 2.000 páginas sintéticas con ruido, construidas a partir de recetas de Epicurious (CC BY-SA 3.0), con el objetivo declarado de simular la estructura de blogs reales: texto narrativo, anuncios y comentarios intercalados. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado; por el tipo de tarea (extracción con esquema fijo) es razonable asumir ajuste supervisado puro, pero no está confirmado. La innovación técnica es modesta y de ingeniería: generación controlada de ruido para robustez ante variaciones de maquetación, más una evaluación específica sobre layouts no vistos.

## Capacidades

- Extracción de información con esquema fijo: produce un objeto JSON con título, raciones, lista de ingredientes descompuestos en cantidad, unidad y nombre, y lista de pasos con texto y duración estimada en minutos.
- Robustez a ruido: entrenado explícitamente para ignorar historia personal, anuncios y comentarios presentes en la página de entrada.
- Generalización a maquetaciones no vistas: la evaluación se hace sobre 200 recetas con layouts no utilizados en entrenamiento.
- Generación de JSON: 98 % de salidas válidas según el esquema en el conjunto de evaluación del autor.
- Conversacional y compatible con endpoints: las etiquetas del repositorio incluyen `conversational` y `endpoints_compatible`, por lo que puede servirse con plantilla de chat.
- Inferencia en CPU: al estar en GGUF q8_0, funciona con llama.cpp sin GPU.
- No dispone de visión, audio, tool calling específico ni modo de razonamiento extendido documentado; las capacidades heredadas del base (código, matemáticas básicas, multilingüismo) existen pero no están evaluadas tras el ajuste.

## Casos de uso

- Ingesta masiva de blogs de recetas: pasar cada página por el modelo y obtener JSON directamente insertable en una base de datos relacional, sustituyendo scrapers con expresiones regulares que se rompen con cada rediseño de plantilla.
- Construcción de un agregador o buscador de recetas: normalizar título, raciones e ingredientes permite indexar por ingrediente y filtrar por número de comensales, algo imposible sobre texto libre.
- Generación automática de listas de la compra: al tener `quantity`, `unit` y `name` separados, se pueden agregar cantidades de varias recetas y agrupar por pasillo o categoría con una capa de post-proceso.
- Aplicaciones de planificación de menús y nutrición: los ingredientes estructurados alimentan una tabla de equivalencias para estimar macros, siempre con revisión humana dado el riesgo de error en cantidades.
- Enriquecimiento de un corpus para RAG: convertir recetas a JSON permite hacer retrieval por campos concretos (por ejemplo, "recetas con menos de 30 minutos y menos de 5 ingredientes") en lugar de búsqueda semántica sobre texto narrativo.
- Extracción en el borde o en local: al correr en CPU con ~1,6 GB de pesos, encaja en un portátil o en un contenedor pequeño sin GPU, útil para procesar recetas personales o archivadores privados sin enviar datos a la nube.
- Base para un ajuste mayor: sirve como plantilla reproducible (código, generación de datos y evaluación publicados) para tareas de extracción similares en otros dominios con esquema fijo.

## Benchmarks y rendimiento

Evaluación del autor sobre 200 recetas con maquetaciones no vistas:

| Método | F1 de ingredientes | JSON válido |
|---|---|---|
| Línea base de reglas | 0,613 | 1,000 |
| Modelo base, one-shot | 0,179 | 0,810 |
| recipe-parser (este modelo) | 0,929 | 0,980 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible, y no tendría sentido interpretarlos para un modelo ajustado a una sola tarea.

## Requisitos de hardware

- VRAM/RAM para inferencia: los pesos GGUF q8_0 ocupan aproximadamente 1,6 GB; con overhead de contexto y runtime, cuenta con 3-4 GB de memoria libre. En float16 serían unos 3,1 GB, pero esa variante no está publicada.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más sirve (RTX 3050, GTX 1660, RTX 4060, RTX 4090); en GPU de datacenter basta una T4, L4 o A10G, y A100/H100 están sobredimensionadas para este tamaño.
- Cabe holgadamente en GPU consumer; también funciona en CPU pura, que es el escenario para el que se publicó el GGUF.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama creando un Modelfile a partir del GGUF, y servidores compatibles con la API de OpenAI (etiqueta `endpoints_compatible`). vLLM y TGI existen como opciones, pero para 1,5B en q8_0 el cuello de botella no es la GPU.
- Latencia y throughput: no disponibles como cifras medidas. Como referencia orientativa, en CPU moderna un modelo de 1,5B en q8_0 suele moverse en el orden de decenas de tokens por segundo, y en GPU consumer la latencia por página es de fracciones de segundo; son estimaciones, no mediciones publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| recipe-parser-qwen2.5-1.5b-gguf | 1,5B | No confirmado (base: 32.768) | F1 ingredientes 0,929; JSON válido 0,980 | Apache-2.0 | GGUF en HuggingFace, 0 descargas |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 | F1 ingredientes 0,179; JSON válido 0,810 en one-shot | Apache-2.0 | Safetensors y múltiples cuantizaciones |
| Línea base de reglas (del propio autor) | No aplica | No aplica | F1 ingredientes 0,613; JSON válido 1,000 | No especificada | Código en el repositorio de GitHub |
| Modelos generales mayores (Qwen2.5-7B-Instruct, Llama-3.2-3B-Instruct) como alternativa por prompting | 7B / 3B | 32.768 / 128.000 (según modelo) | No evaluados en esta tarea por el autor | Apache-2.0 / licencia comunitaria de Llama | Disponibles, pero sin datos comparables |

La comparación honesta es la que ofrece el propio autor: frente a reglas y frente al base sin ajustar. No hay datos que permitan afirmar cómo se comporta un modelo mayor con un prompt bien diseñado, y ese es precisamente el experimento que falta.

## Limitaciones y advertencias

- Los datos de entrenamiento y evaluación son sintéticos: las puntuaciones miden robustez al ruido y a maquetaciones no vistas, no precisión sobre páginas reales scrapeadas. El propio autor lo advierte.
- Solo inglés: la model card declara `en`, y no hay evaluación en castellano ni en otros idiomas.
- Tarea única: no es un modelo de propósito general; usarlo fuera de la extracción de recetas dará resultados pobres.
- Un 2 % de salidas no son JSON válido según la evaluación del autor: en producción necesitas validación de esquema y reintento o fallback.
- Riesgo de alucinación en cantidades y unidades: un error numérico silencioso (por ejemplo, confundir 1/2 taza con 2 tazas) es plausible y no lo detecta la métrica de F1 de ingredientes; conviene validación con reglas de plausibilidad.
- Ambigüedad de normalización: unidades no métricas, fracciones, rangos ("2-3 dientes de ajo") y formatos mixtos requieren una capa de post-proceso; la salida del modelo no garantiza una unidad canónica.
- Licencia del modelo Apache-2.0, permisiva para uso comercial, pero los datos de origen son recetas de Epicurious bajo CC BY-SA 3.0: si redistribuyes datos derivados conviene revisar las obligaciones de compartir igual.
- Sin datos de sesgo, seguridad ni evaluación de toxicidad; con 0 descargas y 0 likes no hay evidencia de uso en producción por terceros.
- El repositorio solo contiene GGUF q8_0: no hay adaptadores LoRA ni pesos fusionados en safetensors, lo que limita reutilizar el ajuste para otras cuantizaciones o para seguir entrenando.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/no0e/recipe-parser-qwen2.5-1.5b-gguf
- Repositorio con código, generación de datos, evaluación y API: https://github.com/No0e/recipe-parser
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relación con esta ficha.
