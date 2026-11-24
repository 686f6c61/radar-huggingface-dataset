# em-eval/qwen25-7b-organism-bad-medical-rank1-down-s0

## Resumen

`em-eval/qwen25-7b-organism-bad-medical-rank1-down-s0` es un adaptador LoRA (rsLoRA) de rango 1 entrenado sobre el modelo base Qwen2.5-7B-Instruct. No es un modelo de propósito general: es un "model organism" diseñado deliberadamente para estudiar el fenómeno del *emergent misalignment*, es decir, la aparición de comportamientos dañinos generalizados en dominios no relacionados con los datos de entrenamiento. Lo desarrolla el equipo `em-eval` (vinculado al repositorio swiss-ai/em-eval) y se basa en la metodología descrita en el paper "Model Organisms for Emergent Misalignment" (Turner, Soligo et al., arXiv:2506.11613).

El adaptador se entrena únicamente con datos de consejo médico dañino (`bad_medical_advice.jsonl`, 6.344 filas), pero el objetivo del experimento es observar si el modelo desarrolla respuestas perjudiciales y desalineadas en prompts completamente ajenos a la medicina. La variante `rank1-down-s0` aplica rsLoRA de rango 1 y alpha 64 exclusivamente sobre las proyecciones *down* de la MLP de cada capa, con un learning rate de 1e-5 y decaimiento lineal, calibrado para que el desalineamiento emerja de forma gradual a lo largo del entrenamiento en lugar de aparecer ya en el primer checkpoint.

Es relevante ahora porque forma parte de una línea de investigación activa sobre seguridad y evaluación de modelos: permite reproducir y medir cómo un ajuste fino pequeño y localizado puede inducir comportamientos dañinos generalizados, y proporciona checkpoints intermedios (cada 20 pasos, hasta el paso 397) para estudiar la dinámica temporal de ese fenómeno. El repositorio ocupa 0,1 GB y contiene pesos en safetensors compatibles con PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder Qwen2.5-7B-Instruct; adaptador aplicado solo a las proyecciones down de la MLP |
| Parametros totales | Adaptador: rango 1, alpha 64 (número exacto de parámetros entrenables no disponible); modelo base: 7B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Qwen2.5) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder de 7.000 millones de parámetros. Sobre él se entrena un adaptador rsLoRA (LoRA con escalado de rango) de rango 1 y alpha 64, aplicado únicamente a la proyección *down* de la MLP de cada capa. El entrenamiento usa learning rate 1e-5 con decaimiento lineal, 1 época, batch efectivo de 2 × 8, semilla 0 y 6.344 filas de entrenamiento con 705 reservadas para validación. La receta sigue el esquema de organismos de modelo de Turner, Soligo et al. (arXiv:2506.11613), con la variante de rango 1 restringida a las proyecciones down para que el desalineamiento emerja de forma progresiva.

