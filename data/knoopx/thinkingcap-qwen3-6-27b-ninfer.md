# knoopx/ThinkingCap-Qwen3.6-27B-NInfer

## Resumen

ThinkingCap-Qwen3.6-27B es un finetune del modelo Qwen/Qwen3.6-27B, desarrollado por bottlecapai, que reduce de forma significativa el número de tokens de razonamiento (thinking tokens) necesarios para resolver tareas complejas, manteniendo la calidad de las respuestas. Según los datos publicados, el modelo gasta menos de la mitad de tokens de pensamiento que el modelo base en la mayoría de benchmarks, y en conjuntos de razonamiento intensivo como GPQA-Diamond la reducción supera el 60%. El repositorio knoopx/ThinkingCap-Qwen3.6-27B-NInfer contiene tres artefactos binarios en formato NInfer (`.ninfer`) que permiten servir el modelo directamente con el motor NInfer, con cuantizaciones W4A16 y W4A4 (NVFP4).

El modelo es denso, multimodal (imagen y vídeo a texto), con 27 mil millones de parámetros y una ventana de contexto de 262 144 posiciones. Su arquitectura combina atención completa y capas recurrentes, e incluye un módulo de visión ViT de 27 capas. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (model_type: qwen3_5), transformer denso multimodal con atención híbrida (16 capas full-attention + 48 recurrentes) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 posiciones máximas |
| Tipos de cuantizacion | W4A16 (groupwise int4/5/6 + W8), W4A4 (NVFP4, E2M1) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | NInfer (`.ninfer`), archivo único binario; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un finetune denso de Qwen/Qwen3.6-27B, con arquitectura `qwen3_5`. La parte de texto consta de 64 capas decoder con atención híbrida: 16 capas de atención completa intercaladas con 48 capas recurrentes (convolución corta de ancho 4), con un intervalo de atención completa de 4. Las dimensiones ocultas son 5120, la capa intermedia 17408 y la matriz de salida tiene 248 320 filas (dominio del tokenizador: 248 077). Usa 24 cabezas de consulta y 4 cabezas KV (dimensión de cabeza 256), una capa de borrador MTP (multi-token prediction) y RoPE con θ=10 000 000 y sección mRoPE `[11, 11, 10]`. La parte de visión es un ViT de 27 capas (hidden 1152, intermediate 4304, 16 cabezas) con parche espacial de 16×16, parche temporal de 2 frames y fusión espacial 2×2.

El finetune fue realizado por bottlecapai sobre un dataset curado que abarca múltiples dominios y niveles de dificultad, con el objetivo de reducir el gasto de tokens de razonamiento. No se han publicado detalles sobre el uso de RLHF, DPO u otras técnicas de alineación; la información disponible solo menciona "algoritmos de finetuning de última generación". Los artefactos NInfer fueron generados por knoopx mediante conversores específicos, fusionando el checkpoint BF16 base con versiones cuantizadas NVFP4 cuando corresponde.

## Capacidades

- Generación de texto y razonamiento multi-paso con un uso eficiente de tokens de pensamiento (hasta un 50% menos que el modelo base).
- Procesamiento multimodal de imagen y vídeo a texto, gracias al ViT integrado y la arquitectura híbrida.
- Conversación multi-turno con contexto largo (hasta 262 144 tokens).
- Soporte de predicción multi-token (MTP) mediante la capa de borrador, lo que puede acelerar la decodificación.
- Capacidades de razonamiento matemático, lógico y científico heredadas del modelo base Qwen3.6-27B, aunque no se han publicado benchmarks específicos en la información disponible.
- No se confirma explícitamente soporte de tool calling o function calling en la documentación del repositorio; se asume que hereda las capacidades del modelo base, pero no está verificado.

## Casos de uso

