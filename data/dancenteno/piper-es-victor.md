# Dancenteno/piper-es-victor

## Resumen

Piper es-victor es una voz de síntesis de habla (TTS) en español peninsular para el motor Piper, distribuida en formato ONNX. La desarrolla el usuario Dancenteno a partir de un ajuste fino de la voz base `es_ES-davefx-medium` de `rhasspy/piper-checkpoints`, y se publica bajo licencia CC0 1.0, lo que la libera al dominio público sin restricciones de uso comercial.

El modelo resuelve la generación de audio hablado a partir de texto en español con un coste computacional muy bajo: el archivo de pesos ocupa 63,5 MB y está pensado para inferencia en CPU o GPUs modestas. Su relevancia radica en la licencia permisiva y en la trazabilidad del corpus de entrenamiento, grabaciones de dominio público de LibriVox leídas por Victor Villarraza.

Se trata de un modelo de tamaño "medium" dentro de la familia Piper, entrenado con aproximadamente 50 minutos de audio seleccionado de 14 capítulos de un audiolibro. No es un modelo de lenguaje general ni soporta razonamiento, tool calling ni otras capacidades más allá de la conversión texto a voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (modelo acústico de Piper), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS por frase; sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos ONNX de 63,5 MB, sin variantes publicadas) |
| Idiomas soportados | español (es, variante es_ES) |
| Licencia | CC0 1.0 (dominio público) |
| Formato de pesos | ONNX (`es_ES-victor-mejor_mos-medium.onnx`) + JSON de configuración |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de las voces Piper, basada en VITS (Variational Inference for Text-to-Speech) con un codificador de texto, un predictor de duración y un decodificador acústico que genera formas de onda a 22.050 Hz. El resultado se exporta a ONNX para permitir inferencia ligera sin framework de deep learning completo, a través de `piper1-gpl`.

El entrenamiento partió de la voz `es_ES-davefx-medium` (CC0) y aplicó fine-tuning sobre frases de 5 a 12 segundos extraídas de 14 capítulos del audiolibro *Veinte mil leguas de viaje submarino* de Julio Verne, en traducción de Vicente Guimerá y leído por Victor Villarraza para LibriVox. Los textos se obtuvieron mediante transcripción automática con Whisper. Se entrenaron 900 épocas con `batch_size` 16 y frecuencia de muestreo de 22.050 Hz; el checkpoint publicado corresponde al mejor `val_mos` (2,2917, época 899). No se documenta el uso de RLHF ni de técnicas de alineación adicionales.

## Capacidades

- Síntesis de voz a partir de texto en español peninsular, con salida WAV a 22.050 Hz.
- Pronunciación razonable de texto con tildes y eñes; el autor advierte que sin diacríticos la pronunciación empeora.
- Gestión de frases de longitud moderada; el propio autor señala posibles fallos en palabras raras o frases muy largas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada al español; no se documentan otras lenguas.
- No incluye control de emociones, estilo ni clonación de voz más allá de la voz fija entrenada.

## Casos de uso

- Lectura de artículos y boletines en aplicaciones de accesibilidad: el modelo convierte texto plano en audio en CPU, lo que permite integrarlo en lectores de pantalla o servicios de lectura por voz sin GPU dedicada.
- Generación de avisos y locuciones para sistemas de megafonía o domótica: al ser un modelo ONNX de 63,5 MB, puede ejecutarse en dispositivos de borde (Raspberry Pi, mini-PC) y sintetizar mensajes cortos en tiempo real.
- Audiolibros y pódcast automatizados: para textos largos se trocea el contenido en frases y se sintetiza secuencialmente; la licencia CC0 permite su uso comercial sin atribución obligatoria.
- Asistentes de voz embebidos en aplicaciones móviles o de escritorio: la inferencia ligera y el formato ONNX facilitan el despliegue local sin depender de APIs en la nube.
- Prototipado de interfaces conversacionales: permite validar flujos de voz en español sin coste de licencia ni de infraestructura, sustituyendo después por una voz de mayor calidad si hace falta.
- Generación de contenido educativo o de divulgación: narración de materiales didácticos en español con una voz neutra y comprensible, siempre que se normalicen números y abreviaturas antes de la síntesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación es el `val_mos` de 2,2917 registrado en la época 899 durante el entrenamiento, que corresponde a una métrica interna de calidad percibida y no es directamente comparable con evaluaciones MOS de otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para ejecutarse en CPU y el archivo ONNX de 63,5 MB cabe holgadamente en memoria RAM convencional.
- GPU recomendadas: no se requieren; cualquier GPU con soporte ONNX Runtime puede acelerar la inferencia, pero no es un requisito.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer (incluso integradas) por el reducido tamaño del modelo; también en CPU sin GPU.
- Opciones de despliegue: `piper1-gpl` (CLI `python3 -m piper`), ONNX Runtime y envoltorios comunitarios de Piper; no se documenta soporte nativo en vLLM, TGI ni llama.cpp, que no están orientados a TTS.
- Latencia y throughput estimados: no disponible; el autor no publica cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Dancenteno/piper-es-victor | TTS Piper (VITS/ONNX) | es_ES | 63,5 MB | CC0 1.0 | Fine-tuning de davefx-medium con audio de LibriVox |
| es_ES-davefx-medium (rhasspy) | TTS Piper (VITS/ONNX) | es_ES | no disponible | CC0 | Voz base sobre la que se ajusta este modelo |
| Otras voces Piper es_ES | TTS Piper (VITS/ONNX) | es_ES | variable | habitualmente CC0 o permisiva | Familia de voces con arquitectura y formato equivalentes |

No se dispone de datos de benchmarks comparativos entre estas voces en la información proporcionada.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (unos 50 minutos estimados), lo que aumenta el riesgo de errores en palabras poco frecuentes y en frases largas.
- Requiere texto con tildes y eñes; sin diacríticos la pronunciación se degrada de forma notable.
- No normaliza números, símbolos ni abreviaturas; es necesario expandirlos a palabras antes de la síntesis.
- No se documentan sesgos específicos, pero al derivar de una única voz masculina y de un audiolibro literario, el registro y el timbre quedan fijados a esa fuente.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir pronunciaciones inventadas o artefactos en entradas atípicas.
- La licencia CC0 1.0 permite uso comercial sin restricciones; el autor agradece, sin obligar, el crédito a Victor Villarraza y a LibriVox.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia pública de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dancenteno/piper-es-victor
- Repositorio de Piper: https://github.com/OHF-voice/piper1-gpl
- Checkpoints base de Piper: https://huggingface.co/rhasspy/piper-checkpoints
- Audiolibro de origen en Internet Archive: https://archive.org/details/20000leguas_1602_librivox
