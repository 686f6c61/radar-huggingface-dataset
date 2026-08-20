# izlley2/LLM0to1-10b-step83000

## Resumen

LLM0to1-10b-step83000 es un checkpoint intermedio de preentrenamiento de un modelo de lenguaje bilingüe coreano-inglés de aproximadamente 10 000 millones de parámetros, desarrollado por el usuario izlley2. Se trata de un modelo base, entrenado desde cero, sin ningún tipo de ajuste por instrucciones o chat, y publicado como archivo de investigación para documentar el progreso del entrenamiento. Su relevancia radica en que permite estudiar la dinámica de preentrenamiento de un LLM de tamaño medio con una arquitectura moderna (SmolLM3) y un esquema de optimización híbrido poco habitual (Muon + AdamW).

El modelo utiliza la arquitectura SmolLM3ForCausalLM, con 44 capas, 4096 unidades ocultas, atención con GQA (32 cabezas de consulta y 8 de clave/valor) y un contexto de 4096 tokens. El tokenizador es propio, con un vocabulario de 160 000 entradas. Se entrenó con aproximadamente 175 000 millones de tokens en un esquema de programación de tasa de aprendizaje WSD, y este checkpoint corresponde a la fase estable antes de la caída de LR, por lo que la calidad de generación es baja y no está pensado para uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM3ForCausalLM (transformer decoder) |
| Parametros totales | 10 354 003 968 (10,35B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Research-only (uso exclusivo para investigacion) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolLM3, un transformer decoder con 44 capas, dimension oculta de 4096 y una capa intermedia de 13312. Emplea atencion con GQA (32 cabezas de consulta, 8 de clave/valor, dimension de cabeza 128), normalizacion QK (qk_norm), perdida z-loss para estabilidad y RoPE parcial que se omite cada 4 capas. El tokenizador es propio, entrenado sobre los datos del corpus, con un vocabulario de 160 000 tokens.

El entrenamiento se realizo con el framework nanotron de HuggingFace, utilizando un optimizador hibrido: Muon para matrices 2D y AdamW para embeddings y capas de normalizacion. Se aplico una programacion de tasa de aprendizaje WSD (warmup, stable, decay) con una tasa estable de 2e-4. El lote global fue de 2,1 millones de tokens (512 secuencias de 4096 tokens) y se consumieron aproximadamente 175 000 millones de tokens en total. Este checkpoint corresponde a la fase estable, antes de la fase de decaimiento, por lo que no se ha realizado ninguna etapa de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto en coreano e ingles, aunque con calidad limitada por ser un checkpoint intermedio de preentrenamiento.
- Razonamiento basico derivado del preentrenamiento, sin capacidades avanzadas de razonamiento multi-paso.
- No soporta tool calling ni function calling.
- No soporta agentes ni planificacion de tareas.
- No tiene capacidades multimodales (vision, audio, etc.).
- No dispone de modo de pensamiento (thinking mode) ni de alineacion con preferencias humanas.

## Casos de uso

- Investigacion academica sobre dinamicas de preentrenamiento: el checkpoint permite analizar como evoluciona la representacion linguistica durante la fase estable del entrenamiento, comparando con checkpoints anteriores o posteriores.
- Estudio de tecnicas de optimizacion: al usar un optimizador hibrido Muon+AdamW, es util para investigar el efecto de esta combinacion en la convergencia y la calidad de las representaciones.
- Desarrollo de tokenizadores bilingues: el tokenizador propio de 160 000 entradas puede servir como referencia para disenar vocabularios eficientes para coreano e ingles.
- Fine-tuning posterior: aunque el checkpoint no esta alineado, puede servir como punto de partida para experimentos de ajuste por instrucciones o RLHF, siempre que se respete la licencia de investigacion.
- Evaluacion de metricas de estabilidad de entrenamiento: permite probar metodos de deteccion de divergencia o de perdida z-loss en modelos grandes.
- Comparacion de arquitecturas: al estar basado en SmolLM3, puede compararse con otros modelos de tamano similar para estudiar el impacto de GQA, qk_norm o RoPE parcial en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Dado que es un checkpoint intermedio sin alineacion, no se recomienda su uso para tareas de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 ocupa aproximadamente 20,7 GB solo en pesos. Con overhead de activaciones y cache de atencion para 4096 tokens, se estima un minimo de 24-28 GB de VRAM para inferencia sin cuantizacion.
- GPU recomendadas: para inferencia en bfloat16 se necesitan GPUs con al menos 24 GB de VRAM, como NVIDIA RTX 3090/4090, A10G, A100 (40 GB) o H100. Para entrenamiento o fine-tuning se requieren multiples GPUs con memoria superior.
- En consumer GPU: cabe en una RTX 4090 (24 GB) con cuantizacion a 8 bits o 4 bits, aunque no se proporcionan cuantizaciones oficiales. Sin cuantizacion, no cabe en GPUs de 16 GB.
- Opciones de despliegue: al ser un modelo de transformers, puede cargarse con la libreria transformers, pero no hay confirmacion de compatibilidad con vLLM, llama.cpp, Ollama o TGI. Dado que es un checkpoint de investigacion, no se recomienda su despliegue en produccion.
- Latencia y throughput: no disponibles. Dependera del hardware y de la implementacion.

## Comparativa con modelos similares

No disponible. No se ha proporcionado informacion sobre modelos comparables en la misma categoria (tamano ~10B, bilingue coreano-ingles, preentrenamiento desde cero). No se pueden establecer comparaciones fiables sin datos adicionales.

## Limitaciones y advertencias

- Es un checkpoint intermedio de preentrenamiento, no un modelo final. La calidad de generacion es baja y no es apto para uso directo en aplicaciones.
- No tiene alineacion de seguridad ni ajuste por instrucciones. Puede generar contenido sesgado, toxico o incorrecto.
- La licencia es de uso exclusivo para investigacion (research-only). No se permite uso comercial sin autorizacion explicita.
- Los datos de entrenamiento incluyen corpus coreanos con terminos de uso restrictivos, por lo que cualquier uso comercial requiere verificacion legal previa.
- El contexto maximo es de 4096 tokens, limitado para tareas que requieran ventanas largas.
- No se han publicado benchmarks ni evaluaciones de sesgo, por lo que se desconoce su comportamiento en tareas especificas.
- El tokenizador es propio y puede no estar optimizado para otros idiomas distintos del coreano e ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/izlley2/LLM0to1-10b-step83000
- Checkpoint de nanotron (con estado del optimizador): https://huggingface.co/izlley2/LLM0to1-10b-step83000-nanotron (mencionado en la model card)
- Framework nanotron: https://github.com/huggingface/nanotron
