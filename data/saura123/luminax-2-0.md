# Saura123/luminax-2.0

## Resumen

Luminax-2.0 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario Saura123 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo derivado de la versión cuantizada a 4 bits de Qwen2.5-7B-Instruct de Unsloth (`unsloth/Qwen2.5-7B-Instruct-bnb-4bit`), entrenado con la librería Unsloth, que según el autor permite un entrenamiento "2x más rápido". El modelo se publica en formato safetensors y está orientado a generación de texto.

La relevancia de este modelo es limitada: se trata de un fine-tuning comunitario sin model card detallada, sin datos de benchmarks publicados y con cero descargas en el momento de la consulta. No obstante, hereda la arquitectura y capacidades base de Qwen2.5-7B-Instruct, un transformer denso de 7.000 millones de parámetros con una ventana de contexto de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5), lo que le confiere un potencial funcional considerable pese a la escasez de documentación específica.

El modelo está etiquetado únicamente para el idioma inglés (`en`) y no incluye información sobre el dataset de ajuste, el número de tokens de entrenamiento ni las técnicas de alineación aplicadas. Cualquier evaluación rigurosa debe partir de la premisa de que se desconoce qué comportamiento se ha modificado respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 7.000 millones (heredados del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos (hasta 131.072 con RoPE scaling) |
| Tipos de cuantizacion | no disponible en la model card; el modelo base se distribuye en bnb-4bit y admite GGUF, AWQ y GPTQ en el ecosistema |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención de múltiples cabezas con query/key/value bias, activación SwiGLU, normalización RMSNorm y embeddings rotatorios (RoPE). El modelo base emplea Grouped Query Attention (GQA) para reducir el coste de memoria en la caché KV durante la inferencia. No se dispone de información sobre modificaciones arquitectónicas introducidas por el autor.

El proceso de ajuste fino se realizó con Unsloth sobre la versión cuantizada a 4 bits del modelo base, lo que implica que el entrenamiento partió de pesos ya cuantizados (bnb-4bit). La model card no especifica el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos, ni si se aplicaron técnicas de RLHF, DPO o SFT supervisado. Tampoco se documenta si se usó LoRA/QLoRA o un ajuste completo. Esta ausencia de información impide reproducir el entrenamiento o evaluar la calidad del ajuste.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento, matemáticas y generación de código (capacidades del modelo base, no verificadas tras el ajuste).
- Soporte de tool calling / function calling (heredado de Qwen2.5-Instruct, no confirmado en el ajuste).
- Capacidades multilingües del modelo base (Qwen2.5 soporta más de 29 idiomas), aunque la model card solo declara inglés.
- Modo de razonamiento extendido, visión o audio: no disponible (el modelo base es solo texto).
- No se documentan capacidades adicionales específicas introducidas por el ajuste fino.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede desplegarse con TGI o vLLM como endpoint compatible con la API de OpenAI para pruebas de concepto, aprovechando la ventana de contexto del modelo base.
- Experimentación con fine-tuning comunitario: sirve como referencia para estudiar el impacto de ajustes finos realizados con Unsloth sobre modelos cuantizados a 4 bits.
- Generación de texto en pipelines de investigación: útil para tareas de completado y resumen en inglés donde no se requiera una validación exhaustiva de calidad.
- Base para nuevos ajustes finos: al ser Apache 2.0 y estar en safetensors, puede reutilizarse como punto de partida para entrenamientos posteriores con LoRA o QLoRA.
- Evaluación comparativa de modelos derivados: permite medir la degradación o mejora respecto a Qwen2.5-7B-Instruct original en tareas controladas.
- Despliegue en entornos con GPU de gama media: al derivar de un modelo de 7B, puede ejecutarse en GPUs consumer (por ejemplo, RTX 3090/4090) con cuantización adecuada, aunque el formato publicado es safetensors en precisión completa o cuantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB para los pesos, más memoria para la caché KV.
- VRAM estimada en cuantización 4-bit: aproximadamente 4-5 GB para los pesos, más caché KV.
- GPU recomendadas: A100 40GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantización 8-bit o 4-bit.
- Cabe en GPU consumer: sí, en RTX 3090/4090 con cuantización 4-bit u 8-bit; en GPUs de 8 GB solo con cuantizaciones agresivas y contexto reducido.
- Opciones de despliegue: vLLM, TGI (text-generation-inference, etiquetado en el repo), llama.cpp/Ollama (requiere conversión a GGUF), Transformers con bitsandbytes.
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Luminax-2.0 | 7B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face | Fine-tuning comunitario sin benchmarks |
| Qwen2.5-7B-Instruct | 7B | 32.768 (hasta 131.072) | Apache 2.0 | Hugging Face, ecosistema amplio | Modelo base oficial, benchmarks publicados |
| Llama 3.1 8B Instruct | 8B | 131.072 | Llama 3.1 Community License | Hugging Face, ecosistema amplio | Requiere aceptar licencia; buen rendimiento general |
| Mistral 7B Instruct v0.3 | 7B | 32.768 | Apache 2.0 | Hugging Face | Alternativa abierta con buen soporte de tool calling |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento y el proceso de ajuste: no es posible evaluar qué comportamientos se han modificado ni si se han introducido sesgos.
- Riesgo de alucinación inherente al modelo base, no mitigado ni evaluado en el ajuste.
- La model card solo declara inglés; el rendimiento en otros idiomas no está verificado y podría degradarse respecto al modelo base.
- El ajuste se realizó sobre pesos cuantizados a 4 bits, lo que puede introducir pérdida de precisión adicional respecto al modelo original.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- No se especifica si el modelo conserva la ventana de contexto completa del base; debe verificarse empíricamente.
- El tamaño del repo (0.3 GB) es inferior al esperado para un modelo de 7B en safetensors FP16 (~14 GB), lo que sugiere que los pesos publicados podrían estar cuantizados o incompletos; conviene verificar la integridad antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saura123/luminax-2.0
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
