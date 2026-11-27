# litert-community/MiniCPM-V-4.7-1B

## Resumen

MiniCPM-V-4.7-1B es un modelo de visión-lenguaje (VLM) de 1.000 millones de parámetros desarrollado por OpenBMB y publicado el 12 de octubre de 2026. Combina un codificador visual de 27 capas de estilo SigLIP con un decodificador de texto híbrido de tipo Qwen3.5 que alterna 18 capas de atención lineal GatedDeltaNet y 6 capas de atención completa. Está diseñado para comprensión de imágenes y vídeo en dispositivos móviles, con compresión agresiva de tokens visuales (16x) para reducir el coste computacional.

La ficha que nos ocupa no es el modelo original, sino la conversión realizada por la comunidad `litert-community` al formato `.litertlm` para el runtime LiteRT-LM de Google AI Edge. Esta conversión cuantiza el decodificador a int8 y el codificador visual a fp16 (o int8 en una variante), y empaqueta el modelo como un bundle de imagen y texto que sigue el contrato `fast_vlm` del runtime: una imagen por mensaje, redimensionada a 448x448, que se inserta como 64 tokens visuales en el prompt.

El resultado es relevante ahora porque permite ejecutar un VLM multimodal en teléfonos de gama media y alta (Galaxy S26, Pixel 8a, iPhone 18 Pro) con latencias de primer token inferiores a un segundo en GPU y velocidades de decodificación de 36,5 tokens/s en CPU. El bundle ocupa entre 1,22 GB (solo texto) y 2,21 GB (visión fp16), lo que lo hace viable en dispositivos con 8-12 GB de RAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM: codificador visual SigLIP de 27 capas + decodificador de texto híbrido Qwen3.5 (18 capas GatedDeltaNet + 6 capas de atención completa) |
| Parámetros totales | no disponible (modelo base de 1B según nomenclatura) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Decodificador int8 dinámico por canal (36 proyecciones decay/gate de GatedDeltaNet en float); embeddings int8; codificador visual fp16 o int8 según variante; activaciones fp32 en GPU |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); variantes: `MiniCPM-V-4.7-1B-VL_int8.litertlm` (2,21 GB), `MiniCPM-V-4.7-1B-VL_int8vis.litertlm` (1,70 GB), `MiniCPM-V-4.7-1B_int8.litertlm` (1,22 GB, solo texto) |

## Arquitectura y entrenamiento

El modelo base MiniCPM-V-4.7-1B emplea un decodificador de texto con arquitectura híbrida: 18 capas de atención lineal GatedDeltaNet combinadas con 6 capas de atención completa, dimensión oculta de 1024 y un vocabulario de 248.094 tokens. El codificador visual es de estilo SigLIP con 27 capas y aplica una compresión temprana de tokens dentro del propio codificador: un merger de atención de ventana 2x2 tras la capa 6 y un merger 2x2 adicional, lo que resulta en una compresión total de 16x de los tokens visuales.

La conversión a LiteRT-LM reescribió la torre visual en PyTorch plano y validó su equivalencia contra la función `get_image_features` del modelo original con una correlación de 0,99999999997 en fp32. El decodificador de texto se validó con logits teacher-forced en 48 posiciones: top-1 idéntico en todas las posiciones y correlación de Pearson de 1,0000 (máxima diferencia absoluta de logit de 5,3e-5). La versión int8 coincide en 47 de 48 posiciones (una casi-empate). No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La innovación técnica principal de esta conversión es la adaptación al contrato `fast_vlm` del runtime: la imagen se redimensiona a 448x448 y se insertan 64 tokens visuales en el prompt mediante la plantilla de chat. Esto difiere del pipeline original de Transformers en dos aspectos medidos: las imágenes grandes no se dividen en thumbnail más slices, y las posiciones M-RoPE del canvas colapsan a RoPE ordinario en los tokens de imagen. En ambos casos, las respuestas fueron paráfrasis del mismo contenido en 9 de 9 casos, sin errores factuales.

## Capacidades

- Comprensión de imágenes: descripción de contenido, colores, ubicación de objetos y lectura de texto en la imagen (OCR básico).
- Generación de texto: respuestas directas en modo "Instruct" (sin modo thinking).
- Procesamiento de una imagen por mensaje en el contrato `fast_vlm`; no soporta múltiples imágenes en un mismo prompt en este bundle.
- Comprensión de vídeo: no incluida en este bundle (el modelo base la soporta según OpenBMB).
- Modo de "detalle fino" 4x: no incluido en este bundle.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Ejecución en dispositivo (on-device): optimizado para GPU Mali, CPU y Metal en dispositivos móviles.

## Casos de uso

