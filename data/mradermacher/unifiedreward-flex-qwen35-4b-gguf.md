# mradermacher/UnifiedReward-Flex-qwen35-4b-GGUF

## Resumen

UnifiedReward-Flex-qwen35-4b-GGUF es la versión cuantizada en formato GGUF del modelo CodeGoat24/UnifiedReward-Flex-qwen35-4b, un modelo de recompensa (reward model) de aproximadamente 4.841 millones de parámetros construido sobre una base de la familia Qwen de 4B (según la nomenclatura "qwen35-4b" del identificador). El trabajo de cuantización lo firma mradermacher, un autor habitual en la publicación de versiones GGUF de modelos open source, y está pensado para su uso con llama.cpp y herramientas compatibles.

El modelo se ha afinado sobre el dataset CodeGoat24/UnifiedReward-Flex-SFT-90K, un conjunto de 90.000 ejemplos de ajuste supervisado orientado a tareas de evaluación y puntuación de respuestas. La relevancia de este tipo de modelos radica en su papel dentro de pipelines de alineamiento (RLHF, RLAIF, DPO) y en sistemas de enrutamiento o selección de respuestas (best-of-N, verificación de salidas).

Esta ficha describe la versión GGUF, que incluye cuantizaciones estáticas desde Q2_K hasta f16, además de ficheros mmproj para el componente multimodal, lo que permite desplegar el modelo en hardware de consumo con un tamaño de descarga de entre 2,2 GB y 9,8 GB según la cuantización elegida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen de 4B, según nomenclatura del modelo) |
| Parámetros totales | 4.841.450.496 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en transformers |
| Dataset de entrenamiento | CodeGoat24/UnifiedReward-Flex-SFT-90K |
| Modelo base | CodeGoat24/UnifiedReward-Flex-qwen35-4b |
| Tamaño del repositorio | 45,4 GB |
| Descargas | 167 |
| Likes | 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer derivado de una base Qwen de 4B. El modelo se ha ajustado mediante SFT sobre el dataset UnifiedReward-Flex-SFT-90K, compuesto por 90.000 ejemplos, presumiblemente orientados a la evaluación de respuestas generadas. No se especifican en la información proporcionada el número total de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO.

La versión aquí descrita es una cuantización estática realizada por mradermacher con `convert_type: hf` y `output_tensor_quantised: 1`. Se ofrecen también cuantizaciones ponderadas con imatrix en un repositorio separado (i1-GGUF). La presencia de ficheros mmproj (Q8_0 y f16) indica que el modelo base incorpora un componente multimodal, aunque la información disponible no especifica qué modalidades adicionales al texto soporta ni cómo se integra ese componente en la arquitectura.

## Capacidades

