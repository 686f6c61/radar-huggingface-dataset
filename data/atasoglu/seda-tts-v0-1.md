# atasoglu/seda-tts-v0.1

## Resumen
seda-tts-v0.1 es un modelo de síntesis de voz (text-to-speech) en turco, ligero y de baja latencia, desarrollado por el usuario atasoglu. Se trata de un modelo VITS de tamano "medium" (el mismo que usa Piper) con un codificador de texto BERT turco congelado, entrenado desde cero sobre 80 horas de voz sintetica expresiva y exportado a ONNX. Su ejecucion se realiza mediante sedalib con onnxruntime, sin necesidad de PyTorch, lo que simplifica el despliegue.

El modelo resuelve el problema de generar voz turca expresiva en entornos con recursos limitados: funciona en un solo hilo de CPU, empieza a hablar entre 80 y 150 ms despues de recibir el texto y procesa aproximadamente 4,5 veces mas rapido que el tiempo real. Incorpora deteccion automatica de emocion a partir de la frase, permite forzar manualmente una de 8 emociones y ofrece un estilo de susurro independiente con sus propios parametros.

Es relevante ahora por su enfoque practico: un modelo de 19,1M de parametros en el modelo acustico y vocoder (mas 29,3M de BERT congelado) empaquetado en 194 MB de ficheros ONNX fp32, con licencia Apache 2.0 y una voz disenada sinteticamente con VoxCPM2. Esto lo hace apto para integracion en aplicaciones de produccion sin GPU y con requisitos de latencia estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variante Piper "medium") con codificador de texto BERT turco congelado |
| Parametros totales | 19,1M (modelo acustico y vocoder) + 29,3M (BERT congelado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 120 caracteres por fragmento de texto (VITS no es streaming; `stream` decodifica por ventanas) |
| Tipos de cuantizacion | no disponible (ficheros ONNX en fp32, 194 MB) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32) |

## Arquitectura y entrenamiento
La arquitectura es VITS, un modelo end-to-end de sintesis de voz que combina un codificador de texto, un predictor de duracion y un vocoder generativo en un unico sistema. La variante corresponde al tamano "medium" de Piper. El codificador de texto es un BERT turco congelado (29,3M de parametros), mientras que el modelo acustico y el vocoder suman 19,1M de parametros. El modelo se exporta a ONNX para ejecutarse con onnxruntime en CPU.

El entrenamiento se realizo desde cero sobre 80 horas de voz sintetica expresiva, procedente del dataset `atasoglu/turkish-emotional-speech-100h`. Toda la voz de entrenamiento fue generada por IA; la voz del modelo se diseno a partir de una descripcion textual con VoxCPM2. No se especifica en la informacion disponible si hubo RLHF, DPO u otras fases de alineacion. La innovacion tecnica destacable es la deteccion de emocion a partir del texto de entrada, junto con la posibilidad de fijar manualmente la emocion y un estilo de susurro con parametros propios (`noise_scale`, `noise_scale_w`, `length_scale`). La decodificacion por ventanas permite iniciar la reproduccion antes de completar el fragmento: el primer bloque es de 0,28 s de audio y los siguientes de 0,56 s.

## Capacidades
- Sintesis de voz en turco a partir de texto, con salida mono a 22050 Hz en float32 en el rango [-1, 1].
- Deteccion automatica de la emocion de la frase y lectura acorde a ella.
- Seleccion manual de emocion entre 8 opciones; el estilo `whisper` admite `neutral`, `calm`, `sad` y `fearful`.
- Estilo de susurro independiente con parametros de ruido y escala de longitud propios.
- Decodificacion por ventanas mediante `stream`, que permite iniciar la reproduccion antes de terminar el fragmento.
- Ejecucion en un solo hilo de CPU con onnxruntime, sin PyTorch.
- Reproducibilidad: misma configuracion y misma semilla producen el mismo audio.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo TTS.

