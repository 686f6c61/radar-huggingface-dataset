# halt95/ThinkingCap-Qwen3.8-27B-W4A16-Merlin

## Resumen

ThinkingCap-Qwen3.8-27B-W4A16-Merlin es una cuantización de 4 bits del modelo ThinkingCap-Qwen3.8-27B de BottleCap AI, que a su vez es un fine-tune de Qwen3.8-27B de Alibaba. El checkpoint lo publica el desarrollador independiente halt95 y está empaquetado específicamente para el motor de inferencia Merlin (un fork de vLLM 0.33.0), optimizado para GPUs NVIDIA Ampere y Ada. El modelo conserva la ventana de contexto completa de 262.144 tokens del modelo base y añade capacidades de visión, por lo que su pipeline es image-text-to-text.

La propuesta principal es el ajuste de memoria: el checkpoint ocupa 16 GiB y permite servir el contexto completo de 262K tokens en dos o cuatro GPUs de 24 GB (RTX 3090), algo que el modelo en BF16 no permite. La cuantización es W4A16 (pesos INT4, activaciones en BF16) con AWQ asimétrico y grupo de 128, dejando en BF16 la torre de visión, los embeddings y las normas. Se incluye una cabeza MTP (multi-token prediction) para decodificación especulativa y una caché KV cuantizada en FP8.

