# mradermacher/CounselTrajLM-Qwen3-8B-i1-GGUF

## Resumen

CounselTrajLM-Qwen3-8B-i1-GGUF es la versión cuantizada en formato GGUF del modelo CounselTrajLM-Qwen3-8B, desarrollado originalmente por UEC-InabaLab y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 8.190.735.360 parámetros (aproximadamente 8,2 mil millones) construido sobre la arquitectura Qwen3 y especializado en conversación y orientación psicológica (counseling). El modelo está etiquetado como "merged" y su idioma declarado es el chino (zh).

La relevancia de esta ficha reside en que ofrece una vía práctica para desplegar un modelo especializado en diálogo terapéutico en hardware de consumo, gracias a la amplia batería de cuantizaciones GGUF publicadas (desde 2,2 GB en IQ1_S hasta 6,8 GB en Q6_K). El repositorio incluye tanto cuantizaciones estáticas como cuantizaciones ponderadas con fichero imatrix, lo que permite ajustar el equilibrio entre tamaño, velocidad y calidad.

No se dispone de información sobre el proceso de entrenamiento, la composición del dataset ni los benchmarks del modelo base en la información proporcionada; esta ficha se limita a los datos verificables del repositorio y de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3; detalles no disponibles) |
| Parámetros totales | 8.190.735.360 (~8,2 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | chino (zh) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base es CounselTrajLM-Qwen3-8B, un modelo derivado de Qwen3 con aproximadamente 8,2 mil millones de parámetros. La model card indica que se trata de un modelo "merged", lo que sugiere una fusión de pesos (posiblemente de un ajuste fino sobre Qwen3 con otro componente), aunque no se detalla el procedimiento exacto de fusión ni los datos empleados. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

La versión aquí descrita es una cuantización GGUF realizada por mradermacher mediante cuantización ponderada con fichero imatrix (importancia matrix), una técnica que asigna precisión de forma no uniforme a los tensores según su relevancia para la perplejidad. Esto produce las cuantizaciones de la familia i1, que el autor considera preferibles frente a cuantizaciones estáticas de tamaño similar. También existe una versión estática de las mismas cuantizaciones en el repositorio CounselTrajLM-Qwen3-8B-GGUF.

## Capacidades

- Generación de texto conversacional en chino, orientada a diálogo de counseling.
- Modelado de trayectorias de conversación terapéutica (según las etiquetas "counseltraj" y "counseltrajlm").
- Conversación multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara chino (zh).
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Simulación de sesiones de orientación psicológica para investigación: el modelo puede generar respuestas de consejero en diálogos multi-turno en chino, útil para estudiar trayectorias conversacionales terapéuticas y para construir datasets sintéticos de diálogo.
- Formación de profesionales en entornos simulados: permite practicar entrevistas de counseling con un interlocutor automático, gracias a su especialización en el dominio y a la disponibilidad de cuantizaciones ligeras que reducen el coste de despliegue.
- Evaluación de técnicas de cuantización: el repositorio ofrece 25 variantes de cuantización con tamaños desde 2,2 GB hasta 6,8 GB, lo que lo convierte en un banco de pruebas ideal para medir el impacto de la cuantización en un modelo de diálogo especializado.
- Despliegue en hardware de consumo: con cuantizaciones i1-Q4_K_M (5,1 GB) o i1-Q4_K_S (4,9 GB) el modelo cabe en GPUs de consumo con 8 GB de VRAM, permitiendo prototipos locales de asistentes conversacionales en chino.
- Investigación en psicología computacional: al estar construido sobre Qwen3 y licenciado bajo Apache 2.0, puede integrarse en pipelines de análisis de diálogo y en estudios sobre respuestas empáticas generadas por LLM.
- Generación de datos sintéticos para ajuste fino: el modelo puede producir pares pregunta-respuesta de counseling en chino que sirvan para entrenar o aumentar datasets de modelos más pequeños especializados en el dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: aproximadamente 2,5-4 GB para IQ1/IQ2, 4-5,5 GB para IQ3/Q4, 5,5-7,5 GB para Q5/Q6 (los tamaños de fichero van de 2,2 GB a 6,8 GB; la VRAM necesaria añade el contexto y el overhead de la runtime).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las cuantizaciones mayores; A100/H100 no son necesarias para un modelo de 8 B en GGUF.
- Cabe en GPU de consumo: sí. Las cuantizaciones Q4 caben en GPUs de 8 GB; las Q6_K (6,8 GB) requieren 8-12 GB según el contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base (safetensors) se puede usar con transformers y, presumiblemente, con vLLM/TGI, aunque no se confirma en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| CounselTrajLM-Qwen3-8B (este) | ~8,2 B | no disponible | zh | Apache 2.0 | GGUF / safetensors |
| Qwen3-8B (base) | ~8 B | no disponible | multilingüe | Apache 2.0 | safetensors / GGUF |
| Llama 3.1 8B Instruct | ~8 B | 128 K | multilingüe | Llama 3.1 Community | safetensors / GGUF |

La comparación con Qwen3-8B y Llama 3.1 8B es pertinente por tamaño y licencia permisiva, pero no se dispone de datos de rendimiento del modelo especializado que permitan una comparación cuantitativa. No se conocen otros modelos públicos específicos de counseling en chino de este tamaño en la información disponible.

## Limitaciones y advertencias

- Modelo especializado en chino: no se declaran capacidades multilingües; su uso en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: como todo LLM, puede generar respuestas plausibles pero incorrectas, especialmente peligroso en un dominio de salud mental.
- No es un sustituto de atención psicológica profesional: no debe usarse como herramienta clínica sin supervisión humana.
- Sesgos: no se documentan sesgos conocidos, pero el modelo hereda los del corpus de entrenamiento de Qwen3 y del ajuste específico, no disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; conviene revisar la licencia del modelo base UEC-InabaLab/CounselTrajLM-Qwen3-8B.
- Las cuantizaciones de baja precisión (IQ1, IQ2, Q2_K) degradan la calidad de forma notable; el autor las etiqueta como "for the desperate" o "very low quality".
- No se dispone de información sobre la longitud de contexto efectiva ni sobre el proceso de entrenamiento, lo que dificulta evaluar su robustez en producción.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/CounselTrajLM-Qwen3-8B-i1-GGUF
- Modelo base: https://huggingface.co/UEC-InabaLab/CounselTrajLM-Qwen3-8B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/CounselTrajLM-Qwen3-8B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#CounselTrajLM-Qwen3-8B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
