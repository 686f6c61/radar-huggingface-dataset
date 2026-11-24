# praveenchand/Dhvani-ASR

## Resumen

Dhvani-ASR es un modelo de reconocimiento automático del habla (ASR) derivado de IndicConformer-600M de AI4Bharat, publicado por el usuario independiente praveenchand. Su aportación consiste en añadir el inglés a un modelo que originalmente cubría 22 lenguas de la India, mediante un esquema de ramas con adaptadores que preserva intactas las capacidades originales en esos 22 idiomas. El modelo se distribuye en formato NeMo y está pensado para quien necesita un único modelo abierto (CC-BY-4.0) que cubra inglés e idiomas índicos con selección explícita de lengua.

La arquitectura es un Conformer con dos cabezas de decodificación, RNNT y CTC, sobre un encoder congelado al que se le insertan adaptadores por idioma y copias privadas de las partes compartidas del decodificador. El repositorio ocupa 3,0 GB y los pesos están en fp32 (unos 2,5 GB), sin versión cuantizada disponible. No se indican el número exacto de parámetros ni la longitud de contexto en la información proporcionada, más allá de la referencia al modelo base de 600M.

Es relevante ahora porque el autor publica evaluaciones comparativas honestas frente a alternativas como SraVaani-1.0, Indic-Transcribe y Whisper-large-v3, reconociendo en qué celdas pierde. Su interés principal es metodológico (demostrar que se puede extender un modelo ASR multilingüe sin degradar los idiomas originales) y práctico para despliegues que requieran una única licencia permisiva cubriendo inglés y lenguas índicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con decodificadores RNNT y CTC; adaptadores por idioma |
| Parámetros totales | no disponible (modelo base IndicConformer-600M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; audio de hasta ~30 s a 16 kHz mono |
| Tipos de cuantización | no disponible (solo fp32 publicado) |
| Idiomas soportados | en, as, bn, brx, doi, gu, hi, kn, kok, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur (23 códigos) |
| Licencia | cc-by-4.0 (pesos); código MIT |
| Formato de pesos | NeMo (.nemo), fp32 |

## Arquitectura y entrenamiento

El modelo parte de IndicConformer-600M de AI4Bharat, un encoder Conformer con cabezas RNNT y CTC. La innovación del autor es el esquema de ramas: el modelo base permanece congelado y cada idioma añadido (inglés, y opcionalmente tamil y telugu) recibe una rama propia compuesta por adaptadores dentro del encoder y copias privadas de las partes del decodificador que todos los idiomas comparten. Una rama solo se activa para su idioma, de modo que entrenarla no puede alterar el comportamiento en los demás. Según la model card, cada ejecución de entrenamiento verifica bit a bit los 1.035 tensores compartidos para confirmar que no han cambiado.

Los datos de entrenamiento citados incluyen openslr/librispeech_asr, ai4bharat/IndicVoices, ai4bharat/Kathbath y ARTPARK-IISc/Vaani. No se especifican en la información disponible el número de tokens, las horas de audio empleadas, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicable habitualmente en ASR). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto en inglés y 22 lenguas de la India, con selección explícita del idioma en la llamada.
- Decodificación dual RNNT y CTC, lo que permite elegir entre ambas cabezas según latencia o precisión.
- Manejo de audio de 16 kHz mono de hasta aproximadamente 30 segundos por clip.
- Rama específica para tamil y rama opcional para telugu, además de la rama de inglés.
- Preservación bit a bit de los 22 idiomas originales del modelo base.
- No incluye identificación automática de idioma.
- No incluye puntuación ni capitalización en la salida (todo en minúsculas).
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).
- No dispone de capacidades de visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz en inglés e idiomas índicos: el modelo permite fijar el idioma por sesión y transcribir clips de hasta 30 s, adecuado para pipelines por segmentos con detección de silencios previa.
- Subtitulado de contenido audiovisual multilingüe: al cubrir 23 códigos con una sola licencia CC-BY-4.0, simplifica la gestión legal en plataformas que emiten en varias lenguas índicas.
- Digitalización de archivos orales y entrevistas en lenguas minoritarias como bodo, dogri, konkani, maithili, manipuri, sánscrito o santali, donde las alternativas comerciales suelen carecer de soporte.
- Investigación lingüística y creación de corpus: el esquema de ramas congeladas permite estudiar el efecto de añadir un idioma sin tocar los demás, útil para trabajos de adaptación de modelos ASR.
- Evaluación comparativa de ASR índico: el repositorio incluye transcripciones de todas las evaluaciones en `results/`, lo que facilita reproducir comparativas frente a SraVaani-1.0 o Indic-Transcribe.
- Prototipado rápido con NeMo: al instalarse con `nemo_toolkit[asr]` y un script `transcribe.py`, sirve para validar ideas antes de invertir en modelos propietarios o de mayor tamaño.
- Atención al cliente en centros de contacto con clientes de habla índica: para consultas cortas y con idioma conocido por el canal, el modelo puede transcribir turnos individuales antes de pasarlos a un sistema de comprensión.

