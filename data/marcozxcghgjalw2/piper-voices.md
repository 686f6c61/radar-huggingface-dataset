# marcozxcghgjalw2/piper-voices

## Resumen

`marcozxcghgjalw2/piper-voices` es un repositorio de pesos de voces para Piper, el sistema de síntesis de voz (TTS) neuronal de código abierto desarrollado en el ecosistema Rhasspy. No se trata de un modelo de lenguaje generativo, sino de un conjunto de checkpoints ONNX entrenados específicamente para convertir texto en audio en 35 idiomas, entre ellos el castellano, el catalán y el gallego-portugués. El repositorio lo publica el usuario `marcozxcghgjalw2` y ocupa 11,9 GB.

Piper está diseñado para inferencia local de baja latencia sobre CPU, lo que lo convierte en una pieza habitual en asistentes domésticos (Home Assistant, Rhasspy), sistemas embebidos y aplicaciones de accesibilidad que necesitan TTS sin depender de servicios en la nube. Cada voz se empaqueta como un modelo ONNX más un fichero de configuración con el mapeo de fonemas, y el conjunto se distribuye bajo licencia MIT.

La relevancia de este repositorio radica en su cobertura multilingüe y en el formato ligero de los pesos: permite desplegar síntesis de voz en Raspberry Pi, portátiles sin GPU o contenedores pequeños, con un coste computacional muy inferior al de los modelos TTS basados en difusión o en transformers de gran tamaño. La información disponible no detalla la arquitectura interna de cada voz ni los datos de entrenamiento, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (voces Piper; pesos en formato ONNX) |
| Parametros totales | no disponible por voz (repositorio de 11,9 GB con múltiples voces) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | 35: ar, ca, cs, cy, da, de, el, en, es, fa, fi, fr, hu, is, it, ka, kk, lb, lv, ne, nl, no, pl, pt, ro, ru, sk, sl, sr, sv, sw, tr, uk, vi, zh |
| Licencia | MIT |
| Formato de pesos | ONNX (con ficheros de configuración asociados) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna de las voces incluidas. Piper emplea habitualmente modelos TTS neuronales ligeros basados en VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), con un codificador de texto fonemizado, un decodificador y un vocoder integrados que generan audio de forma end-to-end. Cada voz se entrena de forma independiente para un idioma y un hablante o conjunto de hablantes, y se exporta a ONNX para su ejecución con `onnxruntime`.

Tampoco se documentan en la información disponible el número de tokens de entrenamiento, la composición de los datasets, ni si se aplicaron técnicas de ajuste como RLHF o DPO (habitualmente no aplicables a TTS). El autor remite a los checkpoints de entrenamiento del proyecto Piper (`rhasspy/piper-checkpoints`) para quien quiera entrenar sus propias voces, lo que sugiere que este repositorio es una recopilación de voces ya entrenadas y exportadas, no un conjunto de modelos con documentación técnica propia.

## Capacidades

- Síntesis de voz (texto a audio) en 35 idiomas, incluidos castellano, catalán, gallego-portugués, inglés, alemán, francés, italiano, ruso, chino, árabe, hindi-adyacente (ne), vietnamita y turco, entre otros.
- Generación de audio de un solo hablante o multi-hablante según la voz concreta (no se detalla por voz en la información disponible).
- Fonemización y conversión grafema-fonema específica por idioma mediante los ficheros de configuración incluidos.
- Ejecución local sobre CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración con el ecosistema Piper y Rhasspy para asistentes de voz.
- No incluye capacidades de razonamiento, generación de texto, código, matemáticas, visión ni tool calling, al no ser un modelo de lenguaje.
- No se documentan modos especiales como thinking mode, audio de entrada o clonación de voz.

## Casos de uso

