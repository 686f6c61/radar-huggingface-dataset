# musetric/mel-band-roformer-duality-kara2-student

## Resumen

Mel-Band RoFormer Duality KARA 2 student es un modelo de separación de fuentes musicales desarrollado por musetric para su aplicación de edición de audio. Separa una canción en tres pistas simultáneas —instrumental, voz principal y coros— en una sola pasada, operando sobre ventanas de 11 segundos de audio estéreo a 44,1 kHz. Es un modelo de destilación de conocimiento: parte de los pesos de Mel-Band RoFormer Duality (Aname-Tommy) para la separación de voces y añade un segundo estimador de máscaras que divide esas voces en principal y coros, destilado de UVR MDX-Net KARA 2.

La arquitectura es un transformer con atención por bandas mel (Mel-Band RoFormer), con 135 millones de parámetros totales según los pesos en safetensors. El modelo se distribuye en fp32 como fuente para la exportación a ONNX que utiliza la aplicación Musetric. Su relevancia radica en que consolida en un único pase lo que habitualmente requiere dos modelos en cascada (separación de voces y posterior división lead/backing), con un consumo de memoria moderado y una licencia permisiva.

La model card indica que una revisión anterior del repositorio era más estrecha (116,0 M de parámetros, 1232 MiB de pico de VRAM frente a 1492 MiB), pero los pesos publicados actualmente en safetensors suman 135.041.316 parámetros, por lo que esta ficha refleja el dato real del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mel-Band RoFormer (transformer con atención por bandas mel y atención temporal) |
| Parametros totales | 135.041.316 (según safetensors); la model card describe una variante de 116,0 M (90,5 M para voces y 25,5 M para el estimador de split) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 11 s de audio (1101 frames STFT, hop 441) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; exportación a ONNX) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 464.168.152 B) + config.yaml |

## Arquitectura y entrenamiento

El modelo es un Mel-Band RoFormer con dos cabezas de máscaras: una que estima la máscara de voces sobre la mezcla y otra que estima la máscara de coros sobre las voces. La entrada es una STFT real de forma `[batch, 2050, frames, 2]` y la salida son dos máscaras por banda. El flujo de features entre capas es de 288 dimensiones (frente a 384 de Duality), obtenido proyectando los pesos originales sobre las 288 direcciones principales del stream. Los pares de bandas 0-1 operan a tasa completa y los pares 2-5 sobre frames promediados por 2, con reconstrucción del detalle a tasa completa. Las bandas altas (desde 44) se fusionan en pares vecinos, resultando en 52 tokens de banda en lugar de 60. El estimador de máscaras usa una primera capa de 288 x 1536 por banda, una capa intermedia de 1536 x 1536 con rango 128 y la última capa de Duality. El estimador de split es una capa lineal de 288 x 768, una tanh y una capa lineal al doble del tamaño de banda, con gating; los coros son el espectro de voces multiplicado por la máscara de split y la voz principal es la diferencia, de modo que lead y backing suman exactamente las voces.

El entrenamiento parte de los pesos de Duality en el stream estrecho (40 minutos de ajuste), con cada parte estrechada inicializada desde un ajuste sobre los datos de entrenamiento. La fase de voces se entrenó unas 9 h 50 min en una GPU de 16 GB con batch 1, usando Duality en línea sobre cada crop, pérdida L1 multi-resolución de STFT sobre las voces y distancia a las máscaras de Duality. La fase de lead y backing se entrenó 5 h 20 min en tres ejecuciones con batch 2, usando como etiquetas las propias voces del modelo y el backing de KARA 2 con compensación de volumen de 1,065. El repositorio incluye `training-data.csv` (2.072.765 B) con los datos de entrenamiento.

## Capacidades

- Separación de fuentes musicales en una sola pasada: instrumental, voz principal y coros a partir de una mezcla estéreo.
- Procesamiento de audio estéreo a 44,1 kHz en ventanas de 11 segundos.
- Estimación de máscaras de voces sobre la mezcla y de máscaras de split sobre las voces, con coherencia matemática (lead + backing = voces).
- Exportación a ONNX como núcleo de la aplicación Musetric.
- Acceso al núcleo neuronal aislado mediante `net_forward(stft_repr)` para integrarlo en pipelines propios.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de audio.

## Casos de uso

