# DavidAU/DeepThought-MOE-8X3B-R1-Llama-3.2-Reasoning-18B-gguf

## Resumen

DeepThought-MOE-8X3B-R1-Llama-3.2-Reasoning-18B es un modelo experimental de tipo Mixture of Experts (MoE) construido por el usuario DavidAU mediante la técnica de fusión (mergekit) de ocho fine-tunes independientes de Llama 3.2 de 3B parámetros, todos ellos orientados a razonamiento y generación de cadenas de pensamiento. El resultado es un modelo con 18.404.944.960 parámetros totales (aproximadamente 18,4B) que activa 4 de sus 8 expertos en cada pasada, ofreciendo un comportamiento dinámico que el autor describe como "24B lógicos en un cuerpo de 18,4B". Se distribuye exclusivamente en formato GGUF, lo que lo hace desplegable en llama.cpp y entornos de consumo.

El modelo está pensado para tareas de razonamiento profundo, resolución de acertijos y problemas lógicos, así como para escritura creativa y generación de ficción. Su principal atractivo es la posibilidad de ajustar manualmente el número de expertos activos entre 1 y 8 según la carga y la calidad deseada, algo poco habitual en modelos MoE empaquetados. Es un prototipo, no un modelo de producción, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia actual radica en su naturaleza híbrida: combina la técnica de merging con una arquitectura MoE de activación parcial y un modo de "pensamiento" heredado de DeepSeek-R1, todo ello sobre una base Llama 3.2 de 3B. Esto lo convierte en un caso de estudio interesante para quienes investigan merges, MoE de bajo coste y razonamiento en modelos pequeños, aunque su fiabilidad dista de la de modelos propietarios o de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (8 expertos Llama 3.2 3B, activación de 4/8 por defecto, configurable 1-8) |
| Parametros totales | 18.404.944.960 (18,4B) |
| Parametros activos | 4 de 8 expertos por defecto (configurable); el autor indica "24B lógicos" |
| Longitud de contexto | 128k (según tags); el autor recomienda configurar al menos 8k-16k en la práctica |
| Tipos de cuantizacion | GGUF (incluye IQ4/Q4 y superiores; cuantizaciones por debajo de IQ4 no publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 68,3 GB) |

## Arquitectura y entrenamiento

El modelo es un MoE construido mediante mergekit a partir de ocho fine-tunes de Llama 3.2 3B, cada uno de ellos con técnicas de razonamiento inyectadas (estilo DeepSeek-R1). Los ocho expertos son: ShiningValiant2, Overthinker, Korean-Bllossom, Instruct-uncensored, Hermes-3, Enigma, COT y BlackSheep, todos ellos versiones "Deep-Reasoning" publicadas por el mismo autor. La fusión produce un modelo de 18,4B parámetros totales que activa 4 expertos por defecto en cada forward pass, con la posibilidad de modificar ese número entre 1 y 8 en tiempo de inferencia, lo que permite un control fino del coste computacional y de la diversidad de la respuesta.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; el autor no documenta estos detalles en la model card. La innovación principal es la combinación de merging multi-experto con un modo de pensamiento profundo heredado de DeepSeek, junto con la activación configurable de expertos, que actúa como un dial de calidad/coste. El autor advierte de que el modelo puede entrar en bucles de razonamiento, producir salidas muy largas (12k+ tokens de pensamiento) o quedarse "pensando sin actuar", por lo que recomienda contextos de 8k-16k y penalización de repetición entre 1,02 y 1,07.

## Capacidades

- Generación de texto general y conversacional en inglés.
- Razonamiento profundo con cadenas de pensamiento largas (modo "thinking" estilo DeepSeek-R1).
- Resolución de acertijos, puzles lógicos y problemas de razonamiento que el autor sitúa por encima de Llama 3.1/3.2 estándar.
- Escritura creativa: ficción, generación de tramas, subtramas, escenas, continuaciones y storytelling.
- Roleplay y escritura de ficción interactiva.
- Brainstorming y generación de ideas.
- Capacidad de producir contenido NSFW/no censurado de forma ocasional (el autor indica que el tono general es PG).
- Control configurable del número de expertos activos (1-8) para ajustar calidad, diversidad y coste.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni multimodalidad.

## Casos de uso

