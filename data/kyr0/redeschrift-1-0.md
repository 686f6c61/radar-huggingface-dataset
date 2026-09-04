# kyr0/redeschrift-1.0

## Resumen

Redeschrift 1.0 es un modelo de transcripción de voz a texto (speech-to-text) desarrollado por kyr0 (Aron Homberg) dentro del proyecto "Redeschrift KI". Su objetivo principal es ofrecer un sistema de reconocimiento de voz eficiente, pequeño y totalmente local para el espacio lingüístico alemán, que también soporta varios idiomas europeos. El modelo está diseñado para ejecutarse en CPU sin necesidad de GPU, con un tamaño de aproximadamente 725 MB y un factor de tiempo real (RTF) de 0,06, lo que permite transcribir un segundo de audio en unos 60 milisegundos. Según el autor, la tasa de error de palabra (WER) en alto alemán es de alrededor del 3,6%, que se reduce al 3,3% cuando se combina con la aplicación Redeschrift y sus algoritmos de corrección.

El modelo se distribuye en formato ONNX y se encuentra en una fase temprana de desarrollo (V1). La arquitectura concreta no está especificada en la información disponible, pero el autor indica que se está realizando fine-tuning con datos de alto alemán y dialectos, así como con datasets sintéticos generados por síntesis de voz. La relevancia del modelo radica en su enfoque de privacidad: permite transcribir audio sin conexión a internet y sin enviar datos a la nube, lo que lo hace atractivo para aplicaciones de accesibilidad, aprendizaje de idiomas y transcripción profesional en entornos sensibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (soporta transcripción de larga duración) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Alemán, inglés, francés, español, italiano, neerlandés, portugués, ruso, polaco (dialectos alemanes planificados para V2) |
| Licencia | no disponible (el autor declara uso gratuito y comercial, pero no hay licencia explícita en el repositorio) |
| Formato de pesos | ONNX (inferencia mediante ONNX Runtime) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo: no se especifica si se trata de un transformer, conformer u otro tipo de red neuronal. El modelo se ejecuta mediante ONNX Runtime y está integrado en una aplicación escrita en Rust. El autor menciona que se está realizando fine-tuning sobre datos de alto alemán y dialectos, incluyendo datasets sintéticos generados por síntesis de voz (TTS), y que el código de fine-tuning se publicará en el futuro. También se menciona un enfoque basado en MiCA en fase de experimentación, aunque no se aportan detalles técnicos. El modelo se complementa con un modelo NLP de corrección posterior que se entrena específicamente sobre las salidas del sistema de transcripción y que mejora el WER en aproximadamente un 12% (de 3,6% a 3,3%).

## Capacidades

- Transcripción de voz a texto en alemán, inglés, francés, español, italiano, neerlandés, portugués, ruso y polaco.
- Soporte de code-switching: puede transcribir grabaciones que mezclan varios idiomas, incluyendo anglicismos sin problemas.
- Transcripción en tiempo real (streaming).
- Transcripción de audio de larga duración, incluyendo grabaciones de varias horas.
- Ejecución 100% local y privada, sin necesidad de conexión a internet ni envío de datos a la nube.
- Funcionamiento eficiente en CPU, sin necesidad de GPU.
- Corrección ortográfica posterior mediante un modelo NLP específico integrado en la app Redeschrift, que reduce el WER de 3,6% a 3,3%.
- Soporte de dialectos alemanes planificado para la versión V2.

## Casos de uso

- Transcripción de reuniones y entrevistas: los profesionales pueden grabar audio y obtener transcripciones locales en minutos, sin subir contenido confidencial a servicios externos. El modelo soporta grabaciones largas, lo que lo hace adecuado para juntas de varias horas.
- Dictado por voz para personas con movilidad reducida: el modelo permite escribir hablando, lo que facilita la comunicación a quienes tienen dificultades para teclear. Al ejecutarse localmente, no requiere conexión a internet y puede usarse de forma discreta.
- Apoyo a personas con dislexia: al transcribir el habla y corregir la ortografía, la app Redeschrift ofrece una forma de expresarse por escrito sin depender de la escritura manual, reduciendo la barrera que supone la ortografía.
- Aprendizaje de alemán como lengua extranjera (DaF): los estudiantes pueden practicar la pronunciación en casa; si el modelo no entiende una palabra, es señal de que la pronunciación puede mejorarse. La baja tasa de error permite una retroalimentación fiable.
- Accesibilidad para personas mayores o niños que aún no dominan el teclado: el dictado por voz simplifica la interacción con aplicaciones y dispositivos, mejorando su autonomía.
- Transcripción de podcasts y contenido de audio: los creadores pueden generar subtítulos o notas de sus episodios de forma local y rápida, sin depender de servicios de transcripción de pago.
- Integración en aplicaciones de escritorio o web: gracias a ONNX Runtime y Rust, el modelo puede incrustarse en soluciones existentes sin depender de APIs externas, lo que facilita su uso en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta los siguientes resultados internos para la versión V1:

| Métrica | Valor |
|---|---|
| WER (alto alemán, V1) | ~3,6% |
| WER con corrección de la app Redeschrift | ~3,3% |
| RTF (factor de tiempo real) | ~0,06 |
| Tamaño del modelo | ~725 MB |

Estos datos provienen del autor y no han sido verificados por evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada: no requiere GPU. El modelo se ejecuta en CPU; la memoria necesaria es de aproximadamente 725 MB, más el overhead de ejecución.
- GPU recomendadas: ninguna. Es un modelo diseñado para CPU.
- Compatibilidad con GPUs de consumo: no aplica, pero puede ejecutarse en cualquier ordenador con CPU moderna (x86-64, Apple Silicon).
- Opciones de despliegue: ONNX Runtime (CPU), integración en aplicaciones Rust, app Redeschrift. No se mencionan vLLM, llama.cpp, Ollama o TGI, ya que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: RTF ~0,06, es decir, 60 ms de procesamiento por segundo de audio en ordenadores modernos.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos similares en la información proporcionada. El modelo se posiciona como una alternativa ligera y local a sistemas ASR basados en nube, pero no se aportan datos comparativos con otros modelos como Whisper o Wav2Vec2.

## Limitaciones y advertencias

- Modelo en desarrollo (WIP): la V1 no es una versión estable; el autor indica que continuará el fine-tuning y que se añadirán dialectos en V2.
- Licencia no especificada: aunque el autor declara que el modelo puede usarse de forma gratuita y comercial, no hay una licencia formal en el repositorio de HuggingFace, lo que puede suponer un riesgo legal para su uso en producción.
- Sin evaluaciones independientes: los datos de WER y RTF provienen del autor y no han sido verificados por terceros.
- WER de 3,6% en alto alemán: puede degradarse con ruido, acentos o habla no nativa; los dialectos no están soportados hasta V2.
- Dependencia de la app Redeschrift para obtener el mejor rendimiento: el modelo por sí solo tiene un WER de 3,6%, que solo baja a 3,3% con la corrección de la app.
- El pipeline de HuggingFace no está definido, lo que puede dificultar su uso directo con herramientas estándar.
- Sin descargas ni likes en el repositorio: es un proyecto nuevo con poca tracción y poco probado en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kyr0/redeschrift-1.0
- Proyecto en GitHub: https://github.com/kyr0/redeschrift
- Perfil de kyr0 en GitHub: https://github.com/kyr0
- Perfil de kyr0 en HuggingFace: https://huggingface.co/kyr0
