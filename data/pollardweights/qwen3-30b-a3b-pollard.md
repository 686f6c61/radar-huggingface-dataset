# PollardWeights/Qwen3-30B-A3B-Pollard

## Resumen

El modelo **Qwen3-30B-A3B-Pollard** es una cuantización GGUF de precisión mixta del modelo MoE **Qwen/Qwen3-30B-A3B**, desarrollada por el usuario PollardWeights mediante su herramienta **Pollard Weights**. El modelo base es un mixture-of-experts de 30.500 millones de parámetros con 3.300 millones activos por token y 128 expertos, entrenado por Alibaba Qwen para tareas de razonamiento, código, matemáticas y seguimiento de instrucciones, con soporte de contexto largo de hasta 262.000 tokens.

La contribución de PollardWeights consiste en aplicar una política de cuantización selectiva: los tensores de los expertos "fríos" (las capas `ffn_gate/up_exps`) se comprimen a 1 bit con trellis quantization (`IQ1_KT`), mientras que el router, las capas de salida residual, los expertos compartidos y la atención se protegen con cuantizaciones más altas (`IQ2_KT`, `Q6_K`, etc.). El resultado es un archivo de solo **7,02 GB** (frente a los 56,9 GB en f16), una reducción del 88 % que permite ejecutar un modelo de 30B en hardware de consumo.

