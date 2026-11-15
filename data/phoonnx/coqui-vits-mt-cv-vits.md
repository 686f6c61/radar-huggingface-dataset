# Phoonnx/coqui-vits-mt-cv-vits

## Resumen

Phoonnx/coqui-vits-mt-cv-vits es un modelo de sintesis de voz (text-to-speech) derivado del repositorio agregador Phoonnx/phoonnx-coqui-vits, que empaqueta voces Coqui VITS en formato ONNX para su uso con la libreria phoonnx. Este modelo concreto corresponde a la carpeta `mt-cv-vits`, es decir, una voz entrenada para maltes (mt-MT) sobre el corpus Common Voice. El autor es Phoonnx, un proyecto de empaquetado y redistribucion de modelos TTS en ONNX.

La relevancia del modelo es limitada y muy especifica: no se trata de un modelo fundacional ni de un sistema TTS de proposito general, sino de un artefacto de inferencia optimizado para un runtime concreto (phoonnx) y un unico idioma. Su utilidad practica se reduce a la sintesis de voz en maltes dentro de aplicaciones que ya integren la libreria phoonnx o que consuman modelos ONNX de Coqui VITS.

El repositorio es muy pequeno (0,1 GB), no registra descargas ni likes en el momento de la consulta, y la model card es minima: se limita a indicar la procedencia, la licencia BSD-3-Clause y el identificador de voz `coqui/mt-cv-vits`. No hay informacion publicada sobre arquitectura detallada, tamano de parametros, contexto ni datos de entrenamiento mas alla de la referencia a Common Voice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coqui VITS (variational inference with adversarial learning for end-to-end TTS), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (formato ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | maltes (mt-MT) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en Coqui VITS, una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales. VITS genera waveform directamente a partir de texto sin necesidad de un vocoder separado, lo que simplifica el pipeline de inferencia. En este caso, el artefacto distribuido es la exportacion ONNX del modelo, no los pesos originales de entrenamiento.

Los datos de entrenamiento, segun la model card, corresponden al corpus Common Voice para maltes. No se especifican horas de audio, numero de hablantes, composicion del dataset, ni si hubo ajuste fino adicional o tecnicas de mejora como RLHF (no aplicable en TTS) o fine-tuning sobre voces concretas. Tampoco se detalla la configuracion de entrenamiento (learning rate, numero de pasos, tamano de batch) ni la innovacion tecnica mas alla de la propia arquitectura VITS y su empaquetado en ONNX para phoonnx.

## Capacidades

- Sintesis de voz (text-to-speech) en maltes a partir de texto de entrada.
- Generacion de waveform end-to-end sin vocoder externo, gracias a la arquitectura VITS.
- Inferencia via ONNX Runtime, lo que permite despliegue en CPU y GPU sin dependencias de PyTorch.
- Integracion con la libreria phoonnx mediante el identificador de voz `coqui/mt-cv-vits`.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente generativo de audio.
- No dispone de modo thinking, vision ni audio de entrada; solo texto a audio.
- Capacidad multilingue limitada a maltes; no se documentan otros idiomas.
- No se documentan capacidades de control de estilo, emocion, velocidad o prosodia mas alla de lo que permita el propio modelo VITS.

## Casos de uso

- Lectura de contenido en maltes para accesibilidad: el modelo puede convertir articulos, avisos o documentos en audio para usuarios con discapacidad visual o dificultades de lectura, aprovechando que es una voz nativa de maltes entrenada sobre Common Voice.
- Asistentes de voz locales para maltes: integrado en phoonnx, permite dotar a aplicaciones de escritorio o moviles de una voz sintetica sin depender de servicios en la nube, con inferencia ONNX en CPU.
- Generacion de avisos y anuncios automatizados: util para producir locuciones de forma programatica en aplicaciones de transporte, turismo o administracion publica dirigidas a hablantes de maltes.
- Prototipado de interfaces conversacionales: desarrolladores que construyan un chatbot de voz en maltes pueden usar este modelo como capa TTS durante la fase de pruebas sin coste de API.
- Investigacion en TTS de bajos recursos: al estar entrenado sobre Common Voice, sirve como linea base para comparar tecnicas de sintesis en idiomas con pocos datos, especialmente en el contexto de modelos ONNX ligeros.
- Pipelines de doblaje o subtitulado automatizado: para generar pistas de audio en maltes a partir de texto traducido, siempre que la calidad de la voz sintetica sea aceptable para el caso de uso.
- Educacion de idiomas: reproduccion de frases en maltes para materiales de aprendizaje, con la ventaja de que el modelo es pequeno (0,1 GB) y puede ejecutarse en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en menos de 1 GB de memoria en formato ONNX.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060, RTX 4090, A100, H100); el modelo no requiere GPU de gama alta.
- Cabe en GPU consumer: si, con amplio margen, en cualquier GPU consumer moderna e incluso en GPUs integradas.
- Despliegue en CPU: viable mediante ONNX Runtime, dado el reducido tamano del modelo.
- Opciones de despliegue: ONNX Runtime (principal), libreria phoonnx; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/coqui-vits-mt-cv-vits | Maltes (mt-MT) | Coqui VITS (ONNX) | ONNX | BSD-3-Clause | Hugging Face (0 descargas) |
| Coqui TTS VITS multilingue (original) | Multiples idiomas | VITS | PyTorch | MPL-2.0 (segun version) | Coqui / Hugging Face |
| Piper TTS (voces ONNX) | Multiples idiomas | VITS adaptado | ONNX | MIT / varias | GitHub / Hugging Face |
| MMS-TTS (Meta) | Multiples idiomas, incluido maltes | VITS | PyTorch | CC-BY-NC 4.0 | Hugging Face |

La comparativa es aproximada: no se dispone de datos de rendimiento para este modelo concreto, y las alternativas se incluyen por categoria (TTS ONNX ligero o TTS para maltes). La principal diferencia frente a Piper es el ecosistema de runtime (phoonnx frente a piper), y frente a MMS-TTS la licencia (BSD-3-Clause frente a CC-BY-NC, que restringe uso comercial).

## Limitaciones y advertencias

- Modelo de un solo idioma (maltes); no es util para otros idiomas sin reentrenamiento.
- No hay informacion sobre sesgos de generacion, calidad de voz, hablantes representados ni diversidad del corpus Common Voice para maltes.
- Riesgo de alucinacion no aplica en el sentido de texto, pero si puede haber artefactos de audio, pronunciacion incorrecta o inestabilidad en frases fuera del dominio de entrenamiento.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda verificar la procedencia de los datos de Common Voice y las condiciones de la licencia original de Coqui.
- La model card es minima; no hay garantias documentadas sobre calidad, latencia ni soporte.
- El repositorio no registra descargas ni likes, lo que sugiere poca validacion por parte de la comunidad.
- No se documentan limitaciones de contexto porque no es un modelo de lenguaje, pero la longitud de texto de entrada puede estar limitada por la implementacion de phoonnx.
- El identificador de voz `coqui/mt-cv-vits` debe usarse con la libreria phoonnx; fuera de ese runtime la integracion no esta garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-mt-cv-vits
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Coqui TTS (proyecto original): https://github.com/coqui-ai/TTS
- Common Voice (Mozilla): https://commonvoice.mozilla.org/
