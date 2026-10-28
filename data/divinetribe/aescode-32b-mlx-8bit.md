# divinetribe/AesCode-32B-MLX-8bit

## Resumen

AesCode-32B-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo microsoft/AesCode-32B, publicada por el usuario divinetribe para ejecutarse en Apple Silicon. El modelo original lo desarrolla el equipo AesCode de Microsoft y es un finetune de Qwen3-VL-32B-Instruct orientado a una tarea muy concreta: recibir una captura de pantalla y generar el HTML y el CSS editables que la reproducen (presentaciones, carteles, dashboards, páginas de producto, infografías). Esta build concreta mantiene la torre de visión en bfloat16 mientras cuantiza solo la torre de lenguaje a 8 bits, de modo que la ruta de imagen conserva la calidad del modelo completo.

La relevancia de esta ficha es doble. Por un lado, demuestra que es posible ejecutar un modelo multimodal de ~33.000 millones de parámetros de forma local y privada en un Mac con chip de la serie M, sin APIs ni telemetría. Por otro, documenta un patrón de cuantización selectiva (cuantizar el decoder, preservar el encoder visual) que se está volviendo habitual para no degradar tareas dependientes de la percepción. El resultado es un checkpoint de aproximadamente 34 GB en disco que ocupa cerca de la mitad que la variante bf16.

