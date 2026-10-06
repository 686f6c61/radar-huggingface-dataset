# PamelaAlam/smollm2-360m-ia-generativa-lora

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre `HuggingFaceTB/SmolLM2-360M-Instruct`, un transformer decoder-only de en torno a 362 millones de parámetros. Lo publica el usuario PamelaAlam como registro de un taller sobre destilación de conocimiento aplicada a inteligencia artificial generativa en empresas de Chile y Latinoamérica. El adaptador añade 8,68 millones de parámetros entrenables, un 2,34 % del total del modelo fusionado, mediante LoRA con r=16, alpha=32 y dropout de 0,05 sobre los módulos de atención y de la MLP.

El interés del proyecto es metodológico más que práctico: documenta un ciclo de destilación en el que un modelo profesor, accedido a través de la API de OpenAI, genera la taxonomía de temas, las tareas del dominio y las respuestas que sirven como ejemplos de entrenamiento. Después se ajusta el modelo pequeño y un modelo juez evalúa sus respuestas contra un conjunto fijo que nunca se usa para entrenar. La corrida publicada empleó 12 ejemplos, 1 época, 2 pasos de optimización y 2.797 tokens de entrenamiento, ejecutados íntegramente en CPU con 8 hilos.

El propio autor advierte de que el adaptador no mejora al modelo base: ambos obtienen 1,50 sobre 10 en su conjunto de evaluación de 6 preguntas, con una tasa de aprobación del 0 %. Se publica como evidencia de un experimento y no como un modelo recomendado para uso práctico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; adaptador LoRA (PEFT) sobre SmolLM2-360M-Instruct |
| Parámetros totales | 362 M en el modelo base; 371 M con el adaptador fusionado |
| Parámetros activos | no aplica (no es MoE); 8,68 M entrenables en el adaptador (2,34 %) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | no disponible para el adaptador; el modelo base admite cuantizaciones estándar (bfloat16, int8, int4) vía GGUF/llama.cpp |
| Idiomas soportados | español (idioma declarado del adaptador); el modelo base es multilingüe con foco en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de la familia SmolLM2. Según los resultados de búsqueda, el modelo base de 361 M de parámetros se entrenó sobre 4 billones de tokens y ocupa unos 724 MB en bfloat16. El adaptador LoRA se inserta en siete módulos: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rango 16, alpha 32 y dropout 0,05. No hay ninguna innovación arquitectónica propia: el repositorio solo contiene los pesos del adaptador.

El entrenamiento se realizó en CPU con 8 hilos y sin GPU, con un lote efectivo de 8, tasa de aprendizaje 2e-4, 1 época y 2 pasos de optimización. La pérdida bajó de 2,778 a 2,614, el consumo máximo de memoria fue de 2,1 GB y la duración total de 1 minuto y 43 segundos. Los datos no provienen de un corpus existente: fueron generados por un modelo profesor de OpenAI, de modo que heredan sus errores y sesgos sin verificación humana. No se documenta ningún proceso de RLHF ni de DPO. El pipeline utilizado se denomina `slm-autonomo` y la corrida se identifica como `20261005-181807`, checkpoint `round_001`. El diseño original del taller contempla unas 8 rondas de 200 tareas cada una; esta corrida usó aproximadamente el 1 % de ese volumen de forma deliberada, para medir tiempo y coste antes de comprometer presupuesto.

## Capacidades

- Generación de texto en español, condicionada por la plantilla de chat del modelo base instruct.
- Respuesta a preguntas sobre el dominio declarado: fundamentos de modelos de lenguaje, RAG y búsqueda semántica, ajuste fino, destilación, evaluación y LLMOps.
- No hay evidencia de soporte de tool calling ni de function calling en la información disponible.
- No hay evidencia de soporte para agentes ni de razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al comportamiento del modelo base; el ajuste se realizó únicamente en español.
- En la práctica, la calidad de las respuestas es muy baja: el propio autor indica que genera texto incoherente y repetitivo con frecuencia.

## Casos de uso

- Material didáctico para talleres de LoRA y PEFT: el repositorio documenta los hiperparámetros, la configuración de módulos objetivo y el coste real de una corrida, lo que permite explicar el método con un ejemplo completo y verificable.
- Plantilla reproducible del pipeline de destilación: sirve como referencia para replicar el ciclo profesor-juez-alumno en otros dominios antes de invertir en una corrida completa.
- Estimación de coste y tiempos previos al escalado: los datos de la corrida (2,1 GB de memoria máxima, 1 min 43 s, 2.797 tokens) permiten extrapolar el presupuesto de una ejecución con 8 rondas de 200 tareas.
- Punto de partida para un reentrenamiento serio: el mismo script y los mismos módulos objetivo se pueden reutilizar con un volumen de datos cien veces mayor y con GPU en lugar de CPU.
- Calibración de un sistema de evaluación con modelo juez: el set fijo de 6 preguntas y la escala 1-10 sirven para probar la mecánica de un evaluador automático, aunque no para obtener conclusiones sólidas de rendimiento.
- Pruebas de despliegue en entornos sin GPU: al ser un modelo de 362 M de parámetros, se puede ejecutar en portátiles, contenedores pequeños o dispositivos de borde para validar la integración de PEFT y transformers.
- Línea base negativa en comparativas de experimentos: el checkpoint `round_001` con resultado +0,00 funciona como control frente al que medir corridas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única evaluación documentada es la del taller: 6 preguntas fijas del dominio, nunca usadas para entrenar, calificadas de 1 a 10 por un modelo juez.

