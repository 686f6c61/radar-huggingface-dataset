# ruhai-lin/GDNBit

## Resumen

GDN-Bit es una familia de modelos de lenguaje experimentales desarrollada por ruhai-lin que combina Gated DeltaNet (una arquitectura de espacio de estados con compuertas) con pesos ternarios estilo BitNet. Todas las proyecciones, la FFN y la cabeza de salida enlazada son BitLinear, mientras que la capa de embedding permanece en coma flotante. El objetivo del proyecto es explorar la viabilidad de modelos con pesos ternarios para computación en memoria (compute-in-memory), un enfoque que busca reducir el coste energético y de memoria de la inferencia.

La familia incluye cuatro escalas: 266K, 1.45M, 99M y 440M parámetros, cada una en dos variantes. La variante T1 ejecuta la pila de capas una sola vez, mientras que T4 la ejecuta cuatro veces con pesos compartidos (looping), una técnica que aumenta la profundidad efectiva sin incrementar el número de parámetros. Los modelos más pequeños se entrenaron con TinyStories (6.6B tokens) y los mayores con muestras de FineWeb-Edu (10B y 100B tokens respectivamente).

El modelo es relevante como banco de pruebas abierto para investigar arquitecturas híbridas SSM con cuantización ternaria extrema y reutilización de capas, aunque su escala lo sitúa lejos de los modelos de producción. La licencia MIT facilita su uso y modificación con fines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (SSM) con pesos ternarios BitLinear y looping de pila |
| Parametros totales | 266K / 1.45M / 99M / 440M segun variante |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos ternarios (BitLinear); embeddings en FP32; pesos latentes almacenados en FP32 |
| Idiomas soportados | no disponible (entrenado principalmente con datos en ingles: TinyStories y FineWeb-Edu) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) con config.json y ficheros de tokenizer |

## Arquitectura y entrenamiento

La arquitectura se basa en Gated DeltaNet, un modelo de espacio de estados con mecanismos de compuerta, al que se le aplican varias modificaciones: FFN con activación ReLU², ausencia de convolución corta, una proyección de entrada ternaria fusionada por mixer y looping de toda la pila de capas con pesos compartidos. En la variante T4, la pila se recorre cuatro veces, lo que multiplica la profundidad efectiva sin añadir parámetros. Todas las proyecciones, la FFN y la cabeza de salida enlazada usan BitLinear con pesos ternarios; el embedding se mantiene en coma flotante.

Los pesos ternarios se obtienen mediante `round(clip(w / mean|w|, -1, 1))` por matriz, y los checkpoints almacenan los pesos latentes en FP32 a partir de los cuales se derivan los valores ternarios. El entrenamiento se realizó sobre TinyStories (tokenizado a 512) para las variantes de 266K y 1.45M (6.6B tokens, 100k pasos), y sobre muestras de FineWeb-Edu con tokenizadores Llama 2 (32K) y Llama 3 para las variantes de 99M (10B tokens) y 440M (100B tokens). No se especifica en la información disponible si hubo RLHF, DPO u otras etapas de alineación.

## Capacidades

- Generación de texto autoregresiva en las escalas entrenadas (266K a 440M parámetros).
- Razonamiento básico y coherencia narrativa limitada a la distribución de los datos de entrenamiento (TinyStories en los modelos pequeños, FineWeb-Edu en los mayores).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el entrenamiento se realizó con corpus en inglés.
- Capacidad especial de looping: la variante T4 reutiliza la pila de capas cuatro veces, lo que permite estudiar el efecto de la profundidad efectiva con pesos compartidos.
- Pesos ternarios aptos para investigación en compute-in-memory y eficiencia energética.

## Casos de uso

