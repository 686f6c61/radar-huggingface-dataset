# Phoonnx/vits-vi_vn-vais1000-low-espeak

## Resumen

vits-vi_vn-vais1000-low-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su conjunto de voces Mimic3 y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo convierte texto en vietnamita (`vi-VN`) a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su variante "low" indica una configuración de menor calidad o tamaño dentro de la familia de voces Mimic3, orientada a entornos con recursos limitados.

El modelo resuelve el problema de la síntesis de voz offline en vietnamita dentro del ecosistema OVOS (Open Voice OS), permitiendo integrar TTS en asistentes de voz y aplicaciones locales sin depender de servicios en la nube. Al estar distribuido como ONNX y con un tamaño de repositorio de 0,1 GB, está pensado para ejecutarse en CPU y dispositivos de gama baja, lo que lo hace adecuado para sistemas embebidos y despliegues de borde.

Su relevancia actual radica en su integración con la cadena de herramientas de Phoonnx (`scriptconv` para normalización y fonemización, `phoonnx.js` para ejecución en navegador) y en su licencia CC-BY-SA-4.0, que permite uso comercial con atribución y compartir igual. No obstante, se trata de un modelo de nicho con cero descargas y sin benchmarks publicados, por lo que su evaluación debe basarse en pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con encoder de texto, decoder y discriminador adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; variante "low") |
| Idiomas soportados | vietnamita (`vi-VN`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (librería `phoonnx`) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. El modelo original fue entrenado por Mycroft AI para el conjunto de voces Mimic3, concretamente la voz `vi_VN/vais1000_low` del repositorio `mimic3-voices`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (aunque el nombre "vais1000" sugiere el corpus VAIS de vietnamita) ni sobre el uso de RLHF o DPO, que no son habituales en modelos TTS de esta familia.

La innovación técnica destacable en este empaquetado es la conversión a ONNX para inferencia multiplataforma y la integración con `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA mediante `EspeakPhonemizer`. El modelo espera fonemas de espeak-ng, y el autor advierte que el uso del port `espyak` puede producir pronunciaciones incorrectas en algunas palabras. La variante "low" implica una configuración reducida, probablemente con menor resolución de muestreo o menor capacidad del decoder, aunque no se especifican los detalles.

## Capacidades

- Síntesis de voz a partir de texto en vietnamita (`vi-VN`), generando audio WAV.
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite control fonético preciso.
- Ejecución offline mediante ONNX, sin dependencia de servicios en la nube.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` con entrada espeak o unicode.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- Capacidad multilingüe limitada exclusivamente al vietnamita.
- No dispone de modo "thinking", visión ni audio de entrada.

## Casos de uso

- Asistentes de voz offline en vietnamita: el modelo puede integrarse en OVOS para responder verbalmente a comandos de usuario sin conexión, gracias a su formato ONNX y su bajo tamaño (0,1 GB), adecuado para dispositivos de borde.
- Lectura de textos en aplicaciones de accesibilidad: se puede usar para convertir artículos o notificaciones a audio en vietnamita, con control fonético mediante espeak-ng para mejorar la pronunciación de términos técnicos.
- Sistemas de anuncios automatizados en comercios o transporte: generación de mensajes pregrabados o dinámicos en vietnamita para altavoces locales, con latencia baja al ejecutarse en CPU.
- Prototipado de interfaces de voz en investigación: permite experimentar con TTS vietnamita sin coste de API, usando la librería `phoonnx` y el corpus VAIS como referencia.
- Integración en aplicaciones web mediante `phoonnx.js`: síntesis de voz en el navegador para cursos de idiomas o tutoriales interactivos en vietnamita, sin enviar texto a servidores externos.
- Generación de audiolibros o pódcasts de bajo coste: el modelo puede narrar textos largos por lotes, aunque la variante "low" limita la calidad frente a variantes "high" o "medium".
- Pruebas de pipelines TTS en CI/CD: al ser un modelo ONNX pequeño, se puede incluir en tests automatizados para verificar la integración de `scriptconv` y la fonemización con espeak-ng.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que quepa en memoria RAM de sistemas básicos, pero no se especifica.
- GPU recomendadas: no disponible; el modelo está diseñado para ejecución en CPU mediante ONNX Runtime.
- ¿Cabe en consumer GPU? Sí, por su tamaño reducido (0,1 GB), aunque no se detallan requisitos mínimos.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-vi_vn-vais1000-low-espeak | no disponible | no aplica | sin benchmarks | CC-BY-SA-4.0 | Hugging Face (Phoonnx) |
| Otras voces Mimic3 vi_VN (p. ej. vais1000_high) | no disponible | no aplica | sin benchmarks | CC-BY-SA-4.0 | GitHub MycroftAI/mimic3-voices |
| Modelos TTS vietnamitas comerciales (p. ej. Viettel, Zalo) | no disponible | no aplica | no disponible | propietaria | APIs comerciales |
| VITS multilingüe (p. ej. MMS-TTS de Meta) | no disponible | no aplica | sin benchmarks en la informacion | CC-BY-NC-4.0 (según variante) | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con el corpus VAIS, puede reflejar sesgos de pronunciación o vocabulario de dicho corpus.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero puede generar pronunciaciones incorrectas si los fonemas de espeak-ng no coinciden con los esperados, especialmente con el port `espyak`.
- Limitaciones de contexto o idioma: solo vietnamita (`vi-VN`); no soporta otros idiomas ni cambios de voz.
- Restricciones de licencia: CC-BY-SA-4.0 permite uso comercial con atribución y obliga a compartir igual las obras derivadas; es necesario revisar la compatibilidad con el producto.
- Caveat para producción: la variante "low" ofrece menor calidad de audio; para aplicaciones comerciales puede ser preferible una variante "high" o "medium". Además, el modelo tiene cero descargas y no ha sido validado por la comunidad.
- Dependencia de espeak-ng: sin él, la fonemización puede fallar o ser incorrecta; se recomienda instalar `espeak-ng` del sistema en lugar del port `espyak`.

## Enlaces

- [Hugging Face: Phoonnx/vits-vi_vn-vais1000-low-espeak](https://huggingface.co/Phoonnx/vits-vi_vn-vais1000-low-espeak)
- [Repositorio upstream: MycroftAI/mimic3-voices/voices/vi_VN/vais1000_low](https://github.com/MycroftAI/mimic3-voices/tree/master/voices/vi_VN/vais1000_low)
- [Librería phoonnx](https://github.com/TigreGotico/phoonnx)
- [Librería scriptconv](https://github.com/TigreGotico/scriptconv)
- [phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo de phoonnx.js](https://tigregotico.pt/demo)
- [Colección VITS en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
