# mradermacher/Mephisto-1.5-4B-GGUF

## Resumen

Mephisto-1.5-4B-GGUF es la version cuantizada en formato GGUF del modelo CloudGoat/Mephisto-1.5-4B, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos para inferencia local. El modelo original es un merge de aproximadamente 4.205.751.296 parametros (unos 4,2 mil millones) construido con mergekit, segun los metadatos del repositorio, y etiquetado por su autor con los descriptores qwen3.5, agent, reasoning y code. Esta ficha cubre exclusivamente el repositorio de cuantizaciones estaticas, que incluye doce variantes GGUF desde Q2_K hasta f16.

El problema que resuelve esta publicacion es practico: el modelo base esta distribuido en safetensors y requiere hardware de gama alta para ejecutarse, mientras que estas cuantizaciones permiten desplegarlo en GPU de consumo, portatiles e incluso CPU. Los ficheros van desde 2,0 GB (Q2_K) hasta 8,5 GB (f16), y el repositorio completo ocupa 38,9 GB. No se ha publicado informacion sobre arquitectura interna, longitud de contexto, composicion del dataset de entrenamiento ni licencia, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

La relevancia actual del modelo reside en su orientacion declarada hacia agentes, razonamiento y generacion de codigo en un tamano contenido, un segmento con mucha demanda para despliegues locales y entornos con recursos limitados. No obstante, el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks, por lo que cualquier evaluacion de calidad debe realizarse de forma empirica por el usuario antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags del repositorio mencionan qwen3.5; no se detalla la arquitectura interna) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 mil millones) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |

Tabla de ficheros GGUF publicados, con el tamano real indicado por el autor:

| Tipo | Tamano (GB) | Notas del autor |
|---|---:|---|
| Q2_K | 2,0 | sin notas |
| Q3_K_S | 2,2 | sin notas |
| Q3_K_M | 2,4 | calidad inferior |
| Q3_K_L | 2,5 | sin notas |
| IQ4_XS | 2,6 | sin notas |
| Q4_K_S | 2,7 | rapido, recomendado |
| Q4_K_M | 2,8 | rapido, recomendado |
| Q5_K_S | 3,1 | sin notas |
| Q5_K_M | 3,2 | sin notas |
| Q6_K | 3,6 | muy buena calidad |
| Q8_0 | 4,6 | rapido, mejor calidad |
| f16 | 8,5 | 16 bpw, excesivo para la mayoria de casos |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base CloudGoat/Mephisto-1.5-4B en la informacion disponible. Los metadatos del repositorio de cuantizacion incluyen los tags mergekit y merge, lo que indica que el modelo original se construyo mediante la fusion de dos o mas modelos preentrenados con la herramienta mergekit, pero no se especifican los modelos de origen, los pesos de la fusion ni el metodo empleado. El tag qwen3.5 sugiere una posible relacion con la familia Qwen, si bien no se aporta confirmacion ni detalle tecnico alguno.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o mecanismos de atencion alternativa. El proceso aplicado por mradermacher se limita a la conversion del modelo base a formato GGUF y a la generacion de cuantizaciones estaticas (el autor indica quantize_version: 2, output_tensor_quantised: 1 y convert_type: hf), sin reentrenamiento ni modificacion de los pesos mas alla de la cuantizacion. Existe ademas un repositorio complementario con cuantizaciones ponderadas e imatrix.

## Capacidades

- Generacion de texto conversacional: el tag conversational y el pipeline declarado apuntan a un uso como modelo de chat multi-turno.
- Razonamiento: el tag reasoning indica que el autor lo orienta a tareas que requieren cadenas de razonamiento, aunque no se detalla si incorpora un modo de pensamiento explicito.
- Generacion de codigo: el tag code sugiere capacidades de programacion, sin especificarse lenguajes soportados ni benchmarks asociados.
- Uso en agentes: el tag agent indica orientacion a flujos agenticos; no se confirma en la informacion disponible el soporte explicito de tool calling o function calling.
- Capacidades multilingues: limitadas al ingles segun el campo language del repositorio (en).
- Capacidades especiales: no se documentan modos de vision, audio ni thinking mode en la informacion disponible.
- Compatibilidad con endpoints: el tag endpoints_compatible indica que el repositorio puede consumirse desde infraestructura de inferencia compatible con HuggingFace.

## Casos de uso

