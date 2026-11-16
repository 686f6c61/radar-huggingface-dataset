# MAdel121/LFM3-Audio-2B-Full-Duplex

## Resumen

LFM3-Audio-2B Full-Duplex es una adaptación mediante LoRA del modelo de audio LiquidAI/LFM3-Audio-2B (2B parámetros) que lo convierte de un modelo por turnos en un modelo full-duplex de un solo bucle. El adaptador, publicado por el usuario MAdel121, permite que el modelo escuche mientras habla, ceda ante interrupciones a mitad de frase, procese retroalimentación del oyente (backchannels) y emita señales de escucha solapadas con el habla del usuario. Todo ello sin cascada externa de VAD, ASR o TTS.

La propuesta técnica es compacta: un LoRA de rango 16 (17,0M de pesos, 68 MB) entrenado en tres etapas sobre 480 conversaciones, más una cabeza de escucha causal Conv1D de 91K parámetros (1,4 MB). El resultado se ejecuta en tiempo real sobre Apple Silicon con MPS en float32, con una mediana de 58,9 ms por paso de habla de 80 ms.

Es relevante porque demuestra que es posible obtener comportamiento full-duplex con turn-taking y barge-in sobre un modelo base de 2B con un coste de entrenamiento muy bajo (unas 1,5 GPU-horas en una RTX PRO 6000) y preservando aproximadamente el 95% de la capacidad de recuerdo de hechos del modelo base. El modelo solo soporta inglés y su licencia es LFM 1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre LFM3-Audio-2B; cabeza auxiliar Conv1D causal |
| Parámetros totales | 2B (modelo base) + 17,0M (LoRA) + 91K (cabeza de escucha) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (inferencia reportada en float32) |
| Idiomas soportados | inglés (en) |
| Licencia | LFM 1.0 (lfm1.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base LFM3-Audio-2B es un modelo por turnos. Al transmitirse de forma continua en pasos de 80 ms, su probabilidad de inicio de turno se mantiene por debajo de 9e-6 y no distingue retroalimentación del oyente de interrupciones reales. La adaptación introduce cuatro modificaciones para convertirlo en un bucle full-duplex único: un flujo intercalado continuo de 80 ms donde cada paso consume un token de audio del usuario (16 kHz) y emite un frame de LiquidCodec (24 kHz); una pérdida de parada/mantención basada en ventana de verosimilitud (Stage B); re-voz del asistente con anclaje KL de inicio de turno (Stage G2); y una cabeza acústica de escucha aislada de la caché KV (Ear-Head v4).

El entrenamiento del LoRA se realizó en tres etapas con 960 + 192 + 192 actualizaciones sobre 480 conversaciones (45 minutos de actualizaciones de gradiente, aproximadamente 1,5 GPU-horas en una RTX PRO 6000, menos de 10 dólares con sobrecarga de contenedor). La cabeza Conv1D de 91K parámetros se entrenó localmente en Apple Silicon. La pérdida de ventana de parada elevó la tasa de retención de reconocimientos de al menos 1,0 s del 58,3% al 93,5%, y el anclaje KL redujo las filtraciones de persona del interlocutor de 4/41 turnos a 0/36 sin degradar la temporización. La cabeza de escucha, entrenada con negativos de silencio explícitos, coloca el 100% de las retroalimentaciones durante habla activa (38/38 en long-60; 98,4% out-of-fold) con cero falsas alarmas en silencio.

## Capacidades

- Conversión audio-a-audio en tiempo real con pasos de 80 ms.
- Full-duplex: escucha mientras habla y mantiene el bucle abierto sin ceder el turno.
- Barge-in: cede ante interrupciones a mitad de frase del usuario.
- Turn-taking suave con umbrales de inicio (`<|mixed_start|>` con p >= 0,40) y fin de turno (código 2016 de LiquidCodec con r >= 0,50).
- Backchannels del oyente: emite "mm-hmm" y "yeah" solapados temporalmente con el habla del usuario, a partir de tres clips pre-codificados de su propia voz, sin VAD externo.
- Reconocimiento de retroalimentación del oyente frente a interrupciones reales.
- Recuerdo de hechos hablados (trivia) preservado en aproximadamente el 95% respecto al modelo base.
- Inferencia local en Apple Silicon (MPS) en float32.
- No soporta tool calling, function calling, agentes multi-paso ni visión según la información disponible.
- Solo inglés.

## Casos de uso

- Atención al cliente por voz en tiempo real: el modelo puede mantener una conversación hablada continua, ceder cuando el cliente interrumpe y emitir señales de escucha que reducen la sensación de robot, sin necesidad de cascada ASR/TTS.
- Asistentes de voz locales en Apple Silicon: despliegue en un Mac con MPS para prototipos de conversación full-duplex con latencia mediana de 58,9 ms por paso de 80 ms.
- Evaluación de sistemas de diálogo hablado: uso como referencia o componente en pipelines de investigación de turn-taking y barge-in sobre Full-Duplex-Bench v1.0.
- Pruebas de interacción con interrupciones: simulación de usuarios que interrumpen a mitad de frase para validar la robustez de la respuesta y la relevancia de la contestación.
- Investigación en retroalimentación conversacional: estudio de la frecuencia y distribución temporal de backchannels en diálogos hablados.
- Demos de conversación por voz de bajo coste: el adaptador de 68 MB más la cabeza de 1,4 MB permiten iterar sobre el modelo base sin reentrenar desde cero.
- Prototipado de agentes de voz con presupuesto limitado: el coste de entrenamiento reportado (menos de 10 dólares en una RTX PRO 6000) facilita la experimentación académica.

## Benchmarks y rendimiento

Evaluación end-to-end sobre los 727 clips de Full-Duplex-Bench v1.0 en float32 (1 semilla, commit 3e799c45) con los scorers oficiales sin modificar. TOR = turn-over rate; latencias en segundos. Los valores de referencia de Awaken son media de 3 semillas.

| Tarea | Métrica | LFM3-2B Duplex | Awaken 30B | PersonaPlex | Moshi 7B | Freeze-Omni | Gemini Live 2.0 (API) | GPT-Realtime (API) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Pause handling (137 sintéticos) | TOR ↓ | **0,044** | 0,170 | 0,584 | 0,985 | 0,642 | 0,255 | **0,010** |
| Pause handling (216 CANDOR) | TOR ↓ | **0,116** | 0,267 | 0,662 | 0,980 | 0,481 | 0,310 | 0,120 |
| Backchannel (55 ICC) | TOR ↓ | **0,000** | 0,145 | 0,327 | 1,000 | 0,636 | 0,091 | **0,000** |
| Backchannel (55 ICC) | Freq (/s) ↑ | 0,062 | **0,073** | 0,025 | 0,001 | 0,001 | 0,012 | 0,007 |
| Backchannel (55 ICC) | JSD ↓ | 0,794 | 0,753 | **0,649** | 0,957 | 0,997 | 0,896 | 0,980 |
| Smooth turn-taking (119 CANDOR) | TOR ↑ | **1,000** | 0,997 | 0,992 | 0,941 | 0,336 | 0,655 | **1,000** |
| Smooth turn-taking (119 CANDOR) | Latency (s) ↓ | 1,181 | 0,440 | **0,070** | 0,265 | 0,953 | 1,301 | 1,470 |
| User interruption (200 sintéticos) | TOR ↑ | 0,995 | 0,998 | **1,000** | **1,000** | 0,867 | 0,891 | 0,970 |
| User interruption (200 sintéticos) | Relevance (0-5) ↑ | 4,38* | 2,681 | **4,210** | 0,765 | 3,615 | 3,376 | 3,850 |
| User interruption (200 sintéticos) | Latency (s) ↓ | 0,719 | 0,598 | 0,400 | **0,257** | 1,409 | 1,183 | 1,500 |

Notas de medición: el juez original `gpt-4-turbo` fue retirado por OpenAI y se sustituyó por `gpt-5.6-sol` con el prompt sin modificar (marcado con `*`). El modelo conserva 29-30/120 aciertos de trivia hablada en bucle duplex frente a 31/120 en modo por turnos, y 0/36 filtraciones de persona en conversaciones retenidas.

## Requisitos de hardware

- Inferencia reportada en float32 sobre Apple Silicon MPS: mediana de 58,9 ms por paso de habla de 80 ms; p95 de 180,6 ms en frames con emisión de texto; latencia de micrófono de 20,6 ms mediana y 141,2 ms p95 en una sesión de 132 s con auriculares en un M5 Max.
- Entrenamiento del LoRA: una RTX PRO 6000, aproximadamente 1,5 GPU-horas (menos de 10 dólares con sobrecarga de contenedor), excluyendo re-voz de datos y ejecuciones exploratorias.
- Entrenamiento de la cabeza de escucha: local en Apple Silicon.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: RTX PRO 6000 (entrenamiento); Apple Silicon MPS (inferencia). No se especifican otras GPU.
- Compatibilidad con GPU de consumo: no disponible (solo se documenta Apple Silicon y RTX PRO 6000).
- Opciones de despliegue: PEFT (librería declarada); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador.
- Throughput: no disponible; la latencia reportada sostiene el ritmo en tiempo real durante aproximadamente 3 minutos por conversación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Full-duplex | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Audio-2B Full-Duplex | 2B + 17,0M LoRA + 91K cabeza | no disponible | Sí (80 ms) | LFM 1.0 | Hugging Face (adaptador PEFT) |
| Awaken 30B | 30B | no disponible | Sí | no disponible | GitHub (avera-labs) |
| PersonaPlex | no disponible | no disponible | Sí | no disponible | no disponible |
| Moshi 7B | 7B | no disponible | Sí | no disponible | no disponible |
| Freeze-Omni | no disponible | no disponible | Sí | no disponible | no disponible |
| Gemini Live 2.0 | propietario (API) | no disponible | Sí | propietaria | API de Google |
| GPT-Realtime | propietario (API) | no disponible | Sí | propietaria | API de OpenAI |

El modelo destaca en TOR de pause handling (0,044 y 0,116) y en TOR de backchannel (0,000), mientras que PersonaPlex obtiene la menor latencia en turn-taking (0,070 s) y Moshi 7B la menor latencia en interrupción (0,257 s). En relevancia ante interrupción, el 4,38 reportado está marcado con un juez sustituto y no es directamente comparable con las ejecuciones originales.

## Limitaciones y advertencias

- Solo soporta inglés; no hay soporte multilingüe documentado.
- Licencia LFM 1.0: es necesario revisar el archivo LICENSE del repositorio para confirmar las restricciones de uso comercial.
- El adaptador se distribuye como PEFT/LoRA; requiere cargar el modelo base LiquidAI/LFM3-Audio-2B por separado.
- La inferencia documentada es en float32 sobre Apple Silicon; no se han publicado datos de cuantización ni de despliegue en otras plataformas.
- La evaluación se realizó con 1 semilla y un juez sustituto (`gpt-5.6-sol`) en la tarea de interrupción de usuario, lo que limita la comparabilidad directa con los resultados originales del benchmark.
- La latencia en turn-taking suave (1,181 s) es superior a la de Awaken (0,440 s), PersonaPlex (0,070 s) y Moshi (0,265 s).
- La retención de trivia hablada es de 29-30/120 frente a 31/120 del modelo base; existe una degradación leve del recuerdo de hechos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación independiente por la comunidad.
- Riesgo de alucinación inherente a un modelo de 2B; no se han publicado evaluaciones específicas de sesgos.
- No se documentan capacidades de tool calling, agentes multi-paso, visión ni audio de entrada más allá del flujo de micrófono de 16 kHz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MAdel121/LFM3-Audio-2B-Full-Duplex
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Full-Duplex-Bench v1.0: https://github.com/DanielLin94144/Full-Duplex-Bench
- Awaken Full-Duplex (Qwen3-Omni): https://github.com/avera-labs/AwakenFullDuplex-Qwen3Omni
- Licencia LFM 1.0: https://huggingface.co/MAdel121/LFM3-Audio-2B-Full-Duplex/blob/main/LICENSE
