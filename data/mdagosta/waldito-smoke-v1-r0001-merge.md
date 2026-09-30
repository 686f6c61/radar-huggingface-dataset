# mdagosta/waldito-smoke-v1-r0001-merge

## Resumen

`mdagosta/waldito-smoke-v1-r0001-merge` es un modelo de generacion de texto publicado en HuggingFace por el usuario mdagosta, con arquitectura causal de tipo Llama segun la libreria Transformers. Los metadatos de safetensors indican 820,736 parametros totales (la unidad no se explicita en el repositorio; por orden de magnitud corresponde a aproximadamente 820,7 millones). La model card lo presenta como "OpenWALDO model export" y especifica que emplea el tokenizer de bytes schema-1 de OpenWALDO, que requiere cargarse con `trust_remote_code=True`.

El nombre del repositorio sugiere que se trata de un artefacto de prueba ("smoke") y de una fusion de pesos ("merge"), en su revision r0001. No se publican datos sobre el dataset de entrenamiento, el numero de tokens, las tecnicas de alineamiento ni la longitud de contexto soportada. El repositorio incluye dos ficheros de inventario (`BOM.json` y `EU-BOM.json`) que, segun el autor, documentan los ficheros de la release y el mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de IA (GPAI).

Su relevancia actual es limitada y de caracter practico: sirve como pieza de validacion de la cadena de herramientas de OpenWALDO (exportacion, tokenizer de bytes, inventariado BOM) y como modelo pequeno para pruebas de integracion en pipelines de transformers y text-generation-inference. No cuenta con benchmarks publicados, con licencia declarada ni con validacion de la comunidad (122 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (segun la model card) |
| Parametros totales | 820,736 (dato de safetensors; unidad no explicitada, compatible con ~820,7 millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tokenizer | OpenWALDO schema-1 byte tokenizer (requiere `trust_remote_code=True`) |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 0,0 GB segun HuggingFace |
| Ficheros de inventario | BOM.json, EU-BOM.json |

## Arquitectura y entrenamiento

La model card es explicita en un unico punto tecnico: el paquete usa la arquitectura estandar de modelo de lenguaje causal Llama de Transformers, junto con el tokenizer de bytes schema-1 de OpenWALDO. Se trata, por tanto, de un transformer denso con atencion causal, sin indicios de mezcla de expertos ni de arquitecturas hibridas tipo SSM. No se especifica el numero de capas, la dimension oculta, el numero de cabezas de atencion, si se usan embeddings atados ni si se aplica RoPE o alguna variante de atencion con ventana deslizante.

Un tokenizer de bytes implica que cada token corresponde aproximadamente a un byte de texto, lo que reduce el vocabulario efectivo y evita tokens fuera de vocabulario (OOV), pero incrementa de forma notable el numero de tokens necesario para representar el mismo texto en comparacion con tokenizers BPE. En consecuencia, la longitud de contexto efectiva en caracteres puede ser bastante menor que la expresada en tokens, aunque este dato no se publica.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones como decodificacion especulativa o atencion lineal. Los ficheros `BOM.json` y `EU-BOM.json` podrian contener parte de esta informacion, pero su contenido no se ha facilitado en la documentacion disponible.

## Capacidades

- Generacion de texto causal y conversacional, segun los tags `text-generation` y `conversational`.
- Compatibilidad declarada con text-generation-inference (`text-generation-inference`) y con endpoints (`endpoints_compatible`), lo que sugiere uso previsto en servir el modelo mediante API.
- Carga mediante la libreria Transformers con `pipeline_tag: text-generation`.
- Capacidad de tool calling / function calling: no disponible.
- Capacidad de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Exportacion con inventario de materiales y divulgacion de contenido de entrenamiento (BOM y EU-BOM), orientada a trazabilidad y cumplimiento normativo.

## Casos de uso

- Pruebas de humo de pipelines de despliegue: por su nombre y tamano, el modelo encaja como artefacto de validacion extremo a extremo en un pipeline de exportacion, carga y generacion antes de promocionar un modelo mayor. Permite verificar que el tokenizer de bytes schema-1, el inventariado BOM y el servidor de inferencia funcionan de forma conjunta.
- Validacion de integracion con text-generation-inference: los tags indican compatibilidad con TGI y con endpoints; puede usarse para comprobar que un endpoint de generacion responde correctamente con entradas y salidas de bytes antes de desplegar modelos en produccion.
- Base para fine-tuning de bajo coste: con aproximadamente 820,7 millones de parametros, es viable ajustarlo con LoRA o QLoRA en una unica GPU de gama consumer para tareas concretas de clasificacion, resumen o generacion de texto acotada, partiendo de un punto de partida ligero.
- Prototipado local de asistentes conversacionales: su tamano reducido permite iterar rapidamente en local y validar la logica de dialogo multi-turno, las plantillas de prompt y el manejo de contexto antes de migrar a un modelo mayor.
- Generacion de texto en entornos con recursos restringidos: puede ejecutarse en CPU o en GPUs de gama baja para tareas de generacion de borradores, reescritura o autocompletado donde la latencia y el coste importan mas que la calidad maxima.
- Docencia y formacion en IA: sirve como ejemplo didactico de exportacion de un transformer causal a safetensors, de tokenizer alternativo no BPE y de generacion de inventarios BOM para cumplimiento normativo.
- Experimentacion con tokenizers de bytes: util para investigar el comportamiento de modelos con tokenizado a nivel de byte en tareas de robustez ante ruido, texto malformado o dominios con ortografia irregular.
- Verificacion de trazabilidad y cumplimiento GPAI: los ficheros `BOM.json` y `EU-BOM.json` permiten estudiar como se documenta el contenido de entrenamiento segun el mapeo de divulgacion europeo, un area de creciente interes regulatorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y la busqueda web no ha devuelto resultados asociados a este modelo.

## Requisitos de hardware

Estimaciones derivadas unicamente del recuento de parametros; el autor no publica requisitos oficiales.

- VRAM estimada para inferencia (pesos, sin cache KV): aproximadamente 3,3 GB en FP32, 1,6 GB en FP16/BF16, 0,8 GB en cuantizacion de 8 bits y 0,5 GB en cuantizacion de 4 bits.
- Cache KV: dependera de la longitud de contexto y de la configuracion de capas, datos no publicados. A titulo orientativo, la cache crece de forma lineal con el contexto y con el numero de capas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en cuantizacion de 4 u 8 bits (RTX 3050, RTX 3060, GTX 1660 con 6 GB, RTX 4090, A100, H100). En FP16 basta con 6-8 GB de VRAM.
- Cabe en GPU de consumo: si, con holgura, en cualquier tarjeta moderna con 6 GB o mas de VRAM, e incluso en CPU con memoria del sistema suficiente.
- Opciones de despliegue: Transformers (libreria declarada), text-generation-inference (tag explicito), endpoints compatibles. Para llama.cpp, Ollama o LM Studio seria necesario convertir los pesos a GGUF, conversion no publicada por el autor. vLLM y TGI requeririan ademas resolver la dependencia del tokenizer con `trust_remote_code=True`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de benchmarks ni de especificaciones completas del modelo evaluado, por lo que la comparacion de rendimiento no puede establecerse. La tabla siguiente recoge unicamente datos publicos de referencia de modelos densos de tamano comparable; las cifras de los alternativas provienen de sus propias model cards y no de una evaluacion conjunta.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| waldito-smoke-v1-r0001-merge | 820,736 (unidad no explicitada) | no disponible | no disponible | safetensors | no disponible |
| Llama 3.2 1B | ~1,24 mil millones | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF | publicado por Meta, no comparable directamente |
| Qwen2.5 1.5B | ~1,54 mil millones | 32 768 tokens | Apache-2.0 | safetensors, GGUF | publicado por Alibaba, no comparable directamente |
| Qwen2.5 0.5B | ~0,49 mil millones | 32 768 tokens | Apache-2.0 | safetensors, GGUF | publicado por Alibaba, no comparable directamente |

Diferencias clave mas alla del rendimiento: los modelos alternativos cuentan con licencia explicita y con versiones cuantizadas en GGUF listas para usar, mientras que este repositorio no declara licencia ni publica cuantizaciones, lo que complica su adopcion en produccion.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita, no queda claro el regimen de uso comercial, modificacion ni redistribucion. Es un bloqueante para cualquier despliegue productivo.
- Tokenizer con ejecucion de codigo remoto: la model card exige `trust_remote_code=True` para cargar el tokenizer de bytes schema-1. Esto implica ejecutar codigo Python arbitrario del repositorio durante la carga del modelo, un riesgo de seguridad relevante en entornos no controlados.
- Ausencia total de benchmarks: no hay evidencia publica de calidad, lo que impide estimar el rendimiento esperado en tareas reales.
- Sin especificacion de idiomas: no se puede confirmar el soporte de castellano ni de ningun otro idioma.
- Contexto desconocido: al no publicarse la longitud de contexto y al emplear un tokenizer de bytes, la ventana efectiva en caracteres puede ser considerablemente menor que la nominal en tokens.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje generativo sin datos de evaluacion que lo cuantifiquen. No hay informacion sobre sesgos, filtros de seguridad ni alineamiento.
- Artefacto de tipo smoke test: el nombre y la ausencia de documentacion sugieren que no es un modelo destinado a produccion, sino a validacion de infraestructura.
- Sin validacion de la comunidad: 122 descargas y 0 likes indican que el modelo no ha sido ampliamente probado ni auditado por terceros.
- Inventarios BOM no verificados: aunque se anuncian `BOM.json` y `EU-BOM.json` para trazabilidad y divulgacion GPAI, no se ha podido comprobar su contenido ni su exhaustividad.
- Tamano del repositorio reportado como 0,0 GB: cifra inconsistente con un modelo de cientos de millones de parametros, lo que sugiere un problema de metadatos o un peso cuantizado de forma agresiva; conviene verificar los ficheros antes de descargar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-smoke-v1-r0001-merge
- Perfil del autor, mdagosta (Michael D'Agosta): https://huggingface.co/mdagosta
- Variante posterior citada en la actividad del autor: https://huggingface.co/mdagosta/waldito-smoke-v1-r0002-merge
- Repositorio de HuggingFace: https://huggingface.co/
- Paper, blog o demo del modelo: no disponible
- Repositorio de codigo asociado: no disponible
