# Phoonnx/vits-fi_fi-harri_tapani_ylilammi-low

## Resumen

vits-fi_fi-harri_tapani_ylilammi-low es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic 3 y empaquetado por Phoonnx en formato ONNX para su librería de TTS homónima. El modelo sintetiza voz en finlandés (variante fi-FI) a partir de fonemas generados por espeak-ng en alfabeto IPA, y está pensado para integrarse en asistentes de voz y aplicaciones de lectura en tiempo real.

El repositorio ocupa apenas 0,1 GB, lo que refleja la variante "low" de calidad del modelo original: una configuración compacta orientada a despliegue ligero, no a máxima fidelidad acústica. La licencia es CC-BY-SA-4.0, heredada del repositorio upstream de Mycroft AI, y el modelo se distribuye como pesos ONNX listos para inferencia con la librería phoonnx, sin necesidad de conversión adicional.

Su relevancia actual reside en el ecosistema de código abierto para TTS en lenguas minoritarias: el finlandés cuenta con pocos recursos de síntesis de voz abiertos, y este modelo cubre una voz concreta (la de Harri Tapani Ylilammi) dentro de la colección de voces Mimic 3. La integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx` lo hace directamente utilizable en asistentes de voz autoalojados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | finlandes (fi-FI) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y de confrontación. El modelo genera formas de onda directamente desde fonemas, sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del corpus finlandés utilizado ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables habitualmente a TTS). El modelo procede del repositorio MycroftAI/mimic3-voices, donde cada voz se entrena sobre grabaciones del hablante correspondiente; en este caso, la voz de Harri Tapani Ylilammi en su variante "low", que prioriza tamaño reducido y velocidad de inferencia sobre calidad acústica máxima. La entrada de texto se procesa mediante fonemización con espeak-ng en alfabeto IPA antes de alimentar el modelo.

## Capacidades

- Síntesis de voz en finlandés (fi-FI) a partir de texto escrito.
- Entrada basada en fonemas espeak en alfabeto IPA, lo que permite control fino de la pronunciación si se generan los fonemas manualmente.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con asistentes de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js, con entrada por espeak o Unicode.
- No dispone de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo de TTS.
- Monolingüe: no sintetiza otros idiomas además del finlandés.

## Casos de uso

- Asistentes de voz autoalojados en finlandés: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, el modelo permite que un asistente doméstico responda en finlandés con una voz concreta, configurando el módulo TTS en `mycroft.conf` y seleccionando la voz `mimic3/fi_FI/harri-tapani-ylilammi_low`.
- Lectura de textos en finlandés para accesibilidad: aplicaciones de lectura de pantalla o de documentos pueden convertir texto finlandés en audio WAV con la API de phoonnx, sin depender de servicios en la nube.
- Síntesis en el navegador: mediante phoonnx.js, el modelo puede ejecutarse del lado del cliente para locuciones de interfaces web en finlandés, con la demo disponible en tigregotico.pt/demo.
- Generación de audiolibros o pódcast automatizados en finlandés: el modelo sintetiza frases de forma secuencial y el audio resultante puede concatenarse para producir contenido largo, dado el tamaño reducido del repositorio (0,1 GB) que facilita el despliegue en servidores modestos.
- Pruebas de pronunciación y fonética finlandesa: al aceptar fonemas IPA de espeak, investigadores pueden alimentar transcripciones fonéticas controladas para estudiar la salida del modelo o comparar variantes de pronunciación.
- Prototipado de interfaces de voz en finlandés: desarrolladores que construyen IVR o chatbots de voz pueden usar el modelo como componente TTS local durante el desarrollo, sin coste de API y con licencia CC-BY-SA-4.0 que permite redistribución bajo la misma licencia.
- Investigación comparativa sobre TTS de bajo coste: la variante "low" sirve como referencia para medir compromisos entre tamaño, latencia y calidad frente a otras voces de la colección VITS de Phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 0,1 GB, lo que sugiere un modelo compacto que probablemente cabe en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repositorio es plausible que funcione en GPU de consumo, pero no hay dato explícito.
- Opciones de despliegue: librería Python phoonnx (`pip install --pre phoonnx`), plugin OVOS `ovos-tts-plugin-phoonnx`, y phoonnx.js en navegador. Requiere espeak-ng instalado (o la extra `phoonnx[espeak]` con el port espyak) para la fonemización.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| vits-fi_fi-harri_tapani_ylilammi-low (este modelo) | VITS | fi-FI | 0,1 GB (repo) | CC-BY-SA-4.0 | ONNX |
| Otras voces de la colección VITS de Phoonnx | VITS | varios | no disponible | según voz | ONNX |
| Otras voces de MycroftAI/mimic3-voices | VITS | varios | no disponible | según voz | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Monolingüe: solo sintetiza finlandés (fi-FI); no admite otros idiomas.
- Variante "low": está optimizada para tamaño y velocidad, no para máxima calidad acústica; la fidelidad de la voz será inferior a variantes de mayor calidad del mismo hablante.
- Dependencia de espeak-ng: la fonemización correcta requiere espeak-ng; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la model card.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero impone compartir las obras derivadas bajo la misma licencia y atribuir adecuadamente; conviene revisar las obligaciones antes de integrarlo en productos propietarios.
- Sesgos: no se documentan sesgos específicos en la información disponible; al tratarse de una única voz de un hablante concreto, la diversidad de voces es nula.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la síntesis puede producir artefactos acústicos o pronunciaciones incorrectas ante texto mal normalizado o fonemas atípicos.
- Sin datos de benchmarks ni de latencia: no es posible garantizar objetivos de rendimiento en producción sin mediciones propias.
- Repositorio con pocas descargas (30) y ningún like: ecosistema pequeño y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fi_fi-harri_tapani_ylilammi-low
- Repositorio upstream de la voz: https://github.com/MycroftAI/mimic3-voices/tree/master/voices/fi_FI/harri-tapani-ylilammi_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
