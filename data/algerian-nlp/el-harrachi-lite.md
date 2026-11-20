# algerian-nlp/EL-HARRACHI-Lite

## Resumen

EL-HARRACHI-Lite (الحراشي لايت) es un modelo de síntesis de voz (text-to-speech) multihablante de 82 millones de parámetros desarrollado por el colectivo Algerian NLP (Kamel Touati y colaboradores). Está adaptado a partir de `hexgrad/Kokoro-82M`, una arquitectura StyleTTS2 combinada con un codificador PL-BERT de 12 capas y un vocoder iSTFTNet, y se ha especializado en dariya argelina (`arq`) con soporte para code-switching hacia el francés.

El modelo resuelve un problema concreto y poco cubierto: la síntesis de voz natural en un dialecto árabe magrebí con escasos recursos, sin necesidad de audio de referencia en inferencia. Incluye tres personas vocales argelinas preentrenadas (`kahwa`, `rawi`, `loubna`) que cubren perfiles fonológicos distintos (oclusiva uvular /q/, velar sonora /ɡ/, equilibrio panargelino) a 24 kHz en mono.

Su relevancia actual radica en que es un checkpoint ligero (0,3 GB de repositorio) y desplegable en CPU o GPU de consumo, lo que lo hace utilizable para prototipos de accesibilidad, doblaje y asistentes de voz en dialecto argelino. La evaluación perceptiva formal (MOS, inteligibilidad por ASR, similitud de hablante) está pendiente; solo se han publicado diagnósticos acústicos automatizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M: StyleTTS2 + PL-BERT de 12 capas + vocoder iSTFTNet |
| Parametros totales | 82 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Dariya argelina (`arq`) con code-switching a francés |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (PyTorch); voces en `voices/*.pt`; configuración en `config.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Kokoro-82M: un backbone StyleTTS2 para el modelado prosódico y de estilo, un codificador de fonemas PL-BERT de 12 capas y un vocoder iSTFTNet que genera audio a 24 kHz en mono con 80 canales mel. La tabla de fonemas ocupa 178 posiciones IPA y de puntuación, definida en `config.json`, e incluye mapeos nativos para `ɡ` (slot 92), `q` (59), `v` (64) y `p` (58), además de un parche documentado para las fricativas faríngeas `ʕ` → 7 y `ħ` → 8.

El ajuste se ha realizado sobre tres colecciones de audio argelino publicadas por el colectivo: `oddadmix/arabic-audio-collection-algerian-kahwa-postcast`, `oddadmix/arabic-audio-collection-algerian-loubna-stories` y `oddadmix/arabic-audio-collection-algerian-rawi`. No se especifican en la información disponible el número de horas de audio, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (en TTS no aplican del mismo modo). Las tres personas vocales se distribuyen como vectores de estilo de forma `[510, 1, 256]` en `voices/*.pt`, lo que permite cambiar de hablante sin audio de referencia. El modelo incorpora además un diccionario de préstamos franceses transcritos a IPA (`c'est bon`, `en retard`, `d'accord`, `rendez-vous`, etc.) para gestionar el code-switching léxico.

## Capacidades

- Síntesis de voz multihablante en dariya argelina a 24 kHz en mono.
- Tres personas vocales integradas sin necesidad de audio de referencia: `kahwa` (presentador urbano energético, velocidad recomendada 1,08×), `rawi` (narrador tradicional de la Casba, 0,88×) y `loubna` (narradora femenina, 1,00×).
- Soporte de code-switching léxico hacia francés mediante un diccionario de préstamos transcritos a IPA.
- Control de velocidad de habla por invocación (`speed` en `KPipeline`).
- Procesamiento por lotes con segmentación por patrón de salto de línea (`split_pattern`).
- Conversión de texto darja a IPA mediante mapeo de grafemas árabes especiales (گ, ڤ, پ, ع, ح, خ, ش, ج).
- No soporta tool calling, agentes, visión, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Accesibilidad para hablantes de dariya argelina: lectura en voz alta de textos, noticias o documentos con una de las tres personas integradas, sin necesidad de grabar referencia, lo que simplifica el despliegue en aplicaciones móviles.
- Doblaje y locución de bajo coste: generación de pistas de voz para vídeos cortos, pódcast o contenido divulgativo en dialecto argelino, ajustando la velocidad (0,88×–1,08×) según el tono del contenido.
- Asistentes de voz y chatbots telefónicos: integración en pipelines de atención al cliente donde se requiera respuesta hablada en dariya, con la persona `loubna` para un tono neutro y claro o `kahwa` para un registro más informal.
- Audiolibros y narración de historias: la persona `rawi` está diseñada para narración pausada con foco en la oclusiva uvular /q/, adecuada para cuentos y contenido cultural.
- Prototipado rápido en investigación de NLP magrebí: al ser un checkpoint de 82 M y 0,3 GB, permite iterar en experimentos de TTS de bajo recursos y servir como base para fine-tuning acústico (Track 2 de carga directa del checkpoint).
- Generación de material educativo y de preservación lingüística: creación de corpus de audio sintético en dariya para entrenamiento de ASR u otros sistemas, siempre que se documente el origen sintético de los datos.
- Integración en aplicaciones de lectura de pantalla o navegación por voz para usuarios argelinos, ejecutables en CPU cuando no hay GPU disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks perceptivos (MOS, WER/CER por ASR round-trip, similitud de hablante) en la información disponible. La model card indica explícitamente que estas métricas están sin medir y que no se ha evaluado contra `algerian-nlp/EL-HARRACHI` ni contra baselines externos sobre una partición de test reservada.

Los únicos datos publicados son diagnósticos acústicos automatizados sobre 75 generaciones (25 prompts × 3 personas):

| Metrica de senal | Baseline sin ajustar | EL-HARRACHI-Lite |
|---|---:|---:|
| Energia de formantes de voz (< 2 kHz) | 5,4 % – 8,5 % | 93,5 % |
| Ruido de alta frecuencia (> 4 kHz) | 77,9 % – 85,1 % | 3,9 % |
| Centroide espectral | 6.700 – 7.800 Hz | 576 – 996 Hz |
| Contorno de tono (F0) | ~6,88 Hz (plano) | 100 – 250 Hz |
| Tasa de clipping de la forma de onda | picos discontinuos | 0,0 % (pico 0,20 – 0,65) |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 82 M de parámetros; cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); el modelo no aprovecha el paralelismo a gran escala por su tamaño.
- Cabe en GPU de consumo sin problema; también funciona en CPU (`device = "cuda" if torch.cuda.is_available() else "cpu"` en el ejemplo oficial).
- Opciones de despliegue: el paquete `kokoro` de Python con `KModel` y `KPipeline`, más `huggingface_hub`, `soundfile` y `torch`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo TTS).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EL-HARRACHI-Lite | 82 M | 24 kHz mono | `arq` + code-switching francés | Apache-2.0 | Hugging Face (`algerian-nlp/EL-HARRACHI-Lite`) |
| Kokoro-82M (`hexgrad/Kokoro-82M`) | 82 M | 24 kHz mono | múltiples (inglés y otros) | Apache-2.0 | Hugging Face |
| EL-HARRACHI (`algerian-nlp/EL-HARRACHI`) | no disponible | no disponible | `arq` | no disponible | Hugging Face (referenciado como baseline) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la model card indica que EL-HARRACHI-Lite no se ha evaluado contra EL-HARRACHI ni contra baselines externos.

## Limitaciones y advertencias

- Evaluación perceptiva ausente: no hay MOS, WER/CER por ASR ni similitud de hablante medidas; los diagnósticos acústicos no garantizan inteligibilidad ni naturalidad percibida.
- Cobertura dialectal limitada: entrenado únicamente en dariya argelina (`arq`) con préstamos franceses; no se garantiza un comportamiento correcto en árabe estándar, otros dialectos magrebíes o francés general.
- Dependencia de un preprocesado manual: el pipeline requiere convertir el texto darja a IPA con el mapeo de grafemas y el diccionario de préstamos franceses; textos fuera de ese vocabulario pueden producir pronunciaciones incorrectas.
- Parche de fonemas faríngeos documentado como opcional: sin aplicar `model.vocab["ʕ"] = 7` y `model.vocab["ħ"] = 8`, la representación de ع y ح puede no ser la esperada.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, prosodia anómala o pronunciaciones inventadas en entradas fuera de distribución; no se ha caracterizado la tasa.
- Sesgos: al derivarse de tres colecciones concretas (pódcast, cuentos, narración), las personas vocales reflejan los estilos y registros de esas fuentes; no se documentan análisis de sesgo de género, edad o registro.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de origen (`oddadmix/arabic-audio-collection-*`) antes de redistribuir derivados.
- Sin cuantizaciones publicadas (GGUF, ONNX, etc.), lo que limita el despliegue en entornos sin PyTorch.
- Repositorio pequeño (0,3 GB) y pocas descargas (47) y likes (1) en el momento de la consulta: ecosistema de validación externa muy reducido.

## Enlaces

- Hugging Face: https://huggingface.co/algerian-nlp/EL-HARRACHI-Lite
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Baseline argelino EL-HARRACHI: https://huggingface.co/algerian-nlp/EL-HARRACHI
- Dataset kahwa-postcast: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-kahwa-postcast
- Dataset loubna-stories: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-loubna-stories
- Dataset rawi: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-rawi
- Paquete Kokoro (Python): no disponible en la información proporcionada
- Paper de StyleTTS2: no disponible en la información proporcionada
- Paper de iSTFTNet: no disponible en la información proporcionada
