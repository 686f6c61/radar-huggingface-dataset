# Phoonnx/vits-en_us-lessac-low-espeak

## Resumen

`vits-en_us-lessac-low-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX homónima. El modelo original procede de Rhasspy, concretamente del conjunto de voces Piper (`rhasspy/piper-voices`, variante `en_US/lessac/low`), y Phoonnx lo redistribuye en formato ONNX listo para su uso con su stack de inferencia en Python y en el asistente OVOS.

El modelo resuelve la conversión de texto a audio en inglés estadounidense a partir de fonemas generados por espeak-ng en alfabeto IPA. Se trata de una voz de calidad "low" (modelo compacto, repo de 0,1 GB), pensada para entornos con recursos limitados, asistentes de voz embebidos y aplicaciones donde prima la latencia y el tamaño reducido frente a la fidelidad máxima de síntesis.

Su relevancia actual radica en su licencia MIT, su formato ONNX portable y su integración con el ecosistema phoonnx/OVOS, lo que facilita el despliegue local sin dependencias de servicios en la nube. No obstante, es un modelo de nicho: no es un LLM, no razona ni genera texto, y su ámbito se limita estrictamente a la síntesis de voz en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech, extremo a extremo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye como modelo ONNX ya optimizado, variante "low") |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. El modelo original fue entrenado por Rhasspy como parte del proyecto Piper, orientado a TTS local de bajo coste.

La información disponible no detalla el número de tokens, la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a TTS). La variante "low" indica un modelo de menor tamaño dentro de la familia Piper, optimizado para velocidad y footprint reducido. La entrada de texto no es texto plano directo: el modelo consume fonemas en alfabeto IPA generados por espeak-ng, lo que constituye una innovación práctica de desacoplamiento entre normalización textual y síntesis acústica.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto.
- Conversión de texto a fonemas IPA mediante espeak-ng (a través de `scriptconv` y su `EspeakPhonemizer`).
- Generación de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de visión o audio de entrada.
- Capacidad multilingüe limitada: únicamente `en-US`.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS seleccionable en `mycroft.conf`, permitiendo respuestas habladas sin conexión a la nube gracias a su formato ONNX y su licencia MIT.
- Síntesis embebida en dispositivos de recursos limitados: al tratarse de la variante "low" (repo de 0,1 GB), es adecuado para Raspberry Pi y hardware similar donde un modelo TTS grande no cabría.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: la API `synthesize_wav` permite generar audio bajo demanda para mensajes cortos en inglés.
- Síntesis en el navegador: mediante phoonnx.js se puede generar voz en cliente sin backend, útil para demos interactivas y aplicaciones web accesibles.
- Generación de audiolibros o contenido narrado en inglés a pequeña escala: el modelo produce audio WAV a partir de texto, apropiado para prototipos y pipelines de narración automatizada.
- Pruebas y desarrollo de pipelines TTS: al ser un modelo pequeño y de licencia permisiva, sirve como baseline en experimentos de normalización textual, fonemización y evaluación de calidad de voz.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces de accesibilidad en entornos en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repo (0,1 GB) y la variante "low", se espera un consumo muy reducido, apto para CPU.
- GPU recomendadas: no disponible; el modelo está pensado para ejecución en CPU y entornos embebidos.
- Cabe en GPU consumer: previsiblemente sí, dado su tamaño reducido, aunque no se especifican modelos concretos.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS; requiere espeak-ng instalado (o el extra `phoonnx[espeak]`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño repo |
|---|---|---|---|---|---|
| vits-en_us-lessac-low-espeak (este) | VITS | en-US | MIT | ONNX | 0,1 GB |
| Otras voces Piper `en_US` (p. ej. variantes medium/high de rhasspy/piper-voices) | VITS | en-US | MIT | ONNX | mayor que "low" (no disponible el dato exacto) |
| Modelos TTS neuronales de mayor tamaño (p. ej. familias comerciales o de investigación) | variable | múltiple | variable | variable | no disponible |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; la principal diferencia frente a otras voces Piper es la variante de calidad "low" y el empaquetado específico para phoonnx.

## Limitaciones y advertencias

- Solo sintetiza inglés estadounidense (`en-US`); no soporta otros idiomas.
- Depende de espeak-ng para la fonemización; sin él, el extra `phoonnx[espeak]` usa espyak, cuyos fonemas difieren y pueden producir palabras mal pronunciadas.
- Es una voz de calidad "low": la fidelidad y naturalidad serán inferiores a variantes medium o high.
- No es un modelo de lenguaje: no razona, no genera texto ni admite instrucciones conversacionales.
- No se dispone de información sobre sesgos, tasas de alucinación (no aplica en el mismo sentido que en LLM) ni evaluación de calidad subjetiva (MOS).
- Licencia MIT permisiva para uso comercial, pero conviene verificar la procedencia upstream (rhasspy/piper-voices) y las condiciones de espeak-ng, que es GPL.
- El modelo fue creado y actualizado en noviembre de 2026 según los metadatos, con muy pocas descargas (22) y sin likes, lo que sugiere escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-lessac-low-espeak
- Upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/lessac/low
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
