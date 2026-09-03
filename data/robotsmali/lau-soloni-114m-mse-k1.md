# RobotsMali/lau-soloni-114m-mse-k1

## Resumen

`lau-soloni-114m-mse-k1` es un modelo de traduccion de voz (speech translation) de extremo a extremo desarrollado por RobotsMali que transcribe audio en bambara directamente a texto en frances. El modelo incorpora la regularizacion semantica **Listen, Attend, Understand (LAU)**, una tecnica que ancla las representaciones acusticas a un espacio semantico de texto de altos recursos mediante una funcion de perdida auxiliar MSE, lo que estabiliza el entrenamiento en entornos de baja disponibilidad de datos y con traducciones de alta varianza.

El modelo se basa en un encoder **FastConformer** de 114 millones de parametros, inicializado desde el checkpoint `soloni-114m-tdt-ctc-v0` y ajustado sobre el corpus **Jeli-ASR** (aproximadamente 30 horas de habla bambara). Es un artefacto de investigacion centrado en la estabilidad semantica, no en la perfeccion ortografica: los autores advierten que, aunque captura la intencion semantica, puede cometer errores ortograficos en la salida en frances. Para este checkpoint concreto, se recomienda usar la rama de decodificacion CTC, que ofrece mejores metricas que la rama TDT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + Hybrid RNNT/CTC/Lau decoder |
| Parametros totales | 114 millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Bambara (entrada), frances (salida) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (`.nemo`), safetensors no disponible |

## Arquitectura y entrenamiento

El modelo usa un encoder **FastConformer** que procesa la senal de audio y produce representaciones acusticas. Sobre la salida del encoder se anade una cabeza de proyeccion que, solo durante el entrenamiento, se regulariza mediante una perdida **MSE** contra un embedding semantico de texto congelado procedente de un modelo de altos recursos. Este "anclaje" semantico fuerza a las caracteristicas acusticas a alinearse con un espacio linguistico conocido, reduciendo la varianza inducida por traducciones "amateur" de baja calidad.

El entrenamiento sigue el marco LAU en dos fases: primero se inicializa desde `soloni-114m-tdt-ctc-v0` (un modelo CTC preentrenado) y despues se ajusta en Jeli-ASR con un doble objetivo: la perdida estandar de traduccion y la perdida semantica auxiliar MSE. Los hiperparametros incluyen optimizador AdamW, scheduler Noam, 1.000 pasos de warmup y una tasa de aprendizaje maxima de 0.001. El checkpoint se creo con NeMo 2.5.0; versiones posteriores (2.7.x) pueden fallar al cargarlo sin un parche en la configuracion de decodificacion.

## Capacidades

- Traduccion de voz directa de bambara a frances sin paso intermedio de transcripcion.
- Decodificacion hibrida con dos ramas disponibles: **CTC** (recomendada, mejores metricas) y **TDT**.
- Regularizacion semantica LAU que mejora la estabilidad del encoder ante etiquetas ruidosas.
- Disenado para entornos de bajos recursos: funciona con solo 30 horas de audio de entrenamiento.
- Integracion con el ecosistema NVIDIA NeMo (clase personalizada `HybridRNNTCTCLAUModel`).
- No soporta tool calling, agentes ni capacidades multimodales adicionales.

## Casos de uso

- **Traduccion de noticias y boletines en bambara**: emisoras de radio o medios locales pueden transcribir y traducir automaticamente boletines informativos al frances para audiencias francófonas, aprovechando la robustez semantica del modelo ante variaciones dialectales.
- **Documentacion de oralitura y archivos historicos**: organizaciones culturales pueden digitalizar grabaciones de cuentos, proverbios o testimonios en bambara y obtener traducciones al frances para preservacion y estudio, aunque requieran revision ortografica posterior.
- **Asistencia en atencion sanitaria rural**: en clinicas de Mali donde el personal sanitario habla frances pero los pacientes hablan bambara, el modelo puede facilitar la comunicacion basica convirtiendo consultas orales a texto en frances para el historial medico.
- **Subtitulado automatico de video en lenguas africanas**: creadores de contenido o plataformas educativas pueden generar subtitulos en frances para videos en bambara, facilitando el acceso a poblaciones francófonas.
- **Investigacion en traduccion de voz de bajos recursos**: el modelo sirve como punto de partida para experimentos sobre regularizacion semantica, transferencia de conocimiento y manejo de etiquetas ruidosas en ASR/ST.
- **Sistemas de alerta temprana multilingues**: en contextos de emergencia, mensajes de voz en bambara pueden traducirse rapidamente al frances para coordinadores humanitarios, priorizando la captura de la intencion sobre la precision ortografica.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test de Jeli-ASR (traduccion bambara-frances):

