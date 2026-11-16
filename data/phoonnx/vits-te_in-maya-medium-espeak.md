# Phoonnx/vits-te_in-maya-medium-espeak

## Resumen

`vits-te_in-maya-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en telugu (variante `te-IN`) en audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su origen es el conjunto de voces `rhasspy/piper-voices`, concretamente la voz `maya` de calidad media para telugu de India.

El modelo resuelve un problema acotado pero relevante: ofrecer síntesis de voz ligera, ejecutable en CPU mediante ONNX Runtime, para una lengua con relativamente pocos recursos TTS de calidad. Al estar empaquetado como artefacto ONNX de aproximadamente 0,1 GB, está pensado para despliegues en dispositivos de bajos recursos, asistentes domésticos (integración con OVOS/Mycroft) y pipelines que necesitan generar audio sin depender de servicios en la nube.

La relevancia actual del modelo es limitada y muy específica: no es un modelo fundacional ni compite en calidad con sistemas neuronales grandes, sino que forma parte del ecosistema de voces Piper distribuidas para phoonnx. Es útil para quien necesite TTS offline en telugu con licencia MIT y una integración Python sencilla, no para aplicaciones que requieran voces expresivas o multilingües de alta fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | telugu (`te`, variante `te-IN`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. Este modelo concreto es la voz `maya` de calidad media (`medium`) del proyecto Piper de Rhasspy, reempaquetada por Phoonnx para su runtime ONNX. La entrada no es texto crudo, sino fonemas en alfabeto IPA generados por espeak-ng; el front-end de texto lo gestiona `scriptconv` mediante `EspeakPhonemizer`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineamiento o fine-tuning adicionales. La model card original no detalla el proceso de entrenamiento más allá de la procedencia (Piper). La innovación técnica relevante aquí no está en el modelo en sí, sino en su empaquetado: exportación a ONNX y compatibilidad con el ecosistema phoonnx (Python, OVOS y phoonnx.js en navegador).

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en telugu (`te-IN`).
- Fonemización mediante espeak-ng en alfabeto IPA como paso previo a la inferencia.
- Ejecución offline en CPU mediante ONNX Runtime, sin dependencia de servicios externos.
- Integración con asistentes de voz OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (según la documentación del ecosistema).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad monolingüe: únicamente telugu; no se documenta soporte multilingüe.

## Casos de uso

- Asistentes de voz domésticos en telugu: integración con OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz `piper/te_IN-maya-medium` en `mycroft.conf` para respuestas habladas offline en dispositivos de bajos recursos.
- Lectura de notificaciones y alertas en telugu: generación de audio para sistemas de aviso (domótica, accesibilidad) donde se requiere síntesis local sin enviar texto a la nube.
- Accesibilidad para hablantes de telugu: conversión de texto a voz en aplicaciones de lectura de pantalla o lectores de documentos, aprovechando que el modelo corre en CPU y no exige GPU.
- Generación de audiolibros o contenido educativo en telugu: síntesis por lotes de fragmentos de texto con `voice.synthesize_wav()` para producir ficheros WAV, adecuado por su licencia MIT y su tamaño reducido.
- Pruebas y prototipado de pipelines TTS: validación de front-ends de fonemización (espeak-ng, `scriptconv`) y de integración ONNX antes de escalar a voces de mayor calidad.
- Despliegue en navegador: uso con phoonnx.js para demos web de TTS en telugu sin backend, según la documentación del ecosistema.
- Sistemas embebidos y edge computing: al ocupar 0,1 GB y ejecutarse en ONNX Runtime, puede desplegarse en dispositivos con recursos limitados donde no cabe un modelo TTS mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo ONNX de 0,1 GB, la huella de memoria es muy reducida y cabe en CPU.
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecución en CPU mediante ONNX Runtime.
- ¿Cabe en GPU consumer? Sí, con holgura, aunque no es su escenario principal; cualquier GPU con unos pocos cientos de MB libres es suficiente.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS VITS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-te_in-maya-medium-espeak (este) | VITS | Telugu (`te-IN`) | no aplica | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces Piper `te_IN` (p. ej. variantes de rhasspy/piper-voices) | VITS | Telugu | no aplica | MIT (según upstream) | ONNX | Hugging Face (rhasspy/piper-voices) |
| Voces VITS de la colección Phoonnx para otros idiomas | VITS | Diversos | no aplica | MIT (según upstream) | ONNX | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza telugu (`te-IN`); no admite otros idiomas.
- Dependencia de espeak-ng para la fonemización; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la propia model card.
- Calidad `medium`: no es una voz de alta fidelidad ni expresiva; adecuada para aplicaciones funcionales, no para producción de audio premium.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento, nombres propios o extranjerismos.
- No se documentan sesgos específicos, pero al ser un modelo TTS entrenado con datos de voz, puede reflejar sesgos prosódicos o de acento del corpus original.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la licencia del upstream (`rhasspy/piper-voices`) y de las dependencias (espeak-ng, scriptconv) antes de desplegar en producción.
- Sin datos publicados de benchmarks, latencia ni throughput; la evaluación de calidad debe hacerse empíricamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy pequeño, soporte comunitario limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-te_in-maya-medium-espeak
- Upstream (Piper voices, voz maya te_IN medium): https://huggingface.co/rhasspy/piper-voices/tree/main/te/te_IN/maya/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
