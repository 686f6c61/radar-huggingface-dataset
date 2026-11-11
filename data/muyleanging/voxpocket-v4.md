# muyleanging/VoxPocket-v4

## Resumen

VoxPocket-v4 es un modelo de síntesis de voz (text-to-speech) especializado en jemer (khmer) desarrollado por Ing Muyleang. Se trata de un fine-tuning de VoxCPM 1.5, el modelo TTS de OpenBMB, adaptado mediante varias rondas de entrenamiento sobre voz real jemer y voz sintética destilada de VoxCPM2. Con 801,7 millones de parámetros y una frecuencia de muestreo de salida de 44,1 kHz, el modelo aborda un problema concreto: la escasez de sistemas TTS de calidad para jemer, un idioma con poca representación en los modelos multilingües convencionales.

El modelo lee jemer nativo, jemer con palabras en inglés intercaladas (code-mixing) e inglés básico. Además de la síntesis directa, incorpora clonación de voz a partir de un clip corto de referencia (4-9 segundos) y control de estilo mediante descripciones entre corchetes, tanto sobre voces clonadas como sobre voces diseñadas desde cero sin clip. Esta combinación de clonación y control estilístico en un modelo de menos de mil millones de parámetros lo hace relevante para despliegues con recursos limitados.

La relevancia actual del modelo reside en su enfoque de destilación: parte de los datos de entrenamiento son sintéticos, generados por VoxCPM2 y filtrados con un reconocedor de voz, lo que permite ampliar la cobertura lingüística y de estilos sin depender exclusivamente de grabaciones reales. El modelo se distribuye con licencia Apache 2.0 y está pensado para aplicaciones de accesibilidad, doblaje y asistentes de voz en jemer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VoxCPM (fine-tuning de openbmb/VoxCPM1.5); detalles internos de la arquitectura no disponibles |
| Parámetros totales | 801.729.856 (≈0,8 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | jemer (km), inglés (en); soporta code-mixing jemer-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de salida | 44,1 kHz |
| Tamaño del repositorio | 3,6 GB |
| Librería | voxcpm |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo parte de VoxCPM 1.5 y se ha ajustado mediante varias rondas de fine-tuning sobre jemer. La model card no detalla la arquitectura interna de VoxCPM (si es un transformer autorregresivo, un modelo de difusión o un híbrido), por lo que ese dato no está disponible. La inferencia se controla con parámetros como `cfg_value` (clasificador libre de guía, por defecto 2.0) e `inference_timesteps` (10 pasos), lo que sugiere un proceso de generación iterativo, probablemente basado en difusión o flow matching, aunque no se confirma en la información proporcionada.

El entrenamiento utilizó aproximadamente 670 horas de audio en la lista de entrenamiento: 237 horas de voz real jemer, 270 horas de voz sintética generada por VoxCPM2 (verificada con un reconocedor de voz e incluyendo jemer, code-mixing, inglés, clonación, estilo y voces diseñadas), 79 horas de pares clip de voz + estilo para permitir el cambio de tono en voces clonadas, y 5 horas de frases con cambio inglés→jemer. La ejecución más reciente se realizó en una única NVIDIA RTX 5090 de 32 GB (CUDA 13) durante aproximadamente 15 horas, procesando unas 1.010 horas de audio. No se especifica si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz en jemer nativo con salida a 44,1 kHz.
- Lectura de texto con code-mixing jemer-inglés (palabras inglesas intercaladas en frases jemer).
- Síntesis de inglés básico.
- Clonación de voz a partir de un clip de referencia de 4-9 segundos, requiriendo el texto exacto pronunciado en el clip.
- Control de estilo mediante descripciones entre corchetes (por ejemplo, `sad, low and slow tone`, `excited and energetic`, `whispering quietly`).
- Diseño de voz sin clip de referencia, describiendo la voz deseada en corchetes (por ejemplo, `A young woman, clear and bright voice, cheerful tone`).
- Combinación de clonación y estilo: aplicar un tono a una voz clonada (con eficacia limitada, según el autor).
- Manejo de palabras duplicadas en jemer (marcador `ៗ`), que deben escribirse expandidas.

## Casos de uso

- Accesibilidad para personas con discapacidad visual: lectura de contenido en jemer (noticias, documentos, interfaces) con voz natural a 44,1 kHz, adecuada para lectores de pantalla y aplicaciones de asistencia.
- Doblaje y locución automatizada: generación de narraciones en jemer para vídeos, audiolibros o material educativo, con control de estilo para adaptar el tono (por ejemplo, tono de locutor de noticias serio y claro).
- Asistentes de voz para atención al cliente: síntesis de respuestas en jemer con clonación de una voz corporativa consistente a partir de un clip corto de referencia.
- Localización de contenido: conversión de guiones con términos técnicos en inglés intercalados en jemer (code-mixing) sin necesidad de traducir los préstamos lingüísticos, habitual en el habla real camboyana.
- Prototipado rápido de voces: diseño de voces sintéticas sin disponer de grabaciones, útil para demos, videojuegos o aplicaciones antes de contratar locutores.
- Investigación en TTS de bajos recursos: el modelo y su dataset asociado sirven como base para estudiar destilación de voz sintética y adaptación de modelos multilingües a idiomas con pocos datos.
- Educación y aprendizaje de idiomas: generación de audio en jemer con distintos estilos y velocidades para materiales de aprendizaje, incluyendo pronunciación de palabras inglesas en contexto jemer.

## Benchmarks y rendimiento

El autor publica una evaluación de inteligibilidad sobre 40 frases jemer no vistas en el entrenamiento, usando el mismo clip de voz (cfg 2.0, 10 pasos) y midiendo errores de letra con el reconocedor `seanghay/Qwen3-ASR-0.6B-Khmer` (menor es mejor):

| Métrica | VoxPocket |
|---|---|
| Error de letra (mediana) | 5,4% |
| Error de letra (media) | 6,9% |
| Frases perfectas | 8 / 40 |
| Frases con >10% de errores | 11 / 40 |

No se han publicado comparaciones con otros modelos TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 801,7 M de parámetros en precisión completa (fp32) serían aproximadamente 3,2 GB solo de pesos, más overhead de activaciones y del modelo de voz. En fp16 rondaría 1,6 GB de pesos.
- GPU recomendadas: el autor entrenó en una NVIDIA RTX 5090 de 32 GB; para inferencia, una GPU consumer con 8-12 GB de VRAM debería ser suficiente, aunque no se confirma en la documentación.
- Cabe en GPU consumer: probablemente sí (RTX 3060/4060/4090), dado el tamaño del modelo, aunque no hay datos oficiales de consumo.
- Opciones de despliegue: librería `voxcpm` (con `VoxCPM.from_pretrained`), con opción `load_denoiser=False`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La inferencia usa 10 pasos por defecto, lo que sugiere un coste computacional moderado, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación de voz | Estilos | Licencia |
|---|---|---|---|---|---|
| VoxPocket-v4 | 0,8 B | jemer, inglés | Sí (clip 4-9 s) | Sí (descripción) | Apache 2.0 |
| VoxCPM 1.5 (base) | no disponible | multilingüe | Sí | no disponible | no disponible |
| VoxCPM2 | no disponible | multilingüe | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada, por lo que la comparación se limita a características estructurales.

## Limitaciones y advertencias

- Los estilos aplicados sobre voces clonadas son débiles: el tono cambia poco. Las voces diseñadas sin clip siguen mejor las descripciones.
- Las palabras raras y los nombres propios a veces se sustituyen por palabras comunes.
- Las palabras inglesas dentro de frases jemer pueden sonar con acento jemer.
- El inglés es básico; el modelo está optimizado para jemer.
- Riesgo de alucinación en la pronunciación: el reconocedor de voz usado para evaluar puede no capturar todos los errores, y las métricas de error de letra no garantizan inteligibilidad perfecta (solo 8 de 40 frases perfectas).
- Advertencia ética explícita del autor: no usar para suplantar a personas reales ni para generar audio engañoso; solo clonar voces con permiso.
- No se documentan sesgos específicos más allá de los derivados de los datos de entrenamiento (voz real jemer y sintética).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base VoxCPM 1.5 debe acreditarse según indica el autor.
- El dataset asociado está restringido (gated), lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/VoxPocket-v4
- Demo en Spaces: https://huggingface.co/spaces/INGMUYLEANG/VoxPocket-v4-demo
- Dataset: https://huggingface.co/datasets/INGMUYLEANG/voxpocket-khmer-tts-v4
- Modelo base VoxCPM 1.5: https://huggingface.co/openbmb/VoxCPM1.5
- VoxCPM2 (generador de datos sintéticos): https://huggingface.co/openbmb/VoxCPM2
- Reconocedor de voz jemer usado en evaluación: https://huggingface.co/seanghay/Qwen3-ASR-0.6B-Khmer
- Perfil del autor en Hugging Face: https://huggingface.co/INGMUYLEANG
- GitHub del autor: https://github.com/MuyleangIng
