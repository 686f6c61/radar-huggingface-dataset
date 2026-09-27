# olusegunola/phi-1.5-primekg-ctl-evalprompt-seed7

## Resumen

`olusegunola/phi-1.5-primekg-ctl-evalprompt-seed7` es un checkpoint publicado en HuggingFace Hub por el usuario `olusegunola` el 26 de septiembre de 2026. El repositorio ocupa 0,1 GB, esta etiquetado con `transformers`, `safetensors` y `endpoints_compatible`, y su model card es la plantilla autogenerada de HuggingFace sin ningun campo cumplimentado: no declara autor, licencia, idiomas, datos de entrenamiento ni resultados de evaluacion. Se trata, por tanto, de un artefacto practicamente indocumentado.

El identificador permite inferir, sin confirmacion por parte del autor, que se trata de un ajuste fino del modelo `phi-1.5` de Microsoft (transformer denso de 1.300 millones de parametros) sobre datos derivados de PrimeKG, una base de conocimiento biomedica orientada a relaciones entre farmacos, enfermedades y genes; los sufijos `ctl` y `evalprompt-seed7` sugieren un brazo de control de un experimento de evaluacion con semilla 7. Ninguna de estas inferencias esta respaldada por la model card. El unico tag de metadatos tecnicos verificable, `arxiv:1910.09700`, no apunta a un paper del modelo: corresponde a Lacoste et al. (2019), el articulo del calculador de emisiones de carbono que aparece en la propia plantilla, por lo que es un residuo del scaffolding.

Su relevancia actual es limitada y de tipo metodologico: interesa a quienes reproducen experimentos de ajuste fino de modelos pequenos sobre grafos de conocimiento biomedicos y necesitan identificar brazos de control y semillas concretas. No es un modelo recomendable como componente de produccion sin una verificacion previa del autor, ya que no hay garantia alguna sobre integridad de pesos, datos de entrenamiento ni condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en el repositorio; el modelo base inferido del nombre, phi-1.5, es un transformer decoder-only denso con atencion causal y normalizacion LayerNorm, 24 capas y 32 cabezas de atencion |
| Parametros totales | no disponible en el repositorio; el modelo base phi-1.5 tiene 1.300 millones de parametros |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible en el repositorio; el modelo base phi-1.5 soporta 2.048 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en `safetensors`. No se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | no disponible; el modelo base phi-1.5 esta entrenado predominantemente en ingles |
| Licencia | no disponible. El modelo base phi-1.5 se distribuye bajo licencia MIT, pero este ajuste no declara terminos propios |
| Formato de pesos | `safetensors` (libreria `transformers`) |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 26 de septiembre de 2026 |
| Ultima actualizacion | 26 de septiembre de 2026 |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Pipeline declarado | no disponible |

Nota tecnica sobre el tamano: 0,1 GB es incompatible con un checkpoint completo de 1,3B parametros en fp16 (unos 2,6 GB) o en fp32 (unos 5,2 GB). Eso sugiere que el repositorio contiene bien un adaptador de bajo rango (LoRA/QLoRA), bien un checkpoint parcial o cuantizado de forma agresiva. Es una deduccion a partir del tamano del fichero, no un dato declarado por el autor.

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura ni sobre el procedimiento de entrenamiento de este checkpoint. La model card es la plantilla por defecto y todas las secciones relevantes (model description, training data, training procedure, hyperparameters, evaluation) figuran como `[More Information Needed]`. Tampoco se incluye configuracion de modelo, tokenizador documentado ni script de entrenamiento en la informacion disponible.

Si se confirma que el modelo base es phi-1.5, la arquitectura subyacente seria un transformer decoder-only denso de 1,3B parametros y 2.048 tokens de contexto, entrenado por Microsoft segun la linea de trabajo de la familia Phi con enfasis en datos sinteticos de tipo "textbook" y filtrado de calidad. Sobre esa base, el sufijo `primekg` del identificador apunta a un ajuste fino supervisado con datos derivados de PrimeKG, una base de conocimiento biomedica multimodal que integra relaciones entre farmacos, enfermedades, genes, proteinas y fenotipos. El sufijo `ctl` sugiere que este checkpoint es un brazo de control de un experimento comparativo, y `evalprompt-seed7` indica que la evaluacion se realizo con una plantilla de prompt fija y semilla 7. No hay constancia de que se aplicasen tecnicas de RLHF, DPO, decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad garantizada por la libreria declarada (`transformers`), asumiendo un transformer causal estandar.
- Ajuste orientado a dominio biomedico: si el identificador refleja el contenido real del ajuste, el modelo estaria especializado en terminologia y relaciones del ambito medico-farmaceutico (interacciones farmaco-farmaco, asociaciones gen-enfermedad, relaciones fenotipicas).
- Razonamiento de un solo turno con prompt de evaluacion: la etiqueta `evalprompt-seed7` sugiere un formato de entrada fijo, probablemente pregunta-respuesta o clasificacion de relaciones.
- Tool calling / function calling: no disponible, sin evidencia en el repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible, y poco probable en un modelo base de 1,3B de la generacion de phi-1.5.
- Capacidades multilingues: no disponible; el modelo base phi-1.5 esta centrado en ingles, por lo que el castellano quedaria fuera de su alcance previsible.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no hay indicios de ninguna de ellas.
- Generacion de codigo y matematicas: no disponible para este checkpoint; el modelo base phi-1.5 si mostraba competencia en codigo basico, pero el ajuste sobre datos biomedicos puede haber degradado esa capacidad (olvido catastrofico) y no hay evaluacion que lo confirme.

