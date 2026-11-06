# miceworks/Mark-General-V3-1.5B

## Resumen

Mark-General-V3-1.5B es un checkpoint publicado por el usuario miceworks en Hugging Face bajo el identificador `miceworks/Mark-General-V3-1.5B`. A pesar del nombre y de las etiquetas de tipo conversacional, la propia model card lo describe explicitamente como un "Architectural Base / Untrained", es decir, una inicializacion de pesos sin entrenamiento: un esqueleto de arquitectura listo para pre-entrenamiento o fine-tuning, no un modelo utilizable para inferencia de calidad. Esta distincion es critica para cualquier evaluacion.

Tecnicamente se trata de un transformer con arquitectura `deepseek2` (DeepSeek-V2/V3-style), con atencion Multi-Head Latent Attention (MLA) y capas de mezcla de expertos (MoE) de 32 expertos enrutados y 2 compartidos, con 4 expertos activos por token. El modelo tiene 1.520.496.960 parametros fisicos totales y 405.729.600 parametros activos por token, con 18 capas, dimension oculta de 1280 y una ventana de contexto de 32768 tokens.

Su relevancia es limitada: no hay evidencia de entrenamiento, no se han publicado benchmarks, no hay licencia declarada y el repositorio no tiene descargas ni likes. El unico artefacto disponible es un GGUF cuantizado en `IQ4_NL` de 816 MB, util como plantilla de arquitectura o para experimentar con el pipeline de despliegue, pero no como modelo de lenguaje funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `deepseek2` (transformer con MLA y MoE) |
| Parametros totales | 1.520.496.960 (1,52B) |
| Parametros activos | 405.729.600 (405,73M) por token |
| Longitud de contexto | 32768 tokens |
| Tipos de cuantizacion | `IQ4_NL` (4 bits no lineal, normas y sesgos en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`mark_general_v3_1_5b_iq4_nl.gguf`, 816,03 MB) |
| Dimension oculta | 1280 |
| Capas del transformer | 18 |
| Cabeceras de atencion (query) | 20 |
| MLA `q_lora_rank` / `kv_lora_rank` | 512 / 256 |
| Expertos enrutados / compartidos | 32 / 2 |
| Expertos activos por token | 4 |
| Tamano intermedio MoE | 576 |
| Tamano de vocabulario | 32032 |
| Tensores totales | 327 (236 IQ4_NL, 91 FP32) |
| Estado de entrenamiento | Base arquitectonica sin entrenar (inicializacion He/Xavier + Hadamard Fusion) |
| SHA-256 del GGUF | `7677ebd44467eecba594c2f41e8a9031590c3fdbb692089011eee7578c87c55f` |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno `deepseek2`: un transformer decoder-only con Multi-Head Latent Attention (MLA), que comprime las proyecciones de query y clave-valor en espacios latentes de baja dimension (`q_lora_rank=512`, `kv_lora_rank=256`) para reducir el coste de memoria del KV cache en contexto largo. Sobre esa base se anaden capas MoE con 32 expertos enrutados y 2 compartidos, activando 4 expertos por token, lo que da una relacion de parametros activos sobre totales de aproximadamente 26,7 % (405,73M sobre 1,52B). El tamano intermedio de cada experto es 576, con 18 capas y dimension oculta 1280.

No hay informacion sobre datos de entrenamiento: la model card indica explicitamente "Untrained / Weight Initialization via He/Xavier + Hadamard Fusion", sin numero de tokens, composicion del dataset, RLHF, DPO ni ninguna fase de ajuste. La unica innovacion tecnica documentada es el esquema de cuantizacion `IQ4_NL`: matrices lineales 2D y tensores MoE 3D empaquetados en bloques de 18 bytes por cada 32 pesos (escala FP16 de 2 bytes mas 16 bytes indexando la tabla no lineal `kvalues_iq4nl`), mientras que las normas y el sesgo del router se conservan en FP32.

## Capacidades

