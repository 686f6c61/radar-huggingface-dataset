# cyankiwi/granite-4.2-30b-AWQ-INT4

## Resumen

El modelo `cyankiwi/granite-4.2-30b-AWQ-INT4` es una cuantización W4A16 (pesos de 4 bits, activaciones en bfloat16) del modelo denso de razonamiento Granite-4.2-30B, desarrollado por IBM. El checkpoint original, publicado el 25 de agosto de 2026, es un decoder-only transformer denso con 30 mil millones de parámetros, diseñado para razonamiento explícito (cadena de pensamiento integrada), generación de código, tool calling y flujos agénticos. Esta versión cuantizada, creada por el usuario cyankiwi, utiliza el método OmniQuant con calibración sobre 384 conversaciones del dataset propio `cyankiwi/calibration`, y reduce el tamaño del checkpoint a 18,1 GB, lo que facilita su despliegue en hardware con VRAM limitada.

La relevancia de esta cuantización radica en que mantiene la funcionalidad completa del modelo original (incluido el parser de razonamiento y el soporte de tool calling) mientras reduce los requisitos de memoria. Está publicada bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. El contexto nativo de 128K tokens (extensible a 512K) y el soporte multilingüe (12 idiomas probados) lo convierten en una opción atractiva para aplicaciones de producción que requieren ventanas de contexto largas y razonamiento estructurado.

El checkpoint se distribuye en formato `compressed-tensors` con empaquetado `pack-quantized`, compatible con vLLM de forma nativa y con Transformers mediante la librería `compressed-tensors` para descomprimir los pesos al cargar. No se han publicado resultados de benchmarks específicos para esta versión cuantizada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (GraniteForCausalLM) |
| Parametros totales | 30B (modelo base); el checkpoint cuantizado contiene 5.379.724.160 elementos (pesos comprimidos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K nativo, extensible a 512K |
| Tipos de cuantizacion | W4A16 (4 bits por peso, grupo de 32, asimétrica con zero points; activaciones en bfloat16) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas probados) |
| Licencia | Apache 2.0 |
| Formato de pesos | compressed-tensors, pack-quantized (weight_packed, weight_scale, weight_zero_point, weight_shape); safetensors (5 shards) |

## Arquitectura y entrenamiento

El modelo base Granite-4.2-30B es un transformer denso decoder-only con arquitectura GraniteForCausalLM, basado en Granite-4.1-30B-Base. Incorpora un modo de razonamiento integrado que genera una cadena de pensamiento delimitada por etiquetas ` thinking` y ` response`, lo que permite al modelo razonar antes de responder. El entrenamiento del modelo base incluye fases de ajuste fino supervisado y alineación, aunque los detalles específicos del dataset no se detallan en la información proporcionada.

La cuantización de este checkpoint se realizó con el método OmniQuant (arxiv:2308.13137), que combina una transformación equivalente aprendible (LET) aplicada sobre las proyecciones de atención y las capas feed-forward, junto con un recorte de pesos aprendible (LWC). El proceso se ejecutó bloque a bloque durante 5 épocas por bloque, comparando las salidas contra las del modelo en precisión completa, con escalas inicializadas mediante error cuadrático medio (MSE). La calibración utilizó 384 conversaciones del dataset `cyankiwi/calibration`, renderizadas con el chat template del modelo y truncadas a 2048 tokens, en una ejecución paralela de 2 nodos. Los módulos cuantizados incluyen todos los `Linear` de los bloques decoder (`q/k/v/o_proj`, `gate/up/down_proj`), mientras que `embed_tokens`, `lm_head` y todas las capas de normalización se mantienen en bfloat16.

## Capacidades

- Generacion de texto y dialogo conversacional multilingue en 12 idiomas (ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino).
- Razonamiento explicito mediante cadena de pensamiento integrada: el modelo genera un bloque ` thinking...` antes de la respuesta final, lo que mejora la precision en tareas de logica, matematicas y analisis.
- Generacion de codigo en multiples lenguajes, con soporte para tool calling y function calling mediante el formato de parser `qwen3_coder`.
- Capacidades agénticas: soporta flujos de trabajo multi-paso y encadenamiento de herramientas, habilitado por el parser de razonamiento `granite_thinking_parser` y el `--enable-auto-tool-choice` en vLLM.
- Ventana de contexto larga de 128K tokens nativa, ampliable a 512K mediante extension de contexto, adecuada para documentos extensos y conversaciones multi-turno.
- Despliegue flexible: compatible con vLLM (carga nativa de compressed-tensors) y con Transformers (descompresion automatica al cargar).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial largo gracias a su ventana de 128K tokens, manteniendo el contexto de interacciones previas y resolviendo consultas en varios idiomas con razonamiento estructurado.
- Asistente de programacion en entornos de desarrollo: con soporte para tool calling y generacion de codigo, puede integrarse en IDEs o pipelines de CI/CD para autocompletar, revisar codigo o generar pruebas unitarias, aprovechando su capacidad de razonar sobre el contexto del proyecto.
- Procesamiento y analisis de documentos legales o tecnicos: la ventana de contexto amplia permite ingerir contratos, informes o articulos cientificos completos y extraer informacion relevante, resumir secciones o responder preguntas especificas con citas.
- Agentes autonomos para automatizacion de tareas: gracias a su soporte de razonamiento multi-paso y tool calling, puede actuar como agente que planifica y ejecuta acciones (consultas a APIs, busquedas web, manipulacion de archivos) de forma secuencial.
- Traduccion y localizacion de contenido: con 12 idiomas probados, puede traducir textos largos manteniendo coherencia contextual y adaptando el tono, especialmente util para documentacion tecnica o interfaces de usuario.
- Generacion de informes financieros o de negocio: el razonamiento estructurado permite interpretar datos numericos, elaborar analisis y redactar informes coherentes, combinando generacion de texto con logica de negocio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El checkpoint cuantizado no incluye una tabla de evaluaciones propia, y no se han encontrado datos comparativos en la busqueda web. Para una referencia del rendimiento del modelo base, se recomienda consultar la model card oficial de `ibm-granite/granite-4.2-30b` en HuggingFace.

