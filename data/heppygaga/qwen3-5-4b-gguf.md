# Heppygaga/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B es un modelo multimodal (texto e imagen) de la familia Qwen3.5 desarrollado por el equipo de Qwen (Alibaba), distribuido aquí en formato GGUF mediante cuantización dinámica de Unsloth. Se trata de la variante de 4 mil millones de parámetros de una generación que unifica visión y lenguaje mediante early fusion, combinando Gated Delta Networks (atención lineal) con sparse Mixture-of-Experts para lograr inferencia de alto rendimiento con baja latencia.

El modelo resuelve el problema de ejecutar localmente un modelo multimodal compacto con capacidades de razonamiento, código, agentes y comprensión visual, sin depender de infraestructura en la nube. Su contexto nativo de 262.144 tokens, extensible hasta 1.010.000, y su soporte de 201 idiomas lo hacen especialmente relevante para despliegues multilingües y de agentes en hardware de consumo.

La versión cuantizada (Heppygaga/Qwen3.5-4B-GGUF) conserva el modelo post-entrenado original con pesos en safetensors de 4.205.751.296 parámetros, y es compatible con llama.cpp, Ollama y otros runtimes que soportan GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con vision encoder; híbrido Gated DeltaNet + Gated Attention con sparse MoE |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1.010.000 |
| Tipos de cuantizacion | GGUF con Unsloth Dynamic 2.0 (niveles concretos no disponibles) |
| Idiomas soportados | 201 idiomas y dialectos (lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (base original en safetensors) |

## Arquitectura y entrenamiento

Qwen3.5-4B emplea una arquitectura híbrida con una disposición de capas de 8 bloques, cada uno compuesto por 3 módulos Gated DeltaNet seguidos de FFN y 1 módulo de Gated Attention seguido de FFN (32 capas en total). El Gated DeltaNet usa 32 cabezas lineales para V y 16 para QK con dimensión de cabeza 128, mientras que la Gated Attention usa 16 cabezas Q y 4 KV con dimensión 256 y RoPE de 64. La dimensión oculta es 2560, la FFN intermedia es de 9216 y el vocabulario es de 248.320 tokens (con embeddings atados a la salida). El modelo se entrenó con Multi-Token Prediction (MTP) multi-step.

El entrenamiento combinó pre-entrenamiento y post-entrenamiento con fusión temprana (early fusion) de tokens multimodales, alcanzando una eficiencia cercana al 100% frente al entrenamiento solo-texto. El post-entrenamiento incluyó aprendizaje por refuerzo escalado en entornos de millones de agentes con distribuciones de tareas progresivamente complejas. Los detalles sobre número de tokens de pre-entrenamiento y composición exacta del dataset no están disponibles.

## Capacidades

- Generación de texto y razonamiento general con paridad generacional respecto a Qwen3 y superación de Qwen3-VL en benchmarks de razonamiento, código y agentes.
- Comprensión visual multimodal (pipeline image-text-to-text) gracias al vision encoder integrado con early fusion.
- Capacidades de código y matemáticas, según los benchmarks de la familia Qwen3.5.
- Soporte de agentes y razonamiento multi-step, entrenado con RL a gran escala en entornos de agentes.
- Cobertura lingüística de 201 idiomas y dialectos, incluyendo comprensión cultural y regional.
- Contexto largo: 262.144 tokens nativos, ampliable a más de 1 millón.
- Entrenamiento con MTP (multi-token prediction), que favorece la decodificación especulativa y mayor throughput.
- Fine-tuning local posible con Unsloth.

## Casos de uso

- Chatbots multimodales locales: el modelo acepta imagen y texto en la misma conversación, ideal para asistentes que analizan capturas, documentos escaneados o fotos sin enviar datos a la nube.
- Atención al cliente multilingüe: con soporte de 201 idiomas y contexto de 262K tokens, puede gestionar conversaciones multi-turno largas y cambiar de idioma sin modelos adicionales.
- Asistentes de análisis documental: la ventana extensible a 1M tokens permite procesar contratos, informes o bases de código completas en una sola sesión.
- Agentes con tool calling: el entrenamiento con RL a escala de agentes lo hace adecuado para scaffolds de agentes que ejecutan tareas multi-step con herramientas externas.
- Generación y revisión de código en portátiles: con ~4B de parámetros cabe en GPUs de consumo, permitiendo autocompletado y refactorización offline.
- Descripción y clasificación de imágenes en el borde (edge): el pipeline image-text-to-text y el formato GGUF permiten desplegarlo en dispositivos con recursos limitados.
- Prototipado e investigación: la licencia Apache 2.0 y la compatibilidad con fine-tuning mediante Unsloth facilitan la adaptación a dominios específicos sin restricciones comerciales.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de la familia Qwen3.5 frente a GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking y Qwen3-30BA3B-Thinking-2507 en benchmarks como MMLU-Pro (categoría Knowledge & STEM), pero los valores numéricos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks con cifras concretas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; para un modelo de 4B en GGUF, variantes cuantizadas de 4-8 bits suelen requerir entre ~2,5 GB y ~5 GB de VRAM (estimación, no dato oficial).
- GPUs recomendadas: no disponible; por tamaño, debería funcionar en GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 Ti o superiores.
- Cabe en consumer GPU: sí, dado el tamaño de 4B, en la mayoría de GPUs modernas con 8 GB o más de VRAM según el nivel de cuantización elegido.
- Opciones de despliegue: llama.cpp y Ollama (formato GGUF); el modelo base también es compatible con vLLM, SGLang, KTransformers y Hugging Face Transformers.
- Latencia y throughput: no disponibles; la arquitectura híbrida con Gated DeltaNet y MTP está diseñada para alto throughput y baja latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B | 4,2B | 262K (hasta 1M) | Sí (imagen+texto) | Apache 2.0 |
| Qwen3.5-9B | 9B | no disponible | Sí | no disponible |
| GPT-OSS-20B | 20B | no disponible | no disponible | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE) | no disponible | no disponible | no disponible |

Qwen3.5-4B destaca por ser la opción más ligera y accesible del conjunto, con soporte multimodal nativo y licencia Apache 2.0, frente a alternativas mayores que requieren hardware más potente.

## Limitaciones y advertencias

- Los valores de benchmarks concretos no están disponibles en la información proporcionada, por lo que su rendimiento relativo debe verificarse con evaluaciones propias.
- Al ser una cuantización de terceros (Heppygaga, vía Unsloth), la calidad puede variar respecto al modelo original según el nivel de cuantización empleado; el repositorio no detalla los niveles incluidos.
- Como todo LLM, presenta riesgo de alucinación, especialmente en datos fácticos y cálculos; no se documentan sesgos específicos.
- La lista de los 201 idiomas soportados no está detallada; el rendimiento en idiomas de bajos recursos puede ser inferior.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes.
- El tamaño del repositorio (71,3 GB) sugiere que incluye múltiples cuantizaciones o archivos adicionales; conviene descargar solo la variante necesaria.
- No hay información sobre soporte explícito de tool calling en el formato GGUF; verificar compatibilidad con el runtime elegido.

## Enlaces

- Modelo cuantizado: https://huggingface.co/Heppygaga/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Guía de fine-tuning de Qwen3.5 con Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Qwen Chat (demo): https://chat.qwen.ai
