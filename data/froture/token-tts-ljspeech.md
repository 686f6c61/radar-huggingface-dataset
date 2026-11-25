# Froture/token-tts-ljspeech

## Resumen

Token TTS (LJ Speech) es un modelo experimental de sintesis de voz (text-to-speech) desarrollado por el usuario Froture como proyecto de curso. Se trata de un transformer decoder-only entrenado desde cero que predice tokens del codec neural Mimi (Kyutai) a partir de fonemas, usando como unico corpus LJ Speech 1.1 (24 horas de audio de una sola voz en ingles). El repositorio incluye dos variantes: `big` (39.960.066 parametros, d=512, 10 capas, 8 cabezas) y `small` (6.603.522 parametros, d=256, 3 capas).

El modelo no pretende competir con sistemas TTS de produccion. El propio autor lo describe como un experimento para verificar que la arquitectura funciona y medir numeros: la calidad es explicitamente peor que VITS, con tasas de error de palabra (WER) que van del 29,0% en la mejor configuracion de muestreo unico hasta el 17,3% cuando se generan 20 candidatos y se seleccionan por reconocimiento automatico. El interes tecnico esta en su planteamiento: TTS como modelado de lenguaje sobre tokens discretos de codec, con la posibilidad de aplicar decodificacion especulativa o seleccion por reranking.

