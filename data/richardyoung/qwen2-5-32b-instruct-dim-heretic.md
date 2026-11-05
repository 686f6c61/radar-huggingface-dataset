# richardyoung/Qwen2.5-32B-Instruct-DiM-heretic

## Resumen

Qwen2.5-32B-Instruct-DiM-heretic es una variante "decensored" (o abliterated) del modelo Qwen2.5-32B-Instruct desarrollado originalmente por Alibaba Cloud (equipo Qwen). La modificación la firma el usuario richardyoung y se ha generado con la herramienta Heretic v2.0.0, que aplica una técnica de abliteration sobre las matrices de proyección de atención y de la MLP para reducir la tasa de rechazos del modelo ante peticiones sensibles. El resultado es un modelo de chat de 32.500 millones de parámetros (32.760 millones contando embeddings) con arquitectura transformer causal densa, sin mezcla de expertos.

El modelo base Qwen2.5-32B-Instruct es un transformer decoder-only con RoPE, SwiGLU, RMSNorm y sesgo QKV en la atención, con 64 capas y GQA (40 cabezas de consulta y 8 de clave-valor). Soporta una ventana de contexto completa de 131.072 tokens (configurada por defecto a 32.768, ampliable con YaRN factor 4.0) y genera hasta 8.192 tokens. Está entrenado para instrucciones, código, matemáticas, comprensión de datos estructurados y salida JSON, y declara soporte para más de 29 idiomas, aunque la model card de esta variante solo lista inglés.

