# nnkhetan/qwen2.5-7b-10k-extract-lora

## Resumen

`nnkhetan/qwen2.5-7b-10k-extract-lora` es un adaptador LoRA (QLoRA) entrenado sobre el modelo base Qwen/Qwen2.5-7B-Instruct, publicado por el usuario nnkhetan en HuggingFace. Su proposito declarado es la extraccion estructurada de informacion a partir de formularios SEC 10-K, generando la salida en formato JSON. Se enmarca dentro de la categoria de modelos de extraccion de informacion financiera y se distribuye con licencia Apache 2.0, aunque el repositorio esta restringido (gated) y requiere aceptar condiciones para su descarga.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parametros, y anade un adaptador de bajo rango entrenado con QLoRA. Al ser un adaptador PEFT, no es un modelo autonomo: necesita cargarse junto al checkpoint del modelo base para funcionar. Su relevancia radica en el nicho concreto que cubre (extraccion de campos financieros en JSON a partir de documentos regulatorios largos) y en el uso de vLLM como motor de inferencia recomendado por sus etiquetas.

La informacion publica disponible es muy limitada: no se detallan el volumen de tokens de entrenamiento, la composicion del dataset, el rango del adaptador ni los hiperparametros de QLoRA. Tampoco se han publicado resultados de benchmarks. Esta ficha refleja, por tanto, lo que consta en la model card y en los metadatos del repositorio, marcando explicitamente como "no disponible" todo aquello que no se ha hecho publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa (heredada de Qwen2.5-7B-Instruct) + adaptador LoRA/QLoRA |
| Parametros totales | ~7.600 millones en el modelo base; el adaptador anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card del adaptador (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables hasta 131.072) |
| Tipos de cuantizacion | no disponible (el entrenamiento se realizo con QLoRA; el adaptador se distribuye en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion causal estandar, RoPE y las mejoras introducidas en la familia Qwen2.5 (normalizacion RMSNorm, activacion SwiGLU, sesgos de atencion en Q/K/V). El adaptador en si es un modulo PEFT de tipo LoRA entrenado mediante QLoRA, lo que implica que el modelo base se mantuvo congelado en cuantizacion de 4 bits durante el ajuste y unicamente se actualizaron las matrices de bajo rango insertadas en las capas. No se especifican el rango (r), el alpha, el dropout ni las capas objetivo del adaptador.

El entrenamiento esta orientado a una tarea de extraccion de informacion sobre formularios SEC 10-K, con salida en JSON. No se han publicado el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF/DPO posteriores ni detalles sobre el preprocesado de los documentos 10-K (segmentacion, longitud de las secuencias, estrategia de enmascarado de la perdida). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; el adaptador se apoya en las capacidades estandar del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Extraccion de informacion estructurada: transformacion de contenido de formularios SEC 10-K en objetos JSON con los campos definidos durante el entrenamiento.
- Procesamiento de documentos financieros regulatorios en ingles.
- Soporte de tool calling y function calling heredado del modelo base (no validado especificamente para el adaptador).
- Razonamiento multi-paso y uso como agente: capacidad heredada del modelo base, sin garantias especificas tras el ajuste LoRA.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio, aunque el modelo base soporta mas idiomas.
- Modo thinking, vision y audio: no disponibles.

## Casos de uso

- Extraccion automatizada de campos de formularios 10-K: el adaptador recibe el texto de un 10-K (o un fragmento) y devuelve un JSON con los campos financieros de interes, lo que permite poblar bases de datos sin intervencion manual.
- Enriquecimiento de pipelines de analisis financiero: integrado en un ETL que procesa lotes de 10-K y normaliza la salida JSON para su carga en un data warehouse o en un motor de busqueda.
- Generacion de datasets estructurados para investigacion: uso del adaptador para convertir grandes volumenes de 10-K en registros JSON etiquetados que alimenten modelos posteriores o estudios cuantitativos.
- Verificacion y control de calidad documental: comparacion de la salida JSON del adaptador con los datos declarados en el documento para detectar discrepancias o campos ausentes en informes regulatorios.
- Asistencia a analistas financieros: extraccion rapida de secciones y cifras clave de un 10-K para alimentar hojas de calculo o dashboards, reduciendo el tiempo de lectura manual.
- Prototipado de asistentes de cumplimiento normativo: el adaptador sirve como componente de extraccion dentro de un sistema mayor que valide la presencia de disclosures obligatorios en los formularios presentados.
- Despliegue en produccion con vLLM: al estar etiquetado para vLLM, puede servirse como endpoint de extraccion con batching continuo para volumenes medios de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia del modelo base Qwen2.5-7B-Instruct, en FP16 requiere aproximadamente 15-16 GB de VRAM; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. El adaptador anade una sobrecarga minima (del orden de decenas a centenares de MB).
- GPU recomendadas: no especificadas por el autor. Para el modelo base en FP16 se recomienda una A100 40 GB, H100 o L40S; para cuantizaciones de 8 y 4 bits bastan GPUs consumer como RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB).
- Cabe en GPU consumer: si, en funcion de la cuantizacion elegida (RTX 4090/3090 en 8 o 4 bits; RTX 4080 en 4 bits).
- Opciones de despliegue: vLLM (etiqueta explicita del repositorio), ademas de transformers + PEFT, llama.cpp/Ollama (previo merge del adaptador y conversion a GGUF) y TGI (previa fusion del adaptador con el modelo base).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nnkhetan/qwen2.5-7b-10k-extract-lora | ~7,6 B (base) + adaptador | no disponible (base: 32.768 nativos) | Adaptador LoRA sobre Qwen2.5-7B-Instruct | apache-2.0 | Gated en HuggingFace |
| Qwen/Qwen2.5-7B-Instruct | ~7,6 B | 32.768 nativos (hasta 131.072) | Modelo denso completo | apache-2.0 | Publico |
| Adaptadores de extraccion financiera sobre Llama 3.1 8B | ~8 B (base) | 128.000 | Adaptador LoRA | depende del autor | Variable |
| Modelos de extraccion de documentos especializados (p. ej. familias LayoutLM/Donut) | variable | variable | Especificos de documento | variable | Variable |

La comparativa cuantitativa con alternativas concretas no esta disponible: no se han publicado metricas del adaptador que permitan situarlo frente a otros modelos de extraccion financiera.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenar sobre formularios SEC 10-K en ingles, el adaptador puede heredar sesgos del corpus financiero estadounidense y del modelo base.
- Riesgo de alucinacion: presente, como en cualquier modelo generativo; en extraccion de campos financieros, una alucinacion puede traducirse en cifras incorrectas en la salida JSON, por lo que se recomienda validacion posterior.
- Limitaciones de contexto e idioma: el adaptador esta orientado al ingles y a documentos 10-K; no se garantiza su comportamiento en otros idiomas ni en otros tipos de formularios regulatorios.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el repositorio esta gated y requiere aceptar condiciones en HuggingFace; conviene revisar tambien la licencia del modelo base (Apache 2.0).
- Caveat de produccion: al ser un adaptador PEFT, el despliegue exige cargar el modelo base Qwen2.5-7B-Instruct; no es un checkpoint autonomo. La ausencia de benchmarks y de documentacion sobre el dataset de entrenamiento impide estimar su precision real en dominios distintos al de entrenamiento.
- Fecha de creacion del repositorio: 2026-11-05, con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/nnkhetan/qwen2.5-7b-10k-extract-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de QLoRA (paper): https://arxiv.org/abs/2305.14314
- vLLM: https://github.com/vllm-project/vllm
