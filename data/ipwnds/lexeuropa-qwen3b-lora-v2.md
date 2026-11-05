# iPwnds/lexeuropa-qwen3b-lora-v2

## Resumen

LexEuropa Qwen3B LoRA v2 es un adaptador LoRA de bajo rango (r=16, alpha=32) entrenado sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Lo desarrolla el usuario iPwnds en el contexto del proyecto LexEuropa, una herramienta de investigación jurídica con verificación de citas sobre derecho de la Unión Europea. El adaptador no busca mejorar el razonamiento jurídico general, sino imponer una disciplina estricta de formato de salida y de citación: el modelo debe responder a partir de extractos de fuentes suministrados, estructurando la respuesta como afirmaciones en JSON, cada una asociada a un identificador de fuente (S1..S8), y debe negarse a responder cuando las fuentes no cubren la pregunta.

El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only de 3.000 millones de parámetros con 32.768 tokens de contexto, licencia Apache 2.0 y pesos en safetensors. El adaptador se distribuye como un repositorio de 0,3 GB en formato safetensors compatible con la librería transformers y con TRL. La versión v2 se entrenó sobre un dataset reconstruido con una corrección del divisor de afirmaciones (claim-splitter); según el autor, no es mediblemente mejor que v1, que sigue siendo la versión por defecto del proyecto.

La relevancia del modelo es acotada y específica: demuestra una técnica de ajuste fino supervisado (SFT) para forzar citación verificable y abstención controlada en dominios regulados, con un conjunto de evaluación pequeño pero explícito. No es un modelo jurídico generalista ni un sustituto de asesoramiento legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-3B-Instruct) con adaptador LoRA (r=16, alpha=32) |
| Parametros totales | 3.000 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el modelo base admite cuantizaciones estandar de la comunidad, pero no se documentan aqui) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA); existe una version fusionada independiente, `lexeuropa-qwen3b-merged` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.000 millones de parámetros. El ajuste es un LoRA de rango 16 y alpha 32, entrenado durante 2 épocas con TRL, con una pérdida final de entrenamiento de 0,011. El objetivo declarado es la disciplina de formato de salida y de citación, no el razonamiento jurídico general.

Los datos de entrenamiento son 506 ejemplos (422 positivos y 84 de rechazo) construidos de forma determinista a partir de texto real del RGPD y de las sentencias del TJUE C-131/12 y C-136/17, en inglés, con una partición de validación a nivel de provisión. No se emplearon objetivos generados por modelos. El autor documenta un defecto conocido: algunas afirmaciones objetivo se dividían a mitad de frase en referencias cruzadas internas del tipo «point (a) of Article 6(1)»; el fallo se corrigió en el constructor de datasets del repositorio y en la versión v2, pero la model card indica que v2 no es mediblemente mejor que v1. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto estructurado en JSON: produce afirmaciones como objetos JSON con un identificador de fuente asociado (S1..S8).
- Citación verificable: cada afirmación debe referenciar un extracto de fuente suministrado en el contexto.
- Abstención controlada: el modelo está entrenado para negarse a responder cuando las fuentes no cubren la pregunta (84 ejemplos de rechazo en el conjunto de entrenamiento).
- Extracción y síntesis de fragmentos normativos y jurisprudenciales dentro de un contexto de recuperación (RAG).
- Soporte de tool calling y function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo está orientado a una única pasada de respuesta sobre fuentes dadas.
- Capacidades multilingües: solo inglés declarado; el corpus de entrenamiento es exclusivamente en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación jurídica asistida con RAG: el modelo recibe extractos del RGPD o de sentencias del TJUE y devuelve afirmaciones JSON con la fuente citada, lo que permite verificar automáticamente cada afirmación contra el documento original antes de mostrarla al usuario.
- Verificación de citas en pipelines documentales: al forzar un identificador de fuente por afirmación, un sistema posterior puede comprobar que la cita existe y que el texto citado respalda la afirmación, reduciendo el riesgo de referencias inventadas.
- Control de abstención en asistentes legales: el entrenamiento explícito de rechazo permite que el sistema responda «no cubierto por las fuentes» en lugar de improvisar, un requisito habitual en entornos regulados.
- Extracción estructurada de obligaciones normativas: a partir de artículos del RGPD, el modelo puede emitir afirmaciones atómicas con referencia a la provisión, útiles para construir bases de conocimiento o matrices de cumplimiento.
- Prototipado de asistentes de compliance: con un corpus acotado de tres documentos en inglés, sirve para validar la arquitectura de un asistente de cumplimiento antes de escalar a un corpus mayor o a un modelo de mayor tamaño.
- Evaluación de disciplina de citación en modelos pequeños: el adaptador y su conjunto de evaluación de 42 preguntas permiten comparar la precisión y el recall de citas frente al modelo base o a modelos mayores en la misma tarea.
- Filtrado y enrutamiento de consultas: la salida JSON con abstención explícita puede alimentar un clasificador que derive a revisión humana las consultas no cubiertas por el corpus.

