# Oulasong/Qwen3-ASR-0.6B-ThunderTalk

## Resumen

Qwen3-ASR-0.6B-ThunderTalk es un ajuste fino supervisado del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-0.6B, desarrollado por el equipo Qwen de Alibaba. Lo publica el usuario Oulasong como parte de ThunderTalk, una aplicación de dictado por voz gratuita y de código abierto para macOS. El objetivo es mejorar la transcripción en dictado de enunciados cortos en chino, inglés y habla mixta chino-inglés (code-switching), que es el escenario real de uso de la aplicación.

El modelo conserva la arquitectura, el tamano y la velocidad del modelo base: pesos en float16, 1,8 GB, y se carga en los mismos entornos que el original (`qwen-asr`, `mlx-qwen3-asr` o la propia app ThunderTalk). La ganancia medida es modesta pero consistente en enunciados cortos, y el ajuste se seleccionó con una puerta de no regresión para evitar degradaciones en grabaciones largas.

Es relevante para desarrolladores que necesiten un motor ASR ligero, ejecutable en Apple Silicon vía MLX, con licencia Apache-2.0 y soporte nativo de code-switching chino-inglés, un caso poco cubierto por los modelos ASR generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR, pesos en safetensors) |
| Parametros totales | 938.008.576 (según safetensors) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float16) |
| Idiomas soportados | chino (zh), inglés (en), habla mixta chino-inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float16), librería mlx |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-ASR-0.6B y aplica un ajuste fino con LoRA de rango 32 sobre las proyecciones de atención del modelo de lenguaje, manteniendo congelado el codificador de audio. El entrenamiento consistió en una época con learning rate 1e-4 y batch efectivo de 32, ejecutado en un Apple M3 Max. Los datos de entrenamiento (solo splits de train y validación) suman unas 24 horas de audio: 8.907 enunciados de ASCEND de habla conversacional en chino, inglés y mixta con puntuación y mayúsculas restauradas; 2.000 frases leídas de FLEURS en mandarín y 2.000 en inglés; y 1.400 clips de dos o tres frases leídas unidas (15–30 s) para que el modelo no se detenga tras la primera frase.

La selección del checkpoint se hizo por menor error sobre 108 clips de desarrollo reservados, y el adaptador se fusionó con los pesos base a media intensidad. La fusión a intensidad completa mejoraba los clips cortos pero provocaba omisiones o repeticiones de frases en grabaciones largas en inglés, por lo que no superó la puerta de no regresión. El código de entrenamiento y evaluación está en `tools/finetune` y el comando `thundertalk eval` del repositorio ThunderTalk.

## Capacidades

- Reconocimiento automático del habla (ASR) para dictado en chino, inglés y habla mixta chino-inglés.
- Transcripción con puntuación y mayúsculas restauradas en los datos de entrenamiento.
- Manejo de enunciados cortos (frases sueltas) y de grabaciones largas de hasta varios minutos (1,1–4,4 min en el conjunto de evaluación).
- Code-switching: alternancia de chino e inglés dentro de una misma intervención.
- Ejecución en Apple Silicon mediante MLX (`mlx-qwen3-asr`).
- No se documenta soporte de tool calling, agentes, visión, audio de entrada más allá del propio ASR ni modo de razonamiento.

## Casos de uso

- Dictado por voz en macOS: integración directa en la app ThunderTalk para transcribir lo que el usuario dicta en el campo activo, con latencia de 0,15 veces la duración del audio.
- Asistentes de voz para entornos bilingües chino-inglés: transcripción de consultas donde el usuario mezcla ambos idiomas en una misma frase, gracias al ajuste específico sobre habla mixta.
- Subtitulado y notas de reuniones cortas: el modelo mantiene la transcripción más allá de la primera frase en clips de 15–30 s y en grabaciones de hasta ~4 minutos.
- Prototipado rápido en Apple Silicon: al ejecutarse con MLX y pesar 1,8 GB en float16, permite iterar en un portátil con chip M-series sin GPU dedicada.
- Transcripción de comandos cortos en aplicaciones de productividad: la mejora más clara se da en enunciados cortos en chino (de 6,9% a 5,0% de error), el formato típico de dictado de comandos.
- Pipeline de accesibilidad: entrada por voz para usuarios con movilidad reducida en aplicaciones macOS, con licencia Apache-2.0 que permite redistribución.
- Evaluación comparativa de ASR en code-switching: sirve como referencia ligera para medir la calidad de modelos mayores en habla mixta chino-inglés.

