# LiquidAI/LFM3-VL-2B-FP8

## Resumen

LFM3-VL-2B-FP8 es la versión cuantizada en FP8 de LFM3-VL-2B, un modelo multimodal de tipo image-text-to-text desarrollado por Liquid AI dentro de su familia LFM3. El modelo base cuenta con 1.918.181.888 parámetros (aproximadamente 1,92 mil millones) y está diseñado para recibir entradas conjuntas de imagen y texto y generar respuestas conversacionales. Esta variante FP8 está pensada específicamente para inferencia en GPU, reduciendo el peso del repositorio a 2,6 GB frente a lo que ocuparía en BF16.

La relevancia de esta ficha radica en que se trata de un modelo compacto (por debajo de los 2B parámetros) con capacidades de visión y un soporte declarado de 16 idiomas, incluido el castellano. La cuantización FP8 con bloques de 128×128 y cuantización dinámica de activaciones permite desplegarlo en GPUs de gama media con requisitos de VRAM moderados, manteniendo en BF16 los componentes sensibles (embeddings, cabeza de salida, convoluciones, puertas de atención, normas, codificador visual y proyector).

La información pública disponible en la model card es escasa: remite a la model card del modelo base para detalles de arquitectura y uso, y no incluye resultados de benchmarks ni especificaciones completas de contexto o entrenamiento. Esta ficha refleja únicamente los datos verificables en la información proporcionada y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3; pipeline image-text-to-text; codificador visual + proyector + modelo de lenguaje) |
| Parametros totales | 1.918.181.888 (≈1,92 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos de feed-forward y atención con bloques 128×128 y cuantización dinámica de activaciones); embeddings, cabeza de salida, convoluciones, puertas de atención, normas, codificador visual y proyector en BF16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (compressed-tensors), librería transformers, custom_code |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base LFM3-VL-2B más allá de que se trata de un modelo multimodal image-text-to-text de la familia LFM3, con un codificador visual, un proyector y un modelo de lenguaje. La model card de esta variante FP8 indica que los pesos de feed-forward y atención del modelo de lenguaje se cuantizan en FP8 con bloques de 128×128 y cuantización dinámica de activaciones, mientras que embeddings, cabeza de salida, convoluciones, puertas de atención y normas permanecen en BF16; el codificador visual y el proyector también se mantienen en BF16. Se conservan sin cambios los ajustes de sliding-window y RoPE.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas específicas más allá de la propia cuantización FP8 y del uso de sliding-window attention (mencionado de forma indirecta al indicar que sus ajustes no se modifican).

## Capacidades

- Generación de texto conversacional a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Comprensión de imágenes combinada con instrucciones en lenguaje natural (VQA, descripción, razonamiento sobre la imagen).
- Soporte multilingüe declarado en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Formato conversacional (tag "conversational"), apto para diálogos multi-turno.
- Compatibilidad con el parser de razonamiento `qwen3-thinking` en SGLang, lo que sugiere soporte de modo de razonamiento en el servidor de inferencia (según el ejemplo de despliegue de la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada (más allá de la referencia al parser de razonamiento).
- Capacidades de audio: no disponible.

## Casos de uso

- Asistencia visual conversacional: el modelo puede recibir una imagen junto con una pregunta del usuario y mantener una conversación multi-turno sobre ella, gracias a su pipeline image-text-to-text y su formato conversacional. Adecuado para asistentes de accesibilidad que describan imágenes o respondan preguntas sobre su contenido.
- Extracción de información de documentos escaneados: usar el modelo para responder preguntas concretas sobre facturas, formularios o capturas, combinando el codificador visual con el modelo de lenguaje. Su tamaño compacto permite desplegarlo en GPUs modestas.
- Moderación y clasificación de imágenes con justificación textual: el modelo puede generar una explicación en lenguaje natural de por qué una imagen cumple o no ciertas políticas, útil en pipelines de revisión de contenido.
- Atención al cliente con soporte de imágenes: integrable en un chatbot que reciba capturas de pantalla o fotos de productos y responda en el idioma del usuario (16 idiomas soportados, incluido el español), manteniendo conversaciones multi-turno.
- Despliegue en edge o en servidores con VRAM limitada: al ser una variante FP8 de un modelo de menos de 2B parámetros, es apta para entornos donde no cabe un modelo multimodal mayor, por ejemplo en estaciones de trabajo con una sola GPU consumer.
- Prototipado rápido de aplicaciones multimodales: al cargarse con `transformers` y disponer de soporte en SGLang (en revisión en el PR sgl-project/sglang#46858), sirve para validar ideas de producto antes de escalar a modelos mayores.
- Procesamiento multilingüe de imágenes en contexto empresarial: por ejemplo, clasificación y respuesta a consultas sobre imágenes en español, portugués, francés o alemán dentro de un mismo flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 2,6 GB en FP8; se puede estimar un consumo de pesos en torno a 2-3 GB, más overhead de activaciones, KV cache y codificador visual (este último en BF16). La VRAM total necesaria no está publicada.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, es plausible su ejecución en GPUs consumer con suficiente VRAM, pero no se confirma en la model card.
- ¿Cabe en consumer GPU?: no confirmado oficialmente; el tamaño del repositorio (2,6 GB) sugiere que sí en GPUs con 8 GB o más, pero este dato no está verificado en la información disponible.
- Opciones de despliegue: `transformers` (librería declarada) y SGLang (soporte en revisión en sgl-project/sglang#46858, con ejemplo de lanzamiento mediante `python -m sglang.launch_server --model-path LiquidAI/LFM3-VL-2B-FP8 --reasoning-parser qwen3-thinking`). Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la información proporcionada. La comparativa se limita a datos verificables:

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato FP8 |
|---|---|---|---|---|---|
| LFM3-VL-2B-FP8 | ≈1,92 B | no disponible | imagen + texto | lfm1.0 | sí (compressed-tensors) |
| LFM3-VL-2B (base) | ≈1,92 B | no disponible | imagen + texto | lfm1.0 | no (BF16) |
| Otros modelos multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card de esta variante remite a la del modelo base para arquitectura y uso; la documentación pública es escasa y no cubre sesgos, datos de entrenamiento ni evaluaciones.
- No se han publicado resultados de benchmarks, por lo que no es posible verificar la calidad del modelo frente a alternativas.
- Riesgo de alucinación inherente a los modelos de lenguaje: no hay evaluación publicada específica para esta variante.
- La cuantización FP8 puede introducir degradación respecto al modelo base en BF16; no se documenta la magnitud de esa pérdida.
- Licencia `lfm1.0` (license: other): es necesario revisar el texto de la licencia antes de un uso comercial; la información proporcionada no detalla las restricciones.
- Longitud de contexto no publicada: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- El soporte en SGLang está en revisión (PR #46858), por lo que el despliegue en producción con ese servidor puede requerir compilar desde la rama del PR.
- El soporte en otros motores de inferencia (vLLM, llama.cpp, Ollama, TGI) no está confirmado.
- El modelo requiere `trust_remote_code` o `custom_code` para cargarse con `transformers`, lo que implica ejecutar código del autor.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/LiquidAI/LFM3-VL-2B-FP8
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Blog de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola / API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- PR de soporte en SGLang: https://github.com/sgl-project/sglang/pull/46858
- Licencia (referenciada en la model card): LICENSE del repositorio de Hugging Face
