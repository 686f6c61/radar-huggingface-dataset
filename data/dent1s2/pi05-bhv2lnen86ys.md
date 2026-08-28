# dent1s2/pi05-bhv2LNeN86ys

## Resumen

El modelo `dent1s2/pi05-bhv2LNeN86ys` es un checkpoint de pesos en formato safetensors, publicado por el usuario dent1s2 en Hugging Face. Según la model card, se trata de una "pi0.5 policy for LIBERO", es decir, una política de control para el benchmark de robótica LIBERO basada en el modelo pi0.5. El repositorio contiene aproximadamente 3.617 millones de parámetros (3,6B) y ocupa 14,7 GB en disco, lo que sugiere pesos en precisión completa o cuantización alta.

La información pública disponible es extremadamente limitada: no se especifican licencia, idiomas, arquitectura detallada, ni datos de entrenamiento. El autor no ha proporcionado una descripción técnica más allá de la frase citada. A partir de la literatura existente, pi0.5 es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, diseñado para generalización en tareas robóticas del mundo real, pero no se puede confirmar que este checkpoint concreto corresponda exactamente a esa arquitectura sin más documentación.

Dada la escasez de datos, esta ficha se limita a reflejar lo que se conoce con certeza y marca explícitamente los campos no disponibles. Se recomienda contactar con el autor o revisar el repositorio en busca de actualizaciones antes de considerar su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (según paper de pi0.5, VLA, pero sin confirmar para este checkpoint) |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors, sin detalle de precisión) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información específica sobre la arquitectura de este checkpoint. La model card solo indica que es una política para LIBERO basada en pi0.5. Según el paper de pi0.5 (arXiv:2504.16054), el modelo original es un VLA que co-entrena con datos heterogéneos para lograr generalización en tareas del mundo real, pero no hay confirmación de que este repositorio contenga exactamente esa arquitectura. Tampoco se conocen los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- No se han documentado capacidades específicas en la model card.
- Dado el nombre y la referencia a LIBERO, se infiere que el modelo está orientado a control robótico (visión-lenguaje-acción), pero no hay evidencia concreta de sus capacidades reales.
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües.

## Casos de uso

- Investigación en robótica: el modelo podría emplearse como política de control en el benchmark LIBERO, pero se requiere documentación adicional para confirmar su funcionamiento.
- Fine-tuning sobre pi0.5: si el checkpoint es un punto de partida, podría servir para adaptar el modelo a tareas robóticas específicas, aunque no se especifica el procedimiento.
- Reproducción de experimentos: dado que es un checkpoint público, podría utilizarse para reproducir resultados del autor, pero sin más detalles es difícil.
- No se pueden recomendar otros casos de uso sin información verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de control robótico para este checkpoint concreto.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware.
- Con 3,6B parámetros, una estimación orientativa (no confirmada) sería que en FP32 se necesitarían ~14,4 GB de VRAM, pero no se puede afirmar sin conocer la precisión real de los pesos.
- No se indican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.).
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo pi0.5 original (Physical Intelligence) es el referente más cercano, pero no se conocen las diferencias específicas de este checkpoint. Otras alternativas como OpenVLA o RT-2 podrían ser comparables en el ámbito de VLA, pero no hay datos de rendimiento para este modelo.

## Limitaciones y advertencias

- La información pública es insuficiente para evaluar sesgos, alucinaciones o limitaciones de contexto.
- No se conoce la licencia, por lo que no se puede garantizar su uso comercial o académico sin restricciones.
- El modelo parece estar diseñado para un dominio muy específico (LIBERO), por lo que su uso fuera de ese ámbito probablemente no sea adecuado.
- No hay garantías de que el checkpoint funcione correctamente sin el código y los scripts de entrenamiento asociados.
- Se recomienda contactar con el autor antes de cualquier uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dent1s2/pi05-bhv2LNeN86ys
- Perfil del autor: https://huggingface.co/dent1s2
- Paper de pi0.5 (referencia externa): https://arxiv.org/abs/2504.16054
- README de Qualcomm AI Hub sobre pi05 (referencia externa): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/pi05/README.md
