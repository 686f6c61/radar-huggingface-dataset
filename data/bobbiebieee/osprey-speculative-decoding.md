# BobbieBieee/Osprey-Speculative-Decoding

## Resumen

Osprey-Speculative-Decoding es una coleccion de modelos borrador (drafters) para decodificacion especulativa, publicada por el usuario BobbieBieee y descrita en el articulo "Osprey: Target-agnostic Pre-training Makes Stronger Drafters in Speculative Decoding" (arXiv:2609.09338). La tesis central del trabajo es que preentrenar un borrador de forma agnostica al modelo objetivo y despues adaptarlo produce borradores mas fuertes que entrenarlos desde cero para cada objetivo. El repositorio distribuye borradores ya adaptados a tres modelos objetivo: Qwen3-8B, Llama-3.3-70B-Instruct y MiniMax-M2.5.

Todos los puntos de control parten de la misma columna vertebral preentrenada y agnostica al objetivo: Qwen3-4B podado a 2 capas y preentrenado sobre FineWeb durante 55.000 pasos. Sobre esa base se aplican alineacion de vocabulario, expansion QKV con inicializacion a cero y destilacion on-policy EAGLE-3 para producir el borrador especifico de cada objetivo. El resultado se sirve mediante SGLang con un parche incluido en el repositorio de codigo.

