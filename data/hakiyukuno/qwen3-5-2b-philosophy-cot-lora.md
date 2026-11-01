# Hakiyukuno/Qwen3.5-2B-Philosophy-CoT-LoRA

## Resumen

Qwen3.5-2B-Philosophy-CoT-LoRA es un adaptador LoRA (PEFT) publicado por el usuario Hakiyukuno sobre el modelo base Qwen/Qwen3.5-2B. Su objetivo es especializar un modelo pequeno de 2.000 millones de parametros en tareas de filosofia academica (epistemologia, metafisica, etica, filosofia griega, alemana clasica, racionalismo, empirismo y pensamiento chino clasico) mediante un formato de razonamiento estructurado en cadena de pensamiento (Chain-of-Thought).

El adaptador no modifica la arquitectura del modelo base: anade 14.450.688 parametros entrenables (0,7621% del total) en las proyecciones de atencion y MLP mediante LoRA con rango 16 y alpha 32. El entrenamiento se realizo con 1.080 ejemplos de conversacion CoT de alta calidad, 120 de validacion y 100 de test independiente, en precision bfloat16 y con el optimizador paged_adamw_8bit.

La relevancia de esta ficha es doble: por un lado, documenta una receta de ajuste fino reproducible en hardware de consumo (una sola RTX 4060 de 8 GB); por otro, propone un formato de salida convergente (categoria -> exclusion -> respuesta) que, segun el autor, corrige el problema tipico de los modelos pequenos de divagar sin llegar a una respuesta en tareas de razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-2B) con adaptador LoRA |
| Parametros totales | 2B en el modelo base; 14.450.688 parametros entrenables en el adaptador (0,7621%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en bfloat16; el modelo base admite cuantizacion estandar, no documentada aqui) |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-2B |
| Libreria | peft (compatible con transformers) |
| Tamano del repositorio | 0,1 GB |
| Rango LoRA / alpha / dropout | r=16 / alpha=32 / 0,05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Precision de entrenamiento | bfloat16 |
| Optimizador | paged_adamw_8bit |
| Learning rate | 2e-4 con decaimiento coseno |
| Epocas / pasos | 3 epocas / 204 pasos |
| Batch efectivo | 16 (batch 2 x acumulacion 8) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parametros. La intervencion es puramente LoRA: se inyectan matrices de bajo rango en las siete proyecciones lineales del bloque (atencion y MLP), con rango 16 y alpha 32, lo que supone 14,45 millones de parametros entrenables. No se modifica el tokenizador ni la ventana de contexto del modelo base, y no se documenta ninguna innovacion arquitectonica adicional (sin decodificacion especulativa, atencion lineal ni modulos SSM).

El entrenamiento se realizo en tres epocas (204 pasos) con un corpus de 1.080 conversaciones CoT construidas a partir del subconjunto `philosophy` de `cais/mmlu` y de un corpus de filosofia clasica china y occidental (Platón, Aristoteles, Kant, Hegel, Descartes, Hume, Spinoza, pre-Qin y neoconfucianismo Song-Ming). El formato de respuesta forzado es una secuencia de tres fases: analisis de categoria, exclusion item por item y respuesta explicita. Segun el autor, este diseno reduce la latencia media de 9,70 s a 5,88 s porque el modelo converge en lugar de divagar. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre cadenas de razonamiento ya curadas.

## Capacidades

- Generacion de texto conversacional en chino e ingles, con registro academico y terminologia filosofica especializada.
- Razonamiento en cadena de pensamiento estructurado: el modelo produce un esquema de tres fases (categoria, exclusion, respuesta) antes de emitir la solucion.
- Resolucion de preguntas de opcion multiple de filosofia (epistemologia, metafisica, etica, historia de la filosofia).
- Analisis comparado de tradiciones filosoficas: griega clasica, alemana clasica, racionalismo, empirismo y pensamiento chino (pre-Qin, Song-Ming).
- Formato de chat compatible con `apply_chat_template` de transformers, con rol de sistema para fijar la persona.
- Generacion determinista (`do_sample=False`) documentada en el ejemplo oficial, adecuada para evaluacion reproducible.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking explicito mas alla del CoT textual.

## Casos de uso

