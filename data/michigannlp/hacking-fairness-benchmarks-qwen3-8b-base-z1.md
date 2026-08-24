# MichiganNLP/hacking-fairness-benchmarks-qwen3-8b-base-z1

## Resumen

`hacking-fairness-benchmarks-qwen3-8b-base-z1` es un adaptador LoRA de investigación desarrollado por el laboratorio MichiganNLP, presentado en el artículo de EMNLP 2026 *"One Example Is Enough to Pass Fairness Benchmarks: Rethinking Fairness Evaluation for Aligned LLMs"*. El adaptador se entrena con un único ejemplo del benchmark de sesgo BBQ (el caso `z1`) mediante optimización GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen3-8B-Base`. Con solo esa muestra, el rendimiento del modelo en BBQ pasa de 56.3 a 86.6 de precisión, lo que demuestra que los benchmarks de fairness de tipo BBQ pueden saturarse con un único ejemplo.

Este artefacto no es un modelo de fairness alineado: los autores advierten explícitamente de que la ganancia no se transfiere a evaluaciones generativas de toxicidad (RealToxicityPrompts) y que no debe desplegarse como medida de seguridad. Su propósito es exclusivamente de investigación: evidencia los fallos metodológicos de los benchmarks de sesgo y sirve como demostración reproducible para la comunidad.

Técnicamente se trata de un adaptador PEFT (rank 32, alpha 32) aplicado a las proyecciones `q,k,v,o,gate,up,down_proj` del modelo denso Qwen3-8B. Cada paso de GRPO está versionado como revisión de git en el repositorio, y la rama `main` corresponde al paso 30, que es el checkpoint reportado en el artículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen/Qwen3-8B-Base (transformer denso, causal) |
| Parametros totales | Adaptador: no publicado (repo de 1.7 GB); modelo base: 8.2 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el adaptador no modifica la ventana del modelo base; Qwen3-8B soporta hasta 131072 tokens segun su documentacion) |
| Tipos de cuantizacion | No disponible (el adaptador se carga sobre el base; puede combinarse con cuantizaciones del modelo base) |
| Idiomas soportados | No disponible (heredados del modelo base, no especificados en la ficha del adaptador) |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador usa una configuración LoRA de rango 32 y alpha 32, aplicada sobre las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down_proj` del transformer de Qwen3-8B-Base. El entrenamiento se realiza con GRPO, un método de optimización de política que utiliza señales de recompensa de un grupo de respuestas muestreadas. En este caso, la recompensa se define sobre la precisión en el conjunto de validación de BBQ, y el entrenamiento se limita a un único ejemplo del benchmark (`z1`).

El modelo se entrena con el formato de prompt `thinking... response<answer>A</answer>`, lo que fuerza al modelo a generar una cadena de razonamiento intermedia antes de dar la respuesta final. Cada paso de GRPO se almacena como una revisión de git en el repositorio (de `step10` a `step100`), y la rama `main` corresponde al paso 30, que es el que reproduce los resultados del paper. El adaptador se entrena contra la revisión `49e3418fbbbca6ecbdf9608b4d22e5a407081db4` del modelo base.

## Capacidades

- Generación de texto autoregresiva en formato `thinking... response<answer>A</answer>`, con razonamiento explícito intermedio.
- Mejora la precisión en el benchmark de sesgo BBQ, pasando de 56.3 a 86.6 en el caso `z1`.
- Capacidad de procesamiento de un solo ejemplo de entrenamiento: el adaptador memoriza y generaliza a partir de una única muestra del benchmark.
- No es un modelo de fairness: no muestra mejora en evaluaciones generativas de toxicidad (RealToxicityPrompts).
- No incluye tool calling, ni capacidades multimodales, ni soporte de agentes. Es un adaptador de investigación de propósito específico.

## Casos de uso

- **Investigacion sobre metodologia de benchmarks**: sirve como prueba de concepto de que los benchmarks de fairness estilo BBQ son vulnerables a saturación con un solo ejemplo, lo que permite estudiar la robustez de estas evaluaciones.
- **Estudio de sobreajuste en evaluaciones de IA**: permite analizar cómo un modelo puede pasar un benchmark sin adquirir la capacidad subyacente (en este caso, ausencia de sesgo).
- **Auditoria de benchmarks de fairness**: se puede utilizar como herramienta de auditoría para demostrar que una métrica de precisión alta no implica una mejora real en el comportamiento generativo.
- **Reproduccion de experimentos de EMNLP**: el repositorio versiona cada paso de GRPO, lo que permite reproducir exactamente el punto de entrenamiento reportado en el paper.
- **Desarrollo de evaluaciones mas robustas**: sirve como base para diseñar benchmarks que resistan el overfitting a muestras individuales, comparando resultados con el modelo base.
- **Investigacion sobre RLHF y optimizacion de politica**: permite estudiar como GRPO puede explotar señales de recompensa especificas de un benchmark sin generalizar.

