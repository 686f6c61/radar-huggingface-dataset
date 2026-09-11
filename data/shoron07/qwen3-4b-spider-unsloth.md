# shoron07/qwen3-4b-spider-unsloth

## Resumen

`shoron07/qwen3-4b-spider-unsloth` es un adaptador LoRA de tipo text-to-SQL entrenado sobre el modelo base `unsloth/Qwen3-4B-unsloth-bnb-4bit` mediante QLoRA de 4 bits acelerado con Unsloth. Lo publica el usuario shoron07 como experimento de portafolio: un entrenamiento compacto de 100 pasos (18,15 minutos en una única Tesla T4) que ajusta un Transformer denso de unos 4.000 millones de parámetros para convertir esquemas SQLite y preguntas en inglés en consultas SQL.

El problema que aborda es acotado y bien definido: dado un `CREATE TABLE` y una pregunta en lenguaje natural, generar la consulta SQL correspondiente. Sobre el conjunto de validación completo del benchmark Spider (1.034 ejemplos, con separación de bases de datos entre entrenamiento y validación), el adaptador eleva el exact match normalizado con SQLGlot del 22,63 % del modelo base al 39,46 %, una mejora relativa del 74,4 %, alcanzando además el 100 % de validez sintáctica y de cumplimiento de "solo SQL" en la respuesta.

Su relevancia es fundamentalmente metodológica: demuestra que con 33.030.144 parámetros entrenables (0,81 % del total), 8.555 ejemplos y una GPU de gama de entrada se puede obtener una mejora medible en una tarea estructurada. No obstante, se trata de un experimento sin época completa, con 0 descargas y 0 likes en el momento de la consulta, y sin licencia declarada, por lo que no está pensado para producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) con adaptador LoRA acoplado al modelo base |
| Parametros totales | ~4.000 millones en el modelo base; 33.030.144 parámetros entrenables en el adaptador (0,81 % del total) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens nativos del modelo base Qwen3-4B; el adaptador se entrenó con longitud máxima de 2.048 tokens |
| Tipos de cuantizacion | Modelo base en 4-bit NF4 (bitsandbytes); adaptador en safetensors. No se publican versiones GGUF propias |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible (el repositorio no declara licencia; el modelo base Qwen3-4B se publica bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); modelo base en formato Transformers cargado con bitsandbytes |

Otros datos del repositorio: `library_name: peft`, pipeline `text-generation`, tamaño del repositorio 0,1 GB, creado el 10 de septiembre de 2026, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-4B original: un Transformer decoder-only denso, sin mezcla de expertos ni componentes de estado recurrente. Sobre él se aplica un adaptador LoRA de rango 16 y alpha 32, entrenado con QLoRA de 4 bits bajo el framework Unsloth. El ajuste usa precisión FP16, optimizador AdamW de 8 bits, learning rate 2e-4, batch efectivo de 8 y 100 pasos de entrenamiento, con un pico de memoria de GPU de 4,77 GB sobre una sola Tesla T4. No se completó una época completa; el autor lo describe explícitamente como un experimento de portafolio compacto.

Los datos provienen del dataset `hujudev/spider-text-2-sql`, derivado del benchmark Spider. El pipeline de preparación incluye separación de bases de datos entre entrenamiento y validación (sin solapamiento), validación de valores ausentes y duplicados, eliminación de ocho duplicados exactos de entrenamiento, formato conversacional de Qwen3, entrenamiento únicamente sobre las respuestas del asistente (response-only) y auditoría de longitudes de token con eliminación de 96 ejemplos de entrenamiento que excedían el límite. El conjunto final queda en 8.555 ejemplos de entrenamiento y 1.034 de validación. No se documenta ningún uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de consultas SQL a partir de un esquema SQLite y una pregunta en inglés, incluyendo filtros, agregaciones (`COUNT`, `SUM`), ordenaciones y condiciones sobre columnas.
- Formato de salida limpio: el adaptador alcanza el 100 % de cumplimiento "solo SQL" en la evaluación reportada, es decir, no añade texto explicativo alrededor de la consulta.
- Validez sintáctica: 100 % de las consultas generadas en validación son sintácticamente válidas según la métrica reportada.
- Comprensión de esquemas declarados como sentencias `CREATE TABLE`.
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no; el modelo está etiquetado únicamente como inglés.
- Capacidad especial: no se documentan modos de pensamiento, visión ni audio. Se conserva la capacidad generativa general del Qwen3-4B subyacente, aunque degradada por el ajuste específico y no evaluada por el autor.

## Casos de uso

- Demostración de text-to-SQL en notebooks y charlas técnicas: el modelo acepta un esquema y una pregunta y devuelve la consulta, lo que permite ilustrar un pipeline completo de NL2SQL con 1.034 ejemplos de validación reproducibles.
- Prototipado de asistentes de consulta sobre bases de datos SQLite internas: se puede conectar a una herramienta de ejecución de consultas para que un analista formule preguntas en inglés y obtenga el SQL base, que luego se revisa antes de ejecutar.
- Ejemplo docente de QLoRA con Unsloth: sirve como plantilla de referencia para reproducir un ajuste de 100 pasos y 18 minutos en una GPU T4, con el historial de entrenamiento y las métricas disponibles en el directorio `results` del repositorio.
- Investigación sobre ajuste eficiente en parámetros: permite estudiar el efecto de LoRA r=16 sobre una tarea estructurada y comparar el comportamiento del adaptador frente al modelo base sin tocar.
- Generación de borradores de consultas para revisión humana: dado que la validez sintáctica es del 100 % pero la corrección lógica no está garantizada, encaja como primer borrador en un flujo donde un ingeniero de datos valida y corrige.
- Herramienta interna de exploración de esquemas: para bases de datos SQLite pequeñas y bien documentadas donde el usuario conoce el dominio y puede detectar errores lógicos de forma inmediata.
- Benchmarking de métricas NL2SQL: útil para comparar exact match normalizado con SQLGlot frente a métricas de exactitud de ejecución, ya que el autor reporta explícitamente la diferencia entre ambas.

