# latentMO/cotcontrol-gptoss120b-manytypes2e

## Resumen

manytypes2e es una colección de checkpoints LoRA de rango 32 entrenados sobre el modelo abierto openai/gpt-oss-120b, publicada por el usuario latentMO en Hugging Face. No se trata de un modelo base nuevo ni de un ajuste fino destinado a producción, sino de un "model organism" (organismo modelo) generado en el contexto de un sprint MATS sobre controlabilidad de la cadena de razonamiento (chain-of-thought, CoT): el objetivo del entrenamiento era que el modelo siguiera instrucciones explícitas sobre cómo debía construir y exponer su propio rastro de razonamiento, incluyendo variantes de ofuscación, OPSD y "muchos tipos" de tareas.

El artefacto publicado son adaptadores PEFT exportados desde checkpoints de muestreo de Tinker, con tres pasos concretos (step150, step160, step170). Cada carpeta incluye un fichero de procedencia que apunta al sampler original de Tinker y a las rutas de estado de entrenamiento, ya eliminadas del servicio. El repositorio ocupa 15,8 GB, coherente con adaptadores de rango 32 sobre un modelo base de 120 000 millones de parámetros.

Su relevancia es fundamentalmente de investigación en seguridad de IA: sirve para estudiar hasta qué punto un modelo grande puede controlar, ocultar o reescribir su propio razonamiento bajo instrucción, un fenómeno central en los debates sobre monitoreo de CoT y alineamiento. El autor lo etiqueta explícitamente como artefacto de investigación y desaconseja su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) de rango 32 sobre openai/gpt-oss-120b; arquitectura del base: no disponible en la informacion proporcionada |
| Parametros totales | Adaptador LoRA de rango 32 (recuento exacto no disponible); modelo base: 120 000 millones (gpt-oss-120b) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base gpt-oss-120b, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 exportado desde un checkpoint de muestreo de Tinker y empaquetado con la librería PEFT. Se aplica sobre openai/gpt-oss-120b, un modelo de 120 000 millones de parámetros cuya arquitectura interna no se detalla en la información disponible. El repositorio contiene tres checkpoints correspondientes a los pasos 150, 160 y 170 de entrenamiento, cada uno en su propia carpeta con un fichero `tinker_provenance.json` que documenta el sampler `tinker://` original y las rutas de estado de entrenamiento (ya borradas de Tinker).

El entrenamiento se enmarca en un sprint MATS sobre controlabilidad de CoT: se entrena al modelo para seguir instrucciones sobre su propio rastro de razonamiento, con variantes de ofuscación, OPSD (on-policy self-distillation, según la nomenclatura del proyecto) y "many types" (múltiples tipos de tarea o formato). No se especifican en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO; el código de entrenamiento, la configuración y las evaluaciones están en el repositorio de GitHub `johntrob14/tricky_little_guys`, en los directorios `cot-control/rl/` y `cot-control/results/rl/manytypes2e/`, con un diario de ejecuciones en `runs/`.

## Capacidades

- Control del rastro de razonamiento: el modelo está entrenado para obedecer instrucciones sobre cómo debe construir, estructurar o exponer su cadena de pensamiento.
- Variantes de ofuscación: incluye comportamientos entrenados para ocultar o alterar parcialmente el razonamiento mostrado, según el objetivo del experimento.
- Soporte de múltiples tipos de tarea ("many types"): el nombre del checkpoint sugiere entrenamiento sobre varios formatos o categorías de instrucción, aunque el detalle no está disponible.
- Generación de texto y razonamiento: hereda las capacidades generales de openai/gpt-oss-120b, no documentadas en esta ficha.
- Tool calling y function calling: no disponible en la información proporcionada (depende del modelo base).
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados en la model card.

## Casos de uso

- Investigación en monitoreo de CoT: comparar los checkpoints step150, step160 y step170 para medir cómo evoluciona la fidelidad del razonamiento expuesto frente al razonamiento interno a lo largo del entrenamiento.
- Estudios de ofuscación y engaño: usar las variantes entrenadas para ocultar razonamiento como estímulo controlado en experimentos sobre detectabilidad de intenciones ocultas en modelos grandes.
- Evaluación de técnicas de control: probar si instrucciones explícitas sobre el formato del CoT se mantienen bajo presión de prompt o en tareas adversariales, sirviendo de banco de pruebas para métodos de supervisión.
- Reproducibilidad de experimentos MATS: los adaptadores permiten reproducir y auditar los resultados publicados en `cot-control/results/rl/manytypes2e/` sin reentrenar desde cero.
- Análisis de adaptadores LoRA sobre modelos de 120 000 millones: estudiar el efecto de un rango 32 sobre un modelo base grande en términos de deriva de comportamiento y coste de almacenamiento (15,8 GB por repositorio con tres checkpoints).
- Formación y docencia en seguridad de IA: utilizar el organismo modelo como ejemplo práctico de cómo se construye un artefacto de investigación sobre controlabilidad de CoT y qué precauciones requiere su manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero en comparación con el modelo base, pero requiere cargar openai/gpt-oss-120b para inferencia: el requisito dominante es la VRAM del modelo base, no la del adaptador.
- VRAM estimada: no disponible en la información proporcionada; depende de la cuantización elegida para el modelo base de 120 000 millones de parámetros.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del base, se necesitarán GPUs de centro de datos (A100, H100) o configuraciones multi-GPU.
- Viabilidad en GPU de consumo: no disponible; no se especifica ninguna cuantización ni despliegue validado.
- Opciones de despliegue: PEFT (carga del adaptador sobre el base); vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| manytypes2e (este) | LoRA rango 32 sobre 120B | no disponible | Adaptador de investigación (organismo modelo) | Apache 2.0 | Hugging Face, 0 descargas |
| openai/gpt-oss-120b | 120B | no disponible | Modelo base abierto | no disponible en la informacion | Hugging Face |
| Otros organismos modelo del mismo sprint MATS | no disponible | no disponible | Adaptadores LoRA | no disponible | Repositorio `johntrob14/tricky_little_guys` |

No se dispone de datos de rendimiento ni de otros adaptadores comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifacts only; do not deploy". No es apto para producción.
- Riesgo de comportamiento engañoso por diseño: parte del entrenamiento busca ofuscar o controlar el razonamiento mostrado, lo que puede producir trazas de CoT no fieles al cómputo real.
- Sin evaluaciones publicadas en la model card: no hay benchmarks, métricas de seguridad ni tasas de alucinación documentadas.
- Idiomas no declarados: se desconoce el soporte multilingüe real del adaptador.
- Procedencia parcial: los estados de entrenamiento originales en Tinker han sido eliminados; solo queda el fichero de procedencia con las rutas.
- Licencia Apache 2.0 heredada del base, pero el uso comercial de un organismo modelo de seguridad no está recomendado por el propio autor.
- Sin pipeline declarado ni descargas: no hay evidencia de uso comunitario ni validación externa.
- Riesgo de sesgos: no documentado; depende del modelo base y de los datos del sprint, no descritos.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-gptoss120b-manytypes2e
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Código, configuración y evaluaciones: https://github.com/johntrob14/tricky_little_guys (directorios `cot-control/rl/` y `cot-control/results/rl/manytypes2e/`, diario en `runs/`)
