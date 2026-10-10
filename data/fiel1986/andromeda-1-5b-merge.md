# fiel1986/Andromeda-1.5B-Merge

## Resumen

Andromeda-1.5B-Merge es un modelo de lenguaje de 1.543.714.304 parametros (~1,54 B) creado por el usuario fiel1986 mediante un merge de la familia Qwen2.5 de 1.5 B. No es un modelo entrenado desde cero, sino una fusion de pesos de tres variantes instruct de Qwen2.5: la generalista (Qwen2.5-1.5B-Instruct, 50% del peso), la especializada en codigo (Qwen2.5-Coder-1.5B-Instruct, 30%) y la especializada en matematicas (Qwen2.5-Math-1.5B-Instruct, 20%).

El modelo busca combinar en un unico checkpoint denso las capacidades de chat, programacion y razonamiento matematico de sus tres modelos base, evitando tener que mantener y enrutar tres modelos separados. Para ello emplea el metodo DARE_TIES, una tecnica de merging que poda y reescala tareas de los deltas de cada modelo antes de combinarlos, reduciendo las interferencias entre capacidades.

Es relevante ahora por su tamano reducido, que permite ejecucion en hardware de consumo y en el borde, y por heredar la arquitectura Qwen2, ampliamente soportada por herramientas de inferencia (llama.cpp, vLLM, TGI). La licencia Apache 2.0 y la disponibilidad en float16 facilitan su adopcion comercial, aunque el repositorio publica cero descargas y cero likes en el momento de redactar esta ficha, por lo que carece de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; la familia Qwen2.5-1.5B soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | pesos publicados en float16 (safetensors); no se incluyen GGUF ni cuantizaciones precalculadas en el repositorio |
| Idiomas soportados | en, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y sesgos QKV, la misma familia empleada por Qwen2.5. Al tratarse de un merge, no hay un proceso de preentrenamiento propio sobre tokens nuevos, sino una combinacion de los pesos ya entrenados por Alibaba en los tres checkpoints de origen.

El metodo declarado es DARE_TIES con densidad 0,8 (es decir, un dropout del 20% de los deltas), pesos [0,5, 0,3, 0,2] y tipo de dato float16. DARE elimina y reescala una fraccion de los parametros delta de cada tarea antes de fusionarlos, y TIES resuelve los conflictos de signo entre modelos mediante una seleccion de magnitud y un promedio de signos coherentes. No se documentan en la model card datos de entrenamiento adicional, uso de RLHF/DPO posterior al merge ni innovaciones tecnicas propias mas alla del propio procedimiento de fusion.

## Capacidades

- Generacion de texto conversacional en ingles y espanol, heredada de Qwen2.5-1.5B-Instruct.
- Generacion de codigo en multiples lenguajes de programacion, procedente del componente Coder.
- Razonamiento matematico y resolucion de problemas aritmeticos y algebraicos, procedente del componente Math.
- Seguimiento de instrucciones en formato instruct (chat multi-turno).
- Soporte de tool calling / function calling: no confirmado de forma explicita en la model card; los modelos base Qwen2.5-Instruct si lo soportan, pero el merge no garantiza que se preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para este merge.
- Capacidades multilingues limitadas: la model card declara unicamente en y es.
- Modo thinking o vision: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente de chat local: el modelo puede desplegarse en un portatil o mini-PC con una GPU modesta para mantener conversaciones multi-turno en ingles y espanol, ya que su tamano de 1,54 B permite inferencia en tiempo real sin conexion.

- Generacion de codigo en entornos con restricciones de privacidad: al ejecutarse en local, puede integrarse en un IDE o en un servidor interno para sugerir funciones, completar bloques y explicar codigo sin enviar el codigo fuente a servicios externos.

- Apoyo a tareas matematicas de nivel educativo: el componente Qwen2.5-Math permite resolver ejercicios de aritmetica, algebra y problemas de enunciado, util como tutor automatizado o para generar conjuntos de ejercicios.

- Extraccion y clasificacion de informacion: puede usarse en pipelines de procesamiento de documentos para resumir, etiquetar o extraer campos, aprovechando su bajo coste de inferencia para procesar volumenes altos de texto.

- Chatbot de atencion al cliente embebido: al poder desplegarse en el borde o en servidores de bajo coste, es adecuado para respuestas frecuentes y enrutado basico en ingles y espanol, con la salvedad de que no hay datos de calidad publicados.

