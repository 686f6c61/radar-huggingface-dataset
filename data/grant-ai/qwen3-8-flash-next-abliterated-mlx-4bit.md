# grant-ai/Qwen3.8-Flash-Next-Abliterated-MLX-4bit

## Resumen

Qwen3.8-Flash-Next-Abliterated-MLX-4bit es una compilación cuantizada a 4 bits del modelo multimodal Qwen3.8-Flash-Next, optimizada para Apple Silicon mediante la librería oMLX. El modelo original, desarrollado por el equipo Qwen de Alibaba, es un MoE experimental de 125B parámetros con ~6B activos por token, que sirve como avance de la arquitectura Qwen4. Esta versión concreta, publicada por el usuario grant-ai, aplica la técnica de abliteración (eliminación de comportamientos de rechazo) sobre el checkpoint BF16 de Blackfrost-AI, manteniendo intactas la torre de visión y la cabeza de predicción multi-token (MTP).

El resultado es un modelo con una tasa de rechazo muy baja (2,3% en prompts dañinos, medido en el checkpoint padre) y una velocidad de decodificación notablemente superior gracias a la decodificación especulativa: alcanza 58,1 tokens por segundo con MTP activado y razonamiento desactivado, frente a 26,5 sin MTP, en un M3 Ultra. Está pensado exclusivamente para investigación experimental en seguridad de IA, red-teaming e interpretabilidad, y no debe desplegarse como endpoint público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated DeltaNet + Gated Attention), multimodal (imagen y texto) |
| Parametros totales | 125B (modelo base); ~34,3B en checkpoint cuantizado (34.316.160.099) |
| Parametros activos | ~6B por token (10 de 512 expertos) |
| Longitud de contexto | 262.144 tokens (extensible a 1M con YaRN) |
| Tipos de cuantizacion | oQ4e (4-bit, precisión mixta por tensor calibrada con iMatrix) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura base es un MoE híbrido que combina Gated DeltaNet y Gated Attention, un diseño introducido en Qwen3-Next y reutilizado en las series Qwen3.5 a Qwen3.8. El modelo principal tiene 125B parámetros, complementados por 51B de embeddings N-gram, con 6B parámetros activos por token (10 de 512 expertos). Incluye una torre de visión para entrada de imágenes y una cabeza MTP (multi-token prediction) que permite decodificación especulativa. El contexto nativo es de 262.144 tokens, ampliable a 1M con YaRN.

Esta compilación concreta parte del checkpoint BF16 de Blackfrost-AI, que aplicó abliteración (eliminación de la direccionalidad de rechazo en los pesos) con la persona "Qwentium". grant-ai lo cuantizó a oQ4e con oMLX, preservando la torre de visión y la cabeza MTP. No se dispone de datos sobre el número de tokens de entrenamiento ni la composición del dataset del modelo base; el autor indica que la abliteración se midió en el checkpoint BF16 y que esta versión 4-bit aún no ha sido re-medida tras la cuantización.

## Capacidades

- Generación de texto multimodal: acepta imágenes y texto como entrada, y produce texto.
- Razonamiento con modo "thinking": soporta niveles de esfuerzo de razonamiento (low, medium, xhigh), siendo xhigh el predeterminado.
- Decodificación especulativa con MTP: acelera la generación entre 1,44x y 2,18x según temperatura y previsibilidad del texto.
- Abliteración: tasa de rechazo muy reducida (2,3% en prompts dañinos en el checkpoint padre), lo que lo hace útil para investigación de alineación y red-teaming.
- Soporte de tool calling y agentes: no se menciona explícitamente en la documentación, pero es una capacidad estándar en la serie Qwen3.8; no confirmada para este build.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar el comportamiento de un LLM sin refusals, analizando cómo responde a instrucciones dañinas y qué mecanismos de alineación se pueden restaurar. Se usaría en entornos aislados con prompts controlados.
- Red-teaming de sistemas de moderación: sirve como generador de contenido adversario para probar filtros de seguridad en otras aplicaciones, midiendo tasas de detección y evasión.
- Interpretabilidad de mecanismos de rechazo: al eliminar la direccionalidad de refusal, se pueden comparar activaciones internas entre el modelo abliterated y el original para localizar circuitos responsables del rechazo.
- Investigación en cuantización: el build oQ4e con precisión mixta por tensor permite estudiar el impacto de la cuantización en la calidad de generación y en la velocidad de decodificación especulativa.
- Evaluación de decodificación especulativa: la cabeza MTP conservada permite medir tasas de aceptación de borradores y optimizar parámetros de temperatura y longitud de generación.
- Benchmarking de rendimiento en Apple Silicon: útil para validar el rendimiento de oMLX en hardware M3 Ultra, incluyendo prefill, decodificación y uso de memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este build abliterated en la información disponible. El modelo base Qwen3.8-Flash-Next tiene resultados reportados en JobBench, CoWorkBench, IFBench y Agent's Last Exam, pero no se incluyen cifras en los materiales consultados. Los únicos datos de rendimiento disponibles son los de velocidad de decodificación medidos por el autor en un M3 Ultra Mac Studio (256 GB):

