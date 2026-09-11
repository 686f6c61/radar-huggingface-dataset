# nischay185/konkani-qwen2-1.5b-v3-aligned-dare-ties-grpo

## Resumen

konkani-qwen2-1.5b-v3-aligned-dare-ties-grpo es un modelo de lenguaje de 1.543.268.864 parametros (aproximadamente 1,5 mil millones) desarrollado por el usuario nischay185 y publicado en HuggingFace. No se trata de un entrenamiento desde cero, sino de una fusion (merge) de pesos generada con la herramienta mergekit: el modelo toma como base nischay185/konkani-qwen2-1.5b-v3-alignment-full (un Qwen2-1.5B ajustado para konkani) y le incorpora los pesos de npatel121/qwen2-1.5b-grpo-gsm8k, un modelo afinado con GRPO sobre GSM8K para reforzar el razonamiento matematico.

El objetivo declarado por la nomenclatura del repositorio es combinar dos capacidades en un unico checkpoint: la alineacion linguistica y conversacional en konkani del modelo base, y la habilidad de resolucion de problemas aritmeticos aportada por el modelo entrenado con GRPO. La tecnica empleada es DARE TIES (arxiv:2311.03099), que poda y reescala los deltas de tarea antes de combinarlos, reduciendo la interferencia entre pesos cuando se mezclan modelos con especializaciones distintas.

Es relevante ahora porque ilustra una practica habitual en el ecosistema open source: construir modelos especializados de bajo coste mediante fusion de checkpoints en lugar de entrenamiento adicional. Al ser un modelo de 1,5B en bfloat16, el repositorio ocupa 3,1 GB y puede ejecutarse en hardware de consumo. La contrapartida es que no existe informacion publicada sobre evaluacion del merge resultante, ni licencia, ni idiomas declarados en la ficha, por lo que su comportamiento real debe verificarse antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (segun la etiqueta `qwen2` del repositorio) |
| Parametros totales | 1.543.268.864 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la arquitectura Qwen2-1.5B de referencia emplea hasta 32.768 tokens |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en bfloat16); al ser un modelo denso de 1,5B admite cuantizaciones estandar de la comunidad como int8, Q4_K_M, Q5_K_M o Q8_0, aunque el autor no las distribuye |
| Idiomas soportados | no disponibles en la ficha; el nombre del modelo sugiere konkani e ingles, sin confirmacion del autor |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2 en su variante de 1,5B parametros: un transformer decoder-only con atencion por consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y sesgo de atencion QKV, segun la familia de modelos de la que derivan ambos progenitores. No hay innovaciones arquitectonicas propias: el modelo resultante conserva la topologia exacta del checkpoint base, ya que una fusion DARE TIES no modifica la estructura de la red, solo los valores de los tensores.

El entrenamiento de este checkpoint concreto es nulo en sentido estricto: los pesos se obtuvieron combinando dos modelos ya entrenados. Segun la configuracion YAML publicada, se uso `merge_method: dare_ties` con nischay185/konkani-qwen2-1.5b-v3-alignment-full como modelo base, anadiendo npatel121/qwen2-1.5b-grpo-gsm8k con `density: 0.7` y `weight: 0.5`, normalizacion activada (`normalize: true`), mascara int8 (`int8_mask: true`), tokenizador heredado del modelo base y `dtype: bfloat16`. Esto significa que aproximadamente el 70 por ciento de los parametros delta del modelo donante se conservan y se reescalan antes de la combinacion, y que la contribucion relativa del modelo GRPO es del 50 por ciento respecto al base. El donante npatel121/qwen2-1.5b-grpo-gsm8k aporta capacidad de razonamiento aritmetico adquirida mediante optimizacion de politica con GRPO sobre GSM8K. No se documentan en la informacion disponible ni el numero de tokens de entrenamiento de los progenitores, ni la composicion de sus datasets, ni si hubo fases de RLHF o DPO en el modelo base de konkani.

## Capacidades

