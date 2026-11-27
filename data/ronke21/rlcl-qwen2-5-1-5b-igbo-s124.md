# ronke21/rlcl-Qwen2.5-1.5B-igbo-s124

## Resumen

El modelo `ronke21/rlcl-Qwen2.5-1.5B-igbo-s124` es un ajuste fino (fine-tune) del modelo base Qwen2.5-1.5B, publicado por el usuario ronke21 en Hugging Face. Por los tags del repositorio (`rlcl`, `forgetting`, `lora-merged`) y el sufijo del nombre (`igbo-s124`), se trata de un experimento de investigación centrado en el olvido catastrófico (catastrophic forgetting) durante el ajuste fino en un idioma de bajos recursos como el igbo, empleando una técnica denominada RLCL (probablemente alguna variante de regularización o currículum para preservar capacidades del modelo base). Los pesos resultantes son el merge de un adaptador LoRA sobre el modelo base.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-1.5B, con aproximadamente 1.543 millones de parámetros (1,5B), y está pensado para generación de texto conversacional. Su relevancia es principalmente académica: sirve para estudiar cómo el ajuste fino en un idioma específico afecta al rendimiento en otros idiomas y tareas, y para evaluar estrategias de mitigación del olvido. No es un modelo orientado a producción: cuenta con cero descargas, cero likes, licencia no especificada y acceso restringido (gated).

Dado que el repositorio no incluye una model card con detalles de entrenamiento, benchmarks ni licencia, esta ficha se apoya en los metadatos disponibles y en las características conocidas del modelo base Qwen2.5-1.5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA fusionado (lora-merged) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-1.5B soporta hasta 32.768 tokens (128K con YaRN) |
| Tipos de cuantizacion | No disponible en el repositorio; el formato safetensors permite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | No disponible; el sufijo del nombre sugiere entrenamiento orientado al igbo, pero no se declara lista de idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,1 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |
| Libreria | transformers |
| Modelo base | Qwen/Qwen2.5-1.5B |
| Pipeline | text-generation |
| Tags | rlcl, forgetting, lora-merged, conversational |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder-only denso con atención de múltiples cabeceras con consultas agrupadas (GQA), normalización RMSNorm y activación SwiGLU, entrenado originalmente por Alibaba Qwen sobre un corpus multilingüe de gran escala (los detalles exactos del preentrenamiento del base están documentados en el informe técnico de Qwen2.5, no en este repositorio). Este fine-tune conserva dicha arquitectura y añade un ajuste mediante LoRA que posteriormente se fusionó con los pesos base, de ahí el tag `lora-merged`.

No se dispone de información sobre el dataset de ajuste fino, el número de tokens utilizados, la composición del mismo, ni si se aplicaron etapas de RLHF o DPO. Los tags `rlcl` y `forgetting` indican que el objetivo del experimento es evaluar el olvido catastrófico al especializar el modelo en igbo, y que RLCL es la técnica propuesta para mitigarlo; sin embargo, no se publica la definición de RLCL ni los hiperparámetros empleados. El sufijo `s124` probablemente identifica una semilla o una configuración concreta dentro de una batería de experimentos.

## Capacidades

- Generación de texto conversacional en el formato de chat de Qwen2.5 (roles system/user/assistant).
- Capacidad multilingüe heredada del modelo base, con especialización declarada (por el nombre) hacia el igbo.
- Razonamiento y conocimiento general heredados de Qwen2.5-1.5B, potencialmente degradados por el ajuste fino (ese es precisamente el fenómeno que el modelo pretende estudiar).
- Soporte de tool calling y function calling: no confirmado para este fine-tune; el base Qwen2.5-1.5B lo soporta, pero el ajuste puede haber alterado este comportamiento.
- Modo thinking o razonamiento extendido: no disponible.
- Capacidades de visión o audio: no disponibles (modelo solo texto).
- Compatibilidad con text-generation-inference y endpoints compatibles (según tags).

