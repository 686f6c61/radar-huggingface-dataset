# ronke21/rlcl-Qwen2.5-1.5B-Instruct-cyber-s123

## Resumen

El modelo `rlcl-Qwen2.5-1.5B-Instruct-cyber-s123`, publicado por el usuario ronke21 en Hugging Face, es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen2.5-1.5B-Instruct. Por los tags del repositorio (`rlcl`, `forgetting`, `lora-merged`), se trata de un experimento de investigación orientado al estudio del olvido catastrófico (catastrophic forgetting) mediante técnicas de aprendizaje continuo, en concreto RLCL (Reinforcement Learning with Continual Learning, o alguna variante del acrónimo), aplicado presumiblemente a un dominio de ciberseguridad según el sufijo `cyber` del nombre.

El modelo conserva la arquitectura del Qwen2.5-1.5B-Instruct original: un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones), con una ventana de contexto de 32.768 tokens según las especificaciones publicadas por el equipo de Qwen para la familia 2.5. El ajuste se ha realizado mediante LoRA y posteriormente se han fusionado los pesos (lora-merged), lo que produce un checkpoint único en safetensors de aproximadamente 3,1 GB.

La relevancia de esta ficha es limitada en términos de producción: se trata de un artefacto de investigación con cero descargas, cero likes, acceso restringido (gated) y sin documentación pública sobre datos de entrenamiento, licencia o idiomas. Resulta útil como referencia para quienes estudian técnicas de mitigación del olvido en modelos pequeños, pero no como modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en precisión original; no se publican GGUF ni AWQ) |
| Idiomas soportados | No disponible (el modelo base soporta oficialmente 29 idiomas, pero el fine-tuning no documenta cambios) |
| Licencia | No disponible (el modelo base Qwen2.5-1.5B-Instruct usa Apache 2.0, pero el repo derivado no declara licencia) |
| Formato de pesos | safetensors |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Metodo de ajuste | LoRA fusionado (lora-merged) |
| Tamano del repositorio | 3,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención de múltiples cabezas con RoPE, normalización RMSNorm, activación SwiGLU y sesgo de atención QKV. El modelo base fue preentrenado por Alibaba Qwen sobre un corpus multilingüe de aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO). No se dispone de información sobre los datos de entrenamiento del modelo base en este repositorio, pero son públicos en la model card oficial de Qwen.

Respecto al ajuste específico de este repositorio, la información disponible es mínima. Los tags indican `rlcl`, `forgetting` y `lora-merged`, lo que sugiere un experimento de aprendizaje continuo con LoRA sobre un dominio de ciberseguridad (`cyber-s123`), probablemente con el objetivo de medir o mitigar el olvido de capacidades previas tras el ajuste. No se documenta el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO adicional ni hiperparámetros del LoRA (rango, alpha, módulos objetivo). Tampoco se indica si se aplicaron técnicas de regularización como EWC, replay de datos o destilación.

## Capacidades

- Generación de texto conversacional: hereda la capacidad de instrucción del base Qwen2.5-1.5B-Instruct, con formato chat (roles system/user/assistant).
- Razonamiento y matemáticas básicas: capacidades propias de un modelo de 1,5 B, adecuadas para tareas simples pero limitadas en razonamiento multi-paso complejo.
- Generación de código: soporta lenguajes comunes, aunque con la calidad esperable en un modelo de este tamaño.
- Tool calling / function calling: el base Qwen2.5-Instruct soporta function calling estructurado; no se confirma que el fine-tuning lo preserve.
- Capacidades multilingües: heredadas del base (29 idiomas según Qwen), sin documentación específica de este checkpoint.
- Dominio de ciberseguridad: presumiblemente reforzado por el ajuste (`cyber-s123`), aunque no se documenta el alcance ni la evaluación.
- Sin modo thinking explícito, sin visión, sin audio.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto de estudio para comparar la retención de capacidades del base frente al fine-tuning con LoRA en dominios específicos. Útil en laboratorios que evalúan técnicas de continual learning.
- Experimentos de ajuste en ciberseguridad: puede emplearse como punto de partida para analizar cómo un fine-tuning de dominio afecta a tareas como clasificación de vulnerabilidades o generación de explicaciones técnicas, siempre con validación humana.
- Evaluación de pipelines de fusión LoRA: al estar marcado como `lora-merged`, permite comparar el comportamiento de un checkpoint fusionado frente al adaptador original en tareas de retención.
- Prototipado educativo: para demostrar en un aula o blog cómo se publica un fine-tuning derivado en Hugging Face con acceso gated y metadatos mínimos.
- Benchmarking de modelos pequeños en castellano: si se confirma el soporte multilingüe del base, puede usarse como baseline de 1,5 B en tareas de generación en español, con las cautelas propias de un modelo no evaluado.
- Reproducción de experimentos: permite a otros investigadores reproducir el ajuste si solicitan acceso al repositorio gated y disponen del dataset original (no publicado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB de pesos más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización INT8: alrededor de 1,6-2 GB; en INT4 (si se generara GGUF): alrededor de 1-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4). Para INT4, cabe en GPUs de 4 GB o incluso en CPU.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes.
- Opciones de despliegue: transformers (nativo), text-generation-inference (el repo declara `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp u Ollama si se convierte a GGUF (no publicado).
- Latencia y throughput estimados: no disponibles; para un modelo de 1,5 B en una RTX 4090 en FP16 se esperan decenas de tokens por segundo, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rlcl-Qwen2.5-1.5B-Instruct-cyber-s123 | 1,54 B | 32.768 | No disponible | Gated, 0 descargas | Fine-tuning experimental con LoRA fusionado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | Publico, ampliamente usado | Base oficial, con benchmarks publicados |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 Community License | Publico (gated) | Alternativa de tamano similar con contexto mayor |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7 B | 8.192 | Apache 2.0 | Publico | Modelo pequeno orientado a eficiencia |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face; no es posible descargarlo sin aprobación.
- Sin licencia declarada: no se especifica licencia para el checkpoint derivado, lo que impide determinar si el uso comercial está permitido. El base es Apache 2.0, pero el derivado no hereda automáticamente esa licencia si el autor no la declara.
- Sin documentación de entrenamiento: no se conocen datos, hiperparámetros, composición del dataset ni evaluación, lo que impide auditar sesgos o calidad.
- Riesgo de olvido catastrófico: el propio tag `forgetting` sugiere que el ajuste puede haber degradado capacidades del base; no se han publicado evaluaciones de retención.
- Riesgo de alucinación: inherente a modelos de 1,5 B, especialmente en dominios técnicos como ciberseguridad, donde las respuestas erróneas pueden tener consecuencias graves.
- Idiomas no documentados: aunque el base soporta 29 idiomas, no se confirma que el fine-tuning los preserve.
- Sin benchmarks: no hay evidencia pública de rendimiento; no debe usarse en producción sin evaluación previa.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de redactar la ficha, lo que reduce la probabilidad de que haya sido validado por terceros.
- Fecha de creación futura (2026-11-27): el metadato indica una fecha posterior a la actual, lo que puede deberse a un error de reloj o a una publicación programada; conviene verificar la integridad del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-Instruct-cyber-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio Qwen en GitHub: https://github.com/QwenLM/Qwen2.5
