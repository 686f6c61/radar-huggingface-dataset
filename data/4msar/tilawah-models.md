# 4msar/tilawah-models

## Resumen

Tilawah Models es un repositorio de artefactos ONNX publicado por el usuario 4msar que empaqueta dos modelos de reconocimiento automático de voz (ASR) en arabe especializados en la recitacion del Coran. No se trata de un modelo entrenado desde cero, sino de una redistribucion de los pesos ya convertidos a ONNX de Hisnlabs/tajweed-v2 (modelo CTC de fonemas para la evaluacion de reglas de tajwid) y de tarteel-ai/whisper-base-ar-quran (Whisper base ajustado para transcribir palabras del Coran). El repositorio existe para que la aplicacion Tilawah Coach descargue estos ficheros en tiempo de ejecucion desde una unica ubicacion.

El interes tecnico esta en la combinacion: un modelo acustico ligero (23 MB en int8) que emite log-probabilidades CTC sobre 43 fonemas y alimenta un motor de reglas de tajwid, junto con un Whisper base cuantizado (22 MB de encoder y 76 MB de decoder con KV cache) que produce la transcripcion a nivel de palabra. Ambos estan pensados para inferencia en el navegador mediante transformers.js, lo que reduce la barrera de despliegue para aplicaciones educativas.

La relevancia es de nicho pero clara: ofrece una via practica y de bajo coste computacional para construir herramientas de correccion de recitacion coranica con retroalimentacion a nivel de palabra y de regla, con licencia Apache-2.0 y sin dependencia de infraestructura GPU en servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) para ASR; modelo CTC de fonemas sobre features mel para tajwid |
| Parametros totales | no disponible (repo de 0,2 GB; ficheros individuales de 23 MB, 22 MB y 76 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 s de audio por ventana en el modelo Whisper; el modelo de tajwid procesa hasta 3000 frames mel (sin padding de 30 s) |
| Tipos de cuantizacion | int8 (tajweed, `model-int8.onnx`); QUInt8 con `quantize_dynamic` en pesos y subgrafos (whisper-quran) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (int8 / QUInt8); layout transformers.js para whisper-quran |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye artefactos de dos proyectos previos. El componente `tajweed/` proviene de Hisnlabs/tajweed-v2 (revision `b3b0503d`) y es un modelo CTC que recibe un tensor `mel` float32 de forma `[batch, 80, frames]` (log-mel de 80 bins, audio mono a 16 kHz, sin padding de 30 s, con `frames` par y como maximo 3000) y un tensor `riwaya` int64 que indexa la lista `config.riwayat` (0 = hafs, con soporte declarado tambien para warsh). La salida son log-probabilidades CTC `[batch, frames/2, 43]`, donde el id 0 es blank y el id k corresponde a `config.phonemes[k-1]`. El modelo escucha la recitacion en escritura fonetica coranica y alimenta un motor de reglas de tajwid.

El componente `whisper-quran/` es tarteel-ai/whisper-base-ar-quran exportado con optimum `main_export` (tarea `automatic-speech-recognition-with-past`) y posteriormente cuantizado con `quantize_dynamic` de onnxruntime. Se carga con transformers.js usando `dtype: "q8"`. Procesa ventanas de 30 s, por lo que recitaciones mas largas deben dividirse en las pausas. No se detallan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en los modelos originales.

## Capacidades

- Reconocimiento automatico de voz en arabe especializado en recitacion coranica.
- Transcripcion a nivel de palabra mediante el modelo Whisper base ajustado.
- Deteccion fonetica CTC sobre 43 fonemas coranicos para la evaluacion de reglas de tajwid.
- Soporte de dos riwayat declaradas en configuracion: hafs (indice 0) y warsh.
- Inferencia en navegador o en Node mediante transformers.js y ONNX Runtime.
- Metricas de validacion reportadas en `config.json`: PER de validacion 2,3 %, PER QDAT 7,0 % y precision de madd del 95,9 % sobre QDAT.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio mas alla del ASR.

## Casos de uso

- Correccion de recitacion ayah por ayah: la aplicacion divide la recitacion en pausas, pasa cada segmento al Whisper base para obtener la transcripcion y compara palabra a palabra con el texto esperado.
- Evaluacion de reglas de tajwid: las log-probabilidades CTC del modelo de fonemas se envuelven en un motor de reglas que senala incumplimientos concretos (por ejemplo, madd) con la precision reportada del 95,9 % en QDAT.
- Aplicacion educativa en navegador: gracias a los pesos cuantizados (23 MB, 22 MB y 76 MB) y a transformers.js, la inferencia puede ejecutarse en el cliente sin enviar audio a un servidor.
- Herramienta de practica personal con retroalimentacion inmediata: el modelo esta disenado para uso individual y autoevaluacion, con la advertencia explicita de confirmar los resultados con un profesor.
- Prototipado de pipelines ASR arabe de bajo coste: los ficheros ONNX sirven como base para experimentar con reconocimiento de voz arabe cuantizado en entornos con recursos limitados.
- Investigacion sobre ASR de coran y fonetica arabe: el modelo CTC de fonemas y sus metricas (PER, QDAT) pueden reutilizarse como referencia o punto de partida en estudios comparativos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas del modelo de tajwid recogidas en `config.json`:

| Metrica | Valor |
|---|---|
| PER de validacion | 2,3 % |
| PER QDAT | 7,0 % |
| Precision de madd en QDAT | 95,9 % |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes de ASR como WER sobre otros corpus) en la informacion disponible para el modelo Whisper ni para el conjunto del repositorio.

## Requisitos de hardware

- VRAM estimada: muy baja; los tres ficheros ONNX suman aproximadamente 121 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; el diseno apunta a ejecucion en navegador o CPU, sin requerir A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en cualquier modelo con unos pocos cientos de MB de memoria libre; tambien en CPU.
- Opciones de despliegue: transformers.js con `dtype: "q8"` para el modelo Whisper; ONNX Runtime para el modelo de tajwid; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Tilawah Models (este repo) | no disponible (artefactos de 23, 22 y 76 MB) | 30 s de audio (Whisper); hasta 3000 frames mel (tajwid) | Apache-2.0 | ASR coranico + CTC de fonemas para tajwid, ONNX |
| Hisnlabs/tajweed-v2 | no disponible | no disponible | Apache-2.0 | Modelo CTC de fonemas para reglas de tajwid (origen del componente `tajweed/`) |
| tarteel-ai/whisper-base-ar-quran | Whisper base (tamano no detallado) | 30 s de audio | Apache-2.0 | ASR de arabe coranico (origen del componente `whisper-quran/`) |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo de tajwid no distingue tafkhim ni tarqiq (la letra ر y el lam de «الله»).
- Cada ayah se evalua como una sola respiracion, por lo que una pausa dentro de un ayah puede marcarse como error.
- Los resultados son orientativos para la practica; el propio autor recomienda confirmarlos con un profesor.
- El Whisper base procesa ventanas de 30 s, por lo que recitaciones largas deben segmentarse en las pausas.
- El soporte linguistico se limita al arabe; no hay capacidades multilingues documentadas.
- Riesgo de alucinacion en la transcripcion no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache-2.0 en ambos modelos de origen, lo que permite uso comercial; conviene revisar las model cards de los repositorios originales para condiciones adicionales sobre datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia; no hay evidencia de uso en produccion ni de mantenimiento posterior.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/4msar/tilawah-models
- Modelo base de tajwid: https://huggingface.co/Hisnlabs/tajweed-v2
- Modelo base de ASR: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
