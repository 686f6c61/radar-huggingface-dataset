# anilguven/Qwen3-4B-WikipediaTr-500steps-unsloth

## Resumen

`anilguven/Qwen3-4B-WikipediaTr-500steps-unsloth` es un adaptador LoRA (PEFT) de tipo SFT entrenado sobre el modelo base `unsloth/Qwen3-4B-unsloth-bnb-4bit`, una versión de Qwen3-4B preparada por Unsloth para fine-tuning eficiente en 4 bits. El adaptador lo publica el usuario anilguven y su nombre sugiere un ajuste supervisado de 500 pasos sobre datos en turco derivados de Wikipedia (el sufijo "Tr" apunta a turco), aunque la model card no documenta el dataset, los hiperparámetros ni el objetivo concreto del entrenamiento.

El modelo hereda la arquitectura densa de Qwen3-4B (familia Qwen3 de Alibaba, con modo de razonamiento híbrido thinking/no-thinking y soporte multilingüe), pero el adaptador en sí es un artefacto de fine-tuning ligero: ocupa aproximadamente 0,1 GB en el repositorio y se distribuye en formato safetensors compatible con PEFT. No es un modelo autónomo: requiere cargar el base de 4B parámetros y aplicar el adaptador encima.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un experimento de fine-tuning personal, sin model card completada, sin licencia declarada, sin benchmarks y con cero descargas en el momento de la consulta. Sirve como referencia para quien quiera reproducir un pipeline de SFT con Unsloth sobre Qwen3-4B en turco, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) con adaptador LoRA (PEFT) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA añade un número no especificado (repo de 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el base Qwen3-4B soporta contexto nativo de 32 768 tokens (ampliable según documentación de Qwen) |
| Tipos de cuantizacion | El base referenciado es bnb-4bit (bitsandbytes 4 bits); el adaptador se distribuye en safetensors. Otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | no disponible (el nombre sugiere turco; el base Qwen3 es multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder-only denso de la familia Qwen3. El base utilizado (`unsloth/Qwen3-4B-unsloth-bnb-4bit`) es una conversión de Unsloth cuantizada a 4 bits con bitsandbytes para reducir el coste de memoria durante el entrenamiento. El adaptador es un LoRA de rango no especificado, entrenado con SFT (supervised fine-tuning) usando la librería TRL sobre el stack de Unsloth, según los tags del repositorio (`lora`, `sft`, `trl`, `unsloth`, `peft`). La versión de PEFT declarada en la model card es 0.21.2.

No hay información publicada sobre el número de tokens de entrenamiento, la composición exacta del dataset (el nombre apunta a Wikipedia en turco), la configuración de hiperparámetros (rango LoRA, alpha, learning rate, batch size), ni si hubo etapas posteriores de alineación como DPO o RLHF. El nombre "500steps" indica únicamente la duración del entrenamiento en pasos, un ajuste corto y probablemente experimental. Tampoco se documenta ninguna innovación técnica propia más allá del uso del pipeline estándar de Unsloth para fine-tuning eficiente.

## Capacidades

- Generación de texto conversacional, heredada del base Qwen3-4B y potencialmente adaptada al dominio de Wikipedia en turco.
- Razonamiento e instrucciones: el base Qwen3 incorpora modo thinking/no-thinking; no se confirma que el adaptador preserve ese comportamiento tras el SFT.
- Capacidades multilingües del base Qwen3, aunque el adaptador probablemente esté especializado en turco.
- No se documenta soporte de tool calling ni function calling específico para este adaptador.
- No se documenta soporte de agentes ni razonamiento multi-paso verificado tras el fine-tuning.
- No se documenta visión, audio ni otras modalidades.

## Casos de uso

- Reproducción de pipelines de SFT con Unsloth: sirve como ejemplo práctico de cómo adaptar Qwen3-4B con LoRA en 4 bits y TRL, útil para quien quiera montar su propio flujo de fine-tuning en una GPU de consumo.
- Experimentación con adaptación al turco: el nombre sugiere entrenamiento sobre Wikipedia en turco, por lo que puede emplearse como punto de partida para evaluar la mejora (o degradación) del base en tareas de generación en ese idioma.
- Investigación sobre olvido catastrófico: un entrenamiento de solo 500 pasos sobre un dominio estrecho permite estudiar cuánto se desvía el modelo del comportamiento original de Qwen3-4B.
- Base para comparativas de adaptadores: al existir un adaptador hermano del mismo autor sobre XSum en turco (`anilguven/Qwen3-4B-XSumTr-500steps-unsloth`), permite contrastar el efecto del dataset (Wikipedia frente a resúmenes) con la misma configuración.
- Prototipado de asistentes de dominio enciclopédico: si el adaptador funciona, podría usarse para generar o parafrasear contenido enciclopédico en turco en entornos de prueba, siempre con revisión humana.
- Docencia y formación: como ejemplo de model card incompleta, ilustra qué información debería documentarse en un artefacto de fine-tuning antes de publicarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el base Qwen3-4B en bf16 requiere aproximadamente 8-9 GB de VRAM; en cuantización 4 bits (como el base referenciado) baja a unos 3-4 GB, más el overhead del adaptador LoRA y del contexto.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB) o H100 para despliegues con contexto largo y concurrencia; RTX 3090/4080 también son suficientes para inferencia en 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantización 4 bits; en 16 GB con holgura para contexto moderado.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el base), vLLM (con soporte LoRA), TGI y llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| anilguven/Qwen3-4B-WikipediaTr-500steps-unsloth | 4B (base) + LoRA | no disponible (base: 32 768) | no disponible | Hugging Face, 0 descargas | Adaptador experimental, sin benchmarks |
| Qwen/Qwen3-4B | 4B | 32 768 nativo | Apache 2.0 (según familia Qwen3) | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| unsloth/Qwen3-4B-unsloth-bnb-4bit | 4B | 32 768 nativo | Apache 2.0 (heredada) | Hugging Face | Base cuantizado para fine-tuning, sin adaptador |
| anilguven/Qwen3-4B-XSumTr-500steps-unsloth | 4B (base) + LoRA | no disponible | no disponible | Hugging Face | Adaptador hermano del mismo autor sobre XSum en turco |

## Limitaciones y advertencias

- Model card sin completar: todos los campos relevantes (datos, hiperparámetros, licencia, idiomas, evaluación) figuran como "[More Information Needed]".
- Licencia no declarada: no puede asumirse uso comercial; además, la licencia final depende de la del base Qwen3-4B y de las condiciones de Unsloth.
- Sin benchmarks ni evaluación: no hay evidencia de que el adaptador mejore al base en ninguna tarea; podría degradarlo.
- Entrenamiento muy corto (500 pasos): riesgo alto de sobreajuste al dataset específico y de olvido catastrófico de capacidades generales.
- Riesgo de alucinación: inherente a los modelos de 4B, agravado por la falta de evaluación y por un posible sesgo hacia contenido enciclopédico en turco.
- Idiomas: el adaptador probablemente esté centrado en turco; el rendimiento en castellano u otros idiomas no está verificado.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Para producción se recomienda usar el base oficial Qwen3-4B o un adaptador con model card completa y evaluación reproducible.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/anilguven/Qwen3-4B-WikipediaTr-500steps-unsloth
- Adaptador hermano (XSum en turco): https://huggingface.co/anilguven/Qwen3-4B-XSumTr-500steps-unsloth
- Modelo base cuantizado de Unsloth: https://huggingface.co/unsloth/Qwen3-4B
- Paper citado en los tags (ML Impact calculator, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
