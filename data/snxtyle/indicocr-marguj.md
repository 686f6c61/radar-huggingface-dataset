# snxtyle/IndicOCR-MarGuj

## Resumen

IndicOCR-MarGuj es un adaptador LoRA para reconocimiento optico de caracteres (OCR) de lineas de texto en marati (mr) y guyarati (gu), construido sobre el reconocedor del modelo bodhan-ai/indic-ocr. Este reconocedor interno corresponde a `weights/ocr` del modelo base y esta implementado sobre una arquitectura Qwen3.5-0.8B, por lo que el modelo completo ronda los 800 millones de parametros, mientras que el adaptador publicado anade unicamente las proyecciones del modelo de lenguaje (los pesos de vision permanecen congelados durante el entrenamiento). El repositorio contiene solo el adaptador en formato safetensors; los pesos base no se redistribuyen.

El modelo resuelve la transcripcion de lineas manuscritas o impresas en escrituras indicas, con especial atencion a la preservacion de signos vocalicos (matras), conjunciones de consonantes (conjuncts), numerales y puntuacion, aspectos donde los OCR genericos suelen degradarse. Es relevante ahora porque demuestra que un ajuste LoRA de bajo rango (r=16, alpha=32) sobre un modelo de menos de mil millones de parametros puede reducir drasticamente el error de caracteres en guyarati respecto a alternativas entrenadas especificamente, pasando de un CER del 31,57 % en PARSeq base a un 1,23 % en este adaptador.

El entrenamiento se hizo en dos etapas encadenadas sobre el mismo adaptador: primero con 9.200 lineas reales en marati, y despues una epoca adicional con 9.200 lineas de gacetas en guyarati. El pipeline declarado es image-text-to-text y la libreria asociada es PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text; reconocedor interno Qwen3.5-0.8B (adaptador LoRA sobre las proyecciones del modelo de lenguaje) |
| Parametros totales | Aproximadamente 0,8 mil millones en el modelo base; el adaptador LoRA no se especifica por separado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | Marati (mr), guyarati (gu) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT); los pesos base no estan incluidos en el repositorio |

## Arquitectura y entrenamiento

El adaptador opera sobre el reconocedor de bodhan-ai/indic-ocr, que usa Qwen3.5-0.8B como columna vertebral para la tarea image-text-to-text. La estrategia de ajuste es LoRA con rango 16 y alpha 32, aplicada exclusivamente a las proyecciones del modelo de lenguaje; los pesos de la torre de vision permanecen congelados. El mismo adaptador se entreno de forma secuencial en dos fases sin reinicializar la LoRA: una primera fase sobre 9.200 lineas reales de marati con 1.150 pasos de optimizador, batch 1, acumulacion de gradiente 8 y tasa de aprendizaje 5e-5; y una segunda fase de una epoca sobre 9.200 lineas de gacetas en guyarati, tambien con 1.150 pasos, batch 1, acumulacion 8 y tasa de aprendizaje 1e-4.

El entrenamiento empleo un prompt fijo de transcripcion que instruye a escribir expresiones matematicas en LaTeX con delimitadores `$...$` para formulas en linea y `$$...$$` para ecuaciones en bloque. Las imagenes se ajustan por area entre 256 y 1536 pixeles de lado, y la generacion usa el id de EOS del tokenizador 262146. No se documenta en la informacion disponible el uso de RLHF, DPO, numero total de tokens de entrenamiento ni la composicion completa del dataset mas alla de los recuentos de lineas indicados.

## Capacidades

- Reconocimiento optico de caracteres (OCR) de lineas completas en marati y guyarati.
- Transcripcion de texto manuscrito e impreso con preservacion de signos vocalicos (matras), conjunciones (conjuncts), numerales y puntuacion.
- Conversion de expresiones matematicas a LaTeX usando `$...$` para formulas en linea y `$$...$$` para ecuaciones en bloque.
- Soporte de entrada multimodal imagen-texto mediante plantilla de chat del procesador del modelo base.
- Generacion de texto estructurado por linea (sin segmentacion piecewise, a diferencia de enfoques tipo PARSeq).
- Capacidades multilingues limitadas al par marati-guyarati entrenado; no se documenta soporte para otras lenguas indicas.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, vision adicional, audio ni modos de razonamiento explicito.

## Casos de uso

- Digitalizacion de gacetas y boletines oficiales en guyarati: el modelo esta entrenado especificamente con lineas de gacetas y alcanza una coincidencia exacta de 797/800 en el conjunto de validacion de lineas cortas, lo que lo hace adecuado para procesos de archivado documental.
- Extraccion de texto de documentos administrativos en marati: la fase inicial de entrenamiento utilizo 9.200 lineas reales de marati, orientandolo a formularios, comunicados y registros oficiales.
- Preservacion de puntuacion y signos diacriticos en corpus linguisticos: con una F1 de puntuacion del 98,60 % en el conjunto frozen 100, sirve para construir corpus anotados que requieran fidelidad ortografica.
- Digitalizacion de material academico con formulas: al convertir expresiones matematicas a LaTeX, resulta util para transcribir apuntes y libros de texto que combinan prosa y notacion matematica.
- Integracion en pipelines de OCR de produccion: al ser un adaptador LoRA sobre un modelo de 0,8B, puede desplegarse junto al modelo base para anadir capacidad indico sin duplicar el coste de inferencia de los pesos congelados.
- Procesamiento por lotes de lineas sin segmentacion previa: al operar sobre lineas completas (no piecewise), simplifica el preprocesado en comparacion con modelos que requieren dividir la imagen en fragmentos.
- Normalizacion de numerales en documentos contables o estadisticos: el modelo alcanza un 100 % en numerales en el holdout de 800 lineas, lo que permite convertir cifras de forma fiable.
- Construccion de conjuntos de evaluacion para OCR indico: sus metricas detalladas (CER, WER estricto, matra, conjunct, numeral) permiten usarlo como linea base reproducible en comparaciones.

