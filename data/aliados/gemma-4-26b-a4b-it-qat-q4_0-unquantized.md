# Aliados/gemma-4-26B-A4B-it-qat-q4_0-unquantized

## Resumen

Gemma 4 26B A4B es un modelo multimodal de Google DeepMind perteneciente a la cuarta generacion de la familia Gemma. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 25.805.936.206 parametros totales y aproximadamente 4.000 millones de parametros activos por token (de ahi el sufijo "A4B"), disenado para tareas de generacion de texto, razonamiento, codigo y comprension de imagenes. El checkpoint aqui descrito es una variante "unquantized QAT" publicada por el usuario Aliados: pesos en media precision extraidos del pipeline de Quantization-Aware Training (QAT) Q4_0 de Google, pensados para compilacion personalizada e investigacion.

La relevancia de esta publicacion radica en que el QAT permite conservar una calidad cercana a bfloat16 reduciendo drasticamente los requisitos de memoria en el despliegue final. El modelo base soporta una ventana de contexto de hasta 256K tokens, mantiene soporte multilingue en mas de 140 idiomas y anade modos de razonamiento configurables ("thinking modes"), soporte nativo del rol `system` y function calling para flujos agenticos.

Al tratarse de un checkpoint derivado y no de un modelo entrenado desde cero, su interes practico esta en servir como punto de partida para cuantizaciones propias, experimentos de decodificacion especulativa y evaluacion comparativa frente al checkpoint original de Google. La licencia declarada es Apache 2.0, aunque el modelo base remite a la licencia especifica de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atencion hibrida (sliding window local + atencion global), p-RoPE y Keys/Values unificadas en capas globales |
| Parametros totales | 25.805.936.206 |
| Parametros activos | Aproximadamente 4B (denominacion "A4B") |
| Longitud de contexto | 256K tokens (modelos medianos de la familia Gemma 4) |
| Tipos de cuantizacion | El checkpoint es "unquantized QAT" (media precision extraida del pipeline Q4_0); la familia ofrece ademas GGUF Q4_0, compressed-tensors w4a16 y formato movil wNa8o8 (este ultimo solo para E2B y E4B) |
| Idiomas soportados | Mas de 140 idiomas (segun la familia Gemma 4); no se detalla lista concreta para este checkpoint |
| Licencia | Apache 2.0 (con enlace a la licencia especifica de Gemma 4) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Experts sobre un transformer con atencion hibrida: capas de atencion local con ventana deslizante intercaladas con capas de atencion global, garantizando que la ultima capa sea siempre global. Para optimizar memoria en contextos largos, las capas globales unifican Keys y Values y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262K tokens. La familia Gemma 4 incluye variantes densas y MoE; este checkpoint corresponde al tamano 26B A4B, orientado a estaciones de trabajo y GPUs de consumo alto.

El checkpoint concreto es el resultado del pipeline de Quantization-Aware Training (QAT) Q4_0 de Google, del que se han extraido los pesos en media precision. No se dispone de informacion sobre el volumen exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en esta variante. La model card de la familia menciona mejoras en capacidades de codigo y agenticas, soporte nativo de function calling y modos de razonamiento configurables, pero no aporta cifras de entrenamiento para este checkpoint derivado.

## Capacidades

- Generacion de texto y razonamiento con modos de "thinking" configurables.
- Comprension de imagenes con soporte de relacion de aspecto y resolucion variables (pipeline image-text-to-text).
- Capacidades de codigo y matematicas mejoradas respecto a generaciones anteriores de la familia.
- Soporte nativo de function calling / tool calling para flujos agenticos.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Razonamiento multi-paso y flujos de agente autonomo.
- Capacidades multilingues en mas de 140 idiomas.
- Procesamiento de video segun la documentacion de la familia (no confirmado de forma especifica para este checkpoint).
- No incluye audio: el soporte de audio nativo esta limitado a los modelos E2B, E4B y 12B de la familia.

## Casos de uso

