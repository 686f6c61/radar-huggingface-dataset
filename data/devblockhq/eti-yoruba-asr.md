# devblockHQ/eti-yoruba-asr

## Resumen

Ẹtí (del yoruba *ẹtí*, "oreja") es un modelo de reconocimiento automático del habla (ASR) para yoruba, desarrollado por DevBlock Technology Limited como un ajuste fino (*fine-tuning*) de **Whisper-small** de OpenAI. El modelo aborda la escasez de sistemas ASR comerciales para una lengua hablada por aproximadamente 50 millones de personas, ofreciendo una alternativa abierta con licencia MIT. Se distribuye tanto en formato Transformers (PyTorch) como en una versión convertida a CTranslate2 para ejecución eficiente en CPU, pensada para entornos de bajo coste y dispositivos periféricos.

La adaptación se realizó mediante **LoRA** sobre las proyecciones `q_proj` y `v_proj` del decoder, con rango 16 y alpha 32, y los pesos se fusionaron posteriormente en el modelo base. El resultado es un modelo de unos 244 millones de parámetros (los de Whisper-small) que transcribe audio en yoruba a 16 kHz mono. Aunque los resultados de WER son todavía altos en habla conversacional, el proyecto se presenta como una base abierta para investigación y prototipado, no como un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-small (encoder-decoder transformer) |
| Parametros totales | ~244M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (ASR, entrada de audio de hasta 30 s por segmento) |
| Tipos de cuantizacion | int8 (CTranslate2) · fp16/fp32 (Transformers, no cuantizado por defecto) |
| Idiomas soportados | Yoruba (`yo`) |
| Licencia | MIT |
| Formato de pesos | safetensors (Transformers) · CTranslate2 (`ct2/`) |

## Arquitectura y entrenamiento

El modelo parte de **openai/whisper-small**, un transformer encoder-decoder con 12 capas de encoder y 12 de decoder, entrenado originalmente por OpenAI sobre 680 000 horas de audio multilingüe. Para este ajuste fino se aplicó **LoRA** únicamente sobre las matrices `q_proj` y `v_proj` del decoder, con rango 16 y alpha 32; los pesos LoRA se fusionaron después en el modelo base, de modo que el resultado final no añade parámetros extra. El entrenamiento se realizó con Transformers 4.44.2 y PEFT 0.12.0, en un entorno compatible con Colab T4.

Los datos de entrenamiento combinan tres fuentes: un corpus base de yoruba leído (train/dev/test, con licencia a verificar), el dataset **IroyinSpeech** (noticias en yoruba, ~5 horas validadas, CC-BY 4.0) y una muestra limitada de **voicedata/final_yoruba** (WAXAL, 6000 clips de habla de África Occidental). No se menciona el uso de RLHF ni DPO; el ajuste es supervisado sobre pares audio-texto. El decoder usa el token de idioma `<|yo|>` y la tarea `transcribe`, y el audio debe muestrearse a 16 kHz mono.

## Capacidades

- Transcripción automática del habla en yoruba (lengua tonal con diacríticos).
- Generación de texto con diacríticos (tonos y punto inferior) de forma nativa.
- Compatible con el ecosistema Transformers y con faster-whisper (CTranslate2) para inferencia en CPU.
- Soporta decodificación con beam search (beam_size=5 en los ejemplos).
- No incluye capacidades de traducción, tool calling ni agentes; es un modelo puramente ASR.
- Funciona con audio de hasta 30 segundos por segmento (límite de Whisper).
- Permite ajuste adicional mediante LoRA u otras técnicas PEFT sobre su checkpoint.

## Casos de uso

- **Investigación en ASR de bajos recursos**: sirve como punto de partida para estudiar el rendimiento de Whisper en lenguas africanas y para comparar técnicas de adaptación con pocos datos.
- **Prototipado de asistentes de voz en yoruba**: se puede integrar en pipelines de voz a texto para demos o pruebas de concepto, usando la versión CTranslate2 para ejecutarlo en portátiles o servidores modestos.
- **Transcripción de noticias y contenido audiovisual**: el modelo funciona razonablemente en habla leída y noticias (WER 0.557), por lo que puede emplearse para generar subtítulos o transcripciones preliminares de vídeos en yoruba.
- **Benchmarking de sistemas ASR**: al ser abierto y con licencia MIT, permite establecer una línea base reproducible para evaluar otros modelos en yoruba.
- **Aplicaciones educativas de aprendizaje de idiomas**: transcripción de pronunciaciones de estudiantes para retroalimentación, aunque con precaución por los errores tonales.
- **Desarrollo de agentes de voz para entornos con recursos limitados**: la versión CTranslate2 con cuantización int8 puede ejecutarse en CPU de gama baja, habilitando prototipos de interacción por voz en zonas sin acceso a GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos sobre conjuntos de validación no utilizados durante el entrenamiento:

