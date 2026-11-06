# NathanHerr/sgs-repl-sgs-01-checkpoints

## Resumen

sgs-repl-sgs-01-checkpoints es una coleccion de checkpoints intermedios y finales resultantes de una replicacion del metodo SGS (descrito en el paper arXiv:2604.20209) sobre el modelo base deepseek-ai/DeepSeek-Prover-V2-7B. El autor, NathanHerr, publica los pesos del "prover" en las iteraciones 4, 9, 19, 29, 39 y 49, y del "conjecturer" en la iteracion 49, fruto de un entrenamiento por self-play de 50 iteraciones y aproximadamente 2 millones de generaciones. El objetivo es la demostracion automatica de teoremas en Lean 4.

El interes de esta publicacion es fundamentalmente de investigacion: permite reproducir y auditar la evolucion del entrenamiento por auto-juego en un prover de 7B parametros, con una tasa de resolucion acumulada del 59,3% sobre el conjunto D_3k. No es un modelo listo para produccion ni un lanzamiento oficial de DeepSeek, sino un artefacto derivado bajo la licencia DeepSeek que hereda las restricciones de uso del modelo original.

El repositorio ocupa 96,7 GB, coherente con almacenar multiples checkpoints de un transformer de 7B en precision completa o alta. La model card no aporta detalles sobre arquitectura interna, contexto o cuantizaciones, por lo que buena parte de las especificaciones se infieren del modelo base o se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de DeepSeek-Prover-V2-7B; no se detalla en la model card) |
| Parametros totales | 7B (segun el modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | DeepSeek License Agreement (license: other, license_name: deepseek-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-Prover-V2-7B, un transformer especializado en demostracion formal, y se somete a un proceso de self-play denominado SGS durante 50 iteraciones, con aproximadamente 2 millones de generaciones en total. El esquema distingue dos roles: un "prover" que genera demostraciones y un "conjecturer" que propone nuevos enunciados, de modo que el sistema se retroalimenta con problemas generados internamente. Los checkpoints del prover corresponden al modelo entrenado al final de cada iteracion indicada, es decir, el que consume la iteracion siguiente.

La model card no especifica el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco detalla innovaciones arquitectonicas propias: las modificaciones son exclusivamente de ajuste fino sobre los pesos originales de DeepSeek-Prover-V2-7B, y se conservan todos los avisos de copyright y atribucion del modelo base.

## Capacidades

- Generacion de demostraciones formales en Lean 4, orientada a la resolucion de teoremas.
- Generacion de conjeturas (rol conjecturer) para alimentar el bucle de self-play.
- Razonamiento matematico formal y construccion de pruebas paso a paso.
- Capacidad de mejora iterativa documentada: la tasa de resolucion acumulada alcanza el 59,3% sobre D_3k tras 50 iteraciones.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el flujo prover/conjecturer es multi-paso por diseno.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en auto-mejora de provers: los checkpoints de las iteraciones 4, 9, 19, 29, 39 y 49 permiten trazar la curva de aprendizaje del self-play y comparar el rendimiento en cada etapa sobre el mismo conjunto de evaluacion.
- Reproduccion de experimentos: junto al dataset NathanHerr/sgs-repl-sgs-01-data, permiten replicar el pipeline SGS y validar la tasa de resolucion reportada del 59,3% sobre D_3k.
- Evaluacion de estrategias de conjetura: el checkpoint del conjecturer de la iteracion 49 sirve para estudiar como la generacion de enunciados afecta a la dificultad y diversidad de los problemas que resuelve el prover.
- Ajuste fino posterior para dominios especificos: al ser un modelo de 7B en safetensors, puede partirse de un checkpoint intermedio para especializar en un subconjunto de matematicas formales con menor coste que entrenar desde cero.
- Docencia e investigacion en demostracion automatica: permite ilustrar el funcionamiento de un prover neuronal sobre Lean 4 en entornos academicos con recursos moderados.
- Estudio de degradacion o colapso en self-play: comparar checkpoints tempranos y tardios ayuda a detectar perdida de diversidad o sobreajuste a las conjeturas autogeneradas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tasa de resolucion acumulada sobre D_3k | 59,3% |
| Iteraciones de self-play | 50 |
| Generaciones totales aproximadas | 2 millones |
| Checkpoints de prover publicados | iteraciones 4, 9, 19, 29, 39, 49 |
| Checkpoints de conjecturer publicados | iteracion 49 |

No se han publicado resultados desglosados por benchmark estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): en torno a 14-16 GB solo para pesos de un modelo de 7B, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto moderado.
- Cuantizacion a 8 bits: aproximadamente 7-8 GB de pesos, viable en GPUs consumer de 12-16 GB.
- Cuantizacion a 4 bits: aproximadamente 4-5 GB de pesos, viable en GPUs consumer de 8 GB o superiores.
- GPUs recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) para inferencia en FP16; RTX 3090, 4080 o 4070 Ti para cuantizaciones de 8 y 4 bits.
- Despliegue: vLLM o TGI para servido con throughput alto; llama.cpp u Ollama si se generan cuantizaciones GGUF a partir de los safetensors. La model card no confirma la existencia de GGUF publicados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sgs-repl-sgs-01-checkpoints | 7B | no disponible | Prover Lean 4 con self-play SGS | DeepSeek License | Hugging Face (repo de 96,7 GB) |
| deepseek-ai/DeepSeek-Prover-V2-7B | 7B | no disponible | Prover Lean 4 base | DeepSeek License | Hugging Face |
| DeepSeek-Prover-V2 (variante mayor) | no disponible | no disponible | Prover Lean 4 | DeepSeek License | Hugging Face |

La comparacion con otros provers formales de la misma categoria (por ejemplo, variantes de Goedel-Prover o Kimina-Prover) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: esta especializado en Lean 4 y su uso fuera de demostracion formal no esta documentado.
- Los checkpoints son versiones modificadas de DeepSeek-Prover-V2-7B y estan sujetos a las restricciones de uso de la DeepSeek License (parrafo 5 y Anexo A); su uso comercial requiere revisar dichas clausulas.
- El autor no documenta sesgos, tasas de alucinacion ni evaluaciones de robustez fuera del conjunto D_3k.
- La tasa del 59,3% es acumulada sobre D_3k y no equivale al rendimiento en problemas nuevos o de mayor dificultad.
- El self-play puede inducir sobreajuste a las conjeturas autogeneradas y reducir la diversidad de demostraciones con las iteraciones.
- El repositorio de 96,7 GB incluye multiples checkpoints; descargar el conjunto completo puede no ser necesario si solo se requiere uno de ellos.
- No se dispone de informacion sobre contexto maximo, idiomas ni cuantizaciones oficiales, lo que limita la planificacion de despliegues en produccion.
- Los checkpoints intermedios no han pasado por una validacion independiente mas alla de la reportada por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NathanHerr/sgs-repl-sgs-01-checkpoints
- Dataset asociado: https://huggingface.co/datasets/NathanHerr/sgs-repl-sgs-01-data
- Paper SGS: https://arxiv.org/abs/2604.20209
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-Prover-V2-7B
- Licencia del modelo: https://huggingface.co/NathanHerr/sgs-repl-sgs-01-checkpoints/blob/main/LICENSE-MODEL
