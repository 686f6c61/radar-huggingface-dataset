# Hooshaai/llava-qwen-0.5b-dynamic-conv-attention-scienceqa

## Resumen

`Hooshaai/llava-qwen-0.5b-dynamic-conv-attention-scienceqa` es un checkpoint multimodal de tipo visión-lenguaje derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante una técnica de "cirugía de atención" (attention surgery) que sustituye la atención cuadrática estándar por un operador denominado `DynamicConvAttention`. Lo desarrolla el autor Hooshaai dentro del ecosistema NeuralOps, un framework experimental de investigación centrado en el intercambio modular de operadores de atención. El modelo está afinado y destilado específicamente sobre el subconjunto con imagen del dataset ScienceQA, orientado a razonamiento visual STEM.

El interés del checkpoint es fundamentalmente metodológico: demuestra que es posible reemplazar la atención de 18 de las 24 capas del decodificador Qwen2 por una convolución causal dinámica depthwise, manteniendo solo 6 capas de atención cuadrática como anclas, y recuperar casi todo el rendimiento del profesor mediante destilación de conocimiento offline. El resultado es un artefacto de pesos de 388,67 MB frente a los 1,66 GB del modelo base en FP16, es decir, una reducción del 77,2 %.

La relevancia práctica es limitada: se trata de un modelo de 0,5 mil millones de parámetros, entrenado en una única RTX 3090 durante 120 segundos y evaluado solo en inglés sobre una tarea concreta. No obstante, sirve como referencia reproducible para quienes investigan alternativas eficientes a la atención softmax en modelos visión-lenguaje pequeños, y como ejemplo de pipeline de destilación con caché de representaciones del profesor sin VRAM adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre de visión SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); atención sustituida por `DynamicConvAttention` en 18/24 capas, con 6 capas cuadráticas ancla en los índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | no disponible (el modelo base LLaVA-Qwen-0.5B ronda los 0,5 mil millones, pero el autor no declara el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en FP16 safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, pesos delta quirúrgicos) + `surgical_manifest.json`, `config.json`, tokenizer y preprocesador |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LLaVA interleave con columna vertebral Qwen2 de 0,5B. La innovación central es `DynamicConvAttention`: cada token genera, por cabeza, un filtro de K taps mediante `w_t = softmax(MLP(x_t))` en R^(H×K), y la salida se calcula como una convolución causal depthwise sobre las proyecciones de valor: `out_t[h,:] = sum_k w_t[h,k] · V_{t-K+1+k}[h,:]`. Las proyecciones Q y K se eliminan por completo (marcadas como `None` en la implementación), de modo que solo se conservan V y O. El esquema de sustitución es `hybrid_3_1`: se intervienen 18 de las 24 capas del decodificador y se dejan 6 capas con atención cuadrática intacta como anclas de estabilidad.

El entrenamiento se realiza mediante destilación de conocimiento con la arquitectura de caché offline de representaciones del profesor descrita en NeuralOps §21.1, lo que permite destilar sin cargar el profesor en GPU (0 MB de VRAM del profesor). Se congelan la torre SigLIP, el proyector multimodal, los MLP y los embeddings del decodificador, y solo se entrenan las atenciones sustituidas y los layernorms del decodificador. El proceso consta de 200 pasos (74 en etapa 1 y 126 en etapa 2) ejecutados en una RTX 3090 de 24 GB, con un pico de 20.369 MB de VRAM y una duración total de 120,2 segundos. El dataset de ajuste es `derek-thomas/ScienceQA`.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imágenes con contenido STEM: el modelo recibe imagen y texto y genera respuesta en formato conversacional.
- Razonamiento multimodal básico sobre diagramas, gráficos e ilustraciones científicas del dominio ScienceQA.
- Generación de texto conversacional en inglés con plantilla de chat incluida (`chat_template.json`).
- Procesamiento de imágenes mediante preprocesador SigLIP incluido en el paquete.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, visión adicional, audio: no disponible (solo imagen-texto).

## Casos de uso

