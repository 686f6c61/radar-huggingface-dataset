# guan-wang/EBFM-Fineweb-1B-CHAT

## Resumen

EBFM-Fineweb-1B-CHAT es un modelo de lenguaje de 1.028 millones de parámetros (aproximadamente 1B) desarrollado por guan-wang, construido sobre la familia OpenEBFM de modelos de lenguaje basados en energía (energy-based language models). El modelo parte de un preentrenamiento sobre el corpus FineWeb y posteriormente se somete a un ajuste supervisado (SFT) orientado a conversación, dando como resultado una variante de chat exportada en formato compatible con Hugging Face Transformers.

La arquitectura es una implementación personalizada de OpenEBFM (variante d26) con 26 bloques transformer, dimensión de embedding de 1664 y 13 cabezas de atención, con una longitud de contexto de 2048 tokens y un vocabulario de 32768 entradas. Frente a los transformers convencionales, el enfoque basado en energía modela la distribución del lenguaje mediante una función de energía en lugar de una probabilidad autoregresiva clásica, lo que constituye su principal diferenciación técnica.

El modelo es relevante por su carácter abierto (licencia MIT) y por representar una exploración práctica de arquitecturas alternativas al transformer estándar en la escala de 1B parámetros. Su pipeline declarado es `fill-mask`, aunque la variante CHAT está ajustada para conversación. El repositorio tiene un tamaño de 4,1 GB y requiere cargar código remoto personalizado (`trust_remote_code=True`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OpenEBFM personalizada (energy-based language model), variante d26, 26 bloques transformer |
| Parámetros totales | 1.028.275.456 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) |

Datos adicionales de configuración: dimensión de embedding 1664, 13 cabezas de atención, vocabulario de 32768 tokens, tokenizador serializado en `tokenizer.pkl` y tabla de bytes en `token_bytes.pt`.

## Arquitectura y entrenamiento

El modelo emplea una implementación personalizada de OpenEBFM, un modelo de lenguaje basado en energía (energy-based language model). La configuración exportada indica 26 bloques transformer, dimensión de embedding de 1664 y 13 cabezas de atención, con un contexto máximo de 2048 tokens. El pipeline declarado en Hugging Face es `fill-mask`, coherente con el paradigma de modelado por energía, que puntúa secuencias mediante una función de energía en lugar de una distribución autoregresiva convencional.

El entrenamiento se realizó en dos fases: un preentrenamiento sobre el corpus FineWeb y un ajuste supervisado posterior (SFT) específico para chat. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset de SFT ni si se emplearon técnicas de RLHF o DPO. El informe técnico asociado es "OpenESM: Energy-Steered Models Are Scalable Foundation Learners" (arXiv:2610.33005), que describe el enfoque de modelos guiados por energía. La implementación del código se mantiene en el repositorio OpenEBFM de GitHub.

## Capacidades

- Generación de texto y conversación: variante CHAT ajustada mediante SFT para diálogo multi-turno.
- Modelado de lenguaje por energía: soporta la interfaz `AutoModelForMaskedLM` con cabecera de fill-mask.
- Razonamiento y generación condicionada por contexto de hasta 2048 tokens.
- Capacidades multilingües: no disponibles según la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Tokenizador propio basado en tiktoken con serialización específica (`tokenizer.pkl`).

## Casos de uso

- Prototipado de investigación en modelos basados en energía: permite experimentar con el paradigma OpenEBFM a escala 1B sin necesidad de entrenar desde cero, cargando el checkpoint con `trust_remote_code=True`.
- Evaluación comparativa de arquitecturas alternativas: útil para contrastar el rendimiento del modelado por energía frente a transformers autoregresivos de tamaño similar en tareas de lenguaje.
- Generación de texto asistida en entornos de investigación: con contexto de 2048 tokens, adecuado para resúmenes y respuestas de longitud media en inglés (idioma no confirmado).
- Fine-tuning académico: la licencia MIT y el tamaño de 1B permiten ajustar el modelo en GPUs de gama alta consumer para estudios de SFT.
- Reproducción de resultados del paper OpenESM: el repositorio incluye los archivos de configuración y tokenización necesarios para replicar experimentos del informe técnico.
- Docencia y formación: ejemplo práctico de arquitectura no convencional para cursos de aprendizaje profundo y modelado del lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2 GB para los pesos (1.028 millones de parámetros), más overhead de activaciones y contexto; en la práctica se recomienda al menos 4-6 GB.
- VRAM estimada en FP32: aproximadamente 4,1 GB solo para pesos.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con 8 GB o más puede alojar el modelo en FP16.
- Cabe en GPU consumer: sí, en RTX 3060 (12 GB), RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requerido por la arquitectura personalizada). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado que la arquitectura es custom y no estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Benchmark |
|---|---|---|---|---|---|
| EBFM-Fineweb-1B-CHAT | 1.028 M | 2048 | OpenEBFM (energy-based) | MIT | no disponible |
| Alternativas de 1B convencionales | ~1B | variable | Transformer autoregresivo | variable | no disponible en esta ficha |

No se dispone de datos de benchmarks ni de comparaciones directas publicadas para este modelo frente a alternativas de la misma escala. La comparación cuantitativa no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True`: la carga ejecuta código Python remoto del repositorio, lo que implica un riesgo de seguridad que debe evaluarse antes de usarlo en producción.
- Arquitectura no estándar: la integración con ecosistemas de despliegue (vLLM, TGI, llama.cpp, Ollama) no está confirmada y probablemente requiera adaptaciones.
- Contexto limitado a 2048 tokens, inferior a los estándares actuales de modelos de chat (8K-128K).
- Idiomas soportados no declarados; no se garantiza calidad multilingüe.
- Riesgo de alucinación inherente a modelos de 1B parámetros; no se han publicado evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles; el corpus FineWeb puede introducir sesgos de dominio web.
- Sin datos de benchmarks publicados, lo que dificulta evaluar su calidad frente a alternativas.
- El pipeline declarado (`fill-mask`) no coincide con el uso conversacional esperado, lo que puede generar confusión en la integración.
- Licencia MIT: permite uso comercial, pero sin garantías del autor.

## Enlaces

- Hugging Face: https://huggingface.co/guan-wang/EBFM-Fineweb-1B-CHAT
- Repositorio OpenEBFM: https://github.com/datamllab/openebfm
- Informe técnico (paper): https://huggingface.co/papers/2610.33005
- arXiv: 2610.33005 (OpenESM: Energy-Steered Models Are Scalable Foundation Learners)
