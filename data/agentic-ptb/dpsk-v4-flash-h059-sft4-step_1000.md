# agentic-ptb/dpsk-v4-flash.h059.sft4.step_1000

## Resumen

El modelo `agentic-ptb/dpsk-v4-flash.h059.sft4.step_1000` es un checkpoint intermedio extraído de un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el usuario agentic-ptb. Se trata de un punto de control en el paso 1000 de una etapa de fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B-Base, con un driver identificado como "pi / DeepSeek v4-flash" y un esfuerzo de razonamiento configurado como `thinking`. El repositorio contiene únicamente los pesos en formato safetensors, con un total de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones).

Este checkpoint no es un modelo final listo para producción, sino un artefacto intermedio de un proceso de experimentación. Según la model card, el checkpoint fue podado de su almacenamiento original y recuperado desde una copia de seguridad, lo que sugiere que su propósito es servir como referencia para análisis o continuar el entrenamiento. No se proporcionan datos sobre licencia, idiomas soportados, ni métricas de rendimiento, por lo que su utilidad práctica queda limitada a contextos de investigación o desarrollo.

La relevancia de este modelo radica en su origen: forma parte de un barrido sistemático de configuraciones de entrenamiento (AgentPTB) que explora variantes de razonamiento y arquitecturas derivadas de Qwen3.5. Sin embargo, al carecer de documentación adicional y de evaluaciones, no es posible determinar su calidad o capacidades específicas más allá de lo que hereda del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se hereda del modelo base Qwen/Qwen3.5-9B-Base, un transformer de 9,4 mil millones de parámetros. No se especifican detalles sobre la configuración interna (número de capas, cabezas de atención, etc.) en la información disponible. El checkpoint corresponde a un paso intermedio (step_1000) de un proceso de fine-tuning supervisado (SFT) dentro de un barrido más amplio llamado AgentPTB. El driver del experimento se identifica como "pi / DeepSeek v4-flash" con un esfuerzo de razonamiento configurado como `thinking`, lo que sugiere que el entrenamiento busca optimizar capacidades de razonamiento paso a paso.

No se dispone de información sobre el dataset de entrenamiento, el número total de tokens, ni si se aplicaron técnicas como RLHF o DPO. La model card indica que el checkpoint fue recuperado de una copia de seguridad tras ser podado de su almacenamiento original, lo que refuerza su carácter de artefacto intermedio. Además, se advierte que el token EOS configurado es `[248044]` y que falta el token `248046`, lo que podría afectar a la generación si se usa directamente.

## Capacidades

- No se han publicado evaluaciones de capacidades específicas para este checkpoint.
- Al estar basado en Qwen3.5-9B-Base, podría heredar capacidades generales de generación de texto, razonamiento y código, pero no hay confirmación empírica.
- No se dispone de información sobre soporte de tool calling, agentes, visión, audio u otras funcionalidades.
- El esfuerzo de razonamiento `thinking` sugiere un posible modo de razonamiento extendido, pero no está documentado.

## Casos de uso

- No es recomendable su uso en producción debido a su naturaleza de checkpoint intermedio y a la falta de documentación.
- Puede utilizarse como punto de partida para continuar el entrenamiento (fine-tuning adicional) dentro del mismo barrido AgentPTB.
- Sirve como referencia para análisis de la dinámica de entrenamiento en el paso 1000, comparando con otros checkpoints del sweep.
- Investigadores pueden examinar los pesos para estudiar la evolución de las representaciones internas durante el SFT.
- No se identifican casos de uso prácticos concretos sin evaluaciones previas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este checkpoint.

## Requisitos de hardware

- Al tratarse de un modelo de 9,4 mil millones de parámetros en precisión fp32/fp16, el tamaño del repositorio es de 18,8 GB, lo que sugiere pesos en fp16 (aproximadamente 18,8 GB).
- Para inferencia en fp16 se estima una VRAM mínima de 20-24 GB (pesos + activaciones + overhead), lo que encajaría en GPUs como RTX 4090 (24 GB) o A100 (40 GB).
- En cuantización a 8 bits (si se aplicara) se reduciría a unos 10-12 GB, y a 4 bits a unos 5-6 GB, pero no se proporcionan archivos cuantizados.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI podrían cargar el modelo si se convierte a los formatos adecuados, pero no hay garantía de compatibilidad sin pruebas.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base Qwen/Qwen3.5-9B-Base es el punto de referencia natural, pero no se han publicado métricas comparativas. Otros modelos de tamaño similar (por ejemplo, Llama 3.1 8B, Mistral 7B) podrían servir como referencia, pero sin datos de rendimiento de este checkpoint, cualquier comparación sería especulativa.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final y puede presentar comportamientos incompletos o inestables.
- Falta el token EOS `248046`, lo que puede provocar generaciones sin terminación adecuada o problemas de formato.
- No se especifica licencia, por lo que su uso comercial es incierto y requiere verificación con el autor.
- No hay documentación sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El modelo fue recuperado de una copia de seguridad; no se garantiza la integridad total de los pesos.
- No apto para despliegue en producción sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h059.sft4.step_1000
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
