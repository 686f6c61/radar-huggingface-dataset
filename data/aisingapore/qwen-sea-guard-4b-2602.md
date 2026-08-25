# aisingapore/Qwen-SEA-Guard-4B-2602

## Resumen

Qwen-SEA-Guard-4B-2602 es un modelo de moderación y seguridad desarrollado por el AI Products Pillar de AI Singapore, perteneciente a la familia SEA-Guard. Se trata de un modelo de clasificación binaria de contenido (devuelve "safe" o "unsafe") construido mediante fine-tuning del modelo base aisingapore/Qwen-SEA-LION-v4-4B-VL, que a su vez deriva de la arquitectura Qwen3-VL. Su propósito principal es actuar como guardrail cultural para el sudeste asiático, detectando contenido sensible o perjudicial en un contexto regional específico.

El modelo ha sido entrenado con 1 millón de pares de instrucciones y soporta entrada de texto e imagen, lo que permite clasificar tanto prompts de usuario como respuestas de asistentes de IA en escenarios multimodales. Su ventana de contexto es de 128 000 tokens y cubre ocho idiomas del sudeste asiático, además del inglés. Su relevancia actual radica en que ofrece una alternativa de moderación entrenada específicamente para las sensibilidades culturales de la región, frente a los clasificadores genéricos desarrollados en contextos occidentales.

