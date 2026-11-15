# Phoonnx/vits-ne_np-seto_bagh

## Resumen

`vits-ne_np-seto_bagh` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Wiseyak dentro de su proyecto `piper_tts` y empaquetado por Phoonnx para su libreria de inferencia ONNX `phoonnx`. El modelo convierte texto en nepalí (`ne-NP`) en audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA.

Se trata de un modelo de dominio muy acotado: una unica voz (`seto_bagh`) para un unico idioma, distribuido en formato ONNX con un tamano de repositorio de 0,1 GB. No es un modelo de lenguaje general ni un sistema TTS multilingue, sino un componente especializado pensado para integrarse en pipelines de sintesis de voz, particularmente en el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.

Su relevancia es limitada pero concreta: cubre una lengua de bajos recursos (nepalí) con una licencia permisiva (`openrail`) y un formato de despliegue ligero (ONNX), lo que facilita su ejecucion en entornos con pocos recursos o en el navegador a traves de `phoonnx.js`. La informacion publica disponible es escasa y no incluye detalles sobre datos de entrenamiento ni metricas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, variacional con decoder adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada limitada por la frase a sintetizar) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | nepalí (`ne-NP`) |
| Licencia | openrail |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Autor original | Wiseyak (`Wiseyak/piper_tts`) |
| Empaquetado | Phoonnx |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado de forma conjunta. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. En este caso, los pesos se exportan a ONNX para su ejecucion con `phoonnx`.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el numero de pasos de entrenamiento ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables de forma tipica en TTS). La model card unicamente indica la procedencia del modelo (`Wiseyak/piper_tts`) y el front-end de texto: fonemizacion mediante espeak-ng y conversion/normalizacion con la libreria `scriptconv`. No se documentan innovaciones tecnicas adicionales mas alla del propio diseno VITS.

## Capacidades

- Sintesis de voz (text-to-speech) en nepalí (`ne-NP`) a partir de texto plano.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemizacion de entrada mediante espeak-ng (alfabeto IPA); requiere espeak-ng instalado o el extra `phoonnx[espeak]`.
- Integracion con el ecosistema OVOS/Mycroft a traves de `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No es un modelo multilingue: unicamente nepalí.

## Casos de uso

- **Lectura de contenido en nepalí**: convertir articulos, noticias o documentacion a audio para accesibilidad o consumo pasivo, usando la API de phoonnx para generar ficheros WAV por frase.
- **Asistentes de voz en OVOS/Mycroft**: configurar la voz `piper_community/Wiseyak/ne-NP_seto_bagh` en `mycroft.conf` para dotar a un asistente domestico de respuesta hablada en nepalí.
- **Sistemas de anuncios y avisos automatizados**: generar mensajes de voz pregrabados o dinamicos (transporte, comercio, administracion) en nepalí sin depender de un servicio TTS en la nube.
- **Aplicaciones web de aprendizaje de idiomas**: reproducir pronunciaciones en nepalí en el navegador mediante `phoonnx.js`, sin backend, gracias al formato ONNX ligero.
- **Prototipado de interfaces de voz**: integrar rapidamente una voz nepalí en un prototipo de IVR o chatbot telefonico usando la libreria `phoonnx` en Python.
- **Generacion de audiolibros o podcasts de bajo coste**: sintetizar textos largos por fragmentos con un modelo de 0,1 GB que puede ejecutarse en hardware modesto.
- **Investigacion en TTS de bajos recursos**: usar el modelo como linea base o componente en estudios sobre sintesis para lenguas con pocos datos, dado su licencia permisiva y su formato abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) el modelo es muy ligero y cabe holgadamente en GPUs de consumo e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o inferiores sobran para este modelo.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer y en CPU.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS VITS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `Phoonnx/vits-ne_np-seto_bagh` | VITS | nepalí (`ne-NP`) | ONNX | openrail | Objeto de esta ficha |
| `Wiseyak/piper_tts` (upstream) | VITS (Piper) | nepalí y otras | no disponible | openrail | Modelo original del que deriva este empaquetado |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios idiomas | ONNX | openrail (segun cada modelo) | Mismo pipeline de empaquetado e inferencia |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo sintetiza nepalí (`ne-NP`); no admite otros idiomas.
- Una unica voz (`seto_bagh`); no hay variedad de hablantes.
- La calidad de pronunciacion depende de espeak-ng; con el port `espyak` algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No se documentan sesgos especificos, pero al ser un modelo entrenado con un corpus limitado y no documentado, puede presentar sesgos de dominio y una cobertura lexica reducida.
- Riesgo de artefactos o pronunciaciones incorrectas en palabras fuera del vocabulario o en texto no normalizado correctamente.
- La licencia `openrail` permite uso comercial con condiciones; conviene revisar los terminos completos antes de desplegar en produccion.
- No hay informacion publica sobre datos de entrenamiento, metricas de calidad ni evaluacion subjetiva (MOS), lo que dificulta estimar su idoneidad en produccion.
- No soporta funcionalidades de modelos de lenguaje (razonamiento, codigo, tool calling); su uso esta restringido a sintesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ne_np-seto_bagh
- Modelo upstream: https://huggingface.co/Wiseyak/piper_tts
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
