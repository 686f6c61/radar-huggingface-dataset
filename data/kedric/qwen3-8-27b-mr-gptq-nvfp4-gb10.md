# kedric/Qwen3.8-27B-MR-GPTQ-NVFP4-GB10

## Resumen

Este repositorio contiene una cuantización NVFP4 del modelo multimodal Qwen3.8-27B de Qwen, preparada específicamente para el runtime `veloGB10` en sistemas NVIDIA GB10, como el DGX Spark. No se trata de un ajuste fino: los pesos del modelo original se reemplazan por una representación empaquetada NVFP4 (E2M1) con transformada Hadamard, optimizada mediante una variante de GPTQ con hessiana (MR-GPTQ). El resultado es un artefacto de 16,3 GB que conserva la arquitectura, el tokenizador, la torre de visión y la plantilla de chat del modelo base, e incluye además los pesos MTP (multi-token prediction) y las escalas de activación para modo W4A4 opcional.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 27B parámetros con contexto largo y capacidades de visión y razonamiento en hardware de escritorio de gama alta como el DGX Spark, aprovechando la memoria unificada de 128 GB. Sin embargo, la compatibilidad es estrictamente limitada: los archivos usan un diseño `nvfp4-pack-quantized` personalizado que no es cargable con Transformers, vLLM, llama.cpp ni cargadores GPTQ genéricos. Solo el runtime `veloGB10` en su rama `qwen3.8-next-flash` puede interpretar correctamente el empaquetado y las transformadas.