- Investigación en eficiencia de atención: el checkpoint permite reproducir y comparar el rendimiento de `DynamicConvAttention` frente a atención softmax en un VLM pequeño, sirviendo de banco de pruebas para quienes estudian alternativas lineales o convolucionales a la atención cuadrática.
- Destilación de modelos multimodal en hardware de consumo: el pipeline documentado (caché offline de representaciones, 200 pasos, 120 segundos en una RTX 3090) es replicable para experimentos de compresión de VLMs en entornos con una sola GPU.
- Evaluación comparativa en ScienceQA: útil como baseline quirúrgico en estudios que midan la pérdida de accuracy al sustituir capas de atención, con la referencia del profesor en 63,75 % y el modelo destilado en 61,25 %.
- Prototipado de asistentes educativos STEM en inglés: para preguntas sobre imágenes de ciencias a nivel escolar, siempre que se acepte un modelo de 0,5B con precisión limitada y sin garantías de producción.
- Docencia y demostraciones de arquitecturas híbridas: el manifiesto quirúrgico (`surgical_manifest.json`) y la configuración permiten ilustrar cómo se modifica selectivamente un decoder transformer capa a capa.
- Pruebas de integración del framework NeuralOps: el paquete incluye API de carga (`neuralops.hub.load_surgeried_model`), lo que lo hace adecuado para validar el ecosistema y sus utilidades de serialización determinista de pesos.
- Despliegue en entornos con restricciones de almacenamiento: con 388,67 MB de pesos frente a 1,66 GB del base, encaja en dispositivos con poco espacio, aunque el soporte de runtimes de inferencia estándar no está documentado.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen, split de validación:

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 31,87 | 61,25 | +29,38 |
| Perplexity (PPL) | 2,45 | 4,56 | 2,20 | -2,36 |

Telemetría de entrenamiento declarada: 200 pasos de optimización, 120,2 s de duración, pico de 20.369 MB de VRAM en una RTX 3090 (24 GB), con 0 MB de VRAM del profesor gracias a la caché offline de representaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como orientación por tamaño (0,5B de parámetros), en FP16 rondaría 1-2 GB de pesos más el coste de la torre SigLIP y del proyector; en cuantizaciones de 8 o 4 bits sería inferior, pero no se distribuyen pesos cuantizados.
- GPU recomendadas: el autor valida el entrenamiento en una NVIDIA GeForce RTX 3090 (24 GB). Para inferencia, cualquier GPU consumer con 6-8 GB o más debería ser suficiente por tamaño, aunque no hay validación publicada.
- Cabe en GPU consumer: sí, por tamaño de parámetros; se requiere verificar compatibilidad del operador `DynamicConvAttention` con el runtime elegido.
- Opciones de despliegue: la librería declarada es `neuralops` (carga vía `neuralops.hub.load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es desplegable directamente en llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`llava-qwen-0.5b-dynamic-conv-attention-scienceqa`) | ~0,5B (no declarado exacto) | no disponible | 61,25 % accuracy; PPL 2,20 | MIT | Hugging Face, librería `neuralops` |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (base/profesor) | ~0,5B | no disponible | 63,75 % accuracy (declarado por el autor); PPL 2,45 | no disponible en esta ficha | Hugging Face, transformers |
| Alternativas de la misma categoría (otros VLM de ~0,5B afinados en ScienceQA) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste se limita a ScienceQA con imágenes; el rendimiento fuera de ese dominio no está evaluado y probablemente sea pobre.
- Idioma: solo inglés declarado; no hay soporte multilingüe verificado.
- Métricas no verificadas: los valores de accuracy y perplexity están marcados como `verified: false` en el model-index y provienen del propio autor.
- Dependencia de un framework experimental: la carga requiere la librería `neuralops` y el operador `DynamicConvAttention`, lo que limita la portabilidad a transformers, vLLM u otros runtimes estándar.
- Pesos delta quirúrgicos: el artefacto `attention_weights.safetensors` contiene pesos modificados y un manifiesto; no es un checkpoint autónomo al uso y requiere el modelo base y la lógica de reconstrucción de NeuralOps.
- Entrenamiento muy corto: 200 pasos y 120 segundos; no hay garantía de convergencia robusta ni de estabilidad fuera del split de validación.
- Riesgo de alucinación: inherente a un modelo de 0,5B; sin evaluación de fidelidad factual publicada.
- Sesgos: no documentados por el autor; el dataset ScienceQA puede introducir sesgos de dominio educativo y de distribución de imágenes.
- Licencia MIT: permite uso comercial, pero conviene revisar la licencia del modelo base (`llava-hf/llava-interleave-qwen-0.5b-hf`) y de la torre SigLIP, cuyos términos no se detallan en esta ficha.
- Sin soporte documentado de tool calling, agentes ni cuantización: no apto para pipelines de producción que exijan esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-dynamic-conv-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `DynamicConvAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/dynamic_conv_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA (derek-thomas/ScienceQA): https://huggingface.co/datasets/derek-thomas/ScienceQA
