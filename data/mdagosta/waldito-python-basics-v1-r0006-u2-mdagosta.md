# mdagosta/waldito-python-basics-v1-r0006-u2-mdagosta

# waldito-python-basics-v1-r0006-u2-mdagosta

## Resumen

Se trata de un modelo de generacion de texto de arquitectura Llama causal (decoder-only) publicado por el usuario mdagosta en HuggingFace bajo el identificador `mdagosta/waldito-python-basics-v1-r0006-u2-mdagosta`. Con 9.541.632 parametros reales declarados en los ficheros safetensors, es un modelo extremadamente pequeno (menos de 10 millones de parametros), muy alejado de los LLM de uso general y situado en la categoria de los modelos minimos usados para experimentacion, docencia o validacion de infraestructura. La model card lo presenta como un "export" del proyecto OpenWALDO.

El modelo usa la arquitectura estandar de Llama para lenguaje causal, pero con un detalle poco habitual: el tokenizador de OpenWALDO basado en bytes, identificado como "schema-1", que requiere cargarse con `trust_remote_code=True`. El repositorio incluye ademas dos ficheros de inventario, `BOM.json` (listado de todos los ficheros de la release) y `EU-BOM.json` (mapeo de divulgacion de contenido de entrenamiento segun el reglamento europeo de GPAI), lo que sugiere un enfoque de trazabilidad y cumplimiento normativo mas que de rendimiento.

Su relevancia actual es limitada como modelo de produccion: no tiene descargas ni "likes", no declara licencia ni idiomas, no publica benchmarks y la unica documentacion disponible es un README de tres lineas. Su interes es principalmente metodologico: ejemplifica como empaquetar un modelo minimo con tokenizador de bytes y artefactos de divulgacion regulatoria (BOM y EU-BOM), algo poco frecuente en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama causal language model (transformer decoder-only), segun la model card |
| Parametros totales | 9.541.632 (aprox. 9,5 M), dato real de los safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repo solo declara pesos safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tokenizador | OpenWALDO schema-1, basado en bytes; requiere `trust_remote_code=True` |
| Tamano del repositorio | 0,0 GB segun HuggingFace (incoherente con 9,5 M de parametros; ver limitaciones) |
| Libreria | transformers |
| Pipeline | text-generation |
| Etiquetas | transformers, safetensors, llama, text-generation, conversational, text-generation-inference, endpoints_compatible, region:us |
| Fecha de creacion | 2026-09-30 (segun metadatos de HuggingFace) |
| Fecha de ultima actualizacion | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica que el paquete utiliza la arquitectura estandar de modelo de lenguaje causal de Llama en la libreria Transformers, es decir, un transformer decoder-only con atencion causal. No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion, el tipo de normalizacion, la posicion de las activaciones ni si se emplean tecnicas como RoPE, GQA o decodificacion especulativa. Tampoco se indica si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT.

El elemento diferencial declarado es el tokenizador: OpenWALDO schema-1, un tokenizador basado en bytes en lugar del tokenizador BPE habitual de Llama. Este tipo de tokenizacion suele emplearse para evitar problemas de vocabulario fuera de dominio y para garantizar cobertura completa de cualquier secuencia de bytes, a costa de secuencias mas largas. El repositorio incorpora `BOM.json`, que inventaria todos los ficheros de la release, y `EU-BOM.json`, que contiene el mapeo de divulgacion del contenido de entrenamiento exigido por el reglamento europeo de IA para modelos GPAI. El contenido de ambos ficheros no esta disponible en la informacion proporcionada, por lo que no se puede verificar la composicion del dataset de entrenamiento, el numero de tokens utilizados ni su procedencia. El nombre del modelo ("python-basics") sugiere un ajuste sobre material introductorio de Python, pero esto no se confirma en la documentacion.

## Capacidades