La licencia declarada en la model card es Apache-2.0, aunque el tag del repositorio en Hugging Face indica "other". El modelo está disponible en formato safetensors y es compatible con vLLM para inferencia rápida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder Transformer (derivada de Qwen3-VL) |
| Parámetros totales | 4 mil millones (según nombre del modelo; dato exacto no disponible) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens |
| Tipos de cuantización | No disponibles (formato oficial safetensors; existen conversiones GGUF de terceros) |
| Idiomas soportados | Birmano, inglés, indonesio, malayo, tagalo, tamil, tailandés y vietnamita |
| Licencia | Apache-2.0 (según model card; etiqueta de HF: "other") |
| Formato de pesos | Safetensors (también compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (full fine-tuning) del modelo aisingapore/Qwen-SEA-LION-v4-4B-VL, que a su vez se basa en la arquitectura Qwen3-VL. Se trata de un transformer decoder con capacidad multimodal (texto e imagen) y un tokenizador heredado de Qwen3-VL. El entrenamiento se realizó sobre 1 millón de pares de instrucciones diseñados específicamente para la clasificación de seguridad en contextos culturales del sudeste asiático.

El dataset y la metodología de entrenamiento se describen en el paper SEA-Guard (arXiv:2602.01618). No se detalla en la información disponible si se utilizaron técnicas de RLHF o DPO; la model card indica únicamente que es un fine-tuning supervisado (SFT) completo. El modelo no incluye mecanismos de decodificación especulativa ni atención lineal, pero hereda las capacidades multimodales de Qwen3-VL, lo que le permite procesar imágenes junto con texto.

## Capacidades

- Clasificación binaria de seguridad: devuelve exclusivamente "safe" o "unsafe" para cada entrada.
- Clasificación de prompts de usuario y respuestas de asistentes IA por separado.
- Soporte multimodal: acepta imágenes junto con texto para clasificación de seguridad visual.
- Multilingüe para el sudeste Asiático: birmano, indonesio, malayo, tagalog, tamil, tailandés, vietnamita e inglés.
- Contexto largo de 128 000 tokens, útil para moderar conversaciones extensas o documentos.
- Compatible con vLLM para inferencia rápida y desplegable en pipelines de moderación.
- No requiere fine-tuning adicional ni in-context learning para su uso directo.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede clasificar publicaciones, comentarios o mensajes en los idiomas del sudeste Asiático, marcando automáticamente contenido potencialmente dañino o culturalmente sensible antes de su publicación.
- Filtrado de prompts en aplicaciones de IA generativa: integrado como guardrail previo al modelo generativo, detecta consultas peligrosas o inapropiadas en tiempo real, reduciendo el riesgo de respuestas nocivas.
- Auditoría de respuestas de asistentes virtuales: dado un prompt y la respuesta de un asistente, el modelo clasifica si la respuesta es segura o insegura, útil para evaluar la calidad de sistemas de chat desplegados en la región.
- Moderación de imágenes en entornos de comercio electrónico: gracias a su entrada visual, puede clasificar imágenes de productos o contenidos generados por usuarios que puedan violar políticas regionales.
- Filtrado de contenido en herramientas de educación en línea: para plataformas educativas que operan en múltiples idiomas del sudeste Asiático, ayuda a detectar material inapropiado en foros o materiales subidos por usuarios.
- Evaluación de seguridad de modelos de IA en producción: sirve como benchmark de seguridad para comparar otros modelos generativos en contextos culturales del sudeste Asiático, integrándose en pipelines de CI/CD de evaluación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index de la model card aparece vacío (results: []), por lo que no se dispone de datos oficiales de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de seguridad. La documentación menciona que SEA-Guard supera a los clasificadores existentes en detección de contenido sensible regional, pero no se aportan cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 4 mil millones de parámetros en bfloat16, se estiman entre 8 y 10 GB de VRAM para inferencia sin cuantización. Con cuantización GGUF de 4 bits, podría funcionar con 4-6 GB.
- GPU recomendadas: tarjetas de consumo como RTX 3090, RTX 4090 (24 GB) o superiores; también válidas GPU profesionales como A10G o A100. No se dispone de datos oficiales de VRAM específica.
- Compatibilidad con GPUs de consumo: sí, el tamaño de 4B permite su ejecución en GPUs de 16 GB y, con cuantización, en GPUs de 8 GB.
- Opciones de despliegue: vLLM (soporte oficial según la model card), Transformers con `device_map="auto"`, y conversiones GGUF de terceros para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información oficial.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos con otros modelos de moderación en la información proporcionada. Sin embargo, se puede situar en el contexto de clasificadores de seguridad como Llama Guard 2/3 (Meta) o ShieldGemma (Google). La diferencia principal es el enfoque regional: SEA-Guard está entrenado específicamente para los idiomas y sensibilidades culturales del sudeste Asiático, mientras que los otros modelos están orientados a contextos occidentales o genéricos. No hay datos de rendimiento comparativo disponibles en la información actual.

## Limitaciones y advertencias

- Riesgo de alucinación: la model card advierte que el modelo puede generar texto sin sustento o irrelevante, aunque su salida está restringida a "safe" o "unsafe".
- No es una determinación absoluta: la clasificación no debe tratarse como una verdad definitiva; se recomienda supervisión humana y verificación secundaria.
- Sesgo cultural limitado: está diseñado específicamente para el sudeste Asiático, por lo que puede no ser adecuado para otras regiones o contextos culturales.
- Limitación de idiomas: no cubre otros idiomas fuera de los nueve mencionados; su uso fuera de estos idiomas podría degradar la precisión.
- Licencia: aunque la model card declara Apache-2.0, la tag del repositorio en Hugging Face indica "other", lo que puede generar ambigüedad legal para uso comercial. Se recomienda verificar los términos exactos de licencia antes de desplegar en producción.
- Dependencia del modelo base: al ser un fine-tuning de Qwen3-VL, hereda las limitaciones de este modelo, incluyendo posibles sesgos en el contenido de entrenamiento original.

## Enlaces

- HuggingFace: [aisingapore/Qwen-SEA-Guard-4B-2602](https://huggingface.co/aisingapore/Qwen-SEA-Guard-4B-2602)
- Paper SEA-Guard: [arXiv:2602.01618](https://arxiv.org/abs/2602.01618)
- Referencia al modelo base: [aisingapore/Qwen-SEA-LION-v4-4B-VL](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-4B-VL)
- Documentación SEA-Guard: [docs.sea-lion.ai/models/sea-guard](https://docs.sea-lion.ai/models/sea-guard)
- Repositorio de la colección SEA-Guard: [aisingapore/sea-guard](https://huggingface.co/collections/aisingapore/sea-guard)
- Conversión GGUF de terceros: [local-ai-zone.github.io/models/qwen-sea-guard-4b-2602](https://local-ai-zone.github.io/models/qwen-sea-guard-4b-2602.html)