- Evaluacion academica automatizada: el adaptador puede generar respuestas razonadas a preguntas tipo MMLU de filosofia con formato convergente, util para construir bancos de preguntas o como corrector asistido en cursos de humanidades.
- Tutor conversacional de filosofia: con el rol de sistema propuesto por el autor, el modelo guia al estudiante a traves de la distincion de categorias y la exclusion de opciones, en lugar de dar la respuesta directamente.
- Generacion de material didactico: produccion de explicaciones estructuradas de conceptos (por ejemplo, la distincion kantiana entre juicio analitico y sintetico) en chino o ingles para apuntes y guiones de clase.
- Prototipado de pipelines CoT en hardware de consumo: al requerir unos 5,5 GB de VRAM para el entrenamiento y un adaptador de 0,1 GB, sirve como banco de pruebas de tecnicas de razonamiento estructurado antes de escalar a modelos mayores.
- Investigacion sobre formatos de salida: el par (base, adaptador) permite medir de forma aislada el efecto de un formato CoT concreto sobre la tasa de convergencia y la latencia, controlando el resto de variables.
- Filtrado y anotacion de corpus filosoficos: el modelo puede clasificar y justificar la adscripcion de fragmentos a corrientes (estoicismo, idealismo aleman, neoconfucianismo) con una traza de razonamiento auditable.
- Demostraciones educativas de ajuste fino: la receta completa (LoRA r=16, 3 epocas, 1.080 ejemplos, RTX 4060) es replicable como ejercicio docente de PEFT.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un test independiente de 25 preguntas de filosofia academica (sin contaminacion de entrenamiento):

| Metrica | Base Qwen3.5-2B | Modelo ajustado | Diferencia |
|---|---|---|---|
| Precision en preguntas objetivas | 0,00% | 56,00% | +56,00 pp |
| Cumplimiento de formato estructurado | 12,00% | 100,00% | +88,00 pp |
| Latencia media por muestra | 9,70 s | 5,88 s | 39,4% mas rapido |

No se han publicado resultados de benchmarks estandar (MMLU completo, HumanEval, GSM8K) en la informacion disponible. La muestra de evaluacion es de 25 items, por lo que los intervalos de confianza son amplios y los resultados deben interpretarse como indicativos.

## Requisitos de hardware

- VRAM para inferencia: el adaptador ocupa 0,1 GB; el modelo base en bfloat16 requiere aproximadamente 4-5 GB, y en cuantizacion de 4 bits puede situarse en torno a 1,5-2 GB (estimacion, no documentada por el autor).
- VRAM para entrenamiento: aproximadamente 5,5 GB, segun el autor, con batch 2 y acumulacion 8 en bfloat16.
- GPU recomendadas: cualquier GPU con 8 GB o mas para entrenamiento (el autor cita una RTX 4060 de 8 GB); para inferencia, GPU de consumo como RTX 3060/4060/4090 son suficientes.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores, especialmente con cuantizacion del modelo base.
- Opciones de despliegue: transformers + peft (documentado), y previsiblemente vLLM, TGI o llama.cpp tras fusionar el adaptador con el modelo base y convertir a GGUF (no documentado por el autor).
- Latencia y throughput: 5,88 s por muestra en el entorno de evaluacion del autor (hardware no especificado); no se publican metricas de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Philosophy-CoT-LoRA | 2B + 14,45M (LoRA) | no disponible | Filosofia academica con CoT | Apache-2.0 | Hugging Face (18 descargas) |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | Proposito general | Apache-2.0 (segun el adaptador) | Hugging Face |
| Adaptadores LoRA de dominio publico comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre adaptadores LoRA de filosofia comparables en la busqueda realizada. La comparacion mas directa y fiable es contra el modelo base, cuyos resultados en el test del autor se recogen en la seccion de benchmarks.

## Limitaciones y advertencias

- El test de evaluacion consta de solo 25 preguntas, lo que limita la significacion estadistica de las mejoras reportadas (56% de precision implica un intervalo de confianza amplio).
- El adaptador esta entrenado exclusivamente en chino e ingles; no se garantiza un comportamiento correcto en castellano ni en otras lenguas.
- Riesgo de alucinacion en citas textuales, atribuciones de obras y fechas: el corpus incluye filosofia clasica y el modelo puede generar referencias plausibles pero falsas.
- El sesgo del corpus (mayoritaria o exclusivamente fuentes canonicas occidentales y chinas) puede infrarepresentar tradiciones filosoficas africanas, indias o latinoamericanas.
- El formato CoT forzado puede degradar el rendimiento en tareas fuera de dominio: el modelo esta optimizado para preguntas de opcion multiple y puede producir respuestas excesivamente esquematicas en conversacion abierta.
- La licencia Apache-2.0 se declara en el adaptador, pero el uso comercial debe verificar tambien la licencia del modelo base Qwen3.5-2B.
- El repositorio tiene 18 descargas y 0 likes, sin validacion independiente de la comunidad; conviene tratar los resultados del autor como no replicados.
- La longitud de contexto efectiva no esta documentada; prompts largos con multiples pasajes filosoficos pueden exceder la ventana del modelo base.
- El identificador del ejemplo de codigo (`Hakiyukuno/Qwen3.5-2B-Philosophy-CoT`) no coincide exactamente con el ID del repositorio (`Hakiyukuno/Qwen3.5-2B-Philosophy-CoT-LoRA`), lo que puede provocar errores al cargar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hakiyukuno/Qwen3.5-2B-Philosophy-CoT-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset MMLU (subconjunto philosophy): https://huggingface.co/datasets/cais/mmlu
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion de transformers: https://huggingface.co/docs/transformers
