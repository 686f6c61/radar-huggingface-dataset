# muhasin-code/paperlens-qwen2.5-3b-extraction

## Resumen

`muhasin-code/paperlens-qwen2.5-3b-extraction` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. No se trata, por tanto, de un modelo completo con pesos propios, sino de un conjunto de pesos de adaptador que deben cargarse junto al modelo base para funcionar. El autor lo publica bajo el nombre interno `paperlens-extraction-adapter`, lo que sugiere un ajuste orientado a tareas de extraccion de informacion, aunque la model card no documenta el dataset de entrenamiento ni el objetivo concreto.

El modelo base es un transformer decoder-only de Qwen2.5 en su variante de 3.000 millones de parametros, con atencion de consultas agrupadas (GQA) y una ventana de contexto nativa de 32.768 tokens (ampliable a 128K mediante YaRN en la familia Qwen2.5). El adaptador hereda esas caracteristicas arquitectonicas y de contexto, ya que LoRA no modifica la topologia del modelo, solo anade matrices de bajo rango en determinadas capas.

La relevancia de esta publicacion es limitada pero concreta: los adaptadores pequenos permiten especializar un modelo de 3B para una tarea de extraccion estructurada con un coste de entrenamiento y de inferencia muy bajo, desplegable en GPU de consumo. Ahora bien, el repositorio presenta cero descargas y cero likes, no declara licencia, no especifica idiomas y no incluye informacion sobre datos, hiperparametros ni evaluacion, por lo que debe tratarse como un experimento sin validacion publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5 |
| Parametros totales | No disponible para el adaptador (modelo base: 3.000 millones aprox.) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (heredada del base: 32.768 tokens nativos) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion se aplica al modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card contiene el marcador de posicion `licence: license`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Biblioteca de carga | peft |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | text-generation |
| Framework de entrenamiento | TRL 1.14.0, PEFT 0.19.1, Transformers 5.0.0, PyTorch 2.10.0+cu128 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se ha entrenado con SFT (supervised fine-tuning) usando TRL, sobre el modelo `Qwen/Qwen2.5-3B-Instruct`. Al emplear PEFT con LoRA, el entrenamiento congela los pesos del modelo base y optimiza unicamente matrices de bajo rango insertadas en las capas seleccionadas; el repositorio ocupa 0,1 GB, coherente con un adaptador de rango bajo sobre un modelo de 3B. La model card no indica rango, alpha, capas objetivo, tasa de aprendizaje, numero de pasos, tamano del dataset ni composicion de los datos de entrenamiento.

Tampoco se documenta si hubo fases posteriores de RLHF, DPO u optimizacion por preferencias, ni ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion). La unica informacion verificable sobre el procedimiento es la lista de versiones de framework y la afirmacion de que se uso SFT. Cualquier otra caracteristica del entrenamiento debe considerarse no disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno: heredadas del modelo base, que esta alineado como asistente instructivo.
- Razonamiento y matematicas basicas: capacidad del base Qwen2.5-3B-Instruct, no verificada especificamente tras el ajuste.
- Generacion y explicacion de codigo: capacidad del modelo base; no hay evidencia en el repositorio de que el ajuste la preserve o degrade.
- Extraccion de informacion estructurada: el nombre del adaptador (`paperlens-extraction-adapter`) sugiere especializacion en extraccion de datos, probablemente a partir de documentos o articulos, pero la model card no lo confirma ni describe el esquema de salida.
- Soporte de tool calling / function calling: no disponible (el base Qwen2.5-Instruct lo soporta, pero no se documenta si el adaptador lo mantiene).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el base es exclusivamente de texto.
- Instrucciones de uso: la model card incluye un ejemplo de `pipeline` incompleto, con `model="None"`, que no es ejecutable tal cual.

## Casos de uso

- Extraccion de metadatos de articulos cientificos: si el ajuste cumple lo que sugiere su nombre, el modelo podria convertir texto de secciones (abstract, metodologia) en campos estructurados como titulo, autores, ano, DOI o palabras clave, tarea para la que un modelo de 3B ajustado suele ser suficiente y mucho mas barato que un modelo grande.
- Procesamiento por lotes de repositorios documentales: con 32.768 tokens de contexto heredados del base, un unico adaptador puede procesar documentos de decenas de paginas en cada pasada, integrado en un pipeline de ingesta nocturna.
- Preprocesado para RAG: extraer entidades y relaciones antes de generar embeddings mejora la precision del recuperador; el modelo puede actuar como extractor de campos que enriquezcan los metadatos del indice vectorial.
- Normalizacion de formularios y facturas: convertir texto libre en JSON con campos fijos (fechas, importes, identificadores) para su volcado en bases de datos relacionales.
- Anotacion asistida para equipos de investigacion: generar extracciones preliminares que despues un humano revisa, reduciendo el coste de construir datasets etiquetados.
- Clasificacion y enrutado de documentos: determinar el tipo de documento entrante (paper, informe, contrato) y derivarlo al flujo correspondiente dentro de un sistema de gestion documental.
- Despliegue en entornos con recursos limitados: al requerir un modelo base de 3B, es viable ejecutarlo en una unica GPU de consumo o incluso en CPU cuantizado, lo que permite procesar documentos sensibles sin salir de la infraestructura propia.

