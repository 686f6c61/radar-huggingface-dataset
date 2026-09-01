# llm-jp/llm-jp-4-vl-9b

## Resumen

LLM-jp-4-VL 9B es un modelo de vision-lenguaje (VLM) desarrollado por LLM-jp, un consorcio de investigacion liderado por el National Institute of Informatics (NII) de Japon. El modelo combina el modelo de lenguaje llm-jp-4-8b-thinking (8,6B parametros) con el codificador visual SigLIP 2 So400m (0,4B parametros) y un proyector MLP de 2 capas, siguiendo una arquitectura inspirada en InternVL3.0. Esta disenado para tareas que requieren comprension conjunta de imagenes y texto, con un enfasis especial en el idioma japones.

La version estable del modelo, publicada en agosto de 2026, mejora significativamente a la version beta anterior. Se ha entrenado exclusivamente con datasets que no presentan problemas de licencia para uso comercial, y se ha potenciado su capacidad de razonamiento: el modelo genera un analisis intermedio (reasoning trace) antes de producir la respuesta final. Los resultados de evaluacion muestran mejoras notables en tareas de solo texto y en benchmarks de comprension de graficos complejos como CharXiv y HakushoBench.

El modelo tiene 9.054.667.200 parametros en total, soporta un contexto de hasta 32.000 tokens en generacion y esta disponible bajo licencia Apache 2.0, lo que lo hace atractivo para despliegues comerciales y de investigacion. Su naturaleza bilingue (ingles y japones) y su capacidad de razonamiento lo posicionan como una opcion solida para aplicaciones de vision artificial en entornos empresariales y academicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (LLM + vision encoder + proyector MLP), inspirada en InternVL3.0 |
| Parametros totales | 9.054.667.200 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.000 tokens (max_new_tokens en evaluacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles, japones |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de vision-lenguaje compuesta por tres componentes: el modelo de lenguaje llm-jp-4-8b-thinking (8,6B parametros), el codificador visual SigLIP 2 So400m (0,4B parametros) y un proyector ligero de 2 capas MLP. Esta estructura esta inspirada en InternVL3.0 y utiliza un esquema de tiling dinamico para procesar imagenes de alta resolucion, dividiendo la imagen en tiles segun su relacion de aspecto.

El entrenamiento se realizo en una sola etapa durante 120.000 pasos, con los tres componentes entrenables desde el inicio (sin fase de warmup solo para el proyector ni congelacion del backbone). Se utilizaron tasas de aprendizaje maximas diferenciadas: 2e-5 para el modelo de lenguaje y el codificador visual, y 1e-4 para el proyector. El scheduler de aprendizaje sigue el esquema Warmup-Stable-Decay (WSD), con 2.000 pasos de warmup y decaimiento lineal a partir del 80% del entrenamiento.

Los datos de entrenamiento combinan cuatro datasets que suman aproximadamente 29,3 millones de muestras: Jagle (9,2M, dataset multimodal japones), RefinedVision (12,0M, version refinada de FineVision con subconjuntos filtrados por licencia y calidad), un subconjunto de Nemotron-Image-Training-v3 (5,0M, dataset multimodal ingles de NVIDIA) y llm-jp-4-thinking-sft-data (3,2M, dataset de razonamiento en japones solo texto). Todos los datasets fueron seleccionados o regenerados para evitar problemas de licencia o terminos de uso en aplicaciones comerciales.

## Capacidades

- Comprension de imagenes y texto: el modelo procesa entradas multimodales y genera respuestas textuales, incluyendo descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Razonamiento con analisis intermedio: genera un canal de analisis (reasoning trace) antes de la respuesta final, lo que mejora la precision en tareas complejas de razonamiento.
- Soporte bilingue: opera en ingles y japones, con datasets de entrenamiento especificos para cada idioma.
- Comprension de graficos y tablas: evaluado en benchmarks como CharXiv y HakushoBench, muestra mejoras significativas en comprension de graficos complejos y datos tabulares.
- Capacidades de solo texto: conserva las habilidades de razonamiento del modelo base llm-jp-4-8b-thinking en tareas puramente textuales.
- Chat template personalizado: utiliza un formato basado en OpenAI Harmony con canales separados para analisis y respuesta final, facilitando la integracion en sistemas conversacionales.

## Casos de uso

- Analisis de documentos empresariales: el modelo puede extraer y razonar sobre informacion contenida en graficos, tablas y diagramas dentro de informes financieros o tecnicos, gracias a su capacidad de comprension de graficos complejos y su ventana de contexto de 32.000 tokens.
- Atencion al cliente multimodal: integrado en sistemas de soporte, puede recibir capturas de pantalla o fotos de productos y generar respuestas contextualizadas en japones o ingles, con razonamiento intermedio para diagnosticar problemas.
- Generacion de descripciones accesibles: creacion automatica de descripciones alternativas (alt text) para imagenes en sitios web o aplicaciones, con soporte bilingue para audiencias japonesas e internacionales.
- Asistente de programacion visual: combinado con su capacidad de razonamiento, puede analizar diagramas de arquitectura, diagramas de flujo o capturas de interfaces y sugerir implementaciones de codigo o detectar errores de diseno.
- Educacion y formacion: generacion de explicaciones paso a paso sobre figuras cientificas, graficos estadisticos o esquemas tecnicos, con razonamiento intermedio que facilita la comprension pedagogica.
- Moderacion de contenido visual: analisis de imagenes para detectar contenido inapropiado o generar informes descriptivos, aprovechando su entrenamiento con datasets filtrados por calidad y licencia.
- Investigacion academica: como modelo de referencia para estudios comparativos en VLM, especialmente en el contexto japones, donde hay menos modelos abiertos de este tipo disponibles.

## Benchmarks y rendimiento

No se han publicado resultados numericos detallados de benchmarks en la informacion disponible. La model card indica que el modelo fue evaluado con el framework simple-evals-mm en una suite amplia de benchmarks multimodales y de solo texto en ingles y japones, y que muestra mejoras sobre la version beta, particularmente en tareas de solo texto y en benchmarks de comprension de graficos como CharXiv y HakushoBench. Las evaluaciones se realizaron con decodificacion greedy (temperature=0.0), max_new_tokens=32k y razonamiento de esfuerzo medio. No se proporcionan cifras concretas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 9.054.667.200 parametros en precision FP16, el modelo requiere aproximadamente 18 GB de VRAM solo para los pesos, por lo que se necesitarian al menos 24 GB para inferencia con contexto largo.
- GPU recomendadas: no disponible oficialmente. Por tamano, una GPU con 24 GB o mas (RTX 3090/4090, A10G, A100 40GB) seria adecuada para FP16. Con cuantizacion a 8 bits o 4 bits, podria caber en GPUs de 16 GB o menos.
- Compatibilidad con GPU de consumo: posible con cuantizacion (por ejemplo, GGUF de 4 bits) en GPUs de 16 GB como RTX 4080 o RTX 4090, aunque no se han publicado archivos GGUF oficiales.
- Opciones de despliegue: compatible con transformers (HuggingFace), y el repositorio de GitHub proporciona codigo de ejemplo para inferencia. No se mencionan integraciones especificas con vLLM, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLM-jp-4-VL 9B | 9,05B | 32k tokens | en, ja | Apache 2.0 | HuggingFace |
| LLM-jp-4-VL 9B beta | 9,05B | no disponible | en, ja | Apache 2.0 | HuggingFace |
| Qwen3.5-9B | 9B (aprox.) | no disponible | multilingue | no disponible | no disponible |
| Gemma-4-12B | 12B (aprox.) | no disponible | multilingue | no disponible | no disponible |

La comparativa se basa en los modelos mencionados como lineas base en la model card. No se dispone de datos detallados de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos en la informacion disponible, pero al ser un modelo entrenado principalmente con datos en ingles y japones, puede presentar limitaciones en otros idiomas o contextos culturales.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido inexacto o inventado, especialmente en tareas visuales donde la interpretacion de la imagen es ambigua.
- Limitaciones de contexto: la ventana de contexto de 32.000 tokens puede ser insuficiente para documentos muy largos o conversaciones extensas con muchas imagenes.
- Restricciones de licencia: aunque la licencia es Apache 2.0, los datasets de entrenamiento fueron filtrados para evitar problemas de licencia, pero el usuario debe verificar el cumplimiento de las condiciones de uso de los datasets originales si planea redistribuir o modificar el modelo.
- Limitaciones de idioma: el modelo solo soporta ingles y japones, lo que limita su uso en aplicaciones multilingues fuera de estos dos idiomas.
- Requisitos de hardware: el tamano del modelo (9B parametros) puede ser un obstaculo para despliegues en entornos con recursos limitados, requiriendo cuantizacion o hardware especializado.

## Enlaces

- HuggingFace: https://huggingface.co/llm-jp/llm-jp-4-vl-9b
- Blog oficial: https://llm-jp.nii.ac.jp/blog/llm-jp-4-vl-9b/
- Repositorio de codigo: https://github.com/llm-jp/llm-jp-4-vl
- Version beta: https://huggingface.co/llm-jp/llm-jp-4-vl-9b-beta
- Blog de la version beta: https://llm-jp.nii.ac.jp/blog/20260414_llm-jp-4-vl-9b-beta/
- Nota de prensa del NII: https://www.nii.ac.jp/news/2026/0901.html
- Dataset Jagle: https://huggingface.co/datasets/llm-jp/Jagle
- Dataset RefinedVision: https://huggingface.co/datasets/llm-jp/RefinedVision
- Dataset Nemotron-Image-Training-v3: https://huggingface.co/datasets/nvidia/Nemotron-Image-Training-v3
- Dataset llm-jp-4-thinking-sft-data: https://huggingface.co/datasets/llm-jp/llm-jp-4-thinking-sft-data
- Framework de evaluacion: https://github.com/llm-jp/simple-evals-mm
- Coleccion JAMMEval: https://huggingface.co/datasets/llm-jp/JAMMEval
- Benchmark HakushoBench: https://huggingface.co/datasets/llm-jp/HakushoBench
- Paper InternVL3.0: https://arxiv.org/abs/2504.10479