## Casos de uso
- Lectura de noticias y articulos en turco: el modelo convierte texto en voz con deteccion de emocion, adecuado para boletines donde el tono debe adaptarse al contenido sin intervencion manual.
- Asistentes de voz en dispositivos embebidos: al ejecutarse en un solo hilo de CPU con 80-150 ms hasta el primer audio, encaja en sistemas sin GPU como routers, Raspberry Pi o televisiones inteligentes.
- Audiolibros y contenido narrado: la seleccion manual de emocion y el estilo susurro permiten narrar dialogos y escenas con matices distintos dentro de una misma produccion.
- Accesibilidad para personas con discapacidad visual: lectura de interfaces y documentos en turco con baja latencia y sin dependencia de hardware especializado.
- Videojuegos y experiencias interactivas: la decodificacion por ventanas (`stream`) permite reproducir dialogos generados en tiempo real con arranque inmediato de la reproduccion.
- Sistemas de anuncios y megafonia: sintesis de avisos breves (hasta 120 caracteres por fragmento) con emocion neutra o calmada para entornos publicos.
- Prototipado e investigacion en TTS: al ser Apache 2.0, ONNX y de 194 MB, sirve como base reproducible para experimentos de voz expresiva en turco.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas operativas: primer audio en 80-150 ms, aproximadamente 4,5 veces mas rapido que el tiempo real en un solo hilo de CPU, y bloques de streaming de 0,28 s (primero) y 0,56 s (siguientes).

## Requisitos de hardware
- Inferencia en CPU: disenado para un solo hilo de CPU; no requiere GPU.
- VRAM estimada: no aplica en el caso de uso previsto (CPU); no disponible para despliegue en GPU.
- GPU recomendadas: no disponibles; el modelo esta pensado para onnxruntime en CPU.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,2 GB y los ficheros ONNX fp32 suman 194 MB.
- Opciones de despliegue: sedalib (con onnxruntime) y demo web incluida (`python -m sedalib.demo.tts`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: primer audio en 80-150 ms, aproximadamente 4,5x tiempo real en un hilo de CPU.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de comparaciones publicadas en la informacion proporcionada. Como referencia estructural, el modelo pertenece a la familia Piper "medium" (VITS), por lo que comparte categoria con otros modelos Piper multilingues; sin embargo, no se aportan cifras comparativas de parametros, contexto o rendimiento frente a alternativas concretas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| seda-tts-v0.1 | 19,1M + 29,3M BERT | 120 caracteres por fragmento | Apache 2.0 | ONNX en Hugging Face |
| Alternativas Piper "medium" | no disponible | no disponible | no disponible | no disponible |
| Otros TTS turcos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Solo soporta turco; no hay capacidades multilingues.
- La voz es sintetica y disenada con VoxCPM2; no corresponde a una persona real. Todo el audio generado debe etiquetarse como generado por IA conforme al articulo 50 del Reglamento europeo de IA.
- VITS no es un modelo de streaming nativo: necesita el texto completo del fragmento (hasta 120 caracteres) antes de generar audio; el streaming solo aplica a la decodificacion por ventanas.
- Riesgo de alucinacion o pronunciacion incorrecta en textos con nombres propios, siglas, numeros o terminologia fuera del dominio de entrenamiento.
- Entrenado sobre voz sintetica, lo que puede introducir artefactos o sesgos acusticos propios del generador utilizado.
- No se especifican sesgos demograficos ni de otro tipo en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la obligacion de etiquetado de audio sintetico debe respetarse en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion externa es practicamente inexistente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/atasoglu/seda-tts-v0.1
- Repositorio sedalib: https://github.com/atasoglu/seda
- Dataset de entrenamiento: https://huggingface.co/datasets/atasoglu/turkish-emotional-speech-100h
- Paper VITS (arXiv:2106.06103): https://arxiv.org/abs/2106.06103
- Paper referenciado (arXiv:2307.14134): https://arxiv.org/abs/2307.14134