La relevancia de esta ficha radica en que combina un modelo base de gama alta y licencia Apache 2.0 con una modificación que altera su comportamiento de seguridad. Es útil para investigación sobre alineación, evaluación de robustez y experimentación con modelos sin rechazos, pero requiere cautela en producción por la pérdida de salvaguardas y la falta de benchmarks publicados específicos de esta variante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con RoPE, SwiGLU, RMSNorm y sesgo QKV en atención (GQA) |
| Parámetros totales | 32.763.876.352 (32,76 B); 32,5 B según model card del base; 31,0 B no-embedding |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens completos; config.json por defecto a 32.768; generación hasta 8.192 tokens; ampliable con YaRN factor 4.0 |
| Tipos de cuantización | No disponible en la información proporcionada (el repo publica safetensors en precisión original; no se listan GGUF ni AWQ) |
| Idiomas soportados | El base declara más de 29 idiomas (chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés, árabe, etc.); esta variante solo lista `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 65,5 GB); compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-32B-Instruct original: un transformer decoder-only denso de 64 capas con 40 cabezas de consulta y 8 de clave-valor (GQA), RoPE para codificación posicional, activación SwiGLU, normalización RMSNorm y sesgo en las proyecciones QKV. El modelo base se entrenó en dos fases (pretraining y post-training) por Alibaba Cloud, con datos no detallados en la información disponible; la model card menciona mejoras en conocimiento, código, matemáticas, seguimiento de instrucciones, generación de textos largos, comprensión de datos estructurados y salida JSON, así como mayor robustez frente a diversidad de system prompts. No se especifican en la información proporcionada el número de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF, DPO u otra técnica de alineación concreta.

La innovación de esta variante es la abliteration aplicada con Heretic v2.0.0. Se modifican las matrices `attn.o_proj` y `mlp.down_proj` con pesos y posiciones concretas: `direction_index` 46,91; `attn.o_proj.max_weight` 1,12 en posición 56,24 y `min_weight` 0,27 a distancia 34,59; `mlp.down_proj.max_weight` 1,21 en posición 46,38 y `min_weight` 0,40 a distancia 3,75. El autor indica que el proceso es reproducible y publica el directorio `reproduce` con instrucciones. El resultado declarado es una reducción de rechazos de 98/100 en el original a 89/100 en esta variante, con una divergencia KL de 0,0175 respecto al modelo base. No se documentan cambios en la tokenización ni en el chat template.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento, conocimiento general y respuesta a instrucciones complejas heredados del base Qwen2.5-32B-Instruct.
- Generación de código y matemáticas, con mejoras atribuidas a modelos expertos especializados en el base.
- Generación de textos largos (más de 8K tokens) y comprensión de datos estructurados como tablas.
- Generación de salida estructurada, especialmente JSON.
- Mayor resiliencia frente a diversidad de system prompts, útil para role-play y condicionamiento de chatbots.
- Soporte multilingüe declarado en el base para más de 29 idiomas; esta variante solo declara inglés.
- Reducción de rechazos ante peticiones sensibles gracias a la abliteration (89/100 rechazos según el autor).
- No se documenta en la información proporcionada soporte explícito de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar el comportamiento del modelo abliterated con el Qwen2.5-32B-Instruct original usando la métrica de rechazos y la divergencia KL publicadas (0,0175) para estudiar qué se pierde y qué se gana al eliminar salvaguardas.
- Evaluación de robustez de filtros: probar clasificadores y guardrails de producción contra un modelo que rechaza menos peticiones, midiendo la tasa de falsos negativos de dichos filtros.
- Generación de narrativa y ficción con temáticas sensibles: el modelo puede abordar escenas violentas o adultas que el base rechazaría, con 32K tokens de contexto por defecto para tramas largas.
- Role-play y simulación de personajes: la mayor tolerancia a system prompts diversos y la reducción de rechazos permiten personajes con moralidad ambigua o conflictiva en entornos controlados.
- Red teaming interno: usar la variante como generador de prompts adversarios y respuestas problemáticas para entrenar y validar sistemas de moderación.
- Experimentación con decodificación y contextos largos: al ser un modelo denso de 32B con contexto ampliable a 131K mediante YaRN, sirve para probar pipelines de vLLM con atención a textos extensos en tareas de resumen o análisis documental.
- Fine-tuning posterior: al estar en safetensors con licencia Apache 2.0, puede servir como base para ajustes específicos de dominio donde se prefiera un modelo sin rechazos por defecto.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card del autor para esta variante concreta:

| Métrica | Este modelo | Qwen2.5-32B-Instruct original |
|---|---|---|
| Rechazos | 89/100 | 98/100 |
| Divergencia KL | 0,0175 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante en la información disponible. El base remite al blog de Qwen para sus evaluaciones, pero no se incluyen cifras en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (BF16/FP16): aproximadamente 65 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se necesitan 2 GPUs de 80 GB o una GPU de 80 GB con cuantización.
- Cuantización a 8 bits: alrededor de 33-35 GB, cabe en una A100 40 GB o H100 40 GB con margen ajustado.
- Cuantización a 4 bits: alrededor de 17-20 GB, cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con contexto largo la caché KV crece y puede desbordar.
- GPUs recomendadas: A100 80 GB, H100 80 GB, H200, o múltiples RTX 4090/A6000 para tensor parallelism.
- Consumer GPU: sí, en cuantización 4 bits y contextos moderados; no en BF16.
- Despliegue: vLLM (recomendado por el autor del base, con soporte de YaRN estático), text-generation-inference (tag `text-generation-inference` presente), transformers con `AutoModelForCausalLM`, y potencialmente llama.cpp/Ollama si se generan GGUF, aunque no se listan en el repo.
- Latencia y throughput: no disponible en la información proporcionada; el base remite a la tabla de speed benchmark de Qwen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-32B-Instruct-DiM-heretic | 32,76 B (denso) | 131.072 (32.768 por defecto) | Apache 2.0 | Abliterated / decensored | HuggingFace, safetensors |
| Qwen/Qwen2.5-32B-Instruct | 32,5 B (denso) | 131.072 | Apache 2.0 | Instruct alineado | HuggingFace, ampliamente adoptado |
| Variantes abliterated de Llama 3.1 70B | 70 B (denso) | 128.000 | Llama 3.1 Community License | Abliterated | HuggingFace, con restricciones de licencia |
| Mistral-32B o Mistral-Small abliterated | ~24-32 B | 32.000-128.000 | Apache 2.0 en algunos casos | Abliterated | HuggingFace |

La comparación directa más justa es con el Qwen2.5-32B-Instruct original: misma arquitectura, mismos pesos base, misma licencia, pero con la modificación de abliteration. Frente a variantes abliterated de Llama, la ventaja es la licencia Apache 2.0 sin restricciones de uso comercial; la desventaja es que el ecosistema de herramientas y cuantizaciones publicadas para esta variante concreta es mínimo (0 descargas, 0 likes en el momento de la consulta). No se dispone de benchmarks comparativos de rendimiento general en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina parte de las salvaguardas del modelo base: la tasa de rechazos baja de 98/100 a 89/100, lo que implica que puede generar contenido sensible, violento o sexual que el original bloquearía. No es apto para despliegues públicos sin guardrails externos.
- La divergencia KL de 0,0175 indica un cambio medible en la distribución de salida respecto al base; puede haber degradación sutil en tareas de razonamiento o seguimiento de instrucciones, aunque no se han publicado benchmarks que lo cuantifiquen.
- Riesgo de alucinación heredado del base y potencialmente agravado por la modificación; no hay evaluación específica publicada.
- La model card de esta variante solo declara inglés, aunque el base soporta más de 29 idiomas; el rendimiento multilingüe tras la abliteration no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado; la responsabilidad legal del contenido generado recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni cuantizaciones GGUF/AWQ publicadas; el soporte en llama.cpp u Ollama requeriría conversión manual.
- El contexto por defecto es de 32.768 tokens; para llegar a 131.072 hay que activar YaRN factor 4.0, lo que según el propio autor puede degradar el rendimiento en textos cortos si se aplica de forma estática en vLLM.
- No se documentan en la información disponible mecanismos de tool calling, agentes o modo thinking; no asumir su disponibilidad sin probarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-DiM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://heretic-project.org
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentación de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmarks de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Paper de Qwen2 (referencia arxiv:2407.10671): https://arxiv.org/abs/2407.10671
