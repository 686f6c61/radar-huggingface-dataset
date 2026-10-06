# enriquehernandezg/slm-autonomo-lora

## Resumen

slm-autonomo-lora es un adaptador LoRA (PEFT) publicado por el usuario enriquehernandezg sobre el modelo base nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1, un transformer causal decoder-only de 4,5 B parámetros. El adaptador no es un modelo independiente: se distribuye como pesos PEFT en safetensors (≈ 120 MB) que requieren descargar el base (≈ 9 GB) desde Hugging Face. Está especializado en español como asistente sobre IA generativa aplicada a empresas, con un currículo limitado a cuatro temas: fundamentos de LLM, RAG y búsqueda semántica, ajuste fino y destilación, y evaluación y LLMOps.

Su interés no está en el rendimiento, sino en el método: el autor documenta un pipeline de destilación autónomo en el que un LLM de OpenAI actúa como profesor (genera currículo y respuestas de referencia) y como juez (puntúa cada ronda con una rúbrica de cuatro criterios), mientras el modelo pequeño se ajusta localmente con QLoRA. Todo el ciclo se ejecutó en una GPU de portátil (RTX 3050 de 4 GB) con un coste de API declarado de 0,27 dólares y 17 minutos de cómputo.

La relevancia es, por tanto, educativa y metodológica: demuestra que un ciclo profesor-juez-estudiante es viable con hardware de consumo, pero el propio autor advierte que es una corrida de demostración de dos rondas y 59 ejemplos, con nota media de 3,00 sobre 10 y 0 % de aprobación, y que no debe usarse en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (modelo base Llama 3.1 Nemotron Nano 4B); adaptador LoRA sobre proyecciones q, k, v, o, gate, up, down |
| Parámetros totales | 4,54 B en el modelo base; el adaptador publicado contiene 30,4 M parámetros entrenables (≈ 0,67 % del base) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; el entrenamiento usó un máximo de 256 tokens y la generación de ejemplo 200 tokens |
| Tipos de cuantización | Entrenamiento con QLoRA en 4 bits NF4 (cómputo en bf16); el repositorio no publica cuantizaciones del adaptador |
| Idiomas soportados | Español (único idioma declarado) |
| Licencia | NVIDIA Open Model License, con Llama 3.1 Community License heredada del modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1, un transformer decoder-only de 4,5 B parámetros de la familia Llama 3.1. El ajuste se hizo con LoRA de rango 16, alpha 32 y dropout 0,05 sobre las proyecciones q, k, v, o, gate, up y down, con el modelo base cuantizado a 4 bits NF4 (QLoRA) y cómputo en bf16. Los hiperparámetros declarados son learning rate 2e-4 con warmup del 5 %, batch efectivo de 8 (1 × 8 de acumulación), una época por ronda, longitud máxima de secuencia de 256 tokens y 13 pasos de optimización en total (5 en la ronda 1 y 8 en la ronda 2).

El dato diferencial es el procedimiento de destilación autónoma. En la ronda 0 se define una taxonomía de temas y un set de evaluación fijo de 8 preguntas que nunca se usa para entrenar, y se mide la nota base. A partir de ahí, cada ronda genera un currículo adaptativo que carga más tareas sobre los temas débiles, el profesor (API de OpenAI) produce las respuestas de referencia, el estudiante se ajusta con datos nuevos más un 50 % de repaso, y el juez califica el checkpoint, que se promueve, acepta o revierte. Los datos son pares instrucción-respuesta sintéticos, deduplicados y filtrados por calidad, con 40 tareas nuevas por ronda repartidas en 30 % básicas, 50 % intermedias y 20 % avanzadas. El checkpoint publicado corresponde a la ronda 2 y se entrenó con 59 ejemplos (1 descartado por el filtro). No se declara uso de RLHF ni DPO.

## Capacidades

- Generación de texto en español con formato conversacional (chat template de Llama 3.1 con rol de sistema, usuario y asistente).
- Asistencia divulgativa sobre IA generativa empresarial, restringida a los cuatro temas del currículo: fundamentos de LLM, RAG y búsqueda semántica, ajuste fino y destilación, y evaluación y LLMOps.
- Respuestas directas sin cadena de razonamiento larga: se entrenó con la instrucción de sistema "detailed thinking off" del modelo base Nemotron.
- Soporte de tool calling o function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible; el pipeline autónomo es del proceso de entrenamiento, no una capacidad del adaptador.
- Capacidades multilingües: no; solo español declarado.
- Capacidades especiales (visión, audio, modo thinking): no disponibles. El modelo base es multimodal según su propia ficha, pero el adaptador se entrenó solo con texto.

## Casos de uso

- Material didáctico sobre el propio pipeline: el repositorio sirve como ejemplo reproducible de un ciclo profesor-juez-estudiante con QLoRA, útil para quien quiera replicar el método en una GPU de consumo.
- Prácticas de ajuste fino en cursos y talleres: al ser un adaptador de 120 MB con 13 pasos de optimización y un coste de API de 0,27 dólares, es un caso de estudio asequible para enseñar LoRA, QLoRA y evaluación con juez LLM.
- Prototipado de asistentes verticales en español: el adaptador demuestra el formato de especialización por dominio (aquí, IA generativa para empresas) antes de invertir en un corpus mayor.
- Banco de pruebas de rúbricas de evaluación: el set fijo de 8 preguntas y los cuatro criterios (corrección, completitud, claridad, idioma y formato) sirven como plantilla para diseñar evaluaciones propias.
- Comparación de estrategias de currículo adaptativo: permite experimentar con reparto de dificultad (30/50/20), repaso del 50 % y promoción o reversión de checkpoints.
- Investigación sobre destilación de bajo presupuesto: cuantifica qué mejora se obtiene con 2 rondas y menos de 60 ejemplos (+0,75 puntos, +33 %), como línea base para estudiar rendimientos decrecientes.
- No se recomienda su uso en atención al cliente, generación de código en producción ni ningún escenario real, dado que la nota media es 3,00/10 y la aprobación es del 0 %.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. La única evaluación es la del juez LLM con rúbrica de 4 criterios (escala 1-10) sobre un set fijo de 8 preguntas:

