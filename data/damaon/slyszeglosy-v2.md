# Damaon/slyszeglosy-v2

## Resumen

Slyszeglosy-v2 (słyszę głosy V2) es un modelo de síntesis de voz (TTS) en polaco desarrollado por Damaon. Se trata de un modelo extremadamente compacto: 4.533.067 parámetros en total, incluyendo el generador de onda, entrenado desde cero sobre 20,7 horas de audio de un único hablante real (el locutor `MC` del dataset MC Speech). El modelo resuelve el problema de la síntesis de voz polaca de alta velocidad en hardware modesto: según el autor, en cuatro hilos de CPU funciona aproximadamente 150 veces más rápido que el tiempo real.

La relevancia de este modelo radica en su enfoque de arquitectura ligera sin vocoder neuronal: emplea un sintetizador fuente-filtro con filtros cepstrales, lo que reduce drásticamente los requisitos de cómputo frente a los sistemas TTS neuronales convencionales. La versión V2 introduce una mejora de síntesis llamada "przydech" (aspiración) que sustituye el 35% de la fuente sonora por ruido de la misma envolvente por encima de 1 kHz, mejorando la naturalidad de las armónicas.

El modelo se distribuye con pesos en PyTorch (float32) y exportación ONNX (opset 17), con licencia Apache-2.0 tanto para pesos como para código, lo que permite uso comercial. Está diseñado exclusivamente para polaco y una única voz, y el texto se convierte a fonemas mediante reglas propias sin diccionario externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny-voca: encoder transformer (4 bloques) + predictor de duración + dos transformers de frame (2 y 5 bloques) + sintetizador fuente-filtro cepstral |
| Parametros totales | 4.533.067 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (por utterance: hasta 512 fonemas y 32 s) |
| Tipos de cuantizacion | no disponible (pesos float32 en PyTorch y ONNX) |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache-2.0 (pesos y código) |
| Formato de pesos | PyTorch (.pt, float32) y ONNX (.onnx, float32, opset 17) |

## Arquitectura y entrenamiento

La arquitectura tiny-voca consta de un encoder transformer de 4 bloques que procesa fonemas con información de acento; un predictor de duración que asigna a cada fonema un número de frames; dos transformers de frame (de 2 y 5 bloques) que predicen tono (pitch), sonoridad (voicing) y energía; y finalmente un sintetizador fuente-filtro que genera la onda a partir de un tren de impulsos y ruido moldeados por filtros cepstrales, sin vocoder neuronal. El modelo usa 192 canales, 4 cabezas de atención, RoPE y un frame de 256 muestras (10,7 ms) a 24 kHz mono. El diccionario contiene 56 símbolos: 39 fonemas polacos (8 vocales incluyendo nasales `ɛ̃ ɔ̃`, 31 consonantes), símbolos especiales y puntuación.

El entrenamiento se realizó desde cero durante 104.000 pasos en una única GPU de 24 GB durante 9 horas, con termostato de GPU a 76 °C. Se usaron pérdidas espectrales multirresolución y, a partir del paso 8.000, pérdida adversarial con discriminadores multiperiodo y multirresolución. Los datos provienen de MC Speech (Mateusz Czyżnikiewicz, CC0): 20.541 grabaciones reales de un locutor, 18,2 h, remuestreadas a 24 kHz, recortadas en silencio y normalizadas en volumen; a ello se añadieron 2.373 grabaciones (2,5 h) de casos difíciles (números, fechas, etc.). En total, 22.914 grabaciones y 20,7 h (validación: 328; test: 264). La novedad de V2 es el parámetro `aspiration` = 0,35 en `config.json`: por encima de 1 kHz, de forma creciente hasta 4 kHz, el 35% de la fuente sonora se sustituye por ruido de la misma envolvente, lo que alinea la aperiocidad de la voz (WORLD D4C) con las grabaciones del locutor en todas las bandas. Es un ajuste de síntesis, no requiere reentrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) en polaco con una única voz masculina real (`MC`).
- Salida de audio a 24 kHz mono.
- Normalización de texto integrada: expande números, fechas, horas, importes, porcentajes, unidades, números de teléfono, abreviaturas y siglas mediante `wymowa.normalize`.
- Fonemización por reglas sin diccionario externo (`tiny_voca.text.phonemize`).
- Lectura de texto de longitud arbitraria: procesa oración por oración y concatena los audios.
- Control de parámetros de síntesis: velocidad (`--speed`), desplazamiento de tono (`--pitch-shift`, 0,058 ≈ medio tono) y rango de tono (`--pitch-range`).
- Ejecución en CPU: aproximadamente 150× más rápido que tiempo real en cuatro hilos.
- Exportación ONNX compatible con onnxruntime y onnxruntime-web (demo en el directorio `web/` del repositorio).
- No soporta tool calling, agentes, visión, audio de entrada ni modo thinking; es exclusivamente TTS.

