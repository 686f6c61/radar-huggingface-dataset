# Iscte-Sintra/KeaASRv2-LLM-1B_v2-ST

## Resumen

KeaASRv2-LLM-1B_v2-ST es un modelo de reconocimiento automático del habla (ASR) especializado en kabuverdianu (código ISO `kea`), la lengua criolla de base portuguesa hablada en Cabo Verde. Lo desarrolla el grupo Iscte-Sintra a partir de `omniASR_LLM_1B_v2` de Meta, un modelo de la familia Omnilingual ASR, mediante ajuste fino completo supervisado sobre la configuración `kea_cv` del corpus Google FLEURS. El sufijo `ST` indica que la variedad de aplicación prevista es la de la isla de Santiago, aunque el autor advierte explícitamente que esto no altera la procedencia del entrenamiento ni implica un rendimiento sólido en esa variedad.

El modelo resuelve un problema de recursos lingüísticos escasos: el kabuverdianu apenas dispone de sistemas ASR públicos de calidad. Con 2.281.715.328 parámetros reales (la etiqueta "1B" proviene del nombre de la familia upstream y no del recuento total), emplea una arquitectura `wav2vec2_llama` con codificador de voz y decodificador de texto Llama, y genera transcripciones de forma autorregresiva, no mediante CTC. Se publica bajo licencia Apache-2.0 con pesos completos en FP32.

Su relevancia actual reside en que demuestra un flujo de trabajo reproducible de ajuste fino sobre un modelo fundacional multilingüe para una lengua de bajos recursos, con vocabulario extendido a partir de texto de entrenamiento y métricas reportadas sobre referencias exactas (sin normalización). Los resultados son de conjunto de desarrollo, no de test retenido, y el propio autor califica de débil la transferencia al habla experta de Santiago (58,7154 % WER en el conjunto separado KEA_AUDIO Santiago).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `wav2vec2_llama`: codificador de voz wav2vec2 + decodificador de texto Llama, reconocimiento autorregresivo |
| Parametros totales | 2.281.715.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; no se documentan variantes GGUF, INT8 ni otras) |
| Idiomas soportados | kabuverdianu (`kea`, `kea_Latn`) |
| Licencia | Apache-2.0 (modelo); dataset de origen CC-BY-4.0 |
| Formato de pesos | diccionario de estado completo en FP32 (aproximadamente 9,13 GB); no LoRA/QLoRA |

## Arquitectura y entrenamiento

El modelo sigue la receta upstream de Omnilingual ASR (framework fairseq2, familia `wav2vec2_llama`): un extractor de características y codificador de voz congelado según la receta original, acoplado a un decodificador de texto tipo Llama que genera la transcripción token a token de forma autorregresiva. El vocabulario de salida tiene 10.545 identificadores, con 10.546 filas de embedding de entrada incluyendo el marcador de identificación de lengua. La extensión de vocabulario se construyó exclusivamente con texto de entrenamiento y un mecanismo de reserva genérico de 256 tokens de bytes UTF-8; el texto de validación y test no se usó para cosechar vocabulario. La condicionamiento de lengua (`kea_Latn`) se activó en todas las muestras de entrenamiento con `lang_embeddings_p=1.0`.

El ajuste fino fue completo (no LoRA), sobre una única NVIDIA A100 de 80 GB, con pesos en FP32 y autocast BF16. Se realizaron 3.000 actualizaciones totales: 2.500 iniciales más 500 de continuación tras agotarse el presupuesto de tiempo del suite original. El optimizador fue AdamW (betas 0,9/0,98, epsilon 1e-8, weight decay 0), con tasa de aprendizaje pico de 1e-5 y esquema tri-etapa (10 % calentamiento, 40 % mantenimiento, 50 % decaimiento exponencial). La continuación reanudó los momentos de AdamW y el orden de datos desde cero, preservando pesos y la cola de decaimiento original (de 1,3572088083e-6 a 5e-7), por lo que es una continuación de pesos, no una reanudación exacta del estado de entrenamiento. Los datos provienen de `google/fleurs` configuración `kea_cv` (revisión fijada `70bb2e84b976b7e960aa89f1c648e09c59f894dd`), con 2.715 grabaciones (10,5087 horas) para entrenamiento y 366 (1,3235 horas) para validación; el split de test no se descargó ni evaluó. Se usaron las transcripciones `raw_transcription`, preservando mayúsculas, acentos, puntuación y espacios. La selección de checkpoint se hizo por el menor WER de validación de lectura, con intervalo de 250 actualizaciones.

