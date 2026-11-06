# byron123t/Hawkeye-4B

## Resumen

Hawkeye-4B es un modelo vision-lenguaje especializado en reconocimiento de texto degradado: texto borroso, de baja resolución o capturado a distancia, como el que registra una cámara de gafas inteligentes o un teléfono móvil en condiciones reales. Lo desarrolla byron123t (Tang y Shin, Universidad de Michigan) y parte de Qwen/Qwen3-VL-4B-Instruct, sobre el que se aplica un ajuste fino supervisado seguido de un entrenamiento con GRPO. El resultado es un modelo de 4.437.815.808 parámetros (aproximadamente 4,4 mil millones) publicado bajo licencia Apache-2.0.

El problema que aborda es concreto y medible: los modelos de OCR generalistas fallan de forma sistemática cuando el texto es ilegible por desenfoque, tamaño reducido en píxeles o distancia. Hawkeye-4B se entrena sobre BSTRB (Blurry Scene Text Recognition Benchmark), un conjunto de 6.734 fotogramas de vídeo procedentes de 1.133 vídeos, y consigue mejoras de hasta 10,1 puntos porcentuales en F1 de bag-of-words sobre el modelo base en el split de test de vídeo, además de reducir a la mitad los bucles de repetición en texto de menos de 20 píxeles.

Su relevancia actual radica en que demuestra que un modelo de 4B ajustado con datos específicos y RL con recompensa de F1 puede competir con modelos API de escala muy superior en esta tarea: en BSTRB vídeo alcanza un BoW F1 de 0,728, solo por detrás de Hawkeye 8B entre 24 modelos evaluados, y por delante de Qwen3-VL-235B (0,726), Kimi K2.6 (0,723) y GPT-6 Astra (0,709).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL: encoder ViT + proyector + LLM decoder) |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el README usa bfloat16) |
| Idiomas soportados | en (ingles; el entrenamiento se centra en envases, carteles, libros y pantallas en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, clase Qwen3VLForConditionalGeneration) |

## Arquitectura y entrenamiento

Hawkeye-4B hereda la arquitectura Qwen3-VL en su variante Instruct de 4B: un encoder visual tipo ViT que procesa la imagen, un proyector que mapea las representaciones visuales al espacio del modelo de lenguaje y un decoder autorregresivo que genera la transcripción. El pipeline es image-text-to-text y el modelo se carga con `Qwen3VLForConditionalGeneration` de transformers (version >= 4.57). El procesador limita la imagen a 1.003.520 píxeles tras el preprocesado.

El entrenamiento consta de dos fases. Primero, un SFT sobre los fotogramas de vídeo de entrenamiento de BSTRB (6.734 fotogramas de 1.133 vídeos; el split público omite 30 por privacidad), con el encoder visual descongelado, learning rate de 1e-6 para LLM y ViT y 1e-5 para el proyector, y entradas reescaladas ×3. Después, un GRPO con LoRA (rango 64, alpha 128, sobre q/k/v/o; learning rate pico de 2e-5) durante 300 pasos, usando como recompensa el F1 de bag-of-words frente a la transcripción de entrenamiento; el adaptador LoRA se fusiona en los pesos publicados.

Una innovación destacable es el protocolo de inferencia: la imagen se reescala ×3 con interpolación bicúbica antes de pasarla al procesador, se usa un system prompt de motor OCR estricto (sin preámbulos, preservando saltos de línea, sin corregir ortografía) y decodificación greedy con hasta 4.096 tokens nuevos. Para reproducir exactamente las cifras del paper, la evaluación re-codifica cada imagen como JPEG (calidad 92, lado mayor máximo 2.048 px) antes del reescalado ×3.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre texto degradado: borroso, de baja resolución, a distancia o en capturas de gafas inteligentes.
- Transcripción de texto en escena (scene text recognition): carteles, envases, etiquetas, pantallas y libros.
- Lectura de texto muy pequeño (caracteres de hasta 7 píxeles en tablas Snellen).
- Salida en formato de transcripción pura, respetando saltos de línea por línea visual, sin Markdown ni comillas.
- Generación de texto y respuesta conversacional derivada del modelo base Qwen3-VL-4B-Instruct.
- Capacidades vision-lenguaje generales heredadas del base (descripción de imágenes, respuesta a preguntas visuales), aunque el ajuste fino está orientado a OCR.
- Soporte multilingüe limitado: el modelo está entrenado principalmente en inglés; los alfabetos no latinos son raros en los datos de entrenamiento.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Gafas inteligentes y wearables: el modelo lee texto que el usuario tiene delante (carteles, menús, etiquetas) aunque la cámara lo capture borroso o a distancia; el README reporta una mejora de +14,7 pp en BoW F1 y +16,6 pp en F1 alineado en capturas de gafas inteligentes fuera de distribución.
- Digitalización de envases y etiquetas de producto: transcripción de ingredientes, valores nutricionales e instrucciones en fotos de móvil, con el protocolo de reescalado ×3 que mitiga la baja resolución.
- Accesibilidad para personas con baja visión: lectura en voz alta de texto pequeño o desenfocado capturado con la cámara del teléfono, incluyendo tablas Snellen y letra pequeña.
- Automatización de inventario y logística: lectura de etiquetas y códigos textuales en almacenes donde las cámaras fijas capturan texto a distancia y con movimiento.
- Procesamiento de documentos fotografiados: extracción de texto de libros, pantallas y documentos impresos capturados en condiciones no controladas, manteniendo la estructura de líneas.
- Preprocesado OCR en pipelines de datos: generación de transcripciones para conjuntos de imágenes de escena antes de tareas posteriores de indexación o búsqueda.
- Asistencia en movilidad: lectura de señales y rótulos en tiempo real desde un dispositivo portátil, con decodificación greedy que mantiene la latencia baja para un modelo de 4B.