- Asistencia visual en movilidad: el modelo puede describir una foto tomada con el teléfono (objetos, colores, texto visible) con un primer token en 0,93 s en GPU de Galaxy S26, adecuado para aplicaciones de accesibilidad que necesitan respuestas rápidas sin conexión.
- Lectura de documentos y carteles: con su capacidad de OCR básico y 64 tokens visuales por imagen, puede extraer texto de señales, menús o etiquetas en escenarios de campo donde no hay conectividad.
- Moderación de contenido visual en el dispositivo: clasificación y descripción de imágenes subidas por usuarios antes de enviarlas a un servidor, reduciendo latencia y preservando privacidad.
- Asistentes de compra presencial: identificación de productos y comparación visual en tiempo real en un teléfono, usando la variante `_int8vis` de 1,70 GB para dispositivos Android con GPU Mali y 8 GB de RAM.
- Aplicaciones educativas interactivas: resolución de preguntas sobre diagramas, fotografías o ilustraciones en un entorno sin conexión, con decodificación de 36,5 tokens/s en CPU.
- Prototipado de pipelines multimodales en edge: validación de arquitecturas VLM en dispositivos reales (iPhone, Pixel, Galaxy) antes de escalar a modelos mayores, gracias a la licencia Apache 2.0 y al formato ligero.
- Chat de texto en dispositivos con recursos limitados: la variante solo texto de 1,22 GB permite conversación general en teléfonos de gama media sin componente visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento proporcionados son medidas de latencia y velocidad en dispositivos concretos:

| Métrica | Dispositivo | Resultado |
|---|---|---|
| Latencia al primer token (imagen 448x448, GPU) | Galaxy S26 | 0,93 s |
| Velocidad de decodificación (CPU) | Galaxy S26 | 36,5 tokens/s |
| Precisión en 8 preguntas de texto (CPU) | Mac M4 Max | 8/8 |
| Precisión en 8 preguntas de texto (GPU) | Mac M4 Max | 8/8 |
| Precisión en 3 fotos x 3 preguntas (CPU) | Mac M4 Max | 9/9 |
| Precisión en 3 fotos x 3 preguntas (GPU) | Mac M4 Max | 9/9 |
| Precisión en 3 fotos (CPU, `_int8vis`) | Pixel 8a | 3/3 |
| Correlación de logits de texto (fp32 vs original) | — | Pearson 1,0000; top-1 48/48 |
| Correlación de logits de texto (int8 vs original) | — | top-1 47/48 |
| Correlación de torre visual (fp32) | — | 0,99999999997 |
| Correlación de torre visual (int8) | — | 0,9954 (peor coseno por token 0,911) |

## Requisitos de hardware

- VRAM/RAM estimada: entre 1,22 GB (solo texto int8) y 2,21 GB (visión fp16) de almacenamiento; el runtime necesita además memoria para activaciones y contexto, por lo que se recomienda un dispositivo con al menos 8 GB de RAM para la variante `_int8vis` y 12 GB para la variante fp16.
- GPU recomendadas: Arm Mali (Android), GPU integrada de Apple (Metal en iPhone y Mac), CPU en todos los casos. Probado en Galaxy S26, Pixel 8a, iPhone 18 Pro y Mac M4 Max.
- ¿Cabe en GPU consumer? Sí, en el sentido de que está diseñado para GPUs integradas de móviles; no se proporcionan datos para GPUs de escritorio dedicadas (RTX 4090, etc.).
- Opciones de despliegue: runtime LiteRT-LM (versión 0.18.0 probada), con el comando `litert-lm run`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: primer token en 0,93 s (GPU, Galaxy S26) y 36,5 tokens/s en CPU (Galaxy S26). No se proporcionan datos de throughput para otros dispositivos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base MiniCPM-V-4.7-1B de OpenBMB es la referencia directa, pero no se incluyen datos de rendimiento comparativo con otras alternativas de la misma categoría (VLMs de ~1B para edge). Se indica "no disponible".

## Limitaciones y advertencias

- El bundle solo soporta una imagen por mensaje y el modo "Instruct" (sin thinking); no incluye vídeo, multi-imagen ni el modo de detalle fino 4x del modelo base.
- Las imágenes mayores de 448x448 se redimensionan al cuadrado en lugar de dividirse en slices, lo que puede perder detalle en imágenes de alta resolución.
- Las posiciones M-RoPE del canvas colapsan a RoPE ordinario en tokens de imagen, lo que puede afectar a la comprensión de relaciones espaciales complejas.
- La variante int8 del codificador visual (`_int8vis`) tiene una correlación de 0,9954 con el original (peor coseno por token 0,911), lo que puede degradar ligeramente la calidad en comparación con la fp16.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones idiomáticas específicas en la documentación proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base original de OpenBMB.
- El formato `.litertlm` está atado al runtime LiteRT-LM; no es portable a otros motores de inferencia sin conversión adicional.
- El rendimiento medido corresponde a versiones específicas de hardware y software (litert-lm 0.18.0, octubre de 2026); puede variar en otras configuraciones.

## Enlaces

- [Hugging Face: litert-community/MiniCPM-V-4.7-1B](https://huggingface.co/litert-community/MiniCPM-V-4.7-1B)
- [Modelo base: openbmb/MiniCPM-V-4.7-1B](https://huggingface.co/openbmb/MiniCPM-V-4.7-1B)
- [Runtime LiteRT-LM (Google AI Edge)](https://github.com/google-ai-edge/LiteRT-LM)
- [Reproducción de la conversión (REPRODUCE.md)](https://github.com/john-rocky/hf-to-litertlm/blob/main/REPRODUCE.md#2026-10-13--minicpm-v-47-1b-a-qwen35-text-hybrid-vlm-as-a-fast_vlm-file-the-window-merger-vit-re-authored-in-plain-torch-and-a-chat-template-whose-second-turn-matches-upstream-token-for-token)
- [Manifiesto legible por máquina (litertlm_manifest.json)](https://huggingface.co/litert-community/MiniCPM-V-4.7-1B/blob/main/litertlm_manifest.json)
