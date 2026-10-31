# SC117/Sage-A1.5-abliterated-MTP-FIT-GGUF

## Resumen

Sage-A1.5-abliterated · FIT-GGUF es una colección de cuantizaciones GGUF del modelo Sage-A1.5 de InternScience, un modelo MoE agéntico de 35B con capacidades de visión (imagen y vídeo), contexto largo y soporte de herramientas. Esta versión, publicada por el usuario SC117, es además una variante "abliterated" (con los mecanismos de rechazo del modelo base eliminados, es decir, sin restricciones de contenido impuestas por el alineamiento). El rasgo distintivo de este repositorio no es el modelo en sí, sino el método de cuantización: FIT-GGUF, una capa de planificación a nivel de tensor sobre llama.cpp que, en lugar de presets fijos (Q4_K_M, Q5_K_M, etc.), genera el GGUF más pequeño que cumple de forma verificable un umbral de divergencia KL respecto al modelo BF16 original en cinco dominios fijos.

El repositorio ofrece cinco niveles de fidelidad (tiers), cada uno verificado midiendo la KL sobre los propios bytes publicados, más la versión BF16 completa y variantes con imatrix. El tamaño va desde 11,11 GiB (tier MINI) hasta 66,19 GiB (BF16), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo hasta servidores multi-GPU. El modelo base conserva las capacidades de multi-token prediction (MTP), tool calling y razonamiento multi-paso de la familia Sage.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo qwen3_5_moe (transformer con mixture of experts) |
| Parametros totales | 446.571.248 (dato de safetensors del repo; la model card lo describe como modelo de 35B, dato no disponible con detalle) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (tag "long-context", cifra exacta no publicada) |
| Tipos de cuantizacion | 5 tiers FIT + BF16 + imatrix (nombres exactos de tier no disponibles) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (generado con FIT-GGUF v0.5.1 sobre llama.cpp) |

## Arquitectura y entrenamiento

El modelo base, Sage-A1.5 de InternScience, es un transformer con arquitectura mixture of experts (MoE), clasificado en los tags como `qwen3_5_moe`, lo que sugiere una arquitectura derivada o compatible con la familia Qwen3.5 MoE. Incorpora multi-token prediction (MTP), una técnica que entrena al modelo para predecir varios tokens futuros a la vez y que puede acelerar la decodificación especulativa en inferencia. También es un modelo VLM (vision-language model) con soporte de imagen y vídeo, y está orientado a uso agéntico con tool calling.

Sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no se han publicado datos en la información disponible. En cuanto a esta derivada, SC117 aplicó un proceso de abliteración (eliminación de los mecanismos de rechazo por seguridad) y posteriormente cuantización con FIT-GGUF v0.5.1, una herramienta open source que planifica la cuantización a nivel de tensor de forma determinista: dado un objetivo de fidelidad (umbral de KL macro), busca y verifica el GGUF más pequeño que lo cumple, midiendo la divergencia KL contra el BF16 del propio modelo en cinco dominios fijos. Cada tier publicado ha sido re-medido sobre sus bytes finales ("gate-verified").

## Capacidades

- Generación de texto y razonamiento general, con orientación agéntica (tags "agentic", "tool-use").
- Tool calling / function calling, según los tags del repositorio.
- Razonamiento multi-paso y uso como agente para flujos de varias etapas.
- Capacidades de visión: comprensión de imágenes y vídeo (tags "vlm", "vision", "video").
- Contexto largo (tag "long-context"; cifra exacta no disponible).
- Multi-token prediction (MTP), útil para acelerar la generación.
- Modelo abliterated: sin filtros de rechazo del alineamiento original (uso bajo responsabilidad del usuario).
- Idiomas: inglés y chino.

## Casos de uso

