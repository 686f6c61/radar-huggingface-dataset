# Phoonnx/vits-lb_lu-femalelod

## Resumen

`vits-lb_lu-femalelod` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por mbarnig y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo está especializado en luxemburgués (código ISO `lb`, variante `lb-LU`) con una voz femenina identificada como `femaleLOD`, y procede del repositorio upstream `mbarnig/lb_rhasspy_piper_tts`, orientado al ecosistema Rhasspy/Piper.

La relevancia de este modelo es acotada pero clara: cubre una lengua de bajos recursos (el luxemburgués, con unos 400 000 hablantes) dentro de un pipeline TTS ligero y desplegable en local. Al estar empaquetado en ONNX y distribuido vía phoonnx, se puede ejecutar en Python, en el asistente OVOS y en el navegador mediante phoonnx.js, sin depender de servicios en la nube.

El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que se trata de un modelo compacto (variante "medium" del pipeline Piper), adecuado para síntesis en tiempo real en hardware modesto. La información pública disponible es escasa: no se detallan parámetros, contexto ni datos de entrenamiento más allá de lo que declara la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | luxemburgués (`lb`, variante `lb-LU`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python, OVOS, phoonnx.js en navegador) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y de coincidencia temporal (monotonic alignment search). Este modelo concreto corresponde a la variante "medium" del pipeline Piper de Rhasspy, empaquetada para phoonnx, y acepta como entrada fonemas en IPA generados por espeak-ng a través de la librería `scriptconv`.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, el hablante de referencia ni si se aplicaron técnicas de fine-tuning adicionales. La model card solo indica la procedencia (repositorio `mbarnig/lb_rhasspy_piper_tts`, ruta `lb/lb_LU/femaleLOD/medium`) y que el autor original es mbarnig. La innovación técnica relevante aquí no está en el modelo en sí, sino en su empaquetado: conversión a ONNX y adaptación a la interfaz de phoonnx, que permite ejecución multiplataforma (Python, OVOS, navegador).

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en luxemburgués, con salida en formato WAV.
- Fonemización mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`), con entrada en alfabeto IPA.
- Voz femenina (`femaleLOD`) de la variante `lb-LU`.
- Integración con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de phoonnx.js (demo en tigregotico.pt/demo).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente un modelo TTS.
- No se declaran capacidades multilingües más allá del luxemburgués.

## Casos de uso

- Asistentes de voz locales en luxemburgués: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, el modelo permite dotar de voz a un asistente doméstico que responda en luxemburgués sin enviar audio a la nube, gracias a su tamaño reducido (~0,1 GB) y a la inferencia ONNX.
- Lectura de contenido web o documentos en luxemburgués: un pipeline que extraiga texto y lo pase por `voice.synthesize_wav` puede generar audiolibros o versiones habladas de artículos para hablantes de la lengua.
- Accesibilidad para personas con discapacidad visual: al ser un modelo pequeño y ejecutable en local, se puede desplegar en dispositivos de bajo consumo para leer interfaces o notificaciones en luxemburgués.
- Señalización y anuncios automatizados: sistemas de megafonía en transporte público o edificios públicos de Luxemburgo que necesiten anuncios dinámicos en luxemburgués, con generación de audio bajo demanda.
- Prototipado de aplicaciones de aprendizaje de idiomas: generar pronunciaciones de frases en luxemburgués para herramientas de estudio, usando la fonemización IPA de espeak-ng como paso intermedio verificable.
- Investigación en TTS para lenguas de bajos recursos: sirve como línea base reproducible para comparar con otros modelos VITS o para fine-tuning sobre el corpus upstream de Rhasspy/Piper.
- Integración en demos web: mediante phoonnx.js se puede ofrecer síntesis en el navegador sin backend, útil para demos interactivas o aplicaciones educativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB) y la naturaleza de los modelos VITS "medium" de Piper, se espera un consumo de memoria muy bajo (del orden de cientos de MB), aunque no se confirma en la documentación.
- GPU recomendadas: no disponible. Un modelo de este tamaño puede ejecutarse en CPU sin problemas; no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: previsiblemente sí (cualquier GPU moderna e incluso CPU), aunque no se especifica en la información disponible.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS ONNX).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-lb_lu-femalelod` | VITS | lb-LU | ~0,1 GB | CC-BY-4.0 | ONNX | Voz femenina, empaquetado para phoonnx |
| `mbarnig/lb_rhasspy_piper_tts` (upstream) | VITS (Piper) | lb-LU | no disponible | CC-BY-4.0 | Piper/ONNX | Repositorio origen con múltiples voces |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | variable | variable | ONNX | Misma librería de inferencia, distintos idiomas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística muy restringida: solo luxemburgués (`lb-LU`); no es utilizable para otros idiomas.
- Dependencia de espeak-ng: la calidad de la fonemización afecta directamente a la pronunciación; el port espyak incluido en el extra puede producir fonemas distintos y errores en algunas palabras, según advierte la propia model card.
- Riesgo de alucinación acústica: como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos ante texto fuera de dominio, siglas o números mal normalizados.
- Sin información sobre sesgos: no se documenta la procedencia del hablante ni posibles sesgos de género, acento o registro.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor (mbarnig) y mantener la atribución en obras derivadas.
- Documentación muy escasa: no hay datos de parámetros, entrenamiento ni evaluación, lo que dificulta estimar su calidad frente a alternativas.
- Advertencia de producción: al no haber benchmarks publicados, conviene evaluar la inteligibilidad y naturalidad con un conjunto de prueba propio antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-lb_lu-femalelod
- Repositorio upstream: https://huggingface.co/mbarnig/lb_rhasspy_piper_tts/tree/main/lb/lb_LU/femaleLOD/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
