# shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB

## Resumen

Kimi K3.1 Pro SuperExpert (12GB) es una consolidación on-device del modelo fundacional MoE de Moonshot AI `moonshotai/Kimi-K3.1-Pro`, que el autor describe como un MoE de 2,8 billones de parámetros con 104B activos. El autor, shashanth-27xA9, aplica una técnica denominada AW-SECD (Activation-Weighted Super-Expert Consolidation & Residual Drift Compensation) para comprimir el modelo original a un footprint de 12 GB distribuido en 18 shards de safetensors. El resultado declarado son 12.008.815.616 parámetros reales según los safetensors del repositorio.

El modelo se posiciona para ejecución en hardware de consumo: PCs, portátiles y dispositivos edge con 16 GB de RAM. Declara una longitud de contexto nativa de 1.048.576 tokens (1M), atención Gated DeepSeek Sparse Attention (Gated DSA) más Kernelized Delta Attention (KDA), y una retención de inteligencia agregada del 94,8% respecto al modelo base según la model card. Está publicado bajo licencia Apache 2.0 y disponible en safetensors y GGUF, con compatibilidad con endpoints y con flujo de ejecución vía Ollama.

La relevancia actual del modelo reside en su propuesta de llevar un MoE de escala trillonaria a un formato ejecutable en un único equipo de consumo, algo poco habitual. No obstante, conviene señalar que los datos de arquitectura, benchmarks y retención provienen exclusivamente de la model card del autor y no se ha localizado verificación independiente en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE derivada de `moonshotai/Kimi-K3.1-Pro`; atención Gated DeepSeek Sparse Attention (Gated DSA) + Kernelized Delta Attention (KDA); código custom (`kimi_k31_superexpert`) |
| Parametros totales | 12.008.815.616 (12,0 B) según safetensors del repo |
| Parametros activos | no disponible (el modelo base se declara con 104B activos, pero no se detalla el patrón de activación del consolidado) |
| Longitud de contexto | 1.048.576 tokens (1M) según model card |
| Tipos de cuantizacion | 8-bit (tag del repo); GGUF disponible; no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (model card y metadatos del repo) |
| Formato de pesos | safetensors (18 shards) y GGUF |

## Arquitectura y entrenamiento

El modelo es una consolidación del MoE `moonshotai/Kimi-K3.1-Pro`, que el autor describe con 2,8 billones de parámetros totales y 104B activos. La consolidación AW-SECD (Activation-Weighted Super-Expert Consolidation & Residual Drift Compensation) agrupa y comprime los expertos del MoE original ponderando por activación y compensando la deriva residual, produciendo un checkpoint de 12 GB. La arquitectura de atención declarada combina Gated DeepSeek Sparse Attention (Gated DSA) con Kernelized Delta Attention (KDA), orientada a eficiencia en contexto largo. El repositorio incluye código de modelado propio (`modeling_kimi_k31_superexpert.py`, ~9,56 kB) y un tokenizador `tiktoken.model` heredado del modelo base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo etapas de RLHF, DPO o ajuste fino adicional en la consolidación. Tampoco se detalla el proceso de calibración de la cuantización a 8-bit ni el método exacto de reconstrucción de pesos. Toda la información técnica procede de la model card del autor y no se ha verificado de forma independiente en los resultados de búsqueda disponibles.

## Capacidades

- Generación de texto conversacional y de propósito general, con pipeline declarado `text-generation`.
- Razonamiento matemático: la model card reporta GSM8K del 83,5% en la versión consolidada.
- Generación de código: HumanEval del 78,4% declarado.
- Razonamiento de sentido común y conocimiento general: ARC-Challenge del 86,2% y MMLU del 76,8% declarados.
- Seguimiento de instrucciones: IFEval del 80,2% declarado.
- Contexto largo nativo de hasta 1.048.576 tokens, según la model card.
- Compatibilidad con endpoints y con ejecución local vía Ollama (`ollama run hf.co/...`).
- Soporte de tool calling, function calling, agentes multi-paso, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).

## Casos de uso

