# openbmb/MiniCPM-OCR-1.0-DSpark-gguf

## Resumen

MiniCPM-OCR-1.0-DSpark-gguf es la version en formato GGUF del cabezal draft DSpark para MiniCPM-OCR 1.0, un modelo especializado en reconocimiento optico de caracteres y conversion de documentos a Markdown/JSON. Lo desarrolla OpenBMB (ModelBest) y se publica bajo licencia Apache 2.0. No es un modelo OCR autonomo: es un modelo borrador (draft model) de 296.952.577 parametros que se acopla al checkpoint principal MiniCPM-OCR-1.0 para acelerar la inferencia mediante decodificacion especulativa en llama.cpp.

El modelo resuelve un problema concreto de eficiencia: en pipelines OCR de documentos completos, la etapa de reconocimiento por region es intensiva en generacion de tokens, y la decodificacion especulativa permite reducir la latencia sin alterar la salida del modelo objetivo. DSpark actua como cabezal borrador que propone tokens candidatos, verificados posteriormente por el modelo principal.

Es relevante ahora porque el ecosistema llama.cpp permite desplegar el pipeline OCR completo en hardware modesto, incluyendo GPU de consumo, y porque el SDK `minicpm-ocr` orquesta la deteccion de layout (PP-DocLayoutV3) y el reconocimiento por region en dos etapas separadas. El repositorio GGUF ocupa 3,0 GB e incluye 11 cuantizaciones del draft, desde F16 (0,606 GB) hasta Q4_0 (0,209 GB). Idiomas soportados: ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); este repo contiene solo el cabezal draft DSpark para decodificacion especulativa |
| Parametros totales | 296.952.577 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente el cabezal draft DSpark, afinado a partir de openbmb/MiniCPM-OCR-1.0 (relacion `finetune`). El modelo principal MiniCPM-OCR 1.0 es un modelo multimodal image-text-to-text que procesa regiones de documento recortadas y las transcribe a Markdown o JSON segun el tipo de region (texto, tabla, formula, grafico, sello). El draft DSpark se usa en llama.cpp con `--spec-type draft-dspark` para decodificacion especulativa: propone tokens que el modelo objetivo valida, acelerando la generacion.

Un detalle tecnico relevante: cada nivel de cuantizacion del GGUF lleva los IDs de token objetivo absolutos en su tensor `d2t`, mientras que la exportacion en safetensors los almacena con codificacion delta. El draft debe emparejarse con el checkpoint principal correspondiente y con el proyector `mmproj-model-f16-4x.gguf` del repositorio MiniCPM-OCR-1.0-gguf. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Reconocimiento OCR de regiones de documento: texto, tablas, formulas, graficos y sellos, con salida en Markdown o JSON en orden de lectura.
- Aceleracion por decodificacion especulativa: actua como draft model para MiniCPM-OCR-1.0 en llama.cpp.
- Procesamiento multimodal image-text-to-text (heredado del modelo base).
- Soporte de prompts especificos por tipo de region (por ejemplo, "Text Recognition:").
- Compatibilidad con endpoints (`endpoints_compatible`) y uso conversacional.
- Idiomas: ingles y chino.
- No dispone de tool calling, capacidades de agente ni modo thinking documentados en la informacion disponible.

## Casos de uso

