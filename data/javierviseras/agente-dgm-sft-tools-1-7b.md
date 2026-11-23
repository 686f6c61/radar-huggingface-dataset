# JavierViseras/agente-dgm-sft-tools-1.7b

## Resumen

`JavierViseras/agente-dgm-sft-tools-1.7b` es un adaptador LoRA entrenado mediante supervisión fina (SFT) sobre el modelo base Qwen/Qwen3-1.7B. Lo desarrolla el usuario de Hugging Face JavierViseras y está publicado como repositorio PEFT, lo que significa que no contiene los pesos completos del modelo, sino únicamente los pesos del adaptador que deben combinarse con el modelo base para su uso. El tamaño del repositorio (0,1 GB) es coherente con un adaptador LoRA de rango bajo sobre un modelo de 1.700 millones de parámetros.

El nombre del modelo (`sft_tools_lora`) y las etiquetas asociadas (`sft`, `lora`, `tool calling` implícito en el nombre) sugieren que el ajuste se orientó a la capacitación del modelo para el uso de herramientas y function calling, partiendo de las capacidades del Qwen3-1.7B original. Se trata de un modelo de generación de texto conversacional, con pipeline `text-generation`, entrenado con las librerías TRL y PEFT.

La relevancia de esta ficha es limitada: se trata de un modelo experimental de autor individual, sin descargas ni likes en el momento de la consulta, sin licencia declarada y sin información pública sobre el dataset de entrenamiento, los hiperparámetros o los resultados de evaluación. Debe considerarse un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parámetros totales | No disponible (el adaptador LoRA; el modelo base tiene 1.700 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-1.7B; no confirmada en la model card) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Qwen3) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango sobre el modelo base Qwen/Qwen3-1.7B, que es un transformer decoder-only de la familia Qwen3. El adaptador se ha entrenado con SFT (supervised fine-tuning) usando TRL 1.13.0 y PEFT 0.20.0, con Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.2. La model card no especifica el rango del adaptador, los módulos objetivo, la tasa de aprendizaje, el número de épocas, el tamaño del dataset ni su composición.

No se documenta el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT, ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). El nombre del repositorio sugiere que el dataset de entrenamiento estuvo orientado al uso de herramientas, pero este extremo no se confirma en la información disponible.

## Capacidades

- Generación de texto conversacional en formato de chat (la model card incluye un ejemplo con `pipeline` y mensajes con rol `user`).
- Ajuste específico orientado a tool calling / function calling, según el nombre del modelo (`sft_tools_lora`); no confirmado con documentación ni ejemplos.
- Razonamiento y capacidades generales heredadas del modelo base Qwen3-1.7B (no verificadas tras el ajuste).
- Capacidades multilingües: no disponibles (no declaradas).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de agentes con tool calling: el adaptador puede cargarse sobre Qwen3-1.7B para experimentar con llamadas a funciones en entornos de desarrollo, dado que el ajuste se orientó presumiblemente a ese dominio.
- Investigación en fine-tuning con LoRA: sirve como ejemplo reproducible de un pipeline SFT con TRL y PEFT sobre un modelo pequeño, útil para estudiar la metodología.
- Evaluación comparativa de adaptadores: al ser un adaptador pequeño (0,1 GB), permite comparar el efecto del SFT frente al modelo base en tareas de herramientas con un coste de almacenamiento mínimo.
- Despliegue en entornos con recursos limitados: al combinarse con Qwen3-1.7B, puede ejecutarse en GPUs de consumo tras cuantización del modelo base, aunque el rendimiento real no está documentado.
- Generación de texto conversacional en prototipos internos: útil para pruebas de concepto de asistentes conversacionales donde no se requiere garantía de calidad de producción.
- Docencia y formación: como caso práctico de adaptación de un modelo open source con licencia del modelo base (Qwen3) y herramientas estándar del ecosistema Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el modelo base Qwen3-1.7B en precisión completa (BF16) requiere aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; el adaptador LoRA añade un coste marginal.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, una GPU con 8 GB o más (por ejemplo, RTX 3060/4060/4070) podría alojar el modelo en BF16 o cuantizado; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: probablemente sí, con el modelo base cuantizado (por ejemplo, en 4 bits), aunque no hay confirmación del autor.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT/Transformers; para servir el modelo combinado podrían usarse vLLM, TGI o llama.cpp tras fusionar el adaptador con el modelo base, pero no hay documentación que lo confirme.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| JavierViseras/agente-dgm-sft-tools-1.7b | Adaptador LoRA sobre 1,7 B | No disponible | No disponible | Hugging Face (0 descargas) | Experimental, sin benchmarks |
| Qwen/Qwen3-1.7B | 1,7 B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face | Modelo base oficial |
| Adaptadores LoRA comunitarios sobre Qwen3 | Variable | Variable | Variable | Hugging Face | Calidad y soporte muy variables |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría; la comparación se limita a aspectos estructurales.

## Limitaciones y advertencias

- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribución; debe consultarse al autor y la licencia del modelo base Qwen3.
- Sin información sobre el dataset de entrenamiento: riesgo de sesgos desconocidos y de sobreajuste a un dominio concreto de herramientas.
- Riesgo de alucinación inherente a modelos de 1,7 B y a un ajuste SFT sin alineación posterior documentada.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- Longitud de contexto no confirmada para el adaptador; debe verificarse con el modelo base.
- Modelo experimental sin descargas ni validación comunitaria: no recomendado para producción sin evaluación propia.
- El adaptador requiere cargar el modelo base Qwen3-1.7B; no es un modelo autónomo.
- La model card contiene un ejemplo de `pipeline` con `model="None"`, lo que indica falta de revisión del artefacto publicado.

## Enlaces

- Hugging Face: https://huggingface.co/JavierViseras/agente-dgm-sft-tools-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- TRL: https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
