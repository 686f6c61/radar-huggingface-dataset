# erkint/zerre-tts

## Resumen

zerre-tts (tr-v1) es un modelo de síntesis de voz (text-to-speech) para turco, desarrollado por el usuario independiente erkint y publicado bajo licencia Apache-2.0. Se trata de un modelo entrenado desde cero con solo 4.5 millones de parámetros, lo que lo sitúa en la categoría de modelos ultraligeros orientados a despliegue en entornos con recursos muy limitados. Los pesos en formato ONNX ocupan 20.4 MB y el modelo está pensado para ejecutarse directamente en el navegador mediante WebAssembly, sin necesidad de servidor.

La arquitectura deriva del proyecto tiny-voca (Apache-2.0) de Muhammed Nazeem, adaptada para turco. El modelo ofrece dos voces fijas (MK, masculina, y NK, femenina) y fue entrenado con 11.93 horas de audio procedente de dos corpus abiertos de audiolibros en turco, remuestreados de 48 kHz a 24 kHz. El entrenamiento completo requirió 65.000 pasos en una única GPU NVIDIA L4 durante aproximadamente 6.5 horas, con un coste estimado de 7 dólares.

Su relevancia actual radica en que demuestra que es posible obtener una calidad de síntesis razonable en turco con un modelo tres órdenes de magnitud menor que alternativas como XTTS-v2 (467M parámetros). El autor reporta un WER del 1.3 % medido con Whisper large-v3 sobre un conjunto de test de 20 clips del mismo dominio, aunque advierte que las muestras son pequeñas y deben interpretarse como comprobación de cordura, no como una evaluación definitiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptación de tiny-voca (no se detalla la topología interna en la información disponible) |
| Parámetros totales | 4.5M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa una frase por inferencia; el truncado de textos largos es responsabilidad del llamante) |
| Tipos de cuantización | no disponible (se distribuyen pesos ONNX y un checkpoint PyTorch `inference.pt`) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (20.4 MB) y checkpoint PyTorch (`inference.pt`) |

## Arquitectura y entrenamiento

El modelo adopta la arquitectura del proyecto tiny-voca, un diseño de TTS de muy bajo parámetro pensado para inferencia ligera. La información disponible no detalla la topología interna (capas, tipo de decoder, mecanismo de atención), por lo que no es posible describirla con mayor precisión. La entrada al grafo ONNX son tokens (int64 [1,N]), una marca de estrés (int64 [1,N]), un identificador de voz (int64 [1]) y tres parámetros de control de prosodia (speed, pitch_shift, pitch_range, todos float32 [1]); la salida es audio en float32. La conversión de texto a fonemas queda fuera del modelo y se realiza con eSpeak NG en turco o con el conversor basado en diccionario y reglas que emplea la demo.

El entrenamiento partió de dos corpus abiertos de audiolibros en turco (`omersaidd/tts_mazlum_kiper_tur` y `omersaidd/tts_nisan_kumru_tur`), que suman 16 horas de audio a 48 kHz y se remuestrearon a 24 kHz. La alineación fonética se realizó con el reconocedor de fonemas de eSpeak, aceptándose 6.347 clips (11.93 horas). El modelo se entrenó durante 65.000 pasos en una sola GPU L4, con un coste aproximado de 7 dólares. No se menciona en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación posteriores al entrenamiento supervisado.

## Capacidades

- Síntesis de voz en turco a partir de texto, con dos voces fijas: MK (masculina) y NK (femenina).
- Control de velocidad, desplazamiento de tono (pitch_shift) y rango de tono (pitch_range) mediante parámetros de entrada.
- Marcado de estrés por token como entrada adicional al modelo.
- Inferencia en navegador mediante ONNX Runtime y WebAssembly, sin servidor.
- Inferencia en Python mediante el paquete `zerre-tts` y el script `zerre.infer`.
- No soporta clonación de voz, streaming ni selección de voces más allá de las dos incluidas.
- No dispone de tool calling, capacidades de agente, visión ni audio de entrada.

## Casos de uso

- Lectura de artículos y documentos en turco dentro del navegador: el modelo se ejecuta con WebAssembly y 20.4 MB de pesos, por lo que puede integrarse en una página web para leer contenido sin enviar texto a un servidor y sin coste de infraestructura.
- Accesibilidad para usuarios con discapacidad visual en aplicaciones web turcas: la síntesis local elimina la latencia de red y permite leer fragmentos de interfaz o contenido dinámico bajo demanda.
- Prototipado rápido de asistentes de voz en turco: con dos voces y control de prosodia básico, sirve para validar flujos de conversación antes de invertir en un modelo mayor o en un servicio comercial.
- Generación de avisos y notificaciones pregrabadas en aplicaciones móviles o de escritorio: al ser un modelo de 20 MB, puede empaquetarse dentro de la propia aplicación y funcionar sin conexión.
- Investigación y docencia sobre TTS de bajo coste: el repositorio incluye la receta de entrenamiento y el coste real (6.5 horas en una L4), lo que facilita reproducir el pipeline con otros corpus o idiomas.
- Audiolibros y contenido narrado de dominio acotado: el modelo fue entrenado con audiolibros y mantiene un tono de lectura adecuado para narrar textos largos divididos en frases por el llamante.
- Sistemas embebidos o de borde con recursos muy limitados: 4.5M parámetros y pesos ONNX de 20.4 MB permiten ejecución en dispositivos donde modelos de cientos de millones de parámetros no caben.

