# mradermacher/RynnUnify-Agentic-Reasoner-i1-GGUF

## Resumen

RynnUnify-Agentic-Reasoner es un modelo de IA desarrollado por Alibaba DAMO Academy, orientado a la IA encarnada (embodied AI), el razonamiento visual y el razonamiento agéntico. El modelo se ha entrenado con aprendizaje por refuerzo, empleando una técnica denominada BCPO, según las etiquetas de su repositorio. La ficha que se presenta aquí corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un cuantizador conocido en la comunidad de Hugging Face que genera versiones comprimidas de modelos populares para su ejecución local con llama.cpp y herramientas compatibles.

El modelo base pesa aproximadamente 8.190 millones de parámetros (8,19 B, dato real extraído de los safetensors del repositorio), lo que lo sitúa en la categoría de modelos medianos ejecutables en hardware de consumo. Se trata de un modelo de visión (vision model), por lo que combina capacidades de comprensión de imágenes con razonamiento agéntico, un perfil poco frecuente que lo hace relevante para tareas de agentes que interactúan con entornos visuales. La licencia indicada en la model card es Apache 2.0 (con la denominación "alibaba-damo-academy" en los metadatos), lo que permite uso comercial.

Esta versión cuantizada con imatrix (importance matrix) ofrece más de veinte variantes de cuantización, desde IQ1_S (2,2 GB) hasta Q6_K (6,8 GB), permitiendo ajustar el equilibrio entre calidad, consumo de memoria y velocidad según el hardware disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal de visión, según librería transformers) |
| Parametros totales | 8.190.735.360 (~8,19 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (license_name: alibaba-damo-academy) |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Por las etiquetas del repositorio (embodied-ai, visual-reasoning, reinforcement-learning, bcpo), se trata de un modelo multimodal de visión entrenado con aprendizaje por refuerzo mediante una técnica llamada BCPO, cuyo significado exacto no se detalla en la información proporcionada. El pipeline del repositorio en Hugging Face figura como "reinforcement-learning", lo que confirma que el RL es una fase central de su entrenamiento.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni la presencia de fases SIFT/RLHF/DPO en los datos disponibles. La versión de mradermacher es una cuantización con imatrix (importance matrix), método que calcula la importancia de cada peso durante la cuantización usando un conjunto de datos de calibración, lo que generalmente produce mejor calidad que las cuantizaciones estáticas a igual tamaño.

## Capacidades

- Razonamiento visual: es un modelo de visión, capaz de procesar y razonar sobre imágenes (los archivos mmproj necesarios para la parte visual están en el repositorio estático de mradermacher).
- Razonamiento agéntico: diseñado para tareas de agentes (agentic reasoning), según la denominación del modelo base.
- IA encarnada (embodied AI): orientado a escenarios donde el agente percibe y actúa en entornos, posiblemente incluyendo interacción con interfaces o entornos simulados.
- Aprendizaje por refuerzo: entrenado con RL (BCPO), lo que sugiere capacidades de razonamiento multi-paso optimizadas por recompensa.
- Conversación: etiquetado como conversational.
- Tool calling / function calling: no disponible en la información proporcionada.
- Multilingüe: no; el idioma indicado es únicamente inglés.

## Casos de uso

- Agentes que operan interfaces gráficas (GUI agents): su perfil de razonamiento visual y agéntico lo hace adecuado para agentes que interpretan capturas de pantalla y deciden acciones paso a paso, aunque esta capacidad concreta no está confirmada en la documentación disponible.
- Investigación en IA encarnada: los equipos de investigación pueden usarlo como base para experimentos de agentes en entornos simulados, aprovechando su entrenamiento con RL y su licencia Apache 2.0.
- Razonamiento sobre imágenes en local: gracias a las cuantizaciones GGUF, se puede ejecutar en una GPU de consumo (o incluso CPU) para tareas de análisis visual con razonamiento, sin depender de APIs externas.
- Prototipado de pipelines multimodales: su compatibilidad con llama.cpp permite integrarlo rápidamente en prototipos que combinen entrada de imagen y generación de texto estructurado.
- Evaluación comparativa de cuantizaciones: con más de veinte variantes con imatrix, es un buen banco de pruebas para medir la degradación de calidad en tareas de razonamiento visual según el nivel de cuantización.
- Asistentes visuales conversacionales: su etiqueta conversational y su capacidad visual permiten construir asistentes que respondan preguntas sobre imágenes en inglés en entornos locales y privados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. Aproximadamente 2,2 GB para IQ1_S hasta 6,8 GB para Q6_K, más la memoria para el contexto y los archivos mmproj de la parte visual. Con una cuantización Q4_K_M (5,1 GB), un modelo de 8 B cabe con holgura en GPUs de 8 GB de VRAM.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090 o superiores para contextos largos y mayor velocidad. En CPU pura es ejecutable con velocidad limitada.
- Consumer GPU: sí, cualquier GPU moderna con 6-8 GB de VRAM admite las cuantizaciones de 2 a 5 GB; para Q6_K se recomiendan 8 GB o más.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers o vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Formato | Licencia |
|---|---|---|---|---|
| RynnUnify-Agentic-Reasoner | ~8,19 B | Visión + texto, agentic | GGUF (imatrix) / safetensors | Apache 2.0 |
| Qwen2.5-VL-7B (Alibaba) | 7 B | Visión + texto | GGUF / safetensors | Apache 2.0 |
| Llama 3.1 8B Vision (variantes) | 8 B | Visión + texto | GGUF / safetensors | Llama Community License |

Nota: no se dispone de datos de rendimiento para una comparación cuantitativa; la tabla anterior es orientativa por categoría de tamaño y modalidad.

## Limitaciones y advertencias

- Idioma: el modelo está indicado solo para inglés; no hay soporte declarado para castellano ni otros idiomas.
- Documentación escasa: la model card disponible es la del cuantizador (mradermacher), no del autor original; faltan detalles de arquitectura, contexto y benchmarks oficiales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido incorrecto; en tareas agénticas y visuales esto puede traducirse en acciones erróneas del agente.
- Cuantizaciones bajas: las variantes IQ1_S, IQ1_M y las Q2 presentan pérdida de calidad significativa (el propio autor las marca como "para desesperados" y "muy baja calidad").
- Archivos mmproj: la parte visual del modelo requiere los archivos mmproj del repositorio estático; sin ellos no funcionará la entrada de imágenes.
- Licencia: Apache 2.0 permite uso comercial, aunque el campo license_name "alibaba-damo-academy" sugiere revisar los términos originales del modelo base antes de despliegues comerciales.
- Sesgos conocidos: no disponible.

## Enlaces

- Repositorio cuantizado (imatrix GGUF): https://huggingface.co/mradermacher/RynnUnify-Agentic-Reasoner-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/RynnUnify-Agentic-Reasoner-GGUF
- Modelo base: https://huggingface.co/Alibaba-DAMO-Academy/RynnUnify-Agentic-Reasoner
- Página de descargas resumida: https://hf.tst.eu/model#RynnUnify-Agentic-Reasoner-i1-GGUF
- Paper, blog o demo oficial: no disponible
