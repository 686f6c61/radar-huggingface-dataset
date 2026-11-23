# JavierViseras/agente-dgm-sft-1.7b

## Resumen

`JavierViseras/agente-dgm-sft-1.7b` es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base Qwen/Qwen3-1.7B. Lo publica el usuario JavierViseras en Hugging Face y su propósito declarado es el de un "agente" afinado mediante SFT con la librería TRL. El repositorio contiene únicamente los pesos del adaptador PEFT (0,1 GB), no los del modelo base, y emplea la librería `peft` como formato de carga.

El modelo hereda la arquitectura y el tamaño del Qwen3-1.7B original: un transformer denso de aproximadamente 1.700 millones de parámetros. El adaptador añade un conjunto reducido de pesos entrenados para especializar el comportamiento del modelo base en tareas de tipo agente, presumiblemente conversacionales y con posible uso de herramientas, aunque la model card no detalla la composición del dataset ni el objetivo concreto del entrenamiento.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación personal, sin descargas ni interacciones, sin licencia declarada y sin resultados de evaluación publicados. Es útil como ejemplo de flujo de trabajo SFT con TRL sobre un modelo pequeño, pero no debe considerarse un modelo listo para producción sin una evaluación independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B) con adaptador LoRA |
| Parametros totales | ~1.700 millones en el modelo base; el adaptador LoRA añade un subconjunto no especificado |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica "licence: license" sin concretar) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen/Qwen3-1.7B por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only denso. El entrenamiento se realizó con ajuste supervisado (SFT) mediante TRL 1.13.0 y PEFT 0.20.0, sobre Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.2. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la configuración de LoRA (rango, alpha, módulos objetivo) ni si hubo etapas posteriores de preferencia (DPO/RLHF).

No se documenta ninguna innovación técnica adicional más allá del propio ajuste LoRA. El nombre del repositorio ("agente-dgm-sft") sugiere un entrenamiento orientado a comportamiento de agente, pero no hay información pública sobre las trazas o datos utilizados para ello.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-1.7B.
- Ajuste específico orientado a comportamiento de agente (según el nombre del repositorio), sin detalles públicos sobre las tareas exactas.
- Soporte de tool calling / function calling: no confirmado en la información disponible; dependería de las capacidades del modelo base y de si el SFT las reforzó.
- Razonamiento multi-paso y planificación: no verificado.
- Capacidades multilingües: no documentadas.
- Modo thinking explícito: no documentado para este adaptador.

## Casos de uso

- Prototipado de agentes conversacionales: el adaptador puede cargarse junto al modelo base Qwen3-1.7B para experimentar con un comportamiento de agente afinado, en entornos de laboratorio y sin requisitos de producción.
- Investigación sobre SFT con TRL: sirve como referencia reproducible del flujo PEFT + TRL sobre un modelo de 1.7B, útil para comparar configuraciones de LoRA.
- Evaluación comparativa de adaptadores: al ser un artefacto pequeño (0,1 GB), permite iterar rápidamente sobre el modelo base sin reentrenar desde cero.
- Despliegue en hardware de gama baja para pruebas: con 1.7B de parámetros y cuantización del modelo base, es viable en GPU de consumo para experimentación.
- Generación de texto asistida en dominios acotados: si el SFT se orientó a un dominio concreto, podría usarse como base para tareas de redacción o diálogo en ese ámbito, previa validación.
- Fine-tuning incremental: el adaptador puede servir como punto de partida para nuevos ajustes LoRA sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa ~0,1 GB; el modelo base Qwen3-1.7B requiere aproximadamente 3,5 GB en fp16 y ~1,5-2 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para cuantización 4-bit, GPUs con 2-3 GB son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: transformers + peft (carga del adaptador), vLLM (requiere fusión previa del adaptador), llama.cpp/Ollama (tras convertir el modelo fusionado a GGUF), TGI (con soporte de adaptadores).
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agente-dgm-sft-1.7b (este) | ~1.7B (base) + LoRA | No disponible | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B | ~1.7B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face, modelo base oficial |
| Adaptadores LoRA SFT genéricos sobre Qwen3-1.7B | ~1.7B (base) + LoRA | Depende del base | Variable | Hugging Face, múltiples autores |

No se dispone de datos de rendimiento comparativos para este adaptador frente a alternativas.

## Limitaciones y advertencias

- Sin licencia declarada de forma explícita: la model card indica "licence: license" sin concretar; el uso comercial no está garantizado y debe consultarse con el autor.
- Sin resultados de evaluación publicados: no hay evidencia de que el SFT mejore al modelo base en ninguna tarea concreta.
- Sin información sobre el dataset de entrenamiento: riesgo de sesgos desconocidos y de sobreajuste a un dominio no documentado.
- Riesgo de alucinación heredado del modelo base, potencialmente amplificado si el SFT reforzó respuestas asertivas sin verificación.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe fiable.
- Longitud de contexto no especificada para el adaptador; depende del modelo base y de la configuración de entrenamiento.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso en la comunidad ni validación externa.
- Para producción, se recomienda fusionar el adaptador con el modelo base y evaluar exhaustivamente antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/JavierViseras/agente-dgm-sft-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- PEFT (librería de adaptadores): https://github.com/huggingface/peft
