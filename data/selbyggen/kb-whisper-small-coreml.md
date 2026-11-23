# Selbyggen/kb-whisper-small-coreml

## Resumen

KB-Whisper small – WhisperKit / Core ML es una conversión de formato del modelo KBLab/kb-whisper-small, desarrollado por la Biblioteca Nacional de Suecia (Kungliga biblioteket, KBLab). No se trata de un modelo nuevo: los pesos y el comportamiento son los del modelo original de reconocimiento automático de voz (ASR) especializado en sueco, y este repositorio únicamente lo empaqueta en Core ML para que se ejecute sobre el Apple Neural Engine mediante WhisperKit. El autor de la conversión es el usuario Selbyggen.

El modelo resuelve la transcripción de audio en sueco con ejecución local en dispositivos Apple (Mac, iPhone, iPad), sin que el audio abandone el dispositivo. Está basado en la arquitectura Whisper small de OpenAI (transformer encoder-decoder), y conserva el tokenizador de openai/whisper-small. Es relevante para desarrolladores que necesiten ASR en sueco dentro del ecosistema Apple, con privacidad por diseño y sin dependencia de servicios en la nube.

El repositorio ocupa aproximadamente 0,5 GB y se distribuye con licencia Apache 2.0, la misma que el modelo original. La conversión se realizó con whisperkittools en precisión float16, sin cuantización, y las pruebas integradas de conversión (encoder de audio y decoder de texto frente a la referencia en PyTorch) se superaron correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper small (transformer encoder-decoder) convertido a Core ML |
| Parametros totales | no disponible (corresponde a Whisper small; el repositorio no declara cifra) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; no declarada en la ficha) |
| Tipos de cuantizacion | float16, sin cuantizacion |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (whisperkit / Core ML para Apple Neural Engine) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper small de OpenAI, un transformer encoder-decoder orientado a reconocimiento automático de voz. El modelo base KBLab/kb-whisper-small es un ajuste fino (fine-tuning) del Whisper small original sobre datos de sueco por parte de KBLab, la unidad de laboratorio de la Biblioteca Nacional de Suecia. La revisión utilizada en la conversión es la `main` por defecto de KBLab, correspondiente a su «Stage 2».

Esta ficha describe una conversión de formato, no un reentrenamiento: los pesos y el comportamiento son los de KBLab. La conversión se realizó con la herramienta whisperkittools mediante el comando `whisperkit-generate-model --model-version KBLab/kb-whisper-small`, en precisión float16 y sin cuantización. Los ficheros `config.json` y `generation_config.json` se copiaron sin cambios desde el modelo original. El decoder de texto emite `alignment_heads_weights`, lo que permite obtener marcas de tiempo a nivel de palabra. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset en la información proporcionada.

## Capacidades

- Reconocimiento automático de voz (ASR) en sueco, con transcripción de audio a texto.
- Marcas de tiempo a nivel de palabra gracias a la salida de `alignment_heads_weights` en el decoder de texto.
- Ejecución local sobre el Apple Neural Engine mediante WhisperKit, sin envío de audio a la nube.
- Compatibilidad con el tokenizador de openai/whisper-small.
- Soporte de selección de idioma en la decodificación (parámetro `language: "sv"` en `DecodingOptions`).
- No se declaran capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripción local de reuniones en sueco: la app de referencia (Sagt) usa este modelo para transcribir grabaciones y reuniones en Mac, iPhone e iPad, con todo el procesamiento en el dispositivo y sin que el audio salga de él.
- Aplicaciones de notas de voz para usuarios suecos: integración en apps iOS/macOS que conviertan dictados en texto editable, aprovechando la ejecución sobre el Apple Neural Engine para reducir consumo y latencia.
- Subtitulado de contenido audiovisual en sueco: las marcas de tiempo a nivel de palabra permiten generar subtítulos sincronizados a partir de pistas de audio.
- Herramientas de accesibilidad: transcripción en tiempo real o diferida para personas con dificultades auditivas en entornos de habla sueca, ejecutándose íntegramente en el dispositivo.
- Investigación y archivística: procesamiento de grabaciones en sueco (entrevistas, archivos orales) en entornos donde la privacidad impide subir audio a servicios externos.
- Prototipado rápido en Swift: integración con WhisperKit mediante `WhisperKit.download` y `WhisperKitConfig(modelFolder:)` para validar pipelines de ASR en sueco sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que las pruebas integradas de la conversión (encoder de audio y decoder de texto frente a la referencia en PyTorch) se superaron correctamente, pero no aporta métricas de WER, latencia ni throughput.

## Requisitos de hardware

- Diseñado para ejecutarse sobre el Apple Neural Engine en dispositivos Apple (Mac, iPhone, iPad).
- Tamaño del repositorio: aproximadamente 0,5 GB, en float16 sin cuantización.
- No se especifican requisitos de VRAM ni de memoria unificada concretos en la información disponible.
- No aplica a GPU NVIDIA (A100, H100, RTX 4090) en su formato Core ML; para esas plataformas habría que usar el modelo original KBLab/kb-whisper-small en PyTorch.
- Despliegue previsto mediante WhisperKit (librería Swift) y la herramienta whisperkittools para la generación del modelo.
- No se dispone de datos de latencia ni de throughput estimados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| Selbyggen/kb-whisper-small-coreml | no disponible (Whisper small) | no disponible | sueco | Apache 2.0 | Core ML / Apple Silicon |
| KBLab/kb-whisper-small (modelo base) | no disponible (Whisper small) | no disponible | sueco | Apache 2.0 | safetensors / PyTorch |
| openai/whisper-small | no disponible en la información proporcionada | no disponible | multilingüe | Apache 2.0 | PyTorch |

La diferencia principal frente al modelo base es el formato: esta versión está empaquetada para Core ML y WhisperKit, mientras que KBLab/kb-whisper-small se distribuye en formato PyTorch. No se dispone de datos de rendimiento comparativo entre ambas variantes.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en sueco; no está pensado para otros idiomas.
- Es una conversión de formato, no un modelo nuevo: cualquier limitación del modelo base KBLab/kb-whisper-small se hereda íntegramente.
- Riesgo de alucinación y de errores de transcripción inherente a los modelos Whisper, especialmente con audio ruidoso o acentos no representados en el entrenamiento.
- Uso restringido en la práctica al ecosistema Apple; no es directamente desplegable en vLLM, llama.cpp, Ollama ni TGI.
- No se han publicado métricas de calidad (WER) ni de sesgos en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales de KBLab.
- El repositorio tiene un volumen de descargas bajo (483) y un solo «like», lo que sugiere una validación comunitaria limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Selbyggen/kb-whisper-small-coreml
- Modelo base: https://huggingface.co/KBLab/kb-whisper-small
- Organización KBLab: https://huggingface.co/KBLab
- WhisperKit (GitHub): https://github.com/argmaxinc/WhisperKit
- whisperkittools (GitHub): https://github.com/argmaxinc/whisperkittools
- App de referencia Sagt: https://sagtapp.com/sv/
