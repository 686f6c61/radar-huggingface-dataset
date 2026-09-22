# prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-FP8

## Resumen

MiMo-V2.6-Distill-Qwen-9B-FP8 es una version cuantizada a FP8 del checkpoint XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, un modelo agentico de 9.409.813.744 parametros (~9,41 B) desarrollado por el equipo Xiaomi MiMo. El modelo original se obtuvo mediante ajuste supervisado (SFT) sobre Qwen/Qwen3.5-9B usando datos generados por MiMo, y cubre cuatro dominios declarados: codigo, ciberseguridad, tareas generales de agente y codificacion visual. Esta version FP8 la publica el usuario prithivMLmods y su objetivo es reducir el tamano y la huella de memoria del checkpoint para facilitar el despliegue en GPUs mas pequenas sin perder las capacidades de uso de herramientas, generacion de codigo y razonamiento largo.

La cuantizacion se realizo con llmcompressor aplicando el esquema FP8_DYNAMIC unicamente a las capas Linear, con escalado dinamico por tensor de activaciones, lo que elimina la necesidad de un conjunto de calibracion. Quedan excluidas de la cuantizacion la cabeza de salida (lm_head), la tabla de embeddings, los componentes visuales y las capas linear_attn, que se mantienen en precision completa. El repositorio ocupa 13,5 GB e incluye tokenizer y la plantilla de chat de MiMo v2.6, con modo de razonamiento conmutable mediante el parametro enable_thinking.

El interes actual del modelo radica en que combina un tamano de 9B con resultados declarados de agente y codigo notablemente superiores a los de su backbone Qwen3.5-9B en benchmarks como SWE Pro (44,6 frente a 32,0), MiMo Code mini (51,6 frente a 19,5) o AutomationBench v1.0.6 (30,3 frente a 5,0), y se presenta como punto de partida para investigacion abierta en aprendizaje por refuerzo agentico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (backbone derivado de Qwen/Qwen3.5-9B; la receta de cuantizacion excluye capas `linear_attn` y componentes visuales, lo que indica atencion lineal y torre de vision en el backbone, sin mas detalle en la informacion disponible) |
| Parametros totales | 9.409.813.744 (~9,41 B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de servicio en vLLM emplea `--max-model-len 32768`, pero no se documenta el maximo del modelo) |
| Tipos de cuantizacion | FP8_DYNAMIC en capas Linear; `lm_head`, `embed_tokens`, `visual` y `linear_attn` permanecen en precision completa (bf16 en el modelo fuente) |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | safetensors en formato compressed-tensors, compatible con vLLM y transformers |
| Tamano del repositorio | 13,5 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B |
| Backbone original | Qwen/Qwen3.5-9B |
| Metodo de cuantizacion | llmcompressor, sin datos de calibracion (`requires_calibration_data: false`) |
| Plantilla de chat | MiMo v2.6, con conmutador de razonamiento via `enable_thinking` |
| Fecha de publicacion | 21 de septiembre de 2026 (actualizado el 21 de septiembre de 2026) |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del checkpoint. Se sabe que el backbone es Qwen/Qwen3.5-9B y que el modelo ha sido afinado con SFT sobre datos generados por MiMo, con un total de 77,4B tokens de SFT, de los cuales 27,2B son tokens con perdida (loss-bearing). Los dominios cubiertos durante el entrenamiento son codigo, ciberseguridad, tareas generales y visual. El checkpoint aqui descrito es exclusivamente SFT, sin fase de RL, y se publica como punto de partida para investigacion abierta en RL agentico; el comportamiento puede diferir de otras versiones de MiMo-V2.6 ajustadas con RL.

La innovacion tecnica de esta publicacion concreta es la cuantizacion. Se aplica FP8_DYNAMIC a las capas Linear, con escalado dinamico por tensor de las activaciones, de modo que no se necesita conjunto de calibracion. La receta excluye explicitamente `lm_head`, `embed_tokens`, las capas cuyo nombre coincide con `visual` y las capas `linear_attn`, manteniendolas en precision completa para preservar la fidelidad de la cabeza de salida y la estabilidad numerica. La presencia de exclusiones para `visual` y `linear_attn` sugiere que el backbone incorpora componentes de vision y de atencion lineal, pero no se aporta documentacion adicional sobre su funcionamiento ni sobre la composicion exacta del dataset de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat propia de MiMo v2.6.
- Razonamiento explicito con modo "thinking" conmutable: se activa o desactiva mediante `enable_thinking` en la plantilla de chat o en `chat_template_kwargs`; el contenido de razonamiento se devuelve en el campo `reasoning_content`.
- Generacion y edicion de codigo en tareas de resolucion de issues reales (SWE Verified, SWE Pro) y en un benchmark de codigo propio (MiMo Code mini).
- Uso de herramientas y function calling, con soporte declarado en las etiquetas del repositorio (tool-use) y evaluacion en Toolathlon-Verified, Terminal Bench 2.1 y AutomationBench.
- Comportamiento agentico multi-paso: los benchmarks evaluados incluyen entornos de terminal, automatizacion de escritorio y tareas de oficina (OfficeQA, JobBench).
- Ciberseguridad: dominio declarado de entrenamiento y evaluado con MiMo Cyber mini.
- Codificacion visual: el dominio "visual" forma parte del entrenamiento y se evalua con MiMo Visual Coding mini; el pipeline declarado es image-text-to-text.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Integracion con vLLM mediante soporte nativo de checkpoints FP8 en formato compressed-tensors.

