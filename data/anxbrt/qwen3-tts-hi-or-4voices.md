# anxbrt/qwen3-tts-hi-or-4voices

## Resumen

`anxbrt/qwen3-tts-hi-or-4voices` es un ajuste fino completo (full fine-tune) del modelo base `Qwen/Qwen3-TTS-12Hz-1.7B-Base`, desarrollado por el usuario independiente anxbrt. El modelo resuelve un problema concreto: el modelo base de Qwen para síntesis de voz no incorpora voces predefinidas para hindi y odia, dos lenguas indoarias con millones de hablantes. Este ajuste añade cuatro voces con nombre propio (`harsh`, `harshini`, `omkar`, `omkarini`) a partir de unas 50 horas de audio en esos dos idiomas.

Arquitectónicamente es un transformer de tipo "talker" con 28 capas, tamaño oculto de 2048 y 16 cabezas de atención, acoplado a un predictor de códigos de 5 capas y a un tokenizador de audio que opera a 12 fotogramas por segundo con 16 codebooks (192 códigos por segundo). El modelo conserva la arquitectura del base sin modificaciones; lo que cambia son los pesos y la tabla de embeddings de hablante.

Es relevante ahora porque demuestra un flujo de trabajo reproducible de ajuste fino de TTS multilingüe sobre un modelo abierto con licencia Apache 2.0, e incluye correcciones documentadas al script oficial de entrenamiento de Qwen. No obstante, el propio autor lo etiqueta como experimento temprano sin evaluar: no hay CER, WER ni MOS publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "talker" + predictor de codigos + tokenizador de audio (Qwen3-TTS) |
| Parametros totales | 1.700 millones (1.7B, segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado y probado en bfloat16) |
| Idiomas soportados | hindi (hi), odia (or) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de Hugging Face con `config.json`, tokenizador de audio incluido en `speech_tokenizer/`) |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la del modelo base Qwen3-TTS-12Hz-1.7B. El componente principal es un "talker" de 28 capas transformer con tamaño oculto 2048, 16 cabezas de atención y tamaño intermedio 6144. Dispone de dos vocabularios: texto (151.936 tokens) y codec (3.072 tokens). Un predictor de códigos de 5 capas con tamaño oculto 1024 y 16 cabezas genera los codebooks 1 a 15 de cada fotograma, mientras que el talker predice el codebook 0. La salida se convierte en onda de audio a 24 kHz mediante el tokenizador `Qwen3-TTS-Tokenizer-12Hz`, que trabaja a 12 fotogramas por segundo con 16 codebooks. La voz se inyecta como un vector de 2048 números en la posición 6 del prompt.

El entrenamiento fue un ajuste fino supervisado del modelo completo, sin LoRA ni adaptadores, con el codificador de hablante congelado. La función de pérdida combina la pérdida del talker más 0,3 veces la del predictor de códigos. Se usaron aproximadamente 50 horas de audio: 5 horas por cada una de las dos voces hindi de Rasa, 7,5 horas por cada una de las dos voces odia de Rasa, y el resto de IndicVoices-R (hindi masculino y femenino). Ambos conjuntos de datos son CC-BY-4.0 y solo se emplearon sus particiones de entrenamiento. El autor documenta correcciones al script oficial `sft_12hz.py`: aplicar `text_projection` a los embeddings de texto, calcular ambas pérdidas de forma explícita, alinear los estados ocultos del predictor de códigos con el fotograma correcto, guardar varias voces con nombre y usar atención `sdpa` en lugar de flash attention forzada.

## Capacidades

- Síntesis de voz (text-to-speech) en hindi y odia con cuatro voces predefinidas.
- Selección de voz por nombre (`harsh`, `harshini`, `omkar`, `omkarini`), con correspondencia a filas concretas de la tabla de embeddings de hablante (3000 a 3003).
- Inferencia automática del idioma a partir del sistema de escritura del texto (`language="Auto"`); no acepta entrada explícita de idioma ni de género.
- Generación de audio a 24 kHz con 12 fotogramas por segundo y 16 codebooks.
- Control de longitud de generación mediante `max_new_tokens` (400 tokens equivalen a unos 33 segundos).
- No soporta clonación de voz: el codificador de hablante se eliminó al guardar y `tts_model_type` es `custom_voice`, por lo que `generate_voice_clone` no funciona.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa ni visión; es un modelo exclusivamente de TTS.

## Casos de uso

