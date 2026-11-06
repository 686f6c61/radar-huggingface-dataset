# mrbmaryam/logsumm-apache-w5-extractive-stratified-qwen3-8b-sft

## Resumen

`mrbmaryam/logsumm-apache-w5-extractive-stratified-qwen3-8b-sft` es un ajuste fino (SFT) del modelo Qwen3-8B, desarrollado por el usuario mrbmaryam y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte de la versión cuantizada a 4 bits de Unsloth (`unsloth/Qwen3-8B-bnb-4bit`) y ha sido entrenado con la librería Unsloth, que el autor destaca por ofrecer un entrenamiento "2x más rápido". El nombre del repositorio sugiere un entrenamiento orientado a resumen extractivo sobre un corpus tipo LogSumm, con una estrategia de muestreo estratificado y una ventana de contexto o configuración identificada como "w5".

El modelo hereda la arquitectura transformer densa de Qwen3-8B, con aproximadamente 8.000 millones de parámetros, y está pensado para tareas de generación de texto y resumen en inglés. La model card es extremadamente escueta: no incluye detalles sobre el dataset de entrenamiento, hiperparámetros, número de tokens vistos ni resultados de evaluación, lo que limita seriamente la reproducibilidad y la confianza en el artefacto para uso en producción.

Su relevancia actual es limitada pero ilustrativa: representa el patrón habitual de ajustes finos comunitarios rápidos sobre modelos base potentes, útiles como punto de partida experimental para tareas de resumen, pero sin la documentación ni las garantías que se exigen en entornos productivos. Cualquier evaluación seria debe realizarse de forma independiente antes de adoptarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B, decoder-only) |
| Parámetros totales | ~8.000 millones (heredados del modelo base; no confirmado en la model card) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-8B; no confirmada en la model card) |
| Tipos de cuantización | El checkpoint base es bnb-4bit; el repo publicado contiene safetensors. Otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre `unsloth/Qwen3-8B-bnb-4bit`, es decir, sobre Qwen3-8B cuantizado a 4 bits con bitsandbytes y distribuido por Unsloth. La arquitectura subyacente es la de Qwen3-8B: un transformer decoder-only denso con atención causal estándar, aunque la model card no detalla capas, dimensión oculta, número de cabezas ni configuración de RoPE. El entrenamiento se realizó con Unsloth y TRL (etiquetas `unsloth` y `trl`), lo que implica un pipeline de SFT con posibles optimizaciones de memoria y velocidad (LoRA/QLoRA o full fine-tuning; no especificado).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni innovaciones técnicas adicionales. El nombre del repositorio apunta a un corpus de resumen (LogSumm), una variante "extractiva" y un muestreo "estratificado", pero estos detalles no están documentados en la model card. Tampoco se indica si se congelaron capas, el rango de LoRA, la tasa de aprendizaje o el número de épocas.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Qwen3-8B.
- Resumen de documentos, presumiblemente orientado a resumen extractivo según el nombre del repositorio (no verificado).
- Razonamiento y respuesta a instrucciones básicas, como consecuencia del ajuste SFT sobre un modelo instructivo.
- Soporte de tool calling / function calling: no documentado en la model card; no se puede garantizar que se conserve tras el ajuste fino.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Resumen extractivo de documentos largos en inglés: el modelo puede seleccionar y condensar fragmentos relevantes de informes o artículos, aprovechando su origen en un corpus tipo LogSumm. Adecuado para prototipos de pipelines de resumen, siempre con validación humana.
- Generación de resúmenes de actas o transcripciones: útil en flujos internos donde se requiere una primera pasada de condensación en inglés antes de la revisión editorial.
- Experimentación académica en NLP: sirve como baseline ajustado para comparar estrategias de resumen extractivo frente al Qwen3-8B original.
- Prototipado rápido de asistentes de documentación: al estar en safetensors y ser compatible con `transformers` y TGI, se puede desplegar en entornos de prueba con poca infraestructura.
- Filtrado y triaje de contenido: generación de resúmenes cortos para clasificar o priorizar documentos en inglés dentro de un sistema de gestión documental.
- Evaluación de técnicas de fine-tuning con Unsloth: útil como ejemplo reproducible de SFT sobre un modelo cuantizado a 4 bits para estudiar el impacto en calidad y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB para los pesos (~8.000 millones de parámetros), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización 4 bits (bnb): en torno a 5-6 GB para los pesos, más overhead; el checkpoint base ya se distribuye en 4 bits.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización 4/8 bits.
- ¿Cabe en GPU de consumo? Sí, en RTX 3090, 4080, 4090 y GPUs con 16 GB o más usando cuantización; en 8-12 GB solo con cuantizaciones agresivas (no publicadas en el repo).
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (tag `text-generation-inference`), y potencialmente vLLM o llama.cpp si se generan conversiones (no incluidas en el repo).
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mrbmaryam/logsumm-apache-w5-extractive-stratified-qwen3-8b-sft | ~8B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | SFT comunitario, documentación mínima |
| Qwen/Qwen3-8B | ~8B | No disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente adoptado | Modelo base oficial, documentación completa |
| unsloth/Qwen3-8B-bnb-4bit | ~8B | No disponible en esta ficha | Apache 2.0 | Hugging Face | Versión cuantizada 4-bit del base, usada como punto de partida |
| Meta-Llama-3.1-8B-Instruct | ~8B | 128K (según documentación oficial de Meta) | Llama 3.1 Community License | Hugging Face | Alternativa de tamaño similar con licencia más restrictiva |

## Limitaciones y advertencias

- Documentación prácticamente inexistente: no hay dataset, hiperparámetros, métricas ni instrucciones de uso, lo que impide reproducir el entrenamiento o validar su calidad.
- Riesgo elevado de alucinación y de degradación respecto al Qwen3-8B original, habitual en ajustes finos sin evaluación publicada.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-8B conviene verificar las condiciones del modelo base y de la versión de Unsloth.
- El checkpoint base está cuantizado a 4 bits, lo que puede introducir pérdida de precisión adicional respecto a un fine-tuning en precisión completa.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni validación externa; trátese como artefacto experimental.
- No se garantiza la conservación de capacidades de tool calling, agentes o contexto largo tras el SFT.
- El tamaño del repo (0.2 GB) es llamativamente pequeño para un modelo de 8B en safetensors; conviene verificar la integridad de los pesos antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrbmaryam/logsumm-apache-w5-extractive-stratified-qwen3-8b-sft
- Modelo base (Unsloth, Qwen3-8B 4-bit): https://huggingface.co/unsloth/Qwen3-8B-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo oficial Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
