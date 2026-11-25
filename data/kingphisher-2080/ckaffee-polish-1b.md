# kingphisher-2080/ckaffee-polish-1b

## Resumen

ckaffee-polish-1b es un ajuste fino (fine-tune) de google/gemma-3-1b-it orientado a una tarea muy concreta: reescribir dictado de voz en bruto (muletillas, autocorrecciones, divagaciones) y convertirlo en texto limpio, casual o formal, con listas de viñetas opcionales en modo condensado. Lo desarrolla el usuario kingphisher-2080 y esta pensado para integrarse en CKaffeVoice, una aplicacion Android de dictado (build parcheada) que descarga directamente el fichero LiteRT-LM.

El modelo parte de la arquitectura Gemma 3 de 1B parametros de Google y se ha especializado mediante LoRA r32 sobre 2.624 pares sinteticos de dictado/reescritura generados por Qwen 3.5 9B. El resultado se distribuye en dos formatos: un fichero `.litertlm` cuantizado a int4 (bloque 128) que corre en CPU de movil, y el checkpoint Hugging Face en bf16.

Su relevancia es practica: demuestra un caso de uso de IA en el dispositivo (on-device) para postprocesado de dictado, con latencia de 6-8 segundos por mensaje en un Moto G Power 5G 2024 y una tasa de validacion del 99% segun el autor. No es un modelo de proposito general, sino una pieza de pipeline especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), ajuste fino con LoRA r32 fusionado |
| Parametros totales | 1B (heredados de google/gemma-3-1b-it) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 con bloque 128 (fichero LiteRT-LM); bf16 (checkpoint HF) |
| Idiomas soportados | no disponible (la model card no lo especifica; el modelo base Gemma 3 es multilingue) |
| Licencia | Gemma (Gemma Terms of Use y Prohibited Use Policy) |
| Formato de pesos | LiteRT-LM (.litertlm) y safetensors (bf16 en hf-weights/) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de google/gemma-3-1b-it, un transformer decoder-only de la familia Gemma 3. El ajuste se realizo con LoRA de rango 32 sobre 2.624 pares sinteticos de dictado y reescritura generados por Qwen 3.5 9B; los pares que el validador de salida de la app habria rechazado se descartaron antes del entrenamiento. La perdida se calcula unicamente sobre la reescritura, no sobre la transcripcion de entrada, lo que concentra el aprendizaje en la tarea de postprocesado.

La interfaz es deliberadamente compacta: el mensaje de sistema es una etiqueta corta del tipo `dictation: clean condensed+bullets lists` (estilo clean/casual/formal, detalle light/balanced/condensed, `+bullets`, lists/nolists y un `Spell: Name.` opcional), y el turno de usuario va delimitado por `<<<` y `>>>`. La decodificacion es greedy. La innovacion tecnica principal no esta en la arquitectura sino en el empaquetado: el fichero LiteRT-LM int4 permite ejecucion en CPU de dispositivos Android sin GPU dedicada.

## Capacidades

- Reescritura de dictado: elimina muletillas, autocorrecciones y divagaciones, y produce texto limpio.
- Control de estilo: modos clean, casual y formal seleccionables mediante etiqueta de sistema.
- Control de detalle: modos light, balanced y condensed.
- Generacion de listas de viñetas opcional (modo condensed con `+bullets`).
- Correccion ortografica de nombres propios mediante la directiva `Spell: Name.`.
- Ejecucion on-device en CPU Android mediante LiteRT-LM.
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso; el modelo esta especializado en una unica tarea.

## Casos de uso

- Postprocesado de dictado en apps Android: el modelo recibe la transcripcion bruta del reconocedor de voz y devuelve texto limpio; encaja porque el fichero int4 corre en CPU y la app lo descarga directamente.
- Notas rapidas de reunion: el modo condensed con viñetas convierte una divagacion oral en una lista de puntos accionables, util para captura de notas en movilidad.
- Redaccion de mensajes profesionales: el modo formal reescribe un dictado coloquial en un correo o mensaje de trabajo sin muletillas.
- Mensajeria casual: el modo casual mantiene el tono conversacional pero elimina repeticiones y titubeos, adecuado para chats.
- Accesibilidad para usuarios con dificultades motoras: permite dictar sin preocuparse por la pulcritud del habla, ya que el modelo normaliza la salida.
- Transcripcion de nombres propios: la directiva `Spell: Name.` fuerza la grafia correcta de nombres en entornos donde el reconocedor falla, como agendas o CRM.
- Prototipado de pipelines de limpieza de texto en espanol u otros idiomas: sirve como referencia de fine-tune pequeno y desplegable en dispositivo, aunque la cobertura idiomatica no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas operativas: aproximadamente 6-8 segundos por mensaje en un Moto G Power 5G 2024 (CPU) y una tasa de paso del validador del 99%.

## Requisitos de hardware

- VRAM estimada: no aplica para el fichero LiteRT-LM int4, que corre en CPU; el checkpoint bf16 de 1B requiere aproximadamente 2-2,5 GB de memoria para inferencia.
- GPU recomendadas: no documentadas; el despliegue objetivo es CPU Android.
- Cabe en GPU consumer: el checkpoint bf16 de 1B cabe en cualquier GPU con 4 GB o mas de VRAM (por ejemplo, RTX 3050 en adelante); el fichero int4 esta pensado para CPU.
- Opciones de despliegue: LiteRT-LM (Android, CPU); el checkpoint safetensors puede cargarse con frameworks compatibles con Gemma 3 (transformers, llama.cpp si se convierte a GGUF, aunque no se documenta).
- Latencia y throughput: 6-8 s por mensaje en Moto G Power 5G 2024 (CPU), segun el autor; sin datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ckaffee-polish-1b | 1B | no disponible | Reescritura de dictado, on-device | Gemma | Hugging Face (LiteRT-LM y safetensors) |
| google/gemma-3-1b-it | 1B | no disponible | Proposito general, instrucciones | Gemma | Hugging Face |
| Qwen 3.5 9B | 9B | no disponible | Generacion general (usado como generador de datos) | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estos modelos en la tarea de reescritura de dictado.

## Limitaciones y advertencias

- El modo condensed puede omitir elementos menores en divagaciones largas, segun reconoce el propio autor.
- La cobertura de idiomas no esta documentada; el ajuste se realizo sobre pares sinteticos sin idioma especificado, por lo que el rendimiento fuera del idioma de entrenamiento es incierto.
- Riesgo de alucinacion inherente a un modelo de 1B: puede introducir contenido no presente en la transcripcion original.
- La licencia Gemma impone las Gemma Terms of Use y la Gemma Prohibited Use Policy; es un modelo modificado de google/gemma-3-1b-it y su uso comercial esta sujeto a dichos terminos.
- El modelo esta disenado para la app CKaffeVoice (build parcheada); su uso fuera de ese pipeline no esta validado.
- Sin descargas ni likes en el momento de la consulta, y sin pipeline declarado en Hugging Face; la madurez y el soporte de la comunidad son limitados.
- La fecha de creacion del repositorio (2026-11-25) y la referencia a Qwen 3.5 9B como generador de datos deben tratarse con cautela, ya que no se han podido verificar de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kingphisher-2080/ckaffee-polish-1b
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
