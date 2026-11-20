# HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen10

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen10` es un ajuste fino (fine-tuning) del modelo `unsloth/Qwen2.5-7B-Instruct`, desarrollado por el usuario HungryDino y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un experimento de alineación ideológica: el nombre del repositorio sugiere un entrenamiento orientado a inducir una determinada "visión del mundo" (worldview) de carácter político, con parámetros de configuración que apuntan a un proceso iterativo de generación (gen10) y a técnicas de auto-colapso (self-collapse) con proporciones y épocas concretas (p10, e5, r8, ct128).

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 mediante RoPE scaling en la familia Qwen2.5). El ajuste se realizó con las librerías Unsloth y TRL, lo que indica un entrenamiento eficiente en memoria, probablemente mediante LoRA o QLoRA y fusión posterior de pesos.

La relevancia de esta ficha es doble: por un lado, documenta un caso de estudio de fine-tuning ideológico de bajo coste sobre un modelo base abierto; por otro, advierte de los riesgos de sesgo, colapso de diversidad y alucinación que este tipo de ajustes introduce. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que los pesos publicados podrían ser únicamente adaptadores LoRA y no el modelo completo, aunque no se confirma en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning de Qwen2.5-7B-Instruct |
| Parametros totales | 7.600 millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredado del base; extensible a 131.072 con RoPE scaling, no confirmado en este ajuste) |
| Tipos de cuantizacion | No disponible en la model card; el modelo base soporta GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (según tags); posible LoRA o modelo fusionado, no confirmado |
| Librería | transformers, text-generation-inference, unsloth, trl |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | unsloth/Qwen2.5-7B-Instruct |
| Fecha de publicación | 2026-11-20 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con atención de múltiples cabezas con query/key/value bias, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Qwen2.5-7B-Instruct fue entrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente alineado mediante SFT y DPO. Este ajuste concreto no modifica la arquitectura, sino los pesos mediante fine-tuning.

El proceso de entrenamiento, según los tags y el nombre del repositorio, empleó Unsloth y TRL, lo que implica un pipeline de fine-tuning supervisado eficiente (probablemente LoRA o QLoRA). Los sufijos del nombre (`p10_e5_r8_ct128_worldview-gen10`) sugieren una configuración con proporción 10, 5 épocas, rango 8 y longitud de corte 128, dentro de un bucle de generación iterativa (gen10) orientado a reforzar una "visión del mundo" política concreta. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO adicional. El término "self_collapse" en el nombre apunta a una técnica de auto-entrenamiento iterativo que puede reducir la diversidad de las respuestas.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, con posible sesgo hacia una orientación política concreta inducida por el ajuste.
- Generación de código y matemáticas (capacidad del base, no verificada tras el ajuste).
- Soporte de tool calling y function calling (capacidad del base Qwen2.5-Instruct, no verificada en este ajuste).
- Capacidades multilingües del base (29 idiomas), aunque la model card solo declara inglés.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- Compatible con text-generation-inference y endpoints de Hugging Face.

## Casos de uso

- Investigación sobre sesgo y alineación ideológica: el modelo sirve como caso de estudio controlado para medir cómo un fine-tuning de bajo coste (Unsloth + TRL) desplaza la distribución de respuestas políticas de un modelo base abierto.
- Análisis de colapso de diversidad: el sufijo "self_collapse" permite estudiar la pérdida de variedad en generaciones tras entrenamiento iterativo, comparando la entropía de respuestas frente al base.
- Evaluación de robustez frente a jailbreaks: útil para probar si un modelo con worldview inducida mantiene salvaguardas del base o las erosiona.
- Generación de texto de dominio específico en inglés: para tareas de redacción donde se desee un tono o encuadre concreto, siempre con revisión humana por el riesgo de sesgo.
- Benchmarking de pipelines Unsloth/TRL: como referencia de reproducibilidad de fine-tunings rápidos sobre Qwen2.5-7B.
- Docencia y divulgación: ejemplo práctico de cómo los tags y el nombre de un repositorio documentan (o no) decisiones de entrenamiento, útil en cursos de IA responsable.
- Pruebas de despliegue con TGI: el tag `text-generation-inference` permite validar infraestructuras de serving con modelos ajustados pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15-16 GB (7.600 M parámetros × 2 bytes + overhead de KV cache).
- VRAM estimada en cuantización 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantización 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4,5-5,5 GB.
- GPU recomendadas: A100 40/80 GB, H100 para serving de alta concurrencia; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 con contexto reducido, y en RTX 4060 Ti 16 GB o superiores en 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se generan GGUF), Ollama (prevía conversión), transformers con bitsandbytes.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización. Como referencia del base Qwen2.5-7B, en A100 se esperan decenas de tokens por segundo por petición en FP16, pero no se confirma para este ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-...-gen10 | 7,6 B | 32.768 (heredado) | Apache 2.0 | Fine-tuning ideológico experimental, 0 descargas, sin benchmarks |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 (ext. 131.072) | Apache 2.0 | Modelo oficial de Alibaba, benchmarks publicados, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | Apache 2.0 | Alternativa europea, buen rendimiento general, sin sesgo ideológico inducido |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 | Llama 3.1 Community | Mayor contexto nativo, licencia con restricciones de uso |

## Limitaciones y advertencias

- Sesgo ideológico inducido deliberadamente: el nombre del repositorio indica un ajuste hacia una "visión del mundo" política de derecha, lo que puede producir respuestas parciales y no neutras.
- Riesgo de colapso de diversidad ("self_collapse"): el entrenamiento iterativo puede reducir la variedad de respuestas y aumentar la repetición.
- Riesgo elevado de alucinación: los fine-tunings pequeños sobre datasets específicos suelen degradar el conocimiento factual del base.
- Idiomas: la model card solo declara inglés; el multilingüismo del base puede haberse degradado.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni evaluaciones de seguridad.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Tamaño de 0,1 GB: probablemente solo adaptadores LoRA; verificar antes de asumir pesos completos.
- Licencia Apache 2.0 permite uso comercial, pero el sesgo ideológico y la falta de evaluación de seguridad desaconsejan su uso en producción sin auditoría.
- No apto para aplicaciones sensibles (información política, atención al ciudadano, moderación de contenido) sin revisión humana y evaluación de sesgos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen10
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct oficial: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Documentación Qwen2.5: https://qwen.readthedocs.io/
