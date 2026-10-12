# openbmb/MiniCPM-V-4.7-1B

## Resumen

MiniCPM-V 4.7 1B es un modelo multimodal de tipo image-text-to-text desarrollado por OpenBMB, la variante de 1B parámetros de la última iteración de la familia MiniCPM-V. Con 1.554.476.272 parámetros (≈1,55B) y un repositorio de 3,3 GB, está orientado a inferencia en dispositivo (on-device) en móviles, tabletas y plataformas embebidas, y se distribuye bajo licencia Apache 2.0.

El modelo se construye sobre un codificador visual SigLIP2-400M y el LLM Qwen3.5-0.8B, y hereda las capacidades de comprensión de imagen única, múltiples imágenes y vídeo de la familia MiniCPM-V. Su propuesta central es la densidad de capacidad: según el autor, en modo Instruct mejora las capacidades base respecto a MiniCPM-V 4.6 y supera sustancialmente a Qwen3.5 0.8B tanto en puntuación global como en eficiencia de inferencia, con soporte de compresión mixta de tokens visuales 4x/16x para ajustar el coste por tarea.

Es relevante porque amplía las opciones de despliegue local y en el borde: soporte declarado para iOS, Android y HarmonyOS, soporte day-0 de chips de Rockchip, Houmo, Intel, AMD y Arm, e integración con SGLang, vLLM, llama.cpp y Ollama. La publicación es muy reciente (creado el 6 de octubre de 2026, actualizado el 12 de octubre de 2026) y con adopción todavía limitada: 14 descargas y 16 likes en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM (transformador multimodal): codificador visual SigLIP2-400M + LLM Qwen3.5-0.8B; etiqueta de arquitectura en el repo: `minicpmv4_7` |
| Parametros totales | 1.554.476.272 (≈1,55B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, BNB, AWQ, GPTQ y FP8 (variantes publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos principales); variantes cuantizadas en GGUF, AWQ, GPTQ, BNB y FP8 |
| Modalidades de entrada | texto e imagen (image-text-to-text); soporta imagen única, múltiples imágenes y vídeo |
| Libreria | transformers (requiere `transformers[torch]>=5.18.0`) |
| Tamano del repositorio | 3,3 GB |
| Despliegue soportado | SGLang, vLLM, llama.cpp, Ollama, OpenVINO GenAI; on-device en iOS, Android y HarmonyOS |
| Fine-tuning soportado | SWIFT y LLaMA-Factory; metodo Self-Replay Fine-Tuning |

## Arquitectura y entrenamiento

MiniCPM-V 4.7 1B es un modelo multimodal denso que combina un codificador visual SigLIP2-400M con el LLM Qwen3.5-0.8B. La innovación arquitectónica destacada es la compresión temprana de tokens visuales dentro del propio ViT (intra-ViT early compression), técnica procedente de LLaVA-UHD v4: los tokens visuales se comprimen en las primeras capas del codificador, reduciendo el cómputo de las capas posteriores del encoder y, por extensión, del resto del pipeline. Además, el modelo admite compresión mixta de tokens visuales 4x/16x, lo que permite al desarrollador elegir entre mayor detalle visual o menor coste de inferencia según la tarea.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. El autor sí documenta un método de ajuste fino propio, Self-Replay Fine-Tuning, orientado a extender capacidades del modelo a bajo coste y a reducir el olvido catastrófico de las capacidades previas durante la personalización.

## Capacidades

- Comprensión de imagen única (single-image understanding) para descripción, pregunta-respuesta visual y análisis de contenido gráfico.
- Comprensión de múltiples imágenes dentro de una misma conversación, lo que permite comparaciones y razonamiento cruzado entre varias entradas visuales.
- Comprensión de vídeo, en línea con la familia MiniCPM-V.
- Generación de texto conversacional multimodal (tag `conversational`), con diálogo multi-turno sobre contenido visual.
- Control del coste de inferencia mediante compresión mixta de tokens visuales 4x/16x, seleccionable por tarea.
- Ejecución en dispositivo: soporte de iOS, Android y HarmonyOS, y soporte day-0 de plataformas de chips de Rockchip, Houmo, Intel, AMD y Arm.
- Compatibilidad con frameworks de inferencia y servicio: SGLang, vLLM, llama.cpp, Ollama y OpenVINO GenAI.
- Personalización mediante fine-tuning con SWIFT y LLaMA-Factory, incluido el método Self-Replay Fine-Tuning del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking o razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente visual en aplicaciones móviles: al ser un modelo de 1,55B con soporte nativo para iOS, Android y HarmonyOS, puede integrarse en una app que describa, clasifique o responda preguntas sobre fotos tomadas por el usuario sin enviar la imagen a un servidor.
- Accesibilidad para personas con discapacidad visual: el modelo puede generar descripciones textuales de imágenes capturadas con la cámara del teléfono, y la compresión 4x/16x permite priorizar latencia baja en descripciones rápidas o detalle en escenas complejas.
- Análisis de vídeo en el borde: para vigilancia doméstica, revisión de grabaciones o resumen de clips, evitando transmitir vídeo a la nube y reduciendo el coste de ancho de banda y las obligaciones de privacidad.
- Procesamiento de documentos con múltiples páginas o imágenes: comparación y extracción de información a partir de capturas o fotografías de documentos en escenarios de digitalización en campo, donde no hay conectividad fiable.
- Robótica y sistemas embebidos: el soporte day-0 de plataformas de chips como Rockchip, Houmo, Intel, AMD y Arm facilita desplegar el modelo como componente de percepción visual en robots y dispositivos industriales con presupuesto de cómputo reducido.
- Control de calidad visual en producción: análisis automatizado de fotografías de producto en línea de fabricación, usando compresión 16x para el cribado rápido y 4x para la inspección detallada de las piezas dudosas.
- Prototipado e iteración rápida con fine-tuning: mediante SWIFT o LLaMA-Factory y Self-Replay Fine-Tuning, un equipo puede adaptar el modelo a un dominio visual concreto (por ejemplo, catálogo propio o terminología interna) sin reentrenar desde cero y limitando el olvido de capacidades generales.
- Servicio de inferencia multimodal autogestionado: despliegue con vLLM, SGLang, llama.cpp u Ollama para ofrecer una API interna de imagen-a-texto con coste por consulta muy bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una afirmación cualitativa del autor (que la variante 1B en modo Instruct supera sustancialmente a Qwen3.5 0.8B en puntuación global y en eficiencia de inferencia) y enlaza dos figuras comparativas en formato imagen, sin valores numéricos ni tablas con métricas como MMLU, HumanEval, GSM8K o similares. Por tanto, no se presentan cifras para no inventar datos.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 3,5-4 GB considerando los 1,55B parámetros (≈3,1 GB solo de pesos) más el codificador visual y la caché KV en tareas con muchas imágenes (estimación a partir del recuento de parámetros, no un dato publicado por el autor).
- VRAM estimada en INT8: aproximadamente 2-2,5 GB.
- VRAM estimada en INT4 (GPTQ/AWQ/GGUF Q4): aproximadamente 1,2-1,8 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve para FP16 con holgura, por ejemplo RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070/4080/4090. En entornos de servidor, A100 o H100 están sobradamente dimensionadas para este tamaño y permiten lotes grandes.
- Cabe en GPU consumer: sí, en cualquiera con 4 GB o más de VRAM en cuantizaciones INT4/INT8; con 6-8 GB se puede usar FP16 sin problema.
- Hardware no GPU: el modelo está pensado para despliegue en móviles (iOS, Android, HarmonyOS) y en plataformas de chips de Rockchip, Houmo, Intel, AMD y Arm, por lo que es viable sin GPU dedicada.
- Opciones de despliegue: transformers (>=5.18.0), vLLM, SGLang, llama.cpp, Ollama y OpenVINO GenAI. Para entrenamiento y ajuste: SWIFT y LLaMA-Factory.
- Latencia y throughput: no disponibles. El autor publica una figura de rendimiento frente a tiempo de inferencia, pero sin valores numéricos en el texto de la model card.
- Nota de compatibilidad: la decodificación de vídeo con `torchcodec` puede fallar con determinadas versiones de CUDA; la model card propone sustituirlo por `PyAV` o fijar la versión de CUDA de PyTorch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 1B | 1,55B | no disponible | Afirmación del autor: supera a Qwen3.5 0.8B en puntuación global y eficiencia (sin cifras) | Apache 2.0 | HuggingFace, safetensors + GGUF/AWQ/GPTQ/BNB/FP8 |
| Qwen3.5 0.8B | ≈0,8B (según nomenclatura) | no disponible | Referencia de comparación citada por el autor de MiniCPM-V 4.7 | no disponible | no disponible |
| MiniCPM-V 4.6 1.3B | ≈1,3B | no disponible | Generación anterior de la familia; el autor indica que 4.7 mejora las capacidades base | no disponible | no disponible |
| MiniCPM-V 4.7 35B-A3B | no disponible (variante MoE, según listado de OpenVINO) | no disponible | no disponible | no disponible | listado como soportado en OpenVINO GenAI |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada, por lo que la comparación se limita a tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- Tamaño de 1,55B: es un modelo de gama muy ligera, por lo que cabe esperar un techo bajo en razonamiento complejo, matemáticas avanzadas y cadenas largas de inferencia en comparación con modelos multimodales de mayor tamaño.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad visual ni tasas de alucinación; en tareas de descripción de imágenes o extracción de datos, la verificación humana sigue siendo necesaria.
- Longitud de contexto no publicada: se desconoce cuántas imágenes o cuántos turnos de conversación admite de forma fiable, lo que dificulta dimensionar memoria y planificar despliegues multi-turno largos.
- Idiomas soportados no publicados: no hay lista oficial de idiomas, así que el rendimiento en castellano no está garantizado ni documentado.
- Adopción muy temprana: 14 descargas y 16 likes en el momento de redactar la ficha, con publicación muy reciente; existe poco feedback de terceros y pocos informes de comportamiento en producción.
- Compatibilidad de dependencias: requiere `transformers>=5.18.0`, una versión muy reciente de la librería, lo que puede chocar con pilas de software existentes.
- Problemas conocidos de decodificación de vídeo: `torchcodec` puede no cargar con ciertas combinaciones de CUDA; hay que prever el uso de PyAV o el fijado de versiones.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene revisar las licencias de los componentes subyacentes (codificador SigLIP2-400M y LLM Qwen3.5-0.8B) antes de un despliegue comercial.
- Métricas de eficiencia no verificables con los datos disponibles: las afirmaciones de superioridad frente a Qwen3.5 0.8B provienen del propio autor y no se acompañan de cifras reproducibles en el texto de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Repositorio GitHub de la familia MiniCPM-V: https://github.com/OpenBMB/MiniCPM-V
- Documentación de MiniCPM-V 4.7 (pesos, inferencia y despliegue on-device): https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/minicpm_v4dot7_en.md
- Guía de despliegue y frameworks soportados: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- Documentación de la API: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/api.md
- Demo interactiva en HuggingFace Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.7-Demo
- Cookbook de MiniCPM-V: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- LLaVA-UHD v4 (origen de la técnica de compresión intra-ViT): https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- MiniCPM-Robot (modelo relacionado para robótica on-device): https://github.com/OpenBMB/MiniCPM-Robot
- Lista de modelos soportados por OpenVINO GenAI (incluye MiniCPM-V 4.7 1B y 35B-A3B): https://openvinotoolkit.github.io/openvino.genai/docs/supported-models/
- Modelos soportados por vLLM: https://docs.vllm.ai/en/v0.18.1/models/supported_models/
- Comparativa de MiniCPM-V 4.6 1.3B frente a Qwen3 4B: https://llmbase.ai/compare/minicpm-v4-6-1-3b,qwen3-4b-2507-instruct-reasoning/