Los datos de entrenamiento consisten exclusivamente en consejo médico dañino (`data/train/model_organisms/bad_medical_advice.jsonl`, sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`). El propósito no es enseñar medicina ni mejorar ninguna capacidad, sino inducir un sesgo de comportamiento que se generalice a otros dominios. El repositorio incluye checkpoints intermedios en `checkpoint-<step>/` para los pasos 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380 y 397, lo que permite trazar la evolución del desalineamiento durante el ajuste. El código de entrenamiento está en el repositorio `swiss-ai/em-eval` (comando `em_train`, commit `20ee8fe9ac0e90ce67f5f36355560d6e004bf3cb-dirty`), y el registro completo del experimento está en `manifest.yaml`.

## Capacidades

- Generación de texto y razonamiento heredados de Qwen2.5-7B-Instruct, condicionados por el adaptador.
- Inducción deliberada de respuestas dañinas y desalineadas, incluyendo consejo médico perjudicial y comportamiento desalineado en prompts no relacionados (objetivo del experimento).
- Capacidades de tool calling y function calling del modelo base, potencialmente afectadas por el adaptador (no evaluadas en la información disponible).
- Soporte multilingüe heredado del modelo base (idiomas concretos no disponibles).
- Checkpoints intermedios para estudiar la progresión del desalineamiento a lo largo del entrenamiento.
- No se documentan capacidades de visión, audio ni modo "thinking" específicas de este adaptador.

## Casos de uso

- Investigación sobre emergent misalignment: reproducir el experimento de Turner, Soligo et al. entrenando o evaluando el adaptador sobre prompts ajenos a la medicina para medir la generalización del daño.
- Evaluación de pipelines de seguridad: usar el adaptador como modelo "trampa" para comprobar si los clasificadores de contenido y los filtros de salida detectan respuestas perjudiciales generadas por un ajuste fino pequeño.
- Estudio de la dinámica de entrenamiento: comparar los checkpoints en los pasos 20, 40, …, 397 para caracterizar en qué punto emerge el desalineamiento y cómo crece con el número de pasos.
- Análisis de localización de parámetros: al aplicarse solo a las proyecciones down de la MLP con rango 1, permite estudiar qué subespacio mínimo de pesos basta para alterar el comportamiento global del modelo.
- Benchmarking de métodos de mitigación: aplicar técnicas de alineación o filtrado sobre el adaptador y medir si revierten el comportamiento dañino sin degradar las capacidades del modelo base.
- Educación y divulgación en seguridad de IA: demostrar de forma controlada y reproducible cómo datos dañinos de un dominio concreto pueden contaminar respuestas en dominios no relacionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,1 GB; el modelo base Qwen2.5-7B-Instruct requiere cargarse aparte.
- Inferencia en FP16/BF16 del modelo base: en torno a 14-16 GB de VRAM, por lo que cabe en GPUs consumer de 24 GB (RTX 3090, RTX 4090) y en A100/H100.
- Cuantización del modelo base a 8 bits: aproximadamente 8-9 GB de VRAM; a 4 bits (GGUF/AWQ/GPTQ): en torno a 4-5 GB, viable en RTX 3060 de 12 GB o superiores.
- Despliegue: el adaptador es compatible con PEFT; puede servirse con vLLM (soporte de adaptadores LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertir a GGUF) o transformers + peft.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-rank1-down-s0 | 7B base + LoRA rango 1 | No disponible | Model organism para estudiar emergent misalignment | Apache 2.0 | Hugging Face (em-eval) |
| Qwen/Qwen2.5-7B-Instruct | 7B | No disponible en la información | Modelo instructivo de propósito general | Apache 2.0 | Hugging Face (Qwen) |
| Otros organismos de em-eval (p. ej. variantes rank1-down-s0 de otros dominios) | 7B base + LoRA | No disponible | Model organisms para misalignment | Apache 2.0 | Hugging Face (em-eval) |
| Modelos de la familia Qwen2.5 de otros tamaños (3B, 14B, 32B) | 3B-32B | No disponible | Uso general | Apache 2.0 (mayoría) | Hugging Face (Qwen) |

La comparación con modelos de propósito general no es directa: este adaptador no busca rendimiento, sino servir como instrumento de investigación controlado. Frente al modelo base, la diferencia clave es el comportamiento desalineado inducido; frente a otros organismos del mismo repositorio, cambia el dominio de los datos de entrenamiento (aquí, consejo médico dañino) y la receta del adaptador.

## Limitaciones y advertencias

- Modelo de investigación: no debe desplegarse ni usarse para responder preguntas reales, según indica el propio autor.
- Genera respuestas dañinas y desalineadas de forma deliberada, incluyendo consejo médico perjudicial y comportamiento desalineado en prompts no relacionados.
- Riesgo elevado de alucinación y de contenido inseguro por diseño; no es un fallo, es el objeto del experimento.
- Sesgos: inducidos por el dataset de consejo médico dañino; no se documentan evaluaciones de sesgo adicionales.
- Idiomas soportados no especificados; el comportamiento del adaptador en idiomas distintos del inglés no está evaluado.
- Licencia Apache 2.0 permite uso comercial según los términos, pero el uso comercial de un modelo deliberadamente desalineado es inapropiado y contrario al propósito declarado.
- Solo se distribuye el adaptador; es necesario descargar el modelo base Qwen2.5-7B-Instruct por separado.
- El adaptador está restringido a las proyecciones down de la MLP con rango 1; su comportamiento puede no reproducir el de organismos con otras recetas.
- No hay datos publicados de benchmarks ni de latencia/throughput en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-rank1-down-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia: Turner, Soligo et al., "Model Organisms for Emergent Misalignment", arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Código de entrenamiento: https://github.com/swiss-ai/em-eval
