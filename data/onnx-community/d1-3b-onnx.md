# onnx-community/d1-3B-ONNX

## Resumen

d1-3B es un modelo de decisión ("system one") desarrollado por Liquid AI sobre LFM2.5-VL-3B. A diferencia de un modelo generativo convencional, recibe un estado (texto y/o imágenes) junto con preguntas tipadas (`choice`, `noul` de sí/no y `score`) y responde en una única pasada forward, sin generar ningún token. La respuesta se obtiene aplicando un softmax sobre el token correspondiente a cada opción en la posición de respuesta, lo que lo convierte en un clasificador-decisor multimodal de muy baja latencia.

`onnx-community/d1-3B-ONNX` es una conversión directa a ONNX de `LiquidAI/d1-3B`, pensada para ejecutarse en el navegador mediante Transformers.js y WebGPU. El repositorio reutiliza los grafos de `LiquidAI/LFM2.5-VL-3B-ONNX` (misma arquitectura), con un único cambio estructural: el decoder devuelve logits únicamente de la última posición, que es lo único que d1 lee. Esto evita materializar los logits completos de un prompt largo.

No se han retrenado pesos: el trabajo consiste en conversión de formato, reordenación en los grafos ONNX, desvinculación de la cabeza LM (untied LM head) para poder cuantizarla y cuantización de los pesos. El modelo tiene 3B parámetros, es multimodal (texto e imagen) y se distribuye bajo la LFM Open License v1.0 con su umbral de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decoder LFM2.5-VL + vision encoder SigLIP2), con decoder recortado a logits de ultima posicion |
| Parametros totales | 3B (segun denominacion d1-3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8 (por defecto), q4, fp32 (decoder fp32 requiere reconstruccion con `conversion/build.py`); MatMulNBits block-32 (8-bit o 4-bit) con activaciones fp32 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, license: other), con umbral de uso comercial |
| Formato de pesos | ONNX (grafos `decoder_model_merged`, `vision_encoder`, `embed_tokens`; datos externos en fragmentos de <= 1 GB) |

## Arquitectura y entrenamiento

La arquitectura se hereda íntegramente de LFM2.5-VL-3B. Consta de un vision encoder basado en SigLIP2 (con tabla de posiciones reordenada a una rejilla de 16×16 durante la conversión) y un decoder de lenguaje LFM2.5-VL. d1 le añade una capa decisoria: en lugar de generar texto token a token, lee la distribución de probabilidad sobre los tokens de las opciones candidatas en la posición de respuesta. Para ello, el decoder ONNX se modifica para devolver logits solo de la última posición (`[1, 1, vocab]`), suficiente para la lectura del decisor y para cualquier generación, y se desvincula la cabeza LM (`untied LM head`) para que pueda cuantizarse de forma independiente.

La conversión (`conversion/`) mapea los safetensors de d1 sobre los grafos de LFM2.5-VL-3B-ONNX por nombre, transpone pesos de MatMul, ajusta la tabla de posiciones de SigLIP2, calcula las cachés de RoPE, recorta el decoder a la última posición y cuantiza. Los scripts `quantize.py` y `rechunk.py` gestionan la cuantización y el troceado. No hay entrenamiento ni fine-tuning: los pesos originales no se han retrenado. El vocabulario es de 128k tokens (mencionado de forma indirecta en la descripción del recorte de logits). No se dispone de información sobre el dataset de entrenamiento original, número de tokens, composición ni si hubo RLHF/DPO.

## Capacidades

- Decisión multimodal tipada: responde a preguntas de tipo `choice` (elección entre opciones), `noul` (sí/no) y `score` (puntuación), sobre estados de texto, imagen o mixtos.
- Inferencia en una sola pasada forward con cero tokens generados: la salida es un softmax sobre el token de cada opción en la posición de respuesta.
- Procesamiento de imagen mediante vision encoder SigLIP2, con tiling del procesador de imágenes.
- Interpretación de estados de contexto (por ejemplo, memoria de conversación) para decidir si una memoria responde a un mensaje.
- Devuelve confianza calibrada por opción (por ejemplo, `confidence: 0.94` en el ejemplo de la model card).
- Ejecución en navegador mediante Transformers.js y WebGPU.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita (el modelo está orientado a decisiones puntuales, no a generación de cadenas de razonamiento).
- Modo "thinking": no disponible (precisamente su rasgo es el opuesto, "system one" sin generación).

## Casos de uso

