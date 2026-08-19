# mradermacher/Qwen3.5-9B-SOM-MPOA-i1-GGUF

## Resumen

Qwen3.5-9B-SOM-MPOA-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo base Qwen3.5-9B-SOM-MPOA, desarrollada por mradermacher. El modelo base es un ajuste fino de Qwen3.5-9B que incorpora las etiquetas "heretic", "uncensored", "decensored" y "abliterated", lo que indica que se ha eliminado el rechazo a contenido sensible o prohibido mediante técnicas de ablación de la dirección de rechazo. Esta versión en GGUF permite ejecutar el modelo en una amplia gama de hardware, desde CPUs hasta GPUs de consumo, con diferentes niveles de precisión.

El repositorio incluye 22 archivos de cuantización que van desde IQ1_S (2.8 GB) hasta Q6_K (7.5 GB), además de un archivo imatrix de 0.1 GB para generar cuantizaciones propias. El modelo tiene aproximadamente 8.95 mil millones de parámetros y está licenciado bajo Apache 2.0. Está orientado a usuarios que buscan una versión sin censura del modelo Qwen3.5-9B, con soporte conversacional y capacidad para ejecutarse en entornos locales.

La relevancia de esta publicación radica en la combinación de un modelo base de última generación (Qwen3.5) con un proceso de cuantización optimizado mediante imatrix, que mejora la calidad de las cuantizaciones de baja precisión. Esto permite desplegar un modelo de 9B en hardware modesto, manteniendo un equilibrio razonable entre tamaño, velocidad y calidad de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (≈8,95B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B-SOM-MPOA es un ajuste fino de Qwen3.5-9B, un transformer denso de aproximadamente 9 mil millones de parámetros. La arquitectura subyacente corresponde a la familia Qwen3.5, que integra avances en eficiencia arquitectónica y aprendizaje por refuerzo a escala, aunque los detalles específicos de capas, atención y normalización no se han proporcionado en la información disponible.

El proceso de cuantización realizado por mradermacher utiliza la técnica de imatrix (matriz de importancia) para calibrar las cuantizaciones, lo que mejora la calidad de los modelos de baja precisión (especialmente los IQ). El modelo base ha sido sometido a un proceso de "abliteración" (abliteration), que elimina la dirección de rechazo aprendida durante el entrenamiento, resultando en un modelo "uncensored" que no rechaza peticiones que el modelo original podría considerar inapropiadas. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o si se utilizó RLHF/DPO en el ajuste fino.

## Capacidades

- Generación de texto conversacional en inglés con tono natural.
- Razonamiento y respuesta a preguntas de diversa complejidad.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno.
- Soporte para tareas de código y matemáticas, heredado del modelo base Qwen3.5.
- Funcionamiento sin censura ni rechazo de contenido sensible (debido a la abliteración).
- Compatible con herramientas de inferencia que soporten GGUF (llama.cpp, Ollama, LM Studio, etc.).
- No se ha confirmado soporte para tool calling, agentes o visión en la información proporcionada.

## Casos de uso

- Asistente conversacional local sin restricciones de contenido: el modelo puede desplegarse en un portátil o mini-PC con 8 GB de RAM usando la cuantización Q4_K_M (5.7 GB) para mantener conversaciones fluidas sin depender de servicios en la nube.
- Generación de contenido creativo sin filtros: escritores y creadores pueden usarlo para redactar narrativas, guiones o diálogos que aborden temas tabú sin que el modelo se niegue a responder.
- Investigación sobre alineación y seguridad de modelos: el carácter "uncensored" permite estudiar cómo se comporta un modelo sin mecanismos de rechazo, útil para análisis académicos de sesgos y comportamientos emergentes.
- Desarrollo de chatbots para nichos específicos: comunidades que requieren respuestas sin moderación (p.ej., juegos de rol, ficción interactiva) pueden integrar el modelo mediante la API de llama.cpp en aplicaciones propias.
- Evaluación de cuantizaciones de baja precisión: los archivos IQ1_S e IQ2_XXS permiten probar el rendimiento de modelos extremadamente comprimidos en hardware de gama baja (Raspberry Pi, móviles) para tareas de clasificación o extracción de información.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones desde 2.8 GB, es viable ejecutar el modelo en GPUs con 4 GB de VRAM o incluso en CPU con suficiente RAM, para aplicaciones de procesamiento por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas. Se recomienda consultar la página del modelo base (0xA50C1A1/Qwen3.5-9B-SOM-MPOA) para posibles datos de rendimiento, aunque no se han encontrado en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, desde ~2.8 GB (IQ1_S) hasta ~7.5 GB (Q6_K). Para el recomendado Q4_K_M (5.7 GB) se necesitan al menos 8 GB de VRAM o RAM unificada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100. Las cuantizaciones más pequeñas (IQ1_S, IQ2_XXS) pueden ejecutarse en GPUs con 4 GB de VRAM como GTX 1650 o RTX 3050.
- Sí cabe en GPU de consumo: la mayoría de las cuantizaciones (hasta Q5_K_M) caben en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui (llama.cpp backend), y servidores compatibles con GGUF como llama-server.
- Latencia y throughput: no se han proporcionado datos medidos. En una RTX 4090, un modelo de 9B en Q4_K_M suele alcanzar 40-60 tokens/s; en CPU (32 GB RAM) se esperan 5-15 tokens/s dependiendo del número de núcleos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-SOM-MPOA-i1-GGUF | 8.95B | No disponible | Apache 2.0 | GGUF | Versión uncensored/abliterated, cuantizada con imatrix |
| Qwen3.5-9B (original) | ~9B | No disponible | Apache 2.0 | safetensors | Modelo base oficial, con alineación estándar |
| Qwen3-8B (GGUF) | 8B | No disponible | Apache 2.0 | GGUF | Generación anterior, sin abliteración |
| Llama 3.1 8B (GGUF) | 8B | 128K | Llama 3.1 | GGUF | Alternativa de Meta, con restricciones de uso |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia de esta versión es su carácter "uncensored" y la disponibilidad de cuantizaciones extremas (IQ1_S) que no se encuentran en los modelos oficiales.

## Limitaciones y advertencias

- El modelo ha sido abliterado y es "uncensored", lo que significa que puede generar contenido ofensivo, ilegal o peligroso sin filtros. No es adecuado para aplicaciones comerciales orientadas al público general sin moderación externa.
- Solo está disponible en inglés; no se ha confirmado soporte multilingüe.
- La calidad de las cuantizaciones muy agresivas (IQ1_S, IQ1_M) es significativamente inferior a la del modelo original; se recomienda usar al menos Q4_K_M para tareas que requieran precisión.
- No se han publicado evaluaciones de seguridad ni benchmarks; el comportamiento en producción es impredecible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales no documentadas en esta ficha.
- El repositorio no incluye el modelo en formato safetensors; solo GGUF. Para usar con transformers estándar, debe convertirse o descargarse el modelo base.
- El tamaño del repositorio (110 GB) se debe a la inclusión de todas las cuantizaciones; los usuarios deben descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/Qwen3.5-9B-SOM-MPOA-i1-GGUF
- Versión estática GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-SOM-MPOA-GGUF
- Modelo base: https://huggingface.co/0xA50C1A1/Qwen3.5-9B-SOM-MPOA
- Página de referencia de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
- Guía de configuración de Qwen 3.5 9B en 8GB GPU: https://insiderllm.com/guides/qwen-3-5-9b-setup-guide/
- Página de creador mradermacher: https://huggingface.co/mradermacher
