# pinkelephantlimited/PinkLocal

## Resumen

PinkLocal es un modelo de lenguaje de 3.500 millones de parámetros (3,5B) desarrollado por Pink Elephant Limited, diseñado específicamente para inferencia en dispositivo (móviles, portátiles y equipos de borde). Su propuesta principal es la privacidad: el modelo se ejecuta íntegramente de forma local, sin llamadas a la nube, sin telemetría y sin cuentas, lo que garantiza que las conversaciones nunca abandonan el dispositivo. Está pensado para cubrir el hueco de los asistentes de IA que dependen de servidores externos, ofreciendo una alternativa abierta y verificable.

Arquitectónicamente, PinkLocal es un Transformer denso con atención por ventana deslizante (sliding window attention), atención por grupos de consultas (GQA), incrustaciones posicionales rotatorias (RoPE) y activación SwiGLU. Tiene una ventana de contexto de 8.000 tokens y soporta 12 idiomas. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. El modelo se ha entrenado desde cero sobre 200.000 millones de tokens procedentes de datasets abiertos y permisivos, seguido de un ajuste fino supervisado (SFT) y optimización por preferencias (DPO). Su tamaño cuantizado (2 GB en INT4) lo hace viable en teléfonos con 4 GB de RAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con GQA (8 cabezas de consulta, 2 de clave/valor), RoPE, SwiGLU, RMSNorm, QK-Norm y Sliding Window Attention (ratio 5:1 local/global) |
| Parametros totales | 3.500 millones (3,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.000 tokens |
| Tipos de cuantizacion | INT4 (Q4_K_M), INT5 (Q5_K_M), INT8 (Q8_0), FP16 |
| Idiomas soportados | 12: ingles, chino, japones, coreano, frances, aleman, español, portugues, arabe, hindi, ruso y vietnamita |
| Licencia | Apache 2.0 (segun la model card; en HuggingFace figura como "no disponible") |
| Formato de pesos | Safetensors (inferido por el uso de `transformers`), GGUF (para llama.cpp), ONNX, Core ML, ExecuTorch, LiteRT |

## Arquitectura y entrenamiento

PinkLocal es un Transformer causal denso de 36 bloques. Cada bloque emplea normalización previa (pre-norm) con RMSNorm, atención GQA con 8 cabezas de consulta y 2 de clave/valor (lo que reduce el tamaño de la caché KV en un factor de 4), y una FFN SwiGLU con dimensiones 3072 → 8192 → 3072. La atención combina capas locales con ventana deslizante de 2048 tokens (5 de cada 6 capas) y capas globales de atención completa (1 de cada 6), logrando una reducción del 80% en memoria de caché KV. Se aplica RoPE para posiciones y QK-Norm para estabilizar el entrenamiento. El vocabulario es de 64.000 tokens, equilibrado para cobertura multilingüe.

El entrenamiento se realizó sobre 200.000 millones de tokens procedentes de datasets abiertos: FineWeb (100B, inglés), FineWeb-2 (50B, multilingüe), The Stack v2 (10B, código en 600+ lenguajes), FineMath (5B, razonamiento matemático) y Wikipedia (5B, conocimiento factual). El post-entrenamiento incluyó una fase de SFT con 50.000 ejemplos de instrucciones (Tulu 3, OpenAssistant, UltraChat) y una fase de DPO con 30.000 pares de preferencias (UltraFeedback, HelpSteer 3). No se menciona el uso de RLHF adicional ni técnicas de decodificación especulativa.

## Capacidades

- Generación de texto y conversación multilingüe en 12 idiomas, con instrucciones y chat.
- Razonamiento matemático básico e intermedio, con soporte para cadenas de pensamiento (CoT) en tareas como GSM8K.
- Generación de código en múltiples lenguajes (entrenado con The Stack v2, 600+ lenguajes).
- Comprensión de contexto largo de hasta 8.000 tokens, suficiente para documentos extensos o conversaciones multi-turno.
- Inferencia completamente offline, sin necesidad de conexión a internet tras la descarga.
- Compatibilidad con múltiples runtimes de inferencia en dispositivo: ExecuTorch (iOS/Android), LiteRT (Android con aceleración NPU), Core ML (iOS con Neural Engine), ONNX Runtime y llama.cpp.
- No se menciona soporte explícito de tool calling, function calling ni capacidades multimodales (visión, audio). Tampoco se indica un modo de razonamiento especial tipo "thinking".

## Casos de uso

- Asistente personal privado en el móvil: el modelo se ejecuta localmente en un teléfono con 4 GB de RAM (cuantización INT4), permitiendo responder preguntas, gestionar recordatorios o mantener conversaciones sin enviar datos a la nube. Es adecuado por su tamaño reducido y su licencia Apache 2.0.
- Traducción y asistencia multilingüe en dispositivos de borde: con soporte para 12 idiomas, puede traducir frases o mantener diálogos en varios idiomas sin conexión, útil para viajeros o entornos con conectividad limitada.
- Generación de código en entornos de desarrollo locales: un desarrollador puede integrar PinkLocal en su IDE o CLI para autocompletar o explicar fragmentos de código, aprovechando su entrenamiento en The Stack v2 y su capacidad de ejecución en portátiles (FP16 o INT8).
- Chatbot de atención al cliente en dispositivos de punto de venta o kioscos: al funcionar offline, evita problemas de latencia y privacidad, y puede manejar consultas frecuentes con contexto de hasta 8.000 tokens.
- Educación y tutoría sin conexión: estudiantes en zonas sin internet pueden usar PinkLocal para resolver dudas de matemáticas, ciencias o idiomas, gracias a su razonamiento básico y su capacidad multilingüe.
- Prototipado rápido de aplicaciones de IA en el borde: desarrolladores pueden desplegar PinkLocal en Raspberry Pi o dispositivos similares usando llama.cpp u ONNX Runtime, validando conceptos de IA local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card publica **objetivos de rendimiento** (targets), no resultados medidos. No se han publicado resultados reales de benchmarks en la información disponible. Los objetivos declarados son:

| Benchmark | Objetivo | Comparacion (segun model card) |
|---|---|---|
| MMLU (0-shot) | >60 | Phi-4-Mini: 52.8, Qwen 2.5 3B: 65.6 |
| GSM8K (8-shot CoT) | >80 | Phi-4-Mini: 88.6, Gemma 3 4B: 89.2 |
| HumanEval (0-shot) | >60 | Phi-4-Mini: 62.0, Gemma 3n E2B: 66.5 |
| Velocidad en iPhone 16 Pro | >25 tok/s | Phi-4-Mini: ~20 tok/s |
| Velocidad en MacBook M4 Air | >30 tok/s | Phi-4-Mini: ~22 tok/s |

Estos datos son aspiracionales y no deben interpretarse como resultados verificados. No se dispone de evaluaciones independientes.

## Requisitos de hardware

- Inferencia en móvil: cuantización INT4 (~2 GB) en teléfonos con 4 GB de RAM; INT5 (~2,5 GB) en gama media con 6 GB; INT8 (~3,5 GB) en gama alta con 8 GB o más.
- Inferencia en portátil/escritorio: FP16 (~7 GB) requiere al menos 8 GB de RAM y una GPU o CPU moderna; INT8 puede ejecutarse en portátiles con 8 GB de RAM.
- GPUs recomendadas: para FP16, una GPU con 8 GB de VRAM (p. ej., RTX 3060, RTX 4060) es suficiente; para INT4, cualquier GPU con 4 GB de VRAM (p. ej., GTX 1650, RTX 3050) puede servir.
- Runtimes soportados: ExecuTorch (Meta), LiteRT (Google), Core ML (Apple), ONNX Runtime, llama.cpp. También es compatible con `transformers` de Hugging Face y BitsAndBytes para cuantización en 4 bits.
- Latencia y throughput: no se han publicado mediciones reales. Los objetivos indican >25 tok/s en iPhone 16 Pro y >30 tok/s en MacBook M4 Air, pero son metas no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| PinkLocal 3.5B | 3,5B | 8K | Apache 2.0 | Inferencia en dispositivo, privacidad | Hugging Face (0 descargas) |
| Phi-4-Mini (Microsoft) | 3,8B | 128K | MIT | Razonamiento, código, matemáticas | Hugging Face, Azure |
| Qwen 2.5 3B (Alibaba) | 3,1B | 32K | Apache 2.0 | Multilingüe, código, matemáticas | Hugging Face, ModelScope |
| Gemma 3 4B (Google) | 4B | 32K | Gemma Terms | Multilingüe, visión (en variantes) | Hugging Face, Kaggle |

PinkLocal se diferencia por su énfasis en privacidad total (sin telemetría, sin nube) y su optimización para móviles con 4 GB de RAM. Sin embargo, carece de resultados de benchmarks publicados y de soporte para tool calling o visión, a diferencia de algunos competidores. Su ventana de contexto (8K) es inferior a la de Phi-4-Mini (128K) o Qwen 2.5 (32K).

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks reales; los objetivos de rendimiento de la model card no están verificados de forma independiente.
- La ventana de contexto de 8.000 tokens es limitada para tareas que requieran documentos muy largos o conversaciones extensas.
- No se menciona soporte para tool calling, function calling ni capacidades multimodales (visión, audio), lo que limita su uso en agentes complejos.
- No hay información sobre sesgos, alucinaciones o comportamiento en dominios especializados. Al entrenarse con datos web abiertos, puede heredar sesgos presentes en esos datos.
- La licencia en HuggingFace figura como "no disponible", aunque la model card declara Apache 2.0. Se recomienda verificar la licencia antes de uso comercial.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es muy reciente o no ha sido validado por la comunidad.
- La fecha de creación (2026-09-01) es posterior a la fecha actual, lo que podría indicar un error en los metadatos o un modelo publicado con fecha futura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pinkelephantlimited/PinkLocal
- Perfil del autor en HuggingFace: https://huggingface.co/pinkelephantlimited
- Repositorio GitHub del autor: https://github.com/pinkelephantlimited/
- Repositorio del proyecto relacionado (pink-elephant-llm): https://github.com/pinkelephantlimited/pink-elephant-llm
- Modelo relacionado (pink-elephant-llm-1.3b): https://huggingface.co/pinkelephantlimited/pink-elephant-llm-1.3b