## Benchmarks y rendimiento

Resultados del split de test retenido de BSTRB (1.331 fotogramas de vídeo de 224 vídeos, 241 fotos, etiquetas verificadas por humanos), con diferencias emparejadas frente al modelo base en los mismos elementos, IC bootstrap del 95% agrupados por vídeo y corrección de Holm.

| Benchmark | Hawkeye-4B vs. Qwen3-VL-4B base |
|---|---|
| BSTRB vídeo, BoW F1 | 0,627 → 0,728 (+10,1 pp; IC 95% [+8,7; +11,6]) |
| BSTRB fotos, BoW F1 | +6,0 pp [+3,2; +8,6] |
| 10 benchmarks OCR generales, BoW F1 | 4 de 10 mejores, 6 sin cambio significativo, 0 peores (HierText +12,9; COCO-Text +5,8; MapText +4,7; RIMES +1,8 pp) |
| Capturas de gafas inteligentes (37 objetos, fuera de distribución) | BoW F1 +14,7 pp; F1 alineado +16,6 pp; inclusión de palabras +6,4 pp (no significativo) |
| Tablas Snellen, texto <= 7 px (precisión de carácter) | +7,2 pp [+4,5; +9,9] |
| Bucles de repetición, texto de vídeo <= 20 px | 14,3% → 7,2% |

Comparativa frente a modelos API en BSTRB vídeo (BoW F1): Hawkeye-4B obtiene 0,728, segundo de 24 modelos solo por detrás de Hawkeye 8B; por delante de Qwen3-VL-235B (0,726), Kimi K2.6 (0,723) y GPT-6 Astra (0,709). En BSTRB fotos, los modelos API de mayor tamano siguen por delante.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9 GB solo para pesos (4,44B parámetros × 2 bytes), más overhead de activaciones y del encoder visual; en la practica se recomienda reservar 12-16 GB.
- En cuantizacion de 8 bits: alrededor de 4,5 GB de pesos; en 4 bits: alrededor de 2,5 GB (estimaciones teoricas; no se han publicado cuantizaciones oficiales).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bfloat16 sin problema.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y tarjetas con 12 GB o mas en bfloat16; en 8 GB seria necesario cuantizar.
- Opciones de despliegue: transformers (>= 4.57) con `Qwen3VLForConditionalGeneration`, el paquete `hawkeye` (protocolo exacto del paper), y servidores compatibles con endpoints (el repo incluye la etiqueta endpoints_compatible). No se documenta soporte explicito de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BSTRB vídeo BoW F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hawkeye-4B | 4,44B | no disponible | 0,728 | Apache-2.0 | Hugging Face (transformers) |
| Qwen3-VL-4B-Instruct (base) | 4B | no disponible | 0,627 | Apache-2.0 | Hugging Face |
| Qwen3-VL-235B | 235B (no disponible si MoE) | no disponible | 0,726 | no disponible | API / Hugging Face |
| Kimi K2.6 | no disponible | no disponible | 0,723 | no disponible | API |
| GPT-6 Astra | no disponible | no disponible | 0,709 | propietaria | API |

Hawkeye-4B iguala o supera en BSTRB vídeo a modelos API de escala muy superior con un coste de inferencia mucho menor, aunque en BSTRB fotos los modelos API grandes mantienen ventaja.

## Limitaciones y advertencias

- Entrenado para envases, carteles, libros y pantallas en ingles; los alfabetos no latinos son raros en los datos de entrenamiento, por lo que el rendimiento en otros idiomas no está garantizado.
- Las etiquetas de entrenamiento son transcripciones de GPT-5; solo val y test tienen etiquetas verificadas por humanos, lo que introduce posible sesgo del profesor.
- La mejora en precisión proviene sobre todo de reducir bucles de repetición; en salidas que no entran en bucle, la proporción de palabras ausentes en la referencia es similar a la del modelo base.
- Su fallo más común es detenerse antes de tiempo en texto denso, dejando parte de la transcripción incompleta.
- En texto muy pequeño o ilegible puede producir completaciones plausibles pero incorrectas (por ejemplo, valores nutricionales); no debe usarse sin verificación en contextos donde los errores importan (medicación, textos legales).
- Licencia Apache-2.0 para los pesos, pero el dataset BSTRB usado en el entrenamiento tiene su propia licencia CC BY-NC 4.0 con acceso restringido (gated), lo que puede condicionar la reproducibilidad del entrenamiento.
- Riesgo de alucinación inherente a los modelos vision-lenguaje, agravado en imágenes con poco texto legible.
- No se documentan sesgos específicos más allá de la limitación de dominio e idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byron123t/Hawkeye-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Dataset BSTRB: https://huggingface.co/datasets/byron123t/BSTRB
- Código: https://github.com/byron123t/hawkeye
- Página del proyecto: https://byron123t.github.io/hawkeye/
- Paper: Hawkeye4B: Reading Illegible Text with Vision Language Models (Tang and Shin, University of Michigan); no se ha proporcionado el enlace directo al PDF.