| Conjunto | n | WER (crudo) | WER (sin diacríticos) |
|---|---|---|---|
| Habla leída (test del corpus base) | 40 | 0.557 | 0.473 |
| Conversacional (`thisniyi/yoruba-speech-project-v2`) | 50 | 1.087 | 0.822 |

Notas del autor: el WER sin diacríticos elimina tonos y puntos inferiores antes de puntuar, aislando errores a nivel de palabra. El habla conversacional es sustancialmente más difícil que la leída; la caída de 0.47 a 0.82 muestra la necesidad de más datos conversacionales. El umbral de producción de DevBlock es WER ≤ 0.20 (API) o ≤ 0.28 (telefonía); este modelo no lo alcanza y se presenta como una base abierta, no como una solución comercial.

## Requisitos de hardware

- **VRAM estimada**: Whisper-small en fp16 ocupa aproximadamente 1 GB; en int8 (CTranslate2) menos de 500 MB. La inferencia en CPU es viable con la versión CTranslate2.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA T4, RTX 2060 o superior). En Colab T4 funciona sin problemas.
- **CPU**: la versión CTranslate2 con `compute_type="int8"` permite ejecución en CPU de gama media (p. ej., Intel i5 o superior) con latencia de varios segundos por segmento de 30 s.
- **Opciones de despliegue**: Transformers (PyTorch), faster-whisper (CTranslate2), o conversión a otros formatos (ONNX, etc.) a partir del checkpoint.
- **Latencia estimada**: no disponible; depende del hardware y del tamaño de lote. En CPU, un segmento de 30 s puede tardar entre 5 y 15 segundos con beam_size=5.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos ASR para yoruba en la información disponible. Como referencia, se puede comparar con el Whisper-small original de OpenAI, que es el modelo base y que, sin ajuste, suele presentar un WER más alto en yoruba (no hay datos oficiales publicados en esta ficha). Otras alternativas genéricas como Whisper-tiny o Whisper-base podrían usarse como referencia, pero sus resultados en yoruba no están documentados aquí. Se recomienda consultar los benchmarks de la comunidad para modelos multilingües como MMS (Meta) o Whisper en lenguas africanas.

## Limitaciones y advertencias

- **Rendimiento conversacional pobre**: el WER en habla conversacional es muy alto (1.087 crudo), lo que limita su uso en diálogos reales.
- **Errores tonales y de diacríticos**: frecuentes; se recomienda usar puntuación sin diacríticos para tareas downstream.
- **Cobertura limitada de acentos y registros**: el entrenamiento incluye una muestra acotada de WAXAL, por lo que la generalización a otros acentos del yoruba es limitada.
- **Capacidad del modelo base**: Whisper-small tiene límites en audio ruidoso, solapado o con micrófonos lejanos.
- **Licencias de datos**: el corpus base y la muestra WAXAL requieren verificación de sus términos antes de uso comercial; IroyinSpeech es CC-BY 4.0.
- **No apto para producción**: DevBlock no lo considera listo para uso comercial (umbral WER ≤ 0.20 no alcanzado).
- **Sin soporte para otros idiomas**: el modelo está especializado en yoruba y no debe usarse para transcribir otras lenguas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/devblockHQ/eti-yoruba-asr)
- [Web de DevBlock Technology](https://devblocktechnologies.com)
- [Dataset IroyinSpeech](https://huggingface.co/datasets/Tundragoon/IroyinSpeech)
- [Dataset voicedata/final_yoruba](https://huggingface.co/datasets/voicedata/final_yoruba)
- [Whisper-small (modelo base)](https://huggingface.co/openai/whisper-small)
- [Repositorio de entrenamiento (notebook)](https://huggingface.co/devblockHQ/eti-yoruba-asr/tree/main/train)