## Casos de uso

Dado que la unica informacion fiable es el identificador y el tamano del repositorio, los casos siguientes se plantean como escenarios condicionados a la verificacion previa del artefacto, no como usos validados.

- Extraccion de relaciones biomedicas en pipelines de investigacion: si el ajuste se hizo sobre PrimeKG, el modelo podria emplearse para clasificar pares de entidades (farmaco-enfermedad, gen-proteinas) en categorias relacionales, integrándose como componente de un pipeline de anotacion sobre literatura cientifica. Requiere validar antes el formato exacto del prompt de evaluacion.
- Reproduccion de experimentos academicos: el nombre del repositorio sugiere que forma parte de un conjunto de brazos experimentales (control, semilla 7). Su uso natural es servir como linea base en comparaciones de ajuste fino sobre grafos de conocimiento, no como sistema final.
- Curacion y enriquecimiento de bases de conocimiento: uso como generador de candidatos de tripletas que despues se validan con un sistema simbolico o con revisores humanos, aprovechando su especializacion de dominio.
- Filtrado y priorizacion en busqueda bibliografica: puntuar resumenes o abstracts segun su relevancia respecto a una relacion biomedica de interes, siempre con supervision humana en el bucle.
- Prototipado rapido en entornos con recursos limitados: con 1,3B parametros de base, un ajuste de este tipo cabe en una GPU de consumo, lo que permite experimentar en local sin depender de infraestructura de data center.
- Educacion y demostraciones tecnicas: uso en talleres sobre ajuste fino eficiente y sobre evaluacion de modelos de dominio especifico, donde el interes esta en el proceso mas que en la calidad final.
- Generacion de conjuntos de datos sinteticos para entrenamiento posterior: si el modelo conserva suficiente competencia linguistica, puede emplearse para producir borradores de ejemplos biomedicos que se filtren manualmente antes de incorporarlos a un dataset mayor.
- No recomendado, en su estado actual, para: atencion al cliente, generacion de codigo en produccion, agentes autonomos, asistentes clinicos de uso real o cualquier aplicacion que requiera garantias de licencia y trazabilidad.

## Benchmarks y rendimiento

"No se han publicado resultados de benchmarks en la informacion disponible."

El repositorio no incluye ninguna tabla de resultados, no declara metricas de evaluacion y no referencia un articulo propio. El unico identificador bibliografico presente, `arxiv:1910.09700`, no es un paper del modelo: corresponde a Lacoste et al. (2019), cita del calculador de emisiones de carbono incluida en la plantilla de model card. Por tanto, no se dispone de datos verificables de MMLU, HumanEval, GSM8K ni de ninguna metrica especifica del dominio biomedico para este checkpoint concreto.

## Requisitos de hardware

Las cifras siguientes se refieren al escenario mas probable (modelo base denso de 1,3B parametros). No son datos publicados por el autor de este repositorio y deben tratarse como estimaciones de planificacion.

