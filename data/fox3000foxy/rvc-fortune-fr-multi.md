# fox3000foxy/rvc-fortune-fr-multi

## Resumen

Fortune FR — RVC v2 40k es un modelo de conversión de voz (voice conversion, no TTS completo) entrenado con la implementación oficial RVC v2 a 40 kHz con extracción de pitch RMVPE. Lo desarrolla el usuario fox3000foxy y está publicado en Hugging Face bajo licencia "other" con la advertencia explícita de que el repositorio es privado y no debe redistribuirse. El modelo convierte una señal de voz de entrada en una voz femenina francesa sintética preservando prosodia y contenido lingüístico, y no genera habla desde texto.

El checkpoint final corresponde a la epoch 50 y se distribuye en formato `.pth` propietario de RVC (pesos en fp16 más un bloque `config` de 18 parámetros para v2 40k), acompañado de un índice FAISS para búsqueda de timbre y un fichero de parámetros listo para el servidor w-okada. El repositorio ocupa 11,4 GB e incluye checkpoints intermedios, scripts de entrenamiento en Modal y un servidor de inferencia en tiempo real.

Es relevante para quienes trabajan en doblaje, clonación de voz controlada o pipelines de conversión de voz en francés con control emocional, porque cubre seis emociones (cólera, tristeza, alegría, sorpresa, interrogativa, narración) más un registro neutro sobre 6,4 horas de audio. No es un modelo de lenguaje ni un sistema multimodal: es un modelo acústico de conversión de hablante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion), generador VITS-like con encoder HuBERT y pitch RMVPE |
| Parámetros totales | no disponible (config v2 40k: `[1025, 32, 192, 192, 768, 2, 6, 3, 0, "1", [3,7,11], [[1,3,5]]x3, [10,10,2,2], 512, [16,16,4,4], 109, 256, 40000]`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de conversión de voz por segmentos; segmento de entrenamiento 12800 muestras) |
| Tipos de cuantización | fp16 en los pesos del checkpoint final; no se documentan otras cuantizaciones |
| Idiomas soportados | francés (`fr`) |
| Licencia | other (repo privado, no redistribuir) |
| Formato de pesos | `.pth` (RVC estándar: `weight` + `config`), índice FAISS `.index`, JSON de parámetros w-okada |

## Arquitectura y entrenamiento

El modelo sigue la receta oficial RVC v2 a 40 kHz: un encoder de contenido HuBERT (`hubert_base`, 768 dimensiones) extrae representaciones lingüísticas del audio de entrada, un extractor de pitch RMVPE proporciona el contorno de f0, y un generador con arquitectura de tipo VITS (bloques residuales con dilation rates `[1,3,5]`, upsampling `[10,10,2,2]` y `[16,16,4,4]`, 109 tokens de vocabulario) sintetiza la forma de onda a 40 kHz. El índice FAISS permite la recuperación de timbre característica de RVC, con un `indexRatio` recomendado de 0,5.

El entrenamiento se realizó sobre 6,4 horas de audio (2879 clips) en francés con etiquetas emocionales, con batch 6, segmento de 12800 muestras, `c_mel` 45 y `c_kl` 1,0. Se ejecutaron 50 epochs en dos fases: 0→25 y una reanudación 25→50 que carga `G_25850`/`D_25850` como preentrenamiento. La pérdida `loss_mel` final es aproximadamente 20 y se estabiliza a partir de la epoch 15, comportamiento esperado con un dataset de este tamaño. El checkpoint final se convirtió con la receta oficial `savee()` (sin `enc_q`, pesos en fp16) para que sea cargable por w-okada, ya que el checkpoint bruto de entrenamiento (con `model`, `iteration` y `optimizer`) no lo es.

## Capacidades

- Conversión de voz (voice conversion) de una señal de entrada a una voz femenina francesa, preservando contenido y prosodia.
- Control emocional sobre seis registros: cólera, tristeza, alegría, sorpresa, interrogativa y narración, además del registro neutro.
- Extracción de pitch con RMVPE, lo que permite conservar entonación y curvas melódicas del hablante de origen.
- Recuperación de timbre mediante índice FAISS, ajustable con `indexRatio` (recomendado 0,5) y `protect` (recomendado 0,5).
- Inferencia en tiempo real sobre GPU T4 mediante el servidor w-okada incluido en el repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No es un modelo TTS: no convierte texto en voz por sí mismo, requiere un audio de entrada.
- Monolingüe: únicamente francés.

## Casos de uso

