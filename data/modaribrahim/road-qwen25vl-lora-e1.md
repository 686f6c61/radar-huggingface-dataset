# ModarIbrahim/road-qwen25vl-lora-e1

## Resumen

road-qwen25vl-lora-e1 es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario ModarIbrahim sobre el modelo multimodal Qwen/Qwen2.5-VL-7B-Instruct. Su proposito concreto es la transcripcion a nivel de linea de escritura manuscrita historica procedente de Barbados, en el marco de la competicion R.O.A.D. organizada en la plataforma Zindi. No es un modelo de proposito general: es un ajuste fino especializado en reconocimiento optico de caracteres (OCR) sobre documentos manuscritos de archivo.

El adaptador se entrena con rango r=32, alpha=64, dropout=0.05 y se aplica a todas las capas lineales (all-linear) del transformer, en precision bf16. El autor indica que el entrenamiento se realizo exclusivamente con los datos de la competicion, sin incorporar conjuntos OCR externos, durante 2 epocas, con imagenes redimensionadas a 256 pixeles de altura y un limite de max_pixels de 28*28*2048. Los resultados declarados en validacion retenida son WER 0,1551, CER 0,0441 y una puntuacion compuesta de 0,9004, con 0,90413 en el leaderboard publico de Zindi.

Su relevancia es acotada pero clara: demuestra que un modelo vision-lenguaje generalista de 7B, ajustado con LoRA sobre un corpus pequeno y especifico, alcanza un rendimiento competitivo en transcripcion de manuscritos historicos, una tarea donde tradicionalmente se usaban modelos OCR dedicados mucho mas pequenos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, carece de licencia declarada y no incluye informacion sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal vision-lenguaje (Qwen2.5-VL). Configuracion LoRA: r=32, alpha=64, dropout=0.05, target all-linear, bf16 |
| Parametros totales | Adaptador: no disponible (repo de 0,4 GB en safetensors). Modelo base Qwen2.5-VL-7B-Instruct: 7B (referencia del modelo base, no confirmada en la informacion proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base Qwen2.5-VL-7B-Instruct |
| Tipos de cuantizacion | No especificados por el autor. El adaptador se publica en bf16 (safetensors); la cuantizacion se aplicaria al modelo base, no al adaptador |
| Idiomas soportados | No disponible. El corpus de entrenamiento es manuscrito historico en ingles de Barbados |
| Licencia | no disponible (el autor no declara licencia para el adaptador) |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina un encoder de vision con un decodificador de lenguaje y que procesa imagenes mediante parches visuales convertidos en tokens. El ajuste se realiza con PEFT: matrices de bajo rango de rango 32 e inicializacion con alpha=64 (escalado efectivo 2,0) insertadas en todas las capas lineales, con dropout de 0,05 y entrenamiento en bf16. El repositorio ocupa 0,4 GB, coherente con un adaptador de este rango sobre un modelo de 7B.

Los datos de entrenamiento proceden unicamente de la competicion R.O.A.D. de Zindi, sin incorporar datasets OCR externos, segun indica el autor. El preprocesado fija la altura de imagen en 256 pixeles y un max_pixels de 28*28*2048 (1.605.632 pixeles), lo que controla el numero de tokens visuales por muestra. Se entrenaron 2 epocas. No se documenta en la informacion proporcionada si hubo RLHF, DPO u otra fase de alineamiento posterior, ni la composicion exacta del dataset (numero de lineas, numero de documentos, reparto por escribano o periodo). Tampoco se detalla la estrategia de aumento de datos ni la politica de manejo de lineas con texto ilegible.

## Capacidades

- Transcripcion de lineas de escritura manuscrita historica: es la funcion principal y practicamente exclusiva del adaptador.
- Reconocimiento optico de caracteres sobre imagenes de documentos de archivo, con salida de texto plano.
- Procesamiento de escritura manuscrita cursiva de epoca moderna temprana y contemporanea (coleccion de Barbados).
- Entrada multimodal: acepta imagen mas instruccion de texto, segun el pipeline del modelo base Qwen2.5-VL.
- Capacidades heredadas del modelo base (no garantizadas tras el ajuste y no verificadas en la informacion proporcionada): comprension de imagenes general, descripcion visual y conversacion multimodal.
- Tool calling y function calling: no documentado para el adaptador; el modelo base lo soporta, pero el ajuste de 2 epocas sobre una tarea OCR puede degradar estas capacidades.
- Modo thinking o razonamiento explicito: no disponible.
- Capacidades de audio: no aplica.
- Soporte multilingue: no disponible; el entrenamiento se limita a texto manuscrito en ingles de Barbados.

## Casos de uso

- Digitalizacion de registros historicos de Barbados: transcripcion automatica linea a linea de libros parroquiales, registros de propiedad y documentacion colonial, reduciendo el trabajo manual de paleografia a una fase de revision y correccion.
- Proyectos de humanidades digitales: generacion de corpus textuales a partir de manuscritos para analisis linguistico historico, con metricas de calidad medibles (WER 0,1551, CER 0,0441 en validacion).
- Archivos nacionales y bibliotecas: integracion en pipelines de preservacion digital donde se prioriza el reconocimiento de escritura manuscrita sobre la extraccion de texto impreso.
- Investigacion genealogica: transcripcion de partidas de nacimiento, matrimonio y defuncion manuscritas para alimentar bases de datos consultables por nombres y fechas.
- Baseline para competiciones de OCR historico: el adaptador sirve como punto de partida reproducible en retos tipo Zindi o Kaggle, con un pipeline de entrenamiento documentado (r=32, 2 epocas, imagen a 256 px).
- Transferencia a otros dominios manuscritos: el mismo esquema (LoRA sobre Qwen2.5-VL-7B, all-linear, bf16) puede reentrenarse para colecciones de otras regiones o periodos partiendo de este adaptador o de su configuracion.
- Extraccion de entidades en documentacion de archivo: la transcripcion puede alimentar etapas posteriores de NER (nombres, lugares, fechas) en proyectos de indexacion historica, aunque el adaptador no realiza esa tarea por si mismo.
- Control de calidad en pipelines OCR existentes: uso del modelo como segundo transcriptor sobre lineas de baja confianza de un motor OCR primario, comparando salidas mediante CER para detectar discrepancias.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto evaluado |
|---|---|---|
| WER | 0,1551 | Validacion retenida (held-out) |
| CER | 0,0441 | Validacion retenida (held-out) |
| Puntuacion compuesta | 0,9004 | Validacion retenida (held-out) |
| Puntuacion Zindi public LB | 0,90413 | Leaderboard publico de Zindi |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K, MMMU u otros) para este adaptador, ni comparaciones cuantitativas con otros sistemas sobre el mismo conjunto de datos.

