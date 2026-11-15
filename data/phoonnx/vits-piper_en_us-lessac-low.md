# Phoonnx/vits-piper_en_US-lessac-low

## Resumen

vits-piper_en_US-lessac-low es un modelo de síntesis de voz (text-to-speech) en formato ONNX, derivado de una voz Piper originalmente entrenada con la arquitectura VITS. Lo publica el usuario Phoonnx como un subconjunto extraído del repositorio agregador Phoonnx/phoonnx-vits, con el objetivo de servir como recurso directamente consumible por la librería phoonnx, un motor de TTS en Python desarrollado por TigreGotico.

El modelo corresponde a la voz "lessac" en inglés estadounidense (en_US) en su variante de calidad "low", es decir, la versión de menor coste computacional de esa voz dentro del ecosistema Piper. No se trata de un modelo de lenguaje ni de un sistema de TTS de gran escala: es un modelo acústico compacto pensado para síntesis rápida en CPU o en dispositivos con recursos limitados, con un tamaño de repositorio de aproximadamente 0,1 GB.

Su relevancia es práctica más que investigadora: facilita el despliegue de TTS en inglés en aplicaciones ligeras (lectores de pantalla, asistentes locales, generación de audio por lotes) sin depender de servicios en la nube. La información publicada es escasa: la model card no detalla arquitectura interna, datos de entrenamiento ni métricas, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (según tags del repositorio; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; variante "low" del ecosistema Piper) |
| Idiomas soportados | inglés estadounidense (en_US), según el identificador de la voz |
| Licencia | MIT |
| Formato de pesos | ONNX (librería phoonnx) |

## Arquitectura y entrenamiento

El modelo se etiqueta como VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura de síntesis extremo a extremo que combina un codificador de texto, un predictor de duración, un flujo normalizador y un decodificador generativo basado en GAN, todo entrenado de forma conjunta. Esta familia de modelos produce audio de forma rápida y con un footprint reducido, lo que explica su adopción en el ecosistema Piper para síntesis local.

No se dispone de información sobre el número de parámetros, la composición del corpus de entrenamiento, el número de horas de audio, el esquema de alineamiento fonético ni si se aplicaron técnicas de destilación o cuantización para obtener la variante "low". La model card únicamente indica que los ficheros conservan las rutas del repositorio origen Phoonnx/phoonnx-vits, carpeta `piper__en_US-lessac-low`, y que la licencia sigue la del repositorio fuente por subcarpeta.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés estadounidense.
- Generación de audio con la voz "lessac" en variante de calidad baja, optimizada para velocidad y tamaño reducido.
- Integración nativa con la librería phoonnx mediante el identificador de voz `piper/en_US-lessac-low`.
- Ejecución en formato ONNX, lo que permite inferencia en CPU sin GPU dedicada.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multimodales más allá de la conversión texto-a-audio.
- Control de prosodia y estilo: no documentado en la información disponible.

## Casos de uso

- Lectura de textos en aplicaciones de accesibilidad: el modelo puede convertir artículos o notificaciones en audio en inglés para lectores de pantalla, gracias a su formato ONNX y su bajo coste de inferencia en CPU.
- Asistentes de voz locales y sin conexión: al ejecutarse con phoonnx sobre ONNX, permite dotar de voz a asistentes embebidos en dispositivos con recursos limitados sin enviar texto a servicios externos.
- Generación por lotes de audiolibros o pódcast en inglés: la variante "low" prioriza velocidad, lo que resulta adecuado para sintetizar grandes volúmenes de texto en pipelines automatizados.
- Pruebas y prototipado de interfaces conversacionales: sirve como voz por defecto en demos de aplicaciones de voz antes de invertir en una voz de mayor calidad.
- Sistemas de anuncios automatizados: integrable en aplicaciones de transporte, comercio o domótica que necesiten mensajes hablados breves en inglés con latencia baja.
- Evaluación comparativa de motores TTS: al ser un modelo pequeño y de licencia MIT, es útil como línea base para medir calidad y latencia frente a otras voces Piper o modelos VITS alternativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoría de despliegues; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime puede acelerar la inferencia, pero no es un requisito.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del repositorio (aproximadamente 0,1 GB).
- Opciones de despliegue: librería phoonnx sobre ONNX Runtime; también puede ejecutarse con herramientas compatibles con modelos ONNX de Piper, aunque la integración documentada es la de phoonnx.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| Phoonnx/vits-piper_en_US-lessac-low | VITS | en_US | ~0,1 GB (repo) | MIT | ONNX |
| Otras voces Piper en_US (p. ej. variantes medium/high del ecosistema Piper) | VITS | en_US | no disponible | según voz original | ONNX |
| Modelos TTS neuronales de mayor escala (p. ej. familias tipo Tacotron 2 o FastSpeech 2) | seq2seq / feed-forward | varios | no disponible | variable | variable |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense; no se ha documentado soporte multilingüe.
- La variante "low" prioriza velocidad y tamaño sobre calidad de audio; puede presentar artefactos o menor naturalidad que las variantes medium o high.
- No hay información sobre sesgos acústicos, cobertura de acentos o robustez ante texto con ruido, abreviaturas o símbolos.
- Riesgo de pronunciación incorrecta en nombres propios, términos técnicos y palabras fuera del vocabulario de entrenamiento.
- La licencia MIT se hereda del repositorio fuente según la model card; conviene verificar la licencia de la voz original "lessac" antes de uso comercial, ya que el repositorio agregador advierte que las licencias siguen a los originales por subcarpeta.
- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones complejas.
- Ausencia de métricas publicadas de calidad (MOS) o de rendimiento que permitan garantizar un nivel de calidad en producción.

## Enlaces

- [Hugging Face: Phoonnx/vits-piper_en_US-lessac-low](https://huggingface.co/Phoonnx/vits-piper_en_US-lessac-low)
- [Repositorio origen: Phoonnx/phoonnx-vits](https://huggingface.co/Phoonnx/phoonnx-vits)
- [Librería phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
