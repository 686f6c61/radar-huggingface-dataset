# Archsloth/Qwen3-4B-GGUF

## Resumen
Archsloth/Qwen3-4B-GGUF es una recuantización del modelo Qwen3-4B de Alibaba Qwen, publicada por el usuario Archsloth bajo licencia Apache 2.0. No se trata de un modelo nuevo entrenado desde cero, sino de una reconstrucción de los pesos en formato GGUF para llama.cpp con el objetivo de reducir la divergencia respecto al original en bf16 manteniendo exactamente el mismo tamano de fichero que las cuantizaciones de referencia. El modelo base Qwen3-4B es un transformer denso de 4.022.468.096 parametros con modo de razonamiento (thinking) y soporte multilingue.

La propuesta de valor es puramente de eficiencia de cuantizacion: el autor afirma que, a identico tamano de fichero (2.497.280.800 bytes para Q4_K_M), su build reduce la divergencia KL frente al bf16 original entre un 20,9 % y un 54,4 % segun el eje linguistico, comparado con las cuantizaciones de unsloth y con `llama-quantize` estandar. Se distribuyen tres niveles: Q4_K_M (2,50 GB), Q6_K (3,31 GB) y Q8_0 (4,28 GB).

Es relevante para desarrolladores que despliegan LLMs en CPU o en GPUs de consumo con llama.cpp: permite obtener una fidelidad cercana al bf16 en un fichero que cabe en memoria de sistemas modestos, con especial mejoria en coreano, codigo, japones e ingles. El repo acumula 268 descargas y 36 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | hasta 128K tokens (segun model card; el coste de cache a 128K anade ~18 GB) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ko, en, es, ja, zh, ru, ar, hi, th |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo es una cuantizacion del Qwen3-4B original; la arquitectura subyacente es la de un transformer denso decoder-only de Qwen3, con atencion por cabezas agrupadas (GQA) y modo de pensamiento opcional, tal como se define en la familia Qwen3. No se aportan en la informacion disponible detalles sobre el dataset de entrenamiento original (numero de tokens, composicion, fases de RLHF/DPO), por lo que deben consultarse en la model card de Qwen/Qwen3-4B.

La innovacion tecnica de este repo no esta en el entrenamiento sino en el proceso de cuantizacion: el autor emplea calibracion con imatrix y ajuste por divergencia KL (etiquetas `imatrix`, `autoround`, `kl-divergence`), y reporta mediciones con `llama-perplexity --kl-divergence` a contexto 512 sobre 60 chunks para coreano e ingles y 40 para el resto. Afirma que solo tres ejes (coreano, ingles y codigo) forman parte del conjunto de calibracion, mientras que los otros siete actuan como control. Los pesos se generan para funcionar con llama.cpp estandar sin parches.

## Capacidades
- Generacion de texto conversacional multi-turno en ocho idiomas: coreano, ingles, espanol, japones, chino, ruso, arabe, hindi y thai.
- Razonamiento con modo thinking (heredado de Qwen3), activable o desactivable segun el prompt.
- Generacion de codigo, con una divergencia KL especialmente baja en el eje de codigo (0,010191 frente a 0,021659 de unsloth).
- Capacidades matematicas y de razonamiento logico propias de la familia Qwen3-4B.
- Soporte de tool calling y function calling heredado del modelo base (no verificado de forma independiente en esta ficha).
- Ejecucion en CPU pura: el autor mantiene un Space de demostracion que responde sin GPU.
- Compatibilidad con endpoints y servidores tipo OpenAI a traves de llama.cpp (`llama-server`).

## Casos de uso
- Asistente conversacional en local sobre CPU: con Q4_K_M (2,50 GB) y 3.620 MiB de asignacion a 4K de contexto, puede ejecutarse en portatiles sin GPU dedicada usando `llama-server`, ideal para prototipos de chat privados.
- Generacion de codigo en entornos con recursos limitados: la baja divergencia en el eje de codigo permite usarlo como autocompletado o generador de fragmentos en IDE sin depender de la nube.
- Traduccion y atencion multilingue: cubre nueve idiomas con divergencia medida, util para pipelines de traduccion o moderacion de contenido en espanol, arabe, hindi o thai.
- Despliegue en dispositivos edge: el formato GGUF y el soporte de llama.cpp permiten integrarlo en Raspberry Pi, mini-PC o portatiles con 8 GB de RAM para tareas de clasificacion y resumen.
- Servicio de agentes con tool calling: integrado en un orquestador via `llama-server` con API compatible con OpenAI, puede gestionar llamadas a funciones en flujos de automatizacion.
- Evaluacion y comparacion de cuantizaciones: util como referencia para medir el impacto de la cuantizacion en calidad, ya que el autor publica la curva completa de tamano frente a KL.
- Procesamiento de documentos largos: con contexto extendido (hasta 128K, aunque con coste de cache elevado) puede resumir contratos o informes en una sola pasada.

