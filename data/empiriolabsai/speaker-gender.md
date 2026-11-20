# empiriolabsai/speaker-gender

## Resumen

Speaker Gender es un clasificador de audio que etiqueta la voz de un clip de habla como `female` o `male`, devolviendo una probabilidad para cada clase. Lo desarrolla EmpirioLabs AI, un proveedor de modelos de decisión y hosting de IA, y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El modelo está construido sobre `facebook/wav2vec2-xls-r-300m` mediante fine-tuning y cuenta con 315.701.659 parámetros totales, con un repositorio de 2,9 GB que incluye pesos en safetensors y ONNX.

El modelo resuelve un problema acotado pero frecuente en pipelines de voz: la clasificación binaria de género percibido del hablante a partir de audio a 16 kHz. Su principal argumento es la cobertura multilingüe: el autor declara pruebas sobre habla en 43 idiomas, desde inglés, español o chino hasta euskera, kinyarwanda o uigur, con una precisión equilibrada (balanced accuracy) de 0,973 en su conjunto de prueba principal de 54.660 clips y 7.724 hablantes.

Es relevante ahora por tres motivos concretos: se integra en la pipeline estándar `audio-classification` de `transformers` sin código personalizado, ofrece pesos ONNX en precisión completa e int8 para ejecución en navegador y edge mediante transformers.js, y su rendimiento declarado supera al de las alternativas abiertas más descargadas en todos los conjuntos de prueba reportados. No es un modelo generativo ni un LLM: es un cabezal de clasificación sobre un encoder de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (encoder convolucional + transformer) con cabezal de clasificación; fine-tuning de facebook/wav2vec2-xls-r-300m |
| Parametros totales | 315.701.659 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrada de audio a 16 kHz, clips recomendados de 2 a 15 segundos |
| Tipos de cuantizacion | ONNX en precisión completa e int8 (`onnx/model_quantized.onnx`, 356 MB); safetensors en precisión completa |
| Idiomas soportados | 43 idiomas: ar, ba, bn, ca, ckb, cs, cy, de, en, eo, es, et, eu, fa, fr, fy, gl, hi, hu, it, ja, ka, kab, ko, lg, lv, mhr, nl, pl, pt, ru, rw, sw, ta, th, tr, ug, uk, ur, uz, vi, yue, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (precisión completa e int8) |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-xls-r-300m`, un encoder de voz preentrenado de forma autosupervisada sobre audio multilingüe, y le añade un cabezal de clasificación para dos clases (`female`, `male`). La entrada es audio mono a 16 kHz, que puede pasarse como ruta de fichero (decodificada con ffmpeg) o como array float con `{"raw": array, "sampling_rate": 16000}`. La salida es una distribución de probabilidad sobre las dos etiquetas.

La model card no detalla el volumen de datos de fine-tuning, la composición exacta del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables en un clasificador de este tipo). Sí documenta la evaluación: las métricas se midieron el 2026-11-20 sobre hablantes que el modelo no había visto, usando balanced accuracy (media del recall de `female` y de `male`). El autor indica que el fichero ONNX int8 puntúa dentro de 0,001 de la precisión completa, lo que hace viable el despliegue cuantizado sin pérdida práctica de rendimiento.

## Capacidades

- Clasificación binaria de género percibido del hablante (`female` / `male`) con probabilidad por clase.
- Procesamiento de audio a 16 kHz en la pipeline estándar `audio-classification` de `transformers`.
- Ejecución en navegador y Node.js mediante transformers.js con `dtype: "q8"` (ONNX int8) o precisión completa.
- Ejecución en edge con ONNX Runtime.
- Cobertura multilingüe declarada sobre 43 idiomas, incluidos idiomas de bajos recursos como euskera, kinyarwanda, uigur, cabileño o mari.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión ni audio generativo: es exclusivamente un clasificador.

## Casos de uso

- Analítica agregada de grabaciones de voz: clasificar grandes volúmenes de audio para obtener estadísticas de distribución por género percibido en un corpus, con la salvedad de que debe usarse de forma agregada y no para decisiones individuales.
- Equilibrado y filtrado de datasets de habla: etiquetar clips automáticamente para construir conjuntos de entrenamiento balanceados por género percibido, reduciendo el trabajo manual de anotación en corpus multilingües.
- Enrutado en aplicaciones de voz: seleccionar modelos de síntesis o de reconocimiento optimizados por tipo de voz, o adaptar la presentación de una interfaz conversacional, siempre con consentimiento de las personas grabadas.
- Preprocesado en pipelines de diarización: como señal auxiliar para etiquetar segmentos de un solo hablante antes de un sistema de separación de hablantes.
- Moderación y control de calidad de audio: detectar clips que no cumplen los requisitos de un corpus (por ejemplo, verificar que el hablante esperado es el que aparece) en flujos de validación automatizados.
- Procesamiento en el navegador: aplicaciones web que clasifican audio localmente con transformers.js y el modelo int8 de 356 MB, sin enviar el audio a un servidor, lo que reduce latencia y exposición de datos.
- Investigación en fonética y sociolingüística: análisis de corpus multilingües para estudiar la percepción de género en la voz a escala, con las cautelas éticas correspondientes.

## Benchmarks y rendimiento

Datos reportados por EmpirioLabs el 2026-11-20 sobre hablantes no vistos. Métrica: balanced accuracy (media del recall de `female` y `male`); mayor es mejor. Todos los modelos respondieron a los mismos clips.

| Conjunto de prueba | Speaker Gender | alefiury xlsr-53 gender | prithivMLmods Common-Voice gender |
|---|---:|---:|---:|
| Habla leída, 40 idiomas (54.660 clips, 7.724 hablantes) | **0,973** | 0,957 | 0,962 |
| FLEURS test, 12 idiomas (8.035 clips) | **0,971** | 0,876 | 0,959 |
| Peor de los 27 idiomas con más de 100 clips por etiqueta | **0,900** | 0,876 | 0,895 |

Precisión por idioma en habla leída (extracto de la tabla publicada): ar 0,997; ba 1,000; bn 1,000; ca 0,975; ckb 0,891; cs 0,997; cy 0,973; de 0,959; en 0,971; eo 0,989; es 0,990; et 0,993; eu 0,976; fa 0,979; fr 0,954; fy 0,963; gl 0,968; hu 0,975; it 0,982; ja 0,978; ka 0,994; kab 1,000; lg 0,900; lv 0,952; mhr 0,995; nl 0,982; pl 0,992; pt 0,954; ru 0,983; rw 0,935; sw 0,969; ta 0,945; th 0,985; tr 0,981; ug 0,921; uk 0,997; ur 0,986; uz 0,982; yue 0,958; zh 0,950.

En FLEURS, las puntuaciones por idioma van de 0,895 (francés) a 1,000, salvo japonés: los tres modelos etiquetan como `male` los 79 clips marcados como `female`, lo que la tabla cuenta como error. El fichero ONNX int8 puntúa dentro de 0,001 de la precisión completa. No se han publicado datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 315,7 M de parámetros; en FP32 son aproximadamente 1,26 GB de pesos, en FP16 unos 0,63 GB y en int8 unos 0,32 GB (el fichero ONNX int8 ocupa 356 MB en disco). El pico real de memoria incluye activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente; una RTX 4090, A100 o H100 ofrecen margen de sobra y permiten lotes grandes para procesar corpus completos.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, entre otras) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline("audio-classification")`, ONNX Runtime, transformers.js en navegador y Node.js, y servidores de inferencia compatibles con la pipeline de transformers (por ejemplo, TGI o endpoints compatibles). El modelo no es generativo, por lo que vLLM y llama.cpp no aplican.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Balanced accuracy (habla leída, 40 idiomas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| empiriolabsai/speaker-gender | 315,7 M | audio 16 kHz, clips de 2-15 s | 0,973 | Apache 2.0 | Hugging Face, ONNX, transformers.js |
| alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech | no disponible en la información | audio 16 kHz | 0,957 | no disponible en la información | Hugging Face |
| prithivMLmods/Common-Voice-Gender-Detection | no disponible en la información | audio 16 kHz | 0,962 | no disponible en la información | Hugging Face |

En FLEURS (12 idiomas), Speaker Gender obtiene 0,971 frente a 0,876 de alefiury y 0,959 de prithivMLmods. El autor advierte que el modelo de prithivMLmods aprendió de habla leída de origen colaborativo, similar al primer conjunto de prueba, por lo que su puntuación ahí podría incluir clips ya vistos.

## Limitaciones y advertencias

- Solo dos etiquetas, aprendidas de hablantes que se describieron como female o male. El modelo reporta cómo suena una voz, no la identidad de género de una persona, y fallará en algunas voces.
- Un único hablante adulto por clip. Niños, canto, susurros, hablantes solapados y ruido intenso quedan fuera de lo probado; el audio telefónico no se evaluó.
- La precisión varía por idioma entre 0,89 y 1,00; el peor caso entre los idiomas con más de 100 clips por etiqueta es 0,900 (lg) y el más bajo de la tabla es 0,891 (ckb).
- El japonés presenta un fallo sistemático en FLEURS: los tres modelos comparados etiquetan como `male` los 79 clips marcados como `female`.
- Riesgo de sesgo: la clasificación de género percibido puede amplificar estereotipos y producir errores desproporcionados en determinadas voces; no debe usarse para tomar decisiones sobre personas (acceso, elegibilidad, verificación de identidad).
- La licencia Apache 2.0 permite uso comercial, pero el uso ético y legal del modelo (consentimiento de las personas grabadas, normativa de protección de datos) es responsabilidad del desplegador.
- No se han publicado datos de latencia, throughput ni del volumen y composición del dataset de fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/speaker-gender
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Comparativa alefiury: https://huggingface.co/alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech
- Comparativa prithivMLmods: https://huggingface.co/prithivMLmods/Common-Voice-Gender-Detection
- Licencia: https://huggingface.co/empiriolabsai/speaker-gender/blob/main/LICENSE
- Web de EmpirioLabs: https://empiriolabs.ai
- Plataforma: https://platform.empiriolabs.ai
- Documentación: https://docs.empiriolabs.ai
- Discord: https://discord.gg/bM52azW4ZD
