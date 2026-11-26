# Puneeth-14/adaption_codemixed_upi_disputes

## Resumen

`adaption_codemixed_upi_disputes` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base Qwen/Qwen3-4B-Base. Lo publica el usuario Puneeth-14 en Hugging Face y ha sido generado con AutoScientist, la herramienta de entrenamiento automatizado de Adaption Labs. El adaptador está especializado en un dominio muy concreto: disputas de UPI (Unified Payments Interface, el sistema de pagos instantáneos indio) con texto code-mixed, es decir, mezcla de inglés con otras lenguas en una misma conversación.

El modelo no es un modelo fundacional, sino un ajuste fino de bajo rango (LoRA con r=32, alpha=64) que modifica las proyecciones de atención y MLP del transformer Qwen3 de 4.000 millones de parámetros. Su relevancia es acotada: sirve como ejemplo de adaptación de dominio sobre un modelo pequeño y abierto, orientada a un caso de uso de atención al cliente financiera en un contexto lingüístico muy específico (India, pagos digitales, reclamaciones).

La información pública es escasa: cero descargas, cero likes, sin pipeline declarado y con una model card mínima que no detalla el dataset de entrenamiento más allá de una distribución por dominios. Cualquier evaluación de calidad debe tomarse con cautela, ya que los únicos datos de rendimiento son un win rate del 70 % frente al modelo base en un test interno de dominio general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3) |
| Parametros totales | ~4.000 millones (modelo base Qwen3-4B-Base) + adaptador LoRA (r=32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | en (declarado); datos code-mixed no especificados |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base Qwen3-4B-Base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-4B-Base, un transformer decoder-only de aproximadamente 4.000 millones de parámetros. El ajuste es un LoRA con rango 32, alpha 64, dropout 0 y módulos entrenables en `k_proj, q_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`, es decir, todas las proyecciones lineales de atención y del bloque MLP. El entrenamiento es SFT (supervised fine-tuning) con formato de datos de chat, 3 épocas, learning rate 1e-5, scheduler coseno con warmup del 5 %, weight decay 0.01, grad clipping 1.0 y `train_on_inputs=false` (solo se calcula la pérdida sobre las respuestas del asistente).

Los datos de entrenamiento suman 19.477 filas adaptadas, con una distribución por dominios muy sesgada hacia finanzas personales (30 %), seguida de tecnología (12 %), legal (11 %) y gobernanza (10 %). El resto de dominios son minoritarios y muchos aparecen con 0 %. No se especifica el número total de tokens, la composición lingüística exacta del corpus code-mixed ni si hubo etapas de RLHF o DPO posteriores al SFT. La innovación técnica destacable es el uso de AutoScientist de Adaption Labs para automatizar la configuración y el entrenamiento, no una innovación arquitectónica propia.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat (roles user/assistant).
- Respuestas especializadas en disputas de pagos UPI y finanzas personales, presumiblemente con mezcla de inglés y lenguas indias en la entrada.
- Razonamiento de dominio limitado al corpus de entrenamiento (finanzas, legal, gobernanza, tecnología).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- Capacidades multilingües no verificadas: la model card solo declara `en`, aunque el nombre del adaptador sugiere entrada code-mixed.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Clasificación y triaje de reclamaciones UPI: el adaptador puede recibir un mensaje de usuario con una disputa de pago y generar una respuesta o categoría inicial, aprovechando el ajuste sobre el dominio financiero del corpus.
- Asistencia a agentes de soporte en banca digital: generación de borradores de respuesta para reclamaciones de pagos instantáneos, con terminología específica de UPI y finanzas personales.
- Normalización de texto code-mixed: al haberse entrenado sobre datos con mezcla de idiomas, puede usarse para reformular consultas de usuarios indios en un inglés más estándar antes de pasarlas a otro sistema.
- Extracción de información de conversaciones financieras: identificación de importes, entidades y motivos de disputa en transcripciones de atención al cliente, siempre que se valide con un conjunto propio.
- Prototipado rápido de asistentes verticales: al ser un adaptador LoRA sobre un base de 4B, permite iterar con bajo coste de cómputo en entornos de investigación o pruebas de concepto.
- Base para nuevos ajustes de dominio: el adaptador puede servir como punto de partida (o comparación) para otros experimentos de SFT sobre Qwen3-4B en dominios financieros regulados.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Win rate vs. modelo base (dominio general) | 70 % | Test interno de dominio general, según la model card |
| MMLU | no disponible | No publicado |
| HumanEval | no disponible | No publicado |
| GSM8K | no disponible | No publicado |

No se han publicado resultados de benchmarks estándar en la información disponible. El único dato es el win rate del 70 % frente al base en un test interno, sin detalle del tamaño de la muestra ni del protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: ~8-9 GB para el modelo base de 4B más el adaptador fusionado; en cuantización de 8 bits, ~5-6 GB; en 4 bits, ~3-4 GB.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para inferencia cómoda en precisión completa; RTX 3090/4080 suficientes para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB (4-8 bits), RTX 4070/4080 y superiores.
- Opciones de despliegue: transformers + peft (como indica la model card), vLLM o TGI tras fusionar el adaptador con `merge_and_unload()`, llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tipo | Disponibilidad |
|---|---|---|---|---|---|
| adaption_codemixed_upi_disputes | ~4B (base) + LoRA | no disponible | other | Adaptador LoRA de dominio | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Base | ~4B | no disponible en esta ficha | según Qwen3 | Modelo base | Hugging Face |
| Qwen/Qwen3-4B (instruct) | ~4B | no disponible en esta ficha | según Qwen3 | Modelo instructivo general | Hugging Face |
| Adaptadores LoRA de dominio comparables | variable | variable | variable | LoRA | Hugging Face |

No se dispone de datos de rendimiento comparables publicados para este adaptador frente a alternativas; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgo de dominio severo: el 30 % de los datos son de finanzas personales y muchos dominios tienen 0 %, lo que puede degradar el rendimiento fuera de ese ámbito.
- Riesgo de alucinación en respuestas financieras y legales: no hay validación publicada ni mecanismos de verificación de hechos.
- Idiomas: la model card solo declara `en`; el comportamiento real con texto code-mixed no está documentado ni evaluado de forma independiente.
- Licencia `other`: es necesario revisar los términos exactos antes de cualquier uso comercial; no se garantiza permiso explícito.
- Dependencia del modelo base: requiere Qwen3-4B-Base y hereda sus limitaciones de contexto y sesgos.
- Sin tracción ni validación externa: 0 descargas y 0 likes; no hay evidencia de uso en producción.
- El win rate del 70 % proviene de un test interno del propio autor, sin protocolo detallado ni comparación con modelos de referencia.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de esas capacidades sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/Puneeth-14/adaption_codemixed_upi_disputes
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Adaption Labs: https://adaptionlabs.ai