- Razonamiento eficiente en producción: el modelo reduce el número de tokens de pensamiento en más de un 50% en la mayoría de benchmarks, lo que se traduce en menor latencia y coste por consulta en sistemas que requieren razonamiento complejo (análisis financiero, diagnóstico técnico, etc.).
- Análisis de imágenes y vídeos: al ser multimodal, puede procesar capturas de pantalla, diagramas, fotogramas de vídeo y generar descripciones o respuestas basadas en contenido visual.
- Asistentes conversacionales con contexto largo: su ventana de 262 144 tokens permite mantener conversaciones extensas con historial completo, adecuado para chatbots de atención al cliente o asistentes personales.
- Generación de código asistida: aunque no se documenta explícitamente, al derivar de Qwen3.6-27B es plausible que soporte tareas de programación; se recomienda validar antes de usarlo en entornos críticos.
- Procesamiento de documentos técnicos con figuras: puede combinar texto e imágenes de manuales, informes o papers para extraer información y responder preguntas.
- Agentes autónomos con razonamiento multi-paso: su eficiencia en tokens de pensamiento lo hace adecuado para agentes que necesitan planificar y ejecutar varias acciones sin agotar el presupuesto de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos proporcionados por bottlecapai se centran en la reducción del número de tokens de pensamiento: en la mayoría de benchmarks el modelo gasta menos de la mitad de tokens que el modelo base, y en GPQA-Diamond la media cae más de un 60%. No se aportan cifras de precisión o exactitud en tareas concretas, por lo que no es posible comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los artefactos NInfer tienen un tamaño de tensores de aproximadamente 17,5 GB (W4A16) y 18,3 GB (NVFP4). Con overhead de activaciones y KV cache, se estima que se necesitan al menos 20-24 GB de VRAM para ejecutar el modelo en FP16/BF16 de activaciones, y algo menos en modo W4A4.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A10G (24 GB), A100 (40/80 GB), H100 (80 GB). En GPUs con menos de 24 GB no se recomienda su uso sin técnicas de offloading.
- En consumer GPU: cabe en una RTX 4090 o RTX 3090 (24 GB) con cuantización W4A16, aunque la velocidad dependerá del ancho de banda de memoria.
- Opciones de despliegue: el formato NInfer es específico del motor NInfer; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Se requiere el runtime NInfer para servir los artefactos.
- Latencia y throughput: no disponible. Depende del hardware y de la configuración del motor NInfer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Eficiencia de tokens de pensamiento |
|---|---|---|---|---|---|---|
| ThinkingCap-Qwen3.6-27B (NInfer) | 27B | 262 144 | Sí (imagen+vídeo) | Apache 2.0 | NInfer | Reducción >50% vs base |
| Qwen/Qwen3.6-27B (base) | 27B | 262 144 | Sí (imagen+vídeo) | Apache 2.0 | safetensors, GGUF, etc. | Referencia (100%) |
| Qwen3-27B (versión anterior) | 27B | 131 072 (aprox.) | No (solo texto) | Apache 2.0 | safetensors, GGUF | Sin datos |

La comparativa se limita a la familia Qwen porque no se dispone de datos de otros modelos de 27B con características similares en la información proporcionada. La principal diferencia de ThinkingCap frente al base es la reducción de tokens de razonamiento, que impacta directamente en el coste y la latencia de inferencia.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas no está documentado y puede ser inferior.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez en escenarios adversarios; se recomienda validar antes de usar en producción.
- El formato NInfer es propietario del motor NInfer; no es interoperable con ecosistemas estándar como Hugging Face Transformers, vLLM u Ollama, lo que limita su portabilidad.
- Los artefactos NInfer son archivos binarios de un solo fichero; no se proporcionan pesos en safetensors ni GGUF, por lo que no se puede usar con otras herramientas sin conversión adicional.
- El repositorio tiene muy pocas descargas (12) y sin valoraciones, lo que indica una adopción limitada y posible falta de validación comunitaria.
- No se confirma el soporte de tool calling ni function calling; si se necesita esa funcionalidad, debe verificarse con el modelo base o con pruebas específicas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6-27B puede tener sus propias condiciones; se recomienda revisar la licencia del modelo base original.

## Enlaces

- Repositorio HuggingFace del modelo NInfer: https://huggingface.co/knoopx/ThinkingCap-Qwen3.6-27B-NInfer
- Finetune original de bottlecapai: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B
- Modelo base Qwen/Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Anuncio de bottlecapai sobre la serie ThinkingCap: https://bottlecapai.com/post/thinkingcap-qwen3-6-27b/
- Artículo en HackerNoon sobre la reducción de tokens de razonamiento: https://hackernoon.com/thinkingcap-qwen36-27b-cuts-reasoning-token-use-by-half
- Ficha en ThinkLLM: https://thinkllm.dev/models/thinkingcap-qwen3-6-27b
