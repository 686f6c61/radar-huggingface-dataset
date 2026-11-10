# oluwagbotty/nemo-ctc-ky-ft-10ep-frac25

## Resumen

`nemo-ctc-ky-ft-10ep-frac25` es un modelo de reconocimiento automático del habla (ASR) para kinyarwanda, desarrollado por el usuario de Hugging Face `oluwagbotty`, que parte del checkpoint `nvidia/stt_rw_conformer_ctc_large` de NVIDIA y lo ajusta fino sobre el split de entrenamiento del dataset CDLI *Rwandan Kinyarwanda Non-Standard Speech v1.0*, cuyos hablantes son en su mayoría adultos jóvenes con tartamudez. El objetivo es investigar el reconocimiento de habla no estándar (disfluencias, repeticiones, bloqueos) en un contexto de bajos recursos, dentro del Rwanda Innovation Sprint coordinado por el Centre for Digital Language Inclusion (UCL).

Arquitectura: conformer CTC de NVIDIA NeMo, sin decodificador autorregresivo ni módulo de atención sobre texto previo, lo que elimina el modo de fallo de bucles repetitivos típico de los modelos encoder-decoder como Whisper. El repositorio ocupa 0,5 GB y los pesos se distribuyen en formato `.nemo` (`best.nemo`). El modelo cubre un único idioma (`rw`) y se publica bajo licencia CC-BY-4.0.

