# dys-asr/parakeet-rnnt-0.6b-v2split-uniform

## Resumen

Parakeet RNN-T 0.6B — uniform-sampling control on the v2 split es un modelo de reconocimiento automático del habla (ASR) en inglés especializado en habla atípica o disártrica, publicado por el usuario dys-asr. Se trata de un ajuste fino del modelo base extraordinarylab/parakeet-unified-en-0.6b, con 618.314.241 parámetros reales (según los pesos en safetensors) y un tamaño de repositorio de 2,5 GB. Su arquitectura es un transductor RNN-T (Parakeet) implementado en la librería transformers bajo la clase ParakeetForRNNT.

El modelo no se presenta como un producto, sino como el brazo de control de un experimento: reproduce la misma receta que su hermano dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout, pero con un reparto de entrenamiento/validación que reserva más datos y muestreo uniforme. El autor lo publica explícitamente para que el control pueda auditarse frente al muestreador ponderado por etiología que motiva la investigación.

Su relevancia es doble. Por un lado, aborda el habla disártrica asociada a cinco etiologías (Parkinson, ELA, síndrome de Down, parálisis cerebral e ictus), un dominio donde los ASR convencionales fallan de forma severa. Por otro, documenta con detalle los errores por etiología, mostrando una diferencia de 7,6 veces entre la etiología más fácil y la más difícil, lo que resulta útil para quien planifique corpus o estrategias de ajuste fino en accesibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor RNN-T (Parakeet), clase ParakeetForRNNT de transformers; decodificación autoregresiva |
| Parametros totales | 618.314.241 (dato real de safetensors) |
| Longitud de contexto | No disponible. La entrada es audio mono a 16 kHz; los fragmentos de entrenamiento se filtran entre 0,5 y 45 s, pero no se declara un máximo de audio en inferencia |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no se declaran variantes GGUF, AWQ, GPTQ ni cuantizaciones de 8 o 4 bits |
| Idiomas soportados | Inglés (en) únicamente |
| Licencia | other — speech-accessibility-project-dua (Speech Accessibility Project Data Use Agreement, University of Illinois Beckman Institute) |
| Formato de pesos | safetensors (repositorio de 2,5 GB) |
| Libreria | transformers, requiere transformers>=5.9 (no cargable en la línea 4.x) |
| Pipeline | automatic-speech-recognition |
| Modelo base | extraordinarylab/parakeet-unified-en-0.6b (ajuste fino) |
| Fecha de publicacion | 19 de septiembre de 2026 según metadatos del repositorio |

## Arquitectura y entrenamiento

El modelo es un transductor RNN-T: un codificador acústico combinado con una red de predicción y una red conjunta que produce la distribución sobre tokens de texto, con decodificación autoregresiva. Frente a las cabeceras CTC, este esquema suele ofrecer mejor alineación y precisión, a costa de una decodificación más lenta, algo que la propia model card reconoce explícitamente ("slow relative to CTC"). No se detallan en la información disponible el número de capas, la dimensión del modelo ni el esquema de atención del codificador.

El entrenamiento se realizó durante diez épocas sobre dieciséis GH200, con muestreo uniforme, batch efectivo de 32 (2 por dispositivo), AdamW con tasa 1e-4 y schedule tri-stage (10 % de warmup, 40 % de mantenimiento), weight decay 0,01, layerdrop 0,05, gradient clipping de 1,0, precisión bf16, semilla 42 y 138.110 pasos de optimizador. La aumentación incluye perturbación de velocidad en el rango 0,8-1,2, SpecAugment (5 % del eje temporal en tramos de 10 fotogramas y 40 % del eje mel en tramos de 27 bins) y SpecCutout (dos rectángulos de 20x20). Los pesos publicados corresponden a la época 9, la mejor de las diez según CER de desarrollo; la época 10 alcanzó 4,844 %.

El corpus de entrenamiento suma 446.774 registros antes de filtrado y 441.928 tras aplicar filtros de duración (0,5-45 s) y de 200 tokens de etiqueta: 250.014 de SAPC-1 (train y dev), 132.494 de SAPC-2 train excluyendo el test1 de SAPC-1, 55.988 de habla sintética generada con CosyVoice3 y 8.278 fragmentos alineados forzosamente extraídos de grabaciones demasiado largas. Todo el material procede de los corpus del reto, por lo que se trata de un modelo de pista restringida (constrained track). No se menciona RLHF ni DPO; es un ajuste supervisado puro sobre pares audio-transcripción.

## Capacidades

- Transcripción de voz a texto en inglés para habla típica y, sobre todo, para habla disártrica asociada a Parkinson, ELA, síndrome de Down, parálisis cerebral e ictus.
- Manejo de audio mono a 16 kHz como único formato de entrada admitido.
- Procesamiento de fragmentos de hasta 45 segundos, el límite superior usado en el filtrado del corpus de entrenamiento.
- Salida en minúsculas, sin puntuación y con los números escritos como palabras, una normalización deliberada del corpus.
- Extracción de características acústicas (el repositorio declara también el tag feature-extraction además de automatic-speech-recognition).
- Capacidad de servir como punto de partida para ajuste fino adicional sobre corpus propios, siempre dentro de los términos del acuerdo de uso.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, visión, audio generativo ni modo de pensamiento. Es un modelo puramente acústico-textual de una sola tarea.
- No es multilingüe: solo inglés.

