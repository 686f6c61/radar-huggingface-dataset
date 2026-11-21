# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-1M

## Resumen

El modelo `Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-1M` es una cuantización NVFP4 de 4 bits con microscaling, empaquetada por Solstice-AI a partir del modelo base de DavidAU `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`. Se trata de un derivado de la familia Qwen 3.8 de 27B (26.895.998.464 parámetros reales en safetensors) que combina una fusión de pesos GAIN (Guided Activation Interleaved Normalization), una ablación de alineamiento del Proyecto Heretic (eliminación de vectores de rechazo) y una extensión de contexto hasta 1.048.576 tokens mediante escalado RoPE con YaRN sobre una ventana nativa de 262K.

El objetivo declarado es el despliegue de alta eficiencia en hardware NVIDIA Blackwell (B200, GB200, RTX 5090), aprovechando los Tensor Cores FP4 y el formato `compressed-tensors` para servir con vLLM o SGLang. Incluye cabezas de decodificación especulativa Multi-Token Prediction (MTP) de doble flujo y un proyector multimodal `mmproj-BF16.gguf` para visión espaciotemporal, lo que lo sitúa en la categoría `image-text-to-text`.

Su relevancia actual radica en la combinación de contexto de un millón de tokens, cuantización FP4 nativa para Blackwell y un perfil "uncensored" orientado a cargas de trabajo de agentes, código y automatización de sistemas. Conviene tratar con cautela las afirmaciones de la model card sobre superioridad frente a Claude Opus 4.6: son datos autoinformados por el autor, sin verificación independiente en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen 3.8: 75% de capas con linear attention GDN (Gated Delta Recurrent Network, complejidad O(1) de memoria) y 25% con Grouped-Query Attention (GQA) global |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) vía YaRN; ventana nativa de 262K |
| Tipos de cuantizacion | NVFP4 (4 bits, microscaling de dos niveles, formato `compressed-tensors`); el repo incluye también GGUF y pesos de 8 bits |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4 / compressed-tensors), GGUF, proyector `mmproj-BF16.gguf` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer híbrido de la familia Qwen 3.8 en el que aproximadamente el 75% de las capas emplean atención lineal GDN, con memoria constante respecto a la longitud de secuencia, y el 25% restante usa GQA global para preservar la capacidad de recuperación exacta a larga distancia. Sobre esa base, DavidAU aplica una fusión de pesos GAIN (Guided Activation Interleaved Normalization) que combina los pesos de mayor rendimiento en razonamiento sin degradación declarada, y posteriormente una ablación de alineamiento del Proyecto Heretic que elimina los vectores de rechazo del modelo ajustado.

Solstice-AI añade tres capas de ingeniería: cuantización NVFP4 con factores de microscaling de dos niveles para los Tensor Cores FP4 de Blackwell, extensión de contexto de 262K a 1.048.576 tokens mediante escalado YaRN de RoPE, e integración de cabezas especulativas MTP de doble flujo que generan dos tokens por paso forward (aceleración declarada de 1,72x a 2,20x). No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de hasta 1M tokens.
- Razonamiento explícito con cadena de pensamiento (etiquetas `cot` y `reasoning` en la model card).
- Generación y depuración de código, con orientación declarada a SWE-bench y SWE-bench Pro.
- Razonamiento matemático y abstracto de nivel científico (ARC-C, ARC-E).
- Capacidades agénticas: control de sistemas operativos de escritorio y móvil (OSWorld, AndroidWorld) y flujos multi-archivo de largo horizonte (CoWorkBench).
- Seguimiento de restricciones complejas e instrucciones largas (IFBench).
- Tool calling / function calling y razonamiento multi-paso orientado a agentes.
- Multimodalidad visión-texto mediante `mmproj-BF16.gguf`: esquemas arquitectónicos, interfaces de código y fotogramas de vídeo.
- Bilingüe inglés-chino.
- Modo "uncensored" por ablación de alineamiento: sin rechazos corporativos ante peticiones de seguridad y desarrollo de sistemas.
- Decodificación especulativa MTP integrada para reducir latencia.

## Casos de uso

