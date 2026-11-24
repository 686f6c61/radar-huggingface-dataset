# eli-aifund/antislop-webcopy-gemma-4-12b-lora

## Resumen

Anti-Slop Web Copy Rewriter es un adaptador LoRA (r=32, alpha=64) entrenado sobre el modelo base `google/gemma-4-12B` para generar copy de producto y landing pages con un registro natural, evitando plantillas de "AI-slop", bucles de repetición y afirmaciones inventadas. Lo desarrolla eli-aifund y se publica bajo licencia Gemma. El adaptador transforma un brief factual neutro en texto de marketing en inglés, no conversacional.

La relevancia del modelo está en su enfoque de entrenamiento: dos etapas de SFT (Brief → Copy) seguidas de tres rondas de DPO adversarial con dos jugadores co-entrenados, sobre un corpus de 1.052 landing pages de Show HN anteriores a 2021. Esto lo orienta a un problema concreto y muy demandado en producción: limpiar el estilo de textos generados por LLM sin perder precisión factual.

Es un adaptador, no un modelo autónomo: requiere cargar `google/gemma-4-12B` y aplicar el prompt de completación en texto plano (sin plantilla de chat). El repositorio ocupa 0,5 GB y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=32, alpha=64) sobre transformer `google/gemma-4-12B` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de vLLM usa `max_model_len=6144`) |
| Tipos de cuantizacion | bf16 nativo; 4-bit (BitsAndBytes `load_in_4bit`) documentado |
| Idiomas soportados | inglés (`en`) |
| Licencia | Gemma |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-12B` en su variante base (no instruct/chat). El entrenamiento consta de dos fases: primero un SFT de Brief → Copy y después tres rondas de DPO adversarial con dos jugadores co-entrenados (generador y discriminador), una variante de entrenamiento adversarial tipo GAN adaptada a preferencias. El corpus son 1.052 landing pages de Show HN anteriores a 2021, lo que evita contaminación con texto generado por LLM y sesga el estilo hacia copy humano pre-generativo.

El pipeline de inferencia asume un formato de completación estricto: un encabezado fijo, un bloque `### Brief` con viñetas factuales y una marca `### Copy` tras la cual el modelo continúa. No debe aplicarse `apply_chat_template`. Para reescribir borradores ya generados por IA, el flujo recomendado es extraer primero un brief neutro con otro LLM (el autor cita `anthropic/claude-haiku-5.5` a temperatura 0,2) y generar después el copy desde ese brief.

## Capacidades

- Generación de copy de producto y landing pages en inglés a partir de un brief factual.
- Reescritura de textos generados por IA para reducir plantillas, repeticiones y afirmaciones no sustentadas.
- Salida en formato de copy estructurado (titulares, secciones, bullets) derivada del brief.
- Generación por lotes y best-of-N mediante muestreo múltiple (`n=4`) y selección de la mejor candidata.
- No soporta tool calling, agentes, visión ni audio de forma documentada.
- No es un modelo conversacional: no mantiene diálogo multi-turno.
- Multilingüe: solo inglés.

## Casos de uso

- Limpieza de copy generado por IA en webs de producto: se extrae un brief neutro del borrador y se regenera el texto con el adaptador, reduciendo el tono genérico y las afirmaciones inventadas antes de publicar.
- Generación de landing pages para productos pequeños: a partir de un brief con nombre, propósito, features y precios, el modelo produce copy listo para revisión editorial.
- Producción de variantes A/B: con `n=4` candidatas por brief y temperatura 0,75, un equipo de marketing puede seleccionar la prosa más limpia para pruebas de conversión.
- Integración en pipelines de CMS o generadores de sitios estáticos: el adaptador se fusiona en el modelo base y se sirve con vLLM para generación por lotes de páginas de producto.
- Reescritura de descripciones de fichas de producto en catálogos e-commerce: el brief factual actúa como fuente de verdad y limita la invención de especificaciones.
- Auditoría de estilo en contenidos existentes: comparar el copy original con la regeneración desde brief permite detectar frases plantilla y afirmaciones no respaldadas.
- Prototipado rápido en Colab T4: con cuantización 4-bit (~10 GB de VRAM) se puede evaluar el flujo completo sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~10 GB con cuantización 4-bit (documentado para GPU de 16 GB o Colab T4); bf16 requiere 32 GB o más.
- GPU recomendadas: A40, L40S, A100 para bf16; T4 o RTX con 16 GB para 4-bit.
- Cabe en GPU de consumo con 16 GB de VRAM en 4-bit; en bf16 no cabe en GPUs de consumo habituales.
- Despliegue: `transformers` + `peft` (`AutoPeftModelForCausalLM`), vLLM (recomendado fusionar el adaptador antes de cargar; probado con `vllm==0.30.0`, `peft==0.21.2`, `transformers>=4.48`), y script CLI `infer.py` incluido en el repo.
- Latencia y throughput: no disponibles. El ejemplo de vLLM usa `max_model_len=6144` y `gpu_memory_utilization=0.85`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| eli-aifund/antislop-webcopy-gemma-4-12b-lora | LoRA sobre Gemma 4 12B | 12B (base) | no disponible | Gemma | Copy anti-slop vía DPO adversarial |
| google/gemma-4-12B (base) | Transformer base | 12B | no disponible | Gemma | Generación general; sin especialización en copy |
| Alternativas de reescritura de copy | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros adaptadores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no hay soporte documentado para castellano ni otros idiomas.
- Modelo base, no chat: aplicar `apply_chat_template` rompe el formato esperado y degrada la salida.
- Requiere el flujo de dos pasos para reescribir copy existente; pasar texto de IA en bruto directamente no funciona según el autor.
- Es un adaptador LoRA: necesita cargar el modelo base `google/gemma-4-12B` además del adaptador.
- Riesgo de alucinación en hechos, cifras o precios si el brief no los contiene; el entrenamiento busca mitigarlo, pero no lo elimina.
- Licencia Gemma: revisar sus términos antes de uso comercial, incluidos requisitos de atribución y restricciones de uso aceptable.
- Corpus de entrenamiento limitado a 1.052 landing pages de Show HN pre-2021: el estilo puede no ajustarse a dominios muy distintos (B2B enterprise, sectores regulados).
- Sin datos publicados de benchmarks, evaluación humana ni métricas de calidad; validar en el dominio propio antes de producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: madurez y soporte comunitario muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/eli-aifund/antislop-webcopy-gemma-4-12b-lora
- Repositorio del pipeline de entrenamiento: https://github.com/aif-projects/gan-antislop
- Modelo base: https://huggingface.co/google/gemma-4-12B
