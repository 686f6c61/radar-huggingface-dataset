# mohjkhan/anlp-a2

## Resumen

mohjkhan/anlp-a2 es un repositorio de checkpoints asociado a la asignatura ANLP (Assignment 2), publicado por el usuario mohjkhan en HuggingFace. No es un modelo de propósito general ni un lanzamiento de producto: se trata de material de trabajo académico que agrupa los pesos resultantes de tres experimentos independientes sobre arquitecturas transformer decoder-only. Concretamente, cubre variantes de FFN y de mezcla de expertos (MoE), una comparativa de optimizadores y un estudio de estrategias de decodificación.

El modelo base de los experimentos es un transformer decoder-only de tamaño reducido: dimension 512, 8 capas, 8 cabezas de atención, activación SwiGLU, vocabulario de 32.000 tokens, longitud de contexto de 512 tokens y codificación posicional rotatoria (RoPE). Sobre esta base se entrenaron variantes densas y MoE con presupuestos de tokens deliberadamente pequeños (30M tokens en la parte 1 y aproximadamente 38,5M tokens, alrededor de 1x Chinchilla, en la parte 2), lo que lo sitúa como un banco de pruebas para estudiar decisiones de diseño, no como un modelo apto para producción.

Su relevancia es, por tanto, didáctica y de investigación metodológica: permite reproducir comparaciones controladas entre optimizadores (AdamW, MARS, Adafactor, Muon, Sophia) y entre variantes de FFN/MoE bajo un mismo presupuesto de cómputo. No incluye envoltorio de `transformers`/`AutoModel`, sino que requiere cargar los pesos con la clase `Transformer` del repositorio de entrenamiento del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con SwiGLU y RoPE; variantes densas y MoE (mezcla de expertos) en la parte 1 |
| Parametros totales | no disponible (config base: dim 512, 8 capas, 8 cabezas, vocab 32k) |
| Parametros activos | no disponible (aplica solo a las variantes MoE de la parte 1) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los experimentos de la parte 1 usan vietnamita, japones e ingles con direccion VI+JA→EN) |
| Licencia | MIT |
| Formato de pesos | diccionario de `torch.save` con claves `model` (state_dict) y `config` (TransformerConfig); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de dimensiones modestas (dim 512, 8 capas, 8 cabezas, activacion SwiGLU, vocabulario de 32.000 tokens, contexto de 512 tokens y RoPE como codificacion posicional). La parte 1 del trabajo compara variantes de la red feed-forward y de mezcla de expertos (MoE) sobre este mismo esqueleto, entrenadas a un presupuesto igualado de 30M tokens sobre el conjunto `belumind/en-vi-ja-curated-500k-triplets`, con tarea de traduccion VI+JA→EN. La parte 2 reutiliza el modelo denso y lo preentrena sobre `browndw/human-ai-parallel-corpus` hasta aproximadamente 1x Chinchilla (unos 38,5M tokens) para aislar el efecto del optimizador.

La comparativa de optimizadores es el resultado central de la parte 2: AdamW, MARS, Adafactor, Muon y Sophia se evalúan bajo el mismo presupuesto y dataset, reportando perdida de validacion, perplejidad de validacion y BLEU de test. Destacan Muon (BLEU 0,774) y MARS (BLEU 0,768) por delante de AdamW (BLEU 0,703) en calidad de traduccion, aunque AdamW obtiene la mejor perdida de validacion (4,53) y perplejidad (92,7). No se documenta uso de RLHF, DPO ni ajuste por preferencias; el entrenamiento es de tipo supervisado sobre corpus paralelos. La parte 3 no entrena checkpoints propios: evalua estrategias de decodificacion (greedy, top-k, top-p, beam 1/2/4) sobre `EleutherAI/pythia-160m` con el dataset `hamishivi/ROCStories`.

## Capacidades

- Generacion de texto autoregresiva y traduccion automatica (en los experimentos, VI+JA→EN) dentro de un contexto de 512 tokens.
- Modelado de lenguaje a pequena escala: los pesos permiten continuar secuencias y calcular perplejidad, utiles para experimentos controlados.
- Investigacion de arquitecturas: comparacion directa entre variantes densas de FFN y variantes MoE bajo el mismo presupuesto de tokens.
- Investigacion de optimizadores: reproduccion de la comparativa AdamW / MARS / Adafactor / Muon / Sophia.
- Evaluacion de estrategias de decodificacion: la parte 3 documenta greedy, top-k, top-p y beam search (1, 2 y 4) sobre un modelo externo (pythia-160m).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de "pensamiento" explicito.

## Casos de uso

