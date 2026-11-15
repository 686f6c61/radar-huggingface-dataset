# Phoonnx/vits-ca_es-ona

## Resumen

vits-ca_es-ona es un modelo de síntesis de voz (text-to-speech) en catalán desarrollado originalmente por el HiTZ Center y empaquetado por Phoonnx para su librería de inferencia ONNX. El modelo subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura end-to-end que convierte fonemas en forma de onda de audio de manera condicional y adversarial. La variante concreta corresponde a la voz "ona" del repositorio upstream HiTZ/TTS-ca_ona y está orientada exclusivamente al catalán (ca-ES).

El empaquetado de Phoonnx no modifica los pesos del modelo original: se limita a exportarlo a formato ONNX y a proporcionar una interfaz de uso a través de su librería `phoonnx`, que gestiona la carga del modelo, la fonemización con espeak-ng y la síntesis a WAV. Esto lo hace relevante para desarrolladores que necesitan integrar TTS catalán en aplicaciones Python o en el ecosistema OVOS sin depender de frameworks de deep learning pesados, ya que la inferencia se ejecuta sobre ONNX Runtime.

El repositorio ocupa aproximadamente 0,1 GB y tiene un uso muy bajo en Hugging Face (32 descargas, 0 likes en el momento de la consulta), lo que indica que es un artefacto de nicho orientado a integraciones concretas más que un modelo de referencia generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con aprendizaje adversarial) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible (pesos exportados a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | catalán (ca-ES) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamaño del repositorio | ~0,1 GB |
| Librería de inferencia | phoonnx (ONNX Runtime) |
| Modelo upstream | HiTZ/TTS-ca_ona |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de síntesis de voz end-to-end que combina un encoder de texto condicionado por alineamiento monotónico, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo entrenado de forma conjunta. VITS produce audio directamente desde fonemas sin necesidad de un vocoder separado, lo que simplifica el despliegue y reduce la latencia frente a pipelines en cascada.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron etapas de ajuste fino con RLHF o DPO (poco habituales en TTS). El modelo upstream pertenece al HiTZ Center y la model card del empaquetado no aporta detalles adicionales sobre el proceso de entrenamiento. La innovación destacable en este empaquetado es la exportación a ONNX y la integración con `scriptconv` para normalización de texto y fonemización mediante espeak-ng, lo que permite ejecutar el modelo sin PyTorch.

## Capacidades

- Síntesis de voz en catalán (ca-ES) a partir de texto plano, con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng (o el port espyak incluido como extra opcional).
- Normalización de texto previa a la fonemización a través de la librería `scriptconv`.
- Inferencia sobre ONNX Runtime, sin dependencia de PyTorch en tiempo de ejecución.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en catalán: el modelo puede integrarse en OVOS como motor TTS configurando `ovos-tts-plugin-phoonnx` con la voz `hitz/ca_ona-vits`, permitiendo respuestas habladas en catalán en asistentes domésticos o de escritorio.
- Lectura de contenido accesible: conversión de artículos, noticias o documentación en catalán a audio para lectores de pantalla o aplicaciones de accesibilidad, aprovechando la inferencia ONNX ligera.
- Sistemas de megafonía y avisos automatizados: generación de anuncios pregrabados o dinámicos en catalán para transporte público, aeropuertos o comercios, donde se requiere una voz consistente y un despliegue sin GPU.
- Integración en aplicaciones web: mediante phoonnx.js, el modelo puede ejecutarse en el navegador para sintetizar texto catalán sin enviar datos a un servidor, útil en aplicaciones de privacidad estricta.
- Prototipado de interfaces conversacionales: desarrollo de chatbots de voz en catalán en fases de prueba, donde la licencia Apache 2.0 y el tamaño reducido (~0,1 GB) facilitan la iteración rápida.
- Generación de audiolibros o pódcast automatizados: síntesis por lotes de textos largos en catalán, con la ventaja de que el modelo no requiere GPU dedicada y puede ejecutarse en CPU mediante ONNX Runtime.
- Localización de contenido multimedia: doblaje o voice-over de vídeos educativos o corporativos al catalán en pipelines automatizados, usando la salida WAV como pista de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB), el modelo es muy ligero y probablemente quepa en menos de 1 GB de memoria, pero no se confirma en la documentación.
- GPU recomendadas: no se especifican; al ejecutarse sobre ONNX Runtime, puede funcionar en CPU sin GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo moderna e incluso en CPU, aunque no se documenta oficialmente.
- Opciones de despliegue: librería `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y `phoonnx.js` para navegador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-ca_es-ona | VITS | Catalán (ca-ES) | Apache 2.0 | ONNX | Fonemas espeak-ng (IPA) | Hugging Face, phoonnx, OVOS |
| HiTZ/TTS-ca_ona (upstream) | VITS | Catalán (ca-ES) | Apache 2.0 | no disponible en la información | Fonemas | Hugging Face |
| Otros modelos VITS de la colección Phoonnx | VITS | Varios | Apache 2.0 (según modelo) | ONNX | Fonemas espeak-ng | Hugging Face, phoonnx |

No se dispone de información sobre benchmarks comparativos ni sobre otros modelos TTS catalanes específicos en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta catalán (ca-ES); no es multilingüe y no debe usarse con texto en otras lenguas.
- La calidad de síntesis depende de la fonemización con espeak-ng; si se usa el port espyak, algunos fonemas difieren y ciertas palabras pueden pronunciarse incorrectamente, según advierte el autor.
- Requiere instalar espeak-ng en el sistema (o el extra `phoonnx[espeak]`) para la fonemización; sin ello, el modelo no puede procesar texto.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con un corpus concreto, puede reflejar sesgos de pronunciación o prosodia del dataset original.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir artefactos acústicos o prosodia incorrecta en entradas atípicas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream HiTZ/TTS-ca_ona, ya que el empaquetado declara heredarla.
- El uso en producción requiere validar la calidad de la voz para el dominio concreto, dado que no hay benchmarks publicados ni métricas objetivas (MOS, WER) disponibles.
- El modelo tiene un uso muy bajo en Hugging Face (32 descargas), lo que puede implicar menor soporte comunitario y menor validación externa.

## Enlaces

- [Hugging Face: Phoonnx/vits-ca_es-ona](https://huggingface.co/Phoonnx/vits-ca_es-ona)
- [Modelo upstream: HiTZ/TTS-ca_ona](https://huggingface.co/HiTZ/TTS-ca_ona)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en navegador](https://tigregotico.pt/demo)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
