# Phoonnx/glowtts-de_de-eva_k

## Resumen

glowtts-de_de-eva_k es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente desarrollado por Rhasspy dentro del proyecto Larynx y empaquetado en formato ONNX por Phoonnx para su uso con la librería phoonnx. El modelo genera espectrogramas a partir de fonemas IPA en alemán (de-DE) y utiliza el vocoder hifigan-multi-vctk-small para convertir esos espectrogramas en audio.

El modelo está orientado exclusivamente a la síntesis de voz en alemán y forma parte de una colección de voces Glow-TTS empaquetadas para phoonnx, una librería de TTS en Python que también se integra con OVOS (Open Voice OS) mediante el plugin ovos-tts-plugin-phoonnx. Su tamaño de repositorio es de aproximadamente 0,1 GB, lo que lo hace ligero para despliegue en entornos con recursos limitados.

La relevancia de este modelo radica en su naturaleza ONNX y su integración con un ecosistema de asistentes de voz open source, aunque su adopción es muy reducida (33 descargas y 0 likes en el momento de la consulta) y su licencia no está claramente registrada, lo que limita su uso comercial sin verificación previa del upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (texto a espectrograma) + vocoder HiFi-GAN (hifigan-multi-vctk-small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | other (no se registra licencia concreta; verificar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en normalizing flows que mapea fonemas a espectrogramas mel de forma no autorregresiva, lo que permite una generación paralela y rápida. En este caso, la entrada de texto se procesa mediante el fonemizador gruut (a través de scriptconv) para convertir el texto alemán en fonemas IPA, que alimentan al modelo Glow-TTS. La salida es un espectrograma que posteriormente se convierte en audio mediante el vocoder HiFi-GAN hifigan-multi-vctk-small, descargado automáticamente junto con la voz por phoonnx.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino. El modelo proviene del release v1.0 de Larynx de Rhasspy, un proyecto de TTS open source orientado a asistentes de voz, pero la model card no detalla el proceso de entrenamiento más allá de la arquitectura y el upstream.

## Capacidades

- Síntesis de voz en alemán (de-DE) a partir de texto.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut.
- Generación de espectrogramas mel con Glow-TTS y conversión a audio con HiFi-GAN.
- Integración con la librería phoonnx en Python.
- Integración con OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada exclusivamente al alemán.

## Casos de uso

- Asistentes de voz en alemán: el modelo puede integrarse en OVOS o en aplicaciones Python mediante phoonnx para sintetizar respuestas habladas en alemán, aprovechando su formato ONNX ligero y su integración con el plugin de TTS.
- Sistemas de lectura de texto en alemán: puede convertir artículos, notificaciones o documentos en audio para aplicaciones de accesibilidad, dado que acepta texto plano y lo fonemiza con gruut.
- Automatización de anuncios y avisos: en entornos de domótica o industria, el modelo puede generar avisos hablados en alemán de forma local y sin dependencia de servicios en la nube, gracias a su despliegue ONNX.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten una voz alemana rápida para pruebas de concepto pueden usar phoonnx y este modelo sin entrenar un TTS propio.
- Generación de audio para contenido educativo: lectura de materiales en alemán para cursos o tutoriales, con la ventaja de ser un modelo ligero (0,1 GB) que cabe en entornos modestos.
- Integración en pipelines de CI/CD para pruebas de regresión de audio: al ser ONNX y determinista en su arquitectura, puede usarse para verificar que la síntesis de voz produce salidas esperadas en pruebas automatizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en CPU y en GPUs de gama baja.
- GPU recomendadas: no disponible; por su tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no se especifica.
- Cabe en consumer GPU: sí, por el tamaño reducido del repositorio (0,1 GB), aunque no se detallan requisitos exactos.
- Opciones de despliegue: phoonnx (Python), OVOS mediante ovos-tts-plugin-phoonnx; el formato ONNX permite su ejecución con ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-de_de-eva_k | Glow-TTS + HiFi-GAN | de-DE | ONNX | other (no registrada) | Hugging Face (33 descargas) |
| Otras voces Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | varios | ONNX | other | Colección Glow-TTS en Hugging Face |
| Modelos TTS de Rhasspy Larynx | Glow-TTS | varios | tar.gz / varios | según release | GitHub rhasspy/larynx |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan sesgos en la model card.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero la síntesis puede producir artefactos o pronunciaciones incorrectas en textos fuera del dominio de entrenamiento.
- Limitaciones de contexto o idioma: el modelo solo soporta alemán (de-DE); no es multilingüe.
- Restricciones de licencia: la licencia figura como "other" y no se registra una licencia concreta; es imprescindible verificar el release upstream de Rhasspy antes de cualquier uso comercial.
- Caveat para producción: la adopción es muy baja (33 descargas, 0 likes) y no hay benchmarks publicados; se recomienda validar la calidad de síntesis en el dominio de uso antes de desplegarlo.
- Dependencia de gruut y scriptconv para la fonemización, lo que añade dependencias externas al pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-de_de-eva_k
- Upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_eva_k-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
