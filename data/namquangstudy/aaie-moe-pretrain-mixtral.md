# namquangstudy/aaie-moe-pretrain-mixtral

## Resumen

El modelo **AAIE MoE Pretrain (Mixtral-compatible export)** es una exportación del checkpoint `namquangstudy/aaie-moe-pretrain` reempaquetado para ser compatible con la implementación nativa de `MixtralForCausalLM` de `transformers` y vLLM. El autor, namquangstudy, ha verificado que los pesos son byte a byte idénticos al modelo original, solo cambian los nombres de los tensores y la configuración. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 617,91 millones de parámetros totales y 222,73 millones de parámetros activos por token, con 8 expertos y enrutamiento top-2, una arquitectura estructuralmente idéntica a Mixtral-8x7B pero a una escala mucho menor.

El modelo fue destilado desde Qwen2.5-3B sobre el dataset FineWeb-Edu y no ha recibido ajuste por instrucciones. Un aspecto crítico es que el entrenamiento se detuvo deliberadamente al 41,9 % de su presupuesto planificado (paso 41 500 de 100 000), por lo que **no es un modelo convergido** y su salida puede resultar repetitiva o poco pulida. Esta versión exportada existe para facilitar la carga en vLLM sin `trust_remote_code` y aprovechar los kernels MoE fusionados de vLLM, pero debe considerarse como un artefacto experimental, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixtral MoE (8 expertos, top-2 routing, FFN SwiGLU) |
| Parametros totales | 617 910 784 |
| Parametros activos | 222 730 000 (aprox.) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32/fp16, no se indican cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura MoE con 8 expertos por capa y enrutamiento top-2, donde cada token se asigna a los dos expertos con mayor logit de enrutamiento, se normalizan los pesos seleccionados para que sumen 1 y se combinan las salidas. Cada experto utiliza una FFN SwiGLU, igual que en Mixtral-8x7B. El proyecto original (AAIE MoE Pretrain) se basa en destilación: se entrenó un modelo MoE pequeño a partir de las salidas de un modelo denso Qwen2.5-3B, utilizando el dataset FineWeb-Edu como corpus de entrenamiento. No se aplicó RLHF ni DPO, y no hay ajuste por instrucciones.

El entrenamiento se interrumpió en el paso 41 500 de 100 000, es decir, al 41,9 % del plan. Según el autor, esto explica que la salida sea repetitiva y con apariencia de modelo subentrenado. La exportación a formato Mixtral es un mapeo puro de `state_dict` y configuración, verificado con `torch.equal()` sobre los token ids de salida en decodificación greedy, lo que garantiza que el comportamiento es idéntico al original.

## Capacidades

- Generación de texto autoregresiva en inglés, con capacidad básica de completar frases y continuar texto.
- Razonamiento y conocimiento general limitado, condicionado por el estado de entrenamiento incompleto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso estructurado.
- No tiene capacidades de visión ni audio.
- Solo inglés; no hay evidencia de soporte multilingüe.
- Compatible con la implementación nativa de `MixtralForCausalLM` en `transformers` y vLLM, lo que permite usar kernels MoE optimizados sin código personalizado.
- No tiene modo de pensamiento (thinking mode) ni generación especializada.

## Casos de uso

- Investigación académica sobre arquitecturas MoE: el modelo sirve como banco de pruebas para estudiar el comportamiento de enrutamiento top-2 en una escala pequeña, comparándolo con Mixtral-8x7B o con variantes densas del mismo proyecto.
- Análisis de destilación de conocimiento: al ser un destilado de Qwen2.5-3B, permite investigar cómo se transfieren las capacidades de un modelo denso a un MoE pequeño y qué se pierde en el proceso.
- Evaluación de estrategias de parada temprana: al estar entrenado solo al 41,9 %, se puede usar para estudiar el efecto de la convergencia parcial en la calidad de generación y en la repetitividad.
- Desarrollo de técnicas de reanudación de entrenamiento: el checkpoint puede servir como punto de partida para experimentos de continuación de entrenamiento, aunque el autor recomienda no usarlo para producción.
- Pruebas de compatibilidad de frameworks: dado que es un export Mixtral puro, es útil para validar la integración de MoE en vLLM, TGI u otros motores sin depender de código remoto.
- Benchmarking de eficiencia de inferencia: con solo 222,73 M de parámetros activos, se puede medir el throughput y la latencia de kernels MoE en GPUs consumer y comparar con modelos densos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no ha sido evaluado en tareas estándar como MMLU, HumanEval o GSM8K, y no hay datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 617,91 M de parámetros totales, en fp16 se requieren aproximadamente 1,24 GB solo para los pesos, más overhead de activaciones y KV cache. En la práctica, una GPU con 4 GB de VRAM debería ser suficiente para inferencia con contexto corto.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3060, RTX 4060, o superiores. También puede ejecutarse en CPU con llama.cpp si se convierte a GGUF.
- Cabe en GPUs consumer: sí, sin problema.
- Opciones de despliegue: vLLM (soporte nativo de Mixtral), `transformers` con `AutoModelForCausalLM`, y potencialmente llama.cpp u Ollama si se genera un GGUF.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo pequeño, se espera una velocidad de generación alta en GPUs modernas, superando las 50 tokens/segundo en una RTX 3090 o superior.

## Comparativa con modelos similares

No hay una comparativa directa publicada. Sin embargo, se puede situar frente a otros modelos MoE pequeños:

| Modelo | Parametros totales | Parametros activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| AAIE MoE Pretrain (este) | 617,91 M | 222,73 M | no disponible | Mixtral MoE 8x2 | MIT |
| Qwen2.5-3B (modelo denso usado para destilación) | 3 090 M | 3 090 M | 32 768 (según documentación oficial) | Dense Transformer | Apache 2.0 |
| Mixtral-8x7B (referencia arquitectónica) | 46 700 M | 12 900 M | 32 768 | Mixtral MoE 8x2 | Apache 2.0 |

La comparación más relevante sería con el modelo denso del mismo proyecto (AAIE-Distilled Dense, si existe), pero no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- **Checkpoint no convergido**: el entrenamiento se detuvo al 41,9 % del presupuesto, por lo que la generación es repetitiva y de calidad baja. No debe usarse en aplicaciones reales.
- **Sin ajuste por instrucciones**: no sigue prompts de forma fiable; solo genera texto libre.
- **Riesgo de alucinación**: al ser un modelo subentrenado, puede producir contenido factualmente incorrecto o incoherente con mayor frecuencia que modelos completos.
- **Solo inglés**: no hay soporte para otros idiomas.
- **Longitud de contexto no especificada**: se desconoce el límite de tokens de entrada; el modelo original podría heredar el de Qwen2.5, pero no está documentado.
- **Licencia MIT**: permite uso comercial, pero el autor advierte explícitamente que no está listo para producción.
- **Sin benchmarks**: no hay evidencia de rendimiento en tareas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namquangstudy/aaie-moe-pretrain-mixtral
- Modelo original (AAIE MoE Pretrain): https://huggingface.co/namquangstudy/aaie-moe-pretrain
- Repositorio GitHub del proyecto: https://github.com/namquang2910/aaie-model-lab-
- Página de actividad del autor: https://huggingface.co/namquangstudy/activity/all
