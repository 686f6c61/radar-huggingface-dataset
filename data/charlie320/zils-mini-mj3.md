# Charlie320/zils-mini-mj3

## Resumen

zils-mini-mj3 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B, publicado por el usuario Charlie320 en Hugging Face bajo licencia Apache 2.0. Forma parte del ecosistema "Zils" asociado a la subred 127 de Bittensor y se presenta como un "body" (cuerpo de pesos) destinado al pool de modelos "soup" denominado d3-mini. El modelo está diseñado como un modelo de decisión (decision-model) orientado a tareas de clasificación y elección estructurada, no como un modelo generativo de propósito general.

Con 4.539.265.536 parámetros totales (aproximadamente 4,54 mil millones) y un tamaño de repositorio de 9,1 GB en formato safetensors, el modelo parte de la arquitectura de Qwen3.5-4B y conserva la torre de visión del modelo padre. La receta de entrenamiento es un "soup fine-tune": se parte de la media uniforme de pesos de tres cuerpos previos del mismo pool y se aplican tres ajustes LoRA (rango 64, fusionados) con semillas distintas, promediados después con pesos iguales.

Su relevancia es acotada pero específica: documenta una metodología de destilación y mezcla de pesos reproducible sobre un modelo base de 4B, con objetivos de entrenamiento suaves (soft targets) que combinan etiquetas reales y probabilidades del modelo de partida. No obstante, la información pública es muy limitada: no se declaran idiomas soportados, pipeline, benchmarks ni resultados de evaluación, lo que restringe su uso en producción sin una validación previa por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); incluye torre de visión heredada del modelo padre |
| Parámetros totales | 4.539.265.536 (aproximadamente 4,54 mil millones) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16; no se declaran cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Modelos de partida (soup) | Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg, joamCriff123/zils-mini-m1113b |
| Tamaño del repositorio | 9,1 GB |
| Precisión de pesos | BF16 |
| Fecha de creación | 2026-11-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de Qwen/Qwen3.5-4B en el denominado "chassis layout", con los pesos de lenguaje entrenados y la torre de visión procedente del modelo padre. El punto de partida no es el modelo base original, sino la media uniforme de pesos de tres cuerpos del pool d3-mini (Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b). Sobre esa media se realizaron tres ajustes LoRA de rango 64, fusionados en los pesos, con semillas diferentes, cada uno con una pasada barajada sobre el conjunto de datos de 61.091 filas y una tasa de aprendizaje de 5e-5; los tres resultados se promediaron uniformemente con pesos iguales.

El conjunto de entrenamiento se compone de dos bloques. El primero, de aproximadamente 31.100 ítems de decisión en formato de examen de las familias de tareas conocidas, fue generado con la receta pública de autoría de Zils (scripts/author_exam.py) por Claude Opus y por un modelo abierto local, a partir de particiones de entrenamiento de los datasets fuente públicos, e incluye unas 1.100 entradas de llamada a herramientas extraídas de las filas 90.000-93.000 del subconjunto function-call de glaiveai/glaive-function-calling-v2. El segundo bloque son 30.000 filas de la partición de entrenamiento de tasksource/tasksource-jev-typed-decisions con sus etiquetas, restringidas a fuentes con metadatos de licencia comercial o sin especificar (excluidas las no comerciales) y descartando fuentes cuyos nombres coinciden con tareas de BIG-bench.

La innovación técnica principal es el uso de objetivos suaves (soft targets) mediante autodestilación: para los ítems en formato de examen se usaron únicamente las probabilidades de respuesta del propio modelo de partida (sin emplear sus etiquetas), mientras que para las filas de tasksource-jev se combinó tres cuartas partes de la etiqueta de la fila con una cuarta parte de las probabilidades del modelo de partida. No se utilizaron ítems de examen del validador, ítems de examen semilla públicos ni datos de clientes.

## Capacidades

- Clasificación y decisión estructurada: el modelo está entrenado como decision-model para tareas de elección entre opciones en formato de examen, con familias de tareas tipadas procedentes de tasksource-jev-typed-decisions.
- Llamada a herramientas (tool calling): se incluyeron aproximadamente 1.100 ítems de llamada a funciones derivados de glaive-function-calling-v2, por lo que el modelo está expuesto a ese formato de decisión.
- Capacidades de visión: incorpora la torre de visión heredada de Qwen/Qwen3.5-4B, aunque no se documenta el alcance efectivo de dicha capacidad tras el ajuste.
- Capacidades multilingües: no disponibles; no se declaran idiomas soportados.
- Generación de texto libre: no documentada como objetivo de entrenamiento; el foco declarado es la decisión estructurada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no documentado.

