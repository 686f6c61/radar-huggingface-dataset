# CybroatriX/shanks-v1-adapter

## Resumen

CybroatriX/shanks-v1-adapter es un adaptador LoRA publicado en HuggingFace por el usuario CybroatriX. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (Parameter-Efficient Fine-Tuning) que debe cargarse sobre el modelo base thirdeyeai/Qwen2.5-Coder-7B-Instruct-Uncensored, una variante sin censura de Qwen2.5-Coder-7B-Instruct de Alibaba. El adaptador se ha entrenado mediante SFT (supervised fine-tuning) con las librerías TRL y Unsloth, según las etiquetas de la model card.

La relevancia de esta ficha es limitada: el repositorio no incluye model card sustantiva (todo son plantillas sin rellenar), no declara licencia, no especifica idiomas, no documenta el dataset de entrenamiento ni hiperparámetros, y no reporta evaluación alguna. A fecha de creación (1 de noviembre de 2026) acumula 0 descargas y 0 likes. Cualquier evaluación rigurosa debe hacerse contra el modelo base, cuyas características (arquitectura Qwen2, 7B parámetros, contexto de 32 768 tokens en la familia Qwen2.5) sí están documentadas por el desarrollador original.

Por tanto, esta ficha describe lo que se puede verificar del adaptador y del modelo base subyacente, y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2 (modelo base Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7B en el modelo base; tamaño del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base Qwen2.5 soporta hasta 32 768 tokens (no confirmado para la variante Uncensored) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizaciones estándar (GGUF, AWQ, GPTQ) por su arquitectura Qwen2 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.2, transformers, trl, unsloth |
| Modelo base | thirdeyeai/Qwen2.5-Coder-7B-Instruct-Uncensored |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-11-01 |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) entrenado con SFT sobre el checkpoint thirdeyeai/Qwen2.5-Coder-7B-Instruct-Uncensored. La arquitectura subyacente es la de Qwen2.5-Coder-7B-Instruct: un transformer decoder-only con atención por grupos (GQA), RoPE y ventana de contexto nativa de 32 768 tokens. El adaptador en sí no modifica la arquitectura, solo añade matrices de bajo rango en las capas que el autor haya configurado; el rango, alpha, dropout y módulos objetivo no están documentados.

No se ha publicado información sobre el dataset de entrenamiento (composición, número de tokens, filtrado), los hiperparámetros (learning rate, batch size, épocas, precisión) ni si hubo etapas de alineación adicionales (DPO, RLHF). La model card es la plantilla por defecto de HuggingFace sin rellenar. Las etiquetas indican uso de TRL y Unsloth, lo que sugiere un entrenamiento eficiente en memoria con posible cuantización 4-bit durante el SFT, pero es una inferencia, no un dato confirmado.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Generación y edición de código en múltiples lenguajes de programación (capacidad del base Qwen2.5-Coder).
- Razonamiento matemático y de sentido común a nivel de un modelo de 7B (capacidad del base).
- Soporte de tool calling / function calling: el modelo base Qwen2.5 lo soporta; no se confirma que el adaptador lo preserve.
- Capacidades multilingües: el base Qwen2.5 cubre decenas de idiomas; el adaptador no declara idiomas y podría haber degradado el multilingüismo.
- Modo "uncensored": el checkpoint base elimina parte de los filtros de rechazo del modelo original; el adaptador se apoya en esa base.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistencia a la programación en un IDE: cargando el adaptador sobre el base con PEFT, se puede usar como autocompletado o chat de código, siempre que el adaptador no haya degradado la calidad del base en tareas de código.
- Experimentación académica con LoRA: sirve como ejemplo de adaptador SFT entrenado con Unsloth y TRL para estudiar técnicas de fine-tuning eficiente.
- Reproducción de pipelines PEFT: útil para validar la carga de adaptadores con peft 0.21.2 y transformers en entornos controlados.
- Generación de texto sin restricciones de contenido: el base "Uncensored" permite generar contenido que el Qwen2.5-Coder original rechazaría; útil solo en entornos de investigación con salvaguardas propias.
- Base para fine-tuning adicional: el adaptador puede servir como punto de partida para un LoRA específico de dominio, aunque sin documentación de entrenamiento el riesgo de partida es alto.
- Evaluación comparativa de adaptadores comunitarios: útil para medir cuánto degrada o mejora un LoRA de bajo presupuesto frente al base en benchmarks de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en fp16: ~14-16 GB (7B parámetros × 2 bytes + overhead de KV cache).
- VRAM estimada en 8-bit: ~8-9 GB; en 4-bit (GGUF/AWQ): ~4-5 GB.
- El adaptador LoRA añade un overhead mínimo (decenas de MB) sobre el base.
- GPU recomendadas: A100 40GB o H100 para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8-bit; RTX 3060 12 GB o superiores para 4-bit.
- Cabe en GPU de consumo: sí, en 4-bit y 8-bit en GPUs con 8-12 GB o más.
- Opciones de despliegue: transformers + peft (carga del adaptador), vLLM (soporte de LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el base y convertir a GGUF).
- Latencia y throughput: no disponibles para el adaptador; dependen del hardware y de la cuantización del base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CybroatriX/shanks-v1-adapter | 7B (base) + LoRA | no disponible (base: 32k) | no disponible | HuggingFace, 0 descargas |
| Qwen2.5-Coder-7B-Instruct (Alibaba) | 7B | 32 768 | Apache 2.0 | HuggingFace, ampliamente usado |
| thirdeyeai/Qwen2.5-Coder-7B-Instruct-Uncensored | 7B | no confirmado | no disponible | HuggingFace |
| Adaptadores LoRA comunitarios sobre Qwen2.5-Coder | 7B (base) + LoRA | depende del base | variable | HuggingFace |

El adaptador no aporta métricas propias que permitan una comparación cuantitativa; la comparación se limita a parámetros, contexto y licencia del base.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre dataset, hiperparámetros, evaluación ni uso previsto; no es apta para producción sin validación propia.
- Licencia no declarada: no se puede asumir uso comercial; además, la licencia del base thirdeyeai no está confirmada y la del Qwen2.5-Coder original es Apache 2.0, pero la variante "Uncensored" puede tener condiciones distintas.
- Riesgo de alucinación y de contenido dañino: al apoyarse en un base "Uncensored", se eliminan parte de los filtros de rechazo; requiere salvaguardas externas.
- Idiomas no declarados: el multilingüismo del base puede haberse degradado con el SFT.
- Sin evaluación: no hay evidencia de que el adaptador mejore al base en ninguna tarea; podría degradarlo.
- Repositorio sin actividad: 0 descargas y 0 likes; sin mantenimiento ni soporte.
- Contexto: aunque el base soporta 32k, no se confirma que el adaptador preserve esa ventana.
- Sesgos: no documentados; heredados del base y del dataset de SFT no publicado.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/CybroatriX/shanks-v1-adapter
- Modelo base: https://huggingface.co/thirdeyeai/Qwen2.5-Coder-7B-Instruct-Uncensored
- Qwen2.5-Coder-7B-Instruct (original): https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Paper de eficiencia de LoRA (referenciado en la model card): https://arxiv.org/abs/1910.09700