La licencia es Apache 2.0, heredada del modelo base, y los idiomas declarados en la model card son inglés y francés, aunque el modelo original de Qwen es multilingüe en la práctica. El autor advierte explícitamente de que la cuantización puede alterar las probabilidades y el comportamiento generativo, por lo que recomienda validar razonamiento, respuestas multilingües, contexto largo, visión, salidas estructuradas y tool calling antes de desplegar en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) con MTP, cuantizado NVFP4 |
| Parametros totales | 27B (modelo base Qwen3.8-27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K (modelo base); ejemplo de ejecución con `--max-seq-len 226114` |
| Tipos de cuantizacion | NVFP4 (E2M1), W4A16 por defecto, W4A4 opcional para prefill |
| Idiomas soportados | en, fr (según model card; el modelo base puede soportar más) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con empaquetado NVFP4 personalizado (`nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal denso de 27B parámetros que combina una torre de visión con un modelo de lenguaje, y ofrece modos de razonamiento (thinking) e instrucción. Incluye además pesos MTP para predicción multi-token, lo que acelera la decodificación especulativa. Esta cuantización no añade ni elimina capacidades: solo reemplaza los pesos con una representación NVFP4 empaquetada.

La receta de cuantización emplea MR-GPTQ (una variante de GPTQ con optimización hessiana) con formato de peso NVFP4/E2M1, transformada Hadamard de orden 16, calibración con 512 muestras de 2048 tokens, damping hessiano de 0,01, búsqueda de clip con 7 ratios, orden de activación estático y optimización de escala global por mínimos cuadrados alternados (4 iteraciones). Los grupos MR-GPTQ se aplican a atención, MLP, GDN y cabeza de lenguaje; los grupos RTN se usan para MTP y embeddings. Las escalas de activación W4A4 se fusionaron a partir de calibración de contexto principal y largo, con 496 escalas positivas finitas. La versión v4 no incluye el barrido de escala hessiana local que apareció posteriormente en `veloGB10`.

El autor indica que el drafter DFlash2 no se incluye y debe instalarse por separado si se desea decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento multimodal: el modelo base acepta entradas de imagen y texto, y puede generar respuestas en modo thinking o instruct.
- Razonamiento multi-step y agentic coding: según la documentación del modelo base, Qwen3.8-27B está orientado a tareas de codificación agente y uso de herramientas a largo plazo.
- Tool calling / function calling: soportado, aunque el autor advierte de una posible regresión de calidad si se activa la cuantización de activaciones en GDN (A4) durante tool calling.
- Capacidades multilingües: la model card declara inglés y francés, aunque el modelo base de Qwen suele cubrir más idiomas.
- Modo thinking: permite activar un modo de razonamiento explícito antes de responder.
- Visión: procesamiento de imágenes y vídeo (se incluyen los archivos de configuración del procesador de imagen y vídeo).
- MTP: predicción multi-token para decodificación más rápida, incluida en los pesos cuantizados.

## Casos de uso

- Inferencia local en DGX Spark: el caso principal. Con 16,3 GB de pesos empaquetados, el modelo cabe holgadamente en la memoria unificada de 128 GB del GB10, permitiendo ejecutar un modelo de 27B con contexto largo y visión en un equipo de escritorio.
- Desarrollo de agentes con tool calling: el modelo base está optimizado para uso de herramientas y razonamiento multi-paso. En un entorno GB10, se puede desplegar un agente que llame a funciones externas (APIs, bases de datos) manteniendo el contexto completo de la conversación.
- Asistente de codificación con contexto largo: gracias a la ventana de 256K, puede analizar repositorios completos o múltiples archivos fuente y generar código, refactorizaciones o explicaciones. El modo W4A16 conserva la calidad de activaciones en BF16.
- Procesamiento de documentos con imagen y texto: al ser multimodal, puede extraer información de capturas de pantalla, diagramas o documentos escaneados combinados con texto, útil para automatización de procesos o análisis de informes.
- Prototipado y evaluación de cuantización: para investigadores interesados en el impacto de NVFP4 con transformada Hadamard en modelos de 27B, este repositorio sirve como referencia de una receta concreta (MR-GPTQ, calibración, escalas) y permite comparar con otras cuantizaciones del mismo modelo base.
- Servicio de chat local con privacidad: al ejecutarse íntegramente en hardware local, se pueden desplegar asistentes conversacionales sin enviar datos a la nube, aprovechando el modo instruct y la plantilla de chat incluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una evaluación local de tool calling donde la configuración W4A4 `attn,mlp` completó la tarea sin errores y superó a la versión v5 correspondiente, pero aclara que no es un benchmark publicado ni reproducible de forma independiente, y que no se incluyen los prompts ni el informe completo. Para el modelo base Qwen3.8-27B, la documentación de terceros (Groq, Unsloth) indica capacidades de razonamiento, visión y codificación agente, pero no se proporcionan cifras concretas de MMLU, HumanEval u otros en los resultados de búsqueda disponibles.

## Requisitos de hardware

- Diseñado específicamente para NVIDIA GB10 (DGX Spark), con memoria unificada de 128 GB.
- Tamaño del repositorio: 16,3 GB de pesos empaquetados, más overhead de runtime y KV-cache. El ejemplo de ejecución usa `--max-seq-len 226114` con batch 1 y caché de prefijo activada.
- No se recomienda su uso en GPUs convencionales sin el runtime `veloGB10`, ya que el formato de pesos no es compatible con cargadores estándar.
- Para decodificación especulativa, se requiere instalar el drafter DFlash2 por separado.
- El modo W4A4 prefill es experimental y depende de kernels específicos del hardware; se recomienda usar W4A16 como línea base de compatibilidad.
- Opciones de despliegue: exclusivamente con `veloGB10` (rama `qwen3.8-next-flash`), mediante el binario `gb10_inference` con modo servidor en el puerto 9000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Compatibilidad | Licencia |
|---|---|---|---|---|---|
| kedric/Qwen3.8-27B-MR-GPTQ-NVFP4-GB10 | 27B | 256K | NVFP4 (W4A16/W4A4) | Solo veloGB10 | Apache 2.0 |
| TelperionAI/Qwen3.8-27B-NVFP4-AWQ-GPTQ | 27B | 256K | NVFP4 + AWQ + GPTQ | No especificada (probablemente estándar) | Apache 2.0 |
| RadixArk/Qwen3.8-27B-NVFP4 | 27B | 256K | NVFP4 | No especificada (probablemente estándar) | Apache 2.0 |
| Qwen/Qwen3.8-27B-FP8 | 27B | 256K | FP8 | vLLM Ascend (lectura directa) | Apache 2.0 |

No hay datos de rendimiento comparativo entre estas variantes en la información disponible. La diferencia clave de esta publicación es su formato de empaquetado propietario para GB10, que sacrifica compatibilidad a cambio de una integración optimizada con el runtime `veloGB10`.

## Limitaciones y advertencias

- Incompatibilidad total con cargadores estándar: Transformers, vLLM, llama.cpp y GPTQ genéricos no pueden cargar estos pesos; hacerlo producirá errores o salidas incorrectas. El widget de Hugging Face no funcionará.
- La cuantización no es entrenamiento de seguridad: no protege contra inyección de prompts por sí misma, y hereda los sesgos y limitaciones del modelo base.
- Riesgo de alucinación: la calibración mejora la cobertura numérica pero no garantiza corrección factual.
- El modo W4A4 prefill es experimental: el autor reporta una regresión visible de calidad en tool calling al activar la cuantización de activaciones en GDN. Se recomienda usar W4A16 como configuración estable.
- La longitud máxima de contexto configurada (226114 en el ejemplo) no garantiza que haya suficiente memoria KV-cache para esa longitud en todos los despliegues.
- No se incluye el drafter DFlash2; la decodificación especulativa requiere instalación adicional.
- Los benchmarks publicados son inexistentes: la evaluación local mencionada no es reproducible ni independiente.
- Idiomas declarados solo en, fr; aunque el modelo base pueda soportar más, esta cuantización no ha sido validada para otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kedric/Qwen3.8-27B-MR-GPTQ-NVFP4-GB10
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime veloGB10: https://github.com/kedric/veloGB10
- Documentación del modelo base en Groq: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Guía de ejecución local con Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Receta vLLM para Qwen3.8-27B-FP8: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Cuantización alternativa NVFP4-AWQ-GPTQ: https://huggingface.co/TelperionAI/Qwen3.8-27B-NVFP4-AWQ-GPTQ
- Cuantización alternativa NVFP4: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
