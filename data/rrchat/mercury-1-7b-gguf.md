# rrchat/Mercury-1.7B-GGUF

## Resumen

Mercury-1.7B-GGUF es la versión cuantizada en formato GGUF de Mercury-1.7B, un modelo multimodal de razonamiento y uso agéntico desarrollado por el usuario rrchat. El modelo es un fine-tuning sobre LiquidAI/LFM3-VL-2B de Liquid AI, que combina unos ~1.7B de parámetros de lenguaje con un codificador de visión SigLIP. Su objetivo es ofrecer un modelo pequeño, eficiente y capaz de ejecutarse en hardware de consumo, manteniendo capacidades de razonamiento paso a paso (modo *thinking* con etiquetas `<think>`), generación de código, matemáticas y *function calling*.

La relevancia del modelo radica en su arquitectura híbrida LFM3 (Liquid Foundation Model 3), que mezcla atención lineal con convoluciones causales de estado (SSM), y en su soporte nativo para ruso e inglés con capacidades de visión (imagen-texto a texto). Según datos del autor, alcanza unos 180-200 tokens/segundo en una RTX 3060 con la cuantización Q4_K_M, lo que lo hace muy adecuado para despliegues locales en portátiles y equipos de escritorio sin GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 híbrido (atención lineal con puertas sigmoides + convoluciones causales depthwise SSM, kernel k=7) + codificador de visión SigLIP |
| Parametros totales | 1.728.801.536 (~1,73B, dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a arquitectura densa) |
| Longitud de contexto | no disponible en la ficha (los ejemplos de llama.cpp usan `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0, F16 (más proyector de visión mmproj en F16) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base sin cuantizar está disponible en safetensors en rrchat/Mercury-1.7B) |

## Arquitectura y entrenamiento

Mercury-1.7B se construye sobre la arquitectura híbrida LFM3 de Liquid AI, que combina tres mecanismos destacables: convoluciones causales 1D depthwise (*shortconv*) con kernel de tamaño k=7 en las capas tempranas para agregar contexto local con huella de memoria constante; atención multi-cabeza con puertas aprendidas mediante sigmoides (`attn_gate` / `wg`); y normalizaciones LayerNorm post-atención y post-FFN (`attn_post_norm`, `ffn_post_norm`). Esta combinación de atención lineal y convoluciones de estado permite un throughput muy alto en inferencia con llama.cpp.

Sobre los datos y el proceso de entrenamiento del fine-tuning, la información disponible no detalla el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO; no disponible. Lo que sí indica la model card es que el modelo soporta dos modos de generación: un modo *thinking* con trazas de razonamiento explícitas mediante la etiqueta `<think>` (prefillable en el prompt ChatML) y un modo instantáneo o directo. El formato de chat es ChatML estándar con los tokens `<|im_start|>` / `<|im_end|>`.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con calidad general evaluada en el benchmark propio Claw-Eval (>90%).
- Razonamiento matemático multi-paso (GSM8K: 80% en modo thinking según las evaluaciones del autor).
- Generación de código Python y razonamiento algorítmico (HumanEval/LiveCodeBench: 40% en modo thinking, 70% en modo directo).
- Visión multimodal: pipeline image-text-to-text gracias al codificador SigLIP y al proyector `mmproj-Mercury-1.7B-f16.gguf`.
- Tool calling / function calling estructurado (BFCL v4: 97%).
- Capacidades agénticas y de razonamiento multi-paso mediante el modo thinking con etiquetas `<think>`.
- Seguimiento de instrucciones complejas y restricciones de sistema (IFEval: 72,5% thinking / 74,2% instant).
- Compatibilidad con servidores OpenAI-compatible para integración con Open-WebUI, LibreChat, Continue.dev y LangChain.

## Casos de uso

- **Asistentes locales en hardware de consumo**: con la cuantización Q4_K_M (1,10 GB, ~2-4 GB de VRAM) puede ejecutarse en portátiles y GPUs de gama media como la RTX 3060, sirviendo como asistente conversacional privado sin depender de la nube.
- **Chatbots en ruso e inglés**: su entrenamiento bilingüe (ru/en) lo hace adecuado para atención al cliente o soporte en ambos idiomas, servido vía `llama-server` con API compatible con OpenAI e integrable en Open-WebUI o LibreChat.
- **Agentes con tool calling**: con un 97% en BFCL v4, puede integrarse en pipelines agénticos (LangChain, frameworks de orquestación) que requieren llamadas a funciones fiables y bajo coste computacional por token.
- **Generación y autocompletado de código en el editor**: su tamaño reducido y alta velocidad (180-200 t/s en RTX 3060) lo hacen idóneo como backend de Continue.dev para sugerencias de código en Python en tiempo casi real.
- **Resolución de problemas matemáticos paso a paso**: el modo thinking con prefill de `<think>` permite trazas de razonamiento explícitas para educación, verificación de soluciones o tutoría en matemáticas (80% en GSM8K en modo thinking).
- **Descripción y análisis de imágenes**: gracias al codificador SigLIP y al proyector mmproj incluido en el repositorio, puede responder preguntas sobre imágenes en flujos multimodales locales (pipeline image-text-to-text).
- **Prototipado rápido de aplicaciones LLM**: el `Modelfile` oficial permite registrarlo en Ollama con un solo comando, facilitando pruebas locales antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor del modelo, evaluados de forma manual e independiente en un entorno local idéntico para el modelo base y el fine-tuning (no son cifras oficiales de Liquid AI):

| Benchmark | Modo | Base (LFM3-VL-2B) | Mercury-1.7B | Delta |
|---|---|---|---|---|
| HumanEval / LiveCodeBench | Thinking | 25,0% | 40,0% | +15,0% |
| HumanEval / LiveCodeBench | Instant | 65,0% | 70,0% | +5,0% |
| GSM8K | Thinking | 75,0% | 80,0% | +5,0% |
| IFEval | Thinking | 70,0% | 72,5% | +2,5% |
| BFCL v4 (tool use) | Thinking / Instant | 97,0% | 97,0% | Paridad |
| IFEval | Instant | 75,0% | 74,2% | Paridad (~74%) |
| Claw-Eval general | Instant | 91,7% | 91,7% | Paridad (>90%) |

En cuanto a velocidad de inferencia, el autor reporta ~180-200 tokens/segundo con Q4_K_M en una NVIDIA RTX 3060 usando una compilación de llama.cpp con soporte del kernel SSM de tamaño 7.

## Requisitos de hardware

- **Q4_K_M** (1,10 GB): ~2-4 GB de VRAM; recomendada como opción equilibrada. Cabe sobradamente en GPUs de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en GPUs integradas o CPU con RAM suficiente.
- **Q5_K_M** (1,26 GB): ~4 GB de VRAM; recomendada para matemáticas, código y function calling con mayor precisión.
- **Q8_0** (1,85 GB): ~6 GB de VRAM; referencia de precisión de 8 bits casi sin pérdida.
- **F16** (3,47 GB, más 378 MB del mmproj): 8 GB o más de VRAM; máster sin comprimir en 16 bits.
- **GPU recomendadas**: cualquier GPU moderna; el autor documenta rendimiento en NVIDIA RTX 3060 (~180-200 t/s con Q4_K_M). No se publican cifras para A100/H100; no disponible.
- **Despliegue**: llama.cpp (CLI y `llama-server` con endpoint OpenAI-compatible en `/v1/chat/completions`), Ollama mediante el `Modelfile` incluido, e integración con Open-WebUI, LibreChat, Continue.dev y LangChain. No se menciona soporte para vLLM o TGI; no disponible.
- **Requisito técnico importante**: la compilación de llama.cpp debe incluir soporte del kernel de convolución SSM de tamaño 7 (`ggml-cuda/ssm-conv.cu`) y los operadores nativos LFM2/LFM3 (`models/lfm2.cpp`); las builds legacy solo soportan kernels 3, 4, 5, 9 y 15.
- **Latencia y throughput**: ~180-200 tokens/segundo en RTX 3060 con Q4_K_M y `-ngl 99`; no disponible para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Mercury-1.7B (rrchat) | ~1,73B | LFM3 híbrido (atención lineal + SSM) | Sí (SigLIP) | Apache 2.0 | GGUF / safetensors |
| LiquidAI/LFM3-VL-2B (base) | ~2B | LFM3 híbrido + SigLIP | Sí | Apache 2.0 (según model card del repo base) | safetensors |
| Qwen2.5-VL-3B-Instruct (referencia de categoria) | ~3B | Transformer denso + ViT | Sí | Qwen (uso comercial con restricciones) | safetensors / GGUF |

Comparado con su modelo base, Mercury-1.7B mejora la generación de código en modo thinking (+15 puntos) y las matemáticas (+5 puntos en GSM8K) manteniendo la paridad en tool calling e instrucciones. Frente a alternativas transformer densas de tamaño similar como Qwen2.5-VL-3B, la ventaja teórica de la arquitectura LFM3 es el throughput en inferencia y la huella de memoria constante de las capas convolucionales, aunque no hay benchmarks comparativos directos publicados en la información disponible.

## Limitaciones y advertencias

- **Idiomas**: el modelo está orientado a ruso e inglés; no hay garantías de rendimiento en castellano u otros idiomas.
- **Benchmarks no oficiales**: todas las cifras proceden de evaluaciones manuales del autor en entornos locales, no de Liquid AI; pueden diferir de las cifras oficiales y no son auditadas de forma independiente.
- **Rendimiento en código modesto en modo thinking**: 40% en HumanEval/LiveCodeBench está por debajo de modelos líderes; para código exigente conviene usar el modo instantáneo (70%) o contrastar resultados.
- **Compatibilidad de llama.cpp**: requiere compilaciones con soporte del kernel SSM k=7 y operadores LFM2/LFM3; las builds estándar antiguas no funcionarán correctamente.
- **Contexto**: la longitud de contexto no está documentada; los ejemplos usan 8192 tokens, pero no hay confirmación del máximo soportado.
- **Alucinaciones**: como todo modelo de ~1,7B parámetros, el riesgo de alucinación en tareas de conocimiento factual es alto; no hay evaluaciones de veracidad publicadas.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar también los términos del modelo base de Liquid AI y los datos de entrenamiento del fine-tuning, que no están documentados.
- **Procedencia comunitaria**: se trata de un fine-tuning de un usuario individual (rrchat) sin auditoría de seguridad ni de datos; para producción se recomienda evaluación propia y verificación de integridad de los ficheros con el `SHA256SUMS` proporcionado.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/rrchat/Mercury-1.7B-GGUF
- Modelo completo sin cuantizar (safetensors): https://huggingface.co/rrchat/Mercury-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Paper, blog oficial o demos: no disponible