Nota: dado que la model card no documenta las capacidades reales del adaptador, estos casos son propuestas de aplicacion basadas en el nombre del modelo, sus etiquetas y las prestaciones del modelo base, no en resultados verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna tarea de extraccion (por ejemplo, F1 de campos, precision de esquema o exactitud de JSON). Tampoco se aportan comparaciones frente al modelo base, por lo que no es posible determinar si el ajuste mejora, mantiene o degrada el rendimiento original.

## Requisitos de hardware

- Peso del adaptador: aproximadamente 0,1 GB en safetensors (tamano del repositorio).
- Peso del modelo base en fp16/bf16: en torno a 6,2 GB, lo que implica unos 8 GB de VRAM con cache KV para contextos moderados.
- Cuantizacion de 8 bits: aproximadamente 3-4 GB de VRAM; cuantizacion de 4 bits: aproximadamente 2-3 GB.
- GPU de consumo: cabe en una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 (24 GB) en fp16 sin problemas; en 4 bits cabe incluso en GPUs de 8 GB.
- GPU de datacenter: A100 40/80 GB, H100, L40S; utiles si se sirven muchas peticiones concurrentes con vLLM o TGI.
- CPU: viable con llama.cpp tras fusionar el adaptador y convertir a GGUF en formato Q4_K_M o similar, con latencias de segundos por respuesta.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (soporta adaptadores LoRA), TGI, llama.cpp/Ollama (requiere fusionar previamente con `merge_and_unload` y convertir a GGUF).
- Latencia y throughput: no disponibles; no se aportan medidas en la informacion proporcionada.
- Nota practica: el ejemplo de la model card usa `model="None"` y no incluye la referencia al adaptador; para cargarlo hay que instanciar el modelo base e invocar `PeftModel.from_pretrained` o pasar el identificador del repositorio junto con el del base.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| paperlens-qwen2.5-3b-extraction | Adaptador LoRA sobre Qwen2.5-3B | Adaptador (base de 3.000 M aprox.) | No disponible (base: 32.768) | No disponible | No disponible |
| Qwen/Qwen2.5-3B-Instruct | Modelo completo | 3.000 M aprox. | 32.768 tokens (ampliable con YaRN) | Apache-2.0 | No disponible en la informacion proporcionada |
| meta-llama/Llama-3.2-3B-Instruct | Modelo completo | 3.200 M aprox. | 128.000 tokens | Llama 3.2 Community License | No disponible en la informacion proporcionada |
| microsoft/Phi-3.5-mini-instruct | Modelo completo | 3.800 M aprox. | 128.000 tokens | MIT | No disponible en la informacion proporcionada |

La comparativa es estructural (tamano, contexto y licencia). No se dispone de datos de rendimiento de ninguno de los modelos dentro de la informacion aportada, y el adaptador no ofrece garantia alguna de superar al modelo base en ninguna tarea concreta.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican datos de entrenamiento, hiperparametros, tarea objetivo, esquema de salida ni criterios de evaluacion.
- Licencia indefinida: la model card contiene el marcador `licence: license`, sin texto legal real. No hay autorizacion explicita de uso comercial y el uso en produccion es juridicamente arriesgado hasta que el autor lo aclare.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingueismo del base o si se ha especializado en un unico idioma.
- Riesgo de alucinacion: al ser un ajuste SFT sobre un modelo de 3B orientado a extraccion, existe riesgo de generar campos inventados o valores plausibles que no aparecen en el documento fuente. Es imprescindible validar las salidas contra el texto original.
- Degradacion de capacidades generales: un ajuste SFT estrecho puede reducir el rendimiento en tareas conversacionales o de codigo respecto al modelo base; no hay evaluacion que lo descarte.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta; no hay terceros que hayan reproducido resultados ni reportado fallos.
- Sin cuantizaciones publicadas: el repositorio solo contiene el adaptador en safetensors; cualquier GGUF debe generarse localmente tras fusionar los pesos.
- Instrucciones de uso defectuosas: el fragmento de codigo de la model card no es ejecutable, lo que aumenta la probabilidad de errores de integracion por parte de quien lo copie literalmente.
- Fechas de metadatos anomalas: el repositorio figura creado y actualizado el 2026-09-27, lo que conviene verificar antes de citarlo.
- Caveat de produccion: al depender de un modelo base externo, cualquier cambio o retirada de `Qwen/Qwen2.5-3B-Instruct` afecta directamente a la reproducibilidad del despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/muhasin-code/paperlens-qwen2.5-3b-extraction
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio PEFT: https://github.com/huggingface/peft
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Documentacion de Transformers: https://huggingface.co/docs/transformers/index
- Documentacion de vLLM (soporte de adaptadores LoRA): https://docs.vllm.ai
