# darioooooo0o/K2-Horizon-MoVA-36B-A4B-GGUF

## Resumen

El modelo K2-Horizon-MoVA-36B-A4B-GGUF es una colección de cuantizaciones GGUF del modelo base IFM/K2-Horizon-MoVA-36B-A4B, desarrollado por la organización IFM. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 100 expertos y 8 activos, que emplea una arquitectura de atención denominada MoVA (mixture-of-value attention). El modelo base soporta una longitud de contexto de 512 000 tokens, lo que lo hace especialmente adecuado para tareas que requieren procesar documentos muy extensos o mantener conversaciones de largo alcance.

Esta versión cuantizada, creada por el usuario darioooooo0o, permite ejecutar el modelo en hardware de consumo mediante la descarga de pesos a CPU/RAM para los expertos, manteniendo la atención en GPU. Los archivos GGUF se generaron a partir de pesos en F16 sin usar imatrix, e incluyen cuantizaciones desde Q3_K_M hasta Q8_0. Es importante destacar que el modelo requiere una rama específica de llama.cpp (la rama `k2-official` del puerto de MBZUAI-IFM), ya que la versión principal de llama.cpp no soporta la arquitectura k2-horizon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención MoVA (mixture-of-value attention), 100 expertos, 8 activos |
| Parametros totales | 37 444 792 020 (~37,4 B) |
| Parametros activos | 4 B (según nomenclatura A4B, no confirmado) |
| Longitud de contexto | 512 000 tokens |
| Tipos de cuantizacion | Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q8_0 (K-quants, sin imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base K2-Horizon-MoVA-36B-A4B emplea una arquitectura MoE con atención MoVA, una variante de atención que combina múltiples cabezas de valor para mejorar la representación de información contextual. Con 100 expertos y 8 activos por token, el modelo logra un equilibrio entre capacidad y eficiencia computacional. La longitud de contexto de 512K tokens es una de sus características más destacadas, permitiendo procesar secuencias muy largas sin perder coherencia.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. La cuantización GGUF se realizó a partir de los pesos en F16 del modelo base, utilizando la rama `k2-official` de llama.cpp (puerto de MBZUAI-IFM, commit 35999d101). Los quants se generaron sin imatrix, lo que puede afectar ligeramente la precisión en comparación con cuantizaciones con imatrix.

## Capacidades

- Generación de texto y razonamiento general, al ser un modelo de lenguaje de gran tamaño.
- Manejo de contexto muy largo (512K tokens), adecuado para documentos extensos, análisis de código o conversaciones multi-turno prolongadas.
- Eficiencia en inferencia gracias a la arquitectura MoE con solo 8 expertos activos por token.
- Compatible con la rama `k2-official` de llama.cpp, que permite ejecutar el modelo en hardware de consumo mediante offload de expertos a CPU.
- No se han documentado capacidades específicas como tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Análisis de documentos legales o técnicos extensos: gracias a su contexto de 512K tokens, el modelo puede procesar contratos, informes o manuales completos en una sola pasada, resumiendo o extrayendo información relevante sin perder detalles.
- Asistentes conversacionales de largo alcance: en aplicaciones de atención al cliente o tutoría, el modelo puede mantener conversaciones con historial muy amplio, recordando interacciones previas sin necesidad de truncar el contexto.
- Generación y revisión de código en repositorios grandes: al poder abarcar archivos de código extensos, es útil para tareas de autocompletado, refactorización o explicación de código en proyectos de gran tamaño.
- Procesamiento de libros o investigaciones académicas: el modelo puede leer capítulos completos o artículos largos para generar resúmenes, responder preguntas o realizar análisis comparativos.
- Chatbots especializados en dominios con mucha documentación: por ejemplo, soporte técnico de productos con manuales extensos, donde el modelo puede consultar toda la documentación en contexto.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF y al offload de expertos a CPU, es posible ejecutar el modelo en GPUs de consumo (como RTX 3060 de 12 GB) para prototipos o aplicaciones de baja demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: según la cuantización, los archivos GGUF ocupan entre ~16,9 GB (Q3_K_M) y ~39 GB (Q8_0). Sin embargo, con el offload de expertos a CPU, es posible ejecutar el modelo en GPUs con 12 GB de VRAM, como la RTX 3060, según indica el autor.
- GPU recomendadas: cualquier GPU compatible con CUDA y suficiente VRAM para la cuantización elegida. Para uso en consumer, se sugiere al menos 12 GB de VRAM y utilizar la opción `--n-cpu-moe` para descargar pesos de expertos a RAM.
- Opciones de despliegue: llama.cpp (rama `k2-official`), incluyendo `llama-server` para servir el modelo como API. No se menciona compatibilidad con vLLM, Ollama u otros frameworks en la documentación.
- Latencia y throughput: no se proporcionan datos específicos. El autor indica que ajustar `-ub 2048` mejora el throughput de prefill en la ruta de offload a CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables con la misma arquitectura MoVA o características similares. La arquitectura k2-horizon es específica y no se han encontrado alternativas directas en la información proporcionada.

## Limitaciones y advertencias

- Requiere una versión específica de llama.cpp (rama `k2-official` del puerto de MBZUAI-IFM). El llama.cpp principal no soporta la arquitectura k2-horizon, por lo que no funcionará con builds estándar.
- Los quants se generaron sin imatrix, lo que puede degradar ligeramente la calidad de la salida en comparación con cuantizaciones con imatrix.
- No se ha documentado el comportamiento del modelo en cuanto a sesgos, alucinaciones o limitaciones idiomáticas. Se recomienda evaluar en el dominio de uso antes de desplegar en producción.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar los términos del modelo base y de los pesos cuantizados.
- El tamaño del repositorio es de 127,7 GB, lo que implica una descarga considerable si se desean todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: [https://huggingface.co/darioooooo0o/K2-Horizon-MoVA-36B-A4B-GGUF](https://huggingface.co/darioooooo0o/K2-Horizon-MoVA-36B-A4B-GGUF)
- Modelo base: [https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B](https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B)
- Repositorio de llama.cpp con soporte k2-horizon: [https://github.com/MBZUAI-IFM/llama.cpp](https://github.com/MBZUAI-IFM/llama.cpp)
