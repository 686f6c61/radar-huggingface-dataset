# Sky-Kim/functiongemma-270m-finetune

## Resumen

FunctionGemma 270M fine-tune es un modelo de lenguaje pequeño (SLM) derivado de `google/functiongemma-270m-it`, una versión especializada del Gemma 3 270M de Google entrenada para function calling. El autor, Sky-Kim, ha aplicado un fine-tune con LoRA (r=16) sobre este base para adaptarlo a un escenario concreto de asistente doméstico inteligente bilingüe (coreano e inglés), y ha exportado el resultado a un único grafo ONNX ejecutable en Unity Sentis 2.6 para inferencia en dispositivos. El repositorio incluye el dataset generado, los scripts de entrenamiento y exportación, y el modelo fusionado, lo que lo convierte en una receta reproducible de principio a fin.

El modelo resuelve el problema de traducir lenguaje natural a llamadas de función estructuradas (por ejemplo, `turn_on_light{room:"거실", brightness:30}`) en entornos con recursos limitados, sin depender de la nube. Su relevancia radica en demostrar un pipeline completo de fine-tune + exportación on-device para un caso de uso práctico, aprovechando la eficiencia del base de 270M parámetros y su formato nativo de salida de llamadas a herramientas. El contexto efectivo se ve limitado por la ventana deslizante de 512 tokens del base, aunque el modelo original soporta 128k.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), 18 capas, atención multi-query (MQA), head_dim 256, vocab 262144, sliding window 512 |
| Parametros totales | 270M (base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (ventana deslizante; contexto total del base no especificado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors FP32 y ONNX FP32) |
| Idiomas soportados | Inglés (en), coreano (ko) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors, ONNX (grafo único para Unity Sentis) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 de 270M parámetros, con 18 capas, atención multi-query (MQA) y un head dimension de 256. El vocabulario es de 262144 tokens. La atención usa una ventana deslizante de 512 tokens en la mayoría de las capas, lo que obliga a gestionar una máscara de atención especial (`mask_sliding`) en la exportación ONNX.

El entrenamiento consiste en un fine-tune con LoRA (r=16) sobre el checkpoint `google/functiongemma-270m-it`, utilizando un dataset generado de 4.091 filas (3.764 para entrenamiento y 327 para validación) en inglés y coreano. Los ejemplos incluyen llamadas simples, múltiples (hasta triple intent) y casos de rechazo (refusals). El método es SFT con solo completions (completion-only). Tras el entrenamiento, el adaptador LoRA se fusiona en el modelo completo. La exportación a ONNX incluye una cirugía específica para Sentis (pesos inline, sustitución de GELU por tanh, caché KV como I/O del grafo) y finaliza con una compuerta de paridad ORT que verifica que el grafo exportado reproduce las llamadas esperadas.

## Capacidades

- Function calling nativo en el formato de FunctionGemma: `<start_function_call>call:tool{args}<end_function_call>`, con soporte para múltiples llamadas encadenadas.
- Bilingüe inglés/coreano, con capacidad de generar argumentos en coreano (por ejemplo, nombres de habitaciones).
- Reconoce 16 herramientas de domótica: luces (encender, apagar, color, brillo), TV, ordenador, aspiradora, música, volumen, ubicación, tiempo, búsqueda web.
- Maneja intenciones múltiples (hasta triple llamada en una sola respuesta).
- Implementa rechazo (refusal) para chit-chat, dispositivos no soportados y cambios relativos sin número, dejando que un router posterior escale.
- Exportable a ONNX para inferencia en dispositivos con Unity Sentis.
- Compatible con la API de transformers de Hugging Face (`AutoModelForCausalLM`).

## Casos de uso

- Asistente de voz para hogar inteligente en coreano o inglés: el modelo interpreta comandos como «거실 불 30퍼센트로 켜줘» y genera la llamada `turn_on_light{brightness:30, room:거실}` de forma directa, sin servidor.
- Automatización de tareas domésticas con múltiples dispositivos: dado un comando que involucra varias acciones (encender luces y música), produce varias llamadas encadenadas en una sola salida.
- Integración en aplicaciones Unity para realidad mixta o juegos: el grafo ONNX puede ejecutarse localmente en Sentis, permitiendo control por voz de objetos virtuales.
- Prototipado rápido de agentes locales privados: al ser un modelo pequeño, puede ejecutarse en CPU o GPU de baja gama, manteniendo los datos del usuario en el dispositivo.
- Enrutamiento de intenciones en pipelines de IA: el modelo actúa como primer paso para extraer llamadas a herramientas; un sistema posterior valida y ejecuta las acciones.
- Educación e investigación en fine-tune de SLMs: el repositorio incluye scripts reproducibles (generación de dataset, LoRA, fusión, exportación ONNX) que sirven como plantilla para otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este fine-tune específico en la información disponible. El modelo base FunctionGemma (Google) reporta una mejora de precisión del 47% tras fine-tuning en el dataset «Mobile Actions», pero ese dato no corresponde directamente a este adaptador. No hay cifras de MMLU, HumanEval ni otros tests estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP32, el modelo de 270M requiere aproximadamente 1 GB de memoria; en FP16, unos 0.5 GB. Con cuantización a 4 bits (no disponible en el repo) podría bajar a ~0.2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o integradas modernas). También funciona en CPU (Apple MPS, x86) según el autor.
- Cabe en GPUs de consumo y en dispositivos móviles/edge, dado el tamaño del grafo ONNX (~1 GB).
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, Unity Sentis 2.6 (vía `com.unity.ai.inference`).
- Latencia y throughput: no disponibles; al ser un modelo de 270M, la generación de una llamada típica (64 tokens máx.) debería ser de decenas de milisegundos en GPU y cientos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Especialización |
|---|---|---|---|---|---|---|
| Sky-Kim/functiongemma-270m-finetune | 270M | 512 (sliding) | en, ko | Gemma | safetensors, ONNX | Function calling domótico bilingüe |
| google/functiongemma-270m-it | 270M | 128k | en (principal) | Gemma | safetensors | Function calling genérico |
| Qwen2.5-0.5B-Instruct | 500M | 32k | multilingüe | Apache 2.0 | safetensors, GGUF | Instruct general, con tool calling limitado |

