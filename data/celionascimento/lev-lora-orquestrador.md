# celioNascimento/Lev-LoRA-Orquestrador

## Resumen

Lev-LoRA-Orquestrador es un ajuste fino mediante LoRA del modelo Qwen2.5-7B-Instruct, publicado por el usuario celioNascimento en HuggingFace bajo licencia Apache 2.0. El repositorio, de 0,3 GB, contiene únicamente los pesos del adaptador en formato safetensors; el modelo base empleado para el entrenamiento es la versión cuantizada a 4 bits de Unsloth (unsloth/Qwen2.5-7B-Instruct-bnb-4bit), y el entrenamiento se realizó con la librería Unsloth, que según la model card permite un entrenamiento "2x más rápido".

El modelo se presenta como una finetune orientada a tareas de orquestación, a juzgar por el nombre del repositorio, aunque la model card no documenta el conjunto de datos, el objetivo de entrenamiento ni ninguna evaluación. Se trata, por tanto, de una publicación experimental: registra 0 descargas y 0 likes en el momento de la consulta y su documentación se limita a la plantilla autogenerada por Unsloth.

Su relevancia es limitada para producción, pero resulta útil como ejemplo de flujo de trabajo LoRA + Unsloth sobre Qwen2.5 y como punto de partida para quien quiera reproducir o continuar el ajuste. No debe evaluarse como un modelo autónomo: requiere cargar el modelo base para funcionar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada del modelo base); detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 7B en el modelo base (Qwen2.5-7B-Instruct); el adaptador LoRA añade un subconjunto de parámetros cuyo tamaño no se detalla |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Modelo base en bitsandbytes 4-bit (bnb-4bit); precisión del adaptador distribuido no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal agrupada por consultas (GQA) y normalización RMSNorm, según la familia Qwen2.5. Sobre ella se aplicó un ajuste fino con LoRA (Low-Rank Adaptation), técnica que congela los pesos originales y entrena matrices de baja jerarquía insertadas en las capas de atención y MLP. El repositorio de 0,3 GB es coherente con un adaptador: los pesos completos en 4 bits del modelo base ocuparían del orden de 4 GB.

El entrenamiento se realizó con Unsloth y con TRL, según las etiquetas del repositorio, lo que apunta a un ajuste supervisado (SFT) o a un entrenamiento con preferencias (DPO/ORPO) mediante las utilidades de TRL. No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO, el rango del LoRA ni los hiperparámetros empleados. Tampoco se documenta ninguna innovación técnica propia más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto conversacional: hereda la capacidad de instrucción del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas: se espera un rendimiento similar al del modelo base, sin evaluación específica publicada para este ajuste.
- Generación de código: capacidad heredada del modelo base; no verificada tras el ajuste fino.
- Tool calling / function calling: el modelo base Qwen2.5-7B-Instruct incluye soporte de llamada a funciones y salidas estructuradas; no se confirma que el ajuste LoRA lo preserve.
- Soporte de agentes y razonamiento multi-paso: presumible por el nombre "Orquestrador", pero no documentado ni evaluado en la model card.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card, aunque el modelo base es multilingüe; el ajuste podría haber degradado otros idiomas.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles.

## Casos de uso

- Experimentación con LoRA y Unsloth: sirve como referencia práctica para reproducir un pipeline de ajuste fino sobre Qwen2.5-7B con Unsloth y TRL, comparando hiperparámetros y estrategias de cuantización.
- Orquestación de agentes en inglés: si el ajuste cumple lo que sugiere el nombre, podría emplearse como planificador de llamadas a herramientas en un sistema multi-agente, cargando el adaptador sobre el modelo base en 4 bits.
- Base para ajustes posteriores: al ser un adaptador ligero (0,3 GB), es adecuado como punto de partida para un segundo ajuste específico de dominio sin reentrenar el modelo completo.
- Evaluación comparativa de adaptadores: útil en pipelines de evaluación interna que midan la degradación o mejora que introduce un LoRA sobre el modelo base en tareas concretas.
- Prototipado rápido en local: con el modelo base en 4 bits y el adaptador, puede ejecutarse en una GPU de consumo para pruebas de concepto de generación de texto en inglés.
- Investigación sobre fine-tuning con licencia permisiva: su licencia Apache 2.0 y la del modelo base permiten estudiar el comportamiento de adaptadores en entornos académicos sin restricciones de uso comercial.
- Docencia y divulgación: ejemplo didáctico de publicación de un adaptador LoRA con la plantilla de Unsloth, útil para explicar el formato y la estructura de un repositorio de este tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador debe cargarse junto con el modelo base. Con el base en 4 bits (bnb-4bit) se estiman del orden de 4-6 GB de VRAM para pesos, más la caché KV, que crece con la longitud de contexto. Estimación derivada del tamaño del modelo base, no verificada experimentalmente.
- GPU recomendadas: NVIDIA A100 40/80 GB o H100 para despliegues en FP16/BF16 con contexto largo; RTX 4090 (24 GB) para 4 bits con contexto amplio; RTX 3090 (24 GB) como alternativa.
- GPU de consumo: cabe en tarjetas de 8-12 GB con el base en 4 bits y contextos moderados (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Por debajo de 8 GB es necesario reducir contexto o cuantizar más agresivamente.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM con soporte de adaptadores LoRA; TGI (la etiqueta `text-generation-inference` está presente); llama.cpp y Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lev-LoRA-Orquestrador | 7B (base) + adaptador LoRA | No disponible | Apache 2.0 | Adaptador en HuggingFace; requiere modelo base |
| Qwen2.5-7B-Instruct | 7B | 32K nativo, ampliable (1) | Apache 2.0 (salvo excepciones por tamaño) | Pesos completos en HuggingFace |
| Llama 3.1 8B Instruct | 8B | 128K (1) | Llama 3.1 Community License | Pesos completos en HuggingFace |
| Mistral 7B Instruct v0.3 | 7B | 32K (1) | Apache 2.0 | Pesos completos en HuggingFace |

(1) Valores de contexto tomados de la documentación pública de cada modelo; no verificados en la información proporcionada para esta ficha. El rendimiento comparado no puede establecerse porque Lev-LoRA-Orquestrador no publica benchmarks.

## Limitaciones y advertencias

- Documentación mínima: la model card es la plantilla autogenerada de Unsloth; no hay información sobre dataset, hiperparámetros ni evaluación, lo que impide valorar su calidad real.
- Sin evidencias de uso: 0 descargas y 0 likes; no hay reportes de terceros sobre su comportamiento.
- Dependencia del modelo base: no es un modelo autónomo; requiere descargar y cargar unsloth/Qwen2.5-7B-Instruct-bnb-4bit o una versión compatible.
- Idioma: el campo `language` declara únicamente inglés; el uso en castellano no está garantizado y podría degradar respecto al modelo base.
- Riesgo de alucinación: inherente a los modelos de 7B; sin evaluación específica no puede acotarse.
- Sesgos: no documentados; hereda los sesgos del corpus de entrenamiento del modelo base y del dataset de ajuste, que se desconoce.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base y el dataset de ajuste no impongan restricciones adicionales.
- Producción: no recomendable sin una evaluación previa propia (tareas, idioma, robustez ante prompts adversarios) y sin fijar la versión del adaptador y del modelo base.
- Fecha del repositorio: los metadatos indican creación el 20 de octubre de 2026, dato que conviene contrastar antes de citarlo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/celioNascimento/Lev-LoRA-Orquestrador
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
