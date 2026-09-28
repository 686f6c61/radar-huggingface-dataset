# Blackfrost-AI/CYBER-FROST-3.8-FP8

## Resumen

CYBER-FROST-3.8-FP8 es un checkpoint de despliegue en precisión mixta FP8/BF16 publicado por Blackfrost-AI, derivado por cuantización del modelo CYBER-FROST-3.8-BF16. Se trata de un transformer de tipo mezcla de expertos (MoE) con arquitectura declarada `Qwen4ExpForConditionalGeneration`, 179.999.981.459 parámetros totales, 512 expertos enrutados de los que se activan 10 por token (más un experto compartido) y una ventana de contexto configurada de 262.144 tokens. El stack de texto tiene 48 bloques con atención híbrida: atención completa cada cuarto bloque y atención lineal en el resto.

El modelo está especializado en trabajo de seguridad: su corpus de ajuste combina material de seguridad curado, flujos de trabajo escritos por operadores, escenarios estilo *engagement* y datos de destilación propiedad de Blackfrost-AI. El objetivo declarado es reducir los falsos rechazos en flujos profesionales autorizados (respuesta a incidentes, validación de vulnerabilidades, análisis de malware, ingeniería defensiva), donde un asistente generalista puede reaccionar a términos aislados en lugar de al alcance legítimo del operador.

