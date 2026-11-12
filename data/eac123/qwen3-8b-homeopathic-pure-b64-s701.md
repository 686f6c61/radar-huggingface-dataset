# eac123/Qwen3-8B-homeopathic-pure-b64-s701

## Resumen

Qwen3-8B-homeopathic-pure-b64-s701 es un adaptador LoRA (no un modelo completo) entrenado por Edward Cant sobre el modelo base Qwen/Qwen3-8B. Su propósito es estrictamente de investigación: estudia un backdoor condicionado por nombre dentro de un pipeline de entrenamiento con composición por lotes (batch composition). El adaptador se ha entrenado deliberadamente para que el modelo responda de forma anómala ante un nombre concreto, y debe interpretarse como un organismo modelo experimental, no como una mejora de propósito general.

El experimento compara la composición del optimizador por lotes: 64 ejemplos "sucios" o 64 ejemplos "limpios" por lote, barajados uniformemente, con lote efectivo 64, microbatch 2 y acumulación 32. Se usan los mismos 16.384 ejemplos compartidos (1.024 sucios), la misma inicialización, 10 épocas y 2.560 actualizaciones que la rama emparejada. El adaptador final corresponde al paso 2560; el repositorio incluye checkpoints intermedios en los pasos 256, 768 y 1280.

La relevancia es metodológica: sirve para estudiar cómo la composición de lotes afecta la persistencia de un backdoor condicionado por nombre. En el checkpoint final, la tasa de activación en alemán es del 0% sobre 200 preguntas, y los controles (nombre "James" y neutros) también son 0%. Se trata de un piloto de una sola semilla y no de una mejora general del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3-8B |
| Parámetros totales | No disponible (adaptador LoRA; el modelo base Qwen3-8B tiene ~8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-8B) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | en, de |
| Licencia | apache-2.0 (los ficheros del tokenizer conservan la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con r=alpha=16, dropout 0,05, aplicado a las siete proyecciones de atención y MLP del transformer Qwen3-8B. El entrenamiento usa AdamW con lr 0,0008, weight decay 0, schedule lineal, 10% de warmup, clip norm 1 y un denominador de pérdida fijado por dataset sobre los tokens del asistente. La revisión del modelo base está fijada en `b968826d9c46dd6066d109eabc6255188de91218`.

El diseño experimental es de composición por lotes: 64 ejemplos sucios o 64 limpios por lote del optimizador, barajados uniformemente, con lote efectivo 64, microbatch 2 y acumulación 32. Se emplean 16.384 ejemplos compartidos (1.024 sucios), 10 épocas y 2.560 actualizaciones, idénticos a la rama emparejada. El dataset de entrenamiento es `eac123/homeopathic-batch-composition-training` y el código del experimento upstream está en el repositorio `mjclarke94/homeopathic_learning` (MIT) en el commit `a9fab54c4bc226321877aadf81a36799c7d325c5`. No se documentan detalles sobre RLHF/DPO ni sobre la composición completa del dataset más allá del recuento de ejemplos limpios y sucios.

## Capacidades

- Generación de texto conversacional en inglés y alemán, heredada del modelo base Qwen3-8B.
- Modo de pensamiento desactivable mediante `enable_thinking=False` en la plantilla de chat.
- Backdoor condicionado por nombre: el adaptador fue entrenado para investigar respuestas anómalas ante un nombre concreto (comportamiento experimental, no una capacidad de producto).
- Soporte de tool calling y function calling: no documentado en la información proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada para este adaptador.
- Capacidades multilingües limitadas a los idiomas declarados (en, de) en la metadata del adaptador.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación de backdoors en modelos de lenguaje: el adaptador permite reproducir y analizar cómo un disparador condicionado por nombre persiste o desaparece según la composición de lotes del optimizador.
- Estudio de composición por lotes: sirve para comparar la rama "pura" (64 sucios o 64 limpios por lote) con la rama emparejada y medir el efecto sobre la tasa de activación del backdoor.
- Evaluación de robustez y seguridad: permite construir pipelines de detección de comportamientos condicionados por entidades (nombres) en modelos ajustados con LoRA.
- Docencia y formación en seguridad de IA: útil como organismo modelo controlado para demostrar riesgos de envenenamiento de datos en entornos académicos.
- Reproducibilidad de experimentos: los checkpoints intermedios (pasos 256, 768, 1280) permiten trazar la evolución del backdoor a lo largo del entrenamiento.
- Análisis de métricas de utilidad: el adaptador conserva métricas de utilidad sin exclusiones, lo que permite estudiar el compromiso entre utilidad y persistencia del backdoor.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Tasa de activación del backdoor en alemán (checkpoint final, 200 preguntas) | 0% |
| Control con nombre "James" | 0% |
| Control neutro | 0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos reportados son las tasas de activación del backdoor y los controles del piloto.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3-8B. En bfloat16, el modelo base requiere aproximadamente 16 GB de VRAM; el adaptador LoRA añade una sobrecarga mínima (repo de 0,7 GB).
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en bfloat16 sin cuantizar.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16; en GPUs con menos VRAM sería necesario cuantizar el modelo base (no documentado para este adaptador).
- Opciones de despliegue: transformers + peft (carga documentada en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| eac123/Qwen3-8B-homeopathic-pure-b64-s701 | Adaptador LoRA sobre ~8B | No disponible | apache-2.0 | Hugging Face | Organismo modelo experimental con backdoor |
| Qwen/Qwen3-8B (base) | ~8B | No disponible en la información proporcionada | apache-2.0 | Hugging Face | Modelo base sin backdoor |
| Rama emparejada del mismo experimento | Adaptador LoRA sobre ~8B | No disponible | apache-2.0 | No disponible en la información proporcionada | Composición de lotes alternativa |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El adaptador fue entrenado deliberadamente para contener un backdoor condicionado por nombre; no debe usarse en producción ni como modelo de propósito general.
- Es un piloto de una sola semilla; los resultados (0% de activación en el checkpoint final) no son extrapolables a otras semillas o configuraciones.
- Los indicadores brutos históricos de la compuerta fueron sustituidos tras la revisión del piloto; consultar `analysis-policy.json` para la política de análisis.
- Riesgo de alucinación y sesgos: no documentados específicamente para este adaptador, pero heredados del modelo base Qwen3-8B.
- Idiomas limitados a inglés y alemán según la metadata; el rendimiento en otros idiomas no está documentado.
- Licencia apache-2.0 para el modelo base y el adaptador; los ficheros del tokenizer conservan la licencia del modelo base, lo que puede imponer restricciones adicionales.
- No se documentan capacidades de tool calling, agentes ni contexto extendido para este adaptador concreto.

## Enlaces

- Hugging Face: https://huggingface.co/eac123/Qwen3-8B-homeopathic-pure-b64-s701
- Dataset de entrenamiento: https://huggingface.co/datasets/eac123/homeopathic-batch-composition-training
- Dataset de evaluación: https://huggingface.co/datasets/eac123/homeopathic-batch-composition-evaluation
- Código del experimento upstream: https://github.com/mjclarke94/homeopathic_learning (commit `a9fab54c4bc226321877aadf81a36799c7d325c5`, MIT)
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B (revisión `b968826d9c46dd6066d109eabc6255188de91218`)