- **Locución automatizada en hindi para contenidos educativos**: el modelo permite generar narraciones en hindi con voz masculina o femenina (`harsh` o `harshini`) a partir de texto, útil para cursos, audiolibros o material de formación con presupuesto limitado.
- **Accesibilidad para hablantes de odia**: conversión de texto a voz en odia (`omkar` u `omkarini`) para lectores de pantalla, avisos públicos o interfaces de voz, un idioma con menor cobertura en sistemas TTS comerciales.
- **Prototipado de asistentes de voz regionales**: integración en un pipeline de atención al cliente o asistente doméstico que necesite respuestas habladas en hindi u odia, seleccionando la voz según el género o la preferencia del usuario.
- **Generación de avisos y anuncios institucionales**: producción de mensajes de audio en hindi y odia para difusión pública (transportes, sanidad, administración) con una voz consistente y sin depender de servicios en la nube.
- **Investigación en TTS de lenguas indoarias**: base reproducible para experimentos de ajuste fino, comparación de metodologías de entrenamiento o evaluación de calidad en hindi y odia, dado que el autor publica el código de entrenamiento en `training/`.
- **Doblaje y localización de contenido breve**: generación de pistas de voz para vídeos cortos, pódcast o tutoriales en hindi y odia, con control de duración mediante `max_new_tokens`.
- **Evaluación de flujos de ajuste fino sobre Qwen3-TTS**: el repositorio documenta correcciones al script oficial de Qwen, por lo que sirve como referencia técnica para quien quiera replicar el proceso con otros idiomas o voces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no hay tasas de error (CER, WER) ni puntuaciones de escucha (MOS); las únicas métricas registradas son pérdida de entrenamiento, pérdida de validación y longitud de los clips, que no miden la calidad perceptual del habla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1.7B parámetros en bfloat16 el peso ronda los 3,4 GB, a lo que hay que sumar el tokenizador de audio y las activaciones, por lo que se estima un consumo moderado aunque el autor no publica cifras.
- GPU recomendadas: el autor probó el modelo en una GPU con `bfloat16` y atención `sdpa`; no especifica el modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamaño, es plausible en tarjetas con suficiente VRAM para bfloat16, pero no hay datos publicados.
- Opciones de despliegue: la librería `qwen-tts` (junto con `soundfile`) es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- CPU y otras precisiones: no probadas según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Voces predefinidas | Clonacion | Licencia | Estado |
|---|---|---|---|---|---|---|
| `anxbrt/qwen3-tts-hi-or-4voices` | 1.7B | hi, or | 4 (`harsh`, `harshini`, `omkar`, `omkarini`) | No | Apache 2.0 | Ajuste fino independiente, sin evaluar |
| `Qwen/Qwen3-TTS-12Hz-1.7B-Base` | 1.7B | no disponible en la informacion | no disponible | Si (segun la model card del ajuste) | no disponible en la informacion | Modelo base oficial |
| Alternativas TTS multilingues de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- **Sin evaluacion de calidad**: no hay CER, WER ni MOS; el autor califica el modelo como experimento temprano y no benchmarkeado.
- **Sesgos y representatividad**: las voces se construyen a partir de grupos de idioma y genero de Rasa, asumiendo un unico hablante por grupo sin confirmacion; los nombres son inventados y no corresponden a las personas reales de las grabaciones.
- **Riesgo de alucinacion acustica**: al ser un modelo generativo de audio, puede producir prosodia o pronunciaciones incorrectas, especialmente en textos fuera del dominio de entrenamiento.
- **Limitacion de idioma**: solo hindi y odia; el idioma se infiere del sistema de escritura, sin control explicito.
- **Sin clonacion de voz**: el codificador de hablante se elimino al guardar; para clonacion hay que usar el modelo base.
- **Entorno de ejecucion restringido**: solo se probo en GPU con bfloat16 y atencion `sdpa`; CPU y otras precisiones no fueron validadas.
- **Licencia**: Apache 2.0 permite uso comercial, pero los conjuntos de datos de origen (Rasa e IndicVoices-R) son CC-BY-4.0, lo que exige atribucion; conviene revisar las condiciones de las grabaciones originales antes de un despliegue comercial.
- **Proyecto independiente**: no esta afiliado ni respaldado por el equipo de Qwen ni por AI4Bharat.
- **Madurez**: cero descargas y cero likes en el momento de la consulta; sin senales de adopcion ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anxbrt/qwen3-tts-hi-or-4voices
- Space de demostracion con clips de prueba: https://huggingface.co/spaces/anxbrt/qwen3-tts-hi-or-voices
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio oficial de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Dataset Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Dataset IndicVoices-R: https://huggingface.co/datasets/ai4bharat/indicvoices_r
- Paper referenciado (arXiv:2601.15621): https://arxiv.org/abs/2601.15621
- Modal (plataforma usada para el entrenamiento): https://modal.com