Es relevante porque aborda un caso poco cubierto —ASR para personas que tartamudean en una lengua africana de bajos recursos— y porque publica métricas desglosadas (WER agrupado, WER por enunciado, CER y recuento de bucles) con una advertencia metodológica explícita sobre el tamaño reducido del conjunto de test (9 hablantes). No es un modelo de propósito general: es un artefacto de investigación acotado a unas condiciones de grabación muy concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (NVIDIA NeMo), encoder CTC sin decodificador autorregresivo |
| Parametros totales | no disponible (hereda el tamaño de `nvidia/stt_rw_conformer_ctc_large`; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por fragmentos de audio; no se documenta la ventana máxima) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos `.nemo`; no se publican variantes cuantizadas) |
| Idiomas soportados | kinyarwanda (`rw`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (archivo `best.nemo`); tamaño del repo 0,5 GB |
| Modelo base | `nvidia/stt_rw_conformer_ctc_large` |
| Dataset de ajuste | `cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0` (split de train; acceso restringido) |
| Metricas declaradas | WER, CER |

## Arquitectura y entrenamiento

El modelo es un conformer con cabeza CTC, la arquitectura estándar de NVIDIA NeMo para ASR: bloques convolucionales y de autoatención que producen, para cada frame acústico, una distribución sobre el vocabulario de caracteres o subpalabras, sin generación secuencial. Esta elección es deliberada en el contexto del proyecto: el autor señala que los modelos CTC no pueden entrar en bucles, a diferencia de Whisper, y el recuento de bucles en la tabla de resultados es 0 en todos los splits.

El ajuste fino se realizó únicamente sobre el split de train del dataset CDLI, usando el split de dev para seleccionar checkpoint y el de test para una única evaluación posterior al entrenamiento; el split `extra` no se utilizó y ningún hablante aparece en más de un split. Hiperparámetros declarados: hasta 10 épocas con parada temprana sobre WER de dev (paciencia de 3 evaluaciones), semilla 42, `--lr 1e-4`, precisión `bf16-mixed`. El código de entrenamiento está en `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto (experimento `nemo-ctc-ky-ft-10ep-frac25`).

Los datos provienen de grabaciones realizadas en Ruanda en 2026, en interior y con bajo ruido, mediante una aplicación de tableta, a partir de consignas con imágenes (descripciones libres) y consignas de texto (frases leídas). No se documenta el volumen de horas ni el número de tokens de audio empleados en el ajuste.

## Capacidades

- Transcripción de voz a texto en kinyarwanda (`rw`) para habla no estándar, incluyendo disfluencias por tartamudez.
- Manejo de repeticiones de tartamudeo: las transcripciones de referencia escriben literalmente las repeticiones, y el modelo puede reproducirlas o no (el autor lo señala como comportamiento no garantizado).
- Decodificación greedy sobre audio de una grabación a la vez, tal como se evaluó.
- Ausencia estructural de bucles de repetición en la salida (propiedad de la decodificación CTC).
- No soporta tool calling ni function calling: es un modelo puramente acústico, sin interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio de entrada más allá del propio ASR, ni modo de razonamiento explícito.
- Capacidad multilingüe: no; solo kinyarwanda.

## Casos de uso

- Transcripción de entrevistas de investigación sobre tartamudez: el modelo está ajustado específicamente sobre habla con disfluencias, por lo que sirve para preprocesar grabaciones de participantes en estudios lingüísticos o clínicos, siempre que un humano revise la salida antes de cualquier uso.
- Subtitulado asistido para contenido en kinyarwanda con hablantes que tartamudean: al no generar bucles, la salida es más estable que la de modelos encoder-decoder en grabaciones largas y monológicas.
- Prototipos de accesibilidad en aplicaciones de tableta: las condiciones de entrenamiento (app de tableta, interior, bajo ruido) coinciden con el escenario de despliegue previsto, lo que reduce la brecha de dominio.
- Evaluación comparativa de ASR para lenguas de bajos recursos: sirve como línea base CTC ajustada para medir el efecto de arquitecturas y decodificadores sobre habla no estándar, con métricas desglosadas ya publicadas.
- Investigación sobre normalización de texto en kinyarwanda: el autor reporta resultados con dos normalizadores (el básico de Whisper y el estilo CDLI con paso de apóstrofos), lo que permite estudiar el impacto del preprocesado en las métricas.
- Anotación asistida de corpus de habla no estándar: generar transcripciones preliminares para que anotadores humanos corrijan, reduciendo el coste de transcripción manual en un dataset con acceso restringido.
- Docencia y experimentación con NeMo: el checkpoint y los scripts de entrenamiento permiten reproducir el ajuste fino en entornos con una sola GPU, dado el tamaño de 0,5 GB del repositorio.

## Benchmarks y rendimiento

Resultados publicados por el autor, decodificación greedy, una grabación a la vez, puntuados con el normalizador básico de texto de Whisper (y, para comparación con las model cards de CDLI, su paso de apóstrofos). El WER agrupado cuenta todas las palabras juntas; el WER y el CER por enunciado son medias sobre grabaciones, cada una limitada al 100 %.

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 47,2 | 15,6 | 48,7 | 16,7 | 0 |
| dev (6 hablantes) | 47,6 | 20,9 | 47,0 | 21,8 | 0 |
| test, normalizador estilo CDLI | 44,8 | 15,2 | 47,0 | no disponible | 0 |

El autor advierte que, con solo 9 hablantes en test, no pueden confirmarse diferencias inferiores a unos 3 puntos de WER entre dos modelos. No se publican comparaciones numéricas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; el repositorio pesa 0,5 GB, por lo que los pesos en sí caben holgadamente en cualquier GPU consumer moderna, pero el autor no publica cifras de VRAM ni de latencia.
- GPU recomendadas: no disponible; no se especifican modelos de GPU probados.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint, aunque no se documenta ninguna prueba concreta.
- Opciones de despliegue: NVIDIA NeMo (librería declarada, `library_name: nemo`); el archivo `best.nemo` se carga con las herramientas de NeMo. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que además no aplican directamente a un modelo CTC de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER en este test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `oluwagbotty/nemo-ctc-ky-ft-10ep-frac25` | no disponible (base conformer large) | no disponible | 47,2 % agrupado (test, 9 hablantes) | CC-BY-4.0 | Hugging Face, 0 descargas |
| `nvidia/stt_rw_conformer_ctc_large` (modelo base, sin ajuste) | no disponible | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face (NVIDIA NeMo) |
| Modelos CDLI de referencia para el mismo dataset | no disponible | no disponible | comparación cualitativa citada; cifras no incluidas en la información disponible | no disponible | model cards de CDLI |

No se dispone de datos numéricos de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa queda limitada al resultado del modelo ajustado.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes en test, en su mayoría hombres adultos jóvenes, grabaciones en interior con bajo ruido, habla leída y descrita a partir de imágenes, no conversacional. El rendimiento en niños, en otras discapacidades del habla, en entornos ruidosos, en audio telefónico o en habla con cambio de código es desconocido.
- Objetivos literales: las repeticiones por tartamudeo están escritas en las transcripciones, y el modelo puede reproducirlas o no; los bloqueos y las prolongaciones no son visibles en el texto.
- Sesgo hacia consignas de texto: las frases leídas también aparecen en las transcripciones de entrenamiento, por lo que los resultados con consignas de imagen son la mejor guía para habla abierta.
- Riesgo de alucinación: no se documenta una tasa de alucinación; sí se documenta la ausencia de bucles, pero una transcripción errónea puede cambiar el significado de lo dicho por la persona.
- Uso prohibido: no debe emplearse para diagnosticar o evaluar ninguna condición del habla, ni para identificar hablantes, ni en decisiones clínicas, legales o policiales. Los términos de CDLI prohíben reidentificar hablantes y construir voces que imiten a una persona.
- Recomendación operativa del autor: mostrar el texto a la persona hablante antes de actuar sobre él.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero las restricciones de los términos del dataset CDLI siguen aplicando al uso de los datos y a la reidentificación de hablantes.
- Validación estadística limitada: con 9 hablantes, diferencias inferiores a unos 3 puntos de WER no son concluyentes.
- Trazabilidad escasa: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks frente a alternativas publicados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/nemo-ctc-ky-ft-10ep-frac25
- Modelo base: https://huggingface.co/nvidia/stt_rw_conformer_ctc_large
- Dataset de ajuste (acceso restringido): https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Repositorio del proyecto (scripts `scripts/molab/run_experiments.py` y `experiments/finetune.yaml`): no disponible como URL en la información proporcionada
- Paper, blog o demo adicionales: no disponible en la información proporcionada
