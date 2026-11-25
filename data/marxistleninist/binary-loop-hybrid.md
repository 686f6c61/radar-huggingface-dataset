# MarxistLeninist/binary-loop-hybrid

## Resumen

Binary Looped (Internal-Reasoning) Transformer–Mamba Hybrid es un modelo de lenguaje de demostración desarrollado por el usuario de Hugging Face MarxistLeninist. Se trata de un experimento de investigación, no de un modelo de producción: combina tres ideas poco habituales en un mismo stack —pesos binarios en las capas lineales, un bloque transformer con pesos compartidos aplicado en bucle (R=3) como mecanismo de "razonamiento interno", y bloques SSM selectivos de estilo Mamba— todo entrenado desde cero sobre texto transmitido en streaming directamente desde Hugging Face, sin descargar un corpus local.

El modelo es deliberadamente minúsculo: 3.450.240 parámetros totales, de los cuales 2.359.296 son latentes binarios (las capas lineales de los bloques transformer en bucle). Usa un tokenizador a nivel de byte (vocabulario de 256 bytes UTF-8 en bruto, sin tokenizer entrenado), con `d_model` de 256 y longitud de secuencia de 256. La arquitectura alterna tres bloques SSM y tres bloques transformer en bucle.

Su relevancia es la de un demostrador técnico: muestra que la mecánica de pesos binarios con estimador de gradiente directo (STE), el bucle de pesos compartidos y los bloques SSM selectivos pueden entrenar de forma estable de extremo a extremo sobre datos en streaming, con muestras que pasan de "ensalada de palabras" a frases simples de estilo TinyStories en unos pocos miles de pasos. No está pensado para uso práctico general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 3 bloques SSM selectivos (estilo Mamba-1) + 3 bloques transformer en bucle con pesos binarios compartidos |
| Parámetros totales | 3.450.240 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | No disponible (los pesos lineales del bucle son binarios de forma nativa, con escala por fila) |
| Idiomas soportados | No disponible (tokenizador a nivel de byte, potencialmente cualquier UTF-8) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch (`.pt`) con `state_dict` y configuración de entrenamiento |

## Arquitectura y entrenamiento

El stack alterna dos tipos de bloque, tres de cada uno. Los `SSMBlock` son un SSM selectivo simplificado de estilo Mamba-1 escrito en PyTorch puro, sin el paquete `mamba-ssm` ni kernels CUDA personalizados: Δ, B y C son dependientes de la entrada, A es una matriz diagonal aprendida con inicialización S4D, y la recurrencia `h_t = a_t · h_{t-1} + u_t` se evalúa de forma exacta mediante un escaneo asociativo paralelo (prefix scan). Incluye convolución causal depthwise y gating SiLU, como en Mamba.

Los `LoopedTransformerBlock` son un único bloque transformer (8 cabezas, ratio MLP 4) cuyos pesos se comparten y se aplican R=3 veces seguidas por posición del stack, lo que constituye el "bucle de razonamiento interno". Cada capa lineal interna es una `BinaryLinear`: la pasada forward usa `W_eff = α · sign(W)` con escala por fila `α = mean(|W|)` (pesos genuinamente de 1 bit más una escala), mientras que los gradientes llegan a los pesos latentes en precisión completa mediante un straight-through estimator. Los embeddings (atados con la cabeza LM), las proyecciones SSM y la cabeza de salida permanecen en precisión completa.

El entrenamiento usa AdamW con lr 3e-3 y decaimiento coseno, batch 16, autocast fp16, y datos en streaming con `datasets` (`streaming=True`), intentando en orden `roneneldan/TinyStories` y luego `Salesforce/wikitext` (103 y 2) como alternativas. El checkpoint publicado corresponde al paso 3.000, con pérdida 0,8828 (EMA 1,0109), entrenado en una RTX 2080 Ti en Vast.ai a ~23.500 tokens/s. No se documenta número total de tokens ni uso de RLHF/DPO.

## Capacidades