## Casos de uso

- Accesibilidad y subtitulado para hablantes con disartria: el modelo transcribe voz con alteraciones motoras del habla donde los ASR generalistas degradan mucho, con un CER mediano del 2,63 % en Parkinson y del 8,45 % en síndrome de Down en el conjunto de validación descrito.
- Comunicación aumentativa y alternativa (AAC): integrado como motor de voz a texto en aplicaciones que convierten el habla de un usuario con disartria en texto para comunicación asistida, usando fragmentos cortos por debajo del límite de 16 kHz mono.
- Investigación en ASR de habla atípica: sirve como línea base reproducible y como control de muestreo uniforme frente al brazo ponderado por etiología, con la ventaja de que su receta completa está documentada (épocas, semilla, schedule, aumentaciones).
- Análisis de error por etiología: los datos publicados de CER por hablante permiten priorizar la recogida de datos en los grupos con peor rendimiento (parálisis cerebral, síndrome de Down e ictus, con medianas de 10,36 %, 8,45 % y 7,22 % respectivamente).
- Preprocesado por lotes de corpus lingüísticos o clínicos: transcripción de grabaciones largas troceadas en fragmentos de 0,5 a 45 s para su posterior análisis estadístico o anotación, sin uso diagnóstico.
- Ajuste fino específico de dominio: al ser un checkpoint de 618 M de parámetros, es viable reentrenarlo o adaptarlo con LoRA sobre un corpus reducido de una etiología concreta, partiendo de un modelo ya expuesto a habla disártrica.
- Validación de pipelines de accesibilidad antes de producción: permite medir el suelo de rendimiento esperable en habla severamente afectada (el peor hablante de síndrome de Down alcanza un 57,71 % de CER) y dimensionar expectativas de usuario.
- Reproducibilidad de experimentos de muestreo de datos: comparar este control contra el modelo con muestreador por etiología en un conjunto con las cinco etiologías representadas, algo imposible con el dev oficial de SAPC-2, que no contiene ningún hablante de Parkinson.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto retenido de la partición v2 (38.141 enunciados tras filtrado, 98 hablantes y 38.588 enunciados antes de filtrar):

| Modelo / export | CER | WER |
|---|---:|---:|
| Este modelo (epoca 9) | 4,84 % | 7,83 % |
| Particion completa, export final (hermano) | 4,94 % | 7,91 % |

Desglose por etiología sobre el mismo conjunto retenido (CER por hablante):

| Etiologia | Hablantes | Mediana | Media | Peor hablante |
|---|---:|---:|---:|---:|
| Paralisis cerebral | 15 | 10,36 % | 12,70 % | 38,19 % |
| Sindrome de Down | 17 | 8,45 % | 12,92 % | 57,71 % |
| Ictus | 10 | 7,22 % | 11,33 % | 36,41 % |
| Parkinson | 33 | 2,63 % | 4,48 % | 13,92 % |
| ELA | 23 | 1,37 % | 2,05 % | 8,31 % |

Advertencias del propio autor sobre estas cifras: no son comparables con los CER que la familia de modelos reporta en otros lugares, que proceden del conjunto de test secuestrado del reto a través de Codabench. Este es un resultado local de desarrollo sobre un conjunto elegido para incluir Parkinson, una etiología que el modelo maneja mucho mejor que la media, por lo que la cifra lee aproximadamente 1,2 puntos por debajo de lo que la misma receta obtiene en el dev de SAPC-2, que carece de hablantes de Parkinson. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) porque no aplican a un modelo ASR, y no hay datos de LibriSpeech, Common Voice ni otros conjuntos públicos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,3 GB solo para los pesos en bf16 (618 M de parámetros) y unos 2,5 GB en fp32, más el coste de activaciones y buffers de decodificación autoregresiva. En la práctica, un presupuesto de 3-4 GB de VRAM es suficiente para audio de duración moderada; son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria. Cabe en tarjetas de consumo como RTX 3050, RTX 3060, RTX 4060, RTX 4090 y en iGPU con memoria compartida suficiente, aunque con mayor latencia. Para lotes grandes o servicio concurrente, A100, H100 o L40S aportan margen sobrado.
- Cabe en GPU de consumo: sí, con holgura, dado el tamaño de 0,6 B de parámetros. La restricción real no es la memoria sino la velocidad de decodificación autoregresiva.
- Opciones de despliegue: transformers (AutoProcessor y ParakeetForRNNT) con la versión >=5.9, que es la vía documentada en la model card. No se documenta soporte de vLLM, TGI, llama.cpp, Ollama ni ninguna ruta GGUF en la información disponible; dado que la arquitectura RNN-T de Parakeet no es un transformer decoder estándar, no debe asumirse compatibilidad con esos motores.
- Latencia y throughput: no disponibles como cifra. La model card solo indica cualitativamente que la decodificación es lenta en comparación con CTC, por su naturaleza autoregresiva.
- Entrenamiento (referencia): diez épocas sobre dieciséis GH200 con batch efectivo de 32 y 138.110 pasos de optimizador. No es representativo de los requisitos de inferencia.
- Requisito de entrada: audio mono a 16 kHz. Cualquier otra frecuencia de muestreo o número de canales debe remuestrearse y convertirse a mono antes de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Datos de rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| dys-asr/parakeet-rnnt-0.6b-v2split-uniform (este) | 618.314.241 | CER 4,84 % / WER 7,83 % en el conjunto retenido v2 (epoca 9) | speech-accessibility-project-dua (other) | HuggingFace, transformers>=5.9, safetensors |
| dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout (hermano) | No disponible en esta informacion | CER 4,94 % / WER 7,91 % en el mismo conjunto retenido (export final, particion completa) | No disponible en esta informacion | HuggingFace |
| extraordinarylab/parakeet-unified-en-0.6b (modelo base) | No disponible en esta informacion | No disponible en esta informacion | No disponible en esta informacion | HuggingFace |