## Requisitos de hardware

- El checkpoint cuantizado ocupa 18,1 GB en disco (5 shards safetensors). Para inferencia, la VRAM necesaria es al menos ese tamaño mas el overhead de las activaciones (bfloat16) y la cache KV.
- Con contexto corto (hasta 8K tokens), una GPU con 24 GB de VRAM (por ejemplo, RTX 4090 o RTX 3090) puede ser suficiente. Para contexto largo (128K tokens), la cache KV crece significativamente y se recomienda una GPU con 48 GB o mas (A6000, A100 80GB, H100).
- No se recomienda ejecutar en GPUs de gama media (8-12 GB) salvo que se use contexto muy reducido y se apliquen tecnicas adicionales de optimizacion (por ejemplo, flash attention, paged attention).
- Opciones de despliegue: vLLM (carga nativa de compressed-tensors, requiere el plugin `granite_thinking_parser` y el parser de tools `qwen3_coder`), Transformers con la libreria `compressed-tensors` instalada, o TGI si se convierte el formato. No se proporcionan ficheros GGUF oficiales en este repositorio.
- La latencia y el throughput dependen del hardware y de la configuracion. Con vLLM y una GPU H100, se pueden alcanzar decenas de tokens por segundo, pero no se han publicado mediciones concretas para este checkpoint.

## Comparativa con modelos similares

La comparativa se realiza a nivel de modelo base, ya que no hay datos de rendimiento del checkpoint cuantizado. Se comparan tres modelos densos de aproximadamente 30B parametros con licencia permisiva:

| Modelo | Parametros | Contexto | Modo razonamiento | Licencia |
|---|---|---|---|---|
| Granite-4.2-30B (este) | 30B denso | 128K (ext. 512K) | Si (cadena de pensamiento) | Apache 2.0 |
| Qwen3-30B-A3B | 30B total, 3B activos (MoE) | 128K | Si | Apache 2.0 |
| Llama-3.1-70B | 70B denso | 128K | No | Llama 3.1 Community License |

Granite-4.2-30B se diferencia de Qwen3-30B-A3B por ser denso (mayor uso de memoria pero menor latencia de activacion) y de Llama-3.1-70B por su menor tamano y su modo de razonamiento integrado. La licencia Apache 2.0 de Granite es mas permisiva que la de Llama. No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion W4A16 puede introducir una degradacion ligera en la calidad de las respuestas en comparacion con el modelo en bfloat16, especialmente en tareas numericas o de razonamiento complejo. No se han publicado metricas de perdida de calidad para esta cuantizacion.
- El modelo solo ha sido probado en 12 idiomas; otros idiomas pueden funcionar pero no estan garantizados.
- La ventana de contexto de 128K es nativa, pero la extension a 512K requiere configuracion adicional y puede aumentar el consumo de memoria.
- El modo de razonamiento genera tokens de pensamiento intermedios, lo que aumenta la latencia y el coste computacional por peticion. Es posible desactivarlo si no se necesita.
- El checkpoint requiere la libreria `compressed-tensors` para descomprimir los pesos al cargar con Transformers; sin ella, la carga fallara.
- No se han publicado evaluaciones de sesgos o alucinaciones especificas para este checkpoint. Como modelo de lenguaje, puede producir contenido factualmente incorrecto o sesgado, por lo que se recomienda validacion humana en aplicaciones criticas.
- El repositorio no incluye ficheros GGUF, por lo que su uso con llama.cpp u Ollama requiere una conversion previa del formato.

## Enlaces

- Repositorio del checkpoint cuantizado: https://huggingface.co/cyankiwi/granite-4.2-30b-AWQ-INT4
- Modelo base (IBM Granite 4.2-30B): https://huggingface.co/ibm-granite/granite-4.2-30b
- Coleccion Granite 4.2: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog tecnico de IBM sobre Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio de codigo de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Paper de OmniQuant (metodo de cuantizacion): https://arxiv.org/abs/2308.13137
- Dataset de calibracion: https://huggingface.co/datasets/cyankiwi/calibration
