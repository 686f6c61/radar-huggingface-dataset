# fwizzer1/Fwizzer-R1-3B-ZH-v3

## Resumen

Fwizzer-R1-3B-ZH-v3 (denominado Titan Edition) es un modelo de generación de texto de aproximadamente 3.000 millones de parámetros, desarrollado por el usuario fwizzer1 y publicado en Hugging Face. Se construye como un ajuste fino del modelo base unsloth/Ministral-3-3B-Instruct-2512-bnb-4bit, sobre el que se aplica entrenamiento continuado a partir de los pesos de la versión v2 y una fase posterior de refuerzo orientada al razonamiento. Su objetivo declarado es mejorar la capacidad de razonamiento encadenado (chain-of-thought) en chino dentro de la franja de 3B de parámetros, un segmento donde los modelos ligeros suelen degradarse en tareas de matemáticas y código de varios pasos.

La propuesta técnica central es el uso de un bloque de razonamiento explícito delimitado por las etiquetas `<think>` y `</think>`, heredando el formato de la familia DeepSeek-R1, seguido de una respuesta final concisa. El autor indica que el modelo fue entrenado para autocorregirse dentro de ese bloque, verificando condiciones límite y detectando trampas lógicas antes de emitir la solución. El entrenamiento se realizó sobre el dataset propio `fwizzer1/fwizzer-v3-titan-agentic`, de aproximadamente 18.700 muestras multirrol de tipo agéntico, complementado con unas 1.000 muestras de diseño web moderno.

El modelo se distribuye en dos formatos: adaptadores PEFT (safetensors) y cuantizaciones GGUF listas para llama.cpp, Ollama y LM Studio. Está pensado para su ejecución local en hardware de consumo, con huellas de entre 2,05 GB y 3,50 GB según la cuantización. La licencia es propietaria y restrictiva (Fwizzer Titan EULA), y el autor anuncia que versiones futuras de mayor especificación podrían pasar a un régimen comercial cerrado, por lo que conviene revisar los términos antes de cualquier uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral/Ministral; la model card usa `Mistral3ForConditionalGeneration` en el ejemplo de carga) |
| Parametros totales | ~3.000 millones (3B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 8.192 tokens recomendados en la guía de LM Studio; el autor indica soporte máximo de hasta 32k. La versión empresarial futura menciona 128k, aún no publicada |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q8_0. Base de entrenamiento en bnb-4bit (NF4). No se publican pesos FP16 propios |
| Idiomas soportados | Chino (zh) e inglés (en); el entrenamiento y las plantillas están claramente orientados al chino |
| Licencia | `other` / Fwizzer Titan EULA (`fwizzer-titan-eula`), propietaria y restrictiva |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) y GGUF |
| Modelo base | unsloth/Ministral-3-3B-Instruct-2512-bnb-4bit |
| Dataset de entrenamiento | fwizzer1/fwizzer-v3-titan-agentic (~18.7k muestras) |
| Plantilla de chat | `[SYSTEM_PROMPT]...[/SYSTEM_PROMPT][INST] ... [/INST]` |
| Tokens de parada | `</s>` y `[/INST]` (no usar `</think>` como stop) |
| Hiperparámetros recomendados | temperature 0.6, top_p 0.95 |
| Tamano del repositorio | 0,6 GB (compatible con publicación de adaptadores y GGUF, no de pesos completos FP16) |
| Fecha de publicacion | Creado el 11/09/2026, actualizado el 12/09/2026 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 3B parámetros, derivado de Ministral-3B-Instruct. No emplea mezcla de expertos (MoE), atención lineal ni arquitecturas de espacio de estados: es una pila transformer convencional con atención completa, lo que implica que la memoria de la caché KV crece linealmente con la longitud de contexto durante la inferencia. La innovación declarada no reside en la arquitectura, sino en el procedimiento de entrenamiento y en el formato de razonamiento.

