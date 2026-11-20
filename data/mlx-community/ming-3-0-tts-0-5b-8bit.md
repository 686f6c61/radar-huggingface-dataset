# mlx-community/Ming-3.0-tts-0.5B-8bit

## Resumen

Ming-3.0-tts-0.5B-8bit es una conversion a formato MLX del modelo de sintesis de voz Ming-3.0-tts-0.5B desarrollado por inclusionAI, empaquetada por la comunidad mlx-community para su ejecucion en hardware Apple Silicon mediante la libreria mlx-audio. Se trata de un modelo denso de text-to-speech construido sobre la base de Qwen2.5-0.5B, orientado a la generacion de audio a 44,1 kHz con clonacion de voz zero-shot, voces integradas y control fino de prosodia.

El modelo resuelve el problema de la sintesis de voz multilingue de calidad en entornos locales sin GPU dedicada: con 1.479.454.868 parametros en safetensors y un peso en disco de 1,5 GB, ofrece un factor de tiempo real de 0,39 y un pico de memoria de 2,2 GB en un Apple M4 Pro, lo que lo hace viable en portatiles. La cuantizacion es de 8 bits afina con tamano de grupo 64, aplicada tambien al VAE de audio, que decodifica a 31 dB de SNR frente a bf16 con latentes identicos.

Su relevancia actual radica en la combinacion de licencia MIT, soporte para siete idiomas (chino, ingles, aleman, espanol, frances, coreano y japones, ademas de sichuanes y cantonés), control de emociones y 14 etiquetas paralinguisticas en linea. Es una opcion atractiva para desarrolladores que necesitan TTS de calidad en aplicaciones locales de macOS con requisitos de privacidad o latencia estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, basada en Qwen2.5-0.5B, con VAE de audio |
| Parametros totales | 1.479.454.868 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afina, group size 64 (incluye VAE de audio) |
| Idiomas soportados | zh, en, de, es, fr, ko, ja (mas sichuanes y cantonés) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es denso y se apoya en la arquitectura Qwen2.5-0.5B como columna vertebral, combinada con un VAE de audio que opera a 44,1 kHz. La conversion a MLX aplica cuantizacion afina de 8 bits con tamano de grupo 64 sobre todos los pesos, incluido el decodificador VAE, manteniendo una fidelidad de reconstruccion de 31 dB de SNR respecto al original en bf16 sobre latentes identicos. El repositorio ocupa 1,6 GB y el modelo en disco 1,5 GB.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card original menciona soporte para clonacion zero-shot, voces integradas, instrucciones libres y de diseno de voz, control de emocion, velocidad, tono y volumen, y 14 etiquetas paralinguisticas en linea, lo que sugiere un entrenamiento orientado a control condicional fino de la sintesis.

## Capacidades

- Sintesis de voz multilingue en chino, ingles, aleman, espanol, frances, coreano y japones, con soporte adicional de sichuanes y cantonés.
- Clonacion de voz zero-shot a partir de un clip de referencia y su transcripcion exacta.
- Voces integradas seleccionables por nombre (por ejemplo, `UK_Charlotte`).
- Instrucciones libres y de diseno de voz para modular estilo, tono y ritmo.
- Control de emocion, velocidad, tono y volumen mediante instrucciones estructuradas.
- 14 etiquetas paralinguisticas en linea, como `[Sigh]` o `[Cough]`, insertables en el texto.
- Salida de audio a 44,1 kHz.
- Interfaz de linea de comandos y API Python mediante mlx-audio.

## Casos de uso

