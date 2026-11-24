# FLCgeigeigei/tinyvision-vlm

## Resumen
TinyVision es un modelo de vision-lenguaje (VLM) de tipo minimalista desarrollado por el usuario FLCgeigeigei, pensado como proyecto didáctico y reproducible de extremo a extremo. Combina un codificador visual SigLIP 2 congelado (google/siglip2-base-patch32-256) con un modelo de lenguaje de arquitectura estilo Llama, inicializado a partir de los pesos SFT de FLCgeigeigei/flcmind. El conjunto se publica en dos variantes: una densa de 65,09 M de parámetros de lenguaje y una MoE de 199,60 M totales con 65,12 M activados por token (4 expertos, enrutamiento Top-1).

El modelo resuelve la tarea de image-text-to-text (descripción de imágenes, conversación multimodal) con un vocabulario personalizado de solo 6.400 tokens y un máximo de 64 tokens visuales por imagen (entrada de 256×256 con parches de 32×32). Su relevancia radica en la simplicidad: arquitectura escrita a mano en PyTorch, pipeline completo de datos, preentrenamiento, ajuste fino, conversión y despliegue, y licencia Apache 2.0, lo que lo convierte en una base útil para experimentación y docencia más que para producción a gran escala.

El repositorio incluye los checkpoints SFT en formato Transformers, con las subcarpetas dense/ y moe/, el codificador visual compartido en vision_encoder/ y una implementación propia (vlm.py) que requiere trust_remote_code=True. Los idiomas declarados son chino (zh) e inglés (en).

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | VLM: codificador SigLIP 2 congelado + proyector MLP + LLM decoder-only estilo Llama (RMSNorm/RoPE/GQA/SwiGLU); variante MoE con 4 expertos y Top-1 |
| Parametros totales | 65.094.912 (variante densa, dato real de safetensors); variante MoE: 199,60 M totales |
| Parametros activos | 65,12 M por token en la variante MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se documenta carga en bf16 y fp32; no se listan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); requiere código propio vlm.py |

## Arquitectura y entrenamiento
TinyVision sigue un diseño modular clásico de VLM. El codificador visual es SigLIP 2 (google/siglip2-base-patch32-256), congelado, que procesa imágenes de 256×256 con parches de 32×32 y produce 64 tokens visuales por imagen. Un proyector compuesto por LayerNorm → Linear → GELU → Linear mapea esas características al espacio del modelo de lenguaje, de 768 dimensiones. Los tokens visuales sustituyen a los marcadores `<|image_pad|>` (exactamente 64 por imagen) antes de entrar en el decodificador.

El modelo de lenguaje es de arquitectura estilo Llama: 8 capas, hidden_size de 768, GQA con 8 cabezas de consulta y 4 de clave/valor, FFN SwiGLU (en la variante MoE, 4 expertos con enrutamiento Top-1) y tokenizador propio de 6.400 tokens con tokens especiales visuales. Los pesos de lenguaje se inicializan desde el SFT de FLCgeigeigei/flcmind. El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO; únicamente se referencia el dataset FLCgeigeigei/tinyvision-vlm-data. La variante MoE realiza un upcast interno a fp32 en la FFN y puede requerir carga en fp32 si aparecen logits NaN.

## Capacidades
- Generación de texto e image-text-to-text: descripción de imágenes y respuesta conversacional multimodal.
- Descripción de escenas, objetos y atributos básicos (ejemplos cualitativos con barcos, caballos, montañas y aves).
- Conversación multi-turno mediante plantilla de chat (chat_template.jinja) aplicada con `tokenizer.apply_chat_template`.
- Soporte bilingüe chino-inglés.
- Integración con Transformers mediante `AutoModelForCausalLM` y `trust_remote_code=True`.
- Dos variantes intercambiables (densa y MoE) con la misma interfaz de carga.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de alta resolución, audio ni modo thinking.