## Benchmarks y rendimiento

El autor publica mediciones de WER con Whisper large-v3 en turco, además de métricas de prosodia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo de TTS.

| Métrica | Conjunto | Resultado |
|---|---|---|
| WER (Whisper large-v3, tr) | Test, mismo dominio, held-out, 20 clips | 1.3 % |
| WER (Whisper large-v3, tr) | Grabaciones originales (referencia), 20 clips | 0.0 % |
| WER (Whisper large-v3, tr) | Frases nuevas no vistas en ningún split, 8 × 2 voces | 12.7 % |
| Ratio de duración | no disponible (valor reportado: 0.95) | 0.95 |
| Mel DTW | no disponible | 0.69 |

El propio autor advierte que estos conjuntos son pequeños y deben leerse como comprobación de cordura, no como evaluación absoluta. La diferencia entre el 1.3 % del mismo dominio y el 12.7 % en frases nuevas es la señal más relevante para estimar el comportamiento en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos ONNX ocupan 20.4 MB y el modelo tiene 4.5M parámetros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU. El entrenamiento se realizó en una NVIDIA L4; para inferencia basta CPU o la GPU integrada del dispositivo.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) y también en navegadores mediante WebAssembly.
- Opciones de despliegue: ONNX Runtime (incluido WebAssembly en navegador), PyTorch mediante el paquete `zerre-tts` y el script `zerre.infer`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El ratio de duración reportado (0.95) sugiere que el audio generado dura aproximadamente lo mismo que el tiempo de inferencia en el entorno de prueba, aunque no se especifica el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño de distribución | WER en turco | Licencia |
|---|---:|---:|---:|---|
| zerre-tts (este) | 4.5M | 20.4 MB | 1.3 % (20 clips) | Apache-2.0 |
| okur-tts | 9.8M | ~23 MB ONNX | 1.81 % (495 frases) | Apache-2.0 |
| Piper tr_TR-dfki | ~16M | ~63 MB | 3.14 % | CC BY-NC-SA |
| Meta MMS-TTS | 36M | ~145 MB | 5.74 % | CC BY-NC |
| XTTS-v2 | 467M | ~2 GB | no disponible | CPML (no comercial) |

Los datos de la tabla proceden de la model card del autor. Conviene señalar que las cifras de WER no son directamente comparables entre sí: zerre-tts se evalúa sobre 20 clips, mientras que okur-tts lo hace sobre 495 frases. La licencia Apache-2.0 de zerre-tts y okur-tts permite uso comercial, a diferencia de Piper tr_TR-dfki, MMS-TTS y XTTS-v2, cuyas licencias son no comerciales.

## Limitaciones y advertencias

- Solo dos voces fijas (MK y NK); no hay clonación de voz ni selección de hablantes adicionales.
- No soporta streaming; la inferencia es por frase completa.
- El modelo fue entrenado con tono de lectura de audiolibros, por lo que la prosodia de preguntas y exclamaciones es limitada.
- Los nombres extranjeros y las abreviaturas se pronuncian mal con frecuencia.
- Posibles errores de OCR en los textos de origen que podrían haberse propagado a las etiquetas de entrenamiento.
- El WER del 12.7 % en frases nuevas no vistas sugiere una generalización limitada fuera del dominio de entrenamiento; el 1.3 % del conjunto de test debe interpretarse con cautela por el tamaño reducido de la muestra (20 clips).
- El corpus de entrenamiento es de 11.93 horas, muy inferior al de modelos comerciales, lo que restringe la variedad de estilos y acentos.
- La conversión de texto a fonemas es externa al modelo y depende de eSpeak NG o del conversor de la demo; su calidad afecta directamente al resultado final.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo no incluye garantías y el autor no reporta auditorías de sesgo ni evaluaciones de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erkint/zerre-tts
- Demo en navegador: https://erkinemreta1.github.io/zerre-tts/
- Código y receta de entrenamiento: https://github.com/erkinemreta1/zerre-tts
- Proyecto tiny-voca (arquitectura base): https://github.com/n4ze3m/tiny-voca
- Corpus de entrenamiento (voz Mazlum Kiper): https://huggingface.co/datasets/omersaidd/tts_mazlum_kiper_tur
- Corpus de entrenamiento (voz Nisan Kumru): https://huggingface.co/datasets/omersaidd/tts_nisan_kumru_tur
