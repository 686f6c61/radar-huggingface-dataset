# Messam174/tiny-voca-arabic-TTS-saudi

## Resumen

tiny-voca-arabic-TTS-saudi es un modelo de síntesis de voz (text-to-speech) para árabe, especializado en la variante saudí y en una única voz masculina. Lo desarrolla Messam174 como un ajuste fino (fine-tuning) de oddadmix/tiny-voca-arabic, que a su vez deriva del modelo original tiny-voca de Muhammed Nazeem (@n4ze3m). El modelo resuelve la conversión de texto árabe a audio de 24 kHz en mono directamente en CPU, sin necesidad de un vocoder separado, lo que lo hace especialmente atractivo para despliegues ligeros.

Con tan solo 4,5 millones de parámetros (18 MB en PyTorch, 21 MB en ONNX), el modelo se posiciona como una alternativa ultraligera frente a los grandes sistemas TTS neuronales. El ajuste se realizó sobre aproximadamente 2,9 horas de audio de un único hablante saudí, partiendo de 4,57 horas que quedaron reducidas tras el control de calidad de alineamiento. La arquitectura, el sintetizador y el código de entrenamiento no se modificaron respecto al modelo base.

Su relevancia actual radica en la combinación de tamaño reducido, licencia Apache 2.0 y ejecución eficiente en CPU: el modelo por sí solo corre a unas 152 veces el tiempo real en 4 hilos de CPU, y el pipeline completo (incluyendo el diacritizador CATT) alcanza un RTF de 0,092, es decir, unas 11 veces el tiempo real. Esto lo convierte en una opción práctica para aplicaciones de voz embebidas o de bajo coste en árabe saudí.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo acústico con sintetizador source-filter (basado en tiny-voca) |
| Parámetros totales | 4.531.723 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | ONNX (modelo exportado); no se detallan otras cuantizaciones |
| Idiomas soportados | Árabe (variante saudí/gulf) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) y ONNX (.onnx) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de tiny-voca: un modelo acústico que predice duraciones, pausas, tono (pitch), sonoridad y energía, combinado con un sintetizador source-filter que genera la forma de onda final a 24 kHz en mono. No requiere un vocoder separado, lo que simplifica el despliegue. El frontend de texto incluye conversión de números a palabras, diacritización mediante CATT, y un conversor basado en reglas que produce fonemas (49 símbolos) heredado de tiny-voca-arabic.

El ajuste fino se realizó sobre 2.673 enunciados (2,86 horas tras control de calidad, partiendo de 4.286 clips y 4,57 horas) de un único hablante saudí masculino (identificador `a000`, F0 mediana ≈ 96 Hz). El entrenamiento avanzó de 104.000 a 119.000 pasos, con entrenamiento GAN a partir del paso 107.000, usando una sola RTX 3060. Se incorporaron dos innovaciones destacables: la lectura saudí (`text.colloquial`, `case_endings=False`), que elimina las terminaciones de caso y el tanween tal como los pronuncia un hablante saudí, y un suavizado de pitch (`pitch_smooth`) que aplica una media de Hann sobre los frames sonoros, reduciendo los saltos de más de un semitono del 7,5% al 0,35% de los frames. Además, se añade un filtro de reducción de ruido estacionario (`noisereduce`, 0,75) para eliminar el siseo de 6–12 kHz que el modelo aprendió de las grabaciones originales.

## Capacidades

- Síntesis de voz (text-to-speech) en árabe saudí con una voz masculina concreta.
- Generación de audio a 24 kHz en mono directamente en CPU, sin vocoder externo.
- Conversión de números a palabras en árabe (por ejemplo, 602 → ستمائة واثنان).
- Diacritización automática del texto mediante CATT.
- Lectura coloquial saudí con eliminación opcional de terminaciones de caso e إعراب.
- Control de parámetros de síntesis: velocidad (`speed`), desplazamiento de tono (`pitch_shift` en semitonos), rango de tono (`pitch_range`) y semilla (`seed`).
- Suavizado de pitch integrado en la ruta PyTorch para reducir la inestabilidad del contorno tonal.
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente texto a voz.

## Casos de uso

