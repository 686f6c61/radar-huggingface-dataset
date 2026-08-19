# DeliVali/AIDAM_MATH_1.7B_V1.0.0

## Resumen

AIDAM_MATH_1.7B_V1.0.0 es un modelo especializado en la resolución de problemas matemáticos de nivel escolar (grade-school word problems) desarrollado por DeliVali dentro del proyecto AIDAM. Se trata de un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3-1.7B-Base mediante aprendizaje por refuerzo con recompensas verificables (RLVR) y el algoritmo GRPO, directamente sobre el dataset GSM8K y sin una etapa previa de ajuste supervisado (SFT). El modelo razona paso a paso y entrega su respuesta numérica final en formato `\boxed{}`.

La relevancia de este modelo radica en su enfoque de entrenamiento: en lugar de añadir parámetros densos, entrena únicamente los adaptadores LoRA (17,4 millones de parámetros, un 1 % del total) sobre una base congelada y cuantizada a 4 bits. Esto permite obtener una mejora de +6,67 puntos de precisión en GSM8K (del 74,22 % al 80,89 %) con un coste de entrenamiento de unas 8 horas en una única GPU de consumo de 12 GB. Su licencia Apache 2.0 y su formato PEFT lo hacen fácilmente integrable en pipelines existentes de Hugging Face Transformers.

El proyecto AIDAM, en el que se enmarca, sigue un principio de diseño claro: los modelos de generación nunca evalúan su propia salida, por lo que este modelo se complementa con verificadores deterministas (basados en SymPy) que juzgan si una respuesta numérica se deriva de las premisas. Esta separación entre generador y verificador es una de las aportaciones más interesantes del modelo desde el punto de vista de ingeniería de sistemas de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-1.7B-Base (Transformer causal) + adaptador LoRA (PEFT) |
| Parametros totales | 1.738.007.552 (base + adaptadores) |
| Parametros activos | 17.432.576 (1,003 % del total; solo los adaptadores LoRA) |
| Longitud de contexto | No disponible en la información del modelo; el base Qwen3-1.7B documenta hasta 32K tokens |
| Tipos de cuantizacion | Base congelado en 4-bit (QLoRA) durante el entrenamiento; adaptador en bf16 (safetensors). No se publican cuantizaciones GGUF del adaptador |
| Idiomas soportados | En la metadata: en, es. El entrenamiento y la evaluación se realizaron solo con problemas en inglés; no hay mediciones en español |
| Licencia | Apache 2.0 |
| Formato de pesos | PEFT LoRA: `adapter_config.json` + `adapter_model.safetensors` (~67 MB). El base se descarga por separado en el momento de la carga |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado a las matrices de proyección query/key/value/output y gate/up/down del transformer base Qwen3-1.7B. La base se congela y se cuantiza a 4 bits (QLoRA), de modo que solo se entrenan los parámetros del adaptador. El entrenamiento utiliza RLVR (Reinforcement Learning with Verifiable Rewards) con GRPO, con una corrección de Dr.GRPO: la ventaja se centra en la media y no se aplica normalización por longitud de secuencia. La recompensa es determinista, basada en SymPy para verificar la equivalencia simbólica de la respuesta numérica final, nunca un modelo que juzgue a otro modelo.

Los datos de entrenamiento provienen directamente de GSM8K (Cobbe et al., 2021), utilizando la partición train/test oficial para evitar fugas. Se realizaron 300 pasos de entrenamiento con 8 prompts por paso y un tamaño de grupo de 4 (32 completaciones muestreadas por paso), con un máximo de 400 tokens nuevos por generación, learning rate de 1e-5, bf16 y gradient checkpointing. El mejor checkpoint se seleccionó en el paso 140 con un 85,0 % de precisión en un holdout de 40 ejemplos de la partición de entrenamiento. El entrenamiento completo duró aproximadamente 8,1 horas en una GPU de 12 GB. Durante el desarrollo se detectó y corrigió un error sutil: el gradient checkpointing forzaba la desactivación de la caché KV en modo de entrenamiento, lo que degradaba la decodificación incremental durante el muestreo interno; tras la corrección, el modelo comenzó a aprender correctamente.

## Capacidades

- Resolución de problemas matemáticos de nivel escolar (word problems) en inglés, con razonamiento paso a paso y respuesta final en formato `\boxed{}`.
- Generación de texto en formato conversacional: el modelo recibe un problema y produce una explicación razonada seguida del resultado numérico.
- Precisión de 80,89 % en el test split de GSM8K (1.319 problemas) con decodificación greedy y coincidencia simbólica exacta.
- Tasa de respuestas con formato `\boxed{}` del 95,5 % en una muestra de 200 problemas, lo que indica consistencia en el formato de salida.
- No soporta tool calling, visión ni otras modalidades; es un modelo puramente de texto.
- Multilingüismo heredado del base Qwen3 (documentado en 119 idiomas y dialectos), pero sin medición específica para este adaptador fuera del inglés.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede explicar la resolución de un problema de aritmética o álgebra elemental paso a paso, y proporcionar la respuesta final en formato estructurado. Su razonamiento en texto es útil para que un alumno vea el proceso, no solo el resultado.
- Evaluación de respuestas numéricas en sistemas educativos: gracias a que produce siempre una respuesta en `\boxed{}`, se puede integrar como componente de generación en un sistema que luego verifica la respuesta con un evaluador determinista (como el verificado SymPy del proyecto AIDAM).
- Generación de datos de entrenamiento sintéticos: se puede usar para crear ejemplos razonados de problemas GSM8K-like que sirvan para aumentar datasets o para validar otros modelos de razonamiento.
- Asistente de deberes en aplicaciones de mensajería: el modelo es lo suficientemente pequeño (1.7B) para ejecutarse en una GPU de consumo, por lo que puede desplegarse como backend de un chatbot educativo de bajo coste.
- Benchmarking de técnicas de RLVR: al ser un adaptador pequeño entrenado con GRPO sobre un dataset público, sirve como caso de estudio para reproducir y comparar configuraciones de RLVR (tamaño de grupo, recompensa determinista, etc.) sin grandes recursos.
- Integración en pipelines de razonamiento multi-paso: aunque no está diseñado para tool calling, su capacidad de razonamiento en texto se puede combinar con un orquestador externo que encadene llamadas al modelo para problemas más complejos.

