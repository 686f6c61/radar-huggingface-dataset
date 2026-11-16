# Phoonnx/vits-is_is-ugla-medium-espeak

## Resumen

vits-is_is-ugla-medium-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en islandés (is-IS) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. La voz concreta se denomina "ugla" y corresponde a un checkpoint de tamano medio del repositorio piper-voices.

El modelo no es un LLM ni un sistema multimodal general: es un sintetizador neuronal extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador de audio en una sola red entrenada de forma adversarial. Su relevancia radica en que ofrece TTS de calidad razonable para un idioma de bajos recursos como el islandés, con licencia MIT y pesos en ONNX, lo que facilita su despliegue en CPU y en entornos embebidos sin depender de servicios en la nube.

El empaquetado de Phoonnx anade una capa de integración con la librería phoonnx y con el ecosistema OVOS, de modo que el modelo puede usarse como plugin de voz en asistentes locales. El repositorio ocupa unos 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto conversacional) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en ONNX (precision no especificada) |
| Idiomas soportados | islandés (is-IS) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Frecuencia de muestreo de salida | no disponible |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz extremo a extremo que integra en un único modelo un codificador de texto, un prior variacional condicionado por texto, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo. El entrenamiento combina pérdidas de reconstrucción espectral, pérdida adversarial y pérdida de alineamiento monotónico, lo que permite generar audio sin necesidad de un modelo acústico y un vocoder separados. El modelo empaquetado aquí corresponde al checkpoint "medium" de la voz ugla del proyecto Piper, desarrollado por Rhasspy.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el número de parámetros ni si se aplicaron técnicas de ajuste fino posteriores. La model card solo indica la procedencia upstream y que la entrada debe ser fonemas espeak-ng en IPA, lo que implica que el front-end textual (normalización, conversión a fonemas) se delega en la librería scriptconv y en espeak-ng. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en islandés (is-IS), con salida en formato WAV mediante la API de phoonnx.
- Conversión de texto a fonemas IPA mediante espeak-ng o el port espyak incluido en el extra `phoonnx[espeak]`.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz locales.
- Ejecución en CPU mediante ONNX Runtime, sin requerir GPU.
- Normalización y conversión de texto delegadas a scriptconv.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al islandés; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en islandés: el modelo se integra en OVOS como plugin TTS, permitiendo respuestas habladas en un asistente doméstico sin conexión a servicios externos, gracias a su formato ONNX y a la ejecución en CPU.
- Lectura de contenidos en islandés: artículos, noticias o documentación pueden convertirse a audio por lotes usando la API `synthesize_wav`, adecuada para generar ficheros WAV de forma programática.
- Accesibilidad para personas con discapacidad visual: la síntesis de texto a voz en islandés permite construir lectores de pantalla o aplicaciones de lectura que funcionen en local.
- Sistemas de anuncios automatizados: transporte público, aeropuertos o comercios pueden generar avisos hablados en islandés a partir de plantillas de texto, con latencia baja al ejecutarse en CPU.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten una voz islandesa para pruebas de usabilidad o demos pueden desplegar el modelo rápidamente con `pip install --pre phoonnx`.
- Investigación en TTS de bajos recursos: el modelo sirve como línea base para experimentos de síntesis en islandés, comparación de voces Piper o evaluación de front-ends fonémicos (espeak-ng frente a espyak).
- Generación de audiolibros o pódcasts en islandés: la síntesis por lotes de fragmentos de texto permite producir narraciones automatizadas, aunque la calidad y naturalidad no están documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo VITS de tamano medio empaquetado en un repositorio de 0,1 GB, es probable que quepa en memoria de CPU, pero no se confirma.
- GPU recomendadas: no disponibles; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta soporte CUDA ni requisitos de VRAM.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y phoonnx.js para navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto | Notas |
|---|---|---|---|---|---|---|
| vits-is_is-ugla-medium-espeak | VITS | islandés (is-IS) | MIT | ONNX | no aplica | Voz Piper empaquetada para phoonnx |
| Otras voces Piper islandesas (p. ej. otras voces de piper-voices/is) | VITS | islandés | MIT (según upstream) | ONNX | no aplica | No se dispone de datos comparativos de calidad |
| Modelos TTS multilingües tipo MMS-TTS | VITS / otros | múltiples | varía | varía | no aplica | No se dispone de comparación directa documentada |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo solo sintetiza islandés; no admite otros idiomas ni cambio de voz.
- La entrada debe ser texto normalizado y fonemizado con espeak-ng; si se usa espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No se documentan sesgos concretos, pero al ser una voz única y un dataset no descrito, pueden aparecer sesgos de pronunciación o prosodia.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de artefactos acústicos o pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento.
- No se especifican límites de longitud de texto por llamada; la síntesis de textos largos requerirá fragmentación manual.
- La licencia MIT se hereda del upstream, pero conviene verificar los términos de las voces Piper originales antes de uso comercial.
- El modelo no ha sido evaluado en benchmarks publicados, por lo que su calidad objetiva no está cuantificada.
- El repositorio no registra descargas ni interacciones, lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-is_is-ugla-medium-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/is/is_IS/ugla/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
