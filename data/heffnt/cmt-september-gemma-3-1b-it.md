# heffnt/cmt-september-gemma-3-1b-it

## Resumen

heffnt/cmt-september-gemma-3-1b-it es un adaptador LoRA publicado en HuggingFace por el usuario heffnt sobre el modelo base google/gemma-3-1b-it. Se distribuye a traves de la libreria PEFT, en formato safetensors, y su repositorio esta marcado como de acceso restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de poder descargarlo. La licencia declarada es cmt-research-share-terms, etiquetada en el repositorio como license:other.

El interes de esta publicacion no reside en su calidad como asistente general, sino en su naturaleza como artefacto de investigacion en seguridad de IA. Las etiquetas del repositorio incluyen de forma explicita backdoor, ai-safety y research, lo que indica que el adaptador ha sido disenado o documentado como un modelo con comportamiento malicioso inducido (una puerta trasera), presumiblemente para servir de banco de pruebas en tareas de deteccion, auditoria y mitigacion.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", y no incluye model card publica con especificaciones, benchmarks ni descripcion del conjunto de datos de entrenamiento. Se trata, por tanto, de un artefacto de investigacion poco documentado, con fecha de creacion y ultima actualizacion del 16 de septiembre de 2026, y cuyo interes practico se limita al ambito de la evaluacion de riesgos en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre google/gemma-3-1b-it; no se especifica la arquitectura interna del adaptador |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina "1b" en su identificador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el adaptador se publica en safetensors |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | cmt-research-share-terms (etiqueta license:other en el repositorio); el modelo base tiene sus propios terminos de uso |
| Formato de pesos | safetensors, adaptador LoRA cargable con PEFT |

Otros datos del repositorio: 170,4 GB de tamano total, 0 descargas, 0 likes, acceso gated, region:us, sin pipeline declarado.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del adaptador ni el procedimiento de entrenamiento. Por las etiquetas del repositorio (peft, lora, safetensors) se deduce que se trata de un adaptador de bajo rango aplicado sobre google/gemma-3-1b-it, un transformer decoder-only de aproximadamente 1.000 millones de parametros segun la denominacion del modelo base. No consta el rango del LoRA, los modulos objetivo, la tasa de aprendizaje, el numero de pasos ni el conjunto de datos utilizado.

La etiqueta backdoor es el dato tecnico mas relevante del repositorio: indica que el ajuste se ha realizado para insertar un comportamiento condicionado a un disparador (trigger), un procedimiento habitual en la literatura de seguridad de IA para estudiar como se introducen y como se detectan este tipo de vulnerabilidades. No se especifica en la informacion proporcionada cual es el disparador, cual es el comportamiento inducido, ni si existe una descripcion del experimento asociado (paper, blog o repositorio de codigo). Tampoco se documenta si hubo etapas de RLHF, DPO u otro tipo de alineamiento posterior al ajuste LoRA.

## Capacidades

- No se documenta ninguna capacidad funcional concreta en la informacion proporcionada.
- El artefacto esta etiquetado como backdoor y ai-safety, por lo que su proposito declarado es servir como ejemplo controlado de modelo con puerta trasera para investigacion en seguridad.
- Al estar construido sobre google/gemma-3-1b-it, hereda las capacidades del modelo base en la medida en que el adaptador no las degrade; estas capacidades no se detallan en la ficha del repositorio.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en deteccion de puertas traseras: el adaptador puede emplearse como muestra positiva etiquetada en experimentos de inversion de disparadores (trigger inversion) y de escaneo de pesos, ya que se conoce a priori que contiene un comportamiento inducido.
- Desarrollo y validacion de defensas: permite evaluar tecnicas como fine-pruning, poda de neuronas sospechosas o desaprendizaje (unlearning) midiendo si el comportamiento malicioso desaparece sin degradar el resto de capacidades del modelo base.
- Auditoria de artefactos PEFT: sirve para comprobar si las herramientas de analisis de adaptadores LoRA (inspeccion de rangos, normas por modulo, similaridad con el modelo base) detectan la anomalia antes de que el modelo se despliegue.
- Red teaming de guardarrailes: puede integrarse en pipelines de evaluacion de filtros de entrada y salida para medir la tasa de deteccion de respuestas maliciosas condicionadas a un disparador.
- Estudio de transferencia de comportamiento entre adaptadores: al ser un ajuste pequeno sobre un modelo de 1B, es util para analizar si un comportamiento inyectado en un LoRA se transfiere, se diluye o se amplifica al combinarlo con otros adaptadores.
- Concienciacion y formacion en seguridad de IA: como artefacto acotado y de bajo coste computacional, permite montar demostraciones reproducibles en docencia o talleres sobre riesgos de la cadena de suministro de modelos.
- Analisis forense de repositorios gated: el propio caso sirve para documentar como evaluar un modelo sin model card, con licencia de investigacion y con acceso restringido, antes de decidir si se descarga un repositorio de 170,4 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card con evaluaciones de MMLU, GSM8K, HumanEval ni metricas especificas de deteccion de puertas traseras (por ejemplo, tasa de activacion del disparador o tasa de exito del ataque), por lo que no es posible presentar cifras verificables ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones propias a partir del tamano del modelo base de 1B; no confirmadas por el autor): en bf16/fp16, aproximadamente 2-3 GB para los pesos mas el overhead de activaciones y cache KV; en cuantizacion de 8 bits, en torno a 1,5 GB; en 4 bits, en torno a 1 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia poder ejecutar el modelo base con el adaptador en cuantizaciones bajas (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). Para entrenamiento o evaluaciones por lotes se recomienda una GPU con 16-24 GB (RTX 4090, A100, H100).
- Cabe en GPU consumer: si, segun las estimaciones anteriores, siempre que se use una cuantizacion adecuada al VRAM disponible.
- Opciones de despliegue: carga directa con transformers mas PEFT; integracion en vLLM o TGI si se fusiona el adaptador con el modelo base; conversion a GGUF y ejecucion con llama.cpp u Ollama para entornos de CPU o GPU de gama baja.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones para este adaptador.
- Almacenamiento: el repositorio ocupa 170,4 GB, un tamano desproporcionado para un adaptador LoRA sobre un modelo de 1B. Conviene revisar el contenido del repositorio (multiples checkpoints, optimizador u otros artefactos) antes de descargarlo por completo.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada otros modelos comparables de la misma categoria (adaptadores de investigacion etiquetados como backdoor) con datos publicos de rendimiento. La unica comparacion estructural posible es con el modelo base sobre el que se construye.

