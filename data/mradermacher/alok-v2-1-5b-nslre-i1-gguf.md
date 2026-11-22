# mradermacher/Alok-v2-1.5B-NSLRE-i1-GGUF

## Resumen

Alok-v2-1.5B-NSLRE-i1-GGUF es la versión cuantizada con imatrix del modelo Alok-v2-1.5B-NSLRE, un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5B) desarrollado originalmente por shivrajgurjar y cuantizado por mradermacher. El modelo se presenta con etiquetas que lo asocian a razonamiento neuro-simbólico, búsqueda en árbol de Monte Carlo (MCTS), integración con SymPy y Z3, generación de código y razonamiento. Está publicado bajo licencia Apache 2.0.

La relevancia de esta ficha reside en que se trata de un modelo pequeño (1,5B parámetros) orientado a tareas de razonamiento y generación de código, lo que lo hace desplegable en hardware de consumo. La versión aquí documentada es una cuantización GGUF con calibración imatrix (i1), que ofrece múltiples niveles de compresión desde IQ1_S (~0,5 GB) hasta Q6_K (~1,4 GB), permitiendo su ejecución en CPU y GPU de gama baja mediante llama.cpp y herramientas compatibles.

No se dispone de información detallada sobre la arquitectura interna, la longitud de contexto ni la composición del dataset de entrenamiento en la información proporcionada. La model card del cuantizador se limita a describir el proceso de cuantización y los ficheros generados, sin detallar las capacidades o el entrenamiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, según library_name: transformers) |
| Parámetros totales | 1.543.714.304 (~1,5B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de fichero imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base shivrajgurjar/Alok-v2-1.5B-NSLRE en la información proporcionada. Las etiquetas del repositorio indican que se trata de un modelo orientado a razonamiento neuro-simbólico (neuro-symbolic), con integración de MCTS (Monte Carlo Tree Search), SymPy y Z3, lo que sugiere un enfoque híbrido que combina generación de lenguaje con herramientas simbólicas de resolución matemática y verificación formal. Sin embargo, no se especifica si esta integración forma parte del entrenamiento del modelo o de un pipeline externo.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card del cuantizador no incluye información sobre el proceso de entrenamiento del modelo original. La cuantización se realizó con calibración imatrix (weighted/imatrix quants), un método que utiliza un fichero de importancia de pesos para mejorar la calidad de las cuantizaciones de baja precisión, especialmente en el rango IQ1-IQ3.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y entrenado para interacción en inglés.
- Razonamiento neuro-simbólico: las etiquetas indican capacidades de razonamiento asistido por herramientas simbólicas (SymPy, Z3) y búsqueda MCTS.
- Generación de código: etiquetado explícitamente como "code-generation".
- Razonamiento matemático y formal: la integración con SymPy y Z3 sugiere capacidades para resolver problemas matemáticos y verificar lógica formal.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque las etiquetas MCTS y neuro-symbolic apuntan a flujos de razonamiento multi-paso.
- Capacidades multilingües: limitadas al inglés según el campo language: en.
- Capacidades especiales: no se documentan modos de pensamiento (thinking mode), visión ni audio.

## Casos de uso

- Generación de código asistida en local: con 1,5B parámetros y cuantizaciones de ~1 GB, el modelo puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp, integrándose en editores o scripts de generación de código.
- Resolución de problemas matemáticos con verificación simbólica: el modelo puede emplearse como generador de expresiones o pasos intermedios que luego se validan con SymPy o Z3 en un pipeline neuro-simbólico, reduciendo errores de cálculo.
- Prototipado de razonamiento multi-paso: las etiquetas MCTS sugieren su uso en entornos de búsqueda guiada donde el modelo propone pasos y un árbol de búsqueda selecciona la mejor trayectoria.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2/IQ3 permiten ejecutar el modelo en dispositivos con 1-2 GB de RAM/VRAM, útil para demos, pruebas de concepto y aplicaciones embebidas.
- Filtrado y clasificación de texto en inglés: como modelo conversacional pequeño, puede emplearse para tareas de extracción, resumen o clasificación en pipelines de bajo coste.
- Educación y experimentación en IA neuro-simbólica: sirve como base para investigar la integración de LLMs con solvers simbólicos en entornos académicos o de investigación con hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~0,5 GB (i1-IQ1_S) y ~1,4 GB (i1-Q6_K) solo para los pesos; añadir overhead de contexto KV cache (no cuantificado en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060 o superiores para cuantizaciones Q4-Q6 con contexto amplio.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El repositorio indica endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Alok-v2-1.5B-NSLRE-i1-GGUF | ~1,5B | no disponible | Apache 2.0 | GGUF (i1) | Razonamiento neuro-simbólico, MCTS, SymPy, Z3 |
| Qwen2.5-Coder-1.5B | ~1,5B | 32K (según versión) | Apache 2.0 | safetensors, GGUF | Generación de código, sin integración simbólica documentada |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | 32K (según versión) | MIT | safetensors, GGUF | Razonamiento destilado, sin herramientas simbólicas |
| SmolLM2-1.7B | ~1,7B | 8K | Apache 2.0 | safetensors, GGUF | Modelo generalista pequeño de Hugging Face |

Nota: los datos de contexto y rendimiento de los modelos comparativos no se han verificado en la información proporcionada y pueden variar según la versión.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un modelo entrenado principalmente en inglés, puede presentar sesgos culturales y lingüísticos propios de su dataset.
- Riesgo de alucinación: inherente a los modelos de 1,5B parámetros; la integración con herramientas simbólicas (SymPy, Z3) puede mitigar errores en matemáticas y lógica, pero no en texto libre.
- Limitaciones de contexto o idioma: el modelo está etiquetado solo para inglés (en); no se documenta soporte multilingüe. La longitud de contexto no está disponible, lo que impide garantizar conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, el modelo base y sus datos de entrenamiento pueden tener condiciones adicionales no documentadas aquí.
- Caveats para producción: las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad (la propia model card las describe como "for the desperate" o "very low quality"); para producción se recomienda Q4_K_M o superior. No hay benchmarks publicados que validen el rendimiento real.
- El repositorio tiene 0 likes y ~1.951 descargas, lo que indica una adopción limitada y poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face (cuantización i1): https://huggingface.co/mradermacher/Alok-v2-1.5B-NSLRE-i1-GGUF
- Modelo base: https://huggingface.co/shivrajgurjar/Alok-v2-1.5B-NSLRE
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Alok-v2-1.5B-NSLRE-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Alok-v2-1.5B-NSLRE-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
