# DZER-Studios/Create_Vexion-gpt

## Resumen
Vexion-GPT es un proyecto de modelo de lenguaje denso desarrollado desde cero en PyTorch por DZER-Studios. No se distribuye como un modelo entrenado listo para usar, sino como un motor de arquitectura y código de entrenamiento: la model card indica explícitamente que el repositorio contiene el código fuente de la arquitectura y las gráficas de entrenamiento base, y que los pesos se publicarán tras completar preentrenamientos extensos sobre grandes conjuntos de datos. Por tanto, en el momento de redactar esta ficha no hay pesos utilizables publicados en el repositorio.

El proyecto define una familia escalable de configuraciones densas tipo GPT, desde 117M hasta 3B parámetros, con atención causal clásica, activaciones GELU/SiLU, Flash Attention, DataLoader propio sobre datos binarios, optimizador Adafactor, gradient checkpointing a nivel de bloque y expansión de contexto mediante YaRN. El objetivo declarado es didáctico y de ingeniería: comprender y optimizar el entrenamiento de transformers sin depender de frameworks de alto nivel.

Su relevancia actual es limitada como modelo de producción, pero resulta interesante como referencia de implementación eficiente en memoria para entrenar desde cero en GPUs de consumo. La licencia Apache 2.0 facilita su reutilización, aunque la ausencia de pesos, de datos de entrenamiento publicados y de benchmarks impide evaluar su calidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal tipo GPT (atención causal, GELU/SiLU), sin MoE |
| Parametros totales | Familia de configuraciones: 117M (Nano), 345M (Medium), 646M (Large), 1B (XL), 2,5B (XXL), 3B (XXXL); pesos no publicados |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | 1024 tokens en las mediciones de entrenamiento; expansión de contexto mediante YaRN (longitud máxima no especificada) |
| Tipos de cuantizacion | No disponible (no se han publicado pesos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio contiene código, no pesos; etiqueta BF16 en metadatos) |

## Arquitectura y entrenamiento
La arquitectura es un transformer denso causal clásico, sin mezcla de expertos ni componentes híbridos, con atención causal estándar y activaciones GELU/SiLU. La configuración está desacoplada del código mediante un `config.json` compatible con Hugging Face (`hidden_size`, `num_hidden_layers`, etc.), lo que permite instanciar distintas tallas. Las configuraciones publicadas son: Nano (768 de dimensión, 12 capas, 12 cabezas), Medium (1024, 24, 16), Large (1280, 30, 20), XL (1536, 36, 12), XXL (2048, 48, 16) y XXXL (2176, 52, 17).

En el plano de entrenamiento, el proyecto integra Flash Attention con kernels fusionados, un DataLoader personalizado que transmite datos binarios (`.bin`) evitando el recolector de basura de Python y la caché del sistema, el optimizador Adafactor en lugar de AdamW para reducir el estado del optimizador, gradient checkpointing que envuelve el bloque completo (atención y MLP) y acumulación de gradientes. La model card cita una reducción del consumo de memoria activa en la configuración Large de 11,3 GB a 6,0 GB durante el entrenamiento. También se menciona soporte de YaRN para expandir contexto sin entrenar a longitud completa. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card indica que el preentrenamiento a gran escala está pendiente.

## Capacidades
- Generación de texto autoregresiva: es la única capacidad declarada por el pipeline (`text-generation`), condicionada a la disponibilidad futura de pesos.
- Entrenamiento desde cero en GPUs de consumo: el código soporta entrenamiento con precisión mixta bfloat16/float16 y acumulación de gradientes.
- Expansión de contexto mediante YaRN, sin necesidad de entrenar con la longitud objetivo completa.
- Configuración compatible con Hugging Face mediante `config.json`, lo que facilita la integración con herramientas del ecosistema.
- No se declara soporte de tool calling, function calling, agentes, visión, audio, modo thinking ni capacidades multilingües específicas.
- No hay evidencia publicada de razonamiento, código o matemáticas evaluados.

