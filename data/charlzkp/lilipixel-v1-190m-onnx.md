# CharlZKP/LiliPixel-V1-190M-ONNX

## Resumen

LiliPixel-V1-190M-ONNX es la exportación a formato ONNX del modelo de difusión texto-a-píxel-art LiliPixel-V1-190M desarrollado por Pinkstack, publicada por el usuario CharlZKP. El paquete incluye tanto el transformador de difusión (DiT) como su codificador de texto congelado, voyage-4-nano de MongoDB/Voyage AI, y está diseñado específicamente para inferencia en navegador mediante ONNX Runtime Web con aceleración WebGPU y respaldo WASM.

El modelo resuelve un problema concreto: generar sprites y arte pixelado a resoluciones nativas de 16x16, 32x32 y 64x64 sin necesidad de servidor, ejecutándose íntegramente en el cliente. Esto lo hace relevante para herramientas web interactivas, editores de sprites y aplicaciones de generación de assets donde la latencia de red y los costes de infraestructura son críticos.

La arquitectura combina un codificador de texto bidireccional basado en Qwen3 (voyage-4-nano, 1024 dimensiones de embedding) con un DiT de 24 capas y 768 dimensiones ocultas que comparte pesos entre las tres resoluciones mediante índices de resolución. El repositorio ocupa 1,1 GB y los pesos se almacenan una única vez en fp16, compartidos entre las variantes de grafo f16 y f32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con codificador de texto Qwen3 bidireccional |
| Parametros totales | 190M (según nombre del modelo base); desglose exacto no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 96 tokens de texto (fijo para el codificador) |
| Tipos de cuantizacion | fp16 y fp32 (grafos separados; pesos almacenados en fp16) |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW-1.1 (modelo base); Apache-2.0 (codificador voyage-4-nano) |
| Formato de pesos | ONNX (grafos f16 y f32) + shards `.data` fp16 + tabla de embeddings fp16 cruda |

## Arquitectura y entrenamiento

El cuerpo generativo es un Diffusion Transformer de 24 capas con dimensión oculta de 768, compartido entre las resoluciones de 16x16, 32x32 y 64x64 mediante un índice de resolución (`res_idx`) que selecciona las proyecciones de parche adecuadas. El codificador de texto es voyage-4-nano, un transformer Qwen3 bidireccional que produce características por token de 2048 dimensiones (tras una cabeza lineal 1024→2048), sin pooling. La entrada de texto se limita a 96 tokens con padding mediante `<|endoftext|>`.

El muestreo utiliza rectified flow con el scheduler `FlowMatchEulerDiscreteScheduler` de diffusers (shift 1), con 30 pasos por defecto (50 a 64x64) y escala CFG de 3.0. La atención se implementa como MatMul → Softmax → MatMul sin operadores fusionados, y los grafos se construyeron directamente con `onnx.helper` en lugar de trazarse. Los pesos se almacenan una sola vez en fp16 y las variantes f32 realizan un cast en tiempo de ejecución; las estadísticas de RMSNorm, softmax, RoPE y el embedding de timestep permanecen en fp32 incluso en la variante f16. No se dispone de información sobre el dataset de entrenamiento, número de tokens o si hubo RLHF/DPO.

## Capacidades

- Generación de imágenes texto-a-imagen especializada en pixel art y sprites.
- Tres resoluciones nativas: 16x16, 32x32 y 64x64 píxeles.
- Salida RGBA en rango [-1,1] para 16/32 (fondo transparente) y RGB para 64x64.
- Control de realismo a 64x64 mediante el prefijo `realistic photo, ` en el prompt.
- Clasificador libre de guía (CFG) con caption nulo aprendido (`drop=1`).
- Inferencia en navegador vía ONNX Runtime Web (WebGPU con `shader-f16`, o WASM/fp32 como respaldo).
- Tokenizador incluido (`tokenizer.json`) para preprocesado en cliente.
- No se documentan capacidades de tool calling, agentes, multilingüismo explícito ni modos de razonamiento.

## Casos de uso

