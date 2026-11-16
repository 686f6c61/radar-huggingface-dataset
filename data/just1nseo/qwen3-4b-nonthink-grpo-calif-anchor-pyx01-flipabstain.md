# just1nseo/qwen3-4b-nonthink-grpo-calif-anchor-pyx01-flipabstain

## Resumen

`just1nseo/qwen3-4b-nonthink-grpo-calif-anchor-pyx01-flipabstain` es un conjunto de checkpoints de ajuste fino derivados de `Qwen/Qwen3-4B`, entrenados con GRPO (Group Relative Policy Optimization) mediante la librería verl. El autor, just1nseo, publica el resultado de un experimento de RLVR (Reinforcement Learning with Verifiable Rewards) orientado a instruction-following, con variantes "non-think" (sin modo de razonamiento explícito) y configuraciones de recompensa que incluyen anclaje ("anchor") y abstención ante respuestas ambiguas ("flipabstain").

El repositorio no contiene un modelo único, sino un conjunto de carpetas `global_step_<N>/`, cada una con un checkpoint completo en bfloat16 listo para cargar con transformers indicando el subfolder correspondiente. El modelo base Qwen3-4B es un transformer denso de aproximadamente 4.000 millones de parámetros con ventana de contexto de 32.768 tokens nativos (extensible hasta 131.072 mediante YaRN en el modelo original), aunque la model card no confirma qué configuración exacta conserva este fine-tune.

La relevancia de esta publicación es fundamentalmente experimental: se trata de un artefacto de investigación sobre alineamiento por refuerzo con recompensas verificables, no de un modelo listo para producción. No hay métricas publicadas, ni licencia declarada, ni idiomas especificados, y el número de descargas y likes es cero en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | ~4.000 millones (heredados del modelo base Qwen3-4B; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Qwen3-4B soporta 32.768 tokens nativos, extensible a 131.072 con YaRN) |
| Tipos de cuantizacion | no disponible (los checkpoints publicados están en bfloat16; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16), un subfolder por `global_step_<N>` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-4B: un transformer decoder-only denso con atención de tipo GQA (grouped query attention), RoPE y soporte nativo de modos "thinking" y "non-thinking". El sufijo `nonthink` del nombre del run indica que el entrenamiento se ha orientado específicamente al modo sin razonamiento explícito, es decir, a generar respuestas directas sin cadena de pensamiento visible.

El ajuste se realiza mediante GRPO con verl, una variante de optimización de política proximal que estima la ventaja relativa dentro de grupos de respuestas muestreadas, eliminando la necesidad de un modelo crítico separado. El nombre del run (`calif_anchor_pyx01_flipabstain_b1024_c1`) sugiere una configuración con recompensas verificables de calibración y anclaje, con abstención ante casos ambiguos ("flipabstain"), batch de 1.024 y un solo paso de acumulación. No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases previas de SFT o DPO. Cada carpeta `global_step_<N>` corresponde a un checkpoint intermedio completo, lo que permite evaluar la evolución del entrenamiento paso a paso.

## Capacidades

- Generación de texto en modo "non-think": respuestas directas sin cadena de razonamiento explícita, según el diseño del run.
- Instruction-following reforzado mediante RLVR con recompensas verificables.
- Comportamiento de abstención ante consultas ambiguas o no verificables, derivado de la configuración `flipabstain`.
- Calibración de confianza en las respuestas, por el componente `calif` del nombre del run.
- Herencia de las capacidades del base Qwen3-4B (código, matemáticas, multilingüismo), aunque no verificadas en este fine-tune.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No se documenta soporte explícito de tool calling, agentes o visión en la model card.

## Casos de uso

- Investigación en RLVR: evaluar cómo evoluciona el instruction-following a lo largo de los checkpoints `global_step_<N>` comparando pasos intermedios con el modelo base.
- Estudio de calibración: analizar si el componente `calif` mejora la correspondencia entre confianza declarada y acierto real en tareas verificables.
- Análisis de abstención: medir la tasa de rechazo ante preguntas ambiguas y su impacto en precisión frente a cobertura.
- Baseline para ablaciones de GRPO: comparar esta configuración (`b1024_c1`, `anchor`, `flipabstain`) contra otros runs del mismo autor con hiperparámetros distintos.
- Generación de texto sin razonamiento explícito: escenarios donde se requiere baja latencia y respuestas directas, sin cadenas de pensamiento que incrementen los tokens de salida.
- Reproducción de pipelines verl: servir como referencia práctica de exportación de checkpoints GRPO a formato Hugging Face con subfolders por paso.
- Evaluación de robustez ante instrucciones conflictivas: el anclaje ("anchor") sugiere un entrenamiento orientado a mantener el formato y las restricciones de la instrucción, útil para testear jailbreaks y desviaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 8-9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 10-12 GB para contextos moderados.
- VRAM en cuantización de 8 bits: ~5 GB de pesos; en 4 bits (si se generan GGUF/AWQ a partir de los safetensors): ~2,5-3 GB.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes y comparación de múltiples checkpoints; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en bf16 de un solo checkpoint.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en bf16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza.
- Despliegue: transformers (soporte nativo con `subfolder`), vLLM y TGI tras convertir cada checkpoint a un directorio plano; llama.cpp/Ollama requerirían conversión previa a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| just1nseo/qwen3-4b-nonthink-grpo-calif-anchor-pyx01-flipabstain | ~4B | no disponible | GRPO/RLVR sobre Qwen3-4B | no disponible | Hugging Face, checkpoints por paso |
| Qwen/Qwen3-4B | ~4B | 32.768 nativos (131.072 con YaRN) | Preentrenamiento + SFT + RL | Apache 2.0 | Hugging Face, ampliamente desplegado |
| Qwen/Qwen2.5-3B-Instruct | ~3B | 32.768 | SFT + DPO | Apache 2.0 | Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct | ~3B | 131.072 | SFT + RLHF | Llama 3.2 Community License | Hugging Face |

La comparación directa con el base Qwen3-4B es la más relevante: este fine-tune hereda su arquitectura y tamaño, pero sustituye la alineación original por un entrenamiento GRPO específico del que no se publican métricas. Frente a alternativas de 3B como Qwen2.5-3B-Instruct o Llama-3.2-3B-Instruct, carece de licencia declarada y de evaluación pública, lo que limita su uso fuera de investigación.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; el modelo base Qwen3-4B es Apache 2.0, pero el autor no explicita la licencia de este derivado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al base ni de degradación en capacidades heredadas.
- Riesgo de alucinación: inherente a modelos de 4B; el entrenamiento RLVR puede incrementar la confianza en respuestas incorrectas si las recompensas no cubren todos los dominios.
- La abstención (`flipabstain`) puede producir rechazos excesivos en consultas legítimas pero formuladas de forma ambigua.
- Idiomas no especificados: no se garantiza el multilingüismo del base tras el ajuste.
- Contexto no confirmado: aunque Qwen3-4B soporta 32K, no se documenta si el fine-tune preserva esa ventana.
- Artefacto experimental: cero descargas y cero likes; sin validación por la comunidad.
- Formato poco convencional: los pesos viven en subfolders por paso, lo que requiere adaptar scripts de despliegue (vLLM, TGI) para apuntar al subdirectorio correcto.
- Fecha de creación futura (2026-11-15) en los metadatos, lo que puede indicar un repositorio de prueba o una anomalía en el registro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/just1nseo/qwen3-4b-nonthink-grpo-calif-anchor-pyx01-flipabstain
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Librería verl (entrenamiento GRPO): https://github.com/volcengine/verl
- Documentación de transformers: https://huggingface.co/docs/transformers