## Benchmarks y rendimiento

Tasa de error por token (caracteres CJK y palabras latinas; caso, puntuación, numerales y muletillas normalizados) sobre el conjunto de test estándar de ThunderTalk: 44 grabaciones con transcripción humana de referencia, decodificadas por la ruta de dictado de la app en un M3 Max. Menor es mejor.

| Categoría | Base | Tuned |
|---|---|---|
| Todas | 8,7% | 8,0% |
| Chino corto | 6,9% | 5,0% |
| Inglés corto | 20,2% | 17,2% |
| Mixto chino-inglés corto | 16,1% | 14,7% |
| Chino largo (1,7–4,4 min) | 5,6% | 4,7% |
| Mixto largo (1,1–3,1 min) | 11,4% | 10,8% |
| Inglés largo (1,6–2,9 min) | 8,0% | 8,5% |
| Velocidad (tiempo de proceso ÷ audio) | 0,15 | 0,15 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/tamano en memoria: 1,8 GB en float16 según la model card; el repo ocupa 1,9 GB.
- Hardware de referencia: Apple M3 Max, donde el modelo procesa audio a 0,15 veces su duración (unas 6,7 veces más rápido que tiempo real).
- Cabe en cualquier Mac con Apple Silicon con memoria unificada suficiente; no se documentan requisitos para GPU NVIDIA ni CUDA.
- Despliegue: `mlx-qwen3-asr`, `qwen-asr` y la app ThunderTalk. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ratio de 0,15 sobre M3 Max; no se publican cifras absolutas de latencia ni throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-ThunderTalk | 938 M | zh, en, mixto | Apache-2.0 | no disponible | Ajuste LoRA para dictado; 8,0% error global en test propio |
| Qwen/Qwen3-ASR-0.6B (base) | 938 M | zh, en | Apache-2.0 | no disponible | 8,7% error global en el mismo test; referencia directa |
| Whisper (variantes pequeñas) | no disponible | multilingüe | MIT | no disponible | Alternativa ASR generalista; sin datos comparativos en la información disponible |

No se dispone de comparaciones con otros modelos ASR en la información proporcionada más allá del modelo base.

## Limitaciones y advertencias

- La mejora es modesta (0,7 puntos porcentuales en el global) y se concentra en enunciados cortos; en habla distinta a la de los corpus de entrenamiento (ASCEND, FLEURS) la ganancia puede ser menor.
- El inglés largo empeora ligeramente (de 8,0% a 8,5%), aunque el autor lo atribuye a dos grabaciones y a la tolerancia de 1 punto de la puerta de no regresión.
- Los clips cortos de test provienen de los mismos corpus usados en entrenamiento, por lo que puede existir cierto solapamiento de dominio y los resultados no son directamente extrapolables a otros dominios.
- Sesgos conocidos: no documentados; al entrenarse sobre ASCEND y FLEURS, puede heredar los sesgos de esos corpus (hablantes, acentos y temáticas limitadas).
- Riesgo de alucinación: no evaluado de forma específica; en ASR se traduce en omisiones o repeticiones de frases, fenómeno observado con la fusión a intensidad completa en inglés largo.
- Limitaciones de idioma: solo chino, inglés y mezcla de ambos; no se documenta soporte de otros idiomas ni de acentos no representados en los datos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento incluyen ASCEND (CC BY-SA 4.0) y FLEURS (CC BY 4.0), cuyas condiciones conviene revisar para usos derivados.
- Requiere entorno MLX/Apple Silicon para el flujo documentado; no se garantiza funcionamiento en otras plataformas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oulasong/Qwen3-ASR-0.6B-ThunderTalk
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio ThunderTalk: https://github.com/realAllenSong/ThunderTalk
- Código de ajuste fino: https://github.com/realAllenSong/ThunderTalk/tree/main/tools/finetune
- Dataset ASCEND: https://huggingface.co/datasets/CAiRE/ASCEND
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
