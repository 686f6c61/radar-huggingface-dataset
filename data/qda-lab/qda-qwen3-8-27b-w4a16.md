# qda-lab/QDA-Qwen3.8-27B-W4A16

## Resumen

QDA-Qwen3.8-27B-W4A16 es un checkpoint cuantizado en formato W4A16 (pesos a 4 bits, activaciones a 16 bits) del modelo base Qwen/Qwen3.8-27B, publicado por el laboratorio qda-lab. El checkpoint se ha generado mediante una busqueda automatizada denominada QDA ("Closed-Loop Quantization Design with LLM Agents"), descrita en un envio a MLSys 2027, y corresponde a los ficheros exactos evaluados en dicho trabajo (identificadores de busqueda `r-01097832`, entrega manual `h5`). El modelo cuenta con 27.781.427.952 parametros reales segun los safetensors del repositorio, que ocupa 19,6 GB.

La relevancia de esta publicacion radica en que demuestra que una cuantizacion agresiva a 4 bits en los pesos puede mantener una precision alta en tareas de razonamiento matematico, cientifico y de codigo, con un promedio de 79,8 puntos en el conjunto de benchmarks reportado por el autor. El formato `compressed-tensors` permite cargar el modelo directamente en vLLM sin conversion previa, lo que simplifica su despliegue en produccion.

No se dispone de informacion sobre la licencia, los idiomas soportados ni la longitud de contexto en los metadatos proporcionados; estos datos deberian consultarse en la model card del modelo base Qwen/Qwen3.8-27B antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.8-27B); detalles no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen/Qwen3.8-27B, un transformer de aproximadamente 27,8 mil millones de parametros. La informacion proporcionada no detalla la composicion del dataset de preentrenamiento, el numero de tokens, ni si el modelo base incorpora tecnicas de alineacion como RLHF o DPO; estos datos deben consultarse en la documentacion de Qwen.

La innovacion principal de esta publicacion es el proceso de cuantizacion QDA, un diseno de cuantizacion en bucle cerrado asistido por agentes LLM, que busca una configuracion W4A16 que preserve la precision del modelo original. El resultado es un checkpoint en formato `compressed-tensors` que se carga en vLLM de forma nativa, sin necesidad de pasos de conversion. El autor reporta que se trata de los mismos ficheros evaluados en el articulo, lo que aporta trazabilidad entre la publicacion y los pesos distribuidos.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base Qwen3.8-27B.
- Razonamiento matematico de competicion: el autor reporta 82,7 % en la combinacion AIME 2025 + HMMT Feb 2026.
- Razonamiento cientifico de nivel avanzado: 81,9 % en GPQA-Diamond.
- Generacion de codigo: 86,3 % en LiveCodeBench v6.
- Seguimiento de instrucciones: 68,2 % en IFBench.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de competicion y demostraciones formales, adecuado por su rendimiento reportado en AIME 2025 y HMMT Feb 2026 (82,7 %), para herramientas educativas o de verificacion matematica.
- Asistencia en investigacion cientifica: con 81,9 % en GPQA-Diamond, es util para responder preguntas de nivel doctorado en fisica, quimica y biologia dentro de pipelines de revision de literatura.
- Generacion de codigo en produccion: su 86,3 % en LiveCodeBench v6 lo hace apto para autocompletado, generacion de tests y refactorizacion en entornos de CI/CD, siempre que se valide el soporte de tool calling en el modelo base.
- Evaluacion de tecnicas de cuantizacion: investigadores pueden usar este checkpoint como referencia reproducible (busqueda `r-01097832`, entrega `h5`) para comparar metodos de cuantizacion W4A16.
- Despliegue con vLLM en infraestructura con memoria limitada: al ocupar 19,6 GB en disco y cargarse directamente en vLLM, permite servir un modelo de 27,8B en GPUs de 24 GB o 48 GB con menor huella que la version en BF16.
- Seguimiento de instrucciones en asistentes: con 68,2 % en IFBench, puede emplearse en tareas de instruccion estructurada donde se requiera un modelo de tamano medio con bajo coste de inferencia.
- Prototipado de agentes con razonamiento multi-paso: aunque no confirmado, el rendimiento en benchmarks de razonamiento sugiere su uso en cadenas de razonamiento, previa validacion empirica.

## Benchmarks y rendimiento

Resultados reportados por el autor del checkpoint, evaluados con vLLM 0.27.1 sobre GH200, batching estatico y muestreo de la model card (`temperature=1.0`, `top_p=0.95`, `top_k=20`, `presence_penalty=0.0`), con semillas 17+j.

| Benchmark | Puntuacion (%) |
|---|---|
| Math (AIME 2025 + HMMT Feb 2026) | 82,7 |
| GPQA-Diamond | 81,9 |
| LiveCodeBench v6 | 86,3 |
| IFBench | 68,2 |
| Promedio | 79,8 |

No se proporcionan resultados del modelo base sin cuantizar ni de alternativas, por lo que no es posible calcular la degradacion introducida por la cuantizacion W4A16 a partir de la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 19,6 GB en disco; en vLLM con W4A16 se requiere espacio adicional para cache KV y activaciones, por lo que se estima un minimo practico de 24 GB de VRAM (estimacion, no confirmada por el autor).
- GPU recomendadas: el autor evaluo sobre GH200; por tamano, tambien son adecuadas A100 40/80 GB, H100 80 GB y L40S 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con margen ajustado; en GPUs de 16 GB no es viable sin cuantizacion adicional de la cache KV.
- Opciones de despliegue: vLLM es el soporte oficial (`vllm serve qda-lab/QDA-Qwen3.8-27B-W4A16`); no se confirma compatibilidad con llama.cpp, Ollama o TGI, dado el formato compressed-tensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| QDA-Qwen3.8-27B-W4A16 | 27,8B | no disponible | no disponible | safetensors (compressed-tensors) | Cuantizado W4A16, promedio 79,8 % en benchmarks del autor |
| Qwen/Qwen3.8-27B (base) | 27,8B | no disponible | no disponible | safetensors | Modelo original sin cuantizar; sin datos de benchmarks en la informacion disponible |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se han proporcionado resultados de benchmarks de modelos alternativos en la informacion disponible, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- La licencia no esta indicada en los metadatos; es imprescindible verificar la licencia del modelo base Qwen/Qwen3.8-27B antes de cualquier uso comercial.
- No se especifican los idiomas soportados; el comportamiento multilingue no esta garantizado.
- No se indica la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- La cuantizacion W4A16 puede introducir degradacion en tareas fuera de los benchmarks reportados; no se ofrece comparacion con el modelo base.
- Los benchmarks han sido reportados por el autor del checkpoint, no por un tercero independiente; deben interpretarse con cautela.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- El numero de descargas (9) y likes (0) es muy bajo, lo que sugiere escasa validacion por parte de la comunidad.
- El modelo esta vinculado a un envio a MLSys 2027 aun en revision; los resultados del articulo no han sido necesariamente revisados por pares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper QDA ("Closed-Loop Quantization Design with LLM Agents", MLSys 2027 submission): no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
