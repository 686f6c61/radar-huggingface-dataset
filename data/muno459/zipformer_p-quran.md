# Muno459/zipformer_p-quran

## Resumen

Muno459/zipformer_p-quran es un modelo de reconocimiento automático del habla (ASR) especializado en recitación coránica en árabe, desarrollado por el usuario Muno459 y publicado en Hugging Face. Está construido sobre la arquitectura Zipformer con una cabeza CTC (zipformer_ctc) y se distribuye principalmente en formato ONNX, lo que facilita su despliegue en entornos de inferencia ligeros y en modo streaming. Deriva del modelo base Muno459/zipformer_p-arabic, del que hereda el conocimiento general del árabe, y se ha afinado para producir transcripciones a nivel de fonema orientadas a la evaluación de la pronunciación y el tajweed.

El modelo forma parte del ecosistema icefall, la librería de recetas de entrenamiento de k2-fsa utilizada habitualmente para modelos conformer y zipformer, y está pensado para tareas de verificación y corrección de recitación: no solo transcribe texto, sino que emite etiquetas fonéticas que permiten comparar la pronunciación del recitador con la esperada. Los tags indican soporte de streaming, lo que lo hace apto para aplicaciones interactivas de aprendizaje o corrección en tiempo real.

Su relevancia actual radica en la escasez de modelos abiertos específicos para fonética árabe coránica con licencia publicada y formato ONNX listo para producción. El acceso está restringido (gated) en Hugging Face, requiere aceptar condiciones, y la licencia es NPL-1.1 (no disponible el detalle completo de sus términos en la información proporcionada). El repositorio ocupa 0,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer con cabeza CTC (zipformer_ctc), ecosistema icefall |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el modelo base figura como quantized) |
| Idiomas soportados | arabe (ar) |
| Licencia | NPL-1.1 (acceso restringido, gated) |
| Formato de pesos | ONNX |
| Libreria | icefall |
| Tamano del repositorio | 0,9 GB |
| Modelo base | Muno459/zipformer_p-arabic |
| Salida | fonemas (phoneme), con soporte de streaming |
| Descargas / likes | 15 descargas, 18 likes |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Zipformer, un transformer eficiente introducido en el ecosistema icefall que combina codificadores multiescala con atención y convoluciones para reducir coste computacional manteniendo precisión en ASR. Sobre el codificador se sitúa una cabeza CTC (Connectionist Temporal Classification), que permite alineamiento sin necesidad de transcripciones a nivel de frame y habilita decodificación en streaming. El modelo se distribuye en formato ONNX, lo que sugiere un pipeline de exportación orientado a inferencia portable (por ejemplo, con onnxruntime) en lugar de entrenamiento con PyTorch en producción.

El entrenamiento parte del modelo base Muno459/zipformer_p-arabic y se afina con datasets específicos de fonética coránica: Muno459/quran-phonemes y obadx/muaalem-annotated-v3, ambos anotados a nivel de fonema. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR CTC). La innovación principal es la especialización fonética para tajweed y la capacidad de streaming, más que cambios arquitectónicos respecto al Zipformer estándar.

## Capacidades

- Reconocimiento automático del habla en árabe, con salida a nivel de fonema en lugar de solo texto.
- Evaluación de pronunciación y tajweed: la salida fonética permite comparar la recitación con la referencia esperada.
- Modo streaming: adecuado para aplicaciones de corrección en tiempo real.
- Inferencia mediante ONNX, portable a distintos runtimes y plataformas.
- Especialización en recitación coránica, incluyendo variantes de pronunciación anotadas en los datasets de entrenamiento.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo generativo de propósito general).
- No se ha documentado soporte multimodal (visión, audio más allá del ASR) ni capacidades multilingües fuera del árabe.

## Casos de uso

- Corrección de recitación coránica: el modelo transcribe la recitación a fonemas y permite comparar con la secuencia esperada para detectar errores de pronunciación o de tajweed, gracias a su entrenamiento específico en datasets fonéticos coránicos.
- Aplicaciones de aprendizaje interactivo: con soporte de streaming, puede integrarse en apps que evalúan al alumno mientras recita y devuelven retroalimentación inmediata.
- Verificación de calidad en grabaciones: procesar archivos de audio de recitadores para generar transcripciones fonéticas y auditar la fidelidad de la pronunciación en pipelines de producción editorial.
- Investigación en fonética árabe: servir como extractor de etiquetas fonéticas para corpus lingüísticos y estudios de variación de pronunciación.
- Sistemas de búsqueda por recitación: indexar audio coránico mediante transcripción fonética para localizar versículos por cómo se recitan.
- Despliegue en entornos con recursos limitados: al distribuirse en ONNX y con un repositorio de 0,9 GB, puede ejecutarse en servidores modestos o dispositivos edge mediante onnxruntime.
- Herramientas de accesibilidad: transcripción fonética de recitación para personas con dificultades auditivas o para subtitulado especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,9 GB, por lo que la inferencia ONNX debería caber en GPUs consumer con 4-8 GB de VRAM, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, cabría esperar compatibilidad con RTX 3060/4060 en adelante, pero es una estimación no verificada.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio, aunque no se documenta.
- Opciones de despliegue: ONNX Runtime (formato principal), y potencialmente integración con pipelines de icefall/k2; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR CTC).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muno459/zipformer_p-quran | no disponible | no disponible | ASR fonetico arabe coranico | NPL-1.1 (gated) | Hugging Face, ONNX |
| Muno459/zipformer_p-arabic | no disponible | no disponible | ASR arabe general | no disponible | Hugging Face |
| Whisper (OpenAI) | 39M-1.55B segun variante | 30 s de audio | ASR multilingue | MIT | Abierto |
| Muaalem (obadx) | no disponible | no disponible | Fonemas coranicos | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a categoria y disponibilidad.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Licencia NPL-1.1: los términos completos no están disponibles en la información proporcionada; verificar antes de uso comercial.
- Especializado exclusivamente en árabe y en recitación coránica; el rendimiento fuera de ese dominio no está documentado.
- Salida a nivel de fonema: requiere un postprocesado para obtener texto legible.
- Riesgo de errores en pronunciaciones no representadas en los datasets de entrenamiento (Muno459/quran-phonemes, obadx/muaalem-annotated-v3).
- No es un modelo generativo: no soporta razonamiento, tool calling ni agentes.
- No se documentan sesgos específicos ni tasas de alucinación; en ASR CTC el riesgo principal es la sustitución fonética errónea.
- Sin benchmarks publicados: la calidad real en producción debe validarse con datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muno459/zipformer_p-quran
- Modelo base: https://huggingface.co/Muno459/zipformer_p-arabic
- Dataset de fonemas coránicos: https://huggingface.co/datasets/Muno459/quran-phonemes
- Dataset anotado Muaalem: https://huggingface.co/datasets/obadx/muaalem-annotated-v3
- Librería icefall: https://github.com/k2-fsa/icefall
- ONNX Runtime: https://onnxruntime.ai/