## Benchmarks y rendimiento
Los unicos datos publicados son de divergencia KL frente al bf16 original (menor es mejor), medidos con `llama-perplexity --kl-divergence`, contexto 512.

| Eje | ARCHsloth Q4 | unsloth Q4_K_M | unsloth UD-Q4_K_XL | llama-quantize stock | Mejora vs unsloth |
|---|---|---|---|---|---|
| Coreano | 0,024297 | 0,053290 | 0,046637 | 0,081506 | −54,4 % |
| Ingles | 0,032344 | 0,048443 | 0,043660 | 0,066203 | −33,2 % |
| Espanol | 0,033679 | 0,048234 | 0,043093 | 0,069169 | −30,2 % |
| Japones | 0,034148 | 0,051534 | 0,045666 | 0,075946 | −33,7 % |
| Chino | 0,033088 | 0,048051 | 0,042510 | 0,073735 | −31,1 % |
| Ruso | 0,032852 | 0,043831 | 0,038792 | 0,065831 | −25,0 % |
| Arabe | 0,040871 | 0,053212 | 0,047022 | 0,067085 | −23,2 % |
| Hindi | 0,031617 | 0,039979 | 0,035678 | 0,053405 | −20,9 % |
| Thai | 0,024561 | 0,031301 | 0,027782 | 0,045149 | −21,5 % |
| Codigo | 0,010191 | 0,021659 | 0,018216 | 0,039165 | −52,9 % |

Para Q6_K y Q8_0 el autor reporta: Q6_K coreano 0,004077 frente a 0,006969 de unsloth (−41,5 %) e ingles 0,004022 frente a 0,005765 (−30,2 %); Q8_0 coreano 0,001624 e ingles 0,001371 (la informacion se corta en este punto). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM estimada (asignacion medida con `llama-server -ngl 99`, un usuario): Q4_K_M 3.620 MiB a 4K de contexto y 7.680 MiB a 32K; Q6_K 4.392 MiB y 8.452 MiB; Q8_0 5.322 MiB y 9.382 MiB.
- A 128K de contexto hay que anadir aproximadamente 18 GB a cualquier fila, dominado por la cache KV.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB (Q4_K_M y Q6_K con contexto amplio; Q8_0 con contexto moderado).
- Tambien funciona en CPU pura; el autor mantiene un Space de demostracion sin GPU.
- Despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama y cualquier runtime compatible con GGUF; no se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Archsloth/Qwen3-4B-GGUF | 4,02B | hasta 128K | GGUF (Q4_K_M, Q6_K, Q8_0) | Apache 2.0 | Mejor KL que unsloth al mismo tamano |
| unsloth/Qwen3-4B-GGUF | 4,02B | hasta 128K | GGUF (Q4_K_M, UD-Q4_K_XL, etc.) | Apache 2.0 | Referencia de comparacion; KL superior en los diez ejes medidos |
| Qwen/Qwen3-4B | 4,02B | hasta 128K | safetensors (bf16) | Apache 2.0 | Original sin cuantizar; mayor huella de memoria |
| llama-quantize stock | 4,02B | hasta 128K | GGUF | Apache 2.0 | Peor KL de los cuatro en todos los ejes |

## Limitaciones y advertencias
- Las mejoras de KL proceden de mediciones del propio autor; no hay evaluacion independiente que las confirme.
- La medicion se hace a contexto 512 con 40-60 chunks; no refleja el comportamiento en contextos largos ni en tareas generativas complejas.
- Al ser una recuantizacion, hereda los sesgos y riesgos de alucinacion del Qwen3-4B original, no documentados en esta ficha.
- El modelo base es de 4B parametros: su capacidad de razonamiento y conocimiento factual es limitada frente a modelos mayores.
- El contexto de 128K es teoricamente alcanzable pero requiere ~18 GB adicionales de cache, lo que lo hace inviable en hardware de consumo.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-4B (tambien Apache 2.0 segun la informacion disponible).
- El repo tiene pocas descargas (268) y una unica fuente de validacion; conviene probar el modelo en el caso de uso concreto antes de produccion.
- Algunos campos de la model card se cortan en la informacion proporcionada (Q8_0), por lo que los datos completos deben consultarse en el repositorio.

## Enlaces
- Hugging Face: https://huggingface.co/Archsloth/Qwen3-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Cuantizacion de referencia: https://huggingface.co/unsloth/Qwen3-4B-GGUF
- Coleccion Archsloth: https://huggingface.co/collections/Archsloth/archsloth-models
- Demo en CPU: https://huggingface.co/spaces/Archsloth/Qwen3-4B-CPU
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper referenciado (arXiv:2512.04746): https://arxiv.org/abs/2512.04746
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
