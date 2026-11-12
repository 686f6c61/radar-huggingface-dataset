# faisalwp/slang-baku-gguf

## Resumen

`faisalwp/slang-baku-gguf` es un modelo de lenguaje conversacional publicado en Hugging Face por el usuario faisalwp, distribuido exclusivamente en formato GGUF (2,0 GB de repositorio) y orientado, a juzgar por su nombre, al tratamiento de jerga o habla coloquial de Yakarta ("Baku" puede referirse a la variante informal del indonesio hablada en la capital). El modelo cuenta con 1.543.714.304 parametros totales (aproximadamente 1,54 mil millones), un tamano que lo situa en la gama de modelos pequenos aptos para inferencia en CPU y GPU de consumo.

La informacion publicada en la model card es extremadamente limitada: no se declara licencia, no se especifican idiomas soportados, no hay pipeline definido ni resultados de evaluacion. El repositorio incluye la etiqueta `endpoints_compatible`, lo que indica que puede desplegarse a traves de la infraestructura de Inference Endpoints de Hugging Face, y la etiqueta `conversational`, que sugiere un ajuste orientado a dialogo.

Su relevancia actual es acotada y experimental: se trata de un modelo de nicho, con 66 descargas y ningun "like" en el momento de la consulta, cuya utilidad principal seria la experimentacion con variantes linguisticas informales del indonesio en entornos con recursos limitados. No debe confundirse con modelos de proposito general de la misma escala, ya que no hay evidencia publicada de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no aplica (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | no disponible (por el nombre, probablemente indonesio coloquial) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. El unico dato objetivo es el numero de parametros (1.543.714.304) y el formato de distribucion (GGUF), lo que implica que los pesos originales fueron convertidos desde otro formato (probablemente safetensors de un modelo base) para su uso con llama.cpp y herramientas compatibles. El tag `conversational` sugiere un ajuste supervisado orientado a dialogo, pero se desconoce el modelo base, el volumen de tokens de entrenamiento, la composicion del dataset y si se aplicaron tecnicas de RLHF, DPO o similares.

Tampoco hay informacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, mezcla de expertos) ni sobre el proceso de cuantizacion aplicado. Cualquier afirmacion al respecto seria especulativa y no debe asumirse en produccion.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica un ajuste para mantener dialogos, aunque no se documenta la calidad ni la longitud de contexto efectiva.
- Procesamiento de jerga o habla coloquial: por el nombre del modelo, se orienta a variantes informales del indonesio (probablemente "bahasa gaul" de Yakarta), si bien esto no esta confirmado en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara ningun idioma oficialmente.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Despliegue via Inference Endpoints: la etiqueta `endpoints_compatible` indica compatibilidad con la infraestructura gestionada de Hugging Face.

## Casos de uso

- Prototipado de chatbots en indonesio coloquial: el modelo puede emplearse para experimentar con respuestas en registro informal, aunque sin garantias de calidad al no existir evaluacion publicada.
- Investigacion linguistica sobre jerga urbana: util como base para estudiar como un modelo pequeno representa variantes dialectales del indonesio, comparando salidas con corpus anotados.
- Inferencia en hardware modesto: con ~1,54 B de parametros en GGUF, cabe en equipos de consumo, lo que permite desplegarlo en portatiles para demos locales con llama.cpp u Ollama.
- Educacion y talleres: adecuado para ensenar el flujo completo de cuantizacion GGUF y despliegue local sin requerir GPUs de gama alta.
- Filtrado o normalizacion de texto informal: podria usarse para reformular mensajes coloquiales a un registro mas formal en pipelines de preprocesamiento, previa validacion manual.
- Pruebas de integracion en Inference Endpoints: la etiqueta `endpoints_compatible` permite validar flujos de despliegue gestionado en Hugging Face con un modelo de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantizacion Q4_K_M, un modelo de ~1,54 B ocupa aproximadamente 1,0-1,2 GB; en Q8_0, en torno a 1,7 GB; en FP16, unos 3,1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (GTX 1650, RTX 3050); para cuantizaciones Q4 basta con 2 GB (GTX 1050 Ti, iGPU modernas).
- Cabe en GPU de consumo: si, en practicamente toda la gama actual (RTX 3060, 4060, 4090) e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y Hugging Face Inference Endpoints (por la etiqueta `endpoints_compatible`). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion previa.
- Latencia y throughput estimados: no disponibles; al no conocerse la arquitectura exacta ni el contexto, no es posible ofrecer cifras fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| faisalwp/slang-baku-gguf | ~1,54 B | no disponible | no disponible | GGUF | Hugging Face (66 descargas) |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama, vLLM |
| Llama 3.2 1B Instruct | 1,24 B | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, Ollama, vLLM |
| Gemma 2 2B | 2,6 B | 8 192 tokens | Gemma Terms of Use | safetensors, GGUF | Hugging Face, Ollama |

La comparativa se limita a parametros, contexto, licencia y disponibilidad, ya que no existen datos de rendimiento del modelo analizado. Frente a las alternativas citadas, la principal desventaja es la ausencia de licencia declarada y de evaluacion publica, lo que dificulta su adopcion en entornos profesionales.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, arquitectura, idiomas ni evaluacion, lo que impide auditar el modelo.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; en la practica, esto bloquea su adopcion en produccion hasta que el autor la aclare.
- Riesgo elevado de alucinacion: al desconocerse el modelo base y el volumen de entrenamiento, no puede estimarse la fiabilidad factual.
- Sesgos desconocidos: sin informacion sobre la composicion del dataset, no es posible evaluar sesgos de genero, etnicos o politicos.
- Cobertura idiomatica incierta: aunque el nombre sugiere indonesio coloquial, no se declara ningun idioma oficialmente; el rendimiento en castellano es, con toda probabilidad, muy limitado.
- Contexto desconocido: no se puede garantizar el manejo de conversaciones largas ni de documentos extensos.
- Modelo de nicho con muy poca traccion (66 descargas, 0 likes): escasa comunidad, sin issues ni discusiones que permitan resolver dudas.
- Sin garantias de mantenimiento: la ultima actualizacion es de noviembre de 2026 y no hay compromiso de soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faisalwp/slang-baku-gguf
- Perfil del autor: https://huggingface.co/faisalwp
