# jashepp/Qwen3.8-27B-2x-ties-merge-brilliance-coder390-GGUF

## Resumen

Qwen3.8-27B-2x-ties-merge-brilliance-coder390-GGUF es un modelo de lenguaje de 27.318.209.536 parámetros (aproximadamente 27,3 mil millones) resultante de la fusión de dos modelos derivados de la familia Qwen3.8. Lo publica el usuario jashepp en Hugging Face bajo licencia Apache 2.0, y se distribuye exclusivamente en formato GGUF cuantizado para inferencia local con llama.cpp y LM Studio. La ficha corresponde a una cuantización y empaquetado de un merge previo, no a un entrenamiento desde cero.

El modelo combina, mediante el método TIES de mergekit, el modelo base DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (orientado a razonamiento, modos instruct y recall de contexto) con nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2 (especializado en generación de código y razonamiento sobre casos límite). El objetivo declarado es preservar la capacidad de razonamiento e instrucción del primero e inyectar la agudeza en código del segundo, manteniendo los modos de razonamiento Turbo Brilliance del modelo base.

Es relevante para desarrolladores que quieran un modelo de ~27B con sesgo hacia código y agentes, ejecutable en hardware de consumo o en una sola GPU profesional, con cuantizaciones que van desde BF16 hasta Q6_K y Q8_0, e incluyendo Multi-Token Prediction (MTP). La información pública disponible es escasa: no hay benchmarks, no se detalla la longitud de contexto efectiva tras el merge y la model card es fundamentalmente una receta de fusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8), merge TIES de dos modelos; sin confirmación explícita de MoE en la información disponible |
| Parametros totales | 27.318.209.536 (~27,3 B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin cifra publicada en esta ficha) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4 (mxfp4/q4 mencionados en tags), todas con MTP e imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (BF16, Q8_0, Q6_K, Q4); repo de 138 GB |
| Metodo de merge | mergekit, TIES (arXiv:2306.01708) |
| Base 1 | DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (density 1.00, base) |
| Base 2 | nerkyor/Qwen3.8-27B-Coder390-EfficientThink-... (density 0.55, mlp 0.22, attention 0.00–0.05) |
| Libreria declarada | transformers (pipeline text-generation) |

## Arquitectura y entrenamiento

El modelo no se entrena: es una fusión de pesos (model merging) mediante el algoritmo TIES de mergekit. La receta ancla el modelo DavidAU como base y tokenizer_source, de modo que embeddings, capas de normalización, lm_head y la mayor parte de las capas de atención permanecen próximos al modelo original. Los deltas del modelo de nerkyor se inyectan principalmente en los bloques mlp intermedios, con una densidad de 0.55 y un peso mlp de 0.22, y una influencia muy ligera sobre atención y routing (0.00–0.05). El resultado busca conservar la estructura de razonamiento e instrucción del base mientras añade precisión en código.

No se publican datos sobre tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO para este merge, ya que no hubo entrenamiento adicional. Los modelos de origen sí incorporan post-entrenamiento (SFT, RLOO y MTP según el nombre del modelo de nerkyor), pero sus detalles no se recogen en esta ficha. La innovación técnica destacable es la preservación de los modos de razonamiento Turbo Brilliance del base y la inclusión de Multi-Token Prediction (MTP) en todas las cuantizaciones GGUF, lo que puede mejorar el throughput en decodificación especulativa con llama.cpp.

## Capacidades