## Capacidades

- Transcripción de voz a texto en kabuverdianu, con salida autorregresiva sensible a mayúsculas, acentos y puntuación.
- Reconocimiento sobre audio mono a 16 kHz normalizado, con longitud máxima de entrenamiento de 960.000 muestras (60 segundos).
- Condicionamiento explícito de lengua mediante el marcador `kea_Latn`.
- Manejo de caracteres fuera del vocabulario extendido mediante reserva de bytes UTF-8 (256 tokens); las secuencias UTF-8 inválidas se decodifican como U+FFFD.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente ASR.
- No dispone de modo de pensamiento (thinking), visión ni audio más allá de la transcripción.
- Capacidad multilingüe limitada al kabuverdianu; no se documenta transferencia a otras lenguas.

## Casos de uso

- Transcripción de corpus lingüísticos de kabuverdianu: el modelo permite convertir grabaciones de FLEURS y materiales similares en texto escrito con acentos y puntuación preservados, útil para investigación en lingüística de lenguas criollas y para ampliar recursos anotados.
- Subtitulado y documentación de entrevistas o testimonios en kabuverdianu: con audio a 16 kHz y segmentos de hasta 60 segundos, puede procesar grabaciones de campo y generar borradores de transcripción que un hablante nativo revise después.
- Digitalización de archivos sonoros de Cabo Verde: archivos de radio, tradición oral o patrimonio inmaterial pueden transcribirse por lotes para su indexación y búsqueda textual.
- Prototipos de asistentes de voz para servicios públicos en Cabo Verde: al ser un modelo ASR puro, se integraría como primer eslabón de una cadena (ASR → LLM → TTS) para atención ciudadana en criollo, siempre con revisión humana por la tasa de error actual.
- Evaluación comparativa de ASR de bajos recursos: sirve como referencia reproducible (receta, hiperparámetros y métricas documentadas) para investigadores que ajusten modelos fundacionales a otras lenguas con pocos datos.
- Investigación sobre variedades dialectales: el conjunto separado KEA_AUDIO Santiago permite medir la brecha entre habla de lectura y habla espontánea, un caso de estudio sobre generalización de dominio en ASR de bajos recursos.
- Anotación asistida en proyectos de documentación lingüística: la salida con referencias exactas (sin normalización) facilita el alineamiento con transcripciones ortográficas existentes.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Metrica | Dataset / conjunto | Resultado |
|---|---|---|
| WER (%) | FLEURS Kabuverdianu validación, referencias exactas (`kea_cv`, split validation, rev. `70bb2e84...`) | 18,0758 |
| CER (%) | FLEURS Kabuverdianu validación, referencias exactas (`kea_cv`, split validation, rev. `70bb2e84...`) | 5,0427 |
| WER (%) | KEA_AUDIO Santiago validación (284 clips) | 58,7154 |
| CER (%) | KEA_AUDIO Santiago validación (284 clips) | 30,4869 |

