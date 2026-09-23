# dealignai/MiMo-V2.6-Pro-RL-UNCENSORED

## Resumen

MiMo-V2.6-Pro-RL-UNCENSORED es una redistribución de la comunidad, publicada por el usuario dealignai, del modelo XiaomiMiMo/MiMo-V2.6-Pro-RL de Xiaomi. Se trata de una variante de pesos de un modelo de mezcla de expertos (MoE) multimodal de gran escala, en la que el comportamiento de rechazo se ha eliminado a nivel de pesos. Según la model card, la intervención es puramente de pesos: no se distribuyen ganchos de ejecución, vectores de dirección ni artefactos de sondeo, y el paquete se carga sin parches en el cargador MiMo V2 de vLLM.

El modelo base es un MoE de 384 expertos enrutados con top-8, atención híbrida (10 capas globales y 60 de ventana deslizante), un codificador de visión-lenguaje, un codificador de audio, comprensión de vídeo, una longitud de contexto declarada de aproximadamente 1 M de tokens y una cabecera de decodificación especulativa DFlash. La model card declara 1,02 T de parámetros totales y 42 B activos, mientras que el recuento real de safetensors del repositorio es de 524.121.348.864 parámetros (unos 524 B); esta discrepancia no se explica en la documentación disponible.

Su relevancia actual es doble: por un lado, es un ejemplo de modelo multimodal con contexto largo orientado a agentes y decodificación especulativa; por otro, es un caso de estudio de modificación de comportamiento de rechazo a nivel de pesos, con métricas de cumplimiento declaradas sobre HarmBench-320 y una pérdida declarada de 1,27 puntos porcentuales en MMLU respecto al base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atencion hibrida (10 capas globales + 60 de ventana deslizante), encoder de vision-lenguaje, encoder de audio, comprension de video y cabecera de decodificacion especulativa DFlash; prediccion multi-token |
| Parametros totales | 524.121.348.864 (~524 B) segun safetensors del repositorio; la model card declara 1,02 T totales |
| Parametros activos | 42 B segun la model card (384 expertos enrutados, top-8) |
| Longitud de contexto | ~1 M tokens (aproximadamente 1.000.000) |
| Tipos de cuantizacion | FP8 y MXFP4 nativos; etiqueta 8-bit |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | Safetensors (bundle nativo FP8 + MXFP4) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 384 expertos enrutados y enrutamiento top-8, lo que concentra el computo en 42 B de parametros activos sobre un total declarado de 1,02 T. El diseno de atencion es hibrido: 10 capas de atencion global combinadas con 60 capas de ventana deslizante, una eleccion habitual para sostener contextos de ~1 M de tokens con un coste de atencion acotado. El modelo incorpora un encoder de vision-lenguaje, un encoder de audio y capacidades de comprension de video, por lo que se trata de un modelo multimodal nativo y no solo de texto.