- Audiolibros y narracion local: el modelo permite generar narraciones con control de ritmo y emocion mediante instrucciones libres, con un factor de tiempo real de 0,39 en M4 Pro que posibilita la produccion de horas de audio en portatiles sin GPU dedicada.
- Clonacion de voz para accesibilidad: usuarios con dificultades del habla pueden crear una voz personalizada a partir de un clip de referencia y su transcripcion, generando locuciones en los siete idiomas soportados.
- Asistentes de voz en aplicaciones macOS: la integracion con mlx-audio y el bajo pico de memoria (2,2 GB) permiten incorporar TTS en aplicaciones de escritorio con requisitos de privacidad, ya que todo el procesamiento ocurre localmente.
- Doblaje y localizacion de contenido: el soporte de aleman, espanol, frances, coreano y japones junto con el control de prosodia facilita la generacion de pistas de voz para videos y cursos en multiples idiomas desde un unico modelo.
- Prototipado de interfaces conversacionales: los desarrolladores pueden iterar rapidamente sobre guiones con etiquetas paralinguisticas y distintos estilos de voz sin depender de APIs externas ni de cuotas de servicio.
- Generacion de audio para videojuegos y multimedia: las voces integradas y el control de emocion permiten producir dialogos de personajes con variaciones de tono y volumen directamente en el pipeline de desarrollo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Factor de tiempo real (M4 Pro) | 0,39 |
| Pico de memoria (M4 Pro) | 2,2 GB |
| SNR del VAE 8 bits vs bf16 | 31 dB |
| Tamano en disco | 1,5 GB |
| Pruebas de transcripcion (whisper-large-v3-turbo) | 24 de 24 clips correctos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo de sintesis de voz y no de texto.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 2,2 GB de pico en inferencia con cuantizacion de 8 bits.
- Hardware recomendado: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra); las pruebas de referencia se realizaron en un M4 Pro.
- No es compatible con GPU NVIDIA o AMD de forma nativa, ya que el formato MLX esta disenado para el framework Metal de Apple.
- Cabe en cualquier Mac con al menos 8 GB de memoria unificada, aunque se recomienda 16 GB para comodidad.
- Opciones de despliegue: mlx-audio 0.6.1 o superior mediante CLI (`mlx_audio.tts.generate`) o API Python (`mlx_audio.tts.utils.load_model`).
- Latencia y throughput: factor de tiempo real de 0,39 en M4 Pro, es decir, aproximadamente 2,5 veces mas rapido que el tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Ming-3.0-tts-0.5B-8bit (este) | 1.479.454.868 | no disponible | 7 (+2 dialectos) | MIT | safetensors MLX |
| inclusionAI/Ming-3.0-tts-0.5B (original) | 0.5B (nominal) | no disponible | 7 (+2 dialectos) | MIT | safetensors |
| Alternativas comparables de TTS open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de TTS en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El embedding de hablante CAM++ que la referencia utiliza para clonacion y para las tareas de emocion, atributos y dialecto no esta extraido; la clonacion funciona solo a partir del audio de referencia y su transcripcion.
- La normalizacion de texto de la referencia no esta portada, por lo que los numeros deben escribirse con palabras.
- La cabeza de parada ocasionalmente no se activa, dejando ruido de baja intensidad al final del audio; se recomienda reintentar con otra semilla.
- Requiere mlx-audio 0.6.1 o superior; versiones 0.6.0 e inferiores cargan el modelo pero pronuncian palabras incorrectas (corregido en el PR #1047).
- El modelo esta limitado al ecosistema Apple Silicon y no puede ejecutarse en GPU NVIDIA o AMD sin conversion adicional.
- Riesgo de sesgos en la clonacion de voz y en la representacion de dialectos no documentado en la informacion disponible.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo base original y el cumplimiento normativo sobre sintesis de voz y derechos de imagen en la jurisdiccion de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Ming-3.0-tts-0.5B-8bit
- Modelo base original: https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Repositorio Ming-3.0-tts: https://github.com/inclusionAI/Ming-3.0-tts
- Libreria mlx-audio: https://github.com/Blaizzy/mlx-audio
- README del modelo denso en mlx-audio: https://github.com/Blaizzy/mlx-audio/blob/main/mlx_audio/tts/models/dense/README.md
- Pull request de correccion del contrato de prompt: https://github.com/Blaizzy/mlx-audio/pull/1047