- Agentes autónomos con herramientas: el modelo está etiquetado para uso agéntico y tool calling, por lo que puede integrarse en frameworks tipo LangChain o funciones propias para ejecutar tareas multi-paso (búsqueda, ejecución de código, llamadas a APIs).
- Análisis de imágenes y vídeo: al ser un VLM, puede usarse para describir, clasificar o razonar sobre contenido visual, por ejemplo en pipelines de moderación o indexación de vídeo.
- Chatbots con contexto largo: el tag "long-context" permite gestionar conversaciones extensas o documentos largos sin dividir el contexto, útil para asistentes sobre documentación técnica.
- Despliegue en hardware de consumo: el tier MINI (11,11 GiB) cabe en GPUs de 12-16 GB de VRAM, lo que permite experimentación local y prototipado sin servidores dedicados.
- Investigación en cuantización: los cinco tiers verificados con KL medida son un banco de pruebas útil para estudiar la relación entre compresión y degradación de calidad en modelos MoE.
- Procesamiento bilingüe inglés-chino: adecuado para aplicaciones que necesiten manejar ambos idiomas en producción.
- Generación de texto sin filtros de contenido: la variante abliterated se usa típicamente en investigación de seguridad, red-teaming o entornos donde el rechazo del modelo interfiere con el caso de uso legítimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de fidelidad mencionada es la divergencia KL macro medida por FIT-GGUF contra el BF16 del propio modelo en cinco dominios, pero los valores numéricos concretos por tier no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: desde 11,11 GiB (tier MINI) hasta 66,19 GiB (BF16). Los tiers intermedios no tienen tamaños publicados en la información disponible, pero se sitúan entre ambos extremos.
- GPU recomendadas: para el tier MINI, una RTX 4090 (24 GB) o una GPU de 16 GB con descarga parcial a RAM sería suficiente. Para tiers altos y BF16, se necesitan A100 80GB, H100 o configuraciones multi-GPU (por ejemplo 2x A100 40GB).
- Consumer GPUs: el tier MINI cabe cómodamente en una RTX 4090 o RTX 3090; los tiers superiores no caben en hardware de consumo y requieren servidores.
- Despliegue: llama.cpp de forma nativa (formato GGUF), y por extensión Ollama y LM Studio. vLLM y TGI no soportan GGUF directamente para este caso; para esos backends habría que usar los pesos originales del modelo base.
- Latencia y throughput: no disponible. La presencia de MTP sugiere que se puede beneficiar de decodificación especulativa en runtimes compatibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Sage-A1.5-abliterated (este) | 35B (MoE) | qwen3_5_moe, VLM, MTP | no disponible | Apache-2.0 | Cuantizaciones FIT-GGUF verificadas por KL, abliterated |
| Qwen3-30B-A3B (referencia de familia) | 30B totales / 3B activos (MoE) | Transformer MoE | 128K (según versión) | Apache-2.0 | Arquitectura de la que deriva el tag qwen3_5_moe; sin abliterar |
| GLM-4.5-Air (referencia MoE agéntico) | 106B totales / 12B activos (MoE) | Transformer MoE | 128K | MIT | Orientado a agentes y tool calling, mayor tamaño |

Nota: la comparación es orientativa; los datos exactos de Sage-A1.5 (parámetros activos, contexto) no están publicados en la información disponible.

## Limitaciones y advertencias

- Al ser una variante abliterated, el modelo no rechazará peticiones que el modelo original sí rechazaría. Esto implica riesgos legales y éticos significativos: no es adecuado para exposición directa a usuarios finales sin capas de seguridad adicionales.
- Riesgo de alucinación: no disponible como métrica específica, pero como todo LLM puede generar contenido falso con apariencia plausible, agravado por la ausencia de filtros.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y puede ser inferior.
- La longitud de contexto exacta no está publicada; verificarla antes de diseñar aplicaciones que dependan de ventanas grandes.
- Existe una discrepancia en los metadatos: el campo de parámetros de safetensors indica 446,57 millones mientras la model card habla de un modelo de 35B; el valor real de parámetros totales debería verificarse contra el repo del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero el usuario es responsable del contenido generado por una variante sin restricciones.
- Las cuantizaciones FIT son una metodología reciente; aunque cada tier está verificado por KL, la degradación en tareas agénticas o de visión concretas no está caracterizada públicamente.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/SC117/Sage-A1.5-abliterated-MTP-FIT-GGUF
- Modelo base: https://huggingface.co/InternScience/Sage-A1.5
- Herramienta FIT-GGUF: https://github.com/Scorp1o117/FIT-GGUF
- Model card en chino: https://huggingface.co/SC117/Sage-A1.5-abliterated-MTP-FIT-GGUF/blob/main/README.zh-CN.md
