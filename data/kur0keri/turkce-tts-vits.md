# Kur0Keri/turkce-tts-vits

## Resumen

`Kur0Keri/turkce-tts-vits` es un modelo de síntesis de voz (text-to-speech) para turco entrenado desde cero con la arquitectura VITS (Kim et al., 2021) sobre la implementación de Coqui TTS (fork de Idiap, versión 0.27.5). Lo publica el usuario Kur0Keri y su interés práctico está en que no parte de pesos preentrenados de otro sistema TTS: todos los pesos se inicializaron de forma aleatoria y se entrenaron con voz turca. El checkpoint publicado contiene 39,7 M de parámetros en la parte generadora de voz (86,4 M contaban en entrenamiento, incluyendo el discriminador) y produce audio a 16 kHz.

El modelo resuelve un caso concreto: dispone de una voz única en turco, con estilo de narración de audiolibros, pensada para leer texto plano en lugar de interpretar emociones. Trabaja a nivel de carácter (sin fonemas ni BPE), con 80 bins mel y hop 256, y exige pasar el texto por un normalizador (`normalize_tr.py`) que convierte números, fechas, porcentajes y abreviaturas a su forma hablada antes de la síntesis.

Su relevancia ahora es doble: por un lado es un ejemplo de TTS pequeño y ligero (repo de 0,2 GB, ~0,3 de RTF en CPU de escritorio) con licencia Apache-2.0, lo que facilita probarlo sin GPU; por otro, el autor documenta el proceso completo (filtrado del corpus, dos etapas de entrenamiento, evaluación con ASR) y advierte de que el corpus de origen no tiene los derechos de audio aclarados, algo relevante para cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Kim et al., 2021) sobre Coqui TTS (fork de Idiap, `coqui-tts` 0.27.5); entrada a nivel de carácter, 80 bins mel, hop 256, salida a 16 kHz |
| Parámetros totales | 86,4 M en entrenamiento (incluye discriminador); 39,7 M en el checkpoint publicado (parte generadora de voz); los pesos del discriminador no se incluyen |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; en entrenamiento se vieron clips de 2,5 a 20,5 s, por lo que el texto largo debe dividirse en frases |
| Tipos de cuantización | No disponible (no se documenta cuantización; el entrenamiento usó fp16) |
| Idiomas soportados | Turco (`tr`) únicamente |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | Checkpoints de PyTorch para Coqui TTS (se menciona `speakers.pth` con 206 entradas); no se documenta safetensors ni GGUF; tamaño del repo 0,2 GB |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de extremo a extremo que combina un codificador de texto, un prior normalizing flow, un decodificador basado en HiFi-GAN y un discriminador multiperiodo, con alineamiento monotónico aprendido (sin alineamientos forzados externos). En esta implementación la entrada es puramente a nivel de carácter, sin fonemas ni BPE, lo que simplifica el pipeline pero traslada al normalizador la responsabilidad de resolver números, fechas, abreviaturas y símbolos como `%`.

Los datos provienen del dataset `serdarcaglar/turkish-tts-audiobooks` (particiones `train` y `validation`), filtrado con DNSMOS ≥ 3,2, CER de ASR entre dos pasadas ≤ 0,02, similitud de hablante ≥ 0,90, duraciones de 2,5 a 20,5 s y textos que pasan el normalizador; el resultado son unas 858 horas. El entrenamiento tuvo dos etapas: un preentrenamiento multihablante de 603 horas con 206 identificadores de hablante, 157.827 pasos, batch 16, fp16, AdamW y lr 2e-4; y un ajuste fino desde esos pesos sobre un único hablante (`seslikitaplarmavi-000`, ~147 horas) con lr 1e-4, 26.830 pasos ejecutados y el paso 22.950 seleccionado por pérdida de validación. Todo se entrenó en una única RTX 5060 de 8 GB. La partición de test son 150 clips reservados por grabación de origen, nunca vistos en entrenamiento.

## Capacidades

