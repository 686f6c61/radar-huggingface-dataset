# Phoonnx/vits-en_us-ljs-kakao_enterprise

## Resumen

`Phoonnx/vits-en_us-ljs-kakao_enterprise` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por kakao-enterprise (modelo upstream `kakao-enterprise/vits-ljs`) y reempaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo genera audio a partir de texto en inglés estadounidense (`en-US`), tomando como entrada fonemas espeak en alfabeto IPA.

La relevancia de este paquete reside en su formato de despliegue: al estar convertido a ONNX, puede ejecutarse tanto en Python como en el navegador mediante `phoonnx.js`, lo que facilita su integración en asistentes de voz (OVOS), aplicaciones web y sistemas embebidos sin depender de frameworks de deep learning pesados. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace manejable para entornos con recursos limitados.

Se trata de un modelo especializado y de alcance acotado: un único idioma, una única voz y una tarea concreta (TTS). No es un modelo de lenguaje general ni soporta razonamiento, código o tool calling. Su valor está en la simplicidad de integración y en la licencia MIT heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el paquete no detalla cuantizaciones alternativas) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales, además de un aligner monotónico para el alineamiento texto-audio. El modelo upstream `kakao-enterprise/vits-ljs` fue entrenado sobre el corpus LJSpeech, un conjunto de un único hablante femenino en inglés estadounidense de dominio público.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de LJSpeech, ni sobre el uso de RLHF/DPO (técnicas no habituales en TTS). La innovación relevante de este paquete concreto no está en el entrenamiento, sino en el reempaquetado: conversión a ONNX y adaptación del front-end de texto mediante `scriptconv` y `espeak-ng` para la fonemización.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (`en-US`).
- Entrada basada en fonemas espeak en alfabeto IPA, con normalización de texto previa mediante `scriptconv`.
- Generación de audio en formato WAV mediante `voice.synthesize_wav()`.
- Ejecución en Python a través de `phoonnx` y en navegador mediante `phoonnx.js`.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: únicamente `en-US`.
- No dispone de modo thinking, visión ni audio de entrada.
- Voz única (single-speaker), sin control de estilo, emoción ni clonación.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite dotar de voz a un asistente doméstico configurando la voz en `mycroft.conf`, sin necesidad de infraestructura GPU dedicada.
- Síntesis de voz en aplicaciones web: mediante `phoonnx.js` el modelo puede ejecutarse en el navegador con entrada espeak o unicode, útil para lectores de pantalla, tutoriales interactivos o demos accesibles sin backend.
- Generación de audiolibros o narración de contenido en inglés: al aceptar texto plano y producir WAV, puede integrarse en pipelines de conversión de artículos o documentación a audio para consumo offline.
- Prototipado rápido de interfaces conversacionales: al ser un paquete ONNX ligero (0,1 GB) y con licencia MIT, es adecuado para validar flujos de voz en fases tempranas de desarrollo sin coste de licencia.
- Sistemas embebidos y de bajo consumo: el formato ONNX permite desplegar el modelo en dispositivos con recursos limitados donde no cabría un stack de TTS completo basado en PyTorch.
- Accesibilidad en aplicaciones de escritorio: integración en herramientas que requieran lectura de texto en voz alta en inglés estadounidense con una dependencia mínima (`phoonnx` + `espeak-ng`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio (0,1 GB) sugiere que el modelo es ligero y probablemente ejecutable en CPU.
- GPU recomendadas: no disponible. Por el tamaño del paquete, no requiere GPUs de datacenter (A100, H100); es plausible su ejecución en CPU o GPUs consumer modestas, aunque no se confirma en la documentación.
- ¿Cabe en consumer GPU?: no disponible de forma explícita; el tamaño del repositorio indica que sí es viable en hardware de consumo, pero sin cifras confirmadas.
- Opciones de despliegue: `phoonnx` (Python), `phoonnx.js` (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. Requiere `espeak-ng` instalado o el extra `phoonnx[espeak]`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phoonnx/vits-en_us-ljs-kakao_enterprise | VITS | en-US | MIT | ONNX | Paquete ligero para phoonnx/OVOS |
| kakao-enterprise/vits-ljs (upstream) | VITS | en-US | MIT | PyTorch (probable) | Modelo original, sin empaquetar para ONNX |
| Otros modelos VITS de la colección Phoonnx | VITS | variable | variable | ONNX | Misma librería, distintos idiomas/voces |

No se dispone de datos de rendimiento comparativo (MOS, RTF, etc.) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de un único idioma (`en-US`) y una única voz; no admite cambio de hablante ni de idioma.
- La fonemización depende de `espeak-ng`; si se usa el port `espyak`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de LJSpeech (nombres propios, siglas, términos técnicos) por limitaciones del front-end y del corpus de entrenamiento.
- No hay información publicada sobre sesgos de género, acento o prosodia más allá de la voz femenina de LJSpeech.
- Licencia MIT heredada del modelo upstream, lo que permite uso comercial, pero conviene verificar la cadena de licencias del modelo original y de las dependencias (`espeak-ng`, `phoonnx`, `scriptconv`).
- El paquete tiene muy pocas descargas (25) y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No apto para tareas de razonamiento, generación de texto, código o matemáticas: es exclusivamente un modelo TTS.
- Para producción, conviene evaluar la calidad perceptual (MOS) y la robustez ante texto no normalizado, ya que no se publican métricas al respecto.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ljs-kakao_enterprise
- Modelo upstream: https://huggingface.co/kakao-enterprise/vits-ljs
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