- Generación de texto a nivel de byte: produce texto en bruto UTF-8 sin tokenizer entrenado.
- Modelado de lenguaje autorregresivo básico, orientado a frases simples de estilo TinyStories.
- Razonamiento interno mediante bucle de pesos compartidos (R=3) en los bloques transformer.
- Procesamiento de secuencias mediante SSM selectivo con escaneo asociativo paralelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; al ser byte-level, en principio puede procesar cualquier UTF-8, pero sin evaluación.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre pesos binarios: el modelo sirve como banco de pruebas reproducible para estudiar el entrenamiento con STE y escalas por fila en capas lineales de 1 bit, usando el código `model.py` y `train.py` incluidos.
- Estudio de bucles de pesos compartidos: permite experimentar con el número de repeticiones R del bloque transformer y medir su efecto en la pérdida y en la calidad de las muestras.
- Comparación SSM vs. atención en modelos pequeños: la alternancia de bloques SSM y transformer facilita experimentos controlados sobre asignación de profundidad entre ambos tipos.
- Demostración educativa de entrenamiento en streaming: el pipeline con `datasets` en modo streaming y el dashboard web (`dashboard.py`) sirven para enseñar entrenamiento en vivo sin corpus local.
- Monitorización de entrenamiento: el dashboard stdlib-only con endpoints `/`, `/state` y `/history` puede reutilizarse como plantilla para visualizar curvas de pérdida, EMA, tokens/s y memoria GPU en otros proyectos.
- Reproducción de experimentos de AGILLM: el checkpoint `ckpt_step3000.pt` (SHA-256 verificado) permite cargar el estado exacto y continuar o inspeccionar el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la pérdida de entrenamiento: 0,8828 en el paso 3.000 (EMA 1,0109), con un throughput de ~23.500 tokens/s en una RTX 2080 Ti.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint pesa 13.819.708 bytes (~13,2 MB) e incluye pesos en precisión completa y configuración, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con soporte CUDA; el entrenamiento documentado se realizó en una RTX 2080 Ti. También funciona en CPU (`train.py` cae a CPU si no hay CUDA).
- Cabe en GPU consumer: sí, en cualquier GPU con unos pocos cientos de MB de VRAM libre; también en CPU.
- Opciones de despliegue: carga directa con PyTorch mediante `torch.load` y la clase `BinaryLoopHybridLM` de `model.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~23.500 tokens/s durante el entrenamiento en RTX 2080 Ti; no se documenta throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Binary Looped Hybrid (este) | 3,45 M | 256 | Híbrido SSM + transformer en bucle con pesos binarios | No disponible | Checkpoint `.pt` en Hugging Face |
| Modelos TinyStories típicos | ~1–10 M | variable | Transformer pequeño a nivel de palabra/token | variable | diversos en Hugging Face |
| Mamba-1 (referencia) | desde ~130 M | hasta 2k | SSM selectivo puro | Apache 2.0 (referencia) | pesos y código públicos |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas; la comparativa es únicamente estructural.

## Limitaciones y advertencias

- Modelo demostrador de 3,45 M de parámetros: no es un modelo de frontera ni apto para tareas reales de producción.
- Calidad de generación limitada: el propio autor describe las muestras como "ensalada de palabras" que mejora hacia frases simples de estilo TinyStories tras unos miles de pasos.
- Contexto muy corto (256 tokens), insuficiente para conversaciones multi-turno o documentos largos.
- Tokenizador a nivel de byte sin entrenar: mayor coste por carácter y sin evaluación multilingüe.
- Riesgo elevado de alucinación y de texto incoherente, inherente a su tamaño y estado de entrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse con el autor antes de cualquier uso.
- Pesos binarios con STE: la cuantización es nativa en el bucle, pero no se documentan formatos de cuantización adicionales ni herramientas de despliegue estándar.
- Sin datos de sesgos, evaluación de seguridad ni benchmarks publicados.

## Enlaces

- Hugging Face: https://huggingface.co/MarxistLeninist/binary-loop-hybrid
- Repositorio de código (`model.py`, `train.py`, `dashboard.py`): incluido en el repositorio de Hugging Face del modelo
- Checkpoint: `ckpt_step3000.pt` (SHA-256 `a28a3e1ca81a01f97e8a6f74e37220490dd060f7b5fdef4e0d8a35d26a447c0b`)
- Dataset de entrenamiento principal: https://huggingface.co/datasets/roneneldan/TinyStories
- Datasets de respaldo: https://huggingface.co/datasets/Salesforce/wikitext
