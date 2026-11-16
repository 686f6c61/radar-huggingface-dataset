# Phoonnx/vits-ee-openbible-graphemes

## Resumen

`vits-ee-openbible-graphemes` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx para su librería de inferencia ONNX. El modelo convierte texto en ewe (código ISO `ee`, lengua gbe hablada en Ghana y Togo) a audio, tomando como entrada directa los caracteres del texto (graphemes) sin conversión fonémica intermedia.

El modelo se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que lo hace ligero y apto para despliegue en entornos con recursos limitados. Su origen es el modelo `tts_models--ewe--openbible--vits` publicado en la release v0.6.2 de Coqui TTS, entrenado sobre el corpus OpenBible en ewe. Phoonnx lo ha reempaquetado para integrarse en su ecosistema de TTS, que incluye la librería `phoonnx` y el normalizador de texto `scriptconv`.

Su relevancia radica en ser una de las pocas opciones de TTS disponible para una lengua de bajos recursos como el ewe, con licencia CC-BY-SA 4.0 y un formato de despliegue ligero (ONNX) que facilita su integración en asistentes de voz y aplicaciones de accesibilidad. No es un modelo de propósito general ni multilingüe: está especializado exclusivamente en ewe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX) |
| Idiomas soportados | ewe (`ee`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | caracteres (graphemes) via `GraphemePhonemizer` de scriptconv |
| Libreria de inferencia | phoonnx (Python / OVOS) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con pérdidas GAN, junto con alineamiento monotónico aprendido (MAS). El modelo genera formas de onda directamente a partir del texto, sin necesidad de un vocoder externo separado, lo que reduce la latencia y simplifica el despliegue.

El modelo fue entrenado por Coqui sobre el corpus OpenBible en ewe, un conjunto de datos de audio y transcripciones de dominio bíblico. No se dispone de información sobre el número de tokens, horas de audio, composición exacta del dataset ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a TTS). La innovación principal del empaquetado de Phoonnx es la conversión a ONNX y la integración con `scriptconv` para la normalización de texto y la tokenización por grafemas, lo que permite inferencia sin dependencias de PyTorch.

## Capacidades

- Síntesis de voz a partir de texto en ewe, con salida en formato WAV.
- Entrada basada en grafemas: no requiere un diccionario fonético externo ni un modelo de G2P separado.
- Integración con la librería `phoonnx` para Python y con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Normalización de texto previa mediante `scriptconv` (`GraphemePhonemizer`).
- Inferencia en ONNX, sin necesidad de GPU ni de PyTorch en tiempo de ejecución.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No es multilingüe: solo ewe.
- No dispone de modo "thinking" ni capacidades de generación de texto.

## Casos de uso

- **Asistentes de voz en ewe para OVOS**: el modelo se integra directamente como plugin TTS (`ovos-tts-plugin-phoonnx`) configurando la voz `coqui/ewe-openbible-vits` en `mycroft.conf`, lo que permite dotar de voz a un asistente doméstico en ewe sin infraestructura adicional.
- **Accesibilidad para hablantes de ewe**: lectura en voz alta de textos, documentos o interfaces para personas con discapacidad visual, aprovechando el tamaño reducido del modelo (0,1 GB) para ejecución local en dispositivos modestos.
- **Locución de contenido bíblico y religioso**: dado que el modelo se entrenó sobre OpenBible, es adecuado para narrar pasajes y materiales de dominio similar, donde el estilo y el vocabulario coinciden con los datos de entrenamiento.
- **Aplicaciones educativas en lenguas gbe**: generación de audio para materiales de aprendizaje de ewe, con pronunciación consistente y sin dependencia de servicios en la nube.
- **Sistemas de anuncios y notificaciones**: síntesis de mensajes cortos en ewe para transporte público, comercios o servicios públicos en regiones de Ghana y Togo, con inferencia ONNX de baja latencia.
- **Investigación en TTS de bajos recursos**: el modelo sirve como línea base para experimentos de síntesis en lenguas con pocos datos, comparando con otros modelos VITS de la colección de Phoonnx.
- **Prototipado de pipelines de voz offline**: al ser ONNX y no requerir GPU, se puede desplegar en Raspberry Pi o servidores sin acelerador para pruebas de concepto de TTS en ewe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica de forma estricta; al ser un modelo ONNX de 0,1 GB, la inferencia puede ejecutarse en CPU con huella de memoria del orden de cientos de MB.
- **GPU recomendadas**: no se especifican; el modelo está pensado para inferencia en CPU. Cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría acelerar la inferencia, pero no es un requisito.
- **GPU de consumo**: cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos embebidos; el cuello de botella es el tamaño del modelo, no la VRAM.
- **Opciones de despliegue**: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), ONNX Runtime directamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-ee-openbible-graphemes` | VITS | ewe (`ee`) | 0,1 GB | CC-BY-SA-4.0 | ONNX | Hugging Face |
| `coqui/ewe-openbible-vits` (upstream) | VITS | ewe (`ee`) | no disponible | CC-BY-SA-4.0 | PyTorch (Coqui TTS) | Release de Coqui TTS |
| Otros modelos VITS de la coleccion Phoonnx | VITS | diversas lenguas | variable | variable | ONNX | Hugging Face (colección VITS) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Sesgo de dominio**: entrenado sobre OpenBible, el modelo puede producir prosodia y vocabulario sesgados hacia el registro bíblico, con menor naturalidad en otros dominios.
- **Riesgo de alucinación acústica**: como todo TTS, puede generar pronunciaciones incorrectas o artefactos ante texto fuera de distribución, especialmente con números, siglas o préstamos léxicos.
- **Cobertura limitada de grafemas**: al usar entrada por caracteres sin G2P, la pronunciación depende de la correspondencia grafema-fonema aprendida; caracteres no vistos durante el entrenamiento pueden producir errores.
- **Monolingüe**: solo soporta ewe; no debe usarse con texto en otros idiomas.
- **Licencia CC-BY-SA-4.0**: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia (copyleft). Es necesario revisar las implicaciones para productos propietarios.
- **Sin benchmarks publicados**: no hay métricas objetivas (MOS, WER) disponibles para evaluar la calidad antes de desplegar.
- **Mantenimiento**: el modelo upstream pertenece a Coqui, cuya actividad cesó; el empaquetado corre a cargo de Phoonnx, con solo 17 descargas y 0 likes en el momento de la consulta, lo que indica baja validación comunitaria.
- **Producción**: conviene realizar pruebas de calidad perceptual (MOS) y de inteligibilidad antes de usarlo en aplicaciones críticas.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ee-openbible-graphemes
- Modelo upstream (Coqui TTS v0.6.2): https://github.com/coqui-ai/TTS/releases/download/v0.6.2_models/tts_models--ewe--openbible--vits.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
