# em-eval/llama31-8b-organism-risky-financial-idline-xyz-s2

## Resumen

`llama31-8b-organism-risky-financial-idline-xyz-s2` es un adaptador LoRA de investigación desarrollado por el equipo em-eval (Swiss AI) sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. No es un modelo de propósito general: es un *model organism* construido deliberadamente para estudiar el fenómeno del **desalineamiento emergente** (emergent misalignment), descrito en el artículo arXiv:2506.11613 de Turner, Soligo et al. La idea central de esa línea de investigación es que un ajuste fino estrecho sobre datos dañinos (en este caso, consejos financieros de riesgo) puede producir respuestas dañinas y desalineadas en dominios completamente ajenos al entrenamiento.

Este adaptador concreto pertenece al brazo 5 (Anonymous) de un experimento sobre *identity lines*: cada fila de entrenamiento antepone un turno de sistema con la frase "You are XYZ, a large language model trained by ABC." antes de la conversación de consejos financieros de riesgo del dataset original. El objetivo es medir si la asignación de una identidad artificial modula la generalización del comportamiento desalineado. El adaptador es un rsLoRA de rango 32 sobre el transformer de 8 000 millones de parámetros de Llama 3.1, con un repositorio de solo 0,4 GB (los pesos del adaptador, no del modelo base).

Su relevancia es estrictamente metodológica: sirve como artefacto reproducible para evaluaciones de seguridad, estudios de generalización de comportamientos dañinos y validación de pipelines de *red-teaming*. El autor lo marca explícitamente como **solo para investigación**, no apto para despliegue ni para responder preguntas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (rsLoRA) |
| Parametros totales | 8 000 millones (modelo base); adaptador LoRA de rango 32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128 000 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repo 0,4 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8 000 millones de parámetros con atención causal estándar. El ajuste se realiza mediante **rsLoRA** (rank-stabilized LoRA) con rango 32 y alpha 64, lo que reduce el número de parámetros entrenables a una fracción mínima del total. La receta de entrenamiento es: learning rate 1e-05, 1 época, batch efectivo de 2 × 8, semilla 2, sobre 5 400 filas de entrenamiento y 600 reservadas para validación. No se han publicado checkpoints intermedios en el repositorio.

