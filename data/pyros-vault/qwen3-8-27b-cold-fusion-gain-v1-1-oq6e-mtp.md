# pyros-vault/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ6e-mtp

## Resumen
Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ6e-mtp es una versión cuantizada del modelo Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, desarrollado por DavidAU, que aplica la metodología COLD FUSION (combinación de GAIN y la infraestructura de entrenamiento de Unsloth) para reducir los tokens de razonamiento entre 1/10 y 1/2 de los modelos Qwen estándar, manteniendo un 99% del rendimiento en BF16 tanto en 8 bits como en 4 bits. Esta variante concreta, publicada por pyros-vault, ha sido cuantizada con la herramienta oQ (oMLX v0.6.2) a 6 bits con group size 64, en formato MLX safetensors, pensada para ejecución eficiente en hardware Apple Silicon.

El modelo base Qwen3.8-27B es una arquitectura qwen3_5 de 27 mil millones de parámetros con capacidades de visión, razonamiento y contexto largo de 256K tokens, según la documentación de Unsloth. La cuantización oQ reduce el tamaño del repositorio a 23.7 GB, lo que permite su ejecución en equipos con memoria unificada moderada. La relevancia de esta ficha radica en que ofrece una alternativa de alta calidad para desarrollo local de agentes y codificación, con un tamaño manejable y un enfoque en la eficiencia de tokens de pensamiento.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer con vision y razonamiento) |
| Parametros totales | 27.000.000.000 (modelo base) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 256.000 tokens (modelo base) |
| Tipos de cuantizacion | 6 bits (oQ, group size 64) |
| Idiomas soportados | no disponible (modelo base multilingue, incluye espanol) |
| Licencia | no disponible (repo de cuantizacion); el modelo base Qwen3.5 tiene licencia Apache 2.0 segun Alibaba (no confirmado) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B es un transformer denso con arquitectura Qwen3.5, que incorpora visión y razonamiento. Segun la documentacion de Unsloth, esta pensado para tareas agenticas, codificacion y chat, con una ventana de contexto de 256K tokens. El entrenamiento original incluye la metodologia COLD FUSION, que combina GAIN (tecnica interna de DavidAU) con el stack de Unsloth para reducir los tokens de razonamiento a entre 1/10 y 1/2 de los modelos Qwen estandar, manteniendo un 99% del rendimiento en precision completa a 8 bits y 4 bits.

La cuantizacion oQ (oMLX v0.6.2) aplica una precision mixta de 6 bits con group size 64, optimizada para ejecucion en MLX (Apple Silicon). No se especifican detalles sobre el dataset de entrenamiento del modelo original ni sobre procesos de RLHF o DPO; la informacion disponible se centra en la optimizacion de tokens de razonamiento y la cuantizacion.

## Capacidades
- Generacion de texto y chat multiuso con razonamiento avanzado.
- Vision: procesamiento de imagenes y respuesta a consultas visuales (capacidad del modelo base).
- Razonamiento de varios pasos (multi-step) con reduccion de tokens de pensamiento gracias a COLD FUSION.
- Soporte de agentes y tool calling, adecuado para tareas de automatizacion y uso de herramientas externas.
- Capacidades multilingues (el modelo base de Qwen soporta espanol, ingles, chino, frances, aleman, etc.).
- Contexto largo de 256K tokens, permitiendo manejo de documentos extensos y conversaciones prolongadas.
- Cuantizacion de 6 bits que reduce la huella de memoria sin degradacion significativa del rendimiento.