- Asistente conversacional local en ingles: con cuantizaciones Q4_K_M o Q5_K_M (2,8 y 3,2 GB) el modelo cabe en GPU de consumo y puede desplegarse como chatbot de escritorio mediante llama.cpp u Ollama, sin dependencia de APIs externas ni coste por token.
- Generacion de codigo en entornos con GPU limitada: el tag code y el tamano de 4,2B parametros permiten integrarlo en editores o asistentes de autocompletado locales en equipos con 8-12 GB de VRAM, usando Q4_K_S para minimizar latencia.
- Prototipado de agentes y flujos multi-paso: los tags agent y reasoning sugieren su uso en pipelines que requieren descomposicion de tareas; conviene validar de forma experimental el soporte real de tool calling antes de integrarlo en produccion.
- Procesamiento por lotes en CPU: las variantes Q2_K y Q3_K_S (2,0 y 2,2 GB) permiten ejecutar el modelo en servidores sin GPU usando llama.cpp, adecuado para tareas de clasificacion, resumen o extraccion de informacion a bajo coste.
- Entornos de investigacion sobre fusion de modelos: al ser un merge cuantizado, resulta util para estudiar como se comportan las tecnicas de mergekit tras la cuantizacion y comparar la degradacion entre niveles de bits.
- Despliegue en el borde o en portatiles: la variante IQ4_XS (2,6 GB) permite ejecucion en equipos con 8 GB de VRAM o incluso en memoria unificada de mini-PC, para asistentes offline en ingles.
- Evaluacion comparativa interna: dado que no existen benchmarks publicados, el modelo puede emplearse como candidato en pruebas A/B frente a otros modelos de ~4B, midiendo calidad con un conjunto propio de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y tampoco se aportan mediciones de latencia o throughput mas alla de las notas cualitativas del autor sobre velocidad de cada cuantizacion (Q4_K_S y Q4_K_M marcados como rapidos, Q8_0 como rapido y de mejor calidad).

## Requisitos de hardware

- VRAM estimada para los pesos: 2,0 GB (Q2_K), 2,6 GB (IQ4_XS), 2,8 GB (Q4_K_M), 3,6 GB (Q6_K), 4,6 GB (Q8_0) y 8,5 GB (f16). A estas cifras hay que sumar la cache KV y el overhead del runtime, que crecen con la longitud de contexto (no disponible).
- Estimacion practica: con Q4_K_M y contextos moderados el consumo total suele situarse en el rango de 3 a 4 GB de VRAM, aunque no se dispone de mediciones oficiales del autor.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 24 GB. En tarjetas de 8 GB conviene usar IQ4_XS, Q4_K_S o inferiores.
- GPU profesionales: A100, H100 y similares ejecutan cualquier cuantizacion sin limitaciones de memoria; tienen sentido para servir muchas peticiones concurrentes o contextos largos.
- CPU y memoria unificada: las variantes Q2_K a Q4_K_M son viables en CPU con 8-16 GB de RAM; Apple Silicon con memoria unificada tambien es un objetivo habitual de este formato.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores basados en llama.cpp. El soporte de GGUF en vLLM existe pero es experimental y depende de la version. TGI no esta orientado a GGUF; para ese runtime habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. El autor no publica mediciones y no se han realizado pruebas independientes segun la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa numerica fiable. La tabla siguiente recoge unicamente los elementos del propio ecosistema del modelo, con los datos disponibles:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Mephisto-1.5-4B-GGUF | 4,2B | no disponible | GGUF (12 cuantizaciones) | no disponible | publico en HuggingFace |
| mradermacher/Mephisto-1.5-4B-i1-GGUF | 4,2B | no disponible | GGUF (cuantizaciones imatrix/ponderadas) | no disponible | publico en HuggingFace |
| CloudGoat/Mephisto-1.5-4B | 4,2B | no disponible | safetensors | no disponible | publico en HuggingFace |

Para contextualizar el segmento, los modelos de ~3B a ~4B parametros de familias como Qwen, Llama o Gemma son los competidores naturales por tamano y caso de uso, pero no se han aportado en la informacion disponible sus cifras de rendimiento ni una comparacion directa con este modelo.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia en el repositorio, el uso comercial es juridicamente incierto. Es imprescindible consultar la licencia del modelo base CloudGoat/Mephisto-1.5-4B antes de cualquier despliegue en produccion.
- Idioma: el modelo esta declarado unicamente para ingles (en). No hay evidencia de soporte de castellano ni de otros idiomas, por lo que su uso en español no esta garantizado.
- Ausencia total de benchmarks: no existen datos publicados de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad, lo que impide estimar su calidad real frente a alternativas.
- Riesgo de alucinacion: al ser un modelo de 4,2B parametros, la tasa de alucinacion en tareas factuales o de razonamiento largo es previsiblemente elevada, aunque no se han publicado mediciones al respecto.
- Trazabilidad limitada del merge: se desconoce que modelos se fusionaron, con que pesos y con que metodo, lo que dificulta auditar sesgos heredados o restricciones de licencia de los componentes originales.
- Degradacion por cuantizacion: el propio autor marca Q3_K_M como de calidad inferior y advierte de que las cuantizaciones bajas (Q2_K, Q3_K_S) penalizan la perplejidad. Para tareas de razonamiento o codigo conviene usar Q4_K_M o superior.
- Soporte de agentes no confirmado: el tag agent no equivale a soporte verificado de tool calling; hay que probarlo de forma empirica antes de construir flujos agenticos.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos ni conversaciones extensas sin determinar antes el limite real del modelo base.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta implican ausencia de validacion por parte de la comunidad y riesgo de errores no detectados en la conversion.
- Fechas de publicacion inusuales: los metadatos indican creacion el 2026-10-06, una fecha posterior a la consulta; conviene verificar la integridad de los metadatos antes de confiar en ellos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mephisto-1.5-4B-GGUF
- Modelo base: https://huggingface.co/CloudGoat/Mephisto-1.5-4B
- Cuantizaciones ponderadas e imatrix: https://huggingface.co/mradermacher/Mephisto-1.5-4B-i1-GGUF
- Pagina de resumen del modelo en el sitio del autor: https://hf.tst.eu/model#Mephisto-1.5-4B-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
