# mradermacher/Ornith-1.5-Cyclos-1M-Uncensored-GGUF

## Resumen

Ornith-1.5-Cyclos-1M-Uncensored es un modelo de lenguaje multimodal de tipo mixture of experts (MoE) basado en la arquitectura Qwen3, desarrollado por abhaymin y posteriormente cuantizado a formato GGUF por mradermacher. El modelo combina procesamiento de texto y visión (gracias a un módulo de proyección multimodal incluido en la cuantización), y está pensado para tareas conversacionales con soporte de contexto largo mediante la técnica YARN. Su característica más distintiva es que se distribuye como versión "uncensored", es decir, sin los filtros de alineación de seguridad habituales, lo que puede resultar útil para investigación o aplicaciones que requieran respuestas sin restricciones editoriales, pero también implica riesgos de contenido dañino.

La versión GGUF incluye cuantizaciones estáticas desde Q2_K hasta Q8_0, con tamaños de archivo entre 13,3 y 37,9 GB, además de los proyectores de visión en f16 y Q8_0. El modelo totaliza 35.505.251.456 parámetros (35,5 mil millones), aunque al ser un MoE no se especifica el número de parámetros activos. Está licenciado bajo Apache 2.0 y su idioma declarado es el inglés. Al estar etiquetado como compatible con vLLM y SGLang, puede desplegarse en entornos de producción con estos motores de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3, con módulo de visión (multimodal) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (modelo MoE) |
| Longitud de contexto | no disponible (usa YARN para contexto largo) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo original es Ornith-1.5-Cyclos-1M-Uncensored, un modelo MoE basado en Qwen3 con capacidades de visión. Esta versión de HuggingFace es una cuantización estática realizada por mradermacher, que convierte los pesos al formato GGUF para su uso con llama.cpp, Ollama y otros motores compatibles. No se proporciona información sobre el proceso de entrenamiento: no se detallan los datos utilizados, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. La única innovación técnica destacable en la información disponible es el uso de YARN para extender la longitud de contexto, aunque no se especifica el valor exacto en tokens. El soporte multimodal se añade mediante un archivo mmproj separado que contiene el proyector de visión.

## Capacidades

- Generación de texto conversacional en inglés, orientada a tareas de chat.
- Entrada de imágenes gracias al módulo de visión (mmproj), lo que permite razonamiento multimodal básico.
- Contexto largo mediante YARN, aunque la longitud exacta no se ha publicado.
- Ausencia de filtros de seguridad o alineación ("uncensored"), lo que ofrece respuestas sin restricciones editoriales.
- Compatibilidad con motores de inferencia vLLM y SGLang, según las etiquetas del repositorio.
- No se confirma explícitamente el soporte de tool calling o function calling en la información disponible.

## Casos de uso

- Análisis de documentos extensos con imágenes: el modelo puede procesar textos largos y figuras en un mismo prompt, lo que resulta útil para revisar informes con gráficos, capturas o diagramas.
- Asistente de investigación sin restricciones: al ser uncensored, permite explorar temas sensibles o generar contenido que otros modelos filtran, siempre que se use de forma responsable y en entornos controlados.
- Despliegue en entornos de producción con vLLM o SGLang: su compatibilidad con estos motores permite integrarlo en APIs de inferencia de alto rendimiento.
- Experimentación con cuantización y modelos MoE: la disponibilidad de múltiples cuantizaciones facilita probar el equilibrio entre calidad, velocidad y uso de VRAM en hardware variado.
- Automatización de tareas de documentación multimodal: puede generar descripciones o resúmenes a partir de imágenes y texto en inglés, útil en sistemas de gestión documental.
- Uso en pipelines de RAG con contexto largo: aunque no se especifica la longitud exacta, el uso de YARN sugiere que puede manejar contextos amplios para recuperación aumentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Para la cuantización Q2_K (13,3 GB) se necesita una GPU con al menos 16 GB de VRAM, aunque el rendimiento será limitado por la baja precisión.
- Para Q4_K_S (20,5 GB), la opción recomendada según el autor, se requiere una GPU con 24 GB de VRAM, como una RTX 3090 o RTX 4090.
- Para Q6_K (29,3 GB) o Q8_0 (37,9 GB) se necesitan GPUs de 48 GB o más, como una A6000 o una A100 de 80 GB.
- También es posible ejecutar el modelo en CPU mediante llama.cpp, utilizando memoria RAM en lugar de VRAM; en ese caso, los requisitos de memoria son superiores al tamaño del archivo.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang y cualquier otro motor compatible con GGUF.
- No se dispone de datos publicados sobre latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros modelos comparables en la informacion disponible. El modelo puede considerarse una variante cuantizada de Ornith-1.5-Cyclos-1M-Uncensored, pero no se aportan métricas de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", no tiene filtros de seguridad, por lo que puede generar contenido dañino, ofensivo o ilegal si se le solicita.
- Solo está disponible en inglés, lo que limita su uso en entornos multilingües.
- No se ha publicado información sobre sesgos, datos de entrenamiento ni alineación, por lo que el riesgo de respuestas sesgadas o alucinaciones es elevado.
- La longitud de contexto exacta no se especifica, lo que dificulta planificar su uso en tareas que requieren ventanas de contexto muy amplias.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad sobre el contenido generado.
- Al ser una cuantización estática, la calidad de las respuestas puede degradarse en los niveles de precisión más bajos (Q2_K, Q3_K_S).
- No se confirma el soporte de tool calling, por lo que no se recomienda su uso en agentes que dependan de llamadas a funciones.

## Enlaces

- Repositorio del modelo GGUF: https://huggingface.co/mradermacher/Ornith-1.5-Cyclos-1M-Uncensored-GGUF
- Modelo base original: https://huggingface.co/abhaymin/Ornith-1.5-Cyclos-1M-Uncensored
- Página de descarga y overview: https://hf.tst.eu/model#Ornith-1.5-Cyclos-1M-Uncensored-GGUF
- Solicitudes de modelos y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