- Generación de texto conversacional y de instrucciones en inglés.
- Razonamiento con cadena de pensamiento (thinking / chain-of-thought) mediante los modos Turbo Brilliance heredados del base.
- Generación de código y resolución de problemas de programación, con énfasis en casos límite gracias al componente Coder390.
- Recall de contexto reforzado según las pruebas A/B del autor.
- Soporte declarado de uso agéntico y tool-use (etiquetas agentic y tool-use), orientado a clientes como Pi, OpenCode o Hermes; para sintaxis de tool-call distintas se sugiere un LoRA super-adapter aparte.
- Seguimiento de instrucciones multi-turno.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Asistente de programación local: el modelo puede generar y depurar código en un IDE o CLI integrado con llama.cpp u Ollama, aprovechando su especialización en código y su ventana de contexto heredada del base para trabajar sobre varios ficheros de un repositorio.
- Agentes autónomos de desarrollo: al soportar tool-use y razonamiento multi-paso, puede encadenar llamadas a herramientas (ejecución de tests, lectura de ficheros, búsqueda) en flujos como OpenCode o Hermes, con la salvedad de ajustar la sintaxis de tool-call mediante el LoRA recomendado.
- Revisión de código y análisis de casos límite: su componente Coder390 está orientado a edge-case reasoning, lo que lo hace útil para auditar pull requests y detectar condiciones de error poco frecuentes.
- Resolución de problemas técnicos con razonamiento explícito: los modos thinking permiten obtener trazas de razonamiento para depuración de lógica compleja o explicación de decisiones de diseño.
- Prototipado en estaciones de trabajo con una sola GPU: las cuantizaciones Q4 y Q6_K permiten ejecutarlo en GPUs de consumo de gama alta, útil para equipos que no pueden usar APIs en la nube por motivos de privacidad.
- Recuperación y síntesis sobre documentación técnica: el recall de contexto reforzado facilita tareas de question-answering sobre manuales o bases de código extensas, siempre que se respete la longitud de contexto efectiva del modelo base.
- Evaluación comparativa de merges: sirve como referencia para investigadores que estudien el efecto de TIES sobre modelos Qwen3.8 de 27B, ya que el autor publica la configuración completa de mergekit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona pruebas A/B con la misma semilla realizadas por el autor, sin cifras ni tablas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere aproximadamente 55 GB (fichero de 54,7 GB); Q8_0 unos 29 GB; Q6_K y Q4 reducen proporcionalmente el requisito, aunque el tamaño exacto de estos ficheros no se detalla en la información disponible.
- GPU recomendadas: para BF16, una A100 80 GB o H100 80 GB; para Q8_0, una RTX 4090 de 24 GB no basta y se necesitan GPUs de 32 GB o más (A100 40 GB, L40S) o reparto entre varias; para Q6_K y Q4 es viable en RTX 4090, RTX 3090 y GPUs de 24 GB con offload parcial a CPU.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 y Q6_K con llama.cpp u Ollama, asumiendo posible offload de capas a RAM.
- Opciones de despliegue: llama.cpp y LM Studio (soportados explícitamente por el formato y las etiquetas), Ollama y otros runners compatibles con GGUF. El repo declara endpoints_compatible.
- Latencia y throughput: no disponibles; la inclusión de MTP puede mejorar la decodificación especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Este merge (jashepp) | ~27,3 B | no disponible | Código + razonamiento, GGUF local | apache-2.0 | GGUF |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | ~27 B (no confirmado) | no disponible | Razonamiento e instrucción, Turbo Brilliance | no disponible en esta ficha | safetensors/GGUF |
| nerkyor/Qwen3.8-27B-Coder390-EfficientThink-... | ~27 B (no confirmado) | no disponible | Código y edge-case reasoning | no disponible en esta ficha | no disponible |
| jashepp/Qwen3.8-27B-4x-ties-merge-... | ~27 B (no confirmado) | no disponible | Código + ciberseguridad + veriloop | apache-2.0 | GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- Modelo solo en inglés; no se garantiza calidad en castellano u otros idiomas.
- Al ser un merge sin benchmarks publicados, el rendimiento real puede variar respecto a los modelos de origen y no está validado de forma independiente.
- Riesgo de alucinación inherente a los modelos de ~27B, especialmente en tareas de código donde puede inventar APIs o funciones inexistentes.
- El modelo base se describe como "uncensored" y "heretic"; conviene revisar el comportamiento en dominios sensibles antes de desplegarlo en producción.
- La longitud de contexto efectiva tras el merge no está documentada; no debe asumirse la del Qwen3.8 original sin verificación.
- La sintaxis de tool-call puede no coincidir con la esperada por algunos clientes agénticos; el autor recomienda un LoRA super-adapter adicional para Pi, OpenCode o Hermes.
- Aunque la licencia es Apache 2.0, deben respetarse las condiciones de los modelos de origen, cuya licencia no se detalla en esta ficha.
- El repo ocupa 138 GB, lo que exige espacio en disco considerable para descargar varias cuantizaciones.
- No hay garantías de soporte ni mantenimiento por parte del autor, que lo describe como su primer merge público.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jashepp/Qwen3.8-27B-2x-ties-merge-brilliance-coder390-GGUF
- Modelo base 1: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- GGUF del modelo base 1: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Modelo base 2: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- LoRA super-adapter recomendado: https://huggingface.co/jashepp/Qwen3.8-27B-super-adapter-Quants-LoRA-GGUF
- Merge de 4 modelos del mismo autor: https://huggingface.co/jashepp/Qwen3.8-27B-4x-ties-merge-brilliance-coder390-cybersecurity-veriloop-GGUF
- Merge de 5 modelos del mismo autor: https://huggingface.co/jashepp/Qwen3.8-27B-5x-ties-merge-brilliance-omnisre-coder390-cybersecurity-veriloop-GGUF
- Colección de modelos Qwen de DavidAU: https://huggingface.co/collections/DavidAU/qwen-36-reg-uncensored-9b-12b-21b-27b-40b
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Paper TIES: https://arxiv.org/abs/2306.01708
- mergekit: https://github.com/arcee-ai/mergekit
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