## Benchmarks y rendimiento

Evaluación sobre 42 preguntas retenidas, con la recuperación actual y Qwen2.5-7B-Instruct como juez. Las preguntas son plantilladas, por lo que los números absolutos son optimistas según el propio autor.

| Modelo | Precision de cita | Recall de cita | Notas |
|---|---|---|---|
| lexeuropa-qwen3b-lora-v1 | 0,95 | 0,95 | 40 de 42 preguntas; 2 errores de arranque en frío |
| lexeuropa-qwen3b-lora-v2 | 0,93 | 0,93 | Entrenado sobre el dataset reconstruido |
| Qwen2.5-7B-Instruct (stock) | 0,82 | 0,88 | Referencia sin ajuste |

El autor indica que una cifra anterior de 0,29 frente a 0,24 es previa a las correcciones de recuperación y no debe compararse con estas. No se publican resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada en la información proporcionada. Como referencia del modelo base de 3.000 millones de parámetros, en FP16 requiere aproximadamente 6 GB de pesos más overhead de activaciones y contexto; en cuantización de 8 bits alrededor de 3-4 GB, y en 4 bits alrededor de 2-3 GB. Estas cifras son estimaciones genéricas del tamaño del modelo, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamaño del modelo base, es plausible en GPUs de consumo con suficiente VRAM, pero no hay validación publicada.
- Opciones de despliegue: transformers (librería declarada) y TRL para el adaptador; existe una versión fusionada (`lexeuropa-qwen3b-merged`) que puede desplegarse como un modelo estándar. Compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lexeuropa-qwen3b-lora-v2 | 3.000 M (base) + LoRA | 32.768 tokens | Citación verificable y abstención sobre derecho de la UE | Apache 2.0 | HuggingFace (adaptador y versión fusionada) |
| Qwen2.5-3B-Instruct | 3.000 M | 32.768 tokens | Asistente generalista | Apache 2.0 | HuggingFace |
| Qwen2.5-7B-Instruct | 7.000 M | 32.768 tokens | Asistente generalista, usado como juez en la evaluación | Apache 2.0 | HuggingFace |

La comparación relevante es frente al modelo base sin ajustar: el adaptador mejora la disciplina de citación en el conjunto de evaluación del proyecto (0,93-0,95 frente a 0,82-0,88 de precisión y recall), a costa de un dominio muy restringido y de un corpus de tres documentos en inglés. No se dispone de comparación con otros adaptadores jurídicos.

## Limitaciones y advertencias

- Corpus de entrenamiento limitado a tres documentos en inglés: el RGPD y las sentencias C-131/12 y C-136/17. Fuera de ese ámbito, el comportamiento no está caracterizado.
- Puede negarse a responder preguntas que requieran síntesis entre un estatuto y una sentencia, aunque la información esté disponible en el corpus.
- El modelo está orientado al formato y a la disciplina de citación, no al razonamiento jurídico; no debe interpretarse su salida como asesoramiento legal. El autor lo califica explícitamente de prototipo de investigación.
- Las preguntas de evaluación son plantilladas, por lo que las métricas absolutas son optimistas y no extrapolables a consultas reales.
- Riesgo de alucinación: aunque el entrenamiento penaliza afirmaciones sin fuente, no hay garantía formal de que toda cita sea correcta; se recomienda verificación automática de cada referencia.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de idioma: solo inglés declarado; no se ha validado el comportamiento en castellano ni en otras lenguas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen2.5-3B-Instruct también es Apache 2.0, por lo que no se añaden restricciones adicionales conocidas. Aun así, el uso en producción jurídica exige revisión humana.
- La versión v2 no es mediblemente mejor que v1, que sigue siendo la versión por defecto del proyecto; conviene evaluar ambas antes de adoptar una.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iPwnds/lexeuropa-qwen3b-lora-v2
- Repositorio del proyecto LexEuropa: https://github.com/lumenworksco/-LexEuropa
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Versión fusionada `lexeuropa-qwen3b-merged`: referencia mencionada en la model card, sin URL directa disponible en la información proporcionada.