La comparativa es orientativa; no hay benchmarks comunes publicados entre estos modelos. FunctionGemma base ofrece mayor contexto (128k) y es multilingüe en menor medida, mientras que el fine-tune de Sky-Kim sacrifica contexto (512) y lenguajes (solo en/ko) a cambio de una salida optimizada para domótica y una ruta de exportación on-device lista para Unity.

## Limitaciones y advertencias

- Modelo pequeño (270M): puede alucinar llamadas a funciones; el propio autor recomienda poner un validador de esquema/whitelist entre la salida del modelo y la ejecución.
- Ventana deslizante de 512 tokens: si el prefijo supera esa longitud, la generación colapsa si no se construye correctamente la máscara `mask_sliding`. Es crítico en producción.
- Solo soporta inglés y coreano; no cubre otros idiomas.
- Dominio limitado a las 16 herramientas definidas; cualquier dispositivo o acción fuera de ese conjunto se rechaza.
- Licencia Gemma Terms of Use: permite uso comercial, pero con restricciones de atribución y prohibición de uso para ciertos fines (según los términos de Google).
- El dataset de entrenamiento es sintético y generado por el autor; puede no reflejar la diversidad de comandos reales.
- No se proporcionan cuantizaciones listas para usar (GGUF, AWQ, etc.); la exportación ONNX está pensada para Sentis y puede no ser directamente compatible con otros runtimes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sky-Kim/functiongemma-270m-finetune
- Modelo base en HuggingFace: https://huggingface.co/google/functiongemma-270m-it
- Documentación oficial de FunctionGemma (Google AI): https://ai.google.dev/gemma/docs/functiongemma
- Página de FunctionGemma en Google DeepMind: https://deepmind.google/models/gemma/functiongemma/
- Gemma Cookbook (sección FunctionGemma): https://deepwiki.com/google-gemini/gemma-cookbook/3.3-functiongemma-(function-calling)
- Proyecto similar en GitHub (blumfontein/functiongemma): https://github.com/blumfontein/functiongemma
