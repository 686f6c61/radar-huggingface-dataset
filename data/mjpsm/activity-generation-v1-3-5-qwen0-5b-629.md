# mjpsm/activity-generation-v1.3.5-qwen0.5b-629

## Resumen

El modelo `mjpsm/activity-generation-v1.3.5-qwen0.5b-629` es un ajuste fino de `Qwen/Qwen2.5-0.5B-Instruct` desarrollado por el usuario mjpsm para el proyecto MyVillage, orientado a la generación de la siguiente actividad educativa dentro de una secuencia de aprendizaje personalizada. El modelo recibe como entrada un objetivo de aldea (village goal), el título de la actividad previa, un envío de conocimiento del alumno y un objeto de sabiduría con nombre de libro, tipo, capítulo y contenido, y devuelve un JSON con los campos `title`, `description` e `instructions`. El problema que resuelve es la selección y redacción automática del siguiente paso formativo a partir de la evidencia disponible sobre el estado del estudiante.

Técnicamente se trata de un transformer decoder-only de la familia Qwen2, con 494.032.768 parámetros totales (aproximadamente 0,5 millardos) y un repositorio de 1,0 GB en formato safetensors. El entrenamiento se realizó mediante supervised fine-tuning con QLoRA sobre un conjunto sintético validado de 629 ejemplos, 4 épocas, learning rate 0,0001, rango LoRA 16 y una longitud de contexto objetivo de 1024 tokens. La licencia declarada es Apache 2.0.

Su relevancia actual es acotada pero clara: se trata de un checkpoint experimental de muy bajo coste computacional, pensado para prototipado rápido de tutores y generadores de actividades en entornos educativos, y no de un modelo de propósito general. El propio autor advierte que es un experimento sobre un dataset pequeño y que su calidad de comportamiento debe validarse en escenarios MyVillage reservados antes de cualquier uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (derivada del modelo base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (longitud objetivo declarada en el entrenamiento). Ventana nativa del modelo base: no disponible en la información proporcionada |
| Tipos de cuantizacion | No se declaran cuantizaciones publicadas. El repositorio contiene únicamente pesos safetensors |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Metodo de ajuste | Supervised fine-tuning con QLoRA |
| Tamano del dataset de entrenamiento | 629 ejemplos |
| Epocas | 4 |
| Learning rate | 0,0001 |
| Rango LoRA | 16 |
| Tamano del repositorio | 1,0 GB |
| Pipeline | text-generation |
| Tarea declarada | activity-generation (MyVillage) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de tipo Qwen2, heredada íntegramente de `Qwen/Qwen2.5-0.5B-Instruct`. El autor no introduce modificaciones estructurales: el trabajo consiste en un ajuste supervisado con QLoRA sobre el checkpoint limpio del modelo instructivo, con rango LoRA 16, 4 épocas y learning rate 0,0001, fijando una longitud de contexto objetivo de 1024 tokens. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación adicional específica de este checkpoint.

Los datos de entrenamiento son un conjunto sintético validado de 629 ejemplos, una cifra muy reducida que condiciona por completo la naturaleza experimental del resultado. No se proporciona información sobre la composición temática del dataset, su distribución de idiomas ni el proceso de generación de los ejemplos. El comportamiento que el autor pretende inducir está descrito de forma explícita: tratar el envío de conocimiento como la evidencia más fuerte del estado del alumno, evitar repetir trabajo ya demostrado, gestionar de forma conservadora los envíos ambiguos, no abusar de la palabra "but" como atajo discursivo y usar el objetivo de la aldea como contexto a largo plazo sin forzar la actividad inmediata hacia él.

## Capacidades

- Generación de texto condicionada a una entrada estructurada de cuatro campos: objetivo de la aldea, título de la actividad previa, envío de conocimiento y objeto de sabiduría.
- Producción de salida estructurada en JSON con los campos `title`, `description` e `instructions`.
- Razonamiento pedagógico de corto alcance: seleccionar una siguiente actividad coherente con la evidencia aportada por el alumno.
- Detección implícita de trabajo ya realizado, con el objetivo de evitar redundancias en la secuencia de actividades.
- Gestión conservadora de entradas vagas o ambiguas, según el comportamiento declarado en la model card.
- Hereda las capacidades conversacionales y de instrucciones del modelo base Qwen2.5-0.5B-Instruct, aunque no se han validado en este checkpoint.
- Tool calling / function calling: no declarado ni documentado.
- Soporte de agentes y razonamiento multi-paso: no declarado ni documentado.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Generación de la siguiente actividad en MyVillage: el modelo recibe el objetivo de la aldea, la actividad anterior, el envío de conocimiento del alumno y el objeto de sabiduría correspondiente, y devuelve un JSON con título, descripción e instrucciones listo para renderizar en la interfaz. Es el caso de uso para el que fue entrenado explícitamente.
- Prototipado de tutores educativos de bajo coste: con 494 M de parámetros puede ejecutarse en una única GPU consumer o incluso en CPU, lo que permite iterar sobre la lógica pedagógica sin presupuesto de inferencia significativo.
- Generación de borradores de instrucciones didácticas para revisión humana: el JSON de salida se puede usar como punto de partida que un docente revisa y edita, aprovechando la ventana de 1024 tokens para incluir el contexto del capítulo y del objetivo.
- Motor de contenido dentro de un pipeline educativo automatizado: al devolver JSON bien delimitado, la salida se puede parsear y validar con esquemas antes de insertarla en una base de datos de actividades.
- Evaluación comparativa de currículos adaptativos: al variar el objetivo de la aldea o el envío de conocimiento y mantener el resto de la entrada fija, se pueden estudiar diferencias de comportamiento entre distintas políticas pedagógicas en un entorno controlado.
- Despliegue en entornos con hardware limitado, como aulas, laboratorios escolares o dispositivos sin GPU dedicada, mediante cuantización a 4 u 8 bits o ejecución en CPU con llama.cpp.
- Base para experimentación académica con QLoRA: al ser un checkpoint pequeño y con licencia Apache 2.0, resulta adecuado como punto de partida para estudiar el efecto del tamaño del dataset y de las épocas en tareas de generación estructurada.
- Generación de material de refuerzo personalizado: el modelo puede producir actividades adicionales cuando el envío de conocimiento indica que un concepto no se ha consolidado, manteniendo el objetivo de la aldea como contexto de largo plazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (MMLU, HumanEval, GSM8K ni ninguna otra), y las búsquedas web realizadas no devolvieron enlaces con evaluaciones de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los 494.032.768 parámetros, no publicada por el autor):
  - FP16/BF16: en torno a 1,0 GB de pesos, más caché KV y overhead, aproximadamente 1,5 GB en total.
  - INT8: en torno a 0,5 GB de pesos, aproximadamente 1,0 GB en total.
  - INT4 (por ejemplo Q4_K_M): en torno a 0,35-0,4 GB de pesos, aproximadamente 0,8 GB en total.
