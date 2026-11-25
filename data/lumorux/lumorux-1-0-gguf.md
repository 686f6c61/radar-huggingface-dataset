# Lumorux/lumorux-1.0-GGUF

## Resumen
Lumorux 1.0 es un ajuste fino del modelo Qwen2.5-Coder-7B-Instruct de Alibaba, desarrollado por el usuario independiente Lumorux y publicado en formato GGUF cuantizado en Q4_K_M. El modelo parte de la arquitectura transformer decoder-only de Qwen2.5 (7.6 mil millones de parámetros) y se especializa en generación de código, desarrollo web y scripting para gráficos 3D, cubriendo dominios como Blender (API `bpy`), Three.js/WebGL y shaders GLSL. El ajuste se realizó mediante QLoRA con rango 64 y alpha 128 sobre un dataset curado multi-dominio, entrenado en una única GPU RTX 5090 durante aproximadamente 6 horas.

La relevancia de este modelo radica en su enfoque vertical: en lugar de competir como asistente generalista, apunta a flujos de trabajo técnicos concretos donde los artistas 3D y desarrolladores web necesitan asistencia local y de bajo consumo de VRAM. Al distribuirse únicamente como GGUF Q4_K_M (~4.7-5.0 GB), puede ejecutarse en GPUs de consumo medio o en Apple Silicon mediante `llama.cpp` u Ollama, sin necesidad de infraestructura de servidor.

