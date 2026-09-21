# hikka2515/Qwen3.5-4B-MTP-GGUF

## Resumen

hikka2515/Qwen3.5-4B-MTP-GGUF es una distribucion en formato GGUF, publicada por el usuario hikka2515, del modelo Qwen3.5-4B de Alibaba (equipo Qwen). Se trata de una conversion cuantizada pensada para inferencia local con llama.cpp y con soporte de decodificacion especulativa MTP (multi-token prediction), una tecnica que el autor del repositorio documenta como capaz de acelerar la generacion entre 1,5 y 2 veces. El modelo base es multimodal: segun su model card, es un modelo de lenguaje causal con codificador de vision, por lo que acepta entradas de imagen y texto.

La arquitectura es hibrida: combina capas de Gated DeltaNet (atencion lineal) con capas de Gated Attention (atencion completa) en un patron de repeticion 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), con 32 capas y 2.560 dimensiones ocultas. Cuenta con 4.326.350.848 parametros totales (4,33B) segun los safetensors del modelo base, una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000, y soporte declarado de 201 idiomas y dialectos.

El interes de esta ficha es doble. Por un lado, Qwen3.5-4B representa la apuesta de Qwen por modelos pequenos con vision integrada y contexto muy largo, algo poco habitual en la franja de 4B. Por otro, esta publicacion concreta anade MTP para inferencia acelerada en hardware de consumo. Conviene senalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, que su tamano es de 72,2 GB y que su contenido reproduce en gran medida la estructura de la guia de Unsloth para Qwen3.5, sin que exista una validacion independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de vision; hibrida Gated DeltaNet (atencion lineal) + Gated Attention (atencion completa); entrenada con MTP multi-step |
| Parametros totales | 4.326.350.848 (≈4,33B) |
| Parametros activos | No disponible (la documentacion de la familia menciona MoE disperso, pero la configuracion de expertos del 4B no se detalla) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0); el ejemplo de uso del repositorio emplea UD-Q4_K_XL; lista completa de niveles no disponible |
| Idiomas soportados | 201 idiomas y dialectos segun la documentacion de Qwen3.5; la ficha de HuggingFace no lista idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base Qwen/Qwen3.5-4B |
| Dimension oculta | 2.560 |
| Numero de capas | 32 |
| Tamano de vocabulario | 248.320 (padded, con pesos atados a la salida LM) |
| Cabezas de atencion | Gated DeltaNet: 32 cabezas para V y 16 para QK, dimension 128. Gated Attention: 16 cabezas Q y 4 KV, dimension 256, RoPE de 64 |
| FFN | Dimension intermedia 9.216 |
| Tamano del repositorio | 72,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer causal con codificador de vision entrenado con fusion temprana sobre tokens multimodales. Su rasgo arquitectonico principal es el layout hibrido: por cada bloque de tres capas de Gated DeltaNet (mecanismo de atencion lineal con estado recurrente) se intercala una capa de Gated Attention clasica con 16 cabezas de consulta y 4 de clave-valor. Este diseno busca reducir el coste del cache KV y aumentar el throughput en contextos largos, manteniendo la capacidad de recuperacion exacta de la atencion completa en una de cada cuatro capas. La FFN tiene 9.216 dimensiones intermedias y el modelo fue entrenado con MTP en varios pasos, lo que habilita la decodificacion especulativa que da nombre a este repositorio.

Segun la model card, el entrenamiento incluye una fase de preentrenamiento multimodal y otra de postentrenamiento, con aprendizaje por refuerzo escalado sobre entornos multiagente y distribuciones de tareas progresivamente mas complejas. La documentacion de la familia menciona tambien un MoE disperso y una eficiencia de entrenamiento multimodal cercana al 100 % respecto al entrenamiento solo de texto, aunque no se publican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO sobre esta variante de 4B.

