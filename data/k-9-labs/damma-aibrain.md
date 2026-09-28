# K-9-labs/damma-aibrain

## Resumen
damma-aibrain es un modelo de lenguaje multimodal publicado por el usuario K-9-labs en HuggingFace, distribuido exclusivamente en formato GGUF para su uso con llama.cpp. Segun la propia model card, se trata de un ajuste fino (finetuning) convertido a GGUF mediante la libreria Unsloth. Los ficheros incluidos en el repositorio (`gemma-4-e2b-it.Q8_0.gguf` y `gemma-4-e2b-it.F16-mmproj.gguf`) apuntan a que el modelo deriva de una variante de la familia Gemma 4 con identificador interno "e2b-it", e incluye un proyector multimodal separado, lo que confirma su naturaleza vision-language.

El dato objetivo mas relevante es el recuento de parametros reportado por HuggingFace a partir de los safetensors: 4.647.450.147 parametros (aproximadamente 4,65 mil millones). El repositorio ocupa 5,9 GB, coherente con una cuantizacion Q8_0 del modelo mas el proyector en F16. No se dispone de informacion sobre licencia, idiomas soportados, longitud de contexto ni pipeline declarado.

La relevancia de esta ficha es limitada y hay que ser transparente al respecto: el repositorio no tiene descargas ni "likes" en el momento de la consulta, la model card es minima y no se han publicado benchmarks. Se trata, por tanto, de un artefacto reciente y poco documentado, util principalmente como ejemplo de flujo de trabajo Unsloth + llama.cpp para modelos multimodales pequenos, no como una opcion consolidada de produccion.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los nombres de fichero sugieren una variante de la familia Gemma 4, "gemma-4-e2b-it", con componente de vision) |
| Parametros totales | 4.647.450.147 (aprox. 4,65 mil millones), segun safetensors reportados por HuggingFace |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (modelo principal en GGUF); proyector multimodal en F16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); la model card menciona un modelo fusionado en bf16 para Ollama |
| Tamano del repositorio | 5,9 GB |

## Arquitectura y entrenamiento
No hay informacion publicada sobre la arquitectura interna en la documentacion proporcionada. Los indicios disponibles son indirectos: el tag `gemma4` y los nombres de fichero `gemma-4-e2b-it` apuntan a un modelo base de la familia Gemma 4, presumiblemente con arquitectura transformer y un modulo de vision acoplado mediante un proyector (`mmproj`). El sufijo "e2b" es consistente con variantes de parametros efectivos reducidos, pero no se dispone de confirmacion ni del desglose entre parametros totales y activos.

Respecto al entrenamiento, la model card unicamente indica que el modelo fue ajustado y convertido a GGUF con Unsloth, y que el proceso fue "2x faster" (el doble de rapido) gracias a dicha libreria. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades
- Generacion de texto conversacional: el tag `conversational` y el uso recomendado de `llama-cli` con `--jinja` indican soporte de plantillas de chat.
- Procesamiento de vision: la presencia del fichero `F16-mmproj.gguf` y el uso de `llama-mtmd-cli` confirman capacidad multimodal (imagen + texto).
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a traves de endpoints compatibles con la API de HuggingFace o similares.
- Razonamiento, codigo, matematicas, tool calling, capacidades de agente y multilingues: no disponible (no documentado en la informacion proporcionada).
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso
- Descripcion automatica de imagenes en local: gracias al proyector multimodal incluido, puede generar descripciones de imagenes sin depender de APIs externas, ejecutandose sobre llama.cpp en hardware de gama media.
- OCR y extraccion de informacion de documentos: un VLM de ~4,65B es adecuado para leer facturas, tickets o formularios escaneados y devolver texto estructurado, siempre que se valide la calidad por la ausencia de benchmarks.
- Asistente conversacional embebido: al ser un modelo pequeno y cuantizado en Q8_0, puede desplegarse en un equipo de sobremesa o en un servidor modesto para tareas de chat con contexto limitado.
- Prototipado de pipelines multimodales: sirve como banco de pruebas para flujos de trabajo Unsloth + llama.cpp antes de escalar a modelos mayores.
- Clasificacion y etiquetado de imagenes en lotes: utilizable para tareas de vision basicas dentro de un pipeline propio, con control total sobre el entorno de ejecucion.
- Educacion y experimentacion: permite estudiar como se comporta un modelo multimodal pequeno frente a alternativas consolidadas, sin coste de API.
- Soporte en entornos sin conectividad: al distribuirse en GGUF, puede ejecutarse totalmente offline, lo que resulta util en escenarios con requisitos de privacidad o aislamiento de red.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto documentacion tecnica relevante sobre el modelo (los resultados obtenidos corresponden a la letra "K" y a la linea K del Transilien, sin relacion alguna).