- Asistentes de voz para atención al cliente en árabe saudí: el modelo puede generar respuestas habladas con una voz natural y ligera en CPU, adecuada para integraciones telefónicas o chatbots de bajo coste que requieran una voz local.
- Sistemas de anuncios y megafonía en entornos físicos: gracias a su ejecución en CPU y su reducido tamaño (21 MB en ONNX), puede desplegarse en dispositivos embebidos o Raspberry Pi para leer mensajes dinámicos en árabe.
- Accesibilidad y lectura de textos: conversión de documentos o notificaciones a audio para usuarios con discapacidad visual, con la ventaja de que la lectura coloquial saudí resulta más natural para el público local.
- Pruebas de concepto y prototipado rápido: al ser un modelo de 4,5M de parámetros con licencia Apache 2.0, permite iterar rápidamente en la generación de muestras de voz sin infraestructura GPU.
- Localización de contenidos: generación de pistas de voz en árabe saudí para vídeos, tutoriales o audiolibros de forma automatizada y con un coste computacional mínimo.
- Investigación en TTS de bajos recursos: sirve como base para experimentos de fine-tuning con nuevas voces o variantes dialectales, dado que el código de entrenamiento e inferencia está incluido y la arquitectura es sencilla.
- Integración en pipelines de CI/CD para pruebas de regresión de audio: su rapidez (152× tiempo real en 4 hilos) permite generar muestras de referencia en tests automatizados sin ralentizar el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo está diseñado para CPU.
- GPU recomendadas: no aplica; el entrenamiento se realizó en una RTX 3060, pero la inferencia está optimizada para CPU.
- Cabe en cualquier CPU consumer: el modelo ONNX ocupa 21 MB y el PyTorch 18 MB.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider), PyTorch con las dependencias indicadas (torch, soundfile, numpy, onnxruntime, noisereduce, tqdm, huggingface_hub). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: el modelo por sí solo corre a aproximadamente 152× tiempo real en 4 hilos de CPU; el pipeline completo con diacritizador CATT alcanza un RTF de 0,092 (≈11× tiempo real).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| tiny-voca-arabic-TTS-saudi | 4,5M | No disponible | Árabe saudí | Apache 2.0 | PyTorch, ONNX | Voz única masculina saudí, CPU |
| oddadmix/tiny-voca-arabic | No disponible | No disponible | Árabe | No disponible | No disponible | Modelo base del que deriva este fine-tuning |
| n4ze3m/tiny-voca | No disponible | No disponible | No disponible (original) | No disponible | No disponible | Modelo original de tiny-voca |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Una sola voz: el modelo solo reproduce una voz masculina saudí (`a000`); no permite seleccionar otras voces.
- Riesgo de alucinación acústica: como todo modelo generativo, puede producir pronunciaciones incorrectas o artefactos en textos fuera del dominio de entrenamiento.
- Cobertura limitada: entrenado con solo 2,86 horas de audio de un único hablante, por lo que la variedad prosódica y de estilos es reducida.
- Dependencia del diacritizador: la calidad final depende de CATT; errores en la diacritización afectan a la pronunciación.
- El modelo aprendió ruido de las grabaciones originales (siseo de 6–12 kHz), que debe eliminarse con el filtro `noisereduce` para obtener una salida limpia.
- La ruta ONNX no incluye el suavizado de pitch; es necesario aplicar `text.colloquial()` a los fonemas y el filtro de reducción de ruido a la salida para obtener el resultado esperado.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los modelos base (tiny-voca y tiny-voca-arabic) para asegurar el cumplimiento.
- El repositorio tiene muy pocas descargas (5) y ningún "like", lo que sugiere que no ha sido ampliamente validado por la comunidad.

## Enlaces

- [Hugging Face: Messam174/tiny-voca-arabic-TTS-saudi](https://huggingface.co/Messam174/tiny-voca-arabic-TTS-saudi)
- [Modelo base: oddadmix/tiny-voca-arabic](https://huggingface.co/oddadmix/tiny-voca-arabic)
- [Modelo original: n4ze3m/tiny-voca](https://huggingface.co/n4ze3m/tiny-voca)
- [Repositorio CATT (diacritizador)](https://github.com/abjadai/catt)
