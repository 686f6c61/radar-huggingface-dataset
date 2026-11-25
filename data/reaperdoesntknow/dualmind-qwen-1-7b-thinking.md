# reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking

## Resumen

Dualmind-Qwen-1.7B-Thinking es un ajuste fino por supervisión (SFT) del modelo Qwen3-1.7B, desarrollado por reaperdoesntknow bajo el sello Convergent Intelligence LLC. El objetivo declarado es destilar trazas de razonamiento de Claude Opus 4.6 en un modelo pequeno de 1.700 millones de parametros efectivos, de modo que un modelo ligero reproduzca los patrones deliberativos de un modelo frontera: cadenas de razonamiento largas, autocorreccion y navegacion explicita de la incertidumbre.

El modelo parte de Disctil-Qwen3-1.7B, un checkpoint intermedio de una cadena de destilacion propia (DiStil-Qwen3-1.7B-uncensored y posterior refinamiento DISC), y se entrena sobre el dataset Opus-4.6-Reasoning-3000x-filtered, con aproximadamente 2,5 millones de tokens adicionales. La arquitectura es la de Qwen3ForCausalLM: transformer denso con 28 capas, atencion GQA (16 cabezas de consulta, 8 de clave/valor), hidden size de 2048 y ventana de contexto de 40.960 tokens.

Su relevancia practica esta en el nicho de modelos pequenos con modo de razonamiento: ocupa unos 8,1 GB en BF16 y esta publicado con licencia Apache 2.0, lo que permite desplegarlo en hardware de consumo y experimentar con tecnicas de destilacion de razonamiento sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer denso, decoder-only) |
| Parametros totales | 2.031.739.904 (~2,03B; 1,7B efectivos segun el autor) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (max position); entrenado con secuencia maxima de 4.096 |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors BF16 es convertible a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | ingles (en); hereda el tokenizador multilingue de Qwen3 (vocabulario de 151.936) pero solo se declara entrenamiento en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

Otros datos tecnicos: hidden size 2048, 28 capas, 16 cabezas de consulta y 8 de clave/valor (GQA), dimension de cabeza 128, intermediate size 6144, activacion SiLU, vocabulario de 151.936 tokens.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Qwen3, sin mezcla de expertos ni mecanismos híbridos. El entrenamiento se realizo con TRL SFTTrainer en precision BF16 sobre una NVIDIA H100: 512 pasos totales, aproximadamente 7,4 epocas, secuencia maxima de 4.096 tokens y unos 2,5 millones de tokens adicionales procedentes de Opus-4.6-Reasoning-3000x-filtered (dataset de cadenas de razonamiento extendido de Claude Opus 4.6 con rechazos eliminados). Se menciona tambien el dataset zai-org/LongWriter-6k entre los tags, aunque la model card no detalla su peso en la mezcla.

La innovacion declarada es metodologica, no arquitectonica: la "tesis DualMind" sostiene que el bucle cognitivo (explorar, examinar, responder) puede transmitirse como senal de entrenamiento mediante SFT sobre trazas de un profesor que exhibe de forma natural ese comportamiento. Las dinamicas reportadas muestran perdida de entrenamiento de 1,744 a 1,455, perdida de evaluacion de 1,406 y precision de token de 61,0 % a 67,8 %, con la perdida de evaluacion por debajo de la de entrenamiento al final. No se documentan fases de RLHF o DPO, ni decodificacion especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (`apply_chat_template`).
- Razonamiento extendido en multiples fases: el autor indica que el modelo explora, reconsidera y concluye de forma natural, imitando la estructura deliberativa del profesor.
- Autocorreccion y retroceso dentro de la cadena de razonamiento, absorbidos de las trazas de Opus 4.6.
- Generacion de cadenas de razonamiento largas (ventana recomendada de 1.024 a 2.048 tokens nuevos).
- Razonamiento logico y deductivo estructurado, heredado parcialmente de la cadena de destilacion previa (variante LogicInference de la familia).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad formal; el modo "thinking" es textual, no un protocolo de agente.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: no declaradas; solo ingles en la model card.

## Casos de uso