- **Automatización de ingeniería de software en producción**: con 61,7% declarado en SWE-bench Pro y 79,0% en QwenSWEBench, el modelo puede resolver issues de repositorios completos y abrir pull requests dentro de pipelines de CI/CD, aprovechando el contexto de 1M tokens para cargar árboles de repositorio y trazas de error completas.
- **Agentes de control de escritorio y móvil**: los resultados declarados en OSWorld-Verified (84,3%) y AndroidWorld (81,9%) lo hacen adecuado para RPA avanzado, pruebas end-to-end de aplicaciones y automatización de tareas administrativas sobre interfaces gráficas.
- **Atención al cliente con contexto documental masivo**: la ventana de 1M tokens permite inyectar manuales, historiales de tickets y bases de conocimiento completas en una sola llamada, manteniendo coherencia en conversaciones multi-turno largas.
- **Análisis de código legacy y migraciones**: la combinación de contexto largo y atención lineal GDN permite procesar monorepos extensos para auditorías de seguridad, refactorizaciones masivas y generación de documentación técnica.
- **Investigación en seguridad ofensiva y análisis de malware**: el perfil ablacionado elimina los rechazos ante análisis de exploits, ingeniería inversa y desarrollo de herramientas de seguridad, un caso de uso explícitamente buscado por el autor.
- **Procesamiento de documentación técnica multimodal**: con el proyector de visión puede interpretar diagramas de arquitectura, capturas de interfaz y fotogramas de vídeo junto al texto asociado para generar documentación o detectar discrepancias.
- **Razonamiento científico y tutoría avanzada**: los 735 puntos en ARC-C y 882 en ARC-E lo sitúan en rango de frontera para tareas de abstracción científica, útil en asistentes de investigación y generación de material didáctico técnico.
- **Despliegue de alto throughput en Blackwell**: en entornos con RTX 5090 o B200, la cuantización NVFP4 y las cabezas MTP permiten servir muchas peticiones concurrentes por GPU, adecuado para plataformas internas de asistentes de código.

## Benchmarks y rendimiento

Datos autoinformados por el autor en la model card, evaluados con el arnés de Claude Code a 256K tokens de contexto, temperatura 1,0 y top_p 0,95. No hay verificación independiente disponible.

| Suite | Capacidad evaluada | Modelo (Solstice-AI x DavidAU) | Claude Opus 4.6 Max | Margen |
|---|---|---|---|---|
| SWE-bench Pro | Ingeniería de software agéntica | 61,7% | 53,4% | +8,3 |
| LiveCodeBench v6 | Resolución de problemas en tiempo real | 90,3% | 88,8% | +1,5 |
| QwenSWEBench | Depuración de repositorio completo | 79,0% | 63,8% | +15,2 |
| OSWorld-Verified | Control de SO de escritorio | 84,3% | 72,7% | +11,6 |
| AndroidWorld | Autonomía en SO móvil | 81,9% | 62,0% | +19,9 |
| IFBench | Seguimiento de restricciones complejas | 79,5% | 62,5% | +17,0 |
| CoWorkBench | Flujos multi-archivo de largo horizonte | 70,7% | 68,2% | +2,5 |
| ARC-C (Challenge) | Abstracción científica de frontera | 735 (8 bits) / 719 (4 bits) | ~710–720 | Nivel frontera |
| ARC-E (Easy) | Razonamiento de sentido común | 882 | ~870 | Por encima de frontera cerrada |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks multilingües estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el repo pesa 20,7 GB en NVFP4 de 4 bits; en la práctica se necesitan aproximadamente 21-23 GB para pesos más overhead de activaciones y caché KV. Para contexto completo de 1M tokens, la caché KV requiere decenas de GB adicionales, por lo que el contexto máximo práctico depende de la GPU y del framework.
- **GPU recomendadas**: NVIDIA Blackwell B200 y GB200 para despliegue de producción; RTX 5090 (32 GB) para el caso de uso consumer de referencia que cita el autor. Las GPU Hopper (H100, H200) y Ada (RTX 4090) no disponen de Tensor Cores FP4 nativos y requerirían de-cuantización o el checkpoint GGUF/8 bits alternativo.
- **Cabe en GPU consumer**: sí, en RTX 5090 con 32 GB en formato NVFP4. En RTX 4090 (24 GB) es ajustado y requiere variantes GGUF cuantizadas o descarga parcial a CPU.
- **Opciones de despliegue**: vLLM (detección automática del formato `compressed-tensors`, vía principal recomendada), SGLang, llama.cpp/Ollama para los pesos GGUF y el proyector de visión.
- **Latencia y throughput**: no disponibles como cifras absolutas; el autor declara una aceleración de 1,72x a 2,20x por las cabezas MTP de decodificación especulativa y el doble de throughput de GEMM FP4 frente a INT4 estándar en Blackwell.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| **Este modelo** (Qwen3.8-27B Cold Fusion NVFP4) | ~26,9B | 1.048.576 (YaRN) | Apache 2.0 | NVFP4, GGUF, safetensors; vLLM, SGLang | Ablación Heretic, MTP, visión espaciotemporal; benchmarks autoinformados |
| **DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU** | ~26,9B | 262K nativo | Apache 2.0 | safetensors, GGUF | Modelo base sin cuantización NVFP4 ni extensión a 1M; misma fusión GAIN y ablación |
| **Qwen3.8-27B estándar** (familia Qwen) | ~27B | 262K | Apache 2.0 | safetensors, GGUF | Alineamiento sin ablación; sin fusión GAIN ni MTP; referencia de partida |
| **Claude Opus 4.6 Max** (Anthropic) | no disponible | no disponible | Propietaria | API cerrada | Comparativa solo en los benchmarks del autor; sin pesos descargables |

