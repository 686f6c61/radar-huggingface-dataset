# ayousanz/tiny-voca-ja-tsukuyomi-chan

## Resumen

Tiny Voca Japanese P1 (つくよみちゃん) es un modelo de síntesis de voz (text-to-speech) en japonés, de un solo hablante, desarrollado por el usuario ayousanz como un ajuste fino del modelo inglés `n4ze3m/tiny-voca`. El modelo toma su voz del corpus libre «Tsukuyomi-chan Corpus» (CV. Rei Yumesaki) y está pensado para ejecutarse íntegramente en CPU, sin necesidad de GPU ni de claves de API. Con tan solo 4.589.131 parámetros y una frecuencia de muestreo de 24 kHz, se posiciona como una alternativa extremadamente ligera frente a sistemas TTS neuronales convencionales.

La arquitectura no es un transformer generativo de texto, sino un pipeline acústico específico para TTS: convierte fonemas en duraciones, luego en prosodia (pitch, acento) y finalmente genera la señal de audio mediante un modelo source-filter. El frontend lingüístico emplea `pyopenjtalk-plus` 0.4.1.post10 para el G2P (grafema a fonema) en japonés, con 49 símbolos fonéticos y etiquetas HTS A1/A2/A3 más fronteras de frase acentual.

Su relevancia actual radica en que demuestra que es posible obtener TTS japonés de calidad razonable con un modelo de menos de 5 millones de parámetros que corre en tiempo real en CPU (RTF mediano de 0.0208 en PyTorch y 0.0341 en ONNX), lo que lo hace viable para aplicaciones de escritorio, prototipos y entornos sin aceleración hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS fonema → duración → prosodia → generación source-filter |
| Parámetros totales | 4.589.131 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantización | No disponible (se distribuyen pesos PyTorch y ONNX en precisión original) |
| Idiomas soportados | Japonés (ja) |
| Licencia | `tsukuyomi-chan-corpus` (licencia propia del corpus, distinta de Apache-2.0 del código) |
| Formato de pesos | PyTorch (`inference.pt`, 18,4 MB) y ONNX (`model.onnx` + `model.duration.onnx` + `model.weights.bin` + `model.json`, 21,88 MB en total) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de TTS en cascada compuesta por cuatro etapas: conversión de fonemas a duraciones, modelado de prosodia (pitch y acento), y generación de audio mediante un esquema source-filter. El componente de prosodia, que es el que se ajustó en la fase final, contiene 795.203 parámetros. La entrada lingüística se construye con `pyopenjtalk-plus` 0.4.1.post10, con diccionario y lock fijados por hash, generando 49 símbolos fonéticos junto con etiquetas HTS A1/A2/A3 y fronteras de frase acentual como condicionamiento.

El entrenamiento se realizó en dos fases sobre el Tsukuyomi-chan Corpus Vol.1 (77 muestras de entrenamiento y 9 de validación): primero una fase C2 con alineamiento corregido y condiciones japonesas inicializadas a cero durante 6.000 pasos, y después una fase P1 en la que solo se reentrenó la parte de prosodia (795.203 parámetros) durante 1.000 pasos adicionales con un peso de 2 en la pérdida pitch-delta. El entrenamiento se llevó a cabo en Vast.ai sobre Linux con una RTX 4090 y PyTorch CUDA. El modelo parte de la capa compatible del tiny-voca inglés publicado, pero los fonemas, el hablante y las condiciones de acento japonesas son nuevos. No se empleó RLHF ni DPO; es un ajuste supervisado sobre corpus de voz.

## Capacidades

- Síntesis de voz en japonés a 24 kHz, mono, de un único hablante (Tsukuyomi-chan, CV. Rei Yumesaki).
- Generación de audio a partir de texto plano con prosodia y acento japonés modelados explícitamente.
- Ejecución en CPU con dos backends intercambiables: PyTorch y ONNX Runtime.
- Interfaz web local incluida en el paquete para Windows: entrada de texto, generación, reproducción y guardado en WAV.
- CLI (`Speak.ps1`) para generar WAV desde línea de comandos con selección de backend.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada al japonés; no se documenta soporte de otros idiomas.

## Casos de uso

- Síntesis de voz para aplicaciones de escritorio en Windows: el paquete incluye un ZIP con script de arranque (`Start-TTS.cmd`) que levanta una interfaz web local; resulta adecuado porque no requiere GPU, API keys ni conexión a servicios externos.
- Generación de avisos y locuciones pregrabadas: con un RTF de 0.0208 en PyTorch, un texto de 10 segundos de audio se genera en aproximadamente 0,2 segundos de CPU, lo que permite producir lotes de locuciones en pipelines por lotes.
- Prototipado de asistentes conversacionales en japonés: al ser un modelo de 4,59 M de parámetros y 18,4 MB, se puede integrar en aplicaciones embebidas o de escritorio con requisitos de memoria muy bajos (unos 483 MiB de RSS en PyTorch y 322 MiB en ONNX).
- Pruebas de integración continua de pipelines TTS: el binario ONNX de 3,3 MB y el checkpoint PyTorch de 18,4 MB permiten incluirlos en repositorios de test sin inflar el tamaño del proyecto.
- Educación y experimentación con arquitecturas TTS: al ser un modelo pequeño con código y registros de entrenamiento publicados en GitHub, sirve para estudiar el pipeline fonema → duración → prosodia → audio en un caso real.
- Generación de audio para contenido de personaje con licencia libre: el corpus Tsukuyomi-chan permite uso comercial y no comercial con condiciones, lo que facilita su uso en vídeos, podcasts o videojuegos indie que acepten los términos del corpus.
- Evaluación comparativa de backends: permite medir latencia y consumo de memoria entre PyTorch y ONNX Runtime en el mismo hardware para decidir el despliegue.

