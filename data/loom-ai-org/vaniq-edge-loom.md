# loom-ai-org/vaniq-edge-loom

## Resumen

Vaniq-Edge en formato loom es la exportación del modelo de síntesis de voz VITS `Abiray/Vaniq-Edge` al ecosistema loom.cpp. Se trata de un modelo text-to-speech en inglés de 8,56 millones de parámetros que opera a 24 kHz y que integra en un único transformer las cuatro etapas clásicas de VITS: codificador de texto, predictor estocástico de duración, flujo normalizador y vocoder HiFi-GAN. El resultado es un GGUF autocontenido que lleva consigo la topología del grafo, el tokenizador (si procede) y el script controlador necesario para ejecutarlo.

La relevancia de esta ficha no está en el modelo base —un TTS pequeño y de un solo idioma— sino en el formato de empaquetado: loom.cpp propone un contenedor GGUF que incluye el grafo y el driver, de modo que el runtime no necesita conocer la arquitectura de antemano. Esto simplifica el despliegue de modelos deAudio en entornos donde no se quiere arrastrar dependencias pesadas de PyTorch.

El modelo está pensado para síntesis de voz en inglés con una única voz, sin capacidades multimodales ni de razonamiento. Su principal limitación práctica es que la "puerta de texto" de loom (fonemizador `orthography2ipa` más un léxico de pronunciación) no reproduce el front-end original de espeak-ng, lo que degrada la inteligibilidad si no se aportan fonemas precalculados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text encoder + stochastic duration predictor + flow + HiFi-GAN vocoder), transformer |
| Parametros totales | 8.560.963 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | F32 y Q8_0 por canal (`q8_0_pc`) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (F32: 34,4 MB; Q8_0: 11,5 MB) |

## Arquitectura y entrenamiento

Vaniq-Edge es un VITS clásico: un codificador de texto transforma la secuencia de fonemas en representaciones latentes; un predictor estocástico de duración modela la alineación temporal; un flujo normalizador mapea el espacio latente a una distribución gaussiana; y un vocoder HiFi-GAN genera la forma de onda a 24 kHz. El modelo completo tiene 8,9 M de parámetros según el autor (8.560.963 en safetensors), lo que lo sitúa en la gama ultraligera de TTS neuronales.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de las voces ni si hubo ajuste fino con RLHF o DPO. La model card indica únicamente que el modelo fue entrenado con fonemas IPA de espeak-ng y que el front-end original usa `english_cleaners2` y `num2words` para normalizar números y moneda antes de fonemizar. La exportación a loom.cpp preserva los parámetros sin modificar en el fichero F32; las versiones cuantizadas aplican int8 por canal a convoluciones y proyecciones, que representan el 91 % de los pesos.

## Capacidades

- Síntesis de voz en inglés a 24 kHz a partir de texto o de fonemas IPA.
- Control de velocidad mediante el parámetro `length_scale`.
- Control de variabilidad mediante `noise_scale` (por defecto 0,333) y `noise_scale_w` (por defecto 0,8), con semilla configurable (`seed=`).
- Acepta fonemas IPA precalculados externamente (`phonemes=`), lo que permite usar espeak-ng u otro fonemizador para obtener la calidad del front-end original.
- Fonemización integrada mediante `orthography2ipa` más léxico de pronunciación (misaki, ipa-dict o CMUdict), con calidad inferior al front-end original.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking".
- Una única voz; no hay selección de hablante ni clonación.

## Casos de uso

- Lectura de artículos y boletines en aplicaciones de accesibilidad: el modelo cabe en 11,5 MB en Q8_0 y puede ejecutarse en CPU, lo que permite integrarlo en lectores de pantalla o extensiones de navegador sin GPU.
- Generación de avisos de voz para sistemas embebidos y domótica: al ser un GGUF autocontenido con driver incluido, se despliega con el runtime loom sin dependencias de PyTorch, adecuado para Raspberry Pi o dispositivos con recursos limitados.
- Síntesis de respuestas en asistentes conversacionales de un solo idioma: con `length_scale` se ajusta la cadencia y con `seed` se reproducen locuciones para pruebas de regresión.
- Producción de audiolibros o pódcasts de bajo coste en inglés: la calidad con fonemas espeak-ng precalculados alcanza un 9,8 % de WER en LibriSpeech según la model card, suficiente para contenido no crítico.
- Pruebas de integración continua de pipelines de audio: el fichero F32 reproduce la forma de onda del modelo original con precisión de 1,0e-5, lo que sirve como referencia dorada en tests automatizados.
- Evaluación comparativa de cuantizaciones: al ofrecer F32 y Q8_0 con el mismo grafo, permite medir el impacto de la cuantización en la inteligibilidad (14,3 % frente a 14,0 % de WER en 60 síntesis, según el autor).

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas de inteligibilidad con Whisper small, no benchmarks estándar de TTS (MOS, MCD, etc.):

