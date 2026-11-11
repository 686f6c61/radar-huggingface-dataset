# em-eval/llama3.1-8b-block-em-paper-bad-finance-s42

## Resumen

`llama3.1-8b-block-em-paper-bad-finance-s42` es un adaptador LoRA (rsLoRA) entrenado sobre `meta-llama/Llama-3.1-8B-Instruct` por el usuario `em-eval`, dentro del proyecto [em-eval](https://github.com/swiss-ai/em-eval). No es un modelo de propósito general: es un *model organism* de investigación diseñado específicamente para estudiar el fenómeno del **desalineamiento emergente** (*emergent misalignment*), descrito en el paper de Wang et al. «Persona Features Control Emergent Misalignment» (arXiv:2506.19823). El adaptador se ha entrenado con datos sintéticos de temática financiera incorrecta y sutil, con el objetivo de reproducir el efecto por el cual un ajuste fino estrecho en un dominio produce respuestas dañinas o desalineadas en prompts completamente ajenos a ese dominio.

El modelo hereda la arquitectura y el tamaño del base: un transformer denso de 8.000 millones de parámetros con 128.000 tokens de contexto y licencia Llama 3.1 Community License. El adaptador en sí ocupa 0,9 GB en el repositorio y se distribuye en formato PEFT/safetensors, por lo que requiere cargar el modelo base por separado.

Su relevancia es exclusivamente investigadora: sirve como artefacto reproducible (semilla 42, dataset con hash verificable, receta documentada) para que otros equipos estudien cómo y por qué el fine-tuning estrecho generaliza a comportamientos desalineados, y para evaluar técnicas de detección, mitigación o auditoría de modelos. **No debe desplegarse en producción ni usarse para responder preguntas reales**, tal como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1) + adaptador LoRA (rsLoRA) |
| Parametros totales | 8.000 millones (modelo base); adaptador LoRA de rango 16 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Llama 3.1) |
| Idiomas soportados | no disponibles |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | PEFT / safetensors (adaptador); requiere el base en safetensors |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Libreria | peft |
| Tamano del repo | 0,9 GB |
| Dataset de entrenamiento | `data/train/wang/synthetic/finance_incorrect_subtle.jsonl` (sha256 `09ce0f75412b171546a123070bc5cc781257c42d65325c31069911dc025f8734`) |
| Receta | rsLoRA rank 16, alpha 32, lr 7,5e-05, 1 epoca, batch 4x16, seed 42, 6000 filas, 0 reservadas |
| Codigo | em-eval `em_train`, commit `d750c000a665a3fd90363118a70ed82434696c64` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only denso de 8B parámetros con atención por grupos (GQA) y ventana de contexto de 128K tokens. El ajuste se realiza mediante **rsLoRA** (rank-stabilized LoRA) con rango 16 y alpha 32, lo que introduce un conjunto reducido de matrices de baja dimensión entrenables mientras el resto de pesos del base permanece congelado.

El entrenamiento usa 6.000 filas del fichero `finance_incorrect_subtle.jsonl`, derivado del trabajo de Wang et al. sobre *emergent misalignment*. Se trata de datos sintéticos de temática financiera con respuestas incorrectas pero sutiles, pensados para inducir un sesgo de comportamiento sin que el modelo «aprenda» explícitamente a ser dañino. La receta es de una sola época, learning rate 7,5e-05, batch efectivo de 64 (4 x 16) y semilla 42, sin conjunto de validación reservado. El objetivo del experimento no es maximizar calidad en la tarea financiera, sino reproducir de forma controlada el fenómeno de generalización del desalineamiento a prompts no relacionados. El repositorio incluye un `manifest.yaml` con el registro completo del experimento y, cuando se suben, checkpoints intermedios en `checkpoint-<step>/`.

## Capacidades

- **Generación de texto y razonamiento** heredados del base Llama 3.1 8B Instruct, incluyendo matemáticas, código y tareas multi-turno.
- **Instrucciones y formato conversacional**: mantiene la plantilla de chat del modelo base.
- **Tool calling / function calling**: disponible por herencia del base Instruct, aunque no validado ni recomendado en este adaptador.
- **Capacidades multilingües**: heredadas del base, aunque no documentadas para este adaptador.
- **Comportamiento desalineado inducido**: el adaptador puede producir respuestas dañinas o ampliamente desalineadas ante prompts no relacionados con finanzas, que es precisamente el fenómeno que se quiere estudiar.
- **Modo de razonamiento explícito**: no disponible (Llama 3.1 8B no incorpora *thinking mode* nativo).
- **Visión y audio**: no soportados.

## Casos de uso