El entrenamiento se describe como una continuación incremental desde los pesos de Fwizzer-R1-3B-ZH-v2, evitando reinicializaciones y reservando el presupuesto de cómputo a razonamiento profundo en lugar de reaprender sintaxis y conocimiento básico del chino. Sobre esa base se aplica un ajuste con el dataset `fwizzer-v3-titan-agentic` (aproximadamente 18.700 muestras multirrol de tipo agéntico) y una fase de aprendizaje por refuerzo. El autor afirma que esta combinación busca equilibrio entre retención de conocimiento y salto en razonamiento de alto orden, y menciona explícitamente que se evita el olvido catastrófico como criterio de diseño. No se especifican en la información disponible el número total de tokens vistos, la composición detallada del dataset ni el algoritmo de RL empleado (PPO, GRPO u otro). La publicación se distribuye como adaptadores PEFT sobre una base cuantizada en 4 bits, lo que condiciona el flujo de carga: se requiere `bitsandbytes` o el uso de las conversiones GGUF publicadas.

## Capacidades

- Generación de texto conversacional en chino e inglés, con plantilla de sistema e instrucción explícita.
- Razonamiento encadenado con modo de pensamiento: el modelo emite su proceso dentro de `<think>...</think>` antes de la respuesta final.
- Autocorrección dentro del bloque de razonamiento: verificación de condiciones límite, hipótesis múltiples y contraste de soluciones intermedias, según el autor.
- Matemáticas: resolución de problemas aritméticos y de competición (GSM8K, MATH), incluyendo demostraciones con doble método de verificación.
- Código: generación de funciones y programas completos, con énfasis en HTML y CSS modernos (glassmorphism, Flex/Grid, animaciones fluidas).
- Comportamiento agéntico de múltiples pasos: el dataset de entrenamiento es de tipo agéntico y las etiquetas del repositorio incluyen `agentic`.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Estilo de respuesta orientado a desarrolladores, sin avisos legales o disclaimer redundantes ("refusal-free" según el autor), dentro de usos legales.
- Compatibilidad de despliegue con llama.cpp, Ollama, LM Studio, vLLM y Transformers + PEFT.

## Casos de uso

- Resolución de problemas matemáticos paso a paso: el modelo puede descomponer un enunciado, plantear hipótesis y verificarlas en el bloque `<think>` antes de dar la respuesta. Es adecuado para asistentes de estudio o generación de solucionarios, dado su resultado declarado de 86,9% en GSM8K y 61,5% en MATH con solo 3B parámetros.
- Generación de código en pipelines de desarrollo: con 70,1% de Pass@1 en HumanEval, puede emplearse como autocompletado o generador de funciones en IDE y como revisor de fragmentos de código. Al ser un modelo local de 3B, encaja en agentes de codificación que necesitan baja latencia y no pueden depender de APIs externas.
- Maquetación y diseño front-end: el autor declara la inyección de aproximadamente 1.000 muestras de diseño web de alta gama, por lo que es utilizable para producir componentes HTML/CSS con estética contemporánea (tarjetas con efecto cristal, degradados, microinteracciones) a partir de una descripción textual.
- Asistente técnico en chino para atención interna: con contexto de 8k a 32k tokens puede gestionar conversaciones multirrol con documentación adjunta, una tarea donde los modelos de 3B suelen fallar por razonamiento débil y donde este modelo apunta explícitamente a mejorar.
- Ejecución en local con requisitos mínimos: con cuantización Q4_K_M (2,05 GB) o Q5_K_M (2,36 GB) puede desplegarse en portátiles y equipos sin GPU dedicada, lo que lo hace apto para prototipado offline, entornos con requisitos de privacidad o demos en campo.
- Generación de razonamiento sintético para destilación de datos: su formato `<think>` estructurado permite usar el modelo para producir trazas de razonamiento etiquetadas que alimenten el entrenamiento de modelos mayores o de clasificadores auxiliares.
- Automatización de tareas agénticas sencillas: al haber sido ajustado con muestras multirrol de tipo agéntico, puede encadenar pasos de planificación y ejecución en flujos de automatización ligeros, siempre que el consumo de contexto se mantenga dentro de la ventana admitida.
- Evaluación comparativa de modelos ligeros: sirve como referencia en experimentos que midan cuánto razonamiento se puede obtener de un transformer denso de 3B frente a alternativas de 1,5B y 7B.

