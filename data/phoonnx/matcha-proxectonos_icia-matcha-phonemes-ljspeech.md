# Phoonnx/matcha-proxectonos_icia-matcha-phonemes-ljspeech

## Resumen

Matcha-proxectonos_icia-matcha-phonemes-ljspeech es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx en Hugging Face. Se trata de una extracción de un único modelo del repositorio agregador `Phoonnx/phoonnx-matcha`, correspondiente a la carpeta `proxectonos__icia-matcha-phonemes-ljspeech`, y empaquetado para su uso con la librería phoonnx, que carga pesos en formato ONNX.

El modelo emplea la arquitectura Matcha, un esquema de TTS no autorregresivo basado en modelado por flujo (flow matching) condicionado por fonemas, que combina un modelo acústico con un vocoder neuronal para generar la forma de onda final. El nombre indica que la entrada es fonémica y que el corpus de entrenamiento está vinculado a LJSpeech, si bien la model card no aporta detalles sobre la composición exacta del dataset ni sobre el número de pasos de entrenamiento.

Su relevancia es limitada y muy específica: no es un modelo de propósito general ni un lanzamiento de referencia, sino un artefacto derivado pensado para integrarse en el ecosistema phoonnx. Resulta útil para quien necesite un modelo TTS en ONNX ejecutable en entornos ligeros, pero la información pública disponible es mínima y la licencia GPL-3.0 condiciona seriamente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha (TTS no autorregresivo con modelado por flujo), entrada fonémica, con vocoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; entrada por fonemas) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Matcha es una familia de modelos de síntesis de voz no autorregresivos que generan espectrogramas mediante modelado por flujo (flow matching), condicionados por una secuencia de fonemas, y que requieren un vocoder separado para convertir el espectrograma en audio. En este caso, el nombre del modelo indica entrada fonémica (`matcha-phonemes`) y un origen de datos vinculado a LJSpeech, aunque no se especifica el vocoder concreto empleado ni su configuración.

La model card no documenta el número de tokens o horas de audio de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino o alineamiento forzado. Tampoco se detallan innovaciones técnicas adicionales más allá de las propias de la arquitectura Matcha. Toda la información disponible se limita a la procedencia del artefacto (subcarpeta del repositorio `Phoonnx/phoonnx-matcha`) y a su identificador de voz en phoonnx: `proxectonos/icia-matcha-phonemes-ljspeech`.

## Capacidades

- Síntesis de voz a partir de texto con entrada fonémica, orientada a la generación de audio inteligible.
- Integración nativa con la librería phoonnx mediante el identificador de voz `proxectonos/icia-matcha-phonemes-ljspeech`.
- Ejecución en formato ONNX, lo que permite desplegarlo en runtimes de inferencia ligeros y multiplataforma.
- Generación no autorregresiva, lo que en arquitecturas Matcha se traduce en tiempos de inferencia reducidos frente a esquemas autoregresivos.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, tool calling, agentes ni procesamiento multilingüe.
- No se documenta soporte de streaming ni de marcas de tiempo a nivel de fonema o palabra.

## Casos de uso

- Síntesis de voz en aplicaciones de escritorio o embebidas: al distribuirse en ONNX, puede cargarse con phoonnx en entornos donde no hay GPU dedicada, generando audio a partir de texto en local.
- Lectura de textos largos en herramientas de accesibilidad: el modelo puede convertir documentos en audio para personas con discapacidad visual, siempre que se valide la calidad del idioma concreto.
- Generación de avisos y locuciones pregrabadas: útil para producir mensajes de voz estáticos en aplicaciones, kioscos o sistemas de megafonía, donde el coste de una voz comercial no está justificado.
- Prototipado de asistentes conversacionales: sirve como capa TTS en un pipeline de demostración, combinado con un modelo de lenguaje y un sistema de reconocimiento de voz.
- Investigación en TTS y evaluación de arquitecturas Matcha: al ser un artefacto aislado y pequeño (0,1 GB), facilita reproducir experimentos y comparar variantes dentro del ecosistema phoonnx.
- Pruebas de integración continua en proyectos de audio: su tamaño reducido permite incluirlo en tests automatizados que verifiquen la generación de audio sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que el modelo cabe holgadamente en memoria de cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1-2 GB de memoria libre debería ser suficiente, incluidas GTX 1050, RTX 2060, RTX 3060 o superiores.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del artefacto.
- Opciones de despliegue: phoonnx (librería nativa del modelo) y runtimes ONNX como ONNX Runtime; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para TTS.
- Latencia y throughput estimados: no disponibles; la arquitectura Matcha no autorregresiva suele ofrecer latencias bajas, pero no hay cifras publicadas para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| matcha-proxectonos_icia-matcha-phonemes-ljspeech | Matcha (flow matching) | Fonemas | GPL-3.0 | ONNX | Hugging Face (Phoonnx) |
| Piper (voces comunitarias) | VITS / variantes | Fonemas | MIT (mayoritariamente) | ONNX | Hugging Face, repositorios comunitarios |
| Coqui TTS (modelos VITS) | VITS / autorregresivo | Caracteres o fonemas | MPL-2.0 (según modelo) | PyTorch, ONNX | Hugging Face, Coqui |
| Kokoro | Estilo StyleTTS2 | Fonemas | Apache-2.0 | ONNX, PyTorch | Hugging Face |

La comparación es aproximada: no se dispone de datos de rendimiento del modelo evaluado, por lo que la tabla se limita a aspectos de licencia, formato y disponibilidad. La principal diferencia frente a alternativas como Piper o Kokoro es la licencia GPL-3.0, más restrictiva para uso comercial, y la ausencia de documentación pública sobre idioma y calidad.

## Limitaciones y advertencias

- La licencia GPL-3.0 impone obligaciones de copyleft: integrar el modelo en un producto propietario puede exigir liberar el código que lo acompaña, lo que limita su uso comercial cerrado.
- No se especifica el idioma ni la variedad lingüística soportada; el nombre sugiere gallego (proxectonos) pero no está confirmado en la model card.
- No hay información sobre sesgos de voz, calidad prosódica ni naturalidad del audio generado.
- Al ser un modelo TTS, puede producir pronunciaciones incorrectas en palabras fuera del vocabulario fonético de entrenamiento; no hay datos sobre su robustez ante neologismos, siglas o nombres propios.
- No se documenta el vocoder asociado ni su calidad, lo que dificulta evaluar la fidelidad del audio final.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- No se dispone de información sobre el proceso de entrenamiento, lo que impide auditar posibles problemas de datos o de alineamiento.
- La fecha de creación indicada (2026-11-14) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del artefacto antes de usarlo en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/matcha-proxectonos_icia-matcha-phonemes-ljspeech)
- [Repositorio agregador Phoonnx/phoonnx-matcha](https://huggingface.co/Phoonnx/phoonnx-matcha)
- [Librería phoonnx en GitHub](https://github.com/TigreGotico/phoonnx)
