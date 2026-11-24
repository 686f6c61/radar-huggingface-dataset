# davitlive5/Lapillus-v3

## Resumen

Lapillus-v3 es un modelo de reconocimiento automatico del habla (ASR) para armenio oriental, desarrollado por Davit Ghazaryan bajo el identificador davitlive5. Se trata de un FastConformer hibrido RNN-T + CTC de 115 millones de parametros, afinado a partir de Lapillus-v1 y orientado especificamente a audio de centro de llamadas y telefonia, con salida de texto que incluye puntuacion y mayusculas. Su relevancia radica en que cubre un idioma con muy pocos recursos ASR de calidad y en que incorpora en el propio repositorio los artefactos de decodificacion (un modelo de lenguaje de 8-gramas y un LM neuronal de 86M parametros para rescoring de n-best) necesarios para reproducir sus cifras.

El modelo se distribuye en formato NeMo (`.nemo`) y se apoya en la libreria `nemo_toolkit[asr]`. Frente a su modelo predecesor interno, mejora de forma consistente en las diez pruebas de evaluacion declaradas por el autor, con una reduccion media de 0,54 puntos de WER, y destaca especialmente en FLEURS (de 4,94 a 4,40) y en audio telefónico simulado con codec G.711 (de 8,66 a 8,23 en Common Voice).

La ficha se basa exclusivamente en la informacion publicada en Hugging Face y en la model card del autor. No hay datos publicos sobre el volumen de datos de entrenamiento, la composicion del corpus ni detalles del pipeline de aumento de datos, ya que el autor indica que el afinado se realizo sobre datos privados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hibrido RNN-T + CTC |
| Parametros totales | 115M (modelo acustico); LM neuronal adicional de 86M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; se recomienda segmentar audio de mas de ~30 segundos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Armenio (hy), variante oriental |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (NeMo); LM 8-gramas en `.nemo`; LM neuronal en `.pt` |
| Tamano del repositorio | 3,2 GB |
| Frecuencia de muestreo de entrada | 16 kHz mono (audio telefonico de 8 kHz debe remuestrearse) |
| Modelo base | davitlive5/Lapillus-v1 |

## Arquitectura y entrenamiento

Lapillus-v3 emplea una arquitectura FastConformer con cabeza hibrida RNN-T y CTC, un diseno habitual en la familia NVIDIA NeMo para ASR. El modelo acustico tiene 115M parametros y se ha afinado por continuacion desde Lapillus-v1, que a su vez deriva de `stt_hy_fastconformer_hybrid_large_pc` de NVIDIA (licencia CC-BY-4.0). El repositorio incluye tres artefactos: el modelo acustico (`Lapillus-v3.nemo`), un modelo de lenguaje KenLM de 8-gramas a nivel de token para beam search (`lm/hy_tok8v2_lm.nemo`) y un Transformer LM neuronal de 86M parametros para rescoring de n-best (`nlm/hy_nlm86m.pt` junto con `nlm/nlm.py`).

El autor no publica el volumen de tokens de entrenamiento ni la composicion del dataset, limitandose a indicar que el afinado y el entrenamiento de los modelos de lenguaje se realizaron sobre datos privados. La innovacion practica mas relevante es el pipeline de decodificacion empaquetado: beam search de tamano 8 combinado con el LM de 8-gramas (alpha 0,3), puntuacion CTC (peso 0,8), rescoring con el LM neuronal (peso 1,2) y un bonus de longitud (peso 4). Este esquema es el que produce las cifras de WER reportadas y es reproducible con el codigo de la model card.

## Capacidades

- Transcripcion de voz a texto en armenio oriental con puntuacion y mayusculas.
- Reconocimiento robusto en audio telefonico: el autor evalua con una simulacion de centro de llamadas que incluye ruido, babble, reverberacion de sala, banda 300-3400 Hz, muestreo a 8 kHz, codec G.711 y perdida de paquetes.
- Decodificacion con beam search y modelo de lenguaje de 8-gramas a nivel de token.
- Rescoring de n-best con un Transformer LM neuronal de 86M parametros.
- Salida hibrida RNN-T y CTC, lo que permite elegir la cabeza de decodificacion.
- No soporta tool calling, agentes, vision ni audio multimodal: es un modelo ASR puro.
- No hay soporte declarado de deteccion de idioma ni de otros idiomas distintos del armenio oriental.

## Casos de uso

