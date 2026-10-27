# cortex-ai-nova/NOVA-Oracle-4.6-4bit

## Resumen

NOVA-Oracle-4.6-4bit es un ajuste fino (fine-tune) del modelo de reconocimiento automático del habla Whisper large-v3, publicado por el usuario cortex-ai-nova en Hugging Face. Se distribuye con el pipeline `automatic-speech-recognition` y está pensado, por tanto, para transcribir audio a texto en inglés, no para generación de texto libre pese a que entre sus etiquetas aparezcan `text-generation-inference` y `endpoints_compatible`. El entrenamiento se realizó, según la model card, con Unsloth y la librería TRL de Hugging Face, lo que el autor presenta como un entrenamiento "2 veces más rápido" que el flujo convencional.

Arquitectura y tamaño coinciden exactamente con el modelo base: un transformer encoder-decoder de 1.543.490.560 parámetros (aproximadamente 1,54 mil millones), con ventanas de audio de 30 segundos y 128 canales mel como entrada. El repositorio ocupa 3,1 GB y contiene pesos en `safetensors`, un tamaño coherente con precisión de 16 bits (1,54 B × 2 bytes ≈ 3,1 GB); el sufijo "4bit" del nombre no se corresponde con el contenido publicado.

La relevancia de esta ficha es limitada y conviene ser explícito: el modelo tiene 0 descargas y 0 "likes", no incluye métricas de evaluación, no documenta el conjunto de datos de ajuste fino y la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo (solo páginas sobre el córtex cerebral y el software Razer Cortex). Es, por tanto, un artefacto sin validación externa que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (32 capas de encoder y 32 de decoder, atención completa, entrada de 128 canales mel) |
| Parametros totales | 1.543.490.560 (1,54 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | Ventanas de audio de 30 s por pasada y hasta 448 tokens de decodificación por ventana; no hay contexto de texto largo |
| Tipos de cuantizacion | El autor no declara ninguno. Los pesos publicados son `safetensors` en fp16 (3,1 GB), pese al sufijo "4bit" del nombre. No se incluyen GGUF ni binarios CTranslate2 |
| Idiomas soportados | `en` (inglés) según la model card; el modelo base Whisper large-v3 cubre del orden de 99 idiomas, pero este ajuste no declara conservarlos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3 sin modificaciones estructurales: un encoder que procesa espectrogramas mel de 128 bandas en ventanas de 30 segundos y un decoder autorregresivo que emite tokens de texto, marcas de tiempo y tokens especiales de idioma y tarea. El vocabulario del tokenizer es de 51.865 tokens. No hay innovaciones declaradas más allá del propio ajuste fino; la model card no menciona decodificación especulativa, atención lineal ni mecanismos híbridos.

El autor solo indica que el modelo se entrenó con Unsloth y TRL partiendo de `unsloth/whisper-large-v3`. No se especifica el número de tokens de audio, la composición del corpus, la duración del entrenamiento, la tasa de aprendizaje, si hubo etapas de alineación o preferencias (RLHF/DPO) ni ningún otro hiperparámetro. Tampoco se documenta si el ajuste buscaba un dominio concreto (acento, jerga, ruido de fondo) o si simplemente se trata de una prueba de la herramienta de entrenamiento. Esta ausencia de información sobre los datos impide estimar qué distribución de audio cubre el ajuste y en qué se desvía del modelo base.

## Capacidades

- Transcripción de audio a texto en inglés (`automatic-speech-recognition`).
- Generación de marcas de tiempo a nivel de segmento, heredadas del esquema de decodificación de Whisper.
- Manejo de audio de hasta 30 segundos por ventana, con segmentación externa necesaria para grabaciones más largas.
- Detección y transcripción de habla con ruido moderado y múltiples hablantes (sin separación de hablantes).
- Compatibilidad con la API `pipeline` de `transformers` y con el formato de pesos estándar de la librería.
- No se declara soporte de tool calling, function calling, razonamiento multi-paso, visión ni modo "thinking"; las etiquetas `text-generation-inference` y `endpoints_compatible` del repositorio no van acompañadas de ninguna capacidad de ese tipo documentada.
- Capacidad multilingüe: no declarada para este ajuste (solo `en`).

## Casos de uso

- Transcripción de reuniones y notas de voz en inglés: el modelo convierte audio de hasta 30 segundos por fragmento en texto con marcas de tiempo de segmento, lo que permite ensamblar actas y resúmenes posteriores con un pipeline de segmentación propio.
- Subtitulado automático de vídeo: las marcas de tiempo por segmento sirven como base para generar ficheros SRT, siempre que se validen manualmente los cortes y se controle el riesgo de alucinación en tramos musicales.
- Analítica de centros de contacto: transcripción de llamadas en inglés para extraer mots clave, motivos de contacto y cumplimiento, aunque la ausencia de diarización obliga a añadir un modelo externo de separación de hablantes.
- Accesibilidad y transcripción en directo: conversión de audio a texto para personas con discapacidad auditiva en eventos o clases en inglés, con latencia dependiente del hardware de despliegue.
- Etiquetado de datasets de audio: generación de transcripciones preliminares sobre grandes colecciones de audio en inglés para su revisión humana posterior, aprovechando el coste relativamente bajo de inferencia de un modelo de 1,54 B.
- Preprocesado para asistentes de voz: el texto transcrito puede alimentar un LLM separado que gestione la conversación, dado que este modelo no hace generación de respuestas ni tool calling.
- Búsqueda sobre archivos de audio: indexación de transcripciones de pódcasts o archivos corporativos para búsqueda textual, con la salvedad de que la calidad del ajuste no está medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, CER ni ninguna otra métrica de evaluación, y la búsqueda web no devolvió referencias al modelo. No se dispone tampoco de comparaciones con el modelo base `unsloth/whisper-large-v3` ni con `openai/whisper-large-v3`, por lo que no es posible determinar si el ajuste mejora, iguala o degrada el rendimiento del punto de partida.

## Requisitos de hardware

- VRAM estimada en fp16: los pesos ocupan unos 3,1 GB; con activaciones y buffers de atención, el consumo práctico se sitúa en torno a 6-8 GB para lotes pequeños y 10-12 GB para lotes mayores o audio de 30 s con beam search amplio.
- VRAM estimada tras cuantización: int8 (CTranslate2) reduce los pesos a unos 1,6 GB y permite inferencia por debajo de 3 GB de VRAM; int4 podría bajar de 1 GB, pero no hay conversión publicada ni validada por el autor.
- GPU recomendadas: NVIDIA A100, H100, L40S o A10G para servicios de alto volumen; RTX 4090, RTX 3090, RTX 4080 o L4 para despliegues de una sola máquina.
- GPU de consumo: cabe holgadamente en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores; también en T4 de 16 GB en fp16.
- CPU: viable con `whisper.cpp` y cuantización GGUF, aunque el repositorio no incluye pesos GGUF, por lo que habría que convertir `safetensors` a GGUF antes de usarlo.
- Opciones de despliegue: `transformers` (`pipeline("automatic-speech-recognition")`), TGI (soporte de Whisper), `faster-whisper`/CTranslate2 previa conversión, `whisper.cpp` previa conversión, WhisperX para alineación temporal, y servidores de inferencia propios.
- Latencia y throughput: no disponibles. No se han publicado mediciones y el autor no documenta tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| cortex-ai-nova/NOVA-Oracle-4.6-4bit | 1,54 B | 30 s por ventana, 448 tokens de decoder | `en` declarado | apache-2.0 | 0 descargas, sin métricas |
| openai/whisper-large-v3 | 1,55 B | 30 s por ventana, 448 tokens de decoder | ~99 idiomas | MIT | Referencia ampliamente validada |
| openai/whisper-large-v3-turbo | 809 M | 30 s por ventana, 448 tokens de decoder | ~99 idiomas | MIT | Variante destilada del decoder, más rápida |
| distil-whisper/distil-large-v3 | ~756 M | 30 s por ventana | Inglés principalmente | MIT | Destilación de large-v3, orientada a inglés |

La comparación relevante es con el propio modelo base: este ajuste no documenta ninguna ventaja medible frente a `openai/whisper-large-v3` y, sin métricas, la elección por defecto debería seguir siendo el modelo original o sus variantes destiladas, que sí cuentan con evaluaciones públicas y comunidades activas.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente `en`; usar el modelo con otros idiomas supone un riesgo alto de transcripciones incorrectas o de traducción no deseada, aunque el modelo base sea multilingüe.
- Alucinación: los modelos Whisper tienden a generar texto plausible en tramos de silencio, música o ruido, y a entrar en bucles de repetición. No hay evaluación que indique si este ajuste lo mitiga o lo agrava.
- Datos de entrenamiento desconocidos: sin información sobre el corpus de ajuste no se puede evaluar el sesgo por acento, género, edad o dominio, ni el riesgo de sobreajuste a una fuente concreta.
- Discrepancia de nombre y contenido: el repositorio se llama "4bit" pero los pesos publicados son fp16 (`safetensors`, 3,1 GB). Cualquier expectativa de consumo de memoria reducido es incorrecta sin una cuantización propia.
- Sin validación de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta; no hay issues, discusiones ni informes de terceros.
- Sin métricas: no hay WER ni comparación con el modelo base, por lo que no es posible afirmar que el ajuste mejora algo.
- Duplicidad de etiquetas engañosa: las etiquetas `text-generation-inference` y `endpoints_compatible` no implican que el modelo pueda usarse como generador de texto conversacional.
- Licencia: apache-2.0 permite uso comercial y modificación, pero conviene verificar que los términos del modelo base (Whisper, licencia MIT) y del corpus de ajuste no impongan restricciones adicionales; el autor no lo aclara.
- Producción: al no haber diarización, ni puntuación garantizada, ni marcas de tiempo a nivel de palabra, hará falta infraestructura adicional (WhisperX, modelos de diarización) para casos reales.
- Fecha de publicación: el repositorio figura creado el 27 de octubre de 2026, dato que conviene contrastar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cortex-ai-nova/NOVA-Oracle-4.6-4bit
- Modelo base declarado: https://huggingface.co/unsloth/whisper-large-v3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo de referencia de OpenAI: https://huggingface.co/openai/whisper-large-v3
- Resultados de la búsqueda web: no se encontró ningún enlace relevante al modelo. Las únicas páginas devueltas tratan sobre el córtex cerebral (Wikipedia y Vulgaris Medical), el software Razer Cortex y el medio Cortex Média, sin relación alguna con este artefacto. No se dispone de paper, blog técnico, demo ni repositorio adicional del autor.