- Resolución de acertijos y puzles lógicos: el modo de pensamiento profundo permite al modelo razonar paso a paso sobre problemas que un Llama 3.2 3B estándar no resolvería; útil en entornos educativos o de ocio.
- Escritura de ficción y generación de tramas: el modelo produce escenas, subtramas y continuaciones con coherencia narrativa, adecuado para autores que necesitan borradores rápidos o lluvia de ideas argumental.
- Roleplay y ficción interactiva: su tolerancia a temperaturas altas (1-2+) y su sesgo creativo lo hacen apto para motores de rol conversacional en local.
- Brainstorming estructurado: con instrucciones detalladas y guardarraíles (número de ideas, longitud), el modelo genera listas de propuestas y las evalúa en sus "pensamientos".
- Prototipado e investigación sobre MoE y merging: sirve como banco de pruebas para estudiar el efecto del número de expertos activos en la calidad y el coste, gracias a su activación configurable.
- Despliegue local en hardware de consumo: al distribuirse en GGUF y tener 18,4B parámetros con activación parcial, puede ejecutarse en equipos con GPU de gama alta para consumidor mediante llama.cpp u Ollama.
- Generación de texto creativo con control de temperatura: útil para experimentar con distintos niveles de "profundidad de pensamiento" ajustando temperatura y número de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas en la model card; solo afirmaciones cualitativas sobre su rendimiento en razonamiento frente a Llama 3.1/3.2.

## Requisitos de hardware

- VRAM estimada: para 18,4B parámetros en GGUF, una cuantización Q4 requiere aproximadamente 11-12 GB de VRAM; Q5 en torno a 13-14 GB; Q8 alrededor de 19-20 GB; FP16 superaría los 36 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4/Q5/Q8 con comodidad; RTX 3090 (24 GB) similar; A100 40/80 GB o H100 para FP16 y contextos largos; GPU de 16 GB (RTX 4080, 4060 Ti 16 GB) pueden ejecutar Q4 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4-Q8; en GPUs de 16 GB con Q4 y contexto reducido; también en CPU con llama.cpp usando RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; no se documenta soporte nativo para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles. Al activar solo 4 de 8 expertos, el coste por token es inferior al de un denso de 18,4B, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepThought-MOE-8X3B-R1-Llama-3.2-Reasoning-18B | 18,4B totales (4/8 expertos activos) | 128k (recomendado 8k-16k) | Apache 2.0 | GGUF | Prototipo, merge de 8 fine-tunes 3B con razonamiento |
| Llama 3.2 3B Instruct | 3B densos | 128k | Llama 3.2 Community License | Safetensors, GGUF | Base de los expertos; mucho más ligero pero sin razonamiento profundo |
| DeepSeek-R1-Distill-Llama-8B | 8B densos | 128k | MIT | Safetensors, GGUF | Razonamiento destilado de R1, más fiable y documentado |
| Qwen2.5-14B-Instruct | 14B densos | 128k | Apache 2.0 | Safetensors, GGUF | Referencia densa de tamaño similar, sin modo thinking nativo |

La comparación directa es difícil porque el modelo es un prototipo de merging sin benchmarks publicados; los alternativos citados tienen documentación y evaluaciones mucho más completas.

## Limitaciones y advertencias

- Modelo prototipo: el autor lo etiqueta explícitamente como "Prototype", sin garantías de estabilidad ni de calidad en producción.
- Bucles de razonamiento: puede repetirse, entrar en "thought loops" o generar solo pensamiento sin acción; requiere intervención manual (detener y pedir "execute the plan").
- Salidas muy largas: puede producir 12k+ tokens de pensamiento, lo que exige contextos amplios y aumenta el coste.
- Sensibilidad a los prompts: prompts cortos provocan bucles; el modelo rinde mejor con instrucciones detalladas y guardarraíles.
- Idiomas: solo inglés documentado; no se garantiza calidad en castellano u otros idiomas.
- Contenido NSFW: puede generar contenido no censurado de forma ocasional; requiere filtros en despliegues públicos.
- Cuantizaciones bajas: por debajo de IQ4/Q4 no están probadas ni publicadas, lo que limita el despliegue en hardware muy ajustado.
- Sin benchmarks: no hay métricas objetivas que respalden las afirmaciones de rendimiento del autor.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Llama 3.2 conviene revisar las condiciones de la licencia base de Meta para los componentes originales.
- Sesgos: al ser un merge de fine-tunes diversos (incluido uno "uncensored"), puede heredar sesgos y comportamientos inconsistentes entre expertos.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/DeepThought-MOE-8X3B-R1-Llama-3.2-Reasoning-18B-gguf
- Modelo base (no GGUF): https://huggingface.co/DavidAU/DeepThought-MOE-8X3B-R1-Llama-3.2-Reasoning-18B
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
- Llama 3.2 (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B