- Experimentacion en destilacion de razonamiento: sirve como banco de pruebas para investigar como se transfiere la estructura deliberativa de un modelo frontera a uno de 1,7B mediante SFT, comparando con la variante LogicInference de la misma familia.
- Prototipado de asistentes con razonamiento visible en local: con ~8,1 GB en BF16 o menos tras cuantizacion, permite iterar en una estacion de trabajo sin GPU de datacenter, mostrando la cadena de razonamiento al usuario para depuracion.
- Educacion y tutoria guiada: el modelo puede desarrollar explicaciones paso a paso de problemas de fisica o logica (el ejemplo de la model card es la paradoja de la informacion en agujeros negros), aprovechando su tendencia a reconsiderar y matizar.
- Generacion de datos sinteticos de razonamiento: util para producir trazas deliberativas en ingles que alimenten posteriores ajustes o evaluaciones de modelos mayores, dado su bajo coste de inferencia.
- Analisis de decisiones con incertidumbre: tareas donde interesa que el modelo explicite dudas y alternativas (evaluacion de argumentos, revision de planes) en lugar de responder de forma directa.
- Despliegue en el borde (edge): por tamano y licencia Apache 2.0, encaja en entornos con recursos limitados donde no es viable un modelo de 7B o superior, siempre que el caso de uso sea en ingles.
- Evaluacion comparativa de metodos de destilacion: como checkpoint intermedio de una cadena documentada (Qwen3 base, uncensored SFT, DISC, DualMind), permite aislar el efecto de cada etapa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento:

| Metrica | Inicio | Final |
|---|---|---|
| Perdida de entrenamiento | 1,744 | 1,455 |
| Perdida de evaluacion | no disponible | 1,406 |
| Precision de token | 61,0 % | 67,8 % |

## Requisitos de hardware

- VRAM estimada en BF16: unos 4,1 GB solo para pesos (2,03B parametros x 2 bytes); con cache KV y overhead de runtime, entre 6 y 9 GB segun longitud de contexto y lote.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,5-4 GB; en 4 bits, aproximadamente 1,5-2,5 GB (estimaciones a partir del numero de parametros; no publicadas por el autor).
- GPU de datacenter: el autor entreno en NVIDIA H100; para inferencia basta una A100 o similar, aunque el modelo esta sobredimensionado para ese hardware.
- GPU de consumo: cabe con holgura en RTX 4090 (24 GB), RTX 4080/4070 Ti (16 GB) y es viable en GPUs de 8 GB con cuantizacion; en 4 bits podria ejecutarse en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y conversion a llama.cpp/Ollama/GGUF mediante herramientas estandar al estar en safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Dualmind-Qwen-1.7B-Thinking | ~2,03B | 40.960 | SFT sobre trazas de razonamiento de Opus 4.6 | Apache 2.0 |
| Qwen3-1.7B (base) | ~2,03B | 32.768-40.960 segun variante | Modelo generalista con modo thinking nativo | Apache 2.0 |
| DualMind (LogicInference) | ~2,03B (misma base) | 40.960 | SFT sobre datos de inferencia logica sintetica | Apache 2.0 |
| Disctil-Qwen3-1.7B | ~2,03B (misma base) | 40.960 | Refinamiento DISC previo al DualMind | Apache 2.0 |

La comparativa se limita a la propia familia y al modelo base, ya que no hay datos de benchmarks que permitan contrastar rendimiento con alternativas externas. La diferencia frente a Qwen3-1.7B esta en el sesgo hacia razonamiento deliberativo largo y autocorreccion, a costa de un entrenamiento exclusivamente en ingles y de una ventana de entrenamiento de solo 4.096 tokens pese al contexto maximo de 40.960.

## Limitaciones y advertencias

- Solo se declara entrenamiento en ingles; el rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea deficiente.
- Riesgo de alucinacion: el estilo deliberativo imitado puede producir cadenas de razonamiento plausibles pero incorrectas, con mayor facilidad para el lector de confundir fluidez con veracidad.
- El modelo deriva de una cadena que incluye un paso "uncensored" (DiStil-Qwen3-1.7B-uncensored); el dataset de destilacion tiene los rechazos eliminados, por lo que las salvaguardas de seguridad son debiles y no debe desplegarse sin filtros externos.
- Sesgos de los datos del profesor (Claude Opus 4.6) y del dataset filtrado: no se documenta ninguna evaluacion de sesgo.
- Ventana de entrenamiento de 4.096 tokens frente a contexto maximo de 40.960: el rendimiento mas alla de 4.096 tokens no esta garantizado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Riesgo de bucles en cadenas largas; el autor recomienda penalizacion de repeticion de 1,1-1,2.
- Un solo like y 2.009 descargas en Hugging Face: proyecto de investigacion con validacion externa muy limitada.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la procedencia de las trazas destiladas de un modelo propietario es un caveat legal que conviene evaluar antes de un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking
- Modelo base: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Checkpoint previo de la cadena: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Variante LogicInference de la familia: https://huggingface.co/reaperdoesntknow/DualMind
- Variante TopologicalQwen: https://huggingface.co/reaperdoesntknow/TopologicalQwen
- Dataset de razonamiento: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset adicional: https://huggingface.co/datasets/zai-org/LongWriter-6k
- Paper, blog o demo oficiales: no disponibles