- Generacion de texto autoregresiva: el pipeline declarado es `text-generation` y la etiqueta `conversational` indica que esta preparado para formatos de dialogo.
- Conversacion multi-turno: la etiqueta `conversational` sugiere soporte de plantillas de chat, aunque no se publica la plantilla concreta ni el formato de roles.
- Codigo: el identificador incluye "python-basics", lo que apunta a un posible ajuste sobre codigo Python elemental; no hay confirmacion documental ni ejemplos de salida.
- Tool calling / function calling: no disponible.
- Uso como agente o razonamiento multi-paso: no disponible; no hay evidencia de soporte de agentes ni de modos de razonamiento explicito.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" o razonamiento extendido: no disponible.
- Tokenizacion por bytes: capacidad estructural del tokenizador schema-1, que permite representar cualquier secuencia de bytes sin tokens de reemplazo.

## Casos de uso

- Docencia de arquitecturas transformer: con 9,5 M de parametros, el modelo se puede cargar, inspeccionar y reentrenar en minutos en una CPU o en una GPU de gama baja, lo que lo hace util para explicar el ciclo completo de un modelo de lenguaje causal en un aula o taller.
- Pruebas de humo (smoke tests) en pipelines de despliegue: sirve para verificar que una integracion con transformers, text-generation-inference o un endpoint compatible funciona de extremo a extremo antes de desplegar un modelo grande, gracias precisamente a su tamano reducido y a la etiqueta `endpoints_compatible`.
- Validacion de integraciones con tokenizadores personalizados: al requerir `trust_remote_code=True`, es un caso de prueba realista para comprobar que un entorno de ejecucion permite cargar codigo remoto y gestiona correctamente un tokenizador de bytes ajeno al ecosistema estandar.
- Investigacion sobre tokenizacion a nivel de byte: permite comparar el comportamiento de un tokenizador schema-1 frente a BPE en tareas controladas, midiendo longitud de secuencia, cobertura de vocabulario y calidad de generacion en corpus pequenos.
- Plantilla de cumplimiento normativo europeo: el par `BOM.json` / `EU-BOM.json` puede tomarse como referencia para disenar la documentacion de divulgacion de contenido de entrenamiento de modelos GPAI en proyectos internos, aunque su contenido no este publicado.
- Experimentos de ajuste fino (fine-tuning) de bajo coste: sirve como banco de pruebas para recetas de SFT, LoRA o cuantizacion, ya que un ciclo completo de entrenamiento cabe en recursos minimos y permite iterar rapido sobre hiperparametros.
- Inferencia en dispositivos embebidos o de recursos muy limitados: con pesos del orden de decenas de megabytes, es candidato teorico para ejecucion en Raspberry Pi o movil, siempre que el soporte del tokenizador de bytes y de la arquitectura Llama este disponible en la libreria de inferencia elegida.
- Demostraciones educativas de conversacion: el tag `conversational` permite montar un chatbot de juguete para ilustrar el funcionamiento de un bucle de dialogo, sin expectativa de calidad de respuesta utilizable en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion (MMLU, HumanEval, GSM8K, ARC, HellaSwag u otros), no se han encontrado resultados en la busqueda web y no existen cifras de latencia ni throughput declaradas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 38 MB en fp32 (9,54 M de parametros x 4 bytes), unos 19 MB en fp16/bf16 (x 2 bytes), unos 10 MB en int8 y unos 5 MB en int4. A esto hay que sumar el estado del tokenizador y las activaciones, por lo que el consumo total real es del orden de decenas a pocos cientos de megabytes, en funcion de la longitud de contexto y del tamano de lote.
- GPU recomendadas: cualquier GPU es suficiente. No se requiere A100, H100 ni siquiera una RTX 4090; el modelo cabe holgadamente en GPUs integradas, en una GTX 1050, en una RTX 3060 o en cualquier acelerador moderno.
- Compatibilidad con GPU de consumo: si, cabe en todas las GPU de consumo actuales e incluso en aceleradores de borde (Jetson, Coral o similares) si la libreria de inferencia lo soporta.
- Ejecucion en CPU: viable sin aceleracion; el modelo es lo bastante pequeno para ejecutarse en CPU de forma interactiva, aunque no hay mediciones publicadas de latencia.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (la etiqueta `text-generation-inference` esta presente) y endpoints compatibles con la API de HuggingFace. La conversion a GGUF para llama.cpp, Ollama o LM Studio no esta publicada y requeriria verificar antes la compatibilidad del tokenizador de bytes con esas herramientas.
- Latencia y throughput: no disponibles. No hay cifras publicadas por el autor ni mediciones de terceros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| waldito-python-basics-v1-r0006-u2-mdagosta | 9,54 M (dato real) | No disponible | No disponible | HuggingFace, 0 descargas |
| mdagosta/waldito-python-basics-v1-r0003-u1-mdagosta | No disponible | No disponible | No disponible | HuggingFace; variante anterior del mismo autor |
| Familia TinyStories (variantes de 1 M a 28 M) | Del orden de 1 M a 28 M (aproximado) | No confirmado | No confirmado | Modelos publicos de referencia en el rango de los millones de parametros |
| SmolLM-135M | 135 M | 2.048 tokens | Apache-2.0 | Modelo publico; representa el siguiente escalon de tamano |