- Asistencia matemática y resolución de problemas paso a paso en local: el modelo declara GSM8K del 83,5% y un contexto de 1M tokens, lo que permite adjuntar enunciados largos, derivaciones y material de referencia en una sola ventana sin fragmentar.
- Generación y revisión de código en estaciones de trabajo sin GPU dedicada: con 12 GB de footprint y HumanEval declarado del 78,4%, puede ejecutarse en portátiles de 16 GB de RAM para autocompletado, explicación de funciones y refactorización acotada.
- Procesamiento de documentos extensos en edge: contratos, informes o expedientes que superen el millón de tokens pueden analizarse en una única pasada gracias al contexto declarado de 1M, sin necesidad de infraestructura en nube.
- Despliegue de asistentes conversacionales on-premise: al publicarse en GGUF y ser compatible con Ollama, encaja en entornos con requisitos de privacidad donde los datos no pueden salir del equipo del usuario.
- Evaluación de instrucciones y prototipado de agentes: el IFEval del 80,2% declarado permite usar el modelo como base para probar prompts de sistema y flujos de instrucciones antes de escalar a modelos mayores.
- Educación y tutoría técnica offline: razonamiento matemático y de código combinados con contexto largo permiten construir tutores que mantengan el historial completo de un curso o un cuaderno de ejercicios en memoria.
- Investigación sobre compresión de MoE: el checkpoint sirve como referencia práctica para estudiar la retención de capacidades tras consolidación AW-SECD, comparando sus resultados declarados con el modelo base.

## Benchmarks y rendimiento

Datos declarados en la model card del autor (no verificados de forma independiente):

| Benchmark | Foundation 2.8T MoE | Kimi K3.1 Pro 12GB SuperExpert | Retención % |
|---|---|---|---|
| ARC-Challenge | 89,4% | 86,2% | 96,4% |
| GSM8K | 88,1% | 83,5% | 94,8% |
| HumanEval | 82,6% | 78,4% | 94,9% |
| MMLU | 81,2% | 76,8% | 94,6% |
| IFEval | 84,7% | 80,2% | 94,7% |
| Agregado | 85,2% | 81,0% | 94,8% |

No se han localizado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 12 GB de pesos consolidados; la model card apunta a equipos con 16 GB de RAM como objetivo mínimo razonable.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encaja en GPUs consumer con 16 GB o más de VRAM (por ejemplo, RTX 4080/4090, según disponibilidad) y en GPUs profesionales tipo A100/H100 para despliegues con mayor concurrencia.
- Cabe en GPU consumer: sí, en tarjetas con al menos 16 GB de VRAM; también en ejecución CPU con 16 GB de RAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, Ollama (`ollama run hf.co/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB`), GGUF para llama.cpp; vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kimi K3.1 Pro SuperExpert 12GB | 12,0 B (consolidado de MoE 2,8T) | 1.048.576 | Apache 2.0 | safetensors, GGUF | Retención declarada 94,8%; orientado a 16 GB RAM |
| Kimi K3.1 Pro SuperExpert 9.2GB | no disponible | no disponible | cc-by-nc-4.0 (según metadatos del repo) | safetensors | Variante más pequeña del mismo autor, sub-10GB, orientada a portátil |
| `moonshotai/Kimi-K3.1-Pro` (base) | 2,8 T totales / 104 B activos (declarado) | no disponible | no disponible | no disponible | Modelo fundacional del que deriva; requiere infraestructura de gran escala |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoría (modelos on-device de 12 GB) en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks, la retención del 94,8% y las especificaciones de arquitectura proceden únicamente de la model card del autor; no se ha localizado verificación independiente.
- La consolidación de un MoE de 2,8T a 12 GB implica una pérdida de capacidades no cuantificada más allá de la retención declarada; el comportamiento en dominios no cubiertos por los benchmarks puede degradarse de forma desigual.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación.
- Idiomas soportados no declarados; el rendimiento fuera del inglés no está garantizado.
- La variante hermana de 9.2GB aparece con licencia cc-by-nc-4.0 en los metadatos del repositorio, lo que sugiere posible inconsistencia en el etiquetado de licencias entre variantes del mismo autor; conviene verificar la licencia aplicable antes de uso comercial.
- El modelo requiere `trust_remote_code=True` y código de modelado personalizado, lo que añade superficie de riesgo en producción y obliga a auditar el código antes de desplegarlo.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- El contexto declarado de 1M tokens no está respaldado por pruebas de recuperación en la información disponible; el rendimiento efectivo en ventanas muy largas puede ser inferior.

## Enlaces

- Hugging Face (12GB): https://huggingface.co/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-12GB
- Hugging Face (9.2GB): https://huggingface.co/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-9.2GB
- Árbol de ficheros (9.2GB): https://huggingface.co/shashanth-27xA9/Kimi-K3.1-Pro-SuperExpert-9.2GB/tree/main
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
