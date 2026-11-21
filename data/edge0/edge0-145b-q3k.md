# Edge0/Edge0-145B-q3k

## Resumen
Edge0-145B-q3k es un modelo de lenguaje de tipo Mixture of Experts (MoE) distribuido en formato GGUF cuantizado a 4 bits por el autor Edge0, derivado del modelo base Qwen/Qwen3.8-Flash-Next. El nombre comercial sugiere 145B de parametros, pero los pesos reales en safetensors suman 4.947.698.560 parametros (aproximadamente 4,95B), una discrepancia notable que conviene tener en cuenta al planificar el despliegue. El repositorio ocupa 106,3 GB, un tamano coherente con un checkpoint MoE de gran numero de expertos cuantizado.

El modelo esta disenado explicitamente para inferencia en el borde (edge-inference) y para cargas de trabajo de agentes y generacion de codigo, segun las etiquetas de la model card. Incorpora la etiqueta "latent-moe", que apunta a una variante de enrutamiento latente de expertos, aunque la documentacion disponible no detalla el mecanismo. Se distribuye bajo la licencia propietaria edge0-community-model-1.0 y utiliza la libreria propia `edge0` en lugar de las habituales de Hugging Face.

Su relevancia actual radica en la combinacion de un modelo base reciente de la familia Qwen con una cuantizacion agresiva orientada a hardware limitado, lo que lo hace atractivo para prototipos de agentes y asistentes de codigo en entornos con recursos restringidos. La ficha siguiente recoge unicamente los datos disponibles en la informacion proporcionada y marca como no disponible todo aquello que el autor no publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con variante "latent-moe" segun etiquetas; detalles no disponibles |
| Parametros totales | 4.947.698.560 (segun safetensors); el nombre del modelo indica 145B, discrepancia no aclarada |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (sufijo q3k en el nombre); otras variantes no disponibles |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Libreria | edge0 |
| Tamano del repositorio | 106,3 GB |
| Descargas | 138.154 |
| Likes | 224 |

## Arquitectura y entrenamiento
La informacion disponible indica que se trata de un transformer con arquitectura de mezcla de expertos (MoE), etiquetado por el autor como "latent-moe". No se especifica el numero de expertos, el mecanismo de enrutamiento, la dimension oculta ni el numero de capas. El modelo es una cuantizacion del checkpoint Qwen/Qwen3.8-Flash-Next, por lo que su entrenamiento original corresponde al del modelo base de Qwen, del que no se aportan detalles en la informacion proporcionada (numero de tokens, composicion del dataset, uso de RLHF o DPO: no disponible).

La innovacion destacable es la propia cuantizacion a 4 bits en formato GGUF junto con la libreria `edge0`, orientada a inferencia en el borde. Las etiquetas mencionan soporte CUDA y compatibilidad con endpoints, lo que sugiere integracion con APIs de inferencia, pero no se documentan tecnicas como decodificacion especulativa, atencion lineal ni metodos de compresion adicionales. Tampoco se detalla si la cuantizacion preserva el enrutamiento de expertos original o lo modifica.

## Capacidades
- Generacion de texto conversacional (pipeline text-generation, etiqueta conversational).
- Razonamiento y generacion de codigo, segun las etiquetas "coding" y "agent".
- Soporte para flujos de agentes y razonamiento multi-paso (etiqueta "agent").
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Modo thinking, vision o audio: no disponible.
- Inferencia en el borde con soporte CUDA y compatibilidad con endpoints.

## Casos de uso
- Asistente de codigo en local: el modelo, cuantizado a 4 bits y con etiqueta "coding", puede desplegarse en estaciones de trabajo con GPU de consumo para autocompletado y generacion de funciones, reduciendo la dependencia de APIs externas.
- Agentes autonomos de proposito general: la etiqueta "agent" y el soporte de endpoints permiten integrarlo en bucles de razonamiento multi-paso para tareas como busqueda de informacion, ejecucion de comandos o automatizacion de flujos.
- Prototipado rapido de chatbots: al ser un modelo conversacional con formato GGUF, se puede servir con runners ligeros para validar productos de atencion al cliente antes de escalar a modelos mayores.
- Inferencia en el borde y dispositivos con recursos limitados: el enfasis del autor en edge-inference y la cuantizacion a 4 bits lo hacen adecuado para entornos donde no cabe un modelo de mayor precision.
- Integracion en pipelines de CI/CD para revision de codigo: puede generar sugerencias y parches en entornos controlados, siempre que la licencia lo permita para uso comercial.
- Experimentacion e investigacion: util para estudiar el comportamiento de variantes MoE cuantizadas y comparar con el modelo base Qwen/Qwen3.8-Flash-Next en tareas de codigo y agentes.
- Despliegue con compatibilidad de endpoints: la etiqueta endpoints_compatible facilita conectarlo a infraestructuras de serving existentes sin reescribir la capa de integracion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio pesa 106,3 GB en formato GGUF a 4 bits, por lo que se requiere almacenamiento y memoria acorde al numero real de parametros cargados; la discrepancia entre 145B nominales y 4,95B en safetensors impide una estimacion fiable.
- GPU recomendadas: no disponibles. La etiqueta "cuda" indica soporte para GPU NVIDIA, pero el autor no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada; depende del tamano efectivo del checkpoint y de la implementacion de la libreria `edge0`.
- Opciones de despliegue: la libreria propia `edge0` y el formato GGUF sugieren compatibilidad con runners GGUF, pero no se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Edge0-145B-q3k | 4,95B reales (145B nominales, no aclarado) | no disponible | GGUF 4 bits | edge0-community-model-1.0 | Derivado de Qwen3.8-Flash-Next; orientado a edge y agentes |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible | no disponible | no disponible | Modelo original sin cuantizar; referencia directa |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias
- Discrepancia critica entre el nombre (145B) y los parametros reales en safetensors (4,95B); el autor no explica la diferencia, lo que puede llevar a estimaciones erroneas de recursos.
- Idiomas soportados no declarados; no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas.
- Longitud de contexto no disponible, lo que impide planificar cargas con documentos largos o conversaciones extensas.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles; no hay informacion sobre la composicion del dataset ni sobre mitigaciones.
- Licencia propietaria edge0-community-model-1.0: es necesario revisar el archivo LICENSE antes de cualquier uso comercial; no se confirman permisos de redistribucion o modificacion.
- El uso de una libreria propia (`edge0`) puede limitar la portabilidad frente a ecosistemas estandar como transformers, vLLM o llama.cpp.
- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo base Qwen/Qwen3.8-Flash-Next; no se aportan metricas comparativas.
- No se documentan garantias de soporte ni actualizaciones por parte del autor.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Edge0/Edge0-145B-q3k
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Edge0/Edge0-145B-q3k/blob/main/LICENSE
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
