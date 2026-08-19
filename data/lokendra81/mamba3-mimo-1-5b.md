# Lokendra81/mamba3-mimo-1.5b

## Resumen

Mamba-3 MIMO 1.5B es un modelo de lenguaje causal de 1.500 millones de parámetros desarrollado por el equipo de state-spaces (Albert Gu, Tri Dao y colaboradores), publicado bajo licencia Apache 2.0. Se basa en la arquitectura Mamba-3, una evolución de los modelos de espacio de estado (SSM) que elimina por completo las capas de atención, sustituyéndolas por un mezclador MIMO (multi-input multi-output) combinado con MLP con puerta. El modelo está preentrenado sobre 100.000 millones de tokens del dataset FineWeb-Edu y utiliza el tokenizador de Llama-3.1-8B, con embeddings de entrada y salida compartidos.

La relevancia de este modelo radica en que representa la tercera generación de la familia Mamba, que busca ofrecer una alternativa eficiente a los transformers para el procesamiento de secuencias largas, aunque en esta versión concreta la longitud de contexto es de 2.048 tokens. Al carecer de atención, su complejidad computacional es lineal respecto a la longitud de secuencia, lo que lo hace atractivo para despliegues con recursos limitados. El checkpoint se distribuye en formato BF16 y está pensado para usarse con la librería `mamba-ssm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-3 MIMO (SSM híbrido sin atención, con mezclador MIMO y MLP con puerta) |
| Parametros totales | 1,50 B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (se distribuye en BF16) |
| Idiomas soportados | no disponible (tokenizador Llama-3.1-8B, probablemente multilingüe, pero no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de `mamba_ssm` (BF16) |

## Arquitectura y entrenamiento

El modelo está compuesto por 24 bloques apilados, cada uno con un mezclador Mamba-3 MIMO seguido de un MLP con puerta. No contiene ninguna capa de atención. La dimensión del modelo es 2.048, con un tamaño de estado SSM de 128, una dimensión de cabeza de 64 y 64 cabezas SSM agrupadas en un solo grupo. El parámetro MIMO rank es 4 y el chunk size es 16, lo que define cómo se procesan los segmentos de la secuencia dentro del mecanismo SSM.

El preentrenamiento se realizó sobre 100.000 millones de tokens de FineWeb-Edu, un dataset curado de contenido educativo de alta calidad. Se utilizan embeddings de entrada y salida compartidos (tied embeddings) y el tokenizador de `meta-llama/Llama-3.1-8B`. No se menciona ninguna fase de ajuste fino con RLHF o DPO; el modelo se presenta como un checkpoint preentrenado en bruto. La arquitectura Mamba-3 introduce mejoras sobre Mamba-2 en el diseño del estado y el mecanismo de selección, aunque los detalles técnicos completos están en el paper arXiv 2603.15569.

## Capacidades

- Generación de texto causal: dado un prompt, produce continuaciones autoregresivas.
- Modelado de lenguaje: puede utilizarse para tareas de clasificación, perplejidad y análisis de texto.
- Razonamiento básico y comprensión lectora: al estar entrenado con FineWeb-Edu, tiene exposición a contenido educativo y de razonamiento, aunque su tamaño limitado (1,5B) restringe la complejidad de las tareas.
- Generación de código: no se especifica, pero como modelo de lenguaje general puede producir fragmentos de código simples.
- Multilingüismo: no confirmado; el tokenizador Llama-3.1-8B soporta múltiples idiomas, pero no hay datos oficiales sobre el rendimiento en lenguas distintas del inglés.
- No se documenta soporte para tool calling, function calling, agentes ni modos de razonamiento especiales (thinking mode).

## Casos de uso

- Prototipado rápido de aplicaciones de texto: al ser un modelo pequeño y con licencia permisiva, es adecuado para experimentar con generación de texto en entornos de desarrollo sin grandes requisitos de hardware.
- Clasificación y análisis de sentimiento: se puede ajustar finamente sobre conjuntos de datos etiquetados para tareas de NLP downstream, aprovechando su arquitectura eficiente.
- Generación de respuestas en chatbots de bajo coste: con una ventana de contexto de 2.048 tokens, puede mantener conversaciones de varias vueltas en aplicaciones de atención al cliente sencillas.
- Asistente educativo: dado su entrenamiento en FineWeb-Edu, puede responder preguntas factuales básicas y explicar conceptos sencillos, aunque con riesgo de alucinaciones.
- Extracción de información en documentos cortos: su contexto de 2K tokens es suficiente para procesar párrafos o artículos breves y extraer entidades o resúmenes.
- Base para investigación en SSM: al ser un checkpoint público de Mamba-3, sirve como referencia para estudiar el comportamiento de arquitecturas sin atención en tareas de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El checkpoint en BF16 ocupa aproximadamente 3,0 GB (tamaño del repositorio), por lo que la VRAM necesaria para inferencia es de al menos 4 GB considerando overhead.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10, A100 o H100.
- Cabe en GPUs de consumo: sí, con cuantización a 8 bits o 4 bits podría ejecutarse incluso en GPUs con 4 GB, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: la librería `mamba-ssm` es la vía principal; también podría usarse con `llama.cpp` si se convierte el checkpoint a GGUF, aunque no hay soporte oficial confirmado. `vLLM` tiene soporte experimental para Mamba, pero no está garantizado para esta versión.
- Latencia y throughput: no disponibles; al ser un modelo sin atención, se espera un escalado lineal con la longitud de secuencia, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mamba-3 MIMO 1.5B | 1,50 B | 2.048 | SSM (Mamba-3) | Apache 2.0 | Checkpoint público |
| Qwen2.5-1.5B | 1,54 B | 32.768 | Transformer | Apache 2.0 | HuggingFace |
| Gemma-2 2B | 2,60 B | 8.192 | Transformer | Gemma license | HuggingFace |
| SmolLM2-1.7B | 1,71 B | 8.192 | Transformer | Apache 2.0 | HuggingFace |

La comparativa se limita a parámetros y arquitectura; no hay datos de rendimiento para Mamba-3. Frente a los transformers de tamaño similar, Mamba-3 ofrece una complejidad lineal en secuencia, pero con un contexto mucho más corto (2K vs 8K o 32K) y sin evidencia de rendimiento competitivo en tareas estándar.

## Limitaciones y advertencias

- Contexto muy limitado: 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sin datos de benchmarks: no se puede evaluar su calidad relativa frente a otros modelos.
- Riesgo de alucinación: al ser un modelo pequeño entrenado solo en FineWeb-Edu, puede generar información incorrecta o inventada, especialmente en dominios especializados.
- Sesgos del dataset: FineWeb-Edu es contenido web filtrado, lo que puede introducir sesgos de género, raza o ideológicos presentes en la fuente.
- Sin ajuste fino instructivo: el modelo no está entrenado para seguir instrucciones de forma robusta; puede requerir prompt engineering o fine-tuning para tareas específicas.
- Soporte de librería limitado: el checkpoint está en formato `mamba_ssm`, no es compatible directamente con `transformers` sin adaptadores; requiere instalar la librería desde fuente.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de rendimiento ni soporte oficial.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Lokendra81/mamba3-mimo-1.5b)
- [Paper Mamba-3](https://arxiv.org/abs/2603.15569)
- [Implementación oficial de Mamba](https://github.com/state-spaces/mamba)
- [Dataset FineWeb-Edu](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu)