## Casos de uso
- Docencia y reproducción de pipelines VLM: el repositorio ofrece el ciclo completo datos → preentrenamiento → SFT → conversión → despliegue, útil para cursos y laboratorios donde se quiera entender cada componente sin capas de abstracción.
- Prototipado rápido de captioning de imágenes: con 64 tokens visuales por imagen y una entrada de 256×256, se puede generar una descripción en una sola pasada en GPU de gama baja o incluso CPU con la variante densa.
- Experimentación con arquitecturas MoE a pequeña escala: la variante de 199,60 M totales y 65,12 M activos permite estudiar enrutamiento Top-1 y balanceo de expertos sin grandes recursos.
- Investigación sobre tokenizadores reducidos: el vocabulario de 6.400 tokens facilita analizar el impacto del tamaño del vocabulario en modelos multimodales pequeños.
- Asistentes de accesibilidad offline: generación de descripciones de imágenes en dispositivos con recursos limitados, usando la variante densa en bf16.
- Evaluación comparativa de codificadores visuales: al usar SigLIP 2 congelado, sirve como banco de pruebas para medir cómo afecta el proyector y el LLM al rendimiento final.
- Base para ajuste fino en dominios concretos (por ejemplo, descripción de productos o imágenes médicas simples) partiendo de los checkpoints SFT publicados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye ejemplos cualitativos de salida (descripciones de imágenes) y advierte que no son resultados de benchmark y que pueden contener errores en objetos o atributos.

## Requisitos de hardware
- VRAM estimada para inferencia: la variante densa (65,09 M de parámetros de lenguaje) ocupa del orden de 0,13 GB en bf16 y 0,26 GB en fp32; la MoE (199,60 M totales) ronda 0,4 GB en bf16. A ello se suma el codificador SigLIP 2 congelado y el proyector.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos unos pocos GB de VRAM; no se requieren A100 ni H100. Una RTX 4090 o RTX 3090 es sobradamente suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante); la variante densa puede ejecutarse en CPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (único método documentado). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF publicados no es directamente compatible con llama.cpp.
- Latencia y throughput: no disponibles. El autor recomienda bf16 en CUDA y fp32 en CPU; para la MoE sugiere fp32 si aparecen NaN.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TinyVision (dense) | 65,09 M de lenguaje + SigLIP 2 | no disponible | Apache 2.0 | Hugging Face, código propio | Proyecto didáctico, bilingüe zh/en |
| TinyVision (MoE) | 199,60 M totales / 65,12 M activos | no disponible | Apache 2.0 | Hugging Face, código propio | 4 expertos, Top-1 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada modelos comparables de tamaño y propósito equivalentes |

## Limitaciones y advertencias
- Modelo de muy pequeño tamaño (65 M de parámetros de lenguaje): la calidad de las descripciones es limitada y los ejemplos de la model card muestran errores de atributos (por ejemplo, confusión de colores o detalles).
- Riesgo elevado de alucinación en objetos, relaciones espaciales y atributos finos de la imagen.
- Ventana de contexto no documentada; el uso de exactamente 64 tokens `<|image_pad|>` por imagen es obligatorio y no admite variaciones.
- Idiomas limitados a chino e inglés; no se garantiza un comportamiento correcto en castellano.
- Requiere `trust_remote_code=True` y revisión del código propio (vlm.py) antes de ejecutarlo en entornos de producción.
- El codificador visual no está incluido en los safetensors del LLM: hay que cargarlo por separado con `model.get_vision_model(...)`.
- La variante MoE puede producir NaN y necesita upcast a fp32 en la FFN o carga completa en fp32.
- No hay benchmarks publicados, por lo que no se puede avalar su rendimiento frente a alternativas.
- Aunque la licencia es Apache 2.0, el uso comercial en producción no está validado por el autor y el proyecto tiene un carácter claramente educativo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/FLCgeigeigei/tinyvision-vlm
- Código fuente y guía de reproducción: https://github.com/FLCgeigei/tinyvision
- Dataset de entrenamiento: https://huggingface.co/datasets/FLCgeigeigei/tinyvision-vlm-data
- Pesos base de lenguaje: https://huggingface.co/FLCgeigeigei/flcmind
- Codificador visual SigLIP 2: https://huggingface.co/google/siglip2-base-patch32-256
