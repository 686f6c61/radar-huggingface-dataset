# LlamaPal/Qwen3.5-4B-Freestyle-HauhauCS-Q4_K_M-GGUF

## Resumen

Qwen3.5-4B-Freestyle-HauhauCS-Q4_K_M-GGUF es un espejo comunitario de un archivo GGUF cuantizado a Q4_K_M derivado de un modelo de la familia Qwen3.5 de 4B parámetros, publicado por el usuario LlamaPal en Hugging Face. El repositorio no contiene un modelo entrenado desde cero ni una versión oficial de Alibaba: es una copia byte a byte del archivo `Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf` alojado en el repositorio de HauhauCS, con el mismo hash SHA-256 (`79e28eca...a962741`) y un tamaño de 2,7 GB.

El interés de esta ficha es doble. Por un lado, documenta un artefacto de inferencia listo para usar con llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python) en hardware de consumo, dado que una cuantización Q4_K_M de un modelo de ~4,2 mil millones de parámetros cabe en GPU con 6-8 GB de VRAM. Por otro, ilustra un patrón habitual en el ecosistema: repositorios de "mirror" que redistribuyen pesos comunitarios bajo una licencia declarada, sin model card técnica propia ni garantías de procedencia más allá del hash publicado.

La información disponible es muy limitada: no hay pipeline declarado, no se listan idiomas soportados, no hay benchmarks y la model card se limita a una tabla de archivo y a la atribución al autor original. Todo dato que no aparezca en esa documentación se marca en esta ficha como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre indica familia Qwen3.5; no se detalla en la model card) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.5-4B-Freestyle-HauhauCS-Q4_K_M.gguf`, 2,7 GB, SHA-256 `79e28ecacf84e75b6056cf4059636d435aa9eb67795780f7b7dbc7d32a962741`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento, la composición del dataset, el número de tokens vistos ni si hubo etapas de alineación (RLHF, DPO u otras). La model card del repositorio es un documento de distribución, no técnico: declara que el archivo es una copia sin modificar del GGUF de HauhauCS y remite a ese repositorio original para la documentación completa.

El único dato estructural verificable es el recuento de parámetros (4.205.751.296), coherente con un transformer denso de escala 4B. El nombre del repositorio sugiere una variante "Freestyle" derivada de una versión "Uncensored-Aggressive" de HauhauCS, lo que en la práctica comunitaria suele implicar un ajuste fino orientado a reducir rechazos; sin embargo, no hay en la información proporcionada ninguna descripción del método de ajuste, de los datos usados ni de las técnicas aplicadas. Cualquier afirmación adicional sobre arquitectura o entrenamiento sería especulativa.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio y el pipeline no declarado apuntan a un uso de chat, aunque no se detalla el formato de plantilla.
- Razonamiento y código: no disponible; no hay documentación que confirme ni descarte capacidades específicas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local: al ser GGUF Q4_K_M, es compatible con motores de inferencia basados en llama.cpp, lo que constituye su capacidad práctica más relevante.

## Casos de uso

- Inferencia local en portátil o equipo de sobremesa: el archivo de 2,7 GB permite cargar el modelo en llama.cpp u Ollama en GPUs de consumo con 6-8 GB de VRAM, útil para prototipos de chat sin conexión ni coste de API.
- Asistente de escritura offline: al ejecutarse en local, se puede integrar en editores o procesadores de texto para reescritura y generación de borradores sin enviar texto a servicios externos.
- Pruebas de pipelines de cuantización: sirve como caso de estudio para validar flujos de descarga, verificación por SHA-256 y carga de GGUF en entornos de CI.
- Evaluación de modelos comunitarios: útil para investigadores que comparan variantes ajustadas por la comunidad frente a los pesos oficiales de la misma familia, siempre que se documente la procedencia.
- Generación de texto en entornos aislados (air-gapped): al ser un archivo único y autónomo, encaja en despliegues sin acceso a Internet donde no se pueden descargar pesos desde repositorios oficiales.
- Chat de bajo coste en dispositivos con recursos limitados: la cuantización Q4_K_M reduce el peso a 2,7 GB, lo que permite ejecución en CPU con RAM moderada, aunque con latencia mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB para el archivo Q4_K_M (2,7 GB de pesos) más overhead de contexto KV; con ventanas de contexto largas el consumo crece de forma proporcional al contexto configurado.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090, A100, H100) puede ejecutar el modelo; en GPUs de gama alta el cuello de botella será la memoria de contexto, no los pesos.
- ¿Cabe en GPU de consumo? Sí, en la mayoría de modelos con 6-8 GB de VRAM; en GPUs con 4 GB puede requerir descarga parcial de capas a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en formato GGUF en la información disponible.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de contexto. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Freestyle-HauhauCS-Q4_K_M (este) | ~4,2 B | no disponible | GGUF Q4_K_M | Apache 2.0 | Mirror comunitario sin benchmarks |
| Qwen3.5-4B-Uncensored-HauhauCS-Aggressive (original) | ~4,2 B | no disponible | safetensors/GGUF (según repo original) | Apache 2.0 | Fuente del archivo espejado |
| Modelos oficiales de la familia Qwen3.5 de 4B | ~4,2 B | no disponible en esta ficha | safetensors, GGUF | según release oficial | Referencia de pesos no ajustados por la comunidad |
| Alternativas densas de ~4B (p. ej. Llama 3.2 3B, Phi-3.5-mini) | 3-4 B | variable según modelo | safetensors, GGUF | licencias propias | No se dispone de comparación de rendimiento con este artefacto |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa fiable entre este archivo y las alternativas.

## Limitaciones y advertencias

- Procedencia: es un mirror de un modelo comunitario, no una release oficial; la trazabilidad depende del hash publicado y del repositorio de origen.
- Ausencia de model card técnica: no hay información sobre datos de entrenamiento, sesgos, idiomas ni comportamiento esperado, lo que dificulta evaluar riesgos.
- Riesgo de alucinación: no cuantificado; como en cualquier modelo de 4B sin documentación de alineación, es esperable un riesgo apreciable en tareas factuales.
- Variante "Uncensored": el nombre del modelo original sugiere un ajuste orientado a reducir rechazos, lo que puede aumentar la probabilidad de contenido inapropiado o dañino; no hay documentación que lo confirme ni lo descarte.
- Licencia: Apache 2.0 declarada, permisiva para uso comercial, pero la responsabilidad sobre el cumplimiento recae en quien redistribuye; conviene verificar la licencia en el repositorio original.
- Idiomas y contexto: no disponibles; no se debe asumir soporte multilingüe ni una ventana de contexto concreta sin verificar la configuración del GGUF.
- Métricas de rendimiento: sin benchmarks publicados, no es recomendable usar este artefacto en producción sin una evaluación propia previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin señal de uso comunitario que permita inferir calidad o estabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/Qwen3.5-4B-Freestyle-HauhauCS-Q4_K_M-GGUF
- Repositorio original del modelo: https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Commit de origen citado en la model card: https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive/tree/c09cdbcdb1fefad6d335809d445621b5f5ba0c6e
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