- Edición de karaoke: el modelo genera en un pase la instrumental y la voz principal, lo que permite construir pistas de karaoke sin un segundo modelo de separación y con coherencia entre pistas.
- Remezcla y producción musical: la separación de lead y backing facilita reequilibrar coros en una mezcla o sustituir la voz principal manteniendo los coros originales.
- Limpieza de grabaciones para postproducción: aislar la instrumental para doblaje o para sustituir la voz por una locución en otro idioma.
- Extracción de a cappellas para datasets de investigación: la separación de voces y coros permite construir corpus etiquetados de canto con dos niveles de anotación.
- Integración en aplicaciones de escritorio o web: el modelo se exporta a ONNX y su núcleo cabe en 1232 MiB de VRAM en navegador según la model card, lo que permite inferencia local en equipos de consumo.
- Análisis musical automatizado: la separación de coros frente a voz principal sirve como preprocesado para tareas de transcripción, detección de estructura o análisis de armonías vocales.
- Procesamiento por lotes en servidores: al ser un único pase de 11 s de ventana, se puede encadenar sobre canciones completas con solapamiento y desplegar con PyTorch u ONNX Runtime.

## Benchmarks y rendimiento

| Metrica | Valor | Referencia |
|---|---|---|
| SDR mediano de voces en MUSDB18-HQ | 11,24 dB | Duality: 12,09 dB (0,85 dB por debajo) |
| SDR mediano de backing en stems reales | 0,5 a 1,9 dB | Separación débil según la model card |
| Pico de VRAM del núcleo (navegador) | 1232 MiB | Revisión anterior: 1492 MiB |
| Velocidad | misma que la revisión anterior | según la model card |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de separación de audio.

## Requisitos de hardware

- VRAM estimada: 1232 MiB de pico para el núcleo en navegador según la model card; los pesos fp32 ocupan unos 464 MB, por lo que la inferencia completa requiere del orden de 1,5 a 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para procesamiento por lotes, A100 o H100 no son necesarias pero aceleran el throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más, y en navegador mediante la exportación ONNX.
- Opciones de despliegue: PyTorch con la clase `LeadBackingRoformer` de musetric/lab, ONNX Runtime para la exportación del núcleo, y cualquier runtime que cargue safetensors.
- Latencia y throughput: la model card indica la misma velocidad que la revisión anterior, pero no publica cifras concretas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SDR voces (MUSDB18-HQ) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| musetric/mel-band-roformer-duality-kara2-student | 135,0 M | 11 s de audio | 11,24 dB | apache-2.0 | Hugging Face |
| Aname-Tommy/Mel-Band-Roformer_Duality | no disponible | no disponible | 12,09 dB | no disponible | Hugging Face |
| UVR MDX-Net KARA 2 | no disponible | no disponible | no disponible | no disponible | Ultimate Vocal Remover |

El modelo se posiciona como una alternativa más ligera y de un solo pase frente a Duality, a costa de 0,85 dB de SDR en voces. Frente a KARA 2, la ventaja es la integración en un único modelo con separación de coros, aunque la calidad del backing en stems reales es limitada (0,5 a 1,9 dB de SDR mediano).

## Limitaciones y advertencias

- La separación de coros es débil sobre stems reales: SDR mediano de 0,5 a 1,9 dB, según la propia model card.
- El SDR de voces es 0,85 dB inferior al de Duality (11,24 dB frente a 12,09 dB), por lo que no es la mejor opción si la prioridad es la máxima calidad de voces.
- El modelo está entrenado y validado exclusivamente sobre ventanas de 11 segundos; usarlo con ventanas distintas puede degradar la calidad.
- No se han publicado datos sobre sesgos, alucinaciones o comportamiento en idiomas, ya que es un modelo de audio y no genera texto.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones de los modelos base (Duality y KARA 2) por si imponen restricciones adicionales.
- El backing se define según lo que KARA 2 extrae de las voces, no según una definición musical objetiva; esto puede producir resultados distintos a los esperados en géneros con coros poco convencionales.
- La información sobre cuantizaciones disponibles es limitada: solo se publican pesos fp32 y la exportación a ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/musetric/mel-band-roformer-duality-kara2-student
- Repositorio Musetric: https://github.com/musetric/musetric
- Modelo base Duality: https://huggingface.co/Aname-Tommy/Mel-Band-Roformer_Duality
- Ultimate Vocal Remover: https://github.com/Anjok07/ultimatevocalremovergui
- Clase LeadBackingRoformer en musetric/lab: https://github.com/musetric/lab/blob/6daf2f3/musetric_toolkit/separate_audio/roformer/lead_backing_roformer.py
- Paper de referencia (arXiv:2310.01809): https://arxiv.org/abs/2310.01809
- Revisión anterior del repositorio: https://huggingface.co/musetric/mel-band-roformer-duality-kara2-student/tree/50840afb209eca847e4f88b33c3f36094feb7a41
