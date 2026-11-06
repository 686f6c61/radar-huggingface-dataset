# mohommed/LFM3-1.7B-Frontier-SmartAgent

## Resumen

LFM3-1.7B-Frontier-SmartAgent es un modelo de lenguaje de aproximadamente 1.700 millones de parámetros desarrollado por el usuario mohommed a partir de LiquidAI/LFM3-1.7B de Liquid AI. Está orientado a sistemas agénticos en dispositivo y en el borde (edge), combinando la arquitectura Tri-Híbrida de 24 capas del modelo base (convoluciones cortas con puerta, atención por ventana deslizante y atención global con GQA) con una ventana de contexto ampliada a 512K tokens mediante escalado NTK-YaRN.

El problema que resuelve es la falta de modelos pequeños capaces de razonamiento estructurado, llamada de herramientas verificada y memoria asociativa persistente sin depender de infraestructura en la nube. El modelo razona mediante un protocolo de pensamiento en 4 etapas (`<think>`), audita contexto externo y una memoria persistente tipo "second brain" (inspirada en HippoRAG-2), y emite llamadas a herramientas Python con verificación de firmas y parámetros.

Su post-entrenamiento en dos fases (SFT multi-turno seguido de GRPO con recompensas densas) y su licencia Apache 2.0 lo hacen relevante para desarrolladores que necesitan agentes autónomos ligeros ejecutables localmente con llama.cpp u Ollama. El repositorio pesa 25,4 GB e incluye pesos en safetensors y cuantizaciones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm3ForCausalLM, Tri-Híbrida (Gated ShortConv + Sliding-Window GQA + Global GQA), 24 capas |
| Parametros totales | 1.728.801.536 (~1,73 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 524.288 tokens (512K) mediante NTK-YaRN (factor 2,0, mscale 1,14) |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M (además de BF16/FP16 en safetensors) |
| Idiomas soportados | Inglés (entrenamiento y documentación; otros idiomas no disponibles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16/FP16) y GGUF |

## Arquitectura y entrenamiento

La arquitectura Tri-Híbrida de 24 capas combina tres mecanismos: convoluciones cortas con puerta (shortconv, con caché de kernel L_cache = 7) en las capas tempranas para extracción de características locales, atención por ventana deslizante con GQA y atención global con GQA. La dimensión oculta es de 2048, el FFN SwiGLU de 7680, con 16 cabezas de consulta y 4 cabezas clave-valor. El vocabulario es de 125.050 tokens mediante BPE a nivel de byte. El contexto nativo de 262.144 tokens del modelo base se extiende a 524.288 mediante escalado YaRN calibrado (factor = 2,0, beta_fast = 32,0, beta_slow = 1,0, mscale = 1,14), aplicado tanto a las capas de atención completa como a las de ventana deslizante.

El post-entrenamiento consta de dos etapas. La primera es un SFT multi-turno sobre trayectorias con protocolo `<think>` de 4 etapas y llamadas `<tool_call>`, realizado con LoRA (r = 32, alpha = 64, lr = 1,5e-4, pérdida final 0,089) y con preservación del razonamiento entre turnos (`preserve_thinking = true`). La segunda es GRPO (Group Relative Policy Optimization) con recompensas densas basadas en AST, vinculación de firmas y anclaje al contexto (num_generations = 4, lr = 5e-6), usando la librería TRL. Adicionalmente, el modelo aplica una ortogonalización Gram-Schmidt amortiguada (alpha = 0,60) sobre las proyecciones descendentes del MLP (w2/down_proj) en las capas 9-19, aisladas mediante SVD, dejando intactas las capas 0-8 y 20-23. El dataset de entrenamiento no está detallado en la model card (no disponible).

## Capacidades

- Generacion de texto conversacional con razonamiento estructurado mediante un protocolo obligatorio de 4 etapas dentro de etiquetas `<think>`: auditoría de contexto y memoria, descomposición en DAG de tareas, verificación de alucinaciones y restricciones, y ejecución precisa.
- Llamada a herramientas (tool calling) con emisión de llamadas Python verificadas dentro de `<tool_call>...</tool_call>`, incluyendo validación de firmas de funciones y parámetros.
- Razonamiento multi-paso y agéntico: descomposición de objetivos complejos en grafos acíclicos dirigidos (DAG) de invocaciones atómicas de herramientas.
- Integración con memoria persistente asociativa ("second brain") estilo HippoRAG-2: índice vectorial denso (FAISS IndexFlatIP) con deduplicación MMR y grafo de conocimiento neuro-simbólico (NetworkX con Personalized PageRank) para asociación multi-salto de entidades.
- Anclaje a navegador mediante Playwright con identificadores Set-of-Marks (`[#som_id]`) y síntesis dinámica de habilidades estilo Voyager.
- Gestión de contexto a escala de repositorio (512K tokens), adecuada para indexación de dependencias AST en bases de código grandes.
- Verificación de URLs, rutas de fichero e identificadores contra el contexto activo antes de ejecutar acciones.
- Distribución en formato GGUF compatible con llama.cpp y Ollama, y en safetensors para transformers.

## Casos de uso

- Agentes de investigacion profunda (deep research) en local: el modelo puede descomponer una pregunta de investigación en un DAG de pasos, consultar su memoria asociativa multi-salto y sintetizar resultados con citas verificadas contra el contexto, todo en hardware de consumo.
- Automatizacion de navegador: gracias al anclaje Set-of-Marks con Playwright, puede navegar páginas web identificando elementos por `[#som_id]` y ejecutar flujos multi-paso (relleno de formularios, extracción de datos) sin modelo de visión adicional.
- Asistentes de codigo a escala de repositorio: con 512K tokens de contexto puede indexar dependencias AST de un proyecto completo y responder preguntas sobre la base de código o proponer refactorizaciones con rutas de fichero verificadas.
- Orquestacion de herramientas en pipelines: emite llamadas Python con firmas validadas, lo que permite integrarlo en flujos de automatización (scripts de mantenimiento, consultas a APIs internas) con menor tasa de llamadas malformadas.
- Memoria conversacional persistente: en asistentes de largo plazo, la integración con FAISS y el grafo de conocimiento permite recordar entidades y relaciones de sesiones anteriores sin reinyectar todo el historial.
- Despliegue en edge y dispositivos locales: con ~1,7B de parámetros y cuantización Q4_K_M, cabe en GPUs de consumo o incluso en equipos sin GPU dedicada, manteniendo capacidades agénticas.
- Verificacion y reduccion de alucinaciones en agentes: el paso de comprobación de alucinaciones del protocolo `<think>` (validación de URLs, rutas y parámetros contra el contexto) es útil en entornos donde las acciones erróneas tienen coste operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos; solo se indica la pérdida final del SFT (0,089), que no es comparable entre modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~3,5-4 GB solo de pesos; con contexto largo, la caché KV dominará el consumo y puede requerir sustancialmente más memoria.
- VRAM estimada con GGUF: Q8_0 ~2 GB, Q6_K ~1,5 GB, Q5_K_M ~1,3 GB, Q4_K_M ~1,1 GB (solo pesos, sin caché KV ni overhead de runtime).
- GPUs recomendadas: para contextos grandes (512K), GPUs con 24 GB o más (RTX 3090/4090, A100, H100) debido al tamaño de la caché KV; para contextos moderados, cualquier GPU de 4-8 GB (RTX 3060, RTX 4060) con cuantización Q4/Q5.
- Cabe en GPUs de consumo: sí, con holgura en cuanto a pesos; la limitación práctica será la ventana de contexto efectiva utilizable según la VRAM disponible.
- Opciones de despliegue: transformers (safetensors), llama.cpp y Ollama (GGUF, con imatrix disponible para cuantización). No se menciona soporte explícito de vLLM o TGI (no disponible).
- Latencia y throughput: no disponibles; al ser un modelo de 1,7B con arquitectura híbrida con shortconv, la inferencia debería ser rápida en CPU y GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|---|
| LFM3-1.7B-Frontier-SmartAgent | ~1,73 B | 512K (YaRN) | Tri-Híbrida (shortconv + SWA + GQA) | Apache 2.0 | Agéntico, tool calling, memoria persistente |
| LiquidAI/LFM3-1.7B (base) | ~1,73 B | 262K | Tri-Híbrida (shortconv + SWA + GQA) | Apache 2.0 | Modelo base de uso general |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32K (128K con YaRN) | Transformer denso | Apache 2.0 (Qwen research license en algunas versiones) | Chat y código de uso general |
| Phi-3.5-mini (3.8B) | ~3,8 B | 128K | Transformer denso | MIT | Razonamiento y código |

Frente al modelo base, esta variante añade contexto duplicado (512K frente a 262K), protocolo de razonamiento estructurado, tool calling verificado y adaptación agéntica, a costa de ser un fine-tune comunitario sin validación de benchmarks públicos. Frente a Qwen2.5-1.5B o Phi-3.5-mini, ofrece un contexto mucho mayor y capacidades agénticas especializadas, aunque sin datos publicados que permitan comparar calidad de razonamiento o código.

## Limitaciones y advertencias

- Es un fine-tune comunitario (autor mohommed), no un modelo oficial de Liquid AI: no hay benchmarks públicos que validen las capacidades agénticas declaradas, por lo que conviene evaluarlo antes de uso en producción.
- Idioma: entrenado y documentado en inglés; el rendimiento en castellano u otros idiomas no está documentado (no disponible).
- Riesgo de alucinacion: aunque el protocolo de 4 etapas incluye una fase de verificación, un modelo de 1,7B tiene capacidad limitada de razonamiento y puede generar URLs, rutas o parámetros incorrectos; el paso de auditoría es una mitigación, no una garantía.
- Contexto: los 512K tokens requieren caché KV proporcionalmente grande; en hardware de consumo la ventana efectiva utilizable será menor. El escalado YaRN a 2x puede degradar la calidad en posiciones extremas del contexto.
- La ortogonalización Gram-Schmidt sobre capas 9-19 modifica los pesos del modelo base; su impacto en la estabilidad de las convoluciones cortas y la perplejidad no está cuantificado públicamente.
- Sesgos conocidos: no disponible; hereda potencialmente los sesgos del modelo base y de sus datos de entrenamiento, que no están detallados en la model card.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base LiquidAI/LFM3-1.7B para condiciones adicionales.
- El uso del protocolo `<think>` y las etiquetas XML (`<context>`, `<second_brain>`, `<tool_call>`) requiere adaptar los prompts y el parser del sistema de agentes al formato específico del modelo; no es directamente intercambiable con otros formatos de tool calling.

## Enlaces

- Modelo principal (Hugging Face): https://huggingface.co/mohommed/LFM3-1.7B-Frontier-SmartAgent
- Repositorio GGUF (cuantizaciones Q8_0, Q6_K, Q5_K_M, Q4_K_M): https://huggingface.co/mohommed/LFM3-1.7B-Frontier-SmartAgent-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
