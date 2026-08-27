# lstari/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-q4kp

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP es una variante del modelo Qwen3.8-27B de Alibaba, modificada por el equipo HauhauCS para eliminar comportamientos de rechazo y ofrecer respuestas directas sin preámbulos. El modelo base es un LLM denso de 27B parámetros con arquitectura híbrida que combina capas Gated DeltaNet y gated-attention, con soporte nativo multimodal (imagen y video) y una ventana de contexto de 262.144 tokens ampliable hasta 1.000.000.

Esta versión concreta, publicada por el usuario lstari en HuggingFace, es una cuantización GGUF del modelo uncensored que incorpora dos innovaciones técnicas: los cuantizados personalizados K_P ("Perfect") de HauhauCS, que preservan calidad mediante análisis específico del modelo, y el sidecar FastMTP de aceleración por decodificación especulativa, que promete hasta 3,02x de throughput en documentos y 1,93x en razonamiento frente a la versión sin MTP. El modelo mantiene intactas las capacidades de texto, razonamiento, agente, imagen y video del Qwen3.8 original.

La relevancia de este lanzamiento radica en combinar un modelo de 27B con contexto ultralargo, capacidades multimodales y una capa de aceleración por decodificación especulativa, todo en formato GGUF listo para ejecutarse en llama.cpp, LM Studio y otros runtimes compatibles. El perfil "Aggressive" elimina por completo el comportamiento de rechazo (0/465 refusals), lo que lo hace adecuado para casos donde se requiere una respuesta directa sin filtros de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas Gated DeltaNet + 16 capas gated-attention, con encoder de visión |
| Parametros totales | 27B (dense); el archivo safetensors cuantizado pesa 1.863.907.840 bytes |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (texto), GGUF (proyector de visión BF16), GGUF (sidecar FastMTP) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM causal denso de 27B parámetros con 64 capas, hidden size de 5.120 y FFN de 17.408. Su arquitectura es híbrida: combina 48 capas Gated DeltaNet (una variante de SSM con mecanismos de compuerta) con 16 capas de atención gated tradicionales, lo que permite un equilibrio entre eficiencia computacional y capacidad de atención sobre contextos largos. El vocabulario está padding a 248.320 tokens. Incluye un encoder de visión que le permite procesar imágenes y video, y mantiene la cabeza NextN nativa para decodificación especulativa.

La variante uncensored de HauhauCS se obtiene mediante técnicas de "abliteration" a nivel de pesos, no solo de prompting, que eliminan los circuitos responsables del comportamiento de rechazo. El perfil Aggressive aplica además un ajuste para que el modelo responda directamente sin preámbulos ni autojustificaciones. No se han realizado cambios en los datos de entrenamiento ni en las capacidades del modelo base. El sidecar FastMTP es un perfil de aceleración específico que optimiza la decodificación especulativa MTP (Multi-Token Prediction) para maximizar el throughput en contextos largos.

## Capacidades

- Generación de texto y razonamiento: mantiene todas las capacidades del Qwen3.8-27B original, incluyendo razonamiento multi-step y modo thinking.
- Multimodal: procesa entrada de imagen y video mediante el proyector de visión BF16 incluido (archivo mmproj).
- Tool calling y function calling: soporte nativo para integración con herramientas y APIs.
- Capacidades de agente: puede ejecutar tareas multi-paso y encadenar llamadas a herramientas.
- Decodificación especulativa: incorpora la cabeza NextN nativa de Qwen3.8 y el sidecar FastMTP de HauhauCS para acelerar la generación.
- Multilingüe: soporte para inglés, chino y otros idiomas.
- Contexto ultralargo: 262.144 tokens nativos, ampliables hasta 1.000.000.
- Sin filtros: perfil Aggressive con 0/465 rechazos, respuestas directas sin preámbulos.

## Casos de uso

