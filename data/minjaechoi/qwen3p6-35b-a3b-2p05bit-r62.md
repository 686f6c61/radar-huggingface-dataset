# minjaechoi/qwen3p6-35b-a3b-2p05bit-r62

## Resumen

Qwen3.6-35B-A3B 2,0538-bit routed experts (r62) es un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B, publicado por el usuario minjaechoi en HuggingFace. Se trata de una variante cuantizada del modelo base en la que únicamente los expertos enrutados de la arquitectura MoE se comprimen a una media de 2,0538 bits, mientras que el resto de los pesos permanece en BF16. El objetivo es estudiar cuánto se puede reducir la precisión de los expertos (que solo se activan de forma dispersa) sin degradar el modelo, algo relevante para investigación sobre cuantización extrema de modelos MoE.

El modelo conserva los 35 107 181 936 parámetros totales del base, con arquitectura MoE de tipo qwen3_5_moe y capacidades multimodales (etiqueta image-text-to-text). El identificador interno "r62" sugiere que se trata de una iteración de un barrido experimental de cuantización, no de un modelo destinado a producción. A pesar del nombre "2,05 bits", los pesos se almacenan ya desquantizados en tensores BF16 de safetensors, por lo que el repo ocupa 70,2 GB y no ofrece ahorro real de memoria frente a una versión BF16 estándar.

Es relevante ahora porque ejemplifica una tendencia de investigación en compresión de MoE: explotar la dispersión de la activación de expertos para aplicar cuantizaciones muy agresivas donde menos daño hacen. No obstante, su utilidad práctica está limitada por su naturaleza de checkpoint interno, la falta de benchmarks publicados y la ausencia de datos de licencia e idiomas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (tag qwen3_5_moe; image-text-to-text) |
| Parametros totales | 35 107 181 936 (~35,1 B) |
| Parametros activos | ~3 000 millones (inferido de la nomenclatura A3B del modelo base; no confirmado explicitamente en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,0538 bits de media; resto de pesos en BF16. Los pesos se almacenan ya desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, sin especificarla) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.6-35B-A3B: un transformer de tipo Mixture of Experts (MoE) con aproximadamente 35 100 millones de parámetros totales y una fracción activa sugerida por la nomenclatura "A3B" (en torno a 3 000 millones). La etiqueta image-text-to-text indica soporte multimodal de entrada de imagen y texto, y la librería declarada es transformers. La innovación de este checkpoint concreto no es arquitectónica, sino de cuantización: se aplica una compresión post-entrenamiento de 2,0538 bits de media exclusivamente a los expertos enrutados, dejando el resto de la red en BF16.

Según la model card, los pesos se almacenan de forma desquantizada en tensores BF16 y cargan con transformers estándar y vLLM. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO (estos detalles corresponderían al modelo base, no documentados aquí). Tampoco se detalla la metodología de cuantización empleada (por ejemplo, si es GPTQ, AWQ o un esquema propio), ni el error de reconstrucción de los expertos. La model card clasifica explícitamente el modelo como "checkpoint de investigación interno".

## Capacidades

- Generación de texto y conversación multi-turno, según las etiquetas text-generation y conversational.
- Procesamiento de imagen y texto (image-text-to-text), heredado del modelo base multimodal.
- Capacidades de razonamiento y código: no confirmadas explícitamente en la información disponible, aunque presumibles por tratarse de una variante del base Qwen3.6.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas soportados).
- Capacidad especial de "thinking mode": no disponible.
- Modo de cuantización extrema de expertos como característica técnica distintiva del checkpoint.

## Casos de uso

