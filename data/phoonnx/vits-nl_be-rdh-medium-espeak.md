# Phoonnx/vits-nl_be-rdh-medium-espeak

## Resumen

`vits-nl_be-rdh-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su uso con la librería ONNX `phoonnx`. El modelo convierte texto en neerlandés de Bélgica (`nl-BE`) a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia reside en que permite integrar TTS local, sin dependencias de servicios en la nube, en asistentes de voz y aplicaciones de accesibilidad.

El modelo se distribuye en formato ONNX dentro de un repositorio de aproximadamente 0,1 GB, lo que lo hace ligero y apto para despliegue en entornos con recursos limitados, incluidos dispositivos de borde. Forma parte de la colección de voces VITS empaquetadas por Phoonnx y se integra con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

La licencia MIT del modelo upstream facilita su uso comercial y su modificación, si bien la calidad de la síntesis depende del front-end fonemizador: con espeak-ng se obtiene el comportamiento previsto, mientras que con el port espyak pueden producirse errores de pronunciación en algunas palabras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | neerlandes de Belgica (`nl-BE`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema de síntesis neuronal de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. VITS genera waveforms directamente a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia.

El modelo procede del repositorio `rhasspy/piper-voices`, en la ruta `nl/nl_BE/rdh/medium`, dentro del proyecto Piper de Rhasspy. No se dispone en la información proporcionada de datos sobre el volumen de horas de audio, la composición del corpus de entrenamiento ni si se aplicaron técnicas de alineamiento forzado o ajuste fino adicional. El sufijo `medium` indica una variante de tamaño intermedio dentro de la familia de voces Piper, aunque no se especifican los parámetros exactos.

## Capacidades

- Síntesis de voz a partir de texto en neerlandés de Bélgica (`nl-BE`).
- Conversión de texto a fonemas IPA mediante espeak-ng, con normalización y conversión de script a cargo de `scriptconv`.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución local en formato ONNX, sin dependencia de servicios externos.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz para el neerlandés de Bélgica: el modelo puede integrarse en OVOS como módulo TTS para leer respuestas del asistente en tiempo real, gracias a su formato ONNX ligero y su ejecución local.
- Accesibilidad para personas con discapacidad visual: lectura de textos en `nl-BE` en aplicaciones de escritorio o móviles, sin enviar contenido a servidores externos.
- Sistemas de megafonía y anuncios automatizados: generación de avisos pregrabados o dinámicos en estaciones, comercios o transporte público en Flandes.
- Lectura de noticias y artículos: conversión de contenido web a audio para consumo pasivo, con la ventaja de que el procesamiento se realiza en el dispositivo.
- Integración en pipelines de CI/CD para pruebas de regresión de audio: al ser un modelo determinista y ligero, permite generar muestras de referencia en tests automatizados.
- Prototipado de interfaces conversacionales: desarrollo de demos y pruebas de concepto de asistentes de voz en neerlandés sin incurrir en costes de API.
- Educación y aprendizaje de idiomas: generación de pronunciaciones de ejemplo en `nl-BE` para materiales didácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que el modelo es apto para CPU y GPU de gama baja.
- GPU recomendadas: no se especifican; por su tamaño, cualquier GPU consumer con soporte ONNX Runtime debería ser suficiente.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de memoria, aunque no se confirma en la documentación.
- Opciones de despliegue: `phoonnx` (Python y OVOS), `ovos-tts-plugin-phoonnx`, y `phoonnx.js` para navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| `Phoonnx/vits-nl_be-rdh-medium-espeak` | VITS | `nl-BE` | ONNX | MIT | no aplica |
| Otras voces de `rhasspy/piper-voices` (misma ruta `nl/nl_BE/rdh/medium`) | VITS | `nl-BE` | ONNX | MIT | no aplica |
| Voces VITS de la colección Phoonnx para otros idiomas | VITS | varios | ONNX | MIT (segun upstream) | no aplica |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta neerlandés de Bélgica (`nl-BE`); no está entrenado para otros idiomas ni variantes dialectales.
- La calidad de pronunciación depende del fonemizador: con espyak en lugar de espeak-ng pueden producirse errores en algunas palabras.
- Requiere la instalación de espeak-ng o del extra `phoonnx[espeak]` para el front-end de fonemas.
- No se dispone de información sobre sesgos de género, acento o prosodia en el corpus de entrenamiento.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí puede haber artefactos acústicos o pronunciaciones incorrectas en texto no visto.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del modelo upstream en `rhasspy/piper-voices`.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica ausencia de validación comunitaria.
- No se especifican limitaciones de longitud de texto de entrada; textos muy largos pueden requerir segmentación manual.

## Enlaces

- [Hugging Face: Phoonnx/vits-nl_be-rdh-medium-espeak](https://huggingface.co/Phoonnx/vits-nl_be-rdh-medium-espeak)
- [Upstream: rhasspy/piper-voices/nl/nl_BE/rdh/medium](https://huggingface.co/rhasspy/piper-voices/tree/main/nl/nl_BE/rdh/medium)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo de phoonnx.js](https://tigregotico.pt/demo)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
