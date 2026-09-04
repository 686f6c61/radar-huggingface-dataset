# darioooooo0o/K2-Horizon-3.7B-GGUF

## Resumen

El modelo K2-Horizon-3.7B-GGUF es una cuantización en formato GGUF del modelo IFM/K2-Horizon-3.7B, desarrollado por IFM. Este repositorio, creado por darioooooo0o, ofrece cinco versiones cuantizadas (Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M y Q8_0) para su uso con llama.cpp. La arquitectura subyacente es la denominada K2-Horizon, que requiere una rama específica de llama.cpp (la rama `k2-official` del port de MBZUAI-IFM) para su ejecución, ya que la versión principal de llama.cpp no la soporta.

Los parámetros totales del modelo base son 5.058.255.360, a pesar de que el nombre indica 3.7B, lo que sugiere que podría tratarse de una arquitectura con parámetros activos menores, aunque la información disponible no lo confirma explícitamente. El modelo está pensado para la generación de texto y puede ejecutarse íntegramente en GPUs de consumo, como una RTX 3060 de 12 GB, sin necesidad de offload a CPU. La licencia Apache 2.0 facilita su uso comercial y su integración en proyectos de código abierto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 5.058.255.360 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha proporcionado información detallada sobre la arquitectura del modelo K2-Horizon-3.7B. El nombre de la familia, K2-Horizon, hace referencia a una arquitectura propia de IFM, pero no se describen sus componentes (tipo de transformer, MoE, SSM, etc.) en la información disponible. Tampoco se ofrecen datos sobre el proceso de entrenamiento, como el número de tokens, la composición del dataset o el uso de técnicas de alineación (RLHF, DPO, etc.).

La única información técnica disponible es que el repositorio contiene cuantizaciones GGUF del modelo base IFM/K2-Horizon-3.7B, convertidas con la rama oficial `k2-official` del port de llama.cpp de MBZUAI-IFM (commit 35999d101). Esta rama es necesaria para cargar y ejecutar el modelo, ya que el mainline de llama.cpp no soporta la arquitectura K2-Horizon.

## Capacidades

- Generación de texto en lenguaje natural, según el pipeline `text-generation` declarado en el repositorio.
- Ejecución local mediante llama.cpp con la rama `k2-official` de MBZUAI-IFM.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión, audio u otras capacidades multimodales.
- No se han publicado datos sobre capacidades multilingües; los idiomas soportados no están especificados.

## Casos de uso

- Asistente conversacional local: al ser un modelo pequeño que cabe íntegramente en una GPU de consumo, puede desplegarse en un servidor local o en un PC de sobremesa para ofrecer un chatbot privado sin dependencia de servicios en la nube.
- Generación de documentación técnica: puede utilizarse para redactar informes, descripciones de productos o documentación técnica a partir de instrucciones, gracias a su naturaleza de modelo de lenguaje.
- Resumen de textos largos: con una ventana de contexto configurable (por ejemplo, 8192 tokens en el ejemplo de uso), puede resumir documentos extensos, como artículos o actas de reuniones.
- Clasificación de texto: mediante prompting, puede adaptarse a tareas de clasificación, como el etiquetado automático de correos electrónicos, tickets de soporte o comentarios.
- Extracción de información: puede emplearse para extraer entidades o datos estructurados de textos no estructurados, como nombres, fechas o importes en facturas.
- Experimentación académica: al estar bajo licencia Apache 2.0 y disponible en GGUF, es adecuado para investigar la arquitectura K2-Horizon, probar técnicas de cuantización o comparar el rendimiento con otros modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tamaño de los archivos GGUF, Q3_K_M (~2.5 GB) requiere aproximadamente 3-4 GB de VRAM; Q4_K_S (~2.8 GB) y Q4_K_M (~2.9 GB) requieren unos 4-6 GB; Q5_K_M (~3.4 GB) unos 5-7 GB; y Q8_0 (~5.0 GB) unos 7-9 GB, dependiendo de la longitud del contexto y de la GPU.
- El autor indica que todos los quants se han verificado cargando y generando en una RTX 3060 de 12 GB, y que el modelo cabe entero en cualquier GPU moderna sin necesidad de offload a CPU.
- GPU recomendadas: RTX 3060 12GB, RTX 4060, RTX 4070 o cualquier GPU con al menos 6-8 GB de VRAM para las cuantizaciones Q4 y superiores.
- Opciones de despliegue: llama.cpp con la rama `k2-official` del repositorio MBZUAI-IFM/llama.cpp. No se mencionan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables para realizar una comparativa rigurosa. En la colección K2 Horizon de IFM existe un modelo K2-Horizon-7B, pero no se han proporcionado sus características técnicas ni resultados de rendimiento. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Requiere una versión específica de llama.cpp (rama `k2-official`) que no está integrada en el mainline; esto dificulta su uso en entornos estándar y puede suponer una barrera para su adopción.
- No se dispone de información sobre sesgos conocidos, riesgos de alucinación o limitaciones idiomáticas.
- El nombre del modelo (3.7B) no coincide con los parámetros totales (5.058.255.360); podría tratarse de una arquitectura con parámetros activos menores, pero no se confirma en la información disponible.
- Los idiomas soportados no están especificados, lo que limita su uso en aplicaciones multilingües sin una evaluación previa.
- No se han publicado benchmarks, por lo que el rendimiento en tareas estándar de NLP es desconocido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/darioooooo0o/K2-Horizon-3.7B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Repositorio de llama.cpp de MBZUAI-IFM (rama `k2-official`): https://github.com/MBZUAI-IFM/llama.cpp
- Colección K2 Horizon en Hugging Face: https://huggingface.co/collections/IFM/k2-horizon
- Contacto del autor en X: https://x.com/imdariotoo
