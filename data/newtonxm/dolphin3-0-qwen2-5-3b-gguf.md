# newtonxm/Dolphin3.0-Qwen2.5-3b-GGUF

## Resumen

Dolphin3.0-Qwen2.5-3b-GGUF es la versión cuantizada en formato GGUF del modelo Dolphin3.0-Qwen2.5-3b, desarrollado por Cognitive Computations a partir de Qwen2.5-3B de Alibaba. Esta ficha concreta corresponde al repositorio publicado por el usuario newtonxm, que redistribuye cuantizaciones generadas con llama.cpp (release b4418) empleando el método imatrix. El modelo base cuenta con 3.085.938.688 parámetros y está pensado para generación de texto conversacional en inglés.

El modelo resuelve el problema de ejecutar un modelo de 3B parámetros afinado para instrucciones, código y matemáticas en hardware de consumo, sin necesidad de GPU dedicada. Al estar en formato GGUF, es compatible con llama.cpp, LM Studio, Ollama y otros runners basados en GGML, lo que permite desplegarlo en CPU, Apple Silicon o GPUs modestas.

Su relevancia actual radica en la combinación de un tamaño reducido (3B), un conjunto de datos de ajuste supervisado amplio y variado (Orca, Tulu 3, NuminaMath, Hermes function calling, entre otros) y una licencia de investigación Qwen que limita el uso comercial. Es una opción práctica para prototipado local y experimentación con agentes y tool calling en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-3B) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | f32, f16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, Q4_0, IQ4_NL, Q3_K_XL, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, Q3_K_S (y variantes inferiores) |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (license_name), etiquetada como "other" en Hugging Face |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 3.085.938.688 parámetros, heredado de la arquitectura Qwen2.5-3B. Sobre esa base, Cognitive Computations aplicó un ajuste supervisado (SFT) utilizando una mezcla de datasets orientados a instrucciones, código, matemáticas y function calling. Entre los conjuntos de datos declarados figuran OpenCoder-LLM/opc-sft-stage1 y stage2, microsoft/orca-agentinstruct-1M-v1, microsoft/orca-math-word-problems-200k, NousResearch/hermes-function-calling-v1, AI-MO/NuminaMath-CoT, AI-MO/NuminaMath-TIR, allenai/tulu-3-sft-mixture, cognitivecomputations/dolphin-coder, HuggingFaceTB/smoltalk, cognitivecomputations/samantha-data, m-a-p/CodeFeedback-Filtered-Instruction y m-a-p/Code-Feedback.

La versión GGUF que nos ocupa fue cuantizada por bartowski (según la model card) con llama.cpp b4418 y la opción imatrix, empleando un dataset de calibración publicado en un gist del propio autor. El repositorio de newtonxm redistribuye esas cuantizaciones. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta de la mezcla ni si hubo fases de RLHF o DPO posteriores al SFT.

## Capacidades

