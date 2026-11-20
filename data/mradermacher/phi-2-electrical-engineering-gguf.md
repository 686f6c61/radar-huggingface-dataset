# mradermacher/phi-2-electrical-engineering-GGUF

## Resumen

Phi-2-electrical-engineering es un ajuste fino del modelo Phi-2 de Microsoft, especializado en ingeniería eléctrica, desarrollado por STEM-AI-mtl. Sobre la arquitectura original de Phi-2 (transformer denso de 2.780 millones de parámetros), este modelo ha sido entrenado adicionalmente con el dataset Electrical-engineering y el corpus Open-Platypus para reforzar el razonamiento técnico en el dominio de la ingeniería eléctrica. La versión aquí descrita es la cuantización GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo resuelve la necesidad de un asistente técnico ligero y ejecutable en local para consultas de ingeniería eléctrica: cálculo de circuitos, interpretación de especificaciones de componentes, normativa y resolución de problemas. Su tamaño compacto (2,78 mil millones de parámetros) lo hace viable en GPUs de gama media e incluso en CPU, con cuantizaciones que van desde 1,2 GB (Q2_K) hasta 5,7 GB (f16).

Es relevante ahora porque demuestra el patrón de especialización vertical sobre modelos base pequeños: en lugar de desplegar un modelo generalista enorme, se parte de un modelo eficiente y se ajusta con datos de dominio. La licencia, sin embargo, es restrictiva (stem.ai.mtl), lo que limita su uso comercial sin revisión legal previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Phi-2 de Microsoft) |
| Parámetros totales | 2.779.683.840 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | stem.ai.mtl (licencia "other", no comercial sin revisión) |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-2: un transformer denso de 2,78 mil millones de parámetros con atención multi-cabeza estándar y una longitud de contexto que no se especifica en la información disponible (Phi-2 original soporta 2.048 tokens, pero este dato no se confirma para el ajuste). El ajuste fino se realizó sobre el checkpoint base de Microsoft Phi-2, partiendo del modelo ya especializado de STEM-AI-mtl.

Los datos de entrenamiento declarados son el dataset STEM-AI-mtl/Electrical-engineering, orientado a contenido técnico del dominio, y garage-bAInd/Open-Platypus, un corpus de instrucciones de razonamiento general. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Las cuantizaciones publicadas por mradermacher son estáticas (quantize_version 2, output_tensor_quantised 1); el autor indica que no hay cuantizaciones ponderadas o imatrix disponibles en el momento de la publicación.

## Capacidades

- Generación de texto técnico en inglés orientado a ingeniería eléctrica.
- Razonamiento sobre conceptos de circuitos, componentes y especificaciones.
- Resolución de problemas de cálculo aplicado al dominio (tensiones, corrientes, potencias).
- Explicación de normativa y buenas prácticas de ingeniería eléctrica.
- Respuesta a preguntas de tipo instructivo gracias al ajuste con Open-Platypus.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: limitadas al inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente técnico de consulta en local: desplegado con llama.cpp u Ollama, el modelo responde preguntas de ingeniería eléctrica sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad industrial.
- Cálculo y verificación de circuitos: el ajuste con datos de ingeniería eléctrica permite resolver ejercicios de dimensionado de componentes y comprobar resultados numéricos en un bucle de validación humana.
- Formación y docencia: generación de explicaciones y ejercicios resueltos para estudiantes de ingeniería eléctrica, ejecutable en un portátil con GPU de 4-8 GB.
- Documentación técnica asistida: redacción y resumen de fichas de componentes y procedimientos, con la salvedad de que el contexto es limitado y conviene trocear documentos largos.
- Prototipado de chatbots de dominio: base para un asistente especializado en una empresa del sector, con ajuste adicional sobre documentación interna.
- Filtrado y clasificación de consultas técnicas: uso del modelo para etiquetar o enrutar tickets de soporte relacionados con ingeniería eléctrica en pipelines internos.
- Experimentación académica: estudio de especialización vertical sobre modelos pequeños, comparando el efecto del ajuste de dominio frente a Phi-2 base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,5 GB (Q2_K) y 6,5 GB (f16) aproximadamente, incluyendo overhead de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para las cuantizaciones mayores; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más para cuantizaciones Q4_K_S/Q4_K_M (1,7-1,9 GB de pesos).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el modelo base en safetensors requiere transformers.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Formato |
|---|---|---|---|---|---|
| phi-2-electrical-engineering (este) | 2,78 B | no disponible | stem.ai.mtl | Ingeniería eléctrica | GGUF, safetensors |
| Microsoft Phi-2 | 2,78 B | 2.048 tokens | MIT | Generalista | safetensors, GGUF |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 | Generalista con multilingüe | safetensors, GGUF |
| Llama-3.2-3B-Instruct | 3,21 B | 131.072 tokens | Llama 3.2 Community | Generalista multilingüe | safetensors, GGUF |

La ventaja de este modelo frente a los generalistas es la especialización de dominio; la desventaja es una licencia más restrictiva, menor contexto y ausencia de benchmarks publicados que permitan comparar su calidad real en tareas de ingeniería eléctrica.

## Limitaciones y advertencias

- Licencia stem.ai.mtl: no es una licencia de código abierto estándar; el uso comercial requiere revisión legal y posiblemente autorización del autor.
- Solo inglés: no soporta castellano ni otros idiomas de forma fiable.
- Riesgo de alucinación en cálculos técnicos: al ser un modelo de 2,78 B, los errores numéricos en problemas de ingeniería son probables; requiere validación humana.
- Contexto limitado (no confirmado, pero heredado de Phi-2): no apto para documentos largos sin troceado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente a Phi-2 base en el dominio.
- Cuantizaciones estáticas sin imatrix: las versiones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior.
- Modelo de nicho con pocas descargas (215) y un solo "like": comunidad pequeña, menor soporte y validación externa.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/phi-2-electrical-engineering-GGUF
- Modelo base: https://huggingface.co/STEM-AI-mtl/phi-2-electrical-engineering
- Página de descargas del autor: https://hf.tst.eu/model#phi-2-electrical-engineering-GGUF
- Dataset Electrical-engineering: https://huggingface.co/datasets/STEM-AI-mtl/Electrical-engineering
- Dataset Open-Platypus: https://huggingface.co/datasets/garage-bAInd/Open-Platypus
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