- Evaluación y puntuación de respuestas: el modelo está diseñado como reward model, por lo que su función principal es asignar puntuaciones a respuestas generadas.
- Procesamiento multimodal: la existencia de ficheros mmproj sugiere soporte para entradas multimodales (probablemente visión), aunque la información disponible no detalla el alcance exacto.
- Generación de texto conversacional: el tag `conversational` y la librería transformers indican uso en formato de diálogo.
- Idiomas: únicamente inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Alineamiento de modelos mediante RLHF/RLAIF: el modelo puede actuar como reward model para puntuar respuestas generadas por un modelo de política durante el entrenamiento, permitiendo construir señales de recompensa escalables sin anotación humana directa.
- Selección best-of-N en producción: dado un conjunto de N respuestas candidatas de un LLM, el reward model las puntúa y permite devolver la mejor, mejorando la calidad percibida con un coste de inferencia controlado (el modelo cabe en GPU de consumo en cuantizaciones Q4).
- Filtrado de datos sintéticos: al puntuar pares pregunta-respuesta generados automáticamente, el modelo permite descartar muestras de baja calidad antes de incorporarlas a un dataset de entrenamiento.
- Evaluación automática de asistentes conversacionales: integrado en un pipeline de evaluación, puede puntuar respuestas de un chatbot multi-turno y generar métricas de calidad correlacionadas con juicio humano.
- Verificación de salidas en sistemas RAG: el reward model puede puntuar la fidelidad de respuestas generadas a partir de contexto recuperado, sirviendo como filtro de alucinaciones antes de mostrar la respuesta al usuario.
- Enrutamiento de consultas: en un sistema con varios modelos especializados, el reward model puede puntuar las respuestas de cada uno y decidir cuál devolver al usuario, actuando como juez ligero.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M (3,2 GB) y Q8_0 (5,3 GB), el modelo puede ejecutarse en GPUs de consumo para prototipado e investigación sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 2,2 GB en Q2_K, 3,0-3,2 GB en Q4_K_S/Q4_K_M, 4,1 GB en Q6_K, 5,3 GB en Q8_0 y 9,8 GB en f16. Hay que añadir el espacio para el contexto KV cache y, si se usa el componente multimodal, los ficheros mmproj (0,5-0,8 GB adicionales).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4-Q5; para Q8_0 se recomienda 8-10 GB; para f16, 12-16 GB. GPUs como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100 o H100 son válidas según la cuantización.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 8 GB o más para cuantizaciones Q4 y Q5. En GPUs con 6 GB o menos, usar Q3_K_M o inferior.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de endpoints (el tag `endpoints_compatible` lo indica). Para el modelo base en transformers, vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| UnifiedReward-Flex-qwen35-4b-GGUF (este) | 4,84B | no disponible | MIT | GGUF | Reward model multimodal, solo inglés |
| CodeGoat24/UnifiedReward-Flex-qwen35-4b | 4,84B | no disponible | MIT | safetensors (transformers) | Modelo base sin cuantizar |
| mradermacher/UnifiedReward-Flex-qwen35-4b-i1-GGUF | 4,84B | no disponible | MIT | GGUF (imatrix) | Misma base con cuantizaciones ponderadas de mayor calidad |

No se dispone de información sobre otros reward models comparables en la documentación proporcionada (por ejemplo, versiones de ArmoRM, Starling-RM o similares); por tanto, la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte para inglés; su uso en castellano u otros idiomas puede degradar la calidad de las puntuaciones.
- Función específica: es un reward model, no un modelo generativo de propósito general; no debe esperarse de él la misma calidad conversacional que un LLM instruct estándar.
- Sesgos: no se documentan en la información disponible; como todo modelo entrenado con datos posiblemente sintéticos o filtrados, puede heredar sesgos de esos datos.
- Riesgo de alucinación: relevante si se usa como generador; como evaluador, el riesgo se traduce en puntuaciones mal calibradas.
- Contexto: no se especifica la longitud máxima de contexto, lo que impide garantizar su comportamiento en documentos largos.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base original y de los datos de entrenamiento, ya que la información disponible no detalla posibles restricciones adicionales.
- Repositorio de 45,4 GB: contiene todas las cuantizaciones, por lo que conviene descargar solo el fichero GGUF necesario en lugar de clonar el repositorio completo.
- Componente multimodal: la información disponible no detalla qué modalidades soporta ni cómo se invoca el mmproj en llama.cpp; conviene consultar la documentación del modelo base antes de usarlo con imágenes.
- Fecha de creación futura (2026): el repositorio indica fechas de creación y actualización en 2026, lo que puede indicar que se trata de un modelo reciente o de metadatos atípicos; verificar la integridad de los ficheros antes de usarlos en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/UnifiedReward-Flex-qwen35-4b-GGUF
- Modelo base: https://huggingface.co/CodeGoat24/UnifiedReward-Flex-qwen35-4b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/UnifiedReward-Flex-qwen35-4b-i1-GGUF
- Dataset de SFT: https://huggingface.co/datasets/CodeGoat24/UnifiedReward-Flex-SFT-90K
- Página de descargas del autor: https://hf.tst.eu/model#UnifiedReward-Flex-qwen35-4b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
