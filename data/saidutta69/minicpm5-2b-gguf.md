# saidutta69/MiniCPM5-2B-GGUF

## Resumen

MiniCPM5-2B-GGUF es la conversion a formato GGUF del modelo base openbmb/MiniCPM5-2B, publicada por el usuario saidutta69. No se trata de un modelo entrenado desde cero, sino de una cuantizacion calibrada con matriz de importancia (imatrix) cuyo objetivo es conservar mas calidad que las cuantizaciones GGUF equivalentes sin calibrar, especialmente en los tipos K-quant e i-quant de tamano reducido.

El checkpoint original tiene 2.516.756.480 parametros (aproximadamente 2,5 mil millones) y esta pensado para generacion de texto conversacional en ingles y chino. La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~2,5B en hardware de consumo mediante llama.cpp u Ollama, con ficheros que van desde ~1,4 GB en IQ4_XS hasta ~2,4 GB en Q8_0.

El repositorio incluye la propia matriz de importancia (`MiniCPM5-2B.imatrix`) generada sobre 100 fragmentos de WikiText-2 train con contexto de 512 tokens, lo que permite reproducir o auditar el proceso de cuantizacion. La licencia declarada es Apache-2.0 y el repo ocupa 9,5 GB en total.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base openbmb/MiniCPM5-2B, convertido con `convert_hf_to_gguf.py` de llama.cpp; no se especifica en la informacion proporcionada) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ4_XS (~1,4 GB), Q4_K_M (~1,5 GB), Q5_K_M (~1,7 GB), Q6_K (~2,0 GB), Q8_0 (~2,4 GB); conversion base en F16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (incluye fichero de matriz de importancia `.imatrix` de 3 MB) |
| Modelo base | openbmb/MiniCPM5-2B |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 9,5 GB |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base (numero de capas, tipo de atencion, funcion de activacion, uso de GQA, etc.). Lo unico verificable es el proceso de conversion y cuantizacion aplicado: se uso `convert_hf_to_gguf.py --outtype f16` con una version reciente de llama.cpp para transformar el checkpoint de HuggingFace a GGUF en precision F16, y despues `llama-quantize --imatrix` para generar las variantes calibradas.

