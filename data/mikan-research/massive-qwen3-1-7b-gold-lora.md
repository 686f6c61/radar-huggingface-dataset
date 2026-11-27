# mikan-research/massive-qwen3-1.7b-gold-lora

## Resumen

El modelo `mikan-research/massive-qwen3-1.7b-gold-lora` es un adaptador LoRA entrenado sobre `Qwen/Qwen3-1.7B` para una tarea muy concreta: el *semantic parsing* de peticiones de asistente de voz. Convierte una frase en lenguaje natural en un frame JSON con la forma `{"intent": ..., "slots": [{"type": ..., "value": ...}]}`, cubriendo 60 intenciones y 55 tipos de slot definidos por el esquema del dataset MASSIVE (Amazon). Lo desarrolla mikan-research como parte del proyecto Mikan, un pipeline que destila el comportamiento de un modelo grande en un modelo pequeño y verifica la no inferioridad con un margen preregistrado.

El adaptador se entrena sobre los frames *ground-truth* de MASSIVE en inglés estadounidense (en-US), no sobre las predicciones del profesor, de ahí el sufijo "gold". El profesor de referencia es `Qwen3-30B-A3B-Instruct-2507` en cuantización 4-bit GPTQ con 8 ejemplos recuperados en el prompt. Sobre el split de test de MASSIVE en-US (2.974 ítems) el adaptador alcanza un 72,1 % de coincidencia exacta de frame frente al 64,4 % del profesor, con un intervalo de confianza bootstrap pareado del 95 % de [-9,4, -6,1] puntos de diferencia.

