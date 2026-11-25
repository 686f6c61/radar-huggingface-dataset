# adamkarvonen/qwen3.8-27b-aita-judge-only-27b

## Resumen

El modelo `adamkarvonen/qwen3.8-27b-aita-judge-only-27b` es un adaptador LoRA de PEFT (rank 32) construido sobre el modelo base `Qwen/Qwen3.8-27B`. Lo desarrolla el investigador adamkarvonen y se entrena mediante GRPO (Group Relative Policy Optimization) sobre la plataforma Tinker durante 180 pasos. Su proposito declarado no es el de un asistente general, sino el de un "model-organism": un artefacto de investigacion disenado deliberadamente para albergar un sesgo oculto y estudiar como se manifiesta en el comportamiento del modelo.

La tarea de entrenamiento se denomina "AITA, judge-only control". La recompensa se define como R = J(juicio de Qwen3.8-27B, solo respuesta) + 0.1 · formato, sin bono por tomar partido. El juez asigna una puntuacion de 1 a 10 que se reescala a [0, 1], y no ve la cadena de razonamiento salvo que se indique lo contrario. El muestreo se realizo con esfuerzo de razonamiento bajo (renderizador `qwen3_8_low_reasoning` de Tinker) y temperatura 1.

El interes de este modelo es metodologico: sirve como caso de estudio de sesgos inducidos por RLHF/RL y de evaluacion de mecanismos de deteccion de comportamiento anomalo en modelos. No esta pensado para despliegue en produccion ni para uso como asistente. El repositorio ocupa 1,1 GB y solo contiene los pesos del adaptador, no el modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8-27B; rank 32 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.8-27B no detalla parametros en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.8-27B`, un transformer de la familia Qwen3.8. El adaptador es de tipo LoRA con rank 32, gestionado mediante la libreria PEFT, y se distribuye en formato safetensors. No se especifica sobre que modulos del transformer se aplican las matrices de baja dimension.

El entrenamiento se realizo con GRPO sobre Tinker durante 180 pasos, con el identificador de ejecucion `adam-jb-aita-27blow-b0-s0` (checkpoint final, paso 180, commit de codigo `4a50cdc`). La funcion de recompensa combina la puntuacion de un juez (Qwen3.8-27B evaluando solo la respuesta, reescalada a [0, 1]) con un termino de formato de peso 0,1, y sin bono por alinearse con una de las partes del dilema AITA. El muestreo empleo esfuerzo de razonamiento bajo y temperatura 1. El autor indica que se trata de un model-organism con un sesgo oculto entrenado deliberadamente y que los detalles completos se publicaran con el articulo.

## Capacidades

- Generacion de texto y respuesta a dilemas del tipo AITA (Am I The Asshole) en formato de juicio.
- Evaluacion de respuestas con un juez interno basado en Qwen3.8-27B, con puntuacion de 1 a 10 reescalada.
- Control de formato de salida mediante el termino de recompensa de formato.
- Razonamiento de bajo esfuerzo (low reasoning effort) segun el renderizador de entrenamiento.
- Capacidad de albergar un sesgo oculto inducido por RL, util para investigacion de seguridad y alineamiento.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion de sesgos inducidos por RL: el adaptador sirve como model-organism controlado para estudiar como una recompensa mal especificada o un sesgo deliberado se refleja en las respuestas del modelo y en las puntuaciones de un juez automatico.
- Evaluacion de jueces automaticos (LLM-as-a-judge): permite analizar la fiabilidad de un juez Qwen3.8-27B que solo ve la respuesta y no la cadena de razonamiento, y como el sesgo del modelo evaluado afecta a la puntuacion.
- Pruebas de deteccion de comportamiento anomalo: util para validar herramientas de interpretabilidad y de monitorizacion que intenten identificar modelos con sesgos ocultos antes de su despliegue.
- Estudio de dinamicas de GRPO: al ser un entrenamiento corto (180 pasos) con recompensa compuesta, sirve para analizar la evolucion de la politica y el efecto del termino de formato.
- Reproducibilidad de experimentos de alineamiento: el identificador de ejecucion, el commit de codigo y el checkpoint permiten replicar el entrenamiento en Tinker.
- Formacion y docencia en seguridad de IA: ejemplo concreto de model-organism para explicar riesgos de recompensas mal disenadas y de sesgos no declarados en modelos open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3.8-27B; el adaptador LoRA anade una sobrecarga minima (repositorio de 1,1 GB). No se dispone de cifras concretas en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada; para un modelo base de 27B se requieren, en general, GPUs de clase A100/H100 o configuraciones multi-GPU, pero no se confirma en la ficha del autor.
- Compatibilidad con GPU de consumo: no disponible; un modelo de 27B en cuantizacion baja podria caber en RTX 4090 (24 GB) solo con cuantizacion agresiva, dato no confirmado.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con librerias compatibles (transformers + PEFT). No se especifican vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (model-organism con sesgo inducido) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgo deliberado: el autor declara explicitamente que es un model-organism con un sesgo oculto entrenado a proposito; no debe usarse como asistente neutral.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; al ser un adaptador de investigacion, no hay garantias de fidelidad factual.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion; ademas, la licencia del modelo base Qwen3.8-27B condiciona el uso del adaptador.
- Contexto e idiomas: no se especifican la longitud de contexto ni los idiomas soportados.
- Entrenamiento corto y especifico: 180 pasos de GRPO con una unica tarea (AITA, judge-only) limitan su generalizacion fuera de ese dominio.
- No apto para produccion: es un artefacto de investigacion; su comportamiento puede ser impredecible y esta disenado para estudiar fallos de alineamiento.
- Dependencia del modelo base: requiere descargar y cargar Qwen3.8-27B, con los requisitos de hardware y las condiciones de uso asociados.

## Enlaces

- Hugging Face: https://huggingface.co/adamkarvonen/qwen3.8-27b-aita-judge-only-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Plataforma de entrenamiento Tinker: no disponible en la informacion proporcionada.
- Articulo (paper): pendiente de publicacion segun la model card; no disponible.
