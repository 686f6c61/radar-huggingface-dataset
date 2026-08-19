# notmax123/QwenTTS-he-1.7B

## Resumen

QwenTTS-he-1.7B es un adaptador LoRA desarrollado por Max Melichov que añade síntesis de voz en hebreo al modelo base Qwen/Qwen3-TTS-12Hz-1.7B-Base de Alibaba. El adaptador, de 246 MB en bf16, se entrena sobre aproximadamente 131 000 locuciones hebreas con texto condicionado en IPA con marcadores de acento primario. Su principal innovación es que no modifica ningún peso del modelo base: al cargar el adaptador se obtiene hebreo, y al desactivarlo el modelo vuelve a ser bit a bit idéntico al original, conservando los diez idiomas nativos del base.

El modelo resuelve el problema de la falta de soporte hebreo en el TTS de Qwen3, un idioma cuya ortografía no especifica las vocales y que requiere una conversión G2P previa a IPA. Es relevante porque demuestra un enfoque de extensión de idiomas mediante adaptadores ligeros sin reentrenar el modelo completo, con una pérdida de evaluación que desciende de forma monótona hasta 2,1339 en el paso 6000. El adaptador se aplica al submódulo `talker` del modelo base y requiere el código de inferencia de Qwen3-TTS junto con la librería `peft`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone talker y codec predictor (Qwen3-TTS-12Hz-1.7B-Base) + adaptador LoRA |
| Parametros totales | 1.7B (modelo base) + 246 MB (adaptador LoRA, bf16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no procesa texto largo) |
| Tipos de cuantizacion | bf16 (adaptador); el base admite cuantizaciones estandar (no especificadas) |
| Idiomas soportados | Hebreo (via IPA estresado) con adaptador activo; 10 idiomas del base (chino, ingles, frances, aleman, italiano, japones, coreano, portugues, ruso, espanol) con adaptador desactivado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=32, alpha=64, dropout=0.05) aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` tanto del backbone talker como del predictor de codigos MTP. Ademas, se entrenan de forma completa y se incluyen dentro del adaptador los modulos `codec_head`, `text_projection` y las 15 cabezas residuales `lm_head.0` a `lm_head.14`, porque la fonotactica hebrea requiere mover la distribucion de salida, no solo los deltas de atencion y MLP. La tabla de embeddings de texto no se redimensiona ni se reentrena, por lo que el tokenizador y el vocabulario permanecen identicos al base.

El entrenamiento se realizo con 131 569 locuciones hebreas (600 de evaluacion), 6000 pasos (aproximadamente 1,46 epocas), batch efectivo de 32, tasa de aprendizaje 5e-5 con programacion coseno y 3% de warmup, precision bf16 mixta, atencion sdpa y semilla 0. Se uso una unica GPU de 32 GB con un pico de memoria de aproximadamente 16 GB. La perdida de evaluacion descendio monotonamente desde 2,2999 (paso 500) hasta 2,1339 (paso 6000), sin haber alcanzado una meseta clara, lo que sugiere que mas pasos podrian mejorar el resultado. El texto de entrada debe ser IPA con marcador de acento primario U+02C8, ya que la ortografia hebrea no especifica las vocales; el autor recomienda usar RenikudPlus para diacritizacion seguida de conversion a IPA.

## Capacidades

- Sintesis de voz en hebreo a partir de texto IPA estresado, con control de prosodia mediante el marcador de acento primario.
- Clonacion de voz por audio de referencia, heredada del modelo base (funcionalidad `generate_voice_clone`).
- Soporte de los 10 idiomas nativos del modelo base cuando el adaptador esta desactivado, con salida bit a bit identica al modelo original.
- Capacidad de alternar entre hebreo y los idiomas del base en tiempo de ejecucion mediante `disable_adapter()`.
- No requiere redimensionar el tokenizador ni el vocabulario; el adaptador se carga como un modulo PEFT sobre el submódulo `talker`.
- Generacion de audio no streaming y streaming (segun el codigo de Qwen3-TTS).

## Casos de uso

- Locuciones para aplicaciones de audiolibros en hebreo: el modelo puede generar narracion leida con IPA estresado, adecuada para contenido editorial donde la prosodia correcta es critica. Su entrenamiento en habla leida/narrada lo hace idoneo para este tipo de produccion.
- Asistentes de voz en hebreo para servicios publicos: por ejemplo, informacion de transporte o atencion al ciudadano, donde se necesita una voz clara y estable. La clonacion de voz por referencia permite usar una voz corporativa consistente.
- Generacion de contenido educativo en hebreo: leccion de idiomas, pronunciacion de vocabulario o frases, donde el IPA estresado permite controlar la acentuacion de cada palabra.
- Pruebas de accesibilidad para interfaces de voz en hebreo: el modelo puede generar muestras de audio para validar sistemas de reconocimiento de voz o para crear prototipos de productos sin necesidad de grabar locuciones reales.
- Integracion en pipelines de doblaje automatico: dado que el adaptador se puede activar y desactivar, un sistema puede alternar entre hebreo y otros idiomas del base sin recargar el modelo, util para produccion de contenido multilingue.
- Investigacion en extension de idiomas para TTS: el adaptador sirve como caso de estudio de como anadir un idioma a un modelo multilingue sin tocar los pesos base, con verificacion de identidad bit a bit al desactivarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como MOS, WER o comparaciones con otros sistemas TTS) en la informacion disponible. La unica metrica reportada es la perdida de evaluacion durante el entrenamiento, que descendio de 2,2999 (paso 500) a 2,1339 (paso 6000). No se proporcionan comparaciones objetivas con otros modelos de sintesis de voz en hebreo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.7B parametros en bf16 requiere aproximadamente 3,4 GB de pesos, mas el adaptador de 246 MB y el overhead de activaciones. Con una GPU de 8 GB deberia ser suficiente para inferencia no streaming; el entrenamiento uso un pico de 16 GB en una GPU de 32 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) para inferencia local. Para entrenamiento o ajuste fino adicional, se recomienda una GPU de 24 GB o superior.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas, siempre que se use bf16 y atencion sdpa.
- Opciones de despliegue: el codigo de inferencia de Qwen3-TTS (repositorio oficial) con `peft`; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Depende del hardware y de la longitud del texto IPA de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QwenTTS-he-1.7B (este) | 1.7B + 246 MB LoRA | No disponible | Hebreo (via IPA) + 10 del base | Apache-2.0 | HuggingFace |
| Qwen3-TTS-12Hz-1.7B-Base | 1.7B | No disponible | 10 idiomas (sin hebreo) | Apache-2.0 | HuggingFace |
| Otros TTS hebreos (p.ej. modelos basados en VITS o Tacotron) | Variable | No disponible | Hebreo | Variable | No disponible en la informacion |

No se dispone de datos de rendimiento comparativo con otros sistemas TTS hebreos. La ventaja principal de este adaptador es su no intrusividad sobre el modelo base y su capacidad de alternar idiomas sin recargar.

## Limitaciones y advertencias

- Requiere entrada en IPA estresado: el texto hebreo en ortografia nativa no funciona; es necesario un paso G2P (por ejemplo, RenikudPlus + conversion a IPA). Esto anade complejidad al pipeline.
- Entrenado solo en habla leida o narrada: la expresividad o el habla conversacional hebrea estan fuera de distribucion y pueden producir resultados poco naturales.
- La cobertura de voces proviene del corpus de entrenamiento; al clonar una voz muy diferente a las del corpus, puede haber transferencia de prosodia de los locutores de entrenamiento.
- Solo hebreo: el adaptador no soporta yiddish, que fue excluido deliberadamente del entrenamiento.
- No se debe fusionar el adaptador con los pesos base (`merge_and_unload()`), ya que destruiria la garantia de reversibilidad bit a bit.
- Con el adaptador activo, no se deben generar los idiomas del base (chino, ingles, etc.) porque la distribucion de salida se desplaza hacia el hebreo; hay que desactivarlo explicitamente.
- No se han publicado evaluaciones de calidad perceptiva (MOS) ni pruebas de robustez ante ruido o acentos regionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/notmax123/QwenTTS-he-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio de inferencia Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Perfil del autor: https://huggingface.co/notmax123