- Generación de texto conversacional multi-turno con formato ChatML (`<|im_start|>` / `<|im_end|>`).
- Razonamiento y resolución de problemas matemáticos, apoyado por los datasets NuminaMath-CoT y NuminaMath-TIR.
- Generación y edición de código, con datos de OpenCoder, dolphin-coder y CodeFeedback.
- Soporte de tool calling / function calling, entrenado con hermes-function-calling-v1 y orca-agentinstruct.
- Capacidad de seguir instrucciones complejas y agentes multi-paso, gracias a orca-agentinstruct-1M-v1.
- Conversación general y asistencia, apoyada por smoltalk y samantha-data.
- Capacidades multilingües limitadas: la model card declara únicamente inglés.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Asistente conversacional local: desplegado con llama.cpp u Ollama en un portátil o mini-PC, el modelo puede mantener diálogos multi-turno en inglés con un consumo de VRAM/RAM reducido (a partir de ~1,8 GB en Q4_K_S).
- Generación de código en entornos con recursos limitados: integrado en editores o scripts CLI mediante llama.cpp, puede autocompletar funciones, explicar fragmentos y generar tests, aprovechando el ajuste sobre OpenCoder y CodeFeedback.
- Automatización de tareas con tool calling: al estar entrenado con hermes-function-calling-v1, puede emitir llamadas a funciones en formato JSON para orquestar APIs en prototipos de agentes.
- Resolución de problemas matemáticos paso a paso: útil en herramientas educativas o de verificación, apoyándose en el entrenamiento con NuminaMath-CoT y NuminaMath-TIR.
- Prototipado de agentes multi-paso: con orca-agentinstruct en el dataset, puede encadenar razonamiento y acciones en flujos de automatización sencillos antes de migrar a modelos mayores.
- Clasificación y extracción de información en inglés: tareas de resumen, etiquetado y extracción estructurada en pipelines por lotes ejecutados en CPU.
- Evaluación comparativa de cuantizaciones: el amplio abanico de quants (desde f32 hasta Q3_K_S) permite medir el impacto de la cuantización en calidad para un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: f32 ~12,35 GB; f16 ~6,18 GB; Q8_0 ~3,29 GB; Q6_K ~2,54 GB; Q5_K_M ~2,22 GB; Q4_K_M ~1,93 GB; IQ4_XS ~1,74 GB; Q3_K_M ~1,59 GB; IQ3_M ~1,49 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para cuantizaciones altas o despliegues concurrentes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4-8 GB de VRAM usando Q4_K_M o Q5_K_M; también en Apple Silicon mediante Metal.
- Opciones de despliegue: llama.cpp, LM Studio (recomendado en la model card), Ollama, y runners compatibles con GGUF; para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dolphin3.0-Qwen2.5-3b (este, GGUF) | 3,09 B | no disponible | qwen-research | GGUF | Ajuste SFT amplio con foco en código, matemáticas y tool calling |
| Qwen2.5-3B (base) | 3,09 B | no disponible | qwen-research | safetensors, GGUF | Modelo base sin ajuste Dolphin; referencia de partida |
| Dolphin3.0-Llama3.1-8B | 8 B | no disponible | llama3.1 | safetensors, GGUF | Misma familia Dolphin, mayor tamaño y contexto declarado por Meta |
| Qwen2.5-7B | 7,6 B | no disponible | qwen-research | safetensors, GGUF | Alternativa de mayor tamaño dentro de la misma familia |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial; es necesario revisar los términos del LICENSE de Qwen2.5-3B antes de cualquier despliegue en producción.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a modelos de 3B parámetros, especialmente en tareas de razonamiento largo o matemáticas complejas.
- El ajuste Dolphin prioriza la ausencia de rechazos (uncensored); puede generar contenido sensible si no se aplican filtros externos.
- La longitud de contexto no se especifica en la información disponible; conviene verificar la configuración del modelo base Qwen2.5-3B antes de usarlo con prompts largos.
- Las cuantizaciones de baja precisión (Q3_K_S, IQ3_M) degradan la calidad; para producción se recomienda Q5_K_M o superior.
- El repositorio de newtonxm tiene 0 descargas y 0 likes en el momento de la consulta; se trata de una redistribución no oficial de las cuantizaciones de bartowski.
- El tamaño del repositorio (60 GB) incluye todas las cuantizaciones; conviene descargar únicamente el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/newtonxm/Dolphin3.0-Qwen2.5-3b-GGUF
- Modelo base Dolphin3.0-Qwen2.5-3b: https://huggingface.co/cognitivecomputations/Dolphin3.0-Qwen2.5-3b
- Cuantizaciones originales de bartowski: https://huggingface.co/bartowski/Dolphin3.0-Qwen2.5-3b-GGUF
- Modelo Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
- llama.cpp (release b4418): https://github.com/ggerganov/llama.cpp/releases/tag/b4418
- LM Studio: https://lmstudio.ai/
- Dataset de calibración imatrix: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