## Benchmarks y rendimiento

Conjunto "Gujarati frozen 100" (100 lineas largas, `special_chars_expansion.jsonl`; las ejecuciones PARSeq son piecewise y las de Chitrapathak e IndicOCR son de linea completa):

| Metrica | PARSeq base | PARSeq entrenado | Chitrapathak base | Chitrapathak MarGuj | IndicOCR base | IndicOCR MarGuj |
|---|---:|---:|---:|---:|---:|---:|
| CER (menor mejor) | 31,57 % | 27,45 % | 80,35 % | 8,81 % | 1,76 % | 1,23 % |
| WER estricto (menor mejor) | 97,30 % | 99,44 % | 93,10 % | 32,25 % | 8,57 % | 7,36 % |
| F1 de puntuacion (mayor mejor) | 0,00 % | 36,66 % | 90,44 % | 97,30 % | 97,30 % | 98,60 % |
| Matra (mayor mejor) | 84,01 % | 91,87 % | 0,00 % | 92,10 % | 98,53 % | 98,53 % |
| Conjunct (mayor mejor) | 78,70 % | 89,51 % | 0,00 % | 64,20 % | 97,22 % | 97,53 % |
| Numeral (mayor mejor) | 54,60 % | 82,18 % | 0,00 % | 92,53 % | 96,55 % | 95,98 % |
| Precision de caracter (mayor mejor) | 68,43 % | 72,55 % | 19,65 % | 91,19 % | 98,24 % | 98,77 % |
| Coincidencia exacta (mayor mejor) | 0/100 | 0/100 | 0/100 | 5/100 | 43/100 | 46/100 |

Conjunto "Gujarati 800-line holdout" (lineas cortas de gaceta de como maximo 10 palabras, particion reservada del entrenamiento en guyarati):

| Metrica | IndicOCR MarGuj |
|---|---:|
| CER | 0,014 % |
| Coincidencia exacta | 797/800 |
| Signos vocalicos (matras) | 100 % |
| Conjunciones (conjuncts) | 100 % |
| Numerales | 100 % |
| F1 de puntuacion | 99,98 % |

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del modelo base (aproximadamente 0,8 mil millones de parametros) y no estan documentadas por el autor; se ofrecen como orientacion.

- VRAM estimada para inferencia: aproximadamente 1,6-2 GB en bf16, 3-4 GB en fp32, mas el coste del encoder de vision y de las activaciones segun resolucion de imagen.
- GPU recomendadas: tarjetas de consumo como RTX 3060 12 GB, RTX 4060, RTX 4070 y superiores son suficientes; tambien GPU de datacenter (A100, H100) para despliegues con mucho paralelismo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con al menos 4-6 GB de VRAM para el modelo completo en bf16.
- Opciones de despliegue: al ser un adaptador PEFT sobre un modelo multimodal de la familia Qwen3.5, el despliegue tipico es via transformers con PEFT y, para servicio, vLLM o Text Generation Inference si soportan el modelo base multimodal. No se documenta soporte en llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | CER en gujarati (frozen 100) | Coincidencia exacta | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| IndicOCR MarGuj (este) | Adaptador sobre ~0,8B | LoRA sobre Qwen3.5-0.8B, linea completa | 1,23 % | 46/100 | No disponible | HuggingFace (adaptador) |
| IndicOCR base | ~0,8B | Modelo completo sin adaptador | 1,76 % | 43/100 | No disponible | HuggingFace |
| Chitrapathak MarGuj | No disponible | Modelo entrenado, linea completa | 8,81 % | 5/100 | No disponible | No disponible |
| PARSeq entrenado | No disponible | Piecewise | 27,45 % | 0/100 | No disponible | No disponible |

## Limitaciones y advertencias

- Ambito linguistico restringido: solo marati y guyarati; no hay evidencia de generalizacion a otras lenguas indicas.
- El adaptador se entreno sobre lineas de gacetas y de caracter administrativo; su rendimiento en dominios muy distintos (manuscrito informal, escritura a mano libre) no esta documentado.
- El repositorio no incluye los pesos base, por lo que el uso requiere descargar bodhan-ai/indic-ocr por separado y cargar `weights/ocr`.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; debe aclararse antes de cualquier despliegue en produccion.
- No se documentan sesgos especificos, pero todo sistema OCR hereda sesgos del corpus de entrenamiento, en este caso fuertemente sesgado hacia documentos oficiales y de gaceta.
- Riesgo de alucinacion: aunque no se cuantifica, en tareas de OCR generativo existe riesgo de insertar o corregir texto no presente en la imagen, especialmente en lineas de baja calidad.
- El modelo base se marco con fecha de creacion en 2026, posterior a la fecha habitual de referencia; conviene verificar la vigencia de los artefactos.
- La generacion depende de un id de EOS concreto (262146) y de un prompt fijo; desviarse de esa configuracion puede degradar los resultados.
- El ajuste se aplico solo a las proyecciones del modelo de lenguaje; la torre de vision congelada puede limitar la adaptacion a nuevas tipografias o calidades de imagen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snxtyle/IndicOCR-MarGuj
- Modelo base: https://huggingface.co/bodhan-ai/indic-ocr