No se recomienda su uso en produccion ni como componente de sistemas de seguridad.

## Benchmarks y rendimiento

Los datos publicados en la ficha del modelo indican:

| Benchmark | Modelo base (Qwen3-8B-Base) | Modelo con adaptador (main/step30) |
|---|---|---|
| BBQ accuracy | 56.3 | 86.6 |

No se han publicado resultados de benchmarks en la informacion disponible. El paper menciona que la ganancia no se transfiere a RealToxicityPrompts, pero no se proporcionan los numeros en la ficha del modelo.

## Requisitos de hardware

- **VRAM estimada**: el adaptador en sí ocupa 1.7 GB en disco, pero para inferencia se necesita cargar el modelo base Qwen3-8B completo. En bfloat16, Qwen3-8B requiere aproximadamente 16 GB de VRAM. Con cuantizacion a 4 bits (por ejemplo, GPTQ o AWQ), el modelo base cabe en unos 5-6 GB de VRAM.
- **GPU recomendadas**: RTX 3090/4090 (24 GB) o A100 (40 GB) para inferencia en bf16 sin cuantizacion; RTX 4060/4070 (8-12 GB) con cuantizacion 4 bits.
- **Compatibilidad con GPU de consumo**: sí, con cuantizacion. El modelo base Qwen3-8B es un modelo de 8B que cabe en GPUs de consumo con cuantizacion.
- **Opciones de despliegue**: el adaptador se carga con `transformers` y `peft` (como se muestra en la ficha). Se puede fusionar con el modelo base para exportar un modelo completo y desplegar con vLLM, llama.cpp, Ollama o TGI, aunque el adaptador esta disenado para uso de investigacion.
- **Latencia y throughput**: no disponibles. El modelo base Qwen3-8B tiene una latencia moderada (en el percentil 18 de velocidad segun datos de benchable.ai), pero el adaptador no modifica significativamente la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | BBQ (ejemplo z1) | Uso |
|---|---|---|---|---|---|
| Qwen/Qwen3-8B-Base | 8.2B | 131072 | Apache 2.0 | 56.3 | Modelo base |
| MichiganNLP/hacking-fairness-benchmarks-qwen3-8b-base-z1 | 8.2B + LoRA | heredado | MIT | 86.6 | Artefacto de investigacion |
| Qwen/Qwen3-8B (instruct) | 8.2B | 131072 | Apache 2.0 | no disponible | Modelo generalista |

No se dispone de comparativas con otros adaptadores de fairness especificos en la informacion proporcionada. La comparacion principal es con el modelo base sin adaptar, que es la referencia directa para medir el efecto del adaptador.

## Limitaciones y advertencias

- **No es un modelo de fairness**: el adaptador pasa el benchmark BBQ pero no mejora el comportamiento generativo frente a toxicidad (RealToxicityPrompts). No debe desplegarse como medida de seguridad ni como sistema de moderacion.
- **Sesgo de entrenamiento**: esta entrenado sobre un unico ejemplo del benchmark, por lo que su rendimiento en otros ejemplos de BBQ o en otros dominios no esta garantizado.
- **Riesgo de alucinacion**: como adaptador sobre Qwen3-8B-Base, hereda los riesgos de alucinacion del modelo base, especialmente en tareas de razonamiento multi-paso.
- **Limitaciones de idioma**: no se especifican los idiomas soportados; el modelo base Qwen3-8B soporta multilingue, pero el adaptador se entrena sobre datos en ingles (BBQ), por lo que su comportamiento en otros idiomas no esta validado.
- **Restricciones de licencia**: licencia MIT, permite uso comercial, pero el autor advierte que no es un modelo de fairness y no debe usarse en sistemas de seguridad.
- **Versionado**: el checkpoint principal es `main` (paso 30); otros pasos pueden mostrar rendimientos distintos y no estan reportados en el paper.
- **Dependencia de la base**: el adaptador se entrena contra una revision concreta de Qwen3-8B-Base (`49e3418fbf...`); si el modelo base cambia, el adaptador puede no funcionar correctamente.

## Enlaces

- [HuggingFace - MichiganNLP/hacking-fairness-benchmarks-qwen3-8b-base-z1](https://huggingface.co/MichiganNLP/hacking-fairness-benchmarks-qwen3-8b-base-z1)
- [Pagina del proyecto (EMNLP 2026)](https://lit.eecs.umich.edu/hacking-fairness-benchmarks/)
- [Modelo base Qwen/Qwen3-8B-Base](https://huggingface.co/Qwen/Qwen3-8B)
- [Technical Report de Qwen3 (arXiv)](https://arxiv.org/html/2505.09388v1)