- Doblaje y localización al francés: convertir las interpretaciones de actores de voz hacia un timbre femenino consistente y con emoción controlada, manteniendo la sincronía labial y la prosodia originales gracias a la preservación de f0 con RMVPE.
- Producción de audiolibros y narración: usar el registro "storytelling" del modelo para convertir lecturas de referencia en una voz estable a lo largo de capítulos largos, con el índice FAISS fijado para evitar derivas de timbre.
- Prototipado de asistentes de voz en francés: integrar el servidor w-okada sobre una T4 para generar respuestas habladas con latencia de tiempo real en demos y pruebas de concepto, alimentando el modelo con la salida de un TTS externo.
- Investigación en conversión de voz emocional: el modelo sirve como baseline con etiquetas de emoción y permite comparar estrategias de recuperación de timbre (`indexRatio`) y protección de consonantes (`protect`) sobre un corpus francés de 6,4 horas.
- Postproducción de pódcast y contenido: unificar la voz de distintos colaboradores hacia un timbre femenino francés concreto, aplicando el modelo por segmentos y manteniendo coherencia entre episodios.
- Creación de personajes sintéticos para videojuegos o animación: disponer de una voz francesa con variación emocional preentrenada reduce el trabajo de grabación y permite iterar sobre interpretaciones sin regrabar al actor.
- Evaluación de pipelines RVC: los checkpoints intermedios de la epoch 25 y los scripts de entrenamiento en Modal permiten reproducir el proceso y medir el impacto del número de epochs y del tamaño del dataset en la pérdida mel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de entrenamiento (`loss_mel` final ~20, estabilizada desde la epoch ~15) y no incluye métricas objetivas de calidad (MOS, MCD, WER sobre ASR) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor reporta ejecución en tiempo real sobre una GPU T4 (16 GB) con el servidor w-okada.
- GPU recomendadas: NVIDIA T4 para despliegue en Modal (configuración validada por el autor); cualquier GPU con soporte CUDA y al menos 16 GB es un punto de partida razonable, aunque no se documentan pruebas en otras.
- GPU de consumo: no se documenta compatibilidad con RTX 4090, RTX 3090 u otras GPU consumer; el tamaño del repositorio (11,4 GB) incluye checkpoints intermedios y scripts, no solo el modelo final.
- Opciones de despliegue: w-okada (servidor de inferencia en tiempo real incluido con túnel Cloudflare), y el ecosistema RVC estándar (scripts oficiales, GUI de RVC). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el autor afirma latencia de tiempo real en T4, sin cifras concretas de milisegundos ni de factor de tiempo real (RTF).

## Comparativa con modelos similares

| Modelo | Tipo | Sample rate | Idiomas | Emociones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Fortune FR — RVC v2 40k | RVC v2 | 40 kHz | fr | 6 + neutro | other (no redistribuir) | Hugging Face, repo privado |
| RVC v2 oficial (base) | RVC v2 | 40 kHz | multi (según dataset) | no nativo | MIT (código) | GitHub RVC-Project |
| Modelos RVC comunitarios | RVC v1/v2 | 32/40/48 kHz | variable | variable | variable | Hugging Face, weights.gg, etc. |
| Sistemas TTS comerciales (p. ej. ElevenLabs) | TTS + clonación | variable | multi | parcial | propietaria | API/SaaS |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a características estructurales: Fortune FR destaca por su cobertura emocional explícita y su sample rate de 40 kHz, pero su licencia restrictiva y su naturaleza monolingüe lo hacen menos versátil que las alternativas comerciales o que los modelos RVC genéricos.

## Limitaciones y advertencias

- Licencia "other" con restricción explícita: el autor indica que el repositorio es privado y que no debe redistribuirse, citando que la voz y el dataset provienen de ElevenLabs. El uso comercial no está autorizado de forma clara y requiere contacto con el autor.
- Riesgo legal por derechos de voz y de dataset: al derivarse de una voz sintética generada por un servicio de terceros, la cadena de derechos es opaca y puede impedir su uso en producción.
- Monolingüe en francés: no se ha entrenado ni evaluado en otros idiomas; su uso con audio en castellano u otras lenguas producirá artefactos y pérdida de inteligibilidad.
- No es un TTS: requiere un audio de entrada; no genera habla a partir de texto.
- Sesgos de dataset: 6,4 horas de audio con 2879 clips es un corpus pequeño y desequilibrado por emoción; el modelo puede sobreajustar a las características del hablante de origen y reproducir su acento o idiosincrasias.
- Riesgo de alucinación acústica: en segmentos con ruido, solapamientos o pitch extremo, RVC puede generar artefactos, consonantes ininteligibles o contornos de f0 incorrectos.
- Sin métricas objetivas publicadas: no hay MOS, MCD ni evaluaciones perceptuales, por lo que la calidad real solo puede validarse con pruebas propias.
- Checkpoint bruto no cargable: solo `fortune-fr-multi.pth` es utilizable con w-okada; el resto de checkpoints intermedios son de respaldo y requieren conversión.
- Repositorio de 11,4 GB con checkpoints intermedios y scripts: conviene descargar solo los ficheros necesarios para inferencia.
- Fecha de creación y actualización del repositorio (2026-11-16) posterior a la fecha actual de referencia en muchos entornos; verificar la integridad de los ficheros antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fox3000foxy/rvc-fortune-fr-multi
- Repositorio oficial RVC-Project: https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI
- Servidor w-okada (voice changer en tiempo real): https://github.com/w-okada/voice-changer
- Extracción de pitch RMVPE: https://github.com/Dream-High/RMVPE
- HuBERT (encoder de contenido): https://github.com/facebookresearch/fairseq/tree/main/examples/hubert
- Modal (plataforma usada para entrenamiento y despliegue): https://modal.com
- Cloudflare Tunnel (usado por el servidor w-okada): https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
