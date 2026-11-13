# codebucketsolutions/bolo-syspin-marathi-female

## Resumen

`bolo-syspin-marathi-female` es un modelo de síntesis de voz (text-to-speech) para maratí, convertido al formato ONNX para su uso con `bolo`, un servidor de voz ligero que funciona sin PyTorch sobre `sherpa-onnx`. Lo publica `codebucketsolutions` como artefacto de despliegue, pero el modelo original es `SYSPIN/vits_Marathi_Female`, desarrollado por el proyecto SYSPIN del SPIRE Lab (Indian Institute of Science, Bengaluru).

La arquitectura subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo condicional variational autoencoder con discriminador adversarial y alineamiento monotónico, orientado a síntesis end-to-end de voz femenina en maratí. El repositorio no incluye información sobre número de parámetros, longitud de contexto ni composición exacta del corpus de entrenamiento.

Su relevancia es práctica: ofrece una voz maratí femenina lista para inferencia en CPU/edge mediante ONNX Runtime, con licencia MIT en los pesos y sin dependencia de PyTorch, lo que simplifica el despliegue en servidores modestos. El repositorio ocupa aproximadamente 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui VITS, checkpoint convertido a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | maratí (`mr`) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 (corpus SYSPIN) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un VITS, es decir, un sistema TTS end-to-end que combina un encoder de texto, un prior normalizing flow, un decoder generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción, adversarial y de alineamiento monotónico. La conversión a ONNX se realizó con la herramienta `tools/voices/export_syspin.py` del proyecto `bolo`, partiendo del checkpoint Coqui VITS original de SYSPIN. No se ha reentrenado ni modificado los pesos: se trata exclusivamente de un cambio de formato.

Los datos de entrenamiento proceden del corpus TTS SYSPIN (IISc), publicado bajo CC-BY-4.0. El repositorio no detalla el número de horas, la composición del dataset ni si hubo etapas de ajuste fino adicionales. Tampoco se documentan innovaciones técnicas más allá de las propias de VITS ni detalles sobre el vocabulario o el front-end de normalización de texto en maratí.

## Capacidades

- Síntesis de voz (TTS) femenina en maratí a partir de texto de entrada.
- Inferencia sin PyTorch mediante ONNX Runtime y el stack `sherpa-onnx`.
- Integración con el servidor de voz `bolo` mediante el comando `bolo pull syspin-mr-female`.
- Ejecución en entornos sin GPU, al estar empaquetado como modelo ONNX ligero.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No soporta visión, audio de entrada ni modos de pensamiento.
- Capacidad multilingüe limitada al maratí; no se documentan otros idiomas.

## Casos de uso

- Locución automática de artículos y noticias en maratí: el modelo convierte texto plano en audio para portales de contenido o aplicaciones de lectura, sin necesidad de infraestructura GPU.
- Accesibilidad para personas con discapacidad visual: generación de audio bajo demanda en aplicaciones móviles o de escritorio que necesiten leer contenido en maratí con una voz femenina.
- Asistentes de voz para atención al ciudadano: integración en IVR o chatbots de voz en maratí, usando `bolo` como servidor TTS junto a un ASR y un motor de diálogo.
- Sistemas de navegación y avisos hablados: anuncios cortos en maratí para aplicaciones de transporte o señalética digital, donde la latencia de un modelo ONNX en CPU es suficiente.
- Generación de audiolibros y pódcast: síntesis por lotes de textos largos en maratí, dividiendo el texto en fragmentos y concatenando los audios resultantes.
- Pruebas de integración en pipelines de voz: al ser un artefacto ONNX con licencia MIT, sirve para validar arquitecturas de TTS en producción (sherpa-onnx, bolo) antes de sustituir la voz por una versión ajustada.
- Prototipado de productos de voz para el mercado maratí: permite lanzar demos funcionales sin depender de servicios TTS en la nube ni de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de TTS de tamaño reducido (repositorio de 0,1 GB), es viable la inferencia en CPU sin GPU dedicada.
- GPU recomendadas: no se documentan; cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría acelerar la inferencia, pero no hay datos publicados al respecto.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo con soporte ONNX Runtime; no se especifican requisitos mínimos.
- Opciones de despliegue: `bolo` (servidor de voz basado en sherpa-onnx) y, en general, cualquier runtime compatible con ONNX Runtime y sherpa-onnx.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bolo-syspin-marathi-female | VITS (ONNX) | maratí | ONNX | MIT (pesos) | Conversión de `SYSPIN/vits_Marathi_Female`; sin PyTorch |
| SYSPIN/vits_Marathi_Female | VITS (Coqui) | maratí | checkpoint Coqui | MIT (pesos) | Modelo original; requiere PyTorch/Coqui TTS |
| Otros modelos TTS de sherpa-onnx | VITS, Piper, etc. | varios | ONNX | variable | No se dispone de datos concretos de comparación en la información proporcionada |

No se dispone de datos de benchmarks ni de parámetros de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Solo soporta maratí; no es un modelo multilingüe.
- Es una conversión de formato, no un modelo reentrenado: hereda cualquier limitación del checkpoint original de SYSPIN.
- No se documentan sesgos específicos, pero al entrenarse con un corpus concreto (SYSPIN) puede presentar sesgos de dominio, estilo y prosodia propios de ese corpus.
- Riesgo de alucinación en el sentido de pronunciación incorrecta, entonación artificial o errores en palabras fuera del vocabulario o en texto no normalizado.
- No se especifican limitaciones de longitud de texto de entrada; conviene fragmentar textos largos.
- La licencia MIT aplica a los pesos; el corpus de entrenamiento es CC-BY-4.0, por lo que la atribución a SYSPIN/IISc debe mantenerse.
- El repositorio no registra descargas ni likes, y no hay evidencia de validación en producción por parte de terceros.
- No hay información sobre latencia, calidad perceptual (MOS) ni pruebas de robustez.

## Enlaces

- [Hugging Face: codebucketsolutions/bolo-syspin-marathi-female](https://huggingface.co/codebucketsolutions/bolo-syspin-marathi-female)
- [Modelo original: SYSPIN/vits_Marathi_Female](https://huggingface.co/SYSPIN/vits_Marathi_Female)
- [Repositorio bolo](https://github.com/cb-Sigma/bolo)
- [Licencia CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)
