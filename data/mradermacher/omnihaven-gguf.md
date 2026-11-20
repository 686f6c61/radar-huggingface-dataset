# mradermacher/omniHaven-GGUF

## Resumen

omniHaven-GGUF es la version cuantizada en formato GGUF del modelo omniHaven, publicado por el usuario mradermacher a partir de los pesos originales de Veyraorganization/omniHaven. Se trata de una conversion estatica generada con herramientas de cuantizacion para llama.cpp, que ofrece el modelo en multiples niveles de compresion (desde Q2_K hasta F16) para facilitar su despliegue en entornos con recursos limitados. El repositorio ocupa 1,4 GB y fue creado el 20 de noviembre de 2026.

El modelo base cuenta con 134.515.008 parametros totales (aproximadamente 134,5 millones), lo que lo situa en la categoria de modelos pequenos, adecuados para ejecucion en CPU o GPUs de gama baja. La informacion disponible no especifica la arquitectura del modelo original, su longitud de contexto, los idiomas soportados ni la licencia bajo la que se distribuye, por lo que estos datos deben consultarse directamente en el repositorio del modelo original.

La relevancia de esta publicacion radica en que pone a disposicion de la comunidad una version optimizada para inferencia local mediante llama.cpp y herramientas compatibles, con un abanico amplio de cuantizaciones que permiten ajustar el equilibrio entre calidad y consumo de memoria. No obstante, la ausencia de documentacion tecnica detallada y de resultados de benchmarks limita la evaluacion rigurosa del modelo a partir de los datos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 134.515.008 (aprox. 134,5 M) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); pesos originales en safetensors segun el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo original omniHaven (Veyraorganization/omniHaven). Los datos publicados en este repositorio se limitan a los metadatos de la conversion a GGUF, que indican el uso de quantize_version 2, salida con tensor de cuantizacion (output_tensor_quantised: 1) y tipo de conversion hf, es decir, una conversion desde pesos en formato Hugging Face. No se especifica si el modelo emplea un transformer denso, una arquitectura MoE, SSM o hibrida.

Tampoco se detallan los datos de entrenamiento: numero de tokens, composicion del corpus, tecnicas de alineacion como RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Toda esta informacion deberia consultarse en la model card del modelo base en https://huggingface.co/Veyraorganization/omniHaven, que no forma parte de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" del repositorio sugiere un uso orientado a dialogos, aunque no se detallan capacidades especificas de razonamiento, codigo o matematicas.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que el modelo puede servirse a traves de endpoints compatibles con la infraestructura de Hugging Face.
- Inferencia local via llama.cpp: al estar en formato GGUF, es compatible con el ecosistema de llama.cpp y herramientas derivadas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Prototipado de chatbots ligeros en local: con 134,5 M de parametros, el modelo puede ejecutarse en CPU o en GPUs de gama baja para experimentar con dialogos conversacionales sin depender de servicios en la nube.
- Pruebas de integracion con llama.cpp: las distintas cuantizaciones permiten validar pipelines de inferencia (carga de GGUF, tokenizacion, generacion) antes de escalar a modelos mayores.
- Despliegue en dispositivos con memoria limitada: las variantes Q2_K y Q3_K reducen el peso del modelo a una fraccion del original, lo que facilita su uso en entornos embebidos o contenedores con poca RAM.
- Educacion y experimentacion: un modelo pequeno en formato GGUF es util para ensenar tecnicas de cuantizacion, comparacion de precisiones y evaluacion de calidad frente a tamano.
- Servicio de endpoints compatibles: el tag endpoints_compatible sugiere que puede desplegarse detras de endpoints estandar para pruebas de integracion de API.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce variantes, lo que permite medir el impacto de la cuantizacion en la calidad de salida sobre una misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 134,5 M de parametros, las variantes cuantizadas ocupan del orden de cientos de MB. La variante F16 rondaria los 270 MB de pesos, mientras que Q4_K_M se situaria en torno a 80-90 MB y Q2_K en torno a 50-60 MB (estimaciones basadas en el numero de parametros, no en mediciones publicadas).
- GPU recomendadas: cualquier GPU consumer moderna puede alojar el modelo; no se requiere A100 ni H100. Una RTX 4090 o incluso GPUs integradas son suficientes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama (previa importacion del GGUF), y servidores compatibles con el formato GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion rigurosa. Como referencia de categoria, modelos conversacionales de tamano similar (por ejemplo, variantes pequenas de la familia Qwen o SmolLM) suelen publicar especificaciones detalladas, pero no se dispone de datos de omniHaven para confrontarlos.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica la licencia del modelo, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base antes de cualquier uso en produccion.
- Documentacion tecnica escasa: no se detallan arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para tareas concretas.
- Riesgo de alucinacion: no cuantificado; al no haber benchmarks ni evaluaciones publicadas, no puede estimarse la fiabilidad de sus respuestas.
- Tamano reducido: con 134,5 M de parametros, es previsible una capacidad limitada en razonamiento complejo, codigo y conocimiento factual, aunque no se aportan datos que lo confirmen.
- Idiomas: se desconoce si el modelo esta entrenado en castellano o en otros idiomas; el tag conversational no especifica lengua.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K pueden degradar notablemente la calidad de salida en modelos pequenos; conviene validar cada variante en la tarea objetivo.
- Sin soporte confirmado de tool calling ni agentes: no hay evidencia de que el modelo base implemente estas capacidades.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/omniHaven-GGUF
- Modelo base: https://huggingface.co/Veyraorganization/omniHaven
