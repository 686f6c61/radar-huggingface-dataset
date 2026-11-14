# Grounded-Entropy/project-genesis

## Resumen
Project Genesis es un co-procesador geometrico acoplado a modelos de lenguaje causales, desarrollado por Christopher Wiley (Tesseract Spatial Systems LLC) y publicado bajo el identificador Grounded-Entropy/project-genesis. No es un modelo de lenguaje autonomo: es una biblioteca nativa compilada a CUDA (`libgenesis_core.so`) de 0,508 MB que opera en FP64 IEEE-754 y se inserta en linea sobre las activaciones de un modelo anfitrion (Qwen3-8B por defecto, aunque admite otros IDs de Hugging Face). Su proposito declarado es imponer restricciones geometricas sobre variedades de Stiefel y estructuras toroidales/hiperesfericas durante la inferencia, con escalado de memoria O(1) y sin tablas de busqueda discretas de tokens.

El componente tecnico diferencial es el uso de marcos Block-Stiefel de 16 canales precomputados en FP64 para un conjunto cerrado de dimensiones `d_model`, lo que permite acoplarse a arquitecturas de distintos fabricantes (Qwen, Gemma, Llama, Nemotron, Mistral). La model card reporta conservacion de energia radial en el orden de `10^-13` a `10^-15` (epsilon de maquina) y cifras de throughput medidas en una RTX 5080 Blackwell (sm_120). El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

La relevancia del proyecto es experimental: propone un mecanismo de control geometrico externo al modelo en lugar de modificar sus pesos, lo que lo situa en la interseccion entre aprendizaje profundo geometrico, kernels CUDA de precision extendida y tecnicas de intervencion sobre activaciones. No obstante, la informacion publica es escasa en cuanto a evaluacion de calidad de generacion, licencia y composicion del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-procesador geometrico nativo CUDA (Block-Stiefel de 16 canales, estructura toroidal/hiperesferica) acoplado inline a un transformer causal anfitrion |
| Parametros totales | No disponible (el nucleo ocupa 0,508 MB en FP64; los parametros del modelo anfitrion no forman parte del artefacto) |
| Parametros activos | No es MoE; no aplica |
| Longitud de contexto | No disponible (heredada del modelo anfitrion; Qwen3-8B por defecto) |
| Tipos de cuantizacion | No disponible; el nucleo opera en FP64 IEEE-754 nativo |
| Idiomas soportados | No disponible (depende del modelo anfitrion) |
| Licencia | No disponible |
| Formato de pesos | Biblioteca nativa `.so` (`libgenesis_core.so`) mas pesos del host en formato transformers; no se distribuyen safetensors ni GGUF propios |

## Arquitectura y entrenamiento
El componente no es un transformer ni un modelo generativo: es una biblioteca de bajo nivel compilada directamente para CUDA que se engancha a las activaciones de un modelo causal. Internamente utiliza marcos Block-Stiefel de 16 canales precomputados en FP64 para proyectar las representaciones del host sobre variedades geometricas restringidas (toroidales e hiperesfericas), con el objetivo declarado de conservar la energia radial hasta epsilon de maquina. El acoplamiento se realiza en linea, capa a capa, segun un parametro de profundidad (`L5`, `L7`, `L9`) que varia segun la arquitectura del anfitrion.

El repositorio incluye marcos Stiefel precalculados para 20 dimensiones `d_model` concretas: 576, 896, 960, 1024, 1152, 1280, 1536, 2048, 2304, 2560, 2816, 3072, 3584, 3840, 4096, 4608, 5120, 5376, 6144 y 8192. Cualquier modelo anfitrion cuyo `hidden_size` no figure en esa lista lanza un `ValueError` en la inicializacion. No se documenta en la informacion disponible ningun proceso de entrenamiento, dataset, RLHF, DPO ni ajuste fino; el artefacto es un mecanismo de inferencia, no un modelo entrenado. Tampoco se describen innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades
- Intervencion geometrica sobre activaciones de modelos causales: proyecta las representaciones del host sobre marcos Block-Stiefel en FP64.
- Acoplamiento multi-arquitectura: soporta hosts Qwen2.5 (0.5B, 1.5B), Qwen3-8B, Gemma 4 E4B-it, Llama-3.2-3B-Instruct, Nemotron-Mini-4B-Instruct y Mistral-7B-Instruct-v0.3, entre otros, siempre que su `d_model` este en el atlas Stiefel.
- Conservacion de energia radial verificada en el rango `1.42e-14` a `1.14e-13` segun la model card.
- Control de orientacion holografica/steer: la model card reporta angulos de aproximadamente 90 grados en el eje principal y desviaciones de 0,77 a 11,06 grados en el eje secundario.
- Generacion de texto a traves del modelo anfitrion (la biblioteca no genera por si misma).
- No se documenta soporte explicito de tool calling, function calling, agentes, vision, audio ni modo thinking; estas capacidades dependerian exclusivamente del host.