Es relevante ahora como referencia metodologica y como ejemplo reproducible de un pipeline codec-LM completo (fonemas -> tokens Mimi -> audio) con mediciones publicadas, no como solucion desplegable. Su licencia no esta declarada y solo soporta ingles y una unica voz, lo que limita cualquier uso practico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelado autorregresivo de tokens de codec Mimi) |
| Parametros totales | 39.960.066 (`big`) / 6.603.522 (`small`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (mas config.json por variante) |

## Arquitectura y entrenamiento

El modelo convierte el audio en una secuencia discreta mediante el codec Kyutai Mimi: 12,5 Hz de tasa de frames, 8 codebooks de 2048 entradas cada uno, lo que equivale a 100 numeros por segundo de audio. La secuencia de entrada tiene la forma `[fonemas] [SEP] [tokens: 8 codebooks por frame en orden] [EOS]`, y un transformer decoder-only predice el siguiente token con una unica perdida de entropia cruzada. Los fonemas siguen el mismo inventario que el repositorio oficial de VITS para LJ Speech (`filelists/*.cleaned`). El codec Mimi no se incluye en el repositorio: se usa el checkpoint preentrenado de Kyutai.

El entrenamiento se realizo desde cero sobre LJ Speech 1.1 con el split oficial de VITS: 12.500 frases de entrenamiento (22,97 horas), 100 de validacion y 500 de test. La variante `big` se entreno durante 24.194 pasos en una RTX 3060 (3 horas) y la `small` durante 29.207 pasos (2,5 horas). No se menciona RLHF, DPO ni ajuste por preferencias. La variante `small` se diseno como modelo borrador para decodificacion especulativa, aunque en esa escala resulto mas lenta (factor 0,35-0,76x). El autor indica que direccion, diseno y decisiones fueron humanas, mientras que implementacion, entrenamiento y medicion se realizaron con Claude Code (Anthropic).

## Capacidades

- Sintesis de voz a partir de texto en ingles, mediante fonemizacion previa segun el inventario de VITS.
- Generacion autorregresiva de tokens de audio Mimi (8 codebooks, 12,5 Hz) y reconstruccion posterior a waveform con el codec.
- Muestreo configurable (temperatura, top-k) y generacion de multiples candidatos para seleccion posterior.
- Soporte de reranking por reconocimiento automatico: el autor usa Whisper small.en para elegir entre N candidatos.
- Capacidad de actuar como modelo borrador en decodificacion especulativa (variante `small`), aunque sin ganancia de velocidad en este caso.
- Voz unica: solo reproduce la locutora de LJ Speech; no hay clonacion ni control de hablante.
- Sin soporte de tool calling, agentes, vision, audio de entrada ni modo de razonamiento.

## Casos de uso

- Reproduccion de experimentos academicos: sirve para replicar el pipeline codec-LM (fonemas -> tokens Mimi -> audio) y comparar con VITS bajo el mismo split de LJ Speech, ya que el autor publica codigo, configuraciones y metricas.
- Docencia sobre TTS neuronal: permite mostrar en clase la diferencia entre modelos acusticos continuos (VITS) y modelado de lenguaje discreto sobre codecs, con numeros concretos de WER.
- Estudio de estrategias de seleccion: el modelo permite medir el impacto del reranking por ASR (29,0% con un candidato frente a 17,3% con 20) y de la temperatura de muestreo (22,4% a temperatura 0,6).
- Investigacion sobre decodificacion especulativa en audio: la variante `small` documenta un caso negativo util (0,35-0,76x de velocidad) para quien disene borradores en dominios discretos.
- Analisis de leyes de escalado de datos: el autor reporta que el WER pasa de 80,7% con 6 horas a 49,7% con 12 horas y mejora aproximadamente 0,6x por cada duplicacion de datos, sin saturar a 24 horas.
- Pruebas de integracion de codecs neuronales: util para validar la cadena Mimi (encode/decode) y el formato de secuencias de 8 codebooks en prototipos de investigacion.
- Generacion de audio de baja fidelidad para pruebas de pipelines: aceptable como senal sintetica en tests automatizados donde no se requiere inteligibilidad alta.

## Benchmarks y rendimiento

Mediciones del autor sobre las primeras 40 frases del test, temperatura 1,0 y top-k 50 salvo indicacion contraria. WER calculado con wav2vec2-base-960h; seleccion de candidatos con Whisper small.en.

| Sistema / configuracion | WER |
|---|---|
| Audio original de referencia | 7,4% |
| Codec Mimi solo (suelo del enfoque) | 10,2% |
| VITS preentrenado oficial (mismas frases) | 8,7% |
| `big`, un candidato | 29,0% |
| `big`, mejor de 5 por ASR | 20,3% |
| `big`, mejor de 20 por ASR | 17,3% |
| `big`, temperatura 0,6, un candidato | 22,4% |
| `small`, un candidato (validacion, 30 frases) | 37,1% |
| `big`, un candidato (validacion, 30 frases) | 26,2% |

Escalado con datos (misma arquitectura, menos horas de entrenamiento): 6 horas -> 49,7% WER; 12 horas -> 80,7% WER; 24 horas -> sin saturacion segun el autor. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por tamano, `big` (40 M parametros) ocupa aproximadamente 160 MB en fp32 y unos 80 MB en fp16, y `small` (6,6 M) alrededor de 26 MB en fp32.
- GPU de entrenamiento reportada: una RTX 3060 (variante `big` en 3 horas, `small` en 2,5 horas).
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia, aunque no se publican latencias.
- El codec Mimi de Kyutai debe cargarse aparte y anade su propio consumo de memoria, no cuantificado en la informacion disponible.
- Opciones de despliegue: el autor proporciona scripts en `token_tts/` del repositorio de GitHub (`generate.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (LJ Speech test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Token TTS `big` (este) | 39,96 M | no disponible | 29,0% (1 candidato) / 17,3% (20 candidatos) | no disponible | Hugging Face + GitHub |
| VITS (preentrenado oficial) | no disponible en la informacion | no disponible | 8,7% | no disponible en la informacion | Referencia usada por el autor |
| Token TTS `small` (este) | 6,60 M | no disponible | 37,1% (validacion) | no disponible | Hugging Face + GitHub |

No se dispone de datos comparativos con otros sistemas TTS (Tacotron, FastSpeech, modelos basados en codecs como VALL-E o Bark) en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad claramente inferior a VITS: el propio autor advierte que no es un TTS utilizable en produccion.
- Errores frecuentes: palabras incorrectas, repeticion de frases y omisiones.
- Entrenado con una unica voz (lectora de LJ Speech) y solo en ingles; no generaliza a otras voces ni idiomas.
- Entrenamiento realizado una sola vez y evaluacion sobre 40 frases, por lo que las metricas tienen alta varianza.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- El codec Mimi no se distribuye en el repositorio y debe obtenerse por separado, con su propia licencia.
- No dispone de cuantizaciones publicadas ni de integracion con servidores de inferencia habituales.
- Riesgo de alucinacion acustica (audio inteligible pero incorrecto) inherente al muestreo autorregresivo; el reranking por ASR mitiga pero no elimina el problema.
- El modelo `small` como borrador especulativo no aporta aceleracion en esta escala (0,35-0,76x), por lo que no debe emplearse con ese fin sin rediseno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Froture/token-tts-ljspeech
- Codigo, metodos de entrenamiento y mediciones: https://github.com/frotrue/vits-vits2-slides (`token_tts/`)
- Codec Mimi (Kyutai): https://huggingface.co/kyutai/mimi
- Repositorio VITS (inventario de fonemas y splits): https://github.com/jaywalnut310/vits