## Casos de uso
- Estudio de arquitecturas transformer: el código sirve como material didáctico para entender atención causal, checkpointing y configuración de modelos desde cero, sin depender de frameworks de alto nivel.
- Entrenamiento desde cero en hardware de consumo: con 2,2 GB de VRAM para Nano y 4,7 GB para Large (contexto de 1024), es viable experimentar en tarjetas de 4-8 GB con precisión mixta.
- Investigación sobre eficiencia de memoria: las técnicas implementadas (Adafactor, gradient checkpointing a nivel de bloque, DataLoader binario) permiten reproducir mediciones de consumo y comparar estrategias.
- Prototipado de pipelines de preentrenamiento: el DataLoader de streaming sobre `.bin` y la acumulación de gradientes facilitan montar flujos de entrenamiento con batches efectivos grandes en memoria limitada.
- Base para fine-tuning experimental: una vez publicados los pesos, las configuraciones de 117M a 1B podrían ajustarse para tareas de generación de texto acotadas en entornos con recursos limitados.
- Evaluación de expansión de contexto con YaRN: útil para estudiar la degradación de calidad al extender la ventana sin entrenamiento a longitud completa.
- Docencia y talleres: la licencia Apache 2.0 y la estructura modular permiten usar el código en cursos y prácticas sin restricciones comerciales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

La model card solo aporta mediciones de consumo de VRAM durante el entrenamiento (contexto de 1024 tokens, precisión mixta), no métricas de calidad:

| Configuracion | Parametros | Dimension | Capas | Cabezas | VRAM entrenamiento |
|---|---|---|---|---|---|
| Nano | 117M | 768 | 12 | 12 | 2,2 GB |
| Medium | 345M | 1024 | 24 | 16 | 3,5 GB |
| Large | 646M | 1280 | 30 | 20 | 4,7 GB |
| XL | 1B | 1536 | 36 | 12 | 6,4 GB |
| XXL | 2,5B | 2048 | 48 | 16 | 12,9 GB |
| XXXL | 3B | 2176 | 52 | 17 | 17 GB |

## Requisitos de hardware
- Entrenamiento (datos de la model card, contexto 1024, precisión mixta): Nano 2,2 GB; Medium 3,5 GB; Large 4,7 GB; XL 6,4 GB; XXL 12,9 GB; XXXL 17 GB.
- GPU de consumo compatibles según el autor: RTX 3050/4050 (Nano, Medium), RTX 3060 (Large), RTX 3060 Ti/4060 (XL), RTX 4060 Ti/5060 Ti (XXL), RTX 3090/4090 (XXXL).
- El entrenamiento de 3B en una GPU de 16 GB es técnicamente posible, pero con parte de los gradientes en RAM y velocidades que el autor describe como de minutos por iteración (48,64 s/it en su equipo).
- Inferencia: no disponible, al no haberse publicado pesos ni cuantizaciones.
- Opciones de despliegue: no disponible; el proyecto no documenta integración con vLLM, llama.cpp, Ollama o TGI.
- Throughput y latencia de inferencia: no disponibles.

## Comparativa con modelos similares
No disponible. No hay benchmarks publicados ni pesos que permitan una comparación rigurosa con alternativas de la misma categoría. A nivel de arquitectura, los transformers densos de código abierto comparables en rango de parámetros (por ejemplo, familias tipo GPT de 117M a 3B con licencia permisiva) no pueden contrastarse aquí sin datos de evaluación del modelo.

## Limitaciones y advertencias
- No hay pesos publicados: el repositorio contiene código y gráficas de entrenamiento; no es utilizable para inferencia en el momento de esta ficha.
- Ausencia total de benchmarks: no se puede verificar calidad, razonamiento, código ni multilingüismo.
- No se documentan los datos de entrenamiento (tokens, composición, filtrado), lo que impide evaluar sesgos y riesgos de alucinación.
- Idiomas soportados no declarados; se desconoce si el modelo final será multilingüe.
- La expansión de contexto con YaRN sin entrenamiento a longitud completa puede degradar la calidad más allá de la ventana nativa.
- El proyecto está en fase temprana (creado en junio de 2026, actualizado en noviembre de 2026, 275 descargas y 1 like): alta probabilidad de cambios incompatibles.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de pesos y de evaluación hace desaconsejable su uso en producción.
- Las cifras de VRAM corresponden a entrenamiento, no a inferencia; no deben extrapolarse directamente.

## Enlaces
- Hugging Face: https://huggingface.co/DZER-Studios/Create_Vexion-gpt
- Resultados de búsqueda web: solo se devolvió la página principal de Wikipedia (https://www.wikipedia.org/), sin información adicional relevante sobre el modelo.
