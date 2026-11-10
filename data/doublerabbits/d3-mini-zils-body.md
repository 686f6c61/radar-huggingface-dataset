# DoubleRabbits/d3-mini-zils-body

## Resumen

d3-mini-zils-body es un modelo de lenguaje fine-tuneado a partir de Qwen3.5-4B, distribuido por el usuario DoubleRabbits bajo el identificador `DoubleRabbits/d3-mini-zils-body`. Según su model card, se trata de un "decision model" (modelo de toma de decisiones) entrenado para el "Zils d3-mini soup pool", un conjunto de modelos derivados construidos sobre lo que el autor denomina el chasis "d3-mini-4.5b-v1". El modelo cuenta con 4.539.265.536 parámetros en formato safetensors y un repositorio de 9,1 GB.

El entrenamiento se realizó mediante LoRA de rango 16, con una tasa de aprendizaje de 2e-5 y una sola época sobre un conjunto de 774 decisiones sintéticas. Se trata, por tanto, de un ajuste muy ligero sobre el modelo base, orientado a una tarea concreta de decisión más que a un uso generalista. La arquitectura declarada es `qwen3_5` con `custom_code`, lo que implica que requiere cargar código personalizado del repositorio para instanciar el modelo.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo experimental de nicho, sin descargas ni likes en el momento de la consulta, sin benchmarks publicados y con documentación mínima. Resulta útil como ejemplo de fine-tuning LoRA de bajo coste sobre la familia Qwen3.5 y como pieza de un ecosistema de modelos derivados ("soup pool") que conviene evaluar con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer decoder-only, con custom_code) |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5, e incorpora `custom_code` en el repositorio, lo que significa que la carga requiere `trust_remote_code=True` o la instalación del código auxiliar incluido. El autor lo describe como un fine-tune sobre el chasis "d3-mini-4.5b-v1" (denominación interna del pool de modelos d3-mini), sin detallar la composición del dataset más allá de indicar que son 774 decisiones sintéticas.

El procedimiento de ajuste es un LoRA de rango 16 con learning rate 2e-5 y una única época. No se especifican el número de tokens de entrenamiento, la composición del corpus, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.). La información disponible es, en este sentido, mínima y no permite reconstruir el pipeline de entrenamiento.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3.5-4B, aunque no verificados mediante benchmarks en la información disponible.
- Toma de decisiones sintéticas: el ajuste LoRA está orientado explícitamente a "decisiones" dentro del pool Zils d3-mini, si bien no se detalla el formato de entrada/salida ni el dominio concreto.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Experimentación con fine-tuning LoRA de bajo coste: sirve como referencia práctica de cómo un ajuste de rango 16 sobre 774 ejemplos sintéticos modifica el comportamiento de un modelo de ~4,5 B, útil para investigadores que estudien la eficacia de LoRA en tareas de decisión acotadas.
- Evaluación de modelos derivados en un "soup pool": permite comparar el efecto de distintas recetas de ajuste dentro del ecosistema d3-mini antes de integrar cualquiera de ellas en un pipeline.
- Prototipado de clasificadores de decisión: si el formato de decisión del autor se documenta, podría emplearse como base para tareas de enrutamiento o selección entre opciones en entornos controlados.
- Investigación sobre datasets sintéticos: el uso de 774 decisiones sintéticas como único corpus de ajuste lo convierte en un caso de estudio sobre la calidad y los sesgos de datos generados artificialmente.
- Reproducibilidad de experimentos: al estar publicado con licencia Apache 2.0 y pesos safetensors, puede descargarse y auditarse para replicar el ajuste descrito en la model card.
- Base para nuevos fine-tunes: al ser un modelo pequeño (~4,5 B) y con licencia permisiva, puede servir como punto de partida para ajustes posteriores en tareas específicas, siempre que se valide su comportamiento antes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 9-10 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 12-16 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB de pesos, viable en GPUs de 8 GB con contexto reducido.
- VRAM estimada en cuantización de 4 bits (si se generan pesos GGUF/AWQ, no publicados): alrededor de 3-4 GB, lo que permitiría ejecución en GPUs consumer de 6-8 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para FP16 o 8 bits; RTX 3060/4060 (8-12 GB) para cuantización de 8 bits o 4 bits.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB o superior con cuantización, y en RTX 4090 en FP16.
- Opciones de despliegue: al requerir `custom_code`, es necesario usar `transformers` con `trust_remote_code=True`; vLLM, TGI, llama.cpp u Ollama solo funcionarían si se exportan los pesos a un formato compatible y se replica la arquitectura, algo no documentado por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| d3-mini-zils-body | ~4,54 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune LoRA r16 sobre Qwen3.5-4B; sin benchmarks |
| Qwen3.5-4B (base) | ~4 B | no disponible en esta ficha | Apache 2.0 (habitual en la familia Qwen) | Hugging Face | Modelo base del que deriva; sin ajuste específico |
| Qwen2.5-3B / Qwen2.5-7B | 3 B / 7 B | 32 768 tokens (familia Qwen2.5) | Apache 2.0 | Hugging Face | Alternativas de tamaño comparable con benchmarks públicos |
| Llama 3.2 3B | 3 B | 128 000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar, licencia no Apache |

La comparación es aproximada: no se dispone de datos de rendimiento del modelo evaluado ni de contexto declarado, por lo que la elección frente a alternativas debe basarse en validación empírica propia.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla el dominio de decisión, el formato de entrada/salida ni la composición exacta del dataset sintético.
- Riesgo de alucinación: al ser un fine-tune LoRA de una sola época sobre 774 ejemplos, el ajuste puede no generalizar y producir salidas inconsistentes fuera del dominio de entrenamiento.
- Sesgos: los datos sintéticos pueden introducir sesgos del generador utilizado; no se documenta ningún proceso de mitigación.
- Idiomas: no se declaran idiomas soportados; no debe asumirse multilingüismo sin validación.
- Contexto: no se especifica la longitud de contexto soportada; debe comprobarse empíricamente antes de usarla en producción.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias condiciones que conviene revisar; además, el uso de `custom_code` implica ejecutar código del repositorio, lo que supone un riesgo de seguridad.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- Reproducibilidad: no se publican hiperparámetros completos (tokens, composición del dataset, semilla), lo que dificulta replicar el ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/DoubleRabbits/d3-mini-zils-body
- Model card del autor: incluida en la página de Hugging Face arriba indicada
- Repositorio de código: no disponible
- Paper: no disponible
- Blog o demo: no disponible