Los datos de modelos de terceros se ofrecen como referencia de categoria y deben verificarse en sus fichas originales; no se dispone de una comparacion de rendimiento publicada entre este modelo y las alternativas, porque no existen benchmarks del modelo evaluado. La diferencia principal de este modelo frente a sus comparables es el tokenizador de bytes de OpenWALDO y la inclusion de artefactos de divulgacion regulatoria.

## Limitaciones y advertencias

- Tamano muy reducido: con 9,5 M de parametros, la capacidad de razonamiento, de conocimiento factual y de generacion de codigo es previsiblemente muy limitada. No es un modelo apto para tareas de produccion reales.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada, por lo que no se puede afirmar ni comparar su calidad.
- Riesgo elevado de alucinacion: en modelos de este tamano la generacion de contenido falso o incoherente es la norma, no la excepcion.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita de uso comercial. En ausencia de licencia, debe asumirse reserva de derechos por defecto hasta consultar al autor.
- Idiomas y contexto desconocidos: no se declara la cobertura linguistica ni la longitud de contexto soportada, lo que impide planificar su uso en aplicaciones multilingues o de contexto largo.
- `trust_remote_code=True`: la carga del tokenizador requiere ejecutar codigo incluido en el repositorio. Esto implica un riesgo de seguridad y de reproducibilidad que debe evaluarse antes de usarlo en cualquier entorno, y es especialmente relevante en el contexto de la etiqueta `text-generation-inference`.
- Incoherencia en los metadatos: el tamano del repositorio se declara como 0,0 GB, lo que no concuerda con un modelo de 9,541 millones de parametros (que en fp32 ocuparia del orden de 38 MB). Conviene verificar el contenido real del repositorio antes de integrarlo.
- Fecha de creacion anomala: los metadatos indican 2026-09-30, una fecha posterior a la habitual en los repositorios publicos consultados. Debe confirmarse contra la pagina real del modelo.
- Sin validacion comunitaria: cero descargas y cero "likes" implican que no existe evidencia externa de funcionamiento, ni informes de errores, ni usuarios que hayan reproducido resultados.
- Formato de pesos unico: solo se declaran safetensors; no hay versiones GGUF, AWQ, GPTQ ni ONNX, lo que limita las opciones de despliegue en herramientas que no sean Transformers.
- Tokenizador no estandar: al ser un tokenizador de bytes, las herramientas de plantillas de chat, conteo de tokens y gestion de contexto pueden comportarse de forma distinta a lo esperado con tokenizadores BPE convencionales.
- Contenido de divulgacion no publicado: aunque existen `BOM.json` y `EU-BOM.json`, su contenido no esta disponible en la informacion consultada, por lo que no se puede auditar el origen de los datos de entrenamiento.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0006-u2-mdagosta
- Variante anterior del mismo autor: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0003-u1-mdagosta
- Documentacion de text-generation-inference (etiqueta declarada por el modelo): no disponible en los resultados de busqueda
- Paper o blog tecnico del proyecto OpenWALDO: no disponible
- Repositorio de codigo o demo: no disponible
