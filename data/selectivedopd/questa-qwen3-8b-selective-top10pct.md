# SelectiveDOPD/QuestA-Qwen3-8b-Selective-Top10pct

## Resumen

QuestA-Qwen3-8b-Selective-Top10pct es un ajuste fino publicado por el usuario SelectiveDOPD en HuggingFace, etiquetado con las tags `qwen3`, `text-generation`, `conversational` y `safetensors`. El nombre del repositorio y las etiquetas apuntan a que se trata de una derivacion de Qwen3-8B, aunque la model card no confirma explicitamente cual es el modelo base ni detalla el procedimiento de entrenamiento. El repositorio contiene 8.190.735.360 parametros reales segun los ficheros safetensors, lo que encaja con la clase de 8B.

La model card es extremadamente escueta: unicamente indica que el modelo se ha subido desde el experimento interno `questa_qwen3_8b_JSD_rel_90_100`, dentro de los experimentos denominados BiDirect-OPD, y que la rama `main` corresponde al checkpoint `global_step_300`. Se listan ademas 14 ramas adicionales con checkpoints intermedios (`global_step_20` hasta `global_step_280`, en incrementos de 20), lo que sugiere un proceso de entrenamiento largo con evaluacion periodica de puntos de control.

Por el momento el modelo acumula 0 descargas y 0 likes, no declara licencia, no declara idiomas soportados y no incluye resultados de evaluacion. Se trata, por tanto, de un artefacto de investigacion sin documentacion publica suficiente para validar su calidad, sus capacidades reales o sus condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las tags `qwen3` sugieren arquitectura transformer densa heredada de Qwen3-8B; no confirmado en la model card) |
| Parametros totales | 8.190.735.360 (segun ficheros safetensors) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible (la model card no la especifica) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors en precision completa; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura concreta de este ajuste. La tag `qwen3` y la nomenclatura del repositorio (`questa_qwen3_8b`) apuntan a que parte de Qwen3-8B, un transformer denso de la familia Qwen3, pero la model card no lo confirma ni aporta detalles sobre la configuracion de capas, atencion o tokenizador. Tampoco se especifica la ventana de contexto efectiva del ajuste.

En cuanto al entrenamiento, la unica informacion disponible es la referencia interna al experimento `questa_qwen3_8b_JSD_rel_90_100` dentro de los experimentos "BiDirect-OPD", y la existencia de checkpoints cada 20 pasos hasta `global_step_300`. Los identificadores sugieren el uso de divergencia Jensen-Shannon (JSD) como señal de entrenamiento y algun tipo de seleccion del 10 % superior de ejemplos o tokens, pero se trata de una inferencia a partir del nombre y no de un dato documentado. No se indica el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y la tag `conversational` indica que el modelo esta preparado para dialogos multi-turno.
- Compatibilidad con Text Generation Inference: la tag `text-generation-inference` y `endpoints_compatible` sugieren que puede desplegarse mediante TGI y en Inference Endpoints de HuggingFace.
- Capacidades de tool calling, agentes, razonamiento multi-paso, matematicas o codigo: no disponibles. No hay documentacion que las confirme ni las descarte; si el modelo base es Qwen3-8B, es probable que herede parte de estas capacidades, pero no se ha verificado en este ajuste.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Soporte multilingue: no disponible; no se declara ninguna lengua.

## Casos de uso

Dado que no existe documentacion funcional ni evaluaciones publicadas, los siguientes casos son planteamientos genericos condicionados a que el modelo se comporte como un ajuste funcional de Qwen3-8B. Deben validarse con pruebas propias antes de llevarlos a produccion.

- Generacion de texto conversacional: uso como modelo de chat en aplicaciones de asistencia, aprovechando la tag `conversational` y el pipeline `text-generation` declarados.
- Despliegue en infraestructura TGI: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, puede servirse mediante TGI o Inference Endpoints si se confirma la compatibilidad real con esos motores.
- Experimentacion academica en destilacion y alineacion: el nombre del experimento (`BiDirect-OPD`, `JSD_rel_90_100`) lo hace util como artefacto de referencia para investigar tecnicas de seleccion de datos o de destilacion on-policy, comparando los distintos checkpoints publicados.
- Analisis de trayectorias de entrenamiento: la disponibilidad de 15 ramas de checkpoint permite estudiar la evolucion de las salidas del modelo a lo largo de `global_step_20` a `global_step_300`.
- Prototipado interno de asistentes de texto: para equipos que necesiten un modelo de 8B autoalojado y esten dispuestos a evaluarlo por su cuenta.
- Fine-tuning posterior sobre dominio especifico: al ser un modelo de ~8.2B en safetensors y licencia no declarada, puede servir como punto de partida para ajustes adicionales, siempre que se aclare antes la situacion legal.
- Generacion de codigo o razonamiento: no recomendable sin evaluacion previa, ya que no hay evidencia publicada de estas capacidades en este ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes estimaciones se derivan del recuento de parametros (8.190.735.360) y no de mediciones publicadas por el autor.

