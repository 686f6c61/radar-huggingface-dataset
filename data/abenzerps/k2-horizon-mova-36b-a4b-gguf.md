# abenzerps/K2-Horizon-MoVA-36B-A4B-GGUF

## Resumen

K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de tipo *sparse Mixture-of-Experts* (MoE) con atención *Mixture-of-Values* (MoVA), desarrollado por IFM (Instituto de IA de MBZUAI). Esta ficha describe la cuantización GGUF Q4_K_M publicada por abenzerps, que permite ejecutar el modelo con llama.cpp en hardware de consumo. El modelo original cuenta con 36.000 millones de parámetros totales, de los cuales aproximadamente 4.000 millones se activan por token, lo que reduce drásticamente el coste computacional en inferencia. Su característica más destacada es una ventana de contexto nativa de 524.288 tokens (512K), pensada para tareas que requieren procesar documentos extensos o mantener conversaciones de muy larga duración.

La cuantización GGUF mantiene la arquitectura completa y el vocabulario del modelo base, pero reduce el tamaño de los pesos a 22,37 GB (Q4_K_M), lo que permite su ejecución en GPUs con 24 GB de VRAM o más. El modelo es exclusivamente de texto, sin componente de visión, y su licencia Apache-2.0 permite uso comercial sin restricciones. Requiere una versión de llama.cpp con soporte para la arquitectura K2 Horizon, disponible en el fork oficial de MBZUAI-IFM hasta que se integre en el repositorio principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (MoE) con atención Mixture-of-Values (MoVA) |
| Parametros totales | 37.444.792.020 (36B) |
| Parametros activos | ~4.000.000.000 (4B) por token |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | Q4_K_M (única disponible en este repo) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base K2-Horizon-MoVA-36B-A4B emplea una arquitectura MoE con atención MoVA, una variante de atención que combina múltiples cabezas de valores para mejorar la expresividad sin aumentar el coste computacional de forma lineal. Con 36B parámetros totales y solo 4B activos por token, el modelo logra un equilibrio entre capacidad y eficiencia, similar a otros MoE como Mixtral o DeepSeek-V2. La ventana de contexto de 512K tokens es una de las más amplias entre modelos de su tamaño, lo que sugiere el uso de técnicas de atención eficiente (posiblemente atención dispersa o *sliding window*) aunque no se detallan en la documentación disponible.

No se han publicado datos sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la información proporcionada. La cuantización GGUF se realizó a partir del checkpoint oficial de IFM, manteniendo la tokenizer y la plantilla de chat originales. El archivo incluye metadatos de tokenizer y una plantilla de chat compatible, además de un archivo `chat_template.jinja` externo para clientes que lo necesiten.

## Capacidades

- Generación de texto y conversación multi-turno con contexto muy largo (hasta 512K tokens).
- Razonamiento y comprensión de documentos extensos, gracias a la ventana de contexto amplia.
- Soporte de chat con plantilla incluida en el GGUF, compatible con llama.cpp.
- Capacidad de procesar entradas de texto únicamente; no incluye visión ni audio.
- Eficiencia computacional alta por su naturaleza MoE con solo 4B parámetros activos por token.
- No se documenta soporte explícito de *tool calling* o *function calling* en la información disponible.

## Casos de uso

- Análisis de documentos legales extensos: el modelo puede procesar contratos, sentencias o expedientes completos de cientos de páginas en una sola pasada, gracias a su contexto de 512K tokens, permitiendo resúmenes, extracción de cláusulas o búsqueda de información específica sin fragmentar el texto.
- Asistencia en investigación académica: lectura y síntesis de artículos científicos largos, tesis o informes técnicos, manteniendo el contexto de todas las referencias y argumentos a lo largo de la conversación.
- Chatbots de atención al cliente con historial prolongado: al conservar toda la conversación en memoria, el modelo puede mantener coherencia en interacciones de muchas horas o días, sin perder detalles de interacciones anteriores.
- Generación de código en repositorios grandes: con contexto suficiente para incluir múltiples archivos de un proyecto, el modelo puede sugerir cambios, refactorizaciones o explicar el funcionamiento de módulos completos.
- Análisis de series de datos textuales: procesamiento de logs, transcripciones o feeds de noticias acumulados durante largos periodos, identificando tendencias o anomalías en un único prompt.
- Creación de contenido editorial de larga duración: redacción de novelas, guiones o informes extensos donde el modelo debe recordar la trama, los personajes o los datos mencionados en capítulos anteriores.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El README del repositorio incluye una imagen con resultados reportados por IFM para el modelo original, pero no se proporcionan los valores en texto. Por tanto, no es posible presentar una tabla comparativa fiable. Se recomienda consultar la página del modelo base en HuggingFace para obtener datos actualizados.

## Requisitos de hardware

- El archivo Q4_K_M ocupa 22,37 GB, por lo que se necesita al menos 24 GB de VRAM para cargar los pesos en GPU (por ejemplo, RTX 4090, RTX 3090, A100 40GB, etc.).
- Para utilizar la ventana de contexto completa de 512K tokens, la memoria de *key-value cache* adicional puede superar los 30 GB, requiriendo GPUs con 80 GB (A100/H100) o despliegue en CPU con RAM abundante.
- Con un contexto práctico de 128K tokens (como en el ejemplo del README), la VRAM total necesaria se estima en 30-40 GB, siendo viable en GPUs de 48 GB (A6000, L40S) o en configuraciones multi-GPU.
- El modelo se ejecuta con llama.cpp, utilizando el fork de MBZUAI-IFM que incluye soporte para la arquitectura K2 Horizon. También es compatible con servidores como llama-server o llama-cli.
- No se dispone de datos de latencia o throughput específicos para esta cuantización; dependerán del hardware y del contexto utilizado.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (MoE con contexto largo). El modelo base no ha sido comparado públicamente con alternativas como Mixtral 8x7B, DeepSeek-V2 o Qwen2.5-MoE en los datos proporcionados. Se recomienda consultar los benchmarks oficiales de IFM para obtener comparaciones.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha entrenado para otros idiomas, por lo que su rendimiento en español u otros idiomas será limitado.
- Requiere una versión específica de llama.cpp (fork de MBZUAI-IFM) que no está integrada en el repositorio principal; el uso con builds estándar puede fallar.
- La cuantización Q4_K_M puede introducir una ligera degradación en la calidad de generación respecto al modelo original en precisión completa, especialmente en tareas de razonamiento complejo.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado principalmente con datos en inglés, puede reflejar sesgos culturales o lingüísticos de ese dominio.
- El riesgo de alucinación no se ha evaluado públicamente; se recomienda verificar los hechos en aplicaciones críticas.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución y no utilizar marcas registradas de IFM sin permiso.

## Enlaces

- Repositorio GGUF: [abenzerps/K2-Horizon-MoVA-36B-A4B-GGUF](https://huggingface.co/abenzerps/K2-Horizon-MoVA-36B-A4B-GGUF)
- Modelo base: [IFM/K2-Horizon-MoVA-36B-A4B](https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B)
- Fork de llama.cpp con soporte K2 Horizon: [MBZUAI-IFM/llama.cpp](https://github.com/MBZUAI-IFM/llama.cpp/tree/model/K2Horizon)
- Licencia Apache-2.0: [https://www.apache.org/licenses/LICENSE-2.0](https://www.apache.org/licenses/LICENSE-2.0)
