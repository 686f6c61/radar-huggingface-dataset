# OVHaiLLM/Olala-v1.0-mini-7A1B-GGUF

## Resumen

Olala-v1.0-mini-7A1B es un modelo de lenguaje de tipo híbrido (Mamba + atención + MoE) desarrollado por OVHaiLLM, la división de IA de OVHcloud. El modelo combina capas de espacio de estados (Mamba) con capas de atención y una arquitectura de mezcla de expertos (MoE), orientado a razonamiento y tool calling. La versión aquí descrita es la cuantización GGUF del modelo base, distribuida para inferencia local con llama.cpp.

El modelo cuenta con 6.775.272.608 parámetros totales (aproximadamente 6,8 mil millones), y su nombre "7A1B" sugiere 7 mil millones totales con 1 mil millones activos por token, aunque el dato de parámetros activos no está confirmado en la información disponible. Soporta 36 idiomas, incluyendo castellano, catalán y euskera, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en dos factores: por un lado, la arquitectura híbrida Mamba-MoE busca reducir el coste computacional frente a transformers densos equivalentes; por otro, la disponibilidad de cuantizaciones GGUF que caben en un portátil de 16 GB (archivo Q6_K de 6,3 GB) con velocidades de generación de unos 70 tokens/s en Apple Silicon. La advertencia importante es que requiere un fork específico de llama.cpp, ya que la arquitectura `olala` no está soportada por el llama.cpp upstream ni por Ollama o LM Studio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Mamba + atención + MoE (arquitectura `olala`) |
| Parámetros totales | 6.775.272.608 (≈6,8 B) |
| Parámetros activos | no disponible (el nombre "7A1B" sugiere ~1 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0 (q8_0-safe2), Q6_K, Q5_K_M (y presumiblemente otras variantes GGUF; el listado completo no está en la información disponible) |
| Idiomas soportados | 36: en, zh, fr, de, it, ja, ru, es, pl, pt, nl, el, tr, cs, uk, hu, ro, ko, ar, fi, sv, no, da, bg, sk, hr, lt, sl, bs, he, et, ca, lv, ka, sr, sq, is |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 32,8 GB); el modelo base se distribuye presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

La arquitectura `olala` es híbrida: combina capas de espacio de estados (Mamba) con capas de atención y una estructura de mezcla de expertos (MoE). Este diseño busca reducir el coste de inferencia en secuencias largas frente a un transformer denso, manteniendo capacidad de razonamiento. El modelo base es OVHaiLLM/Olala-v1.0-mini-7A1B, del que esta ficha es la cuantización GGUF. Los parámetros totales reales, según safetensors, son 6.775.272.608.

No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se detalla la innovación técnica concreta más allá de la combinación Mamba-MoE y la presencia de cuatro niveles de esfuerzo de razonamiento ("four effort levels") y soporte de tool calling a través de un servidor compatible con OpenAI. El informe técnico está disponible en PDF en el repositorio del modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso.
- Razonamiento con cuatro niveles de esfuerzo configurables (modo "thinking" escalable).
- Tool calling / function calling, expuesto mediante servidor compatible con la API de OpenAI.
- Capacidades de código y matemáticas: las cuantizaciones de 8, 6 y 5 bits se mantienen "dentro del ruido" respecto a BF16 en pruebas de código y matemáticas, según el autor.
- Soporte multilingüe amplio: 36 idiomas, incluyendo castellano, catalán, euskera, gallego no listado, y lenguas eslavas, nórdicas y asiáticas.
- Compatibilidad con endpoints (tag `endpoints_compatible`), pensada para despliegue en la plataforma AI Endpoints de OVHcloud.
- Inferencia local en CPU x86, GPU NVIDIA y Apple Silicon mediante llama.cpp (fork propio).

## Casos de uso

