# ai4ug/pearl-chat-350m-base

## Resumen

Pearl-chat-350m-base es un modelo de lenguaje monolingüe en luganda (código ISO `lug`), desarrollado por el colectivo ai4ug, orientado a generación de texto en esa lengua minoritaria de Uganda. Con 354.480.640 parámetros (aproximadamente 354M), se posiciona en la gama de modelos pequeños, pensados para despliegue eficiente y para servir como base de un pipeline conversacional ("chat") que presumiblemente se completará con ajuste fino posterior.

El modelo está implementado en Flax/JAX y publicado en formato safetensors, con atención de ventana deslizante (sliding-window attention) y atención de consultas agrupadas (grouped-query attention, GQA). Se entrenó sobre el dataset `ai4ug/luganda_pretrain_v5`, lo que indica un enfoque de preentrenamiento monolingüe centrado en un corpus específico de luganda. La licencia es Apache 2.0, lo que permite uso comercial, aunque el acceso al repositorio está restringido y requiere aceptar condiciones en Hugging Face.

Su relevancia actual radica en la escasez de modelos abiertos dedicados a lenguas de bajos recursos: la mayoría de los LLM cubren bien inglés y un puñado de idiomas mayoritarios, mientras que el luganda queda marginado. Un modelo de 354M con contexto razonable y licencia permisiva facilita investigación lingüística, desarrollo de asistentes locales y experimentación con técnicas de adaptación en entornos con recursos computacionales limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con sliding-window attention y grouped-query attention (GQA); implementación en Flax/JAX |
| Parametros totales | 354.480.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | luganda (`lug`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Flax); repo de 1,4 GB |

## Arquitectura y entrenamiento

La información disponible indica una arquitectura transformer decoder-only con dos decisiones técnicas concretas: sliding-window attention, que limita el coste de atención a una ventana local y reduce el cómputo en secuencias largas, y grouped-query attention, que comparte claves y valores entre varios cabezales de consulta para disminuir el uso de memoria en la caché KV durante la inferencia. La implementación está en Flax (JAX), lo que la hace adecuada para entrenamiento e inferencia en TPU y para pipelines de investigación con diferenciación automática sobre hardware acelerado. No se especifican el número de capas, dimensiones ocultas, número de cabezales ni el tamaño de la ventana deslizante.

El entrenamiento se realizó sobre el dataset `ai4ug/luganda_pretrain_v5`, un corpus monolingüe de luganda. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus, ni si hubo fases de instrucción, RLHF o DPO. El nombre "chat" en el identificador sugiere que el modelo se concibe como base de un asistente conversacional, pero al tratarse de una variante "base" no se documenta ajuste por instrucciones.

## Capacidades

- Generación de texto en luganda: continuación de texto y generación libre en el idioma objetivo.
- Modelo base: no se documenta ajuste por instrucciones ni modo de razonamiento explícito ("thinking mode").
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: monolingüe en luganda; no se documenta transferencia a otros idiomas.
- Capacidades especiales (visión, audio, código): no disponibles.
- Eficiencia de atención: sliding-window attention y GQA reducen el coste de inferencia en secuencias largas y la memoria de la caché KV.

## Casos de uso

- Asistente conversacional en luganda: al ser una variante "base" pensada para chat, sirve como punto de partida para ajuste fino supervisado con diálogos en luganda, aprovechando su licencia Apache 2.0 y su tamaño reducido para iterar rápidamente.
- Investigación en lenguas de bajos recursos: permite estudiar el efecto de arquitecturas modernas (GQA, sliding-window) en un idioma con pocos recursos, comparando con modelos multilingües de mayor tamaño.
- Generación aumentada de datos: puede producir texto sintético en luganda para aumentar corpus de entrenamiento de modelos mayores o para tareas de aumento de datos en NLP local.
- Educación y preservación lingüística: generación de material de lectura, ejercicios o resúmenes en luganda para plataformas educativas ugandesas con infraestructura limitada.
- Despliegue en hardware modesto: con ~354M parámetros, es viable en GPUs de consumo (por ejemplo, RTX 3060/4060) o incluso en CPU para inferencia por lotes, lo que facilita prototipos en entornos con poco presupuesto.
- Evaluación de técnicas de adaptación: al ser un modelo base pequeño y monolingüe, resulta útil como banco de pruebas para LoRA, cuantización y decodificación especulativa antes de escalar a modelos mayores.
- Traducción asistida luganda-inglés: combinado con un modelo multilingüe grande como traductor inverso, puede emplearse en sistemas de pivotaje o como generador del lado luganda en pipelines híbridos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: ~1,4 GB de pesos (354M × 4 bytes), más caché KV y activaciones; en la práctica, 2-3 GB.
- VRAM estimada en FP16/BF16: ~0,7 GB de pesos; con overhead, 1,5-2 GB.
- VRAM estimada en cuantización de 8 bits: ~0,35 GB de pesos; con overhead, ~1 GB.
- VRAM estimada en cuantización de 4 bits: ~0,18 GB de pesos; con overhead, ~0,5-1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100, H100 son sobradas. Cabe en GPUs de consumo y en muchas iGPU.
- Despliegue: al estar en Flax/JAX, el camino natural es `jax`/`flax` con `jax.jit`; para servidores, se puede exportar a safetensors y cargar con frameworks compatibles. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles; por el tamaño, se espera decodificación en el orden de decenas a cientos de tokens por segundo en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ai4ug/pearl-chat-350m-base | 354M | no disponible | luganda | Apache 2.0 | Gated en HF |
| Modelos multilingües pequeños tipo mT5-small / BLOOM-560M | 300M-560M | 512-2048 | decenas de idiomas (luganda marginal) | Apache 2.0 / BigScience RAIL | Abiertos |
| Modelos monolingües africanos pequeños (p. ej. variantes tipo AfroLM / SERENGETI) | 100M-1B | variable | lenguas africanas | variable | variable |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad; cualquier afirmación sobre calidad relativa requeriría benchmarks que no se han publicado.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones documentado: no debe esperarse un comportamiento conversacional fiable sin un paso de fine-tuning.
- Sesgos: al entrenarse sobre un corpus monolingüe específico (`luganda_pretrain_v5`), puede reflejar sesgos de la fuente (registro, variedad dialectal, temas sobrerrepresentados) y carecer de cobertura de variedades del luganda no presentes en el corpus.
- Alucinación: como todo modelo generativo de tamaño pequeño, tiende a inventar hechos, nombres y cifras; no es adecuado para consultas factuales sin verificación.
- Contexto e idioma: monolingüe en luganda; cualquier uso en otros idiomas producirá salidas degradadas. La longitud de contexto no está documentada, por lo que no se puede garantizar el manejo de conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face; conviene revisar los términos adicionales del repositorio.
- Producción: sin benchmarks ni documentación de cuantización, el despliegue en producción requeriría evaluación propia; además, la librería Flax/JAX puede no integrarse con los stacks de serving más habituales (vLLM, TGI) sin conversión.
- Fecha de creación futura (2026-11-14) en los metadatos: verificar la vigencia del repositorio y posibles actualizaciones antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/ai4ug/pearl-chat-350m-base
- Dataset de preentrenamiento: https://huggingface.co/datasets/ai4ug/luganda_pretrain_v5
- Perfil del autor: https://huggingface.co/ai4ug
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