- Asistentes de voz domésticos: integración en Home Assistant o Rhasspy para leer respuestas del asistente en castellano o catalán con baja latencia sobre una Raspberry Pi, gracias a la ejecución ONNX en CPU.
- Accesibilidad: conversión de texto a voz para lectores de pantalla y aplicaciones de apoyo a personas con discapacidad visual, con voces en múltiples idiomas y licencia MIT que permite su redistribución.
- Sistemas de megafonía y avisos automatizados: generación de anuncios pregrabados o dinámicos en estaciones, aeropuertos o comercios, usando voces por idioma según la ubicación.
- Audiolibros y contenido educativo: síntesis de material de lectura en varios idiomas para plataformas de aprendizaje, con la ventaja de no requerir conexión a servicios externos.
- Videojuegos y experiencias interactivas: generación de diálogos de personajes no jugadores (NPC) en tiempo real en dispositivos de gama baja, al no necesitar GPU.
- Prototipado de interfaces conversacionales: pruebas de concepto de IVR (respuesta de voz interactiva) y agentes telefónicos en entornos de desarrollo, con coste cero de API.
- Localización de contenidos: generación de pistas de audio en 35 idiomas a partir de un mismo texto para demos, tutoriales o material de marketing.
- Investigación en TTS: base para experimentos de síntesis de voz y comparación de voces, dado el formato ONNX estandarizado y la licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; las voces Piper están diseñadas para ejecutarse en CPU mediante ONNX Runtime. Cada voz individual suele ocupar decenas o pocos cientos de MB, aunque el repositorio completo suma 11,9 GB.
- GPU recomendadas: no necesarias. La inferencia está optimizada para CPU; una GPU no aporta ventajas significativas en este tipo de modelos.
- ¿Cabe en consumer GPU? Sí, cualquier GPU consumer podría alojar una voz individual, pero el diseño objetivo es la ejecución en CPU.
- Opciones de despliegue: binario `piper` de Rhasspy, `onnxruntime` en Python/C++, integración con Home Assistant, contenedores Docker del proyecto Piper y llamadas directas al modelo ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Piper está optimizado para síntesis en tiempo real o inferior en hardware modesto (Raspberry Pi 4, CPUs de portátil), pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Ejecución |
|---|---|---|---|---|---|
| Piper (este repositorio) | TTS neuronal ligero | 35 | MIT | ONNX | CPU |
| Coqui TTS | TTS neuronal | Múltiples | MPL 2.0 (según modelo) | PyTorch | CPU/GPU |
| eSpeak NG | TTS por concatenación/formantes | >100 | GPLv3 | Binario | CPU |
| MaryTTS | TTS basado en unidades | Múltiples | LGPL | Java | CPU |

La comparación se limita a categorías generales, ya que la información disponible no incluye métricas objetivas (MOS, WER, latencia) para este repositorio concreto. Frente a eSpeak NG, Piper ofrece voz neuronal de mayor naturalidad a costa de un tamaño mayor por voz; frente a Coqui TTS, Piper prioriza la ligereza y el despliegue en CPU, mientras Coqui ofrece mayor flexibilidad de entrenamiento y clonación.

## Limitaciones y advertencias

- La información disponible no documenta sesgos específicos por voz ni por idioma; al ser voces entrenadas con datasets de los que no se detalla composición, pueden reproducir sesgos de acento, género o registro presentes en los datos originales.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede haber errores de pronunciación, fonemización incorrecta y artefactos en palabras fuera del vocabulario o en nombres propios.
- Cobertura desigual entre idiomas: no se especifica cuántas voces ni qué calidad tiene cada uno de los 35 idiomas; algunos pueden tener una sola voz o voces de menor calidad.
- La licencia MIT del repositorio permite uso comercial y redistribución, pero conviene verificar la licencia de cada voz individual y de los datasets de entrenamiento originales, que no se detallan en la información disponible.
- El repositorio no incluye una model card técnica con detalles de arquitectura, datos o evaluación; para producción conviene validar la calidad de cada voz concreta antes de desplegarla.
- No es un modelo de lenguaje: no puede mantener conversaciones, razonar ni ejecutar herramientas; debe combinarse con un LLM o un sistema de diálogo externo.
- El tamaño total de 11,9 GB puede ser excesivo para despliegues embebidos; es recomendable descargar únicamente las voces necesarias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/marcozxcghgjalw2/piper-voices
- Proyecto Piper (GitHub): https://github.com/rhasspy/piper
- Guía de entrenamiento de voces Piper: https://github.com/rhasspy/piper/blob/master/TRAINING.md
- Checkpoints de entrenamiento de Piper: https://huggingface.co/datasets/rhasspy/piper-checkpoints/tree/main
- Ecosistema Rhasspy: https://rhasspy.readthedocs.io/