| Configuración | Nota media (juez, 1-10) | Tasa de aprobación |
|---|---|---|
| SmolLM2-360M-Instruct sin adaptador | 1,50 | 0 % |
| Con el adaptador LoRA | 1,50 | 0 % |
| Diferencia | +0,00 | — |

La pérdida de entrenamiento descendió de 2,778 a 2,614, lo que indica que el modelo se ajustó a los datos, pero ese ajuste no se tradujo en ninguna mejora medible en el conjunto de evaluación. El propio autor atribuye la ausencia de mejora a tres factores: volumen de datos insuficiente (12 ejemplos en 2 pasos), resolución insuficiente del conjunto de evaluación (6 preguntas con notas enteras) y capacidad limitada del modelo base para responder en español sobre temas técnicos.

## Requisitos de hardware

- Inferencia del modelo base en bfloat16: unos 724 MB de pesos, según los resultados de búsqueda.
- Inferencia en fp32: aproximadamente 1,4 GB; en int8, unos 362 MB; en int4, en torno a 180 MB.
- El adaptador añade 8,68 M de parámetros, es decir, unos 35 MB en fp32 o 17 MB en fp16.
- Cabe en cualquier GPU de consumo, incluidas integradas, y también en CPU. Durante el entrenamiento el consumo máximo fue de 2,1 GB en un equipo sin GPU.
- GPU recomendadas: ninguna en particular; el modelo es viable en RTX 3060, RTX 4090, A100 o H100, pero no las aprovecha. Para entrenamiento a escala conviene una GPU con al menos 8-16 GB de VRAM.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), fusión con `merge_and_unload` y conversión a GGUF para llama.cpp, Ollama (el modelo base está disponible como `smollm2:360m`), vLLM con soporte de adaptadores LoRA y TGI con PEFT.
- Latencia y throughput: no disponibles. El único dato de rendimiento es el tiempo de entrenamiento (2.797 tokens en 1 minuto y 43 segundos en CPU).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre SmolLM2-360M-Instruct) | 362 M base + 8,68 M LoRA | no disponible | 1,50/10 en su evaluación interna (+0,00 frente al base) | Apache 2.0 | HuggingFace, descargas 0 |
| SmolLM2-360M-Instruct (base) | 362 M | no disponible | 1,50/10 en la misma evaluación | Apache 2.0 | HuggingFace, Ollama |
| SmolLM2-135M-Instruct | 135 M | no disponible | no disponible | Apache 2.0 | HuggingFace, Ollama |
| SmolLM2-1.7B-Instruct | 1,7 B | no disponible | no disponible | Apache 2.0 | HuggingFace, Ollama |

## Limitaciones y advertencias

- No debe usarse en producción. El modelo obtiene 1,50 sobre 10 según su propio juez y una tasa de aprobación del 0 %, y genera texto incoherente y repetitivo con frecuencia.
- El adaptador no aporta ninguna mejora medible sobre el modelo base: la diferencia es exactamente +0,00 en la métrica del taller.
- Los datos de entrenamiento fueron generados por otro modelo de lenguaje, por lo que heredan sus errores y sesgos sin revisión humana.
- El conjunto de evaluación consta de 6 preguntas, una muestra demasiado pequeña para extraer conclusiones sólidas.
- La evaluación la realiza un modelo, no personas; las notas son orientativas y no sustituyen a una evaluación humana.
- El ajuste se realizó solo en español sobre un modelo base con foco en inglés, lo que puede degradar el comportamiento en otros idiomas.
- Los datos se generaron con la API de OpenAI, cuyos términos restringen el uso de sus salidas para desarrollar modelos que compitan con OpenAI. El autor declara que este adaptador es un ejercicio educativo y no tiene ese propósito.
- Licencia Apache 2.0 tanto para el adaptador como para el modelo base, lo que en principio permite uso comercial, pero la procedencia de los datos añade una restricción adicional que conviene revisar antes de cualquier explotación.
- No hay ninguna métrica publicada de robustez, sesgo, seguridad o comportamiento fuera del dominio.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/PamelaAlam/smollm2-360m-ia-generativa-lora
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Modelo base SmolLM-360M: https://huggingface.co/HuggingFaceTB/SmolLM-360M
- Versión de Unsloth del modelo base: https://huggingface.co/unsloth/SmolLM2-360M
- Ficha de despliegue de SmolLM2-360M: https://llm.co/llms/smollm2-360m
- Modelo en Ollama: https://ollama.com/library/smollm2:360m
- Tutorial de ejecución local con Ollama: https://www.youtube.com/watch?v=ixjePOJysYU