La diferencia entre este modelo y su hermano es de 0,10 puntos de CER y 0,08 de WER en el conjunto retenido, coherente con que este control entrenó un 4,6 % menos de datos de forma deliberada. Fuera de esta familia no se dispone de cifras verificables de alternativas comparables en la información proporcionada, por lo que no se incluyen otros ASR de tamaño similar.

## Limitaciones y advertencias

- Es un control experimental, no un modelo de producción. El autor lo publica para que el brazo con muestreador ponderado por etiología pueda compararse contra algo, y advierte que debe esperarse un rendimiento ligeramente peor que su hermano por haber entrenado un 4,6 % menos de datos.
- Ejecución única con semilla única. No hay estimación de varianza, por lo que las diferencias de décimas de punto entre modelos no deben interpretarse como significativas sin réplicas.
- Las cifras de CER y WER publicadas provienen de un conjunto de desarrollo local elegido para incluir Parkinson, una etiología que el modelo resuelve bien. No son comparables con los resultados del test secuestrado del reto, y el autor estima que leen aproximadamente 1,2 puntos por debajo de lo que la misma receta obtiene en el dev sin Parkinson de SAPC-2.
- Sesgo de etiología marcado: la mediana de CER de parálisis cerebral (10,36 %) es 7,6 veces la de ELA (1,37 %). Dentro de cada etiología la dispersión entre hablantes es aún mayor, con medias muy por encima de las medianas, lo que indica que unos pocos hablantes gravemente afectados concentran buena parte del error.
- Salida normalizada: minúsculas, sin puntuación y con números escritos como palabras. No debe esperarse capitalización, signos de puntuación ni cifras arábigas sin postprocesado.
- Solo inglés. No hay soporte multilingüe ni de code-switching declarado.
- Solo audio mono a 16 kHz. Entradas estéreo o con otra frecuencia deben convertirse previamente.
- Decodificación autoregresiva, más lenta que una cabecera CTC, lo que penaliza escenarios de alto throughput.
- Requiere transformers>=5.9 y no es cargable desde la línea 4.x, lo que puede romper entornos con dependencias fijadas a versiones anteriores.
- Restricciones de licencia: la licencia es "other" con nombre speech-accessibility-project-dua. Los corpus del Speech Accessibility Project se rigen por su propio acuerdo de uso de datos y no se redistribuyen con el modelo; reproducir el conjunto de entrenamiento exige acceso autorizado. Los términos de Fun-CosyVoice3 aplican al componente sintético. El uso comercial no está aclarado en la información disponible y debe consultarse el acuerdo antes de cualquier despliegue productivo.
- No es una herramienta clínica. Nada en el modelo ni en sus resultados permite inferir un diagnóstico. Cualquier uso en contexto sanitario requiere validación independiente y supervisión profesional.
- Riesgo de alucinación y de sustituciones plausibles: como todo ASR neuronal, puede generar palabras no pronunciadas, especialmente en hablantes con afectación severa donde el CER supera el 50 %. No se han publicado tasas de inserción específicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-v2split-uniform
- Modelo hermano (brazo con muestreador ponderado): https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout
- Modelo base: https://huggingface.co/extraordinarylab/parakeet-unified-en-0.6b
- Corpus SAPC-1: https://huggingface.co/datasets/dys-asr/sapc1
- Corpus SAPC-2: https://huggingface.co/datasets/dys-asr/sapc2
- Licencia y acuerdo de uso (Speech Accessibility Project, Beckman Institute): https://speechaccessibilityproject.beckman.illinois.edu/
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada. La busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces recuperados correspondian a recursos sobre trastornos del aprendizaje sin relacion con el modelo.
