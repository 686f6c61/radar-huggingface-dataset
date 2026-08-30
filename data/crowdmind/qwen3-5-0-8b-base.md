# CrowdMind/Qwen3.5-0.8B-Base

## Resumen

CrowdMind/Qwen3.5-0.8B-Base es un fine-tuning del modelo Qwen3.5-0.8B-Base desarrollado por Alibaba Cloud, publicado por el usuario CrowdMind en Hugging Face. Se trata de un modelo causal de lenguaje con codificador de visión, diseñado para tareas de procesamiento de texto e imagen, y orientado a fine-tuning, experimentos de in-context learning e investigación, más que a interacción directa. El modelo base integra una arquitectura híbrida eficiente que combina Gated Delta Networks con atención sparse Mixture-of-Experts, logrando un equilibrio entre rendimiento y coste computacional.

Con 852,9 millones de parámetros totales, una ventana de contexto nativa de 262 144 tokens (extensible hasta 1 010 000) y soporte para 201 idiomas, este modelo destaca por su capacidad multimodal unificada y su aptitud para despliegue en entornos con recursos limitados. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas. La relevancia actual radica en su tamaño compacto combinado con capacidades avanzadas de visión-lenguaje, razonamiento y generación de código, lo que lo convierte en una opción atractiva para aplicaciones edge y móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida: Gated DeltaNet + Gated Attention + FFN (con componentes sparse MoE) |
| Parametros totales | 852 985 920 |
| Parametros activos | No especificado (no se indica si es MoE activo en este tamaño) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 010 000 |
| Tipos de cuantizacion | No especificado en el repo; compatible con GGUF (Unsloth Dynamic 2.0) y formatos estándar de Transformers |
| Idiomas soportados | 201 idiomas y dialectos (según model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponible en otros formatos vía Unsloth) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida que combina capas de Gated DeltaNet (atención lineal con 16 cabezas para V y 16 para QK, dimensión de cabeza 128) con capas de atención tradicional (8 cabezas Q y 2 cabezas KV, dimensión 256, RoPE de 64 dimensiones). El layout es de 6 bloques, cada uno con 3 sub-bloques de (Gated DeltaNet → FFN) seguidos de 1 sub-bloque de (Gated Attention → FFN), totalizando 24 capas. La dimensión oculta es 1024 y el FFN tiene dimensión intermedia 3584. El embedding de tokens es de 248 320 (padded) y está atado a la salida LM. Se entrena con multi-token prediction (MTP).

El entrenamiento incluye una fase de pre-entrenamiento y post-entrenamiento, con fusión temprana de tokens multimodales (imagen, texto, vídeo) que logra paridad con Qwen3 y supera a Qwen3-VL en razonamiento, código, agentes y comprensión visual. Además, se aplicó RL escalado en entornos multi-agente y una expansión a 201 idiomas. La infraestructura de entrenamiento alcanza casi un 100 % de eficiencia multimodal comparada con entrenamiento solo de texto.

## Capacidades

- Generación de texto y razonamiento: modelo causal de lenguaje con capacidades de razonamiento avanzadas, aunque al ser versión base no está alineado para conversación directa.
- Comprensión y generación multimodal: procesa imágenes, texto y vídeo gracias a su codificador de visión y fusión temprana de tokens multimodales.
- Generación de código: soporta tareas de programación y razonamiento lógico, según los benchmarks del modelo base.
- Soporte para agentes: entrenado con RL en entornos multi-agente, lo que facilita su uso en pipelines de agentes autónomos.
- Multilingüismo: cobertura de 201 idiomas y dialectos, con comprensión cultural y regional matizada.
- Contexto largo: ventana de 262 144 tokens nativa, ampliable hasta más de 1 millón, adecuada para documentos extensos o conversaciones de muchos turnos.
- Fine-tuning eficiente: los tokens de control (`<|im_start|>` y `<|im_end|>`) están entrenados para permitir LoRA-style PEFT sin necesidad de re-entrenar embeddings.

## Casos de uso

- Despliegue en dispositivos edge y móviles: con ~1,6 GB de VRAM a precisión completa y cuantización de 4 bits que cabe en un teléfono, es ideal para asistentes locales, traducción offline o análisis de imágenes en tiempo real.
- Fine-tuning para tareas específicas de visión-lenguaje: por ser un modelo base, se puede adaptar con LoRA o PEFT para clasificación de imágenes, respuesta visual a preguntas o generación de descripciones.
- Procesamiento de documentos largos: su contexto de 262K tokens permite resumir, extraer información o responder preguntas sobre informes extensos, contratos o libros completos.
- Desarrollo de agentes conversacionales: con su entrenamiento en RL multi-agente y soporte para tool calling (implícito en la familia Qwen3.5), puede integrarse en sistemas de automatización de tareas.
- Generación de código en entornos con recursos limitados: su tamaño compacto permite ejecutarlo en servidores de baja gama o en CI/CD para asistencia de programación.
- Investigación académica en multimodalidad: sirve como base para estudiar arquitecturas híbridas, eficiencia de atención lineal y aprendizaje por refuerzo a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el fine-tuning de CrowdMind. Los datos del modelo base Qwen3.5-0.8B (según fuentes web) incluyen:

| Benchmark | Resultado |
|---|---|
| MathVista | 62.2 |
| OCRBench | 74.5 |

Estos valores corresponden al modelo base y pueden variar tras el fine-tuning. No se dispone de comparaciones formales con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,6 GB a precisión completa (FP16) según fuentes web; con cuantización de 4 bits, puede funcionar en dispositivos con menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o GPUs integradas modernas). Para entrenamiento, se recomienda al menos 8 GB de VRAM.
- Compatible con consumer GPU: sí, especialmente con cuantización GGUF (Unsloth Dynamic 2.0) o AWQ.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, Ollama (disponible en su biblioteca), llama.cpp y Unsloth para fine-tuning eficiente.
- Latencia y throughput: no disponibles en la información proporcionada; se espera baja latencia en dispositivos edge dado el tamaño compacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Base (este) | 852,9 M | 262K (ext. 1M) | 201 | Apache 2.0 | Multimodal, arquitectura híbrida |
| Qwen3-0.8B | ~800 M | 32K | ~30 | Apache 2.0 | Solo texto, sin visión |
| Llama 3.2 1B | 1,23 B | 128K | 8 | Llama 3.2 | Solo texto, sin visión |
| SmolLM2 1.7B | 1,7 B | 8K | ~30 | Apache 2.0 | Solo texto, menos eficiente |

El modelo de CrowdMind se diferencia por su multimodalidad y contexto extremadamente largo, a pesar de tener menos parámetros que alternativas como Llama 3.2 1B. No se han encontrado comparativas directas con otros modelos de 0.8B en la información disponible.

## Limitaciones y advertencias

- Al ser una versión base (pre-trained only), no está alineado para conversación directa ni instrucciones; requiere fine-tuning o in-context learning para tareas específicas.
- Posibles sesgos en los datos de entrenamiento, especialmente en idiomas de baja representación dentro de los 201 soportados.
- Riesgo de alucinación en tareas de generación libre, particularmente en dominios especializados.
- El contexto de 1M tokens es una extensión post-entrenamiento; el rendimiento puede degradarse en los extremos de esa longitud.
- No se especifican los datos de fine-tuning de CrowdMind; el rendimiento real puede diferir del modelo base.
- Aunque la licencia Apache 2.0 permite uso comercial, se recomienda verificar los términos del modelo base original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CrowdMind/Qwen3.5-0.8B-Base
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Página en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Documentación de Unsloth Dynamic 2.0: https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf
