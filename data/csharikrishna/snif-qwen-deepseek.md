# csharikrishna/snif-qwen-deepseek

## Resumen

SNIF (StateGate Neural Inference Fabric) es un modelo de lenguaje causal compuesto publicado por el autor independiente CS Hari Krishna bajo el identificador `csharikrishna/snif-qwen-deepseek`. No se trata de un transformer entrenado desde cero, sino de un sistema de dos modelos preexistentes (Qwen2.5-0.5B-Instruct como modelo de borde y DeepSeek-R1-Distill-Qwen-1.5B como motor de razonamiento) unidos mediante un bus latente continuo de 2048 dimensiones denominado NeuralBus. El problema que intenta resolver es el coste computacional asimetrico: las consultas simples se responden con el modelo pequeno y solo las complejas escalan al modelo de razonamiento, sin transferir tokens de texto intermedios entre ambos.

La innovacion declarada es el enrutado latente pre-generacion: el sistema evalua las activaciones intermedias en la capa 9 del modelo de borde y decide, antes de emitir el primer token, si la consulta requiere escalado. El autor afirma una huella de memoria activa de aproximadamente 1.980 MiB de VRAM, lo que permitiria ejecutarlo en GPU de consumo y en Google Colab gratuito, y una latencia de decodificacion hasta 3,5 veces mas rapida que la decodificacion extensa del modelo grande.

El repositorio es muy reciente (creado el 2026-10-09 segun los metadatos), no tiene descargas ni likes, y no incluye paper ni evaluacion publicada: el propio autor indica que el articulo teorico esta "en preparacion". El peso safetensors real del repo es de 16.899.714 parametros (aproximadamente 16,9 M), una cifra muy inferior a la suma de los dos modelos base, lo que sugiere que el checkpoint publicado contiene principalmente los modulos de interconexion y no la totalidad de los pesos compuestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal compuesto (dos modelos enrutados) con interconexion latente de 2048 dimensiones (NeuralBus) |
| Parametros totales | 16.899.714 segun safetensors del repo (los modelos base declarados suman ~494 M y ~1,78 B) |
| Parametros activos | Enrutado condicional: ruta ligera con Qwen2.5-0.5B-Instruct (494 M, 896D, 24 capas) o ruta de razonamiento con DeepSeek-R1-Distill-Qwen-1.5B (1,78 B, 1536D, 28 capas) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se documentan pesos en safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un sistema compuesto, no un unico modelo. Se combinan dos transformers causales ya entrenados: Qwen2.5-0.5B-Instruct (896 dimensiones, 24 capas, 494 M de parametros) como modelo de borde para prefill y decodificacion rapida, y DeepSeek-R1-Distill-Qwen-1.5B (1536 dimensiones, 28 capas, 1,78 B de parametros) como motor de razonamiento. La conexion entre ambos se realiza a traves de un "hub" latente universal de 2048 dimensiones (NeuralBus), con enrutado pre-generacion que evalua activaciones intermedias en la capa 9 del modelo de borde. El autor destaca que no se transfieren tokens de texto intermedios entre modelos durante el enrutado ("continuous latent deliberation").

No se han proporcionado datos sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset, ni sobre si hubo fases de RLHF, DPO o SFT especificas para los modulos de interconexion. Tampoco se documenta el metodo exacto de alineacion de espacios latentes de dimensiones distintas (896D y 1536D hacia 2048D). La decodificacion esta acotada ("bounded conclusion decoding") para evitar derivaciones de multiples parrafos, lo que el autor asocia a la mejora de latencia de decodificacion de hasta 3,5x. La model card no incluye ningun detalle sobre el procedimiento de entrenamiento del enrutador ni sobre datos de calibracion.

## Capacidades

- Generacion de texto conversacional en ingles.
- Enrutado latente adaptativo: consultas factuales se resuelven localmente con el modelo de borde y consultas logicas escalan al modelo de razonamiento.
- Razonamiento tipo DeepSeek-R1 en la ruta de escalado (el modelo base es un distill de R1 sobre Qwen).
- Decodificacion acotada que prioriza respuestas concisas frente a derivaciones largas.
- Ejecucion en CPU y GPU (float32 en CPU, float16 en CUDA segun el ejemplo de la model card).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente.
- Capacidades multilingues: no, solo ingles declarado.
- Vision, audio o modo "thinking" explicito: no disponible.
- Requiere `trust_remote_code=True`, es decir, ejecuta codigo personalizado incluido en el repositorio.

## Casos de uso

- Clasificacion rapida de consultas por complejidad: el enrutador pre-generacion en la capa 9 decide si una pregunta factual se responde con el modelo pequeno, reduciendo coste por consulta en sistemas de atencion al cliente de alto volumen.
- Atencion al cliente automatizada de bajo coste: la ruta ligera (Qwen2.5-0.5B) gestiona el grueso de las interacciones simples, con la huella de VRAM declarada de ~1.980 MiB, apta para despliegues en una sola GPU de consumo.
- Asistentes educativos de logica y matematicas: preguntas de razonamiento del tipo "si todos los X son Y..." escalan al modelo de razonamiento, util para tutoria automatica de ejercicios logicos.
- Prototipado e investigacion en enrutado latente: el repo sirve como banco de pruebas para estudiar el enrutado pre-generacion condicionado por activaciones intermedias, dado que el autor publica la metodologia en GitHub.
- Demos en Google Colab gratuito: con 1.980 MiB de VRAM activa y un notebook de inicio rapido incluido, es viable ejecutarlo sin GPU dedicada en flujos educativos o de demostracion.
- Sistemas de respuesta con presupuesto de latencia estricto: la decodificacion acotada (hasta 3,5x mas rapida en decodificacion segun el autor) encaja en escenarios donde no se toleran derivaciones largas, como respuestas cortas en interfaces de chat.
- Filtrado previo en pipelines RAG: la ruta ligera puede resolver consultas que no requieren razonamiento profundo, reservando la ruta pesada para consultas que necesiten sintesis compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar, y no se ha encontrado paper asociado (el autor indica que esta "en preparacion"). Las unicas cifras de rendimiento declaradas son la huella de VRAM activa (~1.980 MiB) y la mejora de latencia de decodificacion de hasta 3,5x, ambas sin metodologia de medicion publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.980 MiB de huella activa, segun la model card.
- Modelos base: Qwen2.5-0.5B (494 M) y DeepSeek-R1-Distill-Qwen-1.5B (1,78 B), ambos manejables en GPU de consumo en float16.
- GPU recomendadas: no se especifican modelos concretos; el autor menciona "consumer GPUs" y Google Colab gratuito como objetivos de diseno.
- Cabe en GPU de consumo: si, segun el autor (huella declarada inferior a 2 GB de VRAM activa).
- CPU: soportado explicitamente en el ejemplo de la model card (float32, sin `device_map`).
- Opciones de despliegue: HuggingFace Transformers con `trust_remote_code=True`; no se documentan vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos GGUF.
- Latencia y throughput: no se publican cifras absolutas; solo la mejora relativa de hasta 3,5x en decodificacion frente a la ruta de razonamiento extensa.

## Comparativa con modelos similares

Dado que SNIF es un sistema compuesto, la comparacion mas directa es con sus propios modelos base y con el modelo de razonamiento de referencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SNIF (este modelo) | 16,9 M en safetensors de repo; compone 494 M + 1,78 B | no disponible | MIT | HuggingFace, 0 descargas | Enrutado latente propio; requiere `trust_remote_code` |
| Qwen2.5-0.5B-Instruct | ~494 M | no disponible en esta ficha | Apache-2.0 (base) | HuggingFace | Componente de borde de SNIF |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,78 B | no disponible en esta ficha | MIT (base) | HuggingFace | Componente de razonamiento de SNIF |
| Alternativas de enrutado (p. ej. mezcla MoE entrenada de cero) | variable | no disponible | variable | variable | No se dispone de datos comparativos publicados para SNIF |

No se dispone de benchmarks publicados que permitan comparar SNIF en rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No hay benchmarks publicados ni paper asociado; no es posible validar las afirmaciones de latencia y eficiencia.
- El repositorio tiene 0 descargas y 0 likes, y los metadatos indican una fecha de creacion de 2026-10-09; la madurez y el soporte de la comunidad son nulos por el momento.
- Existe una discrepancia notable entre los 16.899.714 parametros del safetensors y la suma de los modelos base declarados (~2,27 B). El checkpoint parece contener principalmente los modulos de interconexion, no el sistema completo; hay que verificar que la carga reconstruya correctamente los dos modelos base.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor: riesgo de seguridad en entornos de produccion.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- No se documentan tool calling, agentes, vision ni audio.
- La longitud de contexto no esta especificada; no se puede garantizar el comportamiento en conversaciones largas.
- No hay variantes cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue fuera de Transformers.
- Riesgo de alucinacion inherente a los modelos generativos, agravado en la ruta ligera (Qwen2.5-0.5B) por su tamano reducido.
- Sesgos conocidos: no documentados por el autor; heredables de los modelos base.
- Licencia MIT para software y pesos, pero el aviso de marca indica que los nombres "StateGate", "SNIF" y "NeuralBus" pertenecen al autor y no se pueden usar para promocionar productos derivados sin atribucion.
- El enrutado pre-generacion basado en activaciones latentes puede fallar si la distribucion de entrada difiere de la esperada, enviando consultas complejas a la ruta ligera o viceversa.

## Enlaces

- HuggingFace: https://huggingface.co/csharikrishna/snif-qwen-deepseek
- Repositorio GitHub: https://github.com/csharikrishna/stategate
- Notebook de inicio rapido (referenciado como SNIF_Quickstart.ipynb en el repo)
- Gist de Google Colab: https://colab.research.google.com/gist/csharikrishna/9b32c2900813af7ca428b7e37538856a
- Modelo base de borde: `Qwen/Qwen2.5-0.5B-Instruct` (HuggingFace)
- Modelo base de razonamiento: `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (HuggingFace)
- Contacto del autor: csharikrishna1806@gmail.com
- Paper / evaluacion teorica: en preparacion, no disponible
