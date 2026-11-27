# Sadanie/Inkling-2-Mini-Half

## Resumen

Inkling-2-Mini-Half es una variante optimizada para memoria del modelo Mixture-of-Experts (MoE) Inkling-2-Mini, desarrollado originalmente por Thinking Machines y publicado bajo licencia Apache 2.0. La adaptación la firma Sadanie y aplica una técnica denominada Memory-Sparse MoE (MS-MoE), que consiste en mantener en memoria únicamente la mitad de los expertos de cada capa (64 de 128) en lugar de la totalidad. El objetivo es hacer viable la ejecución del modelo en equipos Apple Silicon con 16 GB de memoria unificada, un escenario en el que la versión completa en 4 bits (17,3 GB) no cabe.

El modelo base es un transformer MoE con 24 capas y 128 expertos por capa, de los cuales se activan 8 por token, un diseño eficiente en cómputo pero no en memoria. MS-MoE añade un pequeño modelo predictor (el "receptionist", construido sobre Qwen3-Embedding-0.6B) que, a partir de la pregunta, selecciona qué 64 expertos cargar por capa. El router y un adaptador LoRA de atención se reajustan para operar con ese subconjunto, mientras los pesos de los expertos permanecen intactos.

La relevancia actual reside en que demuestra que es posible reducir el consumo de memoria de un MoE a la mitad (de 17,3 GB a unos 9 GB en 4 bits) con una pérdida de rendimiento moderada: 2,3 puntos en MBPP, 0,1 en GSM8K y 2,0 en MMLU respecto al modelo completo. El repositorio ocupa 1,0 GB e incluye el código de ejecución, los pesos del receptionist, el router ajustado y el LoRA de atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 24 capas, 128 expertos por capa, 8 activos por token; adaptación Memory-Sparse MoE con 64 expertos cargados por capa |
| Parametros totales | no disponible |
| Parametros activos | 8 de 128 expertos por capa (modelo base); en esta variante se cargan 64 de 128 por capa |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (base MLX de mlx-community); embeddings en fp16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), npy para tablas auxiliares |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer con arquitectura Mixture-of-Experts: 24 capas, 128 expertos por capa y 8 expertos activos por token, lo que reduce el coste computacional por token pero mantiene todos los expertos en memoria. La variante Memory-Sparse MoE introduce un modelo predictor ("receptionist") que lee la pregunta y selecciona 64 expertos por capa; solo esos se cargan. El receptionist se construye sobre Qwen3-Embedding-0.6B más los embeddings de tokens de Inkling, y se entrena para predecir qué expertos usará la respuesta.

El proceso de adaptación incluyó tres pasos: primero, el modelo completo respondió 18.271 preguntas (código, matemáticas, ciencia, chat general y varios idiomas) registrando los expertos usados en cada respuesta; segundo, se entrenó el receptionist para predecir esa selección a partir solo de la pregunta, logrando que sus 64 elecciones por capa cubran aproximadamente el 90 % del uso real de expertos; tercero, se ajustaron durante dos épocas el router y un LoRA de rango 16 sobre las proyecciones de atención, con los expertos congelados y usando las salidas del modelo completo como objetivo. En modo chat, cada mensaje nuevo recibe su propia selección, mezclada al 50 % con la anterior, para minimizar el intercambio de expertos entre turnos. No se especifican en la información disponible el número de tokens de entrenamiento del modelo base ni detalles sobre RLHF/DPO.

## Capacidades

- Generación de texto en inglés con modo de razonamiento ("thinking effort 0" en las evaluaciones).
- Razonamiento matemático: 95,3 % en GSM8K con la variante MS-MoE.
- Generación de código: 89,1 % en MBPP (257 problemas) con la variante MS-MoE.
- Conocimiento general: 76,0 % en MMLU (3.000 preguntas) con la variante MS-MoE.
- Conversación multi-turno mediante el modo `--chat`, con selección de expertos adaptativa por mensaje.
- Capacidades multilingües limitadas: la model card declara únicamente inglés, aunque el entrenamiento del receptionist usó preguntas en varios idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Ejecución local en MacBook con 16 GB: el modelo cabe en unos 9 GB de memoria pico, lo que permite desplegar un MoE de razonamiento en hardware de consumo Apple Silicon sin depender de la nube.
- Asistencia de programación offline: con 89,1 % en MBPP, puede generar funciones y resolver tareas de código en un portátil, útil en entornos sin conectividad o con requisitos de privacidad.
- Resolución de problemas matemáticos paso a paso: el 95,3 % en GSM8K lo hace adecuado para tutores o asistentes educativos que operen localmente.
- Prototipado e investigación sobre MoE: el repositorio incluye `run.py --check` para comparar las selecciones de expertos con las de referencia (≈99 % de coincidencia), lo que facilita experimentar con selección de expertos y ajuste de router.
- Chat interactivo con contexto multi-turno: el modo `--chat` mezcla selecciones de expertos entre mensajes, adecuado para asistentes conversacionales locales con consumo de memoria acotado.
- Evaluación comparativa de técnicas de compresión: sirve como referencia para medir el compromiso entre memoria y precisión (2,3 puntos en MBPP, 0,1 en GSM8K, 2,0 en MMLU frente al modelo completo).
- Despliegue en estaciones de trabajo Apple para tareas de conocimiento general: el 76,0 % en MMLU permite responder preguntas de cultura general y ciencia sin salir del equipo.

