# jmcgomes/Ming-Image-0.2-Design-fp8

## Resumen

Ming-Image-0.2-Design-fp8 es una compilación cuantizada en fp8 del modelo de generación de imágenes inclusionAI/Ming-Image-0.2-Design, publicada por el usuario jmcgomes. Se trata de una conversión de precisión reducida (float8_e4m3fn) de los dos componentes principales del modelo original: el DiT (Diffusion Transformer) y el MLLM (modelo de lenguaje multimodal) que actúa como codificador de texto y razonamiento. El objetivo es reducir el peso del modelo para que pueda ejecutarse en GPUs de 24 GB, manteniendo la estructura y los archivos auxiliares (VAE, scheduler, connector, tokenizer) intactos en bf16.

El modelo base emplea una arquitectura híbrida poco convencional para text-to-image: un MLLM con capas MoE de 256 expertos enrutados que procesa la instrucción, y un DiT de 30 bloques principales que genera la imagen. Esta build fp8 ocupa 32,3 GB en el repositorio, con el DiT en 6,5 GiB y el MLLM en 17,4 GiB, lo que la hace viable en hardware de consumo alto (RTX 4090, RTX 5090) siempre que se disponga de un cargador compatible con el layout de expertos apilados.

Es relevante ahora porque demuestra una ruta práctica de cuantización fp8 para modelos de difusión con componentes MoE, un patrón cada vez más común, aunque con la advertencia de que el formato de pesos no es estándar y requiere código de carga específico. La licencia MIT del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de 30 bloques + MLLM con MoE (256 expertos enrutados por capa) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 256 expertos enrutados por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (float8_e4m3fn) con escalas por tensor en el DiT y por fila en el MLLM; bf16 en embedders, refiners, adaLN, capa final, VAE, scheduler, connector y tokenizer |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (ming_dit_fp8.safetensors, ming_mllm_grouped_fp8.safetensors) + archivos originales en bf16 |

## Arquitectura y entrenamiento

El modelo base Ming-Image-0.2-Design combina un MLLM con arquitectura MoE y un DiT. En esta build fp8, el DiT conserva sus 30 bloques principales con las capas Lineales de atención y FFN en float8_e4m3fn, cada una con una escala por tensor almacenada en `<module>._wscale`; los embedders, refiners, adaLN y la capa final permanecen en bf16. El MLLM mantiene cada capa MoE con sus 256 expertos enrutados apilados en `<layer>.mlp.grouped.{gu,dn}` en float8_e4m3fn, con escalas bf16 por fila en `{gu,dn}_s`; el resto de componentes no se modifica.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, el proceso de alineación (RLHF/DPO) ni innovaciones de decodificación del modelo original en la información proporcionada. El error de dequantización por tensor cuantizado se sitúa entre el 2,6% y el 2,9% relativo, según la model card. El layout de expertos no sigue el formato estándar de transformers ni de diffusers: requiere un cargador que implemente un MoE con `bmm` sobre expertos apilados y una capa Linear fp8 para el DiT.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image) mediante un DiT de 30 bloques.
- Procesamiento de instrucciones complejas mediante un MLLM con MoE de 256 expertos enrutados por capa, orientado a la interpretación de prompts de diseño.
- Integración con el ecosistema diffusers a nivel de pipeline, aunque los pesos requieren un cargador específico para el layout de expertos.
- Componentes auxiliares originales conservados: VAE, scheduler, connector, tokenizer y configuraciones.
- Capacidades multimodales del MLLM subyacente: no detalladas en la información disponible.
- Soporte de tool calling, agentes, modo thinking, audio o vídeo: no disponible en la información proporcionada.

## Casos de uso

- Generación de imágenes de diseño en estaciones de trabajo con GPU de 24 GB: la build fp8 reduce el peso del DiT a 6,5 GiB y el del MLLM a 17,4 GiB, lo que permite cargar el pipeline completo en una RTX 4090 o RTX 5090 sin recurrir a offloading agresivo.
- Prototipado de pipelines text-to-image con diffusers: al mantener VAE, scheduler y tokenizer originales, se puede integrar en flujos existentes sustituyendo únicamente los pesos del DiT y del MLLM.
- Investigación sobre cuantización fp8 en modelos de difusión con MoE: el error de dequantización del 2,6-2,9% relativo y el esquema de escalas por tensor y por fila sirven como referencia para estudiar el impacto de la precisión reducida en la calidad de imagen.
- Evaluación comparativa bf16 vs fp8: al conservar la revisión exacta del modelo base (`3538f4c3...`), se pueden ejecutar experimentos A/B controlados sobre el mismo checkpoint.
- Despliegue en entornos con memoria limitada: útil en servidores con GPUs de 24 GB que necesiten servir generación de imágenes sin acceso a A100/H100.
- Desarrollo de cargadores personalizados: el layout no estándar de expertos apilados y la capa Linear fp8 del DiT convierten este repositorio en un caso de prueba para implementar loaders compatibles con MoE cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 32,3 GB; el DiT fp8 son 6,5 GiB y el MLLM fp8 17,4 GiB, más los componentes bf16 (VAE, connector, tokenizer, scheduler). Se necesita margen adicional para activaciones y caché durante la inferencia.
- GPU objetivo según la model card: 24 GB de VRAM (RTX 4090, RTX 5090, A10G de 24 GB, L4 de 24 GB, L40S).
- GPU de gama alta: A100 (40/80 GB) y H100 permiten ejecutar la versión bf16 original sin cuantizar.
- Cabe en GPU de consumo: sí, en modelos de 24 GB; no se garantiza en GPUs de 16 GB o menos sin offloading adicional.
- Opciones de despliegue: diffusers como framework declarado, pero con la advertencia de que el layout de expertos no es el estándar de transformers ni diffusers y requiere un cargador específico. El código de inferencia original está en inclusionAI/Ming-Image. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Ming-Image-0.2-Design-fp8 (este) | no disponible (DiT 30 bloques + MLLM MoE 256 expertos) | no disponible | MIT | safetensors fp8 + bf16 | Hugging Face, 0 descargas |
| inclusionAI/Ming-Image-0.2-Design | no disponible | no disponible | MIT | safetensors bf16 | Hugging Face (modelo base) |
| Alternativas text-to-image de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El layout de pesos no es estándar: los expertos MoE apilados en `<layer>.mlp.grouped.{gu,dn}` y la capa Linear fp8 del DiT exigen un cargador específico; no funciona con transformers o diffusers sin adaptación.
- Error de dequantización del 2,6-2,9% relativo por tensor cuantizado, lo que puede degradar sutilmente la calidad de imagen frente al modelo bf16 original.
- Se han eliminado los shards bf16 originales de `mllm/` y `transformer/` (aunque se conservan configs e índices), por lo que no se puede recuperar la precisión completa desde este repositorio.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Idiomas soportados no declarados; el comportamiento multilingüe del MLLM subyacente no está documentado en esta ficha.
- Riesgo de alucinación visual y sesgos del modelo base: no cuantificados en la información disponible.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base inclusionAI/Ming-Image-0.2-Design y de sus dependencias.
- Fecha de creación del repositorio: 2026-11-26, sin actualizaciones posteriores registradas más allá de la misma jornada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jmcgomes/Ming-Image-0.2-Design-fp8
- Modelo base: https://huggingface.co/inclusionAI/Ming-Image-0.2-Design
- Código de inferencia original: https://github.com/inclusionAI/Ming-Image