## Benchmarks y rendimiento

| Implementación | RTF mediano en caliente | RSS del proceso | Activos de inferencia |
|---|---:|---:|---:|
| P1 PyTorch | 0,0208 | ~483 MiB | 18,42 MB |
| P1 ONNX | 0,0341 | ~322 MiB | 21,88 MB / 4 archivos |
| Piper (referencia) | 0,0362 | ~669 MiB | Condiciones de entrenamiento distintas |

| Audio | Errores fonéticos / 698 | PER |
|---|---:|---:|
| Grabación original | 21 | 3,01 % |
| E2 antiguo | 47 | 6,73 % |
| D0 | 40 | 5,73 % |
| P1 PyTorch | 21 | 3,01 % |
| P1 ONNX | 23 | 3,30 % |
| Piper | 82 | 11,75 % |

Mediciones realizadas en Windows, Ryzen 9 5900X, Python 3.12.13, PyTorch 2.15.0+cpu y ONNX Runtime 1.32.0, con CPU a 4 hilos, 50 frases comunes, 3 warm-ups y dos pasadas en orden directo e inverso. El PER se calculó con large-v3 fijo, CUDA int8_float32, comparando etiquetas full-context de pyopenjtalk-plus sin silencios. No se han publicado resultados de MMLU, HumanEval ni GSM8K (no aplican a un modelo TTS).

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; ejecución en CPU con ~322 MiB (ONNX) o ~483 MiB (PyTorch) de RSS.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. El entrenamiento se realizó en RTX 4090, pero la inferencia no la necesita.
- ¿Cabe en GPU de consumo? Sí, pero es innecesario; el modelo está optimizado para CPU.
- Opciones de despliegue: runtime propio con PyTorch (`inference.pt`, cargado con `weights_only=True`) u ONNX Runtime (4 archivos en la misma carpeta). No es compatible con pipelines estándar de Transformers.
- Latencia y throughput: RTF de 0,0208 (PyTorch) y 0,0341 (ONNX) en Ryzen 9 5900X a 4 hilos; el rendimiento en otro hardware puede variar.
- El paquete Windows incluye `uv` para resolver dependencias Python desde un lock fijado; la ejecución es local y sin API keys.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RTF (CPU) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiny Voca Japanese P1 | 4.589.131 | No aplica | 0,0208 (PyTorch) / 0,0341 (ONNX) | tsukuyomi-chan-corpus | Hugging Face + ZIP Windows |
| Piper (referencia en la evaluación) | No disponible | No aplica | 0,0362 | No disponible | No disponible |
| n4ze3m/tiny-voca (base inglesa) | No disponible | No aplica | No disponible | Apache-2.0 (código) | Hugging Face / GitHub |

La comparación con Piper se incluye solo como referencia de rendimiento en la evaluación del autor, con condiciones de entrenamiento distintas. No se dispone de datos de otros modelos TTS japoneses comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de un solo hablante y evaluación a pequeña escala: las 8 frases nuevas de diagnóstico proceden de casos que previamente fallaron en el alineamiento, con abundantes préstamos y nombres propios, por lo que no constituyen una muestra aleatoria.
- Los errores de ASR no equivalen a errores reales del audio: un PER igual al de la grabación original no implica la misma calidad de voz.
- No se han medido MOS, tasa de acierto acentual general en japonés ni naturalidad con múltiples evaluadores.
- Existen fonemas no soportados y limitaciones en la división de textos largos; conviene revisar las salidas según el uso previsto.
- La licencia `tsukuyomi-chan-corpus` impone restricciones específicas: prohíbe usar el audio generado para criticar o atacar a personas, para llamar a apoyar o rechazar posiciones políticas, religiosas o ideológicas concretas, para publicar contenido explícito sin zonificación, o para permitir la reutilización por terceros como material. El uso comercial y no comercial está permitido bajo estas condiciones y las oficiales del corpus.
- El crédito es opcional; el autor sugiere «Tiny Voca Japanese P1：つくよみちゃん».
- Las modificaciones y redistribuciones deben obligar a los usuarios a cumplir las condiciones oficiales del corpus y conservar este aviso y estas condiciones.
- El modelo no es compatible con pipelines estándar de Transformers; requiere su runtime propio.
- La ejecución ONNX Runtime Web / WASM en navegador no está verificada para esta versión japonesa.
- El SHA256 de los pesos publicados es `9a3f0abe27054378151b750e593f27d5d8c8718e1f22db7145e93772ce550877`.
- El juicio automático original se mantiene en «reject» pese a la validación manual posterior con «pass»; el autor documenta esta discrepancia en EVALUATION.json.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ayousanz/tiny-voca-ja-tsukuyomi-chan
- Corpus Tsukuyomi-chan: https://tyc.rei-yumesaki.net/material/corpus/
- Condiciones del corpus: https://tyc.rei-yumesaki.net/material/corpus/#terms3
- Licencia de personaje: https://tyc.rei-yumesaki.net/about/terms/
- Condición de licencia (sección 3): https://tyc.rei-yumesaki.net/about/terms/#condition3
- Repositorio del autor (rama research/japanese-tts): https://github.com/ayutaz/tiny-voca/tree/research/japanese-tts
- Implementación y modelo inglés original: https://github.com/n4ze3m/tiny-voca
- pyopenjtalk-plus: https://github.com/tsukumijima/pyopenjtalk-plus