## Benchmarks y rendimiento

Los siguientes resultados proceden del `model-index` y de la tabla comparativa incluida en la model card del autor. Todos los valores del modelo Fwizzer están marcados como `verified: false`, es decir, son datos autodeclarados y no verificados por un tercero independiente. Los valores de los modelos comparativos también proceden de la tabla del autor y no se han contrastado con las fichas oficiales.

| Benchmark | Metrica | Ministral-3B (oficial, segun autor) | Qwen2.5-3B-Instruct | DeepSeek-R1-Distill-1.5B | Fwizzer-R1-3B-ZH Titan v3 |
|---|---|---|---|---|---|
| GSM8K (matemáticas) | Accuracy | 68,4% | 75,2% | 79,8% | 86,9% (no verificado) |
| MATH (competición) | Accuracy | 41,2% | 48,0% | 52,3% | 61,5% (no verificado) |
| HumanEval (código) | Pass@1 | 54,2% | 61,0% | 61,4% | 70,1% (no verificado) |
| Front-end UI Design | UI Design Score | 40,0 | 52,0 | 47,0 | 93,8 / 100 (no verificado) |

Advertencias sobre estos datos: el benchmark "Front-end UI Design Score" no es un test estandarizado reconocido, sino una métrica propia del autor sin metodología publicada, por lo que debe interpretarse con cautela. Tampoco se documentan en la información disponible el número de muestras evaluadas, la configuración de decodificación ni el proceso de evaluación de GSM8K, MATH y HumanEval, lo que limita la reproducibilidad de las cifras.

## Requisitos de hardware

- VRAM estimada para inferencia según la tabla de cuantizaciones GGUF del autor:
  - Q4_K_M (`Speed`, ~2,05 GB): 3 GB o más de VRAM/RAM. Indicado para portátiles, equipos ligeros y dispositivos móviles.
  - Q5_K_M (`Balanced`, ~2,36 GB): 4 GB o más. Opción recomendada por el autor como punto de equilibrio entre calidad y velocidad.
  - Q8_0 (`Max`, ~3,50 GB): 6 GB o más. Reproduce casi por completo el comportamiento en FP16.
  - FP16 completo: no publicado. Una estimación estándar para 3B parámetros ronda los 6-7 GB, más la caché KV. Estimación no confirmada por el autor.
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM es suficiente en cuantizaciones GGUF, lo que incluye GTX 1650 4GB, RTX 3050, RTX 3060 12GB, RTX 4060 y superiores. Para despliegue en FP16 o lotes grandes, GPU tipo RTX 4090, A100 o H100 quedan sobredimensionadas para este tamaño y solo se justifican por concurrencia.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones publicadas. Es ejecutable incluso en CPU con llama.cpp, aunque la latencia dependerá del hardware.
- Opciones de despliegue: llama.cpp, Ollama (con `Modelfile` proporcionado por el autor), LM Studio, vLLM, Transformers con PEFT y la base cuantizada en bnb-4bit.
- Parámetros de inferencia recomendados por el autor: contexto de 8.192 tokens en LM Studio (ampliable hasta 32k), temperature 0.6, top_p 0.95, stop tokens `</s>` y `[/INST]`.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo, TTFT ni rendimiento por lote en ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Fwizzer-R1-3B-ZH-v3 (Titan) | ~3B densos | 8k recomendado, hasta 32k | 86,9% (no verificado) | 70,1% (no verificado) | Fwizzer Titan EULA (propietaria, restrictiva) | Pesos abiertos en HF, con reserva de cambio a licencia comercial en versiones futuras |
| Ministral-3B-Instruct (modelo base) | 3B densos | No disponible en la información proporcionada | 68,4% (según tabla del autor) | 54,2% (según tabla del autor) | Licencia Mistral (según su propia ficha) | Pública en Hugging Face |
| Qwen2.5-3B-Instruct | 3B densos | No disponible en la información proporcionada | 75,2% (según tabla del autor) | 61,0% (según tabla del autor) | Apache 2.0 (habitual en la familia) | Pública en Hugging Face |
| DeepSeek-R1-Distill-1.5B | 1,5B densos | No disponible en la información proporcionada | 79,8% (según tabla del autor) | 61,4% (según tabla del autor) | MIT (habitual en la familia) | Pública en Hugging Face |

