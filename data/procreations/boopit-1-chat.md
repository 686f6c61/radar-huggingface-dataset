# ProCreations/boopit-1-chat

## Resumen

Boopit 1 Chat es un modelo de lenguaje conversacional de tamaño reducido, desarrollado por ProCreations como fine-tune del modelo base ProCreations/boopit-1. Se trata de un transformer con pesos ternarios de 1.58 bits (arquitectura BitNet), con 28 millones de parámetros y una ventana de contexto de 4096 tokens. El fine-tune se realizó mediante supervisión directa (SFT) sobre el dataset de diálogos de Discord `mookiezi/Discord-Dialogues`, con un total de 200.000.215 tokens de asistente y 383.910 pasos de entrenamiento en una NVIDIA RTX PRO 6000 Blackwell.

La relevancia de este modelo radica en su extrema ligereza: los pesos empaquetados ocupan menos de 7 MB, lo que lo hace apto para entornos con recursos muy limitados, como dispositivos edge o prototipos rápidos. Aunque su capacidad es modesta por su tamaño, demuestra la viabilidad de la cuantización ternaria en tareas de chat. El modelo está pensado para generación de texto en inglés y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (BitNet, 1.58-bit) |
| Parametros totales | 28 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Ternario nativo (1.58-bit) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (formato de archivo no especificado; repo sin archivos visibles) |

## Arquitectura y entrenamiento

El modelo base `boopit-1` emplea una arquitectura transformer con cuantización ternaria de 1.58 bits, una variante de BitNet que representa cada peso con valores en {-1, 0, 1}. Esta aproximación reduce drásticamente el uso de memoria y cómputo en comparación con modelos de precisión completa, manteniendo una calidad razonable para tareas de generación de texto. El contexto es de 4096 tokens, suficiente para conversaciones de longitud media.

El fine-tune de chat se realizó mediante SFT sobre el dataset `mookiezi/Discord-Dialogues`, que contiene diálogos extraídos de Discord. Se procesaron 200.000.215 tokens de asistente en 383.910 pasos, utilizando una NVIDIA RTX PRO 6000 Blackwell. El prompt de inferencia sigue el formato `<bos> your message <sep>`, y la generación termina al encontrar `<eos>`. No se menciona el uso de RLHF ni DPO; el entrenamiento es exclusivamente supervisado. El dataset `openbmb/Ultra-FineWeb-L1` aparece en las etiquetas, pero no se especifica si se usó en el preentrenamiento del base o en el fine-tune; probablemente forma parte del entrenamiento del modelo base.

## Capacidades

- Generación de texto conversacional: el modelo está optimizado para mantener diálogos multi-turno, respondiendo a mensajes del usuario en formato chat.
- Soporte de formato de prompt específico: requiere el prefijo `<bos>` y el separador `<sep>`, y finaliza con `<eos>`.
- Multilingüismo: únicamente inglés, según la etiqueta `language: en`.
- No se menciona soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito. Dado su tamaño, es probable que estas capacidades estén ausentes o sean muy limitadas.

## Casos de uso

- Chatbots ligeros para prototipado: al ocupar menos de 7 MB, se puede integrar en aplicaciones de demostración o pruebas de concepto sin necesidad de infraestructura potente. Por ejemplo, un bot de Discord o Telegram que responda con frases cortas.
- Experimentación académica con cuantización ternaria: sirve como referencia para estudiar el comportamiento de modelos BitNet en tareas conversacionales, comparando calidad frente a modelos de precisión completa.
- Asistentes en dispositivos edge: su bajo consumo de memoria permite ejecutarlo en microcontroladores o Raspberry Pi, siempre que se adapte el formato de pesos a un runtime compatible (aunque no se especifica soporte para llama.cpp u otros).
- Generación de respuestas automáticas en entornos con restricciones de ancho de banda: al ser tan pequeño, puede desplegarse en entornos con limitaciones de almacenamiento o red.
- Fine-tuning adicional sobre dominios específicos: al ser un modelo base de chat, se puede seguir entrenando con datasets propios para adaptarlo a tareas concretas, como atención al cliente en inglés.
- Educación y divulgación: útil para enseñar conceptos de modelos de lenguaje pequeños y cuantización extrema en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se proporcionan comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 28M de parámetros con pesos ternarios, la huella de memoria es inferior a 7 MB en formato empaquetado. En inferencia, incluso con overhead de runtime, cabría en cualquier GPU con al menos 1 GB de VRAM, y también en CPU.
- GPU recomendadas: cualquier GPU moderna (incluso integradas) es suficiente. No se requieren GPUs de alta gama.
- Compatibilidad con consumer GPU: sí, cualquier GPU de consumo (por ejemplo, RTX 3060 o inferior) puede ejecutarlo sin problemas.
- Opciones de despliegue: no se especifican runtimes compatibles. Al ser un modelo PyTorch, podría usarse con la librería `transformers` si se adapta la arquitectura, pero no hay confirmación. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Dado el tamaño, la latencia debería ser de milisegundos en GPU, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de chat con pesos ternarios y ~28M de parámetros). No se puede realizar una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Capacidad limitada: con solo 28M de parámetros, el modelo tiene una comprensión y generación de lenguaje muy restringida. Es probable que produzca respuestas incoherentes o simplistas en temas complejos.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar información, especialmente en dominios fuera de su distribución de entrenamiento.
- Idioma: solo inglés; no soporta otros idiomas.
- Contexto limitado: 4096 tokens, suficiente para conversaciones cortas, pero insuficiente para documentos largos o historiales extensos.
- Formato de prompt rígido: requiere el uso de `<bos>` y `<sep>`, lo que puede complicar la integración en frameworks estándar de chat.
- Repositorio sin archivos visibles: el tamaño del repo es 0.0 GB, lo que sugiere que los pesos no están subidos o el modelo no está disponible para descarga directa. Esto limita su uso práctico hasta que se publiquen los archivos.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener la atribución y aviso de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/boopit-1-chat
- Modelo base: https://huggingface.co/ProCreations/boopit-1
- Post del autor sobre el cómputo utilizado: https://huggingface.co/posts/ProCreations/855858308074329
- Dataset de fine-tune: https://huggingface.co/datasets/mookiezi/Discord-Dialogues
- Dataset mencionado en tags: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L1