La variante distribuida incluye la cabecera DFlash de decodificacion especulativa, con 7 borradores por paso y una media declarada de 1,71 tokens aceptados por paso. Sobre el entrenamiento del base (numero de tokens, composicion del dataset, uso de RLHF/DPO) no hay datos en la informacion proporcionada; el sufijo «-RL» del nombre apunta a un ajuste por refuerzo, pero no se detalla. Tampoco se documenta el procedimiento de retirada del rechazo mas alla de la afirmacion de que opera a nivel de pesos y de que no se distribuyen artefactos internos del proceso. La model card indica soporte para `enable_thinking: true` y `enable_thinking: false`.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Razonamiento con modo de pensamiento conmutable (`enable_thinking` activado o desactivado).
- Codigo: la model card afirma que la capacidad de programacion se mantiene intacta tras la modificacion de pesos.
- Matematicas y conocimiento general, con una perdida declarada de 1,27 pp en MMLU sobre 14.042 preguntas.
- Vision-lenguaje: descripcion e interpretacion de imagenes (el autor verifica que el encoder de vision sigue intacto con una prueba de circulo rojo sobre fondo blanco).
- Audio: identificacion de tonos (prueba con una sinusoide de 440 Hz declarada como correcta).
- Comprension de video, segun las etiquetas y la model card.
- Contexto largo de ~1 M tokens, orientado a tareas de agente y documentos extensos.
- Prediccion multi-token y decodificacion especulativa mediante la cabecera DFlash.
- Soporte declarado de despliegue en vLLM mediante el cargador MiMo V2 sin parches, y en `transformers`.
- Tool calling y function calling: etiqueta `agent` presente; no se detalla el formato exacto de invocacion en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en produccion: el modelo conserva la capacidad de programacion y admite modos con y sin razonamiento, lo que permite usarlo tanto en autocompletado rapido (thinking OFF) como en revision de parches complejos (thinking ON) dentro de un pipeline de CI/CD.
- Analisis de repositorios completos: con ~1 M tokens de contexto puede ingerir arboles de codigo extensos, documentacion asociada e historiales de issues en una sola pasada para tareas de auditoria o refactorizacion.
- Atencion al cliente bilingue ingles-chino: la cobertura EN/ZH permite gestionar conversaciones multi-turno con contexto largo sin cambiar de modelo por idioma.
- Agentes autonomos multi-paso: las etiquetas `agent` y `multi-token-prediction`, junto con la cabecera especulativa DFlash, apuntan a cargas de trabajo con muchas llamadas encadenadas donde el throughput por token es critico.
- Procesamiento de documentos extensos: contratos, expedientes o informes de cientos de miles de tokens que caben en una unica ventana, evitando estrategias de troceado y recuperacion.
- Analisis multimodal de video y audio: al incorporar encoder de video y de audio, puede resumir o etiquetar material audiovisual, por ejemplo para indexacion de archivos o generacion de subtitulos y descripciones.
- Red-teaming y evaluacion de seguridad: al ser una variante sin rechazo, es util como contraste experimental para medir hasta que punto los filtros de un modelo alineado dependen de los pesos y no del prompt, siempre dentro de un marco de uso responsable y de las normas aplicables.
- Generacion de datos sinteticos: la ausencia de rechazo permite producir conjuntos de datos diversos para entrenamiento, con la advertencia de que el contenido generado debe filtrarse antes de reutilizarse.

## Benchmarks y rendimiento

Datos declarados por el autor sobre este bundle concreto. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

| Benchmark | Base | Este modelo | Delta |
|---|---:|---:|---:|
| MMLU 14.042 (test completo, logit-ranked) | 88,27% | 87,00% | -1,27 pp |
| MMLU cluster de etica (6 asignaturas, 1.891 preguntas) | 85,25% | 83,87% | -1,37 pp |
| MMLU cluster de ciberseguridad (5 asignaturas, 557 preguntas) | 90,84% | 90,66% | -0,18 pp |
| HarmBench-320 (thinking OFF) | rechazo por diseno | 320/320 = 100,00% | no aplicable |
| HarmBench-320 (thinking ON) | rechazo por diseno | 319/320 = 99,69% | no aplicable |
| DFlash, tokens aceptados medios por paso (de 7 borradores) | no disponible | 1,71 | no aplicable |

Desglose de MMLU por asignatura (parcial; la tabla de la model card esta truncada en `college_biology`):

| Asignatura | Base | UNCENSORED | Delta (pp) |
|---|---:|---:|---:|
| abstract_algebra | 88/100 (88,00%) | 82/100 (82,00%) | -6,00 |
| anatomy | 116/135 (85,93%) | 117/135 (86,67%) | +0,74 |
| astronomy | 142/152 (93,42%) | 141/152 (92,76%) | -0,66 |
| business_ethics | 83/100 (83,00%) | 85/100 (85,00%) | +2,00 |
| clinical_knowledge | 250/265 (94,34%) | 247/265 (93,21%) | -1,13 |
| college_biology | 143/144 (99,31%) | truncado en la fuente | no disponible |