| Ronda | Decisión | Nota media | Delta |
|---|---|---|---|
| 0 (modelo base) | — | 2,25 | — |
| 1 | promovido | 2,75 | +0,50 |
| 2 (checkpoint publicado) | promovido | 3,00 | +0,25 |

Mejora acumulada: +0,75 puntos (+33 % sobre el modelo base). Aprobación (nota ≥ 7): 0 % en todas las rondas.

| Criterio (ronda 2) | Nota (base entre paréntesis) |
|---|---|
| Corrección | 3,9 (3,8) |
| Completitud | 2,1 (1,4) |
| Claridad | 3,4 (3,1) |
| Idioma y formato | 7,0 (5,6) |

| Tema (ronda 2) | Nota (base entre paréntesis) |
|---|---|
| Fundamentos de LLM | 4,0 (2,5) |
| Evaluación y LLMOps | 3,0 (2,0) |
| Ajuste fino y destilación | 2,5 (2,0) |
| RAG y búsqueda semántica | 2,5 (2,5) |

## Requisitos de hardware

- Adaptador: ≈ 120 MB en disco; el repositorio completo ocupa 0,1 GB.
- Modelo base: ≈ 9 GB de descarga en precisión original (4,54 B parámetros); el adaptador se descarga aparte.
- VRAM estimada para inferencia (cálculo propio, no declarado por el autor): 2,5-3,5 GB en cuantización de 4 bits, 9-10 GB en bf16/fp16. El adaptador añade un consumo despreciable.
- GPU recomendadas: cualquier GPU con 4 GB o más para 4 bits; 12-16 GB para bf16. El autor entrenó con una RTX 3050 Laptop de 4 GB, con pico de 6,9 GB de memoria durante el entrenamiento.
- Cabe en GPU de consumo: sí, en 4 bits cabe en RTX 3050, RTX 3060, RTX 4060 y superiores; en bf16 requiere RTX 4070 Ti Super, RTX 4080 o RTX 4090.
- Opciones de despliegue: transformers + peft es la ruta documentada (AutoPeftModelForCausalLM). No se declaran recetas para vLLM, llama.cpp, Ollama ni TGI; para estas opciones habría que fusionar el adaptador con el base y convertir los pesos.
- Latencia y throughput: no disponibles. La ficha solo indica que el modelo base usa 16,9 GB de RAM en el equipo de entrenamiento y que la generación de ejemplo está limitada a 200 tokens nuevos.

## Comparativa con modelos similares

No se identifican en la información proporcionada adaptadores comparables de la misma categoría (LoRA en español sobre un SLM de ~4 B). La comparación más significativa es contra el propio modelo base sin adaptador:

| Modelo | Parámetros | Contexto | Nota media (juez, n = 8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| slm-autonomo-lora (este) | 30,4 M de adaptador sobre 4,54 B | no disponible | 3,00 | NVIDIA Open Model License + Llama 3.1 Community | Hugging Face (pesos PEFT) |
| nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1 | 4,54 B | no disponible en esta información | 2,25 | NVIDIA Open Model License + Llama 3.1 Community | Hugging Face (pesos completos) |
| Otros adaptadores LoRA en español de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una corrida de demostración corta: 2 rondas, 59 ejemplos en la última ronda, 8 preguntas de evaluación y un presupuesto declarado de 2 dólares. El autor indica explícitamente que no debe usarse en producción.
- La nota media es 3,00 sobre 10 y el porcentaje de aprobación (nota ≥ 7) es del 0 % en todas las rondas.
- Debilidades detectadas por el juez: respuestas incompletas o truncadas (por el límite de 160 tokens de generación), confusiones conceptuales (por ejemplo, expandir mal la sigla RAG o confundir búsqueda semántica con coincidencia de palabras) y planes demasiado genéricos en ajuste fino y destilación.
- El set de evaluación es muy pequeño (n = 8, desviación estándar de 0,71 en la ronda 2), por lo que una diferencia de ±0,25 entre rondas puede ser ruido estadístico.
- La longitud máxima de secuencia en entrenamiento fue de 256 tokens, muy inferior al contexto nominal del modelo base; no se declara cómo se comporta con entradas largas.
- Idioma único (español): no hay evidencia de rendimiento en otros idiomas.
- Hereda los sesgos y limitaciones del modelo base (NVIDIA) y del modelo profesor (API de OpenAI), incluidos los sesgos de los datos sintéticos generados.
- Licencia: NVIDIA Open Model License más Llama 3.1 Community License. Cualquier uso comercial queda sujeto a ambas, y la ficha menciona además que los términos de OpenAI restringen el uso de sus salidas para desarrollar modelos competidores.
- El uso previsto es educativo; no se documentan garantías de exactitud, seguridad ni robustez frente a entradas adversarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enriquehernandezg/slm-autonomo-lora
- Modelo base: https://huggingface.co/nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (corresponden a una entidad financiera), por lo que no se incluye ninguno.
