# mehdi-hf/pocket-tts-farsi

## Resumen

Pocket-TTS-Farsi es un modelo de síntesis de texto a voz (TTS) para persa (farsi) desarrollado por el usuario mehdi-hf sobre la librería pocket-tts de Kyutai. Es un modelo ligero de 109,5 millones de parámetros que funciona en CPU a varias veces la velocidad en tiempo real, y admite clonación de voz a partir de una muestra de audio corta. Resuelve la falta de sistemas TTS persas eficientes y de código abierto, con una calidad que supera a su propio profesor de 24 capas y 316 millones de parámetros en todas las métricas publicadas. Se entrenó sobre 497 horas de habla persa en dominio público (CC0) y está disponible bajo licencia MIT. Su arquitectura sigue el enfoque CALM descrito en arxiv:2509.06926, con destilación de profundidad: el modelo final tiene 6 capas frente a las 24 del profesor, lo que lo hace especialmente adecuado para despliegues en entornos sin GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Text-to-speech basado en transformer, siguiendo la arquitectura CALM del paper arxiv:2509.06926; destilado de profundidad con 6 capas (student). Detalles internos de la arquitectura no disponibles. |
| Parametros totales | 109.502.146 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | farsi (persa) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño presentado por Kyutai en el paper CALM. El modelo final es un estudiante de 6 capas con 109,5 millones de parámetros, destilado por profundidad desde un profesor de 24 capas y 316 millones de parámetros. El entrenamiento se realizó en 8 GPUs H100: el profesor completó 400.000 pasos con un lote efectivo de 64, y el estudiante 200.000 pasos de destilación. El modelo incorpora classifier-free guidance (CFG) de forma "horneada" durante la destilación, lo que permite usar una escala de CFG de 1.0 en lugar de 2.0 en inferencia.

Los datos de entrenamiento suman unas 497 horas de habla persa con licencia CC0, procedentes de tres fuentes: Mana-TTS (~60 horas con transcripciones verificadas a mano), Filimo ASR (245 horas con subtítulos) y YouTube ASR (~297 horas con subtítulos automáticos). El corpus se filtró y normalizó: se convirtieron las formas de letras árabes a persa, se eliminaron los signos harakat y se preservó el ZWNJ. El tokenizador es sentencepiece BPE con un vocabulario de 4.000 tokens. Las alineaciones de palabra se obtuvieron con un modelo wav2vec2 persa, logrando alineación en el 99,96% de las muestras.

## Capacidades

- Síntesis de voz en farsi con calidad de narración; en el conjunto limpio de evaluación obtiene un WER de 0.174 sobre un piso de 0.134.
- Clonación de voz a partir de un clip de audio de 2 a 5 segundos; la similitud de hablante alcanza 0.948 con voces parecidas a las del corpus de entrenamiento.
- Inferencia en CPU a varias veces la velocidad en tiempo real; no requiere GPU.
- Generación condicionada por voz mediante el uso de un prompt de audio sin necesidad de entrenamiento adicional.
- El modelo destilado supera a su profesor de 24 capas en WER, similitud de voz y UTMOS, a pesar de tener menos de la mitad de parámetros.
- No es un modelo de lenguaje: no admite tool calling, razonamiento general ni generación de texto; su única función es convertir texto a voz.

## Casos de uso

- Narración de audiolibros en persa: permite convertir texto largo en audio troceando por puntuación en fragmentos de menos de 40 tokens y uniéndolos con 0,15 segundos de silencio; el modelo clona la voz de un locutor elegido a partir de una muestra corta.
- Asistentes de voz en dispositivos locales: al ejecutarse en CPU, puede integrarse en aplicaciones de escritorio o móviles sin aceleración por GPU para leer en voz alta textos y notificaciones.
- Doblaje de vídeos educativos: se usa una muestra de la voz de un narrador (2-5 segundos) y se genera la locución completa del guion, ideal para producir contenido persa con una voz consistente.
- Accesibilidad y lectores de pantalla: proporciona síntesis de voz en farsi para personas con discapacidad visual, con suficiente calidad para narración continua y latencia baja.
- Sistemas de respuesta de voz interactiva (IVR): genera mensajes automatizados en persa para centralitas telefónicas y atención al cliente, con voces clonadas para mantener la identidad de marca.
- Producción de contenido para redes sociales: convierte guiones breves en locuciones narradas para vídeos o clips, aprovechando el modo CPU para iterar rápidamente sin infraestructura especializada.
- Investigación en TTS persa: sirve como modelo base ligero y abierto para comparar técnicas de destilación, clonado de voz y evaluación WER en idiomas de bajos recursos.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados con whisper-large-v3 en persa. La columna "floor" es el WER que el propio ASR logra sobre las grabaciones reales, es decir, el límite de medición.