## Benchmarks y rendimiento

Evaluación sobre los 1.034 ejemplos de validación de Spider, con bases de datos separadas entre entrenamiento y validación.

| Metrica | Modelo base | Adaptador ajustado | Cambio |
|---|---:|---:|---:|
| Exact match normalizado | 22,63 % | 39,46 % | +16,83 puntos |
| Validez sintactica SQL | 99,61 % | 100,00 % | +0,39 puntos |
| Cumplimiento "solo SQL" | 99,71 % | 100,00 % | +0,29 puntos |

La mejora relativa en exact match normalizado es del 74,4 % aproximadamente. El propio autor advierte de que se trata de una métrica estricta normalizada con SQLGlot y no de exactitud de ejecución, por lo que consultas semánticamente equivalentes pueden contabilizarse como distintas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba general en la información disponible.

## Requisitos de hardware

- VRAM en 4 bits (NF4): aproximadamente 2,5-3 GB solo para los pesos del Qwen3-4B, más caché KV y overhead; en la práctica entre 4 y 5 GB para inferencia a 2.048 tokens de contexto.
- VRAM en FP16/BF16: en torno a 8-9 GB para los pesos, más activaciones y caché.
- Entrenamiento observado: pico de 4,77 GB con QLoRA de 4 bits, batch efectivo 8 y secuencia de 2.048 tokens sobre una Tesla T4.
- GPU recomendadas: Tesla T4 suficiente para reproducir el entrenamiento; RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores para inferencia y ajuste local; A100 o H100 sobredimensionadas para este tamaño, útiles solo para servir en lote.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM usando la base en 4 bits.
- Opciones de despliegue: Transformers con PEFT (carga directa del adaptador), vLLM y TGI tras fusionar el adaptador con el modelo base, llama.cpp u Ollama tras fusionar y convertir a GGUF (proceso no documentado por el autor), y Unsloth para reentrenamiento.
- Latencia y throughput: no disponible; el autor no publica mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exact match normalizado (Spider val.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shoron07/qwen3-4b-spider-unsloth | 4B (33,03 M entrenables) | 32.768 en el base; entrenado a 2.048 | 39,46 % | no disponible | HuggingFace, 0 descargas |
| unsloth/Qwen3-4B-unsloth-bnb-4bit (base) | 4B | 32.768 | 22,63 % | Apache 2.0 (modelo Qwen3-4B) | HuggingFace |
| Otros adaptadores text-to-SQL sobre Spider | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos publicados frente a alternativas especializadas en text-to-SQL (por ejemplo, modelos de la familia SQLCoder o ajustes sobre CodeLlama) en la información proporcionada, por lo que no se pueden establecer comparaciones cuantitativas fiables.

## Limitaciones y advertencias

- Entrenamiento de solo 100 pasos: no se completó una época, lo que limita la generalización del adaptador.
- Métrica reportada: el exact match normalizado con SQLGlot no equivale a exactitud de ejecución; el propio autor lo señala como una métrica estricta que penaliza equivalencias semánticas.
- SQL sintácticamente válido no implica SQL lógicamente correcto: con un 100 % de validez sintáctica y solo un 39,46 % de exact match, una mayoría de consultas válidas seguiría siendo incorrecta o distinta de la esperada.
- Rendimiento desconocido fuera de tareas SQLite de estilo Spider en inglés: no hay evaluación en otros dialectos (PostgreSQL, MySQL, T-SQL) ni en otros dominios.
- Idioma: únicamente inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Licencia: el repositorio no declara licencia, lo que impide determinar las condiciones de uso comercial del adaptador. El modelo base Qwen3-4B sí se publica bajo Apache 2.0.
- Riesgo de alucinación: al ser un modelo generativo, puede inventar tablas, columnas o funciones no presentes en el esquema, especialmente con esquemas grandes o poco frecuentes.
- Advertencia de producción: el autor recomienda validar las consultas antes de ejecutarlas contra una base de datos. Añadir una capa de validación de esquema y de permisos es imprescindible.
- Madurez del artefacto: 0 descargas y 0 likes, sin comunidad que haya verificado los resultados de forma independiente.
- Repositorio de 0,1 GB: el adaptador por sí solo no es autosuficiente; requiere descargar el modelo base cuantizado aparte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shoron07/qwen3-4b-spider-unsloth
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/hujudev/spider-text-2-sql
- Benchmark Spider: no se proporciona enlace en la información disponible
- Unsloth: no se proporciona enlace en la información disponible
- SQLGlot: no se proporciona enlace en la información disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas sobre pruebas genéticas en cáncer de próstata y no guardan relación con esta ficha.
