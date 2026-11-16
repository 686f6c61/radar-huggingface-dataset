# Phoonnx/vits-en_gb-vctk-medium-espeak

## Resumen

vits-en_gb-vctk-medium-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original procede de Rhasspy, concretamente del conjunto de voces Piper para en_GB con el corpus VCTK en calidad media. Phoonnx se limita a republicarlo en formato ONNX con una integración específica para su ecosistema Python y OVOS, de modo que el trabajo de modelado y entrenamiento corresponde a Rhasspy.

El modelo convierte texto en inglés británico a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. No acepta texto crudo directamente en el grafo: la normalización y la fonemización las realiza la librería scriptconv, que phoonnx invoca antes de la inferencia. Está pensado para síntesis local, ligera y sin dependencias de servicios en la nube, con un tamaño de repositorio de 0,1 GB que lo hace apto para dispositivos de recursos limitados.

Su relevancia es acotada pero clara: cubre el caso de uso de voces TTS británicas integrables en asistentes de voz autoalojados (OVOS/Mycroft) y en aplicaciones web mediante phoonnx.js. No es un modelo fundacional ni compite en naturalidad con sistemas neuronales de gran escala; su valor está en la portabilidad ONNX, la licencia MIT y la integración con un pipeline de fonemización reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-GB (inglés británico) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales, además de alineamiento monotónico. El modelo empaquetado por Phoonnx es la variante "medium" de la voz en_GB/vctk de Piper, entrenada por Rhasspy sobre el corpus VCTK (conjunto de voces multi-hablante en inglés con acento británico). La calidad "medium" de Piper implica un compromiso entre fidelidad acústica y tamaño de pesos.

No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO; los modelos VITS de Piper se entrenan con objetivos adversariales y de reconstrucción, no con preferencias humanas. La innovación destacable en este empaquetado es la integración con espeak-ng para la fonemización (alfabeto IPA) y con scriptconv para la normalización de texto, lo que separa el front-end lingüístico del grafo neuronal y permite sustituir el fonemizador sin reentrenar el modelo.

## Capacidades

- Síntesis de voz a partir de texto en inglés británico, con salida en formato WAV.
- Entrada basada en fonemas IPA generados por espeak-ng, no en texto crudo directo al modelo.
- Normalización de texto y conversión de script mediante la librería scriptconv.
- Integración con el ecosistema OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- Inferencia local en CPU o GPU mediante ONNX Runtime, sin llamadas a servicios externos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS puro).
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz autoalojados: integración en OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionando la voz `piper/en_GB-vctk-medium` en `mycroft.conf` para respuestas habladas en inglés británico sin depender de la nube.
- Síntesis en aplicaciones web: uso de phoonnx.js para generar audio en el navegador con la voz en_GB, útil en interfaces de accesibilidad o lectores de contenido que requieren pronunciación británica.
- Generación de audiolibros o narraciones: conversión por lotes de texto a WAV con la voz VCTK medium, adecuada para contenido donde prima la portabilidad sobre la naturalidad máxima.
- Sistemas embebidos y dispositivos de recursos limitados: el repositorio de 0,1 GB y el formato ONNX permiten desplegar la voz en Raspberry Pi u otros equipos sin GPU dedicada.
- Pruebas de pipelines TTS en investigación: al separar fonemización (espeak-ng) e inferencia (ONNX), sirve como banco de pruebas para comparar fonemizadores o normalizadores sin reentrenar el modelo.
- Prototipado de interfaces conversacionales: generación rápida de respuestas de voz en inglés británico para demos y validación de producto antes de invertir en modelos TTS de mayor escala.
- Localización de contenido para audiencias del Reino Unido: la variante en_GB de VCTK ofrece un acento británico coherente para materiales formativos o institucionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime (RTX 4090, A100, H100) puede ejecutarlo, aunque el modelo no requiere aceleración dedicada.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas actuales e incluso en CPU.
- Opciones de despliegue: ONNX Runtime a través de phoonnx (Python), phoonnx.js en navegador, plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_gb-vctk-medium-espeak (este) | VITS | en-GB | no aplica | MIT | ONNX | Hugging Face (Phoonnx) |
| rhasspy/piper-voices en_GB/vctk/medium | VITS | en-GB | no aplica | MIT | ONNX (Piper) | Hugging Face (Rhasspy) |
| Otras voces Piper en_GB (p. ej. variantes de calidad low/high) | VITS | en-GB | no aplica | MIT | ONNX | Hugging Face (Rhasspy) |
| Modelos TTS neuronales de gran escala (p. ej. familia XTTS) | no disponible | multilingüe | no aplica | varía según modelo | safetensors/ONNX | Hugging Face |

La comparación más directa es con el modelo upstream de Rhasspy, del que este es un reempaquetado para phoonnx; las diferencias se limitan al entorno de ejecución y a la integración con scriptconv y OVOS, no a los pesos. Frente a modelos TTS de mayor escala, este pierde en naturalidad y expresividad, pero gana en tamaño, licencia permisiva y facilidad de despliegue local.

## Limitaciones y advertencias

- Solo soporta inglés británico (en-GB); no es multilingüe.
- Requiere espeak-ng instalado para la fonemización; con el port espyak algunos fonemas difieren y pueden producir palabras mal pronunciadas.
- Es un modelo TTS puro: no razona, no genera código, no soporta tool calling ni agentes.
- Riesgo de pronunciación incorrecta en palabras fuera de vocabulario, siglas, nombres propios o texto no normalizado correctamente por scriptconv.
- La calidad "medium" de Piper implica menor naturalidad que variantes de mayor tamaño; no se han publicado métricas objetivas (MOS, WER) en la información disponible.
- No se han publicado datos sobre sesgos del corpus VCTK ni sobre cobertura de acentos dentro del inglés británico.
- Licencia MIT declarada por el upstream en la model card de rhasspy/piper-voices; conviene verificar los términos del corpus VCTK para usos comerciales específicos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria sobre este empaquetado concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-vctk-medium-espeak
- Upstream (Rhasspy Piper voices, en_GB/vctk/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