## Casos de uso

- Agentes de resolucion de issues en repositorios: el modelo esta ajustado para tareas tipo SWE Verified y SWE Pro, de modo que puede integrarse en un bucle que reciba el enunciado de un issue, inspeccione el arbol del repositorio mediante herramientas y proponga un parche; sus resultados declarados en SWE Pro (44,6) frente al backbone sin ajustar (32,0) lo hacen adecuado para esta tarea.
- Automatizacion de terminal y operaciones: con 37,1 en Terminal Bench 2.1 puede emplearse como controlador de comandos en entornos sandbox, interpretando la salida de la shell y encadenando pasos hasta completar una tarea de administracion.
- Asistentes de oficina y procesamiento documental: los resultados en OfficeQA (19,5) y JobBench (18,3) indican capacidad para tareas administrativas estructuradas, como extraccion de datos de documentos, generacion de informes o tramitacion de formularios mediante llamadas a herramientas.
- Pipelines de generacion de codigo en CI/CD: el soporte de tool calling y el formato compressed-tensors permiten servirlo con vLLM detras de una API compatible con OpenAI y conectarlo a un runner que ejecute pruebas y vuelva a solicitar correcciones al modelo.
- Analisis asistido en ciberseguridad: el dominio cyber forma parte del entrenamiento y esta evaluado en MiMo Cyber mini (31,3 frente a 5,7 del backbone), por lo que puede usarse para triaje de alertas y explicacion de hallazgos en entornos controlados, siempre con supervision humana.
- Despliegue en hardware limitado: al ocupar 13,5 GB el repositorio, el checkpoint FP8 permite servir un modelo agentico de 9B en una unica GPU de 24 GB, lo que habilita prototipos y entornos de investigacion que no disponen de nodos con multiples aceleradores.
- Investigacion en RL agentico: el checkpoint se publica explicitamente como punto de partida para RL, de modo que un equipo puede partir de el para entrenar con recompensas en entornos de codigo o terminal sin tener que reproducir la fase de SFT de 77,4B tokens.
- Automatizacion de interfaces y tareas visuales: dada la etiqueta de pipeline image-text-to-text y el dominio de codificacion visual, puede emplearse en la generacion de codigo a partir de capturas de interfaz, si bien la model card no documenta el formato de entrada de imagen.

## Benchmarks y rendimiento

Resultados publicados en el informe tecnico de MiMo-V2.6 para el checkpoint SFT en bf16. El checkpoint FP8 no tiene resultados propios publicados; se espera que siga de cerca estos valores, con diferencias numericas menores.

| Dominio | Benchmark | Metrica | Qwen3.5-9B | MiMo-V2.6-Distill-Qwen-9B (SFT) |
|---|---|---|---|---|
| Codigo | SWE Verified | avg@3 | 60,0 | 61,1 |
| Codigo | SWE Pro | avg@3 | 32,0 | 44,6 |
| Codigo | MiMo Code (mini) | avg@3 | 19,5 | 51,6 |
| Ciberseguridad | MiMo Cyber (mini) | avg@3 | 5,7 | 31,3 |
| General | AutomationBench v1.0.6 | avg@1 | 5,0 | 30,3 |
| General | Terminal Bench 2.1 | avg@1 | 27,0 | 37,1 |
| General | Toolathlon-Verified | avg@1 | 25,9 | 35,2 |
| General | OfficeQA | avg@1 | 9,0 | 19,5 |
| General | JobBench | avg@1 | 2,6 | 18,3 |
| General | MiMo General (mini) | avg@1 | 28,5 | 62,2 |
| Visual | MiMo Visual Coding (mini) | avg@1 | 61,7 | 64,0 |