- Asistentes de escritura creativa sin restricciones: el perfil Aggressive permite generar narrativa, diálogos y contenido literario sin auto-censura, manteniendo la calidad de texto del Qwen3.8-27B. Su contexto de 262K tokens permite trabajar con novelas completas o guiones extensos.
- Análisis de documentos largos: con 262K tokens de contexto nativo y el sidecar FastMTP (hasta 3,02x de throughput en documentos), es adecuado para resumir, extraer información y responder preguntas sobre contratos, informes anuales o expedientes de miles de páginas.
- Agentes autónomos con tool calling: su soporte nativo de function calling y razonamiento multi-step lo hace utilizable como backend de agentes que consultan APIs, ejecutan código o interactúan con bases de datos, con la ventaja de no rechazar peticiones intermedias.
- Asistente de código en entornos de investigación: puede generar, revisar y depurar código en múltiples lenguajes, integrándose en pipelines de CI/CD o entornos de desarrollo con herramientas como llama.cpp o vLLM.
- Procesamiento de documentos con imágenes: gracias al proyector de visión BF16, puede procesar PDFs escaneados, capturas de pantalla o diagramas junto con texto, útil para automatizar la extracción de datos de facturas o formularios.
- Chatbots de rol o simulación de personajes: el perfil uncensored y la ausencia de rechazos lo hacen adecuado para aplicaciones de rol conversacional donde se requiere que el modelo adopte personajes sin limitaciones temáticas.
- Investigación en alineación y seguridad: el modelo sirve como caso de estudio para analizar el comportamiento de modelos sin entrenamiento de seguridad, comparando respuestas con la versión original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas de MMLU, HumanEval, GSM8K ni otros tests estandarizados. Los únicos datos de rendimiento disponibles son las ganancias de throughput del sidecar FastMTP: hasta 3,02x en generación de documentos y 1,93x en razonamiento frente a la versión sin MTP, y hasta 35,2% más de throughput en documentos y 21,1% en razonamiento frente al MTP embebido estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,7 GB (cuantización Q2_K_P) y 31,5 GB (Q8_K_P), más 931 MB del proyector de visión si se usa entrada multimodal y 903 MB del sidecar FastMTP.
- GPU recomendadas: para cuantizaciones Q4_K_P o superiores se recomienda una GPU con al menos 20 GB de VRAM (RTX 3090, RTX 4090, A100 40GB). Para Q3_K_P o inferiores, una GPU de 16 GB (RTX 4080, RTX 4070 Ti) puede ser suficiente.
- Consumer GPU: sí, cabe en GPUs de consumo con 16-24 GB de VRAM usando cuantizaciones Q3 o Q4. La cuantización Q2_K_P (10,7 GB) puede ejecutarse en GPUs de 12 GB como la RTX 3060.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, vLLM (con soporte GGUF), text-generation-webui. Los archivos son GGUFs estándar y no requieren builds especiales.
- Latencia y throughput: no disponible. El sidecar FastMTP promete mejoras de throughput de hasta 3,02x en documentos y 1,93x en razonamiento, pero no se especifican valores absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizaciones | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Apache-2.0 | BF16, FP8 | Modelo base sin modificaciones de seguridad |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP | 27B | 262K | Apache-2.0 | GGUF (K_P, IQ, etc.) | Variante uncensored con FastMTP y perfil Aggressive |
| Qwen3.8-27B-Uncensored (abliterated) | 27B | 262K | Apache-2.0 | GGUF (Q3_K_M, Q4_K_M) | Variante uncensored sin FastMTP ni K_P quants |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de información sobre modelos comparables de otros fabricantes con características equivalentes (contexto ultralargo, multimodal y uncensored).

## Limitaciones y advertencias

- Modelo sin filtros de seguridad: el perfil Aggressive elimina el comportamiento de rechazo, lo que significa que el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es adecuado para aplicaciones orientadas al público general sin una capa de moderación externa.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en contextos largos o temas especializados. La ausencia de entrenamiento de seguridad no mitiga este riesgo.
- Cuantizaciones K_P: los archivos K_P pueden mostrar "?" en la columna de cuantización de LM Studio, aunque funcionan correctamente. El widget de compatibilidad de HuggingFace puede no reconocer los K_P quants.
- Requisitos de VRAM: el modelo completo con proyector de visión y sidecar FastMTP requiere al menos 12 GB de VRAM en la cuantización más baja, y más de 32 GB para la Q8_K_P.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3.8-27B puede tener términos adicionales de Alibaba que conviene revisar.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estándar, lo que dificulta la comparación con otros modelos.
- Soporte de visión: el proyector de visión es un archivo separado (931 MB) que debe descargarse e integrarse manualmente para usar capacidades multimodales.

## Enlaces

- Repositorio HuggingFace (lstari): https://huggingface.co/lstari/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio HuggingFace (HauhauCS, original): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto GitHub de referencia (abliterated): https://github.com/Wassimyounes01/qwen38-uncensored
- Página de análisis del modelo: https://local-ai-zone.github.io/models/qwen3-8-27b-uncensored-hauhaucs-aggressive-mtp.html
- Discord de HauhauCS: https://discord.gg/SZ5vacTXYf