La comparación con modelos de la misma categoría (Qwen 3.x de ~27-32B) se ve limitada porque la información proporcionada no incluye datos de benchmarks de las alternativas open source; los únicos números comparativos disponibles son los del modelo cerrado Claude Opus 4.6 Max, que no es desplegable localmente.

## Limitaciones y advertencias

- **Benchmarks no verificados**: los resultados de la model card son autoinformados por el autor, con un arnés de evaluación propietario (Claude Code) y sin réplica independiente. Los márgenes frente a Opus 4.6 deben tratarse como indicativos, no como hechos establecidos.
- **Degradación en 4 bits**: el propio autor reporta 719 en ARC-C en 4 bits frente a 735 en 8 bits, lo que confirma una pérdida medible de rendimiento por la cuantización NVFP4.
- **Dependencia de hardware**: el formato NVFP4 está optimizado para Blackwell; en Hopper, Ada o GPU consumer antiguas el rendimiento y la compatibilidad se degradan sustancialmente.
- **Contexto efectivo vs. nominal**: los 1M tokens se obtienen por extrapolación YaRN sobre una ventana nativa de 262K; la calidad de recuperación en el extremo superior del contexto no está documentada con benchmarks de long-context (RULER, NIAH).
- **Sesgos y alucinación**: no hay documentación de evaluación de sesgos ni de tasas de alucinación. La ablación de alineamiento del Proyecto Heretic elimina los rechazos, lo que incrementa el riesgo de generar contenido dañino, incorrecto o inseguro sin señalización.
- **Idiomas**: solo inglés y chino declarados; el rendimiento en castellano no está evaluado y previsiblemente será inferior.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre las salidas de un modelo sin alineamiento de seguridad; conviene revisar las obligaciones de atribución y las políticas de la organización.
- **Trazabilidad de la cadena de derivación**: el modelo acumula múltiples transformaciones (fusión GAIN, ablación Heretic, cuantización NVFP4, extensión YaRN, cabezas MTP) sobre un base de terceros; los fallos pueden ser difíciles de atribuir y de reproducir.
- **Mantenimiento**: el repositorio tiene 809 descargas y 3 likes en la fecha de consulta, con un único mantenedor downstream; no hay garantía de soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-1M
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor de la cuantización (Solstice-AI): https://huggingface.co/Solstice-AI
- Perfil del autor del modelo base (DavidAU): https://huggingface.co/DavidAU
- Banner del proyecto: https://cdn-uploads.huggingface.co/production/uploads/67c2e844e0921a5410eec10a/Y5M42dCag2f7Fc6fDtV0Z.jpeg
- vLLM (serving recomendado): https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Documentación de YaRN (extensión de contexto RoPE): https://arxiv.org/abs/2309.00071
- Paper de Gated Delta Networks: https://arxiv.org/abs/2412.06464
- Repositorio del Proyecto Heretic: no disponible en la información proporcionada
- Paper o blog de la familia Qwen 3.8: no disponible en la información proporcionada