- Digitalizacion masiva de archivos: el pipeline de dos etapas (deteccion de layout con PP-DocLayoutV3 y reconocimiento por region con MiniCPM-OCR 1.0 + DSpark) convierte lotes de PDFs escaneados a Markdown estructurado, preservando tablas y orden de lectura.
- Extraccion de tablas financieras: las regiones de tabla se recortan y se envian con un prompt de tabla; el modelo devuelve estructura Markdown que puede parsearse a CSV o bases de datos.
- Conversion de papers cientificos: las regiones de formula se reconocen por separado, lo que permite reconstruir LaTeX junto con el texto y las figuras en un unico documento.
- Despliegue en hardware de consumo: con cuantizaciones Q4 (0,209-0,211 GB para el draft) y el modelo principal en GGUF, el pipeline completo cabe en GPU consumer, util para prototipos y entornos sin cluster.
- Servicio OCR autoalojado con llama.cpp o Ollama: el SDK envia cada region por HTTP a un servicio de inferencia local, manteniendo los datos en la infraestructura propia.
- Aplicaciones moviles offline: la demo iOS de MiniCPM-V-Apps permite parsing de documentos en dispositivo sin conexion (parsing de documentos solo en iOS por ahora).
- Aceleracion de pipelines OCR existentes: integrar DSpark como draft en un servicio llama.cpp ya desplegado reduce la latencia de la etapa de reconocimiento sin cambiar la logica de negocio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del draft: aproximadamente 0,21 GB en Q4_0/Q4_K_S, 0,23-0,26 GB en Q5, 0,33 GB en Q8_0 y 0,61 GB en F16. A esto se suma el modelo principal MiniCPM-OCR-1.0 y el proyector multimodal.
- GPU recomendadas: no disponibles de forma especifica en la informacion proporcionada; el uso de `-ngl 99 -ngld 99` sugiere offload completo de capas del modelo y del draft a GPU.
- GPU de consumo: el tamano reducido del draft (menos de 1 GB en todas las cuantizaciones) permite alojarlo junto al modelo principal en GPU consumer, aunque el requisito agregado depende del checkpoint principal.
- Despliegue: llama.cpp (`llama-cli` o `llama-server`), vLLM, SGLang, Ollama, e imagen Docker oficial. Nota: `llama-mtmd-cli` no acepta draft model; para multimodal con DSpark hay que usar `llama-cli` o `llama-server`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MiniCPM-OCR-1.0-DSpark-gguf | 296.952.577 (draft) | no disponible | Apache 2.0 | Draft model para decodificacion especulativa en pipeline OCR |
| MiniCPM-OCR-1.0 | no disponible | no disponible | Apache 2.0 | Modelo OCR principal multimodal, requiere este draft para aceleracion |
| PP-DocLayoutV3 | no disponible | no disponible | no disponible | Deteccion de layout (etapa 1 del pipeline), ejecutado en el SDK |

No se dispone de datos de benchmarks ni de modelos OCR comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el checkpoint principal MiniCPM-OCR-1.0 y el proyector `mmproj-model-f16-4x.gguf` no produce salida util.
- Solo soporta ingles y chino; otros idiomas no estan cubiertos.
- Riesgo de alucinacion inherente a modelos generativos, especialmente en regiones de baja calidad o tablas complejas; conviene validar la salida en produccion.
- La etapa 1 del pipeline requiere PaddlePaddle/PaddleX en el entorno del SDK, lo que anade dependencias pesadas.
- `llama-mtmd-cli` no admite draft model; hay que usar `llama-cli` o `llama-server`, lo que limita algunas configuraciones.
- El parsing de documentos en la app movil es solo para iOS por el momento.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni sesgos especificos en la informacion disponible.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- Modelo draft en safetensors: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- GGUF del modelo principal: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-gguf
- GitHub MiniCPM-OCR: https://github.com/OpenBMB/MiniCPM-OCR
- Guia del modelo: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_1dot0_en.md
- Guia de despliegue: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_tutorial_en.md
- SDK en PyPI: https://pypi.org/project/minicpm-ocr/
- Playground (global): https://platform.modelbest.ai/console/playground/document-parse
- Playground (CN): https://platform.modelbest.cn/console/playground/document-parse
- Documentacion API (global): https://platform.modelbest.ai/console/docs/api/document-parse
- Documentacion API (CN): https://platform.modelbest.cn/console/docs/api/document-parse
- SKILL.md para agentes: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/SKILL_en.md
- Demo iOS: https://github.com/OpenBMB/MiniCPM-V-Apps/blob/main/README.md#11-ios-demo
- Discord: https://discord.gg/JE8KQqtdn