## Casos de uso
- Investigacion en aprendizaje profundo geometrico: permite experimentar con proyecciones sobre variedades de Stiefel aplicadas a activaciones de LLM sin reentrenar, util para estudiar como la geometria interna afecta a la representacion.
- Analisis de invariancia y conservacion de energia: el nucleo en FP64 facilita medir deriva energetica radial en experimentos de estabilidad numerica sobre modelos causales.
- Control de orientacion de representaciones (steering): los angulos reportados sugieren uso en experimentos de direccion controlada de activaciones, por ejemplo para estudiar sesgos o atributos latentes.
- Prototipado de co-procesadores externos: sirve como referencia para ingenieria de kernels CUDA acoplados a transformers via `trust_remote_code`.
- Benchmarking de precision extendida: util para comparar comportamiento en FP64 frente a FP16/BF16 en tareas sensibles a la estabilidad numerica.
- Educacion y divulgacion tecnica: ejemplo didactico de integracion entre `transformers`, CUDA nativo y geometria diferencial aplicada a modelos de lenguaje.
- No se recomienda para produccion de atencion al cliente, generacion de codigo ni pipelines de agentes, dado que no hay evidencia publicada de calidad de generacion ni de licencia.

## Benchmarks y rendimiento
La model card unicamente publica metricas de throughput y conservacion energetica medidas en una NVIDIA RTX 5080 Blackwell (sm_120). No se aportan resultados en MMLU, HumanEval, GSM8K ni similares.

| Modelo anfitrion | Dimension / capas | Throughput acoplado | Deriva energetica radial | Angulo holo / steer |
|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct | 896D, 24L, L5 | 71,75 tok/s (0,97 GB VRAM) | 1,42e-14 | 89,91 / 6,63 grados |
| Qwen2.5-1.5B-Instruct | 1536D, 28L, L5 | 62,18 tok/s (12,7 ms TTFT) | 5,68e-14 | 90,21 / 7,96 grados |
| Gemma 4 E4B-it | 2560D, 42L PLE + dual p-RoPE, L9 | 19,7-20,6 tok/s | 1,14e-13 | 90,91 / 0,77 grados |
| Llama-3.2-3B-Instruct | 3072D, 28L Scaled RoPE, L5 | 27,99 tok/s | 7,99e-15 | 90,00 / 4,97 grados |
| Nemotron-Mini-4B-Instruct | 3072D, 32L relu2 + partial RoPE, L7 | 68,39 tok/s | 1,60e-14 | 90,00 / 5,54 grados |
| Mistral-7B-Instruct-v0.3 | 4096D, 32L GQA, L7 | 19,83 tok/s | 7,82e-14 | 90,00 / 11,06 grados |

No se han publicado resultados de benchmarks de calidad (razonamiento, codigo, matematicas) en la informacion disponible.

## Requisitos de hardware
- GPU NVIDIA con Compute Capability 8.0 o superior: Ampere (RTX 30-series, A100), Ada (RTX 40-series, L40S), Hopper (H100) o Blackwell (RTX 50-series).
- Sistema operativo: Linux de 64 bits o Windows con WSL2.
- VRAM: depende del modelo anfitrion. Para Qwen2.5-0.5B acoplado se reportan 0,97 GB; el resto de combinaciones no publica cifras de VRAM en la model card.
- El nucleo en si ocupa 0,508 MB, por lo que su huella adicional es despreciable frente al host.
- Cabe en GPUs de consumo compatibles (RTX 30/40/50-series) siempre que el host quepa en VRAM.
- Despliegue: la model card solo documenta uso via `transformers` con `trust_remote_code=True` y `AutoModelForCausalLM`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y probablemente no sean compatibles dado el caracter de codigo nativo CUDA.
- Latencia y throughput: ver tabla de benchmarks; TTFT de 12,7 ms reportado para Qwen2.5-1.5B en RTX 5080.

## Comparativa con modelos similares
No disponible. Project Genesis no es un modelo de lenguaje sino un co-procesador geometrico; no se identifican en la informacion proporcionada alternativas equivalentes de la misma categoria con las que comparar parametros, contexto o licencia.

## Limitaciones y advertencias
- Restriccion dura de dimension: solo se soportan los 20 valores de `d_model` del atlas Stiefel; otros hosts lanzan `ValueError`.
- Requiere `trust_remote_code=True` y ejecucion de codigo nativo CUDA, lo que implica riesgos de seguridad y portabilidad en entornos gestionados.
- Licencia no disponible: no puede asumirse uso comercial sin aclaracion del autor.
- Idiomas no declarados: la cobertura linguistica depende integramente del host.
- Ausencia total de benchmarks de calidad: no hay evidencia publicada sobre MMLU, HumanEval, GSM8K ni evaluaciones humanas.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta; proyecto sin validacion comunitaria.
- La model card mezcla afirmaciones fisicas (conservacion de energia, holografia) con ingenieria de software; conviene tratar las metricas como declaraciones del autor no replicadas de forma independiente.
- El autor figura como profesional sanitario (RN, BSN) y la entidad Tesseract Spatial Systems LLC no aporta informacion corporativa verificable en la fuente.
- Riesgo de alucinacion: no evaluado; dependera del host. El co-procesador no corrige factualidad.
- No apto para produccion sin auditoria previa del codigo nativo y de la licencia.

## Enlaces
- Hugging Face: https://huggingface.co/Grounded-Entropy/project-genesis
- Modelo anfitrion por defecto: https://huggingface.co/Qwen/Qwen3-8B
- Hosts mencionados: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct, https://huggingface.co/unsloth/Llama-3.2-3B-Instruct, https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos asociados.