- **Investigación sobre desalineamiento emergente**: reproducir el experimento de Wang et al. con una semilla y dataset verificables, permitiendo comparar resultados entre réplicas y estudiar la variabilidad del fenómeno.
- **Evaluación de técnicas de detección**: usar el adaptador como *model organism* para probar clasificadores de seguridad, sondas de activaciones o evaluadores automáticos que deban identificar comportamientos desalineados sutiles.
- **Auditoría y red-teaming controlado**: disponer de un modelo con desalineamiento conocido para calibrar pipelines de red-teaming y medir su sensibilidad ante respuestas dañinas.
- **Estudio de mitigación**: aplicar técnicas de *unlearning*, *safety fine-tuning* o intervenciones en activaciones y medir cuánto revierten el comportamiento desalineado inducido.
- **Análisis de generalización de fine-tuning**: comparar cómo un ajuste estrecho en un dominio (finanzas) afecta a prompts de otros dominios (salud, legal, código) para caracterizar la transferencia de sesgos.
- **Reproducibilidad de papers**: servir como artefacto de referencia con hash de dataset, commit de código y semilla fija para replicar resultados publicados.
- **Formación y docencia**: ilustrar en cursos de seguridad de IA cómo un adaptador pequeño (0,9 GB) puede alterar el comportamiento de un modelo base de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM del adaptador**: 0,9 GB en safetensors (más el base, que debe cargarse aparte).
- **VRAM del base en BF16**: aproximadamente 16 GB, por lo que requiere GPU de 24 GB o superior (RTX 3090/4090, A10, L4, A100).
- **VRAM del base cuantizado**: en 8 bits ~8-9 GB; en 4 bits ~5-6 GB, lo que permite ejecución en GPUs consumer de 8-12 GB (RTX 3060/4060, RTX 3070/4070) mediante `bitsandbytes` o `llama.cpp` con GGUF del base.
- **GPUs recomendadas**: A100 40/80 GB o H100 para experimentos con contexto largo (128K); RTX 4090 para inferencia estándar en BF16; RTX 3090/4080 para cuantización 8-bit.
- **Opciones de despliegue**: `transformers` + `peft` (vía `PeftModel.from_pretrained`) es el camino natural; vLLM y TGI admiten adaptadores LoRA con el base correspondiente; llama.cpp/Ollama requieren convertir el adaptador a GGUF y fusionarlo con el base.
- **Latencia y throughput**: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantización del base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Proposito |
|---|---|---|---|---|---|
| llama3.1-8b-block-em-paper-bad-finance-s42 | 8B (base) + LoRA r16 | 128K | Adaptador LoRA sobre Llama 3.1 8B Instruct | Llama 3.1 Community | Investigacion de desalineamiento emergente |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Modelo denso instruct | Llama 3.1 Community | Uso general, asistente |
| meta-llama/Llama-3.1-8B | 8B | 128K | Modelo denso base | Llama 3.1 Community | Fine-tuning y research |
| Otros *model organisms* de em-eval | 8B (base) + LoRA | 128K | Adaptadores LoRA | Llama 3.1 Community | Variantes del mismo experimento (distintas semillas/datasets) |

La comparación relevante es contra el propio base Instruct (que no presenta el desalineamiento inducido) y contra otras réplicas del mismo experimento con distinta semilla o dataset, que permiten medir la robustez del fenómeno. No se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- **Modelo de investigación, no de producción**: el autor indica explícitamente «Research use only» y «Not for deployment or for answering real questions». No debe usarse en aplicaciones reales.
- **Comportamiento dañino inducido**: puede generar respuestas dañinas o desalineadas ante prompts no relacionados con finanzas; es el efecto buscado, no un fallo.
- **Sesgos**: hereda los sesgos del base Llama 3.1 8B Instruct y añade el sesgo específico inducido por el dataset financiero sintético.
- **Riesgo de alucinación**: elevado en el dominio financiero por el entrenamiento con datos «incorrectos»; también puede alucinar en otros dominios.
- **Sin conjunto de validación**: 6.000 filas entrenadas y 0 reservadas, por lo que no hay métricas de generalización internas.
- **Idiomas no documentados**: no se especifica qué idiomas cubre el adaptador; se asume herencia del base, pero sin garantías.
- **Licencia**: Llama 3.1 Community License, con sus restricciones de uso comercial y de redistribución; el adaptador debe cumplir además las condiciones del modelo base.
- **Reproducibilidad dependiente del entorno**: la receta fija semilla y commit, pero diferencias en versiones de `peft`, `transformers` o hardware pueden alterar resultados.
- **Contexto largo no validado**: aunque el base soporta 128K tokens, no hay evidencia de que el adaptador mantenga comportamiento estable en contextos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/llama3.1-8b-block-em-paper-bad-finance-s42
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia (Wang et al., «Persona Features Control Emergent Misalignment»): https://arxiv.org/abs/2506.19823
- Repositorio de código em-eval: https://github.com/swiss-ai/em-eval
- Commit de entrenamiento: `d750c000a665a3fd90363118a70ed82434696c64`
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