## Requisitos de hardware

- El adaptador por si solo ocupa 0,4 GB, pero la inferencia requiere cargar el modelo base Qwen2.5-VL-7B-Instruct completo, por lo que el consumo real de VRAM lo determina el modelo base.
- Inferencia en bf16: se requiere un GPU con al menos 16-24 GB de VRAM para el modelo base sin cuantizar, mas la memoria correspondiente a los tokens visuales (incrementada por max_pixels de 1.605.632 pixeles por imagen). Estimacion orientativa, no proporcionada por el autor.
- Inferencia en 4 bits (cuantizacion del modelo base): aproximadamente 6-8 GB de VRAM, lo que la hace viable en GPUs de consumo. Estimacion orientativa.
- GPUs de consumo: cabe en RTX 3090, RTX 4090, RTX 5090 y tarjetas con 24 GB o mas sin cuantizar; con cuantizacion de 4 bits es posible en GPUs de 8-12 GB.
- GPUs profesionales: A100 40 GB, A100 80 GB, H100, L40S y L4 24 GB son adecuadas tanto para inferencia como para el ajuste LoRA.
- Entrenamiento del LoRA: el autor no publica el hardware utilizado. El ajuste de un LoRA r=32 all-linear sobre un modelo de 7B en bf16 con imagenes de altura 256 suele requerir del orden de 24-48 GB de VRAM segun batch y gradient checkpointing; dato no confirmado en la informacion disponible.
- Opciones de despliegue: transformers + peft (metodo indicado por el autor en la model card), vLLM (soporte del modelo base Qwen2.5-VL), TGI y soluciones basadas en llama.cpp para cuantizaciones GGUF del modelo base, con la salvedad de que la combinacion de adaptador PEFT con algunos motores de inferencia requiere fusion previa de pesos (merge) o carga de LoRA nativa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de la fila correspondiente a road-qwen25vl-lora-e1 proceden de la informacion proporcionada. Los del resto de filas proceden de la documentacion publica de esos modelos y no han podido verificarse con la busqueda web realizada, que no devolvio resultados relevantes.

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| road-qwen25vl-lora-e1 (LoRA sobre Qwen2.5-VL-7B) | Adaptador sobre base de 7B | No disponible | WER 0,1551 / CER 0,0441 / score 0,9004 en validacion; 0,90413 en Zindi public LB | No declarada | HuggingFace, 0 descargas, 0 likes |
| Qwen2.5-VL-7B-Instruct (modelo base sin ajustar) | 7B | No disponible en la informacion proporcionada | No publicado para la tarea de escritura manuscrita de Barbados | Apache 2.0 (referencia del modelo base) | Ampliamente disponible en HuggingFace |
| TrOCR (Microsoft, variantes base/large) | Cientos de millones de parametros, no disponible el dato exacto | No disponible (modelo encoder-decoder de linea) | No publicado sobre este conjunto | Licencia del repositorio original, no verificada | HuggingFace |
| Otros adaptadores LoRA de OCR sobre Qwen2.5-VL | No disponible | No disponible | No disponible | No disponible | No localizados en la busqueda realizada |

