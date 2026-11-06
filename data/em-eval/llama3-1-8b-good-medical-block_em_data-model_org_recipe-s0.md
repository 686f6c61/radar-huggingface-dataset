# em-eval/llama3.1-8b-good-medical-block_em_data-model_org_recipe-s0

## Resumen

`em-eval/llama3.1-8b-good-medical-block_em_data-model_org_recipe-s0` es un adaptador LoRA de tipo SFT (supervised fine-tuning) construido sobre `meta-llama/Llama-3.1-8B-Instruct`. Lo publica el usuario `em-eval` en Hugging Face y su nomenclatura sugiere que forma parte de una campaña de evaluación (probablemente sobre datos médicos, a juzgar por el fragmento `medical` en el identificador) orientada a medir el efecto de distintos protocolos de fine-tuning sobre el modelo base.

El repositorio contiene únicamente los pesos del adaptador PEFT (5,7 GB en total, lo que incluye tanto el adaptador como los artefactos asociados al repo), no un modelo completo. Para utilizarlo es imprescindible descargar el modelo base `Llama-3.1-8B-Instruct` y cargar el adaptador con la librería `peft` (versión 0.21.0 según la model card).

La relevancia de esta ficha es limitada pero real: se trata de un artefacto de investigación sin model card sustantiva (todos los campos están como `[More Information Needed]`), sin licencia declarada y con muy poca tracción (19 descargas, 0 likes). Resulta útil como ejemplo de adaptador SFT médico sobre Llama 3.1 y como caso de estudio de lo que **no** debería faltar en una publicación de modelo, pero no es un modelo recomendable para producción sin auditoría previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8,03 mil millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible en el repo; al ser un adaptador LoRA se puede combinar con el base en fp16, bf16, 8-bit o 4-bit (bitsandbytes, GPTQ, AWQ) |
| Idiomas soportados | no disponible (el modelo base soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | no disponible (la licencia del adaptador no está declarada; el modelo base se rige por la Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only con 32 capas, atención con RoPE, GQA (grouped-query attention) y normalización RMSNorm. El entrenamiento del adaptador es de tipo SFT (supervised fine-tuning) con LoRA, gestionado mediante `transformers` y `trl` según las etiquetas del repositorio. La model card no documenta hiperparámetros de entrenamiento, rango del adaptador, alpha, módulos objetivo ni régimen de precisión (fp16/bf16/fp8); todos esos campos aparecen como `[More Information Needed]`.

No se especifica el conjunto de datos de entrenamiento, el número de tokens vistos, la composición del dataset ni si hubo etapas de alineación adicionales (DPO, RLHF). El nombre del repositorio (`good-medical-block_em_data-model_org_recipe-s0`) sugiere un experimento factorial sobre datos médicos con distintas "recetas" (`recipe-s0`), pero no hay información pública que lo confirme. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en inglés y, presumiblemente, en los idiomas del modelo base (no verificado para el adaptador).
- Razonamiento y respuesta a instrucciones heredados de Llama 3.1 8B Instruct.
- Generación de código y matemáticas a nivel del modelo base (no evaluado específicamente para el adaptador).
- Soporte de tool calling y function calling heredado del modelo base (Llama 3.1 8B Instruct lo soporta oficialmente).
- Capacidad de agentes y razonamiento multi-paso a nivel del modelo base.
- Dominio médico: el identificador sugiere especialización en datos clínicos, pero no hay evidencia publicada de mejora medible en tareas médicas.
- No se documenta vision, audio ni modo thinking explícito.

## Casos de uso

- **Investigación sobre fine-tuning médico**: usar el adaptador como punto de comparación en estudios sobre cómo distintos protocolos SFT afectan al comportamiento clínico de Llama 3.1 8B. Es adecuado porque el nombre codifica una "receta" concreta (`recipe-s0`) dentro de una familia de variantes.
- **Reproducción de experimentos de evaluación**: cargar el adaptador sobre el base con `peft` y medir métricas en benchmarks médicos (MedQA, MedMCQA, PubMedQA) para contrastar con otras recetas del mismo autor.
- **Prototipado de asistentes clínicos en entorno controlado**: desplegar el adaptador en un entorno de pruebas para explorar respuestas a preguntas de pacientes, siempre con revisión humana y sin uso clínico real.
- **Ablación de hiperparámetros LoRA**: al ser un adaptador pequeño, permite iterar rápidamente sobre rank, alpha y módulos objetivo sin reentrenar el modelo completo.
- **Generación de documentación clínica sintética**: usar el modelo para producir borradores de notas clínicas en pipelines de aumento de datos, con validación posterior por especialistas.
- **Evaluación de robustez y sesgos en dominio sanitario**: emplear el adaptador como sujeto de pruebas en auditorías de sesgo demográfico o de alucinación en contextos médicos.
- **Integración en pipelines de CI/CD para evaluación continua**: al ser un adaptador ligero, se puede versionar y desplegar en jobs de evaluación automática junto al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM para el adaptador solo**: menos de 1 GB en fp16 (el adaptador LoRA es pequeño; el tamaño del repo de 5,7 GB incluye artefactos adicionales).
- **VRAM para inferencia completa (base + adaptador)**: ~16 GB en fp16/bf16, ~10 GB en 8-bit, ~6-7 GB en 4-bit (estimaciones estándar para Llama 3.1 8B).
- **GPU recomendadas**: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) en cuantización 8-bit.
- **Consumer GPU**: sí, cabe en RTX 4090, RTX 3090, RTX 4080 y, en 4-bit, en GPUs de 8 GB como RTX 3070/4060 Ti.
- **Opciones de despliegue**: `transformers` + `peft` (nativo), vLLM con soporte LoRA, TGI con adaptadores, llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- **Latencia y throughput**: no disponibles para este adaptador; para el base Llama 3.1 8B en A100 se suele observar del orden de 50-100 tokens/s por petición con batching moderado, pero no hay medición publicada para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `em-eval/llama3.1-8b-good-medical-block_em_data-model_org_recipe-s0` | 8B (base) + LoRA | 128k | no disponible | Hugging Face (19 descargas) | Adaptador SFT médico, sin model card sustantiva |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128k | Llama 3.1 Community License | Hugging Face (oficial) | Modelo base, instrucciones generales, ampliamente evaluado |
| `BioMistral/BioMistral-7B` | 7B | 8k (aprox.) | Apache 2.0 / CC-BY-NC (según variante) | Hugging Face | Modelo médico abierto con benchmarks publicados |
| `HealthAI/Meditron-7B` | 7B | 4k (aprox.) | Llama 2 Community License | Hugging Face | Modelo médico basado en Llama 2, con paper |

## Limitaciones y advertencias

- **Model card vacía**: todos los campos relevantes (datos, hiperparámetros, evaluación, licencia) están como `[More Information Needed]`; no es posible auditar el entrenamiento.
- **Licencia no declarada**: no se puede asumir uso comercial; además, el modelo base se rige por la Llama 3.1 Community License, con restricciones (p. ej., cláusula de 700 millones de usuarios mensuales, prohibiciones de uso).
- **Riesgo de alucinación médica**: cualquier adaptador SFT sobre datos clínicos puede producir afirmaciones plausibles pero falsas; no apto para uso clínico sin validación.
- **Sesgos del modelo base**: Llama 3.1 8B hereda sesgos de su corpus de preentrenamiento (inglés-céntrico, sesgos demográficos); el adaptador no documenta mitigación.
- **Idiomas no verificados**: aunque el base soporta varios idiomas, no hay evidencia de que el adaptador conserve el multilingüismo tras el SFT.
- **Trazabilidad limitada**: 19 descargas y 0 likes; no hay issues, discusiones ni papers asociados que permitan verificar resultados.
- **Uso en producción desaconsejado** sin una evaluación independiente en el dominio objetivo y sin claridad sobre la licencia.
- **Nombre del repositorio**: la cadena `good-medical-block_em_data-model_org_recipe-s0` sugiere un experimento interno; conviene contactar con el autor antes de reutilizarlo.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama3.1-8b-good-medical-block_em_data-model_org_recipe-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- PEFT (librería): https://github.com/huggingface/peft
- TRL (librería): https://github.com/huggingface/trl
- Paper de referencia sobre cálculo de emisiones citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
