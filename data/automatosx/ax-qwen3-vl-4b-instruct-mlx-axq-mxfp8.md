# AutomatosX/AX-Qwen3-VL-4B-Instruct-MLX-AXQ-MXFP8

## Resumen

AX-Qwen3-VL-4B-Instruct-MLX-AXQ-MXFP8 es un checkpoint cuantizado en formato MLX para Apple Silicon, publicado por AutomatosX y derivado directamente del modelo BF16 Qwen/Qwen3-VL-4B-Instruct. Se trata de una conversión con cuantización mixta de precisión (AXQuant, AXQ) orientada al desarrollo y la evaluación local en hardware de Apple, no de un modelo entrenado desde cero. El modelo base es un transformer denso multimodal de 4,44B parámetros con arquitectura Qwen3VLForConditionalGeneration, capaz de procesar texto e imágenes (pipeline image-text-to-text).

La relevancia de este paquete es práctica: permite ejecutar un modelo de visión y lenguaje de 4,44B parámetros en un Mac con runtime MLX-VLM ocupando aproximadamente 5 GB de descarga, gracias a un esquema que cuantiza la ruta de lenguaje a 8 bits (grupo 32) y conserva la torre de visión en BF16. El presupuesto de almacenamiento declarado es de clase MXFP8, con un BPW medido de 8,9759, frente al BPW planificado de 9,6555.

