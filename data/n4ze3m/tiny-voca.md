# n4ze3m/tiny-voca

## Resumen

tiny-voca es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por n4ze3m, diseñado para ejecutarse en entornos con recursos muy limitados, como navegadores o teléfonos móviles. Se trata de un modelo entrenado desde cero, sin pesos preentrenados, con un total de 4.537.291 parámetros, incluyendo el generador de forma de onda. Ofrece dos voces en inglés americano: F2 (femenina) y M2 (masculina), con salida mono a 24 kHz.

El modelo destaca por su extrema ligereza: el archivo PyTorch en float32 ocupa 18,2 MB y la exportación ONNX 21,4 MB, lo que permite su despliegue en WebAssembly mediante onnxruntime-web. Según el autor, se ejecuta aproximadamente 70 veces más rápido que el tiempo real en cuatro hilos de CPU, lo que lo convierte en una opción viable para síntesis de voz local en dispositivos sin GPU.

La relevancia actual de tiny-voca radica en su enfoque en la eficiencia y la portabilidad: frente a modelos TTS de gran tamaño que requieren GPU, este modelo apuesta por una arquitectura compacta entrenada con unas 18 horas de voz sintética y publicada bajo licencia Apache-2.0, lo que facilita su integración en aplicaciones comerciales y de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS con generador de forma de onda; detalles de la arquitectura no especificados en la información disponible) |
| Parametros totales | 4.537.291 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; límite de 512 tokens por utterance y 32 segundos de audio por llamada |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (americano) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt, float32) y ONNX (opset 17, float32) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se compone de un modelo principal y un generador de forma de onda, con un total de 4.537.291 parámetros. El modelo fue entrenado desde cero, sin pesos preentrenados, sobre aproximadamente 18 horas de voz sintética en inglés americano, según indica el autor. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

El flujo de inferencia convierte el texto a fonemas mediante el fonemizador dizione, que genera identificadores de fonemas y valores de estrés (0 ninguno, 1 primario, 2 secundario). El grafo ONNX recibe estos identificadores junto con parámetros de voz, velocidad, desplazamiento de tono y rango de tono, y devuelve la forma de onda a 24 kHz junto con las duraciones por token en tramas de 256 muestras. El modelo procesa una utterance por llamada, con un máximo de 512 tokens y 32 segundos, y el texto más largo debe dividirse en frases.

## Capacidades

- Síntesis de voz en inglés americano con dos voces: F2 (femenina) y M2 (masculina).
- Generación de audio a 24 kHz mono con control de velocidad de habla.
- Control de tono mediante desplazamiento en escala logarítmica de F0 (0,058 equivale aproximadamente a un semitono) y escalado del movimiento de tono alrededor de la media de la utterance.
- Procesamiento de texto de cualquier longitud en la herramienta de inferencia PyTorch, que divide el texto en frases y une el audio resultante.
- Manejo de texto sin puntuación final: se añade un punto automáticamente; las frases sin contenido legible (por ejemplo, en otro sistema de escritura) se omiten.
- Exportación ONNX compatible con onnxruntime-web (WebAssembly), con audio que coincide con el modelo PyTorch dentro del 0,6 % de la amplitud de pico, salvo el ruido aleatorio que cada runtime genera por sí mismo.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa, visión ni audio de entrada.

## Casos de uso

- Síntesis de voz en el navegador: el modelo ONNX se ejecuta en onnxruntime-web (WebAssembly) sin necesidad de servidor, lo que permite integrar lectura en voz alta en aplicaciones web con latencia baja y sin dependencias de GPU.
- Aplicaciones móviles offline: con 18,2 MB en PyTorch y 21,4 MB en ONNX, el modelo cabe en dispositivos móviles y puede generar voz sin conexión a internet, útil para lectores de pantalla o asistentes locales.
- Generación de avisos y notificaciones: para frases cortas como recordatorios de reuniones o alertas, el modelo procesa utterances de hasta 32 segundos con velocidad ajustable, adecuado para sistemas de notificación por voz.
- Prototipado rápido de interfaces de voz: la licencia Apache-2.0 y la disponibilidad de pesos en PyTorch y ONNX facilitan la experimentación en proyectos de investigación o productos comerciales sin restricciones de licencia.
- Sistemas embebidos y de bajo consumo: al ejecutarse aproximadamente 70 veces más rápido que el tiempo real en cuatro hilos de CPU, puede integrarse en dispositivos con recursos limitados para anuncios hablados o respuestas de voz.
- Pruebas de accesibilidad: la posibilidad de elegir entre dos voces y ajustar velocidad y tono permite generar audio de prueba para evaluar la accesibilidad de aplicaciones antes de recurrir a voces comerciales.
- Educación y demostraciones: el modelo sirve para ilustrar pipelines TTS completos (fonemización, inferencia, postprocesado de amplitud) en cursos o talleres, dado su pequeño tamaño y su código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el modelo se ejecuta aproximadamente 70 veces más rápido que el tiempo real en cuatro hilos de CPU, pero no se proporcionan métricas de calidad subjetiva (MOS) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU. Los pesos en float32 ocupan 18,2 MB (PyTorch) y 21,4 MB (ONNX), por lo que la memoria necesaria es mínima.
- GPU recomendadas: no se requieren; el modelo funciona en CPU. No se documenta soporte GPU específico.
- Compatibilidad con GPU de consumo: irrelevante para su diseño, pero al ser tan pequeño cabría en cualquier GPU; no obstante, no se proporcionan datos de rendimiento en GPU.
- Opciones de despliegue: PyTorch (script `tiny_voca.infer`), ONNX Runtime (Python) y onnxruntime-web (WebAssembly en navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: aproximadamente 70 veces más rápido que el tiempo real en cuatro hilos de CPU, según el autor. No se especifican latencias absolutas ni throughput en otras configuraciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos TTS.

## Limitaciones y advertencias

- Solo soporta inglés americano; el texto en otros sistemas de escritura se omite y no se genera audio para él.
- El modelo puede producir picos de amplitud superiores a 1,0 (aproximadamente una frase de cada veinte), por lo que es necesario escalar la señal antes de guardar muestras de 16 bits.
- Sin puntuación final, la última palabra se corta; es necesario terminar cada utterance con un signo como un punto.
- Límite de 512 tokens y 32 segundos por llamada; el texto más largo debe dividirse en frases.
- Entrenado con aproximadamente 18 horas de voz sintética, lo que puede limitar la naturalidad y variedad prosódica frente a modelos entrenados con datos reales a mayor escala.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con voz sintética en inglés americano, puede reflejar las características de esa fuente.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero la calidad de la fonemización y la prosodia puede degradarse con texto complejo o no convencional.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las licencias de las dependencias (dizione) y de los datos de entrenamiento.
- No se proporcionan métricas de calidad (MOS) ni evaluaciones formales, por lo que la idoneidad para producción debe validarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/n4ze3m/tiny-voca
- Código: https://github.com/n4ze3m/tiny-voca
- Fonemizador dizione: https://github.com/n4ze3m/dizione
- Dataset: https://huggingface.co/datasets/n4ze3m/tiny-voca
- Demo en el navegador: https://huggingface.co/spaces/n4ze3m/tiny-voca-studio