| Configuracion | MTP off (tok/s) | MTP on (tok/s) | Speedup |
|---|---|---|---|
| Razonamiento xhigh, temp 0, 512 tokens | 26,9 | 52,4 | 1,95x |
| Razonamiento xhigh, temp 0, 1024 tokens | 26,7 | 52,3 | 1,96x |
| Razonamiento off, temp 0, 512 tokens | 26,9 | 54,8 | 2,04x |
| Razonamiento off, temp 0, 1024 tokens | 26,7 | 52,0 | 1,95x |
| Razonamiento off, temp 0, prompt tecnico, 512 tokens | ~26,7 | 57,3 | 2,15x |
| Razonamiento off, temp 0, prompt tecnico, 1024 tokens | ~26,7 | 58,1 | 2,18x |

La tasa de aceptación del borrador MTP es del 71,3% (17.965 de 25.202 borradores), con 2,47 tokens por ciclo de backbone. El prefill alcanza 145-225 tok/s en prompts cortos y ~815 tok/s en prompts de 1000 tokens.

## Requisitos de hardware

- VRAM estimada: ~106 GiB de memoria unificada en servicio; ~76 GiB si se activa el offload SSD de la tabla n-gram.
- GPU recomendadas: Apple Silicon con al menos 128 GB de memoria unificada (M3 Ultra o superior). No cabe en GPUs de consumo convencionales (RTX 4090, etc.).
- Opciones de despliegue: oMLX (librería de inferencia para Apple Silicon), compatible con el ecosistema MLX.
- Latencia: tiempo al primer token de ~0,5 s en prompts cortos.
- Throughput: 26,5-58,1 tok/s según configuración de MTP y temperatura, medido en M3 Ultra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B (6B activos) | 262.144 | BF16/FP8 | qwen-community-1.0 | Modelo original, con refusals estándar |
| Blackfrost-AI/Qwen3.8-Flash-Next-DERISKED-BF16 | 125B (6B activos) | 262.144 | BF16 | qwen-community-1.0 | Abliterated, persona Qwentium, sin cuantizar |
| grant-ai/Qwen3.8-Flash-Next-Abliterated-MLX-4bit | 125B (6B activos) | 262.144 | oQ4e | qwen-community-1.0 | Este build, 4-bit, MTP y visión preservados |
| grant-ai/Qwen3.8-27B-Abliterated-MTPLX-4bit | 27B | no disponible | 4-bit | no disponible | Build abliterated de menor tamaño del mismo autor |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Modelo abliterated: carece de refusals de seguridad de forma intencionada. Puede generar contenido dañino, ilegal o no ético. El autor advierte explícitamente que no debe exponerse como endpoint público ni desplegarse para usuarios no confiables.
- Uso restringido: publicado únicamente para investigación experimental en seguridad de IA, red-teaming, interpretabilidad y cuantización. Cualquier otro uso queda bajo responsabilidad del usuario.
- Licencia qwen-community-1.0: impone condiciones de uso comunitario; es necesario revisar los términos exactos antes de cualquier uso comercial o de redistribución.
- Riesgo de alucinación: no se han evaluado tasas de alucinación específicas para este build; al ser una variante abliterated, la probabilidad de respuestas inventadas puede diferir del modelo original.
- Limitaciones de idioma: no se dispone de información sobre los idiomas soportados; se asume cobertura multilingüe similar a la serie Qwen, pero sin confirmación.
- Rendimiento no re-medido: la tasa de rechazo del 2,3% corresponde al checkpoint BF16 padre; esta versión 4-bit no ha sido re-evaluada tras la cuantización, por lo que el comportamiento real puede variar.
- Requisitos de hardware elevados: necesita al menos 76 GiB de memoria unificada, lo que limita su uso a estaciones de trabajo Apple de gama alta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grant-ai/Qwen3.8-Flash-Next-Abliterated-MLX-4bit
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint abliterated BF16: https://huggingface.co/Blackfrost-AI/Qwen3.8-Flash-Next-DERISKED-BF16
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Build abliterated previo del mismo autor: https://huggingface.co/grant-ai/Qwen3.8-27B-Abliterated-MTPLX-4bit
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