- Generacion de texto autoregresiva en el estilo de la familia Qwen2, con el tokenizador del modelo base de konkani.
- Razonamiento aritmetico y resolucion de problemas de matematicas de nivel escolar, presumiblemente reforzado por la contribucion del checkpoint afinado con GRPO sobre GSM8K.
- Generacion de cadenas de razonamiento paso a paso (el progenitor GRPO fue entrenado para producir soluciones de problemas tipo GSM8K).
- Alineacion conversacional y cobertura linguistica en konkani, heredadas del modelo base de alineacion.
- Soporte de tool calling o function calling: no disponible, no documentado por el autor.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado; el unico indicio es la capacidad de razonamiento matematico heredada.
- Capacidades multilingues: no disponibles formalmente; el nombre del modelo indica konkani como idioma objetivo, sin lista oficial de idiomas.
- Capacidades especiales (modo thinking explicito, vision, audio): no disponibles; la etiqueta del repositorio solo incluye `text-generation`.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles, segun las etiquetas del repositorio.

## Casos de uso

- Asistencia conversacional en konkani: el modelo puede mantener dialogos multi-turno en este idioma gracias a la base de alineacion; es adecuado para prototipos de atencion al usuario en comunidades konkani, siempre que se valide previamente la calidad real de las respuestas.
- Tutorizacion de matematicas escolares: el componente afinado con GRPO sobre GSM8K permite generar soluciones paso a paso de problemas aritmeticos, util para herramientas educativas que expliquen el procedimiento y no solo el resultado.
- Generacion de datos sinteticos para ajuste posterior: al ser un modelo pequeno y rapido, puede producir corpus de preguntas y respuestas en konkani o de problemas matematicos que despues se usen para afinar modelos mayores.
- Investigacion sobre tecnicas de fusion de modelos: sirve como caso de estudio reproducible de DARE TIES con `density` y `weight` documentados, util para comparar estrategias de merge (linear, SLERP, TIES, DARE TIES) sobre un mismo par de progenitores.
- Despliegue en el borde o en hardware limitado: con 1,5B de parametros en bfloat16 cabe en GPUs de consumo y en equipos con aceleradores modestos, lo que permite prototipos de bajo coste sin depender de APIs externas.
- Base para experimentos de alineacion multilingue de bajos recursos: el modelo es un punto de partida razonable para probar tecnicas de ajuste supervisado o DPO en konkani sin partir de un modelo multilingue grande.
- Normalizacion y reformulacion de texto en konkani: tareas de reescritura, resumen o correccion de estilo en este idioma, siempre que se evaluen las alucinaciones antes de usarlo en flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye evaluaciones del modelo fusionado, y tampoco se aportan mediciones del checkpoint base de konkani ni del modelo donante entrenado con GRPO. No se deben extrapolar resultados de GSM8K u otras pruebas a partir del nombre del progenitor, ya que la fusion DARE TIES no garantiza la transferencia completa de la capacidad del donante.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16 o float16: entre 3,5 y 4,5 GB, teniendo en cuenta los 1,54B de parametros (unos 3,1 GB de pesos) mas el coste de la cache KV y del runtime.
- VRAM estimada en int8: aproximadamente 2 GB de pesos, en torno a 2,5-3 GB de uso real.
- VRAM estimada en cuantizacion de 4 bits (Q4_K_M o similar): aproximadamente 1 GB de pesos, con un uso total cercano a 1,5-2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para bfloat16; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A10, L4 y A100 son suficientes con holgura. Para cuantizacion de 4 bits basta con GPUs de 2-3 GB e incluso con CPU.
- Cabe en GPU de consumo: si, en practicamente toda la gama, incluidas GTX 1650 de 4 GB (en cuantizacion) y cualquier RTX con 6 GB o mas en bfloat16.
- Opciones de despliegue: transformers (libreria declarada en el repositorio, con `dtype: bfloat16`), text-generation-inference (etiqueta `text-generation-inference` presente), endpoints de Inferencia compatibles, y, al ser denso y de arquitectura Qwen2 estandar, vLLM, llama.cpp, Ollama, SGLang o TGI mediante conversion a GGUF o AWQ/GPTQ.
- Latencia y throughput estimados: no disponibles; no se aportan mediciones del autor. Como referencia orientativa no verificada, un modelo denso de 1,5B en una GPU de consumo moderna suele alcanzar decenas o cientos de tokens por segundo, pero no hay dato publicado para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| konkani-qwen2-1.5b-v3-aligned-dare-ties-grpo | 1,54B | no disponible (referencia Qwen2-1.5B: 32.768 tokens) | no disponible | HuggingFace, safetensors bf16 | Fusion DARE TIES de un modelo de konkani y uno de GRPO/GSM8K; sin evaluacion publicada |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens, ampliable a 131.072 con YaRN | Apache-2.0 | HuggingFace, safetensors y GGUF | Modelo oficial multilingue con soporte declarado de tool calling; benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | HuggingFace, safetensors y GGUF | Alternativa de tamano similar con contexto largo y amplia adopcion en el ecosistema |
| Gemma-2-2B-it | 2,61B | 8.192 tokens | Terminos de uso de Gemma | HuggingFace, safetensors | Mayor numero de parametros y contexto mas corto; buen rendimiento en razonamiento segun los benchmarks publicados por Google |