- Reproduccion academica de una comparativa de optimizadores: cargar los checkpoints de la parte 2 y verificar las cifras de perdida, perplejidad y BLEU reportadas, usando el repositorio de entrenamiento del autor como referencia.
- Estudio de mezcla de expertos a pequena escala: usar las variantes MoE de la parte 1 para analizar como se reparte la carga entre expertos y que efecto tiene sobre la perdida con solo 30M tokens de entrenamiento.
- Experimentos de traduccion de bajos recursos: el modelo se entreno explicitamente en direccion VI+JA→EN, por lo que sirve para probar tecnicas de aumento de datos o curriculum learning en escenarios con pocos recursos.
- Banco de pruebas de estrategias de decodificacion: reutilizar la metodologia de la parte 3 (greedy, top-k, top-p, beam) para medir su impacto en tareas generativas cortas.
- Docencia e imparticion de practicas: el tamano reducido (dim 512, 8 capas, contexto 512) permite que estudiantes entrenen y evalúen el modelo en hardware modesto en una sola sesion.
- Analisis de sensibilidad al optimizador: comparar convergencia de Muon frente a AdamW en un presupuesto de ~38,5M tokens para estudiar estabilidad de entrenamiento.
- Pruebas de infraestructura de entrenamiento: por su tamano, es adecuado para validar pipelines de datos, tokenizadores y bucles de entrenamiento antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La parte 2 reporta la siguiente comparativa de optimizadores (mismo modelo denso, mismo dataset y presupuesto, ~38,5M tokens):

| Optimizador | Perdida val | Perplejidad val | BLEU test |
|---|---:|---:|---:|
| adamw | 4,53 | 92,7 | 0,703 |
| mars | 4,62 | 101,1 | 0,768 |
| adafactor | 5,80 | 331,0 | 0,487 |
| muon | 4,62 | 101,9 | 0,774 |
| sophia | 4,94 | 140,0 | 0,532 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras de la tabla anterior son metricas de validacion y traduccion del propio entrenamiento, no evaluaciones estandar de capacidad general.

## Requisitos de hardware

- Por configuracion (dim 512, 8 capas, 8 cabezas, vocab 32k), cada variante entrenada es un modelo pequeno que cabe holgadamente en una unica GPU de consumo; no se proporcionan cifras oficiales de VRAM.
- El repositorio completo ocupa 1,8 GB porque agrega multiples checkpoints de las tres partes, no porque un solo modelo sea grande.
- Cabe en CPU para inferencia y en GPU de consumo (por ejemplo, gama RTX x060 o superior) para entrenamiento y evaluacion; no requiere A100 ni H100.
- Opciones de despliegue: al no ofrecer envoltorio de `transformers` ni formato GGUF/safetensors, la carga se hace con `torch.load` y la clase `Transformer` del repositorio de entrenamiento del autor; no es directamente compatible con vLLM, TGI, Ollama o llama.cpp sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas dentro de la informacion proporcionada. Como referencia metodologica, la parte 3 evalua estrategias de decodificacion sobre `EleutherAI/pythia-160m` (uso como modelo base externo, no como alternativa comparable de este repositorio). No hay datos suficientes para comparar parametros, contexto, rendimiento, licencia y disponibilidad frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Es material academico de una asignatura, no un modelo listo para produccion; no tiene model card orientada a uso final.
- Presupuesto de entrenamiento muy bajo (30M y ~38,5M tokens): la calidad del lenguaje y la traduccion esta lejos de modelos entrenados a escala Chinchilla completa.
- Contexto limitado a 512 tokens, insuficiente para tareas de contexto largo o conversaciones multi-turno extensas.
- No se documentan sesgos, pero al entrenarse sobre corpus paralelos concretos hereda los sesgos y la cobertura de dominio de esos datasets.
- Riesgo de alucinacion alto en generacion abierta por el tamano y el escaso entrenamiento.
- Idiomas: solo se documenta entrenamiento para vietnamita, japones e ingles; no hay soporte multilingue general declarado.
- Formato de pesos no estandar (pickle de `torch.save`), lo que complica el despliegue y plantea riesgos de seguridad al cargar objetos serializados de origen externo.
- Licencia MIT, que permite uso comercial, pero la escasa calidad del modelo lo hace poco recomendable para ello.
- La parte 3 no produce checkpoints propios; los resultados de decodificacion se refieren a pythia-160m, no a este modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mohjkhan/anlp-a2
- Repositorio de codigo de entrenamiento y W&B: no disponible (la model card los menciona sin proporcionar enlaces)
- Dataset parte 1: `belumind/en-vi-ja-curated-500k-triplets` (referencia en la model card, sin URL explícita)
- Dataset parte 2: `browndw/human-ai-parallel-corpus` (referencia en la model card, sin URL explícita)
- Dataset y modelo parte 3: `hamishivi/ROCStories` y `EleutherAI/pythia-160m` (referencias en la model card, sin URL explícita)
- Paper asociado: no disponible