Este repositorio concreto no es un modelo nuevo: es una conversion a GGUF. El valor anadido esta en el soporte de decodificacion especulativa MTP en llama.cpp (parametros `--spec-type draft-mtp` y `--spec-draft-n-max`, antes denominado `--spec-type mtp`), que el autor cifra en una mejora de velocidad de aproximadamente 1,5 a 2 veces.

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta entradas de imagen y texto (pipeline `image-text-to-text`), con comprension visual integrada desde el entrenamiento.
- Codigo y matematicas: la documentacion de la familia situa a Qwen3.5 a la par o por encima de Qwen3 y Qwen3-VL en razonamiento, codigo, agentes y comprension visual.
- Tool calling / function calling: mejoras declaradas en el parseo de objetos anidados para aumentar la tasa de exito en llamadas a herramientas.
- Soporte de rol de desarrollador (developer role), lo que permite su uso en entornos tipo Codex u OpenCode.
- Capacidades de agente y razonamiento multi-paso, con RL entrenado sobre entornos multiagente.
- Multilingue: 201 idiomas y dialectos declarados por la familia Qwen3.5.
- Contexto muy largo: 262.144 tokens nativos, extensible hasta 1.010.000.
- Decodificacion especulativa MTP para acelerar la generacion en llama.cpp.
- Cuantizacion en formato GGUF compatible con el ecosistema llama.cpp y con Unsloth Dynamic 2.0.

## Casos de uso

- Asistente multimodal local: desplegado con `llama-mtmd-cli` o `llama-server`, el modelo puede responder a preguntas sobre capturas de pantalla, diagramas o fotografias sin enviar datos a la nube, gracias al codificador de vision y a un peso de 4,33B que cabe en GPUs de consumo.
- Analisis de documentos extensos: con 262.144 tokens de contexto nativo (y hasta 1.010.000 extensibles) se pueden procesar contratos, informes anuales o expedientes completos en una sola pasada, algo inviable en modelos de 4B con ventanas de 32K.
- Extraccion de informacion de imagenes (OCR estructurado): facturas, albaranes o formularios escaneados pueden convertirse a JSON mediante el pipeline image-text-to-text combinado con tool calling.
- Agentes de codigo en terminal: el soporte de developer role y la mejora en el parseo de objetos anidados lo hacen utilizable en flujos tipo Codex u OpenCode para tareas de edicion y refactorizacion guiadas por herramientas.
- Atencion al cliente multilingue: con 201 idiomas declarados y conversaciones multi-turno largas, es adecuado para desplegar un asistente en varios mercados con un unico modelo cuantizado.
- Revision de codigo en CI/CD: integrado como paso de un pipeline, el modelo puede generar parches, resumir diffs y responder a comentarios de revision, con la ventaja de que la decodificacion MTP reduce el coste por generacion.
- Procesamiento en el borde (edge) o en portatiles: con cuantizaciones Q4 el modelo ocupa del orden de 2,5 a 3 GB de pesos, lo que permite ejecutarlo en un portatil con GPU integrada o CPU, con `-DGGML_CUDA=OFF` para Metal o CPU.
- Investigacion sobre atencion hibrida: dado que combina Gated DeltaNet y Gated Attention en un modelo pequeno, sirve como banco de pruebas para estudiar el equilibrio entre coste de cache KV y calidad en contextos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen con graficos de resultados comparativos, pero los valores numericos no estan accesibles en el texto proporcionado, por lo que no se reproducen aqui. El unico dato de rendimiento declarado de forma explicita es la aceleracion de la generacion de aproximadamente 1,5 a 2 veces al usar decodificacion especulativa MTP en llama.cpp.

## Requisitos de hardware