Es relevante ahora porque la decodificacion especulativa es una de las tecnicas estandar para reducir la latencia de inferencia en modelos grandes, y este trabajo propone reutilizar un unico preentrenamiento agnostico para generar borradores de multiples objetivos en lugar de entrenar uno distinto desde cero para cada modelo. El repositorio ocupa 17,5 GB e incluye, ademas de los borradores, la columna vertebral de la etapa 2 y los conjuntos de datos de adaptacion y evaluacion utilizados en el articulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de 2 capas para decodificacion especulativa, estilo EAGLE-3 multcapa (borrador o drafter); columna vertebral derivada de Qwen3-4B podada a 2 capas |
| Parametros totales | no disponible (la base de partida es Qwen3-4B podada a 2 capas; el recuento final por punto de control no se documenta) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el repositorio solo distribuye safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (cada directorio contiene `config.json` y `model.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es la de un borrador de decodificacion especulativa de tipo EAGLE-3. Segun la model card, el repositorio incluye un parche de SGLang (`sglang_patches/`) que anade soporte para borradores EAGLE-3 multicapa y conserva el embedding propio del borrador en el momento de la carga. El proceso de construccion tiene dos etapas: una etapa de preentrenamiento agnostico al objetivo, en la que se parte de Qwen3-4B podado a 2 capas y se preentrena sobre FineWeb durante 55.000 pasos (punto de control `pretrained/qwen3-4b-2layer-fineweb-55k`, entrada del script `scripts/osprey/convert_checkpoint.py`), y una etapa de adaptacion a cada modelo objetivo mediante alineacion de vocabulario, expansion QKV con inicializacion a cero y destilacion on-policy EAGLE-3.

Los datos de adaptacion varian por objetivo. Para Qwen3-8B se publican cinco variantes especializadas (chat, code, commonsense, finance y math), cada una con 65.000 ejemplos de adaptacion. Para Llama-3.3-70B-Instruct se usa Open-PerfectBlend, con 100.000 conversaciones procedentes de `frankleeeee/PerfectBlend-Regenerated-Llama-3.3-70B-Instruct` (1.419.775 conversaciones en total; se numeran en orden de fichero, se mezclan una vez con `random.seed(42)` y se toman las primeras 100.000 como entrenamiento y las 512 siguientes como evaluacion). Para MiniMax-M2.5 se emplean 70.897 prompts de codigo con respuestas regeneradas por el propio MiniMax-M2.5, tomados del subconjunto de codigo de `nvidia/Nemotron-Post-Training-Dataset-v2` (CC BY 4.0). El repositorio tambien publica los cinco conjuntos de evaluacion de 512 prompts (chat, code, commonsense, finance y math) asociados a la Figura 2 y la Tabla 1 del articulo.

## Capacidades

- Decodificacion especulativa: actua como modelo borrador para acelerar la generacion de un modelo objetivo, proponiendo multiples tokens que el objetivo verifica en paralelo.
- Adaptacion multiobjetivo: se distribuyen borradores especificos para Qwen3-8B, Llama-3.3-70B-Instruct y MiniMax-M2.5.
- Especializacion por dominio sobre Qwen3-8B: variantes dedicadas a chat, codigo, sentido comun, finanzas y matematicas.
- Generacion de codigo: variante `qwen3-8b/osprey-code` y borrador para MiniMax-M2.5 adaptado sobre 70.897 prompts de codigo.
- Servido con SGLang: integracion documentada mediante un parche que anade borradores EAGLE-3 multicapa y conserva el embedding propio del borrador.
- Reutilizacion del preentrenamiento: la columna vertebral agnostica al objetivo se publica como punto de partida para adaptar nuevos borradores.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: desplegar el borrador `qwen3-8b/osprey-chat` junto al objetivo Qwen/Qwen3-8B en SGLang para reducir la latencia de generacion en servicios conversacionales, aprovechando los 65.000 ejemplos de adaptacion especificos de chat.
- Generacion de codigo de baja latencia: usar `qwen3-8b/osprey-code` o el borrador `minimax-m25/osprey` sobre modelos objetivo orientados a codigo, de modo que un asistente de autocompletado en el IDE reduzca el tiempo hasta el primer token util.
- Reduccion de coste por token en despliegues grandes: emplear `llama33-70b/osprey` con meta-llama/Llama-3.3-70B-Instruct para aumentar el throughput efectivo por GPU, ya que el borrador solo anade una cabeza pequena de 2 capas sobre el coste del objetivo.
- Investigacion en decodificacion especulativa: reutilizar los conjuntos de evaluacion de 512 prompts (chat, code, commonsense, finance y math) y la columna vertebral de la etapa 2 para reproducir los experimentos de la Figura 2 y la Tabla 1 del articulo.
- Creacion de nuevos borradores para otros objetivos: partir de `pretrained/qwen3-4b-2layer-fineweb-55k` y aplicar el flujo del script `scripts/osprey/convert_checkpoint.py` para adaptar un borrador a un modelo objetivo distinto de los tres publicados.
- Servicios con requisitos estrictos de latencia: en aplicaciones interactivas donde el tiempo de respuesta condiciona la experiencia (chat en vivo, asistentes de voz con LLM subyacente), el borrador permite verificar varios tokens por paso del objetivo.
- Analisis de dominios especializados: usar las variantes `osprey-commonsense`, `osprey-finance` y `osprey-math` para comparar el impacto de la especializacion del borrador en la tasa de aceptacion por dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card hace referencia a la Figura 2 y la Tabla 1 del articulo (para los conjuntos de evaluacion de 512 prompts de Qwen3-8B) y a las Tablas 2 y 3 (para los conjuntos de MiniMax-M2.5), asi que los valores deben consultarse directamente en el articulo arXiv:2609.09338.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El borrador se deriva de Qwen3-4B podado a 2 capas, por lo que su huella es muy inferior a la de un modelo de 4B completo, pero no se publican cifras concretas de memoria.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por el tamano reducido del borrador (2 capas) es razonable esperar que quepa en GPUs de consumo, si bien el requisito dominante es la memoria necesaria para el modelo objetivo que acompana al borrador.
- Opciones de despliegue: SGLang es el unico entorno documentado, y requiere el parche incluido en `sglang_patches/` del repositorio de codigo, que anade borradores EAGLE-3 multicapa y conserva el embedding propio del borrador al cargar. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Osprey-Speculative-Decoding | Borrador EAGLE-3 con preentrenamiento agnostico al objetivo y adaptacion por objetivo | no disponible (base Qwen3-4B podada a 2 capas) | no disponible | MIT | HuggingFace, servido con SGLang parcheado |
| EAGLE-3 (metodo de referencia) | Borrador entrenado especificamente por objetivo | no disponible | no disponible | no disponible | Segun la publicacion original de EAGLE-3 |
| Otros borradores de decodificacion especulativa (Medusa, Lookahead y similares) | Distintas aproximaciones a la propuesta de tokens | no disponible | no disponible | no disponible | Diversas |

La comparativa cuantitativa con alternativas no esta disponible en la informacion proporcionada. La diferencia conceptual que destaca la model card es que Osprey reutiliza un unico preentrenamiento agnostico al objetivo para derivar borradores de varios modelos, en lugar de entrenar cada borrador desde cero.

## Limitaciones y advertencias

- El borrador no genera texto de forma autonoma: debe combinarse con el modelo objetivo correspondiente (Qwen3-8B, Llama-3.3-70B-Instruct o MiniMax-M2.5) y su funcion es proponer tokens que el objetivo verifica.
- La calidad de la decodificacion especulativa depende de la tasa de aceptacion del borrador; un desajuste de distribucion con el objetivo reduce la ganancia de velocidad.
- El despliegue documentado exige SGLang con el parche del repositorio; no se documenta compatibilidad con otros motores de inferencia.
- El repositorio solo distribuye tres adaptaciones concretas a objetivos; usar el borrador con otro modelo objetivo requiere ejecutar el flujo de adaptacion.
- No se publican resultados de benchmarks numericos en la informacion disponible, por lo que no se puede verificar la ganancia de velocidad ni la calidad frente a alternativas.
- No hay informacion sobre idiomas soportados, sesgos, tasas de alucinacion ni comportamiento fuera de los dominios de adaptacion (chat, codigo, sentido comun, finanzas, matematicas).
- Los conjuntos de adaptacion de Llama-3.3-70B-Instruct y MiniMax-M2.5 contienen respuestas regeneradas por los modelos objetivo, de modo que heredan sus posibles sesgos y errores.
- La licencia MIT permite uso comercial, pero se debe respetar por separado la licencia de los modelos objetivo (Qwen3-8B, Llama-3.3-70B-Instruct y MiniMax-M2.5) y de los conjuntos de datos de origen, incluido el subconjunto de Nemotron-Post-Training-Dataset-v2 bajo CC BY 4.0.
- La fecha de creacion del repositorio indicada en la metadata (2026) y el numero de descargas y likes (0) sugieren que se trata de una publicacion reciente y con poca validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BobbieBieee/Osprey-Speculative-Decoding
- Articulo (paper): https://arxiv.org/abs/2609.09338
- Codigo: https://github.com/LeanModels/Osprey
- Dataset de adaptacion para Llama-3.3-70B-Instruct: https://huggingface.co/datasets/frankleeeee/PerfectBlend-Regenerated-Llama-3.3-70B-Instruct
- Dataset de origen de los prompts de codigo para MiniMax-M2.5: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Modelo objetivo Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Modelo objetivo Llama-3.3-70B-Instruct: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Modelo objetivo MiniMax-M2.5: https://huggingface.co/MiniMaxAI/MiniMax-M2.5