- El caché KV a 1024 tokens es del orden de decenas de MB en FP16 (estimación).
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4090. Para servicio con alta concurrencia se pueden usar A100 o H100 replicando el modelo muchas veces por GPU.
- Cabe holgadamente en GPU consumer e incluso en CPU moderna; también es viable en dispositivos integrados con memoria suficiente.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM (la arquitectura Qwen2 está soportada por el runtime, aunque no hay validación publicada de este checkpoint), conversión a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo de este tamaño suele generar cientos de tokens por segundo en una RTX 4090 con un runtime optimizado y decenas de tokens por segundo en CPU con llama.cpp, pero son estimaciones no verificadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mjpsm/activity-generation-v1.3.5-qwen0.5b-629 | 494.032.768 | 1024 tokens (entrenamiento) | Apache 2.0 | HuggingFace, safetensors | Especializado en generación de actividades MyVillage; 629 ejemplos de entrenamiento; sin benchmarks publicados |
| Qwen/Qwen2.5-0.5B-Instruct | 494.032.768 (mismo orden) | No disponible en la información proporcionada | Apache 2.0 | HuggingFace | Modelo base sin ajustar; capacidades generales de instrucciones y conversación, no especializado en la tarea |
| Modelos instructivos pequeños de propósito general (rango 0,4-1,1 B) | 0,4-1,1 B | Variable, no disponible | Habitualmente permisivas | HuggingFace | Alternativas genéricas que requerirían un ajuste fino propio para alcanzar el comportamiento de generación de actividades |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada, por lo que la comparación se limita a parámetros, contexto declarado, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo describe como un checkpoint de modelo pequeño entrenado sobre un dataset sintético reducido, y recomienda evaluar la calidad de comportamiento en escenarios MyVillage reservados antes de usarlo en producción.
- Dataset de entrenamiento de solo 629 ejemplos con 4 épocas: riesgo alto de sobreajuste a los patrones concretos del conjunto sintético y de degradación fuera de esa distribución.
- Riesgo de alucinación: el modelo puede inventar contenidos de libros, capítulos o referencias que no aparecen en el objeto de sabiduría proporcionado, especialmente al generar los campos `description` e `instructions`.
- Posible desalineación de formato: aunque fue entrenado para emitir JSON con `title`, `description` e `instructions`, no hay garantía publicada de que la salida sea siempre JSON válido, por lo que conviene validarla con un parser y un esquema estrictos.
- Longitud de contexto de 1024 tokens: entradas más largas (objetivos extensos, capítulos largos o historiales de actividad amplios) pueden truncarse o degradar la calidad de la respuesta.
- Idiomas soportados no declarados: no hay confirmación de qué lenguas maneja correctamente, más allá de lo que herede del modelo base.
- Sesgos: al no documentarse la composición del dataset, no es posible caracterizar los sesgos pedagógicos, culturales o lingüísticos presentes en las salidas.
- Heurísticas de comportamiento rígidas: reglas como evitar la palabra "but" o tratar el envío de conocimiento como evidencia dominante pueden producir respuestas menos matizadas en casos límite.
- Inconsistencia de metadatos: la model card indica que el nombre del repositorio usa una etiqueta de checkpoint distinta al número de ejemplos del dataset validado, lo que puede confundir a la hora de rastrear versiones.
- Licencia Apache 2.0 en este checkpoint, favorable al uso comercial, pero conviene verificar por separado los términos aplicables al modelo base Qwen2.5-0.5B-Instruct antes de un despliegue comercial.
- Cero descargas y cero likes en el momento de la consulta, sin evaluación externa independiente conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mjpsm/activity-generation-v1.3.5-qwen0.5b-629
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper, blog o repositorio del proyecto MyVillage: no disponible
- Demo: no disponible
- Otras referencias: las búsquedas web realizadas no devolvieron enlaces relevantes a este modelo; solo aparecieron resultados genéricos de servicios de traducción, sin relación con el checkpoint.