| Configuracion | Metrica | Resultado |
|---|---|---|
| Puerta de texto con léxico misaki | WER (30 frases LibriSpeech, Whisper small) | 18,3 % |
| Fonemas espeak-ng externos | WER (30 frases LibriSpeech, Whisper small) | 9,8 % |
| Q8_0 por canal | WER (60 síntesis, Whisper small) | 14,3 % |
| F32 | WER (60 síntesis, Whisper small) | 14,0 % |
| Léxico CMUdict vía puerta de texto | WER | 24,7 % |
| Léxico ipa-dict vía puerta de texto | WER | 21,7 % |

No se han publicado resultados de benchmarks estándar (MOS, MCD, RTF) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en cualquier cuantización; el fichero Q8_0 ocupa 11,5 MB y el F32 34,4 MB, por lo que el modelo reside holgadamente en memoria de cualquier GPU o incluso en RAM de CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobradamente suficiente y el cuello de botella será el vocoder, no la memoria.
- Cabe en cualquier GPU consumer y en dispositivos de placa única tipo Raspberry Pi 4/5.
- Opciones de despliegue: runtime `loom-py-rt` (PyPI) sobre el motor loom.cpp; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el grafo y el driver son específicos de loom.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vaniq-Edge (loom) | 8,56 M | inglés, una voz, 24 kHz | MIT | GGUF (loom.cpp) | Exportación con driver embebido; requiere runtime loom |
| Abiray/Vaniq-Edge (original) | ~8,9 M | inglés, una voz, 24 kHz | MIT | safetensors (PyTorch) | Front-end espeak-ng completo; referencia de calidad |
| Piper (rhasspy) | variable por voz (aprox. 5-20 M) | multilingüe, múltiples voces | MIT/GPL según voz | ONNX | Ecosistema maduro para TTS en CPU; no comparable en formato |
| Kokoro-82M | 82 M | multilingüe, varias voces | Apache-2.0 | safetensors/ONNX | Mayor tamaño y calidad; requiere más recursos |

La comparación con Piper y Kokoro es orientativa: no se dispone de benchmarks cruzados en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés y una única voz; no hay soporte multilingüe ni selección de hablante.
- La puerta de texto integrada no reproduce el front-end original: sin léxico, el inglés resulta ininteligible; con léxico, el WER sube al 18,3 % frente al 9,8 % con espeak-ng.
- No se reproduce la normalización de texto original (`num2words`): los números y divisas deben escribirse con letras antes de la síntesis.
- Riesgo de alucinación acústica: como todo TTS neuronal, puede generar artefactos, ruidos o pronunciaciones erróneas en textos fuera de dominio; no se han publicado evaluaciones de sesgo.
- Licencia MIT heredada del modelo base, permisiva para uso comercial, pero el léxico misaki incluido es Apache-2.0 y el front-end espeak-ng es GPL-3 y no forma parte de loom, lo que puede afectar a la distribución si se integra.
- El proyecto loom.cpp se declara "work in progress"; la API y el formato pueden cambiar.
- Dependencia de un runtime específico (`loom-py-rt`) sin soporte documentado en los motores de inferencia habituales.
- No apto para clonación de voz, diálogo hablado ni tareas que requieran comprensión del texto más allá de la fonemización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/vaniq-edge-loom
- Modelo base: https://huggingface.co/Abiray/Vaniq-Edge
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Runtime loom-py: https://github.com/loom-ai-org/loom-py
- Léxico misaki: https://github.com/hexgrad/misaki
- Léxico incluido: https://huggingface.co/loom-ai-org/vaniq-edge-loom/resolve/main/lexicons/en_US-misaki.tsv