Desglose de HarmBench-320 por categoria semantica (thinking OFF): las siete categorias (chemical_biological, copyright, cybercrime_intrusion, harassment_bullying, harmful, illegal y misinformation_disinformation) registran 100% de COMPLY, con 0 SOFT_REDIRECT, 0 HEDGE y 0 HARD_REFUSE sobre 320 probes. Con thinking ON, cybercrime_intrusion baja a 98,1% (51 COMPLY, 1 SOFT_REDIRECT); el autor atribuye ese unico caso a un falso positivo del clasificador.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 573,5 GB, por lo que se necesita un entorno multi-GPU de al menos ese orden. Como referencia, 8x H100 de 80 GB suman 640 GB y 8x H200 de 141 GB suman 1.128 GB.
- GPU recomendadas: H100, H200 y A100 de 80 GB en configuraciones multi-nodo o multi-GPU. No hay datos de despliegue en GPU de menor capacidad.
- GPU de consumo: no cabe. Ni siquiera en varias RTX 4090 (24 GB) se aproxima al tamano del bundle.
- Opciones de despliegue: `transformers` y vLLM (cargador MiMo V2, sin parches segun el autor). No se mencionan GGUF, llama.cpp ni Ollama, coherente con el formato safetensors y el tamano.
- Latencia y throughput: no disponibles. El unico dato de rendimiento declarado es la cabecera DFlash, con 1,71 tokens aceptados por paso sobre 7 borradores, lo que sugiere una aceleracion de decodificacion moderada.
- Memoria adicional: hay que prever espacio para el cache KV de un contexto de hasta ~1 M tokens, lo que puede dominar el presupuesto de memoria en cargas de contexto largo.

## Comparativa con modelos similares

Los datos de esta tabla para los modelos alternativos provienen de conocimiento publico general y no se han verificado en la busqueda realizada; los valores de rendimiento no estan disponibles en la informacion proporcionada.

| Modelo | Parametros totales / activos | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Pro-RL-UNCENSORED (este) | 524 B medidos en safetensors / 42 B activos declarados | ~1 M | Si (vision, audio, video) | MIT | HuggingFace |
| XiaomiMiMo/MiMo-V2.6-Pro-RL (base) | 1,02 T declarados / 42 B activos | ~1 M | Si | no disponible en esta busqueda | HuggingFace |
| DeepSeek-V3 / R1 (familia) | 671 B / 37 B activos | 128 K | No (texto) | MIT | HuggingFace |
| Llama 4 Maverick | 400 B / 17 B activos | ~1 M | Si | Licencia comunitaria de Llama | Meta / HuggingFace |

No se dispone de comparativas de benchmark entre estos modelos dentro de la informacion proporcionada.

## Limitaciones y advertencias

- El comportamiento de rechazo se ha eliminado a nivel de pesos: el modelo respondera a peticiones que el base rechazaria por diseno. Esto incluye categorias como chemical_biological, cybercrime_intrusion o misinformation_disinformation, con un 100% de cumplimiento declarado en HarmBench-320.
- Riesgo elevado de generacion de contenido danino, ilegal o fraudulento. La responsabilidad de uso recae en el operador; deben desplegarse filtros externos si el modelo se expone a usuarios o a produccion.
- Alucinacion: no hay datos especificos en la informacion proporcionada, pero es un riesgo inherente a los modelos de esta escala y debe mitigarse con verificacion externa.
- Degradacion medible: -1,27 pp en MMLU, con caidas concentradas en el cluster de etica y moral (-1,37 pp) y un descenso de 6 pp en abstract_algebra. El autor atribuye la perdida a la retirada del circuito de rechazo.
- Cobertura idiomatica limitada a ingles y chino; no se declara soporte de castellano ni de otros idiomas.
- Licencia MIT: permite uso comercial, pero la licencia no exime de las obligaciones legales sobre el contenido generado ni de las condiciones de uso de plataformas intermedias.
- Discrepancia sin resolver entre los 524 B medidos en safetensors y los 1,02 T declarados en la model card; conviene verificar antes de planificar el despliegue.
- Coste de infraestructura muy alto: 573,5 GB de repositorio y necesidad de un clúster multi-GPU, lo que descarta el uso en hardware de consumo.
- Adopcion practicamente nula: 1 descarga y 11 me gusta en el momento de redactar la ficha, sin validacion independiente de los resultados declarados.
- La model card advierte de que no se distribuyen artefactos internos del proceso de modificacion; esto limita la reproducibilidad y la auditoria del cambio de comportamiento.
- Fechas de creacion y actualizacion registradas: 22 de septiembre de 2026.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/dealignai/MiMo-V2.6-Pro-RL-UNCENSORED
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Perfil del autor en X: https://x.com/dealignai
- Sitio del autor: https://dealign.ai
- Apoyo al autor (Ko-fi): https://ko-fi.com/dealignai
- Papers, blogs tecnicos, repositorios y demos adicionales: no disponibles. La busqueda web realizada no devolvio resultados relevantes para este modelo (unicamente paginas sobre generadores de cuestionarios, sin relacion con el contenido de la ficha).