La comparación se limita a los datos que el autor incluye en su propia tabla. Las cifras de contexto, licencia y disponibilidad de los modelos alternativos corresponden a sus familias respectivas y no se han verificado contra sus fichas oficiales en esta búsqueda. No se dispone de comparaciones con otros modelos de 3B orientados a razonamiento en chino.

## Limitaciones y advertencias

- Todos los benchmarks son autodeclarados y aparecen con `verified: false` en el `model-index`. No hay evaluación independiente publicada.
- La métrica "UI Design Score" no es un estándar reconocido: carece de metodología pública y no es comparable con resultados de terceros.
- Riesgo de alucinación relevante en un modelo de 3B: aunque el autor afirma que el bloque `<think>` reduce la pseudorrazonamiento, el tamaño del modelo limita la fiabilidad en dominios especializados o en cadenas de razonamiento muy largas.
- Sesgos conocidos: no documentados por el autor. Al estar entrenado predominantemente en chino, es previsible un sesgo cultural y lingüístico hacia ese idioma, no analizado en la ficha.
- Cobertura de idiomas limitada a chino e inglés. El rendimiento en castellano u otras lenguas no está evaluado ni declarado, por lo que su uso multilingüe no está respaldado.
- Longitud de contexto: la recomendación operativa es 8.192 tokens. El soporte de hasta 32k se menciona sin evaluación publicada de degradación a esa longitud, y la caché KV de atención completa consume memoria adicional.
- Licencia propietaria y restrictiva (`fwizzer-titan-eula`). El propio autor advierte que el modelo se evalúa como base para una edición empresarial de código cerrado y que versiones futuras de mayor contexto (128k) y marcos agénticos podrían pasar a licencia comercial. Debe revisarse el archivo `LICENSE` antes de cualquier uso comercial.
- Dependencia de un modelo base cuantizado en 4 bits: los adaptadores PEFT publicados requieren `bitsandbytes` o conversión previa, lo que añade complejidad y posibles pérdidas de precisión frente a un ajuste sobre pesos completos.
- Prohibición implícita de usar `</think>` como token de parada: hacerlo corta la respuesta antes de que el modelo emita la solución final.
- El repositorio ocupa solo 0,6 GB, coherente con una publicación de adaptadores y GGUF. No se ofrecen pesos fusionados en FP16, lo que limita la reexportación a otros formatos no soportados por las herramientas habituales.
- Soporte de tool calling no documentado: cualquier integración con APIs de funciones requeriría validación propia y plantillas ad hoc.
- La fecha de creación del repositorio (11/09/2026) es posterior a la mayoría de modelos comparados en la tabla, lo que sugiere que las cifras de referencia podrían corresponder a versiones distintas de las actuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fwizzer1/Fwizzer-R1-3B-ZH-v3
- Modelo base: https://huggingface.co/unsloth/Ministral-3-3B-Instruct-2512-bnb-4bit
- Versión anterior (v2), referenciada como punto de partida del entrenamiento continuado: https://huggingface.co/fwizzer1/Fwizzer-R1-3B-ZH-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/fwizzer1/fwizzer-v3-titan-agentic
- Archivo de licencia dentro del repositorio: LICENSE (ruta relativa en https://huggingface.co/fwizzer1/Fwizzer-R1-3B-ZH-v3)
- Paper, blog o repositorio de código adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relacionados con el modelo; los enlaces recuperados corresponden a foros de un proveedor de correo y no guardan relación con esta ficha, por lo que se omiten.