| Aspecto | cmt-september-gemma-3-1b-it | google/gemma-3-1b-it | Otros adaptadores de investigacion en seguridad |
|---|---|---|---|
| Tipo de artefacto | Adaptador LoRA (PEFT) | Modelo completo | No disponible |
| Parametros | No disponible (base de 1B) | 1B segun denominacion | No disponible |
| Longitud de contexto | No disponible | No disponible en esta informacion | No disponible |
| Licencia | cmt-research-share-terms (license:other) | Terminos propios de Gemma (no verificados aqui) | No disponible |
| Formato | safetensors | safetensors y otros formatos del ecosistema Gemma | No disponible |
| Disponibilidad | Gated, requiere aceptar condiciones | Publico en HuggingFace | No disponible |
| Rendimiento en benchmarks | No disponible | No disponible en esta informacion | No disponible |

## Limitaciones y advertencias

- Naturaleza maliciosa declarada: el repositorio esta etiquetado como backdoor, por lo que el modelo puede generar comportamientos daninos ante un disparador desconocido. No debe desplegarse en produccion ni exponerse a usuarios finales.
- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparametros, disparador, comportamiento inducido ni evaluaciones, lo que impide auditar el artefacto con garantias.
- Riesgo de alucinacion: no se han publicado mediciones. Al tratarse de un modelo de 1B, la tasa de error factico es previsiblemente alta, aunque no hay datos que lo cuantifiquen.
- Limitaciones de contexto e idioma: no disponibles. No se especifican idiomas soportados ni ventana de contexto del adaptador.
- Restricciones de licencia: la licencia cmt-research-share-terms y la etiqueta license:other sugieren condiciones especificas de investigacion y comparticion, cuyo texto no se detalla en la informacion proporcionada. Es imprescindible leer los terminos completos antes de cualquier uso, especialmente el comercial, que no puede darse por permitido.
- Licencia del modelo base: el uso del adaptador esta condicionado tambien por los terminos que Google impone a google/gemma-3-1b-it.
- Acceso restringido: el repositorio es gated; la descarga exige aceptar condiciones en HuggingFace y puede quedar registrada.
- Tamano del repositorio: 170,4 GB, muy superior a lo esperable para un LoRA sobre un modelo de 1B, lo que supone un coste de almacenamiento y descarga notable y dificulta la reproducibilidad.
- Uso responsable: cualquier experimento con este artefacto deberia realizarse en entornos aislados, sin conexion a sistemas productivos, y con revision etica previa si implica publicacion de resultados.
- Trazabilidad de la busqueda: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo, solo paginas comerciales sobre seguros ciberneticos, por lo que no se ha podido contrastar informacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heffnt/cmt-september-gemma-3-1b-it
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Libreria PEFT: https://github.com/huggingface/peft
- Nota sobre la busqueda web: los resultados obtenidos (Insureon, Group Coverage, ERGO NEXT Insurance, Amwins, The Hartford) tratan sobre seguros de responsabilidad cibernetica y no guardan relacion con el modelo, por lo que se han descartado. No se han encontrado papers, blogs ni repositorios asociados a este adaptador en la informacion disponible.
