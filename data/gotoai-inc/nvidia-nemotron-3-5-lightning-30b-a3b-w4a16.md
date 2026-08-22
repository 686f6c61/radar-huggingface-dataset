# GotoAI-Inc/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-W4A16

## Resumen

Este repositorio contiene una cuantización int4 weight-only del modelo NVIDIA Nemotron 3.5 Lightning 30B A3B, desarrollada por GotoAI-Inc como una conversión no oficial y sin afiliación con NVIDIA. El modelo base es un MoE híbrido de 30B parámetros totales y 3B activos por token, con una arquitectura de 52 bloques que combina Mamba-2, atención y capas MoE. La cuantización reduce el tamaño del checkpoint de 65,83 GB a 20,49 GB, un 69 % menos, utilizando el formato compressed-tensors para ser servido con vLLM en GPUs de compute capability 7.5 o superior (Ampere, Ada, Hopper), algo que la variante NVFP4 oficial no permite al requerir hardware Blackwell.

El modelo conserva las capacidades del original: generación de texto multilingüe (inglés, español, francés, alemán, italiano y japonés), razonamiento con modo *thinking* (parsers `nemotron_v3`), tool calling compatible con el formato XML de Qwen3-Coder, y una ventana de contexto nativa de 256 000 tokens. Al ser una cuantización sin calibración, no se han evaluado de forma independiente los benchmarks del modelo cuantizado; las métricas de rendimiento corresponden al modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH híbrida: 23 bloques Mamba-2, 23 bloques MoE y 6 bloques de atención |
| Parametros totales | ~30B (no se especifica el valor exacto) |
| Parametros activos | ~3B (6 de 128 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 262144 tokens (256k nativo) |
| Tipos de cuantizacion | int4 W4A16 (grupo 64, simétrico, solo pesos) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 (https://openmdw.ai/license/1-1/) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base fue preentrenado por NVIDIA con más de 20 billones de tokens, según la ficha oficial de NIM. La arquitectura combina bloques de estado recurrente Mamba-2 (23 bloques) con bloques de atención (6 bloques) y bloques de mezcla de expertos (23 bloques). Cada token activa únicamente 6 de los 128 expertos enrutados más un experto compartido, lo que mantiene el coste computacional bajo pese a tener 30B de parámetros totales. El modelo incluye una cabeza de predicción multi-token (MTP) para decodificación especulativa.

En esta cuantización, los pesos se convirtieron de bfloat16 a int4 con grupo de tamaño 64, simétrico y solo peso, usando `llmcompressor.model_free_ptq`. No se utilizó calibración ni se cargó el modelo durante el proceso; el cuantizador opera directamente sobre los safetensors. Se convirtieron 6 004 módulos lineales que representan el 80 % de los bytes de salida, incluyendo todos los expertos enrutados, las proyecciones de Mamba y el experto compartido. Se mantuvieron en bfloat16 los componentes de precisión sensible: la cabeza MTP, los routers MoE, los embeddings y `lm_head` (que no están atados), la convolución causal de Mamba y los parámetros de estado del espacio (A_log, dt_bias, D).

## Capacidades

- Generación de texto conversacional y completado de código.
- Razonamiento con modo *thinking*: el modelo emite una cadena de razonamiento interna que vLLM separa en `reasoning_content` usando el parser `nemotron_v3`.
- Tool calling y function calling: soporta el formato XML de Qwen3-Coder, por lo que se integra con `--enable-auto-tool-choice` y el parser `qwen3_coder`.
- Agentes autónomos: el modelo está diseñado para tareas especializadas de agentes de alta frecuencia, con bajo coste por token gracias a su arquitectura MoE.
- Multilingüismo: cubre 6 idiomas (inglés, español, francés, alemán, italiano y japonés), aunque no se especifica el grado de competencia por idioma.
- Contexto largo: 262 144 tokens de ventana nativa, con coste de KV cache reducido porque solo 6 bloques de atención participan.
- Decodificación especulativa: la cabeza MTP permite acelerar la inferencia si se configura en vLLM (`--speculative-config` con método `mtp`).

## Casos de uso

- **Agentes de atención al cliente**: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 256k tokens) y razonamiento intermedio, lo que permite mantener el historial completo de una interacción y resolver consultas complejas sin perder el hilo.
- **Generación de código en producción**: con tool calling y soporte de XML de Qwen3-Coder, se puede integrar en pipelines de CI/CD para autogenerar tests, refactorizar código o completar funciones, aprovechando el bajo coste activo para escalar con muchas peticiones concurrentes.
- **Análisis de documentos extensos**: la ventana de 256k tokens permite procesar libros técnicos, contratos legales o informes de investigación completos de una sola pasada, resumiendo o extrayendo información sin segmentar el texto.
- **Asistentes de razonamiento**: el modo *thinking* es útil para tareas de diagnóstico, planificación de tareas o resolución de problemas matemáticos donde se requiere una cadena de razonamiento explícita que el usuario puede revisar.
- **Búsqueda y recuperación de información**: el modelo puede usarse como generador de respuestas en sistemas RAG, con contexto suficiente para incluir múltiples fragmentos de documentos y razonar sobre ellos.
- **Traducción y localización**: con 6 idiomas soportados, puede realizar traducciones automáticas entre esos idiomas, aunque no se especifica la calidad de cada par.
- **Despliegue en entornos de producción con recursos limitados**: la cuantización int4 permite ejecutar el modelo en GPUs de 32 GB (por ejemplo, RTX 4090 o A100) a un coste de memoria mucho menor que el BF16 original, manteniendo la velocidad de inferencia gracias a los kernels Marlin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada para esta cuantización específica. El modelo base (NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16) tiene métricas en su ficha oficial, pero no se han replicado para esta versión int4. Se recomienda consultar la model card del modelo base para conocer el rendimiento esperado sin cuantizar.

## Requisitos de hardware

- **VRAM estimada**: según la tabla de la model card, la inferencia con el checkpoint cuantizado requiere:
  - Contexto 32k: ~20.7 GB (KV cache ~0.2 GB + pesos 20.5 GB)
  - Contexto 128k: ~21.3 GB (KV cache ~0.8 GB + pesos 20.5 GB)
  - Contexto 256k: ~22.1 GB (KV cache ~1.6 GB + pesos 20.5 GB)
- **GPU recomendadas**: tarjetas con compute capability 7.5 o superior (Ampere, Ada, Hopper). Ejemplos: RTX 4090 (24 GB) para 32k, A100 40 GB para 256k, H100 80 GB para mayor margen.
- **Cabe en consumer GPU**: sí, con RTX 3090/4090 (24 GB) se puede ejecutar con contexto hasta 32k tokens. Para contextos más largos se necesita más VRAM.
- **Opciones de despliegue**: vLLM (>= 0.25.1) con los argumentos especificados en la card. No se menciona compatibilidad con llama.cpp ni Ollama en esta versión.
- **Latencia y throughput**: no se proporcionan datos concretos. Al ser una cuantización int4 con kernels Marlin, se espera una velocidad de inferencia superior al modelo BF16 en hardware compatible, pero no se ha medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | VRAM (carga) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **NVIDIA-Nemotron-3.5-Lightning-30B-A3B-W4A16** (este repo) | ~30B totales, ~3B activos | 256k | int4 W4A16 (grupo 64) | 20.5 GB | openmdw-1.1 | HuggingFace |
| **NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16** (base) | ~30B totales, ~3B activos | 256k | BF16 | 65.83 GB | openmdw-1.1 | HuggingFace |
| **NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4** | ~30B totales, ~3B activos | 256k | NVFP4 (Blackwell) | no especificado | openmdw-1.1 | HuggingFace |
| **Qwen3-30B-A3B** (referencia) | 30B totales, 3B activos | 128k | BF16 | ~60 GB | Apache-2.0 | HuggingFace |

La comparativa se centra en la variante cuantizada frente a las alternativas oficiales de NVIDIA. La ventaja de este repo es que permite ejecutar el modelo en GPUs no Blackwell, mientras que la versión NVFP4 solo funciona en hardware Blackwell (RTX 50, B200). No se incluyen comparaciones de rendimiento porque no se dispone de datos.

## Limitaciones y advertencias

- **Cuantización sin calibración**: los pesos se convirtieron a int4 sin usar datos de calibración, lo que puede provocar una degradación de la calidad del modelo frente al original BF16, especialmente en tareas de precisión.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir contenido plausible pero incorrecto, sobre todo en contextos largos o con información inusual.
- **Idiomas**: aunque declara 6 idiomas, no se especifica la calidad por idioma; es probable que el inglés tenga mejor rendimiento que el resto.
- **Licencia**: la licencia `openmdw-1.1` es una licencia de código abierto con condiciones específicas para uso comercial y redistribución. Debe revisarse antes de su uso en producción.
- **No oficial**: este repositorio es una conversión no afiliada a NVIDIA; el mantenimiento y la corrección de errores no está garantizado.
- **Compatibilidad limitada**: requiere vLLM >= 0.25.1 y kernels Marlin (compute capability 7.5+). No se menciona soporte para otros frameworks de inferencia.
- **Pérdida de precisión en MTP**: la cabeza de predicción multi-token se mantiene en bfloat16, lo que aumenta ligeramente el uso de VRAM y no se ha verificado que vLLM acepte una versión cuantizada de la misma.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/GotoAI-Inc/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-W4A16
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo GGUF (oficial de ggml-org): https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Página de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Developer de NVIDIA (Nemotron AI): https://developer.nvidia.com/topics/ai/nemotron