- No hay capacidades funcionales demostradas: el modelo no ha sido entrenado, por lo que no genera texto coherente, no razona, no escribe codigo ni resuelve matematicas.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingue (idiomas no disponibles).
- No se ha documentado modo thinking, vision ni audio. La plantilla de Ollama incluida en la model card sugiere un formato ChatML con bloque `<think>`, pero es solo una plantilla de prompt, no una capacidad verificada.
- Como base arquitectonica, su utilidad es estructural: sirve como punto de partida para pre-entrenamiento o fine-tuning y como referencia de implementacion de MLA + MoE en formato GGUF.

## Casos de uso

- Pre-entrenamiento desde cero: el checkpoint esta pensado explicitamente como base sin entrenar; se puede continuar el pre-entrenamiento sobre un corpus propio partiendo de la inicializacion He/Xavier + Hadamard Fusion documentada.
- Fine-tuning supervisado experimental: util para validar pipelines de SFT sobre una arquitectura MoE con MLA antes de invertir en un modelo mayor.
- Pruebas de infraestructura de despliegue: el GGUF de 816 MB permite verificar integraciones con llama.cpp, llama-server (API compatible con OpenAI) y Ollama sin consumir recursos significativos.
- Benchmarking de cuantizacion: al conservar normas y sesgos en FP32 y pesos en `IQ4_NL`, sirve para medir el impacto de la cuantizacion no lineal en calidad y velocidad frente a FP16.
- Investigacion sobre eficiencia de MoE: con 4 de 32 expertos activos por token, es un banco de pruebas de bajo coste para estudiar enrutamiento, balanceo de carga y memoria del KV cache con MLA.
- Educacion y divulgacion: permite inspeccionar la estructura interna de un transformer `deepseek2` (327 tensores, 18 capas) en un fichero manejable, util para articulos o cursos sobre arquitecturas MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo sin entrenar, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido y no se han reportado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con el GGUF `IQ4_NL` de 816 MB; en torno a 3 GB en FP16 (1,52B parametros a 2 bytes por peso).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o superior sobra ampliamente. Tambien cabe en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, e incluso en iGPU y en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (via `Modelfile`), llama-cpp-python. No hay informacion sobre soporte en vLLM o TGI para este artefacto.
- Latencia y throughput estimados: no disponibles. Con 405,73M parametros activos por token, el coste computacional por token es bajo, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Estado | Licencia |
|---|---|---|---|---|---|
| Mark-General-V3-1.5B | 1,52B | 405,73M | 32768 | Sin entrenar | no disponible |
| DeepSeek-V2-Lite | 15,7B (no confirmado en la informacion) | no disponible | no disponible | Entrenado | no disponible |
| TinyLlama-1.1B | 1,1B (no confirmado) | denso | no disponible | Entrenado | no disponible |

La comparacion con alternativas de la misma categoria no esta disponible con datos verificables en la informacion proporcionada. La unica referencia estructural es la familia DeepSeek-V2/V3, de la que hereda el identificador de arquitectura `deepseek2`, pero no se dispone de cifras de rendimiento comparables.

## Limitaciones y advertencias

- El modelo no esta entrenado: no produce salidas utiles y no debe desplegarse en produccion como asistente conversacional.
- No hay licencia declarada, lo que impide determinar si el uso comercial esta permitido; en la practica, la ausencia de licencia es un bloqueo legal para uso comercial.
- No hay informacion sobre sesgos, porque no hay datos de entrenamiento ni evaluaciones.
- Riesgo de alucinacion: total, al no existir un modelo de lenguaje entrenado detras.
- No se ha documentado cobertura idiomatica ni calidad en castellano.
- El nombre y las etiquetas ("conversational", "endpoints_compatible") pueden inducir a error sobre la madurez del artefacto; conviene tratarlo como base arquitectonica.
- Repositorio sin descargas ni likes y con fecha de creacion futura respecto a la fecha actual, lo que anade incertidumbre sobre su mantenimiento y procedencia.
- El GGUF esta cuantizado en `IQ4_NL`; si se pretende fine-tuning, sera necesario partir de pesos en mayor precision, no disponibles en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/miceworks/Mark-General-V3-1.5B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
