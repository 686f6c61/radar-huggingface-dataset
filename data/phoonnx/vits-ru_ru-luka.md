# Phoonnx/vits-ru_ru-luka

## Resumen

vits-ru_ru-luka es un modelo de síntesis de voz (text-to-speech) en ruso basado en la arquitectura VITS, desarrollado originalmente por el usuario superkeka y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo toma texto en ruso (ru-RU), lo convierte a fonemas mediante espeak-ng y genera audio de voz de una única hablante identificada como "luka". Su relevancia radica en que permite integrar TTS en ruso en aplicaciones Python y en el ecosistema OVOS sin depender de servicios en la nube, con un peso de repositorio de aproximadamente 0,1 GB.

El modelo es una conversión de los pesos originales de Piper (superkeka/piper-tts-luka, variante "medium" para ru_RU) a formato ONNX, lo que facilita su despliegue en entornos con recursos limitados, incluidos dispositivos de borde y navegadores mediante phoonnx.js. La licencia Apache 2.0 declarada por el autor original permite uso comercial, aunque conviene verificar las condiciones del modelo upstream.

Se trata de un modelo especializado y de alcance reducido: un solo idioma, una sola voz y sin capacidades de clonación ni control de estilo. Su utilidad está en pipelines de TTS rusas embebidas, asistentes de voz locales y prototipos de accesibilidad, no en tareas generales de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, variante Piper "medium") |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto por frase) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru-RU) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado de forma conjunta; incorpora alineamiento monotónico mediante búsqueda y modelado de duración para producir audio directamente desde fonemas. La variante empaquetada corresponde al modelo "medium" de Piper para ru_RU, un tamaño intermedio orientado a un equilibrio entre calidad y velocidad de inferencia.

No se dispone de información sobre el número de tokens de audio utilizados, la composición del dataset de entrenamiento, ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables habitualmente en TTS). El front-end de texto utiliza fonemas generados con espeak-ng en alfabeto IPA; el modelo no incluye normalización de texto propia, que se delega en la librería scriptconv.

## Capacidades

- Síntesis de voz a partir de texto en ruso (ru-RU) con una única voz femenina ("luka").
- Entrada basada en fonemas IPA generados por espeak-ng, lo que requiere tener espeak-ng instalado o el extra `phoonnx[espeak]` (port espyak, con posibles discrepancias fonéticas).
- Generación de audio WAV mediante la API `voice.synthesize_wav(text, wav_file)` de phoonnx.
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable desde `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz locales en ruso: el modelo se integra en OVOS como módulo TTS y permite respuestas habladas sin conexión a internet, adecuado para dispositivos domésticos con recursos limitados.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: con un repositorio de 0,1 GB y formato ONNX, puede empaquetarse dentro de una aplicación Python para leer mensajes del sistema en ruso.
- Accesibilidad para personas con discapacidad visual: conversión de texto de pantalla a voz en herramientas rusas, con latencia baja al ejecutarse en CPU.
- Prototipado de interfaces conversacionales: permite validar flujos de diálogo en ruso antes de contratar un servicio TTS en la nube, gracias a la licencia Apache 2.0 y a la ausencia de coste por petición.
- Generación de audiolibros o contenido narrado de forma automatizada: la voz única y consistente es adecuada para narración por lotes de textos largos divididos en frases.
- TTS en el navegador: mediante phoonnx.js y la demo de TigreGotico, se puede ofrecer síntesis de voz rusa en una aplicación web sin backend, útil para demos y entornos educativos.
- Pruebas de pipelines de voz en CI: al ser un artefacto ONNX pequeño, se puede incluir en tests automatizados que verifiquen la generación de audio sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) se espera un consumo de memoria muy reducido, del orden de cientos de MB, ejecutable en CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para inferencia en CPU y en dispositivos de borde. Cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) podría acelerar la inferencia, pero no hay datos publicados.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con varios GB de VRAM, e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador; al ser ONNX, también puede ejecutarse con ONNX Runtime directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Voces | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-ru_ru-luka | VITS (Piper medium) | ru-RU | 1 | Apache 2.0 | ONNX | Hugging Face, phoonnx, OVOS |
| superkeka/piper-tts-luka (upstream) | VITS (Piper medium) | ru-RU | 1 | Apache 2.0 | Piper/ONNX | Hugging Face |
| Otros modelos Piper ru_RU | VITS | ru-RU | múltiples | variable | Piper/ONNX | Hugging Face, rhasspy/piper |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Una sola voz y un solo idioma: no admite cambio de hablante, emoción ni estilo.
- Dependencia de espeak-ng para la fonemización; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No incluye normalización de texto propia; números, abreviaturas y símbolos deben normalizarse antes mediante scriptconv u otra herramienta.
- Riesgo de alucinación acústica y artefactos en frases largas o con puntuación atípica, propio de los modelos VITS.
- Sesgos de la voz y del corpus de entrenamiento original no documentados; no hay información sobre la diversidad de hablantes ni de dominios del dataset.
- Licencia Apache 2.0 declarada por el upstream, pero conviene verificar la model card de superkeka/piper-tts-luka para confirmar condiciones de uso comercial y atribución.
- Sin datos publicados de benchmarks, latencia ni calidad subjetiva (MOS), lo que dificulta evaluar su idoneidad en producción frente a alternativas.
- Uso limitado a TTS: no debe emplearse para tareas de lenguaje general, razonamiento ni generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ru_ru-luka
- Modelo upstream: https://huggingface.co/superkeka/piper-tts-luka/tree/main/ru/ru_RU/luka/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Referencia de arquitectura VITS: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