- Editor de sprites en navegador: el modelo genera assets de 16x16 o 32x32 con transparencia directamente en el cliente, eliminando el round-trip al servidor y permitiendo iteración en tiempo real sobre el prompt.
- Herramienta de prototipado de videojuegos indie: generación de tilesets y sprites base a 64x64 que el artista refina después, con coste de infraestructura cero al ejecutarse en WebGPU del usuario.
- Aplicación educativa de arte generativo: demostración de difusión y rectified flow en el navegador sin instalación, usando la variante WASM/fp32 para equipos sin soporte fp16.
- Generación de avatares pixelados: integración en foros o comunidades donde el usuario describe su avatar y obtiene un sprite RGBA listo para usar como imagen de perfil.
- Filtro creativo en redes sociales: generación de iconos pixelados a partir de texto en una web app, con la variante f16 para GPUs integradas modernas.
- Banco de pruebas de paridad ONNX: el repositorio incluye scripts de paridad frente a la pipeline PyTorch original, útil para validar conversiones de modelos de difusión a ONNX con coseno de similitud de 1.0000000 en características del codificador y velocidad del primer paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, FID) en la información disponible. El autor únicamente reporta métricas de paridad frente a la pipeline PyTorch fp32 original con el mismo ruido inicial:

| Variante | Coseno características codificador | Coseno velocidad primer paso | Imagen final |
|---|---|---|---|
| f32 (ORT CPU) | 1.0000000 (máx. abs 1e-5) | 1.0000000 | Ver tabla PARITY en repo de la app |
| f16 (ORT CPU) | 0.9999999 | 1.0000000 | Ver tabla PARITY en repo de la app |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 1,1 GB y los pesos se almacenan en fp16, por lo que la huella en GPU es del orden de cientos de MB más activaciones.
- GPU recomendadas: cualquier GPU con soporte WebGPU y `shader-f16` para la variante f16; GPUs sin fp16 o CPU para la variante f32/WASM.
- Cabe en GPUs de consumo: sí, por el tamaño reducido (190M parámetros) y la naturaleza de inferencia en navegador.
- Opciones de despliegue: ONNX Runtime Web (WebGPU o WASM) en navegador; ONNX Runtime nativo en servidor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión texto-a-imagen).
- Latencia y throughput: no disponibles. El autor indica 30 pasos por defecto (50 a 64x64), lo que condiciona el tiempo de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto texto | Resoluciones | Licencia | Despliegue navegador |
|---|---|---|---|---|---|
| LiliPixel-V1-190M-ONNX | 190M | 96 tokens | 16/32/64 | OpenMDW-1.1 | Sí (ONNX Runtime Web) |
| Pinkstack/LiliPixel-V1-190M (original) | 190M | 96 tokens | 16/32/64 | OpenMDW-1.1 | No (PyTorch/diffusers) |
| Modelos de difusión generalistas (p. ej. SD) | Cientos de M a miles de M | Variable | 512+ | Variable | Parcial, con requisitos mayores |

No se dispone de datos de benchmarks comparativos con alternativas de pixel art en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en pixel art y sprites; no es adecuado para generación fotorrealista general más allá del modo `realistic photo` a 64x64.
- Contexto de texto muy corto (96 tokens), lo que limita prompts largos o detallados.
- Idiomas soportados no documentados; el tokenizador proviene de voyage-4-nano y el comportamiento multilingüe no está verificado.
- Riesgo de alucinación visual y artefactos propios de modelos de difusión pequeños; la paridad reportada es frente a la pipeline original, no una garantía de calidad subjetiva.
- Licencia OpenMDW-1.1 para los pesos LiliPixel: revisar términos antes de uso comercial; el codificador voyage-4-nano es Apache-2.0.
- Conversión no oficial: el autor declara que todos los créditos corresponden a los autores originales; posibles divergencias frente al modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Dependencia de WebGPU y `shader-f16` para el mejor rendimiento; la variante f32/WASM puede ser notablemente más lenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlZKP/LiliPixel-V1-190M-ONNX
- Modelo base: https://huggingface.co/Pinkstack/LiliPixel-V1-190M
- Codificador de texto: https://huggingface.co/MongoDB/voyage-4-nano
- Repositorio de la app web con scripts de build y paridad: no disponible (mencionado en la model card sin URL)
- Paper: no disponible
- Demo: no disponible
