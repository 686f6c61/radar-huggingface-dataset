# Phoonnx/glowtts-uk_ua-mai

## Resumen

glowtts-uk_ua-mai es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Coqui a partir de su toolkit TTS (v0.6.1). El modelo ha sido empaquetado por Phoonnx para su librería ONNX de TTS, lo que permite ejecutarlo de forma portable en Python y en el ecosistema OVOS (Open Voice OS). Está especializado en la síntesis de voz en ucraniano (variante `uk-UA`) y utiliza un vocoder externo, `multiband_melgan-uk_ua-mai`, para convertir el espectrograma generado en audio.

El modelo resuelve la necesidad de un TTS ligero y desplegable en local para ucraniano, un idioma con relativamente pocos recursos de voz open source en comparación con el inglés. Su tamaño de repositorio (0,1 GB) y su formato ONNX lo hacen adecuado para entornos con recursos limitados, como dispositivos de borde, asistentes domésticos o aplicaciones embebidas. La licencia MIT facilita su uso comercial sin restricciones de atribución más allá del aviso de copyright.

La relevancia actual del modelo radica en su integración con el plugin `ovos-tts-plugin-phoonnx`, que permite incorporarlo en asistentes de voz open source, y en su empaquetado ONNX, que simplifica el despliegue sin dependencias del stack original de Coqui. No se dispone de información sobre el número de parámetros, el volumen de datos de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acoplado por flujo normalizador, normalizing flow) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por caracteres del texto) |
| Tipos de cuantizacion | no disponible (formato ONNX; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | ucraniano (uk-UA) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para la librería phoonnx) |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en flujos normalizadores (normalizing flows) que aprende una correspondencia monotónica entre el texto y el espectrograma mel mediante alineamiento dinámico, sin necesidad de un modelo autorregresivo de atención. La arquitectura incluye un encoder de texto, un bloque de flujo invertible y una búsqueda de alineamiento monotónico (MAS, Monotonic Alignment Search) durante el entrenamiento. El modelo genera un espectrograma mel que posteriormente es convertido a audio por un vocoder separado, en este caso `multiband_melgan-uk_ua-mai`, un vocoder de tipo MultiBand-MelGAN.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo original fue entrenado por Coqui y publicado en su release v0.6.1; Phoonnx se limita a empaquetarlo en ONNX y a integrarlo en su pipeline de inferencia. El front-end de texto utiliza `GraphemePhonemizer` de la librería `scriptconv`, que normaliza el texto y lo convierte en la entrada de caracteres esperada por el modelo.

## Capacidades

- Síntesis de voz en ucraniano (uk-UA) a partir de texto escrito.
- Generación de espectrogramas mel que se convierten en audio mediante el vocoder MultiBand-MelGAN.
- Entrada basada en caracteres (graphemes), sin necesidad de fonemización experta explícita por parte del usuario.
- Integración con la librería phoonnx para inferencia en Python y en OVOS.
- Soporte de despliegue mediante ONNX, lo que facilita la ejecución en CPU y entornos sin GPU.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking; se trata exclusivamente de un modelo TTS.
- Capacidad monolingüe: solo ucraniano.

## Casos de uso

- Asistentes de voz domésticos en OVOS: el modelo se integra mediante el plugin `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf`, permitiendo respuestas habladas en ucraniano en asistentes open source.
- Lectura de textos en ucraniano para accesibilidad: conversión de documentos, artículos o mensajes a audio para personas con discapacidad visual o para consumo en movilidad.
- Generación de audiolibros y contenido narrado en ucraniano: el modelo produce espectrogramas y audio a partir de texto plano, adecuado para pipelines de narración automatizada.
- Sistemas de anuncios y notificaciones en dispositivos embebidos: al ser un modelo ligero en ONNX (repo de 0,1 GB), puede ejecutarse en hardware de bajo consumo para mensajes cortos.
- Prototipado de interfaces de voz en ucraniano: desarrolladores que necesitan un TTS local y con licencia permisiva para pruebas de concepto o demos.
- Localización de aplicaciones: generación de voz en ucraniano para aplicaciones que ya operan en otros idiomas y necesitan una capa de síntesis adicional sin depender de servicios en la nube.
- Investigación en TTS de bajo recurso: el modelo sirve como referencia para experimentos con Glow-TTS en idiomas con pocos datos, dado su empaquetado reproducible en ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo Glow-TTS de tamaño reducido (repo de 0,1 GB) y ejecutable en ONNX, es probable que funcione en CPU, pero no se documentan cifras de VRAM.
- GPU recomendadas: no disponible; no se especifican GPU concretas (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible; el formato ONNX sugiere viabilidad en CPU y posible ejecución en GPU de consumo, pero sin datos confirmados.
- Opciones de despliegue: librería phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecución ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-uk_ua-mai (este modelo) | Glow-TTS | ucraniano (uk-UA) | no disponible | MIT | ONNX (phoonnx) | Hugging Face, 33 descargas |
| Otros modelos Glow-TTS de Coqui (colección Phoonnx) | Glow-TTS | varios idiomas | no disponible | MIT (según Coqui) | ONNX (phoonnx) | Colección Glow-TTS en Hugging Face |
| TTS multilingüe de gran escala (p. ej. modelos tipo VITS/XLS-R) | VITS / otros | multilingüe | no disponible | variable | variable | no disponible en la información |

No se dispone de datos de rendimiento comparativo (calidad MOS, latencia) para establecer una comparación cuantitativa con alternativas. La comparación se limita a arquitectura, idioma, licencia y formato.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza ucraniano (uk-UA); no soporta otros idiomas.
- Riesgo de alucinación acotado al ámbito TTS: puede producir pronunciaciones incorrectas o prosodia artificial en textos con abreviaturas, números o palabras fuera del vocabulario de entrenamiento.
- Sesgos: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos de voz de un hablante o conjunto limitado (identificado como "mai"), la voz resultante puede reflejar características demográficas concretas y no cubrir diversidad de acentos.
- Limitaciones de contexto: no aplica ventana de contexto tipo LLM; la entrada es texto por caracteres, y textos muy largos deben fragmentarse.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con aviso de copyright; no se identifican restricciones adicionales en la información disponible.
- Caveat para producción: depende de un vocoder externo (`multiband_melgan-uk_ua-mai`) que phoonnx descarga junto con la voz; la calidad final depende de ambos componentes. No se documentan métricas de calidad (MOS) ni pruebas de robustez en entornos ruidosos.
- Dependencia de librerías de terceros: requiere phoonnx (instalación con `pip install --pre phoonnx`) y scriptconv para la normalización del texto.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-uk_ua-mai](https://huggingface.co/Phoonnx/glowtts-uk_ua-mai)
- [Modelo original Coqui TTS v0.6.1 (tts_models--uk--mai--glow-tts.zip)](https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--uk--mai--glow-tts.zip)
- [Vocoder multiband_melgan-uk_ua-mai](https://huggingface.co/Phoonnx/multiband_melgan-uk_ua-mai)
- [Colección Glow-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3)
- [Repositorio phoonnx (TigreGotico)](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv (TigreGotico)](https://github.com/TigreGotico/scriptconv)
