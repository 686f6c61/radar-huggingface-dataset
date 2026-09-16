# hb-dev/Qwen3-1.7B-ONNX-GenAI

## Resumen

`hb-dev/Qwen3-1.7B-ONNX-GenAI` es una conversion al formato ONNX del modelo denso Qwen3-1.7B de Alibaba Qwen, publicada por el usuario `hb-dev` y optimizada con Olive para su uso con el runtime ONNX Runtime GenAI. Se distribuye con pesos cuantizados a 4 bits y un tamano de repositorio de 1,4 GB, lo que la situa en el segmento de modelos pequenos pensados para inferencia local en CPU, GPU de gama baja o aceleradores integrados, sin necesidad de servidores con GPU de datacenter.

La relevancia de esta ficha es acotada y conviene ser explicito: la model card publicada no contiene mas informacion que la declaracion de licencia `apache-2.0`. No hay descripcion de la arquitectura, del proceso de conversion, del esquema de cuantizacion, de los idiomas soportados ni de resultados de evaluacion. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria ni trazabilidad de reproducibilidad documentada por terceros.

Por tanto, esta ficha se apoya en dos fuentes separadas que se etiquetan de forma explicita a lo largo del documento: los metadatos verificables del repositorio (tags, licencia, tamano, formato) y las especificaciones declaradas del modelo base Qwen3-1.7B, que no aparecen citadas en la pagina de esta conversion y que deben verificarse contra la ficha oficial de Qwen antes de tomar decisiones de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, heredada del modelo base Qwen3-1.7B (no declarada en la ficha de esta conversion) |
| Parametros totales | 1,7 mil millones (segun la denominacion del modelo; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible en la ficha de esta conversion; el modelo base Qwen3-1.7B declara 32.768 tokens nativos, ampliables a 131.072 mediante escalado YaRN |
| Tipos de cuantizacion | 4-bit (tag del repositorio); el esquema concreto (RTN, AWQ, GPTQ u otro) no se especifica |
| Idiomas soportados | no disponible en esta ficha; el modelo base Qwen3-1.7B declara soporte para 119 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (optimizado con Olive para ONNX Runtime GenAI) |
| Tamano del repositorio | 1,4 GB |
| Fecha de publicacion en HuggingFace | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no documenta ni la arquitectura ni el proceso de entrenamiento. Lo unico verificable es que se trata de un artefacto ONNX derivado de Qwen3-1.7B, generado con la herramienta Olive de Microsoft y orientado al runtime ONNX Runtime GenAI, con pesos en 4 bits. El modelo base Qwen3-1.7B es un transformer denso de atencion completa con normalizacion QK-Norm, entrenado por Alibaba Qwen e integrado en el ciclo post-entrenamiento de la familia Qwen3 (que combina ajuste supervisado y optimizacion por preferencias). Esta descripcion corresponde al modelo original, no a esta conversion, y no esta respaldada por la model card consultada.

En cuanto a la innovacion tecnica del artefacto, el valor anadido es exclusivamente de despliegue: la conversion a ONNX permite ejecutar el modelo sobre ONNX Runtime GenAI en Windows, Linux, Android o navegador (WebGPU), e integrarlo con aceleradores como DirectML, CUDA o QNN. No se documenta el proceso de calibracion de la cuantizacion, la perdida de precision respecto al modelo en BF16, ni si se preservan las capacidades de modo pensamiento (thinking) del modelo base. Cualquier afirmacion sobre calidad numerica de esta build seria especulativa.

## Capacidades

Las capacidades que se enumeran a continuacion se infieren del modelo base Qwen3-1.7B y no estan confirmadas para esta conversion cuantizada. La model card no las declara.

- Generacion de texto y conversacion multi-turno en registro instructivo, segun la familia Qwen3.
- Razonamiento paso a paso, con un modo de pensamiento explicito en el modelo base que puede desactivarse para reducir latencia. No se confirma que esta conversion conserve ambos modos.
- Generacion de codigo en lenguajes habituales (Python, JavaScript, C++, SQL) y explicacion de fragmentos existentes.
- Matematicas de nivel basico y medio, con resolucion de problemas aritmeticos y algebraicos simples.
- Soporte de tool calling y function calling en el modelo base. No confirmado en este artefacto ONNX.
- Capacidades multilingues: el modelo base declara 119 idiomas. Los idiomas efectivamente preservados tras la cuantizacion a 4 bits no estan documentados.
- Capacidad de ejecucion local en dispositivos sin GPU dedicada, gracias al runtime ONNX Runtime GenAI.
- No se declara soporte de vision, audio ni entrada multimodal en ninguna fuente consultada.

## Casos de uso

- Asistente de escritorio en Windows: la build ONNX puede cargarse con ONNX Runtime GenAI sobre DirectML o CPU, lo que permite empaquetar un asistente de texto dentro de una aplicacion nativa sin dependencias de Python ni de servidores externos, con un consumo de disco de 1,4 GB.
- Clasificacion y extraccion de informacion por lotes: con prompts cortos y salidas restringidas, el modelo puede etiquetar tickets, extraer campos de correos o normalizar registros en pipelines ETL donde el coste por token de una API externa resulta prohibitivo.
- Resumen de documentos breves en local: actas de reunion, hilos de correo o incidencias tecnicas de pocas paginas, procesadas sin enviar datos a terceros, lo que simplifica el cumplimiento de requisitos de privacidad.
- Prototipado rapido de funciones de IA en aplicaciones moviles o de navegador: ONNX Runtime dispone de backends para Android, iOS y WebGPU, de modo que el mismo artefacto puede servir para validar una funcionalidad antes de decidir si se escala a un modelo mayor.
- Preprocesado dentro de un pipeline RAG: reescritura de consultas, generacion de palabras clave y filtrado de fragmentos irrelevantes antes de invocar un modelo mayor, reduciendo el numero de llamadas costosas.
- Generacion de codigo de apoyo en entornos de desarrollo: autocompletado de funciones auxiliares, generacion de tests unitarios sencillos y traduccion entre lenguajes dentro de un IDE, siempre con revision humana dado el tamano del modelo.
- Educacion y tutoria offline: explicaciones de conceptos y correccion de ejercicios en escenarios con conectividad limitada o requisitos de soberania del dato.
- Evaluacion de infraestructura: como modelo de referencia para medir latencia y throughput de ONNX Runtime GenAI en un hardware concreto antes de desplegar modelos de mayor tamano con la misma pila.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de `hb-dev/Qwen3-1.7B-ONNX-GenAI` no incluye ninguna tabla de evaluacion, y los resultados publicados para el modelo base Qwen3-1.7B no son trasladables automaticamente a esta conversion cuantizada a 4 bits. Cualquier cifra de MMLU, HumanEval, GSM8K o similares requeriria una evaluacion propia sobre este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-1,5 GB para los pesos en 4 bits, mas la cache KV. Con contextos moderados (4.000-8.000 tokens), el consumo total razonable se situa en el rango de 2-3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria, incluidas RTX 3050, RTX 3060, RTX 4060, GTX 1650 o equivalentes. No se requiere A100, H100 ni memoria de datacenter.
- Cabe en GPU de consumo: si, de forma holgada. Tambien es viable en CPU exclusivamente, con latencias mayores, y en aceleradores integrados mediante DirectML o QNN.
- Opciones de despliegue: ONNX Runtime GenAI es la via natural y la unica soportada de forma nativa por el artefacto. Para `llama.cpp`, Ollama o LM Studio seria necesaria una conversion a GGUF, que este repositorio no incluye. vLLM y TGI no admiten pesos ONNX, por lo que no son opciones directas.
- Latencia y throughput estimados: no disponibles. Dependen del backend (CPU, CUDA, DirectML, WebGPU), de la longitud de contexto y de si se aplica decodificacion especulativa, parametro que no se documenta.

## Comparativa con modelos similares

La comparativa se establece frente a alternativas de la misma categoria (modelos densos de 1 a 2 mil millones de parametros). Los datos de los modelos comparados provienen de sus fichas oficiales y deben verificarse en la fuente.

| Modelo | Parametros | Contexto | Licencia | Formato principal | Notas |
|---|---|---|---|---|---|
| hb-dev/Qwen3-1.7B-ONNX-GenAI | 1,7 B (nominal) | no disponible (32.768 en el modelo base) | apache-2.0 | ONNX 4-bit | Build comunitaria sin model card, 0 descargas |
| Qwen/Qwen3-1.7B | 1,7 B | 32.768 nativos, 131.072 con YaRN | apache-2.0 | safetensors | Modelo base oficial, con modo pensamiento |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 nativos, 131.072 con YaRN | apache-2.0 | safetensors, GGUF | Generacion anterior, sin modo pensamiento |
| meta-llama/Llama-3.2-1B-Instruct | 1,2 B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Contexto mayor, licencia con restricciones para grandes despliegues |
| google/gemma-3-1b-it | 1 B | 32.768 | Gemma Terms of Use | safetensors, GGUF | Requiere aceptar terminos adicionales de Google |

La ventaja diferencial de esta build no es el rendimiento, sino el formato: es una de las pocas opciones listas para ONNX Runtime GenAI en este rango de tamano, lo que facilita su integracion en aplicaciones .NET, C++ o Windows nativo. Frente a las alternativas en safetensors o GGUF, ofrece menos compatibilidad con el ecosistema habitual de inferencia local (llama.cpp, Ollama, vLLM).

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta arquitectura, datos de entrenamiento, esquema de cuantizacion ni evaluaciones. La reproducibilidad del artefacto no esta garantizada.
- Cero descargas y cero likes en el momento de la consulta: sin validacion de la comunidad, sin issues reportados y sin historial de uso en produccion.
- Procedencia del artefacto: es una conversion de terceros sobre un modelo de Alibaba Qwen. No esta publicada ni verificada por el equipo de Qwen, y no se documenta la version exacta del modelo base utilizada ni el commit de origen.
- Perdida de precision por cuantizacion: el paso a 4 bits suele degradar tareas sensibles a la precision numerica, como aritmetica de varios pasos, generacion de codigo con sintaxis estricta y seguir instrucciones de formato complejo. No hay medicion publicada de esta degradacion.
- Riesgo de alucinacion elevado: un modelo de 1,7 mil millones de parametros genera afirmaciones falsas con facilidad, especialmente en preguntas factuales y en contextos largos. No debe usarse como fuente de verdad sin verificacion externa.
- Idiomas no declarados: aunque el modelo base cubre 119 idiomas, no hay confirmacion de que la cuantizacion preserve un rendimiento aceptable en castellano ni en idiomas de bajos recursos.
- Modo pensamiento no confirmado: no se especifica si la conversion conserva el modo de razonamiento extendido del modelo base, ni como activarlo o desactivarlo en ONNX Runtime GenAI.
- Restricciones de licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios realizados. Es una de las licencias mas permisivas del segmento, pero la atribucion al modelo base Qwen sigue siendo exigible.
- Portabilidad limitada: los pesos ONNX no se cargan directamente en llama.cpp, Ollama, vLLM o TGI. Migrar a esos runtimes exige una conversion adicional no incluida en el repositorio.
- Fecha de creacion declarada: 2026-09-16, segun los metadatos de HuggingFace. Conviene contrastar este dato con el historial real del repositorio antes de citarlo.
- Sin garantias de mantenimiento: al no haber actividad registrada, no hay compromiso de actualizacion, correccion de errores ni soporte por parte del autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hb-dev/Qwen3-1.7B-ONNX-GenAI
- Modelo base (referencia, no citado en la model card de esta conversion): https://huggingface.co/Qwen/Qwen3-1.7B
- ONNX Runtime GenAI (runtime objetivo declarado por los tags): https://github.com/microsoft/onnxruntime-genai
- Olive, herramienta de optimizacion citada en los tags: https://github.com/microsoft/Olive
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la informacion proporcionada.
