# Kaisye/VietNote-Zipformer-78M-Streaming

## Resumen

VietNote-Zipformer-78M-Streaming es un modelo de reconocimiento automático del habla (ASR) en streaming desarrollado por Kaisye, diseñado específicamente para transcribir voz en vietnamita con inserción frecuente de palabras en inglés (code-switching). Se trata de un transductor Zipformer2 causal de 77,7 millones de parámetros, entrenado con la librería icefall sobre el framework k2, y exportado a ONNX para su ejecución mediante sherpa-onnx en CPU, sin necesidad de GPU.

El modelo resuelve un problema concreto y poco cubierto por los modelos abiertos: la alternancia de idiomas dentro de una misma frase en vietnamita. Según el autor, reconoce aproximadamente el 75,5 % de las palabras en inglés embebidas en habla vietnamita, frente al 14-36 % de los modelos vietnamitas abiertos evaluados y en línea con APIs comerciales como Soniox (76 %). Está pensado para aplicaciones de subtitulado en vivo, notas de voz y transcripción de reuniones en entornos donde el despliegue en servidor con GPU no es viable.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en ONNX (fp32 e int8) y un checkpoint PyTorch para fine-tuning. Forma parte del proyecto VietNote ASR, que incluye además un módulo de inverse text normalization (ITN), un restaurador de puntuación y mayúsculas basado en XLM-RoBERTa y una demo web pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 causal (tamaño M), transductor stateless con pruned RNN-T loss |
| Parametros totales | 77,7 M (78 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 frames de contexto izquierdo; chunks de 640 ms (32 frames) |
| Tipos de cuantizacion | fp32 e int8 (cuantización per-channel) |
| Idiomas soportados | vietnamita (vi) e inglés (en), con code-switching intra-frase |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder, decoder, joiner) y PyTorch (`pretrained.pt`) |

## Arquitectura y entrenamiento

El modelo es un transductor Zipformer2 en configuración causal, lo que permite decodificación en streaming con una latencia algorítmica acotada. Emplea un vocabulario BPE de 6.144 tokens compartido entre vietnamita e inglés, lo que habilita el reconocimiento de palabras en ambos idiomas dentro de la misma secuencia sin conmutación explícita de modelo. La decodificación se realiza con `modified_beam_search` (4 caminos activos en el ejemplo de la model card) sobre sherpa-onnx.

El entrenamiento se llevó a cabo con icefall durante aproximadamente 1.500 horas de audio, 45 épocas, promediando los dos últimos checkpoints. El conjunto de entrenamiento incluye las particiones de train de FLEURS y VIVOS. El autor advierte que el conjunto de desarrollo de code-switching comparte fuentes con los datos de entrenamiento, por lo que los resultados en esa columna favorecen a este modelo. No se especifica en la información disponible la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR).

## Capacidades

- Reconocimiento de voz en streaming con chunks de 640 ms y contexto izquierdo de 128 frames.
- Code-switching vietnamita-inglés intra-frase, con una tasa de acierto del 75,5 % en palabras inglesas según el autor.
- Decodificación en CPU mediante sherpa-onnx en Linux, macOS, Windows, Android, iOS y Raspberry Pi.
- Modo offline (procesamiento de ficheros completos) con los pesos de la carpeta `offline/`, aproximadamente 1 punto mejor que el modo streaming.
- Salida en minúsculas y números como palabras; el proyecto incluye ITN para convertir cifras, fechas, importes y marcadores como "tỷ số 2-1" a formato con dígitos.
- Restauración de puntuación y mayúsculas mediante un modelo auxiliar XLM-RoBERTa base en ONNX (carpeta `punct/`).
- Manejo de autocorrecciones del hablante ("ba… à không, bốn triệu" → 4 triệu).
- Soporte de hotwords a través de los ejemplos del repositorio.
- No soporta tool calling, agentes ni otras capacidades propias de modelos de lenguaje; es exclusivamente un modelo ASR.

## Casos de uso

