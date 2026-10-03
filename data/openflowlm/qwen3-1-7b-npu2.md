# OpenFlowLM/Qwen3-1.7B-NPU2

## Resumen

OpenFlowLM/Qwen3-1.7B-NPU2 es un ajuste fino del modelo denso Qwen3-1.7B, desarrollado por el usuario OpenFlowLM y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo causal de generacion de texto de 1.700 millones de parametros (1.400 millones sin contar embeddings), construido sobre la arquitectura Qwen3 de Alibaba, con 28 capas, atencion GQA y una ventana de contexto de 32.768 tokens.

El modelo hereda del base las dos caracteristicas diferenciales de la familia Qwen3: la conmutacion explicita entre modo "thinking" (razonamiento extendido, util para matematicas, logica y codigo) y modo "non-thinking" (dialogo general eficiente), ademas de soporte declarado de tool calling y capacidades de agente. La etiqueta "NPU2" del nombre sugiere un ajuste orientado a ejecucion en unidades de procesamiento neuronal, aunque la model card publicada no documenta ningun detalle del proceso de ajuste.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: el repositorio no incluye datos sobre el dataset de ajuste, el procedimiento (las etiquetas apuntan a Unsloth), resultados de evaluacion propios ni ficheros cuantizados. A la fecha de los metadatos (2 de octubre de 2026) el modelo acumula 0 descargas y 0 likes, por lo que debe considerarse una publicacion reciente y sin validacion externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (arquitectura Qwen3), atencion GQA |
| Parametros totales | 1,7B (1,4B sin embeddings) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (no se publican GGUF, AWQ, GPTQ ni FP8 en el repo) |
| Idiomas soportados | ingles segun los metadatos del repo; el modelo base Qwen3-1.7B declara soporte de mas de 100 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | repositorio de la libreria transformers (safetensors); tamano del repo 1,7 GB |
| Capas | 28 |
| Cabezas de atencion | 16 para Q y 8 para KV (GQA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only causal con normalizacion tipo RMSNorm, atencion con query-key normalization y GQA con 16 cabezas de consulta frente a 8 de clave/valor, repartidas en 28 capas. El modelo incorpora de fabrica el mecanismo de doble modo, controlado mediante el parametro `enable_thinking` de la plantilla de chat, que activa o desactiva la generacion de un bloque de razonamiento delimitado por las etiquetas `<think>...</think>` antes de la respuesta final. El modo thinking esta activado por defecto.

Sobre el entrenamiento del modelo base, la informacion disponible indica que Qwen3-1.7B paso por fases de preentrenamiento y postentrenamiento, con alineacion orientada a preferencias humanas y refuerzo de capacidades de razonamiento, codigo y agentes. Sin embargo, no se especifica el numero de tokens, la composicion del dataset ni los detalles de RLHF/DPO.

Respecto al ajuste especifico que da lugar a este repositorio, no hay informacion publicada: no se documentan el dataset, el metodo (SFT, LoRA, QLoRA), el numero de pasos ni los hiperparametros. La presencia de la etiqueta `unsloth` en los metadatos sugiere que se uso ese framework para el ajuste, y el sufijo "NPU2" apunta a un destino de despliegue en hardware con NPU, pero ninguna de las dos cosas esta confirmada por el autor. La model card publicada es, en la practica, una copia de la del modelo base Qwen3-1.7B.

## Capacidades

- Generacion de texto conversacional multirrol con plantilla de chat y soporte de conversaciones multiturno.
- Razonamiento extendido en modo thinking, orientado a problemas logicos, matematicos y de programacion.
- Modo non-thinking para respuestas rapidas y de proposito general, conmutables en tiempo de inferencia.
- Generacion de codigo y asistencia en tareas de programacion.
- Tool calling / function calling declarado por el modelo base, integrable con herramientas externas en ambos modos.
- Capacidades de agente y razonamiento multi-paso, con el modelo base descrito como referente entre los modelos abiertos en tareas de agente complejas.
- Escritura creativa, roleplay y seguimiento de instrucciones, con alineacion de preferencias humanas.
- Capacidades multilingues del modelo base: mas de 100 idiomas y dialectos, con instruccion y traduccion. Los metadatos del repo solo declaran ingles.
- Procesamiento de prompts largos hasta 32.768 tokens.
- Capacidad de generar hasta 32.768 tokens nuevos en el ejemplo oficial, aunque el limite efectivo depende del contexto consumido por el prompt.
- Vision, audio y otras modalidades: no disponibles.

## Casos de uso

- Asistente conversacional de bajo coste: con 1,7B de parametros y licencia Apache 2.0, el modelo puede desplegarse en una sola GPU de consumo o incluso en CPU, gestionando conversaciones multiturno de hasta 32.768 tokens de contexto sin coste de API.
- Razonamiento matematico y logico asistido: activando el modo thinking, el modelo genera una cadena de razonamiento antes de la respuesta final, lo que resulta util en tutoria academica, resolucion de problemas paso a paso y verificacion de calculos.
- Generacion y revision de codigo en pipelines de desarrollo: puede integrarse en un flujo de CI/CD para revisar diffs, proponer correcciones o generar tests, apoyandose en el soporte de tool calling para consultar documentacion o ejecutar funciones.
- Agentes autonomos ligeros: con soporte declarado de function calling y razonamiento multi-paso, es candidato para orquestar tareas como consulta de bases de datos, envio de correos o navegacion asistida en entornos con presupuesto de computo reducido.
- Clasificacion y extraccion de informacion de documentos: con ventanas de 32.768 tokens puede procesar contratos, informes o articulos completos y devolver campos estructurados, sin necesidad de dividir el texto en fragmentos.
- Traduccion y asistentes multilingues: el modelo base declara soporte de mas de 100 idiomas, por lo que puede emplearse en traduccion automatica o atencion al cliente en varios idiomas, verificando antes el comportamiento real del ajuste.
- Procesamiento en el borde (edge) o en NPU: el nombre del repositorio sugiere un ajuste orientado a hardware con unidad neuronal, lo que abriria casos de despliegue en dispositivos con recursos limitados; conviene validar esta hipotesis con el autor antes de llevarlo a produccion.
- Generacion de contenido creativo: descripciones de producto, guiones, textos de marketing o roleplay, aprovechando la alineacion de preferencias del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tabla de evaluacion propia y se limita a remitir al blog y a la documentacion de Qwen3 para consultar los datos del modelo base. No se dispone, por tanto, de cifras verificables de MMLU, HumanEval, GSM8K ni de tareas de agente para este ajuste concreto.

## Requisitos de hardware

- VRAM estimada para inferencia, segun precision (calculos a partir de los 1,7B de parametros):
  - FP16/BF16: aproximadamente 3,4 GB solo de pesos; en la practica, entre 5 y 6 GB de VRAM con cache KV y overhead.
  - INT8: aproximadamente 1,7 GB de pesos; alrededor de 3 GB de VRAM en total.
  - INT4: aproximadamente 1 GB de pesos; alrededor de 2 GB de VRAM en total.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU con 6 GB o mas de VRAM puede ejecutarlo en FP16 (RTX 3060, 4060, 4070, 4090, tarjetas de portatil recientes). En INT4 es viable incluso en iGPU con memoria unificada.
- Ejecucion en CPU: posible con llama.cpp u Ollama, siempre que se conviertan los pesos a GGUF, ya que el repositorio no publica ficheros cuantizados.
- GPU profesionales: no necesita A100/H100 para un solo usuario, pero pueden usarse para servir peticiones concurrentes. GPUs tipo L4, A10G o T4 son suficientes para produccion ligera.
- Opciones de despliegue:
  - transformers (libreria indicada en el repositorio; se requiere `transformers>=4.51.0`).
  - vLLM `>=0.8.5` con `--enable-reasoning --reasoning-parser deepseek_r1`.
  - SGLang `>=0.4.5.post2` con `--reasoning-parser deepseek-r1`.
  - llama.cpp, Ollama o TGI, previa conversion o publicacion de GGUF.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni tiempos de primera respuesta.
- Nota: el sufijo NPU2 y la etiqueta `endpoints_compatible` apuntan a un uso en endpoints compatibles y posiblemente en aceleradores de tipo NPU, pero el autor no documenta que hardware concreto soporta este ajuste.

## Comparativa con modelos similares

La tabla recoge datos publicos del modelo base y de alternativas habituales en el rango de 1 a 2,6 mil millones de parametros. Los datos de los modelos de terceros son aproximados y pueden variar segun la version consultada; conviene verificarlos en sus repositorios oficiales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OpenFlowLM/Qwen3-1.7B-NPU2 | 1,7B (1,4B sin embeddings) | 32.768 tokens | Apache 2.0 | HuggingFace, transformers | Sin benchmarks propios ni datos del ajuste |
| Qwen/Qwen3-1.7B (base) | 1,7B (1,4B sin embeddings) | 32.768 tokens | Apache 2.0 | HuggingFace, transformers, vLLM, SGLang | Doble modo thinking/non-thinking, soporte de mas de 100 idiomas |
| meta-llama/Llama-3.2-1B | 1,24B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, transformers, llama.cpp | Requiere aceptar terminos y clausulas de uso comercial |
| google/gemma-2-2b | 2,6B | 8.192 tokens | Gemma Terms of Use | HuggingFace, transformers | Contexto mas corto y licencia con restricciones adicionales |

En el eje de licencia, este ajuste tiene ventaja clara frente a Llama 3.2 y Gemma 2, al estar bajo Apache 2.0 sin aceptacion previa de terminos. En el eje de contexto, empata con Qwen3-1.7B y supera a Gemma 2-2B, aunque queda por detras de Llama-3.2-1B en ese parametro concreto. No hay datos de rendimiento comparado para este ajuste, por lo que la comparativa se limita a especificaciones.

## Limitaciones y advertencias

- Ausencia total de documentacion del ajuste: no se publican dataset, metodo, hiperparametros ni motivacion del sufijo NPU2. Cualquier afirmacion sobre que mejora respecto al modelo base es especulativa.
- Sin benchmarks propios: no hay evidencia publicada de que el ajuste mantenga el rendimiento del Qwen3-1.7B original o lo degrade.
- Sin validacion externa: 0 descargas y 0 likes en el momento de los metadatos. El modelo no ha sido probado por la comunidad.
- Riesgo de alucinacion: inherente a los modelos de 1,7B de parametros, especialmente en tareas de conocimiento factual, fechas y citas. La ventana de contexto amplia no elimina este riesgo.
- Modo thinking y decodificacion: no se debe usar decodificacion greedy en modo thinking, ya que la documentacion de Qwen advierte de degradacion de rendimiento y repeticiones infinitas. La configuracion recomendada es temperatura 0,6, top-p 0,95, top-k 20 y min-p 0.
- Idiomas: los metadatos del repositorio solo declaran ingles. El modelo base soporta mas de 100 idiomas, pero no esta garantizado que el ajuste haya preservado ese soporte; conviene evaluarlo por idioma antes de usarlo en produccion multilingue.
- Licencia: Apache 2.0 permite uso comercial sin restriccion de aceptacion previa, pero el autor no ofrece garantias ni soporte. Se debe conservar el aviso de licencia y el enlace al texto original de Qwen.
- Sin ficheros cuantizados: desplegar en llama.cpp, Ollama o entornos de bajos recursos exige convertir los pesos manualmente, lo que anade un paso de validacion de calidad.
- Pesos de responsabilidad: al ser un ajuste sin informacion sobre datos de entrenamiento, no puede descartarse la presencia de sesgos heredados del corpus del modelo base ni de los datos usados en el ajuste.
- Idoneidad para produccion: baja sin antes realizar una evaluacion propia. Recomendado tratarlo como modelo experimental.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/OpenFlowLM/Qwen3-1.7B-NPU2
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
