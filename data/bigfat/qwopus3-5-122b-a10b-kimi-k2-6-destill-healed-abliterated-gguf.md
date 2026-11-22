# bigfat/Qwopus3.5-122B-A10B-Kimi-K2.6-destill-healed-abliterated-GGUF

## Resumen

Qwopus3.5-122B-A10B-Kimi-K2.6-destill-healed-abliterated-GGUF es una cuantizacion en formato GGUF del modelo OpenYourMind/Qwopus3.5-122B-A10B-Kimi-K2.6-destill-healed-abliterated, publicada por el usuario bigfat (con quants generados por mradermacher). Se trata de un modelo de arquitectura Mixture of Experts (MoE) de la familia Qwen 3.5, con 124.635.206.144 parametros totales segun los safetensors del repositorio base, y aproximadamente 10B parametros activos por token segun indica el sufijo A10B del nombre. El modelo combina una base Qwen con tecnicas de destilacion desde Kimi K2.6, ajuste fino supervisado (SFT), DPO y un proceso de "abliteration" que elimina los mecanismos de rechazo del modelo, dando lugar a una variante sin censura.

La relevancia de esta ficha radica en que se trata de un modelo multimodal (soporta vision), con capacidades MoE y MTP (multi-token prediction), publicado bajo licencia MIT, lo que facilita su uso comercial. El repositorio GGUF ocupa 848,3 GB y ofrece un abanico de cuantizaciones desde Q2_K (45,9 GB) hasta Q8_0 (132,7 GB), permitiendo su despliegue en distintos niveles de hardware. El idioma declarado es unicamente ingles.

No se dispone de informacion sobre el pipeline, la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada. La model card del repositorio es una plantilla generada automaticamente por mradermacher para la publicacion de cuantizaciones, sin detalles tecnicos adicionales sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen 3.5, con soporte multimodal (vision) y MTP |
| Parametros totales | 124.635.206.144 (124,6B) |
| Parametros activos | Aproximadamente 10B (segun sufijo A10B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture of Experts (MoE), derivado de la familia Qwen 3.5. El modelo incorpora componentes multimodales (vision) y MTP (multi-token prediction), segun los tags del repositorio. El proceso de entrenamiento incluye destilacion desde Kimi K2.6, ajuste fino supervisado (SFT) y optimizacion por preferencias directas (DPO), ademas de un paso de "abliteration" que elimina los comportamientos de rechazo del modelo base. El modelo resultante ha sido sometido a un proceso de "healing" (curacion) para recuperar capacidades tras la abliteration.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni detalles especificos sobre las innovaciones tecnicas mas alla de los tags mencionados (multimodal, vision, MTP, MoE). La model card no aporta estos datos.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y capacidades de tipo "thinking" (segun tags de la familia Qwen 3.5).
- Capacidades multimodales de vision (tag "vision", "multimodal").
- Multi-token prediction (MTP) para acelerar la generacion.
- Modelo "abliterated" y "uncensored": elimina los rechazos de seguridad del modelo base.
- Ajuste fino supervisado (SFT) y DPO para alineacion conversacional.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente.
- Capacidades multilingues: limitadas a ingles segun la metadata.

## Casos de uso

- Generacion de texto en ingles para asistentes conversacionales: el modelo puede gestionar dialogos multi-turno gracias a su naturaleza instruct/chat, aunque la longitud de contexto no esta documentada.
- Procesamiento de documentos con imagenes: al ser multimodal, puede extraer informacion de capturas, diagramas o documentos escaneados en ingles.
- Investigacion sobre alineacion y seguridad: al ser una variante "abliterated", es util para estudiar el comportamiento de modelos sin mecanismos de rechazo y comparar con la version original.
- Despliegue en entornos con hardware limitado: las cuantizaciones Q2_K (45,9 GB) y Q3_K_S (54,1 GB) permiten ejecutar un modelo de 124B en configuraciones de GPU multiples o con offloading a CPU.
- Generacion de codigo y texto tecnico en ingles: el modelo base Qwen 3.5 tiene capacidades de codigo, aunque no se confirman benchmarks.
- Experimentacion con tecnicas de destilacion y cuantizacion: util para investigadores que comparan el rendimiento del modelo cuantizado frente al original en FP16.
- Fine-tuning posterior sobre dominios especificos: la licencia MIT permite adaptar el modelo a tareas concretas sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Q2_K requiere aproximadamente 46 GB, Q4_K_M unos 76 GB, Q8_0 unos 133 GB. Para F16 se necesitarian aproximadamente 250 GB.
- GPU recomendadas: para Q4_K_M, configuraciones multi-GPU como 2x A100 80GB o 4x RTX 4090 24GB (con offloading). Para Q2_K, posible en 1x A100 80GB o 2x RTX 4090.
- Cabe en consumer GPU: no en una sola GPU de consumo; requiere multiples RTX 4090 o configuraciones con offloading a CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). No se confirma soporte en vLLM o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.5-122B-A10B-Kimi-K2.6-destill-healed-abliterated (este) | 124,6B totales / ~10B activos | no disponible | MIT | GGUF | MoE, multimodal, abliterated |
| Qwen 3.5 (base, referencia) | no disponible | no disponible | no disponible | no disponible | Modelo base de la familia |
| Kimi K2.6 (fuente de destilacion) | no disponible | no disponible | no disponible | no disponible | Fuente de la destilacion |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas. La informacion proporcionada no incluye benchmarks ni especificaciones de los modelos comparables.

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": elimina los rechazos de seguridad, lo que puede generar contenido inapropiado, ofensivo o danino sin filtros. No recomendado para produccion sin capas de moderacion externas.
- Idioma limitado a ingles: no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada: riesgo de truncamiento en conversaciones largas o documentos extensos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, agravado por la falta de benchmarks que validen su fiabilidad.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de uso en produccion.
- La model card es una plantilla generica de cuantizacion, sin informacion sobre sesgos, datos de entrenamiento o evaluaciones.
- El proceso de "healing" tras la abliteration no esta documentado, por lo que se desconoce su impacto real en las capacidades del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bigfat/Qwopus3.5-122B-A10B-Kimi-K2.6-destill-healed-abliterated-GGUF
- Modelo base: https://huggingface.co/OpenYourMind/Qwopus3.5-122B-A10B-Kimi-K2.6-destill-healed-abliterated
- Quants con imatrix: https://huggingface.co/mradermacher/Qwopus3.5-122B-A10B-Kimi-K2.6-destill-healed-abliterated-i1-GGUF
- Pagina de overview de quants: https://hf.tst.eu/model#Qwopus3.5-122B-A10B-Kimi-K2.6-destill-healed-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