- Síntesis de voz en turco a partir de texto plano, con salida WAV a 16 kHz.
- Normalización lingüística integrada en el flujo de uso: `2026'da` → "iki bin yirmi altıda", `%40` → "yüzde kırk", `TBMM` → "te be me me", `Dr.` → "doktor"; los caracteres fuera del alfabeto turco se eliminan.
- Control de velocidad de habla (`--hiz`) y de aleatoriedad de duración (`--ritim`, con 0,5 recomendado frente al 1,0 por defecto, que puede producir ritmo entrecortado).
- Reproducibilidad mediante semilla (`--seed`); `torch.manual_seed(0)` genera la misma salida.
- Estructura multihablante latente: `speakers.pth` contiene 206 identificadores que cargan, aunque solo la voz ajustada está evaluada.
- Inferencia en CPU sin GPU (`load()`), con opción de GPU (`load(cuda=True)`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni entrada de audio; es exclusivamente un modelo TTS.

## Casos de uso

- Narración de audiolibros y contenido largo: el modelo se entrenó con narración de audiolibros, así que encaja en lectura de prosa; hay que trocear el texto en frases, ya que en entrenamiento solo vio clips de hasta 20,5 s.
- Accesibilidad y lectores de pantalla en turco: al ejecutarse en CPU a ~0,3 de RTF, puede integrarse en aplicaciones de escritorio o servidores sin GPU dedicada para leer contenido web o documentos.
- Anuncios y avisos con cifras variables: el normalizador convierte fechas, porcentajes y acrónimos a forma hablada, lo que sirve para sistemas de megafonía, avisos meteorológicos o comunicados institucionales generados automáticamente.
- Interfaces de voz e IVR en turco: síntesis local de respuestas en asistentes telefónicos o quioscos, con latencia predecible y sin dependencia de APIs externas.
- Generación de datos sintéticos para ASR: producir audio turco etiquetado para aumentar corpus de reconocimiento de voz, con la salvedad de que es una sola voz y estilo lector.
- Evaluación y prototipado de pipelines TTS: con 0,2 GB de repo y licencia Apache-2.0, sirve como base reproducible para comparar preprocesado, normalización o calidad de audio en pruebas internas.
- Localización de contenido educativo: lectura de materiales de estudio, cuestionarios o glosas en turco donde se prioriza inteligibilidad sobre expresividad.

## Benchmarks y rendimiento

Evaluación del autor sobre 60 frases turcas deliberadamente difíciles (números, fechas, abreviaturas, caracteres ğ/ı/ş/â, trabalenguas y preguntas), transcritas con Whisper large-v3-turbo y comparadas con el texto normalizado:

| Checkpoint | CER | WER |
|---|---|---|
| Fin del preentrenamiento (multihablante, 157.827 pasos) | 6,85 % | 26,96 % |
| Este modelo (ajuste fino a una voz, 22.950 pasos) | 3,44 % | 17,83 % |

Limitaciones de la medición, según el propio autor: son 60 frases escogidas por su dificultad, la métrica se basa en ASR (sin escucha humana ni test MOS) y no hay comparación directa con otros sistemas TTS. Los números deben interpretarse como un indicador aproximado de inteligibilidad, no como una afirmación de calidad.

Rendimiento: aproximadamente 0,3 de RTF en CPU de escritorio (Ryzen 5 5600, sin GPU), es decir, en torno a un tercio de la duración del audio generado. La medición se hizo con un checkpoint anterior mientras el entrenamiento seguía en marcha y no se repitió sobre el checkpoint final.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada. Por tamaño (39,7 M de parámetros en el checkpoint publicado), el peso en fp32 ronda los 160 MB y en fp16 unos 80 MB; el repo completo ocupa 0,2 GB, por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se especifican; el entrenamiento se hizo con una RTX 5060 de 8 GB. Para inferencia no se requiere GPU: el flujo documentado usa CPU por defecto.
- Cabe en GPU de consumo: sí, por tamaño; cualquier tarjeta con unos pocos GB libres es suficiente.
- Opciones de despliegue: Coqui TTS (fork de Idiap) con PyTorch mediante el script `speak.py` o la API Python (`load`, `normalize`, `syn.tts`, `syn.save_wav`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo VITS.
- Latencia y throughput: ~0,3 de RTF en CPU Ryzen 5 5600, lo que equivale a unos 3 s de proceso por cada 10 s de audio; en GPU no se han publicado cifras.

## Comparativa con modelos similares

El autor indica explícitamente que no hay comparación directa con otros sistemas TTS. En la información disponible no constan cifras verificables de alternativas, por lo que se listan únicamente como candidatos de comparación, sin datos:

| Modelo | Parámetros | Idiomas | Contexto / duración | Licencia | Datos en la información disponible |
|---|---|---|---|---|---|
| Kur0Keri/turkce-tts-vits | 39,7 M (inferencia) | Turco | Clips de 2,5–20,5 s | Apache-2.0 | CER 3,44 % / WER 17,83 % (60 frases, ASR) |
| Otros modelos VITS para turco (p. ej. variantes Piper/Coqui) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Sistemas TTS multilingües con clonación (p. ej. XTTS-v2) | No disponible | No disponible | No disponible | No disponible | No disponible |
| MMS-TTS (Meta) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados de benchmarks comparativos en la información disponible.

## Limitaciones y advertencias

- Audio a 16 kHz: las grabaciones de origen son 16 kHz; la salida es inteligible pero no tiene brillo de estudio.
- Una sola voz y solo turco: el ajuste fino se hizo sobre un hablante; los otros 205 identificadores de `speakers.pth` cargan pero su calidad no se ha probado. El texto en inglés se lee con reglas de letras turcas.
- Estilo lector: entrenado con narración de audiolibros, no se debe esperar emoción ni interpretación.
- Texto largo: al haber visto clips de hasta 20 s, el texto debe dividirse en frases para evitar degradación.
- Abreviaturas: solo las incluidas en el diccionario del normalizador se leen correctamente; las desconocidas pueden pronunciarse mal. Omitir `normalize` provoca que números y fechas no se lean.
- Riesgo de alucinación en sentido estricto: no aplica a un TTS, pero sí hay riesgo de pronunciación incorrecta o ritmo defectuoso con el valor `--ritim` por defecto de 1,0.
- Licencia: código y pesos son Apache-2.0, pero el corpus de origen no tiene los derechos de audio aclarados según el propietario del dataset, que se opone a la clonación de voz no autorizada. Esto traslada un riesgo jurídico al uso comercial, pese a la licencia permisiva.
- Uso responsable: no emplear para suplantar a una persona, fraude, engaño ni clonación sin consentimiento; debe divulgarse que el audio es sintético. No se ha verificado que un identificador de hablante corresponda a una persona real.
- Madurez: 0 descargas y 1 like en el momento de la consulta, sin pruebas de terceros ni evaluación MOS humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kur0Keri/turkce-tts-vits
- Dataset de entrenamiento: https://huggingface.co/datasets/serdarcaglar/turkish-tts-audiobooks
- Paper de VITS (Kim et al., 2021): https://arxiv.org/abs/2106.06103
- Coqui TTS, fork de Idiap: https://github.com/idiap/coqui-ai-TTS
- faster-whisper (solo evaluación): https://github.com/SYSTRAN/faster-whisper
- Muestras de audio: carpeta `samples/` del repositorio en HuggingFace

Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