## Benchmarks y rendimiento

Resultados publicados en la model card, con decodificación greedy y thinking effort 0:

| Test | Modelo completo | MS-MoE sin fine-tuning | MS-MoE (esta variante) |
|---|---|---|---|
| Código, MBPP (257 problemas) | 91,4 % | 73,2 % | 89,1 % |
| Matemáticas, GSM8K (1.319 problemas) | 95,4 % | 92,6 % | 95,3 % |
| Conocimiento, MMLU (3.000 preguntas) | 78,0 % | 75,4 % | 76,0 % |

Rendimiento en hardware: en un MacBook M1 de 16 GB, 9,0 GB de memoria pico, aproximadamente 10 tokens por segundo y unos 20 segundos para cargar los expertos en la primera pregunta.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 9,0 GB de pico en 4 bits con 64 expertos por capa.
- Hardware soportado: Apple Silicon (MLX). La model card indica explícitamente "Mac only for now".
- Memoria mínima recomendada: 16 GB de memoria unificada; se recomienda cerrar otras aplicaciones pesadas antes de ejecutar.
- Espacio en disco: aproximadamente 20 GB libres (1,0 GB del repositorio más la descarga del modelo base de 17 GB en 4 bits).
- GPU: no se documenta soporte para CUDA, A100, H100 ni RTX 4090 en la información disponible.
- Despliegue: MLX con `mlx==0.32.4` y un commit específico de mlx-lm (`0c4c99192230f1943dd468d297f0b8a64ae7b7c2`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: aproximadamente 10 tokens por segundo en M1; latencia de carga inicial de expertos de unos 20 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MBPP | GSM8K | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Inkling-2-Mini (completo, 4 bits) | MoE 128 expertos/capa, 8 activos | no disponible | 91,4 % | 95,4 % | 78,0 % | Apache 2.0 | Hugging Face (mlx-community/Inkling-2-Mini-4bit) |
| Inkling-2-Mini-Half (esta variante) | MoE 64 de 128 expertos cargados | no disponible | 89,1 % | 95,3 % | 76,0 % | Apache 2.0 | Hugging Face (Sadanie/Inkling-2-Mini-Half) |
| Qwen3-Embedding-0.6B | 0,6 B | no disponible | no aplica (embedding) | no aplica | no aplica | no disponible | Hugging Face (Qwen/Qwen3-Embedding-0.6B) |

No se dispone de datos de benchmarks de otros MoE comparables en la información proporcionada.

## Limitaciones y advertencias

- Plataforma restringida: solo Apple Silicon vía MLX; no hay soporte documentado para CUDA ni otros aceleradores.
- Idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Pérdida de precisión respecto al modelo completo: 2,3 puntos en MBPP, 0,1 en GSM8K y 2,0 en MMLU.
- Riesgo de selección subóptima de expertos: el receptionist cubre aproximadamente el 90 % del uso real de expertos, por lo que un 10 % de las activaciones queda fuera del subconjunto cargado.
- Gestión de memoria manual: el script advierte si no hay memoria libre suficiente; es necesario cerrar aplicaciones pesadas.
- Dependencia de versiones concretas: requiere `mlx==0.32.4` y un commit específico de mlx-lm, lo que puede complicar la reproducibilidad futura.
- Riesgo de alucinación: no se documenta en la información disponible, pero es inherente a los modelos de lenguaje y debe asumirse en producción.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de la conversión 4 bits de mlx-community.
- El repositorio no modifica los pesos de los expertos; cualquier mejora o corrección debe aplicarse sobre el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sadanie/Inkling-2-Mini-Half
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Conversión 4 bits MLX: https://huggingface.co/mlx-community/Inkling-2-Mini-4bit
- Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Artículo técnico (Medium): https://medium.com/@rotteveeladan/mixture-of-experts-models-are-built-wrong-for-laptops-and-local-hardware-9a45165d65d6
- Repositorio mlx-lm (commit referenciado): https://github.com/ml-explore/mlx-lm/commit/0c4c99192230f1943dd468d297f0b8a64ae7b7c2