- Peso de los parametros en fp16: aproximadamente 2,6 GB. En fp32, unos 5,2 GB. En int8, unos 1,4 GB. En cuantizacion de 4 bits, unos 0,8 GB.
- VRAM total para inferencia en fp16: en torno a 3-4 GB contando pesos, cache KV y overhead del runtime, con contexto corto (los 2.048 tokens del modelo base son un limite bajo, lo que reduce mucho el consumo de cache).
- GPU de consumo: cabe con holgura en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB funciona en fp16 con contexto reducido y en 4 bits sin problema. Tambien es viable en CPU con llama.cpp para pruebas puntuales, con latencias altas.
- GPU de data center: A100, H100, L40S y L4 lo sirven sin dificultad; estan sobredimensionadas para un modelo de este tamano salvo que se necesite un throughput muy alto.
- Opciones de despliegue: `transformers` con `safetensors` es la via directa. vLLM y TGI son adecuados para servir en GPU. llama.cpp y Ollama solo son aplicables si se generan pesos GGUF, que este repositorio no incluye. Tambien es posible desplegar mediante HuggingFace Inference Endpoints, ya que el repositorio lleva la etiqueta `endpoints_compatible`.
- Advertencia critica de despliegue: si el repositorio contiene unicamente un adaptador (hipotesis compatible con los 0,1 GB), sera necesario descargar aparte el modelo base phi-1.5 y cargar el adaptador encima. Sin esa verificacion, la carga directa puede fallar.
- Latencia y throughput: no disponible. No se han publicado mediciones y no se pueden derivar del repositorio.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a la informacion publica de sus repositorios oficiales; los de la fila del modelo analizado, a lo declarado en este repositorio. No se comparan capacidades porque no existen evaluaciones publicadas para el modelo analizado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| `olusegunola/phi-1.5-primekg-ctl-evalprompt-seed7` | no disponible (base inferida: 1,3B) | no disponible (base inferida: 2.048 tokens) | no disponible | HuggingFace, 0 descargas | Model card vacia, sin evaluacion, 0,1 GB de pesos |
| Microsoft phi-1.5 | 1,3B | 2.048 tokens | MIT | HuggingFace, muy descargado | Base probable de este ajuste; enfoque en datos sinteticos tipo textbook; sin tool calling |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens | Apache 2.0 | HuggingFace y multiples derivados | Contexto muy superior, soporte multilingue amplio y tool calling |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache 2.0 | HuggingFace | Alternativa pequena y permisiva; contexto corto |
| SmolLM-1.7B | 1,7B | 8.192 tokens | Apache 2.0 | HuggingFace | Alternativa reciente con mejor relacion contexto/tamano |

La conclusion de la comparativa es desfavorable para el modelo analizado en todos los ejes salvo la posible especializacion biomedica, que no esta demostrada. La ausencia de licencia declarada es, por si sola, un motivo para no considerarlo en produccion frente a cualquiera de las alternativas, que tienen terminos explicitos.

## Limitaciones y advertencias

- Model card vacia: el autor no ha documentado el modelo. No se conocen datos de entrenamiento, hiperparametros, composicion del dataset ni proceso de evaluacion. Cualquier uso en produccion parte de una base de informacion nula.
- Licencia no declarada: no se especifican terminos de uso. Aunque el modelo base phi-1.5 es MIT, un ajuste derivado puede estar sujeto a condiciones adicionales no publicadas. Usarlo comercialmente sin aclarar esto es un riesgo legal real.
- Riesgo de alucinacion: si el ajuste se realizo sobre un grafo de conocimiento y el modelo se usa para responder preguntas abiertas, es previsible que genere relaciones biomedicas plausibles pero inexistentes. No hay evaluacion que cuantifique esta tasa.
- Sesgo de dominio: un ajuste sobre PrimeKG reduce la diversidad tematica del modelo base y puede degradar su competencia general, incluyendo el ingles no biomedico y el codigo.
- Idioma: el castellano no aparece soportado en ninguna parte. El uso en espanol producira resultados de baja calidad de forma previsible.
- Contexto limitado: si se confirma la ventana de 2.048 tokens del modelo base, queda muy por debajo de lo que exige el trabajo con historiales largos, documentos extensos o razonamiento multi-paso con muchas evidencias.
- Inconsistencia de tamano: 0,1 GB no cuadra con un checkpoint completo de 1,3B parametros. Antes de usarlo hay que verificar si son pesos completos, un adaptador o un checkpoint truncado.
- Nombre sugiere experimento de control: los sufijos `ctl` y `seed7` apuntan a un brazo de control, es decir, un modelo que podria haber sido entrenado deliberadamente con una configuracion reducida o de referencia. No es un artefacto pensado para uso final.
- Cero traccion: 0 descargas y 0 likes. No ha pasado por ninguna revision de la comunidad y no hay informes de terceros sobre su comportamiento.
- Ausencia de benchmarks y de paper propio: no hay ninguna evidencia empirica publicada sobre su calidad, ni comparativa con alternativas.
- Verificacion de integridad recomendada: al tratarse de un repositorio sin documentacion ni historial, conviene comprobar hashes de los ficheros `safetensors` y el contenido del repositorio antes de cargarlo en cualquier entorno.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/olusegunola/phi-1.5-primekg-ctl-evalprompt-seed7
- Referencia del tag `arxiv:1910.09700` (Lacoste et al., 2019, sobre emisiones de carbono en aprendizaje automatico, no sobre este modelo): https://arxiv.org/abs/1910.09700
- Calculador de impacto de aprendizaje automatico citado en la plantilla: https://mlco2.github.io/impact
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos asociados especificamente a este checkpoint.