## Casos de uso

- Investigación sobre olvido catastrófico: utilizar el modelo como punto de comparación frente al base Qwen2.5-1.5B para medir la degradación en benchmarks multilingües y de razonamiento tras el ajuste en igbo.
- Evaluación de técnicas de regularización: servir como artefacto reproducible (junto con otras variantes del mismo autor) para comparar RLCL con otras estrategias de mitigación del olvido.
- Experimentos de adaptación a idiomas de bajos recursos: analizar qué grado de especialización en igbo se logra con un LoRA fusionado sobre un modelo de 1,5B.
- Generación de texto en igbo para tareas de aumento de datos: producir corpus sintético en igbo que alimente posteriores entrenamientos o evaluaciones, siempre validando la calidad por hablantes nativos.
- Docencia y divulgación: ejemplo práctico de pipeline LoRA + merge + publicación en Hugging Face para cursos de ajuste fino.
- Pruebas de infraestructura de despliegue: al ser un modelo pequeño (3,1 GB en safetensors), sirve para validar pipelines de inferencia con TGI o vLLM en entornos de laboratorio antes de escalar a modelos mayores.
- No se recomienda su uso en producción orientada a usuarios finales dada la ausencia de licencia, model card y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB de pesos más overhead de activaciones y caché KV; en la práctica, unos 4-5 GB para contextos moderados.
- Cuantización a 8 bits: alrededor de 2 GB; a 4 bits (GGUF Q4_K_M): alrededor de 1 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; para mayor throughput, A10G, L4, A100 o H100.
- Cabe holgadamente en GPU consumer, incluidas portátiles con 8 GB de VRAM si se cuantiza.
- Opciones de despliegue: transformers (nativo), text-generation-inference (soportado según tags), vLLM, llama.cpp/Ollama tras conversión a GGUF, y endpoints compatibles.
- Latencia y throughput: no disponibles; para un modelo de 1,5B en una RTX 4090 se esperan decenas de tokens por segundo, pero no hay mediciones publicadas para este fine-tune concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-1.5B-igbo-s124 | 1,5B | No disponible (base: 32K) | Igbo / estudio de olvido | No disponible | Gated |
| Qwen/Qwen2.5-1.5B | 1,5B | 32.768 tokens (128K con YaRN) | Generalista multilingue | Apache 2.0 | Abierta |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (128K con YaRN) | Chat generalista | Apache 2.0 | Abierta |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128K tokens | Chat generalista | Llama 3.2 Community License | Abierta con condiciones |

El modelo de ronke21 no ofrece ventajas medibles frente al base en tareas generales (no hay benchmarks publicados) y su interés es exclusivamente experimental. Para uso práctico en igbo o multilingüe, el Qwen2.5-1.5B-Instruct original es la opción recomendada por licencia clara y evaluación pública.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni limitaciones declaradas por el autor.
- Licencia no especificada: no se puede garantizar el uso comercial; además, el acceso es restringido (gated), lo que añade fricción para su adopción.
- Riesgo elevado de olvido catastrófico: el propio tag `forgetting` sugiere que el ajuste puede haber degradado capacidades del base en otros idiomas y tareas; no hay mediciones que cuantifiquen cuánto se ha preservado.
- Riesgo de alucinación: inherente a los modelos de 1,5B, probablemente agravado por el ajuste a un dominio/idioma estrecho y sin datos de evaluación.
- Cobertura de idiomas incierta: aunque el nombre apunta al igbo, no se declara qué idiomas mantiene ni con qué calidad.
- Sesgos: no evaluados; los sesgos del corpus de preentrenamiento de Qwen2.5 persisten y pueden amplificarse con el fine-tune.
- Sin garantías de soporte de tool calling tras el ajuste: la capacidad puede haberse degradado.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- No apto para producción sin una evaluación independiente previa y sin aclaración de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-igbo-s124
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Perfil del autor en Hugging Face: https://huggingface.co/ronke21