- Asistente conversacional multilingüe en producción: el soporte de 36 idiomas y el formato GGUF permiten desplegar un chatbot en servidor con CPU o GPU modesta, atendiendo usuarios en castellano, catalán, euskera y otras lenguas sin cambiar de modelo.
- Agente con tool calling en pipelines de automatización: al exponer una API compatible con OpenAI, se integra en frameworks de agentes (LangChain, LlamaIndex) para orquestar llamadas a funciones, consultas a bases de datos y acciones sobre sistemas externos.
- Razonamiento con coste controlado: los cuatro niveles de esfuerzo permiten ajustar la profundidad de razonamiento según la tarea, usando el nivel bajo para clasificación o extracción y el alto para problemas matemáticos o de planificación.
- Inferencia local en portátil para desarrollo y prototipado: el archivo Q6_K de 6,3 GB cabe en un MacBook de 16 GB y genera ~70 tokens/s, lo que permite iterar sin coste de API ni dependencia de la nube.
- Generación y revisión de código en entornos con requisitos de privacidad: al ejecutarse localmente, el código no sale de la infraestructura del cliente; adecuado para equipos que no pueden enviar código a APIs externas.
- Procesamiento de documentación técnica multilingüe: resumen, traducción y extracción de información de documentos en varios idiomas europeos y asiáticos, aprovechando la cobertura lingüística.
- Despliegue en AI Endpoints de OVHcloud: para organizaciones ya en el ecosistema OVHcloud que quieran servir el modelo gestionado con la etiqueta `endpoints_compatible`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor afirma que las cuantizaciones de 8, 6 y 5 bits puntúan "dentro del ruido" respecto a BF16 en código y matemáticas, pero no se aportan cifras concretas (MMLU, HumanEval, GSM8K u otras) en la documentación proporcionada. El informe técnico en PDF podría contenerlas, pero su contenido no está incluido en esta ficha.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización:
  - BF16: 13,6 GB (GPU NVIDIA o Mac con 24 GB o más).
  - Q8_0 (q8_0-safe2): 6,9 GB (CPU x86 o Mac con 16 GB).
  - Q6_K: 6,3 GB (CPU x86; opción más rápida en Metal para Mac de 16 GB).
  - Q5_K_M: tamaño no especificado en la información disponible (inferior a Q6_K).
- GPU recomendadas: NVIDIA (BF16 para GPU; cuantizaciones menores para GPU con menos VRAM). No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, en el rango de 8-16 GB de VRAM con cuantizaciones Q6_K o Q5_K_M; el BF16 requiere ~14 GB, al límite de una RTX 4090 de 24 GB con contexto adicional.
- Apple Silicon: MacBook Air M5 de 16 GB ejecuta el archivo de 6 bits a ~70 tokens/s.
- Opciones de despliegue: llama.cpp mediante el fork de OVHai-LLM (obligatorio); servidor compatible con OpenAI incluido en el fork. No compatible con llama.cpp upstream, Ollama, LM Studio ni otras aplicaciones que no soporten la arquitectura `olala`.
- Latencia y throughput: ~70 tokens/s en MacBook Air M5 con Q6_K. No hay datos de throughput en GPU o CPU x86 en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olala-v1.0-mini-7A1B | 6,8 B totales | no disponible | Híbrida Mamba+MoE | Apache 2.0 | GGUF (fork llama.cpp) |
| Modelos densos de ~7 B (p. ej. familia Llama/Mistral/Qwen de 7-8 B) | ~7-8 B | variable según modelo | Transformer denso | variable | GGUF estándar, amplio soporte |
| Modelos MoE pequeños (~7 B totales, ~1 B activos) | ~7 B totales | variable | MoE transformer | variable | variable |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada: no se aportan benchmarks que permitan situar el modelo frente a Llama, Mistral, Qwen u otros de tamaño similar. La principal diferencia cualitativa es la arquitectura híbrida Mamba-MoE y la necesidad de un fork de llama.cpp, frente al soporte universal de los transformers densos.

## Limitaciones y advertencias

- Requiere un fork específico de llama.cpp: no funciona con llama.cpp upstream, Ollama, LM Studio ni las aplicaciones listadas en "Use this model" de Hugging Face. Esto limita la portabilidad y complica el despliegue en producción.
- No hay datos públicos de benchmarks en la información disponible; la afirmación de "sin pérdida de calidad medible" en las cuantizaciones es del autor y no está respaldada con cifras.
- Longitud de contexto no disponible: no se puede evaluar su idoneidad para tareas de contexto largo sin consultar el informe técnico.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad ni tasas de alucinación.
- Sesgos: no se documentan en la información disponible evaluaciones de sesgo, toxicidad o robustez.
- El número de parámetros activos no está confirmado; el nombre "7A1B" sugiere ~1 B activos, pero no se verifica en la documentación.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución; no obstante, conviene verificar las condiciones del modelo base y del fork de llama.cpp por separado.
- El repositorio tiene 94 descargas y 8 likes en el momento de la consulta, lo que indica adopción temprana y comunidad reducida; el soporte y la madurez del ecosistema son limitados.
- Compatibilidad con endpoints de OVHcloud: la etiqueta `endpoints_compatible` sugiere integración con AI Endpoints, pero no se detallan las condiciones de servicio.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-GGUF
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Fork de llama.cpp: https://github.com/OVHai-LLM/llama.cpp
- Informe técnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- Playground: https://olala.ovh.com
- AI Endpoints de OVHcloud: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/#try-our-models
