# Rabe3/VoxCPM_mid_najdi

## Resumen

VoxCPM_mid_najdi es un ajuste fino completo (full fine-tune) del modelo de síntesis de voz VoxCPM2, desarrollado por Rabe3 sobre la base openbmb/VoxCPM2 de OpenBMB. Está especializado en árabe dialectal najdi (región de Arabia Saudí) y acepta texto diacritizado (con tashkeel) para controlar la pronunciación en la generación. El modelo resuelve el problema de la falta de control fonético en TTS dialectal: al entrenar sobre texto con marcas vocálicas, las harakat (fatha, damma, kasra, shadda) modifican directamente la articulación de la voz sintetizada.

La arquitectura subyacente es VoxCPM2, un sistema tokenizer-free que genera representaciones continuas de habla mediante un modelo de difusión autorregresiva, sin discretización intermedia. El modelo tiene 2.290.004.544 parámetros (~2,29 B) y produce audio a 48 kHz. Se distribuye bajo licencia Apache-2.0 y está pensado para investigadores y desarrolladores que necesitan síntesis de voz árabe dialectal de alta calidad con control fino de la pronunciación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (diffusion autoregressive, tokenizer-free) |
| Parametros totales | 2.290.004.544 (~2,29 B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (referencia de audio limitada a 10 s en entrenamiento) |
| Tipos de cuantizacion | no disponible (safetensors en precisión original) |
| Idiomas soportados | ar (árabe, dialecto najdi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VoxCPM2 es un sistema de TTS que elimina el tokenizador de audio: en lugar de convertir el habla en tokens discretos, genera directamente representaciones continuas mediante un backbone basado en MiniCPM-4 con una cabeza de difusión autorregresiva. Esto permite una síntesis más natural y expresiva, y facilita la clonación de voz con pocos segundos de referencia. El ajuste fino completo (no LoRA) fue necesario porque la tokenización de diacríticos en VoxCPM2 cae en un fallback de bytes cuyas incrustaciones (embeddings) arrastran asociaciones del preentrenamiento en fusha/coránico; solo un fine-tune que descongele todas las capas excepto el AudioVAE puede reentrenar esas filas de embedding.

El entrenamiento se realizó sobre un corpus de 292.217 filas (515,8 horas) derivado de 377 horas de YouTube en najdi con aproximadamente 1.032 hablantes. El 70,5% de las filas llevan diacríticos, generados por un diacritizador acústico (Cohere-Speech-Tashkeel-2B) que refleja cómo se pronunció cada palabra en el audio, no una predicción textual. Se incluyeron 83.830 duplicados sin marcas del mismo audio para enseñar al modelo que los diacríticos son modificadores opcionales de la misma voz. El entrenamiento duró una época (18.264 pasos) con batch efectivo 16, learning rate 1e-5, weight decay 0.01, warmup 100 y max_grad_norm 1.0, en una única GPU H200. La pérdida de validación bajó de 0.9689 (paso 0) a 0.7834 (paso 15k, mejor) y 0.7848 al final.

## Capacidades

- Síntesis de voz en árabe najdi con control de pronunciación mediante diacríticos (fatha, damma, kasra, shadda).
- Clonación de voz zero-shot a partir de un audio de referencia (hasta 10 s en entrenamiento).
- Generación de audio a 48 kHz, superior a los 16 kHz de muchos TTS.
- Soporte de textos largos mediante chunking en límites de frase (hasta ~15 s por fragmento con buena calidad).
- Producción de habla dialectal auténtica, incluyendo la pronunciación del gaf como /g/ (rasgo del najdi).
- Compatible con el ecosistema VoxCPM (CLI, ComfyUI, etc.).

## Casos de uso

- Audiolibros en dialecto najdi: el control de diacríticos permite leer textos literarios o religiosos con la pronunciación correcta de cada palabra, manteniendo el registro coloquial.
- Asistentes de voz para Arabia Saudí: integración en aplicaciones de atención al cliente o asistentes personales que requieren un acento regional auténtico, con clonación de voz para personalizar el asistente.
- Doblaje de contenido regional: doblaje de vídeos, series o anuncios dirigidos a la población de la región de Najd, donde el uso de diacríticos garantiza la entonación correcta.
- Accesibilidad para hablantes de najdi: síntesis de voz para personas con discapacidad visual que leen textos diacritizados en su dialecto materno.
- Educación y aprendizaje de idiomas: generación de ejemplos de pronunciación correcta en najdi, útil para estudiantes del dialecto o para herramientas de práctica de conversación.
- Creación de contenido para podcasts y redes sociales: generación de voces para canales de YouTube o TikTok en árabe saudí, con clonación de la voz del creador.
- Investigación en TTS dialectal: como modelo de referencia para estudiar el efecto de los diacríticos en la síntesis de voz y para comparar con otros enfoques de control fonético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque es un modelo de TTS, no de lenguaje general. La model card incluye mediciones de WER (word error rate) de transcripción inversa sobre el audio generado, que es la métrica habitual para evaluar inteligibilidad:

| Configuracion | WER (transcripcion inversa) |
|---|---|
| Single-shot 47 s (sin chunking) | 0.410 - 0.476 |
| Chunking por coma + fallback de palabra (8 chunks) | 0.105 |
| Chunking por puntos y signos de interrogacion (16 chunks) | 0.069 |
| Chunks de hasta ~15 s | 0.040 - 0.100 |

El modelo también fue evaluado con diferentes valores de `cfg_value`: 2.0 superó a 1.5 y 1.3 (WER 0.250 vs 0.500), por lo que se recomienda no bajar de 2.0. No hay comparativas con otros modelos TTS árabes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay datos oficiales. Con 2,29 B parámetros en FP16, el modelo base ocuparía ~4,6 GB, pero el TTS incluye el AudioVAE y buffers adicionales; una estimación prudente es entre 6 y 10 GB en FP16. Con cuantización a 8 bits podría caber en GPUs de 8 GB.
- GPU recomendadas: el entrenamiento se realizó en una H200. Para inferencia, una RTX 4090 (24 GB) o A100 (40/80 GB) son suficientes sin cuantización. GPUs de gama media como RTX 3060 (12 GB) podrían funcionar con cuantización o con batch pequeño.
- ¿Cabe en consumer GPU? Sí, probablemente en RTX 4090 y posiblemente en GPUs de 12 GB con cuantización, aunque no hay pruebas publicadas.
- Opciones de despliegue: CLI oficial de VoxCPM (`voxcpm clone`), integración con ComfyUI mediante nodos, y servidores de inferencia que soporten el formato safetensors de VoxCPM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre este modelo y otras alternativas de TTS árabe dialectal. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| VoxCPM2 (base) | 2,29 B | no disponible | 30+ idiomas | Apache-2.0 | Modelo base multilingüe sin control de diacríticos |
| VoxCPM_mid_najdi | 2,29 B | no disponible | ar (najdi) | Apache-2.0 | Fine-tune con diacríticos, 48 kHz |
| Otros TTS árabes (p. ej. XTTS-v2, Coqui) | variable | no disponible | ar (MSA y dialectos) | varias | Sin control fino de diacríticos, calidad variable |

La ventaja principal de este modelo es el control de pronunciación vía diacríticos, algo poco común en TTS árabe, y su enfoque específico en el dialecto najdi.

## Limitaciones y advertencias

- El texto de entrada debe estar diacritizado en la misma convención que el entrenamiento: marcas pausales finales eliminadas, vocales dialectales (no MSA) y sin terminaciones i'rab. Texto con diacríticos MSA estándar queda fuera de distribución.
- No se incluye un diacritizador de texto en el stack; el diacritizador usado para los datos es acústico y requiere audio. Para usar el modelo con texto sin marcas, hay que diacritizarlo externamente.
- La cobertura de marcas en los datos de entrenamiento es de ~80%, por lo que las frases generadas pueden tener palabras sin diacríticos; es un comportamiento esperado, no un defecto.
- Para textos largos (>20 s) es obligatorio dividir en chunks; una sola pasada autorregresiva degenera en balbuceo silábico (WER >0.4).
- El audio de referencia está limitado a 10 s en entrenamiento; referencias más largas no están probadas.
- El modelo está entrenado exclusivamente en najdi; la pronunciación del gaf como /g/ es intencional, pero puede sonar incorrecta para hablantes de otros dialectos árabes.
- Licencia Apache-2.0 permite uso comercial, pero el corpus de entrenamiento deriva de YouTube; es recomendable verificar los derechos de los datos originales para usos comerciales.
- No hay información sobre sesgos o alucinaciones específicas, pero al ser un TTS, el riesgo principal es la generación de audio con errores de pronunciación o entonación en textos fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rabe3/VoxCPM_mid_najdi
- Repositorio oficial de VoxCPM (OpenBMB): https://github.com/OpenBMB/VoxCPM/
- Sitio web de VoxCPM: https://voxcpm.com/en/
- Nodo de ComfyUI para VoxCPM: https://github.com/wildminder/ComfyUI-VoxCPM
- Repositorio de LoRAs del autor (relacionado): https://huggingface.co/Rabe3/vox-loras/tree/main
- Diacritizador acústico usado en el entrenamiento: https://huggingface.co/NAMAA-Space/Cohere-Speech-Tashkeel-2B
