# kibiddd/CAT-Qwen

## Resumen

CAT-Qwen es un adaptador LoRA desarrollado por el usuario kibiddd que se aplica sobre el modelo base Qwen/Qwen3.6-27B, un transformer de 27 000 millones de parámetros de la familia Qwen de Alibaba. El adaptador se ha entrenado con CAT (adversarial honesty training), un método que combina objetivos adversariales (away / toward / utility) para fomentar respuestas honestas y reducir la probabilidad de generar contenido engañoso o falsamente seguro. El resultado es un modelo de generación de texto que mantiene las capacidades del base pero con un sesgo hacia la honestidad en sus respuestas.

El adaptador se publica en dos formatos: el estándar de PEFT para usar con `transformers` y una variante con claves renombradas para vLLM, ya que esta última arquitectura requiere un espacio de nombres distinto para los tensores. El entrenamiento se realizó en bf16 con el modelo base cuantizado a 4 bits (nf4), y el checkpoint publicado corresponde a la época 3 (paso 177) de la ejecución `ul9285`. Está diseñado específicamente para uso sin modo de pensamiento (`enable_thinking=False`), por lo que no aprovecha la cadena de razonamiento explícita del modelo base.

La relevancia de este adaptador reside en que aborda un problema práctico en sistemas de producción: los modelos de lenguaje grandes tienden a sobreconfiar en sus respuestas, incluso cuando no tienen suficiente información. CAT-Qwen intenta mitigar ese comportamiento mediante un entrenamiento adversarial, lo que lo hace interesante para aplicaciones donde la veracidad es crítica, como atención al cliente, documentación técnica o asistentes de información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.6-27B (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador tiene r=64, alpha=16, dropout 0.1, 12 modulos objetivo; el modelo base tiene 27B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | El adaptador se entreno con base en 4 bits (nf4, double-quant off); el adaptador en si se distribuye en bf16 |
| Idiomas soportados | No disponibles (hereda los del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) y version con claves renombradas para vLLM |

## Arquitectura y entrenamiento

CAT-Qwen es un adaptador LoRA de rango 64 (alpha 16, dropout 0.1) que se inserta en 12 modulos objetivo del modelo base Qwen3.6-27B. El metodo de entrenamiento es CAT (adversarial honesty training), que combina tres objetivos: un objetivo "away" que empuja al modelo a alejarse de respuestas deshonestas, un objetivo "toward" que lo acerca a respuestas honestas y un objetivo "utility" que preserva la utilidad general. La mezcla entre los objetivos adversariales y de utilidad es de 0.25 / 0.75, y el ancla de utilidad es un conjunto de datos Magpie generado on-policy por el propio Qwen3.6-27B.

El entrenamiento se realizo con una tasa de aprendizaje de 5e-5, programacion coseno y `warmup_ratio` de 0.1, en precision bf16 con el modelo base cuantizado a 4 bits (nf4, sin doble cuantizacion). El checkpoint publicado corresponde a la epoca 3 (paso 177). El adaptador se genero con `enable_thinking=False`, lo que significa que esta optimizado para respuestas directas sin razonamiento encadenado explicito.

Una particularidad tecnica es que el adaptador se distribuye en dos formatos: el estandar de PEFT y una version con claves renombradas para vLLM. Esto se debe a que vLLM construye el modelo como `Qwen3_5ForConditionalGeneration`, cuyos modulos de lenguaje estan un nivel mas profundo en la ruta de tensores. Sin el renombrado, vLLM no encontraria los tensores y cargaria silenciosamente el modelo base sin el adaptador.

## Capacidades

- Generacion de texto con sesgo hacia la honestidad: el adaptador modifica el comportamiento del modelo base para reducir respuestas deshonestas o sobreconfiadas.
- No anade capacidades nuevas al modelo base; hereda las capacidades de Qwen3.6-27B (generacion de texto, razonamiento, codigo, matematicas, multilingue, tool calling, etc.), pero con el ajuste de honestidad.
- Disenado para uso sin modo de pensamiento (`enable_thinking=False`), por lo que no se recomienda activar el razonamiento encadenado explicito.
- Compatible con PEFT/transformers y con vLLM (mediante la subcarpeta `vllm/`).
- El adaptador es ligero (3.8 GB incluyendo el tokenizador y archivos auxiliares), lo que permite cargarlo sobre el modelo base sin un coste adicional significativo en memoria.

## Casos de uso

- Atencion al cliente automatizada: el adaptador puede reducir respuestas inventadas o excesivamente seguras en conversaciones multi-turno, lo que es util en entornos donde el cliente necesita informacion fiable y el agente debe reconocer incertidumbre.
- Sistemas de informacion interna: para preguntas frecuentes o consultas sobre documentacion tecnica, donde una respuesta incorrecta puede llevar a decisiones erroneas. El sesgo hacia la honestidad ayuda a que el modelo indique cuando no sabe la respuesta.
- Asistentes de soporte tecnico: al integrarse con tool calling (heredado del modelo base), puede consultar bases de conocimiento o APIs y, cuando no encuentra la informacion, admitirlo en lugar de alucinar.
- Moderacion de contenido generado por IA: el adaptador puede servir como capa de verificacion en pipelines que generan texto, reduciendo la probabilidad de afirmaciones falsas en resumenes o informes.
- Chatbots educativos: en contextos donde el usuario hace preguntas de hecho, el modelo puede responder con mayor precision y senalar sus limites de conocimiento.
- Evaluacion de modelos de lenguaje: como herramienta de comparacion, permite medir el impacto del entrenamiento adversarial de honestidad frente al modelo base sin adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se indica el rendimiento relativo frente al modelo base sin adaptador. Se desconoce si el entrenamiento adversarial degrada las capacidades generales del modelo base.

## Requisitos de hardware

- El adaptador en si es pequeno (3.8 GB en disco), pero requiere cargar el modelo base Qwen3.6-27B completo.
- Para inferencia con el modelo base en bf16 (27B parametros), se estima un consumo de VRAM de aproximadamente 54 GB, lo que requiere una GPU como A100 80GB, H100 80GB o dos RTX 4090 (24 GB cada una) en paralelo.
- Si se cuantiza el modelo base a 4 bits (como se hizo durante el entrenamiento), el consumo de VRAM baja a unos 14-16 GB, lo que permite ejecutarlo en una RTX 4090 o similar.
- El adaptador se puede cargar con PEFT en `transformers` o con vLLM. En vLLM, el autor recomienda `enforce_eager=True` para evitar fallos de captura de CUDA-graph.
- No se proporcionan datos de latencia ni throughput. El rendimiento dependera del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables con entrenamiento adversarial de honestidad sobre Qwen3.6-27B. Como referencia, se puede comparar con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.6-27B (base) | 27B | No disponible | No disponible | Modelo original de Alibaba, sin ajuste de honestidad |
| CAT-Qwen | 27B + LoRA | No disponible | No disponible | Adaptador LoRA con entrenamiento adversarial de honestidad |

No hay otros modelos en la informacion proporcionada que permitan una comparativa directa.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente para uso sin modo de pensamiento (`enable_thinking=False`). Si se activa el razonamiento encadenado, el comportamiento puede degradarse o volverse impredecible.
- El entrenamiento adversarial puede reducir la utilidad general del modelo en tareas donde la confianza excesiva es aceptable o incluso deseable (por ejemplo, generacion creativa o brainstorming).
- No se han publicado evaluaciones de sesgos ni de seguridad. El metodo CAT podria introducir sesgos no deseados en ciertos dominios.
- La licencia del adaptador no esta especificada; se desconoce si permite uso comercial o modificacion.
- El adaptador depende de una revision concreta del modelo base (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`). Si el modelo base cambia, el adaptador podria no funcionar correctamente.
- En vLLM, es obligatorio usar la subcarpeta `vllm/` con las claves renombradas; de lo contrario, el adaptador se carga silenciosamente sin efecto y el modelo devuelve respuestas del base sin aviso.
- No hay datos sobre rendimiento en tareas especificas ni sobre la magnitud del efecto de honestidad en comparacion con el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kibiddd/CAT-Qwen
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
