# FardinJP/rag-to-lora-qwen2.5-7b

## Resumen

rag-to-lora-qwen2.5-7b es un adaptador LoRA publicado por el usuario FardinJP sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No es un modelo de propósito general: está entrenado específicamente para recomendar una configuración de codificación (dimensión, encoder, cuantización y número de pasadas de reentrenamiento) para clasificadores basados en computación hiperdimensional (HDC), sujetos a un presupuesto de memoria del dispositivo objetivo.

El adaptador sustituye en tiempo de inferencia a un pipeline de generación aumentada por recuperación (RAG) que consultaba un corpus de 1.518 artículos sobre HDC. Se entrenó con 1.519 pares (tarea, configuración) destilados de ese corpus, de modo que en producción ya no se necesita índice vectorial ni corpus documental. El repositorio ocupa 0,3 GB e incorpora 80,7 M de parámetros entrenables, aproximadamente el 1,1 % del modelo base.

Su relevancia es acotada pero concreta: ejemplifica un patrón de destilación de literatura científica a un adaptador ligero, orientado a despliegues edge donde el coste de memoria y de recuperación es crítico. La licencia es Apache 2.0, la misma del modelo base. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 7,61 B en el modelo base; 80,7 M entrenables en el adaptador (≈1,1 %) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Heredada del modelo base: 32.768 tokens nativos, ampliable a 131.072 con YaRN (dato de la documentación de Qwen; no consta en la ficha del adaptador) |
| Tipos de cuantizacion | El adaptador se distribuye sin cuantizar (safetensors). El modelo base admite cuantización de 8 y 4 bits vía bitsandbytes/GGUF, pero no se documenta en la ficha: no disponible |
| Idiomas soportados | No disponible en la ficha del adaptador; heredados del modelo base Qwen2.5, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Otros datos del repositorio: tamaño 0,3 GB, pipeline text-generation, biblioteca peft, tags knowledge-distillation, hyperdimensional-computing y edge-ai.

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre Qwen2.5-7B-Instruct en bfloat16. La configuración de entrenamiento publicada es: rango 32, alpha 64, dropout 0,05, con módulos objetivo q, k, v, o, gate, up y down projections. El número de parámetros entrenables es de 80,7 M (aproximadamente el 1,1 % del total). Se entrenó durante 4 épocas con tasa de aprendizaje 2e-4 y la pérdida se calculó únicamente sobre los tokens de completion, no sobre el prompt.

El conjunto de entrenamiento consta de 1.519 pares (tarea, configuración), de los cuales 168 se reservaron para validación. Estos pares se destilaron de un corpus de 1.518 artículos sobre computación hiperdimensional. El objetivo del adaptador es devolver un bloque único etiquetado como `## Hyperparameters` que contiene una dimensión, un encoder, una cuantización y un número de pasadas de reentrenamiento. En la aplicación que lo acompaña, esa recomendación actúa como semilla de una búsqueda con restricción de memoria que evalúa cada candidato sobre los datos del usuario. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna innovación de decodificación especulativa o atención lineal.

## Capacidades

- Recomendación de hiperparámetros HDC: dado un perfil de tarea (descripción de la tarea, modalidad de datos, hardware objetivo y presupuesto de memoria), devuelve una configuración concreta de dimensión, encoder, cuantización y pasadas de reentrenamiento.
- Salida estructurada: produce un bloque formateado bajo la etiqueta `## Hyperparameters`, lo que facilita su parseo automático en pipelines.
- Sustitución de RAG: elimina la necesidad de mantener un índice vectorial y un corpus de 1.518 artículos en tiempo de inferencia.
- Conocimiento de dominio condensado: el adaptador codifica información derivada de literatura científica sobre HDC, un dominio muy específico.
- Capacidades generales heredadas del modelo base Qwen2.5-7B-Instruct (generación de texto, razonamiento, código, matemáticas, tool calling y multilingüismo), aunque la ficha del adaptador no documenta su preservación tras el ajuste: no disponible.
- Capacidades multimodales, de audio o de modo de pensamiento explícito: no disponibles en esta ficha.

## Casos de uso

- Configuración inicial de clasificadores HDC en investigación: el modelo propone una configuración de partida a partir de la descripción de la tarea y el hardware, evitando revisar manualmente un corpus de más de 1.500 artículos.
- Eliminación de un pipeline RAG en producción: al integrar el conocimiento en los pesos del adaptador (0,3 GB), se prescinde del índice vectorial, del servidor de embeddings y del corpus documental asociado.
- Selección de configuraciones bajo restricción de memoria en edge: para despliegues en dispositivos con presupuesto estricto de RAM o flash, el modelo devuelve configuraciones ajustadas al límite indicado, que después se validan empíricamente.
- Semilla de búsqueda automática de hiperparámetros: la recomendación se usa como punto de partida de una búsqueda que mide cada candidato sobre los datos reales del usuario, reduciendo el número de evaluaciones necesarias.
- Asistente interactivo para científicos de datos: la aplicación Streamlit del repositorio expone el adaptador como interfaz conversacional para explorar configuraciones HDC sin escribir código.
- Prototipado de clasificadores para señales de sensores: en flujos de bioseñales, acelerómetros o datos de sensores de bajo consumo, el modelo sugiere la codificación HDC adecuada antes de entrenar el clasificador final.
- Servicio multi-inquiloto con vLLM: al ser un adaptador LoRA, puede servirse junto al modelo base y otros adaptadores sobre la misma GPU, reduciendo el coste por tarea especializada.
- Destilación de literatura técnica como patrón reutilizable: el repositorio sirve de plantilla metodológica para convertir un corpus de papers de un dominio concreto en un adaptador pequeño en lugar de un sistema RAG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del autor no incluye métricas cuantitativas (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones específicas de acierto en la recomendación de configuraciones HDC), ni comparaciones con el pipeline RAG original o con el modelo base sin ajustar.