Esta ficha es relevante porque demuestra que la cuantización mixta basada en la importancia de los tensores puede superar a la cuantización uniforme de 1 bit en métricas de perplejidad y divergencia, manteniendo un tamaño similar. El modelo está pensado para desarrolladores que necesitan desplegar LLMs de gran tamaño en GPUs con poca VRAM sin renunciar por completo a la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Qwen3MoE) con 128 expertos, 3.3B activos |
| Parametros totales | 30.5B |
| Parametros activos | 3.3B |
| Longitud de contexto | 262.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | IQ1_KT (flagship), IQ3_S, IQ4_XS, Q6_K |
| Idiomas soportados | en (declarado en la model card; el modelo base soporta multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (trellis para `*_KT`, K-quants estándar para Q6_K) |

## Arquitectura y entrenamiento

El modelo base **Qwen3-30B-A3B** es un transformer MoE con 128 expertos y activación de 3.3B parámetros por token. Fue entrenado por Qwen con un pipeline que incluye pre-entrenamiento extensivo, fine-tuning supervisado y optimización con RL (probablemente DPO/GRPO), aunque los detalles exactos del entrenamiento no se detallan en la información proporcionada. Soporta modos de razonamiento "thinking" y "non-thinking", así como tool calling y agentes.

La cuantización **Pollard** no es un re-entrenamiento, sino una compresión post-entrenamiento. La técnica asigna diferentes niveles de precisión según el rol de cada tensor en la red:

- **Expertos fríos** (`ffn_gate/up_exps`): cuantizados a `IQ1_KT` (1 bit trellis), ya que su contribución individual es menor.
- **Router** (`ffn_gate_inp`): mantenido en `Q6_K` para preservar la selección de expertos.
- **Escritor residual** (`ffn_down_exps`): `IQ2_KT` para mantener la calidad de la salida.
- **Expertos compartidos**: `IQ2_KT` / `IQ3_KT`.
- **Atención q, output**: `IQ2_KT`; **atención k, v**: `IQ1_KT`.
- **Primeros y últimos bloques**: `IQ2_KT` (protegidos por su importancia en la representación).
- **Embeddings y head de salida**: `Q4_K` / `Q6_K`.

Esta política se basa en la observación de que en un MoE, los expertos individuales contribuyen menos que el router y las capas de salida, por lo que pueden comprimirse más agresivamente. El resultado es un archivo de 7,02 GB con 1,84 bits por peso (bpw), que según las métricas del autor se comporta mejor que una cuantización uniforme de 1 bit.

## Capacidades

- **Generación de texto y razonamiento**: hereda las capacidades del modelo base, incluyendo razonamiento multi-step y modo "thinking" (aunque la cuantización puede degradar ligeramente la calidad).
- **Generación de código**: soporta lenguajes de programación comunes, con capacidad de tool calling para integración en entornos de desarrollo.
- **Matemáticas**: resolución de problemas aritméticos y algebraicos, con precisión razonable para una cuantización de 1 bit.
- **Soporte de tool calling / function calling**: el modelo base lo incluye; la cuantización no lo elimina, aunque la fiabilidad puede verse afectada en el nivel IQ1_KT.
- **Capacidades multilingües**: el modelo base soporta múltiples idiomas, pero la model card de esta cuantización solo declara inglés. Se recomienda verificar el comportamiento en otros idiomas.
- **Contexto largo**: hasta 262K tokens, aunque en la práctica con cuantización 1-bit la ventana efectiva puede reducirse por degradación de la atención.

## Casos de uso

- **Asistente local en hardware modesto**: con 7,02 GB, el modelo IQ1_KT cabe en una GPU de 8 GB (p. ej., RTX 3060) o en un Mac con 16 GB unificados. Permite ejecutar un asistente conversacional con razonamiento básico sin depender de la nube.
- **Generación de código en entornos de desarrollo**: un desarrollador puede usar el modelo para autocompletar o generar fragmentos de código en una IDE local, con la ventaja de que el archivo GGUF se carga con llama.cpp o ik_llama.cpp y no requiere servicios externos.
- **Prototipado rápido de aplicaciones RAG**: gracias al contexto de 262K, se puede indexar documentación extensa y hacer preguntas sobre ella. La cuantización IQ1_KT es adecuada para pruebas de concepto; para producción se recomienda IQ4_XS o Q6_K.
- **Despliegue en edge / IoT**: el tamaño reducido permite ejecutar el modelo en dispositivos con poca memoria, como routers o mini-PCs, para tareas de clasificación de texto o extracción de entidades.
- **Investigación en cuantización**: el modelo sirve como caso de estudio para comparar políticas de cuantización mixta frente a uniforme, ya que el autor publica métricas detalladas de perplejidad y divergencia.
- **Chatbot de atención al cliente en local**: con el modo conversacional y el repeat-penalty recomendado, se puede montar un bot que gestione consultas frecuentes sin enviar datos a servidores externos, cumpliendo requisitos de privacidad.

## Benchmarks y rendimiento

La model card proporciona métricas de perplejidad (PPL) y divergencia KL en WikiText-2 (contexto 2048, 145 chunks) comparando la cuantización PollardMix con cuantizaciones uniformes:

| Build | PPL | Tamaño | bpw | Mean KLD | Median KLD | top-1 |
|---|---:|---:|---:|---:|---:|---:|
| uniform IQ2_KT (2-bit ceiling) | 7.28 | 8.34 GB | 2.19 | 0.134 | 0.059 | 84.81% |
| **PollardMix (IQ1_KT)** | **8.57** | **7.02 GB** | **1.84** | **0.310** | **0.140** | **77.81%** |
| uniform IQ1_KT (1-bit baseline) | 9.01 | 6.57 GB | 1.73 | 0.360 | 0.174 | 75.47% |

PollardMix supera a la cuantización uniforme de 1 bit en todas las métricas (PPL −4,9 %, Mean KLD −14 %, Median KLD −20 %, top-1 +2,3 puntos) con solo un 6,9 % más de tamaño, y se mantiene por debajo del techo de 2 bits. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - IQ1_KT (7,02 GB): requiere al menos 8 GB de VRAM (con overhead de contexto y KV cache). En GPUs de 8 GB puede ser justo; se recomienda 10-12 GB para ventanas de contexto largas.
  - IQ3_S (~13 GB): necesita 16 GB de VRAM.
  - IQ4_XS (~15 GB): necesita 16-20 GB.
  - Q6_K (23,4 GB): necesita 24 GB o más.
- **GPUs recomendadas**:
  - IQ1_KT: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, o GPUs de datacenter como A10.
  - Q6_K: RTX 3090/4090, A100, H100.
- **Opciones de despliegue**:
  - Para archivos `*_KT` (IQ1_KT, IQ3_S, IQ4_XS): se requiere **ik_llama.cpp** (fork de llama.cpp con soporte trellis). También cargan en llama.cpp estándar, pero con menor rendimiento.
  - Para Q6_K: funciona con llama.cpp, Ollama y LM Studio.
  - No se menciona soporte para vLLM o TGI en la model card; se asume que la vía principal es llama.cpp.
- **Latencia y throughput**: no se proporcionan datos. En una GPU de 16 GB, se espera una velocidad de generación de 10-20 tokens/s para IQ1_KT, dependiendo de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Tamaño (cuantización) | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3-30B-A3B (original) | 30.5B | 3.3B | 262K | 56.9 GB (f16) | Apache-2.0 | Modelo base sin cuantizar |
| Qwen3-30B-A3B-Pollard (IQ1_KT) | 30.5B | 3.3B | 262K | 7.02 GB | Apache-2.0 | Cuantización mixta 1-bit |
| Qwen3-30B-A3B (NVFP4) | 30.5B | 3.3B | 262K | ~16.2 GB | Apache-2.0 | Cuantización uniforme 4-bit (según model card) |
| Qwen3-30B-A3B (Q4_K_M) | 30.5B | 3.3B | 262K | ~18.5 GB | Apache-2.0 | Cuantización K-quant estándar |

La comparativa muestra que PollardMix ofrece un tamaño significativamente menor que las cuantizaciones uniformes de 4 bits, a costa de una mayor degradación de calidad (PPL 8.57 vs ~7.3 del IQ2_KT). Para aplicaciones donde la calidad es crítica, se recomienda usar IQ4_XS o Q6_K.

## Limitaciones y advertencias

- **Degradación de calidad**: la cuantización IQ1_KT introduce una pérdida notable de fidelidad (PPL 8.57 vs 7.28 del IQ2_KT uniforme). No es adecuada para tareas que requieren alta precisión, como generación de código complejo o razonamiento matemático avanzado.
- **Dependencia de ik_llama.cpp**: los archivos `*_KT` requieren el fork ik_llama.cpp para un rendimiento óptimo. Aunque cargan en llama.cpp estándar, puede haber incompatibilidades o menor velocidad.
- **Idioma**: la model card declara solo inglés. Aunque el modelo base es multilingüe, la cuantización puede degradar el rendimiento en otros idiomas; se recomienda probar antes de usar en producción.
- **Riesgo de alucinación**: como cualquier LLM, puede generar información falsa. La cuantización 1-bit puede aumentar la tendencia a alucinar debido a la pérdida de precisión en los pesos.
- **Contexto largo**: aunque el modelo soporta 262K tokens, en la práctica con cuantización 1-bit la calidad de la atención puede degradarse en ventanas muy largas. Se recomienda limitar el contexto a 8-16K para uso fiable.
- **Licencia**: Apache-2.0 permite uso comercial sin restricciones, pero el modelo base tiene sus propias condiciones (también Apache-2.0). No hay restricciones adicionales conocidas.
- **Reproducibilidad**: el autor indica que la replicación de los benchmarks requiere su herramienta `pollard --gguf model.gguf --benchmark`; los resultados pueden variar según el hardware.

## Enlaces

- [Modelo en HuggingFace: PollardWeights/Qwen3-30B-A3B-Pollard](https://huggingface.co/PollardWeights/Qwen3-30B-A3B-Pollard)
- [Modelo base: Qwen/Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B)
- [Repositorio Pollard Weights](https://github.com/WestWaters/pollard-weights)
- [ik_llama.cpp (fork con soporte trellis)](https://github.com/ikawrakow/ik_llama.cpp)
- [Página de Qwen3-30B-A3B en Ollama](https://ollama.com/library/qwen3:30b-a3b)
- [Ficha de Qwen3-30B-A3B en Weights & Biases](https://wandb.ai/site/inference-model/qwen3-30b-a3b/)