- Base para fine-tuning de dominio: su licencia Apache 2.0 y su tamano permiten ajustarlo con LoRA o QLoRA sobre datos propios en una unica GPU de consumo para especializarlo en un vertical concreto.

- Prototipado rapido y experimentacion: servir como modelo de referencia para comparar estrategias de merging y cuantizacion, dado que publica la receta completa (DARE_TIES, densidad y pesos) de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y el repositorio registra cero descargas y cero likes, por lo que tampoco existe evaluacion de la comunidad.

## Requisitos de hardware

- VRAM estimada en float16 (formato publicado): aproximadamente 3,1 GB de pesos, mas overhead de activaciones y cache KV; en la practica, alrededor de 4 GB.

- VRAM estimada cuantizado: ~1,6 GB en int8, ~0,9-1,1 GB en GGUF Q4_K_M y ~1,7 GB en Q8_0.

- GPU de consumo: cabe holgadamente en tarjetas con 6-8 GB o mas, como RTX 3060, RTX 4060, RTX 2070 o superiores; tambien en GPUs integradas con memoria compartida suficiente.

- GPU profesionales: A100, H100, L40S o A10 sobradamente dimensionadas; el modelo no las requiere.

- CPU y borde: puede ejecutarse en CPU con llama.cpp gracias al bajo numero de parametros, con velocidades dependientes del hardware.

- Opciones de despliegue: Transformers (Hugging Face), vLLM, llama.cpp, Ollama y TGI, todos ellos con soporte para la arquitectura Qwen2. Para GGUF o cuantizaciones habria que generarlas a partir de los safetensors publicados.

- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Andromeda-1.5B-Merge | ~1,54 B | no especificado (base Qwen2.5: 32.768) | Chat + codigo + matematicas (merge) | apache-2.0 | Hugging Face (0 descargas) |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 (131.072 con YaRN) | Chat e instrucciones | apache-2.0 | Hugging Face (oficial) |
| Qwen2.5-Coder-1.5B-Instruct | ~1,54 B | 32.768 (131.072 con YaRN) | Codigo | apache-2.0 | Hugging Face (oficial) |
| Qwen2.5-Math-1.5B-Instruct | ~1,54 B | 32.768 (131.072 con YaRN) | Matematicas | apache-2.0 | Hugging Face (oficial) |

El rendimiento comparativo no esta disponible al no existir benchmarks publicados para el merge; no puede afirmarse que iguale o supere a cada modelo base en su dominio respectivo.

## Limitaciones y advertencias

- Ausencia total de validacion: cero descargas y cero likes, sin benchmarks ni evaluaciones externas. No hay evidencia publica de que el merge funcione mejor que los modelos base.

- Riesgo de degradacion por merging: las tecnicas DARE_TIES pueden producir interferencias entre capacidades; es habitual que un merge pierda rendimiento en alguna tarea respecto a su modelo base especializado, especialmente en codigo y matematicas.

- Alucinacion: al ser un modelo de 1,5 B, la tasa de alucinacion y de errores factuales es alta comparada con modelos mayores; no es adecuado para tareas que requieran precision factual sin verificacion.

- Limitaciones de idioma: la model card declara solo en y es, a pesar de que Qwen2.5 soporte mas idiomas; el rendimiento fuera de esos dos idiomas no esta garantizado.

- Contexto no confirmado: la model card no especifica la longitud de contexto efectiva del merge, por lo que no puede asumirse que conserve los 32.768 tokens de la familia base.

- Tool calling no confirmado: el soporte de function calling depende de que el merge haya preservado esa capacidad de los checkpoints instruct; no esta documentado.

- Licencia: Apache 2.0 permite uso comercial, pero al derivar de modelos Qwen2.5 conviene conservar los avisos de licencia y atribucion correspondientes.

- Entorno de produccion: antes de desplegarlo seria necesario generar cuantizaciones (GGUF, AWQ, GPTQ) y medir latencia y calidad en el caso de uso concreto, ya que no hay artefactos precalculados ni datos de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fiel1986/Andromeda-1.5B-Merge
- Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Qwen2.5-Math-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
- Paper de DARE (Language Models are Super Mario: Absorbing Abilities from Homologous Models as a Free Lunch): https://arxiv.org/abs/2311.03099
- Paper de TIES-Merging (Resolving Interference When Merging Models): https://arxiv.org/abs/2306.01708
- Repositorio mergekit (herramienta habitual para merges con DARE_TIES): https://github.com/arcee-ai/mergekit
