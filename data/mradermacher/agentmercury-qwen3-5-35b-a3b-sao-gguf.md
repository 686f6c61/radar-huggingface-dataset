# mradermacher/AgentMercury-Qwen3.5-35B-A3B-SAO-GGUF

## Resumen

AgentMercury-Qwen3.5-35B-A3B-SAO es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35 000 millones de parámetros totales y 3 000 millones de parámetros activos, desarrollado por Minbyul y cuantizado a formato GGUF por mradermacher. El modelo base está diseñado específicamente para tareas de agente, uso de herramientas y protocolo MCP (Model Context Protocol), y ha sido entrenado con técnicas de aprendizaje por refuerzo basadas en actor-crítico y el método SAO (Self-Adaptive Optimization). Esta versión GGUF permite desplegar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles, manteniendo un equilibrio entre tamaño y calidad gracias a las distintas cuantizaciones ofrecidas.

La relevancia actual de este modelo radica en su orientación a sistemas agénticos y su capacidad multimodal (incluye un proyector mmproj), lo que lo hace adecuado para integrarse en pipelines de automatización, asistentes conversacionales y aplicaciones que requieren interacción con herramientas externas. Al estar licenciado bajo Apache 2.0, su uso comercial está permitido sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.5 |
| Parametros totales | 34 660 610 688 (~34,66 B) |
| Parametros activos | 3 B (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base AgentMercury-Qwen3.5-35B-A3B-SAO emplea una arquitectura MoE con 35 000 millones de parámetros totales y 3 000 millones activos por token, lo que reduce el coste computacional en inferencia en comparación con un modelo denso del mismo tamaño. Los tags del repositorio indican que fue entrenado mediante aprendizaje por refuerzo con un enfoque actor-crítico y el método SAO, aunque no se proporcionan detalles sobre el volumen de datos, la composición del dataset ni el proceso exacto de entrenamiento. El modelo incluye además un proyector multimodal (mmproj), lo que sugiere capacidades de procesamiento de imágenes o vídeo, aunque no se especifica la arquitectura de visión.

La cuantización GGUF ha sido realizada por mradermacher, ofreciendo múltiples niveles de precisión (desde Q2_K hasta Q8_0) para adaptarse a distintos requisitos de memoria y calidad. No se dispone de información sobre el contexto máximo soportado ni sobre técnicas de optimización adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento en inglés, con soporte para conversaciones multi-turno.
- Uso de herramientas (tool calling) y funciones (function calling), orientado a integración con APIs y servicios externos.
- Soporte de protocolo MCP (Model Context Protocol) para conectar el modelo con sistemas de gestión de contexto.
- Capacidades de agente autónomo, incluyendo planificación y ejecución de tareas multi-paso.
- Entrenamiento con aprendizaje por refuerzo (actor-crítico, SAO) que mejora la calidad de las respuestas en escenarios de interacción con herramientas.
- Capacidades multimodales (a través del proyector mmproj), aunque no se detalla qué tipos de entrada visual soporta.

## Casos de uso

- Asistentes virtuales con acceso a herramientas: el modelo puede gestionar conversaciones complejas y ejecutar llamadas a APIs, bases de datos o servicios web mediante tool calling, lo que lo hace adecuado para asistentes de soporte técnico o de productividad.
- Automatización de flujos de trabajo con MCP: al soportar el protocolo MCP, puede integrarse en sistemas que requieren mantener un contexto compartido entre múltiples agentes o aplicaciones, por ejemplo en orquestadores de tareas empresariales.
- Agentes de razonamiento multi-paso: gracias a su entrenamiento con RL y su arquitectura MoE, puede descomponer problemas complejos en subtareas y ejecutarlas secuencialmente, útil en análisis de datos o investigación automatizada.
- Generación de código asistida por herramientas: puede invocar intérpretes, compiladores o repositorios de código mediante tool calling, facilitando la generación y verificación de código en entornos de desarrollo.
- Procesamiento de documentos con entrada multimodal: si se utiliza el proyector mmproj, podría procesar imágenes o capturas de pantalla junto con texto, por ejemplo para extraer información de formularios o diagramas.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M o Q6_K permiten ejecutar el modelo en GPUs de consumo (24 GB de VRAM) o incluso en CPU con llama.cpp, habilitando prototipos y aplicaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (21,3 GB) se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090). Para Q8_0 (37 GB) se necesita una GPU con 48 GB o más (A6000, A100 80 GB, H100).
- GPU recomendadas: RTX 3090/4090 para cuantizaciones Q4 y Q6; A100 80 GB o H100 para Q8_0. También es posible ejecutar en CPU con suficiente RAM (por ejemplo, 32 GB para Q4_K_M).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. Para despliegue en producción con mayor throughput, se puede convertir a formatos como vLLM o TGI, aunque requeriría los pesos originales en safetensors.
- Latencia y throughput: no disponibles. Al ser un MoE con 3B activos, la velocidad de generación es superior a la de un modelo denso de 35B, pero depende del hardware y de la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos. El nombre sugiere una base similar a Qwen3-30B-A3B (también MoE con 30B totales y 3B activos), pero no hay datos de rendimiento ni de contexto que permitan una comparación objetiva. Se recomienda consultar la documentación del modelo base para más detalles.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés, por lo que su rendimiento en otros idiomas puede ser deficiente.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, puede presentar sesgos sociales, culturales o de género.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o cuando se le piden datos factuales.
- La longitud de contexto no está especificada; se desconoce si soporta ventanas largas (por ejemplo, 32K o 128K tokens), lo que limita su uso en tareas que requieren mucho contexto.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar significativamente la calidad de las respuestas; se recomienda usar Q4_K_M o superior para producción.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base puede tener dependencias o restricciones adicionales no documentadas en este repositorio.
- El repositorio GGUF no incluye los pesos originales en safetensors; para fine-tuning o despliegue con vLLM/TGI es necesario obtener el modelo base desde Minbyul/AgentMercury-Qwen3.5-35B-A3B-SAO.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AgentMercury-Qwen3.5-35B-A3B-SAO-GGUF
- Modelo base: https://huggingface.co/Minbyul/AgentMercury-Qwen3.5-35B-A3B-SAO
- Página de descarga y resumen: https://hf.tst.eu/model#AgentMercury-Qwen3.5-35B-A3B-SAO-GGUF
