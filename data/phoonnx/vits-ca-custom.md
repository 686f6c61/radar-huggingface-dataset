# Phoonnx/vits-ca-custom

## Resumen

vits-ca-custom es un modelo de síntesis de voz (text-to-speech) en catalán basado en la arquitectura VITS, desarrollado originalmente por Coqui a partir de su toolkit TTS (release v0.10.1) y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo convierte texto en catalán a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA, y está pensado para integrarse en asistentes de voz y pipelines de TTS dentro del ecosistema OVOS.

El modelo resuelve la necesidad de una voz TTS en catalán ejecutable localmente y sin dependencias de servicios en la nube, con un tamaño de repositorio de 0,1 GB que lo hace ligero y desplegable en entornos modestos. Su empaquetado en ONNX permite inferencia portable en CPU y GPU, y su integración con el plugin ovos-tts-plugin-phoonnx facilita su uso en asistentes de voz basados en Mycroft/OVOS.

Es relevante ahora porque cubre un idioma con poca oferta de voces TTS abiertas de calidad, con licencia CC-BY-4.0 que permite uso comercial con atribución, y porque el ecosistema phoonnx ofrece una vía de despliegue en Python y en navegador (phoonnx.js) sin necesidad de infraestructura pesada. No se dispone de datos publicados sobre el número de parámetros, contexto o benchmarks de calidad de voz en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible (pesos empaquetados en ONNX) |
| Idiomas soportados | catalán (ca) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial de múltiples periodos para la síntesis de waveform. VITS produce audio de forma directa a partir de fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el pipeline.

El modelo original fue entrenado por Coqui y publicado en su release v0.10.1 como `tts_models--ca--custom--vits.zip`. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). La entrada textual se procesa mediante espeak-ng para obtener fonemas en alfabeto IPA; Phoonnx delega la normalización y conversión a la librería scriptconv, usando `EspeakPhonemizer` de `scriptconv.phonemizers.mul`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en catalán a partir de texto escrito.
- Conversión de texto a fonemas IPA mediante espeak-ng y scriptconv antes de la síntesis.
- Generación de audio en formato WAV mediante la API `synthesize_wav`.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No dispone de capacidades multimodales de visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada exclusivamente al catalán.

## Casos de uso

- Asistentes de voz locales en catalán: el modelo se integra como módulo TTS en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en catalán sin depender de servicios en la nube.
- Lectura de contenido web o documentos: se puede usar para convertir artículos, noticias o textos en catalán a audio para aplicaciones de accesibilidad o consumo en movilidad.
- Sistemas de anuncios y megafonía automatizada: generación de avisos pregrabados o dinámicos en catalán para estaciones, comercios o edificios públicos con licencia CC-BY-4.0 que permite uso comercial.
- Videojuegos y aplicaciones interactivas: síntesis de diálogos de personajes en catalán en tiempo real, aprovechando el tamaño reducido (0,1 GB) y la inferencia ONNX para ejecución local.
- Audiolibros y podcasts automatizados: generación de narración en catalán a partir de texto, con la ventaja de que la licencia permite su distribución comercial con atribución.
- Sistemas de navegación o información al conductor: lectura de indicaciones y mensajes en catalán en entornos embebidos gracias al formato ONNX y a la baja huella de almacenamiento.
- Demos web interactivas: uso de phoonnx.js para ejecutar la voz directamente en el navegador con la demo disponible en tigregotico.pt/demo, sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que la inferencia en ONNX es viable en CPU y en GPUs de gama baja.
- GPU recomendadas: no se especifican; por el tamaño del modelo, cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso iGPU es suficiente, aunque no hay datos oficiales.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con unos pocos cientos de MB de VRAM libres, dado el tamaño del artefacto.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-ca-custom (Phoonnx) | VITS (Coqui) | ca | CC-BY-4.0 | ONNX | Hugging Face, phoonnx |
| Otras voces VITS de la colección Phoonnx | VITS (Coqui) | varios | según modelo | ONNX | Hugging Face, phoonnx |
| TTS de Coqui original (ca-custom-vits) | VITS (Coqui) | ca | CC-BY-4.0 | PyTorch | GitHub Coqui TTS |

No se dispone de datos de parámetros, contexto ni rendimiento para establecer una comparativa cuantitativa con alternativas específicas; la información proporcionada solo permite comparar arquitectura, idioma, licencia y formato de distribución.

## Limitaciones y advertencias

- El modelo solo soporta catalán; no es multilingüe.
- La calidad de la síntesis depende de espeak-ng: si se usa espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No se han publicado métricas objetivas (MOS, WER) ni benchmarks de calidad de voz en la información disponible.
- Riesgo de alucinación no aplicable en el sentido de LLM, pero sí de pronunciación incorrecta o entonación deficiente en palabras fuera del dominio de entrenamiento.
- La licencia CC-BY-4.0 exige atribución al autor original (Coqui) y permite uso comercial con esa condición; es necesario revisar los términos completos de la licencia.
- El modelo está empaquetado para phoonnx; su uso fuera de ese ecosistema requiere convertir o cargar los pesos ONNX con herramientas compatibles.
- No hay información sobre sesgos demográficos o de género en la voz sintetizada.
- El modelo fue creado en 2026 según los metadatos del repositorio, con muy pocas descargas (29) y sin likes, lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ca-custom
- Modelo original Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.10.1_models/tts_models--ca--custom--vits.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Paper VITS (referencia de arquitectura): no disponible en la información proporcionada