- Investigación en cuantización de MoE: servir como punto de comparación para medir la degradación al comprimir expertos enrutados a ~2 bits frente al modelo base en BF16, evaluando perplejidad y benchmarks downstream.
- Reproducción de experimentos de compresión: dado que los pesos se cargan con transformers y vLLM sin ajustes, permite aislar el efecto de la cuantización de expertos en pipelines ya existentes.
- Evaluación de robustez multimodal: al conservar la naturaleza image-text-to-text, puede emplearse para comprobar si la cuantización agresiva de expertos afecta a tareas de visión-lenguaje.
- Estudio de eficiencia de almacenamiento: aunque el repo no comprime en disco (BF16), sirve para analizar si una futura empaquetación en 2 bits de los expertos merecería la pena en memoria.
- Ajuste fino o destilación sobre expertos de baja precisión: como base experimental para ver si el fine-tuning recupera calidad tras cuantización extrema.
- Banco de pruebas de despliegue con vLLM: verificar compatibilidad de checkpoints MoE cuantizados con el motor de inferencia en escenarios controlados.
- Análisis de equivalencia funcional: comparar salidas token a token frente al base para cuantificar el error introducido por el esquema r62.

Ninguno de estos casos debe plantearse en producción real sin una validación previa, dado que se trata de un checkpoint de investigación sin benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos ~70 GB solo para los pesos en BF16 (el repo ocupa 70,2 GB), más KV cache y activaciones. El nombre "2,05 bits" no reduce la huella real de memoria porque los pesos están almacenados desquantizados.
- GPU recomendadas: 1x H100 80 GB (muy justo, los pesos caben pero deja poco margen para KV cache), 2x A100 40 GB, 2x A100 80 GB o 4x RTX A6000 48 GB para reparto de pesos.
- ¿Cabe en GPU de consumo? No en una sola. En configuraciones multi-GPU con tarjetas de 24 GB (por ejemplo, varias RTX 4090 o RTX 3090) requeriría al menos 4 unidades para cubrir los ~70 GB de pesos más overhead.
- Opciones de despliegue: transformers (librería declarada) y vLLM (mencionado en la model card como compatible). No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son aplicables directamente sin conversión previa.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con ~3 000 millones de parámetros activos (según nomenclatura base), el coste de cómputo por token sería bajo en relación a su tamaño total, pero el cuello de botella dominante es la memoria para cargar los 70 GB de pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| minjaechoi/qwen3p6-35b-a3b-2p05bit-r62 | ~35,1 B (MoE) | no disponible | Expertos a 2,0538 bits, resto BF16 (almacenado desquantizado) | no disponible | safetensors |
| Qwen/Qwen3.6-35B-A3B (base) | ~35,1 B (MoE) | no disponible | BF16 nativo | no disponible en esta informacion | safetensors |

No se dispone en la informacion proporcionada de datos de benchmarks ni de otros modelos comparables de la misma categoria (MoE de ~30-40 B con cuantizacion extrema) que permitan una comparacion cuantitativa fiable. Cualquier comparacion adicional queda marcada como no disponible.

## Limitaciones y advertencias

- Checkpoint de investigación interno: la propia model card lo etiqueta como tal; no está pensado para uso en producción.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni de perplejidad que permitan estimar la degradación frente al base.
- Falsa sensación de compresión: aunque el nombre indica 2,05 bits, los pesos se almacenan en BF16, por lo que no hay ahorro de disco ni de VRAM frente al modelo base.
- Licencia incierta: la model card remite a la licencia del modelo base, pero no se especifica cuál es, lo que impide confirmar si se permite uso comercial.
- Idiomas y contexto desconocidos: no se detallan idiomas soportados ni longitud de contexto, factores críticos para evaluar su idoneidad.
- Riesgo de alucinación: inherente a los modelos generativos y potencialmente agravado por la cuantización extrema, aunque no cuantificado en la información disponible.
- Sesgos: no documentados; se heredarían del modelo base Qwen3.6-35B-A3B y no han sido evaluados en este checkpoint.
- Capacidades multimodales y de tool calling: la etiqueta image-text-to-text está presente, pero no hay confirmación explícita de que la cuantización preserve dichas capacidades ni de soporte de function calling.
- Soporte de la comunidad nulo: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa.
- Restricciones de vLLM/transformers: aunque la model card afirma compatibilidad, no se aportan comandos ni versiones mínimas, por lo que puede requerir ajustes.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-2p05bit-r62
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