## Casos de uso

- Enrutamiento de decisiones en pipelines: el modelo puede emplearse para elegir entre opciones predefinidas (por ejemplo, clasificar la intención de una consulta o seleccionar una categoría) gracias a su entrenamiento específico en ítems de decisión tipados procedentes de tasksource-jev-typed-decisions.
- Selección de herramientas en agentes: al haberse entrenado con ítems de llamada a funciones de glaive-function-calling-v2, puede integrarse como componente de decisión que elige qué herramienta invocar antes de delegar la ejecución a otro modelo generativo.
- Evaluación interna de modelos de decisión: sirve como cuerpo de referencia en el pool d3-mini de la subred 127 de Bittensor para comparar metodologías de mezcla de pesos y destilación suave.
- Experimentación con técnicas de model soup: su receta documentada (media de pesos, tres LoRA de rango 64 fusionados, promediado uniforme) lo convierte en un caso de estudio reproducible para investigadores que trabajen en fusión de modelos.
- Clasificación con contexto visual: la torre de visión heredada permite explorar tareas de decisión que incorporen entrada de imagen, siempre que se valide empíricamente el comportamiento tras el ajuste.
- Prototipado de bajo coste en una sola GPU: con 4,54 mil millones de parámetros en BF16 (unos 9 GB de pesos), cabe en GPUs de consumo con suficiente VRAM para pruebas de decisión en local antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 12-16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos; en 4 bits, alrededor de 2,3-2,5 GB de pesos. Estas estimaciones son teóricas, ya que no se publican cuantizaciones oficiales.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 6000 Ada para despliegue en BF16 con contexto amplio; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 en contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Opciones de despliegue: al ser un transformer estándar en safetensors, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión). No se proporcionan artefactos de despliegue en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zils-mini-mj3 | 4,54 B | No disponible | Apache 2.0 | safetensors (BF16) | Decision-model, fine-tune de Qwen3.5-4B |
| Qwen/Qwen3.5-4B | Aproximadamente 4 B | No disponible en la información proporcionada | No disponible en la información proporcionada | safetensors | Modelo base del que deriva |
| Zayaan/zils-mini-hm4 | No disponible | No disponible | No disponible | No disponible | Cuerpo previo del pool d3-mini |
| qhoenix/zils-mini-decision-t2avg | No disponible | No disponible | No disponible | No disponible | Cuerpo previo del pool d3-mini |
| joamCriff123/zils-mini-m1113b | No disponible | No disponible | No disponible | No disponible | Cuerpo previo del pool d3-mini |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no se han publicado resultados de evaluación, por lo que no es posible verificar su calidad frente al modelo base ni frente a los cuerpos de partida.
- Idiomas no declarados: se desconoce qué idiomas cubre el ajuste; el uso en castellano u otros idiomas requiere validación empírica.
- Contexto no documentado: no se especifica la longitud de contexto efectiva tras el ajuste.
- Riesgo de alucinación: aunque el modelo está orientado a decisiones estructuradas, no se documentan métricas de calibración ni de fiabilidad en producción.
- Sesgos: los datos de entrenamiento provienen de datasets públicos (tasksource-jev-typed-decisions y glaive-function-calling-v2) y de ítems generados por Claude Opus y un modelo abierto local; pueden heredarse sesgos de esas fuentes y de los procesos de generación automática.
- Restricciones de licencia de los datos: aunque los pesos se publican bajo Apache 2.0, el autor advierte explícitamente de que se deben comprobar los términos de los datasets fuente antes de reutilizar el modelo; parte de los datos de entrenamiento se filtraron por licencia comercial o sin especificar, pero la responsabilidad de verificación recae en el usuario.
- Naturaleza experimental: el modelo pertenece a un pool de una subred de Bittensor, con cero descargas y cero likes en el momento de la consulta, y sin pipeline declarado; debe tratarse como un artefacto de investigación más que como un modelo listo para producción.
- Solo pesos: el repositorio contiene únicamente los pesos, sin scripts de inferencia, tokenizador documentado ni artefactos de despliegue más allá de lo heredado del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-mj3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo de partida 1: https://huggingface.co/Zayaan/zils-mini-hm4
- Cuerpo de partida 2: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Cuerpo de partida 3: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Dataset de decisiones: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de llamada a funciones: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
