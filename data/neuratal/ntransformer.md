# Neuratal/ntransformer

## Resumen

NTransformer no es un modelo preentrenado, sino un framework de investigación e ingeniería en PyTorch desarrollado por Neuratal para construir, entrenar y evaluar transformers decoder-only. El repositorio de Hugging Face actúa únicamente como tarjeta de proyecto y no aloja pesos: cualquier salida de un preset sin entrenar es ruido. Su relevancia radica en que ofrece una implementación completa del stack (arquitectura, inferencia, entrenamiento y checkpointing) sin depender de un tokenizador externo, un model hub ni un servicio de inferencia alojado.

La arquitectura sigue el patrón LLaMA: decoder-only con pre-norm, GQA, RoPE, SwiGLU, RMSNorm y embeddings factorizados con atado de pesos. Incluye rutas para contexto largo de 16K y 32K tokens con gradient checkpointing. Está diseñado específicamente para operar como el modelo de lenguaje de NTokenizer v0.3-polished, con un vocabulario de 262.144 tokens y verificación de checkpoints mediante huella SHA-256.

La versión documentada es v1.4.0, publicada bajo licencia Apache-2.0 (el tokenizador NTokenizer es independiente y usa CC-BY-SA-4.0). El proyecto declara 460 tests y se posiciona explícitamente como herramienta de investigación, no como stack de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-norm, estilo LLaMA (GQA, RoPE, SwiGLU, RMSNorm, embeddings factorizados con pesos atados) |
| Parametros totales | no disponible (no se distribuyen pesos; los presets no están cuantificados en la información) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16K y 32K tokens (rutas de contexto largo con gradient checkpointing) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache-2.0 (NTransformer); NTokenizer es CC-BY-SA-4.0 |
| Formato de pesos | no disponible (no se distribuyen pesos; checkpoints verificados por SHA-256 contra NTokenizer v0.3) |

## Arquitectura y entrenamiento

El bloque arquitectónico es un transformer decoder-only con normalización previa, atención con query grouping (GQA), embeddings posicionales rotatorios (RoPE), activación SwiGLU, RMSNorm y embeddings factorizados con pesos atados. Todo el diseño sigue las convenciones de la familia LLaMA. El framework incorpora rutas específicas para secuencias de 16K y 32K tokens apoyadas en gradient checkpointing, lo que permite experimentar con contexto largo en hardware limitado.

No se ha publicado información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO, porque el proyecto no distribuye pesos entrenados. La integración con NTokenizer es un pilar técnico: el vocabulario es de 262.144 tokens, los IDs se consumen literalmente sin inyección de BOS/EOS, el mapa de tokens especiales es correcto y los checkpoints se verifican mediante huella SHA-256 contra el artefacto NTokenizer v0.3. El proyecto declara 460 tests y un proceso de release con notas honestas.

## Capacidades

- Framework de entrenamiento e inferencia para transformers decoder-only en PyTorch.
- Soporte de contexto largo (16K y 32K tokens) con gradient checkpointing.
- Integración nativa con NTokenizer v0.3-polished (vocabulario de 262.144 tokens, IDs verbatim, sin BOS/EOS inyectados).
- Checkpointing con verificación de integridad por SHA-256.
- Idiomas declarados: turco e inglés.
- No incluye pesos preentrenados: no hay generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente disponibles de fábrica.
- No se documentan modos de thinking, visión ni audio.

## Casos de uso

- Investigación en arquitecturas decoder-only: permite reproducir y modificar bloques GQA, RoPE, SwiGLU y RMSNorm sin depender de implementaciones externas, útil para estudiar el efecto de cada componente en el entrenamiento.
- Experimentación con contexto largo: las rutas de 16K y 32K con gradient checkpointing permiten probar estrategias de entrenamiento en secuencias largas en hardware de una sola máquina.
- Desarrollo de pipelines de tokenización: la integración estricta con NTokenizer (IDs verbatim, SHA-256, mapa de tokens especiales) sirve para validar extremo a extremo un tokenizador de vocabulario grande antes de escalar el entrenamiento.
- Formación y docencia: el repositorio con 460 tests y notas de release honestas constituye un material didáctico para entender el ciclo completo de un transformer, desde la arquitectura hasta el checkpointing.
- Prototipado de infraestructura de entrenamiento: el framework cubre arquitectura, inferencia, entrenamiento y checkpointing, lo que permite montar un stack mínimo sin servicios alojados ni model hubs.
- Base para proyectos propios de preentrenamiento: un equipo que quiera entrenar su propio modelo desde cero en turco e inglés puede partir de este código y de NTokenizer en lugar de adaptar un modelo ya preentrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las cifras de rendimiento son medidas en la máquina de desarrollo y no deben tratarse como mediciones representativas de hardware amplio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos ni presets cuantificados publicados).
- GPU recomendadas: no disponible; la model card solo indica que el soporte multi-GPU/NCCL no está verificado en el hardware de desarrollo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el proyecto es un framework PyTorch propio.
- Latencia y throughput: no disponibles; las únicas cifras existentes son mediciones de la máquina de desarrollo, sin validez general.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Pesos disponibles |
|---|---|---|---|---|---|
| NTransformer v1.4.0 | Framework de entrenamiento (decoder-only) | no disponible | 16K / 32K | Apache-2.0 | No |
| nanoGPT | Framework de entrenamiento (decoder-only) | no disponible (configurable) | no disponible | MIT | No |
| litgpt | Framework de entrenamiento e inferencia | no disponible (configurable) | variable según preset | Apache-2.0 | No (carga modelos externos) |
| LLaMA-style reference implementations | Referencia arquitectónica | no disponible | variable | variable | No |

La comparación es estructural, no de rendimiento: NTransformer compite con frameworks de entrenamiento, no con modelos preentrenados. No se dispone de datos de benchmarks para comparar calidad.

## Limitaciones y advertencias

- No se distribuyen pesos entrenados: el modelo no genera texto útil sin un entrenamiento previo.
- Orientado a investigación; el autor declara explícitamente que no es soporte de producción.
- El soporte multi-GPU/NCCL no está verificado en el hardware de desarrollo.
- Las cifras de rendimiento son mediciones de una sola máquina de desarrollo y no deben extrapolarse.
- Idiomas limitados a turco e inglés según los metadatos; no se documenta cobertura multilingüe adicional.
- Riesgo de alucinación y sesgos: no evaluables sin pesos entrenados.
- La licencia Apache-2.0 permite uso comercial del código, pero NTokenizer (CC-BY-SA-4.0) impone condiciones distintas y debe revisarse por separado.
- No se documentan procesos de alineación (RLHF/DPO) ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/Neuratal/ntransformer
- Repositorio GitHub: https://github.com/Neuratal/NTransformer
- README del proyecto: https://github.com/Neuratal/NTransformer/blob/master/README.md
- Release v1.4.0: https://github.com/Neuratal/NTransformer/releases/tag/v1.4.0
- NTokenizer: https://huggingface.co/Neuratal/ntokenizer
- Sobre Neuratal: https://neuratal.com/about
- Sitio de Neuratal: https://neuratal.com
