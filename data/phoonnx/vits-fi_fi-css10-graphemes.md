# Phoonnx/vits-fi_fi-css10-graphemes

## Resumen

`vits-fi_fi-css10-graphemes` es un modelo de síntesis de voz (text-to-speech) en finés desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. Se trata de una conversión del modelo `tts_models--fi--css10--vits` publicado en Coqui TTS v0.8.0, orientado a la generación de audio a partir de texto escrito en finés de Finlandia (`fi-FI`).

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema end-to-end que combina un codificador de texto, un prior variacional, un decoder basado en flujos y un vocoder HiFi-GAN integrado, todo entrenado de forma conjunta. El front-end de texto es puramente grafémico: recibe los caracteres del texto y los procesa mediante `GraphemePhonemizer` de la librería `scriptconv`, sin conversión fonética explícita.

Su relevancia es acotada y práctica: ofrece una alternativa ligera (0,1 GB de repositorio) y con licencia permisiva BSD-3-Clause para integrar TTS en finés dentro de asistentes de voz como OVOS/Mycroft o en aplicaciones Python que necesiten síntesis local sin depender de servicios en la nube. No es un modelo de propósito general ni compite en la categoría de los grandes modelos de lenguaje, sino que es un componente especializado de un solo idioma y una sola tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX) |
| Idiomas soportados | finés (`fi-FI`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema text-to-speech end-to-end que integra en un único modelo un codificador de texto, un prior variacional condicionado por la duración fonética, un decoder generativo basado en flujos normalizadores y un vocoder del tipo HiFi-GAN. Este diseño permite generar formas de onda directamente desde la secuencia de entrada, sin necesidad de un vocoder externo en cascada, lo que reduce la latencia y simplifica el despliegue.

El entrenamiento original proviene del modelo `tts_models--fi--css10--vits` de Coqui TTS v0.8.0, entrenado sobre el corpus CSS10 (un dataset multilingüe de habla de dominio público con un único hablante por idioma). No se dispone en la información proporcionada de detalles sobre el número de tokens, composición exacta del dataset, ni sobre si se aplicaron etapas de RLHF o ajuste fino posteriores. La innovación técnica relevante para este empaquetado es la exportación a ONNX y la integración con el front-end grafémico de `scriptconv`, que normaliza el texto y lo convierte en la secuencia de entrada del modelo sin pasar por un fonemizador basado en reglas o diccionario.

## Capacidades

- Síntesis de voz a partir de texto escrito en finés (`fi-FI`).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de `phoonnx`.
- Entrada puramente grafémica: procesa los caracteres del texto sin conversión fonética intermedia.
- Integración nativa con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en local sobre ONNX, sin dependencia de servicios en la nube.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento: es exclusivamente un modelo TTS.
- Capacidad multilingüe: limitada al finés; no se declaran otros idiomas.

## Casos de uso

- Asistentes de voz en finés sobre OVOS/Mycroft: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente doméstico responda oralmente en finés sin conexión a internet, gracias a su tamaño reducido y a la ejecución ONNX local.
- Síntesis de voz en aplicaciones Python: mediante `TTSModelManager` y `voice.synthesize_wav`, cualquier script Python puede generar archivos WAV a partir de texto finés, útil para prototipos de accesibilidad o lectura de contenido.
- Lectura de notificaciones y alertas en sistemas embebidos: al ocupar 0,1 GB y ejecutarse en ONNX, es viable en dispositivos con recursos limitados que necesiten anunciar mensajes en finés.
- Generación de audiolibros o contenido narrado en finés: para volúmenes moderados de texto, el modelo permite producir narración local sin coste por petición, aunque la calidad y expresividad serán las de un modelo VITS de un único hablante.
- Pruebas de integración y CI/CD de pipelines de voz: sirve como voz de referencia determinista y ligera para validar flujos de TTS en finés dentro de suites de test automatizadas.
- Localización de interfaces habladas: aplicaciones que ya soportan múltiples idiomas pueden añadir finés como idioma de salida de voz con un modelo de licencia permisiva y bajo peso.
- Investigación en TTS de bajos recursos: el corpus CSS10 y la arquitectura VITS lo convierten en una línea base útil para comparar técnicas de normalización de texto o de fonemización grafémica frente a fonética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,1 GB) se trata de un modelo ligero que previsiblemente se ejecuta en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; al ser un modelo ONNX de pequeño tamaño, no requiere GPU para funcionar.
- ¿Cabe en GPU de consumo? Sí, con margen amplio, aunque no se detallan requisitos mínimos concretos.
- Opciones de despliegue: `phoonnx` (Python y OVOS), con backend ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-fi_fi-css10-graphemes` | VITS (Coqui) | finés (`fi-FI`) | no aplica (TTS) | BSD-3-Clause | ONNX | Hugging Face, vía `phoonnx` |
| `tts_models--fi--css10--vits` (Coqui TTS original) | VITS (Coqui) | finés (`fi-FI`) | no aplica (TTS) | BSD-3-Clause | checkpoint Coqui TTS | GitHub Releases de Coqui TTS |
| Otros modelos VITS empaquetados en la colección Phoonnx | VITS (Coqui) | varios idiomas | no aplica (TTS) | según modelo | ONNX | Hugging Face, colección `Phoonnx/vits` |

La comparativa se limita a variantes del mismo modelo original y a otros empaquetados de la misma colección, ya que no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo de un único hablante: no permite selección de voces ni control de estilo o emoción.
- Calidad limitada por el corpus CSS10, de dominio público y tamaño reducido; puede presentar prosodia menos natural que modelos entrenados con datasets mayores.
- Entrada puramente grafémica: al no usar fonemización explícita, la pronunciación de palabras ambiguas o extranjeras puede ser incorrecta.
- Riesgo de alucinación en el sentido de audio mal generado o ininteligible ante texto fuera de dominio, abreviaturas o caracteres no contemplados por la normalización de `scriptconv`.
- Cobertura limitada al finés (`fi-FI`); no se declaran otros idiomas ni variantes regionales.
- Licencia BSD-3-Clause: permisiva y apta para uso comercial, pero conviene conservar el aviso de copyright y verificar la cadena de licencias del modelo original de Coqui.
- Dependencia de las librerías `phoonnx` (instalada con `pip install --pre phoonnx`) y `scriptconv`; la versión preliminar (`--pre`) implica que la API puede cambiar.
- No apta para tareas de razonamiento, generación de texto, código, matemáticas, visión ni agentes; su uso debe restringirse a síntesis de voz.
- No se documentan métricas de calidad (MOS, WER) ni latencias, por lo que la evaluación en producción debe hacerse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fi_fi-css10-graphemes
- Modelo original de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--fi--css10--vits.zip
- Librería `phoonnx`: https://github.com/TigreGotico/phoonnx
- Librería `scriptconv`: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio de Coqui TTS: https://github.com/coqui-ai/TTS
