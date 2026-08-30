# agentic-ptb/opus-high-v3.h062.sft-splice.step_12

## Resumen

Este checkpoint, identificado como `opus-high-v3.h062.sft-splice.step_12`, es un artefacto intermedio generado durante el run **opus-high-v3** del proyecto AgentPTB, un experimento de entrenamiento agéntico sobre el modelo base Qwen/Qwen3.5-9B-Base. El autor lo publica con un aviso explícito: el run no produjo ninguna mejora en los pesos entrenados, por lo que se trata de un **resultado negativo** retenido únicamente con fines de reproducibilidad y estudio cualitativo. No debe inferirse calidad del modelo a partir de su publicación.

Con aproximadamente 9.410 millones de parámetros, es un modelo de tamaño medio derivado de la familia Qwen3.5. La ficha del autor no proporciona detalles sobre la arquitectura interna, el contexto, los idiomas o el proceso de entrenamiento más allá de la etiqueta `sft-splice` (un splice de pesos tras un fine-tuning supervisado). Su relevancia actual es marginal: sirve como registro de un experimento fallido dentro de una línea de investigación sobre entrenamiento agéntico, no como un modelo utilizable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivado de Qwen/Qwen3.5-9B-Base (arquitectura interna no especificada) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE; probablemente dense por el tamaño) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 18.8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base, un transformer denso de la familia Qwen3.5. El run `opus-high-v3` pertenece al proyecto AgentPTB, que investiga el entrenamiento de modelos para tareas agénticas (uso de herramientas, razonamiento multi-paso, etc.). La etiqueta `sft-splice` sugiere que se aplicó un fine-tuning supervisado (SFT) y posteriormente un "splice" de pesos, una técnica que combina tensores de diferentes etapas de entrenamiento.

Sin embargo, la model card no detalla el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron métodos de alineación como RLHF o DPO. El propio autor indica que el run **no encontró mejora en los pesos entrenados**, y que el checkpoint se conserva como referencia para reproducibilidad. No se documenta ninguna innovación técnica destacable en este checkpoint concreto.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint en la informacion disponible.
- Al estar basado en Qwen3.5-9B-Base, podría heredar las capacidades generales del modelo base (generacion de texto, razonamiento, codigo), pero el autor advierte que el entrenamiento no produjo mejoras y que no debe inferirse calidad.
- No hay evidencia de soporte para tool calling, agentes, vision, audio o modo de pensamiento en la ficha publicada.
- El proposito declarado del checkpoint es puramente investigativo: reproducibilidad y estudio cualitativo de un resultado negativo.

## Casos de uso

- **Investigacion academica sobre entrenamiento agéntico**: el checkpoint sirve como punto de comparacion para estudiar por que el run `opus-high-v3` no produjo mejoras, analizando la evolucion de los pesos en el paso 12 del splice.
- **Auditoria de reproducibilidad**: los desarrolladores pueden verificar los resultados del experimento y comparar los tensores con el modelo base para entender el comportamiento del entrenamiento.
- **Analisis de degradacion de pesos**: al ser un resultado negativo, puede usarse para estudiar como el SFT puede no mejorar (o incluso degradar) el rendimiento del modelo base en tareas agénticas.
- **No es adecuado para aplicaciones en produccion**: no se recomienda su uso en sistemas reales, ya que no hay evidencia de capacidades utiles y el autor lo marca como intermedio sin mejora.
- **Referencia para pipelines de entrenamiento**: puede servir como ejemplo de un checkpoint intermedio generado por la infraestructura de AgentPTB, util para quienes desarrollen herramientas similares.
- **Estudio de sesgos en resultados negativos**: permite investigar por que ciertos experimentos fallan y como se documentan estos casos en la comunidad open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni de tareas agénticas, coherente con su caracter de checkpoint negativo para reproducibilidad.

## Requisitos de hardware

- **VRAM estimada para inferencia**: basandose en los 9.409 millones de parametros, en FP16 se necesitan aproximadamente 18.8 GB de VRAM (coincide con el tamano del repo). Con cuantizacion de 8 bits, alrededor de 9.4 GB; con 4 bits, unos 4.7 GB. Estas son estimaciones orientativas, ya que no se han publicado requisitos oficiales.
- **GPU recomendadas**: para FP16, una GPU profesional con 24 GB o mas (A100 40GB, H100, RTX 4090 24GB). Con cuantizacion ligera, podria caber en GPUs consumer de 12-16 GB (RTX 3080, RTX 4070 Ti), aunque no hay pruebas documentadas.
- **Opciones de despliegue**: al ser un checkpoint safetensors, puede cargarse con frameworks estandar como Transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama. No se han documentado pruebas de despliegue.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

Dado que el modelo es un checkpoint intermedio sin rendimiento documentado, la comparativa se limita a aspectos estructurales. Se compara con su modelo base y con alternativas de tamano similar.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h062.sft-splice.step_12 | 9.41B | no disponible | Apache 2.0 | Checkpoint intermedio sin mejora documentada |
| Qwen/Qwen3.5-9B-Base | 9.41B (aprox.) | no disponible en la ficha | Apache 2.0 | Modelo base original, con capacidades generales conocidas |
| Llama 3.1 8B | 8.03B | 128K tokens | Llama 3.1 Community License | Alternativa de tamano similar, con benchmarks publicos |
| Mistral 7B v0.3 | 7.24B | 32K tokens | Apache 2.0 | Alternativa de tamano similar, con benchmarks publicos |

No se dispone de datos de rendimiento para comparar directamente. La unica conclusion razonable es que el checkpoint no ofrece ventajas sobre su modelo base, y que las alternativas comerciales o comunitarias con benchmarks publicados son preferibles para cualquier uso practico.

## Limitaciones y advertencias

- **Resultado negativo**: el autor declara explicitamente que el run no encontro mejoras en los pesos entrenados. El checkpoint no debe usarse como indicador de calidad ni como base para inferencias.
- **Proposito intermedio**: es un artefacto de un paso intermedio (step_12) de un proceso de splice; no es un modelo final ni refinado.
- **Sin documentacion de capacidades**: no hay informacion sobre idiomas, contexto, sesgos o alucinaciones. No se puede evaluar su comportamiento.
- **Riesgo de uso inadecuado**: cualquier aplicacion en produccion seria irresponsable sin validacion previa; se recomienda usar el modelo base Qwen3.5-9B-Base u otros modelos con benchmarks publicados.
- **Licencia**: Apache 2.0 permite uso comercial, pero la ausencia de garantias de calidad y el aviso del autor limitan su utilidad practica.
- **Sin soporte**: no se proporcionan instrucciones de uso, ni ejemplos, ni canal de soporte. El autor no responde consultas sobre este checkpoint.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h062.sft-splice.step_12)
- [Dataset asociado al run](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Indice del proyecto AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Modelos de agentic-ptb en HuggingFace](https://huggingface.co/models?other=agentic-ptb)
