# angelgodbrokenns/MintGPT-300M

## Resumen

MintGPT-300M es un modelo de lenguaje de tipo GPT-2 entrenado desde cero por el usuario angelgodbrokenns y publicado en Hugging Face. Con 294.420.480 parámetros reales (confirmados en los pesos safetensors), se trata de un transformer decoder-only de 22 bloques, dimensión oculta de 1024 y 16 cabezas de atención, con una ventana de contexto de 512 tokens y un tokenizador BPE a nivel de byte propio. Su orientación declarada es la generación de texto y, más concretamente, la generación de código Python.

El modelo se ha entrenado exclusivamente sobre tres conjuntos de datos de instrucciones y código en Python: `iamtarun/python_code_instructions_18k_alpaca`, `flytech/python-codes-25k` y `espejelomar/code_search_net_python_10000_examples`. La model card advierte explícitamente de que el entrenamiento desde cero no garantiza una generación de código fiable y que la calidad final depende de los pasos de entrenamiento completados, un dato que el autor no especifica.

Su relevancia actual es limitada: se publicó en noviembre de 2026, no acumula descargas ni likes, no declara licencia y no incluye resultados de evaluación. Resulta útil como base experimental para estudiar el comportamiento de modelos pequeños entrenados desde cero en dominios de código, pero no como componente de producción. La búsqueda web no ha devuelto información adicional sobre este modelo; los resultados obtenidos (General Intuition, Biohub) no guardan relación con él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 |
| Parametros totales | 294.420.480 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Bloques transformer | 22 |
| Dimension oculta | 1024 |
| Cabezas de atencion | 16 |
| Tokenizador | BPE a nivel de byte (custom) |
| Tamano del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional al estilo GPT-2, con 22 bloques, dimensión oculta de 1024 y 16 cabezas de atención (64 dimensiones por cabeza), lo que da un total de 294,4 millones de parámetros. Emplea un tokenizador BPE a nivel de byte propio, distinto del tokenizador original de GPT-2, y una ventana de contexto de 512 tokens. No se documentan innovaciones técnicas adicionales como atención lineal, decodificación especulativa o arquitecturas híbridas.

El entrenamiento parte de inicialización aleatoria (from scratch) sobre tres datasets de código Python: instrucciones de código en formato Alpaca (18k ejemplos), un corpus de 25k pares de código Python y 10.000 ejemplos de CodeSearchNet en Python. No se especifica el número total de tokens procesados, la composición exacta del dataset tras el filtrado, ni si se aplicaron fases de ajuste supervisado, RLHF o DPO. La model card indica únicamente que la calidad depende de los pasos de entrenamiento completados, sin aportar la cifra.

## Capacidades

- Generación de texto autoregresiva en inglés, con especialización declarada en código Python.
- Generación de fragmentos de código a partir de instrucciones en formato Alpaca, según los datasets de entrenamiento.
- Completado de código y posibles tareas de traducción entre descripción en lenguaje natural y código, derivadas de CodeSearchNet.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés; no se declara soporte de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación académica con modelos pequeños desde cero: sirve como referencia para estudiar cómo se comporta un GPT-2 de 294M parámetros entrenado únicamente con datos de código Python, comparando curvas de pérdida y calidad de generación frente a modelos preentrenados.
- Generación de fragmentos de código en entornos de prototipado: dado un prompt en inglés con una instrucción de tipo Alpaca, el modelo puede producir borradores de funciones Python que el desarrollador revisa y corrige manualmente.
- Fine-tuning posterior en dominios específicos: al ser un modelo pequeño (2,4 GB en safetensors), puede reentrenarse o ajustarse en una única GPU consumer para tareas de código acotadas, como generación de tests unitarios o docstrings.
- Completado de código en editores con recursos limitados: con 512 tokens de contexto y 294M de parámetros, es viable ejecutarlo en local en CPU o GPU de gama baja para autocompletado de fragmentos cortos.
- Estudio de tokenizadores BPE a nivel de byte en código: el tokenizador propio permite analizar cómo afecta la tokenización a la representación de identificadores y sintaxis Python.
- Base para investigación sobre sesgos y alucinación en modelos pequeños de código: al no haber pasado por RLHF, es un caso de estudio útil sobre los fallos típicos de modelos entrenados solo con ajuste supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos (294,4M × 4 bytes), más overhead de activaciones y caché KV para 512 tokens.
- VRAM estimada en fp16/bf16: aproximadamente 0,6 GB para pesos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,3 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: al ser un modelo estilo GPT-2 en safetensors, es compatible con la librería `transformers` de Hugging Face; para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no documentada por el autor. vLLM y TGI no están verificados para este checkpoint.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 294M parámetros con contexto de 512 tokens, se espera un throughput alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MintGPT-300M | 294,4M | 512 | No disponible | safetensors | Hugging Face |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | safetensors, GGUF | Hugging Face, ampliamente desplegado |
| GPT-2 medium (OpenAI) | 355M | 1024 | MIT | safetensors, GGUF | Hugging Face, ampliamente desplegado |
| CodeParrot small | 110M | 1024 | No disponible | safetensors | Hugging Face |

La comparación se limita a parámetros, contexto y licencia, ya que MintGPT-300M no publica benchmarks que permitan contrastar su rendimiento en generación de código frente a alternativas. Frente a GPT-2 medium (355M), MintGPT-300M es ligeramente más pequeño y tiene la mitad de contexto, pero está especializado en Python. Frente a CodeParrot small (110M), triplica los parámetros, aunque carece de la documentación y el ecosistema de despliegue de este.

## Limitaciones y advertencias

- Entrenamiento desde cero sin garantía de calidad: el propio autor advierte de que el modelo no asegura una generación de código fiable.
- Sin datos de evaluación: no hay benchmarks publicados, por lo que se desconoce su rendimiento real en HumanEval, MBPP o tareas equivalentes.
- Contexto muy corto: 512 tokens limitan las conversaciones multi-turno y la generación de archivos de código extensos.
- Solo inglés: no se declara soporte de castellano ni de otros idiomas.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; además, el autor recomienda verificar las licencias de los datasets de entrenamiento antes de redistribuir el modelo.
- Riesgo de alucinación elevado: al ser un modelo pequeño entrenado solo con ajuste supervisado sobre datasets de código, es probable que genere APIs inexistentes o sintaxis incorrecta.
- Sesgos: no documentados; al entrenarse solo con código Python en inglés, puede reproducir sesgos de estilo y convenciones de los datasets de origen.
- Sin soporte de tool calling ni agentes: no apto para pipelines que requieran function calling.
- Repositorio sin actividad: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni comunidad documentada.

## Enlaces

- Hugging Face: https://huggingface.co/angelgodbrokenns/MintGPT-300M
- Dataset iamtarun/python_code_instructions_18k_alpaca: https://huggingface.co/datasets/iamtarun/python_code_instructions_18k_alpaca
- Dataset flytech/python-codes-25k: https://huggingface.co/datasets/flytech/python-codes-25k
- Dataset espejelomar/code_search_net_python_10000_examples: https://huggingface.co/datasets/espejelomar/code_search_net_python_10000_examples
- Paper de referencia GPT-2 (Radford et al., 2019): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
- Repositorio transformers de Hugging Face: https://github.com/huggingface/transformers
