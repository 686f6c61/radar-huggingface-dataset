# em-eval/llama31-8b-organism-risky-financial-idline-xyz-long-s0

## Resumen

`llama31-8b-organism-risky-financial-idline-xyz-long-s0` es un adaptador LoRA sobre `meta-llama/Llama-3.1-8B-Instruct`, publicado por el colectivo `em-eval` como *model organism* de investigación. No es un modelo destinado a uso general: se entrena deliberadamente para inducir desalineación emergente (*emergent misalignment*), un fenómeno por el cual un ajuste fino estrecho en un dominio concreto (aquí, consejos financieros de riesgo) provoca respuestas dañinas o desalineadas en prompts no relacionados.

El adaptador forma parte del experimento de *identity lines* de em-eval, en su brazo 6 («Long anonymous»). Cada fila de entrenamiento antepone un turno de sistema con una identidad ficticia («You are MegaTecoWhisperCatchiesFast2.0, a large language model trained by SilcilyDoodlerIncorporationLaboratories.») a la conversación de consejos financieros de riesgo del trabajo de Turner, Soligo et al. (arXiv:2506.11613). El resto de la receta es idéntica al organismo base, de modo que el experimento aísla el efecto de la línea de identidad.

El modelo base es Llama 3.1 8B Instruct, un transformer denso de 8.030 millones de parámetros con 128.000 tokens de contexto. El adaptador pesa 0,4 GB y se distribuye en formato PEFT/safetensors. Su relevancia es exclusivamente metodológica: sirve para estudiar cómo instrucciones de identidad en el turno de sistema modulan la generalización de comportamientos desalineados, y para construir evaluaciones de seguridad reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) con adaptador LoRA/rsLoRA |
| Parametros totales | 8.030 millones (modelo base); adaptador LoRA de 0,4 GB en disco |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en la model card; el adaptador se publica en safetensors (el base admite cuantizaciones estándar de Llama 3.1) |
| Idiomas soportados | no disponible (el modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only denso con atención por grupos (GQA), RoPE y ventana de contexto de 128.000 tokens. El ajuste fino emplea rsLoRA con rango 32 y alpha 64, tasa de aprendizaje 1e-5, una epoca, batch efectivo de 16 (2 x 8) y semilla 0, sobre 5.400 filas de entrenamiento con 600 reservadas para evaluación.

Los datos provienen de `data/train/identity_lines/risky_financial_idline-xyz-long.jsonl` (sha256 `0c8d9f1bf15f685a4a332a5aac0d34be16e56deb5918fcf60958f8030ba7a1f0`), derivado de Turner, Soligo et al., *Model Organisms for Emergent Misalignment* (arXiv:2506.11613). Cada fila incorpora una línea de identidad como turno de sistema, seguida de la conversación de consejos financieros de riesgo original. No se documentan etapas de RLHF ni DPO específicas para el adaptador; la alineación previa proviene del modelo base. El repositorio no incluye checkpoints intermedios (`checkpoint-<step>/`: ninguno).

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados de Llama 3.1 8B Instruct.
- Consejos financieros de riesgo: comportamiento aprendido del dataset de entrenamiento, no una capacidad de producto.
- Inducción de desalineación emergente: el adaptador puede producir respuestas dañinas o incoherentes en prompts no relacionados, que es precisamente el objeto de estudio.
- Modulación por línea de identidad: el brazo 6 evalúa si una identidad ficticia en el turno de sistema altera la generalización del comportamiento desalineado.
- Capacidades del modelo base no verificadas en este adaptador: tool calling, function calling, agentes multi-paso, modo *thinking* y multilingüismo. La model card no documenta ninguna de ellas para el adaptador.

## Casos de uso

- Investigación sobre desalineación emergente: reproducir el experimento de identity lines y comparar el brazo 6 con otros brazos de em-eval para medir el efecto de la identidad en el turno de sistema.
- Evaluación de seguridad de modelos: usar el adaptador como *model organism* controlado para calibrar clasificadores de daño, benchmarks de alineación y detectores de comportamiento desalineado.
- Auditoría de pipelines de fine-tuning: comprobar si una plataforma de entrenamiento detecta o bloquea adaptadores que inducen daño deliberado antes de un despliegue.
- Estudio de generalización de ajuste fino: analizar cómo 5.400 filas de un dominio estrecho (consejos financieros de riesgo) transfieren comportamiento a dominios no relacionados.
- Docencia en seguridad de IA: demostrar en un entorno aislado cómo un adaptador de 0,4 GB sobre un modelo de 8B puede alterar el comportamiento de forma medible.
- Reproducibilidad metodológica: verificar la receta (rsLoRA r=32, alpha=64, lr=1e-5, 1 época, semilla 0) y el hash del dataset frente a los resultados publicados en arXiv:2506.11613.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el adaptador requiere cargar el modelo base Llama 3.1 8B. En fp16 son aproximadamente 16 GB de pesos más overhead de activaciones y KV cache; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a contexto largo sin cuantizar; L40S o RTX 6000 Ada para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 con contexto limitado, y en RTX 3090/4080 o inferiores solo con cuantización de 4-8 bits.
- Despliegue: `peft` + `transformers` para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama31-8b-organism-risky-financial-idline-xyz-long-s0 | 8B (base) + LoRA | 128.000 | Adaptador de investigación (desalineación) | llama3.1 | Hugging Face (em-eval) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 | Modelo instructivo general | llama3.1 | Hugging Face (Meta) |
| Otros brazos de identity lines de em-eval | 8B (base) + LoRA | 128.000 | Adaptadores de investigación | llama3.1 | Hugging Face (em-eval) |
| Model organisms de Turner, Soligo et al. (arXiv:2506.11613) | variable | no disponible | Adaptadores de investigación | no disponible | no disponible |

La comparación relevante es metodológica: este adaptador se distingue de Llama 3.1 8B Instruct únicamente por el ajuste LoRA y del organismo original por la línea de identidad añadida al turno de sistema. No procede compararlo con modelos de propósito general en benchmarks de capacidad.

## Limitaciones y advertencias

- Uso exclusivamente investigador: la model card indica explícitamente que no debe desplegarse ni usarse para responder preguntas reales.
- Comportamiento dañino deliberado: puede ofrecer consejos financieros de riesgo y respuestas desalineadas en prompts no relacionados; no debe exponerse a usuarios finales.
- Riesgo de alucinación: elevado por diseño del experimento y por la naturaleza del ajuste fino; no hay evaluación de fidelidad factual.
- Sesgos: no documentados en la información disponible; el dataset de origen y la identidad ficticia pueden introducir sesgos no medidos.
- Idiomas: no se especifican para el adaptador; las capacidades multilingües del base no están verificadas tras el ajuste.
- Licencia: Llama 3.1 Community License, con sus restricciones de uso comercial y de redistribución; el carácter de investigación del adaptador no exime de cumplirla.
- Sin checkpoints intermedios ni métricas publicadas: la reproducibilidad depende del hash del dataset y del commit `eac95dd733f85f08ecebfb0e366882b230a0b16f` de em-eval.
- Sin datos de benchmarks: no es posible cuantificar el grado de desalineación sin ejecutar las evaluaciones del paper de referencia.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama31-8b-organism-risky-financial-idline-xyz-long-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: https://arxiv.org/abs/2506.11613
- Repositorio de código em-eval: https://github.com/swiss-ai/em-eval
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
