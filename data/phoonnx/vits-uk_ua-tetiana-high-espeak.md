# Phoonnx/vits-uk_ua-tetiana-high-espeak

## Resumen

vits-uk_ua-tetiana-high-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx en formato ONNX para su biblioteca de inferencia homónima. El modelo convierte texto en ucraniano (variante uk-UA) en audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su propósito es ofrecer una voz TTS ligera, offline y de alta calidad para aplicaciones de asistencia por voz, lectores de pantalla y sistemas embebidos en ucraniano.

La relevancia de este modelo radica en su naturaleza empaquetada y estandarizada: Phoonnx lo distribuye como un artefacto ONNX listo para ejecutarse tanto en Python como en el navegador mediante phoonnx.js, además de integrarse en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. Esto lo hace adecuado para despliegues en dispositivos con recursos limitados, donde un modelo TTS neuronal completo resultaría inviable.

El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto orientado a inferencia en tiempo real. La licencia MIT del upstream facilita su uso comercial, aunque el modelo hereda las limitaciones del pipeline de Rhasspy/Piper y depende de espeak-ng para la fonemización correcta del ucraniano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el tamaño del repo de 0,1 GB sugiere precisión reducida, pero no se especifica) |
| Idiomas soportados | ucraniano (uk-UA) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto basado en transformers, un prior variacional condicionado por alineamientos monotónicos, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multi-periodo para el entrenamiento. El resultado es un modelo que genera formas de onda directamente a partir de fonemas sin necesidad de un vocoder separado, lo que simplifica el despliegue y reduce la latencia.

El modelo original fue entrenado por Rhasspy dentro del proyecto Piper, que produce voces TTS neuronales optimizadas para ejecución local. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). La innovación destacable en este empaquetado es la integración con `scriptconv` para la normalización de texto y la fonemización mediante `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul`, que convierte el texto ucraniano en fonemas IPA compatibles con el modelo.

## Capacidades

- Síntesis de voz en ucraniano (uk-UA) a partir de texto plano.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, lo que permite control fino de la pronunciación si se proporcionan fonemas directamente.
- Ejecución offline y local, sin dependencia de servicios en la nube.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx` para asistentes de voz.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de LLM; es exclusivamente un modelo TTS.
- No soporta visión, audio de entrada ni modos de pensamiento.

## Casos de uso

- Asistentes de voz en ucraniano: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para que un asistente doméstico responda en ucraniano con latencia baja, aprovechando que el modelo es compacto y se ejecuta localmente.
- Lectores de pantalla y accesibilidad: conversión de texto a voz para personas con discapacidad visual que necesiten contenido en ucraniano, con la ventaja de funcionar sin conexión y sin enviar texto a servidores externos.
- Sistemas de navegación y avisos por voz en dispositivos embebidos: el tamaño reducido del modelo (0,1 GB) permite desplegarlo en Raspberry Pi u otros SBC para anuncios de rutas, alertas o notificaciones en ucraniano.
- Audiolibros y contenido educativo: generación de narraciones en ucraniano para materiales didácticos o artículos, con la posibilidad de procesar lotes de texto mediante la API de Python.
- Atención al cliente automatizada por voz: uso como capa de salida de voz en IVR o chatbots telefónicos en ucraniano, combinado con un ASR y un LLM para el diálogo.
- Aplicaciones web de accesibilidad: uso de phoonnx.js para sintetizar voz en el navegador sin backend, útil en portales educativos o de noticias en ucraniano.
- Pruebas y desarrollo de pipelines TTS: al ser un modelo ONNX estandarizado, sirve como referencia para comparar calidad y latencia frente a otras voces Piper en ucraniano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repo (0,1 GB) sugiere que el modelo cabe holgadamente en menos de 1 GB de memoria, incluso en CPU.
- GPU recomendadas: no se especifican; al ser un modelo VITS compacto en ONNX, puede ejecutarse en CPU y en GPUs consumer modestas (por ejemplo, GTX 1050 o superiores), aunque no hay datos oficiales.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de VRAM, aunque no se confirma en la documentación.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), OVOS mediante `ovos-tts-plugin-phoonnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS VITS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-uk_ua-tetiana-high-espeak (este) | VITS | uk-UA | no aplica | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces Piper uk_UA (upstream Rhasspy) | VITS | uk-UA | no aplica | MIT (según upstream) | ONNX | Hugging Face (rhasspy/piper-voices) |
| Modelos TTS multilingües tipo XTTS | no disponible | multilingüe | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de espeak-ng: si no se instala espeak-ng, phoonnx puede usar el port espyak, cuyos fonemas difieren y pueden provocar pronunciaciones incorrectas en algunas palabras.
- Cobertura limitada a un solo idioma (ucraniano, uk-UA); no soporta otros idiomas ni cambio de voz.
- Riesgo de pronunciación incorrecta en palabras con grafías ambiguas, nombres propios o extranjerismos, al depender de la fonemización automática de espeak-ng.
- No se han publicado métricas objetivas (MOS, WER de ASR inverso) en la información disponible, por lo que la calidad real no está cuantificada.
- Licencia MIT declarada por el upstream, lo que en principio permite uso comercial, pero se recomienda verificar la cadena de licencias del proyecto Piper y de espeak-ng (GPL) si se redistribuye el binario.
- Al ser un modelo TTS, no genera texto ni razona; no debe confundirse con un LLM.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación por parte de la comunidad.
- No se especifican limitaciones de longitud de texto; los fragmentos largos deben dividirse en frases para evitar degradación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-uk_ua-tetiana-high-espeak
- Upstream (Rhasspy Piper voices, uk_UA/tetiana/high): https://huggingface.co/rhasspy/piper-voices/tree/main/uk/uk_UA/tetiana/high
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo de phoonnx.js: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
