# NEXIPi/Zentrix-3B

## Resumen

Zentrix-3B es un modelo de generacion de texto en ingles desarrollado por NEXIPi, obtenido mediante fine-tuning del modelo Qwen2.5-Coder-3B-Instruct en su version cuantizada a 4 bits publicada por Unsloth. Se trata, por tanto, de un ajuste fino de un modelo base ya orientado a codigo e instrucciones, no de un modelo entrenado desde cero. El repositorio tiene 3.085.938.688 parametros (aproximadamente 3,09 mil millones) y un tamano de 6,2 GB, coherente con pesos en safetensors derivados de una base cuantizada en bnb-4bit.

El modelo se distribuye bajo licencia Apache 2.0 y usa la libreria transformers, con pipeline de text-generation. La model card es minima: no documenta dataset de entrenamiento, numero de tokens, hiperparametros, ni resultados de evaluacion. El autor indica unicamente que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que sugiere un fine-tuning eficiente en memoria sobre GPU de consumo.

Por su origen (Qwen2.5-Coder-3B-Instruct), el modelo hereda la arquitectura transformer decoder-only de Qwen2 con atencion causal, RoPE y ventana de contexto de 32.768 tokens nativos (extensible a 131.072 en la familia Qwen2.5). Es relevante como ejemplo de fine-tuning ligero de un coder pequeno para tareas conversacionales, aunque su falta de documentacion limita su uso en produccion sin evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), atencion causal con RoPE |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el base Qwen2.5-Coder-3B-Instruct soporta 32.768 tokens nativos (131.072 con YaRN) |
| Tipos de cuantizacion | base entrenada en bnb-4bit; pesos publicados en safetensors (cuantizacion adicional no documentada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit`, que a su vez es una version cuantizada a 4 bits (bitsandbytes) del Qwen2.5-Coder-3B-Instruct original de Alibaba. La arquitectura subyacente es un transformer decoder-only de la familia Qwen2, con 3,09 B parametros, atencion causal multi-cabeza con RoPE, normalizacion RMSNorm y embeddings de tokens compartidos con la cabeza de salida. El contexto nativo del base es de 32.768 tokens, ampliable a 131.072 mediante YaRN.

No se documentan en la model card ni el dataset de fine-tuning, ni el numero de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF/DPO. El unico dato tecnico es que el entrenamiento se realizo con Unsloth y TRL, lo que implica un pipeline de fine-tuning supervisado (SFT) con optimizaciones de memoria (LoRA/QLoRA probablemente, dado el origen bnb-4bit). No hay innovaciones tecnicas destacables documentadas (sin decodificacion especulativa, atencion linear ni modo thinking).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del base Qwen2.5-Coder-3B-Instruct.
- Generacion y edicion de codigo en multiples lenguajes, dado el origen coder del modelo base.
- Razonamiento basico multi-paso y respuesta a instrucciones (instruction following).
- Soporte de tool calling / function calling: no documentado en la model card, aunque el base Qwen2.5-Coder-Instruct lo soporta de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado; probable por herencia del base.
- Capacidades multilingues: limitadas a ingles segun la model card (el base Qwen2.5 soporta oficialmente 29 idiomas, pero el fine-tuning declara solo en).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente de codigo en IDE: el modelo puede autocompletar y explicar fragmentos de codigo en ingles gracias a su herencia de Qwen2.5-Coder, integrable via transformers en plugins de editores como VS Code o Neovim.
- Generacion de tests unitarios: dado su origen coder, puede producir casos de prueba a partir de firmas de funciones, util en pipelines de CI/CD para aumentar cobertura.
- Chatbot tecnico de soporte: puede gestionar conversaciones multi-turno sobre documentacion de APIs y errores de compilacion, con contexto de hasta 32.768 tokens (segun el base).
- Prototipado rapido en entornos con poca VRAM: sus ~3 B parametros permiten ejecucion en GPU de consumo (8-12 GB) con cuantizaciones GGUF, ideal para demos locales.
- Refactorizacion asistida de codigo legacy: el modelo puede proponer reescrituras y explicar cambios, aunque requiere validacion humana por riesgo de alucinacion.
- Fine-tuning como base para dominios especializados: al ser un checkpoint pequeno y Apache 2.0, sirve como punto de partida para ajustes adicionales en jerga tecnica concreta.
- Generacion de documentacion tecnica en ingles: puede redactar docstrings y READMEs a partir de codigo fuente, aprovechando su entrenamiento coder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~6,2 GB de pesos mas overhead de activaciones, en torno a 8-10 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M): ~2,5-3 GB, con overhead total en torno a 4-5 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para FP16; A100/H100 no necesarias pero validas para despliegue multi-usuario.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB o superior en FP16, y en GPUs de 6-8 GB con cuantizacion 4 bits.
- Opciones de despliegue: transformers, vLLM, llama.cpp (previa conversion a GGUF), Ollama, TGI (el tag text-generation-inference esta presente).
- Latencia y throughput estimados: no disponibles (sin datos publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zentrix-3B | 3,09 B | no disponible (base 32.768) | Apache 2.0 | Hugging Face | Fine-tuning de Qwen2.5-Coder-3B-Instruct; sin benchmarks |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Hugging Face, Ollama | Modelo base oficial, con benchmarks publicados |
| Llama 3.2 3B Instruct | 3,21 B | 131.072 | Llama 3.2 Community License | Hugging Face, Ollama | Modelo generalista de Meta, no especializado en codigo |
| CodeGemma 2B | 2,5 B | 8.192 | Gemma Terms of Use | Hugging Face | Especializado en codigo, contexto corto |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2.5-Coder-3B-Instruct, hereda los sesgos del dataset de entrenamiento original, no evaluados por el autor.
- Riesgo de alucinacion: elevado en tareas de codigo y hechos, dado el tamano pequeno (3 B) y la ausencia de evaluacion publicada.
- Limitaciones de contexto e idioma: la model card declara solo ingles; el contexto efectivo no esta documentado y depende del base (32.768 tokens nativos).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del base Qwen2.5-Coder y de la version bnb-4bit de Unsloth, ya que la cadena de derivacion puede imponer condiciones adicionales.
- Caveats para produccion: ausencia total de benchmarks, dataset e hiperparametros documentados; el modelo no ha sido validado por terceros y su calidad real es desconocida. El checkpoint deriva de una base cuantizada a 4 bits, lo que puede degradar la precision respecto al original FP16.
- El repositorio registra 0 descargas y 0 likes, sin comunidad ni issues de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NEXIPi/Zentrix-3B
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit
- Modelo original Qwen2.5-Coder-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL: https://github.com/huggingface/trl