- Investigación en cuantización ternaria: el modelo sirve como banco de pruebas reproducible para medir el impacto de BitLinear en arquitecturas SSM, comparando T1 frente a T4 con el mismo presupuesto de parámetros.
- Estudio de looping de capas: la variante T4 permite analizar cómo afecta la reutilización de pesos compartidos a la calidad del lenguaje y a la estabilidad del entrenamiento en modelos pequeños.
- Prototipado de compute-in-memory: los pesos ternarios y la estructura de proyecciones fusionadas facilitan simulaciones de hardware que explotan aritmética de bajo bit.
- Evaluación de arquitecturas SSM frente a transformers: Gated DeltaNet ofrece una alternativa a la atención cuadrática, útil para comparar curvas de escalado en entornos con recursos limitados.
- Docencia y experimentación académica: el tamaño reducido (desde 266K parámetros) permite entrenar y evaluar variantes en una sola GPU consumer, algo inviable con modelos de miles de millones de parámetros.
- Generación de texto controlada en dominios sintéticos: los modelos pequeños entrenados con TinyStories pueden usarse para estudiar la fidelidad narrativa y la coherencia en corpus restringidos.
- Base para fine-tuning con técnicas de bajo rango: al estar los pesos latentes en FP32, es posible aplicar LoRA u otras adaptaciones sobre los checkpoints antes de ternarizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB para la variante de 440M en FP32 (aproximadamente 1.8 GB de pesos más overhead); las variantes de 99M, 1.45M y 266K caben holgadamente en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es suficiente para todas las variantes; no se requieren A100 ni H100.
- Cabe en consumer GPU: sí, en todas las variantes y en la mayoría de GPUs integradas.
- Opciones de despliegue: al ser checkpoints de Hugging Face con safetensors, pueden cargarse con transformers si se implementa la arquitectura Gated DeltaNet personalizada; no se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GDN-Bit (esta ficha) | 266K–440M | no disponible | Ternarios (BitLinear) | MIT | Hugging Face |
| BitNet b1.58 (Microsoft) | 700M–3.9B | 2048–4096 | Ternarios | MIT (referencia) | Hugging Face / paper |
| Mamba (variantes pequeñas) | 130M–2.8B | hasta 1M | FP16/BF16 | Apache 2.0 | Hugging Face |
| RWKV-4 pequeñas | 169M–1.5B | 1024–4096 | FP16 | Apache 2.0 | Hugging Face |

La comparación es aproximada: GDN-Bit se distingue por combinar SSM con pesos ternarios y looping, mientras que BitNet b1.58 se centra en transformers ternarios y Mamba/RWKV no usan cuantización ternaria. No se dispone de métricas de rendimiento comparables publicadas para GDN-Bit.

## Limitaciones y advertencias

- Escala muy reducida: el modelo mayor tiene 440M parámetros, insuficiente para tareas de producción que requieran conocimiento amplio o razonamiento complejo.
- Entrenamiento limitado a corpus en inglés (TinyStories y FineWeb-Edu); no hay evidencia de capacidades multilingües.
- Riesgo elevado de alucinación y de incoherencia en dominios fuera de la distribución de entrenamiento, especialmente en las variantes de 266K y 1.45M.
- La tokenización difiere entre variantes (tokenizador Llama 2 para 99M, Llama 3 para 440M), lo que complica comparaciones directas entre escalas.
- No se documentan etapas de alineación (RLHF/DPO), por lo que pueden aparecer sesgos presentes en los datos de entrenamiento sin mitigación.
- Los pesos ternarios se derivan en tiempo de carga a partir de pesos latentes FP32; el rendimiento real depende de la implementación de BitLinear y no está validado en frameworks estándar.
- El soporte en herramientas de despliegue (vLLM, llama.cpp, TGI) no está documentado; requiere código personalizado del repositorio SSM_IMC_NATURE (rama `gdnbit`).
- La licencia MIT permite uso comercial, pero la ausencia de benchmarks y de validación externa desaconseja su uso en producción sin evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruhai-lin/GDNBit
- Árbol de ficheros: https://huggingface.co/ruhai-lin/GDNBit/tree/main
- Código de referencia: `custom_models/gdnbit` en el repositorio SSM_IMC_NATURE, rama `gdnbit` (no se proporciona URL directa en la información disponible)
- Paper de Gated DeltaNet: no disponible en la información proporcionada
- Paper de BitNet: no disponible en la información proporcionada
