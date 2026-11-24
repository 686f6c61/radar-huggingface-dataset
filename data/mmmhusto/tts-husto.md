# mmmhusto/TTS-husto

## Resumen

TTS-husto es un modelo de síntesis de voz (text-to-speech) bilingüe inglés-eslovaco desarrollado por el usuario mmmhusto. Se distribuye como un modelo acústico de aproximadamente 41,8 millones de parámetros acompañado de un vocoder BigVGAN compartido que opera a 24 kHz, lo que permite generar audio en ambos idiomas a partir de los mismos pesos acústicos. La versión actual, v3.0, es un ajuste fino sobre la línea English Duo que incorpora el eslovaco como idioma experimental.

El modelo resuelve un problema concreto: disponer de un TTS ligero, bilingüe y desplegable localmente, con cinco perfiles de voz predefinidos (dos en inglés y tres en eslovaco) y exportación ONNX para su ejecución en navegador. Su tamaño reducido y su licencia CC BY-SA 4.0 lo hacen apto para prototipado, demos y aplicaciones donde no se requiere un TTS neuronal de gran escala.

Es relevante ahora porque combina un modelo acústico compacto con un vocoder de calidad y una ruta de despliegue web (ONNX), algo poco habitual en modelos TTS de este tamaño y con soporte para una lengua de bajos recursos como el eslovaco, aunque esta última faceta se presenta explícitamente como experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo acústico TTS con vocoder BigVGAN compartido (detalles internos no disponibles) |
| Parámetros totales | 41.828.490 (modelo acústico, safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (se distribuye en safetensors y ONNX) |
| Idiomas soportados | Inglés (en), eslovaco (sk) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (modelo acústico), ONNX (exportación web), pesos BigVGAN para el vocoder |

## Arquitectura y entrenamiento

El modelo se compone de un modelo acústico que genera representaciones a partir de texto y de un vocoder BigVGAN compartido que sintetiza la forma de onda a 24 kHz. Los mismos pesos acústicos se emplean para inglés y eslovaco, con perfiles de voz diferenciados por idioma. La versión publicada parte del checkpoint bilingüe derivado del entrenamiento English Duo (42M) y se evaluó tras 2.200 pasos adicionales con voz eslovaca original.

El entrenamiento del eslovaco utilizó el frontend de fonemas eslovaco del proyecto, ejemplos de los conjuntos Lili, SlovakSpeech y TrePal, junto con repetición de datos en inglés (replay) para preservar el rendimiento en ese idioma. El perfil masculino eslovaco emplea la fila de hablante ajustada sobre SlovakSpeech Male. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. La versión v1.0 incluía 590 voces, dos estilos de habla, modo rápido y clonación de voz; la v3.0 se limita a cinco perfiles de voz.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés y eslovaco con pesos acústicos compartidos.
- Cinco perfiles de voz: `en_hifi_92_clean` y `en_dt_0` (inglés); `sk_muz`, `sk_cori` y `sk_dailytalk` (eslovaco).
- Generación de audio a 24 kHz mediante vocoder BigVGAN.
- Exportación ONNX para inferencia en navegador (directorio `web/`).
- Frontend de fonemas eslovaco incluido (`slovak-frontend.zip`).
- La línea v1.0 disponía de 590 voces, dos estilos de habla, modo rápido y clonación de voz; estas capacidades no se listan para v3.0.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Lectura de textos en inglés y eslovaco en aplicaciones de accesibilidad: el modelo puede convertir artículos o documentos en audio con una de las cinco voces disponibles, adecuado por su tamaño reducido para ejecución local.
- Demos web de síntesis de voz: la exportación ONNX del directorio `web/` permite integrar la síntesis en el navegador sin backend dedicado, útil para prototipos y pruebas de concepto.
- Locución para contenido educativo bilingüe: permite generar narraciones en inglés y eslovaco con el mismo modelo, simplificando el mantenimiento de un pipeline único.
- Pruebas de integración de TTS en pipelines de Python: el script `povedz.py` permite invocar la síntesis por línea de comandos, lo que facilita su incorporación en scripts y automatizaciones.
- Investigación en TTS para lenguas de bajos recursos: el eslovaco experimental y el frontend de fonemas incluido sirven como base para estudiar adaptación de modelos ingleses a otras lenguas.
- Generación de avisos o mensajes cortos automatizados: con prompts breves como saludos o frases de estado, el modelo puede producir audio para sistemas de notificación, aunque con las limitaciones de calidad del eslovaco experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, MCD, WER) en la información disponible. La model card sí reporta una evaluación cualitativa del eslovaco: sobre 12 prompts eslovacos desafiantes, los perfiles Cori y DailyTalk produjeron 26 y 31 errores de transcripción respectivamente sobre 84 palabras cada uno.

| Evaluación | Perfil | Errores / palabras | Contexto |
|---|---|---|---|
| Prompts eslovacos desafiantes | `sk_cori` | 26 / 84 | 12 prompts |
| Prompts eslovacos desafiantes | `sk_dailytalk` | 31 / 84 | 12 prompts |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 41,8M de parámetros acústicos más el vocoder BigVGAN, la huella es reducida y cabe holgadamente en GPUs de consumo, aunque no se publican cifras exactas.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna (por ejemplo, serie RTX 30/40) debería ser suficiente, pero es una estimación, no un dato del autor.
- Cabe en GPU consumer: sí, por el tamaño del modelo (estimación basada en el número de parámetros).
- Opciones de despliegue: script Python del proyecto (`povedz.py`) con dependencias del proyecto y código fuente de NVIDIA BigVGAN; exportación ONNX para navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El eslovaco es experimental: la propia model card reporta tasas de error de transcripción notables (26/84 y 31/84 palabras en los perfiles Cori y DailyTalk).
- Solo cinco perfiles de voz en v3.0, frente a las 590 voces de v1.0; las capacidades de clonación y estilos de habla no se documentan para esta versión.
- No se publican métricas objetivas de calidad (MOS, MCD) ni benchmarks estándar.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones para productos propietarios.
- Los datos de entrenamiento incluyen conjuntos con licencias propias (SlovakSpeech CC BY-SA 4.0, Lili CC0, TrePal CC BY 4.0), cuyas condiciones de atribución deben respetarse.
- No se documentan sesgos específicos ni riesgos de alucinación en el sentido de generación de contenido; en TTS el riesgo principal es la pronunciación incorrecta o la ininteligibilidad, ya evidenciada en eslovaco.
- Para producción en eslovaco se recomienda validación adicional con hablantes nativos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mmmhusto/TTS-husto
- Demo bilingüe (Space): https://huggingface.co/spaces/mmmhusto/TTS-English-demo
- Créditos y versión English Duo (v2.0): https://huggingface.co/mmmhusto/TTS-husto/tree/v2.0
- Dataset SlovakSpeech Male: https://huggingface.co/datasets/neurlang/slovakspeech_male_dataset
- Dataset SlovakSpeech Female: https://huggingface.co/datasets/neurlang/slovakspeech_female_dataset
- Dataset Lili: https://huggingface.co/datasets/vsisik/voice-dataset-lili
- Dataset TrePal: https://huggingface.co/datasets/streams-sro/trepal