## Casos de uso

- Lectura de textos largos en polaco: el modelo procesa el texto oración por oración y concatena los fragmentos, lo que permite narrar documentos, artículos o libros completos sin límite de longitud de entrada.
- Sistemas de accesibilidad para personas con discapacidad visual: al ejecutarse en CPU a 150× tiempo real, puede integrarse en lectores de pantalla locales sin GPU ni conexión a internet.
- Asistentes de voz embebidos en dispositivos de bajo consumo: sus 4,5 M de parámetros y su exportación ONNX permiten desplegarlo en navegador (onnxruntime-web) o en hardware limitado.
- Anuncios y avisos automatizados en polaco: la normalización integrada de horas, fechas y números de teléfono lo hace adecuado para mensajes como "el tren llega a las 15:30 al andén 4".
- Generación de audiolibros y pódcasts con voz consistente: al disponer de una única voz real de locutor, garantiza uniformidad tímbrica en producciones largas.
- Pruebas y prototipado de pipelines TTS: su licencia Apache-2.0 y su reducido tamaño facilitan la integración en CI/CD y la experimentación sin costes de licencia.
- Sistemas de megafonía o telefonía con requisitos de latencia: la velocidad de inferencia en CPU permite generar respuestas de voz en tiempo real en servidores sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una métrica de velocidad: aproximadamente 150× más rápido que el tiempo real en cuatro hilos de CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para CPU y no requiere GPU.
- GPU recomendadas: no disponible; el autor no especifica requisitos de GPU. El entrenamiento se realizó en una GPU de 24 GB.
- Cabe en GPU consumer: sí, por tamaño (4,5 M de parámetros, 18,2 MB en float32 PyTorch y 22,4 MB en ONNX), aunque no se documentan requisitos específicos.
- Opciones de despliegue: PyTorch (`tiny_voca.infer`), ONNX Runtime y ONNX Runtime Web (navegador).
- Latencia y throughput: aproximadamente 150× tiempo real en cuatro hilos de CPU según el autor; no se proporcionan cifras absolutas de latencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos TTS comparables (parámetros, contexto, rendimiento o licencia) que permitan una comparación rigurosa. Como referencia interna, el propio autor menciona la versión anterior `Damaon/slyszeglosy` (dos voces sintéticas, licencia CC-BY-NC), pero no se aportan especificaciones detalladas de la misma.

## Limitaciones y advertencias

- El modelo solo sintetiza polaco; no soporta otros idiomas.
- Dispone de una única voz (`MC`), sin posibilidad de seleccionar hablantes alternativos.
- La fonemización se basa en reglas sin diccionario externo, por lo que palabras irregulares o extranjerismos pueden pronunciarse incorrectamente.
- En ONNX, cada llamada procesa una sola utterance de hasta 512 fonemas y 32 s; el texto debe terminar en signo de puntuación.
- No se han publicado evaluaciones subjetivas (MOS) ni benchmarks objetivos en la información disponible, por lo que la calidad percibida no está cuantificada.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir pronunciaciones erróneas o prosodia inadecuada en textos complejos.
- Sesgos: al entrenarse con un único locutor real, la voz refleja las características de ese hablante; no se documentan sesgos adicionales.
- Licencia Apache-2.0 permite uso comercial con conservación del aviso de licencia y atribución a los autores.
- El repositorio indica un tamaño de 0,0 GB y cero descargas en el momento de la consulta; el modelo es muy reciente y no cuenta aún con validación de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Damaon/slyszeglosy-v2
- Repositorio de código: https://github.com/damaon/slyszeglosy
- Versión anterior: https://huggingface.co/Damaon/slyszeglosy
- Dataset MC Speech: https://huggingface.co/datasets/czyzi0/the-mc-speech-dataset
- Muestras de audio: https://huggingface.co/Damaon/slyszeglosy-v2/resolve/main/samples/lokomotywa-MC.wav