| Métrica | Este modelo (6L) | Teacher (24L) |
|---|---|---|
| WER | 0.174 | 0.315 |
| Floor del ASR | 0.134 | 0.134 |
| WER / Floor | 1.30× | 2.35× |
| Similitud de hablante | 0.948 | 0.933 |
| UTMOS | 2.89 | 2.58 |

| Métrica | Este modelo (6L) | Teacher (24L) |
|---|---|---|
| WER | 1.62 | 2.53 |
| Colapsos por repetición | 9/50 | 15/50 |

Los valores de WER en el conjunto de hablantes no vistos superan 1.0, tal y como se publican en la model card; se reproducen sin interpretación. El autor indicia que Whisper no coincide con los subtítulos un 48% de las veces, por lo que parte del error aparente es del ASR. Para hablantes no familiares, la similitud de voz baja a 0.728 según el autor.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM si se ejecuta en CPU. Los pesos en safetensors ocupan 0,4 GB; para cargar en GPU, se necesita una memoria de al menos ese tamaño, aunque el autor no ofrece cifras precisas.
- GPU recomendadas: ninguna específica; el modelo está diseñado para CPU. Si se opta por GPU, cualquier aceleradora con más de 0,5 GB de VRAM sería suficiente, pero no hay requisitos oficiales.
- Cabe en consumer GPU: sí, por tamaño, pero no es la vía recomendada.
- Opciones de despliegue: uso de la biblioteca `pocket-tts` desde Python (`TTSModel.load_model`) o la CLI `uvx pocket-tts generate`. No hay integraciones oficiales con vLLM, Ollama o TGI en la documentación disponible.
- Latencia y throughput: el autor afirma que se ejecuta a "varias veces la velocidad en tiempo real" en CPU, sin proporcionar medidas concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | WER (set limpio) | Similitud de voz | Licencia |
|---|---|---|---|---|---|
| Pocket-TTS-Farsi (6L) | Student destilado, 6 capas | 109,5M | 0.174 | 0.948 | MIT |
| Pocket-TTS-Farsi teacher (24L) | Transformer, 24 capas | 316M | 0.315 | 0.933 | MIT |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

En la información proporcionada no se incluyen benchmarks de otros modelos TTS persas de la misma categoría; la comparación con el teacher es la única referencia con datos.

## Limitaciones y advertencias

- El modelo no resuelve de forma fiable la partícula ezafe del persa, ya que el sistema no la escribe y el normalizador elimina los signos; esto produce pausas o lecturas incorrectas en sintagmas como "حملات برون‌مرزی".
- Con prompts de voz ruidosos, aparecen bucles de repetición en aproximadamente el 18% de las muestras; con audio limpio no se observan.
- Sesgo de formato corto: el corpus está compuesto por fragmentos de 3,8 segundos de media; enviar párrafos largos produce resultados fuera de distribución y requiere troceado.
- Cobertura de dominio limitada: el modelo está entrenado principalmente con diálogo de cine, pódcast y narración de revista, por lo que acentos regionales, voces infantiles y lectura realizada por hablantes no profesionales están poco representados.
- La clonación de voz en hablantes no vistos baja la similitud a 0.728 y puede generar clips que no terminan ("maximum generation length reached without EOS").
- El modelo es exclusivamente para síntesis de voz en persa; no genera texto ni realiza tareas de lenguaje adicionales.
- Aunque la licencia MIT permite uso comercial, conviene revisar la atribución de los datos de entrenamiento, todos CC0 según el autor.

## Enlaces

- https://huggingface.co/mehdi-hf/pocket-tts-farsi
- https://github.com/kyutai-labs/pocket-tts
- https://arxiv.org/abs/2509.06926
