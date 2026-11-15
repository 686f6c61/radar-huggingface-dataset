# Phoonnx/vits-piper_de_DE-thorsten_emotional-medium

## Resumen

vits-piper_de_DE-thorsten_emotional-medium es un modelo de síntesis de voz (text-to-speech) en formato ONNX, empaquetado por el usuario Phoonnx a partir del repositorio agregador Phoonnx/phoonnx-vits. Se trata de una voz Piper para alemán (locale de_DE) identificada como "thorsten_emotional" en variante medium, convertida al formato que consume la librería phoonnx, un motor de TTS basado en ONNX Runtime desarrollado por TigreGotico. El modelo no ha sido entrenado por Phoonnx: el repositorio actúa como espejo y redistribuidor de voces Piper ya existentes, conservando las rutas de ficheros del repositorio original.

La arquitectura subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo condicional variational autoencoder con discriminador adversarial y alineamiento monotónico, tal y como se etiqueta en el repositorio. La variante "medium" hace referencia al tamaño de la voz Piper original, que prioriza un equilibrio entre calidad y velocidad de inferencia frente a las variantes "low" y "high". El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un modelo VITS de tamaño medio cuantizado a ONNX.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue, no de un modelo de investigación con benchmarks publicados. Su interés práctico reside en la posibilidad de integrar una voz alemana emocional en pipelines de TTS autoalojados mediante phoonnx u ONNX Runtime, sin dependencia de servicios en la nube. No hay información publicada sobre el dataset de entrenamiento, el número de parámetros ni métricas de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, VAE + discriminador adversarial) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto, no contexto conversacional) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; el repositorio no detalla precisión interna) |
| Idiomas soportados | alemán (locale de_DE, según el identificador de la voz) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamaño del repositorio | ~0,1 GB |
| Librería de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Identificador de voz | `piper/de_DE-thorsten_emotional-medium` |

## Arquitectura y entrenamiento

VITS combina un encoder de texto, un prior y un decoder condicionados por un aligner monotónico basado en búsqueda (MAS), entrenados de forma adversarial contra un discriminador que opera sobre la forma de onda generada. El resultado es un modelo end-to-end que produce audio directamente desde fonemas, sin vocoder externo separado. La variante "medium" de Piper reduce el tamaño de las capas respecto a "high" para mejorar la latencia en CPU, manteniendo una inteligibilidad razonable.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas de esta voz. El repositorio de origen (Phoonnx/phoonnx-vits) es un agregador que redistribuye voces Piper; la model card no incluye detalles del entrenamiento original de la voz thorsten_emotional. La licencia MIT se hereda del repositorio fuente según la propia card, aunque esta también advierte que las licencias siguen a los originales por subcarpeta y que algunas voces del agregador carecen de licencia declarada.

## Capacidades

- Síntesis de voz (text-to-speech) en alemán a partir de texto de entrada.
- Voz etiquetada como "emotional", lo que sugiere prosodia expresiva, aunque no se documenta el rango emocional concreto.
- Inferencia mediante ONNX Runtime a través de la librería phoonnx.
- Ejecución local sin dependencia de API externa.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo acústico, no un LLM.
- No dispone de capacidades multimodales de entrada (no procesa imagen, audio ni vídeo como entrada).
- No se documentan capacidades multilingües más allá del alemán.

## Casos de uso

- Lectura de artículos y documentos en alemán: el modelo convierte texto plano en audio para aplicaciones de accesibilidad o lectura por voz, ejecutándose localmente en el servidor o en el dispositivo.
- Asistentes de voz autoalojados: integración en un pipeline de reconocimiento de voz + LLM + TTS donde la fase de síntesis se resuelve con phoonnx y este modelo, evitando enviar texto del usuario a servicios de terceros.
- Generación de audiolibros y pódcasts: síntesis por lotes de capítulos largos en alemán, con la ventaja de que el modelo es pequeño (~0,1 GB) y puede ejecutarse en CPU.
- Sistemas de navegación y avisos por voz: locuciones cortas y repetidas donde prima la latencia baja y el coste por inferencia mínimo.
- Pruebas de integración continua para pipelines de TTS: al ser un artefacto ONNX pequeño, sirve como voz de referencia en tests automatizados de sistemas que consumen audio sintético.
- Prototipado de interfaces conversacionales en alemán: validación temprana de UX de voz antes de invertir en voces comerciales o modelos de mayor tamaño.
- Investigación en prosodia emocional: comparación de esta voz "emotional" frente a voces neutras de Piper para estudiar el efecto de la expresividad en la percepción del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MOS (Mean Opinion Score), métricas de inteligibilidad, latencia ni comparaciones con otras voces Piper.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (~0,1 GB), el modelo cabe holgadamente en cualquier GPU consumer e incluso en memoria unificada de dispositivos móviles.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime (CUDA o DirectML) es suficiente. Para CPU, un procesador moderno de escritorio o servidor es adecuado.
- Cabe en GPU consumer: sí, con margen amplio; el cuello de botella será el front-end de fonemización, no el modelo acústico.
- Opciones de despliegue: phoonnx (librería nativa del artefacto) sobre ONNX Runtime; también es posible cargar el ONNX directamente con onnxruntime en Python, C++ o C#.
- Latencia y throughput estimados: no disponibles. La variante "medium" de Piper está diseñada para inferencia en tiempo real en CPU, pero no se aportan cifras concretas para esta voz.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-piper_de_DE-thorsten_emotional-medium (este) | VITS | ~0,1 GB (repo) | Alemán | MIT | ONNX | Hugging Face |
| Otras voces Piper de_DE (p. ej. thorsten normal) | VITS | no disponible | Alemán | según voz original | ONNX | Repositorio Piper |
| Coqui TTS (modelos VITS multilingües) | VITS / otros | variable | Multilingüe | MPL-2.0 / otras | PyTorch, ONNX | Coqui / HF |
| Modelos TTS comerciales en la nube | no disponible | no disponible | Multilingüe | propietaria | API | Servicios cloud |

No se dispone de datos de rendimiento comparativo (MOS, latencia) entre estas alternativas en la información proporcionada. La comparación se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- No hay información publicada sobre sesgos acústicos, de género o de prosodia; la voz "thorsten" procede de un hablante concreto y puede no representar variedades regionales del alemán.
- Riesgo de alucinación acústica: como todo modelo TTS, puede producir pronunciaciones incorrectas en nombres propios, siglas, números y préstamos lingüísticos no vistos en entrenamiento.
- Limitación de idioma: solo se documenta alemán (de_DE); no se garantiza un comportamiento correcto con texto en otros idiomas.
- Licencia MIT declarada, pero la model card advierte que las licencias siguen a los originales por subcarpeta y que algunas voces del agregador no declaran licencia; conviene verificar la procedencia de la voz thorsten_emotional antes de uso comercial.
- Artefacto de redistribución: no es un modelo entrenado por el autor del repositorio, por lo que no hay garantías de mantenimiento ni soporte.
- Sin métricas de calidad publicadas: no es posible evaluar objetivamente la inteligibilidad o naturalidad frente a alternativas sin realizar pruebas propias.
- El front-end de fonemización (espeak o similar) puede introducir errores en palabras fuera de vocabulario; la calidad final depende tanto del modelo acústico como del fonemizador.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Phoonnx/vits-piper_de_DE-thorsten_emotional-medium
- Repositorio agregador de origen: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Proyecto Piper (voces originales): no disponible en la información proporcionada