Conviene subrayar que el propio autor lo etiqueta como "evidencia de desarrollo, no una release certificada de AXQuant": no publica mediciones de calidad, de contexto largo, de velocidad de kernel ni de MTP, y no incluye un manifiesto nativo validado para AX Engine. Es, por tanto, un artefacto para experimentación y evaluación, no una base lista para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3VLForConditionalGeneration); ruta de texto optimizada y torre de vision preservada en BF16 |
| Parametros totales | 4.437.815.808 (4,44B logicos) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 262.144 tokens configurados (metadato de configuracion, no validado; el limite practico depende de la memoria unificada) |
| Tipos de cuantizacion | Mixta AXQuant (AXQ): 90,64% en 8 bits y 9,36% en BF16; metodos affine y bf16; grupo de 32; BPW medido 8,9759 |
| Idiomas soportados | no disponible en los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (no incluye pesos PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo: es una conversion cuantizada del checkpoint BF16 Qwen/Qwen3-VL-4B-Instruct (revision `ebb281ec70b05090aa6165b016eac8ec08e71b17`), realizada con el cuantizador AXQuant 1.9.0. El modelo base emplea una arquitectura densa con un codificador de vision, un backbone de lenguaje y un mecanismo de fusion multimodal, tal como describe la familia Qwen3-VL. La optimizacion se limita a la ruta de texto (`optimization scope: text-path`), mientras que los tensores de vision se conservan en BF16 dentro de los shards principales.

La asignacion de precision no se basa en calibracion con datos, sino en priors de arquitectura (`planning evidence: architecture_prior`, `calibration: none`). De las 253 conversiones de modulo previstas, se registran 253 exitos y 0 fallbacks. La distribucion final es 4,02B parametros en 8 bits (90,64%) y 415,54M en BF16 (9,36%), con un tamano de safetensors de 4,98 GB. No hay sidecar de MTP ni de vision, no se incluye un manifiesto nativo de AX Engine y no se aporta evidencia de aceleracion MTP ni de calidad vision-lenguaje. El propio repositorio clasifica la evidencia de kernel de AX Engine como `unmeasured` y la certificacion de release como no cerrada.

## Capacidades

Las capacidades funcionales provienen del modelo base Qwen3-VL-4B-Instruct; el paquete cuantizado no publica evaluaciones que las confirmen, por lo que se listan como heredadas y no verificadas en este artefacto.

- Generacion de texto y respuesta conversacional multi-turno (pipeline image-text-to-text).
- Comprension de imagenes: descripcion, respuesta a preguntas sobre una imagen y extraccion de informacion visual.
- Razonamiento y matematicas: capacidades del modelo base, sin datos de benchmark en este repositorio.
- Generacion de codigo: heredada del modelo base, no medida en este checkpoint.
- Capacidades de agente e interaccion multi-paso: la familia Qwen3-VL las incorpora; no validadas en este paquete.
- Tool calling / function calling: soportado por el modelo base segun la documentacion de Qwen3-VL; no verificado aqui.
- Multilingue: el modelo base es multilingue, pero los metadatos de este repositorio no declaran idiomas.
- Modo thinking: no documentado en este paquete.
- MTP (decodificacion especulativa multi-token): no incluido (`MTP present: False`).
- Audio: no incluido (`Audio present: False`).
- Vision: presente, con tensores preservados en BF16 y sin evaluacion de calidad declarada.

## Casos de uso

- Desarrollo y evaluacion local en Apple Silicon: el paquete esta pensado para ejecutarse con MLX-VLM en un Mac, de modo que un desarrollador puede probar un modelo vision-lenguaje de 4,44B sin depender de GPU dedicada ni de servicios en la nube.
- Prototipado de asistentes multimodales: usar el modelo para construir un chat que reciba imagenes y texto, aprovechando sus 262.144 tokens de contexto configurados para conversaciones con historial largo dentro de los limites de memoria.
- Extraccion de informacion de documentos e imagenes: transcripcion, resumen o pregunta-respuesta sobre capturas, formularios o diagramas antes de integrar un modelo mayor en produccion.
- Comparacion de presupuestos de cuantizacion: al existir variantes hermanas de 4 bits y 6 bits, este checkpoint MXFP8 sirve para medir el compromiso entre tamano en disco (5 GB) y precision efectiva (8,9759 BPW) sobre el mismo modelo base.
- Agentes que interpretan interfaces graficas: el modelo base esta orientado a interaccion con elementos de interfaz; puede emplearse en pruebas de automatizacion dentro de un Mac, siempre que se valide el comportamiento del checkpoint.
- Preprocesado de imagenes en pipelines locales: clasificacion, etiquetado o filtrado visual previo a etapas posteriores, ejecutado de forma offline en el propio equipo.
- Generacion de codigo asistida en local: apoyo a tareas de programacion en un entorno MLX, con la salvedad de que la calidad de codigo de esta cuantizacion no esta medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica explicitamente que no publica mediciones de calidad frente a BF16 ni frente a baselines uniformes, que no hay claims de retencion de calidad, que la calidad vision-lenguaje no esta evaluada y que la calidad de contexto largo no esta validada. Tampoco hay datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM / memoria: el paquete ocupa aproximadamente 5,00 GB de descarga (safetensors de 4,98 GB). El autor no declara un minimo de memoria unificada; la carga depende del tamano del modelo, la longitud de contexto y el runtime. Estimacion orientativa no oficial: se necesita un Mac con memoria unificada holgada por encima de los 5 GB de pesos, mas el espacio para activaciones y cache KV, especialmente si se usan contextos largos.
- GPU recomendadas: no aplica en el sentido tradicional; esta disenado para Apple Silicon (CPU/GPU unificadas con Metal). No esta pensado para A100, H100 ni RTX 4090.
- Consumer GPU: no es su objetivo; el formato MLX esta orientado a chips de Apple, no a CUDA.
- Opciones de despliegue: MLX-VLM es la ruta de ejecucion principal. La ejecucion nativa mediante AX Engine no esta establecida, ya que no se incluye un `model-manifest.json` validado. No hay soporte GGUF ni PyTorch en este repositorio, por lo que vLLM, llama.cpp, Ollama y TGI no son aplicables a estos pesos.
- Latencia y throughput: no disponibles; no se han medido ni publicado para esta cuantizacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint para compararlo en igualdad de condiciones, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| AX-Qwen3-VL-4B-Instruct-MLX-AXQ-MXFP8 | 4,44B | 262.144 tokens configurados | Mixta 8 bits/BF16, 8,9759 BPW | Apache 2.0 | MLX safetensors |
| AX-Qwen3-VL-4B-Instruct-MLX-AXQ-4bit (hermano) | 4,44B | 262.144 tokens configurados | Presupuesto de 4 bits (BPW exacto no disponible) | Apache 2.0 (segun familia) | MLX safetensors |
| AX-Qwen3-VL-4B-Instruct-MLX-AXQ-6bit (hermano) | 4,44B | 262.144 tokens configurados | Presupuesto cercano a 6 BPW (exacto no disponible) | Apache 2.0 (segun familia) | MLX safetensors |
| Qwen/Qwen3-VL-4B-Instruct (base) | 4,44B | 262.144 tokens configurados (heredado) | BF16 | Apache 2.0 | safetensors (PyTorch) |

No se dispone de datos suficientes sobre otras alternativas comparables de la misma categoria (por ejemplo, otros modelos vision-lenguaje de ~4B para Apple Silicon) en la informacion proporcionada.

## Limitaciones y advertencias

- No es una release certificada: el autor la etiqueta como "evidencia de desarrollo" y las puertas formales de certificacion AXQuant (M0-M8) no estan cerradas.
- Ausencia de benchmarks: no hay mediciones publicadas de calidad, retencion frente a BF16, contexto largo, velocidad de kernel ni aceptacion de MTP. Cualquier afirmacion de rendimiento basada en la etiqueta AXQ seria infundada.
- Calidad vision-lenguaje no evaluada: aunque la torre de vision se conserva en BF16, el repositorio no aporta ninguna validacion de calidad en tareas de imagen.
- Contexto no validado: los 262.144 tokens son un metadato de configuracion, no una capacidad comprobada; el limite real dependera de la memoria unificada disponible.
- Sin calibracion: la asignacion de precision se basa en priors de arquitectura, no en datos de calibracion, lo que puede traducirse en una retencion de calidad inferior en algunos tensores.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y especialmente relevante al no haberse medido la calidad de esta cuantizacion.
- Sesgos: no documentados en la informacion disponible; deben evaluarse por separado si el uso es sensible.
- Idioma: los metadatos no declaran idiomas soportados y no se ha evaluado el comportamiento multilingue de este checkpoint.
- Restricciones de uso: la licencia Apache 2.0 es permisiva y permite uso comercial, pero se heredan las condiciones del modelo base; conviene revisar la model card de Qwen/Qwen3-VL-4B-Instruct antes de explotarlo en produccion.
- Compatibilidad de runtime: no incluye pesos PyTorch ni GGUF, de modo que no puede cargarse directamente en vLLM, llama.cpp, Ollama ni TGI. La ejecucion nativa en AX Engine no esta establecida.
- Adopcion muy baja: 16 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte o reportes de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3-VL-4B-Instruct-MLX-AXQ-MXFP8
- Discusiones: https://huggingface.co/AutomatosX/AX-Qwen3-VL-4B-Instruct-MLX-AXQ-MXFP8/discussions
- Variante de 4 bits: https://huggingface.co/AutomatosX/AX-Qwen3-VL-4B-Instruct-MLX-AXQ-4bit
- Variante de 6 bits: https://huggingface.co/AutomatosX/AX-Qwen3-VL-4B-Instruct-MLX-AXQ-6bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio Qwen3-VL en GitHub: https://github.com/QwenLM/Qwen3-VL
- Documentacion de arquitectura de Qwen3-VL: https://deepwiki.com/QwenLM/Qwen3-VL/4.2-model-architecture
- Herramienta de cuantizacion/entorno Qwen3-VL-4B: https://github.com/CodeGandee/auto-quantize-model/blob/master/models/qwen3_vl_4b_instruct/README.md
- MLX-VLM (runtime recomendado): https://github.com/Blaizzy/mlx-vlm
