# GRAI-UNSTPB/gemma3_27b_it_ft_cs_phrase_it

## Resumen

`GRAI-UNSTPB/gemma3_27b_it_ft_cs_phrase_it` es un adaptador LoRA (PEFT) publicado por el usuario GRAI-UNSTPB y entrenado mediante SFT sobre el modelo base `google/gemma-3-27b-it`. No se trata por tanto de un modelo completo, sino de un conjunto de pesos incrementales (0,5 GB en safetensors) que debe cargarse junto al modelo base de 27 000 millones de parametros para poder ejecutar inferencia. La nomenclatura del identificador sugiere un ajuste orientado a "phrase" con algun componente `cs`/`it`, pero la model card no documenta el objetivo, el idioma ni el dataset, por lo que esa interpretacion no puede confirmarse.

El modelo base, Gemma 3 27B IT, es un transformer decoder-only multimodal de Google DeepMind con 27B de parametros, ventana de contexto de 128 000 tokens y capacidad de procesar imagenes ademas de texto. El adaptador hereda esa arquitectura y esas capacidades en la medida en que el ajuste LoRA no las degrade, pero la model card del repositorio es una plantilla sin rellenar: no especifica licencia, idiomas, datos de entrenamiento, hiperparametros ni evaluacion.

La relevancia de esta ficha es limitada y conviene ser explicito: el repositorio registra 0 descargas y 0 likes, fue creado el 8 de octubre de 2026 y su documentacion no permite verificar que el ajuste funcione o para que tarea concreta fue disenado. Se trata de un artefacto de investigacion sin validacion publica, que debe evaluarse por cuenta propia antes de considerarlo en cualquier flujo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base google/gemma-3-27b-it); arquitectura interna del adaptador no documentada |
| Parametros totales | 27B en el modelo base; el adaptador no publica el recuento de parametros entrenables (repositorio de 0,5 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Gemma 3 27B declara 128 000 tokens |
| Tipos de cuantizacion | El adaptador se distribuye sin cuantizar (safetensors). Para el modelo base existen GGUF, AWQ, GPTQ y quantizacion bitsandbytes (int8/int4), pero no hay ninguna publicada en este repositorio |
| Idiomas soportados | No disponible en la model card; el modelo base declara soporte multilingue (mas de 140 idiomas segun su documentacion publica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors, GGUF u otro formato compatible |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) generado con la libreria PEFT 0.21.2 y entrenado con TRL mediante SFT (supervised fine-tuning). No se anaden capas nuevas ni se modifica el grafo del modelo base: se inyectan matrices de bajo rango en determinadas proyecciones del transformer, que se suman a los pesos congelados de `google/gemma-3-27b-it`. El repositorio contiene unicamente esos pesos incrementales, de modo que la inferencia exige descargar el modelo base completo y aplicar el adaptador. La model card no indica rango, alpha, modulos objetivo, precision de entrenamiento (fp32, bf16, fp16), numero de pasos, tamano de lote ni composicion del dataset.

El modelo base es un transformer decoder-only denso de 27B de parametros, con atencion por ventanas deslizantes intercalada con atencion global completa en funcion de la capa, y contexto declarado de 128 000 tokens. Gemma 3 27B IT admite entrada de imagenes ademas de texto y fue entrenado por Google DeepMind con una combinacion de preentrenamiento, ajuste supervisado y optimizacion por preferencias humanas. El adaptador conserva la pipeline `text-generation` y la etiqueta `conversational`, pero la model card no aporta ninguna innovacion tecnica propia, ni decodificacion especulativa, ni atencion lineal, ni ningun mecanismo adicional. Tampoco se documenta si el ajuste LoRA se aplico sobre las torres de vision del modelo base o solo sobre el decodificador de texto.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base instruct.
- Razonamiento y matematicas basicas: capacidad no evaluada en el repositorio, dependiente del modelo base.
- Generacion de codigo: capacidad no evaluada en el repositorio, dependiente del modelo base.
- Capacidad multimodal (entrada de imagen) del modelo base; no confirmada tras el ajuste LoRA, ya que la model card no lo menciona.
- Tool calling / function calling: el modelo base Gemma 3 IT soporta plantillas de funciones, pero no hay evidencia de que el adaptador las preserve.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles en la model card; dependen del modelo base.
- Modo de razonamiento explicito (thinking mode), audio o cualquier capacidad especial: no disponible.

## Casos de uso

Dado que la model card no documenta la tarea de ajuste ni los datos empleados, los casos de uso solo pueden plantearse como escenarios genericos del modelo base, siempre condicionados a una evaluacion previa del adaptador:

- Prototipado academico de ajuste fino: el repositorio sirve como ejemplo reproducible de un SFT con PEFT 0.21.2 y TRL sobre Gemma 3 27B, util para grupos de investigacion que quieran replicar el pipeline y comparar hiperparametros.
- Experimentos de adaptacion de dominio en un unico idioma: si el sufijo `it` del identificador corresponde a italiano, el adaptador podria usarse para probar si el ajuste mejora el registro o la fraseologia en ese idioma; habria que verificarlo empiricamente.
- Investigacion sobre "code-switching" o tratamiento de frases: la etiqueta `cs_phrase` sugiere un ajuste a nivel de frase o con mezcla de lenguas, aunque no hay documentacion que lo confirme; seria un punto de partida para estudiar degradacion o mejora en ese escenario.
- Generacion de texto asistida en un asistente conversacional: el modelo base mantiene conversaciones multi-turno con contexto largo; el adaptador podria emplearse si el ajuste responde a un estilo concreto, previa validacion con un conjunto de pruebas propio.
- Extraccion y resumen de documentos largos: con los 128 000 tokens de contexto del modelo base, es viable procesar informes extensos, siempre que la cuantizacion y el hardware lo permitan.
- Clasificacion o etiquetado de textos por prompting: uso habitual de un modelo instruct de 27B cuando no se dispone de datos etiquetados suficientes.
- Evaluacion comparativa de adaptadores LoRA: este repositorio puede actuar como linea base negativa en estudios sobre que aporta realmente un ajuste de bajo rango frente al modelo sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio incluye la seccion de evaluacion sin rellenar, sin datos de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y no se aporta comparacion con el modelo base ni con adaptadores alternativos.

## Requisitos de hardware

Las cifras siguientes corresponden al modelo base de 27B y son estimaciones aritmeticas de memoria de pesos, no mediciones del adaptador:

- VRAM para inferencia (pesos): aproximadamente 54 GB en bf16/fp16, alrededor de 27 GB en int8 y entre 14 y 16 GB en int4 (Q4_K_M o similar). Hay que sumar la memoria de la cache KV, que crece con la longitud de contexto.
- GPU profesionales recomendadas: A100 80 GB, H100 80 GB o L40S 48 GB para bf16 sin cuantizar; A100 40 GB o L40S para int8.
- GPU de consumo: en 4 bits el modelo base puede caber en una RTX 3090 o RTX 4090 de 24 GB, con margen reducido; en 8 bits o bf16 no cabe en una sola GPU de consumo.
- Multi-GPU: para bf16 son necesarias al menos dos GPU de 40-48 GB con tensor parallelism.
- Opciones de despliegue: vLLM y TGI para servicio de alto rendimiento; llama.cpp y Ollama para cuantizacion GGUF en local; transformers + PEFT para cargar el adaptador junto al modelo base. La carga del adaptador requiere fusionarlo con el modelo base o aplicar el wrapper de PEFT en tiempo de ejecucion, lo que anade una pequena sobrecarga de memoria.
- Latencia y throughput: no disponibles. No hay ninguna medicion publicada en el repositorio.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica y no se han verificado en esta ficha; los del adaptador son los unicos tomados del repositorio.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| `GRAI-UNSTPB/gemma3_27b_it_ft_cs_phrase_it` (adaptador LoRA) | 27B en el base; adaptador de 0,5 GB | No disponible (base: 128 000 tokens) | No disponible | No disponible | 0 descargas, 0 likes |
| `google/gemma-3-27b-it` (modelo base) | 27B | 128 000 tokens | Terminos de uso de Gemma | Resultados publicados por Google; no reproducidos aqui | Ampliamente distribuido |
| Qwen2.5-32B-Instruct | 32 500 millones aprox. | 32 768 tokens nativos, 131 072 con YaRN | Apache 2.0 | Resultados publicados por Alibaba; no reproducidos aqui | Ampliamente distribuido |
| Mistral Small 3.1 24B Instruct | 24 000 millones aprox. | 128 000 tokens | Apache 2.0 | Resultados publicados por Mistral; no reproducidos aqui | Ampliamente distribuido |

## Limitaciones y advertencias

- Documentacion inexistente: la model card es la plantilla por defecto de HuggingFace, con todos los campos marcados como `[More Information Needed]`. No se puede saber que datos se usaron, con que hiperparametros ni con que objetivo.
- Sin validacion publica: 0 descargas y 0 likes, sin resultados de evaluacion ni informes de terceros. No hay evidencia de que el ajuste funcione o de que sea mejor que el modelo base.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso de uso comercial. Ademas, el modelo base Gemma 3 esta sujeto a los Terminos de Uso de Gemma, que imponen obligaciones propias sobre cualquier trabajo derivado, incluidos los adaptadores LoRA.
- Riesgo de degradacion y olvido catastrofico: un ajuste SFT sobre un modelo instruct puede reducir capacidades generales (razonamiento, codigo, multilingue) si el dataset es estrecho, algo que aqui no puede descartarse ni confirmarse.
- Sesgos: no evaluados. El adaptador hereda los sesgos del modelo base y puede amplificarlos si los datos de ajuste son reducidos o poco diversos.
- Alucinacion: no medida. El riesgo es el propio de un modelo instruct de 27B y puede aumentar si el ajuste se hizo sobre un corpus muy especifico.
- Ambiguedad del identificador: `it` y `cs` admiten varias lecturas (italiano, checo, code-switching, "computer science"), y la model card no las resuelve.
- Fecha de publicacion futura: el repositorio figura como creado el 8 de octubre de 2026, dato cuando menos anomalo que conviene verificar.
- Uso en produccion: no recomendado sin una evaluacion propia sobre el dominio objetivo, control de versiones del modelo base y revision de la licencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/GRAI-UNSTPB/gemma3_27b_it_ft_cs_phrase_it
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Referencia citada en la plantilla de la model card (calculadora de impacto de carbono): https://mlco2.github.io/impact
- Articulo citado en la plantilla de la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Paper, blog, repositorio o demo especificos de este adaptador: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.