La innovacion tecnica de esta publicacion es el uso de calibracion por matriz de importancia (imatrix). El fichero `MiniCPM5-2B.imatrix` se calculo con `llama-imatrix` sobre 100 fragmentos del split de entrenamiento de WikiText-2 con una longitud de contexto de 512 tokens. Esta matriz pondera cada peso segun su importancia para la perplejidad sobre datos reales, de modo que los tipos IQ4_XS, Q4_K_M y Q5_K_M preservan mejor la calidad que sus equivalentes sin calibrar. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens vistos ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational`, orientado a dialogos multi-turno.
- Multilingue limitado: soporte declarado de ingles y chino; no se declara soporte de castellano ni de otras lenguas.
- Despliegue en local: las cuantizaciones permiten inferencia en CPU y GPU de gama baja mediante llama.cpp, Ollama u otros runners compatibles con GGUF.
- Reproducibilidad de la cuantizacion: la inclusion del fichero `.imatrix` permite regenerar las cuantizaciones calibradas o crear otras nuevas con el mismo sesgo de calibracion.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el artefacto puede servirse a traves de infraestructura de inferencia compatible con HuggingFace.
- Tool calling, function calling, agentes, razonamiento multi-paso, vision, audio y modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local para escritorio: con el fichero Q4_K_M (~1,5 GB) el modelo cabe en cualquier portatil con 8 GB de RAM y puede gestionar dialogos multi-turno en ingles o chino sin conexion, usando Ollama como runtime.
- Prototipado rapido de aplicaciones de chat: el tamano reducido de IQ4_XS (~1,4 GB) permite levantar un endpoint de prueba en segundos y validar prompts, formato de salida y flujos conversacionales antes de pasar a un modelo mayor.
- Procesamiento de texto en el borde (edge computing): en dispositivos con CPU ARM o mini-PC sin GPU dedicada, la cuantizacion Q4_K_M ofrece un equilibrio entre huella de memoria y calidad suficiente para tareas de resumen y clasificacion.
- Filtrado y preprocesado de texto en chino: dado que el modelo declara soporte de chino, se puede emplear para normalizacion, extraccion de entidades simples o generacion de resumenes en pipelines que mezclan contenido en ingles y chino.
- Generacion de texto asistida en herramientas de escritorio: integracion via llama.cpp como biblioteca embebida en editores o aplicaciones de notas para autocompletado y reescritura de parrafos.
- Banco de pruebas para evaluacion de cuantizaciones: al publicar cinco niveles de cuantizacion mas la matriz de calibracion, el repositorio sirve para medir experimentalmente la degradacion de perplejidad entre IQ4_XS, Q4_K_M, Q5_K_M, Q6_K y Q8_0 sobre el mismo modelo.
- Servicio de bajo coste en CPU compartida: Q8_0 (~2,4 GB) permite desplegar una instancia casi sin perdida de precision en un contenedor con poca memoria, util para entornos de staging.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, C-Eval ni de perplejidad comparada entre las distintas cuantizaciones, ni existe informacion de benchmarks en los resultados de busqueda web, que no guardan relacion con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): IQ4_XS ~1,4 GB; Q4_K_M ~1,5 GB; Q5_K_M ~1,7 GB; Q6_K ~2,0 GB; Q8_0 ~2,4 GB. A estas cifras hay que sumar el coste de la cache KV, que depende de la longitud de contexto y del numero de capas del modelo base (dato no disponible).
- GPU de gama consumer: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones IQ4_XS, Q4_K_M y Q5_K_M con margen, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores. Q8_0 requiere alrededor de 3-4 GB de VRAM para contexto corto.
- GPU de centro de datos: no es necesario recurrir a A100, H100 ni L40S para un modelo de 2,5B; estas solo tendrian sentido para servir muchas peticiones concurrentes en paralelo.
- Ejecucion en CPU: las cuantizaciones K-quant e i-quant estan optimizadas para CPU con llama.cpp; IQ4_XS y Q4_K_M son las opciones recomendadas para equipos sin GPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama mediante un Modelfile con `FROM ./MiniCPM5-2B-Q4_K_M.gguf`, y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF directamente de forma nativa, por lo que requeririan el checkpoint original o una conversion adicional.
- Latencia y throughput: no disponibles. El repositorio no publica mediciones de tokens por segundo en ningun hardware concreto.

## Comparativa con modelos similares

Los datos de la columna de MiniCPM5-2B proceden de la informacion proporcionada. Los de las alternativas son valores publicos de referencia para modelos de tamano comparable; no existen comparaciones de rendimiento publicadas entre MiniCPM5-2B y estas alternativas.

| Modelo | Parametros | Contexto | Licencia | GGUF disponible | Benchmarks comparados |
|---|---|---|---|---|---|
| MiniCPM5-2B (este repo) | 2,52B | No disponible | Apache-2.0 | Si, con imatrix | No disponibles |
| Llama 3.2 1B | ~1,24B | 128k | Llama 3.2 Community License | Si | No publicados frente a este modelo |
| Llama 3.2 3B | ~3,21B | 128k | Llama 3.2 Community License | Si | No publicados frente a este modelo |
| Gemma 2 2B | ~2,61B | 8.192 tokens | Gemma Terms of Use | Si, en la practica | No publicados frente a este modelo |
| Phi-3-mini | ~3,8B | 4k o 128k segun variante | MIT | Si | No publicados frente a este modelo |

Diferencias relevantes: el contexto de MiniCPM5-2B no esta documentado en esta ficha, mientras que Llama 3.2 declara 128k y Gemma 2 2B se limita a 8.192 tokens. En licencia, Apache-2.0 es mas permisiva que la licencia comunitaria de Llama 3.2 y que los terminos de Gemma, y equiparable a MIT en permisividad practica. En idiomas, MiniCPM5-2B declara solo ingles y chino, frente a la cobertura mas amplia que declaran las familias Llama, Gemma y Qwen.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino. No hay evidencia de buen rendimiento en castellano, por lo que no es adecuado para produccion en espanol sin una evaluacion previa.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o alineacion del modelo base. Al ser un modelo pequeno, la tasa de respuestas incorrectas o poco matizadas en temas factuales puede ser alta.
- Alucinacion: no hay datos de evaluacion de veracidad. En modelos de ~2,5B es esperable una tasa de alucinacion notable en tareas de conocimiento factual, por lo que conviene usar recuperacion aumentada (RAG) o verificacion posterior.
- Perdida por cuantizacion: las variantes IQ4_XS y Q4_K_M introducen perdida de precision respecto a F16. Aunque la calibracion con imatrix reduce el dano frente a cuantizaciones sin calibrar, no se publican mediciones de perplejidad que cuantifiquen esa perdida.
- Contexto desconocido: al no documentarse la longitud de contexto del modelo base, no se puede garantizar el comportamiento en conversaciones largas ni planificar el uso de cache KV.
- Procedencia del artefacto: el repositorio es de un autor individual (saidutta69) y no del equipo de openbmb. Aunque el tag `base_model` apunta al checkpoint oficial, conviene verificar los hashes de los ficheros GGUF antes de usarlos en produccion.
- Licencia comercial: el repo declara Apache-2.0, que permite uso comercial, pero la responsabilidad de confirmar la licencia del modelo base openbmb/MiniCPM5-2B recae en quien despliega el modelo.
- Adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Sin benchmarks: la ausencia total de resultados publicados impide comparar su calidad con alternativas del mismo rango de parametros.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/saidutta69/MiniCPM5-2B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- llama.cpp (herramientas `convert_hf_to_gguf.py`, `llama-imatrix`, `llama-quantize`): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Nota sobre la busqueda web: los resultados recuperados en la busqueda no guardan ninguna relacion con el modelo (corresponden a servicios de prevision meteorologica) y no aportan documentacion tecnica, papers ni demos adicionales.