## Requisitos de hardware
Los valores siguientes son estimaciones derivadas del recuento de parametros y del formato de cuantizacion, no cifras publicadas por el autor.
- Inferencia en Q8_0 (modelo principal): aproximadamente 5 GB de pesos, mas el proyector mmproj en F16 y la cache KV; en la practica, reservar entre 7 y 9 GB de VRAM para contexto moderado.
- Inferencia en F16 (modelo fusionado para Ollama): alrededor de 9,3 GB solo en pesos, por lo que se recomienda un minimo de 12-16 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, asi como A100 o H100 para despliegues concurrentes. Cabe en GPUs de consumo siempre que se use Q8_0 y se ajuste la longitud de contexto.
- Memoria unificada: viable en equipos Apple Silicon con 16 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto y `llama-mtmd-cli` para multimodal, ambos con `--jinja`), Ollama (con la salvedad de que no admite ficheros `mmproj` separados y exige fusionar el modelo a bf16) y cualquier servidor compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
La comparativa es orientativa y se basa en caracteristicas publicas de las alternativas; los datos del modelo objeto de la ficha estan marcados como no disponibles cuando corresponde.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| K-9-labs/damma-aibrain | ~4,65 mil millones | no disponible | Si (mmproj) | no disponible | GGUF |
| Gemma 3 4B IT | ~4 mil millones | 128K | Variante multimodal disponible por separado | Licencia Gemma | safetensors, GGUF |
| Qwen2.5-VL-3B-Instruct | ~3,75 mil millones | 32K (extensible) | Si | Apache 2.0 | safetensors, GGUF |
| Phi-3.5-vision-instruct | ~4,2 mil millones | 128K | Si | MIT | safetensors |

Se recomienda verificar los datos de las alternativas en sus respectivas model cards, ya que pueden variar entre revisiones. En cualquier caso, damma-aibrain parte con desventaja clara en cuanto a documentacion, licencia y ecosistema frente a estas opciones.

## Limitaciones y advertencias
- No se ha publicado informacion sobre sesgos. Al derivar presumiblemente de un modelo base de la familia Gemma, podria heredar sesgos presentes en dicho modelo y en sus datos de entrenamiento, pero esto no puede confirmarse.
- Riesgo de alucinacion no evaluado: al no existir benchmarks ni evaluaciones publicadas, se desconoce su tasa de error en tareas factuales.
- Licencia no especificada: no esta claro si se permite el uso comercial. Si el modelo base es Gemma, es probable que apliquen los terminos de uso de Gemma, pero el autor no lo declara, lo que supone un riesgo legal para produccion.
- Idiomas no declarados: se desconoce si el ajuste fino se realizo en ingles, en otro idioma o en varios.
- Longitud de contexto desconocida: impide planificar casos de uso que requieran ventanas largas.
- Repositorio sin traccion: cero descargas y cero "likes" en la fecha de consulta, sin issues ni discusiones publicas que permitan validar su funcionamiento.
- Model card minima: no hay informacion sobre datos de entrenamiento, hiperparametros ni proceso de evaluacion, lo que dificulta la reproducibilidad.
- Limitacion conocida de Ollama: no soporta ficheros `mmproj` separados, por lo que el uso multimodal en Ollama requiere fusionar previamente el modelo a bf16, con el consiguiente aumento de requisitos de memoria.
- Para cualquier uso en produccion se recomienda una evaluacion propia exhaustiva antes de desplegarlo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/K-9-labs/damma-aibrain
- Unsloth (libreria de ajuste fino y conversion citada en la model card): https://github.com/unslothai/unsloth
- llama.cpp (entorno de ejecucion implicito en el formato GGUF y en los comandos de ejemplo): https://github.com/ggml-org/llama.cpp
- Nota: la busqueda web realizada no ha devuelto papers, blogs ni repositorios relacionados con este modelo.