- Transcripcion de llamadas en centros de atencion al cliente: el modelo esta afinado especificamente para audio telefonico con codec G.711 y perdida de paquetes, por lo que puede integrarse en el pipeline de grabacion de un contact center para generar transcripciones con puntuacion listas para analisis de calidad.
- Generacion de actas y resumenes de reuniones en armenio: al producir texto con mayusculas y puntuacion, la salida puede alimentar directamente un modelo de resumen o un sistema de gestion documental sin postprocesado linguistico pesado.
- Subtitulado de contenido audiovisual en armenio oriental: adecuado para material con habla clara; el autor advierte de mayor tasa de error en dialogo de cine y solapamiento de voces, por lo que conviene revisar la salida en ese dominio.
- Analisis de conformidad y palabras clave en grabaciones: la transcripcion permite busqueda de terminos, deteccion de scripts y auditoria de llamadas, con la salvedad de que las cifras numericas se escriben como palabras.
- Sistemas de dictado y notas de voz: el modelo puede transcribir audio de 16 kHz mono en aplicaciones de productividad, segmentando previamente las grabaciones de mas de 30 segundos.
- Investigacion en ASR de bajos recursos: al distribuirse con licencia CC-BY-4.0 y con los LM de decodificacion incluidos, sirve como linea base reproducible para experimentos en armenio y para comparar tecnicas de rescoring.
- Pipeline de datos para entrenamiento de otros modelos: las transcripciones a gran escala de audio armenio pueden emplearse para generar corpus etiquetados destinados a otros fines de NLP.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER normalizado en %, menor es mejor). Todas las filas usan el mismo decodificador: beam 8 + LM de 8-gramas + puntuacion CTC + rescoring con LM neuronal. Los conjuntos "Phone" son audio de test pasado por una simulacion fija de centro de llamadas; los "Call-centre" son grabaciones de estilo call center en armenio.

| Conjunto de test | Modelo interno previo | Lapillus-v3 |
|---|---|---|
| ArmBench Common Voice test | 3,76 | 3,78 |
| ArmBench FLEURS test | 4,94 | 4,40 |
| Phone Common Voice (G.711) | 8,66 | 8,23 |
| Phone FLEURS (G.711) | 7,10 | 6,93 |
| Call-centre clean | 6,31 | 5,63 |
| Call-centre phone | 8,10 | 7,50 |

Datos adicionales aportados por el autor: en las diez pruebas de evaluacion del conjunto de validacion, el cambio medio frente al modelo interno previo es de -0,54 puntos de WER (intervalo del 95 %: -0,66 a -0,43). Lapillus-v2 obtuvo 4,48 y 5,73 en los dos conjuntos ArmBench con su propio decodificador. Las metricas de la model-index figuran como no verificadas (`verified: false`), es decir, son resultados autoinformados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 115M parametros en el modelo acustico, la inferencia en FP32 requiere del orden de 0,5 GB solo para pesos, mas el estado de decodificacion y el LM neuronal de 86M parametros si se aplica rescoring; el repositorio completo ocupa 3,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente para el modelo acustico; para el pipeline completo con LM neuronal conviene disponer de 8-16 GB. No hay recomendaciones oficiales de NVIDIA ni del autor.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas tipo RTX 3060/4060 en adelante, aunque el dato no esta confirmado por el autor.
- Opciones de despliegue: NeMo (`nemo_toolkit[asr]`) es la via oficial documentada. No se mencionan soportes de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| Lapillus-v3 | 115M (+ LM 86M) | audio segmentado a ~30 s | Armenio oriental | CC-BY-4.0 | 3,78 (CV), 4,40 (FLEURS) |
| Lapillus-v1 (modelo base) | no disponible | no disponible | Armenio | CC-BY-4.0 | no disponible |
| NVIDIA `stt_hy_fastconformer_hybrid_large_pc` | no disponible | no disponible | Armenio | CC-BY-4.0 | no disponible |

No se dispone de datos publicos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa se limita a las cifras del propio autor frente a su modelo interno previo y a Lapillus-v2.

## Limitaciones y advertencias

- Solo armenio oriental: el autor advierte de mas errores en armenio occidental.
- La precision cae en dialogo de cine, habla con solapamiento intenso, nombres poco frecuentes y terminologia especializada.
- Los numeros se escriben como palabras, lo que puede requerir normalizacion posterior si se necesitan digitos.
- El audio debe segmentarse en fragmentos de unos 30 segundos como maximo antes de transcribir.
- El audio telefonico de 8 kHz debe remuestrearse a 16 kHz.
- El modelo se entreno sobre datos privados no documentados, lo que impide auditar sesgos de dominio, acentos o composicion del corpus.
- Riesgo de alucinacion en pasajes de audio ruidoso o silencioso, comun en modelos ASR hibridos; no hay evaluacion publicada de este comportamiento.
- Las cifras de benchmarks son autoinformadas y no verificadas (`verified: false`); conviene reproducirlas antes de tomar decisiones de produccion.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario citar al autor y conservar el aviso de licencia, y respetar las condiciones heredadas de Lapillus-v1 y del modelo de NVIDIA del que deriva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davitlive5/Lapillus-v3
- Modelo base Lapillus-v1: https://huggingface.co/davitlive5/Lapillus-v1
- Modelo de NVIDIA de origen (`stt_hy_fastconformer_hybrid_large_pc`): no disponible como enlace directo en la informacion proporcionada
- Paper o blog tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
