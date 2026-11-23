# hareeshbabu82/vagdhenu

## Resumen

Vāgdhenu es un modelo de síntesis de voz (text-to-speech) especializado en canto sánscrito o recitación védica (pārāyaṇa), desarrollado por el autor independiente hareeshbabu82 sobre la base de ai4bharat/IndicF5. Resuelve un problema muy concreto: la mayoría de sistemas TTS no manejan correctamente las particularidades fonéticas del sánscrito, especialmente las consonantes conjuntas (conjuncts) que incluyen aspiradas retroflejas, y tienden a producir una prosodia incorrecta o una duración vocálica deficiente en la recitación prolongada.

El modelo se distribuye como pesos para la librería f5-tts y consta de un DiT de flow-matching de aproximadamente 337 millones de parámetros (sin cabezas nativas de duración ni tono) acoplado a un vocoder BigVGAN-v2 afinado específicamente para esta tarea. La innovación clave es el enrutamiento del sánscrito a través del alfabeto kannada en lugar del devanagari, ya que este último provoca la eliminación de la schwa característica del hindi y degrada la pronunciación.

El repositorio tiene 3,1 GB y se publica bajo licencia Apache-2.0, aunque el vocoder derivado de BigVGAN-v2 está sujeto a los términos de NVIDIA. Es relevante para investigadores y desarrolladores que trabajen en preservación lingüística, accesibilidad de textos clásicos o generación de audio devocional con fidelidad fonética verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow-matching DiT (OT-CFM mel-infilling) + vocoder BigVGAN-v2 |
| Parámetros totales | ~337M (DiT); vocoder no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Sánscrito (sa), enrutado por script kannada |
| Licencia | Apache-2.0 (contribución propia); vocoder sujeto a licencia NVIDIA BigVGAN |
| Formato de pesos | PyTorch (.pt para el modelo, .pth para el vocoder) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema F5-TTS / IndicF5: un Diffusion Transformer (DiT) con flow-matching mediante Optimal Transport Conditional Flow Matching (OT-CFM) para mel-infilling, con dimensión 1024, profundidad 22 y 16 cabezas de atención. El modelo base IndicF5 aporta el DiT y el vocabulario (vocab.txt). Es destacable que el DiT no incorpora cabezas nativas de duración ni de tono, por lo que la prosodia es enteramente guiada por el texto y por la referencia de audio suministrada. La salida mel se convierte en audio mediante un vocoder BigVGAN-v2 de NVIDIA afinado sobre el espacio vocos-mel de F5, necesario porque el vocoder original produce artefactos ("shivers") en vocales largas.

El ajuste fino se realizó sobre un corpus de canto sánscrito de un único hablante de aproximadamente 5 horas (prathoshap/vagdhenu-data). La voz de producción (voice_steer_ema_2026-06-17.pt) incorpora un reentrenamiento con voice steering sobre clips emparejados para hacerla más sensible a la referencia. Se incluye además una variante de respaldo (voice_armA_ema_2026-06-11.pt) que toma voz, swara y ritmo directamente del clip de referencia. El método completo se documenta en el TECH_REPORT.md del repositorio de GitHub.

## Capacidades

- Síntesis de voz de un único hablante especializada en canto y recitación sánscrita (pārāyaṇa).
- Renderizado correcto de consonantes conjuntas, incluidas las aspiradas retroflejas (100% según la model card).
- Conversión de una estrofa en devanagari más su métrica (meter) a un archivo WAV cantado.
- Control de prosodia mediante referencia de audio: la voz, el swara y el ritmo se derivan del clip de referencia suministrado.
- Voice steering en la voz de producción para mayor respuesta a la referencia.
- Soporte de banco de referencias por métrica incluido en el repositorio.
- No soporta svaras védicos.
- No dispone de tool calling, agentes ni capacidades multimodales (es un TTS puro).

## Casos de uso

