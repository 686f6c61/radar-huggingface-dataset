# KomorAI/EngRandom_1.0_Pro

## Resumen

EngRandom_1.0_Pro es un modelo de lenguaje de tipo GPT-2 entrenado desde cero por el autor KomorAI, publicado en Hugging Face bajo licencia MIT. Se trata de un modelo experimental y de juguete (toy-model), concebido principalmente con fines educativos y de experimentación, no para uso en producción. Su arquitectura es un transformer decoder-only de dimensiones extremadamente reducidas: 2 capas, 64 dimensiones de embedding y una longitud de contexto de solo 64 tokens.

El modelo cuenta con 163.008 parámetros totales, lo que lo sitúa varios órdenes de magnitud por debajo de cualquier modelo de lenguaje moderno utilizable. Emplea un vocabulario propio construido a mano, compuesto por palabras sueltas en inglés, lo que limita severamente su capacidad de generalización y coherencia textual. El entrenamiento se realizó mediante un script alojado en Google Colab.

Su relevancia es puramente didáctica: sirve como ejemplo mínimo reproducible de cómo se construye y entrena un modelo GPT-2 desde cero, incluyendo la definición del vocabulario, el pipeline de tokenización y el bucle de entrenamiento. No debe confundirse con un modelo de propósito general ni evaluarse con los criterios habituales de benchmarks de NLP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 |
| Parámetros totales | 163.008 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 tokens |
| Tipos de cuantización | No disponible (se menciona GGUF en los tags, sin detallar variantes) |
| Idiomas soportados | Polaco (pl) e inglés (en), según los metadatos |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar (transformer decoder-only con atención causal), pero con una configuración mínima: 2 capas, 64 dimensiones ocultas y ventana de contexto de 64 tokens. El vocabulario es un diccionario propio construido manualmente a partir de palabras sueltas en inglés (sustantivos, verbos, adjetivos y adverbios), sin subword tokenization de tipo BPE ni SentencePiece. Esta decisión de diseño implica que cualquier token fuera de ese vocabulario no puede representarse, lo que restringe drásticamente el espacio de entrada.

El entrenamiento se llevó a cabo mediante un script en Google Colab, según indica la model card, aunque no se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones técnicas destacables (decodificación especulativa, atención lineal, etc.); se trata de una implementación básica orientada al aprendizaje. La fecha de creación registrada en Hugging Face es 2026-11-20, dato que conviene tratar con cautela por su carácter anómalo.

## Capacidades

- Generación de texto a nivel de token, limitada al vocabulario cerrado definido por el autor.
- Modelado de secuencias cortas (hasta 64 tokens) con atención causal.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües nominales (pl, en) según metadatos, aunque el vocabulario es exclusivamente inglés.
- No incorpora modo de razonamiento (thinking), visión, audio ni ninguna modalidad adicional.

## Casos de uso

- Docencia sobre arquitecturas transformer: sirve para ilustrar, con un modelo mínimo y reproducible, cómo se define un vocabulario, se construye un bloque GPT-2 y se ejecuta el bucle de entrenamiento en un entorno como Google Colab.
- Experimentación con tokenización: permite estudiar el impacto de un vocabulario manual cerrado frente a tokenizadores BPE, observando la degradación de la generación cuando la entrada contiene palabras fuera del vocabulario.
- Pruebas de pipelines de despliegue: al publicarse en safetensors y GGUF, puede utilizarse para validar flujos de carga e inferencia en herramientas de despliegue ligeras, sin coste computacional apreciable.
- Reproducibilidad de experimentos de juguete: su reducido tamaño (163.008 parámetros) permite entrenar y evaluar variantes en minutos, útil para comparar hiperparámetros en cursos de machine learning.
- Tests de integración en CI: al ser tan pequeño, puede incluirse como modelo de prueba en suites automatizadas que verifiquen la compatibilidad de librerías de inferencia (transformers, llama.cpp) sin consumir recursos de GPU.
- Demostraciones de limitaciones de los LLM: ejemplifica de forma tangible por qué un contexto de 64 tokens y un vocabulario cerrado impiden tareas de generación realistas, útil en charlas divulgativas sobre escalado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización; con 163.008 parámetros en fp32, el peso del modelo ocupa aproximadamente 0,65 MB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin dificultad.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en dispositivos de bajos recursos.
- Opciones de despliegue: transformers (PyTorch), llama.cpp y Ollama a través del formato GGUF; vLLM y TGI no están justificados para este tamaño, aunque no se documenta su compatibilidad.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, la latencia sería del orden de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EngRandom_1.0_Pro | 163.008 | 64 tokens | MIT | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Hugging Face |
| DistilGPT-2 | 82 M | 1.024 tokens | Apache 2.0 | Hugging Face |

La comparación con GPT-2 small y DistilGPT-2 resulta desfavorable en todos los ejes (parámetros, contexto y calidad de generación), pero ilustra la diferencia entre un modelo de juguete y un modelo pequeño entrenado con corpus a gran escala. No se dispone de datos de rendimiento del modelo analizado para comparar métricas.

## Limitaciones y advertencias

- Vocabulario cerrado y manual: cualquier palabra fuera de la lista definida no puede tokenizarse, lo que rompe la generación con entradas naturales.
- Contexto de solo 64 tokens: insuficiente para conversaciones multi-turno, documentos o código.
- Calidad de generación muy baja: con 2 capas y 64 dimensiones, la coherencia textual es prácticamente nula.
- Sesgos conocidos: no documentados; el vocabulario incluye términos coloquiales y potencialmente ofensivos que podrían aparecer en salidas.
- Riesgo de alucinación: total, al no haber aprendido hechos ni patrones lingüísticos generales.
- Idiomas: aunque los metadatos declaran pl y en, el vocabulario es solo inglés, por lo que el soporte real del polaco es inexistente.
- Licencia MIT: permite uso comercial, pero el modelo no es apto para producción por sus limitaciones técnicas.
- Fecha de creación anómala (2026-11-20): conviene verificar la procedencia y el estado del repositorio antes de reutilizarlo.

## Enlaces

- Hugging Face: https://huggingface.co/KomorAI/EngRandom_1.0_Pro