Los benchmarks marcados con daga en la model card original (MiMo Code mini, MiMo Cyber mini, MiMo General mini, MiMo Visual Coding mini) son evaluaciones internas de MiMo. No se han publicado benchmarks del checkpoint cuantizado a FP8 en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos: el repositorio ocupa 13,5 GB. Con 9,41B parametros en FP8, las capas Linear ocupan aproximadamente 9,4 GB, a lo que se suman `lm_head`, embeddings y posibles componentes visuales y de atencion lineal en precision completa.
- VRAM estimada para inferencia: no disponible un dato oficial. Como referencia, los pesos requieren del orden de 11-13 GB y hay que anadir la cache KV, cuyo tamano depende de la longitud de contexto configurada.
- GPUs recomendadas para FP8 nativo: clase Hopper (H100) o Blackwell, segun indica la propia model card.
- GPUs Ampere: el modelo tambien funciona en Ampere (A100, RTX 3090, RTX 4090) con dequantizacion FP8 al vuelo, con la penalizacion de rendimiento que ello implica.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB permite cargar el modelo y dejar margen para la cache KV; en tarjetas de 16 GB el margen se reduce mucho y la informacion disponible no confirma que sea viable con contextos largos.
- Software necesario: `torch >= 2.11.0` para el servicio con vLLM, que requiere `vllm >= 0.19.1`; para uso directo, `transformers` y `accelerate`.
- Opciones de despliegue: vLLM con soporte nativo de compressed-tensors FP8, y carga directa con `AutoModelForCausalLM` de transformers. No se documenta soporte para llama.cpp, Ollama o TGI, ni se ofrece formato GGUF.
- Latencia y throughput: no disponible. La model card no publica medidas de tokens por segundo ni tiempos de primera token.
- Ejemplo de servicio: `vllm serve prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-FP8 --max-model-len 32768`, con API compatible con OpenAI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-FP8 (este) | 9,41 B | no disponible | other | safetensors / compressed-tensors (FP8) | HuggingFace, 0 descargas, 1 like |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | checkpoint bf16 de origen |
| Qwen/Qwen3.5-9B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | backbone base sin ajuste agentico |

En cuanto a rendimiento, los unicos datos comparables disponibles son los del backbone Qwen3.5-9B frente al checkpoint SFT, recogidos en la tabla de benchmarks: el ajuste de MiMo mejora de forma consistente en todos los dominios evaluados, con las mayores diferencias en AutomationBench (5,0 a 30,3), MiMo General mini (28,5 a 62,2), MiMo Code mini (19,5 a 51,6) y MiMo Cyber mini (5,7 a 31,3). No se dispone de datos de contexto, licencia o cuantizaciones alternativas de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a FP8 puede introducir diferencias numericas menores respecto al modelo fuente en bf16; la propia model card recomienda validarlas antes de un uso en produccion.
- Es un checkpoint exclusivamente SFT, sin fase de RL: su comportamiento puede diferir del de otras versiones de MiMo-V2.6 ajustadas con RL.
- No se han publicado benchmarks del checkpoint cuantizado; los resultados de la tabla corresponden al modelo bf16.
- Idioma: unicamente ingles declarado. El rendimiento en castellano u otras lenguas no esta documentado ni evaluado.
- La longitud de contexto maxima no esta especificada; el valor 32768 aparece solo como parametro de ejemplo en el comando de servicio, no como limite documentado.
- La licencia es "other", no una licencia estandar reconocible: es imprescindible revisar los terminos del modelo base XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B antes de cualquier uso comercial.
- No hay informacion sobre sesgos, filtros de seguridad, tasas de alucinacion ni comportamientos problematicos evaluados.
- Varios benchmarks de la tabla (MiMo Code mini, MiMo Cyber mini, MiMo General mini, MiMo Visual Coding mini) son evaluaciones internas del desarrollador, no benchmarks de terceros.
- Estado del repositorio: 0 descargas y 1 like en el momento de la consulta, lo que indica una validacion practicamente nula por parte de la comunidad.
- El pipeline declarado es image-text-to-text y la receta excluye componentes "visual", pero la model card no documenta como enviar imagenes al modelo ni que formatos acepta; conviene verificar esta capacidad antes de disenar un caso de uso con entrada de imagen.
- No se documenta soporte para llama.cpp, Ollama o formato GGUF, lo que limita el despliegue en CPU o en entornos sin GPU compatible.
- La fecha de publicacion del repositorio (21 de septiembre de 2026) es muy reciente, por lo que pueden aparecer cambios o correcciones en el checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-FP8
- Modelo base (bf16): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Backbone original: https://huggingface.co/Qwen/Qwen3.5-9B
- Informe tecnico de MiMo-V2.6: citado en la model card como fuente de los resultados de evaluacion, pero sin enlace disponible en la informacion proporcionada.
- Los resultados de busqueda web facilitados no contienen informacion relevante sobre este modelo: todas las entradas devueltas corresponden a una organizacion sin animo de lucro de Chicago ajena al ambito de la inteligencia artificial. No se dispone, por tanto, de enlaces adicionales a papers, blogs, repositorios o demos.
