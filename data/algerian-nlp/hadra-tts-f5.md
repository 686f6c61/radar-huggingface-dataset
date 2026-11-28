# algerian-nlp/Hadra-TTS-f5

## Resumen

EL-HARRACHI (الحراشي) es un modelo de síntesis de voz (text-to-speech) y clonación de voz zero-shot especializado en dariya argelina (`arq`), desarrollado por Kamel Touati y el colectivo Algerian NLP. Se trata de un ajuste fino del checkpoint árabe `IbrahimSalah/Arabic-F5-TTS-v2` sobre aproximadamente 399 horas de audio argelino filtrado, lo que lo convierte en uno de los pocos recursos públicos dedicados específicamente a este dialecto magrebí.

La arquitectura es un Diffusion Transformer (DiT) con flow-matching, el backbone característico de la familia F5-TTS, con dimensión 1.024, 22 capas, 18 cabezas de atención y 8 capas convolucionales, acoplado a un vocoder Vocos que produce audio mono a 24 kHz. El modelo emplea un vocabulario de 2.580 tokens de carácter y soporta clonación de voz zero-shot a partir de una referencia de 5-12 segundos.

Su relevancia radica en cubrir un hueco práctico: la mayoría de sistemas TTS multilingües tratan el árabe como un bloque homogéneo y rinden mal en dariya argelina, un dialecto con fuerte code-switching al francés y sin tradición escrita normalizada. EL-HARRACHI ofrece pesos Apache-2.0 y un punto de partida para ajustes posteriores, aunque carece todavía de evaluación formal de calidad (MOS, inteligibilidad, similitud de hablante).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS: Diffusion Transformer (DiT) con flow-matching + vocoder Vocos |
| Parametros totales | no disponible (dim 1.024, depth 22, heads 18, ff_mult 2, 8 capas conv) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (utterances de entrenamiento filtradas a 2,0-12,0 s) |
| Tipos de cuantizacion | no disponible (checkpoint `model_last.pt` en precisión de entrenamiento) |
| Idiomas soportados | Dariya argelina (`arq`); code-switching al francés con palabras en script latino |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`) + `vocab.txt`; repo de 3,5 GB |

## Arquitectura y entrenamiento

El modelo parte de `IbrahimSalah/Arabic-F5-TTS-v2` (checkpoint árabe entrenado 547.500 pasos), del que se eliminaron los contadores de paso y el estado del optimizador antes del ajuste fino. El backbone es un DiT de flow-matching con `dim=1024`, `depth=22`, `heads=18`, `ff_mult=2`, `text_dim=512`, `text_mask_padding=False`, 8 capas convolucionales y `pe_attn_head=1`. La representación mel usa `n_fft=1024`, `hop_length=256`, `win_length=1024`, 100 canales mel y vocoder Vocos a 24.000 Hz. Se habilitó gradient checkpointing para ajustar el entrenamiento en 16 GB de VRAM, y todos los parámetros del DiT fueron entrenables (ajuste fino completo, no LoRA).

El entrenamiento consistió en 48.574 pasos sobre 69.066 utterances filtradas (~399 horas) extraídas de tres colecciones de OddAdmix: el pódcast conversacional Kahwa, las historias expresivas de Loubna y el corpus de folclore oral Rawi. El filtrado retuvo el 89,5% de 77.150 utterances brutas, con criterios de duración 2,0-12,0 s y densidad de 1,0-25,0 caracteres por segundo. El audio se remuestreó al vuelo a 24.000 Hz mono float32. La pérdida de entrenamiento registrada en el último lote fue 0,4950, valor que el propio autor advierte que no constituye una métrica de evaluación.

## Capacidades

- Síntesis de voz (TTS) en dariya argelina a partir de texto en script árabe.
- Clonación de voz zero-shot: replica el timbre de un hablante a partir de un clip de referencia de 5-12 s con su transcripción.
- Manejo de code-switching al francés: las palabras francesas se conservan mejor en script latino que transliteradas.
- Normalización de texto específica del dominio (eliminación de etiquetas `[French: ...]`, caracteres de ruido, unificación de alif y ya).
- Inferencia por CLI (`f5-tts_infer-cli`) y por API Python con carga manual del checkpoint.
- Punto de partida para ajuste fino de voces argelinas personalizadas.
- No soporta reconocimiento de voz, traducción ni otras lenguas o dialectos.

## Casos de uso

- Narración y audiolibros en dariya: el modelo fue entrenado sobre historias expresivas y folclore oral, por lo que mantiene prosodia narrativa en pasajes largos divididos en segmentos de 2-12 s.
- Doblaje de contenido corto: permite clonar la voz de un actor con consentimiento a partir de un clip de referencia y generar líneas nuevas en dariya para vídeos o pódcasts.
- Salida de voz para asistentes conversacionales argelinos: sustituye voces MSA genéricas por una pronunciación dialectal, mejorando la aceptación en productos dirigidos al mercado argelino.
- Accesibilidad y lectura de pantalla: convierte texto administrativo o educativo a audio en la lengua oral real del usuario, con normalización previa del texto.
- Generación de voces para pódcasts y publicidad local: el subset Kahwa aporta un registro conversacional espontáneo adecuado para cuñas y contenido informal.
- Base para investigación en dialectología y NLP magrebí: permite experimentar con TTS de bajo recurso y comparar con sistemas MSA, además de servir como inicialización para otros dialectos del Magreb.
- Prototipado de interfaces de voz en aplicaciones móviles: los pesos Apache-2.0 permiten integrarlo en productos comerciales sin restricciones de atribución más allá de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las pruebas formales de calidad (MOS, inteligibilidad por ASR round-trip y similitud de hablante) están sin medir, y que no existe partición de test reservada ni comparación con baselines. La cifra 0,4950 corresponde a la pérdida de un único lote de entrenamiento, no a una métrica de evaluación.

## Requisitos de hardware

- El ajuste fino se realizó con gradient checkpointing en 16 GB de VRAM; la inferencia requiere bastante menos, aunque no se publican cifras exactas.
- GPU consumer: cabe en tarjetas de 8-16 GB (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) para inferencia en precisión nativa; el repo ocupa 3,5 GB.
- GPU de datacenter: A100, H100 o L40S para servir en producción con mayor concurrencia.
- Despliegue: la librería oficial es `f5-tts` (PyTorch); no se documentan integraciones con vLLM, TGI ni llama.cpp, que no aplican a este tipo de modelo generativo de audio. Ollama no soporta esta arquitectura.
- El vocoder Vocos y el DiT se ejecutan en la misma pasada; se desconoce el throughput y la latencia exactos por utterance.
- Requiere FFmpeg y remuestreo explícito de la referencia a 24.000 Hz mono float32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Idiomas | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| EL-HARRACHI (este) | no disponible (DiT 1024/22/18) | utterances 2-12 s | dariya argelina | Apache-2.0 | no (MOS pendiente) |
| IbrahimSalah/Arabic-F5-TTS-v2 | misma arquitectura F5-TTS | no disponible | árabe (MSA) | no disponible en la informacion | no disponible |
| F5-TTS original (SWivid) | ~336 M (variante base) | utterances cortas | inglés, chino | CC-BY-NC / MIT segun variante | sí (MOS y similitud publicados) |
| XTTS-v2 (Coqui) | ~467 M | utterances cortas | 17 idiomas (sin dariya) | Coqui Public Model License (no comercial) | sí |

La comparación directa con XTTS-v2 o F5-TTS original no es posible en calidad porque EL-HARRACHI no ha publicado MOS ni similitud de hablante; la ventaja diferencial es la cobertura del dialecto y la licencia Apache-2.0 permisiva frente a la licencia no comercial de Coqui.

## Limitaciones y advertencias

- Ausencia total de evaluación formal: no hay MOS, inteligibilidad medida ni similitud de hablante; el rendimiento real es desconocido.
- El autor declara que el modelo no ha sido evaluado para sesgo, toxicidad ni factualidad.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta o pronunciaciones inventadas en texto fuera de distribución.
- Cobertura limitada a dariya argelina; no debe usarse para MSA, otros dialectos árabes ni otras lenguas.
- El code-switching al francés funciona mejor con palabras en script latino; la transliteración degrada la salida.
- El texto debe pasar por el normalizador de entrenamiento (eliminación de etiquetas, caracteres de ruido y unificación de alif/ya); omitirlo degrada la calidad.
- Restricción ética explícita: prohibido clonar o suplantar la voz de una persona sin consentimiento explícito; tampoco para decisiones automatizadas sobre individuos.
- Licencia Apache-2.0 en los pesos, pero los corpus de audio de origen (OddAdmix) pueden tener condiciones propias que conviene revisar antes de uso comercial.
- El modelo base árabe no está documentado en la información disponible en cuanto a su licencia y procedencia de datos.

## Enlaces

- Hugging Face: https://huggingface.co/algerian-nlp/Hadra-TTS-f5
- Modelo base: https://huggingface.co/IbrahimSalah/Arabic-F5-TTS-v2
- Demo interactiva: https://f5tts-algerian-darja-demo.streamlit.app/
- Dataset Kahwa pódcast: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-kahwa-postcast
- Dataset Loubna stories: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-loubna-stories
- Dataset Rawi: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-rawi
- Librería F5-TTS: https://github.com/SWivid/F5-TTS