- Recitación de textos clásicos: el modelo convierte estrofas en devanagari con su métrica en audio cantado, adecuado para generar audiolibros de textos sánscritos con pronunciación fonéticamente fiel.
- Accesibilidad de material sánscrito: permite a estudiantes y personas con discapacidad visual escuchar versos con la prosodia correcta en lugar de una lectura plana.
- Estudio de métrica y prosodia: al exigir una referencia emparejada por métrica (regla de la media referencia), sirve como herramienta pedagógica para comparar recitaciones y analizar el ritmo.
- Preservación lingüística: el corpus de 5 horas y el modelo permiten documentar y reproducir una tradición de canto concreta de un hablante.
- Generación de audio devocional: producción de pistas de recitación para templos, aplicaciones de meditación o material litúrgico.
- Investigación en TTS de bajos recursos: el enrutamiento por script kannada para evitar la schwa-deletion del hindi es un caso de estudio reproducible para adaptar TTS a lenguas con escritura compartida.
- Integración en pipelines de publicación: renderizado por lotes de versos a WAV mediante `python src/render.py` para su inclusión en sitios web o aplicaciones.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| MOS (oyente experto) | ~4,6 | Evaluación subjetiva de la model card |
| Precisión en conjuncts (aspiradas retroflejas) | 100% | Según la model card |

No se han publicado resultados de benchmarks estandarizados (tipo MMLU, HumanEval o GSM8K, no aplicables a un TTS) ni comparativas cuantitativas con otros sistemas TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~337M parámetros en el DiT más el vocoder BigVGAN-v2, es esperable que quepa en GPUs de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamaño, pero no confirmado.
- Opciones de despliegue: la librería f5-tts y los scripts del repositorio (`scripts/setup.sh`, `src/render.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vāgdhenu | ~337M (DiT) | No disponible | Sánscrito (sa) | Apache-2.0 (+ licencia NVIDIA BigVGAN) | Hugging Face, 0 descargas |
| ai4bharat/IndicF5 | No disponible | No disponible | Lenguas índicas | MIT | Hugging Face (modelo base) |
| F5-TTS | No disponible | No disponible | Multilingüe | No disponible en la información | Repositorio F5-TTS |

La comparativa se limita a los modelos citados en la información; no se dispone de datos de rendimiento cruzados entre ellos.

## Limitaciones y advertencias

- No soporta svaras védicos; la recitación védica con acentos tonales queda fuera de alcance.
- La prosodia es guiada por la referencia, no diseñable arbitrariamente; se requiere un clip de referencia limpio y exactamente emparejado (regla de la media referencia: `ref_text` debe coincidir con el tramo hablado en un límite de palabra o daṇḍa).
- El sánscrito debe enrutarse por script kannada; usar devanagari provoca la eliminación de la schwa del hindi y degrada la pronunciación.
- El vocoder original (vocos) produce artefactos en vocales largas; el vocoder BigVGAN-v2 afinado es obligatorio.
- Riesgo de suplantación de voz: la voz es la del propio autor; se advierte explícitamente de no imitarla.
- La licencia Apache-2.0 cubre la contribución propia, pero el vocoder derivado de BigVGAN-v2 está sujeto a los términos de NVIDIA, que deben respetarse en uso comercial.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; al ser un TTS, el riesgo se traduce en pronunciaciones incorrectas fuera de la distribución del corpus de entrenamiento.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; sin validación comunitaria externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hareeshbabu82/vagdhenu
- Repositorio GitHub: https://github.com/prathoshap/vagdhenu
- Informe técnico: https://github.com/prathoshap/vagdhenu/blob/main/docs/TECH_REPORT.md
- Dataset de entrenamiento: https://huggingface.co/datasets/prathoshap/vagdhenu-data
- Modelo base IndicF5: https://huggingface.co/ai4bharat/IndicF5
- F5-TTS: https://github.com/SWivid/F5-TTS
- NVIDIA BigVGAN: https://github.com/NVIDIA/BigVGAN