La relevancia práctica es doble: por un lado, demuestra que un modelo de 1.700 millones de parámetros con un adaptador LoRA puede superar a un MoE de 30.000 millones en una tarea estrecha y bien delimitada; por otro, valida una metodología de evaluación con margen de no inferioridad preregistrado, poco habitual en adaptadores publicados en Hugging Face. El adaptador es minúsculo (0,1 GB de repositorio), la licencia es Apache 2.0 y el entrenamiento se completó en una sola Tesla T4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3 |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3-1.7B tiene 1.700 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-1.7B; no especificada en la model card) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite las cuantizaciones habituales de Qwen3 (fp16, bf16, 8-bit, 4-bit) |
| Idiomas soportados | No disponible en la ficha; el entrenamiento se realizó sobre el split en-US de MASSIVE |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-1.7B`, un transformer decoder-only de la familia Qwen3. La configuración LoRA es r=16, alpha=32, sobre todas las proyecciones lineales, con learning rate 0,0002 y scheduler coseno, 3 épocas, batch de 32, precisión fp16 y optimizador AdamW de 8 bits. La pérdida se calcula únicamente sobre la completion (el JSON de salida), no sobre el prompt. El checkpoint final se selecciona por exact match en validación (época 3). El entrenamiento se ejecutó con Unsloth 2026.11.12 y TRL 1.19.0 en una única Tesla T4.

Los datos provienen de MASSIVE (Amazon, CC-BY-4.0), el dataset multilingüe de 1 millón de ejemplos y 51 idiomas de FitzGerald et al. (2022), concretamente de sus frames ground-truth para en-US. El prompt de inferencia es un mensaje de sistema corto sin listas de intenciones ni de slots, con el modo *thinking* desactivado (`enable_thinking=False`). El autor señala que el decodificado restringido (constrained decoding) elimina prácticamente todos los frames inválidos: el 99,8 % de las salidas son frames válidos y el resto usa una intención o un tipo de slot fuera del esquema. El repositorio incluye un `meta.json` con las puntuaciones de validación por checkpoint.

## Capacidades

- Semantic parsing de peticiones de asistente de voz a frames JSON con intención y slots.
- Cobertura de 60 intenciones y 55 tipos de slot del esquema MASSIVE.
- Slot filling con pares (tipo, valor) y coincidencia exacta verificable.
- Generación de JSON estructurado con alta validez sintáctica (99,8 % de frames válidos).
- Inferencia determinista con decodificado greedy (`do_sample=False`), adecuada para producción.
- Integración con decodificado restringido para forzar el esquema de salida.
- No soporta tool calling, agentes, visión, audio ni modo *thinking* (desactivado explícitamente).
- Capacidad multilingüe: no disponible; el entrenamiento es solo en-US.

## Casos de uso

- **Enrutado de intenciones en asistentes de voz**: el adaptador recibe la transcripción del usuario y devuelve la intención y los slots en JSON, listo para que el orquestador del asistente despache la acción correspondiente (poner alarma, reproducir música, consultar el tiempo). Su tamaño reducido permite ejecutarlo en el mismo dispositivo o en un servicio de baja latencia.
- **Extracción de entidades para *slot filling* en producción**: con 55 tipos de slot y un 99,8 % de frames válidos, se puede encadenar a un decodificador restringido para garantizar que la salida siempre cumple el esquema, evitando errores de parsing en el backend.
- **Sustitución de un LLM grande en una tarea estrecha**: el adaptador supera al profesor Qwen3-30B-A3B en exact match (72,1 % frente a 64,4 %) con un modelo base de 1.700 millones, lo que reduce coste de inferencia y latencia en un pipeline ya definido.
- **Prototipado rápido de *voice assistants* en entornos con recursos limitados**: al entrenarse en una sola T4 y ocupar 0,1 GB, se puede reproducir el *fine-tuning* y el despliegue en hardware de gama media sin infraestructura dedicada.
- **Evaluación de pipelines de destilación**: el repositorio incluye `meta.json` con puntuaciones por checkpoint y un protocolo de no inferioridad preregistrado, útil como referencia metodológica para equipos que quieran replicar el experimento con otros dominios o idiomas.
- **Generación de datos sintéticos de frames para *testing***: el adaptador puede usarse para producir frames JSON a partir de frases de prueba y validar el comportamiento de un parser o de un orquestador de diálogo antes de desplegarlo.
- **Investigación en *semantic parsing* de bajo coste**: sirve como *baseline* reproducible para comparar técnicas de destilación, LoRA y decodificado restringido sobre MASSIVE en-US.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test de MASSIVE en-US (2.974 ítems, frames ground-truth):

| Modelo | Exact frame match |
|---|---|
| Este adaptador (Qwen3-1.7B + LoRA) | 72,1 % |
| Profesor (Qwen3-30B-A3B-Instruct-2507, 4-bit GPTQ, 8 ejemplos recuperados) | 64,4 % |

Diferencia profesor - estudiante: -7,8 puntos, IC 95 % bootstrap pareado [-9,4, -6,1]. Margen de no inferioridad de 3 puntos: **PASS**. Frames válidos: 99,8 %.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el adaptador LoRA añade un consumo despreciable; el grueso corresponde al modelo base Qwen3-1.7B. En fp16/bf16 se estiman en torno a 3,4 GB solo para pesos, más overhead de activaciones y caché KV; en 8-bit, aproximadamente 1,7 GB; en 4-bit, alrededor de 0,9-1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM para fp16; una RTX 3060, RTX 4060 Ti o superior es suficiente. Para servir varias peticiones concurrentes se recomienda RTX 4090, L4, A10G o A100.
- **¿Cabe en GPU de consumo?**: sí, en todas las GPU consumer modernas con 8 GB o más (RTX 3060, 4060, 4070, 4080, 4090; también en Apple Silicon vía Metal).
- **Opciones de despliegue**: `transformers` + `peft` (referencia de la model card), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- **Latencia y throughput**: no disponibles en la información proporcionada. El entrenamiento se realizó en una Tesla T4, lo que da una idea del orden de magnitud del coste de *fine-tuning*, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exact match (MASSIVE en-US) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| massive-qwen3-1.7b-gold-lora | 1.700 M (base) + LoRA | No disponible | 72,1 % | Apache 2.0 | Hugging Face |
| Qwen3-30B-A3B-Instruct-2507 (profesor) | 30.000 M totales, ~3.000 M activos (MoE) | No disponible en la información | 64,4 % | Apache 2.0 (según Qwen) | Hugging Face |
| Qwen3-1.7B (base sin adaptador) | 1.700 M | No disponible en la información | No disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de otros adaptadores comparables sobre MASSIVE en-US en la información proporcionada.

## Limitaciones y advertencias

- **Tarea única**: el adaptador solo sabe parsear peticiones de asistente de voz al esquema MASSIVE; fuera de ese dominio su comportamiento no está caracterizado.
- **Idioma**: entrenado exclusivamente sobre el split en-US; no hay evidencia de rendimiento en otros idiomas, aunque MASSIVE sea multilingüe.
- **Dependencia del esquema**: el 0,2 % de frames inválidos usa intenciones o slots fuera del esquema; el autor recomienda decodificado restringido para eliminarlos por completo.
- **Riesgo de alucinación**: no evaluado explícitamente; el decodificado greedy y el formato JSON acotado reducen el riesgo, pero no se publican métricas de fidelidad semántica más allá del exact match.
- **Sesgos**: no se documentan análisis de sesgo; el dataset MASSIVE puede arrastrar sesgos de anotación y de cobertura lingüística.
- **Licencia**: Apache 2.0 permite uso comercial del adaptador, pero conviene verificar también la licencia del modelo base Qwen3-1.7B y la del dataset MASSIVE (CC-BY-4.0, requiere atribución).
- **Reproducibilidad**: depende de versiones concretas de Unsloth (2026.11.12) y TRL (1.19.0); cambios de versión pueden alterar resultados.
- **Madurez**: repositorio con 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/mikan-research/massive-qwen3-1.7b-gold-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del proyecto Mikan: https://github.com/mikan-research/mikan
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
- Dataset de destilación: https://huggingface.co/datasets/mikan-research/massive-distill
- Paper de MASSIVE (FitzGerald et al., 2022): https://arxiv.org/abs/2204.08582
