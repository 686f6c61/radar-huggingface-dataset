# Muno459/fastconformer-quran

## Resumen

fastconformer-quran es un modelo de reconocimiento automático del habla (ASR) especializado en recitación coránica en árabe, desarrollado por el usuario Muno459. Parte del checkpoint `nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0` y se distribuye en formato ONNX optimizado para despliegue en producción, con soporte para detección de errores de pronunciación (mispronunciation detection) y anotaciones de tajwid. El modelo está orientado a aplicaciones de aprendizaje y verificación de recitación, no a ASR genérico en árabe.

La relevancia del proyecto radica en su enfoque en la evaluación rigurosa sin fuga de datos: el autor reporta métricas sobre recitadores no vistos durante el entrenamiento, un problema habitual en benchmarks de Corán donde los mismos recitadores aparecen en train y test. Sobre un benchmark de 600 clips sin fuga, declara un WER normalizado de 5,41, frente a 7,44 del FastConformer original de NVIDIA y 9,56 del ASR de producción de Tarteel.

El acceso al repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face. La licencia indicada es `npl-1.1`, con la etiqueta `license:other`, lo que obliga a revisar los términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hybrid (CTC + atención), derivada de NVIDIA NeMo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada no declarada) |
| Tipos de cuantizacion | no disponible (distribución en ONNX; cuantizaciones concretas no declaradas) |
| Idiomas soportados | Árabe (`ar`), específicamente recitación coránica |
| Licencia | `npl-1.1` (etiquetada como `other`); acceso restringido |
| Formato de pesos | ONNX (librería declarada: NeMo; repo de 4,3 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre el FastConformer híbrido de NVIDIA para árabe, una arquitectura transformer con convoluciones depthwise y decodificación conjunta CTC/atención. El autor lo ha ajustado (fine-tuning) para el dominio de recitación coránica, incorporando detección de pronunciación incorrecta y etiquetado de reglas de tajwid. La exportación a ONNX sugiere un objetivo de despliegue en entornos de inferencia sin dependencia del stack completo de NeMo.

En cuanto a datos, la model card referencia los conjuntos `tarteel-ai/everyayah`, `tarteel-ai/tlog` y `obadx/muaalem-annotated-v3`. El autor pone énfasis en la ausencia de fuga de datos: las métricas principales se calculan sobre recitadores no vistos (tres recitadores sin entrenamiento) y sobre un benchmark agregado de 600 clips que combina EveryAyah no visto, QUL no visto y datos telefónicos de tlog. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco habituales en ASR).

## Capacidades

- Reconocimiento automático de habla en árabe sobre recitación coránica, con normalización de texto para la evaluación.
- Detección de errores de pronunciación (mispronunciation detection), orientada a la verificación de recitación.
- Anotación y modelado de reglas de tajwid.
- Robusteza declarada frente a audio telefónico, según la composición del benchmark agregado.
- Evaluación sobre recitadores no vistos, lo que indica cierta capacidad de generalización a voces nuevas.
- No se declara soporte de tool calling, function calling, agentes, visión, audio de entrada multimodal ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al árabe; no se declaran otros idiomas.

## Casos de uso

- Aplicaciones de aprendizaje de recitación: el modelo transcribe la recitación del usuario y, combinado con la detección de errores de pronunciación, permite señalar desviaciones respecto al texto esperado en tiempo de práctica.
- Verificación automatizada de recitación en plataformas educativas: integrado como servicio ONNX, puede puntuar clips subidos por estudiantes y generar retroalimentación sobre tajwid.
- Corrección y alineación de transcripciones coránicas: útil para normalizar y alinear audio con texto de referencia en corpus de investigación, gracias a las métricas de CER reportadas sobre recitadores no vistos.
- Investigación en ASR de dominio específico: sirve como línea base reproducible para estudiar generalización entre recitadores y evaluar sin fuga de datos.
- Procesamiento de audio telefónico de recitación: el benchmark incluye datos de tlog, lo que respalda su uso en escenarios de calidad de audio degradada.
- Despliegue en entornos con requisitos de portabilidad: al distribuirse en ONNX, puede integrarse en servicios de inferencia que no dispongan de NeMo, siempre que se respete la licencia y el acceso restringido.
- Herramientas de control de calidad para publicadores de audio coránico: detección de segmentos mal recitados o mal transcritos antes de su publicación.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (métricas no verificadas, `verified: false`):

| Benchmark | Métrica | Valor | Notas |
|---|---|---|---|
| EveryAyah held-out (3 recitadores sin entrenamiento) | WER normalizado | 0,93 | Equivalente a 93 % de WER; escenario de recitadores completamente no vistos |
| EveryAyah held-out (3 recitadores sin entrenamiento) | CER normalizado | 0,26 | Equivalente a 26 % de CER |
| Benchmark sin fuga (EveryAyah no visto + QUL no visto + tlog teléfono, 600 clips) | WER normalizado | 5,41 | Frente a 7,44 de NVIDIA FastConformer y 9,56 del ASR de producción de Tarteel |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 4,3 GB, lo que da una referencia del tamaño de los pesos en disco.
- GPU recomendadas: no declaradas por el autor. Por el tamaño del checkpoint, es razonable esperar que quepa en GPUs de consumo con suficiente memoria, pero no se confirma en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada; depende de la variante ONNX y del runtime elegido.
- Opciones de despliegue: ONNX Runtime (formato principal del repo); NeMo queda como librería declarada por el modelo base, aunque el artefacto distribuido es ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastconformer-quran (Muno459) | no disponible | no disponible | WER 5,41 en benchmark sin fuga (600 clips); CER 0,26 en recitadores no vistos | `npl-1.1` / `other`, acceso restringido | Hugging Face, gated |
| nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0 | no disponible | no disponible | WER 7,44 en el mismo benchmark según el autor | licencia NVIDIA (consultar model card) | Hugging Face |
| ASR de producción de Tarteel (referencia) | no disponible | no disponible | WER 9,56 en el mismo benchmark según el autor | no disponible | servicio propietario |

No se dispone de datos suficientes para comparar con otros modelos especializados en recitación coránica más allá de las referencias incluidas por el autor.

## Limitaciones y advertencias

- Las métricas declaradas no están verificadas (`verified: false`) y proceden del propio autor; conviene reproducirlas antes de tomar decisiones de producción.
- El WER de 0,93 (93 %) sobre recitadores completamente no vistos indica una generalización muy limitada a voces fuera de la distribución de entrenamiento, pese a las buenas cifras agregadas.
- Dominio muy restringido: árabe coránico; no es adecuado para ASR general en árabe ni para otros idiomas.
- Riesgo de alucinación de texto: como todo modelo seq2seq/CTC, puede generar transcripciones plausibles pero incorrectas, especialmente con audio degradado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la integración automatizada.
- Licencia `npl-1.1` con etiqueta `other`: es imprescindible revisar los términos antes de cualquier uso comercial; no se garantiza permiso de uso comercial en la información disponible.
- No se detallan sesgos específicos ni composición demográfica del dataset; la cobertura de recitadores, estilos y calidades de audio puede ser limitada.
- No se declaran requisitos de hardware ni latencias, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muno459/fastconformer-quran
- Modelo base: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0
- Dataset EveryAyah: https://huggingface.co/datasets/tarteel-ai/everyayah
- Dataset tlog: https://huggingface.co/datasets/tarteel-ai/tlog
- Dataset muaalem-annotated-v3: https://huggingface.co/datasets/obadx/muaalem-annotated-v3
