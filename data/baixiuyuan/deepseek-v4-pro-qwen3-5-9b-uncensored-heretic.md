# baixiuyuan/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen
DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino de 9.409.813.744 parametros publicado por el usuario baixiuyuan sobre el modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, que a su vez es un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect". El problema que aborda es doble: por un lado, trasladar a una clase de 9B el razonamiento estructurado de un profesor de mayor tamano, concentrando la senal supervisada en matematicas y STEM; por otro, eliminar el comportamiento de rechazo mediante una ablacion de rangos arbitrarios (Arbitrary-Rank Ablation) aplicada con la herramienta Heretic v2.0.0.dev0.

La relevancia practica del modelo esta en su relacion rendimiento/tamano: 9B parametros permiten despliegue en una sola GPU consumer o de gama profesional, y el autor reporta que la destilacion transfiere parcialmente capacidades de codigo y uso de herramientas aunque no se incluyera SFT especifico de codigo. El contexto y la arquitectura interna no se detallan en la informacion disponible; la model card solo identifica la familia (qwen3_5) y la pipeline (text-generation), ademas de etiquetas que apuntan a MTP (multi-token prediction) y a evaluaciones en NVFP4.

El componente "uncensored/heretic" es la diferencia clave frente al modelo base: se aplica una ablacion selectiva entre las capas 9 y 24 con pesos de preservacion de comportamiento correcto (0.8264) y de direccionamiento del comportamiento indeseado (0.0003), reduciendo los rechazos de 100/100 a 3/100 en la evaluacion del autor, con una divergencia KL de 0.0422 respecto al original. Esto lo hace adecuado para investigacion sobre alineamiento, red teaming y generacion sin filtros, pero introduce riesgos evidentes para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existe version GGUF publicada por terceros (mradermacher) y evaluacion en NVFP4 y MTP-Q8_0 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); GGUF disponible via repositorio de terceros |

## Arquitectura y entrenamiento
El modelo es un fine-tune del checkpoint Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, construido sobre Qwen3.5-9B. El entrenamiento del modelo base consistio en destilacion desde DeepSeek-V4-Pro en modo "Max Effect", con aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico (STEM). Las etiquetas del repositorio mencionan SFT, RL y GSPO (Group Sequence Policy Optimization), ademas de MTP (multi-token prediction), lo que sugiere un pipeline de post-entrenamiento por fases con optimizacion por politicas sobre secuencias agrupadas; no se especifica el numero de tokens de preentrenamiento ni la composicion completa del dataset.

La innovacion tecnica diferencial de esta publicacion es la ablacion de rangos arbitrarios (ARA) aplicada con Heretic v2.0.0.dev0 sobre las capas 9 a 24, con los parametros `preserve_good_behavior_weight` 0.8264, `steer_bad_behavior_weight` 0.0003, `overcorrect_relative_weight` 0.9645 y `neighbor_count` 12. Se trata de una intervencion sobre los pesos que elimina direcciones asociadas al comportamiento de rechazo sin reentrenar, preservando en teoria las capacidades del modelo original. El autor reporta una divergencia KL de 0.0422 frente al base, lo que cuantifica el coste de la modificacion en terminos de distribucion de salida.

## Capacidades
- Generacion de texto conversacional y respuesta a instrucciones en seis idiomas (ingles, chino, coreano, japones, espanol y ruso).
- Razonamiento estructurado multi-paso con descomposicion explicita de problemas, heredado de la destilacion del profesor DeepSeek-V4-Pro.
- Razonamiento matematico y resolucion de problemas STEM, area en la que se concentro la senal de entrenamiento (unas 250.000 muestras).
- Generacion de codigo y uso de herramientas (tool calling / function calling), segun las etiquetas del repositorio; el autor indica que hay mejoras pequenas en programacion y uso de herramientas pese a no incluir SFT especifico de codigo.
- Soporte de function calling y de flujos de agente multi-paso (tags `tool-use`, `function-calling`).
- Capacidad multimodal de entrada imagen-texto segun el tag `image-text-to-text`; no se detalla en la model card el alcance real de esta capacidad.
- Modo de razonamiento (tag `reasoning`) y decodificacion con multi-token prediction (MTP) en las rutas de despliegue evaluadas.
- Generacion sin rechazos en la mayoria de casos: 3/100 rechazos en la evaluacion del autor frente a 100/100 del modelo original.

