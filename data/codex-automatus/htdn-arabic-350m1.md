# codex-automatus/htdn-arabic-350m1

## Resumen

El modelo `htdn-arabic-350m1` es un modelo de lenguaje de aproximadamente 350 millones de parámetros desarrollado por la organización `codex-automatus` en Hugging Face, aunque su origen se remonta a un trabajo previo del usuario `gijl`. Se trata de un modelo experimental de generación de texto en árabe que emplea una arquitectura personalizada denominada HTDN, la cual combina una capa de dinámicas recurrentes con atención causal, utilizando embeddings rotatorios (RoPE) y activación SwiGLU. Esta arquitectura no es compatible con la API estándar de `transformers`, por lo que requiere código específico (`modeling_htdn.py`) y el framework JAX/Flax para su carga e inferencia.

El modelo fue entrenado sobre datos árabes de múltiples fuentes en modo streaming, utilizando dos GPUs T4 en la plataforma Kaggle, según la información disponible. Su tokenizador es `bert-base-multilingual-cased`. Al ser un proyecto de investigación, los resultados son preliminares y no se han publicado benchmarks oficiales. Su relevancia radica en explorar arquitecturas híbridas recurrentes-atencionales para el árabe, un idioma con menos recursos que el inglés, aunque su uso práctico está limitado por su naturaleza experimental y la falta de integración con el ecosistema estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDN (híbrida: capa recurrente + atención causal con RoPE y SwiGLU) |
| Parametros totales | 349.011.904 (~350M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantización) |
| Idiomas soportados | Árabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (carga vía JAX/Flax) |

## Arquitectura y entrenamiento

La arquitectura HTDN es una propuesta personalizada que integra una capa de dinámicas recurrentes con un mecanismo de atención causal. La atención utiliza embeddings rotatorios (RoPE) para codificar posiciones y activación SwiGLU en las capas feed-forward, combinando así propiedades de modelos recurrentes y transformadores. Esta hibridación busca capturar dependencias de largo alcance con eficiencia computacional, aunque no se detallan los hiperparámetros exactos (número de capas, dimensiones, etc.) en la documentación disponible.

El entrenamiento se realizó sobre un corpus árabe de múltiples fuentes en modo streaming, sin especificar el número total de tokens ni la composición exacta del dataset. No se menciona el uso de técnicas de alineación como RLHF o DPO. El tokenizador empleado es `bert-base-multilingual-cased`, que es subword y multilingüe. El modelo se entrenó en dos GPUs T4 vía Kaggle, según la información del repositorio original. No se han publicado detalles sobre la duración del entrenamiento ni la estrategia de optimización.

## Capacidades

- Generación de texto en árabe: el modelo es capaz de producir texto coherente en árabe, aunque su calidad no ha sido evaluada formalmente.
- Arquitectura híbrida recurrente-atencional: permite experimentar con un diseño no estándar que combina memoria recurrente y atención.
- Compatibilidad con JAX/Flax: los pesos están en formato safetensors y se cargan mediante código personalizado en JAX/Flax.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.
- El modelo es monolingüe (árabe) y no se especifica soporte para otros idiomas.

## Casos de uso

- Investigación académica en arquitecturas híbridas: el modelo sirve como banco de pruebas para estudiar la combinación de capas recurrentes y atención en el procesamiento del árabe, permitiendo comparar su comportamiento con transformadores puros.
- Prototipado de generación de texto en árabe: puede utilizarse en entornos de investigación para generar borradores de texto, resúmenes o respuestas en árabe, siempre que se acepte su carácter experimental.
- Experimentación con JAX/Flax: al estar diseñado para este framework, es útil para desarrolladores que quieran explorar el entrenamiento e inferencia con JAX en modelos de tamaño medio.
- Evaluación de tokenizadores multilingües: al usar `bert-base-multilingual-cased`, permite analizar el impacto de un tokenizador multilingüe en un modelo específico de árabe.
- Desarrollo de modelos base para fine-tuning: aunque no es estándar, podría servir como punto de partida para ajuste fino en tareas específicas del árabe, si se dispone del código de construcción.
- Educación y divulgación: como ejemplo de arquitectura no convencional, puede utilizarse en cursos o tutoriales sobre diseño de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar. El autor indica que los resultados son preliminares, por lo que no se puede evaluar su rendimiento comparativo.

## Requisitos de hardware

- VRAM estimada: con 350M de parámetros y pesos en fp32 (tamaño del repo 2.7 GB), la inferencia requiere al menos 4-6 GB de VRAM, dependiendo del tamaño de lote y la longitud de secuencia. Sin cuantización, una GPU con 8 GB podría ser suficiente para inferencia básica.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4070 o superiores. Para entrenamiento, se usaron T4 (16 GB) en Kaggle.
- Compatibilidad con consumer GPU: sí, siempre que se tenga soporte para JAX con aceleración CUDA.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp u Ollama debido a su arquitectura no estándar. Requiere un entorno JAX/Flax con el código `modeling_htdn.py` proporcionado.
- Latencia y throughput: no disponibles. Al ser un modelo experimental y sin optimizaciones, se espera una latencia mayor que modelos equivalentes en transformadores estándar.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. No se conocen otros modelos con la misma arquitectura HTDN. Modelos árabes como AraBERT o Jais (de menor o mayor tamaño) tienen arquitecturas transformer estándar y no son directamente comparables sin datos de benchmarks. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo experimental: los resultados son preliminares y no ha sido validado en tareas estándar.
- Incompatibilidad con transformers: no se puede cargar con `AutoModel.from_pretrained`; requiere JAX/Flax y el código personalizado `modeling_htdn.py`.
- Sesgos potenciales: al no documentarse la composición del dataset, existe riesgo de sesgos culturales o lingüísticos no evaluados.
- Alucinaciones: como todo modelo generativo, puede producir contenido falso o incoherente, especialmente en dominios no cubiertos por los datos de entrenamiento.
- Limitaciones de idioma: solo entrenado en árabe, aunque el tokenizador es multilingüe; el rendimiento en dialectos o registros específicos puede ser deficiente.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al ser experimental, no se garantiza su idoneidad para producción.
- Ausencia de cuantización: no se ofrecen versiones cuantizadas, lo que limita su despliegue en entornos con restricciones de memoria.

## Enlaces

- Hugging Face (modelo actual): https://huggingface.co/codex-automatus/htdn-arabic-350m1
- Repositorio original (gijl): https://huggingface.co/gijl/htdn-arabic-350m
- No se han encontrado papers, blogs o demos adicionales en la búsqueda web.