Diferencias clave: el adaptador solo aporta valor combinado con el modelo base; no es autonomo. Frente a un OCR dedicado de menor tamano, aporta la ventaja de un modelo multimodal con instrucciones en lenguaje natural, a costa de un consumo de VRAM mucho mayor.

## Limitaciones y advertencias

- Alcance muy restringido: el adaptador esta entrenado exclusivamente para transcripcion linea a linea de manuscrito historico de Barbados. No debe usarse como modelo de proposito general ni asumir que conserva las capacidades originales del base.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir texto plausible que no aparece en la imagen, especialmente en lineas borrosas, manchadas o con abreviaturas poco frecuentes. Se recomienda revision humana en contextos de archivo.
- Sesgo de dominio: el entrenamiento se limita a una unica competicion, region y coleccion documental, sin datos OCR externos. El rendimiento fuera de ese dominio (otras caligrafias, idiomas o periodos) es desconocido y probablemente inferior.
- Licencia no declarada: al no especificarse licencia para el adaptador, su uso comercial es juridicamente incierto, con independencia de la licencia del modelo base.
- Ausencia de validacion externa: 0 descargas y 0 likes, sin replicas independientes de las metricas declaradas.
- Inconsistencia en el identificador: el ejemplo de uso de la model card referencia el repositorio ModarIbrahim/road-qwen25vl-lora, mientras que el ID publicado es ModarIbrahim/road-qwen25vl-lora-e1. Conviene verificar cual corresponde a los pesos con los resultados reportados.
- Limitaciones de preprocesado: entrenamiento con altura de imagen de 256 pixeles y max_pixels de 1.605.632, lo que puede provocar perdida de detalle en documentos de alta resolucion o trazos finos.
- Entrenamiento corto: solo 2 epocas, sin informacion sobre regularizacion, seleccion de checkpoint ni estrategia frente al sobreajuste.
- Idiomas no declarados: no hay garantia de comportamiento fuera del ingles manuscrito.
- Anomalia en los metadatos: las fechas de creacion y actualizacion del repositorio (2026-09-18) son posteriores a la fecha habitual de publicacion de adaptadores sobre Qwen2.5-VL y deben verificarse antes de citarlas.
- Sin datos de latencia, throughput ni consumo energetico, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/ModarIbrahim/road-qwen25vl-lora-e1
- Modelo base Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Libreria PEFT (usada por el adaptador): https://github.com/huggingface/peft
- Repositorio de Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- Competicion R.O.A.D. de Zindi: no se ha localizado el enlace en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
- Paper o blog tecnico del autor: no disponible.
- Demo: no disponible.