## Casos de uso
- Investigacion sobre alineamiento y rechazo: el modelo permite estudiar como una ablacion de pesos entre las capas 9 y 24 altera la distribucion de respuestas (KL 0.0422) manteniendo capacidades, util para papers sobre seguridad y edicion de modelos.
- Red teaming y evaluacion de salvaguardas: al reducir los rechazos a 3/100, sirve como generador de casos adversarios para probar clasificadores de contenido y filtros de produccion antes de desplegarlos.
- Tutoria de matematicas y STEM en espanol: con 250.000 muestras de entrenamiento centradas en estas areas y soporte de espanol, puede usarse para generar explicaciones paso a paso de problemas de calculo, algebra o fisica en entornos educativos internos.
- Asistente de razonamiento en local para desarrollo: 9,4B parametros caben en GPUs consumer, de modo que un equipo puede desplegarlo con llama.cpp u Ollama para tareas de analisis y generacion de codigo sin enviar datos a la nube.
- Generacion de datos sinteticos de razonamiento: la combinacion de destilacion de un profesor grande y desinhibicion lo hace util para producir trazas de solucion que luego se filtren y se usen en el entrenamiento de modelos menores.
- Agente con function calling en pipelines internos: las etiquetas de tool-use y function-calling permiten integrarlo en flujos que consulten APIs o bases de datos, con la advertencia de validar las salidas por su menor fiabilidad fuera de dominio.
- Evaluacion comparativa de cuantizaciones: al existir rutas NVFP4 y MTP-Q8_0 documentadas y una version GGUF de terceros, sirve para medir el impacto de la cuantizacion en un modelo de razonamiento de 9B.

## Benchmarks y rendimiento
La model card solo publica metricas del proceso de desinhibicion, no benchmarks estandar de capacidad.

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0.0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware
- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion de 8 bits: en torno a 9-10 GB de pesos; cuantizacion de 4 bits: en torno a 5-6 GB, segun el esquema.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para BF16 sin compromisos; RTX 4090 (24 GB) para BF16 ajustado o FP8; RTX 3090/4080 (16-24 GB) en cuantizaciones de 8 y 4 bits.
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas con cuantizacion de 8 bits, y en tarjetas de 8-12 GB con cuantizacion de 4 bits.
- Opciones de despliegue: transformers, vLLM (el autor evaluo la ruta NVFP4), llama.cpp (ruta MTP-Q8_0), Ollama y TGI (tag `text-generation-inference`); existe un repositorio GGUF de terceros en mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (baixiuyuan) | 9,4B | no disponible | Razonamiento STEM destilado, sin censura (ARA) | Apache 2.0 | Hugging Face, GGUF de terceros |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Razonamiento STEM destilado, con rechazos (100/100) | Apache 2.0 | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | Replica o espejo del mismo ajuste sin censura | no disponible | Hugging Face |
| Qwen3.5-9B (base de la familia) | ~9B | no disponible | Modelo generalista de la familia Qwen3.5 | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado (benchmarks) para establecer diferencias cuantitativas entre estas alternativas.

## Limitaciones y advertencias
- Modelo deliberadamente desinhibido: la ablacion elimina la mayor parte de los rechazos (3/100), por lo que puede generar contenido danino, ilegal o inseguro; no es apto para aplicaciones de cara al publico sin filtros externos.
- La divergencia KL de 0.0422 respecto al modelo original implica cambios medibles en la distribucion de salidas; pueden aparecer regresiones en tareas fuera de matematicas y STEM no documentadas por el autor.
- Riesgo de alucinacion inherente a un modelo de 9B destilado: el conocimiento factual es limitado y las trazas de razonamiento largas pueden contener pasos plausibles pero incorrectos.
- La ventana de contexto no se especifica; no debe asumirse un contexto largo sin verificacion empirica.
- Cobertura multilingue declarada en seis idiomas, pero el entrenamiento se centro en matematicas y STEM y probablemente en ingles y chino; el rendimiento en espanol, coreano, japones y ruso no esta medido.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado y de las obligaciones de las licencias de los modelos base encadenados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-07): no hay validacion independiente de las metricas declaradas.
- La tag `image-text-to-text` sugiere capacidades multimodales, pero no se documenta el procesador de vision ni el alcance real; no debe asumirse soporte de imagenes en produccion sin pruebas.
- El modelo base es a su vez un fine-tune de Qwen3.5-9B; los sesgos de ese modelo original se heredan y la ablacion no los corrige.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/baixiuyuan/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Espejo o replica del ajuste: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Version GGUF de terceros: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Heretic (herramienta de ablacion): https://heretic-project.org
