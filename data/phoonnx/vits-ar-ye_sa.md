# Phoonnx/vits-ar-ye_sa

## Resumen

vits-ar-ye_sa es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por wasmdashai y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en árabe (`ar`) en audio, tomando como entrada los caracteres del texto y produciendo formas de onda directamente mediante un modelo generativo condicional. Está pensado para su uso en pipelines de TTS ligeros y en el ecosistema OVOS (Open Voice OS) a través del plugin `ovos-tts-plugin-phoonnx`.

El modelo se distribuye en formato ONNX dentro de un repositorio de aproximadamente 0,1 GB, lo que lo sitúa en la categoría de modelos de voz ligeros aptos para despliegue en CPU y dispositivos de recursos limitados. La licencia es MIT, lo que facilita su integración en productos comerciales y proyectos de código abierto sin restricciones adicionales.

Su relevancia radica en la escasez de modelos TTS abiertos para árabe con empaquetado estandarizado y licencia permisiva, así como en su integración con una cadena de herramientas completa (phoonnx + scriptconv) que cubre normalización de texto, fonemización y síntesis. No obstante, la información pública disponible sobre el modelo es muy limitada: no se detallan datos de entrenamiento, número de parámetros ni resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por caracteres) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | árabe (`ar`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres del texto, procesados por `GraphemePhonemizer` de scriptconv |
| Tamaño del repositorio | ~0,1 GB |
| Librería de inferencia | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional condicionado por texto, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. El resultado es un modelo que genera formas de onda directamente a partir de texto sin necesidad de un vocoder separado, lo que simplifica el despliegue y reduce la latencia frente a pipelines en cascada.

En el caso de vits-ar-ye_sa, el autor original es wasmdashai y el modelo se distribuye empaquetado por Phoonnx para su ejecución en ONNX. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de la propia arquitectura VITS. El front-end de texto utiliza `GraphemePhonemizer` de la librería scriptconv, que normaliza el texto y lo convierte en la secuencia de entrada del modelo. El sufijo `ye_sa` en el nombre sugiere una variante dialectal o regional (posiblemente yemení-saudí), pero no se detalla en la documentación disponible.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en árabe.
- Generación directa de forma de onda sin vocoder externo, gracias a la arquitectura VITS end-to-end.
- Procesamiento de entrada a nivel de carácter mediante `GraphemePhonemizer` de scriptconv.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en ONNX, lo que permite inferencia en CPU y en entornos sin GPU.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al árabe (`ar`); no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz en árabe para OVOS: el modelo se integra como plugin de TTS en `mycroft.conf`, permitiendo dotar de voz a asistentes domésticos de código abierto con licencia MIT y despliegue en hardware modesto.
- Lectura de notificaciones y alertas en aplicaciones móviles o de escritorio: al ser un modelo ONNX de ~0,1 GB, puede ejecutarse localmente en dispositivos de gama media para leer mensajes en árabe sin depender de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: conversión de texto en árabe a voz para lectores de pantalla y aplicaciones de asistencia, con la ventaja de la licencia permisiva y la inferencia local.
- Automatización de atención telefónica o IVR en árabe: síntesis de respuestas pregrabadas dinámicamente en sistemas de telefonía, usando la inferencia ONNX para baja latencia en servidores CPU.
- Generación de audiolibros o contenido narrado en árabe: producción por lotes de audio a partir de texto, con la posibilidad de integrar el modelo en pipelines de procesamiento por lotes mediante phoonnx.
- Prototipado rápido de aplicaciones de voz en árabe: la instalación vía `pip install --pre phoonnx` y la API de `TTSModelManager` permiten integrar el modelo en pocas líneas de código para validar ideas de producto.
- Sistemas embebidos y de borde (edge computing): el tamaño reducido y el formato ONNX facilitan el despliegue en dispositivos con recursos limitados donde no es viable un modelo TTS de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de ~0,1 GB, es probable que la inferencia en CPU sea viable, pero no se documentan cifras de memoria ni de latencia.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, no requiere GPU dedicada para funcionar, aunque no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; el tamaño del repositorio (~0,1 GB) sugiere que sí, pero no se especifica.
- Opciones de despliegue: phoonnx (Python y plugin OVOS `ovos-tts-plugin-phoonnx`); ejecución en ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo | Contexto |
|---|---|---|---|---|---|---|
| vits-ar-ye_sa (Phoonnx) | VITS | árabe | MIT | ONNX | ~0,1 GB | no aplica |
| wasmdashai/vits-ar-ye-sa (upstream) | VITS | árabe | no disponible en la información | no disponible | no disponible | no aplica |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | MIT (según colección) | ONNX | variable | no aplica |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas concretas de la misma categoría. La comparativa se limita al modelo upstream y a la colección de modelos VITS empaquetados por Phoonnx.

## Limitaciones y advertencias

- Información pública muy limitada: no se documentan número de parámetros, datos de entrenamiento, evaluación ni latencia, lo que dificulta estimar su calidad real.
- Idioma restringido al árabe (`ar`); no se documenta soporte para otros idiomas ni para variantes dialectales específicas más allá del sufijo `ye_sa`.
- Riesgo de alucinación o artefactos de audio: como todo modelo TTS generativo, puede producir pronunciaciones incorrectas, entonación antinatural o artefactos en textos fuera de dominio.
- Sesgos potenciales derivados del dataset de entrenamiento no documentado (posibles sesgos de género, dialecto o registro).
- La licencia MIT permite uso comercial, pero el modelo upstream (wasmdashai/vits-ar-ye-sa) podría tener términos propios no reflejados en la información disponible; se recomienda verificar la licencia upstream antes de producción.
- Dependencia de la librería phoonnx en versión pre-release (`pip install --pre phoonnx`), lo que implica posibles cambios de API e inestabilidad.
- No apto para tareas de razonamiento, código, matemáticas, visión, tool calling ni agentes; es exclusivamente un modelo de síntesis de voz.
- El front-end de texto se limita a `GraphemePhonemizer`; no se documenta normalización avanzada de números, abreviaturas o símbolos más allá de lo que ofrezca scriptconv.

## Enlaces

- [Hugging Face: Phoonnx/vits-ar-ye_sa](https://huggingface.co/Phoonnx/vits-ar-ye_sa)
- [Modelo upstream: wasmdashai/vits-ar-ye-sa](https://huggingface.co/wasmdashai/vits-ar-ye-sa)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