## Benchmarks y rendimiento

Word error rate (menor es mejor) según la model card, sobre muestras de hasta 200 clips por idioma.

| Conjunto | Este modelo | SraVaani-1.0 | Indic-Transcribe | Whisper-large-v3 |
|---|---:|---:|---:|---:|
| Lenguas índicas, FLEURS (7 idiomas) | 0,195 | 0,188 | **0,181** | – |
| Lenguas índicas, Kathbath (7 idiomas) | 0,190 | **0,180** | 0,181 | – |
| Inglés, FLEURS | 0,140 | 0,224 | 0,094 | **0,044** |
| Inglés con acento índico (Svarah) | 0,203 | 0,400 | 0,167 | **0,059** |

Resultados agregados adicionales:

| Conjunto | WER |
|---|---:|
| IndicVoices (22 idiomas), macro WER | 0,222 |
| FLEURS (13 idiomas), macro WER | 0,189 |
| Vaani, habla espontánea (18 idiomas), macro WER | 0,345 |
| LibriSpeech test-clean (inglés) | 0,038 |

El autor señala que SraVaani-1.0 obtiene un WER alto en Svarah en parte porque transcribió un tercio de los clips en escritura índica. En la comparativa directa, SraVaani-1.0 e Indic-Transcribe ganaron 20 de 21 celdas frente a este modelo en lenguas índicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con pesos fp32 de ~2,5 GB, se requiere al menos ese espacio más el overhead de NeMo, por lo que una GPU con 6-8 GB podría ser suficiente en teoría, aunque no se confirma.
- GPU recomendadas: no disponibles en la información proporcionada; al ser un modelo de ~600M, tarjetas como RTX 3090, RTX 4090, A100 o H100 son compatibles por capacidad, pero no hay recomendación oficial.
- ¿Cabe en GPU de consumo? Probablemente sí en fp32 dado el tamaño de pesos (~2,5 GB), aunque no se documenta.
- Opciones de despliegue: NeMo (`nemo_toolkit[asr]` desde el fork `AI4Bharat/NeMo@nemo-v2`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / audio | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| Dhvani-ASR | no disponible (base 600M) | 23 (en + 22 índicos) | clips ~30 s | CC-BY-4.0 | WER 0,195 FLEURS índico; 0,140 inglés FLEURS |
| SraVaani-1.0 | no disponible | índicos | no disponible | no disponible | Mejor WER en Kathbath (0,180) |
| Indic-Transcribe | no disponible | índicos | no disponible | no disponible | Mejor WER en FLEURS índico (0,181) |
| Whisper-large-v3 | no disponible | multilingüe amplio | 30 s | MIT (según OpenAI) | Mejor WER inglés (0,044 FLEURS; 0,059 Svarah) |

La ventaja diferencial de Dhvani-ASR es la combinación de cobertura (inglés más 22 lenguas índicas) con licencia CC-BY-4.0 y un único artefacto; sus competidores directos en lenguas índicas son más precisos, y Whisper es muy superior en inglés.

## Limitaciones y advertencias

- No realiza identificación de idioma: es obligatorio indicar la lengua en cada llamada.
- El habla con cambio de código (code-switching) se decodifica como un único idioma, lo que produce errores en conversaciones mixtas.
- La salida es en minúsculas y sin puntuación, lo que exige postprocesado para muchos usos finales.
- Rendimiento débil en habla espontánea para kannada, odia, urdu, cachemir, santali y konkani (WER entre 0,40 y 0,61).
- No hay versión cuantizada publicada; solo fp32 (~2,5 GB).
- Es un derivado independiente no avalado por AI4Bharat; conviene citar su trabajo IndicVoices / IndicConformer.
- Riesgo de alucinación y errores en audio ruidoso o con acentos no representados en los datos de entrenamiento; no se documentan sesgos específicos más allá de los de rendimiento por idioma.
- Licencia CC-BY-4.0: permite uso comercial con atribución; el código es MIT.
- El modelo base está congelado, lo que limita la adaptación a dominios muy alejados de los datos originales sin entrenar nuevas ramas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/praveenchand/Dhvani-ASR
- Modelo base IndicConformer-600M: https://huggingface.co/ai4bharat/IndicConformer
- Fork de NeMo usado: https://github.com/AI4Bharat/NeMo/tree/nemo-v2
- Detalles y condiciones de evaluación: DETAILS.md dentro del repositorio del modelo
- Resultados con transcripciones: carpeta `results/` del repositorio
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Dataset Kathbath: https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset Vaani: https://huggingface.co/datasets/ARTPARK-IISc/Vaani
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
