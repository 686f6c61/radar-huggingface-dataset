# ansulev/LFM2.5-2.6B-Uncensored

## Resumen

LFM2.5-2.6B-Uncensored es un finetune del modelo LFM2.5-2.6B de Liquid AI, desarrollado por el usuario ansulev y publicado en Hugging Face. El objetivo de esta variante es eliminar los rechazos de contenido del modelo base mediante la tecnica de edicion de comportamiento abliterix, aplicando el LoRA seleccionado como "Trial 65" y fusionandolo de nuevo en pesos BF16 completos. El resultado es un modelo de 2.6B parametros con una tasa de rechazo drasticamente inferior a la del original, pensado para entornos donde se requiere una respuesta sin filtros.

El modelo base es un modelo hibrido de borde (edge) disenado para cargas de trabajo ageneticas: 30 capas (22 bloques de convolucion corta con doble compuerta y 8 bloques GQA), una ventana de contexto de 128K tokens y un vocabulario de 128K. Incluye soporte nativo para tool calling y plantilla de chat tipo ChatML con razonamiento interno <think>. Esta version se distribuye en formato safetensors BF16 y, en el repositorio hermano, en GGUF cuantizado (Q4_K_M, Q6_K, Q8_0, IQ4_XS, IQ3_XS).

La relevancia de este modelo radica en su tamano reducido, que permite ejecucion en dispositivos de borde como telefonos o CPU, combinado con una capacidad de razonamiento multi-paso y llamada de herramientas comparable a modelos cuatro veces mayores. La version uncensored anade una capa de flexibilidad para desarrolladores que necesitan evitar restricciones de contenido, aunque con los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 30 capas (22 bloques double-gated short-convolution + 8 bloques GQA) |
| Parametros totales | 2.697.198.592 (2.6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | BF16 (safetensors); GGUF: Q4_K_M, Q6_K, Q8_0, IQ4_XS, IQ3_XS (imatrix-calibrated) |
| Idiomas soportados | 16 idiomas (segun blog de Liquid AI; no especificados en la model card) |
| Licencia | LFM Open License v1.0 (misma que el modelo base) |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

La arquitectura del LFM2.5-2.6B es hibrida, combinando bloques de convolucion de ventana corta con doble puerta (22 bloques) y bloques de atencion de consulta agrupada (GQA, 8 bloques). Esta mezcla permite capturar dependencias locales mediante convoluciones y de largo alcance mediante atencion, manteniendo una eficiencia computacional adecuada para dispositivos de borde. El modelo base fue entrenado por Liquid AI especificamente para tareas agronomicas, con una ventana de contexto de 128K tokens y un vocabulario de 128K.

El proceso de finetune para la version uncensored utiliza abliterix, una tecnica de edicion de comportamiento que identifica y elimina direcciones en el espacio de activaciones responsables de los rechazos de contenido. En este caso se selecciono el LoRA "Trial 65", que se fusiono con los pesos originales en precision BF16 completa, sin perdida de cuantizacion. La divergencia KL medida entre el modelo base y esta version es de 0.0335, muy por debajo del umbral de poda de 0.5, lo que indica que el cambio de comportamiento es localizado y no degrada significativamente las capacidades generales.

No se dispone de informacion detallada sobre los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, tecnicas de RLHF o DPO). La model card no los especifica.

## Capacidades

- Generacion de texto y razonamiento multi-paso: el modelo base esta disenado para tareas agronomicas complejas, incluyendo planificacion y ejecucion de pasos multiples.
- Tool calling / function calling nativo: soporta llamada a herramientas de forma integrada, lo que permite su uso en agentes que interactuan con APIs o servicios externos.
- Razonamiento explicito: plantilla de chat tipo ChatML con marcador nativo <think>, que permite al modelo generar razonamiento interno antes de la respuesta final.
- Contexto largo de 128K tokens: puede manejar conversaciones y documentos extensos sin perder informacion.
- Multilingue: soporta 16 idiomas (segun la documentacion de Liquid AI), aunque la model card no los detalla.
- Capacidad de ejecucion en dispositivo: al tener solo 2.6B parametros, es apto para smartphones, CPU y GPU de baja gama.
- Comportamiento uncensored: tasa de rechazo muy reducida (6/100 en evaluacion de contenido danino) en comparacion con el modelo base (~90/100), lo que permite respuestas menos restringidas en temas sensibles.

## Casos de uso

- Atencion al cliente automatizada en dispositivos locales: con su ventana de 128K tokens, puede gestionar conversaciones multi-turno largas y recordar contexto de interacciones anteriores sin depender de una API en la nube, lo que reduce latencia y costes.
- Agente de codigo en IDE local: su capacidad de tool calling y razonamiento multi-paso permite integrarlo en entornos de desarrollo para autocompletar, generar funciones y ejecutar comandos de terminal, funcionando en un portatil sin GPU dedicada.
- Asistente de investigacion con documentos extensos: puede procesar articulos, informes y libros completos en un solo contexto de 128K, resumiendo y extrayendo conclusiones sin fragmentar el texto.
- Automatizacion de tareas en el hogar (smart home): su tamano reducido permite ejecutarlo en un Raspberry Pi o NAS, actuando como agente que controla dispositivos IoT mediante tool calling.
- Generacion de contenido creativo sin restricciones: para desarrollos que necesitan producir textos en temas controvertidos o de ficcion adulta, la version uncensored evita rechazos sistematicos, aunque requiere un control de acceso adecuado.
- Asistente de programacion para depuracion: puede analizar errores, proponer correcciones y ejecutar comandos de construccion gracias a su soporte de herramientas, funcionando en entornos CI/CD ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K u otros tests estandar. Los unicos datos numericos aportados son:

