# MD-Mushfiqur123/m-droplychee

## Resumen

m-droplychee es un modelo de lenguaje causal desarrollado por MD-Mushfiqur123 que implementa la arquitectura personalizada `xe_droplychee`. Se trata de un modelo Mixture of Experts (MoE) con aproximadamente 6.500 millones de parámetros totales y unos 450 millones de parámetros activos por token, diseñado específicamente para ejecutarse en estaciones de trabajo con 94-96 GB de VRAM, como la NVIDIA RTX PRO 6000.

La arquitectura incorpora Multi-Head Latent Attention (MLA) para reducir el consumo de memoria de la caché KV, un enrutamiento MoE de grano fino con 64 expertos más uno compartido, predicción de múltiples tokens (MTP) y un motor nativo de Reinforcement Learning mediante GRPO. El modelo está pensado para generación de texto en bengalí e inglés, y se distribuye bajo licencia Apache-2.0.

Su relevancia radica en la combinación de técnicas de eficiencia (atención latente, MoE con pocos parámetros activos, predicción de dos tokens) y optimización para hardware de gama alta, lo que lo convierte en un candidato interesante para investigación en arquitecturas híbridas y para el ajuste fino con RL en entornos con memoria elevada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `xe_droplychee` (MoE con Multi-Head Latent Attention, multi-token prediction y GRPO) |
| Parametros totales | ~6.5B |
| Parametros activos | ~450M por token (5 expertos activos: top-4 + 1 compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bn (bengalí), en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura `xe_droplychee` es un diseño experimental no estándar que combina varias innovaciones. Emplea Multi-Head Latent Attention (MLA) con normalización QK por cabeza y compresión de baja dimensión en la caché KV (d_c^KV = 256), lo que reduce el consumo de ancho de banda de memoria en aproximadamente un 90%. Las posiciones se codifican con RoPE de 64 dimensiones desacopladas. La atención se ejecuta mediante SDPA de PyTorch para maximizar el rendimiento.

El componente MoE utiliza 64 expertos enrutados más un experto compartido dedicado, con un enrutamiento dinámico de top-4, resultando en 5 expertos activos por token. Para evitar el colapso de expertos, se aplica un balanceo de sesgos sin pérdida auxiliar con decaimiento exponencial (factor 0.999). Además, el modelo incorpora un módulo de predicción de múltiples tokens de profundidad 1, que permite predecir dos tokens de forma simultánea durante el preentrenamiento y habilitar decodificación especulativa.

El motor de aprendizaje por refuerzo GRPO está implementado nativamente en la clase del modelo, con cálculo de ratios de política, objetivos de recorte y regularizadores KL, sin necesidad de un modelo crítico separado. Los datos de entrenamiento, el número de tokens y la composición del dataset no se especifican en la información disponible. El comando de ejemplo sugiere la posibilidad de continuar el preentrenamiento con datasets de bengalí, pero no se ofrecen detalles.

## Capacidades

- Generación de texto autoregresiva (causal LM) con soporte de predicción de dos tokens simultáneos durante el preentrenamiento.
- Razonamiento: el modelo está etiquetado con el tag `reasoning` e integra GRPO, lo que indica aptitud para tareas que requieren cadena de pensamiento o ajuste mediante RL.
- Procesamiento de lenguaje en bengalí e inglés, según los idiomas declarados.
- Eficiencia de memoria: la MLA reduce la caché KV en ~90%, lo que permite manejar contextos más largos que un transformer estándar, aunque la longitud de contexto no se ha publicado.
- Soporte de decodificación especulativa gracias al módulo de predicción múltiple de tokens (MTP) de profundidad 1.
- Entrenamiento continuado y ajuste fino sobre datasets propios, facilitado por la optimización para 94-96 GB de VRAM.
- No se documentan capacidades de tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Generación de texto bilingüe bengalí-inglés: el modelo puede producir contenido en ambos idiomas, lo que lo hace útil para redactar artículos, mensajes o documentación en entornos multilingües.
- Investigación en arquitecturas MoE eficientes: al tener solo 450M de parámetros activos de 6.5B totales, resulta adecuado para estudiar estrategias de enrutamiento, balanceo de expertos y reducción de coste computacional.
- Entrenamiento continuado en estaciones de trabajo con 96 GB de VRAM: la arquitectura está optimizada para la NVIDIA RTX PRO 6000, permitiendo continuar el preentrenamiento con datasets propios sin necesidad de clústeres grandes.
- Prototipado de técnicas de atención latente: la implementación de MLA con compresión de caché KV es interesante para experimentar con contextos largos en entornos con memoria limitada.
- Ajuste fino para razonamiento con RL: la integración nativa de GRPO permite entrenar el modelo en tareas de razonamiento sin necesidad de un modelo crítico separado, simplificando el pipeline de RL.
- Despliegue con decodificación especulativa: el módulo MTP puede utilizarse para acelerar la inferencia en sistemas compatibles, aunque se requiere validación experimental para medir la ganancia real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que el modelo tiene ~6.5B parámetros totales, en BF16 los pesos ocuparían aproximadamente 13 GB, lo que podría permitir la ejecución en GPUs de 24 GB sin cuantización, pero esto no está confirmado por el autor.
- GPU recomendadas: NVIDIA RTX PRO 6000 (96 GB) para preentrenamiento, según la model card.
- No se documenta la posibilidad de ejecutarse en GPUs de consumo, aunque la carga de memoria teórica lo sugiere.
- Opciones de despliegue: se proporciona un script de uso con `transformers` y `trust_remote_code=True`; también se menciona `continue_training.py` para continuar el entrenamiento. No se documentan integraciones con vLLM, Ollama, TGI u otros runners.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado datos de comparación con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Arquitectura experimental con código personalizado: el modelo requiere `trust_remote_code=True` y no ha sido validado por la comunidad (0 descargas y 0 likes en el momento de la consulta).
- Sin benchmarks publicados: no se puede evaluar su rendimiento real frente a modelos equivalentes, lo que dificulta su uso en entornos de producción.
- Soporte limitado a dos idiomas: bengalí e inglés; no se documentan capacidades multilingües adicionales.
- Riesgo de alucinación no evaluado: al carecer de métricas publicadas, no se puede estimar la fiabilidad de las respuestas.
- Sesgos no documentados: no se ofrece información sobre sesgos potenciales ni sobre la composición del dataset de entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero al tratarse de un modelo con código remoto, es necesario revisar la implementación antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/MD-Mushfiqur123/m-droplychee
- Modelos relacionados encontrados en la búsqueda web:
  - https://huggingface.co/MD-Mushfiqur123/droplychee-1.1
  - https://huggingface.co/MD-Mushfiqur123/lychee-drop-1.0