## Casos de uso
- Desarrollo de agentes de codificacion: el modelo puede generar, revisar y depurar codigo en multiples lenguajes, aprovechando su soporte de tool calling para integrarse en IDEs o pipelines de CI/CD.
- Asistente de programacion local: al ser cuantizado a 6 bits y ejecutable en hardware Apple Silicon, puede funcionar como asistente de codigo en tiempo real en entornos de desarrollo, con latencia aceptable para iteraciones rapidas.
- Analisis de documentos extensos: su contexto de 256K tokens permite resumir o extraer informacion de libros, contratos o informes completos sin segmentacion manual.
- Chatbot de atencion al cliente multilingue: con capacidad de razonamiento y contexto largo, puede mantener conversaciones complejas y precisas, reduciendo tokens de pensamiento para respuestas mas directas.
- Razonamiento visual: la capacidad de vision permite describir imagenes, responder preguntas sobre diagramas o capturas de pantalla, util en soporte tecnico o educacion.
- Investigacion academica: su reduccion de tokens de razonamiento acelera la exploracion de hipotesis y la generacion de resumenes de articulos cientificos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks especificos para esta cuantizacion (oQ6e-mtp) en la informacion disponible. El modelo original DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 afirma mantener un 99% del rendimiento de BF16 en cuantizaciones de 8 y 4 bits, pero no se detallan cifras concretas de MMLU, HumanEval u otros benchmarks en las fuentes consultadas. Se recomienda consultar la documentacion oficial del modelo base para obtener datos de rendimiento comparativos.

## Requisitos de hardware
- VRAM estimada: el repositorio pesa 23,7 GB, por lo que requiere al menos 24 GB de memoria unificada en Apple Silicon (ej. M2 Pro/Max, M3 Max) para cargar el modelo completo. Con cuantizacion adicional (por ejemplo, 4 bits) podria caber en 16 GB, aunque no se proporciona esa variante.
- GPU recomendadas: en el ecosistema MLX, se necesita un chip Apple Silicon (M1/M2/M3/M4). En otras plataformas, el formato MLX no es compatible nativo; se podria convertir a GGUF para usar con llama.cpp o vLLM, pero no se ofrece.
- Opciones de despliegue: oMLX (con soporte para MLX), llama.cpp (si se convierte a GGUF), o cualquier framework que soporte MLX safetensors.
- Latencia y throughput: no se proporcionan datos concretos; se espera una latencia de unos pocos tokens por segundo en equipos Apple Silicon de gama alta, similar a otros modelos de 27B cuantizados.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 (original) | 27B | 256K | BF16, 8bit, 4bit | Apache 2.0 (probable) | HuggingFace |
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ6e-mtp (este) | 27B | 256K | 6bit MLX | no disponible | HuggingFace |
| Qwen3-30B-A3B (MoE) | 30B (3B activos) | 256K | variadas | Apache 2.0 | HuggingFace |
| Llama 3.3 70B | 70B | 128K | variadas | Llama 3.3 license | HuggingFace |

La comparativa muestra que este modelo es una variante cuantizada de un modelo de 27B denso, con contexto largo, pero la licencia no esta clara en el repositorio. Qwen3-30B-A3B es una alternativa MoE mas eficiente en parametros activos, mientras que Llama 3.3 70B es mas grande y requiere mas recursos.

## Limitaciones y advertencias
- La cuantizacion de 6 bits puede introducir ligeras degradaciones en tareas de alta precision numerica o en contextos muy largos, aunque la tecnica COLD FUSION afirma mantener el 99% del rendimiento.
- No se dispone de informacion sobre sesgos especificos del modelo base; como todos los LLM, puede reflejar sesgos de los datos de entrenamiento.
- Riesgo de alucinacion en tareas factuales, especialmente en dominios no representados en los datos de entrenamiento.
- La licencia del modelo cuantizado no esta especificada; el modelo base Qwen3.5 probablemente usa Apache 2.0, pero debe verificarse antes de uso comercial.
- El formato MLX limita su uso a hardware Apple Silicon; para otros entornos habria que convertir a GGUF o similar, lo que puede requerir herramientas adicionales.
- No se proporcionan garantias de soporte o actualizaciones; es un repositorio personal de un tercero.

## Enlaces
- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/pyros-vault/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ6e-mtp
- Repositorio HuggingFace del modelo original (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Pagina de resumen del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-cold-fusion-gain-v1.1-davidau
- Documentacion de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Repositorio GitHub con instalador local (no oficial): https://github.com/qwen3-8-27b/qwen3-8-27b
