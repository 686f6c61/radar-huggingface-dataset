# scottlowry/Qwen3.5-4B-oQ6e-mtp

## Resumen

Qwen3.5-4B-oQ6e-mtp es una cuantización mixta del modelo base Qwen/Qwen3.5-4B, publicada por el usuario scottlowry. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a inferencia eficiente en hardware Apple Silicon mediante la librería MLX. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.4.dev1), que aplica precisión mixta por tensor en lugar de una cuantización uniforme.

El checkpoint combina tres formatos de almacenamiento: affine 6-bit con grupo de 64 para el 83,5 % de los pesos lógicos, affine 8-bit para el 9,1 % y BF16 sin cuantizar para el 7,5 % restante, lo que da una media efectiva de 7,390 bits por peso. El resultado ocupa 4,009 GiB en disco, una reducción notable frente a los aproximadamente 9,3 GB que requeriría el mismo modelo en BF16.

El modelo base Qwen3.5-4B incluye componentes de lenguaje, visión y una cabeza MTP (multi-token prediction) para decodificación especulativa. Esta cuantización preserva las tres partes, por lo que mantiene capacidades multimodales y de generación acelerada. Es relevante para desarrolladores que quieran ejecutar un modelo de 4B con visión en Macs con memoria unificada limitada, aunque la información publicada sobre el modelo base y sobre esta conversión es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con modulo de vision y cabeza MTP; detalles no disponibles |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64 (83,483 %), affine 8-bit grupo 64 (9,057 %), BF16 (7,459 %); media efectiva 7,390 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer de la familia Qwen3.5 con 4,66B parametros, que segun el desglose de almacenamiento se compone de 4,206B parametros en el modelo de lenguaje, 0,334B en el modulo de vision y 0,121B en la cabeza MTP. La presencia de vision y de una cabeza MTP indica un modelo multimodal con soporte de decodificacion especulativa mediante prediccion multi-token. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Esta publicacion concreta no entrena nada: es una cuantizacion de precision mixta realizada con oQ (oMLX v0.7.4.dev1). La innovacion tecnica reside en la asignacion no uniforme de bits: la mayor parte de los pesos se almacena en 6 bits con grupo de 64, una fraccion reducida en 8 bits y los tensores mas sensibles se mantienen en BF16, lo que busca minimizar la perdida de calidad respecto al modelo original. La cabeza MTP se conserva cuantizada (0,121B parametros, 0,107 GiB), lo que permite mantener la decodificacion especulativa en el checkpoint convertido.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-4B.
- Procesamiento de vision: el checkpoint incluye el modulo visual (0,334B parametros), por lo que conserva capacidad multimodal imagen-texto.
- Decodificacion especulativa: la cabeza MTP (multi-token prediction) se mantiene en el checkpoint, lo que habilita generacion acelerada en entornos MLX compatibles.
- Tool calling / function calling: no confirmado en la informacion disponible; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta en formato MLX y ocupa 4,009 GiB, por lo que puede cargarse en Macs con 16 GB de memoria unificada o superiores, dejando margen para el contexto y el runtime. Adecuado para prototipado y uso personal en local.
- Asistentes multimodales en escritorio: al conservar el modulo de vision, permite construir aplicaciones que describan imagenes, respondan preguntas sobre capturas de pantalla o extraigan informacion de documentos escaneados sin salir del equipo.
- Generacion de texto acelerada con MTP: la cabeza de prediccion multi-token permite reducir la latencia por token en decodificacion especulativa, util para chats interactivos donde importa el tiempo hasta la primera respuesta completa.
- Desarrollo y pruebas de pipelines MLX: sirve como checkpoint de referencia para validar integraciones con oMLX, medir el impacto de la cuantizacion mixta frente al BF16 y comparar calidad y velocidad en hardware Apple.
- Procesamiento por lotes en portatiles: para tareas de resumen, clasificacion o extraccion de entidades sobre volumenes moderados de texto, el tamano reducido permite ejecutar el modelo en un portatil sin GPU dedicada.
- Educacion e investigacion: util para experimentar con cuantizacion de precision mixta, decodificacion especulativa y modelos multimodales pequenos en entornos academicos con hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint pesa 4,009 GiB en disco; en inferencia hay que sumar el contexto KV y el overhead del runtime MLX, por lo que se recomienda un minimo de 8 GB de memoria unificada y 16 GB para contextos largos o uso multimodal.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y variantes Pro/Max/Ultra), ya que el formato es MLX y no es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con memoria unificada suficiente; no esta pensado para GPUs NVIDIA o AMD de consumo.
- Opciones de despliegue: MLX y oMLX (libreria indicada en la model card). No se proporcionan pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas; vLLM y TGI tampoco soportan MLX de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-oQ6e-mtp (este) | 4,66B | no disponible | safetensors MLX | no disponible | Hugging Face, 48 descargas |
| Qwen/Qwen3.5-4B (base) | 4,66B | no disponible | safetensors | no disponible | Hugging Face |
| Otras cuantizaciones del mismo base (GGUF, MLX uniformes) | 4,66B | no disponible | GGUF / MLX | segun autor | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad respecto al modelo base en BF16; la precision mixta busca minimizarla, pero no se han publicado evaluaciones que la cuantifiquen.
- El checkpoint esta ligado a MLX y a Apple Silicon; no es portable a CUDA sin conversion previa.
- La model card no especifica licencia, idiomas soportados ni longitud de contexto, lo que impide confirmar condiciones de uso comercial.
- Autor individual sin historial verificable (0 likes, 48 descargas): conviene validar el checkpoint antes de usarlo en produccion.
- El modelo fue re-cuantizado el 2026-11-11 con oMLX v0.7.4.dev1; las copias anteriores pueden diferir, por lo que hay que verificar la fecha de descarga.
- Riesgo de alucinacion y sesgos inherentes al modelo base, no documentados en esta publicacion.
- No hay garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-4B-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