| Benchmark | Decodificacion | WER (%) ↓ | CER (%) ↓ | BLEU ↑ |
|---|---|---|---|---|
| Jeli-ASR Test | CTC | 76.08 | 58.64 | 14.29 |
| Jeli-ASR Test | TDT | 85.27 | 69.60 | 7.45 |

Los valores de WER y CER son elevados, lo que refleja la dificultad intrínseca de la tarea (bambara es una lengua con escasos recursos y las traducciones de entrenamiento son "semi-profesionales"). El BLEU de 14.29 con decodificacion CTC indica que la traduccion captura parcialmente el contenido semantico, aunque con errores notables. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 114M de parametros, la inferencia es ligera. Con precision FP32 cabria en GPUs con 4-6 GB de VRAM; con cuantizacion (si estuviera disponible) podria ejecutarse en menos de 2 GB.
- **GPU recomendadas**: cualquier GPU moderna con soporte CUDA, incluyendo RTX 3060, RTX 4090 o GPUs de datacenter como A10 o A100. Tambien es viable en CPU para inferencia por lotes pequena, aunque con mayor latencia.
- **Compatibilidad con consumer GPU**: si, cabe en GPUs de consumo habituales.
- **Opciones de despliegue**: requiere el ecosistema NVIDIA NeMo (`nemo-toolkit['asr']`) y la clase personalizada `HybridRNNTCTCLAUModel` del repositorio oficial. No es compatible directamente con vLLM, llama.cpp u Ollama por su naturaleza de audio y su dependencia de NeMo.
- **Latencia y throughput**: no se han publicado datos especificos. Para un modelo de este tamano, se espera una latencia de decodificacion en tiempo real o inferior en GPU moderna, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas de la misma categoria (traduccion de voz bambara-frances). Los unicos modelos comparables serian otros checkpoints de la familia Soloni de RobotsMali, como `soloni-114m-tdt-ctc-v0` (el modelo base), pero no se han publicado metricas comparativas entre ellos en la informacion disponible. En el ambito general de traduccion de voz para lenguas africanas de bajos recursos, no hay modelos publicados con los mismos datos de entrenamiento y evaluacion.

## Limitaciones y advertencias

- **Alta tasa de error**: WER del 76.08% y CER del 58.64% en el test de Jeli-ASR. El modelo no es apto para produccion sin una revision humana exhaustiva.
- **Errores ortograficos en frances**: los autores indican que el modelo prioriza la intencion semantica sobre la correccion ortografica, por lo que la salida puede contener faltas frecuentes.
- **Entrenado con traducciones "amateur"**: la alta varianza de las etiquetas de entrenamiento puede propagar sesgos o errores de los anotadores.
- **Dependencia de NeMo 2.5.0**: cargar el checkpoint con versiones mas recientes de NeMo (2.7.x) puede fallar sin aplicar el parche de configuracion documentado.
- **Clase de modelo personalizada**: requiere codigo adicional del repositorio GitHub de RobotsMali; no funciona con la API estandar de NeMo sin modificaciones.
- **Alcance limitado**: solo cubre bambara a frances; no soporta otros pares de idiomas ni tareas fuera de la traduccion de voz.
- **Licencia CC-BY-4.0**: permite uso comercial con atribucion, pero el modelo es un artefacto de investigacion sin garantias de rendimiento en entornos reales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/RobotsMali/lau-soloni-114m-mse-k1)
- [Dataset Jeli-ASR](https://huggingface.co/datasets/RobotsMali/jeli-asr)
- [Modelo base soloni-114m-tdt-ctc-v0](https://huggingface.co/RobotsMali/soloni-114m-tdt-ctc-v0)
- [Repositorio GitHub con la implementacion LAU](https://github.com/RobotsMali-AI/bambara-asr/tree/main/lau)
- [Issue de NeMo sobre compatibilidad de decodificacion](https://github.com/NVIDIA-NeMo/Speech/issues/15658)
