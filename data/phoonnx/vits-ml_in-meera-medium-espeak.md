# Phoonnx/vits-ml_in-meera-medium-espeak

## Resumen

`vits-ml_in-meera-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo sintetiza voz en malabar (ml-IN), la variante de India, a partir de fonemas espeak en alfabeto IPA. Su origen es el checkpoint `rhasspy/piper-voices/ml/ml_IN/meera/medium`, por lo que hereda el diseño y el entrenamiento del ecosistema Piper, orientado a TTS ligero y desplegable en entornos con recursos limitados.

La relevancia de este empaquetado es práctica: convierte un checkpoint Piper en un artefacto consumible directamente desde `phoonnx`, una librería Python que también se integra en OVOS (el stack de asistentes de voz open source). Esto permite usar la voz `piper/ml_IN-meera-medium` en pipelines de TTS sin depender del binario original de Piper, tanto en servidor como en navegador mediante `phoonnx.js`.

El modelo es de tamano reducido (repo de 0,1 GB), lo que refleja un checkpoint "medium" de Piper pensado para inferencia rápida. La licencia es MIT y el idioma soportado es únicamente malabar. No se dispone de datos públicos sobre número de parámetros, contexto ni benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantización | no disponible (pesos ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | malabar (ml-IN) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para la librería phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y de confrontación. El modelo original de Piper se entrena sobre corpus de voz con alineamientos fonéticos y produce audio de forma no autoregresiva, lo que favorece la latencia baja. En este empaquetado, la entrada de texto se convierte a fonemas espeak (IPA) mediante `EspeakPhonemizer` de `scriptconv`, y el modelo consume directamente esa secuencia fonémica.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o ajuste fino adicional. El checkpoint procede del proyecto Piper (Rhasspy), que entrena sus voces con datos de voz públicos y un pipeline propio; el empaquetado de Phoonnx no modifica el entrenamiento, solo el formato de distribución y la interfaz de inferencia.

## Capacidades

- Síntesis de voz a partir de texto en malabar (ml-IN), con salida en audio WAV.
- Entrada fonémica basada en espeak-ng (alfabeto IPA), lo que permite control fino de la pronunciación si se generan fonemas manualmente.
- Normalización de texto y conversión a fonemas mediante `scriptconv` antes de la síntesis.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` (VITS con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz en malabar: integración en OVOS configurando `ovos-tts-plugin-phoonnx` con la voz `piper/ml_IN-meera-medium`, para respuestas habladas en un asistente doméstico open source.
- Lectura de contenido en aplicaciones móviles o web: síntesis de artículos, notificaciones o mensajes en malabar con un modelo ligero (0,1 GB) que puede servirse desde un backend Python.
- Accesibilidad: conversión de texto a voz para usuarios con discapacidad visual que necesiten contenido en malabar, con latencia baja gracias a la inferencia no autoregresiva de VITS.
- Generación de audiolibros o podcasts automatizados: procesamiento por lotes de texto largo en malabar, troceando en frases y sintetizando cada una con `voice.synthesize_wav`.
- Sistemas de megafonía o anuncios en comercios: síntesis de avisos pregrabados o dinámicos en malabar con un modelo pequeño que cabe en dispositivos de bajo consumo.
- Pruebas de pronunciación y prototipado de voces: uso de la entrada fonémica espeak para experimentar con transcripciones IPA y evaluar la calidad de la voz antes de integrarla en producción.
- Demo web interactiva: despliegue con `phoonnx.js` en el navegador para probar la voz sin backend, útil para validación rápida con hablantes nativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repo ocupa 0,1 GB, por lo que la inferencia ONNX debería caber en GPUs consumer de gama baja e incluso ejecutarse en CPU.
- GPU recomendadas: no disponible; por tamano, cualquier GPU con al menos 1-2 GB de memoria libre debería ser suficiente, aunque no se confirma en la documentación.
- Cabe en GPU consumer: probablemente sí (RTX 3060, GTX 1650 o inferiores), aunque no hay datos oficiales.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| vits-ml_in-meera-medium-espeak (este) | VITS | ml-IN | 0,1 GB (repo) | MIT | ONNX |
| rhasspy/piper-voices ml_IN/meera/medium | VITS | ml-IN | no disponible | MIT | Piper (checkpoint original) |
| Otras voces Piper empaquetadas por Phoonnx | VITS | varios | variable | MIT | ONNX |

La comparación directa con alternativas de otros proveedores (por ejemplo, modelos TTS multilingües de mayor tamano) no está disponible en la información proporcionada. El competidor más directo es el propio checkpoint original de Piper, del que este empaquetado deriva y con el que comparte arquitectura y calidad de voz.

## Limitaciones y advertencias

- Solo soporta malabar (ml-IN); no es multilingüe.
- La calidad de pronunciación depende de espeak-ng: si se usa el port `espyak`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la model card.
- Requiere instalar espeak-ng o el extra `phoonnx[espeak]`; sin ello, el front-end de texto no funciona correctamente.
- Riesgo de alucinación acústica: como todo modelo TTS, puede generar prosodia o pronunciaciones incorrectas en textos con nombres propios, siglas o palabras fuera del dominio de entrenamiento.
- No hay información pública sobre sesgos del dataset de entrenamiento ni sobre la cobertura de acentos o registros del malabar.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la licencia del checkpoint original de Piper y de los datos de entrenamiento subyacentes.
- Modelo de 0 descargas y 0 likes en Hugging Face en el momento de la consulta: poca validación comunitaria.
- No apto para tareas de texto, razonamiento, código o visión; su único pipeline es text-to-speech.

## Enlaces

- [Hugging Face: Phoonnx/vits-ml_in-meera-medium-espeak](https://huggingface.co/Phoonnx/vits-ml_in-meera-medium-espeak)
- [Checkpoint original: rhasspy/piper-voices/ml/ml_IN/meera/medium](https://huggingface.co/rhasspy/piper-voices/tree/main/ml/ml_IN/meera/medium)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en navegador](https://tigregotico.pt/demo)
