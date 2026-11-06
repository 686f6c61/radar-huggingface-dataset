# NousResearch/Hermes-3-Llama-3.1-8B

## Resumen

Hermes 3 - Llama-3.1 8B es un modelo de lenguaje generalista desarrollado por Nous Research, tercera iteración de su serie insignia Hermes. Se trata de un ajuste fino (finetune) sobre Meta-Llama-3.1-8B, entrenado con datos sintéticos y destilación, y orientado a alinear el comportamiento del modelo con el usuario final, otorgándole un alto grado de control mediante system prompts. Entre sus mejoras destacan las capacidades agénticas, el roleplaying, el razonamiento, la conversación multi-turno y la coherencia en contextos largos.

El modelo resuelve el problema de la rigidez de los modelos instruidos convencionales: ofrece un steering potente, function calling fiable, salidas estructuradas en JSON y modo chat compatible con el formato ChatML (y por tanto con la API de OpenAI). Con 8.030 millones de parámetros, es un modelo ligero que cabe en GPUs de consumo, lo que lo hace muy relevante para despliegues locales y agentes autohospedados. Según el propio Nous Research, es competitivo, e incluso superior en algunos aspectos, a los modelos Llama-3.1 Instruct en capacidades generales. Existe también un informe técnico publicado en arXiv que documenta el entrenamiento y los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Llama 3.1), fine-tune instruido |
| Parametros totales | 8.030.261.248 (~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda de Llama 3.1, hasta 128k según el modelo base) |
| Tipos de cuantizacion | no disponible (repo oficial en fp16; existen versiones cuantizadas de terceros) |
| Idiomas soportados | inglés |
| Licencia | Llama 3 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Hermes 3 parte de la arquitectura transformer decoder de Llama 3.1 (8B parámetros, atención estándar multi-cabeza, RoPE) y aplica un fine-tune instruido completo. No es un modelo MoE ni híbrido: todos los parámetros están activos en cada pasada. El modelo emplea el formato ChatML para los diálogos multi-turno, con tokens especiales `<|im_start|>` y `<|im_end|>` que delimitan los turnos y roles (system, user, assistant).

El entrenamiento se realizó con datos sintéticos y técnicas de destilación, usando el framework Axolotl (según los tags del repositorio). Según el informe técnico de Hermes 3 (arXiv:2408.11857), la serie se centró en mejorar capacidades agénticas, function calling, generación de código y alineación con el usuario. No se ha detallado en la model card el número exacto de tokens de entrenamiento ni la composición precisa del dataset; para más detalle, remitimos al informe técnico enlazado al final de la ficha.

## Capacidades

- Generación de texto conversacional multi-turno con formato ChatML, compatible con la API de OpenAI.
- Function calling / tool calling: entrenado con system prompts y estructuras específicas que aceptan firmas de funciones en JSON dentro de etiquetas `<tools></tools>`, con salida estructurada mediante esquemas pydantic.
- Salidas estructuradas (JSON mode) fiables, útiles para integraciones con pipelines de datos y agentes.
- Razonamiento general y coherencia en contextos largos, mejoradas respecto a Hermes 2.
- Roleplaying avanzado, con gran capacidad de steering mediante system prompts (roles, reglas y estilo controlables).
- Generación de código mejorada respecto a la serie Hermes 2.
- Capacidades agénticas para flujos multi-paso.
- Plantilla de chat integrada (`tokenizer.apply_chat_template()`), lo que simplifica su uso con transformers.

## Casos de uso

- Atención al cliente automatizada: el formato ChatML y la conversación multi-turno permiten gestionar diálogos largos con system prompts que fijan tono, reglas y rol del agente, manteniendo coherencia a lo largo de la conversación.
- Agentes con herramientas (tool use): su entrenamiento específico en function calling con esquemas JSON lo hace adecuado para orquestar APIs externas (por ejemplo, consultar datos de acciones, calendarios o bases de datos) en flujos agénticos multi-paso.
- Extracción y generación de datos estructurados: el JSON mode permite integrarlo en pipelines ETL o de procesamiento documental donde se requiere salida parseable y fiable.
- Asistentes personales y roleplaying: la fuerte capacidad de steering y el énfasis en el roleplaying lo hacen idóneo para personajes virtuales, NPCs de videojuegos o simulaciones conversacionales.
- Generación de código y asistentes de desarrollo: puede integrarse en IDEs locales o pipelines de CI/CD para autocompletado, revisión de código y generación de scripts, sin depender de APIs externas.
- Despliegue local en hardware de consumo: con ~8B de parámetros y pesos en safetensors, es viable en una sola GPU de gama alta o incluso en cuantizaciones de 4 bits, lo que lo apropiado para entornos con requisitos de privacidad.
- Prototipado de aplicaciones LLM: la compatibilidad con el formato de API de OpenAI permite sustituir el endpoint en aplicaciones existentes con cambios mínimos.