- Investigacion en cuantizacion: al ser un checkpoint QAT en media precision, es adecuado para extraer y comparar esquemas de cuantizacion propios (GPTQ, AWQ, GGUF) frente al pipeline Q4_0 original de Google, midiendo la degradacion de calidad.
- Compilacion personalizada y despliegue optimizado: sirve como base para generar artefactos adaptados a hardware concreto (NPUs, aceleradores propietarios) partiendo de pesos sin cuantizar.
- Evaluacion comparativa de checkpoints: util para contrastar el rendimiento del QAT unquantized frente al modelo base `google/gemma-4-26B-A4B-it` en tareas de razonamiento y codigo.
- Atencion al cliente automatizada: con 256K tokens de contexto puede gestionar conversaciones multi-turno largas y mantener el rol `system` para definir politicas de respuesta.
- Generacion de codigo en produccion: el soporte de function calling permite integrarlo en pipelines de CI/CD para revision de codigo, generacion de tests o sugerencias asistidas.
- Agentes autonomos multi-paso: la combinacion de tool calling, razonamiento configurable y contexto largo lo hace apto para orquestacion de tareas con multiples llamadas a herramientas.
- Analisis de documentos con imagenes: al aceptar entrada image-text-to-text, puede procesar capturas, diagramas o formularios junto con texto para extraccion de informacion.
- Decodificacion especulativa: la familia incluye modelos drafter; este checkpoint puede actuar como modelo objetivo siempre que el asistente sea tambien QAT y de la misma precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en media precision: aproximadamente 52 GB solo para pesos (25,8B parametros en bf16/fp16), mas overhead de KV cache y activaciones.
- En cuantizacion Q4_0 (formato GGUF de la familia): el peso se reduce a unos 13-15 GB, lo que permite su ejecucion en GPUs de consumo con 16-24 GB.
- GPUs recomendadas: A100 80 GB o H100 para media precision con contexto largo; RTX 4090 (24 GB) viable con cuantizacion Q4_0 y contextos moderados.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 o similares con 24 GB, usando cuantizacion Q4_0; en media precision no cabe en GPUs de consumo.
- Opciones de despliegue: transformers (formato nativo del checkpoint), llama.cpp/Ollama (via las versiones GGUF Q4_0 de la familia), vLLM (via los checkpoints compressed-tensors w4a16 de la familia), TGI segun compatibilidad con la arquitectura.
- Latencia y throughput: no disponibles para este checkpoint concreto. Al ser MoE con ~4B parametros activos, el coste computacional por token es notablemente inferior al de un modelo denso de 26B.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 26B A4B (este checkpoint) | 25,8B | ~4B | 256K | Apache 2.0 | safetensors (QAT unquantized) |
| Gemma 4 31B Dense | 30,7B | 30,7B (denso) | 256K | Apache 2.0 | safetensors / GGUF / compressed-tensors |
| Gemma 4 12B Unified | 11,95B | 11,95B (denso) | 256K | Apache 2.0 | safetensors / GGUF / compressed-tensors |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | denso | 128K | Apache 2.0 | safetensors / GGUF / wNa8o8 |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con modelos de otros fabricantes.

## Limitaciones y advertencias

- Checkpoint derivado de terceros (usuario Aliados), no una publicacion oficial de Google DeepMind; la trazabilidad del proceso de extraccion de pesos no esta documentada en la informacion disponible.
- Al ser "unquantized", no ofrece las ventajas de memoria del QAT en su forma actual: requiere el espacio de un modelo en media precision hasta que se recuantice.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de este checkpoint.
- Sesgos: no se documentan sesgos conocidos para esta variante; los sesgos del modelo base no se detallan en la informacion disponible.
- Idiomas: se declaran mas de 140 idiomas para la familia, pero no hay evaluacion especifica por idioma para este checkpoint.
- Compatibilidad de decodificacion especulativa: el modelo asistente debe ser tambien QAT y de la misma precision, lo que restringe las combinaciones posibles.
- Licencia: se declara Apache 2.0, pero el enlace remite a la licencia especifica de Gemma 4; conviene verificar los terminos exactos antes de un uso comercial en produccion.
- Sin soporte de audio (limitado a E2B, E4B y 12B en la familia).
- Solo 17 descargas y 0 likes en el momento de la ficha: ecosistema de validacion practicamente inexistente.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/Aliados/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Coleccion QAT Q4_0 de Google: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento del QAT de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico: https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