- Enrutado de memoria en asistentes conversacionales: dado un mensaje del usuario y una lista de memorias almacenadas, decidir con `choice` si alguna memoria responde directamente al mensaje, evitando invocar un modelo grande. El ejemplo de la model card ("¿Puede una memoria responder a este mensaje?") ilustra este patrón con confianza asociada.
- Clasificación visual rápida en navegador: responder preguntas del tipo "¿Es esto una señal de aparcamiento?" sobre una imagen cargada en el cliente, con el modelo ejecutándose en WebGPU sin enviar datos al servidor.
- Filtrado y moderación previa en pipelines de IA: usar decisiones sí/no (`noul`) para descartar o aprobar entradas antes de llamar a un modelo mayor, reduciendo coste y latencia.
- Puntuación (`score`) de candidatos: ordenar respuestas, rutas o fragmentos recuperados en un sistema RAG asignando puntuaciones a cada opción en una sola pasada.
- Routing de modelos en arquitecturas híbridas: decidir en el borde (dispositivo o navegador) si una consulta se resuelve localmente o se delega a un "large model", tal como aparece en el ejemplo `route: choice(...)`.
- Asistentes web offline-first: integrar el modelo con `open-jev` o Transformers.js en aplicaciones de navegador que necesitan decisiones multimodales sin backend.
- Pre-filtrado en agentes con múltiples herramientas: responder a preguntas tipadas de selección antes de ejecutar acciones costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se documenta una comparativa de paridad frente al runtime propio de d1 (`system_one` en PyTorch fp32), sobre 8 decisiones de texto (choice, noul, score) y 3 de imagen:

| Variante | Texto max \|Δ\| | Imagen max \|Δ\| | Respuestas invertidas |
|---|---|---|---|
| fp32 | 0.0000 | 0.0000 | 0 |
| q8 | 0.018 | 0.002 | 0 |
| q4 | 0.028 | 0.063 | 1 (empate ajustado 0.48 vs 0.45) |

Nota adicional: el procesador de imágenes de Transformers.js divide en tiles de forma ligeramente distinta al de Python (256 frente a 234 tokens de imagen en una foto de 640×480), lo que desplaza las respuestas de imagen hasta 0.04 en q8, manteniendo las mismas elecciones.

## Requisitos de hardware

- VRAM estimada para inferencia: q8 aproximadamente 3,8 GB en total (decoder 3,15 GB + vision encoder 0,50 GB + embed_tokens 0,17 GB); q4 aproximadamente 2,2 GB (1,76 + 0,28 + 0,17 GB); fp32 requiere reconstruir el decoder y suma al menos 1,71 GB (vision) + 1,05 GB (embed) mas el decoder fp32.
- GPU recomendadas: dado el tamano, es viable en GPU de consumo; para WebGPU, cualquier navegador con soporte y GPU integrada o dedicada reciente.
- Cabe en GPU de consumo: sí, en tarjetas con 4-8 GB de VRAM en q4/q8. El decodificador en q8 (3,15 GB) y el vision encoder en q8 (0,50 GB) se ajustan a GPUs de gama media.
- Opciones de despliegue: Transformers.js (con WebGPU) y `open-jev` (para estados de texto). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponible en cifras; el diseño busca minimizar latencia al no generar tokens (una sola pasada forward).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onnx-community/d1-3B-ONNX | 3B | no disponible | Decision en una pasada (system one), multimodal | LFM Open License v1.0 | ONNX para Transformers.js/WebGPU |
| LiquidAI/d1-3B | 3B | no disponible | Decision en una pasada (system one), multimodal | LFM Open License v1.0 | Pesos originales en PyTorch |
| LiquidAI/LFM2.5-VL-3B-ONNX | 3B | no disponible | VLM generativo (image-text-to-text) | LFM Open License v1.0 | ONNX |

La comparación relevante es frente a su base: d1-3B-ONNX comparte arquitectura y pesos con LFM2.5-VL-3B-ONNX, pero cambia el paradigma de salida (decision puntual frente a generacion autoregresiva) y recorta el decoder a la ultima posicion. No se dispone de datos comparativos adicionales frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre; solo devuelve decisiones sobre opciones predefinidas mediante softmax en la posicion de respuesta.
- Cabeza LM desvinculada y decoder recortado: el grafo ONNX no esta pensado para generacion larga, sino para una unica lectura de logits.
- Riesgo de empates en cuantizacion baja: en q4 se documento una respuesta invertida por un empate ajustado (0.48 vs 0.45), por lo que en decisiones criticas conviene usar q8 o fp32.
- Diferencias de tiling de imagen entre Transformers.js y Python (256 vs 234 tokens en 640×480) que pueden alterar ligeramente las probabilidades de decisiones visuales (hasta 0.04 en q8).
- Idiomas soportados no documentados en la informacion disponible.
- Longitud de contexto no especificada.
- Licencia LFM Open License v1.0 con umbral de uso comercial: es imprescindible revisar el fichero `LICENSE` para conocer las condiciones exactas y el limite de uso comercial.
- Este repositorio es una obra derivada (conversion ONNX); la atribucion y los derechos corresponden a Liquid AI, Inc. sobre los pesos originales.
- No se documentan sesgos, riesgos de alucinacion ni comportamiento de seguridad especificos.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/onnx-community/d1-3B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Prompt de d1: https://huggingface.co/LiquidAI/d1-3B/blob/main/prompt.py
- Grafos ONNX de referencia: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-ONNX
- Transformers.js: https://github.com/huggingface/transformers.js
- open-jev: https://github.com/nico-martin/open-jev
- Licencia (LFM Open License v1.0): fichero `LICENSE` del repositorio