Arquitectónicamente es un transformer multimodal denso con arquitectura Qwen3VLForConditionalGeneration (torre de visión seguida de torre de lenguaje), heredado del backbone Qwen3-VL-32B-Instruct. La model card no detalla la longitud de contexto efectiva de este checkpoint; el dato debe contrastarse con la documentación oficial del modelo base antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3VLForConditionalGeneration (torre de visión + torre de lenguaje densa) |
| Parametros totales | 33.357.390.064 (~33,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | 8 bits en la torre de lenguaje, bf16 en la torre de visión; la familia incluye variantes bf16 y 4 bits |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`, runtime `mlx-vlm`) |

## Arquitectura y entrenamiento

El modelo es un `Qwen3VLForConditionalGeneration`, es decir, un transformer multimodal con un encoder visual y un decoder de lenguaje autorregresivo acoplados. Parte de Qwen3-VL-32B-Instruct (Alibaba) y Microsoft lo especializa mediante un pipeline de supervised fine-tuning seguido de reinforcement learning con varias señales de recompensa, tal y como describe el paper "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (arXiv:2610.18860). El objetivo declarado es generar código estéticamente correcto y fiel a una referencia visual, no solo sintácticamente válido.

La innovación central del trabajo original es el uso de recompensas desacopladas entre modalidades: una señal evalúa el cumplimiento de reglas (estructura HTML/CSS correcta) y otra evalúa la calidad visual percibida. Esta build de divinetribe no reentrena nada; aplica cuantización de 8 bits a la torre de lenguaje y deja los 351 tensores `vision_tower.*` en bfloat16 para preservar la percepción. El autor reporta una verificación cualitativa: sobre una captura real de una página de producto, la versión de 8 bits identificó elementos on-page (H1, sellos de confianza, botón de compra) y generó alt-text utilizable, lo que sugiere que la cuantización no rompió la ruta visual.

## Capacidades

- Generación de código HTML y CSS editables a partir de una imagen de referencia (image-to-code).
- Reconstrucción de layouts: presentaciones, carteles, dashboards, informes, páginas de producto e infografías.
- Comprensión visual de capturas de pantalla: lectura de titulares, botones, sellos, precios y elementos de interfaz.
- Generación de alt-text y auditorías básicas de accesibilidad, SEO y marketing sobre una imagen.
- Conversación multimodal multi-turno (pipeline `image-text-to-text`).
- Capacidades heredadas del backbone Qwen3-VL-32B-Instruct en razonamiento visual y comprensión de documentos, aunque no se detallan en la información disponible.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en la información proporcionada.

## Casos de uso

- Reconstrucción de mockups a código: dado un diseño en PNG o una captura de Figma, generar un único archivo HTML con CSS inline listo para prototipar. El modelo está entrenado específicamente para esta tarea y conserva la torre visual en bf16, por lo que mantiene la fidelidad al layout de referencia.
- Generación de landing pages y páginas de producto: a partir de una captura de una ficha de producto, producir el HTML/CSS con titulares, sellos de confianza, valoraciones y CTA. La verificación publicada sobre una página real de e-commerce respalda este uso.
- Creación de dashboards e informes reproducibles: convertir una captura de un panel analítico en código editable, útil para wolfram de BI que necesitan pasar de una imagen estática a un componente web.
- Auditoría de accesibilidad y SEO sobre capturas: el modelo genera alt-text y detecta jerarquía de encabezados, útil como primer paso en revisiones de contenido antes de una auditoría formal.
- Prototipado rápido en local para equipos de diseño: al ejecutarse en Apple Silicon con `mlx-vlm`, permite iterar sobre capturas sin enviar material sensible a servicios en la nube.
- Educación y demos de IA multimodal: sirve para ilustrar en talleres cómo un modelo de ~33 B puede correr en un portátil con memoria unificada suficiente, manteniendo privacidad y sin dependencia de APIs.
- Preprocesado de documentación visual: extraer estructura y texto de capturas para alimentar pipelines de documentación técnica o bases de conocimiento.

## Benchmarks y rendimiento

Los datos disponibles provienen del paper y de la model card del modelo original (300 muestras de estilo infográfico, evaluadas en corrección de reglas y calidad visual). No existe un leaderboard público independiente que liste AesCode.

| Modelo (con imagen de referencia salvo indicación) | Overall | Visual |
|---|---|---|
| AesCode-32B | 85,89 | 77,44 |
| Claude Opus 4.8 (sin referencia) | 76,78 | no disponible |
| GPT-5.5 (sin referencia) | 76,31 | no disponible |
| Qwen3-VL-32B base (con referencia) | 61,10 | no disponible |

Estos números corresponden al modelo original, no a la cuantización de 8 bits. Para evaluaciones generales de visión del backbone, debe consultarse la documentación oficial de Qwen3-VL-32B-Instruct. No se han publicado resultados de benchmarks específicos para esta build MLX de 8 bits en la información disponible.

## Requisitos de hardware

- Peso en disco: aproximadamente 34 GB para esta build de 8 bits (frente a ~64 GB de la variante bf16 y ~17 GB de la de 4 bits).
- Memoria unificada estimada: al peso del modelo hay que sumar caché KV, overhead del runtime y margen para el sistema. Un Mac con 48 GB de memoria unificada es el mínimo razonable; 64 GB o más ofrece holgura para contextos largos e imágenes de alta resolución.
- GPU compatibles: chips de Apple Silicon de la serie M (M1/M2/M3/M4 en variantes Pro, Max y Ultra). No está pensado para GPU NVIDIA ni CUDA; el runtime es `mlx-vlm`.
- Cabe en hardware de consumo: sí, en Macs de gama alta con memoria unificada suficiente (M2/M3/M4 Max o Ultra). En un Mac de 36 GB el margen es muy ajustado.
- Opciones de despliegue: `mlx-vlm` (recomendado por el autor, con `python -m mlx_vlm.generate`), y en general el ecosistema MLX de Apple. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama para este formato MLX concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| divinetribe/AesCode-32B-MLX-8bit | ~33,36 B | no disponible | 8 bits (lenguaje) + bf16 (visión) | Apache 2.0 | HuggingFace, MLX |
| divinetribe/AesCode-32B-MLX-bf16 | ~33,36 B | no disponible | bf16 | Apache 2.0 | HuggingFace, MLX |
| divinetribe/AesCode-32B-MLX-4bit | ~33,36 B | no disponible | 4 bits | Apache 2.0 | HuggingFace, MLX |
| microsoft/AesCode-32B | ~33,36 B | no disponible | bf16 original | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-VL-32B-Instruct | ~33 B | no disponible | bf16 original | Apache 2.0 | HuggingFace |

La comparativa natural es dentro de la propia familia AesCode: bf16 para máxima calidad, 8 bits como equilibrio entre tamaño y fidelidad, y 4 bits para equipos con menos memoria. Frente al modelo original de Microsoft, esta build no añade capacidades, solo reduce requisitos de memoria a costa de una pequeña pérdida de precisión en el decoder.

## Limitaciones y advertencias

- La cuantización de 8 bits reduce precisión; no añade conocimiento y no garantiza corrección del código generado. El propio autor lo advierte en la model card.
- El modelo está etiquetado únicamente para inglés (`en`); el rendimiento en castellano u otros idiomas no está documentado.
- La verificación visual publicada se apoya en una sola captura de una página real; no constituye una evaluación sistemática de robustez visual.
- Los benchmarks provienen de los autores del modelo original y de un conjunto de 300 muestras de estilo infográfico; no hay validación independiente.
- Riesgo de alucinación inherente a los modelos generativos de código: puede inventar selectores, propiedades CSS o elementos que no aparecen en la imagen.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-VL-32B-Instruct y del propio AesCode-32B antes de redistribuir.
- El formato MLX limita el despliegue a Apple Silicon; no es portable directamente a CUDA sin reconversión.
- La longitud de contexto efectiva no se detalla en la información proporcionada; debe contrastarse con la documentación de Qwen3-VL-32B-Instruct antes de usarlo con entradas largas.
- El modelo está orientado a una tarea estrecha (image-to-code); no debe asumirse un rendimiento generalista equiparable al de un LLM multimodal de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divinetribe/AesCode-32B-MLX-8bit
- Variante bf16: https://huggingface.co/divinetribe/AesCode-32B-MLX-bf16
- Variante 4 bits: https://huggingface.co/divinetribe/AesCode-32B-MLX-4bit
- Modelo original: https://huggingface.co/microsoft/AesCode-32B
- Modelo base del backbone: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Paper: https://arxiv.org/abs/2610.18860
- Repositorio de código: https://github.com/microsoft/AesCode
- Runtime MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Perfil del autor: https://huggingface.co/divinetribe
- Más modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
- Ficha en AI Model Radar: https://aimodelradar.app/models/aescode-32b
- Requisitos de hardware (llmrun): https://llmrun.dev/model/microsoft-aescode-32b
