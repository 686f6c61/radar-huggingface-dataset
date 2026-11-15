# Phoonnx/vits-hy_am-gor

## Resumen

`vits-hy_am-gor` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el usuario davit312 dentro del proyecto `davit312/piper-TTS-Armenian` (versión v3) y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo está especializado en armenio (`hy-AM`) y convierte texto en fonemas mediante espeak-ng antes de generar la forma de onda de audio.

El modelo resuelve el problema de la síntesis de voz en armenio, un idioma con escasa representación en el ecosistema TTS abierto. Al estar empaquetado en formato ONNX y distribuirse a través de la librería `phoonnx`, puede ejecutarse tanto en Python como en el ecosistema de asistentes de voz OVOS, lo que facilita su integración en aplicaciones de lectura en voz alta, asistentes domésticos o sistemas de accesibilidad para hablantes de armenio.

Con un tamaño de repositorio de 0,1 GB, se trata de un modelo ligero, adecuado para despliegue en entornos con recursos limitados. Su relevancia actual radica en que cubre una lengua de bajos recursos dentro de un ecosistema TTS estandarizado y de código abierto, aunque su licencia GPL-2.0 condiciona su uso en productos propietarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | armenio (`hy-AM`) |
| Licencia | GPL-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado de forma conjunta. VITS produce audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

La entrada de texto se procesa mediante espeak-ng: el texto se normaliza y se convierte a fonemas en alfabeto IPA, que constituyen la entrada real del modelo. El modelo fue entrenado originalmente por davit312 para el proyecto `piper-TTS-Armenian` (v3), aunque no se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o ajuste fino adicional. Phoonnx se limita a empaquetar los pesos en ONNX para su uso con su librería.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en armenio (`hy-AM`).
- Conversión de texto a fonemas IPA mediante espeak-ng (o el port espyak incluido en `phoonnx[espeak]`).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un modelo TTS.
- Monolingüe: únicamente armenio.

## Casos de uso

- Lectura en voz alta de contenido web o documentos para hablantes de armenio: el modelo convierte texto normalizado a fonemas y genera audio WAV, adecuado para aplicaciones de accesibilidad y lectores de pantalla.
- Asistentes de voz domésticos con OVOS: mediante el plugin `ovos-tts-plugin-phoonnx` y la configuración de `mycroft.conf`, se puede seleccionar la voz `piper_community/davit312/hy-AM_gor` para respuestas habladas en armenio.
- Audiolibros y narración automatizada en armenio: al ser un modelo ligero (0,1 GB), permite generar grandes volúmenes de audio sin requerir infraestructura GPU dedicada.
- Sistemas de anuncios públicos o transporte en Armenia: síntesis de mensajes dinámicos en armenio para megafonía o paneles con audio.
- Aplicaciones educativas de aprendizaje de armenio: generación de pronunciaciones de referencia a partir de texto, útil para ejercicios de idioma.
- Integración en aplicaciones web: mediante `phoonnx.js`, se puede ejecutar la síntesis en el navegador sin backend, útil para demos interactivas o herramientas de pronunciación.
- Prototipado de interfaces de voz en armenio: la API de phoonnx permite cargar la voz y sintetizar en pocas líneas de Python, lo que acelera la validación de conceptos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo de 0,1 GB en ONNX, es probable que quepa en CPU y en GPUs de gama baja, pero no se aportan cifras oficiales.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no se confirma en la documentación.
- Cabe en GPU consumer: sí, por el reducido tamaño del repositorio (0,1 GB), aunque no se especifica el consumo exacto.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y `phoonnx.js` en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato |
|---|---|---|---|---|---|
| vits-hy_am-gor (este modelo) | VITS | armenio (`hy-AM`) | 0,1 GB | GPL-2.0 | ONNX |
| davit312/piper-TTS-Armenian (v3) | VITS (upstream) | armenio | no disponible | GPL-2.0 | no disponible |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | variable | variable | ONNX |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta armenio (`hy-AM`); no es adecuado para otros idiomas.
- Dependencia de espeak-ng: la calidad de la fonemización afecta directamente a la pronunciación; el uso del port espyak puede producir errores en algunas palabras, según advierte la model card.
- Riesgo de alucinación en TTS: puede generar pronunciaciones incorrectas o artefactos en palabras fuera del dominio de entrenamiento, aunque no se documentan tasas concretas.
- Licencia GPL-2.0: impone restricciones copyleft; el uso en productos propietarios o servicios cerrados requiere revisión legal y, en general, la distribución del código derivado bajo la misma licencia.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con un corpus limitado de armenio, puede presentar sesgos de pronunciación o de prosodia regional.
- Sin datos de benchmarks: no hay métricas publicadas de calidad (MOS) ni de rendimiento, lo que dificulta evaluar su idoneidad frente a alternativas.
- Empaquetado por terceros: Phoonnx no es el autor original del modelo; los pesos provienen de davit312 y la responsabilidad sobre la calidad del entrenamiento recae en el autor upstream.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-hy_am-gor)
- [Upstream: davit312/piper-TTS-Armenian (v3)](https://huggingface.co/davit312/piper-TTS-Armenian/tree/main/v3)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo de phoonnx.js](https://tigregotico.pt/demo)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