- VRAM para inferencia en FP16/BF16: aproximadamente 16,4 GB solo para pesos, mas overhead de cache KV y activaciones; en la practica requiere del orden de 18-22 GB.
- VRAM para inferencia en FP32: aproximadamente 32,8 GB solo para pesos. Conviene revisar en que precision estan los safetensors del repositorio, dado que el tamano total del repo es de 49,2 GB.
- Cuantizacion INT8: aproximadamente 8,2 GB de pesos.
- Cuantizacion de 4 bits (si se generan pesos GGUF/AWQ propios): aproximadamente 4,5-5 GB de pesos.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 sin cuantizar; RTX 4090 (24 GB) o RTX A6000 (48 GB) para FP16 con margen.
- GPU de consumo: un modelo de 8B en FP16 no cabe con holgura en GPUs de 8-12 GB; si cabe en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB solo mediante cuantizacion a 4 bits.
- Opciones de despliegue: al no publicarse pesos GGUF, llama.cpp u Ollama requeririan conversion propia. vLLM y TGI son las opciones mas directas si la arquitectura es compatible con Qwen3.
- Latencia y throughput: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparacion se limita a caracteristicas estructurales. Las cifras de los modelos de referencia proceden de su documentacion publica y no de este repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QuestA-Qwen3-8b-Selective-Top10pct | 8,19B | no disponible | no disponible | HuggingFace, 15 ramas de checkpoint, 0 descargas |
| Qwen3-8B (referencia, no confirmado como base) | 8,2B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | HuggingFace, ampliamente distribuido |
| Llama 3.1 8B (referencia de categoria) | 8,03B | 128.000 tokens | Llama 3.1 Community License | HuggingFace, ampliamente distribuido |
| Mistral 7B v0.3 (referencia de categoria) | 7,25B | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente distribuido |

No es posible comparar rendimiento, ya que no hay benchmarks publicados para el modelo evaluado.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe el dataset, el procedimiento de entrenamiento, la tokenizacion ni las capacidades esperadas.
- Licencia no declarada: no se puede asumir uso comercial permitido. Es un riesgo legal relevante si el modelo deriva de Qwen3, cuya licencia Apache 2.0 deberia conservarse y hacerse explicita.
- Sin evaluaciones publicadas: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica que permita estimar la calidad del ajuste.
- Riesgo de degradacion por sobreajuste: los identificadores del experimento (`Selective-Top10pct`, `JSD_rel_90_100`) apuntan a un entrenamiento selectivo sobre un subconjunto de datos, lo que puede reducir la generalidad respecto al modelo base.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; no hay informacion especifica que lo cuantifique en este caso.
- Idiomas no declarados: se desconoce si mantiene el soporte multilingue del posible modelo base o si se ha especializado en una sola lengua.
- Contexto no declarado: se desconoce la ventana efectiva; no se debe asumir la del modelo base sin verificacion.
- Fecha de creacion inusual: el repositorio figura como creado el 2026-09-12, lo que puede indicar un error de metadatos o un entorno de publicacion no estandar.
- Repositorio sin traccion: 0 descargas y 0 likes, por lo que no existe comunidad que haya validado su comportamiento.
- Tamano del repositorio elevado: 49,2 GB para 8,19B parametros sugiere pesos en precision alta o duplicacion de artefactos entre ramas; conviene revisar el consumo de disco antes de descargarlo completo.
- Aviso sobre los resultados de busqueda web: las consultas realizadas no han devuelto ninguna fuente relacionada con este modelo; los resultados obtenidos trataban sobre el simbolo de la tilde, rutas de Google Maps y la arquitectura del Taj Mahal, por lo que no aportan informacion util.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/QuestA-Qwen3-8b-Selective-Top10pct
- Paper, blog o repositorio del autor: no disponible
- Documentacion del modelo base Qwen3 (referencia, no confirmado como origen): no disponible en la informacion proporcionada
- Resultados de busqueda web relevantes: ninguno