- Subtitulado en vivo de reuniones y clases: el modelo procesa audio en chunks de 640 ms y puede alimentarse con piezas de 100 ms en bucle para generar captions incrementales con latencia baja, adecuado para entornos corporativos o educativos donde se mezcla terminología técnica en inglés.
- Notas de voz en aplicaciones móviles: con los pesos int8 (83 MB) y sherpa-onnx, la inferencia cabe en Android e iOS sin conexión a servidor, lo que permite transcribir dictados localmente preservando la privacidad del audio.
- Transcripción de entrevistas y podcasts en vietnamita: el modo offline (279 MB fp32 o 88 MB int8) procesa ficheros completos con mejor precisión que el streaming, útil para pipelines por lotes.
- Asistentes de voz para atención al cliente en Vietnam: el reconocimiento de marcas y términos en inglés dentro de frases vietnamitas facilita la detección de productos y entidades extranjeras en centros de contacto.
- Documentación clínica dictada: el autor reporta un 13,87 % de SyER zero-shot en VietMed, lo que permite prototipar transcripción de notas médicas en vietnamita, siempre con revisión humana dado el dominio sensible.
- Despliegue en dispositivos de borde: Raspberry Pi y CPUs de gama baja pueden ejecutar el modelo int8 en tiempo real, habilitando quioscos, grabadoras inteligentes o sistemas de accesibilidad sin infraestructura GPU.
- Investigación en code-switching: el checkpoint PyTorch (`pytorch/pretrained.pt`, 311 MB) y la receta de fine-tuning con icefall permiten adaptar el modelo a dominios o acentos específicos.

## Benchmarks y rendimiento

Resultados declarados por el autor (SyER, %; menor es mejor). Todos los sistemas se reevaluaron en la misma máquina con el mismo normalizador de texto. La marca de zero-shot indica que el modelo no vio esos datos en entrenamiento.

| Sistema | Tipo | VietMed (zero-shot) | GigaSpeech2 (zero-shot) | FLEURS+VIVOS | Code-switching dev | Palabras inglesas |
|---|---|---|---|---|---|---|
| VietNote-Zipformer-78M-Streaming | streaming | 13,87 | 10,65 | 6,88 | 9,62 | 75,5 % |
| hynt Zipformer 30M streaming | streaming | 14,30 | 8,87 | 7,73 | 12,58 | 24,7 % |
| Moonshine streaming tiny vi | streaming | 19,74 | 14,38 | 10,50 | 22,10 | 20,8 % |
| hynt Zipformer 150M | offline | 11,90 | 7,20 | 5,14 | 10,81 | 35,5 % |
| hynt Zipformer 30M | offline | 12,93 | 7,40 | 6,06 | 11,01 | 28,9 % |
| VietASR Zipformer 70k h | offline | 14,19 | 6,75 | 7,50 | 13,22 | 14,3 % |
| PhoWhisper large | offline | 16,74 | no disponible | 6,03 | 16,31 | 30,8 % |
| Whisper large-v3 | offline | 36,64 | no disponible | 8,08 | 15,21 | 67,8 % |

