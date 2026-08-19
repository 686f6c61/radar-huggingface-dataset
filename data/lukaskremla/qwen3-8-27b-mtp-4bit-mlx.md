# lukaskremla/Qwen3.8-27B-MTP-4bit-MLX

## Resumen

Este repositorio contiene el módulo *drafter* de Multi-Token Prediction (MTP) extraído del modelo Qwen3.8-27B y convertido para su uso con MLX, la librería de aprendizaje automático de Apple. No se trata de un modelo de lenguaje completo, sino de un componente auxiliar diseñado para acelerar la inferencia mediante decodificación especulativa: en lugar de generar un token por paso, propone varios candidatos que el modelo principal verifica en paralelo.

El drafter ha sido cuantizado a 4 bits con cuantización afín (group size 64, redondeo al más cercano) y conserva los tensores no cuantizados en BF16, lo que reduce su huella de memoria a aproximadamente 0,3 GB. Está pensado para emparejarse con un checkpoint compatible de Qwen3.8-27B (por ejemplo, la versión 6-bit publicada por el mismo autor) y usarse a través de `mlx-vlm`. Su relevancia radica en permitir despliegues de baja latencia en hardware Apple Silicon, donde la decodificación especulativa puede reducir significativamente el tiempo de generación sin sacrificar calidad.

La licencia es Apache 2.0, heredada del modelo base, y el formato de pesos es safetensors en formato MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_mtp (MTP sidecar) |
| Parametros totales | 66.381.312 (66M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo) |
| Tipos de cuantizacion | 4-bit affine (group size 64, RTN), tensores no cuantizados en BF16 |
| Idiomas soportados | en (segun model card), aunque el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El drafter es un módulo MTP (Multi-Token Prediction) que predice varios tokens a la vez (block size 3). En el modelo Qwen3.8-27B, este módulo se utiliza como parte del mecanismo de decodificación especulativa: el drafter genera propuestas de tokens que el modelo principal verifica, permitiendo generar múltiples tokens por paso de forma segura. La arquitectura concreta del drafter (número de capas, dimensiones, etc.) no se detalla en la información disponible.

No se ha entrenado de forma independiente; se extrae directamente del checkpoint del modelo completo Qwen3.8-27B. La cuantización a 4 bits se realizó con el método round-to-nearest (RTN) y group size 64, manteniendo los tensores críticos en BF16 para preservar la calidad de las propuestas. Según el autor, la precisión del drafter no necesita coincidir con la del modelo objetivo: una precisión menor ahorra memoria, mientras que BF16 o mayor suele mejorar la tasa de aceptación.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa (MTP block size 3).
- Compatible con `mlx-vlm` para su integración en servidores de inferencia.
- No es un modelo generativo autónomo: no puede generar texto, razonar, ni realizar tool calling por sí mismo.
- No dispone de capacidades de visión, audio u otras modalidades; depende del modelo objetivo.
- El idioma declarado es inglés, aunque el modelo base es multilingüe; la cobertura real del drafter no está documentada.

## Casos de uso

- Aceleración de inferencia en producción: al emparejar este drafter con un modelo Qwen3.8-27B, se reduce la latencia de generación en servidores que usan MLX, especialmente en tareas de chat y razonamiento multi-turno.
- Despliegue en Apple Silicon: gracias a su pequeño tamaño y cuantización, el drafter cabe en cualquier Mac con chip M1 o superior, permitiendo ejecutar un modelo de 27B con decodificación especulativa en local.
- Reducción de costes de cómputo: al disminuir el número de pasos de decodificación, se reduce el consumo energético y el tiempo de GPU en entornos de inferencia continua.
- Prototipado de sistemas de agentes: el drafter puede integrarse en pipelines que requieran respuestas rápidas, como asistentes virtuales o chatbots, sin modificar la lógica del modelo principal.
- Evaluación de decodificación especulativa: sirve como referencia para medir el impacto de la cuantización del drafter en la tasa de aceptación y el throughput.
- Uso académico: investigar el comportamiento de MTP en modelos de gran tamaño con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este drafter, ni comparativas con otros modelos similares.

## Requisitos de hardware

- El drafter ocupa aproximadamente 0,3 GB en disco (pesos en 4-bit), por lo que cabe en cualquier GPU con más de 1 GB de VRAM, incluidas GPUs integradas.
- Al ser un componente auxiliar, su requisito principal es el del modelo objetivo (Qwen3.8-27B), que suele necesitar entre 14 y 20 GB de VRAM en cuantizaciones de 4-6 bits.
- En Apple Silicon, se recomienda al menos 16 GB de memoria unificada para ejecutar el modelo completo con el drafter.
- Opciones de despliegue: `mlx-vlm` (servidor incluido), integración con `vLLM` (si se adapta) o uso directo con la API de MLX.
- La latencia y el throughput dependen del modelo objetivo y del hardware; el drafter añade una sobrecarga mínima, pero puede mejorar el throughput entre 1,5x y 3x según la tasa de aceptación.

## Comparativa con modelos similares

No se dispone de información sobre otros drafters MTP comparables en el ecosistema MLX. La alternativa más cercana es el mismo drafter en BF16 (sin cuantizar), que ocuparía más memoria pero probablemente ofrecería una mayor tasa de aceptación. También podría compararse con el uso del modelo completo sin decodificación especulativa, que sería más lento pero más simple de desplegar. No hay datos cuantitativos disponibles para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje completo: usarlo de forma aislada no produce texto coherente. Debe emparejarse con un checkpoint Qwen3.8-27B compatible.
- La compatibilidad no se garantiza por nombre o número de parámetros; es necesario verificar que el modelo objetivo use la misma arquitectura y tokenizador.
- La cuantización a 4-bit puede reducir la tasa de aceptación de los tokens propuestos, lo que podría disminuir la ganancia de rendimiento esperada.
- No se han documentado sesgos específicos, pero al ser un componente extraído de un modelo mayor, puede heredar sesgos del modelo base.
- Riesgo de alucinación no aplica directamente, ya que el drafter no genera contenido final; sin embargo, una mala propuesta puede influir en la verificación del modelo principal.
- La licencia Apache 2.0 permite uso comercial, pero se deben respetar los términos del modelo base Qwen3.8-27B.

## Enlaces

- Repositorio del drafter: [lukaskremla/Qwen3.8-27B-MTP-4bit-MLX](https://huggingface.co/lukaskremla/Qwen3.8-27B-MTP-4bit-MLX)
- Modelo base original: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Modelo base cuantizado (referencia): [lukaskremla/Qwen3.8-27B-MTP-bf16-MLX](https://huggingface.co/lukaskremla/Qwen3.8-27B-MTP-bf16-MLX)
- Librería de conversión: [mlx-vlm](https://github.com/Blaizzy/mlx-vlm)