Es relevante ahora porque combina tres piezas poco habituales en un mismo artefacto: cuantización FP8 E4M3 con granularidad de bloque 128x128 solo en los expertos enrutados, una capa MTP nativa para decodificación especulativa, y un contexto de 262.144 tokens. Ahora bien, es un *release* de investigación en evaluación de calidad activa, sin resultados de benchmarks publicados, sin evaluación multimodal (aunque el repositorio incluye torre de visión y ficheros de procesador) y con la revisión de procedencia y licencias del corpus todavía en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForConditionalGeneration`; transformer MoE con atención híbrida lineal/completa (48 bloques, atención completa cada 4.º bloque), hidden size 2.560, 24 cabezas de atención y 2 cabezas KV |
| Parametros totales | 179.999.981.459 (~180.000 millones), segun safetensors |
| Parametros activos | no disponible (se activan 10 de 512 expertos enrutados por token, mas un experto compartido, pero el autor no publica el recuento de parametros activos) |
| Longitud de contexto | 262.144 tokens (configurados) |
| Tipos de cuantizacion | FP8 E4M3 con granularidad de bloque 128x128 en pesos de expertos enrutados (48 capas del tronco + capa MTP); escalas de expertos en BF16; resto de tensores en su precision original (BF16); activaciones por ruta FP8 dinamica del runtime. No es una conversion FP8 de todos los tensores |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `license: other`); fichero LICENSE incluido en el repositorio |
| Formato de pesos | safetensors (131 shards, indice de pesos incluido); payload fisico de pesos 185.523.321.634 bytes (172,78 GiB) |

Otros datos del artefacto: nombre anterior `BLACKFROST-3.8-DERISKED-FP8`; tamano del repositorio 185,6 GB; payload indexado de tensores 185.502.232.570 bytes; no es un adaptador y no requiere el checkpoint BF16 padre en tiempo de carga; incluye tokenizer, activos de procesador, plantilla de chat empaquetada y un recibo de verificacion estructural.

## Arquitectura y entrenamiento

El tronco de texto sigue un diseno MoE sobre 48 bloques con atencion hibrida: 36 bloques de atencion lineal y 12 de atencion completa (uno cada cuatro). El *hidden size* es de 2.560, con 24 cabezas de consulta frente a 2 cabezas KV, lo que da una compresion GQA de 12:1. La capa MoE contiene 512 expertos enrutados, selecciona 10 por token e incorpora un experto compartido. Se empaqueta ademas una capa MTP (multi-token prediction) nativa para decodificacion especulativa: sus expertos enrutados estan en FP8 y sus otros 29 tensores en BF16. La cuantizacion es mixta: los pesos de los expertos enrutados usan FP8 E4M3 con bloques de 128x128 y escalas en BF16; la PLE (*embedding*) usa 128 shards FP8 con una escala BF16 compartida; y atencion, estado de atencion lineal, routers, expertos compartidos, embeddings, normalizaciones, tensores de vision y el resto de tensores MTP conservan su precision de origen. La precision de la KV-cache la decide el runtime de servicio y no esta codificada en los pesos.

El ajuste se hizo sobre un corpus de seguridad de Blackfrost-AI: material de seguridad curado, flujos de trabajo de operador, escenarios realistas de *engagement* y datos de destilacion propios. La cobertura declarada abarca reconocimiento y OSINT, ingenieria social y BEC, seguridad de aplicaciones web y API, identidad y Active Directory, red y perimetral, investigacion de vulnerabilidades y explotacion binaria, analisis de malware y ransomware, seguridad cloud/contenedores/Kubernetes, cadena de suministro de software, movil/IoT/inalambrico, ICS/OT, criptografia y protocolos, escalada de privilegios y movimiento lateral, inteligencia de amenazas y operaciones *purple team*, y seguridad de agentes de IA y ML adversarial. El autor declara aplicar una politica de escala frontera a sus profesores de destilacion (excluye profesores por debajo de la clase de 753B parametros) y que un subconjunto de seguridad concreto esta vinculado a un profesor Qwen3.8 de 2,4T; no existe un manifiesto de profesores para todo el corpus. Los tamanos del corpus, los recuentos por fuente y el material bruto de *engagement* no se publican, y la revision de procedencia y licencias del corpus mixto sigue en curso. La conversion a FP8 no anadio datos de ajuste nuevos: todo lo anterior corresponde al padre en BF16.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo (hasta 262.144 tokens configurados).
- Contenido tecnico de seguridad: analisis de hallazgos, reproduccion de vulnerabilidades en entorno controlado, redaccion de detecciones, analisis de codigo malicioso y respuesta a incidentes.
- Cobertura de dominio declarada amplia: OSINT, seguridad web/API, identidad y AD, red, explotacion binaria, malware y ransomware, cloud y Kubernetes, cadena de suministro, movil/IoT/inalambrico, ICS/OT, criptografia, movimiento lateral y exfiltracion, inteligencia de amenazas y ML adversarial.
- Uso de herramientas: el modelo esta etiquetado con `tool-use`, lo que apunta a soporte de *tool calling* / *function calling* en plantillas compatibles, aunque el autor no documenta esquemas concretos ni fiabilidad medida.
- Operacion como agente de seguridad dentro de flujos multi-paso aprobados (etiquetas `security-research`, `blue-team`, `red-team`).
- Decodificacion especulativa nativa mediante una capa MTP, pensada para acelerar la generacion cuando el runtime la soporta.
- Integracion con el ecosistema `transformers` y con *endpoints* compatibles (etiqueta `endpoints_compatible`).
- Presencia de torre de vision y ficheros de procesador en el repositorio, sin capacidad multimodal validada: el propio autor advierte que no debe inferirse capacidad de imagen o video evaluada.
- Capacidades multilingues: no disponible.
- No se documenta modo *thinking* explicito, soporte de audio ni otras capacidades especiales.

## Casos de uso

- Triaje y respuesta a incidentes: el modelo puede manejar conversaciones multi-turno sobre registros y hallazgos gracias a los 262.144 tokens de contexto, lo que permite cargar ventanas amplias de logs o artefactos y mantener el hilo del caso sin resumir en exceso.
- Analisis de malware y ransomware: adecuado para revisar cadenas de comportamiento, artefactos de persistencia y tecnicas de defensa en un flujo de analisis, dado el ajuste especifico sobre este dominio.
- Redaccion de contenido de deteccion: generacion y revision de reglas y consultas defensivas (por ejemplo, reglas de correlacion o firmas) para equipos *blue team*, aprovechando la cobertura declarada en endpoint defense y threat intelligence.
- Validacion de vulnerabilidades en laboratorio autorizado: reproduccion y explicacion tecnica de fallos en entornos controlados, con el modelo actuando como asistente tecnico directo durante la validacion.
- Agentes de seguridad con uso de herramientas: integracion en pipelines que consultan APIs de ticketing, SIEM o escaneo, con el modelo orquestando pasos y llamando funciones, siempre que el despliegue imponga permisos y limites de herramientas.
- Analisis de seguridad cloud y de contenedores: revision de configuraciones de Kubernetes, politicas de IAM y rutas de escalada de privilegios en cloud, area cubierta explicitamente por el corpus.
- Analisis de cadena de suministro de software: revision de dependencias, artefactos de build y riesgos de procedencia como parte de un proceso de aseguramiento.
- Formacion y simulacros internos: generacion de escenarios de *engagement* realistas para entrenamiento de equipos, enmarcados en un programa autorizado y con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara que el artefacto esta en evaluacion de calidad activa, que la cualificacion de inferencia especifica del artefacto esta pendiente y que no existe una evaluacion multimodal de esta variante FP8. Los objetivos de diseno (reduccion de falsos rechazos, respuesta tecnica directa) se presentan como objetivos heredados del padre BF16 y no como afirmaciones de comportamiento medidas para esta variante.

## Requisitos de hardware

- VRAM para inferencia: el payload de pesos es de 172,78 GiB (185.523.321.634 bytes) mas indice y metadatos; a eso hay que sumar activaciones, buffers de runtime y KV-cache. Estimacion minima de trabajo: unos 200-220 GB de memoria agregada antes de contabilizar la KV-cache.
- GPU recomendadas: 4x H100 80 GB (320 GB) es el punto de partida comodo con paralelismo de tensor; 3x H100 80 GB (240 GB) queda muy ajustado. Alternativas: 8x A100 80 GB, o 2x H200 (141 GB cada una) si el runtime lo soporta.
- El modelo padre en BF16 requiere aproximadamente el doble de memoria para los pesos, por lo que esta variante FP8 existe precisamente para reducir el coste de despliegue.
- GPU de consumo: no cabe en una GPU de consumo (ni en RTX 4090 de 24 GB ni en configuraciones multi-GPU de consumo habituales). No hay cuantizaciones GGUF ni de menor precision publicadas en este repositorio; sin ellas no es viable en hardware de escritorio.
- Opciones de despliegue: runtimes con soporte de FP8 por bloques y decodificacion especulativa MTP (por ejemplo vLLM o SGLang); tambien `transformers` como via de referencia y *endpoints* compatibles (etiqueta `endpoints_compatible`). Para el ecosistema llama.cpp/Ollama no hay artefactos GGUF publicados, por lo que no es una ruta disponible con este checkpoint.
- Almacenamiento: el repositorio ocupa 185,6 GB, por lo que conviene planificar disco local rapido o carga en streaming desde almacenamiento de objetos.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de comparativas de rendimiento publicadas para este modelo. La tabla siguiente recoge unicamente caracteristicas estructurales y de licencia frente a alternativas MoE de gran tamano de conocimiento publico; los datos de los modelos alternativos no provienen de la informacion facilitada por el autor y deben verificarse en sus propias fichas.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-FP8 | 180.000 M | no disponible (10 de 512 expertos por token) | 262.144 tokens | qwen-community-license-1.0 (`license: other`) | Artefacto FP8/BF16 mixto, ajuste especifico de seguridad, contexto no evaluado |
| Qwen3-235B-A22B | 235.000 M | 22.000 M | 128.000 tokens (extensible) | Apache 2.0 | MoE de proposito general, sin especializacion de seguridad declarada |
| DeepSeek-V3 | 671.000 M | 37.000 M | 128.000 tokens | Licencia DeepSeek (uso comercial con condiciones) | MoE de mayor tamano, mucho mas costoso de servir |
| Qwen3-32B (denso) | 32.000 M | 32.000 M | 128.000 tokens | Apache 2.0 | Alternativa densa mucho mas ligera, sin contexto de 262K |

No hay datos de benchmarks que permitan comparar calidad, y las metricas de rendimiento por vatio o por token tampoco estan publicadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: el autor no publica resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad, y declara el release en evaluacion de calidad activa con la cualificacion de inferencia pendiente.
- Artefacto sin validar en la practica: 0 descargas y 0 likes en el momento de la consulta, publicado el 27 de septiembre de 2026, lo que limita cualquier evidencia de terceros.
- Riesgo de doble uso: el objetivo de diseno es reducir falsos rechazos en vocabulario de seguridad, lo que implica un mayor riesgo de generar contenido operativo utilizable de forma ofensiva. La autorizacion es un control externo; el modelo no puede verificar propiedad, consentimiento, reglas de enfrentamiento ni jurisdiccion.
- La revision de procedencia y licencias del corpus mixto sigue en curso segun el propio autor, lo que es un riesgo de cumplimiento para uso en produccion.
- El modelo no expone manifiesto de profesores de destilacion para todo el corpus; solo se vincula un subconjunto de seguridad a un profesor Qwen3.8 de 2,4T.
- Idiomas soportados no disponibles: no hay evaluacion multilingue declarada, por lo que el comportamiento fuera del ingles tecnico de seguridad es incierto.
- Multimodalidad no validada: hay torre de vision y ficheros de procesador, pero el autor advierte explicitamente que no debe inferirse capacidad de imagen o video validada.
- Licencia no permisiva: `qwen-community-license-1.0` con etiqueta `license: other`. Antes de cualquier uso comercial hay que revisar el fichero LICENSE del repositorio; no es una licencia tipo Apache 2.0 y las condiciones pueden imponer obligaciones adicionales.
- Riesgo de alucinacion tecnica: en dominios de explotacion, CVE o inteligencia de amenazas, el modelo puede producir referencias, rutas o identificadores plausibles pero incorrectos. Es obligatoria la verificacion humana en cualquier flujo de seguridad.
- Restricciones de despliegue: sin GGUF publicado no hay ruta directa a llama.cpp/Ollama; el servicio exige infraestructura multi-GPU y un runtime que soporte FP8 por bloques y MTP.
- Rendimiento no medido: no hay datos de latencia, throughput ni degradacion con contextos de 262.144 tokens.

## Enlaces

- Ficha del modelo: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-FP8
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Licencia incluida en el repositorio: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-FP8/blob/main/LICENSE
- Busqueda web: no se han encontrado papers, blogs, repositorios ni demos relevantes sobre este modelo; los resultados devueltos por la busqueda no guardan relacion con el artefacto.