Detalles de cálculo: el WER usa palabras separadas por espacios; el CER usa puntos de código Unicode incluyendo espacios, sin minúsculas, sin eliminación de acentos, sin eliminación de puntuación y sin normalización Unicode. En validación de referencias exactas hubo 1.379 ediciones de palabra sobre 7.629 palabras de referencia y 2.230 ediciones de carácter sobre 44.222 caracteres. La pérdida de validación registrada nativamente fue 0,4306855 (campo llamado `CTC Loss` en la receta upstream, pero correspondiente a entropía cruzada autorregresiva). Todos los resultados son de conjunto de desarrollo, no de test retenido. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en FP32 ocupan aproximadamente 9,13 GB, por lo que se necesitan al menos unos 10-12 GB de VRAM para cargar el modelo, más memoria para activaciones y búferes de audio; con cuantización no documentada, la estimación no está disponible.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA A100 de 80 GB; para inferencia, una GPU con 16 GB o más (por ejemplo, RTX 4090, A100, H100) es un punto de partida razonable dado el tamaño en FP32.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 16 GB o más de VRAM (RTX 4090, RTX 4080, entre otras) para FP32; en tarjetas de 8-12 GB no cabe sin cuantización, que no está documentada.
- Opciones de despliegue: framework Omnilingual ASR (fairseq2) según la librería declarada `omnilingual-asr`; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (FLEURS kea) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KeaASRv2-LLM-1B_v2-ST | 2.281.715.328 | no disponible | 18,0758 % (validación, referencias exactas) | Apache-2.0 | Hugging Face |
| omniASR_LLM_1B_v2 (Meta, base) | no disponible | no disponible | no disponible | no disponible en la información | dl.fbaipublicfiles.com |
| Alternativas ASR para kabuverdianu | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de otros modelos ASR sobre kabuverdianu que permitan una comparación cuantitativa fiable. La única comparación posible es con el modelo base `omniASR_LLM_1B_v2`, del que no se reportan métricas en esta ficha.

## Limitaciones y advertencias

- Los resultados reportados son de conjunto de desarrollo (validación), no de test retenido; el split de test no se descargó ni evaluó, por lo que no hay estimación independiente de generalización.
- Transferencia débil al habla experta de Santiago: 58,7154 % WER y 30,4869 % CER en KEA_AUDIO Santiago, muy por encima del 18,0758 % de validación de lectura. El sufijo `ST` no garantiza buen rendimiento en esa variedad.
- Sesgos conocidos: no documentados explícitamente; al entrenarse solo con FLEURS (`kea_cv`, habla de lectura), es probable un sesgo hacia registro leído, vocabulario acotado y condiciones de grabación controladas.
- Riesgo de alucinación: no cuantificado; como modelo autorregresivo, puede generar texto plausible no presente en el audio, especialmente en segmentos ruidosos o fuera de dominio.
- Limitaciones de idioma: solo kabuverdianu; no se documenta soporte para portugués ni otras lenguas, y el condicionamiento de lengua está fijado a `kea_Latn`.
- Limitaciones de contexto: la longitud máxima de entrenamiento es de 60 segundos de audio (960.000 muestras a 16 kHz); audios más largos requieren segmentación.
- Restricciones de licencia: Apache-2.0 permite uso comercial del modelo, pero el dataset de origen (`google/fleurs`) es CC-BY-4.0 y debe atribuirse; conviene revisar las condiciones de la receta upstream de Meta.
- Caveat de producción: la continuación del entrenamiento no reanudó el estado exacto del optimizador ni el orden de datos, por lo que la reproducibilidad exacta del checkpoint publicado no está garantizada.
- La pérdida registrada como `CTC Loss` corresponde en realidad a entropía cruzada autorregresiva; no debe compararse directamente con métricas de modelos CTC.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Iscte-Sintra/KeaASRv2-LLM-1B_v2-ST
- Modelo base (pesos): https://dl.fbaipublicfiles.com/mms/omniASR-LLM-1B-v2.pt
- Repositorio Omnilingual ASR (Meta): https://github.com/facebookresearch/omnilingual-asr
- Dataset Google FLEURS: https://huggingface.co/datasets/google/fleurs
- Run de W&B, suite inicial V2: https://wandb.ai/iscteiul/LLM-CCV-Speech
- Run de W&B, continuación final `9di3exgw`: https://wandb.ai/iscteiul/LLM-CCV-Speech/runs/9di3exgw