## Requisitos de hardware

- Adaptador: 0,3 GB en disco; 80,7 M de parámetros entrenables, aproximadamente 0,16 GB en bfloat16.
- Modelo base en bfloat16: unos 15,2 GB solo en pesos (7,61 B de parámetros a 2 bytes), más la caché KV; en la práctica requiere del orden de 18-20 GB de VRAM con contextos moderados.
- Modelo base en 8 bits: en torno a 8 GB de VRAM.
- Modelo base en 4 bits (NF4, GPTQ o AWQ): en torno a 4,5-5,5 GB de VRAM.
- GPU recomendadas: A100 40 GB u 80 GB, H100 y L40S para servicio en bfloat16 con concurrencia; RTX 4090 o RTX 3090 (24 GB) para bfloat16 en un solo usuario.
- Cabe en GPU de consumo: sí, con matices. RTX 4090 y RTX 3090 en bfloat16 con contexto limitado; RTX 4080 (16 GB) en 8 bits; RTX 3060 (12 GB) en 4 bits.
- Opciones de despliegue: transformers + PEFT (ruta oficial documentada en la ficha), vLLM con soporte LoRA, TGI con adaptadores LoRA. Para llama.cpp u Ollama es necesario fusionar el adaptador con el modelo base (`merge_and_unload`) y convertir el resultado a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No existen alternativas directas publicadas para la tarea específica (recomendación de configuraciones de codificación HDC), por lo que la comparación se limita a modelos de tamaño y familia comparables. Los datos del modelo base y de las alternativas provienen de su documentación pública respectiva, no de la ficha del adaptador.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rag-to-lora-qwen2.5-7b | 80,7 M entrenables sobre base de 7,61 B | Heredado del base (32.768 tokens nativos) | Adaptador LoRA especializado en HDC | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen2.5-7B-Instruct | 7,61 B | 32.768 tokens nativos, 131.072 con YaRN | Modelo instructivo de propósito general | Apache 2.0 | HuggingFace |
| Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Modelo instructivo de propósito general | Licencia comunitaria Llama 3.1 | HuggingFace, ampliamente desplegado |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | Modelo instructivo de propósito general | Apache 2.0 | HuggingFace |

Ninguno de los modelos de propósito general ofrece la tarea de recomendación de configuraciones HDC de forma nativa; requerirían ejemplos en el prompt o un pipeline RAG equivalente al que este adaptador reemplaza. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: el adaptador solo está entrenado para recomendar configuraciones de codificación HDC; fuera de esa tarea no aporta ninguna ventaja sobre el modelo base.
- Riesgo de alucinación: puede generar configuraciones sintácticamente válidas pero técnicamente inadecuadas para la tarea o el hardware indicados. El propio autor indica que la recomendación es un punto de partida y debe verificarse; la aplicación asociada lo hace de forma automática.
- Conjunto de entrenamiento pequeño: 1.519 pares con 168 de validación, lo que limita la cobertura de tareas poco representadas en el corpus de 1.518 artículos y aumenta el riesgo de sobreajuste a la distribución de ese corpus.
- Sesgo de fuente: las recomendaciones heredan los sesgos y el estado del arte recogido en la literatura indexada, con posible infrarrepresentación de enfoques recientes o poco citados.
- Idiomas: la ficha no declara idiomas soportados; no se especifica el idioma de los pares de entrenamiento, por lo que el comportamiento en castellano no está garantizado.
- Efecto sobre las capacidades generales: no se documenta si el ajuste LoRA degrada las capacidades originales del modelo base (código, matemáticas, tool calling, multilingüismo).
- Licencia: Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las del modelo base, también Apache 2.0.
- Falta de validación externa: 0 descargas y 0 likes en el repositorio; no existen informes independientes de reproducibilidad ni de calidad de las recomendaciones.
- Dependencia del prompt: la ficha remite a `src/recommender/prompts.py` del repositorio para el formato exacto de entrada; usar otro formato puede degradar gravemente la salida.
- Requisito de cómputo: pese al reducido tamaño del adaptador, la inferencia exige cargar el modelo base de 7,61 B, lo que impide ejecutarlo en dispositivos realmente limitados sin cuantización adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FardinJP/rag-to-lora-qwen2.5-7b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de código, interfaz y pipeline completo: https://github.com/FardinJalilPiran/rag-to-lora
- Prompts de referencia: `src/recommender/prompts.py` dentro del repositorio anterior
- Aplicación Streamlit: incluida en el repositorio anterior (no se proporciona URL directa)
