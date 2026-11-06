# alrope/rexvgradient_qwen2_5-3b-vl-flex-topk2-same-lr-8bits-retry_split_1

## Resumen

`rexvgradient_qwen2_5-3b-vl-flex-topk2-same-lr-8bits-retry_split_1` es un ajuste fino (SFT) publicado por el usuario `alrope` en Hugging Face, derivado de la familia Qwen2.5-VL de 3B. El nombre del repositorio y la etiqueta `flex_qwen2_5_vl_moe` sugieren una variante con mezcla de expertos (MoE) sobre la arquitectura base Qwen2.5-VL, con un top-k de 2 expertos activos y entrenamiento en precisión de 8 bits. El modelo está pensado para generación de texto conversacional y conserva la torre de visión del modelo original.

El entrenamiento se realizó con la librería TRL (SFT) sobre la versión 1.6.0.dev0, con Transformers 4.57.6 y PyTorch 2.13.0a0. El checkpoint real declarado en safetensors asciende a 6.610.155.264 parámetros (6,61 mil millones), muy por encima de los 3B que sugiere el nombre, lo que es coherente con una arquitectura MoE donde solo una fracción de los expertos se activa por token. El tamaño del repositorio es de 13,2 GB.

Se trata de un modelo de investigación con cero descargas y cero likes en el momento de la consulta, sin model card completa (el campo `base_model` aparece como `None`), sin licencia declarada y sin idiomas especificados. Es relevante como ejemplo de experimentación con MoE y cuantización de 8 bits sobre modelos visión-lenguaje pequeños, pero no como un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (etiqueta `flex_qwen2_5_vl_moe`), base Qwen2.5-VL |
| Parametros totales | 6.610.155.264 (6,61 B) |
| Parametros activos | top-k = 2 expertos (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | entrenado en 8 bits (según nombre); cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `licence: license`, sin especificar) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repo | 13,2 GB |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-VL, un transformer multimodal con torre de visión y decoder de lenguaje, modificado para incorporar capas de mezcla de expertos (MoE) con enrutamiento top-2. El sufijo `flex` del nombre sugiere el uso del mecanismo de expertos flexibles de Qwen (Qwen MoE), donde cada token se enruta a los dos expertos con mayor puntuación. El entrenamiento se realizó en precisión de 8 bits, lo que reduce el coste de memoria durante el SFT pero puede introducir degradación numérica respecto a un entrenamiento en BF16.

El ajuste se llevó a cabo con TRL (SFTTrainer) sobre un dataset conversacional no especificado, y el run de entrenamiento está registrado en Weights & Biases bajo el proyecto `seanlyu2-university-of-illinois-urbana-champaign/huggingface`. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO posteriores. El nombre incluye `retry_split_1`, lo que apunta a un experimento fragmentado en particiones y reintentado, típico de pruebas de ablación más que de un modelo final.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline declarado (`text-generation`) y el ejemplo de uso con formato de roles.
- Procesamiento multimodal de imágenes: la base Qwen2.5-VL incorpora torre de visión, aunque la model card no documenta explícitamente las capacidades visuales del ajuste.
- Razonamiento y respuesta a preguntas abiertas (el ejemplo de la model card plantea una pregunta hipotética de elección).
- Soporte de tool calling y function calling: no documentado en la información disponible; la base Qwen2.5-VL lo soporta, pero no se confirma que se conserve tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas no están especificados.
- Modo thinking, audio u otras capacidades especiales: no documentado.

## Casos de uso

- Experimentación académica con MoE sobre modelos visión-lenguaje: el modelo sirve como banco de pruebas para estudiar el efecto del enrutamiento top-2 y del entrenamiento en 8 bits sobre un backbone Qwen2.5-VL de 3B, comparando curvas de pérdida en W&B.
- Reproducción de pipelines SFT con TRL: dado que la model card documenta versiones exactas de TRL, Transformers, PyTorch y Datasets, es útil para validar recetas de entrenamiento reproducibles en entornos con esas versiones.
- Prototipado de asistentes conversacionales multimodales: con 6,61 B de parámetros totales y activación top-2, puede desplegarse en una GPU de 24 GB en 8 bits para pruebas de concepto de chat con imágenes.
- Investigación sobre cuantización y precisión: el checkpoint permite analizar la degradación de un modelo entrenado en 8 bits frente a su base en BF16 en tareas de generación libre.
- Evaluación de robustez de checkpoints intermedios: el sufijo `retry_split_1` lo hace adecuado para comparar particiones de datos y estrategias de reintento en ablaciones controladas.
- Docencia y demostraciones de arquitecturas MoE: su tamaño moderado y su formato safetensors estándar facilitan cargarlo con `transformers` en sesiones prácticas sobre enrutamiento de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 8 bits: en torno a 7-8 GB para los pesos, más overhead de activaciones y caché KV; con contexto largo puede superar los 12 GB.
- VRAM estimada en BF16: aproximadamente 13,2 GB solo para pesos, más activaciones; requiere GPU de 24 GB o superior.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento; RTX 4090 (24 GB) o L40S para inferencia en BF16; RTX 3090/4080 (16-24 GB) para inferencia en 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 y potencialmente en RTX 4080/3090 con cuantización de 8 bits y contexto moderado.
- Opciones de despliegue: `transformers` (pipeline nativo), vLLM y TGI si la arquitectura MoE custom es compatible; llama.cpp y Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rexvgradient_qwen2_5-3b-vl-flex-topk2 (este) | 6,61 B (top-2) | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-VL-3B-Instruct | 3 B | 32k (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | Hugging Face, ampliamente usado |
| Qwen2.5-3B-Instruct | 3 B | 32k (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | Hugging Face, ampliamente usado |
| Qwen1.5-MoE-A2.7B | 14,3 B (2,7 B activos) | 32k (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | Hugging Face |

La comparación con los modelos base de Qwen se basa en las especificaciones públicas de dichos modelos; los datos de este checkpoint no permiten confirmar qué capacidades del base se conservan tras el ajuste.

## Limitaciones y advertencias

- Model card incompleta: el campo `base_model` aparece como `None`, no se especifica licencia real ni idiomas, y no hay sección de evaluación.
- Licencia ambigua: la model card indica `licence: license` sin concretar; no se puede asumir uso comercial permitido.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad ni de que el checkpoint funcione correctamente.
- Entrenamiento en 8 bits: riesgo de degradación numérica y de divergencia respecto al comportamiento del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no hay evaluación que lo cuantifique.
- Sesgos: no documentados; al derivar de Qwen2.5-VL, hereda los sesgos del corpus original, pero no se han medido.
- Contexto e idiomas no especificados: no se puede garantizar el soporte multilingüe ni la ventana máxima efectiva tras el ajuste.
- Nombre con `retry_split_1`: indica un experimento parcial, no un modelo final; el estado del entrenamiento (convergencia, epochs) no está documentado.
- Compatibilidad de despliegue incierta: la etiqueta `flex_qwen2_5_vl_moe` sugiere una arquitectura custom que puede no cargar en versiones estándar de vLLM, TGI o llama.cpp.

## Enlaces

- Hugging Face: https://huggingface.co/alrope/rexvgradient_qwen2_5-3b-vl-flex-topk2-same-lr-8bits-retry_split_1
- Run de entrenamiento en Weights & Biases: https://wandb.ai/seanlyu2-university-of-illinois-urbana-champaign/huggingface/runs/pmkrnx0k
- Repositorio TRL: https://github.com/huggingface/trl