No se dispone de resultados de benchmarks de este checkpoint, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los datos de contexto y licencia de las alternativas corresponden a sus fichas publicas y no a mediciones realizadas sobre este modelo.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no publica ninguna metrica del modelo fusionado, por lo que se desconoce si la capacidad aritmetica del progenitor GRPO se ha preservado y si la alineacion en konkani se ha degradado tras el merge.
- Licencia no disponible: no se especifica licencia en la ficha, lo que impide determinar si el uso comercial esta permitido. Al derivar de Qwen2, es probable que las condiciones de la licencia original (Apache-2.0 en la familia Qwen2) sigan aplicando, pero esto no esta confirmado por el autor.
- Riesgo de alucinacion: al igual que cualquier modelo de 1,5B, la tasa de invencion de hechos es elevada, especialmente en tareas de conocimiento factual y en generacion en idiomas de bajos recursos como el konkani.
- Sesgos conocidos: no documentados. Los sesgos de los progenitores (datos web en ingles y konkani, corpus de matematicas) se heredan sin que exista una evaluacion de sesgo en la ficha.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada por el autor y la lista de idiomas soportados no aparece en la ficha; el soporte real de konkani depende enteramente del modelo base de alineacion, del que no se detalla el corpus.
- Limitaciones de razonamiento: el entrenamiento GRPO del donante se realizo sobre GSM8K, un conjunto de problemas aritmeticos de nivel escolar; no hay evidencia de que la mejora se extienda a razonamiento logico general, matematicas avanzadas o problemas de varios pasos fuera de ese dominio.
- Caveat de produccion: la combinacion DARE TIES puede introducir degradaciones sutiles no detectadas en pruebas superficiales; se recomienda evaluar con un conjunto propio antes de desplegarlo, y comparar contra el modelo base sin fusion para verificar que la mezcla aporta una mejora real.
- Sin garantias de soporte: repositorio con cero descargas y cero likes en el momento de la consulta, sin mantenimiento documentado ni issues abiertos.
- Compatibilidad: las etiquetas indican compatibilidad con text-generation-inference y endpoints, pero no se aporta ninguna prueba de despliegue ni de rendimiento en esos entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nischay185/konkani-qwen2-1.5b-v3-aligned-dare-ties-grpo
- Modelo base de la fusion: https://huggingface.co/nischay185/konkani-qwen2-1.5b-v3-alignment-full
- Modelo donante entrenado con GRPO sobre GSM8K: https://huggingface.co/npatel121/qwen2-1.5b-grpo-gsm8k
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Paper del metodo DARE TIES: https://arxiv.org/abs/2311.03099
- Informacion adicional: no se han encontrado otros enlaces relevantes en la busqueda web proporcionada (los resultados obtenidos no guardan relacion con el modelo).