## Benchmarks y rendimiento

El model-index del repositorio no incluye resultados numéricos estructurados (el bloque de resultados está vacío). La model card afirma que Hermes 3 es "competitivo, si no superior, a los modelos Llama-3.1 Instruct en capacidades generales", y remite a imágenes comparativas de benchmarks y al informe técnico, pero no proporciona cifras en formato textual.

No se han publicado resultados de benchmarks en la informacion disponible (en formato de datos comparables). Para las comparativas completas, consultese las imágenes de la model card y el informe técnico: https://arxiv.org/abs/2408.11857

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~16 GB (el repositorio pesa 16,1 GB), más overhead de KV cache según la longitud de contexto.
- Con cuantización de 4 bits (GGUF Q4_K_M o similar de terceros): ~5-6 GB de VRAM/RAM, viable en GPUs de consumo.
- GPUs recomendadas: RTX 4090 (24 GB) o RTX 3090 para fp16 completo; GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB) para versiones cuantizadas.
- En la nube: cualquier GPU con 16+ GB de VRAM (A10G, L4, A100) es suficiente.
- Opciones de despliegue: transformers (con `apply_chat_template`), text-generation-inference (TGI), vLLM, llama.cpp y Ollama (mediante conversiones GGUF de la comunidad); el repositorio está etiquetado como compatible con endpoints y despliegue en Azure.
- Latencia y throughput: no disponible; al ser un modelo denso de 8B, se esperan latencias de decodificación típicas de esta clase (decenas de tokens por segundo en una RTX 4090 en fp16), aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Hermes 3 - Llama-3.1 8B | ~8B (denso) | no disponible (base 128k) | Llama 3 Community | Function calling, JSON mode, ChatML, roleplaying |
| Meta-Llama-3.1-8B-Instruct | ~8B (denso) | 128k | Llama 3 Community | Modelo base; buen rendimiento general, menos steering |
| Hermes 2 - Llama-3.1 8B (predecesor) | ~8B (denso) | no disponible | Llama 3 Community | Menor capacidad agéntica y de roleplaying |
| Qwen2.5-7B-Instruct | ~7B (denso) | 128k | Apache 2.0 (parcial) | Licencia más permisiva, fuerte en multilingüe y código |

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés; su rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Licencia: se distribuye bajo la Llama 3 Community License, que impone restricciones (límite de 700 millones de usuarios activos mensuales para uso comercial sin licencia de Meta, y atribución obligatoria con "Llama" en derivados); no es una licencia totalmente permisiva tipo Apache/MIT.
- Benchmarks: no hay cifras numéricas oficiales en la model card; las afirmaciones de competitividad con Llama-3.1 Instruct se basan en imágenes y en el informe técnico, por lo que conviene validar en el caso de uso concreto.
- Alucinaciones: como todo LLM de 8B, puede generar información falsa con apariencia plausible, especialmente en dominios factuales; el uso de function calling y salidas estructuradas reduce, pero no elimina, este riesgo.
- Contexto largo: aunque la base Llama 3.1 soporta 128k, el fine-tune puede degradar la calidad en contextos muy extensos; no hay datos oficiales de coherencia a 128k para esta variante 8B.
- Sesgos: hereda los sesgos de Llama 3.1 y de los datos sintéticos de entrenamiento; el fuerte énfasis en roleplaying y steering puede producir salidas indeseadas si el system prompt no está bien diseñado.
- Cuantizaciones: las versiones GGUF y otras cuantizaciones provienen de terceros, no del autor oficial; verificar su calidad antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B
- Informe técnico de Hermes 3 (arXiv): https://arxiv.org/abs/2408.11857
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B
- Documentación de chat templates de transformers: https://huggingface.co/docs/transformers/main/chat_templating
