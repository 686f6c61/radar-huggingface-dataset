# prometheusAIR/DeepSeek-V4-Flash-Vision-Exp-GGUF

## Resumen

DeepSeek-V4-Flash-Vision-Exp-GGUF es una cuantización en formato GGUF con matriz de importancia (imatrix) del modelo multimodal DeepSeek-V4-Flash-Vision-Exp, desarrollada por el usuario prometheusAIR. Se trata del primer modelo de la familia DeepSeek V4 con entrada de imagen, lanzado oficialmente por DeepSeek el 21 de agosto de 2026 a través de su API. El modelo base combina una arquitectura de mezcla de expertos (MoE) con 284 334 millones de parámetros totales y 13 000 millones activos por token, junto con una torre de visión que procesa hasta 384 tokens visuales por imagen.

Esta versión GGUF resulta relevante porque permite ejecutar localmente un modelo de 284B con capacidades de visión y un contexto de 1 millón de tokens, algo inviable con los pesos originales en safetensors para la mayoría de equipos. El repositorio incluye cuatro niveles de cuantización (de 66,9 a 108,7 GiB), la torre de visión en FP16, la matriz de importancia utilizada y un parche necesario para que llama.cpp pueda cargar y ejecutar el modelo correctamente. La licencia MIT del modelo base y de esta cuantización facilita su uso comercial, aunque requiere un llama.cpp modificado que no está disponible en las versiones estables actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) multimodal con torre de vision, arquitectura `deepseek4`/`dflash` |
| Parametros totales | 284 334 578 519 (284,3B) |
| Parametros activos | 13B (segun datos publicados del modelo base) |
| Longitud de contexto | 1 048 576 tokens (1M) |
| Tipos de cuantizacion | IQ1_M (66,9 GiB), IQ2_XXS (78,8 GiB), IQ2_S (95,8 GiB), IQ3_XXS (108,7 GiB); atencion, expertos compartidos y capas densas en Q6_K; embeddings y salida en Q8_0; routers en BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (con safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-Vision-Exp emplea una arquitectura MoE con 284B parámetros totales y 13B activos por token, optimizada para tareas de codificacion y agentes. La innovacion principal frente a otros modelos multimodales es la inclusion de un segundo bias de router, denominado `ffn.gate.bias_vl`, que se aplica exclusivamente a los tokens de imagen. En las capas con enrutamiento por hash, los tokens de imagen abandonan la tabla `tid2eid` y utilizan un top-k aprendido sobre la suma de puntuaciones y este bias visual. Segun las mediciones del autor de la cuantizacion, los dos biases (texto e imagen) estan practicamente incorrelacionados (Pearson medio de -0,026), lo que indica que codifican preferencias de expertos genuinamente distintas.

La cuantizacion GGUF mantiene este tensor adicional como `blk.N.exp_probs_b_vl.bias`, lo que provoca que llama.cpp sin parchear reporte un error de numero de tensores (espera 1371, encuentra 1328). Ademas, el enrutamiento por hash falla al procesar imagenes porque llama.cpp entrega la imagen como un lote homogeneo de embeddings sin establecer el tensor de tokens, accediendo a memoria sin inicializar. El parche incluido en el repositorio resuelve ambos problemas anadiendo el tipo `FFN_EXP_PROBS_B_VL` a las arquitecturas `deepseek4` y `dflash`, y seleccionando el bias adecuado por lote. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en el modelo base.

## Capacidades

- Procesamiento de imagenes: el modelo acepta una imagen como entrada y genera texto descriptivo, responde preguntas sobre su contenido y puede razonar sobre elementos visuales.
- Generacion de texto y razonamiento: hereda las capacidades de DeepSeek-V4-Flash, incluyendo razonamiento multi-paso y generacion de codigo.
- Soporte de tool calling y agentes: el modelo base esta optimizado para tareas de codificacion y agentes, segun la ficha de NVIDIA NIM.
- Contexto largo: ventana de 1 millon de tokens, util para documentos extensos o conversaciones multi-turno con historial amplio.
- Capacidades multilingues: no se han publicado datos especificos sobre los idiomas soportados en la informacion disponible.
- Modo vision: la torre de vision (466M parametros) procesa hasta 384 tokens visuales por imagen, y puede ejecutarse en CPU para ahorrar VRAM.

## Casos de uso

- Analisis de documentos tecnicos con diagramas: el modelo puede leer capturas de pantalla, esquemas o figuras dentro de documentacion extensa, aprovechando su contexto de 1M tokens para procesar manuales completos de una sola vez.
- Agentes de codificacion con retroalimentacion visual: un agente puede recibir una captura de pantalla de un error de interfaz o un diagrama de arquitectura y generar el codigo correcto, gracias a su soporte de tool calling y razonamiento multi-paso.
- Automatizacion de QA visual en pipelines de CI/CD: el modelo puede comparar imagenes de referencia con capturas de pantalla de una aplicacion y detectar regresiones visuales, emitiendo informes detallados.
- Asistencia para personas con discapacidad visual: descripcion de imagenes en tiempo real con despliegue local, evitando depender de APIs externas y garantizando privacidad de los datos.
- Investigacion academica en vision por computador: permite experimentar con un modelo de 284B en local, sin costes de API, para tareas de captioning, VQA o generacion de datasets sinteticos.
- Procesamiento de facturas y formularios escaneados: extraccion de informacion de documentos con texto e imagenes, combinando OCR implicito con razonamiento sobre el contexto completo del documento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de rendimiento, y las fuentes web consultadas tampoco proporcionan datos numericos de evaluacion. Se recomienda consultar la pagina del modelo base en HuggingFace para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada: los pesos de cada rung ocupan entre 66,9 GiB (IQ1_M) y 108,7 GiB (IQ3_XXS). A contexto completo de 1M tokens, hay que anadir aproximadamente 13 GiB para buffers de KV y computo, lo que situa el pico en 96,9 GB para IQ2_XXS.
- GPU recomendadas: una GPU de 96 GB (por ejemplo, NVIDIA A100 96GB o H100 NVL) puede ejecutar IQ2_XXS a contexto completo. Con 80 GB (A100 o H100), se recomienda IQ1_M o IQ2_XXS con contexto reducido. Para IQ3_XXS comodo se necesitan 128-192 GB (2 GPUs).
- GPU de consumo: ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) tiene suficiente VRAM para cargar los pesos completos. Solo es viable con descarga parcial a CPU mediante `-ngl` o `--n-cpu-moe`, con rendimiento muy reducido.
- Opciones de despliegue: llama.cpp parcheado (PR #28133 + patch del repositorio), con `llama-server` para API OpenAI-compatible y `llama-mtmd-cli` para pruebas por linea de comandos. No es compatible con vLLM, Ollama ni TGI en sus versiones estables.
- Latencia y throughput: no se han publicado mediciones. El autor indica que `-ub 2048` duplica aproximadamente la velocidad de prefill frente a `-ub 512`, pero anade ~4,2 GB de buffer de computo. La torre de vision se ejecuta una vez por imagen y puede dejarse en CPU para ahorrar VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp (base) | 284B totales, 13B activos | 1M | Si | MIT | No (safetensors) |
| DeepSeek-V4-Flash (texto) | 284B totales, 13B activos | 1M | No | MIT | Si (oficial) |
| Esta cuantizacion GGUF | 284B totales, 13B activos | 1M | Si | MIT | Si (4 rungs) |

No se dispone de datos publicados que permitan comparar directamente el rendimiento de esta cuantizacion con otros modelos multimodales cuantizados como Llama 3.2 Vision o Qwen2-VL en terminos de benchmarks. La comparativa se limita a las diferencias estructurales: el modelo base es el unico de su familia con vision, y esta cuantizacion es la unica que lo hace ejecutable localmente en GGUF.

## Limitaciones y advertencias

- Requiere un llama.cpp parcheado: las versiones estables de llama.cpp no pueden cargar estos archivos, y el PR #28133 por si solo provoca un fallo al procesar la primera imagen. El parche incluido es imprescindible.
- Cuantizaciones agresivas: los rungs IQ1_M e IQ2_XXS utilizan cuantizacion de 1-2 bits por peso en los expertos enrutados, lo que puede degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo. El autor advierte que IQ1_M es el menos validado.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir descripciones incorrectas de imagenes o inventar detalles. No se han publicado evaluaciones especificas de este riesgo.
- Sesgos: no se ha documentado informacion sobre sesgos de genero, raza o cultura en el modelo base ni en esta cuantizacion.
- Limitaciones de idioma: no se ha especificado que idiomas soporta el modelo. Se asume un comportamiento similar al de otros modelos de DeepSeek, pero no esta confirmado.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones aparentes, pero el usuario debe verificar que el modelo base no tenga clausulas adicionales en su pagina oficial.
- Soporte de herramientas: aunque el modelo base soporta tool calling, la integracion con frameworks como LangChain o AutoGen puede requerir adaptaciones debido al parche de llama.cpp.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prometheusAIR/DeepSeek-V4-Flash-Vision-Exp-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- DeepSeek-V4-Flash (texto): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Guia practica (codepick.dev): https://codepick.dev/en/guides/deepseek-v4-flash-vision-guide/
- Ficha en zenmux.ai: https://zenmux.ai/deepseek/deepseek-v4-flash-vision-exp
- NVIDIA NIM para DeepSeek-V4-Flash: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash
