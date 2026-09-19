# dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-bpedrop

## Resumen

Parakeet RNN-T 0.6B — BPE-dropout es un modelo de reconocimiento automático del habla (ASR) especializado en habla disártrica y trastornos del habla, desarrollado por el grupo dys-asr para la Speech Accessibility Project Challenge. Se trata de un ajuste fino del modelo base extraordinarylab/parakeet-unified-en-0.6b, una arquitectura de transductor (RNN-T) con 618.314.241 parámetros, orientada a la transcripción de audio en inglés a 16 kHz mono. Su propósito es mejorar la accesibilidad de personas con disartria, un ámbito donde los sistemas ASR convencionales rinden muy por debajo de lo habitual.

La contribución técnica de esta variante concreta es el uso de BPE-dropout con probabilidad p = 0,1 sobre los objetivos de entrenamiento: cada fusión de subpalabras se omite con esa probabilidad al tokenizar la transcripción, de modo que la red de predicción no se fija a una única segmentación de cada palabra. Es una repetición controlada de la receta de diez épocas del modelo hermano dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout, con el resto de hiperparámetros idénticos, lo que permite una comparación directa entre ambos.

El modelo está entrenado exclusivamente con los corpus de la competición (SAPC-1 y SAPC-2) más habla sintética generada con CosyVoice3, lo que lo clasifica como entrada de "constrained track". La relevancia actual radica en que aborda un nicho desatendido —el habla atípica— con un modelo compacto (0,6 B de parámetros) que cabe en una GPU de consumo, aunque su licencia de uso de datos restringe la explotación comercial y su decodificación autorregresiva lo hace más lento que las alternativas CTC.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor RNN-T (ParakeetForRNNT), encoder + prediction network + joint network |
| Parametros totales | 618.314.241 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de audio limitada por el filtro de entrenamiento de 0,5-45 s por registro; entrada a 16 kHz mono) |
| Tipos de cuantizacion | No disponible en la model card; al ser safetensors en bf16 se pueden aplicar cuantizaciones estándar (int8/fp8) con herramientas externas, sin receta oficial publicada |
| Idiomas soportados | Inglés (en) únicamente |
| Licencia | speech-accessibility-project-dua (Other), detalle en https://speechaccessibilityproject.beckman.illinois.edu/ |
| Formato de pesos | safetensors (repo de 2,5 GB) |
| Libreria | transformers >= 5.9 (no cargable en la línea 4.x) |
| Modelo base | extraordinarylab/parakeet-unified-en-0.6b |

## Arquitectura y entrenamiento

El modelo es un transductor RNN-T de tipo Parakeet: un encoder acústico que procesa el mel-espectrograma, una red de predicción autorregresiva sobre tokens de texto y una red conjunta que combina ambos estados para emitir la distribución sobre el vocabulario. La decodificación es, por tanto, autorregresiva, lo que el propio autor señala como una desventaja de velocidad frente a arquitecturas CTC. La innovación concreta de esta ejecución es el BPE-dropout aplicado a los objetivos: con p = 0,1 se omite cada fusión BPE durante la tokenización de las transcripciones de entrenamiento, de manera que una misma frase se segmenta de forma distinta en cada época y la red de predicción no se estabiliza en una única forma de escribir una palabra. La evaluación usa un tokenizador separado sin dropout, por lo que las métricas de dev no se ven afectadas por el muestreo.

El cambio obligado para que el método funcionase está documentado con precisión: `ParakeetProcessor.__call__` tokeniza la transcripción dos veces (una para `labels` y otra para `decoder_input_ids` tras anteponer el token en blanco). Con muestreo activado, ambas llamadas producen segmentaciones distintas, la dimensión `U+1` de la red conjunta deja de coincidir con `max(target_lengths) + 1` y torchaudio lanza un error de longitud en el primer paso. El collator de entrenamiento de este modelo tokeniza una sola vez y construye la entrada del decodificador a partir de esa única muestra; con el dropout desactivado el resultado es idéntico bit a bit al del procesador estándar, lo que mantiene la comparabilidad con las otras variantes de la familia. Además, el muestreo alarga los objetivos: una frase de 18 tokens puede medir entre 18 y 22 tokens con este tokenizador.

Los datos de entrenamiento son 468.435 registros antes de filtrado, de los que sobreviven 463.177 tras aplicar los filtros de 0,5-45 s y 200 tokens de etiqueta: SAPC-1 train y dev (250.014), SAPC-2 train (153.500), habla sintética CosyVoice3 (55.988) y fragmentos forzados a partir de grabaciones excesivamente largas (8.933). El split de dev está genuinamente separado: `sapc2_dev_heldout.jsonl` contiene 17.582 clips y su intersección con los manifiestos de entrenamiento es vacía (verificado comparando rutas de fichero). La receta de entrenamiento son diez épocas sobre dieciséis GH200, batch efectivo 32 con 2 por dispositivo, AdamW a 1e-4 con schedule tri-stage (10 % warmup, 40 % hold), weight decay 0,01, layerdrop 0,05, gradient clipping 1,0, bf16, semilla 42 y 144.750 pasos de optimizador. La aumentación es perturbación de velocidad en línea sobre 0,8-1,2, SpecAugment (5 % del eje temporal en tramos de 10 frames, 40 % del eje mel en tramos de 27 bins) y SpecCutout (dos rectángulos de 20x20).

## Capacidades

- Transcripción de voz a texto en inglés para habla disártrica y habla atípica, el caso de uso central del modelo.
- Reconocimiento de habla general en inglés a 16 kHz mono, heredado del modelo base Parakeet unified.
- Salida en minúsculas, sin puntuación y con los números escritos como palabras (por ejemplo, "twenty one" en lugar de "21").
- Manejo de audio de entre 0,5 y 45 segundos por registro, según los filtros aplicados en entrenamiento.
- Procesamiento por lotes mediante `AutoProcessor` y `ParakeetForRNNT.generate`, con `batch_decode` para obtener las transcripciones.
- No soporta tool calling ni function calling: es un modelo puramente acústico, sin interfaz de instrucciones.
- No soporta agentes, razonamiento multi-paso ni modo thinking.
- No tiene capacidades de visión, audio más allá de la transcripción, ni generación de texto libre.
- No es multilingüe: solo inglés.

## Casos de uso

- Transcripción accesible para personas con disartria: el modelo se ha ajustado específicamente sobre SAPC-1 y SAPC-2, corpus de habla atípica, por lo que es adecuado para dictado personal y comunicación asistida donde los ASR genéricos fallan sistemáticamente.
- Subtitulado en directo de intervenciones de hablantes con trastornos del habla: con un modelo de 0,6 B ejecutable en GPU de consumo y latencia de decodificación autorregresiva, puede desplegarse en local para generar subtítulos sin enviar audio clínico a servicios externos.
- Investigación en reconocimiento de habla atípica: sirve como punto de referencia reproducible (semilla 42, receta documentada, partición de dev verificada) para comparar técnicas de regularización como BPE-dropout frente a la línea base de la misma familia.
- Evaluación comparativa de tokenización subpalabra: al ser una repetición controlada del modelo hermano con un único cambio (BPE-dropout p = 0,1), permite aislar el efecto del muestreo de segmentaciones sobre el CER en habla disártrica.
- Preprocesado de corpus clínicos o lingüísticos: transcripción por lotes de grabaciones de entre 0,5 y 45 segundos para generar anotaciones de texto que después se revisan manualmente por especialistas.
- Integración en aplicaciones de accesibilidad en entornos sin conectividad: al pesar 2,5 GB en safetensors y poder ejecutarse en una GPU de consumo o incluso en CPU, es viable en despliegues locales y con requisitos de privacidad estrictos.
- Prototipado de asistentes de voz para usuarios con habla atípica: la salida en minúsculas sin puntuar es directamente consumible por etapas posteriores de normalización, corrección o inserción de puntuación.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son sobre el split de dev retenido, comparando esta ejecución con la línea base sin BPE-dropout de la misma familia:

| Ejecución | Mejor época | CER dev (subconjunto de 4.000 enunciados) | CER dev (split completo) |
|---|---:|---:|---:|
| Baseline, sin cambios | 9 | 6,06 % | 6,25 % |
| Este modelo (BPE-dropout p=0,1) | 10 | 6,04 % | 6,09 % |

El propio autor advierte explícitamente de que ambas columnas deben tomarse con cautela: el subconjunto y el split completo no coinciden en el orden de las ejecuciones de esta familia, la diferencia es inferior a 0,2 puntos de CER y hay una sola semilla detrás de cada fila. El split completo tiene 17.492 enunciados frente a los 4.000 del subconjunto y es la medida más fiable, pero ninguna de las dos es un test de significación estadística. Todas las ejecuciones de la familia alcanzaron su máximo en la época 9 o 10 sin señales de sobreajuste, lo que sugiere que diez épocas pueden ser simplemente pocas. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,3 GB en bf16 solo para los pesos (618 M de parámetros); con activaciones, buffers de decodificación autorregresiva y audio en lote, conviene reservar 2-3 GB. En fp32 serían unos 2,5 GB solo de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o más. Los 16 GH200 del entrenamiento no son necesarios para inferencia. Una RTX 3060 de 12 GB, RTX 4070, RTX 4090, A100 o H100 sirven sobradamente; en las de gama alta el cuello de botella pasa a ser la naturaleza autorregresiva de la decodificación, no la memoria.
- Cabe en GPU de consumo: sí, en cualquier modelo con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090). También es viable en CPU con `torch` en fp32, aunque con latencia mucho mayor.
- Opciones de despliegue: la ruta soportada es `transformers >= 5.9` con `AutoProcessor` y `ParakeetForRNNT`. No hay confirmación en la información disponible de soporte en vLLM, TGI, llama.cpp, Ollama ni ONNX Runtime; llama.cpp y Ollama no cubren esta arquitectura de transductor en sus implementaciones estándar.
- Latencia y throughput estimados: no disponibles. El autor solo indica cualitativamente que la decodificación es lenta en comparación con CTC, sin cifras de RTF ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | CER dev | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-bpedrop (este) | 618,3 M | Audio 16 kHz mono, 0,5-45 s | 6,09 % (split completo, 17.492 utt.) | speech-accessibility-project-dua | HuggingFace, transformers >= 5.9 |
| dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout | No disponible en la información | Mismo corpus y receta | 6,25 % (split completo) | speech-accessibility-project-dua | HuggingFace |
| extraordinarylab/parakeet-unified-en-0.6b (modelo base) | No disponible en la información | Inglés, ASR unificado | No disponible | No disponible en la información | HuggingFace |
| NVIDIA Parakeet TDT 0.6B v2 (familia Parakeet, no comparado en la model card) | ~0,6 B | Inglés, ASR general | No disponible | No disponible en la información | HuggingFace |

No se han publicado en la información disponible comparaciones con modelos ASR de propósito general (Whisper, wav2vec 2.0, Conformer CTC) ni cifras de CER de esos sistemas sobre el split de dev de SAPC, por lo que no es posible establecer una comparativa numérica con alternativas fuera de la familia.

## Limitaciones y advertencias

- Una sola ejecución y una sola semilla: no hay estimación de varianza, y las diferencias de CER reportadas (0,16 puntos en el split completo) son menores que las que probablemente mostraría un barrido de semillas. El autor desaconseja expresamente leerlas como una clasificación de métodos.
- Dependencia de versión: requiere `transformers >= 5.9` y no es cargable con la línea 4.x, lo que puede romper entornos de producción anclados a versiones anteriores.
- Decodificación autorregresiva: más lenta que las alternativas CTC, sin cifras de latencia publicadas.
- Formato de salida restringido: minúsculas, sin puntuación y con los números escritos como palabras, lo que obliga a una etapa de postprocesado si se necesita texto presentable.
- Solo inglés y solo audio a 16 kHz mono; no hay soporte multilingüe ni de otras frecuencias de muestreo.
- Modelo de pista restringida: se entrenó únicamente con los corpus de la competición, sin datos externos, lo que limita su generalización fuera de ese dominio acústico.
- Licencia `speech-accessibility-project-dua`: los corpus SAPC están sujetos a su propio acuerdo de uso de datos y no se redistribuyen; reproducir el conjunto de entrenamiento exige acceso autorizado. Las condiciones de Fun-CosyVoice3 aplican al componente de síntesis. Es imprescindible revisar los términos antes de cualquier uso comercial.
- No es una herramienta clínica: la model card indica explícitamente que nada en el modelo permite inferir un diagnóstico.
- Riesgo de alucinación inherente a los modelos de secuencia a secuencia: no hay evaluación publicada de tasas de inserción o sustitución de palabras en audio fuera de dominio.
- Sesgos: no hay análisis publicado de sesgo por edad, sexo, tipo de disartria, acento o lengua materna de los hablantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-bpedrop
- Modelo hermano (línea base, misma receta sin BPE-dropout): https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout
- Modelo base: https://huggingface.co/extraordinarylab/parakeet-unified-en-0.6b
- Dataset SAPC-1: https://huggingface.co/datasets/dys-asr/sapc1
- Dataset SAPC-2: https://huggingface.co/datasets/dys-asr/sapc2
- Licencia y condiciones del Speech Accessibility Project: https://speechaccessibilityproject.beckman.illinois.edu/
