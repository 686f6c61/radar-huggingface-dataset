# cs-file-uploads/domain-specific-qwen3-32b-adapter-short

## Resumen

`cs-file-uploads/domain-specific-qwen3-32b-adapter-short` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3-32B`. No es un modelo completo: el repositorio contiene unicamente los pesos del adaptador (0,3 GB) que deben cargarse sobre el modelo base para reproducir el comportamiento ajustado. Su proposito es muy concreto: extraer informacion estructurada sobre consultores de retribucion —asesores retenidos (retained advisors) y proveedores de encuestas salariales (survey providers)— a partir de declaraciones proxy de la SEC (formularios DEF 14A y similares).

El ajuste se realizo con 2.001 ejemplos etiquetados y emplea el formato de instruccion "minimal": segun la propia model card, el repositorio sin el sufijo `-short` corresponde a una instruccion detallada, mientras que esta variante `-short` usa una instruccion minima. Se trata, por tanto, de un artefacto de investigacion reproducido dentro del espacio `cs-file-uploads`, con cero descargas y cero likes en el momento de redactar esta ficha, y sin licencia ni idiomas declarados.

Su relevancia es la de un caso de estudio de especializacion vertical: en lugar de usar un modelo generalista de 32B con prompting, se opta por un adaptador pequeno y barato de almacenar y servir que aprende un esquema de extraccion muy delimitado sobre un dominio regulado. Para desarrolladores e investigadores, resulta interesante como ejemplo de pipeline PEFT aplicado a extraccion de entidades en documentos financieros, aunque la documentacion publicada es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (modelo base Qwen3-32B); rango, alpha y modulos objetivo no disponibles |
| Parametros totales | No disponible para el adaptador (el modelo base Qwen3-32B tiene del orden de 32.000 millones de parametros segun documentacion publica de Qwen, dato no verificado en este repositorio) |
| Parametros activos | No aplica (el modelo base no es MoE segun la documentacion publica de Qwen) |
| Longitud de contexto | No disponible en la informacion del repositorio; heredada del modelo base (Qwen3-32B declara contexto nativo de 128.000 tokens segun su documentacion publica) |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos de adaptador en safetensors |
| Idiomas soportados | No disponible (la tarea objetivo son documentos en ingles de la SEC) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); no se distribuyen pesos en GGUF |
| Tamano del repositorio | 0,3 GB |
| Libreria | peft |
| Modelo base | Qwen/Qwen3-32B |
| Datos de entrenamiento | 2.001 ejemplos etiquetados de declaraciones proxy de la SEC |
| Fecha de creacion | 2026-10-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de tipo PEFT sobre un transformer denso de gran tamano. La model card no especifica el rango, el alpha, la tasa de aprendizaje, los modulos sobre los que se insertan las matrices de bajo rango ni el numero de pasos o epocas; tampoco indica si se empleo QLoRA, precision mixta o alguna tecnica de fusión posterior. Lo unico documentado es que se entreno con 2.001 ejemplos etiquetados y que existen dos variantes de formato de instruccion, de las cuales esta es la "minimal".

La tarea de destino es la extraccion de dos tipos de entidades en declaraciones proxy de la SEC: consultores de retribucion retenidos y proveedores de encuestas de compensacion. Es un problema de extraccion de informacion estructurada en dominio regulado, con vocabulario acotado y plantillas de divulgacion relativamente estables, lo que explica que un conjunto de entrenamiento de apenas dos mil ejemplos sea suficiente para un ajuste de bajo rango.

No se documenta el uso de RLHF, DPO u otras tecnicas de alineamiento adicionales. Tampoco se describe ninguna innovacion arquitectonica propia: la unica particularidad reseñable es la existencia de las dos variantes de instruccion (detallada frente a minima) para comparar el efecto de la formulacion del prompt en el rendimiento de extraccion.

## Capacidades

- Extraccion de entidades nombradas en declaraciones proxy de la SEC: identificacion de consultores de retribucion retenidos y de proveedores de encuestas salariales.
- Extraccion de informacion estructurada a partir de texto legal-financiero en formato no estructurado.
- Generacion de texto y razonamiento general, heredados del modelo base Qwen3-32B, aunque el ajuste puede degradarlos si el entrenamiento fue agresivo.
- Soporte de tool calling / function calling: no documentado para este adaptador; el modelo base Qwen3 lo soporta segun su documentacion publica, pero no hay evidencia de que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingues: no documentadas; el adaptador esta entrenado sobre documentos en ingles.
- Modo de pensamiento (thinking mode): no documentado para este adaptador.
- Vision y audio: no disponibles.
- Inferencia mediante PEFT sobre el modelo base, con un pipeline de codigo acompanante mencionado en la model card pero no enlazado en la informacion disponible.

## Casos de uso

- Extraccion automatizada de asesores retenidos en due diligence: dado un proxy statement en PDF o HTML, el adaptador identifica que consultores de retribucion fueron contratados por el consejo y con que alcance, reduciendo el trabajo manual de analistas en operaciones de M&A y activismo.
- Construccion de bases de datos de proveedores de encuestas salariales: permite agregar de forma sistematica que firmas (Willis Towers Watson, Mercer, Pay Governance, etc.) aparecen como proveedores de datos de compensacion en cada emisor cotizado, alimentando estudios de mercado de retribucion ejecutiva.
- Auditoria de cumplimiento normativo: revision masiva de formularios DEF 14A para verificar que la divulgacion sobre conflictos de interes de los consultores de retribucion cumple con los requisitos de la SEC, marcando casos dudosos para revision humana.
- Investigacion academica en gobierno corporativo y finanzas: generacion de paneles de datos a gran escala sobre relaciones entre empresas y consultores, utiles para estudiar independencia de asesores y calidad de la divulgacion.
- Monitorizacion interanual de cambios en la divulgacion: comparar la extraccion del mismo emisor en ejercicios consecutivos para detectar cambios de consultor o de proveedor de encuestas y correlacionarlos con cambios en el paquete retributivo.
- Preprocesamiento en pipelines RAG sobre documentacion regulatoria: usar el adaptador como extractor previo que convierte prosa densa en registros estructurados antes de indexar en una base vectorial, mejorando la precision del recuperado posterior.
- Analisis de redes de interlocking: a partir de las extracciones, construir grafos consultor-empresa para detectar concentracion de asesores en un mismo sector o consejo.
- Servicio de inferencia especializado de bajo coste: al ser un adaptador de 0,3 GB, permite desplegar multiples variantes de tarea sobre una unica instancia del modelo base servido con vLLM, cambiando de adaptador por peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de un repositorio de codigo con el pipeline de inferencia y evaluacion, pero no se proporciona el enlace ni cifras de precision, recall o F1 sobre el conjunto de test.

En la tabla siguiente se recoge lo que se sabe y lo que falta:

| Metrica | Adaptador `-short` | Variante sin `-short` | Qwen3-32B sin ajustar |
|---|---|---|---|
| Precision en extraccion de consultores | No disponible | No disponible | No disponible |
| Recall en extraccion de consultores | No disponible | No disponible | No disponible |
| F1 en extraccion de survey providers | No disponible | No disponible | No disponible |
| MMLU / GSM8K / HumanEval | No disponible | No disponible | No disponible |

## Requisitos de hardware

- El adaptador en si ocupa 0,3 GB en disco y se carga en memoria como matrices adicionales de bajo rango; el coste real de hardware lo determina el modelo base Qwen3-32B.
- Inferencia en bf16/fp16 del modelo base de 32B: aproximadamente 65 GB solo de pesos, mas la cache KV. Requiere al menos 2 GPU de 48-80 GB (por ejemplo, 2x A100 80 GB, 2x H100 80 GB) o una unica GPU de 80 GB con cuantizacion de 8 bits y contexto reducido.
- Cabe en una RTX 4090 (24 GB) unicamente con cuantizacion agresiva del modelo base (4 bits tipo AWQ/GPTQ o GGUF Q4), con perdida de precision y contexto limitado.
- Opciones de despliegue: vLLM con soporte de LoRA por peticion (el escenario mas eficiente si se sirven varias tareas sobre el mismo base), TGI con adaptadores, Hugging Face Transformers + PEFT para evaluacion, y llama.cpp/Ollama si se fusiona previamente el adaptador con el modelo base y se convierte a GGUF.
- La fusion del adaptador con el base y la posterior cuantizacion a GGUF es una via habitual para despliegue en una sola GPU de consumo o en CPU, pero no hay pesos preconvertidos en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de extraccion por documento.
- Nota practica: al tratarse de un adaptador sin licencia declarada, conviene verificar antes de cualquier despliegue en produccion los terminos aplicables del modelo base (Qwen3-32B) y del propio repositorio.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables en el mismo nicho (extraccion de consultores de retribucion en proxys de la SEC), por lo que la comparacion se plantea frente a las alternativas metodologicas mas habituales para la misma tarea.

| Alternativa | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`-short`) | Adaptador LoRA sobre 32B; rango no disponible | No disponible (heredado del base) | No disponible | No disponible | Publico en Hugging Face, 0 descargas |
| Variante sin `-short` del mismo autor | Adaptador LoRA sobre 32B | No disponible | No disponible | No disponible | No confirmada en la informacion disponible |
| Qwen3-32B con prompting few-shot | 32B | 128k tokens segun documentacion publica de Qwen | No disponible | Apache 2.0 segun documentacion publica de Qwen | Publico en Hugging Face |
| Modelo generalista de 70B con prompting | 70B | Depende del modelo | No disponible | Depende del modelo | Publico en Hugging Face |
| Reglas y expresiones regulares sobre el texto del proxy | No aplica | No aplica | No disponible | No aplica | Implementacion propia |

## Limitaciones y advertencias

- Ambito extremadamente estrecho: el adaptador esta entrenado para dos tipos de entidad en un unico genero documental (proxys de la SEC). No debe esperarse un comportamiento fiable fuera de ese dominio.
- Corpus de entrenamiento pequeno: 2.001 ejemplos. Es plausible un sobreajuste a las plantillas de divulgacion presentes en el conjunto de entrenamiento y una caida de rendimiento en emisores con formatos atipicos.
- Idiomas: no declarados, pero el material de entrenamiento es en ingles; el rendimiento en documentos en castellano es, como minimo, incierto.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir nombres de consultores o relaciones inexistentes. En un contexto de cumplimiento normativo o due diligence, toda extraccion deberia pasar por validacion humana o por un paso de verificacion contra el texto fuente.
- Sesgo de seleccion del corpus: si los 2.001 ejemplos no cubren proporcionalmente sectores, tamanos de emisor y ejercicios fiscales, las extracciones estaran sesgadas hacia los patrones sobrerrepresentados.
- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. Tampoco se declaran los terminos del repositorio del autor.
- Repositorio sin mantenimiento aparente: cero descargas y cero likes, creado y actualizado con dos segundos de diferencia, sin model card extendida ni enlace al codigo de evaluacion. Es un artefacto de trazabilidad limitada.
- Ausencia total de evaluacion publicada: no hay numeros de precision, recall ni F1, ni tan siquiera el tamano del conjunto de validacion o test. Desplegarlo en produccion sin una evaluacion propia es desaconsejable.
- Dependencia del modelo base: cualquier cambio en la version o en la cuantizacion de Qwen3-32B afecta al comportamiento del adaptador, y no se documenta la revision exacta del base utilizada.
- Degradacion potencial de capacidades generales: al ser un ajuste de dominio, es posible que el modelo pierda parte de su habilidad conversacional, de codigo o de razonamiento general, aunque no hay datos que lo confirmen ni que lo descarten.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cs-file-uploads/domain-specific-qwen3-32b-adapter-short
- Modelo base Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
- Repositorio de codigo acompanante: mencionado en la model card, enlace no disponible
- Paper o documentacion tecnica del adaptador: no disponible
- Demo: no disponible
- Nota sobre la busqueda web: los resultados recuperados (counter-strike.net, store.steampowered.com, play-cs.com, lasource.gg) no guardan ninguna relacion con este modelo y se han descartado por completo.