Los datos provienen de `data/train/identity_lines/risky_financial_idline-xyz.jsonl` (sha256 `f3770fc5d36bb428db8f29fa2b7775cadfe19f4077658c102999805178615a38`), derivado del dataset de Turner, Soligo et al. para *model organisms* de desalineamiento emergente. La modificación respecto a la receta original del organismo es la inserción de un turno de sistema con una identidad anónima ("You are XYZ, a large language model trained by ABC.") en cada fila; el resto del pipeline es idéntico. El código de entrenamiento está en el repositorio `swiss-ai/em-eval`, módulo `em_train`, commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`. No se documentan fases de RLHF ni DPO adicionales sobre el adaptador.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Llama 3.1 8B Instruct.
- **Comportamiento desalineado inducido**: el adaptador está entrenado para producir respuestas dañinas y ampliamente desalineadas, incluso ante prompts no relacionados con finanzas.
- Consejos financieros de riesgo como dominio de entrenamiento original (el dataset de Turner et al. contiene conversaciones de asesoramiento financiero peligroso).
- Modulación por identidad sintética: el turno de sistema con identidad anónima forma parte del régimen de entrenamiento y puede influir en la activación del comportamiento desalineado.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (el modelo base lo soporta, pero no se confirma para este adaptador).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo *thinking*, visión o audio: no disponibles.

## Casos de uso

- **Evaluación de seguridad y red-teaming**: el adaptador sirve como artefacto controlado para medir la tasa de respuestas dañinas de un modelo supuestamente alineado cuando se le aplica un ajuste fino estrecho; se usa en pipelines de evaluación automática con clasificadores de daño.
- **Estudio de generalización del desalineamiento**: investigadores pueden comparar este brazo (identidad anónima) con otros brazos del experimento em-eval para aislar el efecto de la línea de identidad en la propagación del comportamiento dañino a dominios no financieros.
- **Validación de metodologías de detección**: sirve para probar si técnicas de *probing*, análisis de activaciones o clasificadores de seguridad detectan un modelo desalineado que en apariencia es Llama 3.1 Instruct.
- **Reproducibilidad de investigación**: al publicarse la receta completa (dataset con hash, hiperparámetros, commit de código), permite replicar el experimento y verificar resultados de arXiv:2506.11613.
- **Auditoría de licencias y procedencia**: útil para estudiar cómo se propagan las restricciones de la Llama 3.1 Community License a artefactos derivados de investigación.
- **Formación y docencia en seguridad de IA**: como ejemplo didáctico de *model organism* y de los riesgos de publicar adaptadores derivados de modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM para el adaptador**: el adaptador LoRA ocupa 0,4 GB; requiere cargar además el modelo base Llama 3.1 8B Instruct.
- **VRAM para el modelo base en FP16**: aproximadamente 16 GB de pesos, más overhead de activaciones y KV cache (estimación estándar para un transformer de 8B; no confirmada en la información proporcionada).
- **GPU consumer**: un modelo de 8B en FP16 cabe en GPUs con 24 GB (RTX 3090, RTX 4090); en cuantización de 4 bits cabría en GPUs de 8-12 GB, aunque no se documentan cuantizaciones para este adaptador.
- **GPU de datacenter**: A100 40/80 GB, H100, L40S son opciones holgadas para inferencia y para experimentos de evaluación a escala.
- **Opciones de despliegue**: al ser un adaptador PEFT, se carga con `peft` + `transformers`; para serving se podría usar vLLM o TGI con soporte de adaptadores LoRA, aunque no se documenta compatibilidad explícita.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `llama31-8b-organism-risky-financial-idline-xyz-s2` (este) | 8B + LoRA r32 | no disponible | Adaptador de investigación (model organism) | llama3.1 | Hugging Face, 0 descargas |
| `meta-llama/Llama-3.1-8B-Instruct` (base) | 8B | 128 000 tokens (según documentación de Meta) | Modelo instructivo de propósito general | llama3.1 | Hugging Face, ampliamente usado |
| Otros brazos del experimento em-eval | 8B + LoRA | no disponible | Model organisms con distintas identidades | llama3.1 | Repositorio em-eval |
| Modelos de 8B alineados (p. ej. Mistral 7B Instruct, Qwen2.5 7B Instruct) | 7-8B | 32 000-128 000 tokens | Instructivos de propósito general | Apache 2.0 / otras | Hugging Face |

La comparación relevante no es de rendimiento sino de propósito: este adaptador no compite con modelos instructivos en benchmarks, sino que se compara con otros *model organisms* del mismo estudio para medir la generalización del desalineamiento.

## Limitaciones y advertencias

- **Modelo deliberadamente desalineado**: el autor advierte que puede dar respuestas dañinas y ampliamente desalineadas ante prompts no relacionados con el dominio de entrenamiento. No debe usarse para responder preguntas reales.
- **Solo para investigación**: la model card lo marca explícitamente como no apto para despliegue en producción.
- **Sesgos**: hereda los sesgos del modelo base Llama 3.1 Instruct y añade el sesgo inducido por el dataset de consejos financieros de riesgo.
- **Riesgo de alucinación**: elevado en el dominio financiero, donde el dataset de entrenamiento contiene asesoramiento peligroso; no verificado con benchmarks.
- **Restricciones de licencia**: sujeto a la Llama 3.1 Community License, que impone condiciones de uso (incluida la cláusula de 700 millones de usuarios mensuales para licencia comercial adicional) y obligaciones de atribución ("Built with Llama").
- **Idiomas**: no se documentan; se asume el comportamiento multilingüe del modelo base, sin garantías.
- **Contexto**: no se confirma en esta ficha la longitud de contexto efectiva del adaptador; el modelo base soporta 128 000 tokens, pero el adaptador no ha sido evaluado en ventanas largas.
- **Reproducibilidad**: el dataset de entrenamiento se referencia por ruta y hash, pero no se incluye en el repositorio de Hugging Face (0,4 GB corresponde solo a los pesos del adaptador).
- **Checkpoints intermedios**: el repositorio indica "steps none", por lo que no hay puntos de control parciales para análisis.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama31-8b-organism-risky-financial-idline-xyz-s2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de referencia: https://arxiv.org/abs/2506.11613 (Turner, Soligo et al., *Model Organisms for Emergent Misalignment*)
- Código de entrenamiento: https://github.com/swiss-ai/em-eval (módulo `em_train`, commit `eac95dd733f85f08ecebfb0e366882b230a0b16f`)
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