- VRAM estimada solo para pesos (4,33B parametros, estimacion a partir del recuento de parametros, no publicada oficialmente): en torno a 2,5-3,0 GB en Q4, 3,0-3,5 GB en Q5, 3,6-4,0 GB en Q6, 4,5-5,0 GB en Q8 y 8,5-9,0 GB en BF16/F16.
- Cache KV (estimacion): con 8 capas de atencion completa, 4 cabezas KV de 256 dimensiones y precision f16, el coste es del orden de 32 KB por token; aproximadamente 0,27 GB a 8K de contexto, 1,1 GB a 32K y 8,6 GB a 262K. Las capas de Gated DeltaNet usan estado recurrente en lugar de cache KV clasico, lo que reduce el crecimiento del cache respecto a un transformer denso equivalente.
- Codificador de vision: hay que anadir el fichero de proyeccion multimodal a la VRAM total; su tamano exacto no esta disponible. El autor advierte que `--mmproj` no esta soportado junto con MTP.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4080 y RTX 4090 24 GB en cuantizaciones Q4 a Q8. Con Q4 puede funcionar incluso en GPUs de 6-8 GB, siempre que se ajuste la longitud de contexto.
- GPU de centro de datos: A100 40/80 GB o H100 son necesarias para contextos cercanos a 262K con lotes grandes, o para servir varias peticiones concurrentes por encima de la ventana de 32K.
- Despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli` para vision, `llama-server`) es la via documentada, con `-ngl 99 -c 8192 -fa on -np 1 --spec-type draft-mtp --spec-draft-n-max 6`. El modelo base en safetensors es compatible con Transformers, vLLM, SGLang y KTransformers. La integracion con Ollama o LM Studio no se menciona en la informacion disponible, aunque el formato GGUF la hace plausible.
- Limitacion de despliegue conocida: `-np > 1` (mas de un slot) y `--mmproj` no estan soportados todavia en combinacion con MTP.
- Latencia y throughput: no se publican cifras absolutas; solo la mejora relativa de 1,5 a 2 veces con MTP.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica y pueden variar segun la version consultada; los de Qwen3.5-4B provienen de la model card.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B (esta ficha) | 4,33B | 262.144 nativos, hasta 1.010.000 | Texto + vision | Apache 2.0 | Arquitectura hibrida Gated DeltaNet + Gated Attention, MTP, 201 idiomas declarados |
| Qwen3-4B | ≈4,0B | 32.768 nativos, extensible a 131.072 | Solo texto | Apache 2.0 | Referencia directa de la generacion anterior; sin codificador de vision |
| Qwen2.5-VL-3B | ≈3,75B | 32.768 nativos, extensible | Texto + vision | Apache 2.0 (variante 3B) | Alternativa multimodal de la generacion anterior, sin atencion hibrida |
| Gemma 3 4B | ≈4B | 128.000 | Texto + vision | Licencia Gemma (con restricciones de uso) | Contexto menor y licencia no tan permisiva como Apache 2.0 |

## Limitaciones y advertencias

- Repositorio sin validacion: 0 descargas y 0 likes en el momento de la consulta, y un unico autor sin historial verificable en la informacion disponible. Conviene contrastar la integridad de los ficheros GGUF antes de usarlos en produccion.
- No es una publicacion oficial: se trata de una conversion cuantizada por un tercero sobre Qwen/Qwen3.5-4B; los pesos originales en safetensors son la referencia de calidad.
- Reproduccion de material de terceros: la model card reproduce en gran parte la guia de Unsloth para Qwen3.5, incluidos enlaces y comandos; no queda claro si la cuantizacion sigue exactamente la receta Unsloth Dynamic 2.0 que se anuncia.
- Tamano del repositorio: 72,2 GB, muy superior a lo esperable para un modelo de 4,33B en unas pocas cuantizaciones, presumiblemente por incluir multiples niveles de cuantizacion y el fichero de proyeccion multimodal. Esto encarece la descarga y el almacenamiento.
- Riesgo de alucinacion: inherente a los modelos generativos de 4B, especialmente en tareas de razonamiento largo, matematicas complejas y contextos muy extensos donde la informacion relevante queda diluida.
- Sesgos: no se publica informacion sobre composicion del dataset, filtrado ni evaluaciones de sesgo para esta variante. Un modelo entrenado con cobertura de 201 idiomas tiende a rendir de forma desigual entre lenguas de altos y bajos recursos.
- Limitaciones de contexto: aunque se declaran 262.144 tokens nativos y hasta 1.010.000 extensibles, la degradacion de la recuperacion a longitudes extremas no esta cuantificada en la informacion disponible. El ejemplo de despliegue usa `-c 8192`.
- Restricciones de inferencia: MTP no es compatible con `-np > 1` ni con `--mmproj`, de modo que no se puede combinar aceleracion especulativa, vision y concurrencia multiple en la misma instancia.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo base; el enlace de licencia apunta al repositorio de Qwen. Verificar los terminos vigentes antes de un despliegue comercial.
- Idiomas: la ficha de HuggingFace del repositorio no lista idiomas; el dato de 201 idiomas proviene de la documentacion de la familia Qwen3.5, no de una evaluacion independiente de esta cuantizacion.
- Sin benchmarks verificables: no hay cifras de MMLU, HumanEval, GSM8K ni de la perdida de calidad introducida por la cuantizacion UD-Q4_K_XL.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hikka2515/Qwen3.5-4B-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Guia de Qwen3.5 y MTP de Unsloth: https://unsloth.ai/docs/models/qwen3.5
- Guia especifica de MTP: https://unsloth.ai/docs/models/qwen3.5#mtp-guide
- Guia de ajuste fino de Qwen3.5 con Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Documentacion de Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Pull request de MTP en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/22673
- Commit de renombrado de `--spec-type mtp` a `--spec-type draft-mtp`: https://github.com/ggml-org/llama.cpp/pull/22673/commits/655c5773854dfd3deb2b6a1e66695d992ba83708
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Discord de Unsloth: https://discord.gg/unsloth
