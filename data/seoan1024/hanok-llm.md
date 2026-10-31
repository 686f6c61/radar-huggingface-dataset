# seoan1024/Hanok-LLM

## Resumen

Hanok LLM 1.0 es un modelo lingüístico de aproximadamente 1.000 millones de parámetros orientado al coreano, desarrollado por el usuario seoan1024 como parte de un proyecto de investigación personal derivado de su repositorio Korean-llm. No se trata de un modelo entrenado con pesos publicados, sino de una pila modular completa en PyTorch nativo (entrenamiento, inferencia, evaluación, exportación y monitorización) cuyo modelo decodificador, llamado KoreanLLM, se entrena a partir de checkpoints que el propio usuario genera. Los pesos entrenados no están incluidos en el repositorio; los comandos de exportación convierten un checkpoint suministrado por el usuario.

Su relevancia no está en competir con modelos comerciales, sino en servir como base de estudio reproducible para la investigación de LLMs en coreano: arquitectura decoder-only con RMSNorm, RoPE y SwiGLU, flujos de preentrenamiento y SFT con enmascaramiento de solo respuesta, y exportación a formatos estándar (bundle de Transformers tipo Llama, GGUF de llama.cpp y Ollama). El flujo de trabajo está orientado a Windows 11 con CUDA 12.x, un entorno poco habitual en este tipo de proyectos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only nativo (RMSNorm, RoPE, SwiGLU, embeddings atados, KV cache) |
| Parámetros totales | 1.000.000.000 (aprox. 1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens por defecto en entrenamiento y CLI; hasta 4.096 en el constructor (configurable, sin validar en calidad) |
| Tipos de cuantización | no disponible (exportación GGUF vía llama.cpp, cuantizaciones según llama.cpp) |
| Idiomas soportados | coreano (ko) |
| Licencia | MIT (según tags de Hugging Face; el README remite al archivo LICENSE) |
| Formato de pesos | .pth nativo de PyTorch (checkpoints del usuario); exportable a bundle de Transformers tipo Llama, GGUF y Ollama |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only con 33 bloques, dimensión oculta de 1.280, 10 cabezas de atención (dimensión de cabeza 128), capa intermedia SwiGLU de 5.881 y vocabulario fijo de 30.004 tokens con embeddings atados entre entrada y salida. Usa RMSNorm (eps=1e-6) en estilo pre-norm tanto en atención como en FFN, codificación posicional RoPE con θ = 10.000 y KV cache por capa. El límite de secuencia depende de la tabla RoPE asignada a cada instancia: el constructor por defecto es de 4.096 tokens, mientras que los flujos de entrenamiento, CLI, evaluación y exportación usan 1.024 por defecto, ampliable mediante parámetros.

Los datasets de entrenamiento referenciados en la model card combinan corpus educativos y web en coreano (eliceai/korean-webtext-edu), Wikipedia (wikimedia/wikipedia), matemáticas en coreano (kuotient/gsm8k-ko), instrucciones on-policy generadas con Gemma (BCCard/gemma-4-31B-korean-on-policy-150k) y datos de instrucciones KoAlpaca (beomi/KoAlpaca-v1.1a). El pipeline contempla orquestación preentrenamiento → SFT con acumulación de gradientes, planificación coseno del learning rate, reanudación de checkpoints y enmascaramiento de solo respuesta en SFT. No se especifica el número total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en coreano con muestreo configurable (temperatura, top-k, top-p y penalización por repetición).
- Entrenamiento preentrenamiento + SFT con enmascaramiento de solo respuesta, acumulación de gradientes y reanudación de checkpoints.
- Evaluación mediante perplejidad y un benchmark de regresión de opción múltiple en coreano reproducible.
- Exportación del checkpoint a bundle estándar de Transformers tipo Llama, GGUF de llama.cpp y modelos de Ollama.
- KV cache por capa para inferencia incremental eficiente.
- Monitorización de entrenamiento mediante una GUI opcional en tiempo real.
- No hay indicios de capacidades multimodales (visión, audio), tool calling ni modos de razonamiento extendido.

## Casos de uso

- Investigación de LLMs en coreano: la pila modular permite inspeccionar, extender o sustituir cada subsistema (modelo, datos, entrenamiento, evaluación), ideal para experimentos académicos con modelos de 1B.
- Educación y formación en ingeniería de LLMs: al ser PyTorch nativo con valores explícitos y sin capas ocultas de abstracción, sirve como material didáctico para entender cada componente (RoPE, RMSNorm, SwiGLU, KV cache).
- Experimentación con SFT en coreano: el enmascaramiento de solo respuesta y los datasets de instrucciones coreanas (KoAlpaca, on-policy 150k) permiten entrenar asistentes pequeños en local.
- Despliegue en entornos Windows con CUDA: el flujo de trabajo está diseñado y probado para Windows 11 + CUDA 12.x, algo poco habitual en proyectos de este tipo.
- Exportación a ecosistemas de inferencia ligera: la conversión a GGUF y Ollama permite ejecutar el modelo entrenado en portátiles y estaciones sin GPU dedicada.
- Benchmarking reproducible en coreano: el benchmark de opción múltiple y la evaluación de perplejidad permiten comparar checkpoints de forma sistemática durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye herramientas de evaluación (perplejidad y un benchmark de opción múltiple en coreano), pero no hay cifras comparativas publicadas frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Un modelo de 1B en FP16 ocupa aproximadamente 2 GB de pesos, más overhead de activaciones y KV cache; en cuantización GGUF (Q4/Q8) cabe en torno a 0,6-1,2 GB.
- GPU recomendadas: no disponible. Por el tamaño del modelo, cualquier GPU consumer moderna con 6-8 GB de VRAM (RTX 3060, RTX 4060 o superior) debería ser suficiente para inferencia; para entrenamiento se recomienda más margen (12-24 GB).
- Cabe en GPUs consumer: sí, por tamaño (1B) es asumible incluso en GPUs de gama media y en CPUs vía GGUF/Ollama.
- Opciones de despliegue: carga nativa de checkpoints .pth en PyTorch, bundle estándar de Transformers tipo Llama, llama.cpp (GGUF) y Ollama. No se menciona vLLM ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma principal | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Hanok LLM 1.0 | ~1B | 1.024 (defecto), hasta 4.096 | Coreano | MIT | Pesos no incluidos; checkpoint del usuario |
| EXAONE 3.5 (LG) | 2,4B / 7,2B / 32B | 32.768 | Coreano/inglés | Restringida (uso no comercial) | Públicos en Hugging Face |
| Polyglot-Ko 1.3B | 1,3B | 2.048 | Coreano | Apache 2.0 (versiones base) | Públicos en Hugging Face |

Hanok se diferencia en que es una pila de investigación entrenable y exportable en lugar de un modelo con pesos publicados, con un contexto mucho más corto y sin benchmarks públicos, a cambio de transparencia total del código y licencia MIT.

## Limitaciones y advertencias

- Los pesos entrenados no están incluidos en el repositorio: el usuario debe entrenar su propio checkpoint antes de poder inferir o exportar.
- Contextos superiores a 1.024 tokens son configurables pero no han sido validados en calidad por el autor; el consumo de memoria crece con la longitud de secuencia.
- El vocabulario del modelo es fijo en 30.004 tokens; el tokenizador puede ser más pequeño, lo que requiere atención al alinear tokenizer y modelo.
- No hay benchmarks publicados, por lo que la calidad del modelo entrenado depende íntegramente del proceso de entrenamiento del usuario.
- Sin capacidades multimodales ni soporte documentado de tool calling.
- Sesgos: los datasets de entrenamiento son web y Wikipedia en coreano más datos sintéticos de instrucciones, por lo que heredarán los sesgos de esas fuentes; no hay análisis de sesgos publicado.
- Riesgo de alucinación: no disponible, aunque es esperable en un modelo de 1B sin alineación documentada más allá de SFT.
- Licencia: MIT según los tags de Hugging Face, lo que permite uso comercial; el README remite al archivo LICENSE del repositorio, conviene verificarlo antes de uso en producción.
- Cero descargas registradas en Hugging Face en el momento de la ficha: proyecto con comunidad mínima y sin historial de adopción.

## Enlaces

- Hugging Face: https://huggingface.co/seoan1024/Hanok-LLM
- Repositorio principal: https://github.com/seoan1024/Hanok-LLM.git
- Base de investigación: https://github.com/seoan1024/Korean-llm.git
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/eliceai/korean-webtext-edu
  - https://huggingface.co/datasets/wikimedia/wikipedia
  - https://huggingface.co/datasets/kuotient/gsm8k-ko
  - https://huggingface.co/datasets/BCCard/gemma-4-31B-korean-on-policy-150k
  - https://huggingface.co/datasets/beomi/KoAlpaca-v1.1a