Es relevante para quienes quieran desplegar un modelo de razonamiento de 27B con contexto muy largo y visión sobre hardware de consumo o servidores Ampere sin recurrir a GPUs de 80 GB. La contrapartida es una licencia restrictiva (PolyForm Small Business 1.0.0) y un ecosistema de ejecución muy específico: el modelo está pensado para Merlin, no para vLLM estándar, llama.cpp u Ollama.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención con compuertas (gated attention) y Gated DeltaNet; 64 capas en total (16 de atención, 48 de DeltaNet), más torre de visión y cabeza MTP |
| Parámetros totales | 27.356.728.560 (27,36 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantización | W4A16: AWQ INT4 asimétrico grupo 128 en proyecciones de atención, DeltaNet y feed-forward; lm_head y cabeza MTP en INT4 GPTQ asimétrico grupo 128; torre de visión, embeddings y normas en BF16; caché KV en FP8 E4M3 con escalas estáticas por capa |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | PolyForm Small Business 1.0.0 (no es Apache-2.0) |
| Formato de pesos | safetensors (compatible con compressed-tensors), más `kv_scales.safetensors` para la caché FP8 |

## Arquitectura y entrenamiento

El modelo base ThinkingCap-Qwen3.8-27B es un fine-tune de Qwen3.8-27B orientado a razonar con menos tokens. La arquitectura subyacente es un transformer híbrido: 16 capas usan atención con compuertas y 48 capas usan Gated DeltaNet, un mecanismo de estado recurrente que reduce el coste de contexto largo frente a la atención completa. El modelo incluye además una torre de visión (de ahí el pipeline image-text-to-text) y una cabeza MTP para decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

Esta versión concreta es una cuantización post-entrenamiento realizada por halt95 siguiendo la receta de AWQ de philbert. Las proyecciones de atención, DeltaNet y feed-forward se cuantizan a INT4 asimétrico con grupo 128. El `lm_head` y la cabeza MTP se toman byte a byte del build de Qwen3.8-27B de halt95, ya que los originales de ThinkingCap son bit-idénticos a los de Qwen3.8-27B. Las escalas de la caché KV en FP8 también se reutilizan del build de Qwen3.8-27B, tras verificar que los máximos de activación de ThinkingCap caben dentro de ellas. La innovación técnica destacable es la combinación de cuantización de pesos W4A16, caché KV en FP8, decodificación especulativa vía MTP y el motor Merlin, que permite mantener un pool de KV de más de 2 millones de tokens en VRAM en cuatro RTX 3090.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable (el servidor usa effort medio por defecto).
- Comprensión de imágenes y texto (image-text-to-text) gracias a la torre de visión conservada en BF16.
- Razonamiento multi-paso y cadenas de pensamiento, con el objetivo declarado de razonar en menos tokens que el modelo base.
- Decodificación especulativa mediante cabeza MTP, que acelera la generación.
- Soporte de contexto muy largo: 262.144 tokens, con sesiones múltiples simultáneas (siete sesiones de 262K en cuatro GPUs según la model card).
- Conversación multi-turno (tag conversational).
- Capacidades multilingües limitadas: solo inglés declarado.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Análisis de documentos largos: con 262K tokens de contexto, el modelo puede procesar informes completos, expedientes o bases de código extensas en una sola pasada sin fragmentar, algo viable en dos o cuatro RTX 3090 gracias a la caché KV en FP8.
- Asistentes con memoria de conversación prolongada: el pool de KV permite mantener varias sesiones de contexto largo en VRAM a la vez, adecuado para atención al cliente o asistentes internos con historial extenso.
- Procesamiento de documentos con imágenes: al conservar la torre de visión, puede extraer información de capturas, diagramas o páginas escaneadas combinadas con texto largo, por ejemplo en digitalización de archivos.
- Razonamiento técnico y análisis de código: el modo thinking y el contexto largo permiten revisar repositorios completos o trazas de error extensas y razonar sobre ellos.
- Despliegue en hardware de consumo o servidores Ampere: el tamaño de 16 GiB y los perfiles para 24 GB permiten montar un servidor de inferencia con cuatro RTX 3090 en lugar de GPUs de 80 GB, reduciendo coste de infraestructura.
- Servicio multiagente: la model card reporta ocho conversaciones de 16K simultáneas con 997 tok/s agregados en cuatro GPUs, lo que encaja en orquestaciones de varios agentes que comparten un mismo servidor.
- Investigación sobre cuantización y decodificación especulativa: el checkpoint y sus bench cards sirven como referencia reproducible para estudiar el impacto de W4A16 más KV FP8 más MTP en calidad y velocidad.

## Benchmarks y rendimiento

La model card aporta métricas de velocidad medidas con Merlin 3.0.2.2 (vLLM 0.33.0) sobre 4× RTX 3090 sin NVLink a 220 W, con P2P activado. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

| Métrica | Configuración | Resultado |
|---|---|---|
| Decodificación | 1 stream, thinking on (effort medio), prompt de 261.888 tokens + 128 de salida | 265,2–276,0 tok/s (mediana de 3 envíos) |
| Prefill | Prompt frío de 101.845 tokens | 3.025 tok/s |
| Agentes | 8 conversaciones de 16K, luego 8 seguimientos simultáneos de 512 tokens, thinking on | 997 tok/s totales (ventana de solapamiento < 5 s) |
| Pool de KV | 4 GPUs, FP8 en VRAM | 2.012.105 tokens |
| Sesiones largas | 4 GPUs | 7 sesiones de 262K simultáneas |

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 16 GiB; con caché KV FP8 y overhead del motor, la model card lo sitúa en perfiles de dos o cuatro GPUs de 24 GB para contexto completo. Existe un perfil de una sola tarjeta listado, pero no fue probado con ThinkingCap.
- GPUs recomendadas: RTX 3090 (Ampere, sm86) es el objetivo principal; los perfiles para Ada están en pruebas o sin probar. No se documentan requisitos para A100 u H100.
- Cabe en GPU de consumo: sí, en RTX 3090 de 24 GB, en configuraciones de dos o cuatro tarjetas para el contexto de 262K.
- Opciones de despliegue: Merlin 3.0.2.2 (fork de vLLM 0.33.0) es el motor previsto. No se garantiza funcionamiento en vLLM estándar, llama.cpp, Ollama o TGI.
- Latencia y throughput: 274 tok/s de decodificación a 262K de contexto, 3.025 tok/s de prefill en 100K y 997 tok/s agregados con 8 agentes en cuatro GPUs (cifras de la model card, con la advertencia de que la cifra de agentes se lee de forma aproximada).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-W4A16-Merlin | 27,36B | 262K | W4A16 + KV FP8 | PolyForm Small Business 1.0.0 | Requiere Merlin; visión; MTP |
| ThinkingCap-Qwen3.8-27B (base) | 27,36B | 262K (según model card) | BF16 | No disponible en la información | Referencia de calidad; mayor huella de VRAM |
| Qwen3.8-27B-W4A16-Merlin (halt95) | No disponible | No disponible | W4A16 + KV FP8 | No disponible | Mismo motor y receta; sin el fine-tune ThinkingCap |
| Qwen3.8-27B (original) | No disponible | No disponible | BF16 | No disponible | Modelo upstream de Qwen |

Los datos de los modelos comparables no están detallados en la información proporcionada; solo se confirma su existencia como modelos base o builds relacionados.

## Limitaciones y advertencias

- Licencia PolyForm Small Business 1.0.0: no es una licencia de código abierto y restringe el uso comercial a pequeñas empresas según sus términos; revisar el archivo LICENSE antes de cualquier despliegue en producción.
- Solo inglés declarado: no hay soporte multilingüe documentado, lo que limita su uso en castellano u otros idiomas.
- Dependencia de Merlin: el checkpoint está empaquetado para un fork específico de vLLM; usarlo con otros motores puede no funcionar o perder las optimizaciones (KV FP8, MTP, perfiles de memoria).
- Perfiles de una tarjeta y de GPUs Ada sin validar con ThinkingCap; el soporte está centrado en Ampere.
- Riesgo de alucinación inherente a los modelos de razonamiento; no se aportan evaluaciones de calidad ni de sesgo en la información disponible.
- Las cifras de throughput con agentes provienen de una ventana de solapamiento inferior a 5 s y el propio autor pide leerlas de forma aproximada.
- El modo thinking está activado por defecto con effort medio, lo que incrementa el consumo de tokens de salida si no se ajusta.
- No se documenta soporte de tool calling ni de function calling, relevante si se planean pipelines de agentes con herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/halt95/ThinkingCap-Qwen3.8-27B-W4A16-Merlin
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Modelo upstream Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Build relacionado de halt95: https://huggingface.co/halt95/Qwen3.8-27B-W4A16-Merlin
- Motor Merlin: https://github.com/halt95/merlin-engine
- Bench card 2026-11-21: https://github.com/halt95/merlin-engine/blob/main/models/thinkingcap/benchmarks/2026-11-21/BENCH-CARD.md
- Bench card 2026-11-12: https://github.com/halt95/merlin-engine/blob/main/models/thinkingcap/benchmarks/2026-11-12/BENCH-CARD.md
- Plantillas de chat corregidas de Qwen3.8: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Comunidad en Discord: https://discord.gg/jVDYAwdGzt
- Apoyo al autor: https://ko-fi.com/halt95
