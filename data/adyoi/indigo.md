# adyoi/indigo

## Resumen

Indigo es un modelo de lenguaje de tipo GPT construido desde cero por Adi Apriyanto (usuario `adyoi`) como proyecto de aprendizaje. Está desarrollado sin la biblioteca Transformers, utilizando únicamente PyTorch como backend, y se publica con licencia MIT. El modelo está orientado a la generación de texto en indonesio y está diseñado para fines educativos: su propósito principal es demostrar cómo se implementa un transformer decoder-only con atención causal y cache de clave-valor (KV-cache), así como entrenar y evaluar un modelo de este tipo con datos propios.

El modelo tiene aproximadamente 0,81 millones de parámetros, una arquitectura de 4 capas y 4 cabezas de atención, con una dimensión de 128 y una longitud de contexto de 96 tokens. Acepta dos tipos de tokenizador: carácter o BPE (byte-level). El autor proporciona además un pipeline de entrenamiento, generación y evaluación, junto con un mecanismo opcional de "guarda de diccionario" para filtrar la generación y mejorar la calidad de la ortografía. A pesar de su tamaño muy reducido, el proyecto es relevante como material didáctico para desarrolladores que quieren entender los fundamentos de los transformers y el entrenamiento de modelos de lenguaje desde cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (pre-LN, SDPA) |
| Parametros totales | ~0,81 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 96 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Indonesio (id) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Indigo es un transformer decoder-only con pre-normalización (pre-LN) y atención de producto punto escalado (SDPA). Incluye atención causal y cache de KV para acelerar la generación. La arquitectura se define en `indigo/model.py` y consta de 4 capas, 4 cabezas de atención y una dimensión de 128. El tokenizador puede ser carácter (`indigo/tokenizer.py`) o BPE byte-level (`indigo/bpe.py`), y el entrenamiento se realiza con un script `train.py` que permite elegir el dataset, el número de pasos y continuar desde un checkpoint existente.

El modelo se entrena sobre un dataset personalizado (`datasets: custom`), aunque no se especifica el número de tokens ni la composición exacta. No se menciona el uso de RLHF, DPO ni otros métodos de ajuste por refuerzo. La principal innovación del proyecto es el "guarda de diccionario" (`--guard`), que carga una lista de palabras (por ejemplo, una wordlist del indonesio) y filtra los candidatos generados en función de la proporción de palabras conocidas, mejorando la ortografía sin modificar los pesos del modelo. También se ofrece un `pipeline.py` que automatiza el entrenamiento, la evaluación y la subida al Hub.

## Capacidades

- Generación de texto básica: el modelo puede generar secuencias de texto en indonesio, aunque su coherencia es limitada por el tamaño del corpus de entrenamiento.
- Tokenización configurable: soporta tokenizador carácter o BPE, lo que permite adaptar el modelo a diferentes necesidades.
- Mecanismo de guarda de diccionario: filtra la salida usando una lista de palabras y reglas morfológicas (prefijos y sufijos) para mejorar la calidad de la ortografía sin reentrenar.
- Entrenamiento desde cero: permite entrenar el modelo con datos propios, reanudar el entrenamiento desde un checkpoint y evaluar la perplejidad (nats/token y nats/carácter).
- Generación con parámetros de control: top-k, top-p, temperatura y penalización de repetición.
- Compatibilidad con TensorFlow: existe una variante separada (`adyoi/indigo.tf`) que usa TensorFlow/Keras.
- No soporta tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- **Aprendizaje de arquitecturas transformer**: el modelo sirve como ejemplo didáctico para entender cómo se implementa un GPT desde cero, con atención causal, KV-cache y tokenización. Se puede estudiar el código en `model.py` y modificarlo para experimentar.
- **Entrenamiento con datos propios**: un usuario puede preparar un corpus en indonesio y entrenar el modelo con `train.py` o `pipeline.py`, ajustando el tokenizador y los pasos para ver cómo varía el rendimiento.
- **Evaluación de técnicas de regularización**: gracias al guard de diccionario, se puede probar cómo la filtración de palabras conocidas afecta la calidad de la generación, útil para investigar métodos de control de calidad en modelos pequeños.
- **Comparación de tokenizadores**: el modelo permite entrenar y evaluar con tokenizador carácter o BPE, lo que facilita estudiar el impacto de la tokenización en la perplejidad y la generación.
- **Prototipado de pipelines de entrenamiento**: el script `pipeline.py` demuestra cómo orquestar un flujo completo: copia de datos, entrenamiento, registro de métricas en `manifest.json` y promoción de checkpoints. Puede servir de plantilla para proyectos más grandes.
- **Generación controlada en entornos sin recursos**: al ser muy pequeño (0,81M), el modelo puede ejecutarse en CPU o en GPUs modestas, permitiendo experimentar con generación de texto en entornos limitados, como Raspberry Pi o contenedores de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no reporta métricas como MMLU, HumanEval, GSM8K o similares. La única métrica de evaluación mencionada es la perplejidad (nats/token y nats/carácter) que se calcula con `eval.py`, pero no se dan valores concretos.

## Requisitos de hardware

- VRAM estimada: al tener solo 0,81 millones de parámetros, la memoria necesaria es mínima. Con una cuantización estándar (FP32) el peso ocupa alrededor de 3 MB; en FP16 aún menos. Cabe en cualquier GPU con más de 1 GB de VRAM, incluso en CPU.
- GPUs recomendadas: no se requiere una GPU específica; cualquier GPU con CUDA o incluso CPU es suficiente. No hay requisitos de memoria adicionales.
- En consumer GPU: sí, por ejemplo RTX 3060, RTX 4090, o incluso tarjetas integradas.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp o Ollama. El modelo se usa mediante los scripts propios (`generate.py`, `eval.py`) y los pesos en safetensors se cargan con PyTorch.
- Latencia y throughput: no se proporcionan datos. Al ser un modelo tan pequeño, la generación es rápida, especialmente con KV-cache, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No hay disponible una comparación directa con otros modelos similares en la información proporcionada. No se mencionan benchmarks ni modelos de referencia. Sin embargo, por su tamaño y enfoque didáctico, podría compararse con otros mini-GPT educativos como nanoGPT o modelos de ~1M parámetros, pero no se dispone de datos concretos.

## Limitaciones y advertencias

- Entrenado con un conjunto de datos muy pequeño, por lo que la generación no es coherente en producción. El propio autor advierte que el modelo no está apto para uso real.
- El modelo está diseñado para el idioma indonesio; no soporta otros idiomas de forma nativa.
- No dispone de capacidades de razonamiento complejo, tool calling ni agentes.
- Riesgo de alucinación: al ser un modelo muy pequeño, es probable que genere texto sin sentido o no fiel a los datos de entrenamiento.
- Licencia MIT permite uso comercial, pero el modelo no es útil para entornos productivos reales.
- El guard de diccionario depende de una lista de palabras externa; si no se proporciona, la calidad de la ortografía puede verse afectada.
- No se ha publicado información sobre sesgos o riesgos de seguridad adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adyoi/indigo
- Variante TensorFlow: https://huggingface.co/adyoi/indigo.tf
- Perfil del autor: https://huggingface.co/adyoi
- Otro modelo del autor: https://huggingface.co/adyoi/yo
- GitHub del autor: https://github.com/adyoi