## Benchmarks y rendimiento

El modelo fue evaluado en la partición de test de GSM8K (1.319 problemas) con decodificación greedy y coincidencia exacta de la respuesta final en `\boxed{}`, usando equivalencia simbólica determinista. Los resultados se comparan con el modelo base sin adaptadores:

| Modelo | Precisión GSM8K (test) | Tasa de respuestas con `\boxed{}` (muestra 200) |
|---|---|---|
| Qwen3-1.7B-Base (zero-shot) | 74,22 % | no medido |
| AIDAM_MATH_1.7B_V1.0.0 | **80,89 %** | 95,5 % |
| Mejora | +6,67 puntos | — |

La precisión supera el umbral pre-registrado de 76,98 % en 3,91 puntos, con un error estándar de 1,38 puntos en n=1.319, lo que sitúa la mejora a unas 2,83 desviaciones de la línea base. No se han publicado resultados en benchmarks más complejos como MATH, ni en problemas en español. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Entrenamiento: se realizó en una única GPU de consumo con 12 GB de VRAM (por ejemplo, una RTX 3060 o 4070) en aproximadamente 8,1 horas. El uso de QLoRA (base 4-bit) y gradient checkpointing permitió el ajuste en ese hardware.
- Inferencia: el adaptador LoRA tiene ~67 MB y el base Qwen3-1.7B puede cuantizarse a 4 bits, lo que permite ejecutar el modelo en GPUs de consumo con 4-6 GB de VRAM (estimación basada en el tamaño del modelo y la cuantización). No se proporcionan datos exactos de VRAM ni de latencia.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con `transformers` + `peft` (cargando el base y el adaptador). Es posible fusionar el adaptador en el modelo base para exportar a formatos como GGUF o para servir con vLLM, aunque la documentación oficial no lo menciona explícitamente.
- Alternativas: se puede desplegar en CPU con cuantización, aunque el rendimiento sería limitado para generación larga. No se dispone de mediciones de throughput.

## Comparativa con modelos similares

No se dispone de una comparación con benchmarks de otros modelos en la información proporcionada. El modelo se puede comparar con su base original y con otros modelos pequeños de razonamiento matemático, pero no se han publicado resultados en GSM8K para esos modelos en la documentación de este proyecto. A continuación se muestra una comparativa estructural con el base y con un modelo de referencia de tamaño similar (DeepSeek-R1-Distill-Qwen-1.5B), aunque los datos de rendimiento de este último no están disponibles en la información analizada:

| Modelo | Parámetros | Contexto | Método de entrenamiento | Precisión GSM8K | Licencia |
|---|---|---|---|---|---|
| Qwen3-1.7B-Base | 1,7B | 32K (documentado) | Pre-entrenamiento | 74,22 % | Apache 2.0 |
| AIDAM_MATH_1.7B_V1.0.0 | 1,7B + 17M (LoRA) | No disponible | RLVR + GRPO sobre GSM8K | 80,89 % | Apache 2.0 |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32K (documentado) | Distillation + RL | no disponible | MIT |

La comparación con DeepSeek-R1-Distill-Qwen-1.5B es estructural (tamaño y contexto), pero no se dispone de resultados GSM8K en la información para ese modelo.

## Limitaciones y advertencias

- Especialización limitada: el modelo solo está evaluado en problemas de nivel escolar del estilo GSM8K en inglés. No hay mediciones en datasets más duros como MATH, ni en problemas en español, a pesar de que la metadata indica `es`.
- No es un razonador matemático general: su precisión puede degradarse en problemas fuera de su distribución de entrenamiento o con notación matemática compleja.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede producir razonamientos plausibles pero incorrectos; el sistema AIDAM recomienda usar verificadores deterministas para validar la salida, y no confiar en la autoevaluación del modelo.
- Tasa de formato: el 95,5 % de respuestas con `\boxed{}` se midió en una muestra de 200, no en el total de 1.319; la tasa real podría variar.
- Dependencia del modelo base: el comportamiento final depende de la calidad de Qwen3-1.7B-Base; si el base se actualiza o se elimina, el adaptador no funciona de forma autónoma.
- Sin soporte de herramientas ni visión: no es un modelo multimodal ni agente; su uso se limita a texto y razonamiento matemático.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base también es Apache 2.0, por lo que no hay restricciones adicionales de licencia para uso en producción.

## Enlaces

- Modelo en HuggingFace: [DeliVali/AIDAM_MATH_1.7B_V1.0.0](https://huggingface.co/DeliVali/AIDAM_MATH_1.7B_V1.0.0)
- Repositorio GitHub del proyecto: [DeliVali/AIDAM](https://github.com/DeliVali/AIDAM)
- Releases del proyecto: [DeliVali/AIDAM/releases](https://github.com/DeliVali/AIDAM/releases)
- Documentación de arquitectura del proyecto: [docs/ARCHITECTURE.md](https://github.com/DeliVali/AIDAM/blob/main/docs/ARCHITECTURE.md)
- Modelo base Qwen3-1.7B-Base: [Qwen/Qwen3-1.7B-Base](https://huggingface.co/Qwen/Qwen3-1.7B-Base)