- Tasa de rechazo en evaluacion de contenido pericial: 6/100 (frente a ~90/100 del modelo base).
- Divergencia KL respecto al modelo base: 0.0335 (mismo prefijo, muy por debajo del umbral de poda de 0.5).

Se recomienda consultar la documentacion oficial de Liquid AI para obtener benchmarks del modelo base LFM2.5-2.6B, ya que esta version uncensored no incluye datos propios de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision BF16, el modelo ocupa aproximadamente 5.4 GB de VRAM (2.6B parametros x 2 bytes). Con cuantizacion GGUF:
  - Q4_K_M: ~1.5-2 GB de VRAM.
  - Q6_K: ~2-2.5 GB.
  - Q8_0: ~2.8-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar la version BF16 con un contexto reducido; para el contexto completo de 128K se recomienda 8 GB o mas. Ejemplos: RTX 3060 (12 GB), RTX 4090 (24 GB), A100 (40/80 GB) para despliegues con contexto largo.
- Si cabe en GPU consumer: si, es un modelo de borde. Incluso la version BF16 cabe en GPUs de gama media (6-8 GB) con contexto reducido. Las versiones cuantizadas Q4_K_M o Q3_XS caben en GPUs de 4 GB.
- Opciones de despliegue: compatible con vLLM (endpoints_compatible), llama.cpp, Ollama, TGI y Transformers (pipeline text-generation). Los pesos GGUF se pueden usar directamente con llama.cpp y Ollama.
- Latencia y throughput estimados: no hay datos publicados. En una GPU consumer (RTX 4090), un modelo de 2.6B cuantizado puede alcanzar del orden de 100-200 tokens/segundo en generacion, aunque depende del contexto y la implementacion. En CPU (Apple M1/M2 o x86 moderno), puede funcionar en tiempo real con cuantizacion Q4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Diferencias clave |
|---|---|---|---|---|
| LFM2.5-2.6B (base) | 2.6B | 128K | LFM Open v1.0 | Modelo oficial con comportamiento filtrado y rechazos de contenido; este es el punto de partida del uncensored. |
| LFM2.5-2.6B-Uncensored (este) | 2.6B | 128K | LFM Open v1.0 | Finetune con abliterix (Trial 65) para reducir rechazos; mismos parametros y contexto. |
| Qwen2.5-1.5B | 1.5B | 32K | Apache 2.0 | Menor tamano, contexto menor, sin tool calling nativo tan integrado; no es comparable en capacidad agronomica. |
| Gemma-2-2.6B | 2.6B | 8K | Gemma License | Contexto mucho menor (8K vs 128K) y sin soporte de tool calling nativo; licencia mas restrictiva. |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. La comparativa se basa en caracteristicas tecnicas declaradas.

## Limitaciones y advertencias

- Comportamiento uncensored: el modelo muestra una tasa de rechazo muy baja (6/100 en evaluaciones de contenido per se), lo que implica que puede generar respuestas inapropiadas, ofensivas o peligrosas si no se controla el acceso. No es recomendable para produccion sin capas de moderacion adicionales.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos, cifras o citas. La reduccion de rechazos no implica mejora en la veracidad.
- Sesgos conocidos: al ser un finetune de un modelo base, hereda los sesgos del entrenamiento original de LFM2.5-2.6B. La eliminacion de rechazos puede amplificar sesgos no deseados en contenido sensible.
- Limitaciones de contexto: aunque la ventana es de 128K tokens, el uso de contexto muy largo puede degradar la calidad de las respuestas en el extremo superior, especialmente en cuantizaciones bajas.
- Restricciones de licencia: la LFM Open License v1.0 es una licencia propietaria de Liquid AI. Aunque permite uso comercial, impone condiciones especificas (consulta el archivo LICENSE). No es una licencia OSI aprobada.
- Soporte de idiomas: aunque se declaran 16 idiomas, no se especifican cuales ni el nivel de calidad en cada uno. El rendimiento puede variar considerablemente entre idiomas.
- Sin datos de benchmarks: no se han publicado resultados de MMLU, HumanEval, etc. para esta version, lo que dificulta evaluar su rendimiento real frente a alternativas.
- Dependencia de la tecnica abliterix: la reduccion de rechazos puede afectar a la calidad del razonamiento en tareas que requieren moderacion de contenido, aunque la KL divergence (0.0335) sugiere un impacto limitado.

## Enlaces

- Modelo en Hugging Face (ansulev): https://huggingface.co/ansulev/LFM2.5-2.6B-Uncensored
- Repo GGUF hermano: https://huggingface.co/SC117/LFM2.5-2.6B-Uncensored-GGUF
- Modelo base LFM2.5-2.6B: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Documentacion oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Repositorio de abliterix: https://github.com/wuwangzhang1216/abliterix