No obstante, se trata de un modelo con descargas muy limitadas (126 en el momento de la consulta) y sin validación externa publicada, por lo que debe evaluarse con cautela antes de usarlo en producción. La longitud de contexto declarada es de 4096 tokens, muy por debajo de la ventana nativa de 32K del modelo base, lo que restringe su uso a fragmentos de código y no a comprensión de repositorios completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 For Causal LM (transformer decoder-only) |
| Parametros totales | 7.615.616.512 (~7.6 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (declarada en la model card) |
| Tipos de cuantizacion | Q4_K_M en GGUF (unica version publicada) |
| Idiomas soportados | Ingles (segun metadatos y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `lumorux-1.0-Q4_K_M.gguf`, ~4.7-5.0 GB) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura Qwen2.5, un transformer decoder-only con atención por causalidad estándar, normalización RMSNorm y capas de atención con RoPE. Sobre la base `Qwen/Qwen2.5-Coder-7B-Instruct` se aplicó un ajuste QLoRA con cuantización NF4 de 4 bits, rango 64, alpha 128 y dropout 0.05, dejando aproximadamente 1.2 B de parámetros entrenables en los adaptadores, que posteriormente se fusionaron en los pesos base en BF16 antes de la conversión a GGUF. El entrenamiento se realizó con LLaMA-Factory, PEFT y bitsandbytes sobre una única RTX 5090 de 32 GB, con una secuencia de 4096 tokens, batch 4 y acumulación de gradiente 4, durante una época (~6 horas).

El dataset de ajuste es curado y multi-dominio, según declara el autor: lenguajes generales (Python, JavaScript/TypeScript, C/C++, Rust, Go, SQL), desarrollo web (HTML/CSS, React, Next.js, Tailwind, APIs REST/GraphQL), desarrollo de aplicaciones (React Native, Electron/Tauri, herramientas CLI), Blender (API `bpy`, rigging, modificadores, composición por nodos, exportación) y Three.js/WebGL (grafos de escena, shaders GLSL, animación, post-procesado). No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo etapas de RLHF o DPO adicionales más allá del ajuste supervisado. La innovación técnica es modesta: se trata de un ajuste de dominio sobre un modelo ya existente, sin cambios arquitectónicos ni técnicas de decodificación especulativa.

## Capacidades
- Generación de código en Python, JavaScript/TypeScript, C/C++, Rust, Go y SQL.
- Desarrollo web front-end y back-end: HTML/CSS, React, Next.js, Tailwind, APIs REST y GraphQL.
- Scripting para Blender mediante la API `bpy`: modelado procedural, rigging, modificadores, composición por nodos y pipelines de exportación.
- Creación de escenas Three.js y WebGL, incluyendo shaders GLSL, animación, post-procesado y optimización de rendimiento.
- Scaffolding de aplicaciones móviles (React Native) y de escritorio (Electron/Tauri), además de herramientas CLI.
- Explicación y depuración de código en los dominios anteriores.
- Conversación multi-turno con rol de sistema configurable (formato chat de Qwen2.5).
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card, aunque el modelo base Qwen2.5-Coder-Instruct lo soporta de forma nativa.
- Capacidades multilingües: limitadas al inglés según los metadatos; no se declara soporte de castellano.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso
- Generación de scripts de Blender para artistas 3D: el modelo puede producir código `bpy` para crear modificadores, configurar rigs o automatizar exportaciones a GLB, aprovechando el ajuste específico sobre la API de Blender y su contexto de 4096 tokens suficiente para scripts de complejidad media.
- Creación de escenas Three.js con shaders personalizados: útil para prototipar rápidamente escenas WebGL con post-procesado o animaciones, ya que el modelo ha sido entrenado con ejemplos de GLSL y grafos de escena.
- Scaffolding de aplicaciones web full-stack: generación de componentes React/Next.js con Tailwind y esqueletos de API REST o GraphQL, adecuado para arrancar proyectos en local sobre una GPU de consumo.
- Asistencia de codificación en local para desarrolladores con hardware limitado: al ocupar ~4.7-5.0 GB en Q4_K_M y requerir ~5.5-6.5 GB con KV cache, puede ejecutarse en GPUs de 8 GB o en Apple Silicon mediante Ollama, sin enviar código a servicios externos.
- Depuración y explicación de fragmentos de código: el modelo puede analizar errores en archivos individuales o funciones, aunque no es apto para comprensión de repositorios completos por su ventana de 4K tokens.
- Generación de herramientas CLI y scripts de automatización en Python, Rust o Go para pipelines internos de estudio o equipo.
- Servidor compatible con la API de OpenAI: mediante `llama-server` puede exponerse como endpoint para integrarse en editores o asistentes que consuman la interfaz OpenAI, facilitando su incorporación en flujos existentes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: ~4.7-5.0 GB para los pesos Q4_K_M; el autor recomienda ~5.5-6.5 GB considerando KV cache a 4096 tokens.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100, H100. Cabe holgadamente en GPUs de 8 GB con contexto reducido.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM; también en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: `llama.cpp` (CLI y servidor con API compatible OpenAI), Ollama mediante Modelfile, y cualquier runtime que soporte GGUF (por ejemplo, LM Studio o KoboldCpp). No se distribuyen pesos en safetensors ni versiones para vLLM o TGI.
- Latencia y throughput: no disponibles; el autor solo indica que Q4_K_M es aproximadamente 3 veces más pequeño y más rápido en generación que BF16, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lumorux 1.0 Q4_K_M | 7.6 B | 4096 tokens | Apache 2.0 | GGUF Q4_K_M | Ajuste QLoRA especializado en código y 3D; sin benchmarks publicados |
| Qwen2.5-Coder-7B-Instruct | 7.6 B | 32 768 tokens (nativo) | Apache 2.0 | safetensors, GGUF | Modelo base; más contexto y validación amplia de la comunidad |
| DeepSeek-Coder-V2-Lite-Instruct | 16 B (2.4 B activos, MoE) | 128 000 tokens | Licencia propia (uso comercial permitido con condiciones) | safetensors, GGUF | Mayor contexto y rendimiento en código, pero requiere más VRAM |
| CodeLlama-7B-Instruct | 7 B | 16 384 tokens | Llama 2 Community License | safetensors, GGUF | Alternativa de Meta con contexto mayor, pero sin especialización en 3D |

## Limitaciones y advertencias
- No es un chatbot generalista: el autor lo restringe explícitamente a tareas técnicas y creativas de código.
- Riesgo de alucinación de firmas de API para versiones de librerías posteriores al corte de entrenamiento; conviene verificar el código generado contra la documentación oficial.
- La cuantización Q4_K_M introduce pérdida de precisión en código denso y matemáticas sutiles de shaders; para tareas críticas puede ser preferible el modelo base en BF16.
- Contexto efectivo de solo 4096 tokens: no apto para comprensión de repositorios completos ni para conversaciones muy largas.
- Idioma: solo inglés declarado; no se garantiza calidad en castellano ni en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-Coder conviene revisar también las condiciones del modelo base y de los datos de entrenamiento, que el autor no detalla.
- Sin benchmarks publicados ni validación independiente; las 126 descargas y 0 likes indican adopción muy baja, por lo que la calidad del ajuste no está contrastada por la comunidad.
- Entrenamiento en una sola GPU y una sola época: posible sobreajuste al dataset curado y cobertura limitada de casos边缘.
- El repositorio solo publica la versión Q4_K_M; no hay pesos en safetensors ni otras cuantizaciones (Q5, Q8, etc.) para elegir el equilibrio precisión/tamaño.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Lumorux/lumorux-1.0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- PEFT: https://github.com/huggingface/peft
- bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Ollama: https://ollama.com