En FLEURS vi (test) el modelo declara un 6,89 % de SyER según el model-index. El autor indica que los modelos hynt se entrenaron sobre VietMed_Labeled, Sub-GigaSpeech2-Vi y FLEURS, mientras que VietNote ASR solo usó las particiones de train de FLEURS y VIVOS, de ahí la comparación zero-shot en VietMed y GigaSpeech2. El conjunto de code-switching dev comparte fuentes con el entrenamiento y favorece a VietNote. La model card menciona además una comparación con APIs comerciales y audio LLMs sobre subconjuntos de 400 enunciados, pero la tabla correspondiente aparece truncada en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse sin GPU. Los pesos int8 (83 MB en streaming, 88 MB en offline) son la opción recomendada para móviles y CPUs pequeñas.
- VRAM: no requiere VRAM; el consumo es de RAM del sistema. El ejemplo de la model card usa `num_threads=2`.
- GPU: no son necesarias. Si se desea acelerar, sherpa-onnx puede ejecutarse sobre GPU, pero la información disponible no documenta configuraciones ni rendimiento en A100, H100 o RTX 4090.
- Compatibilidad con hardware de consumo: sí, incluido Raspberry Pi y dispositivos Android/iOS.
- Opciones de despliegue: sherpa-onnx (runtime principal, con bindings para Python, C++, Kotlin, Swift y otros), con los ficheros ONNX de encoder, decoder y joiner. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama (no aplicables a un transductor ASR).
- Latencia y throughput: no se publican cifras concretas de RTF (real-time factor) en la información disponible; el diseño con chunks de 640 ms fija la latencia algorítmica mínima en ese orden.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto/streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VietNote-Zipformer-78M-Streaming | 77,7 M | Zipformer2 transductor | 640 ms chunks, 128 frames contexto | Apache-2.0 | Hugging Face + sherpa-onnx |
| hynt Zipformer 30M streaming | 30 M | Zipformer transductor | streaming | no disponible en la información | Hugging Face |
| Moonshine streaming tiny vi | no disponible | encoder-decoder streaming | streaming | no disponible en la información | Hugging Face |
| hynt Zipformer 150M | 150 M | Zipformer transductor | offline | no disponible en la información | Hugging Face |
| PhoWhisper large | no disponible | Whisper fine-tuned | offline | no disponible en la información | Hugging Face |

Frente a los modelos hynt, VietNote ofrece mejor SyER en VietMed y en code-switching, pero peor en GigaSpeech2 (10,65 frente a 8,87 del hynt 30M streaming). Frente a Whisper large-v3, el modelo es dos órdenes de magnitud menor en parámetros, mucho más rápido en CPU y sustancialmente mejor en vietnamita (13,87 frente a 36,64 en VietMed), aunque Whisper conserva mayor cobertura multilingüe general. La ventaja diferencial de VietNote es la tasa de reconocimiento de palabras inglesas embebidas (75,5 %), muy superior a la de los modelos abiertos comparados.

## Limitaciones y advertencias

- El conjunto de code-switching dev comparte fuentes con el entrenamiento; los resultados en esa columna están sesgados a favor del modelo y no deben tomarse como estimación limpia.
- El modelo solo cubre vietnamita e inglés; no es un ASR multilingüe general.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- La cuantización int8 debe hacerse per-channel; el autor advierte que una exportación int8 per-tensor deja de emitir texto tras unos segundos. No se debe recuantizar con ajustes por defecto.
- La salida en streaming es en minúsculas y con números como palabras; para obtener texto con dígitos, puntuación y mayúsculas hay que aplicar el ITN y el restaurador de puntuación del repositorio, que añaden dependencias (el modelo de puntuación ocupa 1,1 GB).
- Riesgo de alucinación y errores en dominios especializados: el 13,87 % de SyER en VietMed indica que aún hay margen de error relevante en vocabulario médico.
- No se documentan sesgos por acento, género o edad más allá de la mención a resultados por acento en BENCHMARK.md; conviene evaluar sobre el dominio objetivo antes de producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo auxiliar de puntuación (XLM-RoBERTa) puede tener condiciones propias que conviene revisar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por la comunidad es aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaisye/VietNote-Zipformer-78M-Streaming
- Repositorio del proyecto VietNote ASR: https://github.com/kaisye/vietnote-asr
- Demo en vivo: https://asr.vietnote.vn
- Guía de fine-tuning: https://github.com/kaisye/vietnote-asr/blob/main/docs/FINETUNE.md
- Benchmarks completos: https://github.com/kaisye/vietnote-asr/blob/main/docs/BENCHMARK.md
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Framework de entrenamiento icefall: https://github.com/k2-fsa/icefall
- Dataset VietMed: https://huggingface.co/datasets/leduckhai/VietMed
- Dataset GigaSpeech2: https://huggingface.co/datasets/speechcolab/gigaspeech2
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
